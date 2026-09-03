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
| a backtick opens a template literal | a ```` ```svelte ```` fence inside a JSDoc comment |

**The justification is that these defect classes are unreachable in an AST pipeline** — and
that stands on its own, so it is what to lead with. The performance case is no longer the
argument against it that this paragraph used to make. Re-parsing is 3-4% of compile time,
the profile is flat (no symbol in rsvelte's own code above ~1.6% self-time), and per-pass
`SemanticBuilder` construction measured ~2% with a 3.3% ceiling (#2602) — all still true, and
all counting only the *parse calls*. The **byte scanning** was never in that denominator, and
it is 11.53% of `compile()` on the client and 14.73% on the server, of which 9.78% / 12.20%
sits under `3_transform` and exists precisely because there is no AST to ask where a
statement ends (`str::pattern`, `memmem`, `js_scan::skip_opaque`; measured 2026-09-02, 3000-file
slice, symbols classified by module path with two-sided controls). Read that as **an upper
bound on what becomes unreachable, not as a saving**: an AST pipeline pays its own walk, and
`str::traits::get` at 36 ms on the server is bounds-checked slicing that partly survives. How
much of it is actually recovered is unmeasured.

Two cautions before treating any of this as closed. The parse gate (#2591) catches only the
loud half, and **how loud a given defect is depends on the input, not on the defect**: #2603's
one mis-splice made 9 files unparseable and 6 files parseable-and-wrong (one assigns a boolean
instead of a ternary's result), and #2598 emitted a bare `$:` labelled statement that every
parser accepts. Sizing a text-scanning defect by its parse-gate count therefore understates it —
see gate-coverage 19a, where both are recorded as discriminating cases. And the four corpora that
produced every one of these defects — huly, open-webui, carbon-components-svelte, SMUI — **were
not corpus sources at the time**, so the gate baselined at 0 while the instances lived outside the
population it inspected; that is why each fix lands a `compatibility/pattern-corpus` repro. All
four are corpus sources now (**#3176** took the corpus to 103 repositories; this file and
`KNOWN-FAILURES.md` cited #3130 — an unrelated CSS issue — 16 times, and the sweep that
corrected them named its own scope as "15 sections", leaving the sixteenth alive in `GATES.md`
for a month), which closes the
population hole for these particular four and for nothing else — the lesson is that the gate's
population is a choice, not a given.

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
[`compatibility/GATES.md#two-ports-inventory`](compatibility/GATES.md#two-ports-inventory).** Every gate here
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

**A comment that COUNTS its siblings is the same hazard with a number in it, and the number is
the part nobody re-derives.** `reactive_transforms.rs` lowers a `$:` body by branching on the
shape of its left-hand side, and the pass that wraps a state member write in `$.mutate` was
missing from one of them. The fix landed with a note saying the keyword branch "was missing this
pass that **both sibling branches** have" — accurate about the two it names, and there are
**eight**. Measured one cell per branch against upstream, **five** were missing it, so a mutation
nested in a `$:` right-hand side (an arrow body, say) was emitted as a plain write on a prop, a
state, a member, a computed-member and a non-reactive left-hand side alike, and the read pass then
rewrote its root to `$.get(o)` — a write that parses, runs and never invalidates. The comment did
not merely fail to prevent the next instance; **it argued the enumeration was closed**, in a file
where the branches are 150 lines apart and nothing lists them. Two rules: when a note names a
count, the count is a claim to check, not context; and when a defect is "a pass is missing from a
branch", the repro is one cell per branch, because a fix that reaches the reported branch and one
neighbour looks exactly like a fix that reaches all of them.

**And an enumeration whose members came from bug reports is not an enumeration of the
grammar.** `find_class_header` locates a class body by taking the first `{` at bracket depth
zero after the header, and it counted one thing that can put a brace there first — a nested
`class` expression. `class A extends function () {} { e = $state(5) }` therefore treated the
*function's* body as the class body and never privatised the field. A heritage is a
`LeftHandSideExpression`, which closes the domain: a class expression, a function expression in
its four spellings, and an object literal in primary position, with everything parenthesised
already at depth > 0 and a template's braces not code bytes. Measured one cell per member,
**eight of eighteen diverged and the reported shape was one of them**. Adding `function` to the
list would have been the same mistake one level down; the fix is `class` OR `function` opening a
pending body, plus a `{` reached with no code byte since `extends`. Ask where a scanner's list of
cases came from: if the answer is "the shapes someone hit", the list is a work log, not a
partition. **The grid's other half earned itself in the same hour**: the first fix spelled "no
brace-producing primary yet" as "no *code byte* since `extends`", and `js_scan::code_bytes`
skips a template literal whole — so `` extends `${1}` `` produced no code bytes at all and the
class body was skipped as if it were an object literal. That row had been **passing before the
fix**, which is the only kind of row that can report this: a grid assembled from the cells a
defect breaks has no cell left to regress.

The other half of the same day's work is the ordinary two-ports shape wearing a host: upstream
stops an assignment target's root walk at anything that is not a `MemberExpression`
(`AssignmentExpression.js:104-112`), so `stage.container().style.cursor = 'grab'` has no root
binding and is not a mutation. rsvelte's `get_base_object` walked *through* a `Call` via its
callee and wrapped it. Only the **template-expression** port did — an arrow declared in
`<script>` reaches a different implementation and was already right — so the axis that separates
them is the host the arrow is written in, not the binding or the expression. That is the
`write-host` lesson (binding × host) arriving at a second site.

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

### A justification's own numbers are the cheapest way to check the justification

`reason is not attribution` says a prose justification explains why a divergence exists
without saying where it is answered. There is a worse case: the prose can name the wrong
**owner**, and then the entry stops looking like work at all. A `fmt-oracle-excluded.json`
entry was classed `engine-divergence` with the reason "oxc vs prettier template-literal
\`${}\` substitution indentation … rsvelte delegates to `oxc_formatter`. Upstream
oxc-alignment item." Measured on two arms, `oxc_formatter` was **identical in both** and
only rsvelte's embedding moved — the entry was an rsvelte defect filed as an upstream one,
which is the one classification that makes an entry look like it cannot be worked.

What is reusable is that the reason **falsified itself**. It cites the oracle indenting to
8/10 spaces where oxc uses 4/6 — a *uniform* offset, and a uniform offset is not what a
line-breaking disagreement produces; two engines that disagree about where to break do not
agree about every column by a constant. So the numbers a justification quotes to sound
specific are the ones that can be checked without reproducing anything: read them for
internal consistency with the mechanism they name, before spending an arm on it. An
attribution to "upstream" deserves that read first, because it is the only attribution
whose consequence is that nobody ever measures it again.


### Where compile time goes ([`docs/phase3-ast-refactor-plan.md`](docs/phase3-ast-refactor-plan.md) § Findings 2026-08-08)

The 40.3% of non-kernel CPU that a profile attributes to allocation + hashing + memcpy
has been broken down **by site**, and the answer is that there is no site: it takes
26–32 of 322–479 sites to reach half the bucket, and the largest single one is 0.4–1.8%
of compile — under the ~5% code-layout floor. What the measurement did find is a shape:
**rsvelte performs ~1.2 heap allocations per input source byte, flat to three digits
across an 18× file-size range**, which is the mechanism behind "uniformly heavy, slope
not intercept". The identified target is the **representation** — one `Box` per
expression node, and a fresh `String` malloc + `IndexMap` slot + SipHash per JSON object
key, from a small set of distinct static keys. The **mechanism** is confirmed twice over:
`preserve_order` is enabled, so `MapImpl` is `IndexMap` and not `BTreeMap` — and the
stronger evidence is that a recorded profile carries the monomorphised
`get_index_of<String, serde_json::value::Value, str>` and `RandomState` hash frames, which
a `BTreeMap` build cannot produce. `Value::Object(Map<String, Value>)` pins the key type,
so 143 sites spell the malloc literally as `.insert("key".to_string(), …)` and there is no
interning escape short of leaving `serde_json::Value`.

**The "88" in that sentence was wrong and is worth keeping as a lesson about counting.** It
enumerated `#[derive(Serialize)]` structs only, and missed the hand-written serializer in
`ast/typed_expr.rs`, which writes keys through 123 `ser_node!` / `ser_opt_node!` /
`ser_children!` uses — the path that carries `arguments`, `properties`, `superClass`,
`quasis`, `specifiers`. Two independent recounts of the source give **147** and
**166** distinct static keys, unioning different pattern sets. **The 88 cannot be
reconciled with either, because its own population is not recorded**: it appears twice in
`phase3-ast-refactor-plan.md` as a bare assertion, `alloc_sites.rs` contains no key
counting at all (0 hits for `distinct`/`key` against 45 for `alloc`), no other instrument
in the tree counts distinct keys, and the "two independent instruments agree across three
corpora" clause beside it qualifies the **allocations-per-map-entry table that follows**,
not the 88. So "88 is a 1.9x undercount" is unsupported, and so is "88 is the runtime-
observed subset of the 166" — that second reading was offered with a file-and-line citation
whose quoted text does not say it. Both are comparisons between populations, one of which
is unstated. What actually sizes the lever is **key
insertions per compile**, which is unmeasured; the distinct count bounds only how large an
interning table would be, and 88, 147 and 166 are alike trivial for that. **A number that decides nothing is not
merely left wrong — it is left unfalsifiable.** Nothing depends on it, so its derivation
never gets recorded; with no derivation there is nothing to check it against later. Two
people read this one independently, one taking it for a static inventory and the other for a
runtime observation, and **the tree contains nothing that settles which**. Correcting the
figure would have closed the entry and lost that; the derivation's absence is the finding.

The sentence you are reading replaced one that said "wrong by most of a factor of two",
written eight lines below the paragraph retracting exactly that claim, in the same edit —
by the author who had just added the rule about a retraction and its number surviving in
different paragraphs. Writing a rule down does not arm it.

**A correct caution can fire on an unverified premise, and being correct is what keeps the
premise from being inspected.** The caution here — do not compare numbers drawn from
different populations — was exactly right, and it arrived attached to a reading of a cited
passage that the passage does not support (a subordinate clause was read as qualifying the
figure when it qualifies the table beneath it; the file, the line numbers and the quoted
text were all accurate). Because the warning landed on a real problem, nobody asked what it
was standing on. This is the same shape as taking a correct action for a wrong reason, one
level up: the thing that goes unchecked is the *warning's* evidence rather than the
decision's, and a warning is harder to challenge because agreeing with it feels like
diligence.

**A second instance the same day, from the other side: the conclusion was right and only
its EXAMPLE was wrong.** Establishing that a 3000-file `22.64x` and a whole-corpus figure
differ by population rather than by compiler is a `git merge-base --is-ancestor` away, and
that check was run and returned what the argument needed. The paragraph written off it then
named a perf commit as evidence of a compiler difference between the two trees — and that
commit is an *ancestor* of the older tree, i.e. already inside the thing it was cited as
differing from. The real difference is one file under `crates/`, a refactor. Two things
generalize. **An example outlives the argument it illustrates**, because a later reader
takes the concrete commit hash and not the reasoning around it; and a correct conclusion is
the condition under which nobody re-derives the example, which is the paragraph above
turned around — there the warning was right and its citation unchecked, here the inference
was right and its instance unchecked. **The stronger claim was also the true one**: not
"the trees differ only in ways that do not matter" but "exactly one file differs and it is
a refactor". Checking the example did not weaken the paragraph, it sharpened it — which is
the argument for checking it even when the conclusion is not in doubt.

**The reconciliation was nearly skipped on exactly that reasoning, and skipping it would
have cost the finding.** The first recount was 231, and the argument for not chasing the
gap was that the value decides nothing — which is true of the *value* and false of the
*discrepancy*. Chasing it found a method error, not a number: `ser_comments!`'s second
argument is the node's **type name**, not a key (`($map, $type, $start, $end)`), so a regex
reading "second argument of any `ser_*!` macro" counted 79 ESTree type names as object
keys. **`distinct == sites` is the fingerprint** — a real key set repeats (`ser_node` is 73
sites over 26 keys, `body` appears 17 times) while `ser_comments` read 79/79, and that was
visible in the output before anyone knew what was wrong. The generalisation: **when two
independent measurements disagree, the disagreement is evidence about method as well as
about value, and the value being inconsequential does not make the method inconsequential.**
The two agreed exactly (42 keys) on the three macros that really do take keys, which is what
localised the error to the fourth.

It also shows what a one-sided control cannot do. The recount's positive control passed —
`children`, `type`, `arguments`, `superClass` were all present — because the 79 contaminants
were *outside* what it asked about. A control that only asks "is what belongs here present"
is silent on "is anything here that does not belong"; `CallExpression` as a negative control
would have failed instantly. Do not open a brief to fix a *site*
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

### What each gate cannot see ([`compatibility/GATES.md#gate-coverage`](compatibility/GATES.md#gate-coverage))

