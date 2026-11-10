/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 進階鍛造配方、等級門檻與破防核心要求庫 (items-crafting.js - v3.4)
 * 升級：大幅提高各階神兵、工具與聖物的素材數量，並綁定角色等級 (reqLv) 與魔物破防核心！
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  const MATERIALS = {
    iron:       { id: "iron",       name: "藍晶鐵礦",   tier: 1, desc: "翠風森林常見的基礎鍛造礦石。" },
    mithril:    { id: "mithril",    name: "流沙秘銀礦", tier: 2, desc: "蘊含魔力的銀白礦石，產自洞窟與峽谷。" },
    obsidian:   { id: "obsidian",   name: "熔岩黑曜石", tier: 3, desc: "火山高溫凝結的黑晶，用於鍛造高階神兵。" },
    starIron:   { id: "starIron",   name: "深淵星隕鐵", tier: 4, desc: "自天界墜落的神話金屬，散發星辰微光。" },
    herb:       { id: "herb",       name: "紅傘微光菇", tier: 1, desc: "散發微光的森林蘑菇，可用於鍛造與煉藥。" },
    flower:     { id: "flower",     name: "翠風太陽花", tier: 1, desc: "向陽盛開的靈花，蘊含純淨生命力。" },
    iceLotus:   { id: "iceLotus",   name: "雪山冰蓮",   tier: 3, desc: "極寒雪原永不凋謝的冰蓮，高階附魔素材。" },
    goldLeaf:   { id: "goldLeaf",   name: "世界樹金葉", tier: 4, desc: "天界浮空神殿飄落的金葉，蘊含破曉之力。" },
    wood:       { id: "wood",       name: "翠風原木",   tier: 1, desc: "堅韌的森林木材，用於擴建營地與升級工具。" },
    coreBamboo: { id: "coreBamboo", name: "竹精木心",   tier: 1, desc: "【破防擊殺專屬】將竹子妖打入 BREAK 狀態擊敗後掉落。" },
    coreSkull:  { id: "coreSkull",  name: "骷髏魂火",   tier: 2, desc: "【破防擊殺專屬】將骷髏兵打入 BREAK 狀態擊敗後掉落。" },
    coreDragon: { id: "coreDragon", name: "龍王逆鱗",   tier: 4, desc: "【破防擊殺專屬】將區域 Boss 打入 BREAK 狀態擊敗後掉落。" },
    potionHeal: { id: "potionHeal", name: "生命藥水",   tier: 1, desc: "飲用後立即回復 60 點生命值。" },
    potionHint: { id: "potionHint", name: "洞察藥水",   tier: 2, desc: "英文全盲串字時，顯示首尾字母與字數提示。" },
    bombItem:   { id: "bombItem",   name: "爆破炸彈",   tier: 2, desc: "在地圖上炸開「裂縫岩壁」開啟隱藏密室。" },
    tameFruit:  { id: "tameFruit",  name: "靈獸誘餌果", tier: 2, desc: "在魔物破防殘血時投擲，答對題目即可收服。" }
  };

  // 六階代表性神兵配方表 (加入 reqLv 等級門檻 + 破防魔物核心要求)
  const WEAPONS = {
    w_starter: {
      id: "w_starter",
      name: "新手蒼藍忍刀",
      tier: 1,
      reqLv: 1,
      atk: 15,
      shieldBreak: 0,
      element: "物理",
      desc: "共鳴者初始佩刀，輕巧順手。",
      cost: {}
    },
    w_tide: {
      id: "w_tide",
      name: "潮汐破盾忍刀",
      tier: 2,
      reqLv: 3,
      atk: 38,
      shieldBreak: 1,
      element: "水屬",
      desc: "每次答對額外削盾 +1（需破防擊敗竹子妖取得木心）",
      cost: { iron: 12, herb: 8, wood: 6, coreBamboo: 2 }
    },
    w_flame: {
      id: "w_flame",
      name: "赤炎連斬太刀",
      tier: 3,
      reqLv: 8,
      atk: 72,
      shieldBreak: 1,
      spellBonus: 1.35,
      element: "火屬",
      desc: "額外削盾 +1，答對拼字題傷害 +35%",
      cost: { mithril: 15, flower: 10, coreBamboo: 5, coreSkull: 2 }
    },
    w_thunder: {
      id: "w_thunder",
      name: "雷鳴疾風雙刃",
      tier: 4,
      reqLv: 16,
      atk: 120,
      shieldBreak: 1,
      bpGainBonus: 1,
      element: "雷屬",
      desc: "額外削盾 +1，每次答對額外多獲 1 顆 BP 增幅珠",
      cost: { mithril: 25, obsidian: 10, coreSkull: 6 }
    },
    w_frost: {
      id: "w_frost",
      name: "永凍冰龍神劍",
      tier: 5,
      reqLv: 28,
      atk: 185,
      shieldBreak: 2,
      element: "冰屬",
      desc: "每次答對直接削減 3 點護盾，對 Boss 造成毀滅壓制",
      cost: { obsidian: 20, iceLotus: 14, coreSkull: 10, coreDragon: 2 }
    },
    w_dawn: {
      id: "w_dawn",
      name: "艾瑟瑞亞破曉神刃",
      tier: 6,
      reqLv: 45,
      atk: 300,
      shieldBreak: 2,
      bpGainBonus: 1,
      element: "全屬性",
      desc: "全屬性破盾 +2、每擊回復生命、額外充能 BP",
      cost: { starIron: 25, goldLeaf: 15, coreDragon: 5 }
    }
  };

  // 三大聖物飾品配方 (提高素材與等級要求)
  const RELICS = {
    r_cloak: {
      id: "r_cloak",
      name: "翠風旅人披風",
      reqLv: 4,
      desc: "永久生效：最大生命上限 +50，大世界移動速度 +15%",
      cost: { wood: 10, flower: 8, coreBamboo: 2 },
      onCraft: function(state) {
        state.maxHp += 50;
        state.hp = state.maxHp;
      }
    },
    r_ring: {
      id: "r_ring",
      name: "學者智慧指環",
      reqLv: 10,
      desc: "永久生效：所有四選一題目自動排除 1 個錯誤選項",
      cost: { mithril: 14, herb: 12, coreSkull: 3 }
    },
    r_charm: {
      id: "r_charm",
      name: "幸運尋寶護符",
      reqLv: 18,
      desc: "永久生效：採集礦石、靈草與垂釣時 50% 機率雙倍產量",
      cost: { mithril: 18, obsidian: 6, coreSkull: 5 }
    }
  };

  // 四大探索工具升級鏈 (提高升級門檻，需收集足夠礦石、木材與魔物核心)
  const TOOLS_UPGRADE = {
    pickaxe: {
      name: "十字鎬",
      levels: {
        1: { title: "新手鐵鎬", desc: "可開採基礎藍晶礦脈。" },
        2: { title: "秘銀重鎬", reqLv: 4, desc: "可敲碎地圖上的「擋路玄武巨石」，挖礦產量 +1", cost: { iron: 12, wood: 8, coreBamboo: 2 } },
        3: { title: "星隕鑽頭", reqLv: 16, desc: "全礦脈採集產量直接翻倍 (x2)", cost: { mithril: 18, obsidian: 8, coreSkull: 4 } }
      }
    },
    axe: {
      name: "伐木斧",
      levels: {
        1: { title: "石製手斧", desc: "可採集基礎原木與靈花。" },
        2: { title: "烈焰戰斧", reqLv: 4, desc: "可砍斷地圖上的「擋路巨型枯木」，採集植物 +1", cost: { iron: 10, herb: 8, wood: 8, coreBamboo: 2 } },
        3: { title: "雷鳴神斧", reqLv: 16, desc: "採集植物時 45% 機率額外掉落【靈獸誘餌果】", cost: { mithril: 16, flower: 14, coreSkull: 4 } }
      }
    },
    bomb: {
      name: "爆破袋",
      levels: {
        1: { title: "基礎火藥袋", desc: "可使用炸彈炸開洞穴「裂縫岩壁」進入隱藏寶庫。" },
        2: { title: "連環爆破袋", reqLv: 6, desc: "進入戰鬥時自動先炸裂敵人 1 點護盾", cost: { iron: 12, mithril: 8, coreBamboo: 3 } },
        3: { title: "符文爆破核心", reqLv: 20, desc: "進入戰鬥時自動炸裂敵人 2 點護盾", cost: { obsidian: 14, coreSkull: 6, coreDragon: 1 } }
      }
    },
    hook: {
      name: "釣竿與抓鉤",
      levels: {
        1: { title: "竹製釣魚竿", desc: "可在水波釣魚點按 A 鍵垂釣。" },
        2: { title: "鐵索飛爪鉤", reqLv: 5, desc: "對準「抓鉤木樁」按 A 鍵，直接飛越河流與斷崖", cost: { iron: 10, wood: 10, coreBamboo: 2 } },
        3: { title: "深海黃金鉤", reqLv: 18, desc: "垂釣時必獲高階秘銀、冰蓮與靈獸誘餌果", cost: { mithril: 16, iceLotus: 8, coreSkull: 4 } }
      }
    }
  };

  // 萬能煉金轉化爐 (4 低階換 1 高階)
  const ALCHEMY_CONVERSIONS = [
    { id: "conv_mithril",  name: "提煉【流沙秘銀礦 x1】", fromKey: "iron",     fromCount: 4, toKey: "mithril",    toCount: 1 },
    { id: "conv_obsidian", name: "熔煉【熔岩黑曜石 x1】", fromKey: "mithril",  fromCount: 4, toKey: "obsidian",   toCount: 1 },
    { id: "conv_star",     name: "凝聚【深淵星隕鐵 x1】", fromKey: "obsidian", fromCount: 4, toKey: "starIron",   toCount: 1 },
    { id: "conv_lotus",    name: "結晶【雪山冰蓮 x1】",   fromKey: "flower",   fromCount: 4, toKey: "iceLotus",   toCount: 1 },
    { id: "conv_goldleaf", name: "昇華【世界樹金葉 x1】", fromKey: "iceLotus", fromCount: 3, toKey: "goldLeaf",   toCount: 1 },
    { id: "conv_heal",     name: "熬製【生命藥水 x1】",   fromKey: "herb",     fromCount: 3, toKey: "potionHeal", toCount: 1 },
    { id: "conv_hint",     name: "提煉【洞察藥水 x1】",   fromKey: "flower",   fromCount: 3, toKey: "potionHint", toCount: 1 },
    { id: "conv_bomb",     name: "製作【爆破炸彈 x1】",   fromKey: "iron",     fromCount: 3, toKey: "bombItem",   toCount: 1 },
    { id: "conv_fruit",    name: "調配【靈獸誘餌果 x1】", fromKey: "flower",   fromCount: 3, toKey: "tameFruit",  toCount: 1 }
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
  window.Aetheria.Data.RELICS = RELICS;
  window.Aetheria.Data.TOOLS_UPGRADE = TOOLS_UPGRADE;
  window.Aetheria.Data.ALCHEMY_CONVERSIONS = ALCHEMY_CONVERSIONS;
  window.Aetheria.Data.CraftingHelper = { canAfford: canAfford, payCost: payCost, formatCostText: formatCostText };
})();
