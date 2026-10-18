/* ==========================================================================
   Module 1: AI Fundamentals & Rule-Based vs Machine Learning Playground
   ========================================================================== */

class FundamentalsModule {
  constructor() {
    this.samples = [
      { id: 1, text: "URGENT: You have won $1,000,000 lottery cash! Click here to claim.", isSpam: true },
      { id: 2, text: "F.R.E.E luxury cruise tickets for our 100th customer today!", isSpam: true },
      { id: 3, text: "Hey Sarah, are we still meeting tomorrow at 3 PM for the project sync?", isSpam: false },
      { id: 4, text: "Reminder: Your annual doctor appointment is scheduled for Thursday.", isSpam: false },
      { id: 5, text: "Exclusive investment opportunity with guaranteed 500% returns in 24 hours.", isSpam: true }
    ];

    this.vocabularyWeights = {
      'won': 2.8, 'lottery': 3.5, 'cash': 2.1, 'claim': 2.4, 'free': 3.0, 'f.r.e.e': 3.2,
      'luxury': 1.8, 'exclusive': 2.2, 'guaranteed': 3.1, 'urgent': 2.5, 'click': 2.0,
      'meeting': -2.5, 'project': -2.0, 'sync': -2.2, 'appointment': -2.8, 'doctor': -2.4,
      'reminder': -1.8, 'tomorrow': -1.2, 'sarah': -2.0
    };

    this.selectedSample = this.samples[0];
    this.init();
  }

  init() {
    this.renderSamplesList();
    this.bindEvents();
    this.runClassification();
  }

  bindEvents() {
    const inputArea = document.getElementById('spam-input-text');
    if (inputArea) {
      inputArea.addEventListener('input', () => {
        this.runClassification();
      });
    }

    const thresholdSlider = document.getElementById('ml-threshold-slider');
    if (thresholdSlider) {
      thresholdSlider.addEventListener('input', (e) => {
        const valEl = document.getElementById('ml-threshold-val');
        if (valEl) valEl.textContent = parseFloat(e.target.value).toFixed(2);
        this.runClassification();
      });
    }

    // Venn diagram interactive clicks
    document.querySelectorAll('.venn-circle').forEach(circle => {
      circle.addEventListener('click', (e) => {
        const layer = e.currentTarget.getAttribute('data-layer');
        this.showVennDetail(layer);
      });
    });
  }

