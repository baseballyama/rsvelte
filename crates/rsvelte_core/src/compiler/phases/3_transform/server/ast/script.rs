//! AST-based server INSTANCE / MODULE script transform (Phase-3 rewrite).
//!
//! This is the additive, in-progress port of the server `VariableDeclaration` /
//! `ExpressionStatement` / `ImportDeclaration` global visitors
//! (`submodules/svelte/packages/svelte/src/compiler/phases/3-transform/server/`)
//! restricted to the **localized, non-interacting RUNES lowerings**. It parses
//! the script source slice with oxc, walks the top-level statements, classifies
//! each, then RE-PARSES the relevant source spans into the state's allocator and
//! applies the rune lowerings — no node moving across allocators, no text
//! surgery on the output.
//!
//! ## In scope (this slice)
//! - `import …` (instance) → hoisted to module scope, dropped from body.
//! - `let x = $state(e)` / `$state.raw(e)` → `let x = <e>` (no-arg → `void 0`).
//! - `let d = $derived(e)` → `let d = $.derived(() => <e>)`.
//! - `let d = $derived.by(f)` → `let d = $.derived(<f>)`.
//! - `let { … } = $props()` → `let { … } = $$props`, with the `$$slots` /
//!   `$$events` deconfliction injection for the object-WITH-rest and identifier
//!   forms (写经 `VariableDeclaration.js:33-82`; `$$slots` deconflicts to
//!   `$$slots_` when `analysis.uses_slots`).
//! - class-field runes: `count = $state(0)` → `count = 0`, `$state()` → bare
//!   field, `d = $derived(e)` → `d = $.derived(() => e)`, `$derived.by(f)` →
//!   `$.derived(f)` (写经 `PropertyDefinition.js`).
//! - `$props.id` → dropped.
//! - top-level `$effect(…)` / `$effect.pre(…)` / `$effect.root(…)` /
//!   `$inspect(…)` / `$inspect.trace(…)` expression statements → dropped.
//! - everything else → kept verbatim (re-parsed from its source span).
//!
//! ## EXPLICIT KNOWN GAPS (DEFERRED by design — the delicate single-pass the
//! main agent adds later, NOT here):
//! - derived-read wrapping, store-get (`$x` → `$.store_get`),
//!   `$state.snapshot`, `$$sanitized_props` identifier rewriting — all value
//!   expressions pass through verbatim (re-parsed source, UNCHANGED).
//! - TypeScript components (`<script lang="ts">`) — the script slice is run
//!   through `strip_typescript` BEFORE parsing, then lowered as ordinary JS
//!   (offsets stay internally consistent because `src` borrows the stripped
//!   buffer and every re-slice cuts from `src`, never from `state.source`).
//!   Template-side TS (e.g. `{x as T}`) is NOT stripped here — the OLD oracle
//!   strips TS from its final output, which this slice does not (KNOWN GAP).
//! - async `$derived` (`$derived(await …)`) — lowered as a plain `$.derived`
//!   thunk (no `await $.async_derived(...)`).
//! - complex destructured-`$derived` / destructured-`$state` patterns (the
//!   `extract_paths` expansion) — the binding pattern is kept verbatim and the
//!   init lowered, which is correct for object/identifier patterns but NOT for
//!   the leaf-rename cases.
//! - `$bindable()` stripping inside a `$props()` destructure default
//!   (`let { x = $bindable(1) } = $props()`) — the nested `$bindable(...)` call
//!   is kept verbatim rather than unwrapped to its argument (upstream's
//!   `AssignmentPattern` walk; KNOWN GAP).

use super::ServerTransformState;
use crate::ast::template::Script;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;
use oxc_ast::ast::{Expression as OxcExpression, Statement, VariableDeclarationKind};
use oxc_span::GetSpan;

/// The rune shapes this slice recognises on a declarator init.
enum DeclRune {
    /// `$state(e)` / `$state.raw(e)` — keep just the argument.
    State,
    /// `$derived(e)` — `$.derived(() => <e>)`.
    Derived,
    /// `$derived.by(f)` — `$.derived(<f>)`.
    DerivedBy,
    /// `$props()` — `<pattern> = $$props`.
    Props,
    /// `$props.id` — drop the declarator.
    PropsId,
}

