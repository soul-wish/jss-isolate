import reset from './reset'

const debounce = (fn) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args))
  }
}

const setSelector = debounce((rule, selectors) => {
  rule.selector = selectors.join(',\n')
})

export default function jssIsolate(options = {}) {
  let resetSheet = null
  let resetRule
  const selectors = []

  return (rule, sheet) => {
    if (
      rule.type !== 'regular' ||
      !sheet ||
      sheet === resetSheet ||
      !rule.style
    ) return

    const {parent} = rule.options
    if (parent && (parent.type === 'keyframe' || parent.type === 'conditional')) {
      return
    }

    const isolateProp = rule.style.isolate
    const isolateOption = sheet.options.isolate

    if (isolateProp != null) delete rule.style.isolate

    if (
      // Style prop `{isolate: true}` overrides the option.
      (isolateOption === false && isolateProp !== true) ||
      isolateProp === false
    ) {
      return
    }

    // Option `isolate` may be for e.g. `{isolate: 'root'}`.
    // In this case it must match the rule name in order to isolate it.
    if (typeof isolateOption === 'string' && isolateOption !== rule.name) {
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
      const mergedReset = options.reset ? {...reset, ...options.reset} : reset
      resetRule = resetSheet.addRule('reset', mergedReset)
      resetSheet.attach()
    }
    if (selectors.indexOf(rule.selector) === -1) {
      selectors.push(rule.selector)
    }
    setSelector(resetRule, selectors)
  }
}
