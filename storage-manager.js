// Storage Manager - Handles local storage operations for user progress and settings

class StorageManager {
    constructor() {
        this.storageKeys = {
            progress: 'periodic-table-progress',
            settings: 'periodic-table-settings',
            elements: 'periodic-table-elements',
            quizHistory: 'periodic-table-quiz-history'
        };
        
        this.defaultProgress = {
            currentDay: 1,
            completedDays: [],
            learnedElements: [],
            quizScores: {},
            totalScore: 0,
            startDate: null,
            lastActiveDate: null,
            streakDays: 0,
            achievements: []
        };
        
        this.defaultSettings = {
            theme: 'light',
            soundEnabled: true,
            volume: 50,
            animationsEnabled: true,
            difficulty: 'medium',
            hintsEnabled: true,
            language: 'en',
            autoSave: true
        };
    }
    
    async init() {
        // Check if localStorage is available
        if (!this.isStorageAvailable()) {
            console.warn('localStorage not available, using memory storage');
            this.useMemoryStorage = true;
            this.memoryStorage = {};
        }
        
        // Migrate old data if necessary
        await this.migrateOldData();
        
        console.log('Storage Manager initialized');
    }
    
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    async migrateOldData() {
        // Check for old data format and migrate if necessary
        const oldProgress = this.getItem('periodicTableProgress');
        if (oldProgress && !this.getItem(this.storageKeys.progress)) {
            await this.saveProgress(oldProgress);
            this.removeItem('periodicTableProgress');
        }
    }
    
    // Generic storage methods
    setItem(key, value) {
        try {
            if (this.useMemoryStorage) {
                this.memoryStorage[key] = JSON.stringify(value);
            } else {
                localStorage.setItem(key, JSON.stringify(value));
            }
            return true;
        } catch (error) {
            console.error('Failed to save to storage:', error);
            return false;
        }
    }
    
    getItem(key) {
        try {
            let item;
            if (this.useMemoryStorage) {
                item = this.memoryStorage[key];
            } else {
                item = localStorage.getItem(key);
            }
            
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Failed to read from storage:', error);
            return null;
        }
    }
    
    removeItem(key) {
        try {
            if (this.useMemoryStorage) {
                delete this.memoryStorage[key];
            } else {
                localStorage.removeItem(key);
            }
            return true;
        } catch (error) {
            console.error('Failed to remove from storage:', error);
            return false;
        }
    }
    
    clear() {
        try {
            if (this.useMemoryStorage) {
                this.memoryStorage = {};
            } else {
                // Only clear our app's data
                Object.values(this.storageKeys).forEach(key => {
                    localStorage.removeItem(key);
                });
            }
            return true;
        } catch (error) {
            console.error('Failed to clear storage:', error);
            return false;
        }
    }
    
    // Progress management
    async saveProgress(progress) {
        const progressData = {
            ...this.defaultProgress,
            ...progress,
            lastSaved: new Date().toISOString(),
            version: '1.0'
        };
        
        const success = this.setItem(this.storageKeys.progress, progressData);
        
        if (success) {
            // Also save elements data with learned status
            await this.saveElementsData();
        }
        
        return success;
    }
    
    async getProgress() {
        const progress = this.getItem(this.storageKeys.progress);
        
        if (!progress) {
            return { ...this.defaultProgress };
        }
        
        // Merge with defaults to ensure all properties exist
        return {
            ...this.defaultProgress,
            ...progress
        };
    }
    
    async clearProgress() {
        const success = this.removeItem(this.storageKeys.progress);
        
        if (success) {
            // Also clear elements data
            this.removeItem(this.storageKeys.elements);
            this.removeItem(this.storageKeys.quizHistory);
        }
        
        return success;
    }
    
    // Settings management
    async saveSettings(settings) {
        const settingsData = {
            ...this.defaultSettings,
            ...settings,
            lastUpdated: new Date().toISOString()
        };
        
        return this.setItem(this.storageKeys.settings, settingsData);
    }
    
    async getSettings() {
        const settings = this.getItem(this.storageKeys.settings);
        
        if (!settings) {
            return { ...this.defaultSettings };
        }
        
        return {
            ...this.defaultSettings,
            ...settings
        };
    }
    
    // Elements data management
    async saveElementsData() {
        const elementsData = {};
        
        Object.values(ELEMENTS_DATA).forEach(element => {
            elementsData[element.atomicNumber] = {
                learned: element.learned || false,
                timesStudied: element.timesStudied || 0,
                lastStudied: element.lastStudied || null,
                difficulty: element.userDifficulty || 'medium'
            };
        });
        
        return this.setItem(this.storageKeys.elements, elementsData);
    }
    
    async getElementsData() {
        return this.getItem(this.storageKeys.elements) || {};
    }
    
    async updateElementProgress(atomicNumber, data) {
        const elementsData = await this.getElementsData();
        
        elementsData[atomicNumber] = {
            ...elementsData[atomicNumber],
            ...data,
            lastUpdated: new Date().toISOString()
        };
        
        return this.setItem(this.storageKeys.elements, elementsData);
    }
    
