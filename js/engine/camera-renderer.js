/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 60FPS 大世界相機渲染與座標自動修復引擎 (camera-renderer.js - v3.2)
 * 修復：自動檢測舊存檔無效地圖 ID 或越界座標，強制拉回安全座標，徹底解決上半屏只見純綠底問題！
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const Renderer = {
    tick: 0,

    drawTerrain(ctx, mapObj, camX, camY, viewW, viewH) {
      const themeColors = {
        forest:  { bg: "#a8ba59", edge: "#7a9c46", dirt: "#c88662" },
        canyon:  { bg: "#e09953", edge: "#c77432", dirt: "#f4be78" },
        cave:    { bg: "#241d30", edge: "#181221", dirt: "#3a2e4d" },
        coast:   { bg: "#1d5eb8", edge: "#3898ff", dirt: "#f6d799" },
        snow:    { bg: "#dceefb", edge: "#a8dadc", dirt: "#ffffff" },
        volcano: { bg: "#3b1719", edge: "#e0533c", dirt: "#592528" },
        sky:     { bg: "#4cc9f0", edge: "#ffd166", dirt: "#fff3b0" }
      };
      const pal = themeColors[mapObj.theme] || themeColors.forest;

      ctx.fillStyle = pal.bg;
      ctx.fillRect(camX, camY, viewW, viewH);

      ctx.fillStyle = pal.edge;
      (mapObj.dirtBlobs || []).forEach(b => {
        ctx.beginPath();
        ctx.ellipse(b.cx, b.cy, b.rx + 5, b.ry + 5, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = pal.dirt;
      (mapObj.dirtBlobs || []).forEach(b => {
        ctx.beginPath();
        ctx.ellipse(b.cx, b.cy, b.rx, b.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      if (mapObj.groundDetails) {
        mapObj.groundDetails.forEach(g => {
          if (g.x < camX - 16 || g.x > camX + viewW + 16 || g.y < camY - 16 || g.y > camY + viewH + 16) return;
          if (g.kind === "pebble") {
            ctx.fillStyle = (mapObj.theme === "volcano") ? "#ff9f1c" : (mapObj.theme === "snow") ? "#8ce0ff" : "#d89672";
            ctx.fillRect(g.x, g.y, 5, 3);
          } else if (g.kind === "tuft" && mapObj.theme === "forest") {
            ctx.fillStyle = "#4b8b3b";
            ctx.fillRect(g.x, g.y, 6, 3);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(g.x + 2, g.y - 2, 2, 2);
          }
        });
      }

      if (mapObj.hasRiver) {
        const rx = mapObj.riverX || 555;
        const by = mapObj.bridgeY || 250;

        ctx.fillStyle = "#1d5eb8";
        ctx.fillRect(rx, 0, 40, mapObj.height);
        ctx.fillStyle = "#3898ff";
        ctx.fillRect(rx + 5, 0, 30, mapObj.height);

        ctx.fillStyle = "#8ce0ff";
        for (let wy = 20; wy < mapObj.height - 20; wy += 42) {
          ctx.fillRect(rx + 9 + ((this.tick + wy) % 14), wy, 10, 3);
        }

        ctx.fillStyle = "#1c1619";
        ctx.fillRect(rx - 7, by, 54, 42);
        ctx.fillStyle = "#9c6347";
        ctx.fillRect(rx - 5, by + 2, 50, 38);
        for (let bx = rx - 1; bx < rx + 43; bx += 7) {
          ctx.fillStyle = "#6e4228";
          ctx.fillRect(bx, by + 2, 2, 38);
        }
        ctx.fillStyle = "#d9a066";
        ctx.fillRect(rx - 5, by + 2, 50, 4);
        ctx.fillRect(rx - 5, by + 36, 50, 4);
      }
    },

    drawPortal(ctx, p) {
      if (p.icon === "door") {
        ctx.fillStyle = "#1c1619";
        ctx.fillRect(p.x - 10, p.y - 5, 20, 10);
        ctx.fillStyle = "#e0533c";
        ctx.fillRect(p.x - 8, p.y - 3, 16, 6);
        ctx.fillStyle = "#fbd000";
        ctx.fillRect(p.x - 4, p.y - 2, 8, 4);
      } else if (p.icon === "cave" || p.icon === "abyss") {
        ctx.fillStyle = "#1c1619";
        ctx.fillRect(p.x - 14, p.y - 12, 28, 24);
        ctx.fillStyle = (p.icon === "abyss") ? "#5a189a" : "#4a4e69";
        ctx.fillRect(p.x - 12, p.y - 10, 24, 20);
        ctx.fillStyle = "#09070a";
        ctx.fillRect(p.x - 8, p.y - 4, 16, 14);
      } else {
        ctx.fillStyle = "#1c1619";
        ctx.fillRect(p.x - 13, p.y - 10, 26, 20);
        ctx.fillStyle = "#f5e6c4";
        ctx.fillRect(p.x - 11, p.y - 8, 22, 16);
        for (let sy = -5; sy < 7; sy += 4) {
          ctx.fillStyle = "#c77432";
          ctx.fillRect(p.x - 11, p.y + sy, 22, 2);
        }
      }

      ctx.font = "bold 8px 'Microsoft JhengHei', monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(20, 16, 19, 0.88)";
      const tw = ctx.measureText(p.name).width + 8;
      const labelY = (p.icon === "door") ? (p.y + 14) : (p.y - 15);
      ctx.fillRect(p.x - tw / 2, labelY - 8, tw, 10);
      ctx.fillStyle = "#fbd000";
      ctx.fillText(p.name, p.x, labelY);
    },

    renderWorld() {
      try {
        const canvas = document.getElementById("world-canvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        const s = window.Aetheria.State.data;
        let mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);

        // 安全校正：若舊存檔殘留舊版區域 ID 或主角座標超出當前地圖邊界，自動校正回營地中央！
        if (!mapObj || isNaN(s.heroX) || isNaN(s.heroY) || s.heroX < 10 || s.heroX > mapObj.width - 10 || s.heroY < 10 || s.heroY > mapObj.height - 10) {
          s.currentZone = "camp_hub";
          mapObj = window.Aetheria.Data.Maps.getMap("camp_hub");
          s.heroX = 250;
          s.heroY = 220;
          s.petX = 228;
          s.petY = 224;
        }

        const Sprites = window.Aetheria.Data.Sprites;
        const ExpSys = window.Aetheria.Explore;

        const brazierLit = s.openedNodes && s.openedNodes[`lit_${mapObj.id}`];
        const fogEl = document.getElementById("fog-overlay");
        if (fogEl) fogEl.style.display = (mapObj.fog && !brazierLit) ? "block" : "none";

        const camX = Math.max(0, Math.min(mapObj.width - canvas.width, Math.round(s.heroX - canvas.width / 2)));
        const camY = Math.max(0, Math.min(mapObj.height - canvas.height, Math.round(s.heroY - canvas.height / 2)));

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(-camX, -camY);

        this.drawTerrain(ctx, mapObj, camX, camY, canvas.width, canvas.height);

        if (mapObj.portals) {
          mapObj.portals.forEach(p => this.drawPortal(ctx, p));
        }

        const renderQueue = [];

        // A. 裝飾物與工具機關
        if (mapObj.decos) {
          mapObj.decos.forEach(d => {
            if ((d.isCrackedWall || d.obstacleType) && s.openedNodes && s.openedNodes[d.id]) return;

            renderQueue.push({
              y: d.y + (d.h || 18),
              draw: () => {
                if (d.sprite === "campfire") {
                  ctx.fillStyle = "#1c1619"; ctx.fillRect(d.x, d.y + 10, 16, 6);
                  ctx.fillStyle = "#9c4124"; ctx.fillRect(d.x + 2, d.y + 11, 12, 4);
                  const fh = (Math.floor(this.tick / 8) % 2 === 0) ? 8 : 11;
                  ctx.fillStyle = "#ff6b35"; ctx.fillRect(d.x + 3, d.y + 12 - fh, 10, fh);
                  ctx.fillStyle = "#fbd000"; ctx.fillRect(d.x + 5, d.y + 13 - fh, 6, fh - 2);
                } else {
                  let spName = d.sprite;
                  if (d.isBrazier && brazierLit) spName = "brazier_on";
                  const sp = Sprites.get(spName);
                  if (sp) ctx.drawImage(sp, d.x, d.y, d.w || sp.width, d.h || sp.height);

                  if (d.isFishingSpot || d.isGrapple || d.obstacleType || d.isBrazier) {
                    ctx.font = "bold 7px 'Microsoft JhengHei', monospace";
                    ctx.textAlign = "center";
                    ctx.fillStyle = "#ffffff";
                    const tag = d.isFishingSpot ? "[釣魚]" : d.isGrapple ? "[抓鉤]" : d.isBrazier ? (brazierLit ? "[已點亮]" : "[點火盆]") : (d.obstacleType === "boulder" ? "[需Lv2鎬]" : "[需Lv2斧]");
                    ctx.fillText(tag, d.x + (d.w || 18) / 2, d.y - 2);
                  }
                }
              }
            });
          });
        }

        // B. 樹木與高台柱
        if (mapObj.trees) {
          mapObj.trees.forEach(t => {
            if (t.x + 42 < camX || t.x - 12 > camX + canvas.width || t.y + 46 < camY || t.y - 12 > camY + canvas.height) return;
            renderQueue.push({
              y: t.y + 32,
              draw: () => {
                if (mapObj.theme === "forest") ctx.drawImage(Sprites.get("tree"), t.x, t.y, 34, 36);
                else ctx.drawImage(Sprites.get("pillar"), t.x, t.y, 32, 42);
              }
            });
          });
        }

        // C. 採集資源點
        if (mapObj.nodes) {
          mapObj.nodes.forEach(n => {
            if (n.opened || (s.openedNodes && s.openedNodes[n.id])) return;
            renderQueue.push({
              y: n.y + 16,
              draw: () => {
                const floatY = (Math.floor((this.tick + n.x) / 14) % 2 === 0) ? 0 : -1;
                let spKey = "crate";
                if (n.type === "crystal")  spKey = "mat_crystal";
                if (n.type === "mushroom") spKey = "mat_mushroom";
                if (n.type === "flower")   spKey = "mat_flower";
                if (n.type === "chest")    spKey = "chest";

                const sp = Sprites.get(spKey);
                if (sp) ctx.drawImage(sp, n.x, n.y + floatY, 18, 18);

                if ((this.tick + n.x) % 22 < 11) {
                  ctx.fillStyle = n.perfect ? "#fbd000" : "#ffffff";
                  ctx.fillRect(n.x + 14, n.y - 2, 3, 1);
                  ctx.fillRect(n.x + 15, n.y - 3, 1, 3);
                }
              }
            });
          });
        }

        // D. 營地與室內 4 大核心 NPC
        if (mapObj.npcs) {
          mapObj.npcs.forEach(npc => {
            renderQueue.push({
              y: npc.y + 18,
              draw: () => {
                const bounce = (Math.floor(this.tick / 16) % 2 === 0) ? 0 : -1;
                const sp = Sprites.get(npc.sprite);
                if (sp) ctx.drawImage(sp, npc.x, npc.y + bounce, 19, 19);

                ctx.font = "bold 8px 'Microsoft JhengHei', monospace";
                ctx.textAlign = "center";
                const labelTxt = `${npc.badge || ""}${npc.name.split("・")[1] || npc.name}`;
                const tw = ctx.measureText(labelTxt).width + 6;
                ctx.fillStyle = "rgba(20, 16, 19, 0.9)";
                ctx.fillRect(npc.x + 9 - tw / 2, npc.y - 11, tw, 10);
                ctx.fillStyle = "#ffd166";
                ctx.fillText(labelTxt, npc.x + 9, npc.y - 3);
              }
            });
          });
        }

        // E. 巡邏與追擊魔物 (含追擊時頭頂紅底 [!] 驚嘆號標記)
        if (mapObj.monsters) {
          mapObj.monsters.forEach(m => {
            if (m.alive === false) return;
            renderQueue.push({
              y: m.y + 18,
              draw: () => {
                const stepSpd = m.aggro ? 4 : 9;
                const bounce = (Math.floor(this.tick / stepSpd) % 2 === 0) ? 0 : -2;
                const sz = m.isBoss ? 26 : 19;
                let spKey = (m.type === "boss") ? "mon_boss" : (m.type === "skull") ? "mon_skull" : "mon_bamboo";
                if (m.isShiny && !m.isBoss) spKey += "_shiny";
                const sp = Sprites.get(spKey) || Sprites.get("mon_bamboo");

                ctx.fillStyle = "#1c1619";
                ctx.fillRect(Math.round(m.x) - 1, Math.round(m.y) - 6, sz + 2, 4);
                ctx.fillStyle = m.isShiny ? "#fbd000" : (m.isBoss ? "#ff9f1c" : "#e03c4b");
                ctx.fillRect(Math.round(m.x), Math.round(m.y) - 5, sz, 2);

                if (m.aggro) {
                  ctx.fillStyle = "#e03c4b";
                  ctx.fillRect(Math.round(m.x) + Math.floor(sz / 2) - 5, Math.round(m.y) - 16, 10, 9);
                  ctx.strokeStyle = "#1c1619";
                  ctx.lineWidth = 1;
                  ctx.strokeRect(Math.round(m.x) + Math.floor(sz / 2) - 5, Math.round(m.y) - 16, 10, 9);
                  ctx.fillStyle = "#ffffff";
                  ctx.font = "bold 8px monospace";
                  ctx.textAlign = "center";
                  ctx.fillText("!", Math.round(m.x) + Math.floor(sz / 2), Math.round(m.y) - 9);
                } else if (m.isShiny) {
                  ctx.font = "bold 7px 'Microsoft JhengHei', monospace";
                  ctx.textAlign = "center";
                  ctx.fillStyle = "#fbd000";
                  ctx.fillText("[閃光]", Math.round(m.x) + Math.floor(sz / 2), Math.round(m.y) - 8);
                }

                if (sp) ctx.drawImage(sp, Math.round(m.x), Math.round(m.y + bounce), sz, sz);
              }
            });
          });
        }

        // F. 同行戰寵
        const isMov = ExpSys && ExpSys.isMoving;
        const petBounce = isMov ? (Math.floor(this.tick / 4) % 2 * -2) : (Math.floor(this.tick / 14) % 2 * -1);
        const petData = window.Aetheria.Data.PETS[s.activePet] || window.Aetheria.Data.PETS.pet_slime;
        const isShinyPet = s.shinyPets && s.shinyPets.includes(s.activePet);
        const petSp = Sprites.get(isShinyPet ? petData.shinySpriteKey : petData.spriteKey);

        renderQueue.push({
          y: s.petY + 16,
          draw: () => {
            if (petSp) ctx.drawImage(petSp, Math.round(s.petX), Math.round(s.petY + petBounce), 18, 18);
          }
        });

        if (s.currentJob === "hunter" && s.unlockedPets.length >= 2) {
          const subPetId = s.unlockedPets.find(id => id !== s.activePet) || s.unlockedPets[0];
          const subPetData = window.Aetheria.Data.PETS[subPetId];
          if (subPetData) {
            const subShiny = s.shinyPets && s.shinyPets.includes(subPetId);
            const subSp = Sprites.get(subShiny ? subPetData.shinySpriteKey : subPetData.spriteKey);
            renderQueue.push({
              y: s.petY + 15,
              draw: () => {
                if (subSp) ctx.drawImage(subSp, Math.round(s.heroX + 16), Math.round(s.petY - petBounce), 16, 16);
              }
            });
          }
        }

        // G. 主角 4 方向雙幀行走
        renderQueue.push({
          y: s.heroY + 18,
          draw: () => {
            const stepFrame = isMov ? (Math.floor(this.tick / 6) % 2) : 0;
            const bounce = isMov ? (stepFrame * -1) : 0;
            const dir = s.facing || "down";
            const heroSp = Sprites.get(`hero_${dir}_${stepFrame}`) || Sprites.get("hero_down_0");
            if (heroSp) ctx.drawImage(heroSp, Math.round(s.heroX), Math.round(s.heroY + bounce), 19, 19);
          }
        });

        renderQueue.sort((a, b) => a.y - b.y);
        renderQueue.forEach(item => item.draw());

        ctx.restore();

        if (mapObj.rain) {
          ctx.strokeStyle = (mapObj.theme === "snow") ? "#ffffff" : "rgba(255, 255, 255, 0.72)";
          ctx.lineWidth = (mapObj.theme === "snow") ? 2 : 1;
          for (let i = 0; i < 14; i++) {
            const rx = ((i * 41 + this.tick * 2) % 240) + 8;
            const ry = ((i * 29 + this.tick * 3) % 130) + 6;
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx - 3, ry + (mapObj.theme === "snow" ? 3 : 8));
            ctx.stroke();
          }
        }

        // 左上角繪製 3 顆像素紅心
        const fullHearts = Math.ceil((s.hp / s.maxHp) * 3);
        const heartSp = Sprites.get("heart");
        for (let i = 0; i < 3; i++) {
          ctx.globalAlpha = (i < fullHearts) ? 1.0 : 0.32;
          if (heartSp) ctx.drawImage(heartSp, 6 + i * 16, 6, 14, 13);
        }
        ctx.globalAlpha = 1.0;

        this.drawMinimap(ctx, mapObj, s);
      } catch (err) {
        console.error("renderWorld error:", err);
      }
    },

    drawMinimap(ctx, mapObj, s) {
      const mx = 6, my = 97, mw = 54, mh = 41;
      ctx.fillStyle = "rgba(20, 16, 19, 0.84)";
      ctx.fillRect(mx - 1, my - 1, mw + 2, mh + 2);
      ctx.strokeStyle = "#d9a066";
      ctx.lineWidth = 1;
      ctx.strokeRect(mx - 1, my - 1, mw + 2, mh + 2);

      if (mapObj.hasRiver) {
        const rx = mapObj.riverX || 555;
        ctx.fillStyle = "#3898ff";
        ctx.fillRect(mx + Math.round(rx / mapObj.width * mw), my, 2, mh);
      }

      ctx.fillStyle = "#4cc9f0";
      if (mapObj.portals) {
        mapObj.portals.forEach(p => {
          ctx.fillRect(mx + Math.round(p.x / mapObj.width * mw) - 1, my + Math.round(p.y / mapObj.height * mh) - 1, 3, 3);
        });
      }

      ctx.fillStyle = "#5ac54f";
      if (mapObj.npcs) {
        mapObj.npcs.forEach(n => {
          ctx.fillRect(mx + Math.round(n.x / mapObj.width * mw) - 1, my + Math.round(n.y / mapObj.height * mh) - 1, 3, 3);
        });
      }

      ctx.fillStyle = "#f5b700";
      if (mapObj.nodes) {
        mapObj.nodes.forEach(n => {
          if (!n.opened && !(s.openedNodes && s.openedNodes[n.id])) {
            ctx.fillRect(mx + Math.round(n.x / mapObj.width * mw), my + Math.round(n.y / mapObj.height * mh), 2, 2);
          }
        });
      }

      ctx.fillStyle = "#ff595e";
      if (mapObj.monsters) {
        mapObj.monsters.forEach(m => {
          if (m.alive !== false) {
            ctx.fillRect(mx + Math.round(m.x / mapObj.width * mw), my + Math.round(m.y / mapObj.height * mh), 2, 2);
          }
        });
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(mx + Math.round(s.heroX / mapObj.width * mw) - 1, my + Math.round(s.heroY / mapObj.height * mh) - 1, 3, 3);
    }
  };

  window.Aetheria.Renderer = Renderer;
})();
