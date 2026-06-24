# @rsvelte/svelte-check

## 0.3.3

### Patch Changes

- 5288843: svelte-check: resolve an external package's `.svelte` shadow imports from the
  package's own `node_modules`.

  A monorepo sibling's `.svelte` shadows are emitted under `<cache>/ext/<n>/`.
  Their bare-package imports (`import type { SortableOptions } from 'sortablejs'`,
  including the matching `@types/*` declarations) were resolved by walking up to
  the _workspace_ `node_modules`, missing any dependency present only in the
  external package's own tree — the imported type silently became `any`, which
  poisoned `ComponentProps<typeof Foo>` in every consumer (callback props turned
  into spurious implicit-any).

  The shadow dir now symlinks `<mirror>/node_modules` → `<real-pkg>/node_modules`,
  so bare imports resolve from the same context as in-place checking — no
  specifier rewriting, `@types` resolution intact. On a large SvelteKit app this
  cleared the cross-package `ComponentProps` cluster (25 → 10 reported errors).

- 5288843: svelte-check: scope reported diagnostics to the checked workspace, matching
  official svelte-check, eliminating two classes of false positives.

  - **Cross-package source files.** In a monorepo a sibling package pulled in
    transitively (e.g. `packages/design-system/...` resolved through a workspace
    symlink) is that package's own concern — official svelte-check only reports
    the invoked workspace's documents. rsvelte was surfacing the sibling's
    internal diagnostics (such as a `Foo.svelte` + `Foo.svelte.ts` companion's
    no-default-export edge) in every consumer's report. Diagnostics whose file
    lives outside the workspace root are now dropped; use-site errors in the
    workspace are unaffected.
  - **Raw SvelteKit route files.** A `+layout.ts` / `+page.ts` is a program root
    and was type-checked WITHOUT rsvelte's kit injection (which wraps `load` in
    `(…) satisfies …Load` so its destructured event is typed), producing false
    `implicit-any` on un-annotated `load` params. The injected mirror under
    `<cache>/svelte/…` is the authoritative version, so the raw source route
    file's pre-injection diagnostics are now dropped.

  It also always pairs the workspace source root with the `<cache>/svelte` shadow
  mirror in `rootDirs` (previously the fallback, used when a project declares no
  `rootDirs` of its own, omitted it). Without the pairing a plain `.ts` /
  `.svelte.ts` source file importing `./Foo.svelte` resolved to nothing (`any`),
  silently degrading `ComponentProps<typeof Foo>` to `any`.

  Together with the alias-import resolution fix, this takes a large SvelteKit app
  from 140 reported errors to 25 (the remainder are deeper cross-package
  ext-mirror `ComponentProps` typing and discriminated-union narrowing
  divergences).

- 5288843: svelte-check: drop diagnostics that fall inside svelte2tsx `Ωignore` regions.

  svelte2tsx wraps the synthesised helper code it emits purely for type-checking
  — e.g. a `bind:value` reverse-assignment `() => x.y.z = …`, cast shims —
  in `/*Ωignore_startΩ*/ … /*Ωignore_endΩ*/`. Errors landing inside such a region
  are artefacts of the generated TSX, not user errors: a `bind:value` closure, for
  instance, drops the discriminated-union narrowing of a `let`-declared `$props`
  binding, yielding a spurious `Property '…' does not exist` / implicit-any.

  This ports official svelte-check's `isInGeneratedCode` so those diagnostics are
  suppressed. On a large SvelteKit app this cleared the remaining narrowing /
  cast / control-flow cluster (10 → 2 reported errors).

## 0.3.2

### Patch Changes

- 108ee1d: svelte-check: resolve an external package's `.svelte` shadow imports from the
  package's own `node_modules`.

  A monorepo sibling's `.svelte` shadows are emitted under `<cache>/ext/<n>/`.
  Their bare-package imports (`import type { SortableOptions } from 'sortablejs'`,
  including the matching `@types/*` declarations) were resolved by walking up to
  the _workspace_ `node_modules`, missing any dependency present only in the
  external package's own tree — the imported type silently became `any`, which
  poisoned `ComponentProps<typeof Foo>` in every consumer (callback props turned
  into spurious implicit-any).

  The shadow dir now symlinks `<mirror>/node_modules` → `<real-pkg>/node_modules`,
  so bare imports resolve from the same context as in-place checking — no
  specifier rewriting, `@types` resolution intact. On a large SvelteKit app this
  cleared the cross-package `ComponentProps` cluster (25 → 10 reported errors).

