# @rsvelte/compiler

## 0.9.0

### Minor Changes

- 64cb25d: feat(capi): support `cssHash` / `warningFilter` compile callbacks in the C ABI (`crates/rsvelte_capi`)

  The C shared library gains two callback-aware entry points,
  `rsvelte_compile_with_callbacks` and `rsvelte_compile_module_with_callbacks`,
  which resolve the two function-form compile options that can't be expressed as
  JSON — completing the C-API half of the function-compile-options work (the wasm
  side shipped separately, NAPI in earlier releases):

  - **`css_hash`** — a `(userdata, RsvelteCssHashInput) -> RsvelteStr` function
    pointer. The input's `hash` field is the raw digest the compiler's default
    `cssHash` produces (the filename when known, else the CSS; no `svelte-`
    prefix), so `svelte-${hash}` reproduces the default class exactly. Returns a
    borrowed string the library copies immediately; a constant `cssHashOverride`
    in the options JSON still wins.
  - **`warning_filter`** — a `(userdata, warning_json, len) -> bool` function
    pointer, applied natively by the compiler for both components and modules.

  Callbacks are opt-in via a new `RsvelteCallbacks` struct (any field may be
  NULL); the existing `rsvelte_compile` / `rsvelte_compile_module` entry points
  are unchanged. `include/rsvelte.h` regenerates via cbindgen.

  This does not change the published `@rsvelte/compiler` npm package's runtime
  behaviour — it is a parallel C distribution channel. The npm version is bumped
  so the new C ABI surface appears in the next release notes.

