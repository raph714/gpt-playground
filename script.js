let detection = 0;
let mapDeck = [];
let peopleDeck = [];
let itemsDeck = [];
let actionsDeck = [];

const startingDeck = [];
for(let i=0;i<5;i++) startingDeck.push({name:'Basic Distraction', desc:'1 Action Point<br>1 Distraction'});
for(let i=0;i<5;i++) startingDeck.push({name:'Basic Intimidation', desc:'1 Action Point<br>1 Intimidation'});

let players = [];
let currentPlayerIndex = 0;
let actionsLeft = 3;
let handAreas = [];
let mapTray = [];
let actionQueue = [];
let currentAction = null;
let turnPhase = 'chooseMap';

function showMessage(text){
    const msgEl = document.getElementById('game-messages');
    if(!msgEl) return; // no UI element available
    const div = document.createElement('div');
    div.textContent = text;
    msgEl.appendChild(div);
}

function showInstruction(text){
    const el = document.getElementById('prompt-instruction');
    if(el) el.textContent = text;
}

function clearInstruction(){
    showInstruction('');
}

async function showConfirmUI(message){
    return new Promise(resolve=>{
        const modalEl = document.getElementById('prompt-modal');
        document.getElementById('prompt-title').textContent = 'Confirm';
        document.getElementById('prompt-body').textContent = message;
        showInstruction(message);
        const footer = document.getElementById('prompt-footer');
        footer.innerHTML = '';
        const noBtn = document.createElement('button');
        noBtn.className = 'btn btn-secondary';
        noBtn.textContent = 'No';
        noBtn.addEventListener('click',()=>{
            bootstrap.Modal.getInstance(modalEl).hide();
            clearInstruction();
            resolve(false);
        });
        const yesBtn = document.createElement('button');
        yesBtn.className = 'btn btn-primary';
        yesBtn.textContent = 'Yes';
        yesBtn.addEventListener('click',()=>{
            bootstrap.Modal.getInstance(modalEl).hide();
            clearInstruction();
            resolve(true);
        });
        footer.appendChild(noBtn);
        footer.appendChild(yesBtn);
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    });
}

async function showCardSelectionUI(title, cards){
    return new Promise(resolve=>{
        const modalEl = document.getElementById('prompt-modal');
        document.getElementById('prompt-title').textContent = title;
        const body = document.getElementById('prompt-body');
        body.innerHTML = '';
        showInstruction(title);
        cards.forEach((c, idx)=>{
            const div = document.createElement('div');
            const chk = document.createElement('input');
            chk.type = 'checkbox';
            chk.id = 'sel'+idx;
            const label = document.createElement('label');
            label.setAttribute('for','sel'+idx);
            label.textContent = `${idx+1}: ${c.name}`;
            div.appendChild(chk);
            div.appendChild(label);
            body.appendChild(div);
        });
        const footer = document.getElementById('prompt-footer');
        footer.innerHTML = '';
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click',()=>{
            bootstrap.Modal.getInstance(modalEl).hide();
            clearInstruction();
            resolve(null);
        });
        const okBtn = document.createElement('button');
        okBtn.className = 'btn btn-primary';
        okBtn.textContent = 'Confirm';
        okBtn.addEventListener('click',()=>{
            const selected = [];
            cards.forEach((_, idx)=>{
                if(document.getElementById('sel'+idx).checked) selected.push(idx);
            });
            bootstrap.Modal.getInstance(modalEl).hide();
            clearInstruction();
            resolve(selected);
        });
        footer.appendChild(cancelBtn);
        footer.appendChild(okBtn);
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    });
}

function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [arr[i],arr[j]]=[arr[j],arr[i]];
    }
}

