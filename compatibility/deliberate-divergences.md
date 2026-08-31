# Deliberate divergences from the official compiler

Output must match the official compiler exactly, because upstream is the specification.
That rule does not extend to reproducing bytes that are **not valid JavaScript** or that change
the source program's runtime meaning: an unparseable module or a dropped semantic clause is a
defect a byte match cannot pay for. Where the two conflict, correctness wins.

This file is the whole list. It is prose, not a ratchet. Most entries are divergences **no
gate observes**, which is exactly why they need writing down: an unobserved surface plus a
locally plausible reason ("we should match upstream", normally correct) is how a future
contributor reintroduces a parse error while believing they are improving parity. Every
entry below is pinned by a test, so the choice is enforced and not merely described.

A few entries are the opposite: a gate **does** observe them and they sit in a shrink-only
ratchet. Listing one here says the ratchet entry is an accepted difference rather than a
burndown target — the ratchet still stops it from spreading, and the pin still stops the
justification from rotting into "we happen to differ". Each such entry names its ratchet.

Before adding an entry, run both compilers. "Deliberate" is a claim about which side is
wrong, and a record that asserts it without the outputs converts an open question into a
settled one.

---

## Attributes on a side-effect import

**Pinned by** `crates/rsvelte_esrap/src/printer.rs::side_effect_import_keeps_attributes` and
`crates/rsvelte_core/tests/import_attributes_clause_3352.rs`.
**Reported upstream** in `upstream_issues/3635-esrap-side-effect-import-drops-attributes.md`.

Official Svelte (through esrap 2.2.12) prints
`import './data.json' with { type: 'json' };` as `import './data.json';`. esrap's
specifier-less import branch returns after the source and semicolon, before the shared code that
prints import attributes. A declaration with a specifier keeps the clause.

rsvelte deliberately prints the clause on both forms. An import attribute controls module
loading; dropping it can make a valid JSON or CSS module import fail at runtime. This is therefore
not a byte-only layout difference that exact-output compatibility can safely reproduce.

The corpus output gate has no accepted component containing this shape. If one is added while
upstream still drops the clause, it must be recorded as this deliberate divergence rather than
"fixed" by deleting the attribute again. Remove this entry when upstream esrap prints the clause.

---

## Private rune field reached through a non-`this` receiver (client)

**Pinned by** `crates/rsvelte_core/tests/private_field_non_this_receiver_2483.rs`.

### Input

`A.svelte.js`, `generate: 'client'` (`dev` makes no difference to any row):

```js
export class R {
	#n = $state(0);

	constructor(o) {
		const inst = this;
		inst.#n++;        // constructor root
		o.#n--;           // constructor root, receiver is a parameter
		console.log(inst.#n);
		(() => { inst.#n++; })();   // nested function inside the constructor
	}

	m(o) { o.#n++; }
	static s(o) { o.#n++; }
}
```

### Both outputs, measured against `submodules/svelte` 5.56.8

| position | official | parses | rsvelte | parses |
|---|---|---|---|---|
| method body, `o.#n++` | `$.get(o.#n)++;` | **no** | `$.update(o.#n);` | yes |
| static method, `o.#n++` | `$.get(o.#n)++;` | **no** | `$.update(o.#n);` | yes |
| nested fn in constructor, `inst.#n++` | `$.get(inst.#n)++;` | **no** | `$.update(inst.#n);` | yes |
| constructor root, `inst.#n++` | `inst.#n.v++;` | yes | `$.update(inst.#n);` | yes |
| constructor root, `--inst.#n` | `--inst.#n.v;` | yes | `$.update_pre(inst.#n, -1);` | yes |
| constructor root, read `inst.#n` | `inst.#n.v` | yes | `inst.#n.v` | yes |
| method body, read `inst.#n` | `$.get(inst.#n)` | yes | `$.get(inst.#n)` | yes |
| any position, `this.#n++` | `$.update(this.#n);` | yes | `$.update(this.#n);` | yes |

**Only updates diverge.** Reads are parity in both positions — #2464 moved the
constructor-root read onto upstream's `.v` form for every receiver before this entry was
written, and the entry's first version had not seen it.

The parse column is acorn's verdict on the official output and `oxc_parser`'s on rsvelte's;
both reject the `$.get(...)++` rows with `Assigning to rvalue`, and V8 accepts the parse
only to throw `ReferenceError: Invalid left-hand side expression in postfix operation` when
the method runs. Vite/Rolldown reject the module outright.

### Why upstream produces it

`submodules/svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/UpdateExpression.js:14-19`
gates the `$.update` form on `argument.object.type === 'ThisExpression'`. The visitor it
falls through to,
`.../visitors/MemberExpression.js:11-19`, does **not** check the receiver: it rewrites any
private-identifier member of a known state field to `this.#n.v` inside a constructor and to
`$.get(this.#n)` everywhere else. So the two visitors disagree about whether the receiver
matters, and outside a constructor root the disagreement puts a CallExpression in assignment
position.

Reported upstream as **sveltejs/svelte#18621** (open as of 2026-08-08).

### Why rsvelte's form is the correct one

The unparseable rows need no argument beyond the parse column. The two constructor-root
update rows are the ones that need one, because upstream's output there is valid:

- `.v++` writes the source's value **without notifying**, and upstream's receiver check is
  purely syntactic — it does not establish that the receiver is the object under
  construction. `constructor(o) { o.#n--; }` where `o` is an already-live instance lowers to
  `o.#n.v--`, and no subscriber of `o` ever hears about it. `$.update(o.#n)` notifies.
  Upstream's own lowering of `this.#n++` in the same constructor is `$.update(this.#n)`, so
  the helper form is upstream's semantics, not ours.
