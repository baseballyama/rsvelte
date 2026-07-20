# fmt-known-failures.json — why entries are accepted

The formatter-parity corpus formats every `.svelte` component with both
`rsvelte-fmt` and the `oxfmt(svelte:true)` oracle (prettier-plugin-svelte for the
Svelte structure + oxc for embedded JS/CSS — rsvelte-fmt's exact layering) and
requires **byte-identical** output. The ratchet may only shrink.

**Current baseline: 40 entries**, concentrated in real-world corpus repos
(layerchart, svelte-ux, layercake, cmsaasstarter, and a long tail). Oracle-bug /
invalid-input / migrate cases are NOT here — those are permanently excluded in
`fmt-oracle-excluded.json` (see `fmt-oracle-excluded.md`). Every entry here was
individually diffed against its oracle to confirm the cluster it belongs to;
none is a guess from file-name pattern-matching.

## Cluster 1 — close-tag-dangle / open-tag hugging for inline & void children (14)

The most common failure. Prettier prints whitespace-sensitive inline elements
(`<a>`, `<span>`, `<title>`, SVG `<path>`, a `<pre><code>` pair, small inline
components like `<Icon>`/`<Kbd>`) with a dangling close bracket — `</tag` +
softline + `>` — and hug-breaks a long open tag so its `>` (and the first
child) lands on its own line. rsvelte's `children.rs` port (`build_element_doc`)
has since been widened to cover element-only children runs, `{#if}`/`{#each}`/
`{#key}` flow-block children, whitespace-separated flow-block children, a
prose prefix immediately before a claimed element (`.<span …>`), and
Component children, and self-closing tags are printed correctly (no more
`<path … />` corrupted into `<path …></path>`). The remaining 14 entries are
the shapes those widening steps did not reach: runs of SVG `<path>` siblings
inside deeper nesting, `<pre><code class="…">` open-tag hugging, `<a>`/`<span>`/
`<title>` dangling-close and hug decisions that still fall through to the
compact fallback (or, in the opposite direction, get wrongly applied to a
short inline child/component that would fit compact), an `{:else if}` branch
picking the wrong side of a title/element dangle, and a long self-closing
component tag (`<Icon data={...} class="..." />`) that should hug-break its
attributes but doesn't. Fix belongs in rsvelte — continuing to widen the
`children.rs` Doc-IR gate.

The remaining port-bail leaf causes are down to `RenderTag` (1 causal id, 95
files at risk) and `Other` (2 causal ids, 42 files at risk) — both too
low-yield relative to their blast radius to keep chasing (see the Methodology
notes on causal-to-PASS attrition), so further blind bail-hunting in
`children.rs` is paused for now. The next-highest-signal shape instead is a
**multi-line open tag that should dangle its close but doesn't**: once an
attribute value breaks across several lines, the closing `>` should land on
its own line rather than staying flush against the last attribute line —
`svelte-ux/.../Code.svelte`'s `<code class={cls(...)}` and `cmsaasstarter/
.../contact_us/+page.svelte`'s `<textarea class="...">` both stop on exactly
this shape. `<textarea>` is whitespace-preserving and excluded from the
children port entirely, though, so it will need its own code path rather than
a widened gate.

## Cluster 2 — multi-interpolation break-point selection in attribute/style/directive values (9)

A quoted attribute, `style:`/`style=`, or directive (`bind:`) value with one or
more separate `{…}` interpolations overflows the line, and the oracle picks a
specific interpolation (and a specific point inside it — often a binary
operator) to break at, or wraps the whole value between the enclosing braces,
while rsvelte's per-interpolation width model picks a different interpolation,
a different point inside the right one, or fails to break at all where the
oracle does. An attempted fix (estimating trailing-interpolation width) fixed
one file (`svar-core` calendar `Panel.svelte` — still failing today for the
"doesn't break at all" variant of this same bug) but regressed four others
(`Legend`, `BarStack`, a `docs-[topic]` fixture, `unused-selector-string-concat`)
— reverted. Fix belongs in rsvelte — a whole-value Doc model for quoted
attribute/style/directive values (format the entire value as one Doc instead
of per-interpolation narrowing).

## Cluster 3 — embedded-JS member-chain / call-argument break-point divergence (5)

A single JS expression inside one interpolation (`a?.b?.c`, `a.b.c`,
`x ?? 'default'`, or a call like `isNodeVisible(a, b)`) needs to break, and
oxc's chosen break point differs from what the oracle emits in the same
context — e.g. the oracle breaks `session\n?.user?.email` (head, then rest)
where standalone oxc breaks `session?.user\n?.email`, the oracle keeps a
`{#if long-call(…)}` header on one line entirely where oxc breaks the call
arguments (and resets to the wrong indent depth relative to the surrounding
template), or a plain member chain (`$page.error.message`, `api.rest_props.name`)
breaks one property earlier or later than the oracle. One entry
(`svelte-form-builder/FormBuilder.svelte`) shows the same divergence repeated
many times inside one multi-line `style="…"` value, each `?.`/`??` chain
choosing a different break point than the oracle. This is oxc's member-chain /
call-argument merge heuristic disagreeing with the oracle's context, not a
width-narrowing problem. Fix belongs in `oxc_formatter` (member-chain and
call-argument printing).

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

## Multiple clusters per id

Several ids carry divergences from two or more clusters at once, so fixing one
cluster alone leaves them failing: `layercake/_components/AxisRadial.svelte`
needs both Cluster 2 (attribute break-point) and Cluster 1 (the tag's dangle
shifts once the attribute breaks correctly); `powertable/.../PowerTable.svelte`
needs Cluster 2 (two placeholder-attribute interpolations), Cluster 1 (an
open-tag hug), and Cluster 3 (a directive value's break decision) in the same
file; `svelte-ux/.../Gooey/+page.svelte` needs Cluster 1, Cluster 2, and
Cluster 5 together. Each id above is filed under its dominant/
first-encountered divergence. `svelte-ux/routes/+page.svelte` used to belong
on this list too (Cluster 5 plus a wrongly hug-broken `<Kbd>` component) —
widening the children port to convert Component children resolved the
`<Kbd>` half, leaving it a pure single-cluster (Cluster 5) entry now, which is
itself a useful data point: a fix aimed at one cluster can silently collapse
an entangled id down to a different, single-cluster one instead of a
straight PASS.

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

## Cross-platform baseline rule (critical)

The committed baseline is the **Linux CI** failure set. Shrink it only from a
Linux `corpus-compat.yml` run (macOS `--update-baseline` drops
loose-declaration-tag entries Linux includes and breaks CI): read the
Formatter-parity job log for the "N known failures now PASS" count and per-id
NOTICEs, then remove exactly the confirmed-fixed ids.
