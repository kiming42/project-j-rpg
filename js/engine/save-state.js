/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 全域狀態、成長公式與永久存檔中心 (save-state.js)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const SAVE_KEY = "PROJECT_J_AETHERIA_SAVE_V2";

  // 預設初始存檔結構 (涵蓋升級、6職業、4階素材、工具鎖、鍛造、戰寵、公會與任務)
  const DEFAULT_STATE = {
    version: "2.0",
    // 1. 角色基礎成長與等級
    lv: 1,
    exp: 0,
    hp: 100,
    maxHp: 100,
    baseAtk: 25,
    baseDef: 8,
    bp: 1,
    maxBp: 5,
    streak: 0,           // 連續答對連勝數
    maxStreak: 0,
    gold: 150,

    // 2. 職業系統 (6 大職業)
    currentJob: "swordsman",
    unlockedJobs: ["swordsman"],

    // 3. 武器、防具與釘選配方
    equippedWeapon: "w_starter",
    unlockedWeapons: ["w_starter"],
    equippedRelic: null,
    unlockedRelics: [],
    pinnedRecipe: "w_tide",

    // 4. 探索工具升級鎖 (Metroidvania 破障等級 Lv.1 ~ Lv.3)
    tools: {
      pickaxe: 1,  // Lv.1 新手鐵鎬, Lv.2 秘銀重鎬(碎石), Lv.3 星隕鑽頭
      axe: 1,      // Lv.1 石製手斧, Lv.2 烈焰戰斧(砍枯木), Lv.3 雷鳴神斧
      bomb: 1,     // Lv.1 爆破炸彈(炸裂縫牆), Lv.2 連環炸藥, Lv.3 符文爆破核心
      hook: 1      // Lv.1 竹製釣竿, Lv.2 鐵索抓鉤(飛越斷崖), Lv.3 深海金鉤
    },

    // 5. 戰寵收服與牧場派遣系統
    activePet: "pet_slime",
    unlockedPets: ["pet_slime"],
    shinyPets: [],       // 已收服的異色閃光寵 ID
    expeditionCounter: 0,// 遠征累積答題計數 (每滿 5 題結算一次牧場挖礦收益)

    // 6. 四階素材與消耗品背包
    inventory: {
      // T1 ~ T4 礦石
      iron: 2,           // 💎 藍晶鐵礦
      mithril: 0,        // 🪙 流沙秘銀礦
      obsidian: 0,       // 🔥 熔岩黑曜石
      starIron: 0,       // 🌌 深淵星隕鐵
      // T1 ~ T4 靈草
      herb: 2,           // 🍄 紅傘微光菇
      flower: 1,         // 🌸 翠風太陽花
      iceLotus: 0,       // 🪷 雪山冰蓮
      goldLeaf: 0,       // 🌳 世界樹金葉
      // 建材與魔物破防核心
      wood: 2,           // 🪵 翠風原木
      coreBamboo: 0,     // 🦴 竹精木心 (Break 擊殺掉落)
      coreSkull: 0,      // 🦴 骷髏魂火
      coreDragon: 0,     // 🦴 龍王逆鱗
      // 消耗品
      potionHeal: 3,     // 🧪 生命藥水
      potionHint: 3,     // 🧪 洞察藥水 (英文全盲串字提示)
      bombItem: 3,       // 💣 爆破炸彈數量
      tameFruit: 3       // 🍎 靈獸誘餌果實
    },

    // 7. 營地星象儀：Justin 當日溫習科目調頻 與 SRS 題庫記憶
    activeSubjects: {
      chinese: true,
      english: true,
      humanities: true,
      science: true
    },
    questionMastery: {}, // { [qId]: { stars: 0~5, wrongCount: 0 } }
    wrongBook: [],       // 錯題魔導書題目 ID 陣列

    // 8. 冒險者公會與三層任務進度
    guildPoints: 0,
    guildRank: "F",      // F -> E -> C -> A -> S -> SS
    activeMainQuest: "mq_01",
    questProgress: {
      mq_01_talked: false,
      mq_02_crafted: false,
      mq_03_boss: false,
      bountiesCleared: 0
    },
    campBuildings: {
      greenhouse: 0,     // 煉金溫室等級 (自動產出洞察藥水)
      pasture: 1         // 魔物牧場等級
    },

    // 9. 大世界座標與已開啟狀態
    currentZone: "forest_world",
    heroX: 420,
    heroY: 345,
    petX: 396,
    petY: 350,
    facing: "down",
    openedNodes: {},     // 記錄已開啟的傳說寶箱與炸開的隱藏牆壁
    maxTowerFloor: 1     // 無盡試煉之塔最高紀錄樓層
  };

  // 深層合併存檔 (確保未來新增欄位時不會覆蓋或弄壞舊存檔)
  function deepMerge(target, source) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target)) Object.assign(output, { [key]: source[key] });
          else output[key] = deepMerge(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  function isObject(item) {
    return (item && typeof item === "object" && !Array.isArray(item));
  }

  const StateManager = {
    data: JSON.parse(JSON.stringify(DEFAULT_STATE)),

    init() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.data = deepMerge(DEFAULT_STATE, parsed);
        }
      } catch (e) {
        console.warn("讀取存檔失敗，使用預設新進度:", e);
      }
      return this.data;
    },

    save() {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.warn("自動存檔失敗:", e);
      }
    },

    resetSave() {
      this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
      this.save();
      window.location.reload();
    },

    // 匯出 JSON 存檔字串
    exportJSON() {
      return JSON.stringify(this.data);
    },

    // 匯入 JSON 存檔字串
    importJSON(jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr);
        this.data = deepMerge(DEFAULT_STATE, parsed);
        this.save();
        return true;
      } catch (e) {
        return false;
      }
    },

    // ================= 雙曲線平滑升級公式 =================
    // NextEXP = floor(35 * Lv^1.35)
    getExpRequired(lv = this.data.lv) {
      return Math.floor(35 * Math.pow(lv, 1.35));
    },

    // 計算當前總攻擊力 (基礎攻擊 + 武器加成 + 職業加成)
    getTotalAtk() {
      const s = this.data;
      const weapons = (window.Aetheria.Data && window.Aetheria.Data.WEAPONS) || {};
      const jobs = (window.Aetheria.Data && window.Aetheria.Data.JOBS) || {};
      const wBonus = weapons[s.equippedWeapon] ? weapons[s.equippedWeapon].atk : 15;
      const jMult = jobs[s.currentJob] ? jobs[s.currentJob].atkMult : 1.0;
      const shinyBonus = s.shinyPets.includes(s.activePet) ? 1.2 : 1.0;
      return Math.round((s.baseAtk + wBonus) * jMult * shinyBonus);
    },

    // 計算額外破盾數
    getBonusShieldBreak() {
      const s = this.data;
      const weapons = (window.Aetheria.Data && window.Aetheria.Data.WEAPONS) || {};
      let bonus = weapons[s.equippedWeapon] ? (weapons[s.equippedWeapon].shieldBreak || 0) : 0;
      if (s.currentJob === "swordsman" && Math.random() < 0.25) bonus += 1;
      if (s.currentJob === "archmage") bonus += 1;
      return bonus;
    },

    // 獲得經驗與金幣，自動處理連續升級
    gainRewards(expAmount, goldAmount = 0, guildPts = 5) {
      const s = this.data;
      // 連勝經驗倍率加成
      let mult = 1.0;
      if (s.streak >= 5) mult = 1.5;
      else if (s.streak >= 3) mult = 1.2;

      s.exp += Math.round(expAmount * mult);
      s.gold += goldAmount;
      s.guildPoints += guildPts;

      let leveledUp = false;
      while (s.exp >= this.getExpRequired(s.lv) && s.lv < 100) {
        s.exp -= this.getExpRequired(s.lv);
        s.lv++;
        s.maxHp += 20;
        s.hp = s.maxHp;
        s.baseAtk += 5;
        s.baseDef += 2;
        leveledUp = true;
      }

      this.updateGuildRank();
      this.checkJobUnlocks();
      this.save();
      return leveledUp;
    },

    updateGuildRank() {
      const pts = this.data.guildPoints;
      if (pts >= 600) this.data.guildRank = "SS";
      else if (pts >= 350) this.data.guildRank = "S";
      else if (pts >= 180) this.data.guildRank = "A";
      else if (pts >= 80)  this.data.guildRank = "C";
      else if (pts >= 30)  this.data.guildRank = "E";
      else this.data.guildRank = "F";
    },

    checkJobUnlocks() {
      const lv = this.data.lv;
      const unlocked = this.data.unlockedJobs;
      if (lv >= 5 && !unlocked.includes("scholar")) unlocked.push("scholar");
      if (lv >= 12 && !unlocked.includes("hunter")) unlocked.push("hunter");
      if (lv >= 20 && !unlocked.includes("thief")) unlocked.push("thief");
      if (lv >= 30 && !unlocked.includes("alchemist")) unlocked.push("alchemist");
      if (lv >= 50 && !unlocked.includes("archmage")) unlocked.push("archmage");
    },

    // 戰寵牧場遠征與煉金溫室自動產出結算 (每答對 1 題呼叫一次)
    tickPassiveProduction() {
      const s = this.data;
      s.expeditionCounter = (s.expeditionCounter || 0) + 1;
      let msg = null;

      if (s.expeditionCounter >= 5) {
        s.expeditionCounter = 0;
        const idlePetCount = Math.max(1, s.unlockedPets.length);
        const minedIron = idlePetCount * 2;
        s.inventory.iron += minedIron;
        if (s.campBuildings.greenhouse > 0) {
          s.inventory.potionHint += 1;
          msg = `🐾 牧場戰寵遠征歸來：藍晶礦 +${minedIron}｜溫室結出：洞察藥水 +1！`;
        } else {
          msg = `🐾 牧場戰寵自動挖礦歸來：獲得【藍晶礦 +${minedIron}】！`;
        }
        this.save();
      }
      return msg;
    }
  };

  window.Aetheria.State = StateManager;
})();