/** Visitor factory for babel, converting React.createElement(...) to <jsx ...>...</jsx>
  *
	* What we want to handle here is this CallExpression:
	*
  *     React.createElement(
	*       type: StringLiteral|Identifier|MemberExpression,
	*       [props: ObjectExpression|Expression],
	*       [...children: StringLiteral|Expression]
  *     )
	*
	* Any of those arguments might also be missing (undefined) and/or invalid. */
export default function({types: t}) {
	/** Get a JSXIdentifier or JSXMemberExpression from a Node of known type.
	  * Returns null if a unknown node type, null or undefined is passed. */
	function getJSXName(node) {
		if (node == null) return null
		
		const name = getJSXIdentifier(node)
		if (name !== null) return name
		
		if (!t.isMemberExpression(node)) return null
		const object   = getJSXName(node.object)
		const property = getJSXName(node.property)
		if (object === null || property === null) return null
		return t.jSXMemberExpression(object, property)
	}
	
	/** Get a array of JSX(Spread)Attribute from a props ObjectExpression.
	  * Handles the _extends Expression babel creates from SpreadProperty nodes.
		* Returns null if a validation error occurs. */
	function getJSXProps(node) {
		if (node == null || isNullLikeNode(node)) return []
		
		//TODO: handle _extends Expression in a special way
		if (!t.isObjectExpression(node) && t.isExpression(node))
			return [t.jSXSpreadAttribute(node)]
		
		if (!isPlainObjectExpression(node)) return null
		return node.properties.map(({key, value}) =>
			t.jSXAttribute(getJSXIdentifier(key), getJSXAttributeValue(value)))
	}
	
	function getJSXIdentifier(node) {
		//TODO: JSXNamespacedName
		if (t.isIdentifier(node)) return t.jSXIdentifier(node.name)
		if (t.isStringLiteral(node)) return t.jSXIdentifier(node.value)
		return null
	}
	
	function getJSXAttributeValue(node) {
		if (t.isStringLiteral(node)) return node
		if (t.isJSXElement(node)) return node
		if (t.isExpression(node)) return t.jSXExpressionContainer(node)
		return null
	}
	
	const isReactCreateElement = callee =>
		t.isMemberExpression(callee) &&
		t.isIdentifier(callee.object,   { name: 'React'         }) &&
		t.isIdentifier(callee.property, { name: 'createElement' }) &&
		!callee.computed
	
	const isNullLikeNode = node =>
		t.isNullLiteral(node) ||
		t.isIdentifier(node, { name: 'undefined' })
	
	const isPlainObjectExpression = node =>
		t.isObjectExpression(node) &&
		node.properties.every(m =>
			t.isObjectProperty(m, {computed: false}) &&
			getJSXIdentifier(m.key) !== null &&
			getJSXAttributeValue(m.value) !== null)
	
	return {
		visitor: {
			CallExpression(path) {
				//nameNode and propsNode may be undefined, getJSX* need to handle that
				const {callee, arguments: [nameNode, propsNode, ...childNodes]} = path.node
				
				if (!isReactCreateElement(callee)) return
				
				const name = getJSXName(nameNode)
				if (name === null) return  //name is required
				
				const props = getJSXProps(propsNode)
				if (props === null) return  //no props → empty array, invalid → null
				
				// self-closing tag if no children
				if (childNodes.length === 0 || childNodes.every(isNullLikeNode)) {
					const startTag = t.jSXOpeningElement(name, props, true)
					path.replaceWith(t.jSXElement(startTag, null, [], true))
					return
				}
			}
		}
	}
}
