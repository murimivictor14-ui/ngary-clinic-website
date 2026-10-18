/* ==========================================================================
   Module 2: Neural Networks & Perceptrons Interactive Engine
   Real multi-layer feedforward neural network with backpropagation & canvas visualizer
   ========================================================================== */

class NeuralNetworkModule {
  constructor() {
    this.canvasDecision = document.getElementById('nn-decision-canvas');
    this.canvasArch = document.getElementById('nn-arch-canvas');
    this.lossCanvas = document.getElementById('nn-loss-canvas');

    this.ctxDecision = this.canvasDecision ? this.canvasDecision.getContext('2d') : null;
    this.ctxArch = this.canvasArch ? this.canvasArch.getContext('2d') : null;
    this.ctxLoss = this.lossCanvas ? this.lossCanvas.getContext('2d') : null;

    // Hyperparameters
    this.learningRate = 0.15;
    this.activationName = 'relu'; // 'relu' | 'sigmoid' | 'tanh'
    this.datasetType = 'xor'; // 'xor' | 'circle' | 'moons' | 'gaussian'
    this.hiddenNeurons = 4;
    this.hiddenLayersCount = 1;
    this.noise = 0.05;

    // Training State
    this.isTraining = false;
    this.epoch = 0;
    this.lossHistory = [];
    this.dataPoints = [];
    this.animFrameId = null;

    // Network Architecture: [2, hidden, 1]
    this.layers = [2, this.hiddenNeurons, 1];
    this.weights = [];
    this.biases = [];

    // Single Neuron Manual Sandbox State
    this.singleW1 = 1.0;
    this.singleW2 = -1.0;
    this.singleBias = 0.0;
    this.singleActivation = 'sigmoid';

    this.init();
  }

  init() {
    this.generateDataset();
    this.buildNetwork();
    this.bindEvents();
    this.renderAll();
    this.initSingleNeuronSandbox();
  }