/// Detect a rune on a declarator-init oxc expression by callee / member name.
/// Mirrors upstream `get_rune`: the rune is the CALLEE of a call expression
/// (`$props.id()` → `$props.id`), so every rune here is matched on a
/// `CallExpression`.
fn detect_decl_rune(init: &OxcExpression) -> Option<DeclRune> {
    let OxcExpression::CallExpression(call) = init else {
        return None;
    };
    match &call.callee {
        OxcExpression::Identifier(id) => match id.name.as_str() {
            "$state" => Some(DeclRune::State),
            "$derived" => Some(DeclRune::Derived),
            "$props" => Some(DeclRune::Props),
            _ => None,
        },
        OxcExpression::StaticMemberExpression(m) => {
            let OxcExpression::Identifier(obj) = &m.object else {
                return None;
            };
            match (obj.name.as_str(), m.property.name.as_str()) {
                ("$state", "raw") => Some(DeclRune::State),
                ("$derived", "by") => Some(DeclRune::DerivedBy),
                // `$props.id()` — upstream skips this declarator (it is
                // re-emitted as `const <id> = $.props_id($$renderer);` via the
                // separate `analysis.props_id` assembly path). The re-emission
                // is a KNOWN GAP in this slice; we only mirror the skip.
                ("$props", "id") => Some(DeclRune::PropsId),
                _ => None,
            }
        }
        _ => None,
    }
}

/// Whether an expression-statement expression is a top-level effect/inspect rune
/// call that upstream's server `ExpressionStatement` visitor removes.
fn is_removed_effect_stmt(expr: &OxcExpression) -> bool {
    let OxcExpression::CallExpression(call) = expr else {
        return false;
    };
    match &call.callee {
        OxcExpression::Identifier(id) => matches!(id.name.as_str(), "$effect" | "$inspect"),
        OxcExpression::StaticMemberExpression(m) => {
            let OxcExpression::Identifier(obj) = &m.object else {
                return false;
            };
            matches!(
                (obj.name.as_str(), m.property.name.as_str()),
                ("$effect", "pre") | ("$effect", "root") | ("$inspect", "trace")
            )
        }
        _ => false,
    }
}

/// Parse + lower a single RUNES-mode script into transformed top-level
/// statements. `import_sink` receives instance-script imports to hoist (`None`
/// for module).
fn transform_script<'a>(
    script: &Script,
    state: &mut ServerTransformState<'a>,
    mut import_sink: Option<&mut Vec<Statement<'a>>>,
) -> Vec<Statement<'a>> {
    let (Some(start), Some(end)) = (script.content.start(), script.content.end()) else {
        return Vec::new();
    };
    let (start, end) = (start as usize, end as usize);
    if end <= start || end > state.source.len() {
        return Vec::new();
    }

    // TypeScript components: strip TS from the script SLICE before parsing, then
    // run the same JS lowering on the stripped text. `strip_typescript` returns a
    // NEW string whose byte offsets do NOT line up with `state.source`, so we must
    // make `src` borrow the stripped buffer and have EVERY downstream sub-slice /
    // reparse cut from `src` (never from `state.source`). This is already how the
    // rest of this function works: the classification parse and every span re-slice
    // index into the local `src`, and the reparse helpers copy the slice text into
    // the state allocator — none of them index `state.source` directly. So binding
    // `src` to the stripped buffer keeps offsets internally consistent. Mirrors the
    // OLD oracle, which runs the same `strip_typescript` (over its final output).
    let stripped;
    let src: &str = if super::super::helpers::script_is_typescript(script) {
        stripped = crate::compiler::phases::phase2_analyze::types::strip_typescript(
            &state.source[start..end],
        );
        &stripped
    } else {
        &state.source[start..end]
    };

    // Parse with a FRESH allocator purely for CLASSIFICATION. We never move nodes
    // out of it; every emitted statement is re-parsed from `src` into the state
    // allocator instead.
    let alloc = oxc_allocator::Allocator::default();
    let owned = alloc.alloc_str(src);
    let ret = oxc_parser::Parser::new(&alloc, owned, oxc_span::SourceType::mjs()).parse();
    if !ret.diagnostics.is_empty() {
        return Vec::new();
    }

    let mut out: Vec<Statement<'a>> = Vec::new();

    for stmt in ret.program.body.iter() {
        match stmt {
            Statement::ImportDeclaration(imp) => {
                let slice = &src[imp.span.start as usize..imp.span.end as usize];
                if let Some(rehomed) = state.reparse_statement(slice) {
                    match import_sink.as_deref_mut() {
                        Some(sink) => sink.push(rehomed),
                        None => out.push(rehomed),
                    }
                }
            }
            Statement::VariableDeclaration(vd) => {
                if let Some(lowered) = lower_variable_declaration(vd, src, state) {
                    out.push(lowered);
                }
            }
            Statement::ExpressionStatement(es) => {
                if is_removed_effect_stmt(&es.expression) {
                    continue;
                }
                let slice = &src[es.span.start as usize..es.span.end as usize];
                if let Some(rehomed) = state.reparse_statement(slice) {
                    out.push(rehomed);
                }
            }
            Statement::ClassDeclaration(_) => {
                // Re-parse the class verbatim, then lower any `$state` / `$derived`
                // class-field initializers in place (写经 `PropertyDefinition.js`).
                let span = stmt.span();
                let slice = &src[span.start as usize..span.end as usize];
                if let Some(mut rehomed) = state.reparse_statement(slice) {
                    lower_class_field_runes(&mut rehomed, state);
                    out.push(rehomed);
                }
            }
            other => {
                let span = other.span();
                let slice = &src[span.start as usize..span.end as usize];
                if let Some(rehomed) = state.reparse_statement(slice) {
                    out.push(rehomed);
                }
            }
        }
    }
    out
}

