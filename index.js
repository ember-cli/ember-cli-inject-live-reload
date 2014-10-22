'use strict';

module.exports = {
  name: 'live-reload-middleware',

  contentFor: function(type) {
    var liveReloadPort = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT;

    if (liveReloadPort && type === 'head') {
      return '<script src="/ember-cli-live-reload.js" type="text/javascript"></script>';
    }
  },

  dynamicScript: function(request) {
    var liveReloadHost = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_HOST;
    var liveReloadPort = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT;

    return "(function() {\n " +
           "var hostAndPort = " + liveReloadHost + ":" + liveReloadPort + ";\n" +
           "var src         = (location.protocol || 'http:') + '//' + hostAndPort + '/livereload.js?snipver=1';\n " +
           "var script      = document.createElement('script');\n " +
           "script.type     = 'text/javascript';\n " +
           "script.src      = src;\n " +
           "document.getElementsByTagName('head')[0].appendChild(script);\n" +
           "}());";
  },

  serverMiddleware: function(config) {
    var self = this;
    var app = config.app;
    var options = config.options;

    if (options.liveReload !== true) { return; }

    process.env.EMBER_CLI_INJECT_LIVE_RELOAD_HOST = options.host;
    process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT = options.liveReloadPort;

    app.use('/ember-cli-live-reload.js', function(request, response, next) {
      response.contentType('text/javascript');
      response.send(self.dynamicScript());
    });
  }
};
