'use strict';

var util = require('util');

module.exports = {
  name: 'live-reload-middleware',

  contentFor: function(type) {
    var liveReloadPort = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT;
    var baseURL = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_BASEURL;
    var origin = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_ORIGIN;

    if (liveReloadPort && type === 'head') {
      return '<script src="' + (origin || baseURL) + 'ember-cli-live-reload.js"></script>';
    }
  },

  dynamicScript: function(request) {
    var port = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT;
    var host = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_HOST;
    var resource = 'livereload.js?snipver=1';

    var scriptSrc;
    if (host) {
      scriptSrc = util.format("'http://%s:%d/%s'", host, port, resource);
    } else {
      scriptSrc = util.format("(location.protocol || 'http:') + '//' + (location.hostname || 'localhost') + ':%d/%s'", port, resource);
    }

    return "(function() {\n " +
           "var src = " + scriptSrc + ";\n " +
           "var script    = document.createElement('script');\n " +
           "script.type   = 'text/javascript';\n " +
           "script.src    = src;\n " +
           "document.getElementsByTagName('head')[0].appendChild(script);\n" +
           "}());";
  },

  serverMiddleware: function(config) {
    var self = this;
    var app = config.app;
    var options = config.options;

    if (options.liveReload !== true) { return; }

    process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT = options.liveReloadPort;
    process.env.EMBER_CLI_INJECT_LIVE_RELOAD_BASEURL = options.baseURL;

    if (options.detectLiveReloadOrigin === true) {
      process.env.EMBER_CLI_INJECT_LIVE_RELOAD_HOST = options.host;
      process.env.EMBER_CLI_INJECT_LIVE_RELOAD_ORIGIN = util.format('http://%s:%d/', options.host, options.port);
    }

    app.use(options.baseURL + 'ember-cli-live-reload.js', function(request, response, next) {
      response.contentType('text/javascript');
      response.send(self.dynamicScript());
    });
  }
};
