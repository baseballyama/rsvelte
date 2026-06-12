---
"@rsvelte/compiler": patch
---

Corpus output-parity fixes (known failures 125 → 42, on top of the 262 → 125
wave). Faithful upstream-aligned codegen fixes, each verified against the full
CSR/SSR corpus and the byte-exact runtime/ssr/compiler_fixtures/css suites with
zero regressions:

- decode `\u`/`\x` escapes when folding a known-const string to its cooked
  value (client + server) and re-escape bidi-control/format characters in
  server string literals;
- `should_proxy` resolves an Identifier through its binding's initial node type;
  nested `:global { … }` blocks and `:has(> [open])` leading combinators scope
  correctly; SSR multi-part style-directive values; `<title>` hoisting; spread
  element reactivity; `<option>` `?? ""` elide for a shadowed each-index;
- server compound-assignment recompaction (`$.set(s, s + 1)` → `s += 1`);
  `var`-declared exported props keep their `var` keyword (client + server);
  `this.#field = …` LHS now parses to a `MemberExpression` (sets `needs_context`)
  and public class-field backing names are deconflicted against existing private
  members (`deps` → `#_deps`);
- `$.store_unsub` wrap on a destructuring reactive assignment; SSR
  trailing-whitespace trim before a hoisted `{@const}`/`{const …}`/`{#snippet}`;
  `$$index` numbering recurses into `<svelte:fragment>`; `<svelte:component>`
  `let:x={y}` slot-prop rename preserved; member-assignment properties are no
  longer recorded as reactive declared vars (reactive-statement ordering).

Remaining failures are tracked in `docs/corpus-remaining-work.md`; the dominant
cluster requires the Phase-3 AST → printer refactor
(`docs/phase3-ast-refactor-plan.md`).
