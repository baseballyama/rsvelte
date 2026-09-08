# `oxc_parser` cannot parse `(accessor satisfies T)` — the modifier speculation is not backtracked

`oxc_parser` 0.146.0 (`rev 0389c401`) aborts on a **parenthesized** `satisfies` (or `as`)
expression whose left operand is spelled with a TypeScript parameter-modifier keyword. The
program comes back empty, so no diagnostic filter can recover it.

```rust
let allocator = oxc_allocator::Allocator::default();
let ret = oxc_parser::Parser::new(&allocator, "(accessor satisfies string)", SourceType::ts()).parse();
// panicked = true, program.body.len() = 0
//   TS(1090)  'accessor' modifier cannot appear on a parameter.
//   (no code) Expected `,` or `)` but found `string`
```

Without the parentheses it is fine:

```rust
oxc_parser::Parser::new(&allocator, "accessor satisfies string", SourceType::ts()).parse()
// panicked = false, body = [ExpressionStatement(TSSatisfiesExpression)]
```

And with any other identifier the parenthesized form is fine too:

```rust
oxc_parser::Parser::new(&allocator, "(foo satisfies string)", SourceType::ts()).parse()
// panicked = false, body = [ExpressionStatement(...)]
```

## Why it happens

A `(` at expression start is speculatively parsed as an arrow-function parameter list.
`accessor` and `declare` are parameter-modifier keywords there, so the speculation reads
`accessor` as a modifier of a parameter named `satisfies`, raises TS1090, and then fails on the
next token. The speculation is not unwound — the successful reading (`(` opening a
parenthesized expression) is never tried.

## Measured, both directions

| source | oxc 0.146.0 | acorn + `@sveltejs/acorn-typescript` 1.0.13 | `tsc` 7.0.2 |
|---|---|---|---|
| `accessor satisfies string` | OK | OK | OK |
| `(accessor satisfies string)` | **abort, empty program** | OK | OK |
| `(declare satisfies string)` | **abort, empty program** | OK | OK |
| `(foo satisfies string)` | OK | OK | OK |
| `(accessor as string)` | OK | OK | OK |

`acorn-typescript` carries no "cannot appear on a parameter" rule at all
(`grep -c 'on a parameter'` is 0; `'on a type member'` is 1 as a positive control), which is why
it never enters the speculation and why the upstream Svelte compiler accepts every row.

## Impact on rsvelte

rsvelte parses embedded JavaScript and TypeScript with `oxc_parser`, so a Svelte component
carrying this shape in a `<script>`, a `<script module>`, a mustache, an attribute value, an
`{#each}` collection or a `{@const}` is rejected with `js_parse_error` while the official Svelte
compiler compiles it. The unparenthesized spelling was rsvelte's own defect — the expression
probes wrap a tag body as `(<body>\n)`, which supplies the `(` — and is fixed here by retrying
with a one-byte newline in place of the paren. The parenthesized spelling comes from the source
itself and cannot be worked around without re-writing user text.

## Desired behaviour

Backtrack the arrow-parameter speculation when it fails, so `(accessor satisfies string)` is
parsed as a parenthesized expression, matching acorn-typescript and `tsc`.
