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
| [16](#16-what-is-the-read-form-of-a-name-inside-an-invalidate_inner_signals-body--d) | What is the read form of a name inside an `$.invalidate_inner_signals` body? | 2 | **[D]** | no |
| [17](#17-does-an-assignment-lhss-computed-index-get-its-sites-read-transform--d-closed) | Does an assignment LHS's computed index get its site's read transform? | 2 (+3 `untrack` rebuilders) | **[D]** | closed |
| [18](#18-does-a-mutation-of-a-legacy_indirect_bindings-root-get-the-invalidate-wrap-at-all--d-closed) | Does a mutation of a `legacy_indirect_bindings` root get the invalidate wrap at all? | 4 | **[D]** | closed |
| [19](#19-where-does-a-keywords-source-map-anchor-go--d-defended-at-degree-2) | Where does a keyword's source-map anchor go? | 2 | **[D]** | defended at degree 2 |
| [20](#20-what-does-a--reactive-statement-assign--d-closed) | What does a `$:` reactive statement assign? | 2 | **[D]** | closed |
| [21](#21-does-this-write-target-resolve-to-the-components-binding-or-to-a-shadow--d) | Does this write target resolve to the component's binding, or to a shadow? | 44 rewrite passes, 8 scope-aware | **[D]** | 4 ports closed at degree 1 |

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

**A fourth pair is worth recording for the opposite reason: the two copies AGREED, and both were
wrong.** `client/class_transforms.rs` splits a class body into member blocks line by line, and
until 2026-08-29 both `parse_section_members` (`is_plain_field`, which excluded a line beginning
`//` or `/*`) and `rejoin_class_members` (which refused to terminate a block on the same two
prefixes) asked "is this line comment text" **per line**. So the continuation lines of anything
spanning lines were members of their own on both, and the two failure modes are different
depending on what spans:

- a multi-line `/* … */` leaves its opening `/**` on the block above, that block is an
  unterminated comment, `private_class_assign_ast` cannot parse it, and every rewrite it owns is
  skipped in silence — on sveltekit's `query/instance.svelte.js` the `??=` lowering of a private
  `$state.raw` field, emitting `$.get(this.#promise) ??= this.#run()`, which no JS parser accepts;
- a multi-line **template literal** parses fine and changes *value*: the member blocks are
  re-emitted with esrap's margins, so a blank line lands inside the string
  (`` `a ${1} b⏎⏎c ${2} d` `` where the source has one line break).

Both are fixed by routing the two through one cross-line predicate,
`js_scan::line_starts_outside_opaque`, which is built on the same `skip_opaque` this row names as
the shape the copies should fold into — so `class_transforms.rs` is now a *user* of that
predicate rather than a further copy of it. Measured over the 589 corpus sources holding both
`class` and a rune (293 compiled by both compilers): the comment half moved 40 files from
divergent to byte-identical on client and 1 on client-dev, and took the population's unparseable
outputs from 1 to 0; folding onto the shared predicate then moved 2 more on client-dev, 0 on
client, and 0 either way in the other direction.

The reusable part is the grade this pair would have earned. It is **[S]**, never [D]: no input
separates the two, because they answered the same question the same wrong way — which is
precisely the failure mode § *The one place this is already defended* names for a port-vs-port
oracle. **A row at [S] whose two ports provably agree is not a closed row**; it is a row whose
divergence test cannot exist, and only an independently pinned expectation (here: the official
compiler's output) can grade it.

One defect this uncovered is **not** in this file's scope and is recorded so it is not
rediscovered here: once a chunk containing a multi-line template literal reaches the in-place AST
rewrite, the reprint **re-indents the template's interior lines**, which is another silent value
change. It reproduces on a binary built before any of today's fixes, so it is pre-existing and
belongs to the printer rather than to the member scan.

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

**Two of these ports are closed as of 2026-08-29, and the divergence they carried ran in BOTH
directions — which is what makes the row worth re-reading rather than ticking off.** The
`?? ''` guard on a template hole, on `$.document.title` and on `option.value` is one upstream
decision, `scope.evaluate(value).is_defined`, read at three sites. rsvelte answered it with the
shared estree walk in some places and with `identifier_is_defined`, a hand-written table of
binding shapes, in others. The table admitted no function binding and no `$state` binding that is
never written, so `{fn}`, `{arrow}` and `<option value={n || 'a'}>` were guarded where upstream
leaves them bare; and `<title>` graded the **source** expression rather than the value it had
just built, so a legacy `$.untrack(…)` wrapper never made the chunk unknown and the guard was
omitted where upstream adds it. `identifier_is_defined` now delegates to `evaluate_binding_initial`
and `title_element` grades the built value, so both sites read the one walk; the walk itself
gained upstream's FUNCTION case, which no port had.

The measurement is the reason to state the directions separately. Over a 5,041-component
population (a deterministic 4,000-file sample of the 33,792 corpus components plus every one of
the 1,210 holding a `<title>`, `<option>` or `<select>`), the change moved **12 client outputs and
12 client-dev outputs and 0 server outputs**; graded against the official compiler, 11 of the 12
go divergent → byte-identical on each target and **none** move the other way, the twelfth
shrinking from 15 to 11 divergent lines with the residue in comment placement. A fix measured on
one direction's population would have scored a one-directional patch green.

**The `is_known` half of the same source-vs-built split closed on 2026-08-30, and its
population is disjoint from the `is_defined` one above.** `build_template_chunk` folds a chunk
whose evaluation is known, and upstream evaluates the value it BUILT
(`memoize(build_expression(...))`). In legacy mode `build_expression` wraps any chunk carrying a
call, a member expression or an assignment in `(deps…, $.untrack(() => value))`, and
`scope.evaluate` has no `SequenceExpression` case — so no such chunk is ever known, however
constant its **source** reads. rsvelte graded the source, so
`style="margin-bottom:{a.id === b ? '0px' : '0px'}"` folded to a constant and the write was
hoisted out of `$.template_effect`: the attribute freezes at its first-render value, the output
parses, and the client and the server agree with each other. `get_literal_value` now declines
where `build_expression` will wrap, which covers all three chunk builders
(`shared/utils.rs`, `shared/element.rs`, `title_element.rs`) in one place because they share it.

Two things worth keeping. The guard has to see the **repaired** metadata, not phase 2's raw
flags: rsvelte's directive paths drop `has_member_expression` / `has_assignment` and the sites
restore them before `build_expression` reads them, so a guard on the raw flags would let the
fold and the wrap disagree about one tree. And the measurement is small and one-directional —
over all 34,709 corpus sources × 3 targets (104,127 compiled units) exactly **6 (id, target)
pairs move, across 3 ids**, and every one moves toward official: `huly`'s `IconStarted.svelte`
goes divergent → byte-identical on client and client-dev, and the two `sparrow-app` files shrink
(53 → 25 and 101 → 87 diverging lines) with **100% of the residue in comment placement**, a
different defect. Zero server outputs move, which is the positive control for
`get_literal_value` being client-only.

Still open in this row: `is_expression_known_json`, `is_initial_value_literal_or_known` (the
`memmem::find(json, b"Literal")` one), `is_value_known_defined` and `is_expression_defined_typed`
— four `is_known` ports, untouched here, and `is_js_expr_defined` remains a structural second
walk over the built `JsExpr` whose leaves now call the shared one.

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

### 17. Does an assignment LHS's computed index get its site's read transform? — [D], closed

**Upstream** never asks. `Program.js:66-76`'s `replace()` rebuilds the member chain with
`property: n.property` untouched, because the `mutate` callback is handed a mutation the general
assignment transform has **already** visited — so by the time `replace()` sees it, the computed
key already reads `groupKey()`. The invariant is "the LHS is transformed before the store root is
swapped", and it lives in the call order, not in a function.

**Ports.** rsvelte does not have that ordering, so each assignment path has to re-decide it:

- `client/visitors/shared/utils.rs:1387` — has an `is_store_sub` arm calling
  `transform_computed_indices_only`, with a comment giving the exact expected output.
- `client/visitors/expression_converter.rs:5349` — had the `is_prop_binding` arm and **no**
  store-sub arm, falling through to `left.clone()`.

Three further functions rebuild the same `$.untrack($store)…` chain and each clones `property`
independently: `shared/component.rs::replace_store_with_untrack` (fixed separately), and
`replace_store_with_untracked` — which exists **twice**, in `shared/declarations.rs:458` and
`visitors/program.rs:401`, byte-identical apart from the doc comment and how the arena type is
spelled.

**Demonstrated**, on two different read forms in one file
(`pattern-corpus/issues/store-member-computed-key-in-event-handler.svelte`), against official
5.56.10:

| site | official | rsvelte, before |
|---|---|---|
| each-item key | `$.untrack($formData)[groupKey()] = e.detail` | `[groupKey]` |
| reassigned `let` key | `$.untrack($scrollTop)[$.get(lastHref)] = e.detail` | `[lastHref]` |

`client` and `client-dev` diverge; `server` and `server-dev` are byte-identical, which is what
localises it to the client assignment path rather than to the store lowering.

Found in the corpus as `appwrite-console/.../resource-form.svelte` and
`huly/packages/panel/src/components/Panel.svelte` — both were failing on `main` and neither was
in a ratchet, so **no gate was reporting them**; they surfaced only once the output ratchet's
unlisted set was enumerated.

**The reusable part** is that the two ports were not a copied table — one had been *fixed* and
the other had not, and nothing relates them. The comment at `utils.rs:1387` even spells out the
expected output, which reads as authority while the sibling path silently disagrees.

### 16. What is the read form of a name inside an `$.invalidate_inner_signals` body? — [D]

**Upstream:** one `build_getter(node, state)` (`3-transform/client/utils.js:33`), called once per
indirect binding from `AssignmentExpression.js:145-182`. It reads `state.transform[name].read`,
so the answer is a property of the **site** the body is emitted at, not of the binding.

**Ports.**

- `client/mod.rs` `prop_invalidate_bodies` — precomputes one body **string** per binding from a
  `BindingKind` table (`Prop`/`BindableProp` that is a prop source and `StoreSub` → `name()`;
  `State`/`RawState`/`Derived`/`LegacyReactive` → `$.get(name)`; otherwise bare). Consumed by the
  instance-script text pipeline and by `legacy_state_member_mutate_ast` /
  `prop_member_mutate_ast`, which splice it as text.
- `client/visitors/expression_converter.rs` `wrap_with_legacy_invalidate` — a second copy of that
  same table, for the template AST path.

**Demonstrated.** The kind table has no site, and a name's read form is not a function of its
kind alone: in `adventurelog`'s `LocationVisits.svelte`, `visit` is an instance-script function
parameter *and* an each item, so official emits bare `visit;` in `handleGpxFileChange` and
`$.get(visit);` inside the each block — from the same `legacy_indirect_bindings` list. The AST
port answered `visit` at both, because the table cannot see the each scope. It now consults
`context.state.transform` first and falls back to the table; the string port still has only the
table.

Two things the divergence was hiding, both found in the same file and both fixed:
`prop_source_reads_ast` walked **into** the spliced body and wrapped the prop read a second time
(`trails()` → `trails()()`), because the body arrives already in final read form and nothing said
so; and the legacy-state arm of a component `bind:` setter
(`visitors/shared/component.rs`, the `$.mutate(root, …)` branch) never called
`wrap_with_legacy_invalidate` at all, so `<Comp bind:tz={activityForm.tz} />` dropped the
invalidation the element arm emits. `compatibility/pattern-corpus/legacy-invalidate-inner-signals-site.svelte`
carries all three shapes.

**Not closed.** The string port cannot be made site-aware without a printer, and the AST port
cannot be made to produce the text the per-line pipeline splices. Closing this at degree 1 means
retiring the text splice — the client instance-script pipeline AGENTS.md already names as the
correctness hazard.

### 18. Does a mutation of a `legacy_indirect_bindings` root get the invalidate wrap at all? — [D], closed

**Upstream:** one test, `AssignmentExpression.js:165` — `if (binding.legacy_indirect_bindings.size
> 0)` wraps the mutation in `(mutation, $.invalidate_inner_signals(() => { … }))`. Row 16 asks what
goes *inside* that body; this row asks which rsvelte code paths ask the question at all.

**Ports.** Four, and they are reached by disjoint input shapes:

- `visitors/expression_converter.rs` `wrap_with_legacy_invalidate` — template AST path.
- `legacy_state_member_mutate_ast.rs:290,324` — instance-script state member mutation.
- `prop_member_mutate_ast.rs` — instance-script prop member mutation.
- `reactive_transforms.rs` — a `$:` body. This one had **no** wrap, on either of its two
  internal routes: the simple-assignment `format!` builders, and `state_member_mutate_ast.rs`,
  which is a second file with the same body as `legacy_state_member_mutate_ast.rs` and did not
  take the `invalidate_bodies` map.

**Demonstrated.** `<select bind:value={lodging.type}><option>{$t('hotel')}</option></select>` with
`$: lodging.tz = allDay ? null : 'x'`: official emits the sequence, rsvelte emitted
`$.mutate(lodging, $.get(lodging).tz = …)` alone. Reproduces on `adventurelog`'s
`LodgingDetails.svelte`, twice, at both of that file's `$:` routes.

**What made it hard to see is the shape of the first repro, not the defect.** The first minimal
file was a *prop* root mutated from a *function body* — a cell that reaches port 1, which already
wrapped. It went byte-identical on all four targets while the corpus file that motivated it still
diverged. Crossing the two axes (binding kind × the statement the write sits in) put the
discriminating cells on the table: the kind axis is flat, and every failing cell is a `$:`.
A repro going green is evidence about that repro, never about the cause.

**Closed at degree 1** for the `state_member_mutate_ast` route (it now takes the same map and
builds the same string as its twin) and by construction for the two `format!` builders, which call
one local helper. The two twin files remain — that is row 16's open half, not this one's.

### 19. Where does a keyword's source-map anchor go? — [D], defended at degree 2

**Upstream:** one `write_source_keyword(context, line, column, keyword)`
(`esrap/src/languages/ts/index.js:113`) — `location(line, column)`, write the fragment,
`location(line, column + keyword.length)`. The fragment a declaration passes it is
`node.kind + ' '`, so the end anchor counts the separator, and esrap's `run()`
(`esrap/src/index.js:139-146`) pushes one segment per `Location` command with no collapse.

**Ports.**

- `rsvelte_esrap` `Printer::write_keyword` / `KeywordCursor::write` — the client map. Every
  `Location` reaches `Driver::push_mapping` (`command.rs`).
- `3_transform/mod.rs` `generate_token_mappings_inner` — the **server** map. `print_split` runs
  the printer with `emit_locations: false`, so the server's anchors come from a text token scan
  that matches generated tokens back against the source, not from esrap at all.

**Demonstrated.** On upstream's `sourcemaps/attached-sourcemap` fixture, whose `let` is alone on
its source line, the two ports were wrong in different ways at the same instant: the client
emitted no end anchor (a rsvelte-only guard dropped it once `column + keyword.len()` exceeded the
source line's length), and the server emitted one at `column + 3` (it anchored the token `let`,
not the fragment `let `). Two further defects in the client port were invisible until the first
was fixed — `push_mapping` **overwrote** a mapping when the generated position repeated, and
`keyword_cursor` / `write_keyword` mapped builder-made nodes that upstream skips on `node.loc`,
so every synthesized `var root = …` anchored at offset 0 of the `.svelte` file. All four are
fixed; the gate went 768/770 → **770/770** with out-of-range unchanged at 0.

**Defended at degree 2, not closed.** The server does not print through esrap, so there is no
single implementation to route both through. What the tree now has is four independently-failing
pins with expectations spelled out rather than read off the other port:
`crates/rsvelte_esrap/tests/keyword_anchor_fidelity.rs` (three tests, each failing only under its
own ablation) and `crates/rsvelte_core/tests/server_declaration_keyword_anchor.rs`. Nothing
compares the two maps to each other, and only one of the 29 sourcemaps samples has a source line
that separates the two rules — which is why this row was worth writing rather than the fix alone.

### 20. What does a `$:` reactive statement assign? — [D], closed

**Upstream:** one visitor pair feeds one `order_reactive_statements`
(`phases/3-transform/client/visitors/shared/utils.js`). `AssignmentExpression.js` runs
`extract_identifiers(node.left)`, which keeps only `Identifier`s — so `$: o.x = 1` assigns
**nothing** — while `UpdateExpression.js` takes
`node.argument.type === 'MemberExpression' ? object(node.argument) : node.argument`, so
`$: o.x++` assigns **`o`**. The asymmetry is the whole decision, and the ordering DFS in
`order_reactive_statements` reads it.

**Ports.**

- `2_analyze/mod.rs` `CycleFacts::push_update_target` (`:1574`), feeding
  `order_reactive_statements` (`:3295`) — the client. It recurses through
  `JsNode::MemberExpression { object, .. }` to the root identifier, i.e. it has upstream's
  `object()`.
- `3_transform/server/ast/script.rs` `ReactiveScopedCollector::visit_update_expression`
  (`:4363`), feeding `topo_sort_reactive` (`:4189`) — the **server**. It matched
  `AssignmentTargetIdentifier` only, so a member-target update recorded no assignment at all.

**Demonstrated.** `compatibility/pattern-corpus/issues/reactive-member-assignment-cycle.svelte`
carries `$: data.count++`, `$: if (data.encrypt && size < 150) size = 150;` and
`$: data.size = size;`. Under the analyze port `data.count++` assigns `data`, so the DFS emits
the three in the order official does; under the server port it assigned nothing, the edge
disappeared and `data.count++` sank to last. **The client and client-dev outputs were
byte-identical to official throughout** — the same source, the same upstream rule, two answers,
and the divergence lived only on `server` / `server-dev`. That file has been on `main` since
#3958 and is in no ratchet: `Compiler parity` was red on `main`, so nothing scored it.

**Closed at degree 1 in spirit, not in code.** The server port now applies the same member-chain
root rule through a `update_target_root_name` helper that returns `None` for a chain rooted at a
call, mirroring `object()`. The two collectors still exist — the server walks oxc and the
analyzer walks `JsNode`, so there is no single function to route both through — and nothing
compares them to each other. The file above is the pin.
### 21. Does this write target resolve to the component's binding, or to a shadow? — [D]

**Upstream:** every write lowering reaches its binding through **one** `context.state.scope.get(name)`
— `build_assignment` (`3-transform/client/visitors/AssignmentExpression.js:120`) and
`validate_mutation` (`.../shared/utils.js:402`) both do, and a name that resolves to a nested
declaration returns a binding whose `kind` is `normal`, so nothing is rewritten.

**Ports.** rsvelte answers it once per rewrite pass. Of the 44 `*_ast.rs` passes under
`3_transform/client/`, **8** consulted `oxc_semantic` and 36 compared the identifier's **text**
against a `Vec<String>` of binding names. Four of the text ones were binding-keyed write
lowerings (the count is 12 / 32 after fixing them):

- `prop_member_mutate_ast.rs` — `prop.x = v` → `prop(prop().x = v, true)`
- `state_member_mutate_ast.rs` — `state.x = v` → `$.mutate(state, $.get(state).x = v)`, the
  reactive-body twin of `legacy_state_member_mutate_ast.rs`, which has resolved through
  `find_state_var_symbols` since it was written and carries
  `skips_parameter_shadow_but_rewrites_captured_state` as a test
- `state_set_reactive_ast.rs` — `state = v` → `$.set(state, v)`
- `reactive_update_ast.rs` — `x++` → `$.update(x)` / `$.update_prop(x)`

**Demonstrated.** `huly`'s `FilterTypePopup.svelte` writes `filter.group` inside
`for (const filter of filters)` where `filter` is also a prop, and `musicat`'s `AnalyticsView.svelte`
writes `stats.totalPlays` inside `songs.reduce((stats, song) => …)` where `stats` is also legacy
reactive state. Official emits the plain write in both; rsvelte emitted the setter call. The
second is the one that names the *pair* rather than one port: the identical source inside a
plain instance function was already correct, because that path runs the scope-aware twin.

**What made the reactive ports get it wrong** is worth keeping: a `$:` body is handed to its
transforms **without** the component-level declarations, so the state variable is an *unresolved*
name there. `is_locally_shadowed` — "resolves to a declaration below the root scope" — is the
predicate that is right for both input shapes: unresolved (fragment) and root-scope (whole
script) both mean "the component's binding", and only a shadow is below the root.

**These four now route the decision through one primitive** (`scope_analysis::is_locally_shadowed`,
with `shadowed_reference_starts` for the in-place rewriters, which cannot hold a `Semantic`). That
is degree 1 for the *shadow* question and not for the row: the instance twin
`legacy_state_member_mutate_ast` still answers through `find_state_var_symbols` /
`is_state_var_reference_or_unresolved`, a second primitive with a second rule, and nothing compares
the two.

**Four of the remaining text-keyed passes were probed and are clean**: a `$`-prefixed parameter
shadowing a store (`function bump($count) { $count = 1; $count++; $count.x = 1 }`, reaching
`store_assign_ast` / `store_update_ast` / `store_member_mutate_ast`) and a parameter shadowing a
rest-props binding (`function read(rest) { return rest.foo }`, `rest_prop_member_access_ast`)
both compile byte-identical to official. `state_eager_ast` and `state_raw_frozen_ast` are keyed
on the rune **call**, not on a binding name, so they are not instances of this row at all — an
earlier draft of this row listed them and was wrong.

**The same probe found a live one, which is why the row stays open.** A function-local
`let n = $state(5)` that IS reassigned, shadowing a top-level `let n = $state(0)` that is NOT,
compiles to

```js
let n = 0;
function make() { let n = 5; $.set(n, 6); return n; }   // official: $.state(5) / $.get(n)
```

— `$.set` on a plain number, so the output is broken at run time rather than merely different.
**Its reachability is 0 on the collected corpus**: 5,521 of 34,709 sources declare a `$state`, 16
declare one name twice, 13 of those are `.svelte.(js|ts)` modules (which run the module pipeline,
where the escape hatch below already exists) and the 3 real components all compile byte-identical
on all four targets. Correctness and reachability are separate questions; this row records both.
The classification is a `Vec<String>` of non-reactive **names** (`client/mod.rs:7094`), so the
top-level binding's "never reassigned" answer reaches the inner declaration and its reads, while
the write goes through a pass that resolves correctly. The module pipeline already has the escape
hatch for exactly this — `ambiguous_state_names` (`client/mod.rs:5429`) re-asks
`binding.reassigned` per symbol whenever one name carries two `$state` bindings that disagree, and
`state_call_ast::is_non_reactive` consumes it — while the component pipeline neither computes it
nor reaches that lowering, which makes the `$state(…)` lowering itself a second pair.

**A battery of ten shadow probes then measured what the gate cannot.** One input per binding kind
— a store, a store subscription, a rest prop, `$state.raw`, `$state.snapshot`, an arrow parameter
over a `$state`, a `$derived`, an each item, a prop called as a function, a `$`-prefixed local —
each shadowing the component's binding inside a nested scope, compared to official on all four
targets. **Nine of ten were already correct; the tenth was live.** Upstream's `EachBlock`
`assign` / `mutate` transforms set `uses_index` on the owning block, forcing the `$$index`
callback parameter even where nothing reads it, and they reach the item through `scope.get`;
rsvelte looked the root up in `each_item_name_flags` by NAME, at two sites (the typed and the JSON
assignment paths), so a handler declaring `let row = …` over the item emitted a `$$index`
parameter official does not. That divergence is **client-only** — the server emits no such
parameter — so a probe run on one target would have scored it clean.

Two things the battery is worth for beyond the one defect. **The nine passes are now a measured
`[D]`, not an assumption**: `store_assign_ast`, `store_update_ast`, `store_member_mutate_ast` and
`store_unsub_wrap_ast` carry 37 `&[String]` parameters between them and answer correctly anyway,
because a `$`-prefixed name cannot be redeclared in Svelte and the plain store name is not what
they key on. And the flag site is **not** an `*_ast.rs` pass — it is in the expression converter —
so the "44 passes" denominator this row keeps quoting is not the population. Grep for the
question, not for the file naming convention.

**Crossing the entry point multiplied the yield.** A generated matrix — 6 binding kinds x 6 entry
points x 5 shadow shapes, 165 inputs x 4 targets — reported **72** divergences on its first run,
against 1 for the ten hand-written probes that varied only the binding kind. Three causes, and the
first is closed: the expression converter's shadow set held a bare `let` and a function parameter
and nothing else. Its registrar said so — *"destructuring patterns are ignored (they rarely shadow
a prop name and the code is cleaner without the extra complexity)"* — and a `catch` clause and a
`for…of` head bound nothing at all. **A comment recording a deliberate simplification is the same
hiding place as a comment asserting fidelity.** Closing it took 72 to 48, and the reusable part is
that all three constructs bind for their body only and must hide **both** the read transform and
`shadowed_prop_names`: the pre-existing `for…of` code removed the transform and not the second, so
a prop read inside the loop still became `$$props.v`.

The second is closed too, and it is the one with real-world reach.
`transform_legacy_state_declarations` finds `let <name> =` by text, and its caller hands it one
top-level instance statement at a time — so `function go() { let v = …; }` arrives as a single
input and the LOCAL declaration was lowered to `$.mutable_source`, allocating a signal per call.
Upstream promotes only a top-level `let`, so the rewrite is refused unless the match sits at the
statement's own brace depth. **Every other shadow fix in this batch moved 0 of 34,728 corpus
entries; this one moves 3**, and takes `musicat/src/lib/views/AlbumsView.svelte` from a listed
failure on `client` and `client-dev` to a 4-target match. Reachability is a property of the
defect, not of the class.

The third is the reason this row keeps a **server** paragraph, and it corrects a claim an earlier
draft made here. That draft called the 44 remaining divergences "one cause, outside phase 3";
**8 of them were phase 3**, in a port this row had not looked at. `server/ast/read_wrap.rs`
decides whether an identifier read is a derived / store binding from a `shadowed` stack, and its
own doc comment says the stack is populated "from function / arrow parameter patterns (the only
shadowing the store-cluster fixtures exercise)" — the second deliberate-simplification comment in
one row, and the second one to be load-bearing. A `catch` clause, a `for…of` / `for…in` head and a
`for (let …;;)` head bind names and none was collected, so `catch (v) { v.n = 2 }` emitted
`v().n = 2` and `for (let v = 0; v < 2; v++)` emitted
`for (let v = 0; v() < 2; $.update_derived(v))` — a runtime helper called on a loop counter. The
client had been fixed for the same five shapes one commit earlier and the server had not, which is
the row's own subject: **fixing one port is not fixing the question**, and only a probe that
compares all four targets separates the two. Blast radius 0 of 34,728 corpus entries on `server`
and `server-dev`, and the four hunks are independently necessary (ablated one at a time: 6 / 2 /
2 / 4 divergent lines).

**The predicate this row introduced then over-fired, and what caught it was a unit test rather
than any gate here.** `reference_is_plain_local` asks the `scope_root` bindings which one owns a
reference and whether its kind is `Normal` — and phase 2 records a **second, `Normal`** entry for a
rune declared inside a template expression's function body (the #3233 shape). So
`let counter = $state(1); counter = 2` in an event handler answered "plain local",
`try_transform_assignment` bailed, and the fallback emitted `$.set(counter, 2, true)` where
official emits `$.set(counter, 2)`. **The corpus could not see it**: the client hash sweep moved 0
of 34,728 entries across the whole series, and `template_function_rune_3233.rs` — a committed
repro from an earlier fix — is what went red. A property gate and a corpus are both populations;
a test written for the shape is not.

The discriminator is the scope chain: a component binding is declared at instance depth and a
local signal one function deeper, so the veto is `State` / `RawState` / `Derived` at
`function_depth >= 2`. **Restricting it to those three kinds is load-bearing** — the first
narrowing vetoed on any nested non-`Normal` binding, which is also true of an each item, and put
the `$$index` parameter back on the repro two rows above. A predicate fix needs the whole set of
repros the predicate serves re-run, not only the one that failed.

**A sweep of the shadow shapes the 165-probe matrix did NOT enumerate then found the same question
answered wrongly in THREE more places at once, and the count is the point: `const f = function v() { … }`
binds `v` inside its own body, and every implementation that had to know said otherwise.** `server/ast/read_wrap.rs` never put the
id in its frame; `client/ast_state_transform.rs` carries a comment saying named function
expressions "bind only in their own scope, so they are excluded" — correct about the *enclosing*
scope, and it then never declared the name in the function's own scope either; and the template
walker's `LocalScope` collected parameters and block declarations and not the id. So `typeof v`
came out `v()` on the server, `$.get(v)` in the instance script and `$$props.w` for a shadowed
prop, with the instance script and a template event handler being two separate ports of the client
half. Each hunk is independently necessary (2 / 4 / 2 divergent lines ablated one at a time) and
the blast radius is 0 of 34,728 corpus entries on all four targets. **A row that says "two ports" is a lower bound
until somebody counts**; the sweep that found this one also found `for (let v = 0; …)` above, and
neither shape was an axis value the generated family's author wrote.

Three things that sweep turned up are recorded rather than fixed. A named **class** expression is
the same shape and **upstream emits output no JS parser accepts** for it — `const C = class $.get(v) {`
on the client and `class v() {` on the server, both rejected by acorn — while rsvelte emits the
correct `class v {`; that is
[`upstream_issues/svelte-named-class-expression-shadowing-a-rune-emits-unparseable-output.md`](../upstream_issues/svelte-named-class-expression-shadowing-a-rune-emits-unparseable-output.md),
and no pattern-corpus file can carry it while byte equality is the goal. `function $y() {}` is
rejected by official with `dollar_prefix_invalid` and accepted here — the over-acceptance shape,
in phase 2. The opposite direction turned up too: upstream creates no scope for a class
`static {}` block, so `class C { static { const v = 2; … } }` beside a top-level `let v` is
rejected with `declaration_duplicate` while a method body, a function body and a plain block all
compile — legal JavaScript refused, which no collected corpus can hold either
([`upstream_issues/svelte-class-static-block-shares-the-instance-scope.md`](../upstream_issues/svelte-class-static-block-shares-the-instance-scope.md)). And a `$derived` name reused as a **destructured default parameter**
(`function go({ v } = { v: 0 })`) made the client emit
`function go(($$value) => { v = $$value.v; return $$value; })({ v: 0 }) { … }` — text no parser
accepts, with the component's own `$state` / `$derived` declarations left unlowered beside it.
`destructure_transforms.rs` finds a destructuring assignment by scanning for `} =` / `] =`, and
its one guard asks "is this inside ANOTHER pattern" — which a formal parameter list is not. What
separates the two spellings is the enclosing paren: a parameter list's `)` is followed by `=>` or
by the body's `{`, and a control-flow head is the one other paren that closes before a `{`. That
is fixed.

The next defect in the same scanner was `is_standalone`, and it is the sharpest statement of what
this row is about: upstream computes it as `context.path.at(-1).type.endsWith('Statement')` — a
**parent node type** — while rsvelte read the punctuation around the expression, which recognizes
an expression statement and nothing else. So every other statement whose child the assignment
actually is kept a trailing value: `if (({ v } = o))` came out `if (($.set(v, o.v, true), o))`
against official's `if (($.set(v, o.v, true)))`, and where the right-hand side is cached the IIFE
gained a `return $$value;` official does not emit. The population is not one shape — ten head
slots (`if` / `while` / `do…while` / `switch`, all three `for` slots, `return`, `throw`), three
keyword-introduced statement bodies (`else`, `case …:`, `default:`) and a redundant paren layer,
38 divergent comparisons over 33 probes. It is fixed by asking the same question from text, and
**three things about that translation are worth keeping**. A redundant paren layer is no node at
all — acorn drops it — so every layer has to be asked the question *innermost first*; peeling the
layers off before deciding strips the head's OWN parens and loses `if (({ a } = o))`, which the
first version did. The rule is not "a `)` follows": `if (1 && ({ a } = o))` closes on the same
`)`, so a head slot has to be delimited on **both** sides — by the head's own parentheses or by
the `;` between two `for` slots. And a `:` is a statement boundary in `case …:` / `default:` and
an expression's punctuation in a ternary or an object property, which is decided by scanning back
for the keyword at depth 0 rather than by the character. The one thing a text rule still cannot do
is name the node: `foo(({ a } = o))` and `if (({ a } = o))` differ only in the token before the
paren, so this stays an approximation of a parent-type test, not the test.

Underneath that scanner sits a plainer question the same row keeps asking — **which statements bind
a name** — and the two client registrars each knew a different half. `ast_state_transform.rs` had a
`visit_function` arm declaring a function declaration's id in the enclosing scope and **no class
hook at all**; the template walker's `register_block_local_vars` matched
`JsStatement::VariableDeclaration` and nothing else. So `class v {}` inside a function read
`typeof $.get(v)` on both paths and `function v() {}` inside an event handler did too. Both are
fixed. What sized the work honestly was refusing to price it off the three probes that reported
it: a grid of declaration kind (`function` / `class` / `let` / `const` / `var`) × where the
reference sits relative to the declaration × host (instance-script body / template handler /
prop-named binding) is **30 divergences over 96 comparisons**, against the 6 divergent lines the
original probes showed. The declaration-kind fix takes 12 of those; the residue is two further
causes, recorded rather than claimed. **Hoisting**: the instance-script port declares a name when
the walk reaches it, so `const r = typeof v; function v() {}` still reads the component binding —
upstream resolves against a scope that already holds every declaration of the block, and the same
is true of `let` and `var`, which is why the residue is 12 comparisons and not just the function
one. The template port already pre-scans its block, so this half is one port, not two. And **`var`
is function-scoped**: `{ var v = 2; } return typeof v;` binds `v` in the enclosing function, while
every registrar here treats a block's declarations as the block's — that one is 6 comparisons and
is the only member of this family that **also reproduces on the server**.

The hoisting half is fixed too, and the interesting part is what the repro found rather than what
the fix does. `ast_state_transform.rs` now registers a block's declarations in a pre-pass over the
statement list, through the same method the walk uses — a second copy of "which declarations
register no names" is exactly the shape this row exists to catch, so the `$props()` guard is
extracted from the rewrite that owns it and both callers read it. All four declaration kinds are
registered, not only the genuinely hoisted `function` / `var`: a read above a `let` or a `class` is
a TDZ error, but upstream still resolves it to the local, and byte equality is the goal. Ablated,
the variable half and the function/class half are 6 comparisons each. **And the repro's first draft
found a live defect in a third port that none of this touches**: rsvelte wraps `console.log(a)` in
`$.log_if_contains_state` for a handler-LOCAL `a`, where official wraps only an argument that
references a component binding — `const a = 1; console.log(a)` reproduces it with no shadowing
anywhere, and `console.log(v)` on the real `$derived` matches, so the divergence is
over-instrumentation of a local rather than a scope-resolution error. It is dev-mode only, it is
not in any probe set written for this row, and it is recorded here rather than fixed.

The `var` half closes the family, and it is the largest single instance this row has produced.
A `var` outlives its block, so `{ var v = 2; } typeof v` resolves to the local — and **all three**
phase-3 shadow registrars scoped it to the block. The server's `read_wrap.rs` carried the tell:
its `collect_block_decl_names` doc said collecting `let`/`const`/`var`/`function`/`class` "at every
block boundary is conservatively correct", which is false for exactly one of those five, because
the frame is *popped* when the block ends. **A comment asserting fidelity is where this class
hides** — the same shape as `assign_dev_ast.rs:56` and the server rune table. The grid put every
`var` site except a function's own top level wrong on client and server: a block, an `if`
consequent, a `for` init, a `for…of` head, a `try` block, a `case` arm, a `while` body, a doubly
nested block — **42 of 56 comparisons**, against the 6 the original probe showed. Ablated per port:
18 server, 18 instance-script, 8 template. The server and the instance-script pass walk the same
oxc AST and asked the same question, so they now share one `shared::hoisted_vars` walk instead of
a copy each; the template port reads the phase-3 IR and keeps its own, documented as the twin.

Two things it leaves. The negative control is load-bearing and is what stops the fix from being
"collect every `var` anywhere": a `var` inside a **nested function** must not leak out, so the walk
declines to enter a function or class body. And the residue names a **fourth** answer to this row's
question: `for (var v = 0; v < 1; v++)` in a template handler now reads `typeof v` correctly while
`v++` still lowers to `$.update(v)`, because that decision is made in `expression_converter.rs`
from `reference_is_plain_local` — a predicate driven by **phase 2's** scope data rather than by any
phase-3 registrar. Three registrars agreeing does not make the compiler agree with itself.

The `console.log` over-instrumentation noted above was then sized the same way, and it is **three**
sub-causes rather than one. Upstream wraps a dev `console.<method>` only when an argument is a
spread or `scope.evaluate(arg).has_unknown`, and its identifier case evaluates a binding's
initializer when `!binding.updated` — the test is whether the name is ever **written**, not whether
it is `const`. `console_wrap.rs` collected verdicts only from a `const` declaration, and its own
comment said so: "every other local binding (parameters, lets, duplicate const names) is UNKNOWN to
upstream's evaluator". That is fixed, with the reassignment controls — a `let` later assigned, a
`let` incremented, a `let` with no initializer — all still wrapping, which is what separates the
`!updated` rule from "treat every local as known".

The two that remain are recorded rather than claimed, and they are on either side of this row's own
axis. A **template** handler's locals are invisible to `args_need_wrap`, which evaluates against the
component scope with no local bindings at all — so `const a = 1; console.log(a)` in an event handler
is wrapped while the byte-identical script-path source is not; that is a second port of the same
predicate, and the script path is the one that already has the answer (`LocalConsts`). And a global
call is `NUMBER` to upstream's `globals` table (`Math.random()`, `Number('3')`) and UNKNOWN here —
the same gap #3539's residue records for the constant folder, reached through a different caller.
Measured together: 5 divergences over a 116-comparison grid of argument shape x host.

The globals half is now fixed, and it is the first change in this campaign whose blast radius is
**not zero** — which finally gave the corpus sweep the positive control every "0 of 34,728" above
was missing. It moves exactly one entry, `ha-fusion/src/lib/Main/ConditionalMedia.svelte`, and it
moves it *toward* official: `const remainingSeconds = Math.round(remaining / 1000)` is NUMBER
upstream, so the `console.debug` of it is not wrapped. (The file stays a listed client-dev failure
for an unrelated comment-placement reason; this removes one line of its divergence.)

Three things it cost. **A membership test that only ever feeds a fold cannot be checked by the
fold**: `is_global_keypath` matched any `Math.` prefix, so `Math.notAThing` was a global here and
UNKNOWN upstream — invisible for as long as the only consumer folded (both answer unknown) and
wrong the instant one reads the TYPE. It is now upstream's exact 46 keys. **The shadow test has to
be by scope, not by name**: `const Math = { … }` in one function silenced `Math.random()` in every
other, which is the same name-vs-scope hazard the lint campaign recorded one level down; the
reference-position set answers it exactly. And **phase 2 records function-locals in
`root.bindings`**, so the analysis-side name lookup had to be confined to the module and instance
scopes — the reference set already covers everything below them.

That leaves the template-handler half, and probing it showed the sub-cause is **not** in phase 3 at
all: for `onclick={() => { const a = 1; … }}`, phase 2 records `a` with `initial: None` — twice,
once in the arrow's own scope and once in the root FRAGMENT scope — so no phase-3 evaluator could
answer it correctly even with the right scope index. It is recorded here as phase 2's, alongside
the `reference_is_plain_local` residue above.

The 36 that remain are one cause, **in phase 2**, and every one is `client` or `client-dev`. A
write through a `catch` parameter or a `for…of` binding is recorded on the *component's* binding,
which shows up as a different `$.prop` flag word (24 vs 28, 19 vs 23), a `$$ownership_validator`
upstream does not emit, and a store declared as `$.mutable_source(writable(…))`; recorded here
rather than fixed.

The remaining ~28 text-keyed passes are **未測定**. Degree 3 is available here and is the right
shape for it: "no rewrite pass claims an identifier that resolves inside its own input" is a
property, not a comparison, so the corpus becomes the detector at whatever size it is.

**That gate now exists — `RSVELTE_ASSERT_SIGNAL_DISCIPLINE`
(`3_transform/client/signal_discipline.rs`) — and what it cost to make it discriminate is worth
more than the gate.** The first formulation asserted that no signal sink's first argument may
resolve to a symbol the same program declares as a plain value. It reported 9 violations on the
corpus, of which 4 components are byte-identical to official; narrowing it until the corpus
reported 0 took two rules — a `const` cannot be judged, because upstream emits `const st = 1`
beside a `$.set(st, …)` in the accessor generated for `export const st = $state(1)`, and an
initialiser that is an identifier cannot, because `let i = $$index_4` receives a signal. **A
property gate that reads 0 on the corpus is exactly what a property gate that sees nothing reads,
and this one saw nothing**: ablating the five shadow guards above and recompiling this row's own
repro produced `$.mutate(stats, …)` / `$.set(count, 1)` / `$.update(count)` with the gate armed
and silent, because `stats` and `count` are *parameters* of a user callback and the rule skipped
every parameter as unknown provenance. The defect's own container was inside the exclusion.

Two changes make it discriminate, and each is a distinction the first version collapsed. A
parameter is unjudgeable only when its function is **passed directly to a runtime helper** —
`$.each(…, ($$anchor, item, $$index) => …)` really does hand over signals — and that is not
answerable by nesting depth, because `$.set(s, xs.reduce((acc) => …))` puts a user callback inside
a runtime call's argument. And a prop write has its own sink: the generated shape is
`name(name().x = v, true)`, so that callee must be a `$.prop` / `$.rest_props` accessor. Ablated,
the gate now reports all six wrong writes across the two repros; restored, it is silent on all
three.

**Its first clean run found a live defect, in a file no output gate could have reported it from.**
`sparrow-app/…/TeamSidePanel.svelte` has `export let data` shadowed by a `let data = await …`
inside a template event handler, and rsvelte emitted `data(data().isNewInvite = false, true)`
where official emits `data.isNewInvite = false`. That id is already a listed entry on
`known-failures.{client,client-dev,server}.json` for two unrelated divergences (a scoping class
argument, a lost comment), so the output ratchet suppressed this one — the
"a ratchet entry suppresses everything its key cannot tell apart" rule, observed from the other
side. The fix is the same shadow question one entry point over: an event handler's body is
lowered by the expression converter, whose scope is the *template's*, so the name lookup reaches
the prop. It is **two** lowerings — `try_transform_assignment` and `try_transform_update` — and
fixing only the first left `data.count++` wrapped, which the gate then reported against the
repro written for the first half.

**The predicate is the part to copy carefully.** `reference_is_shadowed_non_prop` reads like the
right question and is not: it is true of a top-level `$state` too, because every kind but a prop
counts as "not a prop" there. Using it as the bail changed **736** corpus outputs, 724 of them
files that were passing, turning `$.set(layout, "…")` into `$.set(layout, "…", true)` across the
corpus. `reference_is_plain_local` — the reference uniquely belongs to a `BindingKind::Normal`
declaration — changes exactly **1**, the file the gate flagged, with 0 violations over 34,728
entries × client + client-dev.

What the gate cannot see is the **read** side, and that half had to be found by reading the fix
rather than by running it: in the same handler `items.selected = data` emitted
`items(items().selected = data(), true)` where official emits `data`, because the RHS is
transformed eagerly — before the outer walk that would have built a scope for it — with an empty
`LocalScope`. A read has no sink, so no signal-discipline violation exists to report.

**The position for a read cannot come from where the write's came from.** `JsExpr::Spanned` is
attached only when `enable_sourcemap` is true (`expression_converter.rs:156`), so keying a codegen
decision on it would make the generated program depend on whether a map was asked for — the same
option split that hides regressions from CodSpeed. An expression has many identifiers and the
converted `JsExpr` carries none of their positions, but its **source range** is on both paths, so
the bindings are asked which plain locals they declare inside it
(`plain_local_names_in_range`). Reachability of the read half is **0 of 34,728 corpus entries**:
correct, and it moves no real-world output.

**A name the scope builder never walks cannot shadow anything, and that is where this row's
question is decided.** Upstream's `create_scopes` walks a binding pattern's DEFAULT like any other
expression, so `let { search = async (input) => … } = …` opens a scope for the arrow and
`scope.declare` puts `input` into `root.conflicts`. rsvelte's `process_binding_pattern_typed`
read an `AssignmentPattern`'s `left` and dropped its `right` — so the default's declarations and
its reads reached nothing, and `$.delegated('input', …)` in dev generated `function input()`
where upstream deconflicts to `function input_1()`
(`svelte-material-ui/packages/autocomplete/src/Autocomplete.svelte`). The default has to be
walked AFTER the pattern rather than inside it, because the `$props()` arm applies `init_rune` to
the `self.bindings[first_new..]` slice and an arrow parameter declared mid-pattern would land
inside it.

Two things generalize. **A function parameter's default was already right, for the wrong reason**:
`input` reached `root.conflicts` through the unbound-global collector in `2_analyze/mod.rs`, which
scans the script for identifiers that resolve to no declaration — a coincidence that made
`function f(g = (input) => input)` and `let { g = (input) => input }` look like one covered case
when they are two, and the grid had to cross the two slots to tell them apart. And **the oxc twin
of this walk is dead code**: `process_binding_pattern` has the identical one-line omission, but
`process_program` is reached only when a script's content is not `Expression::Typed`, which
`resolve_lazy_expressions()` rules out. Measured rather than argued — 0 of 2000 corpus components
reach it, with the positive control (disabling the typed fast path makes the marker fire) showing
the instrument can report. The twin is left unfixed and recorded here rather than changed
unmeasured.

**This row's question has THREE ports in the client, not two, and the third had no
guard at all.** An `UpdateExpression` is lowered by `convert_update_expression` (the JSON
path), by the typed arm of `convert_js_node`, and by `try_transform_update`. The second and
third both refuse a name whose reference at that position belongs to a plain local
(`reference_is_plain_local`); the first went from `extract_identifier_name_from_json` straight
to `context.state.transform.get(&name)`. So `var v = 0; while (v < 1) { v++; }` inside a
template handler, in a component that also has `let v = $derived(base)`, emitted `$.update(v)`
against the component's signal. Ablating the added test takes a 16-cell grid from 4 to 6 and the
repro from 0 to 2 of 4.

**Finding the third port took a backtrace, and that is the reusable part.** Instrumenting the two
known call sites reported nothing, and so did every `format!("$.update(…)")` in the client — five
sites, all silent. The producer was found by putting a `Backtrace::force_capture()` in
`b::svelte_call` when its method is `update`. **Enumerating the sites that look like the
answer is not enumerating the sites that produce the output**; the output string is the only
key that cannot miss one.

The residue is a different cause and is recorded rather than claimed: for a `var` declared in a
`for` HEAD, phase 2 creates the local binding (kind `Normal`, the arrow's scope) but leaves its
reference list **empty**, and the component's `Derived` binding owns the handler's positions —
so a position-keyed test cannot separate them no matter which port asks it. Two of the 16 cells
stay red.

### 22. How is an inline `$props()` type hoisted to `$$ComponentProps`? — [D]

**Upstream:** one branch of `handle$propsRune`
(`svelte2tsx/src/svelte2tsx/nodes/ExportedNames.ts`, the "Easy mode" arm). It takes
`node.initializer.typeArguments?.[0] || node.type` — so the **type-argument** form
`$props<{…}>()` and the **type-annotation** form `let {…}: {…} = $props()` are the *same*
`generic_arg` — and relocates it with `preprendStr` + `appendLeft` + **`this.str.move(...)`** +
`appendRight(surroundWithIgnoreComments('$$ComponentProps'))`. Because the type text is *moved*
rather than re-emitted, every character of the hoisted alias keeps its magic-string mapping.

**Ports.** Both in `rsvelte_projection` `svelte2tsx/script/props_rune.rs::apply_props_typedef`,
selected by which flag the same upstream `||` collapses:

- `HAS_TYPE_ARG` (`props_rune.rs:126-150`) mirrors upstream: `prepend_right` + `append_left` +
  `append_right`, and signals `props_type_arg_hoist` so `process_instance_script_tag.rs:321`
  performs the `move_range`.
- `TYPE_ANNOTATION | HOISTABLE_TYPE` (`props_rune.rs:154-176`) does **not** move anything. It
  `overwrite`s the annotation away at its original site and the alias is re-synthesized as fresh
  text by `format!` at `process_instance_script_tag.rs:177` / `:199` / `:356`.

**Demonstrated.** Two inputs that differ only in which spelling of the same type upstream's `||`
picks, both `is_ts_file: true`, counting map segments on the generated `$$ComponentProps` alias
line:

| input | generated alias line | segments | mapped columns |
|---|---|---|---|
| `let { a } = $props<{ a: number }>()` | `type $$ComponentProps = { a: number };…` | **15** | 35/59 |
| `let { a }: { a: number } = $props()` | `;type $$ComponentProps =  { a: number };…` | **0** | 0/61 |

The generated **text** matches upstream in both cases, which is why the svelte2tsx text gate is
green on them; the divergence is confined to the map. And the map gate cannot see it either — it
asserts rsvelte's map is *structurally well-formed*, not equal to official's, because the two are
segmented too differently to diff. So a diagnostic anywhere in an inline-annotated props type
resolves to the wrong source position, and nothing in the tree reports it.

**Not closed.** Degree 1 is available in principle — the annotation arm can take the
type-argument arm's `move_range` path — but it changes which chunk the `;` markers travel with,
which is exactly the ordering `process_instance_script_tag.rs:301-310` comments as load-bearing,
so it needs the corpus svelte2tsx text gate rather than a unit test alone.

### 23. What compiler options and shim files does the shadow program get? — [D], **closed**

**Upstream:** two functions. `plugins/typescript/service.ts`'s `createLanguageService` forces
`target: ts.ScriptTarget.Latest` when the project declares none and raises anything below ES2015
to ES2015 (`:792-795`), and builds its no-project fallback with `include: []` "to not flood the
initial files" (`:874-878`). `svelte2tsx/src/helpers/files.ts`'s `get_global_types` (`:15-27`)
names the shim set: `svelte-shims-v4.d.ts` and `svelte-native-jsx.d.ts` always, the project's own
`svelte-html.d.ts` when the installed Svelte 4+ has one, and `svelte-jsx-v4.d.ts` **only as the
fallback for a package that does not**.

**Ports.** `rsvelte_language_server` `tsgo_overlay.rs::write_tsconfig` /
`materialize_support_files`, and `rsvelte_check` `svelte_check/overlay.rs`.

**What made this row worth keeping open is that the two ports were behind each other in opposite
directions.** The `target` and `include` rules were missing from both, and the language server was
given them first — deliberately, and recorded here as an asymmetry rather than left silent.
Measured on three mini-workspaces against the live official server, completion at a script-body
position:

| workspace | official has `Temporal`/`DisposableStack`/`AsyncDisposableStack`/`SuppressedError`/`svelteNative` | rsvelte LSP before | rsvelte LSP after |
|---|---|---|---|
| no `tsconfig.json` | all five | none | all five |
| `target: ES5` | `svelteNative` only | none | `svelteNative` only |
| `target: ESNext` | all five | four (no `svelteNative`) | all five |

The `include` rule is the largest of the three by effect: with no project config rsvelte pulled
every `.d.ts` in the repository into the program, so bits-ui's own `declare global`s
(`bitsEscapeLayers` and five siblings) were offered as completions at **55 of 285** sampled
script-body positions where official offers nothing.

Then the *shim* rule turned out to run the other way: `rsvelte_check` had
`get_global_types`'s `svelte-html.d.ts` condition and no `svelte-native-jsx.d.ts`, while the
language server had `svelte-native-jsx.d.ts` and shipped `svelte-jsx-v4.d.ts` unconditionally —
each port holding the half the other lacked. **A port being ahead on one rule is no evidence
about the next rule**, so an inventory row is closed by the whole function, not by the rule that
motivated it.

**Closed** by one `rsvelte_check::overlay::global_type_files` that both ports call, and one
`SHIM_FILES` they both materialize. The shim half measures **zero** on the LSP corpus: swapping
`svelte-jsx-v4.d.ts` for the project's `svelte-html.d.ts` left every completion label at 25
bits-ui components byte-identical, because both shims take their element vocabulary from the
installed `svelte/elements`. The positive control is an ablation — removing *both* from the
tsconfig's `files` takes an `<svg>` attribute position from 640 items to 0, and restoring them
returns 640 — so the file does reach the program and the null is about the two shims agreeing,
not about the change not landing. `check-known-failures.json` moves with this
(`rsvelte_check`'s shim set gains `svelte-native-jsx.d.ts`).


### 24. May an element whose attribute value is indeterminate match a selector naming that value? — [D], one of six pairs closed

**Upstream:** `css-prune.js` `attribute_matches` — one function. A value it cannot enumerate at
compile time (an expression, a spread) returns `true`: the element may carry anything, so it
satisfies any selector naming that attribute.

**Ports — four, all in `3_transform/css.rs`, and they answer for different attributes:**

| # | port | `class` indeterminate | `id` indeterminate |
|---|---|---|---|
| 1 | `selector_matches_element` | per element (`has_spread \|\| dynamic_attribute_names`) | **had none** → fixed here, same rule |
| 2 | the element matcher inlined in `is_parent_chain_unused` | coarse: `ctx.has_dynamic_classes` gates the whole component | **had none at all** → fixed here, per element |
| 3 | `structural_element_matches_attribute` | per element, plus `has_class_directive` | per element — already correct |
| 4 | `is_simple_selector_unused` | coarse: `ctx.has_dynamic_classes` | coarse: `ctx.has_dynamic_ids` |

**The demonstrated divergence is the `id` column**, and the inputs are in
`pattern-corpus/issues/a-dynamic-id-matches-any-id-selector.svelte`. With `<div id={expr}>` in the
component, official keeps all four of `#absent + .b`, `#absent ~ .b`, `.host:has(#absent)` and
`#absent { .under { … } }`; before the fix rsvelte pruned every one, and the fourth as a whole
`(empty)` rule rather than the nested selector official drops. Ports 1 and 2 are why: a sibling,
a `:has()` argument and a `&` compound reach #1, and a parent prelude reaches #2.

**The controls are what make this a two-*ports* row rather than an id bug.** The same component
with `class={expr}` matched official *before* the fix — port 1 already had the class escape — so
the two attributes were being answered by one function under two different rules. And an absent
**static** id still prunes on all four shapes after the fix, which is what an over-wide escape
would have broken.

**What is closed:** ports 1 and 2 now agree with 3 on `id`.

**Port 4 was measured on 2026-08-31 and is a different kind of port from 1–3.** Its two callers
(`css.rs:1981`, `css.rs:2010`) are an early-out *screen*: a `true` declares the whole rule unused
without consulting the real matcher, while a `false` is non-binding and falls through to it. A
whole-component flag is therefore strictly more conservative than upstream's per-element rule at
the only step where it is consulted — it can make the screen keep more, never prune more. Seven
constructed inputs crossing {dynamic id, dynamic class, spread, static} × {simple `#absent`,
simple `.absent`, `span#absent`} all MATCH, and the probe has a moving control on the axis in
question: with a dynamic id in the component neither compiler warns, without one both emit
`css_unused_selector` at the same position.

**Probing what that does NOT close found the live one.** The screen prunes on
`!used_ids.contains(…)` / `!used_classes.contains(…)`, so the risk sits in how those two sets are
*built* — and there the two attributes are answered by different code. `class` goes through
`css::possible_class_names` (rsvelte's port of upstream's chunk expansion over
`get_possible_values`); `id` has a bespoke branch in `2_analyze/visitors/shared/element.rs:414-438`
that marks **any** expression indeterminate. Upstream runs one expansion for both, with `is_class`
controlling only whether array/object expressions are inspected.

Measured, three diverging shapes and four passing controls:

| `id` value | official | rsvelte |
|---|---|---|
| `id={c ? 'a' : 'b'}` | prunes `#zzz` | keeps it |
| `id={'a' \|\| 'b'}` | prunes `#zzz` | keeps it |
| `id={'a'}` | prunes `#zzz` | keeps it |
| ``id={`ab`}`` | keeps | keeps — upstream cannot enumerate it either |
| `id="a{x}"`, `id={x}` | keeps | keeps |
| the same four shapes spelled with `class` | — | **all four match**, including the three above |

It is an over-keep, so it costs CSS size and a missing `css_unused_selector`, not rendering. Fixed
in the same lane: `possible_class_names` is now `possible_attribute_values(value, is_class)` and
`id` calls it, with the whitespace split kept as `class`'s own step.

**The `class` column was then probed the same way and came back clean.** Seven shapes crossing
{`class={dyn}`, a spread, a `class:` directive, nothing} × {nested rule, descendant combinator,
the indeterminate element IS the ancestor} × {`class`, `id`}, each placing the indeterminate
element where a per-element rule and a whole-component flag must disagree — as a **non-ancestor**
of the subject. All seven MATCH, and the probe is strongly discriminating: its verdicts range over
`[]`, one warning, two warnings, and three different CSS bodies (`(empty)`, `(unused)`, kept with
a scoping hash). **What is not established is why**: port 2's coarse `has_dynamic_classes` does
not surface on any of these, and no measurement here says whether that is because the flag is
never binding for `class` or because these seven shapes miss the arm. Recorded as measured-clean,
not as explained.

### 25. Does this reference warrant `state_referenced_locally`? — [D], both ports still live

**Upstream:** one branch, `2-analyze/visitors/Identifier.js:104-152`. Its three parts are the
depth equality `state.function_depth === binding.scope.function_depth`, a binding-kind arm (a
`$state` warns only when it is `reassigned` **or** its initial argument fails `should_proxy`), and
a read/write test on the parent node.

**Ports — two, and the second exists because the first is unreachable from where it is needed:**

| # | port | depth equality | kind arm | scope searched |
|---|---|---|---|---|
| 1 | `2_analyze/visitors/identifier.rs` | yes | full, incl. `should_proxy`-equivalent on `initial_node_type` | the reference's own binding |
| 2 | `2_analyze/visitors/declaration_tag.rs::warn_local_state_reads` | **none** | kind set only (`State \| RawState \| Derived`) | `analysis.root.scope.declarations` |

Port 2 carries a comment stating why it exists — "rsvelte's main Identifier visitor … does not run
on declaration tags" — which is true, and is exactly the shape this file warns about: a comment
asserting fidelity reads as a citation.

**Measured divergence (2026-08-31).** A `{let a = $state({ x: 1 })}` that is never reassigned,
read synchronously by `{let b = a}`: official is silent (`should_proxy` is true, so the read still
sees the proxy) and rsvelte warns. Same for `$state([1])`. Port 1 answers these correctly; port 2
has no `should_proxy` arm at all. Not reachable from any collected input — 0 of the 4,201
`submodules/svelte` units diverge — so only a constructed probe finds it.

**Sharing the kind arm was tried and reverted, and the reason is the reusable part.** Pointing
port 2 at port 1's rule fixed both cases and **broke three** that were correct: `{let a = $state(1)}`
read by `{let b = a}` stopped warning at the top level, inside `{#if}`, and in the file's own
control. `binding.initial_node_type` is not populated for a declaration-tag binding the way it is
for a script one, so the shared predicate's `should_proxy` arm answers `false` where port 2's
kind-only test answered `true`. **Two ports can disagree because they read different *inputs*, not
because they encode different rules** — and a shared predicate then silently inherits whichever
input is missing. Closing this row means populating `initial_node_type` for declaration tags
first, and the port-vs-port test has to spell its expectations independently (degree 2 below),
because port 2 as an oracle for port 1 passes on exactly the cases that are wrong.

**A third path emits it in neither direction, and this is a deliberate non-start.** Every template
expression other than a `bind:` goes through the lightweight walker
`shared/utils::walk_js_expression_node`, which never emits this warning at all. A template
expression can only warrant it for a binding declared *inside that expression* — an instance
binding is at a different `function_depth` — and every such slot was measured: an event handler
with an arrow block body, with `$derived`, with `$state.raw`, with a function expression; an
attribute-expression IIFE; a text-expression IIFE; a `use:` action argument; and the same inside a
snippet body and an each body. **Nine slots, one cause**, with the instance-script control
warning correctly on the identical source shape.

The blocker is named in the code: `shared/utils.rs:1517` states the walker "keeps no `js_path`",
which is also why rune-call validation there is narrowed to `function_depth == 0`. Upstream's
condition needs the parent node (to exclude an `AssignmentExpression` target and an
`UpdateExpression`) and walks `context.path` to choose the `closure` / `derived` message, so the
warning cannot be emitted from that walker as it stands. Closing it means either giving the walker
a `js_path` and extracting the decision into ONE function both callers use — degree 1, and the
only shape that does not add a third port — or routing template expressions through the Identifier
visitor. Either touches a hot path.

**Not started on purpose.** It is an *under*-warning: the generated code is correct, it occurs 0
times in the 4,201 `submodules/svelte` units, and no ratchet entry moves. Recorded here so the
next person inherits the boundary rather than re-deriving it.

**What is still unmeasured:** the depth equality. Port 2 has none, so every kind-eligible read in
a declaration-tag initializer warns regardless of where the binding lives; upstream realigns
`function_depth` to `state.scope.function_depth` for that visit specifically, which makes the
equality hold for a sibling declaration and not for anything shallower. No probe here separates
those, so the agreement on `Prop` / `RestProp` (which port 2 excludes and upstream admits) is
untested rather than correct.

### 26. What ESTree object does the NAPI boundary hand a JS caller? — [D], **closed at degree 2**

**Upstream:** there is no counterpart. Official ships one `parse()`.

**Ports — two, and neither is a rewrite of the other.** `napi_parse` serializes the typed program
with `serde::Serialize` and returns a JSON **string**; `napi_parse_envelope` walks the same tree
with a hand-written binary writer (`rsvelte_bindings_support/src/napi_raw_parse.rs`) whose decoder
is a second hand-written walk in JavaScript
(`apps/npm/vite-plugin-svelte-native/parse-envelope.js`). Every node type is spelled three times:
a `Serialize` arm, a `write_*` arm, and a `readJs*` function. **No gate drives the envelope path
against the JSON path**, and the ~39 corpus gates all consume the JSON one.

**[D] — measured 2026-08-31.** Adding `attributes` to an import and the acorn-typescript omission
rule to the serializer left the decoder writing `attributes: []` where the JSON side omitted it:
3 of 8 constructed inputs disagreed between the two surfaces while the JSON side matched official
on all 8. The ablation is the control — restoring the rule takes it to 0/8, removing it again
returns exactly those 3.

Two things the measurement itself taught. **A `JSON.stringify` comparison of the two surfaces
reports 6 of 8 as divergent on an unmodified tree**, and every one of those six is key
**order** — the decoder assigns `value` before `name_loc` on a `<script>` tag's own `Attribute`
while the serializer emits it after. Order is invisible to a property access and to `parse()`'s
consumers, so a port-vs-port probe here has to compare structurally or it drowns its real signal
in noise it cannot act on. And the envelope carries a `VERSION` that both sides pin
(`napi_raw_parse.rs:74`, `parse-envelope.js:22`, plus `scripts/dev/test-parse-envelope-validation.mjs`):
a new node tag is additive for the writer and **fatal** for a decoder that does not know it, so
the version has to move with the tag or a stale decoder reads a byte it cannot dispatch.

**Closed at degree 2**: `crates/rsvelte_core/tests/import_export_parser_shapes.rs` pins the JSON
side against independently spelled expectations rather than against the envelope, so both ports
being broken the same way still fails. The envelope side has no equivalent test; the standing
probe is the 11-input structural round trip described above, which is not in the tree. **That is
the open half of this row.**


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