/// Lower `$state` / `$state.raw` / `$derived` / `$derived.by` class-field
/// initializers in a re-homed class declaration STATEMENT, in place (写经
/// `3-transform/server/visitors/PropertyDefinition.js`).
///
/// - `count = $state(0)` → `count = 0`; `x = $state()` → `x` (value dropped to
///   `None`, i.e. a bare class field — NOT `void 0`).
/// - `d = $derived(e)` → `d = $.derived(() => e)`; `d = $derived.by(f)` →
///   `d = $.derived(f)`; `d = $derived()` → `d` (value dropped).
///
/// Only top-level (non-nested) class-field runes are handled; method bodies and
/// nested classes pass through unchanged (the `value` of a method is a
/// `Function`, not a `PropertyDefinition`, so it is untouched).
fn lower_class_field_runes<'a>(stmt: &mut Statement<'a>, state: &ServerTransformState<'a>) {
    let Statement::ClassDeclaration(class) = stmt else {
        return;
    };
    let b = state.b;
    for element in class.body.body.iter_mut() {
        let oxc_ast::ast::ClassElement::PropertyDefinition(prop) = element else {
            continue;
        };
        let Some(rune) = prop.value.as_ref().and_then(detect_decl_rune) else {
            continue;
        };
        // Take the `$state(...)` / `$derived(...)` call out and move its first
        // argument expression (the rehomed call already lives in the state
        // allocator, so we can move sub-nodes out of it directly — no re-parse).
        let Some(OxcExpression::CallExpression(call)) = prop.value.take() else {
            continue;
        };
        let mut call = call.unbox();
        let mut arg: Option<OxcExpression<'a>> = call
            .arguments
            .drain(..)
            .next()
            .and_then(|a| OxcExpression::try_from(a).ok());
        if let Some(e) = arg.as_mut() {
            super::read_wrap::wrap_reads(
                e,
                b,
                state.analysis,
                state.analysis.root.instance_scope_index,
            );
        }

        prop.value = match rune {
            // `$state(x)` → `x`; no-arg `$state()` → bare field (`None`).
            DeclRune::State => arg,
            DeclRune::Derived => arg.map(|e| b.call("$.derived", vec![b.thunk(e, false)])),
            DeclRune::DerivedBy => arg.map(|e| b.call("$.derived", vec![e])),
            // `$props` / `$props.id` are not valid class-field runes — drop value.
            DeclRune::Props | DeclRune::PropsId => None,
        };
    }
}

