document.addEventListener('DOMContentLoaded', () => {
    const cardData = {
        Copper: {
            cost: 0,
            coins: 1,
            description: 'Basic currency worth 1 coin.'
        },
        Silver: {
            cost: 3,
            coins: 2,
            description: 'Provides 2 coins.'
        },
        Gold: {
            cost: 6,
            coins: 3,
            description: 'Provides 3 coins.'
        },
        Estate: {
            cost: 2,
            vp: 1,
            description: 'Worth 1 victory point.'
        },
        Province: {
            cost: 8,
            vp: 6,
            description: 'Worth 6 victory points.'
        }
    };

    let deck = [];
    let discard = [];
    let hand = [];
    let coins = 0;
    let turn = 0;
    let round = 1;
    const selectedCards = new Set();

    // AI state
    let aiDeck = [];
    let aiDiscard = [];
    let aiHand = [];
    let aiCoins = 0;

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
    const roundNumber = document.getElementById('roundNumber');
    const vpCount = document.getElementById('vpCount');
    const aiVpCount = document.getElementById('aiVpCount');

    // AI DOM elements
    const aiDeckCount = document.getElementById('aiDeckCount');
    const aiDiscardCount = document.getElementById('aiDiscardCount');
    const aiCoinCount = document.getElementById('aiCoinCount');

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

    function aiDraw(n) {
        for (let i = 0; i < n; i++) {
            if (aiDeck.length === 0) {
                aiDeck = aiDiscard;
                aiDiscard = [];
                shuffle(aiDeck);
            }
            if (aiDeck.length === 0) return;
            aiHand.push(aiDeck.pop());
        }
    }

    function countCoins() {
        coins = hand.reduce((sum, card) => sum + (cardData[card].coins || 0), 0);
    }

    function countAiCoins() {
        aiCoins = aiHand.reduce((sum, card) => sum + (cardData[card].coins || 0), 0);
    }

    function calculateVP(arr) {
        return arr.reduce((sum, c) => sum + (cardData[c].vp || 0), 0);
    }

    function getSelectedCoinTotal() {
        let total = 0;
        selectedCards.forEach(i => {
            const cardName = hand[i];
            total += cardData[cardName].coins || 0;
        });
        return total;
    }

    function toggleCardSelection(index) {
        if (selectedCards.has(index)) {
            selectedCards.delete(index);
        } else {
            selectedCards.add(index);
        }
        const el = handDiv.querySelector(`.hand-card[data-index='${index}']`);
        if (el) {
            el.classList.toggle('selected');
        }
    }

    function updateDisplay() {
        deckCount.textContent = deck.length;
        discardCount.textContent = discard.length;
        coinCount.textContent = coins;
        turnNumber.textContent = turn;
        roundNumber.textContent = round;
        handDiv.innerHTML = '';
        hand.forEach((c, idx) => {
            const card = document.createElement('div');
            card.className = 'card hand-card selectable';
            card.dataset.index = idx;
            if (selectedCards.has(idx)) card.classList.add('selected');
            card.addEventListener('click', () => toggleCardSelection(idx));

            const title = document.createElement('div');
            title.className = 'card-title';
            title.textContent = c;

            const desc = document.createElement('div');
            desc.className = 'card-desc';
            desc.textContent = cardData[c].description;

            card.title = cardData[c].description;
            card.appendChild(title);
            card.appendChild(desc);
            handDiv.appendChild(card);
        });
        aiDeckCount.textContent = aiDeck.length;
        aiDiscardCount.textContent = aiDiscard.length;
        aiCoinCount.textContent = aiCoins;
        vpCount.textContent = calculateVP(deck) + calculateVP(discard) + calculateVP(hand);
        aiVpCount.textContent = calculateVP(aiDeck) + calculateVP(aiDiscard) + calculateVP(aiHand);
    }

    function setupMarket() {
        marketDiv.innerHTML = '';
        Object.keys(cardData).forEach(name => {
            const data = cardData[name];
            const card = document.createElement('div');
            card.className = 'card market-card';

            const title = document.createElement('div');
            title.className = 'card-title';
            title.textContent = name;

            const desc = document.createElement('div');
            desc.className = 'card-desc';
            desc.textContent = data.description;

            const cost = document.createElement('div');
            cost.className = 'card-cost';
            cost.textContent = `Cost: ${data.cost}`;

            const btn = document.createElement('button');
            btn.textContent = 'Buy';
            btn.addEventListener('click', () => buyCard(name, card));

            card.appendChild(title);
            card.appendChild(desc);
            card.appendChild(cost);
            card.appendChild(btn);
            marketDiv.appendChild(card);
        });
    }

    function startGame() {
        deck = [];
        discard = [];
        hand = [];
        coins = 0;
        turn = 1;
        selectedCards.clear();
        aiDeck = [];
        aiDiscard = [];
        aiHand = [];
        aiCoins = 0;
        for (let i = 0; i < 7; i++) deck.push('Copper');
        for (let i = 0; i < 3; i++) deck.push('Estate');
        for (let i = 0; i < 7; i++) aiDeck.push('Copper');
        for (let i = 0; i < 3; i++) aiDeck.push('Estate');
        for (let i = 0; i < round - 1; i++) aiDeck.push('Silver');
        shuffle(deck);
        shuffle(aiDeck);
        draw(5);
        aiDraw(5);
        countCoins();
        countAiCoins();
        endTurnBtn.disabled = false;
        setupMarket();
        gameArea.classList.remove('hidden');
        updateDisplay();
        message.textContent = '';
        checkWin();
    }

    function buyCard(name, marketEl) {
        const cost = cardData[name].cost;
        const available = getSelectedCoinTotal();
        if (available < cost) {
            message.textContent = 'Not enough selected coins.';
            return;
        }

        const elems = Array.from(selectedCards).map(i =>
            handDiv.querySelector(`.hand-card[data-index='${i}']`)
        ).filter(Boolean);
        elems.forEach(el => el.classList.add('spent'));

        setTimeout(() => {
            Array.from(selectedCards).sort((a,b) => b-a).forEach(i => {
                discard.push(hand.splice(i, 1)[0]);
            });
            discard.push(name);
            selectedCards.clear();
            countCoins();
            if (marketEl) {
                marketEl.classList.add('purchased');
                setTimeout(() => marketEl.remove(), 300);
            }
            message.textContent = `Bought ${name}!`;
            updateDisplay();
            checkWin();
        }, 300);
    }

    function aiTurn() {
        countAiCoins();
        let choice = null;
        const options = Object.keys(cardData)
            .filter(n => cardData[n].cost <= aiCoins)
            .sort((a, b) => cardData[b].cost - cardData[a].cost);
        if (options.length > 0) {
            choice = options[0];
            aiCoins -= cardData[choice].cost;
            aiDiscard.push(choice);
        }
        aiDiscard = aiDiscard.concat(aiHand);
        aiHand = [];
        aiDraw(5);
        countAiCoins();
        checkWin();
        return choice ? `AI bought ${choice}!` : 'AI bought nothing.';
    }

    function checkWin() {
        const playerVP = calculateVP(deck) + calculateVP(discard) + calculateVP(hand);
        const enemyVP = calculateVP(aiDeck) + calculateVP(aiDiscard) + calculateVP(aiHand);
        if (playerVP >= 15 || enemyVP >= 15) {
            const winner = playerVP > enemyVP ? 'You' : 'AI';
            message.textContent = `${winner} win round ${round}! Click New Game for next round.`;
            endTurnBtn.disabled = true;
            marketDiv.querySelectorAll('button').forEach(b => b.disabled = true);
            round++;
        }
    }

    function endTurn() {
        discard = discard.concat(hand);
        hand = [];
        selectedCards.clear();
        draw(5);
        countCoins();
        const aiMsg = aiTurn();
        turn++;
        updateDisplay();
        message.textContent = aiMsg;
        checkWin();
    }

    newGameBtn.addEventListener('click', startGame);
    endTurnBtn.addEventListener('click', endTurn);
});
