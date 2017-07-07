/* eslint-env node */
'use strict';
const Rollup = require('broccoli-rollup');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const browserifyPlugin = require('rollup-plugin-browserify-transform');
const brfs = require('brfs');
const resolve = require('resolve');
const path = require('path');

module.exports = {
  name: 'ember-canvas',

  treeForVendor() {
    let dir = path.join(this.pathBase('linebreak'), 'src');

    return new Rollup(dir, {
      rollup: {
        entry: 'linebreaker.js',
        dest: 'linebreak.js',
        moduleName: 'linebreak',
        format: 'iife',
        plugins: [
          nodeResolve({
            jsnext: true,
            main: true
          }),
          browserifyPlugin(brfs),
          commonjs()
        ]
      }
    });
  },

  included(app) {
    this._super.included.apply(this, arguments);

    // If the addon has the _findHost() method (in ember-cli >= 2.7.0), we'll just
    // use that.
    if (typeof this._findHost === 'function') {
      app = this._findHost();
    }

    // Otherwise, we'll use this implementation borrowed from the _findHost()
    // method in ember-cli.
    // Keep iterating upward until we don't have a grandparent.
    // Has to do this grandparent check because at some point we hit the project.
    let current = this;
    do {
     app = current.app || app;
    } while (current.parent.parent && (current = current.parent));

    app.import('vendor/linebreak.js');
  },

  pathBase(packageName) {
    return path.dirname(resolve.sync(packageName + '/package.json', { basedir: __dirname }));
  }
};