The constructor-root **read** looks like the same argument one field over, and #2629 asked
whether it should follow. **It should not, and the reason is not that both forms parse.**

The behavioural half of the question is real, and was settled by running it rather than arguing
it. Compile

```js
export class Box {
	#n = $state(0);
	constructor(other) { if (other) globalThis.__seen.push(other.#n); }
	bump() { this.#n++; }
}
```

with official, construct a second `Box` from a live one inside a `$.render_effect`, and `bump()`:

| read form in the constructor | effect runs | values seen |
|---|---|---|
| upstream's `other.#n.v` | 1 | `[0]` |
| `$.get(other.#n)` | 2 | `[0, 1]` |

So `.v` really does drop the dependency, exactly as #2574 claimed. What does not carry over is
the *other* leg of the update argument. At a constructor root upstream lowers `this.#n++` to
`$.update(this.#n)` and `inst.#n++` to `inst.#n.v++` — two forms for one position, so rsvelte
picks the one upstream itself uses for the receiver that is not in doubt. For a **read** upstream
lowers every receiver to `.v`: there is no second form to prefer, and emitting `$.get` would be
rsvelte inventing a lowering upstream never produces at a constructor root. Under-tracking a
constructor-root read is upstream's semantics, not an inconsistency inside it, and the fix
belongs in `MemberExpression.js` — the same receiver check that closes the two update rows above.

Pinned by `private_field_constructor_grid_2573.rs::a_state_field_read_at_a_constructor_root_takes_upstreams_shortcut`.

### What would make this entry disappear

Upstream extending the `ThisExpression` check in `UpdateExpression.js` to any receiver — the
fix #18621 asks for — makes official emit `$.update(o.#n)` too, and closes every row above
except the two constructor-root `.v` ones, which close if `MemberExpression.js` gains the
receiver check instead. Delete the entry, its in-code comments and its test when
`submodules/svelte` is bumped past that fix.

### Why no gate sees it

- **Corpus gate**: `known-failures.{client,server,client-dev}.json` are all `[]`, so no
  corpus entry contains the shape — a divergence this loud could not be listed and silent.
- **Generated matrix**: `scripts/compat-corpus/matrix/axes.mjs` has one private-field seed,
  `class-private-state`, and it writes `this.#n = 1`. Neither axis family varies the
  receiver.
- **Fixture suites**: three samples do reach a private rune field through a non-`this`
  receiver — `private-identifiers-not-this` (`other.#value = value`),
  `class-private-fields-reassigned-this` (`instance.#count = 1`, `return instance.#count`)
  and `class-state-derived-private` (`return self.#doubled`). All four expressions are
  assignments or reads in a method/getter body, which are plain parity; **no fixture applies
  `++`/`--` to a non-`this` receiver** (grepped with a `this.#count++` positive control),
  and none reads one at a constructor root. They are `runtime-runes` samples besides, so
  they assert rendered output, not generated code.
- **`ast_gate_preconditions`**: it would go red on a "correction" toward upstream, but only
  for a fixture that contains the shape, and none does.

### Where it is recorded in the code

Three sites lower an update through a non-`this` receiver, one comment each:
`private_class_assign_ast.rs` (`visit_update_expression` for the spliced collector,
`rewrite_update` for the in-place path — both reached from method bodies) and
`class_transforms.rs::transform_class_methods_non_this` (the constructor root).

---

## A `$`-prefixed function parameter is not a store subscription (server)

### Input

```svelte
<script>
	import { writable } from 'svelte/store';

	const viewport = writable({ distance: 0 });

	function update(fn) {
		fn({ distance: 1 });
	}

	update(($viewport) => {
		$viewport.distance = 42;
	});
</script>

<p>{$viewport.distance}</p>
```

### Both outputs, measured against `submodules/svelte` 5.56.10

| target | official | rsvelte |
|---|---|---|
| `server` | `$.store_mutate($$store_subs ??= {}, '$viewport', viewport, $viewport.distance = 42);` | `$viewport.distance = 42;` |
| `client` | `$viewport.distance = 42;` | `$viewport.distance = 42;` |

**Upstream's own two targets disagree on this input**, which is what settles which side is wrong.

### Why upstream produces it

`3-transform/server/visitors/AssignmentExpression.js:75-79` decides "this is a store" from the
name's spelling plus the existence of a binding one character shorter, and never asks whether
`$viewport` itself resolves in the current scope:

```js
if (is_store_name(object.name)) {
	const name = object.name.slice(1);
	if (!context.state.scope.get(name)) return null;
```

The client resolves through the scope chain and finds the parameter.

### Why rsvelte's form is the correct one

`internal/server/index.js:284` — `store_mutate` calls
`store_set(store, store_get(store_values, store_name, store))`. Reproducing upstream would
subscribe to `viewport` and re-set it every time an unrelated **local object** is mutated, and
register `$viewport` in `$$store_subs` for teardown to unsubscribe — for a store the source never
subscribed to in that scope. It also contradicts the rule
`compatibility/pattern-corpus/README.md` states for `dollar-function-parameter.svelte`: a `$name`
parameter "must neither create a synthetic store subscription nor trigger
`store_invalid_scoped_subscription`".

Reported upstream in
[`upstream_issues/svelte-server-treats-a-dollar-parameter-as-a-store.md`](../upstream_issues/svelte-server-treats-a-dollar-parameter-as-a-store.md).

### Where it occurs in published code

