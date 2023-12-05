$(document).ready(function () {

  $('#carousel-container').carousel();
});

const width = window.innerWidth;
const height = window.innerHeight;
let hue;
let sat;
let lightness;
let startHue = -92;


var size, size_inner, circleSize;
if (width < 850) {
  size = width * 0.9;
  size_inner = width * 0.9 - 30;
  circleSize = 1;
} else {
  size = height * 0.9;
  size_inner = height * 0.9 - 30;
  circleSize = 1.5;
}
const bands = 1;
const band_width = ((size - size_inner) / bands);
const min_opacity = 0.1;
const opacity_step = (1 - min_opacity) / bands;
const count = 10;
const colors = d3.range(count).map((d, i) => d3.interpolateRainbow(i / count));


//sort by date function
function byDate(a, b) {
  return a.date - b.date;
}

//color converter function
function colorConverter(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;
 
//calculate HUE 
  if (delta == 0) h = 0;

  else if (cmax == r) h = ((g - b) / delta) % 6;

  else if (cmax == g) h = (b - r) / delta + 2;

  else h = (r - g) / delta + 4;
  h = Math.round(h * 60);
 
  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;

  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);
  hue = h;
  sat = s;
  lightness = l;
  return [h, s, l];
}
var sizeB = (size - band_width) / 2;
var biggest = ((size - band_width) / 2) * 0.75;
var secondB = ((size - band_width) / 2) * 0.5;
var small = ((size - band_width) / 2) * 0.25;
console.log(size, biggest);

//circle coordinates
function getCircleX(radians, radius) {
  return Math.cos((radians * Math.PI) / 180) * radius;
}
function getCircleY(radians, radius) {
  return Math.sin((radians * Math.PI) / 180) * radius;
}
function getRadius(r) {
  return (r * sizeB) / 100;
}

var dataset = [
  [sizeB, 0, 0, "white"],
  [biggest, 0, 0.5, "white"],
  [secondB, 0, 0.5, "white"],
  [small, 0, 0.3, "white"]
];

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + (width / 2 + 280) + "," + height / 2 + ")");

    
// Create color wheel slices
for (let k = 0; k < bands; k++) {
  const arc = d3
    .arc()
    .outerRadius((size - k * band_width) / 2)
    .innerRadius((size - (k + 1) * band_width) / 2)
    .startAngle(0)
    .endAngle((2 * Math.PI) / count);

  const sliceGroup = svg
    .append("g")
    .attr("class", "band")
    .selectAll("path")
    .data(colors)
    .enter()
    .append("g")
    .attr("class", "color-slice")
    .attr("transform", (d, i) => "rotate(" + (i * (360 / count) + 18) + ")");

  // Add white lines (triangles) at the beginning and end of each section
  const lineLength = 450; // Adjust the length of the lines as needed

  sliceGroup
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", lineLength)
    .attr("y2", 0)
    .attr("stroke", "white")
    .attr("stroke-width", 0.5);

  sliceGroup
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", -lineLength)
    .attr("y2", 0)
    .attr("stroke", "white")
    .attr("stroke-width", 0.5);
}


//labels for carousel click syncs 
var colorLabels = [
  ["Red", getCircleX(0, getRadius(100)), getCircleY(0, getRadius(100))],
  ["Red/Yellow", getCircleX(36, getRadius(90)), getCircleY(36, getRadius(90))],
  ["Yellow", getCircleX(72, getRadius(80)), getCircleY(72, getRadius(80))],
  ["Yellow/Green", getCircleX(108, getRadius(70)), getCircleY(108, getRadius(70))],
  ["Green", getCircleX(144, getRadius(60)), getCircleY(144, getRadius(60))],
  ["Green/Blue", getCircleX(180, getRadius(50)), getCircleY(180, getRadius(50))],
  ["Blue", getCircleX(216, getRadius(40)), getCircleY(216, getRadius(40))],
  ["Blue/Purple", getCircleX(252, getRadius(30)), getCircleY(252, getRadius(30))],
  ["Purpl", getCircleX(288, getRadius(20)), getCircleY(288, getRadius(20))],
  ["Purple/Red", getCircleX(324, getRadius(10)), getCircleY(324, getRadius(10))]
];


const angleIncrement = 360 / colorLabels.length;


colorLabels.forEach((label, index) => {
  const angle = index * angleIncrement; 
  label[1] = getCircleX(angle, getRadius(100));
  label[2] = getCircleY(angle, getRadius(100));
});

//inner lightness circles 
var circle = svg
  .selectAll("circle")
  .data(dataset)
  .enter()
  .append("circle")

  .attr("r", d => d[0])
  .attr("cx", d => d[1])
  .attr("cy", d => d[1])
  .style("fill", "none")
  .style("stroke", d => d[3])
  .style("stroke-width", d => d[2]);

