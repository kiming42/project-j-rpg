/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 26種素材、10階神兵、6階防具、6大符文鑲嵌與營地料理庫 (items-crafting.js - v4.0)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  // 1. 26 種全大陸素材、區域特產、魔物破防核心與消耗品
  const MATERIALS = {
    // 礦石 (4)
    iron:        { id: "iron",        name: "藍晶鐵礦",     tier: 1, desc: "翠風森林基礎鍛造礦石。" },
    mithril:     { id: "mithril",     name: "流沙秘銀礦",   tier: 2, desc: "蘊含魔力的銀白礦石，產自洞窟與峽谷。" },
    obsidian:    { id: "obsidian",    name: "熔岩黑曜石",   tier: 3, desc: "火山高溫凝結的黑晶，用於鍛造高階神兵與重甲。" },
    starIron:    { id: "starIron",    name: "深淵星隕鐵",   tier: 4, desc: "自天界墜落的神話金屬，散發星辰微光。" },
    // 靈植 (4)
    herb:        { id: "herb",        name: "紅傘微光菇",   tier: 1, desc: "森林微光蘑菇，用於鍛造、煉藥與煲湯。" },
    flower:      { id: "flower",      name: "翠風太陽花",   tier: 1, desc: "向陽盛開的靈花，用於提煉藥水與驅寒火鍋。" },
    iceLotus:    { id: "iceLotus",    name: "雪山冰蓮",     tier: 3, desc: "極寒雪原永不凋謝的冰蓮，高階附魔素材。" },
    goldLeaf:    { id: "goldLeaf",    name: "世界樹金葉",   tier: 4, desc: "天界浮空聖殿飄落的金葉，蘊含破曉之力。" },
    // 木材與各區特產素材 (8)
    wood:        { id: "wood",        name: "翠風原木",     tier: 1, desc: "堅韌的森林木材，可從老樹樁採集。" },
    vine:        { id: "vine",        name: "堅韌藤蔓",     tier: 1, desc: "第一區森林魔物與樹叢伴生素材，用於編織藤甲。" },
    shell:       { id: "shell",       name: "洞窟硬甲殼",   tier: 2, desc: "洞窟與峽谷魔物掉落的堅硬甲殼，用於打造鎖甲。" },
    coral:       { id: "coral",       name: "深海珊瑚",     tier: 2, desc: "第三區翡翠海岸採集或海盜掉落的靈力珊瑚。" },
    fur:         { id: "fur",         name: "霜狼禦寒毛皮", tier: 3, desc: "第四區雪原魔物掉落的厚實毛皮，縫製抗寒防具必備。" },
    magmaScale:  { id: "magmaScale",  name: "熔岩龍鱗",     tier: 3, desc: "第五區火山魔將掉落的耐火鱗片，打造神鎧必備。" },
    fish:        { id: "fish",        name: "銀鱗鮮魚",     tier: 2, desc: "於河畔或海岸水波釣魚點垂釣獲得，可烹調破盾魚排。" },
    tabletShard: { id: "tabletShard", name: "古文明聖碑殘片", tier: 4, desc: "擊敗區域守關領主或賞金首獲得，可於公會修復四大聖碑！" },
    // 6 大魔物破防核心 (可鍛造神兵，亦可直接鑲嵌於武器/防具符文孔！)
    coreBamboo:  { id: "coreBamboo",  name: "竹精木心",     tier: 1, desc: "【破防核心/符文】森林竹妖破防掉落。鑲嵌：每回回血 +20。" },
    coreSkull:   { id: "coreSkull",   name: "骷髏魂火",     tier: 2, desc: "【破防核心/符文】洞窟與峽谷骷髏破防掉落。鑲嵌：20% 吸血。" },
    coreSiren:   { id: "coreSiren",   name: "海妖水核",     tier: 2, desc: "【破防核心/符文】海岸魔物破防掉落。鑲嵌：舉盾反彈 100% 傷害。" },
    coreWolf:    { id: "coreWolf",    name: "雪狼冰魄",     tier: 3, desc: "【破防核心/符文】雪原魔物破防掉落。鑲嵌：開局冰封敵人 1 回合。" },
    coreGolem:   { id: "coreGolem",   name: "炎魔熔核",     tier: 3, desc: "【破防核心/符文】火山魔物破防掉落。鑲嵌：攻擊力 +25、破盾傷 +20%。" },
    coreDragon:  { id: "coreDragon",  name: "龍王逆鱗",     tier: 4, desc: "【破防核心/符文】領主 Boss 破防掉落。鑲嵌：破防暴擊傷害 +50%。" },
    // 消耗品 (4)
    potionHeal:  { id: "potionHeal",  name: "生命藥水",     tier: 1, desc: "飲用後回復 70 點生命值（煉金聖碑神恩可翻倍至 140 點）。" },
    potionHint:  { id: "potionHint",  name: "洞察藥水",     tier: 2, desc: "英文全盲串字時，顯示首尾字母與字數提示。" },
    bombItem:    { id: "bombItem",    name: "爆破炸彈",     tier: 2, desc: "在地圖上炸開「裂縫岩壁」開啟隱藏賞金首密室。" },
    tameFruit:   { id: "tameFruit",   name: "靈獸誘餌果",   tier: 2, desc: "在魔物破防殘血時投擲，答對題目即可收服。" }
  };

  // 2. 十階代表性神兵配方表 (Tier 1 ~ Tier 10)
  const WEAPONS = {
    w_starter: {
      id: "w_starter", name: "新手蒼藍忍刀", tier: 1, reqLv: 1, atk: 15, shieldBreak: 0,
      element: "物理", desc: "共鳴者初始佩刀，輕巧順手。", cost: {}
    },
    w_vine: {
      id: "w_vine", name: "翠風荊棘短刃", tier: 2, reqLv: 2, atk: 28, shieldBreak: 0,
      element: "木屬", desc: "以森林藤蔓與藍晶鍛造的鋒利短刃，對付第一區魔物極佳。",
      cost: { wood: 5, iron: 5, vine: 3 }
    },
    w_tide: {
      id: "w_tide", name: "潮汐破盾忍刀", tier: 3, reqLv: 4, atk: 46, shieldBreak: 1,
      element: "水屬", desc: "【特效】每次答對額外削盾 +1（挑戰第一區守關領主必備）",
      cost: { iron: 10, herb: 6, wood: 6, coreBamboo: 2 }
    },
    w_bone: {
      id: "w_bone", name: "岩窟碎甲重刃", tier: 4, reqLv: 7, atk: 70, shieldBreak: 1,
      element: "地屬", desc: "【特效】額外削盾 +1，以洞窟硬甲殼強化刀背，破甲威力驚人。",
      cost: { iron: 12, mithril: 6, shell: 5, coreBamboo: 3 }
    },
    w_flame: {
      id: "w_flame", name: "赤炎連斬太刀", tier: 5, reqLv: 11, atk: 98, shieldBreak: 1, spellBonus: 1.35,
      element: "火屬", desc: "【特效】額外削盾 +1，答對拼字題傷害 +35%",
      cost: { mithril: 12, flower: 8, shell: 6, coreSkull: 2 }
    },
    w_coral: {
      id: "w_coral", name: "淵海珊瑚雙刃", tier: 6, reqLv: 16, atk: 135, shieldBreak: 1, bpGainBonus: 1,
      element: "水屬", desc: "【特效】額外削盾 +1，每次答對多充能 1 顆 BP 珠",
      cost: { mithril: 16, coral: 8, fish: 4, coreSiren: 2 }
    },
    w_thunder: {
      id: "w_thunder", name: "雷鳴疾風雙刃", tier: 7, reqLv: 22, atk: 178, shieldBreak: 1, bpGainBonus: 1,
      element: "雷屬", desc: "【特效】額外削盾 +1，高速雷鳴連擊並額外充能 BP",
      cost: { mithril: 20, obsidian: 6, coral: 8, coreSiren: 3 }
    },
    w_frost: {
      id: "w_frost", name: "永凍冰龍神劍", tier: 8, reqLv: 30, atk: 235, shieldBreak: 2,
      element: "冰屬", desc: "【特效】每次答對直接額外削盾 +2，對高盾領主造成毀滅壓制",
      cost: { obsidian: 14, iceLotus: 10, fur: 8, coreWolf: 3 }
    },
    w_magma: {
      id: "w_magma", name: "紅蓮煉獄巨劍", tier: 9, reqLv: 40, atk: 305, shieldBreak: 2, spellBonus: 1.5,
      element: "火屬", desc: "【特效】額外削盾 +2，拼字與看圖題暴擊傷害 +50%",
      cost: { obsidian: 22, magmaScale: 10, coreGolem: 3, coreDragon: 1 }
    },
    w_dawn: {
      id: "w_dawn", name: "艾瑟瑞亞破曉神刃", tier: 10, reqLv: 50, atk: 400, shieldBreak: 2, bpGainBonus: 1,
      element: "全屬性", desc: "【終極傳說】額外削盾 +2、每擊回復 10% 生命、額外充能 BP",
      cost: { starIron: 20, goldLeaf: 12, magmaScale: 10, coreDragon: 4 }
    }
  };

  // 3. 六階防具鎧甲表 (提供 DEF 減傷、MaxHP 加成與極寒/熔岩環境抗性)
  const ARMORS = {
    a_cloth: {
      id: "a_cloth", name: "新手旅人布衣", tier: 1, reqLv: 1, def: 6, hpBonus: 0,
      desc: "輕便的旅人布衣，提供基礎防護。", cost: {}
    },
    a_vine: {
      id: "a_vine", name: "翠風堅韌藤甲", tier: 2, reqLv: 3, def: 18, hpBonus: 50,
      desc: "以森林老藤與原木編織的護甲，大幅減少第一區魔物反擊傷害。",
      cost: { wood: 6, vine: 4, herb: 4, coreBamboo: 1 }
    },
    a_mithril: {
      id: "a_mithril", name: "岩窟秘銀鎖甲", tier: 3, reqLv: 8, def: 42, hpBonus: 120,
      desc: "結合流沙秘銀與洞窟硬甲殼打造的鎖子甲，防禦力出色。",
      cost: { mithril: 10, shell: 6, iron: 10, coreSkull: 2 }
    },
    a_siren: {
      id: "a_siren", name: "潮汐海鱗戰鎧", tier: 4, reqLv: 16, def: 78, hpBonus: 220,
      desc: "鑲有深海珊瑚的波紋戰鎧，可承受海岸巨獸的重擊。",
      cost: { mithril: 14, coral: 8, fish: 4, coreSiren: 2 }
    },
    a_frost: {
      id: "a_frost", name: "霜狼禦寒毛皮甲", tier: 5, reqLv: 26, def: 130, hpBonus: 360,
      resistCold: true,
      desc: "【極寒抗性】永久免疫第四區「霜語雪原」的暴風雪凍傷！",
      cost: { iceLotus: 8, fur: 8, mithril: 14, coreWolf: 2 }
    },
    a_dragon: {
      id: "a_dragon", name: "黑曜龍鱗神鎧", tier: 6, reqLv: 38, def: 215, hpBonus: 580,
      resistAll: true,
      desc: "【全環境免疫】永久免疫雪原凍傷與第五區「熔岩火山」的高溫灼傷！",
      cost: { obsidian: 18, magmaScale: 10, starIron: 6, coreGolem: 2, coreDragon: 1 }
    }
  };

  // 4. 六大魔物核心「符文鑲嵌」效果表 (可自由鑲嵌於武器與防具孔位)
  const RUNES = {
    coreBamboo: {
      id: "coreBamboo", name: "竹精木心符文", title: "生機共鳴",
      desc: "鑲嵌效果：戰鬥中每次答對題目，自動額外回復 +20 HP。"
    },
    coreSkull: {
      id: "coreSkull", name: "骷髏魂火符文", title: "噬魂吸血",
      desc: "鑲嵌效果：攻擊造成傷害時，吸取 20% 傷害值轉化為自身 HP。"
    },
    coreSiren: {
      id: "coreSiren", name: "海妖水核符文", title: "潮汐反甲",
      desc: "鑲嵌效果：開啟【舉盾】防禦時，將敵人 100% 攻擊力反彈回敵人身上！"
    },
    coreWolf: {
      id: "coreWolf", name: "雪狼冰魄符文", title: "極寒先制",
      desc: "鑲嵌效果：進入戰鬥第 1 回合自動冰封敵人，令敵人首回合無法反擊！"
    },
    coreGolem: {
      id: "coreGolem", name: "炎魔熔核符文", title: "熔岩狂暴",
      desc: "鑲嵌效果：基礎攻擊力直接 +25，且未破防時的護盾穿透傷害 +25%。"
    },
    coreDragon: {
      id: "coreDragon", name: "龍王逆鱗符文", title: "破曉處決",
      desc: "鑲嵌效果：對處於 BREAK 破防暈眩狀態的敵人，造成的暴擊傷害額外 +50%！"
    }
  };

  // 5. 營地燉肉鍋「行前料理」配方表 (持續 3 場戰鬥)
  const CAMP_MEALS = {
    meal_soup: {
      id: "meal_soup", name: "微光蘑菇濃湯", battles: 3,
      cost: { herb: 2, wood: 1 },
      desc: "持續 3 場戰鬥：最大生命值臨時 +80，且每回合自動再生 +15 HP。"
    },
    meal_fish: {
      id: "meal_fish", name: "香煎秘銀魚排", battles: 3,
      cost: { fish: 2, herb: 1 },
      desc: "持續 3 場戰鬥：每次答對題目，額外多削減 1 點護盾（破盾 +1）！"
    },
    meal_steak: {
      id: "meal_steak", name: "野味藤椒烤肉", battles: 3,
      cost: { vine: 2, flower: 2 },
      desc: "持續 3 場戰鬥：戰鬥開局額外 +1 顆 BP 珠，且造成傷害 +20%。"
    },
    meal_hotpot: {
      id: "meal_hotpot", name: "暖陽抗寒抗熱火鍋", battles: 3,
      cost: { flower: 3, herb: 2, wood: 2 },
      desc: "持續 3 場戰鬥與探索：獲得【極寒與熔岩免疫】，無防具亦可深入雪原與火山！"
    }
  };

  // 6. 三大輔助聖物飾品配方
  const RELICS = {
    r_cloak: {
      id: "r_cloak", name: "翠風旅人披風", reqLv: 4,
      desc: "永久生效：最大生命上限 +50，大世界移動速度 +15%",
      cost: { wood: 8, vine: 5, flower: 6, coreBamboo: 2 },
      onCraft: function() { window.Aetheria.State.recalcMaxHp(); }
    },
    r_ring: {
      id: "r_ring", name: "學者智慧指環", reqLv: 10,
      desc: "永久生效：所有四選一題目自動排除 1 個錯誤選項",
      cost: { mithril: 12, herb: 10, shell: 5, coreSkull: 2 }
    },
    r_charm: {
      id: "r_charm", name: "幸運尋寶護符", reqLv: 18,
      desc: "永久生效：採集礦石、靈草與垂釣時 50% 機率雙倍產量",
      cost: { mithril: 16, coral: 8, obsidian: 4, coreSiren: 2 }
    }
  };

  // 7. 四大探索工具升級鏈
  const TOOLS_UPGRADE = {
    pickaxe: {
      name: "十字鎬",
      levels: {
        1: { title: "新手鐵鎬", desc: "可開採基礎藍晶礦脈。" },
        2: { title: "秘銀重鎬", reqLv: 4, desc: "可敲碎地圖上的「擋路玄武巨石」，挖礦與完美採集產量 +1", cost: { iron: 10, wood: 6, coreBamboo: 2 } },
        3: { title: "星隕鑽頭", reqLv: 16, desc: "全礦脈與完美採集產量直接翻倍 (x2)", cost: { mithril: 16, obsidian: 6, coreSkull: 3 } }
      }
    },
    axe: {
      name: "伐木斧",
      levels: {
        1: { title: "石製手斧", desc: "可採集老樹樁原木與靈花（採植物必得原木 +1）。" },
        2: { title: "烈焰戰斧", reqLv: 4, desc: "可砍斷地圖上的「擋路巨型枯木」，植物與原木產量 +1", cost: { iron: 8, vine: 5, wood: 6, coreBamboo: 2 } },
        3: { title: "雷鳴神斧", reqLv: 16, desc: "伐木與採集植物時 45% 機率額外掉落【靈獸誘餌果】", cost: { mithril: 14, flower: 12, coreSkull: 3 } }
      }
    },
    bomb: {
      name: "爆破袋",
      levels: {
        1: { title: "基礎火藥袋", desc: "可使用炸彈炸開洞穴「裂縫岩壁」進入隱藏賞金首密室。" },
        2: { title: "連環爆破袋", reqLv: 6, desc: "進入戰鬥時自動先炸裂敵人 1 點護盾", cost: { iron: 10, mithril: 6, shell: 4, coreBamboo: 2 } },
        3: { title: "符文爆破核心", reqLv: 20, desc: "進入戰鬥時自動炸裂敵人 2 點護盾", cost: { obsidian: 12, coreSiren: 3, coreDragon: 1 } }
      }
    },
    hook: {
      name: "釣竿與抓鉤",
      levels: {
        1: { title: "竹製釣魚竿", desc: "可在水波釣魚點按 A 鍵垂釣銀鱗鮮魚與秘銀。" },
        2: { title: "鐵索飛爪鉤", reqLv: 5, desc: "對準「抓鉤木樁」按 A 鍵，直接飛越河流與斷崖", cost: { iron: 8, wood: 8, vine: 4, coreBamboo: 1 } },
        3: { title: "深海黃金鉤", reqLv: 18, desc: "垂釣時必獲銀鱗鮮魚 x2、秘銀與靈獸誘餌果", cost: { mithril: 14, coral: 8, coreSiren: 2 } }
      }
    }
  };

  // 8. 萬能煉金轉化爐
  const ALCHEMY_CONVERSIONS = [
    { id: "conv_mithril",  name: "提煉【流沙秘銀礦 x1】", fromKey: "iron",     fromCount: 4, toKey: "mithril",    toCount: 1 },
    { id: "conv_obsidian", name: "熔煉【熔岩黑曜石 x1】", fromKey: "mithril",  fromCount: 4, toKey: "obsidian",   toCount: 1 },
    { id: "conv_star",     name: "凝聚【深淵星隕鐵 x1】", fromKey: "obsidian", fromCount: 4, toKey: "starIron",   toCount: 1 },
    { id: "conv_lotus",    name: "結晶【雪山冰蓮 x1】",   fromKey: "flower",   fromCount: 4, toKey: "iceLotus",   toCount: 1 },
    { id: "conv_goldleaf", name: "昇華【世界樹金葉 x1】", fromKey: "iceLotus", fromCount: 3, toKey: "goldLeaf",   toCount: 1 },
    { id: "conv_heal",     name: "熬製【生命藥水 x1】",   fromKey: "herb",     fromCount: 2, toKey: "potionHeal", toCount: 1 },
    { id: "conv_hint",     name: "提煉【洞察藥水 x1】",   fromKey: "flower",   fromCount: 2, toKey: "potionHint", toCount: 1 },
    { id: "conv_bomb",     name: "製作【爆破炸彈 x1】",   fromKey: "iron",     fromCount: 3, toKey: "bombItem",   toCount: 1 },
    { id: "conv_fruit",    name: "調配【靈獸誘餌果 x1】", fromKey: "flower",   fromCount: 3, toKey: "tameFruit",  toCount: 1 }
  ];

  // 9. 行商金幣補給商店
  const GOLD_SHOP = [
    { id: "shop_wood",  name: "購買【翠風原木 x2】",   goldCost: 30,  toKey: "wood",       toCount: 2 },
    { id: "shop_iron",  name: "購買【藍晶鐵礦 x2】",   goldCost: 40,  toKey: "iron",       toCount: 2 },
    { id: "shop_vine",  name: "購買【堅韌藤蔓 x2】",   goldCost: 45,  toKey: "vine",       toCount: 2 },
    { id: "shop_heal",  name: "購買【生命藥水 x1】",   goldCost: 35,  toKey: "potionHeal", toCount: 1 },
    { id: "shop_hint",  name: "購買【洞察藥水 x1】",   goldCost: 50,  toKey: "potionHint", toCount: 1 },
    { id: "shop_bomb",  name: "購買【爆破炸彈 x1】",   goldCost: 60,  toKey: "bombItem",   toCount: 1 },
    { id: "shop_fruit", name: "購買【靈獸誘餌果 x1】", goldCost: 80,  toKey: "tameFruit",  toCount: 1 }
  ];

  function canAfford(inventory, costObj) {
    for (const [matKey, reqCount] of Object.entries(costObj || {})) {
      if ((inventory[matKey] || 0) < reqCount) return false;
    }
    return true;
  }

  function payCost(inventory, costObj) {
    if (!canAfford(inventory, costObj)) return false;
    for (const [matKey, reqCount] of Object.entries(costObj || {})) {
      inventory[matKey] -= reqCount;
    }
    return true;
  }

  function formatCostText(inventory, costObj) {
    const parts = [];
    for (const [matKey, reqCount] of Object.entries(costObj || {})) {
      const mat = MATERIALS[matKey] || { name: matKey };
      const have = inventory[matKey] || 0;
      const color = have >= reqCount ? "#2d6a4f" : "#c1121f";
      parts.push('<span style="color:' + color + '; font-weight:900;">' + mat.name + ' ' + have + '/' + reqCount + '</span>');
    }
    return parts.join("｜") || "初始裝備";
  }

  window.Aetheria.Data.MATERIALS = MATERIALS;
  window.Aetheria.Data.WEAPONS = WEAPONS;
  window.Aetheria.Data.ARMORS = ARMORS;
  window.Aetheria.Data.RUNES = RUNES;
  window.Aetheria.Data.CAMP_MEALS = CAMP_MEALS;
  window.Aetheria.Data.RELICS = RELICS;
  window.Aetheria.Data.TOOLS_UPGRADE = TOOLS_UPGRADE;
  window.Aetheria.Data.ALCHEMY_CONVERSIONS = ALCHEMY_CONVERSIONS;
  window.Aetheria.Data.GOLD_SHOP = GOLD_SHOP;
  window.Aetheria.Data.CraftingHelper = { canAfford: canAfford, payCost: payCost, formatCostText: formatCostText };
})();
