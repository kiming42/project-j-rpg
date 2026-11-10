/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 公會養成、鐵匠聖物鍛造、四科圖鑑館與主迴圈總管 (progression-town.js - Full v2.5)
 * 補完：1.鐵匠鋪「🦉三大輔助聖物飾品(Relics)」鍛造區
 *       2.冒險者公會「🎁每日階級補給」、「🎯完美溫習里程碑成就」
 *       3.「📖古文明四科掌握度報告 & 圖鑑館(家長檢視面板)」+「💾JSON存檔備份/還原」
 *       4.三層世界全 9 大區域傳送陣
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const UIManager = {
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
      t.innerText = msg;
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
      el.style.left = onEnemy ? "56%" : "14%";
      el.style.top = "36%";
      el.innerText = text;
      stage.appendChild(el);
      setTimeout(() => el.remove(), 880);
    },

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
      const hunterDual = (s.currentJob === "hunter" && s.unlockedPets.length >= 2) ? " + 副寵" : "";
      const petEl = document.getElementById("hud-pet");
      if (petEl) petEl.innerText = `${isShiny ? "✨" : ""}${petObj.name}${hunterDual}`;

      const guildEl = document.getElementById("hud-guild");
      if (guildEl) guildEl.innerText = `🛡️ ${s.guildRank}級 (${s.guildPoints}pt)`;

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
          questEl.innerHTML = `👑 主線全破！無盡試煉之塔最高：第 ${s.maxTowerFloor} 層`;
        }
      }

      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
      this.updateHudZoneDynamic(mapObj, s);
    },

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
      document.getElementById("npc-name-label").innerText = npc.name;
      document.getElementById("npc-role-label").innerText = npc.role;
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
      srvBtn.innerText = npc.serviceLabel;
      srvBtn.onclick = () => {
        if (this[npc.serviceAction]) this[npc.serviceAction]();
      };
      btnGrid.appendChild(srvBtn);

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

    // ================= 2. 🗺️ 立體三層世界全 9 大區域傳送選單 =================
    openWorldMapModal() {
      const s = window.Aetheria.State.data;
      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerText = "🗺️ 三層世界傳送陣 (全 9 大區域 & 無盡之塔)";

      const zones = [
        { id: "forest_world",    name: "🟢 [第一層] 翠風大森林 & 露營基地 (Lv.1~5)", x: 420, y: 345, desc: "含中央營地、釣魚點、抓鉤河岸、擋路巨石與枯木秘境。" },
        { id: "mushroom_cave",   name: "🟢 [子迷宮] 微光蘑菇地下洞窟 (Lv.5~9)", x: 280, y: 390, desc: "含🔥點燃火盆驅散黑霧機關、🧱炸彈裂縫密室與閃光秘銀。" },
        { id: "canyon_world",    name: "🟡 [第一層] 流沙繩索大峽谷 (Lv.12~18)", x: 400, y: 340, desc: "綁麻繩年輪高台、綠洲商隊與太陽神殿寶箱。" },
        { id: "emerald_coast",   name: "🟡 [第一層] 翡翠海岸與沉船灣 (Lv.21~27)", x: 350, y: 120, desc: "黃金沙灘、🎣海濱垂釣、🪝抓鉤孤島寶箱與⛵古代遠洋帆船。" },
        { id: "abyss_sanctum",   name: "🔴 [裏世界] 深淵星隕聖殿 (Lv.25 💀越級尋寶)", x: 280, y: 380, desc: "深淵赤炎龍皇盤踞之地，可走位繞過強敵偷開傳說神器寶箱！" },
        { id: "frost_snowfield", name: "🔴 [第二層] 霜語極寒雪原 (Lv.45~52)", x: 350, y: 450, desc: "飄雪極地，盛產【🪷雪山冰蓮】與永凍冰晶，棲息遠古冰霜龍王。" },
        { id: "magma_volcano",   name: "🔴 [第二層] 赤紅熔岩火山帶 (Lv.56~65)", x: 100, y: 280, desc: "煉獄熔岩之地，盛產【🔥熔岩黑曜石】，需秘銀重鎬敲碎火山巨石。" },
        { id: "sky_archipelago", name: "👑 [第三層] 天界浮空群島 (Lv.85~95)", x: 350, y: 440, desc: "乘🛸星辰飛空艇抵達的雲端聖殿，盛產【🌳世界樹金葉】與星隕神鐵！" },
        { id: "endless_tower",   name: `🏛️ [終局挑戰] 無盡試煉之塔 (當前最高：第 ${s.maxTowerFloor} 層)`, x: 250, y: 350, desc: "100 層 Roguelike 隨機迷宮，高機率遭遇✨異色閃光魔物！" }
      ];

      const body = document.getElementById("modal-body");
      body.innerHTML = `<div style="margin-bottom:6px; color:#cbd5e1;">點擊任一區域即可瞬間傳送（並自動刷新全地圖閃光礦脈與野生魔物）：</div>`;

      zones.forEach(z => {
        const card = document.createElement("div");
        card.className = "sys-card";
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b style="color:var(--na-gold); font-size:12px;">${z.name}</b>
            <button class="na-btn highlight" style="padding:4px 9px;" onclick="Aetheria.UI.teleportToZone('${z.id}', ${z.x}, ${z.y})">⚡ 傳送</button>
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
      this.showToast(`⚡ 已傳送至【${mapObj.name}】（資源已刷新）！`);
    },

    // ================= 3. 🛡️ 冒險者公會大廳（含階級每日俸祿、溫習里程碑、📖四科圖鑑館） =================
    openGuildModal() {
      const s = window.Aetheria.State.data;
      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerText = `🛡️ 記憶共鳴者公會 (${s.guildRank}級｜聲望 ${s.guildPoints}pt)`;

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      // 頂部快捷切換：進入【📖 古文明四科掌握度報告 & 圖鑑館 & 存檔備份】
      const topBar = document.createElement("div");
      topBar.style.cssText = "display:flex; gap:5px; margin-bottom:6px;";
      topBar.innerHTML = `
        <button class="na-btn highlight" style="flex:1; padding:6px;" onclick="Aetheria.UI.openCodexReportModal()">📖 四科掌握度報告 & 圖鑑館 & 存檔備份</button>
        <button class="na-btn" style="padding:6px 10px;" onclick="Aetheria.UI.claimGuildSupply()">🎁 領取${s.guildRank}級俸祿</button>
      `;
      body.appendChild(topBar);

      // A. 主線任務
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

      // B. 🟣 特級錯題魔導書懸賞討伐
      const wrongCount = (s.wrongBook || []).length;
      const shadowCard = document.createElement("div");
      shadowCard.className = "sys-card";
      shadowCard.style.borderColor = "#9d4edd";
      shadowCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <b style="color:#e0aaff;">🟣 【S級錯題懸賞】討伐暗影記憶幻象 (${wrongCount} 隻待討伐)</b>
          ${wrongCount > 0 ? `<button class="na-btn highlight" style="padding:4px 10px;" onclick="Aetheria.UI.huntWrongQuestion()">⚔️ 立即討伐</button>` : `<span style="color:#5ac54f; font-size:11px;">✅ 全數淨化</span>`}
        </div>
        <div style="font-size:11px; color:#cbd5e1; margin-top:3px;">專門挑戰曾經答錯的題目，擊敗後獲<b>雙倍公會聲望、秘銀礦與魔物核心</b>！</div>
      `;
      body.appendChild(shadowCard);

      // C. 🎯 完美溫習連勝里程碑
      const maxStrk = s.maxStreak || 0;
      const mileDone = maxStrk >= 5 && !(s.questProgress && s.questProgress.mile_streak5);
      const mileCard = document.createElement("div");
      mileCard.className = "sys-card";
      mileCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <b style="color:#fbd000;">🎯 【溫習試煉】達成 5 題連續答對連勝 (最高紀錄: ${maxStrk}/5)</b>
          ${mileDone
            ? `<button class="na-btn highlight" style="padding:4px 10px;" onclick="Aetheria.UI.claimStreakMilestone()">🎁 領取星隕鐵x2</button>`
            : (s.questProgress && s.questProgress.mile_streak5) ? `<span style="color:#5ac54f;">✅ 已達成</span>` : `<span style="color:#cbd5e1;">進行中</span>`
          }
        </div>
      `;
      body.appendChild(mileCard);

      // D. 公會日常委託板
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
          <div style="font-size:11px; color:#cbd5e1; margin:2px 0;">${b.desc}（${Helper.formatCostText(s.inventory, b.cost)}）</div>
          <div style="font-size:11px; color:#8ce0ff;">🎁 報酬：${b.rewardText}</div>
        `;
        body.appendChild(bCard);
      });

      // E. 煉金藥水溫室建設
      const ghLv = s.campBuildings.greenhouse || 0;
      const ghCard = document.createElement("div");
      ghCard.className = "sys-card";
      ghCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <b style="color:#5ac54f;">🏡 【營地建設】煉金藥水溫室 (Lv.${ghLv})</b>
          ${ghLv === 0 ? `<button class="na-btn highlight" style="padding:4px 10px;" onclick="Aetheria.UI.buildGreenhouse()">🔨 建造 (原木x2, 鐵礦x2)</button>` : `<span style="color:#5ac54f;">✅ 運作中</span>`}
        </div>
        <div style="font-size:11px; color:#cbd5e1; margin-top:2px;">建成後，每在戰鬥中答對 5 題，牧場戰寵挖礦時自動產出 1 瓶【🧪 洞察藥水】！</div>
      `;
      body.appendChild(ghCard);
    },

    claimGuildSupply() {
      const s = window.Aetheria.State.data;
      const rankInfo = window.Aetheria.Data.GUILD_RANKS.find(r => r.rank === s.guildRank) || window.Aetheria.Data.GUILD_RANKS[0];
      s.inventory.iron += rankInfo.dailyIron;
      s.inventory.potionHint += rankInfo.dailyPotion;
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.showToast(`🎁 領取【${rankInfo.name}】補給：藍晶鐵礦 +${rankInfo.dailyIron}、洞察藥水 +${rankInfo.dailyPotion}！`);
      this.updateAllHud();
    },

    claimStreakMilestone() {
      const s = window.Aetheria.State.data;
      s.questProgress.mile_streak5 = true;
      s.inventory.starIron += 2;
      s.inventory.tameFruit += 2;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast("🎊 達成 5 連勝溫習試煉！獲得【🌌深淵星隕鐵 x2】、【🍎靈獸誘餌果 x2】！");
      this.openGuildModal();
    },

    // 📖 新增！古文明四科掌握度報告 & 榮譽圖鑑館 & JSON 存檔備份 (家長檢視面板)
    openCodexReportModal() {
      const s = window.Aetheria.State.data;
      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerText = "📖 古文明四科掌握度報告 & 榮譽圖鑑館";

      const allQ = window.Aetheria.QuizBridge.getAllQuestions();
      const subjStats = {
        chinese:    { name: "📘 中文科", total: 0, mastered: 0, stars: 0 },
        english:    { name: "📕 英文科", total: 0, mastered: 0, stars: 0 },
        science:    { name: "📗 科學科", total: 0, mastered: 0, stars: 0 },
        humanities: { name: "📙 人文科", total: 0, mastered: 0, stars: 0 }
      };

      allQ.forEach(q => {
        const st = subjStats[q.subject];
        if (st) {
          st.total++;
          const m = s.questionMastery && s.questionMastery[q.id];
          if (m && m.stars > 0) {
            st.mastered++;
            st.stars += m.stars;
          }
        }
      });

      const body = document.getElementById("modal-body");
      body.innerHTML = `
        <div class="sys-card-scroll">
          <div style="font-weight:900; margin-bottom:4px;">📊 Justin 四科古文明符文掌握度統計（最高紀錄連勝：${s.maxStreak || 0} 題）</div>
          ${Object.values(subjStats).map(st => {
            const pct = st.total > 0 ? Math.round((st.mastered / st.total) * 100) : 0;
            return `<div style="display:flex; justify-content:space-between; font-size:11px; margin:2px 0;">
              <span>${st.name}：已掌握 <b>${st.mastered}/${st.total}</b> 題 (${pct}%)</span>
              <span style="color:#c98a00;">累計星級 ★${st.stars}</span>
            </div>`;
          }).join("")}
        </div>
        <div class="sys-card">
          <div style="color:var(--na-gold); font-weight:900;">🏆 收集榮譽圖鑑進度</div>
          <div style="font-size:11px; margin-top:3px;">
            • 已解鎖破盾神兵：<b>${s.unlockedWeapons.length} / ${Object.keys(window.Aetheria.Data.WEAPONS).length}</b> 把<br>
            • 已收服同行戰寵：<b>${s.unlockedPets.length} / ${Object.keys(window.Aetheria.Data.PETS).length}</b> 隻（✨閃光寵：<b>${(s.shinyPets || []).length}</b> 隻）<br>
            • 已鍛造聖物飾品：<b>${(s.unlockedRelics || []).length} / ${Object.keys(window.Aetheria.Data.RELICS).length}</b> 件
          </div>
        </div>
        <div class="sys-card">
          <div style="color:#8ce0ff; font-weight:900; margin-bottom:4px;">💾 遊戲進度與溫習記錄 JSON 備份 / 還原</div>
          <div style="display:flex; gap:5px;">
            <button class="na-btn highlight" style="flex:1; padding:5px;" onclick="Aetheria.UI.exportSavePrompt()">📤 複製存檔代碼</button>
            <button class="na-btn" style="flex:1; padding:5px;" onclick="Aetheria.UI.importSavePrompt()">📥 貼上還原存檔</button>
            <button class="na-btn" style="padding:5px 8px; background:#6e2228;" onclick="if(confirm('確定要重置所有進度嗎？')) Aetheria.State.resetSave()">重置</button>
          </div>
        </div>
        <button class="na-btn" style="width:100%; padding:6px;" onclick="Aetheria.UI.openGuildModal()">⬅️ 返回冒險者公會</button>
      `;
    },

    exportSavePrompt() {
      const json = window.Aetheria.State.exportJSON();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(json).then(() => {
          this.showToast("📋 存檔 JSON 已複製到剪貼簿！");
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
        this.showToast("🎉 存檔還原成功！");
        this.updateAllHud();
        this.openCodexReportModal();
      } else if (raw) {
        this.showToast("⚠️ 存檔格式不正確！");
      }
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
      if (!b || !Helper.payCost(s.inventory, b.cost)) {
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

    // ================= 4. ⚒️ 鐵匠鋪（含神兵鍛造、🦉三大聖物飾品、⛏️四大工具升級、⚗️煉金轉化） =================
    openForgeModal() {
      const s = window.Aetheria.State.data;
      const inv = s.inventory;
      const Helper = window.Aetheria.Data.CraftingHelper;

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerText = "⚒️ 曙光鐵匠鋪：神兵 & 聖物飾品 & 四大工具";

      const body = document.getElementById("modal-body");
      body.innerHTML = `
        <div class="sys-card" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:4px; font-size:11px;">
          <div>💎 藍晶礦: <b>${inv.iron}</b></div>
          <div>🪙 秘銀礦: <b>${inv.mithril}</b></div>
          <div>🔥 黑曜石: <b>${inv.obsidian}</b></div>
          <div>🌌 星隕鐵: <b>${inv.starIron}</b></div>
          <div>🍄 紅傘菇: <b>${inv.herb}</b></div>
          <div>🌸 太陽花: <b>${inv.flower}</b></div>
          <div>🪷 雪冰蓮: <b>${inv.iceLotus}</b></div>
          <div>🌳 金葉: <b>${inv.goldLeaf}</b></div>
          <div>🪵 原木: <b>${inv.wood}</b></div>
        </div>
      `;

      // A. 六階破盾神兵
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

      // B. 🦉 新增補完！三大輔助聖物飾品鍛造區 (Relics)
      const relicHeader = document.createElement("div");
      relicHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:8px 0 4px;";
      relicHeader.innerText = "🦉 【古文明聖物飾品】（鍛造後永久獲得被動加成）";
      body.appendChild(relicHeader);

      Object.values(window.Aetheria.Data.RELICS).forEach(rel => {
        const owned = s.unlockedRelics && s.unlockedRelics.includes(rel.id);
        const canCraft = Helper.canAfford(inv, rel.cost);

        const rCard = document.createElement("div");
        rCard.className = owned ? "sys-card-scroll" : "sys-card";
        rCard.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b>${rel.name}</b>
            ${owned
              ? `<span style="color:#1d5eb8; font-weight:900;">✅ 永久生效中</span>`
              : `<button class="na-btn ${canCraft ? "highlight" : ""}" style="padding:3px 8px;" onclick="Aetheria.UI.craftRelic('${rel.id}')">🔨 鍛造聖物</button>`
            }
          </div>
          <div style="font-size:11px; margin-top:2px;">${rel.desc}</div>
          ${!owned ? `<div style="font-size:11px; margin-top:2px;">需求：${Helper.formatCostText(inv, rel.cost)}</div>` : ""}
        `;
        body.appendChild(rCard);
      });

      // C. 四大探索工具升級 (十字鎬 / 伐木斧 / 爆破袋 / 釣竿與抓鉤)
      const toolHeader = document.createElement("div");
      toolHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:8px 0 4px;";
      toolHeader.innerText = "⛏️ 【四大探索工具升級】（解鎖碎巨石、砍枯木、飛爪鉤與開局炸盾）";
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

      // D. 萬能煉金轉化爐
      const alchHeader = document.createElement("div");
      alchHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:8px 0 4px;";
      alchHeader.innerText = "⚗️ 【萬能煉金轉化爐】（3 低階素材提煉 1 高階素材與補給品）";
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

    craftRelic(rId) {
      const s = window.Aetheria.State.data;
      const rel = window.Aetheria.Data.RELICS[rId];
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!rel || !Helper.payCost(s.inventory, rel.cost)) {
        this.showToast("⚠️ 鍛造聖物所需素材不足！");
        return;
      }
      if (!s.unlockedRelics) s.unlockedRelics = [];
      s.unlockedRelics.push(rId);
      if (rel.onCraft) rel.onCraft(s);
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast(`🦉 聖物鍛造成功！【${rel.name}】永久被動已生效！`);
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

    // ================= 5. 🐾 六大職業祠堂 & 戰寵牧場 =================
    openJobPetModal() {
      const s = window.Aetheria.State.data;
      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerText = "🐾 古文明職業祠堂 & 同行戰寵牧場";

      const body = document.getElementById("modal-body");
      body.innerHTML = `<div style="color:var(--na-gold); font-weight:900; margin-bottom:4px;">🐾 【同行戰寵切換】（轉職「荒野獵人」可同時帶 2 隻戰寵上場！）</div>`;

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
              ? `<button class="na-btn ${isActive ? "highlight" : ""}" style="padding:3px 8px;" onclick="Aetheria.UI.selectPet('${p.id}')">${isActive ? "✅主戰寵" : "設為主寵"}</button>`
              : `<button class="na-btn" style="padding:3px 8px;" onclick="Aetheria.UI.quickUnlockPet('${p.id}')">🍎 誘餌果x2 契約</button>`
            }
          </div>
          <div style="font-size:11px; margin-top:2px;">${p.skillDesc}</div>
        `;
        body.appendChild(pCard);
      });

      const jobHeader = document.createElement("div");
      jobHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:8px 0 4px;";
      jobHeader.innerText = "⚔️ 【六大古文明職業轉職】（隨等級解鎖，或隨時自由體驗）";
      body.appendChild(jobHeader);

      Object.values(window.Aetheria.Data.JOBS).forEach(j => {
        const unlocked = s.unlockedJobs.includes(j.id) || s.lv >= j.unlockLv;
        const active = (s.currentJob === j.id);

        const jCard = document.createElement("div");
        jCard.className = unlocked ? "sys-card-scroll" : "sys-card";
        jCard.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b>${j.name}（${j.title}｜ATK x${j.atkMult}）</b>
            <button class="na-btn ${active ? "highlight" : ""}" style="padding:3px 8px;" onclick="Aetheria.UI.selectJob('${j.id}')">${active ? "✅當前職業" : (unlocked ? "轉職" : `⚡提前體驗(Lv.${j.unlockLv})`)}</button>
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
      if (!s.unlockedJobs.includes(jobId)) s.unlockedJobs.push(jobId);
      s.currentJob = jobId;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast(`⚡ 已轉職為【${window.Aetheria.Data.JOBS[jobId].name}】！`);
      this.openJobPetModal();
      this.updateAllHud();
    },

    // ================= 6. 🔮 星象儀 & 📜 7大題型預覽 =================
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
      body.innerHTML = `<div style="margin-bottom:6px; color:#cbd5e1;">在此勾選的科目將自動注入所有戰鬥與完美採集詠唱中：</div>`;

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
