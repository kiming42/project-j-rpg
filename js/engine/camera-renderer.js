/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 60FPS 相機捲動、Y-Sorting 景深與全地貌渲染引擎 (camera-renderer.js - Full v2.5)
 * 新增：1.海岸/雪原/火山/天界地貌渲染 2.荒野獵人「雙戰寵同時跟隨」
 *       3.大世界野生「✨異色閃光魔物」金色粒子與Sprite 4.洞穴火盆點燃即時解除迷霧
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const Renderer = {
    tick: 0,

    drawTerrain(ctx, mapObj, camX, camY, viewW, viewH) {
      // 1. 根據 6 大地貌主題鋪設基底色
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
      mapObj.dirtBlobs.forEach(b => {
        ctx.beginPath();
        ctx.ellipse(b.cx, b.cy, b.rx + 5, b.ry + 5, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = pal.dirt;
      mapObj.dirtBlobs.forEach(b => {
        ctx.beginPath();
        ctx.ellipse(b.cx, b.cy, b.rx, b.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. 地面細節
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

      // 3. 翡翠河流與像素木橋
      if (mapObj.hasRiver) {
        ctx.fillStyle = "#1d5eb8";
        ctx.fillRect(665, 0, 40, mapObj.height);
        ctx.fillStyle = "#3898ff";
        ctx.fillRect(670, 0, 30, mapObj.height);
        ctx.fillStyle = "#8ce0ff";
        for (let wy = 20; wy < mapObj.height - 20; wy += 42) {
          ctx.fillRect(674 + ((this.tick + wy) % 14), wy, 10, 3);
        }
        ctx.fillStyle = "#1c1619";
        ctx.fillRect(658, 312, 54, 42);
        ctx.fillStyle = "#9c6347";
        ctx.fillRect(660, 314, 50, 38);
        for (let bx = 664; bx < 708; bx += 7) {
          ctx.fillStyle = "#6e4228";
          ctx.fillRect(bx, 314, 2, 38);
        }
        ctx.fillStyle = "#d9a066";
        ctx.fillRect(660, 314, 50, 4);
        ctx.fillRect(660, 348, 50, 4);
      }
    },

    drawPortal(ctx, p) {
      if (p.icon === "cave" || p.icon === "abyss") {
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
      ctx.fillStyle = "rgba(20, 16, 19, 0.85)";
      const tw = ctx.measureText(p.name).width + 8;
      ctx.fillRect(p.x - tw / 2, p.y - 23, tw, 10);
      ctx.fillStyle = "#fbd000";
      ctx.fillText(p.name, p.x, p.y - 15);
    },

    renderWorld() {
      const canvas = document.getElementById("world-canvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;

      const s = window.Aetheria.State.data;
      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
      const Sprites = window.Aetheria.Data.Sprites;
      const ExpSys = window.Aetheria.Explore;

      // 檢查該地圖的火盆是否已點燃 (若點燃則永久關閉黑霧！)
      const brazierLit = s.openedNodes && s.openedNodes[`lit_${mapObj.id}`];
      const fogEl = document.getElementById("fog-overlay");
      if (fogEl) fogEl.style.display = (mapObj.fog && !brazierLit) ? "block" : "none";

      const camX = Math.max(0, Math.min(mapObj.width - canvas.width, Math.round(s.heroX - canvas.width / 2)));
      const camY = Math.max(0, Math.min(mapObj.height - canvas.height, Math.round(s.heroY - canvas.height / 2)));

      ctx.save();
      ctx.translate(-camX, -camY);

      this.drawTerrain(ctx, mapObj, camX, camY, canvas.width, canvas.height);

      if (mapObj.portals) {
        mapObj.portals.forEach(p => this.drawPortal(ctx, p));
      }

      const renderQueue = [];

      // A. 營地裝飾、釣魚點、抓鉤木樁、擋路巨石/枯木、火盆、帆船/飛空艇
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

                // 為可互動工具機關加上提示標籤
                if (d.isFishingSpot || d.isGrapple || d.obstacleType || d.isBrazier) {
                  ctx.font = "bold 7px 'Microsoft JhengHei', monospace";
                  ctx.textAlign = "center";
                  ctx.fillStyle = "#ffffff";
                  const tag = d.isFishingSpot ? "🎣釣魚" : d.isGrapple ? "🪝抓鉤" : d.isBrazier ? (brazierLit ? "🔥已點亮" : "🔥點火盆") : (d.obstacleType === "boulder" ? "🪨需Lv2鎬" : "🌲需Lv2斧");
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

      // D. NPC
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
              ctx.fillStyle = "rgba(20, 16, 19, 0.88)";
              ctx.fillRect(npc.x - 16, npc.y - 11, 50, 10);
              ctx.fillStyle = "#ffd166";
              ctx.fillText(`${npc.badge}${npc.name.split("・")[1] || npc.name}`, npc.x + 9, npc.y - 3);
            }
          });
        });
      }

      // E. 巡邏魔物 (支援大世界直接顯示 ✨異色閃光怪 金色外觀與標籤！)
      if (mapObj.monsters) {
        mapObj.monsters.forEach(m => {
          if (m.alive === false) return;
          renderQueue.push({
            y: m.y + 18,
            draw: () => {
              const bounce = (Math.floor(this.tick / 11) % 2 === 0) ? 0 : -1;
              const sz = m.isBoss ? 26 : 19;
              let spKey = (m.type === "boss") ? "mon_boss" : (m.type === "skull") ? "mon_skull" : "mon_bamboo";
              if (m.isShiny && !m.isBoss) spKey += "_shiny";
              const sp = Sprites.get(spKey) || Sprites.get("mon_bamboo");

              ctx.fillStyle = "#1c1619";
              ctx.fillRect(m.x - 1, m.y - 6, sz + 2, 4);
              ctx.fillStyle = m.isShiny ? "#fbd000" : (m.isBoss ? "#ff9f1c" : "#e03c4b");
              ctx.fillRect(m.x, m.y - 5, sz, 2);

              if (m.isShiny) {
                ctx.font = "bold 7px monospace";
                ctx.fillStyle = "#fbd000";
                ctx.fillText("✨閃光", m.x + 9, m.y - 8);
              }
              if (sp) ctx.drawImage(sp, m.x, m.y + bounce, sz, sz);
            }
          });
        });
      }

      // F. 主戰寵 + 荒野獵人職業專屬「第 2 隻副戰寵同時跟隨」！
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

      // 若為「🏹 荒野獵人」且擁有 2 隻以上戰寵，自動渲染第 2 隻副戰寵於右側跟隨！
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

      // 4. 螢幕級別特效：微雨 / 飄雪 + 左上角紅心列 + 左下角小地圖雷達
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

      const fullHearts = Math.ceil((s.hp / s.maxHp) * 3);
      const heartSp = Sprites.get("heart");
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = (i < fullHearts) ? 1.0 : 0.32;
        if (heartSp) ctx.drawImage(heartSp, 6 + i * 16, 5, 14, 13);
      }
      ctx.globalAlpha = 1.0;

      this.drawMinimap(ctx, mapObj, s);
    },

    drawMinimap(ctx, mapObj, s) {
      const mx = 6, my = 97, mw = 54, mh = 41;
      ctx.fillStyle = "rgba(20, 16, 19, 0.82)";
      ctx.fillRect(mx - 1, my - 1, mw + 2, mh + 2);
      ctx.strokeStyle = "#d9a066";
      ctx.lineWidth = 1;
      ctx.strokeRect(mx - 1, my - 1, mw + 2, mh + 2);

      if (mapObj.hasRiver) {
        ctx.fillStyle = "#3898ff";
        ctx.fillRect(mx + Math.round(670 / mapObj.width * mw), my, 2, mh);
      }

      ctx.fillStyle = "#4cc9f0";
      if (mapObj.portals) {
        mapObj.portals.forEach(p => {
          ctx.fillRect(mx + Math.round(p.x / mapObj.width * mw) - 1, my + Math.round(p.y / mapObj.height * mh) - 1, 3, 3);
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
    },

    renderBattleScene(enemy) {
      const c = document.getElementById("battle-canvas");
      if (!c) return;
      const ctx = c.getContext("2d");
      ctx.imageSmoothingEnabled = false;

      const s = window.Aetheria.State.data;
      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
      const Sprites = window.Aetheria.Data.Sprites;

      this.drawTerrain(ctx, mapObj, 0, 0, c.width, c.height);

      const bounce = (Math.floor(this.tick / 10) % 2 === 0) ? 0 : -2;

      const petData = window.Aetheria.Data.PETS[s.activePet] || window.Aetheria.Data.PETS.pet_slime;
      const isShinyPet = s.shinyPets && s.shinyPets.includes(s.activePet);
      const petSp = Sprites.get(isShinyPet ? petData.shinySpriteKey : petData.spriteKey);
      if (petSp) ctx.drawImage(petSp, 14, 92 + bounce, 28, 28);

      // 荒野獵人戰鬥中同時顯示第 2 隻副戰寵助陣
      if (s.currentJob === "hunter" && s.unlockedPets.length >= 2) {
        const subPetId = s.unlockedPets.find(id => id !== s.activePet) || s.unlockedPets[0];
        const subPetData = window.Aetheria.Data.PETS[subPetId];
        if (subPetData) {
          const subSp = Sprites.get(subPetData.spriteKey);
          if (subSp) ctx.drawImage(subSp, 18, 66 - bounce, 24, 24);
        }
      }

      const heroSp = Sprites.get("hero_right_0");
      if (heroSp) ctx.drawImage(heroSp, 48, 84 + bounce, 34, 34);

      if (enemy) {
        let spKey = enemy.spriteKey || "mon_bamboo";
        if (enemy.isShiny && !enemy.isBoss && Sprites.get(spKey + "_shiny")) {
          spKey += "_shiny";
        }
        const eSp = Sprites.get(spKey);
        if (eSp) {
          ctx.save();
          const ex = enemy.isBoss ? 164 : 174;
          const ey = enemy.isBoss ? 72 : 82;
          const esz = enemy.isBoss ? 48 : 36;
          if (enemy.broken) {
            ctx.translate(ex + esz / 2, ey + esz / 2);
            ctx.rotate(0.25);
            ctx.drawImage(eSp, -esz / 2, -esz / 2, esz, esz);
          } else {
            ctx.drawImage(eSp, ex, ey + bounce, esz, esz);
          }
          ctx.restore();
        }
      }
    }
  };

  window.Aetheria.Renderer = Renderer;
})();
