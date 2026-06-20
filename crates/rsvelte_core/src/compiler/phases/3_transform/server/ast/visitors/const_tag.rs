//! AST-based server `{@const}` (ConstTag) visitor.
//!
//! Rust port of upstream
//! `submodules/svelte/packages/svelte/src/compiler/phases/3-transform/server/visitors/ConstTag.js`.
//!
//! Upstream's sync path is:
//! ```js
//! const declaration = node.declaration.declarations[0];
//! const id   = context.visit(declaration.id);
//! const init = context.visit(declaration.init);
//! context.state.init.push(b.const(id, init));
//! ```
//! i.e. a `const <pattern> = <visited init>;` statement.
//!
//! Upstream pushes the const onto `state.init` (hoisted to the TOP of the
//! enclosing Fragment block). The text-based `transform_server` oracle this
//! pipeline is compared against instead emits the const **inline** at the
//! ConstTag's position in the child run (it does not maintain a separate `init`
//! buffer). To stay byte-compatible with that oracle, this visitor emits the
//! const as a [`TemplateEntry::Stmt`] at the current position — which flushes
//! the joinable text/expression run (mirroring `process_children`'s
//! statement-break behaviour) so the `const` precedes the sibling
//! `$$renderer.push(...)` that reads it.
//!
//! ## Async path (写经 `ConstTag.js` / `DeclarationTag.js::add_async_declaration`)
//!
//! When a `{@const}` has an awaited initializer (`{@const a = await 1}`) — or
//! depends on a binding that does (`{@const b = a + 1}` after `a`, or a
//! top-level `$$promises[N]` blocker) — upstream replaces the inline `const`
//! with a `$$renderer.run([...])` group: each declared binding becomes a bare
//! `let <name>;` and its assignment becomes a thunk in `state.async_consts`
//! (`add_async_declaration`). A blocker that lives in a DIFFERENT group is
//! pushed as a leading wait thunk (`() => <blocker>`). The
//! [`build_fragment_body`](super::shared::build_fragment_body) prepends
//! `let a; let b; var promises = $$renderer.run([thunks…]);` ahead of the
//! template, and every template read of a blocked binding is wrapped in
//! `$$renderer.async([<blocker>], …)` via the per-fragment
//! [`ServerTransformState::const_blocker_map`].
//!
//! The gate mirrors upstream's `has_await || context.state.async_consts ||
//! blockers.length > 0`: once any const in a block opens a group, every later
//! const joins it (so a sync `const c = a + 1` reading an async `a` becomes a
//! sequential thunk rather than reading `a` before its thunk has run).
//!
//! Sync `{@const}` (no await, no blocker, no open group) is UNCHANGED — it still
//! emits a `const <pattern> = <init>;` [`TemplateEntry::Stmt`].

use super::shared::TemplateEntry;
use crate::ast::template::ConstTag;
use crate::compiler::phases::phase3_transform::server::ast::{
    AsyncConstsGroup, ServerTransformState,
};

/// Visit a `{@const <pattern> = <init>}` tag — async path
/// ([`add_async_const`]) when blocked, else the sync `const … = …;` statement.
pub fn visit_const_tag<'a>(node: &ConstTag, state: &mut ServerTransformState<'a>) {
    if try_async_const(node, state) {
        return;
    }
    visit_const_tag_sync(node, state);
}

