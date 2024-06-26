// Constant for player data to manipulate throughout the game
const playerData = [];
// Constant to keep track of whose turn it is
let turnIndex = 0;
// Constant to keep track of who took a 'turn of dealing the cards', will always assume Player deals first on new game
let dealerIndex = 0;
let oldDealerIndex = 0;
// Constant for tracking if a game has more than 1 human player, so it triggers prompts between before a human player's turn
let humans = false;
// Constant to countdown turns from the start of a new round to enable the appropriate player prompt to display
let newRound = 0;
// Constant for tracking the draw deck of cards
const drawDeck = [];
// Constant for tracking the discarded deck of cards
const discardDeck = [];

// wait for the DOM to finish loading before running the game
// Get the button elements and add event listeners to them
// based on DOM loading event listener from Love Maths walkthrough project
document.addEventListener("DOMContentLoaded", function () {
    let buttons = document.getElementsByClassName("click"); // event listener will look clickable elements by the class "click"

    for (let button of buttons) {
        button.addEventListener('click', function () {
            if (this.getAttribute('action') === 'menu') {
                menu();
            } else if (this.getAttribute('action') === 'how-to-play') {
                menu();
            } else if (this.getAttribute('id') === 'sound-state') {
                let state = this.innerText;
                state === 'OFF' ? state = 'ON' : state = 'OFF';
                this.innerHTML = state;
            } else if (this.getAttribute('action') === 'play') {
                document.getElementById('welcome').style.display = 'none';
                document.getElementById('player-form').style.display = 'block';
            } else if (this.getAttribute('action') === 'next') {
                if (this.innerText === "Start Game") {
                    let P1 = String(document.getElementById('P1-name').value);
                    let P2 = String(document.getElementById('P2-name').value);
                    let P3 = String(document.getElementById('P3-name').value);
                    let P4 = String(document.getElementById('P4-name').value);
                    P1 === '' ? P1 = ['Player 1', 0] : P1 = [P1, 0];
                    P2 === '' ? P2 = ['_BOT 1', 2] : P2 = logBot(P2);
                    P3 === '' ? P3 = ['_BOT 2', 2] : P3 = logBot(P3);
                    P4 === '' ? P4 = ['_BOT 3', 2] : P4 = logBot(P4);
                    P1 = {
                        botSkill: P1[1],
                        playerName: P1[0],
                        cardHand: [],
                        score: 0
                    }
                    P2 = {
                        botSkill: P2[1],
                        playerName: P2[0],
                        cardHand: [],
                        score: 0
                    }
                    P3 = {
                        botSkill: P3[1],
                        playerName: P3[0],
                        cardHand: [],
                        score: 0
                    }
                    P4 = {
                        botSkill: P4[1],
                        playerName: P4[0],
                        cardHand: [],
                        score: 0
                    }
                    playerData.push(P1, P2, P3, P4);
                    runGame('new');
                }
            } else if (this.getAttribute('action') === 'new-hand') {
                hand('open');
                newRound--;
            } else if (this.getAttribute('action') === 'done') {
                if (newRound > 0) {
                    shiftTurns();
                    plrPrompt();
                } else {
                    hand('close');
                    shiftTurns();
                    if (humans === true) {
                        plrPrompt();
                    }
                }


            } else {
                let item = this.getAttribute('id') === null ? this.innerText : this.getAttribute('id');
                alert(item);
            }
        })
    }


})

// toggles the navigation menu open and close, including changing the icon from hamburger bars to cross
function menu() {
    let menu = document.getElementById('menu-list');
    let state = menu.style.display;
    let menuBtn = document.getElementById('menu-btn');
    let bars = menuBtn.children[0].getAttribute('class');
    let x = menuBtn.children[1].getAttribute('class');
    if (state === 'block') {
        bars = remClass(bars, ' hidden');
        x = addClass(x, ' hidden');
        menu.style.display = 'none';
    } else {
        x = remClass(x, ' hidden');
        bars = addClass(bars, ' hidden');
        menu.style.display = 'block';
    }
    menuBtn.children[1].setAttribute('class', x);
    menuBtn.children[0].setAttribute('class', bars);
}

