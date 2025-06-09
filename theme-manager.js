// Theme Manager - Handles theme switching and visual preferences

class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.themes = {
            light: {
                name: 'Light',
                class: 'theme-light'
            },
            dark: {
                name: 'Dark',
                class: 'theme-dark'
            },
            auto: {
                name: 'Auto',
                class: 'theme-auto'
            }
        };
        
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    }
    
    async init() {
        // Listen for system theme changes
        this.mediaQuery.addEventListener('change', (e) => {
            if (this.currentTheme === 'auto') {
                this.applySystemTheme();
            }
        });
        
        // Apply initial theme
        this.applyTheme(this.currentTheme);
        
        console.log('Theme Manager initialized');
    }
    
    setTheme(theme) {
        if (!this.themes[theme]) {
            console.warn(`Theme '${theme}' not found`);
            return;
        }
        
        this.currentTheme = theme;
        this.applyTheme(theme);
        
        // Save to storage
        if (window.periodicTableApp && window.periodicTableApp.managers.storage) {
            window.periodicTableApp.changeSetting('theme', theme);
        }
    }
    
    applyTheme(theme) {
        const body = document.body;
        
        // Remove all theme classes
        Object.values(this.themes).forEach(t => {
            body.classList.remove(t.class);
        });
        
        if (theme === 'auto') {
            this.applySystemTheme();
        } else {
            body.classList.add(this.themes[theme].class);
            body.setAttribute('data-theme', theme);
        }
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme);
        
        // Dispatch theme change event
        this.dispatchThemeChangeEvent(theme);
    }
    
    applySystemTheme() {
        const body = document.body;
        const prefersDark = this.mediaQuery.matches;
        const systemTheme = prefersDark ? 'dark' : 'light';
        
        // Remove all theme classes
        Object.values(this.themes).forEach(t => {
            body.classList.remove(t.class);
        });
        
        body.classList.add(this.themes[systemTheme].class);
        body.setAttribute('data-theme', systemTheme);
        
        this.updateMetaThemeColor(systemTheme);
    }
    
    updateMetaThemeColor(theme) {
        let themeColor = '#ffffff'; // Default light theme
        
        if (theme === 'dark' || (theme === 'auto' && this.mediaQuery.matches)) {
            themeColor = '#1f2937'; // Dark theme
        }
        
        // Update existing meta tag or create new one
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = themeColor;
    }
    
    dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('themechange', {
            detail: { theme, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    }
    
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    getEffectiveTheme() {
        if (this.currentTheme === 'auto') {
            return this.mediaQuery.matches ? 'dark' : 'light';
        }
        return this.currentTheme;
    }
    
    toggleTheme() {
        const themes = Object.keys(this.themes);
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.setTheme(themes[nextIndex]);
    }
    
    // High contrast mode support
    enableHighContrast() {
        document.body.classList.add('high-contrast');
    }
    
    disableHighContrast() {
        document.body.classList.remove('high-contrast');
    }
    
    // Reduced motion support
    respectReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
        
        return prefersReducedMotion;
    }
}

// Audio Manager - Handles sound effects and audio feedback

class AudioManager {
    constructor() {
        this.enabled = true;
        this.volume = 0.5;
        this.sounds = {};
        this.audioContext = null;
        this.masterGain = null;
        
        // Sound definitions
        this.soundDefinitions = {
            'correct': { frequency: 800, duration: 0.2, type: 'sine' },
            'incorrect': { frequency: 200, duration: 0.3, type: 'sawtooth' },
            'transition': { frequency: 400, duration: 0.1, type: 'sine' },
            'element-select': { frequency: 600, duration: 0.1, type: 'triangle' },
            'modal-open': { frequency: 500, duration: 0.15, type: 'sine' },
            'modal-close': { frequency: 300, duration: 0.1, type: 'sine' },
            'toast-success': { frequency: 700, duration: 0.2, type: 'sine' },
            'toast-error': { frequency: 150, duration: 0.4, type: 'square' },
            'toast-warning': { frequency: 450, duration: 0.25, type: 'triangle' },
            'toast-info': { frequency: 550, duration: 0.15, type: 'sine' },
            'menu-open': { frequency: 350, duration: 0.1, type: 'sine' },
            'button-click': { frequency: 400, duration: 0.05, type: 'sine' },
            'achievement': { frequency: [523, 659, 784], duration: 0.5, type: 'sine' },
            'completion': { frequency: [523, 659, 784, 1047], duration: 1.0, type: 'sine' }
        };
    }
    
