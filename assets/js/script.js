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
        x += ' hidden';
        menu.style.display = 'none';
    } else {
        x = remClass(x, ' hidden');
        bars += ' hidden';
        menu.style.display = 'block';
    }
    menuBtn.children[1].setAttribute('class', x);
    menuBtn.children[0].setAttribute('class', bars);
}

function remClass(strg1, term) {
    let idx = strg1.indexOf(term);
    if (idx >= 0) {
        strg1 = strg1.replace(term, '');
    }
    return strg1;
}