//! Server `IfBlock` visitor — the Rust port of
//! `3-transform/server/visitors/IfBlock.js`.
//!
//! Upstream (写经):
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
//!         ...create_child_block([if_statement], blockers, has_await),
//!         block_close                                                  // `<!--]-->`
//!     );
//! }
//! ```
//!
//! Each branch's BlockStatement gets a marker push **un­shifted** to its front
//! (`<!--[0-->` consequent, `<!--[1-->`, `<!--[2-->`, … for else-ifs, `<!--[-1-->`
//! for the final else). The whole `if/else-if/else` chain is one `Stmt`, possibly
//! wrapped by `create_child_block`, followed by a `<!--]-->` close literal.
//!
//! rsvelte models `{:else if}` not via `metadata.flattened` but as the
//! `alternate` Fragment whose single meaningful child is an `IfBlock` with
//! `elseif == true`. We walk that nested chain here.
//!
//! ## Async path (写经 `metadata.flattened` gate + `create_child_block`)
//!
//! Phase 2's `IfBlock` analyzer only flattens an else-if into the parent chain
//! when the else-if's test has NO `await` AND no MORE blockers than the parent
//! test (`!elseif.has_await && !elseif.has_more_blockers_than(node)`). An else-if
//! that introduces an await / new blocker stays a SEPARATE `IfBlock` in the
//! alternate, so it gets its own `create_child_block` wrap when re-visited.
//!
//! - `consequent_marker` markers run `<!--[0-->`, `<!--[1-->`, … for each
//!   *flattened* arm; the final else is `<!--[-1-->`.
//! - The aggregate blockers / `has_await` of the WHOLE flattened chain drive the
//!   top-level `create_child_block`: blockers → `$$renderer.async_block([…], …)`,
//!   `has_await` → the arrow is `async`. Sync if-blocks (no blockers, no await)
//!   pass through `create_child_block` verbatim — output is UNCHANGED.
//! - An await-bearing test is `$.save`-wrapped via [`save_wrap_expr_text`]:
//!   `await foo > 10` → `(await $.save(foo))() > 10`.

use crate::ast::template::{Fragment, IfBlock, TemplateNode};
use crate::compiler::phases::phase3_transform::builders::B;
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use oxc_ast::ast::Statement;

use super::shared::{
    BLOCK_CLOSE, TemplateEntry, build_fragment_body, create_child_block_combined,
    expr_local_const_blockers, expr_text_blockers, save_wrap_expr_text, text_has_await,
};

/// Visit a `{#if test}...{:else if}...{:else}...{/if}` block.
pub fn visit_if_block<'a>(node: &IfBlock, state: &mut ServerTransformState<'a>) {
    // Aggregate blockers + has_await over the FLATTENED chain (this test plus
    // every else-if that flattens into it). Mirrors
    // `node.metadata.expression.blockers()` / `.has_await` — those metadata
    // fields already account for the merged flattened-chain expressions.
    let mut blocker_set = std::collections::BTreeSet::new();
    let mut local_blockers: Vec<String> = Vec::new();
    let mut has_await = false;
    collect_chain_async(
        node,
        state,
        &mut blocker_set,
        &mut local_blockers,
        &mut has_await,
    );
    let blocker_indices: Vec<usize> = blocker_set.into_iter().collect();

    let if_stmt = build_if_chain(node, 0, state);
    let wrapped = create_child_block_combined(
        state,
        vec![if_stmt],
        &blocker_indices,
        &local_blockers,
        has_await,
    );
    for stmt in wrapped {
        state.template.push(TemplateEntry::Stmt(stmt));
    }
    // `block_close` (`<!--]-->`) literal after the chain.
    state
        .template
        .push(TemplateEntry::Literal(BLOCK_CLOSE.to_string()));
}

/// Walk the flattened chain (this IfBlock + the else-ifs that flatten into it)
/// accumulating blocker indices and `has_await` from each arm's TEST. Stops
/// recursing at an else-if that does NOT flatten (its own test has await OR new
/// blockers) — that arm gets its own `create_child_block` when re-visited.
fn collect_chain_async(
    node: &IfBlock,
    state: &ServerTransformState,
    blockers: &mut std::collections::BTreeSet<usize>,
    local_blockers: &mut Vec<String>,
    has_await: &mut bool,
) {
    if let Some(text) = state.expr_source(&node.test) {
        for idx in expr_text_blockers(state, text) {
            blockers.insert(idx);
        }
        // Per-block async `{@const}` blockers (e.g. `promises[1]`): collected as
        // ordered source strings, deduped, appended after the instance blockers.
        for src in expr_local_const_blockers(state, text) {
            if !local_blockers.contains(&src) {
                local_blockers.push(src);
            }
        }
        if text_has_await(text) {
            *has_await = true;
        }
    }
    if let Some(alt) = node.alternate.as_ref()
        && let Some(nested) = single_elseif(alt)
        && flattens_into(nested, node, state)
    {
        collect_chain_async(nested, state, blockers, local_blockers, has_await);
    }
}

