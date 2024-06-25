// wait for the DOM to finish loading before running the game
// Get the button elements and add event listeners to them
// based on DOM loading event listener from Love Maths walkthrough project

document.addEventListener("DOMContentLoaded", function(){
    let buttons = document.getElementsByClassName("click"); // event listener will look clickable elements by the class "click"
    
    for (let button of buttons){
        button.addEventListener('click', function() {
            if (this.getAttribute('action') === 'submit'){
                alert('this element has an action attr of "submit"');
            } else {
                let item = this.getAttribute('id') === null ? this.innerText : this.getAttribute('id');
                alert(item);
            }
        })
    }
    

})