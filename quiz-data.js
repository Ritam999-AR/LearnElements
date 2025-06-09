// Quiz Data - Contains quiz questions and templates for different question types

const QUIZ_TEMPLATES = {
    multipleChoice: {
        symbolToName: {
            question: "What is the name of the element with symbol '{symbol}'?",
            hint: "This element is in group {group} and period {period}.",
            explanation: "{symbol} is the symbol for {name}, which {use}."
        },
        nameToSymbol: {
            question: "What is the chemical symbol for {name}?",
            hint: "The symbol often comes from the element's name or its Latin name.",
            explanation: "The symbol for {name} is {symbol}."
        },
        atomicNumber: {
            question: "What is the atomic number of {name}?",
            hint: "The atomic number equals the number of protons in the nucleus.",
            explanation: "{name} has {atomicNumber} protons, so its atomic number is {atomicNumber}."
        },
        group: {
            question: "In which group is {name} located?",
            hint: "Groups are the vertical columns in the periodic table.",
            explanation: "{name} is in group {group} of the periodic table."
        },
        period: {
            question: "In which period is {name} located?",
            hint: "Periods are the horizontal rows in the periodic table.",
            explanation: "{name} is in period {period} of the periodic table."
        },
        category: {
            question: "What category does {name} belong to?",
            hint: "Consider the element's position and properties.",
            explanation: "{name} is classified as {category}."
        },
        state: {
            question: "What is the physical state of {name} at room temperature?",
            hint: "Consider the element's melting and boiling points.",
            explanation: "{name} is a {state} at room temperature."
        },
        discoverer: {
            question: "Who discovered {name}?",
            hint: "This scientist made the discovery in the {century}.",
            explanation: "{name} was discovered by {discoverer} in {discoveryYear}."
        },
        uses: {
            question: "What is {name} primarily used for?",
            hint: "Think about common applications of this element.",
            explanation: "{name} is primarily used for {primaryUse}."
        },
        properties: {
            question: "Which property is characteristic of {name}?",
            hint: "Consider the element's chemical and physical properties.",
            explanation: "{name} is known for {characteristicProperty}."
        }
    },
    
    fillInTheBlank: {
        electronConfig: {
            question: "The electron configuration of {name} is ______.",
            hint: "Follow the aufbau principle for electron filling.",
            explanation: "{name} has the electron configuration {electronConfig}."
        },
        atomicMass: {
            question: "The atomic mass of {name} is ______ u.",
            hint: "Atomic mass is usually close to the mass number.",
            explanation: "{name} has an atomic mass of {atomicMass} u."
        },
        meltingPoint: {
            question: "The melting point of {name} is ______ °C.",
            hint: "Consider whether this element is typically solid, liquid, or gas.",
            explanation: "{name} has a melting point of {meltingPoint} °C."
        },
        density: {
            question: "The density of {name} is ______ g/cm³.",
            hint: "Metals typically have higher densities than nonmetals.",
            explanation: "{name} has a density of {density} g/cm³."
        }
    },
    
    dragAndDrop: {
        categorySort: {
            question: "Drag each element to its correct category:",
            categories: [
                { id: 'alkali-metal', name: 'Alkali Metals' },
                { id: 'alkaline-earth-metal', name: 'Alkaline Earth Metals' },
                { id: 'transition-metal', name: 'Transition Metals' },
                { id: 'reactive-nonmetal', name: 'Reactive Nonmetals' },
                { id: 'noble-gas', name: 'Noble Gases' },
                { id: 'metalloid', name: 'Metalloids' }
            ],
            hint: "Consider the position of elements in the periodic table.",
            explanation: "Elements are classified based on their electron configuration and properties."
        },
        blockSort: {
            question: "Drag each element to its correct electron block:",
            categories: [
                { id: 's', name: 's-block' },
                { id: 'p', name: 'p-block' },
                { id: 'd', name: 'd-block' },
                { id: 'f', name: 'f-block' }
            ],
            hint: "The block depends on which subshell the outermost electrons occupy.",
            explanation: "Electron blocks are determined by the highest energy subshell being filled."
        },
        stateSort: {
            question: "Drag each element to its physical state at room temperature:",
            categories: [
                { id: 'solid', name: 'Solid' },
                { id: 'liquid', name: 'Liquid' },
                { id: 'gas', name: 'Gas' }
            ],
            hint: "Consider the melting and boiling points of the elements.",
            explanation: "Physical state depends on the element's melting and boiling points relative to room temperature."
        }
    },
    
    matching: {
        symbolName: {
            question: "Match each symbol with its element name:",
            hint: "Some symbols come from Latin names.",
            explanation: "Chemical symbols are standardized abbreviations for element names."
        },
        elementUse: {
            question: "Match each element with its primary use:",
            hint: "Think about common applications of these elements.",
            explanation: "Elements have various industrial and biological applications."
        },
        elementProperty: {
            question: "Match each element with its characteristic property:",
            hint: "Consider the unique properties that make each element useful.",
            explanation: "Each element has distinctive properties that determine its applications."
        },
        discovererElement: {
            question: "Match each element with its discoverer:",
            hint: "Some elements were discovered by famous scientists.",
            explanation: "Many elements were discovered through careful scientific investigation."
        }
    }
};

