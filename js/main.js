import { GameManager } from './game.js';
import { PlayerActions } from './player-actions.js';
import { DeckState, GameState, GamePhase } from './config.js';
import { UI } from './ui.js';
import { EffectManager } from './effects.js';
import { DeckManager } from './deck-manager.js';
import { MapManager } from './map-manager.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load game decks
        await GameManager.loadDecks();

        // Load rules (relative to index.html location)
        const rulesResponse = await fetch('rules.txt');
        const rulesText = await rulesResponse.text();
        document.getElementById('rules-text').textContent = rulesText;

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
    } catch (error) {
        console.error('Error during initialization:', error);
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