`threlte`, `packages/extras/src/lib/hooks/useViewport.svelte.ts` —
`viewport.update(($viewport) => { … $viewport.distance = distance })`, where `update`'s callback
receives the current value. Naming that parameter `$viewport` is idiomatic and legal.

### Why no gate sees it

The output gates *do* see it — they report it as a `js-mismatch` on `server` and `server-dev`,
which is why the two ids are listed in `known-failures.server{,-dev}.json` rather than silently
diverging. What no gate sees is **which side is right**: every gate here compares rsvelte to
upstream and scores any difference as rsvelte's failure, so a listed entry looks identical
whether it is our defect or theirs. That judgement lives only in this file.

### Where it is pinned

`crates/rsvelte_core/tests/dollar_parameter_is_not_a_store.rs` asserts the server output for the
input above, so a future "fix" toward upstream goes red.

---

## Private `$derived` field written on the server

**Pinned by** `crates/rsvelte_core/tests/private_field_constructor_grid_2573.rs`
(`reproduces_upstreams_invalid_server_output`).

On the server a private `$derived` field holds a **callable** — `#f = $.derived(() => …)`, read
as `this.#f()` and written as `this.#f(v)`. Upstream's server visitor wraps the read and then
leaves the surrounding write alone, so for two shapes it emits an assignment whose target is a
call expression:

| input (`#f = $derived(this.#s * 2)`) | official | parses | rsvelte | parses |
|---|---|---|---|---|
| `this.#f += 1` | `this.#f(this.#f() + 1);` | yes | same | yes |
| `this.#f = 5` | `this.#f(5);` | yes | same | yes |
| `this.#f++` | `this.#f()++;` | **no** | same | **no** |
| `inst.#f += 1` | `inst.#f() += 1;` | **no** | same | **no** |
| `inst.#f = 5` | `inst.#f() = 5;` | **no** | `inst.#f = 5;` | yes |

The first two rows were rsvelte defects and are fixed — the read-wrapping pass classified the
operator by the byte after `this.#f`, saw `+` rather than `=`, and wrapped the assignment
*target* into `this.#f() += 1`; a plain `=` outside a constructor was the quiet half, valid
JavaScript that overwrote the callable with a number so the next read threw.

The remaining rows are **not settled the way the client entry above is**: rsvelte reproduces
upstream's invalid output for the update and the non-`this` compound rows, which the rule at the
top of this file says it should not. They are left as they are here, and tracked separately,
because unwrapping them means choosing a server lowering upstream never emits for a receiver
that is not `this` — the same decision #2483 took for the client, and it deserves its own
measurement rather than being folded into a fix for the two rows above.

### Why no gate sees it

- **Generated matrix**: it never parses either output (gate-coverage 5f), and for these cells it
  has no valid oracle at all, so `matrix/generate.mjs` compares them on the client targets only.
- **Corpus gate**: `pattern/issues/2573-ctor-private-derived-write.svelte.js` covers the two
  fixed rows on all three targets. Nothing in the collected corpus writes a private `$derived`
  field through any receiver — `known-failures.server.json` is `[]`.

---

## TypeScript class index signature

**Pinned by** `crates/rsvelte_core/tests/ts_index_signature_3422.rs`.
**Reported upstream** in `upstream_issues/3422-svelte-class-index-signature-crash.md`.

`class K { [k: string]: unknown }` makes the official compiler throw a bare
`TypeError: Cannot read properties of undefined (reading 'type')` — no `code`, no position, no
frame — from esrap's `TSIndexSignature` printer, because `remove_typescript_nodes.js` deletes the
signature's `typeAnnotation` while `ClassBody` keeps the node itself. rsvelte erases the member,
so rsvelte compiles what upstream cannot.

**This entry exists because the previous behaviour was a deliberate parity choice, and it shipped
two defects.** `2_analyze/types.rs` carried the comment *"Upstream passes these through verbatim
(a class index signature even makes it throw), so they are left exactly as written"* — locally
reasonable, and wrong, because "upstream throws" is not an output to be equal to.

### What leaving it in cost, measured

A grid of 8 index-signature spellings + 11 TypeScript-only control members × 3 class hosts
(declaration, expression, one carrying a `$state` field) × 2 entry points (instance script,
`<script module>`) × 3 targets = **342 cells**:

| | before | after |
|---|---|---|
| rsvelte output rejected by acorn | 96 | **0** |
| TypeScript left in the `.js` output | 96 | **0** |
| instance/module script silently dropped (`server`) | 48 | **0** |
| control cells clean | 198 | 198 |

The 96 client/client-dev cells emitted `class K { [k: string]: unknown }` into a `.js` artifact.
The 48 `server` cells are the more dangerous half and are **not** what the report described: the
erased script is re-parsed to classify it, that parse rejected the surviving TypeScript, and the
whole instance script was discarded — output that parses and does nothing. (#3421 made that
failure loud; this change removes its cause.)

### Why no gate sees it

- **Output-equality gates**: there is no official output at all for these inputs, so nothing to
  compare; a crash is not a `code` the error ratchets can key on either.
- **Output-parseability gate**: parses rsvelte's side only, and the `server` half parses fine
  while being empty.
- **Collected corpus**: a component with a class index signature cannot be built with the official
  compiler, so no published source can carry the shape.

---

## Dotted TypeScript namespace (`namespace N.M { … }`)

**Pinned by** `crates/rsvelte_core/tests/ts_export_type_only_declaration.rs`.
**Reported upstream** in `upstream_issues/3568-svelte-dotted-namespace-crash.md`.

