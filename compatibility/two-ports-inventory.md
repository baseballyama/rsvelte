# One upstream decision, N rsvelte implementations

A companion to [`gate-coverage.md`](gate-coverage.md). That document is indexed by **gate** and
asks what each gate does not look at. This one is indexed by **decision** and asks a question no
gate here is shaped to ask:

> The official compiler answers this question in one function. How many times does rsvelte
> answer it, which inputs reach which answer, and **is there anything that compares the answers
> to each other?**

Every gate in this repository compares rsvelte to *upstream* on some population. None compares
rsvelte to *itself*. So when one upstream function is ported twice, the second port is only ever
exercised on whatever inputs a real file happens to supply, and a shape that separates the two
has to be published before anyone sees it. That is the mechanism behind #3027, and on
**2026-08-22 four more instances were reported on the same day by four different people working
in four different files** — #3403 (CSS matching), #3427 (CSS pruning across phases), #3472
(console-argument shape), #3569 (`has_call`'s writers). This file exists because that is a
recurring class and not a coincidence.

## How to read a row

Each row carries an **evidence grade**, and the grades are not interchangeable:

| grade | means | what it takes |
|---|---|---|
| **[S]** structural | two implementations of one decision exist | file:line citations for each |
| **[D]** demonstrated | the two provably answer differently | the differing code **and a named input** |
| **[M]** measured | both were run and compared on real inputs | a harness, a denominator, a result |

