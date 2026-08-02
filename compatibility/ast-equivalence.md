# AST equivalence — what the gates compare

rsvelte's output gates used to ask "are these bytes identical?". They now ask
"do these two programs mean the same thing?", which is the question that
actually matters and the one that lets the printer change without a corpus-wide
rewrite.

One implementation answers it: [`crates/rsvelte_ast_equiv`](../crates/rsvelte_ast_equiv/src/lib.rs).
Parse both sides with OXC, print both with one fixed set of codegen options,
compare the printed text, then compare the meaningful comments. Everything
below is the contract that implementation enforces; its unit tests are the
executable version of this document.

## Formatting — collapses

Whitespace, line breaks and indentation. Quote style. Optional semicolons.
Optional parentheses. Numeric literal spelling (`1e3` = `1000` = `0x3e8`).
String escape spelling (`'\x41'` = `'A'`). Property shorthand (`{ a }` =
`{ a: a }`). Trailing commas. Prose comments.

## Meaning — does not collapse

Everything else. The cases worth naming, because they are the ones a printer
change can get wrong while the output still looks right:

- **Grouping parens.** `(a || b) && c` is not `a || (b && c)`; `-(-x)` is not
  `--x`; `new (f())()` constructs a different thing than `new f()()`;
  `(a?.b)()` throws where `a?.b()` short-circuits.
- **Automatic semicolon insertion.** A newline after `return` ends the
  statement.
- **Template literal contents,** including the newlines and spaces inside them
  — those are DOM text.
- **The directive prologue.** `'use strict';` is a directive, `('use strict');`
  is an expression statement.
- **Labels,** `-0` versus `0`, BigInt versus Number, `void 0` versus
  `undefined`, `??` versus `||`, statement and property order.

## Deliberately conservative

Some differences are reported that a human would call equivalent:
`let a = 1, b = 2` versus two declarations, `export { a, b }` versus
`export { b, a }`, `catch {}` versus `catch (e) {}`. Accepting them would mean
teaching the comparator when a rewrite is safe, and every such rule is a place
where a real difference can hide. A false "different" costs one investigation;
a false "equivalent" ships a bug that no gate will ever catch again.

## Comments

Prose comments are formatting and are dropped. A comment that a downstream tool
acts on is not, and is compared as an ordered list:

- everything OXC itself classifies — JSDoc, legal (`@license` / `@preserve`),
  `#__PURE__`, `#__NO_SIDE_EFFECTS__`, webpack / vite / turbopack magic
  comments, coverage ignores;
- plus the toolchain directives OXC does not classify: `svelte-ignore`,
  `@component`, `@ts-*`, `eslint-disable` / `eslint-enable` / `eslint-env`,
  `prettier-ignore`, `# sourceMappingURL=`, `# sourceURL=`.

### Known gap: rsvelte does not preserve them yet

Turning the comment comparison on for the fixture suites fails 14 samples, so
that suite runs with comments ignored (`CommentPolicy::Ignore`) and this is the
list of what has to close before it can stop:

| Direction | Samples |
| --- | --- |
| rsvelte drops a comment the official compiler keeps (server) | `effect-cleanup`, `event-attribute-capture`, `event-attribute-spread-capture`, `inspect-derived`, `action-context`, `action-void-element`, `async-boundary-nav-race`, `increment-and-decrement-strings`, `state-snapshot-uncloneable-ignored`, `directives-with-member-access`, `dynamic-component-in-if-initial-falsy`, `component-binding-onMount` |
| rsvelte drops a comment the official compiler keeps (client) | `binding-width-height-this-timing` |
| rsvelte keeps a comment the official compiler drops (client) | `class-state-constructor` |

The comments involved are the user's own `@type` / `@param` JSDoc,
`@ts-expect-error`, `@ts-ignore` and `svelte-ignore`, carried over from the
`<script>` block. Losing them changes what `svelte-check` and ESLint report on
the generated code, which is why they are in the meaningful set rather than
treated as prose. The corpus gate runs with comments ignored for the same
reason, and for one more: its ratchet only ever shrinks, so a comparison that
adds failures cannot be switched on first.

Annotations are part of that gap too, in the other direction — bits-ui's
`menubar.svelte.ts` compiles to a `/* @__PURE__ */` that the official compiler
drops and rsvelte keeps.

Known limit: the list is ordered but not anchored to a position in the code, so
a meaningful comment that moves without any other change is not detected. The
comments that are position-sensitive in practice (`#__PURE__` and friends) are
also printed inline by codegen under this policy, so they are covered by the
code comparison. `CommentPolicy::Ignore` therefore has to switch that printing
off as well: an annotation left in the printed text is a comment difference
reported as a code difference.

## Parse failure is a failure

A program that does not parse has no canonical form, so there is nothing to
compare. Every comparator in this repo reports that as its own outcome and
stops. None of them falls back to a text or regex comparison — that would
answer a different question while looking like an answer to this one, which is
how a gate silently stops gating. All 3888 outputs of the flowbite-svelte
corpus (1296 files × client / client-dev / server) parse today;
`crates/rsvelte_core/tests/ast_gate_preconditions.rs` keeps the Svelte sample
corpus at that same 100%.

## CSS stays byte-identical

Only JavaScript is compared as an AST. Generated CSS is still compared byte for
byte: it is emitted by a much simpler path, there is no printer rewrite planned
for it, and a CSS canonicalizer would be a second semantic model to maintain
and trust for no benefit.

## Where it is used

| Consumer | What it compares |
| --- | --- |
| `crates/rsvelte_core/tests/common/mod.rs` (`compare_js`) | fixture suites, rsvelte output vs the official compiler's stored output |
| `crates/rsvelte_devtools/src/bin/canonicalize_js.rs` | stdin canonicalizer for the verify-svelte-compat skill |
| `crates/rsvelte_devtools/src/bin/canonicalize_and_compare.rs` | two-file triage tool; layers its own lossy text normalizations on top and therefore ignores comments |
