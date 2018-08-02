'use strict';

var buildLiveReloadPath = require('clean-base-url');

module.exports = {
  name: 'live-reload-middleware',

  contentFor: function(type) {
    var liveReloadPort = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT;
    var baseURL = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_BASEURL;

    if (liveReloadPort && type === 'head') {
      return '<script src="' + baseURL + 'ember-cli-live-reload.js" type="text/javascript"></script>';
    }
  },

  dynamicScript: function(options) {
    var liveReloadOptions = options.liveReloadOptions;
    if (liveReloadOptions && liveReloadOptions.snipver === undefined) {
      liveReloadOptions.snipver = 1;
    }

    var liveReloadPath = buildLiveReloadPath(options.liveReloadPrefix) || '/';
    return "(function() {\n " +
           (liveReloadOptions ? "window.LiveReloadOptions = " + JSON.stringify(liveReloadOptions) + ";\n " : '') +
           "var srcUrl = " + (options.liveReloadJsUrl ? "'" + options.liveReloadJsUrl + "'" : "null") + ";\n " +
           "var host= location.hostname || 'localhost';\n " +
           "var src = srcUrl || ((location.protocol || 'http:') + '//' + host + ':" + options.liveReloadPort + liveReloadPath +"livereload.js?host='+host+'&port='+"+ options.liveReloadPort +");\n " +
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

    var baseURLWithoutHost = baseURL.replace(/^https?:\/\/[^\/]+/, '');
    app.use(baseURLWithoutHost + 'ember-cli-live-reload.js', function(request, response, next) {
      response.contentType('text/javascript');
      response.send(self.dynamicScript(options));
    });
  }
};