// function that will run the sequence of functions of the game, triggering functions to manipulate data stored in constants
function runGame(action, data) {
    if (action === 'new') {
        table("playerNames");
        table('empty');
        document.getElementById('player-form').style.display = 'none';
        document.getElementById('other-players').style.display = 'block';
        document.getElementById('decks-area').style.display = 'block';
        document.getElementById('main-player').style.display = 'block';
        drawStack('deal');
        plrPrompt();
    }
}

// manages appearance of cards on the table 
// 'empty' will display a table with only placeholders for card
// 'deal' will add player names, scores and a card at a time to the table to mimic dealing out
// 'values' will return the card ID as inner HTML text in the card location
// 'playerNames' looks up the turnIndex and places names and scores in the correct position depending on whose turn it is, 
// so the current player will always be in the bottom card hand..
function table(action, data) {
    let cards;
    let decks;
    cards = document.getElementsByClassName('card');
    decks = document.getElementsByClassName('deck');
    // get player name elements
    let p1Name = document.getElementById('p1');
    let p2Name = document.getElementById('p2');
    let p3Name = document.getElementById('p3');
    let p4Name = document.getElementById('p4');
    // get player score elements
    let p1Score = document.getElementById('scr1');
    let p2Score = document.getElementById('scr2');
    let p3Score = document.getElementById('scr3');
    let p4Score = document.getElementById('scr4');

    if (action === 'empty') {
        for (let card of cards) {
            let x = card.getAttribute('class');
            x = addClass(x, ' missing-card');
            card.setAttribute('class', x);
            card.innerHTML = '';
        }
        for (let card of decks) {
            let x = card.getAttribute('class');
            x = addClass(x, ' missing-card');
            card.setAttribute('class', x);
            card.innerHTML = '';
        }
    } else if (action === "deal") {
        console.log(data);
        if (data < 16) {
            let y = cards[data].getAttribute('class');
            y = remClass(y, 'missing-card');
            cards[data].setAttribute('class', y);
        } else if (data < 22) {
            data = data - 16;
            let y = decks[data].getAttribute('class');
            y = remClass(y, 'missing-card');
            decks[data].setAttribute('class', y);
        } else {
            alert('action "deal" given data larger than 21!');
        }

    } else if (action === 'values') {
        if (data < 16) {
            cards[data].innerHTML = playerData[turnIndex].cardHand[data % 4];
        } else if (data < 19) {
            data = data - 16;
            let i = data + 1;
            decks[data].innerHTML = drawDeck[drawDeck.length - i];
        } else if (data < 22) {
            data = data - 16;
            let i = data - 3;
            decks[data].innerHTML = discardDeck[i];
        } else {
            alert('action "values" given data larger than 21!');
        }

    } else if (action === 'playerNames') {
        let x = turnIndex - 1;
        for (let i = 0; i < 4; i++) {
            x > 2 ? x = 0 : x++;
            switch (i) {
                case (0):
                    p1Name.innerHTML = playerData[x].playerName; // display player names
                    p1Score.innerHTML = playerData[x].score; // display player current score
                    continue;
                case (1):
                    p2Name.innerHTML = playerData[x].playerName;
                    p2Score.innerHTML = playerData[x].score;
                    continue;
                case (2):
                    p3Name.innerHTML = playerData[x].playerName;
                    p3Score.innerHTML = playerData[x].score;
                    continue;
                case (3):
                    p4Name.innerHTML = playerData[x].playerName;
                    p4Score.innerHTML = playerData[x].score;
            }
        }

    } else if (action === 'focus') {
        table('playerNames');
        for (let i = 0; i < 16; i++) {
            table('values', i);
        }
    }
}

