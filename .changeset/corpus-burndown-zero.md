---
"@rsvelte/compiler": patch
---

Corpus output-parity fixes: real-world corpus known failures **42 → 0**. Every
one of the 6,409 `.svelte` / `.svelte.(js|ts)` corpus sources now compiles to
output that is AST/byte-identical to the official Svelte compiler for both CSR
and SSR (`compat/corpus/known-failures.json` is empty). Each fix is an
upstream-aligned codegen change verified against the full CSR/SSR corpus and the
byte-exact runtime/ssr/compiler_fixtures/validator/compiler_errors/print/css
suites with zero regressions:

- **Evaluation / constant-folding**: rune-call (`$state`/`$state.raw`/`$derived`)
  and chained declaration-tag initial-value folding; `ConditionalExpression`
  branch-pruning when the test folds to a known constant (textContent
  optimisation); RegExp / NaN / ±Infinity literal folds; and the upstream
  memoize-**then**-evaluate ordering so a `has_call` chunk is never folded
  (`{duration ? format(duration) : '…'}` stays reactive while `{a / b}` of two
  non-updated `$state` vars folds to a static literal).
- **store-vs-rune detection** (locally-declared non-rune names no longer flip
  runes mode; `$state()` store-getter call lowering; `$inspect` removal in
  `.svelte.js` module scripts).
- **`$derived`-returning-function currying** (`yScale()(tick)`) on the server,
  via a comment-agnostic member-declaration discriminator.
- **Server class-member parsing** (multi-line constructor params + field
  initialisers), public `$state` class fields lowered to `#private` + get/set
  accessors, `$state.raw` no-proxy `$.set`, and a parser `find_matching_bracket`
  fix for template literals containing regex backticks.
- **Comment-aware instance-script prop lowering**, legacy `$:` topological order
  via template-literal dependency extraction, nested-snippet hoisting + render-tag
  lexical scope resolution, server slot-forwarding + nested snippets, await-pending
  block scope, each-block dependency collection no longer descending into nested
  function bodies, SSR `{@const}` whitespace preservation, and assorted targeted
  codegen fixes (bare-derived prop arg, `return;`, single-statement `while` body,
  destructure assignment IIFE, rest-eachblock bind LHS).
- **Error parity**: a `<svelte:element>` carrying a `let:` directive now fails to
  compile with `Not implemented: LetDirective`, matching the official compiler
  (previously rsvelte compiled it).
