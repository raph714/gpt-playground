import { GameState, GamePhase, GameConfig, DeckState, startingDeck } from './config.js';
import { UI } from './ui.js';
import { CardUtils } from './cards.js';
import { DeckManager } from './deck-manager.js';
import { MapManager } from './map-manager.js';

export class GameManager {
    static async loadDecks() {
        await DeckManager.loadDecks();
    }

    static initializePlayer(name) {
        const deck = structuredClone(startingDeck);
        CardUtils.shuffle(deck);
        return {
            name,
            deck,
            discard: [],
            hand: [],
            affiliation: 0
        };
    }

    static startGame() {
        GameState.players = [];

        // Initialize players
        for (let i = 1; i <= 4; i++) {
            const nameInput = document.getElementById(`player${i}`).value.trim();
            const area = document.getElementById(`player${i}-area`);

            if (nameInput) {
                const player = new Player(nameInput);
                player.deck = structuredClone(startingDeck);
                CardUtils.shuffle(player.deck);
                GameState.players.push(player);
                area.style.display = 'flex';
                area.querySelector('.player-name').textContent = nameInput;
                area.querySelector('.affiliation').textContent = '0';
                UI.updatePlayerInfo(player, GameState.players.length - 1);
            } else {
                area.style.display = 'none';
            }
        }

        if (GameState.players.length === 0) {
            UI.showMessage('Enter at least one player');
            return false;
        }

        // Setup game state
        UI.hide('setup');
        UI.show('turn-info');
        UI.show('board');
        GameState.currentPlayerIndex = Math.floor(Math.random() * GameState.players.length);
        GameState.actionsLeft = GameConfig.STARTING_ACTIONS;

        // Draw initial hands
        GameState.players.forEach(player => {
            for (let d = 0; d < GameConfig.STARTING_HAND_SIZE; d++) {
                const card = player.deck.pop();
                player.hand.push(card);
            }
        });

        MapManager.fillMapTray();
        GameState.turnPhase = GamePhase.CHOOSE_MAP;
        this.updateTurnInfo();
        return true;
    }

    static nextPlayer() {
        GameState.currentPlayerIndex = (GameState.currentPlayerIndex + 1) % GameState.players.length;
        GameState.actionsLeft = GameConfig.STARTING_ACTIONS;
        GameState.actionQueue = [];
        UI.hide('action-info');
        MapManager.fillMapTray();
        GameState.turnPhase = GamePhase.CHOOSE_MAP;
        this.updateTurnInfo();
    }

    static updateTurnInfo() {
        if (GameState.players.length === 0) return;
        UI.setText('current-player', GameState.players[GameState.currentPlayerIndex].name);
        UI.setText('actions-left', GameState.actionsLeft);
        GameState.players.forEach((p, idx) => UI.updatePlayerInfo(p, idx));
    }
}