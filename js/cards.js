// Card related utilities
export class CardUtils {
    static createPersonCardContent(card) {
        const parts = [];
        if (card.avoid) {
            if (card.avoid.cost) parts.push(`<div class="cost">${card.avoid.cost}</div>`);
            (card.avoid.effects || []).forEach(e => parts.push(`<div class="effect">${e.text}</div>`));
        }
        if (card.reward) {
            if (card.reward.cost) parts.push(`<div class="cost">${card.reward.cost}</div>`);
            (card.reward.effects || []).forEach(e => parts.push(`<div class="effect">${e.text}</div>`));
        }
        return parts;
    }

    static createRegularCardContent(card) {
        const parts = [];
        if (card.cost) {
            parts.push(`<div class="cost">${card.cost}</div>`);
        }
        const lines = card.effects 
            ? card.effects.map(e => e.text) 
            : (card.desc ? card.desc.split('<br>') : []);
        lines.forEach(l => parts.push(`<div class="effect">${l}</div>`));
        return parts;
    }

    static createCardElement(card) {
        const div = document.createElement('div');
        div.className = 'game-card';
        const parts = card.type === 'person' 
            ? this.createPersonCardContent(card) 
            : this.createRegularCardContent(card);
        div.innerHTML = `
            <div class="game-card-title">${card.name}</div>
            <div class="game-card-body">${parts.join('')}</div>
        `;
        return div;
    }

    static createHandCardElement(card, playerIdx) {
        const div = this.createCardElement(card);
        div.classList.add('selectable');
        div.setAttribute('data-card-index', playerIdx);
        div.addEventListener('click', () => {
            div.classList.toggle('selected');
        });
        return div;
    }

    static getCardText(card) {
        if (card.type === 'person') {
            const parts = [];
            if (card.avoid) {
                if (card.avoid.cost) parts.push(card.avoid.cost);
                if (card.avoid.effects) parts.push(...card.avoid.effects.map(e => e.text));
            }
            if (card.reward) {
                if (card.reward.cost) parts.push(card.reward.cost);
                if (card.reward.effects) parts.push(...card.reward.effects.map(e => e.text));
            }
            return parts.join(' ');
        }

        const parts = [];
        if (card.cost) parts.push(card.cost);
        if (card.effects) parts.push(...card.effects.map(e => e.text));
        if (card.desc) parts.push(card.desc);
        return parts.join(' ');
    }

    static getActionPointCost(cost) {
        if (!cost) return 0;
        const match = cost.match(/(\d+)\s*Action/i);
        return match ? parseInt(match[1], 10) : 0;
    }

    static shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
}