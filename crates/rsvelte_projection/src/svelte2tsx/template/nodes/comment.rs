//! HTML comments. Mirrors `htmlxtojsx_v2/nodes/Comment.ts`.

use crate::ast::template::Comment;
use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::template::ctx::ElementOpenerCommentIndex;

/// Handle an HTML comment node.
///
/// Comments are blanked out in the TSX output.
pub(crate) fn handle_comment(comment: &Comment, str: &mut MagicString<'_>) {
    if comment.start >= comment.end {
        return;
    }
    str.overwrite(comment.start, comment.end, "");
}

/// Comments (from the per-compile set) whose source range lies fully within
/// `[start, end)`, sorted by start. Used to preserve `{/* c */ expr}` comments.
pub(crate) fn comments_in_opener_range(
    comments: &ElementOpenerCommentIndex,
    start: u32,
    end: u32,
) -> &[(u32, u32)] {
    if start >= end {
        return &[];
    }
    let contained = comments.contained_in(start, end);
    #[cfg(test)]
    comments.record_range_visits(contained.len());
    contained
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn opener_range_query_is_sorted_and_excludes_boundary_crossing_comments() {
        let comments = ElementOpenerCommentIndex::new([(45, 49), (30, 42), (20, 25), (5, 9)]);
        comments.reset_range_visits();

        let actual = comments_in_opener_range(&comments, 10, 40);

        assert_eq!(actual, [(20, 25)]);
        assert_eq!(comments.range_visits(), 1);
    }
}