/// Lower a single `VariableDeclaration` (runes branch). Returns the rebuilt
/// statement, or `None` if every declarator was dropped.
fn lower_variable_declaration<'a>(
    vd: &oxc_ast::ast::VariableDeclaration,
    src: &str,
    state: &mut ServerTransformState<'a>,
) -> Option<Statement<'a>> {
    let b = state.b;
    let kind = match vd.kind {
        VariableDeclarationKind::Const => VariableDeclarationKind::Const,
        VariableDeclarationKind::Var => VariableDeclarationKind::Var,
        _ => VariableDeclarationKind::Let,
    };

    let mut decls: Vec<(oxc_ast::ast::BindingPattern<'a>, Option<OxcExpression<'a>>)> = Vec::new();

    for d in vd.declarations.iter() {
        let rune = d.init.as_ref().and_then(detect_decl_rune);
        match rune {
            None => {
                // Non-rune declarator: re-parse the whole declarator span as a
                // `let <decl>;` so the pattern + (unchanged) init survive verbatim.
                let slice = &src[d.span.start as usize..d.span.end as usize];
                if let Some((pat, init)) = state.reparse_declarator(slice, kind) {
                    decls.push((pat, init));
                }
            }
            Some(DeclRune::PropsId) => { /* drop */ }
            Some(DeclRune::Props) => {
                // `<pattern> = $props()` → `<expanded-pattern> = $$props`, where
                // the expansion injects `$$slots` / `$$events` deconfliction
                // properties for the object-with-rest and identifier cases
                // (写经 `VariableDeclaration.js:33-82`).
                let pat_span = d.id.span();
                let pat_slice = &src[pat_span.start as usize..pat_span.end as usize];
                let Some(pat) = state.reparse_pattern(pat_slice) else {
                    continue;
                };
                let pat = expand_props_pattern(pat, state);
                decls.push((pat, Some(b.id("$$props"))));
            }
            Some(rune) => {
                // Lower the init from the rune; keep the binding pattern verbatim.
                let new_init = lower_decl_init(&rune, d.init.as_ref(), src, state);
                let pat_span = d.id.span();
                let pat_slice = &src[pat_span.start as usize..pat_span.end as usize];
                let Some(pat) = state.reparse_pattern(pat_slice) else {
                    continue;
                };
                decls.push((pat, new_init));
            }
        }
    }

    if decls.is_empty() {
        return None;
    }
    Some(b.var_decl_from_pairs(kind, decls))
}

/// Build the lowered `init` for a detected rune. The call argument source slice
/// is re-parsed into the state allocator (value passthrough — NO read rewriting).
fn lower_decl_init<'a>(
    rune: &DeclRune,
    init: Option<&OxcExpression>,
    src: &str,
    state: &ServerTransformState<'a>,
) -> Option<OxcExpression<'a>> {
    let b = state.b;
    if matches!(rune, DeclRune::Props) {
        return Some(b.id("$$props"));
    }

    // First call argument's source slice (if any).
    let first_arg_slice: Option<&str> = match init {
        Some(OxcExpression::CallExpression(call)) => call
            .arguments
            .first()
            .and_then(|a| a.as_expression())
            .map(|e| {
                let s = e.span();
                &src[s.start as usize..s.end as usize]
            }),
        _ => None,
    };

    let arg_expr = |state: &ServerTransformState<'a>| -> OxcExpression<'a> {
        match first_arg_slice {
            Some(slice) => {
                let mut e = state
                    .reparse_slice_owned(slice)
                    .unwrap_or_else(|| state.b.void0());
                // Read-wrap the init/thunk body so derived/store reads inside a
                // `$state(...)` / `$derived(...)` initializer become getters
                // (e.g. `$derived(a + 1)` thunk → `() => a() + 1`). Mirrors
                // routing script value expressions through `visit_expr`.
                super::read_wrap::wrap_reads(
                    &mut e,
                    state.b,
                    state.analysis,
                    state.analysis.root.instance_scope_index,
                );
                e
            }
            None => state.b.void0(),
        }
    };

    match rune {
        DeclRune::State => Some(arg_expr(state)),
        DeclRune::Derived => Some(b.call("$.derived", vec![b.thunk(arg_expr(state), false)])),
        DeclRune::DerivedBy => Some(b.call("$.derived", vec![arg_expr(state)])),
        DeclRune::Props | DeclRune::PropsId => None,
    }
}

