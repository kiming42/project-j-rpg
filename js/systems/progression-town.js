/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 純 DOM 像素頭像、5分頁工坊、營地料理與聖碑總管 (progression-town.js - v5.0)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const MAX_ACTIVE_BOUNTIES = 3;

  function cleanText(str) {
    if (!str) return "";
    return String(str).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "").trim();
  }

  function getItemSpriteKey(matKey) {
    if (matKey === "iron" || matKey === "mithril" || matKey === "obsidian" || matKey === "starIron" || matKey === "tabletShard" || matKey === "coral") return "mat_crystal";
    if (matKey === "herb") return "mat_mushroom";
    if (matKey === "flower" || matKey === "iceLotus" || matKey === "goldLeaf" || matKey === "vine") return "mat_flower";
    if (matKey === "potionHeal" || matKey === "potionHint") return "icon_potion";
    if (matKey === "bombItem") return "icon_bomb";
    if (matKey === "tameFruit") return "heart";
    if (matKey === "wood") return "deco_stump";
    if (matKey === "fish") return "fishing_spot";
    return "crate";
  }

  function sanitizePlayerPosition() {
    const s = window.Aetheria.State.data;
    const Maps = window.Aetheria.Data.Maps;
    if (!s || !Maps) return;

    const validZones = [
      "camp_hub", "tent_guild", "tent_forge", "zone1_forest", "cave1_mushroom",
      "zone2_canyon", "zone3_coast", "zone4_snow", "zone5_volcano", "zone6_sky", "endless_tower"
    ];

    if (validZones.indexOf(s.currentZone) === -1) {
      s.currentZone = "camp_hub";
      s.heroX = 320;
      s.heroY = 260;
    }

    const mapObj = Maps.getMap(s.currentZone);
    if (mapObj) {
      if (isNaN(s.heroX) || s.heroX < 20 || s.heroX > mapObj.width - 20) s.heroX = 320;
      if (isNaN(s.heroY) || s.heroY < 20 || s.heroY > mapObj.height - 20) s.heroY = 260;
      s.petX = s.heroX - 20;
      s.petY = s.heroY + 4;
    }
  }

  const UIManager = {
    cutsceneQueue: [],
    cutsceneIndex: 0,

    playCutscene: function(cutKey) {
      const scripts = (window.Aetheria.Data.STORY_CUTSCENES && window.Aetheria.Data.STORY_CUTSCENES[cutKey]) || null;
      if (!scripts || scripts.length === 0) return;

      this.cutsceneQueue = scripts;
      this.cutsceneIndex = 0;
      this.renderCurrentCutsceneSlide();
      const modal = document.getElementById("story-cutscene-modal");
      if (modal) modal.style.display = "flex";
    },

    renderCurrentCutsceneSlide: function() {
      const slide = this.cutsceneQueue[this.cutsceneIndex];
      if (!slide) return;
      document.getElementById("story-tag").innerText = slide.tag || "古文明記憶共鳴";
      document.getElementById("story-speaker").innerText = slide.speaker || "";
      document.getElementById("story-content").innerText = slide.text || "";
      const nextBtn = document.getElementById("story-btn-next");
      if (nextBtn) {
        nextBtn.innerText = (this.cutsceneIndex < this.cutsceneQueue.length - 1) ? "繼續 ▸" : "展開行動 ✓";
      }
    },

    advanceCutscene: function() {
      window.Aetheria.Audio.sfxTalkBlip();
      this.cutsceneIndex++;
      if (this.cutsceneIndex < this.cutsceneQueue.length) {
        this.renderCurrentCutsceneSlide();
      } else {
        const modal = document.getElementById("story-cutscene-modal");
        if (modal) modal.style.display = "none";
      }
    },

    decorateNavIcons: function() {
      try {
        const S = window.Aetheria.Data.Sprites;
        if (!S || !S.iconHtml) return;

        const mapBtn   = document.getElementById("nav-btn-map");
        const guildBtn = document.getElementById("nav-btn-guild");
        const forgeBtn = document.getElementById("nav-btn-forge");
        const bagBtn   = document.getElementById("nav-btn-bag");
        const jobBtn   = document.getElementById("nav-btn-job");
        const setBtn   = document.getElementById("nav-btn-set");
        const bombBtn  = document.getElementById("btn-use-bomb");

        if (mapBtn)   mapBtn.innerHTML   = S.iconHtml("icon_map") + "傳送";
        if (guildBtn) guildBtn.innerHTML = S.iconHtml("icon_shield") + "公會";
        if (forgeBtn) forgeBtn.innerHTML = S.iconHtml("icon_forge") + "鍛造";
        if (bagBtn)   bagBtn.innerHTML   = S.iconHtml("icon_bag") + "背包";
        if (jobBtn)   jobBtn.innerHTML   = S.iconHtml("icon_sword") + "職/寵";
        if (setBtn)   setBtn.innerHTML   = S.iconHtml("icon_gear") + "設定";
        if (bombBtn)  bombBtn.innerHTML  = S.iconHtml("icon_bomb") + "炸彈";
      } catch (e) {}
    },

    initTitleScreen: function() {
      try {
        const Sprites = window.Aetheria.Data.Sprites;
        const previewBox = document.getElementById("title-hero-preview");
        if (previewBox && Sprites) {
          previewBox.innerHTML =
            '<img src="' + Sprites.getDataURL("pet_slime") + '" alt="Slime">' +
            '<img src="' + Sprites.getDataURL("hero_down_0") + '" style="width:72px;height:72px;" alt="Hero">' +
            '<img src="' + Sprites.getDataURL("pet_dragon") + '" alt="Dragon">';
        }

        const hasSave = window.Aetheria.State.hasExistingSave();
        const btnCont = document.getElementById("btn-continue-game");
        const infoEl = document.getElementById("continue-save-info");

        if (hasSave) {
          const sum = window.Aetheria.State.getSaveSummary();
          const mapObj = window.Aetheria.Data.Maps.getMap(sum.zone);
          if (btnCont) btnCont.classList.remove("disabled");
          if (infoEl) infoEl.innerText = "存檔：Lv." + sum.lv + "｜公會 " + sum.guildRank + " 級｜位於【" + mapObj.name + "】";
        } else {
          if (btnCont) btnCont.classList.add("disabled");
          if (infoEl) infoEl.innerText = "尚無存檔紀錄，請選擇「新遊戲」";
        }
      } catch (e) {}
    },

    continueGame: function() {
      if (!window.Aetheria.State.hasExistingSave()) return;
      window.Aetheria.State.init();
      sanitizePlayerPosition();
      window.Aetheria.State.save();

      if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;

      const titleEl = document.getElementById("title-screen");
      if (titleEl) titleEl.style.display = "none";

      this.decorateNavIcons();
      const mapObj = window.Aetheria.Data.Maps.getMap(window.Aetheria.State.data.currentZone);
      window.Aetheria.Audio.playBgm(mapObj.bgm || "forest");
      this.updateAllHud();
      if (window.Aetheria.Renderer) window.Aetheria.Renderer.renderWorld();
      this.showToast("歡迎回來！當前位於【" + mapObj.name + "】");
    },

    startNewGame: function() {
      if (window.Aetheria.State.hasExistingSave()) {
        if (!confirm("開啟「新遊戲」將會覆蓋現有存檔進度，確定要重新開始嗎？")) return;
      }
      window.Aetheria.State.startFreshNewGame();
      sanitizePlayerPosition();
      window.Aetheria.Data.Maps.refreshAllResources();
      if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;

      const titleEl = document.getElementById("title-screen");
      if (titleEl) titleEl.style.display = "none";

      this.decorateNavIcons();
      window.Aetheria.Audio.playBgm("forest");
      this.updateAllHud();
      if (window.Aetheria.Renderer) window.Aetheria.Renderer.renderWorld();

      window.Aetheria.State.data.seenCutscenes.intro = true;
      window.Aetheria.State.save();
      this.playCutscene("intro");
    },

    setActivePanel: function(panelId) {
      document.querySelectorAll(".sub-panel").forEach(function(p) {
        p.classList.remove("active");
      });
      const target = document.getElementById(panelId);
      if (target) target.classList.add("active");
    },

    closePanelToExplore: function() {
      this.setActivePanel("panel-explore");
      this.updateAllHud();
    },

    showToast: function(msg) {
      const t = document.getElementById("toast-banner");
      if (!t) return;
      t.innerText = cleanText(msg);
      t.style.display = "block";
      clearTimeout(t._timer);
      t._timer = setTimeout(function() { t.style.display = "none"; }, 2900);
    },

    spawnFloatingText: function(text, color, onEnemy) {
      const stage = document.getElementById("upper-screen");
      if (!stage) return;
      const el = document.createElement("div");
      el.className = "floating-text";
      el.style.color = color || "#ffffff";
      el.style.left = (onEnemy !== false) ? "58%" : "14%";
      el.style.top = "44%";
      el.innerText = cleanText(text);
      stage.appendChild(el);
      setTimeout(function() { el.remove(); }, 880);
    },

    updateAllHud: function() {
      window.Aetheria.State.recalcMaxHp();
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const jobs = window.Aetheria.Data.JOBS;
      const weapons = window.Aetheria.Data.WEAPONS;
      const materials = window.Aetheria.Data.MATERIALS;

      const jobName = jobs[s.currentJob] ? cleanText(jobs[s.currentJob].name) : "蒼藍劍士";

      const lvEl = document.getElementById("hud-lv");
      if (lvEl) {
        lvEl.innerHTML = S.iconHtml("icon_sword") + "Lv." + s.lv + " " + jobName + " (DEF " + window.Aetheria.State.getTotalDef() + ")";
      }

      const mealEl = document.getElementById("hud-meal");
      if (mealEl) {
        if (s.activeMeal && s.activeMeal.battlesLeft > 0 && window.Aetheria.Data.CAMP_MEALS[s.activeMeal.id]) {
          const mObj = window.Aetheria.Data.CAMP_MEALS[s.activeMeal.id];
          mealEl.style.display = "inline-block";
          mealEl.innerText = mObj.name.slice(0, 4) + "(" + s.activeMeal.battlesLeft + "戰)";
        } else {
          mealEl.style.display = "none";
        }
      }

      const questEl = document.getElementById("hud-quest");
      if (questEl) {
        const mq = window.Aetheria.Data.getCurrentMainQuest(s);
        if (mq) {
          const done = mq.checkComplete(s);
          questEl.innerHTML = done
            ? S.iconHtml("icon_scroll") + "<b>主線達成：" + cleanText(mq.title) + " (點【公會】領獎)</b>"
            : S.iconHtml("icon_scroll") + "[" + mq.chapter + "] " + cleanText(mq.title);
        } else {
          questEl.innerHTML = S.iconHtml("icon_scroll") + "21章主線全破！無盡試煉之塔最高：第 " + s.maxTowerFloor + " 層";
        }
      }

      const pinBox = document.getElementById("pinned-recipe");
      if (pinBox) {
        const pinWep = weapons[s.pinnedRecipe] || weapons.w_vine;
        const costParts = [];
        for (const [k, req] of Object.entries(pinWep.cost || {})) {
          const m = materials[k] || { name: k };
          costParts.push(m.name.slice(0, 3) + " " + (s.inventory[k] || 0) + "/" + req);
        }
        const lvTag = pinWep.reqLv ? " [需Lv." + pinWep.reqLv + "]" : "";
        pinBox.innerHTML = S.iconHtml("icon_forge") + "目標：<b>" + cleanText(pinWep.name) + "</b>" + lvTag + " (" + (costParts.join("｜") || "已擁有") + ")";
      }

      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
      this.updateHudZoneDynamic(mapObj, s);
    },

    updateHudZoneDynamic: function(mapObj, s) {
      const zoneBadge = document.getElementById("hud-zone");
      if (!zoneBadge || !mapObj) return;

      const effLv = mapObj.recLv || 1;
      const diff = effLv - s.lv;

      if (mapObj.id === "camp_hub" || mapObj.id === "tent_guild" || mapObj.id === "tent_forge") {
        zoneBadge.className = "na-badge danger-safe";
        zoneBadge.innerText = mapObj.name;
      } else if (diff <= 2) {
        zoneBadge.className = "na-badge danger-safe";
        zoneBadge.innerText = mapObj.name + " (Lv." + effLv + ")";
      } else if (diff <= 6) {
        zoneBadge.className = "na-badge danger-warn";
        zoneBadge.innerText = mapObj.name + " (Lv." + effLv + ")";
      } else {
        zoneBadge.className = "na-badge danger-deadly";
        zoneBadge.innerText = mapObj.name + " (高危 Lv." + effLv + ")";
      }
    },

    // ================= 0. 營地燉肉鍋「行前料理 & 免費回血」選單 =================
    openCookingModal: function() {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const inv = s.inventory;
      const Helper = window.Aetheria.Data.CraftingHelper;

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_potion") + "營地燉肉鍋：行前料理與休整";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const healCard = document.createElement("div");
      healCard.className = "sys-card-scroll";
      healCard.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<b>營地熱湯休整 (當前 HP：' + s.hp + '/' + s.maxHp + ')</b>' +
          '<button class="na-btn highlight" style="padding:5px 12px;" onclick="Aetheria.UI.restAtCampPot()">免費回滿生命</button>' +
        '</div>';
      body.appendChild(healCard);

      if (s.activeMeal && s.activeMeal.battlesLeft > 0 && window.Aetheria.Data.CAMP_MEALS[s.activeMeal.id]) {
        const curMeal = window.Aetheria.Data.CAMP_MEALS[s.activeMeal.id];
        const curBox = document.createElement("div");
        curBox.className = "sys-card";
        curBox.style.borderColor = "#5ac54f";
        curBox.innerHTML = '<b style="color:#5ac54f;">當前生效料理：【' + curMeal.name + '】（剩餘 ' + s.activeMeal.battlesLeft + ' 場戰鬥）</b><div style="font-size:12px; color:#cbd5e1; margin-top:2px;">' + curMeal.desc + '</div>';
        body.appendChild(curBox);
      }

      const mealHeader = document.createElement("div");
      mealHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:6px 0 4px; font-size:14px;";
      mealHeader.innerText = "【烹調行前料理】（出征或挑戰守關領主前強烈推薦）";
      body.appendChild(mealHeader);

      Object.values(window.Aetheria.Data.CAMP_MEALS).forEach(function(meal) {
        const canCook = Helper.canAfford(inv, meal.cost);
        const mCard = document.createElement("div");
        mCard.className = "sys-card";
        mCard.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b style="color:var(--na-gold); font-size:15px;">' + S.iconHtml("icon_potion") + meal.name + '</b>' +
            '<button class="na-btn ' + (canCook ? 'highlight' : '') + '" style="padding:5px 12px;" onclick="Aetheria.UI.cookCampMeal(\'' + meal.id + '\')">烹調享用</button>' +
          '</div>' +
          '<div style="font-size:13px; color:#cbd5e1; margin-top:3px;">' + meal.desc + '</div>' +
          '<div style="font-size:12px; margin-top:3px;">食材：' + cleanText(Helper.formatCostText(inv, meal.cost)) + '</div>';
        body.appendChild(mCard);
      });
    },

    restAtCampPot: function() {
      const s = window.Aetheria.State.data;
      window.Aetheria.State.recalcMaxHp();
      s.hp = s.maxHp;
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.openCookingModal();
      this.updateAllHud();
      this.showToast("喝下熱騰騰的營地高湯，生命值已完全恢復！");
    },

    cookCampMeal: function(mealId) {
      const s = window.Aetheria.State.data;
      const meal = window.Aetheria.Data.CAMP_MEALS[mealId];
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!meal || !Helper.payCost(s.inventory, meal.cost)) {
        this.showToast("食材不足！可去森林採集蘑菇/太陽花，或到水波釣魚點玩垂釣小遊戲！");
        return;
      }
      s.activeMeal = { id: meal.id, battlesLeft: meal.battles };
      s.questProgress.cookedOnce = true;
      window.Aetheria.State.recalcMaxHp();
      s.hp = s.maxHp;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.openCookingModal();
      this.updateAllHud();
      this.showToast("享用【" + meal.name + "】！生命全滿並獲得 3 場戰鬥強化 Buff！");
    },

    // ================= 1. NPC 對話與旅人指令 (改用純 <img> 像素頭像，零 Canvas) =================
    openNpcDialogue: function(npcId) {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const npc = window.Aetheria.Data.NPCS_DB[npcId] || window.Aetheria.Data.NPCS_DB.npc_smith;

      if (npcId === "npc_smith") {
        s.questProgress.mq_01_talked = true;
        window.Aetheria.State.save();
        this.updateAllHud();
      }

      this.setActivePanel("panel-dialogue");
      document.getElementById("npc-name-label").innerText = cleanText(npc.name);
      document.getElementById("npc-role-label").innerText = cleanText(npc.role);
      document.getElementById("npc-speech-text").innerText = npc.greeting;

      const portImg = document.getElementById("npc-portrait-img");
      if (portImg) {
        portImg.src = S.getDataURL(npc.sprite);
      }

      const btnGrid = document.getElementById("npc-action-buttons");
      btnGrid.innerHTML = "";

      const self = this;
      const srvBtn = document.createElement("button");
      srvBtn.className = "na-btn highlight";
      srvBtn.style.gridColumn = "span 2";
      srvBtn.style.padding = "9px";
      srvBtn.innerHTML = S.iconHtml("icon_forge") + cleanText(npc.serviceLabel);
      srvBtn.onclick = function() {
        if (npc.serviceAction === "openMonolithModal") self.openGuildModal("monolith");
        else if (npc.serviceAction === "openMerchantShop") self.openForgeModal("alchemy");
        else if (self[npc.serviceAction]) self[npc.serviceAction]();
      };
      btnGrid.appendChild(srvBtn);

      (npc.pathActions || []).forEach(function(pa) {
        const alreadyDone = Boolean(pa.onceKey && s.questProgress && s.questProgress[pa.onceKey]);
        const btn = document.createElement("button");
        btn.className = "na-btn";
        btn.style.textAlign = "left";
        btn.style.padding = "8px";

        if (alreadyDone) {
          btn.style.opacity = "0.5";
          btn.style.pointerEvents = "none";
          btn.innerHTML = '<div style="color:#8d99ae; font-size:14px;">[已完成] ' + cleanText(pa.label) + '</div><div style="font-size:12px; color:#8d99ae; margin-top:2px;">已領取過此項旅人獎勵</div>';
        } else {
          btn.innerHTML = '<div style="color:var(--na-gold); font-size:14px;">' + S.iconHtml("icon_sword") + cleanText(pa.label) + '</div><div style="font-size:12px; font-weight:normal; color:#cbd5e1; margin-top:2px;">' + cleanText(pa.desc) + '</div>';
          btn.onclick = function() {
            if (pa.type === "spar") {
              window.Aetheria.Battle.pathActionRef = { action: pa, npc: npc };
              window.Aetheria.Battle.startBattle(pa.enemyConfig, "combat");
            } else {
              window.Aetheria.Battle.startPathActionChallenge(pa, npc);
            }
          };
        }
        btnGrid.appendChild(btn);
      });
    },

    openMerchantShop: function() {
      this.openForgeModal("alchemy");
    },

    openMonolithModal: function() {
      this.openGuildModal("monolith");
    },

    // ================= 2. 傳送陣 (點擊傳送或刷新時 100% 重生所有高階礦脈、巨石與枯木) =================
    openWorldMapModal: function() {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const unlockedList = s.unlockedZones || ["camp_hub"];

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_map") + "大陸傳送陣 (已解鎖：" + unlockedList.length + "/" + window.Aetheria.Data.Maps.ORDERED_WORLD_ZONES.length + " 區)";

      const body = document.getElementById("modal-body");
      body.innerHTML = '<div style="margin-bottom:6px; color:#cbd5e1; font-size:13px;">解開各區雙封印柱、擊敗守關領主並踏入下一區，即可點亮傳送石碑：</div>';

      window.Aetheria.Data.Maps.ORDERED_WORLD_ZONES.forEach(function(z) {
        const isUnlocked = unlockedList.indexOf(z.id) !== -1;
        const isCurrent = (s.currentZone === z.id);
        const card = document.createElement("div");
        card.className = isUnlocked ? "sys-card-scroll" : "sys-card";

        if (isUnlocked) {
          card.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="font-size:15px;">' + S.iconHtml("icon_map") + z.name + '</b>' +
              '<button class="na-btn highlight" style="padding:5px 12px;" onclick="Aetheria.UI.teleportToZone(\'' + z.id + '\', ' + z.x + ', ' + z.y + ')">' + (isCurrent ? "刷新全區資源" : "傳送") + '</button>' +
            '</div>' +
            '<div style="font-size:12px; margin-top:2px;">' + z.desc + '</div>';
        } else {
          card.style.opacity = "0.5";
          card.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="color:#8d99ae; font-size:14px;">[封印中] ' + z.name + '</b>' +
              '<span style="font-size:12px; color:#ff595e; font-weight:bold;">需破除前區領主封印</span>' +
            '</div>';
        }
        body.appendChild(card);
      });
    },

    teleportToZone: function(zoneId, tx, ty) {
      const s = window.Aetheria.State.data;
      if ((s.unlockedZones || []).indexOf(zoneId) === -1) {
        this.showToast("尚未解封此區域，無法直接傳送！");
        return;
      }
      window.Aetheria.Data.Maps.refreshAllResources();
      if (zoneId === "endless_tower") {
        window.Aetheria.Data.Maps.advanceTowerFloor(s.maxTowerFloor || 1);
      }
      if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;

      s.currentZone = zoneId;
      s.heroX = tx;
      s.heroY = ty;
      s.petX = tx - 20;
      s.petY = ty + 6;
      window.Aetheria.State.save();

      const mapObj = window.Aetheria.Data.Maps.getMap(zoneId);
      window.Aetheria.Audio.playBgm(mapObj.bgm || "forest");
      this.closePanelToExplore();
      this.showToast("已傳送至【" + mapObj.name + "】（所有高階礦脈、釣魚點與巨石已刷新）！");
    },

    // ================= 3. 冒險者公會與古文明聖碑大廳 =================
    openGuildModal: function(activeTab) {
      activeTab = activeTab || "quest";
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const self = this;
      if (!Array.isArray(s.activeBounties)) s.activeBounties = [];
      if (!Array.isArray(s.claimedRankSupplies)) s.claimedRankSupplies = [];
      if (!s.bountyCooldowns) s.bountyCooldowns = {};

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_shield") + "冒險者公會 & 聖碑祭壇 (" + s.guildRank + "級｜" + s.guildPoints + "pt)";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const tabBar = document.createElement("div");
      tabBar.style.cssText = "display:grid; grid-template-columns:repeat(3, 1fr); gap:5px; margin-bottom:8px;";
      [
        { id: "quest",    label: "21章主線",   icon: "icon_scroll" },
        { id: "bounty",   label: "公會懸賞",   icon: "icon_sword" },
        { id: "monolith", label: "古文明聖碑", icon: "icon_shield" }
      ].forEach(function(t) {
        const b = document.createElement("button");
        b.className = "na-btn" + (activeTab === t.id ? " highlight" : "");
        b.innerHTML = S.iconHtml(t.icon) + t.label;
        b.onclick = function() { self.openGuildModal(t.id); };
        tabBar.appendChild(b);
      });
      body.appendChild(tabBar);

      if (activeTab === "quest") {
        const rankAlreadyClaimed = s.claimedRankSupplies.indexOf(s.guildRank) !== -1;
        const ghLv = s.campBuildings.greenhouse || 0;

        const topBar = document.createElement("div");
        topBar.style.cssText = "display:flex; gap:6px; margin-bottom:8px;";
        topBar.innerHTML =
          (rankAlreadyClaimed
            ? '<button class="na-btn" style="flex:1; padding:7px; opacity:0.5; pointer-events:none;">' + s.guildRank + '級俸祿已領 (升階再領)</button>'
            : '<button class="na-btn highlight" style="flex:1; padding:7px;" onclick="Aetheria.UI.claimGuildSupply()">' + S.iconHtml("icon_coin") + '領取 ' + s.guildRank + ' 級晉升俸祿</button>') +
          (ghLv === 0
            ? '<button class="na-btn" style="padding:7px 10px;" onclick="Aetheria.UI.buildGreenhouse()">建溫室(木2鐵2)</button>'
            : '<span class="na-badge" style="display:flex;align-items:center;">溫室運作中</span>');
        body.appendChild(topBar);

        const mq = window.Aetheria.Data.getCurrentMainQuest(s);
        if (mq) {
          const isDone = mq.checkComplete(s);
          const mqCard = document.createElement("div");
          mqCard.className = "sys-card-scroll";
          mqCard.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="color:#8f563b; font-size:15px;">' + S.iconHtml("icon_scroll") + '[' + mq.chapter + '] ' + cleanText(mq.title) + '</b>' +
              (isDone ? '<button class="na-btn highlight" style="padding:5px 12px;" onclick="Aetheria.UI.claimMainQuest(\'' + mq.id + '\')">領取獎勵</button>' : '<span style="font-size:12px;color:#5c3824;font-weight:bold;">進行中</span>') +
            '</div>' +
            '<div style="font-size:13px; margin:4px 0;">' + cleanText(mq.desc) + '</div>' +
            '<div style="font-size:13px; color:#1d5eb8; font-weight:bold;">獎勵：' + cleanText(mq.rewardText) + '</div>';
          body.appendChild(mqCard);
        }

        const listHeader = document.createElement("div");
        listHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:8px 0 4px; font-size:13px;";
        listHeader.innerText = "【七大章節主線進度總覽】";
        body.appendChild(listHeader);

        window.Aetheria.Data.MAIN_QUESTS.forEach(function(q) {
          const claimed = Boolean(s.questProgress["claimed_" + q.id]);
          const row = document.createElement("div");
          row.className = "sys-card";
          row.style.opacity = claimed ? "0.6" : "1";
          row.style.padding = "5px 8px";
          row.innerHTML =
            '<div style="display:flex; justify-content:space-between; font-size:13px;">' +
              '<span><b>[' + q.chapter + ']</b> ' + cleanText(q.title) + '</span>' +
              '<span style="color:' + (claimed ? '#5ac54f' : '#8d99ae') + '; font-weight:bold;">' + (claimed ? '✓ 已完成' : '待推進') + '</span>' +
            '</div>';
          body.appendChild(row);
        });
      }

      else if (activeTab === "bounty") {
        const activeHeader = document.createElement("div");
        activeHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:2px 0 4px; font-size:14px;";
        activeHeader.innerHTML = S.iconHtml("icon_sword") + "進行中委託 (" + s.activeBounties.length + "/" + MAX_ACTIVE_BOUNTIES + ")";
        body.appendChild(activeHeader);

        const Helper = window.Aetheria.Data.CraftingHelper;

        if (s.activeBounties.length === 0) {
          const emptyCard = document.createElement("div");
          emptyCard.className = "sys-card";
          emptyCard.style.cssText = "color:#cbd5e1; font-size:13px; padding:6px 10px;";
          emptyCard.innerText = "尚未接取委託，請由下方懸賞板接單。";
          body.appendChild(emptyCard);
        } else {
          s.activeBounties.forEach(function(bId) {
            if (bId === "bounty_wrong_shadow") {
              const kills = s.wrongBountyKills || 0;
              const canClaimWrong = (kills >= 2);
              const sCard = document.createElement("div");
              sCard.className = "sys-card-scroll";
              sCard.innerHTML =
                '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                  '<b>[錯題懸賞] 討伐暗影幻象 (進度: ' + kills + '/2 隻)</b>' +
                  '<div style="display:flex; gap:4px;">' +
                    (!canClaimWrong
                      ? '<button class="na-btn highlight" style="padding:4px 8px;" onclick="Aetheria.UI.huntWrongQuestion()">出擊討伐</button>'
                      : '<button class="na-btn highlight" style="padding:4px 8px;" onclick="Aetheria.UI.deliverWrongBounty()">交付領獎</button>') +
                    '<button class="na-btn" style="padding:4px 6px;" onclick="Aetheria.UI.abandonBounty(\'bounty_wrong_shadow\')">放棄</button>' +
                  '</div>' +
                '</div>' +
                '<div style="font-size:12px; color:#1d5eb8; font-weight:bold; margin-top:2px;">需實際擊敗 2 隻錯題幻象才可交付 ｜ 報酬：流沙秘銀 x2、聲望 +35</div>';
              body.appendChild(sCard);
              return;
            }

            const b = window.Aetheria.Data.GUILD_BOUNTIES.find(function(item) { return item.id === bId; });
            if (!b) return;
            const canDeliver = Helper.canAfford(s.inventory, b.cost);

            const aCard = document.createElement("div");
            aCard.className = "sys-card-scroll";
            aCard.innerHTML =
              '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<b>' + cleanText(b.title) + '</b>' +
                '<div style="display:flex; gap:4px;">' +
                  '<button class="na-btn ' + (canDeliver ? 'highlight' : '') + '" style="padding:4px 8px;" onclick="Aetheria.UI.deliverGuildBounty(\'' + b.id + '\')">' + (canDeliver ? '交付' : '未齊') + '</button>' +
                  '<button class="na-btn" style="padding:4px 6px;" onclick="Aetheria.UI.abandonBounty(\'' + b.id + '\')">放棄</button>' +
                '</div>' +
              '</div>' +
              '<div style="font-size:12px; margin-top:2px;">需求：' + cleanText(Helper.formatCostText(s.inventory, b.cost)) + ' ｜ <span style="color:#1d5eb8;font-weight:bold;">' + cleanText(b.rewardText) + '</span></div>';
            body.appendChild(aCard);
          });
        }

        const boardHeader = document.createElement("div");
        boardHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:8px 0 4px; font-size:14px;";
        boardHeader.innerHTML = S.iconHtml("icon_scroll") + "可接懸賞板（交付後需經 1 場野外戰鬥刷新）";
        body.appendChild(boardHeader);

        if (s.activeBounties.indexOf("bounty_wrong_shadow") === -1) {
          const onCd = Boolean(s.bountyCooldowns.bounty_wrong_shadow);
          const wCard = document.createElement("div");
          wCard.className = "sys-card";
          wCard.style.borderColor = "#9d4edd";
          if (onCd) wCard.style.opacity = "0.5";
          wCard.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="color:#e0aaff;">[錯題懸賞] 討伐 2 隻暗影記憶幻象</b>' +
              (onCd
                ? '<span style="font-size:12px; color:#8d99ae;">需野外實戰 1 場刷新</span>'
                : '<button class="na-btn highlight" style="padding:4px 10px;" onclick="Aetheria.UI.acceptBounty(\'bounty_wrong_shadow\')">接受</button>') +
            '</div>' +
            '<div style="font-size:12px; color:#8ce0ff; margin-top:2px;">報酬：流沙秘銀 x2、聲望 +35</div>';
          body.appendChild(wCard);
        }

        window.Aetheria.Data.GUILD_BOUNTIES.forEach(function(b) {
          if (s.activeBounties.indexOf(b.id) !== -1) return;
          const onCd = Boolean(s.bountyCooldowns[b.id]);
          const bCard = document.createElement("div");
          bCard.className = "sys-card";
          if (onCd) bCard.style.opacity = "0.5";
          bCard.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="color:var(--na-gold);">' + cleanText(b.title) + '</b>' +
              (onCd
                ? '<span style="font-size:12px; color:#8d99ae;">需野外實戰 1 場刷新</span>'
                : '<button class="na-btn highlight" style="padding:4px 10px;" onclick="Aetheria.UI.acceptBounty(\'' + b.id + '\')">接受</button>') +
            '</div>' +
            '<div style="font-size:12px; color:#cbd5e1; margin-top:2px;">需求：' + cleanText(Helper.formatCostText(s.inventory, b.cost)) + ' ｜ <span style="color:#8ce0ff;">' + cleanText(b.rewardText) + '</span></div>';
          body.appendChild(bCard);
        });
      }

      else if (activeTab === "monolith") {
        const shardCount = s.inventory.tabletShard || 0;
        const infoBox = document.createElement("div");
        infoBox.className = "sys-card-scroll";
        infoBox.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b>持有【古文明聖碑殘片】：' + shardCount + ' 枚</b>' +
            '<span style="font-size:12px; color:#5c3824;">答對各科題目 +2點｜獻上殘片 +20點</span>' +
          '</div>';
        body.appendChild(infoBox);

        Object.values(window.Aetheria.Data.MONOLITHS_DB).forEach(function(mono) {
          const pts = (s.monolithPts && s.monolithPts[mono.id]) || 0;
          const card = document.createElement("div");
          card.className = "sys-card";
          card.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="color:var(--na-gold); font-size:15px;">' + S.iconHtml("icon_shield") + mono.name + ' (' + pts + '/100)</b>' +
              (pts < 100
                ? '<button class="na-btn ' + (shardCount > 0 ? 'highlight' : '') + '" style="padding:4px 8px;" onclick="Aetheria.UI.offerTabletShard(\'' + mono.id + '\')">獻上殘片(+20)</button>'
                : '<span style="color:#5ac54f; font-weight:bold;">★完全復甦</span>') +
            '</div>' +
            '<div class="hp-bar-outer" style="margin:5px 0;"><div class="hp-bar-inner" style="background:#38b6ff; width:' + pts + '%;"></div></div>' +
            '<div style="font-size:12px; color:#8ce0ff; font-weight:bold;">永久神恩：' + mono.perks + '</div>' +
            '<div style="font-size:12px; color:#f5e6c4; margin-top:4px; line-height:1.4;">' +
              (pts >= 25 ? mono.lore25 + '<br>' : '<span style="color:#8d99ae;">[共鳴達 25 點解鎖第一卷古文明歷史]</span><br>') +
              (pts >= 50 ? mono.lore50 + '<br>' : '') +
              (pts >= 100 ? '<b style="color:var(--na-gold);">' + mono.lore100 + '</b>' : '') +
            '</div>';
          body.appendChild(card);
        });
      }
    },

    offerTabletShard: function(monoId) {
      const s = window.Aetheria.State.data;
      if ((s.inventory.tabletShard || 0) <= 0) {
        this.showToast("尚未持有【古文明聖碑殘片】！擊敗各區守關領主或秘境紫氣賞金首即可獲得！");
        return;
      }
      if (s.monolithPts[monoId] >= 100) {
        this.showToast("此座聖碑已完全復甦！");
        return;
      }
      s.inventory.tabletShard--;
      s.monolithPts[monoId] = Math.min(100, (s.monolithPts[monoId] || 0) + 20);
      window.Aetheria.State.recalcMaxHp();
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.openGuildModal("monolith");
      this.updateAllHud();
      this.showToast("已獻上聖碑殘片！聖碑共鳴度大幅提升並解鎖了失落歷史！");
    },

    acceptBounty: function(bId) {
      const s = window.Aetheria.State.data;
      if (!Array.isArray(s.activeBounties)) s.activeBounties = [];
      if (s.activeBounties.indexOf(bId) !== -1) return;

      if (s.bountyCooldowns && s.bountyCooldowns[bId]) {
        this.showToast("此委託剛交付過，請先去野外進行 1 場實戰後再接取！");
        return;
      }
      if (s.activeBounties.length >= MAX_ACTIVE_BOUNTIES) {
        this.showToast("最多同時接受 " + MAX_ACTIVE_BOUNTIES + " 張委託！");
        return;
      }
      if (bId === "bounty_wrong_shadow") {
        s.wrongBountyKills = 0;
      }
      s.activeBounties.push(bId);
      window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.State.save();
      this.showToast("已接受委託！（" + s.activeBounties.length + "/" + MAX_ACTIVE_BOUNTIES + "）");
      this.openGuildModal("bounty");
    },

    abandonBounty: function(bId) {
      const s = window.Aetheria.State.data;
      s.activeBounties = (s.activeBounties || []).filter(function(id) { return id !== bId; });
      window.Aetheria.State.save();
      this.showToast("已放棄委託。");
      this.openGuildModal("bounty");
    },

    deliverGuildBounty: function(bountyId) {
      const s = window.Aetheria.State.data;
      if ((s.activeBounties || []).indexOf(bountyId) === -1) return;

      const b = window.Aetheria.Data.GUILD_BOUNTIES.find(function(item) { return item.id === bountyId; });
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!b || !Helper.payCost(s.inventory, b.cost)) {
        this.showToast("物資尚未集齊！請先去野外採集或狩獵。");
        return;
      }
      s.activeBounties = s.activeBounties.filter(function(id) { return id !== bountyId; });
      if (!s.bountyCooldowns) s.bountyCooldowns = {};
      s.bountyCooldowns[bountyId] = true;
      b.onComplete(s);
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast("委託交付成功！獲得：" + cleanText(b.rewardText));
      this.openGuildModal("bounty");
      this.updateAllHud();
    },

    deliverWrongBounty: function() {
      const s = window.Aetheria.State.data;
      if ((s.wrongBountyKills || 0) < 2) {
        this.showToast("尚需擊敗 " + (2 - (s.wrongBountyKills || 0)) + " 隻暗影錯題幻象才可交付！");
        return;
      }
      s.activeBounties = (s.activeBounties || []).filter(function(id) { return id !== "bounty_wrong_shadow"; });
      s.wrongBountyKills = 0;
      if (!s.bountyCooldowns) s.bountyCooldowns = {};
      s.bountyCooldowns.bounty_wrong_shadow = true;
      s.inventory.mithril += 2;
      s.questProgress.bountiesCleared = (s.questProgress.bountiesCleared || 0) + 1;
      window.Aetheria.State.gainRewards(120, 150, 35);
      window.Aetheria.Audio.sfxLevelUp();
      this.showToast("錯題委託完成！獲得【流沙秘銀 x2】與聲望 +35！");
      this.openGuildModal("bounty");
      this.updateAllHud();
    },

    claimGuildSupply: function() {
      const s = window.Aetheria.State.data;
      if (!Array.isArray(s.claimedRankSupplies)) s.claimedRankSupplies = [];

      if (s.claimedRankSupplies.indexOf(s.guildRank) !== -1) {
        this.showToast(s.guildRank + " 級晉升俸祿已經領取過了！");
        return;
      }

      const rankInfo = window.Aetheria.Data.GUILD_RANKS.find(function(r) { return r.rank === s.guildRank; }) || window.Aetheria.Data.GUILD_RANKS[0];
      s.claimedRankSupplies.push(s.guildRank);
      s.inventory.iron += rankInfo.dailyIron;
      s.inventory.potionHint += rankInfo.dailyPotion;
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.showToast("領取【" + rankInfo.name + "】晉升俸祿：藍晶礦 +" + rankInfo.dailyIron + "、洞察藥水 +" + rankInfo.dailyPotion + "！");
      this.openGuildModal("quest");
      this.updateAllHud();
    },

    claimMainQuest: function(mqId) {
      const s = window.Aetheria.State.data;
      const mq = window.Aetheria.Data.MAIN_QUESTS.find(function(q) { return q.id === mqId; });
      if (mq && mq.checkComplete(s) && !s.questProgress["claimed_" + mqId]) {
        s.questProgress["claimed_" + mqId] = true;
        mq.onClaim(s);
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.State.save();
        this.showToast("完成主線【" + cleanText(mq.title) + "】！獲得 " + cleanText(mq.rewardText) + "！");
        this.openGuildModal("quest");
        this.updateAllHud();
      }
    },

    huntWrongQuestion: function() {
      const s = window.Aetheria.State.data;
      const targetQId = (s.wrongBook && s.wrongBook.length > 0) ? s.wrongBook[0] : null;
      window.Aetheria.Battle.startBattle(
        { name: "暗影記憶幻象", lv: Math.max(3, s.lv), type: "skull", isBoss: false, forceShiny: true },
        "bounty",
        targetQId
      );
    },

    buildGreenhouse: function() {
      const s = window.Aetheria.State.data;
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!Helper.payCost(s.inventory, { wood: 2, iron: 2 })) {
        this.showToast("需要【翠風原木 x2】與【藍晶鐵礦 x2】才可建造溫室！");
        return;
      }
      s.campBuildings.greenhouse = 1;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast("煉金藥水溫室建造完成！");
      this.openGuildModal("quest");
    },

    // ================= 4. 鐵匠鋪：5 大分類 Tab =================
    openForgeModal: function(activeTab) {
      activeTab = activeTab || "weapon";
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const inv = s.inventory;
      const Helper = window.Aetheria.Data.CraftingHelper;
      const self = this;

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_forge") + "鐵匠工坊 (Lv." + s.lv + "｜DEF " + window.Aetheria.State.getTotalDef() + "｜" + s.gold + " G)";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const tabBar = document.createElement("div");
      tabBar.className = "tab-bar-5";
      [
        { id: "weapon",  label: "武器" },
        { id: "armor",   label: "防具" },
        { id: "rune",    label: "符文鑲嵌" },
        { id: "tool",    label: "工具" },
        { id: "alchemy", label: "煉金/店" }
      ].forEach(function(t) {
        const b = document.createElement("button");
        b.className = "na-btn" + (activeTab === t.id ? " highlight" : "");
        b.style.fontSize = "12px";
        b.innerText = t.label;
        b.onclick = function() { self.openForgeModal(t.id); };
        tabBar.appendChild(b);
      });
      body.appendChild(tabBar);

      if (activeTab === "weapon") {
        const weaponList = Object.values(window.Aetheria.Data.WEAPONS).sort(function(a, b) { return a.tier - b.tier; });
        let highestOwnedTier = 1;
        weaponList.forEach(function(w) {
          if (s.unlockedWeapons.indexOf(w.id) !== -1 && w.tier > highestOwnedTier) {
            highestOwnedTier = w.tier;
          }
        });

        weaponList.forEach(function(w) {
          const owned = s.unlockedWeapons.indexOf(w.id) !== -1;
          const equipped = (s.equippedWeapon === w.id);

          if (w.tier <= highestOwnedTier + 1) {
            const reqLv = w.reqLv || 1;
            const lvOk = s.lv >= reqLv;
            const matOk = Helper.canAfford(inv, w.cost);
            const canCraft = lvOk && matOk;
            const lvBadge = '<span style="color:' + (lvOk ? '#2d6a4f' : '#c1121f') + '; font-weight:900;">[需Lv.' + reqLv + ']</span> ';

            const card = document.createElement("div");
            card.className = owned ? "sys-card-scroll" : "sys-card";
            card.innerHTML =
              '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<b style="font-size:14px;">' + S.iconHtml("icon_sword") + '[T' + w.tier + '] ' + cleanText(w.name) + ' (+' + w.atk + ' ATK)</b>' +
                '<div style="display:flex; gap:4px;">' +
                  (!owned ? '<button class="na-btn" style="padding:3px 6px;" onclick="Aetheria.UI.pinWeapon(\'' + w.id + '\')">釘選</button>' : '') +
                  (owned
                    ? '<button class="na-btn ' + (equipped ? 'highlight' : '') + '" style="padding:4px 8px;" onclick="Aetheria.UI.equipWeapon(\'' + w.id + '\')">' + (equipped ? '已裝備' : '裝備') + '</button>'
                    : '<button class="na-btn ' + (canCraft ? 'highlight' : '') + '" style="padding:4px 8px;" onclick="Aetheria.UI.craftWeapon(\'' + w.id + '\')">鍛造</button>') +
                '</div>' +
              '</div>' +
              '<div style="font-size:12px; margin-top:2px;">' + cleanText(w.desc) + '</div>' +
              (!owned ? '<div style="font-size:12px; margin-top:2px;">條件：' + lvBadge + cleanText(Helper.formatCostText(inv, w.cost)) + '</div>' : '');
            body.appendChild(card);
          } else if (w.tier === highestOwnedTier + 2) {
            const lockCard = document.createElement("div");
            lockCard.className = "sys-card";
            lockCard.style.opacity = "0.5";
            lockCard.innerHTML = '<b style="font-size:13px;">[T' + w.tier + ' 未解鎖武器] ???</b><div style="font-size:12px; color:#ff595e;">需先完成【T' + (highestOwnedTier + 1) + '】武器鍛造後揭曉。</div>';
            body.appendChild(lockCard);
          }
        });
      }

      else if (activeTab === "armor") {
        const armorList = Object.values(window.Aetheria.Data.ARMORS).sort(function(a, b) { return a.tier - b.tier; });
        let highestArmorTier = 1;
        armorList.forEach(function(a) {
          if (s.unlockedArmors.indexOf(a.id) !== -1 && a.tier > highestArmorTier) {
            highestArmorTier = a.tier;
          }
        });

        armorList.forEach(function(a) {
          const owned = s.unlockedArmors.indexOf(a.id) !== -1;
          const equipped = (s.equippedArmor === a.id);

          if (a.tier <= highestArmorTier + 1) {
            const reqLv = a.reqLv || 1;
            const lvOk = s.lv >= reqLv;
            const matOk = Helper.canAfford(inv, a.cost);
            const canCraft = lvOk && matOk;
            const lvBadge = '<span style="color:' + (lvOk ? '#2d6a4f' : '#c1121f') + '; font-weight:900;">[需Lv.' + reqLv + ']</span> ';

            const card = document.createElement("div");
            card.className = owned ? "sys-card-scroll" : "sys-card";
            card.innerHTML =
              '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<b style="font-size:14px;">' + S.iconHtml("icon_shield") + '[T' + a.tier + '] ' + a.name + ' (DEF+' + a.def + '｜HP+' + a.hpBonus + ')</b>' +
                (owned
                  ? '<button class="na-btn ' + (equipped ? 'highlight' : '') + '" style="padding:4px 8px;" onclick="Aetheria.UI.equipArmor(\'' + a.id + '\')">' + (equipped ? '已穿戴' : '穿戴') + '</button>'
                  : '<button class="na-btn ' + (canCraft ? 'highlight' : '') + '" style="padding:4px 8px;" onclick="Aetheria.UI.craftArmor(\'' + a.id + '\')">鍛造</button>') +
              '</div>' +
              '<div style="font-size:12px; margin-top:2px;">' + a.desc + '</div>' +
              (!owned ? '<div style="font-size:12px; margin-top:2px;">條件：' + lvBadge + cleanText(Helper.formatCostText(inv, a.cost)) + '</div>' : '');
            body.appendChild(card);
          }
        });

        const relHeader = document.createElement("div");
        relHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:8px 0 4px; font-size:13px;";
        relHeader.innerText = "【古文明輔助聖物飾品】";
        body.appendChild(relHeader);

        Object.values(window.Aetheria.Data.RELICS).forEach(function(rel) {
          const owned = s.unlockedRelics && s.unlockedRelics.indexOf(rel.id) !== -1;
          const canCraft = (s.lv >= (rel.reqLv || 1)) && Helper.canAfford(inv, rel.cost);
          const rCard = document.createElement("div");
          rCard.className = owned ? "sys-card-scroll" : "sys-card";
          rCard.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="font-size:14px;">' + rel.name + '</b>' +
              (owned ? '<span style="color:#1d5eb8;font-weight:bold;">已生效</span>' : '<button class="na-btn ' + (canCraft ? 'highlight' : '') + '" style="padding:4px 8px;" onclick="Aetheria.UI.craftRelic(\'' + rel.id + '\')">鍛造</button>') +
            '</div>' +
            '<div style="font-size:12px; margin-top:2px;">' + rel.desc + '</div>' +
            (!owned ? '<div style="font-size:12px; margin-top:2px;">[需Lv.' + rel.reqLv + '] ' + cleanText(Helper.formatCostText(inv, rel.cost)) + '</div>' : '');
          body.appendChild(rCard);
        });
      }

      else if (activeTab === "rune") {
        if (!s.socketedRunes) s.socketedRunes = { weapon: null, armor: null };
        const wRune = s.socketedRunes.weapon ? window.Aetheria.Data.RUNES[s.socketedRunes.weapon] : null;
        const aRune = s.socketedRunes.armor ? window.Aetheria.Data.RUNES[s.socketedRunes.armor] : null;

        const slotBox = document.createElement("div");
        slotBox.className = "sys-card-scroll";
        slotBox.innerHTML =
          '<div style="font-weight:900; color:#7f2b1d; margin-bottom:4px;">當前裝備共鳴符文槽（可隨時免費拆下換裝）</div>' +
          '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">' +
            '<span><b>[武器符文孔]</b>：' + (wRune ? wRune.name + ' (' + wRune.title + ')' : '空置中') + '</span>' +
            (wRune ? '<button class="na-btn" style="padding:2px 8px;" onclick="Aetheria.UI.unsocketRune(\'weapon\')">拆下</button>' : '') +
          '</div>' +
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<span><b>[防具符文孔]</b>：' + (aRune ? aRune.name + ' (' + aRune.title + ')' : '空置中') + '</span>' +
            (aRune ? '<button class="na-btn" style="padding:2px 8px;" onclick="Aetheria.UI.unsocketRune(\'armor\')">拆下</button>' : '') +
          '</div>';
        body.appendChild(slotBox);

        Object.values(window.Aetheria.Data.RUNES).forEach(function(rune) {
          const have = inv[rune.id] || 0;
          const rCard = document.createElement("div");
          rCard.className = "sys-card";
          rCard.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="color:var(--na-gold); font-size:14px;">' + rune.name + ' (持有: ' + have + ')</b>' +
              '<div style="display:flex; gap:4px;">' +
                '<button class="na-btn ' + (have > 0 ? 'highlight' : '') + '" style="padding:3px 7px; font-size:11px;" onclick="Aetheria.UI.socketRune(\'weapon\', \'' + rune.id + '\')">鑲入武器</button>' +
                '<button class="na-btn ' + (have > 0 ? 'highlight' : '') + '" style="padding:3px 7px; font-size:11px;" onclick="Aetheria.UI.socketRune(\'armor\', \'' + rune.id + '\')">鑲入防具</button>' +
              '</div>' +
            '</div>' +
            '<div style="font-size:12px; color:#cbd5e1; margin-top:3px;">' + rune.desc + '</div>';
          body.appendChild(rCard);
        });
      }

      else if (activeTab === "tool") {
        Object.entries(window.Aetheria.Data.TOOLS_UPGRADE).forEach(function(entry) {
          const tKey = entry[0];
          const tDef = entry[1];
          const curLv = s.tools[tKey] || 1;
          const nextLv = curLv + 1;
          const nextData = tDef.levels[nextLv];

          let condHtml = "";
          let canUp = false;
          if (nextData) {
            const reqLv = nextData.reqLv || 1;
            const lvOk = s.lv >= reqLv;
            const matOk = Helper.canAfford(inv, nextData.cost);
            canUp = lvOk && matOk;
            const lvBadge = '<span style="color:' + (lvOk ? '#5ac54f' : '#ff595e') + '; font-weight:900;">[需Lv.' + reqLv + ']</span> ';
            condHtml = '<div style="font-size:12px; color:var(--na-gold); margin-top:3px;">下一階【Lv.' + nextLv + ' ' + nextData.title + '】：' + cleanText(nextData.desc) + '<br>條件：' + lvBadge + cleanText(Helper.formatCostText(inv, nextData.cost)) + '</div>';
          }

          const tCard = document.createElement("div");
          tCard.className = "sys-card";
          tCard.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="font-size:14px;">' + S.iconHtml("icon_forge") + cleanText(tDef.name) + ' Lv.' + curLv + '（' + tDef.levels[curLv].title + '）</b>' +
              (nextData
                ? '<button class="na-btn ' + (canUp ? 'highlight' : '') + '" style="padding:4px 8px;" onclick="Aetheria.UI.upgradeTool(\'' + tKey + '\')">升至 Lv.' + nextLv + '</button>'
                : '<span style="color:#5ac54f; font-weight:bold;">已滿階</span>') +
            '</div>' +
            '<div style="font-size:12px; color:#cbd5e1; margin-top:2px;">當前：' + cleanText(tDef.levels[curLv].desc) + '</div>' +
            condHtml;
          body.appendChild(tCard);
        });
      }

      else if (activeTab === "alchemy") {
        const shopHeader = document.createElement("div");
        shopHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:2px 0 4px; font-size:14px;";
        shopHeader.innerHTML = S.iconHtml("icon_coin") + "行商金幣補給店 (持有：" + s.gold + " G)";
        body.appendChild(shopHeader);

        (window.Aetheria.Data.GOLD_SHOP || []).forEach(function(item) {
          const canBuy = s.gold >= item.goldCost;
          const have = inv[item.toKey] || 0;
          const row = document.createElement("div");
          row.className = "sys-card";
          row.style.display = "flex";
          row.style.justifyContent = "space-between";
          row.style.alignItems = "center";
          row.innerHTML =
            '<div>' +
              '<b style="font-size:14px;">' + S.iconHtml(getItemSpriteKey(item.toKey)) + item.name + '</b>' +
              '<div style="font-size:12px; color:#cbd5e1;">售價：' + item.goldCost + ' G (擁有：' + have + ')</div>' +
            '</div>' +
            '<button class="na-btn ' + (canBuy ? 'highlight' : '') + '" style="padding:4px 10px;" onclick="Aetheria.UI.buyGoldItem(\'' + item.id + '\')">購買</button>';
          body.appendChild(row);
        });

        const alchHeader = document.createElement("div");
        alchHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:8px 0 4px; font-size:14px;";
        alchHeader.innerHTML = S.iconHtml("icon_potion") + "萬能素材提煉爐 (低階合高階)";
        body.appendChild(alchHeader);

        window.Aetheria.Data.ALCHEMY_CONVERSIONS.forEach(function(c) {
          const fromMat = window.Aetheria.Data.MATERIALS[c.fromKey];
          const have = inv[c.fromKey] || 0;
          const row = document.createElement("div");
          row.className = "sys-card";
          row.style.display = "flex";
          row.style.justifyContent = "space-between";
          row.style.alignItems = "center";
          row.innerHTML =
            '<div>' +
              '<b style="font-size:14px;">' + S.iconHtml("icon_potion") + cleanText(c.name) + '</b>' +
              '<div style="font-size:12px; color:#cbd5e1;">消耗：' + fromMat.name + ' (' + have + '/' + c.fromCount + ')</div>' +
            '</div>' +
            '<button class="na-btn ' + (have >= c.fromCount ? 'highlight' : '') + '" style="padding:4px 10px;" onclick="Aetheria.UI.alchemyConvert(\'' + c.id + '\')">提煉</button>';
          body.appendChild(row);
        });
      }
    },

    socketRune: function(slotType, runeId) {
      const s = window.Aetheria.State.data;
      if ((s.inventory[runeId] || 0) <= 0) {
        this.showToast("背包中沒有此顆魔物核心！請先在戰鬥中將魔物打入 BREAK 破防擊殺取得。");
        return;
      }
      if (!s.socketedRunes) s.socketedRunes = { weapon: null, armor: null };
      if (s.socketedRunes[slotType]) {
        const oldKey = s.socketedRunes[slotType];
        s.inventory[oldKey] = (s.inventory[oldKey] || 0) + 1;
      }
      s.inventory[runeId]--;
      s.socketedRunes[slotType] = runeId;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.openForgeModal("rune");
      this.updateAllHud();
      this.showToast("成功鑲嵌【" + window.Aetheria.Data.RUNES[runeId].name + "】！");
    },

    unsocketRune: function(slotType) {
      const s = window.Aetheria.State.data;
      if (!s.socketedRunes || !s.socketedRunes[slotType]) return;
      const oldKey = s.socketedRunes[slotType];
      s.inventory[oldKey] = (s.inventory[oldKey] || 0) + 1;
      s.socketedRunes[slotType] = null;
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.openForgeModal("rune");
      this.updateAllHud();
      this.showToast("已拆下符文並退回背包。");
    },

    craftArmor: function(aId) {
      const s = window.Aetheria.State.data;
      const a = window.Aetheria.Data.ARMORS[aId];
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!a) return;
      if (s.lv < (a.reqLv || 1)) {
        this.showToast("角色等級不足！需達 Lv." + a.reqLv + " 才可鍛造【" + a.name + "】！");
        return;
      }
      if (!Helper.payCost(s.inventory, a.cost)) {
        this.showToast("鍛造防具所需素材或破防核心不足！");
        return;
      }
      s.unlockedArmors.push(aId);
      s.equippedArmor = aId;
      window.Aetheria.State.recalcMaxHp();
      s.hp = s.maxHp;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.openForgeModal("armor");
      this.updateAllHud();
      this.showToast("防具鍛造成功！已穿戴【" + a.name + "】！");
    },

    equipArmor: function(aId) {
      const s = window.Aetheria.State.data;
      if (s.unlockedArmors.indexOf(aId) !== -1) {
        s.equippedArmor = aId;
        window.Aetheria.State.recalcMaxHp();
        window.Aetheria.State.save();
        this.openForgeModal("armor");
        this.updateAllHud();
      }
    },

    buyGoldItem: function(shopId) {
      const s = window.Aetheria.State.data;
      const item = (window.Aetheria.Data.GOLD_SHOP || []).find(function(i) { return i.id === shopId; });
      if (!item) return;
      if (s.gold < item.goldCost) {
        this.showToast("金幣不足！");
        return;
      }
      s.gold -= item.goldCost;
      s.inventory[item.toKey] = (s.inventory[item.toKey] || 0) + item.toCount;
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.showToast("購買成功：" + item.name + "！");
      this.openForgeModal("alchemy");
      this.updateAllHud();
    },

    pinWeapon: function(wId) {
      window.Aetheria.State.data.pinnedRecipe = wId;
      window.Aetheria.State.save();
      this.updateAllHud();
      this.showToast("已釘選至下半屏目標框！");
    },

    craftWeapon: function(wId) {
      const s = window.Aetheria.State.data;
      const w = window.Aetheria.Data.WEAPONS[wId];
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!w) return;
      if (s.lv < (w.reqLv || 1)) {
        this.showToast("角色等級不足！需達 Lv." + w.reqLv + " 才可鍛造【" + cleanText(w.name) + "】！");
        return;
      }
      if (!Helper.payCost(s.inventory, w.cost)) {
        this.showToast("鍛造素材或魔物破防核心不足！");
        return;
      }
      s.unlockedWeapons.push(wId);
      s.equippedWeapon = wId;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast("鍛造成功！已裝備【" + cleanText(w.name) + "】！");
      this.openForgeModal("weapon");
      this.updateAllHud();
    },

    craftRelic: function(rId) {
      const s = window.Aetheria.State.data;
      const rel = window.Aetheria.Data.RELICS[rId];
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!rel) return;
      if (s.lv < (rel.reqLv || 1)) {
        this.showToast("角色等級不足！需達 Lv." + rel.reqLv + "！");
        return;
      }
      if (!Helper.payCost(s.inventory, rel.cost)) {
        this.showToast("鍛造聖物所需素材不足！");
        return;
      }
      if (!s.unlockedRelics) s.unlockedRelics = [];
      s.unlockedRelics.push(rId);
      if (rel.onCraft) rel.onCraft(s);
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast("聖物鍛造成功！【" + cleanText(rel.name) + "】永久生效！");
      this.openForgeModal("armor");
      this.updateAllHud();
    },

    equipWeapon: function(wId) {
      const s = window.Aetheria.State.data;
      if (s.unlockedWeapons.indexOf(wId) !== -1) {
        s.equippedWeapon = wId;
        window.Aetheria.State.save();
        this.openForgeModal("weapon");
        this.updateAllHud();
      }
    },

    upgradeTool: function(toolKey) {
      const s = window.Aetheria.State.data;
      const curLv = s.tools[toolKey] || 1;
      const tDef = window.Aetheria.Data.TOOLS_UPGRADE[toolKey];
      const nextData = tDef && tDef.levels[curLv + 1];
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!nextData) return;
      if (s.lv < (nextData.reqLv || 1)) {
        this.showToast("角色等級不足！需達 Lv." + nextData.reqLv + "！");
        return;
      }
      if (!Helper.payCost(s.inventory, nextData.cost)) {
        this.showToast("升級工具所需素材不足！");
        return;
      }
      s.tools[toolKey] = curLv + 1;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast(cleanText(tDef.name) + " 已升級為【Lv." + (curLv + 1) + " " + nextData.title + "】！");
      this.openForgeModal("tool");
    },

    alchemyConvert: function(convId) {
      const s = window.Aetheria.State.data;
      const conv = window.Aetheria.Data.ALCHEMY_CONVERSIONS.find(function(c) { return c.id === convId; });
      if (!conv || (s.inventory[conv.fromKey] || 0) < conv.fromCount) {
        this.showToast("原料數量不足！");
        return;
      }
      s.inventory[conv.fromKey] -= conv.fromCount;
      s.inventory[conv.toKey] = (s.inventory[conv.toKey] || 0) + conv.toCount;
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.showToast("煉金成功：" + cleanText(conv.name) + "！");
      this.openForgeModal("alchemy");
      this.updateAllHud();
    },

    // ================= 5. 獨立「背包 (Bag)」頁面 =================
    openBagModal: function(selectedKey) {
      selectedKey = selectedKey || "iron";
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const inv = s.inventory;
      const mats = window.Aetheria.Data.MATERIALS;
      const self = this;

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_bag") + "冒險者背包 (金幣：" + s.gold + " G｜HP：" + s.hp + "/" + s.maxHp + ")";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const selMat = mats[selectedKey] || mats.iron;
      const selCount = inv[selectedKey] || 0;
      const selSpKey = getItemSpriteKey(selectedKey);

      const detailBox = document.createElement("div");
      detailBox.className = "sys-card-scroll";
      detailBox.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<b style="font-size:15px;">' + S.iconHtml(selSpKey, true) + '【' + selMat.name + '】 (持有：' + selCount + ')</b>' +
          (selectedKey === "potionHeal" && selCount > 0
            ? '<button class="na-btn highlight" style="padding:4px 10px;" onclick="Aetheria.UI.useBagHealPotion()">飲用回復</button>'
            : '<span style="font-size:12px; color:#5c3824; font-weight:bold;">Tier ' + selMat.tier + '</span>') +
        '</div>' +
        '<div style="font-size:13px; margin-top:3px;">' + selMat.desc + '</div>';
      body.appendChild(detailBox);

      const grid = document.createElement("div");
      grid.className = "bag-grid";

      Object.keys(mats).forEach(function(k) {
        const m = mats[k];
        const count = inv[k] || 0;
        const spKey = getItemSpriteKey(k);
        const slot = document.createElement("div");
        slot.className = "bag-slot" + (k === selectedKey ? " active" : "");
        slot.style.opacity = count > 0 ? "1" : "0.42";
        slot.innerHTML =
          '<div>' + S.iconHtml(spKey, true) + '</div>' +
          '<div class="bag-slot-name">' + m.name + '</div>' +
          '<div class="bag-slot-count">x' + count + '</div>';
        slot.onclick = function() { self.openBagModal(k); };
        grid.appendChild(slot);
      });

      body.appendChild(grid);
    },

    useBagHealPotion: function() {
      const s = window.Aetheria.State.data;
      if ((s.inventory.potionHeal || 0) <= 0) return;
      if (s.hp >= s.maxHp) {
        this.showToast("生命值已滿！");
        return;
      }
      s.inventory.potionHeal--;
      const sciPts = (s.monolithPts && s.monolithPts.science) || 0;
      const healVal = (sciPts >= 25) ? 140 : 70;
      s.hp = Math.min(s.maxHp, s.hp + healVal);
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.updateAllHud();
      this.openBagModal("potionHeal");
      this.showToast("飲用生命藥水，回復 " + healVal + " 點生命！");
    },

    // ================= 6. 職業與戰寵頁面 =================
    openJobPetModal: function() {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_sword") + "職業祠堂 & 戰寵牧場";

      const body = document.getElementById("modal-body");
      body.innerHTML = '<div style="color:var(--na-gold); font-weight:900; margin-bottom:4px; font-size:14px;">同行戰寵（荒野獵人可雙寵同行並疊加雙寵技能）</div>';

      Object.values(window.Aetheria.Data.PETS).forEach(function(p) {
        const unlocked = s.unlockedPets.indexOf(p.id) !== -1;
        const isActive = (s.activePet === p.id);
        const isShiny = s.shinyPets && s.shinyPets.indexOf(p.id) !== -1;
        const spKey = isShiny ? p.shinySpriteKey : p.spriteKey;

        const pCard = document.createElement("div");
        pCard.className = unlocked ? "sys-card-scroll" : "sys-card";
        pCard.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b style="font-size:15px;">' + S.iconHtml(spKey, true) + (isShiny ? '[閃光] ' : '') + cleanText(p.name) + '</b>' +
            (unlocked
              ? '<button class="na-btn ' + (isActive ? 'highlight' : '') + '" style="padding:4px 10px;" onclick="Aetheria.UI.selectPet(\'' + p.id + '\')">' + (isActive ? '同行中' : '攜帶') + '</button>'
              : '<button class="na-btn" style="padding:4px 10px;" onclick="Aetheria.UI.quickUnlockPet(\'' + p.id + '\')">誘餌果x2 契約</button>') +
          '</div>' +
          '<div style="font-size:12px; margin-top:3px;">' + p.skillName + '：' + p.skillDesc + '</div>';
        body.appendChild(pCard);
      });

      const jobHeader = document.createElement("div");
      jobHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:8px 0 4px; font-size:14px;";
      jobHeader.innerText = "六大古文明職業";
      body.appendChild(jobHeader);

      Object.values(window.Aetheria.Data.JOBS).forEach(function(j) {
        const unlocked = s.unlockedJobs.indexOf(j.id) !== -1 || s.lv >= j.unlockLv;
        const active = (s.currentJob === j.id);

        const jCard = document.createElement("div");
        jCard.className = unlocked ? "sys-card-scroll" : "sys-card";
        jCard.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b style="font-size:15px;">' + S.iconHtml("icon_sword") + cleanText(j.name) + ' (ATK x' + j.atkMult + ')</b>' +
            (unlocked
              ? '<button class="na-btn ' + (active ? 'highlight' : '') + '" style="padding:4px 10px;" onclick="Aetheria.UI.selectJob(\'' + j.id + '\')">' + (active ? '當前職業' : '轉職') + '</button>'
              : '<span style="font-size:12px; color:#ff595e; font-weight:bold;">Lv.' + j.unlockLv + ' 解鎖</span>') +
          '</div>' +
          '<div style="font-size:12px; margin-top:3px;">' + j.passiveDesc + '</div>';
        body.appendChild(jCard);
      });
    },

    selectPet: function(petId) {
      const s = window.Aetheria.State.data;
      if (s.unlockedPets.indexOf(petId) !== -1) {
        s.activePet = petId;
        window.Aetheria.Audio.sfxGather();
        window.Aetheria.State.save();
        this.openJobPetModal();
        this.updateAllHud();
      }
    },

    quickUnlockPet: function(petId) {
      const s = window.Aetheria.State.data;
      if ((s.inventory.tameFruit || 0) < 2) {
        this.showToast("需要 2 顆【靈獸誘餌果】！");
        return;
      }
      s.inventory.tameFruit -= 2;
      if (s.unlockedPets.indexOf(petId) === -1) s.unlockedPets.push(petId);
      s.activePet = petId;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast("成功締結戰寵契約！");
      this.openJobPetModal();
      this.updateAllHud();
    },

    selectJob: function(jobId) {
      const s = window.Aetheria.State.data;
      const j = window.Aetheria.Data.JOBS[jobId];
      if (!j) return;
      if (s.lv < j.unlockLv && s.unlockedJobs.indexOf(jobId) === -1) {
        this.showToast("需達到 Lv." + j.unlockLv + " 才可轉職！");
        return;
      }
      if (s.unlockedJobs.indexOf(jobId) === -1) s.unlockedJobs.push(jobId);
      s.currentJob = jobId;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast("已轉職為【" + cleanText(j.name) + "】！");
      this.openJobPetModal();
      this.updateAllHud();
    },

    // ================= 7. 獨立「設定 (Settings)」頁面 =================
    openSettingsModal: function(tab) {
      tab = tab || "astrolabe";
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const self = this;

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_gear") + "系統設定";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const tabBar = document.createElement("div");
      tabBar.className = "tab-bar";
      [
        { id: "astrolabe", label: "星象調頻" },
        { id: "preview",   label: "題型預覽" },
        { id: "report",    label: "四科報告" },
        { id: "system",    label: "存檔/重置" }
      ].forEach(function(t) {
        const b = document.createElement("button");
        b.className = "na-btn" + (tab === t.id ? " highlight" : "");
        b.innerText = t.label;
        b.onclick = function() { self.openSettingsModal(t.id); };
        tabBar.appendChild(b);
      });
      body.appendChild(tabBar);

      if (tab === "astrolabe") {
        const subjects = [
          { key: "chinese",    name: "中文科（字詞四選一、例句拼字）" },
          { key: "english",    name: "英文科（全盲鍵盤串字、例句四選一）" },
          { key: "science",    name: "科學科（看圖填充、情境推理、簡答）" },
          { key: "humanities", name: "人文科（左右連線配對、地形圖題）" }
        ];
        subjects.forEach(function(sub) {
          const on = Boolean(s.activeSubjects[sub.key]);
          const row = document.createElement("div");
          row.className = "sys-card";
          row.style.display = "flex";
          row.style.justifyContent = "space-between";
          row.style.alignItems = "center";
          row.innerHTML =
            '<span style="font-size:14px;">' + S.iconHtml("icon_scroll") + sub.name + '</span>' +
            '<button class="na-btn ' + (on ? 'highlight' : '') + '" style="padding:5px 10px;" onclick="Aetheria.UI.toggleSubject(\'' + sub.key + '\')">' + (on ? '已啟用' : '未啟用') + '</button>';
          body.appendChild(row);
        });
      }

      else if (tab === "preview") {
        window.Aetheria.QuizBridge.getAllQuestions().forEach(function(q, idx) {
          const btn = document.createElement("button");
          btn.className = "na-btn";
          btn.style.cssText = "width:100%; text-align:left; padding:8px 10px; margin-bottom:5px; font-size:14px;";
          btn.innerHTML = S.iconHtml("icon_scroll") + (idx + 1) + ". <b>[" + cleanText(q.subjectLabel) + "]</b> — " + cleanText(q.typeLabel);
          btn.onclick = function() {
            window.Aetheria.Battle.startBattle(null, "combat", q.id);
          };
          body.appendChild(btn);
        });
      }

      else if (tab === "report") {
        const allQ = window.Aetheria.QuizBridge.getAllQuestions();
        const subjStats = {
          chinese:    { name: "中文科", total: 0, mastered: 0, stars: 0 },
          english:    { name: "英文科", total: 0, mastered: 0, stars: 0 },
          science:    { name: "科學科", total: 0, mastered: 0, stars: 0 },
          humanities: { name: "人文科", total: 0, mastered: 0, stars: 0 }
        };
        allQ.forEach(function(q) {
          const st = subjStats[q.subject];
          if (st) {
            st.total++;
            const m = s.questionMastery && s.questionMastery[q.id];
            if (m && m.stars > 0) { st.mastered++; st.stars += m.stars; }
          }
        });

        const repCard = document.createElement("div");
        repCard.className = "sys-card-scroll";
        repCard.innerHTML =
          '<div style="font-weight:900; margin-bottom:6px; font-size:15px;">四科掌握度報告（最高連勝：' + (s.maxStreak || 0) + ' 題）</div>' +
          Object.values(subjStats).map(function(st) {
            const pct = st.total > 0 ? Math.round((st.mastered / st.total) * 100) : 0;
            return '<div style="display:flex; justify-content:space-between; font-size:14px; margin:4px 0;">' +
              '<span>' + st.name + '：<b>' + st.mastered + '/' + st.total + '</b> (' + pct + '%)</span>' +
              '<span style="color:#8f563b; font-weight:bold;">★' + st.stars + '</span>' +
            '</div>';
          }).join("");
        body.appendChild(repCard);
      }

      else if (tab === "system") {
        const sysCard = document.createElement("div");
        sysCard.className = "sys-card";
        sysCard.innerHTML =
          '<div style="display:flex; flex-direction:column; gap:7px;">' +
            '<button class="na-btn" style="padding:9px;" onclick="Aetheria.Audio.toggleMute(); Aetheria.UI.showToast(\'已切換音樂與音效開關！\');">切換 8-bit 背景音樂 (開 / 關)</button>' +
            '<button class="na-btn" style="padding:9px;" onclick="Aetheria.UI.playCutscene(\'intro\')">重溫開場故事序幕卷軸</button>' +
            '<button class="na-btn highlight" style="padding:9px;" onclick="Aetheria.UI.exportSavePrompt()">複製存檔 JSON 代碼 (備份)</button>' +
            '<button class="na-btn" style="padding:9px;" onclick="Aetheria.UI.importSavePrompt()">貼上存檔 JSON 代碼 (還原)</button>' +
            '<button class="na-btn" style="padding:9px;" onclick="document.getElementById(\'title-screen\').style.display=\'flex\'; Aetheria.UI.initTitleScreen();">返回遊戲首頁</button>' +
            '<button class="na-btn" style="padding:9px; background:#a32c24; border-color:#ff595e;" onclick="if(confirm(\'確定要清除所有進度並重新開始 v5.0 完整冒險嗎？\')) Aetheria.State.resetSave()">重置遊戲 (清除進度重新開始)</button>' +
          '</div>';
        body.appendChild(sysCard);
      }
    },

    toggleSubject: function(key) {
      const s = window.Aetheria.State.data;
      s.activeSubjects[key] = !s.activeSubjects[key];
      window.Aetheria.State.save();
      this.openSettingsModal("astrolabe");
    },

    exportSavePrompt: function() {
      const json = window.Aetheria.State.exportJSON();
      const self = this;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(json).then(function() {
          self.showToast("存檔 JSON 已複製到剪貼簿！");
        }).catch(function() {
          prompt("請複製以下存檔 JSON 代碼：", json);
        });
      } else {
        prompt("請複製以下存檔 JSON 代碼：", json);
      }
    },

    importSavePrompt: function() {
      const raw = prompt("請貼上先前備份的存檔 JSON 代碼：");
      if (raw && window.Aetheria.State.importJSON(raw)) {
        sanitizePlayerPosition();
        if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;
        this.showToast("存檔還原成功！");
        this.updateAllHud();
        this.openSettingsModal("system");
      } else if (raw) {
        this.showToast("存檔格式不正確！");
      }
    }
  };

  window.Aetheria.UI = UIManager;

  function startMainGameLoop() {
    try { window.Aetheria.Data.Sprites.init(); } catch (e) {}
    try {
      window.Aetheria.State.init();
      sanitizePlayerPosition();
    } catch (e) {}

    try { window.Aetheria.UI.decorateNavIcons(); } catch (e) {}
    try { window.Aetheria.UI.initTitleScreen(); } catch (e) {}
    try { window.Aetheria.UI.updateAllHud(); } catch (e) {}
    try {
      if (window.Aetheria.Explore && window.Aetheria.Explore.initControls) {
        window.Aetheria.Explore.initControls();
      }
    } catch (e) {}

    function frameStep() {
      try {
        const isBattling = Boolean(window.Aetheria.Battle && window.Aetheria.Battle.active);
        if (!isBattling) {
          if (window.Aetheria.Explore && window.Aetheria.Explore.updateStep) {
            window.Aetheria.Explore.updateStep();
          }
          if (window.Aetheria.Renderer && window.Aetheria.Renderer.renderWorld) {
            window.Aetheria.Renderer.tick = (window.Aetheria.Renderer.tick || 0) + 1;
            window.Aetheria.Renderer.renderWorld();
          }
        }
      } catch (err) {}
      requestAnimationFrame(frameStep);
    }

    requestAnimationFrame(frameStep);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(startMainGameLoop, 10);
  } else {
    window.addEventListener("load", startMainGameLoop);
  }
})();
