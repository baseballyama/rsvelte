# Formatter-parity corpus: remaining work (burn-down playbook)

> **Status 2026-06-22 (unified corpus incl. bits-ui/flowbite/melt/shadcn,
> ~9,715 components, oxfmt 0.54.0): 295 → 1 known failure (Linux/CI),
> 0 regressions, 22 documented exclusions**
> (`compat/corpus/fmt-oracle-excluded.json` + `docs/fmt-oracle-bugs.md`).
>
> `code-viewer.svelte` (deeply-nested `<span>` highlighting inside `<pre><code>`)
> is now FIXED (validated green on Linux CI) via the `<pre>` verbatim re-indent
> subsystem. The **1 remaining** is:
>
> | id | missing mechanism |
> |---|---|
> | `shadcn-svelte/.../theme-customizer-code.svelte` (line 79) | a self-closing component WITH attributes (`<ColorIndicator color={value} />`) that OVERFLOWS inside `<pre>` must stay attribute-wrapped. The Linux oxfmt oracle correctly keeps it wrapped; **macOS oxfmt buggily collapses it** — so the case is observable ONLY on Linux CI (local macOS `fmt-verify` reports it green). rsvelte currently over-collapses it. |
>
> **Findings (read before retrying):**
> 1. **Cross-platform oracle:** macOS and Linux oxfmt disagree on this file
>    (macOS collapses the component, Linux wraps it). Linux is authoritative;
>    iterate via `gh workflow run corpus-compat.yml` + the Formatter-parity job
>    log, NOT local `fmt-verify`.
> 2. A bespoke string post-pass (`fix_pre_collapsed_components`, re-wrapping
>    source-wrapped components) produced the correct WRAPPED output on macOS but
>    **inline on Linux — i.e. it was platform-non-deterministic** (hash-seed /
>    iteration-order dependence somewhere in the `<pre>` path). REVERTED. Do not
>    re-attempt a string post-pass here.
> 3. The clean fix is the faithful Doc-IR `isPreTagContent`/`printPre` printer
>    (text via `literalline`, elements via `element_doc`/`build_self_closing_component_doc`),
>    replacing `reformat_pre_inner`'s string re-indent — a `markup.rs`/`doc.rs`
>    printing-layer change with real regression risk to the 44+ passing `<pre>`
>    files. Dedicated, benchmark-gated, Linux-CI-driven effort.
>
> The historical narrative below is retained.

---

