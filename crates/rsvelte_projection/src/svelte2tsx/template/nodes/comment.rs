//! HTML comments. Mirrors `htmlxtojsx_v2/nodes/Comment.ts`.

use crate::ast::template::Comment;
use crate::svelte2tsx::magic_string::MagicString;

use crate::svelte2tsx::template::ctx::ELEMENT_OPENER_COMMENTS;

/// Handle an HTML comment node.
///
/// Comments are blanked out in the TSX output.
pub(crate) fn handle_comment(comment: &Comment, str: &mut MagicString) {
    if comment.start >= comment.end {
        return;
    }
    str.overwrite(comment.start, comment.end, "");
}

/// Comments (from the per-compile set) whose source range lies fully within
/// `[start, end)`, sorted by start. Used to preserve `{/* c */ expr}` comments.
pub(crate) fn comments_in_opener_range(start: u32, end: u32) -> Vec<(u32, u32)> {
    if start >= end {
        return Vec::new();
    }
    ELEMENT_OPENER_COMMENTS.with(|c| {
        let mut v: Vec<(u32, u32)> = c
            .borrow()
            .iter()
            .copied()
            .filter(|&(s, e)| s >= start && e <= end)
            .collect();
        v.sort_by_key(|&(s, _)| s);
        v
    })
}
