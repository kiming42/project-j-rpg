/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 素材、神兵鍛造、聖物飾品、4大工具升級與載具庫 (items-crafting.js - Full v2.5)
 * 補完：1.第4工具「釣魚竿&鐵索抓鉤(Lv.1~3)」 2.矮人齒輪與浮空核心素材 3.三大聖物飾品完整連動
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  // 1. 四階素材與消耗品圖鑑
  const MATERIALS = {
    iron:       { id: "iron",       name: "藍晶鐵礦",   icon: "💎", tier: 1, desc: "翠風森林常見的基礎鍛造礦石。" },
    mithril:    { id: "mithril",    name: "流沙秘銀礦", icon: "🪙", tier: 2, desc: "蘊含魔力的銀白礦石，產自洞窟與峽谷。" },
    obsidian:   { id: "obsidian",   name: "熔岩黑曜石", icon: "🔥", tier: 3, desc: "火山高溫凝結的黑晶，用於鍛造高階神兵。" },
    starIron:   { id: "starIron",   name: "深淵星隕鐵", icon: "🌌", tier: 4, desc: "自天界墜落的神話金屬，散發星辰微光。" },
    herb:       { id: "herb",       name: "紅傘微光菇", icon: "🍄", tier: 1, desc: "散發微光的森林蘑菇，可用於鍛造與燉湯。" },
    flower:     { id: "flower",     name: "翠風太陽花", icon: "🌸", tier: 1, desc: "向陽盛開的靈花，蘊含純淨生命力。" },
    iceLotus:   { id: "iceLotus",   name: "雪山冰蓮",   icon: "🪷", tier: 3, desc: "極寒雪原永不凋謝的冰蓮，高階附魔素材。" },
    goldLeaf:   { id: "goldLeaf",   name: "世界樹金葉", icon: "🌳", tier: 4, desc: "天界浮空神殿飄落的金葉，蘊含破曉之力。" },
    wood:       { id: "wood",       name: "翠風原木",   icon: "🪵", tier: 1, desc: "堅韌的森林木材，用於擴建營地、造船與升級工具。" },
    coreBamboo: { id: "coreBamboo", name: "竹精木心",   icon: "🦴", tier: 1, desc: "【破防擊殺專屬】竹子妖的核心結晶。" },
    coreSkull:  { id: "coreSkull",  name: "骷髏魂火",   icon: "🦴", tier: 2, desc: "【破防擊殺專屬】不滅的幽藍靈魂之火。" },
    coreDragon: { id: "coreDragon", name: "龍王逆鱗",   icon: "🦴", tier: 4, desc: "【破防擊殺專屬】巨龍胸前的傳說逆鱗。" },
    potionHeal: { id: "potionHeal", name: "生命藥水",   icon: "🧪", tier: 1, desc: "戰鬥中立即回復 60 點生命值。" },
    potionHint: { id: "potionHint", name: "洞察藥水",   icon: "🧪", tier: 2, desc: "英文全盲串字時，顯示首尾字母與字數提示。" },
    bombItem:   { id: "bombItem",   name: "爆破炸彈",   icon: "💣", tier: 2, desc: "在地圖上炸開「裂縫岩壁」開啟隱藏密室！" },
    tameFruit:  { id: "tameFruit",  name: "靈獸誘餌果", icon: "🍎", tier: 2, desc: "在魔物破防殘血時投擲，答對題目即可收服！" }
  };

  // 2. 六階代表性神兵配方表
  const WEAPONS = {
    w_starter: {
      id: "w_starter",
      name: "新手蒼藍忍刀",
      tier: 1,
      atk: 15,
      shieldBreak: 0,
      element: "🗡️物理",
      desc: "共鳴者初始佩刀，輕巧順手。",
      cost: {}
    },
    w_tide: {
      id: "w_tide",
      name: "🌊 潮汐破盾忍刀",
      tier: 2,
      atk: 35,
      shieldBreak: 1,
      element: "🌊水屬",
      desc: "【特效】每次答對題目，額外多削減 1 點護盾！",
      cost: { iron: 5, herb: 3 }
    },
    w_flame: {
      id: "w_flame",
      name: "🔥 赤炎連斬太刀",
      tier: 3,
      atk: 65,
      shieldBreak: 1,
      spellBonus: 1.35,
      element: "🔥火屬",
      desc: "【特效】額外削盾 +1，且答對「拼字題」時傷害 +35%！",
      cost: { mithril: 4, flower: 3, coreBamboo: 1 }
    },
    w_thunder: {
      id: "w_thunder",
      name: "⚡ 雷鳴疾風雙刃",
      tier: 4,
      atk: 110,
      shieldBreak: 1,
      bpGainBonus: 1,
      element: "⚡雷屬",
      desc: "【特效】額外削盾 +1，每次答對額外多獲得 1 顆 BP 增幅珠！",
      cost: { mithril: 8, obsidian: 2, coreSkull: 2 }
    },
    w_frost: {
      id: "w_frost",
      name: "❄️ 永凍冰龍神劍",
      tier: 5,
      atk: 175,
      shieldBreak: 2,
      element: "❄️冰屬",
      desc: "【特效】每次答對直接削減 3 點護盾，對 Boss 造成毀滅壓制！",
      cost: { obsidian: 5, iceLotus: 3, coreSkull: 3 }
    },
    w_dawn: {
      id: "w_dawn",
      name: "🌌 艾瑟瑞亞破曉神刃",
      tier: 6,
      atk: 280,
      shieldBreak: 2,
      bpGainBonus: 1,
      element: "🌌全屬性",
      desc: "【終極傳說】全屬性破盾 +2、每擊回復 10% HP、額外獲得 BP！",
      cost: { starIron: 5, goldLeaf: 2, coreDragon: 1 }
    }
  };

  // 3. 三大輔助聖物飾品配方 (可在鐵匠鋪直接鍛造並自動生效！)
  const RELICS = {
    r_cloak: {
      id: "r_cloak",
      name: "🌿 翠風旅人披風",
      desc: "鍛造後永久生效：最大生命上限 +50，大世界移動速度 +15%！",
      cost: { wood: 4, flower: 3 },
      onCraft: function(state) {
        state.maxHp += 50;
        state.hp = state.maxHp;
      }
    },
    r_ring: {
      id: "r_ring",
      name: "🦉 學者智慧指環",
      desc: "鍛造後永久生效：【溫習神器】所有四選一題目自動幫你排除 1 個錯誤選項！",
      cost: { mithril: 3, herb: 4 }
    },
    r_charm: {
      id: "r_charm",
      name: "🍀 幸運尋寶護符",
      desc: "鍛造後永久生效：地圖採集礦石、靈草與釣魚時，50% 機率觸發雙倍產量！",
      cost: { mithril: 4, coreBamboo: 1 }
    }
  };

  // 4. 完整四大探索工具升級鏈 (包含新增的 🎣釣魚竿 & 鐵索抓鉤！)
  const TOOLS_UPGRADE = {
    pickaxe: {
      name: "⛏️ 十字鎬",
      levels: {
        1: { title: "新手鐵鎬", desc: "可開採基礎藍晶礦脈。" },
        2: { title: "秘銀重鎬", desc: "【破障解鎖】可敲碎地圖上的「🪨擋路玄武巨石」，且挖礦產量 +1！", cost: { iron: 5, wood: 2 } },
        3: { title: "星隕鑽頭", desc: "全礦脈採集產量直接翻倍 (x2)，並機率挖出星隕鐵！", cost: { mithril: 6, obsidian: 2 } }
      }
    },
    axe: {
      name: "🪓 伐木斧",
      levels: {
        1: { title: "石製手斧", desc: "可採集基礎原木與靈花。" },
        2: { title: "烈焰戰斧", desc: "【破障解鎖】可砍斷地圖上的「🌲擋路巨型枯木」開闢捷徑，採集植物 +1！", cost: { iron: 4, herb: 3 } },
        3: { title: "雷鳴神斧", desc: "採集植物時 45% 機率額外掉落【🍎靈獸誘餌果】！", cost: { mithril: 5, flower: 4 } }
      }
    },
    bomb: {
      name: "💣 爆破袋",
      levels: {
        1: { title: "基礎火藥袋", desc: "可使用炸彈炸開洞穴「🧱裂縫岩壁」進入隱藏寶庫。" },
        2: { title: "連環爆破袋", desc: "進入戰鬥時自動先炸裂敵人 1 點護盾！", cost: { mithril: 4, coreBamboo: 1 } },
        3: { title: "符文爆破核心", desc: "進入戰鬥時自動炸裂敵人 2 點護盾！", cost: { obsidian: 4, coreSkull: 2 } }
      }
    },
    hook: {
      name: "🎣 釣竿與抓鉤",
      levels: {
        1: { title: "竹製釣魚竿", desc: "可在河邊或海岸「🎣水波釣魚點」按 A 鍵垂釣秘銀魚與寶物！" },
        2: { title: "鐵索飛爪鉤", desc: "【破障解鎖】對準河岸或斷崖的「🪝抓鉤木樁」按 A 鍵，直接飛越斷崖與河流！", cost: { iron: 4, wood: 3 } },
        3: { title: "深海黃金鉤", desc: "釣魚時 100% 釣起高階秘銀、冰蓮或【🍎靈獸誘餌果】！", cost: { mithril: 5, iceLotus: 2 } }
      }
    }
  };

  // 5. 萬能煉金轉化爐 (3 低階換 1 高階，保證所有素材互通)
  const ALCHEMY_CONVERSIONS = [
    { id: "conv_mithril",  name: "🪙 提煉【流沙秘銀礦 x1】", fromKey: "iron",     fromCount: 3, toKey: "mithril",    toCount: 1 },
    { id: "conv_obsidian", name: "🔥 熔煉【熔岩黑曜石 x1】", fromKey: "mithril",  fromCount: 3, toKey: "obsidian",   toCount: 1 },
    { id: "conv_star",     name: "🌌 凝聚【深淵星隕鐵 x1】", fromKey: "obsidian", fromCount: 3, toKey: "starIron",   toCount: 1 },
    { id: "conv_lotus",    name: "🪷 結晶【雪山冰蓮 x1】",   fromKey: "flower",   fromCount: 3, toKey: "iceLotus",   toCount: 1 },
    { id: "conv_goldleaf", name: "🌳 昇華【世界樹金葉 x1】", fromKey: "iceLotus", fromCount: 2, toKey: "goldLeaf",   toCount: 1 },
    { id: "conv_heal",     name: "🧪 熬製【生命藥水 x1】",   fromKey: "herb",     fromCount: 2, toKey: "potionHeal", toCount: 1 },
    { id: "conv_hint",     name: "🧪 提煉【洞察藥水 x1】",   fromKey: "flower",   fromCount: 2, toKey: "potionHint", toCount: 1 },
    { id: "conv_bomb",     name: "💣 製作【爆破炸彈 x1】",   fromKey: "iron",     fromCount: 2, toKey: "bombItem",   toCount: 1 },
    { id: "conv_fruit",    name: "🍎 調配【靈獸誘餌果 x1】", fromKey: "flower",   fromCount: 2, toKey: "tameFruit",  toCount: 1 }
  ];

  function canAfford(inventory, costObj) {
    for (const [matKey, reqCount] of Object.entries(costObj)) {
      if ((inventory[matKey] || 0) < reqCount) return false;
    }
    return true;
  }

  function payCost(inventory, costObj) {
    if (!canAfford(inventory, costObj)) return false;
    for (const [matKey, reqCount] of Object.entries(costObj)) {
      inventory[matKey] -= reqCount;
    }
    return true;
  }

  function formatCostText(inventory, costObj) {
    const parts = [];
    for (const [matKey, reqCount] of Object.entries(costObj)) {
      const mat = MATERIALS[matKey] || { name: matKey, icon: "📦" };
      const have = inventory[matKey] || 0;
      const color = have >= reqCount ? "#5ac54f" : "#ff595e";
      parts.push(`<span style="color:${color};">${mat.icon}${mat.name} ${have}/${reqCount}</span>`);
    }
    return parts.join("｜") || "免費初始裝備";
  }

  window.Aetheria.Data.MATERIALS = MATERIALS;
  window.Aetheria.Data.WEAPONS = WEAPONS;
  window.Aetheria.Data.RELICS = RELICS;
  window.Aetheria.Data.TOOLS_UPGRADE = TOOLS_UPGRADE;
  window.Aetheria.Data.ALCHEMY_CONVERSIONS = ALCHEMY_CONVERSIONS;
  window.Aetheria.Data.CraftingHelper = { canAfford, payCost, formatCostText };
})();
