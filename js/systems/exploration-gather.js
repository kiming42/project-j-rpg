/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 探索移動、怪物巡邏追擊AI、步行解鎖傳送與採集系統 (exploration-gather.js - v3.0)
 * 升級：1.實作 updateMonstersAI()：怪物平時隨機走動巡邏，主角接近 (<68px) 時加速衝向主角！
 *       2.步行穿過傳送口時自動呼叫 State.unlockZone() 開放該區傳送陣
 *       3.支援進入營地兩座大帳篷室內 (tent_guild / tent_forge)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const ExploreSystem = {
    isMoving: false,
    moveDX: 0,
    moveDY: 0,

    initControls() {
      const bindPad = (id, dx, dy) => {
        const el = document.getElementById(id);
        if (!el) return;
        const start = (e) => { e.preventDefault(); this.startMove(dx, dy); };
        const end = (e) => { e.preventDefault(); this.stopMove(); };
        el.addEventListener("mousedown", start);
        el.addEventListener("mouseup", end);
        el.addEventListener("mouseleave", end);
        el.addEventListener("touchstart", start, { passive: false });
        el.addEventListener("touchend", end, { passive: false });
      };

      bindPad("btn-up", 0, -1);
      bindPad("btn-down", 0, 1);
      bindPad("btn-left", -1, 0);
      bindPad("btn-right", 1, 0);

      window.addEventListener("keydown", (e) => {
        if (window.Aetheria.Battle && window.Aetheria.Battle.active) return;
        const titleEl = document.getElementById("title-screen");
        if (titleEl && titleEl.style.display !== "none") return;

        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") this.startMove(0, -1);
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") this.startMove(0, 1);
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") this.startMove(-1, 0);
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") this.startMove(1, 0);
        if (e.key === " " || e.key === "Enter") this.interactNearby();
      });

      window.addEventListener("keyup", (e) => {
        if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d","W","A","S","D"].includes(e.key)) {
          this.stopMove();
        }
      });
    },

    startMove(dx, dy) {
      if (window.Aetheria.Battle && window.Aetheria.Battle.active) return;
      this.moveDX = dx;
      this.moveDY = dy;
      this.isMoving = true;

      const s = window.Aetheria.State.data;
      if (dy > 0) s.facing = "down";
      else if (dy < 0) s.facing = "up";
      else if (dx < 0) s.facing = "left";
      else if (dx > 0) s.facing = "right";
    },

    stopMove() {
      this.isMoving = false;
      this.moveDX = 0;
      this.moveDY = 0;
    },

    // 每幀更新：主角移動 + 野外怪物巡邏與加速追擊 AI
    updateStep() {
      const s = window.Aetheria.State.data;
      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);

      // 1. 即使主角停下，野外怪物依然每幀走動巡邏與追擊
      this.updateMonstersAI(mapObj, s);

      if (!this.isMoving) return;

      let speed = 2.15;
      if (s.currentJob === "thief") speed += 0.45;
      if (s.unlockedRelics && s.unlockedRelics.includes("r_cloak")) speed += 0.35;

      let nx = Math.max(24, Math.min(mapObj.width - 36, s.heroX + this.moveDX * speed));
      let ny = Math.max(24, Math.min(mapObj.height - 36, s.heroY + this.moveDY * speed));

      // 2. 檢查河流碰撞 (唯有木橋範圍可通過)
      if (mapObj.hasRiver) {
        const rx = mapObj.riverX || 555;
        const by = mapObj.bridgeY || 250;
        const inRiverX = (nx > rx - 14 && nx < rx + 38);
        const onBridgeY = (ny > by - 6 && ny < by + 38);
        if (inRiverX && !onBridgeY) {
          nx = s.heroX;
        }
      }

      // 3. 檢查裂縫岩壁、擋路巨石、擋路枯木
      if (mapObj.decos) {
        for (const d of mapObj.decos) {
          const isCleared = s.openedNodes && s.openedNodes[d.id];
          if (!isCleared && (d.isCrackedWall || d.obstacleType)) {
            if (Math.hypot(nx - d.x, ny - d.y) < 22) {
              nx = s.heroX;
              ny = s.heroY;
              if (d.isCrackedWall) {
                window.Aetheria.UI.showToast("裂縫岩壁擋路！請按右下角【炸彈】炸開密室！");
              } else if (d.obstacleType === "boulder") {
                window.Aetheria.UI.showToast("玄武巨石擋路！升級【Lv.2 秘銀重鎬】後按 A 鍵即可敲碎！");
              } else if (d.obstacleType === "deadtree") {
                window.Aetheria.UI.showToast("巨型枯木擋路！升級【Lv.2 烈焰戰斧】後按 A 鍵即可砍斷！");
              }
            }
          }
        }
      }

      // 4. 戰寵平滑跟隨
      s.petX += (s.heroX - this.moveDX * 18 - s.petX) * 0.18;
      s.petY += (s.heroY - this.moveDY * 16 - s.petY) * 0.18;
      s.heroX = nx;
      s.heroY = ny;

      // 5. 檢查是否踩中傳送門或帳篷入口
      if (mapObj.portals) {
        for (const p of mapObj.portals) {
          if (Math.hypot(s.heroX - p.x, s.heroY - p.y) < 18) {
            this.stopMove();
            this.triggerPortal(p);
            return;
          }
        }
      }

      this.updateContextHint(mapObj, s);
      window.Aetheria.UI.updateHudZoneDynamic(mapObj, s);
    },

    // ================= 新增！野外魔物巡邏走動 + 接近時 [!] 加速衝刺追擊 AI =================
    updateMonstersAI(mapObj, s) {
      if (!mapObj || !mapObj.monsters || mapObj.monsters.length === 0) return;
      if (window.Aetheria.Battle && window.Aetheria.Battle.active) return;
      const titleEl = document.getElementById("title-screen");
      if (titleEl && titleEl.style.display !== "none") return;

      for (const m of mapObj.monsters) {
        if (m.alive === false) continue;

        const distToHero = Math.hypot(s.heroX - m.x, s.heroY - m.y);

        // 碰撞觸發戰鬥
        if (distToHero < 15) {
          this.stopMove();
          if (m.isShiny) m.forceShiny = true;
          window.Aetheria.Battle.startBattle(m);
          return;
        }

        // 狀態 1：主角進入警戒半徑 (< 68px)，觸發 [!] 並加速衝向主角！
        const aggroRadius = m.isBoss ? 78 : 66;
        if (distToHero < aggroRadius) {
          if (!m.aggro) {
            m.aggro = true;
          }
          const chaseSpeed = m.isBoss ? 1.15 : 1.38;
          const dx = (s.heroX - m.x) / (distToHero || 1);
          const dy = (s.heroY - m.y) / (distToHero || 1);
          let nextMX = m.x + dx * chaseSpeed;
          let nextMY = m.y + dy * chaseSpeed;

          // 防止怪物穿過未過橋的河流
          if (mapObj.hasRiver) {
            const rx = mapObj.riverX || 555;
            if (nextMX > rx - 14 && nextMX < rx + 38) nextMX = m.x;
          }

          m.x = Math.max(30, Math.min(mapObj.width - 40, nextMX));
          m.y = Math.max(30, Math.min(mapObj.height - 40, nextMY));
        } else {
          // 狀態 2：平時在出生點 (homeX, homeY) 附近隨機慢速巡邏走動
          m.aggro = false;
          m.patrolTimer = (m.patrolTimer || 60) - 1;
          if (m.patrolTimer <= 0) {
            m.patrolTimer = 50 + Math.floor(Math.random() * 60);
            const randAng = Math.random() * Math.PI * 2;
            const spd = 0.45;
            m.vx = Math.cos(randAng) * spd;
            m.vy = Math.sin(randAng) * spd;
          }

          let nextMX = m.x + (m.vx || 0);
          let nextMY = m.y + (m.vy || 0);

          // 若偏離出生點超過 55px，自動掉頭走回領地中心
          const distFromHome = Math.hypot(nextMX - (m.homeX || m.x), nextMY - (m.homeY || m.y));
          if (distFromHome > 55) {
            m.vx = ((m.homeX || m.x) - m.x) * 0.02;
            m.vy = ((m.homeY || m.y) - m.y) * 0.02;
            nextMX = m.x + m.vx;
            nextMY = m.y + m.vy;
          }

          m.x = Math.max(35, Math.min(mapObj.width - 45, nextMX));
          m.y = Math.max(35, Math.min(mapObj.height - 45, nextMY));
        }
      }
    },

    updateContextHint(mapObj, s) {
      const hintEl = document.getElementById("a-btn-hint");
      if (!hintEl) return;

      if (mapObj.npcs) {
        for (const npc of mapObj.npcs) {
          if (Math.hypot(s.heroX - npc.x, s.heroY - npc.y) < 30) {
            hintEl.innerText = `對話:${npc.name.split("・")[1] || npc.name}`;
            return;
          }
        }
      }
      if (mapObj.decos) {
        for (const d of mapObj.decos) {
          const isCleared = s.openedNodes && s.openedNodes[d.id];
          if (!isCleared && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 32) {
            if (d.isFishingSpot) { hintEl.innerText = "垂釣"; return; }
            if (d.isGrapple)     { hintEl.innerText = "飛爪鉤"; return; }
            if (d.isBrazier)     { hintEl.innerText = "點火盆"; return; }
            if (d.obstacleType === "boulder")  { hintEl.innerText = "碎巨石"; return; }
            if (d.obstacleType === "deadtree") { hintEl.innerText = "砍枯木"; return; }
          }
        }
      }
      if (mapObj.nodes) {
        for (const n of mapObj.nodes) {
          if (!n.opened && !(s.openedNodes && s.openedNodes[n.id]) && Math.hypot(s.hero
