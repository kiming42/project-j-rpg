/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — CC0 開源風格真 16x16 逐像素點陣圖資庫 (pixel-sprites.js - v5.1)
 * 升級：摒棄簡陋長方形色塊，每個角色、戰寵、魔物、道具與建築均採用 16x16 (256格) 逐像素矩陣編譯，
 *       具備完整 1px 黑邊、五官、髮絲高光与鎧甲陰影，零 Canvas 依賴！
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  // 16-bit 經典 RPG 調色盤字元映射表
  const PAL = {
    ".": null,
    "K": "#141013", // 1px 像素黑邊
    "W": "#ffffff", // 純白高光
    "S": "#f4be78", // 膚色
    "s": "#d49655", // 膚色暗部
    "B": "#3898ff", // 蒼藍亮色
    "b": "#1d5eb8", // 蒼藍暗部
    "C": "#8ce0ff", // 冰晶淺藍
    "R": "#e03c4b", // 緋紅亮色
    "r": "#9e1f2c", // 緋紅暗部
    "G": "#6ab04c", // 翠綠亮色
    "g": "#3d7a32", // 森林深綠
    "L": "#a8ba59", // 嫩綠高光
    "Y": "#ffd166", // 金黃高光
    "y": "#f5b700", // 黃金主色
    "O": "#e08e45", // 橘褐木色
    "o": "#9c6347", // 深木褐色
    "w": "#6e4228", // 樹幹暗褐
    "M": "#c8cbd4", // 鋼鐵銀灰
    "m": "#7a8299", // 鋼鐵暗灰
    "d": "#4a4e69", // 岩石深灰
    "P": "#b565f2", // 魔導亮紫
    "p": "#5a189a"  // 魔導深紫
  };

  // 將 16x16 像素矩陣無損編譯為 Run-Length 優化的 Crisp-Edges SVG DataURL (零 Canvas！)
  function compileMatrix16(rows, customMap) {
    const map = Object.assign({}, PAL, customMap || {});
    let rects = "";
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      let x = 0;
      while (x < row.length) {
        const ch = row[x];
        const col = map[ch];
        if (!col) {
          x++;
          continue;
        }
        let run = 1;
        while (x + run < row.length && row[x + run] === ch) {
          run++;
        }
        rects += '<rect x="' + x + '" y="' + y + '" width="' + run + '" height="1" fill="' + col + '"/>';
        x += run;
      }
    }
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">' + rects + '</svg>';
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  const MATRICES = {
    // ================= 1. 主角：蒼藍共鳴劍士 (16x16 完整頭盔/髮絲/披風/佩劍) =================
    hero_down_0: [
      "....KKKKKKKK....",
      "...KBBBBBBBBK...",
      "..KBCCCCCCCCBK..",
      "..KBBBBBBBBBBK..",
      "..KBSWSSSSWSBK..",
      "..KSSKSSSSKSSK..",
      "...KSSSSSSSSK...",
      "..KRRRRRRRRRRK..",
      ".KRBBBBBBBBBBRK.",
      ".KRBbyyyyyybBRK.",
      ".KSBbbbbbbbbBSK.",
      ".K.KbbbbbbbbK.K.",
      "...KbbKKKKbbK...",
      "...KwwK..KwwK...",
      "...KooK..KooK...",
      "...KKKK..KKKK..."
    ],
    hero_down_1: [
      "....KKKKKKKK....",
      "...KBBBBBBBBK...",
      "..KBCCCCCCCCBK..",
      "..KBBBBBBBBBBK..",
      "..KBSWSSSSWSBK..",
      "..KSSKSSSSKSSK..",
      "...KSSSSSSSSK...",
      "..KRRRRRRRRRRK..",
      ".KRBBBBBBBBBBRK.",
      ".KSBbyyyyyybBSK.",
      ".K.KbbbbbbbbK.K.",
      "...KbbbbbbbbK...",
      "..KwwK....KwwK..",
      "..KooK....KooK..",
      "..KKKK....KKKK..",
      "................"
    ],
    hero_up_0: [
      "....KKKKKKKK....",
      "...KBBBBBBBBK...",
      "..KBBBBBBBBBBK..",
      "..KbbbbbbbbbbK..",
      "..KbbbbbbbbbbK..",
      "...KbbbbbbbbK...",
      "..KRRRRRRRRRRK..",
      ".KRRRRRRRRRRRRK.",
      ".KRrrRRRRRRrrRK.",
      ".KSrrRRRRRRrrSK.",
      ".K.KrrrrrrrrK.K.",
      "...KbbbbbbbbK...",
      "...KbbKKKKbbK...",
      "...KwwK..KwwK...",
      "...KooK..KooK...",
      "...KKKK..KKKK..."
    ],
    hero_right_0: [
      "....KKKKKKKK....",
      "...KBBBBBBBBK...",
      "..KBCCCCCCCCBK..",
      "..KbbbbSSSSSSK..",
      "..KbbbSSSSKSSK..",
      "...KbbSSSSSSSK..",
      "..KRRRRRRRRRRK..",
      ".KrrBBBBBBBBK...",
      ".KrrBbyyyyyyKWWK",
      ".KrrBbbbbbbbKMMK",
      "..KKbbbbbbbbKKK.",
      "...KbbKKKKbbK...",
      "...KwwK..KwwK...",
      "...KooK..KooK...",
      "...KKKK..KKKK...",
      "................"
    ],
    hero_left_0: [
      "....KKKKKKKK....",
      "...KBBBBBBBBK...",
      "..KBCCCCCCCCBK..",
      "..KSSSSSSbbbbK..",
      "..KSSKSSSSbbbK..",
      "..KSSSSSSSbbK...",
      "..KRRRRRRRRRRK..",
      "...KBBBBBBBBrrK.",
      "KWWKyyyyyybBrrK.",
      "KMMKbbbbbbbBrrK.",
      ".KKKbbbbbbbbKK..",
      "...KbbKKKKbbK...",
      "...KwwK..KwwK...",
      "...KooK..KooK...",
      "...KKKK..KKKK...",
      "................"
    ],

    // ================= 2. 四大戰寵與異色閃光版 =================
    pet_slime: [
      "......KKKK......",
      ".....KYYYYK.....",
      ".....KyyyyK.....",
      "....KKKKKKKK....",
      "..KKBBBBBBBBKK..",
      ".KBCCCCCCCCCCBK.",
      ".KBCWWBBBBBBBBK.",
      "KBBWWBBBBBBBBBBK",
      "KBBBBBBBBBBBBBBK",
      "KBBBKWBBBBWKBBBK",
      "KBBBKKBBBBKKBBBK",
      "KBBBBBBrrBBBBBBK",
      ".KbbbbbbbbbbbbK.",
      "..KbbbbbbbbbbK..",
      "...KKKKKKKKKK...",
      "................"
    ],
    pet_dragon: [
      "..KK........KK..",
      ".KYYK......KYYK.",
      ".KyyKKKKKKKKyyK.",
      "..KRRRRRRRRRRK..",
      ".KRRRRRRRRRRRRK.",
      ".KRWKRrrrrRKWK..",
      "..KRRRRRRRRRRK..",
      ".KOORRRRRRRROOK.",
      "KOOORYYYYYYROOOK",
      "KO.KRYYYYYYRK.OK",
      "...KRyyyyyyRK...",
      "...KrrrrrrrrK...",
      "...KrrKKKKrrK...",
      "...KYYK..KYYK...",
      "...KKKK..KKKK...",
      "................"
    ],
    pet_fox: [
      ".KKK........KKK.",
      ".KORK......KROK.",
      ".KOOOKKKKKKOOOK.",
      "..KYYYYYYYYYYK..",
      ".KYYYYYYYYYYYYK.",
      ".KYWKYyyyyYKWYK.",
      ".KYYYYyyyyYYYYK.",
      "..KWWWKKKKWWWK..",
      "..KYYYYYYYYYYKKK",
      "..KYWWWWWWWWYOYK",
      "..KYWWWWWWWWYWWK",
      "...KyyyyyyyyKWWK",
      "...KyyKKKKyyKKK.",
      "...KwwK..KwwK...",
      "...KKKK..KKKK...",
      "................"
    ],
    pet_icedragon: [
      "..KK........KK..",
      ".KCCK......KCCK.",
      ".KBBKKKKKKKKBBK.",
      "..KCCCCCCCCCCK..",
      ".KCCCCCCCCCCCCK.",
      ".KCWKBbbbbBKWCK.",
      "..KCCCCCCCCCCK..",
      ".KBBCCCCCCCCBBK.",
      "KBBBCWWWWWWCBBBK",
      "KB.KCWWWWWWCK.BK",
      "...KCBBBBBBCK...",
      "...KbbbbbbbbK...",
      "...KbbKKKKbbK...",
      "...KWWK..KWWK...",
      "...KKKK..KKKK...",
      "................"
    ],

    // ================= 3. 營地 4 大核心 NPC =================
    npc_blacksmith: [
      "....KKKKKKKK....",
      "...KRRRRRRRRK...",
      "..KRRRRRRRRRRK..",
      "..KSSSSSSSSSSK..",
      "..KSSKSSSSKSSK..",
      "..KsswwwwwwssK..",
      "..KwwwwwwwwwwK..",
      ".KddddddddddddK.",
      ".KdMMMMMMMMMMdKK",
      ".KSddddddddddKMK",
      ".K.KddddddddKKMK",
      "...KddddddddK.K.",
      "...KddKKKKddK...",
      "...KwwK..KwwK...",
      "...KKKK..KKKK...",
      "................"
    ],
    npc_guildmaster: [
      "....KKKKKKKK....",
      "...KYYyyyyYYK...",
      "..KyyyyyyyyyyK..",
      "..KSSSSSSSSSSK..",
      "..KSSKSSSSKSSK..",
      "..KssWWWWWWssK..",
      "..KRRRRRRRRRRK..",
      ".KRRRRYYYYRRRRK.",
      ".KRRrryyyyrrRRK.",
      ".KSRrryyyyrrRSK.",
      ".K.KrrrrrrrrK.K.",
      "...KrrrrrrrrK...",
      "...KrrKKKKrrK...",
      "...KwwK..KwwK...",
      "...KKKK..KKKK...",
      "................"
    ],
    npc_astrologer: [
      "......KKKK......",
      ".....KPPPPK.....",
      "....KPPYYPPK....",
      "..KKPPPPPPPPKK..",
      ".KppppppppppppK.",
      "..KSSSSSSSSSSK..",
      "..KSSKSSSSKSSK..",
      "...KSSSSSSSSK...",
      "..KPPPPPPPPPPK..",
      ".KPPPYYYYYYPPPK.",
      ".KPPpyyyyyypPPK.",
      ".KSPppppppppPSK.",
      "...KppppppppK...",
      "...KppKKKKppK...",
      "...KKKK..KKKK...",
      "................"
    ],
    npc_merchant: [
      "...KKKKKKKKKK...",
      "..KGGGGGGGGGGK..",
      ".KGGLLLLLLLLGGK.",
      ".KggggggggggggK.",
      "..KSSSSSSSSSSK..",
      "..KSSKSSSSKSSK..",
      "...KssYYYYssK...",
      ".KKOOOOOOOOOOKK.",
      "KooOYYYYYYYYOooK",
      "KooOyyyyyyyyOooK",
      ".KKOooooooooOKK.",
      "...KooooooooK...",
      "...KooKKKKooK...",
      "...KwwK..KwwK...",
      "...KKKK..KKKK...",
      "................"
    ],

    // ================= 4. 魔物、賞金首與守關領主 Boss =================
    mon_bamboo: [
      "....KKKKKKKK....",
      "...KLLLLLLLLK...",
      "..KGGGGGGGGGGK..",
      "..KggggggggggK..",
      "..KGGGGGGGGGGK..",
      "..KGRWGGGGWRGK..",
      "..KGRRGGGGRRGK..",
      "..KGGGGGGGGGGK..",
      "..KggggggggggK..",
      "..KGGKKKKKKGGK..",
      "..KggggggggggK..",
      "...KGGGGGGGGK...",
      "...KggKKKKggK...",
      "...KwwK..KwwK...",
      "...KKKK..KKKK...",
      "................"
    ],
    mon_skull: [
      "....KKKKKKKK....",
      "...KWWWWWWWWK...",
      "..KWWWWWWWWWWK..",
      "..KWWKKWWKKWWK..",
      "..KWRRKWKRRWWK..",
      "...KWWWWWWWWK...",
      "....KKWWWWKK....",
      "..KKddddddddKK..",
      ".KdMMMMMMMMMMdK.",
      ".KddddddddddddK.",
      ".K.KddddddddKMWK",
      "...KddddddddKMWK",
      "...KddKKKKddKKK.",
      "...KWWK..KWWK...",
      "...KKKK..KKKK...",
      "................"
    ],
    mon_boss: [
      ".KK..........KK.",
      "KYYK..KKKK..KYYK",
      "KyyKKKRRRRKKKyyK",
      ".KRRRRRRRRRRRRK.",
      ".KRRWKRrrRKWrrK.",
      ".KRRRRRRRRRRRRK.",
      "..KRRWWWWWWrrK..",
      ".KrrrrrrrrrrrrK.",
      "KRRRRRYYYYRRRRRK",
      "KRRrrRyyyyRrrRRK",
      "KRRrrRRRRRRrrRRK",
      ".KKrrrrrrrrrrKK.",
      "..KrrrKKKKrrrK..",
      "..KYYK....KYYK..",
      "..KKKK....KKKK..",
      "................"
    ],

    // ================= 5. 環境建築、資源礦脈與機關 =================
    tree: [
      "....KKKKKKKK....",
      "..KKGGGGGGGGKK..",
      ".KGGLLLLLLLLGGK.",
      ".KGLLLLLLLLLLGK.",
      "KGGGGGGGGGGGGGGK",
      "KGGggggggggggGGK",
      "KggggggggggggggK",
      ".KggggggggggggK.",
      "..KKKKwwwwKKKK..",
      ".....KwwwwK.....",
      ".....KwoowK.....",
      ".....KwoowK.....",
      "....KKwwwwKK....",
      "...KKKKKKKKKK...",
      "................",
      "................"
    ],
    pillar: [
      "...KKKKKKKKKK...",
      "..KMMMMMMMMMMK..",
      "..KmddddddddmK..",
      "...KMMMMMMMMK...",
      "...KmddddddmK...",
      "...KddCCCCddK...",
      "...KddCWWCddK...",
      "...KddCWWCddK...",
      "...KddCCCCddK...",
      "...KmddddddmK...",
      "...KMMMMMMMMK...",
      "..KmddddddddmK..",
      "..KMMMMMMMMMMK..",
      "..KKKKKKKKKKKK..",
      "................",
      "................"
    ],
    tent: [
      ".......KK.......",
      "......KYYK......",
      ".....KOOOO.....",
      "....KOOOOOOK....",
      "...KOOooooOOK...",
      "..KOOooooooOOK..",
      ".KOOOOOOOOOOOOK.",
      "KRRRRRRRRRRRRRRK",
      "KooooooooooooooK",
      "KooRRRRRRRRRRooK",
      "KooRooooooooRooK",
      "KooRooKKKKooRooK",
      "KooRooKKKKooRooK",
      "KooRooKKKKooRooK",
      "KKKKKKKKKKKKKKKK",
      "................"
    ],
    mat_crystal: [
      ".......KK.......",
      "......KCCK......",
      ".....KCWWCK.....",
      "....KCWWBBCK....",
      "..KKCWWBBBBCKK..",
      ".KCCBBBBBBBBCCK.",
      ".KCWWBBBBBBWWCK.",
      "KCCBBBBbbbbBBCCK",
      "KBBBBbbbbbbbbBBK",
      ".KbbbbbbbbbbbbK.",
      "..KddddddddddK..",
      "..KKKKKKKKKKKK..",
      "................",
      "................",
      "................",
      "................"
    ],
    mat_mushroom: [
      "....KKKKKKKK....",
      "..KKRRRRRRRRKK..",
      ".KRRWWrrrrWWRRK.",
      "KRRRWWrrrrWWRRRK",
      "KRRRRRRRRRRRRRRK",
      "KrrrrrrrrrrrrrrK",
      ".KKKKKKKKKKKKKK.",
      "....KSSSSSSK....",
      "....KSSssSSK....",
      "....KSSssSSK....",
      "...KKssssssKK...",
      "...KKKKKKKKKK...",
      "................",
      "................",
      "................",
      "................"
    ],
    mat_flower: [
      "....KKKKKKKK....",
      "..KKYYYYYYYYKK..",
      ".KYYWWWWWWWWYYK.",
      ".KYWWRRRRRRWWYK.",
      ".KYWRRyyyyRRWYK.",
      ".KYWWrrrrrrWWYK.",
      "..KKYYYYYYYYKK..",
      "....KKKKKKKK....",
      "......KGGK......",
      "...KKKGggGKKK...",
      "..KGGGggggGGGK..",
      "...KKKggggKKK...",
      "......KKKK......",
      "................",
      "................",
      "................"
    ],
    deco_stump: [
      "................",
      "................",
      "...KKKKKKKKKK...",
      "..KSSSSSSSSSSK..",
      ".KSSooooooooSSK.",
      ".KSSooooooooSSK.",
      ".KwwwwwwwwwwwwK.",
      ".KwwwoooooowwwK.",
      ".KwwwoooooowwwK.",
      ".KwwwwwwwwwwwwK.",
      "KwwwwwwwwwwwwwwK",
      "KKKKKKKKKKKKKKKK",
      "................",
      "................",
      "................",
      "................"
    ],
    crate: [
      "..KKKKKKKKKKKK..",
      ".KOOOOOOOOOOOOK.",
      ".KOooooooooooOK.",
      ".KOoOOOOOOOOoOK.",
      ".KOoOooooooOoOK.",
      ".KOoOooooooOoOK.",
      ".KOoOOOOOOOOoOK.",
      ".KOooooooooooOK.",
      ".KOOOOOOOOOOOOK.",
      "..KKKKKKKKKKKK..",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    chest: [
      "..KKKKKKKKKKKK..",
      ".KRRRRRRRRRRRRK.",
      "KRRyyyyyyyyyyRRK",
      "KRRRRRRRRRRRRRRK",
      "KyyyyyyWWyyyyyyK",
      "KrrrrrrWWrrrrrrK",
      "KrrrrrrrrrrrrrrK",
      "KrryyyyyyyyyyrrK",
      ".KKKKKKKKKKKKKK.",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    campfire: [
      ".......KK.......",
      "......KRRK......",
      ".....KRYYRK.....",
      "....KRYWWYRK....",
      "...KRRYYYYRRK...",
      "..KRRRYYYYRRRK..",
      "..KRRRRRRRRRRK..",
      ".KwwwwwwwwwwwwK.",
      "KwwwoooooooowwwK",
      "KKKKKKKKKKKKKKKK",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    deco_pot: [
      "....KKKKKKKK....",
      "..KKRRRRRRRRKK..",
      ".KddddddddddddK.",
      "KddMMMMMMMMMMddK",
      "KddddddddddddddK",
      "KddddddddddddddK",
      ".KddddddddddddK.",
      "..KKddddddddKK..",
      "...KRRKKKKRRK...",
      "...KKKKKKKKKK...",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    deco_bench: [
      "................",
      "................",
      ".KKKKKKKKKKKKKK.",
      "KOOOOOOOOOOOOOOK",
      "KooooooooooooooK",
      ".KKKKKKKKKKKKKK.",
      "..KwwK....KwwK..",
      "..KwwK....KwwK..",
      "..KKKK....KKKK..",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    deco_anvil: [
      "................",
      ".KKKKKKKKKKKKKK.",
      "KMMMMMMMMMMMMMMK",
      "KmmmmmmmmmmmmmmK",
      ".KKKKddddddKKKK.",
      "....KddddddK....",
      "..KKddddddddKK..",
      ".KddddddddddddK.",
      ".KKKKKKKKKKKKKK.",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    deco_rack: [
      ".KK..........KK.",
      ".Kwk...KK...kwK.",
      ".Kwk..KCCK..kwK.",
      ".Kwk..KCCK..kwK.",
      ".KwwwwKCCKwwwwK.",
      ".KooooKYYKooooK.",
      ".Kwk..KwwK..kwK.",
      ".Kwk..KKKK..kwK.",
      ".Kwk........kwK.",
      "KKKK........KKKK",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    deco_lantern: [
      ".....KKKKKK.....",
      "....KddddddK....",
      "...KYYYYYYYYK...",
      "...KYWWWWWWYK...",
      "...KYWWWWWWYK...",
      "...KYYYYYYYYK...",
      "....KddddddK....",
      "......KddK......",
      "......KddK......",
      ".....KKKKKK.....",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    deco_sign: [
      "..KKKKKKKKKKKK..",
      ".KOOOOOOOOOOOOK.",
      ".KOwwwwwwwwwwOK.",
      ".KOOOOOOOOOOOOK.",
      ".KOwwwwwwwwwwOK.",
      "..KKKKwwwwKKKK..",
      ".....KwwwwK.....",
      ".....KwwwwK.....",
      ".....KwwwwK.....",
      ".....KKKKKK.....",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    deco_rock: [
      "................",
      "....KKKKKKKK....",
      "..KKMMMMMMMMKK..",
      ".KMMmmmmmmmmMMK.",
      "KMMmmmmmmmmmmMMK",
      "KddddddddddddddK",
      ".KKKKKKKKKKKKKK.",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    boulder_block: [
      "....KKKKKKKK....",
      "..KKMMMMMMMMKK..",
      ".KMMWWWWmmmmMMK.",
      "KMMWWmmmmmmmmMMK",
      "KmmmmmmmmmmmmmmK",
      "KmddddddddddddmK",
      "KddddddddddddddK",
      ".KKKKKKKKKKKKKK.",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    deadtree_block: [
      "..KK........KK..",
      ".KwwK......KwwK.",
      "..KwwKK..KKwwK..",
      "...KwwwKKwwwK...",
      "....KwwwwwwK....",
      "....KwoooowK....",
      "....KwoooowK....",
      "...KKwwwwwwKK...",
      "..KwwwwwwwwwwK..",
      "..KKKKKKKKKKKK..",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    cracked_wall: [
      "KKKKKKKKKKKKKKKK",
      "KddddKKddddddddK",
      "KdddKYYKdddddddK",
      "KddddKYYKddddddK",
      "KdddddKYYKdddddK",
      "KddddKYYKddddddK",
      "KdddKYYKdddddddK",
      "KddddKKddddddddK",
      "KKKKKKKKKKKKKKKK",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    fishing_spot: [
      "....KKKKKKKK....",
      "..KKBBBBBBBBKK..",
      ".KBBCCCCCCCCBBK.",
      "KBCWWBBBBBBWWCBK",
      "KBBWWWWWWWWWWBBK",
      "KBCWWBBBBBBWWCBK",
      ".KBBCCCCCCCCBBK.",
      "..KKBBBBBBBBKK..",
      "....KKKKKKKK....",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    grapple_post: [
      ".....KKKKKK.....",
      "....KOOOOOOK....",
      "....KYYYYYYK....",
      "....KyyyyyyK....",
      "....KwwwwwwK....",
      "....KwoooowK....",
      "....KwoooowK....",
      "...KKwwwwwwKK...",
      "...KKKKKKKKKK...",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    brazier_off: [
      "................",
      "...KKKKKKKKKK...",
      "..KddddddddddK..",
      "..KmmmmmmmmmmK..",
      "...KddddddddK...",
      "....KddddddK....",
      "...KKddddddKK...",
      "..KKKKKKKKKKKK..",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    brazier_on: [
      "......KKKK......",
      ".....KRRRRK.....",
      "....KRYYYYRK....",
      "...KRYWWWWYRK...",
      "...KKKKKKKKKK...",
      "..KddddddddddK..",
      "...KddddddddK...",
      "...KKddddddKK...",
      "..KKKKKKKKKKKK..",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    seal_pillar_off: [
      "....KKKKKKKK....",
      "...KMMMMMMMMK...",
      "...KmddddddmK...",
      "...KddRRRRddK...",
      "...KddRrrRddK...",
      "...KddRrrRddK...",
      "...KddRRRRddK...",
      "...KmddddddmK...",
      "..KKMMMMMMMMKK..",
      "..KKKKKKKKKKKK..",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    seal_pillar_on: [
      "....KKKKKKKK....",
      "...KMMMMMMMMK...",
      "...KmddddddmK...",
      "...KddGGGGddK...",
      "...KddGWWGddK...",
      "...KddGWWGddK...",
      "...KddGGGGddK...",
      "...KmddddddmK...",
      "..KKMMMMMMMMKK..",
      "..KKKKKKKKKKKK..",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    ancient_ship: [
      ".......KK.......",
      "......KWWK......",
      ".....KWWWWK.....",
      "....KWWWWWWK....",
      "...KWWWWWWWWK...",
      ".......KK.......",
      ".KKKKKKKKKKKKKK.",
      "KooooooooooooooK",
      ".KwwwwwwwwwwwwK.",
      "..KKKKKKKKKKKK..",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    sky_airship: [
      "....KKKKKKKK....",
      "..KKPPPPPPPPKK..",
      ".KPPYYYYYYYYPPK.",
      "KPPPPPPPPPPPPPPK",
      ".KKOOOOOOOOOOKK.",
      "...KooooooooK...",
      "...KwwwwwwwwK...",
      "....KKKKKKKK....",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],

    // ================= 6. UI 16x16 精緻像素小圖標 =================
    icon_sword: [
      "...........KKKK.",
      "..........KCCWWK",
      ".........KCCBWWK",
      "........KCCBBWK.",
      ".......KCCBBK...",
      "..KK..KCCBBK....",
      ".KYYKKCCBBK.....",
      "..KYYYYBBK......",
      "...KYYYYK.......",
      "..KwoKYYK.......",
      ".KwooK.KK.......",
      "KwoK............",
      "KKK.............",
      "................",
      "................",
      "................"
    ],
    icon_shield: [
      "..KKKKKKKKKKKK..",
      ".KBBBBBBBBBBBBK.",
      "KBBCCCCCCCCCCBBK",
      "KBCCBBBByyyyCCBK",
      "KBBBBByyyyyyBBBK",
      "KBBBBBBByyBBBBBK",
      ".KBBBBBBBBBBBBK.",
      "..KbbbbbbbbbbK..",
      "...KbbbbbbbbK...",
      "....KbbbbbbK....",
      ".....KKKKKK.....",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    icon_forge: [
      "..KKKKKKKKKKKK..",
      ".KMMMMMMMMMMMMK.",
      ".KmmmmmmmmmmmmK.",
      "...KKKKwwKKKK...",
      "......KwwK......",
      "......KwwK......",
      "..KKKKddddKKKK..",
      ".KddddddddddddK.",
      ".KKKKKKKKKKKKKK.",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    icon_bag: [
      ".....KKKKKK.....",
      "....KwwwwwwK....",
      "..KKOOOOOOOOOK..",
      ".KOOOOOOOOOOOOK.",
      ".KOOOIYYYYIOOOK.",
      ".KooooYYYYooooK.",
      ".KooooooooooooK.",
      ".KooooooooooooK.",
      "..KKKKKKKKKKKK..",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    icon_map: [
      ".KKKKKKKKKKKKKK.",
      "KSSSSSSSSSSSSSSK",
      "KSGGGGSSSSBBBBsk",
      "KSGGGGSSSSBBBBsk",
      "KSSSSSRRRSSSSSsk",
      "KSSSSSRRRSSSSSsk",
      "KssssssssssssssK",
      ".KKKKKKKKKKKKKK.",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    icon_gear: [
      ".....KKKKKK.....",
      "...KKMMMMMMKK...",
      "..KMMmmmmmmMMK..",
      ".KMMmmKKKKmmMMK.",
      ".KMmmK....KmmMK.",
      ".KMmmK....KmmMK.",
      ".KMMmmKKKKmmMMK.",
      "..KMMmmmmmmMMK..",
      "...KKMMMMMMKK...",
      ".....KKKKKK.....",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    icon_potion: [
      ".....KKKKKK.....",
      "....KOOOOOOK....",
      ".....KWWWWK.....",
      "...KKRRRRRRKK...",
      "..KRRWWrrrrRRK..",
      ".KRRRWWrrrrRRRK.",
      ".KRRRRRRRRRRRRK.",
      "..KrrrrrrrrrrK..",
      "...KKKKKKKKKK...",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    icon_bomb: [
      "........KKKK....",
      ".......KYYYYK...",
      "......KwwKKK....",
      "...KKKKKKKKKK...",
      "..KddddddddddK..",
      ".KddWWddddddddK.",
      ".KddWWddddddddK.",
      ".KddddddddddddK.",
      "..KddddddddddK..",
      "...KKKKKKKKKK...",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    icon_scroll: [
      "..KKKKKKKKKKKK..",
      ".KOOOOOOOOOOOOK.",
      "..KSSSSSSSSSSK..",
      "..KSwwwwwwwwSK..",
      "..KSSSSSSSSSSK..",
      "..KSwwwwwwSSSK..",
      "..KSSSSSSSSSSK..",
      ".KOOOOOOOOOOOOK.",
      "..KKKKKKKKKKKK..",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    icon_coin: [
      "....KKKKKKKK....",
      "..KKYYYYYYYYKK..",
      ".KYYyyyyyyyyYYK.",
      ".KYyyyWWWWyyyYK.",
      ".KYyyyWyyWyyyYK.",
      ".KYyyyWWWWyyyYK.",
      ".KYYyyyyyyyyYYK.",
      "..KKYYYYYYYYKK..",
      "....KKKKKKKK....",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    heart: [
      "..KKKK....KKKK..",
      ".KRRRRK..KRRRRK.",
      "KRRWWRRKKRRRRRRK",
      "KRRWWRRRRRRRRRRK",
      "KRRRRRRRRRRRRRRK",
      ".KRRRRRRRRRRRRK.",
      "..KrrrrrrrrrrK..",
      "...KrrrrrrrrK...",
      "....KrrrrrrK....",
      ".....KKKKKK.....",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  };

  const RAW_SVGS = {};
  Object.keys(MATRICES).forEach(function(k) {
    RAW_SVGS[k] = compileMatrix16(MATRICES[k]);
  });

  // 編譯異色閃光版 (Shiny Variants)
  RAW_SVGS.pet_slime_shiny      = compileMatrix16(MATRICES.pet_slime, { B: "#ffd166", b: "#e08e45", C: "#ffffff" });
  RAW_SVGS.pet_dragon_shiny     = compileMatrix16(MATRICES.pet_dragon, { R: "#b565f2", r: "#5a189a", O: "#ffd166" });
  RAW_SVGS.pet_fox_shiny        = compileMatrix16(MATRICES.pet_fox, { Y: "#8ce0ff", y: "#3898ff", O: "#1d5eb8" });
  RAW_SVGS.pet_icedragon_shiny  = compileMatrix16(MATRICES.pet_icedragon, { C: "#ffd166", B: "#e08e45", b: "#9c6347" });
  RAW_SVGS.mon_bamboo_shiny     = compileMatrix16(MATRICES.mon_bamboo, { G: "#ffd166", g: "#e08e45", L: "#ffffff" });
  RAW_SVGS.mon_skull_shiny      = compileMatrix16(MATRICES.mon_skull, { W: "#ffd166", d: "#5a189a", M: "#b565f2" });

  // 補齊行走動畫別名
  RAW_SVGS.hero_down    = RAW_SVGS.hero_down_0;
  RAW_SVGS.hero_up      = RAW_SVGS.hero_up_0;
  RAW_SVGS.hero_up_1    = RAW_SVGS.hero_up_0;
  RAW_SVGS.hero_right   = RAW_SVGS.hero_right_0;
  RAW_SVGS.hero_right_1 = RAW_SVGS.hero_right_0;
  RAW_SVGS.hero_left    = RAW_SVGS.hero_left_0;
  RAW_SVGS.hero_left_1  = RAW_SVGS.hero_left_0;

  const IMG_ELEMENTS = {};

  function initAllSprites() {
    Object.keys(RAW_SVGS).forEach(function(k) {
      if (!IMG_ELEMENTS[k]) {
        const img = new Image();
        img.src = RAW_SVGS[k];
        IMG_ELEMENTS[k] = img;
      }
    });
    return IMG_ELEMENTS;
  }

  window.Aetheria.Data.Sprites = {
    init: initAllSprites,
    get: function(key) {
      if (!IMG_ELEMENTS[key]) initAllSprites();
      return IMG_ELEMENTS[key] || IMG_ELEMENTS.crate;
    },
    getDataURL: function(key) {
      return RAW_SVGS[key] || RAW_SVGS.crate;
    },
    iconHtml: function(key, large) {
      const url = this.getDataURL(key);
      if (!url) return "";
      return '<img src="' + url + '" class="' + (large ? "px-icon-lg" : "px-icon") + '" alt="">';
    }
  };
})();
