let detection = 0;
let mapDeck = [];
let peopleDeck = [];
let itemsDeck = [];
let actionsDeck = [];

let players = [];
let currentPlayerIndex = 0;
let actionsLeft = 3;

function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [arr[i],arr[j]]=[arr[j],arr[i]];
    }
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
    document.getElementById('current-player').textContent = players[currentPlayerIndex];
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
    const card=deck.pop();
    const area=document.getElementById(name+'-area');
    const div=document.createElement('div');
    div.className='card';
    div.innerHTML=`<strong>${card.name}</strong><br>${card.desc}`;
    area.prepend(div);
    updateCount(name,deck.length);

    const match = card.desc.match(/(-?\d+)\s*Detection/i);
    if(match){
        adjustDetection(parseInt(match[1],10));
    }
    actionsLeft--;
    updateTurnInfo();
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
        for(let i=1;i<=4;i++){
            const val = document.getElementById('player'+i).value.trim();
            if(val) players.push(val);
        }
        if(players.length === 0){
            alert('Enter at least one player');
            return;
        }
        document.getElementById('setup').style.display='none';
        document.getElementById('turn-info').style.display='block';
        currentPlayerIndex = 0;
        actionsLeft = 3;
        updateTurnInfo();
    });

    document.getElementById('end-turn').addEventListener('click',()=>{
        nextPlayer();
    });
    document.querySelector('[data-action="draw-map"]').addEventListener('click',()=>drawCard(mapDeck,'map'));
    document.querySelector('[data-action="draw-person"]').addEventListener('click',()=>drawCard(peopleDeck,'people'));
    document.querySelector('[data-action="draw-item"]').addEventListener('click',()=>drawCard(itemsDeck,'items'));
    document.querySelector('[data-action="draw-action"]').addEventListener('click',()=>drawCard(actionsDeck,'actions'));
});
