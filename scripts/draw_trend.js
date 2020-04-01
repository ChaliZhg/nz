daily_values = [];
timeline_url = "https://d3sid3u2apar25.cloudfront.net/history.v3.csv";
d3.csv(timeline_url, function(data)   
{
  // daily_values = [];

  for (var i = data.length - 1; i >= 0; i--) {
    if (data[i].id == "nz")
    {
      // console.log("good");
      daily_node =
      {
        date: data[i].date,
        confirmed: data[i].confirmed,
        recovered: data[i].recovered,
        deaths: data[i].deaths,
      };
      daily_values.push(daily_node);
    }
  }

function addAxesAndLegend (svg, xAxis, yAxis, margin, chartWidth, chartHeight, config) {
  var legendWidth  = 0,
      legendHeight = 0;

  // clipping to make sure nothing appears behind legend
  svg.append('clipPath')
    .attr('id', 'axes-clip')
    .append('polygon')
      .attr('points', (-margin.left)                 + ',' + (-margin.top)                 + ' ' +
                      (chartWidth - legendWidth - 1) + ',' + (-margin.top)                 + ' ' +
                      (chartWidth - legendWidth - 1) + ',' + legendHeight                  + ' ' +
                      (chartWidth + margin.right)    + ',' + legendHeight                  + ' ' +
                      (chartWidth + margin.right)    + ',' + (chartHeight + margin.bottom) + ' ' +
                      (-margin.left)                 + ',' + (chartHeight + margin.bottom));

  var axes = svg.append('g')
    .attr('clip-path', 'url(#axes-clip)');

  axes.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + chartHeight + ')')
    .call(xAxis)
    .append('text')
      // .attr('transform', 'rotate(-90)')
      .attr('y', 10)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('日期');

  axes.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .append('text')
      // .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'start')
      .text('新增'+config["text"]);
}

function drawPaths (svg, data, x, y, config) {
  var sumArea16 = d3.svg.area()
    .interpolate('step-after')
    .x (function (d) { return x(d.date) || 1; })
    .y0(function (d) { return y(d.value); })
    .y1(function (d) { return y(0); });

  var medianLine = d3.svg.line()
    .interpolate('step-after')
    .x(function (d) { return x(d.date); })
    .y(function (d) { return y(d.value); });

  svg.datum(data);

  // console.log(['area '+config["name"], config["name"]+'-line']);

  svg.append('path')
    .attr('class', 'area '+config["name"])
    .attr('d', sumArea16)
    .attr('clip-path', 'url(#rect-clip)');

  svg.append('path')
    .attr('class', config["name"]+'-line')
    .attr('d', medianLine)
    .attr('clip-path', 'url(#rect-clip)');
}

// function addMarker (marker, svg, chartHeight, x) {
//   var radius = 25,
//       xPos = x(marker.date) - radius - 3,
//       yPosStart = chartHeight - radius - 3,
//       yPosEnd = (marker.type === 'Client' ? 80 : 160) + radius + 100;

//   var markerG = svg.append('g')
//     .attr('class', 'marker '+marker.type.toLowerCase())
//     .attr('transform', 'translate(' + xPos + ', ' + yPosStart + ')')
//     .attr('opacity', 0);

//   markerG.transition()
//     .duration(1000)
//     .attr('transform', 'translate(' + xPos + ', ' + yPosEnd + ')')
//     .attr('opacity', 1);

//   markerG.append('path')
//     .attr('d', 'M' + radius + ',' + (chartHeight-yPosStart) + 'L' + radius + ',' + (chartHeight-yPosStart))
//     .transition()
//       .duration(1000)
//       .attr('d', 'M' + radius + ',' + (chartHeight-yPosEnd) + 'L' + radius + ',' + (radius*2));

//   markerG.append('circle')
//     .attr('class', 'marker-bg')
//     .attr('cx', radius)
//     .attr('cy', radius)
//     .attr('r', radius);

//   markerG.append('text')
//     .attr('x', radius)
//     .attr('y', radius*0.9)
//     .text("死亡");

//   markerG.append('text')
//     .attr('x', radius)
//     .attr('y', radius*1.5)
//     .text(marker.version+"例");
// }

function startTransitions (svg, chartWidth, chartHeight, rectClip, markers, x) {
  rectClip.transition()
    .duration(1000*markers.length)
    .attr('width', chartWidth);

  // markers.forEach(function (marker, i) {
  //   setTimeout(function () {
  //     addMarker(marker, svg, chartHeight, x);
  //   }, 1000 + 500*i);
  // });
}

function makeChart (config, data, markers) {
  var svgWidth  = 450,
      svgHeight = 200,
      margin = { top: 20, right: 20, bottom: 40, left: 60 },
      chartWidth  = svgWidth  - margin.left - margin.right,
      chartHeight = svgHeight - margin.top  - margin.bottom;

  var x = d3.time.scale().range([0, chartWidth])
            .domain(d3.extent(data, function (d) { return d.date; })),
      y = d3.scale.linear().range([chartHeight, 0])
            .domain([0, d3.max(data, function (d) { return d.value; })]);

  var xAxis = d3.svg.axis().scale(x).orient('bottom').ticks(5).tickFormat(d3.time.format("%d"))
                .innerTickSize(-chartHeight).outerTickSize(0).tickPadding(10),
      yAxis = d3.svg.axis().scale(y).orient('left')
                .innerTickSize(-chartWidth).outerTickSize(0).tickPadding(10);

  var div_name = config["div"];

  var svg = d3.select(div_name).append('svg')
    .attr('width',  svgWidth)
    .attr('height', svgHeight)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // clipping to start chart hidden and slide it in later
  var rectClip = svg.append('clipPath')
    .attr('id', 'rect-clip')
    .append('rect')
      .attr('width', 0)
      .attr('height', chartHeight);

  addAxesAndLegend(svg, xAxis, yAxis, margin, chartWidth, chartHeight, config);
  drawPaths(svg, data, x, y, config);
  startTransitions(svg, chartWidth, chartHeight, rectClip, markers, x);
}

var parseDate  = d3.time.format('%Y%m%d').parse;
{
  tempData = daily_values;

  // console.log(tempData);
  for (var i = tempData.length - 1; i >= 0; i--) {
    // var keys = Object.keys(tempData[i]);
    if (i== (tempData.length - 1))
    {
      tempData[i]["recovered-inc"] = 0;
      tempData[i]["confirmed-inc"] = 0;
      tempData[i]["death-inc"] = 0;
      // console.log([i, tempData[i].date, tempData[i]["confirmed-inc"]]);
    }
    else
    {
      // console.log([i, tempData[i].date, tempData[i]["confirmed"]]);
      tempData[i]["confirmed-inc"] = tempData[i]["confirmed"] - tempData[i+1]["confirmed"];
      tempData[i]["recovered-inc"] = tempData[i]["recovered"] - tempData[i+1]["recovered"];
      tempData[i]["death-inc"] = tempData[i]["deaths"] - tempData[i+1]["deaths"];
      // console.log([i, tempData[i].date, tempData[i]["confirmed-inc"]]);
    }
  }

  document.getElementById('total_number').innerHTML = parseInt(tempData[0]["confirmed"]).toLocaleString();
  document.getElementById('recovery_number').innerHTML = parseInt(tempData[0]["recovered"]).toLocaleString();
  document.getElementById('death_number').innerHTML = parseInt(tempData[0]["deaths"]).toLocaleString();

  document.getElementById('infection_increase').innerHTML = "新增" + tempData[0]["confirmed-inc"].toLocaleString();
  document.getElementById('recovery_increase').innerHTML = "新增" + tempData[0]["recovered-inc"].toLocaleString();
  document.getElementById('death_increase').innerHTML = "新增" + tempData[0]["death-inc"].toLocaleString();

  var data_confirmed = tempData.map(function (d) {
    // console.log([d.date, d["recovered-inc"]]);
    return {
      date:  parseDate(d.date),
      value:d["confirmed-inc"],
    };
  });

  var data_recovered = tempData.map(function (d) {
    // console.log([d.date, d["recovered-inc"]]);
    return {
      date:  parseDate(d.date),
      value:d["recovered-inc"],
    };
  });

  var data_death = tempData.map(function (d) {
    // console.log([d.date, d["recovered-inc"]]);
    return {
      date:  parseDate(d.date),
      value:d["death-inc"],
    };
  });

  configs = {"confirmed":{"div":"#daily_confirmed_trend", name:"confirmed", "text":"确诊", },
             "recovered":{"div":"#daily_recovered_trend", name:"recovered", "text":"治愈", },
             "death"    :{"div":"#daily_death_trend", name:"death",         "text":"死亡", }};

  makeChart(configs["confirmed"], data_confirmed, []);
  makeChart(configs["recovered"], data_recovered, []);
  makeChart(configs["death"], data_death, []);
  // d3.json('https://teaof.life/corona/data/markers.json', function (error, markerData) {
  //   if (error) {
  //     console.error(error);
  //     return;
  //   }

  //   var markers = markerData.map(function (marker) {
  //     return {
  //       date: parseDate(marker.date),
  //       type: marker.type,
  //       version: marker.version
  //     };
  //   });

  //   makeChart(data, markers);
  // });
};

});


 