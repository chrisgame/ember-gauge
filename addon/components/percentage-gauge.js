import Ember from 'ember';
import GaugeMixin from './../mixins/gauge';

export default Ember.Component.extend(GaugeMixin, {

  percentage: function() {
    return this.percentage || 0;
  },

  percentageAngle: function() {
    return ((this.endAngle() * 2) * (this.percentage / 100)) - this.endAngle();
  },

  animateProgressArc: function(duration) {
    this.foreground
      .transition()
      .call(arcTween, this.percentageAngle(), this.centreText, this.percentage, this.progressArc())
      .duration(duration * (this.percentage / 100));

    function arcTween(transition, newAngle, centreText, percentage, progressArc) {
      transition.attrTween("d", function(d) {
        var interpolate = d3.interpolate(d.endAngle, newAngle);
        var interpolatePercentage = d3.interpolateRound(0, percentage);

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
