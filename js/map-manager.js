import { GameState, GamePhase, DeckState, GameConfig } from './config.js';
import { UI } from './ui.js';
import { CardUtils } from './cards.js';
import { EffectManager } from './effects.js';

export class MapManager {
    static fillMapTray() {
        while (DeckState.mapTray.length < GameConfig.MAX_MAP_TRAY_SIZE && DeckState.mapDeck.length > 0) {
            DeckState.mapTray.push(DeckState.mapDeck.pop());
        }
        this.renderMapTray();
    }

    static renderMapTray() {
        const tray = document.getElementById('map-tray');
        tray.innerHTML = '';
        DeckState.mapTray.forEach((card, i) => {
            const div = CardUtils.createCardElement(card);
            div.classList.add('selectable');
            div.addEventListener('click', () => this.selectMapCard(i));
            tray.appendChild(div);
        });
        UI.updateCounter('map', DeckState.mapDeck.length);
    }

    static selectMapCard(index) {
        if (GameState.turnPhase !== GamePhase.CHOOSE_MAP) return;
        const card = DeckState.mapTray.splice(index, 1)[0];
        this.addMapToBoard(card);
        this.fillMapTray();
        EffectManager.parseEffects(card);
        GameState.turnPhase = GamePhase.RESOLVE_MAP;
        this.nextAction();
    }

    static addMapToBoard(card) {
        const board = document.getElementById('map-board');
        board.appendChild(CardUtils.createCardElement(card));
        const match = CardUtils.getCardText(card).match(/(-?\d+)\s*Detection/i);
        if (match) {
            EffectManager.adjustDetection(parseInt(match[1], 10));
        }
    }

    static nextAction() {
        if (GameState.actionQueue.length === 0) {
            GameState.currentAction = null;
            UI.hide('action-info');
            GameState.turnPhase = GamePhase.PLAYER_ACTIONS;
            UI.updateTurnInfo();
            return;
        }
        GameState.currentAction = GameState.actionQueue.shift();
        UI.setText('current-action', GameState.currentAction.text);
        UI.show('action-info');
    }
}