/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 全域狀態、成長公式與永久存檔中心 (save-state.js - v3.0)
 * 新增：1.首頁存檔偵測 hasExistingSave()
 *       2.步行踩點解鎖傳送陣 unlockedZones: ["camp_hub"]
 *       3.公會委託接取列表 activeBounties: [] (上限 3 張)
 *       4.初始區域設為純安全基地 camp_hub (0.曙光露營基地)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const SAVE_KEY = "PROJECT_J_AETHERIA_SAVE_V3";

  const DEFAULT_STATE = {
    version: "3.0",
    lv: 1,
    exp: 0,
    hp: 100,
    maxHp: 100,
    baseAtk: 25,
    baseDef: 8,
    bp: 1,
    maxBp: 5,
    streak: 0,
    maxStreak: 0,
    gold: 150,

    // 職業與裝備
    currentJob: "swordsman",
    unlockedJobs: ["swordsman"],
    equippedWeapon: "w_starter",
    unlockedWeapons: ["w_starter"],
    unlockedRelics: [],
    pinnedRecipe: "w_tide",

    // 四大探索工具階級 (Lv.1 ~ Lv.3)
    tools: {
      pickaxe: 1,
      axe: 1,
      bomb: 1,
      hook: 1
    },

    // 戰寵與遠征計數
    activePet: "pet_slime",
    unlockedPets: ["pet_slime"],
    shinyPets: [],
    expeditionCounter: 0,

    // 背包素材與消耗品
    inventory: {
      iron: 2,
      mithril: 0,
      obsidian: 0,
      starIron: 0,
      herb: 2,
      flower: 1,
      iceLotus: 0,
      goldLeaf: 0,
      wood: 2,
      coreBamboo: 0,
      coreSkull: 0,
      coreDragon: 0,
      potionHeal: 3,
      potionHint: 3,
      bombItem: 3,
      tameFruit: 3
    },

    // 星象儀溫習科目與錯題記錄
    activeSubjects: {
      chinese: true,
      english: true,
      humanities: true,
      science: true
    },
    questionMastery: {},
    wrongBook: [],

    // 公會階級、已接委託 (上限 3 張) 與主線任務進度
    guildPoints: 0,
    guildRank: "F",
    activeBounties: [],     // 儲存玩家已在公會接取的委託 ID (最多 3 張)
    completedBounties: [],  // 累計已交付的委託紀錄
    activeMainQuest: "mq_01",
    questProgress: {
      mq_01_talked: false,
      mq_02_crafted: false,
      mq_03_boss: false,
      bountiesCleared: 0
    },
    campBuildings: {
      greenhouse: 0,
      pasture: 1
    },

    // 位置與「步行解鎖傳送區域」記錄 (初始僅解鎖第 0 區：曙光營地 camp_hub)
    currentZone: "camp_hub",
    unlockedZones: ["camp_hub"],
    heroX: 250,
    heroY: 220,
    petX: 228,
    petY: 224,
    facing: "down",
    openedNodes: {},
    maxTowerFloor: 1
  };

  function isObject(item) {
    return (item && typeof item === "object" && !Array.isArray(item));
  }

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

  const StateManager = {
    data: JSON.parse(JSON.stringify(DEFAULT_STATE)),

    hasExistingSave() {
      try {
        return Boolean(localStorage.getItem(SAVE_KEY));
      } catch (e) {
        return false;
      }
    },

    getSaveSummary() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return {
          lv: parsed.lv || 1,
          zone: parsed.currentZone || "camp_hub",
          guildRank: parsed.guildRank || "F"
        };
      } catch (e) {
        return null;
      }
    },

    init() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.data = deepMerge(DEFAULT_STATE, parsed);
          if (!Array.isArray(this.data.unlockedZones) || this.data.unlockedZones.length === 0) {
            this.data.unlockedZones = ["camp_hub"];
          }
          if (!Array.isArray(this.data.activeBounties)) {
            this.data.activeBounties = [];
          }
        }
      } catch (e) {
        console.warn("讀取存檔失敗，使用預設進度:", e);
      }
      return this.data;
    },

    startFreshNewGame() {
      this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
      this.save();
      return this.data;
    },

    save() {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
      } catch (e) {}
    },

    resetSave() {
      try {
        localStorage.removeItem(SAVE_KEY);
      } catch (e) {}
      this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
      window.location.reload();
    },

    // 當角色步行進入新區域時，解鎖該區的傳送石碑
    unlockZone(zoneId) {
      if (!zoneId) return false;
      // 室內帳篷不列入大世界傳送清單
      if (zoneId === "tent_guild" || zoneId === "tent_forge") return false;
      if (!this.data.unlockedZones.includes(zoneId)) {
        this.data.unlockedZones.push(zoneId);
        this.save();
        return true;
      }
      return false;
    },

    exportJSON() {
      return JSON.stringify(this.data);
    },

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

    getExpRequired(lv = this.data.lv) {
      return Math.floor(35 * Math.pow(lv, 1.35));
    },

    getTotalAtk() {
      const s = this.data;
      const weapons = (window.Aetheria.Data && window.Aetheria.Data.WEAPONS) || {};
      const jobs = (window.Aetheria.Data && window.Aetheria.Data.JOBS) || {};
      const wBonus = weapons[s.equippedWeapon] ? weapons[s.equippedWeapon].atk : 15;
      const jMult = jobs[s.currentJob] ? jobs[s.currentJob].atkMult : 1.0;
      const shinyBonus = (s.shinyPets && s.shinyPets.includes(s.activePet)) ? 1.2 : 1.0;
      return Math.round((s.baseAtk + wBonus) * jMult * shinyBonus);
    },

    getBonusShieldBreak() {
      const s = this.data;
      const weapons = (window.Aetheria.Data && window.Aetheria.Data.WEAPONS) || {};
      let bonus = weapons[s.equippedWeapon] ? (weapons[s.equippedWeapon].shieldBreak || 0) : 0;
      if (s.currentJob === "swordsman" && Math.random() < 0.25) bonus += 1;
      if (s.currentJob === "archmage") bonus += 1;
      return bonus;
    },

    gainRewards(expAmount, goldAmount = 0, guildPts = 5) {
      const s = this.data;
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
          msg = `牧場戰寵遠征歸來：藍晶礦 +${minedIron}｜溫室產出：洞察藥水 +1`;
        } else {
          msg = `牧場戰寵自動挖礦歸來：獲得【藍晶礦 +${minedIron}】`;
        }
        this.save();
      }
      return msg;
    }
  };

  window.Aetheria.State = StateManager;
})();
