# @rsvelte/compiler

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
