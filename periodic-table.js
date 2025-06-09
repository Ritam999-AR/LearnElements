// Periodic Table Manager - Handles the interactive periodic table display and interactions

class PeriodicTable {
    constructor() {
        this.container = document.querySelector('.periodic-table');
        this.currentView = 'standard';
        this.currentFilter = 'all';
        this.currentDay = 1;
        this.selectedElement = null;
        
        this.viewModes = {
            standard: 'Standard View',
            groups: 'Groups View',
            blocks: 'Blocks View',
            states: 'States View'
        };
        
        this.elementPositions = this.generateElementPositions();
    }
    
    async init() {
        this.setupEventListeners();
        console.log('Periodic Table initialized');
    }
    
    setupEventListeners() {
        // Element tile clicks
        this.container.addEventListener('click', (e) => {
            const elementTile = e.target.closest('.element-tile');
            if (elementTile && !elementTile.classList.contains('locked')) {
                const atomicNumber = parseInt(elementTile.dataset.atomicNumber);
                this.showElementDetail(ELEMENTS_DATA[atomicNumber]);
            }
        });
        
        // Element tile hover effects
        this.container.addEventListener('mouseenter', (e) => {
            const elementTile = e.target.closest('.element-tile');
            if (elementTile && !elementTile.classList.contains('locked')) {
                this.showElementPreview(elementTile);
            }
        }, true);
        
        this.container.addEventListener('mouseleave', (e) => {
            const elementTile = e.target.closest('.element-tile');
            if (elementTile) {
                this.hideElementPreview();
            }
        }, true);
    }
    
    generateElementPositions() {
        // Define the standard periodic table layout
        const positions = {};
        
        // Period 1
        positions[1] = { row: 1, col: 1 };   // H
        positions[2] = { row: 1, col: 18 };  // He
        
        // Period 2
        positions[3] = { row: 2, col: 1 };   // Li
        positions[4] = { row: 2, col: 2 };   // Be
        positions[5] = { row: 2, col: 13 };  // B
        positions[6] = { row: 2, col: 14 };  // C
        positions[7] = { row: 2, col: 15 };  // N
        positions[8] = { row: 2, col: 16 };  // O
        positions[9] = { row: 2, col: 17 };  // F
        positions[10] = { row: 2, col: 18 }; // Ne
        
        // Period 3
        positions[11] = { row: 3, col: 1 };  // Na
        positions[12] = { row: 3, col: 2 };  // Mg
        positions[13] = { row: 3, col: 13 }; // Al
        positions[14] = { row: 3, col: 14 }; // Si
        positions[15] = { row: 3, col: 15 }; // P
        positions[16] = { row: 3, col: 16 }; // S
        positions[17] = { row: 3, col: 17 }; // Cl
        positions[18] = { row: 3, col: 18 }; // Ar
        
        // Period 4
        for (let i = 19; i <= 36; i++) {
            positions[i] = { row: 4, col: i - 18 };
        }
        
        // Period 5
        for (let i = 37; i <= 54; i++) {
            positions[i] = { row: 5, col: i - 36 };
        }
        
        // Period 6 (excluding lanthanides)
        for (let i = 55; i <= 56; i++) {
            positions[i] = { row: 6, col: i - 54 };
        }
        positions[57] = { row: 6, col: 3 }; // La placeholder
        for (let i = 72; i <= 86; i++) {
            positions[i] = { row: 6, col: i - 68 };
        }
        
        // Period 7 (excluding actinides)
        for (let i = 87; i <= 88; i++) {
            positions[i] = { row: 7, col: i - 86 };
        }
        positions[89] = { row: 7, col: 3 }; // Ac placeholder
        for (let i = 104; i <= 118; i++) {
            positions[i] = { row: 7, col: i - 100 };
        }
        
        // Lanthanides (separate row)
        for (let i = 57; i <= 71; i++) {
            positions[i] = { row: 9, col: i - 54 };
        }
        
        // Actinides (separate row)
        for (let i = 89; i <= 103; i++) {
            positions[i] = { row: 10, col: i - 86 };
        }
        
        return positions;
    }
    
    render() {
        this.container.innerHTML = '';
        
        // Create grid structure
        this.container.style.gridTemplateRows = 'repeat(10, 1fr)';
        this.container.style.gridTemplateColumns = 'repeat(18, 1fr)';
        
        // Add all elements
        Object.values(ELEMENTS_DATA).forEach(element => {
            if (element && this.elementPositions[element.atomicNumber]) {
                const tile = this.createElementTile(element);
                this.container.appendChild(tile);
            }
        });
        
        // Add empty spaces and labels
        this.addPeriodicTableLabels();
        
        // Apply current view and filter
        this.applyView();
        this.applyFilter();
    }
    
