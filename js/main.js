import { GameManager } from './game.js';
import { PlayerActions } from './player-actions.js';
import { DeckState, GameState, GamePhase } from './config.js';
import { UI } from './ui.js';
import { EffectManager } from './effects.js';
import { DeckManager } from './deck-manager.js';
import { MapManager } from './map-manager.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        debugger; // This will pause execution in dev tools
        console.log('Starting game initialization...');
        UI.clearMessages(); // Clear any previous messages
        UI.showMessage('Game initialization starting...'); // Test message display

        // Load game decks first and wait for them to complete
        UI.showMessage('Loading game decks...');
        console.log('About to call DeckManager.loadDecks()');
        await DeckManager.loadDecks();
        console.log('Finished loading decks');

        // Verify all decks were loaded
        const deckStatus = {
            map: DeckState.mapDeck?.length || 0,
            people: DeckState.peopleDeck?.length || 0,
            items: DeckState.itemsDeck?.length || 0,
            actions: DeckState.actionsDeck?.length || 0
        };
        console.log('Deck loading status:', deckStatus);

        if (!DeckState.mapDeck.length && !DeckState.peopleDeck.length && 
            !DeckState.itemsDeck.length && !DeckState.actionsDeck.length) {
            UI.showMessage('Error: Failed to load any game decks. Check console for details.', true);
            return;
        }

        // Show which decks were loaded successfully
        console.log('Loaded decks:', {
            map: DeckState.mapDeck.length,
            people: DeckState.peopleDeck.length,
            items: DeckState.itemsDeck.length,
            actions: DeckState.actionsDeck.length
        });

        // Load rules
        try {
            const rulesResponse = await fetch('rules.txt');
            if (!rulesResponse.ok) {
                throw new Error(`HTTP error! status: ${rulesResponse.status}`);
            }
            const rulesText = await rulesResponse.text();
            document.getElementById('rules-text').textContent = rulesText;
        } catch (rulesError) {
            console.error('Failed to load rules:', rulesError);
            UI.showMessage('Warning: Failed to load rules text.', true);
        }

        // Setup detection counter controls
        document.getElementById('inc-detection').addEventListener('click', () => {
            EffectManager.adjustDetection(1);
        });

        document.getElementById('dec-detection').addEventListener('click', () => {
            EffectManager.adjustDetection(-1);
        });

        // Setup game start button
        document.getElementById('start-game').addEventListener('click', () => {
            if (GameManager.startGame()) {
                setupGameButtons();
            }
        });

        UI.showMessage('Game initialization completed successfully');
        console.log('Game initialization completed');
    } catch (error) {
        console.error('Critical error during initialization:', error);
        UI.showMessage('Critical error during game initialization. Check console for details.', true);
    }
});

function setupGameButtons() {
    // Setup end turn button
    document.getElementById('end-turn').addEventListener('click', () => {
        if (GameState.turnPhase === GamePhase.RESOLVE_MAP) return;
        GameManager.nextPlayer();
    });

    // Setup resolve action button
    document.getElementById('resolve-action').addEventListener('click', async () => {
        if (GameState.currentAction) {
            await GameState.currentAction.fn();
        }
        MapManager.nextAction();
    });

    // Setup deck draw buttons
    document.querySelector('[data-action="draw-person"]').addEventListener('click', () => 
        DeckManager.drawCard(DeckState.peopleDeck, 'people'));
    
    document.querySelector('[data-action="draw-item"]').addEventListener('click', () => 
        DeckManager.drawCard(DeckState.itemsDeck, 'items'));
    
    document.querySelector('[data-action="draw-action"]').addEventListener('click', () => 
        DeckManager.drawCard(DeckState.actionsDeck, 'actions'));

    // Setup play selected buttons for each player
    for (let i = 1; i <= 4; i++) {
        const area = document.getElementById(`player${i}-area`);
        const playBtn = document.createElement('button');
        playBtn.textContent = 'Play Selected';
        playBtn.className = 'btn btn-primary btn-sm mt-2';
        playBtn.addEventListener('click', () => PlayerActions.playSelectedCards(i - 1));
        area.appendChild(playBtn);
    }
}