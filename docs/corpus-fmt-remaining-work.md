# Formatter-parity corpus: remaining work (burn-down playbook)

The formatter-parity track (`scripts/compat-corpus/fmt.mjs` + `fmt-verify.mjs`,
wired into the `Formatter parity` CI job) formats every `.svelte` *component* in
the corpus — sveltejs/svelte + svelte.dev, real files plus ```svelte markdown
blocks — with both **rsvelte-fmt** and the **oxfmt(`svelte: true`) oracle**
(prettier-plugin-svelte for the Svelte structure + oxc for embedded JS/CSS, which
is rsvelte-fmt's exact layering), and requires **byte-identical** output. The
ratchet (`compat/corpus/fmt-known-failures.json`) may only shrink.

Status as of 2026-06-15 (branch `feat/corpus-fmt-parity`, Svelte 5.56.2,
svelte.dev@`49ee73732aef`, oxfmt 0.53.0):

| metric | count |
|---|---|
| components in the parity set (oracle-included, CI/Linux) | 6,059 |
| byte-identical to the oracle (macOS local) | 6,004 |
| **known failures (local, macOS)** | **55** (from an initial 431) |

**Burn-down 431 → 55 (376 fixed, 0 regressions at every step).** The CI/Linux
baseline (`fmt-known-failures.json`) additionally carries ~13 loose
declaration-tag entries macOS `oxfmt` skips — see the cross-platform note in
`scripts/compat-corpus/README.md`; shrink the baseline only from a CI run.

### Important: a large share of the residual is *oracle bugs*, not rsvelte bugs

The hard byte gate compares against `oxfmt(svelte:true)` =
prettier-plugin-svelte. On the deep long tail, that oracle is frequently **wrong**
— it emits output that corrupts the source — while rsvelte is correct. We must
**not** "fix" rsvelte to reproduce broken output. Confirmed oracle-bug classes in
the residual (rsvelte is correct; keep as permanent known-failures):

- **Nested-rest destructuring → `...undefined`.** `{#each a as [x, y, ...[z, ...{n}]]}`
  is mangled by oxfmt to `{#each a as [x, y, ...undefined]}` — silently dropping
  `z`/`n`. (`each-block-destructured-array-nested-rest`,
  `await-then-destruct-array-nested-rest`, `rest-eachblock-binding-nested-rest`.)
- **`{@const x = (h = 0)}` → `{@const x = (h = 0}`** — oxfmt drops the closing
  paren, producing invalid Svelte. (`block-expression-assign`.)
- **`<textarea>` whitespace** — oxfmt collapses whitespace-significant `<textarea>`
  content (`\n  A\n  B\n` → ` A B `) with inconsistent per-case rules.
  (`textarea-content`, `textarea-value-children`.)
- **CSS selector-list indentation mixes tabs and spaces** — `  .foo,` then
  `\t.bar` in one selector list. (`comment-html`, `comments-after-last-selector`,
  `css-pseudo-classes`.)
- **Malformed-tag handling** — a `<script>`/`<style>` with whitespace inside the
  close tag loses its body. (`whitespace-after-script-tag`,
  `whitespace-after-style-tag`, and several adversarial `parser-legacy` inputs.)

These should eventually be *excluded from the parity oracle* rather than counted
as rsvelte gaps (matching them is impossible without degrading output).

**Burn-down 431 → 55. Landed fixes (chronological tail):**

- **Plain `<script>` parsed as TS on JS-parse failure** — oxfmt/prettier parse a
  Svelte `<script>` as TS by default, so a plain `<script>` with `import type` /
  `typeof X<any>` is valid input there. The formatter now tries a JS parse first
  and retries forcing TS only on failure (new `ParseOptions::force_typescript`),
  so valid-JS components can't regress. (`lib.rs`, `parser.rs`,
  `v4-migration-guide`, `content-sveltekit`.)
- **Multi-line prose runs collapse when they fit** — `try_fill_run` returned early
  ("leave as-is") when the flat form fit, preserving the input's line breaks; it
  now emits the flat form so root-level prose written one-word-per-line reflows
  like prettier. (`collapse.rs`, `escaped-text`.)
- **Collapse post-pass re-parse cut 4 → ≤2** (perf; see commit `03255d39`).

Earlier landed fixes:

- **Attribute single-mustache quote stripping** — `attr="{expr}"` → `attr={expr}`
  (then shorthand `{attr}` when the expression is the attribute name). A quoted
  single mustache parses to `AttributeValue::Sequence`; route it through the
  unquoted renderer. (`markup.rs`)