A namespace whose name is dotted makes the official compiler throw a bare
`TypeError: node.body.body.map is not a function` — no `code`, no position, no frame — because
`remove_typescript_nodes.js` assumes a `TSModuleDeclaration`'s `body` is a `TSModuleBlock`, while
for the dotted spelling it is another `TSModuleDeclaration`. rsvelte compiles it.

### What rsvelte does instead, and why that particular behaviour

`namespace N.M { … }` is the source spelling of `namespace N { namespace M { … } }`, and upstream
compiles the nested spelling correctly: the type-only body is stripped, and a value in it raises a
coded `typescript_invalid_feature` positioned on the inner `namespace M { … }`. rsvelte therefore
treats the dotted form **as its desugaring**, so both halves of upstream's own behaviour on the
nested form carry over:

| source (instance script or `<script module>`, `lang="ts"`) | official | rsvelte |
|---|---|---|
| `namespace N.M { type T = 1; }` | `TypeError` | stripped |
| `namespace N.M.O { type T = 1; }` | `TypeError` | stripped |
| `namespace N.M { }` | `TypeError` | stripped |
| `namespace N.M { let x = 1; }` | `TypeError` | `typescript_invalid_feature` |
| `namespace N { namespace M { let x = 1; } }` | `typescript_invalid_feature` | same |

Before this entry, the parse conversion dropped the dotted body without looking at it (the nested
declaration is not a `TSModuleBlock`), so the value case was accepted too — rsvelte was silently
more permissive than the desugaring it now follows.

The alternative — reproduce the crash — is available and was rejected: a raw exception carries no
code and no span, so there is nothing for the error ratchets to be equal to, and every consumer
that embeds the compiler (the language server, `rsvelte-check`, the Vite plugin) would surface an
uncoded panic instead of a diagnostic.

### Why no gate sees it

- **Output-equality and error gates**: official produces neither output nor a coded error, so the
  comparison key is empty on one side.
- **Collected corpus**: a component with a dotted namespace cannot be built with the official
  compiler at all, so no published source carries the shape.
- **Output-parseability gate**: rsvelte's output is valid JavaScript either way — the divergence is
  whether the input is accepted, which that gate does not ask.

---

## Module `$inspect(…).with(fn)` in a declarator initializer

**Pinned by** `crates/rsvelte_core/tests/module_inspect_slot_3611.rs`
(`an_inspect_with_declarator_keeps_its_binding_and_value`).
**Reported upstream** in `upstream_issues/svelte-inspect-with-in-a-declarator.md`.

Official omits `'$inspect().with'` from the rune allow-list used by both client and server
`VariableDeclaration` visitors. The outer call therefore bypasses the inspect visitor and falls
through to a state-shaped declarator path:

| target | official | rsvelte |
|---|---|---|
| client prod/dev | drops the declarator, leaving later `t` reads free | keeps `const t = undefined` in prod and the `$.inspect(...)` result in dev |
| server prod/dev | emits `const t = fn`, binding the inspector instead of the rune result | keeps `const t = undefined` in prod and the inspector call result in dev |

Both official outputs parse, so this is not covered by the invalid-JavaScript exception alone.
They are nevertheless runtime-wrong: the client turns a declared local into a `ReferenceError`,
and the server changes the value from the callback's return value (or `undefined` in prod) to the
callback function itself. rsvelte keeps the semantics of the same rune in every other expression
slot. Exported declarators follow the same decision.

No collected corpus source binds an inspect rune's result, and the #3611 generated slot grid
compares official output rather than evaluating the later reference. Remove this entry and change
the eight pinned expectations to byte parity when upstream includes `'$inspect().with'` in both
declarator allow-lists.

---

## CSS custom-property block values

**Pinned by** `crates/rsvelte_core/tests/css_custom_property_block_3052.rs`.
**Reported upstream** in `upstream_issues/3052-svelte-css-custom-property-brace-block.md`.

CSS custom properties accept the `<declaration-value>` grammar, including balanced `{}` and `[]`
blocks. The official compiler instead parses their values with the ordinary declaration-value
scanner and raises `css_expected_identifier` at the first `{`. Browsers and general CSS parsers
accept the value.

rsvelte preserves balanced custom-property blocks and the declarations following them. It does
not extend that grammar to ordinary properties, which keep the existing rejection. This is an
intentional error-presence divergence: rejecting valid CSS changes the component's available
styles, so it is not a byte-only parity choice.

---

## Awaited `autofocus` and event attributes (client)

**Pinned by** `crates/rsvelte_core/tests/async_autofocus_event_3651.rs`.
**Reported upstream** in
`upstream_issues/3651-svelte-async-autofocus-and-event-output-is-unparseable.md`.

With `experimental.async: true`, official Svelte 5.56.10 emits
`$.autofocus(input, await p)` and puts `(await p)?.apply(...)` inside a plain
event-handler function. Both are syntax errors because neither containing function
is async. rsvelte routes only the awaited cases through a local `Memoizer`, so the
await remains inside an async value thunk and the runtime call receives `$0`, the
resolved result. Synchronous output is unchanged.

The ordinary parity gates cannot observe the correction: both compilers previously
agreed, while the matrix treats unparseable official output as an oracle rejection and
aborts rather than producing a keyed divergence. Gate-coverage 5r records that blind
spot. Remove this entry and converge on upstream when its two visitors adopt an async
memoization path.

---

## A linter reports the compiler's own errors (`rsvelte-lint` exit code)

**Ratchet** `compatibility/lint-severity-known-failures.json`, the 57 `exit|…|0->1|…` entries.
**Pinned by** `scripts/dev/test-lint-severity-exit-attribution.mjs`, run in CI by the
`Corpus verify baseline-flag contract` job.

