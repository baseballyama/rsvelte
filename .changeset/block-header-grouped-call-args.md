---
"@rsvelte/fmt": patch
---

fix(fmt): keep the expanded spacing on grouped call arguments in an overflowing block header. When a `{#if}` / `{#each}` / `{#key}` / `{#await}` header line does not fit the print width, prettier still prints it on one line but renders each call from the layout it would otherwise have broken out — `callee( a, b )`, one space inside each delimiter, arguments flat, no trailing comma — whereas rsvelte-fmt kept the hugged `callee({ a })` form. The trigger is the width of the whole header line (indent, opener, expression and the `as …}` suffix), and it applies to every call in the expression at any depth, including inside logical operands, ternary arms, optional chains and `new` expressions. Which calls qualify now mirrors oxc's own grouped-call-argument layout rule, so an empty object argument, a same-shaped penultimate argument, a concisely printable numeric array or an arrow with a bare expression body correctly stay flat.
