use oxc_parser::Kind;
use rsvelte_kernel::source::positions::Span;

use super::identifier::match_bracket;
use super::{End, ParseResult, Parser, javascript_error};
use crate::syntax_tree::{TemplateNode, TemplateNodeIdentifier, TokenType};

impl Parser<'_, '_> {
    pub(super) fn snippet_block(
        &mut self,
        start_offset: usize,
    ) -> ParseResult<TemplateNodeIdentifier> {
        let name = self.identifier()?;
        self.skip_ws();
        let mut type_parameters = None;
        if self.typescript && self.peek() == Some(b'<') {
            let Some(len) = match_bracket(self.rest(), b'<', b'>') else {
                return self.err("expected `>`");
            };
            type_parameters = Some(Span::new(
                self.position as u32,
                (self.position + len) as u32,
            ));
            self.eat_token(TokenType::Text, len);
            self.skip_ws();
        }
        let mut parameters = None;
        if self.peek() == Some(b'(') {
            self.eat_token(TokenType::JavaScript(Kind::LParen), 1);
            let start = self.position;
            let mut depth = 1usize;
            let bytes = self.source_text.as_bytes();
            let mut i = start;
            while i < bytes.len() {
                match bytes[i] {
                    b'(' => depth += 1,
                    b')' if depth == 1 => break,
                    b')' => depth -= 1,
                    _ => {}
                }
                i += 1;
            }
            if i == bytes.len() {
                return self.err("expected `)`");
            }
            let span = Span::new(start as u32, i as u32);
            let source_type = self.source_type();
            parameters = Some(
                self.builder
                    .parameters(span, source_type)
                    .map_err(javascript_error)?,
            );
            self.javascript_region(span.start_offset, span.end_offset);
            self.position = i;
            self.eat_token(TokenType::JavaScript(Kind::RParen), 1);
        }
        self.close_mustache()?;
        let body = self.fragment(End::Block)?;
        self.block_end("snippet")?;
        let span = Span::new(start_offset as u32, self.position as u32);
        Ok(self.push_node(TemplateNode::Snippet {
            name,
            type_parameters,
            parameters,
            body,
            span,
        }))
    }
}