/// Sync `{@const}` — push a `const <pattern> = <init>;` statement.
fn visit_const_tag_sync<'a>(node: &ConstTag, state: &mut ServerTransformState<'a>) {
    // `node.declaration` is the parsed `VariableDeclaration` (stored as an
    // `Expression` for AST-walker uniformity). Pull the single declarator's
    // `id` (pattern) and `init` source spans from its JSON view, mirroring the
    // text oracle's source-slice decomposition.
    let decl_json = node.declaration.as_json();
    let Some(declarators) = decl_json.get("declarations").and_then(|d| d.as_array()) else {
        return;
    };
    let Some(declarator) = declarators.first() else {
        return;
    };

    let span = |v: &serde_json::Value, key: &str| -> Option<(usize, usize)> {
        let obj = v.get(key)?;
        let s = obj.get("start").and_then(|n| n.as_u64())? as usize;
        let e = obj.get("end").and_then(|n| n.as_u64())? as usize;
        (e > s && e <= state.source.len()).then_some((s, e))
    };

    // LHS pattern — reparsed verbatim (identifier or destructuring pattern).
    let Some((id_start, id_end)) = span(declarator, "id") else {
        return;
    };
    let id_src = state.source[id_start..id_end].trim();
    let Some(pattern) = state.reparse_pattern(id_src) else {
        return;
    };

    // RHS init — reparsed and read-wrapped so derived / store reads inside the
    // initializer become getter calls, matching `visit_expr`'s wrapping.
    let init = match span(declarator, "init") {
        Some((s, e)) => {
            let mut init_expr = state.reparse_slice(s, e);
            super::super::read_wrap::wrap_reads(
                &mut init_expr,
                state.b,
                state.analysis,
                state.analysis.root.instance_scope_index,
            );
            Some(init_expr)
        }
        None => None,
    };

    let stmt = state.b.const_decl(pattern, init);
    // A `{@const}` is a hoistable declaration: the text oracle lifts it to the top
    // of the enclosing fragment block (upstream `state.init`), preserving its
    // source order relative to sibling `{@const}` / `{#snippet}` declarations.
    state.template.push(TemplateEntry::HoistableDecl(stmt));
}

/// Try the async `{@const}` path. Returns `true` when the const was handled as
/// an async-declaration (`$$renderer.run([...])` thunk + `let <name>;`), `false`
/// when it is a plain sync const (caller falls back to [`visit_const_tag_sync`]).
///
/// 写经 `ConstTag.js` + `DeclarationTag.js::add_async_declaration`: decode the
/// `<lhs> = <rhs>` declarator, decide async via `has_await ||
/// state.async_consts.is_some() || blockers > 0`, and on the async branch build
/// the bare `let`s + thunk(s) into [`ServerTransformState::async_consts`].
fn try_async_const<'a>(node: &ConstTag, state: &mut ServerTransformState<'a>) -> bool {
    let start = node.declaration.start().unwrap_or(0) as usize;
    let end = node.declaration.end().unwrap_or(0) as usize;
    if end <= start || end > state.source.len() {
        return false;
    }
    let declaration_source = state.source[start..end].trim().to_string();

    // Split `<lhs> = <rhs>`.
    let Some(eq_idx) = find_assignment_eq(&declaration_source) else {
        return false;
    };
    let lhs = declaration_source[..eq_idx].trim().to_string();
    let rhs = declaration_source[eq_idx + 1..].trim().to_string();

    let has_await = node.metadata.expression.has_await();

    // Compute cross-group blockers for the referenced bindings (写经
    // `generate_const_tag`): a referenced binding registered in a DIFFERENT
    // `const_blocker_map` group, or a top-level `$$promises[N]` blocker,
    // contributes a wait thunk. Same-group deps are ordered implicitly by the
    // sequential `$$renderer.run([...])` execution, so they are skipped.
    let init_refs = extract_identifiers_from_expr(&rhs);
    let current_group_name = state.async_consts.as_ref().map(|g| g.name.clone());
    let mut blockers: Vec<String> = Vec::new();
    for name in &init_refs {
        if let Some(blocker_expr) = state.const_blocker_map.get(name) {
            if let Some(ref group_name) = current_group_name
                && blocker_expr.starts_with(&format!("{group_name}["))
            {
                continue;
            }
            if !blockers.contains(blocker_expr) {
                blockers.push(blocker_expr.clone());
            }
        } else if let Some(&idx) = state.eval_inputs.top_level_blocker_map.get(name) {
            let blocker_expr = format!("$$promises[{idx}]");
            if !blockers.contains(&blocker_expr) {
                blockers.push(blocker_expr);
            }
        }
    }

    // Gate: `has_await || context.state.async_consts || blockers.length > 0`.
    if !has_await && state.async_consts.is_none() && blockers.is_empty() {
        return false;
    }

    add_async_const(state, &lhs, &rhs, has_await, &blockers);
    true
}