function createCardElement(card){
    const div = document.createElement('div');
    div.className = 'game-card';
    if(card.type === 'person'){
        const parts = [];
        if(card.avoid){
            if(card.avoid.cost) parts.push(`<div class="cost">${card.avoid.cost}</div>`);
            (card.avoid.effects || []).forEach(e=>parts.push(`<div class="effect">${e.text}</div>`));
        }
        if(card.reward){
            if(card.reward.cost) parts.push(`<div class="cost">${card.reward.cost}</div>`);
            (card.reward.effects || []).forEach(e=>parts.push(`<div class="effect">${e.text}</div>`));
        }
        div.innerHTML = `<div class="game-card-title">${card.name}</div><div class="game-card-body">${parts.join('')}</div>`;
    } else {
        const parts = [];
        if(card.cost){
            parts.push(`<div class="cost">${card.cost}</div>`);
        }
        const lines = card.effects ? card.effects.map(e=>e.text) : (card.desc ? card.desc.split('<br>') : []);
        lines.forEach(l=>parts.push(`<div class="effect">${l}</div>`));
        div.innerHTML = `<div class="game-card-title">${card.name}</div><div class="game-card-body">${parts.join('')}</div>`;
    }
    return div;
}

function getCardText(card){
    if(card.type === 'person'){
        const parts = [];
        if(card.avoid){
            if(card.avoid.cost) parts.push(card.avoid.cost);
            if(card.avoid.effects) parts.push(...card.avoid.effects.map(e=>e.text));
        }
        if(card.reward){
            if(card.reward.cost) parts.push(card.reward.cost);
            if(card.reward.effects) parts.push(...card.reward.effects.map(e=>e.text));
        }
        return parts.join(' ');
    }
    const parts = [];
    if(card.cost) parts.push(card.cost);
    if(card.effects) parts.push(...card.effects.map(e=>e.text));
    if(card.desc) parts.push(card.desc);
    return parts.join(' ');
}

function getActionPointCost(cost){
    if(!cost) return 0;
    const m = cost.match(/(\d+)\s*Action/i);
    return m ? parseInt(m[1],10) : 0;
}

function createHandCardElement(card, playerIdx){
    const div = createCardElement(card);
    div.classList.add('selectable');
    div.addEventListener('click', () => playHandCard(playerIdx, card, div));
    return div;
}

function playHandCard(playerIdx, card, element){
    if(playerIdx !== currentPlayerIndex) return;
    if(turnPhase !== 'playerActions') return;
    const cost = getActionPointCost(card.cost || '');
    if(cost > actionsLeft){
        showMessage('Not enough action points!');
        return;
    }
    actionsLeft -= cost;
    updateTurnInfo();
    const p = players[playerIdx];
    const idx = p.hand.indexOf(card);
    if(idx !== -1) p.hand.splice(idx,1);
    element.remove();
    p.discard.push(card);
    updatePlayerDeckInfo(playerIdx);
    parseMapEffects(card);
    turnPhase = 'resolveMap';
    nextAction();
}

function loadDeck(file, target){
    fetch(file).then(r=>r.json()).then(deck=>{
        shuffle(deck);
        if(target==='map'){mapDeck=deck;updateCount('map',mapDeck.length);}
        if(target==='people'){peopleDeck=deck;updateCount('people',peopleDeck.length);}
        if(target==='items'){itemsDeck=deck;updateCount('items',itemsDeck.length);}
        if(target==='actions'){actionsDeck=deck;updateCount('actions',actionsDeck.length);}
    });
}

function updateCount(name,count){
    document.getElementById(name+'-count').textContent=count;
}

function adjustDetection(delta){
    detection += delta;
    if(detection < 0) detection = 0;
    document.getElementById('detection-value').textContent = detection;
    if(detection >= 10){
        showMessage('Detection reached 10! Game over.');
    }
}

function updateTurnInfo(){
    if(players.length === 0) return;
    document.getElementById('current-player').textContent = players[currentPlayerIndex].name;
    document.getElementById('actions-left').textContent = actionsLeft;
    players.forEach((p, idx)=>{
        document.getElementById('aff'+(idx+1)).textContent = p.affiliation;
        updatePlayerDeckInfo(idx);
    });
}

