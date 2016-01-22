import chai, {expect} from 'chai'

import {transform, OptionManager} from 'babel-core'
import {tokTypes} from 'babylon'

function cleanAST(ast) {
  Object.keys(ast).forEach((key) => {
    if (key === 'start' || key === 'end' || key === 'loc' || key === 'range') {
      delete ast[key]
    } else if (ast[key]) {
      if (typeof ast[key] === 'object') {
        cleanAST(ast[key])
      }
    }
  })
  return ast
}

chai.use(function(_chai, utils) {
  _chai.Assertion.addMethod('convertTo', function(expectedCode) {
    const sourceCode = utils.flag(this, 'object')
    const received = convert(sourceCode)
    
    // const sourceAST = cleanAST(received.ast.tokens)
    // const expectedAST = cleanAST(parseWithJSX(expectedCode).ast.tokens)
    //
    // const message = `
    //   code
    //
    //     ${sourceCode}
    //
    //   does not convert to
    //
    //     ${expectedCode}
    //
    //   but instead to
    //
    //     ${received.code}
    //
    //   AST differences`
    
    //new _chai.Assertion(sourceAST).to.deep.equal(expectedAST, message)
    
    new _chai.Assertion(received.code).to.equal(expectedCode, `Code “${sourceCode}” converts wrongly`)
  })
})

/** Only parses stuff */
function parseWithJSX(code) {
  return transform(code, { babelrc: false, plugins: ['syntax-jsx'] })
}

/** Converts with this plugin, then re-parses */
function convert(code) {
  const { code: newCode } = transform(code, { babelrc: false, plugins: ['../lib'] })
  return parseWithJSX(newCode)
}

describe('createElement-to-JSX', () => {
  it('should convert 1-argument calls', () => {
    expect('React.createElement("h1")'       ).to.convertTo('<h1 />;')
    expect('React.createElement(Foo)'        ).to.convertTo('<Foo />;')
    expect('React.createElement(Foo.Bar)'    ).to.convertTo('<Foo.Bar />;')
    expect('React.createElement(Foo.Bar.Baz)').to.convertTo('<Foo.Bar.Baz />;')
  })
  
  it('should convert effective 1-argument calls (with null or undefined)', () => {
    expect('React.createElement("h1", null)'      ).to.convertTo('<h1 />;')
    expect('React.createElement("h2", null, null)').to.convertTo('<h2 />;')
    expect('React.createElement("h3", undefined)' ).to.convertTo('<h3 />;')
  })
  
  it('should handle props without children', () => {
    expect('React.createElement("h1", {hi: there})'  ).to.convertTo('<h1 hi={there} />;')
    expect('React.createElement("h2", {"hi": there})').to.convertTo('<h2 hi={there} />;')
    expect('React.createElement("h3", {hi: "there"})').to.convertTo('<h3 hi="there" />;')
  })
  
  it('should handle spread props', () => {
    expect('React.createElement("h1", props)'     ).to.convertTo('<h1 {...props} />;')
    expect('React.createElement("h1", getProps())').to.convertTo('<h1 {...getProps()} />;')
  })
  
  it('should handle mixed props', () => {
    expect('React.createElement("h1", _extends({ hi: "there" }, props))'    ).to.convertTo('<h1 hi="there" {...props} />;')
    expect('React.createElement("h1", _extends({}, props, { hi: "there" }))').to.convertTo('<h1 {...props} hi="there" />;')
  })
  
  it('should handle props and ignore “null”/“undefined” children', () => {
    expect('React.createElement("h1", {hi: there}, null, undefined)').to.convertTo('<h1 hi={there} />;')
  })
  
  it('should ignore “null”/“undefined” props and handle children', () => {
    expect('React.createElement("h1", null, "Header")').to.convertTo('<h1>Header</h1>;')
    expect('React.createElement("h2", null, "Header", "harhar")').to.convertTo('<h2>Header{"harhar"}</h2>;')
    expect('React.createElement("h3", null, React.createElement("i"))').to.convertTo('<h3><i/></h3>;')
    expect('React.createElement("h4", null, "a", React.createElement("b"), "c")').to.convertTo('<h4>a<b/>c</h4>;')
  })
  
  it('should handle props and children', () => {
    //we extensively tested props and children separately, so only sth. basic
    expect('React.createElement("h1", {hi: there}, "Header")').to.convertTo('<h1 hi={there}>Header</h1>;')
  })
  
  it('should ignore intermingled “null”/“undefined” children', () => {
    expect('React.createElement("h1", null, null, "Header", undefined)').to.convertTo('<h1>Header</h1>;')
  })

})
