import * as d3 from 'd3'
import './index.css'

// Espérance de vie par pays et pour chaque année depuis 1800
import lifeExpectancy from '../data/life_expectancy_years.csv' //espérance de vie par pays et pour chaque année depuis 1800

// Récupérer les pays
let countries = []

lifeExpectancy.forEach(row => {
    let countryData = {};
    countryData[row['country']] = row['2021']
    countries.push(countryData)
});

// Ajouter un titre
d3.select("body")
    .append("h1")
    .text("Exercice 2")

// Ajouter une div qui contiendra la map
d3.select("body")
    .append("div")
    .attr('id', 'map')

// Définir la taille de la map
let widthDiv = document.querySelector('#map').offsetWidth;
let heightDiv = document.querySelector('#map').offsetHeight;


const margin = { top: 30, right: 50, bottom: 60, left: 50 },
    width = widthDiv - margin.left - margin.right,
    height = heightDiv - margin.top - margin.bottom

// Créer le svg de la map
const svg = d3.select("#map")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

// Map and projection
let path = d3.geoPath();
let projection = d3.geoMercator()
    .scale(70)
    .center([0, 20])
    .translate([width / 2, height / 2]);

// Data and color scale
let data = new Map();
let colorScale = d3.scaleThreshold()
    .domain([50, 60, 70, 80, 90, 100])
    .range(d3.schemeReds[7]);

d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function (d) {

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(d.features)
        .join("path")

        // draw each country
        .attr("d", d3.geoPath()
            .projection(projection)
        )

        // set id
        .attr("id", function (d) { return d.properties.name; })
        .attr("fill", function (d) {
            let number = 0;

            countries.forEach(country => {
                if (typeof country[this.id] != "undefined") {
                    number = country[this.id]
                }
            })

            return colorScale(number);
        })
})