// will manipulate the cards held in the draw deck, including dealing at the start of the game
// action of 'deal' will set the draw deck as a fresh deck of cards, shuffle it and return the first 17 cards for players and discard deck
function drawStack(action, data) {
    if (action === 'deal') {
        let freshDeck = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'cx', 'cj', 'cq', 'ck',
            'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'dx', 'dj', 'dq', 'dk',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'hx', 'hj', 'hq', 'hk',
            's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 'sx', 'sj', 'sq', 'sk'
        ];
        let card;
        // console.log(freshDeck);
        freshDeck = shuffle(freshDeck);
        // console.log(freshDeck);
        for (let i = 0; i < freshDeck.length; i++) {
            drawDeck.push(freshDeck[i]);
        }
        console.log(drawDeck);
        if (dealerIndex === oldDealerIndex) {
            shiftTurns('dealer');
            turnIndex = dealerIndex;
            newRound = 4;
        }
        for (let i = 0; i < 4; i++) { // iterate through card hand position
            for (let j = 0; j < 4; j++) { // iterate through players, so deals card 1 to all players, before card 2
                card = drawDeck.pop();
                playerData[turnIndex].cardHand.push(card);
                let place = i + 4 * j;
                table('deal', place);
                table('values', place);
                shiftTurns();
            }
        }
        card = drawDeck.pop();
        discardStack('add', card);
        // now that the drawDeck array is as it will be to start the game, finish displaying the table setup by displaying 3 cards in discard stack
        for (let i = 0; i < 3; i++) {
            table('deal', 16 + i);
            table('values', 16 + i);
        }

    }
}

// will manipulate cards present in the discard stack
// 'add' will add the card ID as a string value forwarded as the data
function discardStack(action, data) {
    if (action === 'add') {
        discardDeck.push(data);
        let x = discardDeck.length;
        x = Math.min(x, 3);
        console.log(`number of cards in discard deck = ${x}`);
        // Run through the length of discard stack up to its top 3 cards to illustrate them on the table
        for (let i = 0; i < x; i++) {
            table('deal', 19 + i);
            table('values', 19 + i);
        }

    }
}

// function will produce a prompt for human players when more than one human is playing on the same device
function plrPrompt() {
    if (newRound > 0) {
        if (newRound === 1) {
            console.log('last prompt for new hand!');
        }

        if (humans === true && playerData[turnIndex].botSkill === 0) {
            console.log(`${playerData[turnIndex].playerName} is a human player!`);
            document.getElementById('wlcm-msg').innerHTML = `${playerData[turnIndex].playerName}`;
            document.getElementById('play').innerHTML = 'READY';
            document.getElementById('play').setAttribute('action', 'new-hand');
            document.getElementById('welcome').style.display = 'block';
            document.getElementById('other-players').style.display = 'none';
            document.getElementById('decks-area').style.display = 'none';
            document.getElementById('main-player').style.display = 'none';
            //newRound--;
        } else if (humans === false) {
            console.log('no humans but P1!')
            turnIndex = 0;
            newRound = 1;
            hand('open');
            newRound--;
        } else {
            console.log(`bot player - turnIndex: ${turnIndex}`)
            shiftTurns();
            newRound--;
            plrPrompt();
        }

    } else {
        if (humans === true && playerData[turnIndex].botSkill === 0) {
            console.log(`${playerData[turnIndex].playerName} is a human player!`);
            document.getElementById('wlcm-msg').innerHTML = `${playerData[turnIndex].playerName}!<br>Pick a card!`;
            document.getElementById('play').innerHTML = 'READY';
            document.getElementById('play').setAttribute('action', 'to-pick');
            document.getElementById('welcome').style.display = 'block';
            document.getElementById('other-players').style.display = 'none';
            document.getElementById('decks-area').style.display = 'none';
            document.getElementById('main-player').style.display = 'none';
        } else if (turnIndex === 0) {
            // ; // --- perhaps just code to highlight main player area to indicate turn
        } else {
            // ; // --- code to highlight bot currently playing;
            // ; // --- code to get bot to make a decision on play;
            // shiftTurns();
        }
    }
}

