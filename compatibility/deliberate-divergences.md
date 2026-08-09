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
