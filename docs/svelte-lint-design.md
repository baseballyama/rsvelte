# rsvelte-lint: Architecture & Decision Record

## Executive summary

**Build `rsvelte_lint` as a native Rust Svelte linter on top of rsvelte's existing parser, scope tree, validator/a11y, and svelte2tsx assets — but ship it as a *complement* to ESLint first, not a drop-in replacement, and treat the entire typed-rule path as a gated research track rather than a committed feature.** The non-typed engine (Decisions A, C, D, parts of E/F/G Waves 1–2) is well-grounded: the scope tree (`2_analyze/scope.rs`) genuinely exposes `ScopeRoot`/`Binding`/`Reference`/`Mutation`/`get_binding`, the template + typed-expr ASTs exist, and wrapping the compiler's ~70 warnings + ~145 errors + 42 a11y rules yields real value on day one with near-zero rule code. That path credibly delivers the ~100x headline for syntactic/scope linting in the dev loop. The typed path (Decision B/H) does **not** survive contact with its own cited reference: the batched `get_types_at_positions` coalescing primitive does not exist in the interactive corsa path (the proven `vize_patina` driver issues N serial blocking probes), forward span→TSX mapping is net-new work (not a "reverse direction of `mapper.rs`"), the single corsa worker is a hard throughput ceiling (vize rejects `servers>1`), and the block-hash cache is unsound across files for type-aware diagnostics. We therefore **re-scope the 100x claim to non-typed + warm-incremental paths**, reframe Wave 3 as a measured spike behind explicit go/no-go gates, and make ESLint coexistence (config import, suppression compat, editor LSP, custom-rule story) a first-class concern instead of a deferred Wave 5 afterthought.

Status: design / decision record. Internal. Audience: rsvelte core.
Scope: a native Rust Svelte linter (`crates/rsvelte_lint`) reusing rsvelte's parser, scope tree, validator, svelte2tsx, and the tsgo bridge shipped in svelte-check Wave 2, with patterns lifted from `vize_patina` and `corsa-bind`. `submodules/svelte-eslint-parser` and `submodules/eslint-plugin-svelte` are reference-only.

---

## 0. TL;DR decisions

