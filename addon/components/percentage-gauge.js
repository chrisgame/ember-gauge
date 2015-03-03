import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  currentPercentage: 0,
  classNameBindings: ['name'],

  didInsertElement: function(){
    var name = this.get('name');
    var icon = this.get('icon') || false;
    var innerColor = this.get('innerColor') || '#5AC1E0';
    var outerColor = this.get('outerColor') || '#05AEF3';
    var duration = this.get('duration') || 7000;
    var percentage = this.get('percentage') || 0;
    var gaugeObj = this.gauge(
          name,
          this.$()[0],
          icon,
          innerColor,
          outerColor,
          duration,
          percentage
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
    duration,
    percentage
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
        percentageAngle = ((endAngle * 2) * (percentage / 100)) - endAngle,
        progressArcWidthRatio = 0.10,
        guideArcWidthRatio = 0.0245;
    var percentageText;

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

    if (icon !== false) {
      var centre = svg.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", height/centreRadiusRatio)
        .style("fill", innerColor);
    } else {
      var centreGroup = svg.append('g');
      var centre = centreGroup.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", height/centreRadiusRatio)
        .style("fill", innerColor);

      percentageText = centreGroup.append("text")
        .attr("y", height/centreRadiusRatio/3)
        .attr("text-anchor", "middle")
        .style("font-size", height/centreRadiusRatio + "px")
        .text(0);
    }

    var background = svg.append("path")
      .datum({endAngle: endAngle})
      .style("fill", "#ddd")
      .attr("d", guideArc);

    this.foreground = svg.append("path")
      .datum({endAngle: startAngle})
      .style("fill", "url(#" + name + "-gradient)")
      .attr("d", progressArc);

    if (icon !== false) {
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
    }

    this.start = function() {
      var self = this;
      this.foreground
        .transition()
        .call(arcTween, percentageAngle, percentageText, percentage)
        .each("end", function() { self.isComplete = true; })
        .duration(duration * (percentage / 100));
    };

    function arcTween(transition, newAngle, percentageText, percentage) {
      transition.attrTween("d", function(d) {
        var interpolate = d3.interpolate(d.endAngle, newAngle);
        var interpolatePercentage = d3.interpolateRound(0, percentage);

        return function(t) {
          d.endAngle = interpolate(t);
          if (percentageText) {
            percentageText[0][0].innerHTML = interpolatePercentage(t);
          }
          return progressArc(d);
        };
      });
      var power = 2 + Math.random() * 2;
      transition.ease("poly-out", power);
    }
  }
});
