//! Upstream's `validate_opening_tag`: a block or tag whose sigil does not follow its `{`.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{TemplateNode, TokenType};

use super::super::error;
use super::Template;

/// The sigil upstream expects right after the `{` of `node`, if it checks one.
const fn sigil(node: &TemplateNode) -> Option<char> {
    match node {
        TemplateNode::If { elseif: true, .. } => Some(':'),
        TemplateNode::If { .. }
        | TemplateNode::Each { .. }
        | TemplateNode::Await { .. }
        | TemplateNode::Key { .. }
        | TemplateNode::Snippet { .. } => Some('#'),
        TemplateNode::Html { .. }
        | TemplateNode::Const { .. }
        | TemplateNode::Debug { .. }
        | TemplateNode::Render { .. } => Some('@'),
        _ => None,
    }
}

impl Template<'_> {
    pub(super) fn opening_tag(&mut self, node: &TemplateNode) {
        let Some(sigil) = sigil(node) else { return };
        let span = node.span();
        // The parser records `{` alone only when whitespace comes before the sigil.
        let spaced = self
            .context
            .component
            .tokens
            .within(span)
            .first()
            .is_some_and(|token| token.kind == TokenType::MustacheOpen);
        if !spaced {
            return;
        }
        // Upstream marks the first five UTF-16 code units.
        let text = &self.context.source[span.start_offset as usize..];
        let mut units = 0;
        let end = text
            .char_indices()
            .find_map(|(at, c)| {
                units += c.len_utf16();
                (units >= 5).then_some(at + c.len_utf8())
            })
            .unwrap_or(text.len());
        let found = error(
            "block_unexpected_character",
            &format!("Expected a `{sigil}` character immediately following the opening bracket"),
            Span::new(span.start_offset, span.start_offset + end as u32),
        );
        self.error(span, found);
    }
}