| # | Question | Decision (revised) |
|---|----------|--------|
| A | Parser | **Reuse rsvelte's parser + `2_analyze` scope tree as the native substrate. No second ESTree parser in the hot path.** Synthesize svelte-eslint-parser-shaped ESTree only at the compat boundary (Wave 5), lazily, via `legacy.rs`/`estree_compat`. **Unchanged — strongest part of the doc.** |
| B | Type engine | **Extend the svelte2tsx→checker bridge; adopt `corsa::api::ProjectSession` as the interactive backend — but only after a gating spike proves (1) emit-time forward anchors for type-at-position and (2) the real serial-probe cost.** Batched `get_types_at_positions` is **removed as a settled primitive** (it is not in the interactive path); modeled as N serial probes until proven otherwise. |
| C | Rule engine | **Port `vize_patina`'s model**: `trait Rule: Send + Sync` + `&'static RuleMeta`, single shared DFS visitor, centralized `report()` with suppression, rayon per-file. Hook set redesigned around Svelte's node taxonomy. **Add per-rule options to the config/meta model from Wave 1.** |
| D | ESLint compat | **Hybrid, native-first, complement-before-replacement.** Native engine owns recommended + a11y + scope rules. **"Drop-in replacement" is an explicit non-goal until config import + custom-rule API + LSP land.** Ship a generated "disable these in ESLint" config so each rule fires once. |
| E | Reuse/build | See §E. Reuse scope tree, validator codes, a11y, svelte2tsx, mapper (reverse only), runner skeleton. Build: rule trait, visitor, config (+ options + `extends` + eslint import), fix engine, **emit-time TSX anchors**, corsa session, LSP daemon. |
| F | Submodules | Keep `svelte-eslint-parser` + `eslint-plugin-svelte` as reference submodules (compat oracle, porting source, fixture corpus). Not runtime deps. **Compat oracle validates plugin-ported rules only — not wrapped compiler codes.** |
| G | Phases | Wave 1 syntactic+a11y + config/options + CI formats + minimal LSP → Wave 2 scope rules + autofix + eslint-config import + suppression compat → **Wave 3 typed-rule spike (gated)** → Wave 4 daemon/incremental → Wave 5 ESLint compat shim. |
| H | Perf | ~100x for **non-typed + warm-incremental syntactic/scope** paths. Typed path: **constant-factor win, single-worker checker-bound** — not 100x, stated up front. |

---

## A. Parser

### Decision (unchanged): reuse rsvelte's parser + scope tree natively; no second ESTree parser in the hot path.

`svelte-eslint-parser`'s `parseForESLint` pipeline exists only to bridge into the JS ESLint runtime. Its cost centers: (1) JS `svelte/compiler` `parse()` per file, (2) assemble a virtual TS string + **re-parse with `@typescript-eslint/parser`**, (3) range-restore traversal, (4) `eslint-scope` over the larger-than-source virtual script, (5) string blanking/splicing. Items 1, 3, 4, 5 are pure bridging overhead.

rsvelte already produces those outputs:

- **AST**: `ast/template.rs` (`Root`/`Fragment`/`TemplateNode`) + `ast/typed_expr.rs` (`JsNode`, ~75 ESTree-named variants) + `ast/js.rs` (`Expression::{Typed,Value,Lazy}`). This *is* the node universe a rule visits.
- **Scope/binding tree**: `phases/2_analyze/scope.rs` — a full eslint-scope analog (`ScopeRoot`/`Scope`/`Binding`/`BindingKind`/`Reference`/`Mutation`) with `get_binding(name, scope_idx)` chain walk, per-binding `references`+`mutations`, and rune/store/prop/reactive classification. This answers `getScope()`, resolve-reference, is-reactive/prop/store, and where-are-refs — **without re-deriving from a virtual script.**

A native rule reads `&Root` + `&ScopeRoot` directly. We pay **one** parse and **one** scope analysis (both already required to compile the file) vs svelte-eslint-parser's three independent re-parses.

**Course correction (low-severity concern, accepted):** We **drop `Expression::Lazy` from the perf narrative.** Because the linter reuses `analyze_component`, which forces `resolve_lazy_expressions()` before analysis, no per-rule laziness survives — every template expression is already parsed by the time rules run. The honest framing is: **one full expression resolution total, vs svelte-eslint-parser's three re-parses.** `Lazy` is an internal pipeline detail, not a rule-time saving.

### ESTree representation lives only at the compat boundary

Hosting **unported third-party `eslint-plugin-svelte` rules** requires the exact svelte-eslint-parser AST shape + `VisitorKeys` + a live JS `ScopeManager` + `parserServices` — a large, version-sensitive adapter (400+ `SourceCode` token-API call sites; in-place AST/scope mutation in restore). We do **not** build it for the native engine. We synthesize it once, lazily, in Wave 5 from `compiler/legacy.rs::convert_to_legacy` + `phases/1_parse/estree_compat/` (already byte-verified against the official compiler) plus the svelte2tsx map for `parserServices`.

### Native rule context

```
RuleContext<'a> {
    root:    &'a Root,                  // template.rs
    scope:   &'a ScopeRoot,             // scope.rs
    source:  &'a str,
    file:    &'a Path,
    svelte:  SvelteContext,             // version, file_type, runes, kit
    line_index: &'a LineIndex,          // byte<->(line,col) + UTF-16, precomputed
    types:   Option<&'a TypeFacts<'a>>, // present only when a typed rule is active
}
```

`SvelteContext` ports svelte-eslint-parser's `src/utils/svelte-context.ts` gate and drives per-rule `conditions` short-circuit.

---

## B. Type engine

### Both tsgo and corsa drive the same native checker (`microsoft/typescript-go`). The question is the binding shape — and whether the interactive path is feasible at all.

**This section is materially revised.** Three reviewers independently verified that the typed-path claims do not match the cited reference. We keep the *intent* (in-process, position-level, warm queries) but downgrade every unproven primitive to a spike, and we make the feasibility blockers explicit.

What ships today (svelte-check Wave 2): `svelte2tsx.rs` → `svelte_check/overlay.rs` materializes `.svelte.tsx` shadows + tsconfig → `tsgo.rs::run_tsgo()` spawns `tsgo -p --pretty false` and regex-parses diagnostics → `mapper.rs` reverse-maps via the svelte2tsx sourcemap. Batch, whole-project, textual. Correct and shipping, but it offers no position-level type query, pays cold program cost per invocation, and parses TS-version-sensitive text.

### Decision: extend the bridge — keep svelte2tsx + the (reverse) mapper, gate the interactive driver.

We keep `svelte2tsx.rs` + `magic_string.rs` (hires sourcemap, column-accurate), `svelte_check/mapper.rs` (reverse mapping for *diagnostics*), and `overlay.rs` shim/d.ts/tsconfig synthesis. `svelte-check`'s batch CLI path stays as-is. The linter *aims* to use a `corsa::api::ProjectSession` driver (`rsvelte_lint::type_backend`), mirroring how `vize` keeps a batch `CorsaExecutor` and a per-file `CorsaTypeAwareSession`.

### Course corrections (the four high/medium typed-path concerns)

**1. Forward span→TSX mapping is NET-NEW work, not "the forward direction of `mapper.rs`" (high).**
`mapper.rs` is strictly generated→original and explicitly snaps edited chunks to the chunk-start anchor — fine for drawing a squiggle, fatal for a type query, which must land byte-exactly on the target identifier or it probes a wrapper/`$$`-helper and returns a wrong type. Inversion is many-to-one (svelte2tsx can emit the same expression in render fn, reactive shadow, and props-type position), so there is no unique generated offset. The proven `vize_patina` driver does **not** invert the map generically — it computes generated offsets per query kind from the emitter's known insertion points.

→ **New svelte2tsx work:** the emitter records, per template-expression query kind (member access, call, await, optional-chain, each-context binding), the exact generated byte offset of a single canonical emitted copy — a direct emit-time index, not a sourcemap inversion. We probe those anchors. **This is a Wave-3 gating spike** (see Risks R1): emit-index → UTF-16 offset → `get_type_at_position` → assert correct type on ~20 hand-picked expressions including astral chars, members, calls, optional chains, casts, awaits, and each-context bindings, *before* any typed-rule scope or dates are committed.

**2. Batched `get_types_at_positions` is removed as a settled primitive (high).**
The interactive `ProjectSession` in the proven path does **not** expose an order-aligned batch position API; `vize_patina`'s `driver.rs` loops over query kinds and calls `probe_type_at_offset(...)` once per site, each a synchronous `block_on` round-trip. `get_types_at_positions` exists only in the `vize_canon` **batch CLI** type-checker, not the interactive session.

→ **We model the per-file typed cost as O(probe_sites) serial blocking round-trips, not O(1).** The perf budget in §H is re-derived on that basis. We will *prototype* whether the interactive session can be extended with a real order-aligned batch endpoint that beats the serial loop; until a measured prototype shows it exists and wins, batching is **not** part of the design. Request coalescing survives only as "collect all sites statically first, then drain a serial queue" — which reduces session churn, not round-trip count.

**3. The single corsa worker is a first-class throughput ceiling, not a footnote (high).**
Type resolution (binder+checker per probe) is exactly the part that cannot be parallelized. rayon fans out parse/scope/virtual-TS-gen, but every type query funnels through one strictly-ordered worker. The "Mitigation 4 — process pool / `servers>1`" idea is **deleted**: the reference explicitly rejects it (`vize` `runner.rs:1150`: "`typeChecker.servers>1` is not supported by the direct Corsa project-session runner"). The real ceiling is `probes/sec = 1 / (round-trip + resolution latency)` from one worker. We state this in §H as an architectural constraint and decide per-feature whether typed lint is a CI-batch capability (where one cold `tsc`-style pass may beat N interactive probes) or a dev-loop capability.

**4. `get_types_at_positions` return shape: `Vec<Option<TypeResponse>>`, per-site `None` is the common case (medium).**
The verified signature is `Result<Vec<Option<TypeResponse>>>`. Per-site `None` is normal — especially because of (1): a position landing on a non-expression/wrapper node yields `None`. We model `ctx.type_at(span) -> Option<TypeFacts>`; every typed rule treats `None` as skip/degrade. **`None`-rate is the health signal for forward-anchor quality** and is surfaced in machine output. We do **not** conflate per-site `None` with "corsa absent."

### UTF-16 conversion, overlay, and type-text — corrected claims

- **UTF-16 offsets (medium):** The reference does `source[..clamped].encode_utf16().count()` per probe — linear re-scan, O(file_len × sites), a quadratic cliff. → We **actually build an astral-aware UTF-16 `LineIndex` once per file** and convert all probe offsets via lookup. Microbenchmark on a large component with many mustache tags gates this off the hot path.
- **No-disk overlay (medium):** "warm `update_snapshot` ~0.05 ms, no disk" is **capability-gated.** The reference (`vize_patina` `corsa_session/session.rs`) checks `describe_capabilities().overlay.update_snapshot_overlay_changes`; when absent it falls back to `std::fs::write` of the virtual file. → The disk fallback is **load-bearing and in scope.** And 0.05 ms is *snapshot-update* latency, which says nothing about probe *resolution* time for complex/generic types. We replace the headline with a measured end-to-end "edit → re-probe → diagnostic" latency on a realistic component (deep generics, imported types), separating snapshot from resolution.
- **Type-text inline (medium):** `TypeResponse.texts` is **not** unconditionally cheap — TS type strings are unbounded (deep generics, mapped/conditional types, huge unions). String-predicate rules (`is_promise_like`, `is_any`) inspecting `.texts` are O(text length) on pathological types. → Prefer **structured flags** (`is_promise`, `is_any`) where corsa exposes them; cap/truncate type-text rendering for predicate rules.

### Dual TS engines and degradation — correctness hazards (high/medium)

- **Divergence (high):** Keeping `tsgo.rs` (vendored `submodules/typescript-go`) as the batch path *and* a corsa fallback means **two independently-pinned TS checkers.** Drift → the same file yields different diagnostics depending on which backend ran — nondeterministic lint output, the worst property for a linter. → **CI guard:** corsa's pinned `typescript-go` rev must equal the vendored submodule rev; CI fails on divergence. The corsa→tsgo fallback is a **clearly-labeled degraded mode**, not a silent alternate result source. A parity test asserts identical typed-rule diagnostics from both backends on a fixture corpus before fallback is allowed in production.
- **Fail-open in CI (medium):** Degrading on corsa panic ("skip the rule") is a **fail-open** correctness hazard — CI goes green because the checker crashed, not because the code is clean. → Typed-rule degradation policy is explicit and configurable: **fail-closed default in CI** (exit non-zero when a type-aware rule could not run), fail-open only in editor/watch. Machine output reports "N typed rules skipped" so CI can detect it.

### Honest position

The typed path is a **constant-factor win bounded by the native TS checker, single-worker-serialized**, with a forward-mapping prerequisite that does not exist today. It is sold as such. The compat shim still delegates the 3 genuinely type-aware *plugin* rules (`no-unused-props`, `require-event-prefix`, `no-navigation-without-resolve`) to `@typescript-eslint/parser` in Node (§D) — corsa's position API does not reconstruct a JS `TypeChecker` object graph.

---

## C. Rule engine

### Port `vize_patina`'s structure — the proven design for SFC + typed rules + tsgo bridge.

New crate `crates/rsvelte_lint`. Trait + meta port of `vize_patina/src/rule.rs`:

```rust
pub trait Rule: Send + Sync {
    fn meta(&self) -> &'static RuleMeta;
    fn run_on_component(&self, _ctx: &mut LintContext, _root: &Root) {}
    fn enter_element(&self, _ctx: &mut LintContext, _el: &RegularElement) {}
    fn exit_element(&self,  _ctx: &mut LintContext, _el: &RegularElement) {}
    fn check_mustache(&self, _ctx: &mut LintContext, _tag: &ExpressionTag) {}
    fn check_each(&self,    _ctx: &mut LintContext, _b: &EachBlock) {}
    fn check_if(&self,      _ctx: &mut LintContext, _b: &IfBlock) {}
    fn check_await(&self,   _ctx: &mut LintContext, _b: &AwaitBlock) {}
    fn check_snippet(&self, _ctx: &mut LintContext, _b: &SnippetBlock) {}
    fn check_directive(&self,_ctx: &mut LintContext, _d: &Directive) {}
    fn check_attribute(&self,_ctx: &mut LintContext, _a: &Attribute) {}
    fn check_script(&self,  _ctx: &mut LintContext, _s: &Script) {}
    fn check_style(&self,   _ctx: &mut LintContext, _s: &StyleSheet) {}
}

