/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 逐像素手繪點陣圖資與 UI 像素小圖標庫 (pixel-sprites.js - v3.2)
 * 新增：12 款 12x12 像素 UI 小圖標 (寶劍/護盾/鐵鎚/藥水/背包/地圖/齒輪/卷軸/炸彈/金幣)
 *       及 iconHtml(key, large) 產生器，徹底取代所有 Emoji！
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
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
    'm': '#f6d799', // 麻繩米黃 / 帆布白
    'p': '#9d4edd', // 巫師紫 / 深淵紫晶
    'P': '#5a189a', // 深紫暗部
    'e': '#8d99ae', // 鐵砧/岩石亮灰
    'E': '#4a4e69'  // 鐵器/石材深灰
  };

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

  function bakeShiny(rows) {
    const shinyPal = Object.assign({}, PAL, {
      'b': '#ffd166', 'B': '#e09f3e', 'c': '#ffffff',
      'r': '#ff9f1c', 'R': '#c97a00', 'o': '#ffe66d', 'p': '#ff70a6',
      'L': '#ffd166', 'l': '#ffffff', 'e': '#ffe66d'
    });
    return bake(rows, false, shinyPal);
  }

  const SPRITES = {};
  const DATA_URLS = {};

  function initAllSprites() {
    if (SPRITES._initialized) return SPRITES;

    // ================= 0. 新增！12x12 開源風格像素 UI 小圖標 (取代 Emoji) =================
    SPRITES.icon_sword = bake([
      "........kkk.",
      ".......kccwk",
      "......kccbbk",
      ".....kccbbk.",
      "....kccbbk..",
      ".kk.kccbk...",
      ".kyykcbk....",
      "..kyyyk.....",
      ".kTTkyyk....",
      "kTTk.kk.....",
      "kkk.........",
      "............"
    ]);

    SPRITES.icon_shield = bake([
      ".kkkkkkkkkk.",
      "kbbbbbbbbbbk",
      "kbccccccccbk",
      "kbcBBBBBBcbk",
      "kbcByyyyycbk",
      "kbcBBBBBBcbk",
      ".kbccccccbk.",
      ".kbbbbbbbbk.",
      "..kBBBBBBk..",
      "...kBBBBk...",
      "....kkkk....",
      "............"
    ]);

    SPRITES.icon_forge = bake([
      "...kkkkkk...",
      "..keeeeeek..",
      ".keeEEEEeek.",
      ".kkkkkkkkkk.",
      "....kTTk....",
      "....kTTk....",
      "...kkTTkk...",
      "..keeeeeeK..",
      ".kEEEEEEEEk.",
      "kEEEEEEEEEEk",
      "kkkkkkkkkkkk",
      "............"
    ]);

    SPRITES.icon_bag = bake([
      "....kkkk....",
      "...koooOk...",
      "..kkkkkkkk..",
      ".koooooooook",
      "kooOyyyyOook",
      "kooOyyyyOook",
      "koOOOOOOOOok",
      "koOOOOOOOOok",
      "kttttttttttk",
      ".kkkkkkkkkk.",
      "............",
      "............"
    ]);

    SPRITES.icon_map = bake([
      ".kkkkkkkkkk.",
      "kmmmmmmmmmmk",
      "kmggmmmmbbmk",
      "kmgGmmmmbBmk",
      "kmmmmrrmmmmk",
      "kmmmmrrmmmmk",
      "kmbbmmmmggmk",
      "kmbBmmmmgGmk",
      "kmmmmmmmmmmk",
      ".kkkkkkkkkk.",
      "............",
      "............"
    ]);

    SPRITES.icon_gear = bake([
      "....kkkk....",
      "..kkeeeeKk..",
      ".keekkkkeek.",
      ".kek....kek.",
      "keek....keek",
      "keek....keek",
      ".kek....kek.",
      ".keekkkkeek.",
      "..kkEEEEkk..",
      "....kkkk....",
      "............",
      "............"
    ]);

    SPRITES.icon_potion = bake([
      "....kkkk....",
      "....kffk....",
      "...kkkkkk...",
      "....kwwk....",
      "..kkwwwwkk..",
      ".kwrrrrrrwk.",
      "kwrrwwrrrrwk",
      "kwrrrrrrrrwk",
      "kRRRRRRRRRRk",
      ".kkkkkkkkkk.",
      "............",
      "............"
    ]);

    SPRITES.icon_bomb = bake([
      ".......kk...",
      "......kyrk..",
      ".....kk.kk..",
      "...kkEEEkk..",
      "..kEEEEEEEk.",
      ".kEEwwEEEEEk",
      ".kEEwEEEEEEk",
      ".kEEEEEEEEEk",
      "..kEEEEEEEk.",
      "...kkkkkkk..",
      "............",
      "............"
    ]);

    SPRITES.icon_scroll = bake([
      "..kkkkkkkk..",
      ".koooooooook",
      "kmmmmmmmmmmk",
      "kmkkkkkkkmmk",
      "kmmmmmmmmmmk",
      "kmkkkkkmmmmk",
      "kmmmmmmmmmmk",
      "kooooooooook",
      ".kkkkkkkkkk.",
      "............",
      "............",
      "............"
    ]);

    SPRITES.icon_coin = bake([
      "...kkkkkk...",
      "..kyyyyyyk..",
      ".kyywwwwyyk.",
      "kyywYYYYwyyk",
      "kyywYYYYwyyk",
      "kyywYYYYwyyk",
      ".kyyYYYYyyk.",
      "..kyyyyyyk..",
      "...kkkkkk...",
      "............",
      "............",
      "............"
    ]);

    // ================= 1. 主角 4 方向 × 2 踏步動作幀 =================
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

    // ================= 2. 四款像素戰寵 + 異色閃光版 =================
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

    // ================= 3. 四大核心 NPC =================
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

    // ================= 4. 魔物與 Boss =================
    const bambooRows = [
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
    ];
    SPRITES.mon_bamboo = bake(bambooRows);
    SPRITES.mon_bamboo_shiny = bakeShiny(bambooRows);

    const skullRows = [
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
    ];
    SPRITES.mon_skull = bake(skullRows);
    SPRITES.mon_skull_shiny = bakeShiny(skullRows);

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

    // ================= 5. 採集素材與寶箱 =================
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

    // ================= 6. 營地裝飾與工具互動機關 =================
    SPRITES.deco_bench = bake([
      ".kkkkkkkkkkkkkkkkkk.",
      "koooooooooooooooooOk",
      "koOOOOOOOOOOOOOOOOOk",
      "kttttttttttttttttttk",
      ".kkkkkkkkkkkkkkkkkk.",
      "..kTTk..........kTTk",
      "..kkkk..........kkkk"
    ]);

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
      ".kTTk.kyyk.kTTk..",
      ".kkk..rrrr..kkk."
    ]);

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

    SPRITES.boulder_block = bake([
      "....kkkkkkkkkk....",
      "..kkeeeeeeeeeekk..",
      ".keeeewwwwweeeeek.",
      "keeeeeekkkeeeeeeek",
      "keeeeekEEEkeeeeeek",
      "keeeEEEEEEEEEEEEek",
      "kEEEEEEEEEEEEEEEEk",
      ".kEEEEEEEEEEEEEEk.",
      "..kkkkkkkkkkkkkk.."
    ]);

    SPRITES.deadtree_block = bake([
      "..kk..........kk..",
      ".kTTk..kkkk..kTTk.",
      "..kTTkkTTTTkkTTk..",
      "...kTTTTTTTTTTk...",
      "..kkTTTTTTTTTTkk..",
      ".kTTtTTTTTTTTtTTk.",
      "..kkkTTTTTTTTkkk..",
      "....kTTTTTTTTk....",
      "...kTTTTTTTTTTk...",
      "..kTTTTk..kTTTTk..",
      "..kkkkk....kkkkk.."
    ]);

    SPRITES.fishing_spot = bake([
      "....kkkkkkkk....",
      "..kkcccccccckk..",
      ".kccbbbbbbbbcck.",
      "kccbbkBBBBkbbcck",
      "kccbBBBBBBBBbcck",
      "kccbbkBBBBkkbcck",
      ".kccbbbbbbbbcck.",
      "..kkcccccccckk..",
      "....kkkkkkkk...."
    ]);

    SPRITES.grapple_post = bake([
      ".....kkkkkk.....",
      "....kooooook....",
      "...kooYYYYook...",
      "...kmmmmmmmmk...",
      "...kmmOmmOmmk...",
      "...kmmmmmmmmk...",
      "....kTTTTTTk....",
      "....kTTTTTTk....",
      "...kkTTTTTTkk...",
      "...kkkkkkkkkk..."
    ]);

    SPRITES.brazier_off = bake([
      "....kkkkkkkk....",
      "..kkeeeeeeeeKk..",
      ".keeEEEEEEEEeek.",
      "..kkkkkkkkkkkk..",
      "....kEEEEEEk....",
      "...kkEEEEEEkk...",
      "..kEEEEEEEEEEk..",
      "..kkkkkkkkkkkk.."
    ]);

    SPRITES.brazier_on = bake([
      ".......kk.......",
      "......kyyk......",
      ".....kywwyk.....",
      "....krryyrrk....",
      "...krrrrrrrrk...",
      "..kkeeeeeeeeKk..",
      ".keeEEEEEEEEeek.",
      "..kkkkkkkkkkkk..",
      "....kEEEEEEk....",
      "...kkEEEEEEkk...",
      "..kEEEEEEEEEEk..",
      "..kkkkkkkkkkkk.."
    ]);

    SPRITES.ancient_ship = bake([
      ".........kk.........",
      "........kmmk........",
      ".......kmmmmk.......",
      "......kmmmmmBk......",
      ".....kmmmmmmmBk.....",
      "....kmmmmmmmmmBk....",
      "...kkkkkkkkkkkkkk...",
      ".kkooooooooooooookk.",
      "koooTTTTTTTTTTTToook",
      ".koooTTTTTTTTTToook.",
      "..kkkkkkkkkkkkkkkk.."
    ]);

    SPRITES.sky_airship = bake([
      ".....kkkkkkkkkk.....",
      "...kkppppppppppkk...",
      "..kppyyyyyyyyyyppk..",
      ".kppppppppppppppppk.",
      "..kkkkkkTTTTkkkkkk..",
      "...koooooooooooook..",
      "..koooccccccccoook..",
      "...koooooooooooook..",
      "....kkkkkkkkkkkk...."
    ]);

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
    },
    getDataURL: function(key) {
      if (!SPRITES._initialized) initAllSprites();
      if (!DATA_URLS[key] && SPRITES[key]) {
        DATA_URLS[key] = SPRITES[key].toDataURL("image/png");
      }
      return DATA_URLS[key] || "";
    },
    // 生成像素小圖標 HTML <img> 標籤 (代替 Emoji)
    iconHtml: function(key, large = false) {
      const url = this.getDataURL(key);
      if (!url) return "";
      return `<img src="${url}" class="${large ? "px-icon-lg" : "px-icon"}" alt="">`;
    }
  };
})();
