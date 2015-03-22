import Em from 'ember';

export default Em.Route.extend({

  afterModel: function() {
    var self = this;
    Em.run.later(self, function() {
      self.controller.set('finished', true);
      self.controller.set('oneHundredPercent', 100);
      self.controller.set('seventyFivePercent', 75);
      self.controller.set('fiftyPercent', 50);
    }, 3000);
  }
});
