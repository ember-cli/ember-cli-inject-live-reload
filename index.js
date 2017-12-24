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

  dynamicScript: function(options) {
    var liveReloadPrefix = options.liveReloadPrefix || '_lr';

    if (liveReloadPrefix.length && (liveReloadPrefix[liveReloadPrefix.length - 1] !== '/')) {
      liveReloadPrefix += '/';
    }

    var liveReloadOptions = options.liveReloadOptions;
    if (liveReloadOptions && liveReloadOptions.snipver === undefined) {
      liveReloadOptions.snipver = 1;
    }

    return "(function() {\n " +
           (liveReloadOptions ? "window.LiveReloadOptions = " + JSON.stringify(liveReloadOptions) + ";\n " : '') +
           "var srcUrl = " + (options.liveReloadJsUrl ? "'" + options.liveReloadJsUrl + "'" : "null") + ";\n " +
           "var hostname = location.hostname || 'localhost';" +
           "var src = srcUrl || ((location.protocol || 'http:') + '//' + hostname + ':" + options.liveReloadPort + "/" + liveReloadPrefix + "livereload.js?path=" + liveReloadPrefix + "livereload&host=' + hostname + '&port=" + options.liveReloadPort + "');\n " +
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
