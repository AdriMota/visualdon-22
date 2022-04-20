import * as d3 from 'd3'
import './index.css'

// PIB par habitant par country et pour chaque année depuis 1800
import gdp from '../data/income_per_person_gdppercapita_ppp_inflation_adjusted.csv' //PIB par habitant par country et pour chaque année depuis 1800
// Espérance de vie par country et pour chaque année depuis 1800
import lifeExpectancy from '../data/life_expectancy_years.csv' //espérance de vie par country et pour chaque année depuis 1800
// Population depuis 1800
import population from '../data/population_total_better.csv' //population depuis 1800 par country 

// Récupère toutes les années
const years = Object.keys(population[0])
// console.log(years)

let pop = [],
    income = [],
    life = [],
    dataCombined = [];

// Merge data
const mergeByCountry = (a1, a2, a3) => {
    let data = [];
    a1.map(itm => {
        let newObject = {
            ...a2.find((item) => (item.country === itm.country) && item),
            ...a3.find((item) => (item.country === itm.country) && item),
            ...itm
        }
        data.push(newObject);
    })
    return data;
}

years.forEach(year => {
    pop.push({ "year": year, "data": converterSI(population, year, "pop") })
    income.push({ "year": year, "data": converterSI(gdp, year, "income") })
    life.push({ "year": year, "data": converterSI(lifeExpectancy, year, "life") })
    const popyear = pop.filter(d => d.year == year).map(d => d.data)[0];
    const incomeyear = income.filter(d => d.year == year).map(d => d.data)[0];
    const lifeyear = life.filter(d => d.year == year).map(d => d.data)[0];
    dataCombined.push({ "year": year, "data": mergeByCountry(popyear, incomeyear, lifeyear) })
});

function converterSI(array, variable, variableName) {
    let convertedVariable = array.map(d => {
        // Trouver le format SI (M, B, k)
        let SI = typeof d[variable.toString()] === 'string' || d[variable.toString()] instanceof String ? d[variable.toString()].slice(-1) : d[variable.toString()];
        // Extraire la partie numérique
        let number = typeof d[variable.toString()] === 'string' || d[variable.toString()] instanceof String ? parseFloat(d[variable.toString()].slice(0, -1)) : d[variable.toString()];
        // Selon la valeur SI, multiplier par la puissance
        switch (SI) {
            case 'M': {
                return { "country": d.country, [variableName]: Math.pow(10, 6) * number };
                break;
            }
            case 'B': {
                return { "country": d.country, [variableName]: Math.pow(10, 9) * number };
                break;
            }
            case 'k': {
                return { "country": d.country, [variableName]: Math.pow(10, 3) * number };
                break;
            }
            default: {
                return { "country": d.country, [variableName]: number };
                break;
            }
        }
    })
    return convertedVariable;
};


/* ------------------------------------------------------------------------------
    GRAPH
------------------------------------------------------------------------------ */
// Ajouter un titre
d3.select("body")
    .append("h1")
    .text("Exercice 3")

// Ajouter une div qui contiendra le graph
d3.select("body")
    .append("div")
    .attr('id', 'graphAnimate')

let widthDiv = document.querySelector('#graph').offsetWidth;
let heightDiv = document.querySelector('#graph').offsetHeight;
    
const margin = { top: 30, right: 50, bottom: 60, left: 50 },
    width = widthDiv - margin.left - margin.right,
    height = heightDiv - margin.top - margin.bottom

// Créer le svg du graph
const svg = d3.select("#graphAnimate")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


/* ------------------------------------------------------------------------------
    AXES
------------------------------------------------------------------------------ */
// Dimensions de l'axe X
let maxGDP = 0;
dataCombined.forEach(year => {
    year.data.forEach(country => {
        if (country.income > maxGDP) {
            maxGDP = country.income;
        }
    })
});

// Dimensions de l'axe Y
let maxLifeExpectancy = 0;
dataCombined.forEach(year => {
    year.data.forEach(country => {
        if (country.life > maxLifeExpectancy) {
            maxLifeExpectancy = country.life;
        }
    })
});

// Échelle pour l'axe X
let x = d3.scaleSqrt()
    .domain([0, maxGDP])
    .range([0, width])
    .nice()

// Échelle pour l'axe Y
let y = d3.scalePow()
    .exponent(1.7)
    .domain([0, maxLifeExpectancy * 1.05])
    .range([height, 0])
    .nice()

// Fonction échelle pour la taille des cercles
let sqrtScale = d3.scaleSqrt()
    .domain([200000, 131000000])
    .range([4, 30]);


/* ------------------------------------------------------------------------------
    DESSINER LES AXES
------------------------------------------------------------------------------ */
// Axe X
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .call(d3.axisBottom(x).tickSize(-height).tickFormat(d3.format('~s')))

// Axe Y
svg.append("g")
    .call(d3.axisLeft(y))
    .call(d3.axisLeft(y).tickSize(-width))


/* ------------------------------------------------------------------------------
    APPARENCE
------------------------------------------------------------------------------ */
// Lignes
svg.selectAll(".tick line, .domain")
    .attr("stroke", "lightgray")
    .attr("opacity", "0.4")

// Description axe X 
svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width / 2 + margin.left + 30)
    .attr("y", height + margin.top + 20)
    .text("PIB par habitant [CHF]");

// Description axe Y
svg.append("text")
    .attr("text-anchor", "center")
    .attr("transform", "rotate(-90)")
    .attr("x", -margin.top - height / 2 - 35)
    .attr("y", -margin.left + 20)
    .text("Espérance de vie")


/* ------------------------------------------------------------------------------
    ANIMATION
------------------------------------------------------------------------------ */
// Variable où on stocke l'id de notre intervalle
let intervalle;

function animate() {
    intervalle = setInterval(lauchAnimation, 100);
}

d3.select('#graphAnimate')
    .append('h2')
    .attr('id', 'actualYear')

let i = -1;
function lauchAnimation() {
    // Recommencer si à la fin du tableau
    if (i == 250) {
        i = 0;
    } else {
        i++;
    }

    d3.select('#actualYear').text(dataCombined[i].year)
    updateChart(dataCombined[i]);
}

// Fonction de mise à jour du graphique
function updateChart(data_iteration) {
    svg.selectAll('circle')
        .data(data_iteration.data)
        .join(enter => enter.append('circle')
            .attr("stroke", "white")
            .style("opacity", "0.4")
            .style("fill", "red")
            .attr('cx', function (d) { return x(d.income); })
            .attr('cy', function (d) { return y(d.life); }).transition(d3.transition()
                .duration(500)
                .ease(d3.easeLinear)).attr('r', function (d) { return sqrtScale(d.pop); }),
            update => update.transition(d3.transition()
                .duration(500)
                .ease(d3.easeLinear))
                .attr('r', function (d) { return sqrtScale(d.pop); })
                .attr('cx', function (d) { return x(d.income); })
                .attr('cy', function (d) { return y(d.life); }),
            exit => exit.remove())
}

animate();