- 108ee1d: svelte-check: scope reported diagnostics to the checked workspace, matching
  official svelte-check, eliminating two classes of false positives.

  - **Cross-package source files.** In a monorepo a sibling package pulled in
    transitively (e.g. `packages/design-system/...` resolved through a workspace
    symlink) is that package's own concern — official svelte-check only reports
    the invoked workspace's documents. rsvelte was surfacing the sibling's
    internal diagnostics (such as a `Foo.svelte` + `Foo.svelte.ts` companion's
    no-default-export edge) in every consumer's report. Diagnostics whose file
    lives outside the workspace root are now dropped; use-site errors in the
    workspace are unaffected.
  - **Raw SvelteKit route files.** A `+layout.ts` / `+page.ts` is a program root
    and was type-checked WITHOUT rsvelte's kit injection (which wraps `load` in
    `(…) satisfies …Load` so its destructured event is typed), producing false
    `implicit-any` on un-annotated `load` params. The injected mirror under
    `<cache>/svelte/…` is the authoritative version, so the raw source route
    file's pre-injection diagnostics are now dropped.

  It also always pairs the workspace source root with the `<cache>/svelte` shadow
  mirror in `rootDirs` (previously the fallback, used when a project declares no
  `rootDirs` of its own, omitted it). Without the pairing a plain `.ts` /
  `.svelte.ts` source file importing `./Foo.svelte` resolved to nothing (`any`),
  silently degrading `ComponentProps<typeof Foo>` to `any`.

  Together with the alias-import resolution fix, this takes a large SvelteKit app
  from 140 reported errors to 25 (the remainder are deeper cross-package
  ext-mirror `ComponentProps` typing and discriminated-union narrowing
  divergences).

## 0.3.1

### Patch Changes

- 620f0dd: svelte-check: resolve tsconfig-alias `.svelte` imports (e.g. `$lib/Foo.svelte`)
  to their shadow `.tsx` so type-checking sees the real component type.

  The overlay bridges each `.svelte` source to its generated shadow `.tsx` via
  `rootDirs`, but TypeScript applies `rootDirs` only to **relative** specifiers —
  an aliased import (`import X from '$lib/Foo.svelte'`) is resolved through
  `paths` and lands on the raw source `.svelte`, where no `.tsx` shadow exists.
  The component therefore resolved to `any` (every callback prop became a
  spurious `TS7006` implicit-any) or, when a sibling `Foo.svelte.ts` companion
  existed, to the companion (spurious `TS1192` "no default export").

  Each generated shadow's non-relative `.svelte` import is now pre-resolved with
  `oxc_resolver` (which honours the project tsconfig `paths`/`baseUrl`/`extends`)
  and rewritten to a concrete relative path at the target's shadow `.tsx`, so the
  backing TypeScript compiler resolves it directly — matching what official
  svelte-check achieves with its in-memory `resolveModuleNames` hook. On a large
  SvelteKit app this dropped reported errors from 140 to 43 (the remainder are
  unrelated SvelteKit route-load typing and companion-module edges).

- fe16df5: svelte-check: scope reported diagnostics to the checked workspace, matching
  official svelte-check, eliminating two classes of false positives.

  - **Cross-package source files.** In a monorepo a sibling package pulled in
    transitively (e.g. `packages/design-system/...` resolved through a workspace
    symlink) is that package's own concern — official svelte-check only reports
    the invoked workspace's documents. rsvelte was surfacing the sibling's
    internal diagnostics (such as a `Foo.svelte` + `Foo.svelte.ts` companion's
    no-default-export edge) in every consumer's report. Diagnostics whose file
    lives outside the workspace root are now dropped; use-site errors in the
    workspace are unaffected.
  - **Raw SvelteKit route files.** A `+layout.ts` / `+page.ts` is a program root
    and was type-checked WITHOUT rsvelte's kit injection (which wraps `load` in
    `(…) satisfies …Load` so its destructured event is typed), producing false
    `implicit-any` on un-annotated `load` params. The injected mirror under
    `<cache>/svelte/…` is the authoritative version, so the raw source route
    file's pre-injection diagnostics are now dropped.

  It also always pairs the workspace source root with the `<cache>/svelte` shadow
  mirror in `rootDirs` (previously the fallback, used when a project declares no
  `rootDirs` of its own, omitted it). Without the pairing a plain `.ts` /
  `.svelte.ts` source file importing `./Foo.svelte` resolved to nothing (`any`),
  silently degrading `ComponentProps<typeof Foo>` to `any`.

  Together with the alias-import resolution fix, this takes a large SvelteKit app
  from 140 reported errors to 25 (the remainder are deeper cross-package
  ext-mirror `ComponentProps` typing and discriminated-union narrowing
  divergences).

## 0.3.0

### Minor Changes

