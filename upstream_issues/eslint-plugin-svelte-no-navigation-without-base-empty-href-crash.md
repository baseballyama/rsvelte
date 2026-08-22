# `svelte/no-navigation-without-base` throws on `<a href="">`

The rule reads the first node of an `href` attribute's value list without
checking that there is one. `svelte-eslint-parser` gives an attribute written as
`href=""` an **empty** `value` array — there is no literal to represent zero
characters — so `node.value[0]` is `undefined` and the rule dereferences it.

`packages/eslint-plugin-svelte/src/rules/no-navigation-without-base.ts`
(v3.23.0, built as `lib/rules/no-navigation-without-base.js:76-80`):

```js
if (… || node.key.name !== 'href') {
    return;
}
const hrefValue = node.value[0];
if (hrefValue.type === 'SvelteLiteral') {
```

Parser evidence (`svelte-eslint-parser` 1.x):

| source | `attributes[0].value` |
|---|---|
| `<a href="">x</a>` | `[]` |
| `<a href="y">x</a>` | `[ SvelteLiteral ]` |

## Reproduction

In a project whose `package.json` depends on `@sveltejs/kit` (the rule is
disabled without it), with `svelte/no-navigation-without-base` enabled:

```svelte
<a href="">x</a>
```

```
Cannot read properties of undefined (reading 'type')
Occurred while linting …/a.svelte:1
Rule: "svelte/no-navigation-without-base"
```

`<a href="/y">x</a>` is the control: same rule, same file, no throw.

## Why it matters more than the shape suggests

An empty `href` looks like a hand-written oddity, but the rule is reachable on
text **the plugin's own autofix produces**. With the whole rule set enabled,
`svelte/no-useless-mustaches` rewrites `href={``}` to `href=""`, and the next
`--fix` pass hands that to this rule:

```svelte
<script>
	import { pushState } from '$app/navigation';
	import { base } from '$app/paths';
</script>
<a href={``}>bad</a>
```

`eslint --fix` on that file throws instead of linting it. Found by rsvelte's
whole-config autofix parity gate
(`scripts/compat-corpus/lint-adversarial-fix-all.mjs`); the pattern is
`compatibility/lint-adversarial/no-navigation-without-base/06-template-literals.svelte`.

A guard on `node.value.length === 0` is the fix; an empty `href` is not an
absolute URL and not a fragment, so the rule's own logic would report it.
rsvelte's port checks the list before indexing and reports.
