# mock

mock module

## Installing

``npm install @thoughtsunificator/mock --save-dev``

## How to use

```javascript
import mock from "@thoughtsunificator/mock"
// ...
// Mock a a property
const mockProperty = mock(obj, "bar")
assert.strictEqual(obj.bar, "bar")
assert.strictEqual(mockProperty.callCount, 1)
assert.strictEqual(mockProperty.called, true)
// Mock a method
const mockMethod = mock(obj, "baz")
assert.strictEqual(obj.baz("foo", "bar"), "baz123foobar")
assert.strictEqual(obj.baz.mock.callCount, 1)
assert.strictEqual(mockMethod.callCount, 1)
assert.strictEqual(mockMethod.called, true)
```