- ae32c7e: svelte-check: type-check with `tsc` by default (previously only with `--tsgo`)

  Running `rsvelte-check` without `--tsgo` used to skip TypeScript type-checking entirely, reporting only Svelte-side compile diagnostics — a silent no-op for type errors. Type-checking is now on by default and runs the stock `tsc` against the `.svelte` overlay. `--tsgo` switches the preferred backend to Microsoft's native `tsgo` (each falls back to the other; `$TSGO_BIN` still wins as an explicit override), and a new `--no-type-check` flag restores Svelte-only mode.

### Patch Changes

- f563b03: svelte-check (`--tsgo`): stop misclassifying binder/checker-emitted `TS1xxx`
  codes as syntax errors. The overlay-validity guard treated the entire
  `1000..2000` range as syntactic, but a handful of those codes — most notably
  `TS1192` ("Module has no default export"), plus `TS1259` / `TS1361` / `TS1371`
  — are emitted by the checker, not the parser. They do **not** trigger
  TypeScript's program-wide semantic-diagnostic suppression, so flagging them as
  syntactic raised a spurious `internal error: rsvelte produced invalid TSX … /
TypeScript suppressed type errors for the rest of the project` banner even
  though every real type error was still reported.

  This surfaced on components that have a sibling `Foo.svelte.ts` companion
  module re-exported into the shadow (the `#751` feature): consumers importing
  `import Default, { Named } from './Foo.svelte'` could see `TS1192`, which then
  masqueraded as an overlay parse failure. Unlike official `svelte-check` — which
  classifies by `getSyntacticDiagnostics` / `getSemanticDiagnostics` origin
  rather than by code number — rsvelte only has tsgo's textual code, so the fix
  maintains an explicit denylist of the known binder-emitted `1xxx` codes.

## 0.2.15

### Patch Changes

- d3eb1c0: Fix the doubled `apps/apps/npm/...` path in the published `repository.directory`
  metadata. The correct location is `apps/npm/<pkg>`, so the "source" link on
  each package's npm page now resolves instead of 404ing. This corrects the
  remaining packages missed when `@rsvelte/svelte-check` was fixed in #977: the
  `svelte-check-*` and `vite-plugin-svelte-native*` prebuilt-binary packages and
  `@rsvelte/svelte2tsx`. The `fixed` changeset groups carry the patch bump to
  every native sub-package.
