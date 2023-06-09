// reference: https://observablehq.com/@d3/force-directed-graph

var nodes = []
var nodeSet = new Set()


var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var drag = simulation => {
  
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.5).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
  
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}

var color = () => {
  const scale = d3.scaleOrdinal(d3.schemeTableau10);
  return d => scale(d.group);
}

var height = 500
var width = 765

d3.csv("data.csv", function(d) {
// d3.csv("https://gist.githubusercontent.com/eggchul/4f7b66224adecb2796f685447cd12448/raw/d72bf4a799a9616deb1a19bcd3c5861ffef800e2/soc-firm-hi-tech.csv", function(d) {

        return {
          source: d['source'],
          target: d['target'],
          value: d['value']
        } 
    })
  .then((data) => {
    const links = data  
        links.forEach( d => {
          if(!nodeSet.has(d.source)){
            nodeSet.add(d.source)
            nodes.push({id: d.source})
          }
          if(!nodeSet.has(d.target)){
            nodeSet.add(d.target)
            nodes.push({id: d.target})
          }
        });

  const scale = d3.scaleOrdinal(d3.schemeTableau10);
  const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

  const svg = d3.select("#svg-wrapper")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

  const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

  const node = svg.append("g")
      .attr("stroke",  "rgb(255, 255, 255)")
      .attr("stroke-width", 0) // 1.5
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 8)
      .attr("fill", function(d){
        return scale(d.id)
      })
      .on("mouseover", function(event,d) {
        div.transition().duration(200).style("opacity", .9);
        div.html("ID: " + d.id)
            .style("left", (event.pageX + 30) + "px")
            .style("top", (event.pageY - 28) + "px");
      })
     .on("mouseout", function(d) {
        div.transition()
         .duration(500)
         .style("opacity", 0);
       })
      .call(drag(simulation));

  node.append("title")
      .text(d => d.id);

  simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
  });

})