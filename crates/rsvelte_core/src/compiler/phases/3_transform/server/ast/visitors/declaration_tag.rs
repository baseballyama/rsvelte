//! AST-based server `{let …}` / `{const …}` (DeclarationTag) visitor.
//!
//! Rust port of upstream
//! `submodules/svelte/packages/svelte/src/compiler/phases/3-transform/server/visitors/DeclarationTag.js`.
//!
//! The `DeclarationTag` node is the loose-mustache declaration form introduced in
//! Svelte 5.56.0 (#18282): `{let x = $state(1)}` / `{const y = …}` /
//! `{let a = …, b = …}` (multiple declarators). Unlike `{@const}` (ConstTag), it
//! preserves the user's `let` / `const` keyword and may declare a mutable
//! (`let`) binding.
//!
//! Upstream's sync path is simply:
//! ```js
//! const declaration = context.visit(node.declaration); // VariableDeclaration
//! context.state.init.push(declaration);                // hoisted to top of fragment
//! ```
//! i.e. it routes the parsed `VariableDeclaration` through the SAME
//! `VariableDeclaration.js` server visitor used for the instance script — which
//! lowers `$state(e)` → `e`, `$derived(e)` → `$.derived(() => e)`,
//! `$derived.by(f)` → `$.derived(f)` per declarator — then pushes the lowered
//! declaration onto `state.init` (hoisted to the front of the enclosing
//! Fragment block, exactly like a `{@const}`).
//!
//! This visitor mirrors that: it reparses the tag body into a
//! `VariableDeclaration` statement (preserving the `let` / `const` keyword via
//! the parsed `kind`), lowers each declarator's `$state` / `$derived` /
//! `$derived.by` rune in place, read-wraps each initializer so derived / store
//! reads inside an initializer become getter calls (`d` → `d()`,
//! `$x` → `$.store_get(…)`), and pushes the result as a
//! [`TemplateEntry::HoistableDecl`] — the same hoisted slot the ConstTag visitor
//! uses, so a declaration tag precedes the sibling `$$renderer.push(…)` that
//! reads it.
//!
//! The async path (`metadata.promises_id`, awaited / blocked initializer) is a
//! KNOWN GAP — it mirrors the equally-deferred async ConstTag axis and is tracked
//! by the `async-declaration-tag*` fixtures. The sync case (the overwhelming
//! majority — every `declaration-tags*` runtime fixture) ships here.

use super::shared::TemplateEntry;
use crate::ast::template::DeclarationTag;
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use crate::compiler::phases::phase3_transform::server::ast::script::{DeclRune, detect_decl_rune};
use oxc_ast::ast::{Expression as OxcExpression, Statement};