svg
  .append("path")
  .attr("id", "wavy") 
  .attr("d", "M -405, 2 A 100, 100 0 0,1 405, 2")
  .style("fill", "none");

var div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

let updatedSortedData = [];
const counts = {};
d3.json('finalImages.json').then(data => {
  console.log(data);
  let sortedData2 = data.sort(byDate);

  function updateCounts(key) {
    if (counts[key] === undefined) counts[key] = 0;
    counts[key]++;
  }
  sortedData2.forEach(object => {
    if (object.date < 1200) {
      object.group = "Ancient Art"; 
      updateCounts(object.group);
      updatedSortedData.push(object);
    } else if (object.date >= 1200 && object.date < 1381) {
      object.group = "Medieval-Gothic";
      updateCounts(object.group);
      updatedSortedData.push(object);
    } else if (object.date >= 1381 && object.date < 1510) {
      object.group = "Italian-Renaissance";
      updateCounts(object.group);
      updatedSortedData.push(object);
    } else if (object.date >= 1510 && object.date < 1550) {
      object.group = "Northern-Renaissance";
      updateCounts(object.group);
      updatedSortedData.push(object);
    } else if (object.date >= 1550 && object.date < 1580) {
      object.group = "Mannerism";
      updateCounts(object.group);
      updatedSortedData.push(object);
    } else if (object.date >= 1580 && object.date < 1705) {
      object.group = "Baroque";
      updateCounts(object.group);
      updatedSortedData.push(object);
    } else if (object.date >= 1705 && object.date < 1750) {
      object.group = "Rococo";
      updateCounts(object.group);
      updatedSortedData.push(object);
    } else if (object.date >= 1750 && object.date < 1805) {
      object.group = "Neoclassicism";
      updateCounts(object.group);
      updatedSortedData.push(object);
    } else if (object.date >= 1805 && object.date < 1853) {
      object.group = "Romanticism";
      updateCounts(object.group);
      updatedSortedData.push(object);
    } else if (object.date >= 1853 && object.date < 1899) {
      object.group = "Realism";
      updateCounts(object.group);
      updatedSortedData.push(object);
    } else if (object.date >= 1899 && object.date < 1961) {
        object.group = "Modernism"; // Covers art from 1899 to 1960
        updateCounts(object.group);
        updatedSortedData.push(object);
    } else if (object.date >= 1961 && object.date <= 2023) {
        object.group = "Contemporary"; // Covers art from 1961 to 2023
        updateCounts(object.group);
        updatedSortedData.push(object);
      }
  });
  buildChart(updatedSortedData);
});


function buildChart(data) {
  var circles2 = svg
    .append("g")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("a")
    .attr("xlink:href", function(d) {
      return d.image;
    })
    .attr("target", "_blank")
    .append("circle")
    .attr("class", d => {
      return `${d.group} bubble`; 
    })
    .attr("cx", (d, i) => {
      return getCircleX(
        colorConverter(d.color[0], d.color[1], d.color[2])[0],
        getRadius(colorConverter(d.color[0], d.color[1], d.color[2])[2]) + 1
      );
    })
    .attr("cy", (d, i) => {
      return getCircleY(
        colorConverter(d.color[0], d.color[1], d.color[2])[0],
        getRadius(colorConverter(d.color[0], d.color[1], d.color[2])[2]) + 1
      );
    })
    .attr("fill", d => {
      return d3.rgb(d.color[0], d.color[1], d.color[2]);
    });

  circles2
    .on("mouseover", function(d, i) {
      div
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px")
        .transition()
        .duration(200)
        .style("opacity", 1)
        .attr("stroke", "white");

      div.html(
        `<b>Title:</b> ${d.title}<b> Date:</b> ${d.date} <br/><br/> <img src="${d.image}" width="100%"/>`
      );
    })
    .on("mouseout", function(d, i) {
      div
        .transition()
        .duration(200)
        .style("opacity", 0);

    });

  function update() {
    var total = 0;

    d3.selectAll(".checkbox").each(function(d) {
      checkedBox = d3.select(this);
      group = checkedBox.property("value");
  
      if (checkedBox.property("checked")) {
      
        total += counts[group];
        svg
          .selectAll(`.${group}`)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .transition()
          .delay(function(d, i) {
            return i * 3;
          })
          .duration(1000)
          .attr(
            "r",
           
            d => {
              return (
                Math.sqrt(
                  colorConverter(d.color[0], d.color[1], d.color[2])[1]
                ) * circleSize
              );
            }
          );

       
      } else {
   
        svg
          .selectAll("." + group)
          .transition()
          .duration(800)
          .style("opacity", 0)
          .attr("r", 0);
      }
      $("#count")
        .text(total)
        .css("color", "red");
      setTimeout(() => $("#count").css("color", "white"), 1000);
    });
  }

  d3.selectAll(".checkbox").on("change", update);
  
  update();
}



