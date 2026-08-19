# `svelte/shorthand-directive`'s `prefer: "never"` autofix drops a directive modifier

In `prefer: "never"` mode the rule expands a shorthand directive to its long
form by inserting `={name}` after the directive **name**, not after the
directive **key**. A key can carry modifiers (`style:color|important`), and the
name node stops before them, so the value is inserted *between* the name and the
modifier list. The result still parses, and the modifier is silently lost.

`packages/eslint-plugin-svelte/src/rules/shorthand-directive.ts:51-61`
(v3.23.0):

```ts
function reportForNever(
	node: AST.SvelteBindingDirective | AST.SvelteClassDirective | AST.SvelteStyleDirective
) {
	context.report({
		node,
		messageId: 'expectedRegular',
		*fix(fixer) {
			yield fixer.insertTextAfter(node.key.name, `={${node.key.name.name}}`);
		}
	});
}
```

`node.key.name` is the bare identifier. For `style:color|important`,
`svelte-eslint-parser` gives:

| node | range | text |
|---|---|---|
| the directive | `[5, 26]` | `style:color\|important` |
| `node.key` | `[5, 26]` | `style:color\|important` |
| `node.key.name` | `[11, 16]` | `color` |

so the insertion lands at offset 16 rather than 26.

## Reproduction

```svelte
<!-- eslint svelte/shorthand-directive: ["warn", { "prefer": "never" }] -->
<script>
	let color = 'red';
</script>

<div style:color|important>shorthand with modifier</div>
```

`eslint --fix` produces:

```svelte
<div style:color={color}|important>shorthand with modifier</div>
```

## Why this is worse than an unparseable fix

The output parses, so no syntax check catches it — and the Svelte compiler does
not merely ignore the stray `|important`, it folds it into the property value.
`svelte/compiler` `compile(..., { generate: 'client' })` on the two versions:

| source | generated |
|---|---|
| `<div style:color\|important>` | `$.set_style(div, '', {}, [{}, { color }]);` |
| `<div style:color={color}\|important>` | `$.set_style(div, '', {}, { color: 'red\|important' });` |

The first form sets `color` in the `!important` bucket. After the fix the
declaration is no longer important **and** its value is the invalid CSS token
`red|important`, so the browser drops the declaration entirely. A layout-category
autofix has changed what the component renders.

`parse(src, { modern: true })` confirms where the text goes: the fixed element
has a single `StyleDirective` named `color` with `modifiers: []`, and the
`|important` text has become part of the directive's value sequence.

## Positive control

The rule is right whenever the key has no modifiers. `bind:value` →
`bind:value={value}` and `class:active` → `class:active={active}` are produced
correctly by both upstream and rsvelte in the same file
(`compatibility/lint-adversarial/shorthand-directive/16-never-mode-modifiers.svelte`),
so the failure is the `node.key.name` range and not the rule's report or its
`prefer: "never"` arm.

The opposite direction is unaffected: `prefer: "always"` uses
`getAttributeValueQuoteAndRange` and removes from the `=` onwards, which leaves
the modifier where it is.

## Desired upstream behavior

Insert after `node.key` (or after the last modifier) instead of after
`node.key.name`:

```ts
yield fixer.insertTextAfter(node.key, `={${node.key.name.name}}`);
```

## What rsvelte does instead

`crates/rsvelte_lint/src/rules/shorthand_directive.rs` inserts at the end of the
directive node, producing `style:color|important={color}` — which parses to a
`StyleDirective` with `modifiers: ["important"]`, identical to the input's
semantics. This is the only divergence rsvelte carries on this rule, listed in
`compatibility/lint-adversarial-fix-known-failures.md`.