    async init() {
        try {
            // Initialize Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;
            
            // Pre-generate sounds
            await this.preloadSounds();
            
            console.log('Audio Manager initialized');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
            this.enabled = false;
        }
    }
    
    async preloadSounds() {
        // Pre-generate common sounds for better performance
        const commonSounds = ['correct', 'incorrect', 'element-select', 'button-click'];
        
        for (const soundName of commonSounds) {
            this.sounds[soundName] = this.generateSound(soundName);
        }
    }
    
    generateSound(soundName) {
        const definition = this.soundDefinitions[soundName];
        if (!definition || !this.audioContext) return null;
        
        const { frequency, duration, type } = definition;
        
        if (Array.isArray(frequency)) {
            // Multi-tone sound (like achievement)
            return this.generateChord(frequency, duration, type);
        } else {
            // Single tone sound
            return this.generateTone(frequency, duration, type);
        }
    }
    
    generateTone(frequency, duration, type) {
        return () => {
            if (!this.enabled || !this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            // Envelope for smooth sound
            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
        };
    }
    
    generateChord(frequencies, duration, type) {
        return () => {
            if (!this.enabled || !this.audioContext) return;
            
            frequencies.forEach((frequency, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.masterGain);
                    
                    oscillator.frequency.value = frequency;
                    oscillator.type = type;
                    
                    const now = this.audioContext.currentTime;
                    gainNode.gain.setValueAtTime(0, now);
                    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration / 2);
                    
                    oscillator.start(now);
                    oscillator.stop(now + duration / 2);
                }, index * 100);
            });
        };
    }
    
    playSound(soundName) {
        if (!this.enabled || !this.audioContext) return;
        
        // Resume audio context if suspended (required by some browsers)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        let soundFunction = this.sounds[soundName];
        
        if (!soundFunction) {
            soundFunction = this.generateSound(soundName);
            this.sounds[soundName] = soundFunction;
        }
        
        if (soundFunction) {
            try {
                soundFunction();
            } catch (error) {
                console.warn('Failed to play sound:', soundName, error);
            }
        }
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        
        if (!enabled && this.audioContext) {
            this.audioContext.suspend();
        } else if (enabled && this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume / 100));
        
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }
    
    // Special sound effects
    playSuccessSequence() {
        if (!this.enabled) return;
        
        const notes = [523, 659, 784]; // C, E, G
        notes.forEach((frequency, index) => {
            setTimeout(() => {
                this.playTone(frequency, 0.2, 'sine');
            }, index * 150);
        });
    }
    
    playErrorSequence() {
        if (!this.enabled) return;
        
        this.playTone(200, 0.1, 'sawtooth');
        setTimeout(() => {
            this.playTone(150, 0.2, 'sawtooth');
        }, 100);
    }
    
    playTone(frequency, duration, type = 'sine') {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
    
    // Ambient sounds (for future enhancement)
    startAmbientSound() {
        // Placeholder for ambient background sounds
    }
    
    stopAmbientSound() {
        // Placeholder for stopping ambient sounds
    }
}

// Animation Manager - Handles animations and visual effects

class AnimationManager {
    constructor() {
        this.enabled = true;
        this.activeAnimations = new Set();
        this.animationQueue = [];
        this.isProcessingQueue = false;
    }
    
    async init() {
        // Check for reduced motion preference
        this.respectReducedMotion();
        
        // Listen for reduced motion changes
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        mediaQuery.addEventListener('change', () => {
            this.respectReducedMotion();
        });
        
        console.log('Animation Manager initialized');
    }
    
    respectReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            this.enabled = false;
            document.body.classList.add('reduced-motion');
        } else {
            this.enabled = true;
            document.body.classList.remove('reduced-motion');
        }
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        
        if (!enabled) {
            // Cancel all active animations
            this.activeAnimations.forEach(animation => {
                if (animation.cancel) {
                    animation.cancel();
                }
            });
            this.activeAnimations.clear();
        }
    }
    
    // Screen transitions
    screenTransition(fromScreen, toScreen, direction = 'right') {
        if (!this.enabled) {
            fromScreen.classList.remove('active');
            toScreen.classList.add('active');
            return Promise.resolve();
        }
        
        return new Promise(resolve => {
            const duration = 350;
            
            // Set initial states
            toScreen.style.display = 'block';
            toScreen.classList.add('active');
            
            if (direction === 'right') {
                toScreen.style.transform = 'translateX(100px)';
                toScreen.style.opacity = '0';
            } else {
                toScreen.style.transform = 'translateX(-100px)';
                toScreen.style.opacity = '0';
            }
            
            // Animate out current screen
            const fromAnimation = fromScreen.animate([
                { transform: 'translateX(0)', opacity: '1' },
                { transform: direction === 'right' ? 'translateX(-100px)' : 'translateX(100px)', opacity: '0' }
            ], {
                duration,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            });
            
            // Animate in new screen
            const toAnimation = toScreen.animate([
                { transform: direction === 'right' ? 'translateX(100px)' : 'translateX(-100px)', opacity: '0' },
                { transform: 'translateX(0)', opacity: '1' }
            ], {
                duration,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            });
            
            this.activeAnimations.add(fromAnimation);
            this.activeAnimations.add(toAnimation);
            
            Promise.all([fromAnimation.finished, toAnimation.finished]).then(() => {
                fromScreen.classList.remove('active');
                fromScreen.style.transform = '';
                fromScreen.style.opacity = '';
                toScreen.style.transform = '';
                toScreen.style.opacity = '';
                
                this.activeAnimations.delete(fromAnimation);
                this.activeAnimations.delete(toAnimation);
                
                resolve();
            });
        });
    }
    
    // Element animations
    highlightElement(element, color = '#6366f1') {
        if (!this.enabled) return Promise.resolve();
        
        return new Promise(resolve => {
            const originalBoxShadow = element.style.boxShadow;
            
            const animation = element.animate([
                { boxShadow: originalBoxShadow },
                { boxShadow: `0 0 20px ${color}` },
                { boxShadow: originalBoxShadow }
            ], {
                duration: 1000,
                easing: 'ease-in-out'
            });
            
            this.activeAnimations.add(animation);
            
            animation.finished.then(() => {
                this.activeAnimations.delete(animation);
                resolve();
            });
        });
    }
    
    pulseElement(element, count = 3) {
        if (!this.enabled) return Promise.resolve();
        
        return new Promise(resolve => {
            const animation = element.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.05)' },
                { transform: 'scale(1)' }
            ], {
                duration: 300,
                iterations: count,
                easing: 'ease-in-out'
            });
            
            this.activeAnimations.add(animation);
            
            animation.finished.then(() => {
                this.activeAnimations.delete(animation);
                resolve();
            });
        });
    }
    
    shakeElement(element) {
        if (!this.enabled) return Promise.resolve();
        
        return new Promise(resolve => {
            const animation = element.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' },
                { transform: 'translateX(0)' }
            ], {
                duration: 500,
                easing: 'ease-in-out'
            });
            
            this.activeAnimations.add(animation);
            
            animation.finished.then(() => {
                this.activeAnimations.delete(animation);
                resolve();
            });
        });
    }
    
    // Celebration effects
    celebrationEffect() {
        if (!this.enabled) return;
        
        this.createConfetti();
        this.createParticles();
    }
    
    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'];
        const confettiContainer = document.getElementById('celebration-animation') || document.body;
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * window.innerWidth + 'px';
                confetti.style.top = '-10px';
                confetti.style.zIndex = '9999';
                confetti.style.pointerEvents = 'none';
                confetti.style.borderRadius = '2px';
                
                confettiContainer.appendChild(confetti);
                
                const animation = confetti.animate([
                    { 
                        transform: 'translateY(0) rotate(0deg)',
                        opacity: 1
                    },
                    { 
                        transform: `translateY(${window.innerHeight + 100}px) rotate(720deg)`,
                        opacity: 0
                    }
                ], {
                    duration: 3000 + Math.random() * 2000,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                });
                
                animation.finished.then(() => {
                    confetti.remove();
                });
            }, i * 50);
        }
    }
    
    createParticles() {
        const particleContainer = document.getElementById('celebration-animation') || document.body;
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.width = '4px';
                particle.style.height = '4px';
                particle.style.backgroundColor = '#ffd700';
                particle.style.borderRadius = '50%';
                particle.style.left = '50%';
                particle.style.top = '50%';
                particle.style.zIndex = '9999';
                particle.style.pointerEvents = 'none';
                particle.style.boxShadow = '0 0 6px #ffd700';
                
                particleContainer.appendChild(particle);
                
                const angle = (i / 20) * Math.PI * 2;
                const distance = 100 + Math.random() * 100;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;
                
                const animation = particle.animate([
                    { 
                        transform: 'translate(-50%, -50%) scale(0)',
                        opacity: 1
                    },
                    { 
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`,
                        opacity: 1
                    },
                    { 
                        transform: `translate(calc(-50% + ${x * 2}px), calc(-50% + ${y * 2}px)) scale(0)`,
                        opacity: 0
                    }
                ], {
                    duration: 2000,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                });
                
                animation.finished.then(() => {
                    particle.remove();
                });
            }, i * 100);
        }
    }
    
    // Progress animations
    animateProgressBar(progressBar, targetWidth, duration = 1000) {
        if (!this.enabled) {
            progressBar.style.width = targetWidth;
            return Promise.resolve();
        }
        
        return new Promise(resolve => {
            const animation = progressBar.animate([
                { width: progressBar.style.width || '0%' },
                { width: targetWidth }
            ], {
                duration,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                fill: 'forwards'
            });
            
            this.activeAnimations.add(animation);
            
            animation.finished.then(() => {
                this.activeAnimations.delete(animation);
                resolve();
            });
        });
    }
    
    // Counter animations
    animateCounter(element, targetValue, duration = 1000) {
        if (!this.enabled) {
            element.textContent = targetValue;
            return Promise.resolve();
        }
        
        return new Promise(resolve => {
            const startValue = parseInt(element.textContent) || 0;
            const startTime = performance.now();
            
            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const currentValue = Math.round(startValue + (targetValue - startValue) * progress);
                element.textContent = currentValue;
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(updateCounter);
        });
    }
    
    // Utility methods
    fadeIn(element, duration = 300) {
        if (!this.enabled) {
            element.style.opacity = '1';
            return Promise.resolve();
        }
        
        return new Promise(resolve => {
            element.style.opacity = '0';
            element.style.display = 'block';
            
            const animation = element.animate([
                { opacity: 0 },
                { opacity: 1 }
            ], {
                duration,
                easing: 'ease-out',
                fill: 'forwards'
            });
            
            this.activeAnimations.add(animation);
            
            animation.finished.then(() => {
                this.activeAnimations.delete(animation);
                resolve();
            });
        });
    }
    
    fadeOut(element, duration = 300) {
        if (!this.enabled) {
            element.style.display = 'none';
            return Promise.resolve();
        }
        
        return new Promise(resolve => {
            const animation = element.animate([
                { opacity: 1 },
                { opacity: 0 }
            ], {
                duration,
                easing: 'ease-out',
                fill: 'forwards'
            });
            
            this.activeAnimations.add(animation);
            
            animation.finished.then(() => {
                element.style.display = 'none';
                this.activeAnimations.delete(animation);
                resolve();
            });
        });
    }
}

