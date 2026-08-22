# `svelte/no-navigation-without-resolve` throws on `<a href="…" rel>` and `rel=""`

`hasRelExternal` reads the first node of a `rel` attribute's value list without
checking that there is one. `svelte-eslint-parser` gives an attribute written as
`rel` or `rel=""` an **empty** `value` array, so `attr.value[0]` is `undefined`
and the rule dereferences it.

`packages/eslint-plugin-svelte/src/rules/no-navigation-without-resolve.ts`
(v3.23.0, built as `lib/rules/no-navigation-without-resolve.js:187-192`):

```js
for (const attr of element.attributes) {
    if ((attr.type === 'SvelteAttribute' &&
        attr.key.name === 'rel' &&
        ((attr.value[0].type === 'SvelteLiteral' &&
```

This is the same defect as the one already reported for
[`no-navigation-without-base` on `href=""`](eslint-plugin-svelte-no-navigation-without-base-empty-href-crash.md),
in a different rule and on a different attribute — the guard added for one was
not added for the other.

## Reproduction

In a project whose `package.json` depends on `@sveltejs/kit` (the rule is
disabled without it), with `flat/recommended` — the rule is `error` there, so no
extra configuration is needed:

```svelte
<a href="/x" rel>y</a>
```

```
Cannot read properties of undefined (reading 'type')
Occurred while linting …/a.svelte:1
Rule: "svelte/no-navigation-without-resolve"
```

`<a href="/x" rel="">y</a>` throws identically. Controls, same rule and same
file shape, no throw:

| source | outcome |
|---|---|
| `<a href="/x" foo>y</a>` | one finding, no throw — a valueless attribute that is not `rel` |
| `<a href="/x" rel="noopener">y</a>` | no throw — `rel` with a value |
| `<a rel>y</a>` | no throw — `hasRelExternal` is only reached for a link with an `href` |

A `length === 0` guard is the fix; an empty `rel` does not contain `external`,
so the rule's own logic would fall through and report.

## How it was found

rsvelte's default-configuration parity gate
(`scripts/compat-corpus/lint-severity.mjs`), which is the only gate here that
drives upstream's `flat/recommended` unmodified. Every other lint gate enables an
explicit rule universe that excludes `no-navigation-without-resolve` (it needs a
type checker to compare finding-for-finding), so the rule never runs there and
never throws. The pattern is
`compatibility/lint-adversarial/no-target-blank/02-rel-dynamic.svelte`, whose
last two lines are `rel` and `rel=""`.

The consequence is larger than a skipped rule: ESLint reports the throw as a
fatal message, so the file yields **no findings at all** — every other rule's
report on it is lost — and the run exits 1.
