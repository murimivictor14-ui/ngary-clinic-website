/* ==========================================================================
   Module 6: Ethics, Algorithmic Bias & AI Alignment Interactive Lab
   ========================================================================== */

class EthicsBiasModule {
  constructor() {
    this.canvas = document.getElementById('bias-simulation-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.groupARatio = 0.85; // 85% Group A, 15% Group B
    this.threshold = 0.5;
    this.isDebiased = false;

    this.init();
  }

  init() {
    this.bindEvents();
    this.renderBiasSimulation();
  }

  bindEvents() {
    const ratioSlider = document.getElementById('bias-ratio-slider');
    if (ratioSlider) {
      ratioSlider.addEventListener('input', (e) => {
        this.groupARatio = parseFloat(e.target.value);
        const valEl = document.getElementById('bias-ratio-val');
        if (valEl) valEl.textContent = `${Math.round(this.groupARatio * 100)}% / ${Math.round((1 - this.groupARatio) * 100)}%`;
        this.renderBiasSimulation();
      });
    }

    const thresholdSlider = document.getElementById('bias-thresh-slider');
    if (thresholdSlider) {
      thresholdSlider.addEventListener('input', (e) => {
        this.threshold = parseFloat(e.target.value);
        const valEl = document.getElementById('bias-thresh-val');
        if (valEl) valEl.textContent = this.threshold.toFixed(2);
        this.renderBiasSimulation();
      });
    }

    const debiasBtn = document.getElementById('bias-btn-debias');
    if (debiasBtn) {
      debiasBtn.addEventListener('click', () => {
        this.isDebiased = !this.isDebiased;
        debiasBtn.innerHTML = this.isDebiased ? '✨ Balanced Resampling Active' : '⚖️ Apply Fair Resampling';
        debiasBtn.className = this.isDebiased ? 'btn btn-emerald' : 'btn btn-primary';

        if (this.isDebiased && window.appState) {
          window.appState.unlockAchievement('bias_aware');
        }
        if (window.soundEngine) window.soundEngine.playSuccess();

        this.renderBiasSimulation();
      });
    }
  }

  renderBiasSimulation() {
    if (!this.ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    const totalApplicants = 120;
    const groupACount = Math.round(totalApplicants * (this.isDebiased ? 0.5 : this.groupARatio));
    const groupBCount = totalApplicants - groupACount;

    let groupAApproved = 0;
    let groupBApproved = 0;

    // Simulate applicants with intrinsic qualification score + noise
    // If biased, Group B qualification scores are underestimated by training data imbalance
    const applicantsA = [];
    for (let i = 0; i < groupACount; i++) {
      const qualification = Math.random() * 0.7 + 0.2;
      const modelScore = qualification + (Math.random() - 0.5) * 0.1;
      const approved = modelScore >= this.threshold;
      if (approved) groupAApproved++;
      applicantsA.push({ q: qualification, score: modelScore, approved });
    }

    const applicantsB = [];
    for (let i = 0; i < groupBCount; i++) {
      const qualification = Math.random() * 0.7 + 0.2;
      // Penalty/Shift caused by under-representation unless debiased
      const shift = this.isDebiased ? 0 : -0.22;
      const modelScore = Math.max(0, qualification + shift + (Math.random() - 0.5) * 0.1);
      const approved = modelScore >= this.threshold;
      if (approved) groupBApproved++;
      applicantsB.push({ q: qualification, score: modelScore, approved });
    }

    const rateA = Math.round((groupAApproved / Math.max(1, groupACount)) * 100);
    const rateB = Math.round((groupBApproved / Math.max(1, groupBCount)) * 100);
    const disparity = Math.abs(rateA - rateB);

    // Draw Scatter Distribution on Canvas
    // Top Half: Group A | Bottom Half: Group B
    const drawGroup = (list, startY, height, color, label) => {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      this.ctx.fillRect(10, startY, w - 20, height);

      this.ctx.fillStyle = color;
      this.ctx.font = 'bold 12px Plus Jakarta Sans';
      this.ctx.fillText(label, 20, startY + 22);

      list.forEach(item => {
        const px = 20 + item.score * (w - 60);
        const py = startY + 30 + Math.random() * (height - 45);

        this.ctx.beginPath();
        this.ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        this.ctx.fillStyle = item.approved ? '#10b981' : '#f43f5e';
        this.ctx.fill();
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 0.8;
        this.ctx.stroke();
      });
    };

    drawGroup(applicantsA, 10, h / 2 - 15, '#38bdf8', `Group A (Majority: ${groupACount} samples) - Approval Rate: ${rateA}%`);
    drawGroup(applicantsB, h / 2 + 5, h / 2 - 15, '#c084fc', `Group B (Minority: ${groupBCount} samples) - Approval Rate: ${rateB}%`);

    // Draw Threshold Line
    const threshX = 20 + this.threshold * (w - 60);
    this.ctx.beginPath();
    this.ctx.moveTo(threshX, 0);
    this.ctx.lineTo(threshX, h);
    this.ctx.strokeStyle = '#f59e0b';
    this.ctx.lineWidth = 2.5;
    this.ctx.setLineDash([6, 4]);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    this.ctx.fillStyle = '#f59e0b';
    this.ctx.font = 'bold 11px JetBrains Mono';
    this.ctx.fillText(`Decision Threshold = ${this.threshold.toFixed(2)}`, threshX + 6, 18);

    // Update Metrics HUD
    const disparityEl = document.getElementById('bias-disparity-metric');
    if (disparityEl) {
      disparityEl.innerHTML = `
        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
          <div>Group A Approved: <strong style="color: #38bdf8;">${rateA}%</strong></div>
          <div>Group B Approved: <strong style="color: #c084fc;">${rateB}%</strong></div>
          <div>Disparity Gap: <strong style="color: ${disparity > 25 ? 'var(--accent-rose)' : 'var(--accent-emerald)'}; font-size: 1.1rem;">${disparity}% ${disparity > 25 ? '(High Disparate Impact ⚠️)' : '(Fair / Balanced ✅)'}</strong></div>
        </div>
      `;
    }
  }
}

window.EthicsBiasModule = EthicsBiasModule;
