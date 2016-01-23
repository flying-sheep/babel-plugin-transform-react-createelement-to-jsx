# babel-plugin-transform-react-createelement-to-jsx [![build status]][travis] [![npm version]][npm]

[build status]: https://travis-ci.org/flying-sheep/babel-plugin-transform-react-createelement-to-jsx.svg?branch=master
[travis]: https://travis-ci.org/flying-sheep/babel-plugin-transform-react-createelement-to-jsx
[npm version]: https://img.shields.io/npm/v/babel-plugin-transform-react-createelement-to-jsx.svg
[npm]: https://www.npmjs.com/package/babel-plugin-transform-react-createelement-to-jsx

Turn `React.createElement` calls back into JSX syntax.

This is useful for

1. Converting projects that started out in the opinion that “we need no stinking compilers”
2. Converting already-compiled JS into something maintainable (E.g. [CJSX] syntax → [coffee-react-transform] → [decaffeinate] → **react-createelement-to-jsx** → [JSX] syntax)

[CJSX]: https://github.com/jsdf/coffee-react#readme
[coffee-react-transform]: https://github.com/jsdf/coffee-react-transform
[decaffeinate]: https://github.com/eventualbuddha/decaffeinate
[JSX]: https://facebook.github.io/react/docs/jsx-in-depth.html

## Installation

```sh
$ npm install babel-plugin-transform-react-createelement-to-jsx
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": [ "transform-react-createelement-to-jsx" ]
}
```

### Via CLI

```sh
$ babel --plugins transform-react-createelement-to-jsx script.js
```

### Via Node API

```js
import babel from 'babel-core'

babel.transform('code', {
  plugins: ['transform-react-createelement-to-jsx'],
})
```

## Development

If you want to help with corner cases, here are helpful resources:

* [Babylon AST spec](https://github.com/babel/babel/blob/master/doc/ast/spec.md) needed to understand the AST we traverse
* [JSX AST spec](https://github.com/facebook/jsx/blob/master/AST.md) extension of the above, needed to understand what we emit
* [babel-types API](https://github.com/babel/babel/tree/master/packages/babel-types) helpful tests and factories for AST nodes