### Input

Any source the Svelte compiler rejects. The listed patterns carry 21 distinct compiler codes;
the largest are `slot_element_invalid_name` (13), `dollar_prefix_invalid` (7),
`parse-error` (5), `state_invalid_placement` (4), `legacy_export_invalid` (4) and
`animation_invalid_placement` (4). One of the smallest is the whole subject of a rule:

```svelte
<slot name={dynamic} />
```

### Both outputs, measured against `submodules/svelte` 5.56.10 and eslint-plugin-svelte 3.23.0

- `svelte.compile` **throws** `slot_element_invalid_name` — measured for all 57 patterns by the
  pin above, 57 of 57, with two valid patterns as the accepting control.
- `eslint` with `flat/recommended` reports the rule's findings and **exits 0**:
  `svelte-eslint-parser` is deliberately more permissive than the compiler, so it builds a tree
  where the compiler refuses to.
- `rsvelte-lint` merges the compiler's diagnostics into its report and **exits 1**, exactly as it
  does for any rule configured at `error`.

### Why upstream produces it

ESLint's contract is a *parser* plus rules, and `svelte-eslint-parser` is a separate project from
the compiler. A file the compiler rejects is, to ESLint, a file that parsed — so there is nothing
to report and nothing to exit non-zero about.

### Why rsvelte's form is the correct one

`rsvelte-lint` is a Svelte-specific linter with the compiler *inside* it, so "this file does not
compile" is information it has and ESLint does not. Exiting 0 on a file that cannot build would
make the linter's own verdict misleading in the one case where it matters most. It is a product
decision, not a parity defect — and the pin is what separates the two: if a future change made
rsvelte reject something the official compiler accepts, that entry becomes an over-rejection and
the check goes red naming the file.

### Why no gate saw the difference between those two readings

