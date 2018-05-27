# pickpatch

_pickpatch_ is a JavaScript library provides the easy way to update partial of immutable object.
Inspired by [Immer](https://github.com/mweststrate/immer).

* Write updation by pure function and immutable values
* Type inference friendly (TypeScript Support)
* Surprise-less magical API

## Usage

```console
$ npm install --save pickpatch
```

```javascript
import pickpatch from "pickpatch";

const obj = { a: { b: 1 }, c: 2, d: 3 };
const newObj = pickpatch(
  _ => [_.a.b, _.c], // picker defines partial to update
)(
  ([b, c]) => [b * 10, c + 5], // patcher defines new values
)(
  obj, // old object
);
// -> { a: { b: 10 }, c: 7, d: 3 }
```
