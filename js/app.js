document.addEventListener('DOMContentLoaded', () => {
    const cardData = {
        Copper: {
            cost: 0,
            coins: 1,
            emoji: '🪙',
            description: 'Basic currency worth 1 coin.'
        },
        Silver: {
            cost: 3,
            coins: 2,
            emoji: '🥈',
            description: 'Shiny coin worth 2 coins.'
        },
        Gold: {
            cost: 6,
            coins: 3,
            emoji: '🥇',
            description: 'Premium coin worth 3 coins.'
        },
        Estate: {
            cost: 2,
            vp: 1,
            emoji: '🏠',
            description: 'Worth 1 victory point.'
        },
        Duchy: {
            cost: 5,
            vp: 3,
            emoji: '🏯',
            description: 'Worth 3 victory points.'
        },
        Province: {
            cost: 9,
            vp: 6,
            emoji: '🏰',
            description: 'Worth 6 victory points.'
        },
        Jester: {
            cost: 5,
            coins: 1,
            vp: 1,
            emoji: '🤹',
            description: 'Adds comic relief and 1 VP.'
        },
        Village: {
            cost: 4,
            coins: 1,
            extraDraw: 1,
            emoji: '🏘️',
            description: 'Draw an extra card each turn.'
        },
        Militia: {
            cost: 4,
            coins: 2,
            attack: 1,
            emoji: '⚔️',
            description: "Reduces opponent's coins by 1 when in hand."
        },
        Squire: {
            cost: 3,
            coins: 1,
            defense: 1,
            emoji: '🛡️',
            description: 'Young warrior providing 1 defense.'
        },
        Knight: {
            cost: 6,
            coins: 1,
            attack: 2,
            defense: 1,
            emoji: '🗡️',
            description: 'Seasoned fighter with 2 attack and 1 defense.'
        },
        Archer: {
            cost: 4,
            attack: 1,
            extraDraw: 1,
            emoji: '🏹',
            description: 'Ranged unit drawing a card when played.'
        },
        SiegeTower: {
            cost: 7,
            attack: 2,
            emoji: '🪜',
            description: 'Large engine bringing 2 attack.'
        },
        Castle: {
            cost: 8,
            vp: 4,
            defense: 2,
            emoji: '🏰',
            description: 'Stronghold worth 4 VP and 2 defense.'
        },
        Guard: {
            cost: 3,
            coins: 1,
            defense: 1,
            emoji: '🛡️',
            description: 'Basic protection adding 1 defense.'
        },
        Moat: {
            cost: 2,
            defense: 2,
            emoji: '🌊',
            description: 'Flooded ditch adding 2 defense.'
        },
        Market: {
            cost: 5,
            coins: 2,
            extraDraw: 1,
            emoji: '🏪',
            description: 'Trade hub generating coins and an extra draw.'
        },
        Barracks: {
            cost: 4,
            extraDraw: 1,
            defense: 1,
            emoji: '🏟️',
            description: 'Training ground granting 1 defense and draw.'
        },
        Blacksmith: {
            cost: 4,
            coins: 1,
            attack: 1,
            emoji: '⚒️',
            description: 'Forge increasing attack and coins.'
        },
        Chapel: {
            cost: 3,
            vp: 1,
            defense: 1,
            emoji: '⛪',
            description: 'Place of worship offering 1 VP and defense.'
        },
        Stable: {
            cost: 5,
            coins: 2,
            extraDraw: 1,
            emoji: '🐴',
            description: 'Stabling horses for coins and a draw.'
        },
        Infantry: {
            cost: 3,
            attack: 1,
            defense: 1,
            emoji: '🪓',
            description: 'Foot soldier with balanced attack and defense.'
        },
        Catapult: {
            cost: 6,
            attack: 3,
            emoji: '🪨',
            description: 'Siege engine adding 3 attack.'
        },
        Trebuchet: {
            cost: 7,
            attack: 3,
            defense: 1,
            emoji: '🎯',
            description: 'Powerful launcher with attack and defense.'
        },
        Merchant: {
            cost: 4,
            coins: 2,
            emoji: '🛍️',
            description: 'Travelling trader worth 2 coins.'
        },
        Farmer: {
            cost: 2,
            coins: 1,
            defense: 1,
            emoji: '🌾',
            description: 'Provides food and minor defense.'
        },
        Baker: {
            cost: 3,
            coins: 1,
            extraDraw: 1,
            emoji: '🥖',
            description: 'Supplies bread and 1 extra draw.'
        },
        Tavern: {
            cost: 4,
            coins: 2,
            emoji: '🍻',
            description: 'Gathering place yielding 2 coins.'
        },
        Inn: {
            cost: 3,
            coins: 1,
            extraDraw: 1,
            emoji: '🏨',
            description: 'Resting spot for coins and a draw.'
        },
        Mill: {
            cost: 4,
            coins: 2,
            emoji: '🌽',
            description: 'Processes grain for 2 coins.'
        },
        Priest: {
            cost: 5,
            defense: 2,
            vp: 1,
            emoji: '🙏',
            description: 'Holy man granting defense and VP.'
        },
        Wizard: {
            cost: 6,
            attack: 2,
            extraDraw: 1,
            emoji: '🧙',
            description: 'Caster with attack and a draw.'
        },
        Alchemist: {
            cost: 6,
            coins: 2,
            extraDraw: 1,
            emoji: '⚗️',
            description: 'Mystic who turns lead into coins and a draw.'
        },
        Court: {
            cost: 5,
            coins: 1,
            vp: 2,
            extraDraw: 1,
            emoji: '🏛️',
            description: 'Seat of power granting VP and draw.'
        },
        Throne: {
            cost: 7,
            vp: 3,
            defense: 1,
            emoji: '👑',
            description: 'Symbol of rule adding VP and defense.'
        },
        Guardhouse: {
            cost: 4,
            defense: 2,
            emoji: '🏰',
            description: 'Fortified structure with 2 defense.'
        },
        Tower: {
            cost: 6,
            defense: 3,
            emoji: '🗼',
            description: 'Watchtower providing 3 defense.'
        },
        Wall: {
            cost: 5,
            defense: 3,
            emoji: '🧱',
            description: 'Sturdy wall worth 3 defense.'
        },
        Hospital: {
            cost: 4,
            defense: 1,
            extraDraw: 1,
            emoji: '🏥',
            description: 'Heals troops and draws a card.'
        },
        TrainingGrounds: {
            cost: 5,
            attack: 1,
            extraDraw: 1,
            emoji: '🥋',
            description: 'Prepares warriors with attack and draw.'
        },
        Mine: {
            cost: 5,
            coins: 2,
            emoji: '⛏️',
            description: 'Source of ore worth 2 coins.'
        },
        Quarry: {
            cost: 4,
            coins: 1,
            defense: 1,
            emoji: '🪨',
            description: 'Stone works giving coins and defense.'
        },
        Explorer: {
            cost: 4,
            extraDraw: 2,
            emoji: '🧭',
            description: 'Ventures forth drawing extra cards.'
        },
        Ranger: {
            cost: 5,
            attack: 1,
            extraDraw: 1,
            emoji: '🏕️',
            description: 'Watches the wilds with attack and draw.'
        },
        Scout: {
            cost: 3,
            extraDraw: 1,
            emoji: '🕵️',
            description: 'Provides reconnaissance and a draw.'
        },
        Trader: {
            cost: 4,
            coins: 2,
            emoji: '💰',
            description: 'Commercial expert worth 2 coins.'
        },
        Scholar: {
            cost: 3,
            extraDraw: 2,
            emoji: '📚',
            description: 'Learned figure drawing two cards.'
        },
        Library: {
            cost: 6,
            vp: 2,
            extraDraw: 2,
            emoji: '📖',
            description: 'Repository of knowledge worth VP and draws.'
        },
        Swordsman: {
            cost: 5,
            attack: 2,
            emoji: '🗡️',
            description: 'Skilled attacker with 2 attack.'
        },
        Ballista: {
            cost: 7,
            attack: 4,
            emoji: '🎯',
            description: 'Deadly siege weapon with 4 attack.'
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

    // market state
    let marketDeck = [];
    let market = [];
    const MARKET_SIZE = 5;

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

    function applyExtraDraw() {
        let extra = 0;
        hand.forEach(c => {
            extra += cardData[c].extraDraw || 0;
        });
        if (extra > 0) {
            draw(extra);
        }
    }

    function applyAiExtraDraw() {
        let extra = 0;
        aiHand.forEach(c => {
            extra += cardData[c].extraDraw || 0;
        });
        if (extra > 0) {
            aiDraw(extra);
        }
    }

    function countCoins() {
        coins = hand.reduce((sum, card) => sum + (cardData[card].coins || 0), 0);
        const attack = aiHand.reduce((sum, card) => sum + (cardData[card].attack || 0), 0);
        const defense = hand.reduce((sum, card) => sum + (cardData[card].defense || 0), 0);
        coins = Math.max(0, coins - Math.max(0, attack - defense));
    }

    function countAiCoins() {
        aiCoins = aiHand.reduce((sum, card) => sum + (cardData[card].coins || 0), 0);
        const attack = hand.reduce((sum, card) => sum + (cardData[card].attack || 0), 0);
        const defense = aiHand.reduce((sum, card) => sum + (cardData[card].defense || 0), 0);
        aiCoins = Math.max(0, aiCoins - Math.max(0, attack - defense));
    }

    function calculateVP(arr) {
        return arr.reduce((sum, c) => sum + (cardData[c].vp || 0), 0);
    }

    function createMarketDeck() {
        marketDeck = Object.keys(cardData);
        shuffle(marketDeck);
    }

    function drawMarket() {
        while (market.length < MARKET_SIZE && marketDeck.length > 0) {
            market.push(marketDeck.pop());
        }
    }

    function renderMarket() {
        marketDiv.innerHTML = '';
        market.forEach((name, idx) => {
            const data = cardData[name];

            const wrapper = document.createElement('div');
            wrapper.className = 'market-card';

            const card = createCardElement(name);

            const cost = document.createElement('div');
            cost.className = 'card-cost';
            cost.textContent = `Cost: ${data.cost}`;

            const btn = document.createElement('button');
            btn.textContent = 'Buy';
            btn.addEventListener('click', () => buyCard(name, idx));

            wrapper.appendChild(card);
            wrapper.appendChild(cost);
            wrapper.appendChild(btn);
            marketDiv.appendChild(wrapper);
        });
    }

    function createCardElement(name) {
        const data = cardData[name];
        const card = document.createElement('div');
        card.className = 'card';

        const art = document.createElement('div');
        art.className = 'card-art';
        art.textContent = data.emoji || '';

        const title = document.createElement('div');
        title.className = 'card-title';
        title.textContent = name;

        const desc = document.createElement('div');
        desc.className = 'card-desc';
        desc.textContent = data.description;

        card.title = data.description;
        card.appendChild(art);
        card.appendChild(title);
        card.appendChild(desc);
        return card;
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
            const card = createCardElement(c);
            card.classList.add('hand-card', 'selectable');
            card.dataset.index = idx;
            if (selectedCards.has(idx)) card.classList.add('selected');
            card.addEventListener('click', () => toggleCardSelection(idx));
            handDiv.appendChild(card);
        });
        aiDeckCount.textContent = aiDeck.length;
        aiDiscardCount.textContent = aiDiscard.length;
        aiCoinCount.textContent = aiCoins;
        vpCount.textContent = calculateVP(deck) + calculateVP(discard) + calculateVP(hand);
        aiVpCount.textContent = calculateVP(aiDeck) + calculateVP(aiDiscard) + calculateVP(aiHand);
    }

    function setupMarket() {
        createMarketDeck();
        market = [];
        drawMarket();
        renderMarket();
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
        for (let i = 0; i < Math.floor(round / 2); i++) aiDeck.push('Militia');
        shuffle(deck);
        shuffle(aiDeck);
        draw(5);
        applyExtraDraw();
        aiDraw(5);
        applyAiExtraDraw();
        countCoins();
        countAiCoins();
        endTurnBtn.disabled = false;
        setupMarket();
        gameArea.classList.remove('hidden');
        updateDisplay();
        message.textContent = '';
        checkWin();
    }

    function buyCard(name, index) {
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
            if (typeof index === 'number') {
                market.splice(index, 1);
                drawMarket();
                renderMarket();
            }
            message.textContent = `Bought ${name}!`;
            updateDisplay();
            checkWin();
        }, 300);
    }

    function aiTurn() {
        countAiCoins();
        let choice = null;
        const options = market
            .filter(n => cardData[n].cost <= aiCoins)
            .sort((a, b) => cardData[b].cost - cardData[a].cost);
        if (options.length > 0) {
            choice = options[0];
            aiCoins -= cardData[choice].cost;
            aiDiscard.push(choice);
            const idx = market.indexOf(choice);
            if (idx !== -1) {
                market.splice(idx, 1);
                drawMarket();
            }
        }
        aiDiscard = aiDiscard.concat(aiHand);
        aiHand = [];
        aiDraw(5);
        applyAiExtraDraw();
        countAiCoins();
        renderMarket();
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
        applyExtraDraw();
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