// Predefined quiz sets for each day
const DAILY_QUIZ_SETS = {
    1: {
        title: "Day 1: Basic Elements",
        description: "Test your knowledge of hydrogen, helium, and noble gases",
        questions: [
            {
                type: 'multiple-choice',
                template: 'symbolToName',
                element: 1, // Hydrogen
                difficulty: 'easy'
            },
            {
                type: 'multiple-choice',
                template: 'nameToSymbol',
                element: 2, // Helium
                difficulty: 'easy'
            },
            {
                type: 'fill-blank',
                template: 'electronConfig',
                element: 1,
                difficulty: 'medium'
            },
            {
                type: 'multiple-choice',
                template: 'category',
                element: 10, // Neon
                difficulty: 'easy'
            },
            {
                type: 'multiple-choice',
                template: 'atomicNumber',
                element: 18, // Argon
                difficulty: 'easy'
            }
        ]
    },
    
    2: {
        title: "Day 2: Reactive Metals",
        description: "Explore alkali and alkaline earth metals",
        questions: [
            {
                type: 'drag-drop',
                template: 'categorySort',
                elements: [3, 4, 11, 12, 19, 20], // Li, Be, Na, Mg, K, Ca
                difficulty: 'medium'
            },
            {
                type: 'multiple-choice',
                template: 'group',
                element: 3, // Lithium
                difficulty: 'easy'
            },
            {
                type: 'matching',
                template: 'symbolName',
                elements: [11, 12, 19, 20], // Na, Mg, K, Ca
                difficulty: 'medium'
            },
            {
                type: 'multiple-choice',
                template: 'properties',
                element: 11, // Sodium
                difficulty: 'medium'
            },
            {
                type: 'fill-blank',
                template: 'atomicMass',
                element: 12, // Magnesium
                difficulty: 'hard'
            }
        ]
    },
    
    3: {
        title: "Day 3: Life Elements",
        description: "Study carbon, nitrogen, oxygen and other essential elements",
        questions: [
            {
                type: 'multiple-choice',
                template: 'uses',
                element: 6, // Carbon
                difficulty: 'easy'
            },
            {
                type: 'multiple-choice',
                template: 'symbolToName',
                element: 7, // Nitrogen
                difficulty: 'easy'
            },
            {
                type: 'drag-drop',
                template: 'blockSort',
                elements: [5, 6, 7, 8, 9], // B, C, N, O, F
                difficulty: 'medium'
            },
            {
                type: 'matching',
                template: 'elementUse',
                elements: [6, 7, 8, 15, 16], // C, N, O, P, S
                difficulty: 'medium'
            },
            {
                type: 'multiple-choice',
                template: 'discoverer',
                element: 8, // Oxygen
                difficulty: 'hard'
            }
        ]
    },
    
    4: {
        title: "Day 4: Transition Metals",
        description: "Discover the colorful world of transition metals",
        questions: [
            {
                type: 'multiple-choice',
                template: 'category',
                element: 26, // Iron
                difficulty: 'easy'
            },
            {
                type: 'drag-drop',
                template: 'categorySort',
                elements: [21, 22, 23, 24, 25, 26], // Sc, Ti, V, Cr, Mn, Fe
                difficulty: 'medium'
            },
            {
                type: 'multiple-choice',
                template: 'uses',
                element: 29, // Copper
                difficulty: 'easy'
            },
            {
                type: 'matching',
                template: 'elementProperty',
                elements: [24, 26, 28, 29], // Cr, Fe, Ni, Cu
                difficulty: 'hard'
            },
            {
                type: 'fill-blank',
                template: 'electronConfig',
                element: 26, // Iron
                difficulty: 'hard'
            }
        ]
    },
    
    5: {
        title: "Day 5: Heavy Elements",
        description: "Explore larger atoms and their unique properties",
        questions: [
            {
                type: 'multiple-choice',
                template: 'period',
                element: 50, // Tin
                difficulty: 'medium'
            },
            {
                type: 'drag-drop',
                template: 'stateSort',
                elements: [31, 32, 35, 53], // Ga, Ge, Br, I
                difficulty: 'medium'
            },
            {
                type: 'multiple-choice',
                template: 'nameToSymbol',
                element: 82, // Lead
                difficulty: 'medium'
            },
            {
                type: 'matching',
                template: 'symbolName',
                elements: [49, 50, 51, 52], // In, Sn, Sb, Te
                difficulty: 'hard'
            },
            {
                type: 'multiple-choice',
                template: 'uses',
                element: 53, // Iodine
                difficulty: 'medium'
            }
        ]
    },
    
    6: {
        title: "Day 6: Rare Earth Elements",
        description: "Study lanthanides, actinides, and radioactive elements",
        questions: [
            {
                type: 'multiple-choice',
                template: 'category',
                element: 57, // Lanthanum
                difficulty: 'medium'
            },
            {
                type: 'drag-drop',
                template: 'blockSort',
                elements: [57, 58, 89, 90], // La, Ce, Ac, Th
                difficulty: 'hard'
            },
            {
                type: 'multiple-choice',
                template: 'discoverer',
                element: 92, // Uranium
                difficulty: 'hard'
            },
            {
                type: 'matching',
                template: 'elementUse',
                elements: [57, 60, 92, 94], // La, Nd, U, Pu
                difficulty: 'hard'
            },
            {
                type: 'multiple-choice',
                template: 'atomicNumber',
                element: 94, // Plutonium
                difficulty: 'medium'
            }
        ]
    },
    
    7: {
        title: "Final Challenge",
        description: "Comprehensive test of all 118 elements",
        questions: [] // Will be generated dynamically
    }
};

