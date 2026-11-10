/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 大字體像素圖標 UI、防崩潰自癒啟動器與系統總管 (progression-town.js - v3.3)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const MAX_ACTIVE_BOUNTIES = 3;

  function cleanText(str) {
    if (!str) return "";
    return String(str).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "").trim();
  }

  function getItemSpriteKey(matKey) {
    if (matKey === "iron" || matKey === "mithril" || matKey === "obsidian" || matKey === "starIron") return "mat_crystal";
    if (matKey === "herb") return "mat_mushroom";
    if (matKey === "flower" || matKey === "iceLotus" || matKey === "goldLeaf") return "mat_flower";
    if (matKey === "potionHeal" || matKey === "potionHint") return "icon_potion";
    if (matKey === "bombItem") return "icon_bomb";
    if (matKey === "tameFruit") return "heart";
    return "crate";
  }

  // 確保舊存檔座標與區域 ID 100% 合法，避免載入舊存檔時掉出地圖外變成純綠底
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
      s.heroX = 250;
      s.heroY = 220;
    }

    const mapObj = Maps.getMap(s.currentZone);
    if (mapObj) {
      if (isNaN(s.heroX) || s.heroX < 20 || s.heroX > mapObj.width - 20) s.heroX = 250;
      if (isNaN(s.heroY) || s.heroY < 20 || s.heroY > mapObj.height - 20) s.heroY = 220;
      s.petX = s.heroX - 20;
      s.petY = s.heroY + 4;
    }
  }

  const UIManager = {
    // 為導航列 6 個按鈕與動作鍵注入開源像素小圖標
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
      } catch (e) {
        console.warn("decorateNavIcons warning:", e);
      }
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
      } catch (e) {
        console.warn("initTitleScreen warning:", e);
      }
    },

    continueGame: function() {
      if (!window.Aetheria.State.hasExistingSave()) return;
      window.Aetheria.State.init();
      sanitizePlayerPosition();
      window.Aetheria.State.save();

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

      const titleEl = document.getElementById("title-screen");
      if (titleEl) titleEl.style.display = "none";

      this.decorateNavIcons();
      window.Aetheria.Audio.playBgm("forest");
      this.updateAllHud();
      if (window.Aetheria.Renderer) window.Aetheria.Renderer.renderWorld();
      this.showToast("新冒險展開！請先在營地找【鐵匠大叔・巴爾】對話！");
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
      t._timer = setTimeout(function() { t.style.display = "none"; }, 2800);
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
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const jobs = window.Aetheria.Data.JOBS;
      const weapons = window.Aetheria.Data.WEAPONS;
      const materials = window.Aetheria.Data.MATERIALS;

      const jobName = jobs[s.currentJob] ? cleanText(jobs[s.currentJob].name) : "蒼藍劍士";

      const lvEl = document.getElementById("hud-lv");
      if (lvEl) {
        lvEl.innerHTML = S.iconHtml("icon_sword") + "Lv." + s.lv + " " + jobName + " (" + s.guildRank + "級)";
      }

      const questEl = document.getElementById("hud-quest");
      if (questEl) {
        const mq = window.Aetheria.Data.getCurrentMainQuest(s);
        if (mq) {
          const done = mq.checkComplete(s);
          questEl.innerHTML = done
            ? S.iconHtml("icon_scroll") + "<b>主線達成：" + cleanText(mq.title) + " (請點上方【公會】領獎！)</b>"
            : S.iconHtml("icon_scroll") + mq.chapter + "：" + cleanText(mq.title);
        } else {
          questEl.innerHTML = S.iconHtml("icon_scroll") + "主線全破！無盡試煉之塔最高紀錄：第 " + s.maxTowerFloor + " 層";
        }
      }

      const pinBox = document.getElementById("pinned-recipe");
      if (pinBox) {
        const pinWep = weapons[s.pinnedRecipe] || weapons.w_tide;
        const costParts = [];
        for (const [k, req] of Object.entries(pinWep.cost || {})) {
          const m = materials[k] || { name: k };
          costParts.push(m.name + " " + (s.inventory[k] || 0) + "/" + req);
        }
        pinBox.innerHTML = S.iconHtml("icon_forge") + "目標配方：<b>" + cleanText(pinWep.name) + "</b> (" + (costParts.join("｜") || "已擁有") + ")";
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

    // ================= 1. NPC 對話與旅人指令 =================
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

      const portCanvas = document.getElementById("npc-portrait-canvas");
      if (portCanvas) {
        const pCtx = portCanvas.getContext("2d");
        pCtx.imageSmoothingEnabled = false;
        pCtx.clearRect(0, 0, 40, 40);
        const sp = S.get(npc.sprite);
        if (sp) pCtx.drawImage(sp, 2, 2, 36, 36);
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
        if (npc.serviceAction === "openAstrolabeModal") self.openSettingsModal("astrolabe");
        else if (self[npc.serviceAction]) self[npc.serviceAction]();
      };
      btnGrid.appendChild(srvBtn);

      (npc.pathActions || []).forEach(function(pa) {
        const btn = document.createElement("button");
        btn.className = "na-btn";
        btn.style.textAlign = "left";
        btn.style.padding = "8px";
        btn.innerHTML = '<div style="color:var(--na-gold); font-size:14px;">' + S.iconHtml("icon_sword") + cleanText(pa.label) + '</div><div style="font-size:12px; font-weight:normal; color:#cbd5e1; margin-top:2px;">' + cleanText(pa.desc) + '</div>';
        btn.onclick = function() {
          if (pa.type === "spar") {
            window.Aetheria.Battle.pathActionRef = { action: pa, npc: npc };
            window.Aetheria.Battle.startBattle(pa.enemyConfig, "combat");
          } else {
            window.Aetheria.Battle.startPathActionChallenge(pa, npc);
          }
        };
        btnGrid.appendChild(btn);
      });
    },

    // ================= 2. 傳送陣 (必須步行進入該區才解鎖) =================
    openWorldMapModal: function() {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const unlockedList = s.unlockedZones || ["camp_hub"];

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_map") + "大陸傳送陣 (已解鎖：" + unlockedList.length + "/" + window.Aetheria.Data.Maps.ORDERED_WORLD_ZONES.length + " 區)";

      const body = document.getElementById("modal-body");
      body.innerHTML = '<div style="margin-bottom:8px; color:#cbd5e1; font-size:13px;">規則：請先操控角色由地圖出口<b>步行進入</b>下一區域，即可點亮該區傳送石碑！</div>';

      window.Aetheria.Data.Maps.ORDERED_WORLD_ZONES.forEach(function(z) {
        const isUnlocked = unlockedList.indexOf(z.id) !== -1;
        const isCurrent = (s.currentZone === z.id);
        const card = document.createElement("div");
        card.className = isUnlocked ? "sys-card-scroll" : "sys-card";

        if (isUnlocked) {
          card.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="font-size:15px;">' + S.iconHtml("icon_map") + z.name + '</b>' +
              '<button class="na-btn highlight" style="padding:6px 12px;" onclick="Aetheria.UI.teleportToZone(\'' + z.id + '\', ' + z.x + ', ' + z.y + ')">' + (isCurrent ? "刷新資源" : "立即傳送") + '</button>' +
            '</div>' +
            '<div style="font-size:13px; margin-top:4px;">' + z.desc + '</div>';
        } else {
          card.style.opacity = "0.55";
          card.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="color:#8d99ae; font-size:15px;">[未探索] ' + z.name + '</b>' +
              '<span style="font-size:12px; color:#ff595e; font-weight:bold;">需步行進入解鎖</span>' +
            '</div>' +
            '<div style="font-size:12px; color:#8d99ae; margin-top:3px;">請先由前一區域的出口步行抵達此處以開啟傳送石碑。</div>';
        }
        body.appendChild(card);
      });
    },

    teleportToZone: function(zoneId, tx, ty) {
      const s = window.Aetheria.State.data;
      if ((s.unlockedZones || []).indexOf(zoneId) === -1) {
        this.showToast("尚未步行探索此區域，無法直接傳送！");
        return;
      }
      window.Aetheria.Data.Maps.refreshAllResources();
      if (zoneId === "endless_tower") {
        window.Aetheria.Data.Maps.advanceTowerFloor(s.maxTowerFloor || 1);
      }
      s.currentZone = zoneId;
      s.heroX = tx;
      s.heroY = ty;
      s.petX = tx - 18;
      s.petY = ty + 6;
      window.Aetheria.State.save();

      const mapObj = window.Aetheria.Data.Maps.getMap(zoneId);
      window.Aetheria.Audio.playBgm(mapObj.bgm || "forest");
      this.closePanelToExplore();
      this.showToast("已傳送至【" + mapObj.name + "】！");
    },

    // ================= 3. 冒險者公會：先接受委託 (上限 3 張) ➔ 才顯示並交付 =================
    openGuildModal: function() {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      if (!Array.isArray(s.activeBounties)) s.activeBounties = [];

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_shield") + "冒險者公會 (" + s.guildRank + "級｜聲望 " + s.guildPoints + "pt)";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const ghLv = s.campBuildings.greenhouse || 0;
      const topBar = document.createElement("div");
      topBar.style.cssText = "display:flex; gap:6px; margin-bottom:8px;";
      topBar.innerHTML =
        '<button class="na-btn highlight" style="flex:1; padding:8px;" onclick="Aetheria.UI.claimGuildSupply()">' + S.iconHtml("icon_coin") + '領取 ' + s.guildRank + ' 級俸祿補給</button>' +
        (ghLv === 0
          ? '<button class="na-btn" style="flex:1; padding:8px;" onclick="Aetheria.UI.buildGreenhouse()">建造煉金溫室(木2鐵2)</button>'
          : '<button class="na-btn" style="flex:1; padding:8px;" onclick="Aetheria.UI.showToast(\'煉金溫室運作中：每答對5題自動產出洞察藥水！\')">溫室運作中</button>');
      body.appendChild(topBar);

      const mq = window.Aetheria.Data.getCurrentMainQuest(s);
      if (mq) {
        const isDone = mq.checkComplete(s);
        const mqCard = document.createElement("div");
        mqCard.className = "sys-card-scroll";
        mqCard.innerHTML =
          '<div style="font-weight:900; color:#8f563b; font-size:15px;">' + S.iconHtml("icon_scroll") + '【當前主線】' + mq.chapter + '：' + cleanText(mq.title) + '</div>' +
          '<div style="font-size:13px; margin:4px 0;">' + cleanText(mq.desc) + '</div>' +
          '<div style="font-size:13px; color:#1d5eb8; font-weight:bold;">獎勵：' + cleanText(mq.rewardText) + '</div>' +
          (isDone ? '<button class="na-btn highlight" style="width:100%; margin-top:6px; padding:8px;" onclick="Aetheria.UI.claimMainQuest(\'' + mq.id + '\')">任務達成！點擊領取主線獎勵</button>' : '');
        body.appendChild(mqCard);
      }

      const activeHeader = document.createElement("div");
      activeHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:8px 0 5px; font-size:15px;";
      activeHeader.innerHTML = S.iconHtml("icon_sword") + "【進行中委託】(" + s.activeBounties.length + " / " + MAX_ACTIVE_BOUNTIES + " 張上限)";
      body.appendChild(activeHeader);

      const Helper = window.Aetheria.Data.CraftingHelper;

      if (s.activeBounties.length === 0) {
        const emptyCard = document.createElement("div");
        emptyCard.className = "sys-card";
        emptyCard.style.color = "#cbd5e1";
        emptyCard.innerText = "目前尚未接受任何委託。請從下方「公會懸賞公告板」選擇並接受委託（最多同時接 3 張）。";
        body.appendChild(emptyCard);
      } else {
        s.activeBounties.forEach(function(bId) {
          if (bId === "bounty_wrong_shadow") {
            const wrongCount = (s.wrongBook || []).length;
            const sCard = document.createElement("div");
            sCard.className = "sys-card-scroll";
            sCard.innerHTML =
              '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<b style="font-size:15px;">【特級錯題懸賞】暗影記憶幻象 (待淨化: ' + wrongCount + ')</b>' +
                '<div style="display:flex; gap:5px;">' +
                  (wrongCount > 0
                    ? '<button class="na-btn highlight" style="padding:5px 10px;" onclick="Aetheria.UI.huntWrongQuestion()">出擊討伐</button>'
                    : '<button class="na-btn highlight" style="padding:5px 10px;" onclick="Aetheria.UI.deliverWrongBounty()">交付領獎</button>') +
                  '<button class="na-btn" style="padding:5px 8px;" onclick="Aetheria.UI.abandonBounty(\'bounty_wrong_shadow\')">放棄</button>' +
                '</div>' +
              '</div>' +
              '<div style="font-size:13px; margin-top:4px;">擊敗錯題幻象將錯題清零後，即可點擊「交付領獎」獲雙倍聲望與秘銀礦 x2！</div>';
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
              '<b style="font-size:15px;">' + cleanText(b.title) + '</b>' +
              '<div style="display:flex; gap:5px;">' +
                '<button class="na-btn ' + (canDeliver ? 'highlight' : '') + '" style="padding:5px 10px;" onclick="Aetheria.UI.deliverGuildBounty(\'' + b.id + '\')">' + (canDeliver ? '交付完成' : '物資未齊') + '</button>' +
                '<button class="na-btn" style="padding:5px 8px;" onclick="Aetheria.UI.abandonBounty(\'' + b.id + '\')">放棄</button>' +
              '</div>' +
            '</div>' +
            '<div style="font-size:13px; margin:4px 0;">需求進度：' + cleanText(Helper.formatCostText(s.inventory, b.cost)) + '</div>' +
            '<div style="font-size:13px; color:#1d5eb8; font-weight:bold;">報酬：' + cleanText(b.rewardText) + '</div>';
          body.appendChild(aCard);
        });
      }

      const boardHeader = document.createElement("div");
      boardHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:10px 0 5px; font-size:15px;";
      boardHeader.innerHTML = S.iconHtml("icon_scroll") + "【公會懸賞公告板】（先接受委託，完成後交付）";
      body.appendChild(boardHeader);

      if (s.activeBounties.indexOf("bounty_wrong_shadow") === -1) {
        const wrongCount = (s.wrongBook || []).length;
        const wCard = document.createElement("div");
        wCard.className = "sys-card";
        wCard.style.borderColor = "#9d4edd";
        wCard.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b style="color:#e0aaff; font-size:15px;">【S級錯題懸賞】討伐暗影記憶幻象 (錯題: ' + wrongCount + ')</b>' +
            '<button class="na-btn highlight" style="padding:5px 10px;" onclick="Aetheria.UI.acceptBounty(\'bounty_wrong_shadow\')">接受委託</button>' +
          '</div>' +
          '<div style="font-size:13px; color:#cbd5e1; margin-top:4px;">接取後可挑戰曾答錯的題目，淨化完成可獲雙倍聲望與流沙秘銀 x2。</div>';
        body.appendChild(wCard);
      }

      window.Aetheria.Data.GUILD_BOUNTIES.forEach(function(b) {
        if (s.activeBounties.indexOf(b.id) !== -1) return;
        const bCard = document.createElement("div");
        bCard.className = "sys-card";
        bCard.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b style="color:var(--na-gold); font-size:15px;">' + cleanText(b.title) + '</b>' +
            '<button class="na-btn highlight" style="padding:5px 10px;" onclick="Aetheria.UI.acceptBounty(\'' + b.id + '\')">接受委託</button>' +
          '</div>' +
          '<div style="font-size:13px; color:#cbd5e1; margin:4px 0;">' + cleanText(b.desc) + '</div>' +
          '<div style="font-size:13px; color:#8ce0ff;">報酬：' + cleanText(b.rewardText) + '</div>';
        body.appendChild(bCard);
      });
    },

    acceptBounty: function(bId) {
      const s = window.Aetheria.State.data;
      if (!Array.isArray(s.activeBounties)) s.activeBounties = [];
      if (s.activeBounties.indexOf(bId) !== -1) return;

      if (s.activeBounties.length >= MAX_ACTIVE_BOUNTIES) {
        this.showToast("同時最多只能接受 " + MAX_ACTIVE_BOUNTIES + " 張委託！請先交付或放棄現有委託。");
        return;
      }
      s.activeBounties.push(bId);
      window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.State.save();
      this.showToast("已接受委託！（進行中：" + s.activeBounties.length + "/" + MAX_ACTIVE_BOUNTIES + "）");
      this.openGuildModal();
    },

    abandonBounty: function(bId) {
      const s = window.Aetheria.State.data;
      s.activeBounties = (s.activeBounties || []).filter(function(id) { return id !== bId; });
      window.Aetheria.State.save();
      this.showToast("已放棄該項委託。");
      this.openGuildModal();
    },

    deliverGuildBounty: function(bountyId) {
      const s = window.Aetheria.State.data;
      if ((s.activeBounties || []).indexOf(bountyId) === -1) return;

      const b = window.Aetheria.Data.GUILD_BOUNTIES.find(function(item) { return item.id === bountyId; });
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!b || !Helper.payCost(s.inventory, b.cost)) {
        this.showToast("委託所需物資尚未集齊！請先去野外採集。");
        return;
      }
      s.activeBounties = s.activeBounties.filter(function(id) { return id !== bountyId; });
      b.onComplete(s);
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast("委託交付成功！獲得：" + cleanText(b.rewardText));
      this.openGuildModal();
      this.updateAllHud();
    },

    deliverWrongBounty: function() {
      const s = window.Aetheria.State.data;
      if ((s.wrongBook || []).length > 0) {
        this.showToast("尚有未淨化的錯題幻象，請點「出擊討伐」！");
        return;
      }
      s.activeBounties = (s.activeBounties || []).filter(function(id) { return id !== "bounty_wrong_shadow"; });
      s.inventory.mithril += 2;
      s.questProgress.bountiesCleared = (s.questProgress.bountiesCleared || 0) + 1;
      window.Aetheria.State.gainRewards(100, 120, 35);
      window.Aetheria.Audio.sfxLevelUp();
      this.showToast("特級錯題委託交付完成！獲得【流沙秘銀 x2】與聲望 +35！");
      this.openGuildModal();
      this.updateAllHud();
    },

    claimGuildSupply: function() {
      const s = window.Aetheria.State.data;
      const rankInfo = window.Aetheria.Data.GUILD_RANKS.find(function(r) { return r.rank === s.guildRank; }) || window.Aetheria.Data.GUILD_RANKS[0];
      s.inventory.iron += rankInfo.dailyIron;
      s.inventory.potionHint += rankInfo.dailyPotion;
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.showToast("領取【" + rankInfo.name + "】補給：藍晶鐵礦 +" + rankInfo.dailyIron + "、洞察藥水 +" + rankInfo.dailyPotion + "！");
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
        this.openGuildModal();
        this.updateAllHud();
      }
    },

    huntWrongQuestion: function() {
      const s = window.Aetheria.State.data;
      if (!s.wrongBook || s.wrongBook.length === 0) return;
      const targetQId = s.wrongBook[0];
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
      this.showToast("煉金藥水溫室建造完成！今後每答對 5 題將自動產出洞察藥水！");
      this.openGuildModal();
    },

    // ================= 4. 鐵匠鋪：4 大分類 Tab + 完成前一級才解鎖下一級 =================
    openForgeModal: function(activeTab) {
      activeTab = activeTab || "weapon";
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const inv = s.inventory;
      const Helper = window.Aetheria.Data.CraftingHelper;
      const self = this;

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_forge") + "曙光鐵匠工坊 (分類階梯式鍛造)";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const tabBar = document.createElement("div");
      tabBar.className = "tab-bar";
      [
        { id: "weapon",  label: "武器鍛造", icon: "icon_sword" },
        { id: "tool",    label: "工具升級", icon: "icon_forge" },
        { id: "relic",   label: "聖物飾品", icon: "icon_shield" },
        { id: "alchemy", label: "煉金提煉", icon: "icon_potion" }
      ].forEach(function(t) {
        const b = document.createElement("button");
        b.className = "na-btn" + (activeTab === t.id ? " highlight" : "");
        b.innerHTML = S.iconHtml(t.icon) + t.label;
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
            const canCraft = Helper.canAfford(inv, w.cost);
            const card = document.createElement("div");
            card.className = owned ? "sys-card-scroll" : "sys-card";
            card.innerHTML =
              '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<b style="font-size:15px;">' + S.iconHtml("icon_sword") + '[Tier ' + w.tier + '] ' + cleanText(w.name) + ' (ATK +' + w.atk + ')</b>' +
                '<div style="display:flex; gap:5px;">' +
                  (!owned ? '<button class="na-btn" style="padding:4px 8px;" onclick="Aetheria.UI.pinWeapon(\'' + w.id + '\')">釘選</button>' : '') +
                  (owned
                    ? '<button class="na-btn ' + (equipped ? 'highlight' : '') + '" style="padding:5px 10px;" onclick="Aetheria.UI.equipWeapon(\'' + w.id + '\')">' + (equipped ? '已裝備' : '裝備') + '</button>'
                    : '<button class="na-btn ' + (canCraft ? 'highlight' : '') + '" style="padding:5px 10px;" onclick="Aetheria.UI.craftWeapon(\'' + w.id + '\')">鍛造</button>') +
                '</div>' +
              '</div>' +
              '<div style="font-size:13px; margin-top:4px;">' + cleanText(w.desc) + '</div>' +
              (!owned ? '<div style="font-size:13px; margin-top:4px;">需求：' + cleanText(Helper.formatCostText(inv, w.cost)) + '</div>' : '');
            body.appendChild(card);
          } else if (w.tier === highestOwnedTier + 2) {
            const lockCard = document.createElement("div");
            lockCard.className = "sys-card";
            lockCard.style.opacity = "0.55";
            lockCard.innerHTML = '<b style="font-size:15px;">[Tier ' + w.tier + ' 未解鎖配方] ???</b><div style="font-size:13px; color:#ff595e; margin-top:3px;">需先完成【Tier ' + (highestOwnedTier + 1) + '】武器鍛造後才會揭曉此配方！</div>';
            body.appendChild(lockCard);
          }
        });
      }

      else if (activeTab === "tool") {
        Object.entries(window.Aetheria.Data.TOOLS_UPGRADE).forEach(function(entry) {
          const tKey = entry[0];
          const tDef = entry[1];
          const curLv = s.tools[tKey] || 1;
          const nextLv = curLv + 1;
          const nextData = tDef.levels[nextLv];

          const tCard = document.createElement("div");
          tCard.className = "sys-card";
          tCard.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="font-size:15px;">' + S.iconHtml("icon_forge") + cleanText(tDef.name) + ' Lv.' + curLv + '（' + tDef.levels[curLv].title + '）</b>' +
              (nextData
                ? '<button class="na-btn highlight" style="padding:5px 10px;" onclick="Aetheria.UI.upgradeTool(\'' + tKey + '\')">升至 Lv.' + nextLv + '</button>'
                : '<span style="color:#5ac54f; font-weight:bold;">已滿階</span>') +
            '</div>' +
            '<div style="font-size:13px; color:#cbd5e1; margin-top:4px;">當前效果：' + cleanText(tDef.levels[curLv].desc) + '</div>' +
            (nextData ? '<div style="font-size:13px; color:var(--na-gold); margin-top:4px;">下一階【Lv.' + nextLv + ' ' + nextData.title + '】：' + cleanText(nextData.desc) + '<br>需求：' + cleanText(Helper.formatCostText(inv, nextData.cost)) + '</div>' : '');
          body.appendChild(tCard);
        });
      }

      else if (activeTab === "relic") {
        const relicList = Object.values(window.Aetheria.Data.RELICS);
        const ownedCount = (s.unlockedRelics || []).length;

        relicList.forEach(function(rel, idx) {
          const owned = s.unlockedRelics && s.unlockedRelics.indexOf(rel.id) !== -1;
          if (owned || idx <= ownedCount) {
            const canCraft = Helper.canAfford(inv, rel.cost);
            const rCard = document.createElement("div");
            rCard.className = owned ? "sys-card-scroll" : "sys-card";
            rCard.innerHTML =
              '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<b style="font-size:15px;">' + S.iconHtml("icon_shield") + '[聖物 ' + (idx + 1) + '] ' + cleanText(rel.name) + '</b>' +
                (owned
                  ? '<span style="color:#1d5eb8; font-weight:900;">已生效</span>'
                  : '<button class="na-btn ' + (canCraft ? 'highlight' : '') + '" style="padding:5px 10px;" onclick="Aetheria.UI.craftRelic(\'' + rel.id + '\')">鍛造聖物</button>') +
              '</div>' +
              '<div style="font-size:13px; margin-top:4px;">' + cleanText(rel.desc) + '</div>' +
              (!owned ? '<div style="font-size:13px; margin-top:4px;">需求：' + cleanText(Helper.formatCostText(inv, rel.cost)) + '</div>' : '');
            body.appendChild(rCard);
          } else {
            const lockCard = document.createElement("div");
            lockCard.className = "sys-card";
            lockCard.style.opacity = "0.55";
            lockCard.innerHTML = '<b style="font-size:15px;">[聖物 ' + (idx + 1) + ' 未解鎖] ???</b><div style="font-size:13px; color:#ff595e; margin-top:3px;">請先完成前一件古文明聖物的鍛造。</div>';
            body.appendChild(lockCard);
          }
        });
      }

      else if (activeTab === "alchemy") {
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
              '<b style="font-size:15px;">' + S.iconHtml("icon_potion") + cleanText(c.name) + '</b>' +
              '<div style="font-size:13px; color:#cbd5e1; margin-top:2px;">消耗：' + fromMat.name + ' (擁有 ' + have + ' / 需 ' + c.fromCount + ')</div>' +
            '</div>' +
            '<button class="na-btn ' + (have >= c.fromCount ? 'highlight' : '') + '" style="padding:6px 12px;" onclick="Aetheria.UI.alchemyConvert(\'' + c.id + '\')">提煉</button>';
          body.appendChild(row);
        });
      }
    },

    pinWeapon: function(wId) {
      window.Aetheria.State.data.pinnedRecipe = wId;
      window.Aetheria.State.save();
      this.updateAllHud();
      this.showToast("已將配方釘選至下半屏資訊框追蹤！");
    },

    craftWeapon: function(wId) {
      const s = window.Aetheria.State.data;
      const w = window.Aetheria.Data.WEAPONS[wId];
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!w || !Helper.payCost(s.inventory, w.cost)) {
        this.showToast("鍛造素材不足！可去野外採集或切換至「煉金提煉」合成。");
        return;
      }
      s.unlockedWeapons.push(wId);
      s.equippedWeapon = wId;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast("鍛造成功！已裝備【" + cleanText(w.name) + "】並解鎖下一階神兵配方！");
      this.openForgeModal("weapon");
      this.updateAllHud();
    },

    craftRelic: function(rId) {
      const s = window.Aetheria.State.data;
      const rel = window.Aetheria.Data.RELICS[rId];
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!rel || !Helper.payCost(s.inventory, rel.cost)) {
        this.showToast("鍛造聖物所需素材不足！");
        return;
      }
      if (!s.unlockedRelics) s.unlockedRelics = [];
      s.unlockedRelics.push(rId);
      if (rel.onCraft) rel.onCraft(s);
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast("聖物鍛造成功！【" + cleanText(rel.name) + "】永久被動已生效！");
      this.openForgeModal("relic");
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
      if (!nextData || !Helper.payCost(s.inventory, nextData.cost)) {
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
          '<b style="font-size:16px;">' + S.iconHtml(selSpKey, true) + '【' + selMat.name + '】 (持有：' + selCount + ')</b>' +
          (selectedKey === "potionHeal" && selCount > 0
            ? '<button class="na-btn highlight" style="padding:5px 12px;" onclick="Aetheria.UI.useBagHealPotion()">立即飲用 (+60 HP)</button>'
            : '<span style="font-size:12px; color:#5c3824; font-weight:bold;">Tier ' + selMat.tier + ' 素材</span>') +
        '</div>' +
        '<div style="font-size:14px; margin-top:4px;">用途說明：' + selMat.desc + '</div>';
      body.appendChild(detailBox);

      const grid = document.createElement("div");
      grid.className = "bag-grid";

      Object.keys(mats).forEach(function(k) {
        const m = mats[k];
        const count = inv[k] || 0;
        const spKey = getItemSpriteKey(k);
        const slot = document.createElement("div");
        slot.className = "bag-slot" + (k === selectedKey ? " active" : "");
        slot.style.opacity = count > 0 ? "1" : "0.45";
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
        this.showToast("生命值已經是滿的，無需飲用藥水！");
        return;
      }
      s.inventory.potionHeal--;
      s.hp = Math.min(s.maxHp, s.hp + 60);
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.updateAllHud();
      this.openBagModal("potionHeal");
      this.showToast("已飲用生命藥水，回復 60 點生命值！");
    },

    // ================= 6. 職業與戰寵頁面 =================
    openJobPetModal: function() {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_sword") + "古文明職業祠堂 & 同行戰寵牧場";

      const body = document.getElementById("modal-body");
      body.innerHTML = '<div style="color:var(--na-gold); font-weight:900; margin-bottom:6px; font-size:15px;">【同行戰寵切換】（轉職「荒野獵人」可同時帶 2 隻戰寵上場）</div>';

      Object.values(window.Aetheria.Data.PETS).forEach(function(p) {
        const unlocked = s.unlockedPets.indexOf(p.id) !== -1;
        const isActive = (s.activePet === p.id);
        const isShiny = s.shinyPets && s.shinyPets.indexOf(p.id) !== -1;
        const spKey = isShiny ? p.shinySpriteKey : p.spriteKey;

        const pCard = document.createElement("div");
        pCard.className = unlocked ? "sys-card-scroll" : "sys-card";
        pCard.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b style="font-size:15px;">' + S.iconHtml(spKey, true) + (isShiny ? '[異色閃光] ' : '') + cleanText(p.name) + '</b>' +
            (unlocked
              ? '<button class="na-btn ' + (isActive ? 'highlight' : '') + '" style="padding:5px 10px;" onclick="Aetheria.UI.selectPet(\'' + p.id + '\')">' + (isActive ? '同行中' : '攜帶同行') + '</button>'
              : '<button class="na-btn" style="padding:5px 10px;" onclick="Aetheria.UI.quickUnlockPet(\'' + p.id + '\')">誘餌果x2 契約</button>') +
          '</div>' +
          '<div style="font-size:13px; margin-top:4px;">技能【' + p.skillName + '】：' + p.skillDesc + '</div>';
        body.appendChild(pCard);
      });

      const jobHeader = document.createElement("div");
      jobHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:10px 0 6px; font-size:15px;";
      jobHeader.innerText = "【六大古文明職業轉職】";
      body.appendChild(jobHeader);

      Object.values(window.Aetheria.Data.JOBS).forEach(function(j) {
        const unlocked = s.unlockedJobs.indexOf(j.id) !== -1 || s.lv >= j.unlockLv;
        const active = (s.currentJob === j.id);

        const jCard = document.createElement("div");
        jCard.className = unlocked ? "sys-card-scroll" : "sys-card";
        jCard.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b style="font-size:15px;">' + S.iconHtml("icon_sword") + cleanText(j.name) + '（' + j.title + '｜ATK x' + j.atkMult + '）</b>' +
            (unlocked
              ? '<button class="na-btn ' + (active ? 'highlight' : '') + '" style="padding:5px 10px;" onclick="Aetheria.UI.selectJob(\'' + j.id + '\')">' + (active ? '當前職業' : '轉職') + '</button>'
              : '<span style="font-size:13px; color:#ff595e; font-weight:bold;">Lv.' + j.unlockLv + ' 解鎖</span>') +
          '</div>' +
          '<div style="font-size:13px; margin-top:4px;">' + j.passiveDesc + '</div>';
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
        this.showToast("需要 2 顆【靈獸誘餌果】！可在戰鬥殘血收服或在鐵匠煉金爐調配。");
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
      if (s.unlockedJobs.indexOf(jobId) === -1) s.unlockedJobs.push(jobId);
      s.currentJob = jobId;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast("已轉職為【" + cleanText(window.Aetheria.Data.JOBS[jobId].name) + "】！");
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
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_gear") + "系統設定：星象調頻 / 題型預覽 / 存檔與重置";

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
          { key: "chinese",    name: "中文科（龍語古卷：字詞四選一、例句候選字拼字）" },
          { key: "english",    name: "英文科（阿爾比恩：全盲像素鍵盤串字、例句四選一）" },
          { key: "science",    name: "科學科（煉金真理：實驗圖看圖填充、情境推理、簡答）" },
          { key: "humanities", name: "人文科（歷史紀元：左右多重連線配對、地形圖題）" }
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
            '<button class="na-btn ' + (on ? 'highlight' : '') + '" style="padding:6px 12px;" onclick="Aetheria.UI.toggleSubject(\'' + sub.key + '\')">' + (on ? '已啟用' : '未啟用') + '</button>';
          body.appendChild(row);
        });
      }

      else if (tab === "preview") {
        window.Aetheria.QuizBridge.getAllQuestions().forEach(function(q, idx) {
          const btn = document.createElement("button");
          btn.className = "na-btn";
          btn.style.cssText = "width:100%; text-align:left; padding:9px 12px; margin-bottom:6px; font-size:14px;";
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
          '<div style="font-weight:900; margin-bottom:6px; font-size:15px;">Justin 四科古文明符文掌握度報告（最高連勝：' + (s.maxStreak || 0) + ' 題）</div>' +
          Object.values(subjStats).map(function(st) {
            const pct = st.total > 0 ? Math.round((st.mastered / st.total) * 100) : 0;
            return '<div style="display:flex; justify-content:space-between; font-size:14px; margin:4px 0;">' +
              '<span>' + st.name + '：已掌握 <b>' + st.mastered + '/' + st.total + '</b> 題 (' + pct + '%)</span>' +
              '<span style="color:#8f563b; font-weight:bold;">熟練星級 ★' + st.stars + '</span>' +
            '</div>';
          }).join("");
        body.appendChild(repCard);
      }

      else if (tab === "system") {
        const sysCard = document.createElement("div");
        sysCard.className = "sys-card";
        sysCard.innerHTML =
          '<div style="color:var(--na-gold); font-weight:900; margin-bottom:8px; font-size:15px;">音效、存檔備份與重置管理</div>' +
          '<div style="display:flex; flex-direction:column; gap:8px;">' +
            '<button class="na-btn" style="padding:10px;" onclick="Aetheria.Audio.toggleMute(); Aetheria.UI.showToast(\'已切換背景音樂與音效開關！\');">切換 8-bit 背景音樂 (開 / 關)</button>' +
            '<button class="na-btn highlight" style="padding:10px;" onclick="Aetheria.UI.exportSavePrompt()">複製存檔 JSON 代碼 (備份進度)</button>' +
            '<button class="na-btn" style="padding:10px;" onclick="Aetheria.UI.importSavePrompt()">貼上存檔 JSON 代碼 (還原進度)</button>' +
            '<button class="na-btn" style="padding:10px;" onclick="document.getElementById(\'title-screen\').style.display=\'flex\'; Aetheria.UI.initTitleScreen();">返回遊戲首頁標題畫面</button>' +
            '<button class="na-btn" style="padding:10px; background:#a32c24; border-color:#ff595e;" onclick="if(confirm(\'警告：確定要徹底刪除所有存檔進度並重置遊戲嗎？\')) Aetheria.State.resetSave()">重置遊戲 (清除所有進度重新開始)</button>' +
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
        this.showToast("存檔還原成功！");
        this.updateAllHud();
        this.openSettingsModal("system");
      } else if (raw) {
        this.showToast("存檔格式不正確！");
      }
    }
  };

  window.Aetheria.UI = UIManager;

  // ================= 60FPS 防崩潰自癒主引擎啟動器 =================
  function startMainGameLoop() {
    try { window.Aetheria.Data.Sprites.init(); } catch (e) { console.error("Sprites init err:", e); }
    try {
      window.Aetheria.State.init();
      sanitizePlayerPosition();
    } catch (e) { console.error("State init err:", e); }

    try { window.Aetheria.UI.decorateNavIcons(); } catch (e) { console.error("decorateNavIcons err:", e); }
    try { window.Aetheria.UI.initTitleScreen(); } catch (e) { console.error("initTitleScreen err:", e); }
    try { window.Aetheria.UI.updateAllHud(); } catch (e) { console.error("updateAllHud err:", e); }
    try {
      if (window.Aetheria.Explore && window.Aetheria.Explore.initControls) {
        window.Aetheria.Explore.initControls();
      }
    } catch (e) { console.error("Explore initControls err:", e); }

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
      } catch (err) {
        console.error("Frame error:", err);
      }
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
