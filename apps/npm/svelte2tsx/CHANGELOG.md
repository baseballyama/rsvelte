# @rsvelte/svelte2tsx

## 0.2.1

### Patch Changes

- b31c4a7: fix(parser): preserve TS assertion expressions in `parse()` output and fix zero-width arrow-param spans

  `parse()` now keeps `TSAsExpression`, `TSSatisfiesExpression`, and
  `TSNonNullExpression` wrapper nodes in the public AST — matching
  svelte/compiler, which parses TS via acorn-typescript and returns the assertion
  nodes. rsvelte previously unwrapped them at parse time, returning the bare inner
  expression and diverging from the reference AST shape (it broke downstream
  consumers that rely on parser parity). The wrappers are still erased at compile
  time by `remove_typescript_nodes` exactly as before, so client/server codegen is
  unchanged (`x as const` is stripped from the generated JS). The binary
  `parseEnvelope` encoder/decoder gains matching entries for the three node types.

  Also fixes a latent bug where untyped arrow-function parameters inside template
  expressions (event handlers such as `onclick={(color, e) => …}`) came back with
  zero-width spans (`start == end == 0`); the fast-path template arrow parser now
  assigns each parameter its real source span, matching svelte/compiler.

  In svelte2tsx (`@rsvelte/svelte2tsx` and the svelte-check overlay), a `bind:`
  expression carrying a TS assertion (`bind:value={value as never}`) now strips the
  assertion from the generated assignment LHS while keeping it on the bound-value
  side — mirroring upstream svelte2tsx's `getEnd(attr.expression)`.

- Updated dependencies [d7f9427]
- Updated dependencies [c3fc6d9]
- Updated dependencies [b31c4a7]
- Updated dependencies [d7f9427]
- Updated dependencies [d7f9427]
- Updated dependencies [6fa6c2e]
  - @rsvelte/compiler@0.8.2

## 0.2.0

### Minor Changes

