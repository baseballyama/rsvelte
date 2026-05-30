//! DeclarationTag client transform visitor.
//!
//! Mirrors `phases/3-transform/client/visitors/DeclarationTag.js` from the
//! upstream Svelte compiler (Svelte 5.56.0 #18282).
//!
//! The new `{let x = …}` / `{const x = …}` template syntax declares a
//! mutable / immutable binding that lives inside the surrounding block's
//! template scope. The transform reuses the same rune-rewrite pipeline that
//! handles instance-script declarations so `let x = $state(1)` lowers to
//! `let x = $.state(1)`, `let y = $derived(x * 2)` lowers to
//! `let y = $.derived(() => $.get(x) * 2)`, and so on. The lowered
//! declaration is pushed onto `state.consts` so it sits at the start of the
//! enclosing block body, just like a `{@const}`.
//!
//! The async-blocker path (`metadata.promises_id` set) is intentionally not
//! covered yet — those `async-declaration-tag*` fixtures continue to fail
//! and are left for a follow-up so the synchronous path can land first.

use crate::ast::template::DeclarationTag;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::nodes::JsStatement;

/// Visit a declaration tag.
///
/// Extracts the tag's source text (between the outer `{` and `}`), runs it
/// through the shared instance-script rune-rewrite pipeline, and emits the
/// transformed declaration as a raw statement in `state.consts`. The raw
/// emission path is used because the rewritten text already carries all of
/// the runtime wiring (`$.state(...)`, `$.derived(...)`, `$.get(...)`, etc.)
/// and the AST round-trip would lose that work.
pub fn declaration_tag(node: &DeclarationTag, context: &mut ComponentContext) {
    let source = &context.state.analysis.source;
    let start = node.start as usize;
    let end = node.end as usize;
    if start >= end || end > source.len() {
        return;
    }
    let raw = &source[start..end];
    // Strip the surrounding `{` and `}`. Conservative: only strip a single
    // `{` / `}` pair on each side.
    let body = raw
        .strip_prefix('{')
        .and_then(|s| s.strip_suffix('}'))
        .unwrap_or(raw)
        .trim();
    if body.is_empty() {
        return;
    }

    // Ensure the statement ends with `;` so the rune-rewriting pipeline (which
    // expects script-like input) can parse and re-emit it cleanly.
    let mut script_input = String::with_capacity(body.len() + 2);
    script_input.push_str(body);
    if !body.ends_with(';') {
        script_input.push(';');
    }
    script_input.push('\n');

    let transformed = crate::compiler::phases::phase3_transform::client::transform_instance_script_for_visitors_pub(
        &script_input,
        context.state.analysis,
        context.state.options.dev,
        &[],
    );

    let trimmed = transformed.trim();
    if trimmed.is_empty() {
        return;
    }

    context
        .state
        .consts
        .push(JsStatement::Raw(trimmed.to_string().into()));
}
