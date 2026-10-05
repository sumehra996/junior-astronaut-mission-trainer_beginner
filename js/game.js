game.js
/**
 * Junior Astronaut Mission Trainer - Main Game Engine
 * Manages game state, trainee profile, stats (Energy, Immunity, XP),
 * countdown timers, Robo-Buddy dialogs, transitions, and all 9 interactive tasks.
 */

class GameEngine {
  constructor() {
    // Trainee State
    this.trainee = {
      id: 'ASTRO-707',
      name: 'Captain Maya',
      characterId: 'puppy',
      mode: 'basic', // 'basic' or 'advanced'
      energy: 100,
      maxEnergy: 100,
      immunity: 100,
      experience: 0,
      currentLevel: 1,
      currentTask: 1,
      currentSubtask: 'A'
    };

    // Progression Locks
    this.unlockedLevels = [1];
    this.unlockedTasks = {
      1: 1, // Level 1: task 1 unlocked
      2: 1,
      3: 1
    };

    // Task Runtime State
    this.taskTimer = null;
    this.taskTimeRemaining = 60;
    this.isTaskRunning = false;
    this.dodgeAnimId = null;

    // Cache DOM Elements
    this.dom = {};
  }

  init() {
    this.cacheDOMElements();
    this.bindEvents();
    this.renderOpeningPreview();
    this.renderCharacterSelection();
    this.updateHUD();
  }

  cacheDOMElements() {
    this.dom.hudBar = document.getElementById('hud-bar');
    this.dom.hudAvatarSlot = document.getElementById('hud-avatar-slot');
    this.dom.hudTraineeName = document.getElementById('hud-trainee-name');
    this.dom.hudTraineeId = document.getElementById('hud-trainee-id');
    this.dom.hudModeBadge = document.getElementById('hud-mode-badge');

    this.dom.statEnergyVal = document.getElementById('stat-energy-val');
    this.dom.barEnergyFill = document.getElementById('bar-energy-fill');
    this.dom.statImmunityVal = document.getElementById('stat-immunity-val');
    this.dom.barImmunityFill = document.getElementById('bar-immunity-fill');
    this.dom.statXpVal = document.getElementById('stat-xp-val');
    this.dom.barXpFill = document.getElementById('bar-xp-fill');

    // Screens
    this.dom.screenOpening = document.getElementById('screen-opening');
    this.dom.screenLaunchIntro = document.getElementById('screen-launch-intro');
    this.dom.screenAstronautCreator = document.getElementById('screen-astronaut-creator');
    this.dom.screenLevelSelect = document.getElementById('screen-level-select');
    this.dom.screenGameplay = document.getElementById('screen-gameplay');

    // Modals
    this.dom.modalTaskSuccess = document.getElementById('modal-task-success');
    this.dom.modalImmunityWarn = document.getElementById('modal-immunity-warn');
    this.dom.modalLevelComplete = document.getElementById('modal-level-complete');
    this.dom.modalGrandFinale = document.getElementById('modal-grand-finale');

    // Gameplay Arena
    this.dom.taskStageContent = document.getElementById('task-stage-content');
    this.dom.breadcrumbLevel = document.getElementById('breadcrumb-level');
    this.dom.breadcrumbTask = document.getElementById('breadcrumb-task');
    this.dom.badgeSubtask = document.getElementById('badge-subtask');
    this.dom.taskTimerVal = document.getElementById('task-timer-val');
    this.dom.robotSpeechText = document.getElementById('robot-speech-text');
    this.dom.arenaAvatarSlot = document.getElementById('arena-avatar-slot');
    this.dom.astronautBubbleText = document.getElementById('astronaut-bubble-text');
  }

