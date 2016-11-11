'use strict';

module.exports = {
  name: 'live-reload-middleware',

  contentFor: function(type) {
    var liveReloadPort = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT;

    if (liveReloadPort && type === 'head') {
      var liveReloadJsUrl = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_JS_URL;
      return '<script src="' + liveReloadJsUrl + 'ember-cli-live-reload.js" type="text/javascript"></script>';
    }
  },

  dynamicScript: function(request) {
    var liveReloadPort = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT;

    return "(function() {\n " +
           "var src = (location.protocol || 'http:') + '//' + (location.hostname || 'localhost') + ':" + liveReloadPort + "/livereload.js?snipver=1';\n " +
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
    // maintaining `baseURL` for backwards compatibility. See: http://emberjs.com/blog/2016/04/28/baseURL.html
    var baseURL = options.liveReloadBaseUrl || options.rootURL || options.baseURL;

    if (options.liveReload !== true) { return; }

    process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT = options.liveReloadPort;
    process.env.EMBER_CLI_INJECT_LIVE_RELOAD_BASEURL = baseURL;
    process.env.EMBER_CLI_INJECT_LIVE_RELOAD_JS_URL = options.liveReloadJsUrl || baseURL;

    app.use(baseURL + 'ember-cli-live-reload.js', function(request, response, next) {
      response.contentType('text/javascript');
      response.send(self.dynamicScript());
    });
  }
};