// Fun facts and interesting information for elements
const ELEMENT_FUN_FACTS = {
    1: [
        "Hydrogen is the most abundant element in the universe, making up about 75% of all matter",
        "A single gram of hydrogen contains about 600 billion trillion atoms",
        "Hydrogen was the first element to form after the Big Bang"
    ],
    2: [
        "Helium was first discovered in the Sun before it was found on Earth",
        "Helium is the only element that cannot be solidified at normal pressure",
        "Your voice becomes higher when you breathe helium because sound travels faster through it"
    ],
    6: [
        "Diamond and graphite are both pure carbon but have completely different properties",
        "Carbon forms more compounds than any other element",
        "All known life is based on carbon compounds"
    ],
    8: [
        "Oxygen makes up about 21% of Earth's atmosphere",
        "Liquid oxygen is magnetic and will stick to a magnet",
        "Oxygen is essential for combustion - fires cannot burn without it"
    ],
    26: [
        "Iron is the most abundant element on Earth by mass",
        "The red color of Mars comes from iron oxide (rust)",
        "Iron is essential for human blood - it's what makes blood red"
    ],
    79: [
        "Gold is so unreactive that it can be found in pure form in nature",
        "All the gold ever mined would fit in a cube about 20 meters on each side",
        "Gold is edible and is sometimes used in fancy foods and drinks"
    ]
};

// Question difficulty modifiers
const DIFFICULTY_MODIFIERS = {
    easy: {
        timeLimit: 30, // seconds
        hintsAllowed: 3,
        pointValue: 1
    },
    medium: {
        timeLimit: 20,
        hintsAllowed: 2,
        pointValue: 2
    },
    hard: {
        timeLimit: 15,
        hintsAllowed: 1,
        pointValue: 3
    }
};

// Achievement definitions
const ACHIEVEMENTS = {
    firstElement: {
        id: 'first-element',
        name: 'First Discovery',
        description: 'Learn about your first element',
        icon: '🔬',
        points: 10
    },
    perfectDay: {
        id: 'perfect-day',
        name: 'Perfect Day',
        description: 'Score 100% on a daily quiz',
        icon: '⭐',
        points: 50
    },
    speedLearner: {
        id: 'speed-learner',
        name: 'Speed Learner',
        description: 'Complete a quiz in under 2 minutes',
        icon: '⚡',
        points: 25
    },
    noHints: {
        id: 'no-hints',
        name: 'Independent Learner',
        description: 'Complete a quiz without using hints',
        icon: '🧠',
        points: 30
    },
    weekStreak: {
        id: 'week-streak',
        name: 'Week Warrior',
        description: 'Complete all 7 days of the challenge',
        icon: '🏆',
        points: 100
    },
    elementMaster: {
        id: 'element-master',
        name: 'Element Master',
        description: 'Learn about all 118 elements',
        icon: '👑',
        points: 200
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        QUIZ_TEMPLATES,
        DAILY_QUIZ_SETS,
        ELEMENT_FUN_FACTS,
        DIFFICULTY_MODIFIERS,
        ACHIEVEMENTS
    };
}