pub struct RuleMeta {
    pub name: &'static str,            // "svelte/no-at-html-tags"
    pub category: RuleCategory,
    pub fixable: Fixable,              // No | Code | Suggestion
    pub default_severity: Severity,
    pub conditions: RuleConditions,    // runes-only / kit-only / version gate
    pub type_aware: bool,
    pub options_schema: Option<&'static OptionsSchema>, // NEW — see §D config concern
}
```

**Course correction (config concern, high):** `RuleMeta` carries a typed **per-rule options schema** from Wave 1. Many target rules are option-driven (`no-restricted-html-elements`, `html-self-closing`, `no-restricted-imports`); 1:1 parity is impossible without options. `LintContext` exposes the parsed, validated options for the current rule.

The hook set is **redesigned around Svelte's node taxonomy** (the Vue `ForNode`/`IfNode`/`PropNode` hooks were illustrative, not copy-paste). One unit struct per rule, file-local `static META`, `#[derive(Default)]`.

### Registry + single shared visitor (port of `visitor.rs`)

`RuleRegistry { rules: Vec<Box<dyn Rule>>, names: Vec<&'static str> }`. The `LintVisitor` walks `&Root` **once**; per node it loops `rules.zip(names)`, sets `ctx.current_rule`, calls the hook. No per-node-type listener registry. A `has_exit_element_rules` flag skips the unused exit pass. Verbatim `vize_patina` structure.

### Centralized report + suppression (port of `context.rs`)

`LintContext::report`: enabled/disabled filter → disable-range check → severity override → push. Line/col via precomputed `LineIndex`.

