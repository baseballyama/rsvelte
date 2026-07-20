# fmt-known-failures.json — why entries are accepted

The formatter-parity corpus formats every `.svelte` component with both
`rsvelte-fmt` and the `oxfmt(svelte:true)` oracle (prettier-plugin-svelte for the
Svelte structure + oxc for embedded JS/CSS — rsvelte-fmt's exact layering) and
requires **byte-identical** output. The ratchet may only shrink.

**Current baseline: 48 entries**, concentrated in real-world corpus repos
(layercake, svelte-ux, layerchart, cmsaasstarter, date-picker-svelte, and a long
tail). Oracle-bug / invalid-input / migrate cases are NOT here — those are
permanently excluded in `fmt-oracle-excluded.json` (see `fmt-oracle-excluded.md`).
Every entry here was individually diffed against its oracle to confirm the
cluster it belongs to; none is a guess from file-name pattern-matching.

## Cluster 1 — close-tag-dangle / open-tag hugging for inline & void children (18)

The most common failure. Prettier prints whitespace-sensitive inline elements
(`<a>`, `<span>`, `<title>`, SVG `<path>`, a `<pre><code>` pair, small inline
components like `<Icon>`) with a dangling close bracket — `</tag` + softline +
`>` — and hug-breaks a long open tag so its `>` (and the first child) lands on
its own line. rsvelte's `children.rs` port (`build_element_doc`) has since been
widened to cover element-only children runs, `{#if}`/`{#each}`/`{#key}`
flow-block children, and whitespace-separated flow-block children, and
self-closing tags are now printed correctly (no more `<path … />` corrupted
into `<path …></path>`). The remaining 18 entries are the shapes those widening
steps did not reach: runs of SVG `<path>` siblings inside deeper nesting,
`<pre><code class="…">` open-tag hugging, `<a>`/`<span>`/`<Icon>`
dangling-close and hug decisions that still fall through to the compact
fallback (or, in the opposite direction, get wrongly applied to a short inline
child that would fit compact), and an `{:else if}` branch picking the wrong
side of a title/element dangle. `Child::Block` is still production-unreached
in the port. Fix belongs in rsvelte — continuing to widen the `children.rs`
Doc-IR gate.

Two of the 18 — `date-picker-svelte/src/lib/DatePicker.svelte` and
`date-picker-svelte/src/routes/+layout.svelte` — are **not** a missing-shape
gap. Every individual SVG-hug / dangle shape they contain formats correctly in
isolation, verified with oracle repros at the same nesting depth as the real
file, so the port already claims these elements correctly on their own. The
real cause is a pass-ordering / claim-suppression interaction: prime suspect is
`collect_children_port_only` (`collapse.rs:4574-4581`), which does not recurse
into an element once the port has claimed it, so a claimed ancestor can
suppress a correct port decision for a claimed descendant nested inside it.
This needs a pass-ordering fix, not a new shape in the gate.

## Cluster 2 — multi-interpolation break-point selection in attribute/style values (9)

A quoted attribute or `style:`/`style=` value with **two or more** separate
`{…}` interpolations overflows the line, and the oracle picks a specific
interpolation (and a specific point inside it) to break at — often the first
one, sometimes mid-expression at a binary operator — while rsvelte's
per-interpolation width model picks a different interpolation, a different
point inside the right one, or fails to break at all where the oracle does. An
attempted fix (estimating trailing-interpolation width) fixed one file
(`svar-core` calendar `Panel.svelte` — still failing today for the
"doesn't break at all" variant of this same bug) but regressed four others
(`Legend`, `BarStack`, a `docs-[topic]` fixture, `unused-selector-string-concat`)
— reverted. Fix belongs in rsvelte — a whole-value Doc model for quoted
attribute/style values (format the entire value as one Doc instead of
per-interpolation narrowing).

## Cluster 3 — embedded-JS member-chain / call-argument break-point divergence (5)

A single JS expression inside one interpolation (`a?.b?.c`, `a.b.c`,
`x ?? 'default'`, or a call like `isNodeVisible(a, b)`) needs to break, and
oxc's chosen break point differs from what the oracle emits in the same
context — e.g. the oracle breaks `session\n?.user?.email` (head, then rest)
where standalone oxc breaks `session?.user\n?.email`, or the oracle keeps a
`{#if long-call(…)}` header on one line entirely where oxc breaks the call
arguments (and, in one case, resets to the wrong indent depth relative to the
surrounding template). One entry (`svelte-form-builder/FormBuilder.svelte`)
shows the same divergence repeated many times inside one multi-line `style="…"`
value, each `?.`/`??` chain choosing a different break point than the oracle.
This is oxc's member-chain / call-argument merge heuristic disagreeing with the
oracle's context, not a width-narrowing problem. Fix belongs in
`oxc_formatter` (member-chain and call-argument printing).

## Cluster 4 — inline `{expr} {expr}` / void+text child collapse (2)

The mirror image of Cluster 1's hugging: adjacent expression-tag children
(`{key} {first} {last}`), or a void element immediately followed by an
expression tag (`<Icon … /> {value.label}`), are kept on one line by the
oracle but split onto separate lines by rsvelte. **This is not on the same
lever as Cluster 1.** Measured at current HEAD, applying the blanket
`ws_only_text_between_elements` relaxation (treat whitespace-only text between
elements as always joinable) gives **+0 fixed / −12 regressed**, and both
Cluster 4 entries remain FAIL under it — see "proven net-negative" below.
Worse, the 12 regressions include `layercake/.../Nav.svelte`, an id the narrow
element-only `children.rs` gate had just fixed, so the relaxation actively
fights the Cluster 1 work. Cluster 4's real root cause is a different
mechanism than Cluster 1's hug/dangle gate — the leading (unconfirmed) suspect
is the prose-fill side-hug context, i.e. the Fill algorithm's decision of
which sibling a `{expr}` "word" is allowed to hug depends on surrounding
text/element context, not on bare adjacency — but the actual fix location is
unknown pending further investigation.

## Cluster 5 — prose fill / text wrap (8)

A long mixed text run (plain prose, or prose interleaved with inline elements,
`{@render …}` calls, or adjacent attribute/directive values) is word-wrapped at
the print width by the oracle's `fill` algorithm with `pair_fits` lookahead,
and rsvelte either wraps a word early, fails to fill a block-child text run at
all, or keeps a run compact that the oracle wraps. Dropping `pair_fits`
globally is proven net-negative (fixed 4 prose cases, broke 48) — the oracle's
fill is genuinely context-dependent and not hand-characterizable without the
full lookahead algorithm. Fix belongs in rsvelte — the `Fill`/prose layout
port.

## Cluster 6 — `<pre>` embedded block-tag reindent (2)

Inside a literal `<pre>` whose body mixes raw text with a Svelte block tag
(`{#if …}…{/if}` wrapping a `<code>` child), the oracle reindents the block
tag's own lines (tabs → spaces, depth-normalized) while leaving the literal
text verbatim; rsvelte's `<pre>` handling emits the source's raw tabs
unchanged. `reformat_pre_inner` is string surgery with no Doc IR (flagged
fragile). Fix belongs in rsvelte — rewriting the `<pre>` path on the Doc IR.

## Cluster 7 — oxc paren / type-annotation divergence (2)

The oracle's prettier-plugin-svelte layer omits parens or type-annotation
formatting that oxc's `NeedsParentheses` / union-type printer adds: `{@const
y = a = item.n}` stays unparenthesized in the oracle but oxc parenthesizes the
inner assignment (`(a = item.n)`); a `… as HTMLElement | undefined` union stays
on one line in the oracle but oxc expands it to a leading-`|` multi-line union.
String-surgery paren/type stripping is forbidden by project rule. Fix belongs
in `oxc_formatter` (expression-position parens, union-type layout).

## Cluster 8 — multi-line attribute-value continuation reindent (1)

A `style:`/`style=` value that spans multiple raw-text lines *and* contains a
broken multi-line expression (a nested ternary) on the same value needs
brace-depth-aware per-line reindent; the current logic only handles the
all-verbatim case, so a continuation line that should track the ternary's
indent instead gets double-indented against the raw-text depth. Fix belongs in
rsvelte — `render_attribute_value_sequence`; tractable but deferred, since it
touches the same brace-depth-aware reindent machinery as Cluster 6's `<pre>`
path.

## Cluster 9 — CSS declaration reindent, native engine (1)

A `<style>` block declaration whose value spans multiple lines and mixes a
comment with several `repeating-linear-gradient(...)` calls
(`background-image: /* comment */ repeating-linear-gradient(…), /* comment */
repeating-linear-gradient(…), …`) gets both its leading comment and its
continuation-argument lines indented differently by the native
`oxc_formatter_css` engine than by the oracle — a stray space+tab mix on the
comment line, and a 2-space-narrower indent on every subsequent
`repeating-linear-gradient` argument line. This is the one entry in the
baseline that is pure CSS formatting, not HTML/JS layout. Fix belongs in
`oxc_formatter_css` (multi-value declaration indent tracking).

## Proven net-negative (do not re-attempt without a different mechanism)

- **Global fill "break-after-overflow"** (dropping `pair_fits`) — fixed 4 prose
  cases (Cluster 5) but caused 48 new failures; the oracle's fill is
  context-dependent and not hand-characterizable.
- **Const-initializer wrapper to drop Cluster-7 parens** — fixed 4 files but
  regressed ~50 (the wrapper's `+20` width compensation also inflates
  continuation-line budgets, collapsing multi-line objects the oracle breaks).
- **Blanket `ws_only_text_between_elements` relaxation** (attempted for
  Cluster 4) — measured at current HEAD as **+0 fixed / −12 regressed**, and
  Cluster 4's own entries stay FAIL under it. Regressions: flowbite-svelte
  Datepicker / Input / KanbanBoard, layercake Nav + guide `+page`, shadcn
  drawer-direction / sheet-side, svelte-notifications Icon / Notifications,
  svelte-table SvelteTable, svelte.dev SearchResultList, svelte
  keyed-each-dev-unique-update — including `layercake/.../Nav.svelte`, an id
  the narrow element-only `children.rs` gate had just fixed. Correct only for
  the specific hugged-sibling shape, not as a blanket rule; the real Cluster 4
  fix location is still unknown.
- **Estimating trailing-interpolation width** (Cluster 2) — fixed `svar-core`
  Panel but regressed `Legend`, `BarStack`, a `docs-[topic]` fixture, and
  `unused-selector-string-concat`.

## Cross-platform baseline rule (critical)

The committed baseline is the **Linux CI** failure set. Shrink it only from a
Linux `corpus-compat.yml` run (macOS `--update-baseline` drops
loose-declaration-tag entries Linux includes and breaks CI): read the
Formatter-parity job log for the "N known failures now PASS" count and per-id
NOTICEs, then remove exactly the confirmed-fixed ids.
