'use strict';

module.exports = {
  name: 'live-reload-middleware',

  serverMiddleware: function(options) {
    var app = options.app;
    options = options.options;

    if (options.liveReload === true) {
      var livereloadMiddleware = require('connect-livereload');

      app.use(livereloadMiddleware({
        port: options.liveReloadPort
      }));
    }
  }
};
