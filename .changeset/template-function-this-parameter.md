---
'@rsvelte/compiler': patch
---

`parse()` now keeps a TypeScript `this` parameter in `params` for a function written in a template expression (`onblur={function (this: HTMLInputElement) { … }}`), and keeps the type annotations of a template function expression's or object method's parameters, matching the official parser. Compiled output is unchanged.
