# fmt-oracle-excluded.json — why each id is excluded

Justification for every id permanently excluded from the formatter-parity gate
(`fmt-oracle-excluded.json`). Excluded ids are removed from the comparison set
entirely (neither matched nor failed). Each entry carries a `"class"`
(`oracle-bug` | `invalid-input` | `migrate` | `engine-divergence`) and a
`"reason"`; this file records the class-level rationale.

`fmt-verify.mjs` warns if an excluded id is no longer in the parity set (can be
deleted) and notices if an excluded id now matches byte-for-byte (the oracle bug
was fixed upstream, or rsvelte was wrongly changed to reproduce it — avoid the
latter).

## oracle-bug — the `oxfmt(svelte:true)` oracle output is itself wrong/corrupt

Matching the oracle would require rsvelte to emit broken output. rsvelte-fmt is
correct; file upstream at `oxformatter/oxfmt` or `prettier/prettier-plugin-svelte`.

- **Nested-rest destructuring dropped → `...undefined`.** `{#each a as [x, y, ...[z, ...{n}]]}`
  is mangled to `[x, y, ...undefined]`, silently erasing `z`/`n`/`length` (source
  corruption). — `each-block-destructured-array-nested-rest`,
  `await-then-destruct-array-nested-rest`.
- **`{@const x = (h = 0)}` closing paren dropped** → `{@const x = (h = 0}`, invalid
  Svelte. — `block-expression-assign`.
- **`<textarea>` whitespace collapse.** Whitespace-significant body (`\n  A\n  B\n`)
  collapsed to `A B`, with inconsistent per-case rules. — `textarea-content`,
  `textarea-end-tag` (adversarial split close-tags).
- **CSS selector-list indentation mixes tabs and spaces.** Inline comments cause
  raw tab characters to leak into continuation lines while the body uses 2 spaces
  (non-idempotent). — `comment-html`, `comments-after-last-selector`,
  `css-pseudo-classes` (`:is()` inner selectors tab-indented).
- **Malformed `</script  >` / `</style  >` close tag loses body.** Whitespace
  before `>` makes prettier-plugin-svelte treat the block as empty and discard its
  content. — `whitespace-after-script-tag`, `whitespace-after-style-tag`.
- **`--svelte` CSS path defects.** Double-spaces an empty custom-property value
  (`css-vars`); emits a single space before `{` after an escaped-unicode selector
  (`unicode-identifier`); wraps a deeply-nested `calc(...)` differently
  (`svelte.dev .../docs/[topic]/[...path]/+layout.svelte`).
- **Cross-platform non-determinism.** oxfmt produces different output on macOS vs
  Linux for the same input (an overflowing self-closing component inside `<pre>` is
  collapsed on macOS, attribute-wrapped on Linux), so byte-parity is undefined. —
  `shadcn-svelte .../theme-customizer-code.svelte`.

## invalid-input — the input is invalid and rsvelte correctly rejects it

- **Snippet optional param with initializer** — `{#snippet c5(c?: number = 5)}` is
  illegal TypeScript (TS1015: a parameter cannot have both `?` and `= …`); oxc
  correctly rejects. — `snippet-typescript`.
- **Snippet rest parameter** — snippets do not support rest params
  (`snippet_invalid_rest_parameter`); rsvelte-fmt correctly rejects. —
  `snippet-rest-args`.
- **Genuinely-invalid Svelte-specific CSS** — a parser-modern edge `<style>` block
  with invalid `:nth` syntax. — `css-nth-syntax`.

## migrate — Svelte 4→5 migrator output (out of scope per AGENTS.md)

Svelte-4 syntax (legacy `let:` directives, `slot=` attributes) that rsvelte's
Svelte-5 compiler formats differently. — `migrate/samples/slot-non-identifier/output.svelte`,
`migrate/samples/slot-usages/output.svelte`.

## engine-divergence — oxc vs prettier JS layout, both valid

Not oracle bugs and not rsvelte bugs: rsvelte formats embedded JS with the
`oxc_formatter` crate (a deliberate design choice for the 100x-perf / oxc
integration goals), which makes different-but-valid line-break choices than the
oracle's prettier-based JS printer. Reproducing them would mean abandoning oxc or
fragile prettier-mimicking string surgery (forbidden). The long-term fix is
aligning `oxc_formatter`'s break heuristics with prettier upstream.

- Ternary-condition break granularity in a long `class=` (`flowbite TimelineColor`).
- IIFE arrow parameter-list vs call-argument break point (`flowbite GitHubSourceList`).
- Template-literal `${}` substitution indentation inside `<script>` (`flowbite range/+page`).
- Member-chain-only vs `&&`/call-args break priority in an `{#if}` header
  (`flowbite forms/tags/Tags`).
