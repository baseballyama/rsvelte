# `svelte/no-goto-without-base` throws on a namespace import of `$app/paths`

**Package:** `eslint-plugin-svelte` (version pinned by
`scripts/compat-corpus/lint-oracle/package.json`)
**Rule:** `svelte/no-goto-without-base`
**Symptom:** the rule throws, so ESLint reports a fatal error for the file and
produces no findings from any rule in that run.

## Reproduction

Three lines, in a project where `@sveltejs/kit` resolves (the rule is
SvelteKit-gated, so it is silent elsewhere):

```svelte
<script>
  import * as p from "$app/paths";
  const u = p.base;
</script>
<p>{u}</p>
```

```
Cannot read properties of undefined (reading 'range')
Occurred while linting …/E.svelte:1
Rule: "svelte/no-goto-without-base"
```

## What is minimal, and what is not

Narrowed by four controls:

| input | result |
|---|---|
| `import * as p from '$app/paths'` + a read of `p.base` | **throws** |
| `import * as p from '$app/paths'` + a read of `p.assets` | ok |
| `import * as p from '$app/paths'`, no member read | ok |
| `import { base } from '$app/paths'` + `goto(base + '/x')` | ok, 0 findings |

So it is the **namespace import combined with a `.base` member read**, and
`goto` is not involved: the crashing file above contains no `goto` call at all.

## Mechanism

`lib/rules/no-goto-without-base.js`:

```js
// line 28 — runs before the goto loop, so every file reaches it
const basePathNames = extractBasePathReferences(referenceTracker, context);

// line 92
function extractBasePathReferences(referenceTracker, context) {
  const set = new Set();
  for (const { node } of referenceTracker.iterateEsmReferences({
    '$app/paths': { [ReferenceTracker.ESM]: true, base: { [ReferenceTracker.READ]: true } }
  })) {
    const variable = findVariable(context, node.local);   // ← line 102
    ...
```

For a named import (`import { base } from '$app/paths'`) `iterateEsmReferences`
yields the `ImportSpecifier`, which has a `.local`. For a namespace import it
yields the **`MemberExpression`** `p.base` instead, which has no `.local`, so
`findVariable` is called with `undefined` and dereferences `.range` on it.
`p.assets` does not throw because `assets` is not in the traced shape, so no
reference is yielded.

`extractBasePathReferences` is called unconditionally at line 28, before the
`goto` reference loop, which is why the crash does not need a `goto` call.

## Why this matters here rather than being just an upstream bug

The differential lint gates in this repository use the live plugin as their
oracle. A file the oracle cannot lint is **uncomparable**: `run.mjs` reports it
as `fatal` and the pattern is dropped rather than compared. So whatever rsvelte
does with this shape is ungated, in both directions, and will stay ungated for
as long as the crash exists.

What rsvelte currently does, measured on the `goto` form of the same file:

```svelte
<script>
  import { goto } from '$app/navigation';
  import * as paths from '$app/paths';
  goto(paths.base + '/x');
</script>
```

rsvelte reports `no-goto-without-base` ("url that isn't prefixed with the base
path") and `no-navigation-without-resolve` at 4:7, and does not crash.

**That report is correct, and an earlier draft of this note claimed otherwise.**
It is tempting to reason that the argument *is* prefixed with `base` — merely
reached through the namespace object — and that `extractBasePathReferences`
exists precisely to collect those identifiers, so upstream would have stayed
silent had it not thrown. Both halves of that are wrong. `checkBinaryExpression`
(lines 52-56) reports when `path.left.type !== 'Identifier'` **before** it
consults `basePathNames` at all, and `extractBasePathReferences` only ever adds
`reference.identifier` values whose `type === 'Identifier'` — so a
`MemberExpression` could never have been in the set to match. `checkTemplateLiteral`
is the same shape via `extractStartingIdentifier`, which returns `undefined` for
anything that is not an `Identifier`.

So the crash masks **no** rsvelte defect: rsvelte's behaviour on this input is
what upstream would produce if it ran. What is still true, and is the reason to
file: the shape is **uncomparable by the corpus gate** in either direction,
because the oracle emits `fatal` for any `no-goto-without-base` file containing a
`$app/paths` namespace import. It is covered here by unit tests in
`crates/rsvelte_lint/src/rules/no_goto_without_base.rs`
(`named_base_import_prefixes`, `namespace_base_member_is_not_a_prefix`) rather
than by a pattern file, since a pattern would only add a permanently-dropped
entry.
