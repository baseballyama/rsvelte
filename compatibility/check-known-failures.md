# check-known-failures.json — why entries are accepted (svelte-check parity)

The svelte-check parity gate (`scripts/compat-corpus/check-verify.mjs`) runs every
scenario under `compatibility/check-fixtures/` through both the official
`svelte-check` (pinned in `scripts/compat-corpus/check-oracle`) and
`rsvelte-check`, and records every diagnostic that appears on exactly one side.
The ratchet may only shrink.

Entry format: `<scenario>|<+|-><SEVERITY> <relpath>:<line> <code>[ xN]`.
`+` = rsvelte-only (a **false positive** — official reports nothing).
`-` = official-only (a **false negative**).
`xN` is the multiplicity of the surplus: diagnostics are compared as a multiset,
so several diagnostics sharing one key (three binding elements in one
destructured parameter, say) cannot mask each other.

Column and message text are not part of the key on purpose — rsvelte maps
positions back through its own source map and TypeScript wording moves between
patch releases, so keying on them would make the ratchet churn without telling
anyone anything. See the header of `check-verify.mjs`.

## Current baseline: 4 entries / 5 surplus diagnostics (all FP, 0 FN)

The gate landed with 16 entries across the #1883–#1889 cluster; `sibling-paths-alias`
(#1883), `external-self-alias` (#1887), `ts-aliased-import` (#1888) and
`kit-hooks-arrow-ts` (#1886) are now fully green and have been pruned. What
remains:

| Scenario | Entries | Diagnostics | Issue | Class |
|---|---|---|---|---|
| `sibling-symlink` | 1 | 1 | #1883 (same class) | bare-specifier deep `.svelte` import through a `node_modules` symlink |
| `kit-hooks-js` | 2 | 3 | #1886 | JSDoc/JS `export function` hooks still not augmented |
| `boundary-elements` | 1 | 1 | #1889 | vendored `svelte-jsx-v4` shim predates `svelte:boundary` |

### `sibling-symlink` — same class as #1883, different trigger

```
sibling-symlink|+ERROR src/deep.svelte:1 2614
```

Found while building this gate, not previously reported. The sibling *is*
discovered here (there is a `node_modules/libs` symlink) and a shadow *is*
emitted with a `rootDirs` bridge — but `rootDirs` only applies to **relative**
specifiers, and `libs/components/survey-options.svelte` is a bare package
specifier, so the bridge never fires. The barrel arm of the same scenario
(`src/barrel.svelte`, importing through the package `exports` barrel — the shape
#782/#805 fixed) is green and must stay green.

### `kit-hooks-js` — #1886, JSDoc/JS `export function` path

```
kit-hooks-js|+ERROR src/hooks.js:1 7031
kit-hooks-js|+ERROR src/hooks.server.js:1 7031 x2
```

#1892 fixed the `const` + arrow/function-expression form (`kit-hooks-arrow-ts` is
now fully green, and so are the arrow-const hooks inside this same JS fixture —
`hooks.client.js`'s `handleError`, `hooks.server.js`'s `handleError`/
`handleFetch`). What's left is the plain `export function` form under JSDoc
(`hooks.js`'s `reroute`, `hooks.server.js`'s `handle`): still `TS7031` on every
binding element, tracked as the JSDoc/JS-path remainder of #1886.

The four `kit-hooks-*` scenarios are one matrix:

| Scenario | Form | Status |
|---|---|---|
| `kit-hooks-fn-ts` | `export function` (TS) | green — the form the port already matches |
| `kit-hooks-arrow-ts` | `export const … = () => {}` (TS) | green — fixed by #1892 |
| `kit-hooks-satisfies-ts` | `satisfies` / explicit annotation / `sequence()` | green — nothing should be augmented; guards the #1886 fix against over-augmenting |
| `kit-hooks-js` | plain JS under `checkJs`, function + arrow | red (partial) — arrow/function-expression forms fixed by #1892, plain `export function` still open |

### `boundary-elements` — #1889

```
boundary-elements|+ERROR src/Boundary.svelte:9 7006
```

The overlay unconditionally injects the vendored `svelte-jsx-v4.d.ts`, whose
hand-enumerated `IntrinsicElements` snapshot predates `svelte:boundary`, so
`onerror`'s callback parameter falls back to `any`. Official's `get_global_types`
prefers `<sveltePath>/svelte-html.d.ts` instead — porting that is Layer 3 of
#1897 and the wholesale fix for this class.

The scenario also exercises `<search>`, the other element `svelte/elements` gained
after the shim snapshot. It currently agrees on both sides and is therefore not in
the ratchet — it is here as the drift canary for the next `svelte/elements`
addition.

## Scenarios with no entries

Green scenarios are load-bearing, not filler — a regression turns them red:

- **`basic`** — the positive control. A clean component, an intentional `TS2322`,
  and a Svelte compiler warning (`state_referenced_locally`), all three matching.
  If `basic` goes red, the harness is broken, not the product.
- **`no-tsconfig`** — the regression guard for #1898 (no `--tsconfig`, so both
  checkers synthesize their own compiler options). It does **not** currently
  reproduce against the pinned `typescript@6`, whose default lib is no longer
  ES5; the ES5-default-lib shim failure #1898 describes needs an older compiler.
  Kept because the no-`--tsconfig` path is otherwise untested end to end and the
  scenario would catch the failure the moment the pin or the synthesized config
  moves.
- **`sibling-paths-alias`**, **`external-self-alias`**, **`ts-aliased-import`** —
  fixed by #1884/#1893/#1895 respectively; kept as regression guards for their
  alias-rewrite paths.
- **`kit-hooks-fn-ts`**, **`kit-hooks-arrow-ts`**, **`kit-hooks-satisfies-ts`** —
  see the matrix above.
- **`sibling-symlink` / `src/barrel.svelte`** — the cross-package shape #782/#805
  fixed.

## Burning an entry down

1. Fix the underlying issue.
2. `pnpm run test:svelte-check` — the run reports how many divergences
   disappeared.
3. `pnpm run check-corpus:update` to prune the entries, and delete the
   corresponding section here.

Entries may never be *added* to unblock a change. A new divergence means
rsvelte-check now disagrees with the official checker somewhere it previously
did not, which is the exact failure mode this gate exists to catch.
