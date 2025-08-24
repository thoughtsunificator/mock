import mock from "./mock.js"
import ava from "ava"

class Parent {
	baz(a, b) {
		return "baz123" + a + b
	}

	get qux() {
		return "qux"
	}

}

class Test extends Parent {
	constructor() {
		super()
		this.foo = "foo"
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
	test.is(obj.foo2, "foo")
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
	const mockMethod = mock(obj, "baz")
	test.is(obj.baz.mock, mockMethod)
	test.is(obj.baz.mock.callCount, 0)
	test.is(mockMethod.callCount, 0)
	test.is(mockMethod.called, false)
	test.is(obj.baz("foo", "bar"), "baz123foobar")
	test.is(obj.baz.mock.callCount, 1)
	test.is(mockMethod.callCount, 1)
	test.is(mockMethod.called, true)
	test.is(obj.baz("foo2", "bar2"), "baz123foo2bar2")
	test.is(mockMethod.callCount, 2)
	test.is(mockMethod.called, true)
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
	test.is(obj.baz(),"foo")
	mock(obj, "baz",  null)
	test.is(obj.baz(), null)
})

ava("mock calls", (test) => {
	const { obj } = test.context
	const mockMethod = mock(obj, "baz")
	test.is(mockMethod.calls.length, 0)
	obj.baz("foo", "bar")
	test.is(mockMethod.calls.length, 1)
	test.deepEqual([...mockMethod.calls[0].arguments], ["foo", "bar"])
	test.is(mockMethod.calls[0].returnValue, "baz123foobar")
	test.deepEqual(mockMethod.calls[0].this, obj)
	obj.baz("foo", "bar2")
	test.is(mockMethod.calls.length, 2)
	test.deepEqual([...mockMethod.calls[1].arguments], ["foo", "bar2"])
	const mockMethod2 = mock(obj, "baz", "abc")
	test.is(mockMethod2.calls.length, 0)
	obj.baz("foo", "bar")
	test.is(mockMethod2.calls.length, 1)
	test.deepEqual([...mockMethod2.calls[0].arguments], ["foo", "bar"])
	test.deepEqual(mockMethod2.calls[0].returnValue, "abc")
	test.deepEqual(mockMethod2.calls[0].this, obj)
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
	const mockMethod = mock(obj, "recursive")
	obj.recursive(true)
	test.is(mockMethod.calls.length, 2)
	test.deepEqual([...mockMethod.calls[0].arguments], [true])
	test.deepEqual([...mockMethod.calls[1].arguments], [])
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
	const mockMethod = mock(obj, "baz", "123")
	const mockMethod2 = mock(obj, "baz", "1234")
	test.is(obj.baz(), "1234")
	test.is(mockMethod.callCount, 0)
	test.is(mockMethod2.callCount, 1)
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
