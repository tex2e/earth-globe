'use strict';

var countries; // Country data (coordinate, polygon)

window.onload = function () {
  // Add stage to display world map
  var stage = d3.select("body")
    .append("svg:svg")
    .attr({
      "id": "earth",
      "width":  960,
      "height": 600,
    });

  var projection_scale = 200;
  var projection_rotate = [220, 0, 0];

  // Configure projection
  var projection = d3.geo.orthographic()
    .scale(projection_scale)
    .rotate(projection_rotate)
    .clipAngle(90); // Display angle
  var projection_back = d3.geo.orthographic()
    .scale(projection_scale)
    .rotate(projection_rotate)
    .clipAngle(180); // Display angle

  // Create path generator
  var path = d3.geo.path().projection(projection);
  var path_back = d3.geo.path().projection(projection_back);

  var world_map;
  var world_map_back;

  // var sea = stage.append("path")
  //   .datum({type: "Sphere"})
  //   .attr({
  //     "d": path,
  //     "fill": "blue",
  //   });

  var country_color = d3.scale.linear()
    .domain([0, 1])
    .range(['green', 'red']);

  // Read map data
  d3.json("data/countries.topojson", function(json) {

    // Convert topojson -> geojson
    countries = topojson.feature(json, json.objects.countries).features;
    for (var i = 0; i < countries.length; i++) {
      countries[i].disaster = 0;
    }

    update_country_color();
  });

  var update_country_color = function () {
    world_map_back = stage.selectAll("path.back_country")
      .data(countries)

    world_map_back.exit().remove()
    world_map_back.enter()
      .append("svg:path")
      .attr({
        "class": "back_country",
        "d": path,
        "opacity": 0.3,
        "fill-opacity": 1,
        "fill": (d) => country_color(d.disaster),
        "data-tip": function(d) { return d.properties.sovereignt },
      })
    world_map_back.transition()
      .duration(500)
      .attr('fill', function(d) { return country_color(d.disaster) })

    // 地図表示
    world_map = stage.selectAll("path.country")
      .data(countries)

    world_map.exit().remove()
    world_map.enter()
      .append("svg:path")
      .attr({
        "class": "country",
        "d": path,
        "fill-opacity": 1,
        "fill": (d) => country_color(d.disaster),
        "data-tip": function(d) { return d.properties.sovereignt },
      })
    world_map.transition()
      .duration(500)
      .attr('fill', function(d) { return country_color(d.disaster) })
  }

  // Rotate projection
  var update_rotation = function () {
    projection_rotate[0] += 0.1; // x_axis
    projection_back.rotate(projection_rotate);
    projection.rotate(projection_rotate);
    // update path function
    path_back = d3.geo.path().projection(projection_back);
    path      = d3.geo.path().projection(projection);
    // apply path function to map object
    world_map_back.attr("d", path_back);
    world_map.attr("d", path);
  }

  setInterval(() => {
    update_country_color();
    update_rotation();
  }, 500);
}

function setDisasterRandom() {
  for (var i = 0; i < countries.length; i++) {
    countries[i].disaster = Math.random();
  }
}

function setDisasterZero() {
  for (var i = 0; i < countries.length; i++) {
    countries[i].disaster = 0;
  }
}