**Course correction (suppression concern, high):** We **do not** rely on the compiler's `<!-- svelte-ignore code -->` alone. Reusing it internally is convenient but breaks ESLint muscle memory: migrating projects have `// eslint-disable-next-line svelte/rule` and `/* eslint-disable */` everywhere, and the compiler's `a11y_*` codes don't match plugin rule IDs. We support **`eslint-disable*`-style directives keyed on rule IDs** in addition to `svelte-ignore`, so existing suppressions keep working zero-touch. Both vocabularies are documented, including dual-linter behavior (see §D coexistence). `Binding.ignore_codes` remains the engine for the compiler-code path.

```rust
impl LintContext<'_> {
    pub fn error(&mut self, span: Span, msg: impl Into<CompactString>);
    pub fn warn(&mut self, span: Span, msg: impl Into<CompactString>);
    pub fn error_with_help(&mut self, span: Span, msg: ..., help: ...);
    pub fn report_with_fix(&mut self, span: Span, msg: ..., fix: Fix);
}
```

### Diagnostic + Fix model (port of `diagnostic/types.rs`)

`LintDiagnostic { rule_name, severity, message, start, end, help, labels, fix: Option<Fix> }`. `Fix { message, edits: Vec<TextEdit> }`, `apply()` sorts edits reverse-by-offset. **`--fix` wired from day one** (Wave 2) with overlapping-edit arbitration — closes vize's documented gap. Output reuses `svelte_check/diagnostic.rs` + `writers.rs`.

### Type-aware rule sketch (static-first; per-site `None` handled)

```rust
impl Rule for NoFloatingPromises {
    fn meta(&self) -> &'static RuleMeta { &META } // type_aware: true
    fn check_mustache(&self, ctx: &mut LintContext, tag: &ExpressionTag) {
        if !expr_is_call(&tag.expression) { return; }       // STATIC short-circuit
        let Some(t) = ctx.type_at(tag.expression.span()) else { return }; // None = skip/degrade
        if t.is_promise() && !t.is_awaited_or_voided() {     // structured flag, not text scan
            ctx.warn(tag.span(), "Promise is not handled in template expression");
        }
    }
}
```

`ctx.type_at(span)` reads from a `TypeFacts` map the driver populated by **serial probes** (one round-trip per planned site) before the visitor ran. `None` is the common outcome and every typed rule must handle it as skip/degrade. The single most important typed-path decision is therefore **plan all probe sites statically, keep most files off the checker entirely**, not "fire one batch."

### Parallelism: rayon per file (port of `vize/commands/lint.rs`)

`files.par_iter().map(lint_file)` — each file an independent parse+scope+visit with its own arena. The **one** unsharable resource is the corsa session (one warm process, one ordered worker). See §H for the concurrency bridge.

---

## D. ESLint compatibility & coexistence strategy

### Decision: Hybrid, native-first — and **complement before replacement.** "Drop-in replacement" is an explicit non-goal until config import + custom-rule API + LSP land.

Of `eslint-plugin-svelte`'s 82 rules:

| Bucket | Count | rsvelte asset |
|--------|-------|---------------|
| Pure-syntactic (AST + tokens) | ~55–60 | `template.rs` AST + token API over spans |
| Scope-based (`scopeManager`/`findVariable`) | ~19 | `scope.rs` `ScopeRoot`/`Binding`/`references` |
| Compiler-backed (`valid-compile`, all a11y) | 4 | `warnings.rs` + `errors.rs` + `a11y/` |
| CSS/selector | ~10 | rsvelte CSS phase + selector AST |
| Genuinely type-aware | 3 | corsa + `@typescript-eslint` bridge |

**a11y is delegated to the compiler via `valid-compile`** — there are zero standalone a11y rules in the plugin. rsvelte already has **42 `a11y_*` rules + ~70 warning codes + 145 error codes** in `2_analyze`. Wrapping those (Wave 1) ships compiler-parity a11y + best-practices coverage with near-zero rule code. This is the single biggest lever and it is pure reuse.

### Course correction 1 — two distinct parity targets, never conflated (high)

The doc previously implied wrapping the validator yields *plugin-fixture* parity. It does not: **Svelte compiler warning codes/messages are a different namespace and text from eslint-plugin-svelte `messageId`s.** We split explicitly:

- **Svelte-compiler parity** (wrapped `warnings.rs`/`errors.rs`/a11y codes) — validated against **rsvelte's own fixtures**, cheap, day one. Valuable, but it is *not* what an ESLint-migrating user's config/messageIds expect.
- **eslint-plugin-svelte parity** (hand-ported rules) — validated against **plugin fixtures by `messageId`/range** (the §F oracle).

The compat oracle runs **only** against plugin-ported rules. Wrapped compiler codes never go through the plugin-fixture oracle.

### Course correction 2 — coexistence is the real adoption model (high)

No real project runs eslint-plugin-svelte alone; it runs in one ESLint pass alongside typescript-eslint, import, unicorn, prettier-config, and internal rules. rsvelte-lint replaces only the Svelte subset, so for the foreseeable future adopters run **both** linters. We make this first-class, like Oxlint's "run us first, ESLint for the long tail":

1. **Generated "disable these in ESLint" config** — for every native-owned rule ID, emit an eslint flat-config snippet turning the corresponding `svelte/*` rule off, so **exactly one engine owns each ID** and no finding fires twice.
2. **Rule-ID ownership (namespace concern, medium):** we keep the `svelte/*` IDs (for config/disable-comment familiarity) **only because** we also ship (1). The generated config is a hard dependency of keeping the namespace; without it we would namespace native rules `rsvelte/*` with an alias map. Ownership is never left ambiguous.
3. **Editor/CLI dedupe + fix-on-save ownership** (see §D autofix below and Risks R8).
4. **`replaces ESLint entirely` is an explicit non-goal** until the config importer, custom-rule API, and LSP land.

### Course correction 3 — config: import, options, extends, globs (high)

Wave 1's serde `{enabled, preset, rules}` is insufficient. We add, **in Wave 1–2 not later**:

- **Per-rule options** (typed schema, §C) — load-bearing for parity.
- **`files`/`ignores` glob overrides** — day one.
- **`extends` / composable shareable configs** — pull presets from npm packages or local files with documented flat-config-cascade merge semantics; third parties can publish rsvelte-lint configs. Hardcoded `recommended`/`strict`/`a11y` presets become the *built-in* extends targets, not the only ones.
- **`eslint.config.js` importer** (`--config-from-eslint`) — read existing severities/options/overrides for the `svelte/*` namespace and emit rsvelte-lint config. Biome and Oxlint both had to retrofit this; we do it from the start. Migration is zero re-authoring.