    // Quiz history management
    async saveQuizResult(quizResult) {
        const history = await this.getQuizHistory();
        
        const quizData = {
            ...quizResult,
            id: this.generateId(),
            timestamp: new Date().toISOString()
        };
        
        history.push(quizData);
        
        // Keep only last 100 quiz results
        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
        
        return this.setItem(this.storageKeys.quizHistory, history);
    }
    
    async getQuizHistory() {
        return this.getItem(this.storageKeys.quizHistory) || [];
    }
    
    async getQuizStats() {
        const history = await this.getQuizHistory();
        
        if (history.length === 0) {
            return {
                totalQuizzes: 0,
                averageScore: 0,
                bestScore: 0,
                totalQuestions: 0,
                correctAnswers: 0
            };
        }
        
        const totalQuizzes = history.length;
        const scores = history.map(quiz => quiz.score || 0);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalQuizzes;
        const bestScore = Math.max(...scores);
        const totalQuestions = history.reduce((sum, quiz) => sum + (quiz.totalQuestions || 0), 0);
        const correctAnswers = history.reduce((sum, quiz) => sum + (quiz.correctAnswers || 0), 0);
        
        return {
            totalQuizzes,
            averageScore: Math.round(averageScore),
            bestScore,
            totalQuestions,
            correctAnswers,
            accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
        };
    }
    
    // Achievement management
    async saveAchievement(achievement) {
        const progress = await this.getProgress();
        
        if (!progress.achievements.find(a => a.id === achievement.id)) {
            progress.achievements.push({
                ...achievement,
                unlockedAt: new Date().toISOString()
            });
            
            await this.saveProgress(progress);
            return true;
        }
        
        return false;
    }
    
    async getAchievements() {
        const progress = await this.getProgress();
        return progress.achievements || [];
    }
    
    // Data export/import
    async exportData() {
        const data = {
            progress: await this.getProgress(),
            settings: await this.getSettings(),
            elements: await this.getElementsData(),
            quizHistory: await this.getQuizHistory(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        return data;
    }
    
    async importData(data) {
        try {
            if (!data || !data.version) {
                throw new Error('Invalid data format');
            }
            
            // Validate data structure
            if (data.progress) {
                await this.saveProgress(data.progress);
            }
            
            if (data.settings) {
                await this.saveSettings(data.settings);
            }
            
            if (data.elements) {
                this.setItem(this.storageKeys.elements, data.elements);
            }
            
            if (data.quizHistory) {
                this.setItem(this.storageKeys.quizHistory, data.quizHistory);
            }
            
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
    
    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    async getStorageUsage() {
        if (this.useMemoryStorage) {
            const memorySize = JSON.stringify(this.memoryStorage).length;
            return {
                used: memorySize,
                available: Infinity,
                percentage: 0
            };
        }
        
        try {
            let totalSize = 0;
            Object.values(this.storageKeys).forEach(key => {
                const item = localStorage.getItem(key);
                if (item) {
                    totalSize += item.length;
                }
            });
            
            // Estimate total localStorage size (usually 5-10MB)
            const estimatedTotal = 5 * 1024 * 1024; // 5MB
            
            return {
                used: totalSize,
                available: estimatedTotal,
                percentage: Math.round((totalSize / estimatedTotal) * 100)
            };
        } catch (error) {
            return {
                used: 0,
                available: 0,
                percentage: 0
            };
        }
    }
    
    async cleanupOldData() {
        // Remove quiz history older than 30 days
        const history = await this.getQuizHistory();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const filteredHistory = history.filter(quiz => {
            const quizDate = new Date(quiz.timestamp);
            return quizDate > thirtyDaysAgo;
        });
        
        if (filteredHistory.length !== history.length) {
            await this.setItem(this.storageKeys.quizHistory, filteredHistory);
            console.log(`Cleaned up ${history.length - filteredHistory.length} old quiz records`);
        }
    }
    
    // Backup and restore
    async createBackup() {
        const data = await this.exportData();
        const backup = {
            ...data,
            backupDate: new Date().toISOString(),
            appVersion: '1.0'
        };
        
        return JSON.stringify(backup, null, 2);
    }
    
    async restoreFromBackup(backupString) {
        try {
            const backup = JSON.parse(backupString);
            
            if (!backup.backupDate || !backup.appVersion) {
                throw new Error('Invalid backup format');
            }
            
            return await this.importData(backup);
        } catch (error) {
            console.error('Failed to restore from backup:', error);
            return false;
        }
    }
    
    // Sync methods (for future cloud sync implementation)
    async syncToCloud() {
        // Placeholder for cloud sync functionality
        console.log('Cloud sync not implemented yet');
        return false;
    }
    
    async syncFromCloud() {
        // Placeholder for cloud sync functionality
        console.log('Cloud sync not implemented yet');
        return false;
    }
}

