/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 7 大題型互動渲染器與復古像素鍵盤系統 (quiz-widgets.js)
 * 支援：1.四選一(含藥師/指環自動排除1錯項) 2.候選字石拼字 3.英文全盲像素QWERTY鍵盤
 *       4.看圖填充/看圖選擇(支援點擊全屏燈箱放大) 5.左右多重連線配對陣
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  let currentQuestion = null;
  let answerCallback = null;

  const QuizUI = {
    // 渲染指定題目至戰鬥面板，並綁定作答回呼 onResult(isCorrect, correctText, questionObj)
    renderQuestion(q, onResult) {
      currentQuestion = q;
      answerCallback = onResult;

      const subjTag = document.getElementById("q-subject-tag");
      const typeTag = document.getElementById("q-type-tag");
      const promptEl = document.getElementById("q-prompt-text");
      const diagBox = document.getElementById("q-diagram-container");
      const diagSvg = document.getElementById("q-diagram-svg");
      const area = document.getElementById("quiz-interactive-area");

      if (subjTag) subjTag.innerText = `[${q.subjectLabel || "古文明符文"}]`;
      if (typeTag) typeTag.innerText = q.typeLabel || "詠唱檢定";
      if (promptEl) promptEl.innerText = q.prompt || "";

      // 處理科學實驗圖 / 人文地圖縮略圖顯示
      if (q.svgDiagram && diagBox && diagSvg) {
        diagBox.style.display = "flex";
        diagSvg.innerHTML = q.svgDiagram;
      } else if (diagBox) {
        diagBox.style.display = "none";
      }

      if (!area) return;
      area.innerHTML = "";

      if (q.type === "mcq" || q.type === "image_mcq") {
        this.buildMCQ(q, area);
      } else if (q.type === "tile_spell" || q.type === "image_spell") {
        this.buildTileSpell(q, area);
      } else if (q.type === "blind_spell") {
        this.buildBlindKeyboard(q, area);
      } else if (q.type === "matching") {
        this.buildMatching(q, area);
      }
    },

    // ================= 題型 1：四選一面板 (支援煉金藥師/學者智慧指環自動排除 1 錯項) =================
    buildMCQ(q, container) {
      const s = window.Aetheria.State.data;
      const hasEliminatePerk = (s.currentJob === "alchemist") || (s.unlockedRelics && s.unlockedRelics.includes("r_ring"));

      // 複製並打亂選項順序，防止死記位置
      const shuffled = [...q.options].sort(() => Math.random() - 0.5);
      let eliminatedIdx = -1;

      if (hasEliminatePerk && shuffled.length > 2) {
        const wrongIndices = [];
        shuffled.forEach((opt, idx) => {
          if (opt !== q.answer) wrongIndices.push(idx);
        });
        if (wrongIndices.length > 0) {
          eliminatedIdx = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
        }
      }

      const grid = document.createElement("div");
      grid.className = "mcq-grid";

      shuffled.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "mcq-btn";

        if (idx === eliminatedIdx) {
          btn.innerText = `✖ ${opt} (已排除)`;
          btn.style.opacity = "0.35";
          btn.style.pointerEvents = "none";
        } else {
          btn.innerText = opt;
          btn.onclick = () => {
            if (answerCallback) answerCallback(opt === q.answer, q.answer, q);
          };
        }
        grid.appendChild(btn);
      });

      container.appendChild(grid);
    },

    // ================= 題型 2：候選字石點擊拼字 (支援點擊槽位退回重拼) =================
    buildTileSpell(q, container) {
      const selectedChars = [];
      const slotsDiv = document.createElement("div");
      slotsDiv.className = "tile-slots";

      const bankDiv = document.createElement("div");
      bankDiv.className = "word-bank";

      const refreshSlots = () => {
        slotsDiv.innerHTML = "";
        for (let i = 0; i < q.answerChars.length; i++) {
          const slot = document.createElement("div");
          slot.className = "slot-box";
          slot.innerText = selectedChars[i] ? selectedChars[i].char : "";
          slot.onclick = () => {
            if (selectedChars[i]) {
              selectedChars[i].btn.classList.remove("used");
              selectedChars.splice(i, 1);
              window.Aetheria.Audio.sfxTalkBlip();
              refreshSlots();
            }
          };
          slotsDiv.appendChild(slot);
        }
      };

      const candidates = [...q.candidates].sort(() => Math.random() - 0.5);
      candidates.forEach(ch => {
        const btn = document.createElement("button");
        btn.className = "bank-char";
        btn.innerText = ch;
        btn.onclick = () => {
          if (selectedChars.length < q.answerChars.length) {
            window.Aetheria.Audio.sfxTalkBlip();
            btn.classList.add("used");
            selectedChars.push({ char: ch, btn: btn });
            refreshSlots();

            if (selectedChars.length === q.answerChars.length) {
              const userStr = selectedChars.map(item => item.char).join("");
              const targetStr = q.answerChars.join("");
              setTimeout(() => {
                if (answerCallback) answerCallback(userStr === targetStr, targetStr, q);
              }, 160);
            }
          }
        };
        bankDiv.appendChild(btn);
      });

      refreshSlots();
      container.appendChild(slotsDiv);
      container.appendChild(bankDiv);
    },

    // ================= 題型 3：英文全盲串字 — 遊戲內建復古像素 QWERTY 鍵盤 =================
    buildBlindKeyboard(q, container) {
      let typed = "";
      const disp = document.createElement("div");
      disp.className = "blind-input-display";
      disp.innerText = "_";

      const kb = document.createElement("div");
      kb.className = "pixel-keyboard";

      const rows = [
        ["q","w","e","r","t","y","u","i","o","p"],
        ["a","s","d","f","g","h","j","k","l"],
        ["🧪提示","z","x","c","v","b","n","m","⌫","⚡詠唱"]
      ];

      rows.forEach(r => {
        const rowEl = document.createElement("div");
        rowEl.className = "kb-row";

        r.forEach(keyLabel => {
          const keyBtn = document.createElement("button");
          keyBtn.className = "kb-key";
          keyBtn.innerText = keyLabel;

          if (keyLabel === "🧪提示" || keyLabel === "⌫") keyBtn.classList.add("kb-wide");
          if (keyLabel === "⚡詠唱") keyBtn.classList.add("kb-submit");

          keyBtn.onclick = () => {
            window.Aetheria.Audio.sfxTalkBlip();
            const s = window.Aetheria.State.data;

            if (keyLabel === "⌫") {
              typed = typed.slice(0, -1);
            } else if (keyLabel === "🧪提示") {
              if ((s.inventory.potionHint || 0) > 0) {
                s.inventory.potionHint--;
                window.Aetheria.State.save();
                window.Aetheria.UI.showToast(`🧪 洞察提示：${q.hint || (q.answer[0] + "...")} (剩餘 ${s.inventory.potionHint} 瓶)`);
              } else {
                window.Aetheria.UI.showToast("⚠️ 洞察藥水不足！可在鐵匠鋪煉金或向星象師艾莉婭討教取得。");
              }
              return;
            } else if (keyLabel === "⚡詠唱") {
              const cleanUser = typed.trim().toLowerCase();
              const cleanAns = q.answer.trim().toLowerCase();
              if (answerCallback) answerCallback(cleanUser === cleanAns, q.answer, q);
              return;
            } else {
              if (typed.length < 18) typed += keyLabel;
            }
            disp.innerText = typed || "_";
          };

          rowEl.appendChild(keyBtn);
        });

        kb.appendChild(rowEl);
      });

      container.appendChild(disp);
      container.appendChild(kb);
    },

    // ================= 題型 4：左右多重連線配對陣 (每連對一組發射一次共鳴雷射) =================
    buildMatching(q, container) {
      let selectedLeft = null;
      let matchedPairs = 0;

      const wrap = document.createElement("div");
      wrap.className = "match-columns";
      const leftCol = document.createElement("div");
      leftCol.className = "match-col";
      const rightCol = document.createElement("div");
      rightCol.className = "match-col";

      const rightShuffled = [...q.pairs].sort(() => Math.random() - 0.5);

      q.pairs.forEach(p => {
        const lCard = document.createElement("div");
        lCard.className = "match-card";
        lCard.innerText = p.left;
        lCard.onclick = () => {
          window.Aetheria.Audio.sfxTalkBlip();
          leftCol.querySelectorAll(".match-card").forEach(c => c.classList.remove("selected"));
          lCard.classList.add("selected");
          selectedLeft = { card: lCard, expectedRight: p.right, leftText: p.left };
        };
        leftCol.appendChild(lCard);
      });

      rightShuffled.forEach(p => {
        const rCard = document.createElement("div");
        rCard.className = "match-card";
        rCard.innerText = p.right;
        rCard.onclick = () => {
          if (!selectedLeft) {
            window.Aetheria.UI.showToast("👈 請先點選左列的項目卡片！");
            return;
          }
          if (p.right === selectedLeft.expectedRight) {
            window.Aetheria.Audio.sfxAttackHit();
            selectedLeft.card.classList.remove("selected");
            selectedLeft.card.classList.add("matched");
            rCard.classList.add("matched");
            selectedLeft = null;
            matchedPairs++;
            window.Aetheria.UI.spawnFloatingText("⚡ 共鳴連擊!", "#38b6ff", true);

            if (matchedPairs === q.pairs.length) {
              setTimeout(() => {
                if (answerCallback) answerCallback(true, "全數配對完成", q);
              }, 200);
            }
          } else {
            const correctHint = `${selectedLeft.leftText} ➔ ${selectedLeft.expectedRight}`;
            if (answerCallback) answerCallback(false, correctHint, q);
          }
        };
        rightCol.appendChild(rCard);
      });

      wrap.appendChild(leftCol);
      wrap.appendChild(rightCol);
      container.appendChild(wrap);
    },

    // 科學/人文圖片放大檢視燈箱
    openLightbox() {
      if (!currentQuestion || !currentQuestion.svgDiagram) return;
      const box = document.getElementById("image-lightbox");
      const content = document.getElementById("lightbox-content");
      if (box && content) {
        content.innerHTML = currentQuestion.svgDiagram + `<p style="margin-top:10px; font-size:13px;">${currentQuestion.prompt}</p>`;
        box.style.display = "flex";
      }
    },

    closeLightbox() {
      const box = document.getElementById("image-lightbox");
      if (box) box.style.display = "none";
    }
  };

  window.Aetheria.QuizUI = QuizUI;
})();