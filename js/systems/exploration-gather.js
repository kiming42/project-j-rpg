/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 守關領主封印檢查、環境危害扣血與營地料理互動 (exploration-gather.js - v4.0)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const ExploreSystem = {
    isMoving: false,
    moveDX: 0,
    moveDY: 0,
    hazardTimer: 0,

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
        const cutEl = document.getElementById("story-cutscene-modal");
        if (cutEl && cutEl.style.display !== "none") return;

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

      // 更新環境危害遮罩與持續傷害 (第四區極寒雪原 / 第五區熔岩火山)
      this.checkEnvironmentalHazard(mapObj, s);

      this.updateMonstersAI(mapObj, s);

      if (!this.isMoving) return;

      let speed = 2.15;
      if (s.currentJob === "thief") speed += 0.45;
      if (s.unlockedRelics && s.unlockedRelics.indexOf("r_cloak") !== -1) speed += 0.35;

      let nx = Math.max(24, Math.min(mapObj.width - 36, s.heroX + this.moveDX * speed));
      let ny = Math.max(24, Math.min(mapObj.height - 36, s.heroY + this.moveDY * speed));

      // 1. 檢查樹木與石柱阻擋 (讓迷宮樹牆真正發揮阻隔作用！)
      if (mapObj.trees) {
        for (let t = 0; t < mapObj.trees.length; t++) {
          const tr = mapObj.trees[t];
          if (Math.hypot(nx - (tr.x + 8), ny - (tr.y + 12)) < 18) {
            nx = s.heroX;
            ny = s.heroY;
            break;
          }
        }
      }

      // 2. 河流與木橋通行判定
      if (mapObj.hasRiver) {
        const rx = mapObj.riverX || 715;
        const by = mapObj.bridgeY || 290;
        const inRiverX = (nx > rx - 14 && nx < rx + 38);
        const onBridgeY = (ny > by - 6 && ny < by + 38);
        if (inRiverX && !onBridgeY) {
          nx = s.heroX;
        }
      }

      // 3. 裂縫牆、巨石與枯木阻擋判定
      if (mapObj.decos) {
        for (let i = 0; i < mapObj.decos.length; i++) {
          const d = mapObj.decos[i];
          const isCleared = s.openedNodes && s.openedNodes[d.id];
          if (!isCleared && (d.isCrackedWall || d.obstacleType)) {
            if (Math.hypot(nx - d.x, ny - d.y) < 22) {
              nx = s.heroX;
              ny = s.heroY;
              if (d.isCrackedWall) {
                window.Aetheria.UI.showToast("裂縫岩壁擋路！請按右下角【炸彈】炸開賞金首密室！");
              } else if (d.obstacleType === "boulder") {
                window.Aetheria.UI.showToast("玄武巨石擋路！升級【Lv.2 秘銀重鎬】後按 A 鍵即可敲碎！");
              } else if (d.obstacleType === "deadtree") {
                window.Aetheria.UI.showToast("巨型枯木擋路！升級【Lv.2 烈焰戰斧】後按 A 鍵即可砍斷！");
              }
            }
          }
        }
      }

      s.petX += (s.heroX - this.moveDX * 18 - s.petX) * 0.18;
      s.petY += (s.heroY - this.moveDY * 16 - s.petY) * 0.18;
      s.heroX = nx;
      s.heroY = ny;

      // 4. 傳送門與守關領主封印檢查
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

    // 極寒雪原與熔岩火山環境危害檢查
    checkEnvironmentalHazard: function(mapObj, s) {
      const hazEl = document.getElementById("hazard-overlay");
      if (!mapObj.hazard) {
        if (hazEl) hazEl.className = "";
        return;
      }

      const immune = window.Aetheria.State.hasHazardImmunity(mapObj.hazard);
      if (immune) {
        if (hazEl) hazEl.className = "";
        return;
      }

      if (hazEl) hazEl.className = mapObj.hazard;

      if (this.isMoving) {
        this.hazardTimer++;
        if (this.hazardTimer >= 150) {
          this.hazardTimer = 0;
          const dmg = (mapObj.hazard === "cold") ? 15 : 22;
          s.hp = Math.max(1, s.hp - dmg);
          window.Aetheria.UI.spawnFloatingText("-" + dmg + (mapObj.hazard === "cold" ? " 凍傷!" : " 灼傷!"), "#ff595e", false);
          window.Aetheria.UI.showToast(mapObj.hazard === "cold"
            ? "暴風雪凍傷！請穿戴【霜狼禦寒毛皮甲】或回營地烹調【暖陽火鍋】！"
            : "熔岩高溫灼傷！請穿戴【黑曜龍鱗神鎧】或回營地烹調【暖陽火鍋】！");
        }
      }
    },

    updateMonstersAI: function(mapObj, s) {
      if (!mapObj || !mapObj.monsters || mapObj.monsters.length === 0) return;
      if (window.Aetheria.Battle && window.Aetheria.Battle.active) return;
      const titleEl = document.getElementById("title-screen");
      if (titleEl && titleEl.style.display !== "none") return;
      const cutEl = document.getElementById("story-cutscene-modal");
      if (cutEl && cutEl.style.display !== "none") return;

      for (let i = 0; i < mapObj.monsters.length; i++) {
        const m = mapObj.monsters[i];
        if (m.alive === false) continue;

        const distToHero = Math.hypot(s.heroX - m.x, s.heroY - m.y);

        if (distToHero < 16) {
          this.stopMove();
          if (m.isShiny) m.forceShiny = true;
          window.Aetheria.Battle.startBattle(m);
          return;
        }

        const aggroRadius = m.isBoss ? 62 : 66;
        if (distToHero < aggroRadius) {
          m.aggro = true;
          const chaseSpeed = m.isBoss ? 0.95 : 1.35;
          const dx = (s.heroX - m.x) / (distToHero || 1);
          const dy = (s.heroY - m.y) / (distToHero || 1);
          let nextMX = m.x + dx * chaseSpeed;
          let nextMY = m.y + dy * chaseSpeed;

          if (mapObj.hasRiver) {
            const rx = mapObj.riverX || 715;
            if (nextMX > rx - 14 && nextMX < rx + 38) nextMX = m.x;
          }

          m.x = Math.max(30, Math.min(mapObj.width - 40, nextMX));
          m.y = Math.max(30, Math.min(mapObj.height - 40, nextMY));
        } else if (!m.isBoss) {
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
          if (distFromHome > 50) {
            m.vx = ((m.homeX || m.x) - m.x) * 0.02;
            m.vy = ((m.homeY || m.y) - m.y) * 0.02;
            nextMX = m.x + m.vx;
            nextMY = m.y + m.vy;
          }

          m.x = Math.max(35, Math.min(mapObj.width - 45, nextMX));
          m.y = Math.max(35, Math.min(mapObj.height - 45, nextMY));
        } else {
          m.aggro = false;
        }
      }
    },

    updateContextHint: function(mapObj, s) {
      const hintEl = document.getElementById("a-btn-hint");
      if (!hintEl) return;

      if (s.currentZone === "camp_hub" && Math.hypot(s.heroX - 272, s.heroY - 195) < 32) {
        hintEl.innerText = "行前料理";
        return;
      }

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
            if (d.isFishingSpot) { hintEl.innerText = "垂釣鮮魚"; return; }
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

    // 觸發跨區傳送門：硬性檢查「守關領主封印鎖 (reqBoss)」！
    triggerPortal: function(portal) {
      const s = window.Aetheria.State.data;

      // 守關領主封印檢查：未擊敗該區守關領主前，彈開主角並顯示警告！
      if (portal.reqBoss && !(s.clearedBosses && s.clearedBosses[portal.reqBoss])) {
        s.heroX -= 24;
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("蝕憶結界封鎖中！必須先擊敗本區守關領主【" + (portal.reqBossName || "區域領主") + "】才可前往下一區！");
        return;
      }

      let newlyUnlocked = false;
      window.Aetheria.Data.Maps.refreshAllResources();

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

      // 首次踏入該區域時，自動播放區域過場劇情對話！
      const cutKey = "enter_" + s.currentZone;
      if (window.Aetheria.Data.STORY_CUTSCENES[cutKey] && !(s.seenCutscenes && s.seenCutscenes[cutKey])) {
        s.seenCutscenes[cutKey] = true;
        window.Aetheria.State.save();
        window.Aetheria.UI.playCutscene(cutKey);
      } else if (newlyUnlocked) {
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

      // 1. 營地燉肉鍋：開啟「行前料理 & 免費回血」選單
      if (s.currentZone === "camp_hub" && Math.hypot(s.heroX - 272, s.heroY - 195) < 32) {
        window.Aetheria.Audio.sfxTalkBlip();
        window.Aetheria.UI.openCookingModal();
        return;
      }

      // 2. 身邊 NPC
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

      // 3. 工具互動機關
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
              window.Aetheria.UI.updateAllHud();
              window.Aetheria.UI.showToast("已點燃古代火盆！聖火永久驅散了洞窟的黑霧！");
              return;
            }
            if (d.obstacleType === "boulder") {
              if ((s.tools.pickaxe || 1) < 2) {
                window.Aetheria.UI.showToast("岩石堅硬！請先到鐵匠鋪升級【Lv.2 秘銀重鎬】！");
                return;
              }
              s.openedNodes[d.id] = true;
              s.inventory.iron += 3;
              window.Aetheria.Audio.sfxBreakShield();
              window.Aetheria.State.save();
              window.Aetheria.UI.showToast("使用秘銀重鎬擊碎擋路巨石，獲得【藍晶鐵礦 +3】！");
              return;
            }
            if (d.obstacleType === "deadtree") {
              if ((s.tools.axe || 1) < 2) {
                window.Aetheria.UI.showToast("枯木粗壯！請先到鐵匠鋪升級【Lv.2 烈焰戰斧】！");
                return;
              }
              s.openedNodes[d.id] = true;
              s.inventory.wood += 4;
              s.inventory.vine += 2;
              window.Aetheria.Audio.sfxBreakShield();
              window.Aetheria.State.save();
              window.Aetheria.UI.showToast("揮動烈焰戰斧劈開巨型枯木，獲得【翠風原木 +4、堅韌藤蔓 +2】！");
              return;
            }
          }
        }
      }

      // 4. 採集資源點
      if (mapObj.nodes) {
        for (let k = 0; k < mapObj.nodes.length; k++) {
          const n = mapObj.nodes[k];
          if (!n.opened && !(s.openedNodes && s.openedNodes[n.id]) && Math.hypot(s.heroX - n.x, s.heroY - n.y) < 30) {
            this.harvestNode(n);
            return;
          }
        }
      }

      window.Aetheria.UI.showToast("請走近 NPC、燉肉鍋、礦脈、老樹樁或寶箱再按 A 鍵！");
    },

    triggerFishing: function(spot) {
      const s = window.Aetheria.State.data;
      spot.isFishingSpot = false;
      spot.sprite = "deco_rock";

      window.Aetheria.Audio.sfxGather();
      const hookLv = s.tools.hook || 1;
      const luckyMult = (s.unlockedRelics && s.unlockedRelics.indexOf("r_charm") !== -1 && Math.random() < 0.5) ? 2 : 1;

      if (hookLv >= 3) {
        s.inventory.fish += 2 * luckyMult;
        s.inventory.coral += 2 * luckyMult;
        s.inventory.tameFruit += 1;
        window.Aetheria.UI.showToast("深海黃金鉤大豐收！獲得【銀鱗鮮魚 +" + (2 * luckyMult) + "、深海珊瑚 +" + (2 * luckyMult) + "、誘餌果 +1】！");
      } else {
        s.inventory.fish += 1 * luckyMult;
        s.inventory.mithril += 1;
        window.Aetheria.UI.showToast("垂釣成功！釣起【銀鱗鮮魚 +" + luckyMult + "、流沙秘銀 +1】！（可回營地鍋爐烹調破盾魚排）");
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
      // 📗 煉金真理聖碑 (科學科) 75點神恩：野外採集產量永久 +1
      const sciBonus  = (s.monolithPts && s.monolithPts.science >= 75) ? 1 : 0;
      const luckyMult = (s.unlockedRelics && s.unlockedRelics.indexOf("r_charm") !== -1 && Math.random() < 0.5) ? 2 : 1;

      if (node.obsidianNode) {
        const amt = (1 + pickBonus + sciBonus) * luckyMult;
        s.inventory.obsidian += amt;
        window.Aetheria.UI.showToast("挖掘成功：獲得【熔岩黑曜石 +" + amt + "】！");
      } else if (node.snowLotus) {
        const amt = (1 + axeBonus + sciBonus) * luckyMult;
        s.inventory.iceLotus += amt;
        s.inventory.fur += 1;
        window.Aetheria.UI.showToast("採集成功：獲得【雪山冰蓮 +" + amt + "、霜狼毛皮 +1】！");
      } else if (node.goldLeafNode) {
        const amt = (1 + axeBonus + sciBonus) * luckyMult;
        s.inventory.goldLeaf += amt;
        window.Aetheria.UI.showToast("採集成功：獲得【世界樹金葉 +" + amt + "】！");
      } else if (node.type === "wood") {
        const amt = (2 + axeBonus + sciBonus) * luckyMult;
        s.inventory.wood += amt;
        s.inventory.vine += 1;
        window.Aetheria.UI.showToast("伐木成功：獲得【翠風原木 +" + amt + "、堅韌藤蔓 +1】！");
      } else if (node.type === "crystal") {
        const amt = (2 + pickBonus + sciBonus) * luckyMult;
        s.inventory.iron += amt;
        window.Aetheria.UI.showToast("挖掘成功：獲得【藍晶鐵礦 +" + amt + "】！");
      } else if (node.type === "mushroom") {
        const amt = (1 + axeBonus + sciBonus) * luckyMult;
        s.inventory.herb += amt;
        s.inventory.wood += 1;
        window.Aetheria.UI.showToast("採集成功：獲得【紅傘微光菇 +" + amt + "、翠風原木 +1】！");
      } else if (node.type === "flower") {
        const amt = (1 + axeBonus + sciBonus) * luckyMult;
        s.inventory.flower += amt;
        s.inventory.vine += 1;
        window.Aetheria.UI.showToast("採集成功：獲得【翠風太陽花 +" + amt + "、堅韌藤蔓 +1】！");
      } else if (node.type === "chest") {
        if (node.legendary) {
          window.Aetheria.Audio.sfxLevelUp();
          if (s.currentZone === "camp_hub" || s.currentZone === "tent_guild" || s.currentZone === "zone1_forest" || s.currentZone === "cave1_mushroom") {
            s.inventory.iron += 5;
            s.inventory.wood += 4;
            s.inventory.vine += 3;
            s.inventory.mithril += 3;
            window.Aetheria.UI.showToast("開啟秘寶箱：藍晶礦 +5、原木 +4、藤蔓 +3、流沙秘銀 +3！");
          } else if (s.currentZone === "zone2_canyon" || s.currentZone === "zone3_coast") {
            s.inventory.mithril += 6;
            s.inventory.coral += 4;
            s.inventory.shell += 4;
            window.Aetheria.UI.showToast("開啟秘寶箱：流沙秘銀 +6、深海珊瑚 +4、洞窟硬甲殼 +4！");
          } else if (s.currentZone === "zone4_snow" || s.currentZone === "zone5_volcano") {
            s.inventory.obsidian += 6;
            s.inventory.iceLotus += 4;
            s.inventory.magmaScale += 4;
            window.Aetheria.UI.showToast("開啟秘寶箱：熔岩黑曜石 +6、雪山冰蓮 +4、熔岩龍鱗 +4！");
          } else {
            s.inventory.starIron += 5;
            s.inventory.goldLeaf += 4;
            s.inventory.tabletShard += 1;
            window.Aetheria.UI.showToast("開啟至高秘寶箱：深淵星隕鐵 +5、世界樹金葉 +4、聖碑殘片 +1！");
          }
        } else {
          s.inventory.iron += 3;
          s.inventory.wood += 2;
          s.inventory.potionHeal += 1;
          window.Aetheria.UI.showToast("開啟寶箱：藍晶鐵礦 +3、翠風原木 +2、生命藥水 +1！");
        }
      } else {
        s.inventory.wood += 3;
        s.inventory.iron += 2;
        s.inventory.vine += 1;
        window.Aetheria.UI.showToast("搜括補給木箱：獲得【翠風原木 +3、藍晶鐵礦 +2、堅韌藤蔓 +1】！");
      }

      window.Aetheria.State.save();
      window.Aetheria.UI.updateAllHud();
    },

    useBomb: function() {
      if (window.Aetheria.Battle && window.Aetheria.Battle.active) return;
      const s = window.Aetheria.State.data;
      if ((s.inventory.bombItem || 0) <= 0) {
        window.Aetheria.UI.showToast("爆破炸彈不足！可在鐵匠鋪煉金或金幣商店購買。");
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
            window.Aetheria.UI.showToast("轟隆！成功炸開裂縫岩壁，隱藏賞金首密室已開啟！");
            return;
          }
        }
      }
      window.Aetheria.UI.showToast("請走近洞窟內的「裂縫岩壁」再使用炸彈！");
    },

    warpToCamp: function() {
      if (window.Aetheria.Battle && window.Aetheria.Battle.active) return;
      const s = window.Aetheria.State.data;
      window.Aetheria.Data.Maps.refreshAllResources();
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
