# AGENTS.md

Guidelines for AI agents working on this project. `CLAUDE.md` is a symlink to this file.

## Project Goals

This project is a complete port of the official Svelte compiler in Rust.

1. **100% Test Compatibility** - Pass all tests from the `svelte/compiler` test suite
2. **100x Performance** - Achieve 100x speed via Rust optimizations and parallelism
3. **Drop-in Replacement** - Provide N-API bindings compatible with existing tools (Vite, etc.)
4. **OXC Integration** - Design for integration into the [oxc](https://oxc.rs/) ecosystem

## Architecture

Directory structure mirrors the official Svelte compiler at `submodules/svelte/packages/svelte/src/compiler/`.

```
crates/rsvelte_core/src/compiler/phases/
├── 1_parse/     # Parsing (Svelte syntax → AST)
├── 2_analyze/   # Analysis (scope tree, bindings)
└── 3_transform/ # Code generation (AST → JS/CSS)
```

Upstream reference repos live under `submodules/`:

```
submodules/
├── svelte/                  # Svelte 5 compiler (mirror target)
├── language-tools/          # svelte2tsx, language-server, svelte-check, typescript-plugin, svelte-vscode
└── typescript-go/           # tsgo — type-check backend for svelte-check (CLI) and the LSP (server mode)
```

The `@rsvelte/vite-plugin-svelte` Vite plugin (a fork of `@sveltejs/vite-plugin-svelte`)
is vendored as a workspace package at `apps/npm/vite-plugin-svelte`, not a submodule.

**Phase-3 output codegen is AST-based.** Server SSR is pure-AST (the legacy text generator
is deleted); client CSR defaults to `js_ast::to_oxc` → `rsvelte_esrap`, with the text printer
kept only as a fallback for comment-bearing / unsupported-node programs. The remaining string
processing (client visitors building `Raw` strings, `shared/async_body.rs`) is internal IR
construction with unchanged output — a maintainability cleanup only.

**The client source map is the one output where that string processing is not free**, because
a text fragment has no node to stamp a position on: #2954 rebuilt the map by matching generated
text back against the source in eleven passes, and #3015 replaced the ones a span can carry.
Three lessons outlive that work. **`has_loc` answers "may this node carry comments", and the
printer was reading it as "is this a mappable source position"** — under split coordinates
`loc_base` sits *above* every real source offset, so every `JsExpr::Spanned` in a component
whose script has a comment was silently dropped from the map; `Printer::map_position` is the
mapping-only lookup, and formatting decisions must keep `offset_to_line_col` because a
comment-space line and a source-space line are not comparable. And **a span belongs on the
identifier, not on the wrapper the lowering builds around it** (upstream's
`b.call(b.id(name, loc))`): spanning the call makes the segment cover `foo()` where official
covers `foo`. And **an in-band wrapper variant is only safe where every downstream matcher on
that position has been enumerated** — leaving `JsExpr::Spanned` on a member expression's
*object* bought 18 segments and broke 49 runtime fixtures, because the client lowering walks a
member chain by variant (`while let JsExpr::Member` then `if let JsExpr::Identifier`) and a
wrapper answers neither, so a `bind:` setter fell through to `bar.baz = $$value` instead of
`bar(bar().baz = $$value, true)`. **The source-map gate cannot see that class at all**: its
unit is a segment, not the generated statement, so it scored the change green.
What still needs a pass — the `$.prop` declaration, hoisted `import` lines,
element identifier *uses*, component `bind:` accessors — is a `Raw` fragment or a builder call
that had the span and dropped it, which is why #3015 step 1 (`Raw` eradication) really is the
prerequisite it claims to be.

**Two further lessons came out of making that branch green.** `loc_base` is the *boundary*
between the comment buffer and source coordinates, so a source offset must never raise it: a
`note_span` on the instance script's **end** put the boundary in the middle of the source range,
every template offset after the script then read as a comment-space position, and the printer
flushed a script comment inline mid-argument-list where `//` swallowed the rest of the line —
output no parser accepts, from one file in 13,284. And **a field is priced on the type, not on
the node that sets it**: the block's brace range was one `Option<(u32,u32)>` on
`JsBlockStatement`, a struct inside every statement and expression, which grew `JsStatement`
192 → 208 bytes and `JsExpr` 184 → 200 and cost 77% of a 2.47% allocation-byte regression for a
range exactly one block per program carries. Neither was visible to CodSpeed, which compiles
with `enable_sourcemap: false` while the shipping default is `true` (gate-coverage, *the perf
gates also compile with a different option set*). Per-pass numbers are in
[docs/phase3-ast-refactor-plan.md](docs/phase3-ast-refactor-plan.md#findings-2026-08-18--the-client-map-is-86-span-carried-and-two-of-the-eleven-passes-delete);
**a pass measuring 0 there is not evidence it is redundant** (gate-coverage 14f).

**The `.svelte.(js|ts)` module path is not in that "cleanup only" set, and calling it one was
wrong.** `compileModule` rewrites source text, and its scans decide structure: #2986 located a
class with `memmem::find(b"class ")` over the whole script, so a comment mentioning `class` made
the next factory function a class body and its locals came out as `#private` fields in statement
position — invalid JS from a call that returned successfully. The generalization
(`opaque-keyword`, below) immediately found two more in the same pipeline: #2987, where a
`'$derived('` in a string stops the real `$derived` from being lowered at all, and #2988, where a
`/$derived(x)/` regex literal is rewritten as code. **Two properties separate this from the
client instance-script row below**: it is `compileModule`-only (the same shapes are correct in a
component's instance script), and two of the three outputs *parse*, so the parse gate cannot see
them — only output equality can. All three are fixed: the class header comes from
`class_body::find_class_header` and the module rune loops from `js_scan::find_code`, both of
which read code bytes only. Treat the *rest* of that pipeline as unaudited rather than clean —
the keyword axis that found these samples 5 of the ~30 tokens it is drawn from.

**A third lexical scan lives in phase 2, and #3127 is its version of the same shape.** The
`$`-reference collector in `2_analyze/store_subscriptions.rs` decides which `$name` occurrences
are *references*, and it already excluded object keys, member properties, string literals and
comments — a class **body** was the shape it did not, so `class P { $abc() {} }` was rejected
with `global_reference_invalid`. What makes it worth a row is the second half: a class member is
not delimited by a `;`, it is delimited by **ASI**, so the first fix classified `a = 1⏎$abc()`
as a reference and reproduced the bug on `standard`-style source. Where a member ends has to be
answered from the previous significant token, which is the same test an explicit `;` gets — and
the opposite direction (`a = 1 +⏎$store`) has to keep reading its store, or the scan silently
drops a real subscription. Upstream never has this problem because it reads
`module.scope.references`, which holds no declaration slot; runes-mode auto-detection reads the
same set, which is why `class P { $inspect = 1 }` also flipped the component into runes mode.

**#3128 is the one to remember for a different reason: the first version of the fix stopped the
over-rejection and emitted wrong code.** Upstream opens its store-subscription condition with
`runes_option === false ||`, so an explicit `runes: false` — from the compile option or from
`<svelte:options runes={false} />`, which upstream merges in `combined_options` before analysing
— makes every rune-named `$` reference a store. Passing the merged option to the store loop is
one line, and on its own it produced `$.mutable_source($state()(0))` where official emits
`let src = $state()(0)`: upstream also assigns rune binding kinds only `if
(analysis.runes)`, and the server's and client's `$effect` / `$inspect` removals are gated by
`get_rune` returning null once the callee resolves to a binding. Four sites, and **no single
rune reaches all four** — which is why the repro carries `$state`, `$derived.by`, `$effect` and
`$inspect` in one file. An over-rejection is loud and its fix is quiet; a repro that only checks
"it compiles" cannot tell the two apart.

**And removing an over-rejection makes whatever was behind it reachable, which is a set diff
rather than a count.** #3175 is the first thing through the door #3128 opened: the SSR
constant-fold harvests `$derived(<expr>)` declarations by scanning the instance script for the
literal text `$derived(`, on the premise that a derived value is read-only and so safe to
inline. In legacy mode `$derived` is a store subscription, so the declared value is the call's
**result** and the fold inlined its **argument** — the declaration lowered correctly to
`$.store_get(..., '$derived', derived)(1)` while `{x}` rendered a frozen `1`. Output that
parses, runs and is silently wrong; the client was byte-identical throughout, so it is the
client/server two-ports shape again. The premise of a raw text scan can be **mode-dependent**,
and the scan has no way to notice. What makes it worth its own row is which repro missed it:
#3128's carries `$state`, `$derived.by`, `$effect` and `$inspect` because those are the four
phase-2/phase-3 sites its fix touched — and **bare `$derived` is the one name that reaches this
fold**, so the file written to be exhaustive about one defect enumerated exactly around the
next one. After a fix that stops rejecting something, ask what the rejection was previously
hiding, and enumerate the *names* a scan keys on rather than the sites your own patch visited.

**The client instance-script pipeline is the exception, and it is a correctness hazard, not a
cleanup.** That pipeline still decides where a statement or an expression ends by scanning
characters. Feeding every corpus output to a JS parser — a question no ratchet asks, because
each one scores match/mismatch and so cannot distinguish "wrong text" from "text that is not
JavaScript" — found **35 real-world components where rsvelte emitted output no JS parser
accepts**, all confirmed against official (#2590, #2592, #2596, #2598, #2599, #2603). Every
one is the same shape: a scanner assuming input it did not get.

| what the scanner assumed | what broke it |
|---|---|
| a statement never ends on `=>` | an arrow body starting on the next line |
| an RHS ends at `;`, `,` or an unbalanced closer | semicolon-free source (`standard` style) |
| `\` before a quote means it is escaped | `'\\'` — the backslash was itself escaped |
| a `$: if (…)` header ends its statement | `else` on the following line |
| the setter call is rendered on one line | the printer breaking it across lines |

Do not size this work against the performance case: re-parsing is 3-4% of compile time, the
profile is flat (no symbol in rsvelte's own code above ~1.6% self-time), and per-pass
`SemanticBuilder` construction measured ~2% with a 3.3% ceiling (#2602). **The justification
is that these defect classes are unreachable in an AST pipeline, not that it is faster.**

Two cautions before treating any of this as closed. The parse gate (#2591) catches only the
loud half, and **how loud a given defect is depends on the input, not on the defect**: #2603's
one mis-splice made 9 files unparseable and 6 files parseable-and-wrong (one assigns a boolean
instead of a ternary's result), and #2598 emitted a bare `$:` labelled statement that every
parser accepts. Sizing a text-scanning defect by its parse-gate count therefore understates it —
see gate-coverage 19a, where both are recorded as discriminating cases. And the four corpora that produced every one of
these defects — huly, open-webui, carbon-components-svelte, SMUI — are **not corpus sources**,
so the gate baselines at 0 while the instances live outside the population it inspects; that is
why each fix lands a `compatibility/pattern-corpus` repro.

**A folded constant is a JS value, and a rendered string is not one.** `scope.evaluate` is
ported twice: the server has a typed `EvalValue` (`3_transform/server/evaluate.rs`), and the
client fold carried the same thing as `Option<Option<String>>` — `Some(None)` for nullish,
`Some(text)` otherwise. **No gate compares the two ports to each other**; each is compared to
upstream on whatever inputs a real file happens to supply, so a shape that separates them has to
be published before anyone sees it. #3027 is what that cost. In that representation `null` and
`undefined` are one value and `0` and `'0'` are one value, so
`$derived(cond ? undefined : null)` was judged constant and hoisted out of `$.template_effect` —
the attribute freezes at its first-render value — while **eleven sibling folds printed the wrong
text with no reactivity symptom at all**: `typeof '0'` → `number`, `typeof null` → `undefined`,
`'1' + 1` → `2`, `'1' === 1` → `true`, `'10' < '9'` → `false`, `true + 1` → `'true1'`. The same
inputs were correct on the server, which is the positive control that named the representation
rather than any one arm. The client now folds through the server's `EvalValue`, so there is one
model of a folded value and one set of JS coercion rules.

Two things generalize past the fix. The `constant-fold` matrix family had been green on every
run **and reached the fold every time**: its 17 rows pick expression *kinds* — the `case` arms of
upstream's switch — and every one of them is single-typed (`'a' + 'b'`, `Math.max(1, 2)`,
`true ? 'a' : 'b'` with a *known* test). Enumerating a dispatch is not enumerating a value
domain, and reaching a decision is not being able to tell two rules for it apart (the #3005
lesson, one axis over). `fold-value-type` is the discriminating axis — operand values chosen to
collide under stringification while differing as JS values — and gate-coverage 5q records it.
And **"is this value known" still has three more implementations in the client** —
`is_expression_known_json`, `identifier_has_reactive_state`, and
`is_initial_value_literal_or_known`, the last of which answers by
`memmem::find(json, b"Literal")` over a JSON dump — while `binding.initial` keeps a
non-literal initializer as **source text** that only the JSON branch re-parses. So
`{1 || 2}` folds and `const c = 1 || 2; {c}` does not, and the same for `const c = /ab/g` and
for a `1n` bigint anywhere. Treat that as the next instalment, not as covered.

**#3539 is that instalment's first row, and measuring it moved two of the sentence's claims.**
The bigint half was the *operator table*, not the known-value predicates: `to_number` returns
`None` for a bigint — correct, because JS `ToNumber` throws on one — and every arithmetic and
relational arm was gated on it, while arithmetic actually uses **`ToNumeric`**, which keeps a
bigint a bigint and throws only when the *other* operand is not one. So the fold conflated
"this coercion throws" with "this value is unknown", and `7n + 2n` fell through with `2n + 1`.
One table serves both walkers, so fixing it moved a 6,510-cell bigint × operator × 7-host ×
3-target sweep from 1,539 divergences to 263. The other claim to correct is **"in the client"**:
the `const c = 1 || 2` miss is on the *server* too, and it is not about bigints or regexes —
`const c = 0 || 2`, `const c = 1 && 2` and `const c = null ?? 2` all fail identically on all
three targets. What the sweep's residue actually contains is five distinct clusters, **none of
them bigint-specific**, all reached through a *binding initializer* rather than a template
expression: a `LogicalExpression` never folds there; the client never folds a global call
(`Number('3')`, `String(3)`); `$derived(<any literal>)` misses the `textContent` fast path; the
dev-mode equality guard fires on an initializer where no `$.equals` lowering happens; and
`const r = '1' + '1'` **renders `2`** on the server. The last is a wrong value rather than a
missed fold, and the shape that finds it is a plain string. **Ask of a residue paragraph which
of its examples were measured and which were inferred from the mechanism** — three of these
four were only ever the latter.

**And #3027 is not one bug, it is the shape of a class — the inventory is
[`compatibility/two-ports-inventory.md`](compatibility/two-ports-inventory.md).** Every gate here
compares rsvelte to *upstream*; **none compares rsvelte to itself**, so a second port of one
upstream function is only ever exercised on whatever inputs a real file happens to supply. On
2026-08-22 four instances were reported on one day by four people in four files — #3403, #3427,
#3472, #3569 — and a sweep from the upstream side then found twelve, of which the ports
*demonstrably* answer differently in ten. Three are self-documented: `assign_dev_ast.rs:56` says
"the two must agree or the same source would be wrapped on one path and not the other" and its
twin lacks three `match` arms; the server's rune table says "mirrors `is_rune` in utils.js" and is
missing two names the client's is not; `truncate_globals` and `truncate_trailing_globals` both
claim `css-prune.js`'s `truncate` and return *opposite* results when every relative selector is
global. **A comment asserting fidelity is where this class hides**, because it reads as a
citation. Exactly one place in the tree defends against it
(`typed_reactive_state_front_end_agrees_with_the_json_walk`), and the reusable part is that it
pins the expected answer *independently* — a port-vs-port test whose oracle is the other port
passes when both are broken the same way.

**The `JsNode` → `serde_json::Value` cost is one site, and it is not the lazy cache.**
`to_value` has 54 call sites; every materialization figure this project has quoted (27,488 →
12,089 → 3,649) counts only the cached one. Of the bypassing population, 98% is
`instance_labeled_statements_json` (`2_analyze/mod.rs`) — **77–82% of all JSON objects and map
entries on legacy-`$:` corpora, 0% on runes-only code**, confirmed by two independent
instruments. The remedy was porting its three legacy-`$:` consumers to typed traversal, not
another cache — #2622 did that, byte-identically, so those figures describe the tree before it.
This is not a competing claim to § *Where compile time goes* below, which asks
which **site** owns the alloc+hash+memcpy bucket and correctly answers *none*: the two
populations differ and the answers interlock — that section prices a JSON object key (`String`
malloc + `IndexMap` slot + SipHash), and this site is what produces the keys.
Two rules it cost us: **count a function's call sites before
trusting a per-function measurement**, and **attribute a memoised value by reader *set*, not
first reader** (under a per-node cache, first-reader attribution names the wrong site — converting
it moves the count by zero). Numbers, cross-validation and the unresolved time question are in
[docs/phase3-ast-refactor-plan.md](docs/phase3-ast-refactor-plan.md#findings-2026-08-08--the-to_value-cost-is-one-site-and-it-is-not-the-lazy-cache).

**`script_text` is the only bucket that scales superlinearly**, and it is simultaneously the
largest — exponent ~1.4 (prod) / ~1.2 (dev) against every sibling below 1.0, carrying ~0.51 of
a total ~0.95 in `share x exp`. Roughly half of how compile cost grows with file size lives in
that one bucket, in **prod as much as dev**. Two dev-mode candidates that look like textbook
`sites x source_length` defects were measured and **falsified** — the `Vec<char>` rescans in
`wrap_prop_mutation_validation` (rescan factor 0.0–1.8x, not the ≥10x a quadratic needs) and
skipping the dev assign-tail parse (removes 951 parses on carbon and buys +0.04%). Both, plus
the reason `post_passes` and `line_loop` cannot attribute a movement on their own and why
wall-clock is unusable on a loaded box, are in
[docs/phase3-ast-refactor-plan.md](docs/phase3-ast-refactor-plan.md#findings-2026-08-08--dev-mode-client-two-falsified-hypotheses-and-the-one-bucket-that-scales).
The 6.59x client-dev figure against `@mrwaip/svelte-rs` predates #2511/#2512 and is **not**
current.

### Where compile time goes ([`docs/phase3-ast-refactor-plan.md`](docs/phase3-ast-refactor-plan.md) § Findings 2026-08-08)

The 40.3% of non-kernel CPU that a profile attributes to allocation + hashing + memcpy
has been broken down **by site**, and the answer is that there is no site: it takes
26–32 of 322–479 sites to reach half the bucket, and the largest single one is 0.4–1.8%
of compile — under the ~5% code-layout floor. What the measurement did find is a shape:
**rsvelte performs ~1.2 heap allocations per input source byte, flat to three digits
across an 18× file-size range**, which is the mechanism behind "uniformly heavy, slope
not intercept". The identified target is the **representation** — one `Box` per
expression node, and a fresh `String` malloc + `IndexMap` slot + SipHash per JSON object
key, from a set of only 88 distinct static keys. Do not open a brief to fix a *site*
here; a representation brief starts from that section rather than re-deriving it.
`crates/rsvelte_devtools/src/bin/alloc_sites.rs` is the instrument, and the section
states its four limits and one retraction — a share of a bucket cannot be converted into
a share of total time using a factor derived from the same profile share being
apportioned.

**Key Design Decisions:**

- Memory-efficient layout (u32 positions, compact_str)
- Thread-safe parser with rayon parallelism
- Direct AST passing (no re-parsing between phases)
- Retained Phase-1 programs are immutable; Phase 3 uses source-range transforms and falls back after text rewrites
- No backward compatibility for internal APIs (refactor freely)

### What each gate cannot see ([`compatibility/gate-coverage.md`](compatibility/gate-coverage.md))

The sections below describe what the ~34 gates *do* compare. Every one of them can be green
while a real defect ships, because each has a field its comparison key drops, a normalization
step that erases the divergence, or a population its unit never reaches — and rediscovering
those blind spots ad hoc has cost this project several shipped bugs (#2403, #2424, #2425).
`compatibility/gate-coverage.md` is the inventory: per gate, the unit compared, what it
structurally cannot observe with the responsible flag/field/filter cited by file and line, and
evidence classified as a **discriminating case**, a **structural argument from code**, or an
explicit **unmeasured**. Never fill a row with a plausible guess — an unsupported blind-spot
claim is worse than a blank, because the next person reads the row as surveyed.

**When adding a gate, add its row before the ratchet is first baselined**, and answer "what
does this gate not look at?" — which is not the same question as "what inputs does it not
have". Corpus size is the saturated axis; the two that still find defects are what we compare
and how inputs are constructed.

**A baseline is a measurement of a tree, and the tree is the merge base.** `--update-baseline`
run on a branch cut before a fix that the ratchet observes enrols entries that already pass on
`main`, and the two-sided check then fails on `main` itself and on every branch cut from it —
which is how #2435 shipped 56 stale shape-matrix entries. Rebase (or merge `main`) *before*
re-baselining, never after. The reason nothing caught it is worth remembering separately: every
workflow set `cancel-in-progress: true` on a concurrency group keyed by `github.ref`, which is the
same string for every push to `main`, so at a high merge rate each merge cancelled its
predecessor and `main` carried no verdict at all. **A cancelled run and a green run are
indistinguishable in the branch header.**

### Corpus output-equality pipeline (`scripts/compat-corpus/`)

Every `.svelte` / `.svelte.(js|ts)` source (including markdown code blocks) from every corpus
source repository — sveltejs/svelte, sveltejs/svelte.dev, and the real-world projects bits-ui /
flowbite-svelte / melt-ui / shadcn-svelte, all pinned as submodules and listed in
`scripts/compat-corpus/corpus-sources.json` — is compiled with both the official compiler and
rsvelte for CSR, SSR, dev-mode CSR **and dev-mode SSR** — read the target list off
`scripts/compat-corpus/targets.mjs` (`TARGETS`, i.e. every non-`reportOnly` descriptor) rather than
off this sentence: verifying a new pattern file against three of the four is a green local check and
a red CI run. Outputs must be byte-identical after comparison-side normalization
(oxfmt + blank-line stripping — never compiler post-passes). To grow the corpus, add a submodule
plus a line to `corpus-sources.json`. CI ratchet: `compatibility/known-failures.{client,server,client-dev}.json`
may only shrink, and each remaining failure is justified in `compatibility/known-failures.md`. Every
ratchet is two-sided: a new failure **and** a listed entry that already passes both fail CI, so the PR
that fixes entries must re-baseline in the same PR instead of leaving a backlog for a later one. The
same directory holds four sibling shrink-only ratchets, each with per-entry justification in a paired
`.md`: the formatter-parity gate (`fmt-known-failures.json` / `fmt-oracle-excluded.json`), the
svelte2tsx output-parity gate (`svelte2tsx-known-failures.json`), the lint output-parity gate
(`lint-known-failures.json`, whose *constructed* companion
`lint-adversarial-known-failures.json` is described under `rsvelte_lint` below), and the
SCSS-backend gate (`scss-known-failures.json`), which compares
`rsvelte_preprocess`'s `grass` against dart-sass on every SCSS block and `.scss` file in the corpus —
30 divergences on a 94-unit compared population, so treat `grass` as a near-substitute, not a drop-in. svelte2tsx additionally gates its **source map** (ratchet
`svelte2tsx-map-known-failures.json`), because the TSX-text gate cannot see the map at all. The two
maps are segmented too differently to diff (byte, decoded-set and lookup-equality parity all hold for
~0% of the corpus), so the gate asserts that rsvelte's map is **structurally well-formed** rather
than equal to official's — using official only to calibrate the invariants. See
[scripts/compat-corpus/README.md](scripts/compat-corpus/README.md).

The same `verify.mjs` run also gates compiler **warnings** — `(code, line, column)` per entry —
on ratchets of their own (`warning-known-failures.{client,server,client-dev}.json` and
`warning-position-known-failures.*`, justified in `compatibility/warning-known-failures.md`).
Codes and positions ratchet separately: a wrong set of codes is a semantic bug, a wrong position
is one systemic cause, and folded together the larger position backlog would hide every semantic
regression. Until #2281 the pipeline discarded `result.warnings` entirely, so this whole class was
invisible **by construction, at any corpus size** — that is how #2256 shipped while the corpus
scored the very entry that reproduces it as `MATCH`. When adding a gate, ask what the oracle does
not look at, not only what the input does not contain.

Compiler **errors** ratchet the same way and for the same reason
(`error-{message,position,end,frame}-known-failures.{client,server,client-dev}.json`, justified
in `compatibility/error-known-failures.md`). The output verdict compares an error's `code` and
nothing else, and that field is **saturated**: 0 divergences over the 2,843 `(id, target)` pairs
both compilers reject. Every other field was invisible until it was captured — `message` 121
ids, `start` 226, `end` 243, `frame` 5 — so growing the corpus could never have found them.
`end` is ratcheted apart from `start` because **an entry listed for one suppresses everything
about that entry**, and 17 ids diverge on `end` while `start` agrees; `frame` is the one
comparison deliberately *chained* behind both endpoints agreeing, because upstream derives it
from `start.line` and `end.column` and an unchained comparison would restate them.

**These comparisons score `match` when there is nothing to compare, which makes an absent
artifact a clean green.** Measured on a half-swept tree: 0 pairs compared, 14,179/14,179
`match`, while the ≥99%-compiled precondition passed at 14,179 — it tested
`hasOutputs(EXPECTED,id) || hasOutputs(ACTUAL,id)` with `hasOutputs` itself a `some` over
targets, permissive in both quantifiers. It is now asserted **per tree and per target**, the
compared-pair count is printed and stored in `report.json`, and `--update-error-baseline`
refuses at zero. The warning half of the same hole, and `compile.mjs` fabricating a
whole-corpus `rust_panic` when `sources/` is missing, are tracked in #2707.

### Generated shape matrix (`scripts/compat-corpus/matrix/`)

A **generated**, not collected, differential corpus (`pnpm run corpus:matrix`, #2281 Gate 2),
ratcheted through `compatibility/matrix-known-failures.json` with per-cluster justification in
the paired `.md`. Declarative axis families in `matrix/axes.mjs` — binding kind × syntactic
position, comment kind × insertion slot, invalid `bind:` target × directive slot,
string-literal escape × template expression slot, `await`/`yield` in a formal parameter list
× function form × entry point, `{#each}` collection expression × item use, the token a `/`
follows × host, a name's slot in a binding pattern × statement context, directive kind ×
element kind × mode, `bind:` setter shape × element kind, a raw-scanned keyword × the opaque
region carrying it × host × entry point, and a reactive binding × the host the write to it sits
in × the shape of that write — expanded into ~20,000 comparisons
in well under a minute of CPU, needing
only `submodules/svelte` plus the NAPI binding, so it gates every PR.

**Two comparisons were added to this gate after it shipped, and both are about the KEY rather
than about tolerance.** It now runs the acorn parse oracle (`parseable.mjs`) on both sides of
every accepted pair, so "text no JS parser accepts" is its own `output-unparseable` verdict
instead of one more `js-mismatch`; and a divergence a comment/whitespace normalization absorbs is
`comment-mismatch` rather than `js-mismatch`. Both stay ratcheted two-sided. The reason is
measurable rather than tidy: a ratchet entry suppresses everything its key cannot tell apart, and
every comment carrier in the `opaque-keyword` family diverges on comment placement — under one
flat verdict, re-breaking #2986 would have reproduced an *already-listed* key on the very cases
written to catch it.

The `opaque-keyword` family is the generalization of #2986, and its subject is where a construct
is judged to **begin**. `find_matching_bracket` and `code_bracket_depth` have been comment- and
string-aware since #2253, but the scans deciding where to start counting from stayed plain byte
searches — `transform_class_fields_server` took the first `class ` in the file and the first `{`
after it, so a doc comment reading "we avoid class here" made the following factory function a
class body. **Hardening a body scan says nothing about the entry-point scan that feeds it.** Its
keyword axis is *derived* — the source-level tokens `memmem::find` is called with under
`phases/3_transform/{server,client,shared}` — but it samples 5 of ~30, which gate-coverage 5o
records. It paid for itself on the first run: #2987 (a `'$derived('` in a string, template or
comment stops the real `$derived` in that module from being lowered at all, so the module throws
at import) and #2988 (a `/$derived(x)/` regex literal is itself rewritten). Both outputs parse,
so the parse oracle is blind to both — only output equality reports them. Both are fixed, and so
is the third the family found (#2990), the one row where **rsvelte's output was the more faithful
of the two**: a synthesized accessor body has no `loc`, which parks esrap's comment cursor for the
rest of the file, so official drops comments rsvelte kept. Byte equality is the goal, so
`client/dead_comments.rs` reproduces the loss and `upstream_issues/` carries the report — a
divergence whose cause is upstream still needs a decision here, and "leave it listed" is only
one of the two.

**That cursor has two kills, and modelling one of them with an approximation of the other is
what #3005 was.** A `<script module>`'s `Program` is builder-made too, so its cursor starts
dead — which rsvelte modelled as "keep a comment iff it sits inside a function/class body
span". That rule is neither necessary nor sufficient: a comment *after* a body has ended is
still reachable, because the body revived the cursor and the next located statement flushes it.
`dead_comments.rs` now walks the revive/kill events once for both, seeded by which program it
is printing. The gate row is its own lesson (gate-coverage 5p): `comment-slot` had injected
into `<script module>` since it shipped and measured nothing about this, because every slot in
its seed was one where the two rules **agree** — reaching an entry point is not being able to
tell two rules for it apart.

The `bind:` and `param-default` families are the odd ones out and the reason is worth stating:
their inputs are programs the official compiler **rejects**, which is a population no collected corpus can hold, because
published code compiles. "rsvelte accepts what official rejects" was otherwise gated only by the
145 `compiler-errors` fixtures at **one input per code** — and a code with a passing fixture
reads as covered. #2583 is what that misses: `bind_invalid_expression` had a passing fixture on
an element while `<Comp bind:value={o.x = obj} />` compiled into a getter/setter around an
assignment. Adding the family alone would still have measured nothing, because `run.mjs` scored
any both-reject case as `error-parity` without looking at the codes; **the comparison and the
population had to land together**.

Both families carry **valid** inputs against the same slots too, and that half is not
decoration: the `bind:` family's first version had only the invalid rows, and CI then caught an
over-rejection (a TypeScript assertion, `bind:group={c as T}`) from a corpus file instead of from
the gate. An over- and an under-rejection are opposite directions of one check, and a population
of only-invalid inputs is blind to one of them. The `param-default` family's legal rows are the
same shape one level harder: `async (p = { async m() { return await 1; } }) => p` **is** legal,
so a check that scans the parameter subtree for the keyword rejects real code.

`param-default` also crosses the **entry point**, which the other four do not: the instance
script, `compileModule`, and a template expression are three different parse functions in
rsvelte, and #2547's fix was incomplete in exactly that way — the script paths rejected it while
`{(async (p = await x) => p)}` still compiled.

The string-literal family is the first to inject into **markup** rather than into a JS statement
inside `<script>`, which gate-coverage 5c names as this gate's largest blind spot. Its axis is
chosen for a class no other gate can see: esrap writes a literal's `raw`, so official's output
carries the source's escape spelling, and a printer that re-emits the cooked value produces text
that **parses and computes the right value** while differing byte-for-byte. Neither the parse gate
nor a runtime test can observe that. Nor can a committed repro file, which is the reason the
axis had to be generated: the fmt oracle rewrites single quotes to double, and double-quoted
literals were the one shape that already worked — the formatted form of the repro reproduces
nothing.

It exists because the collected corpus samples the **marginal** distribution of published code
while every bug in the #2253/#2254/#2255/#2256 batch was an **interaction**: #2254's shape occurs
**0 times in 14,026 real files**, #2253's likewise, and `client`/`server` were at 0 known failures
— saturated — when all four were reported. Adding real-world repos cannot fix that; only
generating the product can. **Corpus size is no longer the axis worth growing.** The two that are:
what we compare (warning parity above) and how inputs are constructed (this).

**That claim is about interactions the generator was told to cross, not about coverage, and it
does not make the collected corpus redundant.** A generated family is bounded by its author's
axis values, so the author's blind spot sits inside the generator by construction — the same
shape as the enumeration hazard recorded for reachability arguments. #2535 is the
counterexample: its css-prune grid was green on all 1,955 rows while an over-prune shipped that
three real `svelte.dev` components reproduce, because the shape needs a two-compound parent
**and** a subject `&`, and every family row its author wrote had a single-compound parent. The
collected corpus caught what the generated one could not. Treat the two as complements — when a
generated family comes back clean, ask which axis value you did not think to write, not only
which input the corpus lacks.

**`fold-value-type` is that question answered against a family that was already there.**
`constant-fold` reached the constant folder on every run and was green through all of #3027,
because its rows enumerate the `case` arms of upstream's `scope.evaluate` switch and every one
is single-typed. The new family fixes the expression shape and varies the **operand's type**
instead — 8 values picked so that each pair collides under stringification while differing as JS
values (`undefined`/`null`, `0`/`'0'`, `true`/`'true'`, `''`/`0`) × 11 binary operators × 5 unary
× 3 ternary hosts whose test is *unknown*, which `conditional-constant` never is. A family can
sit on the defect's own decision point for a year and measure nothing about it; what
discriminates is the axis, not the entry point.

The `directive-element` family is the first whose motivating defect the gate's **comparison**
could not express. Which parents a per-directive rule applies to is one `parent_type` test
upstream and one arm per element visitor in rsvelte, so the rule drifts wherever the product is
unenumerated — #2497 is `event_directive_deprecated` on `RegularElement` but not on
`SvelteElement`. That is a **warning**, and `run.mjs` read `js.code` only; a warning that never
fires has no output to diverge on. So the family landed with warning-**code** comparison, and the
pairing is measurable rather than rhetorical: over the 4,134 accepted (case, target) pairs of the
five older families, **both compilers emit zero warnings** — the comparison alone would have run
on an empty population, and the population alone would have been scored on the wrong field.
Positions stay with the collected gate, where they ratchet separately for the #2314 reason.
Each diverging code is its own ratchet entry (`warning-missing:<code>`), because the key is
`(id, verdict, target)`: under a flat `warning-mismatch` verdict, re-breaking #2521 left this
gate green — the cases were already listed for a *different* missing warning. **A ratchet entry
suppresses everything its key cannot tell apart**, so put the class in the key.
`bind-setter` needs no new comparison — #2484's dev-mode `$.assign` divergence is in the output —
only the element axis, because that defect was reported against `<svelte:component>` (which
matched) and the live sites are `<svelte:body>` and `<svelte:self>`.

Neither family has a skip list. A cell official rejects is compared as an error **code**, so an
illegal combination is a comparison rather than a hole; declining to generate it would report
coverage the family does not have.

**The `write-host` family exists because an axis can be present and still be unenumerable.**
`binding-position` has varied the binding kind since the matrix shipped, but each binding's
`wrap` bakes in ONE host: five of its seven put the body in a named `<script>` function and only
the two each-block rows use an inline template arrow. Binding kind and host are *confounded*, so
the product has no cell — and #3026 lived in the missing one, a destructured prop written from an
inline template arrow. It is not a coverage gap corpus growth could close: the shape that
reproduces it occurs **0 times in the 12,523 collected `.svelte` files**, and the 72 files whose
client output does contain `x()()` all mean it (a prop that is a function, called). Declaring
binding, host and write shape as three independent axes is the whole family; it found two more
divergences on its first run — an `UpdateExpression` whose argument was never walked in phase 2,
so `p.a++` set neither `needs_context` (no `$.push`/`$.pop`) nor a reference to `p` (a spurious
`export_let_unused`), and a `$bindable()` prop member update rsvelte never wraps (#3048). Ask of
any family whose rows share a wrapper: **is the thing I varied crossed with the thing I held
fixed, or merely adjacent to it?**

Normalization is deliberately identical to `verify.mjs`, so a divergence this gate reports is one
the corpus gate would also report. `--update-baseline` refuses to run under `--no-fmt` or a
`--families` subset (both would FALSE-SHRINK the ratchet).

### Transform idempotency (`scripts/compat-corpus/idempotency-verify.mjs`)

**The one gate here that compares rsvelte to nothing.** With
`RSVELTE_ASSERT_TRANSFORM_IDEMPOTENT` set, every top-level
`apply_transforms_to_expression` re-applies itself to its own output and reports when the two
differ; any report fails the run. It exists because #3026 is a *property* violation that output
equality cannot sample: `try_transform_assignment` hands a converted subtree back to the outer
walk, so a read whose output is itself re-readable is applied twice — and the input shape that
exposes it occurred **0 times in the 12,523 components the corpus held when it was reported**,
with the bad output parsing cleanly. Remove the one line that seals `b::getter_call` and the
same corpus reports **37,352** violations in **7,888** of 27,566 units (28.6%) — while still
compiling to 0 output divergences. Sealing all seven read builders takes it to 0 with every one
of the 37,596 output hashes byte-identical; #3026's own two accounted for three quarters of the
total, and the five it never reached for the remaining 9,274.

The generalisable part is not the invariant, it is what kind of gate it is. Every other gate
here samples inputs and compares outputs, so its reach is the product of the population someone
collected and the axes someone wrote — and #2535 already showed that a generated family is blind
to the axis value its author did not think of. A gate that asserts a property of the *compiler*
is bounded by neither. When a defect class is "the second application of a correct step",
"a value read twice", "a cache that disagrees with a recompute", ask what invariant states it
directly before adding another family: the corpus you already have becomes the detector, at
whatever size it happens to be. What it costs you is that idempotent is not correct — read it as
a necessary condition, never as parity.

### Corpus-seeded mutation fuzz (`scripts/compat-corpus/mutate-corpus.mjs`)

The generalization of the matrix (`pnpm run corpus:mutate`, #2281 Gate 3): the 14,138 corpus
entries stop being the test set and become a **seed set**. One semantics-preserving comment is
inserted at a line boundary inside a `<script>` region and parity is required on the mutant.
PRs get a deterministic sample; main gets the full sweep (which is what the two-sided ratchet
needs). It found **#2351** (a comment containing `}`/`)`/`;` in a `$:` block body **aborts the
client compiler with SIGSEGV**) and **#2347** (a `//` comment before a `$props()` pattern's
closing brace swallows the `$.rest_props` initializer — output parses, attributes silently
vanish) in its first run.

**Only the code class is ratcheted.** A divergent mutant is `code-mismatch` when the difference
survives normalizing comments, whitespace and trailing commas away, `comment-mismatch`
otherwise. The full sweep yields **36** of the former and 12,910 of the latter; ratcheting per id
without that split would be a 13,000-entry file that churns on every submodule bump. Comment
fidelity is ratcheted per id by Gate 2 instead, on generated seeds that do not move when a
submodule bumps. The delimiter-carrying/plain ratio has measured 2.81× (oxfmt 0.61), 1.30×
(0.62) and **1.66×** (0.62, post-burndown): it tracks the normalizer and the current residue,
not the mechanism's importance, so do not cite it as a constant.

Compilation runs in child processes (mirroring `compile.mjs`): a panic aborts the process, so a
single-process sweep loses the whole run to one bad mutant — which is what happened first. The
worker prints `IDX <i>`, the parent names the crashing seed, records `compiler-crash`, resumes.

**Corpus artifacts clean themselves up.** A full run writes ~0.57 GiB of regenerable trees per
checkout (`sources/` 60 MiB, `expected/` 254 MiB, `actual/` 254 MiB), and N parallel agent
worktrees each hold a set — this filled the dev machine's disk twice. `verify.mjs` therefore
deletes `expected/` + `actual/` after a **passing** run (`svelte2tsx-verify.mjs` likewise for the
`-s2t` trees); a **failing** run keeps them so a divergence can still be diffed, as does CI and as
does `--keep-artifacts`. `compile.mjs` aborts up front when free disk is below
`180 MiB × targets + 512 MiB`. `pnpm run corpus:clean` reclaims everything regenerable across
this checkout and every `.claude/worktrees/*` sibling — never the checked-in `*known-failures*`
ratchets. Because a verify against an absent tree would score every entry `match`, `verify.mjs`
asserts ≥99% of manifest entries have compiled output before comparing, and refuses
`--update-baseline` below 12000 corpus entries (the FALSE-SHRINK trap: `--update-baseline` deletes
every baseline id it did not measure) — `--update-warning-baseline` is held to the same floor.
`--update-baseline` additionally refuses `--no-fmt`, which counts formatting-only differences as
failures; `--update-warning-baseline` does not, because warning comparison never normalizes.

The svelte-check diagnostic-parity gate is the odd one out: its unit is a **type-checked project**,
not per-file text, so module resolution / workspace layout / the `.d.ts` environment are observable
there and nowhere else. Layer 1 (`check-verify.mjs`, ratchet `check-known-failures.json`) runs
committed mini-projects under `compatibility/check-fixtures/`; Layer 2 (`check-e2e-verify.mjs`,
ratchet `check-e2e-known-failures.json`) runs real repositories — `submodules/cmsaasstarter` and the
`submodules/skeleton` pnpm monorepo — installed from their own lockfiles.

### LSP differential gate (`scripts/compat-lsp/`)

The newest gate, and its unit is a **JSON-RPC response field**: the same `initialize` + request
stream is driven over stdio against the pinned official `svelte-language-server` and
`rsvelte-language-server`, and every differing normalized field becomes one shrink-only key in
`compatibility/lsp-known-failures.json` (justified in the paired `.md`). Committed fixtures and the
pinned upstream `language-tools` suites compare per field; the four real-world corpus repositories
compare per `(file, method)` aggregate, because one key per identifier would be a six-figure file.
Every unit runs its request set **twice**: once on the opened document, then again after a
deterministic round-trip `didChange` script that restores the source byte for byte, so a phase-2
key is comparable to its phase-1 twin and a divergence is a state-transition difference alone. The
phase is in the ratchet key, because an opened-phase entry would otherwise suppress the post-edit
divergence in the same `(unit, method)`.
**The real-world half of this gate is scheduled, not per-PR, and the reason is unit cost.** Its 16
shards average ~59 minutes each, and the three Corpus Compat runs where all 16 finished total
**950 / 959 / 934 job-minutes** — against ~160 for every other gate on a pull request combined, so
one run of this job is ~86% of a push's total. (Sample the shards partially and the mean moves a
lot: shard durations range 42–67 minutes, so a 2-shard sample has read as low as 47. Cite the
three complete runs, not a partial one.) A GitHub Free personal account runs 20 concurrent jobs
— 28,800 job-minutes a day — which puts the whole repository's ceiling near 26 pushes a day
against a measured ~60 pull-request pushes plus ~10 merges. `lsp-corpus` and `lsp-current-merge`
therefore run on `schedule` and `workflow_dispatch`; `push: main` is excluded on the same
arithmetic (~10 merges/day would return a third of total capacity to this one job).

**Do not cite a verdict-arrival rate measured during the congestion.** The obvious statistic —
what fraction of recent runs reached a `conclusion` — was 13/100 when this landed and 3/100 an
hour later, because the window it is drawn from is a few hours of the very backlog the change
exists to remove. It moves with the queue, not with the gate. The unit cost above does not.

The gate is still reachable per-branch two ways. `workflow_dispatch` against the branch runs the
full 17-artifact population, which is what a re-baseline needs; and because the PR that *shrinks*
the ratchet is the one that most needs the verdict and would otherwise be exempted by the
event-name guard, the filter emits an `lsp-ratchet` output for a diff touching
`compatibility/lsp-known-failures*.json` or `scripts/compat-lsp/**`, and that re-admits the job on
a pull request. It fires on 0 of the 77 open PRs, so the escape hatch costs nothing until it is
needed. The fixture and pinned-upstream suites still run on every PR — in `ci.yml`'s
`Language server` job, whose `pull_request:` trigger is unfiltered; `corpus-compat`'s
`lsp-fixtures-current` ran the identical `verify.mjs` invocation and now runs only where
`lsp-current-merge` reads its artifact. **Sizing a gate by its strictness on paper and never by
what it displaces is how this one ended up measuring almost nothing.**

The rest of Corpus Compat is gated per job by `scripts/ci/corpus-compat-job-filter.mjs`, which
derives each job's blast radius from `cargo metadata --no-deps` rather than a transcribed path
table: a change confined to `crates/<c>` runs only the jobs whose build targets transitively
depend on `<c>`, and **every** non-crate path (ratchets, scripts, submodules, lockfiles) enables
everything. The asymmetry is deliberate — under-approximating costs a skipped gate, which reads
exactly like a passing one (#2405), and over-approximating costs runner minutes. **The workflow's
own conditions have to point the same way**: they read `!= 'false'`, so a filter step that fails
to emit runs everything rather than skipping everything, and a crate directory is treated as inert
only when its `Cargo.toml` declares its own `[workspace]` — a directory name is not a package
name, so failing to match one proves nothing. Measured against
the 77 open PRs, 50 touch `crates/rsvelte_core` and so narrow nothing; the filter's real
population is the crates in no gate closure at all (`rsvelte_lint_types`, which is its own Cargo
workspace, plus `rsvelte_bench`, `rsvelte_capi`, `rsvelte_fmt_wasm`, `rsvelte_lint_bindings`).

Upstream ships **no** end-to-end protocol test, so the harness is built from scratch, and a baseline
update needs the complete 17-artifact union (`CORPUS_SHARDS` + the fixture unit) at one
project/language-tools/corpus revision — a
partial run cannot shrink it.

**The measurement is a property of the installed tree, not only of the sources.** The `.svelte.tsx`
shadow's TypeScript program reaches the repository root for ambient `@types`, so the same commit
yields 4380 fixture keys in an uninstalled checkout and 4397 in an installed one. Both CI jobs that
run the comparison therefore install first, and `verify.mjs` refuses to run without it. Ask this of
any gate whose oracle is a type checker: **what did the checkout provide that the sources did not?**
What it cannot see is gate-coverage 27.

**Every positive control here used to be satisfied by an oracle that answers *something*, and a
degraded official server does not error — it answers differently, and those answers enrol into a
shrink-only ratchet that then defends the degradation.** The live official server is therefore held
to the same 125 upstream snapshots the gate already loads: a run reproducing under **70%** of them
aborts *before* the current artifact is written, so nothing a merge could accept survives. It is one
verdict per run, deliberately not a second ratchet — "is the oracle sane" has one answer, not one
per fixture. The floor is loose because a live server over stdio is not upstream's provider-level
harness; the causes that hold the measured 79% below 100% are enumerated in gate-coverage 27h, and
the floor cannot see a degradation smaller than that margin.

## Implementation Principles

**CRITICAL**: All implementations must follow the official Svelte compiler implementation.

1. **Reference Implementation** - Always check `submodules/svelte/packages/svelte/src/compiler/` before implementing
2. **Structural Consistency** - Mirror directory structure, module organization, and naming
3. **Exact Output** - Output must match the official compiler exactly (verified by tests)
4. **Test-Driven** - Verify all changes against the official Svelte test suite

When implementing, reference the corresponding file in `submodules/svelte/packages/svelte/src/compiler/` and use the same algorithms and logic.

### Code Comments

Keep comments to the minimum WHY. Do not narrate WHAT the code does line by line, do not
record change history / PR / issue numbers / provenance, and do not add section-banner
comments. Write a comment only when there is a constraint or reason that the code itself
cannot express, and keep it to a single line.

## Development Workflow

### Setup

```bash
git submodule update --init --recursive
git config core.hooksPath .githooks
pnpm install
pnpm run generate-fixtures  # Required before running tests
```

### Build & Test

```bash
cargo build                                          # Build
cargo test                                           # Run all tests
cargo test --release                                 # Release mode (recommended for full runs)
cargo test --test parser_fixtures -- --nocapture     # Run a single suite
pnpm run compatibility-report                        # Generate compatibility report JSON
pnpm run test-and-update                             # Refresh report + docs
```

A **debug** run needs `RUST_MIN_STACK=33554432` — the value CI already sets
(`ci.yml`). Without it `ast_gate_preconditions` and `runtime::test_runtime_legacy`
abort with a stack overflow, which reads as a defect in whatever you just changed.
`--release` does not need it.

Pre-commit hooks run `cargo fmt` and `cargo clippy` automatically (`.githooks/pre-commit`).

### Docker (optional)

A `Dockerfile` and `docker-compose.yml` provide a reproducible toolchain (Rust nightly + Node 22 + pnpm). There is no wrapper script — invoke Compose directly:

```bash
docker compose up -d            # Start dev container
docker compose exec dev bash    # Open a shell inside it
docker compose exec dev cargo test
```

VS Code Dev Containers ("Reopen in Container") also works.

### grep can return nothing and mean nothing

Four ways `grep` has silently reported "no matches" for strings that were
present. All of them produce a confident empty result, so a negative grep is
never on its own evidence that something is absent — confirm with a positive
control on a string you know is there.

| Symptom | Cause | Fix |
|---|---|---|
| `grep X file` finds nothing that is there | `grep` is a shell function wrapping `ugrep --ignore-files`, which skips gitignored paths | `command grep` |
| `Binary file … matches`, no lines printed | one NUL byte anywhere in the file (not non-ASCII — UTF-8 is fine) | `command grep -a`, or `git grep` |
| `git show rev:file \| grep X` finds nothing | the wrapper's `-I` discards binary-looking **stdin** | `git grep X rev -- file` |
| later matches missing | `\| head -N` (or `\| tail -N`) truncates with no error | state the denominator, or drop the cap — see the section below, this is the narrow case of a general hazard |

### A truncating or discarding stage turns a failure into a green

`grep` is one instance; the class is **any stage between a command and your
eyes that can drop the part carrying the verdict**. It never reports that it
dropped it, so the output is not "wrong", it is *indistinguishable from success*
— which is why re-reading it more carefully cannot help. Three of these were hit
on one day, by three different people, each already knowing the rule:

| What was read | What it actually showed | Why it read as a pass |
|---|---|---|
| `cargo test 2>&1 \| tail -25` | `[exited with code 0]` for a run that **failed to compile** (`no field 'errors'`; it is `diagnostics`) | the compile error scrolled past the window, and `$?` came from `tail` |
| `cargo clippy 2>&1 \| tail -40` | dependency crates and `Finished` — the target crate's own line was outside the window | a clippy run that is clean and one that never reached your file print the *same nothing* |
| `pgrep -c … \|\| echo 0` | `0` | the `\|\|` arm fabricated a datum that reads exactly like a measurement |

Rules, in the order they are cheap:

1. **Never read a verdict through a truncating stage.** Run the command bare, or
   put the filter *after* capturing the status (`PIPESTATUS[0]`, or write to a
   file and grep the file). `2>/dev/null` and `|| echo <literal>` are the same
   hazard wearing different clothes: the first throws away the half that carries
   the failure, the second manufactures the answer.
2. **When "pass" is spelled as silence, the run needs a positive control.**
   Introduce the defect the check exists to catch, confirm the check goes red,
   remove it, and confirm the tree is byte-identical again (`git diff` empty).
   Only then does the quiet run mean anything. This is the same argument as the
   negative-grep control above, one level up: an empty result is evidence only
   once you have shown the instrument can produce a non-empty one.
3. **State the denominator.** "No warnings" is a claim about a population; say
   which one (`-p <crate> --lib --tests`), because the reader cannot tell from
   the output whether your file was in it.

### Working with Subagents

Use the `Agent` tool for substantial work — feature implementation, multi-file refactors, broad code exploration, or anything likely to consume meaningful context.

- `Explore` — codebase exploration and search across many files
- `Plan` — design implementation strategy before non-trivial work
- `general-purpose` — multi-step implementation and research
- For trivial single-file edits, work directly without spawning a subagent.

### Commit Guidelines

- Commit frequently, one logical change per commit
- Run `cargo fmt && cargo clippy --all-targets --all-features -- -D warnings` before committing
- Push immediately after committing
- Releases are automated via Changesets Release PRs
- After a successful publish, `scripts/release/comment-released-versions.mjs` comments the exact
  `package@version` on every PR whose changeset shipped and on the issues that PR closed. The
  mapping comes from the CHANGELOGs, not the commit range: `@changesets/cli/changelog` prefixes
  each entry with the hash of the commit that added the changeset, so a PR with no changeset —
  chore, test, docs — is deliberately not commented on. Preview with
  `node scripts/release/comment-released-versions.mjs --base <prev-release>^ --dry-run`
- A **brand-new** platform package cannot be published by CI: npm OIDC trusted publishing
  only works for a name that already exists. Bootstrap it once with
  `pnpm run bootstrap-platform-packages -- --run <ci-run-id> --yes`, attach the trusted
  publisher on npmjs.com, then re-run the release

### Maintaining This File

- Document new knowledge and patterns discovered during development
- Update test status and feature lists as work progresses
- Remove outdated information and keep it concise

## Test Status

<!-- svelte-target-version -->Source: `pnpm run compatibility-report` (Svelte **v5.56.10**).<!-- /svelte-target-version --> Re-run `pnpm run test-and-update`
to refresh. The runtime skip lists and the fixture-generation compile options are shared
constants in `crates/rsvelte_core/tests/common/mod.rs`, so the report and the gates
(`tests/runtime.rs`, `tests/ssr.rs`) always measure the same thing;
`crates/rsvelte_core/tests/audit_skipped.rs` re-checks every skipped fixture after a
Svelte bump.

| Suite | Pass/Total |
|-------|------------|
| Parser Modern | 27/27 |
| Parser Legacy | 81/81 |
| Compiler Errors | 145/145 |
| Compiler Snapshot | 30/30 |
| CSS | 181/181 |
| Validator | 333/333 (warnings compared by full shape since #2452 — see below) |
| SSR | 99/99 |
| Hydration | 79/79 |
| Runtime Legacy | 1207/1207 |
| Runtime Runes | 1007/1007 |
| Runtime Browser | 32/32 |
| Print | 43/43 |
| Preprocess | 19/19 |
| Sourcemaps | 29/29 (output equality; map correctness has its own gate below) |
| svelte2tsx | 253/253 |
| Migrate | 0/76 (out of scope) |

All in-scope fixtures pass (100.0%). The 76 `migrate` fixtures (Svelte 4 → 5 migrator) are
intentionally out of scope: rsvelte is a Svelte 5 compiler port, not a migration tool. Do
not start migrate work without an explicit scope change.

**`Validator 333/333` did not move when it was made falsifiable, and that is the interesting
part.** Until #2452 the report scored a validator sample on `actual_count ==
expected_warnings.len()` — never the code, never the message, never the span — so the row was
a warning *arity* check wearing a parity label. It now runs the same ordered
`(code, message, start, end)` comparison as `tests/validator.rs`, with no `filename`, mirroring
upstream's `test.ts`. Measured both ways on the same tree: unperturbed it is 333/333 under
either rule, and with one warning's message text deliberately altered it drops to **322/333**
under the shape rule while the count rule still reports **333/333**. Cite the number as
"333/333 on full warning shape"; a bare 333/333 meant something weaker before this commit.

### Source-map gate

The `Sourcemaps` row above only compares generated `client.js` / `server.js` output. Map
*correctness* is gated by
`crates/rsvelte_core/tests/sourcemaps_gate.rs`, which ports the `_config.js` anchor assertions
from `packages/svelte/tests/sourcemaps` and adds two structural budgets (official segments
reproduced; segments pointing outside the source), ratcheted shrink-only through
`compatibility/sourcemap-known-failures.json` with per-entry justification in the paired `.md`.
Server maps are accurate; client maps are chunk-granular (issue #1781) and are the burndown
target — regenerate the baseline with `UPDATE_SOURCEMAP_RATCHET=1 cargo test -p rsvelte_core
--test sourcemaps_gate -- --ignored sourcemap_gate_measure`.

### Formatter parity corpus (svelte.dev)

Asserts rsvelte formats real svelte.dev sources byte-for-byte like an **oxfmt(`svelte: true`)**
oracle (`prettier-plugin-svelte` for Svelte structure + the oxc engine for embedded JS/CSS),
so a diff isolates rsvelte's Svelte-structure formatting. Oracle outputs are precomputed by
`pnpm run generate-fmt-corpus` (gitignored, CI-cached by svelte.dev SHA). Stage 1+2
(`crates/rsvelte_formatter/tests/svelte_dev_corpus.rs`) covers every `.svelte` file and
` ```svelte ` markdown block; Stage 3 (`crates/rsvelte_fmt/tests/svelte_dev_markdown.rs`) runs
the real `rsvelte-fmt` CLI on whole `.md` files. Both need a runnable `oxfmt` and no-op when
absent. **Hard gate, no baseline tolerance:** any divergence fails CI.

`rsvelte-fmt` formats CSS in-process via the Rust `oxc_formatter_css` crate (the same engine
`oxfmt` uses, byte-identical without a subprocess) — for embedded `<style>` blocks, standalone
`.css`/`.scss`/`.less` files, and the wasm formatter. `--no-native-css` reverts to the legacy
`oxfmt`-subprocess path. Native-CSS parity is covered by
`crates/rsvelte_formatter/tests/css_native.rs` and `crates/rsvelte_fmt/tests/cli.rs`.

`rsvelte_fmt` is a lib + bin: `rsvelte_fmt::FormatSession` runs the CLI's
`--stdin --stdin-filepath` pipeline (config discovery, option layering, extension
dispatch) in process, so an embedder never re-implements it.

## Ecosystem Port

| Wave | Scope | Status |
|---|---|---|
| 1 | svelte2tsx | ✅ 253/253, wired into the compatibility report |
| 2 | svelte-check | ✅ v1.0 — walker + overlay + tsgo + incremental cache + watch + parallel compile + hires source maps + SvelteKit kit-file augmentation; reads diagnostic-relevant `compilerOptions` from `svelte.config.*` and `vite.config.*` |
| 3 | vite-plugin-svelte | 🟢 v1.0 — Rust NAPI bindings (`hmr_diff` / `resolve_id` / `preprocess`) + `@rsvelte/vite-plugin-svelte` shim at `apps/npm/vite-plugin-svelte`; supports Vite 6/7/8 |
| 4 | svelte-language-server | ✅ M5 — native Svelte/HTML/CSS/TypeScript features, preprocess-aware projections, upstream-compatible VS Code distribution, five native platform packages and archives, plus Neovim, Zed, Sublime, Helix and Emacs setup |

Wave 4 architecture (decided; tsgo ships an LSP server as of TypeScript 7, so the earlier
"waits on tsgo `tsserver` mode" blocker no longer applies):

- The server is a **Rust binary** (`crates/rsvelte_language_server`) calling `rsvelte_core`
  directly. `@rsvelte/language-server` becomes a thin launcher — the JS boundary is dropped
  because `forward_map`, source maps and lint `Fix`/`Suggestion` data never crossed it.
- **TypeScript features proxy a child tsgo LSP** over an in-memory `.svelte` → virtual `.tsx`
  overlay, reusing `svelte_check/{overlay,mapper,kit_file}.rs`. tsgo has no plugin API, so the
  server owns `.ts`/`.js` documents too instead of porting upstream's `typescript-plugin`.
- **HTML/CSS language features are implemented natively in Rust** (vendored MDN data), not
  delegated to `vscode-{html,css}-languageservice`.
- Ships its own TextMate grammar / language definition and accepts upstream `svelte.*`
  settings, so users replace the official extension rather than running both.

### Where `rsvelte-check` time goes (`RSVELTE_CHECK_TIMING=1`)

`runner::run` prints a walk / compile / overlay / typecheck / post split to stderr under
`RSVELTE_CHECK_TIMING`. Measured on synthetic 100- and 500-component projects (TS 7.1 `tsc`,
`skipLibCheck`, idle machine, 3 runs each): **typecheck is 66-89% of the run**, overlay
materialization 8-29%, walk + post under 2% together.

**The overlay is not the lever, and a diskless overlay is not available anyway.** A batch
`tsc -p` reads its program from disk, so the LSP's in-memory projection has no counterpart
here — and even a free overlay caps the whole run at 1.1-1.4x. It does have a shape worth
knowing: 500 components materialize **2,005 files** (`.svelte.tsx`, `.svelte.tsx.map`, and two
byte-identical `.d.ts` bridges each), ~310 ms to rewrite.

**`--incremental` is the largest measured lever and it is off by default.** On the
500-component project a warm run drops from 1693-2147 ms to 254-319 ms — **5.4-6.7x** — because
the overlay tsconfig already carries `incremental` + `tsBuildInfoFile`, so tsgo reuses its
program graph instead of re-checking ~2k files. The default stays off on purpose: official
svelte-check's flag is opt-in too, and its README states the mode "might result in slightly
different type check outcomes". Flipping it trades goal #3 for speed on a mode upstream itself
calls lossy.

### Type-aware lint opens one worker, not one per component

`CorsaTypeBackend::new` used to spawn a `tsgo` API worker, write a virtual `.tsx` plus a
tsconfig, and build a program **per component**. Measured over the 76 upstream
`no-unused-props` fixtures (one test binary, both arms, ABBA-ordered, 5 pairs): 6.62-11.02 s
per-spawn against 1.23-2.94 s on one warm `CorsaTypeSession` — **≥4.3x**, a lower bound because
the Rust side is a debug build in both arms. `lint_components_types` batches a project.

**One program for all components is NOT the win; the warm process is.** 62 fixtures in a single
program measured 26-39 ms/component against 23-58 ms/component for a project-per-component on
the same worker — no separable difference. Those fixtures are independent files, so a shared
program shares no module graph; whether a real project (whose components import each other)
profits is **unmeasured**.

The refactor also surfaced a harness defect worth remembering: `invalid/` and `valid/` hold
same-named fixtures while the temp dir was keyed on the stem alone, so the second one was served
from the first one's cached project. **Reversing the iteration order moved the failures to the
other directory** — with a cold worker per fixture the collision was invisible.

`rsvelte_lint` (native Svelte linter: validator/a11y wrap + a native port of
`eslint-plugin-svelte`'s rules, `crates/rsvelte_lint`) ships as its own npm package,
[`@rsvelte/lint`](apps/npm/lint), fixed-versioned with `@rsvelte/compiler` via Changesets.
Its real-world parity corpus ratchet lives at `compatibility/lint-known-failures.json`.

**A lint rule ported as a text scan is a defect waiting for the right input, and the collected
corpus is the wrong instrument to find it.** That corpus graded 73k findings across 6.7k
published files and sat at 104 divergences — saturated enough to read as "close". A
*constructed* corpus (`compatibility/lint-adversarial/`, 808 patterns written by reading each
upstream rule and asking what a plausible port gets wrong) reported **330 on its first run**,
against the same comparison key. The recurring causes were not exotic: a `;`-split style-attribute
scanner blind to CSS comments and quoted strings; `this={…}` on `<svelte:element>` missing from
the attribute list, so five rules never saw it; ASCII whitespace where upstream uses JS `\s`
(NBSP, FEFF, `\v`, `\f`); binding resolution by NAME rather than by scope, which is both a false
positive on a shadow and a false negative past one; element hooks implemented for
`RegularElement`/`Component` only, while upstream visits every start tag; and script-only rules
that never look at a template event handler. Fixing them took the adversarial corpus to 4
accepted entries and the collected one from 104 to 45 — **the collected corpus had been
suppressing 62 of its own entries' worth of defects it could not phrase**.

That corpus has since grown to **1,365 patterns** across the four axes below, and the tree now
stands at **4** accepted adversarial entries and **3** collected ones (6,788 real-world sources,
73,378 findings compared). Read the composition before reading the count: **every remaining entry
is upstream-side or deliberate** — two `svelte-eslint-parser` artifacts (`</style⏎⏎>` produces no
`SvelteStyleElement`; the block-blanking regex is case-insensitive, so `<Style />` is treated as a
style tag), the `globals.browser ∖ globals.node` split, and rsvelte's choice to treat a CSS
`svelte-ignore` on an un-preprocessed `lang="scss"` block as *used*, which is also all three
collected entries.

**The one entry that was an rsvelte limitation is gone, and how it was closed is the reusable
part.** `sort-attributes`'s `order` option takes JS regexes; Rust's `regex` has no lookaround, so
`"/^(?=x-)x-a$/u"` failed to compile and the group was **silently dropped**. The listed
justification declined a lookaround-capable engine on performance grounds — correctly, if the
choice were all-or-nothing. It is not: `regex` is tried first and every default pattern still
compiles there, so `fancy-regex` is reached only by a pattern `regex` rejects and the backtracking
engine never touches the hot path. When a dependency is refused on a cost that only applies to the
*default* path, ask whether the fallback can be made unreachable from it.

Three method notes, each of which cost real time here:
- **Two of the remaining entries are not rsvelte being wrong**, and neither is discoverable
  from the divergence alone: `svelte-eslint-parser` builds no `SvelteStyleElement` for
  `</style⏎⏎>` (so upstream's rule never runs), and upstream's browser-global set is
  `globals.browser ∖ globals.node`, which modern Node empties of `navigator`. Probe the oracle on
  a minimal input before porting a behaviour; the divergence names a symptom, not a cause.
- **The oracle was an npm install, not a pin.** Floating ranges under `--no-package-lock` moved
  three ratchet entries with no rsvelte change — proven by building the pre-campaign binary and
  finding its output byte-identical on those files. Versions are now exact, and `eslint` is held
  at 9 because eslint-plugin-svelte 3.23.0's `no-reactive-functions` calls an API ESLint 10
  removed: under 10 every positive report for that rule throws and the file is scored
  *unparseable* rather than compared, hiding a whole rule's positive population from both gates.
- **A fixture on `eslint_plugin_oracle.rs`'s SKIP list is graded by nothing else** unless some
  corpus happens to contain its shape. The store rewrite here silently lost six findings on such
  a fixture (a computed property key serializes with its start at the `[`, which matches no oxc
  reference); the fixture gate was green, the adversarial corpus was green, and only the
  collected corpus caught it. When adding a SKIP entry, name the gate that now holds that shape.

**Four more axes were added after that, and each found defects the report key cannot express.**
The report gate compares `(ruleId, line, column, message)` over files that all share one ancestry,
which leaves four things unobservable: the text `--fix` produces
(`lint-adversarial-fix.mjs`), a suggestion's `{desc, resulting text}`
(`lint-adversarial-suggest.mjs`), a finding's **end** position (`lint-adversarial-end.mjs`), and
**what the project declares** (`lint-env.mjs`). Their first runs found, respectively: fix
divergences on rules whose report position was already right; 5 suggestion divergences at
positions where the report key *already agreed*; **670 end-position divergences over 4611
compared findings across 20 rules**, four of which were reporting a zero-width range; and a class
nothing could see at all.

**The autofix gate enables ONE rule per pattern, and the rule it picks is the pattern's directory
name — so a rule is never run on a pattern filed under a different rule.** That is not the same
scope limit as "cross-rule fix scheduling is ESLint's driver policy", which is why the per-rule
scope was chosen; it is a whole population of single-rule behaviour the gate cannot reach.
`lint-adversarial-fix-all.mjs` enables all 74 at once and found it immediately: rsvelte's `--fix`
filtered `eslint-disable*` directives on `LineIndex::line` while the report path filtered on the
line the finding is *reported* on — ESLint's table, which counts U+2028/U+2029, for the seven rules
in `uses_eslint_line_table`. So `--fix` rewrote a source whose report was suppressed, and skipped a
finding it had just reported, both with `svelte/html-quotes` alone. Of the 21 non-parity units on
that gate's first run over 1364 patterns, **zero** were unattributable driver-policy noise — 16
reproduce the per-rule gate's own entries, and the rest each have a named cause (including an
upstream crash: `no-useless-mustaches` rewrites `href={``}` to `href=""`, then
`no-navigation-without-base` indexes an empty `value` array).

Three lessons generalize past the lint gates.

**A rule's suggestion did not exist in the machine-readable output.** `render` dropped the
`fix`/`suggestions` payload at the `LintMessage` → `Diagnostic` boundary, so the axis had to be
*built on both sides* before anything could be compared — "what does the gate not look at" is
sometimes answered by "a field the product does not emit".

**The end position is a separate ratchet for the reason `start`/`end` already are on the
compiler-error gates**, and it is compared only where the start already matches: a finding one
side does not report has no counterpart. That couples the two gates in one direction — **fixing a
start divergence ADDS rows to the end gate** as newly-matched findings become comparable, which
is expected rather than a regression.

**The environment is an input, and every population had it fixed.** eslint-plugin-svelte resolves
`@sveltejs/kit` **from the linted file's path** and disables five rules without it, while
`compatibility/lint-adversarial/package.json` declares it for the whole adversarial corpus — so
"is SvelteKit installed" was a constant no gate could vary, and rsvelte had no notion of the
condition at all. `compatibility/lint-env/` holds mini-projects whose sources are byte-identical
and whose `package.json` is the only variable; the gate refuses to run if that invariant is
broken, and refuses to pass if every project yields the same oracle count (which would mean the
manifests separate no rule). Two related conditions were also declared-but-unread: `RuleConditions`
was set on every rule and consumed by nothing, so the seven rules upstream disables in runes mode
ran on `.svelte.(js|ts)` modules — which **are** runes mode by definition. Ask of any gate whose
oracle reads the filesystem: *what did the checkout provide that the sources did not?*

**The module surface is a second code path with almost no population.** A `.svelte.(js|ts)` goes
through `classify_source` → `SourceKind::Module` → `run_script_rules_module`, and the corpus held
18 such files out of 1069. Re-hosting every pattern's instance `<script>` body as a standalone
module produced **128 divergences**, and one of the causes was that the module entry point was
handed a bare basename instead of the file's path, so every filesystem-aware rule was blind
there. A separate code path carrying 1.7% of the population is where defects live.

**Two program-path ESTree gaps surfaced through these, and both were rule-agnostic.**
`convert_class_element_for_program` dropped a class `static {}` block entirely (`_ => None`), and
the function converters never consulted `this_param`, so a TypeScript `this` parameter was absent
from `params` — which TSESTree models as an ordinary `params[0]`. Every JSON-walking rule was
blind to both. Codegen was unaffected (verified against the official compiler), so the blast
radius was the JSON program the linter and svelte2tsx read.

**Three more of the same class are open, and one is now hidden behind a per-rule workaround —
which is the part to remember.** The serialized program still drops a
`TSTypeAliasDeclaration` entirely (`convert_statement_for_program` has no arm; it falls to
`_ => None`), omits `params.rest` for a `function` **statement** while the *exported* form already
guards it (so `function f(...a)` and `export function f(...a)` disagree with each other today), and
never emits a function's `returnType`. Every JSON-walking rule is blind to all three. `no-inspect`
now looks correct on those shapes only because it tops its walk up from a direct oxc parse of the
script slice — so **the gate is green and the gap is untouched**, and the next rule to need any of
those nodes will rediscover it. A fix belongs in
`crates/rsvelte_core/src/compiler/phases/1_parse/read/expression.rs`; `returnType` additionally
needs a new field on `JsNode::FunctionDeclaration`, a type the compiler, svelte2tsx and every rule
share. Two adjacent AST divergences found the same way: a template `import('svelte/internal')`
serializes as a `CallExpression` with `callee: Identifier "import"` rather than an
`ImportExpression`, and a `FunctionBody`'s `directives` are dropped, so
`() => { 'use strict'; return a; }` serializes as a block with one statement.

**Every gate configures all shared rules to `"warn"`, which makes the CONFIGURATION a constant
they cannot vary — and two axes were hiding inside it.** `lint-preset.mjs` (gate 33) compares the
default severity per rule id, and `lint-conditions.mjs` (gate 34) compares whether a rule runs at
all in each Svelte mode. Both are recorded-difference ratchets rather than equality assertions,
because rsvelte's `recommended` preset is a documented curation of its own and asserting equality
would encode a product decision as a correctness claim.

What they found: **21 rules that upstream defaults to `error` and rsvelte defaulted to `warn`** —
and severity decides the exit code in both tools, so `rsvelte-lint` exited 0 where `eslint` exits
1 on the same source. All 21 were fixed rather than listed, because rsvelte already agreed with
upstream on every rule whose severity was not the blanket `warn` (11 `error`, 2 `warn`, 13 for 13)
and every divergence ran one direction — the shape of an incomplete transcription, not a policy.
Three `RuleConditions` flags likewise disagreed, each making rsvelte run a rule ESLint skips.

**Both of those read a declared table, and running the tables is a third gate.** `lint-severity.mjs`
(gate 36) drives upstream's `flat/recommended` verbatim against `rsvelte-lint` with no `--config`
and compares the findings *with severity in the key*, plus the process **exit code**. The rule-set
half came back confirmed — **0 severity divergences over 1,179 / 1,178 findings** — while the exit
code diverged on **64 of 1,365 patterns**, and that half is what generalizes. Fifty-nine were
rsvelte exiting 1 on a Svelte **compiler** diagnostic `svelte-eslint-parser` is too permissive to
see, and **the gate's value was the 4 of those 59 that were rsvelte over-rejections** rather than
the 55 the official compiler also rejects: a `$`-prefixed class member NAME read as a store
reference, and explicit legacy mode not turning a rune-named `$` reference into a store
subscription (#3127 / #3128, both entered through `2_analyze/store_subscriptions.rs`). Both are
fixed and the bucket now stands at 55, every one of which official rejects too. Four more are a rule
`lint-universe.mjs` excludes as type-aware, still reporting at `error` upstream: **an `EXCLUDE` entry
removes a rule from a finding comparison and cannot remove it from the exit status**, so a
findings-only gate has no view of what a switching user's CI does. And driving the *default* preset
reached a rule no other gate enables, which throws on `<a href="…" rel>` and takes the file's whole
report with it — a configuration nobody had ever run was holding a live upstream crash.

**Two reductions in those gates were non-discriminating on the first attempt, and both were caught
by their own arithmetic rather than by review.** Keying the preset gate on membership alone
reported the 21 severity divergences as agreeing. And reducing `meta.conditions` by unioning across
**all** condition objects — instead of only those whose `svelteVersions` admits `'5'` — reported six
correctly-gated rules as wrong, because a `{svelteVersions:['3/4']}` object constrains nothing on
the runes axis while being unreachable here. Ten rows, six of them artefacts. When a gate's key is
*derived* rather than read, the derivation is the thing to test first.

**A gate that reads a machine format cannot see a bug in the format a human reads.** All ~8 lint
gates drive `--format sarif`. `Position::column` is stored zero-based (SARIF adds 1; the LSP shape
consumes it as stored), and `write_human` / `write_github_actions` printed it raw — so **every
column in the default CLI output and every CI annotation was one short**, `4:0` where ESLint prints
`4:1`, while `machine` and `sarif` were right. The `github-actions` unit test asserted the wrong
value, encoding the behaviour instead of the convention. Ask of an output gate not only "what does
the key drop" but "**which serializer does the oracle exercise**".

**The next question after that is which ENTRY POINT it exercises, and it found a fourth copy of one
decision.** All ~8 lint gates drive the CLI, so every one of them goes through `runner.rs`; the wasm
playground and the NAPI addon instead wrap `json_api.rs`, which **no gate drives**. Both must decide
the same thing — the seven rules in `uses_eslint_line_table` report on ESLint's table, where U+2028 /
U+2029 end a line, and every other rule reports on the parser's — and `json_api` answered it with a
blanket `line_index.position()`, so the bindings put those seven rules on a different line and column
than the CLI does for one source. It could not have shared the CLI's answer even in principle:
`report_line` and `uses_eslint_line_table` were `#[cfg(feature = "native")]` while `json_api` is not,
which is the mechanism that let a fourth copy exist. The decision is now one un-gated
`LintDiagnostic::report_span`, with the four upstream-measured verdicts pinned as a test — a directive
is located on the parser table and filtered against the reporting rule's table, so **a U+2028 before
the directive shields the parser-table rule and not the ESLint-table one, and one after it shields the
reverse**. When a shared crate has a native and a non-native surface, `#[cfg]` is where the ports
diverge silently.

**A probe that uses a configuration no user writes measures a different product.** `extends:
["none"]` — which only the gates use, to isolate one rule — also disables the parse-error
diagnostic, so a probe run that way showed `rsvelte-lint` silently passing unparseable files with
exit 0. Under the default config it reports and exits 1, as ESLint does. What *was* real: the
message was a `{:?}`-formatted Rust struct with `range: None`, so no line:column reached the user.
Related measurement worth keeping: rsvelte's parser is the **compiler's**, and
`svelte-eslint-parser` is deliberately more permissive — 3 of 1355 adversarial patterns parse there
and not here, against **0 of 6788 real-world files**. Do not "fix" that by loosening the compiler
parser; the divergence lives only in inputs written to be invalid.

**A rule's fix path and its report path are two implementations, and only the autofix gate
compares them to each other.** `prefer-class-directive` reported through `js_whitespace` (JS
semantics, U+FEFF is whitespace) and trimmed through Rust's `str::trim*` (Unicode `White_Space`,
U+FEFF is not), so a `class` value padded with U+FEFF was reported at the identical position on
both sides and rewritten differently. Every gate keyed on `(ruleId, line, column, message)` is
blind to that split by construction — the same "two ports of one function, and no gate compares
the ports" shape recorded for the client/server constant fold, one level down.

**rsvelte's `parse()` accepts a document official's `parse()` rejects**, and the linter is only
where it was noticed. `svelte_meta_invalid_placement` — `<svelte:head>` inside an element — is
raised by upstream from `phases/1-parse/state/element.js:161` and by rsvelte from
`phases/2_analyze/visitors/svelte_head.rs:31-32`. Anything that parses without analyzing
(svelte2tsx, the language server, `rsvelte-lint`) therefore sees a valid tree where the official
toolchain sees a fatal error. It surfaced as an autofix divergence: ESLint's `verifyAndFix` stops
when a pass produces text its parser rejects, so upstream fixed one nesting level and stopped
while rsvelte relinted cleanly and fixed the next. Zero of 6,788 real-world sources reach it.

**Rule OPTIONS are the axis this corpus is now saturated on, and the measurement is worth keeping
because "each rule has an option pattern" is the non-discriminating version of it.** 29 of the 76
rules declare an options schema and 28 are exercised with a non-default option somewhere — but
that counts *reaching* the option, not covering its values. Enumerating every enum and boolean
**value** in those schemas gives 43 unexercised values, of which 40 are the rule's own code default
(the schemas declare no `default`, so the default has to be read out of the `??` / `||` at the
consumption site — reading it off the schema reports the default as a gap) and are covered by every
option-less pattern in the directory. Of the three that remain, `sort-attributes.alphabetical` is
**dead upstream** — declared in the schema, read at zero sites, and rsvelte matches by also
ignoring it — leaving exactly one real gap: `block-lang.enforceScriptPresent: true`, which inline
`/* eslint … */` configuration structurally cannot reach, since the arm fires only when there is
no `<script>` and ESLint reads inline config only from a JS comment. It was checked by hand with an
explicit config instead; both sides report at 1:2 with the same message.

**Finding ORDER is dropped by every lint gate (they build a `Set`) and was measured clean.** Over
the 978 adversarial patterns with ≥2 findings, both sides emit in non-decreasing position order
with 0 violations each and 0 files differing in the order of their positions; 73 differ only in
which rule wins a same-position tie, which upstream derives from rule registration order and does
not document. Recorded so the axis is not re-opened as an unknown.

### Type-aware lint suite (out-of-workspace)

`crates/rsvelte_lint_types` (the corsa/`tsgo` type-aware backend) is its **own Cargo
workspace** — it path-depends on `submodules/corsa-bind`, whose corsa client stack
nothing else needs, so the root `cargo test` and the CI shards never build it (nor
does the root `cargo fmt` / `clippy`). `submodules/corsa-bind` is **public**; it
clones with no credentials. Run the suite with `pnpm run test:type-aware-lint`,
which checks out the submodules, installs the **pinned**
`@typescript/native-preview` (`scripts/dev/type-aware-lint/package.json` — exact
version because upstream publishes dated dev builds and the tests assert exact
diagnostic text), and runs the 9 tests. A missing binary **fails** instead of
skipping. Do not point it at `$TSGO_BIN`: that names a batch `tsc`/`tsgo` for
`rsvelte-check`, whereas this backend needs a `--api` server (`$CORSA_EXECUTABLE`).
`.github/workflows/type-aware-lint.yml` runs fmt + clippy + the suite on changes to
the crate, weekly, and on dispatch.

Because it is a separate workspace, its `Cargo.lock` is never re-resolved by the root
`cargo test` — any in-repo crate version bump (a Changesets release, a manual
`rsvelte_esrap` bump) staleifies it, and the `--locked` suite above only notices on the
next PR that happens to touch the lint crates. The `Lint-types lockfile` job in `ci.yml`
runs `scripts/ci/check-lint-types-lock.mjs` on **every** PR (resolution only — no
compilation) so drift fails on the PR that introduces it; `pnpm run fix:lint-types-lock`
repairs it. `pnpm run version-packages` re-runs the same check after `sync-version`, so a
release PR cannot ship a stale pin.

## Quick Reference

### Adding Features

1. Check `submodules/svelte/packages/svelte/src/compiler/phases/{phase}/` for the reference implementation
2. Implement in the corresponding Rust module under `crates/rsvelte_core/src/compiler/phases/`
3. Run tests: `cargo test`
4. Debug differences with `node scripts/diff/compare-parsers.mjs`

### Documentation Updates

```bash
pnpm run test-and-update  # Updates README.md
```

### Compatibility Report

Default output path: `fixtures/{svelte-short-commit}/compatibility-report.json` (the
`fixtures/` directory is generated, not checked in). Override with
`node scripts/dev/update-docs.mjs --report <path>`. Tracks test results over time.