    createElementTile(element) {
        const position = this.elementPositions[element.atomicNumber];
        const tile = document.createElement('div');
        
        tile.className = `element-tile ${element.category}`;
        tile.dataset.atomicNumber = element.atomicNumber;
        tile.dataset.symbol = element.symbol;
        tile.dataset.category = element.category;
        tile.dataset.group = element.group;
        tile.dataset.period = element.period;
        tile.dataset.block = element.block;
        tile.dataset.state = element.state;
        
        tile.style.gridRow = position.row;
        tile.style.gridColumn = position.col;
        
        // Check if element is unlocked
        const isUnlocked = element.dayUnlocked <= this.currentDay;
        if (!isUnlocked) {
            tile.classList.add('locked');
        }
        
        // Check if element is learned
        if (element.learned) {
            tile.classList.add('learned');
        }
        
        tile.innerHTML = `
            <div class="element-number">${element.atomicNumber}</div>
            <div class="element-symbol">${element.symbol}</div>
            <div class="element-name">${element.name}</div>
            <div class="element-mass">${element.atomicMass}</div>
        `;
        
        // Add accessibility attributes
        tile.setAttribute('role', 'button');
        tile.setAttribute('tabindex', isUnlocked ? '0' : '-1');
        tile.setAttribute('aria-label', `${element.name}, symbol ${element.symbol}, atomic number ${element.atomicNumber}`);
        
        if (!isUnlocked) {
            tile.setAttribute('aria-disabled', 'true');
            tile.setAttribute('title', `${element.name} - Unlocks on Day ${element.dayUnlocked}`);
        } else {
            tile.setAttribute('title', `${element.name} - Click for details`);
        }
        
        return tile;
    }
    
    addPeriodicTableLabels() {
        // Add group numbers
        for (let group = 1; group <= 18; group++) {
            const label = document.createElement('div');
            label.className = 'group-label';
            label.textContent = group;
            label.style.gridRow = '1';
            label.style.gridColumn = group;
            label.style.fontSize = '0.7rem';
            label.style.fontWeight = 'bold';
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.justifyContent = 'center';
            label.style.color = 'var(--text-secondary)';
            this.container.appendChild(label);
        }
        
        // Add period numbers
        for (let period = 1; period <= 7; period++) {
            const label = document.createElement('div');
            label.className = 'period-label';
            label.textContent = period;
            label.style.gridRow = period + 1;
            label.style.gridColumn = '1';
            label.style.fontSize = '0.7rem';
            label.style.fontWeight = 'bold';
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.justifyContent = 'center';
            label.style.color = 'var(--text-secondary)';
            this.container.appendChild(label);
        }
        
        // Add lanthanide and actinide labels
        const lanthanideLabel = document.createElement('div');
        lanthanideLabel.className = 'series-label';
        lanthanideLabel.textContent = 'Lanthanides';
        lanthanideLabel.style.gridRow = '9';
        lanthanideLabel.style.gridColumn = '1 / 3';
        lanthanideLabel.style.fontSize = '0.6rem';
        lanthanideLabel.style.fontWeight = 'bold';
        lanthanideLabel.style.display = 'flex';
        lanthanideLabel.style.alignItems = 'center';
        lanthanideLabel.style.justifyContent = 'center';
        lanthanideLabel.style.color = 'var(--text-secondary)';
        this.container.appendChild(lanthanideLabel);
        
        const actinideLabel = document.createElement('div');
        actinideLabel.className = 'series-label';
        actinideLabel.textContent = 'Actinides';
        actinideLabel.style.gridRow = '10';
        actinideLabel.style.gridColumn = '1 / 3';
        actinideLabel.style.fontSize = '0.6rem';
        actinideLabel.style.fontWeight = 'bold';
        actinideLabel.style.display = 'flex';
        actinideLabel.style.alignItems = 'center';
        actinideLabel.style.justifyContent = 'center';
        actinideLabel.style.color = 'var(--text-secondary)';
        this.container.appendChild(actinideLabel);
    }
    
    setView(viewMode) {
        this.currentView = viewMode;
        this.applyView();
    }
    