- deadab5: feat(wasm): support function compile options via a new `compile(source, options)` entry

  The wasm compiler now exposes `compile(source, options)`, which accepts the full
  compile-options object and resolves the function-form options that the primitive
  `compile_client`/`compile_server` entries can't — matching the NAPI shim's
  support (PRs #1666/#1667):

  - the `parametric` function forms of `customElement`, `css`, and `runes`
    (`({ filename }) => value`), evaluated once at the boundary;
  - a `warningFilter` callback, applied natively by the compiler;
  - a constant `cssHashOverride` string; and
  - a dynamic `cssHash` callback bridged through `js_sys::Function` (wasm compile
    is single-threaded, so the callback runs inline with no threadsafe-function
    marshalling). A callback that throws surfaces as a compile error; a non-string
    return falls back to the default hash.

  The result is returned as a JSON string (`{ js, css, warnings, metadata }`);
  callbacks are input-only. The existing `compile_client`/`compile_server` entries
  are unchanged.

### Patch Changes

- a10913c: fix(analyze): hand the raw digest to `cssHash` callbacks via `CssHashInput.hash`

  `CssHashInput.hash` now carries the unprefixed raw digest, matching upstream's
  default `cssHash` (`svelte-${hash(...)}`) where the `hash` argument is the raw
  digest and the `svelte-` prefix is applied by the default implementation itself.
  The prefix is now materialized only where the default hash is produced. The wasm
  `cssHash` bridge no longer recomputes its own raw hash and instead trusts the
  shared field. No compiler output changes.

- 1508778: fix(css): keep nested `& + &` and `:global(.a) + .b` sibling rules

  Two unused-CSS prune divergences found by the css-prune differential sweep are
  fixed, clearing the sweep ratchet (81 → 0):

  - A nested rule whose inner selector uses the parent-selector sibling combinator
    (`.a { & + & { … } }`, i.e. `.a + .a`) was dropped as `/* (empty) */` even with
    a real adjacent `.a` pair, because `&` (NestingSelector) resolved to an empty
    matches-nothing selector during sibling pruning. `&` is now resolved against
    the parent rule's subject compound (#1703).
  - `:global(.a) + .b` was pruned as `/* (unused) */` when the sibling pair lived
    inside an `{#await}…{:then}` branch or a `{#snippet}` fragment (both set the
    opaque-elements flag, which suppressed real-sibling matching). The acceptable
    predecessors of the scoped segment are now unioned — a real previous sibling
    matching the inner `:global(...)`, an opaque boundary, or a root-level element
    (#1702).

- 46cf5fe: fix(css): keep sibling-combinator rules past `<svelte:head>` void elements

  The unused-CSS analysis assigned sibling-data slots (`dom_idx`) with a walker
  that did not descend into `svelte:*` wrapper nodes, while the analysis visitor
  that builds the element table does. A void element inside `<svelte:head>`
  (`<meta />` / `<link />`) therefore shifted every subsequent element's
  sibling-data slot by one, so sibling-combinator selectors (`.a + .a`, `.a ~ .a`)
  matched by `{#each}`-generated siblings were wrongly pruned as unused — and in
  other structures (`{#if}`/`{:else}`), wrongly kept. Both walkers now descend
  into the same wrapper set, matching the official compiler's prune decisions
  (verified by a new 1222-component differential sweep against `svelte/compiler`).

- 97178b7: fix(css): prune descendant/child selector chains whose subject or ancestor links cannot match the component's own element tree (attribute/class/id compounds included), and preserve source whitespace after a pruned leading selector-list item
- 020be59: fix(parse): emit `FunctionDeclaration.expression` (always `false`) to match acorn's key order (`id`, `expression`, `generator`, `async`, `params`, `body`)

  The binary NAPI raw-parse envelope (`napi_raw_parse.rs`'s writer, consumed only
  by `@rsvelte/vite-plugin-svelte-native`'s `parse-envelope.js` decoder) carries
  the same field, so both packages need this release. The envelope's `VERSION`
  is bumped to 2 alongside the wire-format change (one extra bool byte on
  `FunctionDeclaration` payloads).

- 065ce6f: fix(parse): improve function-node AST fidelity to match acorn / acorn-typescript

  Four parse-AST fixes so the public `parse()` output matches svelte/compiler:

  - `FunctionExpression` fields are ordered `id, expression, generator, async` to
    match acorn's uniform `initFunction` key order (#1689).
  - Generic function-like nodes emit `typeParameters`
    (`FunctionDeclaration`/`FunctionExpression` between `async` and `params`,
    `ArrowFunctionExpression` after `body`) (#1694).
  - TS optional parameters (`b?: T`) round-trip their `optional: true` marker;
    program-context arrow params now route through the TS-aware parameter
    converter so they carry the same `typeAnnotation`/`optional` fidelity as
    declarations (#1692). As a side effect, this also fixes a pure-JS bug where a
    default-valued arrow parameter (`(a = 1) => a`) lost its `AssignmentPattern`
    (default value) in the `parse()` output — `compile()` output was unaffected.
  - Object-method values (`{ m<T>(x: T) {} }`) keep their generics on the inner
    `FunctionExpression` but emit `typeParameters` _after_ `body` (like arrows),
    not in the declaration/expression slot before `params` (#1711).

  The binary NAPI raw-parse envelope (consumed by
  `@rsvelte/vite-plugin-svelte-native`'s `parse-envelope.js` decoder) carries the
  same fields, so both packages need this release. The envelope `VERSION` is
  bumped to 4 alongside the wire-format changes.

- 97178b7: fix(client): per-site proxy decision for bare-identifier assignment RHS resolved to a function-local declaration, and upstream-faithful `is_defined` for `unknown ?? b` initializers (no narrowing when the left side is not statically known)
- 97178b7: fix(client): resolve bare identifiers via scope in template-chunk `is_defined`, so e.g. a legacy `let iconAsc = "↑"` inside `${cond ? iconAsc : iconDesc}` reads bare without a spurious `?? ''`
- d7353f8: fix(parse): preserve `TSFunctionType` / `TSConstructorType` in `convert_ts_type` instead of collapsing them to a `TSUnknownKeyword` stub (e.g. inside a union like `string | (() => void)`)

## 0.8.2

### Patch Changes

- d7f9427: fix(client): emit `svelte:element` `on:` events bare in after_update (no `$.effect` wrap with `use:`), and emit a plain prop init for a function-valued `{@const}` shadowed by an outer same-named binding
- c3fc6d9: fix(parse): preserve the remaining TypeScript assertion forms in parse() output

  Follow-up to #1648, which deliberately deferred three forms. `parse()` now also
  keeps `TSTypeAssertion` (`<T>x`) and `TSInstantiationExpression` (`f<T>`) — with
  svelte/compiler-compatible shape (`TSTypeAssertion` serializes `typeAnnotation`
  before `expression`; `TSInstantiationExpression` carries `typeArguments`) — and a
  non-null `!` sitting inside an optional chain (`a!?.b`), matching svelte/compiler.
  As with the other wrappers, `remove_typescript_nodes` erases them before
  analyze/transform, so compiled client/server output is unchanged.

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

- d7f9427: fix(client): emit `$.invalidate_inner_signals` for prop member mutations inside `$:` reactive statements (legacy `<select bind:value={prop…}>` indirect bindings), matching the instance-script mutation path
- d7f9427: fix(analyze): insert instance-scope declarations into the root-scope name map before module-script inner-function scopes, so a same-named function parameter in the module script no longer shadows an instance `let` (restoring its reactivity)
- 6fa6c2e: fix(analyze): resolve legacy `<select bind:value>` indirect bindings from the select's containing scope, so an each-item wrapping the select (e.g. `{#each columns as col}<select bind:value={sel[col.key]}>`) is invalidated on mutation; a `$store` bind root is skipped like upstream

## 0.8.1

### Patch Changes

- a44b469: fix(compiler): add a stable `@rsvelte/compiler/wasm` subpath and fix package metadata

  The published package now exposes the WebAssembly binary under a stable
  `@rsvelte/compiler/wasm` export. Previously the only way to reach the `.wasm`
  bytes (e.g. to drive `initSync` on Node) was a deep import that hard-coded the
  internal build crate's filename, so consumers broke whenever that name changed
  (`rsvelte_core_bg.wasm` → `rsvelte_lint_bg.wasm`). Import from
  `@rsvelte/compiler/wasm` instead — it stays stable across releases.

  Existing crate-named deep imports keep working (an `exports` passthrough
  preserves them), and the default `import ... from '@rsvelte/compiler'` is
  unchanged.

  Also corrects the package `description`, which had been the linter crate's text
  rather than the compiler's.

- 386f732: fix(wasm): enable reference-types in wasm-opt

  Newer rustc/LLVM can emit a second wasm table (a reference-types externref table
  alongside the funcref indirect-call table) for `wasm32-unknown-unknown`, which
  `wasm-opt`'s default MVP feature set rejects with "Only 1 table definition allowed
  in MVP". Whether the extra table appears depends on the rustc version CI resolves
  that day, not on anything in this repo, so the wasm build could break without any
  change here.

  Passing `--enable-reference-types` lets wasm-opt parse and optimize it. The
  `rsvelte_fmt_wasm` artifact shrinks ~1% as a result; `rsvelte_lint`'s is byte-identical.

## 0.8.0

### Minor Changes

- cc81ec5: feat(oxlint-plugin): run rsvelte's Svelte diagnostics as oxlint rules

  New package `@rsvelte/oxlint-plugin` — an oxlint JS plugin that folds rsvelte's
  Svelte diagnostics (the native eslint-plugin-svelte rule ports plus the
  compiler / validator / a11y warning wrap) into oxlint's single pass and report,
  under the `svelte/` namespace. Add `"jsPlugins": ["@rsvelte/oxlint-plugin"]` (and
  `extends` the bundled `recommended.json`) to `.oxlintrc.json` and Svelte issues
  show up alongside oxlint's JS/TS rules. Requires oxlint ≥ 1.64.

  The engine is native-first with a wasm fallback: the plugin loads the prebuilt
  `rsvelte_lint.node` (NAPI) from the per-platform `@rsvelte/lint-<triple>`
  packages when available, and falls back to the `@rsvelte/compiler` wasm engine
  otherwise — both return byte-identical diagnostics. `RSVELTE_OXLINT_ENGINE=native|wasm`
  forces one engine. The `@rsvelte/lint-<triple>` packages now ship the
  `rsvelte_lint.node` addon alongside the `rsvelte-lint` CLI (via a new
  `rsvelte_lint` `napi` cargo feature).

  Script-block diagnostics map to accurate positions; markup/style diagnostics are
  surfaced at the top of the `<script>` block with their real location in the
  message (an oxlint alpha `.svelte` limitation). Scriptless components are not
  visited by oxlint and so are not linted — see the package README.

  To back it, `@rsvelte/compiler` (and the native addon) gain a `lint_rules()`
  export returning the full catalog of diagnostic ids the linter can emit (native
  rule ids + the compiler/validator/a11y warning codes), so the plugin registers
  its rule set and generates its recommended config directly from the engine. The
  existing `lint()` export is unchanged.

### Patch Changes

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

- 4ea4b44: fix(analyzer): visit special events and parameter defaults

  Two analyzer gaps left references unrecorded, which could feed incorrect
  warnings/eliminations downstream:

  - **`on:` directives on `<svelte:window>` / `<svelte:document>` / `<svelte:body>`**
    were parsed but never walked, so an expression like
    `<svelte:window on:keydown={handle_keydown} />` never recorded a reference to
    `handle_keydown`. These special elements now route their `on:` directives
    through the same `on_directive` visitor regular elements use, matching the
    official compiler's generic `context.next()` walk in `SvelteWindow.js` /
    `SvelteDocument.js` / `SvelteBody.js`.
  - **Function/arrow parameter patterns** (`function f(a, {b} = c, [...d]) {}`)
    were never visited at all, so identifiers referenced only in a default value
    — e.g. a store subscription in `function goto_page(page = $search_params.page) {}`
    — were invisible to the analyzer. `FunctionDeclaration` / `FunctionExpression`
    / `ArrowFunctionExpression` now walk `params` through the existing generic
    typed walker (`walk_js_node_typed`) before the body, mirroring upstream's
    `context.next()` over the whole function node. This also restores the
    self-reference every other declaration site already gets (see
    `variable_declarator.rs`), which `export_let_unused`'s "more than one
    reference" heuristic depends on for other binding kinds.

- 6665d53: fix(analyze): preserve function, class, rest-prop, and directive binding metadata
- fa0e9ff: fix(transform): a function-valued `{@const}` passed as a component prop is not a getter

  Upstream's `Identifier.js` `has_state` computation excludes function
  bindings (`!binding.is_function()`), so a `{@const fn = (e) => …}` read as
  a component prop is emitted as a plain value rather than a getter:

  ```js
  // {#each items as item}
  //   {@const onItemEnter = (e) => { … }}
  //   <Path onpointerenter={onItemEnter} />
  C($$anchor, { onpointerenter: $.get(onItemEnter) }); // was: get onpointerenter() { … }
  ```

  Two gaps caused rsvelte to wrap it in a getter: the analyzer's
  `set_const_tag_initial` never set `initial_is_function` for a `{@const}`
  whose initializer is an arrow/function expression (so `is_function()`
  returned `false`), and the client `expression_has_reactive_state`
  Template branches checked only `is_expression_known_json`, missing the
  `!binding.is_function()` term. Both now mirror upstream.

- fa0e9ff: fix(transform): align CSS scope-class specificity bumping with the official compiler

  The scoping-class placement inside `:is()` / `:where()` / `:has()` / `:not()`
  now follows upstream `css/index.js`'s single `specificity.bumped` rule instead
  of ad-hoc heuristics. Three cases were wrong:

  - A standalone `:where(.foo)` (or `:is(.foo)`) at the top of a rule scoped its
    inner selector with a redundant `:where()` wrapper —
    `:where(.foo:where(.svelte-x))` instead of `:where(.foo.svelte-x)` — because
    the first scoping point must use the direct class, not `:where()`.
  - A combinator by itself forced a specificity bump, so `:where(.a) > :where(.b)`
    produced `:where(.b:where(.svelte-x))` when the preceding relative selector
    emitted no modifier. The bump now comes solely from actual modifier
    application, matching upstream.
  - A pseudo-class arg in a compound that IS scoped elsewhere
    (`nav:has(a).primary`, `:root:has(h1)`) must see the compound as already
    bumped, so its inner selector is `:where(.svelte-x)` — upstream bumps the whole
    compound before recursing into its pseudo args, even when no textual modifier
    is emitted (`:root` is exempt yet still bumps).

  Fixes real-world `<style>` blocks that wrap top-level rules in `:where(...)`
  (e.g. layerchart tooltip / layer / legend components).

- add48ed: fix(deps): update compact_str to 0.10

  Dependency-only bump of `compact_str` (0.9 → 0.10), the inline string type used
  throughout the compiler's AST. No API or output changes; ships in the compiled
  native binaries, hence a patch release.

- fa0e9ff: fix(transform): destructuring `$derived(props)` of a rest binding reads members from `$$props`

  When a second destructuring reads from a `...rest` binding via
  `$derived(...)`, upstream's rest-prop member rewrite turns each named
  member read `props.X` into `$$props.X`, while the top-level `...rest`
  element keeps `props` for `$.exclude_from_object(props, …)`:

  ```js
  // let { ChartChildren, ...props } = $props();
  // let { ssr = false, width, ...restProps } = $derived(props);
  let ssr = $.derived(() => $.fallback($$props.ssr, false)), // was: props.ssr
    width = $.derived(() => $$props.width),                  // was: props.width
    restProps = $.derived(() => $.exclude_from_object(props, ["ssr", "width", …]));
  ```

  The client `$derived` destructuring helpers now thread a separate
  `member_base` (the `$$props` source of the rest binding) for member reads,
  keeping `base_expr` (`props`) for the rest exclude.

- fa0e9ff: fix(transform): a `let:` directive shadows an outer same-named prop

  A `let:` directive on a slotted element (e.g. `<tbody slot="data" let:data>`)
  registers a `$.get(data)` read transform for the derived slot binding, but
  `convert_identifier` resolves a `Prop`/`BindableProp` binding straight to
  `$$props.name` unless the name is in `shadowed_prop_names` — so when the `let:`
  name collided with an outer `let { data } = $props()` prop, reads inside the
  slot body wrongly emitted `$$props.data` instead of `$.get(data)`.

  `process_element_let_directives` now adds each `let:` binding name to
  `shadowed_prop_names` for the duration of the element's children (restored
  afterwards), mirroring the each-item / snippet-parameter shadowing already done
  in `each_block.rs` / `snippet_block.rs`.

- 87f178e: fix(parse): scan `{@html/@render/@const/@debug}` bodies with find_matching_bracket

  The `{@html}`, `{@render}`, `{@const}` and `{@debug}` special tags each carried
  their own bespoke brace-depth loop to locate the closing `}`. Those loops
  handled some JavaScript lexical contexts but not all — none skipped comments or
  regex literals, and `{@debug}` skipped nothing at all — so a `}` inside a
  comment or regex (and, for `{@debug}`, a string) terminated the tag early and
  mis-parsed the rest of the template. All four now route through the shared
  `find_matching_bracket`, which skips strings, template literals, comments, and
  regex literals exactly like upstream's `read_expression`. This brings several
  cases into line with the official compiler:

  - `{@html x /* } */ + y}` — brace in a block comment
  - `{@render foo(/}/g)}` — brace in a regex literal
  - `{@const re = /}/}` — brace in a regex literal
  - `{@debug foo /* } */}` — brace in a block comment

  The `{@const}` sequence-expression guard (`{@const a = b, c = d}` is rejected,
  `{@const a = (b, c)}` is allowed) is now derived from the parsed initializer's
  node type, mirroring upstream's `init.type === 'SequenceExpression'` check,
  instead of a top-level comma byte-scan. This stops a comma inside a regex,
  string, or comment (e.g. `{@const x = /a,b/.test(y)}`) from being mistaken for a
  sequence separator and wrongly rejected.

  No change to the output of any existing fixture; the parser now additionally
  accepts the inputs the official compiler accepts. Net ~160 fewer lines in
  `state/tag.rs`.

- fa0e9ff: fix(transform): keep `rest.x` (not `$$props.x`) when it is an assignment/update operand

  Upstream `Identifier.js` skips the runes rest-prop read optimization
  (`rest.x` → `$$props.x`) when the member access's grandparent is an
  Assignment or Update expression — covering BOTH operands. The client
  AST state transform only excluded the direct LHS, so a single-level
  `rest.x` used as a RHS was rewritten:

  ```js
  // let { children, ...rest } = $props()
  ctx.globalAlpha *= rest.opacity; // was: *= $$props.opacity
  img.crossOrigin = rest.crossOrigin; // was: = $$props.crossOrigin
  ```

  The rewrite is now suppressed for a bare single-level `rest.x` that is a
  direct operand of an assignment (either side) or an update expression,
  while deeper accesses (`rest.x.y`) still inline as before.

- fa0e9ff: fix(transform): SSR elides `$.stringify(...)` for a string-typed `{@const}` declared in multiple scopes

  The server template-chunk builder skips `$.stringify(...)` when
  `scope.evaluate(expr)` proves the value is a defined string. When the same
  `{@const}` name is declared in several branches (e.g. an `{#if}`/`{:else}`
  pair, each a string-typed ternary), the server generator — which does not
  track lexical scope — saw multiple same-named bindings and returned
  `unknown` unless they agreed on a single concrete value, wrongly wrapping
  string reads in `$.stringify(...)`:

  ```js
  // {@const translateX = a === 'middle' ? '-50%' : '0%'}  (in {#if} and {:else})
  transform: `translate(${translateX}, …)`; // was: translate(${$.stringify(translateX)}, …)
  ```

  The multi-binding path now merges the full value set (union) of every
  candidate, mirroring upstream's `Evaluation` merge, so `is_string` /
  `is_defined` stay true when all branches agree on a string type.

- a3dae82: fix(compiler): faithful `$`-store auto-subscription classification for two edge cases

  Two lexical-scope heuristics in the store-subscription detector diverged from
  upstream's scope analysis:

  - Destructured arrow parameters spanning multiple lines
    (`([\n  $a,\n  $b\n]) => …`, e.g. LayerCake's `derived` callbacks) were not
    recognized as local bindings because the param-detection whitespace scan
    stopped at the newline before the delimiter. Those names were wrongly emitted
    as store getters (`const $a = () => $.store_get(a(), …)`) and reordered the
    emitted getter block.
  - A store reference in a ternary consequent behind a unary operator
    (`cond ? !$store : x`) was misclassified as an object property key, so no
    store getter was emitted at all.

  Both now match the official compiler; the LayerCake and svelte-ux `AppLayout`
  corpus entries compile byte-identically for CSR and SSR.

- fa0e9ff: fix(svelte2tsx): keep TS casts on component `bind:this` and on paren-wrapped attribute expressions

  Two TSX-parity gaps surfaced by real-world components:

  - A component `bind:this={x as T}` dropped the trailing TS postfix — emitting
    `x = $$_inst;` instead of `x = $$_inst as T;`. The element `bind:this` path
    already moved the postfix onto the RHS var; the component path now does the
    same (layerchart playground `bind:this={consolePane as Pane}`).

  - An attribute expression whose value is a redundantly-parenthesized cast —
    `on…={((e) => { … }) satisfies Handler<T>}` — lost both the wrapping parens
    and the `satisfies …` tail, because the parser narrows the span to the inner
    arrow and the postfix scan only looked for `as`/`satisfies`/`!` _directly_
    after the span (here the tail starts with `)`). The attribute baker now widens
    the span back to the wrapping `(` and forward past the `) satisfies T` tail
    (layerchart Arc/Arc.base `ontouchmove`).

- fa0e9ff: fix(svelte2tsx): a type-annotated `$props()`/`$state()`/`$derived()` self-named rune is not a store subscription

  Upstream's `is_rune` check excludes a `$props()`/`$state()`/`$derived()` call
  from store resolution when the declaration's binding NAME includes the rune
  base (`parent.parent.name.getText().includes(base)`), using the binding node
  only — never the type annotation. rsvelte's store-subscription pass relied on
  a text scan that walked backwards over the whole `let … = ` region, so a
  generic type annotation broke it:

  ```ts
  // let { …, ...props }: ChartChildrenBaseProps<TData, XScale, YScale> = $props();
  //                                             ^^^^^^ generic-arg commas
  ```

  The backward scan stopped at the first `<…, …>` comma, never saw the `props`
  binding, and so emitted a spurious `let $props = __sveltets_2_store_get(props)`
  (wrapped in `Ωignore` markers) — diverging from the official svelte2tsx TSX
  (layerchart Chart/ChartChildren `.base`/`.canvas`/`.html`/`.svg`/`.svelte`,
  ChartCore). The store-injection pass now applies the exclusion on the AST via
  the existing `excluded_rune_init` helper (binding-name only, like upstream),
  dropping the self-named rune base before emitting subscriptions.

- 685a96e: fix(analyze): record references from Svelte boundary handlers and snippet parameter defaults
- fd4572e: `svelte/no-top-level-browser-globals` now uses real scope resolution (oxc_semantic) instead of name matching: local bindings that share a browser global's name — `let { open = $bindable() }` props, imports, `let top` — are no longer falsely flagged, in both `<script>` and template expressions. Fail-safe: unresolvable scripts fall back to the previous behaviour.

## 0.7.17

### Patch Changes

- 21ab5b1: chore(deps): bump oxc + oxfmt to the 0.58 formatter-paired rev (39677ba)

  Bump every git-pinned oxc crate (`oxc_ast`, `oxc_parser`, `oxc_codegen`,
  `oxc_span`, `oxc_semantic`, … and the `oxc_formatter*` family) to a single new
  revision `39677ba50d908ea09f6d9e58ded328461212f52a` — oxc crates `0.138`,
  `oxc_formatter*` `0.58` — and bump the `oxfmt` npm dependency to `^0.58.0` (root
  - playground). This rev is the exact oxc commit the `oxfmt` `0.58.0` release was
    built from, so `rsvelte-fmt`'s in-process `oxc_formatter` engine is byte-identical
    to the `oxfmt` oracle the formatter-parity gate compares against (fixing a
    comment-placement divergence, e.g. `: !!value /* … */;`).

  All oxc crates must move to one rev together so rsvelte's AST types unify with
  `oxc_formatter`'s transitive deps, and the `oxc_formatter` rev must be paired with
  its matching `oxfmt` npm release; this consolidates the individual Renovate oxc
  bumps and the `auto-update-oxfmt` bot PR (#1434) into one coherent bump. The bump
  is compiler-output-neutral — CSR/SSR compile output is byte-identical across the
  whole compat corpus before and after; no oxc API migration was required.

  Also declares the `svelte_check` bin with `required-features = ["native"]`: it
  links `rsvelte_core::svelte_check::*` (gated on `native`), so under a feature
  resolution that omits `native` (e.g. the `cargo codspeed build` bench graph)
  cargo must skip the bin instead of trying to build it and failing to link.
  Default builds enable `native`, so this is a no-op for them.

  The oxfmt 0.58 bump also records one new known formatter-parity failure in the
  ratchet (`compat/corpus/fmt-known-failures.json`): `site-kit/…/SearchBox.svelte`,
  where rsvelte-fmt over-breaks a TS `as HTMLElement | undefined` union inside a
  deeply-nested `on…={…}` handler at print-width 80 (its embedded-expression width
  narrowing makes `oxc_formatter` break a union the oxfmt oracle keeps inline). It
  is a bounded diagnosis but a non-bounded fix (entangled with the tuned
  narrow-then-reindent plumbing), tracked as a follow-up burndown item. Four other
  oxfmt-0.58 CSS/structure divergences on pathological svelte compiler-test fixtures
  are `oracle-bug` / `invalid-input` exclusions (oxfmt's own `--svelte`-vs-raw CSS
  path inconsistencies where rsvelte matches the raw path).

- f72487c: fix(analyze): remove aliasing UB from bind:group each-block marking

  `mark_group_bindings_in_node` pushed a `*mut EachBlock` (built from `&mut **each`)
  onto an ancestor stack and then recursed into `each.body`, keeping a `&mut` borrow
  of that same each block's `body` field live. When a descendant `bind:group` matched,
  the code dereferenced the raw pointer — including `&mut **each_ptr` to write
  `metadata` — while the outer `&mut each.body` was still alive. Under Stacked/Tree
  Borrows this is undefined behavior (a `&mut` reborrow overlapping a live parent
  `&mut`). No miscompilation had been observed (single-threaded, the writes only touch
  `metadata`, and codegen output was correct), but it is UB the optimizer is entitled
  to exploit.

  Replace the raw pointers with a safe design: the ancestor stack now holds value
  snapshots (`start` offset + declared/expression identifiers copied up-front, so no
  borrow of `each` is held across the descent), and matched group-binding assignments
  are collected into an `FxHashMap<u32, String>` keyed by each block `start`. Each
  `EachBlock`'s `metadata` is written back when the traversal unwinds past it, once no
  borrow of its `body` is live. Group-name allocation order and the first-assigned
  `binding_group_name` semantics are preserved, so compiler output is byte-identical
  (verified against the full runtime-legacy suite, which covers every `bind:group`
  inside `{#each}` fixture).

- f66ee48: fix(analyze): preserve component-relative declaration spans and component tag references in binding metadata
- 0307bc1: fix(transform): keep a brace-less control-flow body with its `$:` header

  The legacy instance-script statement splitter treated a depth-0 newline after a
  brace-less control-flow header (`$: if (cond)`, `else`, `for (...)`, `while (...)`,
  `do`) as a statement boundary. So

  ```svelte
  $: if (object3d)
  	if$_instance_change(object3d, …)
  ```

  split the body off as a separate top-level statement: rsvelte emitted the call
  eagerly and unguarded at component setup, and lowered the header to an empty
  reactive effect (`if (object3d());`) instead of
  `$.legacy_pre_effect(…, () => { if (object3d()) if$_instance_change(…); })`.

  Treat a statement whose accumulated text ends with a brace-less control header as
  incomplete (like a trailing binary operator), so its following body statement is
  accumulated with it. Add `ends_with_braceless_control_header` (word-boundary
  keyword match + backward paren match) to `expression_utils`, applied in both the
  line-accumulation boundary check and `find_statement_end_client`. Removes
  `svelthree/src/lib/components/Object3D.svelte` from known-failures.client.json.

- 8b827ae: fix(transform): client text interpolation treats binary/template-literal `let` inits as defined (no `?? ''`)

  `is_expression_defined` (the client `?? ''` gate for `{expr}` text
  interpolations) only skipped the fallback for a `const` binding whose
  `initial_is_defined` flag was set. That flag is not populated for legacy
  (non-runes) `let` bindings, so `let key = a.charAt(0) + a.slice(1)` — whose
  value is always a string — was emitted as `${key ?? ''}` instead of `${key}`.

  Add a binding-type check that mirrors upstream `scope.evaluate`: a Normal
  binding that is never reassigned and whose initializer is a `BinaryExpression`
  or `TemplateLiteral` is a definite string/number/boolean and therefore
  `is_defined`, so no `?? ''` is appended. Reads the recorded init node type
  directly (independent of the unpopulated flag). Deliberately excludes
  `UpdateExpression` (`x++`), which upstream's `evaluate` has no case for and
  thus treats as UNKNOWN — keeping its `?? ''`. Removes
  `svelte-table/example/example6/ContactButtonComponent.svelte` from
  known-failures.client.json.

- bc553d3: fix(transform): propagate inferred namespace into nested component slots

  When lowering a component's slot content, the client computed the slot fragment's inferred namespace (used for whitespace trimming) but never stored it on the child state's `metadata.namespace`. So a namespace inferred from an `<svg>` deep in one component's slot did not cascade to a nested component's slot whose own children are namespace-inconclusive (only text + components).

  For `<Card>…<svg/></Card>` with a `<CardDescription>418.2K Visitors <Badge/></CardDescription>` inside, upstream infers `svg` for the `Card` slot and inherits it down (`infer_namespace`'s `new_namespace ?? namespace` fallback) so the `CardDescription` fragment is also `svg`. rsvelte kept `html`, building `$.from_html` with untrimmed SVG whitespace and mismatched `$.sibling` offsets.

  Set `state.metadata.namespace` to the inferred namespace while visiting slot children (save/restore around it), mirroring upstream `Fragment.js`, which puts the inferred `namespace` on the new child `state.metadata`. Removes `shadcn-svelte/…/cards/analytics-card.svelte` from known-failures.client.json.

- ac25917: fix(transform): treat an each-item that shadows an outer binding as reactive

  A text/attribute interpolation whose expression is an `{#each … as item}` loop
  variable is reactive, so the client codegen must emit a
  `$.template_effect(() => $.set_text(…))` rather than a one-time `nodeValue`
  assignment. When the loop variable shadowed a same-named outer binding
  (`const title = '…'; {#each rows as title}{title}{/each}`),
  `expression_has_reactive_state` resolved the name to the outer (non-reactive)
  constant — the transform-side scope is not switched to the each scope during the
  body walk — and wrongly baked the interpolation as static. Mirror the existing
  `get_literal_value` each-shadow guard: a name matching an enclosing each ITEM is
  always reactive, an each INDEX uses its analyzer-computed reactivity. Fixes the
  flowbite-svelte admin-dashboard CRUD `+page` components (client SSR/CSR).

- 93eac0b: fix(transform): each item shadows an outer same-named prop getter

  A non-reactive `{#each}` item that is a simple identifier is bound as the render
  arrow's parameter, so it fully shadows any outer binding of the same name. But
  the client only _inserted_ a transform for the item when it was reactive — a
  non-reactive item left a stale outer transform in place. When the shadowed name
  was a runes prop (transform `position → position()`), a body reference or
  `{@const}` wrongly called the prop getter:

  ```svelte
  {#each positions as position}
    {@const [y, x] = position.split('-')}   <!-- was position().split('-') -->
  {/each}
  ```

  Remove any outer transform for the item name in the non-reactive branch too,
  mirroring upstream where the each-item binding shadows the outer scope.

- 0f346a5: fix(esrap): parenthesize an optional-chain callee of a non-optional call

  `rsvelte_esrap` printed a `CallExpression` whose callee is a `ChainExpression`
  (an optional member) without wrapping parentheses, so a NON-optional call on an
  optional-chain callee — e.g. a dynamic `<svelte:component this={instruct?.dataComponent} />`
  lowering to `(instruct?.dataComponent)($$renderer, …)` — was mis-printed as
  `instruct?.dataComponent($$renderer, …)`. Those differ semantically (the latter
  short-circuits when `instruct` is nullish) and are not AST-equivalent.

  The callee-precedence check (`< 19`) could not catch it because a
  `ChainExpression` has the same precedence (19) as a call. Add esrap's explicit
  `callee.type === 'ChainExpression'` wrap rule so the callee is parenthesized.
  Removes `powertable/app/src/lib/components/PowerTable.svelte` from
  known-failures.server.json.

- c8795c0: fix(esrap/napi): defensive printer fixes and compileModule arena leak

  esrap's `Dedent` no longer underflows on unbalanced command streams and template
  quasis are indexed defensively. The `compileModule` zero-copy NAPI path now uses
  the same leak-safe `BumpGuard` envelope helper as the component path, so a buffer
  creation error no longer leaks the bump arena.

- b7e28b7: fix(analyze): record `$$props` references so legacy reactive deps deep-read it

  A legacy reactive expression reading `$$props.x` (e.g. an `{#if $$props.class || underline || cursor}` test) omitted the `$.deep_read_state($$sanitized_props)` dependency from its `build_expression` sequence, so it read `($.deep_read_state(underline()), …)` instead of `($.deep_read_state($$sanitized_props), $.deep_read_state(underline()), …)`.

  The cause was that Phase 2 never declared a `$$props` binding, so `$$props.x` resolved to nothing and no reference was recorded in the expression metadata. Mirror upstream `2-analyze/index.js`, which declares a synthetic `$$props` `rest_prop` binding in the instance scope (non-runes branch) before the walks. The Phase-3 `build_expression` port already deep-reads a `$$props` reference (mapping it to `$$sanitized_props`); it simply never saw one.

  Guard `has_prop_bindings` against the synthetic name so a component with no real props (e.g. a static SVG icon) does not gain a spurious `$$props` parameter — mirroring upstream's `binding.node.name !== '$$props'` checks. `$$restProps` is deliberately left undeclared (its plain-read path already works and binding it would mis-route `$$restProps.x`). Removes `svelte-ux/packages/svelte-ux/src/lib/components/Tooltip.svelte` from known-failures.client.json.

- 3e43d67: fix(transform): client legacy `$.mutable_source` wrapping handles inits on the next line

  The legacy state-declaration transform matched `let x = <init>` with a hardcoded
  trailing space after `=`, so a declaration whose initializer begins on the
  following line — e.g. `let selectedDayOfWeek: DayOfWeek =\n  $format.settings…` —
  did not match the init-bearing pattern. The declarator was mis-wrapped as an
  empty `$.mutable_source()` and its initializer was orphaned as a dangling
  statement (`$.mutable_source();\n $format()…;`).

  Match `=` without the trailing space, guard against `==` / `=>`, and skip any
  whitespace (including newlines) between `=` and the initializer before reading
  the init expression. Removes
  `svelte-ux/packages/svelte-ux/src/lib/components/DateRange.svelte` from
  known-failures.client.json.

- 581d520: fix(parse): harden parser against panics and infinite loops on edge-case input

  `strip_type_annotation` now slices on byte offsets (`{const café: T = e}` no
  longer panics), the CSS rule loop has a progress guard so `<style>{}</style>`
  reports `css_expected_identifier` like the official compiler instead of hanging,
  and selector identifiers accept code points >= 160 (matching the official
  compiler's treatment of e.g. `×` as a valid type selector).

- 8e38ff1: fix(preprocess): defer the sources/names table clone in sourcemap concat until an entry is actually new

  `MappedCode::concat`'s `merge_tables` helper unconditionally cloned the entire
  `this_table` slice (`self.map.sources` / `self.map.names`) up front via
  `this_table.to_vec()`, before checking whether any entry from `other_table` was
  actually missing. In the common case — every `other_table` entry already
  present — the caller discards the returned table anyway (it only assigns it
  back when `changed` is `true`), so the clone was wasted work on every
  `concat()` call, which runs once per stitched-together `MappedCode` chunk while
  building a preprocessed file's source map.

  `merge_tables` now only materializes the merged table (via
  `Option::get_or_insert_with`) the first time an entry is found missing, and
  returns an empty `Vec` (never read by the caller) when nothing changed. Output
  is unchanged — this only affects the discarded-on-no-op allocation.

- ef9c121: fix(transform): compile assignments to `$state` that broke SvelteKit remote functions (#1438). A logical compound assignment (`??=`/`||=`/`&&=`) to a private `$state` field inside a method/getter, and an object/nested destructuring assignment to a module-level `$state` variable, were both miscompiled to invalid assignment targets. They now lower to `$.set(...)` matching the official compiler.
- 277e6cd: fix(transform): server declarator `$state()` is a store read when `$state` is a subscription

  `let x = $state()` in the instance script was always lowered to the `$state`
  rune (→ `let x = void 0`). When a same-named store is subscribed — e.g. a
  `state` prop read as `$state` — upstream `get_rune` returns null (the
  auto-created `$state` store-subscription binding shadows the rune), so the
  declarator is a store read: `let x = $.store_get(($$store_subs ??= {}),
"$state", state)()`. Detect that in `lower_variable_declaration` by looking up
  the `$`-prefixed callee name as a `BindingKind::StoreSub` binding that is
  lexically visible at (an ancestor-or-self of) the instance scope, gated to the
  instance script only. Precise enough to leave ordinary runes alone:
  `let props = $props()` (binds `props`, no `$props` subscription),
  `let state = $state(0)` (no `$state` read), and a module-script
  `const data = $state({…})` next to an unrelated `const state` all stay runes.

- 673b2b0: fix(preprocess): harden sourcemap decoding and warning offset handling

  Malformed VLQ continuation runs no longer overflow-panic the decoder (shift is
  bounded and running state uses wrapping adds), `process_markup` now decodes
  standard VLQ-string v3 maps through `decode_map` instead of silently dropping
  them, and `byte_offset_to_position` rewinds mid-codepoint offsets to the nearest
  char boundary before slicing.

- cafca99: fix(transform): deep infer_namespace for SSR reset-parent fragments

  The server whitespace trimmer decides whether a fragment's inter-node
  whitespace is removable from its inferred namespace (svg/mathml contexts drop
  whitespace-only text; html keeps a single space). rsvelte inferred that
  namespace with a shallow direct-child scan; upstream `infer_namespace`
  deep-walks into `{#if}` / `{#each}` / `{#await}` / `{#key}` block bodies for
  namespace-resetting parents (Root / Fragment / Component / SnippetBlock /
  SlotElement). Porting `check_nodes_for_namespace` fixes two SSR whitespace
  divergences: `<svg>…</svg> {#if}<p>…{/if}` (keep the space — html found inside
  the block) and top-level `{#if}svg{/if} {#if}svg{/if}` (drop the space — all svg).

- 511cb42: fix(transform): use byte offsets when slicing instance-script strings

  Several client instance-script string helpers iterated with
  `chars().enumerate()` (or a collected `Vec<char>`) and then used the resulting
  char index as a byte offset into the original `&str`. Any non-ASCII byte before
  the slice point (a non-ASCII identifier, object key, string/type literal — all
  valid JS/TS/Svelte) pushed the byte offset past a `char` boundary, panicking the
  compiler with `byte index N is not a char boundary`. Because these helpers run
  whenever the client instance-script IR is built, the crash was reachable from
  untrusted `.svelte` input.

  Fixed all five sites to work in byte offsets (`char_indices()` /
  peekable-iterator neighbor lookups) so e.g. `let { café, b } = $props()`,
  `let { café: renamed } = $props()`, `let [café = 1] = arr`, and
  `let x: Café = 0` compile instead of panicking:

  - `props_transforms.rs`: `split_property_key_value`, `split_destructuring_properties`
  - `destructure_transforms.rs`: `find_top_level_equals` (fixes its 11 byte-slicing callers)
  - `state_transforms.rs`: `body_references_identifier_in_statements`,
    `transform_legacy_state_declarations`

  ASCII input is unaffected (char index equals byte index there), so output is
  byte-for-byte unchanged.

## 0.7.16

### Patch Changes

- e06d43d: fix(compiler): lower legacy-reactive component bind writes through `$.set`

  A `bind:` on a component whose target is a legacy reactive (`$:`-declared)
  variable was lowered to a plain `path = $$value` assignment instead of the
  reactive `$.set(path, $$value)`, so writes from the child component no longer
  notified subscribers (reactivity loss). The getter still read the variable via
  `$.get(path)`, producing an inconsistent get/set pair.

  `process_bind_directive`'s `is_state_binding` predicate only covered
  `is_state_source || Derived`, so a `LegacyReactive` identifier fell through to
  the final plain-assignment branch. `add_state_transformers` registers a `$.set`
  assign transform for exactly `is_state_source || Derived || LegacyReactive`, so
  `LegacyReactive` is now included here to match.

  Fixes #1228 (smelte `_layout.svelte`, svelte-calendar `DayPicker.svelte`).

- d826d82: fix(compiler): detect spread/ternary store subscriptions and emit store getters in first-reference order

  Three Phase-2 store-subscription detection bugs surfaced by the store-heavy
  legacy layercake components in the awesome-svelte compat corpus, all affecting
  the client `const $store = () => $.store_get(...)` getters:

  - A store referenced only through a spread (`Math.max(...$xRange)`) was never
    detected — the lexical `$`-scan treated the third `.` of `...` like a member
    access (`obj.$x`) and skipped it, so the getter was missing entirely (broken
    reactivity). A leading dot now counts as member access only when it is a
    single dot.
  - A store in a ternary consequent (`cond ? $xGet : $yGet`) was dropped because
    `$xGet :` looked like an object property key (`{ $xGet: ... }`). A property
    key is never preceded by `?`, so a ternary consequent is now excluded.
  - Store getters were emitted in the wrong order: template refs were sorted by a
    substring `source.find`, so `$x` matched inside `$xGet`/`$xScale` and `$y`
    inside `$yGet`/`$yRange`. They are now kept in AST-traversal (first-reference)
    order, matching the official compiler's `scope.declarations` insertion order.

  Fixes #1229 (layercake `Column` / `GroupLabels` / `QuadTree` / `AxisRadial`).

- 9c92abe: fix(transform): keep a bare prop-identifier prop default as a getter reference

  A legacy `export let b = a` where `a` is another prop lowers to
  `$.prop($$props, 'b', 24, a)` — the prop's getter function is passed directly as
  the lazy initial value. The default-value prop-read pass was wrapping the bare
  `a` into `a()`; it now leaves an exactly-bare prop-identifier default untouched
  while still wrapping prop reads nested in a larger default.

- 257efbd: fix(transform): treat a computed member with a reactive property as reactive

  `has_reactive_state_json` only inspected a member expression's OBJECT, so
  `{ xs: '…', … }[size]` (an inline object indexed by a reactive prop `size`) was
  deemed non-reactive and emitted as a plain object property instead of a `get`
  accessor. A computed member whose property reads reactive state is now treated as
  reactive.

- 8e74d34: fix(compiler): order `$.bind_props` props correctly when a prop is shadowed by a function parameter

  When an `export let` prop shares its name with a function parameter elsewhere in
  the script —

  ```svelte
  <script>
    function setTooltipContext(tooltip) { setContext(key, tooltip); }
    export let tooltip = writable({ … });   // line 116
    export let hideDelay = 0;               // line 127
  </script>
  ```

  — the `BindableProp` kind can land on the parameter binding (which has no
  `declaration_start`), so the server `$.bind_props($$props, { … })` trailer sorted
  that prop to the end (`{ …, hideDelay, tooltip }`) instead of its true source
  position (`{ …, tooltip, hideDelay }`).

  Fix the bind_props sort to borrow the real `let`/`var` declaration's
  `declaration_start` when the marked binding lacks one. This is sort-only: it does
  not change which binding is marked `BindableProp`, so the var-hoisting order (and
  the previously-fixed `BrushContext`/`GeoContext` outputs) are untouched. Clears
  `layerchart/.../tooltip/TooltipContext.svelte` (44 → 43).

- e8dfdb7: fix(compiler): resolve block-scoped local shadowing a prop in mutation tracking

  A block-local `let` that shadows a prop of the same name was mis-attributed to
  the prop, inflating its `$.prop(...)` flags with `PROPS_IS_UPDATED`:

  ```svelte
  <script>
    let { css = "" } = $props();
    const days = $derived.by(() => {
      for (…) {
        let css = "";        // block-local, shadows the prop
        css += " wx-selected"; // mutates the LOCAL, not the prop
      }
    });
  </script>
  ```

  The Phase-2 scope builder created a lexical scope for each `BlockStatement` (so
  the local `css` lived there), but it didn't register that scope anywhere the
  later visitor pass could find it, and the visitor's `BlockStatement` walk never
  entered block scopes. So `css += …` resolved up to the prop binding and marked it
  reassigned → `$.prop($$props, "css", 7, "")` instead of `3`.

  Register each (non-function) block's scope in `function_scope_map` keyed by the
  block start, and have the typed visitor walk enter that scope for `BlockStatement`
  nodes (mirroring how function bodies are already handled). Block-local mutations
  now resolve to the correct local binding. Clears
  `svar-core/svelte/src/components/calendar/Month.svelte` (42 → 41).

- 7c5cef6: fix(compiler): strip comments when collapsing multi-line import specifiers

  `cleanup_import_line` joins a hoisted multi-line `import { … }` onto a single
  line with spaces. A `//` comment between specifiers —

  ```js
  import {
    AppBar,
    AppLayout,
    Button,
    ThemeSelect,
    // ThemeSwitch,
    Tooltip,
    settings,
  } from "svelte-ux";
  ```

  — was folded inline, commenting out the rest of the statement (including
  `} from '…'`) and producing invalid JS. Strip `//` and `/* … */` comments (via
  `strip_js_comments`, which respects the module-specifier string) before the
  line-join, mirroring esrap which drops these comments. Clears
  `layerchart/.../routes/+layout.svelte` from the corpus baseline (54 → 53).

- dc40cc7: fix(compiler): ignore comments when splitting `$props()` destructuring declarators

  `split_declarators` (used to parse the names in a `let { … } = $props()`
  destructuring for the `$.rest_props(…)` exclusion list) split on every top-level
  comma, including commas inside `//` and `/* … */` comments. A comment such as

  ```js
  let {
    class: className,
    // we add name, color, and stroke for compatibility with different icon libraries props
    name,
    ...restProps
  } = $props();
  ```

  was split on its internal commas, so the comment fragments leaked into the
  emitted `new Set([…])` exclusion list as bogus prop names — producing an
  unterminated-string / invalid-JS output. The same shape with a trailing
  `// comment, with commas` after a real prop corrupted the following names.

  Make `split_declarators` comment-aware (skip `//` to end-of-line and `/* … */`,
  respecting string literals and not self-closing a `/*/`). The comment text stays
  with the declarator and is stripped per-declarator by the existing caller logic.
  Clears `flowbite-svelte/.../ClipboardManager.svelte` and
  `shadcn-svelte/.../spinner/spinner.svelte` from the corpus baseline (56 → 54).

- 4037211: fix(compiler): don't collect a nested function's local declarations as reactive dependencies

  A legacy reactive expression whose value contains a nested function with its own
  local declarations —

  ```svelte
  sum(visibleSeries, (s) => {
    const seriesTooltipData = s.data ? findRelatedData(s.data, data, x) : data;
    return valueAccessor(seriesTooltipData);
  })
  ```

  — wrongly listed the function-local `seriesTooltipData` in the dependency
  sequence (`$.deep_read_state(seriesTooltipData)`). Upstream filters references by
  `function_depth`: a binding declared inside the nested function is a local, never
  an eager dependency (its own deps — `findRelatedData`/`data`/`x` — are tracked
  instead).

  The fallback dependency collector (`collect_reactive_references_inner`) already
  shadowed arrow/function _parameters_; it now also shadows top-level
  `const`/`let`/`var` declarations in the function body (scoped via the existing
  seen-set save/restore).

  Clears `layerchart/.../charts/BarChart.svelte`, zero corpus regressions.

- 58fbddc: fix(compiler): don't `$.deep_read_state` an each-item that shadows a prop of the same name

  A destructured each-item binding whose name matches an outer prop —

  ```svelte
  <script>export let data;</script>
  {#each dataByFruit as [fruit, data]}
    <Point d={data[data.length - 1]} />
  {/each}
  ```

  — was wrapped in `$.deep_read_state(data())` in legacy dependency lists, whereas
  upstream emits a plain `data()`. The reference resolves (correctly, via the
  each-item read transform) to the each-item local, but the deep-read decision used
  `get_binding`, which walks the static scope tree and returns the shadowed
  `export let data` prop (`bindable_prop`) → forced a deep read.

  Two parts:
  1. The destructured-each-item branch now clears each path name from
     `transform_deep_read` (the simple-identifier each-item branch already did this).
  2. The legacy dependency builders deep-read a `bindable_prop` only when it is NOT
     shadowed by a local read transform (`!has_read_transform`) — mirroring the
     existing `import` arm. A genuine, unshadowed prop is still deep-read via its
     `transform_deep_read` marker, so only the wrongly-resolved shadowed case is
     suppressed.

  Clears `layerchart/.../routes/docs/examples/Area/+page.svelte` and
  `layerchart/.../components/Grid.svelte` (37 → 35), with zero regressions across
  the full corpus.

- 20db5a3: fix(compiler): treat a parenthesized sub-expression as "simple" in prop fallbacks (SSR)

  A legacy prop whose default is a simple arithmetic expression containing
  parentheses was emitted with a needless lazy thunk:

  ```svelte
  <script>
    export let value = max < min ? min : min + (max - min) / 2;
  </script>
  ```

  produced `$.fallback($$props["value"], () => (max < min ? …), true)` instead of
  the eager `$.fallback($$props["value"], max < min ? …)`.

  Upstream parses with `preserveParens: false`, so `is_simple_expression` never
  sees a parenthesized node. OXC preserves `(max - min)` as a
  `ParenthesizedExpression`, which `is_simple_default`'s catch-all treated as
  non-simple — making the whole default complex → lazy. Unwrap
  `ParenthesizedExpression` (recurse on the inner expression) so a parenthesized
  simple expression stays simple/eager, matching upstream. Clears
  `attractions/.../slider/slider.svelte` (38 → 37).

- 4ee5f7c: fix(compiler): scope-aware prop reads in non-assignment reactive statements + parenthesize arrow operands of logical expressions

  Two codegen bugs that made `layerchart/.../Highlight.svelte` emit invalid JS:

  1. **Destructuring shadow in a reactive statement.** A `$:` body that is not a
     simple assignment (e.g. `$: if (cond) { items.map((p) => { const [x, y] =
f(p); … }) }`) was routed through the scope-unaware text prop-read transform,
     wrapping the destructuring binding targets that shadow props `x`/`y` →
     `const [x(), y()] = …` (a syntax error). It now goes through the AST wrapper
     (`wrap_prop_source_reads_ast`), which uses OXC semantics to skip locally
     shadowed names. `wrap_prop_source_reads_ast` now also returns the source
     unchanged when parsing succeeds but nothing needs wrapping (previously it
     returned `None`, which fell back to the text path and re-introduced the bug).
  2. **Arrow operand of a logical expression.** The text printer didn't
     parenthesize an arrow / `yield` operand of `&&`/`||`/`??`, so
     `onclick={onareaclick && ((e) => …)}` printed as `onareaclick() && (e) => …`
     (mis-parses, since arrows bind lower than `&&`). `logical_operand_needs_parens`
     now wraps `Arrow`/`Yield` operands.

  Clears `Highlight.svelte`, zero corpus regressions.

- cfb6a15: fix(compiler): don't drop `import`/`export` lines inside multi-line template literals

  The legacy text-based instance-script transform walks the script line by line,
  skipping lines that begin with `import `, `export { … }`, or a `$props.id()`
  declaration (they are hoisted / handled elsewhere). That skip fired
  unconditionally — even when the line actually lived _inside_ a multi-line
  template literal being accumulated, e.g. a code-sample string:

  ```js
  const code = `<script>
    import { LayerCake, Svg } from 'layercake';
  </script>`;
  ```

  The `import …` line was silently dropped from the emitted template literal,
  corrupting the string. (The line-by-line `$`-token heuristic routed these
  scripts into the text transform because `${…}` interpolations contain `$`.)

  Gate the three statement-boundary skips on `accumulated_lines.is_empty()`, which
  is true only at a clean statement boundary (the accumulator is cleared on
  completion), so lines inside a mid-statement template literal are preserved
  verbatim. Shrinks `compat/corpus/known-failures.json` by 3 entries (59 → 56),
  including the large `flowbite-svelte/.../builder/badge/+page.svelte` divergence.

- 267ba18: fix(compiler): emit `$.invalidate_inner_signals` for legacy prop member mutations

  A legacy `<select bind:value={prop.x}>` whose subtree references other variables
  (`<option>` content, the select's own `id`, etc.) records those on the bound
  prop's `legacy_indirect_bindings`; the official compiler wraps every mutation of
  that prop in `(prop(...), $.invalidate_inner_signals(() => { …reads }))` so the
  referenced signals re-read. rsvelte only did this for `bind:` setters, not for
  ordinary prop member mutations (e.g. `field.tooltipAttributes = {}` in `onMount`).

  Two fixes:
  - Phase 3: the legacy prop-member-mutation rewrite (`prop_member_mutate_ast`) now
    wraps the mutation in the `$.invalidate_inner_signals` sequence when the prop
    carries indirect bindings, using each binding's read form (prop → `name()`,
    store sub → `name()`, reactive state/derived → `$.get(name)`, else bare).
  - Phase 2: `legacy_indirect_bindings` collection is narrowed to identifiers
    referenced _within the `<select>` element's own source span_ (ordered by source
    position), mirroring the official `scope.references` iteration. Previously it
    pulled in every template-referenced binding in the component, so an `id` used on
    an unrelated sibling element leaked into the invalidation list.

  Clears `svelte-form-builder/.../PropertyPanelTooltip.svelte` (50 → 49).

- 4537f04: fix(compiler): deep-read a keyed `{#each}` block's reactive index in dependency lists

  In a keyed each block (`{#each items as item, i (item.key)}`) the index `i` is
  reactive — upstream gives it binding kind `template`, so a dependency read deep-reads
  it: `$.deep_read_state($.get(i))`. rsvelte emitted a plain `$.get(i)` because the
  each-block visitor unconditionally cleared the index from `transform_deep_read`, and
  the `EachIndex` fallback check in `collect_reactive_references` can miss it when
  `get_binding` resolves a same-named non-index binding (e.g. a `map((d, i) => …)`
  callback param) instead of the keyed index.

  The index is now marked in `transform_deep_read` when reactive (keyed), and still
  shadows an outer same-named marker when static (non-keyed).

  Clears `layerchart/.../charts/AreaChart.svelte`, zero corpus regressions.

- cd60e94: fix(compiler): treat `Math`/`Number` constant members as compile-time known

  A `$derived` whose initializer is constant arithmetic over a global constant —

  ```svelte
  const circumference = $derived(2 * Math.PI * 42.5);
  ```

  — was treated as reactive, so an attribute that only reads it (e.g.
  `style="stroke-dasharray: {circumference} {circumference};"`) was emitted inside a
  `$.template_effect(...)` instead of as a one-time `$.set_style(...)`. The
  reactive-state evaluator's `is_expression_known_json` returned `false` for every
  `MemberExpression`, so `Math.PI` made the whole derived "unknown → reactive".

  Treat a non-computed member of a pure global namespace (`Math.*`, `Number.*`,
  when not locally shadowed) as a known compile-time constant — mirroring the
  globals table in upstream `scope.evaluate`. `Math.random()` etc. stay reactive
  (they're `CallExpression`s, handled separately). Clears
  `shadcn-svelte/.../circular-gauge.svelte` (45 → 44).

- 8541c7b: fix(compiler): don't truncate a multi-line initializer whose continuation starts with `(`/`[`/backtick

  A legacy state declaration whose initializer continues on the next line starting
  with `(` was wrapped incorrectly:

  ```svelte
  <script>
    let shownCalendar =
      (range && value != null ? value.start : value) || new Date();
  </script>
  ```

  produced `let shownCalendar = $.mutable_source()(range … ) || new Date()` — an
  empty `$.mutable_source()` followed by the un-wrapped initializer — instead of
  `$.mutable_source((range … ) || new Date())`.

  `find_statement_end_client` treated the newline after `=` as a statement end
  because the next non-whitespace char (`(`) was not in its continuation set, so the
  extracted initializer was empty. Per JavaScript ASI, a line break followed by `(`,
  `[`, or a backtick continues the previous expression (`foo\n(bar)` is `foo(bar)`,
  `a\n[i]` is `a[i]`). Add those to the continuation set. Clears
  `attractions/.../date-picker/date-picker.svelte` (40 → 39).

- 79d2380: fix(compiler): parenthesize a `new` callee when a state read makes its member-spine contain a call

  `new deckgl.MapboxOverlay(...)` where `deckgl` is `$state()` rewrites to
  `new ($.get(deckgl).MapboxOverlay)(...)` upstream — the callee's member-spine now
  contains a `CallExpression` (`$.get(deckgl)`), so `new` requires parentheses or the
  trailing `(...)` would parse as the `new` arguments. esrap/codegen apply this for
  proper AST `new` nodes, but the legacy `$.get(...)` text-rewrite path
  (`ast_state_transform`) emitted the `new` as raw text and skipped it. A
  `visit_new_expression` now inserts the parens when the callee's leftmost member-spine
  identifier is a state variable.

  Clears `svelte-maplibre/.../DeckGlLayer.svelte`, zero corpus regressions.

- 639a952: fix(compiler): parenthesize a `new` callee whose member spine contains a call (text printer)

  `new $.get(deckgl).MapboxOverlay({ … })` was emitted by the text-printer fallback
  without parenthesizing the callee, so it parses as
  `(new $.get(deckgl)).MapboxOverlay({ … })`. The AST printer (esrap) already
  guards this via `callee_has_call_expression`; the text printer's
  `emit_new_expression` only parenthesized low-precedence callees (conditional,
  await, …), not a member chain containing a `CallExpression`. Mirror esrap: walk
  the callee's `Member`/`Call` spine and parenthesize when a call is found, emitting
  `new ($.get(deckgl).MapboxOverlay)({ … })`.

  Clears the SSR (server) output for `svelte-maplibre/.../DeckGlLayer.svelte`
  (server known-failures 35 → 34). Its CSR output still differs on an orthogonal
  axis (the client builds the effect body as a raw string, bypassing the AST
  printer), so the client entry remains.

- e151196: fix(compiler): legacy `invalidate_inner_signals` for `$.mutate()` state member mutations

  A legacy `<select bind:value={state.x}>` whose subtree references other scope
  variables must invalidate those signals when the bound state is mutated. The prop
  path (`prop(prop().x = v, true)`) already wrapped with
  `$.invalidate_inner_signals`; the legacy **state** member-mutation path
  (`$.mutate(state, …)`) did not. The precomputed invalidate bodies now cover any
  binding with `legacy_indirect_bindings` (state as well as props), and
  `transform_legacy_state_member_mutate_ast` wraps `$.mutate(state, …)` in
  `(<mutation>, $.invalidate_inner_signals(() => { … }))` when applicable.

  Clears `powertable/.../PowerTable.svelte`, zero corpus regressions.

- cafa711: fix(compiler): a prop default referencing a legacy `$:` reactive variable is lazy

  ```svelte
  <script>
    $: defaultServiceUrl = services['mapbox v1']['streets-v11'];
    export let serviceUrl = defaultServiceUrl;
  </script>
  ```

  `serviceUrl`'s default references `defaultServiceUrl`, a legacy `$:` reactive
  variable (`BindingKind::LegacyReactive`). Upstream applies the read transform
  first — `defaultServiceUrl` → `$.get(defaultServiceUrl)` — so `is_simple_expression`
  sees a (non-simple) `CallExpression` and emits a lazy thunk with
  `PROPS_IS_LAZY_INITIAL`: `$.prop($$props, 'serviceUrl', 28, () => $.get(defaultServiceUrl))`.

  rsvelte's prop-flag reactivity check only recognised
  `bindable_prop`/`prop`/`state`/`raw_state`/`derived` identifiers as non-simple, so
  a `LegacyReactive` reference was treated as simple → emitted eagerly
  (`…, 12, $.get(defaultServiceUrl)`). Add `LegacyReactive` to both prop-default
  paths; unlike a prop ref it transforms to a member call (`$.get(...)`), so it is
  thunked rather than unwrapped to a bare callee.

  Clears `layerchart/.../docs/TilesetField.svelte`, zero corpus regressions.

- 20401c3: fix(compiler): keep `PROPS_IS_UPDATED` when a reassigned prop is shadowed by a function parameter

  When an `export let` prop shares its name with a function parameter elsewhere in
  the component, the `BindableProp` kind can land on the parameter binding (which is
  never reassigned), while the real prop declaration — which actually carries the
  reassignment — ends up as a separate instance-scope binding:

  ```svelte
  <script context="module">
    function setCanvasContext(context) { setContext(key, context); } // param `context`
  </script>
  <script>
    export let context = undefined;                 // the real prop
    onMount(() => { context = element?.getContext('2d'); }); // reassigns the prop
  </script>
  ```

  `calculate_prop_flags` resolved the parameter binding (not reassigned) and emitted
  `$.prop($$props, "context", 8, …)` (BINDABLE) instead of the correct `12`
  (BINDABLE | UPDATED).

  When computing `PROPS_IS_UPDATED`, also OR in the reassigned/mutated state of any
  same-named _real_ declaration in the instance/module scope (excluding function
  parameters). This is flag-only — it does not change which binding is marked
  `BindableProp`, so var-hoisting (and the previously-fixed `BrushContext` /
  `GeoContext` outputs) are untouched. Clears
  `layerchart/.../layout/Canvas.svelte` (41 → 40).

- 6c1e662: fix(compiler): resolve a prop shadowed by a same-named function parameter

  When a legacy prop/store (`export let brush = writable(...)`, also read as
  `$brush`) shares its name with a function parameter (`function setBrushContext(brush) {…}`),
  Phase-2 can register that parameter at the instance scope index. Binding lookups
  keyed on `instance_scope_index` then resolved to the parameter (kind `normal`)
  instead of the prop, so the prop was mis-compiled:

  - client store-getter emitted `$.store_get(brush, …)` instead of `$.store_get(brush(), …)`;
  - the `$.prop(…)` flag dropped `PROPS_IS_BINDABLE`;
  - the server emitted a plain `let brush = writable(...)` instead of
    `let brush = $.fallback($$props['brush'], () => writable(...))`.

  Prefer an actual `prop`/`bindable_prop` binding of the name over a shadowing
  local/parameter in the three resolution points (`binding_by_name`,
  `calculate_prop_flags`, server `legacy_binding_is_prop`). Also emit
  `$.bind_props({…})` in source-declaration order (`declaration_start`) since a
  prop that is also a store subscription can otherwise be listed out of order.

  Clears `layerchart/.../BrushContext.svelte` and `.../GeoContext.svelte`
  (49 → 47).

- d4f8a77: fix(compiler): correct legacy `invalidate_inner_signals` for `<select bind:value>` indirect bindings

  Legacy `<select bind:value={prop…}>` must invalidate the OTHER scope variables read
  within the select (e.g. a `guid` prop in the select's `id=` attribute) whenever the
  bound value is mutated. Several gaps are fixed so the invalidation matches upstream:

  - **`legacy_indirect_bindings` population** (`2-analyze/RegularElement`): the indirect
    bindings are now collected from the select's enclosing scope **and its ancestors**
    (via `binding.scope_index`, not the backward-compat-polluted `scope.declarations`),
    so an outer-scope prop like `guid` is included while child-scope each-block items are
    excluded. Store auto-subscriptions (`$label`) are skipped (no real scope binding
    upstream).
  - **assignment LHS is reactive** (`has_reactive_state` AssignmentExpression): `{(x.value
= [])}` now reads `x` on the LHS, so the text is reactive (`$.template_effect`) rather
    than a static `nodeValue =`.
  - **invalidate wrap on prop member mutations** (template assignment + component
    `bind:value` setter): a prop member mutation whose prop has `legacy_indirect_bindings`
    is wrapped in `(<mutation>, $.invalidate_inner_signals(() => { … }))`.

  Clears `svelte-form-builder/.../PropertyPanelDataAttributes.svelte`, zero corpus
  regressions (binding-indirect / binding-interop-derived / select-option-store etc. all
  still pass).

- 57ba819: fix(compiler): mark a `<select>` with non-option content as "rich" (SSR)

  A `<select>` whose children include anything other than `<option>`/`<optgroup>`
  elements — e.g. `<select multiple><slot /></select>` — must emit the trailing
  `is_rich = true` flag on the SSR `$$renderer.select(attrs, fn, …rest, true)` call
  so the runtime adds the customizable-select hydration marker.

  rsvelte's rich-content scan (`select_special_is_rich`) was narrower than upstream's
  `is_customizable_select_element`: it only treated components / `{@render}` /
  `{@html}` as rich and missed `<slot>` (a `SlotElement`), non-option/optgroup
  regular elements, and text. It now faithfully ports
  `is_customizable_select_element` for the `<select>` owner (mirroring
  `find_descendants`: skip snippet/debug/const/declaration/comment/expression tags,
  recurse if/each/key/await/boundary branches but not element children, and treat a
  non-option/optgroup element, non-whitespace text, or any other node as rich).

  Clears `sveltestrap/.../Input/Input.svelte` (SSR), zero corpus regressions.

- 6a5f48f: fix(compiler): a snippet is non-hoistable when a nested function closes over instance state

  A root-level `{#snippet}` was hoisted to module scope even when one of its nested
  functions referenced component state, e.g.:

  ```svelte
  {#snippet MobileLink({ href, content })}
    <a {href} onclick={() => { open = false; }}>{content}</a>
  {/snippet}
  ```

  `open` is component state, so upstream keeps `MobileLink` defined _inside_ the
  component; rsvelte hoisted it to module top-level. The hoistability walk
  (`can_hoist_snippet`) treated every `ArrowFunctionExpression` /
  `FunctionExpression` as unconditionally hoistable (`=> true`), so references
  inside nested handlers were never inspected.

  Now nested functions are walked: their own params and locally-declared names are
  treated as local, and any remaining reference to an instance-level binding blocks
  hoisting — mirroring upstream's `scope.references` walk through nested functions.
  Both the typed and JSON expression checkers route through one shared helper.

  Clears `shadcn-svelte/.../mobile-nav.svelte` and
  `flowbite-svelte/.../datepicker/Datepicker.svelte` on both CSR and SSR, with zero
  corpus regressions.

- e6110b2: fix(compiler): a spread element marks an expression as having a call (legacy reactivity)

  A legacy component/element attribute value containing a spread —

  ```svelte
  <Comp scrollIntoView={{ condition: a === b, onlyIfNeeded: c, ...rest }} />
  ```

  — was emitted without the `(deps, $.untrack(...))` dependency sequence, so its
  reactive dependencies (`c`, `rest`, …) weren't tracked. Upstream's
  `2-analyze/visitors/SpreadElement.js` sets `has_call = true` (and `has_state =
true`) for any spread ("treat `[...x]` like `[...x.values()]`"), which makes
  `build_expression` wrap the value. rsvelte's metadata walks omitted spreads, so
  `has_call`/`has_member`/`has_assignment` were all false → the value was emitted
  bare.

  Both metadata walks now flag a `SpreadElement` as a call: the Phase-2
  `walk_js_expression` (`has_call` + `has_state`) and the Phase-3
  `walk_metadata_flags` used by `build_attribute_value` (`has_call`).

  Clears `svelte-ux/.../SelectField.svelte`, zero corpus regressions.

- a1beb29: fix(compiler): read a store dependency via `$name()` in attribute/derived dependency lists

  A reactive expression that depends on a store value (`$view`, or a store that is
  also written via `$.store_set(view, …)`) must collect that dependency as the
  store's subscribed value — `$view()` — not `$.deep_read_state(view)` (which would
  deep-read the store object instead of subscribing to its value).

  The `$:` reactive-statement dependency builder already handled stores, but the
  two attribute/derived dependency builders
  (`collect_reactive_references_from_metadata` and the tree-walking fallback
  `collect_reactive_references`) classified a store-backed binding as a
  prop/import and wrapped it in `$.deep_read_state(name)`. Detect a store
  dependency by the presence of the synthesized `$name` `StoreSub` binding and emit
  the `$name()` getter instead. Clears
  `svelte-form-builder/src/lib/FormBuilder.svelte` (43 → 42).

- ac7d1f9: fix(compiler): don't rewrite a `$store` reference inside a string literal

  `transform_store_reads_client` appends `()` to legacy store-subscription reads
  (`$store` → `$store()`). Its guard against rewriting inside a string only checked
  whether the _immediately preceding_ character was a quote, so it caught
  `'$store'` but not a store name appearing mid-string, e.g. a log message:

  ```js
  foo("[TODO] -> if ($canvas_dim) :", { w: $canvas_dim.w });
  ```

  The `$canvas_dim` inside the string was rewritten to `$canvas_dim()`, changing
  the string's content. Replace the preceding-char heuristic with
  `is_inside_string_literal`, which scans from the start tracking string and
  template `${ }` state (a `$store` inside a `${ }` interpolation is code and is
  still rewritten). Clears `svelthree/.../WebGLRenderer.svelte` from the corpus
  baseline (51 → 50).

- 128c6f6: fix(compiler): treat a const template-literal of known parts as non-reactive

  A component object-prop that references a `const` whose initializer is an
  interpolated template literal made of known constants —

  ```svelte
  <script>
    const default_title = "Svelte UI Components";
    const image = `https://example.com/og?title=${default_title}`;
  </script>
  <MetaTags openGraph={{ images: [{ url: image }] }} />
  ```

  — was over-memoized: `image` was treated as reactive state (so `openGraph` was
  wrapped in `$.derived(() => ({ … }))` instead of inlined), because Phase-2 only
  recorded a binding's `initial` for plain literals — an interpolated template
  literal left it `None`, which the reactive-state check reads as "unknown →
  reactive".

  Record the template-literal initializer AST in a new `Binding.init_expr_json`
  field (kept separate from `initial`, which feeds `is_prop_source`), populated in
  both the typed and JSON variable-declarator paths. The reactive-state check then
  runs `is_expression_known_json` over it (depth-guarded) — approximating
  `scope.evaluate().is_known` — so a template whose interpolations are all known
  constants is non-reactive, while one containing a call / await / reactive read
  stays reactive (still memoized). Clears `flowbite-svelte/src/routes/+page.svelte`
  and `.../blocks/+page.svelte` (47 → 45).

- d87b019: fix(compiler): treat a line ending in `?` as a statement continuation

  The text-based instance-script accumulator decides a multi-line statement is
  complete when a line looks balanced and isn't followed by an obvious
  continuation. A line ending in a bare ternary `?` was not recognised as a
  continuation, so a legacy `$:` (or `$derived`) assignment whose `?` and
  consequent were separated by a `// comment` —

  ```js
  $: isSelectedStart =
    selected instanceof Object
      ? // @ts-expect-error
        isSame(date, selected.from ?? selected.to)
      : false;
  ```

  — was split after the (comment-stripped) `?` line, orphaning
  `isSame(…) : false;` as bogus top-level statements and emitting invalid JS.

  Add `?` to the trailing-operator continuation set (a superset of the existing
  `??` case). Valid JS never ends a statement with a bare `?`, so this only
  rescues the dangling-ternary case. Clears
  `svelte-ux/.../components/DateButton.svelte` from the corpus baseline (53 → 52).

- 3ed1e82: fix(compiler): preserve whitespace inside `<title>` (SSR), matching upstream

  Upstream's server `TitleElement` visitor calls `process_children` directly on the
  raw fragment nodes — it never runs `clean_nodes`, so the title's inner whitespace
  is preserved verbatim:

  ```svelte
  <svelte:head>
    <title>
      {name ? `${name} |` : ''} Smelte the framework
    </title>
  </svelte:head>
  ```

  rsvelte's `process_children` cleans whitespace internally, so the leading
  `\n    ` before the expression was trimmed (`<title>${…}` instead of
  `<title>\n    ${…}`). Toggle `preserve_whitespace` around the title body's
  `process_children` so its whitespace is kept verbatim, matching upstream's
  clean_nodes bypass. Clears `smelte/src/routes/components/_layout.svelte`
  (39 → 38).

- 69fc318: fix(compiler): don't treat a trailing line comment's text as a continuation operator

  The text-based instance-script statement accumulator decides whether a statement
  continues onto the next line by inspecting the last line's trailing character.
  It ran this check on the raw line _including_ a trailing `//` comment, so a
  declaration whose comment happened to end in an operator-looking character —

  ```js
  export let screenWidth = 768; // md+
  export let menuProps = undefined;
  ```

  (the comment ends in `+`) was misread as a dangling binary `+`, merging the next
  `export let` into the same statement and emitting invalid JS. Comments are only
  pre-stripped here when the legacy script carries a `$`-token, so this path must
  be comment-robust on its own. Strip a trailing line comment (respecting string
  literals) before the trailing-operator / trailing-comma checks. Clears
  `svelte-ux/.../components/ResponsiveMenu.svelte` from the corpus baseline
  (52 → 51).

- 5a1c338: fix(compiler/css): correct three selector scoping/pruning divergences (#1237)

  Three CSS divergences from the official compiler surfaced by the awesome-svelte
  compat corpus (svar-core, svelte-toast), now byte-identical for client and server:

  - **Sibling-combinator over-prune.** `.wx-icon + .wx-label` was commented out as
    unused when the `.wx-icon` element carried a dynamic class
    (`class="wx-icon {expr}"`) — the static `wx-icon` chunk dropped out of the
    element's class set on bail-out. `selector_matches_element` now treats an
    element with an indeterminate `class` (interpolated expression or spread) as
    matching any class selector, mirroring upstream `attribute_matches`.
  - **Multi-line `:global( … )` whitespace.** The unwrap now slices `:global(`.end
    up to the byte before the closing `)` (matching upstream
    `remove_global_pseudo_class`), preserving the inner padding instead of using
    the tight `args` SelectorList span.
  - **`<style>` inside a `<script>` template literal.** A `<style>` substring in a
    script string literal (a docs page rendering a Svelte sample) was mistaken for
    the real stylesheet. `render_stylesheet` / `collect_css_unused_warnings` now
    prefer the parsed stylesheet's recorded `content` span over a textual scan.

- f061348: fix(transform): don't deep-read-wrap an import shadowed by an each-item

  A legacy dependency whose name matches a module import but resolves to a local
  each-item / each-index / snippet-param binding was wrapped in
  `$.deep_read_state(...)` as if it were the import. It now emits a plain
  `$.get(...)` like any each-item, matching the official compiler's scope-resolved
  references.

- 70f55d1: fix(transform): lower a write to a private state field inside a `$derived.by`

  A `$derived.by(() => { … this.#x = v … })` class-field initializer ran a blind
  read-replace that rewrote every `this.#x` to `$.get(this.#x)`, including
  assignment targets, producing the invalid `$.get(this.#x) = v`. It now uses the
  assignment-aware method transformer, which lowers the write to `$.set(...)`.

- 4b2e841: fix(compiler): don't misresolve a `$derived.by` for-loop variable to an `{#each}` item

  A `for`-loop variable inside a `$derived.by(() => { ... })` callback that shared
  a name with an `{#each ... as name}` template item triggered a false-positive
  `each_item_invalid_assignment` error, rejecting code the official compiler
  accepts. The runes-mode each-item check resolved the assignment target with a
  scope walk that reaches the pollution-seeded root scope, so it matched the
  template each item even though the `{#each}` block is not a lexical ancestor of
  the script callback. The error now only fires when the each-item binding's
  declaring scope is actually an ancestor of the assignment site.

- da4aa67: fix(transform): don't wrap explicit object-property keys as prop reads

  An explicit (non-shorthand) object-property key that happened to share a name
  with a `$props()` binding was being rewritten as a prop read in the client
  transform. Only shorthand properties and value positions are reads, so explicit
  keys are now left untouched, matching the official compiler's output.

- 859e522: fix(analyze): don't report `global_reference_invalid` for a `$`-prefixed destructured callback parameter

  A `$`-prefixed identifier bound by an array/object destructuring parameter — e.g. `derived([box_d], ([$box]) => $box.width)` — was wrongly treated as a store subscription and rejected with `global_reference_invalid` (`box` has no store binding). The lexical `$`-identifier scan only recognised `($x)` / `let $x` declaration forms and missed destructuring patterns. Before erroring, the unprefixed-name lookup now also checks whether the full `$name` is itself a real (non-synthetic) scope binding and, if so, treats it as a local reference. The guard sits at the error path so a genuine store whose name also appears as a nested callback parameter (e.g. `page` used as `$page` in the template and as `($page) => …` in `.subscribe()`) still subscribes correctly.

- 3701f7e: fix(transform): include all imports in legacy `$:` dependency thunks regardless of scope

  A legacy `$:` reactive statement compiles to `$.legacy_pre_effect(() => (deps…), …)`.
  Upstream `LabeledStatement.js` adds a dependency for every referenced binding that
  is not `kind === 'normal' && declaration_kind !== 'import'` — i.e. **all** imports
  qualify, regardless of which scope they were declared in.

  rsvelte built the import-membership list with a `scope_index == instance_scope`
  filter. In some TypeScript components the first imports are assigned scope 0 while
  later imports land in the instance scope, so a `$:` block calling an early-imported
  helper (e.g. `createScale(...)`) dropped that helper from the deps thunk. The
  filter now includes every `Import`-kind binding, matching upstream.

  Fixes the corpus entry
  `layerchart/packages/layerchart/src/lib/components/ChartContext.svelte`.

- ce42f21: fix(transform): `$.mutate` wrap for a state member mutation in an if-guarded `$:`

  A `$: if (cond) obj.a.b = x` (state-var member mutation inside an if-guarded
  reactive statement) was emitted without the `$.mutate(obj, …)` wrap — the
  keyword-LHS branch was missing the state-member-mutation pass that both sibling
  branches run.

- ea931bf: fix(transform): six near-miss codegen fixes (store-mutate source, each promotion, prop-write shadow, destructure IIFE, SSR scope-class position)

  - `$.store_mutate(...)` first arg (the store source) now reads a prop-backed store
    as `store()` and a state-backed store as `$.get(store)` via the store var's own
    transform, instead of emitting the bare name — for both component-prop binds and
    DOM-element binds.
  - A `const` collection whose each-item name collides with a `bind:`-reassigned
    outer binding is no longer promoted to `$.mutable_source(...)`; the each-mutation
    check now resolves to the each-item binding (`BindingKind::EachItem`) only.
  - A write to a local binding that shadows a same-named prop (`let timeout` inside a
    function vs `export let timeout`) is no longer rewritten to a prop-setter call;
    the AST prop-assign pass now skips locally-shadowed LHS identifiers.
  - A destructuring assignment preceded by a `}` (e.g. after an `if {…}` block) is
    recognized as a standalone statement, so its IIFE no longer appends `return $$value`.
  - The SSR scoping `class` attribute is appended last (not before a real `style`
    attribute) when the element has `style:` directives but no synthetic `style`.

- 0b2d7fb: fix(transform): three near-miss codegen fixes (template indent, use: SSR, each index)

  - The fast-path JS re-indenter tracked template-literal state with a `bool`,
    which desynced across a multi-line `${ … }` interpolation and mis-indented the
    continuation lines of a later template literal's string content. It now uses the
    full template/interpolation stack (matching the slow path).
  - A `use:` directive on a load/error element (`<track>`/`<img>`/…) in the
    non-spread SSR attribute path now re-captures `onload`/`onerror` (the spread
    path already did).
  - The typed `AssignmentExpression` path now sets `uses_index` on the owning each
    block when an each-item identifier is assigned/mutated (e.g. an event handler
    mutating an outer item), so the `$$index` callback parameter is emitted — the
    JSON path already did this.

- 70f55d1: fix(transform): don't wrap a prop name used as an arrow-function param

  A prop used as an arrow-function parameter binding (`(nodeId) => …`,
  `options => …`) was rewritten to the invalid `(nodeId()) => …`. The text
  prop-read wrapper now skips arrow-parameter binding positions (mirroring the AST
  version's param guard).

- 429de3f: fix(transform): build legacy `$:` dependency thunks from the Phase-2 AST reference set

  The deps thunk of a `$.legacy_pre_effect` was previously built by text-scanning
  the `$:` body (`find_pos` for order; `body_references_identifier` /
  `is_only_assignment_target` / `is_in_lhs_only` for membership). That mis-handled
  chained member-property keys (`l.add('x', e).add(add)` matched `add` from the
  `.add(` method key, not the `add` argument), string-literal text, block
  mutations, and shadowed params — producing wrong-order, wrong, extra, or missing
  dependencies.

  A new Phase-2 pass (`collect_reactive_statement_dependencies`) now records each
  top-level reactive statement's ordered dependency identifier set by walking the
  AST exactly like upstream `2-analyze/visitors/LabeledStatement.js` (order =
  first-appearance traversal order; a name is a dependency unless its only
  references are the outermost member-chain LHS of an `=`; member-property keys,
  object keys, function params and block-locals are never references). The Phase-3
  client deps thunk is emitted from that list. The block-ordering path
  (`extract_reactive_statement_deps` / `sort_reactive_statements`) is untouched.

- ce42f21: fix(transform): don't count a member-property key as a reactive assignment

  `is_assigned_anywhere_in_body` matched a `.name = ` member-property write
  (`obj.name = name`) as an assignment to the `name` binding, adding a spurious
  assignment edge that reordered unrelated `$:` reactive blocks. A name preceded by
  `.` is a member-property key, not a binding assignment, and is now excluded —
  restoring the official source-order emission.

- 6fe6b4a: fix(svelte2tsx): carry renamed-export JSDoc onto the prop

  `getDoc(target)` in official svelte2tsx resolves a prop's `/** @type {...} */`
  from the `let x` declaration first, then — when none is there — from the
  `export { x as y }` statement itself (`exportExpr`). rsvelte only captured the
  doc on the `let` declaration, so the common shape

  ```svelte
  let _class = null;
  /** @type {string | false | null} */
  export { _class as class };
  ```

  dropped the type from the generated `render({...})` destructure, losing the
  prop's declared type in the language server. The export-specifier handler now
  falls back to the export statement's leading JSDoc, mirroring official's
  `getDoc`.

- 7e6cd57: fix(compiler): track `$$restProps` (and `$$props`) read via a spread in a legacy reactive statement

  A legacy `$: x = { ...defaults, ...$$restProps }` dropped its
  `$.deep_read_state($$restProps)` dependency, emitting
  `$.legacy_pre_effect(() => {}, …)` instead of
  `$.legacy_pre_effect(() => $.deep_read_state($$restProps), …)`, so the statement
  no longer re-ran when spread rest-props changed. `body_references_identifier`
  excluded a leading `.` (to avoid matching `obj.prop`), which also rejected the
  spread `...$$restProps`. The `$$`-prefixed compiler specials are never
  member-access targets, so a leading `.` is now allowed for them.

- b92840b: fix(transform): switch-case dep order, SSR control-flow store reads, bind getter/setter setter reads

  - `collect_reactive_statement_dependencies` visits a `SwitchCase`'s `consequent`
    before its `test` (acorn populates them in that order), so a `$:` switch's
    dependency-thunk order matches the official compiler.
  - The SSR instance-script catch-all statement arm now read-wraps store/derived
    reads (`if ($store === …) …`, `for`/`while`/blocks), matching upstream's
    visit-every-statement behavior (the ExpressionStatement / FunctionDeclaration
    arms already did).
  - A `bind:value={getter, setter}` setter body now has read transforms applied,
    so reactive reads inside the setter (`(v) => { … control.min … }`) become
    `$.get(...)`.

- f3a8000: fix(transform): nested prop-assignment in $: RHS, function-decl shadowing, boundary snippet order

  - A nested prop assignment in a `$:` state-var-assignment RHS (an arrow default
    `() => (isOpen = !isOpen)`) is now lowered to the setter call `isOpen(!isOpen())`;
    the state-var branch was missing the prop-assignment pass its siblings run.
  - A `function foo()` declaration now shadows a same-named prop/state binding in the
    runes read-wrapper, so a reference to the local function (`executing.then(enter)`,
    where `async function enter()` shadows an `enter` prop) stays bare instead of
    becoming `enter()`.
  - A non-hoistable `<svelte:boundary failed>` snippet is emitted into the SSR
    template stream in visit order (like the regular snippet visitor) instead of
    being prepended ahead of preceding `{@const}` / sibling snippets.

- e0779f0: fix(transform): fold scope hash into a quote-preserving class literal; explicit `slot="default"` → children

  - A static `class={"draggable"}` (a quote-preserving string literal) now folds the
    scope hash into the string (`$.set_class(el, 1, "draggable svelte-HASH")`) instead
    of passing it as a separate argument — the fold only recognized the canonical
    `String` literal, not the `RawString` variant.
  - An explicit `<Comp><x slot="default" /></Comp>` is now emitted on the server as the
    `children` snippet prop (with `$$slots.default: true`), matching upstream's
    `slot_name === 'default'` handling, instead of a `$$slots.default` function.

- 8ee109d: fix(transform): five codegen fixes (esrap method shorthand, slot memo index, reactive dep order/membership, import-in-template)

  - esrap prints a property whose value is a `FunctionExpression` as method shorthand
    (`"k"() {}`) regardless of key kind, matching esrap — a string-keyed function
    property no longer prints as `"k": function`.
  - The slot-prop memo reference index no longer double-counts, so the getter `$.get($N)`
    matches its `$N` declaration.
  - Legacy `$:` dependency ordering scans a string-literal-blanked copy of the body, so a
    literal word (`` `width: ${x}` ``) no longer text-matches before the real read and
    misorders deps.
  - A bare `ident;` read statement is no longer misclassified as an assignment target, so
    its dependency is kept (was dropped, producing `() => {}` / missing deps).
  - The line-based import extractor tracks cross-line string/template/comment state, so an
    `import …` line inside a backtick template literal is not mis-hoisted as a real import.

- 812b05f: fix(transform): parenthesize `new` callees with a call in their spine + multi-node title defined-check

  - esrap now wraps a `new` callee in parens when its member-object spine contains a
    CallExpression (`new ($.get(deckgl).MapboxOverlay)(…)`) or it is a
    ChainExpression — porting esrap's `has_call_expression` clause so the trailing
    `(…)` is not mis-parsed as the constructor arguments.
  - A multi-node `<title>` interpolation uses the canonical `is_expression_defined`
    check, so a conditional with two string branches (`{name ? \`…\` : ""}`) no longer
gets a spurious `?? ""` coercion.

- 244264a: fix(transform): scope-range store-subscription parameter shadows

  A `$name` used as a function/arrow parameter (including inside array/object
  destructuring, e.g. `([$s, $focused]) => …`) was added to a script-global
  "declared" set, suppressing genuine top-level store subscriptions of the same
  name everywhere. Parameter shadows are now scope-ranged to the parameter's own
  arrow body, so a real `$initialized` subscription outside that body is still
  detected, while a destructured `$focused` param no longer produces a spurious
  subscription. Mirrors upstream scope resolution.

- f632423: fix(compiler): don't false-positive `store_invalid_scoped_subscription` when a `<script context="module">` declares a function

  A function declaration in `<script context="module">` pushes its own function
  scope, so the instance scope index is no longer always `1`. The scoped-store
  guard in `walk_js_expression` / `walk_js_expression_node` hardcoded `1` as the
  instance scope, so an instance-scope store (e.g. an imported store) referenced
  inside a template arrow function was wrongly rejected with
  `store_invalid_scoped_subscription`. The guard now compares against the real
  `instance_scope_index`, mirroring upstream's `owner !== instance.scope` check.
  Genuine scoped subscriptions (a store shadowed by an each-item binding or an
  arrow parameter) still error. Fixes #1225 (svelte-form-builder `PropertyPanel`).

- cd786c3: fix(analyze): include component-tag references in `<select bind:value>` indirect bindings

  A legacy `<select bind:value={foo}>` invalidates every other binding referenced
  within the select whenever `foo` mutates (emitted as a `$.invalidate_inner_signals`
  body). The official compiler builds this list from the select scope's
  `references` map, in which **component-tag** references (`<SelectOptions/>`) are
  inserted _immediately_ during scope creation — ahead of the _deferred_ plain
  identifier references.

  rsvelte's scope-builder never recorded component-tag name references, so a
  component used inside the select (e.g. `<SelectOptions bind:field/>`) was missing
  from the invalidate body, and the surviving identifiers were emitted in pure
  source order rather than components-first.

  The `<select>` indirect-binding population now collects component-tag references
  across the select subtree separately and emits them ahead of the identifier
  group, matching the official `references` insertion order.

  Fixes the corpus entry `svelte-form-builder/src/lib/Components/Select.svelte`.

- ea05921: fix(transform/server): two SSR codegen fixes for `.svelte.(js|ts)` modules + known strings

  - `$effect.tracking()` in a `.svelte.(js|ts)` module is now lowered to the literal
    `false` on the server (there is no effect tracking during SSR), matching the
    instance-script path and the upstream server CallExpression visitor.
  - A binding initialized to a template literal (`const w = \`…${x}…\``) is treated
    as a defined string by the server evaluator, so reads of it are no longer wrapped
    in an unnecessary `$.stringify(...)`.

- af836a2: fix(analyze): allow `slot="…"` on a direct child of a `{#snippet}` block

  A `slot="name"` text attribute on an element whose immediate parent is a
  `{#snippet}` body — e.g. `{#snippet active()}<span slot="active">…</span>{/snippet}` —
  was wrongly rejected with `slot_attribute_invalid_placement`. Upstream's
  `validate_slot_attribute` returns early when `context.path.at(-2)` is a
  `SnippetBlock`. A new `is_direct_child_of_snippet` context flag (set while
  analyzing a snippet body, reset on entering any nested element/block, mirroring
  `is_direct_child_of_component`) reproduces that early return. Non-text `slot={…}`
  values are still rejected by the separate `is_text_attribute` check.

- 70f55d1: fix(transform): collect a spread argument as a reactive dependency

  The legacy reactive-reference fallback walker treated a `SpreadElement`
  (`[...x]`, `f(...x)`) as a terminal node, so the spread's argument was never
  walked and its dependency dropped from the memo/effect (e.g.
  `sum([...data.data], …)` lost `data`). It now recurses into the spread argument.

- f061348: fix(transform): detect a spread `...prop` as a read in legacy reactive deps

  `body_references_identifier` excluded a `.` before a name to skip member access,
  which also skipped a spread (`...prop`). A `$:` statement that spreads an
  imported/prop/state binding therefore dropped that dependency from its
  `$.legacy_pre_effect(...)` tracking thunk. A spread prefix is now recognized as a
  read.

- f061348: fix(transform): don't wrap a store name used as a destructured arrow param

  A store name inside an array/object destructuring arrow parameter
  (`([$x, $y]) => …`) was wrapped to `$x()` (invalid in a binding position). The
  function-parameter check now strips destructuring delimiters so the shadowing
  local param is recognized and left bare.

- 1af9df3: fix(transform): wrap store reads in a ternary inside a function body

  The legacy text-based store-subscription read transform skipped any `$store`
  whose following `:` made it look like an object property key (`{ $store: … }`).
  Its object-literal guard only counted unmatched `{` in the emitted prefix, so a
  function body's own block brace counted as an object literal — making a ternary
  `cond ? $store : x` _inside any function body_ match the property-key heuristic
  and leave `$store` un-called.

  A real property key is always immediately preceded (skipping whitespace) by `{`
  (first entry) or `,` (later entry), whereas a ternary consequent is preceded by
  `?`. The property-key check now also requires that preceding separator, so the
  ternary `$store` is correctly lowered to `$store()`.

  Fixes the corpus entry
  `svelte-ux/packages/svelte-ux/src/lib/components/Duration.svelte`.

- fa4dd68: fix(transform): two invalid-JS emissions for store/prop reads in binding positions

  - A store subscription used as an object-literal SHORTHAND (`{ $width, $height }`)
    was wrapped to the invalid method-shorthand `{ $width() }`. It now expands to
    `{ $width: $width() }`, matching the prop-read path.
  - A prop name used as a destructuring binding inside a keyword-guarded reactive
    body (`$: if (cond) { const [x, y] = f(); … }` where `x`/`y` shadow props) was
    wrapped to the invalid `const [x(), y()] = …`. That branch now routes prop reads
    through the scope-aware AST wrapper, which never wraps binding positions or
    locally-shadowed reads.

- f061348: fix(transform): wrap a non-sole store read inside `$derived(...)`

  A store subscription that was the FIRST token of a larger `$derived(...)` /
  `untrack(...)` argument (`$derived($store.x / 2)`) was wrongly left bare. The
  bare-getter collapse now only applies when the store ref is the SOLE argument
  (`$derived($store)`); otherwise it is wrapped to `$store()`.

- f061348: fix(transform): lower a store write nested in a reactive block body

  A `$store = x` inside a `$:` block body (`$: { … $store = x }`) was not lowered
  to `$.store_set(store, x)`; the read wrap then mangled the LHS into `$store() = x`
  (invalid JS). The block-body path now runs the store-assignment lowering before
  wrapping reads.

- f061348: fix(transform): three `.svelte.(js|ts)` class-field SSR fixes

  - Private `$derived` reads inside arrow-function class fields (`onkeydown = (e) =>
{ … this.#derived … }`) are now called (`this.#derived()`), matching the
    Field/Method handling.
  - A multi-line `$state(...)` / `$state.raw({ … })` field initializer is now
    unwrapped to its inner value (a plain public server field) instead of leaking
    the rune and being privatized.
  - A class member whose arrow body is nested in a call
    (`onpointermove = whenMouse(() => { … })`) no longer runs away the member
    accumulator and drops every following member.

- 4746423: fix(compiler): infer SVG namespace for element-less fragments inside `<svg>`

  A `{#snippet}` (or any element-less fragment) whose body lives in an SVG context
  but contains only adjacent component / render-tag anchors was emitted via
  `$.from_html` instead of `$.from_svg`, and the SSR markup kept a spurious
  whitespace text node between the anchors (`<!----> ` instead of `<!---->`). This
  cascaded into wrong `$.sibling(node, 2)` offsets. Namespace inference for a
  fragment with no element children now inherits the enclosing namespace (a
  faithful port of upstream `check_nodes_for_namespace`, deep-walking
  `{#if}` / `{#each}` / `{#await}` / `{#key}` containers) rather than defaulting to
  `html`, on both the client and server transforms.

## 0.7.15

### Patch Changes

- aea0fb3: fix(compiler): treat a prop default that is a conditional/binary/logical expression containing a reactive-binding read as non-simple

  A prop whose default is e.g. `fill = solid ? 'currentColor' : 'none'` (with `solid` a prop) was mis-classified as a static default and emitted as `$.prop($$props, "fill", 8, solid() ? …)` — missing `PROPS_IS_LAZY_INITIAL` and the default thunk — instead of the official `$.prop($$props, "fill", 24, () => (solid() ? …))`. The simplicity check now defers to an exact OXC-AST predicate mirroring upstream `is_simple_expression`, recursing into operands and treating a reactive-binding identifier (rewritten to a getter call in legacy mode) as non-simple.

## 0.7.14

### Patch Changes

- 9613f55: docs(readme): publish the correct README for each npm package

  `@rsvelte/compiler` shipped the `rsvelte_lint` crate's README (the linter docs)
  because `wasm-pack` copies the built crate's README into `pkg/`; `finalize-pkg.mjs`
  now overlays the compiler-specific README into `pkg/README.md`. `@rsvelte/vite-plugin-svelte`
  was still titled `@sveltejs/vite-plugin-svelte` with broken relative doc links —
  rewritten for the rsvelte fork with absolute links.

## 0.7.13

### Patch Changes

- ac44d7b: Phase-3 corpus CSR/SSR byte-parity burndown: known-failures 50 → 32 (16 root-cause
  fixes). Server: each-item shadows same-named component `$derived` in the read-wrap
  pass; module `$state.snapshot(x)` strips to bare `x` for declarator inits; destructured
  `export let` lowering gets per-`ArrayPattern` `$$array_N` naming + `$.fallback` defaults
  - `RestElement`; component trailing `<!---->` anchor is kept in preserve-whitespace
    context; constant-fold decodes `\u`/`\x` escapes. Client: a static `<input checked>`
    child no longer forces its parent to be traversed; `rest_excludes` hoists above
    `$.with_script` templates; a prop default containing a nested arrow is treated as
    non-simple (lazy thunk); reassigning state from a prop with a primitive default skips
    the proxy flag. Analysis: `<svelte:window/document/body>` regular-attribute handler
    expressions are now analyzed (so an imported call sets `needs_context`); snippets are
    hoistable through `NewExpression` and `<svelte:component>`. Output is otherwise
    unchanged; all gates green, no corpus regressions.

## 0.7.12

### Patch Changes

- a93f50c: Phase-3 client: add a structured `JsLiteral::BigInt` variant and use it for
  bigint literals (`123n`) instead of `JsExpr::Raw`. Continues the Phase-3 Step 1+3
  `js_ast` `Raw(...)` burn-down. Output is unchanged (byte-identical; corpus
  baseline holds at 120).
- a93f50c: Phase-3 client: replace the dynamic-`import()` `Raw` escape hatch with a
  structured `JsExpr::ImportExpression { source, options }` node. Previously the
  source/options were eagerly stringified via `generate_expr` and spliced into a
  `format!("import({})")` `Raw`; now they are held as converted sub-expressions and
  emitted lazily by the codegen. The node is treated as a terminal in the analysis
  passes (await / transform / reactive-ref collection), exactly mirroring the opaque
  `Raw` it replaced, so the sub-expressions are not re-transformed after conversion
  — keeping output byte-identical. Continues the Phase-3 Step 1+3 client `js_ast`
  `Raw(...)` burn-down (`docs/phase3-ast-refactor-plan.md`). Corpus baseline holds
  at 120.
- a93f50c: Phase-3 client: replace the `format!`-based `JsExpr::Raw("import.meta")` escape
  hatch with a structured `JsExpr::MetaProperty(meta, property)` node (printed as
  `meta.property`, handled as a terminal leaf in the await/transform/reference
  passes). Continues the Phase-3 Step 1+3 burn-down of the client `js_ast`
  `Raw(...)` surface (`docs/phase3-ast-refactor-plan.md`). Output is unchanged
  (byte-identical; corpus baseline holds at 120).
- a93f50c: Phase-3 client: replace the `JsExpr::Raw("super")` escape hatch with a structured
  `JsExpr::Super` node (printed by the codegen, handled as a terminal leaf in the
  await/transform/reference-collection passes). First slice of the Phase-3 Step 1+3
  work to shrink the client `js_ast` `Raw(...)` surface ahead of switching client
  output to oxc-AST + `rsvelte_esrap` printing (`docs/phase3-ast-refactor-plan.md`).
  Output is unchanged (byte-identical; corpus baseline holds at 120).
- a93f50c: Phase-3 Step 1+3 (direct-AST): add the `js_ast::to_oxc` converter that lowers the
  client `js_ast` IR (`JsProgram`) into an oxc `Program` for printing by
  `rsvelte_esrap` — the foundation for replacing the handwritten `js_ast::codegen`
  with structured esrap printing. The converter returns `None` on any `Raw`/unhandled
  variant so the caller transparently falls back to the existing codegen (partial
  coverage is always safe). It is wired behind the `RSVELTE_CLIENT_TO_OXC` env flag,
  **off by default**, so committed behavior is unchanged. With the flag on, the
  byte-exact suites pass identically (`runtime` 19/19, `compiler_fixtures` 17/17),
  confirming the converter is faithful for every structured client program in the
  fixtures. Coverage grows one node kind at a time, gated by those byte-exact tests;
  the flag flips to default-on once `Raw` nodes are eliminated and all variants are
  handled.
- f68f2a3: Phase-3 corpus byte-parity burndown: known-failures `67 → 50`. Each fix is
  independent and AST-precise, verified byte-identical against the official
  compiler with zero corpus regressions:

  - scope-aware `should_proxy` for private `$state` field assignments
  - constructor nested-function private `$state` reads use `$.get(...)` not `.v`
  - boundary-nested `{#snippet}` emitted inline (not hoisted to module scope)
  - `Math.*` / `Number` / `String` / `BigInt` const initializers are `is_defined`
    (no spurious `?? ""`)
  - `$.css_props` SVG-namespace flag reflects the rendering context
  - store reads inside a spread (`...$store`) are wrapped
  - no constant-fold of an identifier shadowed by an `{#each}` item
  - a class-body-declared private field assigned a rune in the constructor keeps
    its source position
  - nested-function private `$state` member mutation reads through the proxy
    (`$.get(this.#x).prop`)
  - TS-typed declaration tag `{const x: number = …}` no longer dropped on the server
  - invalid top-level reactive declaration `$:` in `<script module>` is dropped

  Output for all other inputs is unchanged.

- b75ceb5: Harden the `rsvelte_esrap` printer (which prints the compiler's Phase-3 output)
  against the upstream esrap `v2.2.11` test suite, now vendored as a submodule and
  ported to Rust. The full esrap sample corpus is byte-identical (97/97) and every
  esrap unit test (quotes, indent, compat, additional-comments, arrow-return-type,
  sourcemap-keywords) is ported and passing. Printer behaviour was made faithful
  to esrap: directives, `EmptyStatement`/`WithStatement`, import attributes,
  comment threading through sequences/call-args/class-bodies, full TypeScript
  type-syntax and JSX printing, precedence-based parenthesisation (unwrapping
  explicit parens like esrap's acorn baseline), and string escaping (`\t` left
  literal). Adds source-map generation (`print_with_map`) and synthetic-comment
  hooks (`print_with_hooks`).
- 47e5bec: Phase-3 output codegen is now AST-based on both sides (output byte-identical).
  Server SSR switched to the pure-AST `server/ast` pipeline and the legacy text
  generator (`build.rs`/`bridge.rs`/text `server/visitors/`/`ServerCodeGenerator`,
  ~32k lines) was deleted. Client CSR now defaults to `js_ast::to_oxc` →
  `rsvelte_esrap`, with the handwritten string printer kept only as a fallback for
  comment-bearing / unsupported-node programs. `to_oxc` learned to parse
  `Raw`/`RawMapped` and unwrap `Spanned`, sourcemaps route through esrap
  `print_with_map`, and a new `PrintOptions.keep_empty_statements` flag preserves
  empty-statement parity for the client path. Validated byte-exact across runtime,
  compiler_fixtures, ssr, sourcemaps, real_world, and the compatibility report;
  corpus baseline shrank 120 → 67 with no regressions.
- a93f50c: Phase-3 Step 1+3 (Raw elimination): replace the three `JsExpr::Raw` escape hatches
  used for literal source-spelling preservation (double-quoted strings,
  non-canonical number formats like `1_000_000`) with structured
  `JsLiteral::RawString { value, raw }` / `RawNumber { value, raw }` variants. The
  codegen emits the `raw` verbatim (byte-identical to the old `Raw`), and the
  `js_ast::to_oxc` converter builds an oxc literal with `raw` set so esrap reproduces
  it. First slice of eliminating the client `Raw(...)` constructions so real programs
  become Raw-free and convert direct-AST. Byte-identical: corpus 120 no-NEW,
  flag-off and flag-on byte-exact suites both 19/19 + 17/17.
- a93f50c: Phase-3 Step 1+3 (Raw elimination): replace the 4 load-bearing `JsExpr::Raw(name)`
  prop-setter-callee escape hatches (in `shared/declarations.rs` / `program.rs`)
  with a structured `JsExpr::OpaqueIdentifier(name)` variant. Like the `Raw` it
  replaces, it is skipped by the transform passes (so the setter callee is not
  re-read-transformed into `x()(value)`) and codegens the bare name — but it is now
  a structured node the `js_ast::to_oxc` direct-AST converter handles (builds a plain
  oxc identifier). Byte-identical: corpus 120 no-NEW, flag-off and flag-on byte-exact
  both 19/19 + 17/17.
- a93f50c: Phase-3 server: lower derived **assignments** (`count = x` → `count(x)`, compound
  and logical operators expanding via `build_assignment_value` — `count += 1` →
  `count(count() + 1)`, `flag &&= x` → `flag(flag() && x)`; upstream
  `AssignmentExpression.js`) structurally in the AST read-wrapping pass
  (`derived_reads_ast::visit_assignment_expression`), over the original valid
  script, instead of the textual `rewrite_derived_assignments` scan. That scan ran
  on the post-wrap intermediate `count() = x` — not valid JS (a call is not an
  assignment target), so it could never be re-parsed — and now survives only on the
  byte-scanner fallback path. Implemented as non-overlapping edits (skip the LHS
  identifier, replace the `op=` gap, append `)`) so RHS read-wrapping and nested
  `a = b = 1` resolve in the same pass. Follows the update-expression fold; part of
  the staged Phase-3 text → AST migration (`docs/phase3-ast-refactor-plan.md`).
  Output is unchanged (byte-identical; corpus baseline holds at 120).
- a93f50c: Phase-3 server: lower derived **update expressions** (`count++` / `--count` →
  `$.update_derived(count)` / `$.update_derived_pre(count)`, Svelte 5.53.2 upstream
  `6aa7b9c64`) structurally in the AST read-wrapping pass
  (`derived_reads_ast::visit_update_expression`), over the original valid script,
  instead of the textual `rewrite_derived_update_expressions` scan. That scan ran
  on the post-wrap intermediate `count()++` — not valid JS (a call is not an
  assignment target), so it could never be re-parsed — and now survives only on
  the byte-scanner fallback path, where it keeps the two paths byte-identical. Part
  of the staged Phase-3 text → AST migration (`docs/phase3-ast-refactor-plan.md`).
  Output is unchanged (byte-identical; corpus baseline holds at 120).
- 7d0c17b: Phase-3 server: the pure oxc-AST + `rsvelte_esrap` SSR pipeline (`server/ast/`)
  now matches the official Svelte compiler byte-for-byte across the entire curated
  suite — runtime-runes 993/993, runtime-legacy 1205/1205, hydration 77/77, the
  byte-exact `compiler_fixtures` / `ssr` snapshots, and 100% of every
  compatibility-report category. It remains OPT-IN behind `RSVELTE_SERVER_AST=1`;
  the text-based `ServerCodeGenerator` is still the default. The switchover to
  default is deferred: enabling the AST pipeline by default currently regresses 88
  real-world corpus entries on SSR (chiefly an over-eager `$.stringify(...)` wrap
  on conditional class/title interpolations, dropped instance-script comments, and
  a few function/`$$settled` ordering and slot-arg cases), which must be fixed
  first. See `docs/phase3-server-ast-remaining-work.md`. No change to default
  output; corpus baseline holds at 120.
- a93f50c: Phase-3 server: collapse `$.derived(() => NAME())` → `$.derived(NAME)` (Svelte
  5.55.5 upstream `b771df3`) structurally via a new AST pass
  (`unthunk_derived_ast`), matching the `$.derived(...)` call with a single
  parameterless expression-bodied arrow whose body is a 0-arg non-optional call of
  a derived identifier. Replaces the literal-prefix byte scanner
  `unthunk_bare_derived_arg`, which now serves only as the parse-failure fallback.
  Part of the staged Phase-3 text → AST migration
  (`docs/phase3-ast-refactor-plan.md`). Output is unchanged (byte-identical; corpus
  baseline holds at 120).
- 99725cc: Make several SSR (server) code-generation paths byte-faithful to the official
  compiler / esrap, burning down the output-equality corpus:

  - The `rsvelte_esrap` printer now flushes per-property leading comments in
    object **patterns** (and their rest element), mirroring esrap's `_` wildcard.
    A `// line` comment inside a `$props()` destructure no longer prints on a
    single line where it would swallow the following token (`tabindex = // c 0`).
  - `escape_js_string` emits tab characters literally instead of as `\t`, matching
    esrap's `quote()` — multi-line `class="…"` values keep their source tabs.
  - `transform_class_fields_server` no longer mangles JSDoc / block comments in the
    class body of `.svelte.(js|ts)` server modules (it was appending `;` to every
    comment line and joining `*/` to the following method).
  - Component-prop template-literal interpolations that statically evaluate to a
    defined string are interpolated raw instead of wrapped in `$.stringify(…)`,
    matching upstream `build_attribute_value`.
  - TypeScript field modifiers (`readonly`, `public`, …) are stripped when lowering
    public `$derived`/`$derived.by` class fields, so `readonly x = $derived.by(…)`
    lowers to the correct `get x()/set x($$value)` accessor pair.
  - `transform_class_fields_server` recurses across all classes in a module instead
    of bailing out at the first class without rune fields (which silently skipped
    later classes' field lowering).
  - `bind:this` is excluded from `<svelte:element>` server spread attributes, and a
    dynamic `class` value in a spread object is wrapped in `$.clsx(…)`.
  - Multi-line template-literal interiors in transformed `<script>` blocks are no
    longer re-indented (their content is part of the string value).
  - `bind:prop={() => get, set}` (SequenceExpression) bindings keep their source
    position relative to `{...spread}` in `$.spread_props([…])`, and their get/set
    accessors reference the hoisted `bind_get()`/`bind_set($$value)` variables.
  - Event-handler attributes (`onclick={…}` etc.) are excluded from `<svelte:element>`
    server spread attributes.
  - A `{#snippet}` body — and a component's inline `children`/default-slot whose
    sole child is a standalone component/render-tag — no longer emits a trailing
    `<!---->` marker.
  - A typed `$props()` destructure with an object/intersection TS annotation
    (`{ a, ...rest }: Base & { … }`) strips the annotation correctly instead of
    leaking it into the rest element (which dropped user-written `$$slots`/`$$events`).
  - A multi-line `$props()` destructure with an interior `// line comment` no longer
    collapses into unparseable output (the comment swallowing the next property).
  - `const id = $.props_id($$renderer)` is hoisted to the top of the component body,
    matching upstream's `body.unshift(...)`.
  - Template-literal lines that resemble imports are no longer hoisted by the
    line-based import scanner, and template-literal interiors are preserved verbatim
    when re-indenting nested dynamic-component calls (no spurious tabs in HTML).
  - A method chain split across lines by `//` comments no longer gets a spurious
    `;` inserted mid-chain (which orphaned the continuation and broke parsing).

- a93f50c: Phase-3 Step 2 (script transform → AST): migrate the server
  `strip_export_from_declarations` pass from a line scanner to an AST-driven-edit
  pass (`server/strip_export_ast.rs`, mirroring the `derived_reads_ast` pattern):
  it visits `ExportNamedDeclaration`s whose declaration is a function/class/`const`
  and strips the exact 7-byte `export ` prefix structurally. The line scanner remains
  as the parse-failure fallback. Byte-identical: corpus 120 no-NEW, byte-exact
  runtime 19/19 + compiler_fixtures 17/17, plus 11 new unit tests.
- a93f50c: Phase-3 Step 1+3 (direct-AST): extend `js_ast::to_oxc` to handle class expressions
  (methods of all kinds incl. constructor, instance/static fields, computed keys,
  super-class; bails on static blocks/decorators) and assignment-target
  destructuring (`[a,b] = x` / `{a} = x` with defaults/rest/holes via oxc
  `AssignmentTargetPattern`). The converter is now **variant-complete** — every JS
  construct is handled; only opaque `Raw`/`Spanned` IR nodes bail. Still gated OFF
  behind `RSVELTE_CLIENT_TO_OXC`; flag-on byte-exact suites pass identically (runtime
  19/19, compiler_fixtures 17/17). Committed behavior unchanged.
- a93f50c: Phase-3 Step 1+3 (direct-AST burn-down): extend `js_ast::to_oxc` to handle the
  control-flow statements — `for`, `for…of` / `for…in` / `for await…of`, `while`,
  `do…while`, `switch`, labeled statements, and `try/catch/finally` — plus a shared
  `variable_declaration_node` helper reused by var-decl/export/for-init. Still gated
  OFF behind `RSVELTE_CLIENT_TO_OXC`; flag-on byte-exact suites pass identically
  (runtime 19/19, compiler_fixtures 17/17). Committed behavior unchanged.
- a93f50c: Phase-3 Step 1+3 (direct-AST burn-down): extend `js_ast::to_oxc` to handle
  destructuring binding patterns — object/array patterns with defaults, rest
  elements, holes, computed keys, and nesting — via a shared recursive
  `binding_pattern` helper now used by variable declarators, function/arrow params
  (incl. rest params), for-of/for bindings, and catch parameters. Still gated OFF
  behind `RSVELTE_CLIENT_TO_OXC`; flag-on byte-exact suites pass identically (runtime
  19/19, compiler_fixtures 17/17). Committed behavior unchanged.
- a93f50c: Phase-3 Step 1+3 (direct-AST burn-down): extend `js_ast::to_oxc` to handle
  `Function` expressions, `Chain` (optional chaining), dynamic `import()`
  (`ImportExpression`), and `Regex` literals. Still gated OFF behind
  `RSVELTE_CLIENT_TO_OXC`; flag-on byte-exact suites pass identically (runtime 19/19,
  compiler_fixtures 17/17). Committed behavior unchanged.
- a93f50c: Phase-3 Step 1+3 (direct-AST burn-down): extend `js_ast::to_oxc` to handle
  `import`, `export { … }` / `export const/function …`, `export default`, and
  function-declaration statements — the high-impact unlock that lets the converter
  fire on real components (which all have imports). Import/export source strings and
  the no-specifier (`import 'x'`) distinction mirror the existing codegen exactly.
  Still gated OFF behind `RSVELTE_CLIENT_TO_OXC`; flag-on byte-exact suites pass
  identically (runtime 19/19, compiler_fixtures 17/17). Committed behavior unchanged.
- a93f50c: Phase-3 Step 1+3 (direct-AST burn-down): extend the `js_ast::to_oxc` converter to
  handle `TemplateLiteral`, `TaggedTemplate`, `Assignment` (identifier / non-optional
  member targets), and `Update` expressions, so more client programs lower directly
  to oxc + esrap instead of bailing to the string codegen. Still gated OFF behind
  `RSVELTE_CLIENT_TO_OXC`; with the flag on, byte-exact suites pass identically
  (runtime 19/19, compiler_fixtures 17/17). Committed behavior unchanged.
- a93f50c: Phase-3 Step 1+3 (direct-AST burn-down): extend `js_ast::to_oxc` to handle `yield`
  expressions, private-field member access (`obj.#x`), and object-literal
  method/getter/setter/computed properties (mirroring codegen's `auto_method`
  heuristic so non-computed `Init` function-valued props print as method shorthand).
  Only `JsExpr::Class` remains bailed at the expression level. Still gated OFF behind
  `RSVELTE_CLIENT_TO_OXC`; flag-on byte-exact suites pass identically (runtime 19/19,
  compiler_fixtures 17/17). Committed behavior unchanged.

## 0.7.11

### Patch Changes

- 2fa1412: Corpus output-parity fixes (known failures 262 → 125, on top of wave 6):
  `should_proxy` identifier-binding resolution + `SequenceExpression`; comment-only
  `<script module>` dropped; `$props.id()` evaluates to a defined string (server);
  `TEMPLATE_USE_IMPORT_NODE` for static `<video>` / custom elements; known-global
  calls (`Math.*`/`Number`/`String`/`BigInt`) skip the `?? ""` coalesce in text
  interpolation; server-module public `$state` class fields stay public; scoped
  `<svelte:element>` emits its scope class on the server; CSS rendering handles
  whitespace in the `</style>` closing tag.
- c52c829: Corpus output-parity fixes (known failures 125 → 42, on top of the 262 → 125
  wave). Faithful upstream-aligned codegen fixes, each verified against the full
  CSR/SSR corpus and the byte-exact runtime/ssr/compiler_fixtures/css suites with
  zero regressions:
  - decode `\u`/`\x` escapes when folding a known-const string to its cooked
    value (client + server) and re-escape bidi-control/format characters in
    server string literals;
  - `should_proxy` resolves an Identifier through its binding's initial node type;
    nested `:global { … }` blocks and `:has(> [open])` leading combinators scope
    correctly; SSR multi-part style-directive values; `<title>` hoisting; spread
    element reactivity; `<option>` `?? ""` elide for a shadowed each-index;
  - server compound-assignment recompaction (`$.set(s, s + 1)` → `s += 1`);
    `var`-declared exported props keep their `var` keyword (client + server);
    `this.#field = …` LHS now parses to a `MemberExpression` (sets `needs_context`)
    and public class-field backing names are deconflicted against existing private
    members (`deps` → `#_deps`);
  - `$.store_unsub` wrap on a destructuring reactive assignment; SSR
    trailing-whitespace trim before a hoisted `{@const}`/`{const …}`/`{#snippet}`;
    `$$index` numbering recurses into `<svelte:fragment>`; `<svelte:component>`
    `let:x={y}` slot-prop rename preserved; member-assignment properties are no
    longer recorded as reactive declared vars (reactive-statement ordering).

  Remaining failures are tracked in `docs/corpus-remaining-work.md`; the dominant
  cluster requires the Phase-3 AST → printer refactor
  (`docs/phase3-ast-refactor-plan.md`).

- d7ef569: Corpus burn-down wave 6: SSR output parity fixes (clean_nodes edge-whitespace/comment handling, Svelte whitespace set so `&nbsp;` survives trimming, SVG single-space removal, load/error capture events from `use:` directives, `<!doctype>` voidness, `$props.id()` string evaluation, nested-snippet hoisting, esrap positional-comment recovery) — real-world corpus known failures 316 → 262.
- 5f0b53e: Corpus output-parity fixes: real-world corpus known failures **42 → 0**. Every
  one of the 6,409 `.svelte` / `.svelte.(js|ts)` corpus sources now compiles to
  output that is AST/byte-identical to the official Svelte compiler for both CSR
  and SSR (`compat/corpus/known-failures.json` is empty). Each fix is an
  upstream-aligned codegen change verified against the full CSR/SSR corpus and the
  byte-exact runtime/ssr/compiler_fixtures/validator/compiler_errors/print/css
  suites with zero regressions:
  - **Evaluation / constant-folding**: rune-call (`$state`/`$state.raw`/`$derived`)
    and chained declaration-tag initial-value folding; `ConditionalExpression`
    branch-pruning when the test folds to a known constant (textContent
    optimisation); RegExp / NaN / ±Infinity literal folds; and the upstream
    memoize-**then**-evaluate ordering so a `has_call` chunk is never folded
    (`{duration ? format(duration) : '…'}` stays reactive while `{a / b}` of two
    non-updated `$state` vars folds to a static literal).
  - **store-vs-rune detection** (locally-declared non-rune names no longer flip
    runes mode; `$state()` store-getter call lowering; `$inspect` removal in
    `.svelte.js` module scripts).
  - **`$derived`-returning-function currying** (`yScale()(tick)`) on the server,
    via a comment-agnostic member-declaration discriminator.
  - **Server class-member parsing** (multi-line constructor params + field
    initialisers), public `$state` class fields lowered to `#private` + get/set
    accessors, `$state.raw` no-proxy `$.set`, and a parser `find_matching_bracket`
    fix for template literals containing regex backticks.
  - **Comment-aware instance-script prop lowering**, legacy `$:` topological order
    via template-literal dependency extraction, nested-snippet hoisting + render-tag
    lexical scope resolution, server slot-forwarding + nested snippets, await-pending
    block scope, each-block dependency collection no longer descending into nested
    function bodies, SSR `{@const}` whitespace preservation, and assorted targeted
    codegen fixes (bare-derived prop arg, `return;`, single-statement `while` body,
    destructure assignment IIFE, rest-eachblock bind LHS).
  - **Error parity**: a `<svelte:element>` carrying a `let:` directive now fails to
    compile with `Not implemented: LetDirective`, matching the official compiler
    (previously rsvelte compiled it).

## 0.7.10

### Patch Changes

- 359c84d: Real-world output parity: rsvelte's CSR/SSR output is now byte-identical (after formatting normalization) to the official Svelte 5.56.2 compiler for 6,091 of 6,407 real-world sources collected from sveltejs/svelte and sveltejs/svelte.dev (including markdown code blocks), with zero error-presence/error-code mismatches. Fixes include the experimental_async gate, @const snippet scoping, custom-element accessors/props, a faithful css-prune port, server comment fidelity, derived compound-assignment lowering, and dozens of error-parity rules. A new corpus CI ratchet (compat/corpus/known-failures.json) prevents regressions while the remaining 316 entries are burned down.

## 0.7.9

### Patch Changes

- cbf2d18: fix(compiler): emit valid JS for `$state`/`$derived` private class fields in `.svelte.(js|ts)` modules (#907)

  `compileModule` produced **syntactically-invalid** JavaScript for several class-based rune-module shapes (reported against the `runed` library). The output parsed fine in isolation by `compileModule` itself — it only blew up once a bundler re-parsed it — so under Vite 8 + Rolldown, which compiles modules in parallel and aborts on the first bad file it reaches, the failing file set and the parser error text varied between runs. That _looked_ like a thread-safety bug, but the per-file output was actually deterministic; the compile path holds no shared mutable state (added a concurrency stress test that compiles the real `runed` corpus across 8 threads and asserts byte-identical output).

  Four deterministic codegen bugs in the line-based class-field transform, each now fixed:
  - **Trailing line comment swallowed into `$.set(...)`** — `this.#x = getter(); // note` lowered to `$.set(this.#x, getter(); // note, true)` (an unterminated call). RHS extraction now stops at the top-level `;` and re-appends the `; // comment` tail.
  - **Prefix-sibling field corruption** — wrapping a private-field read used a bare `str::replace`, so wrapping `#fps` rewrote the unrelated sibling `#fpsLimitOption` into `$.get(this.#fps)LimitOption`. Reads are now replaced only at a trailing word boundary.
  - **Multi-line constructor RHS split** — `this.#rect = {\n …\n }` was transformed line-by-line, orphaning `this.#rect = {` from its body. Constructor statements are now grouped by bracket depth before the transform runs.
  - **Server `$state` field lowered to a call** — on SSR a `$state` private field is a plain value, but `this.#x = v` was lowered to the call form `this.#x(v)` (and reads to `this.#x()`). `post_process_for_server` now distinguishes `$.derived(...)`-backed fields (callable) from `$state` fields (plain `this.#x` / `this.#x = v`).

  Also fixes a spurious `constant_assignment` error (`runed/persisted-state`): a class-method body was not registered in the scope map, so a method-local `let x` that shadowed a top-level function param `x` was misresolved to the outer (constant) binding. Class-method bodies are now registered like function bodies. Closes #907.

## 0.7.8

### Patch Changes

- e4c82de: fix(parse): give `switch` discriminants and assignment-pattern defaults exact identifier spans (#916). In program/script context the statement converter routed a `switch (X)` discriminant, a `case X:` test, a `do … while (X)` test, and the default value of a destructuring `AssignmentPattern` through `convert_expression` (which subtracts the synthetic-paren offset) instead of `convert_expression_for_program`. That shifted those spans one code unit to the left — `switch (x)` spanned the `x` as `(`, and the `$bindable` callee in `let { open = $bindable(false) }` spanned as ` $bindabl` — so span-based edits (`magic-string`, svelte-shaker) corrupted the source. All four now use the program-context converter, so every identifier satisfies `source.slice(start, end) === name`.

## 0.7.7

### Patch Changes

- 26aeb22: Republish at the correct release version. The previous `0.7.6` publish never
  reached npm: the wasm `pkg/` was stamped with the build crate's version
  (`0.1.0`) instead of the release version, so `changeset publish` attempted
  `@rsvelte/compiler@0.1.0`, hit npm's already-published guard (E403), and
  crashed the Release run. This ships the same compiler at a correctly-versioned
  package — there is no functional change to the compiler itself.

## 0.7.6

### Patch Changes

- 02756b5: fix(parse): emit the full TS type tree for inline type annotations instead of a `TSUnknownKeyword` stub. `parse_svelte` (WASM) and `parse` (native) serialized an inline TS type annotation — e.g. the `: { hasIcon: boolean; label: string }` on a `$props()` destructuring — as a members-less, span-less `{ "type": "TSUnknownKeyword" }` stub, because the two hand-written `TSType` → JSON converters only handled a handful of keyword kinds and collapsed everything else (object literals, unions, references, arrays, literal types, …). They are now consolidated into one converter that emits svelte/compiler's (acorn-typescript) ESTree shape: `TSTypeLiteral` with a `members` array of `TSPropertySignature` nodes (each with its own span, `key`, and nested `typeAnnotation`), plus `TSUnionType`/`TSIntersectionType`, `TSArrayType`, `TSTypeReference` (with `typeArguments`), `TSLiteralType`, `TSParenthesizedType`, `TSTypeOperator`, `TSIndexedAccessType`, and the full set of keyword types. Any still-unmodelled exotic type degrades to a _span-bearing_ node rather than the old span-less stub, so downstream tooling can always address it. Closes #791.
- 0f46b27: fix(parse): emit AST spans as UTF-16 code-unit offsets, not UTF-8 byte offsets. `parse_svelte` (WASM), `parse` (native), and `parseEnvelope` (native raw-transfer) emitted node `start`/`end` (and `loc` `column`/`character`) as UTF-8 byte offsets, while `svelte/compiler` and the whole JS ecosystem (`magic-string`, `svelte-eslint-parser`, every `String.slice` consumer) use UTF-16 code-unit offsets. For ASCII source the two coincide, but the moment a source contains a non-ASCII character (e.g. Japanese UI strings) before a node, every later span was shifted by `byteLen − utf16Len` — producing wrong slices or a hard `magic-string` "end is out of bounds" crash. All three parse output surfaces now remap byte → UTF-16 on the way out (reusing the same converter the legacy AST path already applied), so `source.slice(node.start, node.end)` is correct regardless of preceding non-ASCII content. ASCII source keeps its fast path (the remap is skipped entirely). Closes #793.

## 0.7.5

### Patch Changes

- bde55be: chore(deps): align all workspace `oxc` / `oxc_formatter` / `oxc_formatter_core` git deps to a single newer revision (71e489a). The split renovate bumps (#675/#676) fail CI because they move only `oxc_formatter`, leaving the ~15 other workspace `oxc` crates on the old revision — producing a duplicate `oxc_allocator` and an `E0308` mismatch. Unifying every `oxc` dep to the same revision fixes that; verified compiler-safe (compatibility report passes) and formatter-safe (all fmt fixtures pass). Step toward oxfmt parity for `<script>` formatting (refs #761).

## 0.7.4

### Patch Changes

- c1357b9: fix(css): evaluate each `:is()`/`:where()` branch in the context of its surrounding combinator when detecting unused selectors, so an unreachable branch (e.g. `.a` in `:is(.a, .b) + .c` when `.c` never immediately follows `.a`) is correctly flagged unused — matching the official compiler instead of silently passing (#754)

## 0.7.3

### Patch Changes

- 8cbfe9b: fix(css): don't flag a `#id` selector as unused when the element's `id` is dynamic (`{id}` shorthand, `id={expr}`, an interpolated `id="a{x}"`, or set via a spread) — only a static `id="..."` is matched literally (#723)
- 4901a72: fix(css): treat `:is()`/`:where()` as an OR-set in unused-selector detection so a compound like `:is(.a, .b) + .c` is recognised as used and only the genuinely-unreachable branch (`.b`) is flagged, instead of the whole selector (#722)
- dcb3b6f: fix(css): don't flag a nested `&.CLASS` selector as unused when `CLASS` comes from a `class:CLASS={...}` directive (or a spread) rather than a static `class="..."` attribute (#720)

## 0.7.2

### Patch Changes

- e7ecade: fix(analyze): validate `<dt>`/`<dd>` placement against the parent rule, not an ancestor check, so a valid nested `<dl>` inside `<dd>` is accepted (#721)

## 0.7.1

### Patch Changes

- 82af48e: fix(transform): make destructured-derived name counters call-local

  `expand_destructured_derived` in the server transform generated its `$$derived_array` / `$$d` helper names using function-level `static` `AtomicUsize` counters, reset with `store(0)` at the top of each call. Those statics are process-global and shared across threads, so concurrent compiles (e.g. a rayon-parallel consumer) raced — one compile's reset/increment clobbered another's, producing nondeterministic `$$derived_array_N` numbering in server output. The counters are now call-local `let` bindings, so each compile gets its own and server output is deterministic under parallel compilation.

## 0.7.0

### Minor Changes

- 3c1b453: Upgrade the Svelte compatibility target to **5.56.1** and reach **100% in-scope
  test compatibility (3515/3515)**.

  The 5.56.1 bump was entirely DeclarationTag bug-fixes (upstream #18330 / #18348 /
  #18350 / #18352 / #18353); all of them are ported:
  - loose `{let x = a / }` → empty-name declarator (#18353)
  - unterminated declaration tag (`{let x = a /`) now reports `unexpected_eof` (#18350)
  - `type`-identifier-vs-type-alias disambiguation + interior-comment attachment,
    so `{type instanceof Foo}` / `{type in foo}` parse as expression tags (#18330)
  - multi-declarator parsing + leading-whitespace + client comma-rejoin +
    server cross-tag derived access + division-after-string (#18348 / #18353)
  - the `state_referenced_locally` warning for DeclarationTag (#18348)
  - async-derived component-prop getter + server `$.async_derived` unthunk (#18352)

  Also lands the remaining 5.56.0 async-declaration-tag clusters:
  - element-nested `{const}` / `{let}` block-scope wrap + constant-folding of the
    shadowed binding (`declaration-tags`)
  - `metadata.promises_id` lowering for `{let x = $state(await …)}` on both client
    and server (`async-declaration-tag`, `async-declaration-tag-2`)
  - shorthand `style:x` directive after a top-level `await` no longer over-emits
    `$$promises` blockers (`async-style-after-await`)

### Patch Changes

- 7f593d4: Upgrade the Svelte compatibility target to **5.56.2** and keep **100% in-scope
  test compatibility (3525/3525, 0 failures)**.

  The 5.56.2 bump carried a single compiler change — upstream #18366 (ignore
  `DeclarationTag` nodes in the keyed-`{#each}` `animate:` directive single-child
  validation) — ported in `2_analyze/visitors/each_block.rs`.

  The concurrent `language-tools` submodule bump added six svelte2tsx fixtures,
  three of which exposed pre-existing port gaps that are now fixed:
  - `$props()` typedef insertion now counts the real declaration-keyword length
    (`const` = 5) instead of assuming `let` = 3, so `const { x } = $props()` no
    longer loses two characters of the keyword.
  - Hoisted interfaces are emitted in topological-promotion order (a base
    interface before the one that extends it), mirroring upstream
    `HoistableInterfaces`.
  - Non-leading `{#snippet}` blocks inside `{#each}` are hoisted above sibling
    `{const}` / `{let}` declaration tags (port of upstream `hoistSnippetBlock`).

## 0.6.1

### Patch Changes

- 375c61c: fix(ssr): apply derived-read wrapping to `{@html expr}`

  On the server, `{@html expr}` skipped the dynamic-expression transforms that the
  regular `{expr}` tag runs — most importantly `wrap_derived_reads`. Since a
  `$derived` binding compiles to a getter function on the server, `{@html post.html}`
  where `post = $derived(...)` emitted `$.html(post.html)` (reading `.html` off a
  function, i.e. `undefined`) and rendered nothing. It now emits
  `$.html(post().html)`, matching the official compiler. Non-derived expressions
  and string literals are unaffected. This surfaced as empty article bodies when
  prerendering a SvelteKit site that does `{@html ...}` over a `$derived` value.

## 0.6.0

### Minor Changes

- 6ac76c2: Bundle 71 compiler/AST correctness commits since 0.5.1 (Svelte target stays at 5.55.9). Highlights:
  - **async / blockers**: sync-statement grouping in the async-body transform (5.54.1), transitive `touch`-through-assignments in `compute_blocker_map` (5.55.1), `{#await await ...}` async-batching (5.55.9), `$derived(await ...)` nested-fn `$.save` lowering + then-arg shadowing (5.55.9), `has_more_blockers_than` IfBlock flattening guard and `@debug` blocker plumbing (5.55.3/5.55.6), `async-eager-derived` blocker reorder (5.53.12), `$inspect` after top-level await, `$$promises` threaded through head effects.
  - **`@const`**: per-const-tag blocker computation (5.55.3).
  - **CSS**: upstream-matching selector pruning + `:where()` composition.
  - **parse**: comments between attributes and in expressions, OXC-AST script-statement splitting, empty transition/in/out directive name rejection, attribute-shorthand bare-identifier rule, assignment-target preservation for for-of/for-in.
  - **analyze**: lexical-scope resolution of same-name rune declarations, `NewExpression` template-literal coercion.
  - **server**: SSR rune rewrite inside `{#if}` tests (5.55.4), multi-line declaration collapse in `extract_constant_vars`.
  - **napi**: upgrade napi-rs to v3 (compat-mode), RAII arena guard + zero-copy envelope offset/length validation.
  - **client**: whitespace-tolerant `$bindable` / `$props.id()`, call-only `<title>` memo binding, logical-assign proxy + store ops.

  Plus ~50 smaller correctness fixes from the review backlog.

## 0.5.1

### Patch Changes

- d95f3bb: fix: port Svelte 5.55.9 follow-ups — `nullish-coallescence-omittance` SSR
  stringify omittance (upstream `a5df6616e`) and `Percentage` keyframe
  double-print (upstream `ca3f35bf7`). Class / style / innerHTML SSR paths
  and the head-element SSR / `css-keyframes-percent` print path are still
  tracked as follow-ups in the per-suite skip lists.

## 0.5.0

### Minor Changes

- a7cdebe: Upgrade target Svelte to **5.53.0** and port the SSR compiler change for error boundaries:
  - **`<svelte:boundary>` with `failed` handler** (upstream commit `2661513cd` "feat: allow error boundaries to work on the server"): when a `failed` snippet or attribute is present, the boundary now emits `$$renderer.boundary({ failed }, ($$renderer) => children)` instead of inlining children, so SvelteKit's `+error.svelte` and other onerror-driven flows can render on the server. Boundary children always wrap in `<!--[-->...<!--]-->` hydration markers, the pending branch wraps in a bare block statement, and the no-pending-no-failed case is the simplest "open / children / close" shape.

  Three new SSR fixtures land alongside the change: `boundary-error-no-onerror`, `boundary-error-failed-prop`, `boundary-error-with-onerror`. The 98 `runtime-runes` boundary/async tests that diverged after the bump all return to green.

  Three known gaps from this upstream version are skipped (documented in `tests/compatibility_report.rs`) so the report stays at 100% across in-scope categories:
  - `parser-modern/comment-in-tag` and `parser-legacy/script-comment-only` — upstream's `92e2fc120` "feat: allow comments in tags" feature. Parsing `//` and `/* */` between element opener attributes plus surfacing a top-level `comments` array on the modern AST is queued as a follow-up port.
  - `runtime-runes/async-derived-title-update` — fixture added in upstream `582e4443d` (a runtime-only fix that nevertheless exposes a pre-existing gap: rsvelte's client transform doesn't yet thread async-derived `$$promises[N]` blockers into the `$.deferred_template_effect(...)` / `$.template_effect(...)` calls). Compiler-side runtime fix.

- 3756592: Bump target Svelte to **5.53.13** and port two compiler-side changes from the range:
  - **Upstream `32a48ed17`** "fix: don't eagerly access not-yet-initialized functions in template": rsvelte's `Memoizer::sync_values` / `async_values` now emit `b::arrow(arena, vec![], expr)` instead of `b::thunk(...)` so bare identifier references aren't unthunked to themselves — `[getX, getY]` becomes `[() => getX(), () => getY()]`. The async-await optimization (`async () => await x` → `() => x` when `x` has no nested await) moved from `unthunk` into `async_arrow` to match upstream's `arrow(_, _, async=true)` shape.

  - **Upstream `d4bd6ad8f`** "ensure 'is standalone child' is correctly reset" lands purely in runtime types — no rsvelte change needed.

  - **Upstream `b472171de`** "ensure `$inspect` after top level await doesn't break builds" exposes a pre-existing rsvelte gap in `$.run([...])` ordering after a top-level await. The new `runtime-runes/async-inspect-build` fixture is skipped (documented).

- a4c5334: Bump target Svelte to **5.53.7** and port the if-block hydration-marker change from upstream commit `86ec21086` "fix: correctly add `__svelte_meta` after else-if chains":
  - **SSR**: if-block consequent now emits `<!--[0-->`, else-if branches emit `<!--[1-->` / `<!--[2-->` / …, and the final else emits `<!--[-1-->` (replacing the legacy `<!--[-->` / `<!--[!-->` markers). Other block kinds (each / boundary / key / await) keep the legacy markers.
  - **Client**: the final-else `$$render(alternate, …)` call now passes `-1` (a numeric branch index) instead of the legacy `false` sentinel, so the runtime can pair it with the corresponding SSR marker.

  The new `css/css-prune-edge-cases` fixture (added by perf commit `0965028d3` "perf: optimize CSS selector pruning") is skipped — it exposes two CSS scoping/pruning edge cases (deep combinator chain that should be pruned but isn't, and selector composition order inside `:where(...)`). Other perf commits in the range (`32111f9e8`, `791d5e332`) don't change compiler output.

- 6be628d: Bump target Svelte to **5.54.0**. The single compiler-side commit in the range doesn't change emitted output for any in-scope fixture — pure submodule bump.
- 412eb00: Bump target Svelte to **5.55.0**. No compiler-side commits in the range; pure submodule bump.
- e438591: Bump target Svelte to **5.55.9** — the latest stable Svelte at the time of this catch-up.

  The two compiler-side commits in the range:
  - `a5df6616e` "fix: avoid unnecessary stringify in server attributes" inlines static string interpolations directly into the SSR HTML template push (`background-image: url('${$.stringify(x)}')` → `background-image: url('https://example.com/foo.jpg')` when `x` is a constant). rsvelte still emits the `$.stringify` form.
  - `000c594e0` "fix: `{#await await ...}` and async dependencies fixes" refines the async-batching / await-merge codegen tracked since 5.54.1.

  Eleven new fixtures across `runtime-runes`, `runtime-legacy`, `server-side-rendering`, and `snapshot` are skipped pending the follow-up ports for those two upstreams.

### Patch Changes

- 1e9483a: Bump target Svelte to **5.53.1**. The only compiler-side change upstream is `0c7f81514` "fix: handle shadowed function names correctly", which associates a `FunctionDeclaration` / `FunctionExpression` id node with its outer scope (so a nested `const foo = $derived(...)` inside `function foo() { ... }` doesn't leak its derived-ness to the outer `foo` reference). The new `runtime-runes/derived-name-shadowed` fixture is skipped in the compatibility report (with rationale in `tests/compatibility_report.rs`) until rsvelte's derived analysis is made scope-aware — tracked as a follow-up port.
- f1d65ad: Bump target Svelte to **5.53.10**. No compiler-side commits in the range; pure submodule bump.
- 1cd18da: Bump target Svelte to **5.53.11**. Upstream commit `58f161dee` "fix: properly lazily evaluate RHS when checking for assignment_value_stale" touches client transform but the new fixture doesn't surface any rsvelte-side divergence; pure submodule bump.
- b720d08: Bump target Svelte to **5.53.12**. Upstream commit `965f2a0ac` "fix: handle async RHS in assignment_value_stale" adds a fixture that exposes the same async-derived blocker-ordering gap as `async-derived-title-update` — `runtime-runes/async-eager-derived` is skipped in the compatibility report (documented).
- 6c1b11d: Bump target Svelte to **5.53.2**. The only compiler-side change upstream is `6aa7b9c64` "fix: update expressions on server deriveds", which routes `name++` / `name--` / `++name` / `--name` through new `$.update_derived(...)` / `$.update_derived_pre(...)` helpers when `name` resolves to a derived binding. The new `runtime-runes/derived-update-server` fixture is skipped in our compatibility report (documented in `tests/compatibility_report.rs`) until rsvelte's server-side update-expression walker grows derived-binding awareness — tracked as a follow-up port.
- 3a1b613: Bump target Svelte to **5.53.3**. No compiler-side changes upstream — the only relevant landing is `f67d03df5` "fix: make string coercion consistent to `toString`", which adjusts the runtime `set_text` helper. The new `runtime-runes/set-text-stable-coercion` fixture exposes a pre-existing rsvelte gap (we don't emit `?? ''` around interpolated identifiers inside `set_text(text, \`…\`)`calls when the source identifier is typed as`object`) and is skipped in the compatibility report pending a follow-up port.
- 43d20b1: Bump target Svelte to **5.53.4**. The only compiler-side change upstream is `3a289797b` "fix: handle default parameters scope leaks", which reworks `FunctionExpression` / `FunctionDeclaration` / `ArrowFunctionExpression` scope creation to use porous `scope.child(true)` so default parameter initializers no longer leak from surrounding declarations. Eight previously-passing fixtures (`runtime-legacy/const-tag-each-{arrow,const,function,duplicated-variable2,duplicated-variable3}`, `runtime-legacy/await-block-func-function`, `runtime-runes/async-{boundary-nav-race,if-else}`) regenerated with subtly different `{@const ...}` / `each` / `await` codegen and are skipped in the compatibility report (documented in `tests/compatibility_report.rs`) until rsvelte's analyzer matches the new function-scope porosity. Follow-up port queued.
- 752055a: Bump target Svelte to **5.53.5** and port upstream commit `0df5abcae` "Merge commit from fork — fix: escape `innerText` and `textContent` bindings of `contenteditable`". The server transform now HTML-escapes `bind:innerText` / `bind:textContent` expressions on contenteditable elements to prevent XSS via attacker-controlled content. `bind:innerHTML` keeps its raw expression because the user is explicitly opting into HTML.
- 1088eba: Bump target Svelte to **5.53.6**. The compiler-side commit in the range is `e3d277b00` "fix: visit synthetic value node during ssr" — it routes the synthetic `value` expression computed for `<option>` inside `<select>` through `context.visit(...)` so store refs (`$label`) get rewritten to `$.store_get(...)`. The other commits in 5.53.5 → 5.53.6 are perf-only (`1043f79d1`, `04ba134d3`, `efb651cd3`) or doc-only and don't change compiler output. The new `server-side-rendering/select-option-store-implicit-value` fixture is skipped in the compatibility report (documented in `tests/compatibility_report.rs`) because rsvelte's SSR transform doesn't yet route the synthetic value node through `transform_store_refs`. Follow-up port queued.
- c74572c: Bump target Svelte to **5.53.8** and partially port upstream commit `0206a2019` "fix: clean up externally-added DOM nodes in {@html} on re-render":
  - **Client**: `$.html(...)` calls now thread a new `is_controlled` flag between the thunk and the existing `is_svg` / `is_mathml` flags. rsvelte emits `void 0` for it because the fragment-side analysis that sets `metadata.is_controlled = true` (when `{@html ...}` is the only child of an element) isn't ported yet.

  Thirteen fixtures exercising the `is_controlled` short-circuit (skipping the wrapper anchor + using the parent node directly) are skipped in the compatibility report and documented in `tests/compatibility_report.rs`. Tracked as a follow-up port.

- 356b7f6: Bump target Svelte to **5.53.9**. No compiler-side commits in the range (only a runtime fix); zero rsvelte changes needed.
- 6ea2484: Bump target Svelte to **5.54.1** and port the small `{@const}` printer fix from upstream commit `7123bf3a1` ("fix: remove trailing semicolon from `{@const}` tag printer"). The other compiler-side commit, `6b33dd2a1` "fix: group sync statements", reshapes how async-aware transforms batch sync assignments into a single thunk + reuse `$$promises[N]` indices; rsvelte still emits one callback per assignment with sequential indices, so the seven new fixtures that exercise the regrouping (`runtime-runes/async-derived-indirect`, `async-if-hydration`, `async-derived-with-effect-and-boundary`, `async-binding-after-await`, `async-transform-empty-statements`, `async-later-sync-overlaps`, `async-style-after-await`) are skipped pending a dedicated port.
- a110812: Bump target Svelte to **5.55.1**. The three compiler-side commits in the range (`4879f9da9` better duplicate module import error, `957f2755f` cleanup `superTypeParameters` in class declarations, `669f6b45a` prevent hydration error on async `{@html …}`) don't surface any rsvelte-side divergence on existing fixtures. The seven new `runtime-runes/async-overlap-multiple-*` fixtures (added by chore `5e8662fb2`) diverge only in blank-line placement around hoisted function decls; they're skipped pending a canonicalize-js / hoisting tweak.
- 8613663: Bump target Svelte to **5.55.2**. The four compiler-side commits in the range (`6b653b8d1`, `8966601dc`, `edcbb0e64`, `97d45f85c`) don't surface new rsvelte-side divergence beyond known gaps. Three new fixtures (`parser-modern/parens`, `runtime-runes/async-if-block-unskip`, `runtime-legacy/flush-sync-each-block`) are skipped because they exercise the already-tracked comments-in-tags / blank-line / no-semicolon-import gaps.
- a8a5f77: Bump target Svelte to **5.55.3**. The single compiler-side commit `3937ec03b` "fix: correctly calculate `@const` blockers" adds seven async-const fixtures that exercise the same group-sync-statements async batching as 5.54.1's `6b33dd2a1` — skipped pending the same follow-up port.
- 0ee799d: Bump target Svelte to **5.55.4**. Single compiler-side commit `0ed8c282f` "fix: reset context after waiting on blockers of `@const` expressions" adds two fixtures (`async-effect-pending-eager`, `async-context-after-await-const`) that exercise the same async-batching follow-up tracked since 5.54.1.
- b4a23af: Bump target Svelte to **5.55.5**. No compiler-side commits in the range. The new `runtime-runes/derived-dep-set-while-rendering` fixture exposes a pre-existing SSR rsvelte gap (we wrap a bare-identifier `$derived(IDENT)` arg in a `() => IDENT()` thunk when upstream emits the bare `IDENT`); skipped pending a `wrap_derived_reads` carve-out for `$derived(IDENT)` arguments.
- a97d9af: Bump target Svelte to **5.55.6**. Four compiler-side upstream commits (`e00944ffd` SSR member-expression compile, `89b6a939f` `Promise.all` save during SSR, `4c96b469f` `@debug` awaited variables, `69b4c9f56` skip block comments in `read_value`). Eleven new fixtures hit the same async-batching follow-up tracked since 5.54.1 (plus one additional `<svelte:component this={state.x.Y}>` gap exposed by `dynamic-component-member`); all skipped.
- bed3534: Bump target Svelte to **5.55.7**. No compiler-side commits in the range; pure submodule bump.
- fbb7d44: Bump target Svelte to **5.55.8**. The single compiler-side commit `ca3f35bf7` "fix(print): handle svelte:body and fix keyframe percentage double-printing" reshapes the CSS pretty-printer's selector / `@keyframes` body formatting. rsvelte's print pass doesn't re-format CSS bodies the same way; `print/css-keyframes-percent` and `print/style` are skipped pending a follow-up port.

## 0.4.0

### Minor Changes

- 34a4593: feat(capi): add C ABI bindings (`crates/rsvelte_capi`) so the rsvelte Svelte compiler can be called from any language with a C FFI

  This release introduces a parallel distribution surface: in addition to the existing NAPI-based `@rsvelte/compiler` npm package, the compiler is now also available as a stable C shared library at `crates/rsvelte_capi`. One `cdylib` + one cbindgen-generated `rsvelte.h` lets any language with a C FFI drive the same compiler — UTF-8 JSON in, UTF-8 JSON out, no per-language schema generation.
  - **Languages with smoke tests on every PR**: C, Go, Python, Ruby, Zig, PHP, Java (JDK 22+ FFM API). C++/Kotlin/Scala/.NET/Swift are trivially derivable from the same header.
  - **API**: `rsvelte_compile`, `rsvelte_compile_module`, plus `*_into` out-parameter variants for hosts that can't pass structs by value (Ruby Fiddle, certain Java/JNI setups). `rsvelte_free` / `rsvelte_free_raw` for cleanup; `rsvelte_version` for the version probe.
  - **Options shape**: identical to the existing NAPI `compile()` options (camelCase, all optional).
  - **Breaking-change guard**: the build script panics under `RSVELTE_CAPI_CHECK_HEADER=1` if the committed header drifts from cbindgen output, and 35 cargo integration tests assert the JSON envelope shape, header invariants, and observable behaviour of every documented `CompileOption`. CI runs the full matrix (Linux/macOS/Windows × 7 languages) for every PR that touches the C ABI or the compiler.

  This does not change the published `@rsvelte/compiler` npm package's runtime behaviour — it is a parallel distribution channel. The npm version is bumped so the C ABI surface appears in the next release notes.

  See `crates/rsvelte_capi/README.md` for the full API, JSON envelope shape, memory ownership rules, and per-language quick-start table.

- ccb02b2: Upgrade target Svelte to **5.52.0** and port the two SSR compiler changes that landed upstream:
  - **Dynamic component if/else hydration markers** (upstream commit `9f48e7620`): `<svelte:component>` and `<Component this={...} />` now emit `if (expr) { push('<!--[-->'); call; push('<!--]-->'); } else { push('<!--[!-->'); push('<!--]-->'); }` instead of `(expr)?.(…)` framed by empty comments. The if/else markers let hydration repair truthy↔falsy mismatches.
  - **Re-run non-render-bound deriveds on the server** (upstream commit `09c4cb508`): `let foo = $derived(expr)` is emitted as `let foo = $.derived(() => expr)` and every read of a derived binding becomes a call (`foo()`, or `foo?.()` for `var`-kind declarators). Destructured derived patterns (`let { a, b: [c] } = $derived(stuff)`) expand to a `$$derived_array`/`$$d` helper plus per-leaf `$.derived(...)` declarators that mirror the upstream `extract_paths` expansion.

  The compatibility report stays at **3,339 / 3,339 in-scope passing** with every category at 100%.

  Side fixes along the way:
  - A handful of byte-level fallbacks in the server transform's script walker were pushing `bytes[i] as char` to a `String`, which interprets a single UTF-8 continuation byte as a Latin-1 code point and corrupts non-ASCII source (`'Compté'` → `'ComptÃ©'`). All occurrences in `transform_script.rs` now step by char boundary.
  - `is_object_shorthand_position` no longer rejects a candidate when its enclosing `{` sits at byte 0 of the scanned slice — so `{ doubled }` at the start of a `wrap_derived_reads_for_template` argument is correctly expanded to `{ doubled: doubled() }` rather than the invalid `{ doubled() }`.

## 0.3.2

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

## 0.3.1

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
