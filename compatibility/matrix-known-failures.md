# Generated shape matrix — known failures

Ratchet for `scripts/compat-corpus/matrix/run.mjs` (#2281 Gate 2). Shrink-only and
two-sided: a new divergence fails CI, and so does a listed entry that already passes, so
the PR that fixes entries re-baselines in the same PR
(`node scripts/compat-corpus/matrix/run.mjs --update-baseline`).

## Why this gate exists

The collected corpus samples the **marginal** distribution of published Svelte code. Every
bug in the #2253/#2254/#2255/#2256 batch was an **interaction** — a binding kind × a
syntactic position, or a construct × a comment slot — and a found corpus under-samples
interactions exponentially:

| shape | occurrences in the 14,026-entry corpus |
|---|---|
| #2254 — `{#each … as X}` item as a `switch` discriminant | 0 |
| #2253 — `#private` `$state` assigned from a literal containing a `//` comment | 0 |
| #2256 — `svelte-ignore` before an object-literal property | 6 |

`client` and `server` were at **0 known failures** — saturated — when all four were
reported. Growing the corpus from 14k to 140k real files moves those counts from 0 to
approximately 0. Generating the product moves them to whatever the product contains.

## Scope of what a listed entry means

Normalization here is identical to `verify.mjs` (flatten template holes → oxfmt → strip
blank lines), so formatting-only differences are tolerated exactly as the corpus gate
tolerates them. An entry is a divergence that survives that.

The **verdict is part of the key**, and these can appear: `js-mismatch` (the
difference survives comment + whitespace normalization), `comment-mismatch` (it does not),
`output-unparseable` (acorn rejects what rsvelte emitted, whatever the bytes say),
`warning-missing:<code>` / `warning-extra:<code>`, `over-accept` (rsvelte compiles a
program official rejects) and `over-reject` (the reverse), and
`error-code-mismatch:<official>-vs-<rsvelte>` (both reject, with different codes).
None of them is more tolerated than another — every one is ratcheted two-sided. The
split exists because a listed entry suppresses everything its key cannot tell apart: under
one flat `js-mismatch`, an id whose comments already diverge absorbs a later code
regression on that id for free. That is not hypothetical — when the split was added, every
comment carrier in `opaque-keyword` diverged on comment placement (#2990), so re-breaking
#2986 would have reproduced an already-listed key on the very cases written to catch it.
Those entries are gone now, which is what the split was for: the family clears rather than
carrying a key that would absorb the next regression.

## Matrix known failures (`matrix-known-failures.json`, 248 entries)

Partition of `matrix-known-failures.json` by family: `0 + 84 + 0 + 24 + 0 + 0 + 0 + 140 + 0 + 0 + 0 + 0 + 0 + 0`

### `binding-position` — 0 entries

The upstream fix landed. `submodules/svelte/.../3-transform/server/visitors/LabeledStatement.js`
used to return early for a non-`$` label **without calling `context.next()`**, so zimmerframe
never descended into the labeled subtree and, since `$.derived()` returns a function in
`svelte/internal/server`, upstream emitted `if (doubled)` — always truthy — where every
other position emitted `doubled()`. Store auto-subscriptions inside a labeled body were
mis-emitted the same way. Svelte 5.56.10 adds the `context.next()` call at that guard, which
is what these four entries (`derived-local` and `store-auto-sub`, `label.body`, on `server`
and `server-dev`) were waiting for, so the submodule bump cleared them.

The rest of the family (7 bindings × 47 positions × 3 targets, minus these) passes. It is
the axis that found #2254 plus `SwitchCase.test`, class-expression field initializers and
class-expression computed method keys, all fixed in #2269.

### `comment-slot` — 84 entries

All remaining entries are `.svelte` template seeds. The `.svelte.(js|ts)` module-path
cluster is now empty: location-less Programs discard their top-level and EOF comments while
located nested bodies can still resynchronize the cursor, matching esrap.

The current partition by target is `26 + 26 + 8 + 24` for `client`, `client-dev`,
`server`, and `server-dev`. By seed:

| seed | entries |
|---|---:|
| `await-block` | 16 |
| `class-private-state` | 8 |
| `class-static-block` | 8 |
| `const-fold-line-continuation` | 8 |
| `legacy-reactive` | 20 |
| `module-script` | 24 |

All 84 are `comment-mismatch`: comparing normalized non-comment lines finds no
codegen-semantic divergence in this cluster. A comment is the one token that may appear
between any two other tokens, so the matrix crosses eight comment kinds with every line
boundary instead of relying on published-code frequency.

Partition of `matrix-known-failures.json` entries under `comment-slot/` by what diverges: `84`

Partition of `matrix-known-failures.json` entries under `comment-slot/` by seed: `16 + 8 + 8 + 8 + 20 + 24`

The location-less cursor port clears 144 entries without adding a failure: all 96 trailing
module-path rows (`module-class-state`, `module-rune-exports`, and
`module-ts-extension`, eight kinds × four targets each), plus 48 leading `<script module>`
rows on `server` and `server-dev`. The latter needed the generated component body to inherit
the instance-script region while the outer Program remained location-less.

`module-script`'s 24 are unchanged in cause by #3005, and their slots moved
(`L07`/`L11` → `L18`/`L22`) because the seed grew the bodies that make the cursor observable:
a rune class, a static block and a bare block, each followed by a slot outside the body it
revived from. Those new slots all pass; what still diverges is only the two `</script>` slots,
where upstream attaches a comment sitting at the very end of a script region to the generated
component function's parameter list. The seed before it could not have failed for the #3005
reason — every slot in it was one where the real cursor rule and the body-span rule agree.

### `each-collection` — 0 entries

Every collection shape now matches across all targets.

Partition of `matrix-known-failures.json` entries under `each-collection/` by collection: `0`

### `keyword-regex` — 24 entries

Not the family's own axis, and not its author's doing: these appear because this PR added
warning-**code** comparison to the gate, and `keyword-regex` is the one pre-existing family whose
inputs reach a warning. All 18 are one cause on all three targets —
`perf_avoid_nested_class` never fires for a `class` declared inside a legacy `$:` reactive
statement. The six cases are the `extends` row against every host and body that puts the class
there (`legacy-reactive`, `legacy-reactive-block`, and the four `body-*` rows, which run against
`legacy-reactive` by construction).

Partition of `matrix-known-failures.json` entries under `keyword-regex/` by target: `6 + 6 + 6 + 6`

Worth stating because it is the generalization argument for the comparison: a family written for
a *parser* question, by another author, with no warning intent, contributes 60 warned (case,
target) pairs and 18 divergences. The comparison earns its place on populations nobody built for
it.

### `param-pattern` — 0 entries

Parameter defaults and computed keys now contribute their enclosing reactive dependencies.

Partition of `matrix-known-failures.json` entries under `param-pattern/` by shape: `0`

### `directive-element` — 0 entries

All 1,976 generated comparisons now match across every directive, special-element host, mode,
and target.

Partition of `matrix-known-failures.json` entries under `directive-element/` by verdict and host: `0`

### `bind-setter` — 0 entries

All 189 generated comparisons now match. #2484's three special-element dev setter cases are
covered by the direct regression tests as well as this zero-residue matrix family.
### `removed-statement-comment` — 140 entries

The family crosses statements the SERVER transform removes (`$effect`, `$effect.pre`,
`$effect.root`, `$inspect`) with the comment slot (leading / interior / trailing), 6 comment
kinds, 3 hosts (`compileModule`, the instance script's top level, one function deep) and
whether a statement survives after the removed one. 396 cases, 1188 comparisons; the fix that
landed with it cleared 79 of them (403 → 324, all on `server`).

Every remaining entry is in one of the clusters below.

| entries | target | cluster | issue |
|---|---|---|---|
| 54 | `server-dev` | `$effect` / `$effect.pre` / `$effect.root` × `instance-top` × `succ-none` | [#2716](https://github.com/baseballyama/rsvelte/issues/2716) |
| 86 | `client`, `server`, `server-dev` | `$inspect` across `instance-top`, `instance-fn`, and `module` tails | [#2716](https://github.com/baseballyama/rsvelte/issues/2716) |
Partition of `matrix-known-failures.json` entries under `removed-statement-comment/` by
cluster: `54 + 86`

**[D].** It was reduced to a hand-written repro outside the family and measured against the
pinned official compiler.

Note the enrolment cost, because it is real: a ratchet entry suppresses everything about the
entry it lists, so these 140 ids are now blind to any *further* regression on the same shapes
until their issues are fixed.

---

### `async-derived` — 0 entries

Partition of `matrix-known-failures.json` entries under `async-derived/` by cause: `0`

### `async-attribute-slot` — 0 entries

10 value shapes × 6 attribute slots × 4 hosts = 200 cases / 792 comparisons. The subject is
which lowering an async attribute value reaches: `Memoizer` hoists a call or an `await` out
of the `template_effect` arrow into its `sync`/`async` argument and passes the
top-level-await `blockers` as the fourth, but
`build_custom_element_attribute_update_assignment` builds its own one-argument
`$.template_effect(b.thunk(call))` — so the same value is lowered two different ways
depending only on whether the tag name has a dash. Neither `directive-element` (which varies
the directive, not the value) nor `async-derived` (which varies the declaration, not where
it is read) crosses that pair.

The family reported **310** divergences on its first run. #3621's fix — the client `style`
attribute value, whose memoizer call hardcoded `has_await: false` in all three arms of
`build_style_attribute_value_with_memoization` — clears 28 of them (16 `output-unparseable`
+ 12 `js-mismatch`, both hosts × all four literal-`await` values × `client`/`client-dev`)
with zero regressions elsewhere in the matrix's 25,836 comparisons. #3649 then cleared the
38 client rows where a non-tail `await` was not pickled through `$.save`. #3764 routed server
attribute and directive values through the per-host promise optimiser; its object-expression
await scan also covers spread values and distinguishes a nested async-IIFE await. That clears
the remaining 230 server rows. #3650 cleared the final four client rows by giving
`<svelte:element>` its own memoizer and passing its parameters into the element-local
`template_effect`. The generated arrow now binds the `$0` used by a `class:` directive,
including the `derived-await-read` and `script-await-read` shapes.

Partition of `matrix-known-failures.json` entries under `async-attribute-slot/` by cause: `0`

**Four cases are narrowed to the server targets** (`custom-element` × `attribute` × a value
carrying a literal `await`). Under the pinned oracle that cell compiles — on *both*
compilers alike — to `await` inside a non-async arrow, which is not JavaScript, so there is
no client oracle to compare against; `run.mjs` aborts the run on an official output the
parse oracle rejects rather than turning it into an entry. This is the same
`targets:`-narrowing `private-field` uses and for the same stated reason. The server
lowering of those four is unaffected and still compared. Upstream fixed that slot in
5.56.10 by giving `build_custom_element_attribute_update_assignment` a `Memoizer`, and the
family is calibrated against it: compiled with `svelte@5.56.10` instead of the pin, **8
currently-matching rows move** — `custom-element/attribute` × `{call, async-iife,
derived-await-read, script-await-read}` × `{client, client-dev}`. Two of those four values
carry no `await` (`call` is the shape the `dynamic-attributes-casing` snapshot pins), which
is why the value axis carries sync rows at all. The submodule bump therefore cannot land
with that port missing: these rows report it. See
[#3621](https://github.com/baseballyama/rsvelte/issues/3621).

### `constant-fold` — 0 entries

The final eight rows were not folding divergences but `{@render}` memoization divergences:
four pure call expressions × `client` / `client-dev`. The transform now consumes Phase 2's
`has_call` metadata, which already applies upstream's purity and dependency rules, instead
of a second syntax-only walk that treated every call as impure. Pure arguments remain inline;
impure and reactive calls retain their existing memoization.

### `fold-value-type` — 0 entries

All 936 generated comparisons match on `client`, `client-dev` and `server`. The family exists
because `constant-fold` above **reached the folder on every run and measured nothing about
it**: its rows enumerate the `case` arms of upstream's `scope.evaluate` switch and every one is
single-typed, so #3027 — a folded value carried as `Option<Option<String>>`, in which `null` and
`undefined` are one value and `0` and `'0'` are one value — was invisible to it. Here the
expression shape is fixed and the operand's **type** varies: 8 values chosen to collide under
stringification while differing as JS values, × 11 binary operators, 5 unary operators, and 3
ternary hosts whose test is *unknown* (`constant-fold`'s `conditional-constant` has a known
test, so only branch selection runs there).

Partition of `matrix-known-failures.json` entries under `fold-value-type/` by operator class: `0`

### `opaque-keyword` — 0 entries

The family generalizes #2986: a token the transforms scan for **raw**, carried inside a
region where it is text rather than code, crossed with the construct whose boundary a scan
has to find and with both compiler entry points. Its own motivating defect passes — the
class-header scan is lexical now — and so do the two it found on the way (#2987, #2988):
the module rune loops locate `$state(` / `$derived(` through `js_scan::find_code`, which
yields only occurrences outside every string, template, regex literal and comment.

Partition of `matrix-known-failures.json` entries under `opaque-keyword/` by cause: `0`

The last cluster it carried is worth recording, because it is the only one so far whose
cause was upstream and whose resolution was still ours (#2990). A comment between two
classes that both carry rune fields was dropped by official and kept by rsvelte — the
keyword content was irrelevant, all five keyword rows reproduced identically, and `server` /
`server-dev` matched throughout. `client/visitors/ClassBody.js` lowers a **public** rune
field into `b.method('get'…)` / `b.method('set'…)`, whose `BlockStatement` has no `loc`, and
esrap's `body()` answers an unlocated node by setting `comment_index = comments.length`, a
cursor only a *located* body moves back. The discriminating row was a **private** rune field
(`#x = $state(0)`): it rebuilds the class body just the same, emits no accessor, and the
later comment survives. rsvelte builds its accessors as source text, so its cursor never
died; `client/dead_comments.rs` now deletes what upstream loses. The upstream report stays in
[`upstream_issues/2990-svelte-class-accessor-drops-later-comments.md`](../upstream_issues/2990-svelte-class-accessor-drops-later-comments.md),
and these rows are what will report the day it lands in `submodules/svelte`.

### `write-host` — 0 entries

The eight `member-update-self` rows this family shipped with are gone: `p.a++` on a
**bindable** prop (`prop-bindable` in runes mode, `legacy-let-prop` in legacy) written in a
`script-fn` or `script-arrow` host, on `client` and `client-dev`. Upstream wraps the update in
the prop setter so the parent is notified (`p(p().a++, true)`); rsvelte emitted a bare
`p().a++`, so a `bind:`-ing parent never saw the mutation. `prop_member_mutate_ast` handled
`AssignmentExpression` only, and the runes instance path in `ast_state_transform.rs` had a
prop-member branch in `visit_assignment_expression` with no counterpart in
`visit_update_expression`. Fixed by #3048; the family's own PR and the fix's PR landed
separately, which is why this section names the merge-order rule at the top of the file.

The whole family (5 bindings × 6 hosts × 11 write shapes × 4 targets) now passes. It is the axis that would have caught #3026: `binding-position` varies binding kind
but bakes one host into each binding's `wrap`, so binding × host has no cell there.

### `class-modifier` — 36 entries

The family (33 members × 7 hosts × 4 targets) is what #3100 and #3203 needed: its subject is
what a **plain** `<script>` may contain, and upstream answers that with a different *parser*
(stock acorn) rather than with a flag, while rsvelte answers it by switching OXC's
`SourceType`. Every TypeScript-only class modifier, and the stage-3 `accessor`, therefore
compiled here and was a `js_parse_error` there — an over-acceptance, which no collected corpus
can hold because published code compiles. All of those rows pass now, on all three JS entry
points (instance script, `<script module>`, `compileModule`), and so do the two rules
acorn-typescript enforces in the parser that OXC leaves to a checker (`abstract` outside an
`abstract class`, `override` with no superclass).

What remains is one cause, and it is upstream's: **OXC's class-modifier table and
acorn-typescript's are not the same table**, so on the three `lang="ts"` hosts three members
are refused by both compilers under a different code.

| member | official | rsvelte |
|---|---|---|
| `static accessor a = 1;` (`accessor-static`) | `js_parse_error` — `'accessor' modifier cannot be used with 'static' modifier.` | `typescript_invalid_feature` (accessor fields) |
| `accessor static a = 1;` (`accessor-first`) | `typescript_invalid_feature` (accessor fields) | `js_parse_error` — `'static' modifier must precede 'accessor' modifier.` |
| `declare accessor a;` (`accessor-declare`) | `typescript_invalid_feature` (accessor fields) | `js_parse_error` — `'accessor' modifier cannot be used with 'declare' modifier.` |

Partition of `matrix-known-failures.json` entries under `class-modifier/` by cause:
`error-code-mismatch, acorn-typescript modifier table: 36`

The first row is the one that names the cause. `static accessor x` is **legal TypeScript** —
`tsc` accepts it — and acorn-typescript refuses it from
`incompatible(startLoc, modifier, 'accessor', 'static')`, at `loc.column` passed to a `raise`
that takes a *position*, so upstream reports the error at offset 9 of the document, inside the
`<script lang="ts">` tag. The second row is the same member with the modifiers transposed:
`incompatible` only fires when the other modifier has already been seen, so upstream accepts
that spelling and OXC — whose table has the order rule instead — rejects it. Reported in
[`upstream_issues/3203-acorn-typescript-accessor-modifier-table.md`](../upstream_issues/3203-acorn-typescript-accessor-modifier-table.md).

These are left listed rather than fixed because both compilers *do* refuse all three, the
divergence is the code and the position only, and matching would mean either reproducing a
wrong rule at a wrong offset (row 1) or hand-porting acorn-typescript's whole modifier table
in place of OXC's — which would have to carry its bugs to be worth anything. The rows are
generated rather than skipped so that the day upstream fixes its table, this gate says so.

### `rune-statement-container` — 0 entries

The family added for #3146 varies rune declarations across labels, switch cases, branches,
and loop bodies for component and `compileModule` entry points. Its first run exposed two
places that had reduced a scoped binding to a name: the client module state pipeline lost
`var` and emitted `$.get` instead of `$.safe_get`, while the nested SSR rune lowerer lost
`var` and emitted a required derived call instead of `value?.()`. The SSR path could also
wrap a call already produced by the script-level read visitor, yielding `value()?.()`.

Those decisions now retain the resolved declaration kind, and the nested SSR pass recognizes
an existing derived call before descending into its callee. All generated rows are expected
to pass, so this family adds no ratchet entries.

## Burn-down

Re-baseline in the same PR as the fix:

```
cargo build --release -p rsvelte_napi --lib
mkdir -p .corpus-cache && cp target/release/librsvelte_napi.{dylib,so} .corpus-cache/rsvelte.node.staging && mv .corpus-cache/rsvelte.node.staging .corpus-cache/rsvelte.node
node scripts/compat-corpus/matrix/run.mjs --update-baseline
```

`--update-baseline` refuses to run under `--no-fmt` (which counts formatting-only
differences the corpus tolerates) or under a `--families` subset (which would delete every
baseline entry the run did not measure).
