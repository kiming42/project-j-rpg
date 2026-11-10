/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 純 DOM/CSS 戰鬥、雙戰寵協同與分區完美採集引擎 (battle-break-boost.js - v3.5)
 * 升級：1.完美採集完整連動十字鎬等級 (Lv.2/Lv.3)、幸運護符與當前地圖階級
 *       2.完整實裝破曉神刃 (10%回血)、煉金藥師 (15%回血)、靈狐 (30%充能BP)、荒野獵人雙寵技能與公會SS級特權
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  function stripEmoji(str) {
    if (!str) return "";
    return String(str)
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "")
      .trim();
  }

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

    // 取得荒野獵人的第 2 隻副戰寵資料
    getHunterSubPet: function(s) {
      if (s.currentJob === "hunter" && s.unlockedPets && s.unlockedPets.length >= 2) {
        const subId = s.unlockedPets.find(function(id) { return id !== s.activePet; }) || s.unlockedPets[0];
        return window.Aetheria.Data.PETS[subId] || null;
      }
      return null;
    },

    // 1. 啟動一般魔物 / Boss / 切磋 / 錯題懸賞戰鬥
    startBattle: function(mapMonsterNode, customMode, customQuestionId) {
      this.active = true;
      this.mode = customMode || "combat";
      this.mapMonsterRef = mapMonsterNode || null;
      this.boostActive = false;

      const s = window.Aetheria.State.data;
      this.enemy = window.Aetheria.Data.createBattleEnemy(mapMonsterNode);
      this.enemy.name = stripEmoji(this.enemy.name);
      this.enemy.weak = "弱點：" + stripEmoji(this.enemy.weak);

      // 星界魔導開局保底 3 BP；公會 SS 級特權開局額外 +1 BP
      if (s.currentJob === "archmage" && s.bp < 3) {
        s.bp = 3;
      }
      if (s.guildRank === "SS") {
        s.bp = Math.min(s.maxBp, s.bp + 1);
      }

      // 開局被動破盾判定 (爆破袋 Lv.2/Lv.3 + 主戰寵冰龍 + 荒野獵人副戰寵冰龍)
      let openBreak = 0;
      if (s.tools.bomb >= 3) openBreak += 2;
      else if (s.tools.bomb === 2) openBreak += 1;

      const mainPet = window.Aetheria.Data.PETS[s.activePet];
      const subPet = this.getHunterSubPet(s);
      if (mainPet && mainPet.openingShieldBreak) openBreak += mainPet.openingShieldBreak;
      if (subPet && subPet.openingShieldBreak) openBreak += subPet.openingShieldBreak;

      if (openBreak > 0 && !this.enemy.broken) {
        this.enemy.shield = Math.max(0, this.enemy.shield - openBreak);
        if (this.enemy.shield === 0) this.enemy.broken = true;
      }

      document.getElementById("battle-stage").style.display = "flex";
      window.Aetheria.UI.setActivePanel("panel-battle");
      window.Aetheria.Audio.playBgm("battle");

      const phaseTitle = document.getElementById("battle-phase-title");
      if (phaseTitle) {
        phaseTitle.innerText = (this.mode === "bounty") ? "討伐暗影錯題幻象" : "符文破盾詠唱";
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

      this.enemy = {
        name: stripEmoji(node.name),
        lv: 5,
        isBoss: false,
        isShiny: true,
        spriteKey: "mat_crystal",
        hp: 30,
        maxHp: 30,
        shield: 1,
        maxShield: 1,
        broken: false,
        weak: "限時答對即獲完美爆擊產量"
      };

      document.getElementById("battle-stage").style.display = "flex";
      window.Aetheria.UI.setActivePanel("panel-battle");

      const phaseTitle = document.getElementById("battle-phase-title");
      if (phaseTitle) phaseTitle.innerText = "完美共鳴採集 (限時 10 秒)";

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

      this.enemy = {
        name: stripEmoji(npcObj.name) + "（旅人檢定）",
        lv: 3,
        isBoss: false,
        isShiny: false,
        spriteKey: npcObj.sprite,
        hp: 40,
        maxHp: 40,
        shield: 1,
        maxShield: 1,
        broken: false,
        weak: "答對即可完成旅人指令"
      };

      document.getElementById("battle-stage").style.display = "flex";
      window.Aetheria.UI.setActivePanel("panel-battle");

      const phaseTitle = document.getElementById("battle-phase-title");
      if (phaseTitle) phaseTitle.innerText = stripEmoji(actionObj.label);

      this.renderBattleDomStage();
      this.updateBattleHUD();
      this.nextTurnQuestion();
    },

    // 渲染純 DOM/CSS 對決舞台
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

      const subPetData = this.getHunterSubPet(s);
      if (subPetSlot) {
        if (subPetData) {
          const subShiny = s.shinyPets && s.shinyPets.indexOf(subPetData.id) !== -1;
          const subKey = subShiny ? subPetData.shinySpriteKey : subPetData.spriteKey;
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

    updateBattleHUD: function() {
      const s = window.Aetheria.State.data;
      const e = this.enemy;
      if (!e) return;

      document.getElementById("enemy-name").innerText = e.name;
      const shinyTag = document.getElementById("enemy-shiny-tag");
      if (shinyTag) shinyTag.style.display = e.isShiny ? "inline-block" : "none";

      const shieldBox = document.getElementById("enemy-shield-box");
      const shieldTxt = document.getElementById("enemy-shield");
      if (shieldBox && shieldTxt) {
        if (e.broken) {
          shieldBox.classList.add("broken");
          shieldTxt.innerText = "BREAK 破防";
        } else {
          shieldBox.classList.remove("broken");
          shieldTxt.innerText = "護盾 " + e.shield;
        }
      }

      const enemySlot = document.getElementById("bt-dom-enemy");
      if (enemySlot) {
        if (e.broken) enemySlot.classList.add("broken");
        else enemySlot.classList.remove("broken");
      }

      document.getElementById("enemy-weak").innerText = e.weak;
      document.getElementById("enemy-hp-bar").style.width = Math.max(0, (e.hp / e.maxHp) * 100) + "%";

      const streakEl = document.getElementById("battle-streak-tag");
      if (streakEl) streakEl.innerText = "連勝 x" + (s.streak || 0);

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
        boostBtn.innerText = this.boostActive ? "BOOST 發動中" : "Boost (" + s.bp + ")";
        boostBtn.className = "na-btn" + (this.boostActive ? " highlight" : "");
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
        window.Aetheria.UI.showToast("BP 增幅珠不足！每回合答對題目即可充能 BP。");
        return;
      }
      this.boostActive = !this.boostActive;
      window.Aetheria.Audio.sfxTalkBlip();
      this.updateBattleHUD();
    },

    attemptTame: function() {
      const s = window.Aetheria.State.data;
      if ((s.inventory.tameFruit || 0) <= 0) {
        window.Aetheria.UI.showToast("靈獸誘餌果不足！可在公會委託、煉金台或金幣商店取得。");
        return;
      }
      s.inventory.tameFruit--;
      this.mode = "tame_trial";
      const phaseTitle = document.getElementById("battle-phase-title");
      if (phaseTitle) phaseTitle.innerText = "已投出誘餌果！答對本題即可收服 (剩餘 " + s.inventory.tameFruit + ")";
      window.Aetheria.UI.showToast("已投出靈獸誘餌果！請答對下方題目完成契約共鳴！");
    },

    useHealPotion: function() {
      const s = window.Aetheria.State.data;
      if ((s.inventory.potionHeal || 0) <= 0) {
        window.Aetheria.UI.showToast("生命藥水不足！可在鐵匠鋪煉金或金幣商店購買。");
        return;
      }
      if (s.hp >= s.maxHp) {
        window.Aetheria.UI.showToast("生命值已經是滿的！");
        return;
      }
      s.inventory.potionHeal--;
      s.hp = Math.min(s.maxHp, s.hp + 60);
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      window.Aetheria.UI.spawnFloatingText("+60 HP", "#5ac54f", false);
      window.Aetheria.UI.showToast("飲用生命藥水，回復 60 點生命！(剩餘 " + s.inventory.potionHeal + " 瓶)");
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

    // 結算完美採集獎勵（完整套用十字鎬 Lv.2/Lv.3 倍率、幸運護符與當前地圖階級）
    resolvePerfectHarvest: function(isCorrect, correctText) {
      const s = window.Aetheria.State.data;
      const pickLv = s.tools.pickaxe || 1;
      const pickBonus = (pickLv >= 2) ? 1 : 0;
      const pickMult = (pickLv >= 3) ? 2 : 1;
      const luckyMult = (s.unlockedRelics && s.unlockedRelics.indexOf("r_charm") !== -1 && Math.random() < 0.5) ? 2 : 1;
      const totalMult = pickMult * luckyMult;

      if (!isCorrect) {
        window.Aetheria.Audio.sfxWrong();
        s.inventory.iron += 1;
        window.Aetheria.State.save();
        window.Aetheria.UI.showToast("採集失誤（正解：" + correctText + "），僅獲基礎【藍晶鐵礦 +1】。");
        this.endBattle();
        return;
      }

      this.playAttackAnimation();
      window.Aetheria.Audio.sfxLevelUp();

      const z = s.currentZone;
      let msg = "";

      if (z === "camp_hub" || z === "zone1_forest") {
        const ironAmt = (3 + pickBonus) * totalMult;
        const mithAmt = (1 + pickBonus) * totalMult;
        s.inventory.iron += ironAmt;
        s.inventory.mithril += mithAmt;
        msg = "完美採集大成功！獲得【藍晶鐵礦 +" + ironAmt + "】、【流沙秘銀 +" + mithAmt + "】！";
      } else if (z === "cave1_mushroom" || z === "zone2_canyon" || z === "zone3_coast") {
        const mithAmt = (2 + pickBonus) * totalMult;
        const ironAmt = (2 + pickBonus) * totalMult;
        s.inventory.mithril += mithAmt;
        s.inventory.iron += ironAmt;
        msg = "完美採集大成功！獲得【流沙秘銀 +" + mithAmt + "】、【藍晶鐵礦 +" + ironAmt + "】！";
      } else if (z === "zone4_snow" || z === "zone5_volcano") {
        const obsAmt = (2 + pickBonus) * totalMult;
        const mithAmt = (2 + pickBonus) * totalMult;
        s.inventory.obsidian += obsAmt;
        s.inventory.mithril += mithAmt;
        msg = "完美採集大成功！獲得【熔岩黑曜石 +" + obsAmt + "】、【流沙秘銀 +" + mithAmt + "】！";
      } else {
        const starAmt = (2 + pickBonus) * totalMult;
        const obsAmt = (2 + pickBonus) * totalMult;
        s.inventory.starIron += starAmt;
        s.inventory.obsidian += obsAmt;
        msg = "完美採集大成功！獲得【深淵星隕鐵 +" + starAmt + "】、【熔岩黑曜石 +" + obsAmt + "】！";
      }

      window.Aetheria.State.gainRewards(35, 45, 10);
      window.Aetheria.UI.showToast(msg);
      this.endBattle();
    },

    resolveTurn: function(isCorrect, correctText, qObj) {
      clearInterval(this.timerInterval);
      const s = window.Aetheria.State.data;
      const e = this.enemy;
      const self = this;

      if (qObj && qObj.id && qObj.id !== "timeout") {
        window.Aetheria.QuizBridge.recordAnswer(qObj.id, isCorrect);
      }

      // 模式 A：完美採集挑戰
      if (this.mode === "harvest") {
        this.resolvePerfectHarvest(isCorrect, correctText);
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

      // 模式 C：投擲靈果收服戰寵判定
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
          window.Aetheria.UI.showToast("收服成功！" + shinyPrefix + (petInfo ? stripEmoji(petInfo.name) : "新戰寵") + " 已加入同行隊伍！");
          this.endBattle();
          return;
        } else {
          this.mode = "combat";
          const phaseTitle = document.getElementById("battle-phase-title");
          if (phaseTitle) phaseTitle.innerText = "符文破盾詠唱";
        }
      }

      // 一般戰鬥結算
      if (isCorrect) {
        this.playAttackAnimation();

        let shieldDmg = 1 + window.Aetheria.State.getBonusShieldBreak();
        let dmgMult = 1.0;

        const wData = window.Aetheria.Data.WEAPONS[s.equippedWeapon] || {};
        const mainPet = window.Aetheria.Data.PETS[s.activePet] || window.Aetheria.Data.PETS.pet_slime;
        const subPet = this.getHunterSubPet(s);

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

        if (this.boostActive && s.bp > 0) {
          dmgMult *= (1.5 + s.bp * 0.45);
          shieldDmg += 1;
          s.bp = 0;
          this.boostActive = false;
        } else {
          let bpGain = 1 + (wData.bpGainBonus || 0);
          // 雷光九尾靈狐 30% 機率額外充能 1 BP (支援主寵與荒野獵人副寵)
          if (mainPet.bpChance && Math.random() < mainPet.bpChance) bpGain += 1;
          if (subPet && subPet.bpChance && Math.random() < subPet.bpChance) bpGain += 1;
          s.bp = Math.min(s.maxBp, s.bp + bpGain);
        }

        let justBroken = false;
        if (!e.broken) {
          e.shield = Math.max(0, e.shield - shieldDmg);
          if (e.shield === 0) {
            e.broken = true;
            justBroken = true;
            window.Aetheria.Audio.sfxBreakShield();
            window.Aetheria.UI.spawnFloatingText("BREAK! 破防暈眩!", "#38b6ff", true);
          }
        }

        if (!justBroken) window.Aetheria.Audio.sfxAttackHit();

        if (e.broken) dmgMult *= 2.0;
        else if ((e.lv - s.lv) >= 6) dmgMult *= 0.4;

        const totalAtk = window.Aetheria.State.getTotalAtk();
        const heroDmg = Math.round(totalAtk * dmgMult);

        // 戰寵協同傷害 (荒野獵人雙戰寵協同傷害翻倍)
        const hunterMult = (s.currentJob === "hunter") ? 2.0 : 1.0;
        let petRatio = mainPet.bonusDmgRatio || 0.2;
        if (subPet) petRatio += (subPet.bonusDmgRatio || 0.2);
        const petDmg = Math.round(totalAtk * petRatio * hunterMult);
        const totalDmg = heroDmg + petDmg;

        e.hp = Math.max(0, e.hp - totalDmg);

        // 每回合生命回復計算：主寵 + 副寵 + 煉金藥師 (15% maxHp) + 破曉神刃 (10% maxHp)
        let healAmt = (mainPet.healPerTurn || 0) + (subPet ? (subPet.healPerTurn || 0) : 0);
        if (s.currentJob === "alchemist") healAmt += Math.round(s.maxHp * 0.15);
        if (s.equippedWeapon === "w_dawn") healAmt += Math.round(s.maxHp * 0.10);
        if (healAmt > 0) {
          s.hp = Math.min(s.maxHp, s.hp + healAmt);
        }

        if (s.currentJob === "thief" && Math.random() < 0.35) {
          s.inventory.iron += 1;
          window.Aetheria.UI.spawnFloatingText("盜取藍晶礦+1", "#5ac54f", false);
        }

        const passiveMsg = window.Aetheria.State.tickPassiveProduction();
        if (passiveMsg) window.Aetheria.UI.showToast(passiveMsg);

        const upper = document.getElementById("upper-screen");
        if (upper) {
          upper.classList.add("shake");
          setTimeout(function() { upper.classList.remove("shake"); }, 280);
        }

        window.Aetheria.UI.spawnFloatingText("-" + totalDmg, dmgMult >= 2.0 ? "#fbd000" : "#ffffff", true);
        this.updateBattleHUD();

        if (e.hp <= 0) {
          setTimeout(function() { self.winBattle(); }, 460);
        } else {
          setTimeout(function() { self.nextTurnQuestion(); }, 520);
        }
      } else {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.spawnFloatingText("擦傷! 正解: " + correctText, "#ff595e", false);
        window.Aetheria.UI.showToast("古文明殘響提示：正確答案為【" + correctText + "】");

        const enemyCounterDmg = (e.lv >= 15) ? 25 : 12;
        s.hp = Math.max(15, s.hp - enemyCounterDmg);
        window.Aetheria.State.save();
        this.updateBattleHUD();

        setTimeout(function() { self.nextTurnQuestion(); }, 1350);
      }
    },

    winBattle: function() {
      const s = window.Aetheria.State.data;
      const e = this.enemy;

      window.Aetheria.Audio.sfxLevelUp();

      const normKey = e.normalDrop || "iron";
      s.inventory[normKey] = (s.inventory[normKey] || 0) + 2;

      let dropSummary = window.Aetheria.Data.MATERIALS[normKey].name + " +2";
      if (e.broken && e.breakDrop) {
        s.inventory[e.breakDrop] = (s.inventory[e.breakDrop] || 0) + 1;
        dropSummary += "、破防獎勵【" + window.Aetheria.Data.MATERIALS[e.breakDrop].name + " +1】";
      }

      if (e.isBoss) {
        s.questProgress.mq_03_boss = true;
      }

      if (this.pathActionRef && this.pathActionRef.action) {
        this.pathActionRef.action.onSuccess(s);
        dropSummary += "、" + stripEmoji(this.pathActionRef.action.rewardSummary);
        this.pathActionRef = null;
      }

      const leveledUp = window.Aetheria.State.gainRewards(e.expReward, e.goldReward, e.isBoss ? 30 : 10);

      if (this.mapMonsterRef) {
        this.mapMonsterRef.alive = false;
      }

      if (leveledUp) {
        window.Aetheria.UI.showToast("升級至 Lv." + s.lv + "！獲得 " + dropSummary + "！");
      } else {
        window.Aetheria.UI.showToast("戰鬥勝利！獲得 " + dropSummary + "！");
      }

      this.endBattle();
    },

    fleeBattle: function() {
      const s = window.Aetheria.State.data;
      s.heroY += 20;
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
