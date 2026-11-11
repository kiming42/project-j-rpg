/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 四科獨立題庫總橋接器 (question-bridge.js - v6.3)
 * 功能：自動讀取 questions-chinese.js / questions-english.js / questions-humanities.js / questions-science.js
 *       並提供課次單選/多選篩選、字數空白位格式化與熟練度記錄。
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const Bank = window.Aetheria.QuestionBank || {};
  const ChiBank = Bank.Chinese || { LESSONS: [], IDIOMS: [], WORDS: [] };
  const EngBank = Bank.English || { LESSONS: [], VOCAB: [] };
  const HumBank = Bank.Humanities || { LESSONS: [], QUESTIONS: [] };
  const SciBank = Bank.Science || { LESSONS: [], QUESTIONS: [] };

  // 1. 自動匯總四科課次目錄 (LESSON_CATALOG)
  const LESSON_CATALOG = [];
  const unitNameLookup = {};

  function registerLessons(list, subjectKey) {
    (list || []).forEach(function(l) {
      unitNameLookup[l.key] = l.name;
      LESSON_CATALOG.push({
        key: l.key,
        subject: subjectKey,
        name: l.name
      });
    });
  }

  registerLessons(ChiBank.LESSONS, "chinese");
  registerLessons(EngBank.LESSONS, "english");
  registerLessons(HumBank.LESSONS, "humanities");
  registerLessons(SciBank.LESSONS, "science");

  // 2. 輔助函式：生成英文字數空白位，例如 "apple" -> "_____ (5)"、"by bus" -> "__ ___ (2, 3)"
  function formatEngBlankPattern(phrase) {
    const words = String(phrase || "").trim().split(/\s+/);
    const underscores = words.map(function(w) { return "_".repeat(w.length); }).join("   ");
    const counts = words.map(function(w) { return w.length; }).join(", ");
    return underscores + " (" + counts + ")";
  }

  // 3. 輔助函式：自動從同單元抽取 3 個不重複的干擾選項
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

  // 4. 自動編譯四科題庫
  const ALL_QUESTIONS = [];

  // (A) 編譯中文科 (成語 + 字詞 -> 自動生成【字詞解釋】與【例句填充題】)
  const allChiItems = (ChiBank.IDIOMS || []).concat(ChiBank.WORDS || []);
  allChiItems.forEach(function(item, idx) {
    const uName = item.unitName || unitNameLookup[item.unitKey] || "中文";
    const opts1 = item.options || buildAutoOptions(item, allChiItems, idx + 1);
    const opts2 = item.options || buildAutoOptions(item, allChiItems, idx + 3);

    // 題型 1：字詞解釋
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

    // 題型 2：填充題 (支援 s1 / s2 雙例句動態切換)
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
        typeLabel: "例句填充題",
        prompt: "【填充題】" + firstSent,
        s1: item.s1 || firstSent,
        s2: item.s2 || firstSent,
        options: opts2,
        answer: item.word
      });
    }
  });

  // (B) 編譯英文科 (VOCAB -> 自動生成【字數空白位+字塊串字】與【句子填充題】)
  const allEngItems = EngBank.VOCAB || [];
  allEngItems.forEach(function(item, idx) {
    const uName = item.unitName || unitNameLookup[item.unitKey] || "English";
    const blankPattern = formatEngBlankPattern(item.word);
    const fillOpts = (item.options && item.options.length >= 2) ? item.options : buildAutoOptions(item, allEngItems, idx + 2);

    // 題型 1：英文串字 (字數空白位 + 字塊)
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
      prompt: "【英文串字】" + item.meaning + "   " + blankPattern,
      meaning: item.meaning,
      sentenceHint: item.sentence || "",
      blankPattern: blankPattern,
      answer: item.word
    });

    // 題型 2：英文句子填充題
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

  // (C) 編譯人文科
  (HumBank.QUESTIONS || []).forEach(function(q) {
    const uName = q.unitName || unitNameLookup[q.unitKey] || "人文科";
    ALL_QUESTIONS.push(Object.assign({}, q, {
      subject: "humanities",
      subjectLabel: uName,
      unitName: uName,
      qCategory: q.qCategory || "hum_general"
    }));
  });

  // (D) 編譯科學科
  (SciBank.QUESTIONS || []).forEach(function(q) {
    const uName = q.unitName || unitNameLookup[q.unitKey] || "科學科";
    ALL_QUESTIONS.push(Object.assign({}, q, {
      subject: "science",
      subjectLabel: uName,
      unitName: uName,
      qCategory: q.qCategory || "sci_general"
    }));
  });

  // 統計每課題目數量，方便星象調頻顯示
  LESSON_CATALOG.forEach(function(les) {
    les.count = ALL_QUESTIONS.filter(function(q) { return q.unitKey === les.key; }).length;
  });

  function ensureQuizSettings(s) {
    if (!s.activeLessons) {
      s.activeLessons = {};
      LESSON_CATALOG.forEach(function(l) {
        // 預設啟用中文科與英文科所有課次
        s.activeLessons[l.key] = (l.subject === "chinese" || l.subject === "english");
      });
    } else {
      // 確保新加入的中文/英文課次預設啟用
      LESSON_CATALOG.forEach(function(l) {
        if (s.activeLessons[l.key] === undefined) {
          s.activeLessons[l.key] = (l.subject === "chinese" || l.subject === "english");
        }
      });
    }

    if (!s.lessonSelectMode) {
      s.lessonSelectMode = "multi"; // "single" 單選課次 | "multi" 多選課次
    }

    if (!s.activeQuizTypes) {
      s.activeQuizTypes = {
        chi_meaning: true,
        chi_fill: true,
        eng_spell: true,
        eng_fill: true,
        hum_general: true,
        sci_general: true
      };
    }
  }

  let recentIds = [];

  const QuizBridge = {
    LESSON_CATALOG: LESSON_CATALOG,
    formatEngBlankPattern: formatEngBlankPattern,
    ensureQuizSettings: ensureQuizSettings,

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
          return q.subject === "chinese" || q.subject === "english";
        });
        if (pool.length === 0) pool = ALL_QUESTIONS;
      }

      const freshPool = pool.filter(function(q) { return recentIds.indexOf(q.id) === -1; });
      const finalPool = freshPool.length > 0 ? freshPool : pool;

      const picked = finalPool[Math.floor(Math.random() * finalPool.length)];
      recentIds.push(picked.id);
      if (recentIds.length > Math.min(14, Math.floor(pool.length / 2))) {
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