  bindEvents() {
    // Sound Toggle
    const btnSound = document.getElementById('btn-sound-toggle');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        const isMuted = window.sounds.toggleMute();
        btnSound.textContent = isMuted ? '🔇' : '🔊';
        if (!isMuted) window.sounds.playClick();
      });
    }

    // Robo-Buddy Help in HUD
    const btnHelp = document.getElementById('btn-hud-help');
    if (btnHelp) {
      btnHelp.addEventListener('click', () => {
        window.sounds.playRobotSpeech();
        this.triggerRobotGuidance("Need a hint? Check the instructions in my banner, keep an eye on your 60-second timer, and don't let immunity get too low!");
      });
    }

    // Mission Map in HUD
    const btnLevels = document.getElementById('btn-hud-levels');
    if (btnLevels) {
      btnLevels.addEventListener('click', () => {
        window.sounds.playClick();
        this.stopTaskTimer();
        this.showScreen(this.dom.screenLevelSelect);
        this.updateLevelSelectUI();
      });
    }

    // Opening Screen: Start Mission
    const btnStart = document.getElementById('btn-start-mission');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        window.sounds.playClick();
        this.startLaunchIntroSequence();
      });
    }

    // Astronaut Creator: Random ID
    const btnRand = document.getElementById('btn-random-id');
    if (btnRand) {
      btnRand.addEventListener('click', () => {
        window.sounds.playPop();
        const prefixes = ['ASTRO', 'COSMO', 'STAR', 'NOVA', 'LUNAR', 'ORBIT'];
        const randomNum = Math.floor(Math.random() * 900) + 100;
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const inputId = document.getElementById('input-trainee-id');
        if (inputId) inputId.value = `{randomNum}`;
      });
    }

    // Astronaut Creator: Game Mode Selection
    const modeBasic = document.getElementById('mode-opt-basic');
    const modeAdv = document.getElementById('mode-opt-advanced');
    if (modeBasic && modeAdv) {
      modeBasic.addEventListener('click', () => {
        window.sounds.playClick();
        modeBasic.classList.add('selected');
        modeAdv.classList.remove('selected');
        this.trainee.mode = 'basic';
      });
      modeAdv.addEventListener('click', () => {
        window.sounds.playClick();
        modeAdv.classList.add('selected');
        modeBasic.classList.remove('selected');
        this.trainee.mode = 'advanced';
      });
    }

    // Astronaut Creator: Confirm Astronaut
    const btnConfirm = document.getElementById('btn-confirm-astronaut');
    if (btnConfirm) {
      btnConfirm.addEventListener('click', () => {
        window.sounds.playSuccess();
        const inputId = document.getElementById('input-trainee-id');
        const inputName = document.getElementById('input-trainee-name');
        if (inputId && inputId.value.trim()) this.trainee.id = inputId.value.trim().toUpperCase();
        if (inputName && inputName.value.trim()) this.trainee.name = inputName.value.trim();

        this.updateHUD();
        this.showScreen(this.dom.screenLevelSelect);
        this.dom.hudBar.classList.remove('hidden');
        this.updateLevelSelectUI();
      });
    }

    // Level Select Buttons
    const btnL1 = document.getElementById('btn-play-level-1');
    const btnL2 = document.getElementById('btn-play-level-2');
    const btnL3 = document.getElementById('btn-play-level-3');

    if (btnL1) {
      btnL1.addEventListener('click', () => {
        window.sounds.playClick();
        this.startLevel(1);
      });
    }
    if (btnL2) {
      btnL2.addEventListener('click', () => {
        if (!this.unlockedLevels.includes(2)) return;
        window.sounds.playClick();
        this.startLevel(2);
      });
    }
    if (btnL3) {
      btnL3.addEventListener('click', () => {
        if (!this.unlockedLevels.includes(3)) return;
        window.sounds.playClick();
        this.startLevel(3);
      });
    }

    // Next Task Modal Button
    const btnNextTask = document.getElementById('btn-next-task');
    if (btnNextTask) {
      btnNextTask.addEventListener('click', () => {
        window.sounds.playClick();
        this.closeModal(this.dom.modalTaskSuccess);
        this.advanceSubtask();
      });
    }

    // Recover Immunity Button
    const btnRecover = document.getElementById('btn-recover-immunity');
    if (btnRecover) {
      btnRecover.addEventListener('click', () => {
        window.sounds.playSuccess();
        this.closeModal(this.dom.modalImmunityWarn);
        this.recoverImmunity();
      });
    }

    // Launch Next Level Modal Button
    const btnLaunchNext = document.getElementById('btn-launch-next-level');
    if (btnLaunchNext) {
      btnLaunchNext.addEventListener('click', () => {
        window.sounds.playLaunch();
        this.closeModal(this.dom.modalLevelComplete);
        const nextLvl = this.trainee.currentLevel + 1;
        if (nextLvl <= 3) {
          this.startLevel(nextLvl);
        } else {
          this.triggerGrandFinale();
        }
      });
    }

    // Replay Game Button
    const btnReplay = document.getElementById('btn-replay-game');
    if (btnReplay) {
      btnReplay.addEventListener('click', () => {
        window.sounds.playClick();
        this.closeModal(this.dom.modalGrandFinale);
        this.trainee.energy = 100;
        this.trainee.immunity = 100;
        this.trainee.experience = 0;
        this.unlockedLevels = [1];
        this.unlockedTasks = { 1: 1, 2: 1, 3: 1 };
        this.updateHUD();
        this.showScreen(this.dom.screenLevelSelect);
        this.updateLevelSelectUI();
      });
    }

    // Print Certificate Button
    const btnPrint = document.getElementById('btn-print-cert');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.sounds.playClick();
        window.print();
      });
    }
  }

  /* ========================================================================
     SCREEN SWITCHING & HUD
     ======================================================================== */
  showScreen(targetScreen) {
    const screens = [
      this.dom.screenOpening,
      this.dom.screenLaunchIntro,
      this.dom.screenAstronautCreator,
      this.dom.screenLevelSelect,
      this.dom.screenGameplay
    ];
    screens.forEach(s => {
      if (s) s.classList.remove('active');
    });
    if (targetScreen) targetScreen.classList.add('active');
  }

  updateHUD() {
    if (this.dom.hudTraineeName) this.dom.hudTraineeName.textContent = this.trainee.name;
    if (this.dom.hudTraineeId) this.dom.hudTraineeId.textContent = `ID: ${this.trainee.id}`;

    if (this.dom.hudModeBadge) {
      this.dom.hudModeBadge.textContent = this.trainee.mode === 'basic' ? 'Basic' : 'Advanced';
      if (this.trainee.mode === 'advanced') {
        this.dom.hudModeBadge.classList.add('advanced');
      } else {
        this.dom.hudModeBadge.classList.remove('advanced');
      }
    }

    // Avatar icon in HUD
    if (this.dom.hudAvatarSlot) {
      this.dom.hudAvatarSlot.innerHTML = window.CharacterRenderer.renderAvatarSVG(this.trainee.characterId, 54, false);
    }

    // Energy Bar
    if (this.dom.statEnergyVal) this.dom.statEnergyVal.textContent = `${Math.round(this.trainee.energy)}/100`;
    if (this.dom.barEnergyFill) {
      const ePercent = Math.max(0, Math.min(100, this.trainee.energy));
      this.dom.barEnergyFill.style.width = `${ePercent}%`;
    }

    // Immunity Bar
    if (this.dom.statImmunityVal) this.dom.statImmunityVal.textContent = `${Math.round(this.trainee.immunity)}%`;
    if (this.dom.barImmunityFill) {
      const iPercent = Math.max(0, Math.min(100, this.trainee.immunity));
      this.dom.barImmunityFill.style.width = `${iPercent}%`;
      if (iPercent < 25) {
        this.dom.barImmunityFill.classList.add('low');
      } else {
        this.dom.barImmunityFill.classList.remove('low');
      }
    }

    // XP Bar
    if (this.dom.statXpVal) this.dom.statXpVal.textContent = `${this.trainee.experience} XP`;
    if (this.dom.barXpFill) {
      const xpPercent = Math.min(100, Math.max(10, (this.trainee.experience / 600) * 100));
      this.dom.barXpFill.style.width = `${xpPercent}%`;
    }

    // Third-person astronaut in gameplay arena
    if (this.dom.arenaAvatarSlot) {
      this.dom.arenaAvatarSlot.innerHTML = window.CharacterRenderer.renderAvatarSVG(this.trainee.characterId, 130, true);
    }
  }

  renderOpeningPreview() {
    const previewContainer = document.getElementById('opening-avatars-preview');
    if (!previewContainer) return;
    previewContainer.innerHTML = '';
    window.ASTRONAUT_CHARACTERS.forEach(char => {
      const circle = document.createElement('div');
      circle.className = 'preview-avatar-circle';
      circle.title = `{char.animal})`;
      circle.innerHTML = window.CharacterRenderer.renderAvatarSVG(char.id, 56, false);
      previewContainer.appendChild(circle);
    });
  }

  renderCharacterSelection() {
    const grid = document.getElementById('characters-selection-grid');
    if (!grid) return;
    grid.innerHTML = '';

    window.ASTRONAUT_CHARACTERS.forEach(char => {
      const card = document.createElement('div');
      card.className = `char-card ${char.id === this.trainee.characterId ? 'selected' : ''}`;
      card.dataset.charId = char.id;

      card.innerHTML = `
        <div class="char-avatar-container">
          ${window.CharacterRenderer.renderAvatarSVG(char.id, 110, true)}
        </div>
        <div class="char-name">${char.name}</div>
        <div class="char-suit-pill" style="background: ${char.suitColorHex}22; color: ${char.suitColorHex}; border-color: ${char.suitColorHex};">
          Suit: ${char.suitColorName}
        </div>
        <div class="char-stat-mini">
          <div class="stat-row">
            <span>Immunity:</span>
            <span class="stat-stars">${window.CharacterRenderer.getStarString(char.endurance)}</span>
          </div>
          <div class="stat-row">
            <span>Technical:</span>
            <span class="stat-stars">${window.CharacterRenderer.getStarString(char.technical)}</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        window.sounds.playClick();
        document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.trainee.characterId = char.id;
        this.updateHUD();
      });

      grid.appendChild(card);
    });
  }

  updateLevelSelectUI() {
    for (let lvl = 1; lvl <= 3; lvl++) {
      const card = document.getElementById(`level-card-${lvl}`);
      const btn = document.getElementById(`btn-play-level-${lvl}`);
      const isUnlocked = this.unlockedLevels.includes(lvl);

      if (card && btn) {
        if (isUnlocked) {
          card.classList.remove('locked');
          card.classList.add('unlocked');
          btn.disabled = false;
          btn.innerHTML = `<span>ENTER LEVEL ${lvl} 🚀</span>`;
        } else {
          card.classList.add('locked');
          card.classList.remove('unlocked');
          btn.disabled = true;
          btn.innerHTML = `<span>LOCKED 🔒</span>`;
        }
      }

      // Update task dots
      for (let t = 1; t <= 3; t++) {
        const dot = document.getElementById(`dot-{t}`);
        if (dot) {
          const currentProgress = this.unlockedTasks[lvl] || 1;
          if (currentProgress > t || this.unlockedLevels.includes(lvl + 1)) {
            dot.className = 'task-indicator-dot completed';
            dot.textContent = '✓';
          } else if (currentProgress === t && isUnlocked) {
            dot.className = 'task-indicator-dot active';
            dot.textContent = `${t}`;
          } else {
            dot.className = 'task-indicator-dot';
            dot.textContent = `${t}`;
          }
        }
      }
    }
  }

  /* ========================================================================
     OPENING ROCKET LAUNCH TRANSITION SEQUENCE
     ======================================================================== */
  startLaunchIntroSequence() {
    this.showScreen(this.dom.screenLaunchIntro);
    const countText = document.getElementById('launch-countdown-text');
    const captionText = document.getElementById('launch-caption-text');
    const rocketActor = document.getElementById('launch-rocket-actor');

    if (!countText || !captionText || !rocketActor) {
      this.showScreen(this.dom.screenAstronautCreator);
      return;
    }

    countText.textContent = '';
    captionText.style.display = 'none';
    rocketActor.className = 'launch-rocket-container';

    // 1. Rocket on Earth surface preparing for launch
    setTimeout(() => {
      rocketActor.classList.add('preparing');
      window.sounds.playHum();
    }, 700);

    // 2. Countdown 3 -> 2 -> 1
    const countdownSteps = [
      { num: '3', delay: 1800 },
      { num: '2', delay: 3000 },
      { num: '1', delay: 4200 }
    ];

    countdownSteps.forEach(step => {
      setTimeout(() => {
        countText.textContent = step.num;
        countText.style.animation = 'none';
        void countText.offsetWidth; // re-trigger css animation
        countText.style.animation = 'popCount 0.9s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        window.sounds.playCountdown(parseInt(step.num));
      }, step.delay);
    });

    // 3. Caption: "Are you ready for the mission buddy?"
    setTimeout(() => {
      countText.textContent = '🚀 BLAST OFF!';
      captionText.style.display = 'block';
      window.sounds.playRobotSpeech();
    }, 5400);

    // 4. Rocket launches upward from Earth toward the Moon
    setTimeout(() => {
      rocketActor.classList.add('launching');
      window.sounds.playLaunch();
    }, 6200);

    // 5. Smooth transition into Astronaut Creation Page
    setTimeout(() => {
      this.showScreen(this.dom.screenAstronautCreator);
      window.sounds.playFanfare();
    }, 9800);
  }

  /* ========================================================================
     LEVEL & TASK PROGRESSION
     ======================================================================== */
  startLevel(lvlNumber) {
    this.trainee.currentLevel = lvlNumber;
    this.trainee.currentTask = this.unlockedTasks[lvlNumber] || 1;
    this.trainee.currentSubtask = 'A';

    // New Level Begins: Restore Energy to Full!
    this.trainee.energy = this.trainee.maxEnergy;
    this.trainee.immunity = 100;
    this.updateHUD();

    this.showScreen(this.dom.screenGameplay);
    this.loadCurrentTask();
  }

  loadCurrentTask() {
    this.stopTaskTimer();
    this.taskTimeRemaining = 60;
    this.updateTimerDisplay();

    const lvl = this.trainee.currentLevel;
    const task = this.trainee.currentTask;
    const sub = this.trainee.currentSubtask;

    // Update Breadcrumbs
    const levelNames = { 1: 'Level 1: Earth Workshop', 2: 'Level 2: Moon Survival', 3: 'Level 3: Return to Earth' };
    const taskNames = {
      1: { 1: 'Fix Oxygen System', 2: 'Build Radiation Shielding', 3: 'Generate Power' },
      2: { 1: 'Maintain Life Support', 2: 'Grow Food', 3: 'Save Power' },
      3: { 1: 'Survive Radiation Storm', 2: 'Manage Food Supplies', 3: 'Launch Back to Earth' }
    };

    if (this.dom.breadcrumbLevel) this.dom.breadcrumbLevel.textContent = levelNames[lvl];
    if (this.dom.breadcrumbTask) this.dom.breadcrumbTask.textContent = `Task ${task}: ${taskNames[lvl][task]}`;
    if (this.dom.badgeSubtask) this.dom.badgeSubtask.textContent = `Part ${sub}`;

    // Update Astronaut Chat Bubble
    if (this.dom.astronautBubbleText) {
      const cheerful = ['On it!', 'Let’s do this!', 'Easy peasy!', 'Calculating...', 'Ready!'];
      this.dom.astronautBubbleText.textContent = cheerful[Math.floor(Math.random() * cheerful.length)];
    }

    // Start 60s Countdown
    this.startTaskTimer();

    // Random immunity fluctuation during task
    this.handleRandomImmunityDrop();

    // Dispatch subtask implementation
    const method = `render_L{task}_${sub}`;
    if (typeof this[method] === 'function') {
      this[method]();
    } else {
      console.warn('Subtask handler not found:', method);
    }
  }

  startTaskTimer() {
    this.isTaskRunning = true;
    this.taskTimer = setInterval(() => {
      this.taskTimeRemaining--;
      this.updateTimerDisplay();

      if (this.taskTimeRemaining <= 0) {
        this.stopTaskTimer();
        this.handleTaskTimeout();
      }
    }, 1000);
  }

  stopTaskTimer() {
    if (this.taskTimer) {
      clearInterval(this.taskTimer);
      this.taskTimer = null;
    }
    this.isTaskRunning = false;
    if (this.dodgeAnimId) {
      cancelAnimationFrame(this.dodgeAnimId);
      this.dodgeAnimId = null;
    }
  }

  updateTimerDisplay() {
    if (!this.dom.taskTimerVal) return;
    this.dom.taskTimerVal.textContent = `${this.taskTimeRemaining}s`;
    if (this.taskTimeRemaining <= 10) {
      this.dom.taskTimerVal.classList.add('danger');
    } else {
      this.dom.taskTimerVal.classList.remove('danger');
    }
  }

  handleTaskTimeout() {
    window.sounds.playError();
    // Failed task: immunity falls to zero or low, energy decreases, partial xp gained
    this.applyImmunityLoss(100);
    this.consumeEnergy(20);
    this.gainExperience(10, true); // Partial XP: trainee learns from attempt!
    this.showImmunityWarning("Time expired! Your suit's telemetry dropped to critical levels. Rest and recalibrate to try again!");
  }

  handleRandomImmunityDrop() {
    // Immunity fluctuates during gameplay
    if (Math.random() < 0.35) {
      setTimeout(() => {
        if (!this.isTaskRunning) return;
        const drop = Math.floor(Math.random() * 12) + 8;
        this.applyImmunityLoss(drop);
      }, 5000 + Math.random() * 10000);
    }
  }

  applyImmunityLoss(amount) {
    if (this.trainee.mode === 'basic') {
      // Basic Mode: Immunity NEVER falls to zero! Capped at 20%
      this.trainee.immunity = Math.max(20, this.trainee.immunity - amount * 0.5);
    } else {
      // Advanced Mode: Immunity can reach 0
      this.trainee.immunity = Math.max(0, this.trainee.immunity - amount);
      if (this.trainee.immunity <= 0) {
        this.stopTaskTimer();
        this.showImmunityWarning("Warning! Radiation / low suit vitals detected. Immunity has dropped to zero!");
      }
    }
    this.updateHUD();
  }

  consumeEnergy(amount) {
    // Character technical skill or endurance gives slight energy efficiency
    const char = window.ASTRONAUT_CHARACTERS.find(c => c.id === this.trainee.characterId);
    const discount = char ? (char.endurance - 3) * 1.5 : 0;
    const finalCost = Math.max(5, amount - discount);

    this.trainee.energy = Math.max(0, this.trainee.energy - finalCost);
    this.updateHUD();

    if (this.trainee.energy <= 0) {
      // Out of energy! Force level restart
      alert("⚡ Out of Energy! You gave it your all, Cadet. Let's recharge and restart this level!");
      this.startLevel(this.trainee.currentLevel);
    }
  }

  gainExperience(amount, isFailureAttempt = false) {
    if (isFailureAttempt) {
      this.trainee.experience += amount;
    } else {
      this.trainee.experience += amount;
    }
    this.updateHUD();
  }

  showImmunityWarning(msg) {
    const warnMsg = document.getElementById('modal-warn-msg');
    if (warnMsg) warnMsg.textContent = msg;
    this.openModal(this.dom.modalImmunityWarn);
  }

  recoverImmunity() {
    // Recovering immunity costs 10 energy
    this.consumeEnergy(10);
    this.trainee.immunity = 100;
    this.updateHUD();
    // Restart current task safely
    this.loadCurrentTask();
  }

  triggerRobotGuidance(text) {
    if (this.dom.robotSpeechText) {
      this.dom.robotSpeechText.textContent = text;
      window.sounds.playRobotSpeech();
    }
  }

  onSubtaskComplete(appreciationText) {
    this.stopTaskTimer();
    window.sounds.playSuccess();

    // Subtask rewards
    this.consumeEnergy(15);
    this.gainExperience(35);

    // Check if this was subtask C (ends the main task)
    if (this.trainee.currentSubtask === 'C') {
      this.onMainTaskComplete(appreciationText);
    } else {
      // Move to next subtask smoothly with appreciation dialog
      this.showTaskAppreciation(appreciationText, false);
    }
  }

  onMainTaskComplete(appreciationText) {
    const lvl = this.trainee.currentLevel;
    const currentT = this.trainee.currentTask;

    // Check if this completes the whole level (Task 3 finished)
    if (currentT === 3) {
      this.onLevelComplete();
    } else {
      // Unlock next task in this level
      this.unlockedTasks[lvl] = Math.max(this.unlockedTasks[lvl] || 1, currentT + 1);
      this.showTaskAppreciation(appreciationText, true);
    }
  }

  showTaskAppreciation(message, isFullTaskComplete) {
    const title = document.getElementById('modal-success-title');
    const msg = document.getElementById('modal-success-msg');
    const xpPill = document.getElementById('modal-gain-xp');
    const energyPill = document.getElementById('modal-cost-energy');

    if (title) title.textContent = isFullTaskComplete ? `🌟 Task ${this.trainee.currentTask} Mastered!` : `Part ${this.trainee.currentSubtask} Complete!`;
    if (msg) msg.textContent = message;
    if (xpPill) xpPill.textContent = `+35 XP Gained ⭐`;
    if (energyPill) energyPill.textContent = `-15 Energy Used ⚡`;

    this.openModal(this.dom.modalTaskSuccess);
  }

  advanceSubtask() {
    if (this.trainee.currentSubtask === 'A') {
      this.trainee.currentSubtask = 'B';
    } else if (this.trainee.currentSubtask === 'B') {
      this.trainee.currentSubtask = 'C';
    } else {
      // Subtask was C, advance to next main task
      this.trainee.currentTask++;
      this.trainee.currentSubtask = 'A';
    }
    this.loadCurrentTask();
  }

  onLevelComplete() {
    const lvl = this.trainee.currentLevel;
    window.sounds.playFanfare();

    // Permanent Level XP Bonus
    const bonusXP = lvl === 1 ? 100 : (lvl === 2 ? 150 : 200);
    this.gainExperience(bonusXP);

    // Unlock next level
    if (lvl < 3 && !this.unlockedLevels.includes(lvl + 1)) {
      this.unlockedLevels.push(lvl + 1);
    }

    if (lvl === 3) {
      // Final mission complete!
      this.triggerGrandFinale();
      return;
    }

    const title = document.getElementById('modal-level-title');
    const msg = document.getElementById('modal-level-msg');
    const xpPill = document.getElementById('modal-level-xp');
    const btnText = document.getElementById('btn-launch-next-text');

    if (title) title.textContent = `🎉 Level ${lvl} Mission Accomplished!`;
    if (msg) {
      if (lvl === 1) {
        msg.textContent = `Outstanding work! You graduated from the Earth Workshop. Your rocket is fueled on the launchpad, ready for the Moon!`;
      } else if (lvl === 2) {
        msg.textContent = `Incredible resilience! You successfully survived the Moon base expedition. Prepare for the ultimate return voyage!`;
      }
    }
    if (xpPill) xpPill.textContent = `+${bonusXP} Permanent XP ⭐`;
    if (btnText) btnText.textContent = lvl === 1 ? `LAUNCH TO THE MOON 🌕➔` : `PREPARE RETURN TO EARTH 🚀➔`;

    this.openModal(this.dom.modalLevelComplete);
  }

  triggerGrandFinale() {
    window.sounds.playFanfare();
    this.startConfetti();

    // Populate Certificate
    const certName = document.getElementById('cert-trainee-name');
    const certId = document.getElementById('cert-trainee-id');
    const certAvatar = document.getElementById('cert-avatar-slot');
    const certMode = document.getElementById('cert-mode');
    const certXp = document.getElementById('cert-xp');

    if (certName) certName.textContent = this.trainee.name;
    if (certId) certId.textContent = `Trainee ID: ${this.trainee.id}`;
    if (certAvatar) certAvatar.innerHTML = window.CharacterRenderer.renderAvatarSVG(this.trainee.characterId, 80, true);
    if (certMode) certMode.textContent = this.trainee.mode.toUpperCase();
    if (certXp) certXp.textContent = `${this.trainee.experience} XP ⭐`;

    this.openModal(this.dom.modalGrandFinale);
  }

  startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#FDE047', '#38BDF8', '#F472B6', '#10B981', '#C4B5FD', '#FFFFFF'];

    for (let i = 0; i < 180; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 4 + 2,
        r: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8
      });
    }

    const renderConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height) p.y = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
        ctx.restore();
      });
      requestAnimationFrame(renderConfetti);
    };
    renderConfetti();
  }

  openModal(modalElem) {
    if (modalElem) modalElem.classList.add('active');
  }

  closeModal(modalElem) {
    if (modalElem) modalElem.classList.remove('active');
  }

  /* ========================================================================
     LEVEL 1: EARTH WORKSHOP TASKS
     ======================================================================== */

  // 1A: Fix the Circuit (Connect matching colored wires)
  render_L1_T1_A() {
    this.triggerRobotGuidance("Cadet! Life support circuits are disconnected. Click matching colored terminals on the left and right to link the wires!");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #FDE047;">⚡ Task 1A: Connect Circuit Wires</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Click a colored terminal on the left, then click its matching color on the right!</p>
      </div>

      <div class="wires-game-container" id="wires-box">
        <svg class="wires-svg-canvas" id="wires-canvas"></svg>

        <div class="wire-column" id="left-wire-col">
          <div class="wire-terminal" data-color="#EF4444" data-side="left">
            <div class="wire-node" style="background: #EF4444; color: #EF4444;"></div>
            <span>Red Line</span>
          </div>
          <div class="wire-terminal" data-color="#3B82F6" data-side="left">
            <div class="wire-node" style="background: #3B82F6; color: #3B82F6;"></div>
            <span>Blue Line</span>
          </div>
          <div class="wire-terminal" data-color="#10B981" data-side="left">
            <div class="wire-node" style="background: #10B981; color: #10B981;"></div>
            <span>Green Line</span>
          </div>
          <div class="wire-terminal" data-color="#F59E0B" data-side="left">
            <div class="wire-node" style="background: #F59E0B; color: #F59E0B;"></div>
            <span>Yellow Line</span>
          </div>
        </div>

        <div class="wire-column" id="right-wire-col">
          <div class="wire-terminal" data-color="#10B981" data-side="right">
            <span>Terminal G</span>
            <div class="wire-node" style="background: #10B981; color: #10B981;"></div>
          </div>
          <div class="wire-terminal" data-color="#EF4444" data-side="right">
            <span>Terminal R</span>
            <div class="wire-node" style="background: #EF4444; color: #EF4444;"></div>
          </div>
          <div class="wire-terminal" data-color="#F59E0B" data-side="right">
            <span>Terminal Y</span>
            <div class="wire-node" style="background: #F59E0B; color: #F59E0B;"></div>
          </div>
          <div class="wire-terminal" data-color="#3B82F6" data-side="right">
            <span>Terminal B</span>
            <div class="wire-node" style="background: #3B82F6; color: #3B82F6;"></div>
          </div>
        </div>
      </div>
    `;

    let selectedLeft = null;
    let connectedCount = 0;
    const requiredConnections = 4;
    const leftTerms = this.dom.taskStageContent.querySelectorAll('[data-side="left"]');
    const rightTerms = this.dom.taskStageContent.querySelectorAll('[data-side="right"]');
    const svgCanvas = document.getElementById('wires-canvas');

    leftTerms.forEach(term => {
      term.addEventListener('click', () => {
        if (term.classList.contains('connected')) return;
        window.sounds.playClick();
        leftTerms.forEach(t => t.classList.remove('selected'));
        term.classList.add('selected');
        selectedLeft = term;
      });
    });

    rightTerms.forEach(term => {
      term.addEventListener('click', () => {
        if (!selectedLeft || term.classList.contains('connected')) return;
        const leftColor = selectedLeft.dataset.color;
        const rightColor = term.dataset.color;

        if (leftColor === rightColor) {
          // Success link!
          window.sounds.playZap();
          selectedLeft.classList.remove('selected');
          selectedLeft.classList.add('connected');
          term.classList.add('connected');

          // Draw SVG connection line
          const boxRect = document.getElementById('wires-box').getBoundingClientRect();
          const lRect = selectedLeft.querySelector('.wire-node').getBoundingClientRect();
          const rRect = term.querySelector('.wire-node').getBoundingClientRect();

          const x1 = lRect.right - boxRect.left;
          const y1 = lRect.top + lRect.height / 2 - boxRect.top;
          const x2 = rRect.left - boxRect.left;
          const y2 = rRect.top + rRect.height / 2 - boxRect.top;

          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const d = `M ${x1} ${y1} C ${x1 + 80} ${y1}, ${x2 - 80} ${y2}, ${x2} ${y2}`;
          path.setAttribute('d', d);
          path.setAttribute('stroke', leftColor);
          path.setAttribute('stroke-width', '4');
          path.setAttribute('fill', 'none');
          path.setAttribute('filter', 'drop-shadow(0 0 6px ' + leftColor + ')');
          svgCanvas.appendChild(path);

          connectedCount++;
          selectedLeft = null;

          if (connectedCount >= requiredConnections) {
            setTimeout(() => {
              this.onSubtaskComplete("Super circuit work! Power is humming cleanly through all 4 colored terminals.");
            }, 600);
          }
        } else {
          // Mismatch
          window.sounds.playError();
          this.applyImmunityLoss(5);
          term.classList.add('wrong');
          setTimeout(() => term.classList.remove('wrong'), 400);
        }
      });
    });
  }

  // 1B: Repair the Pipe (Arrange pipe segments)
  render_L1_T1_B() {
    this.triggerRobotGuidance("The oxygen transport pipe is misaligned! Click each pipe piece to rotate it until oxygen can flow cleanly across!");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #38BDF8;">🫁 Task 1B: Align Oxygen Pipe Segments</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Click the pipe tiles to rotate them and guide oxygen from INPUT ➔ OUTPUT!</p>
      </div>

      <div class="pipe-repair-container">
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
          <div style="background: #10B981; color: white; padding: 6px 14px; border-radius: 20px; font-weight: 800;">INPUT 🫧</div>
          <div class="pipe-grid" id="pipe-grid">
            <!-- 6 cells, rotation angles -->
          </div>
          <div style="background: #0284C7; color: white; padding: 6px 14px; border-radius: 20px; font-weight: 800;">OUTPUT 🚀</div>
        </div>
      </div>
    `;

    // 6 pipe segments with correct rotation targets
    const pipes = [
      { id: 0, type: 'straight', rot: 90, target: 0 },
      { id: 1, type: 'elbow', rot: 180, target: 90 },
      { id: 2, type: 'elbow', rot: 0, target: 180 },
      { id: 3, type: 'straight', rot: 90, target: 0 },
      { id: 4, type: 'elbow', rot: 270, target: 90 },
      { id: 5, type: 'straight', rot: 90, target: 0 }
    ];

    const grid = document.getElementById('pipe-grid');
    pipes.forEach(p => {
      const cell = document.createElement('div');
      cell.className = 'pipe-cell';
      cell.dataset.pipeId = p.id;
      cell.style.transform = `rotate(${p.rot}deg)`;

      // Pipe SVG icon
      let svgShape = p.type === 'straight'
        ? `<rect x="35" y="10" width="20" height="70" fill="#38BDF8" rx="6" />`
        : `<path d="M 35 10 L 35 55 Q 35 55 55 55 L 80 55 L 80 35 L 55 35 Q 55 35 55 10 Z" fill="#38BDF8" />`;

      cell.innerHTML = `
        <svg width="70" height="70" viewBox="0 0 90 90">
          ${svgShape}
        </svg>
      `;

      cell.addEventListener('click', () => {
        window.sounds.playClick();
        p.rot = (p.rot + 90) % 360;
        cell.style.transform = `rotate(${p.rot}deg)`;

        // Check if all aligned
        const allCorrect = pipes.every(pipe => pipe.rot % 180 === pipe.target % 180);
        if (allCorrect) {
          document.querySelectorAll('.pipe-cell').forEach(c => c.classList.add('flowing'));
          window.sounds.playWater();
          setTimeout(() => {
            this.onSubtaskComplete("Pure oxygen is flowing smoothly! No leaks detected in the life support pipeline.");
          }, 800);
        }
      });

      grid.appendChild(cell);
    });
  }

  // 1C: Set Oxygen Level (Adjust oxygen gauge)
  render_L1_T1_C() {
    this.triggerRobotGuidance("Now calibrate the oxygen gauge! Drag the slider until the needle rests inside the bright GREEN SAFE ZONE for 2 seconds.");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #10B981;">🎛️ Task 1C: Calibrate Oxygen Safe Zone</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Target O2 Level: 21.0% (Hold inside the green zone!)</p>
      </div>

      <div class="gauge-game-container">
        <div class="gauge-dial-wrap">
          <svg class="gauge-svg" viewBox="0 0 200 120">
            <!-- Dial Arc -->
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#334155" stroke-width="18" stroke-linecap="round" />
            <!-- Green Sweet Spot Arc -->
            <path d="M 85 24 A 80 80 0 0 1 115 24" fill="none" stroke="#10B981" stroke-width="20" />
            <!-- Needle -->
            <line id="gauge-needle" x1="100" y1="100" x2="100" y2="30" stroke="#EF4444" stroke-width="5" stroke-linecap="round" style="transform-origin: 100px 100px; transform: rotate(-60deg); transition: transform 0.1s;" />
            <circle cx="100" cy="100" r="10" fill="#FFFFFF" />
          </svg>
        </div>

        <div style="font-size: 1.8rem; font-weight: 900; color: #FFFFFF; margin-bottom: 8px;">
          <span id="gauge-readout">12.0</span>% O₂
        </div>
        <div id="gauge-status-badge" style="font-size: 0.9rem; font-weight: 800; color: #EF4444; margin-bottom: 15px;">TOO LOW!</div>

        <div class="gauge-slider-wrap">
          <input type="range" min="0" max="40" step="0.5" value="12" class="custom-slider" id="o2-slider">
        </div>
      </div>
    `;

    const slider = document.getElementById('o2-slider');
    const needle = document.getElementById('gauge-needle');
    const readout = document.getElementById('gauge-readout');
    const statusBadge = document.getElementById('gauge-status-badge');
    let holdTimer = null;

    slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      readout.textContent = val.toFixed(1);

      // Rotate needle from -80deg to +80deg
      const angle = ((val - 20) / 20) * 80;
      needle.style.transform = `rotate(${angle}deg)`;

      // Safe zone is 20.5% - 22.0%
      if (val >= 20.0 && val <= 22.5) {
        statusBadge.textContent = 'STABILIZING SAFE ZONE... HOLD STEADY!';
        statusBadge.style.color = '#10B981';
        needle.setAttribute('stroke', '#10B981');

        if (!holdTimer) {
          holdTimer = setTimeout(() => {
            window.sounds.playSuccess();
            slider.disabled = true;
            statusBadge.textContent = 'PERFECTLY STABILIZED! ✓';
            setTimeout(() => {
              this.onSubtaskComplete("Oxygen systems are 100% online and balanced! Training Task 1 is complete!");
            }, 800);
          }, 1800);
        }
      } else {
        if (holdTimer) {
          clearTimeout(holdTimer);
          holdTimer = null;
        }
        needle.setAttribute('stroke', '#EF4444');
        if (val < 20.0) {
          statusBadge.textContent = 'TOO LOW! NEED MORE OXYGEN';
          statusBadge.style.color = '#EF4444';
        } else {
          statusBadge.textContent = 'TOO HIGH! OXYGEN OVERPRESSURE';
          statusBadge.style.color = '#F59E0B';
        }
      }
    });
  }

  /* ========================================================================
     LEVEL 1 - TASK 2: BUILD RADIATION SHIELDING
     ======================================================================== */

  // 2A: Choose the Material
  render_L1_T1_D() {} // fallback
  render_L1_T2_A() {
    this.triggerRobotGuidance("Space is bathed in cosmic rays! Select the best radiation-shielding material from the training cards.");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #FDE047;">☢️ Task 2A: Choose Radiation-Shielding Material</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Which material will protect our astronaut hull from high-energy radiation?</p>
      </div>

      <div class="materials-grid">
        <div class="material-card" data-correct="false">
          <div style="font-size: 3rem; margin-bottom: 8px;">📦</div>
          <h4 style="font-size: 1.2rem; color: #FFFFFF;">Cardboard Box</h4>
          <p style="font-size: 0.85rem; color: #C4B5FD; margin-top: 6px;">Great for packages, but cosmic rays pass right through!</p>
        </div>

        <div class="material-card" data-correct="true">
          <div style="font-size: 3rem; margin-bottom: 8px;">🛡️</div>
          <h4 style="font-size: 1.2rem; color: #FFFFFF;">Lead-Polymer Shield</h4>
          <p style="font-size: 0.85rem; color: #C4B5FD; margin-top: 6px;">Dense composite with hydrogen-rich polymers to stop cosmic particles!</p>
        </div>

        <div class="material-card" data-correct="false">
          <div style="font-size: 3rem; margin-bottom: 8px;">🔘</div>
          <h4 style="font-size: 1.2rem; color: #FFFFFF;">Bubble Wrap</h4>
          <p style="font-size: 0.85rem; color: #C4B5FD; margin-top: 6px;">Fun to pop, but won't stop space radiation!</p>
        </div>

        <div class="material-card" data-correct="false">
          <div style="font-size: 3rem; margin-bottom: 8px;">📄</div>
          <h4 style="font-size: 1.2rem; color: #FFFFFF;">Thin Aluminum Foil</h4>
          <p style="font-size: 0.85rem; color: #C4B5FD; margin-top: 6px;">Too thin! Can cause secondary particle radiation.</p>
        </div>
      </div>
    `;

    const cards = this.dom.taskStageContent.querySelectorAll('.material-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const isCorrect = card.dataset.correct === 'true';
        if (isCorrect) {
          window.sounds.playSuccess();
          card.classList.add('correct');
          cards.forEach(c => c.style.pointerEvents = 'none');
          setTimeout(() => {
            this.onSubtaskComplete("Brilliant choice! High-density Lead-Polymer absorbs radiation and keeps our cabin safe.");
          }, 800);
        } else {
          window.sounds.playError();
          this.applyImmunityLoss(10);
          card.classList.add('wrong');
          setTimeout(() => card.classList.remove('wrong'), 500);
        }
      });
    });
  }

  // 2B: Place the Shields
  render_L1_T2_B() {
    this.triggerRobotGuidance("Now install the 3 shielding plates into the spacecraft hull sockets! Click a plate and click the socket to mount it.");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #38BDF8;">🛡️ Task 2B: Install Shield Plates onto Hull</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Mount all 3 composite plates into the hull sockets.</p>
      </div>

      <div class="drag-slots-arena">
        <!-- Hull Mount Sockets -->
        <div class="hull-mount-box">
          <div class="hull-slot" data-slot="1">Socket Alpha<br>[Empty]</div>
          <div class="hull-slot" data-slot="2">Socket Beta<br>[Empty]</div>
          <div class="hull-slot" data-slot="3">Socket Gamma<br>[Empty]</div>
        </div>

        <!-- Plate Tray -->
        <div class="shields-source-tray" id="plates-tray">
          <div class="shield-draggable-plate" data-plate="1">
            <span style="font-size: 1.8rem;">🛡️</span>
            <span>Plate 1</span>
          </div>
          <div class="shield-draggable-plate" data-plate="2">
            <span style="font-size: 1.8rem;">🛡️</span>
            <span>Plate 2</span>
          </div>
          <div class="shield-draggable-plate" data-plate="3">
            <span style="font-size: 1.8rem;">🛡️</span>
            <span>Plate 3</span>
          </div>
        </div>
      </div>
    `;

    let selectedPlate = null;
    let placedCount = 0;
    const plates = this.dom.taskStageContent.querySelectorAll('.shield-draggable-plate');
    const slots = this.dom.taskStageContent.querySelectorAll('.hull-slot');

    plates.forEach(p => {
      p.addEventListener('click', () => {
        window.sounds.playClick();
        plates.forEach(pl => pl.style.borderColor = '#94A3B8');
        p.style.borderColor = '#FDE047';
        selectedPlate = p;
      });
    });

    slots.forEach(s => {
      s.addEventListener('click', () => {
        if (!selectedPlate || s.classList.contains('filled')) return;
        window.sounds.playPop();
        s.classList.add('filled');
        s.innerHTML = `<span style="font-size: 2rem;">🛡️</span><br><strong>LOCKED ✓</strong>`;
        selectedPlate.style.display = 'none';
        selectedPlate = null;
        placedCount++;

        if (placedCount >= 3) {
          setTimeout(() => {
            this.onSubtaskComplete("All 3 radiation shield plates are securely locked into the hull!");
          }, 600);
        }
      });
    });
  }

  // 2C: Dodge the Asteroids (Low gravity simulation for 20s)
  render_L1_T2_C() {
    this.triggerRobotGuidance("Low-gravity test! Balance your astronaut and dodge the incoming micro-asteroids. Use Arrow Keys or the on-screen buttons!");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 8px;">
        <h3 style="font-size: 1.5rem; color: #FDE047;">☄️ Task 2C: Dodge Micro-Asteroids</h3>
        <p style="color: #DDD6FE; font-size: 0.92rem;">Dodge for 20 seconds! Getting hit lowers your immunity!</p>
      </div>

      <div class="dodge-canvas-container">
        <canvas id="dodge-canvas" width="600" height="300"></canvas>
      </div>

      <div class="dodge-controls">
        <button class="btn-ctrl" id="btn-dodge-left" title="Move Left">⬅️</button>
        <button class="btn-ctrl" id="btn-dodge-right" title="Move Right">➡️</button>
      </div>
    `;

    const canvas = document.getElementById('dodge-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let astroX = 300;
    const astroY = 240;
    const astroWidth = 40;
    const asteroids = [];
    let dodgeTimer = 20;
    let isDodgeActive = true;

    // Spawn asteroids
    const spawnInterval = setInterval(() => {
      if (!isDodgeActive) return;
      asteroids.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: -20,
        r: Math.random() * 8 + 12,
        vy: Math.random() * 2.5 + 2.5,
        vx: (Math.random() - 0.5) * 1.5,
        rot: 0,
        rotSpeed: (Math.random() - 0.5) * 0.1
      });
    }, 450);

    // Countdown interval
    const countdown = setInterval(() => {
      dodgeTimer--;
      if (dodgeTimer <= 0) {
        clearInterval(countdown);
        clearInterval(spawnInterval);
        isDodgeActive = false;
        setTimeout(() => {
          this.onSubtaskComplete("Incredible astronaut agility! You successfully navigated low gravity without hull breach.");
        }, 500);
      }
    }, 1000);

    // Controls
    let moveLeft = false;
    let moveRight = false;

    const leftBtn = document.getElementById('btn-dodge-left');
    const rightBtn = document.getElementById('btn-dodge-right');

    const handleKey = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft = e.type === 'keydown';
      if (e.key === 'ArrowRight' || e.key === 'd') moveRight = e.type === 'keydown';
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);

    leftBtn.addEventListener('pointerdown', () => moveLeft = true);
    leftBtn.addEventListener('pointerup', () => moveLeft = false);
    rightBtn.addEventListener('pointerdown', () => moveRight = true);
    rightBtn.addEventListener('pointerup', () => moveRight = false);

    // Animation Loop
    const loop = () => {
      if (!isDodgeActive) {
        window.removeEventListener('keydown', handleKey);
        window.removeEventListener('keyup', handleKey);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move astronaut
      if (moveLeft) astroX = Math.max(25, astroX - 5.5);
      if (moveRight) astroX = Math.min(canvas.width - 25, astroX + 5.5);

      // Draw Astronaut
      ctx.save();
      ctx.translate(astroX, astroY);
      // Jetpack thrust
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(0, 16, 5 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
      // Suit
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      // Visor
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(0, -2, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Update & Draw Asteroids
      for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        a.y += a.vy;
        a.x += a.vx;
        a.rot += a.rotSpeed;

        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rot);
        ctx.fillStyle = '#78716C';
        ctx.strokeStyle = '#44403C';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, a.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Collision Check
        const dist = Math.hypot(a.x - astroX, a.y - astroY);
        if (dist < a.r + 14) {
          window.sounds.playError();
          this.applyImmunityLoss(12);
          asteroids.splice(i, 1);
          // Red flash
          ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          continue;
        }

        if (a.y > canvas.height + 30) {
          asteroids.splice(i, 1);
        }
      }

      // Draw survival timer
      ctx.fillStyle = '#FDE047';
      ctx.font = 'bold 18px Fredoka, sans-serif';
      ctx.fillText(`Time Remaining: ${dodgeTimer}s`, 20, 30);

      this.dodgeAnimId = requestAnimationFrame(loop);
    };
    loop();
  }

  /* ========================================================================
     LEVEL 1 - TASK 3: GENERATE POWER
     ======================================================================== */

  // 3A: Find the Spot
  render_L1_T3_A() {
    this.triggerRobotGuidance("Solar panels need maximum direct sunlight! Inspect the Earth workshop terrain and click the ideal sunny hilltop.");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #FDE047;">☀️ Task 3A: Identify Optimal Solar Location</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Choose the location that provides 100% unobstructed sunlight!</p>
      </div>

      <div class="solar-spots-grid">
        <div class="spot-card" data-valid="false">
          <div style="font-size: 3rem; margin-bottom: 8px;">🌧️</div>
          <h4 style="font-size: 1.2rem; color: #FFFFFF;">Dark Storm Valley</h4>
          <p style="font-size: 0.85rem; color: #C4B5FD; margin-top: 6px;">Heavy clouds block 85% of solar rays. Unsuitable!</p>
        </div>

        <div class="spot-card" data-valid="false">
          <div style="font-size: 3rem; margin-bottom: 8px;">🏢</div>
          <h4 style="font-size: 1.2rem; color: #FFFFFF;">Hangar Shadow</h4>
          <p style="font-size: 0.85rem; color: #C4B5FD; margin-top: 6px;">Covered by building shade for most of the day.</p>
        </div>

        <div class="spot-card" data-valid="true">
          <div style="font-size: 3rem; margin-bottom: 8px;">☀️⛰️</div>
          <h4 style="font-size: 1.2rem; color: #FFFFFF;">Sunny Hilltop Ridge</h4>
          <p style="font-size: 0.85rem; color: #C4B5FD; margin-top: 6px;">Clear horizon, zero shadows, 100% solar capture!</p>
        </div>
      </div>
    `;

    const spots = this.dom.taskStageContent.querySelectorAll('.spot-card');
    spots.forEach(spot => {
      spot.addEventListener('click', () => {
        const isValid = spot.dataset.valid === 'true';
        if (isValid) {
          window.sounds.playSuccess();
          spot.style.borderColor = '#10B981';
          spot.style.background = 'rgba(16, 185, 129, 0.25)';
          spots.forEach(s => s.style.pointerEvents = 'none');
          setTimeout(() => {
            this.onSubtaskComplete("Spot confirmed! The Sunny Hilltop Ridge will generate peak kilowatts for the station.");
          }, 800);
        } else {
          window.sounds.playError();
          this.applyImmunityLoss(8);
          spot.classList.add('wrong');
          setTimeout(() => spot.classList.remove('wrong'), 400);
        }
      });
    });
  }

  // 3B: Place the Panel (Drag heavy array to mount, immunity slight strain)
  render_L1_T3_B() {
    this.triggerRobotGuidance("Dragging heavy solar equipment takes effort! Drag the solar panel array directly onto the hilltop mounting bracket.");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #38BDF8;">🏗️ Task 3B: Position Solar Array on Mount</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Drag the solar panel onto the glowing mount socket!</p>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center; gap: 30px; margin: 20px auto;">
        <div id="solar-mount-dropzone" style="width: 280px; height: 160px; border: 3px dashed #38BDF8; border-radius: 20px; display: flex; align-items: center; justify-content: center; background: rgba(56, 189, 248, 0.1); color: #38BDF8; font-weight: 800; font-size: 1.1rem; text-align: center; cursor: pointer;">
          [ HILLTOP MOUNT BRACKET ]
        </div>

        <div id="solar-panel-dragitem" style="width: 260px; height: 140px; background: linear-gradient(135deg, #0284C7, #0369A1); border: 3px solid #67E8F9; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: grab; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);">
          <div style="font-size: 2.2rem;">☀️🛰️</div>
          <div style="font-size: 1rem; font-weight: 800; color: white;">HEAVY SOLAR ARRAY</div>
          <div style="font-size: 0.75rem; color: #E0F2FE;">Click or Drag to Mount</div>
        </div>
      </div>
    `;

    const panel = document.getElementById('solar-panel-dragitem');
    const dropzone = document.getElementById('solar-mount-dropzone');

    const handleMount = () => {
      window.sounds.playSuccess();
      // Moving heavy panels causes slight physical strain
      this.applyImmunityLoss(10);
      dropzone.style.borderStyle = 'solid';
      dropzone.style.borderColor = '#10B981';
      dropzone.style.background = 'rgba(16, 185, 129, 0.25)';
      dropzone.innerHTML = `<span style="font-size: 2.5rem;">☀️🛰️</span><br><strong style="color: #10B981;">SOLAR ARRAY SECURED!</strong>`;
      panel.style.display = 'none';

      setTimeout(() => {
        this.onSubtaskComplete("Heavy array securely bolted in! Great physical endurance Cadet.");
      }, 700);
    };

    dropzone.addEventListener('click', handleMount);
    panel.addEventListener('click', handleMount);
  }

  // 3C: Connect the Power
  render_L1_T3_C() {
    this.triggerRobotGuidance("Now connect the solar array high-voltage line to the battery storage grid! Click 'Plug Power Cable'.");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #10B981;">🔌 Task 3C: Connect to Battery Bank</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Plug in the power cable and charge the storage cells to 100%!</p>
      </div>

      <div style="display: flex; justify-content: center; align-items: center; gap: 40px; margin: 30px auto; flex-wrap: wrap;">
        <div style="background: rgba(13, 27, 62, 0.9); border: 2px solid #38BDF8; padding: 20px 30px; border-radius: 20px; text-align: center;">
          <div style="font-size: 3rem;">☀️</div>
          <div style="font-weight: 800; color: white;">Solar Generation</div>
          <div style="color: #38BDF8; font-weight: 700;">+240 kW</div>
        </div>

        <button id="btn-plug-cable" class="btn-primary-large" style="font-size: 1.25rem; padding: 14px 28px;">
          ⚡ PLUG POWER CABLE 🔌
        </button>

        <div style="background: rgba(13, 27, 62, 0.9); border: 2px solid #10B981; padding: 20px 30px; border-radius: 20px; text-align: center; min-width: 180px;">
          <div style="font-size: 3rem;">🔋</div>
          <div style="font-weight: 800; color: white;">Battery Storage</div>
          <div id="battery-charge-num" style="color: #10B981; font-weight: 900; font-size: 1.4rem;">0%</div>
        </div>
      </div>
    `;

    const btn = document.getElementById('btn-plug-cable');
    const chargeNum = document.getElementById('battery-charge-num');

    btn.addEventListener('click', () => {
      btn.disabled = true;
      btn.textContent = 'CHARGING IN PROGRESS... ⚡';
      window.sounds.playZap();

      let charge = 0;
      const interval = setInterval(() => {
        charge += 10;
        chargeNum.textContent = `${charge}%`;
        window.sounds.playPop();

        if (charge >= 100) {
          clearInterval(interval);
          chargeNum.textContent = '100% FULL! ⚡';
          setTimeout(() => {
            this.onSubtaskComplete("Level 1 Earth Workshop Complete! The base has full power and ready telemetry for our Moon voyage!");
          }, 800);
        }
      }, 150);
    });
  }

  /* ========================================================================
     LEVEL 2: MOON SURVIVAL TASKS
     ======================================================================== */

  // 2-1A: Check Oxygen on the Moon
  render_L2_T1_A() {
    this.triggerRobotGuidance("Welcome to the Moon habitat! Use the pressure buttons (+ / -) to balance the lunar air pressure to exactly 101 kPa.");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #38BDF8;">🌕 Task 1A: Balance Lunar Habitat Pressure</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Target Pressure: 101 kPa (Safe human breathing zone)</p>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center; gap: 20px; margin: 30px auto;">
        <div style="font-size: 3.5rem; font-weight: 900; color: #FFFFFF;">
          <span id="lunar-press-val">85</span> <span style="font-size: 1.8rem; color: #38BDF8;">kPa</span>
        </div>

        <div style="display: flex; gap: 20px;">
          <button id="btn-press-minus" class="btn-ctrl" style="font-size: 2rem;">➖</button>
          <button id="btn-press-plus" class="btn-ctrl" style="font-size: 2rem;">➕</button>
        </div>

        <div id="press-status" style="font-size: 1.1rem; font-weight: 800; color: #EF4444;">DANGEROUS: LOW LUNAR PRESSURE</div>
      </div>
    `;

    let press = 85;
    const valElem = document.getElementById('lunar-press-val');
    const statusElem = document.getElementById('press-status');

    const updatePress = (delta) => {
      window.sounds.playClick();
      press += delta;
      valElem.textContent = press;

      if (press === 101) {
        statusElem.textContent = 'PERFECT PRESSURE ACHIEVED! ✓';
        statusElem.style.color = '#10B981';
        window.sounds.playSuccess();
        setTimeout(() => {
          this.onSubtaskComplete("Habitat pressure stabilized perfectly at 101 kPa!");
        }, 700);
      } else if (press < 101) {
        statusElem.textContent = 'PRESSURE STILL TOO LOW';
        statusElem.style.color = '#EF4444';
      } else {
        statusElem.textContent = 'PRESSURE TOO HIGH! VENT AIR';
        statusElem.style.color = '#F59E0B';
      }
    };

    document.getElementById('btn-press-minus').addEventListener('click', () => updatePress(-2));
    document.getElementById('btn-press-plus').addEventListener('click', () => updatePress(2));
  }

  // 2-1B: Fix the Leak (Find and seal 3 hissing leaks with nano-tape)
  render_L2_T1_B() {
    this.triggerRobotGuidance("Alert! Lunar micro-meteoroids punctured the external air lines! Click each of the 3 hissing leaks to seal them with nano-tape.");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #EF4444;">💨 Task 1B: Seal Pipe Air Leaks</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Click the 3 leaking holes to patch them!</p>
      </div>

      <div style="position: relative; width: 100%; max-width: 580px; height: 260px; background: #0F172A; border: 3px solid #64748B; border-radius: 20px; margin: 20px auto; overflow: hidden;">
        <!-- Pipe graphics -->
        <rect width="100%" height="40" y="110" fill="#334155"></rect>

        <div class="air-leak-spot" data-id="1" style="position: absolute; top: 70px; left: 120px; cursor: pointer; text-align: center;">
          <div style="font-size: 2.2rem; animation: pulse-danger 0.4s infinite alternate;">💨</div>
          <span style="font-size: 0.75rem; background: #EF4444; color: white; padding: 2px 6px; border-radius: 8px;">LEAK #1</span>
        </div>

        <div class="air-leak-spot" data-id="2" style="position: absolute; top: 120px; left: 280px; cursor: pointer; text-align: center;">
          <div style="font-size: 2.2rem; animation: pulse-danger 0.4s infinite alternate;">💨</div>
          <span style="font-size: 0.75rem; background: #EF4444; color: white; padding: 2px 6px; border-radius: 8px;">LEAK #2</span>
        </div>

        <div class="air-leak-spot" data-id="3" style="position: absolute; top: 85px; right: 110px; cursor: pointer; text-align: center;">
          <div style="font-size: 2.2rem; animation: pulse-danger 0.4s infinite alternate;">💨</div>
          <span style="font-size: 0.75rem; background: #EF4444; color: white; padding: 2px 6px; border-radius: 8px;">LEAK #3</span>
        </div>
      </div>
    `;

    let sealedCount = 0;
    const leaks = this.dom.taskStageContent.querySelectorAll('.air-leak-spot');

    leaks.forEach(leak => {
      leak.addEventListener('click', () => {
        window.sounds.playZap();
        leak.innerHTML = `
          <div style="font-size: 2.2rem;">🩹</div>
          <span style="font-size: 0.75rem; background: #10B981; color: white; padding: 2px 6px; border-radius: 8px;">SEALED ✓</span>
        `;
        leak.style.pointerEvents = 'none';
        sealedCount++;

        if (sealedCount >= 3) {
          setTimeout(() => {
            this.onSubtaskComplete("All punctures sealed airtight with cosmic nano-tape!");
          }, 600);
        }
      });
    });
  }

  // 2-1C: Restart the System (Simon sequence memory)
  render_L2_T1_C() {
    this.triggerRobotGuidance("Life support mainframe needs rebooting! Memorize the flashing colored button sequence, then press them in that exact order.");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #FDE047;">💻 Task 1C: Reboot Life Support Mainframe</h3>
        <p id="simon-status" style="color: #DDD6FE; font-size: 0.95rem;">Watch the flashing sequence...</p>
      </div>

      <div class="sequence-buttons-wrap">
        <button class="seq-btn color-1" data-val="1"></button>
        <button class="seq-btn color-2" data-val="2"></button>
        <button class="seq-btn color-3" data-val="3"></button>
        <button class="seq-btn color-4" data-val="4"></button>
      </div>
    `;

    const sequence = [1, 3, 2, 4];
    let playerIndex = 0;
    const statusText = document.getElementById('simon-status');
    const buttons = this.dom.taskStageContent.querySelectorAll('.seq-btn');

    // Playback sequence to player
    setTimeout(() => {
      sequence.forEach((btnNum, idx) => {
        setTimeout(() => {
          const btn = document.querySelector(`.seq-btn[data-val="${btnNum}"]`);
          if (btn) {
            btn.classList.add('lit');
            window.sounds.playTone(400 + btnNum * 120, 'sine', 0.2);
            setTimeout(() => btn.classList.remove('lit'), 300);
          }
        }, idx * 600);
      });

      setTimeout(() => {
        statusText.textContent = "YOUR TURN! Repeat the sequence.";
        statusText.style.color = '#FDE047';
      }, sequence.length * 600 + 200);
    }, 800);

    // Player input
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.val);
        btn.classList.add('lit');
        window.sounds.playTone(400 + val * 120, 'sine', 0.15);
        setTimeout(() => btn.classList.remove('lit'), 200);

        if (val === sequence[playerIndex]) {
          playerIndex++;
          if (playerIndex >= sequence.length) {
            statusText.textContent = "MAINFRAME REBOOT SUCCESSFUL! ✓";
            statusText.style.color = '#10B981';
            window.sounds.playSuccess();
            setTimeout(() => {
              this.onSubtaskComplete("Moon base life support is operating at 100% capacity!");
            }, 700);
          }
        } else {
          window.sounds.playError();
          this.applyImmunityLoss(10);
          playerIndex = 0;
          statusText.textContent = "Wrong button! Try again...";
          statusText.style.color = '#EF4444';
        }
      });
    });
  }

  /* ========================================================================
     LEVEL 2 - TASK 2: GROW FOOD
     ======================================================================== */

  // 2-2A: Plant the Seeds
  render_L2_T2_A() {
    this.triggerRobotGuidance("Lunar astronauts need fresh nutrition! Drag or click each of the 3 cosmic seeds into the hydroponics planting pods.");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #10B981;">🌱 Task 2A: Plant Hydroponic Seeds</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Select a seed and place it into an empty soil pod.</p>
      </div>

      <div style="display: flex; justify-content: center; gap: 25px; margin: 30px auto; flex-wrap: wrap;">
        <div class="seed-pod-slot" data-slot="1" style="width: 140px; height: 160px; background: #1E293B; border: 3px dashed #10B981; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
          <div style="font-size: 2.2rem;">🪴</div>
          <div style="font-size: 0.85rem; color: #10B981; font-weight: 700;">Pod #1</div>
        </div>

        <div class="seed-pod-slot" data-slot="2" style="width: 140px; height: 160px; background: #1E293B; border: 3px dashed #10B981; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
          <div style="font-size: 2.2rem;">🪴</div>
          <div style="font-size: 0.85rem; color: #10B981; font-weight: 700;">Pod #2</div>
        </div>

        <div class="seed-pod-slot" data-slot="3" style="width: 140px; height: 160px; background: #1E293B; border: 3px dashed #10B981; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
          <div style="font-size: 2.2rem;">🪴</div>
          <div style="font-size: 0.85rem; color: #10B981; font-weight: 700;">Pod #3</div>
        </div>
      </div>

      <div style="display: flex; justify-content: center; gap: 20px;" id="seeds-tray">
        <button class="btn-secondary seed-btn" data-seed="tomato">🍅 Space Tomato Seed</button>
        <button class="btn-secondary seed-btn" data-seed="lettuce">🥬 Lunar Lettuce Seed</button>
        <button class="btn-secondary seed-btn" data-seed="carrot">🥕 Cosmic Carrot Seed</button>
      </div>
    `;

    let selectedSeed = null;
    let plantedCount = 0;
    const seedBtns = this.dom.taskStageContent.querySelectorAll('.seed-btn');
    const pods = this.dom.taskStageContent.querySelectorAll('.seed-pod-slot');

    seedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        window.sounds.playClick();
        seedBtns.forEach(b => b.style.borderColor = '#5B4B82');
        btn.style.borderColor = '#FDE047';
        selectedSeed = btn;
      });
    });

    pods.forEach(pod => {
      pod.addEventListener('click', () => {
        if (!selectedSeed || pod.classList.contains('planted')) return;
        window.sounds.playPop();
        pod.classList.add('planted');
        pod.style.borderStyle = 'solid';
        pod.innerHTML = `
          <div style="font-size: 2.5rem;">🌱</div>
          <div style="font-size: 0.85rem; color: #34D399; font-weight: 800;">PLANTED ✓</div>
        `;
        selectedSeed.style.display = 'none';
        selectedSeed = null;
        plantedCount++;

        if (plantedCount >= 3) {
          setTimeout(() => {
            this.onSubtaskComplete("All 3 space crops are nestled in the hydroponics soil beds!");
          }, 600);
        }
      });
    });
  }

  // 2-2B: Give Water
  render_L2_T2_B() {
    this.triggerRobotGuidance("Hydroponic plants need optimal moisture! Click 'Water Crops' to bring moisture up to the green safe band.");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #38BDF8;">💧 Task 2B: Hydrate Sprout Beds</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Give water until moisture reaches the 80% sweet spot!</p>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center; gap: 20px; margin: 30px auto;">
        <div style="width: 320px; height: 30px; background: #0F172A; border: 2px solid #64748B; border-radius: 20px; overflow: hidden; position: relative;">
          <div id="moisture-fill" style="width: 20%; height: 100%; background: linear-gradient(90deg, #38BDF8, #0284C7); transition: width 0.3s;"></div>
          <!-- Sweet spot indicator -->
          <div style="position: absolute; left: 75%; top: 0; width: 15%; height: 100%; background: rgba(16, 185, 129, 0.4); border-left: 2px solid #10B981; border-right: 2px solid #10B981;"></div>
        </div>

        <div style="font-size: 1.5rem; font-weight: 900; color: #FFFFFF;">
          Moisture: <span id="moisture-val" style="color: #38BDF8;">20%</span>
        </div>

        <button id="btn-give-water" class="btn-primary-large" style="font-size: 1.25rem; padding: 14px 34px;">
          🚿 SPRAY HYDRATION MIST
        </button>
      </div>
    `;

    let moisture = 20;
    const btn = document.getElementById('btn-give-water');
    const fill = document.getElementById('moisture-fill');
    const valText = document.getElementById('moisture-val');

    btn.addEventListener('click', () => {
      window.sounds.playWater();
      moisture += 15;
      fill.style.width = `${moisture}%`;
      valText.textContent = `${moisture}%`;

      if (moisture >= 75 && moisture <= 90) {
        btn.disabled = true;
        valText.textContent = `${moisture}% (OPTIMAL!) ✓`;
        valText.style.color = '#10B981';
        setTimeout(() => {
          this.onSubtaskComplete("Sprouts are thriving with crisp, fresh lunar hydration!");
        }, 700);
      } else if (moisture > 90) {
        window.sounds.playError();
        this.applyImmunityLoss(10);
        alert("Over-watered! Soil drained automatically. Try again carefully!");
        moisture = 20;
        fill.style.width = '20%';
        valText.textContent = '20%';
      }
    });
  }

  // 2-2C: Turn on the Lights
  render_L2_T2_C() {
    this.triggerRobotGuidance("Plants need ultraviolet photosynthetic spectrum to bloom! Slide the grow-light lamp to 450nm (Purple-Pink glow).");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #C4B5FD;">💡 Task 2C: Set UV Photosynthetic Light Spectrum</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Target Wavelength: 450 nm (Hold for 2 seconds)</p>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center; max-width: 480px; margin: 20px auto; text-align: center;">
        <div id="greenhouse-glow" style="width: 220px; height: 140px; background: rgba(167, 139, 250, 0.2); border: 3px solid #C4B5FD; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 3.5rem; margin-bottom: 15px; box-shadow: 0 0 20px rgba(167, 139, 250, 0.3);">
          🥬🍅
        </div>

        <div style="font-size: 1.8rem; font-weight: 900; color: #FFFFFF; margin-bottom: 15px;">
          <span id="light-nm">300</span> nm
        </div>

        <input type="range" min="200" max="700" value="300" class="custom-slider" id="light-slider">
      </div>
    `;

    const slider = document.getElementById('light-slider');
    const nmText = document.getElementById('light-nm');
    const glow = document.getElementById('greenhouse-glow');
    let timer = null;

    slider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      nmText.textContent = val;

      if (val >= 440 && val <= 460) {
        glow.style.boxShadow = '0 0 40px #E879F9';
        glow.style.borderColor = '#E879F9';
        glow.innerHTML = '🍓🥗🥕';

        if (!timer) {
          timer = setTimeout(() => {
            window.sounds.playSuccess();
            slider.disabled = true;
            this.onSubtaskComplete("Crops have grown to full harvest! Our Moon crew has abundant delicious food.");
          }, 1800);
        }
      } else {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        glow.style.boxShadow = '0 0 10px rgba(167, 139, 250, 0.2)';
        glow.style.borderColor = '#C4B5FD';
      }
    });
  }

  /* ========================================================================
     LEVEL 2 - TASK 3: SAVE POWER
     ======================================================================== */

  // 2-3A: Find the Problem
  render_L2_T3_A() {
    this.triggerRobotGuidance("Power shortage alert! Inspect the base energy consumption diagnostics to spot which device is hogging power.");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #EF4444;">⚡ Task 3A: Identify the Power Hog</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Which non-essential appliance is consuming an outrageous 75% of battery power?</p>
      </div>

      <div class="materials-grid">
        <div class="material-card" data-hog="false">
          <div style="font-size: 3rem;">🫁</div>
          <h4 style="color: white; margin-top: 8px;">Life Support O2</h4>
          <p style="color: #38BDF8; font-weight: 700;">12% Power (Essential)</p>
        </div>

        <div class="material-card" data-hog="true">
          <div style="font-size: 3rem;">🪩✨</div>
          <h4 style="color: white; margin-top: 8px;">Disco Hologram Arcade</h4>
          <p style="color: #EF4444; font-weight: 900;">75% Power Drain!</p>
        </div>

        <div class="material-card" data-hog="false">
          <div style="font-size: 3rem;">🌡️</div>
          <h4 style="color: white; margin-top: 8px;">Habitat Heater</h4>
          <p style="color: #38BDF8; font-weight: 700;">10% Power (Essential)</p>
        </div>

        <div class="material-card" data-hog="false">
          <div style="font-size: 3rem;">🛰️</div>
          <h4 style="color: white; margin-top: 8px;">Radio Antenna</h4>
          <p style="color: #38BDF8; font-weight: 700;">3% Power (Essential)</p>
        </div>
      </div>
    `;

    const cards = this.dom.taskStageContent.querySelectorAll('.material-card');
    cards.forEach(c => {
      c.addEventListener('click', () => {
        const isHog = c.dataset.hog === 'true';
        if (isHog) {
          window.sounds.playSuccess();
          c.classList.add('correct');
          cards.forEach(cd => cd.style.pointerEvents = 'none');
          setTimeout(() => {
            this.onSubtaskComplete("Found it! The Disco Hologram Projector was draining the entire habitat reserve.");
          }, 700);
        } else {
          window.sounds.playError();
          this.applyImmunityLoss(6);
          c.classList.add('wrong');
          setTimeout(() => c.classList.remove('wrong'), 400);
        }
      });
    });
  }

  // 2-3B: Turn Off Unneeded Systems
  render_L2_T3_B() {
    this.triggerRobotGuidance("Flip the toggle switches: Turn OFF the Disco and Decorative Neon, but KEEP Life Support and Heaters ON!");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #FDE047;">🔌 Task 3B: Switch Off Wasteful Systems</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Goal: Cut power to luxuries while maintaining life essentials!</p>
      </div>

      <div class="switchboard-grid">
        <div class="switch-panel-card">
          <span style="font-size: 2rem;">🪩</span>
          <strong style="color: white;">Disco Holo</strong>
          <div class="toggle-switch-ui on" id="sw-disco">
            <div class="toggle-slider-handle"></div>
          </div>
          <span id="sw-disco-state" style="font-size: 0.75rem; color: #EF4444;">ON (DRAINING)</span>
        </div>

        <div class="switch-panel-card">
          <span style="font-size: 2rem;">💡</span>
          <strong style="color: white;">Neon Lights</strong>
          <div class="toggle-switch-ui on" id="sw-neon">
            <div class="toggle-slider-handle"></div>
          </div>
          <span id="sw-neon-state" style="font-size: 0.75rem; color: #EF4444;">ON (DRAINING)</span>
        </div>

        <div class="switch-panel-card">
          <span style="font-size: 2rem;">🫁</span>
          <strong style="color: white;">Life Support</strong>
          <div class="toggle-switch-ui on" id="sw-life" style="cursor: not-allowed;">
            <div class="toggle-slider-handle"></div>
          </div>
          <span style="font-size: 0.75rem; color: #10B981;">KEEP ON!</span>
        </div>

        <div class="switch-panel-card">
          <span style="font-size: 2rem;">🌡️</span>
          <strong style="color: white;">Heater</strong>
          <div class="toggle-switch-ui on" id="sw-heat" style="cursor: not-allowed;">
            <div class="toggle-slider-handle"></div>
          </div>
          <span style="font-size: 0.75rem; color: #10B981;">KEEP ON!</span>
        </div>
      </div>

      <div style="text-align: center; margin-top: 15px;">
        <button id="btn-confirm-switches" class="btn-primary-large" style="font-size: 1.15rem; padding: 12px 30px;">
          CONFIRM SWITCHBOARD ➔
        </button>
      </div>
    `;

    const swDisco = document.getElementById('sw-disco');
    const swNeon = document.getElementById('sw-neon');
    const discoLabel = document.getElementById('sw-disco-state');
    const neonLabel = document.getElementById('sw-neon-state');

    swDisco.addEventListener('click', () => {
      window.sounds.playClick();
      swDisco.classList.toggle('on');
      const isOn = swDisco.classList.contains('on');
      discoLabel.textContent = isOn ? 'ON (DRAINING)' : 'OFF (SAVED!)';
      discoLabel.style.color = isOn ? '#EF4444' : '#10B981';
    });

    swNeon.addEventListener('click', () => {
      window.sounds.playClick();
      swNeon.classList.toggle('on');
      const isOn = swNeon.classList.contains('on');
      neonLabel.textContent = isOn ? 'ON (DRAINING)' : 'OFF (SAVED!)';
      neonLabel.style.color = isOn ? '#EF4444' : '#10B981';
    });

    document.getElementById('btn-confirm-switches').addEventListener('click', () => {
      if (!swDisco.classList.contains('on') && !swNeon.classList.contains('on')) {
        window.sounds.playSuccess();
        this.onSubtaskComplete("Non-essential devices powered down! Power grid consumption reduced by 85%.");
      } else {
        window.sounds.playError();
        this.applyImmunityLoss(5);
        alert("You must switch OFF both the Disco and Neon Lights to conserve enough power!");
      }
    });
  }

  // 2-3C: Balance the Power
  render_L2_T3_C() {
    this.triggerRobotGuidance("Finally, balance the remaining power distribution evenly across the Base, Shield, and Battery banks!");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #10B981;">⚖️ Task 3C: Balance Energy Distribution</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Adjust sliders so each sector receives 33% power!</p>
      </div>

      <div style="max-width: 480px; margin: 20px auto; display: flex; flex-direction: column; gap: 18px;">
        <div>
          <div style="display: flex; justify-content: space-between; font-weight: 800; color: white;">
            <span>Habitat Pod</span>
            <span id="pwr-val-1">33%</span>
          </div>
          <input type="range" min="10" max="60" value="33" class="custom-slider" id="pwr-sl-1">
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-weight: 800; color: white;">
            <span>Defensive Shields</span>
            <span id="pwr-val-2">33%</span>
          </div>
          <input type="range" min="10" max="60" value="33" class="custom-slider" id="pwr-sl-2">
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-weight: 800; color: white;">
            <span>Backup Reserve</span>
            <span id="pwr-val-3">34%</span>
          </div>
          <input type="range" min="10" max="60" value="34" class="custom-slider" id="pwr-sl-3">
        </div>

        <div style="text-align: center; margin-top: 10px;">
          <button id="btn-lock-grid" class="btn-primary-large" style="font-size: 1.15rem; padding: 12px 30px;">
            LOCK BALANCED GRID ⚡
          </button>
        </div>
      </div>
    `;

    const sl1 = document.getElementById('pwr-sl-1');
    const sl2 = document.getElementById('pwr-sl-2');
    const sl3 = document.getElementById('pwr-sl-3');

    [sl1, sl2, sl3].forEach((sl, idx) => {
      sl.addEventListener('input', (e) => {
        document.getElementById(`pwr-val-${idx + 1}`).textContent = `${e.target.value}%`;
      });
    });

    document.getElementById('btn-lock-grid').addEventListener('click', () => {
      const v1 = parseInt(sl1.value);
      const v2 = parseInt(sl2.value);
      const v3 = parseInt(sl3.value);

      if (Math.abs(v1 - 33) <= 5 && Math.abs(v2 - 33) <= 5 && Math.abs(v3 - 34) <= 5) {
        window.sounds.playSuccess();
        this.onSubtaskComplete("Level 2 Moon Survival Complete! The lunar base is completely safe, sustainable, and ready for departure.");
      } else {
        window.sounds.playError();
        this.applyImmunityLoss(5);
        alert("The grid is still unbalanced! Aim for around 33% on each sector.");
      }
    });
  }

  /* ========================================================================
     LEVEL 3: SURVIVE & RETURN TO EARTH
     ======================================================================== */

  // 3-1A: Detect the Storm
  render_L3_T1_A() {
    this.triggerRobotGuidance("Space radar warning! A coronal mass ejection radiation storm is approaching. Click the red flare pulse on the radar scope!");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #EF4444;">📡 Task 1A: Detect Approaching Radiation Storm</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Click the pulsing solar flare blip on the radar screen!</p>
      </div>

      <div style="width: 280px; height: 280px; border-radius: 50%; border: 3px solid #10B981; background: #07130F; margin: 20px auto; position: relative; overflow: hidden; box-shadow: 0 0 25px rgba(16, 185, 129, 0.4);">
        <!-- Sweeping Line -->
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; background: conic-gradient(from 0deg, rgba(16, 185, 129, 0.5) 0deg, transparent 60deg); animation: radar-sweep 2s linear infinite;"></div>

        <!-- Radar Rings -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 180px; height: 180px; border: 1px dashed rgba(16, 185, 129, 0.4); border-radius: 50%;"></div>
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90px; height: 90px; border: 1px dashed rgba(16, 185, 129, 0.4); border-radius: 50%;"></div>

        <!-- Pulsing Flare Blip -->
        <div id="radar-blip" style="position: absolute; top: 60px; right: 70px; width: 22px; height: 22px; background: #EF4444; border-radius: 50%; cursor: pointer; animation: pulse-danger 0.5s infinite alternate; box-shadow: 0 0 15px #EF4444;"></div>
      </div>

      <style>
        @keyframes radar-sweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;

    document.getElementById('radar-blip').addEventListener('click', () => {
      window.sounds.playAlarm();
      setTimeout(() => {
        this.onSubtaskComplete("Storm detected! Coronal radiation wave incoming in T-minus 10 minutes!");
      }, 600);
    });
  }

  // 3-1B: Find the Safe Zone
  render_L3_T1_B() {
    this.triggerRobotGuidance("Radiation will penetrate surface rooms! Select the safest bunker location with 3 meters of regolith shielding.");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #FDE047;">🛡️ Task 1B: Choose the Safest Bunker</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Select the chamber that provides maximum radiation protection.</p>
      </div>

      <div class="materials-grid">
        <div class="material-card" data-safe="false">
          <div style="font-size: 3rem;">🪟</div>
          <h4 style="color: white; margin-top: 8px;">Glass Observatory</h4>
          <p style="color: #C4B5FD;">Glass ceiling offers zero protection from gamma rays!</p>
        </div>

        <div class="material-card" data-safe="true">
          <div style="font-size: 3rem;">🧱🚪</div>
          <h4 style="color: white; margin-top: 8px;">Deep Regolith Bunker</h4>
          <p style="color: #10B981; font-weight: 700;">Sub-surface titanium vault with 3m lunar regolith barrier!</p>
        </div>

        <div class="material-card" data-safe="false">
          <div style="font-size: 3rem;">🚪</div>
          <h4 style="color: white; margin-top: 8px;">Outer Surface Airlock</h4>
          <p style="color: #C4B5FD;">Thin exterior walls will heat up during the storm.</p>
        </div>
      </div>
    `;

    const cards = this.dom.taskStageContent.querySelectorAll('.material-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const isSafe = card.dataset.safe === 'true';
        if (isSafe) {
          window.sounds.playSuccess();
          card.classList.add('correct');
          cards.forEach(c => c.style.pointerEvents = 'none');
          setTimeout(() => {
            this.onSubtaskComplete("Safe zone verified! The Deep Regolith Bunker blocks 99.9% of solar radiation.");
          }, 700);
        } else {
          window.sounds.playError();
          this.applyImmunityLoss(10);
          card.classList.add('wrong');
          setTimeout(() => card.classList.remove('wrong'), 400);
        }
      });
    });
  }

  // 3-1C: Reach the Shelter (Corridor run avoiding beams)
  render_L3_T1_C() {
    this.triggerRobotGuidance("Run down the base corridor to the shelter hatch! Click 'Sprint Forward' when radiation beams are inactive.");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #38BDF8;">🏃 Task 1C: Sprint to the Bunker Hatch</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Reach 100% distance before the storm peaks!</p>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center; gap: 20px; margin: 30px auto;">
        <div style="width: 100%; max-width: 500px; height: 35px; background: #0F172A; border: 2px solid #64748B; border-radius: 20px; overflow: hidden; position: relative;">
          <div id="sprint-bar" style="width: 10%; height: 100%; background: linear-gradient(90deg, #38BDF8, #10B981); transition: width 0.2s;"></div>
        </div>

        <div style="font-size: 1.6rem; font-weight: 900; color: #FFFFFF;">
          Distance: <span id="sprint-dist">10</span>%
        </div>

        <button id="btn-sprint" class="btn-primary-large" style="font-size: 1.3rem; padding: 16px 38px;">
          🏃 SPRINT TO SHELTER ➔
        </button>
      </div>
    `;

    let dist = 10;
    const btn = document.getElementById('btn-sprint');
    const bar = document.getElementById('sprint-bar');
    const distText = document.getElementById('sprint-dist');

    btn.addEventListener('click', () => {
      window.sounds.playPop();
      dist += 18;
      bar.style.width = `${Math.min(100, dist)}%`;
      distText.textContent = Math.min(100, dist);

      if (dist >= 100) {
        btn.disabled = true;
        window.sounds.playSuccess();
        setTimeout(() => {
          this.onSubtaskComplete("Astronaut safely inside the heavy bunker door! Sealed and protected from the storm.");
        }, 700);
      }
    });
  }

  /* ========================================================================
     LEVEL 3 - TASK 2: MANAGE FOOD SUPPLIES
     ======================================================================== */

  // 3-2A: Count the Food
  render_L3_T2_A() {
    this.triggerRobotGuidance("Math check! 4 astronauts on a 3-day voyage back to Earth need 2 meals per day. How many total meal packets are needed?");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #FDE047;">🧮 Task 2A: Calculate Food Provisions</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">4 astronauts × 3 days × 2 meals/day = ?</p>
      </div>

      <div style="display: flex; justify-content: center; gap: 20px; margin: 35px auto; flex-wrap: wrap;">
        <button class="btn-primary-large count-btn" data-val="18" style="font-size: 1.4rem; padding: 14px 30px;">18 Meals</button>
        <button class="btn-primary-large count-btn" data-val="24" style="font-size: 1.4rem; padding: 14px 30px;">24 Meals</button>
        <button class="btn-primary-large count-btn" data-val="32" style="font-size: 1.4rem; padding: 14px 30px;">32 Meals</button>
      </div>
    `;

    const btns = this.dom.taskStageContent.querySelectorAll('.count-btn');
    btns.forEach(b => {
      b.addEventListener('click', () => {
        if (b.dataset.val === '24') {
          window.sounds.playSuccess();
          b.style.borderColor = '#10B981';
          b.style.background = '#10B981';
          setTimeout(() => {
            this.onSubtaskComplete("Exact math! 24 meal rations will feed the entire crew comfortably.");
          }, 600);
        } else {
          window.sounds.playError();
          this.applyImmunityLoss(5);
          b.classList.add('wrong');
          setTimeout(() => b.classList.remove('wrong'), 400);
        }
      });
    });
  }

  // 3-2B: Pack the Supplies
  render_L3_T2_B() {
    this.triggerRobotGuidance("Pack the spacecraft cargo locker! Click all 4 ration packs to load them into the flight module.");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #38BDF8;">📦 Task 2B: Pack Cargo Ration Locker</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Click each ration item to load it into the ship.</p>
      </div>

      <div style="display: flex; justify-content: center; gap: 18px; margin: 30px auto; flex-wrap: wrap;">
        <div class="ration-pack-item" style="background: rgba(13, 27, 62, 0.9); border: 2px solid #38BDF8; padding: 16px 20px; border-radius: 16px; text-align: center; cursor: pointer;">
          <div style="font-size: 2.5rem;">🥪</div>
          <div style="color: white; font-weight: 700;">Protein Cubes</div>
        </div>

        <div class="ration-pack-item" style="background: rgba(13, 27, 62, 0.9); border: 2px solid #38BDF8; padding: 16px 20px; border-radius: 16px; text-align: center; cursor: pointer;">
          <div style="font-size: 2.5rem;">💧</div>
          <div style="color: white; font-weight: 700;">Purified Water</div>
        </div>

        <div class="ration-pack-item" style="background: rgba(13, 27, 62, 0.9); border: 2px solid #38BDF8; padding: 16px 20px; border-radius: 16px; text-align: center; cursor: pointer;">
          <div style="font-size: 2.5rem;">🍨</div>
          <div style="color: white; font-weight: 700;">Space Ice Cream</div>
        </div>

        <div class="ration-pack-item" style="background: rgba(13, 27, 62, 0.9); border: 2px solid #38BDF8; padding: 16px 20px; border-radius: 16px; text-align: center; cursor: pointer;">
          <div style="font-size: 2.5rem;">🍎</div>
          <div style="color: white; font-weight: 700;">Dried Fruit</div>
        </div>
      </div>
    `;

    let packed = 0;
    const items = this.dom.taskStageContent.querySelectorAll('.ration-pack-item');
    items.forEach(it => {
      it.addEventListener('click', () => {
        window.sounds.playPop();
        it.style.borderColor = '#10B981';
        it.style.background = 'rgba(16, 185, 129, 0.3)';
        it.innerHTML = `<div style="font-size: 2.5rem;">✓</div><div style="color: #10B981; font-weight: 800;">LOADED</div>`;
        it.style.pointerEvents = 'none';
        packed++;

        if (packed >= 4) {
          setTimeout(() => {
            this.onSubtaskComplete("All return rations securely packed into cargo hold!");
          }, 600);
        }
      });
    });
  }

  // 3-2C: Ration the Food
  render_L3_T2_C() {
    this.triggerRobotGuidance("Distribute equal food portions across the 3 crew flight trays!");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #10B981;">🍱 Task 2C: Distribute Daily Rations</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Click 'Distribute Rations' to assign equal nutrients to each crew station.</p>
      </div>

      <div style="display: flex; justify-content: center; gap: 25px; margin: 30px auto; flex-wrap: wrap;">
        <div style="background: #1E293B; border: 2px solid #64748B; border-radius: 18px; padding: 20px; text-align: center; width: 140px;">
          <div style="font-size: 2.5rem;">🧑‍🚀</div>
          <div style="font-weight: 800; color: white;">Station Alpha</div>
          <div id="tray-1" style="color: #38BDF8; font-weight: 700; margin-top: 4px;">Pending</div>
        </div>

        <div style="background: #1E293B; border: 2px solid #64748B; border-radius: 18px; padding: 20px; text-align: center; width: 140px;">
          <div style="font-size: 2.5rem;">🧑‍🚀</div>
          <div style="font-weight: 800; color: white;">Station Beta</div>
          <div id="tray-2" style="color: #38BDF8; font-weight: 700; margin-top: 4px;">Pending</div>
        </div>

        <div style="background: #1E293B; border: 2px solid #64748B; border-radius: 18px; padding: 20px; text-align: center; width: 140px;">
          <div style="font-size: 2.5rem;">🧑‍🚀</div>
          <div style="font-weight: 800; color: white;">Station Gamma</div>
          <div id="tray-3" style="color: #38BDF8; font-weight: 700; margin-top: 4px;">Pending</div>
        </div>
      </div>

      <div style="text-align: center;">
        <button id="btn-ration-all" class="btn-primary-large" style="font-size: 1.2rem; padding: 14px 32px;">
          ⚖️ DISTRIBUTE EQUAL RATIONS
        </button>
      </div>
    `;

    document.getElementById('btn-ration-all').addEventListener('click', () => {
      window.sounds.playSuccess();
      for (let i = 1; i <= 3; i++) {
        const tray = document.getElementById(`tray-${i}`);
        tray.textContent = '2 Meals ✓';
        tray.style.color = '#10B981';
      }
      setTimeout(() => {
        this.onSubtaskComplete("All crew trays balanced! Our return journey supplies are completely dialed in.");
      }, 700);
    });
  }

  /* ========================================================================
     LEVEL 3 - TASK 3: LAUNCH BACK TO EARTH
     ======================================================================== */

  // 3-3A: Check the Systems
  render_L3_T3_A() {
    this.triggerRobotGuidance("Final pre-flight countdown! Click all 4 cockpit systems to verify green telemetry.");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #FDE047;">🚀 Task 3A: Cockpit Pre-Flight Checklist</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Verify all 4 spacecraft systems show GREEN status.</p>
      </div>

      <div class="materials-grid">
        <div class="material-card chk-item" style="cursor: pointer;">
          <div style="font-size: 2.5rem;">🧭</div>
          <h4 style="color: white; margin-top: 8px;">Navigation Computer</h4>
          <span class="chk-status" style="color: #EF4444; font-weight: 800;">UNCHECKED</span>
        </div>

        <div class="material-card chk-item" style="cursor: pointer;">
          <div style="font-size: 2.5rem;">🫁</div>
          <h4 style="color: white; margin-top: 8px;">Life Support Dome</h4>
          <span class="chk-status" style="color: #EF4444; font-weight: 800;">UNCHECKED</span>
        </div>

        <div class="material-card chk-item" style="cursor: pointer;">
          <div style="font-size: 2.5rem;">🛡️</div>
          <h4 style="color: white; margin-top: 8px;">Heat Shield Sensors</h4>
          <span class="chk-status" style="color: #EF4444; font-weight: 800;">UNCHECKED</span>
        </div>

        <div class="material-card chk-item" style="cursor: pointer;">
          <div style="font-size: 2.5rem;">🔥</div>
          <h4 style="color: white; margin-top: 8px;">Attitude Thrusters</h4>
          <span class="chk-status" style="color: #EF4444; font-weight: 800;">UNCHECKED</span>
        </div>
      </div>
    `;

    let checked = 0;
    const items = this.dom.taskStageContent.querySelectorAll('.chk-item');
    items.forEach(it => {
      it.addEventListener('click', () => {
        window.sounds.playClick();
        it.classList.add('correct');
        const st = it.querySelector('.chk-status');
        st.textContent = 'VERIFIED GREEN ✓';
        st.style.color = '#10B981';
        it.style.pointerEvents = 'none';
        checked++;

        if (checked >= 4) {
          setTimeout(() => {
            this.onSubtaskComplete("All pre-flight diagnostic systems verified 100% operational!");
          }, 600);
        }
      });
    });
  }

  // 3-3B: Load the Supplies & Seal Hatch
  render_L3_T3_B() {
    this.triggerRobotGuidance("Close and seal the spacecraft airlock pressure hatch! Rotate the hatch wheel valve.");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.5rem; color: #38BDF8;">🔒 Task 3B: Seal Cargo Airlock Hatch</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Click the wheel valve to turn and lock the pressure seals!</p>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center; gap: 20px; margin: 30px auto;">
        <div id="hatch-valve-wheel" style="width: 160px; height: 160px; border-radius: 50%; border: 10px solid #64748B; background: #1E293B; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow: 0 0 25px rgba(0, 0, 0, 0.6);">
          <div style="width: 100%; height: 8px; background: #FDE047;"></div>
        </div>

        <div id="hatch-status-text" style="font-size: 1.2rem; font-weight: 800; color: #EF4444;">
          HATCH: UNLOCKED
        </div>
      </div>
    `;

    const wheel = document.getElementById('hatch-valve-wheel');
    const statusText = document.getElementById('hatch-status-text');
    let rotated = false;

    wheel.addEventListener('click', () => {
      if (rotated) return;
      rotated = true;
      window.sounds.playZap();
      wheel.style.transform = 'rotate(360deg)';
      wheel.style.borderColor = '#10B981';
      statusText.textContent = 'AIRTIGHT SEAL SECURED! ✓';
      statusText.style.color = '#10B981';

      setTimeout(() => {
        this.onSubtaskComplete("Spacecraft cabin pressure locked. All cargo and supplies secured for reentry.");
      }, 800);
    });
  }

  // 3-3C: Launch the Rocket back to Earth (Grand Finale Launch)
  render_L3_T3_C() {
    this.triggerRobotGuidance("THIS IS IT! Complete the ignition sequence and press the BIG RED LAUNCH BUTTON to return home to Earth!");

    this.dom.taskStageContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="font-size: 1.7rem; color: #FDE047;">🚀 Task 3C: Final Earth Return Ignition</h3>
        <p style="color: #DDD6FE; font-size: 0.95rem;">Prime Fuel ➔ Arm Engines ➔ HIT THE RED BUTTON!</p>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center; gap: 20px; margin: 25px auto;">
        <div style="display: flex; gap: 20px;">
          <button id="btn-seq-fuel" class="btn-secondary" style="padding: 12px 20px;">1. Prime Fuel Pump</button>
          <button id="btn-seq-arm" class="btn-secondary" style="padding: 12px 20px;" disabled>2. Arm Engines</button>
        </div>

        <button id="btn-final-smash-launch" class="btn-primary-large" style="background: linear-gradient(135deg, #DC2626, #EF4444); border-color: #FCA5A5; font-size: 1.7rem; padding: 22px 55px; opacity: 0.5; cursor: not-allowed;" disabled>
          🔴 SMASH TO LAUNCH! 🚀
        </button>
      </div>
    `;

    const btnFuel = document.getElementById('btn-seq-fuel');
    const btnArm = document.getElementById('btn-seq-arm');
    const btnLaunch = document.getElementById('btn-final-smash-launch');

    btnFuel.addEventListener('click', () => {
      window.sounds.playClick();
      btnFuel.style.background = '#10B981';
      btnFuel.style.color = '#FFFFFF';
      btnFuel.textContent = '1. Fuel Primed ✓';
      btnFuel.disabled = true;
      btnArm.disabled = false;
      btnArm.style.borderColor = '#FDE047';
    });

    btnArm.addEventListener('click', () => {
      window.sounds.playClick();
      btnArm.style.background = '#10B981';
      btnArm.style.color = '#FFFFFF';
      btnArm.textContent = '2. Engines Armed ✓';
      btnArm.disabled = true;
      btnLaunch.disabled = false;
      btnLaunch.style.opacity = '1';
      btnLaunch.style.cursor = 'pointer';
      btnLaunch.style.boxShadow = '0 0 35px #EF4444';
    });

    btnLaunch.addEventListener('click', () => {
      window.sounds.playLaunch();
      btnLaunch.disabled = true;
      btnLaunch.textContent = 'BLAST OFF TO EARTH! 🌍🚀';

      setTimeout(() => {
        this.onSubtaskComplete("MISSION COMPLETE 🎉 Return to Earth trajectory locked in safely!");
      }, 1000);
    });
  }
}

// Start Game on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.game = new GameEngine();
  window.game.init();
});
