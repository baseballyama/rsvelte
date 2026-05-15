# Remaining text→AST migrations (handover)

Context: the `/perf-loop` arc through 2026-05-15 migrated 18 text-based
rune handlers to the AST pass (`ast_state_transform.rs`). The remaining
text passes listed below are deferred. Each entry is a tractable
single-PR migration; reasons for deferral are noted.

If you're picking this up, start with the one that has the highest
"perf impact" in the table — those are the production-hot paths.

## Status snapshot

| Pass | Where it lives | Perf impact | Why deferred |
|---|---|---|---|
| Non-dev `$inspect(...)` statement removal | `rune_transforms.rs:184`–`260` | **cold** (dev-only feature) | Multiple edge cases (`$inspect.trace` vs `$inspect`, `.with(cb)` chain, async-hole markers); attempted once, abandoned per perf-loop rule 4. |
| Per-statement `wrap_state_derived_with_tag` class-field branch | `rune_transforms.rs:wrap_state_derived_with_tag` (call sites at L116 + L401) | **medium** (dev-mode classes) | Class-field declaration (`#field = $.state(...)`) and `this.#field = $.state(...)` rewrites. Only runs in dev mode + when classes have state. |
| `transform_module_script_runes` text passes | `mod.rs:transform_module_script_runes` | **medium** (every component with module script) | Separate code path from the per-component AST pass; has its own `transform_state_assignments`, `wrap_state_vars_in_expr`, `transform_strict_equals`, etc. |

The other text helpers (state / derived / derived.by / props
destructuring, strict-equals, $.tag wrap, $inspect dev-mode) have
already migrated to AST in PRs #104–#110.

## 1. Non-dev `$inspect(...)` statement removal

**Goal**: in non-dev mode, `$inspect(args);` and `$inspect.trace(args);`
statements should be removed (or replaced with `/* $$async_hole:args */`
in async mode, which the formatting layer later converts to `;;`).

**Current text path** (in `rune_transforms.rs:transform_client_runes_with_skip_and_state`):

```rust
if !dev {
    // $inspect.trace(...) — always strip, no marker
    while let Some(pos) = memmem::find(result.as_bytes(), b"$inspect.trace(") {
        // walk to closing paren, consume trailing ;/whitespace,
        // consume leading spaces, splice out
    }
}
if !dev && let Some(pos) = memmem::find(result.as_bytes(), b"$inspect(") {
    // $inspect(args) — strip; standalone-statement + async-mode → emit marker
    // $inspect(args).with(cb) — same
}
```

**AST entrypoint** (mostly designed during the abandoned attempt):

```rust
fn visit_expression_statement(&mut self, stmt: &ExpressionStatement<'ast>) {
    if !self.try_rewrite_nondev_inspect_statement(stmt) {
        walk::walk_expression_statement(self, stmt);
    }
}

fn try_rewrite_nondev_inspect_statement(&mut self, stmt: &ExpressionStatement<'_>) -> bool {
    // Guard: !dev && is_runes && !is_shadowed("$inspect") && !store_sub
    // Resolve outer call to inner $inspect call (3 shapes):
    //   - $inspect(args)            — direct
    //   - $inspect.trace(args)      — member call
    //   - $inspect(args).with(cb)   — peeled through .with()
    // is_trace flag distinguishes whether to emit the async-hole marker
    // Extend replacement span to consume leading spaces/tabs and
    // (for the strip path) trailing ;/whitespace/newline.
}
```

### What broke last time

The attempt at `perf/inspect-nondev-ast` (abandoned, branch deleted)
failed on these fixtures:

- `inspect-derived` — `$inspect(y).with(push)` not replaced
- `inspect-state-unsafe-mutation`
- `inspect-console-trace`
- `inspect-with-untracked`
- `async-top-level-inspect-server` (snapshot)

Root-cause investigation didn't get far; the replacement appears to
register but doesn't apply. Possibilities:

