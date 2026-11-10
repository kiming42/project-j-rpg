/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 遞進式世界地圖鏈、可進入帳篷室內與巡邏怪物配置 (world-maps.js - v3.0)
 * 結構：0.曙光營地(安全基地+可進入2座帳篷室內+4大NPC 100%顯示)
 *       ➔ 第1區:翠風迷霧森林 (子迷宮:微光蘑菇洞窟)
 *       ➔ 第2區:流沙繩索峽谷 ➔ 第3區:翡翠沉船海岸 ➔ 第4區:霜語極寒雪原
 *       ➔ 第5區:赤紅熔岩火山 ➔ 第6區:天界浮空聖殿 & 100層無盡試煉之塔
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  function generateGroundDetails(width, height, count = 40) {
    const pebbles = [];
    for (let i = 0; i < count; i++) {
      pebbles.push({
        x: 36 + ((i * 137) % (width - 72)),
        y: 36 + ((i * 293) % (height - 72)),
        kind: (i % 3 === 0) ? "tuft" : (i % 3 === 1) ? "pebble" : "puddle"
      });
    }
    return pebbles;
  }

  // 初始化野外魔物的 AI 巡邏參數 (供 Part 3 巡邏走動與接近加速追擊 AI 使用)
  function initPatrolMonsters(list) {
    return list.map((m, idx) => {
      const ang = (idx * 1.7) % (Math.PI * 2);
      return Object.assign({}, m, {
        alive: true,
        homeX: m.x,
        homeY: m.y,
        vx: Math.cos(ang) * 0.45,
        vy: Math.sin(ang) * 0.45,
        aggro: false,
        patrolTimer: 40 + (idx * 25),
        isShiny: Boolean(m.isShiny) || (idx === 1) || (Math.random() < 0.12)
      });
    });
  }

  // ================= 第 0 區：曙光露營基地 (500x380 純安全基地，4大NPC 100%顯示，2座帳篷可進入！) =================
  function buildCampHub() {
    const trees = [];
    for (let x = 8; x < 480; x += 36) {
      trees.push({ x, y: 6 });
      trees.push({ x, y: 338 });
    }
    for (let y = 40; y < 330; y += 36) {
      trees.push({ x: 8, y });
      // 東側留出通往「第一區：翠風森林」的寬敞大門通道 (y: 160 ~ 250)
      if (y < 145 || y > 255) trees.push({ x: 458, y });
    }

    const decos = [
      // 左上：冒險者公會大帳篷 (門口有進入傳送點)
      { x: 135, y: 78, sprite: "tent", w: 48, h: 44, solid: true },
      // 右上：鐵匠工坊大帳篷 (門口有進入傳送點)
      { x: 315, y: 78, sprite: "tent", w: 48, h: 44, solid: true },
      // 中央營火、原木長凳與滾燙燉肉鍋
      { x: 242, y: 195, sprite: "campfire", w: 18, h: 18, solid: true },
      { x: 204, y: 198, sprite: "deco_bench", w: 22, h: 12, solid: false },
      { x: 272, y: 195, sprite: "deco_pot", w: 18, h: 18, solid: true },
      // 鐵匠戶外打鐵砧與武器展示架
      { x: 372, y: 135, sprite: "deco_anvil", w: 18, h: 14, solid: true },
      { x: 396, y: 128, sprite: "deco_rack", w: 20, h: 18, solid: true },
      // 營地石燈籠與東門指路木牌
      { x: 112, y: 185, sprite: "deco_lantern", w: 16, h: 20, solid: true },
      { x: 405, y: 175, sprite: "deco_sign", w: 18, h: 18, solid: true },
      { x: 405, y: 235, sprite: "deco_lantern", w: 16, h: 20, solid: true }
    ];

    // 4 大核心 NPC 強制獨立座標 (100% 保證顯示，絕不被過濾！)
    const npcs = [
      { id: "npc_smith", name: "鐵匠大叔・巴爾", role: "神兵鍛造 & 工具升級", sprite: "npc_blacksmith", badge: "[鐵匠]", x: 348, y: 142 },
      { id: "npc_guild", name: "公會會長・雷恩", role: "委託接取 & 冒險階級", sprite: "npc_guildmaster", badge: "[公會]", x: 172, y: 142 },
      { id: "npc_astro", name: "星象少女・艾莉婭", role: "四科調頻 & 錯題淨化", sprite: "npc_astrologer", badge: "[星象]", x: 138, y: 228 },
      { id: "npc_merch", name: "神秘行商・奇奇", role: "稀有藥水 & 煉金交換", sprite: "npc_merchant", badge: "[行商]", x: 348, y: 232 }
    ];

    // 營地新手補給箱与靈草
    const nodes = [
      { id: "camp_box1", x: 295, y: 132, type: "crate", name: "鐵匠鋪補給木箱" },
      { id: "camp_herb1", x: 145, y: 285, type: "mushroom", name: "營地紅傘菇" },
      { id: "camp_flw1",  x: 335, y: 285, type: "flower", name: "營地太陽花" }
    ];

    // 傳送門：可步行進入公會帳篷室內、鐵匠帳篷室內、或由東門步行前往「第一區：翠風迷霧森林」
    const portals = [
      { id: "p_enter_guild_tent", name: "進入【公會帳篷】", x: 159, y: 122, targetZone: "tent_guild", targetX: 160, targetY: 185, icon: "door" },
      { id: "p_enter_forge_tent", name: "進入【鐵匠帳篷】", x: 339, y: 122, targetZone: "tent_forge", targetX: 160, targetY: 185, icon: "door" },
      { id: "p_camp_to_z1", name: "前往【第一區：翠風森林】➔", x: 465, y: 205, targetZone: "zone1_forest", targetX: 65, targetY: 270, icon: "stairs" }
    ];

    return {
      id: "camp_hub", name: "0. 曙光露營基地", recLv: 1, bgm: "forest", theme: "forest",
      rain: false, fog: false, hasRiver: false, width: 500, height: 380,
      dirtBlobs: [
        { cx: 250, cy: 205, rx: 145, ry: 95 },
        { cx: 410, cy: 205, rx: 75, ry: 32 }
      ],
      groundDetails: generateGroundDetails(500, 380, 28),
      trees, decos, nodes, npcs, monsters: [], portals
    };
  }

  // ================= 室內子地圖 A：公會大帳篷內部 (320x240) =================
  function buildTentGuildInterior() {
    return {
      id: "tent_guild", name: "公會帳篷內部", recLv: 1, bgm: "forest", theme: "canyon",
      rain: false, fog: false, hasRiver: false, width: 320, height: 240,
      dirtBlobs: [{ cx: 160, cy: 120, rx: 135, ry: 90 }],
      groundDetails: [],
      trees: [],
      decos: [
        { x: 85,  y: 55, sprite: "deco_lantern", w: 16, h: 20, solid: true },
        { x: 220, y: 55, sprite: "deco_lantern", w: 16, h: 20, solid: true },
        { x: 148, y: 105, sprite: "deco_bench", w: 26, h: 14, solid: true }
      ],
      nodes: [
        { id: "tg_box1", x: 75, y: 95, type: "crate", name: "公會儲備物資箱" },
        { id: "tg_chest1", x: 230, y: 95, type: "chest", name: "公會見習補給箱" }
      ],
      npcs: [
        { id: "npc_guild", name: "公會會長・雷恩", role: "委託接取 & 冒險階級", sprite: "npc_guildmaster", badge: "[公會]", x: 152, y: 72 }
      ],
      monsters: [],
      portals: [
        { id: "p_exit_guild_tent", name: "離開帳篷返回營地", x: 160, y: 215, targetZone: "camp_hub", targetX: 159, targetY: 148, icon: "stairs" }
      ]
    };
  }

  // ================= 室內子地圖 B：鐵匠工坊大帳篷內部 (320x240) =================
  function buildTentForgeInterior() {
    return {
      id: "tent_forge", name: "鐵匠帳篷內部", recLv: 1, bgm: "forest", theme: "canyon",
      rain: false, fog: false, hasRiver: false, width: 320, height: 240,
      dirtBlobs: [{ cx: 160, cy: 120, rx: 135, ry: 90 }],
      groundDetails: [],
      trees: [],
      decos: [
        { x: 115, y: 82, sprite: "deco_anvil", w: 20, h: 16, solid: true },
        { x: 195, y: 76, sprite: "deco_rack", w: 22, h: 20, solid: true },
        { x: 152, y: 52, sprite: "campfire", w: 18, h: 18, solid: true }
      ],
      nodes: [
        { id: "tf_box1", x: 72, y: 105, type: "crate", name: "鍛造鐵礦箱" },
        { id: "tf_box2", x: 232, y: 105, type: "crystal", name: "工坊藍晶礦樣本" }
      ],
      npcs: [
        { id: "npc_smith", name: "鐵匠大叔・巴爾", role: "神兵鍛造 & 工具升級", sprite: "npc_blacksmith", badge: "[鐵匠]", x: 152, y: 82 }
      ],
      monsters: [],
      portals: [
        { id: "p_exit_forge_tent", name: "離開帳篷返回營地", x: 160, y: 215, targetZone: "camp_hub", targetX: 339, targetY: 148, icon: "stairs" }
      ]
    };
  }

  // ================= 第 1 區：翠風迷霧森林 (760x540 Lv.1~5) =================
  function buildZone1Forest() {
    const trees = [];
    for (let x = 8; x < 740; x += 38) {
      if (Math.abs(x - 380) > 48) trees.push({ x, y: 8 });
      trees.push({ x, y: 498 });
    }
    for (let y = 40; y < 480; y += 38) {
      if (Math.abs(y - 270) > 48) trees.push({ x: 8, y });
      if (Math.abs(y - 270) > 48) trees.push({ x: 718, y });
    }
    // 森林內部樹叢
    [{x:220,y:150},{x:255,y:165},{x:230,y:370},{x:265,y:385},{x:480,y:155},{x:515,y:170}].forEach(t => trees.push(t));

    const decos = [
      { x: 95, y: 235, sprite: "deco_sign", w: 18, h: 18, solid: true },
      { id: "fish_z1", x: 538, y: 210, sprite: "fishing_spot", w: 20, h: 16, isFishingSpot: true },
      { id: "grap_z1_w", x: 536, y: 135, sprite: "grapple_post", w: 18, h: 20, isGrapple: true, targetX: 615, targetY: 135 },
      { id: "grap_z1_e", x: 610, y: 135, sprite: "grapple_post", w: 18, h: 20, isGrapple: true, targetX: 530, targetY: 135 },
      { id: "obs_z1_tree", x: 185, y: 425, sprite: "deadtree_block", w: 22, h: 22, solid: true, obstacleType: "deadtree" },
      { id: "obs_z1_rock", x: 635, y: 395, sprite: "boulder_block", w: 22, h: 20, solid: true, obstacleType: "boulder" }
    ];

    const nodes = [
      { id: "z1_n1", x: 165, y: 215, type: "mushroom", name: "紅傘微光菇" },
      { id: "z1_n2", x: 315, y: 135, type: "mushroom", name: "紅傘微光菇" },
      { id: "z1_n3", x: 295, y: 345, type: "flower", name: "翠風太陽花" },
      { id: "z1_n4", x: 445, y: 385, type: "flower", name: "翠風太陽花" },
      { id: "z1_n5", x: 335, y: 435, type: "crystal", name: "藍晶鐵礦簇" },
      { id: "z1_n6", x: 425, y: 445, type: "crystal", name: "藍晶鐵礦簇" },
      { id: "z1_n7", x: 495, y: 420, type: "crystal", name: "藍晶鐵礦簇" },
      { id: "z1_n8", x: 135, y: 455, type: "chest", legendary: true, name: "枯木秘境傳說寶箱" },
      { id: "z1_n9", x: 655, y: 125, type: "chest", legendary: true, name: "河東抓鉤傳說寶箱" },
      { id: "z1_n10",x: 665, y: 435, type: "crystal", perfect: true, name: "閃光秘銀礦簇" }
    ];

    const monsters = initPatrolMonsters([
      { id: "m_z1_1", x: 235, y: 255, lv: 2, type: "bamboo", name: "翠風竹子妖" },
      { id: "m_z1_2", x: 385, y: 195, lv: 3, type: "bamboo", name: "迷霧竹子精" },
      { id: "m_z1_3", x: 395, y: 365, lv: 4, type: "bamboo", name: "礦道竹子守衛" },
      { id: "m_z1_4", x: 645, y: 270, lv: 5, type: "skull",  name: "河東橋頭骷髏兵" }
    ]);

    const portals = [
      { id: "p_z1_to_camp", name: "⬅ 返回【0.曙光營地】", x: 36, y: 270, targetZone: "camp_hub", targetX: 430, targetY: 205, icon: "stairs" },
      { id: "p_z1_to_cave", name: "進入【1-B 微光蘑菇洞窟】", x: 380, y: 48, targetZone: "cave1_mushroom", targetX: 280, targetY: 390, icon: "cave" },
      { id: "p_z1_to_z2",   name: "前往【第二區：流沙峽谷】➔", x: 715, y: 270, targetZone: "zone2_canyon", targetX: 65, targetY: 270, icon: "stairs" }
    ];

    return {
      id: "zone1_forest", name: "1. 翠風迷霧森林", recLv: 2, bgm: "forest", theme: "forest",
      rain: true, fog: false, hasRiver: true, riverX: 555, bridgeY: 250, width: 760, height: 540,
      dirtBlobs: [
        { cx: 280, cy: 270, rx: 220, ry: 65 },
        { cx: 380, cy: 150, rx: 65, ry: 95 },
        { cx: 410, cy: 400, rx: 95, ry: 65 },
        { cx: 640, cy: 270, rx: 75, ry: 95 }
      ],
      groundDetails: generateGroundDetails(760, 540, 45),
      trees, decos, nodes, npcs: [], monsters, portals
    };
  }

  // ================= 第 1-B 子迷宮：微光蘑菇洞窟 (560x460 Lv.5~9) =================
  function buildCave1Mushroom() {
    const decos = [
      { id: "brz_cave_1", x: 280, y: 335, sprite: "brazier_off", w: 18, h: 18, solid: true, isBrazier: true },
      { id: "cw_cave_1",  x: 145, y: 155, sprite: "cracked_wall", w: 24, h: 24, solid: true, isCrackedWall: true }
    ];
    const nodes = [
      { id: "c1_n1", x: 165, y: 295, type: "crystal", perfect: true, name: "閃光秘銀礦簇" },
      { id: "c1_n2", x: 395, y: 295, type: "crystal", perfect: true, name: "閃光秘銀礦簇" },
      { id: "c1_n3", x: 195, y: 195, type: "mushroom", name: "夜光紅傘菇" },
      { id: "c1_n4", x: 365, y: 195, type: "mushroom", name: "夜光紅傘菇" },
      { id: "c1_n5", x: 95,  y: 95,  type: "chest", legendary: true, name: "炸彈密室傳說寶箱" }
    ];
    const monsters = initPatrolMonsters([
      { id: "m_c1_1", x: 280, y: 255, lv: 5, type: "skull", name: "洞窟骷髏衛兵" },
      { id: "m_c1_2", x: 195, y: 235, lv: 6, type: "bamboo", name: "變異夜光竹妖" },
      { id: "m_c1_3", x: 280, y: 115, lv: 9, type: "skull", isBoss: true, name: "洞窟骷髏統領" }
    ]);
    const portals = [
      { id: "p_cave_back", name: "返回【1.翠風迷霧森林】", x: 280, y: 420, targetZone: "zone1_forest", targetX: 380, targetY: 85, icon: "stairs" }
    ];

    return {
      id: "cave1_mushroom", name: "1-B. 微光蘑菇洞窟", recLv: 5, bgm: "canyon", theme: "cave",
      rain: false, fog: true, hasRiver: false, width: 560, height: 460,
      dirtBlobs: [{ cx: 280, cy: 240, rx: 195, ry: 165 }],
      groundDetails: generateGroundDetails(560, 460, 25),
      trees: [{ x: 16, y: 14 }, { x: 505, y: 14 }],
      decos, nodes, npcs: [], monsters, portals
    };
  }

  // ================= 第 2 區：流沙繩索大峽谷 (720x520 Lv.10~18) =================
  function buildZone2Canyon() {
    const trees = [];
    for (let x = 16; x < 700; x += 52) {
      trees.push({ x, y: 8 }, { x, y: 472 });
    }
    const decos = [
      { x: 350, y: 245, sprite: "campfire", w: 18, h: 18, solid: true },
      { id: "obs_z2_rock", x: 545, y: 155, sprite: "boulder_block", w: 22, h: 20, solid: true, obstacleType: "boulder" }
    ];
    const nodes = [
      { id: "z2_n1", x: 215, y: 175, type: "crystal", perfect: true, name: "峽谷秘銀礦簇" },
      { id: "z2_n2", x: 485, y: 185, type: "crystal", perfect: true, name: "峽谷秘銀礦簇" },
      { id: "z2_n3", x: 245, y: 385, type: "flower", name: "綠洲太陽花" },
      { id: "z2_n4", x: 475, y: 385, type: "flower", name: "綠洲太陽花" },
      { id: "z2_n5", x: 595, y: 125, type: "chest", legendary: true, name: "太陽金字塔秘寶箱" }
    ];
    const monsters = initPatrolMonsters([
      { id: "m_z2_1", x: 245, y: 270, lv: 10, type: "skull", name: "流沙骷髏刀客" },
      { id: "m_z2_2", x: 445, y: 265, lv: 12, type: "skull", name: "峽谷骷髏守衛" },
      { id: "m_z2_3", x: 585, y: 270, lv: 16, type: "boss", isBoss: true, name: "金字塔守護魔神" }
    ]);
    const portals = [
      { id: "p_z2_to_z1", name: "⬅ 返回【第一區：翠風森林】", x: 36, y: 270, targetZone: "zone1_forest", targetX: 675, targetY: 270, icon: "stairs" },
      { id: "p_z2_to_z3", name: "前往【第三區：翡翠海岸】➔", x: 675, y: 270, targetZone: "zone3_coast", targetX: 65, targetY: 260, icon: "stairs" }
    ];

    return {
      id: "zone2_canyon", name: "2. 流沙繩索峽谷", recLv: 10, bgm: "canyon", theme: "canyon",
      rain: false, fog: false, hasRiver: false, width: 720, height: 520,
      dirtBlobs: [{ cx: 360, cy: 265, rx: 275, ry: 175 }],
      groundDetails: generateGroundDetails(720, 520, 35),
      trees, decos, nodes, npcs: [], monsters, portals
    };
  }

  // ================= 第 3 區：翡翠沉船海岸 (700x520 Lv.20~30) =================
  function buildZone3Coast() {
    const decos = [
      { x: 345, y: 405, sprite: "ancient_ship", w: 42, h: 36, solid: true },
      { id: "fish_z3_1", x: 215, y: 365, sprite: "fishing_spot", w: 20, h: 16, isFishingSpot: true },
      { id: "fish_z3_2", x: 485, y: 365, sprite: "fishing_spot", w: 20, h: 16, isFishingSpot: true },
      { id: "grap_z3_1", x: 515, y: 185, sprite: "grapple_post", w: 18, h: 20, isGrapple: true, targetX: 595, targetY: 185 },
      { id: "grap_z3_2", x: 585, y: 185, sprite: "grapple_post", w: 18, h: 20, isGrapple: true, targetX: 505, targetY: 185 }
    ];
    const nodes = [
      { id: "z3_n1", x: 185, y: 215, type: "crystal", perfect: true, name: "潮汐秘銀晶簇" },
      { id: "z3_n2", x: 465, y: 215, type: "flower", name: "海濱太陽花" },
      { id: "z3_n3", x: 625, y: 165, type: "chest", legendary: true, name: "沉船孤島傳說寶箱" }
    ];
    const monsters = initPatrolMonsters([
      { id: "m_z3_1", x: 255, y: 265, lv: 20, type: "skull", name: "幽靈海盜水手" },
      { id: "m_z3_2", x: 435, y: 265, lv: 23, type: "skull", name: "沉船骷髏大副" },
      { id: "m_z3_3", x: 565, y: 265, lv: 28, type: "boss", isBoss: true, name: "深海幽靈船長" }
    ]);
    const portals = [
      { id: "p_z3_to_z2", name: "⬅ 返回【第二區：流沙峽谷】", x: 36, y: 260, targetZone: "zone2_canyon", targetX: 635, targetY: 270, icon: "stairs" },
      { id: "p_z3_to_z4", name: "前往【第四區：霜語雪原】➔", x: 655, y: 260, targetZone: "zone4_snow", targetX: 65, targetY: 260, icon: "stairs" }
    ];

    return {
      id: "zone3_coast", name: "3. 翡翠沉船海岸", recLv: 20, bgm: "forest", theme: "coast",
      rain: false, fog: false, hasRiver: false, width: 700, height: 520,
      dirtBlobs: [{ cx: 350, cy: 250, rx: 265, ry: 155 }],
      groundDetails: generateGroundDetails(700, 360, 30),
      trees: [], decos, nodes, npcs: [], monsters, portals
    };
  }

  // ================= 第 4 區：霜語極寒雪原 (700x520 Lv.35~50) =================
  function buildZone4Snow() {
    const decos = [
      { x: 345, y: 260, sprite: "campfire", w: 18, h: 18, solid: true },
      { id: "obs_z4_tree", x: 195, y: 175, sprite: "deadtree_block", w: 22, h: 22, solid: true, obstacleType: "deadtree" }
    ];
    const nodes = [
      { id: "z4_n1", x: 225, y: 335, type: "flower", snowLotus: true, name: "雪山永凍冰蓮" },
      { id: "z4_n2", x: 475, y: 335, type: "flower", snowLotus: true, name: "雪山永凍冰蓮" },
      { id: "z4_n3", x: 350, y: 155, type: "crystal", perfect: true, name: "永凍冰晶礦脈" },
      { id: "z4_n4", x: 145, y: 135, type: "chest", legendary: true, name: "冰龍巢穴傳說寶箱" }
    ];
    const monsters = initPatrolMonsters([
      { id: "m_z4_1", x: 255, y: 245, lv: 35, type: "skull", name: "寒霜骷髏騎士" },
      { id: "m_z4_2", x: 445, y: 245, lv: 40, type: "bamboo", name: "極地冰晶雪怪" },
      { id: "m_z4_3", x: 565, y: 260, lv: 48, type: "boss", isBoss: true, name: "遠古永凍冰霜龍王" }
    ]);
    const portals = [
      { id: "p_z4_to_z3", name: "⬅ 返回【第三區：翡翠海岸】", x: 36, y: 260, targetZone: "zone3_coast", targetX: 615, targetY: 260, icon: "stairs" },
      { id: "p_z4_to_z5", name: "前往【第五區：熔岩火山】➔", x: 655, y: 260, targetZone: "zone5_volcano", targetX: 65, targetY: 260, icon: "stairs" }
    ];

    return {
      id: "zone4_snow", name: "4. 霜語極寒雪原", recLv: 35, bgm: "canyon", theme: "snow",
      rain: true, fog: false, hasRiver: false, width: 700, height: 520,
      dirtBlobs: [{ cx: 350, cy: 260, rx: 265, ry: 170 }],
      groundDetails: generateGroundDetails(700, 520, 30),
      trees: [{ x: 30, y: 25 }, { x: 630, y: 25 }], decos, nodes, npcs: [], monsters, portals
    };
  }

  // ================= 第 5 區：赤紅熔岩火山帶 (700x520 Lv.55~75) =================
  function buildZone5Volcano() {
    const decos = [
      { id: "obs_z5_rock", x: 495, y: 175, sprite: "boulder_block", w: 22, h: 20, solid: true, obstacleType: "boulder" }
    ];
    const nodes = [
      { id: "z5_n1", x: 225, y: 195, type: "crystal", obsidianNode: true, name: "熔岩黑曜石簇" },
      { id: "z5_n2", x: 445, y: 345, type: "crystal", obsidianNode: true, name: "熔岩黑曜石簇" },
      { id: "z5_n3", x: 545, y: 135, type: "chest", legendary: true, name: "火山熔岩神器寶箱" }
    ];
    const monsters = initPatrolMonsters([
      { id: "m_z5_1", x: 265, y: 265, lv: 55, type: "skull", name: "熔岩黑鎧魔將" },
      { id: "m_z5_2", x: 435, y: 265, lv: 62, type: "skull", name: "煉獄炎魔衛士" },
      { id: "m_z5_3", x: 565, y: 260, lv: 72, type: "boss", isBoss: true, name: "紅蓮火山龍皇" }
    ]);
    const portals = [
      { id: "p_z5_to_z4", name: "⬅ 返回【第四區：霜語雪原】", x: 36, y: 260, targetZone: "zone4_snow", targetX: 615, targetY: 260, icon: "stairs" },
      { id: "p_z5_to_z6", name: "前往【第六區：天界聖殿】➔", x: 655, y: 260, targetZone: "zone6_sky", targetX: 65, targetY: 260, icon: "stairs" }
    ];

    return {
      id: "zone5_volcano", name: "5. 赤紅熔岩火山", recLv: 55, bgm: "abyss", theme: "volcano",
      rain: false, fog: false, hasRiver: false, width: 700, height: 520,
      dirtBlobs: [{ cx: 350, cy: 260, rx: 265, ry: 170 }],
      groundDetails: generateGroundDetails(700, 520, 30),
      trees: [], decos, nodes, npcs: [], monsters, portals
    };
  }

  // ================= 第 6 區：天界浮空群島與無盡之塔入口 (700x520 Lv.80~100) =================
  function buildZone6Sky() {
    const decos = [
      { x: 335, y: 395, sprite: "sky_airship", w: 40, h: 32, solid: true },
      { x: 245, y: 195, sprite: "deco_lantern", w: 16, h: 20, solid: true },
      { x: 455, y: 195, sprite: "deco_lantern", w: 16, h: 20, solid: true }
    ];
    const nodes = [
      { id: "z6_n1", x: 215, y: 315, type: "flower", goldLeafNode: true, name: "世界樹神聖金葉" },
      { id: "z6_n2", x: 485, y: 315, type: "flower", goldLeafNode: true, name: "世界樹神聖金葉" },
      { id: "z6_n3", x: 235, y: 155, type: "crystal", perfect: true, name: "天界星隕神鐵" },
      { id: "z6_n4", x: 465, y: 155, type: "crystal", perfect: true, name: "天界星隕神鐵" },
      { id: "z6_n5", x: 350, y: 95,  type: "chest", legendary: true, name: "破曉天空神殿至高寶箱" }
    ];
    const monsters = initPatrolMonsters([
      { id: "m_z6_1", x: 265, y: 245, lv: 82, type: "skull", name: "星宮黃金聖衛" },
      { id: "m_z6_2", x: 435, y: 245, lv: 88, type: "skull", name: "天界審判騎士" },
      { id: "m_z6_3", x: 350, y: 165, lv: 99, type: "boss", isBoss: true, name: "破曉星辰神龍皇" }
    ]);
    const portals = [
      { id: "p_z6_to_z5", name: "⬅ 返回【第五區：熔岩火山】", x: 36, y: 260, targetZone: "zone5_volcano", targetX: 615, targetY: 260, icon: "stairs" },
      { id: "p_z6_to_tower", name: "進入【無盡試煉之塔 100層】", x: 645, y: 260, targetZone: "endless_tower", targetX: 250, targetY: 350, icon: "tower" }
    ];

    return {
      id: "zone6_sky", name: "6. 天界浮空聖殿", recLv: 80, bgm: "forest", theme: "sky",
      rain: false, fog: false, hasRiver: false, width: 700, height: 520,
      dirtBlobs: [{ cx: 350, cy: 260, rx: 265, ry: 175 }],
      groundDetails: generateGroundDetails(700, 520, 28),
      trees: [], decos, nodes, npcs: [], monsters, portals
    };
  }

  // ================= 終局：100 層《無盡試煉之塔》 =================
  function generateTowerFloor(floorNum = 1) {
    const recLv = Math.max(3, floorNum * 3);
    return {
      id: "endless_tower", name: `無盡試煉之塔・第 ${floorNum} 層`, floorNum: floorNum, recLv: recLv,
      bgm: "abyss", theme: (floorNum % 3 === 0) ? "sky" : (floorNum % 2 === 0) ? "canyon" : "cave",
      rain: false, fog: (floorNum % 4 === 0), hasRiver: false, width: 520, height: 420,
      dirtBlobs: [{ cx: 260, cy: 210, rx: 185, ry: 145 }],
      groundDetails: generateGroundDetails(520, 420, 22),
      trees: [{ x: 20, y: 20 }, { x: 460, y: 20 }],
      decos: [
        { id: `brz_tw_${floorNum}`, x: 255, y: 310, sprite: "brazier_off", w: 18, h: 18, solid: true, isBrazier: true }
      ],
      nodes: [
        { id: `tw_n1_${floorNum}`, x: 135, y: 185, type: "crystal", perfect: true, name: "試煉星隕礦" },
        { id: `tw_n2_${floorNum}`, x: 375, y: 185, type: "chest", legendary: (floorNum % 5 === 0), name: `第 ${floorNum} 層試煉寶箱` }
      ],
      npcs: [],
      monsters: initPatrolMonsters([
        {
          id: `tw_boss_${floorNum}`, x: 255, y: 155, lv: recLv,
          type: (floorNum % 5 === 0) ? "boss" : "skull",
          isBoss: (floorNum % 5 === 0), isShiny: (floorNum % 2 === 0),
          name: (floorNum % 5 === 0) ? `第 ${floorNum} 層守關魔神` : `試煉塔幻影衛兵`
        }
      ]),
      portals: [
        { id: "p_tw_next", name: `登上第 ${floorNum + 1} 層`, x: 255, y: 55, targetZone: "endless_tower_next", targetX: 250, targetY: 350, icon: "stairs" },
        { id: "p_tw_exit", name: "返回【0.曙光營地】", x: 255, y: 385, targetZone: "camp_hub", targetX: 250, targetY: 220, icon: "stairs" }
      ]
    };
  }

  // Ordered Zone List for Teleport Menu (必須步行進入解鎖後才可傳送)
  const ORDERED_WORLD_ZONES = [
    { id: "camp_hub",       name: "0. 曙光露營基地 (安全區)", x: 250, y: 220, desc: "新手大本營，設有鐵匠、公會、星象師、行商與兩座可進入的帳篷。" },
    { id: "zone1_forest",   name: "1. 翠風迷霧森林 (Lv.1~5)", x: 85,  y: 270, desc: "由營地東門進入。盛產藍晶鐵礦、紅傘微光菇與翠風太陽花。" },
    { id: "cave1_mushroom", name: "1-B. 微光蘑菇洞窟 (Lv.5~9)", x: 280, y: 390, desc: "由第一區北方洞口進入。含火盆驅霧機關、裂縫炸彈密室與閃光秘銀。" },
    { id: "zone2_canyon",   name: "2. 流沙繩索峽谷 (Lv.10~18)", x: 85,  y: 270, desc: "由第一區東岸進入。盛產流沙秘銀礦與綠洲太陽花。" },
    { id: "zone3_coast",    name: "3. 翡翠沉船海岸 (Lv.20~30)", x: 85,  y: 260, desc: "由第二區東門進入。設有海濱釣魚點、飛爪鉤孤島與古代帆船。" },
    { id: "zone4_snow",     name: "4. 霜語極寒雪原 (Lv.35~50)", x: 85,  y: 260, desc: "由第三區東門進入。盛產雪山冰蓮与永凍冰晶，棲息冰霜龍王。" },
    { id: "zone5_volcano",  name: "5. 赤紅熔岩火山 (Lv.55~75)", x: 85,  y: 260, desc: "由第四區東門進入。盛產熔岩黑曜石，盤踞紅蓮火山龍皇。" },
    { id: "zone6_sky",      name: "6. 天界浮空聖殿 (Lv.80~100)", x: 85, y: 260, desc: "由第五區東門進入。盛產世界樹金葉與天界星隕鐵，通往無盡之塔。" },
    { id: "endless_tower",  name: "終局：無盡試煉之塔 (100層)", x: 250, y: 350, desc: "由第六區東側或解鎖後進入。100層隨機迷宮，高機率遭遇閃光怪。" }
  ];

  const MAPS_DB = {
    camp_hub: buildCampHub(),
    tent_guild: buildTentGuildInterior(),
    tent_forge: buildTentForgeInterior(),
    zone1_forest: buildZone1Forest(),
    cave1_mushroom: buildCave1Mushroom(),
    zone2_canyon: buildZone2Canyon(),
    zone3_coast: buildZone3Coast(),
    zone4_snow: buildZone4Snow(),
    zone5_volcano: buildZone5Volcano(),
    zone6_sky: buildZone6Sky(),
    endless_tower: generateTowerFloor(1)
  };

  window.Aetheria.Data.Maps = {
    ORDERED_WORLD_ZONES: ORDERED_WORLD_ZONES,
    getMap(zoneId) {
      return MAPS_DB[zoneId] || MAPS_DB.camp_hub;
    },
    advanceTowerFloor(nextFloor) {
      MAPS_DB.endless_tower = generateTowerFloor(nextFloor);
      return MAPS_DB.endless_tower;
    },
    refreshAllResources() {
      MAPS_DB.camp_hub = buildCampHub();
      MAPS_DB.tent_guild = buildTentGuildInterior();
      MAPS_DB.tent_forge = buildTentForgeInterior();
      MAPS_DB.zone1_forest = buildZone1Forest();
      MAPS_DB.cave1_mushroom = buildCave1Mushroom();
      MAPS_DB.zone2_canyon = buildZone2Canyon();
      MAPS_DB.zone3_coast = buildZone3Coast();
      MAPS_DB.zone4_snow = buildZone4Snow();
      MAPS_DB.zone5_volcano = buildZone5Volcano();
      MAPS_DB.zone6_sky = buildZone6Sky();
    }
  };
})();