    applyView() {
        const tiles = this.container.querySelectorAll('.element-tile');
        
        // Reset all tiles
        tiles.forEach(tile => {
            tile.classList.remove('highlighted', 'dimmed');
        });
        
        switch (this.currentView) {
            case 'groups':
                this.applyGroupsView(tiles);
                break;
            case 'blocks':
                this.applyBlocksView(tiles);
                break;
            case 'states':
                this.applyStatesView(tiles);
                break;
            default:
                // Standard view - no special highlighting
                break;
        }
    }
    
    applyGroupsView(tiles) {
        // Highlight elements by group when hovered
        tiles.forEach(tile => {
            tile.addEventListener('mouseenter', () => {
                const group = tile.dataset.group;
                tiles.forEach(t => {
                    if (t.dataset.group === group) {
                        t.classList.add('highlighted');
                    } else {
                        t.classList.add('dimmed');
                    }
                });
            });
            
            tile.addEventListener('mouseleave', () => {
                tiles.forEach(t => {
                    t.classList.remove('highlighted', 'dimmed');
                });
            });
        });
    }
    
    applyBlocksView(tiles) {
        // Color code by electron blocks
        tiles.forEach(tile => {
            const block = tile.dataset.block;
            tile.classList.add(`block-${block}`);
        });
    }
    
    applyStatesView(tiles) {
        // Color code by physical state
        tiles.forEach(tile => {
            const state = tile.dataset.state;
            tile.classList.add(`state-${state}`);
        });
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        this.applyFilter();
    }
    
    applyFilter() {
        const tiles = this.container.querySelectorAll('.element-tile');
        
        tiles.forEach(tile => {
            let shouldShow = true;
            
            switch (this.currentFilter) {
                case 'unlocked':
                    shouldShow = !tile.classList.contains('locked');
                    break;
                case 'learned':
                    shouldShow = tile.classList.contains('learned');
                    break;
                case 'metals':
                    shouldShow = this.isMetalCategory(tile.dataset.category);
                    break;
                case 'nonmetals':
                    shouldShow = this.isNonmetalCategory(tile.dataset.category);
                    break;
                case 'metalloids':
                    shouldShow = tile.dataset.category === 'metalloid';
                    break;
                default:
                    shouldShow = true;
            }
            
            tile.style.display = shouldShow ? 'flex' : 'none';
        });
    }
    
    isMetalCategory(category) {
        const metalCategories = [
            'alkali-metal',
            'alkaline-earth-metal',
            'transition-metal',
            'post-transition-metal',
            'lanthanide',
            'actinide'
        ];
        return metalCategories.includes(category);
    }
    
    isNonmetalCategory(category) {
        const nonmetalCategories = [
            'reactive-nonmetal',
            'noble-gas'
        ];
        return nonmetalCategories.includes(category);
    }
    
    updateForCurrentDay(day) {
        this.currentDay = day;
        
        // Update element lock states
        const tiles = this.container.querySelectorAll('.element-tile');
        tiles.forEach(tile => {
            const atomicNumber = parseInt(tile.dataset.atomicNumber);
            const element = ELEMENTS_DATA[atomicNumber];
            
            if (element && element.dayUnlocked <= day) {
                tile.classList.remove('locked');
                tile.setAttribute('tabindex', '0');
                tile.setAttribute('aria-disabled', 'false');
                tile.setAttribute('title', `${element.name} - Click for details`);
            } else {
                tile.classList.add('locked');
                tile.setAttribute('tabindex', '-1');
                tile.setAttribute('aria-disabled', 'true');
                tile.setAttribute('title', `${element.name} - Unlocks on Day ${element.dayUnlocked}`);
            }
        });
        
        // Highlight current day's elements
        this.highlightCurrentDayElements(day);
    }
    
    highlightCurrentDayElements(day) {
        const tiles = this.container.querySelectorAll('.element-tile');
        
        tiles.forEach(tile => {
            const atomicNumber = parseInt(tile.dataset.atomicNumber);
            const element = ELEMENTS_DATA[atomicNumber];
            
            tile.classList.remove('current');
            
            if (element && element.dayUnlocked === day) {
                tile.classList.add('current');
            }
        });
    }
    
    showElementDetail(element) {
        if (!element) return;
        
        this.selectedElement = element;
        
        // Update modal content
        this.updateElementModal(element);
        
        // Open modal
        if (window.periodicTableApp) {
            window.periodicTableApp.openModal('element');
        }
        
        // Play sound
        if (window.periodicTableApp && window.periodicTableApp.managers.audio) {
            window.periodicTableApp.managers.audio.playSound('element-select');
        }
    }
    
