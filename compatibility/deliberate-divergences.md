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
The same argument would extend to the constructor-root **read** — `.v` is the untracked read
and `$.get` the tracked one, so upstream's shortcut under-tracks any receiver that is not the
object under construction. rsvelte nonetheless takes upstream's form there (#2464), because
both forms parse and the correctness argument above rests on the parse column. Whether the
read should follow the update is open: **#2629**.

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