The letters extend [`gate-coverage.md`](gate-coverage.md)'s vocabulary rather than
competing with it: **[S]** is its structural argument from code and **[D]** is its
discriminating case, one level down (the case discriminates two *ports* instead of a gate's
green from a correct gate's red). **[M]** has no counterpart there, because that file's rows
describe what a gate cannot see and this file's rows describe something nobody has run.

**"There are two ports" and "the two disagree" are separate claims** — the first is an argument
from code, the second needs an input. Do not soften an [S] into a [D] because a divergence looks
likely; write `未測定` for the divergence and leave the row at [S]. An unsupported claim here is
worse than a blank, because the next person reads the row as surveyed.

**No row below is [M], and that is the finding rather than an omission.** Nothing in this tree
runs two ports of one decision against each other and compares the results — with exactly one
exception, § *The one place this is already defended*, which is the template for closing a row.

Grading a row [D] from code alone is deliberate and it is weaker than it looks: it says the two
functions *would* answer differently on that input, not that the input is reachable through the
compiler's own routing. **Reachability is a separate question from correctness** — several rows
below name an input whose reachability is untested, and they say so.

## The one place this is already defended

`expression_has_reactive_state` (`3_transform/client/visitors/shared/utils.rs:5063`), its typed
front end `typed_has_reactive_state` (`:5486`) and the JSON walk `has_reactive_state_json`
(`:5654`) are three implementations of one decision — and a test runs two of them on the same
input and compares:

```rust
fn both_has_reactive_state(expr_src: &str) -> (bool, bool) { … }

#[test]
fn typed_reactive_state_front_end_agrees_with_the_json_walk() {
    // (expression, expected answer) — expectations are spelled out as well
    // as compared, so a front end that always says `false` can't pass by
    // agreeing with an equally broken oracle.
```

Two properties make it worth copying rather than admiring. It compares the **ports to each
other**, which no gate does. And it **also pins the expected answer independently**, so the test
cannot pass by having both ports be broken in the same direction — the failure mode that a
port-vs-port comparison has and an upstream-vs-rsvelte comparison does not. A differential test
whose oracle is the other implementation is only as good as its independent expectations.

## Inventory

| # | decision | ports | grade | closed? |
|---|---|---|---|---|
| [1](#1-which-estree-object-does-a-function-declaration-serialize-to--d) | Which ESTree object does a `function` declaration serialize to? | 4 | **[D]** | no |
| [2](#2-is-this-callee-a-rune-and-which-one--d) | Is this callee a rune, and which one? | 3 name tables (+ ≥7 lookup impls) | **[D]** | no |
| [3](#3-is-this-assignments-rhs-a-known-primitive--d) | Is this assignment's RHS a known primitive? | 3 | **[D]** | no |
| [4](#4-which-trailing-global-are-truncated-before-matching--d) | Which trailing `:global(...)` are truncated before matching? | 2 | **[D]** | no |
| [5](#5-is-this-fragment-standalone--d) | Is this fragment standalone? | 2 | **[D]** | no |
| [6](#6-is-this-byte-code-or-comment--string--template--regex--d) | Is this byte code, or comment / string / template / regex? | 2 predicates + ≥8 inline copies | **[D]** | no |
| [7](#7-does-this-element-match-this-selector--d-one-pair-closed) | Does this element match this selector? | 4 in phase 2 | **[D]** | #3403 fixed one pair |
| [8](#8-where-does-the-scoping-class-go-inside-a-compound--d-open-as-3402) | Where does the scoping class go inside a compound? | 2 | **[D]** | #3402 open |
| [9](#9-is-this-expressions-value-known--defined--d) | Is this expression's value known / defined? | ≥6 | **[D]** | no |
| [10](#10-which-line-and-column-is-byte-offset-n-on--d) | Which line and column is byte offset N on? | 4 tables | **[D]** | no |
| [11](#11-does-this-expression-contain-a-call--s) | Does this expression contain a call? | 4 | **[S]** | #3569 open |
| [12](#12-selector-unused-and-element-scoped-are-two-engines-over-two-element-models--s) | "Selector unused" vs "element scoped" | 2 engines, 2 element models | **[S]** | no |
| [13](#13-what-does-a-call-to-one-of-upstreams-globals-keypaths-evaluate-to--d-closed-by-degree-1) | What does a call to one of upstream's `globals` keypaths evaluate to? | 2 tables | **[D]** | closed by #3471 (degree 1) |
| [14](#14-what-options-does-the-public-parse-run-with--d) | What options does the public `parse()` run with? | 2 bindings | **[D]** | #3688 open |
| [15](#15-how-are-public-compile-options-validated--d) | How are public compile options validated? | 3 bindings | **[D]** | #3664 defended at degree 2 |

---

### 1. Which ESTree object does a `function` declaration serialize to? — [D]

**Upstream:** one `acorn.parse` (`phases/1-parse/acorn.js:25`). Position in the source cannot
change the shape of the node it produces.

**Ports.** `convert_function_declaration_as_node`
(`1_parse/read/expression.rs:8344`) has exactly two call sites, and only one of them is guarded:

- `:7502` — `convert_statement_for_program`, the path every `function` declaration inside a
  `<script>` takes. **Unguarded.**
- `:8508` — `convert_declaration_for_program_as_node`, the `export`ed path, guarded by
  `&& func_decl.params.rest.is_none()`, which falls through to the Value form
  `convert_declaration_for_program` (`:8578`) when a rest parameter is present.

**The disagreement is documented in the tree, by both sides.** The typed converter's own doc
comment says rest parameters are not emitted and that callers needing them must route through the
Value form; the guard that routes around it says the typed path "emits only `params.items`, so a
rest parameter would be dropped relative to the Value form — keep Raw in that case."

So `export function f(...a) {}` serializes with a `RestElement` in `params`
(`expression.rs:8622-8639`) and `function f(...a) {}` — the same source minus one keyword — does
not. Two further converters answer the same question: the expression-context arm (`:6202`, which
*does* emit the rest element) and the `export default` arm (`:7548`, which does not).

**Who reads it.** The serialized program is what `rsvelte_lint`'s JSON-walking rules and
svelte2tsx consume; codegen is unaffected. The blast radius is every rule that inspects a
function's parameters.

Closing this means one converter, not four — or, short of that, a test that serializes the same
body in all four positions and asserts the `params` arrays are equal.

### 2. Is this callee a rune, and which one? — [D]

**Upstream:** one `RUNES` array and one `is_rune` in `src/utils.js:437`, with `get_rune`
(`phases/scope.js:1433`) applying one shadowing rule. **18 names.**

**Ports — three tables, and only one of them is upstream's:**

| table | file | missing relative to upstream |
|---|---|---|
| phase 2 | `2_analyze/visitors/shared/function.rs:84` `is_rune` | — (all 18 present) |
| phase 3 client | `3_transform/client/visitors/expression_converter.rs:2141` `RUNES` | `$props.id`, `$bindable`, `$inspect.trace` |
| server | `3_transform/server/evaluate.rs:642` `is_rune` | `$inspect().with`, `$inspect.trace` |

**The two phase-3 tables are not subsets of each other**: the client has `$inspect().with` and
not `$bindable`; the server has `$bindable` and not `$inspect().with`. Only `$inspect.trace` is
missing from both.

Both non-conforming tables carry a comment asserting the equality they break — the server's says
"The full rune list (mirrors `is_rune` in utils.js)", the client's "This function mirrors the
official Svelte compiler's `get_rune`". **A comment claiming fidelity is not evidence of it**,
and here it marks the opposite twice.

Named inputs: `let id = $props.id();` — phase 2 classifies the callee as a rune, the client's
`get_rune_from_call` returns `None`. `$inspect.trace()` — phase 2 says rune, client and server
both say not-a-rune. Whether either shape reaches both sites in one compile is `未測定`.

Above the tables there are at least seven implementations of the *lookup* itself
(`call_expression.rs:21` / `:217`, `shared/utils.rs:733` / `:1171`, `class_body.rs:86`,
`expression_converter.rs:2168` / `:6222`), differing in their shadowing rules —
`class_body.rs:86` has none at all. Those are `未測定`; the table divergence above is not.

### 3. Is this assignment's RHS a known primitive? — [D]

**Upstream:** `Evaluation.is_primitive` (`phases/scope.js:242`), read once, at
`client/visitors/AssignmentExpression.js:180`.

**Ports — three, and one of them states the invariant the other two break:**

- `3_transform/client/assign_dev_ast.rs:56` `is_known_primitive` (oxc `Expression`) — has
  `ConditionalExpression`, `LogicalExpression` and `SequenceExpression` arms.
- `3_transform/client/visitors/expression_converter.rs:5129` `is_known_primitive_json` — has
  none of the three; falls to `_ => false`.
- same file `:5212` `is_known_primitive_jsnode` — likewise none.

The first one's doc comment reads:

> `scope.evaluate(right).is_primitive`, approximated by shape exactly as the template path's
> `is_known_primitive_json` does — **the two must agree or the same source would be wrapped on
> one path and not the other.**

They do not agree. On `obj.x = cond ? 1 : 2` the oxc path skips the dev-mode `$.assign` wrap and
both template paths emit it. **The invariant is written down, the violation is one `match` arm
away, and nothing runs the two functions on one input** — the whole class in a single row.

### 4. Which trailing `:global(...)` are truncated before matching? — [D]

**Upstream:** `css-prune.js:209` `truncate`, one function, one caller
(`get_relative_selectors:172`), which is the single entry point for every matching call in
`prune()`. When every relative selector is global, `findLastIndex` returns `-1` and it returns
the **empty** array.

**Ports — two, with opposite behaviour in exactly that case:**

| | file | all-global input | global predicate |
|---|---|---|---|
| phase 2 | `2_analyze/css_scoping.rs:1184` `truncate_globals` | `&[]` — matches upstream | `is_relative_selector_global:1024` |
| phase 3 | `3_transform/css.rs:2704` `truncate_trailing_globals` | **the input unchanged** | `relative_selector_is_outer_global:2674` |

Both doc-comment themselves as ports of `truncate`; the phase-3 one says so and then documents
its own deviation ("if every selector is global, returns the input unchanged"). On
`:global(.a) :global(.b)` phase 2 truncates to nothing and its callers bail; phase 3 keeps both
relatives and goes on to match `.b` against local elements.

Neither port implements upstream's third behaviour, the `:root…:has()` `.map()` at
`css-prune.js:220-231`. And in `3_transform/css.rs` truncation is **not on the path at all** for
five of the deciders `is_complex_selector_unused_impl` calls — upstream funnels all of them
through `truncate`.

### 5. Is this fragment standalone? — [D]

**Upstream:** `phases/3-transform/utils.js:126` `clean_nodes`, imported by all four visitors —
client `Fragment`, client `RegularElement`, server `Fragment`, server `RegularElement`.

**Ports.** rsvelte's `clean_node_list` (`3_transform/utils.rs:672`) is client-only: every
`clean_nodes` occurrence under `3_transform/server/` is a **comment referring to upstream**, not
a call. The server answers the same question in `3_transform/server/ast/mod.rs:636`
`is_standalone_fragment`, and it differs in two fields:

| | upstream / client | server |
|---|---|---|
| comments | dropped only when `!preserve_comments` (`utils.rs:706`) | `TemplateNode::Comment(_) => false`, **unconditional** (`mod.rs:655`) |
| `DebugTag` | hoisted (`utils.js:157`, `utils.rs:713`) | **absent from the hoist list**, so `_ => true` counts it as a meaningful sibling |

Named inputs: `{#if x}<!-- c --><Foo />{/if}` with `preserveComments: true` — client not
standalone, server standalone. `{#if x}{@debug y}<Foo />{/if}` — client standalone, server not.
Which output each produces for those inputs is `未測定`; the branch difference is not.

This is adjacent to #3376, where a `{@debug}` with no identifiers left a fragment static on the
client. `DebugTag` is a node two independent lists must both remember to name, and one of them
has already forgotten once.

### 6. Is this byte code, or comment / string / template / regex? — [D]

**Upstream:** n/a. Upstream never re-scans raw text; this is a consequence of rsvelte's
text-rewriting pipeline and the reason AGENTS.md carries three separate rows about it.

**Ports.** `3_transform/shared/js_scan.rs:146` `skip_opaque` is one shared predicate with ~30
callers, `class_body::find_class_header` among them — that is a shared helper, **not** an
instance, and it is the shape the other copies should be folded into.

The instance is that **the phase-2 `$`-reference scanner does not use it**.
`2_analyze/store_subscriptions.rs:971` `collect_dollar_identifiers_pass` carries its own
`&[char]` state machine with `in_string`, `in_line_comment`, `in_block_comment`,
`template_stack` and `class_bodies` — and **no regex-literal branch at all**. Measured as a grep
carrying its own positive control in the same invocation: `js_scan.rs` names `regex` 20+ times,
`store_subscriptions.rs` names it **0** times.

Named input: `const r = /\$foo/;` — `js_scan` treats `$foo` as non-code, the store scanner
records it as a store reference. This is the shape of **#2988**, which was fixed by routing the
module rune loop through `js_scan::find_code`; the phase-2 scan answers the same question and
never received that fix. It has already been patched once for a *different* missing case (#3127,
class bodies), which is what an unshared predicate costs: each gap has to be found separately.

`store_subscriptions.rs:1236` `class_body_open` is a third answer to "where does a class body
start", independent of both `skip_opaque` and `find_class_header`, and
`3_transform/server/transform_store.rs` and `server/helpers.rs` carry at least eight more inline
`in_string` / `in_comment` machines. Their input ranges are `undetermined`.

### 7. Does this element match this selector? — [D], one pair closed

**Upstream:** `css-prune.js:243` `apply_selector` + `:291` `apply_combinator` + `:436`
`relative_selector_might_apply_to_node`. One implementation, called for every
`(element, selector)` pair.

**Ports — four, in `2_analyze/css_scoping.rs`, partitioned by *filters* rather than by design:**

1. `GMatcher::apply_selector` (`:3220`) — graph-based, faithful. Reached **only** by selectors
   passing `has_sibling_combinator || selector_contains_has || selector_contains_complex_not`
   (`:3629`). A plain `div .a` never reaches it.
2. `complex_selector_matches_element` (`:1699`) → `element_matches_simple_selectors` (`:1097`) —
   element-walking. Reached by everything **except** `:has()` (`:1461`).
3. `static_relative_might_apply` (`:3525`) — a simplified third copy for exactly-two-part sibling
   selectors.
4. `element_is_ancestor_in_matching_selector` (`:1870`) — a fourth, for the ancestor pass;
   upstream has no separate function, it marks ancestors inside `apply_selector`.

**The two filters are not complements**, so a selector with a sibling combinator runs through
both #1 and #2 and the results are OR-ed. And #2 returns `false` outright for `+`/`~` (`:1855`),
deferring to #1 — so #1's filter is load-bearing for #2's correctness.

**#3403 is the demonstrated divergence** and is fixed (PR #3581): #1 truncates globals and falls
back to "assume a match" for a multi-part `:is()` argument, while #2 tested the argument's last
compound. Ports 3 and 4 bottom out in #2 and inherited its answer. The remaining pairs are
`未測定`.

### 8. Where does the scoping class go inside a compound? — [D], open as #3402

**Upstream:** `phases/3-transform/css/index.js:336-365` — **one** loop walking the compound
backwards, emitting the modifier once and `break`ing.

**Ports — two, in `3_transform/css.rs`:**

- `transform_complex_selector` (`:6696`) — iterates **forwards**, with a `*` arm at `:7166` that
  is **positionally unconditional**, plus a second modifier emission at `:7229` gated on the last
  non-pseudo index. Handles every compound **outside** a functional pseudo-class.
- `transform_is_not_complex_selector` (`:7636`), reached from
  `format_simple_selector_with_scope:7393` → `transform_is_not_args:7559` — its `*` arm at
  `:7805` **is** guarded by `Some(idx) == last_non_pseudo_idx`. Handles the `:is()` / `:where()`
  / `:has()` / `:not()` interior.

#3402 measures the consequence: `*.a` prints as `.svelte-X.a:where(.svelte-X)` (the modifier
twice) while `:is(*.a)` prints correctly. **The issue's own control list is the two-ports
signature** — "the identical compound inside `:is()` is handled correctly" means one of the two
ports is already right, and names which one.

### 9. Is this expression's value known / defined? — [D]

**Upstream:** one `Scope#evaluate` returning one `Evaluation` object (`phases/scope.js:198`),
whose `is_known` / `is_defined` / `is_primitive` fields are read at a handful of sites.

**Ports.** #3027 already split this once — the client fold now goes through the server's
`EvalValue` — but the *neighbouring* predicates did not follow:

- `3_transform/server/evaluate.rs:37` `EvalValue` — a real abstract-value lattice, server only.
- `client/visitors/shared/utils.rs:6734` `is_expression_known_json` — a JSON walk with binding
  resolution.
- same file `:6656` `is_initial_value_literal_or_known` — answers by
  `memchr::memmem::find(s.as_bytes(), b"Literal")` over `binding.initial`, a string that may hold
  **either** serialized AST JSON **or** raw source text. So `let x = "a Literal string"` is
  "known", and any JSON containing a nested `Literal` anywhere — `f(1)` — is too, while
  `is_expression_known_json` reaches its call arm and says no.
- `client/visitors/title_element.rs:469` `is_known_defined_expr` — matches `Some("Literal")` and
  `Some("TemplateLiteral")` and nothing else, while `client/visitors/shared/utils.rs:4677`
  `is_expression_defined_json` resolves identifiers and unions conditional branches. On
  `{cond ? 'a' : 'b'}` the `<title>` path emits `?? ""` and the ordinary-text path does not;
  upstream answers both from one `evaluate` that handles `ConditionalExpression`
  (`scope.js:375`), so the `<title>` path is the deviant one.
- `client/visitors/regular_element.rs:2140` `is_value_known_defined` — a fifth, for
  `<option>` / `<select>`'s `node.__value`, with its own scope-root resolution and its own
  `JsExpr::Raw` string heuristic.
- `2_analyze/visitors/variable_declarator.rs:268` `is_expression_defined_typed` — a sixth, whose
  answer is frozen into `binding.initial_is_defined` at analyze time.

AGENTS.md already names three of these as "the next instalment" after #3027. The `<title>` and
`<option>` ports are not in that list.

The `globals` **table** underneath these predicates was a seventh port until #3471; it is
row [13](#13-what-does-a-call-to-one-of-upstreams-globals-keypaths-evaluate-to--d-closed-by-degree-1),
and it is the one instance in this file where the two ports were shown to render different text
from the same source.

### 10. Which line and column is byte offset N on? — [D]

**Upstream:** `state.js:57` — one `getLocator(source)` stored on `state.locator` and read
everywhere in the compiler. One table.

**Ports — four, in two crates:**

| | file | line terminators | column unit |
|---|---|---|---|
| T1 | `1_parse/mod.rs:197` `compute_line_offsets` | `\n` only | **bytes** |
| T2 | `rsvelte_lint/src/line_index.rs:50` | `\n`, `\r\n`, lone `\r` | **UTF-16** |
| T3 | `rsvelte_lint/src/line_index.rs:22` `js_line_starts` | T2 + U+2028 / U+2029 | UTF-16 |
| T4 | `rsvelte_lint/src/suppression.rs:215` `line_of` | `\n` only | n/a |

T2/T3 are the pair already reasoned about once: `LintDiagnostic::report_span` picks between them
per rule, with four upstream-measured verdicts pinned as a test. **T4 was not part of that.**
`runner.rs:295` filters a diagnostic whose line came from T2 or T3 against a suppression map
whose keys came from T4, and T4 does not split on a lone `\r`. Named input: a `\r`-delimited file
where an `eslint-disable-next-line` sits on T2's line 2 and T4's line 1 — the directive does not
suppress. `line_index.rs:203` tests T2 on exactly this shape; nothing compares it to T4.

T1 vs T2 is a **unit** difference rather than a terminator one, and the two meet in one output
array: `json_api.rs:120` emits byte columns for compiler warnings and `:141` emits UTF-16 columns
for native rules, into the same field. Any line with a non-ASCII character before the finding
gives two different columns for one offset.

Inside the parser, `get_line_column` (`read/expression.rs:6593`) and
`get_line_column_for_binding` (`:6605`) answer the same question about the same offset
differently by construction — the latter measures the column from the *previous* line's start
when that line is empty. Which one runs depends only on which `create_typed_loc*` the caller
picked.

### 11. Does this expression contain a call? — [S]

Filed as **#3569**; recorded here so the inventory is complete rather than restated.
`ast/template.rs` `set_has_call` has three reachable phase-2 writers. When the issue was filed,
phase 3 re-derived the same bit in the generic element walker twice — `json_contains_call` and
`walk_metadata_flags` (the latter additionally counted a `SpreadElement`) — and in
`shared/utils.rs` `expression_has_call`.

Upstream computes it once in phase 2 into `node.metadata.expression.has_call`; phase 3 only reads
it. Whether the reachable copies disagree on an input: `未測定` — see #3569.

Three phase-2 writes listed when #3569 was opened were structurally unreachable and were removed:
the `SpreadElement` and `TaggedTemplateExpression` arms in the typed script walker, and the typed
`CallExpression` visitor. `VisitorContext.expression` starts as `None`; the only site that installs
`Some` is the `{#if}` visitor, and it walks its condition through `walk_js_expression_node`, not the
typed script walker. This is a static reachability result, not an ablation result: deleting those
three writes cannot change output while that single producer and consumer remain disjoint. The
remaining phase-2 writers are the reachable call, object-spread and top-level-spread arms in the
template-expression walker.

The migration slices now attach and consume that Phase 2 metadata for `AttachTag`,
`SpreadAttribute`, `StyleDirective`, the expressions inside a regular `style=` attribute, and
every generic attribute-value chunk, generic event attribute and component CSS custom property.
The old generic attribute
`walk_metadata_flags` / `json_contains_call` implementations and the tests that only compared
those unused walkers were then removed. The component CSS-property migration also removed the
last production caller and definition of the shared `expression_has_call` helper, so Phase 3 no
longer independently answers this question for generic attribute values. The shared text
template-chunk builder now also reads `has_call` from each expression tag's Phase 2 metadata,
rather than calculating a fourth answer while lowering text content. `shared/events.rs` still
asks the broader "contains any call" question for `OnDirective`, so the inventory row remains
open for that separate path.

### 12. "Selector unused" and "element scoped" are two engines over two element models — [S]

**Upstream:** `css-prune.js:130` `prune()` sets `complex_selector.metadata.used` **and**
`element.metadata.scoped` from the **same** `apply_selector` call.
`3-transform/css/index.js` only *reads* `metadata.used`; it contains no matching logic.

**Ports.** rsvelte splits the two:

- `2_analyze/css_scoping.rs:1331` `mark_elements_scoped` produces `metadata.scoped`, over an
  `ElementInfo` / `SGraph` model.
- `3_transform/css.rs:1467` `is_complex_selector_unused_impl` produces the `used` bit at print
  time, over a *different* model (`CssDomElement` / `DomStructure`), through a cascade of ~10
  independent sub-deciders each with its own traversal.
- `2_analyze/css/prune.rs:11` `prune_css` is a **third**, name-set-only port whose result is
  discarded on the spot (`let _used = …`). #3574 proposes deleting it.

The structural claim is solid — two element models built by two passes and consumed by two
matcher families can only agree by coincidence, and each has a bail the other lacks. Whether they
**do** disagree on a real component is `未測定`, and it is the most expensive row here to measure,
because it needs both engines instrumented in one run. #3427 is the same shape one level over and
did produce a number, so it is measurable in principle.

---

### 13. What does a call to one of upstream's `globals` keypaths evaluate to? — [D], closed by degree 1

**Upstream:** one `globals` table in `phases/scope.js:26` — 46 keypaths, each `[type, fn?]`.
`scope.evaluate`'s `CallExpression` arm calls `fn(...args)` when every argument is known and adds
the `NUMBER` / `STRING` marker otherwise. One table, one arm, one set of JS semantics.

**Ports — two, and they disagreed on a value both computed:**

- `3_transform/server/evaluate.rs:487` `eval_global_call` — all 46 keypaths, JS semantics
  (`Math.round` as `(n + 0.5).floor()`, which is JS's half-**up**), returning a typed `EvalValue`.
- `client/visitors/shared/utils.rs`, `get_literal_value_complex`'s `CallExpression` arm — a
  private list of **eight** `Math` names (`max`/`min`/`floor`/`ceil`/`round`/`abs`/`sqrt`/`pow`),
  no `String`, no `Number`, no `Number.*`, no `String.*`, no shadow guard, no `SpreadElement`
  guard — and `Math.round` as Rust's `f64::round`, which rounds half **away from zero**.

**The discriminating input is one line**, and it needs no state at all:

```svelte
<b>{Math.round(-0.5)}</b>
```

The client inlined `b.textContent = '-1'`; the server inlined `<b>0</b>`; official is `0` on both.
So a single source rendered a different number depending on which port read it, in output that
parses cleanly and has no reactivity symptom. `Math.round(-1.5)` is the second instance (`-2` vs
`-1`). No gate saw it: the corpus compares each target to *upstream* independently, so a
client-only wrong value is one entry's client column and nothing cross-checks it against the
server column of the same entry.

**Reachability is not in question here** — unlike several rows above, the input is an ordinary
template expression and the client fold is on its default path.

The second-order cost was larger than the wrong value: because the client's table was private, it
was also *small*, so `String(n)`, `Number(n)`, `Math.sign(n)` and 30 more names silently lost the
`textContent` fast path (#3471, 61 divergent cells of 124 measured).

**Closed at degree 1:** the client's arm was deleted and now calls the server's table through
`eval_known_global_call`. There is no second answer left to compare, which is why this row is
recorded rather than tracked. What it does **not** buy: the surrounding predicates in row 9 are
untouched, and nothing new compares any two of *them*.

### 14. What options does the public `parse()` run with? — [D]

Filed as **#3688**; the divergence is one field today and the shape is why it is here.

**Upstream:** one answer, in `compiler/index.js` — `parse(source, { modern, loose } = {})` calls
`_parse(source, loose)` and `to_public_ast(source, ast, modern)`. There is no second construction
of the parse configuration anywhere in `svelte/compiler`.

**Ports.** rsvelte builds it independently in each binding:

- `crates/rsvelte_napi/src/lib.rs:201-217` sets `capture_comments: true`, with a comment
  asserting fidelity — *"The public AST API mirrors svelte/compiler `parse()`, which keeps
  `leadingComments`/`trailingComments` on nodes."*
- `crates/rsvelte_lint_bindings/src/compiler_wasm/mod.rs:87-89` takes `ParseOptions::default()`,
  which leaves `capture_comments` **false**, and accepts no options from its caller at all.

**The named input** is any component with a comment inside `<script>`: the NAPI AST carries the
node comments and the wasm AST does not. Graded **[D] from code** rather than **[M]** — the wasm
build was not executed, and a local `cargo` never builds the wasm features, which is part of why
this went unobserved.

**Nothing compares them.** The `parse()` AST parity gate (#3389) drives the NAPI port only; that
is gate-coverage **39g**. Corpus growth cannot reach the wasm port, because it is in no gate's
population. And the wasm build is what `@rsvelte/compiler` and the playground ship, so the port a
user installs is the unmeasured one.

### 15. How are public compile options validated? — [D]

**Upstream:** `packages/svelte/src/compiler/validate-options.js` owns one ordered schema for
`compile` and `compileModule`, including parametric values, removed-option errors and process-wide
legacy warnings.

**Ports.** The NAPI conversion in `crates/rsvelte_napi/src/lib.rs`, the C ABI JSON conversion in
`crates/rsvelte_capi/src/lib.rs`, and the wasm conversion in
`crates/rsvelte_lint_bindings/src/compiler_wasm/mod.rs` each implement that schema. #3664 recorded
demonstrated disagreements on unknown keys, wrong scalar types, nested keys, aliases, removed
options and truthy `runes` values.

**Defended at degree 2.** `scripts/dev/test-wasm-compile-options.mjs` now compares representative
rejections directly with official Svelte and pins the warning and parametric cases independently;
the C ABI suite spells the same exact messages and behaviours as independent expectations. The
ports remain separate because their value domains differ (JS callbacks versus JSON and native
callbacks), so this closes the demonstrated cells rather than removing the row. A new option or
validator kind still has to be added to all three ports and their boundary gates.

## Adding a row, and closing one

**Finding a candidate.** Start from *one upstream function*, not from a rsvelte symbol. Grep the
Svelte submodule for a function with several importers, then find rsvelte's answer(s) and check
whether the callers split into independent paths. A rsvelte-side grep finds duplicated *names*;
it does not find the case where the second port was given a different name, which is the case
that hides.

**Two warnings that cost time here.**

A negative grep is not evidence. `grep` in this shell is a ugrep wrapper that skips gitignored
paths, and `cargo fmt` wraps comments across lines, so a multi-word literal needle encodes a
formatting assumption. **Put a positive control in the same invocation as the real needle** — a
different invocation cannot rule out that something changed in between.

A helper with many callers is **not** an instance. `js_scan::skip_opaque` (~30 callers) and
`clean_nodes` / `clean_nodes_refs` (two signatures over one body) were both checked and dropped.
The instance is two *separate* code paths each carrying their own logic.

**Closing a row** has three degrees, in increasing order of what it buys:

1. Make one port call the other. Removes the row.
2. Keep both and add a port-vs-port test with **independently spelled expectations** — the
   `typed_reactive_state_front_end_agrees_with_the_json_walk` shape. This is the only pattern in
   the tree today that defends the class.
3. Assert the property at runtime under an env flag and let the corpus find the violations, the
   way `RSVELTE_ASSERT_TRANSFORM_IDEMPOTENT` does. A property gate is bounded neither by a
   collected population nor by an author's axis values — which is why it found 37,352 violations
   in a corpus that scored 0 output divergences.

Degree 3 is worth reaching for whenever the decision is cheap to recompute, because it turns the
corpus you already have into a detector for this class **at whatever size it happens to be**.
