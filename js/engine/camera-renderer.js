/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 60FPS 相機捲動、Y-Sorting 景深與戰鬥畫面渲染引擎 (camera-renderer.js)
 * 包含：自然有機地形、地面鵝卵石與草簇、豐富營地裝飾、NPC/傳送門標籤、主角4方向雙幀行走、小地圖雷達
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const Renderer = {
    tick: 0,

    // 繪製自然有機地形 (蜿蜒泥路 + 地面鵝卵石/草簇 + 東方翡翠河流與木橋)
    drawTerrain(ctx, mapObj, camX, camY, viewW, viewH) {
      // 1. 鋪設區域基底色
      if (mapObj.theme === "forest") ctx.fillStyle = "#a8ba59";
      else if (mapObj.theme === "canyon") ctx.fillStyle = "#e09953";
      else ctx.fillStyle = "#241d30";
      ctx.fillRect(camX, camY, viewW, viewH);

      // 2. 繪製有機草地外緣與蜿蜒泥路
      const edgeCol = (mapObj.theme === "forest") ? "#7a9c46" : (mapObj.theme === "canyon") ? "#c77432" : "#181221";
      const dirtCol = (mapObj.theme === "forest") ? "#c88662" : (mapObj.theme === "canyon") ? "#f4be78" : "#3a2e4d";

      ctx.fillStyle = edgeCol;
      mapObj.dirtBlobs.forEach(b => {
        ctx.beginPath();
        ctx.ellipse(b.cx, b.cy, b.rx + 4, b.ry + 4, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = dirtCol;
      mapObj.dirtBlobs.forEach(b => {
        ctx.beginPath();
        ctx.ellipse(b.cx, b.cy, b.rx, b.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. 繪製地面自然細節 (鵝卵石、深色泥斑、三葉小草簇、雨水漣漪 — 消滅空曠感且不擋路)
      if (mapObj.groundDetails) {
        mapObj.groundDetails.forEach(g => {
          if (g.x < camX - 16 || g.x > camX + viewW + 16 || g.y < camY - 16 || g.y > camY + viewH + 16) return;
          if (g.kind === "pebble") {
            ctx.fillStyle = (mapObj.theme === "cave") ? "#5a4e6e" : "#d89672";
            ctx.fillRect(g.x, g.y, 5, 3);
            ctx.fillStyle = "#1c1619";
            ctx.fillRect(g.x + 1, g.y + 3, 4, 1);
          } else if (g.kind === "tuft" && mapObj.theme === "forest") {
            // 像素三葉小草簇與小白野花
            ctx.fillStyle = "#4b8b3b";
            ctx.fillRect(g.x, g.y, 6, 3);
            ctx.fillRect(g.x + 1, g.y - 2, 4, 2);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(g.x + 2, g.y - 3, 2, 2);
          } else if (g.kind === "puddle" && mapObj.rain) {
            ctx.strokeStyle = "rgba(255,255,255,0.65)";
            ctx.lineWidth = 1;
            ctx.strokeRect(g.x, g.y, 7, 4);
          }
        });
      }

      // 4. 東方翡翠河流與像素木橋 (僅於有河流的主地圖繪製)
      if (mapObj.hasRiver) {
        ctx.fillStyle = "#1d5eb8";
        ctx.fillRect(665, 0, 40, mapObj.height);
        ctx.fillStyle = "#3898ff";
        ctx.fillRect(670, 0, 30, mapObj.height);

        // 河面動態波光
        ctx.fillStyle = "#8ce0ff";
        for (let wy = 20; wy < mapObj.height - 20; wy += 42) {
          const waveX = 674 + ((this.tick + wy) % 14);
          ctx.fillRect(waveX, wy, 10, 3);
        }

        // 橫跨河流的像素木橋 (y: 312 ~ 354)
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

    // 繪製跨地圖傳送門 (洞口 / 石階 / 試煉之塔入口)
    drawPortal(ctx, p) {
      if (p.icon === "cave" || p.icon === "abyss") {
        ctx.fillStyle = "#1c1619";
        ctx.fillRect(p.x - 14, p.y - 12, 28, 24);
        ctx.fillStyle = (p.icon === "abyss") ? "#5a189a" : "#4a4e69";
        ctx.fillRect(p.x - 12, p.y - 10, 24, 20);
        ctx.fillStyle = "#09070a";
        ctx.fillRect(p.x - 8, p.y - 4, 16, 14);
      } else {
        // 石階傳送點
        ctx.fillStyle = "#1c1619";
        ctx.fillRect(p.x - 13, p.y - 10, 26, 20);
        ctx.fillStyle = "#f5e6c4";
        ctx.fillRect(p.x - 11, p.y - 8, 22, 16);
        for (let sy = -5; sy < 7; sy += 4) {
          ctx.fillStyle = "#c77432";
          ctx.fillRect(p.x - 11, p.y + sy, 22, 2);
        }
      }
      // 傳送門上方浮動名稱標籤
      ctx.font = "bold 8px 'Microsoft JhengHei', monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(20, 16, 19, 0.85)";
      const tw = ctx.measureText(p.name).width + 8;
      ctx.fillRect(p.x - tw / 2, p.y - 23, tw, 10);
      ctx.fillStyle = "#fbd000";
      ctx.fillText(p.name, p.x, p.y - 15);
    },

    // 主世界渲染主函數
    renderWorld() {
      const canvas = document.getElementById("world-canvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;

      const s = window.Aetheria.State.data;
      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
      const Sprites = window.Aetheria.Data.Sprites;
      const ExpSys = window.Aetheria.Explore;

      // 控制洞穴火把視野遮罩開關
      const fogEl = document.getElementById("fog-overlay");
      if (fogEl) fogEl.style.display = mapObj.fog ? "block" : "none";

      // 計算平滑相機座標
      const camX = Math.max(0, Math.min(mapObj.width - canvas.width, Math.round(s.heroX - canvas.width / 2)));
      const camY = Math.max(0, Math.min(mapObj.height - canvas.height, Math.round(s.heroY - canvas.height / 2)));

      ctx.save();
      ctx.translate(-camX, -camY);

      // 1. 繪製底層地形與河流木橋
      this.drawTerrain(ctx, mapObj, camX, camY, canvas.width, canvas.height);

      // 2. 繪製傳送門
      if (mapObj.portals) {
        mapObj.portals.forEach(p => this.drawPortal(ctx, p));
      }

      // 3. 收集畫面內的立體物件進行 Y-Sorting 景深排序
      const renderQueue = [];

      // A. 營地與野外裝飾物件 (帳篷、篝火、原木長凳、燉肉鍋、石燈籠、木牌、青苔石、裂縫岩壁)
      if (mapObj.decos) {
        mapObj.decos.forEach(d => {
          if (d.isCrackedWall && s.openedNodes && s.openedNodes[d.id]) return;
          renderQueue.push({
            y: d.y + (d.h || 18),
            draw: () => {
              if (d.sprite === "campfire") {
                // 動態跳動篝火與炊煙
                ctx.fillStyle = "#1c1619"; ctx.fillRect(d.x, d.y + 10, 16, 6);
                ctx.fillStyle = "#9c4124"; ctx.fillRect(d.x + 2, d.y + 11, 12, 4);
                const fh = (Math.floor(this.tick / 8) % 2 === 0) ? 8 : 11;
                ctx.fillStyle = "#ff6b35"; ctx.fillRect(d.x + 3, d.y + 12 - fh, 10, fh);
                ctx.fillStyle = "#fbd000"; ctx.fillRect(d.x + 5, d.y + 13 - fh, 6, fh - 2);
                const sy = (Math.floor(this.tick / 7) % 6) * 2;
                ctx.fillStyle = "rgba(150,160,170,0.65)";
                ctx.beginPath();
                ctx.arc(d.x + 8, d.y - 2 - sy, 5, 0, Math.PI * 2);
                ctx.fill();
              } else {
                const sp = Sprites.get(d.sprite);
                if (sp) ctx.drawImage(sp, d.x, d.y, d.w || sp.width, d.h || sp.height);
              }
            }
          });
        });
      }

      // B. 森林大樹 / 峽谷綁繩圓柱
      if (mapObj.trees) {
        mapObj.trees.forEach(t => {
          if (t.x + 42 < camX || t.x - 12 > camX + canvas.width || t.y + 46 < camY || t.y - 12 > camY + canvas.height) return;
          renderQueue.push({
            y: t.y + 32,
            draw: () => {
              if (mapObj.theme === "forest") {
                ctx.drawImage(Sprites.get("tree"), t.x, t.y, 34, 36);
              } else {
                ctx.drawImage(Sprites.get("pillar"), t.x, t.y, 32, 42);
              }
            }
          });
        });
      }

      // C. 四種精細採集素材節點 (💎藍晶礦、🍄紅傘菇、🌸太陽花、📦木箱、🎁紅金寶箱)
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

              // 閃光十字星粒子
              if ((this.tick + n.x) % 22 < 11) {
                ctx.fillStyle = n.perfect ? "#fbd000" : "#ffffff";
                ctx.fillRect(n.x + 14, n.y - 2, 3, 1);
                ctx.fillRect(n.x + 15, n.y - 3, 1, 3);
              }
            }
          });
        });
      }

      // D. 營地與野外互動 NPC (頭頂顯示專屬徽章與名字)
      if (mapObj.npcs) {
        mapObj.npcs.forEach(npc => {
          renderQueue.push({
            y: npc.y + 18,
            draw: () => {
              const bounce = (Math.floor(this.tick / 16) % 2 === 0) ? 0 : -1;
              const sp = Sprites.get(npc.sprite);
              if (sp) ctx.drawImage(sp, npc.x, npc.y + bounce, 19, 19);

              // NPC 頭頂氣泡標籤
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

      // E. 巡邏魔物与區域 Boss (頭頂顯示原版紅血條)
      if (mapObj.monsters) {
        mapObj.monsters.forEach(m => {
          if (m.alive === false) return;
          renderQueue.push({
            y: m.y + 18,
            draw: () => {
              const bounce = (Math.floor(this.tick / 11) % 2 === 0) ? 0 : -1;
              const sz = m.isBoss ? 26 : 19;
              const spKey = (m.type === "boss") ? "mon_boss" : (m.type === "skull") ? "mon_skull" : "mon_bamboo";
              const sp = Sprites.get(spKey);

              // 頭頂紅血條
              ctx.fillStyle = "#1c1619";
              ctx.fillRect(m.x - 1, m.y - 6, sz + 2, 4);
              ctx.fillStyle = m.isBoss ? "#ff9f1c" : "#e03c4b";
              ctx.fillRect(m.x, m.y - 5, sz, 2);

              if (sp) ctx.drawImage(sp, m.x, m.y + bounce, sz, sz);
            }
          });
        });
      }

      // F. 同行戰寵 (支援異色閃光版 Shiny 外觀！)
      const petData = window.Aetheria.Data.PETS[s.activePet] || window.Aetheria.Data.PETS.pet_slime;
      const isShinyPet = s.shinyPets && s.shinyPets.includes(s.activePet);
      const petSpriteKey = isShinyPet ? petData.shinySpriteKey : petData.spriteKey;

      renderQueue.push({
        y: s.petY + 16,
        draw: () => {
          const isMov = ExpSys && ExpSys.isMoving;
          const bounce = isMov ? (Math.floor(this.tick / 4) % 2 * -2) : (Math.floor(this.tick / 14) % 2 * -1);
          const sp = Sprites.get(petSpriteKey);
          if (sp) ctx.drawImage(sp, Math.round(s.petX), Math.round(s.petY + bounce), 18, 18);
        }
      });

      // G. 主角 4 方向 × 2 踏步動作幀
      renderQueue.push({
        y: s.heroY + 18,
        draw: () => {
          const isMov = ExpSys && ExpSys.isMoving;
          const stepFrame = isMov ? (Math.floor(this.tick / 6) % 2) : 0;
          const bounce = isMov ? (stepFrame * -1) : 0;
          const dir = s.facing || "down";
          const heroSp = Sprites.get(`hero_${dir}_${stepFrame}`) || Sprites.get("hero_down_0");
          if (heroSp) ctx.drawImage(heroSp, Math.round(s.heroX), Math.round(s.heroY + bounce), 19, 19);
        }
      });

      // 依 Y 座標排序繪製，實現完美的前後樹冠與帳篷遮擋
      renderQueue.sort((a, b) => a.y - b.y);
      renderQueue.forEach(item => item.draw());

      ctx.restore();

      // 4. 螢幕級別特效：斜落微雨絲 + 左上角紅心列 + 左下角實時小地圖雷達
      if (mapObj.rain) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 14; i++) {
          const rx = ((i * 41 + this.tick * 2) % 240) + 8;
          const ry = ((i * 29 + this.tick * 4) % 130) + 6;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 4, ry + 8);
          ctx.stroke();
        }
      }

      // 左上角繪製 3 顆白邊像素紅心
      const fullHearts = Math.ceil((s.hp / s.maxHp) * 3);
      const heartSp = Sprites.get("heart");
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = (i < fullHearts) ? 1.0 : 0.32;
        if (heartSp) ctx.drawImage(heartSp, 6 + i * 16, 5, 14, 13);
      }
      ctx.globalAlpha = 1.0;

      // 左下角繪製實時小地圖雷達
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

      // 傳送門 (藍綠點)
      ctx.fillStyle = "#4cc9f0";
      if (mapObj.portals) {
        mapObj.portals.forEach(p => {
          ctx.fillRect(mx + Math.round(p.x / mapObj.width * mw) - 1, my + Math.round(p.y / mapObj.height * mh) - 1, 3, 3);
        });
      }

      // 未採集資源點 (金黃點)
      ctx.fillStyle = "#f5b700";
      if (mapObj.nodes) {
        mapObj.nodes.forEach(n => {
          if (!n.opened && !(s.openedNodes && s.openedNodes[n.id])) {
            ctx.fillRect(mx + Math.round(n.x / mapObj.width * mw), my + Math.round(n.y / mapObj.height * mh), 2, 2);
          }
        });
      }

      // 魔物點 (紅點)
      ctx.fillStyle = "#ff595e";
      if (mapObj.monsters) {
        mapObj.monsters.forEach(m => {
          if (m.alive !== false) {
            ctx.fillRect(mx + Math.round(m.x / mapObj.width * mw), my + Math.round(m.y / mapObj.height * mh), 2, 2);
          }
        });
      }

      // 主角當前位置 (閃爍白點)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(mx + Math.round(s.heroX / mapObj.width * mw) - 1, my + Math.round(s.heroY / mapObj.height * mh) - 1, 3, 3);
    },

    // 戰鬥舞台背景與角色渲染
    renderBattleScene(enemy) {
      const c = document.getElementById("battle-canvas");
      if (!c) return;
      const ctx = c.getContext("2d");
      ctx.imageSmoothingEnabled = false;

      const s = window.Aetheria.State.data;
      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
      const Sprites = window.Aetheria.Data.Sprites;

      // 1. 鋪設戰鬥場地背景
      ctx.fillStyle = (mapObj.theme === "forest") ? "#a8ba59" : (mapObj.theme === "canyon") ? "#e09953" : "#241d30";
      ctx.fillRect(0, 0, c.width, c.height);

      ctx.fillStyle = (mapObj.theme === "forest") ? "#c88662" : (mapObj.theme === "canyon") ? "#f4be78" : "#3a2e4d";
      ctx.beginPath();
      ctx.ellipse(128, 108, 112, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      for (let x = -6; x < 256; x += 30) {
        if (mapObj.theme === "forest") ctx.drawImage(Sprites.get("tree"), x, -4, 34, 36);
        else ctx.drawImage(Sprites.get("pillar"), x, -6, 30, 40);
      }

      const bounce = (Math.floor(this.tick / 10) % 2 === 0) ? 0 : -2;

      // 2. 繪製左側同行戰寵與主角側面迎敵姿態
      const petData = window.Aetheria.Data.PETS[s.activePet] || window.Aetheria.Data.PETS.pet_slime;
      const isShinyPet = s.shinyPets && s.shinyPets.includes(s.activePet);
      const petSp = Sprites.get(isShinyPet ? petData.shinySpriteKey : petData.spriteKey);
      if (petSp) ctx.drawImage(petSp, 16, 92 + bounce, 28, 28);

      const heroSp = Sprites.get("hero_right_0");
      if (heroSp) ctx.drawImage(heroSp, 46, 84 + bounce, 34, 34);

      // 3. 繪製右側敵方魔物或 Boss (若處於 Break 破防暈眩則傾斜閃爍)
      if (enemy) {
        const eSp = Sprites.get(enemy.spriteKey || "mon_bamboo");
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