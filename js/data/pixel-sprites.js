/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 逐像素手繪點陣圖資烘焙庫 (pixel-sprites.js)
 * 包含：主角4方向雙幀行走、4大戰寵(含閃光版)、4大NPC、5種魔物Boss、12種營地與自然裝飾
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  // 標準 Ninja Adventure 24 色調色盤
  const PAL = {
    '.': null,
    'k': '#1c1619', // 像素純黑描邊
    'w': '#ffffff', // 高光純白
    'b': '#3898ff', // 蒼藍頭巾 / 藍晶主色
    'B': '#1d5eb8', // 深藍暗部 / 忍服
    'c': '#8ce0ff', // 冰藍高光
    'g': '#6ab04c', // 嫩綠草葉
    'G': '#3d7a32', // 深綠暗部
    'l': '#a8ba59', // 暖橄欖綠
    'L': '#75a33d', // 竹青綠
    'd': '#4b8b3b', // 森林樹冠中綠
    'D': '#2d5938', // 森林樹冠深綠
    's': '#203833', // 樹底深影
    'f': '#f4be78', // 角色膚色 / 米白菇柄
    'r': '#e0533c', // 鮮紅圍巾 / 紅傘菇 / 火龍紅
    'R': '#a32c24', // 暗紅陰影
    'o': '#e08e45', // 亮橙帳篷 / 狐狸毛 / 銅色
    'O': '#c77432', // 暗橙木紋
    't': '#9c6347', // 原木棕
    'T': '#6e4228', // 深棕樹幹
    'y': '#f5b700', // 黃金 / 燈籠火光
    'Y': '#c98a00', // 暗金
    'm': '#f6d799', // 麻繩米黃 / 骨骼白
    'p': '#9d4edd', // 巫師紫 / 深淵紫晶
    'P': '#5a189a', // 深紫暗部
    'e': '#8d99ae', // 鐵砧/岩石亮灰
    'E': '#4a4e69'  // 鐵器/石材深灰
  };

  // 將字元矩陣烘焙為獨立 Offscreen Canvas 貼圖
  function bake(rows, flipX = false, customPalette = null) {
    const pal = customPalette || PAL;
    const h = rows.length;
    const w = rows[0].length;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    for (let y = 0; y < h; y++) {
      const r = rows[y];
      for (let x = 0; x < w; x++) {
        const srcX = flipX ? (w - 1 - x) : x;
        const ch = r[srcX];
        const col = pal[ch];
        if (col) {
          ctx.fillStyle = col;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    return c;
  }

  // 自動產生「✨異色閃光戰寵 (Shiny)」黃金色盤貼圖
  function bakeShiny(rows) {
    const shinyPal = Object.assign({}, PAL, {
      'b': '#ffd166', 'B': '#e09f3e', 'c': '#ffffff',
      'r': '#ff9f1c', 'R': '#c97a00', 'o': '#ffe66d', 'p': '#ff70a6'
    });
    return bake(rows, false, shinyPal);
  }

  const SPRITES = {};

  function initAllSprites() {
    if (SPRITES._initialized) return SPRITES;

    // ================= 1. 主角 4 方向 × 2 踏步動作幀 (共 8 張) =================
    // 正面 (Down) - 幀 0 & 幀 1 (左右腳交替)
    const heroDownBase = [
      ".....kkkkkk.....",
      "...kkbbbbbbkk...",
      "..kbbccccccbbk..",
      ".kbbbbbbbbbbbbk.",
      ".kBBBBBBBBBBBBk.",
      ".kBffffffffffBk.",
      ".kBfkkffffkkfBk.",
      ".kBffffffffffBk.",
      "..kkkkkkkkkkkk..",
      "...krrrrrrrrk...",
      "..kBBBBBBBBBBk..",
      "..kffBBBBBBffk..",
      "...kkBBBBBBkk..."
    ];
    SPRITES.hero_down_0 = bake([...heroDownBase, "....kBBkkBBk....", "....kTTkkTTk....", "....kkk..kkk...."]);
    SPRITES.hero_down_1 = bake([...heroDownBase, "...kBBk..kBBk...", "...kTTk..kTTk...", "...kkk....kkk..."]);
    SPRITES.hero_down   = SPRITES.hero_down_0;

    // 背面 (Up) — 後腦頭巾結 + 飄動紅巾尾 + 背部斜揹忍刀鞘
    const heroUpBase = [
      ".....kkkkkk.....",
      "...kkbbbbbbkk...",
      "..kbbccccccbbk..",
      ".kbbbbbbbbbbbbk.",
      ".kBBBBBBBBBBBBk.",
      ".kBBBBByyBBBBBk.",
      ".kBBBBByyBBBBBk.",
      "..kkkkkkkkkkkk..",
      "..krrrrrrrrrrk..",
      "..kBBBBrrkBBBk..",
      "..kBBBkwwkBBBk..",
      "..kffkwwkBBffk..",
      "...kkkBBBBBBkk.."
    ];
    SPRITES.hero_up_0 = bake([...heroUpBase, "....kBBkkBBk....", "....kTTkkTTk....", "....kkk..kkk...."]);
    SPRITES.hero_up_1 = bake([...heroUpBase, "...kBBk..kBBk...", "...kTTk..kTTk...", "...kkk....kkk..."]);
    SPRITES.hero_up   = SPRITES.hero_up_0;

    // 右側面 (Right) & 左側面 (Left) — 側面單眼 + 腦後飄動紅圍巾 + 前後跨步
    const heroSideBase = [
      ".....kkkkkk.....",
      "...kkbbbbbbkk...",
      "..kbbccccccbbk..",
      ".kbbbbbbbbbbbbk.",
      "kkBBBBBBBBBBBBk.",
      "krrBfffffffffBk.",
      "krrBffffffkkfBk.",
      ".kkBfffffffffBk.",
      "...kkkkkkkkkkk..",
      "..krrrrrrrrrk...",
      "...kBBBBBBBBk...",
      "...kBBBBfffBk...",
      "...kkBBBBBBkk..."
    ];
    SPRITES.hero_right_0 = bake([...heroSideBase, "....kBBkkBBk....", "....kTTk.kTTk...", "....kkk..kkkk..."], false);
    SPRITES.hero_right_1 = bake([...heroSideBase, "...kBBk...kBBk..", "...kTTk...kTTk..", "...kkk....kkkk.."], false);
    SPRITES.hero_right   = SPRITES.hero_right_0;

    SPRITES.hero_left_0  = bake([...heroSideBase, "....kBBkkBBk....", "....kTTk.kTTk...", "....kkk..kkkk..."], true);
    SPRITES.hero_left_1  = bake([...heroSideBase, "...kBBk...kBBk..", "...kTTk...kTTk..", "...kkk....kkkk.."], true);
    SPRITES.hero_left    = SPRITES.hero_left_0;

    // ================= 2. 四款像素戰寵 + 異色閃光版 (Shiny) =================
    // 戰寵 1：💧 皇冠藍水滴史萊姆
    const slimeRows = [
      ".....k..k..k....",
      "....kyykyykyk...",
      "....kyyyyyyyk...",
      "...kkkkkkkkkkk..",
      "..kkbbbbbbbbkk..",
      ".kbbcccbbbbbbbk.",
      ".kbbccbbbbbbbbk.",
      "kbbbbbbbbbbbbbbk",
      "kbbbkkbbbbkkbbbk",
      "kbbbkwbbbbkwbbbk",
      "kbbbbbbbbbbbbbbk",
      "kBBBBbbbbbbBBBBk",
      ".kBBBBBBBBBBBBk.",
      "..kkkkkkkkkkkk..",
      "................",
      "................"
    ];
    SPRITES.pet_slime = bake(slimeRows);
    SPRITES.pet_slime_shiny = bakeShiny(slimeRows);

    // 戰寵 2：🔥 赤炎小幼龍
    const dragonRows = [
      "..kk........kk..",
      ".kyyk.kkkk.kyyk.",
      "..kykrroorrkyk..",
      "...krrrrrrrrk...",
      "..krrffffffrrk..",
      "..krffkkffkkrk..",
      "..krrffffffrrk..",
      ".koorrrrrrrrook.",
      "koorrrroorrrrook",
      ".kkrrrroorrrrkk.",
      "...krrrrrrrrk...",
      "...kRRkkkkRRk.kk",
      "...kkk....kkkkoy",
      ".............kyo",
      "..............kk",
      "................"
    ];
    SPRITES.pet_dragon = bake(dragonRows);
    SPRITES.pet_dragon_shiny = bakeShiny(dragonRows);

    // 戰寵 3：🦊 雷光九尾小靈狐
    const foxRows = [
      ".kkk........kkk.",
      ".koyk......kyok.",
      ".kooykkkkkkyook.",
      "..koooooooooook.",
      "..koowwoooowwok.",
      "..kowkkwookkwok.",
      "..kowwwwkkwwwok.",
      "...kkkkkkkkkkk..",
      "...koooooooookk.",
      "..koowwwwwookook",
      "..koowwwwwookwwk",
      "...koooooooookk.",
      "....kTTk..kTTk..",
      "....kkk...kkk...",
      "................",
      "................"
    ];
    SPRITES.pet_fox = bake(foxRows);
    SPRITES.pet_fox_shiny = bakeShiny(foxRows);

    // 戰寵 4：❄️ 永凍冰晶幼龍
    const iceDragonRows = [
      "..kk........kk..",
      ".kcck.kkkk.kcck.",
      "..kckbbccbbkck..",
      "...kbbbbbbbbk...",
      "..kbbwwwwwwbbk..",
      "..kbwwkkwwkkbk..",
      "..kbbwwwwwwbbk..",
      ".kccbbbbbbbbcck.",
      "kccbbbbccbbbbcck",
      ".kkbbbbccbbbbkk.",
      "...kbbbbbbbbk...",
      "...kBBkkkkBBk.kk",
      "...kkk....kkkkcw",
      ".............kwc",
      "..............kk",
      "................"
    ];
    SPRITES.pet_icedragon = bake(iceDragonRows);
    SPRITES.pet_icedragon_shiny = bakeShiny(iceDragonRows);

    // ================= 3. 營地與世界 4 大核心 NPC =================
    // 👴 鐵匠大叔・巴爾 (紅頭巾 + 絡腮鬍 + 鐵匠圍裙 + 手持鐵鎚)
    SPRITES.npc_blacksmith = bake([
      "....kkkkkkkk....",
      "..kkrrrrrrrrkk..",
      ".krrRRRRRRRRrrk.",
      ".kffffffffffffk.",
      ".kffkkffffkkffk.",
      ".kffffTTTTffffk.",
      ".kffTTTTTTTTffk.",
      "..kkkkkkkkkkkk..",
      ".kffTTTTTTTTffk.",
      "keekTTTTTTTTkeek",
      "keekTTTTTTTTk.k.",
      "..kkEEEEEEEEkk..",
      "...kTTkkkkTTk...",
      "...kkkk..kkkk...",
      "................",
      "................"
    ]);

    // 🧙‍♀️ 星象少女・艾莉婭 (紫金星辰尖頂巫師帽 + 神秘法袍)
    SPRITES.npc_astrologer = bake([
      ".......kk.......",
      "......kppk......",
      ".....kppppk.....",
      "....kppyyppk....",
      "..kkppppppppkk..",
      ".kppppyyyyppppk.",
      "kkkkkkkkkkkkkkkk",
      "..kPffffffffPk..",
      "..kPfkkffkkfPk..",
      "..kPffffffffPk..",
      "...kkkkkkkkkk...",
      "..kppppyyppppk..",
      ".kpppPPPPPPpppk.",
      ".kPPPPpyypPPPPk.",
      "..kkkkkkkkkkkk..",
      "................"
    ]);

    // 🤠 公會會長・雷恩 (黃金羽飾騎士盔 + 紅披風 + 金甲)
    SPRITES.npc_guildmaster = bake([
      "......kkkk......",
      ".....kyyyyk.....",
      "...kkeeeeeekk...",
      "..keewwwwwwweek.",
      "..keffffffffeek.",
      "..kefkkffkkfeek.",
      "..keffffffffeek.",
      "...kkkkkkkkkk...",
      ".kkrrrrrrrrrrkk.",
      "krrkyyyyyyyykrrk",
      "krrkyyYYYYyykrrk",
      "krrkeeeeeeeeKrrk",
      ".kk.kYYkkYYk.kk.",
      "....kkkkkkkk....",
      "................",
      "................"
    ]);

    // 🎒 神秘行商・奇奇 (綠兜帽 + 背負超大行商木箱背囊)
    SPRITES.npc_merchant = bake([
      "...kkkkkkkkkk...",
      "..kggggggggggk..",
      ".kggGGGGGGGGggk.",
      "kootfffffffftook",
      "kooffkkffkkffook",
      "kooffffffffffook",
      "kootkkkkkkkktook",
      "kooooggggggoooook",
      ".kkkoooooooookk.",
      "...kggggggggk...",
      "....kTTkkTTk....",
      "....kkk..kkk....",
      "................",
      "................"
    ]);

    // ================= 4. 魔物與巨型 Boss 圖資 =================
    // 翠風竹子妖
    SPRITES.mon_bamboo = bake([
      "....kkkkkkkk....",
      "..kkllllllllkk..",
      ".kllLLLLLLLLllk.",
      "..kkkkkkkkkkkk..",
      "..kLLLLLLLLLLk..",
      ".kLLllllllllLLk.",
      ".kLlkkllllkklLk.",
      ".kLlkkllllkklLk.",
      ".kLLlllDDlllLLk.",
      ".kLLLLlDDlLLLLk.",
      "..kLLLLLLLLLLk..",
      "...kkkkkkkkkk...",
      "...kDDrkkrDDk...",
      "...kkkkkkkkkk...",
      "....kkk..kkk....",
      "................"
    ]);

    // 遺跡骷髏兵
    SPRITES.mon_skull = bake([
      "....kkkkkkkk....",
      "..kkwwwwwwwwkk..",
      ".kwwwwwwwwwwwwk.",
      ".kwwkkkwwkkkwwk.",
      ".kwwkrkwwkrkwwk.",
      ".kwwwwwwwwwwwwk.",
      "..kwwwkkkkwwwk..",
      "...kkkkkkkkkk...",
      "..keeeeeeeeeek..",
      ".keeBBBBBBBBeek.",
      ".keekBBBBBBkeek.",
      "..kk.kBBBBk.kk..",
      ".....kBkkBk.....",
      ".....kk..kk.....",
      "................",
      "................"
    ]);

    // 深淵赤炎龍王 Boss (24x22 巨型尺寸)
    SPRITES.mon_boss = bake([
      "..kk................kk..",
      ".kyyk....kkkkkk....kyyk.",
      ".kyyyk..krrrrrrk..kyyyk.",
      "..kyyykkrrrrrrrrkkzyyk..",
      "...kkkkkkkkkkkkkkkkkk...",
      "..krrrrrrrrrrrrrrrrrrk..",
      ".krrryykkkkkkkkkkyyrrrk.",
      ".krrywykrrrrrrrrkywyrk..",
      "krrrrrrkrrrrrrrrkrrrrrrk",
      "krrrrrrrrrrrrrrrrrrrrrrk",
      ".kRRRRRyyyyyyyyyyRRRRRk.",
      "..krrrryyyyyyyyyyrrrrk..",
      ".krrrrryyyyyyyyyyrrrrrk.",
      "krrrRRRRRRRRRRRRRRRRrrrk",
      "krrRRRRRyyyyyyyyRRRRRrrk",
      ".kkRRRRRRRRRRRRRRRRRRkk.",
      "...kkkkkk......kkkkkk...",
      "...kyyyk........kyyyk...",
      "...kkkk..........kkkk..."
    ]);

    // ================= 5. 四款精細採集素材 + 裂縫牆壁 =================
    // 💎 藍晶秘銀礦簇
    SPRITES.mat_crystal = bake([
      ".......kk.......",
      "......kcck......",
      "..kk..kbbk..kk..",
      ".kcck.kbbk.kcck.",
      ".kbbkkbccbkkbbk.",
      "kbcbbbbccbbbbcbk",
      "kbbbbbbBBbbbbbbk",
      ".kBBBBBBBBBBBBk.",
      ".kTTTTBBBBTTTTk.",
      "kTTTTTTTTTTTTTTk",
      ".kkkkkkkkkkkkkk.",
      "................"
    ]);

    // 🍄 紅傘白點微光菇
    SPRITES.mat_mushroom = bake([
      "....kkkkkkkk....",
      "..kkrrrrrrrrkk..",
      ".krrwwrrrrwwrrk.",
      "krrrwwrrrrwwrrrk",
      "krrrrrrrrrrrrrrk",
      "krrwrrrrrrrrwrrk",
      "kkkkkkkkkkkkkkkk",
      "....kffffffk....",
      "....kffffffk....",
      "..kkkfTTTTfkkk..",
      ".kggffffffffggk.",
      "..kkkkkkkkkkkk.."
    ]);

    // 🌸 翠風太陽靈花
    SPRITES.mat_flower = bake([
      "....kkk..kkk....",
      "...kyyykkyyyk...",
      "..kyyyyyyyyyyk..",
      "..kyyyrkkrwyyk..",
      "...kyyrrrryyk...",
      "..kyyyyyyyyyyk..",
      "...kkkkkkkkkk...",
      "......kggk......",
      "..kkkkkggkkkkk..",
      ".kggggGGGGggggk.",
      "..kkkkkGGkkkkk..",
      "......kkkk......"
    ]);

    // 📦 補給木箱 & 🎁 傳說紅金寶箱
    SPRITES.crate = bake([
      ".kkkkkkkkkkkk.",
      "kooooooooooook",
      "koOOOOOOOOOOok",
      "koOkkkkkkkkOok",
      "koOktttttttkOk",
      "koOktTTTTttkOk",
      "koOktTTTTttkOk",
      "koOktttttttkOk",
      "koOkkkkkkkkOok",
      "koOOOOOOOOOOok",
      "kooooooooooook",
      ".kkkkkkkkkkkk."
    ]);

    SPRITES.chest = bake([
      ".kkkkkkkkkkkk.",
      "krrrrrrrrrrrrk",
      "krryyyyyyyyrrk",
      "krrrrrrrrrrrrk",
      "kkkkkkkkkkkkkk",
      "kyyyyywwyyyyyk",
      "kRRRRkwwkRRRRk",
      "kRRRRkkkkRRRRk",
      "kRRRRRRRRRRRRk",
      ".kkkkkkkkkkkk."
    ]);

    // ================= 6. 新增！營地與野外環境豐富化裝飾 (消滅空曠感！) =================
    // 🪵 1. 露營原木長凳 (橫向 20x10)
    SPRITES.deco_bench = bake([
      ".kkkkkkkkkkkkkkkkkk.",
      "koooooooooooooooooOk",
      "koOOOOOOOOOOOOOOOOOk",
      "kttttttttttttttttttk",
      ".kkkkkkkkkkkkkkkkkk.",
      "..kTTk..........kTTk",
      "..kkkk..........kkkk"
    ]);

    // 🍲 2. 三腳架滾燙燉肉鍋 (16x16)
    SPRITES.deco_pot = bake([
      ".......kk.......",
      "......kwwk......",
      "...kk..kk..kk...",
      "..kEEkkkkkkEEk..",
      ".kEEEEEEEEEEEEk.",
      ".kEErrrrrrrrEEk.",
      ".kEEEEEEEEEEEEk.",
      "..kEEEEEEEEEEk..",
      "...kkkkkkkkkk...",
      "..kTTk.kk.kTTk..",
      ".kTTk.kyyk.kTTk.",
      ".kkk..rrrr..kkk."
    ]);

    // 🪧 3. 森林指路木牌 (16x16)
    SPRITES.deco_sign = bake([
      "....kkkkkkkk....",
      "..kkooooooookk..",
      ".kooOOOOOOOOook.",
      "kooOkkkkkkkkOook",
      "kooOOOOOOOOOOook",
      ".kooooooooooook.",
      "..kkkkkTTkkkkk..",
      "......kTTk......",
      "......kTTk......",
      ".....kkTTkk.....",
      "....kggTTggk....",
      "....kkkkkkkk...."
    ]);

    // 🏮 4. 日式青苔石燈籠 (14x18，內部發出暖黃火光)
    SPRITES.deco_lantern = bake([
      ".....kkkk.....",
      "...kkeeeeKk...",
      "..kggEEEEEEk..",
      ".kkkkkkkkkkkk.",
      "..kEkyyyyykEk.",
      "..kEkywwwykEk.",
      "..kEkyyyyykEk.",
      "..kkkkkkkkkkk.",
      "...kEEEEEEEk..",
      "....kEEEEEk...",
      "....kEEEEEk...",
      "..kkEEEEEEEkk.",
      ".kggEEEEEEEggk",
      ".kkkkkkkkkkkkk"
    ]);

    // 🪨 5. 雙層青苔景觀岩 (18x14)
    SPRITES.deco_rock = bake([
      ".....kkkkkkkk.....",
      "...kkgggggggekk...",
      "..kggGGGGeeeEEEk..",
      ".keeeeeeeeEEEEEEk.",
      "keeeeeeeEEEEEEEEEk",
      "keeeEEEEEEEEEEEEEk",
      "kEEEEEEEEEEEEEEEEk",
      ".kkkkkkkkkkkkkkkk."
    ]);

    // ⚔️ 6. 營地武器木架 (18x16)
    SPRITES.deco_rack = bake([
      "..kk..........kk..",
      ".kTTk..k..k..kTTk.",
      ".kTTk.keekee.kTTk.",
      ".kTTkkkkwwkkkkTTk.",
      ".kTTTTTTTTTTTTTTk.",
      ".kTTk.keekee.kTTk.",
      ".kTTk.keekee.kTTk.",
      ".kTTkkkkkkkkkkTTk.",
      ".kTTk........kTTk.",
      "kkkkk........kkkkk"
    ]);

    // 🔨 7. 鐵匠打鐵砧 (16x12)
    SPRITES.deco_anvil = bake([
      "..kkkkkkkkkkkk..",
      "kkeeeeeeeeeeeekk",
      "keeeeeeeeeeeeeeK",
      ".kkkkEEEEEEkkkk.",
      "....kEEEEEEk....",
      "..kkEEEEEEEEkk..",
      ".kEEEEEEEEEEEEk.",
      ".kkkkkkkkkkkkkk."
    ]);

    // 🌲 8. 年輪老樹樁 (14x12)
    SPRITES.deco_stump = bake([
      "..kkkkkkkkkk..",
      ".kffffffffffk.",
      "kffooooooooFFk",
      "kffoffffffoffk",
      ".kffffffffffk.",
      ".kttttTTTTttk.",
      ".ktttTTTTTTtk.",
      "kktttTTTTTTtkk",
      "kkkkkkkkkkkkkk"
    ]);

    // 🧱 9. 裂縫可炸開岩壁 (20x20 — Metroidvania 炸彈專用！)
    SPRITES.cracked_wall = bake([
      "..kkkkkkkkkkkkkkkk..",
      ".keeeeeeeeeeeeeeeek.",
      "keeekeeekeeeeeeekeek",
      "keekEEkeekeeeeekeEEk",
      "kekEEEkEEkkkkkEEkEEk",
      "kEEEEEkkkrrrrkkkEEEk",
      "kEEEEkrrkyyyykrrkEEk",
      "kEEEkrrkyyyyyykrrkEk",
      "kEEEEkrrkyyyykrrkEEk",
      "kEEEEEkkkrrrrkkkEEEk",
      "kEEEEEEEEkEEkEEEEEEk",
      ".kkkkkkkkkkkkkkkkkk."
    ]);

    // ================= 7. 大樹、斜頂帳篷、圓柱高台與白邊紅心 =================
    SPRITES.tree = bake([
      ".......kkkkkkkkkk.......",
      ".....kkllllllllllkk.....",
      "...kkllllllllllllllkk...",
      "..klllddddddddddlllllk..",
      ".klldddddddddddddddlllk.",
      ".kldddklllddddlllkdddlk.",
      "klddddllllddddllllddddlk",
      "kddddddddddddddddddddddk",
      "kddddDDDDddddddDDDDddddk",
      "kddDDDDDDDDddDDDDDDDDddk",
      ".kDDDDDDDDDDDDDDDDDDDDk.",
      ".kDDDDDDDssssssDDDDDDDk.",
      "..kkDDDDssssssssDDDDkk..",
      "....kkkksssssssskkkk....",
      ".......kTTTTTTTTk.......",
      ".......kTTTTTTTTk.......",
      "......kkTTTTTTTTkk......",
      ".....kssTTTTTTTTssk.....",
      "......ssssssssssss......",
      "........................"
    ]);

    SPRITES.tent = bake([
      ".........kkkkkkkkkk.........",
      "........koooooooooook.......",
      ".......koooooooooooook......",
      "......koooOOOOOOOOooook.....",
      ".....koooOOOOOOOOOOooook....",
      "....koooOOOOOOOOOOOOooook...",
      "...koooOOOOOOOOOOOOOOooook..",
      "..koooOOOOOOOOOOOOOOOOooook.",
      ".kkkkkkkkkkkkkkkkkkkkkkkkkkk",
      ".ktttttttttttttttttttttttttk",
      ".kttTTTTTTTTttttTTTTTTTTtttk",
      ".kttTTTTTTTTkkkkTTTTTTTTtttk",
      ".kttTTTTTTTkoooookTTTTTTtttk",
      ".kttTTTTTTkoTDDDTokTTTTTtttk",
      ".kttTTTTTkoTDDDDDTokTTTTtttk",
      ".kttTTTTkoTDDDDDDDTokTTTtttk",
      ".kttTTTkoTDDDDDDDDDTokTTtttk",
      ".kttTTkoTDDDDDDDDDDDTokTtttk",
      ".kkkkkkkkkkkkkkkkkkkkkkkkkkk"
    ]);

    SPRITES.pillar = bake([
      "....kkkkkkkkkkkkkkkk....",
      "..kkooooooooooooooookk..",
      ".koooOOOOOOOOOOOOOOoook.",
      "koooOOooooooooooooOOoook",
      "kooOOoooOOOOOOOOoooOOook",
      "kooOOooOOOOOOOOOOooOOook",
      "koooOOooooooooooooOOoook",
      ".koooOOOOOOOOOOOOOOoook.",
      "..kkkkkkkkkkkkkkkkkkkk..",
      ".kttttTTttttttttTTttttk.",
      ".kttttTTttttttttTTttttk.",
      ".kkkkkkkkkkkkkkkkkkkkkk.",
      ".kmmmmmmmmmmmmmmmmmmmmk.",
      ".kmmOmmmOmmmOmmmOmmmOmk.",
      ".kmmmmmmmmmmmmmmmmmmmmk.",
      ".kkkkkkkkkkkkkkkkkkkkkk.",
      ".kttttTTttttttttTTttttk.",
      ".kttttTTttttttttTTttttk.",
      ".kttttTTttttttttTTttttk.",
      ".kttttTTttttttttTTttttk.",
      ".kttttTTttttttttTTttttk.",
      "..kkkkkkkkkkkkkkkkkkkk.."
    ]);

    SPRITES.heart = bake([
      "..kkkk..kkkk..",
      ".kwwwwkkwwwwk.",
      "kwrrrrwwrrrrwk",
      "krrrrrrrrrrrrk",
      "krrwwrrrrrrrrk",
      "krrrrrrrrrrrrk",
      ".krrrrrrrrrrk.",
      "..krrrrrrrrk..",
      "...krrrrrrk...",
      "....krrrrk....",
      ".....krrk.....",
      "......kk......"
    ]);

    SPRITES._initialized = true;
    return SPRITES;
  }

  window.Aetheria.Data.Sprites = {
    init: initAllSprites,
    get: function(key) {
      if (!SPRITES._initialized) initAllSprites();
      return SPRITES[key];
    }
  };
})();