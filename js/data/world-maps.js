/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 7大實地拓荒工程、6位新村民駐點與徒手拾荒地圖庫 (world-maps.js - v6.0)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  let globalRefreshToken = 1;

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

  // ================= 第 0 區：曙光露營基地 (含徒手拾荒點、熔爐修復工程、老漁夫阿海與草藥婆婆梅姑) =================
  function buildCampHub() {
    const trees = [];
    buildBorderWalls(trees, 640, 480, { right: 260 });

    const decos = [
      { x: 165, y: 88,  sprite: "tent", w: 54, h: 48, solid: true },
      { x: 405, y: 88,  sprite: "tent", w: 54, h: 48, solid: true },
      { x: 305, y: 245, sprite: "campfire", w: 24, h: 24, solid: true },
      { x: 258, y: 248, sprite: "deco_bench", w: 28, h: 16, solid: false },
      { x: 345, y: 245, sprite: "deco_pot", w: 24, h: 24, solid: true, isCookPot: true },
      // 實地工程 1：巴爾的鍛造熔爐 (修復後授予新手忍刀 + Lv.1手斧 + Lv.1鐵鎬)
      { id: "site_camp_forge", x: 482, y: 168, sprite: "deco_anvil", builtSprite: "brazier_on", w: 26, h: 26, solid: true, isProjectSite: true, projectId: "proj_camp_forge", name: "受損鍛造爐" },
      { x: 512, y: 145, sprite: "deco_rack", w: 24, h: 22, solid: true },
      { x: 132, y: 235, sprite: "deco_lantern", w: 18, h: 24, solid: true },
      { x: 515, y: 215, sprite: "deco_sign", w: 20, h: 20, solid: true },
      { x: 515, y: 295, sprite: "deco_lantern", w: 18, h: 24, solid: true },
      { id: "fish_camp", x: 235, y: 392, sprite: "fishing_spot", w: 26, h: 22, isFishingSpot: true }
    ];

    const npcs = [
      { id: "npc_smith",     name: "鐵匠大叔・巴爾", role: "鍛造/建材加工", sprite: "npc_blacksmith", badge: "[鐵匠]", x: 432, y: 168 },
      { id: "npc_guild",     name: "公會會長・雷恩", role: "主線回報 & 懸賞", sprite: "npc_guildmaster", badge: "[公會]", x: 202, y: 168 },
      { id: "npc_astro",     name: "星象少女・艾莉婭", role: "古文明聖碑共鳴", sprite: "npc_astrologer", badge: "[聖碑]", x: 175, y: 265 },
      { id: "npc_merch",     name: "神秘行商・奇奇", role: "金幣物資商店", sprite: "npc_merchant", badge: "[行商]", x: 438, y: 288 },
      // 新增營地村民 NPC
      { id: "npc_fisher",    name: "老漁夫・阿海",   role: "授予釣竿 & 漁夫委託", sprite: "npc_fisher", badge: "[漁夫]", x: 285, y: 375 },
      { id: "npc_herbalist", name: "草藥婆婆・梅姑", role: "百草熬藥 & 藥師委託", sprite: "npc_herbalist", badge: "[藥師]", x: 115, y: 315 }
    ];

    // 營地徒手拾荒節點 (reqToolLv: 0，赤手空拳即可拾取修復熔爐！)
    const nodes = [
      { id: "camp_br1", x: 95,  y: 185, giveKey: "branch", reqTool: "none", reqToolLv: 0, name: "散落枯枝 [徒手]" },
      { id: "camp_br2", x: 115, y: 385, giveKey: "branch", reqTool: "none", reqToolLv: 0, name: "散落枯枝 [徒手]" },
      { id: "camp_br3", x: 375, y: 375, giveKey: "branch", reqTool: "none", reqToolLv: 0, name: "散落枯枝 [徒手]" },
      { id: "camp_fl1", x: 295, y: 115, giveKey: "flint",  reqTool: "none", reqToolLv: 0, name: "尖銳燧石 [徒手]" },
      { id: "camp_fl2", x: 525, y: 115, giveKey: "flint",  reqTool: "none", reqToolLv: 0, name: "尖銳燧石 [徒手]" },
      { id: "camp_fl3", x: 495, y: 365, giveKey: "flint",  reqTool: "none", reqToolLv: 0, name: "尖銳燧石 [徒手]" },
      { id: "camp_cl1", x: 185, y: 388, giveKey: "clay",   reqTool: "none", reqToolLv: 0, name: "河床黏土 [徒手]" },
      { id: "camp_cl2", x: 335, y: 392, giveKey: "clay",   reqTool: "none", reqToolLv: 0, name: "河床黏土 [徒手]" },
      { id: "camp_vine1", x: 95, y: 255, giveKey: "vine",  reqTool: "axe",  reqToolLv: 1, name: "營地藤蔓 [Lv.1斧]" }
    ];

    const portals = [
      { id: "p_enter_guild_tent", name: "進入【公會帳篷】", x: 192, y: 132, targetZone: "tent_guild", targetX: 180, targetY: 200, icon: "door", labelBottom: true },
      { id: "p_enter_forge_tent", name: "進入【鐵匠帳篷】", x: 432, y: 132, targetZone: "tent_forge", targetX: 180, targetY: 200, icon: "door", labelBottom: true },
      { id: "p_camp_to_z1", name: "前往【1.翠風森林】▸", x: 552, y: 260, targetZone: "zone1_forest", targetX: 95, targetY: 480, icon: "stairs" }
    ];

    return {
      id: "camp_hub", _refreshToken: globalRefreshToken, name: "0. 曙光露營基地", recLv: 1, bgm: "forest", theme: "forest",
      rain: false, fog: false, hasRiver: false, width: 640, height: 480,
      dirtBlobs: [
        { x: 130, y: 140, w: 390, h: 220 },
        { x: 480, y: 230, w: 130, h: 64 }
      ],
      trees: trees, decos: decos, nodes: nodes, npcs: npcs, monsters: [], portals: portals
    };
  }

  function buildTentGuildInterior() {
    return {
      id: "tent_guild", _refreshToken: globalRefreshToken, name: "公會帳篷內部", recLv: 1, bgm: "forest", theme: "canyon",
      rain: false, fog: false, hasRiver: false, width: 360, height: 260,
      dirtBlobs: [{ x: 30, y: 30, w: 300, h: 200 }],
      trees: [],
      decos: [
        { x: 85,  y: 55, sprite: "deco_lantern", w: 18, h: 24, solid: true },
        { x: 255, y: 55, sprite: "deco_lantern", w: 18, h: 24, solid: true },
        { x: 165, y: 115, sprite: "deco_bench", w: 30, h: 16, solid: true }
      ],
      nodes: [
        { id: "tg_chest1", x: 250, y: 95, type: "chest", legendary: true, name: "公會見習補給寶箱" }
      ],
      npcs: [
        { id: "npc_guild", name: "公會會長・雷恩", role: "委託接取 & 冒險階級", sprite: "npc_guildmaster", badge: "[公會]", x: 170, y: 78 }
      ],
      monsters: [],
      portals: [
        { id: "p_exit_guild_tent", name: "離開帳篷返回營地", x: 180, y: 220, targetZone: "camp_hub", targetX: 192, targetY: 168, icon: "stairs" }
      ]
    };
  }

  function buildTentForgeInterior() {
    return {
      id: "tent_forge", _refreshToken: globalRefreshToken, name: "鐵匠帳篷內部", recLv: 1, bgm: "forest", theme: "canyon",
      rain: false, fog: false, hasRiver: false, width: 360, height: 260,
      dirtBlobs: [{ x: 30, y: 30, w: 300, h: 200 }],
      trees: [],
      decos: [
        { x: 125, y: 88, sprite: "deco_anvil", w: 22, h: 18, solid: true },
        { x: 215, y: 80, sprite: "deco_rack", w: 24, h: 22, solid: true },
        { x: 170, y: 52, sprite: "campfire", w: 22, h: 22, solid: true }
      ],
      nodes: [
        { id: "tf_box1", x: 90, y: 105, type: "wood", giveKey: "wood", reqTool: "axe", reqToolLv: 1, name: "工坊備用原木 [Lv.1斧]" }
      ],
      npcs: [
        { id: "npc_smith", name: "鐵匠大叔・巴爾", role: "神兵鍛造 & 工具升級", sprite: "npc_blacksmith", badge: "[鐵匠]", x: 170, y: 88 }
      ],
      monsters: [],
      portals: [
        { id: "p_exit_forge_tent", name: "離開帳篷返回營地", x: 180, y: 220, targetZone: "camp_hub", targetX: 432, targetY: 168, icon: "stairs" }
      ]
    };
  }

  // ================= 第 1 區：翠風迷霧森林 (含斷橋修築工程 proj_z1_bridge、斥候里奧與礦工石頭) =================
  function buildZone1Forest() {
    const trees = [];
    buildBorderWalls(trees, 1400, 960, { left: 480, top: 680, right: 480 });

    addWallLine(trees, 320, 60,  320, 370, 38);
    addWallLine(trees, 320, 370, 620, 370, 38);
    addWallLine(trees, 680, 180, 680, 440, 38);

    addWallLine(trees, 320, 580, 320, 680, 38);
    addWallLine(trees, 320, 800, 320, 890, 38);
    addWallLine(trees, 520, 590, 860, 590, 38);
    addWallLine(trees, 860, 590, 860, 820, 38);

    addWallLine(trees, 1080, 660, 1130, 660, 38);
    addWallLine(trees, 1230, 660, 1330, 660, 38);

    const decos = [
      { x: 135, y: 435, sprite: "deco_sign", w: 20, h: 20, solid: true },
      { id: "seal_z1_1", x: 480, y: 155, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "森林北翼封印柱" },
      { id: "seal_z1_2", x: 680, y: 780, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "森林南翼封印柱" },
      // 實地工程 2：建造跨河加固吊橋 (未建好前無法過河前往東岸！)
      { id: "site_z1_bridge", x: 992, y: 465, sprite: "build_site", builtSprite: "deco_sign", w: 28, h: 28, solid: false, isProjectSite: true, projectId: "proj_z1_bridge", name: "跨河吊橋工程" },
      { id: "fish_z1_1", x: 985, y: 350, sprite: "fishing_spot", w: 26, h: 22, isFishingSpot: true },
      { id: "fish_z1_2", x: 985, y: 620, sprite: "fishing_spot", w: 26, h: 22, isFishingSpot: true },
      { id: "grap_z1_w", x: 985, y: 175, sprite: "grapple_post", w: 20, h: 24, isGrapple: true, targetX: 1125, targetY: 175 },
      { id: "grap_z1_e", x: 1115, y: 175, sprite: "grapple_post", w: 20, h: 24, isGrapple: true, targetX: 975, targetY: 175 },
      { id: "obs_z1_tree", x: 320,  y: 740, sprite: "deadtree_block", w: 26, h: 26, solid: true, obstacleType: "deadtree" },
      { id: "obs_z1_rock", x: 1180, y: 660, sprite: "boulder_block",  w: 26, h: 24, solid: true, obstacleType: "boulder" }
    ];

    const npcs = [
      { id: "npc_scout", name: "受困斥候・里奧", role: "跨河吊橋工程 & 斥候委託", sprite: "npc_scout", badge: "[斥候]", x: 935, y: 445 },
      { id: "npc_miner", name: "見習礦工・石頭", role: "授予火藥袋 & 礦工委託",   sprite: "npc_miner", badge: "[礦工]", x: 625, y: 95 }
    ];

    const nodes = [
      // 徒手與基礎森林素材
      { id: "z1_br1", x: 145, y: 340, giveKey: "branch", reqTool: "none", reqToolLv: 0, name: "散落枯枝 [徒手]" },
      { id: "z1_fl1", x: 250, y: 560, giveKey: "flint",  reqTool: "none", reqToolLv: 0, name: "尖銳燧石 [徒手]" },
      { id: "z1_cl1", x: 965, y: 540, giveKey: "clay",   reqTool: "none", reqToolLv: 0, name: "河岸黏土 [徒手]" },
      // T1 原木與琥珀松脂 (Lv.1 斧)
      { id: "z1_w1", x: 185, y: 240, type: "wood", giveKey: "wood",  reqTool: "axe", reqToolLv: 1, name: "翠風老樹樁 [Lv.1斧]" },
      { id: "z1_w2", x: 215, y: 640, type: "wood", giveKey: "wood",  reqTool: "axe", reqToolLv: 1, name: "翠風老樹樁 [Lv.1斧]" },
      { id: "z1_w3", x: 540, y: 260, type: "wood", giveKey: "wood",  reqTool: "axe", reqToolLv: 1, name: "翠風老樹樁 [Lv.1斧]" },
      { id: "z1_w4", x: 780, y: 420, type: "wood", giveKey: "wood",  reqTool: "axe", reqToolLv: 1, name: "翠風老樹樁 [Lv.1斧]" },
      { id: "z1_r1", x: 260, y: 280, type: "wood", giveKey: "resin", reqTool: "axe", reqToolLv: 1, name: "琥珀松脂樹 [Lv.1斧]" },
      { id: "z1_r2", x: 600, y: 320, type: "wood", giveKey: "resin", reqTool: "axe", reqToolLv: 1, name: "琥珀松脂樹 [Lv.1斧]" },
      { id: "z1_r3", x: 840, y: 520, type: "wood", giveKey: "resin", reqTool: "axe", reqToolLv: 1, name: "琥珀松脂樹 [Lv.1斧]" },
      // T1 藤蔓與紅傘菇 (Lv.1 斧)
      { id: "z1_v1", x: 245, y: 165, type: "flower", giveKey: "vine", reqTool: "axe", reqToolLv: 1, name: "翠風藤蔓叢 [Lv.1斧]" },
      { id: "z1_v2", x: 460, y: 480, type: "flower", giveKey: "vine", reqTool: "axe", reqToolLv: 1, name: "翠風藤蔓叢 [Lv.1斧]" },
      { id: "z1_v3", x: 760, y: 260, type: "flower", giveKey: "vine", reqTool: "axe", reqToolLv: 1, name: "翠風藤蔓叢 [Lv.1斧]" },
      { id: "z1_h1", x: 190, y: 395, type: "mushroom", giveKey: "herb", reqTool: "axe", reqToolLv: 1, name: "紅傘微光菇 [Lv.1斧]" },
      { id: "z1_h2", x: 420, y: 240, type: "mushroom", giveKey: "herb", reqTool: "axe", reqToolLv: 1, name: "紅傘微光菇 [Lv.1斧]" },
      { id: "z1_h3", x: 580, y: 740, type: "mushroom", giveKey: "herb", reqTool: "axe", reqToolLv: 1, name: "紅傘微光菇 [Lv.1斧]" },
      // T1 藍晶鐵礦 (Lv.1 鎬)
      { id: "z1_i1", x: 450, y: 660, type: "crystal", giveKey: "iron", reqTool: "pickaxe", reqToolLv: 1, name: "藍晶鐵礦 [Lv.1鎬]" },
      { id: "z1_i2", x: 450, y: 760, type: "crystal", giveKey: "iron", reqTool: "pickaxe", reqToolLv: 1, name: "藍晶鐵礦 [Lv.1鎬]" },
      { id: "z1_i3", x: 780, y: 720, type: "crystal", giveKey: "iron", reqTool: "pickaxe", reqToolLv: 1, name: "藍晶鐵礦 [Lv.1鎬]" },
      { id: "z1_i4", x: 840, y: 320, type: "crystal", giveKey: "iron", reqTool: "pickaxe", reqToolLv: 1, name: "藍晶鐵礦 [Lv.1鎬]" },
      // 秘境高階資源點 (需 Lv.2 工具)
      { id: "z1_m1", x: 1230, y: 790, type: "crystal", giveKey: "mithril", reqTool: "pickaxe", reqToolLv: 2, name: "流沙秘銀礦 [需Lv.2鎬]" },
      { id: "z1_f1", x: 190,  y: 830, type: "flower",  giveKey: "flower",  reqTool: "axe",     reqToolLv: 2, name: "翠風太陽花 [需Lv.2斧]" },
      { id: "z1_ch1", x: 140,  y: 760, type: "chest", legendary: true, name: "枯木秘境傳說寶箱" },
      { id: "z1_ch2", x: 1220, y: 155, type: "chest", legendary: true, name: "河東飛爪傳說寶箱" }
    ];

    const monsters = initPatrolMonsters([
      { id: "m_z1_1", x: 220, y: 480, lv: 2, type: "bamboo", name: "翠風竹子妖" },
      { id: "m_z1_2", x: 460, y: 220, lv: 3, type: "bamboo", name: "北翼護柱竹妖" },
      { id: "m_z1_3", x: 560, y: 480, lv: 3, type: "bamboo", name: "迷霧竹子精" },
      { id: "m_z1_4", x: 640, y: 740, lv: 4, type: "bamboo", name: "南翼護柱竹衛" },
      { id: "m_z1_5", x: 860, y: 480, lv: 5, type: "skull",  name: "河畔巡邏骷髏" },
      { id: "m_z1_elite", x: 1160, y: 780, lv: 6, type: "bamboo", isElite: true, name: "紫氣・蝕憶狂暴竹魔" },
      {
        id: "m_z1_boss", bossId: "boss_z1", x: 1210, y: 480, lv: 8, type: "boss", isBoss: true,
        reqSeals: ["seal_z1_1", "seal_z1_2"],
        name: "守關領主・千年腐化樹妖王"
      }
    ]);

    const portals = [
      { id: "p_z1_to_camp", name: "◂ 返回【0.曙光營地】", x: 68, y: 480, targetZone: "camp_hub", targetX: 505, targetY: 260, icon: "stairs" },
      { id: "p_z1_to_cave", name: "進入【1-B 微光蘑菇洞窟】", x: 680, y: 58, targetZone: "cave1_mushroom", targetX: 480, targetY: 620, icon: "cave", labelBottom: true },
      { id: "p_z1_to_z2",   name: "前往【2.流沙峽谷】▸", x: 1315, y: 480, targetZone: "zone2_canyon", targetX: 95, targetY: 480, icon: "stairs", reqBoss: "boss_z1", reqBossName: "千年腐化樹妖王 Lv.8" }
    ];

    return {
      id: "zone1_forest", _refreshToken: globalRefreshToken, name: "1. 翠風迷霧森林", recLv: 3, bgm: "forest", theme: "forest",
      rain: true, fog: false, hasRiver: true, riverX: 1030, bridgeY: 455, bridgeProject: "proj_z1_bridge", width: 1400, height: 960,
      dirtBlobs: [
        { x: 60,   y: 440, w: 960, h: 80 },
        { x: 380,  y: 120, w: 260, h: 340 },
        { x: 400,  y: 520, w: 420, h: 320 },
        { x: 1100, y: 420, w: 230, h: 120 }
      ],
      trees: trees, decos: decos, nodes: nodes, npcs: npcs, monsters: monsters, portals: portals
    };
  }

  // ================= 第 1-B 子迷宮：微光蘑菇洞窟 (含永明聖火燈塔工程 proj_cave1_beacon 與玄武岩塊) =================
  function buildCave1Mushroom() {
    const trees = [];
    buildBorderWalls(trees, 960, 720, { bottom: 480 });
    addWallLine(trees, 260, 80,  260, 520, 38);
    addWallLine(trees, 680, 180, 680, 520, 38);
    addWallLine(trees, 260, 340, 420, 340, 38);
    addWallLine(trees, 540, 340, 680, 340, 38);
    addWallLine(trees, 55,  260, 105, 260, 38);
    addWallLine(trees, 205, 260, 250, 260, 38);

    const decos = [
      // 實地工程 3：砌築永明聖火燈塔 (完成後永久驅散洞窟黑霧！)
      { id: "site_cave_beacon", x: 480, y: 540, sprite: "brazier_off", builtSprite: "brazier_on", w: 26, h: 26, solid: true, isProjectSite: true, projectId: "proj_cave1_beacon", name: "聖火燈塔基座" },
      { id: "cw_cave_1",  x: 155, y: 260, sprite: "cracked_wall", w: 28, h: 28, solid: true, isCrackedWall: true },
      { id: "seal_c1_1",  x: 145, y: 480, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "洞窟西側封印柱" },
      { id: "seal_c1_2",  x: 815, y: 480, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "洞窟東側封印柱" }
    ];

    const nodes = [
      { id: "c1_m1", x: 145, y: 360, type: "crystal", giveKey: "mithril", reqTool: "pickaxe", reqToolLv: 2, name: "流沙秘銀礦 [需Lv.2鎬]" },
      { id: "c1_m2", x: 815, y: 360, type: "crystal", giveKey: "mithril", reqTool: "pickaxe", reqToolLv: 2, name: "流沙秘銀礦 [需Lv.2鎬]" },
      { id: "c1_b1", x: 360, y: 480, type: "crystal", giveKey: "basalt",  reqTool: "pickaxe", reqToolLv: 2, name: "洞窟玄武岩 [需Lv.2鎬]" },
      { id: "c1_b2", x: 600, y: 480, type: "crystal", giveKey: "basalt",  reqTool: "pickaxe", reqToolLv: 2, name: "洞窟玄武岩 [需Lv.2鎬]" },
      { id: "c1_h1", x: 360, y: 240, type: "mushroom", giveKey: "herb",   reqTool: "axe",     reqToolLv: 1, name: "夜光紅傘菇 [Lv.1斧]" },
      { id: "c1_h2", x: 600, y: 240, type: "mushroom", giveKey: "herb",   reqTool: "axe",     reqToolLv: 1, name: "夜光紅傘菇 [Lv.1斧]" },
      { id: "c1_ch1", x: 125, y: 120, type: "chest", legendary: true, name: "炸彈密室傳說寶箱" }
    ];

    const monsters = initPatrolMonsters([
      { id: "m_c1_1", x: 480, y: 420, lv: 7, type: "skull",  name: "洞窟硬甲骷髏" },
      { id: "m_c1_2", x: 160, y: 420, lv: 8, type: "bamboo", name: "西側護柱竹妖" },
      { id: "m_c1_3", x: 800, y: 420, lv: 9, type: "skull",  name: "東側護柱骷髏" },
      { id: "m_c1_elite", x: 155, y: 170, lv: 10, type: "skull", isElite: true, name: "紫氣・密室死靈騎士" },
      {
        id: "m_c1_boss", bossId: "boss_cave1", x: 480, y: 135, lv: 12, type: "boss", isBoss: true,
        reqSeals: ["seal_c1_1", "seal_c1_2"],
        name: "守關領主・晶簇骷髏大統領"
      }
    ]);

    const portals = [
      { id: "p_cave_back", name: "返回【1.翠風迷霧森林】", x: 480, y: 660, targetZone: "zone1_forest", targetX: 680, targetY: 105, icon: "stairs" }
    ];

    return {
      id: "cave1_mushroom", _refreshToken: globalRefreshToken, name: "1-B. 微光蘑菇洞窟", recLv: 7, bgm: "canyon", theme: "cave",
      rain: false, fog: true, hasRiver: false, width: 960, height: 720,
      dirtBlobs: [{ x: 90, y: 90, w: 780, h: 550 }],
      trees: trees, decos: decos, nodes: nodes, npcs: [], monsters: monsters, portals: portals
    };
  }

  // ================= 第 2 區：流沙繩索大峽谷 (含斷崖絞盤木梯工程 proj_z2_ladder、遺跡學者古斯塔與荒野亞麻) =================
  function buildZone2Canyon() {
    const trees = [];
    buildBorderWalls(trees, 1400, 960, { left: 480, right: 480 });
    addWallLine(trees, 380, 60,  380, 620, 42);
    // 北翼斷崖橫牆 (封鎖北翼封印柱，必須在 x=200, y=300 架設絞盤木梯才可攀上斷崖！)
    addWallLine(trees, 50,  290, 360, 290, 38);

    addWallLine(trees, 720, 320, 720, 880, 42);
    addWallLine(trees, 1040, 60, 1040, 380, 42);
    addWallLine(trees, 1040, 580, 1040, 880, 42);
    addWallLine(trees, 760, 220, 825, 220, 40);
    addWallLine(trees, 935, 220, 1000, 220, 40);

    const decos = [
      { x: 540, y: 480, sprite: "campfire", w: 22, h: 22, solid: true },
      // 實地工程 4：架設斷崖重型絞盤木梯 (建成後按 A 鍵可上下攀爬北翼斷崖！)
      {
        id: "site_z2_ladder", x: 200, y: 305, sprite: "build_site", builtSprite: "ladder_built", w: 28, h: 32,
        solid: false, isProjectSite: true, projectId: "proj_z2_ladder",
        isClimbLadder: true, topY: 225, bottomY: 345, name: "斷崖絞盤木梯"
      },
      { id: "seal_z2_1", x: 200, y: 150, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "峽谷北翼封印柱" },
      { id: "seal_z2_2", x: 880, y: 800, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "峽谷南翼封印柱" },
      { id: "obs_z2_rock", x: 880, y: 220, sprite: "boulder_block", w: 26, h: 24, solid: true, obstacleType: "boulder" }
    ];

    const npcs = [
      { id: "npc_scholar", name: "遺跡學者・古斯塔", role: "斷崖木梯藍圖 & 學者委託", sprite: "npc_scholar", badge: "[學者]", x: 495, y: 475 }
    ];

    const nodes = [
      { id: "z2_m1", x: 200, y: 210, type: "crystal", giveKey: "mithril", reqTool: "pickaxe", reqToolLv: 2, name: "流沙秘銀礦 [需Lv.2鎬]" },
      { id: "z2_m2", x: 540, y: 220, type: "crystal", giveKey: "mithril", reqTool: "pickaxe", reqToolLv: 2, name: "流沙秘銀礦 [需Lv.2鎬]" },
      { id: "z2_m3", x: 880, y: 640, type: "crystal", giveKey: "mithril", reqTool: "pickaxe", reqToolLv: 2, name: "流沙秘銀礦 [需Lv.2鎬]" },
      { id: "z2_m4", x: 1180, y: 220, type: "crystal", giveKey: "mithril", reqTool: "pickaxe", reqToolLv: 2, name: "閃光流沙秘銀 [需Lv.2鎬]", perfect: true },
      { id: "z2_hm1", x: 220, y: 660, type: "flower", giveKey: "hemp",    reqTool: "axe",     reqToolLv: 2, name: "荒野亞麻叢 [需Lv.2斧]" },
      { id: "z2_hm2", x: 560, y: 660, type: "flower", giveKey: "hemp",    reqTool: "axe",     reqToolLv: 2, name: "荒野亞麻叢 [需Lv.2斧]" },
      { id: "z2_f1", x: 220, y: 780, type: "flower",  giveKey: "flower",  reqTool: "axe",     reqToolLv: 2, name: "綠洲太陽花 [需Lv.2斧]" },
      { id: "z2_f2", x: 560, y: 780, type: "flower",  giveKey: "flower",  reqTool: "axe",     reqToolLv: 2, name: "綠洲太陽花 [需Lv.2斧]" },
      { id: "z2_w1", x: 540, y: 580, type: "wood",    giveKey: "wood",    reqTool: "axe",     reqToolLv: 1, name: "峽谷枯木樁 [Lv.1斧]" },
      { id: "z2_ch1", x: 920, y: 120, type: "chest",  legendary: true, name: "太陽金字塔秘寶箱" }
    ];

    const monsters = initPatrolMonsters([
      { id: "m_z2_1", x: 220, y: 420, lv: 11, type: "skull", name: "流沙骷髏刀客" },
      { id: "m_z2_2", x: 540, y: 340, lv: 13, type: "skull", name: "峽谷重甲衛兵" },
      { id: "m_z2_3", x: 540, y: 720, lv: 14, type: "skull", name: "荒漠骷髏百夫長" },
      { id: "m_z2_4", x: 880, y: 700, lv: 15, type: "skull", name: "南翼護柱死靈" },
      { id: "m_z2_elite", x: 860, y: 140, lv: 16, type: "skull", isElite: true, name: "紫氣・黃金陵墓守衛" },
      {
        id: "m_z2_boss", bossId: "boss_z2", x: 1210, y: 480, lv: 18, type: "boss", isBoss: true,
        reqSeals: ["seal_z2_1", "seal_z2_2"],
        name: "守關領主・荒漠流沙魔神"
      }
    ]);

    const portals = [
      { id: "p_z2_to_z1", name: "◂ 返回【1.翠風森林】", x: 68, y: 480, targetZone: "zone1_forest", targetX: 1260, targetY: 480, icon: "stairs" },
      { id: "p_z2_to_z3", name: "前往【3.翡翠海岸】▸", x: 1315, y: 480, targetZone: "zone3_coast", targetX: 95, targetY: 480, icon: "stairs", reqBoss: "boss_z2", reqBossName: "荒漠流沙魔神 Lv.18" }
    ];

    return {
      id: "zone2_canyon", _refreshToken: globalRefreshToken, name: "2. 流沙繩索峽谷", recLv: 12, bgm: "canyon", theme: "canyon",
      rain: false, fog: false, hasRiver: false, width: 1400, height: 960,
      dirtBlobs: [{ x: 80, y: 100, w: 1240, h: 760 }],
      trees: trees, decos: decos, nodes: nodes, npcs: npcs, monsters: monsters, portals: portals
    };
  }

  // ================= 第 3 區：翡翠沉船海岸 (含破浪遠航木筏工程 proj_z3_raft 與老船匠達克) =================
  function buildZone3Coast() {
    const trees = [];
    buildBorderWalls(trees, 1400, 960, { left: 480, right: 480 });
    addWallLine(trees, 420, 60,  420, 560, 42);
    addWallLine(trees, 760, 380, 760, 880, 42);

    const decos = [
      { x: 580, y: 780, sprite: "ancient_ship", w: 48, h: 42, solid: true },
      { id: "seal_z3_1", x: 240, y: 160, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "海灣北翼封印柱" },
      { id: "seal_z3_2", x: 920, y: 800, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "沉船南翼封印柱" },
      // 實地工程 5：建造破浪遠航木筏 (建好後打通深海航道前往東岸挑戰幽靈船長！)
      { id: "site_z3_raft", x: 992, y: 465, sprite: "build_site", builtSprite: "raft_built", w: 30, h: 30, solid: false, isProjectSite: true, projectId: "proj_z3_raft", name: "遠航木筏船塢" },
      { id: "fish_z3_1", x: 260, y: 740, sprite: "fishing_spot", w: 26, h: 22, isFishingSpot: true },
      { id: "fish_z3_2", x: 640, y: 740, sprite: "fishing_spot", w: 26, h: 22, isFishingSpot: true },
      { id: "fish_z3_3", x: 980, y: 360, sprite: "fishing_spot", w: 26, h: 22, isFishingSpot: true },
      { id: "grap_z3_1", x: 980, y: 185, sprite: "grapple_post", w: 20, h: 24, isGrapple: true, targetX: 1125, targetY: 185 },
      { id: "grap_z3_2", x: 1115, y: 185, sprite: "grapple_post", w: 20, h: 24, isGrapple: true, targetX: 970, targetY: 185 }
    ];

    const npcs = [
      { id: "npc_shipwright", name: "老船匠・達克", role: "遠航木筏造船 & 船匠委託", sprite: "npc_shipwright", badge: "[船匠]", x: 935, y: 445 }
    ];

    const nodes = [
      { id: "z3_c1", x: 240, y: 280, type: "crystal", giveKey: "coral",  reqTool: "pickaxe", reqToolLv: 2, name: "深海珊瑚礁 [需Lv.2鎬]" },
      { id: "z3_c2", x: 580, y: 260, type: "crystal", giveKey: "coral",  reqTool: "pickaxe", reqToolLv: 2, name: "深海珊瑚礁 [需Lv.2鎬]" },
      { id: "z3_c3", x: 920, y: 620, type: "crystal", giveKey: "coral",  reqTool: "pickaxe", reqToolLv: 2, name: "深海珊瑚礁 [需Lv.2鎬]" },
      { id: "z3_c4", x: 1180, y: 720, type: "crystal", giveKey: "coral", reqTool: "pickaxe", reqToolLv: 2, name: "閃光深海珊瑚 [需Lv.2鎬]", perfect: true },
      { id: "z3_hm1", x: 580, y: 520, type: "flower", giveKey: "hemp",   reqTool: "axe",     reqToolLv: 2, name: "海濱亞麻叢 [需Lv.2斧]" },
      { id: "z3_r1", x: 220, y: 520, type: "wood",    giveKey: "resin",  reqTool: "axe",     reqToolLv: 1, name: "海岸松脂木 [Lv.1斧]" },
      { id: "z3_w1", x: 220, y: 620, type: "wood",    giveKey: "wood",   reqTool: "axe",     reqToolLv: 1, name: "漂流木樹樁 [Lv.1斧]" },
      { id: "z3_cl1", x: 965, y: 550, giveKey: "clay", reqTool: "none",  reqToolLv: 0,       name: "海灣黏土 [徒手]" },
      { id: "z3_ch1", x: 1220, y: 150, type: "chest", legendary: true, name: "沉船孤島傳說寶箱" }
    ];

    const monsters = initPatrolMonsters([
      { id: "m_z3_1", x: 260, y: 380, lv: 19, type: "skull", name: "幽靈海盜水手" },
      { id: "m_z3_2", x: 580, y: 380, lv: 21, type: "skull", name: "沉船骷髏大副" },
      { id: "m_z3_3", x: 920, y: 700, lv: 23, type: "bamboo", name: "深海珊瑚水妖" },
      { id: "m_z3_elite", x: 1180, y: 220, lv: 24, type: "bamboo", isElite: true, name: "紫氣・淵海珊瑚海妖" },
      {
        id: "m_z3_boss", bossId: "boss_z3", x: 1210, y: 480, lv: 26, type: "boss", isBoss: true,
        reqSeals: ["seal_z3_1", "seal_z3_2"],
        name: "守關領主・深海幽靈船長"
      }
    ]);

    const portals = [
      { id: "p_z3_to_z2", name: "◂ 返回【2.流沙峽谷】", x: 68, y: 480, targetZone: "zone2_canyon", targetX: 1260, targetY: 480, icon: "stairs" },
      { id: "p_z3_to_z4", name: "前往【4.霜語雪原】▸", x: 1315, y: 480, targetZone: "zone4_snow", targetX: 95, targetY: 480, icon: "stairs", reqBoss: "boss_z3", reqBossName: "深海幽靈船長 Lv.26" }
    ];

    return {
      id: "zone3_coast", _refreshToken: globalRefreshToken, name: "3. 翡翠沉船海岸", recLv: 20, bgm: "forest", theme: "coast",
      rain: false, fog: false, hasRiver: true, riverX: 1030, bridgeY: 455, bridgeProject: "proj_z3_raft", width: 1400, height: 960,
      dirtBlobs: [{ x: 80, y: 120, w: 920, h: 720 }, { x: 1100, y: 400, w: 230, h: 160 }],
      trees: trees, decos: decos, nodes: nodes, npcs: npcs, monsters: monsters, portals: portals
    };
  }

  // ================= 第 4 區：霜語極寒雪原 (含極地防風毛皮屋工程 proj_z4_shelter) =================
  function buildZone4Snow() {
    const trees = [];
    buildBorderWalls(trees, 1400, 960, { left: 480, right: 480 });
    addWallLine(trees, 400, 60,  400, 580, 42);
    addWallLine(trees, 760, 360, 760, 880, 42);
    addWallLine(trees, 1060, 60, 1060, 360, 42);
    addWallLine(trees, 760, 220, 825, 220, 40);
    addWallLine(trees, 935, 220, 1010, 220, 40);

    const decos = [
      // 實地工程 6：搭建極地防風毛皮屋 (完工後永久免疫雪原凍傷，並可隨時按 A 鍵免費回滿 HP！)
      { id: "site_z4_shelter", x: 560, y: 480, sprite: "build_site", builtSprite: "shelter_built", w: 32, h: 32, solid: true, isProjectSite: true, projectId: "proj_z4_shelter", name: "極地防風屋營址" },
      { id: "seal_z4_1", x: 220, y: 160, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "雪原北翼封印柱" },
      { id: "seal_z4_2", x: 920, y: 800, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "雪原南翼封印柱" },
      { id: "obs_z4_tree", x: 880, y: 220, sprite: "deadtree_block", w: 26, h: 26, solid: true, obstacleType: "deadtree" }
    ];

    const nodes = [
      { id: "z4_l1", x: 220, y: 280, type: "flower",  giveKey: "iceLotus", reqTool: "axe",     reqToolLv: 2, name: "雪山永凍冰蓮 [需Lv.2斧]" },
      { id: "z4_l2", x: 580, y: 240, type: "flower",  giveKey: "iceLotus", reqTool: "axe",     reqToolLv: 2, name: "雪山永凍冰蓮 [需Lv.2斧]" },
      { id: "z4_l3", x: 580, y: 740, type: "flower",  giveKey: "iceLotus", reqTool: "axe",     reqToolLv: 2, name: "雪山永凍冰蓮 [需Lv.2斧]" },
      { id: "z4_b1", x: 920, y: 660, type: "crystal", giveKey: "basalt",   reqTool: "pickaxe", reqToolLv: 2, name: "凍土玄武岩 [需Lv.2鎬]" },
      { id: "z4_o1", x: 1180, y: 240, type: "crystal", giveKey: "obsidian", reqTool: "pickaxe", reqToolLv: 3, name: "極地黑曜石脈 [需Lv.3鎬]" },
      { id: "z4_o2", x: 1180, y: 740, type: "crystal", giveKey: "obsidian", reqTool: "pickaxe", reqToolLv: 3, name: "極地黑曜石脈 [需Lv.3鎬]" },
      { id: "z4_ch1", x: 920, y: 120, type: "chest",  legendary: true, name: "冰龍巢穴傳說寶箱" }
    ];

    const monsters = initPatrolMonsters([
      { id: "m_z4_1", x: 240, y: 380, lv: 29, type: "skull",  name: "寒霜骷髏騎士" },
      { id: "m_z4_2", x: 580, y: 360, lv: 32, type: "bamboo", name: "極地霜牙雪怪" },
      { id: "m_z4_3", x: 920, y: 720, lv: 34, type: "skull",  name: "南翼護柱冰衛" },
      { id: "m_z4_elite", x: 860, y: 140, lv: 36, type: "skull", isElite: true, name: "紫氣・極地霜狼統領" },
      {
        id: "m_z4_boss", bossId: "boss_z4", x: 1210, y: 480, lv: 38, type: "boss", isBoss: true,
        reqSeals: ["seal_z4_1", "seal_z4_2"],
        name: "守關領主・遠古永凍冰霜龍王"
      }
    ]);

    const portals = [
      { id: "p_z4_to_z3", name: "◂ 返回【3.翡翠海岸】", x: 68, y: 480, targetZone: "zone3_coast", targetX: 1260, targetY: 480, icon: "stairs" },
      { id: "p_z4_to_z5", name: "前往【5.熔岩火山】▸", x: 1315, y: 480, targetZone: "zone5_volcano", targetX: 95, targetY: 480, icon: "stairs", reqBoss: "boss_z4", reqBossName: "遠古永凍冰霜龍王 Lv.38" }
    ];

    return {
      id: "zone4_snow", _refreshToken: globalRefreshToken, name: "4. 霜語極寒雪原", recLv: 30, bgm: "canyon", theme: "snow", hazard: "cold",
      rain: true, fog: false, hasRiver: false, width: 1400, height: 960,
      dirtBlobs: [{ x: 80, y: 100, w: 1240, h: 760 }],
      trees: trees, decos: decos, nodes: nodes, npcs: [], monsters: monsters, portals: portals
    };
  }

  // ================= 第 5 區：赤紅熔岩火山帶 (含熔岩河與黑曜耐火石拱橋工程 proj_z5_bridge) =================
  function buildZone5Volcano() {
    const trees = [];
    buildBorderWalls(trees, 1400, 960, { left: 480, right: 480 });
    addWallLine(trees, 400, 60,  400, 580, 42);
    addWallLine(trees, 760, 360, 760, 880, 42);
    addWallLine(trees, 760, 220, 825, 220, 40);
    addWallLine(trees, 935, 220, 1000, 220, 40);

    const decos = [
      { id: "seal_z5_1", x: 220, y: 160, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "火山北翼封印柱" },
      { id: "seal_z5_2", x: 920, y: 800, sprite: "seal_pillar_off", w: 24, h: 32, solid: true, isSealPillar: true, name: "火山南翼封印柱" },
      // 實地工程 7：鋪設黑曜耐火石拱橋 (未建好前無法跨越滾燙熔岩河挑戰紅蓮火山龍皇！)
      { id: "site_z5_bridge", x: 992, y: 465, sprite: "build_site", builtSprite: "brazier_on", w: 28, h: 28, solid: false, isProjectSite: true, projectId: "proj_z5_bridge", name: "耐火石拱橋工程" },
      { id: "obs_z5_rock", x: 880, y: 220, sprite: "boulder_block", w: 26, h: 24, solid: true, obstacleType: "boulder" }
    ];

    const nodes = [
      { id: "z5_o1", x: 220, y: 280, type: "crystal", giveKey: "obsidian", reqTool: "pickaxe", reqToolLv: 3, name: "熔岩黑曜石簇 [需Lv.3鎬]" },
      { id: "z5_o2", x: 580, y: 240, type: "crystal", giveKey: "obsidian", reqTool: "pickaxe", reqToolLv: 3, name: "熔岩黑曜石簇 [需Lv.3鎬]" },
      { id: "z5_o3", x: 580, y: 740, type: "crystal", giveKey: "obsidian", reqTool: "pickaxe", reqToolLv: 3, name: "熔岩黑曜石簇 [需Lv.3鎬]" },
      { id: "z5_b1", x: 920, y: 640, type: "crystal", giveKey: "basalt",   reqTool: "pickaxe", reqToolLv: 2, name: "火山玄武岩 [需Lv.2鎬]" },
      { id: "z5_s1", x: 1180, y: 220, type: "crystal", giveKey: "starIron", reqTool: "pickaxe", reqToolLv: 3, name: "深淵星隕鐵脈 [需Lv.3鎬]" },
      { id: "z5_ch1", x: 920, y: 120, type: "chest",  legendary: true, name: "火山熔岩神器寶箱" }
    ];

    const monsters = initPatrolMonsters([
      { id: "m_z5_1", x: 240, y: 380, lv: 42, type: "skull", name: "熔岩黑鎧魔將" },
      { id: "m_z5_2", x: 580, y: 420, lv: 45, type: "skull", name: "煉獄炎魔衛士" },
      { id: "m_z5_3", x: 920, y: 720, lv: 48, type: "skull", name: "南翼護柱炎魔" },
      { id: "m_z5_elite", x: 860, y: 140, lv: 50, type: "skull", isElite: true, name: "紫氣・黑曜熔核巨像" },
      {
        id: "m_z5_boss", bossId: "boss_z5", x: 1210, y: 480, lv: 52, type: "boss", isBoss: true,
        reqSeals: ["seal_z5_1", "seal_z5_2"],
        name: "守關領主・紅蓮火山龍皇"
      }
    ]);

    const portals = [
      { id: "p_z5_to_z4", name: "◂ 返回【4.霜語雪原】", x: 68, y: 480, targetZone: "zone4_snow", targetX: 1260, targetY: 480, icon: "stairs" },
      { id: "p_z5_to_z6", name: "前往【6.天界聖殿】▸", x: 1315, y: 480, targetZone: "zone6_sky", targetX: 95, targetY: 480, icon: "stairs", reqBoss: "boss_z5", reqBossName: "紅蓮火山龍皇 Lv.52" }
    ];

    return {
      id: "zone5_volcano", _refreshToken: globalRefreshToken, name: "5. 赤紅熔岩火山", recLv: 42, bgm: "abyss", theme: "volcano", hazard: "heat",
      rain: false, fog: false, hasRiver: true, isLavaRiver: true, riverX: 1030, bridgeY: 455, bridgeProject: "proj_z5_bridge", width: 1400, height: 960,
      dirtBlobs: [{ x: 80, y: 100, w: 920, h: 760 }, { x: 1100, y: 380, w: 230, h: 200 }],
      trees: trees, decos: decos, nodes: nodes, npcs: [], monsters: monsters, portals: portals
    };
  }

  // ================= 第 6 區：天界浮空聖殿 (1400x960 雲端聖殿迷宮) =================
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
        id: "m_z6_boss", bossId: "boss_z6", x: 1210, y: 480, lv: 70, type: "boss", isBoss: true,
        reqSeals: ["seal_z6_1", "seal_z6_2"],
        name: "終極領主・破曉蝕憶神龍皇"
      }
    ]);

    const portals = [
      { id: "p_z6_to_z5",    name: "◂ 返回【5.熔岩火山】", x: 68, y: 480, targetZone: "zone5_volcano", targetX: 1260, targetY: 480, icon: "stairs" },
      { id: "p_z6_to_tower", name: "進入【無盡之塔100層】▸", x: 1315, y: 480, targetZone: "endless_tower", targetX: 360, targetY: 480, icon: "tower", reqBoss: "boss_z6", reqBossName: "破曉蝕憶神龍皇 Lv.70" }
    ];

    return {
      id: "zone6_sky", _refreshToken: globalRefreshToken, name: "6. 天界浮空聖殿", recLv: 60, bgm: "forest", theme: "sky",
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
      id: "endless_tower", _refreshToken: globalRefreshToken, name: "無盡試煉之塔・第 " + floorNum + " 層", floorNum: floorNum, recLv: recLv,
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
        { id: "p_tw_next", name: "登上第 " + (floorNum + 1) + " 層", x: 360, y: 78, targetZone: "endless_tower_next", targetX: 360, targetY: 480, icon: "stairs", reqBoss: "boss_tw_" + floorNum, reqBossName: "本層守衛", labelBottom: true },
        { id: "p_tw_exit", name: "返回【0.曙光營地】", x: 360, y: 515, targetZone: "camp_hub", targetX: 320, targetY: 260, icon: "stairs" }
      ]
    };
  }

  const ORDERED_WORLD_ZONES = [
    { id: "camp_hub",       name: "0. 曙光露營基地 (安全區)", x: 320, y: 260, desc: "設鍛造熔爐、老漁夫阿海、草藥婆婆梅姑與行前料理鍋。" },
    { id: "zone1_forest",   name: "1. 翠風迷霧森林 (Lv.3~8)", x: 95,  y: 480, desc: "產原木、松脂、藤蔓與藍晶礦。需修築【跨河吊橋】過河。" },
    { id: "cave1_mushroom", name: "1-B. 微光蘑菇洞窟 (Lv.7~12)", x: 480, y: 620, desc: "產流沙秘銀與玄武岩。需砌築【永明聖火燈塔】驅霧。" },
    { id: "zone2_canyon",   name: "2. 流沙繩索峽谷 (Lv.12~18)", x: 95,  y: 480, desc: "產秘銀、太陽花與荒野亞麻。需架設【斷崖絞盤木梯】。" },
    { id: "zone3_coast",    name: "3. 翡翠沉船海岸 (Lv.20~26)", x: 95,  y: 480, desc: "產深海珊瑚、古帆布與鮮魚。需建造【破浪遠航木筏】渡海。" },
    { id: "zone4_snow",     name: "4. 霜語極寒雪原 (Lv.30~38)", x: 95,  y: 480, desc: "產冰蓮、毛皮與強韌獸筋。可搭建【極地防風毛皮屋】。" },
    { id: "zone5_volcano",  name: "5. 赤紅熔岩火山 (Lv.42~52)", x: 95,  y: 480, desc: "產熔岩黑曜石與龍鱗。需鋪設【黑曜耐火石拱橋】過熔岩河。" },
    { id: "zone6_sky",      name: "6. 天界浮空聖殿 (Lv.60~70)", x: 95,  y: 480, desc: "產深淵星隕鐵與世界樹金葉。終極領主：破曉蝕憶神龍皇。" },
    { id: "endless_tower",  name: "終局：無盡試煉之塔 (100層)", x: 360, y: 480, desc: "擊敗天界龍皇後開啟。挑戰 100 層極限知識共鳴。" }
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
      globalRefreshToken++;
      MAPS_DB.endless_tower = generateTowerFloor(nextFloor);
      return MAPS_DB.endless_tower;
    },
    refreshAllResources: function() {
      globalRefreshToken++;
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
