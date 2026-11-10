/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 六大職業、戰寵收服與魔物生態資料庫 (jobs-monsters.js - v3.5)
 * 升級：實裝公會 S 級 / SS 級特權「異色閃光魔物 (Shiny) 出現率翻倍 (16%)」！
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  const JOBS = {
    swordsman: {
      id: "swordsman",
      name: "蒼藍劍士",
      unlockLv: 1,
      atkMult: 1.15,
      title: "破陣先鋒",
      passiveDesc: "基礎攻擊力 +15%，每次答對有 25% 機率額外多削減 1 點護盾。"
    },
    scholar: {
      id: "scholar",
      name: "符文學者",
      unlockLv: 5,
      atkMult: 1.25,
      title: "古語解讀者",
      passiveDesc: "法術與攻擊 +25%，遇到「看圖題」與「多重配對題」時破盾數直接 +1！"
    },
    hunter: {
      id: "hunter",
      name: "荒野獵人",
      unlockLv: 12,
      atkMult: 1.3,
      title: "靈獸馴師",
      passiveDesc: "可同時攜帶 2 隻戰寵雙重助戰（觸發雙寵技能），戰寵協同傷害翻倍！"
    },
    thief: {
      id: "thief",
      name: "暗影盜賊",
      unlockLv: 20,
      atkMult: 1.4,
      title: "秘境疾風",
      passiveDesc: "大世界移動速度 +20%，每次答對攻擊有 35% 機率直接從魔物身上偷走礦石！"
    },
    alchemist: {
      id: "alchemist",
      name: "煉金藥師",
      unlockLv: 30,
      atkMult: 1.5,
      title: "真理調合師",
      passiveDesc: "每回合答對自動回復 15% 最大生命，且四選一題目自動排除 1 個錯誤選項！"
    },
    archmage: {
      id: "archmage",
      name: "星界魔導",
      unlockLv: 50,
      atkMult: 1.8,
      title: "破曉大宗師",
      passiveDesc: "全屬性額外削盾 +1，進場自帶 3 顆 BP 增幅珠，英文盲串暴擊 x3 倍！"
    }
  };

  const PETS = {
    pet_slime: {
      id: "pet_slime",
      name: "藍水滴史萊姆",
      spriteKey: "pet_slime",
      shinySpriteKey: "pet_slime_shiny",
      skillName: "水滴治癒",
      skillDesc: "每回合答對後，自動回復 12 點生命值並追加 20% 水滴連擊。",
      healPerTurn: 12,
      bonusDmgRatio: 0.2
    },
    pet_dragon: {
      id: "pet_dragon",
      name: "赤炎小幼龍",
      spriteKey: "pet_dragon",
      shinySpriteKey: "pet_dragon_shiny",
      skillName: "龍炎吐息",
      skillDesc: "每回合答對後，噴射龍炎追加 45% 額外暴擊傷害！",
      healPerTurn: 0,
      bonusDmgRatio: 0.45
    },
    pet_fox: {
      id: "pet_fox",
      name: "雷光九尾靈狐",
      spriteKey: "pet_fox",
      shinySpriteKey: "pet_fox_shiny",
      skillName: "雷鳴共鳴",
      skillDesc: "每回合答對後追加 30% 雷擊傷害，並有 30% 機率額外充能 1 顆 BP！",
      healPerTurn: 5,
      bonusDmgRatio: 0.3,
      bpChance: 0.3
    },
    pet_icedragon: {
      id: "pet_icedragon",
      name: "永凍冰晶幼龍",
      spriteKey: "pet_icedragon",
      shinySpriteKey: "pet_icedragon_shiny",
      skillName: "絕對零度",
      skillDesc: "每回合追加 50% 冰霜傷害、回復 10 點生命，且開局自動削減敵人 1 點護盾！",
      healPerTurn: 10,
      bonusDmgRatio: 0.5,
      openingShieldBreak: 1
    }
  };

  const MONSTER_TEMPLATES = {
    bamboo: {
      type: "bamboo",
      spriteKey: "mon_bamboo",
      baseHp: 55,
      hpPerLv: 16,
      baseShield: 2,
      weak: "忍刀 / 火遁",
      normalDrop: "iron",
      breakDrop: "coreBamboo",
      tamePetId: "pet_fox",
      expBase: 24,
      goldBase: 20
    },
    skull: {
      type: "skull",
      spriteKey: "mon_skull",
      baseHp: 85,
      hpPerLv: 22,
      baseShield: 3,
      weak: "水遁 / 雷鳴",
      normalDrop: "mithril",
      breakDrop: "coreSkull",
      tamePetId: "pet_dragon",
      expBase: 38,
      goldBase: 35
    },
    boss: {
      type: "boss",
      spriteKey: "mon_boss",
      baseHp: 220,
      hpPerLv: 30,
      baseShield: 5,
      weak: "冰晶 / 星隕",
      normalDrop: "obsidian",
      breakDrop: "coreDragon",
      tamePetId: "pet_icedragon",
      expBase: 120,
      goldBase: 150
    }
  };

  function createBattleEnemy(mapMonsterNode) {
    const mType = mapMonsterNode ? (mapMonsterNode.type || "bamboo") : "bamboo";
    const tpl = MONSTER_TEMPLATES[mType] || MONSTER_TEMPLATES.bamboo;
    const lv = mapMonsterNode ? (mapMonsterNode.lv || 2) : 2;
    const isBoss = Boolean(mapMonsterNode && mapMonsterNode.isBoss);

    // 公會 S 級 / SS 級特權：異色閃光怪出現機率翻倍 (8% -> 16%)
    const state = (window.Aetheria.State && window.Aetheria.State.data) || {};
    const shinyRate = (state.guildRank === "S" || state.guildRank === "SS") ? 0.16 : 0.08;
    const isShiny = Boolean(mapMonsterNode && (mapMonsterNode.forceShiny || mapMonsterNode.isShiny)) || (Math.random() < shinyRate);

    const maxHp = Math.round((tpl.baseHp + lv * tpl.hpPerLv) * (isBoss ? 1.6 : 1.0));
    const maxShield = isBoss ? Math.max(4, tpl.baseShield + Math.floor(lv / 6)) : tpl.baseShield + (lv >= 10 ? 1 : 0);

    return {
      id: mapMonsterNode ? mapMonsterNode.id : "wild_mon",
      type: mType,
      name: (mapMonsterNode ? mapMonsterNode.name : "翠風竹子妖") + " Lv." + lv,
      lv: lv,
      isBoss: isBoss,
      isShiny: isShiny,
      spriteKey: tpl.spriteKey,
      hp: maxHp,
      maxHp: maxHp,
      shield: maxShield,
      maxShield: maxShield,
      broken: false,
      weak: tpl.weak,
      normalDrop: tpl.normalDrop,
      breakDrop: tpl.breakDrop,
      tamePetId: tpl.tamePetId,
      expReward: Math.round(tpl.expBase * lv * (isShiny ? 2.0 : 1.0)),
      goldReward: Math.round(tpl.goldBase * lv * (isShiny ? 2.0 : 1.0))
    };
  }

  window.Aetheria.Data.JOBS = JOBS;
  window.Aetheria.Data.PETS = PETS;
  window.Aetheria.Data.MONSTER_TEMPLATES = MONSTER_TEMPLATES;
  window.Aetheria.Data.createBattleEnemy = createBattleEnemy;
})();