- 54509fe: feat(svelte2tsx): result object matches upstream (`map` SourceMap, `exportedNames.has`, `events.getAll`)

  The `svelte2tsx()` result now mirrors the official
  [`svelte2tsx`](https://github.com/sveltejs/language-tools/tree/master/packages/svelte2tsx)
  `SvelteCompiledToTsx` shape:

  - **`map`** is now a magic-string-style `SourceMap` **object** (`version`,
    `sources`, `sourcesContent`, `names`, `mappings`, plus `toString()` /
    `toUrl()`) instead of a JSON string. In `dts` mode it stays `null`.
  - **`exportedNames`** now exposes `has(name): boolean` (upstream
    `IExportedNames`). The existing `props` / `all` arrays are kept as a
    backward-compatible rsvelte extension.
  - **`events`** now exposes `getAll(): { name, type, doc? }[]` (upstream
    `ComponentEvents`, which is `@deprecated`) instead of a plain record. Types
    are approximated as `CustomEvent<detail>` / `CustomEvent<any>`; the optional
    `doc` (JSDoc) field is not populated.

  The `map` string → object change folds into the same unreleased `0.2.0` as the
  synchronous-API change, so it stays a single minor bump.

- 255c6f7: feat(svelte2tsx): synchronous API matching upstream (drop-in `svelte2tsx()`)

  `svelte2tsx()` is now **synchronous**, exactly like the official
  [`svelte2tsx`](https://github.com/sveltejs/language-tools/tree/master/packages/svelte2tsx)
  — it returns the result object directly instead of a `Promise`. The previous
  async signature existed only to lazily initialise the WebAssembly module; the
  `@rsvelte/compiler` wasm bundle already exports `initSync`, so on Node the module
  now self-initialises synchronously (`initSync` + `fs.readFileSync`) on the first
  call, with no init cost thereafter.

  Existing `const r = await svelte2tsx(...)` code keeps working unchanged (awaiting
  a plain value returns it); only code that chained `.then()`/`.catch()` on the
  result needs updating — hence a minor bump.

  For browsers or bundlers without a synchronous `node:fs`, a new
  `initialize(input?)` async export pre-loads the wasm (pass the bytes or a
  compiled `WebAssembly.Module`); after `await initialize(...)`, `svelte2tsx()` can
  be called synchronously.

### Patch Changes

- ff0fc86: refactor(svelte2tsx): extract svelte2tsx() entry-point steps into helpers

  The `svelte2tsx()` entry point had grown to ~2000 lines with several cohesive
  processing steps inlined into the body. This splits the mechanically-separable
  ones out into private helper functions with no behavior change:

  - `remove_orphan_scripts` — blank embedded `<script>` tags and collect their content
  - `emit_svelte_options_element` — emit `<svelte:options>` as a `createElement` call
  - `blank_style_tags` — blank `<style>` blocks (parsed + fallback scan)
  - `hoist_top_level_snippets` — analyze/relocate top-level `{#snippet}` blocks
  - `build_dollar_declarations` — build `$$props`/`$$restProps`/`$$slots` decls
  - `build_slots_str` / `build_events_str` — build the component-export slots/events literals

  Pure code motion: the generated TSX, source maps, and errors are byte-identical
  (verified against the full svelte2tsx fixture suite — the same 8 pre-existing
  known failures, no regressions).

- Updated dependencies [cc81ec5]
- Updated dependencies [54509fe]
- Updated dependencies [4ea4b44]
- Updated dependencies [6665d53]
- Updated dependencies [fa0e9ff]
- Updated dependencies [fa0e9ff]
- Updated dependencies [add48ed]
- Updated dependencies [fa0e9ff]
- Updated dependencies [fa0e9ff]
- Updated dependencies [87f178e]
- Updated dependencies [fa0e9ff]
- Updated dependencies [fa0e9ff]
- Updated dependencies [a3dae82]
- Updated dependencies [fa0e9ff]
- Updated dependencies [fa0e9ff]
- Updated dependencies [685a96e]
- Updated dependencies [fd4572e]
  - @rsvelte/compiler@0.8.0

## 0.1.22

### Patch Changes

- c3d6b2a: chore(svelte2tsx): shrink module-wide lint allows and fix doc attribution

  Remove the blanket `#[allow(dead_code, doc_lazy_continuation,
if_same_then_else, unnecessary_unwrap, ...)]` module attributes on the
  svelte2tsx submodules — only `module_inception` remains (with its own
  reason), since `svelte2tsx::svelte2tsx` mirrors the upstream package
  layout. Truly dead helpers are deleted (unused JSON rune-global walkers,
  `node_start_pos`/`node_end_pos`, unused structured-bake formatters, unused
  `PropsRuneInfo` fields), `is_some()`-then-`unwrap()` sites become
  let-chains, identical `if`/`else` arms collapse, and doc comments that had
  drifted onto the wrong item (`process_instance_script`,
  `handle_reactive_statement`, `emit_segmented_overwrite`,
  `format_attribute_node_segments`, overlay's `emit_external_shadows` /
  `path_relative`) are reattached. No behavior change — the transform output
  is byte-identical (fixture suite verified).

- bfe6de8: fix(svelte2tsx): bounds-check AST-offset source slices

  The svelte2tsx transform sliced the original source by AST byte offsets in
  dozens of places with `&source[start as usize..end as usize]` (often with a
  defensive `.unwrap_or(0)` on an absent offset). When an offset pair is inverted
  (`start > end`) or reaches past the source length — possible for lazily-parsed
  or unresolved expressions whose `.start()`/`.end()` are unreliable — the raw
  slice panics, aborting the whole compile instead of degrading gracefully.

  Consolidate every such AST-offset slice through one helper,
  `slice_src(source, start, end)`, which returns `source.get(start..end)` and
  falls back to `""` on an inverted, out-of-bounds, or non-char-boundary range.
  For any valid range this is exactly `&source[start..end]`, so the transform
  output is byte-identical (verified against the full 253-fixture svelte2tsx
  suite); only the panic paths change to an empty slice.

- 10f599f: perf(svelte2tsx): drop the two full-source `to_ascii_lowercase` copies

  `blank_style_content` and the orphan-`<script>` scanner each allocated a
  lowercased copy of the entire source just to case-insensitively find
  `<style` / `<script` tag tokens. Replace both with an allocation-free
  `find_ci` byte scan (`eq_ignore_ascii_case` on the tag-name window),
  matching the approach the fallback `<style>` scanner already uses. Output
  is byte-identical (same ASCII case folding, same match positions);
  verified against the full svelte2tsx fixture suite.

- Updated dependencies [21ab5b1]
- Updated dependencies [f72487c]
- Updated dependencies [f66ee48]
- Updated dependencies [0307bc1]
- Updated dependencies [8b827ae]
- Updated dependencies [bc553d3]
- Updated dependencies [ac25917]
- Updated dependencies [93eac0b]
- Updated dependencies [0f346a5]
- Updated dependencies [c8795c0]
- Updated dependencies [b7e28b7]
- Updated dependencies [3e43d67]
- Updated dependencies [581d520]
- Updated dependencies [8e38ff1]
- Updated dependencies [ef9c121]
- Updated dependencies [277e6cd]
- Updated dependencies [673b2b0]
- Updated dependencies [cafca99]
- Updated dependencies [511cb42]
  - @rsvelte/compiler@0.7.17

## 0.1.21

### Patch Changes

- 394344a: chore: upgrade the mirrored Svelte compiler to 5.56.4

  Ports the two `packages/svelte/src/compiler` changes in 5.56.4: `{@const}`
  declarator end now includes wrapping parentheses and its `VariableDeclaration`
  starts at the `const` keyword (#18436), and optional-parameter `?` is stripped
  in `svelte`-lang TS (#18448). svelte2tsx's `{@const}` handler is updated for the
  new declarator span so it no longer duplicates the keyword (`const const x = …`).

## 0.1.20

### Patch Changes

- 9818443: fix(svelte2tsx): widen renamed legacy prop with a typed default (#1231)

  A renamed legacy prop with a default and a type — most commonly a JSDoc `/** @type {T} */` (the sveltestrap shape), e.g. `let className = ""; export { className as class }` — must still receive official svelte2tsx's `__sveltets_2_any` coercion bounded by `/*Ωignore_startΩ*/ … /*Ωignore_endΩ*/` markers. The `export { x as y }` widening predicate only fired on `!has_init || has_type_annotation`, so any renamed prop with a default dropped the coercion (and the Ω-ignore markers the language server relies on) even with a JSDoc `@type` or a boolean default. It now mirrors official `propTypeAssertToUserDefined`: widen on no-init OR a type (TS annotation or JSDoc `@type`) OR a boolean-literal initializer; a plain untyped string default is still left untouched.

- ba7f774: fix(svelte2tsx): bind a component child's legacy `let:` from its own slot_def (#1232)

  A legacy `let:` directive on a _component_ child of another component (`<Preview><State let:value let:set>…</State></Preview>`) binds from the child's OWN `$$slot_def.default` — its own `handle_component` already emits that destructure. rsvelte additionally treated the component child as a "default-slot-let child" of the enclosing component, so it gave the parent a spurious instance const and emitted a duplicate `$$_parent.$$slot_def.default` destructure that bound the child's `let:` props onto the parent instance, mistyping the slot props. Only non-component slot content (`<div let:x>` / `<svelte:fragment let:x>` / `<svelte:element let:x>`) forwards its `let:` bindings to the enclosing component's slot_def; `Component`/`SvelteComponent`/`SvelteSelf` children are now excluded from both the parent-instance trigger and the parent-side destructure emission, mirroring official svelte2tsx.

- 82d3826: fix(svelte2tsx): drive corpus output-parity to zero (254 → 0)

  The compat corpus added 26 awesome-svelte projects, reintroducing 254 svelte2tsx TSX output-parity divergences from the official tool. Port the remaining official `svelte2tsx` behaviors so every component is once again byte-identical (after oxfmt normalization), shrinking `compat/corpus/svelte2tsx-known-failures.json` to empty. Every fix mirrors the official algorithm (no per-file special-casing):

  - Renamed reserved-word exports (`export { x as class }`): widen via `__sveltets_2_any` on a JSDoc `@type`/boolean-literal default, take the leading JSDoc from the export statement (`getDoc(target) || decl.doc`), and overwrite the local-keyed prop in place for the `export let X` + `export { X as reserved }` collision.
  - Props/interface-member JSDoc preserved on the `$$Props` `ensureRightProps` branch, the `dontAddTypeDef` value path, and block comments separated by a `//` line comment.
  - Event maps collected in source order (no alphabetical sort); `$$Events` typing injection gated on an actual `$$Events` interface; `canHaveAnyProp` split from `usesPropsOrRestProps`; forwarded DOM events surface as `mapElementEvent`.
  - Store auto-subscriptions detect `...$store` spreads, skip `$`-prefixed function params (scope shadowing) and `$names` inside comments, and emit in the correct order.
  - `@component` doc dedent via `dedent-js` semantics; module-only `$$render` emits `__sveltets_createSlot` before the `async () => {` wrapper; import-type stripping keeps a trailing line comment in place.
  - Component children with their own `let:` destructure the child's own `$$slot_def`; named-slot `let:` bindings resolve the right slot key (last-wins component-level scope); `svelte:self` resolves through `__sveltets_1_componentType()`; destructured each/`let:` slot values use the official `((pattern) => name)(unwrapArr(coll))` form; slot-prop value normalization to `"__svelte_ts_string"`.

  Verified byte-identical across all 11,490 corpus components (0 regressions); the 137 svelte2tsx unit tests and the 253-fixture suite pass.

- Updated dependencies [e06d43d]
- Updated dependencies [d826d82]
- Updated dependencies [9c92abe]
- Updated dependencies [257efbd]
- Updated dependencies [8e74d34]
- Updated dependencies [e8dfdb7]
- Updated dependencies [7c5cef6]
- Updated dependencies [dc40cc7]
- Updated dependencies [4037211]
- Updated dependencies [58fbddc]
- Updated dependencies [20db5a3]
- Updated dependencies [4ee5f7c]
- Updated dependencies [cfb6a15]
- Updated dependencies [267ba18]
- Updated dependencies [4537f04]
- Updated dependencies [cd60e94]
- Updated dependencies [8541c7b]
- Updated dependencies [79d2380]
- Updated dependencies [639a952]
- Updated dependencies [e151196]
- Updated dependencies [cafa711]
- Updated dependencies [20401c3]
- Updated dependencies [6c1e662]
- Updated dependencies [d4f8a77]
- Updated dependencies [57ba819]
- Updated dependencies [6a5f48f]
- Updated dependencies [e6110b2]
- Updated dependencies [a1beb29]
- Updated dependencies [ac7d1f9]
- Updated dependencies [128c6f6]
- Updated dependencies [d87b019]
- Updated dependencies [3ed1e82]
- Updated dependencies [69fc318]
- Updated dependencies [5a1c338]
- Updated dependencies [f061348]
- Updated dependencies [70f55d1]
- Updated dependencies [4b2e841]
- Updated dependencies [da4aa67]
- Updated dependencies [859e522]
- Updated dependencies [3701f7e]
- Updated dependencies [ce42f21]
- Updated dependencies [ea931bf]
- Updated dependencies [0b2d7fb]
- Updated dependencies [70f55d1]
- Updated dependencies [429de3f]
- Updated dependencies [ce42f21]
- Updated dependencies [6fe6b4a]
- Updated dependencies [7e6cd57]
- Updated dependencies [b92840b]
- Updated dependencies [f3a8000]
- Updated dependencies [e0779f0]
- Updated dependencies [8ee109d]
- Updated dependencies [812b05f]
- Updated dependencies [244264a]
- Updated dependencies [f632423]
- Updated dependencies [cd786c3]
- Updated dependencies [ea05921]
- Updated dependencies [af836a2]
- Updated dependencies [70f55d1]
- Updated dependencies [f061348]
- Updated dependencies [f061348]
- Updated dependencies [1af9df3]
- Updated dependencies [fa4dd68]
- Updated dependencies [f061348]
- Updated dependencies [f061348]
- Updated dependencies [f061348]
- Updated dependencies [4746423]
  - @rsvelte/compiler@0.7.16

## 0.1.19

### Patch Changes

- d3eb1c0: Fix the doubled `apps/apps/npm/...` path in the published `repository.directory`
  metadata. The correct location is `apps/npm/<pkg>`, so the "source" link on
  each package's npm page now resolves instead of 404ing. This corrects the
  remaining packages missed when `@rsvelte/svelte-check` was fixed in #977: the
  `svelte-check-*` and `vite-plugin-svelte-native*` prebuilt-binary packages and
  `@rsvelte/svelte2tsx`. The `fixed` changeset groups carry the patch bump to
  every native sub-package.
- f23c67f: svelte2tsx output-parity corpus burndown (29 fixes): preserve comments inside
  expression tags and between element-opener attributes, emit a `$$ComponentProps`
  typedef for every `$props()` destructure, fix auto-closed-element closing braces,
  hoist `{#snippet}` above sibling consts, lower `<slot>` inside
  `<template shadowrootmode>` to `createSlot`, compile snippet rest params, and
  tolerate instance-script JS that acorn accepts but OXC rejects (raw passthrough).
  Defers `each_key_without_as` / `render_tag` / snippet-rest / `<textarea>` logic-block
  checks from parse to analyze so svelte2tsx (parse-only) matches the official oracle.
- e7770df: svelte2tsx output-parity corpus burn-down (124 → 11 known failures): hoist
  `$$ComponentProps` when a `typeof` references an import (not a local);
  preserve trailing TS postfixes (`as T` / `satisfies T` / `!`) on component
  bind props, spreads (parenthesised) and use/transition/animate directive
  params; wrap empty-valued `data-*` attributes in `__sveltets_2_empty` on the
  `createElement` path; gate interface / `$$ComponentProps` hoisting and
  emission on the upstream `HoistableInterfaces` rules (no over-hoisting when
  the props interface is absent/imported, no synthetic `Record<string, never>`
  alias); support the `$props<TypeArg>()` type-argument form; place the
  `@component` documentation block adjacent to the component declaration; stop
  treating TS keywords as hoist-blocking value deps; insert the auto
  `$$ComponentProps` typedef before leading comments rather than into them; and
  keep instance-referencing top-level `{#snippet}` blocks inside
  `function $$render()`; fully enumerate deeply-nested destructured `export`
  props (recurse into `rest`); fix the `__sveltets_createSlot` props-object
  spacing; and preserve block-comment interior indentation. Remaining
  divergences (one genuine upstream `svelte2tsx` crash, shared-parser HTML edge
  cases, and a few low-ROI individual diffs) are documented in
  `docs/svelte2tsx-corpus-remaining.md`.
- ec51d22: Fix a panic in svelte2tsx when a declaration is immediately preceded by a
  multi-byte character (e.g. a `─` box-drawing char in a `// ── … ──` comment
  banner). `leading_jsdoc_comment` probed the block-comment terminator by slicing
  `&source[p - 2..p]`, which lands mid-char and panics on a non-char-boundary
  index; in the wasm playground this surfaced as a bare `unreachable` trap. The
  terminator is now tested with `source[..p].ends_with("*/")`.
- Updated dependencies [a93f50c]
- Updated dependencies [a93f50c]
- Updated dependencies [a93f50c]
- Updated dependencies [a93f50c]
- Updated dependencies [a93f50c]
- Updated dependencies [f68f2a3]
- Updated dependencies [b75ceb5]
- Updated dependencies [47e5bec]
- Updated dependencies [a93f50c]
- Updated dependencies [a93f50c]
- Updated dependencies [a93f50c]
- Updated dependencies [a93f50c]
- Updated dependencies [7d0c17b]
- Updated dependencies [a93f50c]
- Updated dependencies [99725cc]
- Updated dependencies [a93f50c]
- Updated dependencies [a93f50c]
- Updated dependencies [a93f50c]
- Updated dependencies [a93f50c]
- Updated dependencies [a93f50c]
- Updated dependencies [a93f50c]
- Updated dependencies [a93f50c]
- Updated dependencies [a93f50c]
  - @rsvelte/compiler@0.7.12

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
