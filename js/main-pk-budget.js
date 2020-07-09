// set the dimensions and margins of the graph
let margin = { top: 10, right: 10, bottom: 10, left: 10 },
  width = 900;
height = 700;

const color = d3.scaleOrdinal(d3.schemeCategory10);

d3.csv("data/data.csv").then(function (results) {
  //Update the "Rs,millions" value to be a number:
  for (let index = 0; index < results.length; index++) {
    const element = results[index];

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

  let myTreemap = (data) =>
    d3.treemap().size([width, height]).padding(1).round(true)(
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
    .style("font-family", "sans-serif")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g").attr("class", "treemap-container");

  // Place the labels for our countries
  g.selectAll("text.budgetline")
    // The data is the first "generation" of children
    .data(root.children)
    .enter()
    .append("text")
    .attr("class", "budgetline")
    // The rest is just placement/styling
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("dy", "0.6em")
    .attr("dx", 3)
    .style("font-size", 12)
    // Remember, the data on the original node is available on node.data
    .text((d) => d.data.data.Child);

  // Now, we place the groups for all of the leaf nodes
  const leaf = g
    .selectAll("g.leaf")
    // root.leaves() returns all of the leaf nodes
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("class", "leaf")
    // position each group at the top left corner of the rect
    .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
    .style("font-size", 10);

  console.log(root.leaves());

  // A title element tells the browser to display its text value
  // in a popover when the cursor is held over a rect. This is a simple
  // way to add some interactivity
  leaf.append("title").text((d) => d.data.id);

  // Now we append the rects.
  leaf
    .append("rect")
    .attr("id", (d) => d.data.id)
    .attr("fill", (d) => {
      while (d.depth > 1) d = d.parent;
      return color(d.data.data.Child);
    })
    .attr("opacity", 0.7)
    // the width is the right edge position - the left edge position
    .attr("width", (d) => d.x1 - d.x0)
    // same for height, but bottom - top
    .attr("height", (d) => d.y1 - d.y0)
    // make corners rounded
    .attr("rx", 3)
    .attr("ry", 3);

  // This next section checks the width and height of each rectangle
  // If it's big enough, it places labels. If not, it doesn't.
  leaf.each((d, i, arr) => {
    // The current leaf element
    const current = arr[i];

    const left = d.x0,
      right = d.x1,
      // calculate its width from the data
      width = right - left,
      top = d.y0,
      bottom = d.y1,
      // calculate its height from the data
      height = bottom - top;

    // too small to show text
    const tooSmall = width < 24 || height < 15;

    // and append the text
    d3.select(current)
      .append("text")
      // If it's too small, don't show the text
      .attr("opacity", tooSmall ? 0 : 0.9)
      .selectAll("tspan")
      .data((d) => [d.data.data.Child, d.value.toLocaleString()])
      .enter()
      .append("tspan")
      .attr("x", 3)
      .attr("y", (d, i) => (i ? "2.5em" : "1.15em"))
      .text((d) => d);
  });
});
