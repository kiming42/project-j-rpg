/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 精簡21章主線、高門檻俸祿與5大類動態支線懸賞庫 (quests-npcs.js - v5.2)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  const STORY_CUTSCENES = {
    intro: [
      { tag: "序幕・失落符文與靜默災厄", speaker: "星象少女・艾莉婭", text: "「三百年前，支撐大陸的『四座古文明知識聖碑』遭黑霧吞噬，六大疆域的守護神獸也因此暴走……」" },
      { tag: "序幕・失落符文與靜默災厄", speaker: "鐵匠大叔・巴爾", text: "「Justin！高階礦石必須先升級【Lv.2 秘銀重鎬】與【Lv.2 烈焰戰斧】才能開採！每次離開再進入地圖，所有高階礦脈都會重新刷新！」" },
      { tag: "序幕・失落符文與靜默災厄", speaker: "公會會長・雷恩", text: "「每個區域的守關領主都被迷宮南北兩翼的『雙符文封印石柱』保護著。請先解開兩座石柱，再向守關領主發起挑戰！」" }
    ],
    enter_zone1_forest: [
      { tag: "第一章・翠風迷霧森林", speaker: "同行戰寵・史萊姆", text: "「咕嚕！東岸橋頭的【千年腐化樹妖王】身上有兩道符文鎖，我們要先去森林南北深處點亮兩座『符文封印柱』！」" }
    ],
    enter_cave1_mushroom: [
      { tag: "第二章・微光蘑菇洞窟", speaker: "星象少女・艾莉婭", text: "「洞窟裡有 T2『流沙秘銀礦』，記得把十字鎬升到 Lv.2 才能開採！快先點燃入口附近的古代火盆驅散黑霧吧！」" }
    ],
    enter_zone2_canyon: [
      { tag: "第三章・流沙繩索峽谷", speaker: "公會會長・雷恩", text: "「流沙峽谷是三大岩石迴廊！想要挑戰東門的【荒漠流沙魔神】，必須先突破峽谷南北兩端的符文封印柱！」" }
    ],
    enter_zone3_coast: [
      { tag: "第四章・翡翠沉船海岸", speaker: "神秘行商・奇奇", text: "「沉船灣的水波釣魚點可以玩『垂釣小遊戲』！看準魚標游入綠色或金色區按下收竿，就能釣起銀鱗鮮魚！」" }
    ],
    enter_zone4_snow: [
      { tag: "第五章・霜語極寒雪原", speaker: "星象少女・艾莉婭", text: "「警告！前方是零下四十度的雪原！未穿戴『霜狼禦寒毛皮甲』或食用『暖陽火鍋』會不斷受凍傷扣血！」" }
    ],
    enter_zone5_volcano: [
      { tag: "第六章・赤紅熔岩火山", speaker: "鐵匠大叔・巴爾", text: "「這裡的熔岩黑曜石需要【Lv.3 星隕鑽頭】才能開採！記得穿戴黑曜龍鱗神鎧抵禦高溫！」" }
    ],
    enter_zone6_sky: [
      { tag: "終章・天界浮空聖殿", speaker: "星象少女・艾莉婭", text: "「終於抵達天界聖殿了……解開最後兩座天界聖柱，擊敗元兇【破曉蝕憶神龍皇】吧！」" }
    ]
  };

  const MONOLITHS_DB = {
    chinese: {
      id: "chinese", name: "龍語古卷聖碑（中文）",
      perks: "25點：攻擊 +15% ｜ 75點：攻擊 +30%",
      lore25: "【卷一】先民以六書鑄造龍語符文，蘊含破魔鋒芒。",
      lore50: "【卷二】洞悉字詞真義，刀劍與龍脈共鳴。",
      lore100: "【終極】龍語聖碑完全復甦，獲至高劍聖之力。"
    },
    english: {
      id: "english", name: "阿爾比恩聖碑（英文）",
      perks: "25點：開局 +1 BP ｜ 75點：連勝倍率 2.0x",
      lore25: "【卷一】二十六枚字母化為星辰音節契約。",
      lore50: "【卷二】拼寫真名者可引動星界增幅能量。",
      lore100: "【終極】星界語法徹底解封，連勝賞金倍增。"
    },
    science: {
      id: "science", name: "煉金真理聖碑（科學）",
      perks: "25點：藥水回復翻倍(140) ｜ 75點：完美採集賞金翻倍",
      lore25: "【卷一】觀測光學與物態循環，銘刻自然法則。",
      lore50: "【卷二】理解催化之道，藥草化為奇蹟靈藥。",
      lore100: "【終極】萬物元素皆為所用，煉金臻至化境。"
    },
    humanities: {
      id: "humanities", name: "紀元編年聖碑（人文）",
      perks: "50點：HP與DEF +25% ｜ 100點：每戰1次半血復活",
      lore25: "【卷一】編年史官記錄先祖守護家園的意志。",
      lore50: "【卷二】背負歷史記憶者獲大地母神庇護。",
      lore100: "【終極】千載文明化為不滅金身，賜予絕境重生。"
    }
  };

  // 精簡版 21 章主線任務 (單行清晰目標)
  const MAIN_QUESTS = [
    {
      id: "mq_01", chapter: "序章1/3", title: "與營地【鐵匠巴爾】對話",
      desc: "於曙光營地右側找巴爾按 A 鍵對話。",
      checkComplete: function(s) { return Boolean(s.questProgress && s.questProgress.mq_01_talked); },
      rewardText: "藍晶鐵礦x2、原木x2、藤蔓x1、80G",
      onClaim: function(s) { s.inventory.iron += 2; s.inventory.wood += 2; s.inventory.vine += 1; window.Aetheria.State.gainRewards(40, 80, 15); }
    },
    {
      id: "mq_02", chapter: "序章2/3", title: "鍛造【翠風荊棘短刃 (T2)】",
      desc: "去森林採集原木/鐵礦/藤蔓，升至 Lv.2 後鍛造短刃。",
      checkComplete: function(s) { return s.unlockedWeapons.indexOf("w_vine") !== -1 || s.unlockedWeapons.length >= 2; },
      rewardText: "紅傘微光菇x2、原木x2、生命藥水x2",
      onClaim: function(s) { s.inventory.herb += 2; s.inventory.wood += 2; s.inventory.potionHeal += 2; window.Aetheria.State.gainRewards(60, 80, 15); }
    },
    {
      id: "mq_03", chapter: "序章3/3", title: "於營地鍋爐烹調 1 道料理",
      desc: "對準營地中央「行前料理鍋」按 A 鍵烹調。",
      checkComplete: function(s) { return Boolean(s.activeMeal && s.activeMeal.battlesLeft > 0) || Boolean(s.questProgress && s.questProgress.cookedOnce); },
      rewardText: "堅韌藤蔓x2、藍晶鐵礦x2、100G",
      onClaim: function(s) { s.inventory.vine += 2; s.inventory.iron += 2; window.Aetheria.State.gainRewards(80, 100, 20); }
    },
    {
      id: "mq_04", chapter: "一章1/3", title: "破防竹妖並打造【翠風藤甲】",
      desc: "打入 BREAK 擊殺竹妖獲木心，於防具頁打造藤甲。",
      checkComplete: function(s) { return s.unlockedArmors.indexOf("a_vine") !== -1; },
      rewardText: "藍晶鐵礦x3、紅傘菇x2、生命藥水x2",
      onClaim: function(s) { s.inventory.iron += 3; s.inventory.herb += 2; s.inventory.potionHeal += 2; window.Aetheria.State.gainRewards(120, 140, 25); }
    },
    {
      id: "mq_05", chapter: "一章2/3", title: "解開森林南北【雙封印石柱】",
      desc: "深入第 1 區南北迷宮點亮兩座符文封印柱。",
      checkComplete: function(s) { return Boolean(s.unlockedSeals && s.unlockedSeals.seal_z1_1 && s.unlockedSeals.seal_z1_2); },
      rewardText: "竹精木心x1、翠風原木x3、180G",
      onClaim: function(s) { s.inventory.coreBamboo += 1; s.inventory.wood += 3; window.Aetheria.State.gainRewards(160, 180, 30); }
    },
    {
      id: "mq_06", chapter: "一章3/3", title: "擊敗領主【千年腐化樹妖王】",
      desc: "打造潮汐忍刀(T3)後，前往森林東岸擊敗樹妖王。",
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z1); },
      rewardText: "聖碑殘片x1、爆破炸彈x2、250G",
      onClaim: function(s) { s.inventory.tabletShard += 1; s.inventory.bombItem += 2; window.Aetheria.State.gainRewards(220, 250, 40); }
    },
    {
      id: "mq_07", chapter: "二章1/3", title: "升級【Lv.2 秘銀重鎬】或戰斧",
      desc: "於鐵匠鋪【工具】分頁將十字鎬或伐木斧升至 Lv.2。",
      checkComplete: function(s) { return s.tools.pickaxe >= 2 || s.tools.axe >= 2; },
      rewardText: "流沙秘銀礦x2、洞窟硬甲殼x2、200G",
      onClaim: function(s) { s.inventory.mithril += 2; s.inventory.shell += 2; window.Aetheria.State.gainRewards(180, 200, 30); }
    },
    {
      id: "mq_08", chapter: "二章2/3", title: "點燃【蘑菇洞窟】古代火盆",
      desc: "由森林北口進入洞窟，按 A 鍵點燃火盆驅散黑霧。",
      checkComplete: function(s) { return Boolean(s.openedNodes && s.openedNodes.lit_cave1_mushroom); },
      rewardText: "流沙秘銀礦x2、生命藥水x2、洞察藥水x2",
      onClaim: function(s) { s.inventory.mithril += 2; s.inventory.potionHeal += 2; s.inventory.potionHint += 2; window.Aetheria.State.gainRewards(220, 240, 35); }
    },
    {
      id: "mq_09", chapter: "二章3/3", title: "擊敗領主【晶簇骷髏大統領】",
      desc: "解開洞窟東西封印柱，擊敗北端骷髏大統領。",
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_cave1); },
      rewardText: "聖碑殘片x1、骷髏魂火x1、350G",
      onClaim: function(s) { s.inventory.tabletShard += 1; s.inventory.coreSkull += 1; window.Aetheria.State.gainRewards(320, 350, 45); }
    },
    {
      id: "mq_10", chapter: "三章1/3", title: "踏入峽谷並打造【秘銀鎖甲】",
      desc: "進入第 2 區流沙峽谷，收集秘銀與甲殼打造鎖甲。",
      checkComplete: function(s) { return s.unlockedZones.indexOf("zone2_canyon") !== -1 && s.unlockedArmors.indexOf("a_mithril") !== -1; },
      rewardText: "流沙秘銀礦x2、翠風太陽花x2、300G",
      onClaim: function(s) { s.inventory.mithril += 2; s.inventory.flower += 2; window.Aetheria.State.gainRewards(300, 300, 40); }
    },
    {
      id: "mq_11", chapter: "三章2/3", title: "鑲嵌任一顆【魔物核心符文】",
      desc: "於鐵匠鋪【符文鑲嵌】將核心鑲入武器或防具。",
      checkComplete: function(s) { return Boolean(s.socketedRunes && (s.socketedRunes.weapon || s.socketedRunes.armor)); },
      rewardText: "流沙秘銀礦x2、靈獸誘餌果x2、350G",
      onClaim: function(s) { s.inventory.mithril += 2; s.inventory.tameFruit += 2; window.Aetheria.State.gainRewards(350, 350, 40); }
    },
    {
      id: "mq_12", chapter: "三章3/3", title: "擊敗領主【荒漠流沙魔神】",
      desc: "解開峽谷雙封印柱，擊敗東門荒漠流沙魔神。",
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z2); },
      rewardText: "聖碑殘片x1、深海珊瑚x2、500G",
      onClaim: function(s) { s.inventory.tabletShard += 1; s.inventory.coral += 2; window.Aetheria.State.gainRewards(480, 500, 55); }
    },
    {
      id: "mq_13", chapter: "四章1/3", title: "完成【垂釣小遊戲】釣起鮮魚",
      desc: "對準水波釣魚點按 A 鍵，成功釣起銀鱗鮮魚。",
      checkComplete: function(s) { return (s.inventory.fish || 0) >= 1 || Boolean(s.questProgress && s.questProgress.fishedOnce); },
      rewardText: "深海珊瑚x2、流沙秘銀礦x2、400G",
      onClaim: function(s) { s.inventory.coral += 2; s.inventory.mithril += 2; window.Aetheria.State.gainRewards(420, 400, 45); }
    },
    {
      id: "mq_14", chapter: "四章2/3", title: "打造【珊瑚雙刃】或【海鱗鎧】",
      desc: "於第 3 區收集深海珊瑚與海妖水核鍛造裝備。",
      checkComplete: function(s) { return s.unlockedWeapons.indexOf("w_coral") !== -1 || s.unlockedArmors.indexOf("a_siren") !== -1; },
      rewardText: "海妖水核x1、銀鱗鮮魚x2、500G",
      onClaim: function(s) { s.inventory.coreSiren += 1; s.inventory.fish += 2; window.Aetheria.State.gainRewards(520, 500, 50); }
    },
    {
      id: "mq_15", chapter: "四章3/3", title: "擊敗領主【深海幽靈船長】",
      desc: "解開海岸雙封印柱，擊敗東側深海幽靈船長。",
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z3); },
      rewardText: "聖碑殘片x1、霜狼毛皮x2、700G",
      onClaim: function(s) { s.inventory.tabletShard += 1; s.inventory.fur += 2; window.Aetheria.State.gainRewards(680, 700, 65); }
    },
    {
      id: "mq_16", chapter: "五章1/3", title: "打造【霜狼禦寒毛皮甲 (T5)】",
      desc: "採集雪山冰蓮與霜狼毛皮，打造抗寒毛皮甲。",
      checkComplete: function(s) { return s.unlockedArmors.indexOf("a_frost") !== -1; },
      rewardText: "熔岩黑曜石x2、雪狼冰魄x1、700G",
      onClaim: function(s) { s.inventory.obsidian += 2; s.inventory.coreWolf += 1; window.Aetheria.State.gainRewards(720, 700, 60); }
    },
    {
      id: "mq_17", chapter: "五章2/3", title: "升級【Lv.3 鑽頭】或聖碑50點",
      desc: "升級 Lv.3 星隕鑽頭，或修復任一聖碑達 50 點。",
      checkComplete: function(s) {
        const m = s.monolithPts || {};
        return s.tools.pickaxe >= 3 || (m.chinese >= 50 || m.english >= 50 || m.science >= 50 || m.humanities >= 50);
      },
      rewardText: "聖碑殘片x2、雪山冰蓮x2、800G",
      onClaim: function(s) { s.inventory.tabletShard += 2; s.inventory.iceLotus += 2; window.Aetheria.State.gainRewards(800, 800, 65); }
    },
    {
      id: "mq_18", chapter: "五章3/3", title: "擊敗領主【遠古永凍冰霜龍王】",
      desc: "解開雪原雙封印柱，擊敗東側永凍冰霜龍王。",
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z4); },
      rewardText: "聖碑殘片x2、熔岩龍鱗x2、1000G",
      onClaim: function(s) { s.inventory.tabletShard += 2; s.inventory.magmaScale += 2; window.Aetheria.State.gainRewards(1000, 1000, 80); }
    },
    {
      id: "mq_19", chapter: "六章1/3", title: "擊敗領主【紅蓮火山龍皇】",
      desc: "深入第 5 區熔岩火山解開雙封印柱，擊敗火山龍皇。",
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z5); },
      rewardText: "深淵星隕鐵x3、世界樹金葉x2、1500G",
      onClaim: function(s) { s.inventory.starIron += 3; s.inventory.goldLeaf += 2; s.inventory.coreDragon += 1; window.Aetheria.State.gainRewards(1500, 1500, 100); }
    },
    {
      id: "mq_20", chapter: "六章2/3", title: "擊敗元兇【破曉蝕憶神龍皇】",
      desc: "登上第 6 區天界聖殿解開聖柱，擊敗破曉神龍皇。",
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z6); },
      rewardText: "深淵星隕鐵x4、世界樹金葉x3、3000G",
      onClaim: function(s) { s.inventory.starIron += 4; s.inventory.goldLeaf += 3; s.inventory.coreDragon += 2; window.Aetheria.State.gainRewards(2500, 3000, 150); }
    },
    {
      id: "mq_21", chapter: "終章3/3", title: "打造【破曉神刃】並破塔10層",
      desc: "打造 T10 破曉神刃，並突破無盡試煉之塔第 10 層。",
      checkComplete: function(s) { return s.unlockedWeapons.indexOf("w_dawn") !== -1 && s.maxTowerFloor >= 10; },
      rewardText: "聖碑殘片x5、5000G、大宗師榮譽",
      onClaim: function(s) { s.inventory.tabletShard += 5; window.Aetheria.State.gainRewards(5000, 5000, 200); }
    }
  ];

  const NPCS_DB = {
    npc_smith: {
      id: "npc_smith", name: "鐵匠大叔・巴爾", role: "神兵/防具/鑲嵌/工具", sprite: "npc_blacksmith",
      greeting: "「不同階級的礦石同植物而家都有專屬圖案！升級【Lv.2 秘銀重鎬】同【Lv.2 烈焰戰斧】就可以去洞窟同峽谷採集高階素材！」",
      serviceLabel: "開啟鐵匠工坊", serviceAction: "openForgeModal",
      pathActions: [
        {
          id: "pa_smith_inquire", onceKey: "done_pa_smith_inquire", type: "inquire",
          label: "【探查】森林礦脈知識", desc: "單次：獲藍晶鐵礦x2、原木x2",
          rewardSummary: "獲得【藍晶鐵礦x2、翠風原木x2】！",
          onSuccess: function(state) {
            state.questProgress.done_pa_smith_inquire = true;
            state.inventory.iron += 2;
            state.inventory.wood += 2;
            window.Aetheria.State.gainRewards(45, 30, 10);
          }
        },
        {
          id: "pa_smith_spar", type: "spar",
          label: "【切磋】與巴爾比試 (Lv.6)", desc: "首勝獲秘銀x2；後續獲鐵礦x1",
          enemyConfig: { name: "鐵匠宗師・巴爾", lv: 6, type: "boss", isBoss: false },
          rewardSummary: "切磋獲勝！",
          onSuccess: function(state) {
            if (!state.questProgress.done_pa_smith_spar) {
              state.questProgress.done_pa_smith_spar = true;
              state.inventory.mithril += 2;
            } else {
              state.inventory.iron += 1;
              state.gold += 30;
            }
          }
        }
      ]
    },
    npc_astro: {
      id: "npc_astro", name: "星象少女・艾莉婭", role: "古文明聖碑共鳴師", sprite: "npc_astrologer",
      greeting: "「答對題目或獻上『聖碑殘片』即可修復四大聖碑，啟動永久神恩加成！」",
      serviceLabel: "開啟古文明聖碑祭壇", serviceAction: "openMonolithModal",
      pathActions: [
        {
          id: "pa_astro_inquire", onceKey: "done_pa_astro_inquire", type: "inquire",
          label: "【討教】聖碑奧秘", desc: "單次：獲聖碑殘片x1、洞察藥水x2",
          rewardSummary: "獲得【聖碑殘片x1、洞察藥水x2】！",
          onSuccess: function(state) {
            state.questProgress.done_pa_astro_inquire = true;
            state.inventory.tabletShard += 1;
            state.inventory.potionHint += 2;
            window.Aetheria.State.gainRewards(40, 20, 10);
          }
        }
      ]
    },
    npc_guild: {
      id: "npc_guild", name: "公會會長・雷恩", role: "記憶共鳴者公會總長", sprite: "npc_guildmaster",
      greeting: "「公會懸賞板現已支援『實戰討伐、破防試煉、連勝詠唱、料理垂釣與物資徵集』五大類隨機任務，隨時可換一批挑戰！」",
      serviceLabel: "進入冒險者公會大廳", serviceAction: "openGuildModal",
      pathActions: [
        {
          id: "pa_guild_inquire", onceKey: "done_pa_guild_inquire", type: "inquire",
          label: "【探查】見習補給", desc: "單次：獲誘餌果x2、生命藥水x2",
          rewardSummary: "獲得【靈獸誘餌果x2、生命藥水x2】！",
          onSuccess: function(state) {
            state.questProgress.done_pa_guild_inquire = true;
            state.inventory.tameFruit += 2;
            state.inventory.potionHeal += 2;
            window.Aetheria.State.gainRewards(40, 30, 15);
          }
        }
      ]
    },
    npc_merch: {
      id: "npc_merch", name: "神秘行商・奇奇", role: "跨大陸奇珍異寶商人", sprite: "npc_merchant",
      greeting: "「去水波釣魚點按 A 鍵玩『垂釣小遊戲』釣起銀鱗鮮魚，回營地煮成破盾魚排，打 Boss 超級好用！」",
      serviceLabel: "開啟煉金與金幣商店", serviceAction: "openMerchantShop",
      pathActions: [
        {
          id: "pa_merch_haggle", onceKey: "done_pa_merch_haggle", type: "inquire",
          label: "【議價】行商見面禮", desc: "單次：獲爆破炸彈x2、紅傘菇x2",
          rewardSummary: "獲得【爆破炸彈x2、紅傘微光菇x2】！",
          onSuccess: function(state) {
            state.questProgress.done_pa_merch_haggle = true;
            state.inventory.bombItem += 2;
            state.inventory.herb += 2;
          }
        }
      ]
    }
  };
  NPCS_DB.npc_merch_canyon = NPCS_DB.npc_merch;

  // 大幅提高後的公會晉升階級門檻表 (需同時達標 minLv 與 minPts)
  const GUILD_RANKS = [
    { rank: "F",  name: "銅牌見習", minLv: 1,  minPts: 0,    dailyIron: 2,  dailyPotion: 1, perk: "基礎委託權限" },
    { rank: "E",  name: "鐵牌冒險", minLv: 4,  minPts: 120,  dailyIron: 4,  dailyPotion: 2, perk: "牧場遠征產出鐵礦" },
    { rank: "C",  name: "銀牌探索", minLv: 10, minPts: 320,  dailyIron: 6,  dailyPotion: 2, perk: "解鎖中階討伐懸賞" },
    { rank: "A",  name: "金牌先鋒", minLv: 20, minPts: 700,  dailyIron: 9,  dailyPotion: 3, perk: "戰鬥經驗與金幣 +25%" },
    { rank: "S",  name: "鑽石王牌", minLv: 32, minPts: 1300, dailyIron: 14, dailyPotion: 4, perk: "閃光魔物機率翻倍(16%)" },
    { rank: "SS", name: "破曉宗師", minLv: 45, minPts: 2200, dailyIron: 20, dailyPotion: 6, perk: "開局+1 BP、總攻擊+30%" }
  ];

  // 5 大類型共 14 項多元支線懸賞池 (不再千篇一律只收素材！)
  const GUILD_BOUNTIES = [
    // 【類型 1：實戰討伐 (Combat Hunt)】
    {
      id: "gb_act_kill2", kind: "action", statKey: "kills", reqVal: 2, minLv: 1,
      title: "【實戰討伐】擊敗 2 隻野外魔物",
      goalLabel: "討伐魔物",
      rewardText: "藍晶鐵礦x2、120G、聲望+25",
      onComplete: function(s) { s.inventory.iron += 2; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(80, 120, 25); }
    },
    {
      id: "gb_act_kill4", kind: "action", statKey: "kills", reqVal: 4, minLv: 6,
      title: "【清剿行動】擊敗 4 隻野外魔物",
      goalLabel: "討伐魔物",
      rewardText: "流沙秘銀礦x2、220G、聲望+40",
      onComplete: function(s) { s.inventory.mithril += 2; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(160, 220, 40); }
    },
    // 【類型 2：破防試煉 (Break Trial)】
    {
      id: "gb_act_break2", kind: "action", statKey: "breaks", reqVal: 2, minLv: 1,
      title: "【破盾演練】戰鬥中觸發 2 次 BREAK 破防",
      goalLabel: "擊破護盾",
      rewardText: "竹精木心x1、生命藥水x2、聲望+30",
      onComplete: function(s) { s.inventory.coreBamboo += 1; s.inventory.potionHeal += 2; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(100, 140, 30); }
    },
    {
      id: "gb_act_break4", kind: "action", statKey: "breaks", reqVal: 4, minLv: 10,
      title: "【碎盾宗師】戰鬥中觸發 4 次 BREAK 破防",
      goalLabel: "擊破護盾",
      rewardText: "骷髏魂火x1、深海珊瑚x2、聲望+45",
      onComplete: function(s) { s.inventory.coreSkull += 1; s.inventory.coral += 2; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(220, 280, 45); }
    },
    // 【類型 3：連勝詠唱 (Streak Trial)】
    {
      id: "gb_act_streak3", kind: "streak", reqVal: 3, minLv: 1,
      title: "【精準共鳴】達成 3 題連勝紀錄 (Streak x3)",
      goalLabel: "當前連勝",
      rewardText: "洞察藥水x2、130G、聲望+25",
      onComplete: function(s) { s.inventory.potionHint += 2; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(90, 130, 25); }
    },
    {
      id: "gb_act_streak6", kind: "streak", reqVal: 6, minLv: 8,
      title: "【無瑕詠唱】達成 6 題連勝紀錄 (Streak x6)",
      goalLabel: "當前連勝",
      rewardText: "古文明聖碑殘片x1、300G、聲望+50",
      onComplete: function(s) { s.inventory.tabletShard += 1; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(250, 300, 50); }
    },
    // 【類型 4：垂釣與行前料理 (Fishing & Cooking)】
    {
      id: "gb_act_fish1", kind: "action", statKey: "fishes", reqVal: 1, minLv: 1,
      title: "【漁夫試煉】於釣魚點親手釣起 1 條鮮魚",
      goalLabel: "成功垂釣",
      rewardText: "流沙秘銀礦x1、紅傘菇x2、聲望+25",
      onComplete: function(s) { s.inventory.mithril += 1; s.inventory.herb += 2; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(85, 120, 25); }
    },
    {
      id: "gb_act_cook1", kind: "action", statKey: "meals", reqVal: 1, minLv: 1,
      title: "【營地大廚】於營地燉肉鍋烹調 1 道料理",
      goalLabel: "烹調料理",
      rewardText: "靈獸誘餌果x1、150G、聲望+25",
      onComplete: function(s) { s.inventory.tameFruit += 1; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(90, 150, 25); }
    },
    // 【類型 5：各區急件物資交付 (Material Delivery)】
    {
      id: "gb_gather_wood", kind: "deliver", minLv: 1,
      title: "【營地防務】交付原木与藤蔓",
      cost: { wood: 2, vine: 2 },
      rewardText: "藍晶鐵礦x2、100G、聲望+20",
      onComplete: function(s) { s.inventory.iron += 2; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(60, 100, 20); }
    },
    {
      id: "gb_gather_iron", kind: "deliver", minLv: 1,
      title: "【鐵匠急件】交付藍晶鐵礦",
      cost: { iron: 3 },
      rewardText: "流沙秘銀礦x1、120G、聲望+25",
      onComplete: function(s) { s.inventory.mithril += 1; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(75, 120, 25); }
    },
    {
      id: "gb_hunt_skull", kind: "deliver", minLv: 6,
      title: "【岩窟徵集】交付硬甲殼與秘銀",
      cost: { shell: 2, mithril: 2 },
      rewardText: "深海珊瑚x2、爆破炸彈x1、聲望+35",
      onComplete: function(s) { s.inventory.coral += 2; s.inventory.bombItem += 1; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(180, 260, 35); }
    },
    {
      id: "gb_coast_fish", kind: "deliver", minLv: 12,
      title: "【海濱美食】交付銀鱗鮮魚與珊瑚",
      cost: { fish: 2, coral: 2 },
      rewardText: "熔岩黑曜石x2、350G、聲望+45",
      onComplete: function(s) { s.inventory.obsidian += 2; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(240, 350, 45); }
    },
    {
      id: "gb_snow_fur", kind: "deliver", minLv: 22,
      title: "【極地遠征】交付雪山冰蓮與毛皮",
      cost: { iceLotus: 2, fur: 2 },
      rewardText: "聖碑殘片x1、黑曜石x2、聲望+55",
      onComplete: function(s) { s.inventory.tabletShard += 1; s.inventory.obsidian += 2; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(380, 500, 55); }
    },
    {
      id: "gb_volcano_scale", kind: "deliver", minLv: 35,
      title: "【煉獄徵集】交付熔岩龍鱗與黑曜石",
      cost: { magmaScale: 2, obsidian: 2 },
      rewardText: "深淵星隕鐵x2、世界樹金葉x2、聲望+70",
      onComplete: function(s) { s.inventory.starIron += 2; s.inventory.goldLeaf += 2; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(600, 800, 70); }
    }
  ];

  // 根據玩家當前等級與亂數種子，動態抽出 4 張不重複類型的支線委託
  function getAvailableBounties(state) {
    const lv = (state && state.lv) || 1;
    const seed = (state && state.bountyPoolSeed) || 1;
    const activeIds = (state && state.activeBounties) || [];

    const eligible = GUILD_BOUNTIES.filter(function(b) {
      return activeIds.indexOf(b.id) === -1 && lv >= (b.minLv || 1);
    });

    if (eligible.length <= 4) return eligible;

    const picked = [];
    const step = 3;
    for (let i = 0; i < eligible.length && picked.length < 4; i++) {
      const idx = (seed * 5 + i * step) % eligible.length;
      const cand = eligible[idx];
      if (picked.indexOf(cand) === -1) {
        picked.push(cand);
      }
    }
    return picked;
  }

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
  window.Aetheria.Data.getAvailableBounties = getAvailableBounties;
  window.Aetheria.Data.getCurrentMainQuest = getCurrentMainQuest;
})();
