import mock from "./mock.js"
import ava from "ava"

class Parent {
	baz(a, b) {
		return "baz123" + a + b
	}

	quux() {
		this.foo = "quux"
	}

	get abc() {
		return this._abc
	}

	set abc(abc) {
		this._abc = abc + "test"
	}

	get qux() {
		return "qux"
	}

}

class Test extends Parent {
	constructor() {
		super()
		this.foo = null
		this.foo3 = null
	}

	get bar() {
		return "bar"
	}

	get foo2() {
		return this.foo
	}

	recursive(callSelf) {
		if(callSelf) {
			this.recursive()
		}
	}

}

ava.beforeEach((test) => {
	test.context.obj = new Test()
})

ava("mock property", (test) => {
	const { obj } = test.context
	const obj2 = new Test()
	const mockProperty = mock(obj, "bar")
	test.is(obj.bar, "bar")
	mock(obj2, "bar") // reset to 0. when it should not. this is because mock is on the property's prototype
	test.is(obj.bar, "bar")
	test.is(mockProperty.callCount, 2)
	test.is(mockProperty.called, true)
	const mockProperty2 = mock(obj, "qux")
	test.is(mockProperty2.callCount, 0)
	test.is(mockProperty2.called, false)
	test.is(obj.qux, "qux")
	test.is(mockProperty2.callCount, 1)
	test.is(mockProperty2.called, true)
	const mockProperty3 = mock(obj, "foo2")
	test.is(obj.foo2, null)
	test.is(mockProperty3.callCount, 1)
	test.is(mockProperty3.called, true)
	const mockProperty4 = mock(obj, "foo3")
	test.is(mockProperty4.callCount, 0)
	test.is(obj.foo3, null)
	test.is(mockProperty4.callCount, 1)
	test.is(mockProperty4.called, true)
})

ava("mock non-existing property", (test) => {
	const { obj } = test.context
	test.throws(() => {
		mock(obj, "dsadsa")
	}, { message: "Could not find any property descriptor for dsadsa" })
})

ava("mock property returnValue", (test) => {
	const { obj } = test.context
	mock(obj, "bar", "123")
	test.is(obj.bar, "123")
	mock(obj, "bar", null)
	test.is(obj.bar, null)
})

ava("mock method", (test) => {
	const { obj } = test.context
	const obj2 = new Test()
	mock(obj2, "baz")
	test.is(obj.baz.mock, undefined)
	const mockFunction = mock(obj, "baz")
	test.is(obj.baz.mock, mockFunction)
	test.is(obj.baz.mock.callCount, 0)
	test.is(mockFunction.callCount, 0)
	test.is(mockFunction.called, false)
	test.is(obj.baz("foo", "bar"), "baz123foobar")
	test.is(obj.baz.mock.callCount, 1)
	test.is(mockFunction.callCount, 1)
	test.is(mockFunction.called, true)
	test.is(obj.baz("foo2", "bar2"), "baz123foo2bar2")
	test.is(mockFunction.callCount, 2)
	test.is(mockFunction.called, true)
})

ava("mock method returnValue", (test) => {
	const { obj } = test.context
	mock(obj, "baz", "123")
	test.is(obj.baz(), "123")
	mock(obj, "baz",  () => "1234")
	test.is(obj.baz(),"1234")
	mock(obj, "baz",  function() {
		return this.foo2
	})
	test.is(obj.baz(), null)
	mock(obj, "baz",  null)
	test.is(obj.baz(), null)
})

