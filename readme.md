# True rules isolation through automatic inheritable properties reset

There is a category of css properties named 'inheritable'. It means that these properties apply to the child nodes from parent nodes. See [this article](
https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_started/Cascading_and_inheritance) for more details.

Due to this reason styles in reusable UI components can be broken if all inheritable properties were not defined explicitly for each element. It can cost You extra efforts to build strong isolation in a component.

This plugin protects styles from inheritance. It automatically creates a reset rule and applies it to every user's rule.

Make sure you read [how to use
plugins](https://github.com/cssinjs/jss/blob/master/docs/setup.md#setup-with-plugins)
in general.

[Demo](http://cssinjs.github.io/examples/index.html#plugin-jss-isolate)

[![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/cssinjs/lobby)

## Usage example

```javascript
const styles = {
  // All atRules will be ignored in reset.
  '@font-face': {
    fontFamily: 'MyHelvetica',
    src: 'local("Helvetica")',
  },
  title: {
    fontSize: 20,
    background: '#f00',
  },
  link: {
    fontSize: 12,
  },
  article: {
    isolate: false, // This rule will be ignored in reset.
    margin: '20px 10px 30px'
  }
}
```

## Disable isolation locally.

There are 2 ways to avoid isolation if you want to.

1. For a rule

  ```javascript
  const styles = {
    button: {
      isolate: false
    }
  }
  ```

1. For a Style Sheet

  ```javascript
  jss.createStyleSheet(styles, {isolate: false})
  ```

## Custom reset.

If you want to pass additional properties that need to be resetted.

```javascript
jss.use(isolate({
  reset: {
    boxSizing: 'border-box'
  }
}))
```

## Inheritable properties.

A full list of currently resetted properties is [here](./src/reset.js).

## Issues

File a bug against [cssinjs/jss prefixed with \[jss-isolate\]](https://github.com/cssinjs/jss/issues/new?title=[jss-isolate]%20).

## Run tests

```bash
npm i
npm run test
```

## License

MIT
