/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 四科 7 大題型轉接器與 SRS 錯題權重系統 (question-bridge.js)
 * 支援：1.中文字詞四選一 2.中文例句候選字拼字 3.英文全盲像素鍵盤串字 4.英文例句四選一
 *       5.人科選擇題 6.人科簡答拼字 7.看圖填充(實驗/地形圖) 8.左右多重配對 9.情境推理題
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  // 內建四科 7~9 大題型豐富題庫 (確保開箱即玩，後期可無縫併入 300 題外部 .js)
  const BUILTIN_QUESTIONS = [
    // ==================== 1. 中文科 (龍語古卷) ====================
    {
      id: "cn_01", subject: "chinese", subjectLabel: "中文・龍語古卷",
      type: "mcq", typeLabel: "字詞解釋（四選一）",
      prompt: "【詞語解釋】：形容人遇到緊急或危險的情況時，態度鎮定，一點也不慌張。",
      options: ["從容不迫", "手忙腳亂", "驚弓之鳥", "水洩不通"],
      answer: "從容不迫"
    },
    {
      id: "cn_02", subject: "chinese", subjectLabel: "中文・龍語古卷",
      type: "mcq", typeLabel: "字詞解釋（四選一）",
      prompt: "【詞語解釋】：比喻事後才採取補救措施，但還不算太遲，能防止繼續受損。",
      options: ["亡羊補牢", "守株待兔", "掩耳盜鈴", "畫蛇添足"],
      answer: "亡羊補牢"
    },
    {
      id: "cn_03", subject: "chinese", subjectLabel: "中文・龍語古卷",
      type: "mcq", typeLabel: "字詞解釋（四選一）",
      prompt: "【詞語解釋】：形容自然環境條件非常優越，或個人得到的天賦與機遇極佳。",
      options: ["得天獨厚", "土生土長", "相映成趣", "百聞不如一見"],
      answer: "得天獨厚"
    },
    {
      id: "cn_04", subject: "chinese", subjectLabel: "中文・龍語古卷",
      type: "tile_spell", typeLabel: "例句填充（符文拼字）",
      prompt: "這座博物館的設計規模宏大，設備非常 [___] [___]，吸引大批市民參觀。",
      answerChars: ["完", "善"],
      candidates: ["善", "美", "完", "全", "好", "備"]
    },
    {
      id: "cn_05", subject: "chinese", subjectLabel: "中文・龍語古卷",
      type: "tile_spell", typeLabel: "例句填充（符文拼字）",
      prompt: "枯葉蝶停在乾枯的樹枝上進行 [___] [___]，成功避開了天敵的捕獵。",
      answerChars: ["偽", "裝"],
      candidates: ["裝", "假", "偽", "藏", "飾", "變"]
    },
    {
      id: "cn_06", subject: "chinese", subjectLabel: "中文・龍語古卷",
      type: "tile_spell", typeLabel: "例句填充（符文拼字）",
      prompt: "節日巡遊開始了，街道上 [___] [___] [___] [___]，到處都擠滿了熱情的觀眾。",
      answerChars: ["人", "聲", "鼎", "沸"],
      candidates: ["沸", "人", "鼎", "水", "聲", "山", "海"]
    },

    // ==================== 2. 英文科 (阿爾比恩符文) ====================
    {
      id: "en_01", subject: "english", subjectLabel: "英文・阿爾比恩",
      type: "blind_spell", typeLabel: "全盲串字 ⚠️（真名解放 100%暴擊）",
      prompt: "請拼出英文單字：【冒險 / 奇遇 (名詞)】",
      answer: "adventure",
      hint: "a _ _ _ _ _ _ _ e (共 9 個字母)"
    },
    {
      id: "en_02", subject: "english", subjectLabel: "英文・阿爾比恩",
      type: "blind_spell", typeLabel: "全盲串字 ⚠️（真名解放 100%暴擊）",
      prompt: "請拼出英文單字：【寶藏 / 金銀財寶 (名詞)】",
      answer: "treasure",
      hint: "t _ _ _ _ _ _ e (共 8 個字母)"
    },
    {
      id: "en_03", subject: "english", subjectLabel: "英文・阿爾比恩",
      type: "blind_spell", typeLabel: "全盲串字 ⚠️（真名解放 100%暴擊）",
      prompt: "請拼出英文單字：【山脈 / 高山 (名詞)】",
      answer: "mountain",
      hint: "m _ _ _ _ _ _ n (共 8 個字母)"
    },
    {
      id: "en_04", subject: "english", subjectLabel: "英文・阿爾比恩",
      type: "mcq", typeLabel: "英文例句（四選一）",
      prompt: "Justin _______ exploring the ancient cave when he discovered a glowing crystal.",
      options: ["was", "were", "is", "are"],
      answer: "was"
    },
    {
      id: "en_05", subject: "english", subjectLabel: "英文・阿爾比恩",
      type: "mcq", typeLabel: "英文例句（四選一）",
      prompt: "This legendary sword is _______ than the old iron dagger.",
      options: ["sharper", "sharp", "sharpest", "more sharp"],
      answer: "sharper"
    },

    // ==================== 3. 科學科 (煉金真理) ====================
    {
      id: "sci_01", subject: "science", subjectLabel: "科學・煉金真理",
      type: "image_spell", typeLabel: "看圖填充 🖼️（弱點看破）",
      prompt: "觀察上方植物葉片進行「光合作用」的結構圖，箭頭 A 由葉片釋放到空氣中的是什麼氣體？",
      svgDiagram: `<svg viewBox="0 0 220 90" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="90" fill="#102a20" rx="6"/>
        <circle cx="38" cy="24" r="13" fill="#ffd166"/>
        <line x1="53" y1="30" x2="92" y2="46" stroke="#ffd166" stroke-width="2" stroke-dasharray="3"/>
        <ellipse cx="132" cy="52" rx="44" ry="22" fill="#2d6a4f" stroke="#52b788" stroke-width="3"/>
        <text x="112" y="56" fill="#fff" font-size="11" font-weight="bold">綠葉</text>
        <path d="M 155 36 L 195 20" stroke="#4cc9f0" stroke-width="3"/>
        <text x="145" y="18" fill="#4cc9f0" font-size="11" font-weight="bold">釋放箭頭 A (?)</text>
      </svg>`,
      answerChars: ["氧", "氣"],
      candidates: ["氣", "碳", "氧", "水", "氮"]
    },
    {
      id: "sci_02", subject: "science", subjectLabel: "科學・煉金真理",
      type: "image_mcq", typeLabel: "情境推理題 🖼️",
      prompt: "【科學實驗情境】：把一塊密封在量杯內的冰塊放在室溫下完全融化成水，它的「質量（重量）」會怎樣變化？",
      svgDiagram: `<svg viewBox="0 0 220 85" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="85" fill="#1d3557" rx="6"/>
        <rect x="35" y="22" width="40" height="45" fill="none" stroke="#fff" stroke-width="2"/>
        <rect x="42" y="35" width="26" height="26" fill="#a8dadc"/>
        <text x="86" y="50" fill="#ffd166" font-size="14" font-weight="bold">➔ 融化 ➔</text>
        <rect x="150" y="22" width="40" height="45" fill="none" stroke="#fff" stroke-width="2"/>
        <rect x="152" y="45" width="36" height="20" fill="#4cc9f0"/>
      </svg>`,
      options: ["保持不變", "變得更重", "變得更輕", "完全消失"],
      answer: "保持不變"
    },
    {
      id: "sci_03", subject: "science", subjectLabel: "科學・煉金真理",
      type: "tile_spell", typeLabel: "簡答題（候選字拼字）",
      prompt: "海水受太陽光照射後受熱變成水蒸氣升上天空的過程，稱為什麼現象？",
      answerChars: ["蒸", "發"],
      candidates: ["發", "凝", "蒸", "結", "融", "化"]
    },
    {
      id: "sci_04", subject: "science", subjectLabel: "科學・煉金真理",
      type: "mcq", typeLabel: "科學選擇題（四選一）",
      prompt: "氣象站用來準確測量「風向」的儀器叫作什麼？",
      options: ["風向標", "風速計", "雨量計", "百葉箱"],
      answer: "風向標"
    },

    // ==================== 4. 人文科 (歷史紀元) ====================
    {
      id: "hum_01", subject: "humanities", subjectLabel: "人文・歷史紀元",
      type: "matching", typeLabel: "多重配對（元素共鳴陣）",
      prompt: "請將左列的「自然地貌與觀察工具」與右列的「正確特徵」連線配對：",
      pairs: [
        { left: "等高線越密集", right: "代表山坡越陡峭" },
        { left: "等高線越稀疏", right: "代表山坡越平緩" },
        { left: "指南針紅色指針", right: "永遠指向北方" }
      ]
    },
    {
      id: "hum_02", subject: "humanities", subjectLabel: "人文・歷史紀元",
      type: "matching", typeLabel: "多重配對（元素共鳴陣）",
      prompt: "請將左列的「香港法定古蹟」與右列的「所屬地區」正確連線配對：",
      pairs: [
        { left: "大館 (舊中區警署)", right: "中環" },
        { left: "宋王臺公園", right: "九龍城" },
        { left: "聚星樓", right: "元朗屏山" }
      ]
    },
    {
      id: "hum_03", subject: "humanities", subjectLabel: "人文・歷史紀元",
      type: "mcq", typeLabel: "人文選擇題（四選一）",
      prompt: "步入青春期時，當面對身體變化或學業壓力感到焦慮，下列哪一種是積極健康的處理方法？",
      options: ["與父母師長傾訴並做適量運動", "把自己關起來不跟任何人說話", "通宵打機逃避問題", "向同學發脾氣"],
      answer: "與父母師長傾訴並做適量運動"
    },
    {
      id: "hum_04", subject: "humanities", subjectLabel: "人文・歷史紀元",
      type: "image_spell", typeLabel: "看圖填充 🖼️（地形圖解讀）",
      prompt: "觀察上方海岸地貌圖，海浪長期拍打岩石底部所形成的天然洞穴，稱為什麼洞？",
      svgDiagram: `<svg viewBox="0 0 220 85" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="85" fill="#1d3557" rx="6"/>
        <path d="M 120 10 L 210 10 L 210 75 L 120 75 L 120 55 Q 155 45 120 35 Z" fill="#8d99ae" stroke="#1c1619" stroke-width="2"/>
        <ellipse cx="132" cy="46" rx="16" ry="12" fill="#141013"/>
        <rect x="10" y="52" width="125" height="24" fill="#3898ff"/>
        <text x="20" y="42" fill="#ffd166" font-size="11" font-weight="bold">海浪拍打 ➔ 形成 (?) 洞</text>
      </svg>`,
      answerChars: ["海", "蝕"],
      candidates: ["蝕", "風", "海", "浪", "山", "水"]
    }
  ];

  const Bridge = {
    questions: [...BUILTIN_QUESTIONS],

    // 供後期掛載外部 300 題 .js 題庫檔使用 (自動轉換並合入總題庫)
    registerExternalBank(externalArray) {
      if (!Array.isArray(externalArray)) return;
      externalArray.forEach(q => {
        if (q && q.id && !this.questions.some(exist => exist.id === q.id)) {
          this.questions.push(q);
        }
      });
    },

    // 智慧抽題演算法 (依據營地星象儀勾選科目 + 錯題優先權重 SRS)
    pickQuestion(options = {}) {
      const state = window.Aetheria.State.data;
      const activeSubj = state.activeSubjects || { chinese: true, english: true, humanities: true, science: true };

      if (options.forceId) {
        const found = this.questions.find(q => q.id === options.forceId);
        if (found) return found;
      }

      if (options.forceType) {
        const byType = this.questions.filter(q => q.type === options.forceType);
        if (byType.length > 0) return byType[Math.floor(Math.random() * byType.length)];
      }

      // 依星象儀科目過濾
      let pool = this.questions.filter(q => activeSubj[q.subject]);
      if (pool.length === 0) pool = this.questions;

      // 若為高壓 Boost 或 Boss 戰，提高進階題型 (拼字/盲串/看圖/配對) 比重
      if (options.preferAdvanced) {
        const advPool = pool.filter(q => q.type !== "mcq");
        if (advPool.length > 0 && Math.random() < 0.7) pool = advPool;
      }

      // SRS 錯題優先抽中權重 (45% 機率優先複習錯題魔導書內的題目)
      const wrongPool = pool.filter(q => state.wrongBook && state.wrongBook.includes(q.id));
      if (wrongPool.length > 0 && Math.random() < 0.45) {
        return wrongPool[Math.floor(Math.random() * wrongPool.length)];
      }

      return pool[Math.floor(Math.random() * pool.length)];
    },

    // 記錄答題結果與更新熟練度星級 (★0 ~ ★5)
    recordAnswer(qId, isCorrect) {
      const state = window.Aetheria.State.data;
      if (!state.questionMastery[qId]) {
        state.questionMastery[qId] = { stars: 0, wrongCount: 0 };
      }
      const rec = state.questionMastery[qId];

      if (isCorrect) {
        rec.stars = Math.min(5, rec.stars + 1);
        state.streak = (state.streak || 0) + 1;
        state.maxStreak = Math.max(state.maxStreak || 0, state.streak);
        // 若該題在錯題魔導書中且成功答對，可將其淨化移除
        const idx = state.wrongBook.indexOf(qId);
        if (idx !== -1) state.wrongBook.splice(idx, 1);
      } else {
        rec.stars = Math.max(0, rec.stars - 1);
        rec.wrongCount++;
        state.streak = 0;
        if (!state.wrongBook.includes(qId)) {
          state.wrongBook.push(qId);
        }
      }
      window.Aetheria.State.save();
    },

    getAllQuestions() {
      return this.questions;
    }
  };

  window.Aetheria.QuizBridge = Bridge;
})();