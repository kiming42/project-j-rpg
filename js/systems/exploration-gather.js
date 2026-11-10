/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 探索移動、怪物巡邏追擊AI、步行解鎖傳送與採集系統 (exploration-gather.js - v3.3)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const ExploreSystem = {
    isMoving: false,
    moveDX: 0,
    moveDY: 0,

    initControls: function() {
      const self = this;
      const bindPad = function(id, dx, dy) {
        const el = document.getElementById(id);
        if (!el) return;
        const start = function(e) {
          if (e && e.cancelable) e.preventDefault();
          self.startMove(dx, dy);
        };
        const end = function(e) {
          if (e && e.cancelable) e.preventDefault();
          self.stopMove();
        };
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

      window.addEventListener("keydown", function(e) {
        if (window.Aetheria.Battle && window.Aetheria.Battle.active) return;
        const titleEl = document.getElementById("title-screen");
        if (titleEl && titleEl.style.display !== "none") return;

        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") self.startMove(0, -1);
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") self.startMove(0, 1);
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") self.startMove(-1, 0);
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") self.startMove(1, 0);
        if (e.key === " " || e.key === "Enter") self.interactNearby();
      });

      window.addEventListener("keyup", function(e) {
        const keys = ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d","W","A","S","D"];
        if (keys.indexOf(e.key) !== -1) {
          self.stopMove();
        }
      });
    },

    startMove: function(dx, dy) {
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

    stopMove: function() {
      this.isMoving = false;
      this.moveDX = 0;
      this.moveDY = 0;
    },

    updateStep: function() {
      const s = window.Aetheria.State.data;
      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
      if (!mapObj) return;

      this.updateMonstersAI(mapObj, s);

      if (!this.isMoving) return;

      let speed = 2.15;
      if (s.currentJob === "thief") speed += 0.45;
      if (s.unlockedRelics && s.unlockedRelics.indexOf("r_cloak") !== -1) speed += 0.35;

      let nx = Math.max(24, Math.min(mapObj.width - 36, s.heroX + this.moveDX * speed));
      let ny = Math.max(24, Math.min(mapObj.height - 36, s.heroY + this.moveDY * speed));

      // 1. 河流與木橋通行判定
      if (mapObj.hasRiver) {
        const rx = mapObj.riverX || 555;
        const by = mapObj.bridgeY || 250;
        const inRiverX = (nx > rx - 14 && nx < rx + 38);
        const onBridgeY = (ny > by - 6 && ny < by + 38);
        if (inRiverX && !onBridgeY) {
          nx = s.heroX;
        }
      }

      // 2. 裂縫牆、巨石與枯木阻擋判定
      if (mapObj.decos) {
        for (let i = 0; i < mapObj.decos.length; i++) {
          const d = mapObj.decos[i];
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

      // 3. 戰寵平滑跟隨
      s.petX += (s.heroX - this.moveDX * 18 - s.petX) * 0.18;
      s.petY += (s.heroY - this.moveDY * 16 - s.petY) * 0.18;
      s.heroX = nx;
      s.heroY = ny;

      // 4. 傳送門與帳篷入口觸發
      if (mapObj.portals) {
        for (let j = 0; j < mapObj.portals.length; j++) {
          const p = mapObj.portals[j];
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

    // 野外怪物巡邏走動 + 接近時 [!] 加速衝刺追擊 AI
    updateMonstersAI: function(mapObj, s) {
      if (!mapObj || !mapObj.monsters || mapObj.monsters.length === 0) return;
      if (window.Aetheria.Battle && window.Aetheria.Battle.active) return;
      const titleEl = document.getElementById("title-screen");
      if (titleEl && titleEl.style.display !== "none") return;

      for (let i = 0; i < mapObj.monsters.length; i++) {
        const m = mapObj.monsters[i];
        if (m.alive === false) continue;

        const distToHero = Math.hypot(s.heroX - m.x, s.heroY - m.y);

        if (distToHero < 15) {
          this.stopMove();
          if (m.isShiny) m.forceShiny = true;
          window.Aetheria.Battle.startBattle(m);
          return;
        }

        const aggroRadius = m.isBoss ? 78 : 66;
        if (distToHero < aggroRadius) {
          m.aggro = true;
          const chaseSpeed = m.isBoss ? 1.15 : 1.38;
          const dx = (s.heroX - m.x) / (distToHero || 1);
          const dy = (s.heroY - m.y) / (distToHero || 1);
          let nextMX = m.x + dx * chaseSpeed;
          let nextMY = m.y + dy * chaseSpeed;

          if (mapObj.hasRiver) {
            const rx = mapObj.riverX || 555;
            if (nextMX > rx - 14 && nextMX < rx + 38) nextMX = m.x;
          }

          m.x = Math.max(30, Math.min(mapObj.width - 40, nextMX));
          m.y = Math.max(30, Math.min(mapObj.height - 40, nextMY));
        } else {
          m.aggro = false;
          m.patrolTimer = (m.patrolTimer || 60) - 1;
          if (m.patrolTimer <= 0) {
            m.patrolTimer = 50 + Math.floor(Math.random() * 60);
            const randAng = Math.random() * Math.PI * 2;
            m.vx = Math.cos(randAng) * 0.45;
            m.vy = Math.sin(randAng) * 0.45;
          }

          let nextMX = m.x + (m.vx || 0);
          let nextMY = m.y + (m.vy || 0);

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

    updateContextHint: function(mapObj, s) {
      const hintEl = document.getElementById("a-btn-hint");
      if (!hintEl) return;

      if (mapObj.npcs) {
        for (let i = 0; i < mapObj.npcs.length; i++) {
          const npc = mapObj.npcs[i];
          if (Math.hypot(s.heroX - npc.x, s.heroY - npc.y) < 30) {
            hintEl.innerText = "對話:" + (npc.name.split("・")[1] || npc.name);
            return;
          }
        }
      }
      if (mapObj.decos) {
        for (let j = 0; j < mapObj.decos.length; j++) {
          const d = mapObj.decos[j];
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
        for (let k = 0; k < mapObj.nodes.length; k++) {
          const n = mapObj.nodes[k];
          if (!n.opened && !(s.openedNodes && s.openedNodes[n.id]) && Math.hypot(s.heroX - n.x, s.heroY - n.y) < 28) {
            hintEl.innerText = "採集:" + n.name.slice(0, 4);
            return;
          }
        }
      }
      hintEl.innerText = "對話 / 採集";
    },

    triggerPortal: function(portal) {
      const s = window.Aetheria.State.data;
      let newlyUnlocked = false;

      if (portal.targetZone === "endless_tower_next") {
        const curMap = window.Aetheria.Data.Maps.getMap("endless_tower");
        const nextFloor = (curMap.floorNum || 1) + 1;
        s.maxTowerFloor = Math.max(s.maxTowerFloor || 1, nextFloor);
        window.Aetheria.Data.Maps.advanceTowerFloor(nextFloor);
        s.currentZone = "endless_tower";
        s.heroX = portal.targetX;
        s.heroY = portal.targetY;
        newlyUnlocked = window.Aetheria.State.unlockZone("endless_tower");
      } else {
        s.currentZone = portal.targetZone;
        s.heroX = portal.targetX;
        s.heroY = portal.targetY;
        newlyUnlocked = window.Aetheria.State.unlockZone(portal.targetZone);
      }

      s.petX = s.heroX - 18;
      s.petY = s.heroY + 6;
      window.Aetheria.State.save();

      const newMap = window.Aetheria.Data.Maps.getMap(s.currentZone);
      window.Aetheria.Audio.playBgm(newMap.bgm || "forest");
      window.Aetheria.UI.updateAllHud();

      if (newlyUnlocked) {
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.UI.showToast("已步行抵達並解鎖【" + newMap.name + "】傳送石碑！");
      } else {
        window.Aetheria.UI.showToast("進入【" + newMap.name + "】");
      }
    },

    interactNearby: function() {
      if (window.Aetheria.Battle && window.Aetheria.Battle.active) return;
      const s = window.Aetheria.State.data;
      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);

      if (mapObj.npcs) {
        for (let i = 0; i < mapObj.npcs.length; i++) {
          const npc = mapObj.npcs[i];
          if (Math.hypot(s.heroX - npc.x, s.heroY - npc.y) < 32) {
            window.Aetheria.Audio.sfxTalkBlip();
            window.Aetheria.UI.openNpcDialogue(npc.id);
            return;
          }
        }
      }

      if (mapObj.decos) {
        for (let j = 0; j < mapObj.decos.length; j++) {
          const d = mapObj.decos[j];
          const isCleared = s.openedNodes && s.openedNodes[d.id];
          if (!isCleared && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 34) {
            if (d.isFishingSpot) {
              this.triggerFishing(d);
              return;
            }
            if (d.isGrapple) {
              if ((s.tools.hook || 1) < 2) {
                window.Aetheria.UI.showToast("需要【Lv.2 鐵索飛爪鉤】才可飛越！請至鐵匠鋪升級工具。");
                return;
              }
              window.Aetheria.Audio.sfxAttackHit();
              s.heroX = d.targetX;
              s.heroY = d.targetY;
              s.petX = s.heroX - 16;
              s.petY = s.heroY + 4;
              window.Aetheria.State.save();
              window.Aetheria.UI.showToast("發射鐵索飛爪鉤，成功飛越對岸！");
              return;
            }
            if (d.isBrazier) {
              const litKey = "lit_" + mapObj.id;
              s.openedNodes[litKey] = true;
              window.Aetheria.Audio.sfxLevelUp();
              window.Aetheria.State.save();
              window.Aetheria.UI.showToast("已點燃古代火盆！聖火永久驅散了洞窟的黑霧！");
              return;
            }
            if (d.obstacleType === "boulder") {
              if ((s.tools.pickaxe || 1) < 2) {
                window.Aetheria.UI.showToast("岩石堅硬！請先到鐵匠鋪升級【Lv.2 秘銀重鎬】！");
                return;
              }
              s.openedNodes[d.id] = true;
              s.inventory.iron += 2;
              window.Aetheria.Audio.sfxBreakShield();
              window.Aetheria.State.save();
              window.Aetheria.UI.showToast("使用秘銀重鎬擊碎擋路巨石，獲得【藍晶鐵礦 +2】！");
              return;
            }
            if (d.obstacleType === "deadtree") {
              if ((s.tools.axe || 1) < 2) {
                window.Aetheria.UI.showToast("枯木粗壯！請先到鐵匠鋪升級【Lv.2 烈焰戰斧】！");
                return;
              }
              s.openedNodes[d.id] = true;
              s.inventory.wood += 3;
              window.Aetheria.Audio.sfxBreakShield();
              window.Aetheria.State.save();
              window.Aetheria.UI.showToast("揮動烈焰戰斧劈開巨型枯木，獲得【翠風原木 +3】！");
              return;
            }
          }
        }
      }

      if (mapObj.nodes) {
        for (let k = 0; k < mapObj.nodes.length; k++) {
          const n = mapObj.nodes[k];
          if (!n.opened && !(s.openedNodes && s.openedNodes[n.id]) && Math.hypot(s.heroX - n.x, s.heroY - n.y) < 30) {
            this.harvestNode(n);
            return;
          }
        }
      }

      if (s.currentZone === "camp_hub" && Math.hypot(s.heroX - 272, s.heroY - 195) < 32) {
        s.hp = s.maxHp;
        window.Aetheria.Audio.sfxGather();
        window.Aetheria.UI.updateAllHud();
        window.Aetheria.UI.showToast("喝下營地熱騰騰的蘑菇燉湯，生命值全滿！");
        return;
      }

      window.Aetheria.UI.showToast("請走近 NPC、礦脈、釣魚點或寶箱再按 A 鍵！");
    },

    triggerFishing: function(spot) {
      const s = window.Aetheria.State.data;
      spot.isFishingSpot = false;
      spot.sprite = "deco_rock";

      window.Aetheria.Audio.sfxGather();
      const hookLv = s.tools.hook || 1;
      const luckyMult = (s.unlockedRelics && s.unlockedRelics.indexOf("r_charm") !== -1 && Math.random() < 0.5) ? 2 : 1;

      if (hookLv >= 3) {
        s.inventory.mithril += 2 * luckyMult;
        s.inventory.iceLotus += 1 * luckyMult;
        s.inventory.tameFruit += 1;
        window.Aetheria.UI.showToast("深海黃金鉤大豐收！獲得【流沙秘銀 +" + (2 * luckyMult) + "】、【雪山冰蓮 +" + luckyMult + "】、【誘餌果 +1】！");
      } else {
        s.inventory.mithril += 1 * luckyMult;
        s.inventory.potionHeal += 1;
        window.Aetheria.UI.showToast("垂釣成功！釣起【流沙秘銀 +" + luckyMult + "】與【生命藥水 +1】！");
      }
      window.Aetheria.State.save();
      window.Aetheria.UI.updateAllHud();
    },

    harvestNode: function(node) {
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
      const luckyMult = (s.unlockedRelics && s.unlockedRelics.indexOf("r_charm") !== -1 && Math.random() < 0.5) ? 2 : 1;

      if (node.obsidianNode) {
        const amt = (1 + pickBonus) * luckyMult;
        s.inventory.obsidian += amt;
        window.Aetheria.UI.showToast("挖掘成功：獲得【熔岩黑曜石 +" + amt + "】！");
      } else if (node.snowLotus) {
        const amt = (1 + axeBonus) * luckyMult;
        s.inventory.iceLotus += amt;
        window.Aetheria.UI.showToast("採集成功：獲得【雪山冰蓮 +" + amt + "】！");
      } else if (node.goldLeafNode) {
        const amt = (1 + axeBonus) * luckyMult;
        s.inventory.goldLeaf += amt;
        window.Aetheria.UI.showToast("採集成功：獲得【世界樹金葉 +" + amt + "】！");
      } else if (node.type === "crystal") {
        const amt = (2 + pickBonus) * luckyMult;
        s.inventory.iron += amt;
        window.Aetheria.UI.showToast("挖掘成功：獲得【藍晶鐵礦 +" + amt + "】！");
      } else if (node.type === "mushroom") {
        const amt = (1 + axeBonus) * luckyMult;
        s.inventory.herb += amt;
        window.Aetheria.UI.showToast("採集成功：獲得【紅傘微光菇 +" + amt + "】！");
      } else if (node.type === "flower") {
        const amt = (1 + axeBonus) * luckyMult;
        s.inventory.flower += amt;
        if (s.tools.axe >= 3 && Math.random() < 0.45) {
          s.inventory.tameFruit += 1;
          window.Aetheria.UI.showToast("雷鳴神斧觸發！獲得【太陽花 +" + amt + "】與【靈獸誘餌果 +1】！");
        } else {
          window.Aetheria.UI.showToast("採集成功：獲得【翠風太陽花 +" + amt + "】！");
        }
      } else if (node.type === "chest") {
        if (node.legendary) {
          s.inventory.mithril += 4;
          s.inventory.obsidian += 2;
          s.inventory.starIron += 2;
          s.inventory.tameFruit += 2;
          window.Aetheria.Audio.sfxLevelUp();
          window.Aetheria.UI.showToast("開啟傳說秘寶箱：秘銀 +4、黑曜石 +2、星隕鐵 +2、誘餌果 +2！");
        } else {
          s.inventory.iron += 3;
          s.inventory.potionHint += 1;
          window.Aetheria.UI.showToast("開啟紅金寶箱：藍晶鐵礦 +3、洞察藥水 +1！");
        }
      } else {
        s.inventory.wood += 2;
        s.inventory.iron += 1;
        window.Aetheria.UI.showToast("搜括補給木箱：獲得【翠風原木 +2】、【藍晶鐵礦 +1】！");
      }

      window.Aetheria.State.save();
      window.Aetheria.UI.updateAllHud();
    },

    useBomb: function() {
      if (window.Aetheria.Battle && window.Aetheria.Battle.active) return;
      const s = window.Aetheria.State.data;
      if ((s.inventory.bombItem || 0) <= 0) {
        window.Aetheria.UI.showToast("爆破炸彈不足！可在鐵匠鋪煉金提煉取得。");
        return;
      }

      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
      if (mapObj.decos) {
        for (let i = 0; i < mapObj.decos.length; i++) {
          const d = mapObj.decos[i];
          if (d.isCrackedWall && !(s.openedNodes && s.openedNodes[d.id]) && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 42) {
            s.inventory.bombItem--;
            s.openedNodes[d.id] = true;
            window.Aetheria.Audio.sfxBomb();
            window.Aetheria.State.save();
            window.Aetheria.UI.showToast("轟隆！成功炸開裂縫岩壁，隱藏密室通道已開啟！");
            return;
          }
        }
      }
      window.Aetheria.UI.showToast("請走近洞窟內的「裂縫岩壁」再使用炸彈！");
    },

    warpToCamp: function() {
      if (window.Aetheria.Battle && window.Aetheria.Battle.active) return;
      const s = window.Aetheria.State.data;
      s.currentZone = "camp_hub";
      s.heroX = 250;
      s.heroY = 220;
      s.petX = 228;
      s.petY = 224;
      s.facing = "down";
      window.Aetheria.State.save();
      window.Aetheria.Audio.playBgm("forest");
      window.Aetheria.UI.closePanelToExplore();
      window.Aetheria.UI.updateAllHud();
      window.Aetheria.UI.showToast("已返回【0. 曙光露營基地】！");
    }
  };

  window.Aetheria.Explore = ExploreSystem;
})();
