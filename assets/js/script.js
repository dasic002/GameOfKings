/*jshint esversion: 6 */
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
// Constant for selected cards to swap
const pair = [];
// Constant to track curent picked card
const pickCard = [];
// timed function index, to trigger the correct function specified on a timed action
// 0 will mean ignore, 1 will deal the cards to the table, 2 will reveal the bottom cards of a hand, 3 will offer the knock button, 4 will reveal knocked hand
let timedIdx = 0;
// variable to store the setTimeout function
let timer;
// variable to record if and who has knocked, 4 means no one has knocked, 0-3 will match the playerData index and compared to turnIndex
let knocker = 4;
// variable to mark a player has locked in their hand, 2 is freshly locked triggers scoring, 1 just waits for the next human player to be prompted with result, see ln 600
let endRound = 0;
// variable for tracking instructions page
let howToPg = 0;
// variable to compile messages with what the other players have done, the aim is to only track the last 4 actions i.e.: a full turn of the table
const acts = ['New Game!'];
// variable to compile the string per player's turn.
let actStrg = '';


// wait for the DOM to finish loading before running the game
// Get the button elements and add event listeners to them
// based on DOM loading event listener from Love Maths walkthrough project
document.addEventListener("DOMContentLoaded", function () {
    let menuButtons = document.getElementById('menu').getElementsByClassName("click"); // event listener will look clickable elements in the menu div by the class "click"


    for (let button of menuButtons) {
        button.addEventListener('click', function () {
            if (this.getAttribute('id') === 'menu-btn') {
                menu();
            } else if (this.innerHTML === 'New Game') {
                menu();
                document.getElementById('how-to').style.display = '';
                document.getElementById('game-area').style.display = '';
                document.getElementById('credits').style.display = '';
                runGame('newGame');
            } else if (this.getAttribute('id') === 'htp-btn') {
                menu();
                howToNav();
                document.getElementById('how-to').style.display = 'block';
                document.getElementById('game-area').style.display = 'none';
                document.getElementById('credits').style.display = '';
            } else if (this.getAttribute('id') === 'sound-state') {
                let state = this.innerText;
                state = state === 'OFF' ? 'ON' : 'OFF';
                this.innerHTML = state;
            } else if (this.getAttribute('id') === 'credits-btn') {
                menu();
                document.getElementById('how-to').style.display = '';
                document.getElementById('game-area').style.display = 'none';
                document.getElementById('credits').style.display = 'block';
            } else {
                // alert me of any clickable element that has not got an action assigned yet
                let item = this.getAttribute('id') === null ? this.innerText : this.getAttribute('id');
                alert(item);
            }
        });
    }

    document.getElementById('left-how-to').addEventListener('click', function () {
        howToPg--;
        howToNav();
    });

    document.getElementById('right-how-to').addEventListener('click', function () {
        howToPg++;
        howToNav();
    });

    document.getElementById('cls-how-to').addEventListener('click', function () {
        document.getElementById('how-to').style.display = '';
        document.getElementById('game-area').style.display = '';
        document.getElementById('credits').style.display = '';
    });

    document.getElementById('cls-credits').addEventListener('click', function () {
        document.getElementById('how-to').style.display = '';
        document.getElementById('game-area').style.display = '';
        document.getElementById('credits').style.display = '';
    });

    let clickButtons = document.getElementById('game-area').getElementsByClassName("click"); // event listener will look clickable elements by the class "click"

    for (let button of clickButtons) {
        button.addEventListener('click', function () {
            if (this.getAttribute('id') === 'play' && this.getAttribute('action') === null) {
                document.getElementById('welcome').style.display = 'none';
                document.getElementById('player-form').style.display = 'block';
            } else if (this.getAttribute('id') === 'next') {
                if (this.innerText === "Start Game") {
                    let P1 = String(document.getElementById('P1-name').value);
                    P1 = P1.slice(0, 8); // should the human name string be longer that 8 characters, trim excess
                    let P2 = String(document.getElementById('P2-name').value);
                    let P3 = String(document.getElementById('P3-name').value);
                    let P4 = String(document.getElementById('P4-name').value);
                    P1 = P1 === '' ? ['Player 1', 0] : [P1, 0];
                    P2 = P2 === '' ? ['_BOT 1', 2] : logBot(P2);
                    P3 = P3 === '' ? ['_BOT 2', 2] : logBot(P3);
                    P4 = P4 === '' ? ['_BOT 3', 2] : logBot(P4);
                    P1 = {
                        botSkill: P1[1],
                        playerName: P1[0],
                        cardHand: [],
                        roundState: 0,
                        score: 0
                    };
                    P2 = {
                        botSkill: P2[1],
                        playerName: P2[0],
                        cardHand: [],
                        knownHand: [],
                        roundState: 0,
                        score: 0
                    };
                    P3 = {
                        botSkill: P3[1],
                        playerName: P3[0],
                        cardHand: [],
                        knownHand: [],
                        roundState: 0,
                        score: 0
                    };
                    P4 = {
                        botSkill: P4[1],
                        playerName: P4[0],
                        cardHand: [],
                        knownHand: [],
                        roundState: 0,
                        score: 0
                    };
                    playerData.push(P1, P2, P3, P4);
                    runGame('new');
                }
            } else if (this.getAttribute('id') === 'help') {
                menu('close');
                howToNav();
                document.getElementById('how-to').style.display = 'block';
                document.getElementById('game-area').style.display = 'none';
            } else if (this.getAttribute('action') === 'new-hand') {
                hand('open');
            } else if (this.getAttribute('id') === 'done') {
                if (newRound > 0) {
                    hand('open');
                    document.getElementById('done').classList.add('hidden');
                    document.getElementById('top-prompt').innerHTML = 'Ready...';
                    // clear values of any cards selected to shuffle so it is not stored and affecting the next player's turn
                    pickCard.splice(0);
                    pair.splice(0);
                    timedIdx = 2;
                    timedFunctions();
                    newRound--;
                } else {
                    alert(`not sure which occasion this done btn is exposed and it's not the first set of turns!`);
                    newRound = 0;
                    hand('close');
                    picked('clear');
                    shiftTurns();
                    table('update');
                    if (playerData[turnIndex].botSkill === 0) {
                        plrPrompt();
                    }
                }
            } else if (this.getAttribute('action') === 'to-pick') {
                hand('close');
                table('update');
            } else if (this.getAttribute('id') === 'game-end-btn') {
                if (this.innerHTML === 'New Game') {
                    runGame('newGame');
                } else {
                    runGame('newRound');
                }
            } else if (this.getAttribute('id').includes('p1-c')) {
                if (this.getAttribute('class').includes('deck')) {
                    pickCard.push(parseInt(this.getAttribute('id').slice(-1)) - 1);
                    this.classList.add('selected');
                    // disables cards being selected until selection is registered, once registered the cards are enabled again.
                    let cards = document.getElementById('main-player').getElementsByClassName('card');
                    for (let card of cards) {
                        card.setAttribute('disabled', true);
                    }
                    timedIdx = 3;
                    timer = setTimeout(timedFunctions, 200);
                } else if (this.getAttribute('class').includes('picked')) {
                    return; // do nothing
                } else {
                    alert('select a deck to pick from first!');
                }
            } else if (this.getAttribute('id').includes('-stack')) {
                document.getElementById('reject').removeAttribute('disabled');
                if (this.getAttribute('id').includes('draw')) {
                    picked('draw');
                } else if (this.getAttribute('id').includes('discard')) {
                    picked('discard');
                }
            } else if (this.getAttribute('id') === 'reject') {
                if (pickCard[0] === discardDeck[0]) {
                    picked('clear');
                    pickCard.splice(0);
                } else {
                    actStrg += ` drew and discarded`;
                    this.setAttribute('disabled', true);
                    drawStack('discard');
                    cardFace('', discardDeck[0]);  // fetch the name of the card, since it is visible in the discard deck on discarding
                    timedIdx = 3;
                    timer = setTimeout(timedFunctions, 100);
                }
            } else if (this.getAttribute('id') === 'accept') {
                let card;
                if (pickCard[0] === discardDeck[0]) {
                    card = discardDeck.shift();
                    actStrg += ` took the`;
                    cardFace('', card);  // fetch the name of the card, since it is visible in the discard deck
                    actStrg += ` for their`;
                } else if (pickCard[0] === drawDeck.slice(-1)[0]) {
                    card = drawDeck.pop();
                    actStrg += ` drew for their`;
                }
                pair.push(card);
                picked('clear');
                pickCard.splice(0);
                hand('open');
                hand('swapout');
            } else if (this.getAttribute('id') === 'knock' && knocker != 4) {
                alert(`${playerData[knocker].playerName} has already knocked!`);
            } else if (this.getAttribute('id') === 'knock') {
                knocker = turnIndex;
                timedIdx = 0;
                actStrg += ` and <strong>KNOCKED!</strong>`;
                next();
            } else {
                let item = this.getAttribute('id') === null ? this.innerText : this.getAttribute('id');
                alert(item);
            }
        });
    }

});

