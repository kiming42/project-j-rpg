/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 多區域開放世界、子洞穴迷宮與防重疊佈局庫 (world-maps.js)
 * 包含：4大無縫連結地圖 + 防重疊環境裝飾生成器 + 跨地圖傳送門 + 裂縫炸彈牆
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  // 空間防重疊檢測器：確保任何兩件裝飾、樹木、NPC 或礦脈不會重疊擠在一起
  function createSpatialPlacer() {
    const occupied = [];
    return {
      reserve(x, y, radius = 26) {
        occupied.push({ x, y, r: radius });
      },
      canPlace(x, y, radius = 24) {
        for (let i = 0; i < occupied.length; i++) {
          const item = occupied[i];
          const dist = Math.hypot(x - item.x, y - item.y);
          if (dist < (radius + item.r)) return false;
        }
        return true;
      },
      tryAdd(list, obj, radius = 24) {
        if (this.canPlace(obj.x, obj.y, radius)) {
          this.reserve(obj.x, obj.y, radius);
          list.push(obj);
          return true;
        }
        return false;
      }
    };
  }

  // 生成地面自然細節 (鵝卵石、深色泥斑、三葉小草簇 — 屬於純地面層，不擋路不重疊)
  function generateGroundDetails(width, height, count = 65) {
    const pebbles = [];
    for (let i = 0; i < count; i++) {
      const px = 45 + ((i * 137) % (width - 90));
      const py = 45 + ((i * 293) % (height - 90));
      pebbles.push({
        x: px,
        y: py,
        kind: (i % 3 === 0) ? "tuft" : (i % 3 === 1) ? "pebble" : "puddle"
      });
    }
    return pebbles;
  }

  // ================= 1. 翠風大森林與中央露營基地 (900x700 主世界) =================
  function buildForestWorld() {
    const placer = createSpatialPlacer();
    const trees = [];
    const decos = [];
    const nodes = [];
    const npcs = [];
    const monsters = [];
    const portals = [];

    // 預留主角出生點與中央篝火通道
    placer.reserve(420, 345, 32);

    // A. 中央露營基地核心建築與裝飾 (精心排位，消滅空曠感且 100% 不重疊)
    const campFixedDecos = [
      { x: 345, y: 255, sprite: "tent", w: 44, h: 40, solid: true, r: 30 },       // 公會/休息大帳篷
      { x: 465, y: 255, sprite: "tent", w: 44, h: 40, solid: true, r: 30 },       // 鐵匠工坊帳篷
      { x: 418, y: 312, sprite: "campfire", w: 18, h: 18, solid: true, r: 22 },   // 中央動態篝火
      { x: 382, y: 315, sprite: "deco_bench", w: 22, h: 12, solid: false, r: 18 },// 篝火左側原木長凳
      { x: 446, y: 315, sprite: "deco_pot", w: 18, h: 18, solid: true, r: 18 },   // 篝火右側滾燙燉肉鍋
      { x: 512, y: 278, sprite: "deco_anvil", w: 18, h: 14, solid: true, r: 16 }, // 鐵匠打鐵砧
      { x: 534, y: 268, sprite: "deco_rack", w: 20, h: 18, solid: true, r: 18 },  // 武器展示木架
      { x: 372, y: 215, sprite: "deco_lantern", w: 16, h: 20, solid: true, r: 16 },// 北路口石燈籠
      { x: 468, y: 215, sprite: "deco_sign", w: 18, h: 18, solid: true, r: 16 },  // 北路口指路木牌
      { x: 565, y: 315, sprite: "deco_sign", w: 18, h: 18, solid: true, r: 16 },  // 東方過橋路牌
      { x: 565, y: 355, sprite: "deco_lantern", w: 16, h: 20, solid: true, r: 16 },// 東方路口石燈籠
      { x: 315, y: 315, sprite: "deco_rock", w: 20, h: 16, solid: true, r: 18 },  // 西路口青苔景觀石
      { x: 375, y: 405, sprite: "deco_stump", w: 16, h: 14, solid: false, r: 16 },// 南路口老樹樁
      { x: 475, y: 405, sprite: "deco_lantern", w: 16, h: 20, solid: true, r: 16 } // 南路口石燈籠
    ];
    campFixedDecos.forEach(d => placer.tryAdd(decos, d, d.r));

    // B. 營地 4 大核心互動 NPC (鐵匠、星象師、公會長、神秘行商)
    const campNpcs = [
      { id: "npc_smith", name: "鐵匠大叔・巴爾", role: "武器鍛造 & 工具升級", sprite: "npc_blacksmith", badge: "⚒️", x: 492, y: 288 },
      { id: "npc_astro", name: "星象少女・艾莉婭", role: "四科溫習調頻 & 錯題淨化", sprite: "npc_astrologer", badge: "🔮", x: 332, y: 292 },
      { id: "npc_guild", name: "公會會長・雷恩", role: "冒險階級 & 懸賞委託", sprite: "npc_guildmaster", badge: "🛡️", x: 375, y: 282 },
      { id: "npc_merch", name: "神秘行商・奇奇", role: "稀有藥水 & 靈果交換", sprite: "npc_merchant", badge: "💰", x: 615, y: 312 }
    ];
    campNpcs.forEach(n => placer.tryAdd(npcs, n, 24));

    // C. 跨地圖傳送門 (Portals：通往蘑菇洞窟、流沙大峽谷、無盡試煉之塔)
    const mapPortals = [
      { id: "p_to_cave", name: "🕳️ 微光蘑菇洞窟入口 (Lv.5)", x: 435, y: 68, targetZone: "mushroom_cave", targetX: 280, targetY: 390, icon: "cave" },
      { id: "p_to_canyon", name: "🏜️ 前往流沙繩索大峽谷 (Lv.12)", x: 835, y: 332, targetZone: "canyon_world", targetX: 95, targetY: 335, icon: "stairs" },
      { id: "p_to_tower", name: "🏛️ 無盡試煉之塔入口 (100層)", x: 115, y: 215, targetZone: "endless_tower", targetX: 250, targetY: 360, icon: "tower" }
    ];
    mapPortals.forEach(p => {
      placer.reserve(p.x, p.y, 34);
      portals.push(p);
    });

    // D. 全地圖 22 個豐富採集資源點 (💎藍晶礦、🍄紅傘菇、🌸太陽花、📦木箱、🎁寶箱)
    const rawNodes = [
      // 營地周邊新手採集點
      { id: "f_n1", x: 445, y: 268, type: "crate", name: "營地鍛造補給箱" },
      { id: "f_n2", x: 338, y: 368, type: "mushroom", name: "紅傘微光菇" },
      { id: "f_n3", x: 498, y: 372, type: "flower", name: "翠風太陽花" },
      // 北方迷霧蘑菇林 (y: 80 ~ 210)
      { id: "f_n4", x: 365, y: 145, type: "mushroom", name: "紅傘微光菇" },
      { id: "f_n5", x: 495, y: 135, type: "mushroom", name: "紅傘微光菇" },
      { id: "f_n6", x: 395, y: 105, type: "flower", name: "翠風太陽花" },
      { id: "f_n7", x: 525, y: 95,  type: "chest", name: "北方森林寶箱" },
      // 南方藍晶礦脈區 (y: 480 ~ 620)
      { id: "f_n8", x: 375, y: 515, type: "crystal", name: "藍晶鐵礦簇" },
      { id: "f_n9", x: 445, y: 555, type: "crystal", name: "藍晶鐵礦簇" },
      { id: "f_n10",x: 515, y: 520, type: "crystal", name: "藍晶鐵礦簇" },
      { id: "f_n11",x: 395, y: 595, type: "crystal", name: "藍晶鐵礦簇" },
      { id: "f_n12",x: 485, y: 605, type: "chest", name: "礦脈守衛紅寶箱" },
      // 西方千年古樹區 (x: 85 ~ 250)
      { id: "f_n13",x: 215, y: 310, type: "flower", name: "翠風太陽花" },
      { id: "f_n14",x: 155, y: 385, type: "mushroom", name: "紅傘微光菇" },
      { id: "f_n15",x: 105, y: 325, type: "crystal", name: "藍晶鐵礦簇" },
      { id: "f_n16",x: 115, y: 465, type: "chest", legendary: true, name: "古樹傳說紫晶箱" },
      // 東方翡翠河岸過橋後 (x: 725 ~ 830)
      { id: "f_n17",x: 745, y: 265, type: "crystal", perfect: true, name: "✨閃光秘銀礦簇" },
      { id: "f_n18",x: 795, y: 395, type: "flower", name: "河岸太陽靈花" },
      { id: "f_n19",x: 755, y: 475, type: "mushroom", name: "河岸微光菇" },
      { id: "f_n20",x: 785, y: 165, type: "chest", legendary: true, name: "河畔秘境傳說寶箱" }
    ];
    rawNodes.forEach(n => placer.tryAdd(nodes, n, 22));

    // E. 巡邏魔物分佈
    const rawMonsters = [
      { id: "m_f1", x: 432, y: 168, lv: 2, type: "bamboo", name: "翠風竹子妖" },
      { id: "m_f2", x: 355, y: 475, lv: 3, type: "bamboo", name: "礦道竹子精" },
      { id: "m_f3", x: 465, y: 515, lv: 4, type: "bamboo", name: "礦區竹子守衛" },
      { id: "m_f4", x: 185, y: 345, lv: 5, type: "skull",  name: "古樹骷髏斥候" },
      { id: "m_f5", x: 745, y: 332, lv: 8, type: "skull",  name: "河岸骷髏衛隊長" },
      { id: "m_f6", x: 775, y: 215, lv: 18, type: "boss", isBoss: true, name: "💀 翡翠河岸赤炎王" }
    ];
    rawMonsters.forEach(m => placer.tryAdd(monsters, m, 24));

    // F. 外圍邊界樹林與內部自然樹叢 (自動避開所有已放置的 NPC、道路、礦點與河流)
    for (let x = 8; x < 880; x += 34) {
      placer.tryAdd(trees, { x, y: 8 }, 20);
      placer.tryAdd(trees, { x: x + 14, y: 652 }, 20);
    }
    for (let y = 40; y < 640; y += 34) {
      placer.tryAdd(trees, { x: 8, y }, 20);
      if (Math.abs(y - 332) > 45) placer.tryAdd(trees, { x: 856, y }, 20);
    }

    // 內部四大森林樹群與老樹樁/青苔石點綴
    const treeClusters = [
      { cx: 255, cy: 195, r: 58, count: 7 },
      { cx: 585, cy: 185, r: 58, count: 7 },
      { cx: 255, cy: 485, r: 58, count: 7 },
      { cx: 590, cy: 495, r: 55, count: 6 }
    ];
    treeClusters.forEach((c, idx) => {
      for (let i = 0; i < c.count; i++) {
        const ang = (i / c.count) * Math.PI * 2;
        const tx = Math.round(c.cx + Math.cos(ang) * c.r);
        const ty = Math.round(c.cy + Math.sin(ang) * (c.r * 0.75));
        placer.tryAdd(trees, { x: tx, y: ty }, 24);
      }
      // 樹林邊緣點綴老樹樁與景觀岩
      placer.tryAdd(decos, { x: c.cx, y: c.cy, sprite: (idx % 2 === 0) ? "deco_rock" : "deco_stump", w: 18, h: 15, solid: true }, 20);
    });

    return {
      id: "forest_world",
      name: "翠風大森林",
      recLv: 1,
      bgm: "forest",
      theme: "forest",
      rain: true,
      fog: false,
      hasRiver: true,
      width: 900,
      height: 700,
      dirtBlobs: [
        { cx: 425, cy: 330, rx: 95, ry: 70 },
        { cx: 435, cy: 225, rx: 38, ry: 55 },
        { cx: 435, cy: 120, rx: 65, ry: 55 },
        { cx: 435, cy: 445, rx: 40, ry: 55 },
        { cx: 445, cy: 555, rx: 85, ry: 55 },
        { cx: 295, cy: 340, rx: 65, ry: 34 },
        { cx: 155, cy: 350, rx: 75, ry: 65 },
        { cx: 565, cy: 332, rx: 65, ry: 32 },
        { cx: 765, cy: 332, rx: 72, ry: 85 }
      ],
      groundDetails: generateGroundDetails(900, 700, 70),
      trees,
      decos,
      nodes,
      npcs,
      monsters,
      portals
    };
  }

  // ================= 2. 微光蘑菇地下洞窟 (560x460 子迷宮 — 含火把視野與裂縫炸彈牆) =================
  function buildMushroomCave() {
    const placer = createSpatialPlacer();
    const trees = [];
    const decos = [];
    const nodes = [];
    const monsters = [];
    const portals = [
      { id: "p_cave_out", name: "🚪 返回翠風大森林", x: 280, y: 420, targetZone: "forest_world", targetX: 435, targetY: 95, icon: "stairs" },
      { id: "p_cave_abyss", name: "💀 深入深淵星隕聖殿 (Lv.25)", x: 280, y: 52, targetZone: "abyss_sanctum", targetX: 280, targetY: 380, icon: "abyss" }
    ];
    portals.forEach(p => placer.reserve(p.x, p.y, 35));

    // 洞窟石燈籠與可炸開的裂縫牆壁 (炸開後可拿左上角隱藏寶箱！)
    const caveDecos = [
      { x: 240, y: 375, sprite: "deco_lantern", w: 16, h: 20, solid: true },
      { x: 320, y: 375, sprite: "deco_lantern", w: 16, h: 20, solid: true },
      { x: 145, y: 155, sprite: "cracked_wall", w: 24, h: 24, solid: true, isCrackedWall: true, id: "cw_cave_1" }
    ];
    caveDecos.forEach(d => placer.tryAdd(decos, d, 22));

    // 洞窟高密度閃光秘銀礦與紅傘菇 (全部支援 8 秒限時完美採集 x3 大爆擊！)
    const caveNodes = [
      { id: "c_n1", x: 165, y: 295, type: "crystal", perfect: true, name: "✨洞窟閃光秘銀礦" },
      { id: "c_n2", x: 395, y: 295, type: "crystal", perfect: true, name: "✨洞窟閃光秘銀礦" },
      { id: "c_n3", x: 195, y: 195, type: "mushroom", name: "夜光紅傘菇" },
      { id: "c_n4", x: 365, y: 195, type: "mushroom", name: "夜光紅傘菇" },
      { id: "c_n5", x: 435, y: 115, type: "crystal", perfect: true, name: "✨深層秘銀礦簇" },
      { id: "c_n6", x: 95,  y: 95,  type: "chest", legendary: true, name: "炸彈密室傳說寶箱" }
    ];
    caveNodes.forEach(n => placer.tryAdd(nodes, n, 22));

    const caveMonsters = [
      { id: "m_c1", x: 280, y: 275, lv: 5, type: "skull", name: "洞窟骷髏衛兵" },
      { id: "m_c2", x: 185, y: 235, lv: 6, type: "bamboo", name: "變異夜光竹妖" },
      { id: "m_c3", x: 375, y: 235, lv: 6, type: "skull", name: "洞窟骷髏弓手" },
      { id: "m_c4", x: 280, y: 115, lv: 9, type: "skull", isBoss: true, name: "💀 洞窟骷髏統領" }
    ];
    caveMonsters.forEach(m => placer.tryAdd(monsters, m, 24));

    // 洞窟四周岩柱邊界
    for (let x = 12; x < 540; x += 36) {
      placer.tryAdd(trees, { x, y: 10 }, 20);
      placer.tryAdd(trees, { x, y: 425 }, 20);
    }
    for (let y = 40; y < 410; y += 36) {
      placer.tryAdd(trees, { x: 12, y }, 20);
      placer.tryAdd(trees, { x: 515, y }, 20);
    }

    return {
      id: "mushroom_cave",
      name: "微光蘑菇洞窟",
      recLv: 5,
      bgm: "canyon",
      theme: "cave",
      rain: false,
      fog: true, // 開啟洞穴火把視野
      hasRiver: false,
      width: 560,
      height: 460,
      dirtBlobs: [
        { cx: 280, cy: 240, rx: 195, ry: 165 }
      ],
      groundDetails: generateGroundDetails(560, 460, 35),
      trees,
      decos,
      nodes,
      npcs: [],
      monsters,
      portals
    };
  }

  // ================= 3. 流沙繩索大峽谷 (800x600 第二章區域 — 100% 配備完整採集點與傳送門！) =================
  function buildCanyonWorld() {
    const placer = createSpatialPlacer();
    const trees = [];
    const decos = [];
    const nodes = [];
    const npcs = [];
    const monsters = [];
    const portals = [
      { id: "p_can_back", name: "🌲 返回翠風大森林", x: 55, y: 335, targetZone: "forest_world", targetX: 795, targetY: 332, icon: "stairs" },
      { id: "p_can_abyss", name: "🌋 進入深淵星隕聖殿 (Lv.25)", x: 735, y: 335, targetZone: "abyss_sanctum", targetX: 280, targetY: 380, icon: "abyss" }
    ];
    portals.forEach(p => placer.reserve(p.x, p.y, 36));

    // 峽谷綠洲營地裝飾與考古 NPC
    const canyonDecos = [
      { x: 385, y: 275, sprite: "tent", w: 44, h: 40, solid: true },
      { x: 442, y: 315, sprite: "campfire", w: 18, h: 18, solid: true },
      { x: 355, y: 315, sprite: "deco_sign", w: 18, h: 18, solid: true },
      { x: 515, y: 215, sprite: "deco_rock", w: 20, h: 16, solid: true },
      { x: 265, y: 425, sprite: "deco_rock", w: 20, h: 16, solid: true }
    ];
    canyonDecos.forEach(d => placer.tryAdd(decos, d, 24));

    placer.tryAdd(npcs, {
      id: "npc_merch_canyon", name: "綠洲行商・奇奇", role: "峽谷秘銀與補給商", sprite: "npc_merchant", badge: "💰", x: 405, y: 325
    }, 24);

    // 峽谷豐富採集節點 (秘銀礦簇、太陽靈花、黃金寶箱)
    const canyonNodes = [
      { id: "cy_n1", x: 235, y: 215, type: "crystal", perfect: true, name: "✨峽谷秘銀礦簇" },
      { id: "cy_n2", x: 565, y: 195, type: "crystal", perfect: true, name: "✨峽谷秘銀礦簇" },
      { id: "cy_n3", x: 255, y: 465, type: "crystal", perfect: true, name: "✨流沙黃銅礦" },
      { id: "cy_n4", x: 585, y: 455, type: "crystal", perfect: true, name: "✨流沙秘銀礦" },
      { id: "cy_n5", x: 345, y: 165, type: "flower", name: "沙漠太陽靈花" },
      { id: "cy_n6", x: 485, y: 465, type: "flower", name: "綠洲太陽靈花" },
      { id: "cy_n7", x: 645, y: 145, type: "chest", legendary: true, name: "太陽神殿紅金寶箱" },
      { id: "cy_n8", x: 185, y: 505, type: "chest", name: "流沙商隊遺落寶箱" }
    ];
    canyonNodes.forEach(n => placer.tryAdd(nodes, n, 22));

    const canyonMonsters = [
      { id: "m_cy1", x: 275, y: 295, lv: 11, type: "skull", name: "流沙骷髏劍士" },
      { id: "m_cy2", x: 535, y: 285, lv: 12, type: "skull", name: "峽谷骷髏守衛" },
      { id: "m_cy3", x: 415, y: 175, lv: 14, type: "bamboo", name: "荒漠仙人掌妖" },
      { id: "m_cy4", x: 655, y: 335, lv: 18, type: "boss", isBoss: true, name: "💀 金字塔守護魔神" }
    ];
    canyonMonsters.forEach(m => placer.tryAdd(monsters, m, 24));

    // 峽谷四周綁麻繩年輪圓柱高台
    for (let x = 16; x < 770; x += 48) {
      placer.tryAdd(trees, { x, y: 8 }, 24);
      placer.tryAdd(trees, { x, y: 545 }, 24);
    }
    for (let y = 55; y < 520; y += 48) {
      if (Math.abs(y - 335) > 48) {
        placer.tryAdd(trees, { x: 12, y }, 24);
        placer.tryAdd(trees, { x: 752, y }, 24);
      }
    }

    return {
      id: "canyon_world",
      name: "流沙繩索大峽谷",
      recLv: 12,
      bgm: "canyon",
      theme: "canyon",
      rain: false,
      fog: false,
      hasRiver: false,
      width: 800,
      height: 600,
      dirtBlobs: [
        { cx: 400, cy: 310, rx: 280, ry: 185 }
      ],
      groundDetails: generateGroundDetails(800, 600, 50),
      trees,
      decos,
      nodes,
      npcs,
      monsters,
      portals
    };
  }

  // ================= 4. 深淵星隕聖殿 (560x460 高壓越級挑戰區 Lv.25 💀) =================
  function buildAbyssSanctum() {
    const placer = createSpatialPlacer();
    const trees = [];
    const decos = [
      { x: 235, y: 345, sprite: "deco_lantern", w: 16, h: 20, solid: true },
      { x: 325, y: 345, sprite: "deco_lantern", w: 16, h: 20, solid: true }
    ];
    const nodes = [
      { id: "ab_n1", x: 115, y: 115, type: "chest", legendary: true, name: "🟣 深淵星隕神器寶箱" },
      { id: "ab_n2", x: 445, y: 115, type: "chest", legendary: true, name: "🟣 破曉傳說秘寶箱" },
      { id: "ab_n3", x: 135, y: 265, type: "crystal", perfect: true, name: "🌌 深淵星隕鐵礦" },
      { id: "ab_n4", x: 425, y: 265, type: "crystal", perfect: true, name: "🌌 深淵星隕鐵礦" }
    ];
    const monsters = [
      { id: "m_ab1", x: 280, y: 165, lv: 25, type: "boss", isBoss: true, name: "💀 深淵赤炎龍皇 Lv.25" },
      { id: "m_ab2", x: 175, y: 225, lv: 22, type: "skull", name: "深淵黑鎧死神" },
      { id: "m_ab3", x: 385, y: 225, lv: 22, type: "skull", name: "深淵黑鎧死神" }
    ];
    const portals = [
      { id: "p_ab_back", name: "🪽 返回翠風大森林營地", x: 280, y: 415, targetZone: "forest_world", targetX: 420, targetY: 345, icon: "stairs" }
    ];

    for (let x = 14; x < 540; x += 42) {
      trees.push({ x, y: 10 }, { x, y: 420 });
    }

    return {
      id: "abyss_sanctum",
      name: "深淵星隕聖殿",
      recLv: 25,
      bgm: "abyss",
      theme: "cave",
      rain: false,
      fog: true,
      hasRiver: false,
      width: 560,
      height: 460,
      dirtBlobs: [
        { cx: 280, cy: 235, rx: 195, ry: 160 }
      ],
      groundDetails: generateGroundDetails(560, 460, 30),
      trees,
      decos,
      nodes,
      npcs: [],
      monsters,
      portals
    };
  }

  // ================= 5. 100 層《無盡試煉之塔》Roguelike 動態樓層生成器 =================
  function generateTowerFloor(floorNum = 1) {
    const recLv = Math.max(3, floorNum * 3);
    return {
      id: "endless_tower",
      name: `無盡試煉之塔・第 ${floorNum} 層`,
      floorNum: floorNum,
      recLv: recLv,
      bgm: "abyss",
      theme: (floorNum % 2 === 0) ? "canyon" : "cave",
      rain: false,
      fog: (floorNum % 3 === 0),
      hasRiver: false,
      width: 520,
      height: 420,
      dirtBlobs: [{ cx: 260, cy: 210, rx: 185, ry: 145 }],
      groundDetails: generateGroundDetails(520, 420, 25),
      trees: [
        { x: 20, y: 20 }, { x: 460, y: 20 }, { x: 20, y: 360 }, { x: 460, y: 360 }
      ],
      decos: [
        { x: 210, y: 330, sprite: "deco_lantern", w: 16, h: 20, solid: true },
        { x: 300, y: 330, sprite: "deco_lantern", w: 16, h: 20, solid: true }
      ],
      nodes: [
        { id: `tw_n1_${floorNum}`, x: 135, y: 185, type: "crystal", perfect: true, name: "✨試煉星隕礦" },
        { id: `tw_n2_${floorNum}`, x: 375, y: 185, type: "chest", legendary: (floorNum % 5 === 0), name: `第 ${floorNum} 層試煉寶箱` }
      ],
      npcs: [],
      monsters: [
        {
          id: `tw_boss_${floorNum}`,
          x: 255, y: 145,
          lv: recLv,
          type: (floorNum % 5 === 0) ? "boss" : "skull",
          isBoss: (floorNum % 5 === 0),
          isShinyCandidate: true,
          name: (floorNum % 5 === 0) ? `💀 第 ${floorNum} 層守關魔神` : `試煉塔幻影衛兵 Lv.${recLv}`
        }
      ],
      portals: [
        { id: "p_tw_next", name: `⬆️ 登上第 ${floorNum + 1} 層`, x: 255, y: 55, targetZone: "endless_tower_next", targetX: 250, targetY: 350, icon: "stairs" },
        { id: "p_tw_exit", name: "⛺ 撤退返回曙光營地", x: 255, y: 385, targetZone: "forest_world", targetX: 420, targetY: 345, icon: "stairs" }
      ]
    };
  }

  const MAPS_DB = {
    forest_world: buildForestWorld(),
    mushroom_cave: buildMushroomCave(),
    canyon_world: buildCanyonWorld(),
    abyss_sanctum: buildAbyssSanctum(),
    endless_tower: generateTowerFloor(1)
  };

  window.Aetheria.Data.Maps = {
    getMap(zoneId) {
      return MAPS_DB[zoneId] || MAPS_DB.forest_world;
    },
    advanceTowerFloor(nextFloor) {
      MAPS_DB.endless_tower = generateTowerFloor(nextFloor);
      return MAPS_DB.endless_tower;
    },
    refreshAllResources() {
      MAPS_DB.forest_world = buildForestWorld();
      MAPS_DB.mushroom_cave = buildMushroomCave();
      MAPS_DB.canyon_world = buildCanyonWorld();
      MAPS_DB.abyss_sanctum = buildAbyssSanctum();
    }
  };
})();