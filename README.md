# ember-cli-inject-live-reload

Plugin for ember-cli that injects live-reload script into HTML content.

## Overview

This plugin injects a script tag to load `ember-cli-live-reload.js` in the head of your application's html.

The contents of `ember-cli-live-reload.js` are dynamically generated to configure and inject `livereload.js`, which is served by Ember CLI courtesy of its `tiny-lr` dependency.

`livereload.js` initiates a websocket connection back to Ember CLI. This allows Ember CLI to notify the browser to trigger a refresh after JavaScript or style changes.

## Configuration

For vanilla Ember CLI apps, no configuration is required.

The following options are supported via command line arguments or the `.ember-cli` file:

|Option|Purpose|
|------|-------|
| `liveReload` | Defaults to `true` during `ember serve`. Set to `false` to prevent the livereload script tag from being injected. |
| `liveReloadPort` | Specifies the port that `ember-cli-live-reload.js` and `livereload.js` are loaded from  |
| `liveReloadHost` | The host that `ember-cli-live-reload.js` will be loaded from |

