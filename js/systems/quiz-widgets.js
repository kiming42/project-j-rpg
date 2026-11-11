/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 六大題型互動組件與星象調頻(單/多選課)引擎 (quiz-widgets.js - v6.4)
 * 支援題型：
 *   1. eng_tile_spell : 英文串字（字數空白位 如 apple _____ / by bus __ ___ ＋ 點擊字母塊）
 *   2. classify       : 分類題（🧺 分類籃 Sorting Baskets，點擊分類籃投入項目）
 *   3. fill_blank     : 填充題（支援單格與多格填充詞語塊）
 *   4. image_fill     : 看圖填充題（教科書級有機向量圖 + 點擊放大燈箱 + 多格填充詞語塊）
 *   5. multi_mcq      : 複選題（可選多於一項，勾選後按確認提交）
 *   6. mcq / short_qa : 選擇題、簡答題、情境問答題
 * 並自動升級【設定 ➔ 星象調頻】：支援「🎯 單選課次」與「☑️ 多選課次」自由切換！
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  function shuffleArray(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  const QuizUI = {
    currentQuestion: null,
    currentCallback: null,

    renderQuestion: function(q, onResultCallback) {
      this.currentQuestion = q;
      this.currentCallback = onResultCallback;

      const subjTag = document.getElementById("q-subject-tag");
      const typeTag = document.getElementById("q-type-tag");
      const promptEl = document.getElementById("q-prompt-text");
      const diagBox = document.getElementById("q-diagram-container");
      const diagSvg = document.getElementById("q-diagram-svg");
      const area = document.getElementById("quiz-interactive-area");

      if (subjTag) subjTag.innerText = "[" + (q.subjectLabel || "知識共鳴") + "]";
      if (typeTag) typeTag.innerText = q.typeLabel || "詠唱檢定";

      // 處理看圖填充題的教科書向量插畫
      const svgContent = q.svgDiagram || (q.svgKey && window.Aetheria.QuizBridge && window.Aetheria.QuizBridge.getDiagram(q.svgKey)) || "";
      if (diagBox && diagSvg) {
        if (svgContent) {
          diagSvg.innerHTML = svgContent;
          diagBox.style.display = "flex";
        } else {
          diagSvg.innerHTML = "";
          diagBox.style.display = "none";
        }
      }

      if (!area) return;
      area.innerHTML = "";

      // 根據題型分發至對應互動組件
      if (q.type === "eng_tile_spell") {
        if (promptEl) {
          promptEl.innerHTML =
            '<div style="color:#7f2b1d; font-size:15px;">【英文串字】' + q.meaning + '</div>' +
            '<div style="font-family:monospace; font-size:14px; color:#1d3557; margin-top:2px; letter-spacing:1px;">字數位：<b>' + q.blankPattern + '</b></div>';
        }
        this.renderEngTileSpell(q, area);
      } else if (q.type === "classify") {
        if (promptEl) promptEl.innerText = q.prompt;
        this.renderClassifyBaskets(q, area);
      } else if (q.type === "fill_blank" || q.type === "image_fill") {
        this.renderFillBlanks(q, promptEl, area);
      } else if (q.type === "multi_mcq") {
        if (promptEl) promptEl.innerText = q.prompt;
        this.renderMultiMCQ(q, area);
      } else if (q.type === "matching") {
        if (promptEl) promptEl.innerText = q.prompt;
        this.renderMatching(q, area);
      } else if (q.type === "tile_spell" || q.type === "image_spell") {
        if (promptEl) promptEl.innerText = q.prompt;
        this.renderChineseTileSpell(q, area);
      } else {
        if (promptEl) promptEl.innerText = q.prompt;
        this.renderMCQ(q, area);
      }
    },

    // ================= 1. 英文串字組件 (字數空白位 _ ____ + 字母字塊點擊) =================
    renderEngTileSpell: function(q, area) {
      const self = this;
      const rawPhrase = String(q.answer || "").trim();
      const words = rawPhrase.split(/\s+/);
      const cleanLetters = [];

      // 建立每個單詞與字母的結構 (空格自動分隔，無需玩家按空白鍵)
      const wordSlotMeta = [];
      words.forEach(function(w) {
        const chars = w.split("");
        const wMeta = [];
        chars.forEach(function(ch) {
          const flatIdx = cleanLetters.length;
          cleanLetters.push(ch);
          wMeta.push(flatIdx);
        });
        wordSlotMeta.push(wMeta);
      });

      const totalLetters = cleanLetters.length;
      const filled = new Array(totalLetters).fill(null); // 存放 { bankIdx, char }

      // 建立下方打亂的字母塊池 (若單字較短則加入 2 個干擾字母，若片語較長則使用原字母打亂)
      const bankChars = cleanLetters.map(function(c) { return c.toLowerCase(); });
      if (totalLetters <= 8) {
        const extraPool = ["a", "e", "i", "o", "s", "t", "r", "n"];
        for (let i = 0; i < extraPool.length && bankChars.length < totalLetters + 2; i++) {
          if (bankChars.indexOf(extraPool[i]) === -1) bankChars.push(extraPool[i]);
        }
      }
      const shuffledBank = shuffleArray(bankChars.map(function(ch, idx) {
        return { id: idx, char: ch, used: false };
      }));

      const wrapper = document.createElement("div");
      wrapper.style.cssText = "display:flex; flex-direction:column; gap:6px;";

      // 頂部：按單詞分組的空白字母槽位 (例如 apple _____ 或 by bus __ ___)
      const slotsRow = document.createElement("div");
      slotsRow.style.cssText = "display:flex; flex-wrap:wrap; gap:10px; justify-content:center; align-items:center; background:#141013; border:2px solid var(--na-wood-mid); border-radius:6px; padding:7px 8px; min-height:44px;";

      // 中部：字母字塊區
      const bankRow = document.createElement("div");
      bankRow.style.cssText = "display:flex; flex-wrap:wrap; gap:5px; justify-content:center; max-height:110px; overflow-y:auto; padding:2px;";

      // 底部：工具列（清除重填 / 洞察藥水提示 / 確認提交）
      const ctrlRow = document.createElement("div");
      ctrlRow.style.cssText = "display:flex; justify-content:space-between; gap:6px;";

      function checkAutoOrSubmit() {
        const isFull = filled.every(function(item) { return item !== null; });
        if (!isFull) return;
        const userJoined = wordSlotMeta.map(function(wIdxs) {
          return wIdxs.map(function(idx) { return filled[idx].char; }).join("");
        }).join(" ");

        const isRight = userJoined.toLowerCase() === rawPhrase.toLowerCase();
        if (self.currentCallback) {
          self.currentCallback(isRight, rawPhrase, q);
        }
      }

      function refreshUI() {
        slotsRow.innerHTML = "";
        wordSlotMeta.forEach(function(wIdxs) {
          const wordGroup = document.createElement("div");
          wordGroup.style.cssText = "display:inline-flex; gap:3px; align-items:center;";

          wIdxs.forEach(function(flatIdx) {
            const cell = document.createElement("div");
            const val = filled[flatIdx];
            const boxSize = totalLetters > 14 ? "22px" : "27px";
            const fontSize = totalLetters > 14 ? "14px" : "16px";
            cell.style.cssText =
              "width:" + boxSize + "; height:" + boxSize + "; border-bottom:3px solid " + (val ? "var(--na-gold)" : "#8ce0ff") + ";" +
              "background:" + (val ? "#2b2118" : "#1e293b") + "; color:#ffd166; font-weight:900; font-size:" + fontSize + ";" +
              "display:flex; justify-content:center; align-items:center; border-radius:4px; cursor:pointer; font-family:monospace;";
            cell.innerText = val ? val.char : "_";

            if (val) {
              cell.onclick = function() {
                window.Aetheria.Audio.sfxTalkBlip();
                val.bankItem.used = false;
                filled[flatIdx] = null;
                refreshUI();
              };
            }
            wordGroup.appendChild(cell);
          });

          // 標示該單詞字數小標籤
          const lenBadge = document.createElement("span");
          lenBadge.style.cssText = "font-size:10px; color:#8d99ae; margin-left:1px;";
          lenBadge.innerText = "(" + wIdxs.length + ")";
          wordGroup.appendChild(lenBadge);

          slotsRow.appendChild(wordGroup);
        });

        bankRow.innerHTML = "";
        shuffledBank.forEach(function(bItem) {
          const btn = document.createElement("button");
          btn.className = "bank-char" + (bItem.used ? " used" : "");
          btn.style.cssText = "padding:5px 10px; font-size:15px; font-family:monospace; min-width:32px;";
          btn.innerText = bItem.char;
          btn.onclick = function() {
            if (bItem.used) return;
            const nextEmpty = filled.findIndex(function(x) { return x === null; });
            if (nextEmpty === -1) return;
            window.Aetheria.Audio.sfxTalkBlip();
            bItem.used = true;
            filled[nextEmpty] = { char: bItem.char, bankItem: bItem };
            refreshUI();
            if (filled.every(function(x) { return x !== null; })) {
              setTimeout(checkAutoOrSubmit, 180);
            }
          };
          bankRow.appendChild(btn);
        });
      }

      const clearBtn = document.createElement("button");
      clearBtn.className = "na-btn";
      clearBtn.style.flex = "1";
      clearBtn.innerText = "清除重填";
      clearBtn.onclick = function() {
        window.Aetheria.Audio.sfxTalkBlip();
        shuffledBank.forEach(function(b) { b.used = false; });
        for (let i = 0; i < filled.length; i++) filled[i] = null;
        refreshUI();
      };

      const hintBtn = document.createElement("button");
      hintBtn.className = "na-btn highlight";
      hintBtn.style.flex = "1";
      const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
      const hintCount = (s.inventory && s.inventory.potionHint) || 0;
      hintBtn.innerText = "洞察提示 (" + hintCount + ")";
      hintBtn.onclick = function() {
        if (!s.inventory || (s.inventory.potionHint || 0) <= 0) {
          window.Aetheria.UI.showToast("洞察藥水不足！可在營地工坊提煉或商店購買。");
          return;
        }
        s.inventory.potionHint--;
        window.Aetheria.State.save();
        hintBtn.innerText = "洞察提示 (" + s.inventory.potionHint + ")";

        // 自動填入每個單詞的第一個字母！
        wordSlotMeta.forEach(function(wIdxs) {
          const firstIdx = wIdxs[0];
          if (filled[firstIdx]) return;
          const targetChar = cleanLetters[firstIdx].toLowerCase();
          const availBank = shuffledBank.find(function(b) { return !b.used && b.char === targetChar; });
          if (availBank) {
            availBank.used = true;
            filled[firstIdx] = { char: availBank.char, bankItem: availBank };
          }
        });
        window.Aetheria.Audio.sfxGather();
        refreshUI();
        if (filled.every(function(x) { return x !== null; })) {
          setTimeout(checkAutoOrSubmit, 180);
        }
      };

      ctrlRow.appendChild(clearBtn);
      ctrlRow.appendChild(hintBtn);

      wrapper.appendChild(slotsRow);
      wrapper.appendChild(bankRow);
      wrapper.appendChild(ctrlRow);
      area.appendChild(wrapper);

      refreshUI();
    },

    // ================= 2. 分類題組件：🧺 分類籃 (Sorting Baskets) =================
    renderClassifyBaskets: function(q, area) {
      const self = this;
      const items = (q.items || []).map(function(it, idx) {
        return { id: idx, label: it.label, targetBasket: it.basket, placedBasket: null };
      });
      const baskets = q.baskets || [];
      let activeItemId = 0;

      const wrapper = document.createElement("div");
      wrapper.style.cssText = "display:flex; flex-direction:column; gap:6px;";

      // 頂部：待分類項目池
      const poolBox = document.createElement("div");
      poolBox.style.cssText = "background:#141013; border:2px solid var(--na-wood-mid); border-radius:6px; padding:6px 8px;";

      // 下方：分類籃網格
      const basketGrid = document.createElement("div");
      const cols = baskets.length >= 4 ? "1fr 1fr" : (baskets.length === 3 ? "repeat(3, 1fr)" : "1fr 1fr");
      basketGrid.style.cssText = "display:grid; grid-template-columns:" + cols + "; gap:6px;";

      function submitClassification() {
        const allCorrect = items.every(function(it) {
          return it.placedBasket === it.targetBasket;
        });
        if (self.currentCallback) {
          self.currentCallback(allCorrect, q.answer || "請參考課本分類", q);
        }
      }

      function refreshClassifyUI() {
        const unplaced = items.filter(function(it) { return it.placedBasket === null; });
        if (unplaced.length > 0 && (activeItemId === null || items[activeItemId].placedBasket !== null)) {
          activeItemId = unplaced[0].id;
        }

        // 渲染待分類項目區
        if (unplaced.length === 0) {
          poolBox.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<span style="color:#5ac54f; font-weight:900; font-size:13px;">✓ 所有項目已放入分類籃！（點擊籃內項目可取回重排）</span>' +
              '<button class="na-btn highlight" id="btn-submit-classify" style="padding:4px 12px;">確認提交 ✓</button>' +
            '</div>';
          const subBtn = poolBox.querySelector("#btn-submit-classify");
          if (subBtn) subBtn.onclick = submitClassification;
        } else {
          const curItem = items[activeItemId] || unplaced[0];
          let pillsHtml = unplaced.map(function(it) {
            const isSel = (it.id === curItem.id);
            return '<span data-id="' + it.id + '" class="cls-item-pill" style="display:inline-block; padding:3px 7px; margin:2px; border-radius:4px; font-size:12px; font-weight:900; cursor:pointer; ' +
              (isSel ? 'background:var(--na-gold); color:#141013; border:2px solid #fff;' : 'background:#2b2327; color:#cbd5e1; border:1px solid #594950;') + '">' +
              it.label + '</span>';
          }).join("");

          poolBox.innerHTML =
            '<div style="font-size:11px; color:#ffd166; margin-bottom:3px;">請點選下方【🧺 分類籃】，將高亮項目投入籃中（剩餘 ' + unplaced.length + ' 項）：</div>' +
            '<div>' + pillsHtml + '</div>';

          poolBox.querySelectorAll(".cls-item-pill").forEach(function(el) {
            el.onclick = function() {
              activeItemId = parseInt(el.getAttribute("data-id"), 10);
              window.Aetheria.Audio.sfxTalkBlip();
              refreshClassifyUI();
            };
          });
        }

        // 渲染各個分類籃
        basketGrid.innerHTML = "";
        baskets.forEach(function(bName) {
          const inBasket = items.filter(function(it) { return it.placedBasket === bName; });
          const bCard = document.createElement("div");
          bCard.style.cssText =
            "background:#1e293b; border:2px solid #3898ff; border-radius:6px; padding:6px; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between; min-height:58px;";

          const tagsHtml = inBasket.map(function(it) {
            // 取出簡短代號 (如 A. / 1. 或前 6 字)
            const shortTxt = it.label.length > 10 ? it.label.slice(0, 9) + "…" : it.label;
            return '<span data-ret="' + it.id + '" style="display:inline-block; background:#141013; color:#8ce0ff; border:1px solid #3898ff; border-radius:3px; padding:1px 5px; margin:2px; font-size:11px; font-weight:bold;">' +
              shortTxt + ' ×</span>';
          }).join("");

          bCard.innerHTML =
            '<div style="color:var(--na-gold); font-weight:900; font-size:12px; border-bottom:1px dashed #475569; padding-bottom:3px; margin-bottom:3px; text-align:center;">' +
              '🧺 ' + bName + ' (' + inBasket.length + ')' +
            '</div>' +
            '<div style="min-height:24px; display:flex; flex-wrap:wrap; align-items:center; justify-content:center;">' +
              (tagsHtml || '<span style="font-size:11px; color:#64748b;">點擊投入此籃</span>') +
            '</div>';

          // 點擊籃內標籤可取回
          bCard.querySelectorAll("[data-ret]").forEach(function(tagEl) {
            tagEl.onclick = function(ev) {
              ev.stopPropagation();
              const retId = parseInt(tagEl.getAttribute("data-ret"), 10);
              items[retId].placedBasket = null;
              activeItemId = retId;
              window.Aetheria.Audio.sfxTalkBlip();
              refreshClassifyUI();
            };
          });

          // 點擊分類籃將當前項目投入籃中
          bCard.onclick = function() {
            const unplacedNow = items.filter(function(it) { return it.placedBasket === null; });
            if (unplacedNow.length === 0) return;
            const targetItem = (activeItemId !== null && items[activeItemId] && items[activeItemId].placedBasket === null)
              ? items[activeItemId]
              : unplacedNow[0];
            if (!targetItem) return;

            window.Aetheria.Audio.sfxGather();
            targetItem.placedBasket = bName;
            const nextUnplaced = items.find(function(it) { return it.placedBasket === null; });
            activeItemId = nextUnplaced ? nextUnplaced.id : null;
            refreshClassifyUI();
          };

          basketGrid.appendChild(bCard);
        });
      }

      wrapper.appendChild(poolBox);
      wrapper.appendChild(basketGrid);
      area.appendChild(wrapper);

      refreshClassifyUI();
    },

    // ================= 3. 填充題與看圖填充題組件 (支援 1~4 個空格與詞語塊) =================
    renderFillBlanks: function(q, promptEl, area) {
      const self = this;
      const blanks = q.blanks || [q.answer];
      const numBlanks = blanks.length;
      const filled = new Array(numBlanks).fill(null);

      // 組合詞語塊池 (正確答案 + 干擾詞)
      const rawBank = blanks.concat(q.distractors || []);
      const shuffledBank = shuffleArray(rawBank.map(function(w, idx) {
        return { id: idx, word: w, used: false };
      }));

      // 更新題目文字，將 ______ 依序標示為 [空格1]、[空格2]
      function updatePromptDisplay() {
        if (!promptEl) return;
        let idxCount = 0;
        const formatted = String(q.prompt || "").replace(/_{2,}/g, function() {
          const curIdx = idxCount < numBlanks ? idxCount : numBlanks - 1;
          idxCount++;
          const val = filled[curIdx];
          if (val) {
            return '<span style="background:#1e3a2f; color:#5ac54f; border:1.5px solid #5ac54f; padding:0 6px; border-radius:4px; font-weight:900;">[' + (curIdx + 1) + ': ' + val.word + ']</span>';
          }
          return '<span style="background:#141013; color:#ffd166; border:1.5px dashed #f5b700; padding:0 6px; border-radius:4px; font-weight:900;">[空格' + (curIdx + 1) + ']</span>';
        });
        promptEl.innerHTML = formatted;
      }

      const wrapper = document.createElement("div");
      wrapper.style.cssText = "display:flex; flex-direction:column; gap:8px;";

      const slotsBar = document.createElement("div");
      slotsBar.style.cssText = "display:flex; flex-wrap:wrap; gap:6px; justify-content:center;";

      const bankBar = document.createElement("div");
      bankBar.style.cssText = "display:flex; flex-wrap:wrap; gap:6px; justify-content:center;";

      function checkFillAnswer() {
        const isAllRight = blanks.every(function(ans, i) {
          return filled[i] && filled[i].word === ans;
        });
        if (self.currentCallback) {
          self.currentCallback(isAllRight, blanks.join("、"), q);
        }
      }

      function refreshFillUI() {
        updatePromptDisplay();
        slotsBar.innerHTML = "";
        for (let i = 0; i < numBlanks; i++) {
          const slotBtn = document.createElement("div");
          const val = filled[i];
          slotBtn.style.cssText =
            "min-width:86px; padding:5px 10px; border-radius:5px; font-size:13px; font-weight:900; text-align:center; cursor:pointer; " +
            (val ? "background:#2b2118; border:2px solid var(--na-gold); color:var(--na-gold);" : "background:#141013; border:2px dashed #8ce0ff; color:#8ce0ff;");
          slotBtn.innerText = val ? ("(" + (i + 1) + ") " + val.word + " ×") : ("空格 (" + (i + 1) + ")");
          if (val) {
            slotBtn.onclick = function() {
              window.Aetheria.Audio.sfxTalkBlip();
              val.bankItem.used = false;
              filled[i] = null;
              refreshFillUI();
            };
          }
          slotsBar.appendChild(slotBtn);
        }

        bankBar.innerHTML = "";
        shuffledBank.forEach(function(bItem) {
          const btn = document.createElement("button");
          btn.className = "bank-char" + (bItem.used ? " used" : "");
          btn.style.cssText = "padding:7px 12px; font-size:14px;";
          btn.innerText = bItem.word;
          btn.onclick = function() {
            if (bItem.used) return;
            const nextEmpty = filled.findIndex(function(x) { return x === null; });
            if (nextEmpty === -1) return;
            window.Aetheria.Audio.sfxTalkBlip();
            bItem.used = true;
            filled[nextEmpty] = { word: bItem.word, bankItem: bItem };
            refreshFillUI();
            if (filled.every(function(x) { return x !== null; })) {
              setTimeout(checkFillAnswer, 200);
            }
          };
          bankBar.appendChild(btn);
        });
      }

      wrapper.appendChild(slotsBar);
      wrapper.appendChild(bankBar);
      area.appendChild(wrapper);

      refreshFillUI();
    },

    // ================= 4. 複選題組件 (可選多於一項) =================
    renderMultiMCQ: function(q, area) {
      const self = this;
      const selectedMap = {};
      const opts = q.options || [];

      const wrapper = document.createElement("div");
      wrapper.style.cssText = "display:flex; flex-direction:column; gap:5px;";

      const grid = document.createElement("div");
      grid.className = "mcq-grid";

      const submitBtn = document.createElement("button");
      submitBtn.className = "na-btn highlight";
      submitBtn.style.padding = "8px";
      submitBtn.innerText = "選好後點擊確認提交 ✓";

      function refreshMultiUI() {
        grid.innerHTML = "";
        opts.forEach(function(opt) {
          const isSel = Boolean(selectedMap[opt]);
          const btn = document.createElement("button");
          btn.className = "mcq-btn";
          btn.style.cssText =
            "font-size:13px; padding:8px; text-align:left; " +
            (isSel ? "background:#1e3a2f; border-color:#5ac54f; color:#b7e4c7;" : "");
          btn.innerText = (isSel ? "☑ " : "☐ ") + opt;
          btn.onclick = function() {
            window.Aetheria.Audio.sfxTalkBlip();
            selectedMap[opt] = !selectedMap[opt];
            refreshMultiUI();
          };
          grid.appendChild(btn);
        });
      }

      submitBtn.onclick = function() {
        const picked = opts.filter(function(o) { return Boolean(selectedMap[o]); });
        if (picked.length === 0) {
          window.Aetheria.UI.showToast("請至少勾選一項答案！");
          return;
        }
        const targetAns = q.answers || [];
        const isRight = (picked.length === targetAns.length) && targetAns.every(function(a) { return picked.indexOf(a) !== -1; });
        if (self.currentCallback) {
          self.currentCallback(isRight, q.answer || targetAns.join("、"), q);
        }
      };

      wrapper.appendChild(grid);
      wrapper.appendChild(submitBtn);
      area.appendChild(wrapper);
      refreshMultiUI();
    },

    // ================= 5. 單選選擇題 / 簡答題 / 情境問答題 =================
    renderMCQ: function(q, area) {
      const self = this;
      const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
      let opts = (q.options || []).slice();

      // 若選項並非以 "A. " 開頭（例如簡答題、中文解釋題），自動打亂選項順序！
      const hasLetterPrefix = opts.some(function(o) { return /^[A-D]\./.test(String(o).trim()); });
      if (!hasLetterPrefix) {
        opts = shuffleArray(opts);
      }

      // 檢查是否有「學者智慧指環」或「煉金藥師」自動排除 1 個錯誤選項
      const hasSmartFilter = (s.currentJob === "alchemist") || (s.unlockedRelics && s.unlockedRelics.indexOf("r_ring") !== -1);
      let disabledOpt = null;
      if (hasSmartFilter && opts.length > 2) {
        const wrongOpts = opts.filter(function(o) {
          return o !== q.answer && String(o).indexOf(q.answer) !== 0;
        });
        if (wrongOpts.length > 0) {
          disabledOpt = wrongOpts[0];
        }
      }

      const isLongText = opts.some(function(o) { return String(o).length > 18; });
      const grid = document.createElement("div");
      grid.className = "mcq-grid";
      if (isLongText) {
        grid.style.gridTemplateColumns = "1fr";
        grid.style.gap = "5px";
      }

      opts.forEach(function(opt) {
        const btn = document.createElement("button");
        btn.className = "mcq-btn";
        if (isLongText) {
          btn.style.cssText = "font-size:12px; padding:7px 9px; text-align:left; line-height:1.35;";
        }
        if (opt === disabledOpt) {
          btn.style.opacity = "0.3";
          btn.style.pointerEvents = "none";
          btn.innerText = "[已排除] " + opt;
        } else {
          btn.innerText = opt;
          btn.onclick = function() {
            const isCorrect = (opt === q.answer) || (String(q.answer).length === 1 && String(opt).indexOf(q.answer + ".") === 0);
            if (self.currentCallback) {
              self.currentCallback(isCorrect, q.answer, q);
            }
          };
        }
        grid.appendChild(btn);
      });

      area.appendChild(grid);
    },

    // ================= 6. 中文方塊拼字與左右連線配對 =================
    renderChineseTileSpell: function(q, area) {
      const self = this;
      const targetChars = String(q.answer || "").split("");
      const filled = new Array(targetChars.length).fill(null);
      const bank = shuffleArray((q.bank || targetChars).map(function(c, i) {
        return { id: i, char: c, used: false };
      }));

      const slotsDiv = document.createElement("div");
      slotsDiv.className = "tile-slots";
      const bankDiv = document.createElement("div");
      bankDiv.className = "word-bank";

      function refresh() {
        slotsDiv.innerHTML = "";
        for (let i = 0; i < targetChars.length; i++) {
          const box = document.createElement("div");
          box.className = "slot-box";
          box.innerText = filled[i] ? filled[i].char : "";
          if (filled[i]) {
            box.onclick = function() {
              filled[i].bankItem.used = false;
              filled[i] = null;
              refresh();
            };
          }
          slotsDiv.appendChild(box);
        }

        bankDiv.innerHTML = "";
        bank.forEach(function(b) {
          const btn = document.createElement("button");
          btn.className = "bank-char" + (b.used ? " used" : "");
          btn.innerText = b.char;
          btn.onclick = function() {
            if (b.used) return;
            const nextIdx = filled.findIndex(function(x) { return x === null; });
            if (nextIdx === -1) return;
            b.used = true;
            filled[nextIdx] = { char: b.char, bankItem: b };
            refresh();
            if (filled.every(function(x) { return x !== null; })) {
              const userStr = filled.map(function(x) { return x.char; }).join("");
              setTimeout(function() {
                if (self.currentCallback) self.currentCallback(userStr === q.answer, q.answer, q);
              }, 150);
            }
          };
          bankDiv.appendChild(btn);
        });
      }

      area.appendChild(slotsDiv);
      area.appendChild(bankDiv);
      refresh();
    },

    renderMatching: function(q, area) {
      const self = this;
      const pairs = q.pairs || [];
      const leftList = pairs.map(function(p, i) { return { id: i, text: p.left, matched: false }; });
      const rightList = shuffleArray(pairs.map(function(p, i) { return { id: i, text: p.right, matched: false }; }));
      let selLeft = null;

      const cols = document.createElement("div");
      cols.className = "match-columns";
      const colL = document.createElement("div");
      colL.className = "match-col";
      const colR = document.createElement("div");
      colR.className = "match-col";

      function refresh() {
        colL.innerHTML = "";
        colR.innerHTML = "";
        leftList.forEach(function(item) {
          const d = document.createElement("div");
          d.className = "match-card" + (item.matched ? " matched" : "") + (selLeft === item.id ? " selected" : "");
          d.innerText = item.text;
          d.onclick = function() {
            if (item.matched) return;
            selLeft = item.id;
            refresh();
          };
          colL.appendChild(d);
        });

        rightList.forEach(function(item) {
          const d = document.createElement("div");
          d.className = "match-card" + (item.matched ? " matched" : "");
          d.innerText = item.text;
          d.onclick = function() {
            if (item.matched || selLeft === null) return;
            if (selLeft === item.id) {
              item.matched = true;
              leftList.find(function(x) { return x.id === item.id; }).matched = true;
              selLeft = null;
              window.Aetheria.Audio.sfxGather();
              refresh();
              if (leftList.every(function(x) { return x.matched; })) {
                setTimeout(function() {
                  if (self.currentCallback) self.currentCallback(true, "配對完成", q);
                }, 150);
              }
            } else {
              if (self.currentCallback) self.currentCallback(false, pairs.map(function(p) { return p.left + "→" + p.right; }).join("；"), q);
            }
          };
          colR.appendChild(d);
        });
      }

      cols.appendChild(colL);
      cols.appendChild(colR);
      area.appendChild(cols);
      refresh();
    },

    openLightbox: function() {
      const q = this.currentQuestion;
      if (!q) return;
      const svgContent = q.svgDiagram || (q.svgKey && window.Aetheria.QuizBridge && window.Aetheria.QuizBridge.getDiagram(q.svgKey)) || "";
      if (!svgContent) return;

      const box = document.getElementById("image-lightbox");
      const content = document.getElementById("lightbox-content");
      if (box && content) {
        content.innerHTML =
          '<div style="margin-bottom:8px;">' + svgContent + '</div>' +
          '<div style="font-size:13px; color:#1c1619;">' + q.prompt + '</div>';
        box.style.display = "flex";
      }
    },

    closeLightbox: function() {
      const box = document.getElementById("image-lightbox");
      if (box) box.style.display = "none";
    }
  };

  window.Aetheria.QuizUI = QuizUI;

  // ================= 7. 升級【設定 ➔ 星象調頻】：支援「🎯 單選課次 / ☑️ 多選課次」與 17 課掌握度 =================
  function attachAstrolabeUpgrade() {
    if (!window.Aetheria.UI) return;
    const UI = window.Aetheria.UI;

    UI.setLessonSelectMode = function(mode) {
      const s = window.Aetheria.State.data;
      window.Aetheria.QuizBridge.ensureQuizSettings(s);
      s.lessonSelectMode = mode;

      if (mode === "single") {
        // 切換至單選模式時，只保留第一個已勾選的課次為 true
        const catalog = window.Aetheria.QuizBridge.LESSON_CATALOG;
        let firstActive = catalog.find(function(l) { return Boolean(s.activeLessons[l.key]); });
        if (!firstActive && catalog.length > 0) firstActive = catalog[0];
        catalog.forEach(function(l) {
          s.activeLessons[l.key] = Boolean(firstActive && l.key === firstActive.key);
        });
      }
      window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.State.save();
      this.openSettingsModal("astrolabe");
    };

    UI.toggleLessonUnit = function(unitKey, subjectKey) {
      const s = window.Aetheria.State.data;
      window.Aetheria.QuizBridge.ensureQuizSettings(s);
      const catalog = window.Aetheria.QuizBridge.LESSON_CATALOG;

      if (s.lessonSelectMode === "single") {
        // 單選模式：只開啟當前點擊的這一課，並自動啟用該科目
        catalog.forEach(function(l) {
          s.activeLessons[l.key] = (l.key === unitKey);
        });
        if (subjectKey) s.activeSubjects[subjectKey] = true;
      } else {
        // 多選模式：自由切換勾選
        s.activeLessons[unitKey] = !s.activeLessons[unitKey];
        if (s.activeLessons[unitKey] && subjectKey) {
          s.activeSubjects[subjectKey] = true;
        }
      }
      window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.State.save();
      this.openSettingsModal("astrolabe");
    };

    UI.selectAllLessonsInSubject = function(subjKey, enable) {
      const s = window.Aetheria.State.data;
      window.Aetheria.QuizBridge.ensureQuizSettings(s);
      s.lessonSelectMode = "multi";
      s.activeSubjects[subjKey] = enable;
      window.Aetheria.QuizBridge.LESSON_CATALOG.forEach(function(l) {
        if (l.subject === subjKey) s.activeLessons[l.key] = enable;
      });
      window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.State.save();
      this.openSettingsModal("astrolabe");
    };

    UI.openSettingsModal = function(tab, previewUnitKey) {
      tab = tab || "astrolabe";
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const Bridge = window.Aetheria.QuizBridge;
      Bridge.ensureQuizSettings(s);
      const self = this;

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_gear") + "系統設定與星象調頻 (共 " + Bridge.getAllQuestions().length + " 題)";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const tabBar = document.createElement("div");
      tabBar.className = "tab-bar";
      [
        { id: "astrolabe", label: "星象選課" },
        { id: "preview",   label: "題庫預覽" },
        { id: "report",    label: "掌握報告" },
        { id: "system",    label: "存檔/重置" }
      ].forEach(function(t) {
        const b = document.createElement("button");
        b.className = "na-btn" + (tab === t.id ? " highlight" : "");
        b.innerText = t.label;
        b.onclick = function() { self.openSettingsModal(t.id); };
        tabBar.appendChild(b);
      });
      body.appendChild(tabBar);

      // 分頁 1：星象調頻（支援 🎯 單選課次 / ☑️ 多選課次）
      if (tab === "astrolabe") {
        const isSingle = (s.lessonSelectMode === "single");
        const modeBox = document.createElement("div");
        modeBox.className = "sys-card-scroll";
        modeBox.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b>選課模式：</b>' +
            '<div style="display:flex; gap:6px;">' +
              '<button class="na-btn ' + (isSingle ? 'highlight' : '') + '" style="padding:4px 10px;" onclick="Aetheria.UI.setLessonSelectMode(\'single\')">🎯 單選課次 (專注單課)</button>' +
              '<button class="na-btn ' + (!isSingle ? 'highlight' : '') + '" style="padding:4px 10px;" onclick="Aetheria.UI.setLessonSelectMode(\'multi\')">☑️ 多選課次 (自由組合)</button>' +
            '</div>' +
          '</div>';
        body.appendChild(modeBox);

        const subjMeta = [
          { key: "chinese",    name: "中文科（30成語 + 32字詞｜解釋・填充）" },
          { key: "english",    name: "英文科（46 Vocab｜字塊串字・句子填充）" },
          { key: "humanities", name: "人文科（U1/U2/U8/U9 共120題｜全六大題型）" },
          { key: "science",    name: "科學科（第2/3/8/9課 共120題｜全六大題型）" }
        ];

        subjMeta.forEach(function(sm) {
          const subjOn = Boolean(s.activeSubjects[sm.key]);
          const lessons = Bridge.LESSON_CATALOG.filter(function(l) { return l.subject === sm.key; });

          const card = document.createElement("div");
          card.className = "sys-card";

          let lessonsHtml = lessons.map(function(les) {
            const on = subjOn && Boolean(s.activeLessons[les.key]);
            const mark = isSingle ? (on ? "◉ " : "○ ") : (on ? "☑ " : "☐ ");
            return '<button class="na-btn ' + (on ? 'highlight' : '') + '" style="padding:5px 8px; font-size:12px; text-align:left;" ' +
              'onclick="Aetheria.UI.toggleLessonUnit(\'' + les.key + '\', \'' + sm.key + '\')">' +
              mark + les.name + ' <span style="opacity:0.8;font-size:11px;">(' + les.count + '題)</span>' +
            '</button>';
          }).join("");

          card.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; padding-bottom:4px; border-bottom:1px solid #3d3136;">' +
              '<b style="color:var(--na-gold); font-size:13px;">' + sm.name + '</b>' +
              '<div style="display:flex; gap:4px;">' +
                '<button class="na-btn" style="padding:2px 7px; font-size:11px;" onclick="Aetheria.UI.selectAllLessonsInSubject(\'' + sm.key + '\', true)">全選</button>' +
                '<button class="na-btn" style="padding:2px 7px; font-size:11px;" onclick="Aetheria.UI.selectAllLessonsInSubject(\'' + sm.key + '\', false)">全關</button>' +
              '</div>' +
            '</div>' +
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:5px;">' + lessonsHtml + '</div>';

          body.appendChild(card);
        });
      }

      // 分頁 2：按課次篩選預覽與即場實測
      else if (tab === "preview") {
        const curUnit = previewUnitKey || Bridge.LESSON_CATALOG[0].key;
        const unitBar = document.createElement("div");
        unitBar.style.cssText = "display:flex; flex-wrap:wrap; gap:4px; margin-bottom:8px;";
        Bridge.LESSON_CATALOG.forEach(function(l) {
          const btn = document.createElement("button");
          btn.className = "na-btn" + (l.key === curUnit ? " highlight" : "");
          btn.style.cssText = "font-size:11px; padding:4px 7px;";
          btn.innerText = l.name.split(" ")[0];
          btn.onclick = function() { self.openSettingsModal("preview", l.key); };
          unitBar.appendChild(btn);
        });
        body.appendChild(unitBar);

        const unitQuestions = Bridge.getAllQuestions().filter(function(q) { return q.unitKey === curUnit; });
        unitQuestions.forEach(function(q, idx) {
          const btn = document.createElement("button");
          btn.className = "na-btn";
          btn.style.cssText = "width:100%; text-align:left; padding:7px 10px; margin-bottom:4px; font-size:12px;";
          const shortPrompt = String(q.prompt || "").replace(/\n/g, " ").slice(0, 34);
          btn.innerHTML = (idx + 1) + ". <b>[" + q.typeLabel + "]</b> " + shortPrompt + "...";
          btn.onclick = function() { window.Aetheria.Battle.startBattle(null, "combat", q.id); };
          body.appendChild(btn);
        });
      }

      // 分頁 3：四科 17 課詳細掌握度報告
      else if (tab === "report") {
        const allQ = Bridge.getAllQuestions();
        const topCard = document.createElement("div");
        topCard.className = "sys-card-scroll";
        topCard.innerHTML = '<b>全題庫掌握度報告（最高連勝紀錄：' + (s.maxStreak || 0) + ' 題｜錯題本：' + ((s.wrongBook && s.wrongBook.length) || 0) + ' 題）</b>';
        body.appendChild(topCard);

        Bridge.LESSON_CATALOG.forEach(function(les) {
          const qs = allQ.filter(function(q) { return q.unitKey === les.key; });
          let mastered = 0;
          let stars = 0;
          qs.forEach(function(q) {
            const m = s.questionMastery && s.questionMastery[q.id];
            if (m && m.stars > 0) {
              mastered++;
              stars += m.stars;
            }
          });
          const pct = qs.length > 0 ? Math.round((mastered / qs.length) * 100) : 0;
          const row = document.createElement("div");
          row.className = "sys-card";
          row.style.display = "flex";
          row.style.justifyContent = "space-between";
          row.innerHTML =
            '<span><b>' + les.name + '</b></span>' +
            '<span style="color:var(--na-gold); font-weight:bold;">' + mastered + '/' + qs.length + ' (' + pct + '%) ★' + stars + '</span>';
          body.appendChild(row);
        });
      }

      // 分頁 4：系統存檔與重置
      else if (tab === "system") {
        const sysCard = document.createElement("div");
        sysCard.className = "sys-card";
        sysCard.innerHTML =
          '<div style="display:flex; flex-direction:column; gap:6px;">' +
            '<button class="na-btn" style="padding:8px;" onclick="Aetheria.Audio.toggleMute(); Aetheria.UI.showToast(\'已切換音樂開關！\');">切換 8-bit 音樂 (開 / 關)</button>' +
            '<button class="na-btn" style="padding:8px;" onclick="Aetheria.UI.playCutscene(\'intro\')">重溫開場故事序幕</button>' +
            '<button class="na-btn highlight" style="padding:8px;" onclick="Aetheria.UI.exportSavePrompt()">複製存檔 JSON 代碼 (備份)</button>' +
            '<button class="na-btn" style="padding:8px;" onclick="Aetheria.UI.importSavePrompt()">貼上存檔 JSON 代碼 (還原)</button>' +
            '<button class="na-btn" style="padding:8px;" onclick="document.getElementById(\'title-screen\').style.display=\'flex\'; Aetheria.UI.initTitleScreen();">返回遊戲首頁</button>' +
            '<button class="na-btn" style="padding:8px; background:#a32c24; border-color:#ff595e;" onclick="if(confirm(\'確定要清除所有進度並重新開始嗎？\')) Aetheria.State.resetSave()">重置遊戲 (清除進度)</button>' +
          '</div>';
        body.appendChild(sysCard);
      }
    };
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(attachAstrolabeUpgrade, 30);
  } else {
    window.addEventListener("load", function() { setTimeout(attachAstrolabeUpgrade, 30); });
  }
})();
