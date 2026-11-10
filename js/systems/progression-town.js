/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 首頁、背包、設定、公會接單上限、階梯式分類鍛造總管 (progression-town.js - v3.0)
 * 升級：1.遊戲首頁 (Title Screen)：繼續遊戲 (自動偵測存檔) / 新遊戲
 *       2.傳送陣：必須角色步行進入過該區 (s.unlockedZones.includes) 才開放傳送按鈕
 *       3.冒險者公會：先接受委託 (上限最多 3 張) ➔ 才顯示進度與「交付完成」按鈕
 *       4.鐵匠鋪：4 大分類 Tab (武器 / 聖物 / 工具 / 煉金)，且完成前一階才顯示下一階配方！
 *       5.獨立「背包 (Bag)」頁面：分類格仔展示所有收集素材與消耗品，支援直接使用藥水
 *       6.獨立「設定 (Settings)」頁面：整合星象調頻、題型預覽、四科報告、存檔備份與「重置遊戲」
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const MAX_ACTIVE_BOUNTIES = 3;

  function cleanText(str) {
    if (!str) return "";
    return String(str).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "").trim();
  }

  const UIManager = {
    // ================= 0. 遊戲首頁 (Title Screen：繼續遊戲 / 新遊戲) =================
    initTitleScreen() {
      const Sprites = window.Aetheria.Data.Sprites;
      const previewBox = document.getElementById("title-hero-preview");
      if (previewBox) {
        previewBox.innerHTML = `
          <img src="${Sprites.getDataURL("pet_slime")}" alt="Slime">
          <img src="${Sprites.getDataURL("hero_down_0")}" style="width:68px;height:68px;" alt="Hero">
          <img src="${Sprites.getDataURL("pet_dragon")}" alt="Dragon">
        `;
      }

      const hasSave = window.Aetheria.State.hasExistingSave();
      const btnCont = document.getElementById("btn-continue-game");
      const infoEl = document.getElementById("continue-save-info");

      if (hasSave) {
        const sum = window.Aetheria.State.getSaveSummary();
        const mapObj = window.Aetheria.Data.Maps.getMap(sum.zone);
        if (btnCont) btnCont.classList.remove("disabled");
        if (infoEl) infoEl.innerText = `存檔紀錄：Lv.${sum.lv}｜公會 ${sum.guildRank} 級｜位於【${mapObj.name}】`;
      } else {
        if (btnCont) btnCont.classList.add("disabled");
        if (infoEl) infoEl.innerText = "尚無存檔紀錄，請選擇「新遊戲」";
      }
    },

    continueGame() {
      if (!window.Aetheria.State.hasExistingSave()) return;
      window.Aetheria.State.init();
      document.getElementById("title-screen").style.display = "none";
      const mapObj = window.Aetheria.Data.Maps.getMap(window.Aetheria.State.data.currentZone);
      window.Aetheria.Audio.playBgm(mapObj.bgm || "forest");
      this.updateAllHud();
      this.showToast(`歡迎回來！當前位於【${mapObj.name}】`);
    },

    startNewGame() {
      if (window.Aetheria.State.hasExistingSave()) {
        if (!confirm("開啟「新遊戲」將會覆蓋現有存檔進度，確定要重新開始嗎？")) return;
      }
      window.Aetheria.State.startFreshNewGame();
      window.Aetheria.Data.Maps.refreshAllResources();
      document.getElementById("title-screen").style.display = "none";
      window.Aetheria.Audio.playBgm("forest");
      this.updateAllHud();
      this.showToast("新冒險展開！請先在【0.曙光露營基地】找鐵匠大叔・巴爾對話！");
    },

    // ================= 基礎面板與 HUD 控制 =================
    setActivePanel(panelId) {
      document.querySelectorAll(".sub-panel").forEach(p => p.classList.remove("active"));
      const target = document.getElementById(panelId);
      if (target) target.classList.add("active");
    },

    closePanelToExplore() {
      this.setActivePanel("panel-explore");
      this.updateAllHud();
    },

    showToast(msg) {
      const t = document.getElementById("toast-banner");
      if (!t) return;
      t.innerText = cleanText(msg);
      t.style.display = "block";
      clearTimeout(t._timer);
      t._timer = setTimeout(() => { t.style.display = "none"; }, 2800);
    },

    spawnFloatingText(text, color = "#ffffff", onEnemy = true) {
      const stage = document.getElementById("upper-screen");
      if (!stage) return;
      const el = document.createElement("div");
      el.className = "floating-text";
      el.style.color = color;
      el.style.left = onEnemy ? "58%" : "14%";
      el.style.top = "44%";
      el.innerText = cleanText(text);
      stage.appendChild(el);
      setTimeout(() => el.remove(), 880);
    },

    updateAllHud() {
      const s = window.Aetheria.State.data;
      const jobs = window.Aetheria.Data.JOBS;
      const weapons = window.Aetheria.Data.WEAPONS;
      const pets = window.Aetheria.Data.PETS;
      const materials = window.Aetheria.Data.MATERIALS;

      const jobName = jobs[s.currentJob] ? cleanText(jobs[s.currentJob].name) : "蒼藍劍士";
      const wepName = weapons[s.equippedWeapon] ? cleanText(weapons[s.equippedWeapon].name) : "新手忍刀";

      const lvEl = document.getElementById("hud-lv");
      if (lvEl) lvEl.innerText = `Lv.${s.lv} ${jobName}・${wepName} (ATK ${window.Aetheria.State.getTotalAtk()})`;

      const petObj = pets[s.activePet] || pets.pet_slime;
      const isShiny = s.shinyPets && s.shinyPets.includes(s.activePet);
      const hunterDual = (s.currentJob === "hunter" && s.unlockedPets.length >= 2) ? "+副寵" : "";
      const petEl = document.getElementById("hud-pet");
      if (petEl) petEl.innerText = `戰寵：${isShiny ? "[閃光]" : ""}${cleanText(petObj.name)}${hunterDual}`;

      const guildEl = document.getElementById("hud-guild");
      if (guildEl) guildEl.innerText = `公會：${s.guildRank}級 (${s.guildPoints}pt)`;

      const pinBox = document.getElementById("pinned-recipe");
      if (pinBox) {
        const pinWep = weapons[s.pinnedRecipe] || weapons.w_tide;
        const costParts = [];
        for (const [k, req] of Object.entries(pinWep.cost || {})) {
          const m = materials[k] || { name: k };
          costParts.push(`${m.name.slice(0, 3)} ${s.inventory[k] || 0}/${req}`);
        }
        pinBox.innerHTML = `釘選：${cleanText(pinWep.name)} (${costParts.join("｜") || "已擁有"})`;
      }

      const questEl = document.getElementById("hud-quest");
      if (questEl) {
        const mq = window.Aetheria.Data.getCurrentMainQuest(s);
        if (mq) {
          const done = mq.checkComplete(s);
          questEl.innerHTML = done
            ? `<b>${cleanText(mq.title)} (已完成！點【公會】領獎)</b>`
            : `${mq.chapter}：${cleanText(mq.title)}`;
          questEl.style.borderColor = done ? "#5ac54f" : "#f5b700";
        } else {
          questEl.innerHTML = `主線全破！無盡試煉之塔最高：第 ${s.maxTowerFloor} 層`;
        }
      }

      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
      this.updateHudZoneDynamic(mapObj, s);
    },

    updateHudZoneDynamic(mapObj, s) {
      const zoneBadge = document.getElementById("hud-zone");
      if (!zoneBadge || !mapObj) return;

      const effLv = mapObj.recLv || 1;
      const diff = effLv - s.lv;

      if (mapObj.id === "camp_hub" || mapObj.id === "tent_guild" || mapObj.id === "tent_forge") {
        zoneBadge.className = "na-badge danger-safe";
        zoneBadge.innerText = `${mapObj.name} (安全區)`;
      } else if (diff <= 2) {
        zoneBadge.className = "na-badge danger-safe";
        zoneBadge.innerText = `${mapObj.name} (推薦 Lv.${effLv})`;
      } else if (diff <= 6) {
        zoneBadge.className = "na-badge danger-warn";
        zoneBadge.innerText = `${mapObj.name} (警戒 Lv.${effLv})`;
      } else {
        zoneBadge.className = "na-badge danger-deadly";
        zoneBadge.innerText = `${mapObj.name} (高危 Lv.${effLv})`;
      }
    },

    // ================= 1. NPC 對話與旅人指令 =================
    openNpcDialogue(npcId) {
      const s = window.Aetheria.State.data;
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
        pCtx.clearRect(0, 0, 36, 36);
        const sp = window.Aetheria.Data.Sprites.get(npc.sprite);
        if (sp) pCtx.drawImage(sp, 2, 2, 32, 32);
      }

      const btnGrid = document.getElementById("npc-action-buttons");
      btnGrid.innerHTML = "";

      const srvBtn = document.createElement("button");
      srvBtn.className = "na-btn highlight";
      srvBtn.style.gridColumn = "span 2";
      srvBtn.style.padding = "7px";
      srvBtn.innerText = cleanText(npc.serviceLabel);
      srvBtn.onclick = () => {
        if (npc.serviceAction === "openAstrolabeModal") this.openSettingsModal("astrolabe");
        else if (this[npc.serviceAction]) this[npc.serviceAction]();
      };
      btnGrid.appendChild(srvBtn);

      (npc.pathActions || []).forEach(pa => {
        const btn = document.createElement("button");
        btn.className = "na-btn";
        btn.style.textAlign = "left";
        btn.style.padding = "6px";
        btn.innerHTML = `<div style="color:var(--na-gold);">${cleanText(pa.label)}</div><div style="font-size:10px; font-weight:normal; color:#cbd5e1;">${cleanText(pa.desc)}</div>`;
        btn.onclick = () => {
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

    // ================= 2. 傳送陣 (必須角色曾步行進入該區才開放傳送！) =================
    openWorldMapModal() {
      const s = window.Aetheria.State.data;
      const unlockedList = s.unlockedZones || ["camp_hub"];

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerText = `大陸傳送陣 (已探索解鎖：${unlockedList.length} / ${window.Aetheria.Data.Maps.ORDERED_WORLD_ZONES.length} 區)`;

      const body = document.getElementById("modal-body");
      body.innerHTML = `<div style="margin-bottom:6px; color:#cbd5e1; font-size:11px;">規則：必須先操控角色由地圖邊界<b>步行進入</b>下一區域，才可點亮該區的傳送石碑！</div>`;

      window.Aetheria.Data.Maps.ORDERED_WORLD_ZONES.forEach(z => {
        const isUnlocked = unlockedList.includes(z.id);
        const isCurrent = (s.currentZone === z.id);
        const card = document.createElement("div");
        card.className = isUnlocked ? "sys-card-scroll" : "sys-card";

        if (isUnlocked) {
          card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <b style="font-size:12px;">${z.name}</b>
              <button class="na-btn highlight" style="padding:4px 10px;" onclick="Aetheria.UI.teleportToZone('${z.id}', ${z.x}, ${z.y})">${isCurrent ? "刷新資源" : "傳送"}</button>
            </div>
            <div style="font-size:11px; margin-top:3px;">${z.desc}</div>
          `;
        } else {
          card.style.opacity = "0.55";
          card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <b style="color:#8d99ae; font-size:12px;">[未探索區域] ${z.name}</b>
              <span style="font-size:10px; color:#ff595e; font-weight:bold;">需步行進入解鎖</span>
            </div>
            <div style="font-size:10px; color:#8d99ae; margin-top:2px;">請先由前一區域的出口步行抵達此處以開啟傳送石碑。</div>
          `;
        }
        body.appendChild(card);
      });
    },

    teleportToZone(zoneId, tx, ty) {
      const s = window.Aetheria.State.data;
      if (!(s.unlockedZones || []).includes(zoneId)) {
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
      this.showToast(`已傳送至【${mapObj.name}】！`);
    },

    // ================= 3. 冒險者公會：先接受委託 (上限 3 張) ➔ 才顯示並交付 =================
    openGuildModal() {
      const s = window.Aetheria.State.data;
      if (!Array.isArray(s.activeBounties)) s.activeBounties = [];

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerText = `記憶共鳴者公會 (${s.guildRank}級｜聲望 ${s.guildPoints}pt)`;

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      // 頂部：領取每日階級補給 + 建造溫室
      const ghLv = s.campBuildings.greenhouse || 0;
      const topBar = document.createElement("div");
      topBar.style.cssText = "display:flex; gap:5px; margin-bottom:6px;";
      topBar.innerHTML = `
        <button class="na-btn highlight" style="flex:1; padding:6px;" onclick="Aetheria.UI.claimGuildSupply()">領取 ${s.guildRank} 級俸祿補給</button>
        ${ghLv === 0
          ? `<button class="na-btn" style="flex:1; padding:6px;" onclick="Aetheria.UI.buildGreenhouse()">建造煉金溫室(木2鐵2)</button>`
          : `<button class="na-btn" style="flex:1; padding:6px; opacity:0.8;" onclick="Aetheria.UI.showToast('煉金溫室運作中：每答對5題自動產出洞察藥水！')">煉金溫室運作中</button>`
        }
      `;
      body.appendChild(topBar);

      // A. 主線任務領獎區
      const mq = window.Aetheria.Data.getCurrentMainQuest(s);
      if (mq) {
        const isDone = mq.checkComplete(s);
        const mqCard = document.createElement("div");
        mqCard.className = "sys-card-scroll";
        mqCard.innerHTML = `
          <div style="font-weight:900; color:#8f563b;">【當前主線】${mq.chapter}：${cleanText(mq.title)}</div>
          <div style="font-size:11px; margin:3px 0;">${cleanText(mq.desc)}</div>
          <div style="font-size:11px; color:#1d5eb8; font-weight:bold;">獎勵：${cleanText(mq.rewardText)}</div>
          ${isDone ? `<button class="na-btn highlight" style="width:100%; margin-top:5px; padding:6px;" onclick="Aetheria.UI.claimMainQuest('${mq.id}')">任務達成！點擊領取主線獎勵</button>` : ""}
        `;
        body.appendChild(mqCard);
      }

      // B. 已接受的委託欄 (上限 3 張 — 必須先在此欄才能交付完成！)
      const activeHeader = document.createElement("div");
      activeHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:6px 0 4px;";
      activeHeader.innerText = `【進行中委託】(${s.activeBounties.length} / ${MAX_ACTIVE_BOUNTIES} 張上限 — 集齊物資後在此交付)`;
      body.appendChild(activeHeader);

      const Helper = window.Aetheria.Data.CraftingHelper;

      if (s.activeBounties.length === 0) {
        const emptyCard = document.createElement("div");
        emptyCard.className = "sys-card";
        emptyCard.style.color = "#8d99ae";
        emptyCard.innerText = "目前尚未接受任何委託。請從下方「公會懸賞板」選擇並接受委託（最多同時接 3 張）。";
        body.appendChild(emptyCard);
      } else {
        s.activeBounties.forEach(bId => {
          if (bId === "bounty_wrong_shadow") {
            const wrongCount = (s.wrongBook || []).length;
            const sCard = document.createElement("div");
            sCard.className = "sys-card-scroll";
            sCard.innerHTML = `
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <b>【特級錯題懸賞】討伐暗影記憶幻象 (待淨化: ${wrongCount})</b>
                <div style="display:flex; gap:4px;">
                  ${wrongCount > 0
                    ? `<button class="na-btn highlight" style="padding:3px 8px;" onclick="Aetheria.UI.huntWrongQuestion()">出擊討伐</button>`
                    : `<button class="na-btn highlight" style="padding:3px 8px;" onclick="Aetheria.UI.deliverWrongBounty()">交付領獎</button>`
                  }
                  <button class="na-btn" style="padding:3px 6px;" onclick="Aetheria.UI.abandonBounty('bounty_wrong_shadow')">放棄</button>
                </div>
              </div>
              <div style="font-size:11px; margin-top:2px;">擊敗錯題幻象將錯題清零後，即可點擊「交付領獎」獲雙倍聲望與秘銀礦 x2！</div>
            `;
            body.appendChild(sCard);
            return;
          }

          const b = window.Aetheria.Data.GUILD_BOUNTIES.find(item => item.id === bId);
          if (!b) return;
          const canDeliver = Helper.canAfford(s.inventory, b.cost);

          const aCard = document.createElement("div");
          aCard.className = "sys-card-scroll";
          aCard.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <b>${cleanText(b.title)}</b>
              <div style="display:flex; gap:4px;">
                <button class="na-btn ${canDeliver ? "highlight" : ""}" style="padding:3px 8px;" onclick="Aetheria.UI.deliverGuildBounty('${b.id}')">${canDeliver ? "交付完成" : "物資未齊"}</button>
                <button class="na-btn" style="padding:3px 6px;" onclick="Aetheria.UI.abandonBounty('${b.id}')">放棄</button>
              </div>
            </div>
            <div style="font-size:11px; margin:2px 0;">進度：${cleanText(Helper.formatCostText(s.inventory, b.cost))}</div>
            <div style="font-size:11px; color:#1d5eb8; font-weight:bold;">報酬：${cleanText(b.rewardText)}</div>
          `;
          body.appendChild(aCard);
        });
      }

      // C. 公會懸賞公告板 (尚未接取的委託池)
      const boardHeader = document.createElement("div");
      boardHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:8px 0 4px;";
      boardHeader.innerText = "【公會懸賞公告板】（請先接受委託，完成後再交付）";
      body.appendChild(boardHeader);

      // 特級錯題懸賞單
      if (!s.activeBounties.includes("bounty_wrong_shadow")) {
        const wrongCount = (s.wrongBook || []).length;
        const wCard = document.createElement("div");
        wCard.className = "sys-card";
        wCard.style.borderColor = "#9d4edd";
        wCard.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b style="color:#e0aaff;">【S級錯題懸賞】討伐暗影記憶幻象 (當前錯題: ${wrongCount} 題)</b>
            <button class="na-btn highlight" style="padding:4px 10px;" onclick="Aetheria.UI.acceptBounty('bounty_wrong_shadow')">接受委託</button>
          </div>
          <div style="font-size:11px; color:#cbd5e1; margin-top:2px;">接取後可專門挑戰曾答錯的題目，淨化完成可獲雙倍聲望與流沙秘銀 x2。</div>
        `;
        body.appendChild(wCard);
      }

      window.Aetheria.Data.GUILD_BOUNTIES.forEach(b => {
        if (s.activeBounties.includes(b.id)) return;
        const bCard = document.createElement("div");
        bCard.className = "sys-card";
        bCard.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b style="color:var(--na-gold);">${cleanText(b.title)}</b>
            <button class="na-btn highlight" style="padding:4px 10px;" onclick="Aetheria.UI.acceptBounty('${b.id}')">接受委託</button>
          </div>
          <div style="font-size:11px; color:#cbd5e1; margin:2px 0;">${cleanText(b.desc)}</div>
          <div style="font-size:11px; color:#8ce0ff;">報酬：${cleanText(b.rewardText)}</div>
        `;
        body.appendChild(bCard);
      });
    },

    acceptBounty(bId) {
      const s = window.Aetheria.State.data;
      if (!Array.isArray(s.activeBounties)) s.activeBounties = [];
      if (s.activeBounties.includes(bId)) return;

      if (s.activeBounties.length >= MAX_ACTIVE_BOUNTIES) {
        this.showToast(`同時最多只能接受 ${MAX_ACTIVE_BOUNTIES} 張委託！請先交付或放棄現有委託。`);
        return;
      }
      s.activeBounties.push(bId);
      window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.State.save();
      this.showToast(`已接受委託！（當前進行中：${s.activeBounties.length}/${MAX_ACTIVE_BOUNTIES}）`);
      this.openGuildModal();
    },

    abandonBounty(bId) {
      const s = window.Aetheria.State.data;
      s.activeBounties = (s.activeBounties || []).filter(id => id !== bId);
      window.Aetheria.State.save();
      this.showToast("已放棄該項委託。");
      this.openGuildModal();
    },

    deliverGuildBounty(bountyId) {
      const s = window.Aetheria.State.data;
      if (!(s.activeBounties || []).includes(bountyId)) return;

      const b = window.Aetheria.Data.GUILD_BOUNTIES.find(item => item.id === bountyId);
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!b || !Helper.payCost(s.inventory, b.cost)) {
        this.showToast("委託所需物資尚未集齊！請先去野外採集。");
        return;
      }
      s.activeBounties = s.activeBounties.filter(id => id !== bountyId);
      b.onComplete(s);
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast(`委託交付成功！獲得：${cleanText(b.rewardText)}`);
      this.openGuildModal();
      this.updateAllHud();
    },

    deliverWrongBounty() {
      const s = window.Aetheria.State.data;
      if ((s.wrongBook || []).length > 0) {
        this.showToast("尚有未淨化的錯題幻象，請點「出擊討伐」！");
        return;
      }
      s.activeBounties = (s.activeBounties || []).filter(id => id !== "bounty_wrong_shadow");
      s.inventory.mithril += 2;
      s.questProgress.bountiesCleared = (s.questProgress.bountiesCleared || 0) + 1;
      window.Aetheria.State.gainRewards(100, 120, 35);
      window.Aetheria.Audio.sfxLevelUp();
      this.showToast("特級錯題委託交付完成！獲得【流沙秘銀 x2】与聲望 +35！");
      this.openGuildModal();
      this.updateAllHud();
    },

    claimGuildSupply() {
      const s = window.Aetheria.State.data;
      const rankInfo = window.Aetheria.Data.GUILD_RANKS.find(r => r.rank === s.guildRank) || window.Aetheria.Data.GUILD_RANKS[0];
      s.inventory.iron += rankInfo.dailyIron;
      s.inventory.potionHint += rankInfo.dailyPotion;
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.showToast(`領取【${rankInfo.name}】補給：藍晶鐵礦 +${rankInfo.dailyIron}、洞察藥水 +${rankInfo.dailyPotion}！`);
      this.updateAllHud();
    },

    claimMainQuest(mqId) {
      const s = window.Aetheria.State.data;
      const mq = window.Aetheria.Data.MAIN_QUESTS.find(q => q.id === mqId);
      if (mq && mq.checkComplete(s) && !s.questProgress[`claimed_${mqId}`]) {
        s.questProgress[`claimed_${mqId}`] = true;
        mq.onClaim(s);
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.State.save();
        this.showToast(`完成主線【${cleanText(mq.title)}】！獲得 ${cleanText(mq.rewardText)}！`);
        this.openGuildModal();
        this.updateAllHud();
      }
    },

    huntWrongQuestion() {
      const s = window.Aetheria.State.data;
      if (!s.wrongBook || s.wrongBook.length === 0) return;
      const targetQId = s.wrongBook[0];
      window.Aetheria.Battle.startBattle(
        { name: "暗影記憶幻象", lv: Math.max(3, s.lv), type: "skull", isBoss: false, forceShiny: true },
        "bounty",
        targetQId
      );
    },

    buildGreenhouse() {
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

    // ================= 4. 鐵匠鋪：4 大分類 Tab + 階梯式解鎖（完成前一級才顯示下一級！） =================
    openForgeModal(activeTab = "weapon") {
      const s = window.Aetheria.State.data;
      const inv = s.inventory;
      const Helper = window.Aetheria.Data.CraftingHelper;

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerText = "曙光鐵匠工坊 (分類階梯式鍛造)";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      // 頂部 4 大分類頁籤 (武器鍛造 / 聖物飾品 / 工具升級 / 煉金提煉)
      const tabBar = document.createElement("div");
      tabBar.className = "tab-bar";
      const tabs = [
        { id: "weapon",  label: "武器鍛造" },
        { id: "tool",    label: "工具升級" },
        { id: "relic",   label: "聖物飾品" },
        { id: "alchemy", label: "煉金提煉" }
      ];
      tabs.forEach(t => {
        const b = document.createElement("button");
        b.className = "na-btn" + (activeTab === t.id ? " highlight" : "");
        b.innerText = t.label;
        b.onclick = () => this.openForgeModal(t.id);
        tabBar.appendChild(b);
      });
      body.appendChild(tabBar);

      // 分類 1：武器鍛造（嚴格執行：完成前一階 tier，才顯示下一階配方！）
      if (activeTab === "weapon") {
        const weaponList = Object.values(window.Aetheria.Data.WEAPONS).sort((a, b) => a.tier - b.tier);
        let highestOwnedTier = 1;
        weaponList.forEach(w => {
          if (s.unlockedWeapons.includes(w.id) && w.tier > highestOwnedTier) {
            highestOwnedTier = w.tier;
          }
        });

        weaponList.forEach(w => {
          const owned = s.unlockedWeapons.includes(w.id);
          const equipped = (s.equippedWeapon === w.id);

          // 規則：只顯示已擁有的武器，以及「當前最高已擁有階級 + 1」的下一把武器！更高階顯示為鎖定未知
          if (w.tier <= highestOwnedTier + 1) {
            const canCraft = Helper.canAfford(inv, w.cost);
            const card = document.createElement("div");
            card.className = owned ? "sys-card-scroll" : "sys-card";
            card.innerHTML = `
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <b>[Tier ${w.tier}] ${cleanText(w.name)} (ATK +${w.atk}｜破盾 +${1 + (w.shieldBreak || 0)})</b>
                <div style="display:flex; gap:4px;">
                  ${!owned ? `<button class="na-btn" style="padding:2px 6px;" onclick="Aetheria.UI.pinWeapon('${w.id}')">釘選</button>` : ""}
                  ${owned
                    ? `<button class="na-btn ${equipped ? "highlight" : ""}" style="padding:3px 8px;" onclick="Aetheria.UI.equipWeapon('${w.id}')">${equipped ? "已裝備" : "裝備"}</button>`
                    : `<button class="na-btn ${canCraft ? "highlight" : ""}" style="padding:3px 8px;" onclick="Aetheria.UI.craftWeapon('${w.id}')">鍛造</button>`
                  }
                </div>
              </div>
              <div style="font-size:11px; margin-top:2px;">${cleanText(w.desc)}</div>
              ${!owned ? `<div style="font-size:11px; margin-top:2px;">需求：${cleanText(Helper.formatCostText(inv, w.cost))}</div>` : ""}
            `;
            body.appendChild(card);
          } else if (w.tier === highestOwnedTier + 2) {
            const lockCard = document.createElement("div");
            lockCard.className = "sys-card";
            lockCard.style.opacity = "0.5";
            lockCard.innerHTML = `<b>[Tier ${w.tier} 未解鎖配方] ???</b><div style="font-size:11px; color:#ff595e; margin-top:2px;">需先完成【Tier ${highestOwnedTier + 1}】武器鍛造後才會揭曉此配方！</div>`;
            body.appendChild(lockCard);
          }
        });
      }

      // 分類 2：四大探索工具升級（每種工具只顯示當前等級 -> 下一級！）
      else if (activeTab === "tool") {
        Object.entries(window.Aetheria.Data.TOOLS_UPGRADE).forEach(([tKey, tDef]) => {
          const curLv = s.tools[tKey] || 1;
          const nextLv = curLv + 1;
          const nextData = tDef.levels[nextLv];

          const tCard = document.createElement("div");
          tCard.className = "sys-card";
          tCard.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <b>${cleanText(tDef.name)} Lv.${curLv}（${tDef.levels[curLv].title}）</b>
              ${nextData
                ? `<button class="na-btn highlight" style="padding:3px 8px;" onclick="Aetheria.UI.upgradeTool('${tKey}')">升至 Lv.${nextLv}</button>`
                : `<span style="color:#5ac54f; font-weight:bold;">已達最高階</span>`
              }
            </div>
            <div style="font-size:11px; color:#cbd5e1; margin-top:3px;">當前效果：${cleanText(tDef.levels[curLv].desc)}</div>
            ${nextData ? `<div style="font-size:11px; color:var(--na-gold); margin-top:3px;">下一階【Lv.${nextLv} ${nextData.title}】：${cleanText(nextData.desc)}<br>升級需求：${cleanText(Helper.formatCostText(inv, nextData.cost))}</div>` : ""}
          `;
          body.appendChild(tCard);
        });
      }

      // 分類 3：聖物飾品（完成前一件聖物才解鎖下一件！）
      else if (activeTab === "relic") {
        const relicList = Object.values(window.Aetheria.Data.RELICS);
        const ownedCount = (s.unlockedRelics || []).length;

        relicList.forEach((rel, idx) => {
          const owned = s.unlockedRelics && s.unlockedRelics.includes(rel.id);
          if (owned || idx <= ownedCount) {
            const canCraft = Helper.canAfford(inv, rel.cost);
            const rCard = document.createElement("div");
            rCard.className = owned ? "sys-card-scroll" : "sys-card";
            rCard.innerHTML = `
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <b>[聖物 ${idx + 1}] ${cleanText(rel.name)}</b>
                ${owned
                  ? `<span style="color:#1d5eb8; font-weight:900;">已生效</span>`
                  : `<button class="na-btn ${canCraft ? "highlight" : ""}" style="padding:3px 8px;" onclick="Aetheria.UI.craftRelic('${rel.id}')">鍛造聖物</button>`
                }
              </div>
              <div style="font-size:11px; margin-top:2px;">${cleanText(rel.desc)}</div>
              ${!owned ? `<div style="font-size:11px; margin-top:2px;">需求：${cleanText(Helper.formatCostText(inv, rel.cost))}</div>` : ""}
            `;
            body.appendChild(rCard);
          } else {
            const lockCard = document.createElement("div");
            lockCard.className = "sys-card";
            lockCard.style.opacity = "0.5";
            lockCard.innerHTML = `<b>[聖物 ${idx + 1} 未解鎖] ???</b><div style="font-size:11px; color:#ff595e;">請先完成前一件古文明聖物的鍛造。</div>`;
            body.appendChild(lockCard);
          }
        });
      }

      // 分類 4：萬能煉金提煉爐
      else if (activeTab === "alchemy") {
        window.Aetheria.Data.ALCHEMY_CONVERSIONS.forEach(c => {
          const fromMat = window.Aetheria.Data.MATERIALS[c.fromKey];
          const have = inv[c.fromKey] || 0;
          const row = document.createElement("div");
          row.className = "sys-card";
          row.style.display = "flex";
          row.style.justifyContent = "space-between";
          row.style.alignItems = "center";
          row.innerHTML = `
            <div>
              <b>${cleanText(c.name)}</b>
              <div style="font-size:10px; color:#cbd5e1;">消耗：${fromMat.name} (擁有 ${have} / 需 ${c.fromCount})</div>
            </div>
            <button class="na-btn ${have >= c.fromCount ? "highlight" : ""}" style="padding:4px 10px;" onclick="Aetheria.UI.alchemyConvert('${c.id}')">提煉</button>
          `;
          body.appendChild(row);
        });
      }
    },

    pinWeapon(wId) {
      window.Aetheria.State.data.pinnedRecipe = wId;
      window.Aetheria.State.save();
      this.updateAllHud();
      this.showToast("已將配方釘選至右上角 HUD 追蹤！");
    },

    craftWeapon(wId) {
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
      this.showToast(`鍛造成功！已裝備【${cleanText(w.name)}】並解鎖下一階神兵配方！`);
      this.openForgeModal("weapon");
      this.updateAllHud();
    },

    craftRelic(rId) {
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
      this.showToast(`聖物鍛造成功！【${cleanText(rel.name)}】永久被動已生效！`);
      this.openForgeModal("relic");
      this.updateAllHud();
    },

    equipWeapon(wId) {
      const s = window.Aetheria.State.data;
      if (s.unlockedWeapons.includes(wId)) {
        s.equippedWeapon = wId;
        window.Aetheria.State.save();
        this.openForgeModal("weapon");
        this.updateAllHud();
      }
    },

    upgradeTool(toolKey) {
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
      this.showToast(`${cleanText(tDef.name)} 已升級為【Lv.${curLv + 1} ${nextData.title}】！`);
      this.openForgeModal("tool");
    },

    alchemyConvert(convId) {
      const s = window.Aetheria.State.data;
      const conv = window.Aetheria.Data.ALCHEMY_CONVERSIONS.find(c => c.id === convId);
      if (!conv || (s.inventory[conv.fromKey] || 0) < conv.fromCount) {
        this.showToast("原料數量不足！");
        return;
      }
      s.inventory[conv.fromKey] -= conv.fromCount;
      s.inventory[conv.toKey] = (s.inventory[conv.toKey] || 0) + conv.toCount;
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.showToast(`煉金成功：${cleanText(conv.name)}！`);
      this.openForgeModal("alchemy");
      this.updateAllHud();
    },

    // ================= 5. 新增！獨立「背包 (Bag)」頁面 =================
    openBagModal(selectedKey = "iron") {
      const s = window.Aetheria.State.data;
      const inv = s.inventory;
      const mats = window.Aetheria.Data.MATERIALS;

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerText = `冒險者背包 (金幣：${s.gold} G｜HP：${s.hp}/${s.maxHp})`;

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      // 頂部選中物品詳情與「使用」框
      const selMat = mats[selectedKey] || mats.iron;
      const selCount = inv[selectedKey] || 0;
      const detailBox = document.createElement("div");
      detailBox.className = "sys-card-scroll";
      detailBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <b>【${selMat.name}】 (持有數量：${selCount})</b>
          ${selectedKey === "potionHeal" && selCount > 0
            ? `<button class="na-btn highlight" style="padding:3px 10px;" onclick="Aetheria.UI.useBagHealPotion()">立即飲用 (+60 HP)</button>`
            : `<span style="font-size:10px; color:#5c3824;">階級 Tier ${selMat.tier}</span>`
          }
        </div>
        <div style="font-size:11px; margin-top:3px;">用途說明：${selMat.desc}</div>
      `;
      body.appendChild(detailBox);

      // 背包格仔網格展示所有素材與消耗品
      const grid = document.createElement("div");
      grid.className = "bag-grid";

      Object.keys(mats).forEach(k => {
        const m = mats[k];
        const count = inv[k] || 0;
        const slot = document.createElement("div");
        slot.className = "bag-slot" + (k === selectedKey ? " active" : "");
        slot.style.opacity = count > 0 ? "1" : "0.42";
        slot.innerHTML = `
          <div class="bag-slot-name">${m.name}</div>
          <div class="bag-slot-count">x${count}</div>
        `;
        slot.onclick = () => this.openBagModal(k);
        grid.appendChild(slot);
      });

      body.appendChild(grid);
    },

    useBagHealPotion() {
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
    openJobPetModal() {
      const s = window.Aetheria.State.data;
      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerText = "古文明職業祠堂 & 同行戰寵牧場";

      const body = document.getElementById("modal-body");
      body.innerHTML = `<div style="color:var(--na-gold); font-weight:900; margin-bottom:4px;">【同行戰寵切換】（轉職「荒野獵人」可同時帶 2 隻戰寵上場）</div>`;

      Object.values(window.Aetheria.Data.PETS).forEach(p => {
        const unlocked = s.unlockedPets.includes(p.id);
        const isActive = (s.activePet === p.id);
        const isShiny = s.shinyPets && s.shinyPets.includes(p.id);

        const pCard = document.createElement("div");
        pCard.className = unlocked ? "sys-card-scroll" : "sys-card";
        pCard.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b>${isShiny ? "[異色閃光] " : ""}${cleanText(p.name)} — ${p.skillName}</b>
            ${unlocked
              ? `<button class="na-btn ${isActive ? "highlight" : ""}" style="padding:3px 8px;" onclick="Aetheria.UI.selectPet('${p.id}')">${isActive ? "主戰寵" : "設為主寵"}</button>`
              : `<button class="na-btn" style="padding:3px 8px;" onclick="Aetheria.UI.quickUnlockPet('${p.id}')">誘餌果x2 契約</button>`
            }
          </div>
          <div style="font-size:11px; margin-top:2px;">${p.skillDesc}</div>
        `;
        body.appendChild(pCard);
      });

      const jobHeader = document.createElement("div");
      jobHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:8px 0 4px;";
      jobHeader.innerText = "【六大古文明職業轉職】";
      body.appendChild(jobHeader);

      Object.values(window.Aetheria.Data.JOBS).forEach(j => {
        const unlocked = s.unlockedJobs.includes(j.id) || s.lv >= j.unlockLv;
        const active = (s.currentJob === j.id);

        const jCard = document.createElement("div");
        jCard.className = unlocked ? "sys-card-scroll" : "sys-card";
        jCard.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b>${cleanText(j.name)}（${j.title}｜ATK x${j.atkMult}）</b>
            ${unlocked
              ? `<button class="na-btn ${active ? "highlight" : ""}" style="padding:3px 8px;" onclick="Aetheria.UI.selectJob('${j.id}')">${active ? "當前職業" : "轉職"}</button>`
              : `<span style="font-size:11px; color:#ff595e;">Lv.${j.unlockLv} 解鎖</span>`
            }
          </div>
          <div style="font-size:11px; margin-top:2px;">${j.passiveDesc}</div>
        `;
        body.appendChild(jCard);
      });
    },

    selectPet(petId) {
      const s = window.Aetheria.State.data;
      if (s.unlockedPets.includes(petId)) {
        s.activePet = petId;
        window.Aetheria.Audio.sfxGather();
        window.Aetheria.State.save();
        this.openJobPetModal();
        this.updateAllHud();
      }
    },

    quickUnlockPet(petId) {
      const s = window.Aetheria.State.data;
      if ((s.inventory.tameFruit || 0) < 2) {
        this.showToast("需要 2 顆【靈獸誘餌果】！可在戰鬥殘血收服或在鐵匠煉金爐調配。");
        return;
      }
      s.inventory.tameFruit -= 2;
      if (!s.unlockedPets.includes(petId)) s.unlockedPets.push(petId);
      s.activePet = petId;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast("成功締結戰寵契約！");
      this.openJobPetModal();
      this.updateAllHud();
    },

    selectJob(jobId) {
      const s = window.Aetheria.State.data;
      if (!s.unlockedJobs.includes(jobId)) s.unlockedJobs.push(jobId);
      s.currentJob = jobId;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast(`已轉職為【${cleanText(window.Aetheria.Data.JOBS[jobId].name)}】！`);
      this.openJobPetModal();
      this.updateAllHud();
    },

    // ================= 7. 新增！獨立「設定 (Settings)」頁面 (整合調頻、題型預覽、四科報告與重置遊戲) =================
    openSettingsModal(tab = "astrolabe") {
      const s = window.Aetheria.State.data;
      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerText = "系統設定：星象調頻 / 題型預覽 / 存檔與重置";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const tabBar = document.createElement("div");
      tabBar.className = "tab-bar";
      [
        { id: "astrolabe", label: "星象調頻" },
        { id: "preview",   label: "題型預覽" },
        { id: "report",    label: "四科報告" },
        { id: "system",    label: "存檔/重置" }
      ].forEach(t => {
        const b = document.createElement("button");
        b.className = "na-btn" + (tab === t.id ? " highlight" : "");
        b.innerText = t.label;
        b.onclick = () => this.openSettingsModal(t.id);
        tabBar.appendChild(b);
      });
      body.appendChild(tabBar);

      // 頁籤 1：星象儀溫習科目調頻
      if (tab === "astrolabe") {
        const subjects = [
          { key: "chinese",    name: "中文科（龍語古卷：字詞四選一、例句候選字拼字）" },
          { key: "english",    name: "英文科（阿爾比恩：全盲像素鍵盤串字、例句四選一）" },
          { key: "science",    name: "科學科（煉金真理：實驗圖看圖填充、情境推理、簡答）" },
          { key: "humanities", name: "人文科（歷史紀元：左右多重連線配對、地形圖題）" }
        ];
        subjects.forEach(sub => {
          const on = Boolean(s.activeSubjects[sub.key]);
          const row = document.createElement("div");
          row.className = "sys-card";
          row.style.display = "flex";
          row.style.justifyContent = "space-between";
          row.style.alignItems = "center";
          row.innerHTML = `
            <span style="font-size:11px;">${sub.name}</span>
            <button class="na-btn ${on ? "highlight" : ""}" style="padding:4px 10px;" onclick="Aetheria.UI.toggleSubject('${sub.key}')">${on ? "已啟用" : "未啟用"}</button>
          `;
          body.appendChild(row);
        });
      }

      // 頁籤 2：7 大題型快速預覽
      else if (tab === "preview") {
        window.Aetheria.QuizBridge.getAllQuestions().forEach((q, idx) => {
          const btn = document.createElement("button");
          btn.className = "na-btn";
          btn.style.cssText = "width:100%; text-align:left; padding:7px 10px; margin-bottom:5px;";
          btn.innerHTML = `${idx + 1}. <b>[${cleanText(q.subjectLabel)}]</b> — ${cleanText(q.typeLabel)}`;
          btn.onclick = () => {
            window.Aetheria.Battle.startBattle(null, "combat", q.id);
          };
          body.appendChild(btn);
        });
      }

      // 頁籤 3：四科掌握度報告与圖鑑統計
      else if (tab === "report") {
        const allQ = window.Aetheria.QuizBridge.getAllQuestions();
        const subjStats = {
          chinese:    { name: "中文科", total: 0, mastered: 0, stars: 0 },
          english:    { name: "英文科", total: 0, mastered: 0, stars: 0 },
          science:    { name: "科學科", total: 0, mastered: 0, stars: 0 },
          humanities: { name: "人文科", total: 0, mastered: 0, stars: 0 }
        };
        allQ.forEach(q => {
          const st = subjStats[q.subject];
          if (st) {
            st.total++;
            const m = s.questionMastery && s.questionMastery[q.id];
            if (m && m.stars > 0) { st.mastered++; st.stars += m.stars; }
          }
        });

        const repCard = document.createElement("div");
        repCard.className = "sys-card-scroll";
        repCard.innerHTML = `
          <div style="font-weight:900; margin-bottom:4px;">Justin 四科古文明符文掌握度報告（最高連勝：${s.maxStreak || 0} 題）</div>
          ${Object.values(subjStats).map(st => {
            const pct = st.total > 0 ? Math.round((st.mastered / st.total) * 100) : 0;
            return `<div style="display:flex; justify-content:space-between; font-size:11px; margin:3px 0;">
              <span>${st.name}：已掌握 <b>${st.mastered}/${st.total}</b> 題 (${pct}%)</span>
              <span style="color:#8f563b; font-weight:bold;">熟練星級 ★${st.stars}</span>
            </div>`;
          }).join("")}
        `;
        body.appendChild(repCard);
      }

      // 頁籤 4：存檔備份、返回首頁與「重置遊戲」
      else if (tab === "system") {
        const sysCard = document.createElement("div");
        sysCard.className = "sys-card";
        sysCard.innerHTML = `
          <div style="color:var(--na-gold); font-weight:900; margin-bottom:6px;">存檔備份與系統管理</div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <button class="na-btn highlight" style="padding:8px;" onclick="Aetheria.UI.exportSavePrompt()">複製存檔 JSON 代碼 (備份進度)</button>
            <button class="na-btn" style="padding:8px;" onclick="Aetheria.UI.importSavePrompt()">貼上存檔 JSON 代碼 (還原進度)</button>
            <button class="na-btn" style="padding:8px;" onclick="document.getElementById('title-screen').style.display='flex'; Aetheria.UI.initTitleScreen();">返回遊戲首頁標題畫面</button>
            <button class="na-btn" style="padding:8px; background:#a32c24; border-color:#ff595e;" onclick="if(confirm('警告：確定要徹底刪除所有存檔進度並重置遊戲嗎？')) Aetheria.State.resetSave()">重置遊戲 (清除所有進度重新開始)</button>
          </div>
        `;
        body.appendChild(sysCard);
      }
    },

    toggleSubject(key) {
      const s = window.Aetheria.State.data;
      s.activeSubjects[key] = !s.activeSubjects[key];
      window.Aetheria.State.save();
      this.openSettingsModal("astrolabe");
    },

    exportSavePrompt() {
      const json = window.Aetheria.State.exportJSON();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(json).then(() => {
          this.showToast("存檔 JSON 已複製到剪貼簿！");
        }).catch(() => {
          prompt("請複製以下存檔 JSON 代碼：", json);
        });
      } else {
        prompt("請複製以下存檔 JSON 代碼：", json);
      }
    },

    importSavePrompt() {
      const raw = prompt("請貼上先前備份的存檔 JSON 代碼：");
      if (raw && window.Aetheria.State.importJSON(raw)) {
        this.showToast("存檔還原成功！");
        this.updateAllHud();
        this.openSettingsModal("system");
      } else if (raw) {
        this.showToast("存檔格式不正確！");
      }
    }
  };

  window.Aetheria.UI = UIManager;

  // ================= 60FPS 遊戲主引擎啟動器 =================
  function startMainGameLoop() {
    window.Aetheria.Data.Sprites.init();
    window.Aetheria.State.init();
    window.Aetheria.Explore.initControls();
    window.Aetheria.UI.initTitleScreen();
    window.Aetheria.UI.updateAllHud();

    // 同步音效按鈕文字 (不帶 Emoji)
    const origToggle = window.Aetheria.Audio.toggleMute.bind(window.Aetheria.Audio);
    window.Aetheria.Audio.toggleMute = function() {
      origToggle();
      const btn = document.getElementById("btn-bgm-toggle");
      if (btn) btn.innerText = (btn.innerText.includes("🔇") || btn.innerText === "BGM:關") ? "BGM:關" : "BGM:開";
    };

    function frameStep() {
      window.Aetheria.Renderer.tick++;
      if (!window.Aetheria.Battle.active) {
        window.Aetheria.Explore.updateStep();
        window.Aetheria.Renderer.renderWorld();
      }
      requestAnimationFrame(frameStep);
    }

    requestAnimationFrame(frameStep);
  }

  window.addEventListener("load", startMainGameLoop);
})();
