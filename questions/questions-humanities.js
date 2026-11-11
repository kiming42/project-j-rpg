/* ============================================================================
 * 人文科獨立題庫 (questions/questions-humanities.js - v6.4)
 * 完整收錄：U1 適應青春期 (30題)、U2 與異性相處 (30題)、U8 人民生活 (30題)、U9 文化遺產 (30題)，合共 120 題。
 * 題型涵蓋：填充題、分類題(分類籃)、簡答題、看圖填充題(附教科書有機向量插畫)、選擇題(單選/多選)、問答題(情境題)。
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.QuestionBank = window.Aetheria.QuestionBank || {};

(function() {
  // 教科書風格柔和漸層與有機曲線向量插畫庫 (無 Emoji、無生硬方塊積木)
  const HUM_DIAGRAMS = {
    // U1 #19：男孩照鏡摸下巴疑惑為何未長出鬍鬚與喉結
    hum_u1_mirror_boy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <defs>
        <radialGradient id="bgGlow1" cx="50%" cy="50%" r="55%"><stop offset="0%" stop-color="#e3f2fd"/><stop offset="100%" stop-color="#bbdefb"/></radialGradient>
        <linearGradient id="mirrorGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#e1f5fe"/><stop offset="100%" stop-color="#b3e5fc"/></linearGradient>
      </defs>
      <rect width="280" height="150" rx="12" fill="url(#bgGlow1)"/>
      <path d="M25,18 C25,12 115,12 115,18 L115,132 C115,138 25,138 25,132 Z" fill="url(#mirrorGlass)" stroke="#5c6bc0" stroke-width="4"/>
      <path d="M35,30 L55,22 M35,42 L70,26" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
      <!-- 男孩有機輪廓 (側臉看鏡子並摸下巴) -->
      <path d="M155,48 C155,28 195,26 202,46 C206,58 202,76 190,84 C184,88 182,95 184,102 L212,115 C220,120 222,135 222,145 L142,145 C142,130 148,118 162,112 L166,95 C156,90 152,78 154,66 C148,64 148,54 155,48 Z" fill="#ffccbc" stroke="#8d6e63" stroke-width="2"/>
      <path d="M153,48 C150,32 176,22 196,30 C206,34 208,46 202,52 C194,42 172,40 158,52 Z" fill="#4e342e"/>
      <!-- 手指摸下巴與頸部喉結位置 -->
      <path d="M135,125 C138,105 148,92 160,86 C165,84 168,88 164,93 C156,100 152,115 150,130" fill="#ffccbc" stroke="#8d6e63" stroke-width="2"/>
      <!-- 綠色指引線與教科書標籤 -->
      <line x1="164" y1="86" x2="118" y2="75" stroke="#66bb6a" stroke-width="2"/>
      <line x1="168" y1="98" x2="118" y2="105" stroke="#66bb6a" stroke-width="2"/>
      <rect x="34" y="62" width="76" height="22" rx="6" fill="#ffffff" stroke="#66bb6a" stroke-width="1.5"/>
      <text x="72" y="77" font-size="11" font-weight="bold" fill="#2e7d32" text-anchor="middle">未長出鬍鬚？</text>
      <rect x="34" y="94" width="76" height="22" rx="6" fill="#ffffff" stroke="#66bb6a" stroke-width="1.5"/>
      <text x="72" y="109" font-size="11" font-weight="bold" fill="#2e7d32" text-anchor="middle">未出現喉結？</text>
    </svg>`,

    // U1 #20：女孩在洗臉盆前用溫水與溫和洗面膏抹臉
    hum_u1_wash_face: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <defs>
        <radialGradient id="bgWash" cx="50%" cy="50%" r="55%"><stop offset="0%" stop-color="#e0f7fa"/><stop offset="100%" stop-color="#80deea"/></radialGradient>
      </defs>
      <rect width="280" height="150" rx="12" fill="url(#bgWash)"/>
      <!-- 洗臉盆與水龍頭有機曲線 -->
      <path d="M30,112 C30,136 160,136 160,112 L170,104 L20,104 Z" fill="#ffffff" stroke="#78909c" stroke-width="2.5"/>
      <path d="M90,104 L90,82 C90,72 106,72 106,82" fill="none" stroke="#90a4ae" stroke-width="4" stroke-linecap="round"/>
      <path d="M106,84 C104,92 100,98 96,104 M110,86 C112,94 114,99 115,104" stroke="#29b6f6" stroke-width="2" stroke-dasharray="3,2"/>
      <!-- 女孩俯身以柔軟毛巾潔面 -->
      <path d="M115,44 C115,24 155,24 160,44 C164,60 154,78 138,80 C122,78 112,60 115,44 Z" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2"/>
      <path d="M112,44 C114,22 162,20 166,46 C172,54 176,68 170,74 C164,60 158,42 136,38 C122,38 116,46 112,44 Z" fill="#3e2723"/>
      <path d="M112,62 C118,56 142,56 148,62 L144,82 C136,86 122,86 116,82 Z" fill="#fff9c4" stroke="#fbc02d" stroke-width="2"/>
      <!-- 溫和洗面用品瓶 -->
      <path d="M205,62 C205,56 235,56 235,62 L230,112 C230,118 210,118 210,112 Z" fill="#c8e6c9" stroke="#388e3c" stroke-width="2"/>
      <path d="M214,112 L226,112 L226,120 L214,120 Z" fill="#388e3c"/>
      <text x="220" y="90" font-size="10" font-weight="bold" fill="#1b5e20" text-anchor="middle">溫和潔面</text>
      <line x1="132" y1="72" x2="72" y2="52" stroke="#66bb6a" stroke-width="2"/>
      <rect x="16" y="34" width="84" height="22" rx="6" fill="#ffffff" stroke="#66bb6a" stroke-width="1.5"/>
      <text x="58" y="49" font-size="11" font-weight="bold" fill="#2e7d32" text-anchor="middle">溫水勤洗面</text>
    </svg>`,

    // U1 #21：女孩站在鏡前試戴不同髮夾（注重自我形象）
    hum_u1_hairpin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#fce4ec"/>
      <path d="M30,20 C30,14 110,14 110,20 L110,134 L30,134 Z" fill="#e1f5fe" stroke="#ec407a" stroke-width="3.5"/>
      <!-- 女孩輪廓與秀髮 -->
      <path d="M148,54 C148,32 188,32 192,54 C195,72 184,88 170,90 C156,88 145,72 148,54 Z" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2"/>
      <path d="M142,58 C138,26 198,26 198,58 C202,78 205,98 195,108 C190,90 190,62 184,48 C170,42 156,44 148,54 C144,72 144,94 138,106 C134,94 138,74 142,58 Z" fill="#4e342e"/>
      <!-- 蝴蝶結與星形髮夾 -->
      <path d="M176,38 C182,32 190,34 188,42 C194,40 196,48 188,50 C182,48 178,44 176,38 Z" fill="#ff4081" stroke="#880e4f" stroke-width="1.5"/>
      <!-- 思考雲朵 -->
      <path d="M198,24 C204,14 262,14 268,26 C274,38 264,54 248,52 L212,52 C198,52 192,36 198,24 Z" fill="#ffffff" stroke="#ec407a" stroke-width="1.5"/>
      <text x="233" y="36" font-size="10" font-weight="bold" fill="#ad1457" text-anchor="middle">哪個髮夾</text>
      <text x="233" y="48" font-size="10" font-weight="bold" fill="#ad1457" text-anchor="middle">適合我？</text>
    </svg>`,

    // U1 #22：女孩在房間寫日記，請門外媽媽不要進來（重視私隱與個人空間）
    hum_u1_diary_privacy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#fff3e0"/>
      <!-- 房門與門縫 -->
      <path d="M28,14 L92,14 L92,138 L28,138 Z" fill="#d7ccc8" stroke="#5d4037" stroke-width="3"/>
      <path d="M82,76 C86,76 86,82 82,82 C78,82 78,76 82,76 Z" fill="#ffb300"/>
      <!-- 書桌與攤開的日記本 -->
      <path d="M125,98 L255,98 L265,112 L115,112 Z" fill="#bcaaa4" stroke="#4e342e" stroke-width="2"/>
      <path d="M150,84 L185,80 L215,84 L210,102 L180,98 L146,102 Z" fill="#ffffff" stroke="#1e88e5" stroke-width="2"/>
      <path d="M183,81 L180,98 M156,88 L175,86 M154,94 L173,92 M190,86 L208,88" stroke="#90caf9" stroke-width="1.5"/>
      <!-- 對話框 -->
      <path d="M108,22 C108,14 262,14 262,22 L262,52 C262,60 108,60 108,52 Z" fill="#ffffff" stroke="#fb8c00" stroke-width="2"/>
      <text x="185" y="36" font-size="11" font-weight="bold" fill="#e65100" text-anchor="middle">「媽媽，我在寫日記，</text>
      <text x="185" y="50" font-size="11" font-weight="bold" fill="#e65100" text-anchor="middle">請不要進來！」</text>
    </svg>`,

    // U1 #23：父母邀請看電影，男孩揮手說已約同學（減少依賴家人）
    hum_u1_less_depend: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#e8f5e9"/>
      <!-- 父母手持兩張電影票 -->
      <path d="M35,62 C35,44 65,44 65,62 L72,135 L28,135 Z" fill="#90caf9" stroke="#1565c0" stroke-width="2"/>
      <path d="M76,72 L106,66 L110,84 L80,90 Z" fill="#fff59d" stroke="#fbc02d" stroke-width="1.5"/>
      <text x="93" y="81" font-size="9" font-weight="bold" fill="#f57f17" text-anchor="middle">電影票</text>
      <!-- 男孩背背包揮手往外走 -->
      <path d="M185,56 C185,38 215,38 215,56 L225,135 L175,135 Z" fill="#ffcc80" stroke="#ef6c00" stroke-width="2"/>
      <path d="M122,20 C122,12 268,12 268,20 L268,48 C268,56 122,56 122,48 Z" fill="#ffffff" stroke="#43a047" stroke-width="2"/>
      <text x="195" y="38" font-size="11" font-weight="bold" fill="#1b5e20" text-anchor="middle">「不用了，我已約同學去看。」</text>
    </svg>`,

    // U2 #18：男孩哭泣被取笑懦弱（性別角色定型）
    hum_u2_stereotype_cry: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#ede7f6"/>
      <!-- 擦眼淚的男孩 -->
      <path d="M55,58 C55,38 88,38 88,58 C88,74 55,74 55,58 Z" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2"/>
      <path d="M64,60 C62,68 60,74 58,78 M79,60 C81,68 83,74 85,78" stroke="#29b6f6" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M50,82 L94,82 L100,136 L44,136 Z" fill="#81d4fa" stroke="#0277bd" stroke-width="2"/>
      <!-- 旁邊指指點點的對話 -->
      <path d="M118,26 C118,16 266,16 266,26 L266,64 C266,74 118,74 118,64 Z" fill="#ffffff" stroke="#7e57c2" stroke-width="2"/>
      <text x="192" y="44" font-size="11" font-weight="bold" fill="#4527a0" text-anchor="middle">「男孩子竟然會哭，</text>
      <text x="192" y="60" font-size="11" font-weight="bold" fill="#4527a0" text-anchor="middle">真懦弱呢！」</text>
    </svg>`,

    // U2 #19：男女同學一起看毛筆書法比賽海報（尋找相似之處）
    hum_u2_calligraphy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#fff8e1"/>
      <!-- 書法海報與毛筆曲線 -->
      <path d="M95,16 L185,16 L185,112 L95,112 Z" fill="#fffde7" stroke="#8d6e63" stroke-width="3"/>
      <text x="140" y="38" font-size="12" font-weight="bold" fill="#4e342e" text-anchor="middle">毛筆書法比賽</text>
      <path d="M130,52 L152,48 L142,82 C138,92 128,96 122,90 C128,84 134,70 130,52 Z" fill="#3e2723"/>
      <!-- 左右男女同學微笑指向海報 -->
      <path d="M35,68 C35,50 65,50 65,68 L72,138 L28,138 Z" fill="#64b5f6" stroke="#1565c0" stroke-width="2"/>
      <path d="M215,68 C215,50 245,50 245,68 L252,138 L208,138 Z" fill="#f48fb1" stroke="#ad1457" stroke-width="2"/>
      <rect x="55" y="118" width="170" height="22" rx="6" fill="#ffffff" stroke="#ffa000" stroke-width="1.5"/>
      <text x="140" y="133" font-size="11" font-weight="bold" fill="#e65100" text-anchor="middle">共同興趣：一起參加書法比賽</text>
    </svg>`,

    // U2 #20：女同學拿着課本大方請教男同學
    hum_u2_study_ask: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#e0f2f1"/>
      <!-- 攤開的課本 -->
      <path d="M105,78 L140,72 L175,78 L175,112 L140,106 L105,112 Z" fill="#ffffff" stroke="#00897b" stroke-width="2.5"/>
      <path d="M140,72 L140,106" stroke="#00897b" stroke-width="2"/>
      <!-- 左右同學自然交流 -->
      <path d="M48,60 C48,42 78,42 78,60 L86,136 L40,136 Z" fill="#f48fb1" stroke="#ad1457" stroke-width="2"/>
      <path d="M202,60 C202,42 232,42 232,60 L240,136 L194,136 Z" fill="#64b5f6" stroke="#1565c0" stroke-width="2"/>
      <path d="M35,16 C35,10 245,10 245,16 L245,42 C245,48 35,48 35,42 Z" fill="#ffffff" stroke="#00897b" stroke-width="2"/>
      <text x="140" y="34" font-size="11" font-weight="bold" fill="#004d40" text-anchor="middle">「我不太明白這條題目，想向你請教。」</text>
    </svg>`,

    // U2 #21：女同學抓緊男同學手臂，令男同學尷尬流汗（保持身體界線）
    hum_u2_personal_space: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#ffebee"/>
      <!-- 兩個過於靠近的身影與抓緊的手臂 -->
      <path d="M75,62 C75,44 105,44 105,62 L112,138 L68,138 Z" fill="#f48fb1" stroke="#c2185b" stroke-width="2"/>
      <path d="M135,62 C135,44 165,44 165,62 L172,138 L128,138 Z" fill="#90caf9" stroke="#1565c0" stroke-width="2"/>
      <!-- 抓手臂特寫與紅色警示圈 -->
      <path d="M102,90 L138,90" stroke="#ffccbc" stroke-width="8" stroke-linecap="round"/>
      <path d="M122,76 C138,76 138,104 122,104 C106,104 106,76 122,76 Z" fill="none" stroke="#e53935" stroke-width="2.5" stroke-dasharray="4,2"/>
      <!-- 尷尬汗滴與心聲 -->
      <path d="M172,46 C170,54 176,58 178,52 Z" fill="#29b6f6"/>
      <rect x="145" y="14" width="125" height="36" rx="6" fill="#ffffff" stroke="#e53935" stroke-width="2"/>
      <text x="207" y="30" font-size="10" font-weight="bold" fill="#b71c1c" text-anchor="middle">抓着手臂令我很尷尬</text>
      <text x="207" y="44" font-size="10" font-weight="bold" fill="#b71c1c" text-anchor="middle">（應保持適當距離）</text>
    </svg>`,

    // U8 #19：中國西部草原羊群與圓頂蒙古包
    hum_u8_yurt_grassland: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <defs>
        <linearGradient id="skyGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#81d4fa"/><stop offset="55%" stop-color="#e1f5fe"/><stop offset="56%" stop-color="#aed581"/><stop offset="100%" stop-color="#7cb342"/></linearGradient>
      </defs>
      <rect width="280" height="150" rx="12" fill="url(#skyGrass)"/>
      <!-- 遠山曲線 -->
      <path d="M0,84 Q45,52 95,84 T195,80 T280,84 Z" fill="#90a4ae" opacity="0.5"/>
      <!-- 蒙古包有機圓頂與菱形格紋編織門 -->
      <path d="M135,68 C135,42 235,42 235,68 L235,112 C235,118 135,118 135,112 Z" fill="#fffde7" stroke="#8d6e63" stroke-width="2.5"/>
      <path d="M135,68 L235,68 M135,74 L235,74" stroke="#d84315" stroke-width="3"/>
      <path d="M172,46 L198,46 L205,54 L165,54 Z" fill="#ff8f00" stroke="#5d4037" stroke-width="1.5"/>
      <path d="M174,80 L196,80 L196,115 L174,115 Z" fill="#bcaaa4" stroke="#5d4037" stroke-width="2"/>
      <!-- 草原綿羊群雲朵狀有機輪廓 -->
      <path d="M35,106 C32,98 42,92 50,96 C56,92 66,96 64,104 C70,108 64,116 56,115 L38,115 C32,115 30,110 35,106 Z" fill="#ffffff" stroke="#78909c" stroke-width="1.5"/>
      <path d="M64,100 C70,98 74,104 68,108 Z" fill="#455a64"/>
      <path d="M40,115 L40,124 M46,115 L46,124 M56,115 L56,124 M61,115 L61,124" stroke="#455a64" stroke-width="2"/>
      <line x1="52" y1="94" x2="52" y2="42" stroke="#2e7d32" stroke-width="2"/>
      <line x1="185" y1="46" x2="185" y2="28" stroke="#2e7d32" stroke-width="2"/>
      <rect x="14" y="20" width="82" height="22" rx="5" fill="#ffffff" stroke="#2e7d32" stroke-width="1.5"/>
      <text x="55" y="35" font-size="11" font-weight="bold" fill="#1b5e20" text-anchor="middle">西部草原畜牧</text>
      <rect x="135" y="10" width="100" height="22" rx="5" fill="#ffffff" stroke="#2e7d32" stroke-width="1.5"/>
      <text x="185" y="25" font-size="11" font-weight="bold" fill="#1b5e20" text-anchor="middle">傳統居所：？</text>
    </svg>`,

    // U8 #20：河流三大功能（上游水力發電大壩、中游水路運輸貨船、岸邊農業灌溉）
    hum_u8_river_uses: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#e8f5e9"/>
      <!-- 蜿蜒河道 -->
      <path d="M15,45 C85,45 95,95 165,98 C215,100 245,115 280,120 L280,150 L140,150 C90,130 65,85 0,80 Z" fill="#29b6f6" stroke="#0288d1" stroke-width="2"/>
      <!-- (1) 上游水壩與輸電塔 -->
      <path d="M22,35 L68,35 L62,78 L16,78 Z" fill="#b0bec5" stroke="#37474f" stroke-width="2"/>
      <path d="M32,52 L28,78 M44,52 L40,78 M54,52 L50,78" stroke="#e1f5fe" stroke-width="2.5"/>
      <path d="M78,18 L86,48 M86,18 L78,48 M74,26 L90,26 M72,36 L92,36" stroke="#455a64" stroke-width="2"/>
      <!-- (2) 中游貨船 -->
      <path d="M115,96 L165,96 L156,110 L124,110 Z" fill="#d84315" stroke="#3e2723" stroke-width="1.5"/>
      <path d="M126,84 L152,84 L152,96 L126,96 Z" fill="#ffca28" stroke="#5d4037" stroke-width="1.5"/>
      <!-- (3) 岸邊農田灌溉 -->
      <path d="M195,55 L268,55 L268,92 L195,92 Z" fill="#c5e1a5" stroke="#558b2f" stroke-width="1.5"/>
      <path d="M202,65 L260,65 M202,75 L260,75 M202,85 L260,85" stroke="#33691e" stroke-width="2" stroke-dasharray="6,4"/>
      <path d="M185,105 C185,82 198,75 212,75" fill="none" stroke="#0288d1" stroke-width="2.5" stroke-dasharray="3,2"/>
      <text x="45" y="25" font-size="10" font-weight="bold" fill="#1b5e20" text-anchor="middle">1.水力？</text>
      <text x="140" y="76" font-size="10" font-weight="bold" fill="#01579b" text-anchor="middle">2.水路？</text>
      <text x="232" y="46" font-size="10" font-weight="bold" fill="#2e7d32" text-anchor="middle">3.農業？</text>
    </svg>`,

    // U8 #21：青海省山坡層層階梯狀梯田（治理水土流失）
    hum_u8_terraces: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#e1f5fe"/>
      <!-- 階梯狀山坡有機等高線梯田 -->
      <path d="M10,140 L10,55 C60,40 120,45 160,60 L265,140 Z" fill="#8d6e63"/>
      <path d="M10,65 C65,55 115,58 148,68 L135,78 C100,70 55,68 10,78 Z" fill="#aed581" stroke="#558b2f" stroke-width="2"/>
      <path d="M10,85 C75,75 135,78 175,90 L162,102 C120,92 65,90 10,100 Z" fill="#9ccc65" stroke="#558b2f" stroke-width="2"/>
      <path d="M10,108 C90,98 160,102 208,114 L195,126 C145,115 80,112 10,122 Z" fill="#7cb342" stroke="#33691e" stroke-width="2"/>
      <path d="M10,130 C105,122 185,125 242,136 L230,146 L10,146 Z" fill="#689f38" stroke="#33691e" stroke-width="2"/>
      <line x1="130" y1="85" x2="195" y2="45" stroke="#2e7d32" stroke-width="2"/>
      <rect x="145" y="18" width="122" height="28" rx="6" fill="#ffffff" stroke="#2e7d32" stroke-width="1.5"/>
      <text x="206" y="36" font-size="11" font-weight="bold" fill="#1b5e20" text-anchor="middle">山坡層層階梯農田</text>
    </svg>`,

    // U8 #22：依山傍水木柱懸空支撐的南方吊腳樓
    hum_u8_stilt_house: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#e0f2f1"/>
      <!-- 青山與河岸 -->
      <path d="M0,140 L0,45 Q65,30 125,85 L165,140 Z" fill="#81c784"/>
      <path d="M115,122 L280,122 L280,150 L105,150 Z" fill="#4fc3f7"/>
      <!-- 飛簷木屋與長木柱支撐懸空結構 -->
      <path d="M85,52 C115,36 175,36 205,52 L192,58 L98,58 Z" fill="#4e342e" stroke="#212121" stroke-width="2"/>
      <path d="M98,58 L192,58 L192,94 L98,94 Z" fill="#d7ccc8" stroke="#5d4037" stroke-width="2.5"/>
      <path d="M112,66 L132,66 L132,84 L112,84 Z M156,66 L176,66 L176,84 L156,84 Z" fill="#fff8e1" stroke="#5d4037" stroke-width="1.5"/>
      <!-- 底部懸空長木柱 -->
      <path d="M106,94 L106,132 M126,94 L126,136 M146,94 L146,138 M166,94 L166,138 M184,94 L184,138 M106,112 L184,112" stroke="#5d4037" stroke-width="4" stroke-linecap="round"/>
      <line x1="184" y1="112" x2="225" y2="85" stroke="#00695c" stroke-width="2"/>
      <rect x="196" y="62" width="76" height="24" rx="5" fill="#ffffff" stroke="#00695c" stroke-width="1.5"/>
      <text x="234" y="78" font-size="11" font-weight="bold" fill="#004d40" text-anchor="middle">木柱支撐懸空</text>
    </svg>`,

    // U9 #19：頭戴花帽身穿長袍的新疆維吾爾族男孩
    hum_u9_uyghur_boy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#fff8e1"/>
      <!-- 新疆六角花帽 (巴旦木紋樣) 與長袍 -->
      <path d="M62,36 L82,24 L108,24 L128,36 L124,48 L66,48 Z" fill="#00695c" stroke="#ffd54f" stroke-width="2"/>
      <path d="M78,36 Q95,26 112,36 M85,42 L105,42" stroke="#ffffff" stroke-width="2" fill="none"/>
      <path d="M70,48 C70,74 120,74 120,48 Z" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2"/>
      <path d="M58,76 L132,76 L142,142 L48,142 Z" fill="#b71c1c" stroke="#4e342e" stroke-width="2"/>
      <path d="M95,76 L95,142 M54,108 L136,108" stroke="#ffd54f" stroke-width="3"/>
      <path d="M148,26 L268,26 L268,94 L148,94 Z" fill="#ffffff" stroke="#ff8f00" stroke-width="2" rx="8"/>
      <text x="208" y="48" font-size="11" font-weight="bold" fill="#e65100" text-anchor="middle">「我住在新疆，戴花帽</text>
      <text x="208" y="66" font-size="11" font-weight="bold" fill="#e65100" text-anchor="middle">穿長袍，多吃牛羊肉。」</text>
    </svg>`,

    // U9 #20：頭戴精緻銀角銀冠與銀項圈的苗族女孩
    hum_u9_miao_girl: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#f3e5f5"/>
      <!-- 苗族雙角銀冠與多層銀項圈 -->
      <path d="M52,18 C58,42 72,46 82,46 L108,46 C118,46 132,42 138,18 C126,28 116,36 108,38 L82,38 C74,36 64,28 52,18 Z" fill="#eceff1" stroke="#607d8b" stroke-width="2"/>
      <path d="M72,46 L118,46 L118,54 L72,54 Z" fill="#cfd8dc" stroke="#455a64" stroke-width="1.5"/>
      <path d="M74,54 C74,78 116,78 116,54 Z" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2"/>
      <!-- 銀項圈與刺繡服 -->
      <path d="M62,84 L128,84 L138,142 L52,142 Z" fill="#1a237e" stroke="#0d47a1" stroke-width="2"/>
      <path d="M70,82 C82,98 108,98 120,82 M64,88 C80,108 110,108 126,88" fill="none" stroke="#eceff1" stroke-width="3.5"/>
      <rect x="148" y="28" width="120" height="66" rx="8" fill="#ffffff" stroke="#8e24aa" stroke-width="2"/>
      <text x="208" y="52" font-size="11" font-weight="bold" fill="#4a148c" text-anchor="middle">佩戴精緻銀飾與刺繡</text>
      <text x="208" y="70" font-size="11" font-weight="bold" fill="#4a148c" text-anchor="middle">（相信銀器能保平安）</text>
    </svg>`,

    // U9 #21：西藏拉薩布達拉宮歷史建築群（紅宮與白宮依山而建）
    hum_u9_potala_palace: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <defs>
        <linearGradient id="tibetSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1565c0"/><stop offset="100%" stop-color="#90caf9"/></linearGradient>
      </defs>
      <rect width="280" height="150" rx="12" fill="url(#tibetSky)"/>
      <!-- 紅山與雪山背景 -->
      <path d="M0,150 L45,75 L140,42 L235,75 L280,150 Z" fill="#8d6e63"/>
      <!-- 白宮梯形群 -->
      <path d="M48,132 L62,72 L218,72 L232,132 Z" fill="#fafafa" stroke="#5d4037" stroke-width="2"/>
      <!-- 中央紅宮與金頂 -->
      <path d="M96,98 L104,42 L176,42 L184,98 Z" fill="#b71c1c" stroke="#3e2723" stroke-width="2"/>
      <path d="M108,34 L172,34 L176,42 L104,42 Z" fill="#ffd54f" stroke="#ff6f00" stroke-width="1.5"/>
      <!-- 藏式梯形小窗列 -->
      <path d="M75,86 L82,86 M95,86 L102,86 M120,56 L128,56 M152,56 L160,56 M178,86 L185,86 M198,86 L205,86" stroke="#3e2723" stroke-width="4"/>
      <rect x="65" y="8" width="150" height="20" rx="5" fill="rgba(255,255,255,0.92)"/>
      <text x="140" y="22" font-size="11" font-weight="bold" fill="#b71c1c" text-anchor="middle">西藏拉薩市・藏傳佛教聖地</text>
    </svg>`,

    // U9 #22：博物館內違反「禁止閃光燈」標誌拍攝青花瓷瓶
    hum_u9_museum_flash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#eceff1"/>
      <!-- 玻璃展示櫃與青花古瓷瓶 -->
      <path d="M28,28 L104,28 L104,136 L28,136 Z" fill="#e1f5fe" stroke="#546e7a" stroke-width="2.5"/>
      <path d="M56,52 L76,52 L72,66 C86,76 86,104 74,114 L58,114 C46,104 46,76 60,66 Z" fill="#ffffff" stroke="#1565c0" stroke-width="2.5"/>
      <path d="M54,86 Q66,78 78,86 M56,96 Q66,104 76,96" fill="none" stroke="#1565c0" stroke-width="2"/>
      <!-- 禁止閃光燈標誌 -->
      <path d="M122,20 C138,20 148,32 148,46 C148,60 138,72 122,72 C106,72 96,60 96,46 C96,32 106,20 122,20 Z" fill="#ffffff" stroke="#d32f2f" stroke-width="3.5"/>
      <path d="M126,28 L116,46 L126,46 L118,64" fill="none" stroke="#ff8f00" stroke-width="2.5"/>
      <line x1="104" y1="28" x2="140" y2="64" stroke="#d32f2f" stroke-width="3.5"/>
      <!-- 相機發出強烈閃光 -->
      <path d="M185,72 L235,72 L235,106 L185,106 Z" fill="#37474f" stroke="#212121" stroke-width="2"/>
      <path d="M185,82 L135,58 L152,88 L128,96 L185,94 Z" fill="#fff59d" opacity="0.85"/>
      <text x="208" y="130" font-size="11" font-weight="bold" fill="#c62828" text-anchor="middle">強光閃光燈拍攝文物</text>
    </svg>`
  };

  window.Aetheria.QuestionBank.Humanities = {
    DIAGRAMS: HUM_DIAGRAMS,

    // 1. 人文科 4 個課節清單
    LESSONS: [
      { key: "hum_u1", name: "人文・U1 適應青春期 (30題)" },
      { key: "hum_u2", name: "人文・U2 與異性相處 (30題)" },
      { key: "hum_u8", name: "人文・U8 人民生活 (30題)" },
      { key: "hum_u9", name: "人文・U9 文化遺產 (30題)" }
    ],

    // 2. 人文科完整 120 題 (每課 30 題，忠實對應《人文題庫.docx》)
    QUESTIONS: [
      // ==================== 第一部分：U1 適應青春期 (30題) ====================
      { id: "hum_u1_01", unitKey: "hum_u1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "青春期是由兒童逐漸長大成為 ________ 的必經階段與過渡期。", blanks: ["成人"], distractors: ["長者", "幼兒", "領袖"] },
      { id: "hum_u1_02", unitKey: "hum_u1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "每個人發育的時間和進入青春期的 ________ 都不同，不需要與他人比較。", blanks: ["年齡"], distractors: ["性別", "身高", "體重"] },
      { id: "hum_u1_03", unitKey: "hum_u1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "面對青春期的身體轉變，我們不用感到憂慮和 ________，應接納身體的改變。", blanks: ["自卑"], distractors: ["驕傲", "興奮", "自滿"] },
      { id: "hum_u1_04", unitKey: "hum_u1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "處理暗瘡問題時，應勤洗面，並使用 ________ 的洗面用品和 ________ 洗面。", blanks: ["溫和", "溫水"], distractors: ["刺激", "熱水", "冰水"] },
      { id: "hum_u1_05", unitKey: "hum_u1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "為了處理及預防體臭問題，我們應該每天 ________，並勤換 ________ 和襪子。", blanks: ["洗澡", "內外衣服"], distractors: ["噴香水", "鞋子", "床單"] },
      { id: "hum_u1_06", unitKey: "hum_u1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "女性在月經期間使用衛生巾時，要注意個人及 ________ 衛生，更換前後要清潔 ________。", blanks: ["環境", "雙手"], distractors: ["食物", "頭髮", "臉部"] },
      { id: "hum_u1_07", unitKey: "hum_u1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "把使用過的衛生巾 ________ 好，然後放入 ________ 箱內。", blanks: ["包", "垃圾"], distractors: ["摺", "馬桶", "回收"] },
      { id: "hum_u1_08", unitKey: "hum_u1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "踏入青春期的青少年，情緒變得敏感和 ________，亦會渴望 ________ 自主，減少依賴家人。", blanks: ["不穩定", "獨立"], distractors: ["冷漠", "依附", "退縮"] },

      // U1 分類題 (#9 ~ #13) -> 分類籃
      {
        id: "hum_u1_09", unitKey: "hum_u1", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【生理與心理變化分類】請將以下青春期特徵放入對應的分類籃：",
        baskets: ["生理變化", "心理變化"],
        items: [
          { label: "A. 臉上長暗瘡", basket: "生理變化" },
          { label: "B. 注重自我形象", basket: "心理變化" },
          { label: "C. 出現體臭", basket: "生理變化" },
          { label: "D. 聲線變得不穩定", basket: "生理變化" },
          { label: "E. 渴求獨立自主", basket: "心理變化" },
          { label: "F. 女孩出現月經", basket: "生理變化" }
        ],
        answer: "生理變化：A、C、D、F ｜ 心理變化：B、E"
      },
      {
        id: "hum_u1_10", unitKey: "hum_u1", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【獲取性知識途徑分類】請將以下做法放入對應的分類籃：",
        baskets: ["正確途徑", "錯誤途徑"],
        items: [
          { label: "A. 向老師提出疑問", basket: "正確途徑" },
          { label: "B. 在社交媒體向陌生人查詢", basket: "錯誤途徑" },
          { label: "C. 與父母傾談", basket: "正確途徑" },
          { label: "D. 瀏覽衛生署學生健康服務網站", basket: "正確途徑" }
        ],
        answer: "正確途徑：A、C、D ｜ 錯誤途徑：B"
      },
      {
        id: "hum_u1_11", unitKey: "hum_u1", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【月經期間護理分類】請將以下月經期間的做法放入對應的分類籃：",
        baskets: ["應該做的事", "錯誤觀念"],
        items: [
          { label: "A. 勤換衛生巾", basket: "應該做的事" },
          { label: "B. 不要洗頭", basket: "錯誤觀念" },
          { label: "C. 避免吃生冷食物", basket: "應該做的事" },
          { label: "D. 不要做運動", basket: "錯誤觀念" },
          { label: "E. 記錄月經周期日子", basket: "應該做的事" },
          { label: "F. 保持身體清潔", basket: "應該做的事" }
        ],
        answer: "應該做的事：A、C、E、F ｜ 錯誤觀念：B、D"
      },
      {
        id: "hum_u1_12", unitKey: "hum_u1", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【衛生習慣配對分類】請將以下衛生習慣歸類入對應的分類籃：",
        baskets: ["處理暗瘡", "處理體臭"],
        items: [
          { label: "A. 每天洗澡", basket: "處理體臭" },
          { label: "B. 用溫水洗面", basket: "處理暗瘡" },
          { label: "C. 勤換內外衣服和襪子", basket: "處理體臭" },
          { label: "D. 使用溫和洗面用品", basket: "處理暗瘡" },
          { label: "E. 少吃味道濃烈的食物", basket: "處理體臭" }
        ],
        answer: "處理暗瘡：B、D ｜ 處理體臭：A、C、E"
      },
      {
        id: "hum_u1_13", unitKey: "hum_u1", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【朋輩相處態度分類】面對朋友的要求時，請放入對應的分類籃：",
        baskets: ["應答應的請求", "應拒絕的不當要求"],
        items: [
          { label: "A. 測驗時移近試卷讓同學抄答案", basket: "應拒絕的不當要求" },
          { label: "B. 一起參加毛筆書法比賽", basket: "應答應的請求" },
          { label: "C. 幫不想上興趣班的同學代簽到", basket: "應拒絕的不當要求" },
          { label: "D. 偷拿哥哥的新遊戲機借給朋友", basket: "應拒絕的不當要求" }
        ],
        answer: "應答應：B ｜ 應拒絕：A、C、D"
      },

      // U1 簡答題 (#14 ~ #18)
      {
        id: "hum_u1_14", unitKey: "hum_u1", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】為什麼我們不需要因為自己還未長高、未長鬍鬚或胸部未發育而與同學比較？",
        options: [
          "因為每個人發育的時間、成長速度和進入青春期的年齡都不相同，存在個別差異。",
          "因為只要不理會身體變化，發育就會自動停止。",
          "因為所有人在同一天進入青春期，比較會影響成績。",
          "因為只有運動員才會出現青春期生理變化。"
        ],
        answer: "因為每個人發育的時間、成長速度和進入青春期的年齡都不相同，存在個別差異。"
      },
      {
        id: "hum_u1_15", unitKey: "hum_u1", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】請舉出兩個可以獲取正確青春期生理變化知識的可靠網站名稱。",
        options: [
          "衛生署學生健康服務網站、香港家庭計劃指導會網站。",
          "社交媒體討論區、匿名網友聊天室。",
          "網上遊戲論壇、流行購物網站。",
          "娛樂八卦網站、私人影片頻道。"
        ],
        answer: "衛生署學生健康服務網站、香港家庭計劃指導會網站。"
      },
      {
        id: "hum_u1_16", unitKey: "hum_u1", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】除了注意個人清潔衛生外，還有哪四個健康生活習慣能幫助我們順利適應青春期的身體轉變？",
        options: [
          "保持心情愉快（開朗）、進行適量運動、保持均衡飲食，以及有充足睡眠。",
          "每天熬夜溫習、只吃肉類、減少運動、長時間玩手機。",
          "大量購買護膚品、節食減肥、避免外出、獨自留在家中。",
          "多吃味道濃烈的食物、減少飲水、劇烈運動至深夜。"
        ],
        answer: "保持心情愉快（開朗）、進行適量運動、保持均衡飲食，以及有充足睡眠。"
      },
      {
        id: "hum_u1_17", unitKey: "hum_u1", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】青春期的青少年對家人通常會有什麼轉變？我們應該怎樣維持和諧的家庭關係？",
        options: [
          "青少年通常會減少依賴家人並渴求獨立；我們應該與父母保持良好溝通，並學習控制情緒。",
          "青少年會完全依賴父母；我們應該要求父母代做所有決定。",
          "青少年會拒絕與家人說話；我們應該隱瞞所有事情避免溝通。",
          "青少年情緒永遠平靜；不需要與父母分享日常生活。"
        ],
        answer: "青少年通常會減少依賴家人並渴求獨立；我們應該與父母保持良好溝通，並學習控制情緒。"
      },
      {
        id: "hum_u1_18", unitKey: "hum_u1", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】踏入青春期後，青少年在「社交與朋輩」以及「個人空間」兩方面會出現什麼心理特徵？",
        options: [
          "社交方面會非常重視朋輩的認同及追隨潮流；個人空間方面會十分重視私隱和個人空間。",
          "社交方面喜歡孤立自己不交朋友；個人空間方面喜歡公開所有日記。",
          "社交方面只聽從陌生人意見；個人空間方面不需要任何私人時間。",
          "社交方面拒絕參加任何群體活動；個人空間方面完全依賴家人陪伴。"
        ],
        answer: "社交方面會非常重視朋輩的認同及追隨潮流；個人空間方面會十分重視私隱和個人空間。"
      },

      // U1 看圖填充題 (#19 ~ #23) -> 附教科書有機向量插畫
      {
        id: "hum_u1_19", unitKey: "hum_u1", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u1_mirror_boy",
        prompt: "圖中男孩面對青春期的發育疑問，反映每個人進入青春期的年齡都 ________，我們要 ________ 身體的改變。",
        blanks: ["不同", "接納"], distractors: ["相同", "抗拒", "自卑"]
      },
      {
        id: "hum_u1_20", unitKey: "hum_u1", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u1_wash_face",
        prompt: "圖中女孩正在透過 ________ 來處理青春期的 ________ 問題。",
        blanks: ["勤洗面", "暗瘡"], distractors: ["噴香水", "體臭", "身高"]
      },
      {
        id: "hum_u1_21", unitKey: "hum_u1", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u1_hairpin",
        prompt: "這幅圖反映該名青少年出現了「注重 ________」的青春期心理特徵。",
        blanks: ["自我形象"], distractors: ["個人私隱", "家庭依賴", "學業成績"]
      },
      {
        id: "hum_u1_22", unitKey: "hum_u1", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u1_diary_privacy",
        prompt: "這幅圖反映青少年在青春期非常重視 ________ 和 ________。",
        blanks: ["私隱", "個人空間"], distractors: ["潮流", "朋輩認同", "外表"]
      },
      {
        id: "hum_u1_23", unitKey: "hum_u1", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u1_less_depend",
        prompt: "這幅圖反映青春期的青少年會出現「減少 ________」的心理轉變。",
        blanks: ["依賴家人"], distractors: ["結交朋友", "獨立自主", "個人私隱"]
      },

      // U1 選擇題 (#24 ~ #27，含複選題)
      {
        id: "hum_u1_24", unitKey: "hum_u1", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "以下哪項不是獲取正確青春期生理變化知識的途徑？",
        options: ["A. 向老師請教", "B. 和爸爸媽媽傾訴", "C. 在社交媒體上詢問陌生人", "D. 瀏覽可靠的性教育網站"],
        answer: "C. 在社交媒體上詢問陌生人"
      },
      {
        id: "hum_u1_25", unitKey: "hum_u1", qCategory: "hum_mcq", type: "multi_mcq", typeLabel: "選擇題(可多選)",
        prompt: "女性在月經期間要注意什麼？（可選多於一項）",
        options: ["A. 不要洗頭", "B. 勤換衛生巾", "C. 保持身體清潔", "D. 避免吃生冷食物"],
        answers: ["B. 勤換衛生巾", "C. 保持身體清潔", "D. 避免吃生冷食物"],
        answer: "B、C、D"
      },
      {
        id: "hum_u1_26", unitKey: "hum_u1", qCategory: "hum_mcq", type: "multi_mcq", typeLabel: "選擇題(可多選)",
        prompt: "怎樣處理體臭問題？（可選多於一項）",
        options: ["A. 每天洗澡", "B. 勤換內外衣服和襪子", "C. 少吃味道濃烈的食物", "D. 不要做運動，減少流汗"],
        answers: ["A. 每天洗澡", "B. 勤換內外衣服和襪子", "C. 少吃味道濃烈的食物"],
        answer: "A、B、C"
      },
      {
        id: "hum_u1_27", unitKey: "hum_u1", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "當朋友稱讚自己的裙子很好看時感到十分開心，甚至為了迎合朋友而追看演唱會，這主要反映了哪兩種青春期心理特徵？",
        options: ["A. 情緒變化大、對性產生好奇", "B. 重視朋輩認同、追隨潮流", "C. 重視私隱、渴求獨立自主", "D. 減少依賴家人、對異性感興趣"],
        answer: "B. 重視朋輩認同、追隨潮流"
      },

      // U1 問答題(情境題) (#28 ~ #30)
      {
        id: "hum_u1_28", unitKey: "hum_u1", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
        prompt: "【情境】立德後天有測驗，但已跟同學約定去玩電子遊戲。爸爸要求他不要去，快點留在家中溫習。(1) 爸爸為什麼這樣要求？ (2) 如果你是立德，你會怎樣做？為什麼？",
        options: [
          "(1) 爸爸希望立德為測驗做好準備。(2) 聽從勸告留家溫習，向同學道歉改期，因學業是自己責任，應與父母保持良好溝通並控制情緒。",
          "(1) 爸爸不喜歡立德交朋友。(2) 與爸爸大吵一架並偷偷外出打機，因為朋友比家人重要。",
          "(1) 爸爸想自己玩遊戲機。(2) 叫同學直接來家裡打機，不用理會後天的測驗。",
          "(1) 爸爸誤會了測驗日期。(2) 鎖上房門拒絕溝通，整天不吃飯抗議。"
        ],
        answer: "(1) 爸爸希望立德為後天的測驗做好準備。(2) 聽從爸爸勸告留在家中溫習，向同學道歉並改天再約；因為學業是自己責任，應與父母保持良好溝通並控制情緒。"
      },
      {
        id: "hum_u1_29", unitKey: "hum_u1", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
        prompt: "【情境】同學兆軒在測驗前對立德說：「立德，在測驗時把試卷移近我，讓我抄答案吧！」(1) 兆軒的要求恰當嗎？ (2) 如果你是立德，會怎樣回應？",
        options: [
          "(1) 不恰當，作弊違反校規且不誠實。(2) 勇敢拒絕，並提出平時幫他溫習；切勿因渴望朋輩認同而盲目順從不當要求。",
          "(1) 恰當，好朋友應該講義氣。(2) 答應把試卷移近給他抄，以免被他覺得自私。",
          "(1) 不恰當。(2) 為了不得罪他，在試卷上故意寫錯答案給他抄。",
          "(1) 恰當。(2) 要求他付錢或請吃零食才讓他抄答案。"
        ],
        answer: "(1) 不恰當，因為測驗作弊違反校規且是不誠實行為。(2) 勇敢拒絕兆軒的要求，並提出在測驗後或平時幫他溫習功課；切勿因渴望朋輩認同而盲目順從朋友的不當要求。"
      },
      {
        id: "hum_u1_30", unitKey: "hum_u1", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
        prompt: "【情境】下星期日是外婆的生日，爸爸媽媽希望與外婆吃晚飯慶祝，但你已答應朋友當晚去看電影。你應該怎樣處理這個情況？",
        options: [
          "主動向朋友坦白解釋當晚是外婆生日需與家人慶祝，向朋友致歉並提議改期看電影；重視朋友同時也要珍惜與家人相處。",
          "不告訴父母，當晚直接溜出去跟朋友看電影，因為已經答應了朋友。",
          "對朋友說謊稱自己生病入院，以免朋友生氣。",
          "強迫外婆更改生日晚飯的日期來遷就自己看電影。"
        ],
        answer: "應該主動向朋友坦白解釋當晚是外婆的生日，需要與家人一起吃飯慶祝，向朋友致歉並提議改期再看電影；因為在重視朋友的同時，也要珍惜與家人的相處和溝通。"
      },

      // ==================== 第二部分：U2 與異性相處 (30題) ====================
      { id: "hum_u2_01", unitKey: "hum_u2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "每個人都有不同的 ________ 和特質，這與 ________ 無關，我們應拒絕性別角色定型。", blanks: ["性格", "性別"], distractors: ["年齡", "外貌", "財富"] },
      { id: "hum_u2_02", unitKey: "hum_u2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "我們可以與異性朋友尋找 ________ 的地方，例如一起參加有共同興趣的活動，發展友誼。", blanks: ["相似"], distractors: ["對立", "矛盾", "昂貴"] },
      { id: "hum_u2_03", unitKey: "hum_u2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "在小組合作中，男女同學可以各展所長，互相 ________，互補 ________。", blanks: ["學習", "不足"], distractors: ["推卸", "指責", "比較"] },
      { id: "hum_u2_04", unitKey: "hum_u2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "我們要懂得欣賞和 ________ 別人的優點和缺點，並以坦誠和尊重的態度，________ 選擇可信任的朋友。", blanks: ["接納", "謹慎"], distractors: ["取笑", "隨便", "盲目"] },
      { id: "hum_u2_05", unitKey: "hum_u2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "青春期男女對異性開始感到好奇是正常的，但我們要學會分辨 ________ 和 ________。", blanks: ["友情", "愛情"], distractors: ["親情", "同情", "心情"] },
      { id: "hum_u2_06", unitKey: "hum_u2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "對異性的 ________ 不一定等同愛情，明白兩性之間也可以成為純潔的 ________。", blanks: ["好奇", "朋友"], distractors: ["討厭", "敵人", "伴侶"] },
      { id: "hum_u2_07", unitKey: "hum_u2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "與異性相處時，我們應該保持 ________ 和自然，互相 ________，並保持適當的距離。", blanks: ["大方", "尊重"], distractors: ["害羞", "取笑", "迴避"] },
      { id: "hum_u2_08", unitKey: "hum_u2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "與異性相處時要訂立相處 ________；若對方的言行令自己感到不舒服，要 ________ 說出個人感受。", blanks: ["界線", "坦白"], distractors: ["秘密", "隱瞞", "沉默"] },

      // U2 分類題 (#9 ~ #12) -> 分類籃
      {
        id: "hum_u2_09", unitKey: "hum_u2", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【性別觀念判斷分類】請將以下說法放入對應的分類籃：",
        baskets: ["性別刻板印象(錯誤)", "正確性別觀念"],
        items: [
          { label: "A. 男孩子竟然會哭，真懦弱", basket: "性別刻板印象(錯誤)" },
          { label: "B. 女孩子踢足球太粗魯，應學彈鋼琴", basket: "性別刻板印象(錯誤)" },
          { label: "C. 男孩和女孩都可以很勇敢保護別人", basket: "正確性別觀念" },
          { label: "D. 女孩運動能力差，男孩粗心大意", basket: "性別刻板印象(錯誤)" },
          { label: "E. 冷靜理智的女孩也能成為出色消防員", basket: "正確性別觀念" }
        ],
        answer: "刻板印象(錯誤)：A、B、D ｜ 正確觀念：C、E"
      },
      {
        id: "hum_u2_10", unitKey: "hum_u2", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【友情與愛情分類】請判斷以下情況並放入對應的分類籃：",
        baskets: ["友情的表現", "愛情的表現"],
        items: [
          { label: "A. 一起打羽毛球，更喜歡和朋友進行羣體活動", basket: "友情的表現" },
          { label: "B. 長時間相處接受彼此優缺點，作出承諾計劃結婚", basket: "愛情的表現" },
          { label: "C. 上學碰見男班長跟他說早晨覺得高興", basket: "友情的表現" },
          { label: "D. 確定心意互相信任，多年後決定結婚組織家庭", basket: "愛情的表現" }
        ],
        answer: "友情：A、C ｜ 愛情：B、D"
      },
      {
        id: "hum_u2_11", unitKey: "hum_u2", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【兩性相處言行分類】請將以下與異性相處的言行放入對應分類籃：",
        baskets: ["合宜的態度", "不合宜的態度"],
        items: [
          { label: "A. 放學相約異性同學去圖書館搜集研習資料", basket: "合宜的態度" },
          { label: "B. 怕同學看着，故意不跟異性同學說話", basket: "不合宜的態度" },
          { label: "C. 異性同學受傷時主動關心並扶到長椅休息", basket: "合宜的態度" },
          { label: "D. 隨便抓着異性同學手臂令對方尷尬", basket: "不合宜的態度" },
          { label: "E. 看到男女同學一起走便取笑談戀愛", basket: "不合宜的態度" }
        ],
        answer: "合宜：A、C ｜ 不合宜：B、D、E"
      },
      {
        id: "hum_u2_12", unitKey: "hum_u2", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【相處原則配對分類】請將以下行為放入對應的「兩性相處態度」分類籃：",
        baskets: ["互相接納", "互補不足", "謹慎選擇朋友"],
        items: [
          { label: "A. 知志健畏高，不坐過山車改看巡遊", basket: "互相接納" },
          { label: "B. 立德負責採訪，靜兒善於整理負責分析", basket: "互補不足" },
          { label: "C. 選擇友善和誠實的人做朋友", basket: "謹慎選擇朋友" }
        ],
        answer: "A：互相接納 ｜ B：互補不足 ｜ C：謹慎選擇朋友"
      },

      // U2 簡答題 (#13 ~ #17)
      {
        id: "hum_u2_13", unitKey: "hum_u2", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】如果我們對男性和女性抱有傳統的刻板印象（如認為男孩粗心、女孩愛哭），會對兩性相處帶來什麼負面影響？",
        options: [
          "會阻礙對異性的真正瞭解，導致不願與異性合作，影響與異性正常、和諧地相處。",
          "能幫助我們更快完成分組專題研習。",
          "會令男女同學的運動成績同時大幅提升。",
          "沒有任何負面影響，反而能增進友誼。"
        ],
        answer: "會阻礙我們對異性的真正瞭解，導致不願意與異性合作（如拒絕同組做專題研習），影響與異性正常、和諧地相處。"
      },
      {
        id: "hum_u2_14", unitKey: "hum_u2", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】請列出四項與異性相處時的正確態度。",
        options: [
          "(1)拒絕性別角色定型；(2)尋找相似之處；(3)互相接納與尊重；(4)互相學習，互補不足；(5)謹慎選擇朋友；(6)保持大方坦誠。",
          "(1)刻意迴避異性；(2)取笑異性同學；(3)不理會身體界線；(4)拒絕同組合作。",
          "(1)凡事只聽男同學意見；(2)把所有工作交給女同學；(3)在背後議論別人。",
          "(1)單獨去偏僻地方；(2)在網上結交陌生異性；(3)隱瞞父母。"
        ],
        answer: "(1) 增加瞭解，拒絕性別角色定型；(2) 尋找相似之處；(3) 互相接納與尊重；(4) 互相學習，互補不足；(5) 謹慎選擇朋友；(6) 保持大方坦誠。"
      },
      {
        id: "hum_u2_15", unitKey: "hum_u2", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】真正的「愛情」通常具備哪些重要元素（請舉出三項）？",
        options: [
          "經過長時間相處和深入瞭解、互相信任、包容和關心對方優缺點，並願意作出承諾（如計劃結婚、組織家庭）。",
          "只要每天上學打招呼覺得開心，就已經具備愛情的所有元素。",
          "只需要外貌好看及送昂貴禮物，不需要長時間瞭解。",
          "只要有共同興趣一起打一次羽毛球就是愛情。"
        ],
        answer: "需要經過長時間相處和深入瞭解、互相信任、包容和關心對方的優缺點，並願意為對方作出承諾（如計劃結婚、組織家庭）。"
      },
      {
        id: "hum_u2_16", unitKey: "hum_u2", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】與異性朋友相處時，在身體距離和言行方面要注意什麼？",
        options: [
          "留意言行舉止，訂立相處界線並保持適當身體距離；若對方的接觸令自己不舒服，要坦白說出感受。",
          "為表熱情可以隨意拉扯對方的手臂或搭肩膀。",
          "即使對方的接觸令自己尷尬，也應該默默忍受不可說出來。",
          "與異性相處必須完全不說話、不眼神接觸。"
        ],
        answer: "要留意自己的言行舉止，訂立相處界線並保持適當的身體距離；若對方的接觸令自己不舒服，要坦白說出感受。"
      },
      {
        id: "hum_u2_17", unitKey: "hum_u2", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】當青少年在結交異性朋友時遇上問題或煩惱，應該向誰尋求協助？為什麼？",
        options: [
          "應諮詢父母、老師等可信任的成年人意見，因為他們經驗豐富且可靠，不需獨自煩惱。",
          "應在網上向素未謀面的陌生網友傾訴，因為他們最刺激。",
          "應該放在心裡自己獨自承受，絕對不可告訴父母。",
          "應該聽信八卦同學的起鬨與流言。"
        ],
        answer: "應該諮詢父母、老師等可信任的成年人的意見，因為他們經驗豐富且可靠，不需要自己獨自煩惱。"
      },

      // U2 看圖填充題 (#18 ~ #21)
      {
        id: "hum_u2_18", unitKey: "hum_u2", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u2_stereotype_cry",
        prompt: "圖中取笑別人的同學抱有錯誤的 ________ 定型觀念，沒有做到 ________ 他人。",
        blanks: ["性別角色", "尊重"], distractors: ["年齡", "取笑", "依賴"]
      },
      {
        id: "hum_u2_19", unitKey: "hum_u2", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u2_calligraphy",
        prompt: "這幅圖展示了與異性相處時，可以透過「尋找 ________ 之處」來建立友誼。",
        blanks: ["相似"], distractors: ["不同", "矛盾", "秘密"]
      },
      {
        id: "hum_u2_20", unitKey: "hum_u2", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u2_study_ask",
        prompt: "圖中女同學與異性相處的態度 ________（正確／不正確），因為她表現得 ________，能與異性同學互相學習。",
        blanks: ["正確", "大方坦誠"], distractors: ["不正確", "害羞退縮", "粗魯"]
      },
      {
        id: "hum_u2_21", unitKey: "hum_u2", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u2_personal_space",
        prompt: "圖中女同學的行為忽略了與異性相處應保持適當的 ________，男同學應該 ________ 向她說出自己的感受。",
        blanks: ["距離", "坦白"], distractors: ["秘密", "隱瞞", "討好"]
      },

      // U2 選擇題 (#22 ~ #26)
      {
        id: "hum_u2_22", unitKey: "hum_u2", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "以下哪一項關於性別特質的描述是正確的？",
        options: ["A. 女性都是容易哭和愛生氣的", "B. 男孩子的數學和運動能力一定比女孩子強", "C. 每個人都有不同性格和特質，與性別無關", "D. 消防員只適合男性擔任，女性不適合"],
        answer: "C. 每個人都有不同性格和特質，與性別無關"
      },
      {
        id: "hum_u2_23", unitKey: "hum_u2", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "穎思在網上發文表示，有男同學最近突然握她的手或搭她的肩，說話又靠得很近，令她很尷尬。以下哪位網友的意見最正確？",
        options: [
          "A. 網友A：是不是你平時太粗魯，他把你當成男孩子？",
          "B. 網友B：你太敏感了，這很普通吧！",
          "C. 網友C：如果你不喜歡這些行為，便直接告訴對方，朋友之間應該互相尊重！",
          "D. 網友D：他一定是對你有好感！你喜歡他嗎？"
        ],
        answer: "C. 網友C：如果你不喜歡這些行為，便直接告訴對方，朋友之間應該互相尊重！"
      },
      {
        id: "hum_u2_24", unitKey: "hum_u2", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "當與異性同學一起進行專題研習時，最理想的做法是什麼？",
        options: [
          "A. 拒絕與男同學同組，因為他們粗心大意",
          "B. 為免被同學取笑談戀愛，全程不與異性組員交談",
          "C. 根據大家的專長分工合作，互相學習，互補不足",
          "D. 把所有工作交給異性同學做"
        ],
        answer: "C. 根據大家的專長分工合作，互相學習，互補不足"
      },
      {
        id: "hum_u2_25", unitKey: "hum_u2", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "哪一項不是分辨友情與愛情的正確觀念？",
        options: [
          "A. 對異性產生好奇不一定等同愛情",
          "B. 跟異性同學打招呼覺得高興，就代表已經愛上對方",
          "C. 異性之間也可以成為志趣相投的好朋友",
          "D. 愛情需要長時間相處瞭解，並願意為對方作出承諾"
        ],
        answer: "B. 跟異性同學打招呼覺得高興，就代表已經愛上對方"
      },
      {
        id: "hum_u2_26", unitKey: "hum_u2", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "結交異性朋友時，我們應該選擇怎樣的人做朋友？",
        options: ["A. 最受歡迎和最富有的人", "B. 友善、誠實和可信任的人", "C. 會盲目順從自己所有要求的人", "D. 喜歡取笑別人的同學"],
        answer: "B. 友善、誠實和可信任的人"
      },

      // U2 問答題(情境題) (#27 ~ #30)
      {
        id: "hum_u2_27", unitKey: "hum_u2", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
        prompt: "【情境】小美很喜歡踢足球，但媽媽卻對她說：「女孩子踢足球太粗魯，你應該學彈鋼琴。」你同意媽媽的說話嗎？為什麼？",
        options: [
          "不同意。因為每個人的興趣、性格和能力都不同，與性別無關，不應受傳統性別角色定型限制。",
          "同意。因為足球只屬於男孩子的運動，女孩子只能學習靜態音樂。",
          "同意。因為女孩子運動能力一定比男孩子差。",
          "不同意。因為女孩子應該完全不參加任何課外活動。"
        ],
        answer: "不同意。因為每個人的興趣、性格和能力都不同，與性別無關。我們不應受傳統的性別角色定型限制，女孩子也可以喜歡踢足球，男孩子也可以學彈鋼琴。"
      },
      {
        id: "hum_u2_28", unitKey: "hum_u2", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
        prompt: "【情境】有個男同學最近經常突然搭着穎思的肩膀，說話時又靠得很近，令穎思覺得很尷尬和不舒服。如果你是穎思，你會怎樣做？",
        options: [
          "保持冷靜，直接而坦白地告訴他自己不喜歡這些身體接觸，請他保持適當距離（互相尊重）；若無改善則向父母或老師求助。",
          "因為怕破壞同學關係而默默忍受，不敢出聲。",
          "在網上公開羞辱他，號召全班同學孤立他。",
          "從此逃學不再回校上課。"
        ],
        answer: "我會保持冷靜，直接而坦白地告訴該名男同學，自己不喜歡這些身體接觸，請他保持適當的距離，因為朋友之間應該互相尊重和訂立相處界線。如果情況沒有改善，我會向父母或老師求助。"
      },
      {
        id: "hum_u2_29", unitKey: "hum_u2", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
        prompt: "【情境】最近，興趣班的同學取笑你和一位異性朋友在談戀愛，你們都覺得很尷尬，考慮是不是應該減少聯絡。你認為應該怎樣應對？",
        options: [
          "不需因被取笑而尷尬或刻意減少聯絡；向同學澄清大家只是好朋友，繼續保持大方、自然和坦誠的態度相處即可。",
          "立即與該名異性朋友絕交，以後見面也假裝不認識。",
          "為了證明沒有談戀愛，故意在同學面前責罵對方。",
          "退出興趣班，不再參加任何活動。"
        ],
        answer: "我們不需要因為被取笑而感到尷尬，也不必刻意減少聯絡。因為兩性之間可以成為正常的普通朋友，我們只需向同學澄清大家只是好朋友，並繼續保持大方、自然和坦誠的態度相處即可。"
      },
      {
        id: "hum_u2_30", unitKey: "hum_u2", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
        prompt: "【情境】在籃球比賽中，異性隊友不慎跌倒受傷，但你擔心主動扶對方會被其他同學起鬨取笑。這時候你應該怎樣做？為什麼？",
        options: [
          "放下顧慮，大方地主動上前關心，並與其他同學一起扶對方到長椅休息；因為同學間應發揮仁愛和同理心互相幫助。",
          "假裝看不見直接走開，以免被其他同學取笑。",
          "站在旁邊跟其他同學一起起鬨取笑對方。",
          "責怪對方不小心跌倒影響比賽成績。"
        ],
        answer: "我應該放下顧慮，大方地主動上前關心對方，並與其他同學一起扶他／她到長椅上休息。因為同學之間應該發揮仁愛和同理心互相幫助，與異性相處只要態度自然大方即可。"
      },

      // ==================== 第三部分：U8 人民生活 (30題) ====================
      { id: "hum_u8_01", unitKey: "hum_u8", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "我國人口有 ________ 多，但人口分佈並不平均，超過九成（約93.5%）人口集中在 ________ 地區。", blanks: ["14億", "東南部"], distractors: ["5億", "西北部", "正中央"] },
      { id: "hum_u8_02", unitKey: "hum_u8", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "我國人口分佈地圖上，由黑龍江省 ________ 市至雲南省 ________ 市的連線，是著名的人口地理分界線。", blanks: ["黑河", "騰衝"], distractors: ["哈爾濱", "昆明", "拉薩"] },
      { id: "hum_u8_03", unitKey: "hum_u8", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "我國東南部地勢較 ________，氣候較 ________，且降水量較 ________，因此適合人類居住及發展農業。", blanks: ["平緩", "溫暖", "充足"], distractors: ["陡峭", "嚴寒", "稀少"] },
      { id: "hum_u8_04", unitKey: "hum_u8", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "我國素有「北方人吃 ________，南方人吃 ________」的飲食習慣差異。", blanks: ["麵食", "米食"], distractors: ["海鮮", "生果", "甜點"] },
      { id: "hum_u8_05", unitKey: "hum_u8", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "________ 高原是我國黃河、長江、瀾滄江三條重要河流的發源地，有「________」的美譽。", blanks: ["青藏", "中華水塔"], distractors: ["黃土", "世界屋脊", "雲貴"] },
      { id: "hum_u8_06", unitKey: "hum_u8", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "黃河上游河水清澈，但流經中部土壤鬆軟的 ________ 高原時，大量泥沙沖入河中，令河水變黃，更會抬高下游的 ________。", blanks: ["黃土", "河牀"], distractors: ["青藏", "水位", "山脈"] },
      { id: "hum_u8_07", unitKey: "hum_u8", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "長江三峽位於長江上游，由 ________、________ 和 ________ 組成，風景雄偉。", blanks: ["瞿塘峽", "巫峽", "西陵峽"], distractors: ["虎跳峽", "三門峽", "劉家峽"] },
      { id: "hum_u8_08", unitKey: "hum_u8", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "珠江流域擁有能保護海岸、改善水質的 ________，水域內更有 ________ 和黑臉琵鷺等瀕危物種棲息。", blanks: ["濕地", "中華白海豚"], distractors: ["沙漠", "大熊貓", "揚子鱷"] },

      // U8 分類題 (#9 ~ #13) -> 分類籃
      {
        id: "hum_u8_09", unitKey: "hum_u8", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【西北部與東南部比較分類】請將以下特徵放入對應的分類籃：",
        baskets: ["我國西北部", "我國東南部"],
        items: [
          { label: "A. 面積約佔56.2%，人口只佔約6.5%", basket: "我國西北部" },
          { label: "B. 面積約佔43.8%，人口佔約93.5%", basket: "我國東南部" },
          { label: "C. 海拔較高，寒冷乾燥，降水缺乏", basket: "我國西北部" },
          { label: "D. 地勢平坦，溫暖多雨，交通發達", basket: "我國東南部" }
        ],
        answer: "我國西北部：A、C ｜ 我國東南部：B、D"
      },
      {
        id: "hum_u8_10", unitKey: "hum_u8", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【地區物產與環境分類】請將以下物產放入我國四大地區分類籃：",
        baskets: ["我國北部", "我國南部", "我國西部", "我國東部"],
        items: [
          { label: "A. 小麥製品（麵條、饅頭）", basket: "我國北部" },
          { label: "B. 米飯（水稻）", basket: "我國南部" },
          { label: "C. 肉類、奶類和毛皮（畜牧業）", basket: "我國西部" },
          { label: "D. 水產（漁業）", basket: "我國東部" }
        ],
        answer: "北部：A ｜ 南部：B ｜ 西部：C ｜ 東部：D"
      },
      {
        id: "hum_u8_11", unitKey: "hum_u8", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【特色房屋與環境配對分類】請將房屋特點放入對應的傳統建築分類籃：",
        baskets: ["蒙古包", "窰洞", "吊腳樓", "四合院"],
        items: [
          { label: "A. 木柱支撐懸空，適應山坡濕熱，防潮通風", basket: "吊腳樓" },
          { label: "B. 能拆卸隨季節遷徙，抵禦風沙適應遊牧", basket: "蒙古包" },
          { label: "C. 四周房屋圍庭院在中間，適應平原防風防寒", basket: "四合院" },
          { label: "D. 用黃土建構冬暖夏涼，適應乾燥少雨缺木材", basket: "窰洞" }
        ],
        answer: "蒙古包：B ｜ 窰洞：D ｜ 吊腳樓：A ｜ 四合院：C"
      },
      {
        id: "hum_u8_12", unitKey: "hum_u8", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【三大河流特徵分類】請將以下特徵放入對應的河流分類籃：",
        baskets: ["黃河", "長江", "珠江"],
        items: [
          { label: "A. 歷史氾濫約1600次，設調水調沙工程", basket: "黃河" },
          { label: "B. 上游有三峽奇峯，開展《十年禁漁計劃》", basket: "長江" },
          { label: "C. 擁有大片紅樹林濕地，中華白海豚棲息", basket: "珠江" }
        ],
        answer: "黃河：A ｜ 長江：B ｜ 珠江：C"
      },
      {
        id: "hum_u8_13", unitKey: "hum_u8", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【河流危機與生態建設配對】請將生態建設措施放入對應的危機分類籃：",
        baskets: ["治理河水氾濫", "治理水土流失", "治理水污染及生態"],
        items: [
          { label: "A. 植樹造林及修建梯田", basket: "治理水土流失" },
          { label: "B. 推動大型水利工程（如調水調沙）", basket: "治理河水氾濫" },
          { label: "C. 立法限制排污、設污水廠及禁捕政策", basket: "治理水污染及生態" }
        ],
        answer: "河水氾濫：B ｜ 水土流失：A ｜ 水污染及生態：C"
      },

      // U8 簡答題 (#14 ~ #18)
      {
        id: "hum_u8_14", unitKey: "hum_u8", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】為什麼我國超過九成的人口都選擇居住在東南部，而西北部人口卻非常稀少？",
        options: [
          "西北部地勢高、山勢陡峭且寒冷乾燥，不利農業與交通；東南部多平原、氣候溫和、雨水充足，有利農業、交通及生活。",
          "因為西北部全部是海洋，而東南部全部是高山。",
          "因為政府規定人民只能居住在東南部。",
          "因為西北部氣溫全年高達 50°C，沒有任何植物。"
        ],
        answer: "因為西北部地勢高、山勢陡峭，限制了農業與交通發展，且氣候寒冷乾燥，不適合居住；而東南部多平原、氣候溫和、雨水充足，有利於農業、交通及人類生活。"
      },
      {
        id: "hum_u8_15", unitKey: "hum_u8", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】為什麼我國會有「北方人吃麵食，南方人吃米食」的差異？",
        options: [
          "因為北方氣候較乾旱，適合小麥生長（製成麵條、饅頭）；南方氣候溫暖潮濕，適合水稻生長（加工成米飯）。",
          "因為北方沒有河流，南方沒有土地。",
          "因為北方人不懂煮米飯，南方人不懂做麵條。",
          "這只是隨機習慣，與氣候和農作物完全無關。"
        ],
        answer: "因為北方氣候較乾旱，適合小麥生長，小麥加工後會製成麵條、饅頭等主食；南方氣候溫暖潮濕，適合水稻生長，加工後成為米飯。"
      },
      {
        id: "hum_u8_16", unitKey: "hum_u8", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】河流對我國人民的生活發揮了哪些重要作用？（請舉出六項）",
        options: [
          "(1)灌溉農作物；(2)水路運輸；(3)水力發電；(4)日常生活飲用；(5)工業生產；(6)捕食及養殖水產。",
          "(1)製造沙漠；(2)引發地震；(3)阻斷交通；(4)增加溫室效應；(5)排走空氣；(6)製造火山。",
          "河流只有觀賞作用，對農業、工業與運輸沒有任何幫助。",
          "河流只用於冬季溜冰及開採煤炭。"
        ],
        answer: "(1) 灌溉農作物；(2) 水路運輸；(3) 水力發電；(4) 日常生活飲用；(5) 工業生產；(6) 捕食及養殖水產。"
      },
      {
        id: "hum_u8_17", unitKey: "hum_u8", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】河流流域的「水土流失」危機是由什麼原因造成的？國家採取了什麼措施治理，並取得了什麼成就？",
        options: [
          "原因：過度開墾和過度伐木令土壤貧瘠鬆散。措施與成就：利用植樹和修建梯田減少侵蝕，平均每年減少土壤流失達16億噸。",
          "原因：魚類太多。措施：把所有河水抽乾，每年增加沙漠面積。",
          "原因：降雨太少。措施：把山坡全部鋪上塑膠布。",
          "原因：船隻行駛太快。措施：禁止所有船隻航行。"
        ],
        answer: "原因：流域過度開墾（非法開墾農地）和過度伐木，導致土地衰竭，土壤變得貧瘠鬆散。措施與成就：國家利用植樹和修建梯田減少侵蝕，平均每年減少土壤流失達16億噸。"
      },
      {
        id: "hum_u8_18", unitKey: "hum_u8", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】為什麼保護水資源對我國的「國家安全（生態安全）」非常重要？",
        options: [
          "因為水是人類必需品，缺水會嚴重影響民生和經濟；若水資源被濫用或污染，生態環境便會被破壞，故必須確保水資源安全。",
          "因為水資源可以代替石油直接作為汽車燃料。",
          "因為只要有水資源就不需要發展農業和工業。",
          "保護水資源只為了讓風景更好看，與民生經濟無關。"
        ],
        answer: "因為水是人類的必需品，水資源缺乏會嚴重影響社會民生和經濟發展；若水資源被濫用或污染，國家的生態環境便會被破壞，因此必須確保水資源安全以維護生態安全。"
      },

      // U8 看圖填充題 (#19 ~ #22)
      {
        id: "hum_u8_19", unitKey: "hum_u8", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u8_yurt_grassland",
        prompt: "我國西部草原地區盛產 ________（物產），當地牧民多居住在方便拆卸遷徙的 ________（房屋）。",
        blanks: ["肉類", "蒙古包"], distractors: ["水產", "吊腳樓", "四合院"]
      },
      {
        id: "hum_u8_20", unitKey: "hum_u8", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u8_river_uses",
        prompt: "這幅圖顯示河流具有水力 ________、水路 ________ 以及農業 ________ 的重要功能。",
        blanks: ["發電", "運輸", "灌溉"], distractors: ["開墾", "排污", "伐木"]
      },
      {
        id: "hum_u8_21", unitKey: "hum_u8", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u8_terraces",
        prompt: "圖中展示我國青海省利用修建 ________ 的方法，有效治理 ________ 的生態危機。",
        blanks: ["梯田", "水土流失"], distractors: ["魚塘", "空氣污染", "溫室效應"]
      },
      {
        id: "hum_u8_22", unitKey: "hum_u8", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u8_stilt_house",
        prompt: "這種特色房屋稱為 ________，能適應南方山坡、河谷及濕熱的天氣，具有 ________ 通風的作用。",
        blanks: ["吊腳樓", "防潮"], distractors: ["窰洞", "保暖", "防風沙"]
      },

      // U8 選擇題 (#23 ~ #27)
      {
        id: "hum_u8_23", unitKey: "hum_u8", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "以下哪一項關於「黑河—騰衝線」的描述是正確的？",
        options: [
          "A. 線的西北部面積較小，但人口密度最高",
          "B. 線的東南部面積約佔全國43.8%，卻居住了超過九成的人口",
          "C. 這條線將我國分為南方和北方兩個面積相等的區域",
          "D. 線的西北部地勢平坦、雨水充足"
        ],
        answer: "B. 線的東南部面積約佔全國43.8%，卻居住了超過九成的人口"
      },
      {
        id: "hum_u8_24", unitKey: "hum_u8", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "為了保護黃河、長江和瀾滄江三大河流的源頭，我國在青藏高原設立了什麼保護區？",
        options: ["A. 珠江濕地自然保護區", "B. 黃土高原林木栽植區", "C. 三江源自然保護區及三江源國家公園", "D. 長江三峽國家公園"],
        answer: "C. 三江源自然保護區及三江源國家公園"
      },
      {
        id: "hum_u8_25", unitKey: "hum_u8", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "以下哪一項描述是不正確的？",
        options: [
          "A. 青藏高原是黃河和珠江的發源地",
          "B. 黃河流經黃土高原時帶走大量泥沙，令河水變黃",
          "C. 長江三峽兩岸滿佈奇峯和古蹟，是著名的旅遊景點",
          "D. 黃河是我國歷史上氾濫次數最多的河流之一"
        ],
        answer: "A. 青藏高原是黃河和珠江的發源地"
      },
      {
        id: "hum_u8_26", unitKey: "hum_u8", qCategory: "hum_mcq", type: "multi_mcq", typeLabel: "選擇題(可多選)",
        prompt: "針對家居、工業、農業污水流入河道，以及水產過度捕撈的問題，國家採取了什麼措施？（可選多於一項）",
        options: ["A. 立法限制水污染", "B. 設立污水處理廠淨化水質", "C. 開展《長江十年禁漁計劃》等禁捕政策", "D. 填平河道改建為農地"],
        answers: ["A. 立法限制水污染", "B. 設立污水處理廠淨化水質", "C. 開展《長江十年禁漁計劃》等禁捕政策"],
        answer: "A、B、C"
      },
      {
        id: "hum_u8_27", unitKey: "hum_u8", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "北京等北方平原地區常見的傳統建築「四合院」，具有什麼建築特點？",
        options: [
          "A. 在黃土山坡挖掘洞穴而成",
          "B. 四周建有房屋，將庭院圍在中間，能防風和防寒",
          "C. 用竹木搭建在水面上",
          "D. 用毛氈覆蓋，方便隨時拆走"
        ],
        answer: "B. 四周建有房屋，將庭院圍在中間，能防風和防寒"
      },

      // U8 問答題(情境題) (#28 ~ #30)
      {
        id: "hum_u8_28", unitKey: "hum_u8", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
        prompt: "【時事情境】新聞報道：「受持續暴雨影響，全國27條河流出現超警戒水位洪水，南方多地受災，張家界市有人被洪水沖走。當地出動武警防洪，國家緊急調運八萬多件救災物資到災區。」(1) 暴雨引發什麼災害與後果？ (2) 政府採取了什麼即時應對措施？",
        options: [
          "(1) 引發河水氾濫（洪水），導致財物損失及人命傷亡。(2) 出動武警防洪救援，並緊急調運帳篷、摺牀等救災物資到災區。",
          "(1) 引發嚴重乾旱。(2) 進行人工增雨並關閉所有水庫。",
          "(1) 引發沙塵暴。(2) 要求居民搬往蒙古包居住。",
          "(1) 引發地震。(2) 實施十年禁漁計劃。"
        ],
        answer: "(1) 引發了河水氾濫（洪水／水災）；導致南方多地受災、財物損失，甚至造成人命傷亡。(2) 政府出動武警人員防洪救援，並由國家糧食和物資儲備局緊急調運帳篷、摺牀、夏涼被等救災物資到受災地區。"
      },
      {
        id: "hum_u8_29", unitKey: "hum_u8", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
        prompt: "【承上題情境】從長遠來看，國家及河流附近的居民有什麼方法可以預防及減低「河水氾濫」帶來的危機？",
        options: [
          "國家：推動大型水利工程（興建水壩、調水調沙）及植樹造林保持水土。居民：留意水位預警、暴雨遠離河道、配合疏散及不非法開墾。",
          "國家：把所有河流填平變成公路。居民：在河牀正中央建造房屋。",
          "國家：砍伐河岸所有樹木。居民：把垃圾倒入河中阻擋水流。",
          "河水氾濫完全無法預防，不需要採取任何長遠措施。"
        ],
        answer: "國家層面：推動大型水利工程（如興建水壩、調水調沙工程）及植樹造林保持水土，降低大規模氾濫風險。居民層面：留意天氣及水位預警，在暴雨期間遠離河道，配合政府的防洪疏散指示，並保護河岸植被不非法開墾。"
      },
      {
        id: "hum_u8_30", unitKey: "hum_u8", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
        prompt: "【情境】假設你要到內蒙古草原及陝西黃土高原進行考察，你會分別看到當地居民居住在什麼傳統特色房屋？為什麼他們會建造這樣的房屋？",
        options: [
          "內蒙古草原：蒙古包（適應草原遊牧，方便拆卸遷徙並抵禦風沙）；黃土高原：窰洞（氣候乾燥少雨且缺木材，利用深厚黃土就地取材，冬暖夏涼）。",
          "內蒙古草原：吊腳樓（防潮通風）；黃土高原：四合院（適應多雨氣候）。",
          "兩地居民都居住在竹木搭建的水上棚屋。",
          "內蒙古草原：窰洞；黃土高原：蒙古包。"
        ],
        answer: "在內蒙古草原會看到蒙古包，因為當地人過着草原遊牧生活，蒙古包方便拆卸隨季節遷徙，又能抵禦風沙；在黃土高原會看到窰洞，因為當地氣候乾燥少雨且缺少木材，利用深厚的黃土建構窰洞可以就地取材，而且冬暖夏涼。"
      },

      // ==================== 第四部分：U9 文化遺產 (30題) ====================
      { id: "hum_u9_01", unitKey: "hum_u9", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "我國是一個多民族的國家，共有 ________ 個民族，其中 ________ 族人口超過九成，其餘 ________ 個為少數民族。", blanks: ["56", "漢", "55"], distractors: ["50", "滿", "49"] },
      { id: "hum_u9_02", unitKey: "hum_u9", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "我國少數民族的主要聚居地包括五個自治區：新疆維吾爾自治區、________ 自治區、________ 自治區、寧夏回族自治區、________ 壯族自治區，以及多民族聚居的 ________ 省。", blanks: ["內蒙古", "西藏", "廣西", "雲南"], distractors: ["廣東", "四川", "青海"] },
      { id: "hum_u9_03", unitKey: "hum_u9", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "各少數民族聚居的地方實行 ________ 制度，以促進民族平等、團結、互助，所有民族自治地方都是中國 ________ 的部分。", blanks: ["區域自治", "不可分離"], distractors: ["獨立管理", "各自發展", "臨時劃分"] },
      { id: "hum_u9_04", unitKey: "hum_u9", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "蒙古族使用 ________ 文，傳統飲食有烤全羊和 ________，重要傳統活動是「________ 大會」。", blanks: ["蒙古", "乾奶酪", "那達慕"], distractors: ["東巴", "麗江粑粑", "潑水"] },
      { id: "hum_u9_05", unitKey: "hum_u9", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "雲南省納西族使用獨特的 ________ 文，特色食物有麗江粑粑和 ________，傳統節日是祭祀民族保護神的「________ 節」。", blanks: ["東巴", "雞豆涼粉", "三多"], distractors: ["蒙古", "乾奶酪", "火把"] },
      { id: "hum_u9_06", unitKey: "hum_u9", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "位於西藏拉薩市的 ________ 歷史建築羣，是藏傳佛教聖地；位於四川省的 ________ 大佛，建於唐朝，是世界最大的石刻佛像。", blanks: ["布達拉宮", "樂山"], distractors: ["明十三陵", "開平", "花山"] },
      { id: "hum_u9_07", unitKey: "hum_u9", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "廣東省開平市的 ________ 是1920至1930年代華僑為防禦土匪而建，具中西合璧風格；廣西崇左市的 ________ 則是壯族祖先以紅色顏料繪畫的崖壁畫。", blanks: ["開平碉樓", "花山岩畫"], distractors: ["布達拉宮", "樂山大佛", "莫高窟"] },
      { id: "hum_u9_08", unitKey: "hum_u9", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "國家積極向聯合國教科文組織申報，把文化遺產列入《________ 名錄》，並訂立《________ 法》等法律保護歷史古蹟。", blanks: ["世界遺產", "文物保護"], distractors: ["自然公園", "城市規劃", "旅遊發展"] },

      // U9 分類題 (#9 ~ #13) -> 分類籃
      {
        id: "hum_u9_09", unitKey: "hum_u9", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【少數民族服飾配對分類】請將傳統服飾放入對應的少數民族分類籃：",
        baskets: ["苗族", "維吾爾族", "蒙古族", "彝族", "藏族"],
        items: [
          { label: "A. 刺繡和精緻銀飾（保平安）", basket: "苗族" },
          { label: "B. 花帽和長袍", basket: "維吾爾族" },
          { label: "C. 蒙古袍", basket: "蒙古族" },
          { label: "D. 帽子和披風", basket: "彝族" },
          { label: "E. 藏袍和項鍊", basket: "藏族" }
        ],
        answer: "苗族：A ｜ 維吾爾族：B ｜ 蒙古族：C ｜ 彝族：D ｜ 藏族：E"
      },
      {
        id: "hum_u9_10", unitKey: "hum_u9", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【少數民族聚居地環境分類】請將地理與氣候特徵放入對應地區分類籃：",
        baskets: ["新疆維吾爾自治區", "西藏自治區", "寧夏回族自治區", "雲南省"],
        items: [
          { label: "A. 高山盆地沙漠為主，夏酷熱冬嚴寒", basket: "新疆維吾爾自治區" },
          { label: "B. 位於青藏高原，氣候高寒，晝夜溫差大", basket: "西藏自治區" },
          { label: "C. 高原沙漠為主，盛產枸杞、葡萄、羊肉", basket: "寧夏回族自治區" },
          { label: "D. 低海拔熱帶雨林、高海拔寒雪，孕育多元民族", basket: "雲南省" }
        ],
        answer: "新疆：A ｜ 西藏：B ｜ 寧夏：C ｜ 雲南：D"
      },
      {
        id: "hum_u9_11", unitKey: "hum_u9", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【少數民族節慶分類】請將節慶活動放入對應的少數民族分類籃：",
        baskets: ["傣族", "彝族", "蒙古族", "納西族"],
        items: [
          { label: "A. 潑水節（互相潑水祈求消災除病）", basket: "傣族" },
          { label: "B. 火把節（點燃營火火把遊行驅邪祈福）", basket: "彝族" },
          { label: "C. 那達慕大會（賽馬、摔跤和射箭比賽）", basket: "蒙古族" },
          { label: "D. 三多節（農曆二月初八祭祀保護神）", basket: "納西族" }
        ],
        answer: "傣族：A ｜ 彝族：B ｜ 蒙古族：C ｜ 納西族：D"
      },
      {
        id: "hum_u9_12", unitKey: "hum_u9", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【文化遺產地點分類】請將四項文化遺產放入所在地區分類籃：",
        baskets: ["西藏自治區", "廣東省", "四川省", "廣西壯族自治區"],
        items: [
          { label: "A. 布達拉宮歷史建築羣", basket: "西藏自治區" },
          { label: "B. 開平碉樓", basket: "廣東省" },
          { label: "C. 峨眉山—樂山大佛", basket: "四川省" },
          { label: "D. 花山岩畫", basket: "廣西壯族自治區" }
        ],
        answer: "西藏：A ｜ 廣東：B ｜ 四川：C ｜ 廣西：D"
      },
      {
        id: "hum_u9_13", unitKey: "hum_u9", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【參觀古蹟行為分類】請將參觀文化遺產時的行為放入對應分類籃：",
        baskets: ["正確保育行為", "破壞文物行為"],
        items: [
          { label: "A. 不觸摸、不攀爬文物", basket: "正確保育行為" },
          { label: "B. 用閃光燈拍攝禁止閃光燈的青花瓷瓶", basket: "破壞文物行為" },
          { label: "C. 聽從導覽員或標示指示", basket: "正確保育行為" },
          { label: "D. 將垃圾丟入分類箱保持整潔", basket: "正確保育行為" },
          { label: "E. 跨越圍欄撫摸古蹟石獅子及古炮台", basket: "破壞文物行為" }
        ],
        answer: "正確保育：A、C、D ｜ 破壞文物：B、E"
      },

      // U9 簡答題 (#14 ~ #18)
      {
        id: "hum_u9_14", unitKey: "hum_u9", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】少數民族的傳統服飾除了美觀和代表民族身份外，還有什麼實際功能？（可結合聚居地環境說明）",
        options: [
          "具有適應當地氣候環境和生活方式的實用功能，例如蒙古袍和藏袍能抵禦高原與草原的嚴寒及晝夜溫差；苗族銀飾則被視為保平安。",
          "只為了在舞台上表演，日常生活中完全不能穿戴。",
          "所有少數民族服飾都是為了潛水及水上活動而設計。",
          "傳統服飾沒有任何保暖或實用功能。"
        ],
        answer: "具有適應當地氣候環境和生活方式的實用功能，例如蒙古袍和藏袍能抵禦高原與草原的嚴寒及巨大晝夜溫差；苗族銀飾則被視為有保平安的作用。"
      },
      {
        id: "hum_u9_15", unitKey: "hum_u9", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】什麼是「民族團結」？我國實行區域自治制度有什麼目的？",
        options: [
          "民族團結：各民族友好相處、互相尊重包容幫助，齊心維護國家統一。自治制度目的：促進民族平等、團結、互助，鞏固國家統一。",
          "民族團結指所有民族必須放棄自己的語言和節日。自治目的是讓各區互不往來。",
          "民族團結只適用於漢族，不包括少數民族。",
          "區域自治制度只是為了發展旅遊業，與民族平等無關。"
        ],
        answer: "民族團結：一方面指各民族之間友好相處，互相尊重、包容、接納和幫助；另一方面指各民族內部團結，齊心協力維護國家統一。自治制度目的：促進民族平等、團結、互助，並鞏固國家統一。"
      },
      {
        id: "hum_u9_16", unitKey: "hum_u9", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】為什麼不同少數民族在飲食、文字和風俗上會有各自獨特的生活方式？",
        options: [
          "因為各民族居住地區的地理環境、氣候、歷史文化和資源條件都不相同，因而孕育出多姿多彩的生活方式。",
          "因為各民族每年抽籤決定自己的飲食和文字。",
          "因為所有少數民族都居住在完全相同的沙漠環境。",
          "這與地理環境、氣候和歷史文化完全無關。"
        ],
        answer: "因為各民族居住地區的地理環境、氣候、歷史文化和資源條件都不相同，因而孕育出多姿多彩的生活方式。"
      },
      {
        id: "hum_u9_17", unitKey: "hum_u9", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】什麼是「文化遺產」？我國政府在保育文化遺產方面採取了哪兩大類措施？",
        options: [
          "定義：從歷史、藝術或科學角度看具突出普遍價值的文物、建築和遺址。措施：(1)法律與政策保護（申報世遺、訂立《文物保護法》）；(2)修復與維護工程。",
          "定義：現代新建的大型購物商場。措施：全部拆卸重建為玻璃大廈。",
          "定義：只有外國才有的古蹟。措施：禁止任何市民參觀。",
          "定義：天然形成的雨水。措施：不作任何維修任由風化。"
        ],
        answer: "定義：指從歷史、藝術或科學角度看，具有突出普遍價值的文物、建築和遺址。國家措施：(1) 利用法律與政策保護（申報世界遺產名錄、訂立《文物保護法》）；(2) 進行修復與維護工程（保留原有風格下解決結構老化和防災問題）。"
      },
      {
        id: "hum_u9_18", unitKey: "hum_u9", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】作為普通市民和學生，我們在參觀古蹟和博物館時，應該遵守哪三項基本守則來保護文化遺產？",
        options: [
          "(1) 不觸摸、不攀爬文物；(2) 聽從導覽員或標示指示（如不使用閃光燈）；(3) 保持環境整潔，不亂拋垃圾。",
          "(1) 跨越圍欄拍照；(2) 開啟閃光燈近距離拍攝；(3) 在古蹟牆上刻字留念。",
          "(1) 把文物帶回家研究；(2) 在展館內追逐飲食；(3) 攀爬石獅子。",
          "參觀時不需要遵守任何規則。"
        ],
        answer: "(1) 不觸摸、不攀爬文物；(2) 聽從導覽員或標示指示（如不使用閃光燈）；(3) 保持環境整潔，不亂拋垃圾。"
      },

      // U9 看圖填充題 (#19 ~ #22)
      {
        id: "hum_u9_19", unitKey: "hum_u9", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u9_uyghur_boy",
        prompt: "圖中頭戴花帽、身穿長袍、住在新疆並多吃牛羊肉的男孩屬於 ________ 族。",
        blanks: ["維吾爾"], distractors: ["苗", "傣", "納西"]
      },
      {
        id: "hum_u9_20", unitKey: "hum_u9", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u9_miao_girl",
        prompt: "圖中頭戴精緻銀冠和銀項圈、相信銀器有保平安作用的女孩屬於 ________ 族。",
        blanks: ["苗"], distractors: ["蒙古", "維吾爾", "藏"]
      },
      {
        id: "hum_u9_21", unitKey: "hum_u9", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u9_potala_palace",
        prompt: "這項文化遺產是位於西藏拉薩市的 ________，是藏傳佛教聖地。",
        blanks: ["布達拉宮歷史建築羣"], distractors: ["開平碉樓", "樂山大佛", "花山岩畫"]
      },
      {
        id: "hum_u9_22", unitKey: "hum_u9", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u9_museum_flash",
        prompt: "圖中男遊客的行為是 ________（正確／不正確）的，因為他沒有 ________ 標示的指示，強光會損害文物。",
        blanks: ["不正確", "聽從"], distractors: ["正確", "違反", "忽略"]
      },

      // U9 選擇題 (#23 ~ #27)
      {
        id: "hum_u9_23", unitKey: "hum_u9", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "以下哪個地方以「高原為主，地勢平坦開闊，擁有寬廣草原，適合放牧生活方式」而聞名？",
        options: ["A. 新疆維吾爾自治區", "B. 內蒙古自治區", "C. 廣西壯族自治區", "D. 雲南省"],
        answer: "B. 內蒙古自治區"
      },
      {
        id: "hum_u9_24", unitKey: "hum_u9", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "每年四月（傣曆新年）舉行的「潑水節」是哪個少數民族的盛大節日？",
        options: ["A. 彝族", "B. 納西族", "C. 傣族", "D. 藏族"],
        answer: "C. 傣族"
      },
      {
        id: "hum_u9_25", unitKey: "hum_u9", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "關於雲南省納西族所使用的「東巴文」，以下哪項描述是正確的？",
        options: ["A. 它是一種拼音字母文字", "B. 它是一種圖畫象形文字，常刻畫在石頭或木紙上", "C. 它是蒙古族的傳統文字", "D. 它只用於現代電腦編程"],
        answer: "B. 它是一種圖畫象形文字，常刻畫在石頭或木紙上"
      },
      {
        id: "hum_u9_26", unitKey: "hum_u9", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "以下哪一項文化遺產是由華僑在1920至1930年代為了防禦土匪而建，並具有中西合璧的建築風格？",
        options: ["A. 北京明十三陵", "B. 四川樂山大佛", "C. 廣東開平碉樓", "D. 廣西花山岩畫"],
        answer: "C. 廣東開平碉樓"
      },
      {
        id: "hum_u9_27", unitKey: "hum_u9", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "我國對北京故宮等古蹟進行修復與維護工程時，會遵循什麼重要原則？",
        options: [
          "A. 全部拆卸並改建成現代化玻璃大廈",
          "B. 在保留原有建築風格的前提下，重點解決結構老化和防災等問題",
          "C. 任由古蹟自然風化，完全不作任何維修",
          "D. 把古蹟塗上鮮艷的現代油漆"
        ],
        answer: "B. 在保留原有建築風格的前提下，重點解決結構老化和防災等問題"
      },

      // U9 問答題(情境題) (#28 ~ #30)
      {
        id: "hum_u9_28", unitKey: "hum_u9", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
        prompt: "【情境】在博物館參觀時，你看到一個小男孩無視「請勿觸摸」的告示牌，伸手去摸古代大炮的木輪。(1) 男孩子的行為正確嗎？為什麼？ (2) 看到這個情況，你會怎樣做？",
        options: [
          "(1) 不正確，觸摸文物會加速文物損壞或老化。(2) 上前有禮貌地勸阻，提醒他看告示牌，或通知工作人員處理。",
          "(1) 正確，親手摸過才能學到歷史。(2) 跟他一起排隊觸摸大炮。",
          "(1) 不正確。(2) 大聲責罵並推開他。",
          "(1) 正確。(2) 用閃光燈幫他拍照留念。"
        ],
        answer: "(1) 不正確。因為他沒有遵守博物館的標示指示，觸摸文物會加速文物損壞或老化。(2) 我會立即上前有禮貌地勸阻他，提醒他看「請勿觸摸」的告示牌，或通知博物館工作人員處理，因為保護文化遺產是我們應有的責任。"
      },
      {
        id: "hum_u9_29", unitKey: "hum_u9", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
        prompt: "【情境】學校舉辦「少數民族節日嘉年華」，有同學看到少數民族的傳統服飾和風俗跟自己平時的生活習慣很不一樣，便在旁取笑他們奇怪。你會怎樣勸導這位同學？",
        options: [
          "告訴他我國是多民族國家，各民族因地理和歷史不同而發展出獨特文化；我們應尊重、包容和欣賞不同民族文化，促進民族團結。",
          "認同他的說法，並一起取笑少數民族的服飾。",
          "叫他不要出聲，但心裡也覺得少數民族風俗很奇怪。",
          "要求學校取消嘉年華活動。"
        ],
        answer: "我會告訴他我國是一個多民族國家，各民族因地理環境和歷史不同而發展出獨特的文化。我們應該尊重、包容和欣賞不同民族的傳統文化與生活差異，這樣才能促進民族團結與和諧。"
      },
      {
        id: "hum_u9_30", unitKey: "hum_u9", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
        prompt: "【情境】外國朋友來中國旅遊，想參觀一處既能體驗少數民族宗教文化、又能欣賞宏偉古代建築的世界文化遺產。你會向他推薦課本中的哪一個景點？並提醒他參觀注意事項。",
        options: [
          "推薦：西藏拉薩「布達拉宮歷史建築羣」（藏傳佛教聖地，保存珍貴佛經壁畫）。注意：尊重宗教文化、不觸摸攀爬文物、聽從指示及保持整潔。",
          "推薦：現代大型主題樂園。注意：可以隨意攀爬及塗鴉。",
          "推薦：珠江紅樹林濕地。注意：可以使用閃光燈捕捉候鳥。",
          "推薦：一般城市商場。注意：不需要遵守任何守則。"
        ],
        answer: "推薦景點：拉薩布達拉宮歷史建築羣（位於西藏自治區拉薩市，是藏傳佛教聖地，保存大量珍貴佛經、壁畫和佛像）。參觀注意事項：尊重當地宗教文化，不觸摸及不攀爬文物，聽從導覽員或標示指示，並保持環境整潔。"
      }
    ]
  };
})();
