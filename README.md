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
assert.strictEqual(test.bar.mock, mockProperty)
assert.strictEqual(test.bar.mock.callCount, 0)
assert.strictEqual(test.bar.mock.called, false)
assert.strictEqual(test.bar, "bar")
```
