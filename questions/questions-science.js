/* ============================================================================
 * 科學科獨立題庫 (questions/questions-science.js)
 * 【日後新增/修改說明】：
 * 1. LESSONS 定義科學科課次／單元清單。
 * 2. QUESTIONS 支援格式：
 *    - 四選一 / 推理填充題 (type: "mcq")：
 *      { id: "sci_01", unitKey: "sci_u1", type: "mcq", typeLabel: "科學探究", prompt: "題目內容", options: ["A","B","C","D"], answer: "正確答案" }
 *    - 拼字填充題 (type: "tile_spell")：
 *      { id: "sci_02", unitKey: "sci_u1", type: "tile_spell", typeLabel: "科學填充", prompt: "題目內容", answer: "正確詞語", bank: ["正","確","詞","語","干","擾"] }
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.QuestionBank = window.Aetheria.QuestionBank || {};

window.Aetheria.QuestionBank.Science = {
  // 1. 科學科課次清單 (日後可隨時在此新增課次)
  LESSONS: [
    { key: "sci_u1", name: "科學・第一單元" }
  ],

  // 2. 科學科題目列表 (日後直接在此陣列增減題目即可)
  QUESTIONS: [
    {
      id: "sci_01", unitKey: "sci_u1", type: "mcq", typeLabel: "物態變化",
      prompt: "【科學科】當水由液態受熱變成水蒸氣（氣態）散發到空氣中，這個過程稱為什麼？",
      options: ["蒸發", "凝結", "凝固", "熔化"],
      answer: "蒸發"
    },
    {
      id: "sci_02", unitKey: "sci_u1", type: "mcq", typeLabel: "光學現象",
      prompt: "【科學科】陽光穿過空氣中的小水滴時發生折射與色散，會在天空形成什麼自然現象？",
      options: ["彩虹", "海市蜃樓", "日食", "月食"],
      answer: "彩虹"
    },
    {
      id: "sci_03", unitKey: "sci_u1", type: "mcq", typeLabel: "生物適應",
      prompt: "【科學科】石頭魚的外表與海底礁石極為相似，這種保護自己及捕獵的本領稱為什麼？",
      options: ["偽裝（保護色）", "冬眠", "遷徙", "光合作用"],
      answer: "偽裝（保護色）"
    }
  ]
};
