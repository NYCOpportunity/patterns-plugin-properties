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
 * Config file for this script
 */

const config = require(`${process.env.PWD}/config/properties`);

/**
 * @pttrn Dependencies
 */

const pttrn = `${process.env.PWD}/node_modules/@nycopportunity/pttrn`;
const alerts = require(`${pttrn}/config/alerts`);
const args = require(`${pttrn}/bin/util/args`).args;
const cnsl = require(`${pttrn}/bin/util/console`);
const resolve = require(`${pttrn}/bin/util/resolve`);

/**
 * Constants
 */

const SRC = config;
const DIST = config.dist;
const GLOBS = [
  `${process.env.PWD}/config/properties.js`,
  `${process.env.PWD}/config/tokens.js`
];

/**
 * Our Chokidar Watcher
 *
 * @source https://github.com/paulmillr/chokidar
 */
const watcher = chokidar.watch(GLOBS, {
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
const write = async (file, data) => {
  try {
    let dist = DIST;

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
 * @param   {String}  file  Path to the file
 *
 * @return  {String}        File contents
 */
const replace = async () => {
  const properties = resolve('config/properties', true, false);

  if (properties['delete']) {
    for (let i = 0; i < properties['delete'].length; i++) {
      delete properties[properties['delete'][i]];
    }

    delete properties['delete'];
  }

  return `:root{ ${cssVars(properties)} }`;
};

/**
 * The main task bus for transforming contents of a source file
 *
 * @param   {String}  file  Path to source file
 *
 * @return  {String}        Transformed data
 */
const main = async (file) => {
  try {
    let data = await replace(); // Do something with the file data here

    await write(file, data);

    return data;
  } catch (err) {
    cnsl.error(`Failed (main): ${err.stack}`);
  }
};

/**
 * Read a specific file, if it is a directory read all of the files in it,
 * then, perform the main task on the file.
 *
 * @param  {String}  file  A single file or directory to recursively walk
 */
const walk = async (file) => {
  await main(file);
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

        await main(changed);
      });

      cnsl.watching(`Properties watching ${alerts.str.ext(GLOBS.join(', '))}`);
    } catch (err) {
      cnsl.error(`Failed (run): ${err.stack}`);
    }
  } else {
    let file = SRC;

    if (file) {
      await main(file);
    } else {
      cnsl.error(`Failed (run): A file needs to be passed as an argument or a directory with files needs to be present if not using the ${alerts.str.string('--watch')} flag.`);
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
