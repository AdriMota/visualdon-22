import * as d3 from 'd3';
import { json } from 'd3-fetch'

// Charger des données
Promise.all([
    json('https://jsonplaceholder.typicode.com/users'),
    json('https://jsonplaceholder.typicode.com/posts')
])

    // Créer des tableaux d'objets
    .then(([tabUsers, tabPosts]) => {

        let postsByUsers = []
        // Calculer le nombre de posts par user
        tabUsers.forEach(user => {
            let cmptPost = 0;

            tabPosts.forEach(post => {
                if (post.userId == user.id) {
                    cmptPost++;
                    postsByUsers.push({
                        nom: user.name,
                        idPost: post.id,
                        longueurPost: post.body.length,
                        post: post.body
                    })
                }
            })

            // Afficher les données
            d3.select("body")
                .append("div")
                .attr('id', `div-user${user.id}`)

            d3.select(`#div-user${user.id}`)
                .append('p')
                .text(`--> ${user.name} a écrit ${cmptPost} article(s).`)

        })

        // Déterminer le post le plus long
        d3.select("body")
            .append("div")
            .append('p')

        let longestPost = ''
        let longestPostId = 0

        tabPosts.forEach(post => {
            if (longestPost.length < post.body.length) {
                longestPost = post.body
                longestPostId = post.userId
            }
        })

        let userLongestPost = tabUsers[longestPostId - 1].name

        d3.select("body")
            .append("div")
            .attr('id', 'longestPost')
        d3.select('#longestPost')
            .append('p')
            .text(`${userLongestPost} a écrit le plus long post avec ${longestPost.length} caractères !`)
            .append('p')
            .text(`Le voici : ${longestPost}`)



        // Graphique bâton
        var margin = { top: 20, right: 10, bottom: 60, left: 60 };
        var width = 1500 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        d3.select("body")
            .append("div")
            .attr('id', 'graph')

        let svg = d3.select("#graph")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        let x = d3.scaleBand()
            .domain(arrayUserPost.map(function (d) { return d["nom_utilisateur"]; }))
            .range([1000, 0]);


        let y = d3.scaleLinear()
            .domain(arrayUserPost.map(function (d) { return d["posts"].length; }))
            .range([height, 0]);


        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-2,10)")

        svg.selectAll("bars")
            .data(arrayUserPost)
            .enter()
            .append("rect")
            .attr("x", function (d) { return x(d["nom_utilisateur"]) + 40; })
            .attr("y", function (d) { return y(d["posts"].length); })
            .attr("width", "20px")
            .attr("height", function (d) { return height - y(d["posts"].length); })
            .attr("fill", "#69b3a2")
    })