  // --- Activation Functions & Derivatives ---
  activate(x, type = this.activationName) {
    if (type === 'relu') return Math.max(0, x);
    if (type === 'sigmoid') return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, x))));
    if (type === 'tanh') return Math.tanh(x);
    return x; // linear
  }

  activatePrime(y, type = this.activationName) {
    // y is the activated output
    if (type === 'relu') return y > 0 ? 1 : 0;
    if (type === 'sigmoid') return y * (1 - y);
    if (type === 'tanh') return 1 - y * y;
    return 1;
  }

  buildNetwork() {
    if (this.hiddenLayersCount === 1) {
      this.layers = [2, this.hiddenNeurons, 1];
    } else {
      this.layers = [2, this.hiddenNeurons, this.hiddenNeurons, 1];
    }

    this.weights = [];
    this.biases = [];

    for (let l = 0; l < this.layers.length - 1; l++) {
      const inNodes = this.layers[l];
      const outNodes = this.layers[l + 1];
      const wMatrix = [];
      const bVector = [];

      // Xavier/He initialization
      const scale = Math.sqrt(2 / inNodes);
      for (let i = 0; i < inNodes; i++) {
        const row = [];
        for (let j = 0; j < outNodes; j++) {
          row.push((Math.random() * 2 - 1) * scale);
        }
        wMatrix.push(row);
      }

      for (let j = 0; j < outNodes; j++) {
        bVector.push(0.0);
      }

      this.weights.push(wMatrix);
      this.biases.push(bVector);
    }

    this.epoch = 0;
    this.lossHistory = [];
  }

  generateDataset() {
    this.dataPoints = [];
    const numPoints = 120;

    for (let i = 0; i < numPoints; i++) {
      let x1, x2, label;

      if (this.datasetType === 'xor') {
        x1 = (Math.random() * 2 - 1);
        x2 = (Math.random() * 2 - 1);
        const noiseVal = (Math.random() - 0.5) * this.noise;
        label = (x1 * x2 > 0) ? 1 : 0;
        x1 += noiseVal;
        x2 += noiseVal;
      } else if (this.datasetType === 'circle') {
        const r = Math.random();
        const theta = Math.random() * Math.PI * 2;
        if (r < 0.5) {
          x1 = r * 1.3 * Math.cos(theta);
          x2 = r * 1.3 * Math.sin(theta);
          label = 1;
        } else {
          x1 = (0.6 + r * 0.7) * Math.cos(theta);
          x2 = (0.6 + r * 0.7) * Math.sin(theta);
          label = 0;
        }
        x1 += (Math.random() - 0.5) * this.noise;
        x2 += (Math.random() - 0.5) * this.noise;
      } else if (this.datasetType === 'moons') {
        const half = numPoints / 2;
        if (i < half) {
          const theta = Math.PI * (i / half);
          x1 = Math.cos(theta) * 0.7 - 0.3;
          x2 = Math.sin(theta) * 0.7 - 0.2;
          label = 1;
        } else {
          const theta = Math.PI * ((i - half) / half);
          x1 = 0.3 - Math.cos(theta) * 0.7;
          x2 = 0.2 - Math.sin(theta) * 0.7;
          label = 0;
        }
        x1 += (Math.random() - 0.5) * this.noise;
        x2 += (Math.random() - 0.5) * this.noise;
      } else { // gaussian
        const cluster = Math.floor(Math.random() * 4);
        const centers = [
          [-0.5, -0.5, 1],
          [0.5, 0.5, 1],
          [-0.5, 0.5, 0],
          [0.5, -0.5, 0]
        ];
        const c = centers[cluster];
        x1 = c[0] + (Math.random() - 0.5) * 0.45;
        x2 = c[1] + (Math.random() - 0.5) * 0.45;
        label = c[2];
      }

      this.dataPoints.push({ x1, x2, label });
    }
  }

  // --- Forward Propagation ---
  forward(input) {
    const activations = [input];
    const zs = [];

    let current = input;
    for (let l = 0; l < this.weights.length; l++) {
      const w = this.weights[l];
      const b = this.biases[l];
      const next = [];
      const zRow = [];
      const isOutputLayer = l === this.weights.length - 1;

      for (let j = 0; j < w[0].length; j++) {
        let sum = b[j];
        for (let i = 0; i < current.length; i++) {
          sum += current[i] * w[i][j];
        }
        zRow.push(sum);
        // Output layer always uses sigmoid for [0, 1] probability
        const act = isOutputLayer ? this.activate(sum, 'sigmoid') : this.activate(sum, this.activationName);
        next.push(act);
      }

      zs.push(zRow);
      activations.push(next);
      current = next;
    }

    return { activations, zs };
  }

  // --- Training Step (Forward + Backprop + Gradient Descent) ---
  trainStep() {
    let totalLoss = 0;
    let correctCount = 0;

    // Gradients accumulators
    const dWeights = this.weights.map(w => w.map(row => row.map(() => 0)));
    const dBiases = this.biases.map(b => b.map(() => 0));

    // Mini-batch or full-batch gradient descent
    for (let p of this.dataPoints) {
      const { activations } = this.forward([p.x1, p.x2]);
      const output = activations[activations.length - 1][0];
      const y = p.label;

      // Binary Cross Entropy Loss
      const eps = 1e-15;
      const pred = Math.max(eps, Math.min(1 - eps, output));
      const loss = -(y * Math.log(pred) + (1 - y) * Math.log(1 - pred));
      totalLoss += loss;

      if ((output >= 0.5 && y === 1) || (output < 0.5 && y === 0)) {
        correctCount++;
      }

      // --- Backpropagation ---
      // dL/dOutput * dOutput/dZ
      let deltas = [output - y]; // For sigmoid + BCE, derivative simplifies elegantly to (output - y)

      for (let l = this.weights.length - 1; l >= 0; l--) {
        const inActs = activations[l];
        const currentDeltas = deltas;

        // Gradient w.r.t weights & biases
        for (let i = 0; i < inActs.length; i++) {
          for (let j = 0; j < currentDeltas.length; j++) {
            dWeights[l][i][j] += inActs[i] * currentDeltas[j];
          }
        }

        for (let j = 0; j < currentDeltas.length; j++) {
          dBiases[l][j] += currentDeltas[j];
        }

        // Calculate deltas for previous layer if not input
        if (l > 0) {
          const prevActs = activations[l];
          const nextDeltas = [];
          for (let i = 0; i < prevActs.length; i++) {
            let errorSum = 0;
            for (let j = 0; j < currentDeltas.length; j++) {
              errorSum += this.weights[l][i][j] * currentDeltas[j];
            }
            const prime = this.activatePrime(prevActs[i], this.activationName);
            nextDeltas.push(errorSum * prime);
          }
          deltas = nextDeltas;
        }
      }
    }

    const N = this.dataPoints.length;
    // Apply Gradients with Learning Rate
    for (let l = 0; l < this.weights.length; l++) {
      for (let i = 0; i < this.weights[l].length; i++) {
        for (let j = 0; j < this.weights[l][i].length; j++) {
          this.weights[l][i][j] -= (this.learningRate * dWeights[l][i][j]) / N;
        }
      }
      for (let j = 0; j < this.biases[l].length; j++) {
        this.biases[l][j] -= (this.learningRate * dBiases[l][j]) / N;
      }
    }

    this.epoch++;
    const avgLoss = totalLoss / N;
    const accuracy = Math.round((correctCount / N) * 100);

    this.lossHistory.push(avgLoss);
    if (this.lossHistory.length > 80) this.lossHistory.shift();

    // Stats and achievements
    if (window.appState) {
      window.appState.data.stats.epochsTrained += 1;
      if (window.appState.data.stats.epochsTrained >= 50) {
        window.appState.unlockAchievement('first_train');
      }
    }

    if (this.epoch % 5 === 0 && window.soundEngine && this.isTraining) {
      window.soundEngine.playTrainStep(this.epoch);
    }

    this.updateHUD(avgLoss, accuracy);
  }

  updateHUD(loss, accuracy) {
    const epochEl = document.getElementById('nn-hud-epoch');
    const lossEl = document.getElementById('nn-hud-loss');
    const accEl = document.getElementById('nn-hud-acc');

    if (epochEl) epochEl.textContent = this.epoch;
    if (lossEl) lossEl.textContent = loss.toFixed(4);
    if (accEl) accEl.textContent = `${accuracy}%`;
  }

  // --- Rendering ---
  renderAll() {
    this.renderDecisionBoundary();
    this.renderArchitecture();
    this.renderLossCurve();
  }

  renderDecisionBoundary() {
    if (!this.ctxDecision) return;
    const w = this.canvasDecision.width;
    const h = this.canvasDecision.height;

    // Grid sampling for heatmap
    const res = 28;
    const cellW = w / res;
    const cellH = h / res;

    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        const x1 = (i / res) * 2.4 - 1.2;
        const x2 = 1.2 - (j / res) * 2.4;

        const { activations } = this.forward([x1, x2]);
        const prob = activations[activations.length - 1][0];

        // Color interpolation: Blue (0) -> Cyan -> Neutral -> Amber -> Purple/Rose (1)
        let r, g, b, a;
        if (prob > 0.5) {
          const t = (prob - 0.5) * 2;
          r = Math.floor(168 * t + 30 * (1 - t));
          g = Math.floor(85 * t + 40 * (1 - t));
          b = Math.floor(247 * t + 60 * (1 - t));
          a = 0.35 + t * 0.45;
        } else {
          const t = (0.5 - prob) * 2;
          r = Math.floor(6 * t + 30 * (1 - t));
          g = Math.floor(182 * t + 40 * (1 - t));
          b = Math.floor(212 * t + 60 * (1 - t));
          a = 0.35 + t * 0.45;
        }

        this.ctxDecision.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        this.ctxDecision.fillRect(i * cellW, j * cellH, cellW + 0.5, cellH + 0.5);
      }
    }

    // Draw Data Points
    this.dataPoints.forEach(p => {
      const px = ((p.x1 + 1.2) / 2.4) * w;
      const py = ((1.2 - p.x2) / 2.4) * h;

      this.ctxDecision.beginPath();
      this.ctxDecision.arc(px, py, 5, 0, Math.PI * 2);
      this.ctxDecision.fillStyle = p.label === 1 ? '#c084fc' : '#38bdf8';
      this.ctxDecision.strokeStyle = '#ffffff';
      this.ctxDecision.lineWidth = 1.5;
      this.ctxDecision.shadowColor = p.label === 1 ? '#a855f7' : '#06b6d4';
      this.ctxDecision.shadowBlur = 8;
      this.ctxDecision.fill();
      this.ctxDecision.stroke();
      this.ctxDecision.shadowBlur = 0;
    });
  }

  renderArchitecture() {
    if (!this.ctxArch) return;
    const w = this.canvasArch.width;
    const h = this.canvasArch.height;
    this.ctxArch.clearRect(0, 0, w, h);

    const layerPositions = [];
    const numLayers = this.layers.length;
    const paddingX = 40;
    const usableW = w - paddingX * 2;

    // Calculate node coordinates
    this.layers.forEach((nodesCount, lIdx) => {
      const layerX = paddingX + (lIdx / (numLayers - 1)) * usableW;
      const coords = [];
      const paddingY = 30;
      const usableH = h - paddingY * 2;

      for (let n = 0; n < nodesCount; n++) {
        const layerY = nodesCount === 1 ? h / 2 : paddingY + (n / (nodesCount - 1)) * usableH;
        coords.push({ x: layerX, y: layerY });
      }
      layerPositions.push(coords);
    });

    // Draw Synaptic Connections (Weights)
    for (let l = 0; l < this.weights.length; l++) {
      const wMatrix = this.weights[l];
      const fromNodes = layerPositions[l];
      const toNodes = layerPositions[l + 1];

      for (let i = 0; i < fromNodes.length; i++) {
        for (let j = 0; j < toNodes.length; j++) {
          const weightVal = wMatrix[i][j];
          const thickness = Math.min(6, Math.max(0.8, Math.abs(weightVal) * 2.2));
          const isPositive = weightVal >= 0;

          this.ctxArch.beginPath();
          this.ctxArch.moveTo(fromNodes[i].x, fromNodes[i].y);
          this.ctxArch.lineTo(toNodes[j].x, toNodes[j].y);
          this.ctxArch.strokeStyle = isPositive 
            ? `rgba(6, 182, 212, ${Math.min(0.9, Math.abs(weightVal) * 0.6 + 0.2)})`
            : `rgba(244, 63, 94, ${Math.min(0.9, Math.abs(weightVal) * 0.6 + 0.2)})`;
          this.ctxArch.lineWidth = thickness;
          this.ctxArch.stroke();
        }
      }
    }

    // Draw Neurons
    layerPositions.forEach((nodes, lIdx) => {
      nodes.forEach((pos, nIdx) => {
        this.ctxArch.beginPath();
        this.ctxArch.arc(pos.x, pos.y, 11, 0, Math.PI * 2);
        this.ctxArch.fillStyle = '#0a1020';
        this.ctxArch.strokeStyle = lIdx === 0 ? '#38bdf8' : (lIdx === numLayers - 1 ? '#f59e0b' : '#a855f7');
        this.ctxArch.lineWidth = 2.5;
        this.ctxArch.shadowColor = this.ctxArch.strokeStyle;
        this.ctxArch.shadowBlur = 8;
        this.ctxArch.fill();
        this.ctxArch.stroke();
        this.ctxArch.shadowBlur = 0;

        // Label input and output nodes
        if (lIdx === 0) {
          this.ctxArch.fillStyle = '#94a3b8';
          this.ctxArch.font = '10px JetBrains Mono';
          this.ctxArch.fillText(`X${nIdx + 1}`, pos.x - 24, pos.y + 3);
        } else if (lIdx === numLayers - 1) {
          this.ctxArch.fillStyle = '#94a3b8';
          this.ctxArch.font = '10px JetBrains Mono';
          this.ctxArch.fillText(`ŷ`, pos.x + 16, pos.y + 3);
        }
      });
    });
  }

  renderLossCurve() {
    if (!this.ctxLoss) return;
    const w = this.lossCanvas.width;
    const h = this.lossCanvas.height;
    this.ctxLoss.clearRect(0, 0, w, h);

    // Draw baseline grid
    this.ctxLoss.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctxLoss.lineWidth = 1;
    this.ctxLoss.beginPath();
    this.ctxLoss.moveTo(0, h - 1);
    this.ctxLoss.lineTo(w, h - 1);
    this.ctxLoss.stroke();

    if (this.lossHistory.length < 2) return;

    this.ctxLoss.beginPath();
    const maxVal = Math.max(1.5, ...this.lossHistory);

    this.lossHistory.forEach((loss, idx) => {
      const x = (idx / (this.lossHistory.length - 1)) * w;
      const y = h - (loss / maxVal) * (h - 10) - 5;
      if (idx === 0) this.ctxLoss.moveTo(x, y);
      else this.ctxLoss.lineTo(x, y);
    });

    this.ctxLoss.strokeStyle = '#10b981';
    this.ctxLoss.lineWidth = 2;
    this.ctxLoss.shadowColor = 'rgba(16, 185, 129, 0.5)';
    this.ctxLoss.shadowBlur = 6;
    this.ctxLoss.stroke();
    this.ctxLoss.shadowBlur = 0;
  }

  // --- Single Neuron Sandbox ---
  initSingleNeuronSandbox() {
    const w1Slider = document.getElementById('sn-w1-slider');
    const w2Slider = document.getElementById('sn-w2-slider');
    const bSlider = document.getElementById('sn-bias-slider');
    const actSelect = document.getElementById('sn-act-select');

    const updateSingleNeuron = () => {
      if (w1Slider) this.singleW1 = parseFloat(w1Slider.value);
      if (w2Slider) this.singleW2 = parseFloat(w2Slider.value);
      if (bSlider) this.singleBias = parseFloat(bSlider.value);
      if (actSelect) this.singleActivation = actSelect.value;

      const w1Val = document.getElementById('sn-w1-val');
      const w2Val = document.getElementById('sn-w2-val');
      const bVal = document.getElementById('sn-bias-val');
      if (w1Val) w1Val.textContent = this.singleW1.toFixed(2);
      if (w2Val) w2Val.textContent = this.singleW2.toFixed(2);
      if (bVal) bVal.textContent = this.singleBias.toFixed(2);

      this.renderSingleNeuronCanvas();
    };

    [w1Slider, w2Slider, bSlider, actSelect].forEach(el => {
      if (el) el.addEventListener('input', updateSingleNeuron);
    });

    updateSingleNeuron();
  }

  renderSingleNeuronCanvas() {
    const canvas = document.getElementById('single-neuron-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    const res = 24;
    const cellW = w / res;
    const cellH = h / res;

    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        const x1 = (i / res) * 2 - 1;
        const x2 = 1 - (j / res) * 2;

        const z = this.singleW1 * x1 + this.singleW2 * x2 + this.singleBias;
        const a = this.activate(z, this.singleActivation);

        const intensity = Math.floor(Math.max(0, Math.min(1, a)) * 220);
        ctx.fillStyle = `rgb(${intensity}, ${Math.floor(intensity * 0.6)}, ${255 - intensity})`;
        ctx.fillRect(i * cellW, j * cellH, cellW + 0.5, cellH + 0.5);
      }
    }

    // Draw decision boundary line: w1*x1 + w2*x2 + b = 0 => x2 = (-w1*x1 - b) / w2
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    
    if (Math.abs(this.singleW2) > 0.001) {
      const getPixelY = (x1) => {
        const x2 = (-this.singleW1 * x1 - this.singleBias) / this.singleW2;
        return ((1 - x2) / 2) * h;
      };
      ctx.moveTo(0, getPixelY(-1));
      ctx.lineTo(w, getPixelY(1));
    } else {
      // vertical line: x1 = -b / w1
      const x1 = -this.singleBias / this.singleW1;
      const px = ((x1 + 1) / 2) * w;
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  bindEvents() {
    // Play/Pause Training Button
    const playBtn = document.getElementById('nn-btn-play');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.isTraining = !this.isTraining;
        playBtn.innerHTML = this.isTraining ? '⏸️ Pause Training' : '▶️ Train Model';
        playBtn.className = this.isTraining ? 'btn btn-danger' : 'btn btn-primary';

        if (window.soundEngine) window.soundEngine.playClick();

        if (this.isTraining) {
          const loop = () => {
            if (!this.isTraining) return;
            this.trainStep();
            this.renderAll();
            this.animFrameId = requestAnimationFrame(loop);
          };
          this.animFrameId = requestAnimationFrame(loop);
        } else {
          cancelAnimationFrame(this.animFrameId);
        }
      });
    }

    // Step 1 Epoch
    const stepBtn = document.getElementById('nn-btn-step');
    if (stepBtn) {
      stepBtn.addEventListener('click', () => {
        this.trainStep();
        this.renderAll();
        if (window.soundEngine) window.soundEngine.playTrainStep(this.epoch);
      });
    }

    // Reset Weights
    const resetBtn = document.getElementById('nn-btn-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.buildNetwork();
        this.renderAll();
        this.updateHUD(0, 0);
        if (window.soundEngine) window.soundEngine.playBlip(350, 0.08);
      });
    }

    // Dataset Select
    const datasetSelect = document.getElementById('nn-dataset-select');
    if (datasetSelect) {
      datasetSelect.addEventListener('change', (e) => {
        this.datasetType = e.target.value;
        this.generateDataset();
        this.buildNetwork();
        this.renderAll();
      });
    }

    // Activation Select
    const actSelect = document.getElementById('nn-activation-select');
    if (actSelect) {
      actSelect.addEventListener('change', (e) => {
        this.activationName = e.target.value;
        this.buildNetwork();
        this.renderAll();
      });
    }

    // Learning Rate Slider
    const lrSlider = document.getElementById('nn-lr-slider');
    if (lrSlider) {
      lrSlider.addEventListener('input', (e) => {
        this.learningRate = parseFloat(e.target.value);
        const lrVal = document.getElementById('nn-lr-val');
        if (lrVal) lrVal.textContent = this.learningRate.toFixed(2);
      });
    }

    // Hidden Neurons Slider
    const hiddenSlider = document.getElementById('nn-hidden-slider');
    if (hiddenSlider) {
      hiddenSlider.addEventListener('input', (e) => {
        this.hiddenNeurons = parseInt(e.target.value);
        const valEl = document.getElementById('nn-hidden-val');
        if (valEl) valEl.textContent = this.hiddenNeurons;
        this.buildNetwork();
        this.renderAll();
      });
    }
  }
}

window.NeuralNetworkModule = NeuralNetworkModule;