- Inner replacements drained by outer walk before the outer can emit
- `visit_expression_statement` firing at the wrong nesting level (e.g.,
  inside a callback rather than top-level)
- Span miscalculation when the outer call has `.with(cb)` chain

### Gates needed

In `mod.rs:transform_instance_script_for_visitors` and
`ast_state_transform::transform_state_vars_ast`, add:

```rust
let has_inspect_calls = is_runes
    && !store_sub_vars.iter().any(|v| v == "$inspect")
    && memmem::find(result.as_bytes(), b"$inspect").is_some();
```

…and include `has_inspect_calls` in `has_transforms` and `has_any_match`.
(Currently `$inspect` doesn't have its own gate; dev-mode `$inspect(...)`
rewrites only run when *other* state/derived/props transforms are also
present, which has been correct because non-dev `$inspect` was handled
by the text loop. After this migration, the gate is required.)

### Fixtures to exercise

- `runtime-runes/samples/inspect-trace`
- `runtime-runes/samples/inspect-derived`
- `runtime-runes/samples/inspect-state-unsafe-mutation`
- `runtime-runes/samples/inspect-console-trace`
- `runtime-runes/samples/inspect-trace-store`
- `runtime-runes/samples/inspect-trace-nested`
- `runtime-runes/samples/inspect-trace-circular-reference`
- `runtime-runes/samples/inspect-trace-null`
- `runtime-runes/samples/inspect-trace-reassignment`
- `runtime-runes/samples/inspect-with-untracked`
- `snapshot/samples/async-top-level-inspect-server`

The snapshot fixture is especially load-bearing because it tests the
async-hole marker → `;;` conversion path (`formatting.rs:373`).

### Recommendation

Honestly evaluate cost vs. benefit before picking this up. `$inspect`
is a dev-only debugging tool; in production builds (where this code
runs) it's essentially never present. Removing the text loop saves a
`memmem::find` per statement when `$inspect` is absent, which is the
overwhelmingly common case — and `memmem::find` is SIMD-fast already.

This migration is **cold-path cleanup**, not a perf win. Only attempt
if you're driven by code-uniformity (full text→AST migration) rather
than measured perf.

## 2. Class-field `wrap_state_derived_with_tag` branch

**Goal**: in dev mode, `#field = $.state(...)` and
`this.#field = $.state(...)` declarations inside classes get wrapped
with `$.tag(...)` / `$.tag_proxy(...)` for `$inspect.trace()` labels.

**Current text path** (in `rune_transforms.rs:wrap_state_derived_with_tag`):

