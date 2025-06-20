// Game state constants
export const GamePhase = {
    CHOOSE_MAP: 'chooseMap',
    RESOLVE_MAP: 'resolveMap',
    PLAYER_ACTIONS: 'playerActions'
};

// Game configuration
export const GameConfig = {
    STARTING_HAND_SIZE: 5,
    STARTING_ACTIONS: 3,
    MAX_DETECTION: 10,
    MAX_MAP_TRAY_SIZE: 3
};

// Player class
export class Player {
    constructor(name) {
        this.name = name;
        this.deck = [];
        this.hand = [];
        this.discard = [];
        this.affiliation = 0;
    }
}

// Initial game state
export const GameState = {
    detection: 0,
    currentPlayerIndex: 0,
    actionsLeft: GameConfig.STARTING_ACTIONS,
    turnPhase: GamePhase.CHOOSE_MAP,
    currentAction: null,
    players: [], // Array of Player objects
    actionQueue: []
};

// Starting deck configuration
export const startingDeck = [
    ...Array(5).fill({ name: 'Basic Distraction', desc: '1 Action Point<br>1 Distraction' }),
    ...Array(5).fill({ name: 'Basic Intimidation', desc: '1 Action Point<br>1 Intimidation' })
];

// Deck state
export const DeckState = {
    mapDeck: [],
    peopleDeck: [],
    itemsDeck: [],
    actionsDeck: [],
    mapTray: []
};