    updateElementModal(element) {
        // Update element card
        document.getElementById('modal-element-number').textContent = element.atomicNumber;
        document.getElementById('modal-element-symbol').textContent = element.symbol;
        document.getElementById('modal-element-name').textContent = element.name;
        document.getElementById('modal-element-mass').textContent = element.atomicMass;
        
        // Update basic info tab
        document.getElementById('modal-group').textContent = element.group;
        document.getElementById('modal-period').textContent = element.period;
        document.getElementById('modal-block').textContent = element.block;
        document.getElementById('modal-category').textContent = this.formatCategory(element.category);
        document.getElementById('modal-electron-config').textContent = element.electronConfig;
        
        // Update physical properties tab
        document.getElementById('modal-state').textContent = this.capitalizeFirst(element.state);
        document.getElementById('modal-melting-point').textContent = element.meltingPoint ? `${element.meltingPoint}°C` : 'Unknown';
        document.getElementById('modal-boiling-point').textContent = element.boilingPoint ? `${element.boilingPoint}°C` : 'Unknown';
        document.getElementById('modal-density').textContent = element.density ? `${element.density} g/cm³` : 'Unknown';
        
        // Update chemical properties tab
        document.getElementById('modal-electronegativity').textContent = element.electronegativity || 'N/A';
        document.getElementById('modal-ionization').textContent = element.ionizationEnergy ? `${element.ionizationEnergy} kJ/mol` : 'Unknown';
        document.getElementById('modal-atomic-radius').textContent = element.atomicRadius ? `${element.atomicRadius} pm` : 'Unknown';
        document.getElementById('modal-oxidation-states').textContent = element.oxidationStates ? element.oxidationStates.join(', ') : 'Unknown';
        
        // Update uses tab
        document.getElementById('modal-uses').textContent = element.uses || 'No specific uses listed.';
        
        const funFactsList = document.getElementById('modal-fun-facts');
        funFactsList.innerHTML = '';
        if (element.funFacts && element.funFacts.length > 0) {
            element.funFacts.forEach(fact => {
                const li = document.createElement('li');
                li.textContent = fact;
                funFactsList.appendChild(li);
            });
        }
        
        // Update history tab
        document.getElementById('modal-discoverer').textContent = element.discoverer || 'Unknown';
        document.getElementById('modal-discovery-year').textContent = element.discoveryYear || 'Unknown';
        document.getElementById('modal-history').textContent = element.history || 'No historical information available.';
        
        // Update modal title
        document.getElementById('element-modal-title').textContent = `${element.name} (${element.symbol})`;
        
        // Apply element category color to modal header
        const modalCard = document.querySelector('.element-card-large');
        modalCard.className = `element-card-large ${element.category}`;
    }
    