ava("mock calls", (test) => {
	const { obj } = test.context
	const mockFunction = mock(obj, "baz")
	test.is(mockFunction.calls.length, 0)
	obj.baz("foo", "bar")
	test.is(mockFunction.calls.length, 1)
	test.deepEqual([...mockFunction.calls[0].arguments], ["foo", "bar"])
	test.is(mockFunction.calls[0].returnValue, "baz123foobar")
	test.deepEqual(mockFunction.calls[0].this, obj)
	obj.baz("foo", "bar2")
	test.is(mockFunction.calls.length, 2)
	test.deepEqual([...mockFunction.calls[1].arguments], ["foo", "bar2"])
	const mockFunction2 = mock(obj, "baz", "abc")
	test.is(mockFunction2.calls.length, 0)
	obj.baz("foo", "bar")
	test.is(mockFunction2.calls.length, 1)
	test.deepEqual([...mockFunction2.calls[0].arguments], ["foo", "bar"])
	test.deepEqual(mockFunction2.calls[0].returnValue, "abc")
	test.deepEqual(mockFunction2.calls[0].this, obj)
	const test2 = new Test()
	obj.baz(test2)
	test.is(obj.baz.mock.calls[1].arguments[0], test2)
	const url = new URL("http://local")
	obj.baz(url)
	test.is(obj.baz.mock.calls[2].arguments[0], url)
	const date = new Date()
	obj.baz(date)
	test.is(obj.baz.mock.calls[3].arguments[0], date)
})

ava("mock calls recursive", test => {
	const { obj } = test.context
	const mockFunction = mock(obj, "recursive")
	obj.recursive(true)
	test.is(mockFunction.calls.length, 2)
	test.deepEqual([...mockFunction.calls[0].arguments], [true])
	test.deepEqual([...mockFunction.calls[1].arguments], [])
})

ava("redefine property", (test) => {
	const { obj } = test.context
	const mockProperty = mock(obj, "bar", "123")
	const mockProperty2 = mock(obj, "bar", "1234")
	test.is(obj.bar, "1234")
	test.is(mockProperty.callCount, 0)
	test.is(mockProperty2.callCount, 1)
})

ava("redefine method", (test) => {
	const { obj } = test.context
	const mockFunction = mock(obj, "baz", "123")
	const mockFunction2 = mock(obj, "baz", "1234")
	test.is(obj.baz(), "1234")
	test.is(mockFunction.callCount, 0)
	test.is(mockFunction2.callCount, 1)
})

ava("original", (test) => {
	const { obj } = test.context
	const objBaz = obj.baz
	mock(obj, "baz", "123")
	test.is(obj.baz.mock.original, objBaz)
	mock(obj, "baz", "1234")
	test.is(obj.baz.mock.original, objBaz)
})

ava("mock the same method twice and unset its returnValue", (test) => {
	const { obj } = test.context
	mock(obj, "baz", "123")
	mock(obj, "baz")
	test.is(obj.baz(4,5), "baz12345")
	mock(obj, "baz")
	test.is(obj.baz(4,5), "baz12345")
})

ava("throw when target is not a non-null object", test => {
	test.throws(() => {
		mock(null, "foo")
	}, { message: "Expected target parameter to be a non-null object, got null" })
	test.throws(() => {
		mock(Symbol(), "foo")
	}, { message: "Expected target parameter to be a non-null object, got symbol" })
	test.throws(() => {
		mock(() => {}, "foo")
	}, { message: "Expected target parameter to be a non-null object, got function" })
	test.throws(() => {
		mock(true, "foo")
	}, { message: "Expected target parameter to be a non-null object, got boolean" })
	test.throws(() => {
		mock("dsa", "foo")
	}, { message: "Expected target parameter to be a non-null object, got string" })
	test.throws(() => {
		mock(false, "foo")
	}, { message: "Expected target parameter to be a non-null object, got boolean" })
	test.throws(() => {
		mock(1, "foo")
	}, { message: "Expected target parameter to be a non-null object, got number" })
	test.throws(() => {
		mock(undefined, "foo")
	}, { message: "Expected target parameter to be a non-null object, got undefined" })
})

ava("Override mock returnValue of a property accessor value", test => {
	const { obj } = test.context
	mock(obj, "foo3", "foo")
	obj.foo3 = "bar"
	test.is(obj.foo3, "bar")
})

ava("Override mock returnValue of a property accessor setter", test => {
	const { obj } = test.context
	mock(obj, "abc", "foo")
	obj.abc = "bar"
	test.is(obj.abc, "bar")
})

ava("Redefine method passthrough/allow side effects", test => {
	const { obj } = test.context
	test.is(obj.foo, null)
	mock(obj, "quux", () => {
		return true // passthrough/allow side effects
	})
	obj.quux()
	test.is(obj.foo, "quux")
	obj.foo = null
	mock(obj, "quux", () => {
		return false
	})
	obj.quux()
	test.is(obj.foo, null)
})