/// Expand a `$props()` LHS pattern with the `$$slots` / `$$events` deconfliction
/// injection (写经 `VariableDeclaration.js:33-82`).
///
/// - `{ x, ...rest }` (object pattern WITH a rest element): splice
///   `$$slots: <slots_name>` and `$$events: $$events` BEFORE the rest (so a
///   `...rest` doesn't pull in those internal props).
/// - `props` (identifier): replace with `{ $$slots: <slots_name>, $$events:
///   $$events, ...props }`.
/// - `{ x }` (object pattern WITHOUT rest) / array pattern: left verbatim.
///
/// `<slots_name>` deconflicts to `$$slots_` when the component also declares
/// `$$slots` separately (`analysis.uses_slots`).
fn expand_props_pattern<'a>(
    pat: oxc_ast::ast::BindingPattern<'a>,
    state: &ServerTransformState<'a>,
) -> oxc_ast::ast::BindingPattern<'a> {
    use oxc_ast::ast::BindingPattern;
    use oxc_span::SPAN;
    let b = state.b;
    let ab = b.ab;
    let slots_name = if state.analysis.uses_slots {
        "$$slots_"
    } else {
        "$$slots"
    };

    // A `{ key: value }` binding property over identifier names. `shorthand`
    // mirrors esrap/estree printing: `{ $$slots }` when key == value, but
    // `{ $$slots: $$slots_ }` when they differ (the `uses_slots` deconfliction).
    let make_prop = |key: &str, value: &str| -> oxc_ast::ast::BindingProperty<'a> {
        let k = ab.property_key_static_identifier(SPAN, b.str(key));
        let v = ab.binding_pattern_binding_identifier(SPAN, b.str(value));
        ab.binding_property(SPAN, k, v, key == value, false)
    };

    match pat {
        BindingPattern::ObjectPattern(obj) if obj.rest.is_some() => {
            let mut obj = obj.unbox();
            // The rest is a separate field in oxc; splicing the two props at the
            // END of `properties` keeps them before the (separately-printed) rest.
            obj.properties.push(make_prop("$$slots", slots_name));
            obj.properties.push(make_prop("$$events", "$$events"));
            BindingPattern::ObjectPattern(ab.alloc(obj))
        }
        BindingPattern::BindingIdentifier(id) => {
            let name = b.str(id.name.as_str());
            let mut props = ab.vec_with_capacity(2);
            props.push(make_prop("$$slots", slots_name));
            props.push(make_prop("$$events", "$$events"));
            let rest_inner = ab.binding_pattern_binding_identifier(SPAN, name);
            let rest = ab.alloc_binding_rest_element(SPAN, rest_inner);
            ab.binding_pattern_object_pattern(SPAN, props, Some(rest))
        }
        // Object pattern WITHOUT rest, or array pattern → verbatim.
        other => other,
    }
}

// ===========================================================================
// LEGACY (non-runes) branch — port of upstream's non-runes
// `VariableDeclaration` / `LabeledStatement` server visitors plus the
// `reactive_statements` hoist+append loop in `transform-server.js`.
// ===========================================================================

