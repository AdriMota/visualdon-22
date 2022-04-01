import * as d3 from 'd3'
import './index.css'

// PIB par habitant par pays et pour chaque année depuis 1800
import gdp from '../data/income_per_person_gdppercapita_ppp_inflation_adjusted.csv' //PIB par habitant par pays et pour chaque année depuis 1800
// Espérance de vie par pays et pour chaque année depuis 1800
import lifeExpectancy from '../data/life_expectancy_years.csv' //espérance de vie par pays et pour chaque année depuis 1800
// Population depuis 1800
import population from '../data/population_total_better.csv' //population depuis 1800 par pays 

// Population de 2021
population.forEach(pays => {
    (Object.keys(pays)).forEach(key => {
        if (typeof pays[key] == 'string' && key !== 'country') {
            pays[key] = strToInt(pays[key])
        }
    })
})

// PIB de 2021
let nbPib
gdp.forEach(pays => {
    if (typeof pays[2021] == 'string') {
        nbPib = strToInt(pays[2021])
        pays[2021] = nbPib
    }
})

// Data les plus récentes pour les pays qui n'ont pas d'info en 2021
lifeExpectancy.forEach(pays => {
    if (pays[2021] == null) {
        let i = 2021
        do {
            i--
        } while (pays[i] == null);
        pays[2021] = pays[i]
    }
})


/* ------------------------------------------------------------------------------
    GRAPH
------------------------------------------------------------------------------ */
// Ajouter une div qui contiendra le graph
d3.select("body")
    .append("div")
    .attr('id', 'graph')

console.log(document.querySelector('#graph').offsetHeight);


let widthDiv = document.querySelector('#graph').offsetWidth;
let heightDiv = document.querySelector('#graph').offsetHeight;

const margin = { top: 30, right: 50, bottom: 60, left: 50 },
    width = widthDiv - margin.left - margin.right,
    height = heightDiv - margin.top - margin.bottom

// Créer le svg du graph
const svg = d3.select("#graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


/* ------------------------------------------------------------------------------
    AXES
------------------------------------------------------------------------------ */
// Dimensions de l'axe X
let maxPib = 0
gdp.forEach(pibByYear => {
    if (pibByYear[2021] > maxPib) {
        maxPib = pibByYear[2021]
    }
})

// Dimensions de l'axe Y
let maxLifeLength = 0
lifeExpectancy.forEach(lifeExpectancyByYear => {
    if (lifeExpectancyByYear[2021] > maxLifeLength) {
        maxLifeLength = lifeExpectancyByYear[2021]
    }
})

// Max et le min de population dans un pays en 2021
let maxPop = 0
let minPop = 0

population.forEach(pays => {
    if (pays[2021] > maxPop) {
        maxPop = pays[2021]
    }
    if (population[0] == pays) {
        minPop = pays[2021]
    } else if (pays[2021] < minPop) {
        minPop = pays[2021]
    }
})

// Echelle de l'axe X
let x = d3.scaleSqrt()
    .domain([0, maxPib * 1.05])
    // la plage est définie comme étendue minimale et maximale des bandes
    .range([0, width])
    .nice()

// Echelle pour l'axe Y
let y = d3.scalePow()
    .exponent(1.7)
    .domain([0, maxLifeLength * 1.05])
    // inverser le sens pour avoir la graduation dans le bon sens pour utilisateur 
    .range([height, 0])
    .nice()

// Fonction échelle pour la taille des cercles
let sqrtScale = d3.scaleSqrt()
    .domain([minPop, maxPop])
    .range([4, 30]);


/* ------------------------------------------------------------------------------
    DESSINER LES AXES
------------------------------------------------------------------------------ */
// Axe X
svg.append("g")
    //translation de l'axe pour le positionner au bon endroit, en l'occurence descendre le graphe de sa taille en y 
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
    CERCLES
------------------------------------------------------------------------------ */
// Ajout de cercles
svg.append('g')
    .selectAll("dot")
    // data pib par habitant
    .data(gdp)
    // renvoie la séléction d'entrée 
    .enter()
    // ajout d'un cercle à chaque entrée
    .append("circle")
    // Définir l'emplacement des cercles sur l'axe X 
    .attr("cx", function (d) { return x(d[2021]) })
    // Définir l'emplacement des cercles sur l'axe Y en ajoutant le dataset de l'espérance de vie
    .data(lifeExpectancy)
    .join()
    .attr("cy", function (d) { return y(d[2021]) })
    // Modifie la taille des cercles selon la population
    .data(population)
    .join()
    .attr("r", function (d) { return sqrtScale(d[2021]) })
    .style("fill", "red")
    .attr("opacity", "0.4")
    .attr("stroke", "white")

//---------------------------------------------------------------------------------------------

//fonction pour convertir les string en int
function strToInt(str) {
    //ici, deux types de cas à prendre en compte
    //M, le million ex : 33,3 = 33 300 000
    let number
    let onlyNumber
    if (str.slice(-1) == 'M') {
        //enlever le dernier caractère, ici le M
        onlyNumber = str.substring(0, str.length - 1)
        //convertir la string en nombre
        number = Number(onlyNumber)
        //multiplier le nombre
        number = number * 1000000
    }//K et k, donc mille ex: 33,3K = 33 300
    else if (str.slice(-1) == 'K' || str.slice(-1) == 'k') {
        onlyNumber = str.substring(0, str.length - 1)
        number = Number(onlyNumber)
        number = number * 1000
    }
    return number
}