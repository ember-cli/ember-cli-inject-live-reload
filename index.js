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
    let liveReloadPort;
    if (options.liveReloadPort !== options.port) {
      liveReloadPort = options.liveReloadPort
    }
    return `(function() {${liveReloadOptions ? "\n  window.LiveReloadOptions = " + JSON.stringify(liveReloadOptions) + ";" : ''}
  var srcUrl = ${options.liveReloadJsUrl ? "'" + options.liveReloadJsUrl + "'" : null};
  var host= location.hostname || 'localhost';
  var liveReloadPort = ${liveReloadPort};
  var defaultPort = location.protocol === 'https:' ? 443 : 80;
  var port = liveReloadPort || location.port || defaultPort;
  var path = '${options.liveReloadPrefix ? '&path=' + options.liveReloadPrefix + '/livereload' : ''}';
  var prefixURL = '${liveReloadPort ? "(location.protocol || 'http:') + '//' + host + ':' + " + liveReloadPort : ''}';
  var src = srcUrl || prefixURL + '${liveReloadPath + 'livereload.js?port='}' + port + '&host=' + host + path;
  var script    = document.createElement('script');
  script.type   = 'text/javascript';
  script.src    = src;
  document.getElementsByTagName('head')[0].appendChild(script);
}());`;
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
