/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 四方向探索、4大工具破障、釣魚抓鉤與機關系統 (exploration-gather.js - Full v2.5)
 * 包含：1.平滑移動與阻擋判定 2.A鍵智慧感應(NPC/挖礦/釣魚/抓鉤飛躍/敲巨石/砍枯木/點火盆驅霧)
 *       3.高階區域專屬產物(雪山冰蓮/熔岩黑曜石/世界樹金葉) 4.炸彈破牆
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

    updateStep() {
      if (!this.isMoving) return;
      const s = window.Aetheria.State.data;
      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);

      let speed = 2.1;
      if (s.currentJob === "thief") speed += 0.4;
      if (s.unlockedRelics && s.unlockedRelics.includes("r_cloak")) speed += 0.35;

      let nx = Math.max(28, Math.min(mapObj.width - 42, s.heroX + this.moveDX * speed));
      let ny = Math.max(28, Math.min(mapObj.height - 42, s.heroY + this.moveDY * speed));

      // 1. 檢查翡翠河流碰撞 (唯有木橋 y: 306 ~ 352 區間可步行通過，或使用抓鉤飛越)
      if (mapObj.hasRiver) {
        const inRiverX = (nx > 648 && nx < 706);
        const onBridgeY = (ny > 306 && ny < 352);
        if (inRiverX && !onBridgeY) {
          nx = s.heroX;
        }
      }

      // 2. 檢查裂縫岩壁、擋路玄武巨石、擋路巨型枯木阻擋
      if (mapObj.decos) {
        for (const d of mapObj.decos) {
          const isCleared = s.openedNodes && s.openedNodes[d.id];
          if (!isCleared && (d.isCrackedWall || d.obstacleType)) {
            if (Math.hypot(nx - d.x, ny - d.y) < 22) {
              nx = s.heroX;
              ny = s.heroY;
              if (d.isCrackedWall) {
                window.Aetheria.UI.showToast("🧱 裂縫岩壁擋路！請按右下角【💣 炸彈】炸開密室！");
              } else if (d.obstacleType === "boulder") {
                window.Aetheria.UI.showToast("🪨 玄武巨石擋路！升級【⛏️Lv.2 秘銀重鎬】後按 A 鍵即可敲碎！");
              } else if (d.obstacleType === "deadtree") {
                window.Aetheria.UI.showToast("🌲 巨型枯木擋路！升級【🪓Lv.2 烈焰戰斧】後按 A 鍵即可砍斷！");
              }
            }
          }
        }
      }

      // 3. 戰寵平滑跟隨
      s.petX += (s.heroX - this.moveDX * 18 - s.petX) * 0.18;
      s.petY += (s.heroY - this.moveDY * 16 - s.petY) * 0.18;
      s.heroX = nx;
      s.heroY = ny;

      // 4. 檢查跨地圖傳送門
      if (mapObj.portals) {
        for (const p of mapObj.portals) {
          if (Math.hypot(s.heroX - p.x, s.heroY - p.y) < 18) {
            this.stopMove();
            this.triggerPortal(p);
            return;
          }
        }
      }

      // 5. 檢查觸碰巡邏魔物 (將野生閃光屬性 forceShiny 一併傳入戰鬥！)
      if (mapObj.monsters) {
        for (const m of mapObj.monsters) {
          if (m.alive !== false && Math.hypot(s.heroX - m.x, s.heroY - m.y) < 16) {
            this.stopMove();
            if (m.isShiny) m.forceShiny = true;
            window.Aetheria.Battle.startBattle(m);
            return;
          }
        }
      }

      this.updateContextHint(mapObj, s);
      window.Aetheria.UI.updateHudZoneDynamic(mapObj, s);
    },

    // 動態更新 A 鍵文字提示
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
            if (d.isFishingSpot) { hintEl.innerText = "🎣 垂釣"; return; }
            if (d.isGrapple)     { hintEl.innerText = "🪝 飛爪鉤"; return; }
            if (d.isBrazier)     { hintEl.innerText = "🔥 點火盆"; return; }
            if (d.obstacleType === "boulder")  { hintEl.innerText = "⛏️ 碎巨石"; return; }
            if (d.obstacleType === "deadtree") { hintEl.innerText = "🪓 砍枯木"; return; }
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

    // 按下【A 鍵】：全方位偵測 NPC、工具機關(釣魚/抓鉤/碎石/砍樹/點火盆) 與 採集點
    interactNearby() {
      if (window.Aetheria.Battle && window.Aetheria.Battle.active) return;
      const s = window.Aetheria.State.data;
      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);

      // 1. 檢查身邊 NPC
      if (mapObj.npcs) {
        for (const npc of mapObj.npcs) {
          if (Math.hypot(s.heroX - npc.x, s.heroY - npc.y) < 32) {
            window.Aetheria.Audio.sfxTalkBlip();
            window.Aetheria.UI.openNpcDialogue(npc.id);
            return;
          }
        }
      }

      // 2. 檢查身邊 Metroidvania 工具互動點與機關 (釣魚點 / 抓鉤樁 / 巨石 / 枯木 / 火盆)
      if (mapObj.decos) {
        for (const d of mapObj.decos) {
          const isCleared = s.openedNodes && s.openedNodes[d.id];
          if (!isCleared && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 34) {
            // A. 🎣 水波釣魚點
            if (d.isFishingSpot) {
              this.triggerFishing(d);
              return;
            }
            // B. 🪝 鐵索飛爪鉤木樁
            if (d.isGrapple) {
              if ((s.tools.hook || 1) < 2) {
                window.Aetheria.UI.showToast("🪝 需要【🎣Lv.2 鐵索飛爪鉤】才可飛越斷崖與河流！請至鐵匠鋪升級工具。");
                return;
              }
              window.Aetheria.Audio.sfxAttackHit();
              s.heroX = d.targetX;
              s.heroY = d.targetY;
              s.petX = s.heroX - 16;
              s.petY = s.heroY + 4;
              window.Aetheria.State.save();
              window.Aetheria.UI.showToast("🪝 咻——！發射鐵索飛爪鉤，成功飛越對岸！");
              return;
            }
            // C. 🔥 洞穴迷霧驅散火盆
            if (d.isBrazier) {
              const litKey = `lit_${mapObj.id}`;
              s.openedNodes[litKey] = true;
              window.Aetheria.Audio.sfxLevelUp();
              window.Aetheria.State.save();
              window.Aetheria.UI.showToast("🔥 已點燃古代火盆！聖火光芒永久驅散了洞窟的黑霧！");
              return;
            }
            // D. 🪨 擋路玄武巨石 (需 Lv.2 秘銀重鎬)
            if (d.obstacleType === "boulder") {
              if ((s.tools.pickaxe || 1) < 2) {
                window.Aetheria.UI.showToast("🪨 岩石過於堅硬！請先到鐵匠鋪升級【⛏️Lv.2 秘銀重鎬】！");
                return;
              }
              s.openedNodes[d.id] = true;
              s.inventory.iron += 2;
              window.Aetheria.Audio.sfxBreakShield();
              window.Aetheria.State.save();
              window.Aetheria.UI.showToast("⛏️ 鏘！使用秘銀重鎬擊碎擋路巨石，獲得【藍晶鐵礦 +2】並開通道路！");
              return;
            }
            // E. 🌲 擋路巨型枯木 (需 Lv.2 烈焰戰斧)
            if (d.obstacleType === "deadtree") {
              if ((s.tools.axe || 1) < 2) {
                window.Aetheria.UI.showToast("🌲 枯木粗壯無比！請先到鐵匠鋪升級【🪓Lv.2 烈焰戰斧】！");
                return;
              }
              s.openedNodes[d.id] = true;
              s.inventory.wood += 3;
              window.Aetheria.Audio.sfxBreakShield();
              window.Aetheria.State.save();
              window.Aetheria.UI.showToast("🪓 唰！揮動烈焰戰斧劈開巨型枯木，獲得【翠風原木 +3】並開通秘境！");
              return;
            }
          }
        }
      }

      // 3. 檢查採集礦脈、靈草與寶箱
      if (mapObj.nodes) {
        for (const n of mapObj.nodes) {
          if (!n.opened && !(s.openedNodes && s.openedNodes[n.id]) && Math.hypot(s.heroX - n.x, s.heroY - n.y) < 30) {
            this.harvestNode(n);
            return;
          }
        }
      }

      // 4. 營地燉肉鍋回復
      if (s.currentZone === "forest_world" && Math.hypot(s.heroX - 446, s.heroY - 315) < 32) {
        s.hp = s.maxHp;
        window.Aetheria.Audio.sfxGather();
        window.Aetheria.UI.updateAllHud();
        window.Aetheria.UI.showToast("🍲 喝下營地熱騰騰的蘑菇燉湯，紅心生命值全滿！");
        return;
      }

      window.Aetheria.UI.showToast("🔍 請走近 👴NPC、💎礦脈、🎣釣魚點、🪝抓鉤樁或🎁寶箱再按 A 鍵！");
    },

    // 🎣 觸發水波釣魚點 (支援深海金鉤與幸運護符加成)
    triggerFishing(spot) {
      const s = window.Aetheria.State.data;
      spot.isFishingSpot = false;
      spot.sprite = "deco_rock";

      window.Aetheria.Audio.sfxGather();
      const hookLv = s.tools.hook || 1;
      const luckyMult = (s.unlockedRelics && s.unlockedRelics.includes("r_charm") && Math.random() < 0.5) ? 2 : 1;

      if (hookLv >= 3) {
        s.inventory.mithril += 2 * luckyMult;
        s.inventory.iceLotus += 1 * luckyMult;
        s.inventory.tameFruit += 1;
        window.Aetheria.UI.showToast(`🎣 深海黃金鉤大豐收！釣起【流沙秘銀 +${2 * luckyMult}】、【雪山冰蓮 +${luckyMult}】、【🍎誘餌果 +1】！`);
      } else {
        s.inventory.mithril += 1 * luckyMult;
        s.inventory.potionHeal += 1;
        window.Aetheria.UI.showToast(`🎣 垂釣成功！釣起閃閃發光的【🪙流沙秘銀 +${luckyMult}】與【🧪生命藥水 +1】！`);
      }
      window.Aetheria.State.save();
      window.Aetheria.UI.updateAllHud();
    },

    harvestNode(node) {
      const s = window.Aetheria.State.data;
      node.opened = true;
      if (node.legendary) {
        s.openedNodes[node.id] = true;
      }

      if (node.perfect) {
        window.Aetheria.Battle.startHarvestChallenge(node);
        return;
      }

      window.Aetheria.Audio.sfxGather();
      const pickBonus = (s.tools.pickaxe >= 3) ? 2 : (s.tools.pickaxe === 2) ? 1 : 0;
      const axeBonus  = (s.tools.axe >= 2) ? 1 : 0;
      const luckyMult = (s.unlockedRelics && s.unlockedRelics.includes("r_charm") && Math.random() < 0.5) ? 2 : 1;

      if (node.obsidianNode) {
        const amt = (1 + pickBonus) * luckyMult;
        s.inventory.obsidian += amt;
        window.Aetheria.UI.showToast(`🔥 挖掘成功：獲得高階【熔岩黑曜石 +${amt}】！`);
      } else if (node.snowLotus) {
        const amt = (1 + axeBonus) * luckyMult;
        s.inventory.iceLotus += amt;
        window.Aetheria.UI.showToast(`🪷 採集成功：獲得極寒【雪山冰蓮 +${amt}】！`);
      } else if (node.goldLeafNode) {
        const amt = (1 + axeBonus) * luckyMult;
        s.inventory.goldLeaf += amt;
        window.Aetheria.UI.showToast(`🌳 採集成功：獲得傳說【世界樹金葉 +${amt}】！`);
      } else if (node.type === "crystal") {
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
        if (s.tools.axe >= 3 && Math.random() < 0.45) {
          s.inventory.tameFruit += 1;
          window.Aetheria.UI.showToast(`🌸 雷鳴神斧觸發！獲得【太陽花 +${amt}】與【🍎靈獸誘餌果 +1】！`);
        } else {
          window.Aetheria.UI.showToast(`🌸 採集成功：獲得【翠風太陽花 +${amt}】！`);
        }
      } else if (node.type === "chest") {
        if (node.legendary) {
          s.inventory.mithril += 4;
          s.inventory.obsidian += 2;
          s.inventory.starIron += 2;
          s.inventory.tameFruit += 2;
          window.Aetheria.Audio.sfxLevelUp();
          window.Aetheria.UI.showToast("🟣 開啟傳說秘寶箱：秘銀 +4、黑曜石 +2、星隕鐵 +2、誘餌果 +2！");
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