Two scan loops at the end of the function (the comment says "Handle
class field declarations" around L562):

1. `#field = $.X(...)` (private field, no `this.`)
2. `this.#field = $.X(...)` / `this.field = $.X(...)` (class constructor)

Both emit `$.tag(..., 'ClassName.field')` or
`$.tag_proxy(..., 'ClassName.field')` depending on whether the field
was originally public (compiler-converted to private with a
getter/setter) or originally private.

The class name comes from `extract_enclosing_class_name(before_text)`
which scans backwards for `class NAME` — straightforward at the AST
level (just `ClassDeclaration::id`).

### AST design

Two new visitors:

```rust
fn visit_property_definition(&mut self, prop: &PropertyDefinition<'ast>) {
    // Match: prop.value = Some(CallExpression { $state | $derived | $proxy })
    // prop.key = PrivateIdentifier or IdentifierName
    // Walk inner so state-var refs register, drain, emit $.tag wrap
}

fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
    // Match: lhs = StaticMemberExpression { object = ThisExpression, property = X }
    //         OR lhs = PrivateFieldExpression { object = ThisExpression, field = #X }
    //        rhs = CallExpression { $state | $derived | $proxy }
    // Walk inner, drain, emit $.tag wrap
}
```

Both need access to the enclosing class name, which is awkward without
parent tracking. Options:

- Track `current_class_name: Option<&str>` in `StateVarCollector`,
  push/pop in `visit_class` override
- Or do a brief upward scan in the source text via `extract_enclosing_class_name`
  (reuses the existing text helper)

The second option is cheaper and works because by the time we're
inside `visit_property_definition`, the class header is already in the
source bytes preceding the field.

### Fixtures to exercise

Grep for `#\w+ *= *\$state(` and `this\.#?\w+ *= *\$state(` in
`runtime-runes/samples` to find them. Class-based components are
relatively rare in the test corpus.

### Recommendation

This is **dev-mode-only** work — same caveat as #1. Run `samply` first
on a dev-mode workload with classes to confirm it's actually hot.
If not, leave the text path alone.

## 3. `transform_module_script_runes` text passes

**Goal**: migrate the module-script (`<script context="module">`)
transform from text-based to AST-based, matching what the instance
script already does.

**Current**: `mod.rs:transform_module_script_runes` runs its own
sequence of text helpers (`transform_state_assignments`,
`wrap_state_vars_in_expr`, `transform_strict_equals`,
`transform_console_calls_dev`, `wrap_state_derived_with_tag`,
`apply_effect_rune_transforms`). None of these go through the AST
pass.

### Why this is a real migration (not just a port)

Module-script and instance-script have different binding scoping:
the module script's bindings are visible to the instance script as
imports (sort of), so the AST pass would need to know what runs in
module vs instance context.

Two approaches:

**Approach A: extend the existing AST pass to cover both scripts.**
Currently `transform_state_vars_ast` is called once for the instance
script (`transform_instance_script_for_visitors` at L4308+). Add a
second call for the module script with its own
`AstTransformConfig`. The challenge: the module script's
`analysis.module_root` has different bindings than `analysis.root`.

**Approach B: lift the module-script transform into the same flow.**
Treat module + instance as concatenated input to a single AST pass,
then split the output. Cleaner data flow but requires fixing up
positions.

Approach A is the safer first step.

### Test coverage

Module scripts are exercised by:

- `runtime-runes/samples/module-script-*`
- `runtime-legacy/samples/module-script-*` (legacy mode — different path, may not be in scope)

Run with the existing module-script fixtures before claiming the
migration is correctness-preserving.

### Recommendation

**Medium-priority**. Module scripts run in every component that has
one (often: stores, constants, helpers). Removing the text-pass loop
saves per-statement work, but the per-component count is 1 module
script vs N instance statements, so the multiplier is small.

Still worth doing for code uniformity — having one AST pipeline for
the whole script-transform phase makes future changes much easier.

## Cross-cutting: gates

All three of these migrations need new byte-presence gates in:

- `mod.rs:transform_instance_script_for_visitors` — outer gate before
  entering the AST pass
- `ast_state_transform::transform_state_vars_ast` — inner gate before
  parsing with OXC

The gate is always shaped:

```rust
let has_X = condition_for_entering
    && memmem::find(result.as_bytes(), b"PROBE_BYTES").is_some();
```

Add to both `has_transforms` (outer) and `has_any_match` (inner).
Without these, the AST pass won't enter for components that only need
the new rune family, and the migration silently no-ops.

Reference recent gate additions:

- `has_strict_equals` (PR #104)
- `has_inspect_calls` (attempted in the abandoned non-dev `$inspect`
  branch — see Section 1 for shape)

## Recommended order

1. **Class-field `$.tag` wrap** (#2) — if profiling shows dev-mode
   classes are hot. Otherwise skip.
2. **Module-script transform** (#3) — code uniformity, modest perf.
3. **Non-dev `$inspect`** (#1) — only for code uniformity. No perf win.

Or skip all three and prioritize the **bumpalo migration**
(`docs/bumpalo-migration-plan.md`) — that has a measurable perf
ceiling (+10–20%), but is also the largest single effort.
