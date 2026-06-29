# Formatter-parity corpus: remaining work (burn-down playbook)

> **Status 2026-06-29 (unified corpus, 11,478 components, oxfmt 0.56.0,
> svelte 5.56.x): 85 known failures, 18 exclusions, 0 regressions, Linux CI
> green** (`compat/corpus/fmt-known-failures.json` /
> `fmt-oracle-excluded.json`). See **“Remaining 101 (2026-06-28 snapshot)”**
> below for the live cluster breakdown, root causes, concrete examples, and the
> approaches already proven net-negative. The historical narrative (the original
> 431→0 burn-down on the smaller svelte-only corpus) is retained further down.

---

## 2026-06-29 update (101 → 85): embedded-expression paren normalization

Five entries cleared via embedded-JS paren normalization in `expression.rs`
(PR #1328) — all platform-independent, Linux-CI-validated:

1. **Object value with a stray `)` in a comment** — `track={{ … // 1.) x … }}`.
   `outer_parens_match` counted the comment's lone `)` and kept the wrapper
   (`track={({ … })}`). It now skips parens inside strings/templates and
   `//` / `/* */` comments. _(layerchart Arc)_
2. **Object that is the head of a member/call** — `size={{ … }[key]}`. OXC
   parenthesizes the leading object at statement position (`({ … })[key]`), which
   `strip_outer_parens` can't unwrap. Detected via the AST (`expr_has_object_head`,
   walking the leftmost `.object`/`.callee` spine) and stripped with
   `strip_leading_paren_pair`, keeping the postfix verbatim. _(svelte-ux
   Checkbox/Radio/Timeline)_
3. **Top-level assignment value** — `{x = 5}` → `{(x = 5)}` (mustache/attribute/
   block-header alike). `format_expr_core` now applies the one-pair rule to
   `AssignmentExpression` (with `SequenceExpression`); the redundant block-header
   `block_header_expr_needs_parens` re-wrap is removed. _(svelte-form-builder)_

### Remaining 85: the safe mechanical wins are now exhausted

A full re-survey of the 85 (ranked by diff size) confirms every remaining entry
needs one of:

- **The layout engine (dominant group, ~60).** Hug / closing-`>` placement
  (`>{label}` and `</code\n>` on their own line when content hugs a multi-line
  element), inline under/over-break, prose `fill`. This is exactly the
  `printChildren` / `fill` / `group` Doc-IR port (`docs/fmt-layout-port-plan.md`,
  milestone 2). `children.rs` is built + unit-tested but still unwired; wiring it
  is the only path to these and must proceed one element shape at a time, each
  validated at 0 corpus regressions.
