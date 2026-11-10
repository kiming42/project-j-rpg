/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 全域狀態、零素材開局與單次俸祿記錄 (save-state.js - v3.4)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const SAVE_KEY = "PROJECT_J_AETHERIA_SAVE_V3";

  const DEFAULT_STATE = {
    version: "3.4",
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
    gold: 0,

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

    // 新遊戲時：背包初始完全為 0 (必須靠任務、採集與戰鬥收集)
    inventory: {
      iron: 0,
      mithril: 0,
      obsidian: 0,
      starIron: 0,
      herb: 0,
      flower: 0,
      iceLotus: 0,
      goldLeaf: 0,
      wood: 0,
      coreBamboo: 0,
      coreSkull: 0,
      coreDragon: 0,
      potionHeal: 0,
      potionHint: 0,
      bombItem: 0,
      tameFruit: 0
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

    // 公會階級、每階級單次俸祿領取紀錄、已接委託 (上限 3 張)
    guildPoints: 0,
    guildRank: "F",
    claimedRankSupplies: [], // 記錄已領取過俸祿的階級 (如 ["F", "E"])，每級限領一次！
    activeBounties: [],
    completedBounties: [],
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

    // 位置與步行解鎖傳送區域
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
      Object.keys(source).forEach(function(key) {
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

    hasExistingSave: function() {
      try {
        return Boolean(localStorage.getItem(SAVE_KEY));
      } catch (e) {
        return false;
      }
    },

    getSaveSummary: function() {
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

    init: function() {
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
          if (!Array.isArray(this.data.claimedRankSupplies)) {
            this.data.claimedRankSupplies = [];
          }
        }
      } catch (e) {
        console.warn("讀取存檔失敗，使用預設進度:", e);
      }
      return this.data;
    },

    startFreshNewGame: function() {
      this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
      this.save();
      return this.data;
    },

    save: function() {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
      } catch (e) {}
    },

    resetSave: function() {
      try {
        localStorage.removeItem(SAVE_KEY);
      } catch (e) {}
      this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
      window.location.reload();
    },

    unlockZone: function(zoneId) {
      if (!zoneId) return false;
      if (zoneId === "tent_guild" || zoneId === "tent_forge") return false;
      if (this.data.unlockedZones.indexOf(zoneId) === -1) {
        this.data.unlockedZones.push(zoneId);
        this.save();
        return true;
      }
      return false;
    },

    exportJSON: function() {
      return JSON.stringify(this.data);
    },

    importJSON: function(jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr);
        this.data = deepMerge(DEFAULT_STATE, parsed);
        this.save();
        return true;
      } catch (e) {
        return false;
      }
    },

    getExpRequired: function(lv) {
      lv = lv || this.data.lv;
      return Math.floor(35 * Math.pow(lv, 1.35));
    },

    getTotalAtk: function() {
      const s = this.data;
      const weapons = (window.Aetheria.Data && window.Aetheria.Data.WEAPONS) || {};
      const jobs = (window.Aetheria.Data && window.Aetheria.Data.JOBS) || {};
      const wBonus = weapons[s.equippedWeapon] ? weapons[s.equippedWeapon].atk : 15;
      const jMult = jobs[s.currentJob] ? jobs[s.currentJob].atkMult : 1.0;
      const shinyBonus = (s.shinyPets && s.shinyPets.indexOf(s.activePet) !== -1) ? 1.2 : 1.0;
      return Math.round((s.baseAtk + wBonus) * jMult * shinyBonus);
    },

    getBonusShieldBreak: function() {
      const s = this.data;
      const weapons = (window.Aetheria.Data && window.Aetheria.Data.WEAPONS) || {};
      let bonus = weapons[s.equippedWeapon] ? (weapons[s.equippedWeapon].shieldBreak || 0) : 0;
      if (s.currentJob === "swordsman" && Math.random() < 0.25) bonus += 1;
      if (s.currentJob === "archmage") bonus += 1;
      return bonus;
    },

    gainRewards: function(expAmount, goldAmount, guildPts) {
      goldAmount = goldAmount || 0;
      guildPts = guildPts || 5;
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

    updateGuildRank: function() {
      const pts = this.data.guildPoints;
      if (pts >= 600) this.data.guildRank = "SS";
      else if (pts >= 350) this.data.guildRank = "S";
      else if (pts >= 180) this.data.guildRank = "A";
      else if (pts >= 80)  this.data.guildRank = "C";
      else if (pts >= 30)  this.data.guildRank = "E";
      else this.data.guildRank = "F";
    },

    checkJobUnlocks: function() {
      const lv = this.data.lv;
      const unlocked = this.data.unlockedJobs;
      if (lv >= 5 && unlocked.indexOf("scholar") === -1) unlocked.push("scholar");
      if (lv >= 12 && unlocked.indexOf("hunter") === -1) unlocked.push("hunter");
      if (lv >= 20 && unlocked.indexOf("thief") === -1) unlocked.push("thief");
      if (lv >= 30 && unlocked.indexOf("alchemist") === -1) unlocked.push("alchemist");
      if (lv >= 50 && unlocked.indexOf("archmage") === -1) unlocked.push("archmage");
    },

    tickPassiveProduction: function() {
      const s = this.data;
      s.expeditionCounter = (s.expeditionCounter || 0) + 1;
      let msg = null;

      if (s.expeditionCounter >= 5) {
        s.expeditionCounter = 0;
        const idlePetCount = Math.max(1, s.unlockedPets.length);
        const minedIron = idlePetCount;
        s.inventory.iron += minedIron;
        if (s.campBuildings.greenhouse > 0) {
          s.inventory.potionHint += 1;
          msg = "牧場戰寵歸來：藍晶礦 +" + minedIron + "｜溫室產出：洞察藥水 +1";
        } else {
          msg = "牧場戰寵挖礦歸來：藍晶礦 +" + minedIron;
        }
        this.save();
      }
      return msg;
    }
  };

  window.Aetheria.State = StateManager;
})();
