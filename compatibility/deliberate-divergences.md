# Deliberate divergences from the official compiler

Output must match the official compiler exactly, because upstream is the specification.
That rule does not extend to reproducing bytes that are **not valid JavaScript**: a module
that no parser accepts is a defect a byte match cannot pay for. Where the two conflict,
correctness wins.

This file is the whole list. It is prose, not a ratchet — the divergences here are ones no
gate observes, which is exactly why they need writing down: an unobserved surface plus a
locally plausible reason ("we should match upstream", normally correct) is how a future
contributor reintroduces a parse error while believing they are improving parity. Every
entry below is pinned by a test, so the choice is enforced and not merely described.

Before adding an entry, run both compilers. "Deliberate" is a claim about which side is
wrong, and a record that asserts it without the outputs converts an open question into a
settled one.

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
