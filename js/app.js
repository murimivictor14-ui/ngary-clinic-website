/* ==========================================================================
   Synapse AI Academy - Master Application Controller
   ========================================================================== */

class AppController {
  constructor() {
    this.currentView = 'fundamentals';
    this.modules = {};
  }

  init() {
    this.initNavigation();
    this.initHeaderControls();
    this.initGlobalSearch();
    this.initSubscribedState();
    this.instantiateModules();
    this.handleRoute();

    window.addEventListener('hashchange', () => this.handleRoute());
  }

  instantiateModules() {
    try {
      if (window.FundamentalsModule) this.modules.fundamentals = new window.FundamentalsModule();
      if (window.NeuralNetworkModule) this.modules.neural_net = new window.NeuralNetworkModule();
      if (window.MLAlgorithmsModule) this.modules.ml = new window.MLAlgorithmsModule();
      if (window.ComputerVisionModule) this.modules.cv = new window.ComputerVisionModule();
      if (window.NLPModule) this.modules.nlp = new window.NLPModule();
      if (window.EthicsBiasModule) this.modules.ethics = new window.EthicsBiasModule();
      if (window.QuizArenaModule) this.modules.quiz = new window.QuizArenaModule();
    } catch (e) {
      console.error('Error initializing modules', e);
    }
  }

  initSubscribedState() {
    if (!window.appState) return;

    window.appState.subscribe((state) => {
      const levelInfo = window.appState.getCurrentLevelInfo();
      
      // Update Level Badge & Name
      const levelBadgeEl = document.getElementById('user-level-badge');
      const levelNameEl = document.getElementById('user-level-name');
      const headerLevelEl = document.getElementById('header-user-level');
      if (levelBadgeEl) levelBadgeEl.textContent = `LVL ${levelInfo.level}`;
      if (levelNameEl) levelNameEl.textContent = levelInfo.name;
      if (headerLevelEl) headerLevelEl.textContent = `Lvl ${levelInfo.level}`;

      // Update XP and Bar
      const xpTextEl = document.getElementById('user-xp-text');
      const xpFillEl = document.getElementById('user-xp-fill');
      const headerXpEl = document.getElementById('header-xp-val');
      
      const currentLevelRange = levelInfo.maxXp - levelInfo.minXp;
      const progressInLevel = state.xp - levelInfo.minXp;
      const pct = Math.min(100, Math.max(0, Math.round((progressInLevel / currentLevelRange) * 100)));

      if (xpTextEl) xpTextEl.textContent = `${state.xp} / ${levelInfo.maxXp} XP`;
      if (xpFillEl) xpFillEl.style.width = `${pct}%`;
      if (headerXpEl) headerXpEl.textContent = `${state.xp} XP`;

      // Update Streak
      const streakEl = document.getElementById('header-streak-val');
      if (streakEl) streakEl.textContent = `${state.streakDays} Day${state.streakDays > 1 ? 's' : ''}`;

      // Update Explanation Mode buttons
      const eli5Btn = document.getElementById('mode-eli5-btn');
      const techBtn = document.getElementById('mode-tech-btn');
      if (eli5Btn && techBtn) {
        if (state.explanationMode === 'eli5') {
          eli5Btn.classList.add('active');
          techBtn.classList.remove('active');
        } else {
          techBtn.classList.add('active');
          eli5Btn.classList.remove('active');
        }
      }
    });
  }

  initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const targetView = item.getAttribute('data-view');
        if (targetView) {
          e.preventDefault();
          window.location.hash = targetView;
          if (window.soundEngine) window.soundEngine.playClick();
          
          // Close mobile drawer if open
          const sidebar = document.querySelector('.sidebar');
          if (sidebar) sidebar.classList.remove('open');
        }
      });
    });

    const mobileToggle = document.getElementById('mobile-menu-btn');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.toggle('open');
      });
    }
  }

  handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'fundamentals';
    const targetViewEl = document.getElementById(`view-${hash}`);

    if (targetViewEl) {
      document.querySelectorAll('.module-view').forEach(v => v.classList.remove('active'));
      targetViewEl.classList.add('active');

      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-view') === hash);
      });

      this.currentView = hash;
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Trigger redraw on active module canvases if needed
      if (hash === 'neural-nets' && this.modules.neural_net) {
        this.modules.neural_net.renderAll();
      } else if (hash === 'ml-algorithms' && this.modules.ml) {
        this.modules.ml.renderKMeans();
        this.modules.ml.renderKNN();
      } else if (hash === 'vision-cnn' && this.modules.cv) {
        this.modules.cv.renderAllCanvases();
      } else if (hash === 'nlp-llm' && this.modules.nlp) {
        this.modules.nlp.renderEmbeddingSpace();
      } else if (hash === 'ethics-bias' && this.modules.ethics) {
        this.modules.ethics.renderBiasSimulation();
      } else if (hash === 'quiz-cert' && this.modules.quiz) {
        this.modules.quiz.drawCertificate();
      }
    }
  }

  initHeaderControls() {
    // Sound Toggle
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn && window.soundEngine) {
      const updateSoundIcon = () => {
        soundBtn.innerHTML = window.soundEngine.isMuted() ? '🔇' : '🔊';
        soundBtn.title = window.soundEngine.isMuted() ? 'Sound Muted' : 'Sound Active';
      };
      updateSoundIcon();

      soundBtn.addEventListener('click', () => {
        window.soundEngine.toggleMute();
        updateSoundIcon();
        if (!window.soundEngine.isMuted()) {
          window.soundEngine.playClick();
        }
      });
    }

    // Explanation Mode Buttons (ELI5 vs Technical)
    const eli5Btn = document.getElementById('mode-eli5-btn');
    const techBtn = document.getElementById('mode-tech-btn');

    if (eli5Btn) {
      eli5Btn.addEventListener('click', () => {
        if (window.appState) window.appState.setExplanationMode('eli5');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    if (techBtn) {
      techBtn.addEventListener('click', () => {
        if (window.appState) window.appState.setExplanationMode('technical');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    // Light / Dark Theme Toggle
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        themeBtn.innerHTML = isLight ? '☀️' : '🌙';
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }
  }

  initGlobalSearch() {
    const searchInput = document.getElementById('global-search-input');
    if (!searchInput) return;

    const keywordsMap = [
      { key: 'rule', view: 'fundamentals' },
      { key: 'spam', view: 'fundamentals' },
      { key: 'perceptron', view: 'neural-nets' },
      { key: 'backprop', view: 'neural-nets' },
      { key: 'weight', view: 'neural-nets' },
      { key: 'gradient', view: 'neural-nets' },
      { key: 'relu', view: 'neural-nets' },
      { key: 'sigmoid', view: 'neural-nets' },
      { key: 'kmeans', view: 'ml-algorithms' },
      { key: 'cluster', view: 'ml-algorithms' },
      { key: 'knn', view: 'ml-algorithms' },
      { key: 'neighbor', view: 'ml-algorithms' },
      { key: 'cnn', view: 'vision-cnn' },
      { key: 'convolution', view: 'vision-cnn' },
      { key: 'kernel', view: 'vision-cnn' },
      { key: 'sobel', view: 'vision-cnn' },
      { key: 'pooling', view: 'vision-cnn' },
      { key: 'token', view: 'nlp-llm' },
      { key: 'embedding', view: 'nlp-llm' },
      { key: 'vector', view: 'nlp-llm' },
      { key: 'temperature', view: 'nlp-llm' },
      { key: 'prompt', view: 'nlp-llm' },
      { key: 'bias', view: 'ethics-bias' },
      { key: 'fairness', view: 'ethics-bias' },
      { key: 'quiz', view: 'quiz-cert' },
      { key: 'certificate', view: 'quiz-cert' }
    ];

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.toLowerCase().trim();
        const match = keywordsMap.find(k => query.includes(k.key) || k.key.includes(query));
        if (match) {
          window.location.hash = match.view;
          searchInput.value = '';
          if (window.soundEngine) window.soundEngine.playSuccess();
        } else {
          if (window.soundEngine) window.soundEngine.playError();
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.appController = new AppController();
  window.appController.init();
});
