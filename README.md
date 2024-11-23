# mock

```javascript
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

const test = new Test()
const mockProperty = mock(test, "bar")
assert.strictEqual(test.bar, "bar")
assert.strictEqual(test.bar.mock.callCount, 1)
assert.strictEqual(test.bar.mock.called, true)
const mockMethod = mock(test, "baz")
assert.strictEqual(test.baz("foo", "bar"), "baz123foobar")
assert.strictEqual(test.baz.mock.callCount, 1)
assert.strictEqual(mockMethod.callCount, 1)
assert.strictEqual(mockMethod.called, true)
```
