// Quiz Manager - Handles all quiz functionality and question types

class QuizManager {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestion = 0;
        this.answers = [];
        this.startTime = null;
        this.timeSpent = 0;
        this.isPaused = false;
        this.timer = null;
        
        this.questionTypes = ['multiple-choice', 'drag-drop', 'matching', 'fill-blank'];
        this.difficulty = 'medium';
        this.hintsUsed = 0;
        
        this.elements = {
            container: document.getElementById('quiz-screen'),
            questionCounter: document.getElementById('current-question'),
            totalQuestions: document.getElementById('total-questions'),
            score: document.getElementById('quiz-score'),
            maxScore: document.getElementById('max-score'),
            progressFill: document.getElementById('quiz-progress-fill'),
            submitBtn: document.getElementById('quiz-submit-btn'),
            nextBtn: document.getElementById('quiz-next-btn'),
            hintBtn: document.getElementById('quiz-hint-btn'),
            feedback: document.getElementById('answer-feedback')
        };
        
        this.questionContainers = {
            'multiple-choice': document.getElementById('multiple-choice-question'),
            'drag-drop': document.getElementById('drag-drop-question'),
            'matching': document.getElementById('matching-question'),
            'fill-blank': document.getElementById('fill-blank-question')
        };
    }
    
    async init() {
        this.setupEventListeners();
        console.log('Quiz Manager initialized');
    }
    
    setupEventListeners() {
        // Answer option clicks for multiple choice
        document.addEventListener('click', (e) => {
            if (e.target.closest('.answer-option')) {
                this.selectAnswer(e.target.closest('.answer-option'));
            }
        });
        
        // Drag and drop events
        this.setupDragAndDrop();
        
        // Matching events
        this.setupMatching();
        
        // Fill in the blank events
        this.setupFillInTheBlank();
    }
    
    startQuiz(elements, difficulty = 'medium') {
        this.difficulty = difficulty;
        this.currentQuiz = this.generateQuiz(elements);
        this.currentQuestion = 0;
        this.answers = [];
        this.startTime = Date.now();
        this.timeSpent = 0;
        this.hintsUsed = 0;
        this.isPaused = false;
        
        this.updateQuizHeader();
        this.showQuestion();
        this.startTimer();
        
        console.log('Quiz started with', this.currentQuiz.questions.length, 'questions');
    }
    
    startQuickQuiz() {
        // Generate a quick 5-question quiz from random elements
        const allElements = Object.values(ELEMENTS_DATA);
        const randomElements = this.shuffleArray(allElements).slice(0, 10);
        
        this.startQuiz(randomElements, this.difficulty);
    }
    
    startFinalChallenge() {
        // Generate comprehensive final challenge
        const allElements = Object.values(ELEMENTS_DATA);
        this.currentQuiz = this.generateFinalQuiz(allElements);
        this.currentQuestion = 0;
        this.answers = [];
        this.startTime = Date.now();
        this.timeSpent = 0;
        this.hintsUsed = 0;
        this.isPaused = false;
        
        this.updateQuizHeader();
        this.showQuestion();
        this.startTimer();
        
        console.log('Final challenge started with', this.currentQuiz.questions.length, 'questions');
    }
    
    generateQuiz(elements) {
        const questions = [];
        const questionCount = elements.length >= 15 ? 15 : Math.max(5, elements.length);
        
        // Generate different types of questions
        for (let i = 0; i < questionCount; i++) {
            const questionType = this.getRandomQuestionType();
            const question = this.generateQuestion(questionType, elements);
            if (question) {
                questions.push(question);
            }
        }
        
        return {
            questions: this.shuffleArray(questions),
            totalQuestions: questions.length,
            difficulty: this.difficulty
        };
    }
    
    generateFinalQuiz(elements) {
        const questions = [];
        const questionCount = 50;
        
        // Ensure variety in question types
        const typeDistribution = {
            'multiple-choice': 20,
            'drag-drop': 10,
            'matching': 10,
            'fill-blank': 10
        };
        
        Object.entries(typeDistribution).forEach(([type, count]) => {
            for (let i = 0; i < count; i++) {
                const question = this.generateQuestion(type, elements);
                if (question) {
                    questions.push(question);
                }
            }
        });
        
        return {
            questions: this.shuffleArray(questions),
            totalQuestions: questions.length,
            difficulty: 'hard',
            isFinalChallenge: true
        };
    }
    
    getRandomQuestionType() {
        const weights = {
            'multiple-choice': 0.4,
            'drag-drop': 0.2,
            'matching': 0.2,
            'fill-blank': 0.2
        };
        
        const random = Math.random();
        let cumulative = 0;
        
        for (const [type, weight] of Object.entries(weights)) {
            cumulative += weight;
            if (random <= cumulative) {
                return type;
            }
        }
        
        return 'multiple-choice';
    }
    
    generateQuestion(type, elements) {
        const element = elements[Math.floor(Math.random() * elements.length)];
        
        switch (type) {
            case 'multiple-choice':
                return this.generateMultipleChoiceQuestion(element, elements);
            case 'drag-drop':
                return this.generateDragDropQuestion(elements);
            case 'matching':
                return this.generateMatchingQuestion(elements);
            case 'fill-blank':
                return this.generateFillBlankQuestion(element);
            default:
                return null;
        }
    }
    
    generateMultipleChoiceQuestion(element, elements) {
        const questionTypes = [
            'symbol-to-name',
            'name-to-symbol',
            'atomic-number',
            'group-period',
            'category',
            'properties',
            'uses'
        ];
        
        const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        
        switch (questionType) {
            case 'symbol-to-name':
                return {
                    type: 'multiple-choice',
                    question: `What is the name of the element with symbol "${element.symbol}"?`,
                    correctAnswer: element.name,
                    options: this.generateNameOptions(element, elements),
                    hint: `This element is in group ${element.group} and period ${element.period}.`,
                    explanation: `${element.symbol} is the symbol for ${element.name}, which ${element.uses.split(',')[0].toLowerCase()}.`
                };
                
            case 'name-to-symbol':
                return {
                    type: 'multiple-choice',
                    question: `What is the chemical symbol for ${element.name}?`,
                    correctAnswer: element.symbol,
                    options: this.generateSymbolOptions(element, elements),
                    hint: `The symbol often comes from the element's name or its Latin name.`,
                    explanation: `The symbol for ${element.name} is ${element.symbol}.`
                };
                
            case 'atomic-number':
                return {
                    type: 'multiple-choice',
                    question: `What is the atomic number of ${element.name}?`,
                    correctAnswer: element.atomicNumber.toString(),
                    options: this.generateAtomicNumberOptions(element),
                    hint: `The atomic number equals the number of protons in the nucleus.`,
                    explanation: `${element.name} has ${element.atomicNumber} protons, so its atomic number is ${element.atomicNumber}.`
                };
                
            case 'group-period':
                return {
                    type: 'multiple-choice',
                    question: `In which group is ${element.name} located?`,
                    correctAnswer: element.group.toString(),
                    options: this.generateGroupOptions(element),
                    hint: `Groups are the vertical columns in the periodic table.`,
                    explanation: `${element.name} is in group ${element.group} of the periodic table.`
                };
                
            case 'category':
                return {
                    type: 'multiple-choice',
                    question: `What category does ${element.name} belong to?`,
                    correctAnswer: this.formatCategory(element.category),
                    options: this.generateCategoryOptions(element),
                    hint: `Consider the element's position and properties.`,
                    explanation: `${element.name} is classified as ${this.formatCategory(element.category)}.`
                };
                
            default:
                return this.generateMultipleChoiceQuestion(element, elements);
        }
    }
    
    generateDragDropQuestion(elements) {
        const selectedElements = this.shuffleArray(elements).slice(0, 6);
        const categories = ['alkali-metal', 'noble-gas', 'transition-metal', 'reactive-nonmetal'];
        
        return {
            type: 'drag-drop',
            question: 'Drag each element to its correct category:',
            elements: selectedElements.map(el => ({
                symbol: el.symbol,
                name: el.name,
                category: el.category
            })),
            categories: categories.map(cat => ({
                id: cat,
                name: this.formatCategory(cat),
                acceptedElements: selectedElements.filter(el => el.category === cat).map(el => el.symbol)
            })),
            hint: 'Consider the position of elements in the periodic table.',
            explanation: 'Elements are classified based on their electron configuration and properties.'
        };
    }
    
    generateMatchingQuestion(elements) {
        const selectedElements = this.shuffleArray(elements).slice(0, 5);
        
        const matchTypes = ['symbol-name', 'element-use', 'element-property'];
        const matchType = matchTypes[Math.floor(Math.random() * matchTypes.length)];
        
        switch (matchType) {
            case 'symbol-name':
                return {
                    type: 'matching',
                    question: 'Match each symbol with its element name:',
                    leftItems: selectedElements.map(el => ({ id: el.symbol, text: el.symbol })),
                    rightItems: this.shuffleArray(selectedElements.map(el => ({ id: el.symbol, text: el.name }))),
                    hint: 'Some symbols come from Latin names.',
                    explanation: 'Chemical symbols are standardized abbreviations for element names.'
                };
                
            case 'element-use':
                return {
                    type: 'matching',
                    question: 'Match each element with its primary use:',
                    leftItems: selectedElements.map(el => ({ id: el.symbol, text: el.name })),
                    rightItems: this.shuffleArray(selectedElements.map(el => ({ 
                        id: el.symbol, 
                        text: el.uses.split(',')[0].trim() 
                    }))),
                    hint: 'Think about common applications of these elements.',
                    explanation: 'Elements have various industrial and biological applications.'
                };
                
            default:
                return this.generateMatchingQuestion(elements);
        }
    }
    
    generateFillBlankQuestion(element) {
        const questionTypes = [
            'electron-config',
            'atomic-mass',
            'discoverer',
            'year'
        ];
        
        const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        
        switch (questionType) {
            case 'electron-config':
                return {
                    type: 'fill-blank',
                    question: `The electron configuration of ${element.name} is ______.`,
                    correctAnswer: element.electronConfig,
                    hint: 'Follow the aufbau principle for electron filling.',
                    explanation: `${element.name} has the electron configuration ${element.electronConfig}.`
                };
                
            case 'atomic-mass':
                return {
                    type: 'fill-blank',
                    question: `The atomic mass of ${element.name} is ______ u.`,
                    correctAnswer: element.atomicMass.toString(),
                    hint: 'Atomic mass is usually close to the mass number.',
                    explanation: `${element.name} has an atomic mass of ${element.atomicMass} u.`
                };
                
            case 'discoverer':
                if (element.discoverer && element.discoverer !== 'Ancient') {
                    return {
                        type: 'fill-blank',
                        question: `${element.name} was discovered by ______.`,
                        correctAnswer: element.discoverer,
                        hint: 'This scientist made the discovery in the ' + (element.discoveryYear ? Math.floor(element.discoveryYear / 100) * 100 + 's' : 'past'),
                        explanation: `${element.name} was discovered by ${element.discoverer}${element.discoveryYear ? ' in ' + element.discoveryYear : ''}.`
                    };
                }
                return this.generateFillBlankQuestion(element);
                
            default:
                return this.generateFillBlankQuestion(element);
        }
    }
    
    // Option generation helpers
    generateNameOptions(correctElement, elements) {
        const options = [correctElement.name];
        const otherElements = elements.filter(el => el.atomicNumber !== correctElement.atomicNumber);
        
        while (options.length < 4 && otherElements.length > 0) {
            const randomElement = otherElements.splice(Math.floor(Math.random() * otherElements.length), 1)[0];
            if (!options.includes(randomElement.name)) {
                options.push(randomElement.name);
            }
        }
        
        return this.shuffleArray(options);
    }
    
    generateSymbolOptions(correctElement, elements) {
        const options = [correctElement.symbol];
        const otherElements = elements.filter(el => el.atomicNumber !== correctElement.atomicNumber);
        
        while (options.length < 4 && otherElements.length > 0) {
            const randomElement = otherElements.splice(Math.floor(Math.random() * otherElements.length), 1)[0];
            if (!options.includes(randomElement.symbol)) {
                options.push(randomElement.symbol);
            }
        }
        
        return this.shuffleArray(options);
    }
    
    generateAtomicNumberOptions(correctElement) {
        const correct = correctElement.atomicNumber;
        const options = [correct.toString()];
        
        // Generate nearby numbers
        const variations = [-2, -1, 1, 2, 3, 5, 10];
        const shuffledVariations = this.shuffleArray(variations);
        
        for (const variation of shuffledVariations) {
            if (options.length >= 4) break;
            const option = correct + variation;
            if (option > 0 && option <= 118 && !options.includes(option.toString())) {
                options.push(option.toString());
            }
        }
        
        return this.shuffleArray(options);
    }
    
    generateGroupOptions(correctElement) {
        const correct = correctElement.group;
        const options = [correct.toString()];
        
        const allGroups = [1, 2, 13, 14, 15, 16, 17, 18];
        const otherGroups = allGroups.filter(g => g !== correct);
        
        while (options.length < 4 && otherGroups.length > 0) {
            const randomGroup = otherGroups.splice(Math.floor(Math.random() * otherGroups.length), 1)[0];
            options.push(randomGroup.toString());
        }
        
        return this.shuffleArray(options);
    }
    
    generateCategoryOptions(correctElement) {
        const correct = this.formatCategory(correctElement.category);
        const options = [correct];
        
        const categories = [
            'Alkali Metal',
            'Alkaline Earth Metal',
            'Transition Metal',
            'Post-transition Metal',
            'Metalloid',
            'Reactive Nonmetal',
            'Noble Gas',
            'Lanthanide',
            'Actinide'
        ];
        
        const otherCategories = categories.filter(cat => cat !== correct);
        
        while (options.length < 4 && otherCategories.length > 0) {
            const randomCategory = otherCategories.splice(Math.floor(Math.random() * otherCategories.length), 1)[0];
            options.push(randomCategory);
        }
        
        return this.shuffleArray(options);
    }
    
    formatCategory(category) {
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    showQuestion() {
        if (!this.currentQuiz || this.currentQuestion >= this.currentQuiz.questions.length) {
            this.endQuiz();
            return;
        }
        
        const question = this.currentQuiz.questions[this.currentQuestion];
        
        // Hide all question containers
        Object.values(this.questionContainers).forEach(container => {
            container.style.display = 'none';
        });
        
        // Show the appropriate container
        const container = this.questionContainers[question.type];
        if (container) {
            container.style.display = 'block';
            this.renderQuestion(question);
        }
        
        // Update UI
        this.updateQuizProgress();
        this.resetQuizControls();
    }
    
    renderQuestion(question) {
        switch (question.type) {
            case 'multiple-choice':
                this.renderMultipleChoice(question);
                break;
            case 'drag-drop':
                this.renderDragDrop(question);
                break;
            case 'matching':
                this.renderMatching(question);
                break;
            case 'fill-blank':
                this.renderFillBlank(question);
                break;
        }
    }
    
    renderMultipleChoice(question) {
        const questionText = document.getElementById('mc-question-text');
        const options = ['a', 'b', 'c', 'd'];
        
        questionText.textContent = question.question;
        
        options.forEach((option, index) => {
            const optionElement = document.getElementById(`option-${option}`);
            if (optionElement && question.options[index]) {
                optionElement.textContent = question.options[index];
                
                // Reset option state
                const answerOption = optionElement.closest('.answer-option');
                answerOption.classList.remove('selected', 'correct', 'incorrect');
                answerOption.setAttribute('aria-checked', 'false');
            }
        });
    }
    
    renderDragDrop(question) {
        const questionText = document.getElementById('dd-question-text');
        const draggableItems = document.getElementById('draggable-items');
        const dropZones = document.getElementById('drop-zones');
        
        questionText.textContent = question.question;
        
        // Clear previous content
        draggableItems.innerHTML = '';
        dropZones.innerHTML = '';
        
        // Create draggable items
        question.elements.forEach(element => {
            const item = document.createElement('div');
            item.className = 'draggable-item';
            item.draggable = true;
            item.dataset.symbol = element.symbol;
            item.innerHTML = `
                <span class="element-symbol">${element.symbol}</span>
                <span class="element-name">${element.name}</span>
            `;
            draggableItems.appendChild(item);
        });
        
        // Create drop zones
        question.categories.forEach(category => {
            const zone = document.createElement('div');
            zone.className = 'drop-zone';
            zone.dataset.category = category.id;
            zone.innerHTML = `
                <h4 class="zone-title">${category.name}</h4>
                <div class="zone-content"></div>
            `;
            dropZones.appendChild(zone);
        });
    }
    
    renderMatching(question) {
        const questionText = document.getElementById('match-question-text');
        const leftColumn = document.getElementById('left-column');
        const rightColumn = document.getElementById('right-column');
        
        questionText.textContent = question.question;
        
        // Clear previous content
        leftColumn.innerHTML = '';
        rightColumn.innerHTML = '';
        
        // Create left items
        question.leftItems.forEach(item => {
            const element = document.createElement('div');
            element.className = 'match-item left-item';
            element.dataset.id = item.id;
            element.textContent = item.text;
            leftColumn.appendChild(element);
        });
        
        // Create right items
        question.rightItems.forEach(item => {
            const element = document.createElement('div');
            element.className = 'match-item right-item';
            element.dataset.id = item.id;
            element.textContent = item.text;
            rightColumn.appendChild(element);
        });
    }
    
    renderFillBlank(question) {
        const questionText = document.getElementById('fb-question-text');
        const blankInputs = document.getElementById('blank-inputs');
        
        questionText.textContent = question.question;
        
        // Clear previous content
        blankInputs.innerHTML = '';
        
        // Create input field
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'blank-input';
        input.placeholder = 'Enter your answer...';
        input.addEventListener('input', () => {
            this.checkSubmitButton();
        });
        
        blankInputs.appendChild(input);
    }
    
    // Event handlers for different question types
    setupDragAndDrop() {
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('draggable-item')) {
                e.dataTransfer.setData('text/plain', e.target.dataset.symbol);
                e.target.classList.add('dragging');
            }
        });
        
        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('draggable-item')) {
                e.target.classList.remove('dragging');
            }
        });
        
        document.addEventListener('dragover', (e) => {
            if (e.target.closest('.drop-zone')) {
                e.preventDefault();
                e.target.closest('.drop-zone').classList.add('drag-over');
            }
        });
        
        document.addEventListener('dragleave', (e) => {
            if (e.target.closest('.drop-zone')) {
                e.target.closest('.drop-zone').classList.remove('drag-over');
            }
        });
        
        document.addEventListener('drop', (e) => {
            const dropZone = e.target.closest('.drop-zone');
            if (dropZone) {
                e.preventDefault();
                const symbol = e.dataTransfer.getData('text/plain');
                const draggableItem = document.querySelector(`[data-symbol="${symbol}"]`);
                
                if (draggableItem) {
                    const zoneContent = dropZone.querySelector('.zone-content');
                    zoneContent.appendChild(draggableItem);
                    draggableItem.classList.remove('dragging');
                }
                
                dropZone.classList.remove('drag-over');
                this.checkSubmitButton();
            }
        });
    }
    
    setupMatching() {
        let selectedLeft = null;
        let selectedRight = null;
        
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('left-item')) {
                // Deselect previous left item
                if (selectedLeft) {
                    selectedLeft.classList.remove('selected');
                }
                
                selectedLeft = e.target;
                selectedLeft.classList.add('selected');
                
                // Check for match if right item is selected
                if (selectedRight) {
                    this.createMatch(selectedLeft, selectedRight);
                    selectedLeft = null;
                    selectedRight = null;
                }
            } else if (e.target.classList.contains('right-item')) {
                // Deselect previous right item
                if (selectedRight) {
                    selectedRight.classList.remove('selected');
                }
                
                selectedRight = e.target;
                selectedRight.classList.add('selected');
                
                // Check for match if left item is selected
                if (selectedLeft) {
                    this.createMatch(selectedLeft, selectedRight);
                    selectedLeft = null;
                    selectedRight = null;
                }
            }
        });
    }
    
    createMatch(leftItem, rightItem) {
        leftItem.classList.add('matched');
        rightItem.classList.add('matched');
        leftItem.classList.remove('selected');
        rightItem.classList.remove('selected');
        
        // Store the match
        leftItem.dataset.matchedWith = rightItem.dataset.id;
        rightItem.dataset.matchedWith = leftItem.dataset.id;
        
        this.checkSubmitButton();
    }
    
    setupFillInTheBlank() {
        // Event listeners are added when rendering the question
    }
    
    selectAnswer(answerOption) {
        // Deselect all options
        const allOptions = document.querySelectorAll('.answer-option');
        allOptions.forEach(option => {
            option.classList.remove('selected');
            option.setAttribute('aria-checked', 'false');
        });
        
        // Select the clicked option
        answerOption.classList.add('selected');
        answerOption.setAttribute('aria-checked', 'true');
        
        this.checkSubmitButton();
    }
    
    checkSubmitButton() {
        const question = this.currentQuiz.questions[this.currentQuestion];
        let hasAnswer = false;
        
        switch (question.type) {
            case 'multiple-choice':
                hasAnswer = document.querySelector('.answer-option.selected') !== null;
                break;
            case 'drag-drop':
                const dropZones = document.querySelectorAll('.drop-zone .zone-content');
                hasAnswer = Array.from(dropZones).some(zone => zone.children.length > 0);
                break;
            case 'matching':
                const matchedItems = document.querySelectorAll('.match-item.matched');
                hasAnswer = matchedItems.length >= 2;
                break;
            case 'fill-blank':
                const input = document.querySelector('.blank-input');
                hasAnswer = input && input.value.trim() !== '';
                break;
        }
        
        this.elements.submitBtn.disabled = !hasAnswer;
    }
    
    submitAnswer() {
        const question = this.currentQuiz.questions[this.currentQuestion];
        const userAnswer = this.getUserAnswer(question);
        const isCorrect = this.checkAnswer(question, userAnswer);
        
        // Store the answer
        this.answers.push({
            question: question,
            userAnswer: userAnswer,
            isCorrect: isCorrect,
            timeSpent: Date.now() - this.startTime - this.timeSpent
        });
        
        // Show feedback
        this.showAnswerFeedback(question, isCorrect);
        
        // Update score
        this.updateScore();
        
        // Update UI
        this.elements.submitBtn.style.display = 'none';
        this.elements.nextBtn.style.display = 'inline-flex';
        
        // Play sound
        if (window.periodicTableApp && window.periodicTableApp.managers.audio) {
            window.periodicTableApp.managers.audio.playSound(isCorrect ? 'correct' : 'incorrect');
        }
    }
    
    getUserAnswer(question) {
        switch (question.type) {
            case 'multiple-choice':
                const selectedOption = document.querySelector('.answer-option.selected');
                return selectedOption ? selectedOption.querySelector('.option-text').textContent : null;
                
            case 'drag-drop':
                const result = {};
                const dropZones = document.querySelectorAll('.drop-zone');
                dropZones.forEach(zone => {
                    const category = zone.dataset.category;
                    const items = Array.from(zone.querySelectorAll('.draggable-item')).map(item => item.dataset.symbol);
                    result[category] = items;
                });
                return result;
                
            case 'matching':
                const matches = {};
                const leftItems = document.querySelectorAll('.left-item.matched');
                leftItems.forEach(item => {
                    matches[item.dataset.id] = item.dataset.matchedWith;
                });
                return matches;
                
            case 'fill-blank':
                const input = document.querySelector('.blank-input');
                return input ? input.value.trim() : '';
                
            default:
                return null;
        }
    }
    
    checkAnswer(question, userAnswer) {
        switch (question.type) {
            case 'multiple-choice':
                return userAnswer === question.correctAnswer;
                
            case 'drag-drop':
                return question.categories.every(category => {
                    const userItems = userAnswer[category.id] || [];
                    const correctItems = category.acceptedElements;
                    return this.arraysEqual(userItems.sort(), correctItems.sort());
                });
                
            case 'matching':
                return question.leftItems.every(leftItem => {
                    return userAnswer[leftItem.id] === leftItem.id;
                });
                
            case 'fill-blank':
                const correct = question.correctAnswer.toLowerCase();
                const user = userAnswer.toLowerCase();
                return correct === user || this.isCloseMatch(correct, user);
                
            default:
                return false;
        }
    }
    
    isCloseMatch(correct, user) {
        // Allow for minor spelling variations
        if (Math.abs(correct.length - user.length) > 2) return false;
        
        let differences = 0;
        const maxLength = Math.max(correct.length, user.length);
        
        for (let i = 0; i < maxLength; i++) {
            if (correct[i] !== user[i]) {
                differences++;
            }
        }
        
        return differences <= 1;
    }
    
    arraysEqual(a, b) {
        return a.length === b.length && a.every((val, index) => val === b[index]);
    }
    
    showAnswerFeedback(question, isCorrect) {
        const feedback = this.elements.feedback;
        const icon = document.getElementById('feedback-icon');
        const text = document.getElementById('feedback-text');
        const explanation = document.getElementById('feedback-explanation');
        
        icon.textContent = isCorrect ? '✅' : '❌';
        text.textContent = isCorrect ? 'Correct!' : 'Incorrect';
        explanation.textContent = question.explanation || '';
        
        feedback.style.display = 'block';
        
        // Highlight correct/incorrect answers
        this.highlightAnswers(question, isCorrect);
    }
    
    highlightAnswers(question, isCorrect) {
        switch (question.type) {
            case 'multiple-choice':
                const options = document.querySelectorAll('.answer-option');
                options.forEach(option => {
                    const optionText = option.querySelector('.option-text').textContent;
                    if (optionText === question.correctAnswer) {
                        option.classList.add('correct');
                    } else if (option.classList.contains('selected') && !isCorrect) {
                        option.classList.add('incorrect');
                    }
                });
                break;
                
            // Add highlighting for other question types as needed
        }
    }
    
    nextQuestion() {
        this.currentQuestion++;
        this.showQuestion();
    }
    
    showHint() {
        const question = this.currentQuiz.questions[this.currentQuestion];
        if (question.hint) {
            this.hintsUsed++;
            
            if (window.periodicTableApp) {
                window.periodicTableApp.showToast(`Hint: ${question.hint}`, 'info', 5000);
            }
        }
    }
    
    updateQuizHeader() {
        this.elements.questionCounter.textContent = this.currentQuestion + 1;
        this.elements.totalQuestions.textContent = this.currentQuiz.totalQuestions;
        this.elements.maxScore.textContent = this.currentQuiz.totalQuestions;
    }
    
    updateQuizProgress() {
        const progress = ((this.currentQuestion + 1) / this.currentQuiz.totalQuestions) * 100;
        this.elements.progressFill.style.width = `${progress}%`;
    }
    
    updateScore() {
        const correctAnswers = this.answers.filter(answer => answer.isCorrect).length;
        this.elements.score.textContent = correctAnswers;
    }
    
    resetQuizControls() {
        this.elements.submitBtn.style.display = 'inline-flex';
        this.elements.submitBtn.disabled = true;
        this.elements.nextBtn.style.display = 'none';
        this.elements.feedback.style.display = 'none';
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            if (!this.isPaused) {
                this.timeSpent += 1000;
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    pause() {
        this.isPaused = true;
    }
    
    resume() {
        this.isPaused = false;
    }
    
    endQuiz() {
        this.stopTimer();
        
        const results = this.getResults();
        
        // Navigate to results screen
        if (window.periodicTableApp) {
            window.periodicTableApp.showScreen('results');
        }
    }
    
    getResults() {
        const correctAnswers = this.answers.filter(answer => answer.isCorrect).length;
        const totalQuestions = this.answers.length;
        const score = Math.round((correctAnswers / totalQuestions) * 100);
        
        return {
            correct: correctAnswers,
            incorrect: totalQuestions - correctAnswers,
            total: totalQuestions,
            score: score,
            timeSpent: Math.floor(this.timeSpent / 1000),
            hintsUsed: this.hintsUsed,
            answers: this.answers
        };
    }
    
    showReview() {
        // Implementation for showing answer review
        console.log('Showing quiz review:', this.answers);
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

