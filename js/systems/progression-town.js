/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 公會養成、鐵匠鍛造、NPC旅人對話、轉職與主迴圈總管 (progression-town.js)
 * 包含：1.HUD與主線任務追蹤 2.NPC對話與旅人指令 3.冒險者公會與錯題懸賞
 *       4.鐵匠鋪與工具升級/煉金轉化 5.六大職業與戰寵切換 6.世界地圖傳送與60FPS啟動器
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const UIManager = {
    // 切換下半屏活躍面板
    setActivePanel(panelId) {
      document.querySelectorAll(".sub-panel").forEach(p => p.classList.remove("active"));
      const target = document.getElementById(panelId);
      if (target) target.classList.add("active");
    },

    closePanelToExplore() {
      this.setActivePanel("panel-explore");
      this.updateAllHud();
    },

    // 浮動提示橫幅
    showToast(msg) {
      const t = document.getElementById("toast-banner");
      if (!t) return;
      t.innerText = msg;
      t.style.display = "block";
      clearTimeout(t._timer);
      t._timer = setTimeout(() => { t.style.display = "none"; }, 2800);
    },

    // 浮動戰鬥傷害/暴擊跳字
    spawnFloatingText(text, color = "#ffffff", onEnemy = true) {
      const stage = document.getElementById("upper-screen");
      if (!stage) return;
      const el = document.createElement("div");
      el.className = "floating-text";
      el.style.color = color;
      el.style.left = onEnemy ? "56%" : "14%";
      el.style.top = "36%";
      el.innerText = text;
      stage.appendChild(el);
      setTimeout(() => el.remove(), 880);
    },

    // 全面更新頂部雙側 HUD、釘選配方與主線任務追蹤
    updateAllHud() {
      const s = window.Aetheria.State.data;
      const jobs = window.Aetheria.Data.JOBS;
      const weapons = window.Aetheria.Data.WEAPONS;
      const pets = window.Aetheria.Data.PETS;
      const materials = window.Aetheria.Data.MATERIALS;

      const jobName = jobs[s.currentJob] ? jobs[s.currentJob].name.replace(/^[^\s]+\s/, "") : "劍士";
      const wepName = weapons[s.equippedWeapon] ? weapons[s.equippedWeapon].name.replace(/^[^\s]+\s/, "") : "忍刀";

      const lvEl = document.getElementById("hud-lv");
      if (lvEl) lvEl.innerText = `Lv.${s.lv} ${jobName}・${wepName} (ATK ${window.Aetheria.State.getTotalAtk()})`;

      const petObj = pets[s.activePet] || pets.pet_slime;
      const isShiny = s.shinyPets && s.shinyPets.includes(s.activePet);
      const petEl = document.getElementById("hud-pet");
      if (petEl) petEl.innerText = `${isShiny ? "✨" : ""}${petObj.name}`;

      const guildEl = document.getElementById("hud-guild");
      if (guildEl) guildEl.innerText = `🛡️ ${s.guildRank}級 (${s.guildPoints}pt)`;

      // 更新釘選配方進度
      const pinBox = document.getElementById("pinned-recipe");
      if (pinBox) {
        const pinWep = weapons[s.pinnedRecipe] || weapons.w_tide;
        const costParts = [];
        for (const [k, req] of Object.entries(pinWep.cost || {})) {
          const m = materials[k] || { name: k };
          costParts.push(`${m.name.slice(0, 3)} ${s.inventory[k] || 0}/${req}`);
        }
        pinBox.innerHTML = `📌 ${pinWep.name.replace(/^[^\s]+\s/, "")}：${costParts.join("｜") || "已擁有"}`;
      }

      // 更新當前主線任務追蹤
      const questEl = document.getElementById("hud-quest");
      if (questEl) {
        const mq = window.Aetheria.Data.getCurrentMainQuest(s);
        if (mq) {
          const done = mq.checkComplete(s);
          questEl.innerHTML = done
            ? `🎉 <b>${mq.title} (已完成！點【🛡️公會】領獎)</b>`
            : `📜 ${mq.chapter}：${mq.title}`;
          questEl.style.borderColor = done ? "#5ac54f" : "#f5b700";
        } else {
          questEl.innerHTML = `👑 主線全破！挑戰《無盡試煉之塔》(最高 ${s.maxTowerFloor} 層)`;
        }
      }

      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
      this.updateHudZoneDynamic(mapObj, s);
    },

    // 根據主角在大地圖中的位置動態顯示子區域與三色危險度雷達
    updateHudZoneDynamic(mapObj, s) {
      const zoneBadge = document.getElementById("hud-zone");
      if (!zoneBadge || !mapObj) return;

      let displayTitle = mapObj.name;
      let effLv = mapObj.recLv || 1;

      if (mapObj.id === "forest_world") {
        if (s.heroX > 700) { displayTitle = "翡翠河東岸秘境"; effLv = 15; }
        else if (s.heroY > 470) { displayTitle = "南方藍晶礦脈區"; effLv = 4; }
        else if (s.heroY < 200) { displayTitle = "北方微光蘑菇林"; effLv = 2; }
        else if (s.heroX < 230) { displayTitle = "西方千年古樹區"; effLv = 5; }
        else { displayTitle = "中央露營基地"; effLv = 1; }
      }

      const diff = effLv - s.lv;
      if (diff <= 2) {
        zoneBadge.className = "na-badge danger-safe";
        zoneBadge.innerText = `🟢 ${displayTitle} (Lv.${effLv})`;
      } else if (diff <= 6) {
        zoneBadge.className = "na-badge danger-warn";
        zoneBadge.innerText = `🟡 ${displayTitle} (Lv.${effLv})`;
      } else {
        zoneBadge.className = "na-badge danger-deadly";
        zoneBadge.innerText = `🔴 ${displayTitle} (Lv.${effLv} 💀)`;
      }
    },

    // ================= 1. NPC 互動對話與《歧路旅人》式旅人技能視窗 =================
    openNpcDialogue(npcId) {
      const s = window.Aetheria.State.data;
      const npc = window.Aetheria.Data.NPCS_DB[npcId] || window.Aetheria.Data.NPCS_DB.npc_smith;

      // 標記序章主線「找鐵匠巴爾對話」完成
      if (npcId === "npc_smith") {
        s.questProgress.mq_01_talked = true;
        window.Aetheria.State.save();
        this.updateAllHud();
      }

      this.setActivePanel("panel-dialogue");
      document.getElementById("npc-name-label").innerText = npc.name;
      document.getElementById("npc-role-label").innerText = npc.role;
      document.getElementById("npc-speech-text").innerText = npc.greeting;

      // 繪製 NPC 像素頭像
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

      // 專屬服務主按鈕
      const srvBtn = document.createElement("button");
      srvBtn.className = "na-btn highlight";
      srvBtn.style.gridColumn = "span 2";
      srvBtn.style.padding = "7px";
      srvBtn.innerText = npc.serviceLabel;
      srvBtn.onclick = () => {
        if (this[npc.serviceAction]) this[npc.serviceAction]();
      };
      btnGrid.appendChild(srvBtn);

      // 旅人技能 (Path Actions: 探查 / 討教 / 議價 / 切磋)
      (npc.pathActions || []).forEach(pa => {
        const btn = document.createElement("button");
        btn.className = "na-btn";
        btn.style.textAlign = "left";
        btn.style.padding = "6px";
        btn.innerHTML = `<div style="color:var(--na-gold);">${pa.label}</div><div style="font-size:10px; font-weight:normal; color:#cbd5e1;">${pa.desc}</div>`;
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

    // ================= 2. 🗺️ 世界傳送陣與 100 層《無盡試煉之塔》選單 =================
    openWorldMapModal() {
      const s = window.Aetheria.State.data;
      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerText = "🗺️ 艾瑟瑞亞大陸傳送陣 & 秘境入口";

      const zones = [
        { id: "forest_world", name: "🟢 翠風大森林 & 中央露營基地 (Lv.1~5)", x: 420, y: 345, desc: "包含中央營地、北方微光蘑菇林、南方藍晶礦區與翡翠河木橋。" },
        { id: "mushroom_cave", name: "🟡 微光蘑菇地下洞窟 (Lv.5~9)", x: 280, y: 390, desc: "火把迷霧視野迷宮，盛產✨閃光秘銀礦，內有可炸開的裂縫密室！" },
        { id: "canyon_world", name: "🟡 流沙繩索大峽谷 (Lv.12~18)", x: 400, y: 340, desc: "綁麻繩年輪高台與綠洲商隊，盛產流沙秘銀與太陽靈花。" },
        { id: "abyss_sanctum", name: "🔴 深淵星隕聖殿 (Lv.25 💀極度危險)", x: 280, y: 380, desc: "深淵赤炎龍皇盤踞之地，可越級潛入偷開左上角【傳說神器寶箱】！" },
        { id: "endless_tower", name: `🏛️ 無盡試煉之塔 (當前最高：第 ${s.maxTowerFloor} 層)`, x: 250, y: 350, desc: "100 層 Roguelike 隨機生成迷宮，刷異色閃光寵與深淵星隕鐵！" }
      ];

      const body = document.getElementById("modal-body");
      body.innerHTML = `<div style="margin-bottom:6px; color:#cbd5e1;">點擊任一已發現的古代傳送石碑即可瞬間移動（並自動刷新野外礦脈）：</div>`;

      zones.forEach(z => {
        const card = document.createElement("div");
        card.className = "sys-card";
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b style="color:var(--na-gold); font-size:13px;">${z.name}</b>
            <button class="na-btn highlight" style="padding:4px 10px;" onclick="Aetheria.UI.teleportToZone('${z.id}', ${z.x}, ${z.y})">⚡ 傳送</button>
          </div>
          <div style="font-size:11px; color:#cbd5e1; margin-top:3px;">${z.desc}</div>
        `;
        body.appendChild(card);
      });
    },

    teleportToZone(zoneId, tx, ty) {
      const s = window.Aetheria.State.data;
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
      this.showToast(`⚡ 已瞬移至【${mapObj.name}】（野外礦脈已刷新）！`);
    },

    // ================= 3. 🛡️ 冒險者公會大廳（主線領獎、委託懸賞、🟣錯題討伐、營地建設） =================
    openGuildModal() {
      const s = window.Aetheria.State.data;
      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerText = `🛡️ 記憶共鳴者公會 (${s.guildRank}級｜聲望 ${s.guildPoints}pt)`;

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      // A. 主線劇情任務進度與領獎卡
      const mq = window.Aetheria.Data.getCurrentMainQuest(s);
      if (mq) {
        const isDone = mq.checkComplete(s);
        const mqCard = document.createElement("div");
        mqCard.className = "sys-card-scroll";
        mqCard.innerHTML = `
          <div style="font-weight:900; color:#8f563b;">🌟 【當前主線】${mq.chapter}：${mq.title}</div>
          <div style="font-size:11px; margin:3px 0;">${mq.desc}</div>
          <div style="font-size:11px; color:#1d5eb8; font-weight:bold;">🎁 獎勵：${mq.rewardText}</div>
          ${isDone ? `<button class="na-btn highlight" style="width:100%; margin-top:5px; padding:6px;" onclick="Aetheria.UI.claimMainQuest('${mq.id}')">🎊 任務達成！點擊領取主線獎勵</button>` : ""}
        `;
        body.appendChild(mqCard);
      }

      // B. 🟣 特級錯題魔導書懸賞討伐 (將曾答錯的題目化為雙倍賞金怪！)
      const wrongCount = (s.wrongBook || []).length;
      const shadowCard = document.createElement("div");
      shadowCard.className = "sys-card";
      shadowCard.style.borderColor = "#9d4edd";
      shadowCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <b style="color:#e0aaff;">🟣 【S級錯題懸賞】討伐暗影記憶幻象 (${wrongCount} 隻待討伐)</b>
          ${wrongCount > 0 ? `<button class="na-btn highlight" style="padding:4px 10px;" onclick="Aetheria.UI.huntWrongQuestion()">⚔️ 立即討伐</button>` : `<span style="color:#5ac54f; font-size:11px;">✅ 全數淨化</span>`}
        </div>
        <div style="font-size:11px; color:#cbd5e1; margin-top:3px;">專門挑戰你曾經答錯過的題目，擊敗後可獲<b>雙倍公會聲望、秘銀礦與魔物核心</b>！</div>
      `;
      body.appendChild(shadowCard);

      // C. 公會日常採集與料理委託板
      const Helper = window.Aetheria.Data.CraftingHelper;
      window.Aetheria.Data.GUILD_BOUNTIES.forEach(b => {
        const canDo = Helper.canAfford(s.inventory, b.cost);
        const bCard = document.createElement("div");
        bCard.className = "sys-card";
        bCard.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b style="color:var(--na-gold);">${b.title}</b>
            <button class="na-btn ${canDo ? "highlight" : ""}" style="padding:4px 10px;" onclick="Aetheria.UI.completeGuildBounty('${b.id}')">交付委託</button>
          </div>
          <div style="font-size:11px; color:#cbd5e1; margin:2px 0;">${b.desc}（需求：${Helper.formatCostText(s.inventory, b.cost)}）</div>
          <div style="font-size:11px; color:#8ce0ff;">🎁 報酬：${b.rewardText}</div>
        `;
        body.appendChild(bCard);
      });

      // D. 營地基地建設：煉金藥水溫室
      const ghLv = s.campBuildings.greenhouse || 0;
      const ghCard = document.createElement("div");
      ghCard.className = "sys-card";
      ghCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <b style="color:#5ac54f;">🏡 【營地建設】煉金藥水溫室 (Lv.${ghLv})</b>
          ${ghLv === 0 ? `<button class="na-btn highlight" style="padding:4px 10px;" onclick="Aetheria.UI.buildGreenhouse()">🔨 建造 (原木x2, 鐵礦x2)</button>` : `<span style="color:#5ac54f;">✅ 運作中</span>`}
        </div>
        <div style="font-size:11px; color:#cbd5e1; margin-top:2px;">建成後，每在戰鬥中答對 5 題，牧場戰寵挖礦時會額外自動產出 1 瓶【🧪 洞察藥水】！</div>
      `;
      body.appendChild(ghCard);
    },

    claimMainQuest(mqId) {
      const s = window.Aetheria.State.data;
      const mq = window.Aetheria.Data.MAIN_QUESTS.find(q => q.id === mqId);
      if (mq && mq.checkComplete(s) && !s.questProgress[`claimed_${mqId}`]) {
        s.questProgress[`claimed_${mqId}`] = true;
        mq.onClaim(s);
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.State.save();
        this.showToast(`🎊 完成主線【${mq.title}】！獲得 ${mq.rewardText}！`);
        this.openGuildModal();
        this.updateAllHud();
      }
    },

    huntWrongQuestion() {
      const s = window.Aetheria.State.data;
      if (!s.wrongBook || s.wrongBook.length === 0) return;
      const targetQId = s.wrongBook[0];
      window.Aetheria.Battle.startBattle(
        { name: "🟣 暗影記憶幻象", lv: Math.max(3, s.lv), type: "skull", isBoss: false, forceShiny: true },
        "bounty",
        targetQId
      );
    },

    completeGuildBounty(bountyId) {
      const s = window.Aetheria.State.data;
      const b = window.Aetheria.Data.GUILD_BOUNTIES.find(item => item.id === bountyId);
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!b) return;
      if (!Helper.payCost(s.inventory, b.cost)) {
        this.showToast("⚠️ 素材不足以交付此委託！請先去野外採集。");
        return;
      }
      b.onComplete(s);
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast(`🎉 委託完成！獲得：${b.rewardText}`);
      this.openGuildModal();
      this.updateAllHud();
    },

    buildGreenhouse() {
      const s = window.Aetheria.State.data;
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!Helper.payCost(s.inventory, { wood: 2, iron: 2 })) {
        this.showToast("⚠️ 需要【🪵翠風原木 x2】與【💎藍晶鐵礦 x2】才可建造溫室！");
        return;
      }
      s.campBuildings.greenhouse = 1;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast("🏡 煉金藥水溫室建造完成！今後每答對 5 題將自動產出洞察藥水！");
      this.openGuildModal();
    },

    // ================= 4. ⚒️ 鐵匠鍛造、工具升級與萬能煉金轉化台 =================
    openForgeModal() {
      const s = window.Aetheria.State.data;
      const inv = s.inventory;
      const Helper = window.Aetheria.Data.CraftingHelper;

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerText = "⚒️ 曙光鐵匠鋪：神兵鍛造 & 工具升級 & 煉金";

      const body = document.getElementById("modal-body");
      body.innerHTML = `
        <div class="sys-card" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:4px; font-size:11px;">
          <div>💎 藍晶礦: <b>${inv.iron}</b></div>
          <div>🪙 秘銀礦: <b>${inv.mithril}</b></div>
          <div>🌌 星隕鐵: <b>${inv.starIron}</b></div>
          <div>🍄 紅傘菇: <b>${inv.herb}</b></div>
          <div>🌸 太陽花: <b>${inv.flower}</b></div>
          <div>🪵 原木: <b>${inv.wood}</b></div>
          <div>🦴 竹木心: <b>${inv.coreBamboo}</b></div>
          <div>🦴 骷髏火: <b>${inv.coreSkull}</b></div>
          <div>💣 炸彈: <b>${inv.bombItem}</b></div>
        </div>
      `;

      // A. 六階破盾神兵鍛造與裝備切換
      const wepHeader = document.createElement("div");
      wepHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:6px 0 4px;";
      wepHeader.innerText = "🗡️ 【破盾神兵鍛造與裝備】（可釘選至右上角追蹤）";
      body.appendChild(wepHeader);

      Object.values(window.Aetheria.Data.WEAPONS).forEach(w => {
        const owned = s.unlockedWeapons.includes(w.id);
        const equipped = (s.equippedWeapon === w.id);
        const canCraft = Helper.canAfford(inv, w.cost);

        const card = document.createElement("div");
        card.className = owned ? "sys-card-scroll" : "sys-card";
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b>${w.name} (ATK +${w.atk}｜破盾 +${1 + (w.shieldBreak || 0)})</b>
            <div style="display:flex; gap:4px;">
              ${!owned ? `<button class="na-btn" style="padding:2px 6px;" onclick="Aetheria.UI.pinWeapon('${w.id}')">📌釘選</button>` : ""}
              ${owned
                ? `<button class="na-btn ${equipped ? "highlight" : ""}" style="padding:3px 8px;" onclick="Aetheria.UI.equipWeapon('${w.id}')">${equipped ? "✅已裝備" : "裝備"}</button>`
                : `<button class="na-btn ${canCraft ? "highlight" : ""}" style="padding:3px 8px;" onclick="Aetheria.UI.craftWeapon('${w.id}')">🔨鍛造</button>`
              }
            </div>
          </div>
          <div style="font-size:11px; margin-top:2px;">${w.desc}</div>
          ${!owned ? `<div style="font-size:11px; margin-top:2px;">需求：${Helper.formatCostText(inv, w.cost)}</div>` : ""}
        `;
        body.appendChild(card);
      });

      // B. 探索工具升級 (十字鎬 / 伐木斧 / 爆破袋)
      const toolHeader = document.createElement("div");
      toolHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:8px 0 4px;";
      toolHeader.innerText = "⛏️ 【探索工具升級】（提高採集產量與開局自動炸盾）";
      body.appendChild(toolHeader);

      Object.entries(window.Aetheria.Data.TOOLS_UPGRADE).forEach(([tKey, tDef]) => {
        const curLv = s.tools[tKey] || 1;
        const nextLv = curLv + 1;
        const nextData = tDef.levels[nextLv];

        const tCard = document.createElement("div");
        tCard.className = "sys-card";
        tCard.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b>${tDef.name} Lv.${curLv}（${tDef.levels[curLv].title}）</b>
            ${nextData
              ? `<button class="na-btn highlight" style="padding:3px 8px;" onclick="Aetheria.UI.upgradeTool('${tKey}')">⬆️ 升至 Lv.${nextLv}</button>`
              : `<span style="color:#5ac54f;">👑 已滿級</span>`
            }
          </div>
          <div style="font-size:11px; color:#cbd5e1; margin-top:2px;">${nextData ? `下一級【${nextData.title}】：${nextData.desc}<br>需求：${Helper.formatCostText(inv, nextData.cost)}` : tDef.levels[curLv].desc}</div>
        `;
        body.appendChild(tCard);
      });

      // C. 萬能煉金轉化爐 (3 低階換 1 高階 / 製作藥水炸彈)
      const alchHeader = document.createElement("div");
      alchHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:8px 0 4px;";
      alchHeader.innerText = "⚗️ 【萬能煉金轉化爐】（低階素材提煉高階礦石與補給品）";
      body.appendChild(alchHeader);

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
            <b>${c.name}</b>
            <div style="font-size:10px; color:#cbd5e1;">消耗：${fromMat.icon}${fromMat.name} ${have}/${c.fromCount}</div>
          </div>
          <button class="na-btn ${have >= c.fromCount ? "highlight" : ""}" style="padding:4px 10px;" onclick="Aetheria.UI.alchemyConvert('${c.id}')">⚗️ 提煉</button>
        `;
        body.appendChild(row);
      });
    },

    pinWeapon(wId) {
      window.Aetheria.State.data.pinnedRecipe = wId;
      window.Aetheria.State.save();
      this.updateAllHud();
      this.showToast("📌 已將配方釘選至右上角 HUD 追蹤！");
    },

    craftWeapon(wId) {
      const s = window.Aetheria.State.data;
      const w = window.Aetheria.Data.WEAPONS[wId];
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!w || !Helper.payCost(s.inventory, w.cost)) {
        this.showToast("⚠️ 鍛造素材不足！可去野外採集或用下方煉金爐提煉。");
        return;
      }
      s.unlockedWeapons.push(wId);
      s.equippedWeapon = wId;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast(`🎉 鍛造大成功！已裝備神兵【${w.name}】！`);
      this.openForgeModal();
      this.updateAllHud();
    },

    equipWeapon(wId) {
      const s = window.Aetheria.State.data;
      if (s.unlockedWeapons.includes(wId)) {
        s.equippedWeapon = wId;
        window.Aetheria.State.save();
        this.openForgeModal();
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
        this.showToast("⚠️ 升級工具所需素材不足！");
        return;
      }
      s.tools[toolKey] = curLv + 1;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast(`🎉 ${tDef.name} 已升級為【${nextData.title}】！`);
      this.openForgeModal();
    },

    alchemyConvert(convId) {
      const s = window.Aetheria.State.data;
      const conv = window.Aetheria.Data.ALCHEMY_CONVERSIONS.find(c => c.id === convId);
      if (!conv || (s.inventory[conv.fromKey] || 0) < conv.fromCount) {
        this.showToast("⚠️ 原料數量不足！");
        return;
      }
      s.inventory[conv.fromKey] -= conv.fromCount;
      s.inventory[conv.toKey] = (s.inventory[conv.toKey] || 0) + conv.toCount;
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.showToast(`⚗️ 煉金成功：${conv.name}！`);
      this.openForgeModal();
      this.updateAllHud();
    },

    // ================= 5. 🐾 六大職業祠堂轉職 & 戰寵牧場切換 =================
    openJobPetModal() {
      const s = window.Aetheria.State.data;
      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerText = "🐾 古文明職業祠堂 & 同行戰寵牧場";

      const body = document.getElementById("modal-body");
      body.innerHTML = `<div style="color:var(--na-gold); font-weight:900; margin-bottom:4px;">🐾 【同行戰寵切換】（未上場戰寵會自動於牧場遠征挖礦）</div>`;

      // A. 戰寵列表
      Object.values(window.Aetheria.Data.PETS).forEach(p => {
        const unlocked = s.unlockedPets.includes(p.id);
        const isActive = (s.activePet === p.id);
        const isShiny = s.shinyPets && s.shinyPets.includes(p.id);

        const pCard = document.createElement("div");
        pCard.className = unlocked ? "sys-card-scroll" : "sys-card";
        pCard.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b>${isShiny ? "✨【異色閃光】" : ""}${p.name} — ${p.skillName}</b>
            ${unlocked
              ? `<button class="na-btn ${isActive ? "highlight" : ""}" style="padding:3px 8px;" onclick="Aetheria.UI.selectPet('${p.id}')">${isActive ? "✅同行中" : "攜帶同行"}</button>`
              : `<button class="na-btn" style="padding:3px 8px;" onclick="Aetheria.UI.quickUnlockPet('${p.id}')">🍎 誘餌果x2 契約</button>`
            }
          </div>
          <div style="font-size:11px; margin-top:2px;">${p.skillDesc}</div>
        `;
        body.appendChild(pCard);
      });

      // B. 六大職業轉職列表
      const jobHeader = document.createElement("div");
      jobHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:8px 0 4px;";
      jobHeader.innerText = "⚔️ 【六大古文明職業轉職】（隨等級自動解鎖，隨時自由切換）";
      body.appendChild(jobHeader);

      Object.values(window.Aetheria.Data.JOBS).forEach(j => {
        const unlocked = s.unlockedJobs.includes(j.id) || s.lv >= j.unlockLv;
        const active = (s.currentJob === j.id);

        const jCard = document.createElement("div");
        jCard.className = unlocked ? "sys-card-scroll" : "sys-card";
        jCard.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b>${j.name}（${j.title}｜ATK x${j.atkMult}）</b>
            ${unlocked
              ? `<button class="na-btn ${active ? "highlight" : ""}" style="padding:3px 8px;" onclick="Aetheria.UI.selectJob('${j.id}')">${active ? "✅當前職業" : "轉職"}</button>`
              : `<span style="font-size:11px; color:#ff595e;">🔒 Lv.${j.unlockLv} 解鎖</span>`
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
        this.showToast("⚠️ 需要 2 顆【🍎靈獸誘餌果】！可在戰鬥殘血收服或在鐵匠煉金爐調配。");
        return;
      }
      s.inventory.tameFruit -= 2;
      if (!s.unlockedPets.includes(petId)) s.unlockedPets.push(petId);
      s.activePet = petId;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast("🎊 成功締結戰寵契約！");
      this.openJobPetModal();
      this.updateAllHud();
    },

    selectJob(jobId) {
      const s = window.Aetheria.State.data;
      s.currentJob = jobId;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast(`⚡ 已轉職為【${window.Aetheria.Data.JOBS[jobId].name}】！`);
      this.openJobPetModal();
      this.updateAllHud();
    },

    // ================= 6. 🔮 星象儀溫習科目調頻 & 📜 7大題型快速測試 =================
    openAstrolabeModal() {
      const s = window.Aetheria.State.data;
      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerText = "🔮 星象儀：Justin 今日溫習科目自由調頻";

      const subjects = [
        { key: "chinese",    name: "📘 中文科（龍語古卷：字詞四選一、例句候選字拼字）" },
        { key: "english",    name: "📕 英文科（阿爾比恩：全盲像素鍵盤串字、例句四選一）" },
        { key: "science",    name: "📗 科學科（煉金真理：實驗圖看圖填充、情境推理、簡答）" },
        { key: "humanities", name: "📙 人文科（歷史紀元：左右多重連線配對、地形圖題）" }
      ];

      const body = document.getElementById("modal-body");
      body.innerHTML = `<div style="margin-bottom:6px; color:#cbd5e1;">世界觀不分科目，在此勾選的科目將自動注入所有戰鬥與完美採集詠唱中：</div>`;

      subjects.forEach(sub => {
        const on = Boolean(s.activeSubjects[sub.key]);
        const row = document.createElement("div");
        row.className = "sys-card";
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.innerHTML = `
          <span>${sub.name}</span>
          <button class="na-btn ${on ? "highlight" : ""}" style="padding:4px 10px;" onclick="Aetheria.UI.toggleSubject('${sub.key}')">${on ? "✅ 已共鳴" : "⬜ 未啟用"}</button>
        `;
        body.appendChild(row);
      });
    },

    toggleSubject(key) {
      const s = window.Aetheria.State.data;
      s.activeSubjects[key] = !s.activeSubjects[key];
      window.Aetheria.State.save();
      this.openAstrolabeModal();
    },

    openTestQuizModal() {
      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerText = "📜 四科 7~9 大題型戰鬥詠唱即時預覽";

      const body = document.getElementById("modal-body");
      body.innerHTML = `<div style="margin-bottom:6px; color:#cbd5e1;">點擊任一題目即可立即進入模擬戰測試該題型的專屬 UI：</div>`;

      window.Aetheria.QuizBridge.getAllQuestions().forEach((q, idx) => {
        const btn = document.createElement("button");
        btn.className = "na-btn";
        btn.style.cssText = "width:100%; text-align:left; padding:7px 10px; margin-bottom:5px;";
        btn.innerHTML = `${idx + 1}. <b>[${q.subjectLabel}]</b> — ${q.typeLabel}`;
        btn.onclick = () => {
          window.Aetheria.Battle.startBattle(null, "combat", q.id);
        };
        body.appendChild(btn);
      });
    }
  };

  window.Aetheria.UI = UIManager;

  // ================= 60FPS 遊戲主引擎啟動器 =================
  function startMainGameLoop() {
    window.Aetheria.State.init();
    window.Aetheria.Data.Sprites.init();
    window.Aetheria.Explore.initControls();
    window.Aetheria.UI.updateAllHud();

    function frameStep() {
      window.Aetheria.Renderer.tick++;
      if (!window.Aetheria.Battle.active) {
        window.Aetheria.Explore.updateStep();
        window.Aetheria.Renderer.renderWorld();
      } else {
        window.Aetheria.Renderer.renderBattleScene(window.Aetheria.Battle.enemy);
      }
      requestAnimationFrame(frameStep);
    }

    requestAnimationFrame(frameStep);
  }

  window.addEventListener("load", startMainGameLoop);
})();