/// Visit a `{let …}` / `{const …}` declaration tag — lower its declarators and
/// emit the resulting `let`/`const` declaration as a hoistable statement.
pub fn visit_declaration_tag<'a>(node: &DeclarationTag, state: &mut ServerTransformState<'a>) {
    let start = node.declaration.start().unwrap_or(0) as usize;
    let end = node.declaration.end().unwrap_or(0) as usize;
    if end <= start || end > state.source.len() {
        return;
    }
    // Reparse the parsed `VariableDeclaration`'s source verbatim. The span on
    // `node.declaration` covers exactly `let x = …` / `const y = …` (the keyword
    // through the final declarator), so a trailing `;` is appended for a clean
    // statement parse.
    let mut decl_src = state.source[start..end].trim().to_string();
    if !decl_src.ends_with(';') {
        decl_src.push(';');
    }

    let Some(mut stmt) = state.reparse_statement(&decl_src) else {
        return;
    };
    let Statement::VariableDeclaration(vd) = &mut stmt else {
        return;
    };

    let b = state.b;
    // Lower each declarator's rune in place, mirroring the identifier-pattern
    // branch of upstream `VariableDeclaration.js` (runes mode). Destructured
    // `$state` / `$derived` patterns are an orthogonal axis (the `$$d` /
    // `$$derived_array` expansion) not exercised by the `declaration-tags*`
    // fixtures, so an identifier pattern is handled here and any other shape
    // falls through to a plain (read-wrapped) declarator.
    for d in vd.declarations.iter_mut() {
        let Some(rune) = d.init.as_ref().and_then(detect_decl_rune) else {
            // Plain (non-rune) declarator — leave the init for read-wrapping.
            continue;
        };
        let is_ident = matches!(&d.id, oxc_ast::ast::BindingPattern::BindingIdentifier(_));
        if !is_ident {
            // Non-identifier rune pattern: leave as-is (out of scope here).
            continue;
        }
        // Pull the first call argument out of the rune call.
        let arg: Option<OxcExpression<'a>> = match d.init.take() {
            Some(OxcExpression::CallExpression(call)) => {
                let mut call = call.unbox();
                call.arguments
                    .drain(..)
                    .next()
                    .and_then(|a| OxcExpression::try_from(a).ok())
            }
            _ => None,
        };
        match rune {
            DeclRune::State => {
                // `$state(e)` / `$state.raw(e)` → `e` (no-arg → `void 0`).
                d.init = Some(arg.unwrap_or_else(|| b.void0()));
            }
            DeclRune::Derived => {
                // `$derived(e)` → `$.derived(() => e)`.
                d.init = arg.map(|e| b.call("$.derived", vec![b.thunk(e, false)]));
            }
            DeclRune::DerivedBy => {
                // `$derived.by(f)` → `$.derived(f)`.
                d.init = arg.map(|e| b.call("$.derived", vec![e]));
            }
            // `$props` / `$props.id` are not valid in a declaration tag.
            DeclRune::Props | DeclRune::PropsId => {}
        }
    }

    // Read-wrap every initializer: a read of a `$derived` binding (declared
    // here, in another declaration tag, or in the instance script) becomes a
    // getter call, and `$store` reads become `$.store_get(…)`. Mirrors the
    // tree-wide server `Identifier` visitor that fires on the visited
    // `VariableDeclaration`'s initializers.
    if let Statement::VariableDeclaration(vd) = &mut stmt {
        for d in vd.declarations.iter_mut() {
            if let Some(init) = d.init.as_mut() {
                super::super::read_wrap::wrap_reads(
                    init,
                    state.b,
                    state.analysis,
                    state.analysis.root.instance_scope_index,
                );
            }
        }
    }

    // Populate `eval_inputs.constant_vars` for foldable literal declarators so a
    // template read of the binding constant-folds to the literal in
    // `flush_sequence` (mirrors the text oracle's `generate_declaration_tag`
    // tail + upstream `scope.evaluate`). Reactive initializers
    // (`$state(…)` / `$derived(…)`) don't fold and are left out (their reads
    // continue to go through the runtime read-wrap form). The enclosing
    // element / block scope save/restores `constant_vars`, so a nested
    // `{const doubled = 'nested'}` shadow does not leak its fold outward.
    register_constant_folds(node, state);

    state.template.push(TemplateEntry::HoistableDecl(stmt));
}

/// Register every foldable LITERAL identifier declarator of `node` into
/// `state.eval_inputs.constant_vars` (写经 `generate_declaration_tag`'s
/// constant-fold tail). A declarator whose init evaluates to a constant — given
/// the constants already in scope — makes a same-named template read fold to
/// that value. Reactive (`$state` / `$derived`) inits never fold.
fn register_constant_folds<'a>(node: &DeclarationTag, state: &mut ServerTransformState<'a>) {
    let decl_json = node.declaration.as_json();
    let Some(decls) = decl_json.get("declarations").and_then(|d| d.as_array()) else {
        return;
    };
    for d in decls {
        let (Some(id), Some(init)) = (d.get("id"), d.get("init")) else {
            continue;
        };
        if init.is_null() || id.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
            continue;
        }
        let Some(name) = id.get("name").and_then(|n| n.as_str()) else {
            continue;
        };
        let (Some(s), Some(e)) = (
            init.get("start").and_then(|v| v.as_u64()),
            init.get("end").and_then(|v| v.as_u64()),
        ) else {
            continue;
        };
        let (s, e) = (s as usize, e as usize);
        if s >= e || e > state.source.len() {
            continue;
        }
        let rhs = state.source[s..e].trim();
        if let Some(folded) =
            crate::compiler::phases::phase3_transform::server::helpers::try_evaluate_with_constants(
                rhs,
                &state.eval_inputs.constant_vars,
            )
        {
            state
                .eval_inputs
                .constant_vars
                .insert(name.to_string(), folded);
        }
    }
}