### Course correction 4 — custom-rule extensibility decided early (high)

Native rules are Rust unit structs compiled in. Most serious teams maintain internal rules. We do **not** leave "how do I add my own rule" answerable only by "wait for Wave 5." Decision (surfaced in Wave 2 as a spike, see Risks R6): **custom rules stay in the coexisting ESLint pass** as the supported v1 answer, with a **stable JS rule API over the native AST (NAPI/WASM)** as the targeted v2 so custom rules run in-process without full ESLint. We do not promise a Rust plugin ABI.

### Course correction 5 — formatting rules deferred to the formatter (low)

ESLint deprecated/spun out formatting rules because they fight formatters. rsvelte ships `rsvelte_formatter`/oxfmt and most teams use prettier-plugin-svelte. **Pure-formatting rules (`mustache-spacing`, indentation-style, etc.) are excluded from the recommended preset and off by default**, with a documented "formatting is owned by the formatter" stance. `mustache-spacing` ships only as an opt-in, never recommended.

### Justification

79 of 82 rules need no TS types; ~63 of those map onto assets rsvelte owns. Reimplementing the parser+scope+services contract to run those under Node would be *more* work than porting natively and would forfeit the perf win. Native-first is cheaper and faster. The compat shim (Wave 5) is the escape hatch for unported third-party rules + the 3 type-aware plugin rules.

---

## E. Reuse vs Build

| Existing rsvelte asset | File | Decision | Note |
|---|---|---|---|
| Svelte template AST | `ast/template.rs` | **Reuse** | Node universe |
| Typed JS/TS expr AST | `ast/typed_expr.rs`, `ast/js.rs` | **Reuse** | (`Lazy` is pipeline detail, not a rule-time saving) |
| Arena | `ast/arena.rs` | **Reuse** | per-file allocator |
| Scope/binding tree | `2_analyze/scope.rs`, `scope_builder.rs` | **Reuse — audit ref completeness** | linter's `ScopeManager`; see §D / Risks R9 |
| `analyze_component()` | `2_analyze/mod.rs` | **Reuse** | drives scope + warnings (forces expr resolution) |
| Validator warnings | `2_analyze/warnings.rs` (~70) | **Reuse → wrap** | compiler-parity target only |
| Semantic errors | `2_analyze/errors.rs` (~145) | **Reuse → wrap** | error-severity rules |
| a11y rules | `2_analyze/visitors/shared/a11y/` (42) | **Reuse → wrap** | replaces plugin a11y delegation |
| `svelte-ignore` suppression | `Binding.ignore_codes` | **Reuse + add `eslint-disable` directives** | dual vocabulary |
| svelte2tsx + MagicString | `svelte2tsx/{svelte2tsx,magic_string}.rs` | **Reuse + extend (emit-time anchors)** | forward anchors are NEW |
| Sourcemap reverse-mapper | `svelte_check/mapper.rs` | **Reuse — REVERSE ONLY** | diagnostics, not probe placement |
| Overlay/d.ts/tsconfig synth | `svelte_check/overlay.rs` | **Reuse / extend** | feed corsa overlay (disk fallback in scope) |
| tsgo CLI driver | `svelte_check/tsgo.rs` | **Keep for svelte-check; labeled degraded fallback for lint** | rev-pinned to corsa's tsgo |
| Runner/manifest/watch | `svelte_check/{runner,manifest,watch}.rs` | **Reuse / extend** | walker + cache + parallel + watch |
| Diagnostic + writers | `svelte_check/{diagnostic,writers}.rs` | **Reuse + extend** | + SARIF / GH-annotations / `--max-warnings` |
| NAPI / WASM / capi | `napi.rs`, `wasm.rs`, `rsvelte_capi` | **Reuse / extend** | editor + playground + custom-rule API (v2) |
| ESTree/legacy conv | `legacy.rs`, `estree_compat/` | **Reuse — compat shim only** | Wave 5 `parseForESLint` |
| **Rule trait + meta (+options)** | — | **Build** (`rule.rs`) | port vize_patina |
| **Shared visitor** | — | **Build** (`visitor.rs`) | single DFS |
| **LintContext + report + suppression** | — | **Build** (`context.rs`) | dual directives |
| **Config (options/extends/eslint-import)** | — | **Build** (`config.rs`) | not just `{enabled,preset,rules}` |
| **Fix engine (`--fix`)** | — | **Build** (Wave 2) | overlap arbitration |
| **Emit-time TSX query anchors** | — | **Build (spike-gated)** | in `svelte2tsx` |
| **Corsa interactive backend** | — | **Build (spike-gated)** | `ProjectSession`, serial probes |
| **LSP daemon** | — | **Build** (`lint_server.rs`) | LSP, not bespoke JSON-RPC |
| **`parseForESLint` shim** | — | **Build (Wave 5)** | Node compat |

---

## F. Submodules

Keep `svelte-eslint-parser` and `eslint-plugin-svelte` as **reference submodules** under `submodules/`. Three roles, none runtime:

1. **Rule-porting source.** Each native rule is a 1:1 port of `packages/eslint-plugin-svelte/src/rules/*.ts`. Pin like `submodules/svelte`; re-audit on bump like `audit_skipped.rs`.
2. **Compat test oracle.** Drive each plugin rule's valid/invalid fixtures through the native rule and assert identical `messageId`/range — methodology from svelte2tsx Wave 1's `expected.error.json` offset comparison. **Scope: ported plugin rules only — never wrapped compiler codes** (§D course correction 1).
3. **`parseForESLint` contract reference (Wave 5).** `src/ast/html.ts`, `src/visitor-keys.ts`, `docs/internal-mechanism.md` are the shim's spec.

Not added to `Cargo.toml`/`package.json` as native-path runtime deps. Only the optional Wave 5 Node shim loads `@typescript-eslint/parser` at runtime.

---

## G. Phased plan

