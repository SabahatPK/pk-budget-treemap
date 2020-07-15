const width = 900;
const height = 700;
const margin = { top: 10, right: 10, bottom: 10, left: 10 };
const colorScale = d3.scaleOrdinal(d3.schemeSet2);

//START: aha! Problem was that original Observable Notebook (ON) built a JSON
//that could automatically be plugged into hierarchy. But I was starting with
//the CSV, then building the JSON (incorrectly) then plugging THAT
//into hierarchy().

//What I need to do:
//Load CSV and put directly into stratify() then hierarchy()?
//OR: figure out how to build JSON correctly?? >>>>>> too complicated.
//My copy of ON: https://observablehq.com/d/9974782e26bc309d

d3.json("data/dataObservable.json").then(function (children) {
  console.log(children);

  const hierarchy = d3
    .hierarchy(children)
    .sum((d) => d.value)
    .sort((a, b) => b.value - a.value);

  const treemap = d3
    .treemap()
    // set the size of the treemap render area
    .size([width, height])
    // set the padding between every rectangle in px
    .padding(2)
    // set the padding at the top of each group of rectangles
    // so that we can fit the country labels
    .paddingTop(10)
    // Set the generator to round pixel values to the nearest value
    // (makes things look better)
    .round(true);

  const root = treemap(hierarchy);

  const svg = d3
    .select("#my_dataviz")
    .append("svg")
    .style("font-family", "sans-serif")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g").attr("class", "treemap-container");

  console.log(root.children);

  // Place the labels for our countries
  g.selectAll("text.country")
    // The data is the first "generation" of children
    .data(root.children)
    .enter()
    .append("text")
    .attr("class", "country")
    // The rest is just placement/styling
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("dy", "0.6em")
    .attr("dx", 3)
    .style("font-size", 12)
    // Remember, the data on the original node is available on node.data (d.data here)
    .text((d) => d.data.name);

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

  // A title element tells the browser to display its text value
  // in a popover when the cursor is held over a rect. This is a simple
  // way to add some interactivity
  leaf
    .append("title")
    .text(
      (d) =>
        `${d.parent.data.name}-${d.data.name}\n${
          d.value.toLocaleString() + " GWh"
        }`
    );

  // Now we append the rects. Nothing crazy here
  leaf
    .append("rect")
    .attr("fill", (d) => colorScale(d.parent.data.name))
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
    const tooSmall = width < 34 || height < 25;

    // and append the text (you saw something similar with the pie chart (day 6)
    d3.select(current)
      .append("text")
      // If it's too small, don't show the text
      .attr("opacity", tooSmall ? 0 : 0.9)
      .selectAll("tspan")
      .data((d) => [d.data.name, d.value.toLocaleString()])
      .enter()
      .append("tspan")
      .attr("x", 3)
      .attr("y", (d, i) => (i ? "2.5em" : "1.15em"))
      .text((d) => d);
  });
});

//Start: geting stuck on csvParse(); required input seems to be an actual stirng?
//Tried this: https://github.com/typeiii/jquery-csv but keeo getting error saying
//GET http://localhost:8000/jquery-csv.js net::ERR_ABORTED 404 (File not found)
//For now, follow

d3.csv("data/Electricity generation by source@1.csv").then(function (data) {
  // let dataViaJQuery = $.csv.toObjects(data);
  console.log(data);
  var table = d3.csvParse(data);
  console.log(table);
});

