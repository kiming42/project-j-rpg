/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 大世界四方向探索、採集爆擊、炸彈破障與傳送系統 (exploration-gather.js)
 * 包含：平滑移動與碰撞、木橋通行、A鍵自動感應(NPC對話/完美採集x3/開寶箱)、炸開裂縫岩壁
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

      // 支援電腦鍵盤 WASD / 方向鍵移動與空白鍵互動
      window.addEventListener("keydown", (e) => {
        if (window.Aetheria.Battle && window.Aetheria.Battle.active) return;
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

    // 每幀更新位置、碰撞與周遭互動感應
    updateStep() {
      if (!this.isMoving) return;
      const s = window.Aetheria.State.data;
      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);

      // 盜賊職業或裝備翠風披風可獲得移速加成
      let speed = 2.1;
      if (s.currentJob === "thief") speed += 0.4;
      if (s.unlockedRelics && s.unlockedRelics.includes("r_cloak")) speed += 0.3;

      let nx = Math.max(28, Math.min(mapObj.width - 42, s.heroX + this.moveDX * speed));
      let ny = Math.max(28, Math.min(mapObj.height - 42, s.heroY + this.moveDY * speed));

      // 1. 檢查翡翠河流碰撞 (唯有木橋 y: 306 ~ 352 區間可通行)
      if (mapObj.hasRiver) {
        const inRiverX = (nx > 648 && nx < 706);
        const onBridgeY = (ny > 306 && ny < 352);
        if (inRiverX && !onBridgeY) {
          nx = s.heroX;
        }
      }

      // 2. 檢查裂縫岩壁阻擋 (未炸開前不可穿過左上角密室)
      if (mapObj.decos) {
        for (const d of mapObj.decos) {
          if (d.isCrackedWall && !(s.openedNodes && s.openedNodes[d.id])) {
            if (Math.hypot(nx - d.x, ny - d.y) < 22) {
              nx = s.heroX;
              ny = s.heroY;
              window.Aetheria.UI.showToast("🧱 裂縫岩壁擋住了去路！請按右下角【💣 炸彈】炸開它！");
            }
          }
        }
      }

      // 3. 戰寵平滑跟隨於主角身後
      s.petX += (s.heroX - this.moveDX * 18 - s.petX) * 0.18;
      s.petY += (s.heroY - this.moveDY * 16 - s.petY) * 0.18;
      s.heroX = nx;
      s.heroY = ny;

      // 4. 檢查是否踩中跨地圖傳送門 (Portals)
      if (mapObj.portals) {
        for (const p of mapObj.portals) {
          if (Math.hypot(s.heroX - p.x, s.heroY - p.y) < 18) {
            this.stopMove();
            this.triggerPortal(p);
            return;
          }
        }
      }

      // 5. 檢查是否接觸巡邏魔物觸發戰鬥
      if (mapObj.monsters) {
        for (const m of mapObj.monsters) {
          if (m.alive !== false && Math.hypot(s.heroX - m.x, s.heroY - m.y) < 16) {
            this.stopMove();
            window.Aetheria.Battle.startBattle(m);
            return;
          }
        }
      }

      this.updateContextHint(mapObj, s);
      window.Aetheria.UI.updateHudZoneDynamic(mapObj, s);
    },

    // 動態更新 A 鍵文字提示 (讓玩家清楚知道按 A 鍵會對話還是挖礦)
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
      if (mapObj.nodes) {
        for (const n of mapObj.nodes) {
          if (!n.opened && !(s.openedNodes && s.openedNodes[n.id]) && Math.hypot(s.heroX - n.x, s.heroY - n.y) < 28) {
            hintEl.innerText = `採集:${n.name.slice(0, 4)}`;
            return;
          }
        }
      }
      hintEl.innerText = "對話 / 採集";
    },

    // 執行跨地圖或無盡試煉之塔樓層傳送
    triggerPortal(portal) {
      const s = window.Aetheria.State.data;
      if (portal.targetZone === "endless_tower_next") {
        const curMap = window.Aetheria.Data.Maps.getMap("endless_tower");
        const nextFloor = (curMap.floorNum || 1) + 1;
        s.maxTowerFloor = Math.max(s.maxTowerFloor || 1, nextFloor);
        window.Aetheria.Data.Maps.advanceTowerFloor(nextFloor);
        s.currentZone = "endless_tower";
        s.heroX = portal.targetX;
        s.heroY = portal.targetY;
      } else {
        s.currentZone = portal.targetZone;
        s.heroX = portal.targetX;
        s.heroY = portal.targetY;
      }
      s.petX = s.heroX - 18;
      s.petY = s.heroY + 6;
      window.Aetheria.State.save();

      const newMap = window.Aetheria.Data.Maps.getMap(s.currentZone);
      window.Aetheria.Audio.playBgm(newMap.bgm || "forest");
      window.Aetheria.UI.updateAllHud();
      window.Aetheria.UI.showToast(`🚪 進入【${newMap.name}】！`);
    },

    // 按下【A 鍵】或【調查】：自動偵測身邊的 NPC、閃光礦脈、靈草或寶箱
    interactNearby() {
      if (window.Aetheria.Battle && window.Aetheria.Battle.active) return;
      const s = window.Aetheria.State.data;
      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);

      // 1. 優先檢查身邊是否有 NPC 可對話
      if (mapObj.npcs) {
        for (const npc of mapObj.npcs) {
          if (Math.hypot(s.heroX - npc.x, s.heroY - npc.y) < 32) {
            window.Aetheria.Audio.sfxTalkBlip();
            window.Aetheria.UI.openNpcDialogue(npc.id);
            return;
          }
        }
      }

      // 2. 檢查身邊是否有可採集的礦脈、靈草、木箱或寶箱
      if (mapObj.nodes) {
        for (const n of mapObj.nodes) {
          if (!n.opened && !(s.openedNodes && s.openedNodes[n.id]) && Math.hypot(s.heroX - n.x, s.heroY - n.y) < 30) {
            this.harvestNode(n);
            return;
          }
        }
      }

      // 3. 檢查是否在營地燉肉鍋旁
      if (s.currentZone === "forest_world" && Math.hypot(s.heroX - 446, s.heroY - 315) < 32) {
        s.hp = s.maxHp;
        window.Aetheria.Audio.sfxGather();
        window.Aetheria.UI.updateAllHud();
        window.Aetheria.UI.showToast("🍲 喝下營地熱騰騰的蘑菇燉湯，紅心生命值全滿！");
        return;
      }

      window.Aetheria.UI.showToast("🔍 請走近 👴NPC、💎藍晶礦、🍄微光菇或🎁寶箱再按 A 鍵！");
    },

    // 處理資源節點採集 (支援工具等級加成、幸運護符雙倍、以及閃光礦脈 8 秒完美採集 x3 大爆擊！)
    harvestNode(node) {
      const s = window.Aetheria.State.data;
      node.opened = true;
      if (node.legendary) {
        s.openedNodes[node.id] = true;
      }

      // 若為「✨閃光秘銀礦簇」，觸發 8 秒限時完美採集挑戰！
      if (node.perfect) {
        window.Aetheria.Battle.startHarvestChallenge(node);
        return;
      }

      window.Aetheria.Audio.sfxGather();
      const pickBonus = (s.tools.pickaxe >= 3) ? 2 : (s.tools.pickaxe === 2) ? 1 : 0;
      const axeBonus  = (s.tools.axe >= 2) ? 1 : 0;
      const luckyMult = (s.unlockedRelics && s.unlockedRelics.includes("r_charm") && Math.random() < 0.5) ? 2 : 1;

      if (node.type === "crystal") {
        const amt = (2 + pickBonus) * luckyMult;
        s.inventory.iron += amt;
        window.Aetheria.UI.showToast(`💎 挖掘成功：獲得【藍晶鐵礦 +${amt}】！`);
      } else if (node.type === "mushroom") {
        const amt = (1 + axeBonus) * luckyMult;
        s.inventory.herb += amt;
        window.Aetheria.UI.showToast(`🍄 採集成功：獲得【紅傘微光菇 +${amt}】！`);
      } else if (node.type === "flower") {
        const amt = (1 + axeBonus) * luckyMult;
        s.inventory.flower += amt;
        if (s.tools.axe >= 3 && Math.random() < 0.4) {
          s.inventory.tameFruit += 1;
          window.Aetheria.UI.showToast(`🌸 雷鳴神斧觸發！獲得【太陽花 +${amt}】與【🍎靈獸誘餌果 +1】！`);
        } else {
          window.Aetheria.UI.showToast(`🌸 採集成功：獲得【翠風太陽花 +${amt}】！`);
        }
      } else if (node.type === "chest") {
        if (node.legendary) {
          s.inventory.mithril += 4;
          s.inventory.starIron += 2;
          s.inventory.tameFruit += 2;
          window.Aetheria.Audio.sfxLevelUp();
          window.Aetheria.UI.showToast("🟣 開啟傳說秘寶箱：流沙秘銀 +4、深淵星隕鐵 +2、誘餌果 +2！");
        } else {
          s.inventory.iron += 3;
          s.inventory.potionHint += 1;
          window.Aetheria.UI.showToast("🎁 開啟紅金寶箱：藍晶鐵礦 +3、洞察藥水 +1！");
        }
      } else {
        s.inventory.wood += 2;
        s.inventory.iron += 1;
        window.Aetheria.UI.showToast("📦 搜括營地木箱：獲得【翠風原木 +2】、【藍晶鐵礦 +1】！");
      }

      window.Aetheria.State.save();
      window.Aetheria.UI.updateAllHud();
    },

    // 使用【💣 炸彈】炸開身邊的裂縫岩壁 (Metroidvania 探索破障)
    useBomb() {
      if (window.Aetheria.Battle && window.Aetheria.Battle.active) return;
      const s = window.Aetheria.State.data;
      if ((s.inventory.bombItem || 0) <= 0) {
        window.Aetheria.UI.showToast("⚠️ 爆破炸彈不足！可在鐵匠鋪煉金合成或向行商奇奇議價取得。");
        return;
      }

      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
      if (mapObj.decos) {
        for (const d of mapObj.decos) {
          if (d.isCrackedWall && !(s.openedNodes && s.openedNodes[d.id]) && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 42) {
            s.inventory.bombItem--;
            s.openedNodes[d.id] = true;
            window.Aetheria.Audio.sfxBomb();
            window.Aetheria.State.save();
            window.Aetheria.UI.showToast("💥 轟隆！成功炸開裂縫岩壁，隱藏密室通道已開啟！");
            return;
          }
        }
      }
      window.Aetheria.UI.showToast("💣 請走近洞窟內的「🧱裂縫岩壁」再使用炸彈！");
    },

    // 一鍵傳送返回中央露營基地火堆
    warpToCamp() {
      if (window.Aetheria.Battle && window.Aetheria.Battle.active) return;
      const s = window.Aetheria.State.data;
      s.currentZone = "forest_world";
      s.heroX = 420;
      s.heroY = 345;
      s.petX = 396;
      s.petY = 350;
      s.facing = "down";
      window.Aetheria.State.save();
      window.Aetheria.Audio.playBgm("forest");
      window.Aetheria.UI.closePanelToExplore();
      window.Aetheria.UI.updateAllHud();
      window.Aetheria.UI.showToast("⛺ 已傳送返回【曙光中央露營基地】！");
    }
  };

  window.Aetheria.Explore = ExploreSystem;
})();