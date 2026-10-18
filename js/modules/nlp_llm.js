/* ==========================================================================
   Module 5: Natural Language Processing & Large Language Models (LLMs)
   Tokenizer breakdown, 2D Vector Embedding Arithmetic, and Temperature/Softmax Simulator
   ========================================================================== */

class NLPModule {
  constructor() {
    this.vocab = [
      { word: 'king', x: 0.65, y: 0.8, cat: 'royalty' },
      { word: 'queen', x: 0.68, y: 0.35, cat: 'royalty' },
      { word: 'man', x: 0.25, y: 0.78, cat: 'people' },
      { word: 'woman', x: 0.28, y: 0.33, cat: 'people' },
      { word: 'prince', x: 0.52, y: 0.72, cat: 'royalty' },
      { word: 'princess', x: 0.55, y: 0.28, cat: 'royalty' },
      { word: 'dog', x: -0.6, y: -0.4, cat: 'animal' },
      { word: 'puppy', x: -0.7, y: -0.55, cat: 'animal' },
      { word: 'cat', x: -0.5, y: -0.25, cat: 'animal' },
      { word: 'kitten', x: -0.62, y: -0.38, cat: 'animal' },
      { word: 'computer', x: -0.2, y: 0.65, cat: 'tech' },
      { word: 'neural', x: -0.35, y: 0.75, cat: 'tech' },
      { word: 'robot', x: -0.4, y: 0.5, cat: 'tech' },
      { word: 'apple', x: 0.3, y: -0.7, cat: 'fruit' },
      { word: 'banana', x: 0.45, y: -0.65, cat: 'fruit' }
    ];

    this.tokenColors = [
      'rgba(6, 182, 212, 0.25)',
      'rgba(168, 85, 247, 0.25)',
      'rgba(16, 185, 129, 0.25)',
      'rgba(245, 158, 11, 0.25)',
      'rgba(244, 63, 94, 0.25)',
      'rgba(99, 102, 241, 0.25)'
    ];

    this.selectedWordA = 'king';
    this.selectedWordB = 'queen';
    this.temperature = 0.7;
    this.topP = 0.9;

    this.init();
  }

  init() {
    this.initTokenizer();
    this.initEmbeddingCanvas();
    this.initTemperatureSim();
    this.initPromptLab();
  }

  // ========================================================================
  // 1. TOKENIZATION ENGINE
  // ========================================================================
  initTokenizer() {
    const input = document.getElementById('nlp-token-input');
    if (input) {
      input.addEventListener('input', () => this.tokenizeText(input.value));
      this.tokenizeText(input.value);
    }
  }

