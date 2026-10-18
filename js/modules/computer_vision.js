/* ==========================================================================
   Module 4: Computer Vision & Convolutional Neural Network (CNN) Visualizer
   Live spatial 2D convolution kernel engine with interactive pixel-level math inspector
   ========================================================================== */

class ComputerVisionModule {
  constructor() {
    this.inCanvas = document.getElementById('cv-input-canvas');
    this.outCanvas = document.getElementById('cv-output-canvas');
    this.poolCanvas = document.getElementById('cv-pool-canvas');

    this.inCtx = this.inCanvas ? this.inCanvas.getContext('2d') : null;
    this.outCtx = this.outCanvas ? this.outCanvas.getContext('2d') : null;
    this.poolCtx = this.poolCanvas ? this.poolCanvas.getContext('2d') : null;

    this.gridSize = 32; // 32x32 resolution for fast smooth inspection
    this.inputGrid = [];
    this.outputGrid = [];
    this.pooledGrid = [];

    // Current 3x3 Kernel
    this.kernel = [
      [-1, -1, -1],
      [-1,  8, -1],
      [-1, -1, -1]
    ]; // Default: Laplacian Edge Detection

    this.kernelsPreset = {
      'edge': [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]],
      'sobel_h': [[-1, -2, -1], [0, 0, 0], [1, 2, 1]],
      'sobel_v': [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
      'sharpen': [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
      'blur': [[1/9, 1/9, 1/9], [1/9, 1/9, 1/9], [1/9, 1/9, 1/9]],
      'emboss': [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]],
      'identity': [[0, 0, 0], [0, 1, 0], [0, 0, 0]]
    };

    this.isDrawing = false;
    this.appliedKernelsCount = 0;

    this.init();
  }

  init() {
    this.initInputGrid('digit');
    this.bindEvents();
    this.renderKernelInputs();
    this.applyConvolution();
  }

