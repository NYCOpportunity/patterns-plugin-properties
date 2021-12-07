# Patterns CLI CSS Properties Plugin

A plugin command script for the [Patterns CLI](https://github.com/nycopportunity/patterns-cli) that will compile an array of JSON objects containing design tokens into [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) using the [css-vars-from-json](https://github.com/TimoBechtel/css-vars-from-json) package.

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

A config file named **properties.js** should be added to the `/config` directory that exports an array of objects with CSS Custom property settings. Each object should include the the following options:

Option       | Type     | Description
-------------|----------|-
`dist`       | *String* | The output file for the CSS Custom Properties file.
`ruleset`    | *String* | The rule-set properties will be attached to. Defaults to [`:root`](https://developer.mozilla.org/en-US/docs/Web/CSS/:root). May include multiple classes such as `:root, .dark`. This can be used to narrow the limit the scope of CSS Custom Properties.
`properties` | *Object* | The CSS Custom properties object. Individual tokens can be added or they can be imported from the local **./config/tokens.js** file used by the [`tokens` command](https://github.com/CityOfNewYork/patterns-cli#tokens).

**Config Sample**

```JavaScript
const resolve = require(`${process.env.PWD}/node_modules/@nycopportunity/pttrn/bin/util/resolve`);
const tokens = resolve('config/tokens', true, false); // The resolve utility prevents the tokens file from being cached

let light = tokens['color-modes']['light'];
let dark = tokens['color-modes']['default'];

module.exports = [
  {
    'dist': 'dist/styles/tokens.css',
    'properties': {
      ...tokens
    }
  },
  {
    'dist': 'dist/styles/tokens-default.css',
    'ruleset': ':root, .light',
    'properties': {
      ...dark
    }
  },
  {
    'dist': 'dist/styles/tokens-dark.css',
    'ruleset': '.dark',
    'properties': {
      ...light
    }
  }
];
```
