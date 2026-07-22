# fmt-known-failures.json — why entries are accepted

The formatter-parity corpus formats every `.svelte` component with both
`rsvelte-fmt` and the `oxfmt(svelte:true)` oracle (prettier-plugin-svelte for the
Svelte structure + oxc for embedded JS/CSS — rsvelte-fmt's exact layering) and
requires **byte-identical** output. The ratchet may only shrink.

**Current baseline: 22 entries**, concentrated in real-world corpus repos
(layerchart, svelte-ux, layercake, cmsaasstarter, and a long tail). Oracle-bug /
invalid-input / migrate cases are NOT here — those are permanently excluded in
`fmt-oracle-excluded.json` (see `fmt-oracle-excluded.md`). Every entry here was
individually diffed against its oracle to confirm the cluster it belongs to;
none is a guess from file-name pattern-matching.

## Cluster 1 — close-tag-dangle / open-tag hugging for inline & void children (10)

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
component's attributes break where the oracle breaks them. The remaining 10
entries are the shapes those widening steps did not reach: an `<a>`/`<span>`
dangling-close that falls through to the compact fallback (3 ids —
`</div></a>`, a `<span>…</span>` pair, and an `<a>…</Blockquote` pair), an
`<a>` hug decision that breaks the wrong node (a wrapping
`{item.name || ...}` expression instead of the tag itself, 1 id),
`<pre><code class="…">` open-tag hugging in two different shapes (a raw pair,
2 ids, and a `<pre>` whose own attribute wrongly hug-breaks instead of its
`<code>` child, 1 id), an `{:else if}` branch picking the wrong side of a
title/element dangle (2 ids, same shape), and — in the opposite direction — a
short `<a>` kept compact by rsvelte that the oracle still breaks onto its own
lines (1 id, entangled with Clusters 2 and 5). Fix belongs in rsvelte —
continuing to widen the `children.rs` Doc-IR gate.

The remaining port-bail leaf causes are down to `RenderTag` (1 causal id, 95
files at risk) and `Other` (2 causal ids, 42 files at risk) — both too
low-yield relative to their blast radius to keep chasing (see the Methodology
notes on causal-to-PASS attrition), so further blind bail-hunting in
`children.rs` is paused for now.

## Cluster 2 — attribute/style/directive value break-point selection (4)

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

The RawExpr model has captured everything reachable within its architecture;
what remains needs printing-time nested-expression formatting. Fix belongs
in rsvelte — give each interpolation a *live* Doc subtree (formatted at its
real indent) instead of a pre-narrowed string, so a nested subexpression can
measure against its true column.

## Cluster 3 — embedded-JS member-chain / call-argument break-point divergence (3)

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

## Cluster 4 — inline `{expr} {expr}` hug/join collapse (1)

The mirror image of Cluster 1's hugging: adjacent expression-tag children
(`{key} {first} {last}`) are kept on one line by the oracle but split onto
separate lines by rsvelte (`svelte-table/example/example6/ContactButtonComponent.svelte`).
**This is not on the same lever as Cluster 1, nor as Cluster 5** — confirmed by
direct testing, not inference. Cluster 1's hug/dangle gate governs element
open/close-tag decisions, not bare `{expr}` siblings. Cluster 5's prose-fill
divergence is a width/lookahead disagreement *inside* a run that both sides
agree is fillable; here the Fill algorithm falls back to one-word-per-line
entirely where the oracle keeps the run joined. The leading (unconfirmed)
suspect is the prose-fill side-hug context — the Fill algorithm's decision of
which sibling a `{expr}` "word" is allowed to hug depends on surrounding
text/element context, not on bare adjacency — but the actual fix location is
unknown pending further investigation. Several targeted fixes were attempted
and are proven net-negative (see below).

## Cluster 5 — prose fill / text wrap (2)

A long mixed text run (plain prose, or prose interleaved with inline elements,
`{@render …}`/other call-bearing expression tags, or adjacent
attribute/directive values) is word-wrapped at the print width by the oracle's
`fill` algorithm with `pair_fits` lookahead, and rsvelte either wraps a word
early, fails to fill a block-child text run at all, or keeps a run compact
that the oracle wraps. (The "mis-attached trailing word after a multi-line
call inside an expression tag" symptom formerly listed here is resolved —
see Resolved.) Dropping `pair_fits` globally is
proven net-negative (fixed 4 prose cases, broke 48) — the oracle's fill is
genuinely context-dependent and not hand-characterizable without the full
lookahead algorithm. Fix belongs in rsvelte — the `Fill`/prose layout port.

Three entries were resolved by fixing two distinct bugs (see Resolved).
First, a `splitTextToDocs`-parity gap: whether a text run's leading
whitespace is trimmed depends on whether it sits at the parent's first-child
position. When trimmed (first child), prettier's fill list is word-first
(`[word, line, word, …]`) and the overflowing word wraps normally; when not
trimmed, the list is hardline-first (`[hardline, word, line, word, …]`),
which lets the last word before the line boundary overflow rather than wrap.
`collapse.rs`'s `text_preceded_by_close_tag` only recognized a preceding
`</tag>` as a not-first-child signal, so text right after a self-closing
sibling (`<Code … />`) was wrongly treated as first-child and wrapped early.
Second, an over-eager bail in `try_fill_run`: a `run.len()==1 && Text &&
!whole.contains('\n')` guard skipped reflow for single-text-node runs
entirely, even when the text overflowed the print width and had already
passed the flat-fit check — prettier's fill always wraps an overflowing
single-node run, so the guard's justifying example (a *mixed*, `run.len()>1`
run that stays flat at 86 columns) didn't actually license it. Removing the
11-line guard fixed `sveltestrap/.../Popover.stories.svelte`, whose prose
sits inside a `<Popover>` component with a block sibling (`<div
slot="title">`) — that block sibling makes the element-level mixed-fill path
bail, so the whole prose run reaches `try_fill_run` as a single text node,
where the guard was blocking it. (An earlier read of this id as a
children-port Component-child gap was a misdiagnosis from the whole-file
diff shape, not the true mechanism.)

