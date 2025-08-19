# mock

mock library 

## Installing

``npm install @thoughtsunificator/mock --save-dev``

### API

When calling the [mock method](#mock-method) on any Object, the Object will have a `mock propery` set to a [Mock](#Mock) Object, the same Object is returned by the method.

#### mock method 

```function(target, propertyName, returnValue): Mock``` 

#### Mock

| name | type | comment
| ---- | ------ | ---- |
| called | boolean | Whether the mock was called
| callCount | Number | The number of times the mock was called
| calls | MockCall[] | An array that contains MockCalls

#### MockCall

| name | type | comment
| ---- | ------ | ---- |
| arguments | array | 
| this | * | 

### Examples

#### Mock a property

```javascript
import mock from "@thoughtsunificator/mock"

const mockProperty = mock(obj, "bar")
assert.strictEqual(obj.bar, "bar")
assert.strictEqual(mockProperty.callCount, 1)
assert.strictEqual(obj.bar.mock.called, true)
```

#### Mock a method

```javascript
import mock from "@thoughtsunificator/mock"

const mockMethod = mock(obj, "baz")
assert.strictEqual(obj.baz("foo", "bar"), "baz123foobar")
assert.strictEqual(obj.baz.mock.callCount, 1)
assert.strictEqual(mockMethod.callCount, 1)
assert.strictEqual(mockMethod.called, true)
assert.strictEqual(mockMethod.calls[0].arguments[0], "foo")
assert.strictEqual(mockMethod.calls[0].arguments[1], "bar")
```