- **`svelteSortOrder`** — reorder top-level sections into the canonical order
  (options → module script → instance script → markup → styles), attaching
  leading comments to the section they precede and normalizing the single blank
  line between top-level units. Canonical files are left untouched; the re-parse
  is skipped (via the already-parsed root) when there is only one top-level unit.
  (`sort_order.rs`, `lib.rs`)
- **Component / block child boundary whitespace** — components (`<Button>`,
  `<Foo.Bar>`, `<svelte:*>`) and block elements drop child boundary whitespace
  (`<Button> hi </Button>` → `<Button>hi</Button>`); inline and unknown custom
  elements keep one edge space. The hug/block-break paths keep the inline
  predicate so a component with a wrapping open tag still hugs. (`collapse.rs`)
- **Mustache-sibling splitting + empty-block blank line** — in a broken fragment,
  whitespace between two mustache siblings becomes a newline (except before an
  inline element); an empty control-flow block body keeps one blank line.
  (`indent.rs`)
- **`<script>` / `<style>` open-tag attribute quoting** (`lang='ts'` →
  `lang="ts"`, `context=module` → `context="module"`). (`script.rs`)
- **`<textarea>` interior indentation**, **`style:name` shorthand**,
  **`<svelte:window/>` self-closing when empty**, **`<!-- prettier-ignore -->`**,
  **`{#await expr}` empty-pending collapse**, **adjacent-markup merge after
  section reorder**, **`{#each … as x (key)}` space before the key**, and
  **`{#snippet}` header wrap width**.

## Remaining 55 (local), by class

- **~12 — oracle bugs (rsvelte is correct).** See the dedicated section above:
  nested-rest → `...undefined`, `{@const}` paren-drop, `<textarea>` whitespace
  collapse, CSS tab/space mixing, malformed-tag body loss. Not fixable without
  degrading rsvelte's (correct) output; should be excluded from the oracle.
- **~6 — `tests/migrate/` (out of scope).** Svelte 4 → 5 migrator fixtures
  (Svelte 4 syntax: legacy slots, `<svelte:self>`, etc.). rsvelte is a Svelte 5
  compiler; per `AGENTS.md` the migrator is intentionally out of scope, so these
  are tracked, not fixed.
- **~8 — rsvelte's parser correctly rejects the input (correct behaviour).** Invalid Svelte 5 that
  prettier-plugin-svelte (a lenient formatter parser) reformats but rsvelte's
  compiler-grade parser rejects by design — e.g. `{@render f.apply(...)}`
  (`render_tag_invalid_call_expression`), snippet rest params, `{@const x: T = …}`
  type-annotated const, snippet optional+initializer params. A formatter that
  refuses invalid input is correct behaviour, not a layout bug.
- **~4 — niche real bugs (fixable, low yield).** A leading comment inside a
  function binding `bind:value={/** c */ (g, s)}` is dropped (the oracle keeps it
  *and* the parens); comment-continuation over-indent inside an element opener;
  empty `{#if}`/`{#key}` one-line bodies (` `) that prettier expands to `\n\n`
  (but `{#await}` collapses — inconsistent oracle); `<keygen>` void-list. Each is
  1–2 entries and fiddly/risky relative to the gain.
- **~25 — deep prettier HTML-layout quirks.** The hard cluster also noted for
  the svelte.dev formatter corpus: inline-element hug/keep-on-one-line vs break
  (`<label><input … /> text</label>` hug choice), long open-tag wrapping with
  child breaking (e.g. sibling `<button onclick={…}>…</button>` pairs that
  overflow), and `<pre>` whitespace edge cases. These need the full prettier
  `fill`/`group` child-layout port (see `docs/fmt-layout-port-plan.md`) and are
  the only substantial *fixable* cluster left.

## How to burn down

```bash
cargo build --release -p rsvelte_fmt
node scripts/compat-corpus/fmt-cluster.mjs                 # rank remaining clusters
node scripts/compat-corpus/fmt-one.mjs <id>                # live oracle vs rsvelte-fmt diff
# fix in crates/rsvelte_formatter/src, then:
node scripts/compat-corpus/fmt.mjs --actual && node scripts/compat-corpus/fmt-verify.mjs
node scripts/compat-corpus/fmt-verify.mjs --update-baseline   # only after "no regressions"
```

Every fix must keep `fmt-verify` at **0 regressions**; mirror
prettier-plugin-svelte's actual behaviour (probe the oracle first) rather than
special-casing a fixture.
