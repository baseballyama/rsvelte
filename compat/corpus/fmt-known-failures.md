# fmt-known-failures.json — why entries are accepted

The formatter-parity corpus formats every `.svelte` component with both
`rsvelte-fmt` and the `oxfmt(svelte:true)` oracle (prettier-plugin-svelte for the
Svelte structure + oxc for embedded JS/CSS — rsvelte-fmt's exact layering) and
requires **byte-identical** output. The ratchet may only shrink.

**Current baseline: 55 entries**, concentrated in real-world corpus repos
(layercake, svelte-ux, layerchart, cmsaasstarter, date-picker-svelte, and a long
tail). Oracle-bug / invalid-input / migrate cases are NOT here — those are
permanently excluded in `fmt-oracle-excluded.json` (see `fmt-oracle-excluded.md`).
Every entry here was individually diffed against its oracle to confirm the
cluster it belongs to; none is a guess from file-name pattern-matching.

## Cluster 1 — close-tag-dangle / open-tag hugging for inline & void children (25)

The most common failure. Prettier prints whitespace-sensitive inline elements
(`<a>`, `<span>`, `<b>`, `<u>`, `<title>`, SVG `<path>`, a `<pre><code>` pair)
with a dangling close bracket — `</tag` + softline + `>` — and hug-breaks a long
open tag so its `>` (and the first child) lands on its own line. rsvelte's
`children.rs` port (`build_element_doc`) implements this shape but
`collapse.rs`'s `try_children_port` gates it too narrowly: it only fires for a
specific "mixed prose + void/inline children" pattern, so runs of SVG `<path>`
siblings, `<pre><code class="…">text` open-tag hugging, and plain `<a>`/`<span>`
dangling-close all fall through to the compact fallback. `Child::Block` is
production-unreached in the port. Fix belongs in rsvelte — widening the
`children.rs` Doc-IR gate (the deep layout milestone).

## Cluster 2 — multi-interpolation break-point selection in attribute/style values (8)

A quoted attribute or `style:`/`style=` value with **two or more** separate
`{…}` interpolations overflows the line, and the oracle picks a specific
interpolation (and a specific point inside it) to break at — often the first
one, sometimes mid-expression at a binary operator. rsvelte's per-interpolation
width model treats trailing interpolations as zero-width, so it consistently
breaks at the wrong spot (too early or too late) relative to the oracle. An
attempted fix (estimating trailing-interpolation width) fixed one file
(`svar-core` calendar `Panel.svelte`) but regressed four others (`Legend`,
`BarStack`, a `docs-[topic]` fixture, `unused-selector-string-concat`) — reverted.
Fix belongs in rsvelte — a whole-value Doc model for quoted attribute/style
values (format the entire value as one Doc instead of per-interpolation
narrowing).

## Cluster 3 — embedded-JS member-chain / call-argument break-point divergence (5)

A single JS expression inside one interpolation (`a?.b?.c`, `a.b.c`,
`x ?? 'default'`, or a call like `isNodeVisible(a, b)`) needs to break, and
oxc's chosen break point differs from what the oracle emits in the same
context — e.g. the oracle breaks `session\n?.user?.email` (head, then rest)
where standalone oxc breaks `session?.user\n?.email`, or the oracle keeps a
`{#if long-call(…)}` header on one line entirely where oxc breaks the call
arguments (and, in one case, resets to the wrong indent depth relative to the
surrounding template). This is oxc's member-chain / call-argument merge
heuristic disagreeing with the oracle's context, not a width-narrowing problem.
Fix belongs in `oxc_formatter` (member-chain and call-argument printing).

## Cluster 4 — inline `{expr} {expr}` / void+text child collapse (4)

The mirror image of Cluster 1's hugging: adjacent expression-tag children
(`{key} {first} {last}`), or a void element immediately followed by an
expression tag (`<Icon … /> {value.label}`), are kept on one line by the
oracle but split onto separate lines by rsvelte. Keeping `{a} {b}` inline as a
general children-printing rule is proven net-negative (see below); it needs to
apply only in this specific hugged-sibling shape. Fix belongs in rsvelte — the
same `children.rs` Doc-IR milestone as Cluster 1, since it is the same printer
choosing the wrong side of the hug/split decision.

## Cluster 5 — prose fill / text wrap (7)

A long mixed text run (plain prose, or prose interleaved with inline elements
or `{@render …}` calls) is word-wrapped at the print width by the oracle's
`fill` algorithm with `pair_fits` lookahead, and rsvelte either wraps a word
early, fails to fill a block-child text run at all, or keeps a run compact
that the oracle wraps. Dropping `pair_fits` globally is proven net-negative
(fixed 4 prose cases, broke 48) — the oracle's fill is genuinely
context-dependent and not hand-characterizable without the full lookahead
algorithm. Fix belongs in rsvelte — the `Fill`/prose layout port.

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
indent instead keeps the raw-text depth. Fix belongs in rsvelte —
`render_attribute_value_sequence`; tractable but deferred (touches a fragile
area shared with Cluster 6).

## Cluster 9 — CSS declaration-comment indent, native engine (1)

A `<style>` block declaration whose value spans multiple lines
(`background-image: /* comment */ repeating-linear-gradient(…)`) gets its
leading comment indented with a stray space+tab mix by the native
`oxc_formatter_css` engine, where the oracle emits a clean tab run. This is the
one entry in the baseline that is pure CSS formatting, not HTML/JS layout.
Fix belongs in `oxc_formatter_css` (multi-value declaration comment
placement).

## Proven net-negative (do not re-attempt without a different mechanism)

- **Global fill "break-after-overflow"** (dropping `pair_fits`) — fixed 4 prose
  cases (Cluster 5) but caused 48 new failures; the oracle's fill is
  context-dependent and not hand-characterizable.
- **Const-initializer wrapper to drop Cluster-7 parens** — fixed 4 files but
  regressed ~50 (the wrapper's `+20` width compensation also inflates
  continuation-line budgets, collapsing multi-line objects the oracle breaks).
- **Keeping `{a} {b}` inline as a general element-children rule** (Cluster 4) —
  net +1/−29; correct only for the specific hugged-sibling shape, not as a
  blanket rule.
- **Estimating trailing-interpolation width** (Cluster 2) — fixed `svar-core`
  Panel but regressed `Legend`, `BarStack`, a `docs-[topic]` fixture, and
  `unused-selector-string-concat`.

## Cross-platform baseline rule (critical)

The committed baseline is the **Linux CI** failure set. Shrink it only from a
Linux `corpus-compat.yml` run (macOS `--update-baseline` drops
loose-declaration-tag entries Linux includes and breaks CI): read the
Formatter-parity job log for the "N known failures now PASS" count and per-id
NOTICEs, then remove exactly the confirmed-fixed ids.