function updatePlayerDeckInfo(idx){
    const p = players[idx];
    document.getElementById('deck'+(idx+1)+'-count').textContent = p.deck.length;
    document.getElementById('discard'+(idx+1)+'-count').textContent = p.discard.length;
}

function nextPlayer(){
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    actionsLeft = 3;
    actionQueue = [];
    document.getElementById('action-info').style.display='none';
    fillMapTray();
    turnPhase = 'chooseMap';
    updateTurnInfo();
}

function drawCard(deck,name){
    if(deck.length===0) return;
    if(turnPhase !== 'playerActions') return;
    if(actionsLeft <= 0){
        showMessage('No actions left! End your turn.');
        return;
    }
    const card = deck.pop();
    const area = handAreas[currentPlayerIndex];
    area.appendChild(createHandCardElement(card, currentPlayerIndex));
    updateCount(name, deck.length);

    const match = getCardText(card).match(/(-?\d+)\s*Detection/i);
    if(match){
        adjustDetection(parseInt(match[1],10));
    }
    actionsLeft--;
    updateTurnInfo();
}

function drawFromPlayerDeck(index){
    const p = players[index];
    if(p.deck.length === 0){
        if(p.discard.length === 0) return;
        p.deck = p.discard;
        shuffle(p.deck);
        p.discard = [];
        updatePlayerDeckInfo(index);
    }
    const card = p.deck.pop();
    p.hand.push(card);
    const area = handAreas[index];
    area.appendChild(createHandCardElement(card, index));
    updatePlayerDeckInfo(index);
}

function renderMapTray(){
    const tray = document.getElementById('map-tray');
    tray.innerHTML = '';
    mapTray.forEach((card, i)=>{
        const div = createCardElement(card);
        div.classList.add('selectable');
        div.addEventListener('click', ()=>selectMapCard(i));
        tray.appendChild(div);
    });
    updateCount('map', mapDeck.length);
}

function fillMapTray(){
    while(mapTray.length < 3 && mapDeck.length > 0){
        mapTray.push(mapDeck.pop());
    }
    renderMapTray();
}

function selectMapCard(i){
    if(turnPhase !== 'chooseMap') return;
    const card = mapTray.splice(i,1)[0];
    addMapToBoard(card);
    fillMapTray();
    parseMapEffects(card);
    turnPhase = 'resolveMap';
    nextAction();
}

function addMapToBoard(card){
    const board = document.getElementById('map-board');
    board.appendChild(createCardElement(card));
    const match = getCardText(card).match(/(-?\d+)\s*Detection/i);
    if(match){
        adjustDetection(parseInt(match[1],10));
    }
}

function enqueueAction(text, fn){
    actionQueue.push({text, fn});
}

