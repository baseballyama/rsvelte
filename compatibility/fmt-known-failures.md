# fmt-known-failures.json — why entries are accepted

The formatter-parity corpus formats every `.svelte` component with both
`rsvelte-fmt` and the `oxfmt(svelte:true)` oracle (prettier-plugin-svelte for the
Svelte structure, oxc for embedded JS, and PostCSS for embedded CSS) and requires
**byte-identical** output. rsvelte-fmt uses in-process `oxc_formatter_css` for
embedded CSS by default, so the ratchet intentionally includes CSS-engine parity
as well as Svelte-structure parity. The ratchet may only shrink.

**Current baseline: `fmt-known-failures.json`, 789 entries** — 22 from before the
wave-2 corpus enrolment, 766 in the current expanded-corpus population, and 1
from a pattern-corpus repro added during the campaign (Cluster 12).
Oracle-bug / invalid-input / migrate cases are NOT here — those are permanently
excluded in `fmt-oracle-excluded.json` (see `fmt-oracle-excluded.md`).

**The two halves are justified to different standards, and the difference is the
point.** Each of the original **22** was individually diffed against its oracle
to confirm the cluster it belongs to; none is a guess from file-name
pattern-matching. The 17 `skeleton/…` entries are the seed set from enrolling
`submodules/skeleton` in the corpus (#1924); each was reduced to a standalone
minimal repro before being filed into a cluster (9 into the new Cluster 9, 2 into
the new Cluster 10, the other 6 into existing Clusters 1/2/3). Entries in the
expanded population are clustered **mechanically**, by a rule over the report's
own `expected`/`actual` strings (Clusters 20-27 below) — *not* individually
diffed. Do not read a wave-2 cluster as a reviewed diagnosis: it is a bucket, and
one example per bucket was inspected by hand.

An id that carries two clusters' divergences at once is filed under its dominant
one (see *Multiple clusters per id*), so the per-cluster counts below remain a
partition of the ratchet rather than an over-count:

Partition of `fmt-known-failures.json` by cluster: `3 + 8 + 6 + 1 + 1 + 1 + 1 + 2 + 386 + 239 + 85 + 38 + 14 + 1 + 2 + 1`

## Wave-2 enrolment (#3130) — Clusters 20-27

The corpus went from 37 to 104 corpus sources, and the formatter-parity set
with it. The current run has **33,483 included components, 32,667 matched, 787
failing** (29 excluded, 239 skipped) — those five numbers are the CI report as it
stood *before* the 2026-08-31 reclassification below, which moves one id out of
`excluded` and into this ratchet without changing what the two formatters emit. The original enrolment added 764 entries
from the 67 new repositories; later submodule and pattern-corpus updates moved
that expanded-population residue to 765. At enrolment time 51 repositories
contributed at least one; sparrow-app
(104), open-webui (93), carbon-components-svelte (80) and svelte-commerce (73) are
46% of the new half between them.

**This baseline is a Linux CI run** (`corpus-compat.yml`, the `corpus-fmt-report`
artifact), per the *Cross-platform baseline rule* at the end of this file. A macOS
run of the same tree reported **865** new failures, 80 more, all of them the BOM
defect below — the two platforms genuinely disagree here, so a local
`--update-baseline` would enrol a set CI does not reproduce.

**80 entries never reached this list, because the enrolment found a real defect
first.** `parse` strips a leading UTF-8 BOM, so its spans are relative to the
stripped text, while `rsvelte_formatter` kept slicing the unstripped source with
them — three bytes off. Every BOM-prefixed component with a `<script>` failed with
`script closing tag missing` and was left *completely unformatted*; the ones
without a `<script>` formatted but dropped the BOM, which prettier keeps. All 80
BOM-prefixed components in the corpus now match the oracle byte-for-byte; without
that fix they would all have landed in `indent-only` below.

**The cluster table was re-derived after this branch was rebased onto `main`.**
Eighteen stale ids left the ratchet after the branch was rebased onto `main`.
Because the *first differing line* of an entry that still fails can move whenever
the formatter changes, the buckets moved with them: the current expanded population
of 765 entries classifies as shown below. Read that as the property of this table it has always
had — **it is keyed on the first differing line, so it re-partitions whenever the
formatter changes, with or without a change in what fails.** The counts below are
the rule below applied to the current Linux report; the previous ones were the
same rule applied to a different formatter.

The clustering rule, applied to the first differing line, in this order: equal
after `trim()` but differing leading whitespace → **indent-only**; one side blank
→ **extra-line** / **missing-line**; one side a prefix of the other →
**breaks-earlier** / **breaks-later** (rsvelte's line is the shorter / the longer);
equal after swapping quote characters → **quote-style**; equal after removing all
whitespace → **intra-line-ws**; anything else → **other**.

| n | cluster | what the first differing line looks like |
|---|---|---|
| 386 | **20 — breaks-later** | rsvelte keeps on one line what the oracle has already broken (`{#each …sort( (a,b) => {` vs a wrapped form) |
| 239 | **21 — breaks-earlier** | the mirror image: rsvelte breaks where the oracle keeps going (`selected_category.id ===` vs `… === category.id}`) |
| 38 | **23 — indent-only** | same trimmed text at a different indent, typically a member-chain continuation inside `<script>` or a nested element's body |
| 85 | **22 — intra-line-ws** | same tokens, different interior spacing — most of it a sole arrow argument the oracle hugs (`sort((a, b) =>`) and rsvelte pads (`sort( (a, b) =>`) |
| 14 | **24 — other** | no rule matches; includes a SCSS `,`/`;` terminator on a declaration list whose last entry is followed by `//` comments, a lowercased invalid hex colour (`#E7E7E7l`), a tab-vs-space indent on a wrapped text run, and a doubled space inside a `class` attribute |
| 1 | **25 — extra-line** | rsvelte emits a line where the oracle has none; the #3498 pattern's line-comment-separated class rune stays on its own line |
| 2 | **26 — missing-line** | the reverse; both are CRLF sources where rsvelte leaves a bare `\r` |
| 1 | **27 — quote-style** | an import specifier printed with single quotes where the oracle uses double |

Two #3404 pattern files make the CSS-engine part of Cluster 22 explicit (they
are included in its count of 85, not additional clusters):

- `pattern/issues/3404-repeated-combinators.svelte` contains `.card >> .a`.
  The embedded PostCSS oracle accepts the repeated combinator and removes its
  spaces; `oxc_formatter_css` rejects that selector, so rsvelte-fmt's documented
  parse-failure fallback preserves the source spelling.
- `pattern/issues/3404-unhandled-combinator-scope.svelte` contains the valid
  column combinator `.a || .b`. Both engines accept it, but PostCSS removes the
  spaces around `||` while OXC retains them.

The native parse-failure fallback's former extra leading blank line was a
separate product bug and was fixed by #3629. These two entries remain because
gate 9 intentionally compares the shipped native CSS path rather than replacing
it with `--no-native-css`; #3628 records that decision and the engine boundary.

**624 of 765 (82%) are cluster 20 or 21 — one question, where a line breaks** —
and that is the burndown target, not the tail. Nothing here is an oracle bug: the
`oracle-invalid` classification already carries those and is a pass, not a ratchet
entry.

## Three axes the cluster table does not carry (2026-08-31)

The table above keys on the **first differing line**, which answers *what the
divergence looks like* and nothing about *how much it costs*. Three orthogonal
measurements over the same 788, each run on the current tree with the same
invocations the gate uses (`oxfmt -c scripts/fixtures/fmt-corpus.oxfmtrc.json
--stdin-filepath <basename>` and `rsvelte-fmt --stdin --stdin-filepath <basename>
-c <same config> --oxfmt-bin <same oxfmt>`). Positive control that the harness
reproduces the gate: **0 of 788 came back byte-equal** — the harness agrees with
the ratchet on every entry.

**1. Does the divergence change what the compiler emits?** Each side's formatted
output was compiled with the official compiler (`generate: 'client'` and
`'server'`, comparing `js.code` and `css.code`):

| n | class |
|---|---|
| 674 | **render-neutral** — the compiler emits byte-identical JS *and* CSS from both forms |
| 114 | **render-changing** — at least one of the four outputs differs |

The 114 split 53 `client:js+server:js`, 43 `client:css+server:css`, 17
`client:js` alone, 1 all four. **86% of this ratchet is invisible to the
compiler**, so it is a formatting-taste backlog, not a correctness one — but the
gate's unit is bytes, so the 114 that *are* a correctness question are filed
beside the 674 that are not, indistinguishably.

**2. Is rsvelte inside the oracle's own width budget?** Counting lines longer
than `printWidth: 80` in each whole output:

| n | class |
|---|---|
| 411 | both outputs overflow (long attribute values, URLs, class lists — neither engine can break them) |
| 264 | **only rsvelte overflows** — rsvelte emits over-width lines the oracle does not |
| 101 | neither overflows — pure break-point preference, both inside the budget |
| 12 | only the oracle overflows |

The asymmetry is the finding: 264 against 12. rsvelte **under-breaks**, which is
the same direction Cluster 20 (385, *breaks-later*) reports and the opposite of
what Cluster 21 (239, *breaks-earlier*) reads like in isolation — an entry can be
`breaks-earlier` on its first differing line and still overflow further down.

**3. Does rsvelte's own output still compile?** This is the question the gate
structurally cannot ask, because its verdict is byte equality against the oracle:
a mismatch is a mismatch whether the actual text is a two-space indent or is not
a Svelte document at all.

| n | class |
|---|---|
| 1 | **rsvelte-fmt output is rejected by the official compiler** |
| 0 | oracle output rejected |

That one is `sveltepress/packages/theme-default/src/components/icons/SystemDefault.svelte`,
and it is not a formatting preference — **rsvelte-fmt duplicates an HTML comment
and truncates the copies**, so the document is destroyed. Reduction (the trigger
is a leading `<!-- … -->` child of an element whose open tag breaks, followed by a
child that itself breaks; the comment's length is irrelevant):

```svelte
<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><!-- x --><path fill="currentColor" d="M10 16h4v0h-4z"><animate fill="freeze" attributeName="d" begin="0.6s" dur="0.2s" values="a;b" /></path></svg>
```

rsvelte-fmt emits the comment three times, and the second and third copies lose
their `-->`:

```
><!-- x --><path fill="currentColor" d="M10 16h4v0h-4z"
><!-- x   ><animate
…
    /></path
><!-- x ></svg>
```

`compile()` on that text throws `expected_token` (*Expected token `-->`*); the
oracle's output for the same input compiles. Removing the comment, flattening the
nesting, or replacing `<svg>` with `<div>` each make the output valid, so the
three ingredients are jointly required. The same check over
`fmt-oracle-excluded.json` (27 entries, 2 of whose sources are already invalid and
1 of which rsvelte-fmt refuses outright) finds **0** further cases, so the whole
formatter-parity population contains exactly this one.

**Attribution status of this ratchet.** *Nothing here is an oracle bug* — that
classification lives in `fmt-oracle-excluded.json` — so no entry can be attributed
to an `upstream_issues/` report. The only `deliberate-divergences` target that
reaches this file is the CSS-engine boundary (#3628), which today is pinned for
*value spelling* by `crates/rsvelte_formatter/tests/css_native.rs` and covers
Clusters 8 and 11 plus the two `pattern/issues/3404-*` files inside Cluster 22 —
**5 entries**. The remaining 783 are neither upstream nor deliberate: they have to
be burned down to zero. The 43 CSS-only render-changing entries above are very
likely the same engine boundary in its *line-breaking* facet (e.g.
`huly/packages/ui/src/components/SearchInput.svelte`, where PostCSS breaks
`background-color: var(--theme-button-default); // …` across three lines and OXC
does not), but that facet has **no pin**, so they are recorded here as a candidate
rather than counted as attributed.

## Cluster 1 — close-tag-dangle / open-tag hugging for inline & void children (3)

The most common failure. Prettier prints whitespace-sensitive inline elements
(`<a>`, `<span>`, `<title>`, a `<pre><code>` pair, small inline components
like `<Icon>`/`<Kbd>`) with a dangling close bracket — `</tag` + softline +
`>` — and hug-breaks a long open tag so its `>` (and the first child) lands on
its own line. rsvelte's `children.rs` port (`build_element_doc`) has since
been widened to cover element-only children runs, `{#if}`/`{#each}`/`{#key}`
flow-block children, whitespace-separated flow-block children, a prose prefix
immediately before a claimed element (`.<span …>`), and Component children;
self-closing tags print correctly (no more `<path … />` corrupted into
`<path …></path>`); a `<pre>` child's close `>` now dangles when its open tag
breaks; and an empty `<textarea>`'s open-tag `>` now dangles when the glued
last line would overflow the print width; and a hugged content line's close
tag now participates in the width measurement, so an inner self-closing
component's attributes break where the oracle breaks them. Two further
widenings landed since (see Resolved): `node_to_child` now has a `RenderTag`
arm claiming it as a bare atom (added to the block-run gate too, while a
prose-position `RenderTag` still bails to the #1669 fill path) instead of
falling through to the legacy string path, fixing an `{:else if}`-branch
title/element dangle; and `<pre><code class="…">` open-tag hugging now
follows three rules confirmed against a `printToDoc` dump — a `<pre>` child's
open `>` dangles when its content is multi-line or its own open tag
overflows, re-hugs only when the attrs themselves break onto multiple lines,
and (when `<pre>` itself overflows) prefers breaking a breakable child's tag
over the `<pre>`'s own attributes.

The remaining 3 entries are the shapes those widening steps did not reach: an
`<a>`/`<span>` dangling-close that falls through to the compact fallback (2
ids — `cmsaasstarter/.../(marketing)/+page.svelte`'s `</div></a>` pair and
`svelte-ux/.../Collapse.svelte`'s `<span>…</span>` pair), and — in the
opposite direction — a short `<a>` kept compact by rsvelte that the oracle
still breaks onto its own lines (1 id, entangled with Cluster 2 and the
since-resolved Cluster 5). Both compact-fallback ids sit behind the same
`>`-prefix bail in `try_children_port`. A strict-condition experiment
narrowing that bail from `>`/`}` to `}`-only was tried and reverted — **0
fixed / 1 regressed** (`shadcn` code-viewer), and the (then four) targeted
ids stayed unchanged or got worse (see Proven net-negative) — confirming,
alongside the earlier `hug_glue_prefix` narrowing experiment, that this
cluster needs children.rs's hug-boundary construction rebuilt, not a gate
relaxation. Fix belongs in rsvelte — continuing to widen the `children.rs`
Doc-IR gate. (Two ids formerly listed in this paragraph —
`svelte-ux/.../TextField/+page.svelte`'s wrong-node `<a>`-hug and
`layercake/.../routes/components/+page.svelte`'s `<a>…</Blockquote` pair —
are gone from the baseline: PR #1877's real-world-layout width fix, already
on `main` before this corpus expansion, cleared both; this doc just hadn't
caught up.)

A 4th member (`skeleton/sites/skeleton.dev/src/components/landing-page/
design-system.svelte`) — the `<pre><code>` shape where the `<code>` open tag's
`>` must dangle onto a multi-line template-literal child — is gone from the
baseline: the three ported `<pre><code>` hug rules reach it after all, and this
doc had not caught up.

## Cluster 2 — attribute/style/directive value break-point selection (8)

A quoted attribute or directive value with one or more `{…}` interpolations
overflows the line, and the oracle's break-point choice differs from
rsvelte's. Most of this cluster's former members are now handled by a
whole-value Doc model (see Resolved): the value's literal text prints
verbatim, and each interpolation is a `group([RawExpr{flat, broken}])` whose
break decision is measured through the *whole remaining tail* — not just its
own width — reproducing prettier's own greedy, left-to-right break-point
choice. The 4 remaining ids split into two distinct blockers:

`style:` **directive** values are not yet routed through that model — their
text is a real `fill` structure in the oracle (unlike a regular attribute's
verbatim text), a deliberately different shape the new model doesn't cover
yet — so `layercake/.../AxisY.percent-range.html.svelte` and
`AxisYRight.percent-range.html.svelte` still show the original symptom:
trailing interpolations are counted at zero absorbed width, so the model
breaks an earlier interpolation the oracle keeps flat inside a deeply nested
`calc(...)` expression.

The wrong-indent half of this cluster turned out to be a double-indent bug,
not the RawExpr width limitation, and is now fixed (see Resolved): the model
baked the absolute attribute indent into continuation lines while the
open-tag assembly re-indents interpolation-led values a second time. That
cleared `svelte-calendar/.../Popover.svelte` outright and resolved
`powertable/.../PowerTable.svelte`'s `placeholder` half (the id keeps
failing on its other clusters — see Multiple clusters per id).
`cmsaasstarter/.../delete_account/+page.svelte`'s
single-interpolation `message=` attribute is not currently routed through
the new model at all (an attempt to widen the gate to that shape was
reverted — see Proven net-negative), but the experiment confirmed its
break-point choice is downstream of the same narrow-width limitation, so its
current diff still shows the un-routed symptom rather than the indent
symptom.

The four skeleton entries are the same limitation on four value shapes: a
`class="…{cond === x ? 'a' : ''}"` conditional whose interpolation the oracle
breaks one operand earlier (`sites/skeleton.dev/.../ui/header/theme.svelte`,
`.../ui/preview.svelte`), a `bind:value={obj[call(…)]}` directive where the
oracle breaks immediately after `{` and indents the whole member expression
(`sites/themes.skeleton.dev/.../Controls/ControlsColors.svelte`), and a
`style:background={obj["k"] === "inherit" ? … : …}` directive — the `style:`
sub-case named above — where the oracle breaks *inside* the computed member
(`.../Controls/ControlsTypography.svelte`).

The RawExpr model has captured everything reachable within its architecture;
what remains needs printing-time nested-expression formatting. Fix belongs
in rsvelte — give each interpolation a *live* Doc subtree (formatted at its
real indent) instead of a pre-narrowed string, so a nested subexpression can
measure against its true column.

## Cluster 3 — embedded-JS member-chain / call-argument break-point divergence (6)

A single JS expression inside one interpolation (`a.b.c`, `x ?? 'default'`)
needs to break, and oxc's chosen break point differs from what the oracle
emits in the same context — e.g. a plain member chain (`$page.error.message`,
`api.rest_props.name`) breaks one property earlier/later or one level deeper
than the oracle. (The block-header variant — a `{#if long-call(…)}` header the
oracle keeps on one line entirely — is resolved, see Resolved.) One entry
(`svelte-form-builder/FormBuilder.svelte`)
shows the same divergence repeated many times inside one multi-line
`style="…"` value, each `?.`/`??` chain choosing a different break point than
the oracle. This is oxc's member-chain / call-argument merge heuristic
disagreeing with the oracle's context, not a width-narrowing problem —
unlike the single-interpolation attribute shapes now filed under Cluster 2,
these divergences persist unchanged after the new attribute-value Doc model
landed — `$page.error.message` sits in a `<pre>` tag's element content (an
expression tag, never routed through any attribute-value model), and
`api.rest_props.name`'s `href` attribute still shows the exact same
break-depth mismatch it always did, so the new model either doesn't reach it
or reaches it without changing the outcome. The divergence is
oxc_formatter's own internal choice, not a width-narrowing problem. Fix
belongs in `oxc_formatter` (member-chain and call-argument printing).

`powertable/app/src/routes/examples/+layout.svelte` was reclassified into
this cluster after the two other mechanisms it used to carry were both
resolved (a Cluster 5 multi-pass fill artifact and a Cluster 1 void-element
dangle — see Resolved): the residual diff is a member-chain break-point
choice inside an `href` attribute's interpolation — the oracle breaks after
`example{$page`, rsvelte after `$page.data` — plus one unrelated stray
trailing space immediately before an `<a>` link's text. The break-point part
is the same oxc member-chain heuristic divergence as the other three ids in
this cluster; the trailing-space part is unexamined but low-priority next to
it.

`skeleton/sites/plus.skeleton.dev/src/routes/(app)/content/blocks/+page.svelte`
is the same mechanism in element content: a parenthesized
`(arr.find(fn)?.blocks ?? []).length` interpolation, where the oracle breaks
inside the parens (`>{(` then the chain indented) while oxc keeps the whole
`find(…)` call on the first line and breaks before `.length`.

`layerchart/packages/layerchart/src/lib/components/Labels/Labels.base.svelte`
is the call-argument form: the oracle breaks the `extractLayerProps` arguments
inside a spread expression while oxc keeps them on one line.

## Cluster 4 — inline `{expr} {expr}` hug/join collapse (1)

The mirror image of Cluster 1's hugging: adjacent expression-tag children
(`{key} {first} {last}`) are kept on one line by the oracle but split onto
separate lines by rsvelte (`svelte-table/example/example6/ContactButtonComponent.svelte`).
**This is not on the same lever as Cluster 1, nor as the since-resolved
Cluster 5** — confirmed by direct testing, not inference. Cluster 1's
hug/dangle gate governs element open/close-tag decisions, not bare `{expr}`
siblings. Cluster 5's prose-fill divergence (see Resolved) was a
width/lookahead disagreement *inside* a run that both sides agree is
fillable; here the Fill algorithm falls back to one-word-per-line entirely
where the oracle keeps the run joined. The leading (unconfirmed)
suspect is the prose-fill side-hug context — the Fill algorithm's decision of
which sibling a `{expr}` "word" is allowed to hug depends on surrounding
text/element context, not on bare adjacency — but the actual fix location is
unknown pending further investigation. Several targeted fixes were attempted
and are proven net-negative (see below).

## Cluster 6 — oxc paren / type-annotation divergence (1)

The oracle's prettier-plugin-svelte layer omits parens that oxc's
`NeedsParentheses` printer adds: `{@const y = a = item.n}` stays
unparenthesized in the oracle but oxc parenthesizes the inner assignment
(`(a = item.n)`). String-surgery paren stripping is forbidden by project rule.
Fix belongs in `oxc_formatter` (expression-position parens).

The former second member of this cluster — a `… as HTMLElement | undefined`
union that the oracle keeps flat while oxc expands it to a leading-`|`
multi-line union — is now resolved for template expressions (see Resolved).
The confirmed mechanism (three repro experiments in the PR for #1484): the
oxfmt oracle formats **template-position** expressions (attribute values,
mustaches) with prettier's estree printer, whose `as`/`satisfies` layout is
`group([expr, " as", indent([line, group(type)])])` — a break after the
operator that keeps the union's own group flat when it fits. oxc ties the
union's leading-`|` separator into a single group, so once the annotation
breaks the union *always* expands, and **no print width reaches the
oracle's layout** (width tuning is not the lever — the divergence reproduces
at markup depth 0). `<script>` blocks are unaffected because oxfmt formats
those with oxc on *both* sides (they agree on leading-`|`), and rsvelte
formats `<script>` through the separate `format_program` path. The principled
upstream fix is still a separate-group `as` layout in `oxc_formatter`; until
that lands, rsvelte reproduces prettier's layout for template expressions only
(see Resolved).

## Cluster 8 — CSS declaration reindent, native engine (1)

A `<style>` block declaration whose value spans multiple lines and mixes a
comment with several `repeating-linear-gradient(...)` calls
(`background-image: /* comment */ repeating-linear-gradient(…), /* comment */
repeating-linear-gradient(…), …`) gets both its leading comment and its
continuation-argument lines indented differently than by the oracle — a
stray space+tab mix on the comment line, and a 2-space-narrower indent on
every subsequent `repeating-linear-gradient` argument line. Root cause
(byte-level reproduction of both pipelines, minimal repro with identical
input): this is NOT an `oxc_formatter_css` indent-tracking bug but a
**engine difference in the two sides** — the oracle's PostCSS path preserves a
multi-line function value's interior lines verbatim (1:1 tab→space mapping
of the source's uneven indents), while the OXC CSS formatter parses the function
and normalizes the arguments to one canonical level. The comment-line
whitespace mix is a secondary rsvelte dedent artifact, but fixing it alone
cannot clear the entry while the engine difference remains. Changing the shipped
engine or reproducing PostCSS's source-preservation rule has a high blast radius.
Cluster 11 is the same engine split reached through a different construct.

## Cluster 11 — CSS selector source spelling, native engine (2)

Two `submodules/svelte` fixtures that arrived with the 5.56.10 bump. Both are
selectors the CSS printer re-emits from the AST rather than from the source:

- `css-nth-of-minified/input.svelte` — `li:nth-child(2n of.important)`. A
  minifier may drop the space after `of` because the `.`/`#`/`[`/`*`/`&` that
  follows already ends the `of` identifier. The oracle keeps the input
  spelling; rsvelte prints `of .important`.
- `css-escape-sequences/input.svelte` — `#\31\32\33 { … }`. The space after
  `\33` is the escape's terminator and belongs to the selector token, so
  re-emitting the token and then adding the separator before `{` yields two
  spaces where the oracle has one.

Same root cause as Cluster 8, reached from the selector side rather than the
declaration side: **the embedded PostCSS oracle preserves selector source text,
while the OXC CSS formatter re-prints selectors from the parsed AST**. Running
oxfmt over the same two selectors as standalone CSS
reproduces rsvelte's output byte for byte. Neither spelling changes what the
selector matches. Changing the product engine or teaching the AST printer to
preserve these spellings has the same high blast radius as Cluster 8.

## Cluster 12 — a block written entirely on one line is expanded, and that is significant whitespace (1)

`pattern/issues/4046-each-const-parameter-comment.svelte`. The source is

```svelte
{#each [1] as i}{@const c = /* c */ v * i}<p>{c}</p>{/each}
```

with no whitespace anywhere between the block tag, the `{@const}` and the child.
The oracle keeps the first child glued to the open tag and the close tag glued to
the last child — `{#each [1] as i}{@const c = /* c */ v * i}` then
`  <p>{c}</p>{/each}` — which reads oddly and is the whitespace-sensitive answer.
rsvelte-fmt normalizes the block to the canonical multi-line form instead.

**This one is not cosmetic: the formatted text compiles to different code.** Run
through the official compiler, the source and the oracle's output are
byte-identical (`compile(source).js.code === compile(oracle).js.code`), while
rsvelte-fmt's output is not — the each callback loses the comment from its
parameter list, `($$anchor, i /* c */) =>` becoming `($$anchor, i) =>`. A
formatter must not move that, so the fix belongs in rsvelte: a block whose first
child begins with no whitespace must not gain any.

Two controls were measured. Removing the comment reproduces the same five-line
divergence, so **the comment is not the trigger** — the one-line layout is. And
handed the multi-line spelling, both formatters return it unchanged and agree
byte-for-byte, so this is rsvelte-fmt *adding* whitespace rather than the oracle
preserving something rsvelte cannot see.

The repro cannot be re-spelled to dodge this. Its subject is exactly the comment
that the multi-line spelling drops, so a multi-line version pins nothing.

## Resolved

- **Overflowing block header: grouped call arguments keep their expanded
  spacing (former Cluster 9, 9 ids, #1976).** When a `{#if}` / `{#each}` /
  `{#key}` / `{#await}` header line does not fit the print width, the oracle
  still prints it on one line, but renders every call in it from the layout oxc
  would have broken out — `callee( a, b )`, one space inside each delimiter,
  arguments flat, no trailing comma:

  ```svelte
  {#each datePicker().getMonthsGrid( { columns: 4, format: "short" } ) as months, id (id)}
  ```

  The trigger was measured to be the **whole header line** (indent + `{#each ` +
  expression + the `as …}` suffix) exceeding the print width — exactly, by
  sweeping the width one column at a time: a header whose flat form is 69 wide
  stays flat at `printWidth: 69` and expands at 68. It applies to every call in
  the expression tree at any depth (inside logical operands, ternary arms,
  optional chains, object property values, array elements, curried callees, the
  each-block key) and to `new` expressions, not just a top-level call.

  An `{#each}` header carries **two** expressions, and the oracle settles them
  left to right: the iterable is judged first, against the not-yet-settled key at
  its widest, and the key is then judged against whatever the iterable actually
  ended up at — two columns per grouped call. So with a flat header of 78 columns
  holding three grouped calls, the split between the two expressions moves the
  boundary. One call in the iterable and two in the key: the iterable measures
  78 + 4 and expands from `printWidth: 81` down, the key measures 78 + 2 (the
  iterable having expanded) and joins it at 79. The same counts reversed: the
  iterable measures 78 + 2 and only expands at 79, and the key — with the
  iterable still flat above that — measures a bare 78, so **nothing** expands at
  80. Measuring each expression against the other *unconditionally* expanded gets
  that second shape wrong, adding spacing the oracle does not. All boundaries
  were confirmed by width sweep across both directions.

  Which calls get the spacing turned out to be exactly oxc's own
  `arguments_grouped_layout` predicate (last-argument or first-argument
  grouping), confirmed against ~60 shapes: a non-empty object/array last
  argument expands, but an empty one does not; a same-shaped penultimate
  argument (`f({…}, {…})`) suppresses it; a numeric-only array last argument
  alongside another argument is printed concisely and so does not expand; an
  arrow last argument expands only when its body is a block, object, array,
  call, conditional or nested arrow — never a bare binary expression. That
  predicate lives in a private oxc module, so `expression/call_args.rs` mirrors
  it, under-approximating (leaving the header flat) for shapes a block header
  cannot realistically hold rather than guessing.

- **Cluster 10 — `prettier-ignore` subtree only partially preserved (2 ids,
  #1977).** A `<!-- prettier-ignore -->` comment must leave the whole next
  node's source verbatim, but only 2 of the collapse pass's 12 recursive
  collectors (`collect` and `collect_children_port_only`; `fill_inline_runs`,
  which builds prose-run edits ahead of the per-node guard, had no check
  either) checked `prettier_ignore::preceded_by_prettier_ignore` before
  recursing/reflowing — `collect_try_collapse_only`,
  `collect_hug_mixed_non_ws_prefix`, `collect_break_block_non_ws_prefix`,
  `collect_break_inline_open_tag`, `collect_recollapse_open_tag`,
  `collect_content_tag_breaks`, and `collect_pre_block_reformats` had no
  guard, so a nested element inside an ignored subtree (e.g. the `<a>` inside
  an ignored `<p>`) could still get its open tag broken by a later sweep. Both
  ids were this one shape (`<a href="…" target="_blank" class="…">` re-broken
  inside an ignored `<p>`), reproduced standalone in
  `crates/rsvelte_formatter/tests/prettier_ignore.rs`. Fixed by adding the same
  index-based guard (`continue` without recursing when the node is preceded by
  the ignore comment in its own parent fragment) to every unguarded collector,
  and by making `fill_inline_runs` treat an ignored node as a run boundary so
  it can never join — or get folded into — a prose-run edit.

- **`RenderTag` claimed as a bare atom in the children port (Cluster 1,
  `{:else if}` title/element dangle, 2 ids).** `node_to_child` had no arm for
  `RenderTag` (`{@render …}`), so an `<svg>` body shaped like `{#if
  cond}<title>{@render title()}</title>{:else if …}…` bailed to the legacy
  string path and dangled the wrong `<title>`'s close tag. A `printToDoc`
  dump confirmed the oracle's actual rule: the first `<title>`'s group
  measures its own fit *including* the following `{:else if}` branch, and
  dangles its close only because that combined measurement overflows — not
  because of anything specific to the branch itself. Fixed by giving
  `RenderTag` a `node_to_child` arm that claims it as a bare atom (and adding
  it to the block-run gate so runs containing one aren't skipped); a
  `RenderTag` in prose position still bails, deferring to the fill
  infrastructure from the `{@render …}`/`{format(...)}` fix (see the Cluster
  5 entry above). Surfaced a latent bug along the way: a whitespace-only
  element body (`<i> </i>`) was printing two spaces instead of prettier's
  single-space collapse; fixed alongside. Commit ddc55220 (PR #1696).
  Cleared `layercake/src/lib/layouts/ScaledSvg.svelte` and
  `layercake/src/lib/layouts/Svg.svelte`.
- **`<pre><code class="…">` open-tag hug, three-rule model (Cluster 1, 3
  ids).** Three rules confirmed by diffing a `printToDoc` dump against
  rsvelte's output: (a) a `<pre>` child's open `>` dangles onto its own line
  when its content is multi-line *or* its own open tag overflows the print
  width; (b) it re-hugs (glues `>` to the last attribute) only when the
  attributes themselves are forced to break across multiple lines; (c) when
  the `<pre>` element itself overflows, a breakable child element's own tag
  is preferred for breaking over the `<pre>`'s own attributes —
  `try_break_pre_own_attrs` now defers whenever a breakable child exists.
  Commits 7160ae13 and 8d04ff59 (PR #1696). Cleared
  `cmsaasstarter/.../blog/(posts)/awesome_post/+page.svelte`,
  `cmsaasstarter/.../blog/(posts)/example_blog_post/+page.svelte`, and
  `svelte-fa/src/routes/components/ui/docs-code.svelte`.
- **Cluster 5 — prose fill / text wrap (solved, last entries cleared).** A
  long mixed text run word-wrapped by the oracle's `fill` algorithm with
  `pair_fits` lookahead sometimes disagreed with rsvelte on the wrap point;
  the last two members of this cluster shared a multi-pass artifact. Collapse
  is a multi-pass post-process that re-parses its own intermediate output
  each pass: an earlier breaking pass hug-breaking an inline `<code>`/`<b>`
  sibling (dangling its close tag) pushes the following prose onto a fresh
  line in that pass's *intermediate* output, and the final children-port pass
  then re-parses that intermediate and has `split_text_to_docs` read the
  artifact newline as if it were a source line break — prepending a Hardline
  and flipping the prose fill to its inverted, last-word-overflow-tolerant
  form, so an overflowing word stays on the line instead of wrapping (the
  oracle, reading the original single space, wraps it). Fixed by threading
  the pre-collapse source text into the children-port pass via a thread-local
  map (intermediate text-node start → original text): `node_to_child` now
  classifies each text child's boundary whitespace from the original text
  when available. Collapse never changes non-whitespace content or node
  structure (a corruption guard enforces this), so intermediate and original
  trees normally align 1:1 on non-text nodes — but the map is built via a
  structural, signature-keyed lock-step walk (`node_signature_matches`: same
  AST variant, plus same tag/name for elements and components) rather than by
  raw position, so any single misalignment anywhere in a fragment falls that
  whole fragment's subtree back to classifying from the intermediate text
  instead of risking a wrong pairing. Four unit tests (the concrete repro
  shape, both sides of the alignment guard — matched and deliberately
  divergent — and a revert-confirms-the-failure check); 0 regressions across
  the 12,657-file corpus. Commits 5ffc4a34 and 5a9578e9. Cleared
  `svelte-ux/packages/svelte-ux/src/routes/+page.svelte` outright; the same
  fix also cleared the multi-pass half of
  `powertable/app/src/routes/examples/+layout.svelte`'s divergence (that id
  remains in the baseline, filed under Cluster 3, for an unrelated
  member-chain break-point issue — see Cluster 3). A related but
  non-flipping fix landed alongside it: the children port previously emitted
  a void HTML element (`<br />`, `<img … />`, `<input … />`) as a verbatim
  single-line atom, so one glued to the end of an overflowing prose line
  stayed on that line past the print width instead of the oracle's
  `group(['<', tag, indent(group([…attrs, dedent(line)])), '/>'])`, which
  dangles the `/>` onto its own line (`<br\n/>`) when the group breaks. Fixed
  via a new `build_void_element_doc` in `node_to_child` (also covering the
  no-attribute `<br />` case `build_self_closing_regular_doc` skips), with a
  flat-form guard that keeps the group only when it round-trips to the
  canonical `<tag … />`, so a void element that already fits stays
  byte-for-byte unchanged. Commit b8f88c05 — this alone flipped no id to PASS
  on its own, but combined with the whitespace-classification fix to fully
  clear the non-Cluster-3 portion of `powertable/.../+layout.svelte`'s
  divergence.
- **Prose expression/render tag breaks its call arguments in place (Cluster
  5, 2 ids).** A long call inside an expression/render tag in prose was
  treated as an atomic fill word, so rsvelte wrapped at the word boundary
  before it instead of breaking the call's arguments and gluing the next
  word to the `)}` line. A `printToDoc` dump showed prettier builds such a
  paragraph as fill + expression-tag concat + fill — the tag sits outside
  the fill with its own call-arguments group, so the fill never measures it.
  Element-body prose (`try_fill_mixed`) now represents multi-line content
  tags as a breakable flat/broken doc inside the run; all other call sites
  keep the atomic behavior. Cleared `layerchart/.../LineChart/
  perf-wide-data-processed.svelte` and `layerchart/.../docs/examples/
  +page.svelte`.
- **Block-header call expressions forced onto one line (Cluster 3, the
  `{#if long-call(…)}` variant).** prettier-plugin-svelte reprints block
  headers with `removeLines`, which keeps a group's baked `shouldBreak` — a
  `shouldExpandLastArg` call joins with inner spaces (`fn( a, b )`), every
  other call without them. rsvelte formatted the header at `LineWidth::MAX`,
  but oxc still expands hug-eligible-last-arg calls at MAX width, and the
  multi-line result skipped the single-line path entirely, splicing the raw
  expansion at the wrong indent. `collapse_block_header_expanded_call` folds
  the flat-args expanded form back (structural gate: fires only when oxc
  refuses flat at MAX width; curried `)(` inner lines bail). Resolved the
  Cluster 3 half of `stacked-zoom.svelte`.
- **Interpolation-led attribute value continuation double-indent (Cluster
  2's wrong-indent half).** The whole-value Doc model baked the absolute
  attribute indent into continuation lines, but the open-tag assembly
  re-indents interpolation-led values (`value="{…}"`) a second time —
  text-led values (`class="text {…}"`) are kept verbatim — so a wrapped
  interpolation's continuation landed at double the intended column
  (28+26=54). The model's base indent now matches `is_string_value_attr`'s
  split: absolute for text-led, relative for interpolation-led; break-point
  selection unchanged. Cleared `svelte-calendar/.../Popover.svelte` and the
  Cluster 2 half of `stacked-zoom.svelte` (completing that id's PASS), and
  resolved `PowerTable.svelte`'s `placeholder` half.
- **Template-position `as`/`satisfies` union kept flat (Cluster 6, union
  member).** oxc expands `x as A | B` to a leading-`|` multi-line union
  whenever the annotation breaks; the oxfmt oracle formats template
  expressions with prettier's estree printer, which keeps the union flat on
  the annotation line when it fits (`… as\n  A | B`) — a layout oxc reaches at
  no print width. Fixed template-side only, in `format_expr_core`
  (`crate::expression`): an AST gate (`oxc_ast_visit::Visit`) confirms the
  formatted program contains an `as`/`satisfies` node with a ≥2-member
  `TSUnionType`, then a structural pass collapses each broken union block —
  a line ending in the `as`/`satisfies` token directly followed by a run of
  same-indent `| ` member lines — back onto the annotation line when the flat
  form fits the (already depth-narrowed) budget. Blocks whose members span
  multiple lines, or whose flat form overflows, are left expanded (matching
  the oracle for long unions). `<script>` blocks are untouched — they format
  through the separate `format_program` path and agree with the oracle on
  oxc's leading-`|`. The proper upstream fix (a separate-group `as` layout in
  `oxc_formatter`) is unchanged as the eventual target. Cleared
  `svelte.dev/packages/site-kit/src/lib/search/SearchBox.svelte`.
- **Cluster 7 — multi-line attribute-value continuation reindent (solved,
  last entry cleared).** A `style:` value made of multiple interpolations
  where at least one wraps (two nested ternaries in `style:transform-origin`)
  took the whole-value re-indent path, which prepends the attribute indent to
  every line — but the literal whitespace *between* interpolations still
  carried its source indentation, so the second interpolation's opening line
  was double-indented. Prettier normalizes inter-interpolation whitespace to
  the attribute indent (verified empirically at several source indents).
  Fixed at the assembly site (`normalize_interpolation_value_indent`): a
  depth-0 newline's horizontal whitespace is stripped only when the next
  content is the next interpolation's `{`; literal-text lines keep their
  source indentation verbatim (an unconditional strip regressed melt-ui's
  `tree.svelte`, whose class value has tab-indented literal lines the oracle
  preserves). Not fixed in the shared `reindent` scanner, which treats `"` as
  a JS-string opener — adding markup brace-depth there would shift semantics
  shared with script/expression callers. Cleared
  `layerchart/.../Text/Text.html.svelte`.
- **Hugged content line's close tag excluded from width measurement.** When a
  multi-line open tag's hugged content line (`>{content}</tag`) overflowed,
  the Doc-IR reformat printed the body alone and string-glued `>` and
  `</tag` afterwards, so the printer's fits lookahead never charged the close
  tag's width — an inner `<Icon … />` whose attributes fit on their own but
  overflow once `</button` is appended never broke. Now printed as prettier's
  `group(['>', body, '</tag'])` (the same structure as the faithful port in
  `children.rs`) with the dangling `>` appended after; body columns are
  unchanged, so layouts that fit stay byte-identical. Cleared
  `layerchart/docs/.../playground/+page.svelte`.
- **`<pre>` embedded block-tag reindent.** Inside a literal `<pre>` whose body
  mixed raw text with a Svelte block tag (`{#if …}…{/if}` wrapping a `<code>`
  child), `reformat_pre_inner` regenerated the block tag's own indentation as
  tabs, on the assumption that oxfmt always preserves a `<pre>` body's
  element-direct whitespace as tabs. That assumption only held when the
  source itself indented with tabs — a space-indented `<pre>` body is kept
  verbatim as spaces by oxfmt, so regenerating its block-tag lines as tabs
  diverged. Fixed by gating tab regeneration on whether the `<pre>` body's
  source indentation actually uses tabs (`pre_uses_tabs`); a space-indented
  body now stays spaces throughout. Cleared `svelte-calendar/.../Code.svelte`
  and `svelte-calendar/.../JSONEditor.svelte`.
- **`<pre>` child close-dangle.** A `<code class={…}>text</code>` inside a
  `<pre>` whose own open tag is broken onto its own line kept its close tag
  glued (`</code>`) while the oracle dangles it (`</code\n>`), matching
  prettier's `shouldHugEnd`. Fixed by moving the close `>` onto its own line,
  one indent level shallower than the open tag's `>`, whenever the last
  content character is whitespace-sensitive text touching the close tag.
  Cleared `svelte-ux/.../Code.svelte` and `svelte-maplibre/.../CodeBlock.svelte`.
- **Empty `<textarea>` open-tag dangle is width-driven, not categorical.** An
  empty `<textarea …>` whose open tag wraps across lines glued its `>` to the
  last attribute line even when the oracle dangles it onto its own line.
  `<textarea>` is inline-block, so prettier's `shouldHugStart && shouldHugEnd`
  branch *can* dangle the `>` — but only when the glued last line
  (`{indent}{last attr}></textarea>`) would exceed the print width; when it
  fits, it stays glued. `<pre>` is a block element and always glues instead,
  so it is unaffected. Fixed by rendering the glued form, measuring its last
  line plus the `</textarea>` close width, and keeping the glued form only
  when that fits — dangling otherwise. Cleared `cmsaasstarter/.../
  contact_us/+page.svelte`.
- **Whole-value Doc model for attribute break-point selection.** The legacy
  per-interpolation width model counted a trailing interpolation as zero
  width, so it picked the wrong interpolation (or none) to break whenever a
  later interpolation could have absorbed the overflow. Replaced with a
  model matching prettier's own Doc structure: a regular attribute's literal
  text prints verbatim (not a `fill` — that's for element children, not
  attribute values), and each interpolation is a `group([RawExpr{flat,
  broken}])` measured through the whole remaining tail. This makes prettier's
  greedy, left-to-right break-point selection an *emergent* property of the
  engine's `fits` semantics rather than something hand-simulated: in Break
  mode, `fits` measuring a breakable group in the rest charges only its
  first broken line and short-circuits, so an earlier interpolation stays
  flat whenever a later one can break to absorb the overflow, and only
  breaks when everything up to the first later break point still overflows.
  Block-bodied breakable interpolations (object/array/arrow, or a call whose
  broken first line ends with `(`/`{`) still fall back to the legacy path; a
  computed member (`x[y]`) is allowed. `style:` directive values stay on the
  legacy path (see Cluster 2). Cleared `svar-core` calendar `Panel.svelte`,
  `layerchart/.../Chord/ticks.svelte`, `layerchart/.../Vector.base.svelte`,
  `svelte-splitpanes/.../Button.svelte`, and `layercake/.../AxisRadial.svelte`.

## Multiple clusters per id

Several ids carry divergences from two or more clusters at once, so fixing one
cluster alone leaves them failing: `powertable/.../PowerTable.svelte` needs
Cluster 1 (an open-tag hug) and a directive-value break decision
(`bind:checked={...}`, unrouted by the new model, same shape as Cluster 2's
un-routed `delete_account` case) in the same file — its former Cluster 2
`placeholder` wrong-indent half was resolved by the double-indent fix;
`svelte-ux/.../Gooey/+page.svelte` needs Cluster 1, Cluster 2 (a
`style:transform` directive value, un-routed, same legacy symptom as
AxisY/AxisYRight), and the since-resolved Cluster 5 together. `layerchart/.../Treemap/
stacked-zoom.svelte` used to sit here (Cluster 3 block-header + Cluster 2
wrong-indent) — both halves are now resolved and the id passes. Each id above is filed
under its dominant/first-encountered divergence. `svelte-ux/routes/+page.svelte`
used to belong on this list too (Cluster 5 plus a wrongly hug-broken `<Kbd>`
component) — widening the children port to convert Component children
resolved the `<Kbd>` half, leaving it a pure single-cluster (Cluster 5) entry,
which was itself a useful data point at the time: a fix aimed at one cluster
can silently collapse an entangled id down to a different, single-cluster
one instead of a straight PASS. That remaining Cluster 5 half is now also
resolved (see Resolved) and the id passes outright.
`powertable/app/src/routes/examples/+layout.svelte` followed the same
pattern from the opposite direction: it used to need Cluster 5 (the
multi-pass fill artifact) and Cluster 1 (a void-element `<br />` dangle)
together; both are now resolved by the same PR (see Resolved), leaving it a
pure single-cluster entry — but now filed under Cluster 3 for a residual
member-chain break-point divergence, rather than reaching PASS.
`layercake/_components/AxisRadial.svelte` used to
be on this list too (Cluster 2 plus Cluster 1); it's now fully resolved (see
Resolved), another instance of the same pattern.

One id improved without reaching PASS from that same fix, worth recording
even though it doesn't change the count: `svelte-ux/.../ApiDocs.svelte` (its
file has many `<Button>`/`<Tooltip>` component children; whichever of those
were previously unclaimed are now fixed, leaving only the unrelated Cluster 3
member-chain divergence visible in the diff). Its sibling from that same
component-child gap, `layerchart/LineChart/sparkline-within-a-paragraph.svelte`
(structurally identical to the now-fixed `BarChart/sparkbar-within-a-paragraph.svelte`),
did improve the same way but stayed on a genuine Cluster 5 divergence for a
while afterward — that divergence is since resolved too (see Resolved,
`splitTextToDocs` first-child parity, PR #1651), and the id now passes.

## Proven net-negative (do not re-attempt without a different mechanism)

- **Global fill "break-after-overflow"** (dropping `pair_fits`) — fixed 4 prose
  cases (Cluster 5) but caused 48 new failures; the oracle's fill is
  context-dependent and not hand-characterizable.
- **Const-initializer wrapper to drop Cluster-6 parens** — fixed 4 files but
  regressed ~50 (the wrapper's `+20` width compensation also inflates
  continuation-line budgets, collapsing multi-line objects the oracle breaks).
- **Blanket `ws_only_text_between_elements` relaxation** (attempted for
  Cluster 4) — **+0 fixed / −12 regressed**, and Cluster 4's own entries stay
  FAIL under it. Regressions included `layercake/.../Nav.svelte`, an id the
  narrow element-only `children.rs` gate had just fixed — actively fighting
  Cluster 1's work. Correct only for the specific hugged-sibling shape, not as
  a blanket rule.
- **hug-start suppression of `fragment_is_broken`** (Cluster 4, for
  `ContactButtonComponent`'s shape: a `<button>` with a hugged start and a
  whitespace end, where the oracle keeps `{a} {b}` inline) — as a blanket
  "first node is not whitespace-only text" test, **+1/−8** (the document root
  trivially satisfies it, suppressing all root-level breaking); as a properly
  threaded per-element `hug_start` parameter, it **does not terminate** — one
  corpus file ran 20+ minutes without finishing, because suppressing the break
  stops a later pass from reaching a fixed point. A real fix needs the hug
  state to reach the *layout* decision (the Doc/Fill path), not to
  short-circuit `effectively_broken`.
- **Narrowing `hug_glue_prefix` to `>` only** (letting `}` through): **+0/−1**,
  and it rescues zero ids. That gate blocks no fixable id.
- **Narrowing `try_children_port`'s `>`-prefix bail to `}`-only** (Cluster 1,
  targeting the 4-id `>`-prefix bail cluster: `svelte-ux/.../Collapse.svelte`,
  `cmsaasstarter/.../(marketing)/+page.svelte`,
  `svelte-ux/.../TextField/+page.svelte`,
  `layercake/routes/components/+page.svelte`) — **0 fixed / 1 regressed**
  (`shadcn` code-viewer), and the 4 targeted ids stayed unchanged or got
  worse. Matches the earlier `hug_glue_prefix` narrowing result: this cluster
  needs `children.rs`'s hug-boundary construction rebuilt, gate relaxation
  alone doesn't reach it. (The `TextField` and `layercake/routes/components`
  ids have since left the baseline via #1877, unrelated to this experiment;
  see Cluster 1.)
- **Relaxing `build_attrs_concat`'s multi-line-attribute bail**: rescues zero
  ids — for every id that hits it, the multi-line attribute is the *symptom*
  (their real divergences are Cluster 2 and the since-resolved Cluster 7),
  not the cause.
- **Estimating trailing-interpolation width** (Cluster 2) — fixed `svar-core`
  Panel but regressed `Legend`, `BarStack`, a `docs-[topic]` fixture, and
  `unused-selector-string-concat`.
- **Widening the whole-value Doc model's gate to single-interpolation +
  surrounding-text attributes** (targeting `cmsaasstarter/.../delete_account`
  specifically) — rerouted 9 files, regressed 6, fixed 0. The target itself
  stayed FAIL: its break-point choice is downstream of the same RawExpr
  narrow-width limitation the model can't yet solve (see Cluster 2), so
  routing it through the model doesn't help without also fixing that
  limitation. Reverted.
- **`splitTextToDocs` first-child parity for self-closing siblings (Cluster
  5).** Prettier's fill list shape for a text run depends on whether its
  leading whitespace was trimmed, which in turn depends on whether the text
  sits at its parent's first-child position: trimmed (first child) yields a
  word-first fill list where the overflowing word wraps; untrimmed (not
  first child) yields a hardline-first fill list where the last word before
  the boundary is allowed to overflow instead. `collapse.rs`'s
  `text_preceded_by_close_tag` recognized only a preceding `</tag>` as the
  not-first-child signal, so text immediately after a self-closing sibling
  (`<Code … />`) was misclassified as first-child and wrapped early instead
  of overflowing like the oracle. Fixed by also recognizing a `/>` prefix as
  a not-first-child signal. Three unit tests added; reverting the fix
  reproduces the test failures; 0 regressions across the 12,657-file corpus.
  Cleared `smelte/src/routes/index.svelte` and
  `layerchart/docs/.../LineChart/sparkline-within-a-paragraph.svelte`
  (commit 6d57221c, PR #1651).
- **`try_fill_run`'s single-text-node bail was over-eager (Cluster 5).** A
  `run.len()==1 && Text && !whole.contains('\n')` guard skipped reflow for
  any single-node text run, on the assumption (correct for a *mixed*,
  `run.len()>1` run) that such a run should stay flat. For a lone text node
  that had already passed the flat-fit check and still overflowed, prettier's
  fill always wraps it — the guard was blocking exactly the case it should
  have let through. This was reached whenever a preceding element-level bail
  (e.g. a block sibling forcing the mixed-fill path to give up) pushed a long
  prose run down to `try_fill_run` as a single node. Fixed by removing the
  guard (11 lines); unit tests added, reverting reproduces the failures, 0
  regressions across the corpus. This id was previously (mis)diagnosed as a
  children-port Component-child gap from its whole-file diff shape; the
  actual mechanism is the fill-layer bail above. Cleared
  `sveltestrap/src/Popover/Popover.stories.svelte` (commit d12da203, PR
  #1663).

## Methodology notes

- **Co-occurrence is not causation.** A first pass counted, per failing file,
  which port bail reasons appeared anywhere in that file, and ranked work by
  (failing ids) / (passing files at risk). Both top-ranked candidates by that
  ranking (`hug_glue_prefix` 5:32, `attrs_bail` 4:47) turned out to rescue
  **zero** ids. A causal harness (overlap of the bailing element's line range
  with the diff hunk's line range) reduced 15 co-occurring ids to 11 causal
  ones and changed which child kinds were implicated.
- **Causal is necessary but not sufficient.** Of 5 causal ids for a
  block-display fix, only 1 actually reached PASS: clearing a bail does not
  help if the element's layout then depends on another mechanism that is still
  missing (e.g. a multi-line open tag needing a dangling close). Expect
  attrition when estimating scope from causal counts. Two later, unrelated
  fixes (block-display `Child::Block` wiring, then Component-child
  conversion) added 9 more causal ids between them and landed only 2 further
  PASSes — a similar ~20% causal-to-PASS conversion rate, so treat that
  attrition ratio as the expected norm for this corpus, not a one-off.
- **`is_inline` gates hugging, not child classification — the two are
  different questions and the same word invites conflating them.** Prettier's
  own `isInlineElement`/`isBlockElement` both require `type ===
  'RegularElement'`, so a Component is neither — it is pushed as a bare
  `Child::Other`, unrelated to whether *its own* open tag is allowed to hug.
  `shouldHugStart`/`shouldHugEnd` only bail for block elements, and a
  Component is never one, so a Component's hug stays enabled regardless of
  its `Child` classification. Wiring a newly-converted node with `is_inline:
  false` (reading "inline" as "is this an inline *child*") gave +1/−12;
  `is_inline: true` (reading it correctly as "is this allowed to hug") gave
  +1/−0. Same lesson as the Cluster 4 vs. Cluster 5 "shared lever" trap above:
  two mechanisms that sound like the same axis rarely are.
- **Open one regression before calling a change net-negative.** The +1/−12
  result above, read at face value, looks exactly like the pattern this
  document already calls out as proven net-negative elsewhere. The only
  reason it didn't get filed there is that one of the 12 regressions was
  opened and diffed against the oracle before giving up, which is what
  surfaced the `is_inline` misreading and turned a net-negative attempt into
  a +1/−0 fix. A "many regressions" result is a prompt to open one and check
  it against the oracle, not a verdict on its own.
- **An id whose individual shapes all format correctly in isolation should
  first be checked for a whole-file pass bail, not assumed to be a
  pass-ordering / claim-suppression interaction between passes.** A prior
  hypothesis blamed exactly that (an element-claiming pass not recursing into
  an already-claimed ancestor) for a set of entries whose isolated shapes all
  reproduced cleanly on their own; instrumentation showed the suspected pass
  was never even invoked for those files. The real cause was a post-pass
  re-parsing its own output with `ParseOptions` missing a flag the main parse
  sets, so one unsupported construct anywhere in the file (a non-CSS
  `<style lang>`) made the re-parse fail and silently skipped the *entire*
  post-pass for the whole file. Isolation repros cannot see this class of bug
  by construction, since a minimal repro won't happen to include the
  unrelated construct that trips the whole-file bail.
- **Completeness-check lesson: when one pass consults an option/flag, check
  every sibling pass for the same consultation.** `prettier-ignore` was
  honoured by the indent/markup/expression passes but not by either collapse
  traversal (`collect` and `collect_children_port_only`), and it stayed
  invisible only because the port bailed on block-display children before
  reaching such content — once that bail was cleared, both traversals needed
  the guard; fixing only one left the gap. The same check separately found
  three `ParseOptions` construction sites in the `<pre>` sub-parse path
  diverging from the main parse, all now fixed. When the port's claim range
  widened again later (Component children), this was checked again and held:
  all 12 regressions from that change were hug-related, none from
  `prettier-ignore` — the guard is doing its job on both traversals. Still,
  it's exactly the kind of regression to check for first the next time the
  port's claim range widens.
- **A categorical-looking oracle behavior can secretly be width-driven —
  sweep the width axis before classifying it as binary.** An empty
  `<textarea>`'s wrapped-open-tag dangle looked categorical: every hand-picked
  repro and edge probe dangled the `>`. Wiring it as "always dangle when
  wrapped" passed those probes but regressed 6 new files (short-attribute
  empty textareas in flowbite, shadcn, svar-core, and svelte-ux) where the
  oracle glues instead. Re-characterizing by sweeping the glued last line's
  length from 40 to 76 columns (38/38 byte-exact against the oracle at every
  point) found the real rule: glue while the last line
  (`{indent}{last attr}></textarea>`) fits the print width, dangle only once
  it overflows. Two lessons stack here: (a) isolated repros passing is not
  the same signal as a full-gate run passing, again; (b) for any hug/dangle
  choice that looks like a two-way switch, sweep the width boundary before
  assuming it's categorical — a plausible "always X" story can be a "X below
  a threshold" story that just never got measured against the edge.
- **Element-category and hug/glue-within-the-category are two separate
  layers — don't conflate them.** Whether an element is even a hug
  *candidate* is categorical: prettier's `shouldHugStart` bails outright for
  block-display elements (`<pre>` always glues, never dangles), while
  inline-block elements like `<textarea>` remain hug candidates. But *within*
  that hug-candidate category, whether the candidate actually glues or
  dangles is not categorical — it's the print-width sweep above. Getting this
  two-layer structure backwards (treating the inner width decision as if it
  were the same kind of switch as the outer category bail) is what produced
  the width-driven-textarea surprise.
- **A structural-sounding explanation can be a misdiagnosis for a much
  simpler width-driven one.** A `style:transform="translate({a}px,
  calc(...))"` value breaking at the `px,` boundary looked like it needed
  CSS-aware breaking (recognizing `calc(...)` or the `px` unit as a
  structural boundary). It doesn't: the same shape with a *short*
  interpolation stays on one line even at 90 columns. The break is plain
  column-driven space-fill — a long interpolation pushes the following
  content past the print width, nothing CSS-specific about it. Don't reach
  for a domain-specific (CSS/JS-aware) explanation before checking whether a
  narrower, general mechanism (width) already accounts for the behavior.
- **Dump the oracle's own Doc, don't just probe its input/output.**
  `prettier.__debug.printToDoc` renders prettier-plugin-svelte's actual
  intermediate Doc tree for a given source. Two false assumptions about
  attribute-value formatting — that their text goes through the same `fill`
  element children use, and that a trailing interpolation is measured at its
  full flat width — were both resolved by one Doc dump, faster than any
  number of input/output-only probes could have narrowed them down.
- **A pre-formatted string can only ever have one width — that's a real
  architectural limit, not a tuning problem.** Representing an interpolation
  as `RawExpr{flat, broken}` (two pre-rendered strings chosen between by a
  group) works when the interpolation's ideal width doesn't depend on where
  it ends up printing. It breaks down when a nested subexpression needs its
  *own* full print-width budget at its actual indent (an outer binary
  operator might get a narrow budget while a nested `(a && b)` two levels in
  needs the full 80 columns from its own indent) — the pre-formatted string
  was narrowed once, uniformly, and can't un-narrow a piece of itself for a
  deeper context. This is a general limitation of the RawExpr representation,
  not specific to the shapes it was first found in: any interpolation with a
  sufficiently nested subexpression can hit it, regular attributes included.

## Cross-platform baseline rule (critical)

The committed baseline is the **Linux CI** failure set. Shrink it only from a
Linux `corpus-compat.yml` run (macOS `--update-baseline` drops
loose-declaration-tag entries Linux includes and breaks CI): read the
Formatter-parity job log for the "N known failures now PASS" count and per-id
NOTICEs, then remove exactly the confirmed-fixed ids.

### 2026-08-31 — one entry arrived by reclassification, not by regression

`shadcn-svelte/docs/src/lib/components/theme-customizer-code.svelte` (Cluster 20,
breaks-later) is the 789th entry, and it did not start failing: it had been
**excluded** from the comparison set since it was enrolled, so no run ever
compared it. Its exclusion reason claimed the oracle was platform-dependent
("collapsed on macOS, attribute-wrapped on Linux, so byte-parity is undefined").
Measured with the pinned oracle on macOS (`oxfmt@0.64.0`,
`fmt-corpus.oxfmtrc.json`, five consecutive runs, byte-identical) the oracle
emits the attribute-wrapped form at all 20 `<ColorIndicator>` sites — the form
the reason ascribes to Linux — so the two platform descriptions coincide and
nothing supports the claim. What is left is an ordinary line-break divergence
inside `<pre>`: the oracle wraps the component's attribute, rsvelte-fmt keeps
`<ColorIndicator color={value} />` on the line and breaks before `{value};`
instead. Full outputs and the controls are in `fmt-oracle-excluded.md`.

**Growing a shrink-only ratchet is legitimate here only because the pair was
never in the compared population.** The *Cross-platform baseline rule* above
governs shrinking, and it still does; this addition changes neither formatter,
and the accompanying commit touches no formatter code. The claim that the entry
fails on Linux is inferred from the oracle agreeing across the two platform
descriptions, not measured there — if the Formatter-parity job reports this id
as already passing, delete it from this ratchet rather than re-excluding it.

### 2026-08-31 — the formatter now normalizes line endings; 67 entries are ready to shrink

`rsvelte_formatter::format_with_arenas` rewrote spans in the source it was
handed, so every region it copies **verbatim** carried that source's line
endings through. Prettier normalizes `\r\n` / `\r` to `\n` before it parses, so
the oracle never can. Two regions were reachable — a comment body and a
whitespace-only `<style>` — and everything else (markup between tags, a
`<script>`, a non-empty `<style>`) was already normalized because the indent
pass rewrites those separators itself. That asymmetry is why the defect looked
like six unrelated clusters: **how loud it is depends on which region the file's
CRLF happens to land in, not on the defect.**

Measured on the 788 listed ids that have a source, staged and formatted with the
pinned oracle and `rsvelte-fmt` in directory mode:

| | ids |
|---|---|
| listed and diverging before | 788 |
| rsvelte keeps a CR the oracle does not | 76 |
| …of which the CR is the *only* difference | 63 |
| **now byte-equal to the oracle** | **67** |

The four beyond the 63 are ids where removing the CR also removed a second
difference that the CR was creating (a line the CR pushed past the print width).

**Blast radius, stated as a set rather than as a risk.** The normalizer returns
its input borrowed when the source holds no `\r`, so every source without one is
byte-identical by construction. Of the 33,776 component entries, **306** contain
a CR: 84 listed here, and **222 unlisted — all 222 still match the oracle**
after the change (they were re-formatted and compared, not assumed).

The 67 ids are **not removed from the JSON here**: the *Cross-platform baseline
rule* above binds this file to the Linux CI failure set, and this measurement is
macOS. Shrink them from the next Linux Formatter-parity run.

The regression tests are `crates/rsvelte_formatter/tests/line_endings.rs`, one
per region plus two controls, rather than a `pattern-corpus/` repro: convention 5
of that directory is *commit formatted files*, and a CRLF file is by definition
not the shape the oracle emits.

### 2026-08-31 — what the remaining entries are, by which printer owns them

The residue is classified by **region**, because the ratchet's own clusters
(`breaks-later`, `indent-only`, …) name the *symptom* and every target the
attribution contract accepts names a *printer*. Each diverging line's first
differing column is mapped to an offset in the oracle's output and tested against
the spans official's `parse({modern: true})` reports, so a file is labelled by
the set of regions its divergences fall in — `js` (a `<script>` body or a
template expression: oxc here, prettier there), `css` (`oxc_formatter_css` here,
PostCSS there), `markup` (Svelte structure, which both sides print with the
*same* intent).

Measured on the 721 that still diverge after the line-ending fix:

| region set | layout-only | characters differ |
|---|---|---|
| `js` only | 51 | 6 |
| `css` only | 13 | 1 |
| `js` + `markup` | 182 | 72 |
| `css` + `js` + `markup` | 114 | 52 |
| `css` + `markup` | 30 | 0 |
| `markup` only | 182 | 2 |
| oracle unparseable | 12 | 4 |

`layout-only` means the two outputs are byte-equal once all whitespace is
removed. Read the table by the two totals it implies: **71 files diverge only
where a different engine prints**, and **634 carry at least one `markup`
divergence**. The existing `deliberate-divergences` entry *The formatter's
JavaScript engine is oxc, not prettier* is about embedded JS and CSS, so it
reaches the 71 and not the 634 — and a `markup` divergence cannot be attributed
to a deliberate choice at all, because the same Svelte-structure printer is held
to the svelte.dev formatter gate, which has **no tolerance** and is green. Those
are defects to fix.

### 2026-08-31 — an element's edge whitespace: the predicate was already right, the branch was unreachable

`<RadioTile value="test"> <div>c</div> </RadioTile>` — the space either side of the
child is not significant inside a component, and the oracle drops it. rsvelte kept
it. The rule was measured rather than read: 45 parent tags × a `<span>` child, and
a 7×4 parent × child grid.

**The oracle's answer depends on the parent alone.** Block-display elements,
`<slot>` and components trim; inline elements (`span`, `a`, `b`, `button`,
`label`, `svg`, a custom element, …) keep. rsvelte already agreed on every
`RegularElement` in prettier-plugin-svelte's `blockElements` list and disagreed on
exactly three parents — a component, `<svelte:element>`, and `<slot>` — plus,
inconsistently, on a block parent whose child is *also* block, where it was
consulting the child's display as well.

rsvelte's predicate was already correct: `trims_edge_whitespace(tag) ||
is_component_tag(tag)` (`collapse/collect.rs`) is the same partition the oracle
uses. What was wrong is that `try_collapse` returns before reading it as soon as
any child is an element, so only a *pure-text* body was ever trimmed.

**Where the pass runs is not a detail: that whitespace is also the hug signal.**
`shouldHugStart` hugs only when the content touches the open tag, so a trim placed
*before* the layout passes makes both sides believe the content is adjacent and
changes the layout. The pass therefore runs **last**, after every breaking pass has
read the whitespace it needs. Two consequences worth stating: the trim only ever
deletes spaces and tabs, so it can neither remove a line break nor lengthen a line;
and it declines a fragment with two or more element children, where the element is
laid out broken and the oracle breaks its edges too.

Measured over the whole corpus with the two binaries, hashing all 33,776 component
outputs:

| | ids |
|---|---|
| output changed | 59 |
| …now byte-equal to the oracle (was not) | **48** |
| …**regressed** (was equal, now not) | **0** |
| …differ from the oracle before and after | 11 |

Regression tests: `crates/rsvelte_formatter/tests/edge_whitespace.rs`, four
trimming shapes and five controls (three inline parents, a newline-bearing edge, a
`<pre>`, and the two-child shape the pass declines).

As with the line-ending fix above, the ids are **not** removed from the JSON here —
the *Cross-platform baseline rule* binds this file to the Linux CI failure set.

### 2026-08-31 — the same trim, seven node types it never reached

The pass above was measured on *tags* and implemented on *node types*, and the two
are not the same partition. `is_component_tag` already answers `true` for every
`svelte:` prefix, so the predicate was right for `<svelte:fragment>` and its
siblings — but `trim_edge_target`'s `match` listed only `SvelteElement`
(`<svelte:element>`) and `SvelteComponent`, and the other seven `svelte:*` node
types fell to its `_ => None`. **A predicate keyed on a name cannot be reached by a
caller keyed on a variant**, and nothing in the first measurement could see the gap:
the 45-parent grid injected tags into one `RegularElement` slot.

Measured one tag at a time against the oracle, `<TAG> <b>c</b> </TAG>`:

| parent | oracle trims | rsvelte trimmed (before) |
|---|---|---|
| `svelte:fragment`, `svelte:head`, `svelte:boundary`, `svelte:body`, `svelte:window`, `svelte:document`, `svelte:self` | yes | **no** |
| `svelte:element`, `svelte:component`, `div`, `Comp` | yes | yes |
| `span` | no | no |

`<svelte:options>` is absent because both compilers reject content in it
(`svelte_meta_invalid_content`) — measured, not assumed.

Corpus differential over all 33,776 component outputs, base = the merge commit's
own binary (md5 identical to the tree built before this change):

| | ids |
|---|---|
| output changed | 24 |
| …now byte-equal to the oracle | **24** |
| …**regressed** | **0** |
| …still differ from the oracle | 0 |

Those 24 are exactly the residue's `intra-line-ws` × `markup` cell — 23
`<svelte:fragment slot="…">` and one `<svelte:head>`. Positive control: with the
seven arms removed, `every_svelte_special_element_drops_it` fails at
`<svelte:fragment>` and the other eight tests in the file stay green.

### 2026-08-31 — the axis the collected corpus cannot hold: an input where the reorder actually runs

`reorder_sections` hoists a `<script>` / `<style>` that sits between two markup
runs and rejoins them. The separator was a hardcoded `\n`, so a blank line after
`</script>` was lost. It is fixed, and the interesting part is the population.

**Published components write `<script>` first**, so on the 33,776 collected
components the hoist is a no-op or nearly so: the merge branch fires on **2** of
them and neither has a blank line at that gap. The corpus therefore scored
33,776 byte-identical outputs before and after the fix — the gate could not see
the defect at any corpus size, because *the axis is not "which repository" but
"does the reorder run at all"*. What reached it was a hand-written
`compatibility/pattern-corpus` file (`d129fd211`'s analyze repro, which happens to
put `<script>` after the markup) landing in the gate as one NEW entry.

Two consequences worth keeping. The deciding gap is the source's gap **after** the
section, and it has to be read off the *source*: by the time the reorder pass runs,
an earlier pass has normalised that gap in `out` to a blank line either way, so
`out` cannot answer the question. And the hand-written cases in
`blank_lines.rs` all opened their trailing markup run with an element — the corpus
entry opens it with a **comment**, which is why that exact input is now pinned as
`the_corpus_repro_leads_the_hoisted_script_with_a_comment`. Positive control:
hardcoding the separator back to `\n` turns that test red along with the six
others covering the same join.

### 2026-08-31 — a fill is a break OPPORTUNITY, and the cluster it was scoped against had four mechanisms

prettier prints a fragment's children as a **fill**: an inline space between two
children is a break opportunity taken only when the line would overflow. rsvelte's
indent pass took every one of them once the fragment was broken. Where the run can
be measured from the source — every non-whitespace child an `ExpressionTag`, whose
flat text is its own source slice — the width is now computed and the run stays on
one line when it fits.

The guard on that predicate is the load-bearing half. Upstream's `shouldHugStart`
is false when the first child is a text node opening with a line break, and it then
sets `noHugSeparatorStart = hardline` (`prettier-plugin-svelte/plugin.js:1218`),
which **breaks the enclosing group** — so under a non-hugged start every separator
breaks however well the run fits. Without the guard the first version of this fix
turned `<div>\n  {key} {a}\n</div>` and its `<span>` twin from MATCH to DIVERGE.
Both directions are pinned in `adjacent_expression_tags.rs`, and each ablation
kills exactly the test that names it: no-op the predicate and only
`a_hugged_run_separated_by_spaces_stays_on_one_line_when_it_fits` fails; delete the
`shouldHugStart` guard and only `a_run_under_a_non_hugged_start_breaks_at_every_space`
fails.

Corpus differential over all 33,776 component outputs, base = the same tree without
this change: **1 output moved, it moved to byte-equal with the oracle, 0 regressed**
(`svelte-table/example/example6/ContactButtonComponent.svelte`, a listed entry).
svelte.dev hard gate `1103/1103 pass, 0 fail, 0 unparseable`.

**The reach is the finding.** This work was scoped against a cluster measured at 84
files ("inline element content wrapping") and re-measured at 63 after the CRLF fix.
Re-run against the oracle on the current tree, **45 of those 63 already match** — the
list is a historical record, not an inventory — and the 18 that remain are not one
mechanism: 11 are a hugged-close inline element whose content keeps the source
indent, 3 are `<style>` body indentation, 2 a `<script type="application/ld+json">`
body, 2 a block body that keeps source tabs. **A cluster named from a symptom
(an indent delta) partitions by symptom, not by decision point.**

The sibling cluster was two *directed* sets — 3 files where the oracle keeps a
`} {` run flat and rsvelte breaks it, 34 where rsvelte keeps it flat and the oracle
breaks it. The fix moves **1 of the 3 and 0 of the 34**, which answers the open
question about whether they share a decision point: they do not. The mechanism says
the same thing independently — the predicate can only *permit* a flat run, never
force a break, so it structurally cannot reach the 34.

### 2026-08-31 — an element's width budget omits four of its possible children

Found while characterising those 34. `<strong><CHILD … /></strong>` at 90 columns
under `printWidth: 80`, one cell per child kind, oracle = oxfmt(`svelte: true`):

| child | oracle | rsvelte |
|---|---|---|
| `<div>`, `<em>`, `<Self>` | BROKEN | BROKEN (MATCH) |
| `<svelte:self>`, `<svelte:fragment>` | BROKEN | **FLAT** |
| `<svelte:component>`, `<svelte:element>` | BROKEN | BROKEN, but not the oracle's shape |

Every ordinary child kind matches; all four `svelte:*` kinds diverge, in the same
parent, with the same attributes. The controls move, so this is not a property of
the width itself: the same four tags **do** break their own attribute list when they
are the top-level node (measured, 6/6 MATCH), so what is missing is their
contribution to the *parent's* budget. This is the same shape as the
`trim_edge_target` gap recorded above — a `match` that enumerates
`RegularElement` / `Component` and lets the `svelte:*` variants fall to `_` — and
`build_open_attr_doc` (`collapse/doc_build.rs:685`) is one confirmed instance of the
pattern, not yet shown to be *the* cause. Unfixed; its corpus reach is unmeasured.

### 2026-08-31 — the over-width direction is 260 to 12, and the `svelte:*` sliver is 1

The `svelte:*` grid above says nothing about how much of the ratchet it reaches, so
that was measured separately. Per listed entry, count the output lines wider than
`printWidth` on each side and compare the two counts *within the file* (which
controls for a genuinely unbreakable long line, since it appears on both sides):

| | entries |
|---|---|
| rsvelte has MORE over-width lines than the oracle | **260** |
| the oracle has more than rsvelte | 12 |
| equal and non-zero | 323 |
| neither side over width | 53 |

788 listed, 648 of which still diverge on this tree. The direction is one-sided
21:1, which is the signature of a missing width check rather than of layout noise.
**33 of the 34 "rsvelte keeps a `} {` run flat" ids sit inside the 260**, so that
cluster is a subset of this one.

Two cautions on the number. It counts a *symptom* (an over-width line), not a
decision point — the section above is about exactly that mistake, and 260 is an
upper bound on however many mechanisms are inside it. And the `<svelte:` variant
that motivated the measurement reaches **1** entry, against 11 for `<div`, 36 for
`<span` and 126 for any tag: the first proxy tried — "the first differing line
mentions `svelte:`" — returned 13, and inspecting them showed the string was in the
surrounding *context* line in 12 of the 13. A substring hit near a divergence is not
a reach measurement.

### 2026-08-31 — the 260 partitioned, and the largest decision point in it is 54

Bucketed by the shape of the first over-width line rsvelte emits that the oracle
does not (`instruments/overwidth260.mjs`; the list is
`agent-c/overwidth260.json`):

| n | the over-width line starts with |
|---|---|
| 67 | script / style / prose text |
| 66 | a block header `{#…}` |
| 30 | an attribute |
| 28 | a hugged `>` line |
| 21 | an HTML open tag |
| 20 | an expression `{…}` |
| 15 | other |
| 6 | a component open tag |
| 5 | `{@…}` / `{:…}` / `{/…}` |
| 2 | a close tag |

The block-header bucket splits again by where the width goes: **9** where the
header expression itself is over width and the oracle breaks the expression, and
**54** where the header fits and the one-line *body* overflows. That 54 is the
largest single decision point found in the residue so far, and it reproduces in
three cells with two controls (oracle = oxfmt(`svelte: true`), `printWidth: 80`):

```
B1 {#if isSub}<div class="header-row"><slot … /></div>{/if}   DIVERGE
B3 {#each xs as x}…{/each}                                     DIVERGE   same shape
B4 {#key k}…{/key}                                             DIVERGE   same shape
B2 the same body, short enough to fit                          MATCH     control
B6 the same body, already broken in the source                 MATCH     control
```

The oracle keeps the block tags glued and breaks the *element's* content
(`{#if isSub}<div class="header-row">⏎    <slot … />⏎  </div>{/if}`); rsvelte
leaves the whole line flat. B6 matching is what rules out a source-layout
explanation.

**B5 is the discriminating cell.** With two arms
(`{#if a}<div …>…</div>{:else}<div …>…</div>{/if}`) rsvelte leaves the *first*
arm flat and breaks the *second* one's open tag — so a pass that can break this
shape exists and reaches one arm and not the other. Whatever gates it is a
position test, not a missing capability.

### 2026-08-31 — the 54 is one parameter: a block's closing tag is not in the width

Holding the body fixed and growing it one column at a time, the two formatters'
break thresholds can be read off directly. The oracle breaks at total 81 in every
form, which calibrates the instrument; rsvelte's threshold is late by **exactly the
length of the closing block tag**:

| form | closer | oracle breaks at | rsvelte breaks at | late by |
|---|---|---|---|---|
| `{#if a}…{/if}` | 5 | 81 | 86 | **5** |
| `{#key a}…{/key}` | 6 | 81 | 87 | **6** |
| `{#each a as b}…{/each}` | 7 | 81 | 88 | **7** |
| `<span>…</span>` | 7 | 81 | 81 | 0 |
| `<Wrap>…</Wrap>` | 7 | 81 | 81 | 0 |
| the element alone | — | 81 | 81 | 0 |
| the element + 7 characters of trailing text | — | 81 | 81 | 0 |
| the element + a trailing sibling element | — | 81 | 81 | 0 |

So it is not "trailing content on the line is ignored" — trailing text and a
trailing sibling are both counted. It is the block's `{/…}` specifically, and the
element parents are the controls that make that a claim rather than an
observation. An element's own close tag is inside its span; a block's is not.

50 of the 54 entries are a block header directly followed by an element (33 a
component, 17 an HTML element), and the remaining 4 are a text or nested-block
body, which the same rule predicts. Whether all 54 share this one parameter is
what the fix will measure — the id list is in `agent-c/overwidth260.json`.

The rule **composes**, which is the prediction that makes it a rule rather than a
fitted constant: a block nested in a block (`{#if a}{#if b}<el …/>{/if}{/if}`) is
late by **10**, exactly the two closers. Two body kinds are *not* covered and must
not be folded in — a bare expression body is late by 3, and a prose-text body never
breaks at all in the range measured while the oracle breaks at 86. Those are
separate constants, so "all 54 share one parameter" stays a prediction the fix will
test rather than a claim.

### 2026-08-31 — the fix, and what it measured: 33 of the 54, not 54

`push_open_tag` measures the open tag against the width from the element's leading
column; `open_tag_leading_indent` already accounts for a `{#if …}` *prefix* by
reading the element's source column, and nothing accounted for the `{/…}` *suffix*.
`trailing_block_close_width` adds it. Every threshold in the table above is now 0,
including the nested case, and the element controls did not move.

Corpus differential over all 33,776 component outputs, base = the same tree with
only this change reverted: **34 moved, 33 to byte-equal with the oracle, 0
regressed**, 1 moved without reaching equality. All 34 are inside the 54.

**So the 54 was not one decision point — 33 of it was.** The 21 that remain are not
a residue of the same rule; they are the same missing quantity in a *different*
pass, and the split is legible:

- a body element with **no attributes to wrap** (`{#if p.rating}<small><Star … /> ({p.rating})</small>{/if}`)
  must break by **hugging**, which is `collapse/hug.rs`, not the open-tag path;
- a body that is a bare expression (`{@render children(feature)}`) is the
  separately-measured constant of 3;
- two are `<pre>` content indentation, which is a different mechanism entirely.

That is the two-ports shape again: one upstream decision, two implementations here,
and fixing one leaves the other. The hug path is the next instalment.

**The first version of this fix regressed exactly one real file**, and no grid
predicted it: `svelte-ux/…/docs/components/Table/+page.svelte` writes
`</td>{/each}`, so the closer sits on the **close tag's** line, not the open tag's,
and charging it to the open tag broke a tag that fits. The guard is that the
element's own span must be single-line. Both halves have a positive control, and
the first attempt at each was **non-discriminating**: the `{#each}` test passed
under full ablation until its header was shortened so the element alone lands
exactly on 80 (a longer header breaks with or without the fix), and the
`</td>{/each}` test passed under guard ablation until the open tag was widened to
75 columns so the closer is what crosses the width. Neither was visible from the
assertion; both came out of running the ablation.

### 2026-08-31 — `rsvelte(oracle(S)) == oracle(S)` splits the residue without writing a fix

Byte parity needs `rsvelte(oracle(S)) == oracle(S)`: the oracle's output is already in the
oracle's own normal form, so a formatter that agrees with it must leave it alone. The condition
is necessary, not sufficient, and it costs one extra pass — which makes it a way to size a
defect class *before* anyone writes the fix. Measured over the listed ids on the tree at
`9cbb4148b` (`instruments/fixedpoint.mjs`):

| | ids |
|---|---|
| `rsvelte(S)` already equals `oracle(S)` | 173 |
| diverges, but `rsvelte(oracle(S)) == oracle(S)` | **66** |
| diverges on the oracle's own normal form | **549** |

The 66 are the ones whose divergence **cannot survive re-formatting**, so nothing about the
input's own content explains them — only its layout does. That is the fingerprint of a
source-range pipeline: `format_with_arenas` rewrites spans, so a decision that reads the
source's line breaks is reading an input prettier does not have (it parses and re-prints, and
its input's layout is gone by then). The CRLF defect recorded above is the same shape one level
down — a copied region carried the source's line *endings*; here a decision reads the source's
line *positions*.

**It is not the element-flatten decision.** That one was tested directly and is
source-independent: the same over-width element flat in the source and broken in the source
produce byte-identical rsvelte output (`instruments/widthgrid.mjs`, W1 vs W2), and the same
holds for an under-width element (W3 vs W4). So whatever reads the layout sits in a different
pass, and a fix aimed at the flatten decision would move none of the 66. Recorded before the
66 are worked so the next person does not re-derive the hypothesis the grid already killed.

Two cautions on the split. The 549 includes the 8 ids on which **the oracle is not its own
fixed point** (below), where "agrees with the oracle" is not well-defined at all, so 549 is an
upper bound on the layout-independent defects. And the buckets move as fixes land: the same
measurement read 139 / 66 / 575 + 8 before the two fixes above, and the 34 they moved went from
the third bucket to the first with the 66 unchanged — which is the control that the condition
is measuring the classes it claims to.

### 2026-08-31 — the hug path's guard, and a perfect grid worth one corpus file

The 21 the closer fix did not reach split by measurement, not by inspection. Growing the
body one column at a time inside `{#if r}…{/if}`:

| the body element's content | oracle breaks at | rsvelte breaks at |
|---|---|---|
| plain text only | 81 | 81 |
| an expression tag | 81 | 81 |
| text **and a nested element** | 81 | never, to ~147 columns |

Same position, same tags, only the content's *kind* varies — so this is reachability, not
width. `element_hug_parts` (`collapse/hug.rs:146`) refuses any content containing `<`, and
`try_hug_block_inline_body` is its only route for a block's body. The caller splices `content`
back verbatim, so a nested element in it is safe; the doc-building caller treats it as a text
run and still refuses, which is why the guard is now a parameter rather than deleted. Two
places in `doc_build.rs` already carry hand-rolled copies of "the same hug group without the
`contains('<')` guard" — the codebase had hit this wall twice before.

**The grid went from 3 diverging cells to 0 and the corpus moved one file.** That is the number
to keep: a minimal grid can be completed while the population it was drawn from barely moves,
because the real inputs are blocked further along. Do not size a class by the grid that
diagnoses it.

The 20 that remain are two shapes, and their offsets name themselves:

| shape | oracle | rsvelte | late by | what that equals |
|---|---|---|---|---|
| `{#if a}<Label … />{:else}{label}{/if}` | 81 | 100 | **19** | `{:else}{label}{/if}` exactly |
| `{#if a}<div class="…"><slot … /></div>{/if}` | 81 | 104 | **23** | `<slot name="a" />` + `</div>` exactly |
| the same with `<span>` (control) | 81 | 81 | 0 | — |

The first is `trailing_block_close_width` scanning only a run of `{/…}`: a block *arm* opens
with `{:`, and the whole remainder of the block follows it on that line. The second is a
block-display body, where the oracle emits the block-break form rather than a hug and rsvelte
measures the open tag alone — the content and the close tag are outside its budget. The
`<span>` control is what makes that a claim about block-display rather than about blocks.

### 2026-08-31 — the trailing-tag scan reads a closer only, and the arm is on the line too

`trailing_block_close_width` counted a run of `{/…}` after the element and nothing else, so
`{#if a}<Label … />{:else}{label}{/if}` was late by **19** — the exact width of
`{:else}{label}{/if}`. Reading any tag rather than only a closer fixes it, and the same one-line
change also fixes a shape that was never diagnosed: a plain sibling expression tag
(`{#if a}<Label … />{aVeryLongExpressionNameIndeedYes}{/if}`) was late by 34 on all four widths
probed, and now matches on all four.

The scan stops at the first thing that is **not** a tag, and that boundary is measured rather
than assumed. With a second element there (`{#if a}<Label … /><OtherComponent />{/if}`) the
oracle breaks the SECOND element and keeps the first flat at 26, 30 and 36 columns of
attribute — so charging that element's width to the first would move rsvelte in the wrong
direction. That trio diverges identically before and after the change, which is what makes it a
control rather than a regression.

Measured: the `{:else}` width grid goes 5 diverging cells → 0, the expression-tag grid 4 → 0,
the 33,776-file corpus differential moves **7 files, 3 to byte equality, 0 regressions**, and the
`overwidth260` cluster goes 34 → 37 matching.

### 2026-08-31 — where the layout-independent residue actually is

The 549 entries that satisfy `rsvelte(oracle(S)) != oracle(S)` were split by the SIGN of the
first differing line's width — the direction team-lead asked for, because "packs one more" and
"packs one fewer" are opposite defects that a count folds together:

| | count |
|---|---|
| later — rsvelte packs more onto the line | 328 |
| earlier — rsvelte packs fewer | 218 |
| same width, different text | 2 |

Crossed with the construct that starts the line, the largest single cell is **135 = later ×
attribute or CSS declaration**, and reading it names one shape: **the oracle breaks inside an
expression embedded in an attribute value and rsvelte does not**. Splitting `later` by where the
oracle's line ends gives 17 that break immediately after the `{` and **179 that break
mid-expression**; of those 179, **101** have a ternary arm (`?` / `:`) on rsvelte's next line.

Two reductions came out of that 101, and the second is the one that matters:

- A `style:` / `class:` directive whose value is a ternary keeps the test flat where a **plain
  attribute of the identical name length** breaks it exactly like the oracle (12 columns each,
  same expression, same indent; a plain attribute swept from 6 to 16 columns never diverges).
  That is the directive value's own narrowing path in `markup/directive.rs`. It is **6 of the
  101**.
- The dominant sub-shape is **78 of the 101**: an expression interpolated into a *quoted*
  attribute value whose literal prefix is already past the width. Six lines reproduce it, with
  three controls at MATCH — a short prefix, the same ternary as the whole unquoted value, and a
  long prefix with a non-ternary binary.

The reusable part is that the first reduction **drifted**: it is a real defect and a real
control, and it accounts for 6 of the population the grid was drawn from. A hand-built grid
finds the shape its author reached for; only classifying the whole cluster says which shape the
population is made of.

The code path for that 78 is located, and it is a policy rather than an oversight.
`render_value_sequence_doc` (`markup/value_sequence.rs:52`) — the Doc model that formats each
interpolation at its true running column — returns `None` when `interp_count < 2`, so a value
with exactly ONE interpolation falls to the legacy branch. That branch narrows by the
expression's start column only, and when the start-column form still fits it calls
`minimal_break_extra`, whose stated contract is *"force the MINIMAL break so only the
expression's top-level operator wraps, matching the oracle"*. For a ternary the top-level
operator is `?`/`:`, so the test is never re-measured — which is exactly the divergence. The
oracle instead formats the expression at the width actually left at its start column, and at a
start column past 80 that breaks the test too. Changing this is a change to that policy, not a
missing case, so it needs its own before/after id set.

### 2026-08-31 — a display:block body is the other half of the block-body rule, and one predicate hid it

`{#if a}<div class="…"><slot name="a" /></div>{/if}` stayed flat at 81 columns while the oracle
put the content on its own indented line. The `<span>` twin — identical position, identical
content, identical width — was already correct after the hug fix, which is the control that makes
this about **display** rather than about width; and with the class long enough that the open tag
itself breaks (60 columns) both sides agree, so the gap is exactly the interval where the open tag
fits and the whole line does not.

The reason nothing reached the decision is worth recording, because the first fix for it measured
**zero**. `element_hug_parts` guarded on
`is_block_display(tag) || is_inline_block(tag) || trims_edge_whitespace(tag)` — and
`trims_edge_whitespace` is *defined* as `is_block_display(tag) || matches!(tag, "slot" | "title" |
"svelte:boundary")`, so the first disjunct is redundant and bypassing it alone leaves the element
rejected by the third. Both binaries were built and run: the half-bypass is byte-identical to no
bypass at all on the whole grid. **A guard written as a disjunction can have one term subsume
another, and negating the term you were thinking of is then a no-op** — the two arms have to be
measured, not read.

Measured: the display × width grid goes 4 diverging cells → 0 with 14 controls unchanged, the
33,776-file corpus differential moves **5 files, all 5 to byte equality, 0 regressions**, and the
ablation moves exactly one of the three new tests.

The quoted-interpolation cluster is pinned before any fix touches it, so the count that moves
afterwards is the number of decision points rather than a guess. Classifying all 549 by whether
the first divergence sits at an interpolation **inside a quoted attribute value** — anchored on
the enclosing open tag so the quote parity does not depend on where the walk starts — gives
**104: 87 later and 17 earlier**, against 304 with no interpolation at the divergence at all, 132
with an interpolation outside a quoted value, and 7 with no anchor within 40 lines. A first,
deliberately cruder predicate (a fixed 12-line window) answered 106, so the number is not an
artefact of how the walk is anchored. **Both signs are in one cluster**: `{step.requires_id &&
!location.id` is the same budget with rsvelte breaking too early, so a fix measured only against
the `later` half would report half its own effect — and could move the `earlier` half the wrong
way without anyone seeing it.

### 2026-08-31 — the quoted-value interpolation cluster: 57 of the pinned 104, and a constant bracketed by its own regressions

The framing in the section above — that this needs a change to `minimal_break_extra`'s policy —
was wrong, and measuring it first is what showed that. `render_value_sequence_doc` already
formats every interpolation at its true running column; it just declined to run below two
interpolations. Letting a single-interpolation value through (`interp_count < 2` → `< 1`) reaches
the whole cluster, and the legacy path's policy is untouched — it simply stops being reached for
these values.

The second half is one column, and it was **bracketed, not derived**. That function's printer
measures at `line_width - 1` (reserving the closing `"`), while `broken_width` — which decides the
*shape* — used a bare `line_width - col`. Three binaries, three full-corpus differentials:

| reserved | moved | byte-identical | **regressed** |
|---|---|---|---|
| 0 columns (threshold alone) | 93 | 56 | **4** |
| 2 columns | 91 | 57 | **4**, a different four |
| **1 column** | 86 | **57** | **0** |

The two sets of four run in opposite directions. At 0 the oracle breaks at 79 and rsvelte emits
81 — under-breaking; at 2 the oracle's line lands on exactly 80 and rsvelte breaks earlier —
over-breaking. Measured on the real columns, one set requires the reservation to be at least 1 and
the other at most 1, so the integer is pinned from both sides by inputs that exist. Deriving it
from the printer's own arithmetic gives 2, which is the value the corpus rejects.

Against the id set pinned *before* the change, `match-oracle` goes **0 → 57 with 0 broken**, and
those 57 are exactly the corpus-wide fixes — the change has no effect outside the cluster it was
aimed at. The other 47 of the 104 are further decision points.

**The first boundary tests written for this measured nothing.** Both passed on all four binaries,
because the indentation was chosen by hand and put the first chunk off the boundary. Reduced again
at the two real files' real attribute indents (4 columns and 14), each fails on exactly one wrong
constant and on neither the right one nor the base. Two of the other four expectations were
transcribed wrong — a continuation indented by 2 where the oracle indents by 4, and single
quotes where an unquoted value keeps double — and the suite caught both, which is the whole
reason a test states the output rather than asserting that the output did not change. A boundary case is a property of the column
arithmetic, not of the shape — writing the shape and picking a plausible indent reproduces the
shape and not the boundary.

With that landed the layout-independent set stands at **490 of 549 diverging (59 now reproduce the
oracle's fixed point, up from 2)**, and its largest cell changes hands: `later × attribute/CSS`
drops 135 → 62 while `earlier × text/script` rises 120 → 133. The rise is not a regression — the
corpus differential recorded 0 — it is 15 units whose *first* divergence moved to a later line
once the earlier one was fixed, which is what a first-divergence key does by construction.

That new largest cell has a name already. Its members are continuation lines of a quoted value
with **two or more** interpolations, where the oracle keeps 68 columns and rsvelte breaks at 55 —
over-narrow. `col` in `render_value_sequence_doc` is the running *flat* column, so once an earlier
interpolation in the same value has broken, a later one's real column is much smaller than `col`
says and `broken_width` is far too tight. That is the next decision point, and it is the mirror of
the one just fixed: the same variable, wrong in the other direction, on the population the model
was already running on.

### 2026-08-31 — the mirror defect, pinned and reduced but NOT a one-liner

The cluster named above is pinned at **44 ids** (`agent-c/multi-interp-ids.json`) and reduces to
five lines of input at four indentation depths, all four diverging:

```svelte
<div class="step-badge {index <= currentStep ? 'bg-primary text-primary-content' : 'bg-base-200'} {step.requires_id && !location.id ? 'opacity-50 cursor-not-allowed' : ''} {index === 0 && isEditMode ? 'ring-2' : ''}"></div>
```

The oracle keeps `: 'bg-base-200'} {step.requires_id && !location.id` at 60 columns; rsvelte breaks
it at 47. The second interpolation's real column is about 27, because the first interpolation
above it has already broken — but `col` is the running **flat** column, so `broken_width` is
computed as if all of the first interpolation's text still sat on this line.

**The obvious fix does not work, and that is why this is recorded rather than attempted.** Resetting
`col` after a breakable part assumes that part breaks; the printer decides that per group, at print
time, and both outcomes occur. A shape built under the broken assumption is right exactly when the
earlier group breaks and too wide when it stays flat — the two cases need two different shapes from
one build-time computation. Doing this properly means the `broken` form becoming a function the
printer evaluates at the column it actually has, which is a change to `Doc::RawExpr`'s contract
rather than to an arithmetic expression. The 44 are pinned so that whoever takes it can count.
