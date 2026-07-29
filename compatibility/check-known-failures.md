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

## Current baseline: 16 entries / 24 surplus diagnostics (all FP, 0 FN)

Every entry is a **false positive** and every one of them is an open issue from
the #1883–#1889 cluster. That is the point of the seed: the gate lands *before*
the fixes so each fix shows up as a ratchet shrink instead of a claim.

| Scenario | Entries | Diagnostics | Issue | Class |
|---|---|---|---|---|
| `sibling-paths-alias` | 1 | 1 | #1883 | `paths`-aliased sibling resolves to ambient `*.svelte` |
| `sibling-symlink` | 1 | 1 | #1883 (same class) | bare-specifier deep `.svelte` import through a `node_modules` symlink |
| `external-self-alias` | 1 | 1 | #1887 | external shadow keeps its own alias specifiers unrewritten |
| `ts-aliased-import` | 2 | 2 | #1888 | plain `.ts` importers get no alias rewrite |
| `kit-hooks-arrow-ts` | 5 | 9 | #1886 | arrow-const hooks are not augmented |
| `kit-hooks-js` | 5 | 9 | #1886 | same, JS/JSDoc flavour |
| `boundary-elements` | 1 | 1 | #1889 | vendored `svelte-jsx-v4` shim predates `svelte:boundary` |

### `sibling-paths-alias` — #1883

```
sibling-paths-alias|+ERROR src/consumer.svelte:1 2614
```

`import SurveyOptions, { type WithOther } from '$libs/components/…'` where
`$libs/*` is a plain `paths` mapping onto a sibling workspace package with no
`node_modules` entry. rsvelte's sibling discovery walks `node_modules` symlinks,
so this package is never discovered, no shadow is emitted, and the import falls
back to the ambient `declare module '*.svelte'` (default-only) — hence
`TS2614 Module '"*.svelte"' has no exported member 'WithOther'`.

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

### `external-self-alias` — #1887

```
external-self-alias|+ERROR src/consumer.svelte:7 7006
```

`emit_external_shadows` never runs `rewrite_aliased_svelte_imports` on the `.tsx`
it emits, so a design-system package importing its own components through its
public alias leaves those specifiers pointing at the ambient fallback.
`ComponentProps<typeof Input>['onChange']` then cannot recover a concrete
signature and the inline callback's parameter is implicit `any`.

### `ts-aliased-import` — #1888

```
ts-aliased-import|+ERROR src/named.ts:1 2614
ts-aliased-import|+ERROR src/store.ts:8 2315
```

Only `.svelte` sources go through the svelte2tsx + alias-rewrite loop, so a plain
`.ts` file's aliased `.svelte` import is never redirected to the shadow. Both
documented flavours are covered: the named-type import (`TS2614`) and the generic
default import used as a type (`TS2315 Type 'Comp' is not generic`).

### `kit-hooks-arrow-ts` / `kit-hooks-js` — #1886

```
kit-hooks-arrow-ts|+ERROR src/hooks.client.ts:1 7031 x2
kit-hooks-arrow-ts|+ERROR src/hooks.server.ts:1 7031 x2
kit-hooks-arrow-ts|+ERROR src/hooks.server.ts:5 7031 x2
kit-hooks-arrow-ts|+ERROR src/hooks.server.ts:9 7031 x2
kit-hooks-arrow-ts|+ERROR src/hooks.ts:1 7031
kit-hooks-js|+ERROR src/hooks.client.js:1 7031 x2
kit-hooks-js|+ERROR src/hooks.js:1 7031
kit-hooks-js|+ERROR src/hooks.server.js:1 7031 x2
kit-hooks-js|+ERROR src/hooks.server.js:5 7031 x2
kit-hooks-js|+ERROR src/hooks.server.js:9 7031 x2
```

`add_hooks_type` matches only `Declaration::FunctionDeclaration`, while upstream
accepts `FunctionDeclaration | ArrowFunction | FunctionExpression`. Every hook
written as `export const … = (…) => {…}` therefore gets no parameter type and
every binding element is `TS7031`. One entry per hook declaration; the `xN`
counts the binding elements that declaration destructures (`reroute` takes only
`{ url }`, hence no suffix).

The four `kit-hooks-*` scenarios are one matrix, and only two arms are red:

| Scenario | Form | Status |
|---|---|---|
| `kit-hooks-fn-ts` | `export function` (TS) | green — the form the port already matches |
| `kit-hooks-arrow-ts` | `export const … = () => {}` (TS) | red — #1886 |
| `kit-hooks-satisfies-ts` | `satisfies` / explicit annotation / `sequence()` | green — nothing should be augmented; guards a #1886 fix against over-augmenting |
| `kit-hooks-js` | plain JS under `checkJs`, function + arrow | red — #1886, JSDoc path |

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
- **`kit-hooks-fn-ts`**, **`kit-hooks-satisfies-ts`** — see the matrix above.
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
