// set the dimensions and margins of the graph
let margin = { top: 10, right: 30, bottom: 50, left: 60 },
  width = 954 - margin.left - margin.right,
  height = 954 - margin.top - margin.bottom;

const color = d3.scaleOrdinal(d3.schemeCategory10);

const format = d3.format(",d");

//Read the data
//Loading into XLS from here: http://www.finance.gov.pk/fb_2019_20.html
//Zoomable tree-map: https://observablehq.com/@d3/zoomable-treemap
//Useful SO post: https://stackoverflow.com/questions/56281711/treemap-in-d3-v5-doesnt-support-nodes-anymore
d3.csv("data/data.csv").then(function (results) {
  //Update the "Rs,millions" value to be a number:
  for (let index = 0; index < results.length; index++) {
    const element = results[index];
    console.log(element);

    for (const property in element) {
      if (property === "Rs,millions") {
        element[property] = parseInt(element[property].replace(/,/g, ""));
      }
    }
  }

  console.log(results);

  let dataStratified = d3
    .stratify()
    .id(function (d) {
      return d.Child;
    })
    .parentId(function (d) {
      return d.Parent;
    })(results);

  console.log(dataStratified);

  let myTreemap = (data) =>
    d3.treemap().padding(1).round(true)(
      d3
        .hierarchy(data)
        .sum((d) => d.data["Rs,millions"])
        .sort((a, b) => b.data["Rs,millions"] - a.data["Rs,millions"])
    );

  const root = myTreemap(dataStratified);

  console.log(root);

  const svg = d3
    .select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const leaf = svg
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

  console.log(root.leaves());

  // leaf.append("title").text((d) =>
  //   console.log(
  //     d
  //       .ancestors()
  //       .reverse()
  //       .map((each) => each.data)
  //   )
  // );

  // leaf.append("title")
  //     .text(d => `${d.ancestors().reverse().map(d => d.data.name).join("/")}\n${format(d.value)}`);

  leaf
    .append("rect")
    .attr("id", (d) => d.data.id)
    .attr("fill", (d) => {
      while (d.depth > 1) d = d.parent;
      return color(d.data.data.Child);
    })
    .attr("fill-opacity", 0.6)
    .attr("width", function (d) {
      console.log(d);
      console.log(d.x1, d.x0);
      // return d.x1 - d.x0
    })
    .attr("height", (d) => d.y1 - d.y0);

  leaf.append("clipPath").append("use");

  //start here: something showed up on page; but what are clip-paths?
  //https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path

  //Other possibility:
  //build JSON file manually, then follow Observable for zoomable treemap.

  leaf
    .append("text")
    .selectAll("tspan")
    .data((d) =>
      d.data.data.Child.split(/(?=[A-Z][a-z])|\s+/g).concat(
        format(d.data["Rs,millions"])
      )
    )
    .enter()
    .append("tspan")
    .attr("x", 3)
    .attr(
      "y",
      (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`
    )
    .attr("fill-opacity", (d, i, nodes) =>
      i === nodes.length - 1 ? 0.7 : null
    )
    .text((d) => d);
});

// d3.json("data/flare-2.json").then(function (data) {
//   console.log(data);
// });
