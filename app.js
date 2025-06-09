// 7-Day Periodic Table Challenge - Main Application Logic

class PeriodicTableApp {
    constructor() {
        this.currentDay = 1;
        this.currentScreen = 'welcome';
        this.currentQuiz = null;
        this.userProgress = {};
        this.settings = {
            theme: 'light',
            soundEnabled: true,
            volume: 50,
            animationsEnabled: true,
            difficulty: 'medium',
            hintsEnabled: true
        };
        
        this.screens = {
            welcome: document.getElementById('welcome-screen'),
            dayOverview: document.getElementById('day-overview-screen'),
            periodicTable: document.getElementById('periodic-table-screen'),
            quiz: document.getElementById('quiz-screen'),
            results: document.getElementById('results-screen'),
            finalChallenge: document.getElementById('final-challenge-screen'),
            completion: document.getElementById('completion-screen')
        };
        
        this.modals = {
            element: document.getElementById('element-modal'),
            settings: document.getElementById('settings-modal'),
            help: document.getElementById('help-modal')
        };
        
        this.managers = {};
        
        this.init();
    }
    
    async init() {
        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize managers
            await this.initializeManagers();
            
            // Load user progress
            await this.loadUserProgress();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize UI
            this.initializeUI();
            
            // Hide loading screen and show app
            await this.hideLoadingScreen();
            
            // Determine initial screen
            this.determineInitialScreen();
            
            console.log('Periodic Table Challenge initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }
    
    async initializeManagers() {
        // Initialize storage manager
        this.managers.storage = new StorageManager();
        
        // Initialize theme manager
        this.managers.theme = new ThemeManager();
        
        // Initialize audio manager
        this.managers.audio = new AudioManager();
        
        // Initialize animation manager
        this.managers.animation = new AnimationManager();
        
        // Initialize periodic table
        this.managers.periodicTable = new PeriodicTable();
        
        // Initialize quiz manager
        this.managers.quiz = new QuizManager();
        
        // Wait for all managers to be ready
        await Promise.all([
            this.managers.storage.init(),
            this.managers.theme.init(),
            this.managers.audio.init(),
            this.managers.animation.init(),
            this.managers.periodicTable.init(),
            this.managers.quiz.init()
        ]);
    }
    
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const progressFill = document.getElementById('loading-progress-fill');
        const loadingText = document.getElementById('loading-text');
        
        const steps = [
            'Initializing elements...',
            'Loading periodic table...',
            'Preparing quizzes...',
            'Setting up audio...',
            'Configuring themes...',
            'Ready to learn!'
        ];
        
        let currentStep = 0;
        const updateProgress = () => {
            if (currentStep < steps.length) {
                const progress = ((currentStep + 1) / steps.length) * 100;
                progressFill.style.width = `${progress}%`;
                loadingText.textContent = steps[currentStep];
                currentStep++;
                setTimeout(updateProgress, 300);
            }
        };
        
        updateProgress();
    }
    
    async hideLoadingScreen() {
        return new Promise(resolve => {
            const loadingScreen = document.getElementById('loading-screen');
            const appContainer = document.getElementById('app-container');
            
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                appContainer.style.display = 'flex';
                
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    resolve();
                }, 350);
            }, 1000);
        });
    }
    
    async loadUserProgress() {
        try {
            const savedProgress = await this.managers.storage.getProgress();
            const savedSettings = await this.managers.storage.getSettings();
            
            if (savedProgress) {
                this.userProgress = savedProgress;
                this.currentDay = savedProgress.currentDay || 1;
            }
            
            if (savedSettings) {
                this.settings = { ...this.settings, ...savedSettings };
            }
            
            // Apply settings
            this.applySettings();
        } catch (error) {
            console.error('Failed to load user progress:', error);
        }
    }
    
    async saveUserProgress() {
        try {
            await this.managers.storage.saveProgress(this.userProgress);
            await this.managers.storage.saveSettings(this.settings);
        } catch (error) {
            console.error('Failed to save user progress:', error);
        }
    }
    
    applySettings() {
        // Apply theme
        this.managers.theme.setTheme(this.settings.theme);
        
        // Apply sound settings
        this.managers.audio.setEnabled(this.settings.soundEnabled);
        this.managers.audio.setVolume(this.settings.volume);
        
        // Apply animation settings
        this.managers.animation.setEnabled(this.settings.animationsEnabled);
        
        // Update UI controls
        this.updateSettingsUI();
    }
    
    updateSettingsUI() {
        // Update theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        document.body.className = `theme-${this.settings.theme}`;
        
        // Update sound toggle
        const soundToggle = document.getElementById('sound-toggle');
        soundToggle.setAttribute('data-sound', this.settings.soundEnabled);
        
        // Update settings modal controls
        const themeSelect = document.getElementById('theme-select');
        const soundEffectsToggle = document.getElementById('sound-effects-toggle');
        const volumeSlider = document.getElementById('volume-slider');
        const animationToggle = document.getElementById('animation-toggle');
        const difficultySelect = document.getElementById('difficulty-select');
        const hintsToggle = document.getElementById('hints-toggle');
        
        if (themeSelect) themeSelect.value = this.settings.theme;
        if (soundEffectsToggle) soundEffectsToggle.checked = this.settings.soundEnabled;
        if (volumeSlider) volumeSlider.value = this.settings.volume;
        if (animationToggle) animationToggle.checked = this.settings.animationsEnabled;
        if (difficultySelect) difficultySelect.value = this.settings.difficulty;
        if (hintsToggle) hintsToggle.checked = this.settings.hintsEnabled;
    }
    
    setupEventListeners() {
        // Header controls
        this.setupHeaderControls();
        
        // Welcome screen
        this.setupWelcomeScreen();
        
        // Day overview screen
        this.setupDayOverviewScreen();
        
        // Periodic table screen
        this.setupPeriodicTableScreen();
        
        // Quiz screen
        this.setupQuizScreen();
        
        // Results screen
        this.setupResultsScreen();
        
        // Final challenge screen
        this.setupFinalChallengeScreen();
        
        // Completion screen
        this.setupCompletionScreen();
        
        // Modals
        this.setupModals();
        
        // Floating action button
        this.setupFloatingActionButton();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Window events
        this.setupWindowEvents();
    }
    
    setupHeaderControls() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Sound toggle
        const soundToggle = document.getElementById('sound-toggle');
        soundToggle.addEventListener('click', () => {
            this.toggleSound();
        });
        
        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        settingsBtn.addEventListener('click', () => {
            this.openModal('settings');
        });
        
        // Help button
        const helpBtn = document.getElementById('help-btn');
        helpBtn.addEventListener('click', () => {
            this.openModal('help');
        });
        
        // Day indicators
        const dayIndicators = document.querySelectorAll('.day-indicator');
        dayIndicators.forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                const day = parseInt(e.target.dataset.day);
                if (!e.target.classList.contains('locked')) {
                    this.goToDay(day);
                }
            });
        });
    }
    
    setupWelcomeScreen() {
        const startBtn = document.getElementById('start-challenge-btn');
        const continueBtn = document.getElementById('continue-challenge-btn');
        
        startBtn.addEventListener('click', () => {
            this.startNewChallenge();
        });
        
        continueBtn.addEventListener('click', () => {
            this.continueChallenge();
        });
    }
    
    setupDayOverviewScreen() {
        const modeCards = document.querySelectorAll('.mode-card');
        modeCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.selectLearningMode(mode);
            });
        });
    }
    
    setupPeriodicTableScreen() {
        const quizModeBtn = document.getElementById('quiz-mode-btn');
        const nextDayBtn = document.getElementById('next-day-btn');
        
        quizModeBtn.addEventListener('click', () => {
            this.startDailyQuiz();
        });
        
        nextDayBtn.addEventListener('click', () => {
            this.completeDay();
        });
        
        // View controls
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.changeTableView(view);
            });
        });
        
        // Filter control
        const filterSelect = document.getElementById('element-filter');
        filterSelect.addEventListener('change', (e) => {
            this.filterElements(e.target.value);
        });
    }
    
    setupQuizScreen() {
        const submitBtn = document.getElementById('quiz-submit-btn');
        const nextBtn = document.getElementById('quiz-next-btn');
        const hintBtn = document.getElementById('quiz-hint-btn');
        
        submitBtn.addEventListener('click', () => {
            this.submitQuizAnswer();
        });
        
        nextBtn.addEventListener('click', () => {
            this.nextQuizQuestion();
        });
        
        hintBtn.addEventListener('click', () => {
            this.showQuizHint();
        });
    }
    
    setupResultsScreen() {
        const reviewBtn = document.getElementById('review-answers-btn');
        const continueBtn = document.getElementById('continue-learning-btn');
        
        reviewBtn.addEventListener('click', () => {
            this.reviewQuizAnswers();
        });
        
        continueBtn.addEventListener('click', () => {
            this.continueAfterQuiz();
        });
    }
    
    setupFinalChallengeScreen() {
        const startFinalBtn = document.getElementById('start-final-challenge-btn');
        
        startFinalBtn.addEventListener('click', () => {
            this.startFinalChallenge();
        });
    }
    
    setupCompletionScreen() {
        const downloadCertBtn = document.getElementById('download-certificate-btn');
        const restartBtn = document.getElementById('restart-challenge-btn');
        
        downloadCertBtn.addEventListener('click', () => {
            this.downloadCertificate();
        });
        
        restartBtn.addEventListener('click', () => {
            this.restartChallenge();
        });
    }
    
    setupModals() {
        // Setup modal close functionality
        Object.keys(this.modals).forEach(modalKey => {
            const modal = this.modals[modalKey];
            const backdrop = modal.querySelector('.modal-backdrop');
            const closeBtn = modal.querySelector('.modal-close');
            
            backdrop.addEventListener('click', () => {
                this.closeModal(modalKey);
            });
            
            closeBtn.addEventListener('click', () => {
                this.closeModal(modalKey);
            });
        });
        
        // Element modal tabs
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchElementTab(e.target.dataset.tab);
            });
        });
        
        // Settings modal controls
        this.setupSettingsModal();
    }
    
    setupSettingsModal() {
        const themeSelect = document.getElementById('theme-select');
        const soundToggle = document.getElementById('sound-effects-toggle');
        const volumeSlider = document.getElementById('volume-slider');
        const animationToggle = document.getElementById('animation-toggle');
        const difficultySelect = document.getElementById('difficulty-select');
        const hintsToggle = document.getElementById('hints-toggle');
        const exportBtn = document.getElementById('export-progress-btn');
        const importBtn = document.getElementById('import-progress-btn');
        const resetBtn = document.getElementById('reset-progress-btn');
        
        themeSelect.addEventListener('change', (e) => {
            this.changeSetting('theme', e.target.value);
        });
        
        soundToggle.addEventListener('change', (e) => {
            this.changeSetting('soundEnabled', e.target.checked);
        });
        
        volumeSlider.addEventListener('input', (e) => {
            this.changeSetting('volume', parseInt(e.target.value));
        });
        
        animationToggle.addEventListener('change', (e) => {
            this.changeSetting('animationsEnabled', e.target.checked);
        });
        
        difficultySelect.addEventListener('change', (e) => {
            this.changeSetting('difficulty', e.target.value);
        });
        
        hintsToggle.addEventListener('change', (e) => {
            this.changeSetting('hintsEnabled', e.target.checked);
        });
        
        exportBtn.addEventListener('click', () => {
            this.exportProgress();
        });
        
        importBtn.addEventListener('click', () => {
            this.importProgress();
        });
        
        resetBtn.addEventListener('click', () => {
            this.resetProgress();
        });
    }
    
    setupFloatingActionButton() {
        const fab = document.getElementById('floating-action-btn');
        const fabMenu = document.getElementById('fab-menu');
        
        fab.addEventListener('click', () => {
            this.toggleFabMenu();
        });
        
        const fabMenuItems = document.querySelectorAll('.fab-menu-item');
        fabMenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleFabAction(action);
            });
        });
        
        // Close FAB menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!fab.contains(e.target) && !fabMenu.contains(e.target)) {
                this.closeFabMenu();
            }
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            switch (e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    if (this.currentScreen === 'quiz') {
                        this.toggleQuizPause();
                    }
                    break;
                case 'enter':
                    if (this.currentScreen === 'quiz') {
                        this.submitQuizAnswer();
                    }
                    break;
                case 'h':
                    if (this.currentScreen === 'quiz') {
                        this.showQuizHint();
                    }
                    break;
                case 't':
                    this.toggleTheme();
                    break;
                case '?':
                    this.openModal('help');
                    break;
                case 'escape':
                    this.closeAllModals();
                    this.closeFabMenu();
                    break;
            }
        });
    }
    
    setupWindowEvents() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handlePageHidden();
            } else {
                this.handlePageVisible();
            }
        });
        
        // Handle before unload
        window.addEventListener('beforeunload', () => {
            this.saveUserProgress();
        });
    }
    
    initializeUI() {
        // Update progress indicator
        this.updateProgressIndicator();
        
        // Initialize periodic table
        this.managers.periodicTable.render();
        
        // Update day overview
        this.updateDayOverview();
        
        // Check if user has existing progress
        if (this.userProgress.currentDay && this.userProgress.currentDay > 1) {
            document.getElementById('continue-challenge-btn').style.display = 'inline-flex';
        }
    }
    
    determineInitialScreen() {
        if (this.userProgress.completed) {
            this.showScreen('completion');
        } else if (this.userProgress.currentDay && this.userProgress.currentDay > 1) {
            this.showScreen('welcome');
        } else {
            this.showScreen('welcome');
        }
    }
    
    // Screen Management
    showScreen(screenName, direction = 'right') {
        if (this.currentScreen === screenName) return;
        
        const currentScreenEl = this.screens[this.currentScreen];
        const newScreenEl = this.screens[screenName];
        
        if (!newScreenEl) {
            console.error(`Screen '${screenName}' not found`);
            return;
        }
        
        // Play transition sound
        this.managers.audio.playSound('transition');
        
        // Animate screen transition
        this.managers.animation.screenTransition(currentScreenEl, newScreenEl, direction);
        
        this.currentScreen = screenName;
        
        // Update URL hash
        window.location.hash = screenName;
        
        // Screen-specific initialization
        this.onScreenShow(screenName);
    }
    
    onScreenShow(screenName) {
        switch (screenName) {
            case 'dayOverview':
                this.updateDayOverview();
                break;
            case 'periodicTable':
                this.managers.periodicTable.updateForCurrentDay(this.currentDay);
                break;
            case 'quiz':
                this.initializeQuiz();
                break;
            case 'results':
                this.showQuizResults();
                break;
            case 'finalChallenge':
                this.initializeFinalChallenge();
                break;
            case 'completion':
                this.showCompletionSummary();
                break;
        }
    }
    
    // Theme Management
    toggleTheme() {
        const themes = ['light', 'dark'];
        const currentIndex = themes.indexOf(this.settings.theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        this.changeSetting('theme', nextTheme);
    }
    
    // Sound Management
    toggleSound() {
        this.changeSetting('soundEnabled', !this.settings.soundEnabled);
    }
    
    // Settings Management
    changeSetting(key, value) {
        this.settings[key] = value;
        this.applySettings();
        this.saveUserProgress();
        
        // Show feedback
        this.showToast(`Setting updated: ${key}`, 'success');
    }
    
    // Modal Management
    openModal(modalName) {
        const modal = this.modals[modalName];
        if (!modal) return;
        
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus management
        const firstFocusable = modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        // Play sound
        this.managers.audio.playSound('modal-open');
    }
    
    closeModal(modalName) {
        const modal = this.modals[modalName];
        if (!modal) return;
        
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        
        // Play sound
        this.managers.audio.playSound('modal-close');
    }
    
    closeAllModals() {
        Object.keys(this.modals).forEach(modalName => {
            this.closeModal(modalName);
        });
    }
    
    // Challenge Management
    startNewChallenge() {
        this.userProgress = {
            currentDay: 1,
            completedDays: [],
            learnedElements: [],
            quizScores: {},
            totalScore: 0,
            startDate: new Date().toISOString()
        };
        
        this.currentDay = 1;
        this.saveUserProgress();
        this.updateProgressIndicator();
        this.showScreen('dayOverview');
        
        this.showToast('New challenge started! Good luck!', 'success');
    }
    
    continueChallenge() {
        this.showScreen('dayOverview');
        this.showToast('Welcome back! Continue your learning journey.', 'info');
    }
    
    goToDay(day) {
        if (day > this.userProgress.currentDay) {
            this.showToast('This day is not yet unlocked!', 'warning');
            return;
        }
        
        this.currentDay = day;
        this.updateDayOverview();
        this.showScreen('dayOverview');
    }
    
    selectLearningMode(mode) {
        this.userProgress.selectedMode = mode;
        this.saveUserProgress();
        this.showScreen('periodicTable');
        
        this.showToast(`Learning mode: ${mode}`, 'info');
    }
    
    startDailyQuiz() {
        this.showScreen('quiz');
    }
    
    completeDay() {
        if (!this.userProgress.completedDays.includes(this.currentDay)) {
            this.userProgress.completedDays.push(this.currentDay);
        }
        
        if (this.currentDay < 7) {
            this.userProgress.currentDay = this.currentDay + 1;
            this.currentDay = this.userProgress.currentDay;
            this.updateProgressIndicator();
            this.showScreen('dayOverview');
            this.showToast(`Day ${this.currentDay - 1} completed! Day ${this.currentDay} unlocked!`, 'success');
        } else {
            this.userProgress.completed = true;
            this.showScreen('completion');
            this.showToast('Congratulations! You completed the 7-Day Challenge!', 'success');
        }
        
        this.saveUserProgress();
    }
    
    // Quiz Management
    initializeQuiz() {
        const dayElements = this.getDayElements(this.currentDay);
        this.managers.quiz.startQuiz(dayElements, this.settings.difficulty);
    }
    
    submitQuizAnswer() {
        this.managers.quiz.submitAnswer();
    }
    
    nextQuizQuestion() {
        this.managers.quiz.nextQuestion();
    }
    
    showQuizHint() {
        if (this.settings.hintsEnabled) {
            this.managers.quiz.showHint();
        } else {
            this.showToast('Hints are disabled in settings', 'info');
        }
    }
    
    showQuizResults() {
        const results = this.managers.quiz.getResults();
        this.displayResults(results);
        
        // Save quiz score
        this.userProgress.quizScores[this.currentDay] = results.score;
        this.saveUserProgress();
    }
    
    reviewQuizAnswers() {
        this.managers.quiz.showReview();
    }
    
    continueAfterQuiz() {
        this.showScreen('periodicTable');
    }
    
    // Final Challenge
    startFinalChallenge() {
        this.showScreen('quiz');
        this.managers.quiz.startFinalChallenge();
    }
    
    initializeFinalChallenge() {
        // Update final challenge UI
        this.updateFinalChallengeStats();
    }
    
    // Completion
    showCompletionSummary() {
        this.updateCompletionStats();
        this.managers.animation.celebrationEffect();
    }
    
    downloadCertificate() {
        this.generateCertificate();
    }
    
    restartChallenge() {
        if (confirm('Are you sure you want to restart the challenge? All progress will be lost.')) {
            this.resetProgress();
            this.startNewChallenge();
        }
    }
    
    // Utility Methods
    updateProgressIndicator() {
        const progressFill = document.getElementById('main-progress-fill');
        const currentDayNumber = document.getElementById('current-day-number');
        const dayIndicators = document.querySelectorAll('.day-indicator');
        
        const progress = (this.currentDay / 7) * 100;
        progressFill.style.width = `${progress}%`;
        currentDayNumber.textContent = this.currentDay;
        
        dayIndicators.forEach((indicator, index) => {
            const day = index + 1;
            indicator.classList.remove('active', 'completed', 'locked');
            
            if (day < this.currentDay) {
                indicator.classList.add('completed');
            } else if (day === this.currentDay) {
                indicator.classList.add('active');
            } else {
                indicator.classList.add('locked');
            }
        });
    }
    
    updateDayOverview() {
        const dayNumber = document.getElementById('day-number');
        const dayTheme = document.getElementById('day-theme');
        const dayDescription = document.getElementById('day-description');
        const elementsToLearn = document.getElementById('elements-to-learn');
        const quizQuestions = document.getElementById('quiz-questions');
        
        const dayData = DAILY_SCHEDULE[this.currentDay];
        
        if (dayData) {
            dayNumber.textContent = this.currentDay;
            dayTheme.textContent = dayData.title;
            dayDescription.textContent = dayData.description;
            
            if (Array.isArray(dayData.elements)) {
                elementsToLearn.textContent = dayData.elements.length;
            } else {
                elementsToLearn.textContent = '118';
            }
            
            quizQuestions.textContent = this.currentDay === 7 ? '50' : '15';
        }
    }
    
    getDayElements(day) {
        const dayData = DAILY_SCHEDULE[day];
        if (!dayData) return [];
        
        if (dayData.elements === 'all') {
            return Object.values(ELEMENTS_DATA);
        }
        
        return dayData.elements.map(atomicNumber => ELEMENTS_DATA[atomicNumber]).filter(Boolean);
    }
    
    changeTableView(view) {
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        this.managers.periodicTable.setView(view);
    }
    
    filterElements(filter) {
        this.managers.periodicTable.setFilter(filter);
    }
    
    switchElementTab(tabName) {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');
        
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        tabPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-tab`);
        });
    }
    
    // FAB Menu
    toggleFabMenu() {
        const fabMenu = document.getElementById('fab-menu');
        const isVisible = fabMenu.style.display !== 'none';
        
        if (isVisible) {
            this.closeFabMenu();
        } else {
            this.openFabMenu();
        }
    }
    
    openFabMenu() {
        const fabMenu = document.getElementById('fab-menu');
        fabMenu.style.display = 'flex';
        this.managers.audio.playSound('menu-open');
    }
    
    closeFabMenu() {
        const fabMenu = document.getElementById('fab-menu');
        fabMenu.style.display = 'none';
    }
    
    handleFabAction(action) {
        this.closeFabMenu();
        
        switch (action) {
            case 'random-element':
                this.showRandomElement();
                break;
            case 'quick-quiz':
                this.startQuickQuiz();
                break;
            case 'search-element':
                this.openElementSearch();
                break;
        }
    }
    
    showRandomElement() {
        const elements = Object.values(ELEMENTS_DATA);
        const randomElement = elements[Math.floor(Math.random() * elements.length)];
        this.managers.periodicTable.showElementDetail(randomElement);
    }
    
    startQuickQuiz() {
        // Start a quick 5-question quiz
        this.managers.quiz.startQuickQuiz();
        this.showScreen('quiz');
    }
    
    openElementSearch() {
        // Implement element search functionality
        this.showToast('Element search coming soon!', 'info');
    }
    
    // Toast Notifications
    showToast(message, type = 'info', duration = 3000) {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" aria-label="Close notification">×</button>
        `;
        
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(toast);
        });
        
        toastContainer.appendChild(toast);
        
        // Auto remove after duration
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
        
        // Play sound
        this.managers.audio.playSound(`toast-${type}`);
    }
    
    removeToast(toast) {
        if (toast && toast.parentNode) {
            toast.style.animation = 'toastSlideOut 0.3s ease-out forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }
    }
    
    showError(message) {
        this.showToast(message, 'error', 5000);
    }
    
    // Data Management
    exportProgress() {
        const data = {
            progress: this.userProgress,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `periodic-table-progress-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Progress exported successfully!', 'success');
    }
    
    importProgress() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (data.progress && data.settings) {
                        this.userProgress = data.progress;
                        this.settings = data.settings;
                        this.currentDay = this.userProgress.currentDay || 1;
                        
                        this.applySettings();
                        this.updateProgressIndicator();
                        this.saveUserProgress();
                        
                        this.showToast('Progress imported successfully!', 'success');
                        this.closeModal('settings');
                    } else {
                        throw new Error('Invalid file format');
                    }
                } catch (error) {
                    this.showError('Failed to import progress. Please check the file format.');
                }
            };
            
            reader.readAsText(file);
        });
        
        input.click();
    }
    
    resetProgress() {
        if (confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
            this.managers.storage.clearProgress();
            this.userProgress = {};
            this.currentDay = 1;
            this.updateProgressIndicator();
            this.showToast('Progress reset successfully!', 'success');
            this.closeModal('settings');
            this.showScreen('welcome');
        }
    }
    
    // Certificate Generation
    generateCertificate() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 800;
        canvas.height = 600;
        
        // Background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Border
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 10;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        
        // Title
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Certificate of Completion', canvas.width / 2, 120);
        
        // Subtitle
        ctx.font = '24px Arial';
        ctx.fillText('7-Day Periodic Table Challenge', canvas.width / 2, 180);
        
        // User achievement
        ctx.font = '20px Arial';
        ctx.fillText('This certifies that you have successfully', canvas.width / 2, 250);
        ctx.fillText('mastered all 118 elements of the periodic table', canvas.width / 2, 280);
        
        // Stats
        const avgScore = this.calculateAverageScore();
        ctx.fillText(`Average Score: ${avgScore}%`, canvas.width / 2, 350);
        
        // Date
        const completionDate = new Date().toLocaleDateString();
        ctx.fillText(`Completed on: ${completionDate}`, canvas.width / 2, 420);
        
        // Download
        const link = document.createElement('a');
        link.download = 'periodic-table-certificate.png';
        link.href = canvas.toDataURL();
        link.click();
        
        this.showToast('Certificate downloaded!', 'success');
    }
    
    calculateAverageScore() {
        const scores = Object.values(this.userProgress.quizScores || {});
        if (scores.length === 0) return 0;
        
        const total = scores.reduce((sum, score) => sum + score, 0);
        return Math.round(total / scores.length);
    }
    
    // Event Handlers
    handleResize() {
        // Handle responsive layout changes
        this.managers.periodicTable.handleResize();
    }
    
    handlePageHidden() {
        // Pause any running timers or animations
        this.managers.quiz.pause();
    }
    
    handlePageVisible() {
        // Resume timers or animations
        this.managers.quiz.resume();
    }
    
    // Display Methods
    displayResults(results) {
        const scorePercentage = document.getElementById('score-percentage');
        const scoreFill = document.getElementById('score-fill');
        const correctAnswers = document.getElementById('correct-answers');
        const incorrectAnswers = document.getElementById('incorrect-answers');
        const timeTaken = document.getElementById('time-taken');
        const feedbackMessage = document.getElementById('feedback-message');
        const improvementTips = document.getElementById('improvement-tips');
        
        const percentage = Math.round((results.correct / results.total) * 100);
        
        scorePercentage.textContent = `${percentage}%`;
        correctAnswers.textContent = results.correct;
        incorrectAnswers.textContent = results.incorrect;
        timeTaken.textContent = this.formatTime(results.timeSpent);
        
        // Animate score circle
        const degrees = (percentage / 100) * 360;
        scoreFill.style.background = `conic-gradient(var(--primary-color) ${degrees}deg, var(--border-light) ${degrees}deg)`;
        
        // Feedback message
        if (percentage >= 90) {
            feedbackMessage.textContent = 'Excellent work! You have mastered these elements!';
        } else if (percentage >= 80) {
            feedbackMessage.textContent = 'Great job! You have a solid understanding.';
        } else if (percentage >= 70) {
            feedbackMessage.textContent = 'Good effort! Keep practicing to improve.';
        } else {
            feedbackMessage.textContent = 'Keep studying! Review the elements and try again.';
        }
        
        // Improvement tips
        if (percentage < 80) {
            improvementTips.textContent = 'Tip: Focus on the properties and uses of elements you missed.';
        } else {
            improvementTips.textContent = 'You\'re doing great! Continue to the next day.';
        }
    }
    
    updateFinalChallengeStats() {
        // Update final challenge statistics
        const totalElements = document.querySelector('.overview-stat .stat-number');
        if (totalElements) {
            totalElements.textContent = '118';
        }
    }
    
    updateCompletionStats() {
        const daysCompleted = document.getElementById('days-completed');
        const elementsLearned = document.getElementById('elements-learned');
        const totalQuestions = document.getElementById('total-questions');
        const averageScore = document.getElementById('average-score');
        
        daysCompleted.textContent = '7';
        elementsLearned.textContent = '118';
        
        const totalQs = Object.keys(this.userProgress.quizScores || {}).length * 15 + 50; // Daily quizzes + final
        totalQuestions.textContent = totalQs;
        
        averageScore.textContent = `${this.calculateAverageScore()}%`;
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.periodicTableApp = new PeriodicTableApp();
});

// Add CSS animation for toast slide out
const style = document.createElement('style');
style.textContent = `
    @keyframes toastSlideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

