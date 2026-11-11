/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 1400x960 大型迷宮、雙符文封印柱與分區工具等級資源庫 (world-maps.js - v5.0)
 * 優化：1.地圖擴大至 1400x960 多重迴廊迷宮，配置南北「雙符文封印柱 (isSealPillar)」保護守關領主
 *       2.所有採集點明確定義 giveKey、reqTool (pickaxe/axe) 與 reqToolLv (1/2/3)，嚴格對應區域級別
 *       3.高階工具素材、擋路巨石與枯木在跨區或回營地時 100% 重新刷新！
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
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
        vx: m.isBoss ? 0 : Math.cos(ang) * 0.55,
        vy: m.isBoss ? 0 : Math.sin(ang) * 0.55,
        aggro: false,
        patrolTimer: 45 + (idx * 25),
        isShiny: Boolean(m.isShiny) || (!m.isBoss && !m.isElite && idx === 1)
      });
    });
  }

  // 輔助函式：建立迷宮樹牆/石柱牆列
  function addWallLine(arr, x1, y1, x2, y2, step) {
    step = step || 38;
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(1, Math.floor(dist / step));
    for (let i = 0; i <= steps; i++) {
      arr.push({
        x: Math.round(x1 + (x2 - x1) * (i / steps)),
        y: Math.round(y1 + (y2 - y1) * (i / steps))
      });
    }
  }

  // 建立地圖外圍邊界牆 (保留指定出口缺口)
  function buildBorderWalls(trees, w, h, gaps) {
    gaps = gaps || {};
    for (let x = 10; x < w - 30; x += 38) {
      if (!gaps.top || Math.abs(x - gaps.top) > 56) trees.push({ x: x, y: 8 });
      if (!gaps.bottom || Math.abs(x - gaps.bottom) > 56) trees.push({ x: x, y: h - 44 });
    }
    for (let y = 46; y < h - 46; y += 38) {
      if (!gaps.left || Math.abs(y - gaps.left) > 56) trees.push({ x: 8, y: y });
      if (!gaps.right || Math.abs(y - gaps.right) > 56) trees.push({ x: w - 42, y: y });
    }
  }

  // ================= 第 0 區：曙光露營基地 (640x480 安全城鎮，不設野生礦脈) =================
  function buildCampHub() {
    const trees = [];
    buildBorderWalls(trees, 640, 480, { right: 260 });

    const decos = [
      { x: 165, y: 88,  sprite: "tent", w: 54, h: 48, solid: true },
      { x: 405, y: 88,  sprite: "tent", w: 54, h: 48, solid: true },
      { x: 305, y: 245, sprite: "campfire", w: 24, h: 24, solid: true },
      { x: 258, y: 248, sprite: "deco_bench", w: 28, h: 16, solid: false },
      { x: 345, y: 245, sprite: "deco_pot", w: 24, h: 24, solid: true, isCookPot: true },
      { x: 472, y: 155, sprite: "deco_anvil", w: 22, h: 18, solid: true },
      { x: 502, y: 145, sprite: "deco_rack", w: 24, h: 22, solid: true },
      { x: 132, y: 235, sprite: "deco_lantern", w: 18, h: 24, solid: true },
      { x: 525, y: 215, sprite: "deco_sign", w: 20, h: 20, solid: true },
      { x: 525, y: 295, sprite: "deco_lantern", w: 18, h: 24, solid: true },
      { id: "fish_camp", x: 185, y: 385, sprite: "fishing_spot", w: 26, h: 22, isFishingSpot: true }
    ];

    const npcs = [
      { id: "npc_smith", name: "鐵匠大叔・巴爾", role: "神兵/防具/鑲嵌/工具", sprite: "npc_blacksmith", badge: "[鐵匠]", x: 438, y: 162 },
      { id: "npc_guild", name: "公會會長・雷恩", role: "21章節主線 & 懸賞", sprite: "npc_guildmaster", badge: "[公會]", x: 202, y: 162 },
      { id: "npc_astro", name: "星象少女・艾莉婭", role: "古文明聖碑共鳴師", sprite: "npc_astrologer", badge: "[聖碑]", x: 168, y: 288 },
      { id: "npc_merch", name: "神秘行商・奇奇", role: "稀有藥水 & 金幣商店", sprite: "npc_merchant", badge: "[行商]", x: 438, y: 288 }
    ];

    const nodes = [
      { id: "camp_wood1", x: 112, y: 348, type: "wood", giveKey: "wood", reqTool: "axe", reqToolLv: 1, name: "營地老樹樁 [Lv.1斧]" },
      { id: "camp_herb1", x: 485, y: 358, type: "mushroom", giveKey: "herb", reqTool: "axe", reqToolLv: 1, name: "營地紅傘菇 [Lv.1斧]" }
    ];

    const portals = [
      { id: "p_enter_guild_tent", name: "進入【公會帳篷】", x: 192, y: 138, targetZone: "tent_guild", targetX: 180, targetY: 200, icon: "door" },
      { id: "p_enter_forge_tent", name: "進入【鐵匠帳篷】", x: 432, y: 138, targetZone: "tent_forge", targetX: 180, targetY: 200, icon: "door" },
      { id: "p_camp_to_z1", name: "前往【1. 翠風迷霧森林】▸", x: 595, y: 260, targetZone: "zone1_forest", targetX: 85, targetY: 480, icon: "stairs" }
    ];

    return {
      id: "camp_hub", name: "0. 曙光露營基地", recLv: 1, bgm: "forest", theme: "forest",
      rain: false, fog: false, hasRiver: false, width: 640, height: 480,
      dirtBlobs: [
        { x: 130, y: 140, w: 390, h: 220 },
        { x: 480, y: 230, w: 140, h: 64 }
      ],
      trees: trees, decos: decos, nodes: nodes, npcs: npcs, monsters: [], portals: portals
    };
  }

  function buildTentGuildInterior() {
    return {
      id: "tent_guild", name: "公會帳篷內部", recLv: 1, bgm: "forest", theme: "canyon",
      rain: false, fog: false, hasRiver: false, width: 360, height: 260,
      dirtBlobs: [{ x: 30, y: 30, w: 300, h: 200 }],
      trees: [],
      decos: [
        { x: 85,  y: 55, sprite: "deco_lantern", w: 18, h: 24, solid: true },
        { x: 255, y: 55, sprite: "deco_lantern", w: 18, h: 24, solid: true },
        { x: 165, y: 115, sprite: "deco_bench", w: 30, h: 16, solid: true }
      ],
      nodes: [
        { id: "tg_chest1", x: 260, y: 95, type: "chest", legendary: true, name: "公會見習補給寶箱" }
      ],
      npcs: [
        { id: "npc_guild", name: "公會會長・雷恩", role: "委託接取 & 冒險階級", sprite: "npc_guildmaster", badge: "[公會]", x: 170, y: 72 }
      ],
      monsters: [],
      portals: [
        { id: "p_exit_guild_tent", name: "離開帳篷返回營地", x: 180, y: 230, targetZone: "camp_hub", targetX: 192, targetY: 168, icon: "stairs" }
      ]
    };
  }

  function buildTentForgeInterior() {
    return {
      id: "tent_forge", name: "鐵匠帳篷內部", recLv: 1, bgm: "forest", theme: "canyon",
      rain: false, fog: false, hasRiver: false, width: 360, height: 260,
      dirtBlobs: [{ x: 30, y: 30, w: 300, h: 200 }],
      trees: [],
      decos: [
        { x: 125, y: 88, sprite: "deco_anvil", w: 22, h: 18, solid: true },
        { x: 215, y: 80, sprite: "deco_rack", w: 24, h: 22, solid: true },
        { x: 170, y: 52, sprite: "campfire", w: 22, h: 22, solid: true }
      ],
      nodes: [
        { id: "tf_box1", x: 75, y: 105, type: "wood", giveKey: "wood", reqTool: "axe", reqToolLv: 1, name: "工坊備用原木 [Lv.1斧]" }
      ],
      npcs: [
        { id: "npc_smith", name: "鐵匠大叔・巴爾", role: "神兵鍛造 & 工具升級", sprite: "npc_blacksmith", badge: "[鐵匠]", x: 170, y: 88 }
      ],
      monsters: [],
      portals: [
        { id: "p_exit_forge_tent", name: "離開帳篷返回營地", x: 180, y: 230, targetZone: "camp_hub", targetX: 432, targetY: 168, icon: "stairs" }
      ]
    };
  }

  // ================= 第 1 區：翠風迷霧森林 (1400x960 大型雙翼迷宮 + 雙符文封印石柱) =================
  function buildZone1Forest() {
    const trees = [];
    buildBorderWalls(trees, 1400, 960, { left: 480, top: 680, right: 480 });

    // 建造迷宮樹牆：將地圖分為西入口區、北翼封印迴廊、南翼礦道迴廊與河東領主區
    addWallLine(trees, 320, 60,  320, 370, 38);
    addWallLine(trees, 320, 590, 320, 880, 38);
    addWallLine(trees, 320, 370, 620, 370, 38);
    addWallLine(trees, 520, 590, 860, 590, 38);
    addWallLine(trees, 680, 180, 680, 440, 38);
    addWallLine(trees, 860, 590, 860, 820, 38);

    const decos = [
      { x: 135, y: 435, sprite: "deco_sign", w: 20, h: 20, solid: true },
      // 北翼與南翼「雙符文封印石柱」（必須兩座都點亮，才能解除河東守關領主的無敵結界！）
      { id: "seal_z1_1", x: 480, y: 155, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "森林北翼封印柱" },
      { id: "seal_z1_2", x: 680, y: 780, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "森林南翼封印柱" },
      // 水波釣魚點 (觸發垂釣小遊戲)
      { id: "fish_z1_1", x: 995, y: 350, sprite: "fishing_spot", w: 26, h: 22, isFishingSpot: true },
      { id: "fish_z1_2", x: 995, y: 620, sprite: "fishing_spot", w: 26, h: 22, isFishingSpot: true },
      // 飛爪鉤木樁 (需 Lv.2 飛爪鉤)
      { id: "grap_z1_w", x: 995, y: 175, sprite: "grapple_post", w: 20, h: 24, isGrapple: true, targetX: 1120, targetY: 175 },
      { id: "grap_z1_e", x: 1110, y: 175, sprite: "grapple_post", w: 20, h: 24, isGrapple: true, targetX: 985, targetY: 175 },
      // 擋路枯木與擋路巨石 (需 Lv.2 工具破除，跨區自動重新刷新！)
      { id: "obs_z1_tree", x: 320, y: 740, sprite: "deadtree_block", w: 26, h: 26, solid: true, obstacleType: "deadtree" },
      { id: "obs_z1_rock", x: 1140, y: 690, sprite: "boulder_block", w: 26, h: 24, solid: true, obstacleType: "boulder" }
    ];

    // 嚴格分區採集點：第 1 區主打 T1 素材 (Lv.1 工具)，並在巨石/枯木秘境後配置少量 T2 素材 (需 Lv.2 工具)
    const nodes = [
      // T1 原木 (Lv.1 斧)
      { id: "z1_w1", x: 185, y: 280, type: "wood", giveKey: "wood", reqTool: "axe", reqToolLv: 1, name: "翠風老樹樁 [Lv.1斧]" },
      { id: "z1_w2", x: 215, y: 640, type: "wood", giveKey: "wood", reqTool: "axe", reqToolLv: 1, name: "翠風老樹樁 [Lv.1斧]" },
      { id: "z1_w3", x: 540, y: 260, type: "wood", giveKey: "wood", reqTool: "axe", reqToolLv: 1, name: "翠風老樹樁 [Lv.1斧]" },
      { id: "z1_w4", x: 780, y: 420, type: "wood", giveKey: "wood", reqTool: "axe", reqToolLv: 1, name: "翠風老樹樁 [Lv.1斧]" },
      // T1 堅韌藤蔓 (Lv.1 斧)
      { id: "z1_v1", x: 245, y: 165, type: "flower", giveKey: "vine", reqTool: "axe", reqToolLv: 1, name: "翠風藤蔓叢 [Lv.1斧]" },
      { id: "z1_v2", x: 460, y: 480, type: "flower", giveKey: "vine", reqTool: "axe", reqToolLv: 1, name: "翠風藤蔓叢 [Lv.1斧]" },
      { id: "z1_v3", x: 760, y: 260, type: "flower", giveKey: "vine", reqTool: "axe", reqToolLv: 1, name: "翠風藤蔓叢 [Lv.1斧]" },
      // T1 紅傘微光菇 (Lv.1 斧)
      { id: "z1_h1", x: 190, y: 380, type: "mushroom", giveKey: "herb", reqTool: "axe", reqToolLv: 1, name: "紅傘微光菇 [Lv.1斧]" },
      { id: "z1_h2", x: 420, y: 240, type: "mushroom", giveKey: "herb", reqTool: "axe", reqToolLv: 1, name: "紅傘微光菇 [Lv.1斧]" },
      { id: "z1_h3", x: 580, y: 740, type: "mushroom", giveKey: "herb", reqTool: "axe", reqToolLv: 1, name: "紅傘微光菇 [Lv.1斧]" },
      // T1 藍晶鐵礦 (Lv.1 鎬)
      { id: "z1_i1", x: 220, y: 780, type: "crystal", giveKey: "iron", reqTool: "pickaxe", reqToolLv: 1, name: "藍晶鐵礦 [Lv.1鎬]" },
      { id: "z1_i2", x: 450, y: 720, type: "crystal", giveKey: "iron", reqTool: "pickaxe", reqToolLv: 1, name: "藍晶鐵礦 [Lv.1鎬]" },
      { id: "z1_i3", x: 780, y: 720, type: "crystal", giveKey: "iron", reqTool: "pickaxe", reqToolLv: 1, name: "藍晶鐵礦 [Lv.1鎬]" },
      { id: "z1_i4", x: 840, y: 320, type: "crystal", giveKey: "iron", reqTool: "pickaxe", reqToolLv: 1, name: "藍晶鐵礦 [Lv.1鎬]" },
      // 秘境高階資源點 (需 Lv.2 工具才可採集，跨區必刷新！)
      { id: "z1_m1", x: 1220, y: 780, type: "crystal", giveKey: "mithril", reqTool: "pickaxe", reqToolLv: 2, name: "流沙秘銀礦 [需Lv.2鎬]" },
      { id: "z1_f1", x: 180,  y: 860, type: "flower",  giveKey: "flower",  reqTool: "axe",     reqToolLv: 2, name: "翠風太陽花 [需Lv.2斧]" },
      // 傳說寶箱
      { id: "z1_ch1", x: 120,  y: 850, type: "chest", legendary: true, name: "枯木秘境傳說寶箱" },
      { id: "z1_ch2", x: 1220, y: 155, type: "chest", legendary: true, name: "河東飛爪傳說寶箱" }
    ];

    const monsters = initPatrolMonsters([
      { id: "m_z1_1", x: 220, y: 480, lv: 2, type: "bamboo", name: "翠風竹子妖" },
      { id: "m_z1_2", x: 460, y: 220, lv: 3, type: "bamboo", name: "北翼護柱竹妖" },
      { id: "m_z1_3", x: 560, y: 480, lv: 3, type: "bamboo", name: "迷霧竹子精" },
      { id: "m_z1_4", x: 640, y: 740, lv: 4, type: "bamboo", name: "南翼護柱竹衛" },
      { id: "m_z1_5", x: 880, y: 480, lv: 5, type: "skull",  name: "河畔巡邏骷髏" },
      { id: "m_z1_elite", x: 1210, y: 740, lv: 6, type: "bamboo", isElite: true, name: "紫氣・蝕憶狂暴竹魔" },
      {
        id: "m_z1_boss", bossId: "boss_z1", x: 1240, y: 480, lv: 8, type: "boss", isBoss: true,
        reqSeals: ["seal_z1_1", "seal_z1_2"],
        name: "守關領主・千年腐化樹妖王"
      }
    ]);

    const portals = [
      { id: "p_z1_to_camp", name: "◂ 返回【0.曙光營地】", x: 42, y: 480, targetZone: "camp_hub", targetX: 545, targetY: 260, icon: "stairs" },
      { id: "p_z1_to_cave", name: "進入【1-B 微光蘑菇洞窟】", x: 680, y: 48, targetZone: "cave1_mushroom", targetX: 480, targetY: 640, icon: "cave" },
      { id: "p_z1_to_z2",   name: "前往【2. 流沙峽谷】▸", x: 1345, y: 480, targetZone: "zone2_canyon", targetX: 85, targetY: 480, icon: "stairs", reqBoss: "boss_z1", reqBossName: "千年腐化樹妖王 Lv.8" }
    ];

    return {
      id: "zone1_forest", name: "1. 翠風迷霧森林", recLv: 3, bgm: "forest", theme: "forest",
      rain: true, fog: false, hasRiver: true, riverX: 1030, bridgeY: 455, width: 1400, height: 960,
      dirtBlobs: [
        { x: 60,   y: 440, w: 960, h: 80 },
        { x: 380,  y: 120, w: 260, h: 340 },
        { x: 400,  y: 520, w: 420, h: 320 },
        { x: 1100, y: 420, w: 240, h: 120 }
      ],
      trees: trees, decos: decos, nodes: nodes, npcs: [], monsters: monsters, portals: portals
    };
  }

  // ================= 第 1-B 子迷宮：微光蘑菇洞窟 (960x720 地下迷宮 — 產出 T2 流沙秘銀) =================
  function buildCave1Mushroom() {
    const trees = [];
    buildBorderWalls(trees, 960, 720, { bottom: 480 });
    addWallLine(trees, 260, 180, 260, 520, 38);
    addWallLine(trees, 680, 180, 680, 520, 38);
    addWallLine(trees, 260, 340, 420, 340, 38);
    addWallLine(trees, 540, 340, 680, 340, 38);

    const decos = [
      { id: "brz_cave_1", x: 480, y: 540, sprite: "brazier_off", w: 22, h: 22, solid: true, isBrazier: true },
      { id: "cw_cave_1",  x: 155, y: 260, sprite: "cracked_wall", w: 28, h: 28, solid: true, isCrackedWall: true },
      { id: "seal_c1_1",  x: 140, y: 480, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "洞窟西側封印柱" },
      { id: "seal_c1_2",  x: 820, y: 480, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "洞窟東側封印柱" }
    ];

    const nodes = [
      { id: "c1_m1", x: 140, y: 360, type: "crystal", giveKey: "mithril", reqTool: "pickaxe", reqToolLv: 2, name: "流沙秘銀礦 [需Lv.2鎬]" },
      { id: "c1_m2", x: 820, y: 360, type: "crystal", giveKey: "mithril", reqTool: "pickaxe", reqToolLv: 2, name: "流沙秘銀礦 [需Lv.2鎬]" },
      { id: "c1_m3", x: 820, y: 200, type: "crystal", giveKey: "mithril", reqTool: "pickaxe", reqToolLv: 2, name: "流沙秘銀礦 [需Lv.2鎬]" },
      { id: "c1_i1", x: 360, y: 480, type: "crystal", giveKey: "iron",    reqTool: "pickaxe", reqToolLv: 1, name: "藍晶鐵礦 [Lv.1鎬]" },
      { id: "c1_h1", x: 360, y: 240, type: "mushroom", giveKey: "herb",   reqTool: "axe",     reqToolLv: 1, name: "夜光紅傘菇 [Lv.1斧]" },
      { id: "c1_h2", x: 600, y: 240, type: "mushroom", giveKey: "herb",   reqTool: "axe",     reqToolLv: 1, name: "夜光紅傘菇 [Lv.1斧]" },
      { id: "c1_ch1", x: 110, y: 120, type: "chest", legendary: true, name: "炸彈密室傳說寶箱" }
    ];

    const monsters = initPatrolMonsters([
      { id: "m_c1_1", x: 480, y: 420, lv: 7, type: "skull",  name: "洞窟硬甲骷髏" },
      { id: "m_c1_2", x: 160, y: 420, lv: 8, type: "bamboo", name: "西側護柱竹妖" },
      { id: "m_c1_3", x: 800, y: 420, lv: 9, type: "skull",  name: "東側護柱骷髏" },
      { id: "m_c1_elite", x: 135, y: 160, lv: 10, type: "skull", isElite: true, name: "紫氣・密室死靈騎士" },
      {
        id: "m_c1_boss", bossId: "boss_cave1", x: 480, y: 130, lv: 12, type: "boss", isBoss: true,
        reqSeals: ["seal_c1_1", "seal_c1_2"],
        name: "守關領主・晶簇骷髏大統領"
      }
    ]);

    const portals = [
      { id: "p_cave_back", name: "返回【1. 翠風迷霧森林】", x: 480, y: 675, targetZone: "zone1_forest", targetX: 680, targetY: 95, icon: "stairs" }
    ];

    return {
      id: "cave1_mushroom", name: "1-B. 微光蘑菇洞窟", recLv: 7, bgm: "canyon", theme: "cave",
      rain: false, fog: true, hasRiver: false, width: 960, height: 720,
      dirtBlobs: [{ x: 90, y: 90, w: 780, h: 550 }],
      trees: trees, decos: decos, nodes: nodes, npcs: [], monsters: monsters, portals: portals
    };
  }

  // ================= 第 2 區：流沙繩索大峽谷 (1400x960 三迴廊岩石迷宮 — 產出 T2 秘銀與太陽花) =================
  function buildZone2Canyon() {
    const trees = [];
    buildBorderWalls(trees, 1400, 960, { left: 480, right: 480 });
    addWallLine(trees, 380, 60,  380, 620, 42);
    addWallLine(trees, 720, 320, 720, 880, 42);
    addWallLine(trees, 1040, 60, 1040, 380, 42);
    addWallLine(trees, 1040, 580, 1040, 880, 42);

    const decos = [
      { x: 540, y: 480, sprite: "campfire", w: 22, h: 22, solid: true },
      { id: "seal_z2_1", x: 200, y: 150, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "峽谷北翼封印柱" },
      { id: "seal_z2_2", x: 880, y: 800, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "峽谷南翼封印柱" },
      { id: "obs_z2_rock", x: 880, y: 220, sprite: "boulder_block", w: 26, h: 24, solid: true, obstacleType: "boulder" }
    ];

    const nodes = [
      { id: "z2_m1", x: 200, y: 260, type: "crystal", giveKey: "mithril", reqTool: "pickaxe", reqToolLv: 2, name: "流沙秘銀礦 [需Lv.2鎬]" },
      { id: "z2_m2", x: 540, y: 220, type: "crystal", giveKey: "mithril", reqTool: "pickaxe", reqToolLv: 2, name: "流沙秘銀礦 [需Lv.2鎬]" },
      { id: "z2_m3", x: 880, y: 640, type: "crystal", giveKey: "mithril", reqTool: "pickaxe", reqToolLv: 2, name: "流沙秘銀礦 [需Lv.2鎬]" },
      { id: "z2_m4", x: 1180, y: 220, type: "crystal", giveKey: "mithril", reqTool: "pickaxe", reqToolLv: 2, name: "閃光流沙秘銀 [需Lv.2鎬]", perfect: true },
      { id: "z2_f1", x: 220, y: 760, type: "flower",  giveKey: "flower",  reqTool: "axe",     reqToolLv: 2, name: "綠洲太陽花 [需Lv.2斧]" },
      { id: "z2_f2", x: 560, y: 760, type: "flower",  giveKey: "flower",  reqTool: "axe",     reqToolLv: 2, name: "綠洲太陽花 [需Lv.2斧]" },
      { id: "z2_f3", x: 1180, y: 760, type: "flower", giveKey: "flower",  reqTool: "axe",     reqToolLv: 2, name: "綠洲太陽花 [需Lv.2斧]" },
      { id: "z2_w1", x: 540, y: 620, type: "wood",    giveKey: "wood",    reqTool: "axe",     reqToolLv: 1, name: "峽谷枯木樁 [Lv.1斧]" },
      { id: "z2_ch1", x: 920, y: 120, type: "chest",  legendary: true, name: "太陽金字塔秘寶箱" }
    ];

    const monsters = initPatrolMonsters([
      { id: "m_z2_1", x: 220, y: 340, lv: 11, type: "skull", name: "流沙骷髏刀客" },
      { id: "m_z2_2", x: 540, y: 340, lv: 13, type: "skull", name: "峽谷重甲衛兵" },
      { id: "m_z2_3", x: 540, y: 720, lv: 14, type: "skull", name: "荒漠骷髏百夫長" },
      { id: "m_z2_4", x: 880, y: 700, lv: 15, type: "skull", name: "南翼護柱死靈" },
      { id: "m_z2_elite", x: 880, y: 140, lv: 16, type: "skull", isElite: true, name: "紫氣・黃金陵墓守衛" },
      {
        id: "m_z2_boss", bossId: "boss_z2", x: 1240, y: 480, lv: 18, type: "boss", isBoss: true,
        reqSeals: ["seal_z2_1", "seal_z2_2"],
        name: "守關領主・荒漠流沙魔神"
      }
    ]);

    const portals = [
      { id: "p_z2_to_z1", name: "◂ 返回【1. 翠風森林】", x: 42, y: 480, targetZone: "zone1_forest", targetX: 1290, targetY: 480, icon: "stairs" },
      { id: "p_z2_to_z3", name: "前往【3. 翡翠海岸】▸", x: 1345, y: 480, targetZone: "zone3_coast", targetX: 85, targetY: 480, icon: "stairs", reqBoss: "boss_z2", reqBossName: "荒漠流沙魔神 Lv.18" }
    ];

    return {
      id: "zone2_canyon", name: "2. 流沙繩索峽谷", recLv: 12, bgm: "canyon", theme: "canyon",
      rain: false, fog: false, hasRiver: false, width: 1400, height: 960,
      dirtBlobs: [{ x: 80, y: 100, w: 1240, h: 760 }],
      trees: trees, decos: decos, nodes: nodes, npcs: [], monsters: monsters, portals: portals
    };
  }

  // ================= 第 3 區：翡翠沉船海岸 (1400x960 海灣迷宮 — 產出深海珊瑚與垂釣鮮魚) =================
  function buildZone3Coast() {
    const trees = [];
    buildBorderWalls(trees, 1400, 960, { left: 480, right: 480 });
    addWallLine(trees, 420, 60,  420, 560, 42);
    addWallLine(trees, 760, 380, 760, 880, 42);

    const decos = [
      { x: 580, y: 780, sprite: "ancient_ship", w: 48, h: 42, solid: true },
      { id: "seal_z3_1", x: 240, y: 160, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "海灣北翼封印柱" },
      { id: "seal_z3_2", x: 920, y: 800, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "沉船南翼封印柱" },
      { id: "fish_z3_1", x: 260, y: 740, sprite: "fishing_spot", w: 26, h: 22, isFishingSpot: true },
      { id: "fish_z3_2", x: 640, y: 740, sprite: "fishing_spot", w: 26, h: 22, isFishingSpot: true },
      { id: "fish_z3_3", x: 980, y: 360, sprite: "fishing_spot", w: 26, h: 22, isFishingSpot: true },
      { id: "grap_z3_1", x: 980, y: 185, sprite: "grapple_post", w: 20, h: 24, isGrapple: true, targetX: 1120, targetY: 185 },
      { id: "grap_z3_2", x: 1110, y: 185, sprite: "grapple_post", w: 20, h: 24, isGrapple: true, targetX: 970, targetY: 185 }
    ];

    const nodes = [
      { id: "z3_c1", x: 240, y: 280, type: "crystal", giveKey: "coral",  reqTool: "pickaxe", reqToolLv: 2, name: "深海珊瑚礁 [需Lv.2鎬]" },
      { id: "z3_c2", x: 580, y: 260, type: "crystal", giveKey: "coral",  reqTool: "pickaxe", reqToolLv: 2, name: "深海珊瑚礁 [需Lv.2鎬]" },
      { id: "z3_c3", x: 920, y: 620, type: "crystal", giveKey: "coral",  reqTool: "pickaxe", reqToolLv: 2, name: "深海珊瑚礁 [需Lv.2鎬]" },
      { id: "z3_c4", x: 1180, y: 720, type: "crystal", giveKey: "coral", reqTool: "pickaxe", reqToolLv: 2, name: "閃光深海珊瑚 [需Lv.2鎬]", perfect: true },
      { id: "z3_f1", x: 580, y: 520, type: "flower",  giveKey: "flower", reqTool: "axe",     reqToolLv: 2, name: "海濱太陽花 [需Lv.2斧]" },
      { id: "z3_w1", x: 220, y: 620, type: "wood",    giveKey: "wood",   reqTool: "axe",     reqToolLv: 1, name: "漂流木樹樁 [Lv.1斧]" },
      { id: "z3_ch1", x: 1220, y: 150, type: "chest", legendary: true, name: "沉船孤島傳說寶箱" }
    ];

    const monsters = initPatrolMonsters([
      { id: "m_z3_1", x: 260, y: 380, lv: 19, type: "skull", name: "幽靈海盜水手" },
      { id: "m_z3_2", x: 580, y: 380, lv: 21, type: "skull", name: "沉船骷髏大副" },
      { id: "m_z3_3", x: 920, y: 700, lv: 23, type: "bamboo", name: "深海珊瑚水妖" },
      { id: "m_z3_elite", x: 1180, y: 185, lv: 24, type: "bamboo", isElite: true, name: "紫氣・淵海珊瑚海妖" },
      {
        id: "m_z3_boss", bossId: "boss_z3", x: 1240, y: 480, lv: 26, type: "boss", isBoss: true,
        reqSeals: ["seal_z3_1", "seal_z3_2"],
        name: "守關領主・深海幽靈船長"
      }
    ]);

    const portals = [
      { id: "p_z3_to_z2", name: "◂ 返回【2. 流沙峽谷】", x: 42, y: 480, targetZone: "zone2_canyon", targetX: 1290, targetY: 480, icon: "stairs" },
      { id: "p_z3_to_z4", name: "前往【4. 霜語雪原】▸", x: 1345, y: 480, targetZone: "zone4_snow", targetX: 85, targetY: 480, icon: "stairs", reqBoss: "boss_z3", reqBossName: "深海幽靈船長 Lv.26" }
    ];

    return {
      id: "zone3_coast", name: "3. 翡翠沉船海岸", recLv: 20, bgm: "forest", theme: "coast",
      rain: false, fog: false, hasRiver: true, riverX: 1030, bridgeY: 455, width: 1400, height: 960,
      dirtBlobs: [{ x: 80, y: 120, w: 920, h: 720 }, { x: 1100, y: 400, w: 240, h: 160 }],
      trees: trees, decos: decos, nodes: nodes, npcs: [], monsters: monsters, portals: portals
    };
  }

  // ================= 第 4 區：霜語極寒雪原 (1400x960 暴風雪迷宮 — 產出 T3 雪山冰蓮與黑曜石) =================
  function buildZone4Snow() {
    const trees = [];
    buildBorderWalls(trees, 1400, 960, { left: 480, right: 480 });
    addWallLine(trees, 400, 60,  400, 580, 42);
    addWallLine(trees, 760, 360, 760, 880, 42);
    addWallLine(trees, 1060, 60, 1060, 360, 42);

    const decos = [
      { x: 560, y: 480, sprite: "campfire", w: 22, h: 22, solid: true },
      { id: "seal_z4_1", x: 220, y: 160, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "雪原北翼封印柱" },
      { id: "seal_z4_2", x: 920, y: 800, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "雪原南翼封印柱" },
      { id: "obs_z4_tree", x: 880, y: 220, sprite: "deadtree_block", w: 26, h: 26, solid: true, obstacleType: "deadtree" }
    ];

    const nodes = [
      { id: "z4_l1", x: 220, y: 280, type: "flower",  giveKey: "iceLotus", reqTool: "axe",     reqToolLv: 2, name: "雪山永凍冰蓮 [需Lv.2斧]" },
      { id: "z4_l2", x: 580, y: 240, type: "flower",  giveKey: "iceLotus", reqTool: "axe",     reqToolLv: 2, name: "雪山永凍冰蓮 [需Lv.2斧]" },
      { id: "z4_l3", x: 580, y: 740, type: "flower",  giveKey: "iceLotus", reqTool: "axe",     reqToolLv: 2, name: "雪山永凍冰蓮 [需Lv.2斧]" },
      { id: "z4_l4", x: 920, y: 660, type: "flower",  giveKey: "iceLotus", reqTool: "axe",     reqToolLv: 2, name: "雪山永凍冰蓮 [需Lv.2斧]" },
      { id: "z4_o1", x: 1180, y: 240, type: "crystal", giveKey: "obsidian", reqTool: "pickaxe", reqToolLv: 3, name: "極地黑曜石脈 [需Lv.3鎬]" },
      { id: "z4_o2", x: 1180, y: 740, type: "crystal", giveKey: "obsidian", reqTool: "pickaxe", reqToolLv: 3, name: "極地黑曜石脈 [需Lv.3鎬]" },
      { id: "z4_ch1", x: 920, y: 120, type: "chest",  legendary: true, name: "冰龍巢穴傳說寶箱" }
    ];

    const monsters = initPatrolMonsters([
      { id: "m_z4_1", x: 240, y: 380, lv: 29, type: "skull",  name: "寒霜骷髏騎士" },
      { id: "m_z4_2", x: 580, y: 360, lv: 32, type: "bamboo", name: "極地霜牙雪怪" },
      { id: "m_z4_3", x: 920, y: 720, lv: 34, type: "skull",  name: "南翼護柱冰衛" },
      { id: "m_z4_elite", x: 880, y: 140, lv: 36, type: "skull", isElite: true, name: "紫氣・極地霜狼統領" },
      {
        id: "m_z4_boss", bossId: "boss_z4", x: 1240, y: 480, lv: 38, type: "boss", isBoss: true,
        reqSeals: ["seal_z4_1", "seal_z4_2"],
        name: "守關領主・遠古永凍冰霜龍王"
      }
    ]);

    const portals = [
      { id: "p_z4_to_z3", name: "◂ 返回【3. 翡翠海岸】", x: 42, y: 480, targetZone: "zone3_coast", targetX: 1290, targetY: 480, icon: "stairs" },
      { id: "p_z4_to_z5", name: "前往【5. 熔岩火山】▸", x: 1345, y: 480, targetZone: "zone5_volcano", targetX: 85, targetY: 480, icon: "stairs", reqBoss: "boss_z4", reqBossName: "遠古永凍冰霜龍王 Lv.38" }
    ];

    return {
      id: "zone4_snow", name: "4. 霜語極寒雪原", recLv: 30, bgm: "canyon", theme: "snow", hazard: "cold",
      rain: true, fog: false, hasRiver: false, width: 1400, height: 960,
      dirtBlobs: [{ x: 80, y: 100, w: 1240, h: 760 }],
      trees: trees, decos: decos, nodes: nodes, npcs: [], monsters: monsters, portals: portals
    };
  }

  // ================= 第 5 區：赤紅熔岩火山帶 (1400x960 煉獄迷宮 — 產出 T3 黑曜石與 T4 星隕鐵) =================
  function buildZone5Volcano() {
    const trees = [];
    buildBorderWalls(trees, 1400, 960, { left: 480, right: 480 });
    addWallLine(trees, 400, 60,  400, 580, 42);
    addWallLine(trees, 760, 360, 760, 880, 42);
    addWallLine(trees, 1060, 560, 1060, 880, 42);

    const decos = [
      { id: "seal_z5_1", x: 220, y: 160, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "火山北翼封印柱" },
      { id: "seal_z5_2", x: 920, y: 800, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "火山南翼封印柱" },
      { id: "obs_z5_rock", x: 880, y: 220, sprite: "boulder_block", w: 26, h: 24, solid: true, obstacleType: "boulder" }
    ];

    const nodes = [
      { id: "z5_o1", x: 220, y: 280, type: "crystal", giveKey: "obsidian", reqTool: "pickaxe", reqToolLv: 3, name: "熔岩黑曜石簇 [需Lv.3鎬]" },
      { id: "z5_o2", x: 580, y: 240, type: "crystal", giveKey: "obsidian", reqTool: "pickaxe", reqToolLv: 3, name: "熔岩黑曜石簇 [需Lv.3鎬]" },
      { id: "z5_o3", x: 580, y: 740, type: "crystal", giveKey: "obsidian", reqTool: "pickaxe", reqToolLv: 3, name: "熔岩黑曜石簇 [需Lv.3鎬]" },
      { id: "z5_o4", x: 920, y: 640, type: "crystal", giveKey: "obsidian", reqTool: "pickaxe", reqToolLv: 3, name: "熔岩黑曜石簇 [需Lv.3鎬]" },
      { id: "z5_s1", x: 1180, y: 220, type: "crystal", giveKey: "starIron", reqTool: "pickaxe", reqToolLv: 3, name: "深淵星隕鐵脈 [需Lv.3鎬]" },
      { id: "z5_ch1", x: 920, y: 120, type: "chest",  legendary: true, name: "火山熔岩神器寶箱" }
    ];

    const monsters = initPatrolMonsters([
      { id: "m_z5_1", x: 240, y: 380, lv: 42, type: "skull", name: "熔岩黑鎧魔將" },
      { id: "m_z5_2", x: 580, y: 420, lv: 45, type: "skull", name: "煉獄炎魔衛士" },
      { id: "m_z5_3", x: 920, y: 720, lv: 48, type: "skull", name: "南翼護柱炎魔" },
      { id: "m_z5_elite", x: 880, y: 140, lv: 50, type: "skull", isElite: true, name: "紫氣・黑曜熔核巨像" },
      {
        id: "m_z5_boss", bossId: "boss_z5", x: 1240, y: 480, lv: 52, type: "boss", isBoss: true,
        reqSeals: ["seal_z5_1", "seal_z5_2"],
        name: "守關領主・紅蓮火山龍皇"
      }
    ]);

    const portals = [
      { id: "p_z5_to_z4", name: "◂ 返回【4. 霜語雪原】", x: 42, y: 480, targetZone: "zone4_snow", targetX: 1290, targetY: 480, icon: "stairs" },
      { id: "p_z5_to_z6", name: "前往【6. 天界聖殿】▸", x: 1345, y: 480, targetZone: "zone6_sky", targetX: 85, targetY: 480, icon: "stairs", reqBoss: "boss_z5", reqBossName: "紅蓮火山龍皇 Lv.52" }
    ];

    return {
      id: "zone5_volcano", name: "5. 赤紅熔岩火山", recLv: 42, bgm: "abyss", theme: "volcano", hazard: "heat",
      rain: false, fog: false, hasRiver: false, width: 1400, height: 960,
      dirtBlobs: [{ x: 80, y: 100, w: 1240, h: 760 }],
      trees: trees, decos: decos, nodes: nodes, npcs: [], monsters: monsters, portals: portals
    };
  }

  // ================= 第 6 區：天界浮空聖殿 (1400x960 雲端聖殿迷宮 — 產出 T4 星隕鐵與世界樹金葉) =================
  function buildZone6Sky() {
    const trees = [];
    buildBorderWalls(trees, 1400, 960, { left: 480, right: 480 });
    addWallLine(trees, 420, 60,  420, 580, 42);
    addWallLine(trees, 780, 360, 780, 880, 42);

    const decos = [
      { x: 580, y: 800, sprite: "sky_airship", w: 48, h: 38, solid: true },
      { id: "seal_z6_1", x: 240, y: 160, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "天界北翼聖柱" },
      { id: "seal_z6_2", x: 940, y: 800, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "天界南翼聖柱" }
    ];

    const nodes = [
      { id: "z6_g1", x: 240, y: 280, type: "flower",  giveKey: "goldLeaf", reqTool: "axe",     reqToolLv: 3, name: "世界樹金葉 [需Lv.3斧]" },
      { id: "z6_g2", x: 600, y: 240, type: "flower",  giveKey: "goldLeaf", reqTool: "axe",     reqToolLv: 3, name: "世界樹金葉 [需Lv.3斧]" },
      { id: "z6_g3", x: 940, y: 660, type: "flower",  giveKey: "goldLeaf", reqTool: "axe",     reqToolLv: 3, name: "世界樹金葉 [需Lv.3斧]" },
      { id: "z6_s1", x: 600, y: 720, type: "crystal", giveKey: "starIron", reqTool: "pickaxe", reqToolLv: 3, name: "深淵星隕鐵 [需Lv.3鎬]" },
      { id: "z6_s2", x: 940, y: 240, type: "crystal", giveKey: "starIron", reqTool: "pickaxe", reqToolLv: 3, name: "深淵星隕鐵 [需Lv.3鎬]" },
      { id: "z6_s3", x: 1180, y: 240, type: "crystal", giveKey: "starIron", reqTool: "pickaxe", reqToolLv: 3, name: "閃光星隕神鐵 [需Lv.3鎬]", perfect: true },
      { id: "z6_ch1", x: 940, y: 120, type: "chest",  legendary: true, name: "破曉天空神殿至高寶箱" }
    ];

    const monsters = initPatrolMonsters([
      { id: "m_z6_1", x: 260, y: 380, lv: 58, type: "skull", name: "星宮黃金聖衛" },
      { id: "m_z6_2", x: 600, y: 420, lv: 62, type: "skull", name: "天界審判騎士" },
      { id: "m_z6_3", x: 940, y: 720, lv: 65, type: "skull", name: "聖殿護柱天使" },
      {
        id: "m_z6_boss", bossId: "boss_z6", x: 1240, y: 480, lv: 70, type: "boss", isBoss: true,
        reqSeals: ["seal_z6_1", "seal_z6_2"],
        name: "終極領主・破曉蝕憶神龍皇"
      }
    ]);

    const portals = [
      { id: "p_z6_to_z5",    name: "◂ 返回【5. 熔岩火山】", x: 42, y: 480, targetZone: "zone5_volcano", targetX: 1290, targetY: 480, icon: "stairs" },
      { id: "p_z6_to_tower", name: "進入【無盡試煉之塔 100層】▸", x: 1345, y: 480, targetZone: "endless_tower", targetX: 360, targetY: 480, icon: "tower", reqBoss: "boss_z6", reqBossName: "破曉蝕憶神龍皇 Lv.70" }
    ];

    return {
      id: "zone6_sky", name: "6. 天界浮空聖殿", recLv: 60, bgm: "forest", theme: "sky",
      rain: false, fog: false, hasRiver: false, width: 1400, height: 960,
      dirtBlobs: [{ x: 80, y: 100, w: 1240, h: 760 }],
      trees: trees, decos: decos, nodes: nodes, npcs: [], monsters: monsters, portals: portals
    };
  }

  // ================= 終局：100 層《無盡試煉之塔》 =================
  function generateTowerFloor(floorNum) {
    floorNum = floorNum || 1;
    const recLv = Math.max(12, floorNum * 5);
    const trees = [];
    buildBorderWalls(trees, 720, 580, {});

    return {
      id: "endless_tower", name: "無盡試煉之塔・第 " + floorNum + " 層", floorNum: floorNum, recLv: recLv,
      bgm: "abyss", theme: (floorNum % 3 === 0) ? "sky" : (floorNum % 2 === 0) ? "canyon" : "cave",
      rain: false, fog: (floorNum % 4 === 0), hasRiver: false, width: 720, height: 580,
      dirtBlobs: [{ x: 80, y: 80, w: 560, h: 420 }],
      trees: trees,
      decos: [
        { id: "brz_tw_" + floorNum, x: 360, y: 400, sprite: "brazier_off", w: 22, h: 22, solid: true, isBrazier: true },
        { id: "seal_tw_" + floorNum, x: 160, y: 260, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "試煉封印柱" }
      ],
      nodes: [
        { id: "tw_n1_" + floorNum, x: 560, y: 260, type: "crystal", giveKey: "starIron", reqTool: "pickaxe", reqToolLv: 3, name: "試煉星隕礦 [需Lv.3鎬]" }
      ],
      npcs: [],
      monsters: initPatrolMonsters([
        {
          id: "tw_boss_" + floorNum, bossId: "boss_tw_" + floorNum, x: 360, y: 180, lv: recLv,
          type: (floorNum % 5 === 0) ? "boss" : "skull",
          isBoss: (floorNum % 5 === 0), isElite: (floorNum % 5 !== 0), isShiny: (floorNum % 2 === 0),
          reqSeals: ["seal_tw_" + floorNum],
          name: (floorNum % 5 === 0) ? "第 " + floorNum + " 層守關魔神" : "試煉塔幻影衛兵"
        }
      ]),
      portals: [
        { id: "p_tw_next", name: "登上第 " + (floorNum + 1) + " 層", x: 360, y: 75, targetZone: "endless_tower_next", targetX: 360, targetY: 480, icon: "stairs", reqBoss: "boss_tw_" + floorNum, reqBossName: "本層守衛" },
        { id: "p_tw_exit", name: "返回【0.曙光營地】", x: 360, y: 525, targetZone: "camp_hub", targetX: 320, targetY: 260, icon: "stairs" }
      ]
    };
  }

  const ORDERED_WORLD_ZONES = [
    { id: "camp_hub",       name: "0. 曙光露營基地 (安全區)", x: 320, y: 260, desc: "新手大本營，設有鐵匠、公會、聖碑、行商、釣魚池與行前料理鍋。" },
    { id: "zone1_forest",   name: "1. 翠風迷霧森林 (Lv.3~8)", x: 85,  y: 480, desc: "產出 T1 藍晶鐵礦、原木、紅傘菇與藤蔓。需解開南北雙封印柱挑戰樹妖王。" },
    { id: "cave1_mushroom", name: "1-B. 微光蘑菇洞窟 (Lv.7~12)", x: 480, y: 620, desc: "產出 T2 流沙秘銀礦 [需Lv.2鎬] 與硬甲殼。含火盆驅霧與雙封印柱。" },
    { id: "zone2_canyon",   name: "2. 流沙繩索峽谷 (Lv.12~18)", x: 85,  y: 480, desc: "產出 T2 流沙秘銀礦 [需Lv.2鎬] 與太陽花 [需Lv.2斧]。守關：荒漠流沙魔神。" },
    { id: "zone3_coast",    name: "3. 翡翠沉船海岸 (Lv.20~26)", x: 85,  y: 480, desc: "產出 T2 深海珊瑚 [需Lv.2鎬] 與垂釣銀鱗鮮魚。守關：深海幽靈船長。" },
    { id: "zone4_snow",     name: "4. 霜語極寒雪原 (Lv.30~38 需抗寒)", x: 85, y: 480, desc: "產出 T3 雪山冰蓮 [需Lv.2斧] 與毛皮。守關：遠古永凍冰霜龍王。" },
    { id: "zone5_volcano",  name: "5. 赤紅熔岩火山 (Lv.42~52 需抗熱)", x: 85, y: 480, desc: "產出 T3 熔岩黑曜石 [需Lv.3鎬] 與龍鱗。守關：紅蓮火山龍皇。" },
    { id: "zone6_sky",      name: "6. 天界浮空聖殿 (Lv.60~70)", x: 85, y: 480, desc: "產出 T4 深淵星隕鐵 [需Lv.3鎬] 與世界樹金葉 [需Lv.3斧]。終極領主：破曉神龍皇。" },
    { id: "endless_tower",  name: "終局：無盡試煉之塔 (100層)", x: 360, y: 480, desc: "擊敗天界龍皇後開啟。每層皆有守關強敵與星隕礦脈。" }
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
