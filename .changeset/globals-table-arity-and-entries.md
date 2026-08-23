---
'@rsvelte/compiler': patch
---

Compute every `globals` constant-folding entry, with JS's arity rule

Upstream stores each global as a `[type, fn]` pair and calls `fn(...values)`
when every argument is known, so a missing argument is `undefined` and a
surplus one is ignored. rsvelte's port guarded on an exact argument count and
gave up outside it, left five entries (`Math.f16round`, `Number.parseInt`,
`Number.parseFloat`, `String.fromCharCode`, `String.fromCodePoint`) with a type
marker and no implementation, dropped a NaN operand in `Math.min` / `Math.max`
where Rust's `f64::min` / `f64::max` do, answered `1` for `Math.pow(1, NaN)` as
IEEE `pow` does rather than `NaN` as JS does, and rounded the doubles just below
`0.5` up because `Math.round` was `(n + 0.5).floor()`.

Two shapes stay unfolded on purpose: `String.fromCharCode(0xD800)` is a lone
surrogate, which a Rust `String` cannot hold, and `String.fromCodePoint` on an
invalid code point makes the official compiler throw an unhandled `RangeError`.
