//! HTML comments. Mirrors `htmlxtojsx_v2/nodes/Comment.ts`.

use crate::ast::template::Comment;
use crate::svelte2tsx::magic_string::MagicString;

#[cfg(test)]
use crate::svelte2tsx::template::ctx::record_element_opener_comment_range_visits;
use crate::svelte2tsx::template::ctx::with_element_opener_comments;

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
pub(crate) fn comments_in_opener_range(start: u32, end: u32) -> Vec<(u32, u32)> {
    if start >= end {
        return Vec::new();
    }
    with_element_opener_comments(|comments| {
        let contained = comments.contained_in(start, end);
        #[cfg(test)]
        record_element_opener_comment_range_visits(contained.len());
        contained.to_vec()
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::svelte2tsx::template::ctx::{
        clear_element_opener_comments, element_opener_comment_range_visits,
        reset_element_opener_comment_range_visits, set_element_opener_comments,
    };

    #[test]
    fn opener_range_query_is_sorted_and_excludes_boundary_crossing_comments() {
        set_element_opener_comments(vec![(45, 49), (30, 42), (20, 25), (5, 9)]);
        reset_element_opener_comment_range_visits();

        let actual = comments_in_opener_range(10, 40);

        assert_eq!(actual, vec![(20, 25)]);
        assert_eq!(element_opener_comment_range_visits(), 1);
        clear_element_opener_comments();
    }
}
