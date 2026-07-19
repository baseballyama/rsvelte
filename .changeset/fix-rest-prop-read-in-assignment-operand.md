---
"@rsvelte/compiler": patch
---

fix(transform): keep `rest.x` (not `$$props.x`) when it is an assignment/update operand

Upstream `Identifier.js` skips the runes rest-prop read optimization
(`rest.x` → `$$props.x`) when the member access's grandparent is an
Assignment or Update expression — covering BOTH operands. The client
AST state transform only excluded the direct LHS, so a single-level
`rest.x` used as a RHS was rewritten:

```js
// let { children, ...rest } = $props()
ctx.globalAlpha *= rest.opacity;   // was: *= $$props.opacity
img.crossOrigin = rest.crossOrigin; // was: = $$props.crossOrigin
```

The rewrite is now suppressed for a bare single-level `rest.x` that is a
direct operand of an assignment (either side) or an update expression,
while deeper accesses (`rest.x.y`) still inline as before.
