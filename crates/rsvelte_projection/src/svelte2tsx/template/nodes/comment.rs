//! HTML comments. Mirrors `htmlxtojsx_v2/nodes/Comment.ts`.

use crate::ast::template::Comment;
use crate::svelte2tsx::magic_string::MagicString;

/// Handle an HTML comment node.
///
/// Comments are blanked out in the TSX output.
pub fn handle_comment(comment: &Comment, str: &mut MagicString<'_>) {
    if comment.start >= comment.end {
        return;
    }
    str.overwrite(comment.start, comment.end, "");
}