const effectHandlers = {
    detection: (e, idx) => enqueueAction(e.text, () => adjustDetection(e.amount)),
    affiliation: (e, idx) => enqueueAction(e.text, () => changeAffiliation(idx, e.amount)),
    draw: (e, idx) => enqueueAction(e.text, () => {
        for (let i = 0; i < e.amount; i++) drawFromPlayerDeck(idx);
    }),
    gain_action_point: (e) => enqueueAction(e.text, () => {
        actionsLeft += e.amount;
        updateTurnInfo();
    }),
    scry: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    flip: (e) => enqueueAction(e.text, () => flipPerson(e.amount)),
    draw_or_affiliation: () => enqueueAction('Draw 1 card or gain 1 affiliation', () => drawOrAffiliation()),
    gain_distraction: (e, idx) => enqueueAction(e.text, () => showMessage(`${players[idx].name} gains ${e.amount} Distraction`)),
    gain_intimidation: (e, idx) => enqueueAction(e.text, () => showMessage(`${players[idx].name} gains ${e.amount} Intimidation`)),
    gain_deception: (e, idx) => enqueueAction(e.text, () => showMessage(`${players[idx].name} gains ${e.amount} Deception`)),
    gain_bribery: (e, idx) => enqueueAction(e.text, () => showMessage(`${players[idx].name} gains ${e.amount} Bribery`)),
    gain_distraction_or_intimidation: (e, idx) => enqueueAction(e.text, () => showMessage(e.text)),
    gain_two_affiliation: (e, idx) => enqueueAction(e.text, () => changeAffiliation(idx, 2)),
    least_affiliation_gain: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    most_affiliation_draw: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    ignore_person_requirements: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    trigger_person_effect: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    trigger_map_card_effect: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    reduce_detection_draw_person: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    play_action_from_evidence: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    play_item_from_evidence: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    recover_from_discard: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    return_evidence: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    drop_item_draw_two: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    target_draw: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    bump_and_choice: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    discard_then_draw_all: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    discard_all: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    witness_penalty_discard: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    discard_item_optional_draw: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    discard_on_affiliation_reduce_detection: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    discard_reduce_detection_on_item_play: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    draw_then_discard_on_affiliation: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    pay_affiliation_reduce_detection_on_item_play: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    pay_affiliation_reduce_detection_on_ally: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    peek_item_into_hand: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    bottom_map_card: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    shuffle_evidence: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    pass_left: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    trade_cards_affiliation: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    trade_cards_with_players: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    each_gain_affiliation: (e) => enqueueAction(e.text, () => {
        players.forEach((p, idx) => changeAffiliation(idx, 1));
    }),
    advance_detection_all_gain_distraction: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    advance_detection_and_choice_on_discard: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    sacrifice_item_reduce_detection: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    sacrifice_top_to_evidence_reduce_detection: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    draw_on_item_play: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    target_draw_aff: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    turn_ally: (e) => enqueueAction(e.text, () => showMessage(e.text)),
    default: (e) => enqueueAction(e.text, () => showMessage(e.text))
};

function runEffect(effect, playerIdx){
    const handler = effectHandlers[effect.id] || effectHandlers.default;
    handler(effect, playerIdx);
}

async function askPlayersToPay(cost){
    for(let i=0;i<players.length;i++){
        const idx = (currentPlayerIndex + i) % players.length;
        const pay = await showConfirmUI(`${players[idx].name}: Pay cost "${cost}"?`);
        if(pay){
            const p = players[idx];
            if(p.hand.length===0){
                showMessage('No cards to use for payment.');
                continue;
            }
            const selection = await showCardSelectionUI('Select cards to discard to pay cost', p.hand);
            if(selection === null) continue;
            let totalAP = 0;
            selection.forEach(id=>{
                const card = p.hand[id];
                if(card) totalAP += getActionPointCost(card.cost || getCardText(card));
            });
            if(totalAP > actionsLeft){
                showMessage('Not enough action points for selected cards.');
                continue;
            }
            selection.sort((a,b)=>b-a).forEach(id=>{
                const card = p.hand.splice(id,1)[0];
                const area = handAreas[idx];
                if(area.children[id]) area.children[id].remove();
                p.discard.push(card);
                actionsLeft -= getActionPointCost(card.cost || getCardText(card));
            });
            updatePlayerDeckInfo(idx);
            updateTurnInfo();
            return idx;
        }
    }
    return null;
}

async function handlePersonCard(card){
    const avoidCost = card.avoid && card.avoid.cost ? card.avoid.cost.trim() : '';
    const avoidEffects = (card.avoid && card.avoid.effects) ? card.avoid.effects : [];
    let avoidIdx = null;
    if(avoidCost){
        avoidIdx = await askPlayersToPay(avoidCost);
    }
    if(avoidIdx === null){
        avoidEffects.forEach(e=>runEffect(e, currentPlayerIndex));
    }

    const rewardCost = card.reward && card.reward.cost ? card.reward.cost.trim() : '';
    const rewardEffects = (card.reward && card.reward.effects) ? card.reward.effects : [];
    let rewardIdx = null;
    if(rewardCost){
        rewardIdx = await askPlayersToPay(rewardCost);
    }
    if(rewardIdx !== null){
        rewardEffects.forEach(e=>runEffect(e, rewardIdx));
    }
}

