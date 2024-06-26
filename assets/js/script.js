// Constant for gameData()
const playerData = {};

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
                if(this.innerText === "Start Game"){
                    let P1 = [String(document.getElementById('P1-name').value), 0];
                    let P2 = [String(document.getElementById('P2-name').value)];
                    let P3 = [String(document.getElementById('P2-name').value)];
                    let P4 = [String(document.getElementById('P2-name').value)];
                    // P1.push(0);
                    // addBot(P2)
                    // console.log(P2);
                    // console.log(P2[0].includes('_BOT 2'));
                    if (P2[0].includes('_BOT 2') === true){
                        let x = P2[0].indexOf(',');
                        // console.log(x);
                        if ( x > 0){
                            x = parseInt(P2[0].slice(x + 1, x + 2));
                            // console.log(x);
                        }
                        P2 = ['_BOT 2', x];
                    }
                    console.log(P2);
                    alert(P2);
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
function gameData(action, data){
    if (action === 'new'){

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
function addClass(strg1, term){
    let idx = strg1.indexOf(term);
    if (idx < 0) {
        strg1 += term;
    }
    return strg1;
}