- **Delicately-tuned heuristics (net-risky for 1–2 files each).**
  - *Directive-value overflow* — `on:keypress={(e) => long && body}` at a deep
    attribute indent overflows 80 but rsvelte keeps it on one line. The
    `render_directive_value_narrow` width math (`extra_lead = prefix -
    indent_width`) is deliberately loose to avoid over-breaking nested
    object/array arguments. **Empirically net-zero (2026-06-29, reverted):**
    tightening to `extra_lead = prefix + 1` for arrows with no `{`/`[` body fixes
    the single-line break decision (`(e) =>` now wraps) but the same tight width
    then over-breaks a slightly-longer sibling body at `&&`
    (`e.key === "Enter" &&\n handleClickCell(…)`) — the file fails differently, 0
    net change. A single oxc width cannot model both the first-line overflow
    decision AND the looser body-continuation budget. The real fix is a **two-stage
    arrow split**: format the body at the loose width, and if the tight first-line
    budget overflowed, force a manual `params =>\n  <loose-body>` split (keeping
    the body's loose single line). _(svelte-table)_
  - *`<pre>` body reformat* — `reformat_pre_inner` re-indents a `{#if}` block
    marker inside `<pre>` to a tab where the oracle keeps the source's 2 spaces
    verbatim. The `<pre>` reformat subsystem is special-cased (tab element-lines /
    space block-lines); making it keep simple bodies verbatim risks the cases it
    was tuned for. _(svelte-calendar Code)_
  - *Nested each-block key chain reindent* — `{#each xs as n (n.a().b())}` breaks
    the key chain but reindents continuation lines to depth 0 (2 spaces) instead
    of the block's deep column. Reindent-depth threading for block-header keys.
    _(layerchart Partition)_
- **Isolated oddity.** A TS generic arrow `<T,>(…) =>` keeps its disambiguating
  trailing comma where oxfmt drops it (`<T>`). _(svelte-splitpanes)_

---

## Remaining 101 (2026-06-28 snapshot)

Re-generate this view any time with:

```bash
RSVELTE_FMT_BIN=target/release/rsvelte-fmt node scripts/compat-corpus/fmt.mjs --actual
node scripts/compat-corpus/fmt-verify.mjs --max-print 200   # full per-id diffs
node scripts/compat-corpus/fmt-cluster.mjs                  # ranked clusters
node scripts/compat-corpus/fmt-one.mjs <id>                 # one id, live oracle vs rsvelte
```

The 101 are concentrated in real-world repos (corpus submodules): layercake (20),
svelte-ux (17), layerchart (11), svelte-form-builder (9), cmsaasstarter (7),
svelte-maplibre (5), then a long tail. **Almost all are the interconnected
prettier HTML-layout / embedded-JS reflow behaviors** — the two dominant clusters
have _opposing_ failure modes, so a blanket width or break-eagerness change trades
one cluster for the other (verified — see “proven net-negative” below). Reaching 0
needs the faithful prettier `printChildren` / `fill` / `group` Doc-IR layout port
(`docs/fmt-layout-port-plan.md`), not point patches.

### Cluster A — oracle wraps, rsvelte stays too compact (~49) — *under-break*

The oracle breaks a long open tag / text run / embedded expression onto MORE
lines than rsvelte. Sub-shapes:

- **Long open-tag → break before child.** `<pre><code class="language-bash">` +
  immediate text: the oracle puts `# Code blocks…` on its own line; rsvelte hugs
  it onto the open tag. (`cmsaasstarter/.../awesome_post`.)
- **Prose text `fill`.** A long mixed text run (`This is a basic setup … numbers
  is unusual (<code>1,10,100…</code> …)`) is word-wrapped by the oracle at the
  print width; rsvelte keeps it on one (very long) line. (`powertable/.../examples/+layout`.)
- **Attribute string value wrapping.** Long `message="…"` /
  `class="… {ternary} …"` attribute values the oracle wraps. (`cmsaasstarter/.../delete_account`.)
- **Close-tag placement after a wrapped child** (`</div></a` vs `</div></a>`).

### Cluster B — rsvelte over-breaks an open tag / embedded expression (~39) — *over-break*

The mirror image: rsvelte wraps something the oracle keeps inline (or breaks it
more aggressively). Two distinct root causes here:

- **Inline element kept on one line.** `View our <a href=… class="link">pricing
  page</a> for details.` overflows 80 cols, but the oracle keeps the whole
  text+`<a>`+text run on one line (breaking the inline `<a>` open tag would change
  whitespace-significant rendering); rsvelte breaks the `<a>` open tag into the
  ugly `<a …\n  >pricing page</a\n> for details.` form.
  (`cmsaasstarter/.../billing`.)
- **Embedded `{expr}` width over-break.** An expression inside an attribute value
  is formatted at a too-narrow width, so oxc breaks a call/ternary the oracle keeps
  compact: `class="{fieldError(form, 'fullName') ? … }"` → rsvelte breaks
  `fieldError(\n  form,\n  'fullName',\n)`; `style:transform="translate({dx + (a ?
  -3 : 0)}px, …)"` → rsvelte explodes the ternary. The available-width accounting
  for an attribute-embedded `{expr}` (`format_attribute_value_expression`) is the
  suspect. (`cmsaasstarter/.../create_profile`, `layercake/_components/AxisY.*`.)

### Cluster C — embedded-JS paren/disambiguation differences (~7)

oxc's `NeedsParentheses` adds parens the oracle (prettier) omits in expression
position, because rsvelte formats the embedded `{expr}` through a statement
wrapper (`(expr);`):

- **`object-paren` (4)** — `attr={{ … }[k]}` / `attr={{ … }}` → rsvelte emits
  `attr={({ … })[k]}`: oxc parenthesises a leading object literal to avoid
  block-parsing in statement position. (`layerchart/Arc`, `svelte-ux/Checkbox`,
  `svelte-ux/Radio`, `layerchart/Timeline`.)
- **`other-content` (2)** — same family: `(feature) => (Array.isArray(…))` keeps a
  paren around an arrow body; `{(dataAttribute.value = [])}` keeps a paren around
  an assignment expression — the oracle omits both. (`layerchart/docs/+layout`,
  `svelte-form-builder/PropertyPanelDataAttributes`.)
- **`tsx-generic-comma` (1)** — `<T>(cb…) =>` formatted as `<T,>(cb…) =>`: the
  trailing comma disambiguates a generic arrow from JSX, but `.svelte` scripts are
  TS not TSX, so the oracle emits `<T>`. (`svelte-splitpanes/Splitpanes`.)
  Note `SourceType::ts()` is already non-JSX in `script.rs`; the comma comes from
  `oxc_formatter`'s arrow-generic printing — likely an oxc-version-alignment item.

> **PROVEN NET-NEGATIVE (do not re-attempt without a different mechanism):**
> routing leading-object expressions through the const-initializer wrapper to drop
> the Cluster-C `object-paren` parens (commit reverted 2026-06-28) fixes the 4
> object-paren files but **regresses ~50** others: the const wrapper adds a `+20`
> line-width compensation (for the stripped `const _rsvelte_x_ = ` prefix) that
> also inflates the budget for CONTINUATION lines, so multi-line objects/expressions
> the oracle breaks (`description: "…"`, `xAxis: { … }`, ternaries in
> `force.strength(…)`) collapse onto one line. A correct fix needs a zero-width
> expression-context wrapper (oxc can't currently be told the `{expr}` is in
> expression, not statement, position) — i.e. an `oxc_formatter` change, not a
> rsvelte wrapper trick. String-surgery paren-stripping is forbidden by project rule.

### Cluster D — indent-only niches (~6)

Heterogeneous, each its own small root cause (not a shared fix):

- **Method-chain continuation indent.** A multi-line member chain inside `{expr}`
  (`…\n  .ancestors()\n  .map(…)`) is indented to the expression’s column by the
  oracle but to a flat 2 spaces by rsvelte. (`layerchart/Partition`, `Treemap`.)
- **`{#if}` / text indent inside whitespace-sensitive `<pre>`** — a tab vs the
  configured 2-space indent on one line inside `<pre>`. (`svelte-calendar/Code`,
  `JSONEditor`.)
- **SVG child / self-close depth** (`><path` indented one level deeper by the
  oracle). (`date-picker-svelte/DatePicker`, `svelte-ux/ProgressCircle`.)

### How to attack (priority order for a future pass)

1. **Cluster B embedded-`{expr}` width** (subset of ~39) is the most
   self-contained: fix the available-width passed to
   `format_attribute_value_expression` so an attribute-embedded expression isn’t
   broken more eagerly than prettier. Validate against the FULL corpus — Clusters
   A and B share the width machinery, so confirm 0 regressions before committing.
2. **Cluster A/B HTML inline-element layout** is the big prize (~85 combined) but
   needs the `printChildren`/`fill`/`group` Doc-IR port — a dedicated,
   benchmark-gated effort, not a point patch.
3. **Cluster C** waits on an `oxc_formatter` expression-position API (or an oxc
   bump that drops the `<T,>` comma / leading-object paren in this context).
4. **Cluster D** items are individually small and safe but low-yield.

**Cross-platform / baseline rule (critical):** the committed
`fmt-known-failures.json` is the **Linux CI** failure set; macOS `--update-baseline`
drops the loose-declaration-tag entries Linux includes (this snapshot: Linux
`included` 11477 vs macOS 11478) and breaks CI. Shrink the baseline only from a
Linux `corpus-compat.yml` run — read the Formatter-parity job log for the
“N known failures now PASS” count and the per-id NOTICEs, then REMOVE exactly the
confirmed-fixed ids from the committed list (do NOT regenerate via
`--update-baseline` on macOS). See `scripts/compat-corpus/README.md` and the
`project_corpus_fmt_parity` memory.

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

## (Historical) Remaining 78 fixable (local, after 16 oracle-excluded), by class

> Superseded by the “Remaining 101 (2026-06-28 snapshot)” section at the top of
> this file. Kept for the per-cluster root-cause notes, which still apply to the
> equivalent clusters in the current set.

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
