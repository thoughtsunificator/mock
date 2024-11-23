/**
 * @module test/mock
 * @example
 *  // ...
 *	const mockMethod = mock(test, "foo")
 *	console.log(test.foo(1,2))
 *	console.log(mockMethod.callCount)
 *	const mockProperty = mock(test, "bar")
 *	console.log(test.bar)
 *	console.log(mockProperty.callCount)
 */

 class Mock {
	constructor() {
		this.callCount = 0
	}
	get called() {
		return this.callCount >= 1
	}
}

/**
 *
 * @param {object} target
 * @param {string} propertyName - Property or property accessor name
 * @param {*}      returnValue  - If returnValue is a method the return value will be equal the output of the given method
 * @returns {object}
 */
export default function(target, propertyName, returnValue) {
	const mock = new Mock()
	const propertyDescriptors = getAllPropertyDescriptors(target)
	if(!(propertyName in propertyDescriptors)) {
		throw new Error(`Could not find any property descriptor for ${propertyName}`)
	}
	if(typeof propertyDescriptors[propertyName].value === "function") {
		const originalMethod = target[propertyName]
		originalMethod.__proto__.mock = mock
		mock.calls = []
		target[propertyName] = function() {
			mock.callCount++
			let callReturnValue
			if(returnValue) {
				if(typeof returnValue === "function") {
					callReturnValue = returnValue.call(this, ...arguments)
				} else {
					callReturnValue = returnValue
				}
			} else {
				callReturnValue = originalMethod.call(this, ...arguments)
			}
			mock.calls.push({ arguments, this: this, returnValue: callReturnValue })
			return callReturnValue
		}
	} else {
		let originalValue
		for(const name in propertyDescriptors) {
			if(name === propertyName) {
				const propertyAccessor = propertyDescriptors[name]
				if(propertyAccessor.get) {
					originalValue = propertyAccessor.get.call(target)
				} else {
					originalValue = propertyAccessor.value
				}
			}
		}
		Object.defineProperty(target, propertyName, {
			enumerable: true,
			configurable: true,
			get: function() {
				mock.callCount++
				if(returnValue) {
					if(typeof returnValue === "function") {
						return returnValue()
					} else {
						return returnValue
					}
				} else {
					return originalValue
				}
			}
		})
		/** null-prototype objects do not inherit from Object.prototype */
		if(originalValue !== null) {
			Object.defineProperty(originalValue.__proto__, "mock", {
				configurable: true,
				get: function() {
					mock.callCount--
					return mock
				}
			})
		}
	}
	return mock
}

function getAllPropertyDescriptors(obj) {
	return getPropertyDescriptors(obj)
}

function getPropertyDescriptors(obj) {
	let propertyDescriptors = {}
	const ownPropertyDescriptors = Object.getOwnPropertyDescriptors(obj)
	for(const name in ownPropertyDescriptors) {
		propertyDescriptors[name] = ownPropertyDescriptors[name]
	}
	const parentPrototype = Object.getPrototypeOf(obj)
	if(Object.getPrototypeOf(parentPrototype)) {
		propertyDescriptors = { ...propertyDescriptors, ...getPropertyDescriptors(parentPrototype) }
	}
	return propertyDescriptors
}
