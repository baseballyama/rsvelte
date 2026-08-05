---
"@rsvelte/compiler": patch
---

Fold constants that reach a template through a non-literal initializer. A `const`
whose initializer is a call, binary or conditional expression (`const rows =
Math.ceil(sprites / cols)`) is now evaluated at compile time when it is read from
a template chunk, so `style="background-size: {64 * rows}px"` emits the folded
literal instead of a reactive interpolation — matching the official compiler on
client, dev-client and server output.
