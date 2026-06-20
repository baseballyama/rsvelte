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
//! - `let { … } = $props()` → `let { … } = $$props` (basic object/identifier
//!   pattern; the `$$slots` / `$$events` deconfliction splice is a KNOWN GAP).
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
//! - TypeScript components (`<script lang="ts">`) — skipped (empty body).
//! - async `$derived` (`$derived(await …)`) — lowered as a plain `$.derived`
//!   thunk (no `await $.async_derived(...)`).
//! - complex `$props()` / destructured-`$derived` / destructured-`$state`
//!   patterns (the `extract_paths` expansion) — the binding pattern is kept
//!   verbatim and the init lowered, which is correct for object/identifier
//!   patterns but NOT for the leaf-rename cases.

use super::ServerTransformState;
use crate::ast::template::Script;
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

/// Parse + lower a single script into transformed top-level statements.
/// `import_sink` receives instance-script imports to hoist (`None` for module).
fn transform_script<'a>(
    script: &Script,
    state: &mut ServerTransformState<'a>,
    mut import_sink: Option<&mut Vec<Statement<'a>>>,
) -> Vec<Statement<'a>> {
    // KNOWN GAP: TypeScript components skipped wholesale.
    if super::super::helpers::script_is_typescript(script) {
        return Vec::new();
    }

    let (Some(start), Some(end)) = (script.content.start(), script.content.end()) else {
        return Vec::new();
    };
    let (start, end) = (start as usize, end as usize);
    if end <= start || end > state.source.len() {
        return Vec::new();
    }
    let src = &state.source[start..end];

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

/// Public entry: transform the instance script into component-body statements,
/// pushing any imports onto `state.hoisted`.
pub fn transform_instance<'a>(
    ast: &crate::ast::template::Root,
    state: &mut ServerTransformState<'a>,
) -> Vec<Statement<'a>> {
    let Some(script) = ast.instance.as_deref() else {
        return Vec::new();
    };
    // KNOWN GAP: only the runes branch is implemented.
    if !state.analysis.runes {
        return Vec::new();
    }
    let mut imports: Vec<Statement<'a>> = Vec::new();
    let body = transform_script(script, state, Some(&mut imports));
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
    if !state.analysis.runes {
        return Vec::new();
    }
    transform_script(script, state, None)
}
