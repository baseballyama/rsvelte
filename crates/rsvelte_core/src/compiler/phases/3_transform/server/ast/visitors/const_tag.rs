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
//! 写经 GAP — the async / blocker path (`node.metadata.promises_id` →
//! `add_async_declaration`, i.e. the `$$renderer.run([...])` lowering for a
//! `{@const x = await ...}` / blocker-dependent initializer) is NOT ported here.
//! Async const tags are still handled only by the string oracle.

use super::shared::TemplateEntry;
use crate::ast::template::ConstTag;
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;

/// Visit a `{@const <pattern> = <init>}` tag and push a
/// `const <pattern> = <init>;` statement (sync path).
pub fn visit_const_tag<'a>(node: &ConstTag, state: &mut ServerTransformState<'a>) {
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
    state.template.push(TemplateEntry::Stmt(stmt));
}