This bucket is diagnosis-based, not mechanism-confirmed for every remaining
member:

- `svelte-ux/.../routes/+page.svelte` and `powertable/.../+layout.svelte` fail
  in the *opposite* direction: rsvelte's finalized fill carries a spurious
  extra leading hardline (`[hardline, "installs", …]`) where the oracle is
  word-first (`["installs", …, hardline]`), so rsvelte tolerates an overflow
  the oracle wraps. The mechanism is now confirmed as a multi-pass artifact:
  an earlier pass (indent/hug) hug-breaks an inline `<code>`/`<b>` sibling
  across multiple lines, which moves the following prose to the start of a
  new line in that pass's *intermediate* output; the children-port pass then
  re-derives the text's leading-whitespace classification from that
  intermediate output, sees what looks like a genuine line-starting newline,
  and (correctly, given that input) attaches a leading Hardline via
  `split_text_to_docs` — producing the inverted, overflow-tolerant fill. The
  oracle never sees this: it builds its fill directly from the *original*
  source, where the prose sits on the same line as the inline element, so it
  stays word-first. Fixing this needs the children-port's whitespace
  classification to distinguish a pass-introduced line break from a
  source-original one — a multi-pass architecture change, still high risk;
  left open.
- `layerchart/.../LineChart/perf-wide-data-processed.svelte` and
  `layerchart/.../docs/examples/+page.svelte` diverge on the trailing text
  *after* a multi-line expression tag (`{format(...)}` /
  `{@render scrollingValue(...)}`); each hits a different bail on the way to
  the same symptom. `perf-wide-data-processed.svelte`'s `{format(...)}` is
  already multi-line in the source and trips `build_children_doc_nodes`'s
  `if span.contains('\n') { return None }` bail, so the entire surrounding
  run is never reflowed. `routes/docs/examples/+page.svelte`'s `{@render
  scrollingValue(...)}` is instead emitted as an unbreakable verbatim Text
  atom, so it stays flat and overflows rather than breaking. The trailing
  text's own `split_text_to_docs(_, false, true)` call is confirmed correct
  — it already produces the oracle's inverted fill
  (`[line, "data", line, "points"]`, word-as-separator gluing the first
  trailing word to the `)}` line) when reached. Both ids need the same
  underlying infrastructure: a breakable Doc representation for expression
  tags (a `RawExpr{flat, broken}`-equivalent), the same direction as Cluster
  2's live-Doc-subtree work.

Re-diagnosing the remaining 4 with full corpus instrumentation (rather than a
diff read) would be needed before attempting further fixes.

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
**mode difference in oxfmt itself** — its svelte-embedded mode preserves a
multi-line function value's interior lines verbatim (1:1 tab→space mapping
of the source's uneven indents), while its standalone CSS mode (the only
mode rsvelte's dedent→format→reindent wrapper can use) parses the function
and normalizes the arguments to one canonical level. The comment-line
whitespace mix is a secondary rsvelte dedent artifact, but fixing it alone
cannot clear the entry while the mode difference remains. Unfixable in-repo;
a root fix would need oxfmt's standalone path to preserve multi-line
function-value interiors verbatim (high blast radius upstream). This is the
one entry in the baseline that is pure CSS formatting, not HTML/JS layout.

## Resolved

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
AxisY/AxisYRight), and Cluster 5 together. `layerchart/.../Treemap/
stacked-zoom.svelte` used to sit here (Cluster 3 block-header + Cluster 2
wrong-indent) — both halves are now resolved and the id passes. Each id above is filed
under its dominant/first-encountered divergence. `svelte-ux/routes/+page.svelte`
used to belong on this list too (Cluster 5 plus a wrongly hug-broken `<Kbd>`
component) — widening the children port to convert Component children
resolved the `<Kbd>` half, leaving it a pure single-cluster (Cluster 5) entry
now, which is itself a useful data point: a fix aimed at one cluster can
silently collapse an entangled id down to a different, single-cluster one
instead of a straight PASS. `layercake/_components/AxisRadial.svelte` used to
be on this list too (Cluster 2 plus Cluster 1); it's now fully resolved (see
Resolved), another instance of the same pattern.

Two ids improved without reaching PASS from that same fix, worth recording
even though they don't change the count: `layerchart/LineChart/
sparkline-within-a-paragraph.svelte` (structurally identical to the now-fixed
`BarChart/sparkbar-within-a-paragraph.svelte`, but a genuine Cluster 5
divergence remains once the component-child gap is no longer masking it), and
`svelte-ux/.../ApiDocs.svelte` (its file has many `<Button>`/`<Tooltip>`
component children; whichever of those were previously unclaimed are now
fixed, leaving only the unrelated Cluster 3 member-chain divergence visible in
the diff).

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