function nextAction(){
    if(actionQueue.length === 0){
        currentAction = null;
        document.getElementById('action-info').style.display='none';
        turnPhase = 'playerActions';
        updateTurnInfo();
        return;
    }
    currentAction = actionQueue.shift();
    document.getElementById('current-action').textContent = currentAction.text;
    document.getElementById('action-info').style.display='block';
}

async function flipPerson(count){
    for(let c=0;c<count;c++){
        if(peopleDeck.length===0) return;
        const card = peopleDeck.pop();
        updateCount('people', peopleDeck.length);
        const slots = document.querySelectorAll('#person-slots .person-slot');
        for(const slot of slots){
            if(slot.childNodes.length===0){
                slot.appendChild(createCardElement(card));
                break;
            }
        }
        await handlePersonCard(card);
    }
}

function changeAffiliation(idx, amt){
    const p = players[idx];
    p.affiliation = (p.affiliation||0) + amt;
    if(p.affiliation < 0) p.affiliation = 0;
    updateTurnInfo();
}

async function drawOrAffiliation(){
    const chooseDraw = await showConfirmUI('Draw 1 card? (No = Gain 1 Affiliation)');
    if(chooseDraw){
        drawFromPlayerDeck(currentPlayerIndex);
    } else {
        changeAffiliation(currentPlayerIndex,1);
    }
}

function parseMapEffects(card){
    const effects = card.effects || (card.desc.split("<br>").map(t=>({id:"custom",text:t})));
    effects.forEach(e=>runEffect(e, currentPlayerIndex));
}

document.addEventListener('DOMContentLoaded',()=>{
    loadDeck('map.json','map');
    loadDeck('people.json','people');
    loadDeck('items.json','items');
    loadDeck('actions.json','actions');
    fetch('rules.txt').then(r=>r.text()).then(t=>{
        document.getElementById('rules-text').textContent=t;
    });
    document.getElementById('inc-detection').addEventListener('click',()=>{
        adjustDetection(1);
    });
    document.getElementById('dec-detection').addEventListener('click',()=>{
        adjustDetection(-1);
    });

    document.getElementById('start-game').addEventListener('click',()=>{
        players = [];
        handAreas = [];
        for(let i=1;i<=4;i++){
            const nameInput = document.getElementById('player'+i).value.trim();
            const area = document.getElementById('player'+i+'-area');
            if(nameInput){
                const deck = startingDeck.map(c=>({name:c.name, desc:c.desc}));
                shuffle(deck);
                const p = {name:nameInput, deck, discard:[], hand:[], affiliation:0};
                players.push(p);
                area.style.display = 'flex';
                area.querySelector('.player-name').textContent = nameInput;
                handAreas.push(area.querySelector('.hand'));
                area.querySelector('.affiliation').textContent = '0';
                updatePlayerDeckInfo(players.length-1);
            } else {
                area.style.display = 'none';
            }
        }
        if(players.length === 0){
            showMessage('Enter at least one player');
            return;
        }
        document.getElementById('setup').style.display='none';
        document.getElementById('turn-info').style.display='block';
        document.getElementById('board').style.display='grid';
        currentPlayerIndex = Math.floor(Math.random()*players.length);
        actionsLeft = 3;
        players.forEach((p,idx)=>{
            for(let d=0; d<5; d++) drawFromPlayerDeck(idx);
        });
        fillMapTray();
        turnPhase = 'chooseMap';
        updateTurnInfo();
    });

    document.getElementById('end-turn').addEventListener('click',()=>{
        if(turnPhase==='resolveMap') return;
        nextPlayer();
    });
    document.getElementById('resolve-action').addEventListener('click',async ()=>{
        if(currentAction){
            await currentAction.fn();
        }
        nextAction();
    });
    document.querySelector('[data-action="draw-person"]').addEventListener('click',()=>drawCard(peopleDeck,'people'));
    document.querySelector('[data-action="draw-item"]').addEventListener('click',()=>drawCard(itemsDeck,'items'));
    document.querySelector('[data-action="draw-action"]').addEventListener('click',()=>drawCard(actionsDeck,'actions'));
});
