# @rsvelte/svelte-check

## 0.5.14

### Patch Changes

- 9c22cc3: Build the Linux binaries against glibc 2.35 instead of whatever `ubuntu-latest` happens to provide. The release matrix ran on the hosted `ubuntu-latest` image, which moved to Ubuntu 24.04 (glibc 2.39), so every published `linux-x64-gnu` / `linux-arm64-gnu` artifact refused to start on Ubuntu 22.04 LTS and other distributions on an older glibc — `libc.so.6: version 'GLIBC_2.39' not found`. The Linux legs are now pinned to `ubuntu-22.04`, and each one asserts the requirement by reading the artifact it just built, so a future image bump fails the release instead of shipping.

## 0.5.13

### Patch Changes

- 76048fd: Read `--config` correctly when it names a Vite config under a non-standard filename. `rsvelte-check --config vite.custom.config.js` classified the file by asking whether its name began with `vite.config`, which is false for exactly the names the flag exists to support, so the `svelte()` plugin's inline `compilerOptions` were never read and a project with `experimental.async` enabled reported `experimental_async` on every top-level `await`. Upstream's `load-config` decides the other way round — a Svelte config is one named `svelte.config.*`, everything else is tried as a Vite config first — which is now the single predicate all three `--config` consumers share. A relative `--config` path is also resolved against the workspace before the loader reads it, instead of only for the existence check.

## 0.5.12

### Patch Changes

- 8c7851c: Port the compiler to the restructured oxc 0.143 AST

  `ExportNamedDeclaration` was split into three nodes — `ExportDeclaration` (`export <decl>`),
  a specifier-only `ExportNamedDeclaration` (`export {…}`) and `ExportFromDeclaration`
  (`export {…} from`) — and `ArrowFunctionExpression` replaced its `expression` flag and
  `FunctionBody` with an `ArrowFunctionBody` enum. Every match over those nodes now names all
  three variants explicitly instead of falling through.

  Two behaviour fixes fall out of the split. `export type Foo = true` inside a `namespace` was
  rejected as a non-type member because oxc now derives the export kind from the declaration
  rather than storing it, and a chained member object such as
  `(componentOptions()?.events?.onabort)?.apply(…)` lost its required parentheses because oxc
  keeps a `ParenthesizedExpression` around the inner chain that the printer was not looking
  through.

- c2392cf: svelte2tsx now honours `namespace: 'foreign'`. Official svelte2tsx derives
  `preserveAttributeCase` from it (`htmlxtojsx_v2/index.ts`) and skips the
  attribute-name case fold, so `<element someAttr="hi">` projects as
  `"someAttr"`. rsvelte had no `foreign` namespace at all: the value was
  unreachable from the napi and wasm boundaries (it fell into the `_ =>
Svelte2TsxNamespace::Html` arm), `MarkupNamespace` had no matching variant,
  and `Svelte2TsxOptions::namespace` was never read by the projection — so even
  a caller constructing the option directly got attribute names folded to lower
  case with no diagnostic. This affects users whose `svelte.config.js` sets
  `compilerOptions.namespace = 'foreign'`, which the language server passes
  straight through.

## 0.5.11

### Patch Changes

- 0279808: Client source maps no longer anchor the instance script at the byte immediately
  after `<script>`. That byte is the newline ending the `<script>` line, so every
  segment derived from the script chunk resolved to a column past the end of that
  line and broke downstream consumers resolving a frame. The chunk is now anchored
  at the script's first non-whitespace byte, which cuts out-of-range client
  segments by 46% across the official sourcemap samples. Generated code is
  unchanged — the offset only feeds the map.
- 67067b0: CSS pruning now models `{@render}` call sites. A `{#snippet}`-declared element's
  real DOM ancestors are the union of the ancestors of every site that renders the
  snippet, not its lexical parent chain, so rules such as `.foo > .a { … }` whose
  `.a` only ever appears in a snippet rendered under a different ancestor are
  marked unused like the official compiler does. Previously the structural ancestor
  check bailed out entirely whenever the component contained a snippet.
- 5ddb700: An inline component's direct `{#snippet}` child is now demoted to a component
  prop even when the component also carries a `let:` directive or has other
  named-slot children, matching official svelte2tsx. rsvelte previously gated
  the snippet-to-prop relocation off whenever `let:` (or a named-slot child) was
  present and fell back to emitting the snippet as a standalone block-scoped
  `const foo = …` declaration instead — official always demotes the snippet and
  independently emits the `let:` / named-slot `$$slot_def` destructure alongside
  it. Applies to named components, `<svelte:component>`, and `<svelte:self>`.

## 0.5.10

### Patch Changes

- 1ea512b: Stop a dependency's `/// <reference types="svelte" />` re-introducing svelte's declarations. The blanked copy of `svelte/types/index.d.ts` (the `*.svelte` wildcard fix) is reached through `paths`, which a type reference does not go through — so `@sveltejs/kit`, `@tanstack/svelte-table` and any other package whose shipped `.d.ts` opens with that directive pulled the original file back into the program beside the copy. Every ambient svelte module was then declared twice, and since `Snippet`'s brand is a `unique symbol` per declaration, a snippet was no longer assignable to `Snippet`: TS2322 on every snippet handed to a component prop (130 of them in one real SvelteKit app), with nothing wrong in the project. The reference now resolves to an empty stub package placed first in `typeRoots`, leaving the copy in `files` as the single source of those modules.
- cc54f59: fix(svelte2tsx): skip identifiers in a slot expression's computed object key. A
  bare-identifier computed key (`{ [item]: 1 }`) was resolved through the
  `{#each}`/`let:` scope like any other identifier, but official's
  `resolveExpression` never substitutes a key position at all — it only
  descends into a compound key expression (`{ [item + 1]: 1 }`), whose nested
  identifiers resolve normally because the key slot there is not an
  `Identifier` node.
- e703fd2: Apply `remove_surrounding_whitespace_nodes` to `{#snippet}` bodies and reproduce upstream's opener gap for the standalone snippet form, and route `<svelte:boundary slot="x">` inside a component through the `$$slot_def[...]` wrapper so the generated TSX matches official svelte2tsx.
- d1ca60c: Demote `<svelte:component>`'s direct `{#snippet}` children to implicit props, like a named component's and `<svelte:self>`'s. They were emitted as standalone `const foo = (a) => …` declarations, so TypeScript could not contextually type the snippet parameters from the target component's props; they now move into the `props: { … }` object anchored by a `$$prop_def` destructure. The `let:` / named-slot paths keep their own block scoping and are unaffected.
- faeba67: Route `<svelte:options>`'s opener gap through the shared `opener_spacing` helper so the generated TSX matches official svelte2tsx exactly, including bare boolean attributes like `<svelte:options runes />`.
- c86c2e5: Transform `<svelte:self>` `bind:` directives and `{#snippet}` children like a named component's: two-way bindings now emit a plain prop plus the `$$bindings` marker and setter type-widener instead of the DOM `"bind:value"` form, `bind:this` assigns the component instance, and direct snippet children are demoted to props anchored by a `$$prop_def` destructure.
- 50c3fd0: fix(svelte2tsx): drop the trailing space after `<svelte:self>`'s generated
  `$on(...)` calls. `handle_svelte_self` reimplemented event-call emission
  with a bespoke loop that appended `'); '` instead of `');'`, diverging from
  official's `InlineComponent.addEvent` and from rsvelte's own
  `handle_component`, which already reuses the shared `build_on_calls` helper.
  `handle_svelte_self` now calls the same helper.

