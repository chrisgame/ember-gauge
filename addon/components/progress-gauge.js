import Ember from 'ember';
import GaugeMixin from './../mixins/gauge';

export default Ember.Component.extend(GaugeMixin, {

  speedUp: function() {
    var speedyDuration = this.get('speedyDuration') || 1000;
    var complete = this.get('complete');
    if (complete) {
      this.finish(speedyDuration);
    }
  }.observes('complete'),

  animateProgressArc: function(duration) {
    this.foreground
      .transition()
      .call(arcTween, this.endAngle(), this.centreText, this.progressArc())
      .each("end", function() { this.isComplete = true; })
      .duration(duration);

    function arcTween(transition, newAngle, centreText, progressArc) {
      transition.attrTween("d", function(d) {
        var interpolate = d3.interpolate(d.endAngle, newAngle);
        var interpolatePercentage = d3.interpolateRound(0, 100);

        return function(t) {
          d.endAngle = interpolate(t);
          if (centreText) {
            centreText[0][0].innerHTML = interpolatePercentage(t);
          }
          return progressArc(d);
        };
      });
      var power = 2 + Math.random() * 2;
      transition.ease("poly-out", power);
    }
  },

  finish: function(speedyDuration) {
    this.foreground
      .transition()
      .call(arcTween, this.endAngle(), this.centreText, this.progressArc())
      .each("end", function() { this.isComplete = true; })
      .duration(speedyDuration);

    function arcTween(transition, newAngle, centreText, progressArc) {
      transition.attrTween("d", function(d) {
        var interpolate = d3.interpolate(d.endAngle, newAngle);
        var interpolatePercentage = d3.interpolateRound(0, 100);

        return function(t) {
          d.endAngle = interpolate(t);
          if (centreText) {
            centreText[0][0].innerHTML = interpolatePercentage(t);
          }
          return progressArc(d);
        };
      });
      var power = 2 + Math.random() * 2;
      transition.ease("poly-out", power);
    }
  },

  didInsertElement: function() {
    var name = this.get('name');
    var icon = this.get('icon') || false;
    var innerColor = this.get('innerColor') || '#5AC1E0';
    var outerColor = this.get('outerColor') || '#05AEF3';
    var duration = this.get('duration') || 7000;

    this.insertSvg();
    this.appendGradient(name, innerColor, outerColor);
    this.appendCentreGroup();
    this.appendCentreCircle(innerColor);
    this.appendGuideArc();
    this.appendProgressArc();

    if (icon !== false) {
      this.appendIcon(icon, this.height());
    } else {
      this.appendCentreText();
    }

    Ember.run.scheduleOnce('afterRender', this.animateProgressArc(duration));
  },
});
