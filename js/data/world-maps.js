/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 線性推進地圖鏈與營地室內地圖庫 (world-maps.js - v3.0)
 * 修正：1.營地改為純安全基地 camp_hub (無野怪，4大核心NPC強制獨立座標100%顯示)
 *       2.新增兩個可進入的大帳篷室內地圖 tent_guild 與 tent_forge
 *       3.改為線性推進：營地 ➔ 翠風森林 ➔ 流沙峽谷 ➔ 翡翠海岸 ➔ 極寒雪原 ➔ 熔岩火山 ➔ 深淵與天界
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

  function generateGroundDetails(width, height, count = 50) {
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
      m.isShiny = (idx === 0) || (Math.random() < 0.12);
    });
    return monsters;
  }

  // ================= 0. 曙光露營基地 (Safe Hub - 無野怪，4大核心NPC 100%獨立顯示 + 兩座可進入的大帳篷) =================
  function buildCampHub() {
    const decos = [
      // 左側公會大帳篷 (走近按 A 鍵或觸發傳送門可進入室內)
      { id: "tent_g_door", x: 180, y: 165, sprite: "tent", w: 44, h: 40, solid: true, isTentDoor: true, targetZone: "tent_guild", targetX: 250, targetY: 340, label: "公會帳篷" },
      // 右側鐵匠工坊大帳篷
      { id: "tent_f_door", x: 520, y: 165, sprite: "tent", w: 44, h: 40, solid: true, isTentDoor: true, targetZone: "tent_forge", targetX: 250, targetY: 340, label: "鐵匠工坊" },
      { x: 350, y: 220, sprite: "campfire", w: 18, h: 18, solid: true },
      { x: 310, y: 225, sprite: "deco_bench", w: 22, h: 12, solid: false },
      { x: 395, y: 225, sprite: "deco_pot", w: 18, h: 18, solid: true },
      { x: 520, y: 280, sprite: "deco_anvil", w: 18, h: 14, solid: true }
    ];

    // 4 大核心 NPC 強制獨立座標，絕不重疊！
    const npcs = [
      { id: "npc_smith", name: "鐵匠大叔・巴爾", role: "武器鍛造 & 工具升級", sprite: "npc_blacksmith", badge: "⚒️", x: 480, y: 265 },
      { id: "npc_astro", name: "星象少女・艾莉婭", role: "星象儀調頻 & 錯題淨化", sprite: "npc_astrologer", badge: "🔮", x: 235, y: 265 },
      { id: "npc_guild", name: "公會會長・雷恩", role: "冒險階級 & 懸賞委託", sprite: "npc_guildmaster", badge: "🛡️", x: 265, y: 175 },
      { id: "npc_merch", name: "神秘行商・奇奇", role: "物資交換與煉金", sprite: "npc_merchant", badge: "💰", x: 435, y: 175 }
    ];

    const nodes = [
      { id: "camp_c1", x: 350, y: 135, type: "crate", name: "營地補給箱" }
    ];

    // 東側出口通往第 1 區：【翠風迷霧森林】
    const portals = [
      { id: "p_camp_to_forest", name: "🌲 東側出口 ➔ 翠風迷霧森林 (Lv.1)", x: 735, y: 225, targetZone: "forest_world", targetX: 65, targetY: 340, icon: "stairs" }
    ];

    return {
      id: "camp_hub", name: "曙光露營基地 (安全區)", recLv: 1, bgm: "forest", theme: "forest",
      rain: false, fog: false, hasRiver: false, width: 780, height: 480,
      dirtBlobs: [{ cx: 390, cy: 240, rx: 320, ry: 180 }],
      groundDetails: generateGroundDetails(780, 480, 40),
      trees: [{ x: 50, y: 30 }, { x: 700, y: 30 }, { x: 50, y: 420 }, { x: 700, y: 420 }],
      decos, nodes, npcs, monsters: [], portals
    };
  }

  // 帳篷室內子地圖 1：公會大廳內部
  function buildTentGuild() {
    return {
      id: "tent_guild", name: "公會大廳內部", recLv: 1, bgm: "forest", theme: "cave",
      rain: false, fog: false, hasRiver: false, width: 500, height: 400,
      dirtBlobs: [{ cx: 250, cy: 200, rx: 200, ry: 150 }],
      groundDetails: [], trees: [],
      decos: [{ x: 225, y: 120, sprite: "deco_rack", w: 20, h: 18, solid: true }],
      nodes: [],
      npcs: [{ id: "npc_guild", name: "公會會長・雷恩", role: "懸賞大廳", sprite: "npc_guildmaster", badge: "🛡️", x: 250, y: 160 }],
      monsters: [],
      portals: [{ id: "p_out_guild", name: "🚪 離開帳篷返回營地", x: 250, y: 370, targetZone: "camp_hub", targetX: 200, targetY: 195, icon: "stairs" }]
    };
  }

  // 帳篷室內子地圖 2：鐵匠工坊內部
  function buildTentForge() {
    return {
      id: "tent_forge", name: "鐵匠工坊內部", recLv: 1, bgm: "forest", theme: "cave",
      rain: false, fog: false, hasRiver: false, width: 500, height: 400,
      dirtBlobs: [{ cx: 250, cy: 200, rx: 200, ry: 150 }],
      groundDetails: [], trees: [],
      decos: [{ x: 240, y: 140, sprite: "deco_anvil", w: 18, h: 14, solid: true }],
      nodes: [],
      npcs: [{ id: "npc_smith", name: "鐵匠大叔・巴爾", role: "鍛造車間", sprite: "npc_blacksmith", badge: "⚒️", x: 250, y: 175 }],
      monsters: [],
      portals: [{ id: "p_out_forge", name: "🚪 離開工坊返回營地", x: 250, y: 370, targetZone: "camp_hub", targetX: 540, targetY: 195, icon: "stairs" }]
    };
  }

  // ================= 1. 翠風迷霧森林 (線性第 1 區) =================
  function buildForestWorld() {
    const placer = createSpatialPlacer();
    const trees = [], decos = [], nodes = [], monsters = [];
    const portals = [
      { id: "p_for_back", name: "⛺ 返回曙光營地", x: 45,  y: 340, targetZone: "camp_hub",    targetX: 710, targetY: 225, icon: "stairs" },
      { id: "p_for_cave", name: "🕳️ 微光蘑菇洞窟 (Lv.5)", x: 420, y: 65,  targetZone: "mushroom_cave", targetX: 280, targetY: 390, icon: "cave" },
      { id: "p_for_next", name: "🏜️ 前往流沙峽谷 (Lv.12)", x: 835, y: 340, targetZone: "canyon_world",  targetX: 65,  targetY: 340, icon: "stairs" }
    ];
    portals.forEach(p => { placer.reserve(p.x, p.y, 32); });

    decos.push(
      { id: "obs_f_tree", x: 215, y: 235, sprite: "deadtree_block", w: 22, h: 22, solid: true, obstacleType: "deadtree" },
      { id: "fish_f1", x: 625, y: 220, sprite: "fishing_spot", w: 20, h: 16, isFishingSpot: true }
    );

    const rawNodes = [
      { id: "f_n1", x: 350, y: 135, type: "mushroom", name: "紅傘微光菇" },
      { id: "f_n2", x: 510, y: 135, type: "flower", name: "翠風太陽花" },
      { id: "f_n3", x: 385, y: 520, type: "crystal", name: "藍晶鐵礦簇" },
      { id: "f_n4", x: 475, y: 520, type: "chest", legendary: true, name: "森林枯木後傳說寶箱" }
    ];
    rawNodes.forEach(n => placer.tryAdd(nodes, n, 22));

    const rawMonsters = assignWildShiny([
      { id: "m_f1", x: 420, y: 180, lv: 2, type: "bamboo", name: "翠風竹子妖" },
      { id: "m_f2", x: 360, y: 460, lv: 3, type: "bamboo", name: "森林竹子守衛" },
      { id: "m_f3", x: 745, y: 340, lv: 6, type: "boss", isBoss: true, name: "💀 翠風森林竹子統帥" }
    ]);
    rawMonsters.forEach(m => placer.tryAdd(monsters, m, 24));

    for (let x = 12; x < 860; x += 38) {
      if (Math.abs(x - 420) > 45) placer.tryAdd(trees, { x, y: 12 }, 20);
      if (Math.abs(x - 420) > 45) placer.tryAdd(trees, { x, y: 645 }, 20);
    }

    return {
      id: "forest_world", name: "翠風迷霧森林", recLv: 2, bgm: "forest", theme: "forest",
      rain: true, fog: false, hasRiver: true, width: 900, height: 700,
      dirtBlobs: [{ cx: 450, cy: 340, rx: 380, ry: 260 }],
      groundDetails: generateGroundDetails(900, 700, 50),
      trees, decos, nodes, npcs: [], monsters, portals
    };
  }

  // ================= 2. 微光蘑菇洞窟 (子迷宮) =================
  function buildMushroomCave() {
    const decos = [
      { id: "brz_cave_1", x: 280, y: 335, sprite: "brazier_off", w: 18, h: 18, solid: true, isBrazier: true },
      { id: "cw_cave_1", x: 145, y: 155, sprite: "cracked_wall", w: 24, h: 24, solid: true, isCrackedWall: true }
    ];
    const nodes = [
      { id: "c_n1", x: 165, y: 295, type: "crystal", perfect: true, name: "✨洞窟閃光秘銀礦" },
      { id: "c_n2", x: 395, y: 295, type: "chest", legendary: true, name: "炸彈密室傳說寶箱" }
    ];
    const monsters = assignWildShiny([
      { id: "m_c1", x: 280, y: 235, lv: 5, type: "skull", name: "洞窟骷髏衛兵" },
      { id: "m_c2", x: 280, y: 115, lv: 9, type: "boss", isBoss: true, name: "💀 洞窟骷髏統領" }
    ]);
    const portals = [
      { id: "p_cave_out", name: "🚪 返回翠風森林", x: 280, y: 420, targetZone: "forest_world", targetX: 420, targetY: 90, icon: "stairs" }
    ];

    return {
      id: "mushroom_cave", name: "微光蘑菇洞窟", recLv: 5, bgm: "canyon", theme: "cave",
      rain: false, fog: true, hasRiver: false, width: 560, height: 460,
      dirtBlobs: [{ cx: 280, cy: 240, rx: 195, ry: 165 }],
      groundDetails: generateGroundDetails(560, 460, 25),
      trees: [], decos, nodes, npcs: [], monsters, portals
    };
  }

  // ================= 3. 流沙繩索大峽谷 (線性第 2 區) =================
  function buildCanyonWorld() {
    const decos = [
      { id: "obs_cy_rock", x: 450, y: 220, sprite: "boulder_block", w: 22, h: 20, solid: true, obstacleType: "boulder" }
    ];
    const nodes = [
      { id: "cy_n1", x: 235, y: 215, type: "crystal", perfect: true, name: "✨峽谷秘銀礦簇" },
      { id: "cy_n2", x: 565, y: 195, type: "chest", legendary: true, name: "太陽神殿紅金寶箱" }
    ];
    const monsters = assignWildShiny([
      { id: "m_cy1", x: 320, y: 250, lv: 12, type: "skull", name: "流沙骷髏劍士" },
      { id: "m_cy2", x: 610, y: 260, lv: 18, type: "boss", isBoss: true, name: "💀 金字塔守護魔神" }
    ]);
    const portals = [
      { id: "p_can_back", name: "🌲 返回翠風森林", x: 55, y: 340, targetZone: "forest_world", targetX: 800, targetY: 340, icon: "stairs" },
      { id: "p_can_next", name: "🏖️ 前往翡翠海岸 (Lv.21)", x: 745, y: 340, targetZone: "emerald_coast", targetX: 65, targetY: 340, icon: "stairs" }
    ];

    return {
      id: "canyon_world", name: "流沙繩索大峽谷", recLv: 12, bgm: "canyon", theme: "canyon",
      rain: false, fog: false, hasRiver: false, width: 800, height: 600,
      dirtBlobs: [{ cx: 400, cy: 310, rx: 320, ry: 220 }],
      groundDetails: generateGroundDetails(800, 600, 40),
      trees: [], decos, nodes, npcs: [], monsters, portals
    };
  }

  // ================= 4. 翡翠海岸與沉船灣 (線性第 3 區) =================
  function buildEmeraldCoast() {
    const decos = [
      { x: 350, y: 415, sprite: "ancient_ship", w: 42, h: 36, solid: true },
      { id: "fish_c1", x: 215, y: 385, sprite: "fishing_spot", w: 20, h: 16, isFishingSpot: true },
      { id: "grap_c_1", x: 525, y: 285, sprite: "grapple_post", w: 18, h: 20, isGrapple: true, targetX: 605, targetY: 285 }
    ];
    const nodes = [
      { id: "ec_n1", x: 175, y: 245, type: "crystal", perfect: true, name: "✨潮汐秘銀晶簇" },
      { id: "ec_n2", x: 625, y: 265, type: "chest", legendary: true, name: "沉船灣孤島傳說寶箱" }
    ];
    const monsters = assignWildShiny([
      { id: "m_ec1", x: 280, y: 265, lv: 21, type: "skull", name: "幽靈海盜水手" },
      { id: "m_ec2", x: 420, y: 265, lv: 27, type: "boss", isBoss: true, name: "💀 深海幽靈船長 Lv.27" }
    ]);
    const portals = [
      { id: "p_ec_back", name: "🏜️ 返回流沙峽谷", x: 55, y: 340, targetZone: "canyon_world", targetX: 710, targetY: 340, icon: "stairs" },
      { id: "p_ec_next", name: "❄️ 前往極寒雪原 (Lv.45)", x: 645, y: 340, targetZone: "frost_snowfield", targetX: 65, targetY: 340, icon: "stairs" }
    ];

    return {
      id: "emerald_coast", name: "翡翠海岸與沉船灣", recLv: 21, bgm: "forest", theme: "coast",
      rain: false, fog: false, hasRiver: false, width: 700, height: 540,
      dirtBlobs: [{ cx: 350, cy: 270, rx: 300, ry: 200 }],
      groundDetails: generateGroundDetails(700, 540, 35),
      trees: [], decos, nodes, npcs: [], monsters, portals
    };
  }

  // ================= 5. 霜語極寒雪原 (線性第 4 區) =================
  function buildFrostSnowfield() {
    const decos = [
      { id: "obs_sn_tree", x: 245, y: 215, sprite: "deadtree_block", w: 22, h: 22, solid: true, obstacleType: "deadtree" }
    ];
    const nodes = [
      { id: "sn_n1", x: 215, y: 325, type: "flower", snowLotus: true, name: "🪷 雪山永凍冰蓮" },
      { id: "sn_n2", x: 485, y: 315, type: "chest", legendary: true, name: "冰龍巢穴傳說寶箱" }
    ];
    const monsters = assignWildShiny([
      { id: "m_sn1", x: 310, y: 260, lv: 42, type: "skull", name: "寒霜骷髏騎士" },
      { id: "m_sn2", x: 510, y: 270, lv: 52, type: "boss", isBoss: true, name: "💀 遠古永凍冰霜龍王 Lv.52" }
    ]);
    const portals = [
      { id: "p_sn_back", name: "🏖️ 返回翡翠海岸", x: 55, y: 340, targetZone: "emerald_coast", targetX: 610, targetY: 340, icon: "stairs" },
      { id: "p_sn_next", name: "🌋 前往熔岩火山 (Lv.60)", x: 645, y: 340, targetZone: "magma_volcano", targetX: 65,  targetY: 340, icon: "stairs" }
    ];

    return {
      id: "frost_snowfield", name: "霜語極寒雪原", recLv: 45, bgm: "canyon", theme: "snow",
      rain: true, fog: false, hasRiver: false, width: 700, height: 540,
      dirtBlobs: [{ cx: 350, cy: 270, rx: 300, ry: 200 }],
      groundDetails: generateGroundDetails(700, 540, 35),
      trees: [], decos, nodes, npcs: [], monsters, portals
    };
  }

  // ================= 6. 赤紅熔岩火山帶 (線性第 5 區) =================
  function buildMagmaVolcano() {
    const decos = [
      { id: "obs_mg_1", x: 420, y: 250, sprite: "boulder_block", w: 22, h: 20, solid: true, obstacleType: "boulder" }
    ];
    const nodes = [
      { id: "mg_n1", x: 225, y: 215, type: "crystal", obsidianNode: true, name: "🔥 熔岩黑曜石簇" },
      { id: "mg_n2", x: 545, y: 245, type: "chest", legendary: true, name: "火山熔岩神器寶箱" }
    ];
    const monsters = assignWildShiny([
      { id: "m_mg1", x: 310, y: 270, lv: 56, type: "skull", name: "熔岩黑鎧魔將" },
      { id: "m_mg2", x: 510, y: 270, lv: 65, type: "boss", isBoss: true, name: "💀 紅蓮火山龍皇 Lv.65" }
    ]);
    const portals = [
      { id: "p_mg_back", name: "❄️ 返回極寒雪原", x: 55, y: 340, targetZone: "frost_snowfield", targetX: 610, targetY: 340, icon: "stairs" },
      { id: "p_mg_sky",  name: "👑 前往天界浮空群島 (終局)", x: 645, y: 340, targetZone: "sky_archipelago", targetX: 65, targetY: 340, icon: "stairs" }
    ];

    return {
      id: "magma_volcano", name: "赤紅熔岩火山帶", recLv: 60, bgm: "abyss", theme: "volcano",
      rain: false, fog: false, hasRiver: false, width: 700, height: 540,
      dirtBlobs: [{ cx: 350, cy: 275, rx: 300, ry: 200 }],
      groundDetails: generateGroundDetails(700, 540, 35),
      trees: [], decos, nodes, npcs: [], monsters, portals
    };
  }

  // ================= 7. 深淵星隕聖殿 (隱藏支線區) =================
  function buildAbyssSanctum() {
    const decos = [
      { id: "brz_ab_1", x: 280, y: 325, sprite: "brazier_off", w: 18, h: 18, solid: true, isBrazier: true }
    ];
    const nodes = [
      { id: "ab_n1", x: 115, y: 115, type: "chest", legendary: true, name: "🟣 深淵星隕神器寶箱" }
    ];
    const monsters = assignWildShiny([
      { id: "m_ab1", x: 280, y: 200, lv: 25, type: "boss", isBoss: true, name: "💀 深淵赤炎龍皇 Lv.25" }
    ]);
    const portals = [
      { id: "p_ab_back", name: "🕳️ 返回蘑菇洞窟", x: 280, y: 415, targetZone: "mushroom_cave", targetX: 280, targetY: 80, icon: "stairs" }
    ];

    return {
      id: "abyss_sanctum", name: "深淵星隕聖殿", recLv: 25, bgm: "abyss", theme: "cave",
      rain: false, fog: true, hasRiver: false, width: 560, height: 460,
      dirtBlobs: [{ cx: 280, cy: 235, rx: 195, ry: 160 }],
      groundDetails: generateGroundDetails(560, 460, 25),
      trees: [], decos, nodes, npcs: [], monsters, portals
    };
  }

  // ================= 8. 天界浮空群島 (終局主線區) =================
  function buildSkyArchipelago() {
    const decos = [
      { x: 335, y: 405, sprite: "sky_airship", w: 40, h: 32, solid: true }
    ];
    const nodes = [
      { id: "sky_n1", x: 195, y: 265, type: "flower", goldLeafNode: true, name: "🌳 世界樹神聖金葉" },
      { id: "sky_n2", x: 350, y: 125, type: "chest", legendary: true, name: "👑 破曉天空神殿至高寶箱" }
    ];
    const monsters = assignWildShiny([
      { id: "m_sky1", x: 350, y: 220, lv: 95, type: "boss", isBoss: true, name: "👑 破曉星辰神龍皇 Lv.95" }
    ]);
    const portals = [
      { id: "p_sky_back", name: "🌋 返回熔岩火山", x: 55, y: 340, targetZone: "magma_volcano", targetX: 610, targetY: 340, icon: "stairs" }
    ];

    return {
      id: "sky_archipelago", name: "天界浮空群島", recLv: 85, bgm: "forest", theme: "sky",
      rain: false, fog: false, hasRiver: false, width: 700, height: 540,
      dirtBlobs: [{ cx: 350, cy: 270, rx: 300, ry: 200 }],
      groundDetails: generateGroundDetails(700, 540, 30),
      trees: [], decos, nodes, npcs: [], monsters, portals
    };
  }

  // ================= 9. 100 層《無盡試煉之塔》 =================
  function generateTowerFloor(floorNum = 1) {
    const recLv = Math.max(3, floorNum * 3);
    return {
      id: "endless_tower", name: `無盡試煉之塔・第 ${floorNum} 層`, floorNum: floorNum, recLv: recLv,
      bgm: "abyss", theme: (floorNum % 3 === 0) ? "sky" : (floorNum % 2 === 0) ? "canyon" : "cave",
      rain: false, fog: (floorNum % 4 === 0), hasRiver: false, width: 520, height: 420,
      dirtBlobs: [{ cx: 260, cy: 210, rx: 185, ry: 145 }],
      groundDetails: generateGroundDetails(520, 420, 20),
      trees: [],
      decos: [{ id: `brz_tw_${floorNum}`, x: 255, y: 310, sprite: "brazier_off", w: 18, h: 18, solid: true, isBrazier: true }],
      nodes: [{ id: `tw_n1_${floorNum}`, x: 255, y: 185, type: "chest", legendary: true, name: `第 ${floorNum} 層試煉寶箱` }],
      npcs: [],
      monsters: [{ id: `tw_boss_${floorNum}`, x: 255, y: 145, lv: recLv, type: "boss", isBoss: true, isShiny: true, name: `💀 第 ${floorNum} 層守關魔神` }],
      portals: [
        { id: "p_tw_next", name: `⬆️ 登上第 ${floorNum + 1} 層`, x: 255, y: 55, targetZone: "endless_tower_next", targetX: 250, targetY: 350, icon: "stairs" },
        { id: "p_tw_exit", name: "⛺ 撤退返回曙光營地", x: 255, y: 385, targetZone: "camp_hub", targetX: 250, targetY: 220, icon: "stairs" }
      ]
    };
  }

  const MAPS_DB = {
    camp_hub: buildCampHub(),
    tent_guild: buildTentGuild(),
    tent_forge: buildTentForge(),
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
      return MAPS_DB[zoneId] || MAPS_DB.camp_hub;
    },
    advanceTowerFloor(nextFloor) {
      MAPS_DB.endless_tower = generateTowerFloor(nextFloor);
      return MAPS_DB.endless_tower;
    },
    refreshAllResources() {
      MAPS_DB.camp_hub = buildCampHub();
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
