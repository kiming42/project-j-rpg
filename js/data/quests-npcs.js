/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 任務同步、NPC單次旅人指令防刷與5階公會委託庫 (quests-npcs.js - v3.5)
 * 修正：1.主線說明與 v3.5 鍛造配方完全對齊；序章完成贈送原木x4、藍晶鐵x4、紅傘菇x2、100G
 *       2.所有 NPC 旅人指令加入 onceKey 單次領取紀錄，杜絕無限刷秘銀與聲望漏洞
 *       3.公會委託擴充至 5 項（涵蓋木材、鐵礦、竹精木心、秘銀、骷髏魂火）
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  // 1. 主線劇情任務鏈 (與新版配方及線性區域完全對齊)
  const MAIN_QUESTS = [
    {
      id: "mq_01",
      chapter: "序章・破曉共鳴",
      title: "找營地鐵匠大叔・巴爾對話",
      desc: "在曙光露營基地與鐵匠巴爾對話，領取新手起步鍛造物資包。",
      checkComplete: function(state) {
        return Boolean(state.questProgress && state.questProgress.mq_01_talked);
      },
      rewardText: "藍晶鐵礦 x4、翠風原木 x4、紅傘微光菇 x2、100 G、EXP +45",
      onClaim: function(state) {
        state.inventory.iron += 4;
        state.inventory.wood += 4;
        state.inventory.herb += 2;
        window.Aetheria.State.gainRewards(45, 100, 15);
      }
    },
    {
      id: "mq_02",
      chapter: "第一章・潮汐破盾",
      title: "升至 Lv.3 並鍛造【潮汐破盾忍刀】",
      desc: "由營地東門進入【1.翠風迷霧森林】，採集藍晶礦(12)、紅傘菇(8)、原木(6)，並破防擊敗竹子妖取得竹精木心(2)以打造神刀。",
      checkComplete: function(state) {
        return state.unlockedWeapons.indexOf("w_tide") !== -1;
      },
      rewardText: "爆破炸彈 x2、靈獸誘餌果 x2、200 G、EXP +100",
      onClaim: function(state) {
        state.inventory.bombItem += 2;
        state.inventory.tameFruit += 2;
        window.Aetheria.State.gainRewards(100, 200, 30);
      }
    },
    {
      id: "mq_03",
      chapter: "第二章・秘境與遠征",
      title: "收服第 2 隻戰寵或完成 2 次公會委託",
      desc: "在戰鬥中將魔物打入 BREAK 狀態後投擲誘餌果收服，或於公會完成 2 張委託單。",
      checkComplete: function(state) {
        return state.unlockedPets.length >= 2 || Boolean(state.questProgress && state.questProgress.bountiesCleared >= 2);
      },
      rewardText: "流沙秘銀礦 x6、洞察藥水 x3、300 G、EXP +180",
      onClaim: function(state) {
        state.inventory.mithril += 6;
        state.inventory.potionHint += 3;
        window.Aetheria.State.gainRewards(180, 300, 45);
      }
    },
    {
      id: "mq_04",
      chapter: "終章・破曉傳說",
      title: "擊敗任一區域 Boss 或突破試煉之塔第 5 層",
      desc: "深入各區擊敗守關領主 Boss，或推進至第六區進入《無盡試煉之塔》突破第 5 層！",
      checkComplete: function(state) {
        return state.maxTowerFloor >= 5 || Boolean(state.questProgress && state.questProgress.mq_03_boss);
      },
      rewardText: "深淵星隕鐵 x5、世界樹金葉 x3、800 G、EXP +400",
      onClaim: function(state) {
        state.inventory.starIron += 5;
        state.inventory.goldLeaf += 3;
        window.Aetheria.State.gainRewards(400, 800, 100);
      }
    }
  ];

  // 2. 營地 4 大 NPC 對話與旅人指令 (加入 onceKey 防止無限刷物資)
  const NPCS_DB = {
    npc_smith: {
      id: "npc_smith",
      name: "鐵匠大叔・巴爾",
      role: "曙光營地首席鍛造師",
      sprite: "npc_blacksmith",
      greeting: "「Justin！想打造高階破盾忍刀同升級十字鎬，除咗去森林挖藍晶礦同斬樹樁攞原木之外，仲要喺戰鬥中將魔物打入 BREAK 破防狀態先會跌『魔物核心』㗎！」",
      serviceLabel: "開啟鐵匠鍛造與金幣補給台",
      serviceAction: "openForgeModal",
      pathActions: [
        {
          id: "pa_smith_inquire",
          onceKey: "done_pa_smith_inquire",
          type: "inquire",
          label: "【探查】打聽森林礦脈與原木分布",
          desc: "答對 1 題，獲贈【藍晶鐵礦 x3、翠風原木 x3】（單次限定）",
          rewardSummary: "獲得【藍晶鐵礦 x3、翠風原木 x3】！",
          onSuccess: function(state) {
            state.questProgress.done_pa_smith_inquire = true;
            state.inventory.iron += 3;
            state.inventory.wood += 3;
          }
        },
        {
          id: "pa_smith_spar",
          type: "spar",
          label: "【切磋】與巴爾比試刀法 (Lv.6)",
          desc: "首次獲勝可得【流沙秘銀 x3】；後續切磋獲【藍晶鐵礦 x1、40 G】",
          enemyConfig: { name: "鐵匠宗師・巴爾", lv: 6, type: "boss", isBoss: false },
          rewardSummary: "切磋獲勝！贏得鐵匠武藝賞賜！",
          onSuccess: function(state) {
            if (!state.questProgress.done_pa_smith_spar) {
              state.questProgress.done_pa_smith_spar = true;
              state.inventory.mithril += 3;
            } else {
              state.inventory.iron += 1;
              state.gold += 40;
            }
          }
        }
      ]
    },

    npc_astro: {
      id: "npc_astro",
      name: "星象少女・艾莉婭",
      role: "古文明記憶調頻師",
      sprite: "npc_astrologer",
      greeting: "「星辰指引著失落的文字……Justin，隨時可以喺設定入面調整今日想溫習嘅科目波頻（中文、英文、人文、科學）！」",
      serviceLabel: "開啟星象儀（調整溫習科目）",
      serviceAction: "openAstrolabeModal",
      pathActions: [
        {
          id: "pa_astro_inquire",
          onceKey: "done_pa_astro_inquire",
          type: "inquire",
          label: "【討教】請教古文明奧秘",
          desc: "答對 1 題，獲得【洞察藥水 x2、翠風太陽花 x2】（單次限定）",
          rewardSummary: "討教成功！獲得【洞察藥水 x2、翠風太陽花 x2】！",
          onSuccess: function(state) {
            state.questProgress.done_pa_astro_inquire = true;
            state.inventory.potionHint += 2;
            state.inventory.flower += 2;
          }
        }
      ]
    },

    npc_guild: {
      id: "npc_guild",
      name: "公會會長・雷恩",
      role: "記憶共鳴者公會總長",
      sprite: "npc_guildmaster",
      greeting: "「歡迎來到冒險者公會！記得先喺懸賞公告板『接受委託』（最多同時接 3 張），集齊物資後返嚟交付就可以領取豐厚賞金同晉升公會階級！」",
      serviceLabel: "進入冒險者公會大廳",
      serviceAction: "openGuildModal",
      pathActions: [
        {
          id: "pa_guild_inquire",
          onceKey: "done_pa_guild_inquire",
          type: "inquire",
          label: "【探查】領取公會見習補給",
          desc: "答對 1 題，獲得【靈獸誘餌果 x2、聲望 +20】（單次限定）",
          rewardSummary: "獲得【靈獸誘餌果 x2】與公會聲望 +20！",
          onSuccess: function(state) {
            state.questProgress.done_pa_guild_inquire = true;
            state.inventory.tameFruit += 2;
            state.guildPoints += 20;
            window.Aetheria.State.updateGuildRank();
          }
        }
      ]
    },

    npc_merch: {
      id: "npc_merch",
      name: "神秘行商・奇奇",
      role: "跨大陸奇珍異寶商人",
      sprite: "npc_merchant",
      greeting: "「嘿嘿，少年！手頭上有戰鬥賺返嚟嘅金幣或者多餘嘅低階礦石嗎？隨時可以喺我度買原木、礦石同藥水，或者提煉高階秘銀！」",
      serviceLabel: "開啟煉金提煉與金幣商店",
      serviceAction: "openMerchantShop",
      pathActions: [
        {
          id: "pa_merch_haggle",
          onceKey: "done_pa_merch_haggle",
          type: "inquire",
          label: "【議價】答題贏取行商見面禮",
          desc: "答對 1 題，免費獲贈【爆破炸彈 x2、生命藥水 x2】（單次限定）",
          rewardSummary: "議價大成功！獲得【爆破炸彈 x2、生命藥水 x2】！",
          onSuccess: function(state) {
            state.questProgress.done_pa_merch_haggle = true;
            state.inventory.bombItem += 2;
            state.inventory.potionHeal += 2;
          }
        }
      ]
    }
  };

  NPCS_DB.npc_merch_canyon = NPCS_DB.npc_merch;

  // 3. 冒險者公會階級表 (每升一階級可領一次晉升俸祿)
  const GUILD_RANKS = [
    { rank: "F",  name: "銅牌見習共鳴者", minPts: 0,   dailyIron: 3,  dailyPotion: 1, perk: "基礎探索與委託權限" },
    { rank: "E",  name: "鐵牌正式冒險者", minPts: 30,  dailyIron: 5,  dailyPotion: 1, perk: "牧場戰寵遠征挖礦產量 +25%" },
    { rank: "C",  name: "銀牌秘境探索者", minPts: 80,  dailyIron: 8,  dailyPotion: 2, perk: "解鎖高階懸賞與秘銀提煉" },
    { rank: "A",  name: "金牌破盾先鋒",   minPts: 180, dailyIron: 12, dailyPotion: 2, perk: "所有戰鬥獲得經驗值與金幣 +25%" },
    { rank: "S",  name: "鑽石王牌共鳴者", minPts: 350, dailyIron: 16, dailyPotion: 3, perk: "異色閃光魔物出現機率翻倍 (16%)" },
    { rank: "SS", name: "破曉傳說大宗師", minPts: 600, dailyIron: 25, dailyPotion: 5, perk: "開局額外 +1 BP，總攻擊與破盾傷害 +30%" }
  ];

  // 4. 擴充版 5 大公會委託池 (涵蓋木材、礦石、破防核心與秘銀)
  const GUILD_BOUNTIES = [
    {
      id: "gb_gather_wood",
      title: "【營地擴建】徵集森林木材",
      desc: "交付翠風原木支援營地防禦工事。",
      cost: { wood: 4 },
      rewardText: "藍晶鐵礦 x3、80 G、聲望 +15",
      onComplete: function(state) {
        state.inventory.iron += 3;
        state.questProgress.bountiesCleared = (state.questProgress.bountiesCleared || 0) + 1;
        window.Aetheria.State.gainRewards(50, 80, 15);
      }
    },
    {
      id: "gb_gather_iron",
      title: "【鐵匠急需】前線礦石補給",
      desc: "交付藍晶鐵礦支援營地武器整備。",
      cost: { iron: 5 },
      rewardText: "流沙秘銀礦 x2、100 G、聲望 +20",
      onComplete: function(state) {
        state.inventory.mithril += 2;
        state.questProgress.bountiesCleared = (state.questProgress.bountiesCleared || 0) + 1;
        window.Aetheria.State.gainRewards(65, 100, 20);
      }
    },
    {
      id: "gb_gather_herb",
      title: "【煉金委託】星象師的藥材",
      desc: "交付紅傘微光菇與翠風太陽花。",
      cost: { herb: 3, flower: 2 },
      rewardText: "洞察藥水 x2、靈獸誘餌果 x1、聲望 +25",
      onComplete: function(state) {
        state.inventory.potionHint += 2;
        state.inventory.tameFruit += 1;
        state.questProgress.bountiesCleared = (state.questProgress.bountiesCleared || 0) + 1;
        window.Aetheria.State.gainRewards(85, 120, 25);
      }
    },
    {
      id: "gb_hunt_bamboo",
      title: "【破防討伐】收集竹精木心",
      desc: "將竹子妖打入 BREAK 破防狀態擊敗以取得木心。",
      cost: { coreBamboo: 2 },
      rewardText: "流沙秘銀礦 x3、爆破炸彈 x1、聲望 +30",
      onComplete: function(state) {
        state.inventory.mithril += 3;
        state.inventory.bombItem += 1;
        state.questProgress.bountiesCleared = (state.questProgress.bountiesCleared || 0) + 1;
        window.Aetheria.State.gainRewards(110, 160, 30);
      }
    },
    {
      id: "gb_hunt_skull",
      title: "【高階討伐】淨化骷髏魂火",
      desc: "破防擊敗骷髏兵並交付骷髏魂火與秘銀。",
      cost: { coreSkull: 2, mithril: 4 },
      rewardText: "熔岩黑曜石 x3、300 G、聲望 +45",
      onComplete: function(state) {
        state.inventory.obsidian += 3;
        state.questProgress.bountiesCleared = (state.questProgress.bountiesCleared || 0) + 1;
        window.Aetheria.State.gainRewards(180, 300, 45);
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

  window.Aetheria.Data.MAIN_QUESTS = MAIN_QUESTS;
  window.Aetheria.Data.NPCS_DB = NPCS_DB;
  window.Aetheria.Data.GUILD_RANKS = GUILD_RANKS;
  window.Aetheria.Data.GUILD_BOUNTIES = GUILD_BOUNTIES;
  window.Aetheria.Data.getCurrentMainQuest = getCurrentMainQuest;
})();
