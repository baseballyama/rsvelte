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

use super::const_tag::{extract_declared_names, extract_identifiers_from_expr, find_assignment_eq};
use super::shared::TemplateEntry;
use crate::ast::template::DeclarationTag;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;
use crate::compiler::phases::phase3_transform::server::ast::script::{DeclRune, detect_decl_rune};
use crate::compiler::phases::phase3_transform::server::ast::{
    AsyncConstsGroup, ServerTransformState,
};
use oxc_ast::ast::{Expression as OxcExpression, Statement};

/// Visit a `{let …}` / `{const …}` declaration tag — lower its declarators and
/// emit the resulting `let`/`const` declaration as a hoistable statement.
pub fn visit_declaration_tag<'a>(node: &DeclarationTag, state: &mut ServerTransformState<'a>) {
    let start = node.declaration.start().unwrap_or(0) as usize;
    let end = node.declaration.end().unwrap_or(0) as usize;
    if end <= start || end > state.source.len() {
        return;
    }

    // Async path (写经 `DeclarationTag.js::add_async_declaration` +
    // `generate_declaration_tag`'s async branch): an awaited / blocked
    // initializer — `{let x = $state(await …)}`, `{const y = $derived(await …)}`,
    // `{let z = $state(awaited_binding)}` — lowers to a bare `let name;` per
    // binding plus a deferred assignment thunk collected into the per-fragment
    // `$$renderer.run([…])` group, with cross-group blocker wait thunks. Returns
    // `true` when handled here; falls through to the sync AST lowering otherwise.
    if try_async_declaration_tag(node, state) {
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

/// Try the async DeclarationTag path. Returns `true` when the tag was emitted as
/// an async declaration (`let name;` + `$$renderer.run([...])` thunk), `false`
/// for a plain sync declaration (caller falls back to the AST sync lowering).
///
/// 写经 the text oracle's `generate_declaration_tag` async branch: lower the tag
/// body through the SAME server rune-rewrite the instance script uses (so
/// `$state(e)` → `e`, `$derived(e)` → `$.derived(() => e)`, and an async
/// `$derived(await …)` → `await $.async_derived(() => e)`), split `<lhs> = <rhs>`,
/// compute cross-group blockers, and gate via
/// `has_await || !blockers.is_empty() || async_consts.is_some()`.
fn try_async_declaration_tag<'a>(
    node: &DeclarationTag,
    state: &mut ServerTransformState<'a>,
) -> bool {
    let start = node.declaration.start().unwrap_or(0) as usize;
    let end = node.declaration.end().unwrap_or(0) as usize;
    if end <= start || end > state.source.len() {
        return false;
    }

    // Strip a surrounding `{ … }` (the tag braces) and append `;` so the rune
    // transformer sees a clean `let x = $state(1)` statement.
    let raw = state.source[start..end].trim();
    let body = raw
        .strip_prefix('{')
        .and_then(|s| s.strip_suffix('}'))
        .unwrap_or(raw)
        .trim();
    if body.is_empty() {
        return false;
    }
    let mut script_input = String::with_capacity(body.len() + 2);
    script_input.push_str(body);
    if !body.ends_with(';') {
        script_input.push(';');
    }
    script_input.push('\n');

    // Seed the component's `$derived` binding names so a read of a `$derived`
    // declared elsewhere is server-wrapped to `d()` (Svelte 5.56.1 #18348).
    let derived_names: rustc_hash::FxHashSet<String> = state
        .analysis
        .root
        .bindings
        .iter()
        .filter(|b| matches!(b.kind, BindingKind::Derived))
        .map(|b| b.name.clone())
        .collect();
    let imported_names = rustc_hash::FxHashSet::default();
    let transformed =
        crate::compiler::phases::phase3_transform::server::transform_script::transform_script_content_with_imports_and_derived(
            &script_input,
            &imported_names,
            &derived_names,
            false,
        );
    let trimmed = transformed.trim();
    if trimmed.is_empty() {
        return false;
    }
    let stmt = if trimmed.ends_with(';') {
        trimmed.to_string()
    } else {
        format!("{trimmed};")
    };

    let has_await = node.metadata.expression.has_await();
    let body_no_semi = stmt.trim_end().trim_end_matches(';').trim();
    let after_kw = body_no_semi
        .strip_prefix("let ")
        .or_else(|| body_no_semi.strip_prefix("const "))
        .or_else(|| body_no_semi.strip_prefix("var "))
        .unwrap_or(body_no_semi)
        .trim();

    let Some(eq_idx) = find_assignment_eq(after_kw) else {
        return false;
    };
    let lhs = after_kw[..eq_idx].trim().to_string();
    let rhs = after_kw[eq_idx + 1..].trim().to_string();

    let init_refs = extract_identifiers_from_expr(&rhs);
    let blockers = compute_decl_tag_blockers(state, &init_refs);

    if !has_await && blockers.is_empty() && state.async_consts.is_none() {
        return false;
    }

    let declared_names = extract_declared_names(&lhs);
    // For a destructuring LHS, take the assignment-target pattern text from the
    // RAW source `id` span so a binding whose name collides with a component
    // `$derived` (`length`) is NOT rewritten to `length()` in the assignment
    // TARGET (reads in the RHS still wrap via the derived rewrite above).
    let lhs_for_assign = if lhs.starts_with('{') || lhs.starts_with('[') {
        raw_declarator_id(node, state).unwrap_or_else(|| lhs.clone())
    } else {
        lhs.clone()
    };

    emit_async_decl_tag(
        state,
        &declared_names,
        &lhs_for_assign,
        &rhs,
        has_await,
        &blockers,
    );
    true
}

/// Cross-group blockers for a DeclarationTag whose initializer references
/// `init_refs` (mirror of `const_tag.rs::try_async_const`'s blocker scan): a
/// referenced binding in a DIFFERENT `const_blocker_map` group, or a top-level
/// `$$promises[N]` blocker, contributes a wait expression. Same-group deps are
/// ordered implicitly by sequential `$$renderer.run` execution and skipped.
fn compute_decl_tag_blockers(state: &ServerTransformState, init_refs: &[String]) -> Vec<String> {
    let current_group_name = state.async_consts.as_ref().map(|g| g.name.clone());
    let mut blist: Vec<String> = Vec::new();
    for name in init_refs {
        if let Some(blocker_expr) = state.const_blocker_map.get(name) {
            if let Some(ref group_name) = current_group_name
                && blocker_expr.starts_with(&format!("{group_name}["))
            {
                continue;
            }
            if !blist.contains(blocker_expr) {
                blist.push(blocker_expr.clone());
            }
        } else if let Some(&idx) = state.eval_inputs.top_level_blocker_map.get(name) {
            let blocker_expr = format!("$$promises[{idx}]");
            if !blist.contains(&blocker_expr) {
                blist.push(blocker_expr);
            }
        }
    }
    blist
}

/// RAW source text of a single-declarator DeclarationTag's `id` pattern. Used as
/// the un-rewritten assignment target for a destructured async declaration.
fn raw_declarator_id(node: &DeclarationTag, state: &ServerTransformState) -> Option<String> {
    let decl_json = node.declaration.as_json();
    let decls = decl_json.get("declarations").and_then(|d| d.as_array())?;
    if decls.len() != 1 {
        return None;
    }
    let id = decls[0].get("id")?;
    let s = id.get("start").and_then(|v| v.as_u64())? as usize;
    let e = id.get("end").and_then(|v| v.as_u64())? as usize;
    if s >= e || e > state.source.len() {
        return None;
    }
    Some(state.source[s..e].trim().to_string())
}

/// Emit a DeclarationTag through the async-declaration lowering (写经
/// `add_async_declaration` + the oracle's `emit_async_decl_tag`): a bare
/// `let name;` per binding, optional blocker-wait thunk(s), and the deferred
/// assignment thunk — all collected into the per-fragment
/// [`AsyncConstsGroup`]. Each binding's `promises[N]` blocker is registered in
/// [`ServerTransformState::const_blocker_map`] so downstream reactive reads wrap
/// in `$$renderer.async([promises[N]], …)`.
fn emit_async_decl_tag<'a>(
    state: &mut ServerTransformState<'a>,
    declared_names: &[String],
    lhs: &str,
    rhs: &str,
    has_await: bool,
    blockers: &[String],
) {
    if state.async_consts.is_none() {
        let name = state.next_promises_name();
        state.async_consts = Some(AsyncConstsGroup {
            name,
            thunks: Vec::new(),
            let_decls: Vec::new(),
        });
    }

    for name in declared_names {
        let let_stmt = state.b.let_id(name, None);
        state
            .async_consts
            .as_mut()
            .unwrap()
            .let_decls
            .push(let_stmt);
    }

    if blockers.len() == 1 {
        state
            .async_consts
            .as_mut()
            .unwrap()
            .thunks
            .push((format!("() => {}", blockers[0]), false));
    } else if blockers.len() > 1 {
        state.async_consts.as_mut().unwrap().thunks.push((
            format!("() => Promise.all([{}])", blockers.join(", ")),
            false,
        ));
    }

    let is_destructuring = lhs.starts_with('{') || lhs.starts_with('[');
    let thunk_code = if has_await {
        let save_wrapped = if let Some(inner_body) = extract_async_derived_thunk_body(rhs) {
            // RHS is the lowered async-derived shape `await $.async_derived(() =>
            // X)`. Upstream keeps the OUTER `await $.async_derived(...)` untouched
            // and save-wraps the INNER thunk body (re-adding the inner `await` the
            // rune pipeline stripped): `await $.async_derived(async () => (await
            // $.save(X))())`.
            let saved_body =
                crate::compiler::phases::phase3_transform::server::helpers::transform_await_to_save(
                    &format!("await {inner_body}"),
                );
            format!("await $.async_derived(async () => {saved_body})")
        } else {
            // `$state(await …)` — the single outer await is the save target.
            crate::compiler::phases::phase3_transform::server::helpers::transform_await_to_save(rhs)
        };
        if is_destructuring {
            format!("async () => ({lhs} = {save_wrapped})")
        } else {
            format!("async () => {lhs} = {save_wrapped}")
        }
    } else if is_destructuring {
        format!("() => ({lhs} = {rhs})")
    } else {
        format!("() => {lhs} = {rhs}")
    };

    let group = state.async_consts.as_mut().unwrap();
    let thunk_index = group.thunks.len();
    group.thunks.push((thunk_code, has_await));

    let group_name = group.name.clone();
    for name in declared_names {
        let blocker_expr = format!("{group_name}[{thunk_index}]");
        state.const_blocker_map.insert(name.clone(), blocker_expr);
    }
}

