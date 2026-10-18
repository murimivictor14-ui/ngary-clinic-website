/* ==========================================================================
   Module 7: Interactive Quiz Arena & High-Resolution Certificate Generator
   ========================================================================== */

class QuizArenaModule {
  constructor() {
    this.questions = [
      {
        id: 1,
        topic: 'AI Fundamentals',
        question: 'What is the primary difference between Traditional Rule-Based Programming and Machine Learning?',
        options: [
          'Rule-based AI uses GPUs while ML only runs on CPUs',
          'In ML, the system learns patterns/rules directly from data instead of having every rule explicitly hardcoded by humans',
          'Rule-based systems can generate creative artwork while ML cannot',
          'Machine Learning does not require any mathematical computations'
        ],
        correct: 1,
        explanation: 'In traditional programming, humans write explicit logic rules + input data -> outputs. In Machine Learning, data + answers are fed into algorithms to learn the rules automatically!'
      },
      {
        id: 2,
        topic: 'Neural Networks',
        question: 'Why is an activation function (like ReLU or Sigmoid) necessary in a Deep Neural Network?',
        options: [
          'To increase the file size of the model',
          'To introduce non-linearity, allowing the network to learn complex non-linear decision boundaries',
          'To reset all weights to zero after each training step',
          'To encrypt the neural network weights for privacy'
        ],
        correct: 1,
        explanation: 'Without non-linear activation functions, stacking multiple linear layers ($W_2(W_1 x)$) simply collapses into a single linear transformation, making it impossible to solve non-linear problems like XOR or circular boundaries.'
      },
      {
        id: 3,
        topic: 'Backpropagation',
        question: 'What mathematical principle does Backpropagation use to compute gradients through all layers of a network?',
        options: [
          'The Pythagorean Theorem',
          'The Chain Rule of Calculus',
          'Bayes Theorem',
          'The Fourier Transform'
        ],
        correct: 1,
        explanation: 'Backpropagation applies the Chain Rule of Calculus to calculate the partial derivative of the loss function with respect to every weight by propagating error deltas backwards from output to input.'
      },
      {
        id: 4,
        topic: 'Machine Learning',
        question: 'In K-Means Clustering, what does the algorithm do during each iterative update step?',
        options: [
          'Multiplies all coordinates by -1',
          'Assigns points to the closest centroid, then moves centroids to the mean center of their assigned points',
          'Builds a binary decision tree',
          'Performs tokenization on numerical vectors'
        ],
        correct: 1,
        explanation: 'K-Means alternates between two steps: (1) Expectation/Assignment (assign each data point to its nearest cluster centroid) and (2) Maximization/Update (recalculate centroid positions as the arithmetic mean of assigned points).'
      },
      {
        id: 5,
        topic: 'Computer Vision',
        question: 'What is the primary operation performed by a Convolution Kernel in a CNN?',
        options: [
          'A sliding dot product (element-wise multiplication & sum) over localized 2D receptive fields to extract visual features like edges and textures',
          'Compressing image files into JPEG format',
          'Randomly deleting 50% of the image pixels',
          'Sorting pixels from darkest to lightest'
        ],
        correct: 0,
        explanation: 'Convolutional filters slide across the image matrix computing local weighted sums. This spatial weight sharing enables translation invariance and robust hierarchical feature extraction.'
      },
      {
        id: 6,
        topic: 'NLP & Transformers',
        question: 'What does the famous vector embedding arithmetic equation "King - Man + Woman" result in?',
        options: [
          'Computer',
          'Queen',
          'Apple',
          'President'
        ],
        correct: 1,
        explanation: 'Word embeddings (like Word2Vec) capture semantic relationships in multi-dimensional geometric space. Subtracting the male direction from King and adding the female direction yields the vector coordinates closest to Queen.'
      },
      {
        id: 7,
        topic: 'Large Language Models',
        question: 'What happens when you increase the "Temperature" hyperparameter in an LLM from 0.1 to 1.8?',
        options: [
          'The computer CPU temperature increases physically',
          'The output becomes more deterministic and repetitive',
          'The probability distribution flattens, increasing randomness, novelty, and entropy of generated tokens',
          'The model refuses to generate any text'
        ],
        correct: 2,
        explanation: 'Higher temperature softens the softmax probability distribution ($P(w_i) \propto e^{z_i / T}$), giving lower-probability tokens a higher chance of selection, resulting in more creative or chaotic responses.'
      },
      {
        id: 8,
        topic: 'AI Ethics',
        question: 'How can an AI hiring model become biased against a protected demographic group even if demographic traits are omitted?',
        options: [
          'AI models are inherently immune to human bias',
          'Through proxy features (e.g. zip codes, school names, hobbies) correlated with historical demographic imbalances present in the training data',
          'Because computers prefer numbers over letters',
          'Only if the programmers intentionally wrote biased code'
        ],
        correct: 1,
        explanation: 'Machine learning models inherit historical disparities present in training data. Even without explicit demographic labels, correlated proxy variables allow algorithms to reproduce discriminatory patterns unless debiasing techniques are used.'
      }
    ];

    this.currentIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.selectedAnswer = null;
    this.answered = false;

    this.init();
  }

