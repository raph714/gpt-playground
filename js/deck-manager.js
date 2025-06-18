import { GameState, GamePhase, DeckState, GameConfig } from './config.js';
import { UI } from './ui.js';
import { CardUtils } from './cards.js';
import { EffectManager } from './effects.js';

export class DeckManager {
    static async loadDecks() {
        const loadDeck = async (file, target) => {
            try {
                // Get the base URL from the current path
                const basePath = window.location.pathname.includes('/gpt-playground') ? '/gpt-playground/' : '/';
                const response = await fetch(basePath + file);
                const deck = await response.json();
                CardUtils.shuffle(deck);
                DeckState[target] = deck;
                UI.updateCounter(target, deck.length);
            } catch (err) {
                console.error(`Error loading deck ${file}:`, err);
                UI.showMessage(`Failed to load ${file}. Check console for details.`);
            }
        };

        await Promise.all([
            loadDeck('map.json', 'mapDeck'),
            loadDeck('people.json', 'peopleDeck'),
            loadDeck('items.json', 'itemsDeck'),
            loadDeck('actions.json', 'actionsDeck')
        ]);
    }

    static drawFromPlayerDeck(index) {
        const player = GameState.players[index];
        if (player.deck.length === 0) {
            if (player.discard.length === 0) return;
            player.deck = player.discard;
            CardUtils.shuffle(player.deck);
            player.discard = [];
            UI.updatePlayerInfo(player, index);
        }
        const card = player.deck.pop();
        player.hand.push(card);
        const area = GameState.handAreas[index];
        area.appendChild(CardUtils.createHandCardElement(card, index));
        UI.updatePlayerInfo(player, index);
    }

    static drawCard(deck, name) {
        if (deck.length === 0) return;
        if (GameState.turnPhase !== GamePhase.PLAYER_ACTIONS) return;
        if (GameState.actionsLeft <= 0) {
            UI.showMessage('No actions left! End your turn.');
            return;
        }
        const card = deck.pop();
        const area = GameState.handAreas[GameState.currentPlayerIndex];
        area.appendChild(CardUtils.createHandCardElement(card, GameState.currentPlayerIndex));
        UI.updateCounter(name, deck.length);

        const match = CardUtils.getCardText(card).match(/(-?\d+)\s*Detection/i);
        if (match) {
            EffectManager.adjustDetection(parseInt(match[1], 10));
        }
        GameState.actionsLeft--;
        UI.updateTurnInfo();
    }
}