// presents current player with hand of cards, 
// 'open' will give the player a chance to swap card positions before the game begins
// 'close' will go back to table view
function hand(action, data) {
    document.getElementById('welcome').style.display = 'none';
    document.getElementById('other-players').style.display = 'none';
    document.getElementById('decks-area').style.display = 'none';
    document.getElementById('main-player').style.display = 'block';
    // selects the 4 cards in the 'main-player' div only
    let cards = document.getElementById('main-player').getElementsByClassName('card');

    if (action === 'open') {
        // adds class of deck so appearance is larger as set for the cards in the decks
        for (let card of cards) {
            let x = card.getAttribute('class');
            x = addClass(x, ' deck');
            card.setAttribute('class', x);
        }
        // for testing, sets the cards ID to the correct position in the player's hand
        for (let i = 0; i < 4; i++) {
            cards[i].innerHTML = playerData[turnIndex].cardHand[i];
        }
        // presents main-player name, score and message
        document.getElementById('p1').innerHTML = playerData[turnIndex].playerName;
        document.getElementById('scr1').innerHTML = playerData[turnIndex].score;
        if (newRound >= 0) {
            document.getElementById('top-prompt').innerHTML = 'Want to shuffle?';
        } else {
            document.getElementById('top-prompt').innerHTML = 'Pick a card to swap';
        }
        

    } else if (action === 'close') {
        for (let card of cards) {
            let x = card.getAttribute('class');
            x = remClass(x, ' deck');
            card.setAttribute('class', x);
        }
        document.getElementById('top-prompt').style.display = 'none';
        document.getElementById('btm-prompt').style.display = 'none';
        document.getElementById('other-players').style.display = 'block';
        document.getElementById('decks-area').style.display = 'block';
        document.getElementById('main-player').style.display = 'block';
    }
}


// checks that the string contains the term and removes the term
function remClass(strg1, term) {
    let idx = strg1.indexOf(term);
    if (idx >= 0) {
        strg1 = strg1.replace(term, '');
    }
    return strg1;
}

// checks that the string contains the term, if it does NOT it adds it, this should reduce runaway errors.
function addClass(strg1, term) {
    let idx = strg1.indexOf(term);
    if (idx < 0) {
        strg1 += term;
    }
    return strg1;
}

// Captures the data for bot players, including the skill level, and presumes standard level 2 bot if the fields are left empty
function logBot(strg1) {
    let x;
    let y;
    if (strg1.includes('_BOT ') === true) { // if string starts with '_BOT ' then look for comma
        x = strg1.indexOf(',');
        // console.log(x);
        if (x > 0) {
            y = strg1.slice(0, x); // separate the bot name '_BOT n'
            x = parseInt(strg1.slice(x + 1, x + 2)); // get number for skill level after comma
            // console.log(x);

        } else {
            x = 2; // else assume skill level of 2
        }
        return strg1 = [y, x];
    } else {
        humans = true;
        return strg1 = [strg1, 0]; // if does not contain '_BOT ' then assume the name is human and bot skill level is set to 0
    }
}

// shifts turns for either play turn or dealer turn. Action must be 'dealer', otherwise assumes play turn is being shifted.
function shiftTurns(action) {
    let x;
    action === 'dealer' ? x = dealerIndex : x = turnIndex;
    x > 2 ? x = 0 : x++;
    action === 'dealer' ? dealerIndex = x : turnIndex = x;
}

// function to shuffle any values inside an array, to mimic the shuffling of cards
function shuffle(data) {
    let arr = [];
    do {
        let x = Math.floor(Math.random() * data.length);
        x = data.splice(x, 1)[0];
        arr.push(x);
    } while (data.length > 0);
    return arr;
}