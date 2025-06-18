import { GameState, GameConfig } from './config.js';
import { UI } from './ui.js';
import { DeckManager } from './deck-manager.js';

export class EffectManager {
    static enqueueAction(text, fn) {
        GameState.actionQueue.push({ text, fn });
    }

    static handlers = {
        detection: (e, idx) => this.enqueueAction(e.text, () => this.adjustDetection(e.amount)),
        affiliation: (e, idx) => this.enqueueAction(e.text, () => this.changeAffiliation(idx, e.amount)),
        draw: (e, idx) => this.enqueueAction(e.text, () => {
            for (let i = 0; i < e.amount; i++) DeckManager.drawFromPlayerDeck(idx);
        }),
        gain_action_point: (e) => this.enqueueAction(e.text, () => {
            GameState.actionsLeft += e.amount;
            UI.updateTurnInfo();
        }),
        // Basic handlers that just show messages
        scry: (e) => this.enqueueAction(e.text, () => UI.showMessage(e.text)),
        gain_distraction: (e, idx) => this.enqueueAction(e.text, () => 
            UI.showMessage(`${GameState.players[idx].name} gains ${e.amount} Distraction`)),
        gain_intimidation: (e, idx) => this.enqueueAction(e.text, () => 
            UI.showMessage(`${GameState.players[idx].name} gains ${e.amount} Intimidation`)),
        gain_deception: (e, idx) => this.enqueueAction(e.text, () => 
            UI.showMessage(`${GameState.players[idx].name} gains ${e.amount} Deception`)),
        gain_bribery: (e, idx) => this.enqueueAction(e.text, () => 
            UI.showMessage(`${GameState.players[idx].name} gains ${e.amount} Bribery`)),
        default: (e) => this.enqueueAction(e.text, () => UI.showMessage(e.text))
    };

    static runEffect(effect, playerIdx) {
        const handler = this.handlers[effect.id] || this.handlers.default;
        handler(effect, playerIdx);
    }

    static adjustDetection(delta) {
        GameState.detection += delta;
        if (GameState.detection < 0) GameState.detection = 0;
        UI.updateDetectionDisplay(GameState.detection);
        
        if (GameState.detection >= GameConfig.MAX_DETECTION) {
            UI.showMessage('Detection reached 10! Game over.');
        }
    }

    static changeAffiliation(idx, amt) {
        const player = GameState.players[idx];
        player.affiliation = (player.affiliation || 0) + amt;
        if (player.affiliation < 0) player.affiliation = 0;
        UI.updatePlayerInfo(player, idx);
    }

    static parseEffects(card) {
        const effects = card.effects || (card.desc.split("<br>").map(t => ({id: "custom", text: t})));
        effects.forEach(e => this.runEffect(e, GameState.currentPlayerIndex));
    }
}