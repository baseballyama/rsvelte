---
"@rsvelte/compiler": patch
---

fix(svelte2tsx): keep TS casts on component `bind:this` and on paren-wrapped attribute expressions

Two TSX-parity gaps surfaced by real-world components:

- A component `bind:this={x as T}` dropped the trailing TS postfix — emitting
  `x = $$_inst;` instead of `x = $$_inst as T;`. The element `bind:this` path
  already moved the postfix onto the RHS var; the component path now does the
  same (layerchart playground `bind:this={consolePane as Pane}`).

- An attribute expression whose value is a redundantly-parenthesized cast —
  `on…={((e) => { … }) satisfies Handler<T>}` — lost both the wrapping parens
  and the `satisfies …` tail, because the parser narrows the span to the inner
  arrow and the postfix scan only looked for `as`/`satisfies`/`!` *directly*
  after the span (here the tail starts with `)`). The attribute baker now widens
  the span back to the wrapping `(` and forward past the `) satisfies T` tail
  (layerchart Arc/Arc.base `ontouchmove`).
