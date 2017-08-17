import inherited from './inherited'

const debounce = (fn) => {
  let pending = false
  return (...args) => {
    if (pending) return
    pending = true
    setTimeout(() => {
      fn(...args)
      pending = false
    })
  }
}

const setSelector = debounce((rule, selectors) => {
  rule.selector = selectors.join(',\n')
})

const getReset = (option = 'inherited') => {
  switch (option) {
    case 'inherited':
      return inherited
    default:
      // If option is an object, merge it with the `inherited` props.
      return {...inherited, ...option}
  }
}

export default function jssIsolate(options = {}) {
  const globalIsolate = options.isolate == null ? true : options.isolate
  const selectors = []
  let resetSheet = null
  let resetRule


  function onProcessRule(rule, sheet) {
    if (
      rule.type !== 'style' ||
      !sheet ||
      sheet === resetSheet ||
      !rule.style
    ) return

    const {parent} = rule.options
    if (parent && (parent.type === 'keyframes' || parent.type === 'conditional')) {
      return
    }

    let isolate = globalIsolate
    if (sheet.options.isolate != null) isolate = sheet.options.isolate
    if (rule.style.isolate != null) {
      isolate = rule.style.isolate
      delete rule.style.isolate
    }

    if (isolate === false) return

    // Option `isolate` may be for e.g. `{isolate: 'root'}`.
    // In this case it must match the rule name in order to isolate it.
    if (isolate !== rule.key && typeof isolate === 'string') {
      return
    }

    // Create a separate style sheet once and use it for all rules.
    if (!resetSheet && rule.options.jss) {
      resetSheet = rule.options.jss.createStyleSheet({}, {
        link: true,
        meta: 'jss-isolate',
        // Lets make it always the first one in sheets for testing
        // and specificity.
        index: -Infinity
      })
      resetRule = resetSheet.addRule('reset', getReset(options.reset))
      resetSheet.attach()
    }
    if (selectors.indexOf(rule.selector) === -1) {
      selectors.push(rule.selector)
    }
    setSelector(resetRule, selectors)
  }

  return {onProcessRule}
}
