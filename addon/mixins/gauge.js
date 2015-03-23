import Ember from 'ember';

export default Ember.Mixin.create({
  tagName: 'div',
  currentPercentage: 0,
  classNameBindings: ['name'],
  arcRadiusRatio: 2.1,
  centreRadiusRatio: 2.7,
  progressArcWidthRatio: 0.10,
  guideArcWidthRatio: 0.0245,

  target: function() {
    return this.$()[0];
  },

  targetDiv: function() {
    return d3.select(this.target());
  },

  width: function() {
    return this.targetDiv().node().getBoundingClientRect().width;
  },

  height: function() {
    return this.width();
  },

  startAngle: function() {
    return Math.acos(this.arcRadiusRatio / this.centreRadiusRatio) - Math.PI;
  },

  endAngle: function() {
    return -this.startAngle();
  },

  insertSvg: function() {
    var svg = this.targetDiv().insert("svg")
      .attr("width", this.width())
      .attr("height", this.height())
      .append("g")
      .attr("transform", "translate(" + this.width() / 2 + "," + this.height() / 2 + ")");

    this.set("svg", svg);
  },

  appendIcon: function(icon, height) {
    this.svg.append("path")
      .style("fill", "white")
      .attr("width", 100)
      .attr("height", 100)
      .attr("d", icon)
      .attr("transform", function() {
        var h = this.getBBox().height;
        var w = this.getBBox().width;
        var imageRadiusRatio = 3.6;
        var imageRadius = Math.sqrt(h * h + w * w) / 2;
        var scale = height / (imageRadiusRatio * imageRadius);
        return "translate(-" + (w * scale / 2) + ",-" + (h * scale / 2) + ") scale(" + scale + ")";
      });
  },

  appendCentreGroup: function() {
    var centreGroup = this.svg.append('g');

    this.set("centreGroup", centreGroup);
  },

  appendCentreCircle: function(innerColor) {
      this.centreGroup.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", this.height()/this.centreRadiusRatio)
        .attr("class", "centre-circle");
  },

  appendCentreText: function() {
    var centreText = this.centreGroup.append("text")
      .attr("y", this.height()/this.centreRadiusRatio/3)
      .attr("text-anchor", "middle")
      .style("font-size", this.height()/this.centreRadiusRatio + "px")
      .text(0);

    this.set("centreText", centreText);
  },

  guideArc: function() {
    return d3.svg.arc()
      .innerRadius(this.height()/this.arcRadiusRatio * (1 - this.guideArcWidthRatio / 2))
      .outerRadius(this.height()/this.arcRadiusRatio * (1 + this.guideArcWidthRatio / 2))
      .startAngle(this.startAngle());
  },

  appendGuideArc: function() {
    this.svg.append("path")
      .datum({endAngle: this.endAngle()})
      .style("fill", "#ddd")
      .attr("d", this.guideArc());
  },

  progressArc: function() {
    return d3.svg.arc()
      .innerRadius(this.height()/this.arcRadiusRatio * (1 - this.progressArcWidthRatio / 2))
      .outerRadius(this.height()/this.arcRadiusRatio * (1 + this.progressArcWidthRatio / 2))
      .startAngle(this.startAngle());
  },

  appendProgressArc: function() {
    var foreground = this.svg.append("path")
      .datum({endAngle: this.startAngle()})
      .attr("class", "progress-arc")
      .attr("d", this.progressArc());

    this.set('foreground', foreground);
  },
});