function timedFunctions() {
    let x = document.getElementById('knock-count');
    let btm = document.getElementById('btm-prompt');
    btm = btm.getElementsByTagName('p')[0];
    let cards = document.getElementById('main-player').getElementsByClassName('card');
    switch (timedIdx) {
        case (0):
            clearTimeout(timer);
            x.innerHTML = '';
            break;
        case (1):
            break;
        case (2):
            switch (btm.innerHTML) {
                case '':
                    for (let card of cards) {
                        card.setAttribute('disabled', true);
                    }
                    btm.classList.remove('hidden');
                    btm.innerHTML = '3, ';
                    timer = setTimeout(timedFunctions, 1000);
                    break;
                case '3, ':
                    btm.innerHTML = '3, 2, ';
                    timer = setTimeout(timedFunctions, 1000);
                    break;
                case '3, 2, ':
                    btm.innerHTML = '3, 2, 1!';
                    table('values', 14);
                    table('values', 15);
                    timer = setTimeout(timedFunctions, 1000);
                    break;
                case '3, 2, 1!':
                    btm.innerHTML = '';
                    btm.classList.add('hidden');
                    table('hide', 14);
                    table('hide', 15);
                    actStrg += ` has viewed bottom cards`;
                    timedIdx = 4;
                    timer = setTimeout(timedFunctions, 200);
                    break;
            }
            break;
        case (3):

            switch (x.innerHTML) {
                case (''):
                    if (pickCard.length > 0) {
                        hand('swap', pickCard[0]);
                    }
                    pickCard.splice(0);
                    // wait for the last selection of card hand to register and pickCard to be cleared before accepting another selection. 
                    // Prevents fast selection on touchscreen that can cause more than 1 card being highlighted spite only 1 selection being registered.
                    for (let card of cards) {
                        card.removeAttribute('disabled');
                    }
                    if (newRound > 0) {
                        break;
                    } else if (knocker != 4) {
                        for (let card of cards) {
                            card.setAttribute('disabled', true);
                        }
                        picked('swapout');
                        x.innerHTML = ' 1';
                        document.getElementById('knock').classList.add('no-knock');
                        timer = setTimeout(timedFunctions, 1000);
                        break;
                    } else {
                        for (let card of cards) {
                            card.setAttribute('disabled', true);
                        }
                        picked('swapout');
                        x.innerHTML = ' 3';
                        timer = setTimeout(timedFunctions, 1000);
                    }
                    break;
                case (' 3'):
                    x.innerHTML = ' 2';
                    timer = setTimeout(timedFunctions, 1000);
                    break;
                case (' 2'):
                    x.innerHTML = ' 1';
                    timer = setTimeout(timedFunctions, 1000);
                    break;
                case (' 1'):
                    x.innerHTML = '';
                    timedIdx = 0;
                    next();
                    break;
            }
            break;
        case 4:
            switch (x.innerHTML) {
                case '':
                    document.getElementById('btm-prompt').classList.remove('hidden');
                    document.getElementById('knock').classList.remove('hidden');
                    if (knocker != 4) {
                        x.innerHTML = ' 1';
                        document.getElementById('knock').classList.add('no-knock');
                        timer = setTimeout(timedFunctions, 1000);
                        break;
                    } else {
                        x.innerHTML = ' 3';
                        timer = setTimeout(timedFunctions, 1000);
                    }
                    break;
                case (' 3'):
                    x.innerHTML = ' 2';
                    timer = setTimeout(timedFunctions, 1000);
                    break;
                case (' 2'):
                    x.innerHTML = ' 1';
                    timer = setTimeout(timedFunctions, 1000);
                    break;
                case (' 1'):
                    x.innerHTML = '';
                    document.getElementById('knock').classList.add('hidden');
                    document.getElementById('btm-prompt').classList.add('hidden');
                    timedIdx = 0;
                    next();
                    break;
            }
            break;
    }
}