  initInputGrid(preset = 'digit') {
    this.inputGrid = [];
    for (let y = 0; y < this.gridSize; y++) {
      const row = [];
      for (let x = 0; x < this.gridSize; x++) {
        row.push(0);
      }
      this.inputGrid.push(row);
    }

    if (preset === 'digit') {
      // Draw a synthetic handwritten-style digit "8" or "AI"
      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          const dy1 = y - 11;
          const dx1 = x - 16;
          const d1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
          if (d1 > 4.5 && d1 < 8.5) this.inputGrid[y][x] = 230;

          const dy2 = y - 21;
          const dx2 = x - 16;
          const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (d2 > 5 && d2 < 9.5) this.inputGrid[y][x] = 230;
        }
      }
    } else if (preset === 'cross') {
      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          if (Math.abs(x - 16) < 3 || Math.abs(y - 16) < 3) {
            this.inputGrid[y][x] = 240;
          }
        }
      }
    } else if (preset === 'diagonal') {
      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          if (Math.abs(x - y) < 4 || Math.abs((this.gridSize - 1 - x) - y) < 4) {
            this.inputGrid[y][x] = 240;
          }
        }
      }
    }

    this.renderInputCanvas();
  }

  renderKernelInputs() {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const input = document.getElementById(`k-${r}-${c}`);
        if (input) {
          const val = this.kernel[r][c];
          input.value = Number.isInteger(val) ? val : val.toFixed(2);
        }
      }
    }
  }

  applyConvolution() {
    const size = this.gridSize;
    this.outputGrid = [];

    // Apply 3x3 convolution with zero-padding
    for (let y = 0; y < size; y++) {
      const outRow = [];
      for (let x = 0; x < size; x++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const py = y + ky;
            const px = x + kx;
            const pixelVal = (py >= 0 && py < size && px >= 0 && px < size) ? this.inputGrid[py][px] : 0;
            const weight = this.kernel[ky + 1][kx + 1];
            sum += pixelVal * weight;
          }
        }
        // ReLU activation: max(0, sum)
        const relu = Math.max(0, sum);
        outRow.push(Math.min(255, relu));
      }
      this.outputGrid.push(outRow);
    }

    // Apply 2x2 Max Pooling
    const poolSize = size / 2;
    this.pooledGrid = [];
    for (let py = 0; py < poolSize; py++) {
      const pRow = [];
      for (let px = 0; px < poolSize; px++) {
        const v1 = this.outputGrid[py * 2][px * 2];
        const v2 = this.outputGrid[py * 2][px * 2 + 1];
        const v3 = this.outputGrid[py * 2 + 1][px * 2];
        const v4 = this.outputGrid[py * 2 + 1][px * 2 + 1];
        pRow.push(Math.max(v1, v2, v3, v4));
      }
      this.pooledGrid.push(pRow);
    }

    this.renderAllCanvases();
  }

  renderAllCanvases() {
    this.renderInputCanvas();
    this.renderOutputCanvas();
    this.renderPoolCanvas();
  }

  renderInputCanvas() {
    if (!this.inCtx) return;
    const w = this.inCanvas.width;
    const h = this.inCanvas.height;
    const cell = w / this.gridSize;

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const val = this.inputGrid[y][x];
        this.inCtx.fillStyle = `rgb(${val}, ${val}, ${val})`;
        this.inCtx.fillRect(x * cell, y * cell, cell + 0.5, cell + 0.5);
      }
    }
  }

  renderOutputCanvas() {
    if (!this.outCtx) return;
    const w = this.outCanvas.width;
    const h = this.outCanvas.height;
    const cell = w / this.gridSize;

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const val = this.outputGrid[y][x];
        // Cyan color map for feature map
        this.outCtx.fillStyle = `rgb(${Math.floor(val * 0.1)}, ${Math.floor(val * 0.7)}, ${Math.floor(val * 0.95)})`;
        this.outCtx.fillRect(x * cell, y * cell, cell + 0.5, cell + 0.5);
      }
    }
  }

  renderPoolCanvas() {
    if (!this.poolCtx) return;
    const w = this.poolCanvas.width;
    const h = this.poolCanvas.height;
    const poolSize = this.gridSize / 2;
    const cell = w / poolSize;

    for (let y = 0; y < poolSize; y++) {
      for (let x = 0; x < poolSize; x++) {
        const val = this.pooledGrid[y][x];
        this.poolCtx.fillStyle = `rgb(${Math.floor(val * 0.65)}, ${Math.floor(val * 0.3)}, ${Math.floor(val * 0.95)})`;
        this.poolCtx.fillRect(x * cell, y * cell, cell + 0.5, cell + 0.5);
      }
    }
  }

  inspectPixelMath(gridX, gridY) {
    if (gridX < 0 || gridX >= this.gridSize || gridY < 0 || gridY >= this.gridSize) return;

    let mathSteps = [];
    let totalSum = 0;

    for (let ky = -1; ky <= 1; ky++) {
      for (let kx = -1; kx <= 1; kx++) {
        const py = gridY + ky;
        const px = gridX + kx;
        const pixel = (py >= 0 && py < this.gridSize && px >= 0 && px < this.gridSize) ? this.inputGrid[py][px] : 0;
        const weight = this.kernel[ky + 1][kx + 1];
        const prod = pixel * weight;
        totalSum += prod;
        mathSteps.push(`(${pixel} × ${Number.isInteger(weight) ? weight : weight.toFixed(2)})`);
      }
    }

    const mathDisplay = document.getElementById('cv-math-breakdown');
    if (mathDisplay) {
      mathDisplay.innerHTML = `
        <div style="font-family: var(--font-mono); font-size: 0.8rem; line-height: 1.6;">
          <div><strong style="color: var(--accent-cyan);">Target Cell (x=${gridX}, y=${gridY}):</strong></div>
          <div style="color: var(--text-dim); margin: 4px 0;">3x3 Sum = ${mathSteps.slice(0, 3).join(' + ')} + ...</div>
          <div><strong>Linear Sum:</strong> <span style="color: #f59e0b;">${totalSum.toFixed(1)}</span></div>
          <div><strong>After ReLU + Clip:</strong> <span style="color: var(--accent-emerald); font-weight: 700;">${Math.min(255, Math.max(0, Math.round(totalSum)))}</span></div>
        </div>
      `;
    }
  }

  bindEvents() {
    // Drawing on Input Canvas
    const handleDraw = (e) => {
      const rect = this.inCanvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const x = Math.floor(((clientX - rect.left) / rect.width) * this.gridSize);
      const y = Math.floor(((clientY - rect.top) / rect.height) * this.gridSize);

      if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
        // Draw brush with soft radius
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < this.gridSize && nx >= 0 && nx < this.gridSize) {
              const intensity = (dx === 0 && dy === 0) ? 255 : 180;
              this.inputGrid[ny][nx] = Math.max(this.inputGrid[ny][nx], intensity);
            }
          }
        }
        this.applyConvolution();
        this.inspectPixelMath(x, y);
      }
    };

    this.inCanvas.addEventListener('mousedown', (e) => {
      this.isDrawing = true;
      handleDraw(e);
    });
    window.addEventListener('mouseup', () => this.isDrawing = false);
    this.inCanvas.addEventListener('mousemove', (e) => {
      if (this.isDrawing) handleDraw(e);
      const rect = this.inCanvas.getBoundingClientRect();
      const x = Math.floor(((e.clientX - rect.left) / rect.width) * this.gridSize);
      const y = Math.floor(((e.clientY - rect.top) / rect.height) * this.gridSize);
      this.inspectPixelMath(x, y);
    });

    // Preset Buttons
    document.querySelectorAll('.cv-preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const preset = e.target.getAttribute('data-preset');
        if (this.kernelsPreset[preset]) {
          this.kernel = this.kernelsPreset[preset];
          this.renderKernelInputs();
          this.applyConvolution();
          if (window.soundEngine) window.soundEngine.playBlip(540, 0.04);
          
          this.appliedKernelsCount++;
          if (this.appliedKernelsCount >= 4 && window.appState) {
            window.appState.unlockAchievement('kernel_master');
          }
        }
      });
    });

    // Image Presets
    const imgSelect = document.getElementById('cv-img-preset-select');
    if (imgSelect) {
      imgSelect.addEventListener('change', (e) => {
        this.initInputGrid(e.target.value);
        this.applyConvolution();
      });
    }

    // Clear Canvas
    const clearBtn = document.getElementById('cv-btn-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        for (let y = 0; y < this.gridSize; y++) {
          for (let x = 0; x < this.gridSize; x++) {
            this.inputGrid[y][x] = 0;
          }
        }
        this.applyConvolution();
      });
    }

    // Custom Kernel Matrix Cell Input listeners
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const input = document.getElementById(`k-${r}-${c}`);
        if (input) {
          input.addEventListener('input', () => {
            const val = parseFloat(input.value) || 0;
            this.kernel[r][c] = val;
            this.applyConvolution();
          });
        }
      }
    }
  }
}

window.ComputerVisionModule = ComputerVisionModule;
