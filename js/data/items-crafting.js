/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 嚴格分區素材、無衝突配方與工具等級庫 (items-crafting.js - v5.0)
 * 優化：1.所有採集每次嚴格 +1，全面調校 10 階武器、6 階防具與工具配方數量 (2~6 個)，零死鎖！
 *       2.明確標示每種素材的「出現區域」與「所需工具等級 (Lv.1 / Lv.2 / Lv.3)」
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  // 1. 26 種分區素材（明確定義等級 tier 與採集所需工具等級）
  const MATERIALS = {
    // 礦石類 (十字鎬開採)
    iron:        { id: "iron",        name: "藍晶鐵礦",     tier: 1, desc: "【第1區：翠風森林｜需Lv.1鐵鎬】基礎鍛造礦石，每次採集 +1。" },
    mithril:     { id: "mithril",     name: "流沙秘銀礦",   tier: 2, desc: "【第1-B洞窟 & 第2區峽谷｜需Lv.2秘銀重鎬】蘊含魔力的銀白礦石。" },
    obsidian:    { id: "obsidian",    name: "熔岩黑曜石",   tier: 3, desc: "【第4區雪原深處 & 第5區火山｜需Lv.3星隕鑽頭】高溫凝結的黑曜晶礦。" },
    starIron:    { id: "starIron",    name: "深淵星隕鐵",   tier: 4, desc: "【第6區：天界聖殿｜需Lv.3星隕鑽頭】自星界墜落的神話金屬。" },
    // 木材與靈植類 (伐木斧採集)
    wood:        { id: "wood",        name: "翠風原木",     tier: 1, desc: "【第1區：翠風森林｜需Lv.1手斧】砍伐老樹樁獲得，每次採集 +1。" },
    herb:        { id: "herb",        name: "紅傘微光菇",   tier: 1, desc: "【第1區森林 & 洞窟｜需Lv.1手斧】微光森林蘑菇，用於鍛造與煲湯。" },
    vine:        { id: "vine",        name: "堅韌藤蔓",     tier: 1, desc: "【第1區：翠風森林｜需Lv.1手斧】採集藤蔓叢或擊敗竹子妖獲得。" },
    flower:      { id: "flower",      name: "翠風太陽花",   tier: 2, desc: "【第2區峽谷 & 第3區海岸｜需Lv.2烈焰戰斧】向陽盛開的高階靈花。" },
    iceLotus:    { id: "iceLotus",    name: "雪山冰蓮",     tier: 3, desc: "【第4區：霜語雪原｜需Lv.2烈焰戰斧】極寒雪原永不凋謝的冰蓮。" },
    goldLeaf:    { id: "goldLeaf",    name: "世界樹金葉",   tier: 4, desc: "【第6區：天界聖殿｜需Lv.3雷鳴神斧】浮空聖殿飄落的神聖金葉。" },
    // 各區專屬生態素材與漁獲
    shell:       { id: "shell",       name: "洞窟硬甲殼",   tier: 2, desc: "【第1-B洞窟 & 第2區峽谷】擊敗骷髏衛兵與甲殼怪掉落。" },
    coral:       { id: "coral",       name: "深海珊瑚",     tier: 2, desc: "【第3區：翡翠海岸｜需Lv.2秘銀重鎬】採集海岸珊瑚礁或擊敗海盜獲得。" },
    fur:         { id: "fur",         name: "霜狼禦寒毛皮", tier: 3, desc: "【第4區：霜語雪原】擊敗雪原魔物掉落，縫製抗寒防具必備。" },
    magmaScale:  { id: "magmaScale",  name: "熔岩龍鱗",     tier: 3, desc: "【第5區：熔岩火山】擊敗火山魔將掉落，打造耐火神鎧必備。" },
    fish:        { id: "fish",        name: "銀鱗鮮魚",     tier: 2, desc: "【水波釣魚點】完成垂釣小遊戲獲得，可於營地烹調破盾魚排。" },
    tabletShard: { id: "tabletShard", name: "古文明聖碑殘片", tier: 4, desc: "【領主/賞金首掉落】於公會修復四大古文明聖碑，解鎖永久神恩。" },
    // 6 大魔物破防核心
    coreBamboo:  { id: "coreBamboo",  name: "竹精木心",     tier: 1, desc: "【第1區竹子妖 BREAK 破防掉落】可鍛造，或鑲嵌：每回回血 +20。" },
    coreSkull:   { id: "coreSkull",   name: "骷髏魂火",     tier: 2, desc: "【洞窟/峽谷骷髏 BREAK 破防掉落】可鍛造，或鑲嵌：20% 攻擊吸血。" },
    coreSiren:   { id: "coreSiren",   name: "海妖水核",     tier: 2, desc: "【第3區海岸魔物 BREAK 破防掉落】可鍛造，或鑲嵌：舉盾反彈 100% 傷害。" },
    coreWolf:    { id: "coreWolf",    name: "雪狼冰魄",     tier: 3, desc: "【第4區雪原魔物 BREAK 破防掉落】可鍛造，或鑲嵌：開局冰封敵人 1 回合。" },
    coreGolem:   { id: "coreGolem",   name: "炎魔熔核",     tier: 3, desc: "【第5區火山魔物 BREAK 破防掉落】可鍛造，或鑲嵌：攻擊+25、護盾穿透。" },
    coreDragon:  { id: "coreDragon",  name: "龍王逆鱗",     tier: 4, desc: "【守關領主 Boss BREAK 破防掉落】可鍛造，或鑲嵌：破防暴擊傷害 +50%。" },
    // 消耗品
    potionHeal:  { id: "potionHeal",  name: "生命藥水",     tier: 1, desc: "飲用後回復 70 點生命值（科學聖碑神恩可翻倍至 140 點）。" },
    potionHint:  { id: "potionHint",  name: "洞察藥水",     tier: 2, desc: "英文全盲串字時，顯示首尾字母與字數提示。" },
    bombItem:    { id: "bombItem",    name: "爆破炸彈",     tier: 2, desc: "在地圖上炸開「裂縫岩壁」開啟隱藏賞金首密室。" },
    tameFruit:   { id: "tameFruit",   name: "靈獸誘餌果",   tier: 2, desc: "在魔物破防殘血時投擲，答對題目即可收服。" }
  };

  // 2. 十階神兵配方表 (配合每次採集 +1，數量精準控制在 2~6 個，且嚴格對應各區產出)
  const WEAPONS = {
    w_starter: {
      id: "w_starter", name: "新手蒼藍忍刀", tier: 1, reqLv: 1, atk: 15, shieldBreak: 0,
      element: "物理", desc: "共鳴者初始佩刀，輕巧順手。", cost: {}
    },
    w_vine: {
      id: "w_vine", name: "翠風荊棘短刃", tier: 2, reqLv: 2, atk: 30, shieldBreak: 0,
      element: "木屬", desc: "以森林原木、藍晶與藤蔓打造的短刃（全部素材可於第1區以 Lv.1 工具採集）。",
      cost: { wood: 3, iron: 3, vine: 2 }
    },
    w_tide: {
      id: "w_tide", name: "潮汐破盾忍刀", tier: 3, reqLv: 4, atk: 48, shieldBreak: 1,
      element: "水屬", desc: "【特效】每次答對額外削盾 +1（挑戰第一區守關領主必備）",
      cost: { iron: 4, herb: 3, wood: 3, coreBamboo: 1 }
    },
    w_bone: {
      id: "w_bone", name: "岩窟碎甲重刃", tier: 4, reqLv: 7, atk: 72, shieldBreak: 1,
      element: "地屬", desc: "【特效】額外削盾 +1，結合洞窟秘銀與硬甲殼鍛造。",
      cost: { mithril: 3, shell: 3, iron: 4, coreBamboo: 2 }
    },
    w_flame: {
      id: "w_flame", name: "赤炎連斬太刀", tier: 5, reqLv: 11, atk: 102, shieldBreak: 1, spellBonus: 1.35,
      element: "火屬", desc: "【特效】額外削盾 +1，答對拼字題傷害 +35%",
      cost: { mithril: 4, flower: 3, shell: 3, coreSkull: 1 }
    },
    w_coral: {
      id: "w_coral", name: "淵海珊瑚雙刃", tier: 6, reqLv: 16, atk: 140, shieldBreak: 1, bpGainBonus: 1,
      element: "水屬", desc: "【特效】額外削盾 +1，每次答對多充能 1 顆 BP 珠",
      cost: { coral: 4, fish: 2, mithril: 4, coreSiren: 1 }
    },
    w_thunder: {
      id: "w_thunder", name: "雷鳴疾風雙刃", tier: 7, reqLv: 22, atk: 185, shieldBreak: 1, bpGainBonus: 1,
      element: "雷屬", desc: "【特效】額外削盾 +1，高速雷鳴連擊並額外充能 BP",
      cost: { coral: 5, flower: 4, mithril: 5, coreSiren: 2 }
    },
    w_frost: {
      id: "w_frost", name: "永凍冰龍神劍", tier: 8, reqLv: 30, atk: 245, shieldBreak: 2,
      element: "冰屬", desc: "【特效】每次答對直接額外削盾 +2，壓制雪原與火山領主",
      cost: { iceLotus: 4, fur: 4, obsidian: 3, coreWolf: 2 }
    },
    w_magma: {
      id: "w_magma", name: "紅蓮煉獄巨劍", tier: 9, reqLv: 40, atk: 320, shieldBreak: 2, spellBonus: 1.5,
      element: "火屬", desc: "【特效】額外削盾 +2，拼字與看圖題暴擊傷害 +50%",
      cost: { obsidian: 5, magmaScale: 4, coreGolem: 2, coreDragon: 1 }
    },
    w_dawn: {
      id: "w_dawn", name: "艾瑟瑞亞破曉神刃", tier: 10, reqLv: 50, atk: 420, shieldBreak: 2, bpGainBonus: 1,
      element: "全屬性", desc: "【終極傳說】額外削盾 +2、每擊回復 10% 生命、額外充能 BP",
      cost: { starIron: 6, goldLeaf: 5, magmaScale: 4, coreDragon: 2 }
    }
  };

  // 3. 六階防具鎧甲表 (數量合理化為 2~5 個)
  const ARMORS = {
    a_cloth: {
      id: "a_cloth", name: "新手旅人布衣", tier: 1, reqLv: 1, def: 6, hpBonus: 0,
      desc: "輕便的旅人布衣，提供基礎防護。", cost: {}
    },
    a_vine: {
      id: "a_vine", name: "翠風堅韌藤甲", tier: 2, reqLv: 3, def: 18, hpBonus: 55,
      desc: "以森林藤蔓與原木編織的護甲，大幅減少第一區魔物反擊傷害。",
      cost: { wood: 3, vine: 3, herb: 2, coreBamboo: 1 }
    },
    a_mithril: {
      id: "a_mithril", name: "岩窟秘銀鎖甲", tier: 3, reqLv: 8, def: 44, hpBonus: 130,
      desc: "結合流沙秘銀與洞窟硬甲殼打造的鎖子甲，防禦力出色。",
      cost: { mithril: 3, shell: 3, iron: 3, coreSkull: 1 }
    },
    a_siren: {
      id: "a_siren", name: "潮汐海鱗戰鎧", tier: 4, reqLv: 16, def: 82, hpBonus: 230,
      desc: "鑲有深海珊瑚的波紋戰鎧，可承受海岸巨獸的重擊。",
      cost: { coral: 4, fish: 2, mithril: 3, coreSiren: 1 }
    },
    a_frost: {
      id: "a_frost", name: "霜狼禦寒毛皮甲", tier: 5, reqLv: 26, def: 135, hpBonus: 380,
      resistCold: true,
      desc: "【極寒抗性】永久免疫第四區「霜語雪原」的暴風雪凍傷！",
      cost: { iceLotus: 3, fur: 4, coral: 3, coreWolf: 1 }
    },
    a_dragon: {
      id: "a_dragon", name: "黑曜龍鱗神鎧", tier: 6, reqLv: 38, def: 225, hpBonus: 600,
      resistAll: true,
      desc: "【全環境免疫】永久免疫雪原凍傷與第五區「熔岩火山」的高溫灼傷！",
      cost: { obsidian: 4, magmaScale: 4, iceLotus: 3, coreGolem: 2 }
    }
  };

  // 4. 六大魔物核心「符文鑲嵌」效果表
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
      desc: "鑲嵌效果：基礎攻擊力直接 +25，且未破防時的護盾穿透傷害提升。"
    },
    coreDragon: {
      id: "coreDragon", name: "龍王逆鱗符文", title: "破曉處決",
      desc: "鑲嵌效果：對處於 BREAK 破防暈眩狀態的敵人，造成的暴擊傷害額外 +50%！"
    }
  };

  // 5. 營地燉肉鍋「行前料理」配方表
  const CAMP_MEALS = {
    meal_soup: {
      id: "meal_soup", name: "微光蘑菇濃湯", battles: 3,
      cost: { herb: 2, wood: 1 },
      desc: "持續 3 場戰鬥：最大生命值臨時 +80，且每回合自動再生 +15 HP。"
    },
    meal_fish: {
      id: "meal_fish", name: "香煎秘銀魚排", battles: 3,
      cost: { fish: 1, herb: 1 },
      desc: "持續 3 場戰鬥：每次答對題目，額外多削減 1 點護盾（破盾 +1）！"
    },
    meal_steak: {
      id: "meal_steak", name: "野味藤椒烤肉", battles: 3,
      cost: { vine: 2, herb: 1 },
      desc: "持續 3 場戰鬥：戰鬥開局額外 +1 顆 BP 珠，且造成傷害 +20%。"
    },
    meal_hotpot: {
      id: "meal_hotpot", name: "暖陽抗寒抗熱火鍋", battles: 3,
      cost: { flower: 2, herb: 2, wood: 1 },
      desc: "持續 3 場戰鬥與探索：獲得【極寒與熔岩免疫】，無防具亦可深入雪原與火山！"
    }
  };

  // 6. 三大輔助聖物飾品配方
  const RELICS = {
    r_cloak: {
      id: "r_cloak", name: "翠風旅人披風", reqLv: 4,
      desc: "永久生效：最大生命上限 +50，大世界移動速度 +15%",
      cost: { wood: 3, vine: 3, herb: 2, coreBamboo: 1 },
      onCraft: function() { window.Aetheria.State.recalcMaxHp(); }
    },
    r_ring: {
      id: "r_ring", name: "學者智慧指環", reqLv: 10,
      desc: "永久生效：所有四選一題目自動排除 1 個錯誤選項",
      cost: { mithril: 3, flower: 2, shell: 2, coreSkull: 1 }
    },
    r_charm: {
      id: "r_charm", name: "幸運尋寶護符", reqLv: 18,
      desc: "永久生效：戰鬥金幣與經驗獲取額外 +20%",
      cost: { coral: 3, mithril: 3, fish: 2, coreSiren: 1 }
    }
  };

  // 7. 四大探索工具升級鏈（嚴格避免死循環：升 Lv.2 只需 T1 素材，升 Lv.3 只需 T2 素材！）
  const TOOLS_UPGRADE = {
    pickaxe: {
      name: "十字鎬",
      levels: {
        1: { title: "新手鐵鎬", desc: "可開採第 1 區【藍晶鐵礦】（每次採集 +1）。" },
        2: { title: "秘銀重鎬", reqLv: 4, desc: "可敲碎「擋路巨石」，並可開採 T2【流沙秘銀礦】與【深海珊瑚】！", cost: { iron: 4, wood: 3, coreBamboo: 1 } },
        3: { title: "星隕鑽頭", reqLv: 18, desc: "可開採 T3【熔岩黑曜石】與 T4【深淵星隕鐵】！", cost: { mithril: 4, coral: 3, shell: 3, coreSkull: 1 } }
      }
    },
    axe: {
      name: "伐木斧",
      levels: {
        1: { title: "石製手斧", desc: "可採集第 1 區【翠風原木】、【紅傘微光菇】與【堅韌藤蔓】。" },
        2: { title: "烈焰戰斧", reqLv: 4, desc: "可砍斷「擋路枯木」，並可採集 T2【翠風太陽花】與 T3【雪山冰蓮】！", cost: { wood: 4, vine: 3, iron: 3, coreBamboo: 1 } },
        3: { title: "雷鳴神斧", reqLv: 18, desc: "可採集 T4【世界樹金葉】，且伐木時有機會發現靈獸誘餌果！", cost: { flower: 4, mithril: 3, coral: 2, coreSiren: 1 } }
      }
    },
    bomb: {
      name: "爆破袋",
      levels: {
        1: { title: "基礎火藥袋", desc: "可使用炸彈炸開洞穴「裂縫岩壁」進入隱藏賞金首密室。" },
        2: { title: "連環爆破袋", reqLv: 6, desc: "進入戰鬥時自動先炸裂敵人 1 點護盾", cost: { iron: 4, herb: 3, coreBamboo: 1 } },
        3: { title: "符文爆破核心", reqLv: 20, desc: "進入戰鬥時自動炸裂敵人 2 點護盾", cost: { mithril: 4, coral: 3, coreSiren: 1 } }
      }
    },
    hook: {
      name: "釣竿與抓鉤",
      levels: {
        1: { title: "竹製釣魚竿", desc: "可在水波釣魚點啟動【垂釣小遊戲】釣取銀鱗鮮魚。" },
        2: { title: "鐵索飛爪鉤", reqLv: 5, desc: "對準「抓鉤木樁」按 A 鍵飛越斷崖，且垂釣小遊戲綠色命中區加寬 35%！", cost: { wood: 4, vine: 3, iron: 2 } },
        3: { title: "深海黃金鉤", reqLv: 18, desc: "垂釣小遊戲命中區加寬 70%，完美收竿額外獲深海珊瑚！", cost: { coral: 3, fish: 2, mithril: 3 } }
      }
    }
  };

  // 8. 萬能煉金轉化爐 (3 低階換 1 高階)
  const ALCHEMY_CONVERSIONS = [
    { id: "conv_mithril",  name: "提煉【流沙秘銀礦 x1】", fromKey: "iron",     fromCount: 3, toKey: "mithril",    toCount: 1 },
    { id: "conv_obsidian", name: "熔煉【熔岩黑曜石 x1】", fromKey: "mithril",  fromCount: 3, toKey: "obsidian",   toCount: 1 },
    { id: "conv_star",     name: "凝聚【深淵星隕鐵 x1】", fromKey: "obsidian", fromCount: 3, toKey: "starIron",   toCount: 1 },
    { id: "conv_flower",   name: "培育【翠風太陽花 x1】", fromKey: "herb",     fromCount: 3, toKey: "flower",     toCount: 1 },
    { id: "conv_lotus",    name: "結晶【雪山冰蓮 x1】",   fromKey: "flower",   fromCount: 3, toKey: "iceLotus",   toCount: 1 },
    { id: "conv_goldleaf", name: "昇華【世界樹金葉 x1】", fromKey: "iceLotus", fromCount: 3, toKey: "goldLeaf",   toCount: 1 },
    { id: "conv_heal",     name: "熬製【生命藥水 x1】",   fromKey: "herb",     fromCount: 2, toKey: "potionHeal", toCount: 1 },
    { id: "conv_hint",     name: "提煉【洞察藥水 x1】",   fromKey: "flower",   fromCount: 2, toKey: "potionHint", toCount: 1 },
    { id: "conv_bomb",     name: "製作【爆破炸彈 x1】",   fromKey: "iron",     fromCount: 2, toKey: "bombItem",   toCount: 1 },
    { id: "conv_fruit",    name: "調配【靈獸誘餌果 x1】", fromKey: "herb",     fromCount: 3, toKey: "tameFruit",  toCount: 1 }
  ];

  // 9. 行商金幣補給商店
  const GOLD_SHOP = [
    { id: "shop_wood",  name: "購買【翠風原木 x1】",   goldCost: 25,  toKey: "wood",       toCount: 1 },
    { id: "shop_iron",  name: "購買【藍晶鐵礦 x1】",   goldCost: 30,  toKey: "iron",       toCount: 1 },
    { id: "shop_vine",  name: "購買【堅韌藤蔓 x1】",   goldCost: 30,  toKey: "vine",       toCount: 1 },
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
