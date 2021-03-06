# True rules isolation through automatic properties reset

[![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/cssinjs/lobby)

Some of the CSS properties are inheritable. It means that these properties apply to the child nodes from parent nodes. See [this article](
https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_started/Cascading_and_inheritance) for more details.

Due to this reason styles in reusable UI components can be broken if all inheritable properties were not defined explicitly for each element. It can cost You extra efforts to build strong isolation in a component.

This plugin protects styles from inheritance. It automatically creates a reset rule and applies to every user's rule.

Optionally you can also reset non-inherited properties, which would lead to even stronger isolation, as a protection against "greedy" selectors.

Make sure you read [how to use
plugins](https://github.com/cssinjs/jss/blob/master/docs/setup.md#setup-with-plugins)
in general.

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

## Option `isolate`

Option `isolate` can be a `boolean` or a `string`.
The default value is `true`, but you can override it in 3 different layers.
For string value see [Isolation by convention](#isolation-by-convention).

1. Globally for all StyleSheets:

    ```javascript
    jss.use(isolate({
      isolate: false
    }))

    const styles = {
      // Isolated.
      button: {
        isolate: true,
        color: 'red'
      },
      // Not isolated.
      a: {
        color: 'green'
      }
    }
    ```
1. For a specific StyleSheet:

    ```javascript
    const styles = {
      // Isolated.
      root: {
        isolate: true,
        color: 'red'
      },
      // Not isolated.
      a: {
        color: 'green'
      }
    }

    jss.createStyleSheet(styles, {isolate: false})
    ```
1. For a specific Rule:

  ```javascript
  const styles = {
    button: {
      isolate: false,
      color: 'red'
    }
  }
  ```

## Isolation by convention

You can assign any string to the `isolate` option. It will be used to match a rule name to isolate. All other rules will remain unisolated.

```javascript
jss.use(isolate({
  // Will match rule names `root` in all StyleSheets.
  isolate: 'root'
}))

const styles = {
  // Isolated.
  root: {
    color: 'red'
  },
  // Not isolated.
  a: {
    color: 'green'
  }
}
```

## Option `reset`

Default value for `reset` option is `inherited`.

If you want to reset some properties additionally to `inherited` once, you can pass a map of props-values. For e.g. you can set `box-sizing` to be `border-box` by default for every isolated rule without messing around with greedy selectors like this: `* {box-sizing: border-box}`.

```javascript
jss.use(isolate({
  reset: {
    boxSizing: 'border-box'
  }
}))
```

If you want to reset all properties, not just inherited, use `{reset: 'all'}`.

```javascript
jss.use(isolate({
  reset: 'all'
}))
```

If you want to reset all properties and extend the reset with your props:

```javascript
jss.use(isolate({
  reset: ['all', {
    boxSizing: 'border-box'
  }]
}))
```

## Demo

[Simple](http://cssinjs.github.io/examples/plugins/jss-isolate/simple/index.html)

## Reseted properties

Here are all [inherited](./src/inherited.js) and all [non-inherited](./src/nonInherited.js) properties we reset.

## Issues

File a bug against [cssinjs/jss prefixed with \[jss-isolate\]](https://github.com/cssinjs/jss/issues/new?title=[jss-isolate]%20).

## Run tests

```bash
npm i
npm run test
```

## License

MIT
