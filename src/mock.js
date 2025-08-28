/**
 * @module mock
 * @example
 *  // ...
 *	const mockFunction = mock(test, "foo")
 *	console.log(test.foo(1,2))
 *	console.log(mockFunction.callCount)
 *	const mockProperty = mock(test, "bar")
 *	console.log(test.bar)
 *	console.log(mockProperty.callCount)
 */

export { mock }
export default mock // Only here for compatibility purposes

class Mock {
	constructor(returnValue) {
		this.returnValue = returnValue
		this.original = null
		this.callCount = 0
	}
	get called() {
		return this.callCount >= 1
	}
}

class MockFunction extends Mock {
	constructor(returnValue) {
		super(returnValue)
		this.calls = []
	}
}

class MockProperty extends Mock {

}

/**
 *
 * @param {object} target
 * @param {string} propertyName - Property or property accessor name
 * @param {*}      returnValue  - If returnValue is a method the return value will be equal to the output of the given method
 * @returns {object}
 */
function mock(target, propertyName, returnValue) {
	let mock
	const targetType = typeof target
	if(target === null || targetType !== "object") {
		throw new Error(`Expected target parameter to be a non-null object, got ${target === null ? null : targetType}`)
	}
	const propertyDescriptors = getPropertyDescriptors(target)
	if(!(propertyName in propertyDescriptors)) {
		throw new Error(`Could not find any property descriptor for ${propertyName}`)
	}
	if(typeof propertyDescriptors[propertyName].value === "function") {
		mock = new MockFunction(returnValue)
		let originalMethod = target[propertyName]
		if(originalMethod.mock) {
			mock.original = originalMethod.mock.original
			originalMethod = mock.original
		} else {
			mock.original = originalMethod
		}
		target[propertyName] = function() {
			const mockCall = { arguments, this: this }
			mock.callCount++
			mock.calls.push(mockCall)
			if(mock.returnValue !== undefined) {
				if(typeof mock.returnValue === "function") {
					mockCall.returnValue = mock.returnValue.apply(this, arguments)
				} else {
					mockCall.returnValue = mock.returnValue
				}
			} else {
				mockCall.returnValue = originalMethod.apply(this, arguments)
			}
			return mockCall.returnValue
		}
		target[propertyName].mock = mock
	} else {
		mock = new MockProperty(returnValue)
		let propertyAccessor
		for(const name in propertyDescriptors) {
			if(name === propertyName) {
				propertyAccessor = propertyDescriptors[name]
			}
		}
		const newPropertyAccessor = {
			enumerable: propertyAccessor.enumerable,
			configurable: true,
			get: function() {
				mock.callCount++
				if(mock.returnValue !== undefined) {
					if(typeof mock.returnValue === "function") {
						if(propertyAccessor.get) {
							return mock.returnValue(propertyAccessor)
						} else {
							return mock.returnValue(propertyAccessor)
						}
					} else {
						return mock.returnValue
					}
				} else {
					if(propertyAccessor.get) {
						return propertyAccessor.get.call(target)
					} else {
						return propertyAccessor.value
					}
				}
			}
		}
		if(typeof propertyAccessor.set === "function")  {
			newPropertyAccessor.set = function(value) {
				propertyAccessor.set.call(this, value)
				mock.returnValue = propertyAccessor.value
			}
		} else if(propertyAccessor.writable) {
			newPropertyAccessor.set = function(value) {
				mock.returnValue = value
			}
		}
		Object.defineProperty(target, propertyName, newPropertyAccessor)
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