The sections below describe what the ~34 gates *do* compare. Every one of them can be green
while a real defect ships, because each has a field its comparison key drops, a normalization
step that erases the divergence, or a population its unit never reaches — and rediscovering
those blind spots ad hoc has cost this project several shipped bugs (#2403, #2424, #2425).
`compatibility/GATES.md#gate-coverage` is the inventory: per gate, the unit compared, what it
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

**And the same is true one step earlier: a ratchet's correctness is relative to the tree it is
measured on, and a PR's tree is the MERGE REF.** `pull_request` CI checks out
`refs/pull/N/merge` — the branch merged with `main` — so when `main` moves, a branch that has not
changed by a byte can go red. Measured the day #4161 landed: it took `known-failures.client.json`
from 34 to 28, and three open PRs still carrying the 34-entry file had **6 listed-but-passing
entries** each, which is a FALSE-SHRINK failure. Their 86 queued jobs were therefore guaranteed
red before any of them ran; rebasing did not cost the queue, it *freed* it (`running 16 → 8`,
`queued 153 → 104`). The trap is that **the branch's own tree is self-consistent**, so nothing
measurable locally explains the red — "the ratchet is right on my branch, so the rebase can wait"
is a true statement and an irrelevant one. **And the same fact is a tool, not only a
hazard**: a PR run's artifact records its own `projectRevision` as the merge ref, so it says which
upstream commits were *in* the tree it measured. Reading that first shrinks or dissolves the
question "does `main` moving invalidate this measurement" — in one instance four commits' worth of
reachability was traced by hand and the artifact then showed three of them had been in the
measured tree all along.

**The dangerous direction of that is not red, it is GREEN.** A branch going red when `main`
moves announces itself. A branch that stays green holds an answer about a superseded tree and
nothing prompts anyone to look. Measured on one PR the moment its sibling merged: its
`Compiler parity` had started at 13:49:55Z, the sibling merged at 14:43:14Z, and the PR still
reported every check green — a verdict about a tree an hour out of date, with
`gh pr view` returning `mergeable=UNKNOWN/UNKNOWN` because GitHub had not finished
recomputing. The two PRs edited disjoint ratchet JSONs and the **same**
`compatibility/KNOWN-FAILURES.md`, whose prose asserted `known-failures.client.json, 12
entries` on the stale branch against a JSON holding 11 on `main`.

**The predicted harm did not occur, and that half was inferred rather than measured — it is
recorded because the inference was wrong.** Rebasing applied five commits with no conflict and
the result was already self-consistent at 11, because the three lines were changed by *one*
side only: git's three-way merge keeps the side that moved, and the stale `12` never survives
unless **both** branches edit those lines, in which case it conflicts and stops safely. So a
shared file plus disjoint JSONs is not by itself a hazard, and asserting a specific merged
text without performing the merge is the ordinary mistake of pricing a mechanism you have not
run.

What survives is the asymmetry, which is about *noticing* rather than about breaking: a branch
that goes red when `main` moves announces itself, and one that stays green does not, so
whether the stale verdict happens to still hold is exactly what you cannot know without
looking. The check is one comparison and costs nothing — **the verdict's `startedAt` against
the last merge into `main`** — and it is worth running after every merge on every PR still
open. "It turned out fine" is the answer it gives half the time; it is not a reason to skip it,
because the run that is not fine looks identical beforehand.

**And the check has a population, which is smaller than "every open PR": only a branch that
has NOT been pushed since `main` moved can carry a stale verdict at all.** A push — a rebase,
a force-push, any new head — recreates every check against the new head, so nothing old
survives to be misread.

**That is true of the PR and false of anything watching it.** A monitor keyed on check state
reports what `statusCheckRollup` held when it sampled, and a force-push between the sample and
the read leaves it describing a head that no longer exists: measured here as a `DONE-CLEAN
(46 checks, 0 pending, 0 failing)` for a PR whose rollup was **empty** by the time it was
acted on, because the rebase had replaced every check. Put the head SHA in whatever the
watcher emits. It costs nothing, it makes a new head produce a new line rather than a repeat
that a de-duplicating reader swallows, and without it the instrument built to catch stale
verdicts is itself a source of them.

So the claim above needs one word: a push destroys the old verdicts *after* it lands, and
between the push and the recreation of the checks there is a **window** in which the old
rollup is still served for the new head. Inside that window every cheap identity test agrees
— the local HEAD matches the PR head, the count is plausible, nothing is failing — and the
one thing that would separate them, *which commit those checks ran against*, appears nowhere
in the output. Two agents hit this within the same hour on the same repository, and both were
stopped by a **presence** condition (are the heavy gates registered as rows at all) rather
than by any freshness test, because a replaced head has zero rows and a settled head has all
of them. The PRs that need this check are therefore exactly the ones nobody has
touched, which is also the set least likely to be looked at. Two PRs in one session made the
contrast: one was rebased and its verdicts were all newly created; the other had not moved in
an hour and reported a full green measured 53 minutes before its sibling merged.

**A superseded run shows up RED too, and `gh pr checks` counts it.** A PR whose title was edited
re-runs the title-dependent job; the old run's `FAILURE` conclusion stays attached to the PR, so
`gh pr checks --json bucket` reports `fail=1` for a check whose two later runs are both `SUCCESS`.
Measured on one PR: `Changeset` at 09:24 FAILURE, 09:29 SUCCESS, 09:30 SUCCESS. Group
`statusCheckRollup` by `name` and take the maximum `startedAt` before calling a branch red — the
bucket count answers "has this check ever failed here", which is a different question.

**And a cancelled run also shows up RED, where it is indistinguishable from a real regression.**
`Tests` is a rollup job that reads its shards' `result`s and exits 1 unless every one is
`success` — so a cancellation makes the rollup `FAILURE` while every shard under it is
`cancelled`. Measured on four PRs during a mass `gh run cancel`: each reported 1–2 `FAILURE`
against 28–54 `CANCELLED`, and the failing job's log was `BULK: cancelled UNIT: cancelled …`
with no test output at all. So the check name and the conclusion together are not enough —
read the rollup's step env before concluding a branch is broken, and never re-baseline or
"fix" anything off a red rollup whose shards never ran.

### Corpus output-equality pipeline (`scripts/compat-corpus/`)

Every `.svelte` / `.svelte.(js|ts)` source (including markdown code blocks) from every corpus
source repository — sveltejs/svelte, sveltejs/svelte.dev and **101** real-world projects (huly,
immich, open-webui, carbon-components-svelte, SMUI, threlte, bits-ui, … ), all pinned as
submodules and listed in `scripts/compat-corpus/corpus-sources.json` — is compiled with both the official compiler and
rsvelte for CSR, SSR, dev-mode SSR **and** dev-mode CSR (the **four** targets declared in
`scripts/compat-corpus/targets.mjs` — this paragraph said three until 2026-09-02, and a sweep
written from it reported "collateral 0" over three quarters of its population). Outputs must be
byte-identical after comparison-side normalization
(oxfmt + blank-line stripping — never compiler post-passes). To grow the corpus, add a submodule
plus a line to `corpus-sources.json`. CI ratchet: `compatibility/known-failures.{client,server,server-dev,client-dev}.json`
may only shrink, and each remaining failure is justified in `compatibility/KNOWN-FAILURES.md#known-failures`. Every
ratchet is two-sided: a new failure **and** a listed entry that already passes both fail CI, so the PR
that fixes entries must re-baseline in the same PR instead of leaving a backlog for a later one. The
same directory holds five sibling shrink-only ratchets, each with per-entry justification in a paired
`.md`: the formatter-parity gate (`fmt-known-failures.json` / `fmt-oracle-excluded.json`), the
svelte2tsx output-parity gate (`svelte2tsx-known-failures.json`), the lint output-parity gate
(`lint-known-failures.json`, whose *constructed* companion
`lint-adversarial-known-failures.json` is described under `rsvelte_lint` below), and the
SCSS-backend gate (`scss-known-failures.json`), which compares
`rsvelte_preprocess`'s `grass` against dart-sass on every SCSS block and `.scss` file in the corpus —
30 divergences on a 94-unit compared population, so treat `grass` as a near-substitute, not a drop-in,
and the **public `parse()` AST** gate (`parse-ast-known-failures.json`), which is the one comparison
here whose subject is not `compile()` output at all — see below. svelte2tsx additionally gates its **source map** (ratchet
`svelte2tsx-map-known-failures.json`), because the TSX-text gate cannot see the map at all. The two
maps are segmented too differently to diff (byte, decoded-set and lookup-equality parity all hold for
~0% of the corpus), so the gate asserts that rsvelte's map is **structurally well-formed** rather
than equal to official's — using official only to calibrate the invariants. See
[scripts/compat-corpus/README.md](scripts/compat-corpus/README.md).

**`parse()` is a second public export, and until #3389 nothing compared it.** The corpus gates
compare `compile()`; svelte2tsx and lint consume rsvelte's own AST and never diff it against
official's. `scripts/compat-corpus/parse-ast-verify.mjs` parses every corpus component with both
compilers on three axes — `{modern:true}`, the default (legacy) shape, and `loose` — and ratchets
**652 field-level divergence keys**. Three lessons are already in it. The key had to be a *field*
(`<axis>::<NodeType>.<field>#<kind>`), not a file: one systemic divergence covers every file that
ends in a newline, and keying on the *set* of divergent JSON paths multiplied independent defects
into 472 classes over 4,468 files. The `Parser Modern 27/27` / `Parser Legacy 81/81` rows read as
coverage of this API and are not: they call the **internal** parse, pick the AST mode from the
fixture directory, and `normalize_json` deletes `loc.*.character` from both sides. And upstream's
own harness does `input.replace(/\s+$/, '')` before parsing, so every checked-in `output.json`
records `Root.end` of a *trimmed* input while rsvelte's harness passes the untrimmed file — the
fixture suite was green on #3386 by **compensation**, two different inputs producing the same
number, and fixing the compiler turns that row red until the harness mirrors the trim.

The same `verify.mjs` run also gates compiler **warnings** — `(code, line, column)` per entry —
on ratchets of their own (`warning-known-failures.{client,server,server-dev,client-dev}.json` and
`warning-position-known-failures.*`, justified in `compatibility/KNOWN-FAILURES.md#warning-known-failures`).
Codes and positions ratchet separately: a wrong set of codes is a semantic bug, a wrong position
is one systemic cause, and folded together the larger position backlog would hide every semantic
regression. Until #2281 the pipeline discarded `result.warnings` entirely, so this whole class was
invisible **by construction, at any corpus size** — that is how #2256 shipped while the corpus
scored the very entry that reproduces it as `MATCH`. When adding a gate, ask what the oracle does
not look at, not only what the input does not contain.

Compiler **errors** ratchet the same way and for the same reason
(`error-{message,position,end,frame}-known-failures.{client,server,server-dev,client-dev}.json`, justified
in `compatibility/KNOWN-FAILURES.md#error-known-failures`). The output verdict compares an error's `code` and
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

### `parse()` AST parity (`scripts/compat-corpus/parse-ast-verify.mjs`)

The public `parse()` export had **no gate at all** until #3389 — the other ~38 compare compiled
text, warnings, errors, TSX, lint findings and LSP responses, and svelte2tsx and `rsvelte_lint`
consume rsvelte's AST without ever diffing it against official's. One unit is (source, mode):
every `.svelte` entry of `compatibility/manifest.json` under `{modern: true}`, the default
legacy shape and `loose`, diffed as JSON after a round-trip on **both** sides — official keeps
`EachBlock.index`, `EachBlock.key` and `SnippetBlock.typeParams` as present-but-undefined keys,
and rsvelte's binding returns a JSON *string*, so a naive comparison reports a catastrophe that is
entirely the harness. It needs the **collected corpus** (`parse-ast-verify.mjs:168` fails without
`compatibility/manifest.json`) and a staged NAPI binding, and it runs in `corpus-compat.yml`
immediately after `Collect corpus` — not, as this paragraph claimed until 2026-08-30, on
pattern-corpus alone with no collect. That claim cost a runbook step: it was scheduled to run
before the collect, where it can only fail.

Three defects were shipped behind that gap and are fixed with it: `modern`/`loose` ignored
(#3385), `Root.end` short of EOF (#3386), and comments never attaching to statements (#3387).
**#3386 could not be fixed alone** — the fixture runners read their input untrimmed while
upstream's `test.ts` trims it, so a trailing-trimmed `Root.end` and an untrimmed input were two
deviations cancelling on the 62 of 110 fixtures whose input ends in whitespace. And #3387 was in
**three** places: the script walk, a separate ad-hoc implementation for template expressions with
no last-in-body or separator rule, and the fact that upstream hands every script parse the *same*
`parser.root.comments` array, so a `<script module>` comment binds to the instance script's first
statement.

The ratchet starts at 2721 entries over 494 diverging units, keyed `<id>::<mode>::<field-class>`
and partitioned by cause in the paired `.md`. Read the composition, not the count: the top three
causes are template-node field sets (1395), script-node field sets (681) and **`loc.character`
attached in exactly the wrong direction** (392) — official's positions come from
`locate-character` (which returns `character`) and from acorn (which does not), and rsvelte has
the two swapped. `parser_fixtures.rs` strips `character` from every `loc` before comparing, which
is why that suite reads 100% while the class exists. **A gate's first baseline measures how long
the surface was ungated, not how much someone let rot.**

**Those three numbers are the FIRST baseline (2721 entries) and none of them is a current work
item.** The ratchet stands at 301 over ten clusters — `span` 78, `node-type` 62,
`comment-attachment` 50, `estree-fields` 38, `unclustered` 36, `child-count` 14, `css-shape` 14,
`loc-presence` 6, `ast-mode` 2, `accepts-what-official-rejects` 1 — and there is no
`character` cluster at all. Grepping the keys for `character` returns 0 and **means nothing**,
because `verify.mjs` folds `start`/`end`/`loc` into one key per node type, so a
`loc.start.character` divergence sits inside `span`. Measured directly on one input, both
compilers emit zero `character`-bearing `loc`s and `phases/1-parse` does not import
`locate-character` at all (only `preprocess/index.js`, `state.js` and
`utils/compile_diagnostic.js` do) — which suggests the paragraph above describes the
*diagnostic* path rather than `parse()` output, but one input is not a population. Count the
JSON, not this paragraph — this paragraph has already been wrong twice, and the second time
named the mechanism. It once read 459 over a cluster split that summed to 459 while the file
held 321. Then it read 304 / `loc-presence` 9 while the file held 301 / 6 — and the history says
those were **correct one commit earlier**: `051e359dc` moved the JSON and the doc's partition
line together and left this file untouched, because `known-failures-md-check.mjs` gates the
partition line and gates no prose. That is the same mechanism `fmt`'s attribution paragraph
carried for 241 entries. So it is not that a count and a split go stale together — **one half is
gated and the other rots alone**, and the gated half is where to read the number. And read `301`
as `163 bases × axis`: 138 of those bases carry a key on both axes and 25 on one
(`138×2 + 25 = 301`), so the defect ceiling is 163, not 301. The collapse is not uniform across
clusters — measured, 1.00x to 2.00x against a whole-file 1.847x, so scaling the total gives
`css-shape` 7.6 where it actually has 9 — which is why a per-cluster estimate cannot be had by
scaling the total.

**And the clusters partition KEY SHAPES, not causes, so a mechanism can span three rows while
each row reads as its own backlog.** `lang="ts"` does not merely enable extra syntax — it selects
`acorn.Parser.extend(tsPlugin())`, and that parser emits **different shapes for the same
statement**: acorn always writes `attributes` (`[]` when absent) and `options` (null when
absent), acorn-typescript writes `attributes` only where a `with` clause exists, spells a dynamic
import's second argument as an `arguments` LIST, and stamps `exportKind` on `export default`.
rsvelte emitted acorn's shape under both. Its four ratcheted keys sat in `unclustered`,
`estree-fields` and `child-count`. **The axis that finds this class is one construct hosted in a
plain `<script>` and in `lang="ts"`, diffed against each other** — 41 constructs found five such
shapes where only two had a corpus carrier, and the same 164-cell grid re-found a defect this file
already records (`params.rest` missing on a `function` statement) plus one nothing recorded:
`export * from` was dropped from `parse()`'s body entirely while `compile()` kept it. Two of the
five are unreachable from any collected corpus at any size, because `export default` is illegal in
every script a component can hold — `parse()` accepts it and `compile()` does not, so the only
gate that can hold them is a unit test. `crates/rsvelte_core/tests/import_export_parser_shapes.rs`
is that gate. **Do not read a `Literal.value` bigint key as work**: `parse()`'s NAPI binding
returns a JSON *string*, `bigint` and `raw` agree exactly, and matching would mean emitting the
harness's own normalization shape.
### Generated shape matrix (`scripts/compat-corpus/matrix/`)

A **generated**, not collected, differential corpus (`pnpm run corpus:matrix`, #2281 Gate 2),
ratcheted through `compatibility/matrix-known-failures.json` with per-cluster justification in
the paired `.md`. Declarative axis families in `matrix/axes.mjs` — binding kind × syntactic
position, comment kind × insertion slot, invalid `bind:` target × directive slot,
string-literal escape × template expression slot, `await`/`yield` in a formal parameter list
× function form × entry point, `{#each}` collection expression × item use, the token a `/`
follows × host, a name's slot in a binding pattern × statement context, directive kind ×
element kind × mode, `bind:` setter shape × element kind, a raw-scanned keyword × the opaque
region carrying it × host × entry point, a reactive binding × the host the write to it sits
in × the shape of that write, and the JS whitespace separating two keywords × the construct they
open × entry point — expanded into ~20,000 comparisons
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

**The `class-modifier` family exists because upstream answers "what may a plain `<script>`
contain" with a different PARSER, and rsvelte answered it with a flag.** `lang="ts"` selects
`acorn.Parser.extend(tsPlugin())` upstream and `SourceType::ts()` here — but OXC's JS grammar is
not acorn's, so every TypeScript-only class modifier and the stage-3 `accessor` compiled in a
plain script that official rejects (#3100, #3203). That is the same over-acceptance shape as
`param-default`, and no collected corpus can hold it: published code compiles. Three things it
cost us. **The reported position is not the member's key** — acorn reads modifiers left to right,
takes the first word it cannot read as the name, and throws on what cannot follow a name, so
`private static a` reports at `static` and `private get a()` at `get`; a fix that reports at the
key is right on 19 of 22 rows and wrong on the interesting ones. **The over-rejection half needs
its own rows**: `accessor = 1`, `accessor⏎a = 1`, `static readonly = 1` and `get private() {}`
each spell a modifier keyword where it is an ordinary name, which is what separates a check keyed
on the parsed member from one keyed on the keyword's text. And **acorn-typescript is not a
superset of OXC either** — it enforces two rules in the *parser* that TypeScript leaves to the
checker (`abstract` outside an `abstract class`, `override` with no superclass), so the same
family found rsvelte over-accepting on the `lang="ts"` side while it was fixing the JS side.
Where the two modifier tables simply disagree (`static accessor` is legal TS and
acorn-typescript refuses it, at a column it passes to a position parameter) the rows stay listed
rather than ported: both compilers reject, and matching would mean reproducing the bug.

Normalization is deliberately identical to `verify.mjs`, so a divergence this gate reports is one
the corpus gate would also report. `--update-baseline` refuses to run under `--no-fmt` or a
`--families` subset (both would FALSE-SHRINK the ratchet).

**A ratchet entry's justification is a hypothesis about the AXIS, and a repro built from it
inherits that hypothesis.** A svelte2tsx entry was recorded as "a `//` comment is dropped from a
mustache in a mixed attribute value". The rule is not about comments: upstream copies the
mustache interior **verbatim**, and rsvelte sliced by the expression node's span, so everything
between `{` and the start of the expression was lost. Four cells —
`class="x {// c⏎a} z"`, `{/*c*/a}`, `{ a }`, `{a /* t */}` — and **two of them contain no
comment at all**, so a fix built from the entry's own wording (extend the range to cover a
leading comment) passes half the grid and reads as done. The lesson is one level earlier than
"reason is not attribution": the prose does not merely fail to say *where* a divergence is
answered, it can name the wrong *axis* to reproduce it on, and the grid that would catch that is
the one whose cells are not all instances of the stated cause.

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

The generalization of the matrix (`pnpm run corpus:mutate`, #2281 Gate 3): the corpus entries
stop being the test set and become a **seed set** (34,721 eligible on the 2026-09-01 sweep).
One semantics-preserving comment is inserted at a line boundary inside a `<script>` region and
parity is required on the mutant. PRs get a deterministic sample; main gets the full sweep
(which is what the two-sided ratchet needs). It found **#2351** (a comment containing `}`/`)`/`;`
in a `$:` block body **aborts the client compiler with SIGSEGV**) and **#2347** (a `//` comment
before a `$props()` pattern's closing brace swallows the `$.rest_props` initializer — output
parses, attributes silently vanish) in its first run.

**Only the code class is ratcheted.** A divergent mutant is `code-mismatch` when the difference
survives normalizing comments, whitespace and trailing commas away, `comment-mismatch`
otherwise. The full sweep yields **0** of the former and 15,351 of the latter; ratcheting per
id without that split would be a five-figure file that churns on every submodule bump. Comment
fidelity is ratcheted per id by Gate 2 instead, on generated seeds that do not move when a
submodule bumps. **The ratchet is empty as of 2026-09-01**, so 0 is now the bar — and the
15,351 is why that zero must not be read as "the operator finds nothing": it finds them, and
this gate scores none of them.

**Two things this gate taught, and both were taught by adding inputs rather than by a fix.**
The delimiter-carrying/plain ratio has measured 2.81× (oxfmt 0.61), 1.30× (0.62), 1.66×
(post-burndown), **0.92×** (enrolled corpus), **1.13×** (the same corpus after a rebase onto
`main`, with no change to this gate), **1.22×**, and now **undefined** (0 findings for both
groups): it tracks the normalizer and the current residue, not the mechanism's importance, so do
not cite it as a constant — it crossed 1.0 in both directions without the mechanism moving, with
`svelte-ignore` (no delimiter at all) accounting for two of the four units whose output did not
parse. Recompute it if the bucket goes non-zero; do not carry a value forward. And
**#2347's shape came back**: `cnblocks/src/lib/svgs/vercel` dropped the `$.rest_props`
initializer under a mutant, on a seed the corpus did not hold when #2347 was fixed. A closed
defect class reappearing on new seeds is evidence about coverage, not about the fix.

**The last three findings it held were all one shape, and one of them no other gate can see.**
A destructure's right-hand side ending inside a following comment, an object shorthand hidden by
a comment between two entries — and a removed `$effect`, which upstream replaces with `b.empty`.
esrap filters an `EmptyStatement` **only** inside its `body` helper (`Program`,
`BlockStatement`, `ClassBody`, `StaticBlock`, `TSModuleBlock`), so a switch case consequent and
every unbraced `if`/`else`/`while`/`do`/`for`/label body print the `;`. rsvelte deleted the
statement in every slot, in **both** ports of that rule (the `compileModule` text rewrite and the
component `visit_statements`), and the corpus output gate is blind to it because oxfmt drops a
lone empty statement from both sides. It reached the ratchet as a mutant of exactly one seed.

**This gate's population is the complement of another gate's ratchet**, which is worth knowing
before reading a `NEW` here as a regression: `eligible` is `manifest ∖ (union of the four output
ratchets)`, because a seed that diverges *unmutated* cannot attribute a mutant. Shrinking the
output ratchets therefore *adds* inputs here — a rebase that took them from 759 ids to 601 put
158 seeds into this gate for the first time and two of them diverged. The set difference "was
this id in an output ratchet immediately before?" is what separates a newly reachable seed from
a regression; the count cannot.

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
`--update-baseline` below 30000 corpus entries (the FALSE-SHRINK trap: `--update-baseline` deletes
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
They inherit no `CARGO_TARGET_DIR`, so a plain `git commit` builds into the worktree's own
`target/` — 1.4 GB per worktree, on a disk that has run out twice. Prefix the commit itself
(`CARGO_TARGET_DIR=… git commit -m …`) rather than reaching for `--no-verify`.

**In debug, disk runs out before time does, and chunking does not help.** The instruction above
to scope a run with `--test` is not only about the hour a `--release` build costs: a debug build
of `rsvelte_core`'s 589 test targets is **83 GB** of `target/debug/deps` at ~140 MB a binary —
**170× the 499 MB the whole release profile occupies** — and it filled the dev disk to zero
twice in one day. Splitting 589 targets into three chunks lowers peak memory and leaves
**exactly the same 83 GB**, because each chunk's binaries stay. `target/debug/incremental` is a
rounding error against this (measured at 445 MB when free space was 0), so `CARGO_INCREMENTAL=0`
is worth setting and will not save you. Read `df -g /System/Volumes/Data` before invoking cargo,
and do not start a build under ~20 GiB free: ENOSPC does not fail loudly, it leaves a partial
artifact and the *next* run fails for an unrelated-looking reason. Reclaim with
`find target/debug/deps -maxdepth 1 -type f -mmin +360 -delete`.

**A guard that kills a build by matching its path does not work.** `cargo`'s own cmdline carries
neither the worktree path nor `CARGO_TARGET_DIR` (both arrive through cwd and the environment),
so `pkill -f '<path>'` leaves the parent alive and only the `rustc` children — which do carry
`--out-dir` — are matched. Record cargo's pid at launch and `kill` that, or resolve cwd per pid
with `lsof -a -d cwd -p <pid>`.

**And "is anyone else building" is a question about ownership, so counting cannot answer it.**
A benchmark that shells out to `cargo` itself makes its own builds indistinguishable from a
peer's by count: with the harness idle between calls, one foreign build reads as exactly the
count a self-owned one does, and the rule "1 is mine" absorbs it — failing silently, in the
same low-looks-normal direction as the fabricated zero above. The cmdline carries no
attribution but the process tree does: walk each `cargo`/`rustc` pid's `ppid` chain and ask
whether it reaches the harness's root pid, recorded at launch. That form also calibrates in
**both** directions off one process — start `exec -a "/probe/bin/rustc" sleep 6`, classify it
against the harness root (must read foreign) and against your own shell (must read mine) — which
a counting rule cannot do, since it has no way to construct the "mine" case on demand.

**And `cargo == 0` is not "the box is quiet" — the build's aftermath peaks exactly when
cargo exits.** A gate run finished, `rustc`/`cargo` and `node` all read 0, and the window
was one sentence from being declared free; the actual top of `ps -Ao %cpu=,comm= | sort -rn`
was `mds_stores` at **96.7%** — Spotlight indexing the thousands of files the build had just
written into `target/release` — with `mediaanalysisd` at 72.6% beside it. The compile
processes are the part you started, therefore the part you think to count, and the part that
ends first. Read the actual top of the CPU list before declaring a measurement window open,
not a filtered count of the process names you are responsible for; load average will not
tell you either, since no fixed threshold works on a box with a resident `llama-server`.
(`target/CACHEDIR.TAG` does not stop Spotlight; a `.metadata_never_index` file in `target/`
would, and is worth proposing to whoever owns the machine rather than adding unannounced.)

**Three process detectors failed inside one hour, and only two of them were bugs.**
(1) Counting `rustc`/`cargo` alone read a box as free while Spotlight sat at 96.7% indexing
what the build had just written. (2) `grep -c -x -E 'rustc|cargo|perf_bench'` read **0**
while a peer's `perf_bench.after` was running, because `-x` demands an exact match —
watching `ps` is not enough on its own; **apply your own pattern to the output and confirm
it selects something.** (3) The third is not fixable. The peer's experiment contains a
*designed* 180-second idle between two of its points, so "no matching process is running"
does not mean "the run has finished", and no threshold repairs that — raise it and the peer
widens the gap. A run with an idle period is indistinguishable from a finished run by any
process-count rule, and the detector was about to launch a six-process release build exactly
across the three points that decide that experiment's verdict.

Separate **"my instrument is miscalibrated"** from **"my observable cannot answer this
question"**. The first two were calibration; the third means the only valid signal is the
peer saying so. All three surfaced because the peer announced a start time — between agents
sharing a machine, announcing start and finish is not courtesy, it is the instrument, and a
process detector is not a substitute for it.

**And the commitment is what fails, not the knowledge behind it.** Having written to a peer
whose measurement window it was — "I will not start cargo; I will only read code and write
instrumentation" — the author ran `cargo fmt` and then `cargo check --release` three minutes
later: 84 files written into `target/release` inside that window, while the peer's benchmark
was six seconds into a point. Nothing had been forgotten. The reflex to confirm that freshly
written code compiles fired without consulting anything, and the sentence forbidding it had
been typed by the same author minutes earlier. What works is not resolve but **not being in
a position to reach for the tool**: move the whole task that ends in a build behind the
window rather than doing its non-build half inside it. Every other entry here is an
instrument being wrong; this one is the author, having twice that day told the same peer to
respect the same window.

**acorn checks JavaScript's early errors while parsing; OXC settles them after it, and rsvelte
ran only the parser.** An early error is syntactically shaped but illegal, and none of the class
is decidable from the token stream — each needs the enclosing scope or class — so OXC leaves them
to `SemanticBuilder` while acorn throws from inside `Parser`. rsvelte accepted all of them and
**copied the illegal construct straight into its output**, so every accepted case emitted text no
JS parser accepts (#3243: `super()` outside a method, a duplicate constructor, an unsyntactic
`break` / `continue`, a duplicate label, an undeclared or duplicated `#private` name, `import` /
`export` below the top level, `delete this.#a`, a `'use strict'` directive in a function with a
non-simple parameter list; #3217: a duplicate declaration). One
`SemanticBuilder::new_compiler().build()` per script — `with_build_nodes(false)`, run only where
the parser reported nothing — reports all of them, and reported nothing on any of the legal
neighbours. Three things generalize past the fix. **The two do not agree on where the error is**:
for every "already declared" class OXC labels the DECLARING occurrence and acorn stops at the
REDECLARING one (`let x = 1; let x = 2;` — acorn 15, OXC 4), and OXC labels a jump's target where
acorn stops at the `break` keyword; piping OXC's diagnostics through unchanged gets `code` right
and every `start`/`end` wrong, which is the most common defect shape in this repo. **The mapping
has to be an allow list, not a pass-through** — OXC reports more than acorn checks, so an unknown
diagnostic must be ignored rather than raised, and the price of that is that a reworded OXC
message makes an entry stop matching *silently*, with the symptom being a check that disappears;
`early_errors_3243.rs` therefore carries one independently-failing repro per entry, because a
single "all eight are rejected" assertion is satisfied by the other seven. And **OXC's TypeScript
mode exempts every function-vs-function redeclaration** — the same over-broad rule
`2_analyze/scope_builder.rs` has for TS overloads — while acorn-typescript rejects a duplicate
*implementation* and accepts only a signature set, so `function f(){}` twice in a `lang="ts"`
script stays accepted here and is recorded rather than claimed (#3484).

**Two further lessons came out of the same work, and neither is about the parser.** The first is
that **the set of classes has to be closed from the ORACLE's own list, not from the issue's
table.** #3243 enumerates eight; enumerating all 90 `raise` / `raiseRecoverable` literals in
acorn 8.17.0 instead and writing one input per context-dependent rule found **three more** —
`'use strict'` in a function with a non-simple parameter list, `super()` in a class with no
`extends`, and `delete this.#a`. An issue's list is a report of what someone hit, never a
partition of what exists. The second is that **an oracle assembled from the component that is
blind to the defect measures nothing**: the first version of
`no_accepted_script_emits_unparseable_output` ran `oxc_parser` over the emitted output and
**passed with the whole check ablated**, because `oxc_parser` is exactly the parser that defers
this class to `SemanticBuilder`. Re-measured with real acorn on the ablated tree's own outputs,
**24 of the 25 compiled cells are not JavaScript** — and the single exception is not a hole in
the oracle but a fact about JavaScript: an instance script's statements are emitted *inside* the
component function, where two `function f(){}` in one body are legal, while the same source as a
`.svelte.js` puts them at module top level and acorn rejects it. Separating "the oracle cannot
see this" from "the language permits this" needed the same input at two entry points.

### Docker (optional)

A `Dockerfile` and `docker-compose.yml` provide a reproducible toolchain (Rust nightly + Node 22 + pnpm). There is no wrapper script — invoke Compose directly:

```bash
docker compose up -d            # Start dev container
docker compose exec dev bash    # Open a shell inside it
docker compose exec dev cargo test
```

VS Code Dev Containers ("Reopen in Container") also works.

### grep can return nothing and mean nothing

Five ways `grep` has silently reported "no matches" for strings that were
present. All of them produce a confident empty result, so a negative grep is
never on its own evidence that something is absent — confirm with a positive
control on a string you know is there.

| Symptom | Cause | Fix |
|---|---|---|
| `grep X file` finds nothing that is there | `grep` is a shell function wrapping `ugrep --ignore-files`, which skips gitignored paths | `command grep` |
| `Binary file … matches`, no lines printed | one NUL byte anywhere in the file (not non-ASCII — UTF-8 is fine) | `command grep -a`, or `git grep` |
| `git show rev:file \| grep X` finds nothing | the wrapper's `-I` discards binary-looking **stdin** | `git grep X rev -- file` |
| later matches missing | `\| head -N` (or `\| tail -N`) truncates with no error | state the denominator, or drop the cap — see the section below, this is the narrow case of a general hazard |
| a path opens locally and opens nothing in CI | macOS's filesystem is case-insensitive, so `known-failures.md` finds `KNOWN-FAILURES.md` here and finds nothing on Linux | scan the directory and match. And note what the shape of the bug was: the scan existed, written as a *fallback* to the direct open, so it looked optional — it is the only half that works, and every caller needs it, not just the one whose author happened to add it |
| every count comes back `0` | zsh expanded an **unquoted** `--include=*.svelte` as a glob, found no match in cwd, and never ran the command | quote every glob-shaped argument: `--include='*.svelte'` |

The unquoted-glob row is the one that is not a `grep` bug at all: the others reach
`grep` and then lie, while this one means `grep` never ran. Two people hit it in
one session, an hour apart, and both times the fabricated answer — `0` for every
repository — **agreed with the hypothesis being tested** ("this population carries
no carrier"). Quoted and re-run, the first column read `1867`. Neither `echo $?`
nor `$pipestatus` helps, because zsh's non-zero status is not a failure of the
command you wrote; the only control that fires is a count you know is non-zero.

**The controls above apply to evidence you CITE, not only to evidence you gather.**
Told that a log line was the harness's own self-report and so no better than an
arm's label, the reply named three independent facts — and one of them,
"rsvelte depends on `oxc_traverse` 0.146, the panic came from 0.140", was never
checked: `oxc_traverse` appears **0 times** in `Cargo.lock` and in every
`Cargo.toml` (positive control: `oxc_parser`, 13 hits, 0.146.0). The claim was
stronger than stated once checked — the crate is absent from the graph entirely —
and still wrong as written, which is the shape to watch: a *citation* feels like
it has already been verified because it is offered as the verification. It
reached nobody's docs only because it was shared before being written down.

And the inverse: `grep` returns matches when the thing is not there. Censusing
which tools read a field, `.code` matched `.codegen` in a file that reads no
output, and `js.map` matched a *comment* explaining a sourcemap default — two
apparent counterexamples, both artifacts of the pattern. A positive grep is
evidence of a byte sequence, not of a fact; open the hits before counting them.

### A truncating or discarding stage turns a failure into a green

`grep` is one instance; the class is **any stage between a command and your
eyes that can drop the part carrying the verdict**. It never reports that it
dropped it, so the output is not "wrong", it is *indistinguishable from success*
— which is why re-reading it more carefully cannot help. Three of these were hit
on one day, by three different people, each already knowing the rule, and two more
followed on the next:

| What was read | What it actually showed | Why it read as a pass |
|---|---|---|
| `cargo test 2>&1 \| tail -25` | `[exited with code 0]` for a run that **failed to compile** (`no field 'errors'`; it is `diagnostics`) | the compile error scrolled past the window, and `$?` came from `tail` |
| `cargo clippy 2>&1 \| tail -40` | dependency crates and `Finished` — the target crate's own line was outside the window | a clippy run that is clean and one that never reached your file print the *same nothing* |
| `pgrep -c … \|\| echo 0` | `0` | the `\|\|` arm fabricated a datum that reads exactly like a measurement |
| `cargo test … \| grep -E '^test \|test result' \| head -20` | `TEST_EXIT=101` from `$pipestatus[1]`, and twenty *passing* lines | the **verdict** was read correctly and the lines explaining it were outside the window |
| `join before.tsv after.tsv` over paths sorted by Rust's byte order | two non-ASCII paths reported as **changed** that were byte-identical | `join` requires its inputs in the locale's collating order and silently **mispairs** rows when they are not |
| `timeout 120 node probe.mjs 2>&1 \| head -20` | nothing at all, twice | `head` closed the pipe and `timeout` killed the process, so node's block-buffered stdout was **never flushed** — the verdict was not outside the window, it was never produced |
| `cmd \| cat -A` on macOS | the **oracle leg produced no output at all**, so its side of an A/B read as empty | macOS has no `cat -A`; the filter dies, the pipe's exit is the filter's, and a stage that dies on ONE leg does not manufacture a zero — it manufactures a **difference** |
| a CI job's log read for the scariest-looking line | a `[fmt] rsvelte-fmt reported errors:` line that **`main` prints on every run**, quoted as the cause of an `exit 1` whose real line was 30 lines later | nothing was truncated: the window held the real failure *and* a permanent one, and "looks like a failure" is not a property the reader can check without the other arm |

Rules, in the order they are cheap:

1. **Never read a verdict through a truncating stage.** Run the command bare, or
   put the filter *after* capturing the status (`PIPESTATUS[0]`, or write to a
   file and grep the file). `2>/dev/null` and `|| echo <literal>` are the same
   hazard wearing different clothes: the first throws away the half that carries
   the failure, the second manufactures the answer. And there is a third: an exit
   code that makes **a different failure look like the failure you expected**.
   `git merge-tree --write-tree A B` was run to ask whether two branches conflict
   and returned `128`, which was read as "conflict". git returns **1** for a
   conflict and **128** for fatal, and that flag needs git 2.38 while the machine
   had 2.33 — `stderr` said `unknown rev --write-tree`, meaning the conflict test
   had never run. An exit code does not say *which question* it answered; the
   message does. That is what makes `2>/dev/null` worse than it looks: the half it
   discards is not merely the failure, it is the only part that identifies which
   failure it was.
   **Capturing the status is not enough.** Row 4 above kept the exit code and
   still lost the failure: a window that admits only passing lines answers "did
   it fail" and never "what failed", and the run that produced it did not
   reproduce. The failure has to be *inside* the window, not merely outside the
   pipe — write to a file first, then read the file. The trap is the *stage*, not
   the command: `head`, `tail`, `sed -n`, `head -c` and `2>/dev/null` are one
   hazard, and reading the table as "beware `tail`" is how row 4 was hit by
   someone who had read it half an hour earlier. `cmd | head -20; echo $?` prints
   `head`'s status, never `cmd`'s. And row 5 is the same class
   without any truncation at all: a stage that **pairs** two measurements can pair
   the wrong rows, so use an associative array keyed by id (`awk`) and never
   `join`, whose ordering precondition your data will violate the first time an
   id contains a non-ASCII byte. **And the rule is not "use `awk`" — it is: do
   not build a stage that renders a composite key to text and re-parses it.**
   `-F'\t'` only makes that stage safe for today's separator; a pipeline that
   keeps the key as an object (`out[`${id}|${target}`]`, JSON, `Object.keys()`)
   has no such stage at all. Measured: with the default field separator a corpus
   id containing a space (`Checkbox Group.svelte`) splits across `$1`/`$2`, so a
   file's four target rows collapse onto one key and the comparison reads the
   *target name* where it meant to read the hash — **100 moved units reported
   for a change that moves 2**. Over-reporting is the direction this instance
   took; the array keeps the **last** row's value per key, so a real movement in
   any of the preceding targets is *hidden* whenever that last value matches.
   One bug, both directions, same input.
   What exposed it was the **shape** of the printed paths, not the count: a
   count is a threshold and says only "more than expected", while `Checkbox
   Group.svelte` printed three times is a signature that cannot occur. Had the
   corpus held four space-bearing ids instead of 47, the same bug would have
   reported `MOVED=6` and been written up as "4 collateral units".
   The cheap control is to print the key count beside the row count — a collapse
   makes them differ, and `139252 rows, 139252 distinct keys` retires the
   question for that run. Two cautions from getting this wrong while writing it
   up: **the size of a collapse cannot be derived from the number of bad inputs**
   — 47 space-bearing ids over four targets lose 161 keys, not 141, because 20
   of them are **id-to-id** collisions (`…/examples/01 - foo.svelte` and
   `…/01 - bar.svelte` both reduce to `$1=…/01`, `$2=-`), which is a count only
   the ids themselves carry, never their number. **Those 20 are the worse half**:
   a same-id collapse compares the wrong target of the right file and printed the
   repeated-path signature that exposed this, while an id-to-id collapse compares
   a *different file's* output and prints nothing anomalous at all. And the
   number in this paragraph was published as measured before it had been run; it
   was wrong, and the conclusion survived only because it did not depend on it —
   which is knowable *after* the fact and is therefore not a licence to estimate.
2. **When "pass" is spelled as silence, the run needs a positive control.**
   Introduce the defect the check exists to catch, confirm the check goes red,
   remove it, and confirm the tree is byte-identical again (`git diff` empty).
   Only then does the quiet run mean anything. This is the same argument as the
   negative-grep control above, one level up: an empty result is evidence only
   once you have shown the instrument can produce a non-empty one. For a
   *process* detector the control is cheap and needs nobody else's cooperation:
   `exec -a "/probe/bin/rustc" sleep 6` gives you a process whose argv you chose,
   and the detector has to find it. That is how `pgrep -c -f 'cargo|rustc'
   2>/dev/null || echo 0` — used to certify a benchmark window as idle, by
   someone who had cited the row above three times that day — was caught
   fabricating: macOS `pgrep` has no `-c`.
3. **State the denominator.** "No warnings" is a claim about a population; say
   which one (`-p <crate> --lib --tests`), because the reader cannot tell from
   the output whether your file was in it.
4. **Check the instrument before the result, not after.** A predicate written to
   answer "is the CI scheduler stalled" — `status === 'queued' && started_at` —
   matched **210 of 213** jobs, which agreed with the hypothesis and was
   internally tidy (the other 3 were exactly the `in_progress` count). It is
   non-discriminating: the Jobs API stamps a queued job's `started_at` with its
   `created_at`. What exposed it was the *shape* — six different jobs carrying
   the identical timestamp to the second — not the count, which is the same
   signal that named the `awk` key collapse above. The corrected predicate
   (`started_at > created_at`) reported **0**, so the platform-side signature was
   absent and the question stayed open. Run the check on a population where the
   predicate MUST fire before you read a run where it must not.
   **And the instrument check is only as good as the population it runs on.**
   Half an hour later the same investigation reported `in_progress: 4` against a
   20-job ceiling and concluded the scheduler was stalled. It was saturated at
   exactly 20. `actions/runs?per_page=100` returns the hundred most recent runs
   **of any status**, and filtering those client-side drops every still-running
   run older than the window — here a 16-shard job created an hour earlier.
   Server-side (`?status=in_progress`, `?status=queued`) with paging gives 20 and
   208. This is the paging-window hazard, and what makes this instance worse than
   the usual one is that **it faked a plausible number rather than a zero**: `4`
   was explicable, agreed with the hypothesis under test, and was internally
   consistent (the "predicate could fire" control read 4 too, because it drew
   from the same truncated population). A peer's report of 16 running shards
   contradicted it outright and the contradiction was not treated as evidence
   about the instrument. **When someone else's measurement disagrees with yours,
   the first hypothesis is your instrument, not their arithmetic.**
5. **A window can kill the verdict's PRODUCTION, not only its display.** Rows 1-5
   of the table lose a verdict that exists; row 6 loses one that never got
   written. `console.log` to a pipe is block-buffered, `head` closes the pipe and
   `timeout` sends SIGTERM, so whatever is still in the buffer is gone — and the
   same command redirected to a file prints all five lines. The distinction
   matters because **the usual fix does not apply**: widening to `head -200`
   changes nothing, because the width was never the problem, and someone who
   knows the table will re-run at the same width and get the same nothing. It
   also mis-attributes in a specific direction — an empty probe reads as "the
   thing I am probing is broken", so two plausible mechanisms (a wrong `cwd`, a
   wrong `--stdio` spelling) were built and one of them was even independently
   real, which is what made the diagnosis stick for two rounds. Write to a file,
   then read the file; nothing else recovers an unflushed buffer.
6. **A control that shares the measurement's broken stage certifies nothing.**
   Checking whether a build was still progressing, `find target/release -newermt
   '3 minutes ago' -type f 2>/dev/null | wc -l` returned `0`. The positive control
   — the same command at `'60 minutes ago'`, which cannot be zero during a live
   build — *also* returned `0`, and that was read as "so the build writes nowhere
   near here" rather than as "so my instrument is broken". `find` here is `bfs`,
   which rejects `'3 minutes ago'` outright (it wants ISO 8601); the `2>/dev/null`
   turned the parse error into a `0` **in both the measurement and its control**,
   because they differed only in the argument that was invalid in both. The rule that covers
   it: **a control must bypass at least one stage the measurement passes
   through.** Changing only an argument to the same command cannot detect that
   command's own failure — check the claim with `stat` instead of `find`, or with
   `wc -l` instead of the grep whose pattern you doubt. Varying the input while
   holding the pipeline fixed is the weaker form, and it is the one that feels
   like diligence. This is the instrument-level twin of a
   port-vs-port test whose oracle is the other port: both are passed by a fault
   the two halves share.

### A timeout is not an answer, and the cheapest probe spells it as one

`await_id()` returned Python's `None` on timeout and the probe printed it with
`json.dumps`, which spells `None` as **`null`**. So "official answered `null`" and
"official did not answer within 60 seconds" came out as the identical line, and the
first reading was reported. This is the probe-side form of *nothing is always spelled
as something*: the earlier table collects cases where a missing measurement prints as
an empty cell or as somebody else's verdict, and this one prints **in the answer's own
vocabulary**. Print a non-answer as a non-answer — `NO RESPONSE WITHIN 25s (not a null
result)` — and never through a serializer that has a value for it.

The second half is worse and is what made it stick. The positive control (`<div></div>`,
which must return ranges) came back with the same `null`, and that was read as "my
`workspace/configuration` reply is wrong, so the HTML plugin is disabled" — a mechanism
that is real, findable in the source (`HTMLPlugin.ts:484-489`, `featureEnabled('html
.linkedEditing.enable')`), and supported by no evidence at all. **A control that fails
is the moment a plausible mechanism is cheapest to find and least worth trusting**,
because the same symptom now has two producers and the instrument is one of them.

### `-p <crate>` is not the denominator either

The file already says to state the denominator of a test run and to read a suite's
names rather than its count. Both are about which *tests* ran. There is a third
quantity, and adding a variant to a shared type is where it bites: `JsNode` lives in
`rsvelte_core` and is matched exhaustively in `rsvelte_bindings_support`, so
`-p rsvelte_core --lib` plus thirteen named targets was green while the workspace did
not build. What caught it was the pre-commit hook's `cargo clippy --all-targets`, not a
wider test list — so the fix is not "run more tests", it is: **when the change is to a
type another crate names, the denominator is `--workspace`.**

### A cleanup keyed on "what I created" leaks a set that perpetuates itself

`verify.mjs` removes the server caches its own run created
(`removeNewServerCaches(cachesBefore, …)`), so anything already present when the run
started is classified as pre-existing and spared — and every later run makes the same
classification. **Whatever survives once is never reclaimed.** The size of the leak is
therefore proportional not to how many runs there have been but to how many exited
abnormally, and an abnormal exit is most likely while something is being changed — so
the moment that creates a survivor is the moment its staleness matters most. The
survivors are not inert: the shadow tsconfig's `include` is a glob
(`["svelte/**/*", …]`), so a survivor joins the next run's type program. This is why the
same gate produced three untracked directories on one machine and none on another; the
difference was one killed run in the past, not a difference in the gate.

### A two-option question hands over its shared premise unexamined

"Widen the pattern or narrow the ranges" was offered as the two ways to resolve a
`linkedEditingRange` divergence. Both assume the oracle returns ranges at all. Stating
the options without stating what they share means the receiver measures the difference
between them and never the assumption under both. **Write the premise the options share
in the same message**, so the first thing measured is the thing that can delete the
question.

### One cell per file cannot see one fragment changing another's print path

A single unparseable fragment drops the whole file from the AST printer to the text
fallback, so a broken declaration silently rewrites the output of the correct
declaration next to it — `() => (state = 1)` printed where official prints
`() => state = 1`, with blank lines moved, none of which is about the construct being
studied. Cutting the same three cells into their own file made all three arms EQ. An
18-cell grid with one cell per file was green throughout. The direction is one-way:
this makes a grid pass where the corpus fails, never the reverse, because every real
file puts many declarations in one file. When a family's cells are one construct per
file, its green says nothing about the same constructs sharing a file — and the
interference is invisible in the output of the fragment that causes it.

### A number written as a literal is a claim, and knowing that does not stop you writing one

Three instances in one afternoon, and the third is the one to keep. A test file's closing line
said `19 controls pass` where the file ran **22**. The P3 attribution gate's summary said
`14 carrying 24158 attributed entries` where the tables attribute **418** -- `attributed += n`
added the whole ratchet for any file holding a block, so one partial table on a 23,746-entry
ratchet moved the campaign's own progress readout by 58x, in the flattering direction, while the
per-file line two screens above it printed the right answer all along. Then the commit repairing
those two **introduced three new literals**: prose reading `23,740 of the 23,746` and
`covers 6 of 23,746`, in a section where `known-failures-md-check` gates the partition lines and
gates no prose, three hours before a peer's PR moved the ratchet to 23,744.

The first two are ordinary. The third is the finding: the author was, in that same commit
message, writing down that a gated half and an ungated half rot separately -- and put three
ungated numbers into the ungated half. Knowing a rule, and having just typed it, does not arm it.

What arms it is not vigilance but **having no literal to check**. The repair was not to pick the
right number, it was to write the rule against the artifact instead of against a count: "every
entry outside the table below", "one for every entry the table does not cover", "over every
remaining key". The section now contains exactly one occurrence of the ratchet's size -- the
declaration the checker reads -- verified by changing it and watching the checker name the file,
the stated number and the JSON's. A count that cannot be written cannot go stale, and that beats
a count someone promises to re-derive.

### A pre-registered falsification is only as good as its "then" clause

Handing a peer a check to run after a merge, the wording was: "the default mode reports
5 problems; re-count after this PR lands, and **if the count does not change, my exemption
list is wrong**." The count did not change -- correctly, because the PR adds a flag and a
pending list and touches none of the default mode's inputs -- and the exemption list is
right, because the flagged mode exits 0. **No outcome of that measurement could have said
anything about the exemption list**, since the count and the list are read by two different
modes. The pre-registration made a non-discriminating test look like a committed one, which
is worse than no test: a bare guess invites a check, and a guess with a falsification
condition attached looks as though it has already survived one.

The check is mechanical and costs one sentence: **name the artifact each half of the "if"
reads.** If the observation and the conclusion do not share one, the conclusion does not
follow from the observation whichever way it comes out. And it is the same shape as a
port-vs-port test whose oracle is the other port -- the form is right and the two halves
are not independent.

### A flag the tree does not implement is ignored, so the mode you ran is not the mode you typed

`attribution-check.mjs` has two modes: the default one is the DoD and stays red until every
ratchet entry is attributed, and `--gate-known` asks only about the attribution that exists.
Typing `--gate-known` against a tree where that PR has not landed runs **the default mode** —
the script reads its own argv, an unknown flag is not an error, and the red that comes back is
correct, load-bearing, and about a different question than the one asked. `command grep -n
'gate-known' scripts/ci/attribution-check.mjs` returning nothing is the whole check.

Two things generalize. **Which tree implements a flag is part of the flag's meaning**: a flag
added by an unmerged PR reads on `main` as absence, never as error, so "I ran it with the CI
flag" is a claim about the tree as much as about the command. And the fix is the one already
recorded for `perf_bench` against `compile_profile` one directory over — an instrument that
rejects what it does not understand cannot produce this, and a permissive one produces a
comparison between a mode and itself. The instance is kept because it happened **thirty minutes
after telling a peer the same thing about the same script**, by the author of that correction:
quoting a hazard is not defending against it, and knowing which hazard is not either.

### When an empty input means "assume everything", check the output whose default is the opposite

`corpus-compat-job-filter.mjs --changed-files` takes a **path to a list file**, not a list of
names; `existsSync` turns anything else into `[]` with no error. `:147-149` then reads an empty
list as "a schedule or dispatch run" and gives every `JOB_TARGETS` job `true`, which is the
documented, deliberate over-approximation. `:155` computes `lsp-ratchet` as `[].some(…)`, which
is **`false`**. So one malformed argument fails *open* on every sibling output and *closed* on
exactly one — and `lsp-ratchet` is the escape hatch that re-admits the 950-job-minute
`lsp-corpus` job on a pull request, the only event where it is consulted at all (a schedule or
dispatch already satisfies the first disjunct). A broken argument silently disables the hatch on
precisely the PR class it exists for, and the comment at `:147` documents only the open
direction.

Measured four ways on one tree: the ratchet JSON's real path → `lsp-ratchet=true` (positive
control); a crate in its own Cargo workspace → every output false (negative control); a
nonexistent path and a bare file name → `lsp-corpus=true, lsp-ratchet=false`. The rule is not
"validate the argument" — it is that a function with a documented "empty means everything"
default has to be read output by output, because a `.some()` over the same empty array points
the other way and inherits none of that comment.

### Two things spelled `hash=`, and the comment describing the other file had both halves backwards

An LSP ratchet key can carry `missing-rsvelte-field[hash=digest(left[key])]`, where the digest is
of the **value** and an artifact recovers it, or
`:extra-rsvelte-element[count=N,hash=digest(extraRsvelte.sort())]`, where the digest is of
identity keys that are themselves `item-<digest(value)>` — doubled, and not preimage-able.
`diff.mjs`'s comment says the key "keeps the suffix and drops the bracket"; `verify.mjs:462`
strips `-element`/`-field` and keeps the bracket, so **both halves are inverted**. A comment
about what a *downstream* stage does with your value is checked by neither file, which is the
same rot class as a count written into prose.

The measurement is what makes it actionable rather than a warning: of 23,746 keys, **0** carry a
suffix that would separate the two and **1,880 carry `count=`**, so `count=` is the only
surviving discriminator and 92% of keys are preimage-able. Written as a bare "the hash has no
preimage", the note stops the next reader from trying the thing that works nine times in ten —
**a caution sized to the exception is a false statement about the rule.**

### A probe filter that discards on BOTH sides reads as agreement

A six-cell reduction reported `EQ` on every cell, and the reduction was correct — the
instrument was not. Two independent bugs, and fixing the first left the second answering
identically: the NAPI `compile` returns an object where the probe called `JSON.parse` on
it, and the line-picker matched `"f"` while the generated code spells
`$.prop($$props, 'f', …)`. After the first fix the picker returned `(none)` for **both**
sides, so the comparison was `(none) === (none)`: six cells of nothing printed as six
cells of agreement. The cell that finally moved was byte-identical to cell 1 of the broken
grid.

This is the truncation table one level in — the discarding stage is inside the comparison
rather than before it, and that changes its signature. A filter that drops the carrier
**asymmetrically** produces a loud `DIFF`; one that drops it **symmetrically** produces a
silent `EQ`. So the positive control has to run **before** the result is read, not after:
here the control (the real corpus file the entry came from) reproduced immediately and
named the instrument, but the six green cells had already been reported. The same session then armed a
CI monitor three times and made its green predicate unsatisfiable twice, in two different
ways. First it required four heavy gates matching a regex containing `^Tests$` — no check is
named `Tests`, they are `Test (ubuntu-latest, N)` — so the count could never reach four.
Corrected to a real name list and verified against live data at 7, it then required all seven
to be `SUCCESS`, and `Output-preserving corpus diff` is legitimately **SKIPPED** on a
path-filtered PR, so seven-of-seven could never happen either.

That is the reusable list. A success predicate has three independent ways to be unsatisfiable
— **a name that matches nothing**, **a count that cannot be reached**, and **a conclusion
value that never legitimately occurs** — and a skip is the one people forget, because it is
neither success nor failure and reads as neither. Each guard here was added to fix a false
green and replaced it with a permanent silence. **Both directions of a dead predicate cost the
same thing, and neither announces itself**, so evaluate the predicate against live data
*before* arming it, and confirm it would fire on a state you have actually observed rather
than on the state you imagine "done" looks like.


### A grid's cells carry a direction; the mechanism does not have to

A generated family is written from shapes its author could think of, and each cell has a sign as
well as a shape. Two mechanisms were summarised from their cells on the same day and both
summaries were wrong about the sign:

- one was written up as "rsvelte breaks the chain deeper than the oracle" from two cells that both
  ran that way. Fingerprinted across the corpus: **46 that way and 37 the other**. A fix built
  from the two cells would have made the 37 worse.
- the other genuinely had both signs in its cells (`+2`, `+2`, `−2`), which is what prompted
  putting the sign in the key — and the corpus then held **only the negative**, 2 entries, zero
  positive. The cells' balance was not the corpus's.

So the rule is not "watch for a mechanism with two directions", it is: **a direction read off a
family's cells is a property of the cells**. Fingerprint it against the collected corpus before a
summary sentence gives it a sign, and count the signs separately — `±2, two entries` and
`−2 twice, +2 never` are different findings and the first one hides the second.

### `n passed` is not the only fingerprint that is population-specific

This file records reading a suite's *names* rather than its count, and gives a four-digit
`running N tests` line as the fingerprint that `--lib` ran. That number is a property of
`rsvelte_core`, which has ~1,959 lib tests; a crate with a dozen prints a one- or two-digit count
that is indistinguishable from noise. The general form is the line `Running unittests src/lib.rs
(…)`, whose presence answers the question and whose absence is the failure. **When you hand
someone a fingerprint, hand them the one that does not depend on which crate they are in.**

### Port a guarded recursion with its guard, because a grid built for the recursion cannot see it

Upstream's `scope.evaluate` resolves an identifier with

```js
if (!binding.updated && binding.initial !== null && !is_prop) {
  binding.scope.evaluate(binding.initial, this.values);
  break;
}
```

— one `if`, three conditions, then a recursion. A fix that ports the recursion (evaluate the
rune's argument rather than treating the lowered call as opaque) passed a 68-cell grid over four
hosts with **0 divergences**, and dropped `!binding.updated` on the way: in generated text a write
has become a CALL (`$.set(c, 1)`, `$.update(c)`, `$.update_pre(c)`), so oxc scores the only
occurrence of the name a **read** and "is it ever written" answers yes.

The grid could not see it because a grid is written from the shape the recursion takes, and the
guard is about a *different property of the same declaration*. What found it was a second cell
list, generated separately for a Rust test, that happened to contain `let c = $state(0); c = 1;` —
luck, not method. The method is to read the guard as part of the thing being ported: **each
condition in the `if` above the recursion is a row**, and the row set for `!binding.updated` is
every spelling the lowering produces, enumerated from the oracle rather than remembered (`=`,
`+=`, `++`, `++c`, `&&=`, `??=` → three helper names).

### A row in this file carries a scope, and citing it is not checking it

Every paragraph here was written about a particular population, and the sentence
that survives into someone's memory is the claim without its domain. Measured
twice in one day, in opposite directions:

- "`lang="ts"` selects a different parser" is true of `<script lang="ts">` and of
  `parse()`, and it was cited to justify adding a `.svelte.ts` axis to a
  `compileModule` grid. `compileModule` **rejects TS syntax on both sides** —
  `0 as number` and `import type` are `js_parse_error` for official and for
  rsvelte alike — so `.svelte.js` and `.svelte.ts` are one input class there and
  the axis measures nothing. The toolchain strips types before the compiler sees
  the file.
- The same row read the other way is still useful: it says a `.svelte.ts` column
  that agrees with its `.svelte.js` column agrees **structurally**, not by luck,
  which is a different record to keep than "both were 0".

So when a cited row would license a new axis, a new skip, or a new expectation,
spend the one probe that asks whether its population contains yours. The cost of
not doing it is not a wrong answer — it is a column of cells that cannot move.
**And when the cited row supplies a DIRECTION rather than an axis, check that the
direction's derivation covers your case**, because a direction that does not
apply is not a weaker claim, it is a wrong one. The row above about
reconstructing a gate derives its direction from the KIND of stage that went
missing — dropping a *rescue* stage makes a reconstruction stricter, dropping a
*judging* stage makes it looser. It was then cited to argue that a formatter
reconstruction whose comparison is byte-identical to the gate's must be stricter,
so a match under it is a match under the gate. The reconstruction had replaced a
**production** stage (`--stdin` where the gate calls the directory once), and no
strict/loose order is defined over that at all: the argument silently assumed the
two productions emit the same bytes. The teammate holding it did not argue the
direction — they removed the assumption, by making their oracle leg call what the
gate calls. **Removing a premise beats reasoning about which way it errs.**

**The same day produced the mirror-image error, and naming both is what makes the
pair useful: each read a property of the POPULATION as a property of the
MECHANISM.** A `$.assign` fix moved 0 of 135,560 corpus pairs and was written up
as having closed its class — it had not; the grid held the *host* fixed at
`<script>`, and the real carrier was a legacy `on:` directive, a second port the
grid could not reach. In the other direction, a formatter fix moved 10 of 24
generated cells and the movement was about to be quoted as its corpus reach — the
ratchet moved 2, because the generated family manufactures the >320-column header
that almost no real file has. A sweep's zero and a family's ten are both counts of
inputs, and neither is a count of mechanisms.
**A control has a direction, and one direction is not two.** Rule 2 asks for a
positive control; the corresponding negative one — an input the instrument must
score as *nothing* — is a different test, and each is passed by a broken
instrument the other catches. Two clean examples on 2026-09-02, opposite ways
round. A detector for a source-map defect counted segments anchored inside a
string literal and returned 44 on the positive case: plausible, and wrong, since
the mapper is *supposed* to map inside a string — the negative control, a file
with nothing wrong in it, returned 24 and killed the predicate. A profile classifier that had to say which frames
sit under `3_transform` scored `js_scan::skip_opaque` at 77% / 7.4%, when the
function lives in `3_transform/shared/js_scan.rs` and nothing but ~100% can be
true; its negative control (`phase1_parse` = 0%) read correctly **before and
after** the fix, so the negative side alone certified a classifier that
understated the bucket by 2.3x — and it understated it in the direction of an
attractive conclusion ("the AST migration buys little"). A one-sided control set
is passed by whichever failure leans its way.

**Where a control can be built by changing the INSTRUMENT rather than the input,
it constrains more.** Every control above varies what the instrument is fed, which
shows only that two inputs differ. Classifying one live process against two
candidate root pids — it must read foreign against the harness's root and mine
against your own shell — pins that the classifier is reading *the root*, because
anything else it might key on is held fixed and the answer still has to flip.
Prefer that form when the instrument takes a parameter you can move.

**Remember a rule by the failure it prevents, not by when to apply it.** The rule
above — identify an arm by a discriminating probe on its output, never by its
file name — was quoted at an experiment that measures the *box*: one binary,
24 samples, code held constant and only the clock moving. It does not apply
there, and the reason is mechanical rather than a judgement call. What the probe
prevents is **mixing up two arms**; with one arm there is nothing to mix up, and
the invariant that experiment actually needs ("did all 24 samples hit the same
bytes?") is answered by hashing the file before and after, which a probe cannot
answer at all since it observes one invocation. Naming the failure mode settles
applicability for free, where "check whether the rule's dependency holds" only
poses the question. Applying a rule where nothing it guards is at stake is the
mirror image of quoting one and then walking into it — in both, the rule is
being recalled as a slogan rather than as a mechanism.

**And an interpretation's plausibility is not evidence for the number under it.**
Both of those wrong numbers came with a sound-sounding story attached, and in
both cases the story is what made the next step feel unnecessary. The rule that
survives: when a measurement arrives already fitting your thesis, that is the
moment the control is worth its cost, not the moment to spend it elsewhere.

**A number can be right and the inference it supports still false — and checking
the number will never find it.** This file said "re-parsing is 3-4% of compile
time" and concluded *do not size the AST-pipeline work against the performance
case*. The 3-4% is correct; it counts `Parser::new` / `SemanticBuilder::build`.
What it does not count is the **byte scanning** — `str::pattern`, `memmem`,
`js_scan::skip_opaque` — which is 11.53% (client) / 14.73% (server) of
`compile()`, of which 9.78% / 12.20% sits under `3_transform` and is there
*because there is no AST to ask*. So the sentence set "what the migration
returns" equal to "what re-parsing costs", and the scanning was never in the
denominator. Every check anyone could run on the 3-4% would have confirmed it.
Ask separately what a figure is, and what it is being used to decide.

**A shortfall smaller than the deciding arm's own drift is not a shortfall.** A
report read client 9.63x, server 19.59x, client-dev 13.89x, server-dev 19.98x
against a 20x goal and was reported as *no surface reaches it*. But the arm that
decides the ratio — the only one loading all ten cores — drifts ~5% **within a
single run** (`first2/last2` 0.946-0.958, while both single-threaded arms are
flat at 0.989-1.045), and server's shortfall is 2.1% with server-dev's at 0.1%.
Recomputing the ratio off the first two and the last two samples gives
19.2-20.3x: 20x is inside, and neither verdict is supported. Two of the four
surfaces are genuinely short and two are undecidable, and reporting all four
under one sentence let the undecidable pair inherit the decided pair's answer.
**A negative verdict about your own work is still a claim and needs the
precision a positive one would get** — the direction that flatters nobody is
exactly the one that gets waved through the check. Before reporting a miss, put
the shortfall next to the spread of whichever arm the ratio is most sensitive
to; a within-run trend is not visible in a cv or a median, so it has to be
looked for on purpose.

**Before designing an experiment, check whether the instrument already answers
it.** Asked to separate a thermal cause from a contention one, the proposed
design was two arms — with and without a cool-down between rounds — which
confounds the thing being varied with total wall-clock exposure to external
load (the long arm sits in the world longer, so an external cause makes the
*cooled* arm look worse and reads as "cooling does not help, so not thermal").
The redesign that replaced it needed one arm. But the deeper miss is that
`perf_bench` already prints CPU time beside wall clock, and its own doc comment
states the discriminator: a frequency drop spends more CPU seconds on the same
instructions, while contention raises wall alone. The experiment was being built
to measure something the existing output separates for free. And a second
deduction was available with no measurement at all — the harness spawns a fresh
process per sample, so anything carried between samples is not process state,
which eliminates allocator arena growth and pool warm-up before any run starts.
Read what the instrument already emits, and ask what the measurement design
already rules out, before adding an arm.

### Nothing about a measurement arm is evidence of what it measured

An A/B here is two `.node` binaries, and every cheap way of saying which is which
has been wrong on this repository within one day of the others:

| the label | why it lies |
|---|---|
| the file name (`main.node`) | it was built from a feature branch an hour earlier and never renamed |
| `buildInfo()` | `build.rs` stamps do not refresh on a rebuild |
| the artifact's path | with `CARGO_TARGET_DIR` set, the path no longer depends on cwd — so it stops proving which tree was compiled |
| the branch you think you are on | an agent's shell cwd silently resets to the main checkout, and `cargo` then compiles someone else's working tree with no error |
| "the same branch as last time" | the branch was rebased between the two builds, so the arms differ by whatever landed on `main` in between |
| the source the build read | it was edited *while* the build ran, so the artifact answers to no tree at all — and nothing in the name, the path, or the `Compiling` line records it |
| two labels, one artifact | a `sed` rename chain applied in an order that made both arms resolve to the same file — the arms were never distinct |
| the flag you passed to select the arm | the tool never parsed it — `compile_profile` hardcoded `GenerateMode::Client` and read its other flags through scattered `env::args()` predicates, so `--target server` profiled the client |

Two rules cover the first six. **Identify an arm by a discriminating probe on its
output** — one input whose answer differs between the two arms, run through the
binary you are about to measure with. A probe only separates the hypothesis you
handed it: an arm was probed with one fix's fingerprint, came back clean, and was
then trusted as "named correctly" — the mislabelling surfaced only from a *second*
probe carrying a *different* fix's fingerprint. Probe for what the arm should
contain **and** for what it should lack. **And a probe on the wrong half of a
compound fix is powerless even when the hypothesis is right**: #4139 restores a
leaked read *and* re-scopes the matching write, so an input exercising only the
write returns identical output from both arms — not because the arms are the same
but because that half of the change nets to zero. A fix built from two changes
that cancel needs its probe on the half that does not. And **read the build's own
`Compiling <crate> (<path>)` line** to learn which tree it read: that is the only
signal `cd`, `CARGO_TARGET_DIR`, the file name and the artifact path cannot
between them fake. Build as `cd <worktree> && CARGO_TARGET_DIR=<worktree>/target
cargo …`: the `cd` protects your sources, the env var protects everyone else's
`target/`, and neither protects the other.

Prefix **every** Bash invocation with `cd <worktree> &&`, including the ones that only read.
The tool result's `Shell cwd was reset to …` line is the observation; "I ran `cd` earlier in
this session" is an assumption, and the two disagree silently. The prefix does not prevent the
reset — it only makes each call independent of the previous call's cwd. What it cannot fake is
the build's own `Compiling <crate> (<path>)` line, so read that before trusting any arm.

**And the same hazard has a read-only form that no `Compiling` line can catch.** A ratchet census
run in the primary checkout reported `known-failures.client.json` at **17**; `origin/main` reads
**14**, because that checkout was parked on a documentation branch cut before three merges. There
was no build, no arm and no binary — just `readFileSync` over `compatibility/`, which is the
cheapest possible measurement and was of the wrong tree. A census is a measurement of a tree in
exactly the way a baseline is, so name the tree in the output (`git rev-parse HEAD` beside the
counts) rather than in your intention; a number with no revision beside it cannot be checked by
anyone, including the person who produced it.

**A running measurement holds the working tree until its LAST `cargo` call, and
"no cargo is running" does not mean the build is behind you.** `run-performance.mjs`
builds each surface lazily, so a report started at 01:04 spent fifteen minutes in the
JS arm with no compiler in sight and then invoked `cargo` at 01:19:31 — twenty seconds
after an unrelated source edit, which it compiled into the arm it was about to measure.
The row above ("edited *while* the build ran") only fires once you know a build is in
flight; here the process list said there was none, and it was telling the truth. Before
editing, ask what the running harness has left to do, not what it is doing.

**And a two-arm sweep has two ways to report zero, so the key check and the arm
check are both necessary and neither is sufficient.** A 135,560-pair sweep
reported `MOVED=0` twice for opposite reasons. The first time the reader had the
field order wrong — `sweeparm.mjs` writes `target \t hash \t id`, the reader took
the id as the hash — so it compared each unit's *id* against itself and zero was
arithmetically forced; the collapse signature caught it (`135560 rows, 128656
distinct keys`), which is the control this file already prescribes. The second
time the key was right, rows equalled keys, and zero still had two explanations:
the change moves nothing, or the two arms are the same binary. Only a
discriminating probe separates those, and it has to be run **before** the zero is
believed rather than after — an arm probe that follows a result gets read as
confirming it. Print `rows / distinct keys` and the probe's own table beside every
`MOVED=n`; a bare zero answers neither question.

A second, independent signal is the **diff between the two arms' trees** (`git diff <base> HEAD
-- crates/`): a one-line answer to "do these arms differ by the change I think they do". Neither
signal is sufficient alone — the `Compiling` line says which tree was read but not what is in it,
and the diff says what is in a tree but not that the arm was built from that one. Read both.

**The flag row is the cheapest to defend against and was the last to be found.**
`perf_bench`, in the same directory, ends its argument loop with
`other => panic!("unknown arg {other}")`; `compile_profile` had no loop at all.
One instrument rejects what it does not understand and its sibling ignores it,
and the permissive one produced a false client-vs-server comparison whose shares
agreed to 0.2pp — read as "the two targets do the same work" when it was one
target measured twice. **A flag is a label**, so it earns no more trust than a
file name does; the discriminating probe has to be on the output. When adding a
tool, make an unknown argument an error, because the failure it prevents is not
a crash, it is a comparison between an arm and itself.

The last row is the expensive one, because its symptom is a plausible result.
A `before -> after` sweep reported 4 output changes "toward official", two of
them to byte-equality — in the right direction, at the right size, and
flattering to the PR. The two arms had been built from different merge bases,
and the four files were `.svelte.js`, which the changed template visitor cannot
reach at all. **Ask what mechanism could carry the change to each moved file
before attributing any of them**; a direction that matches your hypothesis is
the cheapest thing for an artefact to imitate.

It recurred, and the second instance is cheaper to detect than the first because the
discrepancy is a git fact rather than a mechanism argument. A baseline arm was built at
`4cdc135cb` while the head branch's own merge base had moved to `95ba24874` one merge earlier,
so the two arms differed by the change under test **and** by the PR that had landed in between.
The sweep reported **4** moved units, all `MISMATCH -> match` — the flattering direction, at a
plausible size. Rebuilding the baseline at the branch's actual merge base gave **2**, and the
other two were the intervening PR's. `git merge-base <branch> origin/main` against the commit
the baseline binary was built from is one command and settles it; run it before the sweep, not
after a result you like.

**The last row is a different failure and the probe cannot see it.** Rows 1-6 are
an arm whose *identity* is wrong, and a discriminating probe settles every one of
them. Row 7 is two arms that are the *same* arm — and probing both returns the
same answer, which reads as "the two runs agree, my instrument is sound". What
denies it is `sha256` of the two artifacts, and hashing alone is not enough
either: two different files can legitimately hold the same behaviour, so equal
outputs from distinct hashes is a real zero. The hash rules out sameness and the
probe rules out mislabelling; **neither substitutes for the other, and both are
needed on a measurement whose answer is 0**. Note the scope: this class can only
surface on a run that reports nothing moved, so it is invisible to every
`moved > 0` sweep, and the instance that produced it was the *third* consecutive
`moved 0` on the same instrument — **the number you predicted is the one you will
not re-derive**. The mechanism was a single `sed -e 's#a#b#; …; s#c#a#'` whose
first substitution pushed the new arm aside and whose third re-created its name:
collapsing a rename chain into one command hides the intermediate state that
would have shown `a` being defined twice.

### When the result is a ratio, pair the arms in time

The section above is about *which binary* an arm measured. A second class is
about *when*. A speedup is `official / rsvelte`, and measuring the two minutes
apart divides two numbers taken under different load — which reads as noise and
is drift. One tree measured **16.3x-20.3x** with the arms taken separately and
**22.64x median over 16 rounds** with official and rsvelte run back to back
inside each round, the ratio formed inside the round and the order alternated
so a monotonic drift within a round cannot favour either. The correction
exceeded either arm's own variation, so re-reading the separated numbers could
not have found it. ABBA across *arms* does not cover this: the thing measured
separately is the comparison target.

Pick one statistic and use it on both sides. `max(A)/min(B)` produced a
withdrawn 1.354x on the same day, and a 6-versus-10 thread comparison flips
sign between "best block" and "median of block minima".

### "Measured but not established" is a work item, not a caveat

Two changes shipped whose own commit messages said the decisive number had not
been taken, neither with a follow-up queued. The batch pool sized to the
performance cores said "whether it is also slower in wall clock is measured but
not established" — it was **7% slower** (client 19.56x against 21.04x), and that
was the difference between meeting a throughput goal and missing it. A UTF-16
column resolved by subtraction on ASCII carried a 2.14% upper bound from a
profile and measured **null** (median 1.0007, range 0.9778-1.0047) on a corpus
that is 88.9% ASCII, i.e. its own best case. Both were reverted; **nothing
committed on an unmeasured estimate has yet come back positive.**

### Name a residual `unattributed`

`compile_profile` computed one row as the phase total minus six timers and
printed it as "Pre-frag setup". A residual always makes the table sum to 100%,
so the row reads as a measurement of the thing it is named after; it was 11.7%
of client compile and the name was a guess. Two mechanical traps came with it.
`Phase3Breakdown` is summed **field by field** at the call site, so a new field
on the struct compiles and reports `0.00ms` — indistinguishable from a timer
that never fires. **That recurred on 2026-09-02, to the person who wrote this
sentence**, on the first new field added after it: five named slots printed
`0.00ms` and were read as "these calls are free". A documented trap whose only
defence is the documentation is not defended — the struct now carries an
`AddAssign`, so the requirement sits beside the definition rather than in a
binary nobody opens when adding a field. It still has to be edited; what changed
is where the editor is looking when they must. And a timer bracketing "everything after the match" contained
another timer's region, so one bucket double-counted and the residual was
subtracted twice; **a wrong instrument rejects the correct hypothesis** — with
the over-wide timer, map work summed to 11.6% against a 12.2% ablation, which
reads as two independent measurements agreeing. The contradiction was found by
a second party's arithmetic, not by re-reading the code.

### The instruments drop a field too, and they drop the same one

Gate blind spots are a question about what a comparison commits to. This is a
different shape: of the 10 binaries under `crates/rsvelte_devtools/src/bin/`
that read `js.code`, **0 read `js.map`** before 2026-09-02 (three were fixed
that day). Not a tendency — no exceptions. The denominator is 10 and not 41 or
27 on purpose: 27 of the 41 call `compile`, and 17 of those consume no output
at all (they count allocations, time phases, or read the AST), so a tool that
never looks at `js.code` is not blind to `js.map`. `ab_dump.rs`, the tool for reducing
a corpus divergence to one diagnosable file, is among the blind ones, so a
divergence that moves only the map disappears the moment someone reduces it.
Whether this is "the map is not output" as a premise, or only that these tools
were written for throughput and code equality, is **not separated** — the 10/10
is what was counted.

### Quoting a hazard is not defending against it

Three instances in one day across three agents, each by someone who had cited
that exact rule earlier the same day: a `| tail -30` that kept the exit status
honest through `pipestatus` and threw away the test denominators; a `grep`
against a task-output file rather than the log it wrapped; a `debug_assert_eq!`
written into an instrument whose own comment said it would run under
`--release`. The knowledge was present every time and the trigger was not.

**What fires these rules, in practice, is a second derivation — not vigilance and not
head count.** Over one day of three sessions working the same measurements, every rule
that actually caught something was triggered by someone else's number disagreeing, and
none fired from inside the person holding the error. The discriminator is visible in
which errors were caught and which sat: two counts of the *same quantity by different
methods* (147 vs 231) exposed a method fault within minutes; one number read by two
people under *different assumed populations* (a static inventory vs a runtime
observation) exposed that its derivation was never recorded; while two figures nobody
else had any reason to compute — a share quoted against the wrong denominator, and a
key-set size — sat unchallenged until their own author happened back over them. So the
condition is **the same quantity produced twice by independent derivations**, and extra
people are only one way to buy that. Two runs of one harness buy nothing. Writing the
rule down supplies the vocabulary to name the fault once it surfaces; it does not
surface it. This is `two-ports-inventory` read forwards: that file lists places where
two implementations exist and are never compared, which is the same lever with the
comparison missing.

**Three variants of "it was there and did not connect" turned up in one day, and the
documentation variant is the one to act on.** A rule quoted that morning and then walked
into; a finding established that morning and re-derived from scratch that afternoon by its
own author; and a paragraph in `docs/perf-baseline.md` that ended *"the report **should**
say so in `provenance.benchmarkDesign`"* — where the field held a bare URL and the
disclosure had never been written. The first two are attention; the third is mechanical and
permanent, because **a sentence that ends in "should" is indistinguishable from a sentence
that ends in "does" to everyone who is not currently editing that file**, and nothing greps
for it. When a finding implies a change somewhere else, make the change in the same commit
or open the issue; do not leave the obligation in prose. What surfaced this one was not the
re-derivation — it was checking the re-derived claim against what the tree already said,
and asking why a recorded fact was not in effect.

**Prefer an oracle whose failure cannot be mistaken for its answer.** Every entry in the
truncating-stage table above shares one mechanism: the failure returns a value with the same
shape as a result — `tail` returns lines, `|| echo 0` returns a number, `2>/dev/null`
returns an empty set, a rejected timestamp returns a count. A grep whose pattern is wrong
still returns a count; a type check whose premise is wrong does not compile. So where a
claim can be *stated as a type* — "no key on this path is computed" becomes a `&'static
str` parameter — the compiler answers it with a shape that cannot be read as data: it
builds, or it names the counterexamples with positions. Choose the instrument whose return
shape matches the claim's shape.

Two shapes of the same failure are worth naming separately, because neither
looks like forgetting the rule. **A control you designed yourself still has to
be run**: a key-set difference was reduced by grep, the difference looked
explicable, and the runtime step of the author's own four-step procedure — check
that a key in the difference really is absent at runtime — was skipped because
step 3 had already produced an answer. That step would have failed instantly on
the first key in the list. The procedure was written when the hazard was clearly
in view and abandoned at the moment it would have paid.

**And a disqualified number keeps circulating as a number.** Two client figures
existed, 14.35x from an instrument whose defect had been found and 9.63x from a
window its own author had contaminated. Both were rejected, in writing, in this
file. A delegation written afterwards still opened with "the factor needed is
14.35x → 20x = 1.39x", and the same message explained a paragraph later why
9.63x was untrustworthy — the contradiction survived because the rejection and
the reuse sat in different paragraphs. The needed factor is 1.39x or 2.08x
depending on which is current, and 2.08x is above what the largest known lever
can deliver, so the two readings point at different work. **When you retract a
measurement, retract the quantity, not just the sentence around it** — otherwise
the retraction is a note and the number is still load-bearing.

### Three things answer to "the official compiler", and they disagree

An ad-hoc probe that does `import { compile } from 'svelte/compiler'` does **not** get the
compiler the gates use. Measured on one input (`{ a: function () {} }` in an instance script):

| entry point | `VERSION` | output |
|---|---|---|
| `svelte/compiler` (npm) | 5.56.10 | `a: function () {` |
| `submodules/svelte/packages/svelte/src/compiler/index.js` | 5.56.10 | `a() {` |
| `submodules/svelte/packages/svelte/compiler/index.js` (built) | **5.56.8** | `a() {` |

The gates use the **source** path, centralised as `OFFICIAL_COMPILER_REL` in
`scripts/compat-corpus/oracle.mjs`; use it in a probe too. **`VERSION` proves nothing** — two
of the three disagree on output while reporting the same string, and the third reports a
different string while agreeing. This cost a near-miss: a correct `auto_method` lowering was
diagnosed as a defect and nearly deleted from three ports, because the npm build prints
`close: function ($$arg) {` where the submodule prints `close($$arg) {`.

No gate compares generated code against the npm build (`test-wasm-compile-options.mjs` imports
it only to ask whether an option *throws*), so the hazard is probes, not gates.

### Generate an expected value from the oracle; do not back it out of the oracle's output

A test's expected strings are a second implementation of the rule, written by hand, and the
cheapest way to get them wrong is to infer them from a few outputs. Two instances on one day.
A `$state(p ?.5 : 1)` row was typed as `$.state($.proxy(p ? 0.5 : 1))` from two neighbouring
cells; official neither normalises `.5` to `0.5` nor leaves the ternary unproxied, so the
hand-written row was wrong in two independent ways and the test failed for neither of the
reasons it was written to check. And the span a `@typedef` tag occupies was inferred from
official's output, giving a rule ("delete up to the next tag") that is **right in three of six
cells**: `@typedef {X} T` ends at the name, while `@typedef {X} T<Id=(string)>` treats the
angle-bracket text as the tag's *comment* and swallows the following `\n   * `. Printing
TypeScript's own `tag.pos` / `tag.end` settles it; six outputs do not.

So: **compile the inputs through the oracle and print the answers**, then paste those into the
test — `submodules/svelte/.../compiler/index.js` for compiler output, and the oracle's own
functions where they can be called directly. Back-inference gives you exactly as much
confidence as the number of cells that happen to agree, which is why it fails on the
interesting ones.

**And the corrected rule was still wrong, for the reason the first one was.** `getLastLeadingDoc`
(`tsAst.ts:143-160`) reads `tag.pos` / `tag.end`, which are **SourceFile-absolute**, and hands
them to `nodeText.substring`, which is **node-relative** — so the slice is off by `node.pos` for
every declaration that is not the first statement. Where the shifted slice happens to occur in
the comment it deletes the wrong text; where it does not, `replace` silently no-ops and the tag
survives. Porting the rule *correctly* therefore diverges on 2 real files while fixing 1
(`match -> MISMATCH: 2`, `MISMATCH -> match: 1` over 738 moved units). The grid that produced
the corrected rule had every declaration at the top of the script, so `node.pos` was 0 in every
cell — **the constant it held fixed was the branch condition**. That is the same shape as a
grid whose bindings all share one name, where a name-keyed test cannot see shadowing: adding an
axis is not what finds these, moving a held constant is.

### A changed hash is not a fixed file, and five samples can be one sample

Two independent measurements of a fix's blast radius converged on the same two
stages on the same day, which is what makes it a procedure rather than a habit.
**Stage one** hashes every corpus unit under both arms and reports the set that
moved; it answers *what did this touch* and nothing else. **Stage two** takes only
that set and compares it to the oracle through the gate's own normalization; it
answers *which way*. Collapsing them reports the first number as the second: one
sweep moved five ids and retired three, because the other two changed their output
without changing their verdict — the first differing line was identical before and
after. Print `match -> MISMATCH` on its own line at stage two; a fix that repairs
n cells and breaks n is the same total as one that does nothing.

The same asymmetry applies to a *sample*. Five samples drawn from five different
files are not five independent cases if the sampler varied the file and held the
position: an LSP label's five representatives turned out to sit at `0:2`, `0:9`,
`0:15` and `1:11` — the `<script` tag name, the `lang` attribute name, its value,
and the first import line — so "not-MANY at n=5" was really n=1 with the file
varied. Report the sample's real denominator (`n=5, sites=1`), not its nominal one.

### The ORDER of an upstream guard can be the semantics, and only the oracle can say so

A port is checked against "does it have all the same conditions". It is not checked against
"does it have them **in the same order**", and for a guard that writes shared state the order is
the rule. `build_bind_this` (`shared/utils.js:265-268`) pushes onto `seen` *before* it asks
`is_reference`, so an identifier in a non-reference position **burns the name** and the real
reference after it is dropped: upstream collects nothing from `els[{ k: k }.k]` and collects `k`
from `els[{ kk: k }.kk]`. Write the readable thing — visit references, then record them — and you
get a port that is easier to read and disagrees with official. **The symptom is
indistinguishable from a missing condition**, which is what makes this expensive: reading the
rsvelte side produced a confident, plausible, wrong cause (a missing `JsExpr::Object` arm in a
hand-written walk), and adding that arm made the port *over*-collect while the count of failing
cells stayed the same.

What discriminated was probing the oracle with the shapes side by side — `{ k }`, `{ k: k }`,
`{ kk: k }`, `[k][0]`, `` `${k}` ``, `k || 0` — which is where "the axis is whether the key repeats
the name" becomes visible and "is it an object" stops being. **Reading your own side explains a
divergence; only the oracle names it.** And print `match -> MISMATCH` on its own line when you
re-measure: an over-collection and an under-collection of the same size are the same total.

**A third thing has to match, and it is the one a reader checks last: the ARGUMENTS.** A CSS
divergence was diagnosed from upstream — `is_empty` is tested before `is_used`, and an unused
child empties its parent — as "rsvelte must have the order wrong, or not have the rule". It had
both: the order was right and carried a comment saying so (`empty wins over unused`, citing the
upstream visitor), and the rule was implemented. What was wrong was the flag passed in:
upstream's `is_in_global_block` is `metadata.is_global_block`, true only for a **bare** `:global`
block (`css-analyze.js:24-30`), and rsvelte passed one that is also true inside `:global(.foo)`.
So conditions, order, arguments — and the comment asserting fidelity was correct, which is worse
than a wrong one, because its correctness is what made the neighbouring line look checked.

### And whether it unwinds is the complexity bound

`get_ancestor_elements` (`css-prune.js:845`) adds a `SnippetBlock` to `seen` and never deletes
it, so each snippet is expanded at most once per resolution. That single missing `delete` is two
rules at once: the answer becomes a function of where the walk started rather than of the node —
which is why it cannot be memoised — and the walk stays linear. Port it as the readable
depth-first walk that unwinds `seen` on the way out and you get a function that enumerates every
acyclic path: same answers, and it does not terminate on
`svelte.dev/apps/svelte.dev/src/routes/tutorial/[...slug]/+page.svelte`, which `main` compiles in
19 ms. **No output gate can see this class** — it is not a wrong answer, it is an answer that
never arrives, so there is nothing to compare. A 70-cell grid, three committed repros and 121
release test targets were all green. What attributed it was a completed *previous* run of the
same corpus sweep: without a baseline rate, a sweep that stops printing is indistinguishable from
a sweep competing with a build for CPU.

### If the mechanism already has a name in the code, measure the name

Asked whether two CSS residuals were one mechanism or two, the instruction given was "flip one
arm and see whether the fix moves both" — which needs two builds and answers only *after* a fix
exists. The cheaper answer was already in the tree: the empty-rule elision sits inside
`!ctx.dev`, so varying `dev` reports **which path a case takes** directly. One build, and the
two rows separate (`DIFF/DIFF` for the one that is not the empty check, `DIFF/EQ` for the one
that is). A two-arm probe measures *what a change does*; an existing flag measures *where the
input goes*, and the second question is usually the one being asked. This is the sibling of
"a mechanism with a name is settled by `git log -S`" — that one is about provenance, this one
about path.

The same family answers *"is this predicate wrong, or is it never reached"* — two hypotheses that
one sentence ("`is_rule_empty` does not seem to be reached") hides and that repair in different
functions. A `#[track_caller]` counter settles it in one build: 0 lines on the failing input,
**4 lines on a neighbouring input that takes the other branch**, so the zero is the wiring and
not the instrument. It named `transform_rule` → `transform_global_block` →
`transform_rule_preserving`, where upstream has one `Rule` visitor evaluating
`is_empty(node, is_in_global_block(path))` at every depth. That is the two-ports shape with a
piece missing rather than a piece disagreeing: **the second port does not carry the decision at
all.** Reading the predicate instead would have been a careful study of the correct function.
And "A was not called" does not entail "B was": where output exists, something wrote it, so the
probe has to name the writer and not only clear the suspect.

The same episode carries the shape of a well-run zero. The carrier count over 32,650 collected
components was **0**, and it is only readable because the detector was positive-controlled
first: 11 constructed cells, **two of which must answer `none`**, so the instrument is shown to
produce both a hit and a miss; and the target selector was checked by running a known-diverging
file through the identical wiring and watching it swing per target, which is what rules out a
silently ignored argument. State the denominator's own deviation too — 32,650 is not the
pipeline's 33,893 (no markdown blocks, one submodule unexpanded) — and say the difference could
contain a carrier rather than asserting it cannot.

### Say which of the summary and the distribution is primary

"Keep the distribution beside the summary so a wrong summary can be recomputed" is the rule this
repository nearly adopted after a `6.00` that should have been `5.96` — recoverable exactly
because the distribution (3,551 files at 6, 81 at 4) was written next to it. It is not the rule.
The `parse-ast` paragraph has the opposite failure on record: a summary of `459` above a cluster
split that *also* summed to 459, while the JSON held **321** — the two went stale together and
neither checks the other. The recoverable form is **naming the primary source**: the map's
numbers are recomputable because the JSON is primary and the prose is derived. A distribution
transcribed into prose is just a second summary.

### A guard and the computation behind it are two claims about one shape

`try_hug_mixed` admitted a line prefix with `indent.ends_with('>')` — written for a parent's
hugged `>` alone on the line — and then computed the hug's indentation as *the prefix sliced up
to its last space*, which is only that same string on that same shape. A comment ends in `>`
too, so a leading `<!-- … -->` passed the guard and was re-emitted as indentation on top of its
own `-->`: text `compile()` rejects, 1 file in 33,644 (#4151). **Tightening the guard is the
cheap direction and it is usually wrong.** It removed the corruption, and it also removed the
hug — the same 5-case grid then read 3 MATCH / 2 DIFF where the oracle wants 5, and the version
that widened the guard later cost 4 corpus entries. Fixing the *computation* (the line's own
leading whitespace, which agrees with the slice on the shape the slice was written for) took the
grid to 5/5 and the ratchet from 549 to 547 with 0 new failures. Ask which of the two encodes
the shape: the guard names it, the computation assumes it, and only one of them is load-bearing.

The other half is that the premise under the guard was itself wrong. "Comments are always line
boundaries" is a sentence in the code; the oracle glues `><!-- … -->` to a wrapped open tag
exactly as it glues text, which one probe settles. **A refusal justified by a comment is a place
to probe the oracle, not a place to work around.**

And the closing measurement needed a **set difference, not a count**. Compiling both sides'
formatted output over the whole population returns 1,014 rejections on each side — the sources
that do not compile at all (`lang="ts"` and friends) — so the raw count answers nothing. The
quantity is *rejected by rsvelte and accepted by the oracle*: 1 before, 0 after. The mirror
direction is not decoration either; it returned 2, both already carried by
`fmt-oracle-excluded.json`, which is what says the 0 is a property of the fix and not of a
population that lost its rejections for some other reason.

### Split the verdict before you split the cause

A cell that reports one pass/fail per input tells you the input diverges; a cell that
reports CSS text, warnings and JS separately tells you *which stage* diverges, and twice
on one day that was the whole diagnosis: once the pruner agreed and only element scoping
disagreed, once element scoping agreed byte-for-byte and only the prune verdict did not.
The two are opposite defects with the same single-verdict signature. **What made the
split diagnostic was that its axis was the compiler's own stages** — prune, diagnostics,
element scoping — not an arbitrary partition of the output text: each field named a pass,
so a divergence in one field named the pass to read.

### Re-key a grid before adding rows to it

A grid's cell is a comparison, and the comparison has a key. Two defects were found on one
afternoon by changing nothing but the key. A module `$.assign` grid keyed on the **count** of
`$.assign(` calls read 1 vs 1 and scored EQ; re-keyed on the call's **full text** the same cells
reported that rsvelte emits `() => {}` — an empty block body, so the getter stores `undefined` —
where upstream emits `() => ({})`, and that a `<script module>` position argument was being consumed
by the instance pass, so two sites collapsed to one. Both had shipped, both parse, and both are
invisible to a count.

This is the ratchet lesson (**an entry suppresses everything its key cannot tell apart**) arriving
one level down, inside a grid, where it is easier to miss because a grid feels like it is comparing
outputs. It is comparing a *projection* of outputs. Before widening a family, ask what its cells
throw away — and prefer the widest key the assertion can carry, because rows are expensive and a
key change is free.

### A filter's error lives in the bucket it discarded, so sample the REJECTED side

This file already says a population of only-invalid inputs is blind to one direction of a
compiler's accept/reject check. The same hazard applies to a **classifier that sorts work**,
and there it is worse, because the kept side is not merely uninformative — it looks perfect.

Measured on a 1,316-item inventory of catch-all `match` arms. The pre-filter was "a sibling
arm whose head is an enum path is a *kind* dispatch (keep); a sibling arm whose head is a
literal is a *value* dispatch (discard)", giving 714 kept and 590 discarded. Sampling twelve
from the **discarded** bucket found four that were kind dispatches *spelled as strings* —
`match node_type(e) { Some("Identifier") … }` — and counting the whole bucket rather than
extrapolating gave **149 of 590, 25%**. The correct candidate set was 863. Every one of the
149 sat in the JSON-walking lint rules, which is precisely the population where a dropped
node type is invisible, so the filter's error was concentrated on the inputs that most
needed inspecting.

Reading the kept side can never find this: each of the 714 really is a kind dispatch, so the
filter scores 100% against the only sample most people take. Spend the first probe on what
the filter threw away — and count the whole rejected bucket once a single counterexample
appears there, because the rate in a sample of twelve is not the rate you need to act on.

The same inventory's second sieve is the honest companion to this. "Is the `_` arm reachable
at all", computed as the enum's variants minus what the siblings name, eliminated **1 of 714**
— a visitor handling 3 of `Expression`'s 47 variants is ordinary here, so a residue of 44 says
nothing about whether dropping them is safe. What discriminates is whether the caller discards
the `None`, which is not a property of the arm and is not syntactically decidable. Reporting
that sieve as "zero discriminating power" is worth more than a sieve that removes a few rows
for a reason nobody can state.


### An entry condition that is a conjunction is wrong in both directions at once

A job that runs only when two independent conditions hold can be misread by two people in
opposite directions, and neither error is visible from the side its author read. Measured
on `lsp-corpus`, the 950-job-minute gate:

```yaml
if: >-
  (github.event_name == 'schedule' || github.event_name == 'workflow_dispatch'
   || needs.changes.outputs.lsp-ratchet == 'true')
  && needs.changes.outputs.lsp-corpus != 'false'
```

One reader looked at `corpus-compat-job-filter.mjs`, saw that `packageOf` returns `null` for
any path outside `crates/` and that `null` enables **every** job, and concluded a docs-only
PR is expensive — holding a documentation branch out of the queue for it. The other looked
at the event-name guard, saw that a pull request is neither a schedule nor a dispatch, and
concluded a docs-only PR is cheap. **Both premises are true and both conclusions are
wrong**: the filter really does emit `lsp-corpus=true` for a docs change, *and* the job
still does not run, because `lsp-ratchet` is false and a pull request fails the event
guard — while the other eight Corpus Compat jobs the filter enabled do run. The real answer
is neither "everything" nor "nothing" and cannot be reached from either condition alone.

Run the filter with the actual file list (`node scripts/ci/corpus-compat-job-filter.mjs
--changed-files <list>`) **and** read the workflow's `if`. The two artifacts answer
different halves of one question, and the half you did not read is the one that makes your
answer confident.

**And "will this job run" is still not "can this change move it" — there are three
quantities, not two.** The filter derives a blast radius from the *build closure*
(`cargo metadata`), which is a deliberate over-approximation: running a job you did not need
is cheaper than skipping one you did. So a change to `crates/rsvelte_formatter/src/script.rs`
yields `lsp-corpus=true`, and the filter is not wrong — it is answering the outer question.

```
in the job's build closure          (the filter says true)
  ⊋ the changed code is reachable from the gate's population   (measured: false)
      ⊋ the output actually moves
```

Measured on that PR: the real-world LSP suite issues ten methods
(`codeAction`, `completion`, `definition`, `diagnostic`, `documentSymbol`, `foldingRange`,
`hover`, `inlayHint`, `linkedEditingRange`, `selectionRange`) and **`textDocument/formatting`
is not among them** — it appears only in the fixture manifest, a different suite — while the
language server reaches the formatter from exactly one file,
`crates/rsvelte_language_server/src/format.rs`. The binary links the crate and no request
can reach it, so waiting on a 950-job-minute run would have bought zero bits.

Two controls made that a measurement rather than a grep. The method list needs a **positive
control** (`hover` returns 3, so the pattern works) before `formatting` returning 0 means
anything. And a literal grep is blind to a **dynamically composed** method name
(`"textDocument/" + x`), so the bare `textDocument/` matches have to be read: here all three
are `startsWith` filters and nothing is composed, which is what closes the set. Without that
second check the zero is a statement about the instrument, not about the suite.


### Widening a set to close an enumeration hazard moves you along a new axis

A hand-written list of "the kinds this applies to" is only right if the domain is closed, so
the fix is to derive it from the domain itself. That fix has its own failure, and it is not a
smaller version of the first one. `{const …}` / `{let …}` re-applied template-scope reads from
a list of two kinds (each items, await bindings) and missed the other three — snippet
parameters, `let:` bindings and `{@const}` bindings — so a 10-host × 2-syntax grid read
16 EQ / 4 DIFF. Deriving the list from `state.transform` took it to 20/20.

It also **double-applied** every read the pipeline had already performed: the tag's text goes
through the instance-script transform first, and only the `$.get(x)` shape has an
already-wrapped guard downstream, so a prop came out `p()()` and a store `$s()()`. The
original grid was green on all 20 cells while that happened, because it varied the binding's
**host** and held the **read shape** fixed at `$.get`/call. A second grid over eight shapes
— `$$props.p`, `p()`, `$s()`, `$.get(d)`, bare — reported 5 EQ / 3 DIFF on both.

The rule: **the members a widening admits differ from the old members along an axis the
original grid held constant**, so name that axis and grid it before trusting the widening. And
prefer a *complement* over a union when one exists — here the answer is `state.transform`
minus the names the earlier pass already rewrote, which is closed on both sides, where a union
of five hand-listed kinds is closed on neither.

**And the real file carried an axis the synthetic grid held fixed.** The same assignment-chain
work ended with one residue that was a different family entirely: upstream declines to wrap the
innermost assignment of `a[i] = a[j] = a[k] = gray`, because `scope.evaluate(right)` follows
`gray`'s binding initializer to `Math.round(...)` and calls it primitive, while rsvelte's
`is_known_primitive` reads the expression's shape only. Every synthetic cell had used a **function
parameter** as the right-hand side, where upstream wraps too — so a 13-cell grid never reached the
family, and one real component did. Same shape as #2535 one level down, and a candidate sixth
member of #3539's binding-initializer residue cluster.

One further note on that component, `svelte-bits/.../MetallicPaint.svelte`: it is the carrier for
**four** independent mechanisms found in one afternoon (the module `$.assign` value position, the
chain ordering, the only structural carrier of the two-script site collision, and this
binding-initializer family). Read that as a statement about the other 6,901 components rather than
about this one — a corpus that is green is a corpus whose files mostly do not carry the axes.

**The corpus could not have caught it.** A 139,252-unit sweep of the double-applying arm moved
**2** units, and both are the file the fix repairs — the regression has zero witnesses. Only 33
of 33,893 components carry a bare `{const}` / `{let}` at all, 17 of those also mention a prop or
a store, and none of the 17 reads one *inside* the tag. So the sweep, the gate and the ratchet
would all have scored it green, and the eight-cell probe is the whole detector. When a construct
is new enough that the corpus holds it in double digits, "the sweep moved nothing" is a
statement about the population, not about the change.

### A missing key can spell two things, and the conservative default reads the wrong one

`expand_effective_parents` returned `None` — "stay conservative" — whenever
`snippet_render_sites` had no entry for a name, and its own doc comment states that rule
("`None` when a snippet's render sites are unknown, in which case callers must stay
conservative rather than treat the ancestor set as empty"). The rule is right; its domain
was not. An absent key meant *either* "nothing renders this snippet", where upstream's
answer is an **empty** ancestor set and the selector is pruned, *or* "a `{@render}` whose
callee could not be read", where any snippet may be the target. **An empty set is
knowledge, not ignorance**, and conservatism applied to the first case is a silent
over-match that reads exactly like caution.

The two spellings needed separate *code paths* as well: fixing the pruner's domain moved
2 cells and **0 of the 16** the same upstream rule explains, because rsvelte ports
`get_ancestor_elements` twice (phase-3 `expand_effective_parents`, phase-2
`subtree_has_matching_subject_inner`). **One upstream rule, two ports, two defects** —
reading the upstream `break` settles what the rule is, never how many places got it wrong.
A third then appeared under the same rule, so read "two" as the count at one moment.

### A cell written to judge a design decision reports on the code that already exists

Four shadowing cells were added to settle whether a phase-2 port could reuse phase 3's
name-keyed `snippet_render_sites`. They came back naming a defect already in the tree: two
same-named snippets in different scopes collapse onto one `FxHashMap<String, _>` key, so a
snippet nothing renders has its elements counted as descendants of an unrelated ancestor.
Pre-existing was measured, not assumed — both arms of the fix under audit show the same
four cells diverging (22/44 matching before, 24/44 after, the +2 being exactly the cells
that fix targets). Had the cells come after the decision, the name-keyed map would have
been reused, the grid would have passed, and the defect would have gone from two ports to
three. **Write the cell before the decision it is meant to inform, not after.**

### A sieve reduces a sample to a key, and a key can agree by construction

Where the key's range is smaller than the sample's, agreement is a property of the key
rather than of the population. Measured on one gate: the same 10-sample uniformity sieve
yielded 4 distinct pointer shapes for `textDocument/hover`, 4 for `definition` and 11 for
`completion` — hover's divergences can only be `/contents:value-mismatch` or
`/:value-mismatch`, so a hover label's samples agree *by construction* and the verdict
there is not a measurement at all. Report the key's own cardinality beside any uniformity
verdict. The same sieve, given a second axis that reduces the payload to a closed class set
*with the direction of the difference in it*, took the "many mechanisms" count from 3 to 7
on the identical samples — including one label whose samples ran in opposite directions
(official answers with HTML data where rsvelte answers with TypeScript, and the reverse)
and which a direction-free key had reported as uniform.

### A shared crate reaches gates it was not written for

`@rsvelte/svelte-check` is a separately-compiled artifact of `rsvelte_core` with no cascade
edge, so a change under `crates/rsvelte_projection/src/svelte2tsx/` reaches it and a
changeset naming only `@rsvelte/svelte2tsx` fails `check-core-consumer-changesets.mjs`.
Name every consumer the checker lists, not the one whose directory you edited.

### A fix that reaches the reported file has reached one of the places that register the rule

Upstream declares a `let:` binding once, in `phases/scope.js`. rsvelte registers one in
**three** places — `build_slot_function` (the component's own), `process_element_let_directives`
(a slotted element's own) and `visit_svelte_fragment` (a `svelte:fragment`'s own) — so a rule
about `let:` scope is three edits, and the count is not visible from any one of them. The
reported file reached the second and a corpus file reached the third, which is why the first
corrected version still moved 4 units the wrong way: `<C let:a>` around `<span slot="t" let:a>`
had the child's binding masked by the parent's, because the mask is keyed by NAME and upstream's
`determine_slot(node) ? context.state : …` declares a slotted node's own `let:` in the ENCLOSING
scope. The fourth candidate, `<svelte:element let:x>`, needs nothing — both compilers reject it,
which is what closes the enumeration rather than a search that stopped finding things.

Two cheap controls came out of it. **A cell that separates a scope STACK from a flag**: inside
one named slot, an `{#each xs as a}` body reads `$.get(a)` and the very next expression reads a
bare `a` — a mask that is set once and never restored gets exactly one of the two. And **the
control cell whose value on `main` is already correct is not an identity probe**: `main` has no
mask at all, so the same-name arrangement passes there by construction; it discriminates the
broken fix from the corrected one and says nothing about which arm you are holding.

### Two fixes in one file make the arm probe a liar even when the probe is right

An arm is identified by a discriminating probe on its output, and the probe answers only the
hypothesis it was handed. Two independent fixes landed in `regular_element.rs` on the same
afternoon — a `let:`-scope mask and the raw-vs-normalized attribute name — and a `git checkout`
with an uncommitted working tree carried the second onto the first's branch. The probe asked
"is the `let:` fix in?" (yes) and "is the destructured-rest fix in?" (no, correct), and reported
a clean arm identity for a binary containing **both** changes; a 30%-complete 135,560-unit sweep
had to be discarded. The rule the truncation table already states for verdicts applies to arms:
probe for what the arm should contain **and** for what it should lack, and add a cell per
in-flight change in the files you touched, not per change you believe you are measuring.

### A reconstruction of a gate misses in a direction, and the direction is the stage it dropped

A gate's verdict is a pipeline, and a local reconstruction of it drops stages. Which way the
reconstruction is wrong follows from **what kind of stage went missing**: dropping a *rescue*
stage — the corpus gate's `ast_equiv_batch` pass over every byte-different output, or the
oxfmt normalization before it — makes the reconstruction **stricter** than the gate, while
dropping a *judging* stage makes it **looser**. #4152 is the strict direction: a reconstruction
that stopped at the normalized byte comparison reported two entries as still diverging, both on
comment placement, which the AST comparator does not represent — so the gate retired them and
the local answer had said to keep them. That is the opposite of the usual reconstruction hazard
and equally wrong.

The asymmetry makes one side of the fidelity question free. **A stricter reconstruction that
reports zero needs no fidelity argument at all** — a zero under a stricter comparison is a zero
under the gate's. It is only a **non-zero** from a stricter reconstruction that is not a
finding: it is a list of candidates to ask the gate about, every one of which can be a false
positive. Both halves landed on the same day, on the same tree: two false positives from a
strict reconstruction, and a 135,592-pair `compile()` sweep over raw output hashes that needed
no gate confirmation for exactly this reason.

The instrument that reproduced the gate needed **its own positive control**, and the first
version of it failed one: `ast_equiv_batch` reads its two sides as **file paths**, not as
content, and reports `{verdict: "equivalent"}` rather than a boolean. Handed strings and read
for `.equivalent`, it rescued **0 of 81** candidates and printed a clean, plausible table. Four
pairs the gate had *already named* as passing were run through it first; they came back FAIL,
which is the only reason the two bugs were found. **Reconstruct a gate against cases the gate
has already ruled on, before running it on cases it has not.**

### A stricter reconstruction is free only while it counts DIVERGENCES

The asymmetry above says a stricter reconstruction reporting **zero** needs no fidelity
argument, because zero under a stricter comparison is zero under the gate. That licence is
tied to the sign of what is being counted, and the two-sided ratchet asks a question on the
other side of it: *stale* asks whether a baseline entry now **matches**. A stricter
comparator produces **fewer** matches, so "no baseline entry came out EQUAL under my
reconstruction" does not give "no baseline entry passes under the gate" — the gate's oxfmt
normalization and `ast_equiv_batch` convert exactly the entries the reconstruction called
divergent.

The witness arrived in the same message as the claim: an instrument reporting `stale 0`
across four ratchets also reported 33 `huly` units DIFF where the ratchet holds 4, so it
was over-counting the divergent side by 29 — any of which could be a baseline entry that
passes. Confirming a **retire** from a strict EQUAL is sound and needs nothing further;
asserting **stale 0** from an absence of EQUALs is not. One instrument, two uses, one of
them free, and the free one is not the one that looks like a zero.


### An arm and a ratchet from different trees re-detect what was already retired

A ratchet is a measurement of a tree, which is why re-baselining before a rebase enrols
entries that already pass. The same fact has a second, quieter failure on the **reading**
side: run a new arm's binary against an **older tree's** ratchet file and the pair reports
entries as stale that a merged fix already retired. Measured in one command — a local
already-passes check run from a worktree cut before a merge, with a NAPI arm built after
it, reported 2 where the correct answer was 1, and the extra entry was exactly the one the
intervening PR had retired.

Nothing about that output looks wrong: it is a plausible count, in the right direction, on
the right ratchet. The rule is that the arm and the ratchet are **two halves of one
measurement** and both are properties of a tree, so check out the arm's own tree before
running the comparison rather than reading the ratchet from wherever the shell happens to
be. And the control that catches it is the one worth copying: add a **known-retired** entry
back to the list and confirm the instrument names that entry and no other — an oracle whose
answer is already established independently, which is what separates "my instrument is
silent" from "my instrument is dead".


### `pipestatus` protects the verdict; nothing protects the denominator

The truncation table above is about reading a *verdict* through a stage that can drop it. There
is a second, independent hazard with the same shape: reading a *population* through one. A run
of `cargo test --lib --test a --test b …` for 64 targets printed 41 `running` lines, and the
`--lib` unit tests — 1,952 of them, the very targets that had been added because "a `--test`
list does not run the lib" — produced **no line at all**. `PIPESTATUS[0]` was cargo's and was
0, so the verdict was read correctly; the denominator was not read at all.

The generalisable half is about workarounds. **A workaround for a known trap is itself a change
that has to be checked.** Knowing the trap and adding `--lib` does not entail that `--lib` ran;
the two feel like one event because they are one intention. The check is one line: look in the
output for a fingerprint only the workaround can produce — here, a four-digit `running` count.

### An enumerated concern gets one item crossed off and reads as answered

"That `loc` change reaches phase 3's comment decision **and** the source map, so 'only `parse()`
output moves' is an assumption until measured" — a two-item list. The answer came back as a
135,592-pair sweep with **0** differing, and the sweep hashed `js.code + css.code`. Generated
text carries the comment decision; **nothing in that hash carries the map**. The measurement
answered one of the two and was remembered as answering the concern.

It is not a memory failure, it is an output-format one: a result of "0" has the same shape as
an answer to the whole question, and an unmeasured mechanism prints as nothing at all. **Carry
an enumerated concern as columns, one per mechanism, and print `UNMEASURED` where there is no
carrier** — a blank and a zero are indistinguishable, and only one of them is a result.

### A classifier that stops at the first matching predicate puts its own source order in the key

A ratchet key derived by classification inherits whatever decides the classification. A rule
that walks a table of rewrites and returns the first one that suffices assigns a label by the
order the table was written, so **reordering the table relabels the ratchet** — and two
divergences of the same mechanism land in different buckets depending on which predicate was
added first. It showed up as 2 rows of a known union-ordering class sitting inside a generic
label, invisible because the generic predicate came first. Collect **every** individually
sufficient predicate; one hit is that label, two or more is an explicit `multiple`. Then the
table can be sorted without moving a single entry.

### A port that answers "is this an each-block binding" by name answers a different question

Upstream's `build_bind_this` passes each-context variables into the getter and setter, and its
test is `owner.type === 'EachBlock' && scope === binding.scope` — a question about the
binding's **scope**. rsvelte matched the identifier's **name** against the block's item, index
and destructured names. The two agree on every shape anyone thinks to write down and part
company on `{@const}`: a const declared in an each body is declared in that block's scope, so
upstream passes it, and passes it even when its initializer mentions no each variable at all
(`{@const k = 7}`). A grid of 12 bind targets isolates it — 7 agree, 5 diverge, and 4 of the 5
are a `{@const}`, the fifth an each index inside a template literal, which the hand-written
walker had no arm for. Both are the same defect: **a name test needs an enumeration and a scope
test does not**, so every shape the enumerator's author did not think of is a silent miss.

### A success test with no denominator in it reads "nothing yet" as "went well"

Three instruments, two people, one afternoon. Each test is *correct* on a non-empty input, which
is why none of them looks wrong when you re-read it:

| the test | what was empty | what it reported |
|---|---|---|
| `pending == 0` over `statusCheckRollup` | a PR pushed to seconds earlier had **0** checks registered | `ALL GREEN` |
| `pgrep -f "cargo build"` in a wait loop | cargo had not launched — the command starts with `git checkout` | fell straight through and staged the **previous** build as the base arm |
| two output hashes compared | both compilers threw, so both hashes were the same *error* hash | `match`, and `MOVED = 0` |

The defect is not truncation and not a wrong comparison: the criterion never asks how many things
it looked at. The three repairs are one repair in three spellings — require `total > 25` beside
`pending == 0`; wait on the build's own `Finished` line rather than on a process being visible;
print `live-units / dead-units / total` and refuse to score a dead unit as agreement. The
superseded-run hazard above (`group_by(.name) | max_by(.startedAt)`) is the same shape once more,
with "runs per check name" as the denominator.

**A fabricated zero contains nothing that tells you to look again; an honest blank does.** One
missing esbuild type-strip produced `ORACLE-THREW` on one instrument and `MOVED = 0` on the other
— same defect, and only the first is recoverable. Prefer an instrument that can say `UNMEASURED`
over one that folds an unmeasurable unit into agreement.

### The cell that kills an explanation is usually the one that PASSES

A grid assembled from the cells a defect breaks cannot narrow to one cause, because every
candidate cause predicts those cells. It is the cells a candidate says should be **green** that
discriminate. Measured against one defect — `AssignSites` reporting a constant column for a
computed-key assignment chain — three named candidates, all consistent with the symptom:

| candidate | killed by |
|---|---|
| ordered consumption of same-shaped sites is broken | `const r = (o.a = {}); const s = (o.a = {});` — byte-identical text twice — is **EQ** |
| a conjunction of key-collapse and nesting | `computed depth=2` (no inner rewrite at all) is DIFF and `static depth=5` is **EQ** |
| `location()`'s `static_path` is `None` for a computed key, so `take` misses and `unwrap_or_else` falls back | nothing in the grid — see below |

**The third could not be killed by any cell**, because the fallback and the real cause — the site
list is rebuilt each `rewrite_batched` pass, so pass 2 hands out site 0 again — *both* predict a
constant column. Two mechanisms with one observable are not separable by adding inputs; only
reading the inside separates them. Widening a grid and instrumenting are not substitutes with
different costs, they have different preconditions.

This is the same hole as "a grid of failing cells cannot regress", seen from its other exit: there
you lose regression detection, here you lose hypothesis discrimination.

And the procedural half, which cost a build: **to show a branch was NOT reached you must first
arrange a line that prints when it IS.** Instrumenting `take` and its `used` transitions cannot
distinguish "fell into the fallback" from "the predicate was false" — in both cases nothing
happens inside `take`. Silence is also what instrumentation that never compiled looks like.

### A true observation counted as an independent fault

Two people made the same leap on the same defect inside an hour, and both started from something
that was **correct**:

| observation (true) | inference (false) |
|---|---|
| the reported column never advances | therefore this path never reads the site list |
| the site list is rebuilt every rewrite pass | therefore consumption state must be carried across passes |

Neither implication holds. A path can read the list correctly and still return a constant if it
restarts; a rebuilt list is harmless as long as each pass rescans the source in the order the walk
consumes it. The cause was one thing — the walk is post-order (`walk::walk_assignment_expression`
runs first), so in a chain the visit order is the reverse of the source order the site list is in
— and reserving the site on the way *down* fixed every depth from 2 to 5. The second "fault"
evaporated, and the fix for it would have been a change with no cell able to ablate it.

This sits one step short of "a plausible mechanism is not the cause" and is worse in one way: a
false observation dies under a check, a true one does not. Ask what an observation **entails**,
separately from whether it is true — and write the entailment down as a prediction, because that
is what makes the extra fix falsifiable instead of prudent.

Upstream has no counterpart to that state at all — it reads `locate_node(left)` off the node — so
"does the port have every condition upstream has" cannot find this class. rsvelte introduced an
ordering dependency upstream does not have and got its direction wrong; `build_bind_this`'s `seen`
is the mirror image, where upstream has the ordering and the port dropped it.

### Nothing is always spelled as something, and the two ends of a measurement spell it differently

The truncation table records tools that manufacture a datum — `|| echo 0`, a `comm` against an
empty set, a JSON-stringified options bag the API ignores. The reporting end has the same
failure and a different spelling. Collected on one day:

| where the emptiness is | what it looks like instead |
|---|---|
| a mechanism nobody measured | a row that is simply not printed, beside rows that read `0` |
| a gate stage the reconstruction lacks | the verdict that stage would have overturned (`MISMATCH`) |
| a workflow run that never started | no check line at all, which reads as "not required here" |
| a job still waiting on `needs:` | **nothing** — it is not a check-run yet, so it is absent from `pending` as well as from `total_count`, and a poller reading `pending == 0` calls the run finished |
| a cancelled shard under a rollup | `FAILURE`, indistinguishable from a real regression |
| a query whose key silently matches nothing | `total_count=0`, a well-formed answer to a question the API never asked — an **abbreviated** commit SHA passed to `?head_sha=` matches no run, and the full SHA returns 10 |

Two of these fake a **value** and two fake a **verdict**, and that is the useful split: a faked
value is caught by printing the carrier beside the number (`mechanism | carrier | result`, with
`UNMEASURED` where there is no carrier), a faked verdict only by asking what produced it.

**And a measured zero has two kinds that print identically.** "I looked and found none" is a
statement about the population; "my instrument cannot represent that shape" is a statement about
the instrument. Measured on one sweep: a fingerprint for a whitespace-only difference returned 0
against a sub-population built from *line-break* entries — not because the shape is absent there
but because the classifier routes it to a different label before that sub-population is formed,
so the count could not have been anything else. Reported as "the width key and this mechanism are
different spaces", it would read as a result about the compiler. Before writing a zero down, ask
whether the instrument could have produced a non-zero on that input at all; if the answer comes
from reading the classifier's branches rather than from the data, the zero belongs in a sentence
about the instrument.

### Report a measurement as `mechanism | carrier | population | result`, and the mistakes cannot hide

Three failures of the same family landed in one afternoon, and each one is a different column
of that row going unwritten:

| what was measured | what the question was | the column that was blank |
|---|---|---|
| the ratchet — the ids that fail today | did anything that passes today break | **population** (the set is the complement of the question's) |
| `js.code + css.code` over 135,592 pairs | a `loc` change reaching phase 3 comments **and** the source map | **carrier** (nothing in that hash carries a map) |
| the corpus manifest, 33,898 components | 58 samples under `packages/svelte/tests/sourcemaps` | **population** (same mechanism, disjoint inputs) |
| `corpus_hash` over 104,439 units, `MOVED 0` | does the class-field `$state` fix move anything | **population** (`corpus_hash` walks `.svelte` only, and `compile_module` parses plain JS — all 923 `.svelte.(js\|ts)` returned the *same* `js_parse_error` in both arms, which is the host the defect lives in) |

None of the three is visible as "measured / not measured", and all three produce a `0` that
reads as an answer. Writing the population out loud is what makes the first one self-evident —
"the ids that fail today" names its own unsuitability the moment it is a field rather than an
assumption. And a mechanism with no carrier must print `UNMEASURED` rather than an empty cell:
a blank and a zero are the same pixel.

**`n passed` is a complete output that answers a different question, which is worse than a
truncated one.** `cargo test --test sourcemaps_gate` reports `4 passed; 1 ignored`, and the
ignored one is the ratchet-regeneration helper while the gate itself is among the four — but
the same line would print if the arrangement were reversed. Nothing is missing from that output,
so re-reading it more carefully cannot help; only a different operation can — **read the names
of the tests that ran, not the count**, and where a suite prints its own denominators
(`770/770 official segments`, `0/1634 out of range`) run it with `--nocapture` so those appear.

**A verdict over a set must state the set's size, because an empty set satisfies every rule
written as "nothing failed".** A check-run monitor asked "is any run incomplete, is any run a
failure" and printed `COMPLETE seen=0 total_count=0 fail=0` for two different PRs — a green
sentence about a commit that has no checks at all. One of the two is not a transient: a
Changesets release PR is opened with `GITHUB_TOKEN`, which does not trigger `pull_request`
workflows, so **that PR structurally has zero check-runs and no gate has ever seen it**. The fix
is not an `if seen == 0` arm; it is that the reader must print the denominator and refuse to
conclude at zero, and must additionally assert `seen == total_count` — the check-runs API pages
at 30, so `total_count` and the length of what you received are two different numbers and only
the second is yours. Both halves have now produced a false green on this repository within one
day of each other.

**A gate can be written, unit-tested, self-tested and wired to nothing.**
`scripts/ci/attribution-check.mjs` owns the question "is every ratchet entry attributed", ships 8
passing controls under `pnpm run test:attribution-check`, and
`grep -rn 'attribution-check\|check:attribution' .github/workflows/` returns **0**. On the day
this was found, *both* people who had published a census of that question had built it by hand
from the `Attribution of` prose in `KNOWN-FAILURES.md` rather than by running the checker — one of
them in the same report that named that prose as ungated and rotting. The two hand-built censuses
agreed to within a difference that fully explains (16 = client 22→14 plus client-dev 36→28), and
**that agreement is not evidence the method is sound**: two readings of one document are one
measurement. Ask which artifact in the tree *owns* a question before answering it; "it is not in
CI" is a reason to run it locally, never a reason it is not the authority.

**An instrument can be dead on exactly the population that carries the defect, and it reports
that as agreement.** Row 4 above is not a missing column so much as a column filled in with a
number the instrument could not have produced any other value for: every unit of the carrying
host errored identically in both arms, so `MOVED 0` was arithmetically forced. The check is one
line and it is the same one as everywhere else here — **count the live units, not the compared
units**. Re-run through the gate's own preparation (here `compile.mjs`'s esbuild TS strip) and
the answer becomes `MOVED 2`, both of them the file the issue names. It is worth stating the
residue too: 110 of the 923 still fail to compile in both arms for reasons both compilers agree
on, so the module sweep's live population is 813 — a number that belongs in the report, because
"923 files swept" and "813 files could have moved" are different claims.

### An absent submodule appears only as a smaller denominator

`corpus-sources.json` lists 104 sources and a linked git worktree checks out **none** of
them. Measured the same day on two trees of one repository: the main checkout
`populated=104 EMPTY=0`, a campaign worktree `populated=1 EMPTY=103` — the one being
`compatibility/pattern-corpus`, which is checked in rather than a submodule. A sweep over
an empty submodule raises nothing: the files are not `ABSENT`, they are simply not
enumerated, so the run prints a smaller number and looks entirely normal. Three `MOVED`
results were reported that way and retracted.

The sharpening is that **the population field was written and still failed**. The figure
`7,142 files` was *true*; what it did not say is that 7,142 is 8 of 104 sources — a true
observation costing more than a false one would have, because a false one dies under a
check. So the printed field cannot be the size of what you counted; it has to be **the
names of what you could not count**: one `EMPTY <path>` line per zero-file source, derived
from the manifest by set difference. Ninety-six such lines are unmissable. The number
7,142 is not.


### A SHA you did not resolve is an identifier you invented

`AGENTS.md` records that an arm's *label* lies — the file name, `buildInfo()`, the
artifact path, the branch. It does not record the cheaper failure one step earlier: the
identifier itself being typed rather than resolved. Watching PR #4191, the only thing in
hand was the 9-character `f8858d05d`; the loop was written with a full 40-character SHA
that had never been printed by anything:

```
written:  f8858d05dbeb64df9d15c9a5aebf1b5c34d92da5
actual:   f8858d05d0abcde3b42b718ae2375e69f2deb888
```

Nine characters agree, so re-reading the command shows nothing. This is the mirror of the
abbreviated-SHA row already here (`?head_sha=23e06723a` returns `total_count=0` while the
full SHA returns 10): that one is too short, this one is too long, and both name a commit
the API does not have.

What made it survivable was the shape of the predicate, not luck. `check-runs` on a
non-existent commit returns an empty list, so `[…|select(.status!="completed")]|length`
never reached `0` and the loop **hung** rather than reporting. Written the other way round
— `completed == total_count`, or `pending == 0` — the same fabricated SHA reads `0 == 0`
and prints a settled, zero-failure verdict for a commit that does not exist. So the rule
is two-part: **resolve the identifier into a variable at launch (`H=$(gh pr view … --jq
.headRefOid)`) and never retype it**, and **write the settle predicate so that an empty
population fails to satisfy it** — the same "a verdict over a set must state the set's
size" rule, applied to the identifier rather than to the rows.

### A range endpoint spelled as a symbolic ref is not an endpoint

`origin/main` is a name, and in this repository the thing it names moves without you: every
worktree shares one `.git`, so another session's `fetch` — or an integrator's merge — advances
it while your shell is idle. Two `git diff` invocations over what reads as the same range
therefore answered differently within minutes:

```
git diff --stat      9693010f2..origin/main -- compatibility/ crates/rsvelte_formatter/   → empty
git diff --name-only 9693010f2..origin/main -- compatibility/ crates/rsvelte_formatter/   → 5 files
```

Both were correct when they ran; `origin/main` had gone from `9c771271f` to `3a31d933b` in
between, and the five files were the reader's own, newly merged. **The symptom is two
measurements disagreeing, which invites declaring one of them wrong** — and that is what
happened: the first reading was retracted, and the retraction was the error.

This is the "an arm's label is not its identity" family with the moving part one level out. There
the *artifact* a name resolves to changes; here the *endpoint of a range* does, so the two runs
are not comparable even though the command text is identical. The fix is the same shape as the
one for a fabricated SHA above: resolve once, then use the value — `MAIN=$(git rev-parse
origin/main)` and `$MAIN` thereafter. A range whose ends are both immutable object names can be
re-run tomorrow and mean the same thing; one written against a ref cannot be re-run at all.

### An issue and a gate sharing a vocabulary is how a local defect gets attributed upstream

`upstream_issues/3385-svelte-loose-parse-crashes.md` reports two inputs on which official's
`parse(loose: true)` throws. The `parse-ast` gate has a source named `unclosed-element`, and the
issue's second input is `</div>` — an unclosed element by any ordinary reading — so the ratchet key
`loose:unclosed-element::RegularElement#span` reads as an instance of that upstream bug. Probed
against the oracle instead of read:

```
gate source                text                        official parse(modern, loose)
unclosed-element           "<div><b>x"                 OK, type=Root
unclosed-attribute-quote   "<div class=\"a>text</div>"  THROW  An impossible situation occurred
stray-closing-tag          "</div>"                    THROW  Cannot read properties of undefined
```

The gate's `unclosed-element` is a *different input* that official parses cleanly; the issue's
`</div>` lives under the gate's `stray-closing-tag`, a both-reject control that is not in the
ratchet at all. One of the two candidate keys was upstream's and the other was rsvelte's own.

The direction of this error is the bad one. Attributing a local defect to upstream removes it from
the burndown **and** stops anyone looking at it, and the citation never 404s because the report is
real — it is the "a live but wrong citation" shape with the wrongness in the *match*, not the path.
What separates the two cases is not more reading: both keys name a shape the report describes.
Only the oracle, given the gate's own input text, tells them apart. So when an `upstream_issues/`
report is proposed as a ratchet entry's target, **run the entry's own input through the oracle and
paste the output** — which is what §6 already requires and what a name-level match invites you to
skip.

### A collapse ratio says how big the population is, not which way its entries point

`parse-ast`'s 301 ratchet keys reduce to 163 defect bases (1.85x), and the reduction is
readable straight off the keys. That number was then used to size the work, which is one
question it can answer and one it cannot. Measured on the LSP gate's `differential:initialize`
cluster: **10 entries, 10 distinct field paths, ratio exactly 1.00** — the cleanest resolution
in the whole 23,746-entry ratchet, and therefore the first row anyone would pick up. Read
against both servers, the ten split:

| terminal state | n |
|---|---|
| rsvelte defect, closes by fixing | **0** |
| upstream's own artifact (matching it would reproduce a bug) | 1 (official lists `@` twice) |
| deliberate: rsvelte advertises something it implements | 5 |
| **not deliberate: the capability is unimplemented** | 2 |
| needs a product decision | 2 mechanisms |

So a 1.00 ratio bought a correct count of *distinct* divergences and said nothing about how
many are ours to close — **none of the ten**. The first reading of this table said one, a
`space` trigger character that upstream omits with a comment explaining why. That comment is
upstream's justification for upstream's product decision, not an assessment of rsvelte's; and
`completions.rs:811` pins rsvelte returning `class` for `"<div "`, so removing `" "` from the
trigger list would make a behaviour the tree already tests unreachable from a real client.
Reading the oracle's comment and classifying before probing one's own implementation is the
mirror of "a refusal justified by a comment is a place to probe the oracle" — here the comment
was believed about the *wrong* side.

The hole was not one person's. The gate's own limits table had a column for
`entries per defect` and none for `how many of those are ours`, and the row was picked for
work *because* its resolution was best — so the selection criterion and the analysis shared
the missing column, and two people reached the same wrong expectation independently. When a
table of limits is used to choose what to work on, read it for the column that is not there.

**And the evidence for such a split does not have to be an execution.** The claim "the two
servers actually answer differently, and here is which value sits on which side" looks like it
needs both servers built and run — which was refused here on 24 GiB of disk with a 20 GiB
floor. The ratchet stores no values, only `count=` and a 12-hex `digest()`; but re-implementing
that digest and feeding it the value sets read out of each side's *source* reproduced six
committed hashes exactly (`" "`, `"@"`, two code-action kinds, ten commands, and official's
13-type / 6-modifier semantic-token legends). Six independent 48-bit agreements identify which
value sits on which side, which a run does not: a run says the two differ. A gate that stores a
digest is not storing less evidence than one that stores values — it is storing evidence that
can only be produced by someone who already knows the answer. The reason `parse-ast` felt different is a control it
happens to have: running the same comparator with the **official** compiler on both sides
returns 0 keys, which is what licenses "every listed key is attributable to rsvelte's side."
The LSP gate has no such self-compare, so its keys carry resolution and no direction.

The second half is the one that costs a wrong terminal state. Two of the ten are capabilities
rsvelte does not implement (`codeAction/resolve`, ten of official's eleven commands). Filing
those as deliberate divergences and pinning them would assert *we choose not to close this*
where the truth is *we have not built this* — the identical shape gate 42's own section
records for `completions.emmet`, where pinning would freeze a product that declares a feature
on while nothing implements it. **Before a cluster goes to `deliberate-divergences`, ask of
each entry whether the behaviour exists**; the ones that do not stay listed and are described
as unimplemented, which is the DoD working rather than failing.

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
| Parser Legacy | 82/82 |
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
The ratchet is **empty** as of 2026-08-30: all 770 official segments are reproduced and no
segment points outside its source. Regenerate the baseline with
`UPDATE_SOURCEMAP_RATCHET=1 cargo test -p rsvelte_core --test sourcemaps_gate -- --ignored
sourcemap_gate_measure`.

**The last two entries were one symptom over four defects, and two of them were hiding behind
the other two.** Upstream anchors a keyword with `write_source_keyword` — `location(column)`,
write `kind + ' '`, `location(column + keyword.length)` — and pushes one segment per `Location`
with no collapse. rsvelte had a rsvelte-only guard dropping the end anchor when it exceeded the
source line's length, a `push_mapping` that **overwrote** a mapping at a repeated generated
position, keyword writers that mapped builder-made nodes upstream skips on `node.loc`, and — in
the **server**, whose map is not built by esrap at all but by a text token scan in
`3_transform/mod.rs` — an end anchor at `column + 3` for the token `let` rather than
`column + 4` for the fragment `let `. Removing the collapse alone takes the gate from 2 wrong to
13, and twelve of those thirteen are the synthesized-node anchors it had been repairing:
**a "last write wins" rule is not a normalization, it is a repair that hides what it repaired.**
And the two halves are two ports of one upstream function that no gate compares to each other
(`two-ports-inventory.md` row 17) — only one of the 29 sourcemaps samples has a `let` alone on
its source line, which is the entire reason either half was visible.

### Formatter parity corpus (svelte.dev)

Asserts rsvelte formats real svelte.dev sources byte-for-byte like an **oxfmt(`svelte: true`)**
oracle (`prettier-plugin-svelte` for Svelte structure, oxc for embedded JS, and PostCSS for
embedded CSS). Oracle outputs are precomputed by
`pnpm run generate-fmt-corpus` (gitignored, CI-cached by svelte.dev SHA). Stage 1+2
(`crates/rsvelte_formatter/tests/svelte_dev_corpus.rs`) covers every `.svelte` file and
` ```svelte ` markdown block; Stage 3 (`crates/rsvelte_fmt/tests/svelte_dev_markdown.rs`) runs
the real `rsvelte-fmt` CLI on whole `.md` files. Both need a runnable `oxfmt` and no-op when
absent. **Hard gate, no baseline tolerance:** any divergence fails CI.

`rsvelte-fmt` formats CSS in-process via the Rust `oxc_formatter_css` crate — for embedded
`<style>` blocks, standalone `.css`/`.scss`/`.less` files, and the wasm formatter. This is the
engine `oxfmt` uses for standalone CSS, but it is **not** the PostCSS path used by the
`svelte: true` oracle for embedded styles. `--no-native-css` reverts to the legacy
`oxfmt`-subprocess path; the Rust svelte.dev gate exercises that non-default standalone path.
The large `scripts/compat-corpus/fmt.mjs` gate intentionally keeps native CSS enabled, so its
ratchet includes CSS-engine differences. `css_native.rs` and the CLI tests are small literal
behavior tests, not an oracle-parity replacement.

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
