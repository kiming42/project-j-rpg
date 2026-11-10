/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 故事任務、NPC旅人指令與冒險者公會庫 (quests-npcs.js)
 * 包含：主線劇情鏈、4大NPC互動與Path Actions(探查/討教/切磋)、公會階級與懸賞委託
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  // 1. 主線劇情任務鏈 (Main Story Quests — 自動偵測進度並顯示於右上角 HUD)
  const MAIN_QUESTS = [
    {
      id: "mq_01",
      chapter: "序章・破曉共鳴",
      title: "找營地鐵匠大叔・巴爾對話",
      desc: "前往營地東側帳篷旁（頭頂有 ⚒️ 標記），向鐵匠巴爾了解森林魔物異變與破盾忍刀的鍛造方法。",
      checkComplete: function(state) {
        return Boolean(state.questProgress && state.questProgress.mq_01_talked);
      },
      rewardText: "藍晶鐵礦 x3、紅傘微光菇 x2、EXP +40",
      onClaim: function(state) {
        state.inventory.iron += 3;
        state.inventory.herb += 2;
        window.Aetheria.State.gainRewards(40, 50, 15);
      }
    },
    {
      id: "mq_02",
      chapter: "第一章・潮汐破盾",
      title: "鍛造並裝備【🌊 潮汐破盾忍刀】",
      desc: "收集 5 顆藍晶鐵礦與 3 朵紅傘微光菇，打開【⚒️ 鍛造】打造《潮汐破盾忍刀》，讓每次答題都能額外削盾！",
      checkComplete: function(state) {
        return state.unlockedWeapons.includes("w_tide");
      },
      rewardText: "爆破炸彈 x3、靈獸誘餌果 x2、EXP +80",
      onClaim: function(state) {
        state.inventory.bombItem += 3;
        state.inventory.tameFruit += 2;
        window.Aetheria.State.gainRewards(80, 100, 25);
      }
    },
    {
      id: "mq_03",
      chapter: "第二章・秘境與遠征",
      title: "收服第 2 隻戰寵或完成 2 次公會委託",
      desc: "在戰鬥中將魔物打入 BREAK 破防狀態後點【🍎 收服】，或前往【🛡️ 公會】完成懸賞委託。",
      checkComplete: function(state) {
        return state.unlockedPets.length >= 2 || (state.questProgress && state.questProgress.bountiesCleared >= 2);
      },
      rewardText: "流沙秘銀礦 x5、洞察藥水 x3、EXP +150",
      onClaim: function(state) {
        state.inventory.mithril += 5;
        state.inventory.potionHint += 3;
        window.Aetheria.State.gainRewards(150, 200, 40);
      }
    },
    {
      id: "mq_04",
      chapter: "終章・破曉傳說",
      title: "挑戰無盡試煉之塔達第 5 層或擊敗區域 Boss",
      desc: "穿過翡翠河木橋前往流沙大峽谷，或進入西方《無盡試煉之塔》突破第 5 層！",
      checkComplete: function(state) {
        return state.maxTowerFloor >= 5 || Boolean(state.questProgress && state.questProgress.mq_03_boss);
      },
      rewardText: "深淵星隕鐵 x3、世界樹金葉 x2、EXP +300",
      onClaim: function(state) {
        state.inventory.starIron += 3;
        state.inventory.goldLeaf += 2;
        window.Aetheria.State.gainRewards(300, 500, 80);
      }
    }
  ];

  // 2. 營地與世界 4 大核心 NPC 對話與《歧路旅人》式旅人技能 (Path Actions)
  const NPCS_DB = {
    npc_smith: {
      id: "npc_smith",
      name: "👴 鐵匠大叔・巴爾",
      role: "曙光營地首席鍛造師",
      sprite: "npc_blacksmith",
      greeting: "「哈哈！Justin，你手腕上的古文明星象輪發光了！只要你在戰鬥中念出古文明符文（答對題目），就能震碎魔物的黑霧護盾！快去南方礦區挖點藍晶礦，大叔幫你打造神兵！」",
      serviceLabel: "⚒️ 開啟鐵匠鍛造與工具台",
      serviceAction: "openForgeModal",
      pathActions: [
        {
          id: "pa_smith_inquire",
          type: "inquire",
          label: "🔍 【探查】打聽隱藏礦脈",
          desc: "答對 1 題，獲知洞窟裂縫密室情報並獲贈【藍晶鐵礦 x3】",
          rewardSummary: "獲得【💎 藍晶鐵礦 x3】與密室情報！",
          onSuccess: function(state) {
            state.inventory.iron += 3;
          }
        },
        {
          id: "pa_smith_spar",
          type: "spar",
          label: "⚔️ 【切磋】與巴爾比試刀法",
          desc: "挑戰鐵匠巴爾 (Lv.6 護盾3)，獲勝可得真傳【🪙 流沙秘銀礦 x3】",
          enemyConfig: { name: "鐵匠宗師・巴爾", lv: 6, type: "boss", isBoss: false },
          rewardSummary: "切磋獲勝！獲得【🪙 流沙秘銀礦 x3】！",
          onSuccess: function(state) {
            state.inventory.mithril += 3;
          }
        }
      ]
    },

    npc_astro: {
      id: "npc_astro",
      name: "🧙‍♀️ 星象少女・艾莉婭",
      role: "古文明記憶調頻師",
      sprite: "npc_astrologer",
      greeting: "「星辰指引著失落的文字……Justin，今天你想共鳴哪一種古文明波頻（中文、英文、人文、科學）？隨時可以在我的星象儀自由切換喔！」",
      serviceLabel: "🔮 開啟星象儀（自由選擇溫習科目）",
      serviceAction: "openAstrolabeModal",
      pathActions: [
        {
          id: "pa_astro_inquire",
          type: "inquire",
          label: "🔍 【討教】請教古文明奧秘",
          desc: "答對 1 題，立即獲得【🧪 洞察藥水 x2】與【🌸 太陽花 x2】",
          rewardSummary: "討教成功！獲得【🧪 洞察藥水 x2】、【🌸 太陽花 x2】！",
          onSuccess: function(state) {
            state.inventory.potionHint += 2;
            state.inventory.flower += 2;
          }
        }
      ]
    },

    npc_guild: {
      id: "npc_guild",
      name: "🤠 公會會長・雷恩",
      role: "記憶共鳴者公會總長",
      sprite: "npc_guildmaster",
      greeting: "「歡迎來到冒險者公會！不論是完成懸賞委託、派你的戰寵去自動挖礦，還是討伐你曾經答錯的『暗影記憶幻象』，都能在這裡領取豐厚賞金！」",
      serviceLabel: "🛡️ 進入冒險者公會大廳",
      serviceAction: "openGuildModal",
      pathActions: [
        {
          id: "pa_guild_inquire",
          type: "inquire",
          label: "🔍 【探查】領取公會特批補給",
          desc: "答對 1 題，獲得公會特批【🍎 靈獸誘餌果 x2】與聲望 +20",
          rewardSummary: "獲得【🍎 靈獸誘餌果 x2】與公會聲望 +20！",
          onSuccess: function(state) {
            state.inventory.tameFruit += 2;
            state.guildPoints += 20;
            window.Aetheria.State.updateGuildRank();
          }
        }
      ]
    },

    npc_merch: {
      id: "npc_merch",
      name: "🎒 神秘行商・奇奇",
      role: "跨大陸奇珍異寶商人",
      sprite: "npc_merchant",
      greeting: "「嘿嘿，少年！過了這座木橋就是危險的河東秘境與流沙大峽谷了！要不要用你手上的普通礦石，跟我交換高級秘銀與炸彈？」",
      serviceLabel: "⚗️ 開啟萬能煉金與物資轉化爐",
      serviceAction: "openForgeModal",
      pathActions: [
        {
          id: "pa_merch_haggle",
          type: "inquire",
          label: "💰 【議價】答題贏取免費秘寶",
          desc: "答對 1 題，免費獲贈【💣 爆破炸彈 x2】與【🪙 秘銀礦 x2】",
          rewardSummary: "議價大成功！獲得【💣 爆破炸彈 x2】、【🪙 秘銀礦 x2】！",
          onSuccess: function(state) {
            state.inventory.bombItem += 2;
            state.inventory.mithril += 2;
          }
        }
      ]
    }
  };

  NPCS_DB.npc_merch_canyon = NPCS_DB.npc_merch;

  // 3. 冒險者公會階級表 (F 級 -> SS 級破曉大宗師)
  const GUILD_RANKS = [
    { rank: "F",  name: "銅牌見習共鳴者", minPts: 0,   dailyIron: 2, dailyPotion: 1, perk: "解鎖翠風大森林探索與基礎鍛造" },
    { rank: "E",  name: "鐵牌正式冒險者", minPts: 30,  dailyIron: 3, dailyPotion: 1, perk: "牧場戰寵遠征挖礦產量 +25%" },
    { rank: "C",  name: "銀牌秘境探索者", minPts: 80,  dailyIron: 5, dailyPotion: 2, perk: "解鎖流沙大峽谷與高階秘銀提煉" },
    { rank: "A",  name: "金牌破盾先鋒",   minPts: 180, dailyIron: 8, dailyPotion: 2, perk: "所有戰鬥獲得經驗值與金幣 +25%" },
    { rank: "S",  name: "鑽石王牌共鳴者", minPts: 350, dailyIron: 12,dailyPotion: 3, perk: "異色閃光魔物 (Shiny) 出現機率翻倍！" },
    { rank: "SS", name: "👑 破曉傳說大宗師", minPts: 600, dailyIron: 20,dailyPotion: 5, perk: "開局額外 +1 BP，全屬性破盾傷害 +30%！" }
  ];

  // 4. 公會委託板任務池 (可重複完成刷素材與公會聲望)
  const GUILD_BOUNTIES = [
    {
      id: "gb_gather_iron",
      title: "📋 【採集委託】前線鐵匠的急需",
      desc: "交付 3 顆【💎 藍晶鐵礦】支援營地武器整備。",
      cost: { iron: 3 },
      rewardText: "🪙 流沙秘銀礦 x2、公會聲望 +20、EXP +60",
      onComplete: function(state) {
        state.inventory.mithril += 2;
        state.questProgress.bountiesCleared = (state.questProgress.bountiesCleared || 0) + 1;
        window.Aetheria.State.gainRewards(60, 80, 20);
      }
    },
    {
      id: "gb_gather_herb",
      title: "📋 【煉金委託】星象師的微光藥材",
      desc: "交付 2 朵【🍄 紅傘微光菇】與 1 朵【🌸 翠風太陽花】。",
      cost: { herb: 2, flower: 1 },
      rewardText: "🧪 洞察藥水 x2、🍎 靈獸誘餌果 x1、聲望 +25",
      onComplete: function(state) {
        state.inventory.potionHint += 2;
        state.inventory.tameFruit += 1;
        state.questProgress.bountiesCleared = (state.questProgress.bountiesCleared || 0) + 1;
        window.Aetheria.State.gainRewards(80, 100, 25);
      }
    },
    {
      id: "gb_cook_soup",
      title: "🍲 【營地料理】熬製香濃蘑菇燉湯",
      desc: "消耗 2 朵【🍄 紅傘微光菇】，立即回滿全部紅心並獲贈 2 顆 BP 增幅珠！",
      cost: { herb: 2 },
      rewardText: "❤️ HP 全滿、🔥 BP 增幅珠 +2、EXP +45",
      onComplete: function(state) {
        state.hp = state.maxHp;
        state.bp = Math.min(state.maxBp, state.bp + 2);
        window.Aetheria.State.gainRewards(45, 30, 10);
      }
    }
  ];

  // 取得當前活躍的主線任務物件
  function getCurrentMainQuest(state) {
    for (let i = 0; i < MAIN_QUESTS.length; i++) {
      const q = MAIN_QUESTS[i];
      if (!state.questProgress[`claimed_${q.id}`]) {
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