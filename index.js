'use strict';

module.exports = {
  name: 'live-reload-middleware',

  contentFor: function(type) {
    var liveReloadPort = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT;
    var liveReloadHost = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_HOST;
  
    if (liveReloadPort && type === 'head') {
      if (liveReloadHost) {
        return '<script src="//'+ liveReloadHost +':' + liveReloadPort + '/livereload.js?snipver=1" type="text/javascript"></script>';
      } else {
        return '<script type="text/javascript">(function(d,l,p,s){s=d.createElement("script");s.type="text/javascript";s.async=true;s.src=l.protocol+"//"+l.hostname+":"+p+"/livereload.js?snipver=1";d.getElementsByTagName("head")[0].appendChild(s)})(document,document.location,' + liveReloadPort  + ')</script>';
      }
    }
  },

  serverMiddleware: function(config) {
    var app = config.app;
    var options = config.options;

    if (options.liveReload !== true) { return; }

    if (this.shouldUseMiddleware()) {
      var livereloadMiddleware = require('connect-livereload');

      app.use(livereloadMiddleware({
        port: options.liveReloadPort
      }));
    } else {
      process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT = options.liveReloadPort;
    }
  },

  shouldUseMiddleware: function() {
    var version = this.project.emberCLIVersion();
    var portions = version.split('.');
    portions = portions.map(function(portion) {
      return Number(portion.split('-')[0]);
    });

    if (portions[0] > 0) {
      return false;
    } else if (portions[1] > 0) {
      return false;
    } else if (portions[2] > 46) {
      return false;
    } else {
      return true;
    }
  }
};
