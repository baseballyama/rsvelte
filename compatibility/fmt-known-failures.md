# fmt-known-failures.json — why entries are accepted

The formatter-parity corpus formats every `.svelte` component with both
`rsvelte-fmt` and the `oxfmt(svelte:true)` oracle (prettier-plugin-svelte for the
Svelte structure + oxc for embedded JS/CSS — rsvelte-fmt's exact layering) and
requires **byte-identical** output. The ratchet may only shrink.

**Current baseline: 32 entries**, concentrated in real-world corpus repos
(layerchart, svelte-ux, layercake, cmsaasstarter, and a long tail). Oracle-bug /
invalid-input / migrate cases are NOT here — those are permanently excluded in
`fmt-oracle-excluded.json` (see `fmt-oracle-excluded.md`). Every entry here was
individually diffed against its oracle to confirm the cluster it belongs to;
none is a guess from file-name pattern-matching.

## Cluster 1 — close-tag-dangle / open-tag hugging for inline & void children (11)

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
last line would overflow the print width. The remaining 11 entries are the
shapes those widening steps did not reach: an `<a>`/`<span>` dangling-close
that falls through to the compact fallback (3 ids — `</div></a>`, a
`<span>…</span>` pair, and an `<a>…</Blockquote` pair), an `<a>` hug decision
that breaks the wrong node (a wrapping `{item.name || ...}` expression
instead of the tag itself, 1 id), `<pre><code class="…">` open-tag hugging in
two different shapes (a raw pair, 2 ids, and a `<pre>` whose own attribute
wrongly hug-breaks instead of its `<code>` child, 1 id), an `{:else if}`
branch picking the wrong side of a title/element dangle (2 ids, same shape),
a long self-closing component tag (`<Icon data={...} class="..." />`) that
should hug-break its attributes but doesn't (1 id), and — in the opposite
direction — a short `<a>` kept compact by rsvelte that the oracle still
breaks onto its own lines (1 id, entangled with Clusters 2 and 5). Fix
belongs in rsvelte — continuing to widen the `children.rs` Doc-IR gate.

The remaining port-bail leaf causes are down to `RenderTag` (1 causal id, 95
files at risk) and `Other` (2 causal ids, 42 files at risk) — both too
low-yield relative to their blast radius to keep chasing (see the Methodology
notes on causal-to-PASS attrition), so further blind bail-hunting in
`children.rs` is paused for now.

## Cluster 2 — attribute/style/directive value break-point selection (5)

A quoted attribute or directive value with one or more `{…}` interpolations
overflows the line, and the oracle's break-point choice differs from
rsvelte's. Most of this cluster's former members are now handled by a
whole-value Doc model (see Resolved): the value's literal text prints
verbatim, and each interpolation is a `group([RawExpr{flat, broken}])` whose
break decision is measured through the *whole remaining tail* — not just its
own width — reproducing prettier's own greedy, left-to-right break-point
choice. The 5 remaining ids split into two distinct blockers:

`style:` **directive** values are not yet routed through that model — their
text is a real `fill` structure in the oracle (unlike a regular attribute's
verbatim text), a deliberately different shape the new model doesn't cover
yet — so `layercake/.../AxisY.percent-range.html.svelte` and
`AxisYRight.percent-range.html.svelte` still show the original symptom:
trailing interpolations are counted at zero absorbed width, so the model
breaks an earlier interpolation the oracle keeps flat inside a deeply nested
`calc(...)` expression.

The rest sit on the new model's own remaining limitation. `RawExpr` is a
*pre-formatted, uniformly-narrowed string* — it cannot give an interior
subexpression the full, indent-position-correct budget it would get if
formatted live at its actual column. `powertable/.../PowerTable.svelte`'s
`placeholder` attribute and `svelte-calendar/.../Popover.svelte`'s `style=`
attribute now select the *same* break point as the oracle — the new model
genuinely improved them — but the continuation line lands at the wrong
indent, because the narrowed pre-format doesn't know the column it will
eventually print at. `cmsaasstarter/.../delete_account/+page.svelte`'s
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

## Cluster 3 — embedded-JS member-chain / call-argument break-point divergence (4)

A single JS expression inside one interpolation (`a.b.c`, `x ?? 'default'`,
or a call like `isNodeVisible(a, b)`) needs to break, and oxc's chosen break
point differs from what the oracle emits in the same context — e.g. a plain
member chain (`$page.error.message`, `api.rest_props.name`) breaks one
property earlier/later or one level deeper than the oracle, or the oracle
keeps a `{#if long-call(…)}` header on one line entirely where oxc breaks the
call arguments (and resets to the wrong indent depth relative to the
surrounding template). One entry (`svelte-form-builder/FormBuilder.svelte`)
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

## Cluster 5 — prose fill / text wrap (7)

A long mixed text run (plain prose, or prose interleaved with inline elements,
`{@render …}`/other call-bearing expression tags, or adjacent
attribute/directive values) is word-wrapped at the print width by the oracle's
`fill` algorithm with `pair_fits` lookahead, and rsvelte either wraps a word
early, fails to fill a block-child text run at all, mis-attaches a trailing
word to the wrong line after a multi-line call inside an expression tag, or
keeps a run compact that the oracle wraps. Dropping `pair_fits` globally is
proven net-negative (fixed 4 prose cases, broke 48) — the oracle's fill is
genuinely context-dependent and not hand-characterizable without the full
lookahead algorithm. Fix belongs in rsvelte — the `Fill`/prose layout port.

This bucket is diagnosis-based, not mechanism-confirmed for every member: one
former member (`layerchart` `BarChart/sparkbar-within-a-paragraph.svelte`) sat
here purely because its whole-file diff looked like a prose-wrap mismatch,
until widening the children port to convert Component children (an unrelated,
Cluster-1-adjacent fix) made it pass outright — the "prose" diff was actually
downstream of an unclaimed Component child. Its sibling file
(`LineChart/sparkline-within-a-paragraph.svelte`, same paragraph-plus-component
shape) improved from the same fix but still fails on a genuine residual
word-wrap divergence, confirming that shape can carry both a port gap and a
real Cluster 5 issue at once. Whether the remaining 7 are all pure fill
problems is unconfirmed — re-diagnosing them needs a corpus run, not a diff
read, and is not required to finish this baseline update.

## Cluster 6 — oxc paren / type-annotation divergence (2)

The oracle's prettier-plugin-svelte layer omits parens or type-annotation
formatting that oxc's `NeedsParentheses` / union-type printer adds: `{@const
y = a = item.n}` stays unparenthesized in the oracle but oxc parenthesizes the
inner assignment (`(a = item.n)`); a `… as HTMLElement | undefined` union stays
on one line in the oracle but oxc expands it to a leading-`|` multi-line union.
String-surgery paren/type stripping is forbidden by project rule. Fix belongs
in `oxc_formatter` (expression-position parens, union-type layout).

## Cluster 7 — multi-line attribute-value continuation reindent (1)

A `style:`/`style=` value that spans multiple raw-text lines *and* contains a
broken multi-line expression (a nested ternary) on the same value needs
brace-depth-aware per-line reindent; the current logic only handles the
all-verbatim case, so a continuation line that should track the ternary's
indent instead gets double-indented against the raw-text depth. Fix belongs in
rsvelte — `render_attribute_value_sequence`; tractable but deferred, since it
touches the same brace-depth-aware reindent machinery as the (now-resolved)
`<pre>` block-tag reindent fix below.

## Cluster 8 — CSS declaration reindent, native engine (1)

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

## Resolved

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
Cluster 2 (a `placeholder` attribute now break-point-correct but wrong-indent
under the new attribute-value Doc model), Cluster 1 (an open-tag hug), and a
directive-value break decision (`bind:checked={...}`, unrouted by the new
model, same shape as Cluster 2's un-routed `delete_account` case) in the same
file; `svelte-ux/.../Gooey/+page.svelte` needs Cluster 1, Cluster 2 (a
`style:transform` directive value, un-routed, same legacy symptom as
AxisY/AxisYRight), and Cluster 5 together; `layerchart/.../Treemap/
stacked-zoom.svelte` needs Cluster 3 (its dominant `{#if isNodeVisible(…)}`
header divergence) and now also Cluster 2 (a `value=` attribute that broke at
the oracle's exact point but landed at the wrong indent — the new model
reaching a file whose primary failure is elsewhere). Each id above is filed
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
  (their real divergences are Cluster 2 and Cluster 7), not the cause.
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