Every other lint gate configures an explicit rule universe and compares **findings**, so a
compiler diagnostic — which is not a `svelte/…` rule id — is outside the compared population.
The exit code is not a finding, and until gate 36 nothing compared it. Four entries that *were*
rsvelte over-rejections hid in this same bucket until then (#3127, #3128); they are fixed and no
longer listed. The count has since moved the other way — `prefer-const/22-decorated-class-method`
and `23-redeclared-let` are new entries whose sources the official compiler also rejects
(`typescript_invalid_feature` at 5:1 and `js_parse_error` at 5:5, both targets), which is why
the pin reads 57 and not 55.

---

## The default lint preset carries three rules upstream does not, and drops two

**Ratchet** `compatibility/lint-preset-known-failures.json`, all 5 entries.
**Pinned by** `crates/rsvelte_lint/tests/comment_directive.rs` (9 tests),
`crates/rsvelte_lint/src/rules/no_undef.rs` (6), `no_unused_vars.rs` (23) and
`no_companion_module.rs` (5), plus `pnpm run test:type-aware-lint` (9).

### Input

Any project linted with no configuration at all. The gate compares
`eslint-plugin-svelte`'s `flat/recommended` against `rsvelte-lint`'s `recommended`.

### Both outputs, measured by `scripts/compat-corpus/lint-preset.mjs`

Every rule both sides ship now agrees on its default severity — the 21 that did not were
an incomplete transcription and were fixed, not listed. What remains is membership:

| entry | upstream | rsvelte |
|---|---|---|
| `svelte/system` | a rule id | not a rule — the same behaviour is `suppression.rs` |
| `svelte/@typescript-eslint/no-unnecessary-condition` | a rule id | absent from the native registry |
| `svelte/no-undef` | not shipped | shipped |
| `svelte/no-unused-vars` | not shipped | shipped |
| `svelte/no-companion-module-shadow` | not shipped | shipped |

### Why upstream produces it

`eslint-plugin-svelte` runs *inside* ESLint. Comment directives are ESLint's own job, so the
plugin models them as an internal rule id; the core `no-undef` / `no-unused-vars` come from
ESLint itself with the plugin's parser feeding them; and a type-aware wrapper can assume
`typescript-eslint` is present.

### Why rsvelte's form is the correct one

`rsvelte-lint` is a single binary with no ESLint underneath it. It must carry the core checks
or leave them unavailable, and it implements directives as a mechanism rather than a rule
because there is no rule pipeline to hang them on. The type-aware wrapper's counterpart lives
in the out-of-workspace `rsvelte_lint_types` crate, which needs a running `tsgo` — a scope
boundary, not a missing feature.

### Why no gate sees it

`scripts/compat-corpus/lint-universe.mjs` **intersects** the two rule lists before any
finding-level comparison, so a rule only one side ships is never enabled during a comparison.
All five are invisible to the other eight lint gates by construction, which is why this gate
keys on membership at all. The first version keyed on membership *alone* and reported 29
differences; adding severity to the key took it to 50 and surfaced the 21 real ones.

---

## A `$props()` line comment keeps the separator slot the compiler reads

**Ratchet** `compatibility/fmt-oracle-excluded.json`, the three
`pattern/issues/3515-props-*-line-comment.svelte` entries.
**Pinned by** `compatibility/pattern-corpus/issues/3515-props-default-line-comment.svelte`,
`compatibility/pattern-corpus/issues/3515-props-plain-line-comment.svelte` and
`compatibility/pattern-corpus/issues/3515-props-rest-line-comment.svelte`, which the
compiler's own output-equality gate compiles on all four targets.

### Input

```svelte
<script>
	let { a } =
		// why the default is what it is
		$props();
</script>
```

### Both outputs

- `oxfmt(svelte: true)` — prettier for the Svelte structure — keeps the comment as a **leading
  separator** of the initializer and inserts a blank line before it.
- `rsvelte-fmt` — oxc for the embedded JS — attaches the same comment **after** the initializer
  expression.

Both are valid JavaScript and both round-trip. They differ in which slot the comment occupies.

### Why rsvelte's form is the correct one here

The slot is not cosmetic: #3515 is a compiler defect whose repro depends on the comment sitting
between the declarator and its `$props()` initializer. Moving it to prettier's slot makes the
three repros stop reproducing what they exist to reproduce, so matching the oracle here would
cost a compiler gate to buy a formatter gate. The formatter follows oxc for embedded JavaScript
by design (see the section below); this is one instance of that decision, not a separate one.

---

## The formatter's JavaScript engine is oxc, not prettier

**Ratchet** `compatibility/fmt-oracle-excluded.json`, the four `flowbite-svelte/…` entries.
**Pinned by** `crates/rsvelte_formatter/tests/expression.rs` and
`crates/rsvelte_formatter/tests/css_native.rs`, which assert oxc's own line-breaking and CSS
output rather than prettier's.

### Input

Long expressions in Svelte positions — a ternary inside a `class=` attribute, an IIFE whose
arrow takes one parameter, a template literal's `${}` inside `<script>`, and an `{#if}` header
holding `unique && value.some(…)` beside a member chain.

### Both outputs, measured by `scripts/compat-corpus/fmt.mjs`

Four different break points, all valid, none reachable from the other by changing the print
width: the oracle breaks a ternary's **condition** at `===`, the arrow's **parameter list**, and
**only** the inner member chain in the `{#if}` header; `oxc_formatter` breaks the nested
conditions, the IIFE's **call argument**, and the `&&` / call-args respectively.

### Why rsvelte's form is the correct one

`rsvelte-fmt` formats embedded JavaScript with `oxc_formatter` on purpose — it is the same
engine `oxfmt` uses for standalone JavaScript, and the whole point of the port is not to carry
prettier. Reproducing prettier's break priorities would mean re-implementing prettier's
`Doc` algebra inside the oxc printer for the Svelte path only, and the two would then disagree
with each other on the same JavaScript depending on whether it sat in a `.js` file or a
`<script>` block — which is the defect shape the oracle itself already has (`oxfmt x.css` and
`oxfmt --svelte` print the same custom property differently).

### Why no gate sees it

The formatter-parity gate compares against `oxfmt(svelte: true)`, whose JavaScript comes from
prettier; the svelte.dev formatter gate is a hard gate with no tolerance and would fail on any
of these, which is why they are excluded rather than listed. Nothing in the tree compares
`rsvelte-fmt`'s JavaScript against `oxfmt`'s **standalone** JavaScript, where the two agree —
that comparison would show the divergence is the oracle's inconsistency and not rsvelte's.

---

## The formatter declines an input its own parser rejects

**Ratchet** `compatibility/fmt-oracle-excluded.json`, the four `invalid-input` entries and the
two `migrate` entries.
**Pinned by** `compatibility/pattern-corpus/adversarial/css/rejected-global-keyframes-selector.svelte`
and `crates/rsvelte_formatter/tests/style_block.rs`.

### Input

Four inputs no compiler accepts — a snippet parameter written `c?: number = 5` (TS1015),
snippet rest parameters (`snippet_invalid_rest_parameter`), `h1:nth-of-type(+12)` and
`:global(@keyframes shared)` (`css_expected_identifier`, #3120) — and two Svelte 4→5 **migrator
outputs**, which use `let:` directives and `slot=` attributes.

### Both outputs

`prettier-plugin-svelte` formats all six: it validates nothing beyond its own parse. `rsvelte-fmt`
reports the parse error, or falls back to emitting the block verbatim where the CSS parser is the
one that refuses.

### Why rsvelte's form is the correct one

A formatter that rewrites a file its own compiler cannot compile is a formatter that can silently
change the meaning of code nobody can check. Falling back to the source is the conservative
answer. The migrator outputs are a scope statement rather than a behaviour: this repository is a
Svelte 5 compiler port and `Migrate 0/76` is recorded as out of scope, so a Svelte 4 construct is
not an input `rsvelte-fmt` is required to format.

### Why no gate sees it

The parity gate's unit is (source, oracle output); an input the subject declines has no output to
compare, so the pair can only be excluded or scored as a failure. Excluding it is what keeps the
gate's remaining population meaningful — and the exclusion list is shrink-only in both
directions, so an entry that starts formatting fails the run.
## A formatter difference the compiler cannot see

**Ratchet** `compatibility/fmt-oracle-excluded.json`, five `oracle-bug` entries:
`await-then-destruct-array-nested-rest`, `block-expression-assign`,
`whitespace-after-script-tag`, `whitespace-after-style-tag`, `textarea-end-tag`.
**Pinned by** `crates/rsvelte_formatter/tests/render_neutral_divergences.rs`.

### Input

An array pattern with elisions (`...[,, c, ...{ length }]`), an assignment used as a
`{@const}` body (`{@const y = h = 0}`), a `<script>` and a `<style>` whose close tag carries
whitespace and newlines before `>` (`</script     \n\n>`), and a `<textarea>` whose close tag is
split the same way.

### Both outputs

| entry | `oxfmt(svelte: true)` | `rsvelte-fmt` |
|---|---|---|
| elisions | `...[, , c, ...{ length }]` | `...[,, c, ...{ length }]` |
| `{@const}` | `{@const x = h = 0}` | `{@const x = (h = 0)}` |
| `</script   >` | rewritten to `</script>` | preserved verbatim |
| `</style   >` | rewritten to `</style>` | preserved verbatim |
| `</textarea` split | the tail is deleted | the element is closed |

### Why rsvelte's form is the correct one

It is not a claim about which text reads better: **each pair compiles to byte-identical output**.
Both texts of all five were run through
`submodules/svelte/packages/svelte/src/compiler/index.js` for `generate: 'client'` and
`'server'`, and `js.code` and `css.code` are equal on every one of the four comparisons. The
divergence is therefore invisible to every consumer of the file, and rsvelte's side of it is the
one its own engines produce — `oxc_formatter` for the JavaScript, and the source text for a close
tag it has no reason to rewrite.

The recorded justifications for all five claimed a *semantic* loss (a dropped nested rest, an
unclosed paren, a discarded `<script>` body). Re-measured on 2026-08-31, none of them reproduces:
the bodies survive, the patterns survive, and the outputs agree. A sixth entry filed the same way,
`textarea-content`, now matches the oracle byte-for-byte and has been removed from the list
outright.

### Why no gate sees it

The formatter-parity gate's unit is (source, oracle text) and its verdict is byte equality, so it
cannot ask whether two texts mean the same program — the one question that separates these five
from a real defect. Nothing in the tree compiles both sides of a formatter divergence; the
measurement above had to be written for this row.

---

## The formatter's CSS engine is oxc, not prettier's PostCSS

**Ratchet** `compatibility/fmt-oracle-excluded.json`, three `oracle-bug` entries: `css-vars`,
`svelte.dev .../docs/[topic]/[...path]/+layout.svelte`, and
`pattern/adversarial/css/css-custom-property-values`.
**Pinned by** `crates/rsvelte_formatter/tests/css_native.rs`.

### Input

One declaration block carrying an empty custom-property value (`--bar:   !important`), a bracket
value (`--arr: [1, 2]`), a selector-shaped value (`--sel: a > b ~ c`), and a nested `calc()` with
a parenthesized subtraction group.

### Both outputs, measured on the same bytes

| | `--bar` | `--arr` | `--sel` | nested `calc()` group |
|---|---|---|---|---|
| `oxfmt x.css` | `--bar: !important;` | `[1 , 2]` | `a > b ~ c` | kept inline |
| `rsvelte-fmt x.css` | `--bar: !important;` | `[1 , 2]` | `a > b ~ c` | kept inline |
| `oxfmt(svelte: true)` | `--bar:    !important;` | `[1, 2]` | `a > b ~c` | broken onto its own lines |

### Why rsvelte's form is the correct one

`rsvelte-fmt` reproduces **oxfmt's own standalone CSS output byte-for-byte**, on all four. The
oracle is the same tool answering differently, because its Svelte path prints embedded CSS through
prettier's PostCSS printer while its `.css` path uses the oxc engine — the engine `rsvelte-fmt`
also uses, on purpose. Parity against the Svelte path is therefore undefined: matching it would
put `rsvelte-fmt` in disagreement with `oxfmt` on the same CSS depending only on whether it sat in
a `.css` file or a `<style>` block, which is the defect the oracle already has. `a > b ~c` is also
a token-stream change in a value that may be substituted, so the Svelte path is the side that
moves meaning.

### Why no gate sees it

The parity gate compares against exactly one of the oracle's two answers and has no notion of the
other, so a divergence caused by the oracle's own inconsistency is indistinguishable from an
rsvelte defect. The comparison that separates them — `rsvelte-fmt` against `oxfmt <file>.css` —
exists nowhere in the tree; the table above had to be measured for this row.

---

## SCSS serialisation from the `grass` backend

**Pinned by** `crates/rsvelte_preprocess/tests/grass_serialisation.rs`.
**Not reported upstream**, because these are not defects on either side: dart-sass and `grass`
both emit valid CSS with the same computed effect.

`rsvelte_preprocess` compiles SCSS with the Rust `grass` crate rather than by shelling out to
dart-sass, which is what makes the preprocessor usable from a Rust host at all. The two
serialise the same stylesheet differently in four ways:

- a computed colour prints in the legacy shortest form (`#e9e9e9`) where dart-sass ≥ 1.79
  prints the space its channels were computed in (`rgb(91.3333333333%, …)`);
- a `/* … */` following a declaration moves to its own line;
- a wrapped selector list inside `@media` keeps the block indentation only on its first line;
- whitespace and quote style differ in a handful of places.

**155 of the 315 units in `scss-known-failures.json` are exactly this**, and the number is
measured rather than eyeballed: both outputs are flattened to an ordered list of
`(selector chain, property, value)` with colours folded to one `rgba()` spelling, and the two
lists are equal. The remaining 160 are not covered by this entry — 59 change the cascade and 99
are inputs `grass` rejects, each attributed to a report under `upstream_issues/`.

They stay **listed in the ratchet rather than normalised away**. The gate exists to catch a
divergence in colour *arithmetic*, and a normaliser that folded every colour spelling would
fold that too — which is the same argument as `sourcemap-known-failures.md`'s: a rule that
repairs a class of output cannot then be used as evidence about that class. Listing them costs
155 lines that never move; normalising them would cost the gate its subject.

The pin records dart-sass's output beside each assertion, so a `grass` release that converges
turns the test red and this entry gets deleted rather than quietly becoming false. It also
carries the two non-neutral classes, for the same reason.

---

## `abstract` on a class property (and therefore in the `parse()` AST)

**Pinned by** `crates/rsvelte_core/tests/parse_abstract_class_member.rs`
(`an_abstract_property_is_still_dropped`).
**Reported upstream** in `upstream_issues/3082-svelte-abstract-property-not-erased.md`.

### Input

`A.svelte`, `generate: 'server'` (the target makes no difference):

```svelte
<script lang="ts">
	abstract class B {
		abstract kind: string;
	}
	const b = 1;
</script>

<p>{b}</p>
```

### Output

Official (`submodules/svelte/packages/svelte/src/compiler/index.js`) erases the accessibility
modifier and the type annotation but leaves the `abstract` keyword, so the class body carries two
adjacent identifiers:

```js
	class B {
		abstract kind;
	}
```

rsvelte erases the member:

```js
	class B {}
```

`acorn.parse(…, { ecmaVersion: 'latest', sourceType: 'module' })` on the two outputs:

```
official: acorn REJECTS — Unexpected token (5:11)
rsvelte: acorn ACCEPTS
```

### Why the divergence extends to `parse()`

Official keeps the abstract `PropertyDefinition` in the AST, which is where the un-erased keyword
comes from. rsvelte drops it at parse, so `parse()` diverges too — its `ClassBody.body` is one
member shorter. Matching the AST alone would leave the erased output diverging on purpose while
the tree agreed, which is the state hardest to explain to the next reader; the two halves are one
decision. An abstract **method** is a different case and rsvelte does match it: official drops
that member from the compiled output, so emitting it in the AST costs nothing downstream.

No gate observes either half. There is no abstract property in any of the 33,776 `.svelte` files
of the collected corpus (measured — `ClassBody.body[]#length` went stale on the run that emitted
abstract methods), and the one real-world carrier,
`bits-ui/packages/bits-ui/src/lib/bits/accordion/accordion.svelte.ts:97`
(`abstract readonly isMulti: boolean;`), is a `.svelte.ts` module that `scripts/compat-corpus/compile.mjs`
strips with esbuild before either compiler sees it. So the shape reaches no population, on either
gate, today.

Delete this entry when upstream erases the keyword.

---

## Completion `kind` for a `const`, and the `kindModifiers` filter it disables (language server)

**Pinned by** `scripts/compat-lsp/tsgo-completion-kind.test.mjs`, which asserts the shape of
**tsgo's own** response, not rsvelte's — the entry has to be removed when tsgo changes, and a
test on rsvelte's output would keep passing after that.
**Reported upstream** in
`upstream_issues/tsgo-lsp-completion-item-omits-the-typescript-kind.md`.

Official `svelte-language-server` reads completions from the TypeScript API and maps
`ScriptElementKind` to an LSP kind in `plugins/typescript/utils.ts`
(`scriptElementKindToCompletionItemKind`): `const` becomes `CompletionItemKind.Constant`,
`let`/`var` become `Variable`. rsvelte's TypeScript features instead proxy a child `tsgo`
LSP server, whose items carry neither `ScriptElementKind` nor `kindModifiers`.

Measured directly on both backends at the same position of the same `.ts` file
(`tsgo` 7.0.0-dev.20260703.1, `typescript` 6.0.3, 1071 items each):

| declaration | TypeScript API | `tsgo --lsp` |
|---|---|---|
| `const aConst = 1` | `kind: "const"`, `kindModifiers: ""` | `kind: 6` (Variable) |
| `let aLet = 2` | `kind: "let"` | `kind: 6` |
| `var aVar = 3` | `kind: "var"` | `kind: 6` |
| `declare const aDeclared` | `kind: "const"`, `kindModifiers: "declare"` | `kind: 6`, no `kindModifiers` |
| `function aFunction() {}` | `kind: "function"` | `kind: 3` (Function) |
| `class AClass {}` | `kind: "class"` | `kind: 7` (Class) |

Three `ScriptElementKind`s collapse into one LSP kind, and `kindModifiers` is absent from all
1071 items. The `function`/`class`/`enum` rows are the positive control: tsgo does emit kinds,
so the collapse is a lost distinction rather than a degraded response.

Through the two servers on `fixtures/completion-script-null`
(`<script>co¦nst a = true</script><p>test</p>`), this surfaces as exactly three items —
`a`, `name` and `CompletionScriptNull` — where official answers `Constant` and rsvelte answers
`Variable` while every other compared field, `sortText` included, is equal.

The second half is the deliberate one. `CompletionProvider.ts`'s `isNoSvelte2tsxCompletion`
drops an item whose `kindModifiers` is `declare` and whose label is in its `svelteTypes` list;
`tsgo_completion.rs`'s port leaves that arm unported, because without `kindModifiers` the
condition degrades to a bare name match and would drop a user's own `SvelteStore`. Losing a
correct completion is worse than keeping a spurious one, so the narrower filter is kept.

Neither half is reachable by porting: rsvelte proxies tsgo rather than porting upstream's
`typescript-plugin` (tsgo has no plugin API), so the information does not exist on this side.
The LSP gate does observe the divergence, but not as a kind divergence — `diff.mjs`'s
`identity()` digests `kind` into the pairing key, so a differing kind is reported as an
unpaired extra plus an unpaired missing, which reads like two absent items.

Do **not** widen this entry to the five other kind divergences in the same suite
(`Variable -> Property` on `navigation`/`orientation`/`top`, `Keyword -> Property` on
`var`/`continue`). Those are in `css-smoke-completion-interpolation` and
`html-smoke-completions`, where rsvelte's own HTML/CSS completions fall through to `Property`;
they are rsvelte-side defects and are not covered here.

Remove this entry when `tsgo --lsp` carries the TypeScript kind — the pinned test fails at that
point, and both halves become ordinary parity work.
