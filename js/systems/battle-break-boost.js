/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 硬核意圖攻防、舉盾博弈、符文特效與戰敗懲罰引擎 (battle-break-boost.js - v4.0)
 * 升級：1.取消無敵與鎖血：敵人未破防時自帶 75% 護盾減傷，且每回合結束必定依「意圖」反擊主角！
 *       2.新增【舉盾】戰術：本回輸出減半，但減免敵方 75% 傷害並 +1 BP（配海妖水核可 100% 反彈傷害）
 *       3.破防暈眩 2 回合後敵人會甦醒並重組護盾；主角 HP 歸 0 觸發真實戰敗懲罰（扣 20% 金幣送回營地）
 *       4.完整結算 6 大鑲嵌符文、4 道營地料理 Buff 與四大古文明聖碑永久神恩
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  function stripEmoji(str) {
    if (!str) return "";
    return String(str)
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "")
      .trim();
  }

  function getHunterSubPet(state) {
    if (state.currentJob !== "hunter" || !state.unlockedPets || state.unlockedPets.length < 2) {
      return null;
    }
    const subId = state.unlockedPets.find(function(id) { return id !== state.activePet; }) || state.unlockedPets[0];
    return (window.Aetheria.Data && window.Aetheria.Data.PETS[subId]) || null;
  }

  const BattleEngine = {
    active: false,
    mode: "combat",
    mapMonsterRef: null,
    harvestNodeRef: null,
    pathActionRef: null,
    enemy: null,
    boostActive: false,
    guardActive: false,
    revivedThisBattle: false,
    timerInterval: null,
    timeLeft: 0,

    // 1. 啟動一般魔物 / 守關領主 Boss / 切磋 / 錯題懸賞戰鬥
    startBattle: function(mapMonsterNode, customMode, customQuestionId) {
      mapMonsterNode = mapMonsterNode || null;
      customMode = customMode || "combat";
      customQuestionId = customQuestionId || null;

      this.active = true;
      this.mode = customMode;
      this.mapMonsterRef = mapMonsterNode;
      this.boostActive = false;
      this.guardActive = false;
      this.revivedThisBattle = false;

      window.Aetheria.State.recalcMaxHp();
      const s = window.Aetheria.State.data;
      this.enemy = window.Aetheria.Data.createBattleEnemy(mapMonsterNode);
      this.enemy.name = stripEmoji(this.enemy.name);
      this.enemy.weak = "弱點：" + stripEmoji(this.enemy.weak);

      // 開局 BP 加成：星界魔導 / 公會 SS 級 / 阿爾比恩聖碑(25pt) / 藤椒烤肉料理
      if (s.currentJob === "archmage" && s.bp < 3) s.bp = 3;
      if (s.guildRank === "SS") s.bp = Math.min(s.maxBp, s.bp + 1);
      if (s.monolithPts && s.monolithPts.english >= 25) s.bp = Math.min(s.maxBp, s.bp + 1);
      if (s.activeMeal && s.activeMeal.battlesLeft > 0 && s.activeMeal.id === "meal_steak") {
        s.bp = Math.min(s.maxBp, s.bp + 1);
      }

      // 鑲嵌【雪狼冰魄】符文：開局第 1 回合自動冰封敵人
      if (window.Aetheria.State.hasRune("coreWolf")) {
        this.enemy.frozenTurns = 1;
      }

      // 開局被動破盾 (爆破袋 Lv.2/Lv.3 + 冰晶幼龍)
      let openBreak = 0;
      if (s.tools.bomb >= 3) openBreak += 2;
      else if (s.tools.bomb === 2) openBreak += 1;

      const mainPet = window.Aetheria.Data.PETS[s.activePet];
      const subPet = getHunterSubPet(s);
      if (mainPet && mainPet.openingShieldBreak) openBreak += mainPet.openingShieldBreak;
      if (subPet && subPet.openingShieldBreak) openBreak += subPet.openingShieldBreak;

      if (openBreak > 0 && !this.enemy.broken) {
        this.enemy.shield = Math.max(0, this.enemy.shield - openBreak);
        if (this.enemy.shield === 0) {
          this.enemy.broken = true;
          this.enemy.breakTurnsLeft = 2;
          this.enemy.intent = window.Aetheria.Data.rollNextIntent(this.enemy, 1);
        }
      }

      document.getElementById("battle-stage").style.display = "flex";
      window.Aetheria.UI.setActivePanel("panel-battle");
      window.Aetheria.Audio.playBgm("battle");

      const phaseTitle = document.getElementById("battle-phase-title");
      if (phaseTitle) {
        phaseTitle.innerText = (customMode === "bounty") ? "討伐暗影錯題幻象" : "破盾詠唱";
      }

      this.renderBattleDomStage();
      this.updateBattleHUD();
      this.nextTurnQuestion(customQuestionId);
    },

    // 2. 啟動閃光礦脈 10 秒限時完美採集挑戰
    startHarvestChallenge: function(node) {
      this.active = true;
      this.mode = "harvest";
      this.harvestNodeRef = node;
      this.boostActive = false;
      this.guardActive = false;

      this.enemy = {
        name: stripEmoji(node.name),
        lv: 5,
        atk: 0,
        isBoss: false,
        isShiny: true,
        spriteKey: "mat_crystal",
        hp: 30,
        maxHp: 30,
        shield: 1,
        maxShield: 1,
        broken: false,
        intent: { type: "none", label: "限時 10 秒內答對即獲 3 倍爆擊產量", isUlt: false },
        weak: "完美共鳴採集"
      };

      document.getElementById("battle-stage").style.display = "flex";
      window.Aetheria.UI.setActivePanel("panel-battle");

      const phaseTitle = document.getElementById("battle-phase-title");
      if (phaseTitle) phaseTitle.innerText = "完美採集 (10秒)";

      this.renderBattleDomStage();
      this.updateBattleHUD();
      this.nextTurnQuestion(null, 10);
    },

    // 3. 啟動 NPC 旅人指令單題檢定
    startPathActionChallenge: function(actionObj, npcObj) {
      this.active = true;
      this.mode = "path_inquire";
      this.pathActionRef = { action: actionObj, npc: npcObj };
      this.boostActive = false;
      this.guardActive = false;

      this.enemy = {
        name: stripEmoji(npcObj.name) + "（檢定）",
        lv: 3,
        atk: 0,
        isBoss: false,
        isShiny: false,
        spriteKey: npcObj.sprite,
        hp: 40,
        maxHp: 40,
        shield: 1,
        maxShield: 1,
        broken: false,
        intent: { type: "none", label: "答對本題即可完成旅人指令", isUlt: false },
        weak: "知識檢定"
      };

      document.getElementById("battle-stage").style.display = "flex";
      window.Aetheria.UI.setActivePanel("panel-battle");

      const phaseTitle = document.getElementById("battle-phase-title");
      if (phaseTitle) phaseTitle.innerText = stripEmoji(actionObj.label);

      this.renderBattleDomStage();
      this.updateBattleHUD();
      this.nextTurnQuestion();
    },

    renderBattleDomStage: function() {
      const s = window.Aetheria.State.data;
      const e = this.enemy;
      const Sprites = window.Aetheria.Data.Sprites;
      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);

      const arenaEl = document.getElementById("bt-arena-bg");
      if (arenaEl) {
        arenaEl.className = "bt-arena-field theme-" + (mapObj.theme || "forest");
      }

      const heroSlot = document.getElementById("bt-dom-hero");
      if (heroSlot) {
        heroSlot.innerHTML = '<img src="' + Sprites.getDataURL("hero_right_0") + '" alt="Hero">';
      }

      const petSlot = document.getElementById("bt-dom-pet");
      const subPetSlot = document.getElementById("bt-dom-subpet");
      const petData = window.Aetheria.Data.PETS[s.activePet] || window.Aetheria.Data.PETS.pet_slime;
      const isShinyPet = s.shinyPets && s.shinyPets.indexOf(s.activePet) !== -1;
      const petKey = isShinyPet ? petData.shinySpriteKey : petData.spriteKey;

      if (petSlot) {
        petSlot.innerHTML = '<img src="' + Sprites.getDataURL(petKey) + '" alt="Pet">';
      }

      const subData = getHunterSubPet(s);
      if (subPetSlot) {
        if (subData) {
          const subShiny = s.shinyPets && s.shinyPets.indexOf(subData.id) !== -1;
          const subKey = subShiny ? subData.shinySpriteKey : subData.spriteKey;
          subPetSlot.innerHTML = '<img src="' + Sprites.getDataURL(subKey) + '" alt="SubPet">';
          subPetSlot.style.display = "block";
        } else {
          subPetSlot.innerHTML = "";
          subPetSlot.style.display = "none";
        }
      }

      const enemySlot = document.getElementById("bt-dom-enemy");
      if (enemySlot && e) {
        let eKey = e.spriteKey || "mon_bamboo";
        if (e.isShiny && !e.isBoss && Sprites.get(eKey + "_shiny")) {
          eKey += "_shiny";
        }
        enemySlot.className = "bt-enemy-slot" + (e.isBoss ? " boss" : "") + (e.broken ? " broken" : "");
        enemySlot.innerHTML = '<img src="' + Sprites.getDataURL(eKey) + '" alt="Enemy">';
      }
    },

    playAttackAnimation: function() {
      const heroSlot = document.getElementById("bt-dom-hero");
      const slashEl = document.getElementById("bt-slash-fx");

      if (heroSlot) {
        heroSlot.classList.remove("bt-lunge-right");
        void heroSlot.offsetWidth;
        heroSlot.classList.add("bt-lunge-right");
      }
      if (slashEl) {
        slashEl.style.display = "block";
        setTimeout(function() { slashEl.style.display = "none"; }, 220);
      }
    },

    playEnemyAttackAnimation: function() {
      const enemySlot = document.getElementById("bt-dom-enemy");
      if (enemySlot) {
        enemySlot.classList.remove("bt-lunge-left");
        void enemySlot.offsetWidth;
        enemySlot.classList.add("bt-lunge-left");
      }
    },

    updateBattleHUD: function() {
      const s = window.Aetheria.State.data;
      const e = this.enemy;
      if (!e) return;

      // 更新左上主角 HP 條、DEF 與舉盾狀態
      const heroHpTxt = document.getElementById("bt-hero-hp-txt");
      if (heroHpTxt) heroHpTxt.innerText = "HP " + s.hp + "/" + s.maxHp;
      const heroHpBar = document.getElementById("hero-hp-bar");
      if (heroHpBar) heroHpBar.style.width = Math.max(0, (s.hp / s.maxHp) * 100) + "%";

      const guardPill = document.getElementById("bt-guard-pill");
      if (guardPill) guardPill.style.display = this.guardActive ? "inline-block" : "none";

      const streakEl = document.getElementById("battle-streak-tag");
      if (streakEl) streakEl.innerText = "連勝 x" + (s.streak || 0) + "｜DEF " + window.Aetheria.State.getTotalDef();

      const orbs = document.getElementById("hero-bp-orbs");
      if (orbs) {
        orbs.innerHTML = "";
        for (let i = 0; i < s.maxBp; i++) {
          const d = document.createElement("div");
          d.className = "bp-orb" + (i < s.bp ? " filled" : "");
          orbs.appendChild(d);
        }
      }

      // 更新右上敵方資訊與「下回合意圖預告」
      document.getElementById("enemy-name").innerText = e.name;
      const shinyTag = document.getElementById("enemy-shiny-tag");
      if (shinyTag) shinyTag.style.display = e.isShiny ? "inline-block" : "none";

      const intentBox = document.getElementById("enemy-intent-box");
      const intentTxt = document.getElementById("enemy-intent-txt");
      if (intentBox && intentTxt) {
        if (e.broken) {
          intentBox.className = "bt-intent-banner";
          intentTxt.innerText = "状态：BREAK 暈眩中 (剩 " + (e.breakTurnsLeft || 1) + " 回合)";
        } else if (e.frozenTurns > 0) {
          intentBox.className = "bt-intent-banner";
          intentTxt.innerText = "狀態：雪狼冰魄冰封中 (無法反擊)";
        } else if (e.intent) {
          intentBox.className = "bt-intent-banner" + (e.intent.isUlt ? " intent-ult" : "");
          intentTxt.innerText = e.intent.label;
        }
      }

      const shieldBox = document.getElementById("enemy-shield-box");
      const shieldTxt = document.getElementById("enemy-shield");
      if (shieldBox && shieldTxt) {
        if (e.broken) {
          shieldBox.classList.add("broken");
          shieldTxt.innerText = "BREAK 破防";
        } else {
          shieldBox.classList.remove("broken");
          shieldTxt.innerText = "護盾 " + e.shield + " (減傷75%)";
        }
      }

      const enemySlot = document.getElementById("bt-dom-enemy");
      if (enemySlot) {
        if (e.broken) enemySlot.classList.add("broken");
        else enemySlot.classList.remove("broken");
      }

      document.getElementById("enemy-weak").innerText = e.weak;
      document.getElementById("enemy-hp-bar").style.width = Math.max(0, (e.hp / e.maxHp) * 100) + "%";

      // 按鈕高亮狀態
      const boostBtn = document.getElementById("btn-boost");
      if (boostBtn) {
        boostBtn.innerText = this.boostActive ? "Boost中" : "Boost(" + s.bp + ")";
        boostBtn.className = "na-btn" + (this.boostActive ? " highlight" : "");
      }

      const guardBtn = document.getElementById("btn-guard");
      if (guardBtn) {
        guardBtn.innerText = this.guardActive ? "舉盾中" : "舉盾";
        guardBtn.className = "na-btn" + (this.guardActive ? " highlight" : "");
      }

      const tameBtn = document.getElementById("btn-tame");
      if (tameBtn) {
        const canTame = (this.mode === "combat") && (e.broken || (e.hp / e.maxHp) <= 0.45);
        tameBtn.style.display = canTame ? "inline-block" : "none";
      }
    },

    toggleBoost: function() {
      const s = window.Aetheria.State.data;
      if (s.bp <= 0) {
        window.Aetheria.UI.showToast("BP 增幅珠不足！每回合答對或開啟【舉盾】可充能 BP。");
        return;
      }
      this.boostActive = !this.boostActive;
      window.Aetheria.Audio.sfxTalkBlip();
      this.updateBattleHUD();
    },

    // 新增！切換【舉盾防禦】戰術姿態
    toggleGuard: function() {
      if (this.mode !== "combat" && this.mode !== "bounty") return;
      this.guardActive = !this.guardActive;
      window.Aetheria.Audio.sfxTalkBlip();
      if (this.guardActive) {
        window.Aetheria.UI.showToast("已開啟【舉盾防禦】：答對後減免敵方 75% 傷害並額外 +1 BP！");
      }
      this.updateBattleHUD();
    },

    attemptTame: function() {
      const s = window.Aetheria.State.data;
      if ((s.inventory.tameFruit || 0) <= 0) {
        window.Aetheria.UI.showToast("靈獸誘餌果不足！可在公會委託、金幣商店或煉金台取得。");
        return;
      }
      s.inventory.tameFruit--;
      this.mode = "tame_trial";
      const phaseTitle = document.getElementById("battle-phase-title");
      if (phaseTitle) phaseTitle.innerText = "已投出誘餌果！答對本題收服";
      window.Aetheria.UI.showToast("已投出靈獸誘餌果！請答對下方題目完成契約共鳴！");
    },

    useHealPotion: function() {
      const s = window.Aetheria.State.data;
      if ((s.inventory.potionHeal || 0) <= 0) {
        window.Aetheria.UI.showToast("生命藥水不足！可在鐵匠鋪煉金或用金幣購買。");
        return;
      }
      if (s.hp >= s.maxHp) {
        window.Aetheria.UI.showToast("生命值已經是滿的！");
        return;
      }
      s.inventory.potionHeal--;
      // 📗 煉金真理聖碑 (科學科) 25點神恩：藥水回復量翻倍 (70 -> 140)
      const sciPts = (s.monolithPts && s.monolithPts.science) || 0;
      const healVal = (sciPts >= 25) ? 140 : 70;
      s.hp = Math.min(s.maxHp, s.hp + healVal);
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.updateBattleHUD();
      window.Aetheria.UI.spawnFloatingText("+" + healVal + " HP", "#5ac54f", false);
      window.Aetheria.UI.showToast("飲用生命藥水，回復 " + healVal + " 點生命！(剩餘 " + s.inventory.potionHeal + " 瓶)");
    },

    nextTurnQuestion: function(forceId, customSeconds) {
      clearInterval(this.timerInterval);
      const s = window.Aetheria.State.data;
      const e = this.enemy;
      const self = this;

      const isHighPressure = e && ((e.lv - s.lv) >= 6);
      const limitSec = customSeconds || (isHighPressure ? 14 : 0);

      const timerBadge = document.getElementById("timer-badge");
      if (limitSec > 0 && timerBadge) {
        this.timeLeft = limitSec;
        timerBadge.style.display = "inline-block";
        timerBadge.innerText = this.timeLeft + "s";
        this.timerInterval = setInterval(function() {
          self.timeLeft--;
          timerBadge.innerText = self.timeLeft + "s";
          if (self.timeLeft <= 0) {
            clearInterval(self.timerInterval);
            self.resolveTurn(false, "詠唱逾時", { id: "timeout" });
          }
        }, 1000);
      } else if (timerBadge) {
        timerBadge.style.display = "none";
      }

      const q = window.Aetheria.QuizBridge.pickQuestion({
        forceId: forceId,
        preferAdvanced: this.boostActive || (e && e.isBoss)
      });

      window.Aetheria.QuizUI.renderQuestion(q, function(isCorrect, correctText, qObj) {
        self.resolveTurn(isCorrect, correctText, qObj);
      });
    },

    resolveTurn: function(isCorrect, correctText, qObj) {
      clearInterval(this.timerInterval);
      const s = window.Aetheria.State.data;
      const e = this.enemy;
      const self = this;

      if (qObj && qObj.id && qObj.id !== "timeout") {
        window.Aetheria.QuizBridge.recordAnswer(qObj.id, isCorrect);
        // 答對題目自動為對應科目的「古文明聖碑」注入 +2 共鳴點！
        if (isCorrect && qObj.subject && s.monolithPts && typeof s.monolithPts[qObj.subject] === "number") {
          s.monolithPts[qObj.subject] = Math.min(100, s.monolithPts[qObj.subject] + 2);
        }
      }

      // 模式 A：閃光礦脈完美採集
      if (this.mode === "harvest") {
        const pickMult = (s.tools.pickaxe >= 3) ? 2.0 : (s.tools.pickaxe === 2) ? 1.5 : 1.0;
        const luckyMult = (s.unlockedRelics && s.unlockedRelics.indexOf("r_charm") !== -1 && Math.random() < 0.5) ? 2 : 1;
        const totalMult = pickMult * luckyMult;

        if (isCorrect) {
          this.playAttackAnimation();
          window.Aetheria.Audio.sfxLevelUp();

          let dropText = "";
          if (s.currentZone === "zone1_forest" || s.currentZone === "camp_hub") {
            const ironGain = Math.round(4 * totalMult);
            const vineGain = Math.round(2 * totalMult);
            const mithGain = Math.round(2 * totalMult);
            s.inventory.iron += ironGain;
            s.inventory.vine += vineGain;
            s.inventory.mithril += mithGain;
            dropText = "藍晶礦 +" + ironGain + "、藤蔓 +" + vineGain + "、秘銀 +" + mithGain;
          } else if (s.currentZone === "cave1_mushroom" || s.currentZone === "zone2_canyon" || s.currentZone === "zone3_coast") {
            const mithGain = Math.round(4 * totalMult);
            const coralGain = Math.round(3 * totalMult);
            s.inventory.mithril += mithGain;
            s.inventory.coral += coralGain;
            dropText = "流沙秘銀 +" + mithGain + "、深海珊瑚 +" + coralGain;
          } else if (s.currentZone === "zone4_snow" || s.currentZone === "zone5_volcano") {
            const obsGain = Math.round(3 * totalMult);
            const lotusGain = Math.round(2 * totalMult);
            s.inventory.obsidian += obsGain;
            s.inventory.iceLotus += lotusGain;
            dropText = "熔岩黑曜石 +" + obsGain + "、雪山冰蓮 +" + lotusGain;
          } else {
            const starGain = Math.round(3 * totalMult);
            const leafGain = Math.round(2 * totalMult);
            s.inventory.starIron += starGain;
            s.inventory.goldLeaf += leafGain;
            dropText = "深淵星隕鐵 +" + starGain + "、世界樹金葉 +" + leafGain;
          }

          window.Aetheria.State.gainRewards(45, 50, 12);
          window.Aetheria.UI.showToast("完美採集大爆擊！獲得【" + dropText + "】！");
        } else {
          window.Aetheria.Audio.sfxWrong();
          s.inventory.iron += 1;
          window.Aetheria.UI.showToast("採集失誤（正解：" + correctText + "），獲得基礎【藍晶礦 +1】。");
        }
        this.endBattle();
        return;
      }

      // 模式 B：NPC 旅人指令檢定
      if (this.mode === "path_inquire") {
        const ref = this.pathActionRef;
        if (isCorrect && ref && ref.action) {
          window.Aetheria.Audio.sfxLevelUp();
          ref.action.onSuccess(s);
          window.Aetheria.State.save();
          window.Aetheria.UI.showToast("旅人指令成功！" + stripEmoji(ref.action.rewardSummary));
        } else {
          window.Aetheria.Audio.sfxWrong();
          window.Aetheria.UI.showToast("檢定未通過！正確答案為：【" + correctText + "】");
        }
        this.endBattle();
        return;
      }

      // 模式 C：收服戰寵判定
      if (this.mode === "tame_trial") {
        if (isCorrect) {
          const petId = e.tamePetId || "pet_fox";
          if (s.unlockedPets.indexOf(petId) === -1) s.unlockedPets.push(petId);
          if (e.isShiny && s.shinyPets.indexOf(petId) === -1) s.shinyPets.push(petId);
          s.activePet = petId;

          if (this.mapMonsterRef) this.mapMonsterRef.alive = false;
          window.Aetheria.Audio.sfxLevelUp();
          const petInfo = window.Aetheria.Data.PETS[petId];
          const shinyPrefix = e.isShiny ? "【異色閃光】" : "";
          window.Aetheria.State.gainRewards(e.expReward, e.goldReward, 20);
          window.Aetheria.UI.showToast("收服成功！" + shinyPrefix + (petInfo ? stripEmoji(petInfo.name) : "新戰寵") + " 已加入隊伍！");
          this.endBattle();
          return;
        } else {
          this.mode = "combat";
          const phaseTitle = document.getElementById("battle-phase-title");
          if (phaseTitle) phaseTitle.innerText = "破盾詠唱";
        }
      }

      // ================= 核心戰鬥結算：主角行動階段 =================
      if (isCorrect) {
        this.playAttackAnimation();

        let shieldDmg = 1 + window.Aetheria.State.getBonusShieldBreak();
        let dmgMult = 1.0;

        const wData = window.Aetheria.Data.WEAPONS[s.equippedWeapon] || {};

        if (s.currentJob === "scholar" && (qObj.type === "matching" || qObj.type === "image_spell" || qObj.type === "image_mcq")) {
          shieldDmg += 1;
        }
        if (wData.spellBonus && (qObj.type === "tile_spell" || qObj.type === "image_spell")) {
          dmgMult *= wData.spellBonus;
        }
        if (qObj.type === "blind_spell") {
          dmgMult *= (s.currentJob === "archmage") ? 3.0 : 2.0;
          shieldDmg += 1;
        }

        // 野味藤椒烤肉料理 Buff：傷害 +20%
        if (s.activeMeal && s.activeMeal.battlesLeft > 0 && s.activeMeal.id === "meal_steak") {
          dmgMult *= 1.2;
        }

        // 若開啟【舉盾防禦】：本回輸出減半，但額外多獲 1 顆 BP 珠
        if (this.guardActive) {
          dmgMult *= 0.55;
        }

        const mainPet = window.Aetheria.Data.PETS[s.activePet] || window.Aetheria.Data.PETS.pet_slime;
        const subPet = getHunterSubPet(s);

        if (this.boostActive && s.bp > 0) {
          dmgMult *= (1.5 + s.bp * 0.45);
          shieldDmg += 1;
          s.bp = 0;
          this.boostActive = false;
        } else {
          let bpGain = 1 + (wData.bpGainBonus || 0) + (this.guardActive ? 1 : 0);
          if (mainPet && mainPet.bpChance && Math.random() < mainPet.bpChance) bpGain += 1;
          if (subPet && subPet.bpChance && Math.random() < subPet.bpChance) bpGain += 1;
          s.bp = Math.min(s.maxBp, s.bp + bpGain);
        }

        // 護盾削減與 BREAK 破防判定
        let justBroken = false;
        if (!e.broken) {
          e.shield = Math.max(0, e.shield - shieldDmg);
          if (e.shield === 0) {
            e.broken = true;
            e.breakTurnsLeft = 2; // 破防暈眩持續 2 回合
            justBroken = true;
            window.Aetheria.Audio.sfxBreakShield();
            window.Aetheria.UI.spawnFloatingText("BREAK! 破防暈眩!", "#38b6ff", true);
          }
        }

        if (!justBroken) window.Aetheria.Audio.sfxAttackHit();

        // 護盾減傷壁壘 vs 破防暴擊加成 (含龍王逆鱗 +50% 破防暴擊、炎魔熔核穿透)
        if (e.broken) {
          dmgMult *= window.Aetheria.State.hasRune("coreDragon") ? 2.5 : 2.0;
        } else {
          // 未破防時敵人擁有 75% 護盾減傷壁壘（鑲嵌炎魔熔核可穿透至 50%）
          dmgMult *= window.Aetheria.State.hasRune("coreGolem") ? 0.5 : 0.28;
        }

        const baseAtk = window.Aetheria.State.getTotalAtk();
        const heroDmg = Math.round(baseAtk * dmgMult);

        const hunterMult = (s.currentJob === "hunter") ? 2.0 : 1.0;
        const petRatio = (mainPet.bonusDmgRatio || 0.2) + (subPet ? (subPet.bonusDmgRatio || 0.2) : 0);
        const petDmg = Math.round(baseAtk * petRatio * hunterMult * (e.broken ? 1.0 : 0.4));
        const totalDmg = Math.max(1, heroDmg + petDmg);

        e.hp = Math.max(0, e.hp - totalDmg);

        // 結算回血：戰寵 + 煉金藥師(15%) + 破曉神刃(10%) + 竹精木心符文(+20) + 蘑菇濃湯(+15) + 骷髏魂火符文(20%吸血)
        let healAmt = (mainPet.healPerTurn || 0) + (subPet ? (subPet.healPerTurn || 0) : 0);
        if (s.currentJob === "alchemist") healAmt += Math.round(s.maxHp * 0.15);
        if (s.equippedWeapon === "w_dawn") healAmt += Math.round(s.maxHp * 0.10);
        if (window.Aetheria.State.hasRune("coreBamboo")) healAmt += 20;
        if (s.activeMeal && s.activeMeal.battlesLeft > 0 && s.activeMeal.id === "meal_soup") healAmt += 15;
        if (window.Aetheria.State.hasRune("coreSkull")) healAmt += Math.round(totalDmg * 0.20);

        if (healAmt > 0) {
          s.hp = Math.min(s.maxHp, s.hp + healAmt);
        }

        if (s.currentJob === "thief" && Math.random() < 0.35) {
          s.inventory.iron += 1;
          window.Aetheria.UI.spawnFloatingText("盜取藍晶礦+1", "#5ac54f", false);
        }

        const passiveMsg = window.Aetheria.State.tickPassiveProduction();
        if (passiveMsg) window.Aetheria.UI.showToast(passiveMsg);

        window.Aetheria.UI.spawnFloatingText("-" + totalDmg, e.broken ? "#fbd000" : "#ffffff", true);
        this.updateBattleHUD();

        if (e.hp <= 0) {
          setTimeout(function() { self.winBattle(); }, 450);
        } else {
          // 敵人未死：進入「敵方回合反擊階段」！
          setTimeout(function() { self.executeEnemyCounterPhase(true); }, 580);
        }
      } else {
        // 答錯題目：無法造成傷害，且敵人立即發動加重反擊！
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.spawnFloatingText("詠唱失敗! 正解: " + correctText, "#ff595e", false);
        window.Aetheria.UI.showToast("正確答案為：【" + correctText + "】");

        setTimeout(function() { self.executeEnemyCounterPhase(false); }, 950);
      }
    },

    // ================= 敵方回合反擊與破防甦醒階段 (徹底終結無敵狀態！) =================
    executeEnemyCounterPhase: function(answeredRight) {
      const s = window.Aetheria.State.data;
      const e = this.enemy;
      const self = this;
      if (!e || e.hp <= 0) return;

      // 情況 1：敵人處於 BREAK 破防暈眩中，本回合無法攻擊！
      if (e.broken) {
        e.breakTurnsLeft = (e.breakTurnsLeft || 1) - 1;
        if (e.breakTurnsLeft <= 0) {
          e.broken = false;
          e.shield = e.maxShield;
          window.Aetheria.UI.showToast(e.name + " 從破防中甦醒，重新展開了護盾！");
        }
      }
      // 情況 2：敵人被【雪狼冰魄】符文冰封中，跳過反擊！
      else if (e.frozenTurns && e.frozenTurns > 0) {
        e.frozenTurns--;
        window.Aetheria.UI.spawnFloatingText("冰封凝滯!", "#8ce0ff", true);
      }
      // 情況 3：敵人未破防，依預告意圖向主角發動真實攻擊！
      else {
        this.playEnemyAttackAnimation();
        const upper = document.getElementById("upper-screen");
        if (upper) {
          upper.classList.add("shake");
          setTimeout(function() { upper.classList.remove("shake"); }, 280);
        }

        if (e.intent && e.intent.shieldHeal) {
          e.shield = Math.min(e.maxShield, e.shield + e.intent.shieldHeal);
        }

        const intentMult = (e.intent && e.intent.mult) ? e.intent.mult : 1.0;
        const rawAtk = Math.round((e.atk || 20) * intentMult);
        const heroDef = window.Aetheria.State.getTotalDef();

        // 計算扣除主角防禦力後的實際傷害 (保底造成敵方 20% 攻擊力的穿透傷)
        let netDmg = Math.max(Math.round(rawAtk * 0.2), rawAtk - heroDef);

        // 若主角答錯題目，敵人趁虛而入傷害 +30%
        if (!answeredRight) {
          netDmg = Math.round(netDmg * 1.3);
        }
        // 若主角成功答對且開啟【舉盾防禦】，減免 75% 傷害！
        else if (this.guardActive) {
          netDmg = Math.max(1, Math.round(netDmg * 0.25));
          // 檢查是否鑲嵌【海妖水核 (coreSiren)】：舉盾時 100% 反彈敵方攻擊力！
          if (window.Aetheria.State.hasRune("coreSiren")) {
            const reflectDmg = e.atk || 25;
            e.hp = Math.max(0, e.hp - reflectDmg);
            window.Aetheria.UI.spawnFloatingText("水核反彈 -" + reflectDmg, "#38b6ff", true);
          }
        }

        s.hp = Math.max(0, s.hp - netDmg);
        window.Aetheria.UI.spawnFloatingText((this.guardActive && answeredRight ? "格擋 -" : "受擊 -") + netDmg, "#ff595e", false);

        // 若海妖水核反彈殺死敵人
        if (e.hp <= 0) {
          this.updateBattleHUD();
          setTimeout(function() { self.winBattle(); }, 450);
          return;
        }

        // 檢查主角是否陣亡 (HP <= 0)
        if (s.hp <= 0) {
          // 📙 紀元編年聖碑 (人文科) 100點終極神恩：每場戰鬥 1 次不屈半血復活
          if (s.monolithPts && s.monolithPts.humanities >= 100 && !this.revivedThisBattle) {
            this.revivedThisBattle = true;
            s.hp = Math.round(s.maxHp * 0.5);
            window.Aetheria.Audio.sfxLevelUp();
            window.Aetheria.UI.spawnFloatingText("聖碑神恩・不屈復活!", "#fbd000", false);
            window.Aetheria.UI.showToast("【紀元聖碑神恩】發動！在絕境中恢復 50% 生命值！");
          } else {
            this.updateBattleHUD();
            setTimeout(function() { self.loseBattle(); }, 600);
            return;
          }
        }
      }

      // 推進回合並預告敵人下一手意圖
      e.turnCount = (e.turnCount || 1) + 1;
      this.guardActive = false;
      e.intent = window.Aetheria.Data.rollNextIntent(e, e.turnCount);
      window.Aetheria.State.save();
      this.updateBattleHUD();

      setTimeout(function() { self.nextTurnQuestion(); }, 520);
    },

    // 真實戰敗重傷懲罰 (損失 20% 金幣並強制抬回曙光營地)
    loseBattle: function() {
      const s = window.Aetheria.State.data;
      window.Aetheria.Audio.sfxWrong();

      const lostGold = Math.floor((s.gold || 0) * 0.2);
      s.gold = Math.max(0, s.gold - lostGold);
      s.streak = 0;
      window.Aetheria.State.recalcMaxHp();
      s.hp = s.maxHp;

      // 強制送回 0.曙光營地
      s.currentZone = "camp_hub";
      s.heroX = 250;
      s.heroY = 220;
      s.petX = 228;
      s.petY = 224;
      window.Aetheria.State.save();

      this.endBattle();
      window.Aetheria.UI.showToast("戰敗重傷！已被營救回【曙光營地】並損失 " + lostGold + " G！請先鍛造防具與料理再戰！");
    },

    winBattle: function() {
      const s = window.Aetheria.State.data;
      const e = this.enemy;

      window.Aetheria.Audio.sfxLevelUp();

      // 實戰勝利後，重置公會一般委託的防刷冷卻，並累計錯題幻象擊殺數
      s.bountyCooldowns = {};
      if (this.mode === "bounty") {
        s.wrongBountyKills = (s.wrongBountyKills || 0) + 1;
      }

      // 消耗 1 場行前料理持續場次
      if (s.activeMeal && s.activeMeal.battlesLeft > 0) {
        s.activeMeal.battlesLeft--;
        if (s.activeMeal.battlesLeft <= 0) {
          s.activeMeal.id = null;
          window.Aetheria.State.recalcMaxHp();
        }
      }

      const normKey = e.normalDrop || "vine";
      const subKey = e.subDrop || "iron";
      s.inventory[normKey] = (s.inventory[normKey] || 0) + 2;
      s.inventory[subKey] = (s.inventory[subKey] || 0) + 1;

      let dropSummary = window.Aetheria.Data.MATERIALS[normKey].name + " +2、" + window.Aetheria.Data.MATERIALS[subKey].name + " +1";

      if (e.broken && e.breakDrop) {
        s.inventory[e.breakDrop] = (s.inventory[e.breakDrop] || 0) + 1;
        dropSummary += "、破防核心【" + window.Aetheria.Data.MATERIALS[e.breakDrop].name + " +1】";
      }

      // 擊敗守關領主 Boss 或紫氣賞金首：必掉【古文明聖碑殘片】並解開區域封印！
      if (e.dropsTabletShard) {
        s.inventory.tabletShard = (s.inventory.tabletShard || 0) + 1;
        dropSummary += "、【古文明聖碑殘片 +1】";
      }

      if (e.bossId) {
        if (!s.clearedBosses) s.clearedBosses = {};
        s.clearedBosses[e.bossId] = true;
      }

      if (this.pathActionRef && this.pathActionRef.action) {
        this.pathActionRef.action.onSuccess(s);
        dropSummary += "、" + stripEmoji(this.pathActionRef.action.rewardSummary);
        this.pathActionRef = null;
      }

      const leveledUp = window.Aetheria.State.gainRewards(e.expReward, e.goldReward, e.isBoss ? 35 : 10);

      if (this.mapMonsterRef) {
        this.mapMonsterRef.alive = false;
      }

      if (e.bossId) {
        window.Aetheria.UI.showToast("擊潰守關領主！通往下一疆域的封印結界已解開！獲得：" + dropSummary);
      } else if (leveledUp) {
        window.Aetheria.UI.showToast("升級至 Lv." + s.lv + "！獲得 " + dropSummary + "！");
      } else {
        window.Aetheria.UI.showToast("戰鬥勝利！獲得 " + dropSummary + "！");
      }

      this.endBattle();
    },

    fleeBattle: function() {
      const s = window.Aetheria.State.data;
      s.heroX = Math.max(40, s.heroX - 28);
      window.Aetheria.UI.showToast("投擲煙霧玉安全撤退！");
      this.endBattle();
    },

    endBattle: function() {
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
