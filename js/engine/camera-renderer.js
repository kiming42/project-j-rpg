/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 3倍高清文字與銳利像素渲染引擎 (camera-renderer.js - v3.4)
 * 修復：將畫布內部解析度提升至 768x432 (3x Super-Sampling)，像素貼圖保持銳利點陣，
 *       同時讓地圖上的 NPC 名稱與傳送門文字以原生 24px 高清黑邊字體繪製，徹底解決文字模糊！
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const VIEW_W = 256;
  const VIEW_H = 144;
  const HI_SCALE = 3; // 3倍高清內解析度 (768x432)

  // 高清黑邊清晰標籤繪製器
  function drawCrispLabel(ctx, text, centerX, bottomY, textColor, bgAlpha) {
    ctx.save();
    ctx.font = "900 7.5px 'Microsoft JhengHei', 'PingFang HK', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const tw = Math.ceil(ctx.measureText(text).width) + 8;
    const th = 11;
    const rx = Math.round(centerX - tw / 2);
    const ry = Math.round(bottomY - th);

    ctx.fillStyle = bgAlpha || "rgba(18, 14, 18, 0.88)";
    ctx.fillRect(rx, ry, tw, th);
    ctx.strokeStyle = "#d9a066";
    ctx.lineWidth = 0.75;
    ctx.strokeRect(rx, ry, tw, th);

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.6;
    ctx.strokeText(text, centerX, ry + th / 2 + 0.5);

    ctx.fillStyle = textColor || "#ffd166";
    ctx.fillText(text, centerX, ry + th / 2 + 0.5);
    ctx.restore();
  }

  const Renderer = {
    tick: 0,

    drawTerrain: function(ctx, mapObj, camX, camY, viewW, viewH) {
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
      (mapObj.dirtBlobs || []).forEach(function(b) {
        ctx.beginPath();
        ctx.ellipse(b.cx, b.cy, b.rx + 5, b.ry + 5, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = pal.dirt;
      (mapObj.dirtBlobs || []).forEach(function(b) {
        ctx.beginPath();
        ctx.ellipse(b.cx, b.cy, b.rx, b.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      if (mapObj.groundDetails) {
        mapObj.groundDetails.forEach(function(g) {
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

    drawPortal: function(ctx, p) {
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

      const labelY = (p.icon === "door") ? (p.y + 17) : (p.y - 12);
      drawCrispLabel(ctx, p.name, p.x, labelY, "#fbd000");
    },

    renderWorld: function() {
      try {
        const canvas = document.getElementById("world-canvas");
        if (!canvas) return;

        // 自動升級為 768x432 高清緩衝區，令地圖文字清晰銳利
        if (canvas.width !== VIEW_W * HI_SCALE || canvas.height !== VIEW_H * HI_SCALE) {
          canvas.width = VIEW_W * HI_SCALE;
          canvas.height = VIEW_H * HI_SCALE;
        }

        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        const s = window.Aetheria.State.data;
        let mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);

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

        const brazierLit = s.openedNodes && s.openedNodes["lit_" + mapObj.id];
        const fogEl = document.getElementById("fog-overlay");
        if (fogEl) fogEl.style.display = (mapObj.fog && !brazierLit) ? "block" : "none";

        const camX = Math.max(0, Math.min(mapObj.width - VIEW_W, Math.round(s.heroX - VIEW_W / 2)));
        const camY = Math.max(0, Math.min(mapObj.height - VIEW_H, Math.round(s.heroY - VIEW_H / 2)));

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.scale(HI_SCALE, HI_SCALE);

        ctx.save();
        ctx.translate(-camX, -camY);

        this.drawTerrain(ctx, mapObj, camX, camY, VIEW_W, VIEW_H);

        if (mapObj.portals) {
          const self = this;
          mapObj.portals.forEach(function(p) { self.drawPortal(ctx, p); });
        }

        const renderQueue = [];
        const self = this;

        // A. 裝飾物與工具機關
        if (mapObj.decos) {
          mapObj.decos.forEach(function(d) {
            if ((d.isCrackedWall || d.obstacleType) && s.openedNodes && s.openedNodes[d.id]) return;

            renderQueue.push({
              y: d.y + (d.h || 18),
              draw: function() {
                if (d.sprite === "campfire") {
                  ctx.fillStyle = "#1c1619"; ctx.fillRect(d.x, d.y + 10, 16, 6);
                  ctx.fillStyle = "#9c4124"; ctx.fillRect(d.x + 2, d.y + 11, 12, 4);
                  const fh = (Math.floor(self.tick / 8) % 2 === 0) ? 8 : 11;
                  ctx.fillStyle = "#ff6b35"; ctx.fillRect(d.x + 3, d.y + 12 - fh, 10, fh);
                  ctx.fillStyle = "#fbd000"; ctx.fillRect(d.x + 5, d.y + 13 - fh, 6, fh - 2);
                } else {
                  let spName = d.sprite;
                  if (d.isBrazier && brazierLit) spName = "brazier_on";
                  const sp = Sprites.get(spName);
                  if (sp) ctx.drawImage(sp, d.x, d.y, d.w || sp.width, d.h || sp.height);

                  if (d.isFishingSpot || d.isGrapple || d.obstacleType || d.isBrazier) {
                    const tag = d.isFishingSpot ? "釣魚點" : d.isGrapple ? "抓鉤樁" : d.isBrazier ? (brazierLit ? "已點亮" : "點火盆") : (d.obstacleType === "boulder" ? "需Lv2鎬" : "需Lv2斧");
                    drawCrispLabel(ctx, tag, d.x + (d.w || 18) / 2, d.y - 1, "#ffffff");
                  }
                }
              }
            });
          });
        }

        // B. 樹木與高台柱
        if (mapObj.trees) {
          mapObj.trees.forEach(function(t) {
            if (t.x + 42 < camX || t.x - 12 > camX + VIEW_W || t.y + 46 < camY || t.y - 12 > camY + VIEW_H) return;
            renderQueue.push({
              y: t.y + 32,
              draw: function() {
                if (mapObj.theme === "forest") ctx.drawImage(Sprites.get("tree"), t.x, t.y, 34, 36);
                else ctx.drawImage(Sprites.get("pillar"), t.x, t.y, 32, 42);
              }
            });
          });
        }

        // C. 採集資源點
        if (mapObj.nodes) {
          mapObj.nodes.forEach(function(n) {
            if (n.opened || (s.openedNodes && s.openedNodes[n.id])) return;
            renderQueue.push({
              y: n.y + 16,
              draw: function() {
                const floatY = (Math.floor((self.tick + n.x) / 14) % 2 === 0) ? 0 : -1;
                let spKey = "crate";
                if (n.type === "crystal")  spKey = "mat_crystal";
                if (n.type === "mushroom") spKey = "mat_mushroom";
                if (n.type === "flower")   spKey = "mat_flower";
                if (n.type === "chest")    spKey = "chest";

                const sp = Sprites.get(spKey);
                if (sp) ctx.drawImage(sp, n.x, n.y + floatY, 18, 18);

                if ((self.tick + n.x) % 22 < 11) {
                  ctx.fillStyle = n.perfect ? "#fbd000" : "#ffffff";
                  ctx.fillRect(n.x + 14, n.y - 2, 3, 1);
                  ctx.fillRect(n.x + 15, n.y - 3, 1, 3);
                }
              }
            });
          });
        }

        // D. 營地與室內 4 大核心 NPC (使用 3x 高清黑邊標籤)
        if (mapObj.npcs) {
          mapObj.npcs.forEach(function(npc) {
            renderQueue.push({
              y: npc.y + 18,
              draw: function() {
                const bounce = (Math.floor(self.tick / 16) % 2 === 0) ? 0 : -1;
                const sp = Sprites.get(npc.sprite);
                if (sp) ctx.drawImage(sp, npc.x, npc.y + bounce, 19, 19);

                const shortName = (npc.badge || "") + (npc.name.split("・")[1] || npc.name);
                drawCrispLabel(ctx, shortName, npc.x + 9.5, npc.y - 1, "#ffd166");
              }
            });
          });
        }

        // E. 巡邏與追擊魔物
        if (mapObj.monsters) {
          mapObj.monsters.forEach(function(m) {
            if (m.alive === false) return;
            renderQueue.push({
              y: m.y + 18,
              draw: function() {
                const stepSpd = m.aggro ? 4 : 9;
                const bounce = (Math.floor(self.tick / stepSpd) % 2 === 0) ? 0 : -2;
                const sz = m.isBoss ? 26 : 19;
                let spKey = (m.type === "boss") ? "mon_boss" : (m.type === "skull") ? "mon_skull" : "mon_bamboo";
                if (m.isShiny && !m.isBoss) spKey += "_shiny";
                const sp = Sprites.get(spKey) || Sprites.get("mon_bamboo");

                ctx.fillStyle = "#1c1619";
                ctx.fillRect(Math.round(m.x) - 1, Math.round(m.y) - 6, sz + 2, 4);
                ctx.fillStyle = m.isShiny ? "#fbd000" : (m.isBoss ? "#ff9f1c" : "#e03c4b");
                ctx.fillRect(Math.round(m.x), Math.round(m.y) - 5, sz, 2);

                if (m.aggro) {
                  drawCrispLabel(ctx, "!", Math.round(m.x) + sz / 2, Math.round(m.y) - 7, "#ffffff", "rgba(224, 60, 75, 0.95)");
                } else if (m.isShiny) {
                  drawCrispLabel(ctx, "閃光", Math.round(m.x) + sz / 2, Math.round(m.y) - 7, "#fbd000");
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
        const isShinyPet = s.shinyPets && s.shinyPets.indexOf(s.activePet) !== -1;
        const petSp = Sprites.get(isShinyPet ? petData.shinySpriteKey : petData.spriteKey);

        renderQueue.push({
          y: s.petY + 16,
          draw: function() {
            if (petSp) ctx.drawImage(petSp, Math.round(s.petX), Math.round(s.petY + petBounce), 18, 18);
          }
        });

        if (s.currentJob === "hunter" && s.unlockedPets.length >= 2) {
          const subPetId = s.unlockedPets.find(function(id) { return id !== s.activePet; }) || s.unlockedPets[0];
          const subPetData = window.Aetheria.Data.PETS[subPetId];
          if (subPetData) {
            const subShiny = s.shinyPets && s.shinyPets.indexOf(subPetId) !== -1;
            const subSp = Sprites.get(subShiny ? subPetData.shinySpriteKey : subPetData.spriteKey);
            renderQueue.push({
              y: s.petY + 15,
              draw: function() {
                if (subSp) ctx.drawImage(subSp, Math.round(s.heroX + 16), Math.round(s.petY - petBounce), 16, 16);
              }
            });
          }
        }

        // G. 主角
        renderQueue.push({
          y: s.heroY + 18,
          draw: function() {
            const stepFrame = isMov ? (Math.floor(self.tick / 6) % 2) : 0;
            const bounce = isMov ? (stepFrame * -1) : 0;
            const dir = s.facing || "down";
            const heroSp = Sprites.get("hero_" + dir + "_" + stepFrame) || Sprites.get("hero_down_0");
            if (heroSp) ctx.drawImage(heroSp, Math.round(s.heroX), Math.round(s.heroY + bounce), 19, 19);
          }
        });

        renderQueue.sort(function(a, b) { return a.y - b.y; });
        renderQueue.forEach(function(item) { item.draw(); });

        ctx.restore(); // 結束相機位移

        // 螢幕特效：微雨 / 飄雪
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

        // 左上角 3 顆像素紅心
        const fullHearts = Math.ceil((s.hp / s.maxHp) * 3);
        const heartSp = Sprites.get("heart");
        for (let i = 0; i < 3; i++) {
          ctx.globalAlpha = (i < fullHearts) ? 1.0 : 0.32;
          if (heartSp) ctx.drawImage(heartSp, 6 + i * 16, 6, 14, 13);
        }
        ctx.globalAlpha = 1.0;

        this.drawMinimap(ctx, mapObj, s);

        ctx.restore(); // 結束 3x 高清縮放
      } catch (err) {
        console.error("renderWorld error:", err);
      }
    },

    drawMinimap: function(ctx, mapObj, s) {
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
        mapObj.portals.forEach(function(p) {
          ctx.fillRect(mx + Math.round(p.x / mapObj.width * mw) - 1, my + Math.round(p.y / mapObj.height * mh) - 1, 3, 3);
        });
      }

      ctx.fillStyle = "#5ac54f";
      if (mapObj.npcs) {
        mapObj.npcs.forEach(function(n) {
          ctx.fillRect(mx + Math.round(n.x / mapObj.width * mw) - 1, my + Math.round(n.y / mapObj.height * mh) - 1, 3, 3);
        });
      }

      ctx.fillStyle = "#f5b700";
      if (mapObj.nodes) {
        mapObj.nodes.forEach(function(n) {
          if (!n.opened && !(s.openedNodes && s.openedNodes[n.id])) {
            ctx.fillRect(mx + Math.round(n.x / mapObj.width * mw), my + Math.round(n.y / mapObj.height * mh), 2, 2);
          }
        });
      }

      ctx.fillStyle = "#ff595e";
      if (mapObj.monsters) {
        mapObj.monsters.forEach(function(m) {
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