function next() {
    // if the player just played is human output their actions string to acts array, botPlay() already includes this code. Necessary to keep both so it works when bots play their new hand.
    if (playerData[turnIndex].botSkill === 0) {
        // limits the array of strings to the last 4 turns. i.e.: a full table's turn.
        if (acts.length > 3) {
            acts.shift();
        }
        // push the last act string to the acts array
        acts.push(actStrg);
        // clear the act string of the last turn in prep for the next turn
        actStrg = '';
    }
    hand('close');
    picked('clear');
    shiftTurns();
    table('update');
    if (endRound === 1 && newRound > 0) {
        table('update');
        return;
    }
    plrPrompt();
}

// toggles the navigation menu open and close, including changing the icon from hamburger bars to cross
function menu(data) {
    let menu = document.getElementById('menu-list');
    let state = menu.style.display;
    let menuBtn = document.getElementById('menu-btn');
    let bars = menuBtn.children[0];
    let x = menuBtn.children[1];
    if (state === 'block' || data === 'close') {
        bars.classList.remove('hidden');
        x.classList.add('hidden');
        menu.style.display = 'none';
    } else {
        x.classList.remove('hidden');
        bars.classList.add('hidden');
        menu.style.display = 'block';
    }
}

function howToNav() {
    let min = 0;
    let max = 9;
    howToPg = howToPg < min ? max : howToPg;
    howToPg = howToPg > max ? min : howToPg;
    document.getElementById('how-to-0').style.display = 'none';
    document.getElementById('how-to-1').style.display = 'none';
    document.getElementById('how-to-2').style.display = 'none';
    document.getElementById('how-to-3').style.display = 'none';
    document.getElementById('how-to-4').style.display = 'none';
    document.getElementById('how-to-5').style.display = 'none';
    document.getElementById('how-to-6').style.display = 'none';
    document.getElementById('how-to-7').style.display = 'none';
    document.getElementById('how-to-8').style.display = 'none';
    document.getElementById('how-to-9').style.display = 'none';
    switch (howToPg) {
        case 0:
            document.getElementById('how-to-0').style.display = 'block';
            break;
        case 1:
            document.getElementById('how-to-1').style.display = 'block';
            break;
        case 2:
            document.getElementById('how-to-2').style.display = 'block';
            break;
        case 3:
            document.getElementById('how-to-3').style.display = 'block';
            break;
        case 4:
            document.getElementById('how-to-4').style.display = 'block';
            break;
        case 5:
            document.getElementById('how-to-5').style.display = 'block';
            break;
        case 6:
            document.getElementById('how-to-6').style.display = 'block';
            break;
        case 7:
            document.getElementById('how-to-7').style.display = 'block';
            break;
        case 8:
            document.getElementById('how-to-8').style.display = 'block';
            break;
        case 9:
            document.getElementById('how-to-9').style.display = 'block';
            break;
    }
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
        document.getElementById('knock').classList.remove('no-knock');
        drawStack('deal');
        // get the div to hold the last actions played
        let actsDisplay = document.getElementById('actions');

        for (let i = 0; i < 4; i++) {
            actsDisplay.children[i].innerHTML = '';
        }
        plrPrompt();
    } else if (action === 'newGame') {
        // hide game end prompt
        document.getElementById('decks').style.display = '';
        let gamePrompt = document.getElementById('game-end');
        gamePrompt.classList.add('hidden');
        // hide game table
        document.getElementById('other-players').style.display = 'none';
        document.getElementById('decks-area').style.display = 'none';
        document.getElementById('main-player').style.display = 'none';
        // display up player entry form
        document.getElementById('welcome').style.display = 'none';
        document.getElementById('player-form').style.display = 'block';
        // prefill names and bots of last game if there is data to display
        if (playerData != '') {
            document.getElementById('P1-name').value = playerData[0].playerName;
            document.getElementById('P2-name').value = `${playerData[1].playerName} ,${playerData[1].botSkill}`;
            document.getElementById('P3-name').value = `${playerData[2].playerName} ,${playerData[2].botSkill}`;
            document.getElementById('P4-name').value = `${playerData[3].playerName} ,${playerData[3].botSkill}`;
        }
        // clear playerData
        playerData.splice(0);
        // reset values for new round
        oldDealerIndex = 0;
        dealerIndex = 0;
        turnIndex = 0;
        drawDeck.splice(0);
        discardDeck.splice(0);
        pair.splice(0);
        pickCard.splice(0);
        timedIdx = 0;
        knocker = 4;
        endRound = 0;
        acts.splice(0);
        acts.push('New Game!');
        // run new game setup
    } else if (action === 'newRound') {
        // shift dealer to turn
        oldDealerIndex = dealerIndex;
        // reset values for new round
        playerData[0].cardHand.splice(0);
        playerData[1].cardHand.splice(0);
        playerData[2].cardHand.splice(0);
        playerData[3].cardHand.splice(0);
        playerData[1].knownHand.splice(0);
        playerData[2].knownHand.splice(0);
        playerData[3].knownHand.splice(0);
        playerData[0].roundState = 0;
        playerData[1].roundState = 0;
        playerData[2].roundState = 0;
        playerData[3].roundState = 0;
        turnIndex = 0;
        drawDeck.splice(0);
        discardDeck.splice(0);
        pair.splice(0);
        pickCard.splice(0);
        timedIdx = 0;
        knocker = 4;
        endRound = 0;
        acts.splice(0);
        acts.push('New Round!');
        // hide game end prompt
        document.getElementById('decks').style.display = '';
        let gamePrompt = document.getElementById('game-end');
        gamePrompt.classList.add('hidden');
        // run new game setup
        runGame('new');
    }
}

