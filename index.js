'use strict';

module.exports = {
  name: 'live-reload-middleware',

  contentFor: function(type) {
    var liveReloadPort = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT;
    var baseURL = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_BASEURL;

    if (liveReloadPort && type === 'head') {
      return '<script src="' + baseURL + 'ember-cli-live-reload.js" type="text/javascript"></script>';
    }
  },

  dynamicScript: function(request) {
    var liveReloadPort = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT;
    var liveReloadHostURL = process.env.EMBER_CLI_LIVE_RELOAD_HOSTURL;
    var host = "' + (location.hostname || 'localhost') + '"; // JS code to figure out correct host

    if (liveReloadHostURL) {
      host = liveReloadHostURL; // append static string to script if option defined instead
    }

    return "(function() {\n " +
           "var src = (location.protocol || 'http:') + '//" + host + ":" + liveReloadPort + "/livereload.js?snipver=1';\n " +
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
    process.env.EMBER_CLI_INJECT_LIVE_RELOAD_BASEURL = options.liveReloadBaseUrl || options.baseURL;
    process.env.EMBER_CLI_LIVE_RELOAD_HOSTURL = options.liveReloadHostUrl;

    app.use(options.baseURL + 'ember-cli-live-reload.js', function(request, response, next) {
      response.contentType('text/javascript');
      response.send(self.dynamicScript());
    });
  }
};
