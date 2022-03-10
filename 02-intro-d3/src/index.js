import * as d3 from 'd3';

// Créer un svg avec des cercles
const svg = d3.select("body")
    .append("svg")
    .attr("class", "circles")
    .attr("width", 300)
    .attr("height", 320)

// Créer un groupe avec les cercles et les textes
for (let i = 0; i <= 2; i++) {

    const group = svg.append('g').attr('id', `g${i + 1}`)

    group.append('circle')
        .attr('id', `circle${i + 1}`)
        .attr('cx', i * 100 + 50)
        .attr('cy', i * 100 + 50)
        .attr('r', 40)

    group.append('text')
        .text(`cercle ${i + 1}`)
        .attr('x', i * 100 + 50)
        .attr('y', i * 100 + 105)
        .attr("text-anchor", "middle")

    if (i < 2) group.attr('class', 'move')
}

// Changer la couleur du 2e cercle
d3.select("#circle2").attr("fill", "pink");

// Déplacer le 1er et 2e cercle de 50px vers la droite
d3.selectAll(".move").attr("transform", "translate(50, 0)");

// Alignez verticalement les cercles en cliquant sur le dernier cercle
d3.select("#circle3").on("click", () => {
    d3.selectAll('g').attr('transform', null)
    d3.selectAll('circle').attr('cx', 250)
    d3.selectAll('text').attr('x', 250)
});


// Créer un histogramme de rectangles
const data = [20, 5, 25, 8, 15]

const divGraph = d3.select("body")
    .append("div")

const svgGraph = divGraph.append("svg")
        .attr("width", 300)
        .attr("height", 300)

const svgRect = svgGraph.append("svg")

svgRect.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
                .attr("x", (d, i) => i * 40) // 40 = espacement entre chaque barre
                .attr("y", (d) => svgRect.attr("height") - d + 50)
                .attr("width", 30) // 30 = largeur de chaque barre
                .attr("height", d => d)