// manages appearance of cards on the table 
// 'empty' will display a table with only placeholders for card
// 'deal' will add player names, scores and a card at a time to the table to mimic dealing out
// 'values' will return the card ID as inner HTML text in the card location
// 'playerNames' looks up the turnIndex and places names and scores in the correct position depending on whose turn it is, 
// 'update' iterates through playernames and values to update the view for the current player
// so the current player will always be in the bottom card hand..
function table(action, data) {
    let cards;
    let decks;
    cards = document.getElementsByClassName('card');
    decks = document.getElementsByClassName('deck');

    // get player name and icons groups
    let pNameGroup = document.getElementsByClassName('player-name');

    // player scoring space
    let p1Score = document.getElementById('scr1');
    let p2Score = document.getElementById('scr2');
    let p3Score = document.getElementById('scr3');
    let p4Score = document.getElementById('scr4');

    if (action === 'empty') {
        for (let card of cards) {
            card.classList.add('missing-card');
            card.classList.remove('clubs', 'diamonds', 'hearts', 'spades');
            card.innerHTML = '';
        }
        for (let card of decks) {
            card.classList.add('missing-card');
            card.classList.remove('clubs', 'diamonds', 'hearts', 'spades');
            card.innerHTML = '';
        }

    } else if (action === "deal") {
        if (data < 16) {
            cards[data].classList.remove('missing-card');
        } else if (data < 22) {
            data = data - 16;
            decks[data].classList.remove('missing-card');
        } else {
            alert('action "deal" given data larger than 21!');
        }

    } else if (action === 'values') {
        if (data < 16) {
            cardFace(cards[data], playerData[turnIndex].cardHand[data % 4]);
        } else if (data < 19) {
            data = data - 16;
            let i = data + 1;
            let x = decks[data];

            if (drawDeck.length === 0) {
                let x = discardStack('donate');
                drawStack('add', x);
                decks[data].innerHTML = '';
            }

            if (drawDeck[drawDeck.length - i] === undefined) {
                decks[data].innerHTML = '';
                x.classList.add('missing-card');
            } else {
                decks[data].innerHTML = '';
                x.classList.remove('missing-card');
            }

        } else if (data < 22) {
            data = data - 16;
            let i = data - 3;
            let x = decks[data];
            if (discardDeck[i] === undefined) {
                decks[data].innerHTML = '';
                x.classList.add('missing-card');
            } else {
                cardFace(decks[data], discardDeck[i]);
                decks[data].classList.remove('missing-card');
            }
        } else {
            alert('action "values" given data larger than 21!');
        }

    } else if (action === 'hide') {
        if (data < 16) {
            cards[data].innerHTML = '';
            cards[data].classList.remove('clubs', 'diamonds', 'hearts', 'spades');
        } else {
            alert(`error: card place ${data} not valid under table('hide')`);
        }
    } else if (action === 'playerNames') {
        let x = turnIndex - 1;
        let y;  // variable to track place of player on table
        for (let i = 0; i < 4; i++) {
            if (x > 2) {
                x = 0;
            } else {
                x++;
            }
            let name = playerData[x].playerName;
            let scr = playerData[x].score;

            switch (i) {
                case (0):
                    p1Score.innerHTML = scr; // display player current score
                    y = 3;
                    break;
                case (1):
                    p2Score.innerHTML = scr;
                    y = 0;
                    break;
                case (2):
                    p3Score.innerHTML = scr;
                    y = 1;
                    break;
                case (3):
                    p4Score.innerHTML = scr;
                    y = 2;
            }

            // hide all icons after player's name
            for (let j = 1; j < 5; j++) {
                let x = pNameGroup[y].children[j];
                x.classList.add('hidden');
            }

            // Update player name on location
            pNameGroup[y].children[0].innerHTML = name;

            // Add relevant icon next to player's name
            if (knocker === x && (playerData[x].roundState === 0 || playerData[x].roundState === 'k')) {
                pNameGroup[y].children[1].classList.remove('hidden'); // show bell for knocker
            } else if (playerData[x].roundState === 'd') {
                pNameGroup[y].children[4].classList.remove('hidden'); // show 2x for losing knocker
            } else if (playerData[x].roundState === 'w') {
                pNameGroup[y].children[2].classList.remove('hidden'); // show trophy for winner of round
            } else if (playerData[x].roundState === 'l') {
                pNameGroup[y].children[3].classList.remove('hidden'); // show cross for losers
            }
        }

    } else if (action === 'update') {
        for (let i = 16; i < 22; i++) {
            table('values', i);
        }

        if (endRound === 0 && knocker != 4) {  // this will be the only point endRound becomes true because table updates after player takes turn
            endRound = 2;
            document.getElementById('knock').classList.add('no-knock');
            playerData[knocker].roundState = 'k';  //  
            if (newRound > 0) {
                // if a player knocks when they view their bottom cards, jump to scoring and end the game
                scoreVal();
                // update table card faces
                for (let i = 0; i < 16; i++) {
                    if (i % 4 === 0) {
                        shiftTurns();
                    }
                    table('values', i);
                }
                endRound = 1;
                return;
            }
        } else if (endRound > 0 && knocker === 4) { // should there be an error or a point the endRound var is not cleared
            endRound = 0;
            document.getElementById('knock').classList.remove('no-knock');
        } else if (turnIndex === knocker) {
            // first time turnIndex matches knocker score card hands only once!
            if (endRound === 2) {
                scoreVal();
            }
            // update table card faces
            for (let i = 0; i < 16; i++) {
                if (i % 4 === 0) {
                    shiftTurns();
                }
                table('values', i);
            }
            endRound--;
        } else if (endRound === 1) { // next human players should get a chance to see the score before choosing to go on to the next round
            for (let i = 0; i < 16; i++) {
                if (i % 4 === 0) {
                    shiftTurns();
                }
                table('values', i);
            }
        }
        table('playerNames');
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
        freshDeck = shuffle(freshDeck);
        for (let i = 0; i < freshDeck.length; i++) {
            drawDeck.push(freshDeck[i]);
        }
        console.log(drawDeck);
        if (dealerIndex === oldDealerIndex) {
            shiftTurns('dealer');
            turnIndex = dealerIndex;
            newRound = 5;
        }
        for (let i = 0; i < 4; i++) { // iterate through card hand position
            for (let j = 0; j < 4; j++) { // iterate through players, so deals card 1 to all players, before card 2
                card = drawDeck.pop();
                playerData[turnIndex].cardHand.push(card);
                let place = i + 4 * j;
                table('deal', place);
                if (place > 18) {
                    table('values', place);
                }
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

    } else if (action === 'discard') {
        let card = drawDeck.pop();
        discardStack('add', card);
        pickCard.splice(0);
    } else if (action === 'add') {
        for (let i = 0; i < data.length; i++) {
            drawDeck.push(data[i]);
        }
        console.log(drawDeck);
    }
}

// will manipulate cards present in the discard stack
// 'add' will add the card ID as a string value forwarded as the data
function discardStack(action, data) {
    if (action === 'add') {
        discardDeck.unshift(data);
        let x = discardDeck.length;
        x = Math.min(x, 3);
        // Run through the length of discard stack up to its top 3 cards to illustrate them on the table
        for (let i = 0; i < x; i++) {
            table('deal', 19 + i);
            table('values', 19 + i);
        }
    } else if (action === 'donate') {
        let arr = discardDeck.splice(1);
        arr = shuffle(arr);
        return arr;
    }
}

// function will produce a prompt for human players when more than one human is playing on the same device
function plrPrompt() {
    // get the div to hold the last actions played
    let actsDisplay = document.getElementById('actions');

    for (let i = 0; i < acts.length; i++) {
        if (acts[i] != '') {
            actsDisplay.children[i].innerHTML = `${acts[i]}`;
        } else {
            actsDisplay.children[i].innerHTML = '';
        }
    }
    actStrg = ''; // make sure act string is clear before new info added
    actStrg += `${playerData[turnIndex].playerName}`;

    if (newRound > 1) {
        if (playerData[turnIndex].botSkill === 0) {
            console.log(`${playerData[turnIndex].playerName} is a human player! on newRound ${newRound}`);
            document.getElementById('wlcm-msg').innerHTML = `${playerData[turnIndex].playerName}`;
            document.getElementById('play').innerHTML = 'READY';
            document.getElementById('play').setAttribute('action', 'new-hand');
            document.getElementById('welcome').style.display = 'block';
            document.getElementById('actions').style.display = 'block';
            document.getElementById('other-players').style.display = 'none';
            document.getElementById('decks-area').style.display = 'none';
            document.getElementById('main-player').style.display = 'none';
        } else {
            botPlay('newHand');
            newRound--;
            if (newRound > 0) {
                shiftTurns();
                plrPrompt();
            }
        }

    } else {
        newRound = 0;
        if (playerData[turnIndex].botSkill === 0) {
            console.log(`${playerData[turnIndex].playerName} is a human player!`);
            if (endRound === 2) {
                document.getElementById('wlcm-msg').innerHTML = `${playerData[turnIndex].playerName}!<br>last card!`;
            } else if (endRound === 1) {
                document.getElementById('wlcm-msg').innerHTML = `${playerData[turnIndex].playerName}!<br>End of round!`;
            } else {
                document.getElementById('wlcm-msg').innerHTML = `${playerData[turnIndex].playerName}!<br>Pick a card!`;
            }

            document.getElementById('play').innerHTML = 'READY';
            document.getElementById('play').setAttribute('action', 'to-pick');
            document.getElementById('welcome').style.display = 'block';
            document.getElementById('other-players').style.display = 'none';
            document.getElementById('decks-area').style.display = 'none';
            document.getElementById('main-player').style.display = 'none';
        } else {
            botPlay('turn'); // --- code to get bot to make a decision on play;
            next();
        }
    }
}

// presents current player with hand of cards, 
// 'open' will give the player a chance to swap card positions before the game begins
// 'close' will go back to table view
function hand(action, data) {
    document.getElementById('top-prompt').style.display = 'block';
    document.getElementById('btm-prompt').style.display = 'block';
    document.getElementById('welcome').style.display = 'none';
    document.getElementById('other-players').style.display = 'none';
    document.getElementById('decks-area').style.display = 'none';
    document.getElementById('main-player').style.display = 'block';
    // selects the 4 cards in the 'main-player' div only
    let cards = document.getElementById('main-player').getElementsByClassName('card');

    if (action === 'open') {
        // adds class of deck so appearance is larger as set for the cards in the decks
        for (let card of cards) {
            card.classList.add('deck');
            card.classList.remove('selected');
            card.removeAttribute('disabled');
        }
        // presents main-player name, score and message
        document.getElementById('p1').innerHTML = playerData[turnIndex].playerName;
        document.getElementById('scr1').innerHTML = playerData[turnIndex].score;
        if (newRound > 0) {
            document.getElementById('top-prompt').innerHTML = 'Want to shuffle?';
            document.getElementById('done').classList.remove('hidden');
        } else {
            document.getElementById('top-prompt').innerHTML = 'Pick a card to swap';
            document.getElementById('btm-prompt').style.display = 'none';
        }

    } else if (action === 'swap') {
        pair.push(data);
        if (pair.length % 2 === 0) {  // run when pair has an even number of entries, to reduce the risk of failure when it has not been cleared
            let x = pair.slice(-2)[0];  // slice the data from the end as the entries are pushed on and may have more than 2
            let y = pair.slice(-2)[1];
            if (Number.isInteger(x)) {
                let a = playerData[turnIndex].cardHand[x];
                let b = playerData[turnIndex].cardHand[y];
                playerData[turnIndex].cardHand.splice(x, 1, b);
                playerData[turnIndex].cardHand.splice(y, 1, a);
                pair.splice(0);
                hand('open');
            } else {
                console.log(`${playerData[turnIndex].playerName} 's card hand ${playerData[turnIndex].cardHand}`);
                let b = playerData[turnIndex].cardHand.splice(y, 1)[0];
                playerData[turnIndex].cardHand.splice(y, 0, x);
                console.log(playerData[turnIndex].cardHand);
                hand('wordPlace', y);  // fetch the wording of the player's card place in their hand
                actStrg += `, `;
                cardFace('', b);  // fetch the name of the card, since it is visible in the discard deck on discarding
                pair.pop();  // clear last entry
                pair.push(b);  // add this as the last entry
                discardStack('add', b);
            }
        }
    } else if (action === 'swapout') {
        for (let card of cards) {
            card.removeAttribute('disabled');
        }
    } else if (action === 'close') {
        for (let card of cards) {
            card.classList.remove('deck', 'selected');
        }
        document.getElementById('top-prompt').style.display = 'none';
        document.getElementById('btm-prompt').style.display = 'none';
        document.getElementById('other-players').style.display = 'block';
        document.getElementById('decks-area').style.display = 'block';
        document.getElementById('main-player').style.display = 'block';
    } else if (action === 'wordPlace') {
        switch (data) {
            case 0:
                actStrg += ` top left`;
                break;
            case 1:
                actStrg += ` top right`;
                break;
            case 2:
                actStrg += ` bottom left`;
                break;
            case 3:
                actStrg += ` bottom right`;
                break;
        }
    }
}

// to display the picked card front and center for the player to decide whether they are keeping it or discarding it
// 'draw' when selected from draw deck
// 'discard' when selected from the discard deck
// 'clear' will reset the elements back to normal
function picked(action, data) {
    if (action === 'clear') {
        document.getElementById('other-players').style.display = 'block';
        document.getElementById('decks-area').style.display = 'block';
        document.getElementById('top-prompt').style.display = 'none';
        document.getElementById('btm-prompt').style.display = 'none';
        document.getElementById('main-player').style.display = 'block';
        document.getElementById('top-prompt').innerHTML = ``;
        document.getElementById('p1-c2').style.display = '';
        document.getElementById('main-player').getElementsByClassName('btm-cards')[0].style.display = '';
        document.getElementById('main-player').getElementsByClassName('player-name')[0].style.display = '';
        document.getElementById('main-player').getElementsByClassName('scores')[0].style.display = '';

        let x = document.getElementById('p1-c1');
        x.classList.remove('picked', 'selected', 'clubs', 'diamonds', 'hearts', 'spades');

        let y = document.getElementById('done');
        y.classList.add('hidden');

        y = document.getElementById('knock');
        y.classList.add('hidden');

        y = document.getElementById('reject');
        y.classList.add('hidden');

        y = document.getElementById('accept');
        y.classList.add('hidden');

        x.innerHTML = '';

    } else {
        document.getElementById('other-players').style.display = 'none';
        document.getElementById('decks-area').style.display = 'none';
        document.getElementById('top-prompt').style.display = 'block';
        document.getElementById('btm-prompt').style.display = 'block';
        document.getElementById('main-player').style.display = 'block';
        document.getElementById('top-prompt').innerHTML = `${playerData[turnIndex].playerName}<br>Keep this card?`;
        document.getElementById('p1-c2').style.display = 'none';
        document.getElementById('main-player').getElementsByClassName('btm-cards')[0].style.display = 'none';
        document.getElementById('main-player').getElementsByClassName('player-name')[0].style.display = 'none';
        document.getElementById('main-player').getElementsByClassName('scores')[0].style.display = 'none';

        let x = document.getElementById('p1-c1');
        x.classList.add('picked');
        x.classList.remove('selected');

        let y = document.getElementById('done');
        y.classList.add('hidden');

        y = document.getElementById('knock');
        y.classList.add('hidden');

        y = document.getElementById('reject');
        y.classList.remove('hidden');

        y = document.getElementById('accept');
        y.classList.remove('hidden');

        if (action === 'draw') {
            pickCard.push(drawDeck.slice(-1)[0]);
            cardFace(x, drawDeck.slice(-1)[0]);
        } else if (action === 'discard') {
            pickCard.push(discardDeck.slice(0)[0]);
            cardFace(x, discardDeck.slice(0)[0]);
        } else if (action === 'swapout') {
            let y = pair.slice(-2)[1] === undefined ? discardDeck[0] : pair.slice(-2)[1];
            cardFace(x, y);
            pair.splice(0);

            document.getElementById('top-prompt').innerHTML = `Card being discarded`;

            y = document.getElementById('done');
            y.classList.add('hidden');

            y = document.getElementById('knock');
            y.classList.remove('hidden');

            y = document.getElementById('reject');
            y.classList.add('hidden');

            y = document.getElementById('accept');
            y.classList.add('hidden');
        }
    }



}

// function to toggle add bot buttons appearance and action on text field to the left
function addBot(number) {
    let field;
    let button = document.getElementsByTagName('td');
    let value;
    switch (number) {
        case 2:
            field = 'P2-name';
            button = button[3].children[0];
            value = '_BOT 1 ,2';
            break;
        case 3:
            field = 'P3-name';
            button = button[5].children[0];
            value = '_BOT 2 ,2';
            break;
        case 4:
            field = 'P4-name';
            button = button[7].children[0];
            value = '_BOT 3 ,2';
            break;
    }
    if (document.getElementById(field).value != value) {
        document.getElementById(field).value = value;
        button.classList.replace('add-bot', 'close-bot');
        button.children[0].classList.add('hidden');
        button.children[1].classList.remove('hidden');
    } else {
        document.getElementById(field).value = '';
        document.getElementById(field).focus();
        button.classList.replace('close-bot', 'add-bot');
        button.children[1].classList.add('hidden');
        button.children[0].classList.remove('hidden');
    }
}

// Captures the data for bot players, including the skill level, and presumes standard level 2 bot if the fields are left empty
function logBot(strg1) {
    let x;
    let y;
    if (strg1.includes('_BOT ') === true) { // if string starts with '_BOT ' then look for comma
        x = strg1.indexOf(',');
        if (x > 0) {
            y = strg1.slice(0, x); // separate the bot name '_BOT n'
            x = parseInt(strg1.slice(x + 1, x + 2)); // get number for skill level after comma

        } else {
            y = strg1.slice(0, 7);
            x = 2; // else assume skill level of 2
        }
        strg1 = [y, x];
        return strg1;
    } else {
        humans = true;
        strg1 = strg1.slice(0, 8); // should the human name string be longer that 8 characters, trim excess
        strg1 = [strg1, 0]; // if does not contain '_BOT ' then assume the name is human and bot skill level is set to 0
        return strg1;
    }
}

// shifts turns for either play turn or dealer turn. Action must be 'dealer', otherwise assumes play turn is being shifted.
function shiftTurns(action) {
    let x;
    x = action === 'dealer' ? dealerIndex : turnIndex;
    if (x > 2) {
        x = 0;
    } else {
        x++;
    }
    if (action === 'dealer') {
        dealerIndex = x;
    } else {
        turnIndex = x;
    }
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

function cardFace(place, id) {
    let suit = place;
    if (suit != '') {
        switch (id[0]) {
            case ('c'):
                suit.classList.add('clubs');
                suit.classList.remove('diamonds', 'hearts', 'spades');
                break;
            case ('d'):
                suit.classList.add('diamonds');
                suit.classList.remove('clubs', 'hearts', 'spades');
                break;
            case ('h'):
                suit.classList.add('hearts');
                suit.classList.remove('diamonds', 'clubs', 'spades');
                break;
            case ('s'):
                suit.classList.add('spades');
                suit.classList.remove('diamonds', 'hearts', 'clubs');
                break;
        }
        switch (id[1]) {
            case ('x'):
                suit.innerHTML = 10;
                break;
            case '1':
                suit.innerHTML = "a";
                break;
            default:
                suit.innerHTML = id[1];
                break;
        }
    } else {
        // else if the place is blank, the function is to provide a written word description of the card
        switch (id[1]) {
            case ('x'):
                actStrg += ' 10 of';
                break;
            case ('j'):
                actStrg += ' Jack of';
                break;
            case ('q'):
                actStrg += ' Queen of';
                break;
            case ('k'):
                actStrg += ' King of';
                break;
            case '1':
                actStrg += ' Ace of';
                break;
            default:
                actStrg += ` ${id[1]} of`;
                break;
        }
        switch (id[0]) {
            case ('c'):
                actStrg += ` clubs`;
                break;
            case ('d'):
                actStrg += ' diamonds';
                break;
            case ('h'):
                actStrg += ' hearts';
                break;
            case ('s'):
                actStrg += ' spades';
                break;
        }

    }

}

function scoreVal() {
    let scores = [];
    let lowest = 0;
    let msg;
    for (let i = 0; i < 4; i++) {
        lowest = 0;
        for (let j = 0; j < 4; j++) {
            let x = playerData[i].cardHand[j][1];
            switch (x) {
                case 'k':
                    x = 0;
                    break;
                case 'q':
                case 'j':
                case 'x':
                    x = 10;
                    break;
                default:
                    x = parseInt(x);
                    break;
            }
            lowest += x;
        }
        scores.push(lowest);
        console.log(`${playerData[i].playerName} scored ${scores[i]}`);
    }
    lowest = Math.min(scores[0], scores[1], scores[2], scores[3]);
    console.log(`Lowest score = ${lowest}`);

    // copied from https://stackoverflow.com/questions/49215358/checking-for-duplicate-strings-in-javascript-array
    let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) !== index);
    // end of copied code

    if (scores[knocker] === lowest && findDuplicates(scores).includes(lowest) === false) {
        msg = `${playerData[knocker].playerName} won this round!`;
        console.log(msg);
        for (let i = 0; i < 4; i++) {
            if (knocker === i) {
                playerData[i].roundState = 'w';
            } else {
                playerData[i].roundState = 'l';
            }
        }
    } else {
        scores[knocker] = 2 * scores[knocker];
        msg = `${playerData[knocker].playerName} lost! Score doubled to ${scores[knocker]}.<br>${playerData[scores.indexOf(lowest)].playerName} scored ${lowest}!`;
        console.log(msg);
        for (let i = 0; i < 4; i++) {
            if (knocker === i) {
                playerData[i].roundState = 'd';
            } else if (scores.indexOf(lowest) === i) {
                playerData[i].roundState = 'w';
            } else {
                playerData[i].roundState = 'l';
            }
        }

    }
    // push scores to playerData
    for (let i = 0; i < 4; i++) {
        playerData[i].score += scores[i];
        scores.splice(i, 1, playerData[i].score);
    }

    document.getElementById('decks').style.display = 'none';
    let gamePrompt = document.getElementById('game-end');
    gamePrompt.classList.remove('hidden');

    if (Math.max(...scores) > 199) {
        msg = `${playerData[scores.indexOf(Math.min(...scores))].playerName} has won the game with ${Math.min(...scores)} points!`;
        gamePrompt.getElementsByTagName('h2')[0].innerHTML = 'End of game!';
        gamePrompt.getElementsByTagName('p')[0].innerHTML = msg;
        gamePrompt.getElementsByTagName('button')[0].innerHTML = 'New Game';
    } else {
        gamePrompt.getElementsByTagName('h2')[0].innerHTML = 'End of round!';
        gamePrompt.getElementsByTagName('p')[0].innerHTML = msg;
        gamePrompt.getElementsByTagName('button')[0].innerHTML = 'Next Round';
    }
}

function botPlay(action) {
    if (action === 'newHand') {
        actStrg += ` has viewed bottom cards`;
        playerData[turnIndex].knownHand.push('uu');
        playerData[turnIndex].knownHand.push('uu');
        playerData[turnIndex].knownHand.push(playerData[turnIndex].cardHand[2]);
        playerData[turnIndex].knownHand.push(playerData[turnIndex].cardHand[3]);
        let score = 0;
        for (let j = 0; j < 4; j++) {
            let x = playerData[turnIndex].knownHand[j][1];
            switch (x) {
                case 'k':
                case 'u':
                    x = 0;
                    break;
                case 'q':
                case 'j':
                case 'x':
                    x = 10;
                    break;
                default:
                    x = parseInt(x);
                    break;
            }
            score += x;
        }
        if (score < 4 && knocker === 4) {
            knocker = turnIndex;
            actStrg += ` and <strong>KNOCKED!</strong>`;
        } else {
            actStrg += `.`;
        }
    } else if (endRound != 1) {
        let selCrd1 = discardDeck[0][1]; // get the top discard card value
        let selCrd2 = drawDeck.slice(-1)[0][1]; // get the top drawdeck card value
        let selHand = [];
        let score = 0;
        for (let i = 0; i < 6; i++) {
            let x;
            if (i < 4) {
                x = playerData[turnIndex].knownHand[i][1];
            } else if (i === 4) {
                x = selCrd1;
            } else {
                x = selCrd2;
            }
            switch (x) {
                case 'k':
                    x = 0;
                    break;
                case 'q':
                case 'j':
                case 'x':
                case 'u':
                    x = 10;
                    break;
                default:
                    x = parseInt(x);
                    break;
            }
            if (i < 4) {
                score += x;
                selHand.push(x);
            } else if (i === 4) {
                selCrd1 = x;
            } else {
                selCrd2 = x;
            }
        }

        let highest = Math.max(...selHand); // what is the highest value card in our hand;
        // deduct from our known hand score
        score -= highest;
        // variable for the threshold in card value the bot will decide to keep or discard
        let pkLimit;
        // if no one has knocked yet, let's be picky, card has to be worth less than 4pts
        // else if someone has knocked on the table, we won't be so picky about the card, we just need to lower our score, anything less than 6pts is viable
        pkLimit = knocker === 4 ? 4 : 6;

        if (selCrd1 < highest && selCrd1 < pkLimit) {  // if the discard deck card is lower than the highest in our hand
            score += selCrd1;
            highest = selHand.indexOf(highest); // convert highest to its index in the array
            selCrd1 = discardDeck.shift();
            playerData[turnIndex].knownHand.splice(highest, 1, selCrd1);  // now we know the card value at this location of our hand, let's push to remember before proceeding
            actStrg += ` took the`;
            cardFace('', selCrd1);  // fetch the name of the card, since it is visible in the discard deck
            actStrg += ` for their`;
            hand('swap', selCrd1);
            hand('swap', highest);
        } else if (selCrd2 < highest && selCrd2 < pkLimit) { // if the discard deck pick won't work, let's try drawdeck card
            score += selCrd2;
            highest = selHand.indexOf(highest); // convert highest to its index in the array
            selCrd2 = drawDeck.pop();
            playerData[turnIndex].knownHand.splice(highest, 1, selCrd2);  // now we know the card value at this location of our hand, let's push to remember before proceeding
            actStrg += ` drew for their`;
            hand('swap', selCrd2);
            hand('swap', highest);
        } else {                        // we've committed to picking from the drawdeck so have to dispose it if it's no good for us
            score += highest;  // if neither card was good, restore score of known hand to before picking card.
            actStrg += ` drew and discarded`;
            drawStack('discard');
            cardFace('', discardDeck[0]);  // fetch the name of the card, since it is visible in the discard deck on discarding
        }
        actStrg += `.`;
        pair.splice(0);

        // if the known hand should score less than 8pts then player knocks
        if (score < 8 && knocker === 4) {
            knocker = turnIndex;
            actStrg += ` and <strong>KNOCKED!</strong>`;
        }
    }
    // limits the array of strings to the last 4 turns. i.e.: a full table's turn.
    if (acts.length > 3) {
        acts.shift();
    }
    // push the last act string to the acts array
    acts.push(actStrg);
    // clear the act string of the last turn in prep for the next turn
    actStrg = '';
}