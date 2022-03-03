/**
* Changes the color of the SVG rectangle with ID 'myrect'
*/

let rect = document.querySelector('.rect');
let donut = document.querySelector('.donut');

rect.addEventListener("click", evt => {
    rect.classList.toggle('color');
})

donut.addEventListener("mouseover", evt => {
    donut.setAttribute('r', '75');
})

donut.addEventListener("mouseout", evt => {
    donut.setAttribute('r', '60');
})