/// Whether `elseif`'s test flattens into `parent`'s chain — i.e. it has no
/// inline `await` and introduces no blocker that `parent`'s test doesn't already
/// carry. 写经 `2-analyze/visitors/IfBlock.js`:
/// `!elseif.has_await && !elseif.has_more_blockers_than(parent)`.
fn flattens_into(elseif: &IfBlock, parent: &IfBlock, state: &ServerTransformState) -> bool {
    let elseif_text = state.expr_source(&elseif.test).unwrap_or("");
    if text_has_await(elseif_text) {
        return false;
    }
    let parent_text = state.expr_source(&parent.test).unwrap_or("");
    let parent_blockers: std::collections::BTreeSet<usize> =
        expr_text_blockers(state, parent_text).into_iter().collect();
    // `has_more_blockers_than`: any blocker in `elseif` not present in `parent`.
    let instance_ok = expr_text_blockers(state, elseif_text)
        .into_iter()
        .all(|b| parent_blockers.contains(&b));
    if !instance_ok {
        return false;
    }
    // Same check for per-block async-const blockers: an else-if that reads a
    // local blocker the parent test does not already carry stays a SEPARATE
    // IfBlock (it gets its own `async_block` wrap when re-visited).
    let parent_local: std::collections::BTreeSet<String> =
        expr_local_const_blockers(state, parent_text)
            .into_iter()
            .collect();
    expr_local_const_blockers(state, elseif_text)
        .into_iter()
        .all(|b| parent_local.contains(&b))
}

/// Build the `if (...) {...} else if (...) {...} else {...}` statement for an
/// IfBlock, walking the FLATTENABLE `{:else if}` chain and assigning branch
/// markers `<!--[0-->`, `<!--[1-->`, … and the final `<!--[-1-->`.
fn build_if_chain<'a>(
    node: &IfBlock,
    consequent_marker_index: i32,
    state: &mut ServerTransformState<'a>,
) -> Statement<'a> {
    let b = state.b;
    let test = build_test(node, state);

    // Consequent block, with its branch marker unshifted to the front.
    let consequent = build_branch_block(&node.consequent, consequent_marker_index, state);

    // Resolve the alternate.
    let alternate = build_alternate(node, consequent_marker_index + 1, state);

    b.if_stmt(test, consequent, Some(alternate))
}

/// Build the test expression: `$.save`-wrapped when it has an inline await,
/// otherwise the read-wrapped expression. 写经 `context.visit(node.test)` where
/// the nested `AwaitExpression` visitor applies `save(argument)`.
fn build_test<'a>(
    node: &IfBlock,
    state: &mut ServerTransformState<'a>,
) -> oxc_ast::ast::Expression<'a> {
    if let Some(text) = state.expr_source(&node.test)
        && text_has_await(text)
    {
        return save_wrap_expr_text(state, text);
    }
    state.visit_expr(&node.test)
}

/// Build the `else` arm. If `frag` is a single FLATTENABLE `{:else if}` (nested
/// IfBlock with `elseif == true` whose test flattens into `node`), recurse to
/// build it inline as `else if`. Otherwise emit a terminal `else { <!--[-1-->
/// ... }` block — where `...` is the alternate fragment's body. A NON-flattening
/// else-if (await / new blockers) lives in that fragment as a nested IfBlock and
/// is re-visited via [`build_fragment_body`], producing its OWN
/// `create_child_block` wrap + `<!--]-->` close.
fn build_alternate<'a>(
    node: &IfBlock,
    next_marker_index: i32,
    state: &mut ServerTransformState<'a>,
) -> Statement<'a> {
    let b = state.b;

    if let Some(frag) = node.alternate.as_ref() {
        // A single FLATTENABLE `{:else if}` recurses inline as `else if`.
        if let Some(nested) = single_elseif(frag)
            && flattens_into(nested, node, state)
        {
            return build_if_chain(nested, next_marker_index, state);
        }
        // Otherwise a terminal `else { <!--[-1--> ... }` — either a real
        // `{:else}` body, or a NON-flattening else-if (await / new blockers)
        // living in the fragment as a nested IfBlock that `build_fragment_body`
        // re-visits, producing its OWN `create_child_block` wrap + `<!--]-->`.
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
    if meaningful.len() == 1
        && let TemplateNode::IfBlock(inner) = meaningful[0]
        && inner.elseif
    {
        return Some(inner);
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
    let mut body = build_fragment_body(frag, false, false, state);
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
