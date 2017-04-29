# eslint-plugin-curry

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

## Installation

Install [ESLint](https://github.com/eslint/eslint) either locally or globally.
Install eslint-plugin-curry.

With Yarn:

```sh
$ yarn add -D eslint eslint-plugin-curry
```

Or, if you prefer npm:

```sh
$ npm install --save-dev eslint eslint-plugin-curry
```

## Configuration

Add a `plugins` section and specify eslint-plugin-curry as a plugin.

```json
{
  "plugins": [
    "curry"
  ]
}
```

Enable the rules.

## Rules

### arrow-parens

This rule works like vanilla [arrow-parens](http://eslint.org/docs/rules/arrow-parens),
but provides an additional setting for functions that use currying.

```js
/* eslint curry/arrow-parens: [2, "as-needed", { "requireForBlockBody": true, "curry": "never" }] */
// bad
const fn = (x) => x
const fn = x => {}
const fn = (x) => (y) => (z) => {}

// good
const fn = x => x
const fn = (x) => {}
const fn = x => y => z => {}
```

```js
/* eslint curry/arrow-parens: [2, "as-needed", { "curry": "always" }] */
// bad
const fn = (x) => x
const fn = (x) => {}
const fn = x => y => z => {}

// good
const fn = x => x
const fn = x => {}
const fn = (x) => (y) => (z) => {}
```
