import mock from "./mock.js"
import ava from 'node:test'
import assert from 'node:assert'

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

}

ava.beforeEach((test) => {
	test.obj = new Test()
})

ava("mock property", (test) => {
	const { obj } = test
	const mockProperty = mock(obj, "bar")
	assert.strictEqual(obj.bar.mock, mockProperty)
	assert.strictEqual(obj.bar.mock.callCount, 0)
	assert.strictEqual(obj.bar.mock.called, false)
	assert.strictEqual(obj.bar, "bar")
	assert.strictEqual(obj.bar.mock.callCount, 1)
	assert.strictEqual(obj.bar.mock.called, true)
	assert.strictEqual(obj.bar, "bar")
	assert.strictEqual(obj.bar.mock.callCount, 2)
	assert.strictEqual(mockProperty.callCount, 2)
	assert.strictEqual(mockProperty.called, true)
	const mockProperty2 = mock(obj, "qux")
	assert.strictEqual(obj.qux.mock, mockProperty2)
	assert.strictEqual(mockProperty2.callCount, 0)
	assert.strictEqual(mockProperty2.called, false)
	assert.strictEqual(obj.qux, "qux")
	assert.strictEqual(mockProperty2.callCount, 1)
	assert.strictEqual(mockProperty2.called, true)
	const mockProperty3 = mock(obj, "foo2")
	assert.strictEqual(obj.foo2.mock, mockProperty3)
	assert.strictEqual(obj.foo2, "foo")
	assert.strictEqual(mockProperty3.callCount, 1)
	assert.strictEqual(mockProperty3.called, true)
	const mockProperty4 = mock(obj, "foo3")
	assert.strictEqual(obj.foo3, null)
	assert.strictEqual(mockProperty4.callCount, 1)
	assert.strictEqual(mockProperty4.called, true)
})

ava("mock non-existing property", (test) => {
	const { obj } = test
	assert.throws(() => {
		mock(obj, "dsadsa")
	}, { message: "Could not find any property descriptor for dsadsa" })
})

ava("mock property spec", (test) => {
	const { obj } = test
	mock(obj, "bar", "123")
	assert.strictEqual(obj.bar, "123")
})

ava("mock method", (test) => {
	const { obj } = test
	const mockMethod = mock(obj, "baz")
	assert.strictEqual(obj.baz.mock, mockMethod)
	assert.strictEqual(obj.baz.mock.callCount, 0)
	assert.strictEqual(mockMethod.callCount, 0)
	assert.strictEqual(mockMethod.called, false)
	assert.strictEqual(obj.baz("foo", "bar"), "baz123foobar")
	assert.strictEqual(obj.baz.mock.callCount, 1)
	assert.strictEqual(mockMethod.callCount, 1)
	assert.strictEqual(mockMethod.called, true)
	assert.strictEqual(obj.baz("foo2", "bar2"), "baz123foo2bar2")
	assert.strictEqual(mockMethod.callCount, 2)
	assert.strictEqual(mockMethod.called, true)
})

ava("mock calls", (test) => {
	const { obj } = test
	const mockMethod = mock(obj, "baz")
	assert.strictEqual(mockMethod.calls.length, 0)
	obj.baz("foo", "bar")
	assert.strictEqual(mockMethod.calls.length, 1)
	assert.deepEqual([...mockMethod.calls[0].arguments], ["foo", "bar"])
	assert.deepEqual(mockMethod.calls[0].returnValue, "baz123foobar")
	assert.deepEqual(mockMethod.calls[0].this, obj)
	obj.baz("foo", "bar2")
	assert.strictEqual(mockMethod.calls.length, 2)
	assert.deepEqual([...mockMethod.calls[1].arguments], ["foo", "bar2"])
	const mockMethod2 = mock(obj, "baz", "abc")
	assert.strictEqual(mockMethod2.calls.length, 0)
	obj.baz("foo", "bar")
	assert.strictEqual(mockMethod2.calls.length, 1)
	assert.deepEqual([...mockMethod2.calls[0].arguments], ["foo", "bar"])
	assert.deepEqual(mockMethod2.calls[0].returnValue, "abc")
	assert.deepEqual(mockMethod2.calls[0].this, obj)
})

ava("mock method spec", (test) => {
	const { obj } = test
	mock(obj, "baz", "123")
	assert.strictEqual(obj.baz(), "123")
})

ava("redefine property", (test) => {
	const { obj } = test
	const mockProperty = mock(obj, "bar", "123")
	const mockProperty2 = mock(obj, "bar", "1234")
	assert.strictEqual(obj.bar, "1234")
	assert.strictEqual(mockProperty.callCount, 0)
	assert.strictEqual(mockProperty2.callCount, 1)
})

ava("redefine method", (test) => {
	const { obj } = test
	const mockMethod = mock(obj, "baz", "123")
	const mockMethod2 = mock(obj, "baz", "1234")
	assert.strictEqual(obj.baz(), "1234")
	assert.strictEqual(mockMethod.callCount, 0)
	assert.strictEqual(mockMethod2.callCount, 1)
})
