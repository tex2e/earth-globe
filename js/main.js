'use strict';

window.onload = function () {
  var earthGlobe = new EarthGlobe();
  earthGlobe.loop();

  window.setDisasterRandom = function () {
    earthGlobe.setDisasterRandom();
  }

  window.setDisasterZero = function () {
    earthGlobe.setDisasterZero();
  }
}

class EarthGlobe {
  constructor() {
    this.countries = [];  // Country data (coordinate, polygon)

    // Add stage to display world map
    this.stage = d3.select("body")
      .append("svg:svg")
      .attr({
        "id": "earth",
        "width":  960,
        "height": 600,
      });

    this.projection_scale = 200;
    this.projection_rotate = [220, 0, 0];

    // Configure projection
    this.projection = d3.geo.orthographic()
      .scale(this.projection_scale)
      .rotate(this.projection_rotate)
      .clipAngle(90); // Display angle
    this.projection_back = d3.geo.orthographic()
      .scale(this.projection_scale)
      .rotate(this.projection_rotate)
      .clipAngle(180); // Display angle

    // Create path generator
    this.path = d3.geo.path().projection(this.projection);
    this.path_back = d3.geo.path().projection(this.projection_back);

    this.world_map;
    this.world_map_back;

    this.country_color = d3.scale.linear()
      .domain([0, 1])
      .range(['green', 'red']);

    // Read map data
    d3.json("data/countries.topojson", (json) => {

      // Convert topojson -> geojson
      this.countries = topojson.feature(json, json.objects.countries).features;
      for (var i = 0; i < this.countries.length; i++) {
        this.countries[i].disaster = 0;
      }

      this.update_country_color();
      this.update_rotation();
    });
  }

  update_country_color() {
    this.world_map_back = this.stage.selectAll("path.back_country")
      .data(this.countries)
    this.world_map_back.exit().remove()
    this.world_map_back.enter()
      .append("svg:path")
      .attr({
        "class": "back_country",
        "d": this.path,
        "opacity": 0.3,
        "fill-opacity": 1,
        "fill": (d) => this.country_color(d.disaster),
        "data-tip": (d) => d.properties.sovereignt,
      })
    this.world_map_back.transition()
      .duration(500)
      .attr('fill', (d) => this.country_color(d.disaster))

    this.world_map = this.stage.selectAll("path.country")
      .data(this.countries)
    this.world_map.exit().remove()
    this.world_map.enter()
      .append("svg:path")
      .attr({
        "class": "country",
        "d": this.path,
        "fill-opacity": 1,
        "fill": (d) => this.country_color(d.disaster),
        "data-tip": (d) => d.properties.sovereignt,
      })
    this.world_map.transition()
      .duration(500)
      .attr('fill', (d) => this.country_color(d.disaster))
  }

  // Rotate projection
  update_rotation() {
    this.projection_rotate[0] += 0.1; // x_axis
    this.projection_back.rotate(this.projection_rotate);
    this.projection.rotate(this.projection_rotate);
    // update path function
    this.path_back = d3.geo.path().projection(this.projection_back);
    this.path      = d3.geo.path().projection(this.projection);
    // apply path function to map object
    this.world_map_back.attr("d", this.path_back);
    this.world_map.attr("d", this.path);
  }

  loop() {
    setInterval(() => {
      this.update_country_color();
      this.update_rotation();
    }, 500);
  }

  setDisasterRandom() {
    for (var i = 0; i < this.countries.length; i++) {
      this.countries[i].disaster = Math.random();
    }
  }

  setDisasterZero() {
    for (var i = 0; i < this.countries.length; i++) {
      this.countries[i].disaster = 0;
    }
  }
}
