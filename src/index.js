import inherited from './inherited'

const resetSheetOptions = {
  meta: 'jss-isolate',
  // Lets make it always the first one in sheets for testing
  // and specificity.
  index: -Infinity,
  link: true
}

const getStyle = (option = 'inherited') => {
  switch (option) {
    case 'inherited':
      return inherited
    default:
      // If option is an object, merge it with the `inherited` props.
      return {...inherited, ...option}
  }
}

const ignoreParents = {
  keyframes: true,
  conditional: true
}

const shouldIsolate = (rule, sheet, options) => {
  const {parent} = rule.options

  if (parent && ignoreParents[parent.type]) {
    return false
  }

  let isolate = options.isolate == null ? true : options.isolate
  if (sheet.options.isolate != null) isolate = sheet.options.isolate
  if (rule.style.isolate != null) {
    isolate = rule.style.isolate
    delete rule.style.isolate
  }

  // Option `isolate` may be for e.g. `{isolate: 'root'}`.
  // In this case it must match the rule name in order to isolate it.
  if (typeof isolate === 'string') {
    return isolate === rule.key
  }

  return isolate
}

/**
 * Performance optimized debounce without using setTimeout.
 * Returns a function which:
 * - will execute the passed fn not more than once per delay
 * - will not execute the passed fn if last try was within delay
 */
const createDebounced = (fn, delay = 3) => {
  let time = Date.now()
  return () => {
    const now = Date.now()
    if (now - time < delay) return false
    time = now
    fn()
    return true
  }
}

export default function jssIsolate(options = {}) {
  let setSelectorDone = false
  const selectors = []
  let resetSheet
  let resetRule

  const setSelector = () => {
    resetRule.selector = selectors.join(',\n')
  }

  const setSelectorDebounced = createDebounced(setSelector)

  function onProcessRule(rule, sheet) {
    if (
      !sheet ||
      sheet === resetSheet ||
      rule.type !== 'style'
    ) return

    if (!shouldIsolate(rule, sheet, options)) return

    // Create a reset Style Sheet once and use it for all rules.
    if (!resetRule) {
      resetSheet = rule.options.jss.createStyleSheet(null, resetSheetOptions)
      resetRule = resetSheet.addRule('reset', getStyle(options.reset))
      resetSheet.attach()
    }

    // Add reset rule class name to the classes map of users Style Sheet.
    const {selector} = rule
    if (selectors.indexOf(selector) === -1) {
      selectors.push(selector)
      setSelectorDone = setSelectorDebounced()
    }
  }

  // We make sure selector is set, because `debaunceMaybe` will not execute
  // the fn if called within delay.
  function onProcessSheet() {
    if (!setSelectorDone && selectors.length) setSelector()
  }

  return {
    onProcessRule,
    onProcessSheet
  }
}
