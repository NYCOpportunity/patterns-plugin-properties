#!/usr/bin/env node

'use strict'

/**
 * Dependencies
 */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const cssVars = require('css-vars-from-json');

/**
 * @pttrn Dependencies
 */

const pttrn = `${process.env.PWD}/node_modules/@nycopportunity/pttrn`;
const alerts = require(`${pttrn}/config/alerts`);
const args = require(`${pttrn}/bin/util/args`).args;
const cnsl = require(`${pttrn}/bin/util/console`);
const resolve = require(`${pttrn}/bin/util/resolve`);

/**
 * Get options for the command.
 *
 * @return  {Object}  The options object.
 */
const options = function() {
  return {
    modules: resolve('config/properties', true, false),
    globs: [
      `${process.env.PWD}/config/properties.js`,
      `${process.env.PWD}/config/tokens.js`
    ]
  }
};

/**
 * Our Chokidar Watcher
 *
 * @source https://github.com/paulmillr/chokidar
 */
const watcher = chokidar.watch(options().globs, {
  usePolling: false,
  awaitWriteFinish: {
    stabilityThreshold: 750
  }
});

/**
 * Write file to the distribution folder
 *
 * @param   {String}     file  The file source
 * @param   {Object}     data  The data to pass to the file
 *
 * @return  {Undefined}        The result of fs.writeFileSync()
 */
const write = async (mod, data) => {
  try {
    let dist = mod.dist;

    if (!fs.existsSync(path.dirname(dist))) {
      fs.mkdirSync(path.dirname(dist), {recursive: true});
    }

    let written = fs.writeFileSync(dist, data);

    cnsl.describe(`${alerts.tokens} Properties written to ${alerts.str.path(dist)}`);

    return written;
  } catch (err) {
    cnsl.error(`Failed (write): ${err.stack}`);
  }
}

/**
 * A sample file read and replace method
 *
 * @param   {String}  mod  Module containing the CSS Properties
 *
 * @return  {String}       File contents
 */
const replace = async mod => {
  let ruleset = (mod.hasOwnProperty('ruleset')) ? mod['ruleset'] : ':root';

  return `${ruleset} { ${cssVars(mod['properties'])} }`;
};

/**
 * The main task bus for transforming contents of a source file
 *
 * @param   {String}  file  Path to source file
 *
 * @return  {String}        Transformed data
 */
const main = async mod => {
  try {
    let data = await replace(mod); // Do something with the file data here

    await write(mod, data);

    return data;
  } catch (err) {
    cnsl.error(`Failed (main): ${err.stack}`);
  }
};

/**
 * Runner for the sample script. If the -w or --watch flag is passed it will
 * run the watcher method. If a single filename is passed it will run the
 * main task on the file.
 *
 * @type {Function}
 */
const run = async () => {
  if (args.watch) {
    try {
      watcher.on('change', async changed => {
        cnsl.watching(`Detected change on ${alerts.str.path(changed)}`);

        let opts = options();

        for (let i = 0; i < opts.modules.length; i++) {
          await main(opts.modules[i]);
        }
      });

      cnsl.watching(`Properties watching ${alerts.str.ext(options().globs.join(', '))}`);
    } catch (err) {
      cnsl.error(`Failed (run): ${err.stack}`);
    }
  } else {
    let opts = options();

    for (let i = 0; i < opts.modules.length; i++) {
      await main(opts.modules[i]);
    }

    process.exit(); // One-off commands must exit
  }
};

/**
 * Export our methods
 *
 * @type {Object}
 */
module.exports = {
  run: run
};
