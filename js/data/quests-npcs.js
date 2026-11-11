/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 10位NPC實地委託、工具授予與零劇透主線庫 (quests-npcs.js - v6.0)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  const STORY_CUTSCENES = {
    intro: [
      { tag: "序幕・赤手空拳的拓荒者", speaker: "星象少女・艾莉婭", text: "「三百年前，『四座古文明知識聖碑』遭黑霧吞噬，連我們營地的鍛造熔爐都在昨晚的暴風雨中熄滅受損了……」" },
      { tag: "序幕・赤手空拳的拓荒者", speaker: "鐵匠大叔・巴爾", text: "「Justin！你現在赤手空拳、連一把忍刀同採集工具都無！快先在營地地上徒手拾取『散落枯枝x3、尖銳燧石x3、河床黏土x2』，幫我修復熔爐吧！」" },
      { tag: "序幕・赤手空拳的拓荒者", speaker: "公會會長・雷恩", text: "「修好熔爐後，巴爾就會為你打造初始忍刀、手斧與鐵鎬！記得多與營地及各區的村民對話，所有任務與工具都要親自找對應的 NPC 接取與交付！」" }
    ],
    enter_zone1_forest: [
      { tag: "第一章・翠風迷霧森林", speaker: "受困斥候・里奧（呼救）", text: "「喂——！東岸通往守關領主的木橋被洪水沖斷了！快來河岸西側找我，我們需要收集原木、松脂與藤蔓，回營地工坊加工成『厚木板』與『麻繩』來修築跨河吊橋！」" }
    ],
    enter_cave1_mushroom: [
      { tag: "第二章・微光蘑菇洞窟", speaker: "見習礦工・石頭（提醒）", text: "「洞窟裡伸手不見五指！快收集玄武岩塊、黏土、松脂與秘銀，在入口處砌築『永明聖火燈塔』驅散黑霧吧！」" }
    ],
    enter_zone2_canyon: [
      { tag: "第三章・流沙繩索峽谷", speaker: "遺跡學者・古斯塔", text: "「太好了，有拓荒者抵達峽谷了！北翼的符文封印柱在垂直斷崖上，快來營火旁找我，我們需要架設『斷崖重型絞盤木梯』才能爬上去！」" }
    ],
    enter_zone3_coast: [
      { tag: "第四章・翡翠沉船海岸", speaker: "老船匠・達克", text: "「哈哈！想渡海去討伐幽靈船長？沒有船可過不去！快收集木板、防水松脂膠與遠航風帆，老夫幫你在碼頭建造『破浪遠航木筏』！」" }
    ],
    enter_zone4_snow: [
      { tag: "第五章・霜語極寒雪原", speaker: "星象少女・艾莉婭", text: "「暴風雪會持續凍傷生命！快在雪原中央收集玄武岩、木板、霜狼毛皮與獸筋，搭建『極地防風毛皮屋』建立永久抗寒據點！」" }
    ],
    enter_zone5_volcano: [
      { tag: "第六章・赤紅熔岩火山", speaker: "鐵匠大叔・巴爾", text: "「前方的熔岩河高達上千度，木橋一搭上去就會燒成灰！必須回工坊燒製『黑曜耐火磚』，才能鋪設跨越熔岩的石拱橋！」" }
    ],
    enter_zone6_sky: [
      { tag: "終章・天界浮空聖殿", speaker: "星象少女・艾莉婭", text: "「終於登上雲端之上的天界聖殿了……解開最後兩座天界聖柱，擊敗元兇【破曉蝕憶神龍皇】吧！」" }
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

  // 21 個推進式主線任務：全部綁定專屬交付 NPC (giverNpcId / giverName / giverZone)！
  const MAIN_QUESTS = [
    {
      id: "mq_01", chapter: "序章1/3", title: "徒手拾荒並修復【營地鍛造熔爐】",
      giverNpcId: "npc_smith", giverName: "鐵匠巴爾", giverZone: "0.曙光營地",
      desc: "在營地徒手拾取枯枝x3、燧石x3、黏土x2，對準巴爾身旁的「受損熔爐」按 A 鍵修復，再向【鐵匠巴爾】回報。",
      checkComplete: function(s) { return Boolean(s.projectsBuilt && s.projectsBuilt.proj_camp_forge); },
      rewardText: "新手忍刀、Lv.1手斧、Lv.1鐵鎬、藍晶鐵礦x2、80G",
      onClaim: function(s) { s.inventory.iron += 2; s.inventory.wood += 2; window.Aetheria.State.gainRewards(45, 80, 15); }
    },
    {
      id: "mq_02", chapter: "序章2/3", title: "幫【老漁夫・阿海】修魚簍領取釣竿",
      giverNpcId: "npc_fisher", giverName: "老漁夫・阿海", giverZone: "0.曙光營地池畔",
      desc: "前往營地南側池塘邊找【老漁夫・阿海】接取並完成修補魚簍委託（枯枝x2、藤蔓x1），獲贈竹製釣魚竿。",
      checkComplete: function(s) { return (s.tools.hook || 0) >= 1; },
      rewardText: "紅傘微光菇x2、銀鱗鮮魚x1、100G",
      onClaim: function(s) { s.inventory.herb += 2; s.inventory.fish += 1; window.Aetheria.State.gainRewards(60, 100, 15); }
    },
    {
      id: "mq_03", chapter: "序章3/3", title: "鍛造【翠風荊棘短刃 (T2)】",
      giverNpcId: "npc_smith", giverName: "鐵匠巴爾", giverZone: "0.曙光營地",
      desc: "去第 1 區翠風森林採集原木(3)、藍晶鐵礦(3)與藤蔓(2)，升至 Lv.2 後回營地找【鐵匠巴爾】打造荊棘短刃。",
      checkComplete: function(s) { return s.unlockedWeapons.indexOf("w_vine") !== -1; },
      rewardText: "琥珀松脂x2、翠風原木x2、生命藥水x2",
      onClaim: function(s) { s.inventory.resin += 2; s.inventory.wood += 2; s.inventory.potionHeal += 2; window.Aetheria.State.gainRewards(80, 100, 20); }
    },
    {
      id: "mq_04", chapter: "一章1/3", title: "打造【翠風藤甲】並向斥候里奧報到",
      giverNpcId: "npc_scout", giverName: "受困斥候・里奧", giverZone: "1.翠風森林斷橋西岸",
      desc: "破防擊殺竹子妖取得竹精木心，於營地打造【翠風堅韌藤甲 (T2)】，再前往森林斷橋西岸找【受困斥候・里奧】。",
      checkComplete: function(s) { return s.unlockedArmors.indexOf("a_vine") !== -1; },
      rewardText: "加工厚木板x1、強化麻繩索x1、150G",
      onClaim: function(s) { s.inventory.plank += 1; s.inventory.rope += 1; window.Aetheria.State.gainRewards(120, 150, 25); }
    },
    {
      id: "mq_05", chapter: "一章2/3", title: "加工建材並修築【跨河加固吊橋】",
      giverNpcId: "npc_scout", giverName: "受困斥候・里奧", giverZone: "1.翠風森林斷橋西岸",
      desc: "於營地工坊加工厚木板(3)、強化麻繩(2)與鍛造鐵釘(2)，在森林斷橋處完成建造後向【受困斥候・里奧】回報。",
      checkComplete: function(s) { return Boolean(s.projectsBuilt && s.projectsBuilt.proj_z1_bridge); },
      rewardText: "竹精木心x1、生命藥水x2、200G",
      onClaim: function(s) { s.inventory.coreBamboo += 1; s.inventory.potionHeal += 2; window.Aetheria.State.gainRewards(160, 200, 30); }
    },
    {
      id: "mq_06", chapter: "一章3/3", title: "解開森林雙封印柱，擊敗【千年腐化樹妖王】",
      giverNpcId: "npc_guild", giverName: "公會會長・雷恩", giverZone: "0.曙光營地",
      desc: "點亮森林南北兩座封印柱，過橋擊敗東岸【千年腐化樹妖王 Lv.8】，再回營地向【公會會長・雷恩】回報。",
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z1); },
      rewardText: "古文明聖碑殘片x1、280G",
      onClaim: function(s) { s.inventory.tabletShard += 1; window.Aetheria.State.gainRewards(220, 280, 40); }
    },
    {
      id: "mq_07", chapter: "二章1/3", title: "升級【Lv.2 重鎬】並向礦工石頭領取火藥袋",
      giverNpcId: "npc_miner", giverName: "見習礦工・石頭", giverZone: "1.翠風森林北口",
      desc: "於鐵匠鋪升至 Lv.2 秘銀重鎬，並到森林北翼洞口幫【見習礦工・石頭】完成火種委託以獲得【Lv.1 火藥袋】。",
      checkComplete: function(s) { return (s.tools.pickaxe || 0) >= 2 && (s.tools.bomb || 0) >= 1; },
      rewardText: "玄武岩塊x2、爆破炸彈x2、220G",
      onClaim: function(s) { s.inventory.basalt += 2; s.inventory.bombItem += 2; window.Aetheria.State.gainRewards(190, 220, 30); }
    },
    {
      id: "mq_08", chapter: "二章2/3", title: "於蘑菇洞窟砌築【永明聖火燈塔】",
      giverNpcId: "npc_miner", giverName: "見習礦工・石頭", giverZone: "1.翠風森林北口",
      desc: "收集玄武岩塊(2)、黏土(2)、松脂(2)、燧石(2)與秘銀(1)，在洞窟入口砌築燈塔驅散黑霧，再向【石頭】回報。",
      checkComplete: function(s) { return Boolean(s.projectsBuilt && s.projectsBuilt.proj_cave1_beacon); },
      rewardText: "流沙秘銀礦x2、洞察藥水x2、260G",
      onClaim: function(s) { s.inventory.mithril += 2; s.inventory.potionHint += 2; window.Aetheria.State.gainRewards(230, 260, 35); }
    },
    {
      id: "mq_09", chapter: "二章3/3", title: "擊敗洞窟領主【晶簇骷髏大統領】",
      giverNpcId: "npc_astro", giverName: "星象少女・艾莉婭", giverZone: "0.曙光營地",
      desc: "解開洞窟東西兩側封印柱，擊敗北端的【晶簇骷髏大統領 Lv.12】，回營地向【星象少女・艾莉婭】回報。",
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_cave1); },
      rewardText: "古文明聖碑殘片x1、骷髏魂火x1、350G",
      onClaim: function(s) { s.inventory.tabletShard += 1; s.inventory.coreSkull += 1; window.Aetheria.State.gainRewards(320, 350, 45); }
    },
    {
      id: "mq_10", chapter: "三章1/3", title: "打造【秘銀鎖甲】並向峽谷學者古斯塔報到",
      giverNpcId: "npc_scholar", giverName: "遺跡學者・古斯塔", giverZone: "2.流沙峽谷中央",
      desc: "打造【岩窟秘銀鎖甲 (T3)】，前往第 2 區流沙峽谷中央營火旁找【遺跡學者・古斯塔】會合。",
      checkComplete: function(s) { return s.unlockedZones.indexOf("zone2_canyon") !== -1 && s.unlockedArmors.indexOf("a_mithril") !== -1; },
      rewardText: "加工厚木板x2、強化麻繩索x1、320G",
      onClaim: function(s) { s.inventory.plank += 2; s.inventory.rope += 1; window.Aetheria.State.gainRewards(300, 320, 40); }
    },
    {
      id: "mq_11", chapter: "三章2/3", title: "架設峽谷【斷崖重型絞盤木梯】",
      giverNpcId: "npc_scholar", giverName: "遺跡學者・古斯塔", giverZone: "2.流沙峽谷中央",
      desc: "投入厚木板(3)、麻繩(2)、鐵釘(2)與硬甲殼(2)，於峽谷北翼斷崖架設木梯並點亮北翼封印柱，再向【古斯塔】回報。",
      checkComplete: function(s) { return Boolean(s.projectsBuilt && s.projectsBuilt.proj_z2_ladder); },
      rewardText: "流沙秘銀礦x2、荒野亞麻x2、380G",
      onClaim: function(s) { s.inventory.mithril += 2; s.inventory.hemp += 2; window.Aetheria.State.gainRewards(350, 380, 45); }
    },
    {
      id: "mq_12", chapter: "三章3/3", title: "擊敗峽谷領主【荒漠流沙魔神】",
      giverNpcId: "npc_scholar", giverName: "遺跡學者・古斯塔", giverZone: "2.流沙峽谷中央",
      desc: "解開峽谷南北雙封印柱，擊敗東門的【荒漠流沙魔神 Lv.18】後向【遺跡學者・古斯塔】回報。",
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z2); },
      rewardText: "古文明聖碑殘片x1、深海珊瑚x2、500G",
      onClaim: function(s) { s.inventory.tabletShard += 1; s.inventory.coral += 2; window.Aetheria.State.gainRewards(480, 500, 55); }
    },
    {
      id: "mq_13", chapter: "四章1/3", title: "打造海岸裝備並與【老船匠・達克】會合",
      giverNpcId: "npc_shipwright", giverName: "老船匠・達克", giverZone: "3.翡翠海岸碼頭",
      desc: "於第 3 區收集珊瑚與水核，打造【珊瑚雙刃】或【海鱗戰鎧】，並向海岸碼頭的【老船匠・達克】報到。",
      checkComplete: function(s) { return s.unlockedWeapons.indexOf("w_coral") !== -1 || s.unlockedArmors.indexOf("a_siren") !== -1; },
      rewardText: "防水松脂膠x1、幽靈古帆布x2、450G",
      onClaim: function(s) { s.inventory.pitch += 1; s.inventory.sailCloth += 2; window.Aetheria.State.gainRewards(450, 450, 45); }
    },
    {
      id: "mq_14", chapter: "四章2/3", title: "於海岸碼頭建造【破浪遠航木筏】",
      giverNpcId: "npc_shipwright", giverName: "老船匠・達克", giverZone: "3.翡翠海岸碼頭",
      desc: "在工坊加工厚木板(4)、防水松脂膠(2)與遠航風帆(1)，於海岸碼頭完成造船後向【老船匠・達克】回報。",
      checkComplete: function(s) { return Boolean(s.projectsBuilt && s.projectsBuilt.proj_z3_raft); },
      rewardText: "海妖水核x1、銀鱗鮮魚x2、550G",
      onClaim: function(s) { s.inventory.coreSiren += 1; s.inventory.fish += 2; window.Aetheria.State.gainRewards(520, 550, 55); }
    },
    {
      id: "mq_15", chapter: "四章3/3", title: "乘木筏渡海擊敗【深海幽靈船長】",
      giverNpcId: "npc_shipwright", giverName: "老船匠・達克", giverZone: "3.翡翠海岸碼頭",
      desc: "解開海岸雙封印柱，乘木筏渡海擊敗【深海幽靈船長 Lv.26】，返回向【老船匠・達克】回報。",
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z3); },
      rewardText: "古文明聖碑殘片x1、霜狼禦寒毛皮x2、700G",
      onClaim: function(s) { s.inventory.tabletShard += 1; s.inventory.fur += 2; window.Aetheria.State.gainRewards(680, 700, 65); }
    },
    {
      id: "mq_16", chapter: "五章1/3", title: "於霜語雪原搭建【極地防風毛皮屋】",
      giverNpcId: "npc_astro", giverName: "星象少女・艾莉婭", giverZone: "0.曙光營地",
      desc: "在【4.霜語極寒雪原】中央投入玄武岩(2)、木板(2)、毛皮(3)、獸筋(2)與冰魄(1)搭建防風屋，再向【艾莉婭】回報。",
      checkComplete: function(s) { return Boolean(s.projectsBuilt && s.projectsBuilt.proj_z4_shelter); },
      rewardText: "雪山冰蓮x2、強韌獸筋x2、750G",
      onClaim: function(s) { s.inventory.iceLotus += 2; s.inventory.sinew += 2; window.Aetheria.State.gainRewards(720, 750, 60); }
    },
    {
      id: "mq_17", chapter: "五章2/3", title: "打造【霜狼毛皮甲】並升級【Lv.3 鑽頭】",
      giverNpcId: "npc_smith", giverName: "鐵匠巴爾", giverZone: "0.曙光營地",
      desc: "打造 T5 霜狼禦寒毛皮甲並將十字鎬升至 Lv.3 星隕鑽頭，完成後向營地【鐵匠巴爾】回報。",
      checkComplete: function(s) { return s.unlockedArmors.indexOf("a_frost") !== -1 && (s.tools.pickaxe || 0) >= 3; },
      rewardText: "熔岩黑曜石x2、雪狼冰魄x1、850G",
      onClaim: function(s) { s.inventory.obsidian += 2; s.inventory.coreWolf += 1; window.Aetheria.State.gainRewards(800, 850, 65); }
    },
    {
      id: "mq_18", chapter: "五章3/3", title: "擊敗雪原領主【遠古永凍冰霜龍王】",
      giverNpcId: "npc_guild", giverName: "公會會長・雷恩", giverZone: "0.曙光營地",
      desc: "解開雪原雙封印柱，擊敗東側【遠古永凍冰霜龍王 Lv.38】後回營地向【公會會長・雷恩】回報。",
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z4); },
      rewardText: "古文明聖碑殘片x2、熔岩龍鱗x2、1000G",
      onClaim: function(s) { s.inventory.tabletShard += 2; s.inventory.magmaScale += 2; window.Aetheria.State.gainRewards(1000, 1000, 80); }
    },
    {
      id: "mq_19", chapter: "六章1/3", title: "鋪設火山【黑曜耐火石拱橋】並擊敗火山龍皇",
      giverNpcId: "npc_smith", giverName: "鐵匠巴爾", giverZone: "0.曙光營地",
      desc: "於工坊燒製黑曜耐火磚(3)，在第五區火山鋪設石拱橋跨越熔岩河，擊敗【紅蓮火山龍皇 Lv.52】後向【巴爾】回報。",
      checkComplete: function(s) { return Boolean(s.projectsBuilt && s.projectsBuilt.proj_z5_bridge && s.clearedBosses && s.clearedBosses.boss_z5); },
      rewardText: "深淵星隕鐵x3、世界樹金葉x2、1500G",
      onClaim: function(s) { s.inventory.starIron += 3; s.inventory.goldLeaf += 2; s.inventory.coreDragon += 1; window.Aetheria.State.gainRewards(1500, 1500, 100); }
    },
    {
      id: "mq_20", chapter: "六章2/3", title: "登上天界聖殿，擊敗【破曉蝕憶神龍皇】",
      giverNpcId: "npc_astro", giverName: "星象少女・艾莉婭", giverZone: "0.曙光營地",
      desc: "登上第 6 區天界聖殿解開聖柱，擊敗終極元兇【破曉蝕憶神龍皇 Lv.70】後向【艾莉婭】回報。",
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z6); },
      rewardText: "深淵星隕鐵x4、世界樹金葉x3、3000G",
      onClaim: function(s) { s.inventory.starIron += 4; s.inventory.goldLeaf += 3; s.inventory.coreDragon += 2; window.Aetheria.State.gainRewards(2500, 3000, 150); }
    },
    {
      id: "mq_21", chapter: "終章3/3", title: "打造【破曉神刃 (T10)】並突破試煉塔第 10 層",
      giverNpcId: "npc_guild", giverName: "公會會長・雷恩", giverZone: "0.曙光營地",
      desc: "打造傳說最終神兵【艾瑟瑞亞破曉神刃】，挑戰《無盡試煉之塔》突破第 10 層後向【雷恩】回報！",
      checkComplete: function(s) { return s.unlockedWeapons.indexOf("w_dawn") !== -1 && s.maxTowerFloor >= 10; },
      rewardText: "古文明聖碑殘片x5、5000G、破曉大宗師榮譽",
      onClaim: function(s) { s.inventory.tabletShard += 5; window.Aetheria.State.gainRewards(5000, 5000, 200); }
    }
  ];

  // 10 位營地與野外村民 NPC 資料庫 (含專屬委託 villagerQuests 與完成後的拓荒回禮 perkAction)
  const NPCS_DB = {
    npc_smith: {
      id: "npc_smith", name: "鐵匠大叔・巴爾", role: "營地首席鍛造與建材師", sprite: "npc_blacksmith", zoneName: "0.曙光營地",
      greeting: "「Justin！如果你仲係赤手空拳，快去營地地上拾取『散落枯枝x3、尖銳燧石x3、河床黏土x2』，對準我身旁熄滅嘅熔爐按 A 鍵修復！修好後我就送你新手忍刀、手斧同鐵鎬！」",
      serviceLabel: "開啟工坊（武器/防具/建材加工/工具）", serviceAction: "openForgeModal",
      villagerQuests: [],
      pathActions: [
        {
          id: "pa_smith_inquire", onceKey: "done_pa_smith_inquire", type: "inquire",
          label: "【探查】請教建材加工配方", desc: "單次：獲藍晶鐵礦x2、琥珀松脂x2",
          rewardSummary: "獲得【藍晶鐵礦x2、琥珀松脂x2】！",
          onSuccess: function(state) {
            state.questProgress.done_pa_smith_inquire = true;
            state.inventory.iron += 2;
            state.inventory.resin += 2;
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

    npc_fisher: {
      id: "npc_fisher", name: "老漁夫・阿海", role: "曙光營地垂釣達人", sprite: "npc_fisher", zoneName: "0.曙光營地池畔",
      greeting: "「後生仔，想喺河邊同海邊釣『銀鱗鮮魚』？我把舊魚簍爛咗，只要你幫我執『散落枯枝x2、堅韌藤蔓x1』修好魚簍，老夫就送你一支【竹製釣魚竿】！」",
      perkLabel: "【村民回禮】領取阿海的每日魚餌補給",
      onClaimPerk: function(s) {
        s.inventory.branch += 1;
        s.inventory.potionHeal += 1;
        return "老漁夫阿海送了你【散落枯枝 +1、生命藥水 +1】！";
      },
      villagerQuests: [
        {
          id: "vq_fisher_1", title: "【漁夫委託 1】修補破損魚簍（授予釣魚竿）",
          kind: "deliver", cost: { branch: 2, vine: 1 },
          desc: "收集散落枯枝x2 與堅韌藤蔓x1 交給老漁夫阿海。",
          rewardText: "授予【Lv.1 竹製釣魚竿】、100G、聲望+20",
          onComplete: function(s) {
            s.tools.hook = Math.max(1, s.tools.hook || 0);
            window.Aetheria.State.gainRewards(70, 100, 20);
          }
        },
        {
          id: "vq_fisher_2", title: "【漁夫委託 2】親手垂釣銀鱗鮮魚",
          kind: "deliver", cost: { fish: 2 },
          desc: "使用竹製釣魚竿在水波釣魚點釣起 2 條銀鱗鮮魚交給阿海。",
          rewardText: "流沙秘銀礦x2、靈獸誘餌果x2、180G、聲望+30",
          onComplete: function(s) {
            s.inventory.mithril += 2;
            s.inventory.tameFruit += 2;
            window.Aetheria.State.gainRewards(130, 180, 30);
          }
        }
      ]
    },

    npc_herbalist: {
      id: "npc_herbalist", name: "草藥婆婆・梅姑", role: "營地百草藥師", sprite: "npc_herbalist", zoneName: "0.曙光營地西側",
      greeting: "「出外拓荒最怕受傷同寒冷。如果你喺森林採到微光菇同河床黏土，攞嚟畀老婆子熬藥，我必定重重酬謝你！」",
      perkLabel: "【村民回禮】飲用梅姑的百草養生茶",
      onClaimPerk: function(s) {
        s.hp = s.maxHp;
        s.inventory.herb += 1;
        return "飲用梅姑的養生茶，生命全滿並獲贈【紅傘微光菇 +1】！";
      },
      villagerQuests: [
        {
          id: "vq_herb_1", title: "【藥師委託 1】熬製傷藥的陶土與微光菇",
          kind: "deliver", cost: { herb: 2, clay: 2 },
          desc: "收集紅傘微光菇x2 與河床黏土x2 交給草藥婆婆梅姑。",
          rewardText: "生命藥水x3、琥珀松脂x2、120G、聲望+25",
          onComplete: function(s) {
            s.inventory.potionHeal += 3;
            s.inventory.resin += 2;
            window.Aetheria.State.gainRewards(85, 120, 25);
          }
        },
        {
          id: "vq_herb_2", title: "【藥師委託 2】向陽靈花與松脂提煉",
          kind: "deliver", cost: { flower: 2, resin: 2 },
          desc: "升級 Lv.2 戰斧後，採集翠風太陽花x2 與琥珀松脂x2 交給梅姑。",
          rewardText: "洞察藥水x3、靈獸誘餌果x2、240G、聲望+35",
          onComplete: function(s) {
            s.inventory.potionHint += 3;
            s.inventory.tameFruit += 2;
            window.Aetheria.State.gainRewards(180, 240, 35);
          }
        }
      ]
    },

    npc_scout: {
      id: "npc_scout", name: "受困斥候・里奧", role: "翠風森林前線斥候", sprite: "npc_scout", zoneName: "1.翠風森林斷橋西岸",
      greeting: "「洪水沖斷咗東岸木橋，而且附近嘅竹子妖越嚟越多！幫我清剿魔物並收集建材修好『跨河加固吊橋』，我們才能進軍東岸！」",
      perkLabel: "【村民回禮】領取斥候收集的木材與藤蔓",
      onClaimPerk: function(s) {
        s.inventory.wood += 1;
        s.inventory.vine += 1;
        return "斥候里奧分享了【翠風原木 +1、堅韌藤蔓 +1】！";
      },
      villagerQuests: [
        {
          id: "vq_scout_1", title: "【斥候委託 1】清剿森林西岸魔物 (0/2)",
          kind: "action", statKey: "kills", reqVal: 2, goalLabel: "討伐魔物",
          desc: "在戰鬥中擊敗 2 隻野外魔物，完成後回來向斥候里奧交付。",
          rewardText: "加工厚木板x1、鍛造鐵釘x1、150G、聲望+25",
          onComplete: function(s) {
            s.inventory.plank += 1;
            s.inventory.nails += 1;
            window.Aetheria.State.gainRewards(110, 150, 25);
          }
        },
        {
          id: "vq_scout_2", title: "【斥候委託 2】破盾戰術實戰演練 (0/2)",
          kind: "action", statKey: "breaks", reqVal: 2, goalLabel: "擊破護盾",
          desc: "在戰鬥中觸發 2 次 BREAK 破防暈眩，完成後向斥候里奧回報。",
          rewardText: "竹精木心x1、強化麻繩索x1、220G、聲望+35",
          onComplete: function(s) {
            s.inventory.coreBamboo += 1;
            s.inventory.rope += 1;
            window.Aetheria.State.gainRewards(160, 220, 35);
          }
        }
      ]
    },

    npc_miner: {
      id: "npc_miner", name: "見習礦工・石頭", role: "洞窟爆破勘探員", sprite: "npc_miner", zoneName: "1.翠風森林北翼洞口",
      greeting: "「咳咳……微光蘑菇洞窟入面又黑又有裂縫岩壁！只要你幫我搵『尖銳燧石x2、琥珀松脂x2』調配引信，我就送你【基礎火藥袋】同爆破炸彈！」",
      perkLabel: "【村民回禮】領取石頭開採的礦石補給",
      onClaimPerk: function(s) {
        s.inventory.iron += 1;
        s.inventory.flint += 1;
        return "礦工石頭送了你【藍晶鐵礦 +1、尖銳燧石 +1】！";
      },
      villagerQuests: [
        {
          id: "vq_miner_1", title: "【礦工委託 1】調配爆破引信（授予火藥袋）",
          kind: "deliver", cost: { flint: 2, resin: 2 },
          desc: "收集尖銳燧石x2 與琥珀松脂x2 交給見習礦工石頭。",
          rewardText: "授予【Lv.1 基礎火藥袋】、爆破炸彈x2、160G、聲望+30",
          onComplete: function(s) {
            s.tools.bomb = Math.max(1, s.tools.bomb || 0);
            s.inventory.bombItem += 2;
            window.Aetheria.State.gainRewards(120, 160, 30);
          }
        },
        {
          id: "vq_miner_2", title: "【礦工委託 2】洞窟秘銀與玄武岩勘探",
          kind: "deliver", cost: { mithril: 2, basalt: 1 },
          desc: "升級 Lv.2 重鎬後，開採流沙秘銀礦x2 與玄武岩塊x1 交給石頭。",
          rewardText: "鍛造鐵釘x2、爆破炸彈x2、280G、聲望+40",
          onComplete: function(s) {
            s.inventory.nails += 2;
            s.inventory.bombItem += 2;
            window.Aetheria.State.gainRewards(210, 280, 40);
          }
        }
      ]
    },

    npc_scholar: {
      id: "npc_scholar", name: "遺跡學者・古斯塔", role: "流沙峽谷古文明調查員", sprite: "npc_scholar", zoneName: "2.流沙峽谷中央",
      greeting: "「流沙峽谷的北翼封印柱位於高聳斷崖上！我們必須用厚木板、麻繩、鐵釘與硬甲殼架設『斷崖重型絞盤木梯』才能攀登上去！」",
      perkLabel: "【村民回禮】接受古斯塔的聖碑共鳴灌注",
      onClaimPerk: function(s) {
        s.monolithPts.chinese = Math.min(100, (s.monolithPts.chinese || 0) + 4);
        s.monolithPts.humanities = Math.min(100, (s.monolithPts.humanities || 0) + 4);
        return "古斯塔為你解讀古卷，【龍語與紀元聖碑共鳴 +4】！";
      },
      villagerQuests: [
        {
          id: "vq_scholar_1", title: "【學者委託 1】峽谷甲殼與亞麻纖維研究",
          kind: "deliver", cost: { shell: 2, hemp: 2 },
          desc: "收集洞窟硬甲殼x2 與荒野亞麻x2 交給遺跡學者古斯塔。",
          rewardText: "古文明聖碑殘片x1、流沙秘銀礦x2、320G、聲望+40",
          onComplete: function(s) {
            s.inventory.tabletShard += 1;
            s.inventory.mithril += 2;
            window.Aetheria.State.gainRewards(260, 320, 40);
          }
        },
        {
          id: "vq_scholar_2", title: "【學者委託 2】古語四連勝共鳴實測",
          kind: "streak", reqVal: 4,
          desc: "在戰鬥中累積達成 4 題連勝紀錄 (Streak x4)，再向古斯塔回報。",
          rewardText: "骷髏魂火x1、古文明聖碑殘片x1、400G、聲望+50",
          onComplete: function(s) {
            s.inventory.coreSkull += 1;
            s.inventory.tabletShard += 1;
            window.Aetheria.State.gainRewards(320, 400, 50);
          }
        }
      ]
    },

    npc_shipwright: {
      id: "npc_shipwright", name: "老船匠・達克", role: "翡翠海岸傳奇造船師", sprite: "npc_shipwright", zoneName: "3.翡翠海岸碼頭",
      greeting: "「想橫渡深海去對岸討伐幽靈船長？先去擊敗海盜收集『幽靈古帆布』，再回營地工坊合成『厚木板、防水松脂膠、遠航風帆』來碼頭造船！」",
      perkLabel: "【村民回禮】領取達克打撈的深海物資",
      onClaimPerk: function(s) {
        s.inventory.coral += 1;
        return "老船匠達克送了你【深海珊瑚 +1】！";
      },
      villagerQuests: [
        {
          id: "vq_ship_1", title: "【船匠委託 1】籌備防水塗料與古帆布",
          kind: "deliver", cost: { pitch: 1, sailCloth: 2 },
          desc: "於工坊熬製防水松脂膠x1，並打倒海盜收集幽靈古帆布x2 交給達克。",
          rewardText: "加工厚木板x2、深海珊瑚x2、420G、聲望+45",
          onComplete: function(s) {
            s.inventory.plank += 2;
            s.inventory.coral += 2;
            window.Aetheria.State.gainRewards(350, 420, 45);
          }
        },
        {
          id: "vq_ship_2", title: "【船匠委託 2】遠航補給鮮魚與珊瑚",
          kind: "deliver", cost: { fish: 2, coral: 2 },
          desc: "收集銀鱗鮮魚x2 與深海珊瑚x2 交給老船匠達克。",
          rewardText: "海妖水核x1、熔岩黑曜石x2、550G、聲望+60",
          onComplete: function(s) {
            s.inventory.coreSiren += 1;
            s.inventory.obsidian += 2;
            window.Aetheria.State.gainRewards(450, 550, 60);
          }
        }
      ]
    },

    npc_astro: {
      id: "npc_astro", name: "星象少女・艾莉婭", role: "古文明聖碑共鳴師", sprite: "npc_astrologer", zoneName: "0.曙光營地",
      greeting: "「當你完成各章節的聖碑與雪原拓荒主線時，請回來我這裡交付領獎！你也可以隨時在我這裡獻上『聖碑殘片』解鎖四大永久神恩。」",
      serviceLabel: "開啟古文明聖碑祭壇", serviceAction: "openMonolithModal",
      villagerQuests: [],
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
      id: "npc_guild", name: "公會會長・雷恩", role: "記憶共鳴者公會總長", sprite: "npc_guildmaster", zoneName: "0.曙光營地",
      greeting: "「擊敗區域守關領主後，請回來我這裡交付主線報告！此外，公會亦提供額外懸賞挑戰與高階晉升俸祿。」",
      serviceLabel: "查看拓荒日誌與公會懸賞", serviceAction: "openGuildModal",
      villagerQuests: [],
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
      id: "npc_merch", name: "神秘行商・奇奇", role: "跨大陸奇珍異寶商人", sprite: "npc_merchant", zoneName: "0.曙光營地",
      greeting: "「嘿嘿，如果差一兩個枯枝、燧石、黏土或者松脂起橋，可以隨時喺我嘅金幣商店買到！」",
      serviceLabel: "開啟煉金與金幣商店", serviceAction: "openMerchantShop",
      villagerQuests: [],
      pathActions: [
        {
          id: "pa_merch_haggle", onceKey: "done_pa_merch_haggle", type: "inquire",
          label: "【議價】行商見面禮", desc: "單次：獲河床黏土x2、紅傘菇x2",
          rewardSummary: "獲得【河床黏土x2、紅傘微光菇x2】！",
          onSuccess: function(state) {
            state.questProgress.done_pa_merch_haggle = true;
            state.inventory.clay += 2;
            state.inventory.herb += 2;
          }
        }
      ]
    }
  };

  NPCS_DB.npc_merch_canyon = NPCS_DB.npc_merch;

  const GUILD_RANKS = [
    { rank: "F",  name: "銅牌見習", minLv: 1,  minPts: 0,    dailyIron: 2,  dailyPotion: 1, perk: "基礎委託權限" },
    { rank: "E",  name: "鐵牌冒險", minLv: 4,  minPts: 120,  dailyIron: 4,  dailyPotion: 2, perk: "牧場遠征產出鐵礦" },
    { rank: "C",  name: "銀牌探索", minLv: 10, minPts: 320,  dailyIron: 6,  dailyPotion: 2, perk: "解鎖中階討伐懸賞" },
    { rank: "A",  name: "金牌先鋒", minLv: 20, minPts: 700,  dailyIron: 9,  dailyPotion: 3, perk: "戰鬥經驗與金幣 +25%" },
    { rank: "S",  name: "鑽石王牌", minLv: 32, minPts: 1300, dailyIron: 14, dailyPotion: 4, perk: "閃光魔物機率翻倍(16%)" },
    { rank: "SS", name: "破曉宗師", minLv: 45, minPts: 2200, dailyIron: 20, dailyPotion: 6, perk: "開局+1 BP、總攻擊+30%" }
  ];

  // 公會佈告欄隨機挑戰池 (需回營地找公會長雷恩接取與交付)
  const GUILD_BOUNTIES = [
    {
      id: "gb_act_kill2", kind: "action", statKey: "kills", reqVal: 2, minLv: 1,
      title: "【公會討伐】擊敗 2 隻野外魔物", goalLabel: "討伐魔物",
      rewardText: "藍晶鐵礦x2、120G、聲望+25",
      onComplete: function(s) { s.inventory.iron += 2; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(80, 120, 25); }
    },
    {
      id: "gb_act_break2", kind: "action", statKey: "breaks", reqVal: 2, minLv: 1,
      title: "【破盾演練】觸發 2 次 BREAK 破防", goalLabel: "擊破護盾",
      rewardText: "琥珀松脂x2、生命藥水x2、聲望+30",
      onComplete: function(s) { s.inventory.resin += 2; s.inventory.potionHeal += 2; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(100, 140, 30); }
    },
    {
      id: "gb_act_streak3", kind: "streak", reqVal: 3, minLv: 1,
      title: "【精準共鳴】達成 3 題連勝紀錄", goalLabel: "當前連勝",
      rewardText: "洞察藥水x2、130G、聲望+25",
      onComplete: function(s) { s.inventory.potionHint += 2; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(90, 130, 25); }
    },
    {
      id: "gb_act_fish1", kind: "action", statKey: "fishes", reqVal: 1, minLv: 1,
      title: "【漁獲補給】於釣魚點釣起 1 條鮮魚", goalLabel: "成功垂釣",
      rewardText: "流沙秘銀礦x1、紅傘菇x2、聲望+25",
      onComplete: function(s) { s.inventory.mithril += 1; s.inventory.herb += 2; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(85, 120, 25); }
    },
    {
      id: "gb_act_cook1", kind: "action", statKey: "meals", reqVal: 1, minLv: 1,
      title: "【營地大廚】於營地鍋爐烹調 1 道料理", goalLabel: "烹調料理",
      rewardText: "靈獸誘餌果x1、150G、聲望+25",
      onComplete: function(s) { s.inventory.tameFruit += 1; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(90, 150, 25); }
    },
    {
      id: "gb_act_kill4", kind: "action", statKey: "kills", reqVal: 4, minLv: 6,
      title: "【清剿行動】擊敗 4 隻野外魔物", goalLabel: "討伐魔物",
      rewardText: "流沙秘銀礦x2、220G、聲望+40",
      onComplete: function(s) { s.inventory.mithril += 2; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(160, 220, 40); }
    }
  ];

  function getAvailableBounties(state) {
    const lv = (state && state.lv) || 1;
    const seed = (state && state.bountyPoolSeed) || 1;
    const activeIds = ((state && state.activeBounties) || []).map(function(e) { return (typeof e === "string") ? e : e.id; });

    const eligible = GUILD_BOUNTIES.filter(function(b) {
      return activeIds.indexOf(b.id) === -1 && lv >= (b.minLv || 1);
    });

    if (eligible.length <= 4) return eligible;

    const picked = [];
    for (let i = 0; i < eligible.length && picked.length < 4; i++) {
      const idx = (seed * 3 + i * 2) % eligible.length;
      const cand = eligible[idx];
      if (picked.indexOf(cand) === -1) picked.push(cand);
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

  // 檢查某位村民委託是否已達成可交付條件
  function isVillagerQuestReady(state, vq) {
    if (!vq) return false;
    const qRec = state.npcQuests && state.npcQuests[vq.id];
    if (!qRec || qRec.status !== "accepted") return false;

    if (vq.kind === "deliver") {
      return window.Aetheria.Data.CraftingHelper.canAfford(state.inventory, vq.cost);
    }
    if (vq.kind === "action") {
      const cur = (state.bountyStats && state.bountyStats[vq.statKey]) || 0;
      return (cur - (qRec.startVal || 0)) >= vq.reqVal;
    }
    if (vq.kind === "streak") {
      return (state.streak || 0) >= vq.reqVal;
    }
    return false;
  }

  // 計算 NPC 頭頂應顯示的任務狀態標記 ("ready" 綠勾可交付 | "avail" 黃嘆號可接取 | null)
  function getNpcMarkerState(state, npcId) {
    // 1. 檢查當前主線是否已完成且需要向此 NPC 交付
    const mq = getCurrentMainQuest(state);
    if (mq && mq.giverNpcId === npcId && mq.checkComplete(state)) {
      return "ready";
    }

    // 2. 檢查此 NPC 的村民支線委託狀態
    const npc = NPCS_DB[npcId];
    if (npc && npc.villagerQuests && npc.villagerQuests.length > 0) {
      for (let i = 0; i < npc.villagerQuests.length; i++) {
        const vq = npc.villagerQuests[i];
        const rec = state.npcQuests && state.npcQuests[vq.id];
        if (!rec) {
          return "avail"; // 尚有未接取的村民委託 [!]
        }
        if (rec.status === "accepted") {
          return isVillagerQuestReady(state, vq) ? "ready" : null;
        }
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
  window.Aetheria.Data.isVillagerQuestReady = isVillagerQuestReady;
  window.Aetheria.Data.getNpcMarkerState = getNpcMarkerState;
})();
