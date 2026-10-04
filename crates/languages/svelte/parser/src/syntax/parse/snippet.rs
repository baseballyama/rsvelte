use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{Range, TemplateNode, TemplateNodeIdentifier, TokenType};
use rsvelte_typescript::lexer::T;
use rsvelte_typescript::parser::parse_parameters;

use super::identifier::match_bracket;
use super::{End, ParseResult, Parser, javascript_error};

impl Parser<'_> {
    pub(super) fn snippet_block(
        &mut self,
        start_offset: usize,
    ) -> ParseResult<TemplateNodeIdentifier> {
        let name = self.identifier()?;
        self.skip_ws();
        if self.typescript && self.peek() == Some(b'<') {
            let Some(len) = match_bracket(self.rest(), b'<', b'>') else {
                return self.err("expected `>`");
            };
            self.eat_token(TokenType::Text, len);
            self.skip_ws();
        }
        let parameters_start = self.component.javascript_lists.len();
        if self.peek() == Some(b'(') {
            self.eat_token(TokenType::JavaScript(T::LParen), 1);
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
            let (tokens, comments) = (
                self.component.javascript.tokens.len(),
                self.component.javascript.comments.len(),
            );
            let parameters = parse_parameters(
                &mut self.component.javascript,
                self.source_text,
                span,
                self.typescript,
            )
            .map_err(javascript_error)?;
            self.javascript_region(span.start_offset, span.end_offset, tokens, comments);
            self.position = i;
            self.eat_token(TokenType::JavaScript(T::RParen), 1);
            self.component.javascript_lists.extend(parameters);
        }
        let parameters = Range {
            start: parameters_start as u32,
            len: (self.component.javascript_lists.len() - parameters_start) as u32,
        };
        self.close_mustache()?;
        let body = self.fragment(End::Block)?;
        self.block_end("snippet")?;
        let span = Span::new(start_offset as u32, self.position as u32);
        Ok(self.push_node(TemplateNode::Snippet {
            name,
            parameters,
            body,
            span,
        }))
    }
}
