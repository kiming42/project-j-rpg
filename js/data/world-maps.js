/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 擴大版迷宮地圖、守關領主封印門與秘境賞金首庫 (world-maps.js - v4.0)
 * 升級：1.擴大各區尺寸並加入迂迴林木/岩柱迷宮地形，防止無腦直線衝刺
 *       2.所有前往下一區的傳送門綁定 reqBoss 與 reqBossName，必須先擊敗守關領主才可解封通行！
 *       3.於炸彈密室、巨石後、枯木後與飛爪鉤孤島配置「紫氣・蝕憶賞金首 (isElite: true)」
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  function generateGroundDetails(width, height, count) {
    count = count || 45;
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

  function initPatrolMonsters(list) {
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    const cleared = s.clearedBosses || {};

    return list.map(function(m, idx) {
      const ang = (idx * 1.7) % (Math.PI * 2);
      const alreadyKilledBoss = Boolean(m.bossId && cleared[m.bossId]);
      return Object.assign({}, m, {
        alive: !alreadyKilledBoss,
        homeX: m.x,
        homeY: m.y,
        vx: m.isBoss ? 0 : Math.cos(ang) * 0.45,
        vy: m.isBoss ? 0 : Math.sin(ang) * 0.45,
        aggro: false,
        patrolTimer: 40 + (idx * 25),
        isShiny: Boolean(m.isShiny) || (!m.isBoss && !m.isElite && idx === 1)
      });
    });
  }

  // ================= 第 0 區：曙光露營基地 (500x380 安全基地) =================
  function buildCampHub() {
    const trees = [];
    for (let x = 8; x < 480; x += 36) {
      trees.push({ x: x, y: 6 });
      trees.push({ x: x, y: 338 });
    }
    for (let y = 40; y < 330; y += 36) {
      trees.push({ x: 8, y: y });
      if (y < 145 || y > 255) trees.push({ x: 458, y: y });
    }

    const decos = [
      { x: 135, y: 78, sprite: "tent", w: 48, h: 44, solid: true },
      { x: 315, y: 78, sprite: "tent", w: 48, h: 44, solid: true },
      { x: 242, y: 195, sprite: "campfire", w: 18, h: 18, solid: true },
      { x: 204, y: 198, sprite: "deco_bench", w: 22, h: 12, solid: false },
      { x: 272, y: 195, sprite: "deco_pot", w: 18, h: 18, solid: true, isCookPot: true },
      { x: 372, y: 135, sprite: "deco_anvil", w: 18, h: 14, solid: true },
      { x: 396, y: 128, sprite: "deco_rack", w: 20, h: 18, solid: true },
      { x: 112, y: 185, sprite: "deco_lantern", w: 16, h: 20, solid: true },
      { x: 405, y: 175, sprite: "deco_sign", w: 18, h: 18, solid: true },
      { x: 405, y: 235, sprite: "deco_lantern", w: 16, h: 20, solid: true }
    ];

    const npcs = [
      { id: "npc_smith", name: "鐵匠大叔・巴爾", role: "神兵/防具/鑲嵌/工具", sprite: "npc_blacksmith", badge: "[鐵匠]", x: 348, y: 142 },
      { id: "npc_guild", name: "公會會長・雷恩", role: "21章節主線 & 懸賞", sprite: "npc_guildmaster", badge: "[公會]", x: 172, y: 142 },
      { id: "npc_astro", name: "星象少女・艾莉婭", role: "古文明聖碑共鳴師", sprite: "npc_astrologer", badge: "[聖碑]", x: 138, y: 228 },
      { id: "npc_merch", name: "神秘行商・奇奇", role: "稀有藥水 & 金幣商店", sprite: "npc_merchant", badge: "[行商]", x: 348, y: 232 }
    ];

    const nodes = [
      { id: "camp_box1",  x: 295, y: 132, type: "crate",    name: "鐵匠鋪補給木箱" },
      { id: "camp_wood1", x: 92,  y: 278, type: "wood",     name: "營地老樹樁" },
      { id: "camp_herb1", x: 165, y: 288, type: "mushroom", name: "營地紅傘菇" },
      { id: "camp_flw1",  x: 335, y: 288, type: "flower",   name: "營地太陽花" }
    ];

    const portals = [
      { id: "p_enter_guild_tent", name: "進入【公會帳篷】", x: 159, y: 122, targetZone: "tent_guild", targetX: 160, targetY: 185, icon: "door" },
      { id: "p_enter_forge_tent", name: "進入【鐵匠帳篷】", x: 339, y: 122, targetZone: "tent_forge", targetX: 160, targetY: 185, icon: "door" },
      { id: "p_camp_to_z1", name: "前往【第一區：翠風森林】", x: 465, y: 205, targetZone: "zone1_forest", targetX: 65, targetY: 310, icon: "stairs" }
    ];

    return {
      id: "camp_hub", name: "0. 曙光露營基地", recLv: 1, bgm: "forest", theme: "forest",
      rain: false, fog: false, hasRiver: false, width: 500, height: 380,
      dirtBlobs: [
        { cx: 250, cy: 205, rx: 145, ry: 95 },
        { cx: 410, cy: 205, rx: 75, ry: 32 }
      ],
      groundDetails: generateGroundDetails(500, 380, 28),
      trees: trees, decos: decos, nodes: nodes, npcs: npcs, monsters: [], portals: portals
    };
  }

  function buildTentGuildInterior() {
    return {
      id: "tent_guild", name: "公會帳篷內部", recLv: 1, bgm: "forest", theme: "canyon",
      rain: false, fog: false, hasRiver: false, width: 320, height: 240,
      dirtBlobs: [{ cx: 160, cy: 120, rx: 135, ry: 90 }],
      groundDetails: [], trees: [],
      decos: [
        { x: 85,  y: 55, sprite: "deco_lantern", w: 16, h: 20, solid: true },
        { x: 220, y: 55, sprite: "deco_lantern", w: 16, h: 20, solid: true },
        { x: 148, y: 105, sprite: "deco_bench", w: 26, h: 14, solid: true }
      ],
      nodes: [
        { id: "tg_box1",   x: 75,  y: 95, type: "crate", name: "公會儲備木箱" },
        { id: "tg_chest1", x: 230, y: 95, type: "chest", legendary: true, name: "公會見習補給箱" }
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

  function buildTentForgeInterior() {
    return {
      id: "tent_forge", name: "鐵匠帳篷內部", recLv: 1, bgm: "forest", theme: "canyon",
      rain: false, fog: false, hasRiver: false, width: 320, height: 240,
      dirtBlobs: [{ cx: 160, cy: 120, rx: 135, ry: 90 }],
      groundDetails: [], trees: [],
      decos: [
        { x: 115, y: 82, sprite: "deco_anvil", w: 20, h: 16, solid: true },
        { x: 195, y: 76, sprite: "deco_rack", w: 22, h: 20, solid: true },
        { x: 152, y: 52, sprite: "campfire", w: 18, h: 18, solid: true }
      ],
      nodes: [
        { id: "tf_box1", x: 72,  y: 105, type: "crate",   name: "鍛造原木箱" },
        { id: "tf_box2", x: 232, y: 105, type: "crystal", name: "工坊藍晶礦簇" }
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

  // ================= 第 1 區：翠風迷霧森林 (擴大至 960x640，含林間迷宮、賞金首與守關領主) =================
  function buildZone1Forest() {
    const trees = [];
    for (let x = 8; x < 940; x += 38) {
      if (Math.abs(x - 480) > 48) trees.push({ x: x, y: 8 });
      trees.push({ x: x, y: 598 });
    }
    for (let y = 40; y < 580; y += 38) {
      if (Math.abs(y - 310) > 48) trees.push({ x: 8, y: y });
      if (Math.abs(y - 310) > 48) trees.push({ x: 918, y: y });
    }
    // 內部迂迴樹牆 (阻擋直線衝刺，引導探索南北礦區與靈草區)
    for (let y = 90; y <= 260; y += 34) trees.push({ x: 260, y: y });
    for (let y = 340; y <= 510; y += 34) trees.push({ x: 460, y: y });

    const decos = [
      { x: 95, y: 275, sprite: "deco_sign", w: 18, h: 18, solid: true },
      { id: "fish_z1", x: 698, y: 230, sprite: "fishing_spot", w: 20, h: 16, isFishingSpot: true },
      { id: "grap_z1_w", x: 696, y: 145, sprite: "grapple_post", w: 18, h: 20, isGrapple: true, targetX: 775, targetY: 145 },
      { id: "grap_z1_e", x: 770, y: 145, sprite: "grapple_post", w: 18, h: 20, isGrapple: true, targetX: 690, targetY: 145 },
      { id: "obs_z1_tree", x: 185, y: 495, sprite: "deadtree_block", w: 22, h: 22, solid: true, obstacleType: "deadtree" },
      { id: "obs_z1_rock", x: 815, y: 465, sprite: "boulder_block", w: 22, h: 20, solid: true, obstacleType: "boulder" }
    ];

    const nodes = [
      { id: "z1_w1", x: 155, y: 185, type: "wood",     name: "翠風老樹樁" },
      { id: "z1_w2", x: 355, y: 365, type: "wood",     name: "翠風老樹樁" },
      { id: "z1_w3", x: 585, y: 225, type: "wood",     name: "翠風老樹樁" },
      { id: "z1_n1", x: 175, y: 235, type: "mushroom", name: "紅傘微光菇" },
      { id: "z1_n2", x: 365, y: 155, type: "mushroom", name: "紅傘微光菇" },
      { id: "z1_n3", x: 345, y: 445, type: "flower",   name: "翠風太陽花" },
      { id: "z1_n4", x: 555, y: 435, type: "flower",   name: "翠風太陽花" },
      { id: "z1_n5", x: 365, y: 525, type: "crystal",  name: "藍晶鐵礦簇" },
      { id: "z1_n6", x: 545, y: 525, type: "crystal",  name: "藍晶鐵礦簇" },
      { id: "z1_n7", x: 635, y: 490, type: "crystal",  name: "藍晶鐵礦簇" },
      { id: "z1_n8", x: 115, y: 535, type: "chest",    legendary: true, name: "枯木秘境傳說寶箱" },
      { id: "z1_n9", x: 835, y: 135, type: "chest",    legendary: true, name: "河東抓鉤傳說寶箱" },
      { id: "z1_n10",x: 845, y: 525, type: "crystal",  perfect: true, name: "閃光藍晶秘銀礦" }
    ];

    const monsters = initPatrolMonsters([
      { id: "m_z1_1", x: 195, y: 345, lv: 2, type: "bamboo", name: "翠風竹子妖" },
      { id: "m_z1_2", x: 365, y: 235, lv: 3, type: "bamboo", name: "迷霧竹子精" },
      { id: "m_z1_3", x: 565, y: 345, lv: 4, type: "bamboo", name: "礦道竹子守衛" },
      { id: "m_z1_4", x: 645, y: 310, lv: 5, type: "skull",  name: "翡翠橋頭骷髏兵" },
      // 砍斷枯木後方的紫氣賞金首
      { id: "m_z1_elite", x: 145, y: 535, lv: 6, type: "bamboo", isElite: true, name: "紫氣・蝕憶狂暴竹魔" },
      // 鎮守東門出口的區域守關領主 Boss (必須擊敗才可進入第二區！)
      { id: "m_z1_boss", bossId: "boss_z1", x: 845, y: 310, lv: 8, type: "boss", isBoss: true, name: "守關領主・千年腐化樹妖王" }
    ]);

    const portals = [
      { id: "p_z1_to_camp", name: "返回【0.曙光營地】", x: 36, y: 310, targetZone: "camp_hub", targetX: 430, targetY: 205, icon: "stairs" },
      { id: "p_z1_to_cave", name: "進入【1-B 微光蘑菇洞窟】", x: 480, y: 48, targetZone: "cave1_mushroom", targetX: 280, targetY: 420, icon: "cave" },
      { id: "p_z1_to_z2",   name: "前往【第二區：流沙峽谷】", x: 915, y: 310, targetZone: "zone2_canyon", targetX: 65, targetY: 300, icon: "stairs", reqBoss: "boss_z1", reqBossName: "千年腐化樹妖王 Lv.8" }
    ];

    return {
      id: "zone1_forest", name: "1. 翠風迷霧森林", recLv: 3, bgm: "forest", theme: "forest",
      rain: true, fog: false, hasRiver: true, riverX: 715, bridgeY: 290, width: 960, height: 640,
      dirtBlobs: [
        { cx: 220, cy: 320, rx: 160, ry: 85 },
        { cx: 480, cy: 200, rx: 140, ry: 95 },
        { cx: 560, cy: 460, rx: 140, ry: 85 },
        { cx: 830, cy: 310, rx: 85, ry: 110 }
      ],
      groundDetails: generateGroundDetails(960, 640, 55),
      trees: trees, decos: decos, nodes: nodes, npcs: [], monsters: monsters, portals: portals
    };
  }

  // ================= 第 1-B 子迷宮：微光蘑菇洞窟 (620x500 Lv.6~12) =================
  function buildCave1Mushroom() {
    const decos = [
      { id: "brz_cave_1", x: 310, y: 365, sprite: "brazier_off", w: 18, h: 18, solid: true, isBrazier: true },
      { id: "cw_cave_1",  x: 155, y: 175, sprite: "cracked_wall", w: 24, h: 24, solid: true, isCrackedWall: true }
    ];
    const nodes = [
      { id: "c1_n1", x: 175, y: 325, type: "crystal", perfect: true, name: "閃光秘銀礦簇" },
      { id: "c1_n2", x: 445, y: 325, type: "crystal", perfect: true, name: "閃光秘銀礦簇" },
      { id: "c1_n3", x: 215, y: 225, type: "mushroom", name: "夜光紅傘菇" },
      { id: "c1_n4", x: 405, y: 225, type: "mushroom", name: "夜光紅傘菇" },
      { id: "c1_n5", x: 95,  y: 95,  type: "chest", legendary: true, name: "炸彈密室傳說寶箱" }
    ];
    const monsters = initPatrolMonsters([
      { id: "m_c1_1", x: 310, y: 285, lv: 7, type: "skull",  name: "洞窟硬甲骷髏" },
      { id: "m_c1_2", x: 215, y: 255, lv: 8, type: "bamboo", name: "變異夜光竹妖" },
      { id: "m_c1_elite", x: 115, y: 125, lv: 10, type: "skull", isElite: true, name: "紫氣・密室死靈騎士" },
      { id: "m_c1_boss", bossId: "boss_cave1", x: 310, y: 115, lv: 12, type: "boss", isBoss: true, name: "守關領主・晶簇骷髏大統領" }
    ]);
    const portals = [
      { id: "p_cave_back", name: "返回【1.翠風迷霧森林】", x: 310, y: 455, targetZone: "zone1_forest", targetX: 480, targetY: 85, icon: "stairs" }
    ];

    return {
      id: "cave1_mushroom", name: "1-B. 微光蘑菇洞窟", recLv: 7, bgm: "canyon", theme: "cave",
      rain: false, fog: true, hasRiver: false, width: 620, height: 500,
      dirtBlobs: [{ cx: 310, cy: 250, rx: 225, ry: 185 }],
      groundDetails: generateGroundDetails(620, 500, 30),
      trees: [{ x: 20, y: 16 }, { x: 560, y: 16 }],
      decos: decos, nodes: nodes, npcs: [], monsters: monsters, portals: portals
    };
  }

  // ================= 第 2 區：流沙繩索大峽谷 (920x600 Lv.10~18) =================
  function buildZone2Canyon() {
    const trees = [];
    for (let x = 16; x < 900; x += 52) {
      trees.push({ x: x, y: 8 }, { x: x, y: 552 });
    }
    // 峽谷石柱陣阻隔
    for (let y = 100; y <= 320; y += 46) trees.push({ x: 310, y: y });
    for (let y = 260; y <= 480; y += 46) trees.push({ x: 560, y: y });

    const decos = [
      { x: 435, y: 295, sprite: "campfire", w: 18, h: 18, solid: true },
      { id: "obs_z2_rock", x: 685, y: 165, sprite: "boulder_block", w: 22, h: 20, solid: true, obstacleType: "boulder" }
    ];
    const nodes = [
      { id: "z2_w1", x: 175, y: 385, type: "wood",    name: "峽谷枯木樹樁" },
      { id: "z2_n1", x: 215, y: 175, type: "crystal", perfect: true, name: "峽谷秘銀礦簇" },
      { id: "z2_n2", x: 485, y: 185, type: "crystal", perfect: true, name: "峽谷秘銀礦簇" },
      { id: "z2_n3", x: 245, y: 445, type: "flower",  name: "綠洲太陽花" },
      { id: "z2_n4", x: 475, y: 445, type: "flower",  name: "綠洲太陽花" },
      { id: "z2_n5", x: 755, y: 115, type: "chest",   legendary: true, name: "太陽金字塔秘寶箱" }
    ];
    const monsters = initPatrolMonsters([
      { id: "m_z2_1", x: 215, y: 295, lv: 11, type: "skull", name: "流沙骷髏刀客" },
      { id: "m_z2_2", x: 445, y: 215, lv: 13, type: "skull", name: "峽谷重甲衛兵" },
      { id: "m_z2_3", x: 455, y: 395, lv: 15, type: "skull", name: "荒漠骷髏百夫長" },
      { id: "m_z2_elite", x: 735, y: 145, lv: 16, type: "skull", isElite: true, name: "紫氣・黃金陵墓守衛" },
      { id: "m_z2_boss", bossId: "boss_z2", x: 805, y: 300, lv: 18, type: "boss", isBoss: true, name: "守關領主・荒漠流沙魔神" }
    ]);
    const portals = [
      { id: "p_z2_to_z1", name: "返回【第一區：翠風森林】", x: 36, y: 300, targetZone: "zone1_forest", targetX: 875, targetY: 310, icon: "stairs" },
      { id: "p_z2_to_z3", name: "前往【第三區：翡翠海岸】", x: 875, y: 300, targetZone: "zone3_coast", targetX: 65, targetY: 290, icon: "stairs", reqBoss: "boss_z2", reqBossName: "荒漠流沙魔神 Lv.18" }
    ];

    return {
      id: "zone2_canyon", name: "2. 流沙繩索峽谷", recLv: 12, bgm: "canyon", theme: "canyon",
      rain: false, fog: false, hasRiver: false, width: 920, height: 600,
      dirtBlobs: [{ cx: 460, cy: 300, rx: 360, ry: 215 }],
      groundDetails: generateGroundDetails(920, 600, 45),
      trees: trees, decos: decos, nodes: nodes, npcs: [], monsters: monsters, portals: portals
    };
  }

  // ================= 第 3 區：翡翠沉船海岸 (900x580 Lv.18~28) =================
  function buildZone3Coast() {
    const decos = [
      { x: 445, y: 445, sprite: "ancient_ship", w: 42, h: 36, solid: true },
      { id: "fish_z3_1", x: 235, y: 405, sprite: "fishing_spot", w: 20, h: 16, isFishingSpot: true },
      { id: "fish_z3_2", x: 565, y: 405, sprite: "fishing_spot", w: 20, h: 16, isFishingSpot: true },
      { id: "grap_z3_1", x: 615, y: 175, sprite: "grapple_post", w: 18, h: 20, isGrapple: true, targetX: 705, targetY: 175 },
      { id: "grap_z3_2", x: 695, y: 175, sprite: "grapple_post", w: 18, h: 20, isGrapple: true, targetX: 605, targetY: 175 }
    ];
    const nodes = [
      { id: "z3_w1", x: 165, y: 340, type: "wood",    name: "沉船漂流木樁" },
      { id: "z3_n1", x: 225, y: 215, type: "crystal", perfect: true, name: "潮汐珊瑚晶簇" },
      { id: "z3_n2", x: 515, y: 215, type: "flower",  name: "海濱太陽花" },
      { id: "z3_n3", x: 765, y: 145, type: "chest",   legendary: true, name: "沉船孤島傳說寶箱" }
    ];
    const monsters = initPatrolMonsters([
      { id: "m_z3_1", x: 265, y: 285, lv: 19, type: "skull", name: "幽靈海盜水手" },
      { id: "m_z3_2", x: 485, y: 285, lv: 22, type: "skull", name: "沉船骷髏大副" },
      { id: "m_z3_elite", x: 735, y: 175, lv: 24, type: "bamboo", isElite: true, name: "紫氣・淵海珊瑚海妖" },
      { id: "m_z3_boss", bossId: "boss_z3", x: 785, y: 290, lv: 26, type: "boss", isBoss: true, name: "守關領主・深海幽靈船長" }
    ]);
    const portals = [
      { id: "p_z3_to_z2", name: "返回【第二區：流沙峽谷】", x: 36, y: 290, targetZone: "zone2_canyon", targetX: 830, targetY: 300, icon: "stairs" },
      { id: "p_z3_to_z4", name: "前往【第四區：霜語雪原】", x: 855, y: 290, targetZone: "zone4_snow", targetX: 65, targetY: 290, icon: "stairs", reqBoss: "boss_z3", reqBossName: "深海幽靈船長 Lv.26" }
    ];

    return {
      id: "zone3_coast", name: "3. 翡翠沉船海岸", recLv: 20, bgm: "forest", theme: "coast",
      rain: false, fog: false, hasRiver: false, width: 900, height: 580,
      dirtBlobs: [{ cx: 450, cy: 275, rx: 345, ry: 185 }],
      groundDetails: generateGroundDetails(900, 400, 35),
      trees: [], decos: decos, nodes: nodes, npcs: [], monsters: monsters, portals: portals
    };
  }

  // ================= 第 4 區：霜語極寒雪原 (900x580 Lv.28~40 — 具極寒凍傷環境危害！) =================
  function buildZone4Snow() {
    const decos = [
      { x: 425, y: 290, sprite: "campfire", w: 18, h: 18, solid: true },
      { id: "obs_z4_tree", x: 215, y: 175, sprite: "deadtree_block", w: 22, h: 22, solid: true, obstacleType: "deadtree" }
    ];
    const nodes = [
      { id: "z4_n1", x: 255, y: 365, type: "flower",  snowLotus: true, name: "雪山永凍冰蓮" },
      { id: "z4_n2", x: 545, y: 365, type: "flower",  snowLotus: true, name: "雪山永凍冰蓮" },
      { id: "z4_n3", x: 435, y: 165, type: "crystal", perfect: true,   name: "永凍冰晶礦脈" },
      { id: "z4_n4", x: 135, y: 125, type: "chest",   legendary: true, name: "冰龍巢穴傳說寶箱" }
    ];
    const monsters = initPatrolMonsters([
      { id: "m_z4_1", x: 275, y: 265, lv: 29, type: "skull",  name: "寒霜骷髏騎士" },
      { id: "m_z4_2", x: 535, y: 265, lv: 33, type: "bamboo", name: "極地霜牙雪怪" },
      { id: "m_z4_elite", x: 165, y: 145, lv: 35, type: "skull", isElite: true, name: "紫氣・極地霜狼統領" },
      { id: "m_z4_boss", bossId: "boss_z4", x: 785, y: 290, lv: 38, type: "boss", isBoss: true, name: "守關領主・遠古永凍冰霜龍王" }
    ]);
    const portals = [
      { id: "p_z4_to_z3", name: "返回【第三區：翡翠海岸】", x: 36, y: 290, targetZone: "zone3_coast", targetX: 810, targetY: 290, icon: "stairs" },
      { id: "p_z4_to_z5", name: "前往【第五區：熔岩火山】", x: 855, y: 290, targetZone: "zone5_volcano", targetX: 65, targetY: 290, icon: "stairs", reqBoss: "boss_z4", reqBossName: "遠古永凍冰霜龍王 Lv.38" }
    ];

    return {
      id: "zone4_snow", name: "4. 霜語極寒雪原", recLv: 30, bgm: "canyon", theme: "snow", hazard: "cold",
      rain: true, fog: false, hasRiver: false, width: 900, height: 580,
      dirtBlobs: [{ cx: 450, cy: 290, rx: 345, ry: 195 }],
      groundDetails: generateGroundDetails(900, 580, 35),
      trees: [{ x: 30, y: 25 }, { x: 820, y: 25 }], decos: decos, nodes: nodes, npcs: [], monsters: monsters, portals: portals
    };
  }

  // ================= 第 5 區：赤紅熔岩火山帶 (900x580 Lv.40~55 — 具熔岩高溫環境危害！) =================
  function buildZone5Volcano() {
    const decos = [
      { id: "obs_z5_rock", x: 595, y: 175, sprite: "boulder_block", w: 22, h: 20, solid: true, obstacleType: "boulder" }
    ];
    const nodes = [
      { id: "z5_n1", x: 245, y: 195, type: "crystal", obsidianNode: true, name: "熔岩黑曜石簇" },
      { id: "z5_n2", x: 515, y: 385, type: "crystal", obsidianNode: true, name: "熔岩黑曜石簇" },
      { id: "z5_n3", x: 685, y: 125, type: "chest",   legendary: true,    name: "火山熔岩神器寶箱" }
    ];
    const monsters = initPatrolMonsters([
      { id: "m_z5_1", x: 285, y: 285, lv: 42, type: "skull", name: "熔岩黑鎧魔將" },
      { id: "m_z5_2", x: 525, y: 285, lv: 46, type: "skull", name: "煉獄炎魔衛士" },
      { id: "m_z5_elite", x: 655, y: 145, lv: 49, type: "skull", isElite: true, name: "紫氣・黑曜熔核巨像" },
      { id: "m_z5_boss", bossId: "boss_z5", x: 785, y: 290, lv: 52, type: "boss", isBoss: true, name: "守關領主・紅蓮火山龍皇" }
    ]);
    const portals = [
      { id: "p_z5_to_z4", name: "返回【第四區：霜語雪原】", x: 36, y: 290, targetZone: "zone4_snow", targetX: 810, targetY: 290, icon: "stairs" },
      { id: "p_z5_to_z6", name: "前往【第六區：天界聖殿】", x: 855, y: 290, targetZone: "zone6_sky", targetX: 65, targetY: 290, icon: "stairs", reqBoss: "boss_z5", reqBossName: "紅蓮火山龍皇 Lv.52" }
    ];

    return {
      id: "zone5_volcano", name: "5. 赤紅熔岩火山", recLv: 42, bgm: "abyss", theme: "volcano", hazard: "heat",
      rain: false, fog: false, hasRiver: false, width: 900, height: 580,
      dirtBlobs: [{ cx: 450, cy: 290, rx: 345, ry: 195 }],
      groundDetails: generateGroundDetails(900, 580, 35),
      trees: [], decos: decos, nodes: nodes, npcs: [], monsters: monsters, portals: portals
    };
  }

  // ================= 第 6 區：天界浮空聖殿 (900x580 Lv.55~75) =================
  function buildZone6Sky() {
    const decos = [
      { x: 425, y: 425, sprite: "sky_airship", w: 40, h: 32, solid: true },
      { x: 285, y: 195, sprite: "deco_lantern", w: 16, h: 20, solid: true },
      { x: 585, y: 195, sprite: "deco_lantern", w: 16, h: 20, solid: true }
    ];
    const nodes = [
      { id: "z6_n1", x: 245, y: 345, type: "flower",  goldLeafNode: true, name: "世界樹神聖金葉" },
      { id: "z6_n2", x: 585, y: 345, type: "flower",  goldLeafNode: true, name: "世界樹神聖金葉" },
      { id: "z6_n3", x: 265, y: 155, type: "crystal", perfect: true,      name: "天界星隕神鐵" },
      { id: "z6_n4", x: 565, y: 155, type: "crystal", perfect: true,      name: "天界星隕神鐵" },
      { id: "z6_n5", x: 435, y: 95,  type: "chest",   legendary: true,    name: "破曉天空神殿至高寶箱" }
    ];
    const monsters = initPatrolMonsters([
      { id: "m_z6_1", x: 295, y: 265, lv: 58, type: "skull", name: "星宮黃金聖衛" },
      { id: "m_z6_2", x: 545, y: 265, lv: 64, type: "skull", name: "天界審判騎士" },
      { id: "m_z6_boss", bossId: "boss_z6", x: 765, y: 290, lv: 70, type: "boss", isBoss: true, name: "終極領主・破曉蝕憶神龍皇" }
    ]);
    const portals = [
      { id: "p_z6_to_z5",    name: "返回【第五區：熔岩火山】", x: 36, y: 290, targetZone: "zone5_volcano", targetX: 810, targetY: 290, icon: "stairs" },
      { id: "p_z6_to_tower", name: "進入【無盡試煉之塔 100層】", x: 845, y: 290, targetZone: "endless_tower", targetX: 250, targetY: 350, icon: "tower", reqBoss: "boss_z6", reqBossName: "破曉蝕憶神龍皇 Lv.70" }
    ];

    return {
      id: "zone6_sky", name: "6. 天界浮空聖殿", recLv: 60, bgm: "forest", theme: "sky",
      rain: false, fog: false, hasRiver: false, width: 900, height: 580,
      dirtBlobs: [{ cx: 450, cy: 290, rx: 345, ry: 195 }],
      groundDetails: generateGroundDetails(900, 580, 32),
      trees: [], decos: decos, nodes: nodes, npcs: [], monsters: monsters, portals: portals
    };
  }

  // ================= 終局：100 層《無盡試煉之塔》 =================
  function generateTowerFloor(floorNum) {
    floorNum = floorNum || 1;
    const recLv = Math.max(10, floorNum * 5);
    return {
      id: "endless_tower", name: "無盡試煉之塔・第 " + floorNum + " 層", floorNum: floorNum, recLv: recLv,
      bgm: "abyss", theme: (floorNum % 3 === 0) ? "sky" : (floorNum % 2 === 0) ? "canyon" : "cave",
      rain: false, fog: (floorNum % 4 === 0), hasRiver: false, width: 520, height: 420,
      dirtBlobs: [{ cx: 260, cy: 210, rx: 185, ry: 145 }],
      groundDetails: generateGroundDetails(520, 420, 22),
      trees: [{ x: 20, y: 20 }, { x: 460, y: 20 }],
      decos: [
        { id: "brz_tw_" + floorNum, x: 255, y: 310, sprite: "brazier_off", w: 18, h: 18, solid: true, isBrazier: true }
      ],
      nodes: [
        { id: "tw_n1_" + floorNum, x: 135, y: 185, type: "crystal", perfect: true, name: "試煉星隕礦" },
        { id: "tw_n2_" + floorNum, x: 375, y: 185, type: "chest", legendary: (floorNum % 5 === 0), name: "第 " + floorNum + " 層試煉寶箱" }
      ],
      npcs: [],
      monsters: initPatrolMonsters([
        {
          id: "tw_boss_" + floorNum, bossId: "boss_tw_" + floorNum, x: 255, y: 155, lv: recLv,
          type: (floorNum % 5 === 0) ? "boss" : "skull",
          isBoss: (floorNum % 5 === 0), isElite: (floorNum % 5 !== 0), isShiny: (floorNum % 2 === 0),
          name: (floorNum % 5 === 0) ? "第 " + floorNum + " 層守關魔神" : "試煉塔幻影衛兵"
        }
      ]),
      portals: [
        { id: "p_tw_next", name: "登上第 " + (floorNum + 1) + " 層", x: 255, y: 55, targetZone: "endless_tower_next", targetX: 250, targetY: 350, icon: "stairs", reqBoss: "boss_tw_" + floorNum, reqBossName: "本層守衛" },
        { id: "p_tw_exit", name: "返回【0.曙光營地】", x: 255, y: 385, targetZone: "camp_hub", targetX: 250, targetY: 220, icon: "stairs" }
      ]
    };
  }

  const ORDERED_WORLD_ZONES = [
    { id: "camp_hub",       name: "0. 曙光露營基地 (安全區)", x: 250, y: 220, desc: "新手大本營，設有鐵匠、公會、聖碑、行商與行前料理燉肉鍋。" },
    { id: "zone1_forest",   name: "1. 翠風迷霧森林 (Lv.3~8)", x: 85,  y: 310, desc: "產出藍晶鐵礦、原木、藤蔓與竹精木心。守關領主：千年腐化樹妖王。" },
    { id: "cave1_mushroom", name: "1-B. 微光蘑菇洞窟 (Lv.7~12)", x: 310, y: 410, desc: "含火盆驅霧與炸彈密室賞金首。守關領主：晶簇骷髏大統領。" },
    { id: "zone2_canyon",   name: "2. 流沙繩索峽谷 (Lv.12~18)", x: 85,  y: 300, desc: "產出流沙秘銀、硬甲殼與骷髏魂火。守關領主：荒漠流沙魔神。" },
    { id: "zone3_coast",    name: "3. 翡翠沉船海岸 (Lv.20~26)", x: 85,  y: 290, desc: "產出銀鱗鮮魚、深海珊瑚與海妖水核。守關領主：深海幽靈船長。" },
    { id: "zone4_snow",     name: "4. 霜語極寒雪原 (Lv.30~38 需抗寒)", x: 85,  y: 290, desc: "極寒環境！產出雪山冰蓮、毛皮與雪狼冰魄。守關領主：永凍冰霜龍王。" },
    { id: "zone5_volcano",  name: "5. 赤紅熔岩火山 (Lv.42~52 需抗熱)", x: 85,  y: 290, desc: "高溫環境！產出熔岩黑曜石、龍鱗與炎魔熔核。守關領主：紅蓮火山龍皇。" },
    { id: "zone6_sky",      name: "6. 天界浮空聖殿 (Lv.60~70)", x: 85, y: 290, desc: "產出世界樹金葉、深淵星隕鐵與龍王逆鱗。終極領主：破曉蝕憶神龍皇。" },
    { id: "endless_tower",  name: "終局：無盡試煉之塔 (100層)", x: 250, y: 350, desc: "擊敗天界龍皇後開啟。每層皆有守關強敵，挑戰極限知識共鳴。" }
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
    getMap: function(zoneId) {
      return MAPS_DB[zoneId] || MAPS_DB.camp_hub;
    },
    advanceTowerFloor: function(nextFloor) {
      MAPS_DB.endless_tower = generateTowerFloor(nextFloor);
      return MAPS_DB.endless_tower;
    },
    refreshAllResources: function() {
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
