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
 * @param {*}      returnValue  - If returnValue is a method the return value will be equal to the output of the given method
 * @returns {object}
 */
export default function(target, propertyName, returnValue) {
	const mock = new Mock()
	const propertyDescriptors = getPropertyDescriptors(target)
	if(!(propertyName in propertyDescriptors)) {
		throw new Error(`Could not find any property descriptor for ${propertyName}`)
	}
	if(typeof propertyDescriptors[propertyName].value === "function") {
		const originalMethod = target[propertyName]
		mock.calls = []
		target[propertyName] = function() {
			mock.callCount++
			let callReturnValue
			if(returnValue) {
				if(typeof returnValue === "function") {
					callReturnValue = returnValue.apply(this, arguments)
				} else {
					callReturnValue = returnValue
				}
			} else {
				callReturnValue = originalMethod.apply(this, arguments)
			}
			mock.calls.push({ arguments, this: this, returnValue: callReturnValue })
			return callReturnValue
		}
		target[propertyName].mock = mock
	} else {
		let propertyAccessor
		for(const name in propertyDescriptors) {
			if(name === propertyName) {
				propertyAccessor = propertyDescriptors[name]
			}
		}
		Object.defineProperty(target, propertyName, {
			enumerable: propertyAccessor.enumerable,
			configurable: true,
			get: function() {
				mock.callCount++
				if(returnValue) {
					if(typeof returnValue === "function") {
						if(propertyAccessor.get) {
							return returnValue(propertyAccessor.get.call(target))
						} else {
							return returnValue(propertyAccessor.value)
						}
					} else {
						return returnValue
					}
				} else {
					if(propertyAccessor.get) {
						return propertyAccessor.get.call(target)
					} else {
						return propertyAccessor.value
					}
				}
			}
		})
	}
	return mock
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
