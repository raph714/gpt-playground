document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('js/cards.json');
    const cardData = await response.json();

    function adjustCosts() {
        Object.values(cardData).forEach(data => {
            let impact = (data.coins || 0) + (data.extraDraw || 0) * 1.5 +
                         (data.attack || 0) * 2 + (data.defense || 0) +
                         (data.vp || 0) * 3;
            impact += (data.coinOnBuy || 0) * 1.5 + (data.drawOnBuy || 0) * 1.5 +
                      (data.attackOnBuy || 0) * 2 + (data.vpOnBuy || 0) * 3 +
                      (data.discount || 0) * 0.5;
            data.cost = Math.max(1, Math.round(impact));
        });
    }

    adjustCosts();
    let deck = [];
    let discard = [];
    let hand = [];
    let coins = 0;
    let turn = 0;
    let round = 1;
    let bonusVP = 0;
    let aiBonusVP = 0;
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
    const healthSpan = document.getElementById('health');
    const shieldSpan = document.getElementById('shield');
    const aiHealthSpan = document.getElementById('aiHealth');
    const aiShieldSpan = document.getElementById('aiShield');

    // selection controls
    const selectedCoinsSpan = document.getElementById('selectedCoins');
    const selectCoinsBtn = document.getElementById('selectCoins');
    const clearSelectionBtn = document.getElementById('clearSelection');

    // battlefield
    const playerBattleDiv = document.getElementById('playerBattle');
    const aiBattleDiv = document.getElementById('aiBattle');

    let playerBattlefield = [];
    let aiBattlefield = [];

    let health = 20;
    let shield = 0;
    let aiHealth = 20;
    let aiShield = 0;

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function getDiscount(isAi) {
        const arr = isAi ? aiHand : hand;
        return arr.reduce((sum, c) => sum + (cardData[c].discount || 0), 0);
    }

    function getModValue(isAi, type) {
        const arr = isAi ? aiHand : hand;
        let mul = 1;
        let div = 1;
        arr.forEach(c => {
            const data = cardData[c];
            if (data[type + 'Multiplier']) mul *= data[type + 'Multiplier'];
            if (data[type + 'Divider']) div *= data[type + 'Divider'];
        });
        return mul / div;
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
        extra *= getModValue(false, 'draw');
        extra = Math.floor(extra);
        if (extra > 0) {
            draw(extra);
        }
    }

    function applyAiExtraDraw() {
        let extra = 0;
        aiHand.forEach(c => {
            extra += cardData[c].extraDraw || 0;
        });
        extra *= getModValue(true, 'draw');
        extra = Math.floor(extra);
        if (extra > 0) {
            aiDraw(extra);
        }
    }

    function countCoins() {
        coins = hand.reduce((sum, card) => sum + (cardData[card].coins || 0), 0);
        coins *= getModValue(false, 'coin');
        coins = Math.floor(coins);
    }

    function countAiCoins() {
        aiCoins = aiHand.reduce((sum, card) => sum + (cardData[card].coins || 0), 0);
        aiCoins *= getModValue(true, 'coin');
        aiCoins = Math.floor(aiCoins);
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
        updateMarketHighlights();
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

    function updateSelectedDisplay() {
        selectedCoinsSpan.textContent = getSelectedCoinTotal();
        updateMarketHighlights();
    }

    function selectAllCoins() {
        selectedCards.clear();
        hand.forEach((c, idx) => {
            if (cardData[c].coins) selectedCards.add(idx);
        });
        updateDisplay();
        updateSelectedDisplay();
    }

    function clearSelection() {
        selectedCards.clear();
        updateDisplay();
        updateSelectedDisplay();
    }

    function updateMarketHighlights() {
        const discount = getDiscount(false);
        const available = getSelectedCoinTotal();
        const wrappers = marketDiv.querySelectorAll('.market-card');
        wrappers.forEach((wrapper, idx) => {
            const name = market[idx];
            const cost = Math.max(0, cardData[name].cost - discount);
            if (available >= cost) wrapper.classList.add('affordable');
            else wrapper.classList.remove('affordable');
        });
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
        updateSelectedDisplay();
    }

    function useCard(index) {
        const name = hand.splice(index, 1)[0];
        const data = cardData[name];
        if (data.attack) {
            let dmg = Math.floor(data.attack * getModValue(false, 'attack'));
            if (aiShield >= dmg) {
                aiShield -= dmg;
            } else {
                aiHealth -= (dmg - aiShield);
                aiShield = 0;
            }
            playerBattlefield.push(name);
        }
        if (data.defense) {
            shield += Math.floor(data.defense * getModValue(false, 'defense'));
            playerBattlefield.push(name);
        }
        if (data.extraDraw) {
            draw(data.extraDraw);
        }
        discard.push(name);
        updateDisplay();
        renderBattlefield();
        checkWin();
    }

    function aiUseAllCards() {
        aiHand.forEach(name => {
            const data = cardData[name];
            if (data.coins) aiCoins += data.coins;
            if (data.attack) {
                let dmg = Math.floor(data.attack * getModValue(true, 'attack'));
                if (shield >= dmg) {
                    shield -= dmg;
                } else {
                    health -= (dmg - shield);
                    shield = 0;
                }
                aiBattlefield.push(name);
            }
            if (data.defense) {
                aiShield += Math.floor(data.defense * getModValue(true, 'defense'));
                aiBattlefield.push(name);
            }
            if (data.extraDraw) {
                aiDraw(data.extraDraw);
            }
            aiDiscard.push(name);
        });
        aiHand = [];
        renderBattlefield();
    }

    function updateDisplay() {
        deckCount.textContent = deck.length;
        discardCount.textContent = discard.length;
        coinCount.textContent = coins;
        turnNumber.textContent = turn;
        roundNumber.textContent = round;
        handDiv.innerHTML = '';
        hand.forEach((c, idx) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'hand-card';
            wrapper.dataset.index = idx;

            const card = createCardElement(c);
            card.classList.add('selectable');
            if (selectedCards.has(idx)) card.classList.add('selected');
            card.addEventListener('click', () => toggleCardSelection(idx));

            const btn = document.createElement('button');
            btn.textContent = 'Use';
            btn.addEventListener('click', (e) => { e.stopPropagation(); useCard(idx); });

            wrapper.appendChild(card);
            wrapper.appendChild(btn);
            handDiv.appendChild(wrapper);
        });
        aiDeckCount.textContent = aiDeck.length;
        aiDiscardCount.textContent = aiDiscard.length;
        aiCoinCount.textContent = aiCoins;
        healthSpan.textContent = health;
        shieldSpan.textContent = shield;
        aiHealthSpan.textContent = aiHealth;
        aiShieldSpan.textContent = aiShield;
        vpCount.textContent = calculateVP(deck) + calculateVP(discard) + calculateVP(hand) + bonusVP;
        aiVpCount.textContent = calculateVP(aiDeck) + calculateVP(aiDiscard) + calculateVP(aiHand) + aiBonusVP;
        renderBattlefield();
    }

    function renderBattlefield() {
        playerBattleDiv.innerHTML = '';
        playerBattlefield.forEach(name => {
            const card = createCardElement(name);
            card.classList.add('battle');
            playerBattleDiv.appendChild(card);
        });
        aiBattleDiv.innerHTML = '';
        aiBattlefield.forEach(name => {
            const card = createCardElement(name);
            card.classList.add('battle');
            aiBattleDiv.appendChild(card);
        });
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
        health = 20;
        shield = 0;
        aiHealth = 20;
        aiShield = 0;
        selectedCards.clear();
        updateSelectedDisplay();
        bonusVP = 0;
        aiBonusVP = 0;
        aiDeck = [];
        aiDiscard = [];
        aiHand = [];
        aiCoins = 0;
        playerBattlefield = [];
        aiBattlefield = [];
        renderBattlefield();
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
        updateSelectedDisplay();
        message.textContent = '';
        checkWin();
    }

    function buyCard(name, index) {
        const discount = getDiscount(false);
        const baseCost = cardData[name].cost;
        const cost = Math.max(0, baseCost - discount);
        const available = getSelectedCoinTotal();
        if (available < cost) {
            message.textContent = `Not enough selected coins. Cost is ${cost}.`;
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
            const data = cardData[name];
            if (data.coinOnBuy) coins += data.coinOnBuy;
            if (data.drawOnBuy) {
                draw(data.drawOnBuy);
                applyExtraDraw();
            }
            if (data.attackOnBuy) {
                let dmg = data.attackOnBuy * getModValue(false, 'attack');
                if (aiShield >= dmg) {
                    aiShield -= dmg;
                } else {
                    aiHealth -= (dmg - aiShield);
                    aiShield = 0;
                }
            }
            if (data.vpOnBuy) bonusVP += data.vpOnBuy;
            selectedCards.clear();
            updateSelectedDisplay();
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
        aiCoins = 0;
        aiUseAllCards();
        let choice = null;
        const aiDiscount = getDiscount(true);
        const options = market
            .filter(n => (cardData[n].cost - aiDiscount) <= aiCoins)
            .sort((a, b) => cardData[b].cost - cardData[a].cost);
        if (options.length > 0) {
            choice = options[0];
            const finalCost = Math.max(0, cardData[choice].cost - aiDiscount);
            aiCoins -= finalCost;
            aiDiscard.push(choice);
            const idx = market.indexOf(choice);
            if (idx !== -1) {
                market.splice(idx, 1);
                drawMarket();
            }
        }
        // cards have already been used and moved to discard
        if (choice) {
            const data = cardData[choice];
            if (data.coinOnBuy) aiCoins += data.coinOnBuy;
            if (data.drawOnBuy) {
                aiDraw(data.drawOnBuy);
            }
            if (data.attackOnBuy) {
                let dmg = data.attackOnBuy * getModValue(true, 'attack');
                if (shield >= dmg) {
                    shield -= dmg;
                } else {
                    health -= (dmg - shield);
                    shield = 0;
                }
            }
            if (data.vpOnBuy) aiBonusVP += data.vpOnBuy;
        }
        aiDraw(5);
        applyAiExtraDraw();
        aiCoins = 0;
        renderMarket();
        checkWin();
        return choice ? `AI bought ${choice}!` : 'AI bought nothing.';
    }

    function checkWin() {
        if (health <= 0 || aiHealth <= 0) {
            const winner = health > aiHealth ? 'You' : 'AI';
            message.textContent = `${winner} won the battle! Click New Game to play again.`;
            endTurnBtn.disabled = true;
            marketDiv.querySelectorAll('button').forEach(b => b.disabled = true);
            return;
        }
        const playerVP = calculateVP(deck) + calculateVP(discard) + calculateVP(hand) + bonusVP;
        const enemyVP = calculateVP(aiDeck) + calculateVP(aiDiscard) + calculateVP(aiHand) + aiBonusVP;
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
        updateSelectedDisplay();
        draw(5);
        applyExtraDraw();
        countCoins();
        const aiMsg = aiTurn();
        setupMarket();
        turn++;
        updateDisplay();
        message.textContent = aiMsg;
        checkWin();
    }

    newGameBtn.addEventListener('click', startGame);
    endTurnBtn.addEventListener('click', endTurn);
    selectCoinsBtn.addEventListener('click', selectAllCoins);
    clearSelectionBtn.addEventListener('click', clearSelection);
});
