# @rsvelte/svelte2tsx

## 0.1.18

### Patch Changes

- d9eb4be: svelte2tsx output-parity (corpus): the compat-corpus now also checks svelte2tsx
  TSX output against the official tool over every component source, and several
  systematic port divergences are fixed:
  - `derive_component_name` matches the official `classNameFromFilename` exactly
    (scule `pascalCase`/`splitByCase` + the JS `substr(-1)` last-char quirk).
  - `__sveltets_*` component/instance variable names use the component's nesting
    depth (matching `computeDepth()`), reusing one number per depth instead of a
    per-name counter; names are `sanitizePropName`-cleaned before reversing.
  - Runes-mode detection now matches official `isRunesMode()` — `$state` /
    `$derived` / `$effect` globals, `$props()`, explicit `<svelte:options runes>`,
    top-level await, and await in template expressions all select runes output
    (`__sveltets_2_fn_component`, `__sveltets_$$bindings(...)`).

- fbdbd52: Fix two `--tsgo` / svelte-check overlay scoping bugs where an instance-`<script>`
  type declaration was relocated out of the scope where the rest of the script
  referenced it, producing spurious "Cannot find name" errors (official
  svelte-check reports 0 errors):
  - #963: an instance `export type` / `export interface` referenced by a hoisted
    `Props` interface is now registered as a hoist candidate (with its `export`
    keyword preserved) so it travels with the interface and stays in scope.
  - #964: a local generic `type` alias no longer knocks the component's
    `generics=` parameters out of scope. Hoisting is now gated on the props
    interface itself being hoistable (mirroring upstream
    `HoistableInterfaces.moveHoistableInterfaces`); when it references a component
    generic, nothing is hoisted out of `function $$render<…>()`, keeping the
    generics in scope for local aliases.

- ab617b0: svelte2tsx output-parity (corpus burndown, follow-up): further port divergences fixed so rsvelte's svelte2tsx matches the official tool:
  - `render_tag_invalid_call_expression` (snippet via `.apply`/`.bind`/`.call`) is deferred to the analysis phase like official Svelte, instead of being rejected at parse time — svelte2tsx (parse-only) no longer errors on templates official tolerates.
  - `<script>` content is parsed as TypeScript regardless of `lang="ts"` (matching official svelte2tsx on acorn-typescript), so TS-only script syntax such as `let x: typeof C<any>` no longer fails the parse; template expressions stay lang-respecting.
  - Trailing TypeScript postfixes on `{#each}` collection expressions (`{#each x! as i}`, `{#each [...] as const as i}`) are preserved instead of being dropped.

- 4cb9c5e: Continue svelte2tsx output-parity burndown: widen JSDoc `/** @type */` props;
  preserve element-opener comments (re-attached as leading attribute comments),
  any leading block comment as a prop doc, and leading/trailing comments inside
  expression tags; emit the leading export doc on `props … as { … }` type
  entries; combine the SvelteKit `data: PageData` annotation with the prop
  type-widener into one ignore block; emit the synthetic `children` prop on
  `<svelte:component>` even with `let:` directives and drop the duplicate let-var
  statement on named-slot elements; and stop treating a `$name` in a
  `use:`/`transition:`/`in:`/`out:`/`animate:` directive name as a store
  subscription.

## 0.1.17

### Patch Changes

- 3908ff9: fix(svelte2tsx): lower static numeric DOM attribute values to bare numbers so `--tsgo` accepts the idiomatic string-literal form (`tabindex="-1"`, `colspan="2"`, `maxlength="5"`, …). `svelte/elements` types these attributes as `number | undefined | null` (no `string`), so emitting the value as a backtick string made tsgo reject every one with `Type 'string' is not assignable to type 'number'`, while official svelte-check accepted them. A single-`Text` value on a real element whose name is in svelte2tsx's `numberOnlyAttributes` set and which coerces to a number (`!isNaN`) is now emitted as a bare number (`"tabindex":-1,`) instead of `"tabindex":`-1``. Component props, non-listed attributes, and non-numeric values keep their string form. Mirrors upstream svelte2tsx's `needsNumberConversion`in`htmlxtojsx_v2/nodes/Attribute.ts`. Closes #939.

