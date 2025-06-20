import { GameState, GamePhase } from './config.js';
import { UI } from './ui.js';
import { CardUtils } from './cards.js';
import { EffectManager } from './effects.js';

export class PlayerActions {
    static async playSelectedCards(playerIdx) {
        if (!this.canPlayCards(playerIdx)) return;

        const player = GameState.players[playerIdx];
        const selectedElements = Array.from(document.querySelectorAll(`#player${playerIdx + 1}-area .game-card.selected`));
        if (selectedElements.length === 0) return;

        const { totalCost, cardsToPlay } = this.calculateCardCosts(player, selectedElements);

        if (totalCost > GameState.actionsLeft) {
            UI.showMessage('Not enough action points to play selected cards!');
            return;
        }

        await this.executeCardPlays(playerIdx, cardsToPlay);
    }

    static canPlayCards(playerIdx) {
        return playerIdx === GameState.currentPlayerIndex && 
               GameState.turnPhase === GamePhase.PLAYER_ACTIONS;
    }

    static calculateCardCosts(player, selectedElements) {
        let totalCost = 0;
        const cardsToPlay = [];

        selectedElements.forEach(element => {
            const cardIndex = Array.from(element.parentNode.children).indexOf(element);
            const card = player.hand[cardIndex];
            if (card) {
                totalCost += CardUtils.getActionPointCost(card.cost || '');
                cardsToPlay.push({ card, element, cardIndex });
            }
        });

        return { totalCost, cardsToPlay };
    }

    static async executeCardPlays(playerIdx, cardsToPlay) {
        for (const {card, element, cardIndex} of cardsToPlay) {
            GameState.actionsLeft -= CardUtils.getActionPointCost(card.cost || '');
            UI.updateTurnInfo();

            this.removeCardFromHand(playerIdx, cardIndex, element, card);
            await this.applyCardEffects(card, playerIdx);
        }

        UI.updatePlayerInfo(GameState.players[playerIdx], playerIdx);
        this.checkTurnEnd();
    }

    static removeCardFromHand(playerIdx, cardIndex, element, card) {
        const player = GameState.players[playerIdx];
        player.hand.splice(cardIndex, 1);
        element.remove();
        player.discard.push(card);
    }

    static async applyCardEffects(card, playerIdx) {
        const effects = card.effects || (card.desc.split('<br>').map(text => ({ id: 'custom', text })));
        for (const effect of effects) {
            EffectManager.runEffect(effect, playerIdx);
            if (GameState.currentAction) {
                await new Promise(resolve => {
                    const originalNextAction = GameState.nextAction;
                    GameState.nextAction = () => {
                        originalNextAction();
                        resolve();
                    };
                });
            }
        }
    }

    static checkTurnEnd() {
        if (GameState.actionsLeft <= 0) {
            UI.showMessage('No actions left! End your turn.');
            GameState.turnPhase = GamePhase.RESOLVE_MAP;
            GameState.nextAction();
        }
    }

    static async handlePersonCard(card) {
        const avoidCost = card.avoid && card.avoid.cost ? card.avoid.cost.trim() : '';
        const avoidEffects = (card.avoid && card.avoid.effects) ? card.avoid.effects : [];
        let avoidIdx = null;

        if (avoidCost) {
            avoidIdx = await this.askPlayersToPay(avoidCost);
        }
        
        if (avoidIdx === null) {
            avoidEffects.forEach(e => EffectManager.runEffect(e, GameState.currentPlayerIndex));
        }

        const rewardCost = card.reward && card.reward.cost ? card.reward.cost.trim() : '';
        const rewardEffects = (card.reward && card.reward.effects) ? card.reward.effects : [];
        let rewardIdx = null;

        if (rewardCost) {
            rewardIdx = await this.askPlayersToPay(rewardCost);
        }

        if (rewardIdx !== null) {
            rewardEffects.forEach(e => EffectManager.runEffect(e, rewardIdx));
        }
    }

    static async askPlayersToPay(cost) {
        for (let i = 0; i < GameState.players.length; i++) {
            const idx = (GameState.currentPlayerIndex + i) % GameState.players.length;
            const player = GameState.players[idx];
            
            const pay = await UI.showConfirmDialog(
                `${player.name}: Pay cost "${cost}"?`
            );

            if (pay) {
                if (player.hand.length === 0) {
                    UI.showMessage('No cards to use for payment.');
                    continue;
                }

                const selection = await this.selectCardsForPayment(player);
                if (selection === null) continue;

                const totalAP = this.calculateTotalActionPoints(player, selection);
                if (totalAP > GameState.actionsLeft) {
                    UI.showMessage('Not enough action points for selected cards.');
                    continue;
                }

                this.processPayment(player, idx, selection);
                return idx;
            }
        }
        return null;
    }

    static async selectCardsForPayment(player) {
        return await UI.showCardSelectionDialog('Select cards to discard to pay cost', player.hand);
    }

    static calculateTotalActionPoints(player, selection) {
        return selection.reduce((total, id) => {
            const card = player.hand[id];
            return total + (card ? CardUtils.getActionPointCost(card.cost || CardUtils.getCardText(card)) : 0);
        }, 0);
    }

    static processPayment(player, playerIdx, selection) {
        selection.sort((a, b) => b - a).forEach(id => {
            const card = player.hand.splice(id, 1)[0];
            player.discard.push(card);
            GameState.actionsLeft -= CardUtils.getActionPointCost(card.cost || CardUtils.getCardText(card));
        });

        UI.updatePlayerInfo(player, playerIdx);
        UI.updateTurnInfo();
    }
}