/// Parse + lower a single LEGACY (non-runes) script into transformed top-level
/// statements. `import_sink` receives imports to hoist (`None` for module).
///
/// Emitted forms (写经 `VariableDeclaration.js` non-runes `else` branch and
/// `transform-server.js:147-177`):
/// - `import …` → hoisted (dropped from body).
/// - `export let x` → `let x = $$props['x'];`
/// - `export let x = <d>` → `let x = $.fallback($$props['x'], <d>[, true]);`
///   where the fallback shape mirrors `build_fallback`:
///     - simple default → `$.fallback($$props['x'], <d>)`
///     - everything else → `$.fallback($$props['x'], () => <d>, true)`
///       (a no-arg fn call `() => f()` collapses to `f` via `b.thunk`).
/// - plain `let`/`const`/`var`/`function`/`class`/expr → kept (re-parsed);
///   value expressions routed through the read-wrapping pass.
/// - top-level `$: …` → label stripped-but-kept (`$: …`), the statement
///   APPENDED after all other instance statements, and a hoisted
///   `let <legacy_reactive vars>;` prepended (topologically pre-ordered by
///   Phase 2's `reactive_statements`).
fn transform_script_legacy<'a>(
    script: &Script,
    state: &mut ServerTransformState<'a>,
    mut import_sink: Option<&mut Vec<Statement<'a>>>,
    is_instance: bool,
) -> Vec<Statement<'a>> {
    let (Some(start), Some(end)) = (script.content.start(), script.content.end()) else {
        return Vec::new();
    };
    let (start, end) = (start as usize, end as usize);
    if end <= start || end > state.source.len() {
        return Vec::new();
    }

    // TypeScript components: strip TS from the slice before parsing (see the
    // matching note in `transform_script` for the offset-consistency rationale).
    let stripped;
    let src: &str = if super::super::helpers::script_is_typescript(script) {
        stripped = crate::compiler::phases::phase2_analyze::types::strip_typescript(
            &state.source[start..end],
        );
        &stripped
    } else {
        &state.source[start..end]
    };

    let alloc = oxc_allocator::Allocator::default();
    let owned = alloc.alloc_str(src);
    let ret = oxc_parser::Parser::new(&alloc, owned, oxc_span::SourceType::mjs()).parse();
    if !ret.diagnostics.is_empty() {
        return Vec::new();
    }

    let mut out: Vec<Statement<'a>> = Vec::new();
    // Reactive `$:` statements are appended AFTER all other statements (mirrors
    // upstream's `for (const [node] of analysis.reactive_statements) instance
    // .body.push(statement[1])`). Collected here, flushed at the end.
    let mut reactive: Vec<Statement<'a>> = Vec::new();
    // legacy_reactive var names that need a hoisted `let <names>;` declaration.
    let mut reactive_decl_names: Vec<String> = Vec::new();

    for stmt in ret.program.body.iter() {
        match stmt {
            Statement::ImportDeclaration(imp) => {
                let slice = &src[imp.span.start as usize..imp.span.end as usize];
                if let Some(rehomed) = state.reparse_statement(slice) {
                    match import_sink.as_deref_mut() {
                        Some(sink) => sink.push(rehomed),
                        None => out.push(rehomed),
                    }
                }
            }
            Statement::ExportNamedDeclaration(exp) => {
                if !is_instance {
                    // MODULE script: `export const FOO = 1` is a REAL ES module
                    // export, not a prop — upstream's `server_module` keeps it
                    // verbatim (export keyword included). Re-parse the whole
                    // statement span.
                    let span = exp.span();
                    let slice = &src[span.start as usize..span.end as usize];
                    if let Some(rehomed) = state.reparse_statement(slice) {
                        out.push(rehomed);
                    }
                    continue;
                }
                // INSTANCE script: `export let x …` → props (the `export` keyword
                // is dropped and the declaration prop-lowered, mirroring upstream's
                // `ExportNamedDeclaration` global visitor `return
                // context.visit(node.declaration)` feeding the non-runes
                // `VariableDeclaration` branch).
                let Some(decl) = exp.declaration.as_ref() else {
                    // `export { a, b }` with no declaration → dropped (`b.empty`).
                    continue;
                };
                match decl {
                    oxc_ast::ast::Declaration::VariableDeclaration(vd) => {
                        if let Some(lowered) = lower_legacy_var_decl(vd, src, state, true) {
                            out.push(lowered);
                        }
                    }
                    other => {
                        // `export function` / `export class` → keep the inner
                        // declaration verbatim (re-parsed from its source span).
                        let span = other.span();
                        let slice = &src[span.start as usize..span.end as usize];
                        if let Some(rehomed) = state.reparse_statement(slice) {
                            out.push(rehomed);
                        }
                    }
                }
            }
            Statement::VariableDeclaration(vd) => {
                if let Some(lowered) = lower_legacy_var_decl(vd, src, state, false) {
                    out.push(lowered);
                }
            }
            Statement::LabeledStatement(ls) if is_instance && ls.label.name.as_str() == "$" => {
                // Top-level legacy reactive `$:` statement. Upstream keeps the
                // `$` label (people may `break $`) and appends the body to the
                // instance run after everything else.
                let span = ls.span();
                let slice = &src[span.start as usize..span.end as usize];
                if let Some(rehomed) = state.reparse_statement(slice) {
                    // Hoist `let <name>;` for any legacy_reactive binding
                    // assigned to by this statement (写经 the `extract_identifiers`
                    // + `legacy_reactive` check). We detect `$: <name> = …`.
                    collect_legacy_reactive_decls(&ls.body, state, &mut reactive_decl_names);
                    reactive.push(rehomed);
                }
            }
            Statement::ExpressionStatement(es) => {
                if is_removed_effect_stmt(&es.expression) {
                    continue;
                }
                let slice = &src[es.span.start as usize..es.span.end as usize];
                if let Some(rehomed) = state.reparse_statement(slice) {
                    out.push(rehomed);
                }
            }
            other => {
                let span = other.span();
                let slice = &src[span.start as usize..span.end as usize];
                if let Some(rehomed) = state.reparse_statement(slice) {
                    out.push(rehomed);
                }
            }
        }
    }

    // Prepend the hoisted `let <reactive vars>;` declaration (if any) and append
    // the reactive statements at the end. `reactive_statements` (Phase 2) already
    // gives the topological order; we use Phase-2's iteration order via the
    // collected names, deduped, matching upstream's `legacy_reactive_declarations`
    // unshift.
    if !reactive_decl_names.is_empty() {
        let b = state.b;
        let pairs: Vec<_> = reactive_decl_names
            .iter()
            .map(|n| (b.id_pat(n), None))
            .collect();
        out.insert(
            0,
            b.var_decl_from_pairs(VariableDeclarationKind::Let, pairs),
        );
    }
    out.extend(reactive);
    out
}

