# A self-named `class:` directive reaches `$.attributes` untransformed on the server

When an element carries a spread attribute, the server transform passes a `class:` directive
whose value is the identifier of the same name straight through, with no read transform. A
`$derived` therefore arrives as the derived **function**, which is always truthy, so SSR emits
the class unconditionally. The same compiler's client output reads the value correctly.

## Reproduction

```svelte
<script>
	let { to } = $props();
	let active = $derived(to === "x");
	let rest = { id: 'r' };
</script>

<a class:active {...rest}>t</a>

<style>
	.active { color: red }
</style>
```

`compile(source, { generate: 'server' })` (Svelte 5.56.10, source entry point
`packages/svelte/src/compiler/index.js`):

```js
	let active = $.derived(() => to === "x");
	let rest = { id: 'r' };

	$$renderer.push(`<a${$.attributes({ ...rest }, 'svelte-1lj1c2j', { active })}>t</a>`);
```

`active` is `$.derived(…)`'s return value — a function — and `$.attributes` tests the class map
for truthiness, so `class="… active"` is rendered even when `to !== "x"`.

`compile(source, { generate: 'client' })` on the same input reads it:

```js
	[$.CLASS]: { active: $.get(active) }
```

so the two targets of one compiler disagree about what the directive means, and the client is
the one that is right.

## Cause

`phases/3-transform/server/visitors/shared/element.js`, `prepare_element_spread`:

```js
	if (class_directives.length) {
		const properties = class_directives.map((directive) =>
			b.init(
				directive.name,
				directive.expression.type === 'Identifier' && directive.expression.name === directive.name
					? b.id(directive.name)
					: transform(
							/** @type {Expression} */ (context.visit(directive.expression)),
							directive.metadata.expression
						)
			)
		);

		classes = b.object(properties);
	}
```

The first arm skips `transform` entirely. `build_attr_class` — the path taken when the element
has **no** spread — has no such arm and always transforms, which is why the defect needs the
spread to appear.

## The axis, measured

168 cells (directive form × what the value is × spread present × target), diffed against the
official compiler. Four diverge, all of them `$derived` with a spread on the server:

| form | value | spread | server |
|---|---|---|---|
| `class:active` | `$derived` | yes | **`{ active }`** — uncalled |
| `class:active={active}` | `$derived` | yes | **`{ active }`** — uncalled |
| `class:on={active}` | `$derived` | yes | `{ on: active() }` — transformed |
| `class:active` | `$derived` | no | `$.attr_class(…, { 'active': active() })` — transformed |
| any form | `$state` / `const` / prop / legacy `let` / `export let` / `$:` | either | transformed |

Two things the shape of the condition decides. It is keyed on the **expression**, not on the
syntax: `class:active={active}` satisfies it exactly as the shorthand does, and diverges
identically — a fix keyed on "was this written shorthand" would leave the explicit form wrong.
And it fires only for a value whose *read* differs from its identifier, which in practice means
`$derived`; every other binding kind reads as its own name on the server, so the two arms of the
conditional produce the same text and the defect is invisible.

Suggested fix: transform the value in both arms, as the client's `ClassDirective` handling does.

## Why rsvelte matches it

rsvelte emitted `{ active: active() }` — the value the client agrees with, and the one that
renders the class only when the condition holds. It now reproduces upstream's output, because
byte equality with the official compiler is this project's goal (`AGENTS.md` goals #1 and #3)
and the documented exception is only for output no JS parser accepts; this output parses.

Deviating in rsvelte's favour would create the opposite hazard: a component whose SSR markup is
correct under rsvelte and gains a spurious class the moment it is compiled by the official
compiler. That population — code written against rsvelte — is not one any collected corpus can
measure, while the population this defect harms is already broken under official today.

`crates/rsvelte_core/tests/class_directive_shorthand_spread_4117.rs` pins the conformance and
turns red if this is fixed upstream.

Tracked in rsvelte issue #4117.
