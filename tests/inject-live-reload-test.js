"use strict";

const describe = QUnit.module;
const it = QUnit.test;
const express = require("express");
const http = require("http");

const InjectLiveReload = require("ember-cli-inject-live-reload");
process.env = {
  EMBER_CLI_INJECT_LIVE_RELOAD_BASEURL: "test/",
  EMBER_CLI_INJECT_LIVE_RELOAD_PORT: 4200,
};

describe("contenFor returns", () => {
  it("right path for ember-cli-inject-live-reload.js", (assert) => {
    let scriptTag = InjectLiveReload.contentFor("head");
    assert.equal(
      scriptTag,
      '<script data-embroider-ignore src="test/ember-cli-live-reload.js" type="text/javascript"></script>'
    );
  });
  it("nothing if type is not head", (assert) => {
    let scriptTag = InjectLiveReload.contentFor("body");
    assert.equal(scriptTag, undefined);
  });
});

describe("dynamicScript returns right script when", (hooks) => {
  let options, location;

  function evaluate(script) {
    let functionBody = `
      'use strict';

      let script = null;
      let location = ${JSON.stringify(location)};
      let window = {};
      let document = {
        createElement() {
          return { };
        },
        getElementsByTagName() {
          return [
            {
              appendChild(_script) {
                script = _script;
              }
            }
          ];
        }
      };

        ${script}

      return { script, LiveReloadOptions: window.LiveReloadOptions };
    `;

    try {
      return new Function(functionBody)();
    } catch (e) {
      QUnit.config.current.assert.ok(
        false,
        `${e.message} while evaluating\n\n${functionBody}\n`
      );
    }
  }

  function getScriptSrc(script) {
    return evaluate(script).script.src;
  }

  hooks.beforeEach(() => {
    options = {
      port: 4200,
      liveReloadPort: 4200,
      liveReloadPrefix: "_lr",
      liveReloadJsUrl: null,
      liveReloadOptions: null,
    };

    location = {
      hostname: "localhost",
      protocol: "http:",
      port: 4200,
    };
  });

  it("liveReloadPort and port are same", (assert) => {
    let script = InjectLiveReload.dynamicScript(options);
    let actual = getScriptSrc(script);

    assert.strictEqual(
      actual,
      "/_lr/livereload.js?port=4200&host=localhost&path=_lr/livereload"
    );
  });

  it("liveReloadPort and port are different", (assert) => {
    options.liveReloadPort = "35729";
    let script = InjectLiveReload.dynamicScript(options);
    let actual = getScriptSrc(script);

    assert.strictEqual(
      actual,
      "http://localhost:35729/_lr/livereload.js?port=35729&host=localhost&path=_lr/livereload"
    );
  });

  it("liveReloadPort and port are same, but both are different from location.port", (assert) => {
    options.liveReloadPort = "9999";
    options.port = "9999";
    let script = InjectLiveReload.dynamicScript(options);
    let actual = getScriptSrc(script);

    assert.strictEqual(
      actual,
      "http://localhost:9999/_lr/livereload.js?port=9999&host=localhost&path=_lr/livereload"
    );
  });

  it("liveReloadPrefix is provided", (assert) => {
    options.liveReloadPrefix = "other-lr-path";
    let script = InjectLiveReload.dynamicScript(options);
    let actual = getScriptSrc(script);

    assert.strictEqual(
      actual,
      "/other-lr-path/livereload.js?port=4200&host=localhost&path=other-lr-path/livereload"
    );
  });

  it("liveReloadJs file URL is explicitly provided", (assert) => {
    options.liveReloadJsUrl = "test.com";
    let script = InjectLiveReload.dynamicScript(options);
    let actual = getScriptSrc(script);

    assert.strictEqual(actual, "test.com");
  });

  it("liveReloadOptions are provided", (assert) => {
    options.liveReloadOptions = { test: "wowza" };
    let script = InjectLiveReload.dynamicScript(options);
    let actual = evaluate(script);

    assert.deepEqual(
      actual.LiveReloadOptions,
      Object.assign({ snipver: 1 }, options.liveReloadOptions)
    );
  });
});

describe("serverMiddleware", (hooks) => {
  let config, server;

  hooks.before(() => {
    config = {
      app: express(),
      options: {
        liveReloadPort: 4200,
        rootURL: "/test/",
        liveReload: true,
        port: 4200,
      },
    };
  });

  hooks.after(() => {
    server.close();
  });

  it("http request to get ember-cli-inject-live-reload.js is served", (assert) => {
    let done = assert.async();
    InjectLiveReload.serverMiddleware(config);
    server = config.app.listen(4200);
    //if test hangs at test 8 make sure port 4200 is not being used.
    http.get(
      "http://localhost:4200/test/ember-cli-live-reload.js",
      (response) => {
        let buf = "";
        response.on("data", (chunk) => {
          buf += chunk;
        });
        response.on("end", () => {
          assert.equal(
            buf,
            `(function() {
  var srcUrl = null;
  var host = location.hostname || 'localhost';
  var useCustomPort = false || location.port !== 4200;
  var defaultPort = location.port || (location.protocol === 'https:' ? 443 : 80);
  var port = useCustomPort ? 4200 : defaultPort;
  var path = '';
  var prefixURL = useCustomPort ? (location.protocol || 'http:') + '//' + host + ':' + 4200 : '';
  var src = srcUrl || prefixURL + '/livereload.js?port=' + port + '&host=' + host + path;
  var script    = document.createElement('script');
  script.type   = 'text/javascript';
  script.src    = src;
  document.getElementsByTagName('head')[0].appendChild(script);
}());`
          );
          done();
        });
      }
    );
  });
});
