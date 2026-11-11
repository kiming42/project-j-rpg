/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 四科17課(456題)與29幅教科書插畫總橋接器 (question-bridge.js - v6.4)
 * 自動串聯：questions-chinese.js (124題) / questions-english.js (92題) /
 *           questions-humanities.js (120題) / questions-science.js (120題)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const Bank = window.Aetheria.QuestionBank || {};
  const ChiBank = Bank.Chinese || { LESSONS: [], IDIOMS: [], WORDS: [] };
  const EngBank = Bank.English || { LESSONS: [], VOCAB: [] };
  const HumBank = Bank.Humanities || { LESSONS: [], QUESTIONS: [], DIAGRAMS: {} };
  const SciBank = Bank.Science || { LESSONS: [], QUESTIONS: [], DIAGRAMS: {} };

  // 1. 合併人文科與科學科全部 29 幅教科書級 SVG 向量圖庫
  const ALL_DIAGRAMS = Object.assign({}, HumBank.DIAGRAMS || {}, SciBank.DIAGRAMS || {});

  // 2. 匯總四科 17 個課次目錄 (LESSON_CATALOG)
  const LESSON_CATALOG = [];
  const unitNameLookup = {};

  function registerLessons(list, subjectKey) {
    (list || []).forEach(function(l) {
      unitNameLookup[l.key] = l.name;
      LESSON_CATALOG.push({
        key: l.key,
        subject: subjectKey,
        name: l.name,
        count: 0
      });
    });
  }

  registerLessons(ChiBank.LESSONS, "chinese");
  registerLessons(EngBank.LESSONS, "english");
  registerLessons(HumBank.LESSONS, "humanities");
  registerLessons(SciBank.LESSONS, "science");

  // 3. 題型分類目錄 (供星象調頻篩選題型)
  const QUIZ_TYPE_CATALOG = [
    { key: "chi_meaning", label: "中文・字詞/成語解釋" },
    { key: "chi_fill",    label: "中文・例句填充題" },
    { key: "eng_spell",   label: "英文・字塊串字(附字數位)" },
    { key: "eng_fill",    label: "英文・句子填充題" },
    { key: "hum_fill",    label: "人文・填充題" },
    { key: "hum_img_fill",label: "人文・看圖填充題" },
    { key: "hum_classify",label: "人文・分類籃題" },
    { key: "hum_mcq",     label: "人文・選擇題" },
    { key: "hum_short",   label: "人文・簡答題" },
    { key: "hum_scenario",label: "人文・情境問答題" },
    { key: "sci_fill",    label: "科學・填充題" },
    { key: "sci_img_fill",label: "科學・看圖填充題" },
    { key: "sci_classify",label: "科學・分類籃題" },
    { key: "sci_mcq",     label: "科學・選擇題" },
    { key: "sci_short",   label: "科學・簡答題" },
    { key: "sci_scenario",label: "科學・情境問答題" }
  ];

  // 4. 生成英文字數空白位，例如 "apple" -> "_____ (5)"、"by bus" -> "__ ___ (2, 3)"
  function formatEngBlankPattern(phrase) {
    const words = String(phrase || "").trim().split(/\s+/);
    const underscores = words.map(function(w) { return "_".repeat(w.length); }).join("   ");
    const counts = words.map(function(w) { return w.length; }).join(", ");
    return underscores + " (" + counts + ")";
  }

  // 5. 為中文/英文自動從同單元抽取 3 個不重複的干擾選項
  function buildAutoOptions(targetItem, pool, idxSeed) {
    let candidates = pool.filter(function(item) {
      return item.unitKey === targetItem.unitKey && item.word !== targetItem.word;
    });
    if (candidates.length < 3) {
      candidates = pool.filter(function(item) { return item.word !== targetItem.word; });
    }
    const distractors = [];
    for (let i = 0; i < candidates.length && distractors.length < 3; i++) {
      const pick = candidates[(idxSeed * 3 + i * 2) % candidates.length];
      if (pick && distractors.indexOf(pick.word) === -1) {
        distractors.push(pick.word);
      }
    }
    const allOpts = [targetItem.word].concat(distractors);
    const shift = idxSeed % allOpts.length;
    return allOpts.slice(shift).concat(allOpts.slice(0, shift));
  }

  // 6. 編譯四科全題庫 (合共 456 題)
  const ALL_QUESTIONS = [];

  // (A) 中文科：30 成語 + 32 字詞 -> 124 題
  const allChiItems = (ChiBank.IDIOMS || []).concat(ChiBank.WORDS || []);
  allChiItems.forEach(function(item, idx) {
    const uName = item.unitName || unitNameLookup[item.unitKey] || "中文";
    const opts1 = item.options || buildAutoOptions(item, allChiItems, idx + 1);
    const opts2 = item.options || buildAutoOptions(item, allChiItems, idx + 3);

    if (item.meaning) {
      ALL_QUESTIONS.push({
        id: item.id + "_m",
        baseId: item.id,
        subject: "chinese",
        subjectLabel: "中文・" + uName,
        unitKey: item.unitKey,
        unitName: uName,
        qCategory: "chi_meaning",
        type: "mcq",
        typeLabel: "字詞解釋",
        prompt: "【字詞解釋】「" + item.meaning + "」是哪一個詞語／成語的意思？",
        options: opts1,
        answer: item.word
      });
    }

    if (item.s1 || item.s2) {
      const firstSent = item.s1 || item.s2;
      ALL_QUESTIONS.push({
        id: item.id + "_f",
        baseId: item.id,
        subject: "chinese",
        subjectLabel: "中文・" + uName,
        unitKey: item.unitKey,
        unitName: uName,
        qCategory: "chi_fill",
        type: "mcq",
        typeLabel: "填充題",
        prompt: "【填充題】" + firstSent,
        s1: item.s1 || firstSent,
        s2: item.s2 || firstSent,
        options: opts2,
        answer: item.word
      });
    }
  });

  // (B) 英文科：46 Vocab -> 92 題
  const allEngItems = EngBank.VOCAB || [];
  allEngItems.forEach(function(item, idx) {
    const uName = item.unitName || unitNameLookup[item.unitKey] || "English";
    const blankPattern = formatEngBlankPattern(item.word);
    const fillOpts = (item.options && item.options.length >= 2) ? item.options : buildAutoOptions(item, allEngItems, idx + 2);

    ALL_QUESTIONS.push({
      id: item.id + "_s",
      baseId: item.id,
      subject: "english",
      subjectLabel: "英文・" + uName,
      unitKey: item.unitKey,
      unitName: uName,
      qCategory: "eng_spell",
      type: "eng_tile_spell",
      typeLabel: "字塊串字",
      prompt: "【英文串字】" + item.meaning + "\n字數提示：" + blankPattern,
      meaning: item.meaning,
      sentenceHint: item.sentence || "",
      blankPattern: blankPattern,
      answer: item.word
    });

    if (item.sentence) {
      ALL_QUESTIONS.push({
        id: item.id + "_f",
        baseId: item.id,
        subject: "english",
        subjectLabel: "英文・" + uName,
        unitKey: item.unitKey,
        unitName: uName,
        qCategory: "eng_fill",
        type: "mcq",
        typeLabel: "句子填充題",
        prompt: "【填充題】" + item.sentence + " (" + item.meaning + ")",
        options: fillOpts,
        answer: item.word
      });
    }
  });

  // (C) 人文科：4 課 -> 120 題
  (HumBank.QUESTIONS || []).forEach(function(q) {
    const uName = q.unitName || unitNameLookup[q.unitKey] || "人文科";
    const copy = Object.assign({}, q, {
      subject: "humanities",
      subjectLabel: uName,
      unitName: uName,
      qCategory: q.qCategory || "hum_mcq"
    });
    if (copy.blanks && !copy.answer) {
      copy.answer = copy.blanks.join("、");
    }
    ALL_QUESTIONS.push(copy);
  });

  // (D) 科學科：4 課 -> 120 題
  (SciBank.QUESTIONS || []).forEach(function(q) {
    const uName = q.unitName || unitNameLookup[q.unitKey] || "科學科";
    const copy = Object.assign({}, q, {
      subject: "science",
      subjectLabel: uName,
      unitName: uName,
      qCategory: q.qCategory || "sci_mcq"
    });
    if (copy.blanks && !copy.answer) {
      copy.answer = copy.blanks.join("、");
    }
    ALL_QUESTIONS.push(copy);
  });

  // 統計每課題目數量
  LESSON_CATALOG.forEach(function(les) {
    les.count = ALL_QUESTIONS.filter(function(q) { return q.unitKey === les.key; }).length;
  });

  function ensureQuizSettings(s) {
    if (!s.activeSubjects) {
      s.activeSubjects = { chinese: true, english: true, humanities: true, science: true };
    }
    if (!s.activeLessons) {
      s.activeLessons = {};
      LESSON_CATALOG.forEach(function(l) {
        s.activeLessons[l.key] = true;
      });
    } else {
      LESSON_CATALOG.forEach(function(l) {
        if (s.activeLessons[l.key] === undefined) {
          s.activeLessons[l.key] = true;
        }
      });
    }

    if (!s.lessonSelectMode) {
      s.lessonSelectMode = "multi"; // "single" 單選課次 | "multi" 多選課次
    }

    if (!s.activeQuizTypes) {
      s.activeQuizTypes = {};
      QUIZ_TYPE_CATALOG.forEach(function(t) { s.activeQuizTypes[t.key] = true; });
    } else {
      QUIZ_TYPE_CATALOG.forEach(function(t) {
        if (s.activeQuizTypes[t.key] === undefined) s.activeQuizTypes[t.key] = true;
      });
    }
  }

  let recentIds = [];

  const QuizBridge = {
    LESSON_CATALOG: LESSON_CATALOG,
    QUIZ_TYPE_CATALOG: QUIZ_TYPE_CATALOG,
    DIAGRAMS: ALL_DIAGRAMS,
    formatEngBlankPattern: formatEngBlankPattern,
    ensureQuizSettings: ensureQuizSettings,

    getDiagram: function(svgKey) {
      return ALL_DIAGRAMS[svgKey] || "";
    },

    getAllQuestions: function() {
      return ALL_QUESTIONS;
    },

    pickQuestion: function(opts) {
      opts = opts || {};
      const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
      ensureQuizSettings(s);

      if (opts.forceId) {
        const forced = ALL_QUESTIONS.find(function(q) { return q.id === opts.forceId || q.baseId === opts.forceId; });
        if (forced) return this.prepareQuestionInstance(forced);
      }

      let pool = ALL_QUESTIONS.filter(function(q) {
        if (s.activeSubjects && s.activeSubjects[q.subject] === false) return false;
        if (s.activeLessons && !s.activeLessons[q.unitKey]) return false;
        if (s.activeQuizTypes && s.activeQuizTypes[q.qCategory] === false) return false;
        return true;
      });

      if (pool.length === 0) {
        pool = ALL_QUESTIONS.filter(function(q) {
          return s.activeSubjects && s.activeSubjects[q.subject] !== false;
        });
        if (pool.length === 0) pool = ALL_QUESTIONS;
      }

      const freshPool = pool.filter(function(q) { return recentIds.indexOf(q.id) === -1; });
      const finalPool = freshPool.length > 0 ? freshPool : pool;

      const picked = finalPool[Math.floor(Math.random() * finalPool.length)];
      recentIds.push(picked.id);
      if (recentIds.length > Math.min(20, Math.floor(pool.length / 2))) {
        recentIds.shift();
      }

      return this.prepareQuestionInstance(picked);
    },

    prepareQuestionInstance: function(q) {
      const copy = Object.assign({}, q);
      if (copy.qCategory === "chi_fill" && copy.s1 && copy.s2) {
        const chosenSent = (Math.random() < 0.5) ? copy.s1 : copy.s2;
        copy.prompt = "【填充題】" + chosenSent;
      }
      if (copy.svgKey && ALL_DIAGRAMS[copy.svgKey]) {
        copy.svgDiagram = ALL_DIAGRAMS[copy.svgKey];
      }
      return copy;
    },

    recordAnswer: function(qId, isCorrect) {
      if (!window.Aetheria.State || !window.Aetheria.State.data) return;
      const s = window.Aetheria.State.data;
      if (!s.questionMastery) s.questionMastery = {};
      if (!Array.isArray(s.wrongBook)) s.wrongBook = [];

      if (!s.questionMastery[qId]) {
        s.questionMastery[qId] = { stars: 0, attempts: 0 };
      }
      s.questionMastery[qId].attempts++;

      if (isCorrect) {
        s.questionMastery[qId].stars = Math.min(3, (s.questionMastery[qId].stars || 0) + 1);
        s.streak = (s.streak || 0) + 1;
        if (s.streak > (s.maxStreak || 0)) s.maxStreak = s.streak;
        s.wrongBook = s.wrongBook.filter(function(id) { return id !== qId; });
      } else {
        s.streak = 0;
        if (s.wrongBook.indexOf(qId) === -1) {
          s.wrongBook.push(qId);
        }
      }
      window.Aetheria.State.save();
    }
  };

  window.Aetheria.QuizBridge = QuizBridge;
})();
a
