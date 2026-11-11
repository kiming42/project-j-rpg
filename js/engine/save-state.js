/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 全域狀態、高門檻公會晉升與動態懸賞追蹤 (save-state.js - v5.2)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const SAVE_KEY = "PROJECT_J_AETHERIA_SAVE_V5";

  const DEFAULT_STATE = {
    version: "5.2",
    lv: 1,
    exp: 0,
    hp: 100,
    maxHp: 100,
    baseAtk: 24,
    baseDef: 6,
    bp: 1,
    maxBp: 5,
    streak: 0,
    maxStreak: 0,
    gold: 0,

    currentJob: "swordsman",
    unlockedJobs: ["swordsman"],
    equippedWeapon: "w_starter",
    unlockedWeapons: ["w_starter"],
    equippedArmor: "a_cloth",
    unlockedArmors: ["a_cloth"],
    unlockedRelics: [],
    pinnedRecipe: "w_vine",

    socketedRunes: {
      weapon: null,
      armor: null
    },

    activeMeal: {
      id: null,
      battlesLeft: 0
    },

    tools: {
      pickaxe: 1,
      axe: 1,
      bomb: 1,
      hook: 1
    },

    activePet: "pet_slime",
    unlockedPets: ["pet_slime"],
    shinyPets: [],
    expeditionCounter: 0,

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
      vine: 0,
      shell: 0,
      coral: 0,
      fur: 0,
      magmaScale: 0,
      fish: 0,
      tabletShard: 0,
      coreBamboo: 0,
      coreSkull: 0,
      coreSiren: 0,
      coreWolf: 0,
      coreGolem: 0,
      coreDragon: 0,
      potionHeal: 0,
      potionHint: 0,
      bombItem: 0,
      tameFruit: 0
    },

    monolithPts: {
      chinese: 0,
      english: 0,
      science: 0,
      humanities: 0
    },

    activeSubjects: {
      chinese: true,
      english: true,
      humanities: true,
      science: true
    },
    questionMastery: {},
    wrongBook: [],

    // 公會階級、單次俸祿紀錄與動態懸賞池追蹤
    guildPoints: 0,
    guildRank: "F",
    claimedRankSupplies: [],
    activeBounties: [],
    bountyPoolSeed: 1,
    bountyCooldowns: {},
    wrongBountyKills: 0,
    bountyStats: {
      kills: 0,
      breaks: 0,
      fishes: 0,
      meals: 0
    },

    questProgress: {
      mq_01_talked: false,
      bountiesCleared: 0
    },
    clearedBosses: {},
    unlockedSeals: {},
    seenCutscenes: {},

    campBuildings: {
      greenhouse: 0,
      pasture: 1
    },

    currentZone: "camp_hub",
    unlockedZones: ["camp_hub"],
    heroX: 320,
    heroY: 260,
    petX: 296,
    petY: 264,
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
          if (!Array.isArray(this.data.unlockedArmors) || this.data.unlockedArmors.length === 0) {
            this.data.unlockedArmors = ["a_cloth"];
          }
          if (!this.data.unlockedSeals) this.data.unlockedSeals = {};
          if (!this.data.bountyStats) this.data.bountyStats = { kills: 0, breaks: 0, fishes: 0, meals: 0 };
        }
      } catch (e) {
        console.warn("讀取存檔失敗，使用預設進度:", e);
      }
      this.updateGuildRank();
      this.recalcMaxHp();
      return this.data;
    },

    startFreshNewGame: function() {
      this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
      this.recalcMaxHp();
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
        this.updateGuildRank();
        this.recalcMaxHp();
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

    recalcMaxHp: function() {
      const s = this.data;
      const armors = (window.Aetheria.Data && window.Aetheria.Data.ARMORS) || {};
      const aObj = armors[s.equippedArmor] || { hpBonus: 0 };

      let totalMax = 80 + (s.lv * 20) + (aObj.hpBonus || 0);
      if (s.unlockedRelics && s.unlockedRelics.indexOf("r_cloak") !== -1) totalMax += 50;
      if (s.activeMeal && s.activeMeal.battlesLeft > 0 && s.activeMeal.id === "meal_soup") totalMax += 80;

      const humPts = (s.monolithPts && s.monolithPts.humanities) || 0;
      if (humPts >= 50) totalMax = Math.round(totalMax * 1.25);

      s.maxHp = totalMax;
      if (s.hp > s.maxHp) s.hp = s.maxHp;
      return s.maxHp;
    },

    getTotalAtk: function() {
      const s = this.data;
      const weapons = (window.Aetheria.Data && window.Aetheria.Data.WEAPONS) || {};
      const jobs = (window.Aetheria.Data && window.Aetheria.Data.JOBS) || {};
      const wBonus = weapons[s.equippedWeapon] ? weapons[s.equippedWeapon].atk : 15;
      const jMult = jobs[s.currentJob] ? jobs[s.currentJob].atkMult : 1.0;
      const shinyBonus = (s.shinyPets && s.shinyPets.indexOf(s.activePet) !== -1) ? 1.2 : 1.0;
      const ssBonus = (s.guildRank === "SS") ? 1.3 : 1.0;

      const chiPts = (s.monolithPts && s.monolithPts.chinese) || 0;
      const monoMult = (chiPts >= 75) ? 1.3 : (chiPts >= 25) ? 1.15 : 1.0;

      const hasGolemRune = (s.socketedRunes && (s.socketedRunes.weapon === "coreGolem" || s.socketedRunes.armor === "coreGolem")) ? 25 : 0;

      return Math.round((s.baseAtk + wBonus + hasGolemRune) * jMult * shinyBonus * ssBonus * monoMult);
    },

    getTotalDef: function() {
      const s = this.data;
      const armors = (window.Aetheria.Data && window.Aetheria.Data.ARMORS) || {};
      const aDef = armors[s.equippedArmor] ? armors[s.equippedArmor].def : 5;
      let total = s.baseDef + aDef;

      const humPts = (s.monolithPts && s.monolithPts.humanities) || 0;
      if (humPts >= 50) total = Math.round(total * 1.25);

      return total;
    },

    hasHazardImmunity: function(hazardType) {
      const s = this.data;
      const armors = (window.Aetheria.Data && window.Aetheria.Data.ARMORS) || {};
      const aObj = armors[s.equippedArmor] || {};

      if (hazardType === "cold") {
        if (aObj.resistCold || aObj.resistAll) return true;
        if (s.activeMeal && s.activeMeal.battlesLeft > 0 && s.activeMeal.id === "meal_hotpot") return true;
      }
      if (hazardType === "heat") {
        if (aObj.resistHeat || aObj.resistAll) return true;
        if (s.activeMeal && s.activeMeal.battlesLeft > 0 && s.activeMeal.id === "meal_hotpot") return true;
      }
      return false;
    },

    getBonusShieldBreak: function() {
      const s = this.data;
      const weapons = (window.Aetheria.Data && window.Aetheria.Data.WEAPONS) || {};
      let bonus = weapons[s.equippedWeapon] ? (weapons[s.equippedWeapon].shieldBreak || 0) : 0;
      if (s.currentJob === "swordsman" && Math.random() < 0.25) bonus += 1;
      if (s.currentJob === "archmage") bonus += 1;
      if (s.activeMeal && s.activeMeal.battlesLeft > 0 && s.activeMeal.id === "meal_fish") bonus += 1;
      return bonus;
    },

    hasRune: function(coreKey) {
      const r = this.data.socketedRunes;
      if (!r) return false;
      return r.weapon === coreKey || r.armor === coreKey;
    },

    gainRewards: function(expAmount, goldAmount, guildPts) {
      goldAmount = goldAmount || 0;
      guildPts = guildPts || 5;
      const s = this.data;

      const engPts = (s.monolithPts && s.monolithPts.english) || 0;
      let streakMult = 1.0;
      if (s.streak >= 5) streakMult = (engPts >= 75) ? 2.0 : 1.5;
      else if (s.streak >= 3) streakMult = 1.25;

      const rankBonus = (s.guildRank === "A" || s.guildRank === "S" || s.guildRank === "SS") ? 1.25 : 1.0;

      s.exp += Math.round(expAmount * streakMult * rankBonus);
      s.gold += Math.round(goldAmount * streakMult * rankBonus);
      s.guildPoints += guildPts;

      let leveledUp = false;
      while (s.exp >= this.getExpRequired(s.lv) && s.lv < 100) {
        s.exp -= this.getExpRequired(s.lv);
        s.lv++;
        s.baseAtk += 5;
        s.baseDef += 3;
        this.recalcMaxHp();
        s.hp = s.maxHp;
        leveledUp = true;
      }

      this.updateGuildRank();
      this.checkJobUnlocks();
      this.save();
      return leveledUp;
    },

    // 大幅提高公會階級與俸祿晉升門檻 (需同時達標聲望點數與角色等級！)
    updateGuildRank: function() {
      const s = this.data;
      const pts = s.guildPoints || 0;
      const lv = s.lv || 1;

      if (pts >= 2200 && lv >= 45) s.guildRank = "SS";
      else if (pts >= 1300 && lv >= 32) s.guildRank = "S";
      else if (pts >= 700  && lv >= 20) s.guildRank = "A";
      else if (pts >= 320  && lv >= 10) s.guildRank = "C";
      else if (pts >= 120  && lv >= 4)  s.guildRank = "E";
      else s.guildRank = "F";
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
        s.inventory.iron += 1;
        if (s.campBuildings.greenhouse > 0) {
          s.inventory.potionHint += 1;
          msg = "牧場遠征：藍晶鐵礦 +1｜溫室：洞察藥水 +1";
        } else {
          msg = "牧場遠征歸來：藍晶鐵礦 +1";
        }
        this.save();
      }
      return msg;
    }
  };

  window.Aetheria.State = StateManager;
})();
