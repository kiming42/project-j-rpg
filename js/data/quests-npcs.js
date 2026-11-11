/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 7章21主線、四大聖碑共鳴、過場劇本與防刷委託庫 (quests-npcs.js - v4.0)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  // 1. 遊戲過場劇情演出劇本 (Intro & 各區域首次踏入演出)
  const STORY_CUTSCENES = {
    intro: [
      { tag: "序幕・失落符文與靜默災厄", speaker: "星象少女・艾莉婭", text: "「三百年前，支撐艾瑟瑞亞大陸的『四座古文明知識聖碑』遭到蝕憶黑霧吞噬，文字與歷史被抹去，六大疆域的守護神獸也因此墮落暴走……」" },
      { tag: "序幕・失落符文與靜默災厄", speaker: "鐵匠大叔・巴爾", text: "「Justin！你是最後一位能讀懂古文明符文的『記憶共鳴者』。沒有防具與破盾兵刃就盲目衝出營地，只會被暴走的領主瞬間秒殺！」" },
      { tag: "序幕・失落符文與靜默災厄", speaker: "公會會長・雷恩", text: "「先在曙光營地找巴爾領取起步物資，鍛造防具、善用營地鍋爐烹調行前料理，再一步步擊敗各區守關領主、奪回聖碑殘片吧！」" }
    ],
    enter_zone1_forest: [
      { tag: "第一章・翠風迷霧森林", speaker: "同行戰寵・史萊姆", text: "「咕嚕！森林深處瀰漫著紫色黑霧，通往東岸峽谷的木橋被守關領主【千年腐化樹妖王】的荊棘結界徹底封死！」" },
      { tag: "第一章・翠風迷霧森林", speaker: "鐵匠大叔・巴爾（通訊）", text: "「小心！野外魔物只要護盾未破，每回合都會反擊！觀察敵人頭頂的『下回合意圖』，遇到蓄力紅光時記得按【舉盾】減傷，並先收集藤蔓打造藤甲！」" }
    ],
    enter_cave1_mushroom: [
      { tag: "第二章・微光蘑菇洞窟", speaker: "星象少女・艾莉婭（通訊）", text: "「洞窟內視線昏暗，快找到入口附近的『古代火盆』按 A 鍵點燃聖火驅散黑霧！深處還有一道裂縫岩壁，用炸彈炸開或許藏著罕見的紫氣賞金首！」" }
    ],
    enter_zone2_canyon: [
      { tag: "第三章・流沙繩索峽谷", speaker: "公會會長・雷恩（通訊）", text: "「你們成功突破森林了！流沙峽谷的骷髏軍團攻擊力極高，記得在鐵匠鋪把魔物核心『鑲嵌』到武器與防具孔位上，組合出回血或吸血能力！」" }
    ],
    enter_zone3_coast: [
      { tag: "第四章・翡翠沉船海岸", speaker: "神秘行商・奇奇（通訊）", text: "「嘿嘿，沉船灣的海水裡到處都是肥美的『銀鱗鮮魚』！釣幾條魚回營地煮成『香煎秘銀魚排』，接下來的戰鬥每次答對都能多破 1 點盾！」" }
    ],
    enter_zone4_snow: [
      { tag: "第五章・霜語極寒雪原", speaker: "星象少女・艾莉婭（通訊）", text: "「警告！前方是零下四十度的霜語雪原！若未穿戴『霜狼禦寒毛皮甲』或食用營地『暖陽火鍋』，暴風雪會不斷凍傷你的生命！」" }
    ],
    enter_zone5_volcano: [
      { tag: "第六章・赤紅熔岩火山", speaker: "鐵匠大叔・巴爾（通訊）", text: "「這裡的熔岩熱浪足以融化普通鋼鐵！唯有穿戴『黑曜龍鱗神鎧』或依靠火鍋抗性才能深入，擊敗紅蓮火山龍皇就能啟動飛空艇升上天界了！」" }
    ],
    enter_zone6_sky: [
      { tag: "終章・天界浮空聖殿", speaker: "星象少女・艾莉婭（通訊）", text: "「終於抵達雲端之上的天界聖殿了……吞噬大陸記憶的元兇【破曉蝕憶神龍皇】就在前方，展現你累積至今的所有知識共鳴吧！」" }
    ]
  };

  // 2. 四大古文明知識聖碑資料庫 (整合故事卷軸與四科永久神恩)
  const MONOLITHS_DB = {
    chinese: {
      id: "chinese",
      name: "龍語古卷聖碑（中文科）",
      blessTitle: "龍語破陣神恩",
      lore25: "【第一卷】遠古先民以象形與六書鑄造龍語符文，每一筆劃皆蘊含斬斷混沌的鋒芒。",
      lore50: "【第二卷】當共鳴者洞悉字詞真義，刀劍將與龍脈共鳴，揮出無堅不摧的破魔劍氣。",
      lore100: "【終極卷】龍語聖碑完全復甦！失落的華夏古卷重現世間，賦予共鳴者至高劍聖之力。",
      perks: "25點：全武器攻擊力 +15% ｜ 75點：全武器攻擊力 +30%"
    },
    english: {
      id: "english",
      name: "阿爾比恩聖碑（英文科）",
      blessTitle: "星界疾風神恩",
      lore25: "【第一卷】西方阿爾比恩王國將二十六枚字母化為星辰音節，構築出跨越海洋的契約。",
      lore50: "【第二卷】精準拼寫出音節真名者，能引動星界增幅能量，令戰技連綿不絕。",
      lore100: "【終極卷】阿爾比恩聖碑完全復甦！星界語法徹底解封，連勝賞金與能量倍增。",
      perks: "25點：戰鬥開局自動 +1 BP ｜ 75點：連勝經驗與金幣倍率上限升至 2.0x"
    },
    science: {
      id: "science",
      name: "煉金真理聖碑（科學科）",
      blessTitle: "萬物真理神恩",
      lore25: "【第一卷】矮人與煉金術士觀測光學、物態與生態循環，將自然法則銘刻於真理之碑。",
      lore50: "【第二卷】理解能量守恆與催化之道後，尋常藥草亦能提煉出起死回生的奇蹟靈藥。",
      lore100: "【終極卷】煉金真理聖碑完全復甦！萬物元素皆為所用，採集與煉金臻至化境。",
      perks: "25點：生命藥水回復量翻倍(+140 HP) ｜ 75點：野外採集礦石與靈草產量 +1"
    },
    humanities: {
      id: "humanities",
      name: "紀元編年聖碑（人文科）",
      blessTitle: "大地守護神恩",
      lore25: "【第一卷】編年史官走遍山川與城邦，記錄下先祖守護家園的堅毅意志與律法。",
      lore50: "【第二卷】背負歷史記憶的行者，將獲得大地母神的庇護，任何重擊皆無法令其倒下。",
      lore100: "【終極卷】紀元編年聖碑完全復甦！千載文明化為不滅金身，賜予絕境逢生的奇蹟。",
      perks: "50點：最大HP與防禦力永久 +25% ｜ 100點：每場戰鬥獲 1 次【不屈復活(半血重生)】"
    }
  };

  // 3. 完整 7 章節共 21 個推進式主線任務鏈
  const MAIN_QUESTS = [
    // 【序章：曙光營地整備 (1~3)】
    {
      id: "mq_01", chapter: "序章 1/3", title: "與營地鐵匠大叔・巴爾對話",
      desc: "在【0.曙光露營基地】右側找到鐵匠巴爾並按 A 鍵對話，領取新手起步鍛造素材。",
      checkComplete: function(s) { return Boolean(s.questProgress && s.questProgress.mq_01_talked); },
      rewardText: "藍晶鐵礦 x5、翠風原木 x5、堅韌藤蔓 x3、100 G",
      onClaim: function(s) { s.inventory.iron += 5; s.inventory.wood += 5; s.inventory.vine += 3; window.Aetheria.State.gainRewards(40, 100, 10); }
    },
    {
      id: "mq_02", chapter: "序章 2/3", title: "鍛造【翠風荊棘短刃 (T2)】",
      desc: "搜括營地木箱與老樹樁，升至 Lv.2（可找巴爾探查答題升級）並在鍛造台打造 T2 翠風荊棘短刃。",
      checkComplete: function(s) { return s.unlockedWeapons.indexOf("w_vine") !== -1 || s.unlockedWeapons.length >= 2; },
      rewardText: "紅傘微光菇 x4、翠風原木 x4、生命藥水 x2、EXP +60",
      onClaim: function(s) { s.inventory.herb += 4; s.inventory.wood += 4; s.inventory.potionHeal += 2; window.Aetheria.State.gainRewards(60, 80, 10); }
    },
    {
      id: "mq_03", chapter: "序章 3/3", title: "於營地燉肉鍋烹調 1 道行前料理",
      desc: "走近營地中央篝火旁的「燉肉鍋」按 A 鍵，烹調任一道行前料理（如微光蘑菇濃湯）以強化戰力。",
      checkComplete: function(s) { return Boolean(s.activeMeal && s.activeMeal.battlesLeft > 0) || Boolean(s.questProgress && s.questProgress.cookedOnce); },
      rewardText: "堅韌藤蔓 x4、藍晶鐵礦 x4、120 G、EXP +80",
      onClaim: function(s) { s.inventory.vine += 4; s.inventory.iron += 4; window.Aetheria.State.gainRewards(80, 120, 15); }
    },

    // 【第一章：翠風迷霧森林 (4~6)】
    {
      id: "mq_04", chapter: "第一章 1/3", title: "踏入【1. 翠風迷霧森林】",
      desc: "由曙光營地東側出口步行進入第一區：翠風迷霧森林，展開實戰探索。",
      checkComplete: function(s) { return s.unlockedZones.indexOf("zone1_forest") !== -1; },
      rewardText: "藍晶鐵礦 x5、翠風原木 x5、生命藥水 x2、EXP +100",
      onClaim: function(s) { s.inventory.iron += 5; s.inventory.wood += 5; s.inventory.potionHeal += 2; window.Aetheria.State.gainRewards(100, 120, 15); }
    },
    {
      id: "mq_05", chapter: "第一章 2/3", title: "破防竹子妖並鍛造【翠風堅韌藤甲】",
      desc: "在戰鬥中將竹子妖打入 BREAK 破防狀態擊殺以取得「竹精木心」，並於鐵匠鋪【防具】分頁打造 T2 翠風堅韌藤甲。",
      checkComplete: function(s) { return s.unlockedArmors.indexOf("a_vine") !== -1; },
      rewardText: "藍晶鐵礦 x6、紅傘微光菇 x4、竹精木心 x1、EXP +140",
      onClaim: function(s) { s.inventory.iron += 6; s.inventory.herb += 4; s.inventory.coreBamboo += 1; window.Aetheria.State.gainRewards(140, 160, 20); }
    },
    {
      id: "mq_06", chapter: "第一章 3/3", title: "擊敗森林守關領主【千年腐化樹妖王】",
      desc: "鍛造【潮汐破盾忍刀 (T3)】後，前往翠風森林東岸木橋前，擊敗守關領主【千年腐化樹妖王 Lv.8】解開峽谷封印！",
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z1); },
      rewardText: "古文明聖碑殘片 x1、爆破炸彈 x2、250 G、EXP +220",
      onClaim: function(s) { s.inventory.tabletShard += 1; s.inventory.bombItem += 2; window.Aetheria.State.gainRewards(220, 250, 30); }
    },

    // 【第二章：微光蘑菇洞窟 (7~9)】
    {
      id: "mq_07", chapter: "第二章 1/3", title: "升級【Lv.2 秘銀重鎬】或【烈焰戰斧】",
      desc: "在鐵匠鋪【工具】分頁，將十字鎬或伐木斧升級至 Lv.2，以獲得敲碎擋路巨石或砍斷巨型枯木的能力。",
      checkComplete: function(s) { return s.tools.pickaxe >= 2 || s.tools.axe >= 2; },
      rewardText: "流沙秘銀礦 x4、洞窟硬甲殼 x3、200 G、EXP +180",
      onClaim: function(s) { s.inventory.mithril += 4; s.inventory.shell += 3; window.Aetheria.State.gainRewards(180, 200, 25); }
    },
    {
      id: "mq_08", chapter: "第二章 2/3", title: "點燃【1-B 微光蘑菇洞窟】古代火盆",
      desc: "由翠風森林北方洞口進入微光蘑菇洞窟，走近中央「古代火盆」按 A 鍵點燃聖火，永久驅散洞窟黑霧！",
      checkComplete: function(s) { return Boolean(s.openedNodes && s.openedNodes.lit_cave1_mushroom); },
      rewardText: "流沙秘銀礦 x5、生命藥水 x3、洞察藥水 x2、EXP +220",
      onClaim: function(s) { s.inventory.mithril += 5; s.inventory.potionHeal += 3; s.inventory.potionHint += 2; window.Aetheria.State.gainRewards(220, 240, 25); }
    },
    {
      id: "mq_09", chapter: "第二章 3/3", title: "擊敗洞窟領主【晶簇骷髏大統領】",
      desc: "深入微光蘑菇洞窟最北端，擊敗守關領主【晶簇骷髏大統領 Lv.12】奪回骷髏魂火與聖碑殘片。",
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_cave1); },
      rewardText: "古文明聖碑殘片 x1、骷髏魂火 x2、350 G、EXP +320",
      onClaim: function(s) { s.inventory.tabletShard += 1; s.inventory.coreSkull += 2; window.Aetheria.State.gainRewards(320, 350, 35); }
    },

    // 【第三章：流沙繩索峽谷 (10~12)】
    {
      id: "mq_10", chapter: "第三章 1/3", title: "踏入【2. 流沙繩索峽谷】並打造秘銀鎖甲",
      desc: "穿過森林東門進入流沙峽谷，收集秘銀與硬甲殼，打造【岩窟秘銀鎖甲 (T3)】提升防禦。",
      checkComplete: function(s) { return s.unlockedZones.indexOf("zone2_canyon") !== -1 && s.unlockedArmors.indexOf("a_mithril") !== -1; },
      rewardText: "流沙秘銀礦 x6、翠風太陽花 x5、300 G、EXP +300",
      onClaim: function(s) { s.inventory.mithril += 6; s.inventory.flower += 5; window.Aetheria.State.gainRewards(300, 300, 30); }
    },
    {
      id: "mq_11", chapter: "第三章 2/3", title: "於鐵匠鋪鑲嵌任一顆【魔物核心符文】",
      desc: "打開鐵匠鋪【符文鑲嵌】分頁，將背包中的魔物核心（如竹精木心或骷髏魂火）鑲嵌至武器或防具孔位。",
      checkComplete: function(s) { return Boolean(s.socketedRunes && (s.socketedRunes.weapon || s.socketedRunes.armor)); },
      rewardText: "流沙秘銀礦 x6、靈獸誘餌果 x2、350 G、EXP +350",
      onClaim: function(s) { s.inventory.mithril += 6; s.inventory.tameFruit += 2; window.Aetheria.State.gainRewards(350, 350, 35); }
    },
    {
      id: "mq_12", chapter: "第三章 3/3", title: "擊敗峽谷守關領主【荒漠流沙魔神】",
      desc: "打造【赤炎連斬太刀 (T5)】後，擊敗鎮守峽谷東門的【荒漠流沙魔神 Lv.18】解開翡翠海岸通道！",
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z2); },
      rewardText: "古文明聖碑殘片 x1、深海珊瑚 x5、500 G、EXP +480",
      onClaim: function(s) { s.inventory.tabletShard += 1; s.inventory.coral += 5; window.Aetheria.State.gainRewards(480, 500, 45); }
    },

    // 【第四章：翡翠沉船海岸 (13~15)】
    {
      id: "mq_13", chapter: "第四章 1/3", title: "升級【Lv.2 鐵索飛爪鉤】並於海岸垂釣",
      desc: "升級鐵索飛爪鉤以飛越海岸斷崖，並在【3.翡翠沉船海岸】的水波釣魚點釣起銀鱗鮮魚。",
      checkComplete: function(s) { return s.tools.hook >= 2 && s.unlockedZones.indexOf("zone3_coast") !== -1; },
      rewardText: "銀鱗鮮魚 x3、深海珊瑚 x4、400 G、EXP +420",
      onClaim: function(s) { s.inventory.fish += 3; s.inventory.coral += 4; window.Aetheria.State.gainRewards(420, 400, 35); }
    },
    {
      id: "mq_14", chapter: "第四章 2/3", title: "鍛造【淵海珊瑚雙刃】或【潮汐海鱗戰鎧】",
      desc: "破防擊敗海岸魔物取得「海妖水核」，鍛造 T6 淵海珊瑚雙刃或 T4 潮汐海鱗戰鎧。",
      checkComplete: function(s) { return s.unlockedWeapons.indexOf("w_coral") !== -1 || s.unlockedArmors.indexOf("a_siren") !== -1; },
      rewardText: "熔岩黑曜石 x5、海妖水核 x2、500 G、EXP +520",
      onClaim: function(s) { s.inventory.obsidian += 5; s.inventory.coreSiren += 2; window.Aetheria.State.gainRewards(520, 500, 40); }
    },
    {
      id: "mq_15", chapter: "第四章 3/3", title: "擊敗海岸守關領主【深海幽靈船長】",
      desc: "擊敗鎮守沉船灣東側航線的【深海幽靈船長 Lv.26】，開通前往霜語雪原的道路！",
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z3); },
      rewardText: "古文明聖碑殘片 x1、霜狼禦寒毛皮 x5、700 G、EXP +680",
      onClaim: function(s) { s.inventory.tabletShard += 1; s.inventory.fur += 5; window.Aetheria.State.gainRewards(680, 700, 50); }
    },

    // 【第五章：霜語極寒雪原 (16~18)】
    {
      id: "mq_16", chapter: "第五章 1/3", title: "打造【霜狼禦寒毛皮甲 (T5)】抵禦暴風雪",
      desc: "先在營地煮「暖陽火鍋」臨時抗寒，深入【4.霜語極寒雪原】採集雪山冰蓮並打造 T5 霜狼禦寒毛皮甲。",
      checkComplete: function(s) { return s.unlockedArmors.indexOf("a_frost") !== -1; },
      rewardText: "熔岩黑曜石 x8、雪狼冰魄 x2、700 G、EXP +720",
      onClaim: function(s) { s.inventory.obsidian += 8; s.inventory.coreWolf += 2; window.Aetheria.State.gainRewards(720, 700, 45); }
    },
    {
      id: "mq_17", chapter: "第五章 2/3", title: "於公會修復任一座【古文明聖碑】達 50 點",
      desc: "打開【公會 ➔ 古文明聖碑】分頁，透過答題與獻上聖碑殘片，將任一座聖碑共鳴提升至 50 點以上。",
      checkComplete: function(s) {
        const m = s.monolithPts || {};
        return (m.chinese >= 50 || m.english >= 50 || m.science >= 50 || m.humanities >= 50);
      },
      rewardText: "古文明聖碑殘片 x2、雪山冰蓮 x6、800 G、EXP +800",
      onClaim: function(s) { s.inventory.tabletShard += 2; s.inventory.iceLotus += 6; window.Aetheria.State.gainRewards(800, 800, 50); }
    },
    {
      id: "mq_18", chapter: "第五章 3/3", title: "擊敗雪原守關領主【遠古永凍冰霜龍王】",
      desc: "鍛造【永凍冰龍神劍 (T8)】後，擊敗雪原東側的【遠古永凍冰霜龍王 Lv.38】開通火山山口！",
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z4); },
      rewardText: "古文明聖碑殘片 x2、熔岩龍鱗 x6、1000 G、EXP +1000",
      onClaim: function(s) { s.inventory.tabletShard += 2; s.inventory.magmaScale += 6; window.Aetheria.State.gainRewards(1000, 1000, 65); }
    },

    // 【第六章：赤紅熔岩火山 & 天界破曉 (19~21)】
    {
      id: "mq_19", chapter: "第六章 1/3", title: "擊敗火山守關領主【紅蓮火山龍皇】",
      desc: "深入【5.赤紅熔岩火山】打造黑曜龍鱗神鎧與紅蓮巨劍，擊敗【紅蓮火山龍皇 Lv.52】啟動天界飛空艇！",
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z5); },
      rewardText: "深淵星隕鐵 x10、世界樹金葉 x6、龍王逆鱗 x2、1500 G",
      onClaim: function(s) { s.inventory.starIron += 10; s.inventory.goldLeaf += 6; s.inventory.coreDragon += 2; window.Aetheria.State.gainRewards(1500, 1500, 80); }
    },
    {
      id: "mq_20", chapter: "第六章 2/3", title: "擊敗天界元兇【破曉蝕憶神龍皇】",
      desc: "登上【6.天界浮空聖殿】，擊敗吞噬大陸記憶的終極領主【破曉蝕憶神龍皇 Lv.70】解鎖無盡試煉之塔！",
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z6); },
      rewardText: "深淵星隕鐵 x12、世界樹金葉 x8、龍王逆鱗 x3、3000 G",
      onClaim: function(s) { s.inventory.starIron += 12; s.inventory.goldLeaf += 8; s.inventory.coreDragon += 3; window.Aetheria.State.gainRewards(2500, 3000, 120); }
    },
    {
      id: "mq_21", chapter: "終章 3/3", title: "鍛造【破曉神刃 (T10)】並突破試煉塔第 10 層",
      desc: "打造傳說最終神兵【艾瑟瑞亞破曉神刃】，並挑戰《無盡試煉之塔》突破第 10 層！",
      checkComplete: function(s) { return s.unlockedWeapons.indexOf("w_dawn") !== -1 && s.maxTowerFloor >= 10; },
      rewardText: "古文明聖碑殘片 x5、5000 G、破曉大宗師榮譽",
      onClaim: function(s) { s.inventory.tabletShard += 5; window.Aetheria.State.gainRewards(5000, 5000, 200); }
    }
  ];

  // 4. 營地 4 大 NPC 對話與旅人指令
  const NPCS_DB = {
    npc_smith: {
      id: "npc_smith",
      name: "鐵匠大叔・巴爾",
      role: "曙光營地首席鍛造師",
      sprite: "npc_blacksmith",
      greeting: "「Justin！而家魔物每回合都會反擊，唔著防具就去挑戰領主實死無生！記得喺我度打造【防具】，仲可以將打贏魔物破防跌嘅核心【鑲嵌】落武器同裝甲度！」",
      serviceLabel: "開啟鐵匠工坊（武器/防具/鑲嵌/工具）",
      serviceAction: "openForgeModal",
      pathActions: [
        {
          id: "pa_smith_inquire",
          onceKey: "done_pa_smith_inquire",
          type: "inquire",
          label: "【探查】打聽森林礦脈與藤蔓分布",
          desc: "答對 1 題，獲贈【藍晶鐵礦 x3、翠風原木 x3、堅韌藤蔓 x2】（單次限定）",
          rewardSummary: "獲得【藍晶鐵礦 x3、翠風原木 x3、堅韌藤蔓 x2】！",
          onSuccess: function(state) {
            state.questProgress.done_pa_smith_inquire = true;
            state.inventory.iron += 3;
            state.inventory.wood += 3;
            state.inventory.vine += 2;
            window.Aetheria.State.gainRewards(45, 30, 5);
          }
        },
        {
          id: "pa_smith_spar",
          type: "spar",
          label: "【切磋】與巴爾比試攻防戰術 (Lv.6)",
          desc: "首次獲勝可得【流沙秘銀 x3】；後續切磋獲【藍晶鐵礦 x1、30 G】",
          enemyConfig: { name: "鐵匠宗師・巴爾", lv: 6, type: "boss", isBoss: false },
          rewardSummary: "切磋獲勝！贏得鐵匠武藝賞賜！",
          onSuccess: function(state) {
            if (!state.questProgress.done_pa_smith_spar) {
              state.questProgress.done_pa_smith_spar = true;
              state.inventory.mithril += 3;
            } else {
              state.inventory.iron += 1;
              state.gold += 30;
            }
          }
        }
      ]
    },

    npc_astro: {
      id: "npc_astro",
      name: "星象少女・艾莉婭",
      role: "古文明聖碑共鳴師",
      sprite: "npc_astrologer",
      greeting: "「每當你在戰鬥中答對題目，或是擊敗領主與紫氣賞金首奪回『聖碑殘片』，都能修復四大古文明聖碑，解鎖失落的歷史卷軸與永久神恩！」",
      serviceLabel: "開啟古文明聖碑祭壇",
      serviceAction: "openMonolithModal",
      pathActions: [
        {
          id: "pa_astro_inquire",
          onceKey: "done_pa_astro_inquire",
          type: "inquire",
          label: "【討教】請教古文明聖碑奧秘",
          desc: "答對 1 題，獲得【古文明聖碑殘片 x1、洞察藥水 x2】（單次限定）",
          rewardSummary: "討教成功！獲得【古文明聖碑殘片 x1、洞察藥水 x2】！",
          onSuccess: function(state) {
            state.questProgress.done_pa_astro_inquire = true;
            state.inventory.tabletShard += 1;
            state.inventory.potionHint += 2;
            window.Aetheria.State.gainRewards(40, 20, 5);
          }
        }
      ]
    },

    npc_guild: {
      id: "npc_guild",
      name: "公會會長・雷恩",
      role: "記憶共鳴者公會總長",
      sprite: "npc_guildmaster",
      greeting: "「各區通往下一疆域的大門都被暴走的『守關領主』封鎖了！先在公會接取委託積累實力，準備充足後再向領主發起挑戰！」",
      serviceLabel: "進入冒險者公會與聖碑大廳",
      serviceAction: "openGuildModal",
      pathActions: [
        {
          id: "pa_guild_inquire",
          onceKey: "done_pa_guild_inquire",
          type: "inquire",
          label: "【探查】領取公會見習補給",
          desc: "答對 1 題，獲得【靈獸誘餌果 x2、生命藥水 x2】（單次限定）",
          rewardSummary: "獲得【靈獸誘餌果 x2、生命藥水 x2】！",
          onSuccess: function(state) {
            state.questProgress.done_pa_guild_inquire = true;
            state.inventory.tameFruit += 2;
            state.inventory.potionHeal += 2;
            window.Aetheria.State.gainRewards(40, 30, 10);
          }
        }
      ]
    },

    npc_merch: {
      id: "npc_merch",
      name: "神秘行商・奇奇",
      role: "跨大陸奇珍異寶商人",
      sprite: "npc_merchant",
      greeting: "「少年！出征前別忘了去營地中央的『燉肉鍋』煮碗料理！無論是加血濃湯、破盾魚排還是抗寒火鍋，都能網你在 Boss 戰裡事半功倍！」",
      serviceLabel: "開啟煉金提煉與金幣補給店",
      serviceAction: "openMerchantShop",
      pathActions: [
        {
          id: "pa_merch_haggle",
          onceKey: "done_pa_merch_haggle",
          type: "inquire",
          label: "【議價】答題贏取行商見面禮",
          desc: "答對 1 題，免費獲贈【爆破炸彈 x2、紅傘微光菇 x3】（單次限定）",
          rewardSummary: "議價大成功！獲得【爆破炸彈 x2、紅傘微光菇 x3】！",
          onSuccess: function(state) {
            state.questProgress.done_pa_merch_haggle = true;
            state.inventory.bombItem += 2;
            state.inventory.herb += 3;
          }
        }
      ]
    }
  };

  NPCS_DB.npc_merch_canyon = NPCS_DB.npc_merch;

  // 5. 公會階級表
  const GUILD_RANKS = [
    { rank: "F",  name: "銅牌見習共鳴者", minPts: 0,   dailyIron: 3,  dailyPotion: 1, perk: "基礎探索與委託權限" },
    { rank: "E",  name: "鐵牌正式冒險者", minPts: 30,  dailyIron: 5,  dailyPotion: 1, perk: "牧場戰寵遠征挖礦產量 +25%" },
    { rank: "C",  name: "銀牌秘境探索者", minPts: 80,  dailyIron: 8,  dailyPotion: 2, perk: "解鎖高階懸賞與秘銀提煉" },
    { rank: "A",  name: "金牌破盾先鋒",   minPts: 180, dailyIron: 12, dailyPotion: 2, perk: "所有戰鬥獲得經驗值與金幣 +25%" },
    { rank: "S",  name: "鑽石王牌共鳴者", minPts: 350, dailyIron: 16, dailyPotion: 3, perk: "異色閃光魔物出現機率翻倍 (16%)" },
    { rank: "SS", name: "破曉傳說大宗師", minPts: 600, dailyIron: 25, dailyPotion: 5, perk: "開局額外 +1 BP，總攻擊與破盾傷害 +30%" }
  ];

  // 6. 8 大分階公會委託池 (交付後進入冷卻，需經過戰鬥才會刷新，杜絕原地無限刷)
  const GUILD_BOUNTIES = [
    {
      id: "gb_gather_wood",
      title: "【營地防務】徵集原木與藤蔓",
      cost: { wood: 4, vine: 2 },
      rewardText: "藍晶鐵礦 x4、90 G、聲望 +15",
      onComplete: function(state) {
        state.inventory.iron += 4;
        state.questProgress.bountiesCleared = (state.questProgress.bountiesCleared || 0) + 1;
        window.Aetheria.State.gainRewards(55, 90, 15);
      }
    },
    {
      id: "gb_gather_iron",
      title: "【鐵匠急需】前線藍晶礦補給",
      cost: { iron: 6 },
      rewardText: "流沙秘銀礦 x2、110 G、聲望 +20",
      onComplete: function(state) {
        state.inventory.mithril += 2;
        state.questProgress.bountiesCleared = (state.questProgress.bountiesCleared || 0) + 1;
        window.Aetheria.State.gainRewards(70, 110, 20);
      }
    },
    {
      id: "gb_gather_herb",
      title: "【星象藥材】微光菇與太陽花",
      cost: { herb: 3, flower: 3 },
      rewardText: "生命藥水 x2、洞察藥水 x2、聲望 +20",
      onComplete: function(state) {
        state.inventory.potionHeal += 2;
        state.inventory.potionHint += 2;
        state.questProgress.bountiesCleared = (state.questProgress.bountiesCleared || 0) + 1;
        window.Aetheria.State.gainRewards(85, 130, 20);
      }
    },
    {
      id: "gb_hunt_bamboo",
      title: "【破防討伐】收集竹精木心",
      cost: { coreBamboo: 2, vine: 3 },
      rewardText: "流沙秘銀礦 x3、爆破炸彈 x1、聲望 +30",
      onComplete: function(state) {
        state.inventory.mithril += 3;
        state.inventory.bombItem += 1;
        state.questProgress.bountiesCleared = (state.questProgress.bountiesCleared || 0) + 1;
        window.Aetheria.State.gainRewards(120, 180, 30);
      }
    },
    {
      id: "gb_hunt_skull",
      title: "【峽谷討伐】硬甲殼與骷髏魂火",
      cost: { shell: 4, coreSkull: 2 },
      rewardText: "深海珊瑚 x4、靈獸誘餌果 x2、聲望 +35",
      onComplete: function(state) {
        state.inventory.coral += 4;
        state.inventory.tameFruit += 2;
        state.questProgress.bountiesCleared = (state.questProgress.bountiesCleared || 0) + 1;
        window.Aetheria.State.gainRewards(180, 260, 35);
      }
    },
    {
      id: "gb_coast_fish",
      title: "【海濱美食】垂釣銀鱗鮮魚與珊瑚",
      cost: { fish: 3, coral: 3 },
      rewardText: "熔岩黑曜石 x4、350 G、聲望 +40",
      onComplete: function(state) {
        state.inventory.obsidian += 4;
        state.questProgress.bountiesCleared = (state.questProgress.bountiesCleared || 0) + 1;
        window.Aetheria.State.gainRewards(240, 350, 40);
      }
    },
    {
      id: "gb_snow_fur",
      title: "【極地遠征】雪山冰蓮與雪狼冰魄",
      cost: { iceLotus: 4, fur: 4, coreWolf: 2 },
      rewardText: "古文明聖碑殘片 x1、熔岩黑曜石 x6、聲望 +50",
      onComplete: function(state) {
        state.inventory.tabletShard += 1;
        state.inventory.obsidian += 6;
        state.questProgress.bountiesCleared = (state.questProgress.bountiesCleared || 0) + 1;
        window.Aetheria.State.gainRewards(380, 500, 50);
      }
    },
    {
      id: "gb_volcano_scale",
      title: "【煉獄討伐】熔岩龍鱗與炎魔熔核",
      cost: { magmaScale: 5, coreGolem: 2 },
      rewardText: "深淵星隕鐵 x5、世界樹金葉 x3、聲望 +65",
      onComplete: function(state) {
        state.inventory.starIron += 5;
        state.inventory.goldLeaf += 3;
        state.questProgress.bountiesCleared = (state.questProgress.bountiesCleared || 0) + 1;
        window.Aetheria.State.gainRewards(600, 800, 65);
      }
    }
  ];

  function getCurrentMainQuest(state) {
    for (let i = 0; i < MAIN_QUESTS.length; i++) {
      const q = MAIN_QUESTS[i];
      if (!state.questProgress["claimed_" + q.id]) {
        return q;
      }
    }
    return null;
  }

  window.Aetheria.Data.STORY_CUTSCENES = STORY_CUTSCENES;
  window.Aetheria.Data.MONOLITHS_DB = MONOLITHS_DB;
  window.Aetheria.Data.MAIN_QUESTS = MAIN_QUESTS;
  window.Aetheria.Data.NPCS_DB = NPCS_DB;
  window.Aetheria.Data.GUILD_RANKS = GUILD_RANKS;
  window.Aetheria.Data.GUILD_BOUNTIES = GUILD_BOUNTIES;
  window.Aetheria.Data.getCurrentMainQuest = getCurrentMainQuest;
})();
