import { GameState } from './config.js';

export class UI {
    static show(elementId) {
        document.getElementById(elementId).style.display = 'block';
    }

    static hide(elementId) {
        document.getElementById(elementId).style.display = 'none';
    }

    static setText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) element.textContent = text;
    }

    static showMessage(text, isError = false) {
        const msgEl = document.getElementById('game-messages');
        if (!msgEl) return;
        const div = document.createElement('div');
        div.textContent = text;
        if (isError) div.style.color = '#dc3545'; // Bootstrap danger color
        msgEl.appendChild(div);
        // Auto-scroll to bottom
        msgEl.scrollTop = msgEl.scrollHeight;
    }

    static clearMessages() {
        const msgEl = document.getElementById('game-messages');
        if (msgEl) msgEl.innerHTML = '';
    }

    static showInstruction(text) {
        this.setText('prompt-instruction', text);
    }

    static clearInstruction() {
        this.setText('prompt-instruction', '');
    }

    static updateCounter(name, count) {
        this.setText(`${name}-count`, count);
    }

    static updateDetectionDisplay(value) {
        this.setText('detection-value', value);
    }

    static updatePlayerInfo(player, idx) {
        this.setText(`deck${idx+1}-count`, player.deck.length);
        this.setText(`discard${idx+1}-count`, player.discard.length);
        this.setText(`aff${idx+1}`, player.affiliation);
    }

    static updateTurnInfo() {
        if (GameState.players.length === 0) return;
        this.setText('current-player', GameState.players[GameState.currentPlayerIndex].name);
        this.setText('actions-left', GameState.actionsLeft);
        GameState.players.forEach((p, idx) => this.updatePlayerInfo(p, idx));
    }

    static async showConfirmDialog(message) {
        return new Promise(resolve => {
            const modalEl = document.getElementById('prompt-modal');
            this.setText('prompt-title', 'Confirm');
            this.setText('prompt-body', message);
            this.showInstruction(message);
            
            const footer = document.getElementById('prompt-footer');
            footer.innerHTML = '';
            
            const noBtn = document.createElement('button');
            noBtn.className = 'btn btn-secondary';
            noBtn.textContent = 'No';
            noBtn.onclick = () => {
                bootstrap.Modal.getInstance(modalEl).hide();
                this.clearInstruction();
                resolve(false);
            };
            
            const yesBtn = document.createElement('button');
            yesBtn.className = 'btn btn-primary';
            yesBtn.textContent = 'Yes';
            yesBtn.onclick = () => {
                bootstrap.Modal.getInstance(modalEl).hide();
                this.clearInstruction();
                resolve(true);
            };
            
            footer.appendChild(noBtn);
            footer.appendChild(yesBtn);
            bootstrap.Modal.getOrCreateInstance(modalEl).show();
        });
    }

    static async showCardSelectionDialog(title, cards) {
        return new Promise(resolve => {
            const modalEl = document.getElementById('prompt-modal');
            this.setText('prompt-title', title);
            const body = document.getElementById('prompt-body');
            body.innerHTML = '';
            this.showInstruction(title);
            
            cards.forEach((c, idx) => {
                const div = document.createElement('div');
                const chk = document.createElement('input');
                chk.type = 'checkbox';
                chk.id = 'sel' + idx;
                const label = document.createElement('label');
                label.setAttribute('for', 'sel' + idx);
                label.textContent = `${idx + 1}: ${c.name}`;
                div.appendChild(chk);
                div.appendChild(label);
                body.appendChild(div);
            });

            const footer = document.getElementById('prompt-footer');
            footer.innerHTML = '';
            
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn btn-secondary';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.onclick = () => {
                bootstrap.Modal.getInstance(modalEl).hide();
                this.clearInstruction();
                resolve(null);
            };

            const okBtn = document.createElement('button');
            okBtn.className = 'btn btn-primary';
            okBtn.textContent = 'Confirm';
            okBtn.onclick = () => {
                const selected = [];
                cards.forEach((_, idx) => {
                    if (document.getElementById('sel' + idx).checked) {
                        selected.push(idx);
                    }
                });
                bootstrap.Modal.getInstance(modalEl).hide();
                this.clearInstruction();
                resolve(selected);
            };

            footer.appendChild(cancelBtn);
            footer.appendChild(okBtn);
            bootstrap.Modal.getOrCreateInstance(modalEl).show();
        });
    }
}