/// 写经 `add_async_declaration`: create/reuse the per-fragment async group, emit
/// a bare `let <name>;` for each declared binding, push the (optional) leading
/// blocker wait thunk and the assignment thunk, and register each binding's
/// `promises[N]` blocker in the per-fragment [`ServerTransformState::const_blocker_map`].
fn add_async_const<'a>(
    state: &mut ServerTransformState<'a>,
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

    let declared_names = extract_declared_names(lhs);

    // Bare `let <name>;` for each declared binding (kept on the group so the
    // fragment body can prepend them ahead of the `var promises = run([...])`).
    for name in &declared_names {
        let let_stmt = state.b.let_id(name, None);
        state
            .async_consts
            .as_mut()
            .unwrap()
            .let_decls
            .push(let_stmt);
    }

    // Leading blocker wait thunk(s) — a different-group dependency must resolve
    // before this thunk's assignment runs.
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

    // The assignment thunk. An awaited RHS routes through `$.save` (writing the
    // inner `await x` as `(await $.save(x))()`); a destructuring LHS parenthesises
    // the assignment so the arrow body is an expression, not a block. (写经 the
    // 5.55.3+ expression-bodied form.)
    let is_destructuring = lhs.starts_with('{') || lhs.starts_with('[');
    let thunk_code = if has_await {
        let save_wrapped =
            crate::compiler::phases::phase3_transform::server::helpers::transform_await_to_save(
                rhs,
            );
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
    for name in &declared_names {
        let blocker_expr = format!("{group_name}[{thunk_index}]");
        state.const_blocker_map.insert(name.clone(), blocker_expr);
    }
}

/// Find the top-level `=` (assignment) in a declarator string, skipping
/// `==` / `=>` / `!=` / `<=` / `>=` and bracketed regions. Byte-indexed (all
/// matched tokens are ASCII). 写经 the legacy `find_assignment_eq`.
fn find_assignment_eq(decl: &str) -> Option<usize> {
    let bytes = decl.as_bytes();
    let mut depth = 0i32;
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'{' | b'[' | b'(' => depth += 1,
            b'}' | b']' | b')' => depth -= 1,
            b'=' if depth == 0 => {
                let next = bytes.get(i + 1).copied().unwrap_or(0);
                if next != b'=' && next != b'>' {
                    let prev = if i > 0 { bytes[i - 1] } else { 0 };
                    if prev != b'!' && prev != b'<' && prev != b'>' {
                        return Some(i);
                    }
                }
            }
            _ => {}
        }
        i += 1;
    }
    None
}

/// Declared binding names from a const LHS (simple identifier or destructuring).
fn extract_declared_names(lhs: &str) -> Vec<String> {
    let trimmed = lhs.trim();
    if !trimmed.is_empty()
        && trimmed
            .chars()
            .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
    {
        return vec![trimmed.to_string()];
    }
    extract_identifiers_from_expr(lhs)
}

/// Identifier names referenced in an expression string. A lightweight word-scan
/// that skips string / template literals and property keys after `.`. Good
/// enough for blocker / dependency detection (writes the same set the text
/// oracle's `extract_identifiers_from_expr` does for the const-tag cases).
fn extract_identifiers_from_expr(expr: &str) -> Vec<String> {
    let mut idents = Vec::new();
    let chars: Vec<char> = expr.chars().collect();
    let len = chars.len();
    let mut i = 0;
    let mut prev_dot = false;
    while i < len {
        let c = chars[i];
        // Skip string / template literals wholesale.
        if c == '\'' || c == '"' || c == '`' {
            let q = c;
            i += 1;
            while i < len {
                if chars[i] == '\\' {
                    i += 2;
                    continue;
                }
                if chars[i] == q {
                    i += 1;
                    break;
                }
                i += 1;
            }
            prev_dot = false;
            continue;
        }
        if c.is_alphabetic() || c == '_' || c == '$' {
            let start = i;
            while i < len && (chars[i].is_alphanumeric() || chars[i] == '_' || chars[i] == '$') {
                i += 1;
            }
            let word: String = chars[start..i].iter().collect();
            // Skip property accesses (`obj.prop`) and keywords that never name a
            // reactive binding.
            let is_keyword = matches!(
                word.as_str(),
                "await"
                    | "true"
                    | "false"
                    | "null"
                    | "undefined"
                    | "new"
                    | "typeof"
                    | "void"
                    | "in"
                    | "of"
                    | "instanceof"
            );
            if !prev_dot && !is_keyword && !idents.contains(&word) {
                idents.push(word);
            }
            prev_dot = false;
            continue;
        }
        prev_dot = c == '.';
        i += 1;
    }
    idents
}