d3.csv("data/Electricity generation by source@1.csv").then(function (d) {
  const childrenFromCSV = d.map((country) => ({
    name: country.Country,
    children: Object.entries(country)
      .map((c) => {
        if (c[0] == "" || c[0] == "Country" || c[0] == "Year") return;
        else
          return {
            name: c[0],
            value: c[1],
          };
      })
      .filter((d) => d),
  }));

  console.log(childrenFromCSV);

  // var rootStrat = d3
  //   .stratify()
  //   .id(function (d) {
  //     console.log(d.children);
  //     return d.children;
  //   })
  //   .parentId(function (d) {
  //     console.log(d.name);
  //     return d.name;
  //   })(childrenData);

  // console.log(rootStrat);

  // const hierarchy = d3
  //   .hierarchy(children)
  //   .sum((d) => d.value)
  //   .sort((a, b) => b.value - a.value);

  // console.log(hierarchy);

  // const treemap = d3
  //   .treemap()
  //   // set the size of the treemap render area
  //   .size([width, height])
  //   // set the padding between every rectangle in px
  //   .padding(2)
  //   // set the padding at the top of each group of rectangles
  //   // so that we can fit the country labels
  //   .paddingTop(10)
  //   // Set the generator to round pixel values to the nearest value
  //   // (makes things look better)
  //   .round(true);

  // const root = treemap(hierarchy);

  // const svg = d3
  //   .create("svg")
  //   .style("font-family", "sans-serif")
  //   .attr("width", width)
  //   .attr("height", height);

  // const g = svg.append("g").attr("class", "treemap-container");

  // console.log(root);

  // //START HERE: trying to copy in code from Observable but running into problem with binding data; asked qn in d3 and DVS slacks.
  // // Place the labels for our countries
  // g.selectAll("text.country")
  //   // The data is the first "generation" of children
  //   // .data(root.data, function (d) {
  //   //   return d.children;
  //   // })
  //   .data(root.children)
  //   .enter()
  //   .append("text")
  //   .attr("class", "country")
  //   // The rest is just placement/styling
  //   .attr("x", (d) => d.x0)
  //   .attr("y", (d) => d.y0)
  //   .attr("dy", "0.6em")
  //   .attr("dx", 3)
  //   .style("font-size", 12)
  //   // Remember, the data on the original node is available on node.data (d.data here)
  //   .text((d) => d.data.name);

  // // Now, we place the groups for all of the leaf nodes
  // const leaf = g
  //   .selectAll("g.leaf")
  //   // root.leaves() returns all of the leaf nodes
  //   .data(root.leaves())
  //   .enter()
  //   .append("g")
  //   .attr("class", "leaf")
  //   // position each group at the top left corner of the rect
  //   .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
  //   .style("font-size", 10);

  // // A title element tells the browser to display its text value
  // // in a popover when the cursor is held over a rect. This is a simple
  // // way to add some interactivity
  // leaf
  //   .append("title")
  //   .text(
  //     (d) =>
  //       `${d.parent.data.name}-${d.data.name}\n${
  //         d.value.toLocaleString() + " GWh"
  //       }`
  //   );

  // // Now we append the rects. Nothing crazy here
  // leaf
  //   .append("rect")
  //   .attr("fill", (d) => colorScale(d.parent.data.name))
  //   .attr("opacity", 0.7)
  //   // the width is the right edge position - the left edge position
  //   .attr("width", (d) => d.x1 - d.x0)
  //   // same for height, but bottom - top
  //   .attr("height", (d) => d.y1 - d.y0)
  //   // make corners rounded
  //   .attr("rx", 3)
  //   .attr("ry", 3);

  // // This next section checks the width and height of each rectangle
  // // If it's big enough, it places labels. If not, it doesn't.
  // leaf.each((d, i, arr) => {
  //   // The current leaf element
  //   const current = arr[i];

  //   const left = d.x0,
  //     right = d.x1,
  //     // calculate its width from the data
  //     width = right - left,
  //     top = d.y0,
  //     bottom = d.y1,
  //     // calculate its height from the data
  //     height = d.y1 - d.y0;

  //   // too small to show text
  //   const tooSmall = width < 34 || height < 25;

  //   // and append the text (you saw something similar with the pie chart (day 6)
  //   d3.select(current)
  //     .append("text")
  //     // If it's too small, don't show the text
  //     .attr("opacity", tooSmall ? 0 : 0.9)
  //     .selectAll("tspan")
  //     .data((d) => [d.data.name, d.value.toLocaleString()])
  //     .enter()
  //     .append("tspan")
  //     .attr("x", 3)
  //     .attr("y", (d, i) => (i ? "2.5em" : "1.15em"))
  //     .text((d) => d);
  // });

  // return svg.node();
});
