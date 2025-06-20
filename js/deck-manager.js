import { GameState, GamePhase, DeckState, GameConfig } from './config.js';
import { UI } from './ui.js';
import { CardUtils } from './cards.js';
import { EffectManager } from './effects.js';

export class DeckManager {
    static async loadDecks() {
        const loadDeck = async (file, target) => {
            try {
                console.log(`Starting to load ${file}...`);
                const response = await fetch(file);
                console.log(`Fetch response for ${file}:`, response.status, response.statusText);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
                }
                
                const text = await response.text();
                console.log(`Received content for ${file}, length: ${text.length} chars`);
                console.log(`First 100 chars of ${file}:`, text.substring(0, 100));
                
                try {
                    const deck = JSON.parse(text);
                    console.log(`Successfully parsed ${file} JSON, array length: ${deck.length}`);
                    
                    if (!Array.isArray(deck)) {
                        throw new Error(`${file} content is not an array`);
                    }
                    
                    CardUtils.shuffle(deck);
                    DeckState[target] = deck;
                    UI.updateCounter(target, deck.length);
                    UI.showMessage(`Successfully loaded ${file} with ${deck.length} cards`);
                    console.log(`Fully loaded ${file} into ${target}`);
                } catch (parseError) {
                    console.error(`Failed to parse ${file}:`, parseError);
                    console.error('Content that failed to parse:', text);
                    UI.showMessage(`Failed to parse ${file}. Check console for details.`, true);
                }
            } catch (err) {
                console.error(`Failed to load ${file}:`, err);
                console.error(`URL attempted: ${new URL(file, window.location.href).href}`);
                UI.showMessage(`Failed to load ${file}. Check console for details.`, true);
            }
        };

        console.log('Starting to load all decks...');
        console.log('Current location:', window.location.href);
        
        await Promise.all([
            loadDeck('map.json', 'mapDeck'),
            loadDeck('people.json', 'peopleDeck'),
            loadDeck('items.json', 'itemsDeck'),
            loadDeck('actions.json', 'actionsDeck')
        ]);
        
        console.log('Final deck states:', {
            mapDeck: DeckState.mapDeck?.length || 0,
            peopleDeck: DeckState.peopleDeck?.length || 0,
            itemsDeck: DeckState.itemsDeck?.length || 0,
            actionsDeck: DeckState.actionsDeck?.length || 0
        });
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
        const player = GameState.players[GameState.currentPlayerIndex];
        player.hand.push(card);
        UI.updateCounter(name, deck.length);

        const match = CardUtils.getCardText(card).match(/(-?\d+)\s*Detection/i);
        if (match) {
            EffectManager.adjustDetection(parseInt(match[1], 10));
        }
        GameState.actionsLeft--;
        UI.updateTurnInfo();
    }
}