## 0.5.9

### Patch Changes

- 1fe97f3: fix(svelte2tsx): close the three slots-reflection resolver gaps. A destructuring
  `let:` value (`let:whatever={{ bla }}`) bound only the directive's own name, so
  every leaf identifier stayed unresolved in the `slots` reflection instead of
  resolving through `(({ bla }) => bla)(…$$slot_def['default'].whatever)`; slot-prop
  resolution substituted identifiers by token without tracking object-literal
  context, so an in-scope name in object **key** position (and inside a string
  literal) was rewritten too (`{ item: … }` became
  `{ __sveltets_2_unwrapArr(items): … }`); and a `{:catch e}` binding was not typed
  as `__sveltets_2_any({})`. The `{#await}` opening-tag padding is now derived from
  official `transform`'s collapsed-gap count (`2 + then + catch` spaces) rather than
  a constant, which also fixes the bare and pending-only shapes.
- ce189a1: fix(svelte2tsx): lower slots for `<svelte:self>` as a slot parent. Official
  svelte2tsx models `<svelte:self>` as an `InlineComponent`, so its children are
  slot consumers of that node, but rsvelte performed no lowering there at all:
  `<svelte:self><div slot="a">` kept a bogus `"slot":`a`` prop instead of the
  `$$slot_def["a"]` wrapper, `<svelte:self><div let:x>` kept a bogus
  `"let:x":true` prop instead of the `$$slot_def.default` destructure (leaving
  every `let:` binding an undeclared identifier), and the `$$_svelteselfN`
  instance const was never declared. Named-slot children reached through
  `{#if}` / `{#each}` / `{#await}` / `{#key}` now forward too, and a
  `<svelte:self>` that is itself a named-slot child keeps both levels of
  wrapper.
- b632694: fix(svelte2tsx): mirror official whitespace/gap accounting for `<style>` and
  `<svelte:boundary>`. Blanking a `<style>` tag also swallowed the whitespace that
  followed it, so a top-level `<style>…</style>\n` lost its trailing newline
  (`async () => {};` instead of `async () => {\n};`); upstream `handleStyleTag`
  removes exactly the node range. And `<svelte:boundary>` was lowered with the
  literal-name start transformation, whereas upstream `Element.ts` only
  special-cases `svelte:options` / `head` / `window` / `body` / `fragment` and
  lets everything else keep the tag name as a source range — one more kept range,
  so the props object gets two spaces of gap instead of one. Because the Svelte-4
  AST conversion drops a whitespace-only first/last `Text` child of a boundary,
  `computeStartTagEnd` also lands on the first real child (folding the `\n\t`
  before it into the opener) and a content-bearing first/last `Text` has its data
  trimmed before being blanked.

## 0.5.8

### Patch Changes

- 5b011d3: Imports hoisted out of a component's instance script now keep the source-map segments of their original span, so a diagnostic on an import in a `.svelte` file is reported on the import's own line instead of line 1. The hoisted text used to be re-synthesized above `$$render()` with the original range blanked out, which left those generated lines with no mapping at all; they are now relocated the way official svelte2tsx's `moveNode` does it. As a side effect the hoisted text is byte-identical to the source, which also fixes multi-line imports losing their continuation-line indentation and leading-comment imports dropping a line.
- f27accf: Three SvelteKit kit-file augmentation divergences from official svelte-check are gone. JSDoc tags are now delimited the way TypeScript's scanner does it — a tag ends at the next `@` that follows whitespace, so several tags may share one line — instead of one tag per line, so `/** @typedef {string} S @type {X} */` suppresses the injected annotation exactly where official does (an `@` glued to the previous word, or inside an inline `{@link …}`, still reads as prose). The JSDoc signature written for API-route handlers and params matchers in `.js` files now matches official's text, `/** @type {(arg0: T) => R} */`, using the synthetic `arg0` and the non-async return type. And a rest parameter now counts towards official's single-parameter check: `entries(...args)` is left alone instead of being typed as if it took none, and `load = (...args) => …` is augmented instead of skipped.
- 4b58d5b: Two `.svelte`-specifier resolutions the overlay could not previously answer the way official svelte-check does now match it. A **relative** `./Foo.svelte` written in a plain `.ts`/`.js` file that has a same-named `Foo.svelte.ts` companion next to it used to resolve to the companion — TypeScript probes the importer's own directory before `rootDirs` can offer the component shadow, and `paths` never applies to a relative specifier — so a named import of the companion's exports silently succeeded where official reports `TS2614`. Such an importer is now mirrored into the overlay as a blanked _import probe_ (everything but the hijacked import declarations replaced with spaces, so every position survives) and the import is re-resolved from there. Separately, a `Foo.svelte.js` rune module in a project without `allowJs` is deliberately left without a bridge, which under `node16`/`nodenext` left its specifier resolving to nothing at all (`TS2307`); the overlay now restates what official reports for a module it withholds — `TS7016`, or nothing when `noImplicitAny` is off.
- d66ed72: fix(svelte2tsx): forward a component's default-slot `let:` from every node kind
  official models as an `Element`, and through control-flow blocks. The wrapping
  only covered a direct `RegularElement` / `<svelte:fragment>` child, so
  `<Foo><svelte:element let:x>`, `<Foo><slot let:x>` and any `{#if}` / `{#each}` /
  `{#await}` / `{#key}`-nested `<div let:x>` dropped their `$$slot_def.default`
  prologue and emitted a bogus `"let:x": true` attribute, leaving every `let:`
  binding an undeclared identifier in the generated TSX. A component-direct
  `<style let:x>` no longer leaves an orphaned `$$slot_def` block behind (official
  deletes the whole `<style>` range, block included) nor steals one space from the
  next sibling's indent. `<svelte:fragment>` / `<svelte:boundary>` also stop
  leaking their enclosing component's slot scope into their own children, and a
  block-nested one with a static `slot="name"` now gets the `$$slot_def["name"]`
  wrapper instead of a plain `slot` attribute.
