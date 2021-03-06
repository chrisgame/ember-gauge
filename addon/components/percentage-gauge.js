import Ember from 'ember';
import GaugeMixin from './../mixins/gauge';

export default Ember.Component.extend(GaugeMixin, {

  percentageAngle: function() {
    return ((this.endAngle() * 2) * (this.get('percentage') / 100)) - this.endAngle();
  },

  animateProgressArc: function(duration) {
    this.foreground
      .transition()
      .call(arcTween, this.percentageAngle(), this.centreText, this.get('percentage'), this.progressArc())
      .duration(duration * (this.get('percentage') / 100));

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

  startAnimation: Ember.observer('percentage', function() {
    var duration = this.get('duration') || 7000;

    Ember.run.scheduleOnce('afterRender', this, this.animateProgressArc, duration);
  }),

  didInsertElement: function() {
    var icon = this.get('icon') || false;

    this.insertSvg();
    this.appendCentreGroup();
    this.appendCentreCircle();
    this.appendGuideArc();
    this.appendProgressArc();

    if (icon !== false) {
      this.appendIcon(icon, this.height());
    } else {
      this.appendCentreText();
    }

    if (this.get('percentage')) {
      this.startAnimation();
    }
  },
});
