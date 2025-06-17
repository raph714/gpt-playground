let detection = 0;
let mapDeck = [];
let peopleDeck = [];
let itemsDeck = [];
let actionsDeck = [];

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

function drawCard(deck,name){
    if(deck.length===0) return;
    const card=deck.pop();
    const area=document.getElementById(name+'-area');
    const div=document.createElement('div');
    div.className='card';
    div.innerHTML=`<strong>${card.name}</strong><br>${card.desc}`;
    area.prepend(div);
    updateCount(name,deck.length);
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
        detection++; document.getElementById('detection-value').textContent=detection;
    });
    document.getElementById('dec-detection').addEventListener('click',()=>{
        if(detection>0) detection--; document.getElementById('detection-value').textContent=detection;
    });
    document.querySelector('[data-action="draw-map"]').addEventListener('click',()=>drawCard(mapDeck,'map'));
    document.querySelector('[data-action="draw-person"]').addEventListener('click',()=>drawCard(peopleDeck,'people'));
    document.querySelector('[data-action="draw-item"]').addEventListener('click',()=>drawCard(itemsDeck,'items'));
    document.querySelector('[data-action="draw-action"]').addEventListener('click',()=>drawCard(actionsDeck,'actions'));
});