- a3186c7: `svelte-check` now reads the diagnostic-relevant Svelte `compilerOptions`
  (`experimental.async`, `runes`) from project config instead of always
  compiling with defaults. The options are statically parsed (oxc) from both
  `svelte.config.{js,cjs,mjs,ts,mts}` and the `vite.config.{js,ts,…}`
  Svelte-plugin call (`svelte({ compilerOptions })`), merged with vite-plugin
  precedence (`defaults → svelte.config → inline`) to mirror
  vite-plugin-svelte's own order. This fixes spurious `experimental_async`
  errors on components using top-level / derived `await` when async is enabled
  via the vite plugin — the placement SvelteKit increasingly uses (#1034). The
  `--incremental` warnings cache carries a config fingerprint and invalidates
  when the resolved options change.

## 0.2.14

### Patch Changes

- aefee1c: docs: document the same-name `Foo.svelte.ts`/`.js` companion limitation (#800) in the README. A companion module sharing a component's base name shadows `./Foo.svelte` resolution under tsgo-based svelte-check (standard TS relative resolution — `tsc` and `tsgo` behave identically; official svelte-check only avoids it via a TS language-server plugin tsgo doesn't support). The new "Known limitations" section explains the cause and workaround, and points at the opt-in `svelte/no-companion-module-shadow` lint rule.

## 0.2.13

### Patch Changes

- 359c84d: fix(svelte-check): a syntactically-invalid generated `.tsx` overlay no longer silently suppresses all real type errors — `--tsgo` now reports it loudly and exits non-zero instead of producing a false pass (#728)

## 0.2.12

### Patch Changes

- 3908ff9: fix(svelte2tsx): lower static numeric DOM attribute values to bare numbers so `--tsgo` accepts the idiomatic string-literal form (`tabindex="-1"`, `colspan="2"`, `maxlength="5"`, …). `svelte/elements` types these attributes as `number | undefined | null` (no `string`), so emitting the value as a backtick string made tsgo reject every one with `Type 'string' is not assignable to type 'number'`, while official svelte-check accepted them. A single-`Text` value on a real element whose name is in svelte2tsx's `numberOnlyAttributes` set and which coerces to a number (`!isNaN`) is now emitted as a bare number (`"tabindex":-1,`) instead of `"tabindex":`-1``. Component props, non-listed attributes, and non-numeric values keep their string form. Mirrors upstream svelte2tsx's `needsNumberConversion`in`htmlxtojsx_v2/nodes/Attribute.ts`. Closes #939.
- cc1984f: fix(svelte-check): stop leaking an imported library's internal diagnostics into a consumer's `--tsgo` run. When a project imports a workspace component library, its `.svelte` components are shadowed under `<cache>/ext/<n>/` so cross-package named exports resolve (#782). Those shadows were also type-checked, so the library's own transitive deps (`Cannot find module '@floating-ui/dom'`, `sortablejs`, `@nexus/types`) and every internal bug surfaced as errors on the consumer — official svelte-check reports 0 because it never type-checks a node_modules `.svelte` as a reported document. `map_tsgo_diagnostics` now drops any diagnostic whose file lives under the `<cache>/ext/` shadow root, matching official behavior while keeping the shadows for #782 export resolution. Closes #941.

## 0.2.11

### Patch Changes

- 62fdefe: fix(svelte2tsx): preserve explicit type annotations on destructured `{#snippet}` parameters (#912). A snippet parameter that destructures and annotates its type (`{#snippet menuitem({ contentId }: { contentId?: string })}`) had its annotation dropped: the lowering spanned only the `{ contentId }` pattern, so svelte2tsx synthesized `{ contentId: any }` — losing both the type and the `?` optionality, and `{@render menuitem({})}` wrongly errored as a missing required property. The parser now folds a destructuring parameter's `typeAnnotation` into its span (mirroring the already-correct identifier-parameter path), so the generated `Snippet<[T]>` parameter type uses the annotation verbatim.
- 9c3be67: fix(svelte2tsx): infer a generic component's `T` into its `T`-dependent prop params (#923). A runes-mode generic component (`<script generics="T">` + `$props()`) was lowered with `__sveltets_2_fn_component($$render())`, which discards `T` — `$$render()` is called without `<T>` and the component type alias (`type C<T> = ReturnType<typeof C>`) never consumes its own `<T>`. So `T` could not be inferred at the call site, and sibling props whose types depend on it — callback props `(row: T) => …` and snippet props `Snippet<[{ row: T }]>` — collapsed to `unknown` ("'row' is of type 'unknown'"). This was the dominant remaining `--tsgo` blocker on real generic table/list components. rsvelte now emits the upstream `__sveltets_Render<T>` + `$$IsomorphicComponent` shape (byte-identical to svelte2tsx) for runes generics, whose generic constructor / call signatures let TypeScript infer `T` from the supplied props and flow it into every `T`-dependent prop parameter. The previous `#801` fix (making `Foo<X>` a valid generic _reference_) is preserved by the new shape's `type Foo<T> = InstanceType<typeof Foo<T>>` alias.

## 0.2.10

### Patch Changes

- 8a10954: fix(svelte2tsx): anchor component-child `{#snippet}` props via `inst.$$prop_def` so snippet parameters are inferred for value-typed components (#796). A named `{#snippet}` passed as a direct child of a component is lowered as an implicit prop (`new C({ props: { name:(p) => … } })`, #780). rsvelte used the bare instantiation form and never assigned the instance to a const nor destructured the snippet from `inst.$$prop_def`. For an imported `.svelte` component the contextual typing from the props literal was enough, but for a component whose type comes from a **value** — e.g. Storybook CSF's `const { Story } = defineMeta(…)` — `--tsgo` did not propagate the snippet's `Snippet<[Args]>` type and `{#snippet template(args)}` left `args` as implicit `any`. svelte2tsx now matches the official output exactly: the instance is assigned (`const $$_inst = new C({…})`) and each relocated snippet is anchored with `/*Ωignore*/const {name} = $$_inst.$$prop_def;/*Ωignore*/`, which surfaces the snippet prop types to the type-checker. Closes #796.

## 0.2.9

### Patch Changes

- cfc2fa6: fix(svelte2tsx): carry the `generics="…"` clause onto a runes-mode component's type so `Foo<X>` is a valid generic reference. A component declared with `<script lang="ts" generics="T …">` using `$props()` (runes mode) generated a non-generic component type alias (`type Foo__SvelteComponent_ = ReturnType<typeof Foo__SvelteComponent_>`), so referencing its instance type with a type argument (`$state<Foo<'a' | 'b'>>()`, `bind:this`, `ComponentProps<…>`) failed under `--tsgo` with "Type 'Foo**SvelteComponent\_' is not generic". The runes-mode component export now emits the declared type parameters on the alias (`type Foo**SvelteComponent*<T …> = ReturnType<typeof Foo\_\_SvelteComponent*>`), matching how the legacy-mode generics path already worked. Closes #801.

## 0.2.8

### Patch Changes

- 2bafbc5: fix(svelte-check): resolve cross-package `.svelte` imports to their real module instead of the ambient `*.svelte` wildcard. When a `.svelte` component in another workspace package was imported through that package's `exports` barrel (re-exporting the component's `<script module>` named members or `export { default }`), `--tsgo` resolved the `.svelte` to the default-only ambient `declare module '*.svelte'`, so its module-context named exports and `default` re-exports were reported missing (`Module '"*.svelte"' has no exported member 'X'`). The overlay now discovers workspace-sibling packages via `node_modules` symlinks, emits `.tsx`/`.d.ts` shadows for their `.svelte` files into a per-package cache mirror (`.svelte-check/ext/<n>/…`), and adds a `rootDirs` pair bridging each package's real source dir to its mirror — so a cross-package `import { x } from '@scope/pkg/…'` resolves to the component's real module (named exports + default), matching official `svelte-check`. Registry dependencies (whose realpath stays inside a `node_modules` store) are left untouched. Verified against real `tsgo` on the #782 monorepo repro. Closes #782.

## 0.2.7

### Patch Changes

- b9383b0: fix(svelte2tsx): ship the single, correct named-snippet-as-component-prop implementation. 0.1.11 accidentally merged two different fixes for #780 into `handle_component` at once (an implicit-prop relocation **and** a hoist-the-`const`-before-the-block approach), so a named `{#snippet}` child of a component was processed twice — an out-of-order double `move_range` plus a duplicate prop — producing invalid overlays. The duplicate (hoist) path has been reverted; the kept implicit-prop path emits the snippet inside the component's `props: { … }` object literal (`props: { row: ({ id }) => … }`), which both satisfies required `Snippet` props and lets TypeScript contextually type the snippet's parameters from the prop's `Snippet<[T]>` type (a destructured `{#snippet row({ id })}` no longer trips `noImplicitAny`). Verified against real `tsgo` on the #780 repro (0 errors).

## 0.2.6

### Patch Changes

- 5581231: fix(svelte2tsx): wire named snippet children into component props. A named snippet passed as a direct child of a component (`<List>{#snippet row(..)}…{/snippet}</List>`) was lowered to a standalone `const row = …` inside the component block while the props object stayed empty, so TypeScript reported a false `Property 'row' is missing in type '{}' but required in type '$$ComponentProps'` for any required `Snippet` prop. The overlay now adds a `row` shorthand prop and relocates the snippet declaration to before the component block (so the reference is in scope and its `: ReturnType<import('svelte').Snippet>` return type keeps it assignable to the prop), mirroring upstream's implicit-snippet-prop behaviour. Verified with tsc: the false "missing prop" error is gone (0 errors, matching official svelte-check).
- 4a02948: fix(svelte2tsx): wire a named `{#snippet}` child of a component into its `props` object. A snippet passed to a component (`<Comp>{#snippet row(..)}…{/snippet}</Comp>`) was lowered as a standalone `const row = …` emitted _after_ the instantiation, so the component was constructed with empty props and `--tsgo` reported a false `Property 'row' is missing in type '{}' but required in type '$$ComponentProps'`. The snippet is now emitted as an implicit prop inside the `props: { … }` object literal (`props: { row: (params) => … }`), mirroring upstream svelte2tsx's `addImplicitSnippetProp` — relocated there via `MagicString::move_range`. This satisfies required snippet props and lets TypeScript contextually type the snippet's parameters from the prop's `Snippet<[T]>` type (so a destructured `{#snippet row({ id })}` no longer trips `noImplicitAny`). Verified against real `tsgo` on the issue repro (0 errors). Closes #780.

## 0.2.5

### Patch Changes

- 42146ad: fix(svelte-check): resolve `Foo.svelte.ts` / `Foo.svelte.js` companion-module named imports. A component and its sibling companion module collide on the same TypeScript basename — `import X from './Foo.svelte'` and `import { y } from './Foo.svelte.js'` both resolve to the single `Foo.svelte.{ts,tsx,d.ts}` family — so the companion's named exports were invisible and TypeScript reported a spurious `TS2614: has no exported member 'y'`. The overlay now folds the companion's named exports into the component shadow (`export * from "<companion>.js"`), so the one resolvable module exposes both the component default export and the companion's named exports.
- 42146ad: fix(svelte2tsx): keep the props object well-formed when a `class:`/`style:` directive precedes another attribute. Regression from the #750 fix: moving `class:`/`style:` directives out of the `createElement` props object into a suffix statement left their expression chunk emitted _after_ a following attribute but pointing at an _earlier_ source position, violating the ascending-order requirement of the segmented overwrite. This corrupted the props object two ways: a following **shorthand attribute** (`{onclick}`) produced a double comma `{ "class":\`c\`,, }` — invalid TSX "Property assignment expected" (#779) — and a following **`{expression}`-valued attribute** (`onclick={() => f()}`) dropped its value `{ "onclick":, }`— invalid TSX "Expression expected" (#781). Both trip the program-wide`--tsgo` suppression. The overlay now bakes such out-of-order expression chunks into literal text so the props object stays well-formed; the common in-order case keeps its per-character source mapping.

## 0.2.4

### Patch Changes

- e307449: fix(svelte-check): resolve `Foo.svelte.ts` / `Foo.svelte.js` companion-module named imports. A component and its sibling companion module collide on the same TypeScript basename — `import X from './Foo.svelte'` and `import { y } from './Foo.svelte.js'` both resolve to the single `Foo.svelte.{ts,tsx,d.ts}` family — so the companion's named exports were invisible and TypeScript reported a spurious `TS2614: has no exported member 'y'`. The overlay now folds the companion's named exports into the component shadow (`export * from "<companion>.js"`), so the one resolvable module exposes both the component default export and the companion's named exports.

## 0.2.3

### Patch Changes

- ad7a37d: fix(svelte2tsx): generate valid TSX for pending-only `{#await p}…{/await}` (and `{#await p}…{:catch e}…{/await}` with no `{:then}`). These shapes previously never opened the block, dropped the `await(promise)` entirely, and ignored the catch — producing brace-unbalanced TSX that tripped the program-wide `--tsgo` suppression. Now mirrors upstream `handleAwait`.

## 0.2.2

### Patch Changes

- 7172ac1: fix(svelte2tsx): generate balanced TSX for an `{#await}` block whose `{:catch}` has no error variable. The variable-less catch emitted one extra `}` (closing the outer block before `catch`), and the pending+then+catch shape omitted the `try {` entirely, producing invalid TSX (`'catch' or 'finally' expected`) that made `--tsgo` flag the overlay invalid and suppress all real type errors program-wide. Now mirrors upstream `handleAwait`: `try { … } catch($$_e) { … }` (#753)
- f52c43b: fix(svelte2tsx): lower `class:`/`style:` directives as statements after the element's `createElement(...)` call instead of as `HTMLProps` object keys, so `--tsgo` no longer reports false `'"class:NAME"' does not exist in type 'HTMLProps<…>'` excess-property errors (#750)
- e0d8442: fix(svelte2tsx): don't synthesize a `children` prop when a component's only children are `{#snippet}` blocks (or comments/whitespace), so `--tsgo` no longer reports a false `'children' does not exist in type '$$ComponentProps'`. Mirrors upstream `handleImplicitChildren`. (partial fix for #752 — snippet-parameter typing is tracked separately)
- c1357b9: fix(css): evaluate each `:is()`/`:where()` branch in the context of its surrounding combinator when detecting unused selectors, so an unreachable branch (e.g. `.a` in `:is(.a, .b) + .c` when `.c` never immediately follows `.a`) is correctly flagged unused — matching the official compiler instead of silently passing (#754)

## 0.2.1

### Patch Changes

- 8cbfe9b: fix(css): don't flag a `#id` selector as unused when the element's `id` is dynamic (`{id}` shorthand, `id={expr}`, an interpolated `id="a{x}"`, or set via a spread) — only a static `id="..."` is matched literally (#723)
- 4901a72: fix(css): treat `:is()`/`:where()` as an OR-set in unused-selector detection so a compound like `:is(.a, .b) + .c` is recognised as used and only the genuinely-unreachable branch (`.b`) is flagged, instead of the whole selector (#722)
- dcb3b6f: fix(css): don't flag a nested `&.CLASS` selector as unused when `CLASS` comes from a `class:CLASS={...}` directive (or a spread) rather than a static `class="..."` attribute (#720)

## 0.2.0

### Minor Changes

- 8f34576: rename the CLI bin from `svelte-check` to `rsvelte-check` (#716)

  `@rsvelte/svelte-check` previously shipped its CLI under the bin name `svelte-check`, colliding with the official [`svelte-check`](https://www.npmjs.com/package/svelte-check) package. In a single `node_modules/.bin/` only one `svelte-check` entry can exist, so installing both produced a last-writer-wins shadow and made a safe side-by-side migration impossible.

  The bin is now `rsvelte-check`, so both tools can coexist and be addressed unambiguously from npm scripts:

  ```jsonc
  "type:check": "svelte-check --tsconfig ./tsconfig.json",  // official, authoritative
  "type:check:fast": "rsvelte-check --workspace ."          // rsvelte, PR-time
  ```

  The CLI arguments and behavior are unchanged. Also fixes the doubled `apps/apps/` in `repository.directory`.

### Patch Changes

- e7ecade: fix(analyze): validate `<dt>`/`<dd>` placement against the parent rule, not an ancestor check, so a valid nested `<dl>` inside `<dd>` is accepted (#721)
- 18ffc59: fix(svelte-check): `--workspace .` / `./` / `=.` no longer discover 0 files and silently pass (#718)

  The project walker pruned any entry whose name starts with `.` (the hidden-dir skip). When the workspace root was `.` or `./`, walkdir reports the root entry's `file_name()` as the bare path string (`.`), so the **root itself** was pruned and the whole tree discarded — `--workspace .` reported `found 0 errors … in 0 files` and exited 0 even with `.svelte` files present (a silent false-pass in CI). Absolute and `..`-relative roots carry a real final component, so they were unaffected.

  The walk root (depth 0) is now never pruned — it's the workspace the user explicitly pointed at — which also honours a workspace directory whose own name starts with `.`. Additionally, the CLI now prints a warning to **stderr** (never stdout, so machine formats stay parseable) when zero `.svelte` files are found, so a misconfigured path can't masquerade as a passing check.

- 7410a0c: fix(svelte2tsx): don't panic on multibyte/CJK `<script>` content (#719)

  `collect_type_body_deps`'s `typeof` lookbehind sliced `&body[j - 6..j]` with raw byte arithmetic. When non-ASCII (e.g. Japanese / CJK) text preceded an identifier in a `<script lang="ts">` type body — such as `必須) */` ahead of `imageSrc` — `j - 6` could land inside a multibyte UTF-8 char, and the `&str` slice panicked, aborting the entire `--emit-overlay` / `--tsgo` run (and with it every diagnostic for the project). The slice is now guarded with `str::is_char_boundary`; the six bytes can only spell the ASCII keyword `typeof` when `j - 6` is already a char boundary, so behavior is unchanged for ASCII input.

- 0d68138: fix(svelte2tsx): lower Svelte 5 function bindings `bind:prop={get, set}` to valid TSX that type-checks both callables, instead of splicing a raw tuple into the props literal (#726)
- 5a679cf: fix(svelte2tsx): disambiguate generic arrow type-parameter lists (`<T>` → `<T,>`) in the `.tsx` overlay so they aren't parsed as JSX (#725)
- 1b9b399: fix(svelte-check): a syntactically-invalid generated `.tsx` overlay no longer silently suppresses all real type errors — `--tsgo` now reports it loudly and exits non-zero instead of producing a false pass (#728)

## 0.1.6

### Patch Changes

- cf82369: fix(svelte-check): make `--tsgo` see project ambient declarations (`src/app.d.ts`)

  `svelte-check --tsgo` did not load a project's ambient declaration files —
  most notably the default SvelteKit `src/app.d.ts` — so its `declare global` /
  `namespace App` augmentations (`App.Locals`, `App.PageData`, …) were invisible
  and any code relying on them reported spurious `TS2304` / `TS2307`. The
  non-tsgo checker was unaffected.

  Two causes in the overlay tsconfig builder
  (`crates/rsvelte_core/src/svelte_check/overlay.rs`):
  - **`include` not resolved through `extends`.** A SvelteKit project keeps its
    `include` in the generated `./.svelte-kit/tsconfig.json`, not the root
    tsconfig. `read_tsconfig_specs` only read the directly-passed config, so it
    forwarded nothing and the overlay's `include` stayed `["./svelte/**/*"]` —
    which pulls in the `.tsx` shadows and their imports, but never the
    non-imported ambient `.d.ts` files. It now walks the `extends` chain
    (per-key, nearest-defining-config wins, mirroring TypeScript), the same way
    `rootDirs` was already resolved.

  - **Glob specs mis-rebased.** Rebasing an `include` glob with
    `path_relative(cache_dir, base.join(spec))` fed `**` into path resolution as
    if it were a real directory, yielding garbage like
    `../../../../src/**/*.ts`. Rebasing now splits off the leading non-glob
    directory prefix, anchors it on the CWD, diffs it lexically against the
    overlay dir, and re-appends the glob tail verbatim.

  Forwarding the project's resolved `include` puts `src/app.d.ts` (and SvelteKit's
  generated `ambient.d.ts`) back in the `--tsgo` program, matching the non-tsgo
  checker. Verified end-to-end on a SvelteKit portfolio: an `App.Locals` /
  ambient-global `app.d.ts` that errored under the published build now reports 0
  errors.

## 0.1.5

### Patch Changes

- ebab7f2: fix(svelte-check): make `--tsgo` type-check Svelte projects (jsx + embedded shims + merged rootDirs)

  `svelte-check --tsgo` reported a flood of spurious errors on a clean SvelteKit
  project (154 on the portfolio that surfaced this) where the non-tsgo checker
  reported none. Three gaps in the overlay tsconfig:
  - **No `jsx`.** The `.tsx` shadows svelte2tsx emits need a JSX backend, so every
    `.svelte` → `.tsx` import failed with TS6142 "'--jsx' is not set". The overlay
    now sets `jsx: "preserve"`.
  - **Shims never resolved.** The svelte2tsx shim `.d.ts` files (declaring
    `svelteHTML` / `__sveltets_2_*`) were looked up from
    `node_modules/svelte2tsx`, which a standalone rsvelte install doesn't ship —
    so every ambient reference errored. The shims are now vendored into the
    binary and materialised into the cache dir, referenced via `files`.
  - **`rootDirs` clobbered.** The overlay hardcoded `rootDirs: [".", "./svelte"]`,
    replacing the project's own — so SvelteKit's generated `$types` (mapped via
    its `rootDirs`) stopped resolving (TS2307). The overlay now resolves the
    base tsconfig's `rootDirs` through the `extends` chain and merges them with
    the overlay's `./svelte`.

  `svelte-check --tsgo` now matches the non-tsgo checker (0 errors on a clean
  SvelteKit project).

## 0.1.4

### Patch Changes

- 6ac76c2: - Escape GitHub Actions command property values in `--output machine`/GH-format diagnostics.
  - Apply `warning_filter`, forward module-level warnings, and make machine output line-safe.
  - Rebuild against the bundled `@rsvelte/compiler` correctness work.

## 0.1.3

### Patch Changes

- d95f3bb: fix: port Svelte 5.55.9 follow-ups — `nullish-coallescence-omittance` SSR
  stringify omittance (upstream `a5df6616e`) and `Percentage` keyframe
  double-print (upstream `ca3f35bf7`). Class / style / innerHTML SSR paths
  and the head-element SSR / `css-keyframes-percent` print path are still
  tracked as follow-ups in the per-suite skip lists.

## 0.1.2

### Patch Changes

- 4db15ed: Roll up everything that has landed on `main` since `0.3.1` / `0.1.1`.
  - compiler: track upstream Svelte `5.51.4` → `5.51.5`.
  - vite-plugin-svelte-native: NAPI bindings now disable jemalloc's
    `initial-exec` TLS model so the dylib is safe to `dlopen` from Node on
    glibc hosts.
  - svelte-check / svelte2tsx: republish to pick up the routine dependency
    refresh (`serde_json` 1.0.150, `rustc-hash` 2.1.2).
  - Release workflow now publishes via npm OIDC trusted publishing (no
    `NPM_TOKEN`), Node 22, and `npm publish --provenance` for every
    platform sub-package — every tarball ships with provenance attestation.
  - Docs: README rewritten around the OXC integration goal, with per-task
    benchmark breakdown (parser / svelte2tsx / svelte-check) mirroring
    the live `/benchmark` page.

## 0.1.1

### Patch Changes

- b3322a0: fix(svelte-check): restore execute bit on the platform binary so `pnpm dlx`/`npx` work

  The 0.1.0 platform tarballs ship `svelte-check` without the execute bit
  because `pnpm pack` (used by `pnpm publish` and therefore `changeset
publish` when pnpm is detected) normalises file modes to 0644. Running
  `pnpm dlx @rsvelte/svelte-check` (or `npx`) on a fresh install fails with
  `spawnSync ... EACCES`.

  Three layers, so a single regression can't break this again:
  - `bin/svelte-check.cjs` chmods the binary +x best-effort before
    `spawnSync`, so already-published 0.x tarballs become usable for any
    end user on their next install.
  - Each non-Windows platform package gains a `prepack` hook that runs
    `chmod +x svelte-check` so the source mode is right before pack.
  - A new `scripts/publish-platform-binaries.mjs` step runs `npm publish`
    for the platform packages before `changeset publish`. `npm pack`
    preserves modes, so the tarballs that actually hit the registry ship
    `-rwxr-xr-x`. `changeset publish` then skips those already-published
    versions and continues with the rest of the workspace as before.

  The Windows platform package (`svelte-check.exe`) is unaffected — Windows
  ignores POSIX mode bits.

- 1153e43: test(release): patch-bump every package to validate the GitHub Actions release pipeline end-to-end

  The local one-shot `publish-all-local.sh` is the manual escape hatch; the
  intended steady-state path is `release.yml` (changesets/action + matrix
  binary builds + `pnpm publish`). This changeset bumps each of the four
  top-level packages by `patch` so we can:
  1. Watch changesets/action open the "Version Packages" PR.
  2. Merge it.
  3. Watch the release workflow build the 5-triple matrix for both
     `svelte_check` and the NAPI cdylib, stage them via
     `scripts/stage-svelte-check-binaries.mjs` /
     `scripts/stage-vps-binaries.mjs`, and publish all 14 npm packages.
  4. Confirm every `@rsvelte/*` on the registry shows the new patch version.

  `fixed` groups in `.changeset/config.json` make the 5 svelte-check
  platform packages and the 5 vps-native platform packages follow their
  main package automatically, so this changeset only names the four
  top-level packages.

  The submodule fork (`@rsvelte/vite-plugin-svelte`) lives in a separate
  repo and isn't part of this pipeline — it's published independently.
