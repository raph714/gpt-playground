document.addEventListener('DOMContentLoaded', () => {
    const cardData = {
        Copper: { cost: 0, coins: 1 },
        Silver: { cost: 3, coins: 2 },
        Gold: { cost: 6, coins: 3 },
        Estate: { cost: 2, vp: 1 },
        Province: { cost: 8, vp: 6 }
    };

    let deck = [];
    let discard = [];
    let hand = [];
    let coins = 0;
    let turn = 0;
    let bought = false;

    const newGameBtn = document.getElementById('newGame');
    const gameArea = document.getElementById('gameArea');
    const handDiv = document.getElementById('hand');
    const marketDiv = document.getElementById('marketCards');
    const deckCount = document.getElementById('deckCount');
    const discardCount = document.getElementById('discardCount');
    const coinCount = document.getElementById('coinCount');
    const turnNumber = document.getElementById('turnNumber');
    const message = document.getElementById('message');
    const endTurnBtn = document.getElementById('endTurn');

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function draw(n) {
        for (let i = 0; i < n; i++) {
            if (deck.length === 0) {
                deck = discard;
                discard = [];
                shuffle(deck);
            }
            if (deck.length === 0) return;
            hand.push(deck.pop());
        }
    }

    function countCoins() {
        coins = hand.reduce((sum, card) => sum + (cardData[card].coins || 0), 0);
    }

    function updateDisplay() {
        deckCount.textContent = deck.length;
        discardCount.textContent = discard.length;
        coinCount.textContent = coins;
        turnNumber.textContent = turn;
        handDiv.innerHTML = '';
        hand.forEach(c => {
            const div = document.createElement('div');
            div.className = 'card';
            div.textContent = c;
            handDiv.appendChild(div);
        });
    }

    function setupMarket() {
        marketDiv.innerHTML = '';
        Object.keys(cardData).forEach(name => {
            const data = cardData[name];
            const btn = document.createElement('button');
            btn.textContent = `Buy ${name} (${data.cost})`;
            btn.addEventListener('click', () => buyCard(name));
            marketDiv.appendChild(btn);
        });
    }

    function startGame() {
        deck = [];
        discard = [];
        hand = [];
        coins = 0;
        turn = 1;
        bought = false;
        for (let i = 0; i < 7; i++) deck.push('Copper');
        for (let i = 0; i < 3; i++) deck.push('Estate');
        shuffle(deck);
        draw(5);
        countCoins();
        setupMarket();
        gameArea.classList.remove('hidden');
        updateDisplay();
        message.textContent = '';
    }

    function buyCard(name) {
        if (bought) {
            message.textContent = 'You already bought a card this turn.';
            return;
        }
        const cost = cardData[name].cost;
        if (coins < cost) {
            message.textContent = 'Not enough coins.';
            return;
        }
        coins -= cost;
        discard.push(name);
        bought = true;
        message.textContent = `Bought ${name}!`;
        updateDisplay();
    }

    function endTurn() {
        discard = discard.concat(hand);
        hand = [];
        bought = false;
        draw(5);
        countCoins();
        turn++;
        updateDisplay();
        message.textContent = '';
    }

    newGameBtn.addEventListener('click', startGame);
    endTurnBtn.addEventListener('click', endTurn);
});
