import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  speedUp: function(){
    var complete = this.get('complete');
    if (complete) {
      this.finish();
    }
  }.observes('complete'),

  didInsertElement: function(){
    var name = this.get('name');
    var icon = this.get('icon');
    var innerColor = this.get('innerColor');
    var outerColor = this.get('outerColor');
    var longDuration = this.get('longDuration');
    var speedyDuration = this.get('speedyDuration');
    var complete = this.get('complete');
    var gaugeObj = this.gauge(
          name,
          this.$()[0],
          icon,
          innerColor,
          outerColor,
          longDuration,
          speedyDuration
        );
    this.set('controller.icon', gaugeObj);

    Ember.run.scheduleOnce('afterRender', this, this.start());
  },

  gauge: function(
    name,
    target,
    icon,
    innerColor,
    outerColor,
    longDuration,
    speedyDuration
  ) {

    var targetDiv = d3.select(target),
        width = targetDiv.node().getBoundingClientRect().width,
        height = width,
        radiansConversion = Math.PI/180,
        arcRadiusRatio = 2.1,
        centreRadiusRatio = 2.7,
        imageRadiusRatio = 3.6,
        startAngle = Math.acos(arcRadiusRatio / centreRadiusRatio) - Math.PI,
        endAngle = -startAngle,
        progressArcWidthRatio = 0.10,
        guideArcWidthRatio = 0.0245;

    this.isComplete = false;

    this.start = function() {
      var self = this;
      this._foreground
        .transition()
        .call(arcTween, endAngle)
        .each("end", function() { self.isComplete = true; })
        .duration(longDuration);
    };

    this.finish = function() {
      var self = this;
      this._foreground
        .transition()
        .call(arcTween, endAngle)
        .each("end", function() { self.isComplete = true; })
        .duration(speedyDuration);
    };

    var progressArc = d3.svg.arc()
      .innerRadius(height/arcRadiusRatio * (1 - progressArcWidthRatio / 2))
      .outerRadius(height/arcRadiusRatio * (1 + progressArcWidthRatio / 2))
      .startAngle(startAngle);

    var guideArc = d3.svg.arc()
      .innerRadius(height/arcRadiusRatio * (1 - guideArcWidthRatio / 2))
      .outerRadius(height/arcRadiusRatio * (1 + guideArcWidthRatio / 2))
      .startAngle(startAngle);

    var svg = targetDiv.insert("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var gradient = svg.append("svg:defs")
      .append("svg:linearGradient")
      .attr("id", name + "-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%")
      .attr("spreadMethod", "pad");

    gradient.append("svg:stop")
      .attr("offset", "0%")
      .attr("stop-color", innerColor)
      .attr("stop-opacity", 1);

    gradient.append("svg:stop")
      .attr("offset", "100%")
      .attr("stop-color", outerColor)
      .attr("stop-opacity", 1);

    var centre = svg.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", height/centreRadiusRatio)
      .style("fill", innerColor);

    var image = svg.append("path")
      .style("fill", "white")
      .attr("width", 100)
      .attr("height", 100)
      .attr("d", icon)
      .attr("transform", function() {
        var h = this.getBBox().height;
        var w = this.getBBox().width;
        var imageRadius = Math.sqrt(h * h + w * w) / 2;
        var scale = height / (imageRadiusRatio * imageRadius);
        return "translate(-" + (w * scale / 2) + ",-" + (h * scale / 2) + ") scale(" + scale + ")";
      });

    var background = svg.append("path")
      .datum({endAngle: endAngle})
      .style("fill", "#ddd")
      .attr("d", guideArc);

    this._foreground = svg.append("path")
      .datum({endAngle: startAngle})
      .style("fill", "url(#" + name + "-gradient)")
      .attr("d", progressArc);

    function arcTween(transition, newAngle) {
      transition.attrTween("d", function(d) {
        var interpolate = d3.interpolate(d.endAngle, newAngle);

        return function(t) {
          d.endAngle = interpolate(t);
          return progressArc(d);
        };
      });
      var power = 2 + Math.random() * 2;
      transition.ease("poly-out", power);
    }
  }
});
