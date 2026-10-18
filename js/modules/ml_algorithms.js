/* ==========================================================================
   Module 3: Machine Learning Algorithms (K-Means Clustering & KNN Classifier)
   ========================================================================== */

class MLAlgorithmsModule {
  constructor() {
    this.initKMeans();
    this.initKNN();
  }

  // ========================================================================
  // K-MEANS CLUSTERING ENGINE
  // ========================================================================
  initKMeans() {
    this.kmCanvas = document.getElementById('kmeans-canvas');
    if (!this.kmCanvas) return;
    this.kmCtx = this.kmCanvas.getContext('2d');

    this.k = 3;
    this.kmPoints = [];
    this.kmCentroids = [];
    this.kmColors = ['#06b6d4', '#a855f7', '#10b981', '#f59e0b', '#f43f5e', '#38bdf8'];
    this.kmStepState = 0; // 0: assign, 1: update
    this.kmIteration = 0;
    this.kmAutoInterval = null;

    this.bindKMeansEvents();
    this.generateKMeansData('clusters');
  }

  bindKMeansEvents() {
    // Click on canvas to add point
    this.kmCanvas.addEventListener('click', (e) => {
      const rect = this.kmCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.kmPoints.push({ x, y, cluster: -1 });
      if (window.soundEngine) window.soundEngine.playClick();
      this.renderKMeans();
    });

    const kSlider = document.getElementById('km-k-slider');
    if (kSlider) {
      kSlider.addEventListener('input', (e) => {
        this.k = parseInt(e.target.value);
        const kVal = document.getElementById('km-k-val');
        if (kVal) kVal.textContent = this.k;
        this.initCentroids();
        this.renderKMeans();
      });
    }

    const resetBtn = document.getElementById('km-btn-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.generateKMeansData('clusters');
      });
    }

    const stepBtn = document.getElementById('km-btn-step');
    if (stepBtn) {
      stepBtn.addEventListener('click', () => {
        this.stepKMeans();
      });
    }

    const autoBtn = document.getElementById('km-btn-auto');
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.kmAutoInterval) {
          clearInterval(this.kmAutoInterval);
          this.kmAutoInterval = null;
          autoBtn.innerHTML = '⚡ Auto Converge';
          autoBtn.className = 'btn btn-primary';
        } else {
          autoBtn.innerHTML = '⏸️ Stop Auto';
          autoBtn.className = 'btn btn-danger';
          this.kmAutoInterval = setInterval(() => {
            const converged = this.stepKMeans();
            if (converged) {
              clearInterval(this.kmAutoInterval);
              this.kmAutoInterval = null;
              autoBtn.innerHTML = '⚡ Auto Converge';
              autoBtn.className = 'btn btn-primary';
              if (window.soundEngine) window.soundEngine.playSuccess();
              if (window.appState) window.appState.unlockAchievement('cluster_pro');
            }
          }, 300);
        }
      });
    }
  }

  generateKMeansData(pattern = 'clusters') {
    this.kmPoints = [];
    const w = this.kmCanvas.width;
    const h = this.kmCanvas.height;

    if (pattern === 'clusters') {
      const clusterCenters = [
        { x: w * 0.25, y: h * 0.3 },
        { x: w * 0.75, y: h * 0.35 },
        { x: w * 0.5, y: h * 0.75 }
      ];

      clusterCenters.forEach(center => {
        for (let i = 0; i < 35; i++) {
          const r = Math.random() * 55;
          const theta = Math.random() * Math.PI * 2;
          this.kmPoints.push({
            x: center.x + r * Math.cos(theta),
            y: center.y + r * Math.sin(theta),
            cluster: -1
          });
        }
      });
    }

    this.initCentroids();
    this.renderKMeans();
  }

  initCentroids() {
    this.kmCentroids = [];
    this.kmIteration = 0;
    this.kmStepState = 0;

    // Pick random data points as initial centroids (K-Means++)
    for (let i = 0; i < this.k; i++) {
      const idx = Math.floor(Math.random() * this.kmPoints.length);
      const pt = this.kmPoints[idx] || { x: Math.random() * this.kmCanvas.width, y: Math.random() * this.kmCanvas.height };
      this.kmCentroids.push({
        x: pt.x + (Math.random() - 0.5) * 10,
        y: pt.y + (Math.random() - 0.5) * 10,
        color: this.kmColors[i % this.kmColors.length]
      });
    }

    this.updateKMeansHUD(0);
  }

  stepKMeans() {
    let changed = false;

    if (this.kmStepState === 0) {
      // Step A: Assign points to nearest centroid
      this.kmPoints.forEach(p => {
        let minDist = Infinity;
        let bestCluster = -1;

        this.kmCentroids.forEach((c, cIdx) => {
          const dx = p.x - c.x;
          const dy = p.y - c.y;
          const dist = dx * dx + dy * dy;
          if (dist < minDist) {
            minDist = dist;
            bestCluster = cIdx;
          }
        });

        if (p.cluster !== bestCluster) {
          changed = true;
          p.cluster = bestCluster;
        }
      });

      this.kmStepState = 1;
      if (window.soundEngine) window.soundEngine.playBlip(440, 0.04);
    } else {
      // Step B: Update centroids to mean of cluster points
      this.kmCentroids.forEach((c, cIdx) => {
        const assigned = this.kmPoints.filter(p => p.cluster === cIdx);
        if (assigned.length > 0) {
          const sumX = assigned.reduce((acc, p) => acc + p.x, 0);
          const sumY = assigned.reduce((acc, p) => acc + p.y, 0);
          const newX = sumX / assigned.length;
          const newY = sumY / assigned.length;

          if (Math.hypot(newX - c.x, newY - c.y) > 0.5) {
            changed = true;
          }

          c.x = newX;
          c.y = newY;
        }
      });

      this.kmIteration++;
      this.kmStepState = 0;
      if (window.soundEngine) window.soundEngine.playBlip(620, 0.04);
    }

    // Calculate Inertia (WCSS)
    let wcss = 0;
    this.kmPoints.forEach(p => {
      if (p.cluster >= 0 && this.kmCentroids[p.cluster]) {
        const c = this.kmCentroids[p.cluster];
        wcss += Math.hypot(p.x - c.x, p.y - c.y);
      }
    });

    this.updateKMeansHUD(Math.round(wcss));
    this.renderKMeans();

    return !changed && this.kmStepState === 0;
  }

  updateKMeansHUD(inertia) {
    const iterEl = document.getElementById('km-hud-iter');
    const stateEl = document.getElementById('km-hud-state');
    const inertiaEl = document.getElementById('km-hud-inertia');

    if (iterEl) iterEl.textContent = this.kmIteration;
    if (stateEl) stateEl.textContent = this.kmStepState === 0 ? 'Assign Points' : 'Recalculate Means';
    if (inertiaEl) inertiaEl.textContent = inertia;
  }

  renderKMeans() {
    if (!this.kmCtx) return;
    const w = this.kmCanvas.width;
    const h = this.kmCanvas.height;
    this.kmCtx.clearRect(0, 0, w, h);

    // Draw Voronoi background approximation
    const vRes = 30;
    const vCellW = w / vRes;
    const vCellH = h / vRes;

    for (let i = 0; i < vRes; i++) {
      for (let j = 0; j < vRes; j++) {
        const px = (i + 0.5) * vCellW;
        const py = (j + 0.5) * vCellH;

        let minDist = Infinity;
        let nearestC = 0;

        this.kmCentroids.forEach((c, idx) => {
          const dist = Math.hypot(px - c.x, py - c.y);
          if (dist < minDist) {
            minDist = dist;
            nearestC = idx;
          }
        });

        const color = this.kmColors[nearestC % this.kmColors.length];
        this.kmCtx.fillStyle = color;
        this.kmCtx.globalAlpha = 0.08;
        this.kmCtx.fillRect(i * vCellW, j * vCellH, vCellW + 1, vCellH + 1);
      }
    }
    this.kmCtx.globalAlpha = 1.0;

    // Draw Data Points and connection lines to their centroid
    this.kmPoints.forEach(p => {
      const color = p.cluster >= 0 ? this.kmColors[p.cluster % this.kmColors.length] : '#94a3b8';

      if (p.cluster >= 0 && this.kmCentroids[p.cluster]) {
        const c = this.kmCentroids[p.cluster];
        this.kmCtx.beginPath();
        this.kmCtx.moveTo(p.x, p.y);
        this.kmCtx.lineTo(c.x, c.y);
        this.kmCtx.strokeStyle = color;
        this.kmCtx.globalAlpha = 0.15;
        this.kmCtx.lineWidth = 1;
        this.kmCtx.stroke();
        this.kmCtx.globalAlpha = 1.0;
      }

      this.kmCtx.beginPath();
      this.kmCtx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      this.kmCtx.fillStyle = color;
      this.kmCtx.fill();
      this.kmCtx.strokeStyle = 'rgba(255,255,255,0.6)';
      this.kmCtx.lineWidth = 1;
      this.kmCtx.stroke();
    });

    // Draw Centroids (Distinct Glowing Cross / Star markers)
    this.kmCentroids.forEach((c, idx) => {
      this.kmCtx.save();
      this.kmCtx.translate(c.x, c.y);

      // Outer pulsing ring
      this.kmCtx.beginPath();
      this.kmCtx.arc(0, 0, 14, 0, Math.PI * 2);
      this.kmCtx.strokeStyle = c.color;
      this.kmCtx.lineWidth = 2.5;
      this.kmCtx.shadowColor = c.color;
      this.kmCtx.shadowBlur = 12;
      this.kmCtx.stroke();

      // Inner Diamond
      this.kmCtx.beginPath();
      this.kmCtx.moveTo(0, -9);
      this.kmCtx.lineTo(9, 0);
      this.kmCtx.lineTo(0, 9);
      this.kmCtx.lineTo(-9, 0);
      this.kmCtx.closePath();
      this.kmCtx.fillStyle = '#ffffff';
      this.kmCtx.fill();

      this.kmCtx.restore();
    });
  }

  // ========================================================================
  // K-NEAREST NEIGHBORS (KNN) ENGINE
  // ========================================================================
  initKNN() {
    this.knnCanvas = document.getElementById('knn-canvas');
    if (!this.knnCanvas) return;
    this.knnCtx = this.knnCanvas.getContext('2d');

    this.knnK = 5;
    this.knnMetric = 'euclidean'; // 'euclidean' | 'manhattan'
    this.knnPoints = [];
    this.knnClasses = [
      { name: 'Alpha Class', color: '#10b981' },
      { name: 'Beta Class', color: '#a855f7' },
      { name: 'Gamma Class', color: '#06b6d4' }
    ];

    this.knnQueryPoint = { x: 200, y: 180 };
    this.generateKNNData();
    this.bindKNNEvents();
    this.renderKNN();
  }

  bindKNNEvents() {
    this.knnCanvas.addEventListener('mousemove', (e) => {
      const rect = this.knnCanvas.getBoundingClientRect();
      this.knnQueryPoint.x = e.clientX - rect.left;
      this.knnQueryPoint.y = e.clientY - rect.top;
      this.renderKNN();
    });

    const kSlider = document.getElementById('knn-k-slider');
    if (kSlider) {
      kSlider.addEventListener('input', (e) => {
        this.knnK = parseInt(e.target.value);
        const kVal = document.getElementById('knn-k-val');
        if (kVal) kVal.textContent = this.knnK;
        this.renderKNN();
      });
    }

    const metricSelect = document.getElementById('knn-metric-select');
    if (metricSelect) {
      metricSelect.addEventListener('change', (e) => {
        this.knnMetric = e.target.value;
        this.renderKNN();
      });
    }
  }

  generateKNNData() {
    this.knnPoints = [];
    const w = this.knnCanvas.width;
    const h = this.knnCanvas.height;

    const clusters = [
      { cx: w * 0.25, cy: h * 0.35, cls: 0, r: 60, n: 25 },
      { cx: w * 0.75, cy: h * 0.35, cls: 1, r: 60, n: 25 },
      { cx: w * 0.5, cy: h * 0.75, cls: 2, r: 65, n: 25 }
    ];

    clusters.forEach(c => {
      for (let i = 0; i < c.n; i++) {
        const r = Math.random() * c.r;
        const theta = Math.random() * Math.PI * 2;
        this.knnPoints.push({
          x: c.cx + r * Math.cos(theta),
          y: c.cy + r * Math.sin(theta),
          cls: c.cls
        });
      }
    });
  }

  renderKNN() {
    if (!this.knnCtx) return;
    const w = this.knnCanvas.width;
    const h = this.knnCanvas.height;
    this.knnCtx.clearRect(0, 0, w, h);

    // Calculate distances to query point
    const scoredPoints = this.knnPoints.map(p => {
      let dist;
      if (this.knnMetric === 'manhattan') {
        dist = Math.abs(p.x - this.knnQueryPoint.x) + Math.abs(p.y - this.knnQueryPoint.y);
      } else {
        dist = Math.hypot(p.x - this.knnQueryPoint.x, p.y - this.knnQueryPoint.y);
      }
      return { ...p, dist };
    });

    scoredPoints.sort((a, b) => a.dist - b.dist);
    const nearestK = scoredPoints.slice(0, this.knnK);

    // Vote counts
    const votes = [0, 0, 0];
    nearestK.forEach(p => votes[p.cls]++);
    let winnerClass = 0;
    let maxVotes = -1;
    votes.forEach((v, idx) => {
      if (v > maxVotes) {
        maxVotes = v;
        winnerClass = idx;
      }
    });

    // Draw neighbor connecting rays
    nearestK.forEach((p, idx) => {
      this.knnCtx.beginPath();
      this.knnCtx.moveTo(this.knnQueryPoint.x, this.knnQueryPoint.y);
      this.knnCtx.lineTo(p.x, p.y);
      this.knnCtx.strokeStyle = this.knnClasses[p.cls].color;
      this.knnCtx.lineWidth = 1.8;
      this.knnCtx.setLineDash([4, 4]);
      this.knnCtx.stroke();
      this.knnCtx.setLineDash([]);
    });

    // Draw training points
    this.knnPoints.forEach(p => {
      this.knnCtx.beginPath();
      this.knnCtx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      this.knnCtx.fillStyle = this.knnClasses[p.cls].color;
      this.knnCtx.fill();
      this.knnCtx.strokeStyle = 'rgba(255,255,255,0.7)';
      this.knnCtx.lineWidth = 1;
      this.knnCtx.stroke();
    });

    // Highlight nearest K points with surrounding rings
    nearestK.forEach(p => {
      this.knnCtx.beginPath();
      this.knnCtx.arc(p.x, p.y, 9, 0, Math.PI * 2);
      this.knnCtx.strokeStyle = '#ffffff';
      this.knnCtx.lineWidth = 2;
      this.knnCtx.stroke();
    });

    // Draw query point (cursor position)
    const winnerColor = this.knnClasses[winnerClass].color;
    this.knnCtx.beginPath();
    this.knnCtx.arc(this.knnQueryPoint.x, this.knnQueryPoint.y, 11, 0, Math.PI * 2);
    this.knnCtx.fillStyle = winnerColor;
    this.knnCtx.shadowColor = winnerColor;
    this.knnCtx.shadowBlur = 15;
    this.knnCtx.fill();
    this.knnCtx.strokeStyle = '#ffffff';
    this.knnCtx.lineWidth = 3;
    this.knnCtx.stroke();
    this.knnCtx.shadowBlur = 0;

    // Update KNN Votes UI
    const voteListEl = document.getElementById('knn-votes-display');
    if (voteListEl) {
      voteListEl.innerHTML = this.knnClasses.map((cls, idx) => `
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem; padding: 4px 0;">
          <span style="color: ${cls.color}; font-weight: 600;">● ${cls.name}</span>
          <span style="font-family: var(--font-mono); font-weight: 700;">${votes[idx]} / ${this.knnK} votes (${Math.round((votes[idx]/this.knnK)*100)}%)</span>
        </div>
      `).join('');
    }
  }
}

window.MLAlgorithmsModule = MLAlgorithmsModule;