  init() {
    this.renderQuestion();
    this.bindEvents();
    this.initCertificate();
  }

  bindEvents() {
    const nextBtn = document.getElementById('quiz-btn-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (!this.answered) return;
        this.currentIndex++;
        if (this.currentIndex < this.questions.length) {
          this.renderQuestion();
        } else {
          this.showFinalResults();
        }
      });
    }

    const restartBtn = document.getElementById('quiz-btn-restart');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.currentIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.renderQuestion();
      });
    }
  }

  renderQuestion() {
    const q = this.questions[this.currentIndex];
    this.answered = false;
    this.selectedAnswer = null;

    const topicEl = document.getElementById('quiz-topic-tag');
    const questionTextEl = document.getElementById('quiz-question-text');
    const optionsContainer = document.getElementById('quiz-options-container');
    const progressFill = document.getElementById('quiz-progress-fill');
    const progressText = document.getElementById('quiz-progress-text');
    const explanationBox = document.getElementById('quiz-explanation-box');
    const nextBtn = document.getElementById('quiz-btn-next');
    const resultsContainer = document.getElementById('quiz-results-container');
    const activeQuizBox = document.getElementById('quiz-active-box');

    if (resultsContainer) resultsContainer.style.display = 'none';
    if (activeQuizBox) activeQuizBox.style.display = 'block';

    if (topicEl) topicEl.textContent = q.topic;
    if (questionTextEl) questionTextEl.textContent = `${this.currentIndex + 1}. ${q.question}`;
    if (explanationBox) explanationBox.style.display = 'none';
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.textContent = (this.currentIndex === this.questions.length - 1) ? 'Finish & See Results 🏆' : 'Next Question →';
    }

    const pct = Math.round(((this.currentIndex) / this.questions.length) * 100);
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressText) progressText.textContent = `Question ${this.currentIndex + 1} of ${this.questions.length}`;

    if (optionsContainer) {
      optionsContainer.innerHTML = q.options.map((opt, idx) => `
        <div class="quiz-option" data-index="${idx}">
          <span style="font-weight: 500;">${String.fromCharCode(65 + idx)}. ${opt}</span>
          <span class="quiz-option-icon">⚪</span>
        </div>
      `).join('');

      optionsContainer.querySelectorAll('.quiz-option').forEach(optEl => {
        optEl.addEventListener('click', () => {
          if (this.answered) return;
          const selectedIdx = parseInt(optEl.getAttribute('data-index'));
          this.handleAnswerSelection(selectedIdx, q);
        });
      });
    }
  }

  handleAnswerSelection(selectedIdx, question) {
    this.answered = true;
    this.selectedAnswer = selectedIdx;

    const isCorrect = selectedIdx === question.correct;
    const options = document.querySelectorAll('.quiz-option');
    const explanationBox = document.getElementById('quiz-explanation-box');
    const nextBtn = document.getElementById('quiz-btn-next');

    options.forEach((optEl, idx) => {
      if (idx === question.correct) {
        optEl.classList.add('correct');
        optEl.querySelector('.quiz-option-icon').textContent = '✅';
      } else if (idx === selectedIdx && !isCorrect) {
        optEl.classList.add('incorrect');
        optEl.querySelector('.quiz-option-icon').textContent = '❌';
      }
    });

    if (isCorrect) {
      this.score++;
      this.streak++;
      const xpEarned = 25 + (this.streak > 1 ? (this.streak * 5) : 0);
      if (window.soundEngine) window.soundEngine.playSuccess();
      if (window.appState) window.appState.addXp(xpEarned, `Correct Answer! Streak: x${this.streak}`);
    } else {
      this.streak = 0;
      if (window.soundEngine) window.soundEngine.playError();
    }

    if (explanationBox) {
      explanationBox.style.display = 'block';
      explanationBox.innerHTML = `
        <strong style="color: ${isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
          ${isCorrect ? '✨ Correct!' : '💡 Incorrect!'}
        </strong>
        <p style="margin-top: 6px; color: var(--text-main);">${question.explanation}</p>
      `;
    }

    if (nextBtn) nextBtn.disabled = false;
  }

  showFinalResults() {
    const resultsContainer = document.getElementById('quiz-results-container');
    const activeQuizBox = document.getElementById('quiz-active-box');
    const finalScoreEl = document.getElementById('quiz-final-score');
    const finalMsgEl = document.getElementById('quiz-final-message');
    const progressFill = document.getElementById('quiz-progress-fill');

    if (progressFill) progressFill.style.width = '100%';
    if (activeQuizBox) activeQuizBox.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'block';

    const percentage = Math.round((this.score / this.questions.length) * 100);
    if (finalScoreEl) finalScoreEl.textContent = `${this.score} / ${this.questions.length} (${percentage}%)`;

    if (finalMsgEl) {
      if (percentage >= 75) {
        finalMsgEl.innerHTML = `🎉 Outstanding mastery! You have qualified for your official <strong>AI Academy Certificate</strong> below!`;
        if (window.appState) {
          window.appState.unlockAchievement('ai_graduate');
          window.appState.markModuleComplete('master-cert');
        }
        if (window.soundEngine) window.soundEngine.playLevelUp();
      } else {
        finalMsgEl.innerHTML = `Good effort! Review the interactive modules and retake the quiz to earn your AI Academy Certificate.`;
      }
    }

    this.drawCertificate();
  }

  // ========================================================================
  // CERTIFICATE OF COMPLETION GENERATOR (CANVAS)
  // ========================================================================
  initCertificate() {
    const nameInput = document.getElementById('cert-user-name-input');
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        if (window.appState) {
          window.appState.data.userName = e.target.value || 'AI Graduate';
          window.appState.saveState();
        }
        this.drawCertificate();
      });
    }

    const downloadBtn = document.getElementById('cert-btn-download');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const canvas = document.getElementById('cert-canvas');
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `Synapse_AI_Certificate_${(window.appState.data.userName || 'Graduate').replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        if (window.soundEngine) window.soundEngine.playSuccess();
      });
    }

    setTimeout(() => this.drawCertificate(), 300);
  }

  drawCertificate() {
    const canvas = document.getElementById('cert-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    const userName = (window.appState && window.appState.data.userName) ? window.appState.data.userName : 'Artificial Intelligence Explorer';
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const certId = 'SYN-' + Math.abs(this.hashCode(userName + dateStr)).toString(16).toUpperCase().padStart(8, '0');

    // Background Gradient (Cyber Dark Luxury)
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#070b16');
    bgGrad.addColorStop(0.5, '#0d1527');
    bgGrad.addColorStop(1, '#060a14');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle Grid Pattern
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Outer Cyber Gold/Cyan Ornamental Border
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(28, 28, w - 56, h - 56);

    // Corner Accents
    const corners = [[20, 20], [w - 20, 20], [20, h - 20], [w - 20, h - 20]];
    corners.forEach(([cx, cy]) => {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Academy Badge / Logo
    ctx.textAlign = 'center';
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 15px JetBrains Mono';
    ctx.letterSpacing = '4px';
    ctx.fillText('SYNAPSE INTERACTIVE AI ACADEMY', w / 2, 75);

    // Certificate Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 36px Outfit, sans-serif';
    ctx.fillText('CERTIFICATE OF AI MASTERY', w / 2, 130);

    // Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 16px Plus Jakarta Sans, sans-serif';
    ctx.fillText('This official certificate is proudly presented to', w / 2, 175);

    // Recipient Name
    const nameGrad = ctx.createLinearGradient(w / 2 - 200, 0, w / 2 + 200, 0);
    nameGrad.addColorStop(0, '#38bdf8');
    nameGrad.addColorStop(0.5, '#c084fc');
    nameGrad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = nameGrad;
    ctx.font = 'bold 38px Outfit, sans-serif';
    ctx.fillText(userName, w / 2, 235);

    // Divider Line
    ctx.beginPath();
    ctx.moveTo(w / 2 - 220, 260);
    ctx.lineTo(w / 2 + 220, 260);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Body Text
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px Plus Jakarta Sans, sans-serif';
    ctx.fillText('for successfully demonstrating comprehensive theoretical understanding & interactive laboratory mastery in:', w / 2, 300);

    // Topics Chips
    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 13px JetBrains Mono';
    ctx.fillText('Neural Networks & Backprop  •  K-Means & KNN  •  CNNs & Vision Kernels  •  LLMs & Embeddings  •  AI Ethics', w / 2, 335);

    // Bottom Metadata Row (Signatures & Verification Code)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '12px JetBrains Mono';
    ctx.fillText(`Issued: ${dateStr}`, 60, 420);
    ctx.fillText(`Credential ID: ${certId}`, 60, 440);

    // Seal
    ctx.textAlign = 'right';
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 13px JetBrains Mono';
    ctx.fillText('VERIFIED AUTHENTIC ACADEMIC SEAL', w - 60, 420);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Plus Jakarta Sans';
    ctx.fillText('DeepMind Advanced Agentic Intelligence System', w - 60, 440);
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}

window.QuizArenaModule = QuizArenaModule;