/// If `rhs` is the lowered async-derived form `await $.async_derived(<thunk>)`,
/// return the `<thunk>` source (the body inside the matched parens). Mirrors the
/// text oracle's `extract_async_derived_thunk_body`.
fn extract_async_derived_thunk_body(rhs: &str) -> Option<String> {
    let t = rhs.trim();
    const PREFIX: &str = "await $.async_derived(";
    let after = t.strip_prefix(PREFIX)?;
    let bytes = after.as_bytes();
    let mut depth = 1i32;
    let mut i = 0;
    let mut in_str: Option<u8> = None;
    let mut close_idx = None;
    while i < bytes.len() {
        let c = bytes[i];
        if let Some(q) = in_str {
            if c == b'\\' {
                i += 2;
                continue;
            }
            if c == q {
                in_str = None;
            }
            i += 1;
            continue;
        }
        match c {
            b'\'' | b'"' | b'`' => in_str = Some(c),
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => {
                depth -= 1;
                if depth == 0 {
                    close_idx = Some(i);
                    break;
                }
            }
            _ => {}
        }
        i += 1;
    }
    let close = close_idx?;
    // Anything after the matched close paren means this is not a clean
    // `await $.async_derived(<thunk>)` shape.
    if !after[close + 1..].trim().is_empty() {
        return None;
    }
    // Strip the thunk arrow (`() =>` / `async () =>`) so the caller re-wraps the
    // bare expression body with the inner `$.save(...)`.
    let inner = after[..close].trim();
    inner
        .strip_prefix("async () =>")
        .or_else(|| inner.strip_prefix("() =>"))
        .map(|body| body.trim().to_string())
}