  tokenizeText(text) {
    const container = document.getElementById('nlp-tokens-output');
    const statsEl = document.getElementById('nlp-token-stats');
    if (!container) return;

    if (!text.trim()) {
      container.innerHTML = `<span style="color: var(--text-dim); font-size: 0.85rem;">Type text above to see live token segmentation...</span>`;
      if (statsEl) statsEl.textContent = '0 tokens | 0 characters';
      return;
    }

    // Subword simulation rules (prefixes, suffixes, words, punctuation)
    const rawTokens = [];
    const words = text.split(/(\s+|[.,!?;:()"])/);

    words.forEach(chunk => {
      if (!chunk) return;
      if (/^\s+$/.test(chunk)) {
        rawTokens.push({ text: ' ' + chunk.replace(' ', '␣'), isSpace: true });
      } else if (chunk.length > 5) {
        // Break long words into root + suffix
        const mid = Math.min(4, Math.floor(chunk.length * 0.6));
        rawTokens.push({ text: chunk.slice(0, mid) });
        rawTokens.push({ text: '##' + chunk.slice(mid) });
      } else {
        rawTokens.push({ text: chunk });
      }
    });

    // Render chips
    container.innerHTML = rawTokens.map((tok, idx) => {
      const color = this.tokenColors[idx % this.tokenColors.length];
      const hashId = Math.abs(this.hashCode(tok.text)) % 50000 + 1000;
      return `
        <div class="token-chip" style="background: ${color}; border: 1px solid rgba(255,255,255,0.15);">
          <span>${tok.text}</span>
          <span class="token-id">#${hashId}</span>
        </div>
      `;
    }).join('');

    if (statsEl) {
      statsEl.textContent = `${rawTokens.length} Tokens | ${text.length} Characters | Ratio: ${(rawTokens.length / Math.max(1, text.split(' ').length)).toFixed(2)} tok/word`;
    }

    if (window.appState) {
      window.appState.data.stats.tokensAnalyzed += rawTokens.length;
    }
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  // ========================================================================
  // 2. 2D VECTOR EMBEDDING SPACE & VECTOR ARITHMETIC
  // ========================================================================
  initEmbeddingCanvas() {
    this.embCanvas = document.getElementById('nlp-embedding-canvas');
    if (!this.embCanvas) return;
    this.embCtx = this.embCanvas.getContext('2d');

    this.renderEmbeddingSpace();
    this.populateWordSelectors();
    this.bindEmbeddingEvents();
  }

  populateWordSelectors() {
    const selA = document.getElementById('nlp-word-a');
    const selB = document.getElementById('nlp-word-b');
    if (!selA || !selB) return;

    const options = this.vocab.map(v => `<option value="${v.word}">${v.word}</option>`).join('');
    selA.innerHTML = options;
    selB.innerHTML = options;

    selA.value = 'king';
    selB.value = 'queen';

    const updateSim = () => {
      this.selectedWordA = selA.value;
      this.selectedWordB = selB.value;
      this.calculateCosineSimilarity();
      this.renderEmbeddingSpace();
    };

    selA.addEventListener('change', updateSim);
    selB.addEventListener('change', updateSim);
    this.calculateCosineSimilarity();
  }

  calculateCosineSimilarity() {
    const itemA = this.vocab.find(v => v.word === this.selectedWordA);
    const itemB = this.vocab.find(v => v.word === this.selectedWordB);
    if (!itemA || !itemB) return;

    // Dot product / magnitude
    const dot = itemA.x * itemB.x + itemA.y * itemB.y;
    const magA = Math.hypot(itemA.x, itemA.y);
    const magB = Math.hypot(itemB.x, itemB.y);
    const cosSim = dot / (magA * magB);

    const scoreEl = document.getElementById('nlp-sim-score');
    const barEl = document.getElementById('nlp-sim-bar');
    if (scoreEl && barEl) {
      const pct = Math.max(0, Math.round(((cosSim + 1) / 2) * 100));
      scoreEl.textContent = `${cosSim.toFixed(3)} (${pct}% alignment)`;
      barEl.style.width = `${pct}%`;
    }
  }

  renderEmbeddingSpace(arithmeticTarget = null) {
    if (!this.embCtx) return;
    const w = this.embCanvas.width;
    const h = this.embCanvas.height;
    this.embCtx.clearRect(0, 0, w, h);

    const toPx = (val) => ((val + 1) / 2) * (w - 60) + 30;
    const toPy = (val) => ((1 - val) / 2) * (h - 60) + 30;

    // Draw Axes Grid
    this.embCtx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    this.embCtx.lineWidth = 1;
    this.embCtx.beginPath();
    this.embCtx.moveTo(w / 2, 0);
    this.embCtx.lineTo(w / 2, h);
    this.embCtx.moveTo(0, h / 2);
    this.embCtx.lineTo(w, h / 2);
    this.embCtx.stroke();

    // Draw connecting similarity line if two words selected
    const itemA = this.vocab.find(v => v.word === this.selectedWordA);
    const itemB = this.vocab.find(v => v.word === this.selectedWordB);
    if (itemA && itemB) {
      this.embCtx.beginPath();
      this.embCtx.moveTo(toPx(itemA.x), toPy(itemA.y));
      this.embCtx.lineTo(toPx(itemB.x), toPy(itemB.y));
      this.embCtx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
      this.embCtx.lineWidth = 2;
      this.embCtx.setLineDash([4, 4]);
      this.embCtx.stroke();
      this.embCtx.setLineDash([]);
    }

    // Draw Arithmetic Vector Arrow if active
    if (arithmeticTarget) {
      const px = toPx(arithmeticTarget.x);
      const py = toPy(arithmeticTarget.y);

      this.embCtx.beginPath();
      this.embCtx.arc(px, py, 14, 0, Math.PI * 2);
      this.embCtx.strokeStyle = '#f59e0b';
      this.embCtx.lineWidth = 3;
      this.embCtx.shadowColor = '#f59e0b';
      this.embCtx.shadowBlur = 15;
      this.embCtx.stroke();
      this.embCtx.shadowBlur = 0;

      this.embCtx.fillStyle = '#f59e0b';
      this.embCtx.font = 'bold 11px JetBrains Mono';
      this.embCtx.fillText('★ Result Vector', px + 18, py - 4);
    }

    // Draw Word Nodes
    this.vocab.forEach(v => {
      const px = toPx(v.x);
      const py = toPy(v.y);

      const isA = v.word === this.selectedWordA;
      const isB = v.word === this.selectedWordB;

      this.embCtx.beginPath();
      this.embCtx.arc(px, py, (isA || isB) ? 7 : 5, 0, Math.PI * 2);
      this.embCtx.fillStyle = isA ? '#38bdf8' : (isB ? '#c084fc' : '#10b981');
      this.embCtx.fill();
      this.embCtx.strokeStyle = '#ffffff';
      this.embCtx.lineWidth = (isA || isB) ? 2 : 1;
      this.embCtx.stroke();

      this.embCtx.fillStyle = (isA || isB) ? '#ffffff' : '#94a3b8';
      this.embCtx.font = (isA || isB) ? 'bold 12px Plus Jakarta Sans' : '11px Plus Jakarta Sans';
      this.embCtx.fillText(v.word, px + 9, py + 4);
    });
  }

  bindEmbeddingEvents() {
    const mathBtn = document.getElementById('nlp-btn-vector-math');
    if (mathBtn) {
      mathBtn.addEventListener('click', () => {
        // King - Man + Woman = ?
        const king = this.vocab.find(v => v.word === 'king');
        const man = this.vocab.find(v => v.word === 'man');
        const woman = this.vocab.find(v => v.word === 'woman');

        if (king && man && woman) {
          const resultVec = {
            x: king.x - man.x + woman.x,
            y: king.y - man.y + woman.y
          };

          // Find nearest word in vocabulary
          let bestDist = Infinity;
          let nearestWord = '';
          this.vocab.forEach(v => {
            if (v.word !== 'king' && v.word !== 'man' && v.word !== 'woman') {
              const dist = Math.hypot(v.x - resultVec.x, v.y - resultVec.y);
              if (dist < bestDist) {
                bestDist = dist;
                nearestWord = v.word;
              }
            }
          });

          this.renderEmbeddingSpace(resultVec);

          const resultEl = document.getElementById('nlp-vector-math-result');
          if (resultEl) {
            resultEl.innerHTML = `
              <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid var(--accent-emerald); border-radius: 8px; padding: 10px 14px; color: #34d399; margin-top: 10px;">
                🎉 <strong>Arithmetic Result:</strong> Vector coordinates match <span style="font-size: 1.1rem; font-weight: 800; text-decoration: underline;">"${nearestWord.toUpperCase()}"</span> with ${(1 - bestDist).toFixed(3)} semantic proximity!
              </div>
            `;
          }

          if (window.soundEngine) window.soundEngine.playSuccess();
          if (window.appState) window.appState.unlockAchievement('token_wizard');
        }
      });
    }
  }

  // ========================================================================
  // 3. TEMPERATURE & SOFTMAX SAMPLING VISUALIZER
  // ========================================================================
  initTemperatureSim() {
    this.candidateTokens = [
      { token: 'intelligent', logit: 3.8 },
      { token: 'creative', logit: 3.2 },
      { token: 'fast', logit: 2.1 },
      { token: 'helpful', logit: 1.8 },
      { token: 'banana', logit: -0.5 },
      { token: 'flying', logit: -1.2 }
    ];

    const tempSlider = document.getElementById('nlp-temp-slider');
    if (tempSlider) {
      tempSlider.addEventListener('input', (e) => {
        this.temperature = parseFloat(e.target.value);
        const tempVal = document.getElementById('nlp-temp-val');
        if (tempVal) tempVal.textContent = this.temperature.toFixed(1);
        this.renderSoftmaxBars();
      });
    }

    this.renderSoftmaxBars();
  }

  renderSoftmaxBars() {
    const container = document.getElementById('nlp-softmax-bars');
    if (!container) return;

    // Calculate Softmax with Temperature scaling: exp(z / T) / sum(exp(z / T))
    const T = Math.max(0.05, this.temperature);
    const exps = this.candidateTokens.map(c => Math.exp(c.logit / T));
    const sumExp = exps.reduce((a, b) => a + b, 0);
    const probs = exps.map(e => e / sumExp);

    container.innerHTML = this.candidateTokens.map((c, idx) => {
      const prob = probs[idx];
      const pct = (prob * 100).toFixed(1);
      const isTop = idx === 0;

      return `
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
            <span style="font-family: var(--font-mono); font-weight: 600; color: ${isTop ? 'var(--accent-cyan)' : 'var(--text-main)'};">"${c.token}"</span>
            <span style="font-family: var(--font-mono); color: var(--text-muted);">${pct}% (p=${prob.toFixed(3)})</span>
          </div>
          <div style="height: 10px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden;">
            <div style="height: 100%; width: ${pct}%; background: ${isTop ? 'linear-gradient(90deg, #06b6d4, #38bdf8)' : 'linear-gradient(90deg, #a855f7, #6366f1)'}; transition: width 0.2s ease;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ========================================================================
  // 4. PROMPT ENGINEERING ARENA
  // ========================================================================
  initPromptLab() {
    const runBtn = document.getElementById('nlp-btn-run-prompt');
    const promptTypeSelect = document.getElementById('nlp-prompt-type');
    const promptInput = document.getElementById('nlp-prompt-editor');
    const outputEl = document.getElementById('nlp-prompt-output');

    const promptPresets = {
      'zero': `Classify the sentiment of this review:\n"The food arrived cold and took 90 minutes, but the dessert was delicious."\nSentiment:`,
      'few': `Classify the sentiment into POSITIVE, NEGATIVE, or MIXED.\n\nReview: "Amazing atmosphere and super friendly staff!"\nSentiment: POSITIVE\n\nReview: "Terrible service, waited forever."\nSentiment: NEGATIVE\n\nReview: "The food arrived cold and took 90 minutes, but the dessert was delicious."\nSentiment:`,
      'cot': `Determine if 15 + 27 * 2 is greater than 70. Let's think step by step.`
    };

    if (promptTypeSelect && promptInput) {
      promptTypeSelect.addEventListener('change', (e) => {
        promptInput.value = promptPresets[e.target.value] || '';
      });
    }

    if (runBtn && outputEl) {
      runBtn.addEventListener('click', () => {
        const type = promptTypeSelect ? promptTypeSelect.value : 'zero';
        let response = '';

        if (type === 'zero') {
          response = 'Mixed (Note: Zero-shot may sometimes output arbitrary phrasing without standardized categories).';
        } else if (type === 'few') {
          response = 'MIXED (Standardized format matched due to few-shot exemplars!)';
        } else {
          response = 'Step 1: Follow order of operations (multiplication first).\nStep 2: Calculate 27 * 2 = 54.\nStep 3: Add 15: 15 + 54 = 69.\nStep 4: Compare 69 with 70. Since 69 < 70, the answer is NO, it is not greater than 70.';
        }

        outputEl.innerHTML = '';
        let charIdx = 0;
        runBtn.disabled = true;

        if (window.soundEngine) window.soundEngine.playClick();

        const typeTimer = setInterval(() => {
          if (charIdx < response.length) {
            outputEl.textContent += response[charIdx];
            charIdx++;
          } else {
            clearInterval(typeTimer);
            runBtn.disabled = false;
            if (window.soundEngine) window.soundEngine.playSuccess();
          }
        }, 18);
      });
    }
  }
}

window.NLPModule = NLPModule;