    showElementPreview(tile) {
        // Create or update tooltip
        let tooltip = document.getElementById('element-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'element-tooltip';
            tooltip.className = 'element-tooltip';
            document.body.appendChild(tooltip);
        }
        
        const atomicNumber = parseInt(tile.dataset.atomicNumber);
        const element = ELEMENTS_DATA[atomicNumber];
        
        if (element) {
            tooltip.innerHTML = `
                <div class="tooltip-header">
                    <span class="tooltip-symbol">${element.symbol}</span>
                    <span class="tooltip-number">${element.atomicNumber}</span>
                </div>
                <div class="tooltip-name">${element.name}</div>
                <div class="tooltip-mass">${element.atomicMass}</div>
                <div class="tooltip-category">${this.formatCategory(element.category)}</div>
            `;
            
            // Position tooltip
            const rect = tile.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2}px`;
            tooltip.style.top = `${rect.top - 10}px`;
            tooltip.style.transform = 'translate(-50%, -100%)';
            tooltip.style.display = 'block';
        }
    }
    
    hideElementPreview() {
        const tooltip = document.getElementById('element-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }
    
    markElementAsLearned(atomicNumber) {
        const element = ELEMENTS_DATA[atomicNumber];
        if (element) {
            element.learned = true;
            
            const tile = this.container.querySelector(`[data-atomic-number="${atomicNumber}"]`);
            if (tile) {
                tile.classList.add('learned');
            }
        }
    }
    
    getUnlockedElements() {
        return Object.values(ELEMENTS_DATA).filter(element => 
            element.dayUnlocked <= this.currentDay
        );
    }
    
    getLearnedElements() {
        return Object.values(ELEMENTS_DATA).filter(element => element.learned);
    }
    
    formatCategory(category) {
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    handleResize() {
        // Adjust table layout for different screen sizes
        const containerWidth = this.container.offsetWidth;
        
        if (containerWidth < 600) {
            this.container.style.fontSize = '8px';
        } else if (containerWidth < 900) {
            this.container.style.fontSize = '10px';
        } else {
            this.container.style.fontSize = '12px';
        }
    }
    
    // Animation methods
    animateElementDiscovery(atomicNumber) {
        const tile = this.container.querySelector(`[data-atomic-number="${atomicNumber}"]`);
        if (tile) {
            tile.classList.add('discovering');
            
            setTimeout(() => {
                tile.classList.remove('discovering');
                tile.classList.add('discovered');
            }, 1000);
        }
    }
    
    highlightElementGroup(group) {
        const tiles = this.container.querySelectorAll(`[data-group="${group}"]`);
        tiles.forEach(tile => {
            tile.classList.add('group-highlighted');
        });
        
        setTimeout(() => {
            tiles.forEach(tile => {
                tile.classList.remove('group-highlighted');
            });
        }, 3000);
    }
    
    // Search functionality
    searchElement(query) {
        const results = [];
        const searchTerm = query.toLowerCase();
        
        Object.values(ELEMENTS_DATA).forEach(element => {
            if (
                element.name.toLowerCase().includes(searchTerm) ||
                element.symbol.toLowerCase().includes(searchTerm) ||
                element.atomicNumber.toString() === searchTerm
            ) {
                results.push(element);
            }
        });
        
        return results;
    }
    
    focusElement(atomicNumber) {
        const tile = this.container.querySelector(`[data-atomic-number="${atomicNumber}"]`);
        if (tile) {
            tile.scrollIntoView({ behavior: 'smooth', block: 'center' });
            tile.classList.add('focused');
            
            setTimeout(() => {
                tile.classList.remove('focused');
            }, 2000);
        }
    }
}

// Add CSS for tooltip and animations
const periodicTableStyles = document.createElement('style');
periodicTableStyles.textContent = `
    .element-tooltip {
        position: fixed;
        background: var(--bg-overlay);
        backdrop-filter: blur(10px);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-lg);
        padding: var(--spacing-md);
        box-shadow: var(--shadow-lg);
        z-index: var(--z-tooltip);
        pointer-events: none;
        font-size: var(--font-size-sm);
        min-width: 120px;
        text-align: center;
    }
    
    .tooltip-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-xs);
    }
    
    .tooltip-symbol {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--primary-color);
    }
    
    .tooltip-number {
        font-size: var(--font-size-xs);
        color: var(--text-secondary);
    }
    
    .tooltip-name {
        font-weight: var(--font-weight-semibold);
        margin-bottom: var(--spacing-xs);
    }
    
    .tooltip-mass {
        font-size: var(--font-size-xs);
        color: var(--text-secondary);
        margin-bottom: var(--spacing-xs);
    }
    
    .tooltip-category {
        font-size: var(--font-size-xs);
        color: var(--primary-color);
        font-weight: var(--font-weight-medium);
    }
    
    .element-tile.discovering {
        animation: elementDiscovery 1s ease-in-out;
    }
    
    .element-tile.discovered {
        animation: elementDiscovered 0.5s ease-out;
    }
    
    .element-tile.group-highlighted {
        animation: groupHighlight 3s ease-in-out;
    }
    
    .element-tile.focused {
        animation: elementFocus 2s ease-in-out;
    }
    
    @keyframes elementDiscovery {
        0% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.2); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
    }
    
    @keyframes elementDiscovered {
        0% { box-shadow: 0 0 0 0 var(--success-color); }
        100% { box-shadow: 0 0 0 20px transparent; }
    }
    
    @keyframes groupHighlight {
        0%, 100% { background-color: inherit; }
        50% { background-color: rgba(99, 102, 241, 0.3); }
    }
    
    @keyframes elementFocus {
        0%, 100% { box-shadow: var(--shadow-md); }
        50% { box-shadow: 0 0 20px var(--primary-color); }
    }
    
    /* Block view styles */
    .element-tile.block-s { border-left: 4px solid #ff6b6b; }
    .element-tile.block-p { border-left: 4px solid #4ecdc4; }
    .element-tile.block-d { border-left: 4px solid #45b7d1; }
    .element-tile.block-f { border-left: 4px solid #f9ca24; }
    
    /* State view styles */
    .element-tile.state-solid { background-color: rgba(76, 175, 80, 0.1); }
    .element-tile.state-liquid { background-color: rgba(33, 150, 243, 0.1); }
    .element-tile.state-gas { background-color: rgba(255, 193, 7, 0.1); }
    .element-tile.state-unknown { background-color: rgba(158, 158, 158, 0.1); }
`;
document.head.appendChild(periodicTableStyles);

