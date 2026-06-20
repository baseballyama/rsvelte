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
//! 写经 GAP — the async / blocker path (`create_child_block(..., blockers,
//! ...)` wrapping the log in `$$renderer.async_block([...], ...)` when a debugged
//! identifier is bound to an async-blocked value) is NOT ported here. The text
//! oracle still handles that shape.

use super::shared::TemplateEntry;
use crate::ast::template::DebugTag;
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use oxc_ast::ast::ObjectPropertyKind;

/// Visit a `{@debug a, b, ...}` tag, pushing `console.log({ a, b })` (omitted
/// when there are no identifiers) followed by `debugger;` (sync, blocker-free
/// path).
pub fn visit_debug_tag<'a>(node: &DebugTag, state: &mut ServerTransformState<'a>) {
    let b = state.b;

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
            let value = state.visit_expr(ident);
            // `b.init(name, value)` with key == identifier prints shorthand
            // (`{ name }`) via esrap, matching upstream's `b.prop('init', id, id)`.
            props.push(b.init(&name, value));
        }
        let log = b.call("console.log", vec![b.object(props)]);
        state.template.push(TemplateEntry::Stmt(b.stmt(log)));
    }

    state.template.push(TemplateEntry::Stmt(b.debugger()));
}
