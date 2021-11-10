# Patterns CLI CSS Properties Plugin

A plugin command script for the [Patterns CLI](https://github.com/nycopportunity/patterns-cli) that will compile a JSON object containing design tokens into CSS Custom Properties using the [css-vars-from-json](https://github.com/TimoBechtel/css-vars-from-json) package.

## Usage

Install as a development dependency in a project that uses the [Patterns CLI](https://github.com/CityOfNewYork/patterns-cli).

```shell
$ npm install @nycopportunity/pttrn-plugin-properties -D
```

Add a proxy command script in the **./bin/** directory:

```shell
$ touch bin/properties.js
$ echo "module.exports = require('@nycopportunity/pttrn-plugin-properties');"
```

This will make the command available to the CLI. Compile the sprite by running:

```shell
$ npx pttrn properties
$ ⚫ Tokens in ./config/tokens.js out ./src/config/_tokens.scss
```

Can also be ran with the watching flag `-w`.

```shell
$ npx pttrn properties -w
$ 👀 Properties watching ./config/properties.js, ./config/tokens.js
$ 👀 Detected change on ./config/tokens.js
$ ⚫ Properties written to dist/css/tokens.css
```

The **dist/css/tokens.css** will contain a `:root { ... }` declaration with all of the properties in the tokens file inside.

## Config

An config file should be added to the `/config` directory with the following options:

Option   | Description
---------|-
`dist`   | The output file for the CSS Custom Properties file.
`delete` | This will prevent specific JSON object keys from being exported into properties
`...`    | Individual tokens can be added after these options or they can be imported from the local **./config/tokens.js** file used by the [`tokens` command](https://github.com/CityOfNewYork/patterns-cli#tokens).

**Config Sample**

```JavaScript
const resolve = require(`${process.env.PWD}/node_modules/@nycopportunity/pttrn/bin/util/resolve`);
const tokens = resolve('config/tokens', true, false); // The resolve utility prevents the tokens file from being cached

module.exports = {
  'dist': 'dist/css/tokens.css',
  'delete': ['dist', 'output', 'prefix'],
  ...tokens
};
```
