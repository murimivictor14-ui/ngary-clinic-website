/* ==========================================================================
   Synapse AI Academy - Central State & Gamification Engine
   ========================================================================== */

class AppState {
  constructor() {
    this.storageKey = 'synapse_ai_state_v1';
    this.defaultState = {
      userName: 'AI Explorer',
      xp: 150,
      level: 1,
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      explanationMode: 'eli5', // 'eli5' | 'technical'
      completedModules: ['fundamentals-intro'],
      unlockedAchievements: ['first_step'],
      quizScores: {},
      stats: {
        epochsTrained: 0,
        convolutionsRun: 0,
        tokensAnalyzed: 0,
        clustersFormed: 0,
        quizzesCompleted: 0,
      }
    };

    this.achievementsList = [
      { id: 'first_step', title: 'Curious Mind', icon: '🚀', desc: 'Started your AI learning journey', xp: 50 },
      { id: 'first_train', title: 'Gradient Pioneer', icon: '⚡', desc: 'Trained a live Neural Network for 50+ epochs', xp: 100 },
      { id: 'kernel_master', title: 'Vision Maestro', icon: '👁️', desc: 'Applied 5 different convolution kernels to images', xp: 80 },
      { id: 'cluster_pro', title: 'Space Partitioner', icon: '🎯', desc: 'Ran K-Means clustering with optimal convergence', xp: 75 },
      { id: 'token_wizard', title: 'Semantic Alchemist', icon: '🔮', desc: 'Performed vector arithmetic (King - Man + Woman = Queen)', xp: 90 },
      { id: 'bias_aware', title: 'Ethical Guardian', icon: '⚖️', desc: 'Balanced an AI model to prevent algorithmic bias', xp: 85 },
      { id: 'ai_graduate', title: 'Synapse Graduate', icon: '🎓', desc: 'Completed the Master AI Academy Certification', xp: 250 }
    ];

    this.levels = [
      { level: 1, name: 'AI Novice', minXp: 0, maxXp: 300 },
      { level: 2, name: 'Neural Trainee', minXp: 300, maxXp: 700 },
      { level: 3, name: 'Gradient Climber', minXp: 700, maxXp: 1200 },
      { level: 4, name: 'Feature Architect', minXp: 1200, maxXp: 1800 },
      { level: 5, name: 'Deep Thinker', minXp: 1800, maxXp: 2600 },
      { level: 6, name: 'AI Grandmaster', minXp: 2600, maxXp: 99999 }
    ];

    this.listeners = [];
    this.data = this.loadState();
    this.checkStreak();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return Object.assign({}, this.defaultState, JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage', e);
    }
    return Object.assign({}, this.defaultState);
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save state to localStorage', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    listener(this.data);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.data));
  }

  checkStreak() {
    const today = new Date().toISOString().split('T')[0];
    if (this.data.lastActiveDate !== today) {
      const last = new Date(this.data.lastActiveDate);
      const now = new Date(today);
      const diffTime = Math.abs(now - last);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        this.data.streakDays += 1;
      } else if (diffDays > 1) {
        this.data.streakDays = 1;
      }
      this.data.lastActiveDate = today;
      this.saveState();
    }
  }

  addXp(amount, reason = '') {
    const oldLevel = this.getCurrentLevelInfo().level;
    this.data.xp += amount;
    const newLevelInfo = this.getCurrentLevelInfo();
    this.data.level = newLevelInfo.level;

    this.showToast(`+${amount} XP ${reason ? `(${reason})` : ''}`, '⚡');

    if (newLevelInfo.level > oldLevel) {
      if (window.soundEngine) window.soundEngine.playLevelUp();
      this.showToast(`🎉 Level Up! You are now a ${newLevelInfo.name}!`, '🏆', 'toast-achievement');
    }

    this.saveState();
  }

  getCurrentLevelInfo() {
    const xp = this.data.xp;
    for (let i = this.levels.length - 1; i >= 0; i--) {
      if (xp >= this.levels[i].minXp) {
        return this.levels[i];
      }
    }
    return this.levels[0];
  }

  unlockAchievement(achievementId) {
    if (this.data.unlockedAchievements.includes(achievementId)) return;

    const ach = this.achievementsList.find(a => a.id === achievementId);
    if (!ach) return;

    this.data.unlockedAchievements.push(achievementId);
    this.addXp(ach.xp, `Achievement: ${ach.title}`);
    
    if (window.soundEngine) window.soundEngine.playSuccess();
    this.showToast(`Achievement Unlocked: ${ach.title} (${ach.icon})`, ach.icon, 'toast-achievement');

    this.saveState();
  }

  markModuleComplete(moduleId) {
    if (!this.data.completedModules.includes(moduleId)) {
      this.data.completedModules.push(moduleId);
      this.addXp(100, `Completed Module`);
      this.saveState();
    }
  }

  setExplanationMode(mode) {
    this.data.explanationMode = mode;
    this.saveState();
    document.querySelectorAll('[data-explain-eli5]').forEach(el => {
      if (mode === 'eli5') {
        el.style.display = 'block';
      } else {
        el.style.display = 'none';
      }
    });
    document.querySelectorAll('[data-explain-tech]').forEach(el => {
      if (mode === 'technical') {
        el.style.display = 'block';
      } else {
        el.style.display = 'none';
      }
    });
  }

  showToast(message, icon = '💡', extraClass = '') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${extraClass}`;
    toast.innerHTML = `
      <span style="font-size: 1.4rem;">${icon}</span>
      <div style="display: flex; flex-direction: column;">
        <span style="font-size: 0.9rem; font-weight: 600; color: #fff;">${message}</span>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 400);
    }, 3800);
  }
}

window.appState = new AppState();