The formatter-parity track (`scripts/compat-corpus/fmt.mjs` + `fmt-verify.mjs`,
wired into the `Formatter parity` CI job) formats every `.svelte` _component_ in
the corpus — sveltejs/svelte + svelte.dev, real files plus ```svelte markdown
blocks — with both **rsvelte-fmt** and the **oxfmt(`svelte: true`) oracle**
(prettier-plugin-svelte for the Svelte structure + oxc for embedded JS/CSS, which
is rsvelte-fmt's exact layering), and requires **byte-identical** output. The
ratchet (`compat/corpus/fmt-known-failures.json`) may only shrink.

Status as of 2026-06-15 (branch `feat/corpus-fmt-parity`, Svelte 5.56.2,
svelte.dev@`49ee73732aef`, oxfmt 0.53.0):

| metric                                                   | count                        |
| -------------------------------------------------------- | ---------------------------- |
| components in the parity set (oracle-included, CI/Linux) | 6,059                        |
| byte-identical to the oracle (macOS local)               | 6,004                        |
| **known failures (local, macOS)**                        | **55** (from an initial 431) |

**Burn-down 431 → 55 (376 fixed, 0 regressions at every step).** The CI/Linux
baseline (`fmt-known-failures.json`) additionally carries ~13 loose
declaration-tag entries macOS `oxfmt` skips — see the cross-platform note in
`scripts/compat-corpus/README.md`; shrink the baseline only from a CI run.

### Important: a large share of the residual is _oracle bugs_, not rsvelte bugs

The hard byte gate compares against `oxfmt(svelte:true)` =
prettier-plugin-svelte. On the deep long tail, that oracle is frequently **wrong**
— it emits output that corrupts the source — while rsvelte is correct. We must
**not** "fix" rsvelte to reproduce broken output. These cases are **permanently
excluded** via `compat/corpus/fmt-oracle-excluded.json` and no longer count
as failures in the gate. See [`docs/fmt-oracle-bugs.md`](fmt-oracle-bugs.md)
for the full upstream-bug writeup (minimal repros + oracle defect descriptions)
and the invalid-input / migrate exclusion rationale.

Confirmed oracle-bug classes in the residual (rsvelte is correct):

- **Nested-rest destructuring → `...undefined`.** `{#each a as [x, y, ...[z, ...{n}]]}`
  is mangled by oxfmt to `{#each a as [x, y, ...undefined]}` — silently dropping
  `z`/`n`. (`each-block-destructured-array-nested-rest`,
  `await-then-destruct-array-nested-rest`, `rest-eachblock-binding-nested-rest`.)
- **`{@const x = (h = 0)}` → `{@const x = (h = 0}`** — oxfmt drops the closing
  paren, producing invalid Svelte. (`block-expression-assign`.)
- **`<textarea>` whitespace** — oxfmt collapses whitespace-significant `<textarea>`
  content (`\n  A\n  B\n` → `A B`) with inconsistent per-case rules.
  (`textarea-content`, `textarea-value-children`.)
- **CSS selector-list indentation mixes tabs and spaces** — `  .foo,` then
  `\t.bar` in one selector list. (`comment-html`, `comments-after-last-selector`,
  `css-pseudo-classes`.)
- **Malformed-tag handling** — a `<script>`/`<style>` with whitespace inside the
  close tag loses its body. (`whitespace-after-script-tag`,
  `whitespace-after-style-tag`, and several adversarial `parser-legacy` inputs.)

All the above are now **excluded** from the gate (not counted as rsvelte failures).

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

## Remaining 78 fixable (local, after 16 oracle-excluded), by class

After excluding the 16 oracle-bug / invalid-input / migrate ids (see
`fmt-oracle-excluded.json` and `docs/fmt-oracle-bugs.md`), the following fixable
clusters remain. The prior "Remaining 55" count was based on the
`feat/corpus-fmt-parity` branch; the current worktree (`feat/fmt-corpus-100`,
sourced from the ecosystem-corpus merge) has 94 total failures (78 after
exclusions).

- **~55 — deep prettier HTML-layout quirks (inline-element / open-tag
  line-wrapping / fill).** The dominant cluster. Includes all 46 ecosystem
  failures (bits-ui, flowbite-svelte, shadcn-svelte, melt-ui) and many svelte
  fixture failures. Root causes:
  - Long open-tag wrapping: when a `<span>` / `<button>` + its attributes exceed
    the print width, prettier wraps at the `>` and inserts a newline before
    child content — rsvelte keeps it inline. (Most flowbite/shadcn diffs.)
  - Sibling inline-element consolidation: two `<button>` siblings on one line
    that together overflow get wrapped by prettier but not rsvelte.
    (`formatting/input.svelte`, `general-siblings-combinator-nested-slots-flattened`.)
  - Mixed-content text-node splitting: text adjacent to inline elements is
    split differently (e.g. `">span text</span> more text"` wraps differently).
    (`flowbite-svelte/Toc.svelte`, `reactive-import-statement`.)
  - Call-argument wrapping inside attribute values (e.g. `class="{fn({status})}"`
    vs multi-line).
    These require the full prettier `fill`/`group` child-layout port (see
    `docs/fmt-layout-port-plan.md`).

- **~8 — comment continuation indenting inside element openers.** A block
  comment whose interior lines preserve original tab indentation when rsvelte
  adds spaces-based indent, producing space+tab mixed lines.
  (`comment-in-tag/input.svelte`, `javascript-comments/input.svelte`,
  `comment-before-function-binding/input.svelte`.)

- **~5 — niche real bugs (fixable, low yield).**
  - `bind:value={/** c */ (g, s)}` — leading comment inside function-binding
    parens is dropped and parens are lost; oracle keeps both. (1 entry.)
  - `<keygen>` not in void-element list — emitted as `<keygen>` (not self-closed).
    (`void-tags`, 1 entry.)
  - Numeric string object key stripping: `{ '1': 'one' }` → `{ 1: "one" }`
    (quoted string key `'1'` loses its quotes). (`component-slot-let-missing-prop`.)
  - Implicitly-closed HTML tags (`<li>` / `<p>`) — rsvelte preserves
    unclosed tags verbatim rather than inserting the implied closing tag.
    (`implicitly-closed-li`, `implicitly-closed-by-parent`,
    `implicitly-closed-by-sibling`, `binding-this-multiple`, `autoclosed-tags`.)
  - `{declaration-tag}` expressions in `<p>` bodies stay on one line instead of
    breaking one-per-line. (`declaration-tag-division/input.svelte`.)

- **~5 — SVG / XHTML formatting.**
  - `<svg><text></text></svg>` closing-tag placement differs.
    (`svg-tspan-preserve-space`.)
  - XHTML `autoclosed-tags` / `void-tags` — auto-closed void elements like
    `<li>`, `<option>`, `<dt>` are not inserted with closing tags.
  - `<svg class={count}> </svg>` space inside empty SVG element preserved vs
    removed. (`svg-element-attribute-serialize`.)
  - `<p dir="rtl">text</p>.` trailing punctuation broken to new line.
    (`element-dir-attribute-sibling`.)

- **~2 — `attribute-unquoted` / `unquoted-attribute` roundtrip.** Unquoted
  attribute values (`<a href=/>`) are kept as unquoted by rsvelte but oracle
  adds quotes. (`attribute-unquoted/input.svelte`.)

- **~2 — `animation-each-with-whitespace` / block one-liner compaction.** The
  oracle expands `{#each [] as n (n)} <div animate:flip></div> {/each}` to
  multi-line; rsvelte keeps it on one line.

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
