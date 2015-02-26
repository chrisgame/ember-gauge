import Em from 'ember';

export default Em.Route.extend({

  afterModel: function() {
    var self = this;
    Em.run.later(self, function() {
      self.controller.set('finished', true);
    }, 3000);
  }
});