### Wave 1 — Syntactic + a11y core + config foundation + CI/editor table stakes — *highest value/effort ratio*
- Crate `crates/rsvelte_lint`: `Rule` trait (+ options schema), `RuleMeta`, `RuleRegistry`, `LintVisitor`, `LintContext`, `Severity`, `LintDiagnostic`/`Fix`.
- **Wrap `warnings.rs` + `errors.rs` + `a11y/` codes** → compiler-parity recommended+a11y set, validated against **rsvelte's own fixtures**.
- Hand-port ~15 high-frequency pure-syntactic plugin rules (`no-at-html-tags`, `require-each-key`, `no-dupe-else-if-blocks`, `no-dupe-style-properties`, …). Formatting rules excluded from recommended.
- **Config with per-rule options + `files`/`ignores` globs + `extends`**; `SvelteContext` conditions; dual suppression (`svelte-ignore` + `eslint-disable`); UTF-16-aware `LineIndex`.
- **CI formats: SARIF + GitHub annotations + `--max-warnings N` + ESLint-compatible exit codes** (cheap, high adoption impact). Text/json/LSP writers via `writers.rs`.
- **Minimal LSP diagnostics path** (squiggle is the #1 adoption reason) + the **double-report dedupe story** with svelte-language-server's compiler warnings.
- CLI `rsvelte lint` with rayon per-file fan-out.
- **Milestone:** `rsvelte lint` ships recommended + a11y + 15 rules, with options, CI formats, and editor squiggles, faster than ESLint, zero type info. Shippable as a **complement to ESLint**.

### Wave 2 — Scope rules + autofix + config import + extensibility decision
- Port the ~19 scope rules onto `ScopeRoot`/`Binding` — **gated by a reference-completeness audit** on the two hardest (`prefer-const`, `no-unused-class-name`); budget augmenting `scope_builder.rs` if the compiler scope prunes lint-relevant references (Risks R9).
- Wire **`--fix`** end-to-end (overlap arbitration); define **fix-on-save ownership** vs coexisting ESLint.
- Port remaining syntactic + CSS/selector rules.
- **`eslint.config.js` importer** (`--config-from-eslint`); shareable/extendable config composition.
- **Custom-rule extensibility decision** surfaced (ESLint-pass for v1; NAPI/WASM rule API spiked for v2).
- Compat-oracle harness (plugin fixtures, `messageId` parity).
- **Milestone:** majority of recommended set native, autofix, existing eslint config importable.

### Wave 3 — Typed-rule **spike** (gated, no committed dates until green)
- **Gate 0 — forward-anchor spike (Risks R1):** emit-time TSX query anchors in `svelte2tsx`; end-to-end anchor → UTF-16 → `get_type_at_position` → correct type on ~20 hand-picked expressions incl. astral/casts/awaits/optional-chains/each-context. **No typed-rule scope committed until this passes.**
- **Gate 1 — serial-probe latency spike (Risks R2):** one warm corsa session, realistic per-site probes on a medium project; establish empirical single-worker throughput; separate snapshot-update from type-resolution latency; measure batch endpoint *if* it can be added vs the serial loop.
- Concurrency bridge (Risks R3): rayon stage emits probe batches into an MPSC channel; a dedicated tokio task owns the single `ProjectSession`; rayon threads `block_on` a oneshot. Concrete, prototyped — not "pipeline."
- Typed rules (`no-floating-promises`, `restrict-template-expressions`, `no-unsafe-member-access`): static-first planner, `ctx.type_at(span) -> Option<TypeFacts>`, structured flags over `.texts`. **Fail-closed in CI, fail-open in editor.**
- Dual-engine rev-pin CI guard + cross-backend parity test before fallback ships.
- **Milestone (only if Gates 0/1 green):** type-aware Svelte lint, in-process, constant-factor win, single-worker-bound — explicitly *not* 100x.

### Wave 4 — Daemon, watch, incremental
- `lint_server.rs`: warm `ProjectSession` + open overlay docs across requests, **LSP** (not bespoke JSON-RPC) so Zed/Neovim/JetBrains/VSCode get diagnostics + code-actions.
- **Cross-file dependency graph for typed-rule invalidation (Risks R4):** block-hash cache for non-typed rules; for typed rules, always re-run any file in a changed dependency closure (module import graph + component prop deps). Fixture: mutate a child prop, assert parent re-lints. **No "sub-ms warm typed re-lint" advertised until cross-file invalidation is tested.**
- NAPI/WASM lint + custom-rule entry points.
- **Milestone:** sub-ms warm re-lint for **non-typed** rules; correct (not necessarily sub-ms) warm typed re-lint; editor integration.

### Wave 5 — ESLint compat shim (long-tail + type-aware plugin rules)
- `parseForESLint`-shaped output from `legacy.rs`/`estree_compat` + `VisitorKeys`; eslint-scope-compatible `ScopeManager`; `parserServices` (delegate type to `@typescript-eslint/parser` + svelte2tsx map).
- Host unported third-party rules + the 3 type-aware plugin rules under Node.
- **Milestone:** ecosystem coverage for projects with custom/unported rules. **This is the replacement-enabler and the highest-risk wave** — de-risked by the Wave-2 extensibility decision so the product is already useful as a complement long before this lands (Risks R5).

---

## H. Performance model

### Where the ~100x comes from (non-typed + warm-incremental paths only)

The JS stack pays, per file, **three independent re-parses** — (1) JS `svelte/compiler` parse, (2) `@typescript-eslint/parser` re-parse of assembled virtual TS, (4) `eslint-scope` over the larger-than-source virtual script — plus (3) restore traversal and (5) string blanking/splicing.

rsvelte-lint collapses this to **one** native Svelte parse + **one** native scope analysis (both already produced by `analyze_component`, eliminating cost centers 1, 3, 4, 5). Virtual-TS assembly is `svelte2tsx`, already built, fed to the checker as an in-memory overlay. Rule evaluation is a **single shared DFS** over byte-offset spans, no V8 marshalling, vs ESLint's per-node-type dispatch over a marshalled object graph.

**This ~100x is credible and headline-worthy for syntactic/scope linting and warm-incremental re-lint of non-typed rules.** It is the claim we will be held to and the one we lead with.

### The typed path is checker-bound, single-worker, constant-factor — stated up front, not buried

- The dominant typed cost — TS **binder+checker type resolution per probe** — is *not* eliminable (same native checker as tsgo) and *not* parallelizable. rayon fans out parse/scope/virtual-TS-gen; every type query funnels through **one strictly-ordered corsa worker**. `servers>1` is unsupported (`vize` `runner.rs:1150`) — there is no process pool.
- Per-file typed cost is **O(probe_sites) serial blocking round-trips** (the proven `vize_patina` driver), **not** one batched call. Batching is removed from the design until a measured prototype proves an interactive order-aligned endpoint exists *and* beats the serial loop (§B course correction 2).
- Real ceiling: `probes/sec = 1 / (round-trip + resolution latency)` from one worker. We give a concrete throughput model from the Gate-1 spike before sizing any typed milestone.

**Headline scoping:** ~100x for non-typed + warm-incremental syntactic/scope paths. Typed path: **large constant-factor win, single-threaded-checker-bottlenecked**. The title "fastest typed linter" is qualified accordingly throughout, including the TL;DR.

### Parallelism boundaries and the concurrency bridge

- **Parallel (rayon `par_iter` over files):** read → parse → scope → virtual-TS gen → syntactic/scope rules → **plan** type-probe sites.
- **Serial (typed):** a dedicated tokio task owns the single `ProjectSession`. rayon stage emits planned probe batches into an MPSC channel; the task drains them; rayon threads `block_on` a oneshot for results. Two phases: **collect probe sites (parallel) → drain queue (serial async) → run typed rules (parallel).** Prototyped in Wave 3, not assumed.
- **Static-first** keeps most files off the checker entirely — the single most important typed-path lever.

### Caching / incremental / daemon — corrected

- **Warm session:** one `ProjectSession` kept alive. The interactive win is real but **capability-gated** (overlay vs disk fallback) and measured as end-to-end edit→re-probe→diagnostic latency, not snapshot-update latency alone.
- **Non-typed incremental:** per-block content hashes (`script`/`module-script`/`template`/`style`) — sound, re-lint only the changed file.
- **Typed incremental — cross-file (Risks R4):** block-hash-per-file is **unsound** for typed rules (a child prop-type change alters parent diagnostics with no parent-hash change). Typed invalidation uses a cross-file dependency closure; non-typed cache is scoped to non-typed rules only.
- **Type-text:** prefer structured flags; cap/truncate `.texts` for predicate rules to bound per-probe cost on giant generic/union types.

### Honest cost ceiling (promoted from a footnote to a headline qualifier)

A cold, fully type-aware run over a large monorepo is bounded below by the native TS checker's binder+checker time, shared by corsa and tsgo, and serialized through one worker. **Adopters also keep a second TS program** (typescript-eslint/tsserver over non-Svelte files), so the checker cost is effectively paid twice — we quantify resident memory + warm cost of corsa alongside an existing tsserver on a representative monorepo before claiming the typed feature is worth a second program (Risks R10). The dev-loop and syntactic/scope wins are large and real; cold full-project typed lint is a constant-factor improvement, not 100x.

---

## Risks & Open Questions

Each high/medium concern with a mitigation, a gate, or an explicit accepted-risk / needs-spike.

| # | Risk (severity) | Disposition |
|---|---|---|
| **R1** | **Forward span→TSX mapping does not exist** — `mapper.rs` is reverse-only and snaps to chunk anchors; inversion is many-to-one (high) | **Needs spike, hard gate (Wave-3 Gate 0).** New emit-time per-query-kind anchors in `svelte2tsx`; assert correct type on ~20 expressions incl. astral/casts/awaits/optional-chains/each-context before any typed scope/dates. The entire typed value prop is blocked on this. |
| **R2** | **Batched `get_types_at_positions` is not in the interactive path; real cost is N serial probes** (high) | **Design corrected:** modeled as O(sites) serial round-trips; batching removed as a primitive. **Spike (Gate 1)** to measure serial throughput and test whether a batch endpoint can be added and wins. Perf budget re-derived on serial basis. |
| **R3** | **Async corsa API vs sync rayon engine** — no concrete bridge (medium) | **Specified:** MPSC channel from rayon → dedicated tokio task owning the single session; rayon threads `block_on` oneshot. Prototyped in Wave 3, not left as "pipeline." |
| **R4** | **Block-hash cache unsound for cross-file typed diagnostics** (high) | **Design corrected:** non-typed cache scoped to non-typed rules; typed invalidation via cross-file dependency closure. Test: mutate child prop, assert parent re-lints. "Sub-ms warm typed re-lint" not advertised until tested. |
| **R5** | **Wave 5 (compat shim) is adoption-critical but sequenced last and highest-risk** (high) | **Accepted risk, mitigated by repositioning.** Product is useful as an **ESLint complement** from Wave 1; "replacement" is an explicit non-goal until Wave 5. Custom-rule extensibility decided in Wave 2 (R6) so adoption doesn't hinge on Wave 5. Parity-tracking dashboard (like the compat report) makes drift visible; unported rules are a documented warning, not a silent gap. |
| **R6** | **No custom-rule API before Wave 5; Node shim forfeits perf** (high) | **Decided early:** v1 answer is "custom rules stay in the coexisting ESLint pass" (documented); v2 is a NAPI/WASM JS rule API over the native AST, spiked in Wave 2. No Rust plugin ABI promised. |
| **R7** | **Proprietary config; no `eslint.config.js` import; no per-rule options; no `extends`** (high) | **Mitigated in Wave 1–2:** per-rule typed options + `files`/`ignores` globs + `extends`/shareable configs in Wave 1; `--config-from-eslint` importer in Wave 2. |
| **R8** | **Coexistence: double linter, double config, conflicting fix-on-save, double squiggles** (high) | **First-class model:** generated "disable these in ESLint" config (one engine per rule ID); documented fix-on-save ownership; editor dedupe with svelte-language-server's compiler warnings; LSP path in Wave 1. |
| **R9** | **Compiler scope ≠ ESLint scope for all ~19 rules** (medium) | **Needs audit before the 19-rule estimate is committed.** Verify reference completeness against `prefer-const` + a `findVariable`-heavy rule on real fixtures; budget augmenting `scope_builder.rs` into Wave 2 if the compiler prunes lint-relevant references. |
| **R10** | **Double TS program (corsa + tsserver/typescript-eslint); checker cost paid twice** (medium) | **Needs measurement.** Quantify resident memory + warm cost of corsa alongside an existing tsserver on a representative monorepo before committing the typed feature. Open question: should type-aware Svelte rules ride the user's existing TS program via the compat path instead of a second corsa program? |
| **R11** | **Dual TS engines (vendored tsgo + corsa's pinned tsgo) can diverge → nondeterministic lint** (high) | **CI guard:** corsa's pinned `typescript-go` rev must equal the vendored submodule rev; CI fails on divergence. Corsa→tsgo fallback is a labeled degraded mode; cross-backend parity test on a fixture corpus before fallback ships in production. |
| **R12** | **Fail-open degradation on corsa panic → silent CI false negatives** (medium) | **Policy:** fail-closed default in CI (exit non-zero when a type-aware rule could not run), fail-open only in editor/watch; machine output reports "N typed rules skipped." |
| **R13** | **`get_types_at_positions` returns `Vec<Option<...>>`; per-site `None` is common** (medium) | **Modeled:** `ctx.type_at -> Option<TypeFacts>`; every typed rule treats `None` as skip/degrade; `None`-rate is the forward-anchor health metric in machine output. |
| **R14** | **"0.05 ms no-disk overlay" capability-gated; conflates snapshot vs query latency** (medium) | **Corrected:** disk fallback is in scope; headline replaced with measured end-to-end edit→re-probe→diagnostic latency on deep-generic components. |
| **R15** | **UTF-16 conversion is O(offset)/probe in the reference → quadratic** (medium) | **Corrected:** build astral-aware UTF-16 `LineIndex` once per file; convert via lookup; microbenchmark on a mustache-heavy component. |
| **R16** | **Type-text blowup on deep generics/unions** (medium) | **Mitigated:** prefer structured flags (`is_promise`, `is_any`) over `.texts`; cap/truncate type-text for predicate rules. |
| **R17** | **Suppression mismatch: `svelte-ignore` vs `eslint-disable`** (high) | **Mitigated:** support both directive families keyed on rule IDs; document dual-linter suppression; reconcile code/ID vocabulary via the namespace decision (R8). |
| **R18** | **Rule-ID namespace collision in coexistence** (medium) | **Decided:** keep `svelte/*` IDs **only** with the generated ESLint-disable config (one engine per ID); fallback is `rsvelte/*` + alias map. Never ambiguous. |
| **R19** | **CI formats / exit codes missing** (medium) | **Wave 1 deliverable:** SARIF + GitHub annotations + `--max-warnings` + ESLint-compatible exit codes. |
| **R20** | **Autofix fix-on-save races; suggestion tier has no surface** (medium) | **Mitigated:** define fix ownership in coexistence + editor ordering; tie `Suggestion`-fixable rules to LSP code-actions; don't ship suggestion rules before the surface exists. |
| **R21** | **Formatting rules fight the formatter/Prettier** (low) | **Decided:** exclude pure-formatting rules from recommended, off by default; formatting owned by `rsvelte_formatter`. |
| **R22** | **`Lazy` parse-on-demand perf claim inflated** (low) | **Accepted/corrected:** dropped from the perf narrative; linter pays full expression resolution via `analyze_component`. Real claim: one resolution vs three re-parses. |
| **R23** | **100x headline contradicts own ceiling; daemon claim rides least-proven code** (low) | **Corrected:** ~100x scoped to non-typed + warm-incremental in TL;DR/title/milestones; typed path is constant-factor, checker-bound. Wave-4 "sub-ms warm typed re-lint" gated behind the Gate-1 measurement and R4 cross-file correctness. |

### Open questions requiring spikes before commitment
1. **Can the interactive `ProjectSession` expose an order-aligned batch position API that beats the serial loop?** (R2) — measure in Wave 3 Gate 1; if no, typed throughput is the serial-probe ceiling, full stop.
2. **Does the native compiler scope retain every reference the ~19 scope rules need?** (R9) — audit before committing the scope-rule estimate.
3. **Is a second corsa TS program justified, or should typed Svelte rules ride the user's existing TS program via the compat path?** (R10) — measure monorepo memory/warm cost.
4. **What is the empirical single-worker probe throughput on a realistic component with deep generics?** (R1/R2/R14) — gates every typed milestone and the daemon's interactive claims.

---

## Implementation status

### Wave 1 — landed (`crates/rsvelte_lint`)

The first slice is implemented and tested (validates Decisions A, C, parts of D/E):

- **Rule engine** — `Rule` trait + `&'static RuleMeta` (`rule.rs`), single shared DFS `LintVisitor` (`visitor.rs`), `RuleRegistry` (`registry.rs`), `LintContext` with central `report*`/severity resolution (`context.rs`). Hooks: `check_root`/`element`/`component`/`html_tag`/`expression_tag`/`each`/`if`/`await`/`snippet`/`debug_tag`.
- **Validator wrap** (`validator.rs`) — compiles with `GenerateMode::None` and surfaces the compiler's warnings/errors/`a11y_*` codes as lint diagnostics; config overrides apply by code. The §D "single biggest lever".
- **Native rules** (`rules/`) — `svelte/no-at-html-tags`, `svelte/require-each-key`, `svelte/no-at-debug-tags` (autofixable), `svelte/button-has-type`.
- **Config** (`config.rs`) — per-rule severity overrides (off/warn/error) over rule defaults. *Not yet:* per-rule options, globs, `extends`, `eslint.config.js` import (Wave 1 tail / Wave 2).
- **Suppression** (`suppression.rs`) — dual `eslint-disable*` + `svelte-ignore` directives, line-based v1 (block-range tracking deferred to Wave 2).
- **Autofix** (`fix_source` in `runner.rs`) — non-overlapping `Code`-tier edits, suppression-aware; `--fix` writes in place.
- **Output** — reuses `svelte_check` `Diagnostic` + writers (human / machine / github-actions).
- **CLI** `rsvelte-lint` — rayon per-file parallelism, `--off`/`--error`/`--fix`/`--format`/`--max-warnings`, ESLint-style exit codes.

### Not yet started

- **Scope-based rules** — gated on the §E / R9 scope-completeness audit before threading `ComponentAnalysis`/`ScopeRoot` into `RuleContext`.
- Wave 1 tail: config file + `eslint.config.js` import, per-rule options, SARIF, minimal LSP, broader native rule set.
- Waves 2–5 as described above.
