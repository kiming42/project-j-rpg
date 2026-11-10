/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 逐像素手繪點陣圖資與純DOM戰鬥圖像庫 (pixel-sprites.js - v3.0)
 * 新增：純 DOM/SVG 戰鬥舞台專用的角色與魔物貼圖轉DataURL函數
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  const PAL = {
    '.': null,
    'k': '#1c1619',
    'w': '#ffffff',
    'b': '#3898ff',
    'B': '#1d5eb8',
    'c': '#8ce0ff',
    'g': '#6ab04c',
    'G': '#3d7a32',
    'l': '#a8ba59',
    'L': '#75a33d',
    'd': '#4b8b3b',
    'D': '#2d5938',
    's': '#203833',
    'f': '#f4be78',
    'r': '#e0533c',
    'R': '#a32c24',
    'o': '#e08e45',
    'O': '#c77432',
    't': '#9c6347',
    'T': '#6e4228',
    'y': '#f5b700',
    'Y': '#c98a00',
    'm': '#f6d799',
    'p': '#9d4edd',
    'P': '#5a189a',
    'e': '#8d99ae',
    'E': '#4a4e69'
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

  function initAllSprites() {
    if (SPRITES._initialized) return SPRITES;

    // 主角 4 方向
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

    // 戰寵
    const slimeRows = [
      ".....k..k..k....", "....kyykyykyk...", "....kyyyyyyyk...", "...kkkkkkkkkkk..",
      "..kkbbbbbbbbkk..", ".kbbcccbbbbbbbk.", ".kbbccbbbbbbbbk.", "kbbbbbbbbbbbbbbk",
      "kbbbkkbbbbkkbbbk", "kbbbkwbbbbkwbbbk", "kbbbbbbbbbbbbbbk", "kBBBBbbbbbbBBBBk",
      ".kBBBBBBBBBBBBk.", "..kkkkkkkkkkkk.."
    ];
    SPRITES.pet_slime = bake(slimeRows);
    SPRITES.pet_slime_shiny = bakeShiny(slimeRows);

    const dragonRows = [
      "..kk........kk..", ".kyyk.kkkk.kyyk.", "..kykrroorrkyk..", "...krrrrrrrrk...",
      "..krrffffffrrk..", "..krffkkffkkrk..", "..krrffffffrrk..", ".koorrrrrrrrook.",
      "koorrrroorrrrook", ".kkrrrroorrrrkk.", "...krrrrrrrrk...", "...kRRkkkkRRk.kk"
    ];
    SPRITES.pet_dragon = bake(dragonRows);
    SPRITES.pet_dragon_shiny = bakeShiny(dragonRows);

    const foxRows = [
      ".kkk........kkk.", ".koyk......kyok.", ".kooykkkkkkyook.", "..koooooooooook.",
      "..koowwoooowwok.", ".kowkkwookkwok.", ".kowwwwkkwwwok.", "...kkkkkkkkkkk.."
    ];
    SPRITES.pet_fox = bake(foxRows);
    SPRITES.pet_fox_shiny = bakeShiny(foxRows);

    const iceDragonRows = [
      "..kk........kk..", ".kcck.kkkk.kcck.", "..kckbbccbbkck..", "...kbbbbbbbbk...",
      "..kbbwwwwwwbbk..", "..kbwwkkwwkkbk..", "..kbbwwwwwwbbk..", ".kccbbbbbbbbcck."
    ];
    SPRITES.pet_icedragon = bake(iceDragonRows);
    SPRITES.pet_icedragon_shiny = bakeShiny(iceDragonRows);

    // NPC
    SPRITES.npc_blacksmith = bake([
      "....kkkkkkkk....", "..kkrrrrrrrrkk..", ".krrRRRRRRRRrrk.", ".kffffffffffffk.",
      ".kffkkffffkkffk.", ".kffffTTTTffffk.", ".kffTTTTTTTTffk.", "..kkkkkkkkkkkk.."
    ]);
    SPRITES.npc_astrologer = bake([
      ".......kk.......", "......kppk......", ".....kppppk.....", "....kppyyppk....",
      "..kkppppppppkk..", ".kppppyyyyppppk.", "kkkkkkkkkkkkkkkk", "..kPffffffffPk.."
    ]);
    SPRITES.npc_guildmaster = bake([
      "......kkkk......", ".....kyyyyk.....", "...kkeeeeeekk...", ".keewwwwwwweek.",
      ".keffffffffeek.", ".kefkkffkkfeek.", ".keffffffffeek.", "...kkkkkkkkkk..."
    ]);
    SPRITES.npc_merchant = bake([
      "...kkkkkkkkkk...", "..kggggggggggk..", ".kggGGGGGGGGggk.", "kootfffffffftook",
      "kooffkkffkkffook", "kooffffffffffook", "kootkkkkkkkktook", "kooooggggggoooook"
    ]);

    // 魔物
    const bambooRows = [
      "....kkkkkkkk....", "..kkllllllllkk..", ".kllLLLLLLLLllk.", "..kkkkkkkkkkkk..",
      "..kLLLLLLLLLLk..", ".kLLllllllllLLk.", ".kLlkkllllkklLk.", ".kLLlllDDlllLLk."
    ];
    SPRITES.mon_bamboo = bake(bambooRows);
    SPRITES.mon_bamboo_shiny = bakeShiny(bambooRows);

    const skullRows = [
      "....kkkkkkkk....", "..kkwwwwwwwwkk..", ".kwwwwwwwwwwwwk.", ".kwwkkkwwkkkwwk.",
      ".kwwkrkwwkrkwwk.", ".kwwwwwwwwwwwwk.", "..kwwwkkkkwwwk..", "...kkkkkkkkkk..."
    ];
    SPRITES.mon_skull = bake(skullRows);
    SPRITES.mon_skull_shiny = bakeShiny(skullRows);

    SPRITES.mon_boss = bake([
      "..kk................kk..", ".kyyk....kkkkkk....kyyk.", ".kyyyk..krrrrrrk..kyyyk.",
      "..kyyykkrrrrrrrrkkzyyk..", "...kkkkkkkkkkkkkkkkkk...", "..krrrrrrrrrrrrrrrrrrk.."
    ]);

    // 素材與裝飾
    SPRITES.mat_crystal = bake([".......kk.......", "......kcck......", "..kk..kbbk..kk..", ".kcck.kbbk.kcck."]);
    SPRITES.mat_mushroom = bake(["....kkkkkkkk....", "..kkrrrrrrrrkk..", ".krrwwrrrrwwrrk.", "krrrwwrrrrwwrrrk"]);
    SPRITES.mat_flower = bake(["....kkk..kkk....", "...kyyykkyyyk...", "..kyyyyyyyyyyk..", "..kyyyrkkrwyyk.."]);
    SPRITES.crate = bake([".kkkkkkkkkkkk.", "kooooooooooook", "koOOOOOOOOOOok", "koOkkkkkkkkOok"]);
    SPRITES.chest = bake([".kkkkkkkkkkkk.", "krrrrrrrrrrrrk", "krryyyyyyyyrrk", "krrrrrrrrrrrrk"]);

    SPRITES.deco_bench = bake([".kkkkkkkkkkkkkkkkkk.", "koooooooooooooooooOk", "koOOOOOOOOOOOOOOOOOk"]);
    SPRITES.deco_pot = bake([".......kk.......", "......kwwk......", "...kk..kk..kk...", "..kEEkkkkkkEEk.."]);
    SPRITES.deco_sign = bake(["....kkkkkkkk....", "..kkooooooookk..", ".kooOOOOOOOOook."]);
    SPRITES.deco_lantern = bake([".....kkkk.....", "...kkeeeeKk...", "..kggEEEEEEk.."]);
    SPRITES.deco_rock = bake([".....kkkkkkkk.....", "...kkgggggggekk...", "..kggGGGGeeeEEEk.."]);
    SPRITES.deco_rack = bake(["..kk..........kk..", ".kTTk..k..k..kTTk.", ".kTTk.keekee.kTTk."]);
    SPRITES.deco_anvil = bake(["..kkkkkkkkkkkk..", "kkeeeeeeeeeeeekk", "keeeeeeeeeeeeeeK"]);
    SPRITES.deco_stump = bake(["..kkkkkkkkkk..", ".kffffffffffk.", "kffooooooooFFk"]);

    SPRITES.cracked_wall = bake(["..kkkkkkkkkkkkkkkk..", ".keeeeeeeeeeeeeeeek.", "keeekeeekeeeeeeekeek"]);
    SPRITES.boulder_block = bake(["....kkkkkkkkkk....", "..kkeeeeeeeeeekk..", ".keeeewwwwweeeeek."]);
    SPRITES.deadtree_block = bake(["..kk..........kk..", ".kTTk..kkkk..kTTk.", "..kTTkkTTTTkkTTk.."]);
    SPRITES.fishing_spot = bake(["....kkkkkkkk....", "..kkcccccccckk..", ".kccbbbbbbbbcck."]);
    SPRITES.grapple_post = bake([".....kkkkkk.....", "....kooooook....", "...kooYYYYook..."]);
    SPRITES.brazier_off = bake(["....kkkkkkkk....", "..kkeeeeeeeeKk..", ".keeEEEEEEEEeek."]);
    SPRITES.brazier_on = bake([".......kk.......", "......kyyk......", ".....kywwyk....."]);
    SPRITES.ancient_ship = bake([".........kk.........", "........kmmk........", ".......kmmmmk......."]);
    SPRITES.sky_airship = bake([".....kkkkkkkkkk.....", "...kkppppppppppkk...", "..kppyyyyyyyyyyppk.."]);

    SPRITES.tree = bake([
      ".......kkkkkkkkkk.......", ".....kkllllllllllkk.....", "...kkllllllllllllllkk...",
      "..klllddddddddddlllllk..", ".klldddddddddddddddlllk."
    ]);
    SPRITES.tent = bake([
      ".........kkkkkkkkkk.........", "........koooooooooook.......", ".......koooooooooooook......"
    ]);
    SPRITES.pillar = bake([
      "....kkkkkkkkkkkkkkkk....", "..kkooooooooooooooookk.."
    ]);
    SPRITES.heart = bake([
      "..kkkk..kkkk..", ".kwwwwkkwwwwk.", "kwrrrrwwrrrrwk"
    ]);

    SPRITES._initialized = true;
    return SPRITES;
  }

  // 將 Canvas 貼圖轉為 DataURL 供純 DOM 戰鬥舞台的 <img> 標籤使用
  function getSpriteDataURL(key) {
    if (!SPRITES._initialized) initAllSprites();
    const canvas = SPRITES[key];
    if (!canvas) return "";
    return canvas.toDataURL();
  }

  window.Aetheria.Data.Sprites = {
    init: initAllSprites,
    get: function(key) {
      if (!SPRITES._initialized) initAllSprites();
      return SPRITES[key];
    },
    getDataURL: getSpriteDataURL
  };
})();
