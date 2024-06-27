// Constant for player data to manipulate throughout the game
const playerData = [];
// Constant to keep track of whose turn it is
let turnIndex = 1;
// Constant to keep track of who took a 'turn of dealing the cards', will always assume Player deals first on new game
let dealerIndex = 0;
// Constant for tracking if a game has more than 1 human player, so it triggers prompts between before a human player's turn
let humans = false;
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
            if (this.getAttribute('action') === 'submit') {
                alert('this element has an action attr of "submit"');
            } else if (this.getAttribute('action') === 'menu') {
                menu();
            } else if (this.getAttribute('action') === 'how-to-play') {
                menu();
            } else if (this.getAttribute('id') === 'sound-state') {
                let state = this.innerText;
                state === 'OFF' ? state = 'ON' : state = 'OFF';
                this.innerHTML = state;
            } else if (this.getAttribute('id') === 'play') {
                document.getElementById('welcome').style.display = 'none';
                document.getElementById('player-form').style.display = 'block';
            } else if (this.getAttribute('action') === 'next') {
                if (this.innerText === "Start Game") {
                    let P1 = String(document.getElementById('P1-name').value);
                    let P2 = String(document.getElementById('P2-name').value);
                    let P3 = String(document.getElementById('P3-name').value);
                    let P4 = String(document.getElementById('P4-name').value);
                    P1 === '' ? P1 = ['Player 1', 0] : P1 = [P1, 0];
                    P2 === '' ? P2 = ['_BOT 2', 2] : P2 = logBot('P2', P2);
                    P3 === '' ? P3 = ['_BOT 3', 2] : P3 = logBot('P3', P3);
                    P4 === '' ? P4 = ['_BOT 4', 2] : P4 = logBot('P4', P4);
                    // console.log(P1);
                    // console.log(P2);
                    // console.log(P3);
                    // console.log(P4);
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
                    turnIndex = dealerIndex + 1;
                    runGame('new');
                }
            } else {
                let item = this.getAttribute('id') === null ? this.innerText : this.getAttribute('id');
                alert(item);
            }
        })
    }


})

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

// function that will manipulate data stored in constants as the game goes on
function runGame(action, data) {
    if (action === 'new') {
        table('empty');
        document.getElementById('player-form').style.display = 'none';
        document.getElementById('other-players').style.display = 'block';
        document.getElementById('decks-area').style.display = 'block';
        document.getElementById('main-player').style.display = 'block';
        drawStack('deal');
    }
}

// manages appearance of cards on the table 
// 'empty' will display a table with only placeholders for card
// 'deal' will add a card at a time to the table to mimic dealing out
function table(action, data) {
    let cards;
    let decks;
    cards = document.getElementsByClassName('card');
    decks = document.getElementsByClassName('deck');
    console.log(cards);
    console.log(decks);
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
        // alert('will add class "missing" to all card places on the table');
    } else if(action === "deal") {}
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
        console.log(freshDeck);
        freshDeck = shuffle(freshDeck);
        console.log(freshDeck);
        drawDeck.push(freshDeck);
        console.log(drawDeck);
        // for(let i = 0; i < 3; i++) {
        //     for(let j = 0; j < 3; j++) {
        //         let x = turnIndex % 4;
        //         playerData[x]
        //     }
        // }
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
function logBot(Pn, strg1) {
    let x;
    let y;
    if (strg1.includes('_BOT ') === true) {
        x = strg1.indexOf(',');
        // console.log(x);
        if (x > 0) {
            y = strg1.slice(0, x);
            x = parseInt(strg1.slice(x + 1, x + 2));
            // console.log(x);

        } else {
            x = 2;
        }
        return strg1 = [y, x];
    } else {
        return strg1 = [strg1, 0];
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