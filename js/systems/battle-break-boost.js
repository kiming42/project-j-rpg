/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — Break & Boost 回合制戰鬥、戰寵協同、收服與檢定系統 (battle-break-boost.js)
 * 包含：1.護盾削減與Break破防暈眩 2.BP增幅爆發 3.戰寵每回合協同連擊與補血
 *       4.殘血收服戰寵(含異色閃光Shiny) 5.8秒完美採集爆擊挑戰 6.NPC旅人指令檢定
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const BattleEngine = {
    active: false,
    mode: "combat", // "combat" | "harvest" | "path_inquire" | "bounty" | "tame_trial"
    mapMonsterRef: null,
    harvestNodeRef: null,
    pathActionRef: null,
    enemy: null,
    boostActive: false,
    timerInterval: null,
    timeLeft: 0,

    // 1. 啟動一般魔物 / Boss / 切磋 / 錯題懸賞戰鬥
    startBattle(mapMonsterNode = null, customMode = "combat", customQuestionId = null) {
      this.active = true;
      this.mode = customMode;
      this.mapMonsterRef = mapMonsterNode;
      this.boostActive = false;

      const s = window.Aetheria.State.data;
      this.enemy = window.Aetheria.Data.createBattleEnemy(mapMonsterNode);

      // 星界魔導職業開局自帶 3 BP
      if (s.currentJob === "archmage" && s.bp < 3) {
        s.bp = 3;
      }

      // 開局被動破盾判定 (爆破袋 Lv.2/Lv.3 或 冰晶幼龍戰寵)
      let openBreak = 0;
      if (s.tools.bomb >= 3) openBreak += 2;
      else if (s.tools.bomb === 2) openBreak += 1;
      if (s.activePet === "pet_icedragon") openBreak += 1;

      if (openBreak > 0 && !this.enemy.broken) {
        this.enemy.shield = Math.max(0, this.enemy.shield - openBreak);
        if (this.enemy.shield === 0) this.enemy.broken = true;
      }

      document.getElementById("battle-stage").style.display = "flex";
      window.Aetheria.UI.setActivePanel("panel-battle");
      window.Aetheria.Audio.playBgm("battle");

      const phaseTitle = document.getElementById("battle-phase-title");
      if (phaseTitle) {
        phaseTitle.innerText = (customMode === "bounty") ? "🟣 討伐暗影錯題幻象" : "⚡ 詠唱符文破盾";
      }

      this.updateBattleHUD();
      this.nextTurnQuestion(customQuestionId);
    },

    // 2. 啟動「✨閃光礦脈 8 秒完美採集 x3 大爆擊」快速挑戰
    startHarvestChallenge(node) {
      this.active = true;
      this.mode = "harvest";
      this.harvestNodeRef = node;
      this.boostActive = false;

      this.enemy = {
        name: `✨ ${node.name}`,
        lv: 5,
        isBoss: false,
        isShiny: true,
        spriteKey: "mat_crystal",
        hp: 30,
        maxHp: 30,
        shield: 1,
        maxShield: 1,
        broken: false,
        weak: "⛏️ 限時答對即獲 3 倍爆擊產量！"
      };

      document.getElementById("battle-stage").style.display = "flex";
      window.Aetheria.UI.setActivePanel("panel-battle");

      const phaseTitle = document.getElementById("battle-phase-title");
      if (phaseTitle) phaseTitle.innerText = "⛏️ 完美共鳴採集 (限時 10 秒)";

      this.updateBattleHUD();
      this.nextTurnQuestion(null, 10);
    },

    // 3. 啟動 NPC 旅人指令【探查 / 討教 / 議價】單題檢定
    startPathActionChallenge(actionObj, npcObj) {
      this.active = true;
      this.mode = "path_inquire";
      this.pathActionRef = { action: actionObj, npc: npcObj };
      this.boostActive = false;

      this.enemy = {
        name: `${npcObj.name}（旅人檢定）`,
        lv: 3,
        isBoss: false,
        isShiny: false,
        spriteKey: npcObj.sprite,
        hp: 40,
        maxHp: 40,
        shield: 1,
        maxShield: 1,
        broken: false,
        weak: "🔍 答對即可發動旅人指令！"
      };

      document.getElementById("battle-stage").style.display = "flex";
      window.Aetheria.UI.setActivePanel("panel-battle");

      const phaseTitle = document.getElementById("battle-phase-title");
      if (phaseTitle) phaseTitle.innerText = `${actionObj.label}`;

      this.updateBattleHUD();
      this.nextTurnQuestion();
    },

    // 更新戰鬥畫面 HUD 與【🍎 收服】按鈕顯示狀態
    updateBattleHUD() {
      const s = window.Aetheria.State.data;
      const e = this.enemy;
      if (!e) return;

      document.getElementById("enemy-name").innerText = e.name;
      const shinyTag = document.getElementById("enemy-shiny-tag");
      if (shinyTag) shinyTag.style.display = e.isShiny ? "inline" : "none";

      document.getElementById("enemy-shield").innerText = e.broken ? "💥 BREAK (破防暈眩)" : `🛡️ ${e.shield}`;
      document.getElementById("enemy-weak").innerText = e.weak;
      document.getElementById("enemy-hp-bar").style.width = Math.max(0, (e.hp / e.maxHp) * 100) + "%";

      const streakEl = document.getElementById("battle-streak-tag");
      if (streakEl) streakEl.innerText = `🔥 連勝 x${s.streak || 0}`;

      // BP 增幅珠
      const orbs = document.getElementById("hero-bp-orbs");
      if (orbs) {
        orbs.innerHTML = "";
        for (let i = 0; i < s.maxBp; i++) {
          const d = document.createElement("div");
          d.className = "bp-orb" + (i < s.bp ? " filled" : "");
          orbs.appendChild(d);
        }
      }

      const boostBtn = document.getElementById("btn-boost");
      if (boostBtn) {
        boostBtn.innerText = this.boostActive ? "🔥 BOOST 發動中" : `🔥 Boost (${s.bp})`;
        boostBtn.className = "na-btn" + (this.boostActive ? " highlight" : "");
      }

      // 當處於一般戰鬥且魔物被 Break 或殘血 (<45% HP) 時，顯示【🍎 收服】按鈕
      const tameBtn = document.getElementById("btn-tame");
      if (tameBtn) {
        const canTame = (this.mode === "combat") && (e.broken || (e.hp / e.maxHp) <= 0.45);
        tameBtn.style.display = canTame ? "inline-block" : "none";
      }
    },

    toggleBoost() {
      const s = window.Aetheria.State.data;
      if (s.bp <= 0) {
        window.Aetheria.UI.showToast("⚠️ BP 增幅珠不足！每回合答對題目即可充能 BP。");
        return;
      }
      this.boostActive = !this.boostActive;
      window.Aetheria.Audio.sfxTalkBlip();
      this.updateBattleHUD();
    },

    // 點擊【🍎 收服】：消耗 1 顆靈獸誘餌果，答對當前題目即可直接收服魔物為戰寵！
    attemptTame() {
      const s = window.Aetheria.State.data;
      if ((s.inventory.tameFruit || 0) <= 0) {
        window.Aetheria.UI.showToast("⚠️ 靈獸誘餌果不足！可在公會委託或鐵匠煉金台調配。");
        return;
      }
      s.inventory.tameFruit--;
      this.mode = "tame_trial";
      const phaseTitle = document.getElementById("battle-phase-title");
      if (phaseTitle) phaseTitle.innerText = `🍎 投出誘餌果！答對本題即可收服！(剩餘 ${s.inventory.tameFruit} 顆)`;
      window.Aetheria.UI.showToast("🍎 已投出靈獸誘餌果！請答對下方題目完成契約共鳴！");
    },

    // 點擊【🧪 補血】：使用生命藥水
    useHealPotion() {
      const s = window.Aetheria.State.data;
      if ((s.inventory.potionHeal || 0) <= 0) {
        window.Aetheria.UI.showToast("⚠️ 生命藥水不足！可在鐵匠煉金爐用紅傘菇熬製。");
        return;
      }
      if (s.hp >= s.maxHp) {
        window.Aetheria.UI.showToast("❤️ 生命值已經是滿的！");
        return;
      }
      s.inventory.potionHeal--;
      s.hp = Math.min(s.maxHp, s.hp + 60);
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      window.Aetheria.UI.spawnFloatingText("+60 HP", "#5ac54f", false);
      window.Aetheria.UI.showToast(`🧪 飲用生命藥水，回復 60 點生命！(剩餘 ${s.inventory.potionHeal} 瓶)`);
    },

    // 載入下一道題目並啟動倒數計時器（若為高危險度越級戰或完美採集）
    nextTurnQuestion(forceId = null, customSeconds = null) {
      clearInterval(this.timerInterval);
      const s = window.Aetheria.State.data;
      const e = this.enemy;

      // 判定是否處於跨級高壓模式 (魔物比主角高 6 級以上)
      const isHighPressure = e && ((e.lv - s.lv) >= 6);
      const limitSec = customSeconds || (isHighPressure ? 14 : 0);

      const timerBadge = document.getElementById("timer-badge");
      if (limitSec > 0 && timerBadge) {
        this.timeLeft = limitSec;
        timerBadge.style.display = "inline-block";
        timerBadge.innerText = `⏱️ ${this.timeLeft}s`;
        this.timerInterval = setInterval(() => {
          this.timeLeft--;
          timerBadge.innerText = `⏱️ ${this.timeLeft}s`;
          if (this.timeLeft <= 0) {
            clearInterval(this.timerInterval);
            this.resolveTurn(false, "詠唱逾時", { id: "timeout" });
          }
        }, 1000);
      } else if (timerBadge) {
        timerBadge.style.display = "none";
      }

      const q = window.Aetheria.QuizBridge.pickQuestion({
        forceId: forceId,
        preferAdvanced: this.boostActive || (e && e.isBoss)
      });

      window.Aetheria.QuizUI.renderQuestion(q, (isCorrect, correctText, qObj) => {
        this.resolveTurn(isCorrect, correctText, qObj);
      });
    },

    // 結算答題結果
    resolveTurn(isCorrect, correctText, qObj) {
      clearInterval(this.timerInterval);
      const s = window.Aetheria.State.data;
      const e = this.enemy;

      if (qObj && qObj.id && qObj.id !== "timeout") {
        window.Aetheria.QuizBridge.recordAnswer(qObj.id, isCorrect);
      }

      // 處理特殊模式 A：完美採集挑戰
      if (this.mode === "harvest") {
        if (isCorrect) {
          window.Aetheria.Audio.sfxLevelUp();
          s.inventory.iron += 4;
          s.inventory.mithril += 3;
          s.inventory.starIron += 1;
          window.Aetheria.State.gainRewards(35, 40, 10);
          window.Aetheria.UI.showToast("✨ 完美採集 x3 大爆擊！獲得【流沙秘銀 +3】、【藍晶礦 +4】、【星隕鐵 +1】！");
        } else {
          window.Aetheria.Audio.sfxWrong();
          s.inventory.iron += 1;
          window.Aetheria.UI.showToast(`⛏️ 採集失誤（正解：${correctText}），僅獲得基礎【藍晶礦 +1】。`);
        }
        this.endBattle();
        return;
      }

      // 處理特殊模式 B：NPC 旅人指令檢定
      if (this.mode === "path_inquire") {
        const ref = this.pathActionRef;
        if (isCorrect && ref && ref.action) {
          window.Aetheria.Audio.sfxLevelUp();
          ref.action.onSuccess(s);
          window.Aetheria.State.save();
          window.Aetheria.UI.showToast(`🎉 旅人指令成功！${ref.action.rewardSummary}`);
        } else {
          window.Aetheria.Audio.sfxWrong();
          window.Aetheria.UI.showToast(`📖 檢定未通過！正確答案為：【${correctText}】`);
        }
        this.endBattle();
        return;
      }

      // 處理特殊模式 C：投擲靈果收服戰寵判定
      if (this.mode === "tame_trial") {
        if (isCorrect) {
          const petId = e.tamePetId || "pet_fox";
          if (!s.unlockedPets.includes(petId)) s.unlockedPets.push(petId);
          if (e.isShiny && !s.shinyPets.includes(petId)) s.shinyPets.push(petId);
          s.activePet = petId;

          if (this.mapMonsterRef) this.mapMonsterRef.alive = false;
          window.Aetheria.Audio.sfxLevelUp();
          const petInfo = window.Aetheria.Data.PETS[petId];
          const shinyPrefix = e.isShiny ? "✨【異色閃光】" : "";
          window.Aetheria.State.gainRewards(e.expReward, e.goldReward, 20);
          window.Aetheria.UI.showToast(`🎊 收服成功！${shinyPrefix}${petInfo ? petInfo.name : "新戰寵"} 已加入同行隊伍！`);
          this.endBattle();
          return;
        } else {
          this.mode = "combat";
          const phaseTitle = document.getElementById("battle-phase-title");
          if (phaseTitle) phaseTitle.innerText = "⚡ 詠唱符文破盾";
        }
      }

      // ================= 一般戰鬥：答對破盾、Boost 爆發與戰寵協同攻擊 =================
      if (isCorrect) {
        let shieldDmg = 1 + window.Aetheria.State.getBonusShieldBreak();
        let dmgMult = 1.0;

        const wData = window.Aetheria.Data.WEAPONS[s.equippedWeapon] || {};
        const jData = window.Aetheria.Data.JOBS[s.currentJob] || {};

        // 符文學者被動：看圖題與配對題額外削盾 +1
        if (s.currentJob === "scholar" && (qObj.type === "matching" || qObj.type === "image_spell" || qObj.type === "image_mcq")) {
          shieldDmg += 1;
        }

        // 赤炎太刀被動：拼字題傷害加成
        if (wData.spellBonus && (qObj.type === "tile_spell" || qObj.type === "image_spell")) {
          dmgMult *= wData.spellBonus;
        }

        // 英文全盲串字：真名解放 100% 暴擊 + 額外削盾
        if (qObj.type === "blind_spell") {
          dmgMult *= (s.currentJob === "archmage") ? 3.0 : 2.0;
          shieldDmg += 1;
        }

        // Boost 增幅消耗與爆發倍率
        if (this.boostActive && s.bp > 0) {
          dmgMult *= (1.5 + s.bp * 0.45);
          shieldDmg += 1;
          s.bp = 0;
          this.boostActive = false;
        } else {
          const bpGain = 1 + (wData.bpGainBonus || 0);
          s.bp = Math.min(s.maxBp, s.bp + bpGain);
        }

        // 削減護盾與觸發 BREAK 破防暈眩
        let justBroken = false;
        if (!e.broken) {
          e.shield = Math.max(0, e.shield - shieldDmg);
          if (e.shield === 0) {
            e.broken = true;
            justBroken = true;
            window.Aetheria.Audio.sfxBreakShield();
            window.Aetheria.UI.spawnFloatingText("💥 BREAK! 破防暈眩!", "#38b6ff", true);
          }
        }

        if (!justBroken) window.Aetheria.Audio.sfxAttackHit();

        // Break 狀態下承受 200% 傷害，且無視跨級減傷壓制
        if (e.broken) dmgMult *= 2.0;
        else if ((e.lv - s.lv) >= 6) dmgMult *= 0.4;

        const heroDmg = Math.round(window.Aetheria.State.getTotalAtk() * dmgMult);

        // 戰寵每回合協同攻擊與治癒
        const petInfo = window.Aetheria.Data.PETS[s.activePet] || window.Aetheria.Data.PETS.pet_slime;
        const hunterMult = (s.currentJob === "hunter") ? 2.0 : 1.0;
        const petDmg = Math.round(window.Aetheria.State.getTotalAtk() * (petInfo.bonusDmgRatio || 0.2) * hunterMult);
        const totalDmg = heroDmg + petDmg;

        e.hp = Math.max(0, e.hp - totalDmg);

        if (petInfo.healPerTurn > 0 || s.currentJob === "alchemist" || s.equippedWeapon === "w_dawn") {
          const healAmt = (petInfo.healPerTurn || 0) + (s.currentJob === "alchemist" ? 12 : 0);
          s.hp = Math.min(s.maxHp, s.hp + healAmt);
        }

        // 暗影盜賊被動：35% 機率直接偷取礦石
        if (s.currentJob === "thief" && Math.random() < 0.35) {
          s.inventory.iron += 1;
          window.Aetheria.UI.spawnFloatingText("⚡盜取藍晶礦+1", "#5ac54f", false);
        }

        // 觸發牧場戰寵遠征計數
        const passiveMsg = window.Aetheria.State.tickPassiveProduction();
        if (passiveMsg) window.Aetheria.UI.showToast(passiveMsg);

        const upper = document.getElementById("upper-screen");
        if (upper) {
          upper.classList.add("shake");
          setTimeout(() => upper.classList.remove("shake"), 280);
        }

        window.Aetheria.UI.spawnFloatingText(`-${totalDmg}`, dmgMult >= 2.0 ? "#fbd000" : "#ffffff", true);
        this.updateBattleHUD();

        if (e.hp <= 0) {
          setTimeout(() => this.winBattle(), 460);
        } else {
          setTimeout(() => this.nextTurnQuestion(), 520);
        }
      } else {
        // 答錯溫和防挫敗機制：顯示正確答案 1.3 秒 + 收入錯題魔導書
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.spawnFloatingText(`擦傷! 正解: ${correctText}`, "#ff595e", false);
        window.Aetheria.UI.showToast(`📖 古文明殘響提示：正確答案為【${correctText}】`);

        const enemyCounterDmg = (e.lv >= 15) ? 25 : 12;
        s.hp = Math.max(15, s.hp - enemyCounterDmg);
        window.Aetheria.State.save();
        this.updateBattleHUD();

        setTimeout(() => this.nextTurnQuestion(), 1350);
      }
    },

    // 戰鬥勝利與 Break 破防專屬掉寶結算
    winBattle() {
      const s = window.Aetheria.State.data;
      const e = this.enemy;

      window.Aetheria.Audio.sfxLevelUp();

      // 發放基礎掉落與 Break 破防擊殺專屬魔物核心
      const normKey = e.normalDrop || "iron";
      s.inventory[normKey] = (s.inventory[normKey] || 0) + 2;

      let dropSummary = `${window.Aetheria.Data.MATERIALS[normKey].name} +2`;
      if (e.broken && e.breakDrop) {
        s.inventory[e.breakDrop] = (s.inventory[e.breakDrop] || 0) + 1;
        dropSummary += `、💥破防獎勵【${window.Aetheria.Data.MATERIALS[e.breakDrop].name} +1】`;
      }

      if (e.isBoss) {
        s.questProgress.mq_03_boss = true;
      }

      // 若為 NPC 切磋勝利
      if (this.pathActionRef && this.pathActionRef.action) {
        this.pathActionRef.action.onSuccess(s);
        dropSummary += `、${this.pathActionRef.action.rewardSummary}`;
        this.pathActionRef = null;
      }

      const leveledUp = window.Aetheria.State.gainRewards(e.expReward, e.goldReward, e.isBoss ? 30 : 10);

      if (this.mapMonsterRef) {
        this.mapMonsterRef.alive = false;
      }

      if (leveledUp) {
        window.Aetheria.UI.showToast(`🎉 升級至 Lv.${s.lv}！獲得 ${dropSummary}！`);
      } else {
        window.Aetheria.UI.showToast(`⚔️ 戰鬥勝利！獲得 ${dropSummary}！`);
      }

      this.endBattle();
    },

    fleeBattle() {
      const s = window.Aetheria.State.data;
      s.heroY += 20;
      window.Aetheria.UI.showToast("💨 投擲煙霧玉安全撤退！");
      this.endBattle();
    },

    endBattle() {
      clearInterval(this.timerInterval);
      this.active = false;
      document.getElementById("battle-stage").style.display = "none";

      const s = window.Aetheria.State.data;
      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
      window.Aetheria.Audio.playBgm(mapObj.bgm || "forest");

      window.Aetheria.UI.closePanelToExplore();
      window.Aetheria.UI.updateAllHud();
    }
  };

  window.Aetheria.Battle = BattleEngine;
})();