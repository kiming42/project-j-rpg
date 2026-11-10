/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 立體三層世界全區域與 Metroidvania 機關配置庫 (world-maps.js - Full v2.5)
 * 包含：9大主題開放區域 + 釣魚點 + 抓鉤飛躍樁 + 擋路巨石/枯木 + 洞穴驅霧火盆 + 野生閃光魔物
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  function createSpatialPlacer() {
    const occupied = [];
    return {
      reserve(x, y, radius = 26) {
        occupied.push({ x, y, r: radius });
      },
      canPlace(x, y, radius = 24) {
        for (let i = 0; i < occupied.length; i++) {
          const item = occupied[i];
          if (Math.hypot(x - item.x, y - item.y) < (radius + item.r)) return false;
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

  function generateGroundDetails(width, height, count = 60) {
    const pebbles = [];
    for (let i = 0; i < count; i++) {
      pebbles.push({
        x: 45 + ((i * 137) % (width - 90)),
        y: 45 + ((i * 293) % (height - 90)),
        kind: (i % 3 === 0) ? "tuft" : (i % 3 === 1) ? "pebble" : "puddle"
      });
    }
    return pebbles;
  }

  function assignWildShiny(monsters) {
    monsters.forEach((m, idx) => {
      m.isShiny = (idx === 1) || (Math.random() < 0.12);
    });
    return monsters;
  }

  // ================= 1. 翠風大森林與中央露營基地 (900x700) =================
  function buildForestWorld() {
    const placer = createSpatialPlacer();
    const trees = [], decos = [], nodes = [], npcs = [], monsters = [], portals = [];

    placer.reserve(420, 345, 34);

    // A. 營地裝飾 + 新增：河岸釣魚點、抓鉤木樁、擋路巨石(需Lv.2鎬)、擋路枯木(需Lv.2斧)
    const campFixedDecos = [
      { x: 345, y: 255, sprite: "tent", w: 44, h: 40, solid: true, r: 30 },
      { x: 465, y: 255, sprite: "tent", w: 44, h: 40, solid: true, r: 30 },
      { x: 418, y: 312, sprite: "campfire", w: 18, h: 18, solid: true, r: 22 },
      { x: 382, y: 315, sprite: "deco_bench", w: 22, h: 12, solid: false, r: 18 },
      { x: 446, y: 315, sprite: "deco_pot", w: 18, h: 18, solid: true, r: 18 },
      { x: 512, y: 278, sprite: "deco_anvil", w: 18, h: 14, solid: true, r: 16 },
      { x: 534, y: 268, sprite: "deco_rack", w: 20, h: 18, solid: true, r: 18 },
      { x: 372, y: 215, sprite: "deco_lantern", w: 16, h: 20, solid: true, r: 16 },
      { x: 468, y: 215, sprite: "deco_sign", w: 18, h: 18, solid: true, r: 16 },
      { x: 565, y: 315, sprite: "deco_sign", w: 18, h: 18, solid: true, r: 16 },
      { x: 315, y: 315, sprite: "deco_rock", w: 20, h: 16, solid: true, r: 18 },
      { x: 375, y: 405, sprite: "deco_stump", w: 16, h: 14, solid: false, r: 16 },
      // 🎣 翡翠河畔水波釣魚點 (2處)
      { id: "fish_f1", x: 646, y: 245, sprite: "fishing_spot", w: 20, h: 16, isFishingSpot: true, r: 20 },
      { id: "fish_f2", x: 646, y: 425, sprite: "fishing_spot", w: 20, h: 16, isFishingSpot: true, r: 20 },
      // 🪝 翡翠河兩岸鐵索抓鉤木樁 (無需繞行木橋，可直接飛越翡翠河！)
      { id: "grap_f_w", x: 642, y: 185, sprite: "grapple_post", w: 18, h: 20, isGrapple: true, targetX: 722, targetY: 185, r: 18 },
      { id: "grap_f_e", x: 718, y: 185, sprite: "grapple_post", w: 18, h: 20, isGrapple: true, targetX: 636, targetY: 185, r: 18 },
      // 🪨 擋路玄武巨石 (需 Lv.2 秘銀重鎬敲碎，保護南方傳說寶箱)
      { id: "obs_f_rock", x: 485, y: 575, sprite: "boulder_block", w: 22, h: 20, solid: true, obstacleType: "boulder", r: 18 },
      // 🌲 擋路巨型枯木 (需 Lv.2 烈焰戰斧砍斷，保護西方古樹傳說寶箱)
      { id: "obs_f_tree", x: 145, y: 445, sprite: "deadtree_block", w: 22, h: 22, solid: true, obstacleType: "deadtree", r: 18 }
    ];
    campFixedDecos.forEach(d => placer.tryAdd(decos, d, d.r || 18));

    const campNpcs = [
      { id: "npc_smith", name: "鐵匠大叔・巴爾", role: "武器鍛造 & 工具升級", sprite: "npc_blacksmith", badge: "⚒️", x: 492, y: 288 },
      { id: "npc_astro", name: "星象少女・艾莉婭", role: "四科溫習調頻 & 錯題淨化", sprite: "npc_astrologer", badge: "🔮", x: 332, y: 292 },
      { id: "npc_guild", name: "公會會長・雷恩", role: "冒險階級 & 懸賞委託", sprite: "npc_guildmaster", badge: "🛡️", x: 375, y: 282 },
      { id: "npc_merch", name: "神秘行商・奇奇", role: "稀有藥水 & 靈果交換", sprite: "npc_merchant", badge: "💰", x: 615, y: 312 }
    ];
    campNpcs.forEach(n => placer.tryAdd(npcs, n, 24));

    const mapPortals = [
      { id: "p_to_cave",   name: "🕳️ 微光蘑菇洞窟 (Lv.5)", x: 435, y: 68,  targetZone: "mushroom_cave", targetX: 280, targetY: 390, icon: "cave" },
      { id: "p_to_canyon", name: "🏜️ 流沙繩索大峽谷 (Lv.12)", x: 835, y: 332, targetZone: "canyon_world",  targetX: 95,  targetY: 335, icon: "stairs" },
      { id: "p_to_coast",  name: "🏖️ 翡翠海岸與沉船灣 (Lv.21)", x: 435, y: 645, targetZone: "emerald_coast", targetX: 350, targetY: 95,  icon: "stairs" },
      { id: "p_to_tower",  name: "🏛️ 無盡試煉之塔 (100層)", x: 115, y: 215, targetZone: "endless_tower", targetX: 250, targetY: 360, icon: "tower" }
    ];
    mapPortals.forEach(p => { placer.reserve(p.x, p.y, 34); portals.push(p); });

    const rawNodes = [
      { id: "f_n1", x: 445, y: 268, type: "crate", name: "營地鍛造補給箱" },
      { id: "f_n2", x: 338, y: 368, type: "mushroom", name: "紅傘微光菇" },
      { id: "f_n3", x: 498, y: 372, type: "flower", name: "翠風太陽花" },
      { id: "f_n4", x: 365, y: 145, type: "mushroom", name: "紅傘微光菇" },
      { id: "f_n5", x: 495, y: 135, type: "mushroom", name: "紅傘微光菇" },
      { id: "f_n6", x: 395, y: 105, type: "flower", name: "翠風太陽花" },
      { id: "f_n7", x: 525, y: 95,  type: "chest", name: "北方森林寶箱" },
      { id: "f_n8", x: 375, y: 515, type: "crystal", name: "藍晶鐵礦簇" },
      { id: "f_n9", x: 445, y: 555, type: "crystal", name: "藍晶鐵礦簇" },
      { id: "f_n10",x: 515, y: 520, type: "crystal", name: "藍晶鐵礦簇" },
      { id: "f_n12",x: 485, y: 608, type: "chest", legendary: true, name: "巨石後傳說寶箱" },
      { id: "f_n13",x: 215, y: 310, type: "flower", name: "翠風太陽花" },
      { id: "f_n14",x: 155, y: 385, type: "mushroom", name: "紅傘微光菇" },
      { id: "f_n15",x: 105, y: 325, type: "crystal", name: "藍晶鐵礦簇" },
      { id: "f_n16",x: 112, y: 472, type: "chest", legendary: true, name: "枯木後傳說紫晶箱" },
      { id: "f_n17",x: 745, y: 265, type: "crystal", perfect: true, name: "✨閃光秘銀礦簇" },
      { id: "f_n18",x: 795, y: 395, type: "flower", name: "河岸太陽靈花" },
      { id: "f_n20",x: 785, y: 145, type: "chest", legendary: true, name: "河畔抓鉤秘境寶箱" }
    ];
    rawNodes.forEach(n => placer.tryAdd(nodes, n, 20));

    const rawMonsters = assignWildShiny([
      { id: "m_f1", x: 432, y: 168, lv: 2, type: "bamboo", name: "翠風竹子妖" },
      { id: "m_f2", x: 355, y: 475, lv: 3, type: "bamboo", name: "礦道竹子精" },
      { id: "m_f3", x: 465, y: 515, lv: 4, type: "bamboo", name: "礦區竹子守衛" },
      { id: "m_f4", x: 185, y: 345, lv: 5, type: "skull",  name: "古樹骷髏斥候" },
      { id: "m_f5", x: 745, y: 332, lv: 8, type: "skull",  name: "河岸骷髏衛隊長" },
      { id: "m_f6", x: 775, y: 225, lv: 18, type: "boss", isBoss: true, name: "💀 翡翠河岸赤炎王" }
    ]);
    rawMonsters.forEach(m => placer.tryAdd(monsters, m, 24));

    for (let x = 8; x < 880; x += 36) {
      if (Math.abs(x - 435) > 45) placer.tryAdd(trees, { x, y: 8 }, 20);
      if (Math.abs(x - 435) > 45) placer.tryAdd(trees, { x: x + 12, y: 655 }, 20);
    }
    for (let y = 40; y < 640; y += 36) {
      placer.tryAdd(trees, { x: 8, y }, 20);
      if (Math.abs(y - 332) > 45) placer.tryAdd(trees, { x: 856, y }, 20);
    }

    return {
      id: "forest_world", name: "翠風大森林", recLv: 1, bgm: "forest", theme: "forest",
      rain: true, fog: false, hasRiver: true, width: 900, height: 700,
      dirtBlobs: [
        { cx: 425, cy: 330, rx: 95, ry: 70 }, { cx: 435, cy: 225, rx: 38, ry: 55 },
        { cx: 435, cy: 120, rx: 65, ry: 55 }, { cx: 435, cy: 445, rx: 40, ry: 55 },
        { cx: 445, cy: 555, rx: 85, ry: 55 }, { cx: 295, cy: 340, rx: 65, ry: 34 },
        { cx: 155, cy: 350, rx: 75, ry: 65 }, { cx: 565, cy: 332, rx: 65, ry: 32 },
        { cx: 765, cy: 332, rx: 72, ry: 85 }
      ],
      groundDetails: generateGroundDetails(900, 700, 65),
      trees, decos, nodes, npcs, monsters, portals
    };
  }

  // ================= 2. 微光蘑菇洞窟 (560x460 — 含🔥點燃火盆驅散迷霧機關 + 🧱炸彈牆) =================
  function buildMushroomCave() {
    const placer = createSpatialPlacer();
    const trees = [], decos = [], nodes = [], monsters = [];
    const portals = [
      { id: "p_cave_out", name: "🚪 返回翠風大森林", x: 280, y: 420, targetZone: "forest_world", targetX: 435, targetY: 95, icon: "stairs" },
      { id: "p_cave_abyss", name: "💀 深淵星隕聖殿 (Lv.25)", x: 280, y: 52, targetZone: "abyss_sanctum", targetX: 280, targetY: 380, icon: "abyss" }
    ];
    portals.forEach(p => placer.reserve(p.x, p.y, 35));

    const caveDecos = [
      { id: "brz_cave_1", x: 280, y: 335, sprite: "brazier_off", w: 18, h: 18, solid: true, isBrazier: true },
      { x: 145, y: 155, sprite: "cracked_wall", w: 24, h: 24, solid: true, isCrackedWall: true, id: "cw_cave_1" }
    ];
    caveDecos.forEach(d => placer.tryAdd(decos, d, 22));

    const caveNodes = [
      { id: "c_n1", x: 165, y: 295, type: "crystal", perfect: true, name: "✨洞窟閃光秘銀礦" },
      { id: "c_n2", x: 395, y: 295, type: "crystal", perfect: true, name: "✨洞窟閃光秘銀礦" },
      { id: "c_n3", x: 195, y: 195, type: "mushroom", name: "夜光紅傘菇" },
      { id: "c_n4", x: 365, y: 195, type: "mushroom", name: "夜光紅傘菇" },
      { id: "c_n5", x: 435, y: 115, type: "crystal", perfect: true, name: "✨深層秘銀礦簇" },
      { id: "c_n6", x: 95,  y: 95,  type: "chest", legendary: true, name: "炸彈密室傳說寶箱" }
    ];
    caveNodes.forEach(n => placer.tryAdd(nodes, n, 22));

    const caveMonsters = assignWildShiny([
      { id: "m_c1", x: 280, y: 265, lv: 5, type: "skull", name: "洞窟骷髏衛兵" },
      { id: "m_c2", x: 185, y: 235, lv: 6, type: "bamboo", name: "變異夜光竹妖" },
      { id: "m_c3", x: 375, y: 235, lv: 6, type: "skull", name: "洞窟骷髏弓手" },
      { id: "m_c4", x: 280, y: 115, lv: 9, type: "skull", isBoss: true, name: "💀 洞窟骷髏統領" }
    ]);
    caveMonsters.forEach(m => placer.tryAdd(monsters, m, 24));

    for (let x = 12; x < 540; x += 38) {
      placer.tryAdd(trees, { x, y: 10 }, 20);
      placer.tryAdd(trees, { x, y: 425 }, 20);
    }

    return {
      id: "mushroom_cave", name: "微光蘑菇洞窟", recLv: 5, bgm: "canyon", theme: "cave",
      rain: false, fog: true, hasRiver: false, width: 560, height: 460,
      dirtBlobs: [{ cx: 280, cy: 240, rx: 195, ry: 165 }],
      groundDetails: generateGroundDetails(560, 460, 30),
      trees, decos, nodes, npcs: [], monsters, portals
    };
  }

  // ================= 3. 流沙繩索大峽谷 (800x600 — 連通極寒雪原與熔岩火山) =================
  function buildCanyonWorld() {
    const placer = createSpatialPlacer();
    const trees = [], decos = [], nodes = [], npcs = [], monsters = [];
    const portals = [
      { id: "p_can_back",  name: "🌲 返回翠風大森林", x: 55,  y: 335, targetZone: "forest_world",    targetX: 795, targetY: 332, icon: "stairs" },
      { id: "p_can_snow",  name: "❄️ 霜語極寒雪原 (Lv.45)", x: 400, y: 55,  targetZone: "frost_snowfield", targetX: 350, targetY: 470, icon: "stairs" },
      { id: "p_can_magma", name: "🌋 赤紅熔岩火山帶 (Lv.60)", x: 735, y: 335, targetZone: "magma_volcano",  targetX: 85,  targetY: 280, icon: "abyss" }
    ];
    portals.forEach(p => placer.reserve(p.x, p.y, 36));

    const canyonDecos = [
      { x: 385, y: 275, sprite: "tent", w: 44, h: 40, solid: true },
      { x: 442, y: 315, sprite: "campfire", w: 18, h: 18, solid: true },
      { id: "obs_cy_rock", x: 615, y: 175, sprite: "boulder_block", w: 22, h: 20, solid: true, obstacleType: "boulder" }
    ];
    canyonDecos.forEach(d => placer.tryAdd(decos, d, 22));

    placer.tryAdd(npcs, {
      id: "npc_merch_canyon", name: "綠洲行商・奇奇", role: "峽谷秘銀與補給商", sprite: "npc_merchant", badge: "💰", x: 405, y: 325
    }, 24);

    const canyonNodes = [
      { id: "cy_n1", x: 235, y: 215, type: "crystal", perfect: true, name: "✨峽谷秘銀礦簇" },
      { id: "cy_n2", x: 565, y: 195, type: "crystal", perfect: true, name: "✨峽谷秘銀礦簇" },
      { id: "cy_n3", x: 255, y: 465, type: "crystal", perfect: true, name: "✨流沙秘銀礦" },
      { id: "cy_n5", x: 345, y: 165, type: "flower", name: "沙漠太陽靈花" },
      { id: "cy_n6", x: 485, y: 465, type: "flower", name: "綠洲太陽靈花" },
      { id: "cy_n7", x: 655, y: 145, type: "chest", legendary: true, name: "太陽神殿紅金寶箱" }
    ];
    canyonNodes.forEach(n => placer.tryAdd(nodes, n, 22));

    const canyonMonsters = assignWildShiny([
      { id: "m_cy1", x: 275, y: 295, lv: 12, type: "skull", name: "流沙骷髏劍士" },
      { id: "m_cy2", x: 535, y: 285, lv: 14, type: "skull", name: "峽谷骷髏守衛" },
      { id: "m_cy4", x: 655, y: 335, lv: 20, type: "boss", isBoss: true, name: "💀 金字塔守護魔神" }
    ]);
    canyonMonsters.forEach(m => placer.tryAdd(monsters, m, 24));

    for (let x = 16; x < 770; x += 50) {
      if (Math.abs(x - 400) > 48) placer.tryAdd(trees, { x, y: 8 }, 24);
      placer.tryAdd(trees, { x, y: 545 }, 24);
    }

    return {
      id: "canyon_world", name: "流沙繩索大峽谷", recLv: 12, bgm: "canyon", theme: "canyon",
      rain: false, fog: false, hasRiver: false, width: 800, height: 600,
      dirtBlobs: [{ cx: 400, cy: 310, rx: 280, ry: 185 }],
      groundDetails: generateGroundDetails(800, 600, 45),
      trees, decos, nodes, npcs, monsters, portals
    };
  }

  // ================= 4. 新增！翡翠海岸與沉船灣 (700x540 Lv.21 — 含釣魚點、古代帆船、抓鉤孤島) =================
  function buildEmeraldCoast() {
    const placer = createSpatialPlacer();
    const decos = [
      { x: 345, y: 415, sprite: "ancient_ship", w: 42, h: 36, solid: true },
      { id: "fish_c1", x: 215, y: 385, sprite: "fishing_spot", w: 20, h: 16, isFishingSpot: true },
      { id: "fish_c2", x: 485, y: 385, sprite: "fishing_spot", w: 20, h: 16, isFishingSpot: true },
      { id: "grap_c_1", x: 525, y: 285, sprite: "grapple_post", w: 18, h: 20, isGrapple: true, targetX: 605, targetY: 285 },
      { id: "grap_c_2", x: 595, y: 285, sprite: "grapple_post", w: 18, h: 20, isGrapple: true, targetX: 515, targetY: 285 }
    ];
    const nodes = [
      { id: "ec_n1", x: 175, y: 245, type: "crystal", perfect: true, name: "✨潮汐秘銀晶簇" },
      { id: "ec_n2", x: 495, y: 225, type: "flower", name: "海濱太陽靈花" },
      { id: "ec_n3", x: 625, y: 265, type: "chest", legendary: true, name: "沉船灣孤島傳說寶箱" }
    ];
    const monsters = assignWildShiny([
      { id: "m_ec1", x: 255, y: 265, lv: 21, type: "skull", name: "幽靈海盜水手" },
      { id: "m_ec2", x: 445, y: 265, lv: 23, type: "skull", name: "沉船骷髏大副" },
      { id: "m_ec3", x: 350, y: 335, lv: 27, type: "boss", isBoss: true, name: "💀 深海幽靈船長 Lv.27" }
    ]);
    const portals = [
      { id: "p_ec_back", name: "🌲 返回翠風大森林", x: 350, y: 55, targetZone: "forest_world", targetX: 435, targetY: 610, icon: "stairs" },
      { id: "p_ec_sky",  name: "⛵ 乘船前往天界浮空島航線", x: 355, y: 455, targetZone: "sky_archipelago", targetX: 350, targetY: 460, icon: "stairs" }
    ];

    return {
      id: "emerald_coast", name: "翡翠海岸與沉船灣", recLv: 21, bgm: "forest", theme: "coast",
      rain: false, fog: false, hasRiver: false, width: 700, height: 540,
      dirtBlobs: [{ cx: 350, cy: 235, rx: 245, ry: 145 }],
      groundDetails: generateGroundDetails(700, 350, 35),
      trees: [], decos, nodes, npcs: [], monsters, portals
    };
  }

  // ================= 5. 新增！霜語極寒雪原 (700x540 Lv.45 — 盛產🪷雪山冰蓮、❄️永凍冰晶與冰霜龍) =================
  function buildFrostSnowfield() {
    const decos = [
      { x: 345, y: 265, sprite: "campfire", w: 18, h: 18, solid: true },
      { id: "obs_sn_tree", x: 185, y: 195, sprite: "deadtree_block", w: 22, h: 22, solid: true, obstacleType: "deadtree" }
    ];
    const nodes = [
      { id: "sn_n1", x: 215, y: 325, type: "flower", snowLotus: true, name: "🪷 雪山永凍冰蓮" },
      { id: "sn_n2", x: 485, y: 315, type: "flower", snowLotus: true, name: "🪷 雪山永凍冰蓮" },
      { id: "sn_n3", x: 245, y: 165, type: "crystal", perfect: true, name: "❄️ 永凍冰晶礦脈" },
      { id: "sn_n4", x: 465, y: 165, type: "crystal", perfect: true, name: "❄️ 永凍冰晶礦脈" },
      { id: "sn_n5", x: 135, y: 145, type: "chest", legendary: true, name: "冰龍巢穴傳說寶箱" }
    ];
    const monsters = assignWildShiny([
      { id: "m_sn1", x: 265, y: 245, lv: 42, type: "skull", name: "寒霜骷髏騎士" },
      { id: "m_sn2", x: 435, y: 245, lv: 45, type: "bamboo", name: "雪原冰晶雪怪" },
      { id: "m_sn3", x: 350, y: 135, lv: 52, type: "boss", isBoss: true, name: "💀 遠古永凍冰霜龍王 Lv.52" }
    ]);
    const portals = [
      { id: "p_sn_back", name: "🏜️ 返回流沙大峽谷", x: 350, y: 500, targetZone: "canyon_world", targetX: 400, targetY: 90, icon: "stairs" }
    ];

    return {
      id: "frost_snowfield", name: "霜語極寒雪原", recLv: 45, bgm: "canyon", theme: "snow",
      rain: true, fog: false, hasRiver: false, width: 700, height: 540,
      dirtBlobs: [{ cx: 350, cy: 270, rx: 245, ry: 175 }],
      groundDetails: generateGroundDetails(700, 540, 35),
      trees: [{ x: 40, y: 40 }, { x: 620, y: 40 }, { x: 40, y: 460 }, { x: 620, y: 460 }],
      decos, nodes, npcs: [], monsters, portals
    };
  }

  // ================= 6. 新增！赤紅熔岩火山帶 (700x540 Lv.60 — 盛產🔥熔岩黑曜石與神兵素材) =================
  function buildMagmaVolcano() {
    const decos = [
      { id: "obs_mg_1", x: 495, y: 185, sprite: "boulder_block", w: 22, h: 20, solid: true, obstacleType: "boulder" },
      { x: 280, y: 360, sprite: "deco_anvil", w: 18, h: 14, solid: true }
    ];
    const nodes = [
      { id: "mg_n1", x: 225, y: 215, type: "crystal", obsidianNode: true, name: "🔥 熔岩黑曜石簇" },
      { id: "mg_n2", x: 445, y: 225, type: "crystal", obsidianNode: true, name: "🔥 熔岩黑曜石簇" },
      { id: "mg_n3", x: 345, y: 395, type: "crystal", obsidianNode: true, name: "🔥 熔岩黑曜石簇" },
      { id: "mg_n4", x: 545, y: 145, type: "chest", legendary: true, name: "火山熔岩神器寶箱" }
    ];
    const monsters = assignWildShiny([
      { id: "m_mg1", x: 285, y: 275, lv: 56, type: "skull", name: "熔岩黑鎧魔將" },
      { id: "m_mg2", x: 425, y: 285, lv: 58, type: "skull", name: "煉獄炎魔衛士" },
      { id: "m_mg3", x: 545, y: 275, lv: 65, type: "boss", isBoss: true, name: "💀 紅蓮火山龍皇 Lv.65" }
    ]);
    const portals = [
      { id: "p_mg_back", name: "🏜️ 返回流沙大峽谷", x: 50, y: 280, targetZone: "canyon_world", targetX: 690, targetY: 335, icon: "stairs" },
      { id: "p_mg_sky",  name: "🛸 乘飛空艇升往天界浮空島 (Lv.85)", x: 635, y: 280, targetZone: "sky_archipelago", targetX: 350, targetY: 460, icon: "stairs" }
    ];

    return {
      id: "magma_volcano", name: "赤紅熔岩火山帶", recLv: 60, bgm: "abyss", theme: "volcano",
      rain: false, fog: false, hasRiver: false, width: 700, height: 540,
      dirtBlobs: [{ cx: 350, cy: 275, rx: 255, ry: 175 }],
      groundDetails: generateGroundDetails(700, 540, 35),
      trees: [], decos, nodes, npcs: [], monsters, portals
    };
  }

  // ================= 7. 深淵星隕聖殿 (560x460 Lv.25 — 含🔥驅霧火盆) =================
  function buildAbyssSanctum() {
    const decos = [
      { id: "brz_ab_1", x: 280, y: 325, sprite: "brazier_off", w: 18, h: 18, solid: true, isBrazier: true },
      { x: 225, y: 345, sprite: "deco_lantern", w: 16, h: 20, solid: true },
      { x: 335, y: 345, sprite: "deco_lantern", w: 16, h: 20, solid: true }
    ];
    const nodes = [
      { id: "ab_n1", x: 115, y: 115, type: "chest", legendary: true, name: "🟣 深淵星隕神器寶箱" },
      { id: "ab_n2", x: 445, y: 115, type: "chest", legendary: true, name: "🟣 破曉傳說秘寶箱" },
      { id: "ab_n3", x: 135, y: 265, type: "crystal", perfect: true, name: "🌌 深淵星隕鐵礦" },
      { id: "ab_n4", x: 425, y: 265, type: "crystal", perfect: true, name: "🌌 深淵星隕鐵礦" }
    ];
    const monsters = assignWildShiny([
      { id: "m_ab1", x: 280, y: 165, lv: 25, type: "boss", isBoss: true, name: "💀 深淵赤炎龍皇 Lv.25" },
      { id: "m_ab2", x: 175, y: 225, lv: 22, type: "skull", name: "深淵黑鎧死神" },
      { id: "m_ab3", x: 385, y: 225, lv: 22, type: "skull", name: "深淵黑鎧死神" }
    ]);
    const portals = [
      { id: "p_ab_back", name: "🪽 返回翠風大森林營地", x: 280, y: 415, targetZone: "forest_world", targetX: 420, targetY: 345, icon: "stairs" }
    ];

    return {
      id: "abyss_sanctum", name: "深淵星隕聖殿", recLv: 25, bgm: "abyss", theme: "cave",
      rain: false, fog: true, hasRiver: false, width: 560, height: 460,
      dirtBlobs: [{ cx: 280, cy: 235, rx: 195, ry: 160 }],
      groundDetails: generateGroundDetails(560, 460, 28),
      trees: [{ x: 18, y: 12 }, { x: 505, y: 12 }],
      decos, nodes, npcs: [], monsters, portals
    };
  }

  // ================= 8. 新增！天界浮空群島與星辰神殿 (700x540 Lv.85 — 盛產🌳世界樹金葉、🌌星隕鐵) =================
  function buildSkyArchipelago() {
    const decos = [
      { x: 335, y: 405, sprite: "sky_airship", w: 40, h: 32, solid: true },
      { x: 245, y: 215, sprite: "deco_lantern", w: 16, h: 20, solid: true },
      { x: 455, y: 215, sprite: "deco_lantern", w: 16, h: 20, solid: true }
    ];
    const nodes = [
      { id: "sky_n1", x: 195, y: 265, type: "flower", goldLeafNode: true, name: "🌳 世界樹神聖金葉" },
      { id: "sky_n2", x: 505, y: 265, type: "flower", goldLeafNode: true, name: "🌳 世界樹神聖金葉" },
      { id: "sky_n3", x: 215, y: 145, type: "crystal", perfect: true, name: "🌌 天界星隕神鐵" },
      { id: "sky_n4", x: 485, y: 145, type: "crystal", perfect: true, name: "🌌 天界星隕神鐵" },
      { id: "sky_n5", x: 350, y: 85,  type: "chest", legendary: true, name: "👑 破曉天空神殿至高寶箱" }
    ];
    const monsters = assignWildShiny([
      { id: "m_sky1", x: 255, y: 195, lv: 82, type: "skull", name: "星宮黃金聖衛" },
      { id: "m_sky2", x: 445, y: 195, lv: 85, type: "skull", name: "天界審判騎士" },
      { id: "m_sky3", x: 350, y: 145, lv: 95, type: "boss", isBoss: true, name: "👑 破曉星辰神龍皇 Lv.95" }
    ]);
    const portals = [
      { id: "p_sky_back", name: "🛸 乘飛空艇返回曙光營地", x: 350, y: 495, targetZone: "forest_world", targetX: 420, targetY: 345, icon: "stairs" }
    ];

    return {
      id: "sky_archipelago", name: "天界浮空群島", recLv: 85, bgm: "forest", theme: "sky",
      rain: false, fog: false, hasRiver: false, width: 700, height: 540,
      dirtBlobs: [{ cx: 350, cy: 270, rx: 245, ry: 185 }],
      groundDetails: generateGroundDetails(700, 540, 30),
      trees: [{ x: 85, y: 85 }, { x: 585, y: 85 }],
      decos, nodes, npcs: [], monsters, portals
    };
  }

  // ================= 9. 100 層《無盡試煉之塔》Roguelike 動態樓層生成器 =================
  function generateTowerFloor(floorNum = 1) {
    const recLv = Math.max(3, floorNum * 3);
    return {
      id: "endless_tower",
      name: `無盡試煉之塔・第 ${floorNum} 層`,
      floorNum: floorNum,
      recLv: recLv,
      bgm: "abyss",
      theme: (floorNum % 3 === 0) ? "sky" : (floorNum % 2 === 0) ? "canyon" : "cave",
      rain: false,
      fog: (floorNum % 4 === 0),
      hasRiver: false,
      width: 520,
      height: 420,
      dirtBlobs: [{ cx: 260, cy: 210, rx: 185, ry: 145 }],
      groundDetails: generateGroundDetails(520, 420, 25),
      trees: [{ x: 20, y: 20 }, { x: 460, y: 20 }, { x: 20, y: 360 }, { x: 460, y: 360 }],
      decos: [
        { id: `brz_tw_${floorNum}`, x: 255, y: 310, sprite: "brazier_off", w: 18, h: 18, solid: true, isBrazier: true }
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
          isShiny: (floorNum % 2 === 0),
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
    emerald_coast: buildEmeraldCoast(),
    frost_snowfield: buildFrostSnowfield(),
    magma_volcano: buildMagmaVolcano(),
    abyss_sanctum: buildAbyssSanctum(),
    sky_archipelago: buildSkyArchipelago(),
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
      MAPS_DB.emerald_coast = buildEmeraldCoast();
      MAPS_DB.frost_snowfield = buildFrostSnowfield();
      MAPS_DB.magma_volcano = buildMagmaVolcano();
      MAPS_DB.abyss_sanctum = buildAbyssSanctum();
      MAPS_DB.sky_archipelago = buildSkyArchipelago();
    }
  };
})();
