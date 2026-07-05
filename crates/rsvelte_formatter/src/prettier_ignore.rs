//! Helpers for `<!-- prettier-ignore -->` support.
//!
//! When an HTML comment containing exactly `prettier-ignore` precedes a node
//! in a Svelte template, that node should be emitted verbatim — no formatting
//! edits are applied to it or any of its descendants.
//!
//! "Preceding" is defined as: the comment is the previous *meaningful* node in
//! the same fragment, where whitespace-only `Text` nodes between the comment
//! and the target node are transparent (they don't count as a meaningful
//! separator).

use rsvelte_core::ast::template::TemplateNode;

/// Returns `true` when `node` is an `<!-- prettier-ignore -->` comment.
pub(crate) fn is_prettier_ignore_comment(node: &TemplateNode) -> bool {
    matches!(node, TemplateNode::Comment(c) if c.data.trim() == "prettier-ignore")
}

/// Given the slice of all nodes in a fragment and an index `i`, returns
/// `true` when the node at `i` is immediately preceded (in the
/// "meaningful previous" sense) by a `<!-- prettier-ignore -->` comment.
///
/// A whitespace-only `Text` node between the comment and the target is
/// transparent and does not break the "immediately preceding" relationship.
pub(crate) fn preceded_by_prettier_ignore(nodes: &[TemplateNode], i: usize) -> bool {
    if i == 0 {
        return false;
    }
    // Walk backward from i-1, skipping whitespace-only Text nodes.
    let mut j = i - 1;
    loop {
        let node = &nodes[j];
        if is_whitespace_only_text(node) {
            if j == 0 {
                return false;
            }
            j -= 1;
            continue;
        }
        return is_prettier_ignore_comment(node);
    }
}

fn is_whitespace_only_text(node: &TemplateNode) -> bool {
    matches!(node, TemplateNode::Text(t) if crate::is_blank_text(t.data.as_str()))
}
