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

function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [arr[i],arr[j]]=[arr[j],arr[i]];
    }
}

function createCardElement(card){
    const div = document.createElement('div');
    div.className = 'card';
    if(card.type === 'person'){
        const body = [
            `<div class="cost">${card.cost1}</div>`,
            `<div class="effect">${card.effect1}</div>`,
            `<div class="cost">${card.cost2}</div>`,
            `<div class="effect">${card.effect2}</div>`
        ].join('');
        div.innerHTML = `<div class="card-title">${card.name}</div><div class="card-body">${body}</div>`;
    } else {
        const desc = card.effects ? card.effects.join('<br>') : card.desc;
        div.innerHTML = `<div class="card-title">${card.name}</div><div class="card-body">${desc}</div>`;
    }
    return div;
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
        alert('Detection reached 10! Game over.');
    }
}

function updateTurnInfo(){
    if(players.length === 0) return;
    document.getElementById('current-player').textContent = players[currentPlayerIndex].name;
    document.getElementById('actions-left').textContent = actionsLeft;
    players.forEach((p, idx)=>{
        document.getElementById('aff'+(idx+1)).textContent = p.affiliation;
    });
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
        alert('No actions left! End your turn.');
        return;
    }
    const card = deck.pop();
    const area = handAreas[currentPlayerIndex];
    area.appendChild(createCardElement(card));
    updateCount(name, deck.length);

    const match = card.desc.match(/(-?\d+)\s*Detection/i);
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
    }
    const card = p.deck.pop();
    p.hand.push(card);
    const area = handAreas[index];
    area.appendChild(createCardElement(card));
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
    const text = card.effects ? card.effects.join('<br>') : card.desc;
    const match = text.match(/(-?\d+)\s*Detection/i);
    if(match){
        adjustDetection(parseInt(match[1],10));
    }
}

function enqueueAction(text, fn){
    actionQueue.push({text, fn});
}

function parsePersonEffect(line, playerIdx){
    let m;
    if((m=line.match(/(-?\d+)\s*Detection/i))){
        const n=parseInt(m[1],10);
        enqueueAction(line, ()=>adjustDetection(n));
    } else if((m=line.match(/Gain\s*(\d+)\s*Affiliation/i))){
        const n=parseInt(m[1],10);
        enqueueAction(line, ()=>changeAffiliation(playerIdx,n));
    } else if(/Gain\s*an?\s*Affiliation/i.test(line)){
        enqueueAction(line, ()=>changeAffiliation(playerIdx,1));
    } else if((m=line.match(/Lose\s*(\d+)\s*Affiliation/i))){
        const n=parseInt(m[1],10);
        enqueueAction(line, ()=>changeAffiliation(playerIdx,-n));
    } else if((m=line.match(/Draw\s*(\d+)/i))){
        const n=parseInt(m[1],10);
        enqueueAction(line, ()=>{for(let i=0;i<n;i++) drawFromPlayerDeck(playerIdx);});
    } else if(/discard/i.test(line)){
        enqueueAction(line, ()=>alert(line));
    } else {
        enqueueAction(line, ()=>alert(line));
    }
}

function askPlayersToPay(cost){
    for(let i=0;i<players.length;i++){
        const idx = (currentPlayerIndex + i) % players.length;
        if(confirm(`${players[idx].name}: Pay cost "${cost}"?`)){
            return idx;
        }
    }
    return null;
}

function handlePersonCard(card){
    const avoidIdx = askPlayersToPay(card.cost1);
    if(avoidIdx === null){
        parsePersonEffect(card.effect1, currentPlayerIndex);
    }
    const rewardIdx = askPlayersToPay(card.cost2);
    if(rewardIdx !== null){
        parsePersonEffect(card.effect2, rewardIdx);
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

function flipPerson(count){
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
        handlePersonCard(card);
    }
}

function changeAffiliation(idx, amt){
    const p = players[idx];
    p.affiliation = (p.affiliation||0) + amt;
    if(p.affiliation < 0) p.affiliation = 0;
    updateTurnInfo();
}

function drawOrAffiliation(){
    if(confirm('OK = Draw 1 card, Cancel = Gain 1 Affiliation')){
        drawFromPlayerDeck(currentPlayerIndex);
    }else{
        changeAffiliation(currentPlayerIndex,1);
    }
}

function parseMapEffects(card){
    const lines = (card.effects || card.desc.split('<br>')).map(l=>l.trim()).filter(l=>l);
    lines.forEach(line=>{
        let m;
        if((m=line.match(/Flip\s*(\d+)/i))){
            const n=parseInt(m[1],10);
            enqueueAction(line,()=>flipPerson(n));
        }else if(/Draw\s*1\s*or\s*Gain\s*1\s*Affiliation/i.test(line)){
            enqueueAction(line,()=>drawOrAffiliation());
        }else if((m=line.match(/Gain\s*(\d+)\s*Affiliation/i))||(m=line.match(/Get\s*(\d+)\s*Affiliation/i))){
            const n=parseInt(m[1],10);
            enqueueAction(line,()=>changeAffiliation(currentPlayerIndex,n));
        }else if((m=line.match(/Draw\s*(\d+)/i))){
            const n=parseInt(m[1],10);
            enqueueAction(line,()=>{for(let i=0;i<n;i++) drawFromPlayerDeck(currentPlayerIndex);});
        }else{
            enqueueAction(line,()=>alert(line));
        }
    });
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
            } else {
                area.style.display = 'none';
            }
        }
        if(players.length === 0){
            alert('Enter at least one player');
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
    document.getElementById('resolve-action').addEventListener('click',()=>{
        if(currentAction){
            currentAction.fn();
        }
        nextAction();
    });
    document.querySelector('[data-action="draw-person"]').addEventListener('click',()=>drawCard(peopleDeck,'people'));
    document.querySelector('[data-action="draw-item"]').addEventListener('click',()=>drawCard(itemsDeck,'items'));
    document.querySelector('[data-action="draw-action"]').addEventListener('click',()=>drawCard(actionsDeck,'actions'));
});