/// Lower a legacy `VariableDeclaration`. `is_export` marks `export let …`
/// declarators whose simple-identifier bindings are bindable props.
fn lower_legacy_var_decl<'a>(
    vd: &oxc_ast::ast::VariableDeclaration,
    src: &str,
    state: &mut ServerTransformState<'a>,
    is_export: bool,
) -> Option<Statement<'a>> {
    let b = state.b;
    let kind = match vd.kind {
        VariableDeclarationKind::Const => VariableDeclarationKind::Const,
        VariableDeclarationKind::Var => VariableDeclarationKind::Var,
        _ => VariableDeclarationKind::Let,
    };

    let mut decls: Vec<(oxc_ast::ast::BindingPattern<'a>, Option<OxcExpression<'a>>)> = Vec::new();

    for d in vd.declarations.iter() {
        // An `export let <id>` declarator with a simple identifier binding that
        // resolves to a bindable/normal prop → lower to `$$props['<alias>']`.
        let prop_name: Option<String> = if is_export {
            if let oxc_ast::ast::BindingPattern::BindingIdentifier(id) = &d.id {
                Some(legacy_prop_alias(state, id.name.as_str()))
            } else {
                None
            }
        } else {
            None
        };

        if let Some(alias) = prop_name {
            // `let x = $$props['alias']` or `… = $.fallback($$props['alias'], …)`.
            let pat_span = d.id.span();
            let pat_slice = &src[pat_span.start as usize..pat_span.end as usize];
            let Some(pat) = state.reparse_pattern(pat_slice) else {
                continue;
            };
            let prop = b.member_computed(b.id("$$props"), b.string(&alias));
            let init = match d.init.as_ref() {
                None => prop,
                Some(init) => {
                    let init_span = init.span();
                    let dslice = &src[init_span.start as usize..init_span.end as usize];
                    let mut default_expr = state
                        .reparse_slice_owned(dslice)
                        .unwrap_or_else(|| b.void0());
                    super::read_wrap::wrap_reads(
                        &mut default_expr,
                        b,
                        state.analysis,
                        state.analysis.root.instance_scope_index,
                    );
                    build_legacy_fallback(state, prop, default_expr, init)
                }
            };
            decls.push((pat, Some(init)));
            continue;
        }

        // Plain (non-export, or non-identifier-export) declarator. Re-parse the
        // whole declarator and route its init through read-wrapping.
        let slice = &src[d.span.start as usize..d.span.end as usize];
        if let Some((pat, mut init)) = state.reparse_declarator(slice, kind) {
            if let Some(init) = init.as_mut() {
                super::read_wrap::wrap_reads(
                    init,
                    b,
                    state.analysis,
                    state.analysis.root.instance_scope_index,
                );
            }
            decls.push((pat, init));
        }
    }

    if decls.is_empty() {
        return None;
    }
    Some(b.var_decl_from_pairs(kind, decls))
}

/// Resolve the prop alias for an `export let <name>` binding (`prop_alias ?? name`).
fn legacy_prop_alias(state: &ServerTransformState, name: &str) -> String {
    if let Some(idx) = state
        .analysis
        .root
        .get_binding(name, state.analysis.root.instance_scope_index)
    {
        let binding = &state.analysis.root.bindings[idx];
        if let Some(alias) = &binding.prop_alias {
            return alias.clone();
        }
    }
    name.to_string()
}

/// Build the `$.fallback(...)` init for an `export let x = <default>` (写经
/// `build_fallback`): a simple default value emits `$.fallback(prop, default)`;
/// anything else emits `$.fallback(prop, () => default, true)` (the thunk
/// auto-collapses a bare no-arg call `() => f()` to `f`).
fn build_legacy_fallback<'a>(
    state: &ServerTransformState<'a>,
    prop: OxcExpression<'a>,
    default_expr: OxcExpression<'a>,
    raw_init: &OxcExpression,
) -> OxcExpression<'a> {
    let b = state.b;
    if is_simple_default(raw_init) {
        b.call("$.fallback", vec![prop, default_expr])
    } else {
        let thunk = b.thunk(default_expr, false);
        b.call("$.fallback", vec![prop, thunk, b.id("true")])
    }
}

/// Whether the classification-AST `init` expression is a "simple" default value
/// per upstream's `is_simple_expression` (Literal / Identifier / Arrow / Fn,
/// and Conditional / Binary / Logical recursively over simple operands).
fn is_simple_default(init: &OxcExpression) -> bool {
    use OxcExpression as E;
    match init {
        E::BooleanLiteral(_)
        | E::NullLiteral(_)
        | E::NumericLiteral(_)
        | E::BigIntLiteral(_)
        | E::RegExpLiteral(_)
        | E::StringLiteral(_)
        | E::Identifier(_)
        | E::ArrowFunctionExpression(_)
        | E::FunctionExpression(_) => true,
        E::ConditionalExpression(c) => {
            is_simple_default(&c.test)
                && is_simple_default(&c.consequent)
                && is_simple_default(&c.alternate)
        }
        E::BinaryExpression(bin) => is_simple_default(&bin.left) && is_simple_default(&bin.right),
        E::LogicalExpression(l) => is_simple_default(&l.left) && is_simple_default(&l.right),
        _ => false,
    }
}

