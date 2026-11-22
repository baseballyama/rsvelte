//! Text as a JavaScript string or template literal.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::Range;

use super::Printer;
use crate::syntax_tree::{Node, NodeIdentifier};

impl Printer<'_> {
    pub(super) fn node_string_literal(&mut self, value: &str) {
        self.output.push("\"");
        for ch in value.chars() {
            self.character(ch, false);
        }
        self.output.push("\"");
    }

    /// A generated string whose findings fall on the empty range at `at`.
    pub(super) fn string_literal_at(&mut self, value: &str, at: u32) {
        let start = self.output.out.len() as u32;
        self.node_string_literal(value);
        self.output.atom_since(start, Span::new(at, at));
    }

    pub(super) fn computed_string_literal(&mut self, first: NodeIdentifier, len: u32) {
        let text = self.tree.computed_text(first, len);
        self.node_string_literal(&text);
    }

    pub(super) fn string(&mut self, parts: Range, template: bool) {
        let quote = if template { "`" } else { "\"" };
        self.output.push(quote);
        for &part in self.tree.children(parts) {
            if let Node::Text(span) = self.tree.node(part) {
                self.text(span, template);
            } else {
                self.output.push("${");
                self.node(part);
                self.output.push("}");
            }
        }
        self.output.push(quote);
    }

    fn text(&mut self, span: Span, template: bool) {
        let special: &[char] = if template {
            &['`', '\\', '$', '\n', '\r']
        } else {
            &['"', '\\', '\n', '\r']
        };
        let text = span.text(self.source);
        if !text.contains(special) {
            self.output.copy(self.source, span);
            return;
        }
        for (offset, ch) in text.char_indices() {
            self.output.mark(span.start_offset + offset as u32);
            self.character(ch, template);
        }
    }

    fn character(&mut self, ch: char, template: bool) {
        match ch {
            '\n' => self.output.push("\\n"),
            '\r' => self.output.push("\\r"),
            '\\' | '"' if !template => {
                self.output.push_char('\\');
                self.output.push_char(ch);
            }
            '\\' | '`' | '$' if template => {
                self.output.push_char('\\');
                self.output.push_char(ch);
            }
            c => self.output.push_char(c),
        }
    }
}
