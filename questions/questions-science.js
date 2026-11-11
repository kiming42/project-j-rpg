/* ============================================================================
 * 科學科獨立題庫 (questions/questions-science.js - v6.4)
 * 完整收錄：第2課 青春期的變化 (30題)、第3課 應對青春期 (30題)、
 *           第8課 觀測天氣 (30題)、第9課 探索地貌 (30題)，合共 120 題。
 * 題型涵蓋：填充題、選擇題、分類題(分類籃)、簡答題、看圖填充題(教科書有機向量圖)、情境題。
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.QuestionBank = window.Aetheria.QuestionBank || {};

(function() {
  // 教科書風格有機曲線向量插畫庫 (參考附圖：柔和放射漸層、解剖/自然曲線、綠色指引線)
  const SCI_DIAGRAMS = {
    // 第2課 #25：男性的生殖系統結構簡圖 (完美還原附圖風格)
    sci_l2_male_repro: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 165">
      <defs>
        <radialGradient id="maleBg" cx="48%" cy="48%" r="52%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="68%" stop-color="#e1f5fe"/>
          <stop offset="100%" stop-color="#b3e5fc"/>
        </radialGradient>
      </defs>
      <rect width="280" height="165" rx="12" fill="url(#maleBg)"/>
      <!-- 身體側面有機解剖輪廓 -->
      <path d="M88,12 C125,8 188,18 202,48 C212,72 208,118 195,152 L118,152 L118,122 C116,136 96,136 92,120 C88,104 96,86 102,82 C92,86 84,112 74,122 C64,130 54,122 58,108 C64,86 76,68 88,62 Z" fill="#f8bbd0" opacity="0.65" stroke="#d81b60" stroke-width="1.5"/>
      <!-- 膀胱 (黃色有機囊狀) 與尿道 -->
      <path d="M112,32 C112,18 164,20 166,42 C168,62 152,74 142,76 C130,74 112,54 112,32 Z" fill="#fff176" stroke="#fbc02d" stroke-width="1.8"/>
      <path d="M142,76 C140,86 132,92 115,92 C92,92 74,104 64,124" fill="none" stroke="#fdd835" stroke-width="3" stroke-linecap="round"/>
      <!-- 輸精管 (紅色弧線繞過膀胱上方) -->
      <path d="M112,112 C116,86 100,48 106,26 C114,10 168,12 174,36 C178,54 158,76 142,84" fill="none" stroke="#e57373" stroke-width="2.5" stroke-linecap="round"/>
      <!-- 陰囊與睾丸 (粉紅橢圓核) -->
      <path d="M96,102 C88,118 96,136 112,134 C126,132 128,112 118,100" fill="#f48fb1" stroke="#c2185b" stroke-width="1.8"/>
      <ellipse cx="109" cy="116" rx="10" ry="13" fill="#ec407a" stroke="#ad1457" stroke-width="1.5"/>
      <!-- 綠色教科書指引線與標籤框 -->
      <line x1="106" y1="36" x2="18" y2="22" stroke="#66bb6a" stroke-width="2.2"/>
      <line x1="76" y1="92" x2="18" y2="82" stroke="#66bb6a" stroke-width="2.2"/>
      <line x1="109" y1="118" x2="196" y2="128" stroke="#66bb6a" stroke-width="2.2"/>
      <rect x="8" y="10" width="72" height="20" rx="4" fill="#ffffff" stroke="#66bb6a" stroke-width="1.5"/>
      <text x="44" y="24" font-size="10" font-weight="bold" fill="#1b5e20" text-anchor="middle">輸送：？</text>
      <rect x="8" y="70" width="72" height="20" rx="4" fill="#ffffff" stroke="#66bb6a" stroke-width="1.5"/>
      <text x="44" y="84" font-size="10" font-weight="bold" fill="#1b5e20" text-anchor="middle">排出：？</text>
      <rect x="192" y="116" width="80" height="20" rx="4" fill="#ffffff" stroke="#66bb6a" stroke-width="1.5"/>
      <text x="232" y="130" font-size="10" font-weight="bold" fill="#1b5e20" text-anchor="middle">製造精子：？</text>
      <rect x="68" y="140" width="144" height="20" rx="6" fill="#81d4fa"/>
      <text x="140" y="154" font-size="11" font-weight="bold" fill="#141013" text-anchor="middle">男性的生殖系統結構簡圖</text>
    </svg>`,

    // 第2課 #26：女性的生殖系統結構簡圖
    sci_l2_female_repro: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 165">
      <defs>
        <radialGradient id="femBg" cx="50%" cy="48%" r="52%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="70%" stop-color="#fce4ec"/>
          <stop offset="100%" stop-color="#f8bbd0"/>
        </radialGradient>
      </defs>
      <rect width="280" height="165" rx="12" fill="url(#femBg)"/>
      <!-- 輸卵管對稱有機曲線 -->
      <path d="M116,52 C92,38 68,46 66,66 C66,76 76,82 84,76 C80,64 94,54 116,60" fill="#f48fb1" stroke="#c2185b" stroke-width="2"/>
      <path d="M164,52 C188,38 212,46 214,66 C214,76 204,82 196,76 C200,64 186,54 164,60" fill="#f48fb1" stroke="#c2185b" stroke-width="2"/>
      <!-- 左右卵巢 (鵝蛋形) -->
      <ellipse cx="86" cy="76" rx="12" ry="8" fill="#ffcc80" stroke="#ef6c00" stroke-width="2"/>
      <ellipse cx="194" cy="76" rx="12" ry="8" fill="#ffcc80" stroke="#ef6c00" stroke-width="2"/>
      <!-- 子宮 (倒梨形有機腔體) 與陰道 -->
      <path d="M112,50 C124,42 156,42 168,50 C172,72 156,96 148,108 L148,136 L132,136 L132,108 C124,96 108,72 112,50 Z" fill="#f06292" stroke="#ad1457" stroke-width="2"/>
      <path d="M124,58 C132,54 148,54 156,58 C154,76 146,92 140,102 C134,92 126,76 124,58 Z" fill="#fce4ec"/>
      <!-- 綠色教科書指引線 -->
      <line x1="88" y1="48" x2="38" y2="26" stroke="#66bb6a" stroke-width="2.2"/>
      <line x1="86" y1="76" x2="38" y2="96" stroke="#66bb6a" stroke-width="2.2"/>
      <line x1="145" y1="74" x2="218" y2="74" stroke="#66bb6a" stroke-width="2.2"/>
      <rect x="6" y="12" width="76" height="20" rx="4" fill="#ffffff" stroke="#66bb6a" stroke-width="1.5"/>
      <text x="44" y="26" font-size="10" font-weight="bold" fill="#1b5e20" text-anchor="middle">輸送卵子：？</text>
      <rect x="6" y="86" width="76" height="20" rx="4" fill="#ffffff" stroke="#66bb6a" stroke-width="1.5"/>
      <text x="44" y="100" font-size="10" font-weight="bold" fill="#1b5e20" text-anchor="middle">排出卵子：？</text>
      <rect x="196" y="64" width="78" height="20" rx="4" fill="#ffffff" stroke="#66bb6a" stroke-width="1.5"/>
      <text x="235" y="78" font-size="10" font-weight="bold" fill="#1b5e20" text-anchor="middle">孕育胎兒：？</text>
      <rect x="68" y="140" width="144" height="20" rx="6" fill="#f48fb1"/>
      <text x="140" y="154" font-size="11" font-weight="bold" fill="#141013" text-anchor="middle">女性的生殖系統結構簡圖</text>
    </svg>`,

    // 第2課 #27：左圖男孩照鏡噴髮膠整理髮型、右圖女孩對爸爸說自己上學
    sci_l2_psych_traits: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#fff8e1"/>
      <line x1="140" y1="10" x2="140" y2="140" stroke="#d7ccc8" stroke-width="2" stroke-dasharray="4,3"/>
      <!-- 左：男孩照鏡噴髮膠 -->
      <path d="M18,28 L52,28 L52,115 L18,115 Z" fill="#e1f5fe" stroke="#0288d1" stroke-width="2.5"/>
      <path d="M78,56 C78,38 108,38 108,56 C108,72 78,72 78,56 Z" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2"/>
      <path d="M74,48 C78,30 110,30 112,48 Z" fill="#3e2723"/>
      <path d="M114,68 L124,68 L124,90 L114,90 Z" fill="#29b6f6" stroke="#01579b" stroke-width="1.5"/>
      <path d="M112,68 L98,56 M112,72 L98,64" stroke="#81d4fa" stroke-width="2" stroke-dasharray="2,2"/>
      <text x="70" y="136" font-size="11" font-weight="bold" fill="#01579b" text-anchor="middle">(左) 噴髮膠整理髮型</text>
      <!-- 右：女孩背書包對爸爸揮手說自己上學 -->
      <path d="M168,58 C168,42 194,42 194,58 L202,118 L160,118 Z" fill="#f48fb1" stroke="#ad1457" stroke-width="2"/>
      <rect x="150" y="14" width="120" height="24" rx="5" fill="#ffffff" stroke="#ad1457" stroke-width="1.5"/>
      <text x="210" y="30" font-size="10" font-weight="bold" fill="#880e4f" text-anchor="middle">「我自己上學就可以了」</text>
      <text x="210" y="136" font-size="11" font-weight="bold" fill="#880e4f" text-anchor="middle">(右) 不需父母接送</text>
    </svg>`,

    // 第3課 #25：健康飲食金字塔 (四層結構)
    sci_l3_food_pyramid: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#f1f8e9"/>
      <!-- 金字塔四層梯形 -->
      <polygon points="140,12 168,42 112,42" fill="#ffcdd2" stroke="#c62828" stroke-width="2"/>
      <polygon points="112,42 168,42 196,74 84,74" fill="#fff9c4" stroke="#fbc02d" stroke-width="2"/>
      <polygon points="84,74 196,74 224,108 56,108" fill="#c8e6c9" stroke="#388e3c" stroke-width="2"/>
      <polygon points="56,108 224,108 252,142 28,142" fill="#ffe0b2" stroke="#ef6c00" stroke-width="2"/>
      <line x1="140" y1="42" x2="140" y2="108" stroke="#558b2f" stroke-width="1.5" stroke-dasharray="3,2"/>
      <!-- 層級標示 -->
      <text x="140" y="36" font-size="10" font-weight="bold" fill="#b71c1c" text-anchor="middle">頂層：吃最少</text>
      <text x="140" y="62" font-size="10" font-weight="bold" fill="#f57f17" text-anchor="middle">第三層：吃適量 (奶/肉魚蛋)</text>
      <text x="140" y="95" font-size="11" font-weight="bold" fill="#1b5e20" text-anchor="middle">第二層：多吃些 (？及？)</text>
      <text x="140" y="130" font-size="11" font-weight="bold" fill="#e65100" text-anchor="middle">最底層：吃最多 (？)</text>
    </svg>`,

    // 第3課 #26：左圖打乒乓球 vs 右圖跑步
    sci_l3_exercise_intensity: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#e3f2fd"/>
      <line x1="140" y1="12" x2="140" y2="138" stroke="#90caf9" stroke-width="2" stroke-dasharray="4,3"/>
      <!-- 左：打乒乓球 (球桌與球拍曲線) -->
      <path d="M18,98 L122,98 L114,112 L26,112 Z" fill="#1e88e5" stroke="#0d47a1" stroke-width="2"/>
      <line x1="70" y1="88" x2="70" y2="98" stroke="#ffffff" stroke-width="2.5"/>
      <path d="M36,68 C36,52 58,52 58,68 C58,80 48,84 44,92 L38,92 Z" fill="#e53935" stroke="#b71c1c" stroke-width="1.5"/>
      <circle cx="84" cy="74" r="5" fill="#ffb300"/>
      <text x="70" y="34" font-size="11" font-weight="bold" fill="#0d47a1" text-anchor="middle">打乒乓球</text>
      <text x="70" y="50" font-size="10" fill="#1565c0" text-anchor="middle">(仍能說話但不能唱歌)</text>
      <text x="70" y="134" font-size="11" font-weight="bold" fill="#0d47a1" text-anchor="middle">屬於：？強度運動</text>
      <!-- 右：快速跑步 -->
      <path d="M195,52 C195,38 215,38 215,52 C215,64 195,64 195,52 Z" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2"/>
      <path d="M188,68 L222,62 L212,96 L234,114 M198,92 L176,116" fill="none" stroke="#d84315" stroke-width="5" stroke-linecap="round"/>
      <path d="M156,72 L178,72 M152,84 L174,84" stroke="#64b5f6" stroke-width="2.5" stroke-linecap="round"/>
      <text x="210" y="34" font-size="11" font-weight="bold" fill="#bf360c" text-anchor="middle">快速跑步</text>
      <text x="210" y="134" font-size="11" font-weight="bold" fill="#bf360c" text-anchor="middle">屬於：？強度運動</text>
    </svg>`,

    // 第3課 #27：皮膚毛孔與皮脂腺堵塞發炎結構圖
    sci_l3_skin_pore: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#fff3e0"/>
      <!-- 皮膚表皮與真皮層有機剖面 (微隆起代表紅腫發炎) -->
      <path d="M15,48 Q85,48 112,34 Q140,20 168,34 Q195,48 265,48 L265,142 L15,142 Z" fill="#ffccbc" stroke="#d84315" stroke-width="2"/>
      <!-- 毛囊管道與皮脂腺囊 -->
      <path d="M128,28 C126,65 118,98 132,126 C142,134 152,126 150,98 C148,65 146,28 144,28 Z" fill="#fff9c4" stroke="#fbc02d" stroke-width="2"/>
      <!-- 兩側皮脂腺 (分泌過多油脂) -->
      <path d="M124,72 C96,66 88,92 112,98 C120,98 124,90 126,84 Z" fill="#ffd54f" stroke="#f57f17" stroke-width="1.8"/>
      <path d="M148,72 C176,66 184,92 160,98 C152,98 148,90 146,84 Z" fill="#ffd54f" stroke="#f57f17" stroke-width="1.8"/>
      <!-- 毛孔口堵塞硬粒 (黑頭) 與紅腫發炎區 -->
      <ellipse cx="136" cy="30" rx="10" ry="6" fill="#4e342e"/>
      <path d="M108,42 C102,58 108,74 118,78 M164,42 C170,58 164,74 154,78" fill="none" stroke="#e53935" stroke-width="3" stroke-dasharray="4,2"/>
      <!-- 綠色指引線 -->
      <line x1="104" y1="84" x2="52" y2="84" stroke="#66bb6a" stroke-width="2.2"/>
      <line x1="136" y1="30" x2="72" y2="22" stroke="#66bb6a" stroke-width="2.2"/>
      <line x1="166" y1="56" x2="212" y2="56" stroke="#66bb6a" stroke-width="2.2"/>
      <rect x="8" y="10" width="76" height="20" rx="4" fill="#ffffff" stroke="#66bb6a" stroke-width="1.5"/>
      <text x="46" y="24" font-size="10" font-weight="bold" fill="#1b5e20" text-anchor="middle">堵塞形成：？</text>
      <rect x="6" y="74" width="76" height="20" rx="4" fill="#ffffff" stroke="#66bb6a" stroke-width="1.5"/>
      <text x="44" y="88" font-size="10" font-weight="bold" fill="#1b5e20" text-anchor="middle">分泌油脂：？</text>
      <rect x="196" y="46" width="76" height="20" rx="4" fill="#ffffff" stroke="#66bb6a" stroke-width="1.5"/>
      <text x="234" y="60" font-size="10" font-weight="bold" fill="#c62828" text-anchor="middle">細菌感染：？</text>
    </svg>`,

    // 第8課 #25：方向標示圖，綠色箭頭從「東」指向「西」（東風）
    sci_l8_wind_dir: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#e8f5e9"/>
      <!-- 羅盤十字方位座標 -->
      <line x1="140" y1="22" x2="140" y2="128" stroke="#78909c" stroke-width="2"/>
      <line x1="48" y1="75" x2="232" y2="75" stroke="#78909c" stroke-width="2"/>
      <text x="140" y="18" font-size="12" font-weight="bold" fill="#37474f" text-anchor="middle">北 (N)</text>
      <text x="140" y="144" font-size="12" font-weight="bold" fill="#37474f" text-anchor="middle">南 (S)</text>
      <text x="30" y="79" font-size="12" font-weight="bold" fill="#37474f" text-anchor="middle">西 (W)</text>
      <text x="252" y="79" font-size="12" font-weight="bold" fill="#1b5e20" text-anchor="middle">東 (E)</text>
      <!-- 醒目綠色風向大箭頭 (由東吹向西) -->
      <path d="M216,67 L102,67 L102,56 L72,75 L102,94 L102,83 L216,83 Z" fill="#43a047" stroke="#1b5e20" stroke-width="2"/>
      <text x="155" y="54" font-size="11" font-weight="bold" fill="#1b5e20" text-anchor="middle">風吹來的方向（由東吹向西）</text>
    </svg>`,

    // 第8課 #26：香港天文台三個測量儀器：(1)百葉箱 (2)風向儀和風速表 (3)翻斗式雨量器
    sci_l8_weather_instruments: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#e1f5fe"/>
      <!-- (1) 百葉箱 -->
      <path d="M18,42 L82,42 L82,96 L18,96 Z" fill="#ffffff" stroke="#546e7a" stroke-width="2"/>
      <path d="M24,52 L76,52 M24,62 L76,62 M24,72 L76,72 M24,82 L76,82" stroke="#90a4ae" stroke-width="2.5"/>
      <path d="M30,96 L30,122 M70,96 L70,122" stroke="#546e7a" stroke-width="3"/>
      <text x="50" y="32" font-size="11" font-weight="bold" fill="#01579b" text-anchor="middle">(1) 百葉箱</text>
      <text x="50" y="140" font-size="10" font-weight="bold" fill="#0277bd" text-anchor="middle">氣溫和？</text>
      <!-- (2) 風向儀與風杯式風速表 -->
      <line x1="140" y1="42" x2="140" y2="122" stroke="#37474f" stroke-width="3.5"/>
      <path d="M112,52 L168,52 M122,46 L112,52 L122,58" fill="none" stroke="#1e88e5" stroke-width="2.5"/>
      <path d="M116,74 L164,74 M112,70 C106,70 106,78 112,78 Z M168,70 C174,70 174,78 168,78 Z" fill="#ff8f00" stroke="#e65100" stroke-width="1.5"/>
      <text x="140" y="32" font-size="11" font-weight="bold" fill="#01579b" text-anchor="middle">(2) 風向風速儀</text>
      <text x="140" y="140" font-size="10" font-weight="bold" fill="#0277bd" text-anchor="middle">風向和？</text>
      <!-- (3) 翻斗式雨量器 -->
      <path d="M204,48 L256,48 L250,64 L250,120 L210,120 L210,64 Z" fill="#cfd8dc" stroke="#455a64" stroke-width="2"/>
      <path d="M210,50 L230,72 L250,50" fill="none" stroke="#0288d1" stroke-width="2"/>
      <path d="M220,34 L218,44 M232,32 L230,42 M244,34 L242,44" stroke="#29b6f6" stroke-width="2"/>
      <text x="230" y="26" font-size="11" font-weight="bold" fill="#01579b" text-anchor="middle">(3) 雨量器</text>
      <text x="230" y="140" font-size="10" font-weight="bold" fill="#0277bd" text-anchor="middle">測量：？</text>
    </svg>`,

    // 第8課 #27：霧的形成過程 (溫暖潮濕空氣吹過較冷海面與地面，在低空凝結成霧)
    sci_l8_fog_formation: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#cfd8dc"/>
      <!-- 較冷的海面與陸地 -->
      <path d="M0,115 Q70,110 140,118 L140,150 L0,150 Z" fill="#0277bd"/>
      <path d="M135,118 Q200,102 280,108 L280,150 L135,150 Z" fill="#558b2f"/>
      <text x="68" y="138" font-size="11" font-weight="bold" fill="#e1f5fe" text-anchor="middle">較冷的海面</text>
      <text x="212" y="138" font-size="11" font-weight="bold" fill="#f1f8e9" text-anchor="middle">較冷的地面</text>
      <!-- 溫暖潮濕空氣流動箭頭 -->
      <path d="M18,52 C62,48 98,58 132,68" fill="none" stroke="#e53935" stroke-width="3" stroke-linecap="round"/>
      <polygon points="132,68 122,61 124,73" fill="#e53935"/>
      <text x="72" y="40" font-size="11" font-weight="bold" fill="#b71c1c" text-anchor="middle">溫暖潮濕的空氣</text>
      <!-- 低空飄浮的白茫茫濃霧層 -->
      <path d="M85,78 C95,64 135,64 148,74 C165,62 210,64 224,76 C245,70 268,78 265,92 C262,104 235,106 212,102 C185,108 140,106 115,100 C90,104 75,92 85,78 Z" fill="#ffffff" opacity="0.88" stroke="#90a4ae" stroke-width="1.5"/>
      <text x="176" y="90" font-size="12" font-weight="bold" fill="#37474f" text-anchor="middle">低空遇冷凝結成：？</text>
    </svg>`,

    // 第9課 #25：兩塊板塊背對背向外分離，岩漿湧出形成裂谷
    sci_l9_plate_diverge: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#fff3e0"/>
      <!-- 底部熾熱流動岩漿層 -->
      <path d="M10,96 L270,96 L270,142 L10,142 Z" fill="#ff5722"/>
      <path d="M115,96 C128,74 152,74 165,96" fill="#ff9800"/>
      <!-- 左右分離的兩塊地殼板塊與中央凹陷裂谷 -->
      <path d="M10,48 L112,48 L126,88 L10,88 Z" fill="#8d6e63" stroke="#4e342e" stroke-width="2.5"/>
      <path d="M168,48 L270,48 L270,88 L154,88 Z" fill="#8d6e63" stroke="#4e342e" stroke-width="2.5"/>
      <path d="M112,48 L126,88 L154,88 L168,48" fill="none" stroke="#bf360c" stroke-width="2" stroke-dasharray="4,2"/>
      <!-- 背對背向外紅色大箭頭 -->
      <path d="M92,68 L42,68 L42,58 L22,72 L42,86 L42,76 L92,76 Z" fill="#d32f2f"/>
      <path d="M188,68 L238,68 L238,58 L258,72 L238,86 L238,76 L188,76 Z" fill="#d32f2f"/>
      <text x="140" y="32" font-size="12" font-weight="bold" fill="#bf360c" text-anchor="middle">兩塊板塊互相？ ➔ 形成？地貌</text>
      <text x="140" y="124" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">地殼下流動的岩漿</text>
    </svg>`,

    // 第9課 #26：三格演化圖：(1)海底魚龍遺骸被掩埋 (2)岩層褶曲隆起 (3)高山出現魚龍化石
    sci_l9_ichthyosaur_uplift: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#eceff1"/>
      <!-- (1) 古代海底魚龍遺骸掩埋 -->
      <rect x="8" y="12" width="82" height="130" rx="6" fill="#e1f5fe" stroke="#0288d1" stroke-width="1.5"/>
      <path d="M8,52 Q49,46 90,52 L90,98 L8,98 Z" fill="#4fc3f7"/>
      <path d="M8,98 L90,98 L90,142 L8,142 Z" fill="#d7ccc8"/>
      <path d="M24,116 C38,108 62,108 76,116 C62,122 38,122 24,116 Z" fill="#ffffff" stroke="#5d4037" stroke-width="1.5"/>
      <text x="49" y="28" font-size="10" font-weight="bold" fill="#01579b" text-anchor="middle">(1) 海底掩埋</text>
      <text x="49" y="136" font-size="9" font-weight="bold" fill="#3e2723" text-anchor="middle">魚龍？成化石</text>
      <!-- (2) 地殼運動岩層擠壓隆起 -->
      <rect x="99" y="12" width="82" height="130" rx="6" fill="#fff8e1" stroke="#ffa000" stroke-width="1.5"/>
      <path d="M99,112 Q140,62 181,112 L181,142 L99,142 Z" fill="#a1887f" stroke="#4e342e" stroke-width="2"/>
      <path d="M99,126 Q140,78 181,126" fill="none" stroke="#ffd54f" stroke-width="2.5"/>
      <text x="140" y="28" font-size="10" font-weight="bold" fill="#e65100" text-anchor="middle">(2) 擠壓隆起</text>
      <text x="140" y="136" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">多次？</text>
      <!-- (3) 高山上出現魚龍化石 -->
      <rect x="190" y="12" width="82" height="130" rx="6" fill="#e8f5e9" stroke="#388e3c" stroke-width="1.5"/>
      <path d="M190,142 L212,62 L232,42 L254,68 L272,142 Z" fill="#78909c" stroke="#37474f" stroke-width="2"/>
      <path d="M220,58 L232,42 L244,60 Z" fill="#ffffff"/>
      <ellipse cx="232" cy="78" rx="14" ry="6" fill="#fff9c4" stroke="#f57f17" stroke-width="1.5"/>
      <text x="231" y="28" font-size="10" font-weight="bold" fill="#1b5e20" text-anchor="middle">(3) 推升至高山</text>
      <text x="231" y="136" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">海底？升至高處</text>
    </svg>`,

    // 第9課 #27：三個古生物化石標本：(1)魚化石 (2)菊石螺旋化石 (3)植物樹葉化石
    sci_l9_three_fossils: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#efebe9"/>
      <!-- (1) 魚骨化石 -->
      <path d="M14,32 C18,18 82,18 88,32 L88,108 C82,120 18,120 14,108 Z" fill="#d7ccc8" stroke="#5d4037" stroke-width="2"/>
      <path d="M24,70 L72,70 M72,70 L82,58 M72,70 L82,82 M36,56 L36,84 M48,54 L48,86 M60,58 L60,82" stroke="#4e342e" stroke-width="2" stroke-linecap="round"/>
      <text x="51" y="136" font-size="11" font-weight="bold" fill="#3e2723" text-anchor="middle">(1) ？化石</text>
      <!-- (2) 菊石螺旋殼化石 -->
      <path d="M102,32 C108,18 172,18 178,32 L178,108 C172,120 108,120 102,108 Z" fill="#d7ccc8" stroke="#5d4037" stroke-width="2"/>
      <path d="M140,70 C146,64 152,72 144,78 C132,86 120,72 128,58 C138,44 162,52 162,72 C162,92 134,102 118,86" fill="none" stroke="#4e342e" stroke-width="3" stroke-linecap="round"/>
      <text x="140" y="136" font-size="11" font-weight="bold" fill="#3e2723" text-anchor="middle">(2) ？化石</text>
      <!-- (3) 植物蕨葉化石 -->
      <path d="M192,32 C198,18 262,18 266,32 L266,108 C262,120 198,120 192,108 Z" fill="#d7ccc8" stroke="#5d4037" stroke-width="2"/>
      <path d="M212,96 Q230,68 248,44 M220,84 L208,76 M226,74 L242,74 M232,64 L218,56 M238,56 L252,58" fill="none" stroke="#33691e" stroke-width="2.2" stroke-linecap="round"/>
      <text x="229" y="136" font-size="11" font-weight="bold" fill="#3e2723" text-anchor="middle">(3) ？化石</text>
    </svg>`
  };

  window.Aetheria.QuestionBank.Science = {
    DIAGRAMS: SCI_DIAGRAMS,

    // 1. 科學科 4 個課次清單
    LESSONS: [
      { key: "sci_l2", name: "科學・第2課 青春期的變化 (30題)" },
      { key: "sci_l3", name: "科學・第3課 應對青春期 (30題)" },
      { key: "sci_l8", name: "科學・第8課 觀測天氣 (30題)" },
      { key: "sci_l9", name: "科學・第9課 探索地貌 (30題)" }
    ],

    // 2. 科學科完整 120 題 (每課 30 題，忠實對應《科學題庫.docx》)
    QUESTIONS: [
      // ==================== 第 2 課：青春期的變化 (30題) ====================
      { id: "sci_l2_01", unitKey: "sci_l2", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "人的一生大致分為五個成長階段：嬰幼兒期、兒童期、______、成年期和老年期。", blanks: ["青春期"], distractors: ["少年期", "成熟期", "壯年期"] },
      { id: "sci_l2_02", unitKey: "sci_l2", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "一般而言，女性約在 7 至 12 歲開始青春期，男性則約在______歲開始。", blanks: ["9至14"], distractors: ["5至8", "15至20", "3至6"] },
      { id: "sci_l2_03", unitKey: "sci_l2", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "在人類的成長階段中，______期的生長速度最快，並開始學習控制身體和動作。", blanks: ["嬰幼兒"], distractors: ["兒童", "成年", "老年"] },
      { id: "sci_l2_04", unitKey: "sci_l2", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "踏入______期，人的皮膚會有皺紋、斑點，白髮明顯增加，各種能力逐漸退化。", blanks: ["老年"], distractors: ["青春", "兒童", "成年"] },
      { id: "sci_l2_05", unitKey: "sci_l2", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "進入青春期後，______會分泌大量荷爾蒙，刺激生殖器官發育。", blanks: ["腦部"], distractors: ["心臟", "肺部", "胃部"] },
      { id: "sci_l2_06", unitKey: "sci_l2", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "進入青春期後，男孩的______開始產生男性荷爾蒙；女孩的______開始產生女性荷爾蒙。", blanks: ["睾丸", "卵巢"], distractors: ["陰囊", "子宮", "輸精管"] },
      { id: "sci_l2_07", unitKey: "sci_l2", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "青春期男女的身體會出現明顯的變化，並開始具備______能力。", blanks: ["生育"], distractors: ["飛行", "透視", "冬眠"] },
      { id: "sci_l2_08", unitKey: "sci_l2", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "人類的繁殖源於______和______的結合，前者來自爸爸，後者來自媽媽。", blanks: ["精子", "卵子"], distractors: ["血液", "細胞核", "荷爾蒙"] },
      { id: "sci_l2_09", unitKey: "sci_l2", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "男性進入青春期，如果睡覺時陰莖受到刺激，可能會排出精液，造成「______」。", blanks: ["夢遺"], distractors: ["月經", "失眠", "排卵"] },
      { id: "sci_l2_10", unitKey: "sci_l2", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "踏入青春期，荷爾蒙變化會影響腦部調節情緒的功能，導致______容易起伏。", blanks: ["情緒"], distractors: ["體溫", "視力", "聽力"] },

      // 第2課 選擇題 (#11 ~ #18)
      {
        id: "sci_l2_11", unitKey: "sci_l2", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "哪一個成長階段的特徵是「身體逐漸成長，平衡力和協調能力增強」？",
        options: ["A. 嬰幼兒期", "B. 兒童期", "C. 青春期", "D. 成年期"],
        answer: "B. 兒童期"
      },
      {
        id: "sci_l2_12", unitKey: "sci_l2", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "「骨骼、肌肉生長加快，女性體形變得渾圓，男性體形變得結實」屬於哪個成長階段的特徵？",
        options: ["A. 兒童期", "B. 青春期", "C. 成年期", "D. 老年期"],
        answer: "B. 青春期"
      },
      {
        id: "sci_l2_13", unitKey: "sci_l2", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "下列哪一項是青春期男女共同出現的生理特徵？",
        options: ["A. 出現喉結", "B. 乳房隆起", "C. 容易長暗瘡", "D. 聲線變得低沉"],
        answer: "C. 容易長暗瘡"
      },
      {
        id: "sci_l2_14", unitKey: "sci_l2", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "下列哪一項不是青春期男性的生理特徵？",
        options: ["A. 肌肉變得壯實", "B. 臀部變得豐滿", "C. 陰莖增大", "D. 可能長出胸毛"],
        answer: "B. 臀部變得豐滿"
      },
      {
        id: "sci_l2_15", unitKey: "sci_l2", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "關於精子和卵子的描述，哪一項是正確的？",
        options: ["A. 精子呈圓球狀", "B. 卵子形狀像蝌蚪", "C. 精子是男性體內最小的細胞", "D. 卵子來自爸爸"],
        answer: "C. 精子是男性體內最小的細胞"
      },
      {
        id: "sci_l2_16", unitKey: "sci_l2", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "在男性的生殖系統中，哪一個器官負責「保護睾丸」？",
        options: ["A. 輸精管", "B. 陰囊", "C. 陰莖", "D. 尿道"],
        answer: "B. 陰囊"
      },
      {
        id: "sci_l2_17", unitKey: "sci_l2", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "在女性的生殖系統中，哪一個器官是「嬰兒出生時通過的地方」？",
        options: ["A. 卵巢", "B. 輸卵管", "C. 子宮", "D. 陰道"],
        answer: "D. 陰道"
      },
      {
        id: "sci_l2_18", unitKey: "sci_l2", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "在月經周期中，卵巢按月排出卵子後，約兩星期如果卵子沒有受精，甚麼部位會脫落並排出體外形成月經？",
        options: ["A. 卵巢外壁", "B. 輸卵管內壁", "C. 子宮內膜", "D. 陰道黏膜"],
        answer: "C. 子宮內膜"
      },

      // 第2課 分類題 (#19 ~ #21) -> 分類籃
      {
        id: "sci_l2_19", unitKey: "sci_l2", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "請將以下青春期的生理特徵放入對應的分類籃：",
        baskets: ["男性獨有", "女性獨有", "男女皆有"],
        items: [
          { label: "1. 長出陰毛", basket: "男女皆有" },
          { label: "2. 出現喉結", basket: "男性獨有" },
          { label: "3. 乳房隆起", basket: "女性獨有" },
          { label: "4. 長出腋毛", basket: "男女皆有" },
          { label: "5. 聲線變得低沉", basket: "男性獨有" },
          { label: "6. 臀部變得豐滿", basket: "女性獨有" }
        ],
        answer: "男性獨有：2, 5 ｜ 女性獨有：3, 6 ｜ 男女皆有：1, 4"
      },
      {
        id: "sci_l2_20", unitKey: "sci_l2", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "請將以下器官放入「男性生殖系統」或「女性生殖系統」分類籃：",
        baskets: ["男性生殖系統", "女性生殖系統"],
        items: [
          { label: "1. 輸精管", basket: "男性生殖系統" },
          { label: "2. 卵巢", basket: "女性生殖系統" },
          { label: "3. 陰囊", basket: "男性生殖系統" },
          { label: "4. 子宮", basket: "女性生殖系統" },
          { label: "5. 睾丸", basket: "男性生殖系統" },
          { label: "6. 輸卵管", basket: "女性生殖系統" }
        ],
        answer: "男性生殖系統：1, 3, 5 ｜ 女性生殖系統：2, 4, 6"
      },
      {
        id: "sci_l2_21", unitKey: "sci_l2", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "請將以下特徵分類為青春期的「生理變化」或「心理變化」：",
        baskets: ["生理變化", "心理變化"],
        items: [
          { label: "1. 身高和體重顯著增加", basket: "生理變化" },
          { label: "2. 渴望獨立自主", basket: "心理變化" },
          { label: "3. 注重自我形象", basket: "心理變化" },
          { label: "4. 生殖系統開始成熟", basket: "生理變化" },
          { label: "5. 重視朋輩認同", basket: "心理變化" }
        ],
        answer: "生理變化：1, 4 ｜ 心理變化：2, 3, 5"
      },

      // 第2課 簡答題 (#22 ~ #24)
      {
        id: "sci_l2_22", unitKey: "sci_l2", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】成年期初期和後期的身體特徵有甚麼分別？",
        options: [
          "在初期，身體最強壯；到後期，活動速度減慢。",
          "在初期，身體最虛弱；到後期，身高繼續快速增長。",
          "成年期初期和後期身體完全沒有任何分別。",
          "在初期會出現白髮與皺紋；到後期會恢復成兒童體形。"
        ],
        answer: "在初期，身體最強壯；到後期，活動速度減慢。"
      },
      {
        id: "sci_l2_23", unitKey: "sci_l2", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】請列舉三項青春期常見的心理特徵。",
        options: [
          "渴望獨立自主、注重自我形象、對異性感興趣、重視朋輩認同、對性產生好奇（任選三項）。",
          "完全依賴父母照顧、不理會外表、拒絕認識任何朋友。",
          "記憶力開始退化、反應變慢、只喜歡留在家中睡覺。",
          "長出腋毛、聲線變沉、身高和體重增加。"
        ],
        answer: "渴望獨立自主、注重自我形象、對異性感興趣、重視朋輩認同、對性產生好奇（任選三項）。"
      },
      {
        id: "sci_l2_24", unitKey: "sci_l2", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】請按次序簡述女性月經形成的過程。",
        options: [
          "卵巢按月排出卵子，子宮內膜增厚充血；卵子經輸卵管移向子宮；約兩星期後若未受精，子宮內膜脫落經陰道排出形成月經。",
          "子宮排出卵子移向卵巢，如果受精就會脫落形成月經。",
          "輸卵管每月脫落一次並經尿道排出體外形成月經。",
          "卵子在卵巢內直接融化變成血液排出體外。"
        ],
        answer: "卵巢按月排出卵子，子宮內膜開始增厚和充血。之後卵子經輸卵管移向子宮，子宮內膜繼續增厚和充血。約兩星期後，如果卵子沒有受精，子宮內膜便會脫落，經陰道排出體外，形成月經。"
      },

      // 第2課 看圖填充題 (#25 ~ #27)
      {
        id: "sci_l2_25", unitKey: "sci_l2", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l2_male_repro",
        prompt: "[男性生殖系統結構簡圖] 負責製造精子的器官是______；負責輸送精子的管道是______；負責把精子排出體外的器官是______。",
        blanks: ["睾丸", "輸精管", "陰莖"], distractors: ["卵巢", "子宮", "輸卵管"]
      },
      {
        id: "sci_l2_26", unitKey: "sci_l2", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l2_female_repro",
        prompt: "[女性生殖系統結構簡圖] 負責製造、儲存和排出卵子的器官是______；負責輸送卵子的是______；負責孕育胎兒的是______。",
        blanks: ["卵巢", "輸卵管", "子宮"], distractors: ["睾丸", "輸精管", "陰囊"]
      },
      {
        id: "sci_l2_27", unitKey: "sci_l2", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l2_psych_traits",
        prompt: "左圖男孩站在鏡前噴髮膠整理髮型，反映他______；右圖女孩對爸爸說自己上學就可以了，反映她______。",
        blanks: ["注重自我形象", "渴望獨立自主"], distractors: ["重視朋輩認同", "情緒容易起伏", "依賴父母"]
      },

      // 第2課 情境題 (#28 ~ #30)
      {
        id: "sci_l2_28", unitKey: "sci_l2", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
        prompt: "【情境】家誠今年11歲，與媽媽去游泳池時，拒絕再跟媽媽進入女更衣室，堅持自己去男更衣室。為甚麼他會有這樣的轉變？我們對待自己和別人的身體應有甚麼態度？",
        options: [
          "因他已踏入青春期，意識到男女有別，進異性更衣室會感到不自在或尷尬。我們應保護自己的身體，並尊重別人的私隱。",
          "因為男更衣室的面積比女更衣室大。我們不需要理會別人的私隱。",
          "因為他不想去游泳。我們應該強迫他繼續進女更衣室。",
          "因為他討厭媽媽。青春期不需要保護自己的身體。"
        ],
        answer: "因為他已經長大，踏入青春期，開始意識到男女有別，進入異性更衣室會讓自己和別人感到不自在或尷尬。我們應保護自己的身體，並尊重別人的私隱。"
      },
      {
        id: "sci_l2_29", unitKey: "sci_l2", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
        prompt: "【情境】12歲的子軒早上醒來發現內褲濕了，懷疑自己患病，感到非常害怕。這是甚麼生理現象？你會怎樣向他解釋原因以消除他的疑慮？",
        options: [
          "這是「夢遺」。男性進入青春期後睾丸開始製造精子，睡覺時陰莖若受刺激可能排出精液，屬正常生理現象，對身體無害無須害怕。",
          "這是嚴重疾病，必須立即停止所有運動並禁食。",
          "這是因為睡前喝太多水導致腎臟受損。",
          "這是女性才會出現的月經現象。"
        ],
        answer: "這是「夢遺」。因為男性進入青春期後，睾丸開始製造精子；如果在睡覺時陰莖受到刺激（例如內褲較緊或被子較重），可能會排出精液。這是正常的生理現象，對身體沒有害處，無須害怕。"
      },
      {
        id: "sci_l2_30", unitKey: "sci_l2", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
        prompt: "【情境】踏入青春期的小玲有兩個疑問：(1) 女性在月經期間能不能做運動？ (2) 男生同學的胸部變大是不正常的嗎？請以科學角度為她解答。",
        options: [
          "(1) 月經期間可以做適度運動，對身體有益，需按個人狀況選擇。(2) 青春期男性的肌肉和脂肪都會增長，若無其他不適，胸部變大也是正常生理現象。",
          "(1) 月經期間絕對不可走動或運動。(2) 男生胸部變大代表變成了女生。",
          "(1) 月經期間只能做馬拉松劇烈運動。(2) 男生不會有任何脂肪增長。",
          "(1) 月經期間不能洗頭和洗澡。(2) 必須立即動手術切除。"
        ],
        answer: "(1) 女性在月經期間是可以運動的，適度的運動對身體有益，但需要根據個人的身體狀況選擇合適的運動方式。(2) 在青春期，男性的肌肉和脂肪都會增長，因此只要沒有其他不適，胸部變大也是正常的生理現象。"
      },

      // ==================== 第 3 課：應對青春期 (30題) ====================
      { id: "sci_l3_01", unitKey: "sci_l3", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "青春期男女因發育情況不同而出現個別差異，這是______的現象，我們不必感到煩惱。", blanks: ["正常"], distractors: ["反常", "罕見", "危險"] },
      { id: "sci_l3_02", unitKey: "sci_l3", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "面對青春期發育的個別差異，我們應持有的正確態度是：明白及______。", blanks: ["接受"], distractors: ["抗拒", "隱瞞", "嘲笑"] },
      { id: "sci_l3_03", unitKey: "sci_l3", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "青春期的發育情況主要受______、睡眠、______和______影響，因人而異，不必互相比較。", blanks: ["遺傳", "飲食", "運動"], distractors: ["天氣", "衣着", "星座"] },
      { id: "sci_l3_04", unitKey: "sci_l3", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "親代（父母）的特徵會遺傳給子代（子女）。青少年的發育受先天______的影響，但後天的生活______亦十分重要。", blanks: ["遺傳", "習慣"], distractors: ["財富", "運氣", "成績"] },
      { id: "sci_l3_05", unitKey: "sci_l3", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "有助生長的荷爾蒙主要在晚上 10 時至凌晨 2 時的______睡眠中分泌。", blanks: ["深層"], distractors: ["淺層", "午間", "短暫"] },
      { id: "sci_l3_06", unitKey: "sci_l3", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "衛生署建議 6 至 13 歲學童每天睡______至______小時。", blanks: ["9", "11"], distractors: ["4", "6", "16"] },
      { id: "sci_l3_07", unitKey: "sci_l3", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "良好的睡眠使人回復______，心情開朗，有助身心發展。", blanks: ["精力"], distractors: ["體重", "壓力", "疲勞"] },
      { id: "sci_l3_08", unitKey: "sci_l3", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "根據「健康飲食金字塔」，我們每天應喝______至______杯流質飲料，例如開水、奶。", blanks: ["6", "8"], distractors: ["1", "2", "15"] },
      { id: "sci_l3_09", unitKey: "sci_l3", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "垃圾食物是指______、脂肪、糖及鹽含量高，______價值卻很低的食物和飲料。", blanks: ["熱量", "營養"], distractors: ["纖維", "水份", "維生素"] },
      { id: "sci_l3_10", unitKey: "sci_l3", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "適量的運動對發育有很多好處，包括強健______、減輕______和預防______。", blanks: ["骨骼", "壓力", "肥胖"], distractors: ["視力", "睡眠", "長高"] },

      // 第3課 選擇題 (#11 ~ #18)
      {
        id: "sci_l3_11", unitKey: "sci_l3", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "以下哪一項影響青少年發育的因素屬於「先天因素」？",
        options: ["A. 飲食", "B. 睡眠", "C. 運動", "D. 遺傳"],
        answer: "D. 遺傳"
      },
      {
        id: "sci_l3_12", unitKey: "sci_l3", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "我們一般會從父母身上遺傳到哪些身體特徵？",
        options: ["A. 身高和體形", "B. 樣貌和骨骼", "C. 以上皆是", "D. 以上皆非"],
        answer: "C. 以上皆是"
      },
      {
        id: "sci_l3_13", unitKey: "sci_l3", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "當你睡得不好或睡眠不足時，身體會出現甚麼感覺或反應？",
        options: ["A. 頭痛和疲倦", "B. 煩躁和焦慮", "C. 注意力渙散和記憶力變差", "D. 以上皆是"],
        answer: "D. 以上皆是"
      },
      {
        id: "sci_l3_14", unitKey: "sci_l3", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "根據「健康飲食金字塔」，哪兩類食物我們應該「吃適量」？",
        options: ["A. 蔬菜類、水果類", "B. 奶類及代替品、肉魚蛋及代替品", "C. 穀物類、油鹽糖類", "D. 水果類、奶類及代替品"],
        answer: "B. 奶類及代替品、肉魚蛋及代替品"
      },
      {
        id: "sci_l3_15", unitKey: "sci_l3", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "長期欠缺某些營養素（營養失衡），可能對發育造成甚麼影響？",
        options: ["A. 血糖波動大，容易煩躁", "B. 肌肉或骨骼發育不良，體力變差", "C. 刺激皮脂腺分泌油脂", "D. 荷爾蒙分泌過多"],
        answer: "B. 肌肉或骨骼發育不良，體力變差"
      },
      {
        id: "sci_l3_16", unitKey: "sci_l3", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "根據兒童及青少年運動量指引，每天應累積做至少多少分鐘中等或以上強度的運動？",
        options: ["A. 15分鐘", "B. 30分鐘", "C. 60分鐘", "D. 120分鐘"],
        answer: "C. 60分鐘"
      },
      {
        id: "sci_l3_17", unitKey: "sci_l3", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "進行活動時，「仍能說話但不能唱歌」，這屬於哪一種強度的體能活動？",
        options: ["A. 低強度運動", "B. 中等強度運動", "C. 劇烈強度運動", "D. 超負荷運動"],
        answer: "B. 中等強度運動"
      },
      {
        id: "sci_l3_18", unitKey: "sci_l3", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "青春期時皮膚容易出現「黑頭」，黑頭是怎樣形成的？",
        options: [
          "A. 皮膚太乾燥脫皮而成",
          "B. 細菌直接感染皮膚表層",
          "C. 過多的油脂與黏附在毛孔上的塵埃混合，堵塞毛孔形成硬粒",
          "D. 睡眠不足引致的黑色素沉澱"
        ],
        answer: "C. 過多的油脂與黏附在毛孔上的塵埃混合，堵塞毛孔形成硬粒"
      },

      // 第3課 分類題 (#19 ~ #21)
      {
        id: "sci_l3_19", unitKey: "sci_l3", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "請將以下影響發育的因素放入「先天因素」或「後天因素」分類籃：",
        baskets: ["先天因素", "後天因素"],
        items: [
          { label: "1. 遺傳", basket: "先天因素" },
          { label: "2. 睡眠", basket: "後天因素" },
          { label: "3. 飲食", basket: "後天因素" },
          { label: "4. 運動", basket: "後天因素" }
        ],
        answer: "先天因素：1 ｜ 後天因素：2, 3, 4"
      },
      {
        id: "sci_l3_20", unitKey: "sci_l3", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "請將以下睡前行為放入對應的分類籃：",
        baskets: ["有助提升睡眠質素", "減低睡眠質素"],
        items: [
          { label: "1. 每天定時起牀和睡覺", basket: "有助提升睡眠質素" },
          { label: "2. 睡覺前大量進食", basket: "減低睡眠質素" },
          { label: "3. 睡覺前做劇烈運動", basket: "減低睡眠質素" },
          { label: "4. 睡覺前使用電子科技產品", basket: "減低睡眠質素" }
        ],
        answer: "提升睡眠質素：1 ｜ 減低睡眠質素：2, 3, 4"
      },
      {
        id: "sci_l3_21", unitKey: "sci_l3", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "請根據「健康飲食金字塔」進食原則，將食物放入對應分類籃：",
        baskets: ["吃最多", "多吃些", "吃適量", "吃最少"],
        items: [
          { label: "1. 蔬菜類", basket: "多吃些" },
          { label: "2. 油、鹽、糖類", basket: "吃最少" },
          { label: "3. 穀物類", basket: "吃最多" },
          { label: "4. 奶類及代替品", basket: "吃適量" },
          { label: "5. 水果類", basket: "多吃些" },
          { label: "6. 肉、魚、蛋及代替品", basket: "吃適量" }
        ],
        answer: "吃最多：3 ｜ 多吃些：1, 5 ｜ 吃適量：4, 6 ｜ 吃最少：2"
      },

      // 第3課 簡答題 (#22 ~ #24)
      {
        id: "sci_l3_22", unitKey: "sci_l3", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】為甚麼「運動」有助於青少年強健骨骼、減輕壓力和預防肥胖？請分別說明。",
        options: [
          "強健骨骼：刺激骨骼生長促進身高；減輕壓力：穩定情緒並助夜間深層睡眠；預防肥胖：刺激肌肉生長，減少脂肪積聚。",
          "運動只會消耗骨質、增加精神壓力並令脂肪積聚。",
          "運動可以代替睡眠和飲水，不需要吃正餐。",
          "只有在睡前一小時做劇烈運動才能強健骨骼。"
        ],
        answer: "強健骨骼：運動可以刺激骨骼生長，促進身高發展。減輕壓力：運動能穩定情緒，在白天消耗體力，也有助夜間深層睡眠。預防肥胖：運動可以刺激肌肉生長，減少脂肪積聚。"
      },
      {
        id: "sci_l3_23", unitKey: "sci_l3", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】我們怎樣可以在日常生活中爭取機會增加運動量？請列舉兩個例子。",
        options: [
          "以走樓梯代替使用扶手電梯；一邊看電視一邊做伸展運動；乘車時提前一個站下車步行到目的地。",
          "全程乘搭升降機；躺着看電視吃零食；出門必定乘的士。",
          "每天減少睡眠時間用來通宵打電子遊戲。",
          "只在每年運動會當天跑一次步，平時完全不走動。"
        ],
        answer: "以走樓梯代替使用扶手電梯；一邊看電視，一邊做伸展運動；乘車時提前一個站下車，步行到目的地（任選兩項）。"
      },
      {
        id: "sci_l3_24", unitKey: "sci_l3", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】青少年使用電子屏幕時間過長會有甚麼潛在風險？我們應該怎樣做？",
        options: [
          "風險：阻礙身心發展，降低專注力、情緒管理能力和現實社交技巧。做法：有效管理時間，在網絡與現實間取平衡，做負責任的數碼公民。",
          "風險：能大幅提升視力和深層睡眠時間。做法：每天使用12小時以上。",
          "沒有任何風險，網上交友可以完全取代現實社交。",
          "做法：睡前關燈在被窩裡長時間看手機。"
        ],
        answer: "風險：有機會阻礙青少年的身心發展，降低專注力、情緒管理能力和現實社交技巧。做法：必須有效地管理時間，在網絡與現實間取得平衡；同時保持禮貌，做個負責任的數碼公民。"
      },

      // 第3課 看圖填充題 (#25 ~ #27)
      {
        id: "sci_l3_25", unitKey: "sci_l3", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l3_food_pyramid",
        prompt: "[健康飲食金字塔] 最底層（吃最多）是______；第二層（多吃些）是______和______；最頂層（吃最少）是______。",
        blanks: ["穀物類", "蔬菜類", "水果類", "油、鹽、糖類"], distractors: ["肉魚蛋類", "奶類", "汽水類"]
      },
      {
        id: "sci_l3_26", unitKey: "sci_l3", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l3_exercise_intensity",
        prompt: "[運動強度比較圖] 左圖打乒乓球屬於______強度的運動；右圖跑步時除非停下來呼吸否則說不完整個句子，屬於______強度的運動。",
        blanks: ["中等", "劇烈"], distractors: ["低", "靜態", "零"]
      },
      {
        id: "sci_l3_27", unitKey: "sci_l3", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l3_skin_pore",
        prompt: "[皮膚毛孔結構圖] 青春期荷爾蒙分泌變化會刺激______過度分泌油脂，堵塞毛孔形成______；若受細菌感染，便會導致皮膚局部______，形成暗瘡。",
        blanks: ["皮脂腺", "黑頭", "發炎"], distractors: ["汗腺", "皺紋", "結痂"]
      },

      // 第3課 情境題 (#28 ~ #30)
      {
        id: "sci_l3_28", unitKey: "sci_l3", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
        prompt: "【情境】新聞報道一名 16 歲少年，按父母遺傳預測身高應達 177 厘米，但他因升學壓力大，長期每日只睡 4 小時，身高僅 156 厘米。請分析他長不高的原因。",
        options: [
          "學習壓力令他長期焦慮並睡眠不足；有助生長的荷爾蒙主要在晚上10時至凌晨2時的深層睡眠中分泌，睡眠不足令荷爾蒙分泌減少，干擾正常發育。",
          "因為遺傳因素完全不會影響身高。",
          "因為每天睡 4 小時已經太多，睡得越少長得越高。",
          "因為他沒有在睡前吃大量消夜。"
        ],
        answer: "因為學習壓力令他長期處於焦慮狀態，損害睡眠質素，導致長期睡眠不足。有助生長的荷爾蒙主要在深層睡眠中分泌，睡眠不足導致荷爾蒙分泌減少，因此干擾了身體的正常發育。"
      },
      {
        id: "sci_l3_29", unitKey: "sci_l3", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
        prompt: "【情境】小明在發育時期非常喜歡吃薯條、炸雞、冬甩和汽水等垃圾食物，很少吃正餐。如果他長期保持這種飲食習慣，會引致甚麼問題？為甚麼？",
        options: [
          "(1)營養失衡：欠缺營養素致肌肉骨骼發育不良、體力變差；(2)肥胖：高糖高脂致脂肪過多妨礙發育；(3)情緒不穩：高糖令血糖波動大，易煩躁難集中。",
          "會令骨骼更強壯、注意力更集中及睡眠質素提升。",
          "只會令體重減輕，不會影響骨骼和情緒。",
          "垃圾食物營養價值極高，可完全取代蔬菜和水果。"
        ],
        answer: "會引致：(1) 營養失衡：長期欠缺某些營養素，可能導致肌肉或骨骼發育不良，體力變差。(2) 肥胖：高糖和高脂肪食物易導致身體脂肪過多，甚至妨礙正常發育。(3) 情緒不穩：高糖飲食會令血糖波動大，容易煩躁、難以集中。"
      },
      {
        id: "sci_l3_30", unitKey: "sci_l3", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
        prompt: "【情境】美美臉上長了幾顆暗瘡，她常常用手擠壓暗瘡、用頭髮遮蓋，並且每天洗臉五、六次。請指出她處理暗瘡的錯誤之處及後果，並提供正確建議。",
        options: [
          "錯誤：(1)擠壓或用頭髮遮蓋會造成更嚴重發炎甚至留疤；(2)過度清潔令皮膚太乾，反刺激更多油脂分泌令暗瘡惡化。建議：適度清潔切勿擠壓，嚴重應求醫。",
          "錯誤：每天洗臉五、六次太少，應該每小時洗一次並用力擠破暗瘡。",
          "用頭髮遮蓋和擠壓能加速暗瘡痊癒，是非常正確的做法。",
          "應該塗抹大量油膩護膚品把毛孔完全封住。"
        ],
        answer: "錯誤及後果：(1) 擠壓、用頭髮遮蓋或撕掉暗瘡痂，可能造成更嚴重的發炎，甚至留下疤痕。(2) 過度清潔可能令皮膚太乾燥，反而刺激更多油脂分泌，使暗瘡情況惡化。正確建議：應保持適度清潔，切勿擠壓；如果暗瘡的情況嚴重，應請醫生診治。"
      },

      // ==================== 第 8 課：觀測天氣 (30題) ====================
      { id: "sci_l8_01", unitKey: "sci_l8", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "我們可以運用天氣數據來描述天氣情況，例如氣溫、______、風向、______和降雨量。", blanks: ["風力", "相對濕度"], distractors: ["海拔", "地形", "人口"] },
      { id: "sci_l8_02", unitKey: "sci_l8", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "香港天文台運用百葉箱內的溫度計來測量______和______。", blanks: ["氣溫", "相對濕度"], distractors: ["風向", "風速", "降雨量"] },
      { id: "sci_l8_03", unitKey: "sci_l8", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "風向是指風______的方向。例如：從東方吹向西方的風，稱為「______」。", blanks: ["吹來", "東風"], distractors: ["吹去", "西風", "北風"] },
      { id: "sci_l8_04", unitKey: "sci_l8", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "降雨量是指雨水在地面上積起來的______，通常以毫米為單位。", blanks: ["高度"], distractors: ["重量", "面積", "溫度"] },
      { id: "sci_l8_05", unitKey: "sci_l8", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "______是指大氣中的水蒸氣凝結後，從雲層降落到地面的現象，它是水循環的一個階段。", blanks: ["降水"], distractors: ["蒸發", "風化", "侵蝕"] },
      { id: "sci_l8_06", unitKey: "sci_l8", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "太陽照射地面，水蒸發成水蒸氣上升，在高空遇冷形成______或______，聚集成雲。", blanks: ["水點", "冰晶"], distractors: ["塵埃", "氣泡", "彩虹"] },
      { id: "sci_l8_07", unitKey: "sci_l8", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "當水點落下，如果接近地面的溫度______於 0°C，水點沒有結冰，就會形成雨。", blanks: ["高"], distractors: ["低", "等", "零"] },
      { id: "sci_l8_08", unitKey: "sci_l8", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "當冰晶落下，如果接近地面的溫度______於 0°C，冰晶沒有融化，就會形成雪。", blanks: ["低"], distractors: ["高", "超過", "遠高"] },
      { id: "sci_l8_09", unitKey: "sci_l8", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "當雲中出現強烈的______氣流時，冰粒跟隨氣流上下翻滾並不斷增大，最終落下形成______。", blanks: ["上升", "雹"], distractors: ["下沉", "霧", "霜"] },
      { id: "sci_l8_10", unitKey: "sci_l8", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "溫暖和潮濕的空氣在低空遇冷時，水蒸氣凝結成微細的______，飄浮在空中，那就是______。", blanks: ["水點", "霧"], distractors: ["冰晶", "雹", "霜"] },

      // 第8課 選擇題 (#11 ~ #18)
      {
        id: "sci_l8_11", unitKey: "sci_l8", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "香港天文台使用「翻斗式雨量器」來測量哪一項天氣數據？",
        options: ["A. 相對濕度", "B. 風速", "C. 降雨量", "D. 氣溫"],
        answer: "C. 降雨量"
      },
      {
        id: "sci_l8_12", unitKey: "sci_l8", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "使用溫度計測量氣溫時，應該把溫度計放置在甚麼地方？",
        options: ["A. 陽光直接照射的空曠地面", "B. 陽光照射不到而且空氣流通的地方", "C. 密閉沒有窗戶的房間內", "D. 靠近冷氣機出風口的位置"],
        answer: "B. 陽光照射不到而且空氣流通的地方"
      },
      {
        id: "sci_l8_13", unitKey: "sci_l8", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "閱讀溫度計的度數時，視線應該怎樣？",
        options: ["A. 從上往下俯視", "B. 從下往上仰視", "C. 從水平角度觀察紅色液體頂部的位置", "D. 隨意角度均可"],
        answer: "C. 從水平角度觀察紅色液體頂部的位置"
      },
      {
        id: "sci_l8_14", unitKey: "sci_l8", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "在製作和進行模擬「霜」的形成實驗時，下列哪一項安全提示是正確的？",
        options: [
          "A. 可以直接用手長時間握住冰塊和金屬杯",
          "B. 備用的溫度計應垂直立在桌面上",
          "C. 避免直接接觸冰塊和金屬杯，以免凍傷",
          "D. 桌面濺濕了不需理會"
        ],
        answer: "C. 避免直接接觸冰塊和金屬杯，以免凍傷"
      },
      {
        id: "sci_l8_15", unitKey: "sci_l8", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "雨、雪、雹三種降水現象中，哪一種在香港最罕見？",
        options: ["A. 雨", "B. 雪", "C. 雹", "D. 一樣常見"],
        answer: "B. 雪"
      },
      {
        id: "sci_l8_16", unitKey: "sci_l8", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "承上題，為甚麼這種降水現象在香港最罕見？",
        options: [
          "A. 因為香港沒有高雲",
          "B. 因為香港空氣太乾燥",
          "C. 因為香港屬於亞熱帶氣候，冬季氣溫甚少降至 0°C 以下",
          "D. 因為香港沒有上升氣流"
        ],
        answer: "C. 因為香港屬於亞熱帶氣候，冬季氣溫甚少降至 0°C 以下"
      },
      {
        id: "sci_l8_17", unitKey: "sci_l8", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "下列哪一項關於「霜」的描述是正確的？",
        options: [
          "A. 接近地面的氣溫在 0°C 以上時形成",
          "B. 是水蒸氣在極冷的物體表面直接形成的冰晶",
          "C. 屬於液態的天氣現象",
          "D. 飄浮在半空中模糊視線"
        ],
        answer: "B. 是水蒸氣在極冷的物體表面直接形成的冰晶"
      },
      {
        id: "sci_l8_18", unitKey: "sci_l8", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "科學家在雲中撒播化學物質以進行「人工增雨」，其科學原理是甚麼？",
        options: [
          "A. 使雲層溫度降至 0°C 以下結冰",
          "B. 製造強烈的上升氣流",
          "C. 使雲中的水滴迅速聚集，促成降雨",
          "D. 把空氣中的氧氣變成水蒸氣"
        ],
        answer: "C. 使雲中的水滴迅速聚集，促成降雨"
      },

      // 第8課 分類題 (#19 ~ #21)
      {
        id: "sci_l8_19", unitKey: "sci_l8", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "請將以下測量儀器放入對應的天氣數據分類籃：",
        baskets: ["B. 氣溫", "C. 風向和風速", "A. 降雨量"],
        items: [
          { label: "1. 溫度計", basket: "B. 氣溫" },
          { label: "2. 風杯式風速表/風向儀", basket: "C. 風向和風速" },
          { label: "3. 雨量計", basket: "A. 降雨量" }
        ],
        answer: "1配B(氣溫) ｜ 2配C(風向和風速) ｜ 3配A(降雨量)"
      },
      {
        id: "sci_l8_20", unitKey: "sci_l8", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "請將以下天氣現象按狀態放入「液態（水點）」或「固態（冰晶/冰粒）」分類籃：",
        baskets: ["液態（水點）", "固態（冰晶/冰粒）"],
        items: [
          { label: "1. 雨", basket: "液態（水點）" },
          { label: "2. 雪", basket: "固態（冰晶/冰粒）" },
          { label: "3. 雹", basket: "固態（冰晶/冰粒）" },
          { label: "4. 霧", basket: "液態（水點）" },
          { label: "5. 霜", basket: "固態（冰晶/冰粒）" }
        ],
        answer: "液態（水點）：1, 4 ｜ 固態（冰晶/冰粒）：2, 3, 5"
      },
      {
        id: "sci_l8_21", unitKey: "sci_l8", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "請將以下天氣現象放入對應的形成位置分類籃：",
        baskets: ["從高空雲層降落(降水)", "在接近地面/低空形成"],
        items: [
          { label: "1. 雨", basket: "從高空雲層降落(降水)" },
          { label: "2. 霧", basket: "在接近地面/低空形成" },
          { label: "3. 雪", basket: "從高空雲層降落(降水)" },
          { label: "4. 霜", basket: "在接近地面/低空形成" },
          { label: "5. 雹", basket: "從高空雲層降落(降水)" }
        ],
        answer: "高空雲層降落：1, 3, 5 ｜ 接近地面/低空形成：2, 4"
      },

      // 第8課 簡答題 (#22 ~ #24)
      {
        id: "sci_l8_22", unitKey: "sci_l8", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】請描述「霧」和「霜」在外觀上有甚麼特徵。",
        options: [
          "霧的特徵：白色或灰白色的霧氣，像煙霧一樣模糊視線。霜的特徵：白色、細小的冰晶，看起來像雪或糖霜。",
          "霧是透明堅硬的冰塊；霜是飄浮在高空的黑色煙霧。",
          "霧和霜都是大顆的透明雨滴。",
          "霧只出現在樹葉表面；霜則飄浮在半空中。"
        ],
        answer: "霧的特徵：白色或灰白色的霧氣，像煙霧一樣模糊視線。霜的特徵：白色、細小的冰晶，看起來像雪或糖霜。"
      },
      {
        id: "sci_l8_23", unitKey: "sci_l8", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】請按次序寫出「雹」的四個形成步驟。",
        options: [
          "1.水蒸氣被強烈上升氣流帶到高空；2.遇冷形成冰粒；3.冰粒隨劇烈氣流上下翻滾吸附水分不斷增大；4.重量超過上升氣流支撐力落下成雹。",
          "1.地面水結冰；2.被風吹上天空；3.在雲中融化成水點；4.落下地面成雹。",
          "1.水蒸氣在低空遇冷；2.在樹葉表面結成冰晶；3.隨風飄浮；4.形成雹。",
          "只有在氣溫低於 -30°C 且完全沒有氣流時才會形成雹。"
        ],
        answer: "1. 水蒸氣被強烈的上升氣流帶到高空。2. 水蒸氣在高空遇冷，形成冰粒。3. 雲中的氣流變化劇烈，冰粒跟隨氣流上下翻滾，吸附水分，並不斷增大。4. 冰粒的重量超過上升氣流的支撐力，落下到地面，形成雹。"
      },
      {
        id: "sci_l8_24", unitKey: "sci_l8", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】「人工增雨」對人類有甚麼幫助？",
        options: [
          "能有效解決食水不足的問題，並減輕乾旱等天氣災害。",
          "能製造暴風雪及冰雹。",
          "能令海水直接變成淡水而不需要水庫。",
          "能阻止地球板塊移動。"
        ],
        answer: "能有效解決食水不足的問題，並減輕乾旱等天氣災害。"
      },

      // 第8課 看圖填充題 (#25 ~ #27)
      {
        id: "sci_l8_25", unitKey: "sci_l8", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l8_wind_dir",
        prompt: "[方向標示圖] 圖中的綠色箭頭顯示風從東方吹向西方，這股風的風向稱為______。",
        blanks: ["東風"], distractors: ["西風", "南風", "北風"]
      },
      {
        id: "sci_l8_26", unitKey: "sci_l8", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l8_weather_instruments",
        prompt: "[天文台測量儀器圖] 儀器(1)百葉箱用來測量氣溫和______；儀器(2)用來測量風向和______；儀器(3)翻斗式雨量器用來測量______。",
        blanks: ["相對濕度", "風速", "降雨量"], distractors: ["氣壓", "日照", "海拔"]
      },
      {
        id: "sci_l8_27", unitKey: "sci_l8", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l8_fog_formation",
        prompt: "[天氣現象形成圖] 圖中顯示的是______的形成過程，當溫暖和潮濕的空氣在低空遇______時，水蒸氣凝結成微細的水點飄浮在空中。",
        blanks: ["霧", "冷"], distractors: ["霜", "熱", "雹"]
      },

      // 第8課 情境題 (#28 ~ #30)
      {
        id: "sci_l8_28", unitKey: "sci_l8", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
        prompt: "【情境】今天天氣數據：最高氣溫32°C、最低28°C、風向西南、風力5級、相對濕度80-95%、降雨量5-10毫米（多雲有驟雨）。請以天氣報告員身分描述今天天氣。",
        options: [
          "今天多雲，有驟雨；天氣炎熱，氣溫介乎 28°C 至 32°C；吹 5 級清勁西南風；天氣潮濕，相對濕度介乎 80% 至 95%，降雨量為 5 至 10 毫米。",
          "今天天晴乾燥，氣溫寒冷低於 0°C，吹東北風並有降雪。",
          "今天沒有風，相對濕度極低，降雨量為 0 毫米。",
          "今天吹西北風 10 級，氣溫高達 45°C。"
        ],
        answer: "今天多雲，有驟雨；天氣炎熱，氣溫介乎 28°C 至 32°C；吹 5 級清勁西南風；天氣潮濕，相對濕度介乎 80% 至 95%，降雨量為 5 至 10 毫米。"
      },
      {
        id: "sci_l8_29", unitKey: "sci_l8", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
        prompt: "【情境】在冬季一個寒冷清晨，大帽山山頂氣溫降至 0°C 以下，遠足人士發現樹葉表面結了一層薄薄的白色冰晶。有人大喊：「香港下雪了！」你認同嗎？請解釋。",
        options: [
          "不認同，那是「霜」而不是「雪」。雪是雲中冰晶從高空降落的降水現象；樹葉上的冰晶是因近地面氣溫在0°C以下，水蒸氣在極冷樹葉表面直接凝結成的「霜」。",
          "認同，只要看到白色冰晶就一定是高空落下的雪。",
          "不認同，那是強烈上升氣流造成的「雹」。",
          "認同，因為香港每天冬天都會下大雪。"
        ],
        answer: "不認同，那是「霜」而不是「雪」。雪是雲中的冰晶從高空降落到地面形成的降水現象；而樹葉上的冰晶是因為接近地面的氣溫在攝氏零度以下，空氣中的水蒸氣在極冷的樹葉表面直接形成的「霜」。"
      },
      {
        id: "sci_l8_30", unitKey: "sci_l8", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
        prompt: "【情境】科學課上，同學們分組製作自製的「風向儀」和「雨量計」去操場測量天氣。請說明在製作時有甚麼安全注意事項，以及如何讀取「雨量計」的數據。",
        options: [
          "安全注意事項：製作時要小心使用利器。讀取雨量計數據方法：觀察並量度雨量計所收集的雨水高度，該高度就是降雨量。",
          "安全注意事項：不需理會剪刀美工刀。讀取方法：量度雨水的重量。",
          "讀取方法：用溫度計量度雨水溫度作為降雨量。",
          "讀取方法：把雨水倒在地上量度面積。"
        ],
        answer: "安全注意事項：製作時要小心使用利器。讀取雨量計數據的方法：觀察並量度雨量計所收集的雨水高度，該高度就是降雨量。"
      },

      // ==================== 第 9 課：探索地貌 (30題) ====================
      { id: "sci_l9_01", unitKey: "sci_l9", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "凹凸不平的______構成了不同的地貌種類，例如山脈、高原、平原、河谷和盆地。", blanks: ["地殼"], distractors: ["大氣層", "雲層", "海洋"] },
      { id: "sci_l9_02", unitKey: "sci_l9", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "由山坡陡峭、連綿的高山組成，地勢高的地貌稱為______（例如喜馬拉雅山脈）。", blanks: ["山脈"], distractors: ["平原", "盆地", "河谷"] },
      { id: "sci_l9_03", unitKey: "sci_l9", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "面積廣闊、平坦的低地稱為______（例如亞馬遜平原）。", blanks: ["平原"], distractors: ["高原", "山脈", "裂谷"] },
      { id: "sci_l9_04", unitKey: "sci_l9", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "四周由高地圍繞，中央土地低平的地貌稱為______（例如四川盆地）。", blanks: ["盆地"], distractors: ["高原", "山脈", "海溝"] },
      { id: "sci_l9_05", unitKey: "sci_l9", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "兩側地勢較高，河水流經中央低地的地貌稱為______（例如尼羅河谷）。", blanks: ["河谷"], distractors: ["盆地", "高原", "沙漠"] },
      { id: "sci_l9_06", unitKey: "sci_l9", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "地貌受地球______力量和地球______力量影響，會逐漸發生變化。", blanks: ["內部", "外部"], distractors: ["月球", "太陽", "人造"] },
      { id: "sci_l9_07", unitKey: "sci_l9", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "地殼下流動的______帶動板塊移動，令板塊與板塊相撞或分離。", blanks: ["岩漿"], distractors: ["地下水", "石油", "冰層"] },
      { id: "sci_l9_08", unitKey: "sci_l9", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "兩塊板塊相撞，互相擠壓，地殼會______，形成山脈；兩塊板塊分離，地殼會______，形成裂谷。", blanks: ["褶曲", "破裂"], distractors: ["融化", "蒸發", "結冰"] },
      { id: "sci_l9_09", unitKey: "sci_l9", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "______是存留在地殼岩石和冰層中的一些古生物的______（例如魚、菊石、植物等）。", blanks: ["化石", "遺骸"], distractors: ["礦物", "岩漿", "泥沙"] },
      { id: "sci_l9_10", unitKey: "sci_l9", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "河水______岩石和土壤，漸漸形成河谷；海浪令泥沙______，漸漸形成沙灘。", blanks: ["侵蝕", "堆積"], distractors: ["蒸發", "凝結", "褶曲"] },

      // 第9課 選擇題 (#11 ~ #18)
      {
        id: "sci_l9_11", unitKey: "sci_l9", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "平均高度在 4000 米以上的「青藏高原」，具有甚麼地貌特點？",
        options: ["A. 四周由高地圍繞，中央低平", "B. 面積廣闊、平坦的高地", "C. 面積廣闊、平坦的低地", "D. 兩側地勢高，中央有河流"],
        answer: "B. 面積廣闊、平坦的高地"
      },
      {
        id: "sci_l9_12", unitKey: "sci_l9", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "海底地形也是起伏不平的，其中狹長凹陷的海底最深處稱為甚麼？",
        options: ["A. 海盆", "B. 海溝", "C. 海嶺", "D. 海谷"],
        answer: "B. 海溝"
      },
      {
        id: "sci_l9_13", unitKey: "sci_l9", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "觀察「主要板塊分佈圖」，像喜馬拉雅山脈、洛磯山脈和紅海裂谷這些地貌，通常位於地殼的甚麼位置？",
        options: ["A. 板塊的正中央", "B. 接近板塊邊界", "C. 遠離所有板塊的地方", "D. 只出現在赤道上"],
        answer: "B. 接近板塊邊界"
      },
      {
        id: "sci_l9_14", unitKey: "sci_l9", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "當兩塊板塊互相分離時，岩漿會從板塊之間湧上地面形成新的地殼，這可能會形成下列哪種地貌？",
        options: ["A. 紅海裂谷", "B. 喜馬拉雅山脈", "C. 四川盆地", "D. 亞馬遜平原"],
        answer: "A. 紅海裂谷"
      },
      {
        id: "sci_l9_15", unitKey: "sci_l9", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "下列哪一項不屬於化石？",
        options: ["A. 地殼岩石中的菊石遺骸", "B. 冰層中的古生物遺骸", "C. 古生物留下的足印痕跡", "D. 火山爆發剛凝固的岩漿"],
        answer: "D. 火山爆發剛凝固的岩漿"
      },
      {
        id: "sci_l9_16", unitKey: "sci_l9", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "「沙漠」和「風蝕地貌」的形成，分別是風的甚麼作用造成的？",
        options: [
          "A. 兩者皆是侵蝕作用",
          "B. 兩者皆是堆積作用",
          "C. 沙漠是堆積作用；風蝕地貌是侵蝕作用",
          "D. 沙漠是侵蝕作用；風蝕地貌是堆積作用"
        ],
        answer: "C. 沙漠是堆積作用；風蝕地貌是侵蝕作用"
      },
      {
        id: "sci_l9_17", unitKey: "sci_l9", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "香港的「林村河谷」和「西貢扭曲的火山岩柱」，分別主要受甚麼力量影響而形成？",
        options: [
          "A. 兩者皆是地球內部力量",
          "B. 兩者皆是地球外部力量",
          "C. 林村河谷：外部力量（河水侵蝕）；西貢火山岩柱：內部力量（地殼運動擠壓）",
          "D. 林村河谷：內部力量；西貢火山岩柱：外部力量"
        ],
        answer: "C. 林村河谷：外部力量（河水侵蝕）；西貢火山岩柱：內部力量（地殼運動擠壓）"
      },
      {
        id: "sci_l9_18", unitKey: "sci_l9", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "我國科學家劉東生考察黃土高原時，發現黃土和紅土層中分別有不同習性的蝸牛化石，這證明了甚麼？",
        options: [
          "A. 蝸牛喜歡吃土壤",
          "B. 黃土高原曾經是大海",
          "C. 這些土壤和化石是證明過去氣候變化的「記錄本」",
          "D. 板塊從來沒有移動過"
        ],
        answer: "C. 這些土壤和化石是證明過去氣候變化的「記錄本」"
      },

      // 第9課 分類題 (#19 ~ #21)
      {
        id: "sci_l9_19", unitKey: "sci_l9", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "請將以下著名地理景觀放入所屬的「地貌種類」分類籃：",
        baskets: ["A. 山脈", "B. 高原", "C. 平原", "D. 盆地", "E. 河谷"],
        items: [
          { label: "1. 亞馬遜", basket: "C. 平原" },
          { label: "2. 青藏", basket: "B. 高原" },
          { label: "3. 四川", basket: "D. 盆地" },
          { label: "4. 喜馬拉雅", basket: "A. 山脈" },
          { label: "5. 尼羅", basket: "E. 河谷" }
        ],
        answer: "1配C(平原) ｜ 2配B(高原) ｜ 3配D(盆地) ｜ 4配A(山脈) ｜ 5配E(河谷)"
      },
      {
        id: "sci_l9_20", unitKey: "sci_l9", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "請將以下地貌成因放入「地球內部力量」或「地球外部力量」分類籃：",
        baskets: ["地球內部力量(地殼運動)", "地球外部力量(水和風)"],
        items: [
          { label: "1. 板塊相撞形成山脈", basket: "地球內部力量(地殼運動)" },
          { label: "2. 河水侵蝕形成河谷", basket: "地球外部力量(水和風)" },
          { label: "3. 板塊分離形成裂谷", basket: "地球內部力量(地殼運動)" },
          { label: "4. 海浪令泥沙堆積形成沙灘", basket: "地球外部力量(水和風)" },
          { label: "5. 風堆積沙土形成沙漠", basket: "地球外部力量(水和風)" }
        ],
        answer: "地球內部力量：1, 3 ｜ 地球外部力量：2, 4, 5"
      },
      {
        id: "sci_l9_21", unitKey: "sci_l9", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "請將水和風造成的地貌變化放入「侵蝕作用」或「堆積作用」分類籃：",
        baskets: ["侵蝕作用", "堆積作用"],
        items: [
          { label: "1. 河水沖刷岩石和土壤形成河谷", basket: "侵蝕作用" },
          { label: "2. 海浪把泥沙帶到岸邊形成沙灘", basket: "堆積作用" },
          { label: "3. 風使岩石變凹凸不平形成奇形怪狀岩柱", basket: "侵蝕作用" },
          { label: "4. 風持續把沙土吹到一處形成沙漠", basket: "堆積作用" }
        ],
        answer: "侵蝕作用：1, 3 ｜ 堆積作用：2, 4"
      },

      // 第9課 簡答題 (#22 ~ #24)
      {
        id: "sci_l9_22", unitKey: "sci_l9", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】為甚麼科學家可以從化石來推斷地貌的變化？",
        options: [
          "因為地殼運動會改變岩層和化石的位置，所以從化石的位置和種類，有助推斷該地區地貌的變化。",
          "因為化石自己會隨季節遷徙移動。",
          "因為化石會發出無綫電波告訴科學家。",
          "化石只能推斷明天的天氣，不能推斷地貌變化。"
        ],
        answer: "因為地殼運動會改變岩層和化石的位置，所以從化石的位置和種類，有助推斷該地區地貌的變化。"
      },
      {
        id: "sci_l9_23", unitKey: "sci_l9", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】請解釋「風蝕地貌」（奇形怪狀的岩柱或石塔）和「沙漠」分別是怎樣形成的。",
        options: [
          "風蝕地貌：風長時間侵蝕岩石，使岩石變得凹凸不平形成奇形怪狀岩柱。沙漠：風持續把沙土吹到一個地方逐漸堆積起來形成沙漠。",
          "風蝕地貌是海浪堆積而成；沙漠是河水侵蝕而成。",
          "兩者都是由於板塊分離岩漿湧出而形成。",
          "兩者都是人工建造的景觀。"
        ],
        answer: "風蝕地貌：風長時間侵蝕岩石，使岩石變得凹凸不平，並形成奇形怪狀的岩柱或石塔。沙漠：風持續把沙土吹到一個地方，沙土在這個地方逐漸堆積起來，形成沙漠。"
      },
      {
        id: "sci_l9_24", unitKey: "sci_l9", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】請說明香港「林村河谷」的上游和中下游分別受到河水的甚麼作用影響。",
        options: [
          "林村河上游被河水侵蝕成河谷；中下游流速減緩，堆積出寬廣平原。",
          "上游受到堆積作用形成沙灘；中下游受到風蝕作用形成石塔。",
          "上游和中下游都只受板塊擠壓影響，與河水無關。",
          "上游形成海溝；中下游形成高原。"
        ],
        answer: "林村河上游被河水侵蝕成河谷；中下游流速減緩，堆積出寬廣平原。"
      },

      // 第9課 看圖填充題 (#25 ~ #27)
      {
        id: "sci_l9_25", unitKey: "sci_l9", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l9_plate_diverge",
        prompt: "[板塊運動示意圖] 圖中岩漿流動帶動兩塊板塊互相______，導致地殼破裂，可能形成______地貌。",
        blanks: ["分離", "裂谷"], distractors: ["相撞", "山脈", "高原"]
      },
      {
        id: "sci_l9_26", unitKey: "sci_l9", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l9_ichthyosaur_uplift",
        prompt: "[高山出現海洋化石過程圖] 古代海洋生物「魚龍」的______被泥沙掩埋成為化石；經過多次的______，曾經位於海底的______被推升至高處，形成山脈。",
        blanks: ["遺骸", "地殼運動", "岩層"], distractors: ["空氣", "人工增雨", "海浪"]
      },
      {
        id: "sci_l9_27", unitKey: "sci_l9", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l9_three_fossils",
        prompt: "[三個古生物化石標本] 照片(1)是______化石；照片(2)是______化石；照片(3)是______化石。",
        blanks: ["魚", "菊石", "植物"], distractors: ["恐龍", "鳥類", "昆蟲"]
      },

      // 第9課 情境題 (#28 ~ #30)
      {
        id: "sci_l9_28", unitKey: "sci_l9", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
        prompt: "【情境】我國科學家在平均高度 6000 米以上的喜馬拉雅山脈上，發掘出古代海洋生物「魚龍」的化石。為甚麼高山上會出現海洋生物的化石？請詳細解釋其過程。",
        options: [
          "喜馬拉雅山脈岩層原本在海底，魚龍死後遺骸被海底泥沙掩埋成化石；後因地殼運動（板塊相撞擠壓），把海底岩層推升至高處形成高山。",
          "因為古代魚龍會飛上 6000 米高山生活。",
          "因為海浪每天都會湧上 6000 米高山把魚沖上去。",
          "因為遊客把魚骨帶上高山丟棄。"
        ],
        answer: "喜馬拉雅山脈的岩層原本在海底，當時古代海洋生物「魚龍」死後，其遺骸被海底泥沙掩埋形成化石。後來由於地殼運動（板塊相撞擠壓），把曾經位於海底的岩層推升至高處形成高山，使當年的海洋生物化石如今出現在高山之上。"
      },
      {
        id: "sci_l9_29", unitKey: "sci_l9", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
        prompt: "【情境】小華去香港世界地質公園參觀，看到「西貢扭曲的火山岩柱」，他覺得很奇怪，為甚麼堅硬的石柱會像麵條一樣彎曲？請為他解答。",
        options: [
          "因為在古代火山爆發後，熾熱的火山岩柱尚未完全凝固時，受到地殼運動（地球內部力量）的強大擠壓，因而扭曲變形。",
          "因為現代工人用機器把堅硬的石柱拗彎。",
          "因為受到微風吹拂而每天搖擺彎曲。",
          "因為雨水把石柱溶化成了麵條。"
        ],
        answer: "因為在古代火山爆發後，熾熱的火山岩柱尚未完全凝固時，受到地殼運動（地球內部力量）的強大擠壓，因而扭曲變形。"
      },
      {
        id: "sci_l9_30", unitKey: "sci_l9", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
        prompt: "【情境】科學家劉東生考察黃土高原時，發現土壤是一層黃土、一層紅土交替堆積而成，黃土有喜乾冷蝸牛化石，紅土有喜濕暖蝸牛化石。請解釋黃土和紅土是如何形成的。",
        options: [
          "乾冷的西北風從沙漠吹來粉塵堆積形成黃土；溫暖潮濕的東南風帶來雨水讓黃土變成紅土。隨着過去氣候冷暖變化，便一層層交替堆積起來。",
          "當地居民每隔一年把土壤染成紅色和黃色。",
          "火山