/// Collect the legacy_reactive var names assigned to by a `$: <name> = …` body,
/// so a hoisted `let <name>;` is emitted (写经 the `extract_identifiers` walk
/// over the assignment LHS, filtered to `binding.kind === 'legacy_reactive'`).
fn collect_legacy_reactive_decls(
    body: &Statement,
    state: &ServerTransformState,
    out: &mut Vec<String>,
) {
    let Statement::ExpressionStatement(es) = body else {
        return;
    };
    let OxcExpression::AssignmentExpression(assign) = &es.expression else {
        return;
    };
    let mut names: Vec<String> = Vec::new();
    collect_assignment_target_idents(&assign.left, &mut names);
    for name in names {
        if let Some(idx) = state
            .analysis
            .root
            .get_binding(&name, state.analysis.root.instance_scope_index)
        {
            if state.analysis.root.bindings[idx].kind == BindingKind::LegacyReactive
                && !out.contains(&name)
            {
                out.push(name);
            }
        }
    }
}

/// Extract identifier names from an assignment target (simple id, or destructure
/// array/object pattern leaves).
fn collect_assignment_target_idents(
    target: &oxc_ast::ast::AssignmentTarget,
    out: &mut Vec<String>,
) {
    use oxc_ast::ast::AssignmentTarget as T;
    match target {
        T::AssignmentTargetIdentifier(id) => out.push(id.name.to_string()),
        T::ArrayAssignmentTarget(arr) => {
            for el in arr.elements.iter().flatten() {
                collect_assignment_maybe_default(el, out);
            }
            if let Some(rest) = &arr.rest {
                collect_assignment_target_idents(&rest.target, out);
            }
        }
        T::ObjectAssignmentTarget(obj) => {
            for prop in obj.properties.iter() {
                match prop {
                    oxc_ast::ast::AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(
                        p,
                    ) => out.push(p.binding.name.to_string()),
                    oxc_ast::ast::AssignmentTargetProperty::AssignmentTargetPropertyProperty(p) => {
                        collect_assignment_maybe_default(&p.binding, out);
                    }
                }
            }
            if let Some(rest) = &obj.rest {
                collect_assignment_target_idents(&rest.target, out);
            }
        }
        // A member-expression target (`obj.x = …`) declares nothing.
        _ => {}
    }
}

/// Handle an `AssignmentTargetMaybeDefault` element (`x` or `x = default`).
fn collect_assignment_maybe_default(
    el: &oxc_ast::ast::AssignmentTargetMaybeDefault,
    out: &mut Vec<String>,
) {
    use oxc_ast::ast::AssignmentTargetMaybeDefault as M;
    match el {
        M::AssignmentTargetWithDefault(d) => collect_assignment_target_idents(&d.binding, out),
        other => {
            if let Some(t) = other.as_assignment_target() {
                collect_assignment_target_idents(t, out);
            }
        }
    }
}

/// Public entry: transform the instance script into component-body statements,
/// pushing any imports onto `state.hoisted`.
pub fn transform_instance<'a>(
    ast: &crate::ast::template::Root,
    state: &mut ServerTransformState<'a>,
) -> Vec<Statement<'a>> {
    let Some(script) = ast.instance.as_deref() else {
        return Vec::new();
    };
    let mut imports: Vec<Statement<'a>> = Vec::new();
    let body = if state.analysis.runes {
        transform_script(script, state, Some(&mut imports))
    } else {
        transform_script_legacy(script, state, Some(&mut imports), true)
    };
    for imp in imports {
        state.hoisted.push(imp);
    }
    body
}

/// Public entry: transform the module script into module-scope statements.
pub fn transform_module<'a>(
    ast: &crate::ast::template::Root,
    state: &mut ServerTransformState<'a>,
) -> Vec<Statement<'a>> {
    let Some(script) = ast.module.as_deref() else {
        return Vec::new();
    };
    if state.analysis.runes {
        transform_script(script, state, None)
    } else {
        // Module (non-runes): no instance-scope props / reactive `$:` (a
        // top-level `$:` in a module body is NOT a reactive statement), so
        // `is_instance = false`.
        transform_script_legacy(script, state, None, false)
    }
}
