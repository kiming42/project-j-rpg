/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 26種獨立素材圖標映射、極簡UI與動態支線總管 (progression-town.js - v5.3)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const MAX_ACTIVE_BOUNTIES = 3;

  function cleanText(str) {
    if (!str) return "";
    return String(str).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "").trim();
  }

  // 直接映射 "mat_" + matKey，確保 26 種素材每一個都使用獨立 16x16 像素圖！
  function getItemSpriteKey(matKey) {
    return "mat_" + matKey;
  }

  function formatIconCost(inv, costObj) {
    const S = window.Aetheria.Data.Sprites;
    const mats = window.Aetheria.Data.MATERIALS;
    const parts = [];
    for (const [k, req] of Object.entries(costObj || {})) {
      const m = mats[k] || { name: k };
      const have = inv[k] || 0;
      const ok = have >= req;
      const col = ok ? "#5ac54f" : "#ff758f";
      parts.push(
        '<span style="color:' + col + ';font-weight:900;margin-right:6px;white-space:nowrap;">' +
          S.iconHtml(getItemSpriteKey(k)) + m.name + " " + have + "/" + req +
        '</span>'
      );
    }
    return parts.join("") || "初始裝備";
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
          questEl.innerHTML = S.iconHtml("icon_scroll") + "主線全破！無盡試煉之塔最高：第 " + s.maxTowerFloor + " 層";
        }
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

    // ================= 0. 營地燉肉鍋 =================
    openCookingModal: function() {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const inv = s.inventory;
      const Helper = window.Aetheria.Data.CraftingHelper;

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_potion") + "營地料理鍋 (HP " + s.hp + "/" + s.maxHp + ")";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const healCard = document.createElement("div");
      healCard.className = "sys-card-scroll";
      healCard.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<b>營地熱湯休整</b>' +
          '<button class="na-btn highlight" style="padding:4px 12px;" onclick="Aetheria.UI.restAtCampPot()">免費回滿生命</button>' +
        '</div>';
      body.appendChild(healCard);

      if (s.activeMeal && s.activeMeal.battlesLeft > 0 && window.Aetheria.Data.CAMP_MEALS[s.activeMeal.id]) {
        const curMeal = window.Aetheria.Data.CAMP_MEALS[s.activeMeal.id];
        const curBox = document.createElement("div");
        curBox.className = "sys-card";
        curBox.style.borderColor = "#5ac54f";
        curBox.innerHTML = '<b style="color:#5ac54f;">生效中：【' + curMeal.name + '】（剩 ' + s.activeMeal.battlesLeft + ' 戰）</b>';
        body.appendChild(curBox);
      }

      Object.values(window.Aetheria.Data.CAMP_MEALS).forEach(function(meal) {
        const canCook = Helper.canAfford(inv, meal.cost);
        const mCard = document.createElement("div");
        mCard.className = "sys-card";
        mCard.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b style="color:var(--na-gold);">' + S.iconHtml("mat_potionHeal") + meal.name + '</b>' +
            '<button class="na-btn ' + (canCook ? 'highlight' : '') + '" style="padding:4px 10px;" onclick="Aetheria.UI.cookCampMeal(\'' + meal.id + '\')">烹調</button>' +
          '</div>' +
          '<div style="font-size:12px; color:#cbd5e1; margin:2px 0;">' + meal.desc + '</div>' +
          '<div style="font-size:12px;">' + formatIconCost(inv, meal.cost) + '</div>';
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
      this.showToast("喝下營地高湯，生命值已完全恢復！");
    },

    cookCampMeal: function(mealId) {
      const s = window.Aetheria.State.data;
      const meal = window.Aetheria.Data.CAMP_MEALS[mealId];
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!meal || !Helper.payCost(s.inventory, meal.cost)) {
        this.showToast("食材不足！");
        return;
      }
      s.activeMeal = { id: meal.id, battlesLeft: meal.battles };
      s.questProgress.cookedOnce = true;
      if (!s.bountyStats) s.bountyStats = { kills: 0, breaks: 0, fishes: 0, meals: 0 };
      s.bountyStats.meals = (s.bountyStats.meals || 0) + 1;
      window.Aetheria.State.recalcMaxHp();
      s.hp = s.maxHp;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.openCookingModal();
      this.updateAllHud();
      this.showToast("享用【" + meal.name + "】！獲得 3 場戰鬥強化 Buff！");
    },

    // ================= 1. NPC 對話 =================
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
      if (portImg) portImg.src = S.getDataURL(npc.sprite);

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
          btn.innerHTML = '<div style="color:#8d99ae; font-size:13px;">[已完成] ' + cleanText(pa.label) + '</div>';
        } else {
          btn.innerHTML = '<div style="color:var(--na-gold); font-size:13px;">' + S.iconHtml("icon_sword") + cleanText(pa.label) + '</div><div style="font-size:11px; color:#cbd5e1; margin-top:2px;">' + cleanText(pa.desc) + '</div>';
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

    openMerchantShop: function() { this.openForgeModal("alchemy"); },
    openMonolithModal: function() { this.openGuildModal("monolith"); },

    // ================= 2. 傳送陣 =================
    openWorldMapModal: function() {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const unlockedList = s.unlockedZones || ["camp_hub"];

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_map") + "大陸傳送陣 (" + unlockedList.length + "/" + window.Aetheria.Data.Maps.ORDERED_WORLD_ZONES.length + ")";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      window.Aetheria.Data.Maps.ORDERED_WORLD_ZONES.forEach(function(z) {
        const isUnlocked = unlockedList.indexOf(z.id) !== -1;
        const isCurrent = (s.currentZone === z.id);
        const card = document.createElement("div");
        card.className = isUnlocked ? "sys-card-scroll" : "sys-card";

        if (isUnlocked) {
          card.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b>' + S.iconHtml("icon_map") + z.name + '</b>' +
              '<button class="na-btn highlight" style="padding:4px 10px;" onclick="Aetheria.UI.teleportToZone(\'' + z.id + '\', ' + z.x + ', ' + z.y + ')">' + (isCurrent ? "刷新資源" : "傳送") + '</button>' +
            '</div>';
        } else {
          card.style.opacity = "0.5";
          card.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="color:#8d99ae;">[封印中] ' + z.name + '</b>' +
              '<span style="font-size:11px; color:#ff595e;">需擊敗前區領主</span>' +
            '</div>';
        }
        body.appendChild(card);
      });
    },

    teleportToZone: function(zoneId, tx, ty) {
      const s = window.Aetheria.State.data;
      if ((s.unlockedZones || []).indexOf(zoneId) === -1) return;
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
      this.showToast("已傳送至【" + mapObj.name + "】（資源已刷新）！");
    },

    // ================= 3. 冒險者公會 =================
    openGuildModal: function(activeTab) {
      activeTab = activeTab || "quest";
      window.Aetheria.State.updateGuildRank();
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const self = this;
      if (!Array.isArray(s.activeBounties)) s.activeBounties = [];
      if (!Array.isArray(s.claimedRankSupplies)) s.claimedRankSupplies = [];
      if (!s.bountyStats) s.bountyStats = { kills: 0, breaks: 0, fishes: 0, meals: 0 };

      this.setActivePanel("panel-modal");

      const ranks = window.Aetheria.Data.GUILD_RANKS;
      const curIdx = ranks.findIndex(function(r) { return r.rank === s.guildRank; });
      const nextRank = (curIdx >= 0 && curIdx + 1 < ranks.length) ? ranks[curIdx + 1] : null;
      const nextReqTxt = nextRank ? ("｜升" + nextRank.rank + "級需 Lv." + nextRank.minLv + " & " + nextRank.minPts + "pt") : "｜已達最高階";

      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_shield") + "公會 " + s.guildRank + "級 (" + s.guildPoints + "pt" + nextReqTxt + ")";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const tabBar = document.createElement("div");
      tabBar.style.cssText = "display:grid; grid-template-columns:repeat(3, 1fr); gap:5px; margin-bottom:6px;";
      [
        { id: "quest",    label: "主線任務",   icon: "icon_scroll" },
        { id: "bounty",   label: "隨機支線",   icon: "icon_sword" },
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
        topBar.style.cssText = "display:flex; gap:5px; margin-bottom:6px;";
        topBar.innerHTML =
          (rankAlreadyClaimed
            ? '<button class="na-btn" style="flex:1; opacity:0.5; pointer-events:none;">' + s.guildRank + '級俸祿已領 ' + (nextRank ? '(升' + nextRank.rank + '級再領)' : '') + '</button>'
            : '<button class="na-btn highlight" style="flex:1;" onclick="Aetheria.UI.claimGuildSupply()">' + S.iconHtml("icon_coin") + '領取 ' + s.guildRank + ' 級俸祿</button>') +
          (ghLv === 0
            ? '<button class="na-btn" onclick="Aetheria.UI.buildGreenhouse()">建溫室(木2鐵2)</button>'
            : '<span class="na-badge" style="display:flex;align-items:center;">溫室運作中</span>');
        body.appendChild(topBar);

        const mq = window.Aetheria.Data.getCurrentMainQuest(s);
        if (mq) {
          const isDone = mq.checkComplete(s);
          const mqCard = document.createElement("div");
          mqCard.className = "sys-card-scroll";
          mqCard.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="color:#7f2b1d; font-size:14px;">[' + mq.chapter + '] ' + cleanText(mq.title) + '</b>' +
              (isDone ? '<button class="na-btn highlight" style="padding:4px 10px;" onclick="Aetheria.UI.claimMainQuest(\'' + mq.id + '\')">領獎</button>' : '<span class="stat-pill">進行中</span>') +
            '</div>' +
            '<div style="font-size:12px; margin:2px 0;">' + cleanText(mq.desc) + '</div>' +
            '<div style="font-size:12px; color:#1d5eb8; font-weight:900;">獎勵：' + cleanText(mq.rewardText) + '</div>';
          body.appendChild(mqCard);
        }

        window.Aetheria.Data.MAIN_QUESTS.forEach(function(q) {
          const claimed = Boolean(s.questProgress["claimed_" + q.id]);
          const row = document.createElement("div");
          row.className = "sys-card";
          row.style.opacity = claimed ? "0.55" : "0.9";
          row.style.padding = "4px 8px";
          row.innerHTML =
            '<div style="display:flex; justify-content:space-between; font-size:12px;">' +
              '<span><b>[' + q.chapter + ']</b> ' + cleanText(q.title) + '</span>' +
              '<span style="color:' + (claimed ? '#5ac54f' : '#8d99ae') + '; font-weight:bold;">' + (claimed ? '✓' : '待推進') + '</span>' +
            '</div>';
          body.appendChild(row);
        });
      }

      else if (activeTab === "bounty") {
        const headRow = document.createElement("div");
        headRow.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;";
        headRow.innerHTML =
          '<b style="color:var(--na-gold);">已接支線 (' + s.activeBounties.length + '/' + MAX_ACTIVE_BOUNTIES + ')</b>' +
          '<button class="na-btn" style="padding:3px 8px; font-size:12px;" onclick="Aetheria.UI.refreshBountyBoard()">換一批支線 (20G)</button>';
        body.appendChild(headRow);

        const Helper = window.Aetheria.Data.CraftingHelper;

        s.activeBounties.forEach(function(entry) {
          const bId = (typeof entry === "string") ? entry : entry.id;
          const startVal = (typeof entry === "object" && entry.startVal !== undefined) ? entry.startVal : 0;

          if (bId === "bounty_wrong_shadow") {
            const kills = s.wrongBountyKills || 0;
            const ok = kills >= 2;
            const sCard = document.createElement("div");
            sCard.className = "sys-card-scroll";
            sCard.innerHTML =
              '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<b>[錯題討伐] 暗影幻象 (' + kills + '/2)</b>' +
                '<div style="display:flex; gap:4px;">' +
                  (!ok
                    ? '<button class="na-btn highlight" style="padding:3px 8px;" onclick="Aetheria.UI.huntWrongQuestion()">討伐</button>'
                    : '<button class="na-btn highlight" style="padding:3px 8px;" onclick="Aetheria.UI.deliverWrongBounty()">領獎</button>') +
                  '<button class="na-btn" style="padding:3px 6px;" onclick="Aetheria.UI.abandonBounty(\'bounty_wrong_shadow\')">放棄</button>' +
                '</div>' +
              '</div>' +
              '<div style="font-size:12px; color:#1d5eb8; font-weight:bold;">報酬：流沙秘銀x2、聲望+35</div>';
            body.appendChild(sCard);
            return;
          }

          const b = window.Aetheria.Data.GUILD_BOUNTIES.find(function(item) { return item.id === bId; });
          if (!b) return;

          let progressHtml = "";
          let canDeliver = false;

          if (b.kind === "action") {
            const cur = (s.bountyStats && s.bountyStats[b.statKey]) || 0;
            const doneCount = Math.max(0, cur - startVal);
            canDeliver = doneCount >= b.reqVal;
            progressHtml = '<span class="stat-pill">' + b.goalLabel + ' ' + Math.min(b.reqVal, doneCount) + '/' + b.reqVal + '</span>';
          } else if (b.kind === "streak") {
            const curStreak = s.streak || 0;
            canDeliver = curStreak >= b.reqVal;
            progressHtml = '<span class="stat-pill">連勝 ' + curStreak + '/' + b.reqVal + '</span>';
          } else {
            canDeliver = Helper.canAfford(s.inventory, b.cost);
            progressHtml = formatIconCost(s.inventory, b.cost);
          }

          const aCard = document.createElement("div");
          aCard.className = "sys-card-scroll";
          aCard.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b>' + cleanText(b.title) + '</b>' +
              '<div style="display:flex; gap:4px;">' +
                '<button class="na-btn ' + (canDeliver ? 'highlight' : '') + '" style="padding:3px 8px;" onclick="Aetheria.UI.deliverGuildBounty(\'' + b.id + '\')">' + (canDeliver ? '領獎' : '未達成') + '</button>' +
                '<button class="na-btn" style="padding:3px 6px;" onclick="Aetheria.UI.abandonBounty(\'' + b.id + '\')">放棄</button>' +
              '</div>' +
            '</div>' +
            '<div style="font-size:12px; margin-top:2px;">' + progressHtml + ' <span style="color:#1d5eb8;font-weight:bold;">｜' + cleanText(b.rewardText) + '</span></div>';
          body.appendChild(aCard);
        });

        const boardHeader = document.createElement("div");
        boardHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:6px 0 4px; font-size:13px;";
        boardHeader.innerText = "【今日隨機懸賞池】（涵蓋討伐/破防/連勝/料理/物資）";
        body.appendChild(boardHeader);

        const activeIds = s.activeBounties.map(function(e) { return (typeof e === "string") ? e : e.id; });

        if (activeIds.indexOf("bounty_wrong_shadow") === -1) {
          const wCard = document.createElement("div");
          wCard.className = "sys-card";
          wCard.style.borderColor = "#9d4edd";
          wCard.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="color:#e0aaff;">[錯題討伐] 擊敗 2 隻暗影記憶幻象</b>' +
              '<button class="na-btn highlight" style="padding:3px 10px;" onclick="Aetheria.UI.acceptBounty(\'bounty_wrong_shadow\')">接取</button>' +
            '</div>' +
            '<div style="font-size:12px; color:#8ce0ff;">報酬：流沙秘銀x2、聲望+35</div>';
          body.appendChild(wCard);
        }

        const pool = window.Aetheria.Data.getAvailableBounties(s);
        pool.forEach(function(b) {
          if (activeIds.indexOf(b.id) !== -1) return;
          const reqHtml = (b.kind === "deliver") ? formatIconCost(s.inventory, b.cost) : '<span class="stat-pill">挑戰任務</span>';
          const bCard = document.createElement("div");
          bCard.className = "sys-card";
          bCard.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="color:var(--na-gold);">' + cleanText(b.title) + '</b>' +
              '<button class="na-btn highlight" style="padding:3px 10px;" onclick="Aetheria.UI.acceptBounty(\'' + b.id + '\')">接取</button>' +
            '</div>' +
            '<div style="font-size:12px; margin-top:2px;">' + reqHtml + ' <span style="color:#8ce0ff;">｜' + cleanText(b.rewardText) + '</span></div>';
          body.appendChild(bCard);
        });
      }

      else if (activeTab === "monolith") {
        const shardCount = s.inventory.tabletShard || 0;
        const infoBox = document.createElement("div");
        infoBox.className = "sys-card-scroll";
        infoBox.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b>' + S.iconHtml("mat_tabletShard") + '聖碑殘片：' + shardCount + ' 枚</b>' +
            '<span style="font-size:11px; color:#5c3824;">答對+2點｜獻上殘片+20點</span>' +
          '</div>';
        body.appendChild(infoBox);

        Object.values(window.Aetheria.Data.MONOLITHS_DB).forEach(function(mono) {
          const pts = (s.monolithPts && s.monolithPts[mono.id]) || 0;
          const card = document.createElement("div");
          card.className = "sys-card";
          card.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="color:var(--na-gold);">' + mono.name + ' (' + pts + '/100)</b>' +
              (pts < 100
                ? '<button class="na-btn ' + (shardCount > 0 ? 'highlight' : '') + '" style="padding:3px 8px;" onclick="Aetheria.UI.offerTabletShard(\'' + mono.id + '\')">獻上殘片</button>'
                : '<span style="color:#5ac54f; font-weight:bold;">★滿階</span>') +
            '</div>' +
            '<div class="hp-bar-outer" style="margin:4px 0;"><div class="hp-bar-inner" style="background:#38b6ff; width:' + pts + '%;"></div></div>' +
            '<div style="font-size:12px; color:#8ce0ff; font-weight:bold;">' + mono.perks + '</div>';
          body.appendChild(card);
        });
      }
    },

    refreshBountyBoard: function() {
      const s = window.Aetheria.State.data;
      if (s.gold < 20) {
        this.showToast("刷新懸賞板需要 20 G！");
        return;
      }
      s.gold -= 20;
      s.bountyPoolSeed = (s.bountyPoolSeed || 1) + 1;
      window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.State.save();
      this.openGuildModal("bounty");
      this.showToast("已換上一批全新的隨機支線懸賞！");
    },

    offerTabletShard: function(monoId) {
      const s = window.Aetheria.State.data;
      if ((s.inventory.tabletShard || 0) <= 0) {
        this.showToast("尚未持有【古文明聖碑殘片】！");
        return;
      }
      if (s.monolithPts[monoId] >= 100) return;
      s.inventory.tabletShard--;
      s.monolithPts[monoId] = Math.min(100, (s.monolithPts[monoId] || 0) + 20);
      window.Aetheria.State.recalcMaxHp();
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.openGuildModal("monolith");
      this.updateAllHud();
      this.showToast("聖碑共鳴度 +20！");
    },

    acceptBounty: function(bId) {
      const s = window.Aetheria.State.data;
      if (!Array.isArray(s.activeBounties)) s.activeBounties = [];
      const activeIds = s.activeBounties.map(function(e) { return (typeof e === "string") ? e : e.id; });
      if (activeIds.indexOf(bId) !== -1) return;

      if (s.activeBounties.length >= MAX_ACTIVE_BOUNTIES) {
        this.showToast("最多同時接取 " + MAX_ACTIVE_BOUNTIES + " 張支線！");
        return;
      }

      if (bId === "bounty_wrong_shadow") {
        s.wrongBountyKills = 0;
        s.activeBounties.push({ id: bId, startVal: 0 });
      } else {
        const b = window.Aetheria.Data.GUILD_BOUNTIES.find(function(item) { return item.id === bId; });
        const curStat = (b && b.kind === "action" && s.bountyStats) ? (s.bountyStats[b.statKey] || 0) : 0;
        s.activeBounties.push({ id: bId, startVal: curStat });
      }

      window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.State.save();
      this.openGuildModal("bounty");
    },

    abandonBounty: function(bId) {
      const s = window.Aetheria.State.data;
      s.activeBounties = (s.activeBounties || []).filter(function(e) {
        const id = (typeof e === "string") ? e : e.id;
        return id !== bId;
      });
      window.Aetheria.State.save();
      this.openGuildModal("bounty");
    },

    deliverGuildBounty: function(bountyId) {
      const s = window.Aetheria.State.data;
      const entry = (s.activeBounties || []).find(function(e) {
        return ((typeof e === "string") ? e : e.id) === bountyId;
      });
      if (!entry) return;

      const b = window.Aetheria.Data.GUILD_BOUNTIES.find(function(item) { return item.id === bountyId; });
      if (!b) return;

      const Helper = window.Aetheria.Data.CraftingHelper;
      const startVal = (typeof entry === "object" && entry.startVal !== undefined) ? entry.startVal : 0;

      if (b.kind === "action") {
        const cur = (s.bountyStats && s.bountyStats[b.statKey]) || 0;
        if ((cur - startVal) < b.reqVal) {
          this.showToast("尚未達成行動目標次數！");
          return;
        }
      } else if (b.kind === "streak") {
        if ((s.streak || 0) < b.reqVal) {
          this.showToast("當前連勝尚未達 " + b.reqVal + " 題！");
          return;
        }
      } else if (!Helper.payCost(s.inventory, b.cost)) {
        this.showToast("交付物資尚未集齊！");
        return;
      }

      s.activeBounties = s.activeBounties.filter(function(e) {
        return ((typeof e === "string") ? e : e.id) !== bountyId;
      });
      s.bountyPoolSeed = (s.bountyPoolSeed || 1) + 1;
      b.onComplete(s);
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast("支線完成！獲得：" + cleanText(b.rewardText));
      this.openGuildModal("bounty");
      this.updateAllHud();
    },

    deliverWrongBounty: function() {
      const s = window.Aetheria.State.data;
      if ((s.wrongBountyKills || 0) < 2) {
        this.showToast("尚需擊敗 " + (2 - (s.wrongBountyKills || 0)) + " 隻錯題幻象！");
        return;
      }
      s.activeBounties = (s.activeBounties || []).filter(function(e) {
        return ((typeof e === "string") ? e : e.id) !== "bounty_wrong_shadow";
      });
      s.wrongBountyKills = 0;
      s.inventory.mithril += 2;
      s.questProgress.bountiesCleared = (s.questProgress.bountiesCleared || 0) + 1;
      window.Aetheria.State.gainRewards(120, 150, 35);
      window.Aetheria.Audio.sfxLevelUp();
      this.showToast("錯題討伐完成！獲得【流沙秘銀 x2】與聲望 +35！");
      this.openGuildModal("bounty");
      this.updateAllHud();
    },

    claimGuildSupply: function() {
      const s = window.Aetheria.State.data;
      if (!Array.isArray(s.claimedRankSupplies)) s.claimedRankSupplies = [];
      if (s.claimedRankSupplies.indexOf(s.guildRank) !== -1) return;

      const rankInfo = window.Aetheria.Data.GUILD_RANKS.find(function(r) { return r.rank === s.guildRank; }) || window.Aetheria.Data.GUILD_RANKS[0];
      s.claimedRankSupplies.push(s.guildRank);
      s.inventory.iron += rankInfo.dailyIron;
      s.inventory.potionHint += rankInfo.dailyPotion;
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.showToast("領取 " + s.guildRank + " 級俸祿：藍晶礦+" + rankInfo.dailyIron + "、洞察藥水+" + rankInfo.dailyPotion + "！");
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
        this.showToast("完成【" + cleanText(mq.title) + "】！");
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
        this.showToast("需要【翠風原木 x2】與【藍晶鐵礦 x2】！");
        return;
      }
      s.campBuildings.greenhouse = 1;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast("煉金溫室建造完成！");
      this.openGuildModal("quest");
    },

    // ================= 4. 鐵匠鋪 =================
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
            const canCraft = lvOk && Helper.canAfford(inv, w.cost);

            let pills = '<span class="stat-pill">ATK +' + w.atk + '</span>';
            if (w.shieldBreak) pills += '<span class="stat-pill">破盾 +' + w.shieldBreak + '</span>';
            if (w.bpGainBonus) pills += '<span class="stat-pill">BP +' + w.bpGainBonus + '</span>';
            if (!owned) pills += '<span class="stat-pill" style="color:' + (lvOk ? '#5ac54f' : '#ff758f') + ';">需Lv.' + reqLv + '</span>';

            const card = document.createElement("div");
            card.className = owned ? "sys-card-scroll" : "sys-card";
            card.innerHTML =
              '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<b>' + S.iconHtml("icon_sword") + '[T' + w.tier + '] ' + cleanText(w.name) + '</b>' +
                (owned
                  ? '<button class="na-btn ' + (equipped ? 'highlight' : '') + '" style="padding:3px 8px;" onclick="Aetheria.UI.equipWeapon(\'' + w.id + '\')">' + (equipped ? '已裝備' : '裝備') + '</button>'
                  : '<button class="na-btn ' + (canCraft ? 'highlight' : '') + '" style="padding:3px 10px;" onclick="Aetheria.UI.craftWeapon(\'' + w.id + '\')">鍛造</button>') +
              '</div>' +
              '<div style="margin-top:3px;">' + pills + '</div>' +
              (!owned ? '<div style="font-size:12px; margin-top:3px;">' + formatIconCost(inv, w.cost) + '</div>' : '');
            body.appendChild(card);
          } else if (w.tier === highestOwnedTier + 2) {
            const lockCard = document.createElement("div");
            lockCard.className = "sys-card";
            lockCard.style.opacity = "0.5";
            lockCard.innerHTML = '<b>[T' + w.tier + ' 未解鎖] 需先完成 T' + (highestOwnedTier + 1) + ' 武器</b>';
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
            const canCraft = lvOk && Helper.canAfford(inv, a.cost);

            let pills = '<span class="stat-pill">DEF +' + a.def + '</span><span class="stat-pill">HP +' + a.hpBonus + '</span>';
            if (a.resistCold) pills += '<span class="stat-pill" style="color:#8ce0ff;">抗寒</span>';
            if (a.resistAll)  pills += '<span class="stat-pill" style="color:#ff9f1c;">抗寒/抗熱</span>';
            if (!owned) pills += '<span class="stat-pill" style="color:' + (lvOk ? '#5ac54f' : '#ff758f') + ';">需Lv.' + reqLv + '</span>';

            const card = document.createElement("div");
            card.className = owned ? "sys-card-scroll" : "sys-card";
            card.innerHTML =
              '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<b>' + S.iconHtml("icon_shield") + '[T' + a.tier + '] ' + a.name + '</b>' +
                (owned
                  ? '<button class="na-btn ' + (equipped ? 'highlight' : '') + '" style="padding:3px 8px;" onclick="Aetheria.UI.equipArmor(\'' + a.id + '\')">' + (equipped ? '已穿戴' : '穿戴') + '</button>'
                  : '<button class="na-btn ' + (canCraft ? 'highlight' : '') + '" style="padding:3px 10px;" onclick="Aetheria.UI.craftArmor(\'' + a.id + '\')">鍛造</button>') +
              '</div>' +
              '<div style="margin-top:3px;">' + pills + '</div>' +
              (!owned ? '<div style="font-size:12px; margin-top:3px;">' + formatIconCost(inv, a.cost) + '</div>' : '');
            body.appendChild(card);
          }
        });

        Object.values(window.Aetheria.Data.RELICS).forEach(function(rel) {
          const owned = s.unlockedRelics && s.unlockedRelics.indexOf(rel.id) !== -1;
          const canCraft = (s.lv >= (rel.reqLv || 1)) && Helper.canAfford(inv, rel.cost);
          const rCard = document.createElement("div");
          rCard.className = owned ? "sys-card-scroll" : "sys-card";
          rCard.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b>[聖物] ' + rel.name + '</b>' +
              (owned ? '<span style="color:#1d5eb8;font-weight:bold;">已生效</span>' : '<button class="na-btn ' + (canCraft ? 'highlight' : '') + '" style="padding:3px 8px;" onclick="Aetheria.UI.craftRelic(\'' + rel.id + '\')">鍛造</button>') +
            '</div>' +
            '<div style="font-size:12px; margin-top:2px;">' + rel.desc + '</div>' +
            (!owned ? '<div style="font-size:12px; margin-top:2px;"><span class="stat-pill">需Lv.' + rel.reqLv + '</span>' + formatIconCost(inv, rel.cost) + '</div>' : '');
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
          '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">' +
            '<span><b>[武器孔]</b>：' + (wRune ? S.iconHtml(getItemSpriteKey(wRune.id)) + wRune.name : '空置') + '</span>' +
            (wRune ? '<button class="na-btn" style="padding:2px 8px;" onclick="Aetheria.UI.unsocketRune(\'weapon\')">拆下</button>' : '') +
          '</div>' +
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<span><b>[防具孔]</b>：' + (aRune ? S.iconHtml(getItemSpriteKey(aRune.id)) + aRune.name : '空置') + '</span>' +
            (aRune ? '<button class="na-btn" style="padding:2px 8px;" onclick="Aetheria.UI.unsocketRune(\'armor\')">拆下</button>' : '') +
          '</div>';
        body.appendChild(slotBox);

        Object.values(window.Aetheria.Data.RUNES).forEach(function(rune) {
          const have = inv[rune.id] || 0;
          const rCard = document.createElement("div");
          rCard.className = "sys-card";
          rCard.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="color:var(--na-gold);">' + S.iconHtml(getItemSpriteKey(rune.id)) + rune.name + ' (x' + have + ')</b>' +
              '<div style="display:flex; gap:4px;">' +
                '<button class="na-btn ' + (have > 0 ? 'highlight' : '') + '" style="padding:3px 7px; font-size:11px;" onclick="Aetheria.UI.socketRune(\'weapon\', \'' + rune.id + '\')">鑲武器</button>' +
                '<button class="na-btn ' + (have > 0 ? 'highlight' : '') + '" style="padding:3px 7px; font-size:11px;" onclick="Aetheria.UI.socketRune(\'armor\', \'' + rune.id + '\')">鑲防具</button>' +
              '</div>' +
            '</div>' +
            '<div style="font-size:12px; color:#cbd5e1; margin-top:2px;">' + rune.desc + '</div>';
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
            canUp = lvOk && Helper.canAfford(inv, nextData.cost);
            condHtml =
              '<div style="font-size:12px; color:var(--na-gold); margin-top:2px;">升 Lv.' + nextLv + '：' + cleanText(nextData.desc) + '</div>' +
              '<div style="font-size:12px; margin-top:2px;"><span class="stat-pill" style="color:' + (lvOk ? '#5ac54f' : '#ff758f') + ';">需Lv.' + reqLv + '</span>' + formatIconCost(inv, nextData.cost) + '</div>';
          }

          const tCard = document.createElement("div");
          tCard.className = "sys-card";
          tCard.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b>' + S.iconHtml("icon_forge") + cleanText(tDef.name) + ' Lv.' + curLv + ' (' + tDef.levels[curLv].title + ')</b>' +
              (nextData
                ? '<button class="na-btn ' + (canUp ? 'highlight' : '') + '" style="padding:3px 8px;" onclick="Aetheria.UI.upgradeTool(\'' + tKey + '\')">升級</button>'
                : '<span style="color:#5ac54f; font-weight:bold;">滿階</span>') +
            '</div>' +
            condHtml;
          body.appendChild(tCard);
        });
      }

      else if (activeTab === "alchemy") {
        (window.Aetheria.Data.GOLD_SHOP || []).forEach(function(item) {
          const canBuy = s.gold >= item.goldCost;
          const have = inv[item.toKey] || 0;
          const row = document.createElement("div");
          row.className = "sys-card";
          row.style.display = "flex";
          row.style.justifyContent = "space-between";
          row.style.alignItems = "center";
          row.innerHTML =
            '<span><b>' + S.iconHtml(getItemSpriteKey(item.toKey)) + item.name + '</b> <span class="stat-pill">' + item.goldCost + 'G</span> (有' + have + ')</span>' +
            '<button class="na-btn ' + (canBuy ? 'highlight' : '') + '" style="padding:3px 10px;" onclick="Aetheria.UI.buyGoldItem(\'' + item.id + '\')">購買</button>';
          body.appendChild(row);
        });

        window.Aetheria.Data.ALCHEMY_CONVERSIONS.forEach(function(c) {
          const fromMat = window.Aetheria.Data.MATERIALS[c.fromKey];
          const have = inv[c.fromKey] || 0;
          const row = document.createElement("div");
          row.className = "sys-card";
          row.style.display = "flex";
          row.style.justifyContent = "space-between";
          row.style.alignItems = "center";
          row.innerHTML =
            '<span><b>' + S.iconHtml(getItemSpriteKey(c.toKey)) + cleanText(c.name) + '</b> <span style="font-size:12px;color:#cbd5e1;">(' + fromMat.name + ' ' + have + '/' + c.fromCount + ')</span></span>' +
            '<button class="na-btn ' + (have >= c.fromCount ? 'highlight' : '') + '" style="padding:3px 10px;" onclick="Aetheria.UI.alchemyConvert(\'' + c.id + '\')">提煉</button>';
          body.appendChild(row);
        });
      }
    },

    socketRune: function(slotType, runeId) {
      const s = window.Aetheria.State.data;
      if ((s.inventory[runeId] || 0) <= 0) {
        this.showToast("尚未持有此魔物核心！");
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
      this.showToast("已鑲嵌【" + window.Aetheria.Data.RUNES[runeId].name + "】！");
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
    },

    craftArmor: function(aId) {
      const s = window.Aetheria.State.data;
      const a = window.Aetheria.Data.ARMORS[aId];
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!a || s.lv < (a.reqLv || 1)) {
        this.showToast("需要達 Lv." + (a ? a.reqLv : 1) + " 才可鍛造！");
        return;
      }
      if (!Helper.payCost(s.inventory, a.cost)) {
        this.showToast("鍛造防具素材不足！");
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
      this.showToast("已鍛造並穿戴【" + a.name + "】！");
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
      if (!item || s.gold < item.goldCost) {
        this.showToast("金幣不足！");
        return;
      }
      s.gold -= item.goldCost;
      s.inventory[item.toKey] = (s.inventory[item.toKey] || 0) + item.toCount;
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.openForgeModal("alchemy");
      this.updateAllHud();
    },

    craftWeapon: function(wId) {
      const s = window.Aetheria.State.data;
      const w = window.Aetheria.Data.WEAPONS[wId];
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!w || s.lv < (w.reqLv || 1)) {
        this.showToast("需要達 Lv." + (w ? w.reqLv : 1) + " 才可鍛造！");
        return;
      }
      if (!Helper.payCost(s.inventory, w.cost)) {
        this.showToast("鍛造武器素材不足！");
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
      if (!rel || s.lv < (rel.reqLv || 1) || !Helper.payCost(s.inventory, rel.cost)) {
        this.showToast("等級或素材不足！");
        return;
      }
      if (!s.unlockedRelics) s.unlockedRelics = [];
      s.unlockedRelics.push(rId);
      if (rel.onCraft) rel.onCraft(s);
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
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
      if (!nextData || s.lv < (nextData.reqLv || 1) || !Helper.payCost(s.inventory, nextData.cost)) {
        this.showToast("等級或素材不足！");
        return;
      }
      s.tools[toolKey] = curLv + 1;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast("已升級為【Lv." + (curLv + 1) + " " + nextData.title + "】！");
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
      this.openForgeModal("alchemy");
      this.updateAllHud();
    },

    // ================= 5. 背包頁面 (26 種素材顯示各自獨立像素圖) =================
    openBagModal: function(selectedKey) {
      selectedKey = selectedKey || "iron";
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const inv = s.inventory;
      const mats = window.Aetheria.Data.MATERIALS;
      const self = this;

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_bag") + "背包 (金幣：" + s.gold + " G｜HP：" + s.hp + "/" + s.maxHp + ")";

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
            : '<span class="stat-pill">Tier ' + selMat.tier + '</span>') +
        '</div>' +
        '<div style="font-size:12px; margin-top:2px;">' + selMat.desc + '</div>';
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
      if ((s.inventory.potionHeal || 0) <= 0 || s.hp >= s.maxHp) return;
      s.inventory.potionHeal--;
      const sciPts = (s.monolithPts && s.monolithPts.science) || 0;
      const healVal = (sciPts >= 25) ? 140 : 70;
      s.hp = Math.min(s.maxHp, s.hp + healVal);
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.updateAllHud();
      this.openBagModal("potionHeal");
    },

    // ================= 6. 職業與戰寵頁面 =================
    openJobPetModal: function() {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_sword") + "職業祠堂 & 戰寵牧場";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      Object.values(window.Aetheria.Data.PETS).forEach(function(p) {
        const unlocked = s.unlockedPets.indexOf(p.id) !== -1;
        const isActive = (s.activePet === p.id);
        const isShiny = s.shinyPets && s.shinyPets.indexOf(p.id) !== -1;
        const spKey = isShiny ? p.shinySpriteKey : p.spriteKey;

        const pCard = document.createElement("div");
        pCard.className = unlocked ? "sys-card-scroll" : "sys-card";
        pCard.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b>' + S.iconHtml(spKey, true) + (isShiny ? '[閃光] ' : '') + cleanText(p.name) + '</b>' +
            (unlocked
              ? '<button class="na-btn ' + (isActive ? 'highlight' : '') + '" style="padding:3px 10px;" onclick="Aetheria.UI.selectPet(\'' + p.id + '\')">' + (isActive ? '同行中' : '攜帶') + '</button>'
              : '<button class="na-btn" style="padding:3px 10px;" onclick="Aetheria.UI.quickUnlockPet(\'' + p.id + '\')">誘餌果x2 契約</button>') +
          '</div>' +
          '<div style="font-size:12px; margin-top:2px;">' + p.skillName + '：' + p.skillDesc + '</div>';
        body.appendChild(pCard);
      });

      Object.values(window.Aetheria.Data.JOBS).forEach(function(j) {
        const unlocked = s.unlockedJobs.indexOf(j.id) !== -1 || s.lv >= j.unlockLv;
        const active = (s.currentJob === j.id);

        const jCard = document.createElement("div");
        jCard.className = unlocked ? "sys-card-scroll" : "sys-card";
        jCard.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b>' + S.iconHtml("icon_sword") + cleanText(j.name) + ' <span class="stat-pill">ATK x' + j.atkMult + '</span></b>' +
            (unlocked
              ? '<button class="na-btn ' + (active ? 'highlight' : '') + '" style="padding:3px 10px;" onclick="Aetheria.UI.selectJob(\'' + j.id + '\')">' + (active ? '當前職業' : '轉職') + '</button>'
              : '<span class="stat-pill" style="color:#ff758f;">需Lv.' + j.unlockLv + '</span>') +
          '</div>' +
          '<div style="font-size:12px; margin-top:2px;">' + j.passiveDesc + '</div>';
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
      this.openJobPetModal();
      this.updateAllHud();
    },

    selectJob: function(jobId) {
      const s = window.Aetheria.State.data;
      const j = window.Aetheria.Data.JOBS[jobId];
      if (!j || (s.lv < j.unlockLv && s.unlockedJobs.indexOf(jobId) === -1)) return;
      if (s.unlockedJobs.indexOf(jobId) === -1) s.unlockedJobs.push(jobId);
      s.currentJob = jobId;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.openJobPetModal();
      this.updateAllHud();
    },

    // ================= 7. 設定頁面 =================
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
        [
          { key: "chinese",    name: "中文科（字詞四選一、例句拼字）" },
          { key: "english",    name: "英文科（全盲鍵盤串字、例句四選一）" },
          { key: "science",    name: "科學科（看圖填充、情境推理、簡答）" },
          { key: "humanities", name: "人文科（左右連線配對、地形圖題）" }
        ].forEach(function(sub) {
          const on = Boolean(s.activeSubjects[sub.key]);
          const row = document.createElement("div");
          row.className = "sys-card";
          row.style.display = "flex";
          row.style.justifyContent = "space-between";
          row.style.alignItems = "center";
          row.innerHTML =
            '<span>' + S.iconHtml("icon_scroll") + sub.name + '</span>' +
            '<button class="na-btn ' + (on ? 'highlight' : '') + '" style="padding:4px 10px;" onclick="Aetheria.UI.toggleSubject(\'' + sub.key + '\')">' + (on ? '已啟用' : '未啟用') + '</button>';
          body.appendChild(row);
        });
      } else if (tab === "preview") {
        window.Aetheria.QuizBridge.getAllQuestions().forEach(function(q, idx) {
          const btn = document.createElement("button");
          btn.className = "na-btn";
          btn.style.cssText = "width:100%; text-align:left; padding:7px 10px; margin-bottom:4px;";
          btn.innerHTML = S.iconHtml("icon_scroll") + (idx + 1) + ". <b>[" + cleanText(q.subjectLabel) + "]</b> — " + cleanText(q.typeLabel);
          btn.onclick = function() { window.Aetheria.Battle.startBattle(null, "combat", q.id); };
          body.appendChild(btn);
        });
      } else if (tab === "report") {
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
          '<div style="font-weight:900; margin-bottom:4px;">四科掌握度（最高連勝：' + (s.maxStreak || 0) + ' 題）</div>' +
          Object.values(subjStats).map(function(st) {
            const pct = st.total > 0 ? Math.round((st.mastered / st.total) * 100) : 0;
            return '<div style="display:flex; justify-content:space-between; margin:3px 0;">' +
              '<span>' + st.name + '：<b>' + st.mastered + '/' + st.total + '</b> (' + pct + '%)</span>' +
              '<span style="color:#8f563b; font-weight:bold;">★' + st.stars + '</span>' +
            '</div>';
          }).join("");
        body.appendChild(repCard);
      } else if (tab === "system") {
        const sysCard = document.createElement("div");
        sysCard.className = "sys-card";
        sysCard.innerHTML =
          '<div style="display:flex; flex-direction:column; gap:6px;">' +
            '<button class="na-btn" style="padding:8px;" onclick="Aetheria.Audio.toggleMute(); Aetheria.UI.showToast(\'已切換音樂開關！\');">切換 8-bit 音樂 (開 / 關)</button>' +
            '<button class="na-btn" style="padding:8px;" onclick="Aetheria.UI.playCutscene(\'intro\')">重溫開場故事序幕</button>' +
            '<button class="na-btn highlight" style="padding:8px;" onclick="Aetheria.UI.exportSavePrompt()">複製存檔 JSON 代碼 (備份)</button>' +
            '<button class="na-btn" style="padding:8px;" onclick="Aetheria.UI.importSavePrompt()">貼上存檔 JSON 代碼 (還原)</button>' +
            '<button class="na-btn" style="padding:8px;" onclick="document.getElementById(\'title-screen\').style.display=\'flex\'; Aetheria.UI.initTitleScreen();">返回遊戲首頁</button>' +
            '<button class="na-btn" style="padding:8px; background:#a32c24; border-color:#ff595e;" onclick="if(confirm(\'確定要清除所有進度並重新開始嗎？\')) Aetheria.State.resetSave()">重置遊戲 (清除進度)</button>' +
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
          self.showToast("存檔 JSON 已複製！");
        }).catch(function() { prompt("請複製存檔 JSON：", json); });
      } else {
        prompt("請複製存檔 JSON：", json);
      }
    },

    importSavePrompt: function() {
      const raw = prompt("請貼上存檔 JSON：");
      if (raw && window.Aetheria.State.importJSON(raw)) {
        sanitizePlayerPosition();
        if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;
        this.showToast("存檔還原成功！");
        this.updateAllHud();
        this.openSettingsModal("system");
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

    try {
      if (window.Aetheria.Explore && window.Aetheria.Explore.reelInFish && !window.Aetheria.Explore._fishHooked) {
        const origReel = window.Aetheria.Explore.reelInFish;
        window.Aetheria.Explore.reelInFish = function() {
          const s = window.Aetheria.State.data;
          const beforeFish = (s.inventory && s.inventory.fish) || 0;
          origReel.apply(this, arguments);
          const afterFish = (s.inventory && s.inventory.fish) || 0;
          if (afterFish > beforeFish) {
            if (!s.bountyStats) s.bountyStats = { kills: 0, breaks: 0, fishes: 0, meals: 0 };
            s.bountyStats.fishes = (s.bountyStats.fishes || 0) + 1;
            window.Aetheria.State.save();
          }
        };
        window.Aetheria.Explore._fishHooked = true;
      }
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
