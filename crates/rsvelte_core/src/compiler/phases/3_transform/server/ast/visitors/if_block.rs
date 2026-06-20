//! Server `IfBlock` visitor — the Rust port of
//! `3-transform/server/visitors/IfBlock.js` (sync path).
//!
//! Upstream (写経):
//! ```js
//! export function IfBlock(node, context) {
//!     const consequent = context.visit(node.consequent);          // b.block([...])
//!     consequent.body.unshift($$renderer.push('<!--[0-->'));
//!     let if_statement = b.if(context.visit(node.test), consequent);
//!     let index = 1, current_if = if_statement, alt = node.alternate;
//!     for (const elseif of node.metadata.flattened ?? []) {       // else-if chain
//!         const branch = context.visit(elseif.consequent);
//!         branch.body.unshift($$renderer.push(`<!--[${index++}-->`));
//!         current_if = current_if.alternate = b.if(context.visit(elseif.test), branch);
//!         alt = elseif.alternate;
//!     }
//!     const final_alternate = alt ? context.visit(alt) : b.block([]);
//!     final_alternate.body.unshift($$renderer.push('<!--[-1-->'));
//!     current_if.alternate = final_alternate;
//!     context.state.template.push(
//!         ...create_child_block([if_statement], blockers, has_await),  // sync: just [if_statement]
//!         block_close                                                  // `<!--]-->`
//!     );
//! }
//! ```
//!
//! Each branch's BlockStatement gets a marker push **un­shifted** to its front
//! (`<!--[0-->` consequent, `<!--[1-->`, `<!--[2-->`, … for else-ifs, `<!--[-1-->`
//! for the final else). The whole `if/else-if/else` chain is one `Stmt`, followed
//! by a `<!--]-->` close literal.
//!
//! rsvelte models `{:else if}` not via `metadata.flattened` but as the
//! `alternate` Fragment whose single meaningful child is an `IfBlock` with
//! `elseif == true`. We walk that nested chain here (mirroring the text-based
//! oracle's `build_if_statement` flattener).
//!
//! KNOWN GAP: the async path (`create_child_block` wrapping when the test has
//! blockers / `has_await`) is not ported — sync if-blocks only.

use crate::ast::template::{Fragment, IfBlock, TemplateNode};
use crate::compiler::phases::phase3_transform::builders::B;
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use oxc_ast::ast::Statement;

use super::shared::{BLOCK_CLOSE, TemplateEntry, build_fragment_body};

/// Visit a `{#if test}...{:else if}...{:else}...{/if}` block (sync path).
pub fn visit_if_block<'a>(node: &IfBlock, state: &mut ServerTransformState<'a>) {
    let if_stmt = build_if_chain(node, 0, state);
    state.template.push(TemplateEntry::Stmt(if_stmt));
    // `block_close` (`<!--]-->`) literal after the chain.
    state
        .template
        .push(TemplateEntry::Literal(BLOCK_CLOSE.to_string()));
}

/// Build the `if (...) {...} else if (...) {...} else {...}` statement for an
/// IfBlock, walking the `{:else if}` chain and assigning branch markers
/// `<!--[0-->`, `<!--[1-->`, … and the final `<!--[-1-->`.
fn build_if_chain<'a>(
    node: &IfBlock,
    consequent_marker_index: i32,
    state: &mut ServerTransformState<'a>,
) -> Statement<'a> {
    let b = state.b;
    let test = state.visit_expr(&node.test);

    // Consequent block, with its branch marker unshifted to the front.
    let consequent = build_branch_block(&node.consequent, consequent_marker_index, state);

    // Resolve the alternate: either a flattenable else-if (nested IfBlock with
    // elseif=true) or a terminal else / nothing.
    let alternate = build_alternate(node.alternate.as_ref(), consequent_marker_index + 1, state);

    b.if_stmt(test, consequent, Some(alternate))
}

/// Build the `else` arm. If `frag` is a single `{:else if}` (nested IfBlock with
/// `elseif == true`), recurse to flatten it into an `else if`; otherwise emit a
/// terminal `else { <!--[-1--> ... }` block (or an empty-body else when absent).
fn build_alternate<'a>(
    frag: Option<&Fragment>,
    next_marker_index: i32,
    state: &mut ServerTransformState<'a>,
) -> Statement<'a> {
    let b = state.b;

    if let Some(frag) = frag {
        if let Some(nested) = single_elseif(frag) {
            // Flatten: the `else` arm is itself the nested if-statement, whose
            // own consequent marker is the running index.
            return build_if_chain(nested, next_marker_index, state);
        }
        // Terminal else with body — marker `<!--[-1-->`.
        return build_branch_block(frag, -1, state);
    }

    // No alternate at all — upstream still emits `else { $$renderer.push('<!--[-1-->'); }`.
    let marker = marker_push(b, -1);
    b.block(vec![marker])
}

/// If `frag`'s single meaningful child is an `{:else if}` IfBlock (`elseif ==
/// true`), return it; otherwise `None` (a real `{:else}` body).
fn single_elseif(frag: &Fragment) -> Option<&IfBlock> {
    let meaningful: Vec<&TemplateNode> = frag
        .nodes
        .iter()
        .filter(|n| !is_whitespace_text(n))
        .collect();
    if meaningful.len() == 1 {
        if let TemplateNode::IfBlock(inner) = meaningful[0] {
            if inner.elseif {
                return Some(inner);
            }
        }
    }
    None
}

fn is_whitespace_text(node: &TemplateNode) -> bool {
    matches!(node, TemplateNode::Text(t) if t.data.trim().is_empty())
}

/// Build a branch `BlockStatement` for `frag`, with the branch marker push
/// (`$$renderer.push('<!--[N-->')`) unshifted to the front of the body.
fn build_branch_block<'a>(
    frag: &Fragment,
    marker_index: i32,
    state: &mut ServerTransformState<'a>,
) -> Statement<'a> {
    // IfBlock consequent/alternate is NOT an `is_text_first` parent.
    let mut body = build_fragment_body(frag, false, state);
    let marker = marker_push(state.b, marker_index);
    body.insert(0, marker);
    state.b.block(body)
}

/// `$$renderer.push('<!--[N-->');` — a branch open marker as a single-quoted
/// string literal (matching upstream `b.literal(...)` and the text oracle).
fn marker_push<'a>(b: B<'a>, index: i32) -> Statement<'a> {
    let marker = format!("<!--[{index}-->");
    b.stmt(b.call("$$renderer.push", vec![b.string(&marker)]))
}
