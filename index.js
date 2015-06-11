'use strict';

module.exports = {
  name: 'live-reload-middleware',

  contentFor: function(type) {
    var liveReloadScriptSrc = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_SCRIPT_SRC;

    if (liveReloadScriptSrc && type === 'head') {
      return '<script src="' + liveReloadScriptSrc + '" type="text/javascript"></script>';
    }
  },
  serverMiddleware: function(config) {
    var options = config.options;

    if (options.liveReload !== true) { return; }

    var liveReloadHost = options.liveReloadHost || options.host;

    var scheme = options.ssl ? 'https://' : 'http://';
    var src = [scheme, liveReloadHost, ':', options.liveReloadPort, '/livereload.js?snipver=1'].join('');

    process.env.EMBER_CLI_INJECT_LIVE_RELOAD_SCRIPT_SRC = src;
  }
};