## 0.1.16

### Patch Changes

- 62fdefe: fix(svelte2tsx): preserve explicit type annotations on destructured `{#snippet}` parameters (#912). A snippet parameter that destructures and annotates its type (`{#snippet menuitem({ contentId }: { contentId?: string })}`) had its annotation dropped: the lowering spanned only the `{ contentId }` pattern, so svelte2tsx synthesized `{ contentId: any }` — losing both the type and the `?` optionality, and `{@render menuitem({})}` wrongly errored as a missing required property. The parser now folds a destructuring parameter's `typeAnnotation` into its span (mirroring the already-correct identifier-parameter path), so the generated `Snippet<[T]>` parameter type uses the annotation verbatim.
- 9c3be67: fix(svelte2tsx): infer a generic component's `T` into its `T`-dependent prop params (#923). A runes-mode generic component (`<script generics="T">` + `$props()`) was lowered with `__sveltets_2_fn_component($$render())`, which discards `T` — `$$render()` is called without `<T>` and the component type alias (`type C<T> = ReturnType<typeof C>`) never consumes its own `<T>`. So `T` could not be inferred at the call site, and sibling props whose types depend on it — callback props `(row: T) => …` and snippet props `Snippet<[{ row: T }]>` — collapsed to `unknown` ("'row' is of type 'unknown'"). This was the dominant remaining `--tsgo` blocker on real generic table/list components. rsvelte now emits the upstream `__sveltets_Render<T>` + `$$IsomorphicComponent` shape (byte-identical to svelte2tsx) for runes generics, whose generic constructor / call signatures let TypeScript infer `T` from the supplied props and flow it into every `T`-dependent prop parameter. The previous `#801` fix (making `Foo<X>` a valid generic _reference_) is preserved by the new shape's `type Foo<T> = InstanceType<typeof Foo<T>>` alias.
- Updated dependencies [e4c82de]
  - @rsvelte/compiler@0.7.8

## 0.1.15

### Patch Changes

- 26aeb22: Fix the `@rsvelte/compiler` dependency range. `0.1.13` and `0.1.14` shipped a
  wrong `^0.1.0` range (the same `pkg/` version leak that broke the compiler
  publish caused pnpm to resolve the `workspace:^` range against the stale
  `0.1.0`), which pulled a months-old compiler. This release restores the
  correct `^0.7.x` range.
- Updated dependencies [26aeb22]
  - @rsvelte/compiler@0.7.7

## 0.1.14

### Patch Changes

- 8a10954: fix(svelte2tsx): anchor component-child `{#snippet}` props via `inst.$$prop_def` so snippet parameters are inferred for value-typed components (#796). A named `{#snippet}` passed as a direct child of a component is lowered as an implicit prop (`new C({ props: { name:(p) => … } })`, #780). rsvelte used the bare instantiation form and never assigned the instance to a const nor destructured the snippet from `inst.$$prop_def`. For an imported `.svelte` component the contextual typing from the props literal was enough, but for a component whose type comes from a **value** — e.g. Storybook CSF's `const { Story } = defineMeta(…)` — `--tsgo` did not propagate the snippet's `Snippet<[Args]>` type and `{#snippet template(args)}` left `args` as implicit `any`. svelte2tsx now matches the official output exactly: the instance is assigned (`const $$_inst = new C({…})`) and each relocated snippet is anchored with `/*Ωignore*/const {name} = $$_inst.$$prop_def;/*Ωignore*/`, which surfaces the snippet prop types to the type-checker. Closes #796.

## 0.1.13

### Patch Changes

- cfc2fa6: fix(svelte2tsx): carry the `generics="…"` clause onto a runes-mode component's type so `Foo<X>` is a valid generic reference. A component declared with `<script lang="ts" generics="T …">` using `$props()` (runes mode) generated a non-generic component type alias (`type Foo__SvelteComponent_ = ReturnType<typeof Foo__SvelteComponent_>`), so referencing its instance type with a type argument (`$state<Foo<'a' | 'b'>>()`, `bind:this`, `ComponentProps<…>`) failed under `--tsgo` with "Type 'Foo**SvelteComponent\_' is not generic". The runes-mode component export now emits the declared type parameters on the alias (`type Foo**SvelteComponent*<T …> = ReturnType<typeof Foo\_\_SvelteComponent*>`), matching how the legacy-mode generics path already worked. Closes #801.

## 0.1.12

### Patch Changes

- b9383b0: fix(svelte2tsx): ship the single, correct named-snippet-as-component-prop implementation. 0.1.11 accidentally merged two different fixes for #780 into `handle_component` at once (an implicit-prop relocation **and** a hoist-the-`const`-before-the-block approach), so a named `{#snippet}` child of a component was processed twice — an out-of-order double `move_range` plus a duplicate prop — producing invalid overlays. The duplicate (hoist) path has been reverted; the kept implicit-prop path emits the snippet inside the component's `props: { … }` object literal (`props: { row: ({ id }) => … }`), which both satisfies required `Snippet` props and lets TypeScript contextually type the snippet's parameters from the prop's `Snippet<[T]>` type (a destructured `{#snippet row({ id })}` no longer trips `noImplicitAny`). Verified against real `tsgo` on the #780 repro (0 errors).

## 0.1.11

### Patch Changes

- 5581231: fix(svelte2tsx): wire named snippet children into component props. A named snippet passed as a direct child of a component (`<List>{#snippet row(..)}…{/snippet}</List>`) was lowered to a standalone `const row = …` inside the component block while the props object stayed empty, so TypeScript reported a false `Property 'row' is missing in type '{}' but required in type '$$ComponentProps'` for any required `Snippet` prop. The overlay now adds a `row` shorthand prop and relocates the snippet declaration to before the component block (so the reference is in scope and its `: ReturnType<import('svelte').Snippet>` return type keeps it assignable to the prop), mirroring upstream's implicit-snippet-prop behaviour. Verified with tsc: the false "missing prop" error is gone (0 errors, matching official svelte-check).
- 4a02948: fix(svelte2tsx): wire a named `{#snippet}` child of a component into its `props` object. A snippet passed to a component (`<Comp>{#snippet row(..)}…{/snippet}</Comp>`) was lowered as a standalone `const row = …` emitted _after_ the instantiation, so the component was constructed with empty props and `--tsgo` reported a false `Property 'row' is missing in type '{}' but required in type '$$ComponentProps'`. The snippet is now emitted as an implicit prop inside the `props: { … }` object literal (`props: { row: (params) => … }`), mirroring upstream svelte2tsx's `addImplicitSnippetProp` — relocated there via `MagicString::move_range`. This satisfies required snippet props and lets TypeScript contextually type the snippet's parameters from the prop's `Snippet<[T]>` type (so a destructured `{#snippet row({ id })}` no longer trips `noImplicitAny`). Verified against real `tsgo` on the issue repro (0 errors). Closes #780.

## 0.1.10

### Patch Changes

- 42146ad: fix(svelte2tsx): keep the props object well-formed when a `class:`/`style:` directive precedes another attribute. Regression from the #750 fix: moving `class:`/`style:` directives out of the `createElement` props object into a suffix statement left their expression chunk emitted _after_ a following attribute but pointing at an _earlier_ source position, violating the ascending-order requirement of the segmented overwrite. This corrupted the props object two ways: a following **shorthand attribute** (`{onclick}`) produced a double comma `{ "class":\`c\`,, }` — invalid TSX "Property assignment expected" (#779) — and a following **`{expression}`-valued attribute** (`onclick={() => f()}`) dropped its value `{ "onclick":, }`— invalid TSX "Expression expected" (#781). Both trip the program-wide`--tsgo` suppression. The overlay now bakes such out-of-order expression chunks into literal text so the props object stays well-formed; the common in-order case keeps its per-character source mapping.

## 0.1.9

### Patch Changes

- ad7a37d: fix(svelte2tsx): generate valid TSX for pending-only `{#await p}…{/await}` (and `{#await p}…{:catch e}…{/await}` with no `{:then}`). These shapes previously never opened the block, dropped the `await(promise)` entirely, and ignored the catch — producing brace-unbalanced TSX that tripped the program-wide `--tsgo` suppression. Now mirrors upstream `handleAwait`.

## 0.1.8

### Patch Changes

- 7172ac1: fix(svelte2tsx): generate balanced TSX for an `{#await}` block whose `{:catch}` has no error variable. The variable-less catch emitted one extra `}` (closing the outer block before `catch`), and the pending+then+catch shape omitted the `try {` entirely, producing invalid TSX (`'catch' or 'finally' expected`) that made `--tsgo` flag the overlay invalid and suppress all real type errors program-wide. Now mirrors upstream `handleAwait`: `try { … } catch($$_e) { … }` (#753)
- f52c43b: fix(svelte2tsx): lower `class:`/`style:` directives as statements after the element's `createElement(...)` call instead of as `HTMLProps` object keys, so `--tsgo` no longer reports false `'"class:NAME"' does not exist in type 'HTMLProps<…>'` excess-property errors (#750)
- e0d8442: fix(svelte2tsx): don't synthesize a `children` prop when a component's only children are `{#snippet}` blocks (or comments/whitespace), so `--tsgo` no longer reports a false `'children' does not exist in type '$$ComponentProps'`. Mirrors upstream `handleImplicitChildren`. (partial fix for #752 — snippet-parameter typing is tracked separately)
- Updated dependencies [c1357b9]
  - @rsvelte/compiler@0.7.4

## 0.1.7

### Patch Changes

- 0d68138: fix(svelte2tsx): lower Svelte 5 function bindings `bind:prop={get, set}` to valid TSX that type-checks both callables, instead of splicing a raw tuple into the props literal (#726)
- 5a679cf: fix(svelte2tsx): disambiguate generic arrow type-parameter lists (`<T>` → `<T,>`) in the `.tsx` overlay so they aren't parsed as JSX (#725)
- Updated dependencies [e7ecade]
  - @rsvelte/compiler@0.7.2

## 0.1.6

### Patch Changes

- Updated dependencies [3c1b453]
- Updated dependencies [7f593d4]
  - @rsvelte/compiler@0.7.0

## 0.1.5

### Patch Changes

- 6ac76c2: Pick up the bundled `@rsvelte/compiler` correctness work and support `expected.error.json` start/end-offset comparison in the svelte2tsx error fixtures.
- Updated dependencies [6ac76c2]
  - @rsvelte/compiler@0.6.0

## 0.1.4

### Patch Changes

- Updated dependencies [a7cdebe]
- Updated dependencies [1e9483a]
- Updated dependencies [f1d65ad]
- Updated dependencies [1cd18da]
- Updated dependencies [b720d08]
- Updated dependencies [3756592]
- Updated dependencies [6c1b11d]
- Updated dependencies [3a1b613]
- Updated dependencies [43d20b1]
- Updated dependencies [752055a]
- Updated dependencies [1088eba]
- Updated dependencies [a4c5334]
- Updated dependencies [c74572c]
- Updated dependencies [356b7f6]
- Updated dependencies [6be628d]
- Updated dependencies [6ea2484]
- Updated dependencies [412eb00]
- Updated dependencies [a110812]
- Updated dependencies [8613663]
- Updated dependencies [a8a5f77]
- Updated dependencies [0ee799d]
- Updated dependencies [b4a23af]
- Updated dependencies [a97d9af]
- Updated dependencies [bed3534]
- Updated dependencies [fbb7d44]
- Updated dependencies [e438591]
  - @rsvelte/compiler@0.5.0

## 0.1.3

### Patch Changes

- Updated dependencies [34a4593]
- Updated dependencies [ccb02b2]
  - @rsvelte/compiler@0.4.0

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

- Updated dependencies [4db15ed]
  - @rsvelte/compiler@0.3.2

## 0.1.1

### Patch Changes

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

- Updated dependencies [1153e43]
  - @rsvelte/compiler@0.3.1