let isSliceClicked = false;


const sliceGroup = svg.append("g").attr("class", "slices");
const handleSliceClick = createSliceClickHandler();

let carouselInterval;




function handleSliceMouseOut() {
  if (!isSliceClicked) {
    resetSlicesAndDataPoints();
  }
}

function createSliceClickHandler() {
  return function handleSliceClick() {
    const isSlice = d3.select(this).classed("slice-item");

      if (isSliceClicked) {
        $('#carousel-container').carousel('pause');
        isSliceClicked = true;
        updateCarousel(isSliceClicked, clickedIndex);
      }
    }
  };


function resetSlicesAndDataPoints() {
  d3.selectAll('.slice').attr("stroke-width", 0.3).attr("stroke", "black");
  svg.selectAll('.bubble').style('display', null);
}


function updateCarousel(isClicked, index) {
  isSliceClicked = isClicked;
  d3.selectAll('.slice').classed("clicked", isSliceClicked);
  $('#carousel-container').carousel(parseInt(index));
}

function resetCarousel() {
  isSliceClicked = false;
  d3.selectAll('.slice').classed("clicked", isSliceClicked);
  // Resume the carousel
  $('#carousel-container').carousel('cycle');
}

function startCarouselInterval() {
  carouselInterval = setInterval(() => {
    // Your carousel update logic here
  }, 30000);
}

// Initialize carousel interval
startCarouselInterval();

for (let i = 0; i < count; i++) {
  const startAngle = (i * 2 * Math.PI) / count;
  const endAngle = ((i + 1) * 2 * Math.PI) / count;

  const arc = d3.arc()
    .outerRadius(size / 2)
    .innerRadius(size_inner / 2)
    .startAngle(startAngle)
    .endAngle(endAngle);

  const slice = sliceGroup.append("path")
    .attr("d", arc)
    .attr("fill", colors[i])
    .attr("class", "slice")
    .attr("data-start-angle", startAngle)
    .attr("data-end-angle", endAngle)
    .attr("data-bs-slide-to", i)
    .on("mouseover", handleSliceMouseOver)
    .on("mouseout", handleSliceMouseOut)
    .on("click", handleSliceClick);

  // Additional click handler for toggling isSliceClicked
  sliceGroup.append("path")
    .attr("d", arc)
    .attr("fill", colors[i])
    .attr("class", "slice")
    .attr("data-start-angle", startAngle)
    .attr("data-end-angle", endAngle)
    .attr("data-bs-slide-to", i)
    .on("mouseover", handleSliceMouseOver)
    .on("mouseout", handleSliceMouseOut)
    .on("click", function () {
      const clickedIndex = d3.select(this).attr("data-bs-slide-to");
      isSliceClicked = !isSliceClicked;
      d3.selectAll('.slice').classed("clicked", isSliceClicked);
      updateCarousel(isSliceClicked, clickedIndex);
    });
}


function handleSliceMouseOver() {
  if (!isSliceClicked) {
    const startAngle = parseFloat(d3.select(this).attr("data-start-angle"));
    const endAngle = parseFloat(d3.select(this).attr("data-end-angle"));

    // Increase stroke width
    d3.select(this).attr("stroke-width", 6);

    // Darken stroke color
    d3.select(this).attr("stroke", "#333"); // Adjust color as needed

    // Filter and display data within the hovered slice
    svg.selectAll('.bubble')
      .style('display', function (d) {
        const [h] = colorConverter(d.color[0], d.color[1], d.color[2]);
        const angle = ((h - startHue + 360) % 360) / 360 * 2 * Math.PI; 

        
        return angle >= startAngle && angle <= endAngle ? null : 'none';
      });

    } 
  }

  const infoTooltip = d3.select("body")
  .append("div")
  .attr("class", "info-tooltip")
  .style("opacity", 0);

const infoIcon = d3.select("body")
  .append("div")
  .attr("class", "info-icon")
  .html('<i class="fas fa-info-circle"></i>')
  .on("mouseover", function () {
    infoTooltip.transition().duration(200).style("opacity", 1);
  })
  .on("mouseout", function () {
    infoTooltip.transition().duration(200).style("opacity", 0);
  });

infoTooltip.html("Click on each color to explore its emotional link. Hover over bubbles to explore each painting.")
