# mock

domodel is front-end library that organizes the user interface into models (look) and bindings (behavior) it follows the principle of separation of concerns, it also introduce elements of the observable pattern for the communication between the different parts of the user interface.

## Installing

``npm install @thoughtsunificator/mock --save-dev``

## How to use

```javascript
import mock  from "@thoughtsunificator/mock"
// ...
// Mock a a property
const mockProperty = mock(obj, "bar")
assert.strictEqual(obj.bar, "bar")
assert.strictEqual(obj.bar.mock.callCount, 1)
assert.strictEqual(obj.bar.mock.called, true)
// Mock a method
const mockMethod = mock(obj, "baz")
assert.strictEqual(obj.baz("foo", "bar"), "baz123foobar")
assert.strictEqual(obj.baz.mock.callCount, 1)
assert.strictEqual(mockMethod.callCount, 1)
assert.strictEqual(mockMethod.called, true)
```
