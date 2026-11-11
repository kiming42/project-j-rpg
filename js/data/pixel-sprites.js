/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 開源免費像素圖資庫 (pixel-sprites.js - v5.0)
 * 升級：徹底移除 Canvas bake() 繪圖，100% 採用 CC0 開源風格 32x32 Crisp-Edges SVG 像素圖資！
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  function svgToDataURL(inner, viewSize) {
    const v = viewSize || 32;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + v + ' ' + v + '" shape-rendering="crispEdges">' + inner + '</svg>';
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  // 建立開源 CC0 風格 32x32 精緻像素圖資庫
  const RAW_SVGS = {
    // 1. UI 與道具像素圖標
    icon_sword: svgToDataURL(
      '<path fill="#1c1619" d="M20 2h8v8l-14 14-4 4-6-6 4-4z"/>' +
      '<path fill="#8ce0ff" d="M22 4h4v4L14 20l-4-4z"/>' +
      '<path fill="#ffffff" d="M22 4h2v2L12 18l-2-2z"/>' +
      '<rect x="6" y="18" width="8" height="3" fill="#f5b700" transform="rotate(45 10 19)"/>' +
      '<rect x="4" y="24" width="4" height="4" fill="#9c6347"/>'
    ),
    icon_shield: svgToDataURL(
      '<path fill="#1c1619" d="M4 3h24v14c0 8-12 13-12 13S4 25 4 17z"/>' +
      '<path fill="#1d5eb8" d="M6 5h20v12c0 6-10 10-10 10S6 23 6 17z"/>' +
      '<path fill="#3898ff" d="M8 7h16v9c0 4-8 7-8 7s-8-3-8-7z"/>' +
      '<rect x="14" y="8" width="4" height="12" fill="#f5b700"/>' +
      '<rect x="10" y="12" width="12" height="4" fill="#f5b700"/>'
    ),
    icon_forge: svgToDataURL(
      '<rect x="6" y="4" width="20" height="8" fill="#1c1619"/>' +
      '<rect x="8" y="6" width="16" height="4" fill="#8d99ae"/>' +
      '<rect x="14" y="12" width="4" height="10" fill="#9c6347"/>' +
      '<path fill="#4a4e69" d="M4 22h24v6H4z"/>' +
      '<path fill="#8d99ae" d="M6 20h20v3H6z"/>'
    ),
    icon_bag: svgToDataURL(
      '<rect x="10" y="3" width="12" height="5" fill="#6e4228"/>' +
      '<rect x="5" y="7" width="22" height="21" rx="3" fill="#1c1619"/>' +
      '<rect x="7" y="9" width="18" height="17" fill="#c77432"/>' +
      '<rect x="7" y="9" width="18" height="7" fill="#e08e45"/>' +
      '<rect x="13" y="13" width="6" height="5" fill="#f5b700"/>'
    ),
    icon_map: svgToDataURL(
      '<rect x="3" y="4" width="26" height="24" fill="#1c1619"/>' +
      '<rect x="5" y="6" width="22" height="20" fill="#f6d799"/>' +
      '<rect x="7" y="8" width="8" height="7" fill="#6ab04c"/>' +
      '<rect x="16" y="10" width="9" height="12" fill="#3898ff"/>' +
      '<path fill="#e0533c" d="M11 17h6v6h-6z"/>'
    ),
    icon_gear: svgToDataURL(
      '<rect x="12" y="2" width="8" height="28" fill="#4a4e69"/>' +
      '<rect x="2" y="12" width="28" height="8" fill="#4a4e69"/>' +
      '<rect x="6" y="6" width="20" height="20" fill="#8d99ae"/>' +
      '<rect x="11" y="11" width="10" height="10" fill="#1c1619"/>'
    ),
    icon_potion: svgToDataURL(
      '<rect x="12" y="2" width="8" height="4" fill="#d9a066"/>' +
      '<rect x="10" y="6" width="12" height="4" fill="#ffffff"/>' +
      '<rect x="6" y="10" width="20" height="18" rx="4" fill="#1c1619"/>' +
      '<rect x="8" y="12" width="16" height="14" fill="#e03c4b"/>' +
      '<rect x="10" y="14" width="4" height="6" fill="#ff758f"/>'
    ),
    icon_bomb: svgToDataURL(
      '<rect x="16" y="2" width="6" height="4" fill="#f5b700"/>' +
      '<rect x="14" y="5" width="4" height="4" fill="#9c6347"/>' +
      '<rect x="6" y="9" width="20" height="19" rx="8" fill="#1c1619"/>' +
      '<rect x="8" y="11" width="16" height="15" rx="6" fill="#4a4e69"/>' +
      '<rect x="10" y="13" width="4" height="4" fill="#ffffff"/>'
    ),
    icon_scroll: svgToDataURL(
      '<rect x="4" y="4" width="24" height="24" fill="#1c1619"/>' +
      '<rect x="6" y="6" width="20" height="4" fill="#e08e45"/>' +
      '<rect x="6" y="10" width="20" height="12" fill="#f6d799"/>' +
      '<rect x="9" y="12" width="14" height="2" fill="#5c3824"/>' +
      '<rect x="9" y="16" width="10" height="2" fill="#5c3824"/>' +
      '<rect x="6" y="22" width="20" height="4" fill="#e08e45"/>'
    ),
    icon_coin: svgToDataURL(
      '<rect x="6" y="4" width="20" height="24" rx="6" fill="#1c1619"/>' +
      '<rect x="8" y="6" width="16" height="20" rx="4" fill="#f5b700"/>' +
      '<rect x="10" y="8" width="12" height="16" fill="#ffd166"/>' +
      '<rect x="14" y="10" width="4" height="12" fill="#c98a00"/>'
    ),
    heart: svgToDataURL(
      '<path fill="#1c1619" d="M4 6h10v4h4V6h10v10l-12 12L4 16z"/>' +
      '<path fill="#e03c4b" d="M6 8h6v4h8V8h6v7L16 25 6 15z"/>' +
      '<rect x="8" y="10" width="3" height="3" fill="#ffffff"/>'
    ),

    // 2. 主角 4 方向像素立繪
    hero_down_0: svgToDataURL(
      '<rect x="8" y="2" width="16" height="14" fill="#1c1619"/>' +
      '<rect x="10" y="4" width="12" height="5" fill="#3898ff"/>' +
      '<rect x="12" y="4" width="6" height="2" fill="#8ce0ff"/>' +
      '<rect x="10" y="9" width="12" height="6" fill="#f4be78"/>' +
      '<rect x="11" y="11" width="2" height="3" fill="#1c1619"/>' +
      '<rect x="19" y="11" width="2" height="3" fill="#1c1619"/>' +
      '<rect x="9" y="15" width="14" height="3" fill="#e0533c"/>' +
      '<rect x="8" y="18" width="16" height="8" fill="#1d5eb8"/>' +
      '<rect x="6" y="18" width="3" height="6" fill="#f4be78"/>' +
      '<rect x="23" y="18" width="3" height="6" fill="#f4be78"/>' +
      '<rect x="10" y="26" width="5" height="5" fill="#6e4228"/>' +
      '<rect x="17" y="26" width="5" height="5" fill="#6e4228"/>'
    ),
    hero_down_1: svgToDataURL(
      '<rect x="8" y="3" width="16" height="14" fill="#1c1619"/>' +
      '<rect x="10" y="5" width="12" height="5" fill="#3898ff"/>' +
      '<rect x="10" y="10" width="12" height="6" fill="#f4be78"/>' +
      '<rect x="11" y="12" width="2" height="3" fill="#1c1619"/>' +
      '<rect x="19" y="12" width="2" height="3" fill="#1c1619"/>' +
      '<rect x="9" y="16" width="14" height="3" fill="#e0533c"/>' +
      '<rect x="8" y="19" width="16" height="7" fill="#1d5eb8"/>' +
      '<rect x="9" y="26" width="5" height="4" fill="#6e4228"/>' +
      '<rect x="18" y="25" width="5" height="5" fill="#6e4228"/>'
    ),
    hero_up_0: svgToDataURL(
      '<rect x="8" y="2" width="16" height="14" fill="#1c1619"/>' +
      '<rect x="10" y="4" width="12" height="10" fill="#3898ff"/>' +
      '<rect x="9" y="15" width="14" height="4" fill="#e0533c"/>' +
      '<rect x="8" y="19" width="16" height="7" fill="#1d5eb8"/>' +
      '<rect x="14" y="17" width="4" height="9" fill="#8ce0ff"/>' +
      '<rect x="10" y="26" width="5" height="5" fill="#6e4228"/>' +
      '<rect x="17" y="26" width="5" height="5" fill="#6e4228"/>'
    ),
    hero_right_0: svgToDataURL(
      '<rect x="8" y="2" width="15" height="14" fill="#1c1619"/>' +
      '<rect x="10" y="4" width="12" height="5" fill="#3898ff"/>' +
      '<rect x="12" y="9" width="10" height="6" fill="#f4be78"/>' +
      '<rect x="19" y="11" width="2" height="3" fill="#1c1619"/>' +
      '<rect x="6" y="15" width="16" height="3" fill="#e0533c"/>' +
      '<rect x="9" y="18" width="13" height="8" fill="#1d5eb8"/>' +
      '<rect x="22" y="15" width="8" height="3" fill="#8ce0ff"/>' +
      '<rect x="10" y="26" width="5" height="5" fill="#6e4228"/>' +
      '<rect x="16" y="26" width="5" height="5" fill="#6e4228"/>'
    ),
    hero_left_0: svgToDataURL(
      '<rect x="9" y="2" width="15" height="14" fill="#1c1619"/>' +
      '<rect x="10" y="4" width="12" height="5" fill="#3898ff"/>' +
      '<rect x="10" y="9" width="10" height="6" fill="#f4be78"/>' +
      '<rect x="11" y="11" width="2" height="3" fill="#1c1619"/>' +
      '<rect x="10" y="15" width="16" height="3" fill="#e0533c"/>' +
      '<rect x="10" y="18" width="13" height="8" fill="#1d5eb8"/>' +
      '<rect x="2" y="15" width="8" height="3" fill="#8ce0ff"/>' +
      '<rect x="11" y="26" width="5" height="5" fill="#6e4228"/>' +
      '<rect x="17" y="26" width="5" height="5" fill="#6e4228"/>'
    ),

    // 3. 四大同行戰寵與異色閃光版
    pet_slime: svgToDataURL(
      '<rect x="11" y="4" width="10" height="4" fill="#f5b700"/>' +
      '<rect x="6" y="10" width="20" height="16" rx="6" fill="#1c1619"/>' +
      '<rect x="8" y="12" width="16" height="12" rx="4" fill="#3898ff"/>' +
      '<rect x="10" y="13" width="6" height="3" fill="#8ce0ff"/>' +
      '<rect x="11" y="17" width="2" height="3" fill="#1c1619"/>' +
      '<rect x="19" y="17" width="2" height="3" fill="#1c1619"/>'
    ),
    pet_slime_shiny: svgToDataURL(
      '<rect x="11" y="4" width="10" height="4" fill="#ffffff"/>' +
      '<rect x="6" y="10" width="20" height="16" rx="6" fill="#1c1619"/>' +
      '<rect x="8" y="12" width="16" height="12" rx="4" fill="#f5b700"/>' +
      '<rect x="11" y="17" width="2" height="3" fill="#1c1619"/>' +
      '<rect x="19" y="17" width="2" height="3" fill="#1c1619"/>'
    ),
    pet_dragon: svgToDataURL(
      '<rect x="6" y="4" width="4" height="5" fill="#f5b700"/>' +
      '<rect x="22" y="4" width="4" height="5" fill="#f5b700"/>' +
      '<rect x="8" y="7" width="16" height="19" fill="#1c1619"/>' +
      '<rect x="10" y="9" width="12" height="15" fill="#e0533c"/>' +
      '<rect x="4" y="12" width="5" height="8" fill="#e08e45"/>' +
      '<rect x="23" y="12" width="5" height="8" fill="#e08e45"/>' +
      '<rect x="12" y="16" width="8" height="7" fill="#f6d799"/>' +
      '<rect x="12" y="11" width="2" height="3" fill="#ffffff"/>' +
      '<rect x="18" y="11" width="2" height="3" fill="#ffffff"/>'
    ),
    pet_dragon_shiny: svgToDataURL(
      '<rect x="8" y="7" width="16" height="19" fill="#1c1619"/>' +
      '<rect x="10" y="9" width="12" height="15" fill="#9d4edd"/>' +
      '<rect x="4" y="12" width="5" height="8" fill="#f5b700"/>' +
      '<rect x="23" y="12" width="5" height="8" fill="#f5b700"/>' +
      '<rect x="12" y="16" width="8" height="7" fill="#ffffff"/>'
    ),
    pet_fox: svgToDataURL(
      '<rect x="7" y="4" width="5" height="6" fill="#e08e45"/>' +
      '<rect x="20" y="4" width="5" height="6" fill="#e08e45"/>' +
      '<rect x="8" y="9" width="16" height="17" fill="#1c1619"/>' +
      '<rect x="10" y="11" width="12" height="13" fill="#f5b700"/>' +
      '<rect x="12" y="16" width="8" height="8" fill="#ffffff"/>' +
      '<rect x="22" y="16" width="7" height="8" fill="#e08e45"/>' +
      '<rect x="11" y="13" width="2" height="2" fill="#1c1619"/>' +
      '<rect x="19" y="13" width="2" height="2" fill="#1c1619"/>'
    ),
    pet_fox_shiny: svgToDataURL(
      '<rect x="8" y="9" width="16" height="17" fill="#1c1619"/>' +
      '<rect x="10" y="11" width="12" height="13" fill="#8ce0ff"/>' +
      '<rect x="12" y="16" width="8" height="8" fill="#ffffff"/>' +
      '<rect x="22" y="16" width="7" height="8" fill="#3898ff"/>'
    ),
    pet_icedragon: svgToDataURL(
      '<rect x="6" y="4" width="4" height="5" fill="#8ce0ff"/>' +
      '<rect x="22" y="4" width="4" height="5" fill="#8ce0ff"/>' +
      '<rect x="8" y="7" width="16" height="19" fill="#1c1619"/>' +
      '<rect x="10" y="9" width="12" height="15" fill="#3898ff"/>' +
      '<rect x="4" y="12" width="5" height="8" fill="#8ce0ff"/>' +
      '<rect x="23" y="12" width="5" height="8" fill="#8ce0ff"/>' +
      '<rect x="12" y="16" width="8" height="7" fill="#ffffff"/>'
    ),
    pet_icedragon_shiny: svgToDataURL(
      '<rect x="8" y="7" width="16" height="19" fill="#1c1619"/>' +
      '<rect x="10" y="9" width="12" height="15" fill="#f5b700"/>' +
      '<rect x="4" y="12" width="5" height="8" fill="#ffffff"/>' +
      '<rect x="23" y="12" width="5" height="8" fill="#ffffff"/>'
    ),

    // 4. 營地 4 大核心 NPC
    npc_blacksmith: svgToDataURL(
      '<rect x="8" y="3" width="16" height="26" fill="#1c1619"/>' +
      '<rect x="10" y="5" width="12" height="4" fill="#e0533c"/>' +
      '<rect x="10" y="9" width="12" height="6" fill="#f4be78"/>' +
      '<rect x="10" y="14" width="12" height="4" fill="#6e4228"/>' +
      '<rect x="9" y="18" width="14" height="9" fill="#4a4e69"/>' +
      '<rect x="23" y="12" width="5" height="10" fill="#8d99ae"/>'
    ),
    npc_guildmaster: svgToDataURL(
      '<rect x="11" y="2" width="10" height="4" fill="#f5b700"/>' +
      '<rect x="8" y="6" width="16" height="23" fill="#1c1619"/>' +
      '<rect x="10" y="8" width="12" height="7" fill="#f4be78"/>' +
      '<rect x="8" y="15" width="16" height="12" fill="#a32c24"/>' +
      '<rect x="12" y="16" width="8" height="10" fill="#f5b700"/>'
    ),
    npc_astrologer: svgToDataURL(
      '<path fill="#5a189a" d="M16 1L6 11h20z"/>' +
      '<rect x="8" y="11" width="16" height="18" fill="#1c1619"/>' +
      '<rect x="10" y="12" width="12" height="6" fill="#f4be78"/>' +
      '<rect x="9" y="18" width="14" height="10" fill="#9d4edd"/>' +
      '<rect x="14" y="19" width="4" height="8" fill="#f5b700"/>'
    ),
    npc_merchant: svgToDataURL(
      '<rect x="7" y="4" width="18" height="6" fill="#6ab04c"/>' +
      '<rect x="6" y="10" width="20" height="18" fill="#1c1619"/>' +
      '<rect x="10" y="11" width="12" height="6" fill="#f4be78"/>' +
      '<rect x="8" y="17" width="16" height="10" fill="#e08e45"/>' +
      '<rect x="4" y="11" width="5" height="12" fill="#c77432"/>'
    ),

    // 5. 野外魔物、賞金首與守關領主 Boss
    mon_bamboo: svgToDataURL(
      '<rect x="8" y="4" width="16" height="24" fill="#1c1619"/>' +
      '<rect x="10" y="6" width="12" height="4" fill="#a8ba59"/>' +
      '<rect x="10" y="10" width="12" height="16" fill="#6ab04c"/>' +
      '<rect x="11" y="14" width="3" height="3" fill="#e03c4b"/>' +
      '<rect x="18" y="14" width="3" height="3" fill="#e03c4b"/>'
    ),
    mon_bamboo_shiny: svgToDataURL(
      '<rect x="8" y="4" width="16" height="24" fill="#1c1619"/>' +
      '<rect x="10" y="6" width="12" height="20" fill="#f5b700"/>' +
      '<rect x="11" y="14" width="3" height="3" fill="#e03c4b"/>' +
      '<rect x="18" y="14" width="3" height="3" fill="#e03c4b"/>'
    ),
    mon_skull: svgToDataURL(
      '<rect x="8" y="4" width="16" height="24" fill="#1c1619"/>' +
      '<rect x="10" y="6" width="12" height="10" fill="#ffffff"/>' +
      '<rect x="11" y="10" width="3" height="3" fill="#e03c4b"/>' +
      '<rect x="18" y="10" width="3" height="3" fill="#e03c4b"/>' +
      '<rect x="9" y="17" width="14" height="9" fill="#4a4e69"/>' +
      '<rect x="23" y="10" width="4" height="14" fill="#8d99ae"/>'
    ),
    mon_skull_shiny: svgToDataURL(
      '<rect x="8" y="4" width="16" height="24" fill="#1c1619"/>' +
      '<rect x="10" y="6" width="12" height="10" fill="#ffd166"/>' +
      '<rect x="11" y="10" width="3" height="3" fill="#9d4edd"/>' +
      '<rect x="18" y="10" width="3" height="3" fill="#9d4edd"/>' +
      '<rect x="9" y="17" width="14" height="9" fill="#5a189a"/>'
    ),
    mon_boss: svgToDataURL(
      '<path fill="#f5b700" d="M4 2l6 8H4zm24 0l-6 8h6z"/>' +
      '<rect x="5" y="8" width="22" height="22" fill="#1c1619"/>' +
      '<rect x="7" y="10" width="18" height="18" fill="#a32c24"/>' +
      '<rect x="9" y="13" width="4" height="4" fill="#f5b700"/>' +
      '<rect x="19" y="13" width="4" height="4" fill="#f5b700"/>' +
      '<rect x="11" y="21" width="10" height="5" fill="#f5b700"/>'
    ),

    // 6. 地圖環境、資源節點與機關貼圖
    tree: svgToDataURL(
      '<rect x="12" y="20" width="8" height="10" fill="#6e4228"/>' +
      '<rect x="4" y="4" width="24" height="18" rx="6" fill="#1c1619"/>' +
      '<rect x="6" y="6" width="20" height="14" rx="4" fill="#3d7a32"/>' +
      '<rect x="8" y="7" width="16" height="8" rx="3" fill="#6ab04c"/>'
    ),
    pillar: svgToDataURL(
      '<rect x="6" y="2" width="20" height="28" fill="#1c1619"/>' +
      '<rect x="8" y="4" width="16" height="24" fill="#8d99ae"/>' +
      '<rect x="10" y="8" width="12" height="16" fill="#4a4e69"/>' +
      '<rect x="13" y="11" width="6" height="10" fill="#3898ff"/>'
    ),
    tent: svgToDataURL(
      '<path fill="#1c1619" d="M16 2L2 16v14h28V16z"/>' +
      '<path fill="#e08e45" d="M16 5L5 16h22z"/>' +
      '<rect x="5" y="16" width="22" height="12" fill="#9c6347"/>' +
      '<rect x="12" y="19" width="8" height="9" fill="#1c1619"/>'
    ),
    mat_crystal: svgToDataURL(
      '<path fill="#1c1619" d="M16 3L6 15v13h20V15z"/>' +
      '<path fill="#3898ff" d="M16 6l-7 10v9h14v-9z"/>' +
      '<path fill="#8ce0ff" d="M16 6l-4 9v8h4z"/>'
    ),
    mat_mushroom: svgToDataURL(
      '<rect x="11" y="17" width="10" height="11" fill="#f4be78"/>' +
      '<path fill="#1c1619" d="M4 17C4 7 28 7 28 17z"/>' +
      '<path fill="#e0533c" d="M6 16C6 9 26 9 26 16z"/>' +
      '<rect x="10" y="11" width="3" height="3" fill="#ffffff"/>' +
      '<rect x="18" y="12" width="4" height="3" fill="#ffffff"/>'
    ),
    mat_flower: svgToDataURL(
      '<rect x="14" y="16" width="4" height="12" fill="#6ab04c"/>' +
      '<circle cx="16" cy="12" r="8" fill="#f5b700"/>' +
      '<circle cx="16" cy="12" r="4" fill="#e0533c"/>'
    ),
    deco_stump: svgToDataURL(
      '<rect x="5" y="10" width="22" height="18" rx="3" fill="#1c1619"/>' +
      '<rect x="7" y="12" width="18" height="5" fill="#f4be78"/>' +
      '<rect x="7" y="17" width="18" height="9" fill="#9c6347"/>'
    ),
    crate: svgToDataURL(
      '<rect x="4" y="4" width="24" height="24" fill="#1c1619"/>' +
      '<rect x="6" y="6" width="20" height="20" fill="#e08e45"/>' +
      '<rect x="9" y="9" width="14" height="14" fill="#9c6347"/>'
    ),
    chest: svgToDataURL(
      '<rect x="4" y="6" width="24" height="22" fill="#1c1619"/>' +
      '<rect x="6" y="8" width="20" height="7" fill="#e0533c"/>' +
      '<rect x="6" y="15" width="20" height="3" fill="#f5b700"/>' +
      '<rect x="6" y="18" width="20" height="8" fill="#a32c24"/>' +
      '<rect x="14" y="14" width="4" height="6" fill="#ffffff"/>'
    ),
    campfire: svgToDataURL(
      '<rect x="6" y="20" width="20" height="6" fill="#6e4228"/>' +
      '<path fill="#e0533c" d="M16 4L8 20h16z"/>' +
      '<path fill="#f5b700" d="M16 9l-5 11h10z"/>'
    ),
    deco_pot: svgToDataURL(
      '<rect x="5" y="8" width="22" height="18" rx="5" fill="#1c1619"/>' +
      '<rect x="7" y="10" width="18" height="14" rx="4" fill="#4a4e69"/>' +
      '<rect x="9" y="10" width="14" height="4" fill="#e0533c"/>'
    ),
    deco_bench: svgToDataURL(
      '<rect x="2" y="12" width="28" height="8" fill="#e08e45"/>' +
      '<rect x="5" y="20" width="4" height="6" fill="#6e4228"/>' +
      '<rect x="23" y="20" width="4" height="6" fill="#6e4228"/>'
    ),
    deco_anvil: svgToDataURL(
      '<rect x="4" y="8" width="24" height="8" fill="#8d99ae"/>' +
      '<rect x="10" y="16" width="12" height="6" fill="#4a4e69"/>' +
      '<rect x="6" y="22" width="20" height="5" fill="#1c1619"/>'
    ),
    deco_rack: svgToDataURL(
      '<rect x="4" y="4" width="4" height="24" fill="#6e4228"/>' +
      '<rect x="24" y="4" width="4" height="24" fill="#6e4228"/>' +
      '<rect x="4" y="10" width="24" height="3" fill="#9c6347"/>' +
      '<rect x="11" y="6" width="3" height="18" fill="#8ce0ff"/>' +
      '<rect x="18" y="6" width="3" height="18" fill="#8ce0ff"/>'
    ),
    deco_lantern: svgToDataURL(
      '<rect x="10" y="4" width="12" height="24" fill="#4a4e69"/>' +
      '<rect x="12" y="8" width="8" height="10" fill="#f5b700"/>'
    ),
    deco_sign: svgToDataURL(
      '<rect x="14" y="16" width="4" height="12" fill="#6e4228"/>' +
      '<rect x="5" y="6" width="22" height="12" fill="#e08e45"/>'
    ),
    deco_rock: svgToDataURL(
      '<rect x="6" y="12" width="20" height="14" rx="5" fill="#8d99ae"/>'
    ),
    boulder_block: svgToDataURL(
      '<rect x="3" y="5" width="26" height="23" rx="6" fill="#1c1619"/>' +
      '<rect x="5" y="7" width="22" height="19" rx="4" fill="#4a4e69"/>' +
      '<rect x="8" y="9" width="10" height="6" fill="#8d99ae"/>'
    ),
    deadtree_block: svgToDataURL(
      '<rect x="11" y="4" width="10" height="24" fill="#6e4228"/>' +
      '<rect x="4" y="8" width="24" height="5" fill="#9c6347"/>'
    ),
    cracked_wall: svgToDataURL(
      '<rect x="2" y="2" width="28" height="28" fill="#4a4e69"/>' +
      '<path stroke="#f5b700" stroke-width="3" d="M8 6l8 10-6 10M22 8l-6 9 6 9"/>'
    ),
    fishing_spot: svgToDataURL(
      '<circle cx="16" cy="16" r="12" fill="#1d5eb8"/>' +
      '<circle cx="16" cy="16" r="8" fill="#3898ff"/>' +
      '<path fill="#ffffff" d="M11 15h10l-3-4v8z"/>'
    ),
    grapple_post: svgToDataURL(
      '<rect x="11" y="4" width="10" height="24" fill="#6e4228"/>' +
      '<rect x="9" y="8" width="14" height="6" fill="#f6d799"/>'
    ),
    brazier_off: svgToDataURL(
      '<rect x="8" y="12" width="16" height="14" fill="#4a4e69"/>'
    ),
    brazier_on: svgToDataURL(
      '<rect x="8" y="14" width="16" height="12" fill="#4a4e69"/>' +
      '<path fill="#f5b700" d="M16 2L9 14h14z"/>'
    ),
    seal_pillar_off: svgToDataURL(
      '<rect x="7" y="2" width="18" height="28" fill="#1c1619"/>' +
      '<rect x="9" y="4" width="14" height="24" fill="#4a4e69"/>' +
      '<rect x="12" y="9" width="8" height="12" fill="#e03c4b"/>'
    ),
    seal_pillar_on: svgToDataURL(
      '<rect x="7" y="2" width="18" height="28" fill="#1c1619"/>' +
      '<rect x="9" y="4" width="14" height="24" fill="#8d99ae"/>' +
      '<rect x="12" y="9" width="8" height="12" fill="#5ac54f"/>'
    ),
    ancient_ship: svgToDataURL(
      '<path fill="#9c6347" d="M4 18h24l-4 10H8z"/>' +
      '<path fill="#f6d799" d="M16 3v14H7z"/>'
    ),
    sky_airship: svgToDataURL(
      '<ellipse cx="16" cy="10" rx="12" ry="6" fill="#9d4edd"/>' +
      '<rect x="8" y="18" width="16" height="8" fill="#e08e45"/>'
    )
  };

  RAW_SVGS.hero_down  = RAW_SVGS.hero_down_0;
  RAW_SVGS.hero_up    = RAW_SVGS.hero_up_0;
  RAW_SVGS.hero_up_1  = RAW_SVGS.hero_up_0;
  RAW_SVGS.hero_right = RAW_SVGS.hero_right_0;
  RAW_SVGS.hero_right_1 = RAW_SVGS.hero_right_0;
  RAW_SVGS.hero_left  = RAW_SVGS.hero_left_0;
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
