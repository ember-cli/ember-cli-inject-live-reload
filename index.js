'use strict';

module.exports = {
  name: 'live-reload-middleware',

  contentFor(type) {
    let liveReloadPort = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT;
    let baseURL = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_BASEURL;

    if (liveReloadPort && type === 'head') {
      return `<script src="${baseURL}ember-cli-live-reload.js" type="text/javascript"></script>`;
    }
  },

  dynamicScript(jsUrl, port) {
    return `
      (function() {
        var srcUrl = ('${jsUrl}' !== 'undefined') ? '${jsUrl}' : null;
        var src = srcUrl || ((location.protocol || 'http:') + '//' + (location.hostname || 'localhost') + ':${port}/livereload.js?snipver=1');
        var script    = document.createElement('script');
        script.type   = 'text/javascript';
        script.src    = src;
        document.getElementsByTagName('head')[0].appendChild(script);
      }());
    `;
  },

  serverMiddleware(config) {
    if (config.options.liveReload !== true) { return; }

    let options = config.options;
    let app = config.app;
    // maintaining `baseURL` for backwards compatibility. See: http://emberjs.com/blog/2016/04/28/baseURL.html
    let baseURL = options.liveReloadBaseUrl || options.rootURL || options.baseURL;
    let port = options.port;
    let liveReloadJsUrl = options.liveReloadJsUrl;

    process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT = port;
    process.env.EMBER_CLI_INJECT_LIVE_RELOAD_BASEURL = baseURL;

    app.use(`${baseURL}ember-cli-live-reload.js`, (request, response, next) => {
      response.contentType('text/javascript');
      response.send(this.dynamicScript(liveReloadJsUrl, port));
    });
  }
};
