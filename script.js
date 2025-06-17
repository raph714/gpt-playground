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

function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [arr[i],arr[j]]=[arr[j],arr[i]];
    }
}

function createCardElement(card){
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<div class="card-title">${card.name}</div><div class="card-body">${card.desc}</div>`;
    return div;
}

function parseDeck(text){
    return text.trim().split(/\n\s*\n/).map(chunk=>{
        const lines = chunk.trim().split(/\n/);
        return {name: lines[0], desc: lines.slice(1).join('<br>')};
    });
}

function loadDeck(file, target){
    fetch(file).then(r=>r.text()).then(text=>{
        const deck = parseDeck(text);
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
}

function nextPlayer(){
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    actionsLeft = 3;
    updateTurnInfo();
}

function drawCard(deck,name){
    if(deck.length===0) return;
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
    const card = mapTray.splice(i,1)[0];
    addMapToBoard(card);
    fillMapTray();
}

function addMapToBoard(card){
    const board = document.getElementById('map-board');
    board.appendChild(createCardElement(card));
    const match = card.desc.match(/(-?\d+)\s*Detection/i);
    if(match){
        adjustDetection(parseInt(match[1],10));
    }
}

document.addEventListener('DOMContentLoaded',()=>{
    loadDeck('map.txt','map');
    loadDeck('people.txt','people');
    loadDeck('items.txt','items');
    loadDeck('actions.txt','actions');
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
                const p = {name:nameInput, deck, discard:[], hand:[]};
                players.push(p);
                area.style.display = 'flex';
                area.querySelector('.player-name').textContent = nameInput;
                handAreas.push(area.querySelector('.hand'));
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
        updateTurnInfo();
    });

    document.getElementById('end-turn').addEventListener('click',()=>{
        nextPlayer();
    });
    document.querySelector('[data-action="draw-person"]').addEventListener('click',()=>drawCard(peopleDeck,'people'));
    document.querySelector('[data-action="draw-item"]').addEventListener('click',()=>drawCard(itemsDeck,'items'));
    document.querySelector('[data-action="draw-action"]').addEventListener('click',()=>drawCard(actionsDeck,'actions'));
});
