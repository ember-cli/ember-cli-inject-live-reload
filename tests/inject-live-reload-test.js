const describe = QUnit.module;
const it = QUnit.test;
const express = require('express');
const http = require('http');

const InjectLiveReload = require('../index');
process.env = {
  EMBER_CLI_INJECT_LIVE_RELOAD_BASEURL : 'test/',
  EMBER_CLI_INJECT_LIVE_RELOAD_PORT: 4200
}

describe('contenFor returns', () => {
  it('right path for ember-cli-inject-live-reload.js', assert => {
    let scriptTag = InjectLiveReload.contentFor('head');
    assert.equal(scriptTag, '<script src="test/ember-cli-live-reload.js" type="text/javascript"></script>');
  });
  it('nothing if type is not head', assert => {
    let scriptTag = InjectLiveReload.contentFor('body');
    assert.equal(scriptTag, undefined);
  })
});

describe('dynamicScript returns right script when', hooks => {
  let options;
  hooks.beforeEach(() => {
    options = {
      port: 4200,
      liveReloadPort: 4200
    };
  });

  it('livereload port and port are same', assert => {
    let script = InjectLiveReload.dynamicScript(options);
    assert.equal(script, `(function() {
  var srcUrl = null;
  var host= location.hostname || 'localhost';
  var liveReloadPort = undefined;
  var defaultPort = location.protocol === 'https:' ? 443 : 80;
  var port = liveReloadPort || location.port || defaultPort;
  var prefixURL = '';
  var src = srcUrl || prefixURL + '/livereload.js?port=' + port + '&host=' + host;
  var script    = document.createElement('script');
  script.type   = 'text/javascript';
  script.src    = src;
  document.getElementsByTagName('head')[0].appendChild(script);
}());`);
  });

  it('livereload port and port are different', assert => {
    options.liveReloadPort = '35729';
    let script = InjectLiveReload.dynamicScript(options);
    assert.equal(script, `(function() {
  var srcUrl = null;
  var host= location.hostname || 'localhost';
  var liveReloadPort = 35729;
  var defaultPort = location.protocol === 'https:' ? 443 : 80;
  var port = liveReloadPort || location.port || defaultPort;
  var prefixURL = '(location.protocol || 'http:') + '//' + host + ':' + 35729';
  var src = srcUrl || prefixURL + '/livereload.js?port=' + port + '&host=' + host;
  var script    = document.createElement('script');
  script.type   = 'text/javascript';
  script.src    = src;
  document.getElementsByTagName('head')[0].appendChild(script);
}());`);
  });

  it('livereload prefix is provided', assert => {
    options.liveReloadPrefix = 'test';
    let script = InjectLiveReload.dynamicScript(options);
    assert.equal(script, `(function() {
  var srcUrl = null;
  var host= location.hostname || 'localhost';
  var liveReloadPort = undefined;
  var defaultPort = location.protocol === 'https:' ? 443 : 80;
  var port = liveReloadPort || location.port || defaultPort;
  var prefixURL = '';
  var src = srcUrl || prefixURL + '/test/livereload.js?port=' + port + '&host=' + host;
  var script    = document.createElement('script');
  script.type   = 'text/javascript';
  script.src    = src;
  document.getElementsByTagName('head')[0].appendChild(script);
}());`)
  });

  it('livereloadJs file URL is explicitly provided', assert => {
    options.liveReloadJsUrl = 'test.com';
    let script = InjectLiveReload.dynamicScript(options);
    assert.equal(script, `(function() {
  var srcUrl = 'test.com';
  var host= location.hostname || 'localhost';
  var liveReloadPort = undefined;
  var defaultPort = location.protocol === 'https:' ? 443 : 80;
  var port = liveReloadPort || location.port || defaultPort;
  var prefixURL = '';
  var src = srcUrl || prefixURL + '/livereload.js?port=' + port + '&host=' + host;
  var script    = document.createElement('script');
  script.type   = 'text/javascript';
  script.src    = src;
  document.getElementsByTagName('head')[0].appendChild(script);
}());`)
  });

  it('livereloadOptions are provided', assert => {
    options.liveReloadOptions = { test: true};
    let script = InjectLiveReload.dynamicScript(options);
    assert.equal(script, `(function() {
  window.LiveReloadOptions = {"test":true,"snipver":1};
  var srcUrl = null;
  var host= location.hostname || 'localhost';
  var liveReloadPort = undefined;
  var defaultPort = location.protocol === 'https:' ? 443 : 80;
  var port = liveReloadPort || location.port || defaultPort;
  var prefixURL = '';
  var src = srcUrl || prefixURL + '/livereload.js?port=' + port + '&host=' + host;
  var script    = document.createElement('script');
  script.type   = 'text/javascript';
  script.src    = src;
  document.getElementsByTagName('head')[0].appendChild(script);
}());`)
  });
});

describe('serverMiddleware', hooks => {
  let config, server;

  hooks.before(() => {
    config = {
      app : express(),
      options: {
        liveReloadPort: 4200,
        rootURL: '/test/',
        liveReload: true,
        port: 4200
      }
    }
  });

  hooks.after(() => {
    server.close();
  });

  it('http request to get ember-cli-inject-live-reload.js is served', (assert) => {
    let done = assert.async();
    InjectLiveReload.serverMiddleware(config);
    server = config.app.listen(4200);
    //if test hangs at test 8 make sure port 4200 is not being used.
    http.get('http://localhost:4200/test/ember-cli-live-reload.js', (response) => {
      let buf = '';
      response.on('data', (chunk) => {
        buf += chunk;
      });
      response.on('end', () => {
      assert.equal(buf, `(function() {
  var srcUrl = null;
  var host= location.hostname || 'localhost';
  var liveReloadPort = undefined;
  var defaultPort = location.protocol === 'https:' ? 443 : 80;
  var port = liveReloadPort || location.port || defaultPort;
  var prefixURL = '';
  var src = srcUrl || prefixURL + '/livereload.js?port=' + port + '&host=' + host;
  var script    = document.createElement('script');
  script.type   = 'text/javascript';
  script.src    = src;
  document.getElementsByTagName('head')[0].appendChild(script);
}());`);
        done();
      })
    })
  })
});