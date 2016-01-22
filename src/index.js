// https://github.com/babel/babel/blob/master/doc/ast/spec.md
// https://github.com/babel/babel/tree/master/packages/babel-types

//React.createElement( type: string|ReactClass, [props: object], [children ...] )

export default function({types: t}) {
	function getJSXName(node) {
		switch(node.type) {
			case 'StringLiteral': return t.jSXIdentifier(node.value)
			case 'Identifier':    return t.jSXIdentifier(node.name)
			case 'MemberExpression':
				const object   = getJSXName(node.object)
				const property = getJSXName(node.property)
				if (object === null || property === null) return null
				return t.jSXMemberExpression(object, property)
			default: return null
		}
	}
	
	const isReactCreateElement = callee =>
		t.isMemberExpression(callee) &&
		t.isIdentifier(callee.object,   { name: 'React'         }) &&
		t.isIdentifier(callee.property, { name: 'createElement' }) &&
		!callee.computed
	
	const isNullLike = node =>
		t.isNullLiteral(node) ||
		t.isIdentifier(node, { name: 'undefined' })
	
	return {
		visitor: {
			CallExpression(path) {
				const {callee, arguments: args} = path.node
				
				if (!isReactCreateElement(callee)) return
				
				// validate Argument list
				if (args.length === 0) return
				
				let name = getJSXName(args[0])
				if (name === null) return
				
				if (args.length === 1 || args.slice(1).every(isNullLike)) {
					const startTag = t.jSXOpeningElement(name, [], true)
					path.replaceWith(t.jSXElement(startTag, null, [], true))
					return
				}
			}
		}
	}
}
