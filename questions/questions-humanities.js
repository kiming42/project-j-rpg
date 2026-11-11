/* ============================================================================
 * 人文科獨立題庫 (questions/questions-humanities.js)
 * 【日後新增/修改說明】：
 * 1. LESSONS 定義人文科課次／單元清單。
 * 2. QUESTIONS 支援兩種常用格式：
 *    - 四選一 / 填充題 (type: "mcq")：
 *      { id: "hum_01", unitKey: "hum_u1", type: "mcq", typeLabel: "人文填充", prompt: "題目內容", options: ["A","B","C","D"], answer: "正確答案" }
 *    - 左右配對題 (type: "matching")：
 *      { id: "hum_02", unitKey: "hum_u1", type: "matching", typeLabel: "概念配對", prompt: "請配對以下項目：", pairs: [ {left:"左1", right:"右1"}, {left:"左2", right:"右2"} ] }
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.QuestionBank = window.Aetheria.QuestionBank || {};

window.Aetheria.QuestionBank.Humanities = {
  // 1. 人文科課次清單 (日後可隨時在此新增第 2、3、4 課)
  LESSONS: [
    { key: "hum_u1", name: "人文・第一單元" }
  ],

  // 2. 人文科題目列表 (日後直接在此陣列增減題目即可)
  QUESTIONS: [
    {
      id: "hum_01", unitKey: "hum_u1", type: "mcq", typeLabel: "地理與環境",
      prompt: "【人文科】香港地勢山多平地少，最高峰是海拔 957 米的哪一座山？",
      options: ["大帽山", "鳳凰山", "太平山", "獅子山"],
      answer: "大帽山"
    },
    {
      id: "hum_02", unitKey: "hum_u1", type: "mcq", typeLabel: "歷史與文化",
      prompt: "【人文科】中國四大發明中，哪一項發明促進了遠洋航海與方向辨識的發展？",
      options: ["指南針", "造紙術", "活字印刷術", "火藥"],
      answer: "指南針"
    },
    {
      id: "hum_03", unitKey: "hum_u1", type: "matching", typeLabel: "基建與分區配對",
      prompt: "【人文配對】請將香港的重要地標與所在區域正確配對：",
      pairs: [
        { left: "香港國際機場", right: "大嶼山赤鱲角" },
        { left: "金紫荊廣場",   right: "灣仔博覽道" },
        { left: "萬宜水庫",     right: "西貢郊野公園" }
      ]
    }
  ]
};
