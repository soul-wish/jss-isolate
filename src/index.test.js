import expect from 'expect.js'
import {create, sheets} from 'jss'

import isolate from './index'

describe('jss-isolate', () => {
  let jss

  beforeEach(() => {
    jss = create().use(isolate())
  })

  afterEach(() => {
    sheets.registry.forEach(sheet => sheet.detach())
    sheets.reset()
  })

  describe('reset sheet is not created if there is nothing to reset', () => {
    beforeEach(() => {
      jss.createStyleSheet()
    })

    it('should have no reset sheets in registry', () => {
      expect(sheets.registry.length).to.be(1)
    })
  })

  describe('ignores atRules', () => {
    beforeEach(() => {
      jss.createStyleSheet({
        '@media print': {},
        '@font-face': {
          'font-family': 'MyHelvetica',
          src: 'local("Helvetica")'
        },
        '@keyframes id': {
          from: {top: 0},
          '30%': {top: 30},
          '60%, 70%': {top: 80}
        },
        '@supports ( display: flexbox )': {}
      })
    })

    it('should have no reset sheets in registry', () => {
      expect(sheets.registry.length).to.be(1)
    })
  })

  describe('works with classes', () => {
    let sheet

    beforeEach((done) => {
      sheet = jss.createStyleSheet({
        link: {
          color: 'red',
        },
        linkItem: {
          color: 'blue'
        }
      })
      setTimeout(done)
    })

    it('should add selectors to the reset rule', () => {
      const resetRule = sheets.registry[0].getRule('reset')
      expect(resetRule.selector).to.contain(sheet.classes.linkItem)
      expect(resetRule.selector).to.contain(sheet.classes.link)
    })

    it('should have expected reset props', () => {
      const resetRule = sheets.registry[0].getRule('reset')
      expect(resetRule.prop('border-collapse')).to.be('separate')
      expect(resetRule.prop('font-family')).to.be('serif')
    })
  })

  describe('works in multiple stylesheets', () => {
    let sheet1
    let sheet2

    beforeEach((done) => {
      sheet1 = jss.createStyleSheet({
        link: {
          color: 'red'
        }
      })
      sheet2 = jss.createStyleSheet({
        linkItem: {
          color: 'blue'
        }
      })
      setTimeout(done)
    })

    it('should add selectors to the reset rule', () => {
      const resetRule = sheets.registry[0].getRule('reset')
      expect(resetRule.selector).to.contain(sheet1.classes.link)
      expect(resetRule.selector).to.contain(sheet2.classes.linkItem)
    })
  })

  describe('ignores rules if they are ignored in stylesheet options', () => {
    let sheet1
    let sheet2

    beforeEach((done) => {
      sheet1 = jss.createStyleSheet({
        link: {
          color: 'red'
        }
      })
      sheet2 = jss.createStyleSheet({
        linkItem: {
          color: 'blue'
        }
      }, {isolate: false})
      setTimeout(done)
    })

    it('should not add selectors to the reset rule', () => {
      const resetRule = sheets.registry[0].getRule('reset')
      expect(resetRule.selector).to.contain(sheet1.classes.link)
      expect(resetRule.selector).not.to.contain(sheet2.classes.linkItem)
    })
  })

  describe('ignore rules if property isolate is set to false', () => {
    let sheet

    beforeEach((done) => {
      sheet = jss.createStyleSheet({
        link: {
          color: 'red'
        },
        linkItem: {
          color: 'blue',
          isolate: false
        }
      })
      setTimeout(done)
    })

    it('should add selectors to the reset rule', () => {
      const resetRule = sheets.registry[0].getRule('reset')
      expect(resetRule.selector).to.contain(sheet.classes.link)
      expect(resetRule.selector).not.to.contain(sheet.classes.linkItem)
    })

    it('should have expected reset props', () => {
      expect(sheet.getRule('linkItem').prop('isolate')).to.be(undefined)
    })
  })

  describe('don\'t duplicate selectors', () => {
    let sheet

    beforeEach((done) => {
      sheet = jss.createStyleSheet({
        link: {
          color: 'blue'
        },
        '@media (min-width: 320px)': {
          link: {
            color: 'red'
          }
        }
      })
      setTimeout(done)
    })

    it('should add selectors to the reset rule', () => {
      const resetRule = sheets.registry[0].getRule('reset')
      expect(resetRule.selector).to.be(`.${sheet.classes.link}`)
    })
  })

  describe('option "reset"', () => {
    beforeEach((done) => {
      jss = create().use(isolate({
        reset: {
          width: '1px'
        }
      }))

      jss.createStyleSheet({
        a: {
          color: 'blue'
        }
      })
      setTimeout(done)
    })

    it('should add width prop to the reset rule', () => {
      const resetRule = sheets.registry[0].getRule('reset')
      expect(resetRule.prop('width')).to.be('1px')
    })
  })

  describe('createRule()', () => {
    it('should not create reset sheet', () => {
      jss.createRule({
        color: 'red'
      })

      expect(sheets.registry.length).to.be(0)
    })

    it('should not throw', () => {
      expect(() => {
        jss.createRule({
          color: 'red'
        })
      }).to.not.throwException()
    })
  })
})