- f9bd901: `createEventDispatcher` event names and typings now match official svelte2tsx. The dispatcher factory is recognised through the local name the `svelte` import binds it to, so `import { createEventDispatcher as foo }` works (and a same-named local that was never imported no longer counts); every typed `createEventDispatcher<T>()` in a component contributes its own `...__sveltets_2_toEventTypings<T>()` spread instead of only the last one, with a name declared by two of them degrading to `CustomEvent<any>` and gaining a `customEvent` entry; and `dispatch(name)` resolves `name` through a string constant declared earlier in the instance script. Dispatchers declared inside a function are tracked too, and the `events.getAll()` API surface now includes the events a typed dispatcher declares.
- 2ff1134: fix(svelte2tsx): remove a re-export (`export { x } from './mod'`) from a
  component's instance script instead of leaving it inside the generated
  `$$render()` body. Upstream `ExportedNames.handleExportDeclaration` keys off
  `ts.isNamedExports(exportClause)` alone and never inspects `moduleSpecifier`,
  so every named export clause — with or without a `from` — is stripped and
  recorded as an export. rsvelte skipped the clause whenever a module specifier
  was present, emitting an `export … from` inside a function body: invalid TSX
  (TS1233) that made svelte-check discard _all_ diagnostics for the file.
- 462401a: fix(svelte2tsx): apply official's `value[0]` rule to every slot-name path.
  Official svelte2tsx only ever reads the FIRST part of a slot-name attribute
  value; rsvelte concatenated all `Text` parts (or kept the last one), so
  `<slot name="a{b}c">` produced `slots: { undefined: {} }` instead of
  `{ 'a': {} }`, `$$slots` keyed on `c` instead of `a`, and
  `<Comp><div slot="a{b}c">` was lowered to a `$$slot_def["ac"]` wrapper that
  official does not emit. The three sibling paths now mirror their own upstream
  rule: `slots`/`$$slots` use `nameAttr.value[0].raw` (shared map),
  `let:`-binding scope resolution uses `getSlotName`'s `value[0].raw`, and the
  `$$slot_def[…]` lowering uses `attributeValueIsOfType(value, 'Text')` — so an
  interpolated or dynamic `slot=` stays an ordinary attribute and is no longer
  dropped from the generated props.
- 1f97b68: fix(svelte2tsx): honor an instance-script `$$Slots` interface/type override.
  Official `createRenderFunction.ts` builds the component export's `slots:`
  reflection as `uses$$SlotsInterface ? '{} as unknown as $$Slots' : '{…computed…}'`,
  so a component that declares its own `interface $$Slots` / `type $$Slots` is
  type-checked against that declaration instead of the shape inferred from its
  `<slot>` elements. rsvelte already threaded the flag into the
  `__sveltets_2_createCreateSlot<$$Slots>()` binding but always emitted the
  computed literal in the return statement, so consumers saw the inferred slot
  props and any deliberate widening/narrowing in the declaration was lost.
