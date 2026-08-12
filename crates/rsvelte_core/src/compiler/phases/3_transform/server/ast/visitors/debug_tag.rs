//! AST-based server `{@debug}` (DebugTag) visitor.
//!
//! Rust port of upstream
//! `submodules/svelte/packages/svelte/src/compiler/phases/3-transform/server/visitors/DebugTag.js`.
//!
//! Upstream pushes (via `create_child_block`) the statements
//! ```js
//! console.log({ <id>: <visited id>, ... });
//! debugger;
//! ```
//! into `state.template`. `create_child_block(statements, blockers, false)`
//! returns the bare `statements` when there are no blockers (the common,
//! sync case), so for a blocker-free `{@debug a, b}` the two statements land
//! directly on the template — flushed as opaque [`TemplateEntry::Stmt`]s by
//! `build_template`. This matches the text-based `transform_server` oracle,
//! which emits `console.log({ ... }); debugger;` (and a lone `debugger;` for
//! `{@debug}` with no identifiers).
//!
//! ## Async path (写经 `DebugTag.js` blockers)
//!
//! When a debugged identifier is bound to an async-blocked value, upstream
//! computes `blockers = node.identifiers.map((id) => scope.get(id.name)?.blocker)`
//! and wraps the `console.log(...) / debugger` pair in
//! `$$renderer.async_block([…], …)` via `create_child_block`. We mirror that by
//! looking each debugged name up in the instance blocker map (`$$promises[N]`)
//! and the per-block `const_blocker_map` (`promises[N]`).

use super::shared::{
    TemplateEntry, create_child_block_combined, expr_local_const_blockers, expr_text_blockers,
};
use crate::ast::template::DebugTag;
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use oxc_ast::ast::ObjectPropertyKind;

/// Visit a `{@debug a, b, ...}` tag, pushing `console.log({ a, b })` (omitted
/// when there are no identifiers) followed by `debugger;` (sync, blocker-free
/// path).
pub fn visit_debug_tag<'a>(node: &DebugTag, state: &mut ServerTransformState<'a>) {
    let b = state.b;

    // Collect the async blockers of the debugged identifiers (instance
    // `$$promises[N]` + per-block `promises[N]`), in identifier order, deduped —
    // 写经 `node.identifiers.map((id) => scope.get(id.name)?.blocker)`.
    let mut blocker_set = std::collections::BTreeSet::new();
    let mut local_blockers: Vec<String> = Vec::new();

    let mut statements: Vec<oxc_ast::ast::Statement<'a>> = Vec::new();

    if !node.identifiers.is_empty() {
        let mut props: Vec<ObjectPropertyKind<'a>> = Vec::with_capacity(node.identifiers.len());
        for ident in &node.identifiers {
            // Key: the identifier's source name (so the object key matches the
            // debugged variable). Value: the read-wrapped identifier expression.
            let name = match (ident.start(), ident.end()) {
                (Some(s), Some(e))
                    if (e as usize) > (s as usize) && (e as usize) <= state.source.len() =>
                {
                    state.source[s as usize..e as usize].trim().to_string()
                }
                _ => continue,
            };
            for idx in expr_text_blockers(state, &name) {
                blocker_set.insert(idx);
            }
            for src in expr_local_const_blockers(state, &name) {
                if !local_blockers.contains(&src) {
                    local_blockers.push(src);
                }
            }
            let value = state.visit_expr(ident);
            // `b.init(name, value)` with key == identifier prints shorthand
            // (`{ name }`) via esrap, matching upstream's `b.prop('init', id, id)`.
            props.push(b.init(&name, value));
        }
        let log = b.call("console.log", vec![b.object(props)]);
        statements.push(b.stmt(log));
    }

    statements.push(b.debugger());

    let blocker_indices: Vec<usize> = blocker_set.into_iter().collect();
    let wrapped =
        create_child_block_combined(state, statements, &blocker_indices, &local_blockers, false);
    for stmt in wrapped {
        state.template.push(TemplateEntry::Stmt(stmt));
    }
}
