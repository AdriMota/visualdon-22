/**
* Changes the color of the SVG rectangle with ID 'myrect'
*/

let rect = document.querySelectorAll('.rect');

rect.addEventListener("click", evt => {
    rect.classList.toggle('.lightblue');
})