- 0fe1f6b: fix(svelte2tsx): wrap a `<svelte:component>` / `<svelte:self>` named-slot
  child (`<svelte:component this={Inner} slot="a" />`) in the parent's
  `$$slot_def["a"]` block. `has_named_slot_children` (and the parallel
  `is_named_slot` check in `process_component_children_with_slots`) never
  matched `SvelteComponent` / `SvelteSelf` nodes, so such a child fell through
  to the plain fragment walk instead of the named-slot lowering — unlike
  official svelte2tsx, which models both as `InlineComponent` and forwards them
  exactly like a named `<Component slot="a">` child. Found while fixing #2103
  (PR #2135).
- 751f057: fix(svelte2tsx): route `<svelte:component>` children through the same slot
  lowering a named component's children take. `handle_svelte_component` walked
  its fragment with `process_fragment_inplace`, so a default-slot `let:` receiver
  (`<div let:x>` / `<svelte:fragment let:x>`) never got its
  `$$slot_def.default` destructuring prologue and every `let:` binding resolved
  as an undeclared identifier in the generated TSX; a `<svelte:fragment
slot="a">` child likewise kept a plain `"slot":\`a\`,`attribute instead of the`$$slot_def["a"]`wrapper. Official svelte2tsx treats`svelte:component`as an`InlineComponent`, so slot content forwards the same way there.

## 0.5.7

### Patch Changes

- db787d8: fix(svelte-check): resolve a rune module imported through a `paths` alias (`$lib/state.svelte` for a real `state.svelte.ts`). Its `.d.svelte.ts` ESM bridge was reachable only through `rootDirs`, which TypeScript applies to relative specifiers alone, so under `moduleResolution: nodenext` the specifier fell through to the ambient `declare module '*.svelte'` and every named import errored with TS2614. The bridge now also gets an exact `compilerOptions.paths` override, with a sibling `.svelte` component still winning the specifier.
- 6139059: fix(svelte2tsx): move a default-slot `let:` element's leading gap space ahead
  of its `$$slot_def.default` destructure. Upstream's `Element.
performTransformation` runs the destructure through the SAME `transform()`
  call as the element's own opening-tag rewrite, so the element's leading gap
  lands before the destructure instead of before the element itself. rsvelte
  inserted the destructure with no leading space and left the gap on the
  element, so `<Foo><div let:x>{x}</div></Foo>` produced
  `;{const {…,x,} = …$$slot_def.default;$$_$$; { svelteHTML.createElement(…`
  (extra space before the element) instead of upstream's
  `; {const {…,x,} = …$$slot_def.default;$$_$$;{ svelteHTML.createElement(…`.
- 6dd15f0: fix(svelte-check): mirror `addTypeToFunction`'s single `hasTypeDefinition` gate for SvelteKit route/hooks/params-matcher handlers, so a manually-typed parameter also suppresses the return-type injection, and unwrap a single level of `(expr)` around a `const` initializer before matching it against an arrow/function expression, so `export const GET = (async (event) => {...});` is still augmented
- 538d2be: fix(svelte-check): fix four SvelteKit `load`-augmentation divergences from `upsertKitFile`. A return-typed `function load(...)` declaration no longer skips its parameter injection (`hasTypedParameter` only ever looks at the parameter). A `const load = (...) => ...` whose initializer is itself function-like now gets its parameter typed directly instead of always being wrapped in `satisfies` — `findExports` only reaches for `satisfies` when the initializer _isn't_ function-like, and unconditionally wrapping one that is can reject an otherwise-valid return value the official checker accepts. The JSDoc `@type`/`@param`/`@satisfies` gate that already suppressed re-annotation on `.ts` files now also applies on `.js` files across every route/hooks/params-matcher export, not just the ones #1944 covered. A multi-declarator `export const a = ..., b = ...;` is left untouched entirely, mirroring `findExports`' single-declarator requirement.
- c6f363f: fix(svelte-check): stop the overlay from resolving `.svelte` specifiers official svelte-check refuses to. Svelte's own declarations carry `declare module '*.svelte'`, which official blanks out as it reads them — with it in the program, a specifier that resolves to nothing (or to a `.js` rune module a project without `allowJs` excludes) silently typed as a default-only component instead of erroring with TS2307 / TS7016. The overlay now emits a blanked copy of the package's declarations and redirects every module it declares onto it. A `Foo.svelte.ts` companion's exports are no longer folded into the component shadow either, so a named import through the `.svelte` specifier errors the way it does upstream; the companion's own `./Foo.svelte.js` specifier is re-pointed at the real module instead. Finally, the overlay restates the project's `paths` with absolute targets and so denied TypeScript its own validation of them: a non-relative substitution without `baseUrl` warns with TS5090 again, positioned in the user's config, while a `${configDir}` template is expanded first — against the user's project directory rather than the overlay's cache dir, which also fixes `paths`, `baseUrl`, `rootDirs` and `include` entries that use it.
- fa12319: fix(svelte2tsx): key `<slot name={expr}>`'s `__sveltets_createSlot(...)` call
  with the verbatim source text of the `name` attribute's value node, braces and
  inner whitespace included, instead of re-serializing the expression. Upstream's
  `surroundWith` wraps the raw `[start, end]` source slice in quotes rather than
  printing the parsed expression, so `name={n}` must produce `"{n}"`, not `"n"`.
  Also stop concatenating multi-part attribute values (`name="a{b}c"`) — upstream
  only ever reads `value[0]`.
- 7d635d5: fix(svelte2tsx): reproduce upstream's opening- and closing-tag whitespace
  accounting. Upstream lowers a tag by moving every kept source range to the end
  of the transformed range, collapsing each run of characters between two kept
  ranges to a single space; those spaces are observable in the output. rsvelte
  emitted a fixed single space instead, so `<div {...attributes}>` produced
  `{ ...attributes,}` where upstream produces `{...attributes,}`. Also rewrite
  `{:else}` character-by-character (`}else{`, no inserted spaces) and stop
  treating `{:else}{#if …}` as an `{:else if}`.

## 0.5.6

### Patch Changes

- 57a4cec: Follow the array form of tsconfig `extends` (TS 5.0+). A config extending several parents — the shape SvelteKit and WXT force on a project that also wants a shared base, `["../tsconfig.base.json", "./.svelte-kit/tsconfig.json"]` — had its whole `extends` graph skipped, so the generated config's `include` and `paths` never reached the overlay and its ambient modules (`$env/dynamic/public`, `./$types`) were reported as TS2307. Entries are now searched right to left, later ones winning, matching `tsc`.

## 0.5.5

### Patch Changes

- 6ea4b7e: Reduce svelte2tsx source scanning by collecting validation markers in the
  existing source-feature pass.
- 66ac8b6: Reduce svelte2tsx output allocation by reserving the exact generated
  MagicString bundle code size.
- 5f4f61c: Reduce svelte2tsx source-map overhead by scanning unmapped UTF-8 content once
  while updating generated UTF-16 columns.
- 59f0ad7: Reduce svelte2tsx MagicString growth by lazily reserving storage for the first
  set of source splits.
- bd1c724: Reduce svelte2tsx instance-script work by collecting import ranges during the
  existing top-level statement traversal.
- 09e2658: Reduce svelte2tsx transformation overhead by reusing MagicString overwrite
  boundary lookup results.
- e7cba19: Reduce svelte2tsx store scanning by reusing parsed script body ranges.
- b9d5ef4: Reduce svelte2tsx opening-tag scans by starting after the final parsed
  attribute.
- 76bd9f4: Reduce svelte2tsx parse time and memory by skipping discarded template
  comment AST conversion when comments are not requested.
- 4445c51: Reduce svelte2tsx parse time and memory by skipping unused expression
  location objects.
- 4dae1ba: Reduce svelte2tsx source-map work by specializing bundle generation for its
  pre-reserved mapping capacity.
- 2729edc: Reduce svelte2tsx formatting overhead for common Svelte 5 component exports.
- e2692ed: Reduce svelte2tsx transformation overhead by streaming the component return
  object into its output buffer.

## 0.5.4

### Patch Changes

- fbd0d37: Fix a **relative** `.svelte`-suffixed import never resolving under ESM-mode
  module resolution. With `moduleResolution: node16`/`nodenext` inside a
  `"type": "module"` package — the configuration every published Svelte component
  library uses — TypeScript performs no implicit extension substitution, so the
  only candidate it probes for `./x.svelte` is `./x.d.svelte.ts`. Neither the
  overlay's `.svelte.tsx` shadow nor a real `x.svelte.ts` rune module was ever
  reached, the specifier fell through to the ambient `declare module '*.svelte'`
  wildcard, and every _named_ import errored with
  `Module '"*.svelte"' has no exported member 'X'` (a default import silently
  degraded to `any`). Both shapes were affected: a plain `.ts` barrel
  re-exporting a component's `<script module>` type
  (`export type { ArrowProps } from './anatomy/arrow.svelte'`) and a `.svelte.ts`
  rune module imported with the extension stripped
  (`import { useProvider } from './modules/provider.svelte'`).

  The overlay now emits the `.d.svelte.ts` file TypeScript actually looks for
  next to every component shadow, and — for a `.svelte.ts` / `.svelte.js` rune
  module with no sibling component — a bridge re-exporting the real module.
  Resolution no longer depends on the specifier's shape (relative, `paths`-aliased
  or bare) nor on whether the importing file is a `.svelte` shadow we can rewrite
  or a plain `.ts` source we cannot, matching how official `svelte-check` forces
  the pre-ESM algorithm for `.svelte` specifiers in its own `resolveModuleNames`
  hook.

  Fixes #1916.

- f148cdf: svelte2tsx: stop emitting a store auto-subscription for `$props.id()` when the
  component also declares a binding named `props` from `$props()`.

  `const props: Props = $props()` next to `const id = $props.id()` made the
  text-level `$name` scan see a `$props` token beside a declared `props`, so it
  injected `;let $props = __sveltets_2_store_get(props);` right after the
  declaration — after the `$props()` call that opens the same line, which
  TypeScript then reports as `TS2448: Block-scoped variable '$props' used before
its declaration`.

  Upstream's `processInstanceScriptContent` tags each `$props.id()` occurrence
  `isPropsId` and drops all of them once it has seen a `props` binding
  initialized by literally `$props()`; that pair of conditions is now mirrored, so
  `$props.id` without a call, `$props.id(arg)`, a non-rune `let props = {}`, and
  `$state.snapshot(state)` all keep upstream's behaviour. Fixes upstream's own
  `props-variable-and-$props.id{,-destructured,-spread}.v5` samples and removes 30
  false-positive `TS2448` diagnostics from the svelte-check e2e parity corpus.

  Fixes #1917.

- e23a4a4: Fix `--workspace .` (a relative workspace path — the documented CLI form) emitting one extra `../` in rewritten escaping relative imports, producing false-positive `TS2307` diagnostics.

  Two compounding bugs in the `svelte2tsx` external-import rewrite pass: `relative_posix` filtered empty path segments but not `.`, so a leading `./` (introduced when a relative `.` workspace path is joined onto a file path) was counted as one directory level — one `../` too many in any specifier that did get rewritten. Separately, a relative workspace made `is_within_dir`'s containment check fail to recognize workspace-internal targets, so the rewrite fired at all for imports that resolve inside the workspace and need no rewrite.

  `relative_posix` now skips `.` segments. `rewrite_external_imports.rs` otherwise keeps its existing "inputs are absolute" contract — the actual fix is `svelte-check`'s `runner::run` absolutizing `RunOptions::workspace` once at its entry point (the same class of fix as #1900's `oxc_resolver` absolutization), so every downstream path (walked files, the overlay's `.tsx` shadows, the `workspace_path` handed to svelte2tsx) is consistently absolute regardless of how `--workspace` was spelled on the command line.

- b379d80: Fix a false `implicit any` (TS7031/TS7006) on SvelteKit route files whose
  handlers are written as `const` arrow functions or function expressions
  instead of `export function` declarations — e.g. `+server.js`'s
  `export const GET = async ({ url, locals }) => {...}`. `kit_file.rs`'s
  route-handler matcher (`add_api_method_types`) matched only
  `FunctionDeclaration`, the same #1886 narrowing recurring in the route arm
  after #1892 fixed it for hooks only. Audited the rest of the route-file
  augmentation for the same gap: `entries` had no `const`-form handling at
  all (now fixed alongside `GET`/`PUT`/`POST`/`PATCH`/`DELETE`/`OPTIONS`/
  `HEAD`/`fallback`), and `params/*.js`'s `match` had the identical
  `FunctionDeclaration`-only narrowing (also fixed). `load`'s `const` form
  was already covered by the existing `satisfies` wrapper.

  Extended the `kit-routes-js` fixture with arrow-const arms for `GET`,
  `match`, and `entries` to guard against regressions of this narrowing.

- 6d7be78: Make `--tsgo` mean "type-check with the TypeScript 7 native compiler", matching
  official svelte-check's flag of the same name (sveltejs/language-tools#3073).
  TypeScript 7 is looked up as `@typescript/native` — the npm alias it is
  installed under when a TypeScript 6 `typescript` has to stay alongside it — and
  then as the legacy `@typescript/native-preview`, accepting only major 7 or
  newer. Resolution goes through the package directory rather than
  `node_modules/.bin`, because an aliased TypeScript 7 declares the same `tsc` bin
  name as the real `typescript` and whichever install wins that shim is an
  install-order coin flip.

  Without the flag, the workspace's own `tsc` is used whatever its major version
  is, exactly as before. Passing `--tsgo` with no TypeScript 7 installed is now an
  error rather than a silent downgrade to a different compiler; the message tells
  you how to install it:

  ```sh
  npm install --save-dev typescript@~6 @typescript/native@npm:typescript@7
  ```

## 0.5.3

### Patch Changes

- e5ae47d: Fix `rsvelte-check --output machine-verbose` (and the terser `machine`
  format) diverging from upstream `svelte-check`: they were line-oriented text
  with no diagnostic `code`, instead of upstream's one-`<epoch-ms> <JSON>`-
  line-per-diagnostic shape (`type`/`filename`/`start`/`end`/`message`/`code`/
  `source`, 0-indexed `start`/`end`), and were missing the bracketing `START`
  / `COMPLETED` lines. Drop-in consumers (editor integrations, CI annotators,
  scripts keyed on `code`) can now parse rsvelte's machine output the same way
  they parse upstream's. Fixes #1901.

  Fix the overlay tsconfig synthesized for a `--tsconfig`-less run specifying
  no `target`, which let tsgo/tsc fall back to the ES5 default lib — the
  vendored shims themselves then failed to compile (`Cannot find name
'Iterable'`) before any user code was considered. The overlay now mirrors
  official svelte-check's own default-compiler-options forcing: an unset
  target becomes the latest (`ESNext`), and a target below ES2015 is bumped
  up to ES2015; an already-modern target is left untouched. Fixes #1898.

- 2ce282c: Fix `<svelte:boundary onerror={e => ...}>`'s callback parameter reporting a
  false `implicit any`. The embedded `svelte-jsx-v4.d.ts` shim's
  `IntrinsicElements` had no `'svelte:boundary'` entry, so the generated
  `svelteHTML.createElement("svelte:boundary", { onerror: ... })` call fell
  through to the interface's `[name: string]: { [name: string]: any }`
  catch-all — every prop (including `onerror`) contextually typed as bare
  `any`, which doesn't propagate a parameter type to an inline arrow function
  the way an actual function-typed prop would.

  Added the missing `'svelte:boundary'` entry (`onerror`/`failed`/`pending`,
  mirroring `svelte/elements`' own `SvelteHTMLElements['svelte:boundary']`),
  matching how `'svelte:window'`/`'svelte:body'`/`'svelte:document'` are
  already declared in the same interface.

  Fixes #1889.

- 9c77a3e: Track the installed Svelte's element typings instead of a frozen snapshot.
  The overlay used to inject the vendored `svelte-jsx-v4.d.ts` unconditionally,
  whose hand-enumerated `svelteHTML.IntrinsicElements` predates every tag
  `svelte/elements` has gained since the shim was copied — so a post-snapshot
  element's props fell through to the interface's
  `[name: string]: { [name: string]: any }` catch-all and became bare `any`
  (#1889's `<svelte:boundary onerror>` was one instance of that class).

  svelte2tsx's `get_global_types` is now ported: when the project's own
  `<sveltePath>/svelte-html.d.ts` exists (Svelte 4+), it is added to the program
  and the vendored JSX shim is dropped. That file extends `SvelteHTMLElements`
  from the installed `svelte/elements`, so element and attribute types follow the
  user's Svelte version instead of a copy date. Projects where `svelte` cannot be
  resolved from the workspace keep the vendored shims as a fallback.

- b311eec: Split the embeddable compiler, TypeScript projection, project checker, bindings support, and development tools into ownership-focused Rust crates while preserving the existing JavaScript and CLI behavior. Add the stable `rsvelte` facade, crates.io package gates, and an independently versioned `rsvelte_esrap` 0.8.0 release.
- 6893718: Fix a plain `.ts`/`.js`/`.svelte.ts` source file's `paths`-aliased `.svelte`
  import never resolving to the component's real type. Only `.svelte` files go
  through svelte2tsx, so `rewrite_aliased_svelte_imports` never touched a plain
  source file that imports a `.svelte` component the same way — the alias fell
  back to the ambient `declare module '*.svelte'` wildcard, surfacing either as
  `Module '"*.svelte"' has no exported member 'X'` (a named `<script module>`
  export) or `Type 'Comp' is not generic` (a default import used as a generic
  type annotation). This also cascaded into any `.svelte` file that consumed a
  type declared this way, reporting a spurious mismatch against the (correctly
  typed) component.

  For every discovered `.svelte` file reachable through a `paths` alias, the
  overlay tsconfig now adds an exact (non-wildcard) `paths` entry redirecting
  that specific specifier straight at the component's shadow `.tsx` — since the
  resolved target no longer ends in `.svelte`, the ambient wildcard is never
  consulted, regardless of which kind of file does the importing. The original
  `paths` (including unrelated entries) is preserved; only this component's
  own alias gets a more specific override alongside it.

  Restating `paths` in the overlay tsconfig follows TypeScript's own resolution
  rules: targets resolve against `baseUrl` when one is set (including one
  inherited through `extends`), else against the directory of the config that
  declared `paths`, and every target of a multi-target entry is kept.

  Fixes #1888.

- 6b52469: Fix a residual false `implicit any` on SvelteKit files written as plain
  JS/JSDoc `export function` declarations (not TypeScript): hooks
  (`handle`/`handleError`/`handleFetch`/`reroute`), route `load`/`entries`,
  `+server.js` request-method handlers (`GET`/`POST`/...), and
  `params/*.js`'s `match` all prepended their `/** @type {...} */` or
  `/** @param {...} */` JSDoc annotation between `export` and `function`,
  which TypeScript silently ignores. A JSDoc tag only re-types a `function`
  declaration when it leads the _entire_ exported statement — matching the
  official implementation, whose `ts.FunctionDeclaration.getStart()`
  includes the `export` modifier in the node's own span. Every affected
  parameter stayed implicit `any` despite the annotation being present in
  the overlay.

  The `const` + arrow-function/function-expression form (`export const
handle = (...) => {...}`, fixed by #1892) already anchored the JSDoc
  annotation correctly and is unaffected.

  This completes #1886's fix for the JSDoc/JS path (closed by #1892, but
  the `kit-hooks-js` fixture still diverged for the plain `export function`
  hooks) and fixes the same latent bug across the other four JSDoc-emitting
  paths in `kit_file.rs`, previously untested by the diagnostic-parity gate
  — added a new `kit-routes-js` fixture covering all four.

- c44ff68: Fix a bare package specifier deep-importing a `.svelte` file from a
  `node_modules`-symlinked sibling (`import X from 'libs/components/x.svelte'`)
  resolving to the ambient `declare module '*.svelte'` fallback, so the
  component's `<script module>` named exports were reported missing.

  `rootDirs` only bridges relative specifiers, so a bare one has to be rewritten
  to point at the sibling's shadow directly. The rewrite resolved the specifier
  from the importing file's directory, which `--workspace .` — the documented CLI
  usage, and what the overlay walks with — leaves relative; a relative resolution
  base has no parent to climb, so the resolver's `node_modules` walk-up never
  reached the sibling's symlink and nothing was rewritten. A `paths`-aliased
  specifier was unaffected because it resolves through the tsconfig's own
  absolute base.

  Fixes #1900.

- 92ba89f: Fix `--tsgo`/`svelte-check` false `implicit any` on SvelteKit hooks written as
  `export const handleFetch = async ({ request, fetch, event }) => {...}`
  (the `const` + arrow/function-expression form). Only the function-declaration
  form (`export function handleFetch(...) {...}`) was augmented with parameter
  and return types before; the `const` form now gets the same treatment.

  Also wrap every kit-file type injection (hooks, `load`, `actions`, params,
  route methods) in the same `Ωignore` markers the official implementation
  uses, so a diagnostic the injected type itself provokes (e.g. an async
  hook's `ReturnType<HandleFetch>` tripping TS1064, since `HandleFetch`
  returns `MaybePromise<Response>` rather than a literal `Promise<T>`) is
  dropped instead of surfacing as a false positive — matching official
  svelte-check's `isInGeneratedCode` allowlist.

  The arrow form's return type is anchored on the `=>` token, matching the
  official implementation's `equalsGreaterThanToken.getStart()` byte-for-byte,
  and a parenthesis-less arrow parameter (`export const handleError = e => ...`)
  gets wrapped in parentheses so the annotation is syntactically valid.

  Fixes #1886.

- a4ece55: Fix `ComponentProps<typeof X>['prop']` losing its callback's parameter types
  when `X` is a component reached through a self-referential `paths`/bundler
  alias _inside its own external (workspace-sibling) package_ — a common
  monorepo pattern where a design-system package imports its own components
  through the same public alias its consumers use, not a relative path.

  `emit_external_shadows` (which materialises shadows for a sibling package
  discovered via a `node_modules` symlink) never rewrote aliased `.svelte`
  imports inside the shadows it emits, so a component's own such import fell
  back to the ambient `*.svelte` wildcard (default export only) in its shadow —
  poisoning `ComponentProps<...>` for every consumer. `rewrite_aliased_svelte_imports`
  now also matches specifiers resolving under an external package's own real
  dir (not just the workspace), and `emit_external_shadows` runs it too.

  Also anchor a relative `--tsconfig` path on the CWD before building the
  alias-resolution `Resolver` — otherwise oxc_resolver's tsconfig discovery
  silently returns `NotFound` for any `paths` target escaping the CWD via `..`,
  which is exactly the cross-package aliases this fix (and `--tsconfig
./tsconfig.json`, the CLI's own documented usage) depends on.

  An external package's aliases are resolved with that package's own tsconfig
  when it ships one, and a specifier that resolves outside the package being
  emitted keeps its original form — `$lib` is SvelteKit's own convention, so a
  consumer and a package routinely both define it, and resolving the package's
  own import with the consumer's `paths` would silently swap in an unrelated
  component.

  Fixes #1887.

- a82a230: svelte2tsx: keep comments that sit between the last attribute and the `>` of an element or component opening tag, matching official svelte2tsx's trailing-comment handling.
- c5c4c26: Fix `--tsgo`/`svelte-check` false "has no exported member" / "has no default export" diagnostics for a `.svelte` import resolved through a `tsconfig.json` `compilerOptions.paths` alias (e.g. SvelteKit's `kit.alias`) into a sibling workspace package with no `node_modules` entry at all. `discover_external_svelte_packages` previously only found sibling packages reachable via a `node_modules` symlink (#782/#805); it now also resolves `paths` alias targets that land outside the workspace and mirrors those too.

  Also fixes a related bug this surfaced: with a relative `--tsconfig` path (the CLI's own documented usage, `--tsconfig ./tsconfig.json`), `oxc_resolver`'s tsconfig discovery silently returned `NotFound` for any `paths` target that resolves outside the current working directory via `..` — exactly what every cross-package alias does. `build_svelte_import_resolver` now absolutises the tsconfig path before handing it to `oxc_resolver`.

  Alias targets follow TypeScript's own rules — resolved against `baseUrl` when
  one is set (including one inherited through `extends`), else against the
  directory of the config that declared `paths`. A target that does not exist is
  skipped rather than widened to its parent directory, and one that names a
  directory _containing_ the workspace (`"@/*": ["../../*"]` in a monorepo) is
  never mirrored: the workspace's own files are already covered and the walk
  would cover the whole repository.

## 0.5.2

### Patch Changes

- 9edd0da: fix(svelte-check): stop a same-name `Foo.svelte.ts` / `.js` companion from hiding `./Foo.svelte`'s component module. TypeScript resolves a relative `./Foo.svelte` by appending extensions in the importer's own directory, so a sibling companion always wins over the overlay's `Foo.svelte.tsx` shadow (`rootDirs` is only a fallback and `paths` never applies to relative specifiers). The component's default export and its `<script module>` named exports therefore vanished — a companion or barrel importing them reported `has no default export`, `declares 'X' locally, but it is not exported` and `Circular definition of import alias`. The overlay now emits a `companion-augment.d.ts` that augments the module TypeScript actually picked with the shadow's default and module-context exports, so both halves resolve. Importing the companion's own named exports through `./Foo.svelte.js` is unchanged.

## 0.5.1

### Patch Changes

- cb4a3e5: perf(fmt): make the formatter significantly faster; borrow the parser AST from source

  A sweep of formatter and parser performance work, all verified byte-for-byte
  identical against the full compiler test suites and the formatter parity corpus
  (no output changes).

  **Formatter (`@rsvelte/fmt`) — significantly faster.** On real-world corpora the
  multi-threaded CLI is roughly **1.4× faster** than before, and single-threaded
  in-process formatting is down ~40% from the start of this work. The wins stack:

  - `mimalloc` as the `rsvelte-fmt` CLI global allocator — removes the page-churn
    the system allocator paid streaming one file at a time (the largest CLI win).
  - The initial parse now **defers `<script>` bodies and template expressions**:
    the formatter re-parses both from source anyway, so the eager phase-1 parse was
    pure waste. TypeScript-in-plain-`<script>` (#682) still round-trips via a
    dialect-sensitive retry.
  - A **per-thread oxc scratch allocator** reused across a file's throwaway parses,
    a `Doc` printer that **borrows** instead of cloning its measured subtree, and
    expression fast-paths + within-file memoization for repeated expressions.
  - The collapse post-pass re-parse is gated on a structural candidate check and
    reindent/reflow scans bytes instead of `Vec<char>`.

  **Parser AST (`@rsvelte/compiler`) — internal zero-copy refactor.** The parser
  AST gained a source lifetime (`Root<'a>`) and `Text` nodes now borrow their raw
  data directly from the source (`Cow<'a, str>`) instead of copying it, trimming
  per-file allocations in the parse phase. This is an internal refactor only — the
  compiler's output and public API are unchanged.

## 0.5.0

### Minor Changes

- ac7902e: feat(svelte-check): honor function `compilerOptions.warningFilter` via a Node sidecar

  `rsvelte-check` reads diagnostic-relevant `compilerOptions` from `svelte.config.*`
  statically, but `warningFilter` is a JS predicate the native compiler can't
  evaluate, so it was silently ignored — a warnings-only divergence from the
  official `svelte-check` for projects that use it.

  When `svelte.config.js` declares a function `compilerOptions.warningFilter`,
  `rsvelte-check` now spawns the consumer's Node **once per run** against a small
  bundled sidecar (`lib/warning-filter.mjs`) that imports the config and applies
  the function to the run's collected compiler warnings in a single batch. Because
  `warningFilter` is a pure per-warning predicate, this post-pass is exactly
  equivalent to Svelte's emit-time filter (the same argument the NAPI shim uses).

  The sidecar never rejects: a missing Node, an unimportable config, a timeout, or
  a malformed response all degrade to "keep every warning" plus a one-time stderr
  note — the filter never silently drops a warning, and the exit code is unaffected.
  A project with no function `warningFilter` never spawns Node (zero overhead).

## 0.4.1

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

- 9b454da: fix(svelte-check): set `allowImportingTsExtensions` in the overlay tsconfig so aliased `.svelte` imports (e.g. SvelteKit's `$lib/...`) no longer require it in the user's tsconfig

## 0.4.0

### Minor Changes

- 9522b0d: feat(svelte-check): upstream CLI flag parity — `--config`, `--no-tsconfig`, `--threshold`, `--preserveWatchOutput`

  - `--config <path>`: use an explicit `svelte.config.*` / `vite.config.*` instead of discovery; a missing path exits with code 2, matching the JS reference.
  - `--no-tsconfig`: check only the Svelte files under the workspace, ignoring any project tsconfig/jsconfig.
  - `--threshold error|warning`: filter which diagnostics are printed; counts and the exit code stay computed from the unfiltered set, matching the JS reference.
  - `--preserveWatchOutput` is now the canonical spelling (the hyphenated `--preserve-watch-output` remains as an alias), and `--tsgo-experimental-api` is accepted as an alias of `--tsgo`. `--color` / `--no-color` are accepted for CLI compatibility (output is un-colorized either way).

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

## 0.3.10

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

- 52faffa: fix: add NAPI envelope bounds checks and propagate signal death as non-zero exit

  `parse-envelope.js` now applies the same window bounds checks as `envelope.js`
  (M-012), so a malformed or version-skewed envelope throws instead of silently
  decoding a truncated AST. The svelte-check launcher now maps a signal-killed
  native binary to a non-zero exit code (128 + signal) instead of reporting 0,
  matching the fmt launcher.

- e830dd6: fix(svelte-check): preserve non-ASCII tsconfig content, contain overlay emit paths, accept non-UTF-8 tsconfig paths

  `strip_jsonc_comments` rebuilt retained bytes with `out.push(c as char)`, mangling
  multi-byte UTF-8 in tsconfig values. It now accumulates raw bytes and converts once
  at the end. Overlay emit-path joins are routed through a `safe_relative()` helper so
  a source outside the workspace can no longer produce an absolute join target outside
  the cache dir, and `run_tsgo` passes the tsconfig path as `OsStr` instead of
  panicking on non-UTF-8 paths.

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

- 8ef55c0: perf(svelte-check): cache kit source bodies during diagnostic mapping

  Kit diagnostics re-read and re-scanned the kit source file once per diagnostic.
  The mapper now caches source bodies per run (mirroring the existing tsx cache),
  and the two per-call regex compilations are hoisted into `LazyLock` statics.

- 10f599f: perf(svelte2tsx): drop the two full-source `to_ascii_lowercase` copies

  `blank_style_content` and the orphan-`<script>` scanner each allocated a
  lowercased copy of the entire source just to case-insensitively find
  `<style` / `<script` tag tokens. Replace both with an allocation-free
  `find_ci` byte scan (`eq_ignore_ascii_case` on the tag-name window),
  matching the approach the fallback `<style>` scanner already uses. Output
  is byte-identical (same ASCII case folding, same match positions);
  verified against the full svelte2tsx fixture suite.

## 0.3.9

### Patch Changes

- 394344a: chore: upgrade the mirrored Svelte compiler to 5.56.4

  Ports the two `packages/svelte/src/compiler` changes in 5.56.4: `{@const}`
  declarator end now includes wrapping parentheses and its `VariableDeclaration`
  starts at the `const` keyword (#18436), and optional-parameter `?` is stripped
  in `svelte`-lang TS (#18448). svelte2tsx's `{@const}` handler is updated for the
  new declarator span so it no longer duplicates the keyword (`const const x = …`).

## 0.3.8

### Patch Changes

- 12ca8be: fix(svelte-check): re-release to pick up post-0.3.7 svelte2tsx overlay fixes

  `@rsvelte/svelte-check` builds the TSX overlay it type-checks by calling the
  same `rsvelte_core` svelte2tsx code that ships in `@rsvelte/svelte2tsx`, but it
  is a self-contained native binary with no npm dependency edge to
  `@rsvelte/svelte2tsx` (or `@rsvelte/compiler`). Because of that, changesets
  never cascades a core/svelte2tsx change into svelte-check — it only bumps when a
  changeset names it explicitly.

  `@rsvelte/svelte-check@0.3.7` was cut on 2026-06-26, _before_ several svelte2tsx
  overlay fixes landed, and those fixes were only released through
  `@rsvelte/svelte2tsx@0.1.20` (2026-07-03) — svelte-check was left stale. This
  re-release rebuilds the binary against the current core so svelte-check's
  type-checking diagnostics reflect the same overlay as the standalone tool.
  Included behaviors that were missing from 0.3.7:

  - carry a renamed-export's JSDoc onto the prop (#1230)
  - widen a renamed legacy prop with a typed default via `__sveltets_2_any` (#1231)
  - bind a component child's legacy `let:` from its own `$$slot_def` (#1232)
  - drive svelte2tsx corpus output-parity to zero — 254 → 0 (#1295)

## 0.3.7

### Patch Changes

- ebe52bc: feat(svelte-check): read Svelte `compilerOptions` from an inline `sveltekit()` plugin call in `vite.config`

  SvelteKit 2.62.0 lets you pass the Svelte config (`compilerOptions`,
  `preprocess`, …) inline to the `sveltekit()` plugin in `vite.config.{js,ts}`
  instead of a separate `svelte.config.js`, and ignores `svelte.config.js`
  entirely when you do (see https://svelte.dev/docs/kit/configuration).

  `svelte-check`'s static config reader previously only recognised a
  `svelte()` plugin call. It now also recognises `sveltekit({ compilerOptions })`
  and, matching SvelteKit's behaviour, suppresses `svelte.config.js` when the
  `sveltekit()` plugin is given inline config (the plain `svelte()` plugin keeps
  its merge semantics). `--watch` now reruns on `vite.config.{mjs,cjs}` and the
  `svelte.config.{mjs,cjs}` variants as well.

## 0.3.6

### Patch Changes

- 032b301: svelte-check: find a workspace-hoisted `tsgo` (or `tsc`) in monorepos.
  `find_compiler` only looked in `<workspace>/node_modules/.bin`, but pnpm
  (and npm/yarn workspaces) hoist the binary to the **repo-root**
  `node_modules/.bin`, so a nested package (`apps/foo/frontend/app`) has no
  local `.bin/tsgo`. `--tsgo` therefore silently fell back to `tsc`, which is
  ~3-4x slower — the whole point of `--tsgo` was lost. The lookup now walks
  the workspace and every ancestor directory, preferring a hoisted `tsgo`
  over a locally-resolvable `tsc`. On a large SvelteKit monorepo this took the
  per-package check from ~34s (silent tsc) to ~8s (actual tsgo).
- 032b301: svelte-check: in `--incremental` mode, emit `incremental` + `tsBuildInfoFile`
  into the overlay tsconfig so tsgo / tsc persist their program graph and
  per-file check state across runs. Previously `--incremental` only
  short-circuited svelte2tsx (the cheap part); the compiler still re-parsed and
  re-checked all ~8k program files (node_modules `.d.ts` included) every run —
  the dominant cost. The overlay tsconfig is byte-stable across runs, so the
  build info stays valid and an unchanged warm run on a large SvelteKit app
  drops from ~5.5s to ~1.5–1.9s.

## 0.3.5

### Patch Changes

- bc1c4e2: svelte-check: fix a panic (`byte index … is not a char boundary`) when a
  generated-TSX diagnostic lands on a line containing multi-byte characters
  (e.g. Japanese). `line_col_to_byte_offset` treated the 1-based diagnostic
  `column` as a byte offset; for non-ASCII lines that lands mid-codepoint, and
  the subsequent `text[off..]` slice in the `Ωignore`-region check panicked.
  It now walks char boundaries so the offset is always valid.

## 0.3.4

### Patch Changes

- 29f1216: svelte-check: type SvelteKit `load` parent/streamed data correctly by
  co-locating a rewritten `$types.d.ts` (and any sibling `proxy+layout.ts` /
  `proxy+page.ts`) with each route's shadows, pointing them at the **injected**
  mirror route file instead of the raw on-disk source.

  svelte-kit's generated `$types.d.ts` derives `PageData` / `LayoutData` from
  `ReturnType<typeof import('…/+layout.js').load>`. In the overlay (subprocess)
  model that specifier resolves — via `rootDirs` — to the _source_ `+layout.ts`,
  whose `load` event is un-annotated, so an un-typed `await parent()` collapses
  parent/streamed props to `any`. `materialize_kit_files` already writes an
  injected mirror (`(…) satisfies LayoutLoad`) that types the event, but nothing
  referenced it. Official svelte-check avoids this only because its in-memory
  language service serves the injected text _as_ the source file's content; a
  subprocess driver (tsc/tsgo over a real overlay dir) can't overlay on-disk
  content.

  The fix co-locates the rewritten `$types` (an exact-directory match that wins
  over the `rootDirs` route to the source copy — no global `rootDirs`
  reordering, so non-kit resolution is untouched) and, for routes whose `load`
  carries an explicit `: LayoutLoad` annotation (where svelte-kit emits a
  `@ts-nocheck` `proxy+layout.ts`), copies the proxy alongside so the whole
  type chain stays on the mirror tree.

  Verified end-to-end against a large SvelteKit app: the remaining 2
  `implicitly has an 'any' type` false positives clear (**140 → 0**, matching
  official svelte-check's in-memory mode). Confirmed it is a genuine typing fix,
  not error suppression: across six injected-error probes (parent/streamed
  `navItems` in both a plain and a proxy route, `load`-body errors in both, a
  plain `.svelte` script error, and a cross-package design-system prop misuse)
  the overlay reports the exact same diagnostics as official svelte-check's
  ground-truth mode — i.e. `navItems` is typed as its real type, so real errors
  are still caught.

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