  renderSamplesList() {
    const container = document.getElementById('spam-samples-list');
    if (!container) return;

    container.innerHTML = this.samples.map(s => `
      <div class="email-sample-card ${s.id === this.selectedSample.id ? 'active' : ''}" data-id="${s.id}">
        <div style="font-size: 0.78rem; color: var(--text-dim); margin-bottom: 4px; display: flex; justify-content: space-between;">
          <span>Sample #${s.id}</span>
          <span style="color: ${s.isSpam ? 'var(--accent-rose)' : 'var(--accent-emerald)'}; font-weight: 600;">
            Expected: ${s.isSpam ? 'SPAM' : 'INBOX'}
          </span>
        </div>
        <p style="font-size: 0.85rem; line-height: 1.4; color: var(--text-main);">${s.text}</p>
      </div>
    `).join('');

    container.querySelectorAll('.email-sample-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.getAttribute('data-id'));
        this.selectedSample = this.samples.find(s => s.id === id);
        
        const inputArea = document.getElementById('spam-input-text');
        if (inputArea) inputArea.value = this.selectedSample.text;

        container.querySelectorAll('.email-sample-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        if (window.soundEngine) window.soundEngine.playClick();
        this.runClassification();
      });
    });
  }

  runClassification() {
    const inputArea = document.getElementById('spam-input-text');
    const text = inputArea ? inputArea.value : this.selectedSample.text;

    // --- Approach 1: Rigid Rule-Based Engine ---
    // Strict exact match rules
    const lower = text.toLowerCase();
    const rule1 = lower.includes("won") && lower.includes("lottery");
    const rule2 = lower.includes("free") && lower.includes("click");
    const rule3 = lower.includes("guaranteed") && lower.includes("returns");
    const isRuleSpam = rule1 || rule2 || rule3;

    const ruleResultEl = document.getElementById('rule-result-badge');
    const ruleReasonEl = document.getElementById('rule-reason-text');
    if (ruleResultEl && ruleReasonEl) {
      if (isRuleSpam) {
        ruleResultEl.textContent = 'FLAGGED AS SPAM';
        ruleResultEl.className = 'nav-item-badge';
        ruleResultEl.style.background = 'rgba(244, 63, 94, 0.2)';
        ruleResultEl.style.color = '#fb7185';
        ruleReasonEl.textContent = 'Matched rigid hardcoded rules (e.g. "won" + "lottery").';
      } else {
        ruleResultEl.textContent = 'ALLOWED INBOX';
        ruleResultEl.className = 'nav-item-badge';
        ruleResultEl.style.background = 'rgba(16, 185, 129, 0.2)';
        ruleResultEl.style.color = '#34d399';
        ruleReasonEl.textContent = 'No hardcoded exact keyword patterns matched. (Bypassed by disguised spelling or variation!)';
      }
    }

    // --- Approach 2: Learned Feature Weight ML Model ---
    const thresholdSlider = document.getElementById('ml-threshold-slider');
    const threshold = thresholdSlider ? parseFloat(thresholdSlider.value) : 0.5;

    // Tokenize text into words & sanitize
    const tokens = lower.replace(/[^a-z0-9.]/g, ' ').split(/\s+/).filter(Boolean);
    let logit = 0;
    const matchedTokens = [];

    tokens.forEach(tok => {
      if (this.vocabularyWeights[tok] !== undefined) {
        logit += this.vocabularyWeights[tok];
        matchedTokens.push({ word: tok, weight: this.vocabularyWeights[tok] });
      }
    });

    // Sigmoid probability function: 1 / (1 + e^(-logit))
    const spamProb = 1 / (1 + Math.exp(-logit));
    const isMlSpam = spamProb >= threshold;

    const mlResultEl = document.getElementById('ml-result-badge');
    const mlScoreBar = document.getElementById('ml-prob-bar');
    const mlScoreVal = document.getElementById('ml-prob-val');
    const mlTokensList = document.getElementById('ml-matched-tokens');

    if (mlResultEl && mlScoreBar && mlScoreVal) {
      mlScoreBar.style.width = `${Math.round(spamProb * 100)}%`;
      mlScoreVal.textContent = `${Math.round(spamProb * 100)}% (${spamProb.toFixed(3)})`;

      if (isMlSpam) {
        mlResultEl.textContent = 'CLASSIFIED SPAM';
        mlResultEl.className = 'nav-item-badge';
        mlResultEl.style.background = 'rgba(244, 63, 94, 0.2)';
        mlResultEl.style.color = '#fb7185';
        mlScoreBar.style.background = 'linear-gradient(90deg, #f59e0b, #f43f5e)';
      } else {
        mlResultEl.textContent = 'CLASSIFIED INBOX';
        mlResultEl.className = 'nav-item-badge';
        mlResultEl.style.background = 'rgba(16, 185, 129, 0.2)';
        mlResultEl.style.color = '#34d399';
        mlScoreBar.style.background = 'linear-gradient(90deg, #06b6d4, #10b981)';
      }
    }

    if (mlTokensList) {
      if (matchedTokens.length === 0) {
        mlTokensList.innerHTML = `<span style="color: var(--text-dim); font-size: 0.8rem;">Neutral context words.</span>`;
      } else {
        mlTokensList.innerHTML = matchedTokens.map(m => `
          <span style="display: inline-block; padding: 2px 8px; margin: 2px; font-size: 0.75rem; border-radius: 4px; font-family: var(--font-mono); background: ${m.weight > 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; color: ${m.weight > 0 ? '#fb7185' : '#34d399'}; border: 1px solid ${m.weight > 0 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'};">
            ${m.word}: ${m.weight > 0 ? '+' : ''}${m.weight.toFixed(1)}
          </span>
        `).join('');
      }
    }
  }

  showVennDetail(layer) {
    const details = {
      'ai': {
        title: 'Artificial Intelligence (AI)',
        desc: 'The broad overarching discipline of creating systems and machines capable of performing tasks that typically require human intelligence—such as reasoning, planning, and problem-solving.',
        example: 'Symbolic AI, Expert Systems, Chess engines like Deep Blue.'
      },
      'ml': {
        title: 'Machine Learning (ML)',
        desc: 'A subset of AI where systems automatically learn patterns and decision rules directly from data, rather than being explicitly hardcoded with rules by human programmers.',
        example: 'Spam filters, Linear Regression, Random Forests, K-Means Clustering.'
      },
      'dl': {
        title: 'Deep Learning (DL)',
        desc: 'A subfield of ML utilizing Artificial Neural Networks with multiple layers (deep architectures) that learn hierarchical representations from raw data without manual feature engineering.',
        example: 'Convolutional Neural Networks (CNNs) for vision, Transformers for language.'
      },
      'genai': {
        title: 'Generative AI (GenAI)',
        desc: 'Cutting-edge models trained on massive multimodal corpora capable of generating novel synthetic text, photorealistic imagery, code, audio, and video.',
        example: 'LLMs (GPT-4, Gemini), Diffusion models (Stable Diffusion, Midjourney).'
      }
    };

    const info = details[layer];
    if (!info) return;

    const targetEl = document.getElementById('venn-info-card');
    if (targetEl) {
      targetEl.innerHTML = `
        <h4 style="color: var(--accent-cyan); margin-bottom: 6px; font-size: 1.1rem;">${info.title}</h4>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 10px;">${info.desc}</p>
        <div style="font-size: 0.8rem; background: rgba(255,255,255,0.04); padding: 8px 12px; border-radius: 6px; border-left: 3px solid var(--accent-purple);">
          <strong style="color: var(--text-purple);">Real-World Examples:</strong> ${info.example}
        </div>
      `;
      if (window.soundEngine) window.soundEngine.playBlip(520, 0.05);
    }
  }
}

window.FundamentalsModule = FundamentalsModule;
