use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{Range, TemplateNode, TemplateNodeIdentifier, TokenType};
use rsvelte_typescript::lexer::T;
use rsvelte_typescript::syntax_tree::TypeScriptKind;
use rsvelte_typescript::{Kind, NodeIdentifier};

use super::identifier::is_identifier_continue;
use super::{End, ParseResult, Parser};

impl Parser<'_> {
    pub(super) fn eat_marker(&mut self, sigil: char, word: &str) -> bool {
        let rest = self.rest();
        let Some(after) = rest.strip_prefix('{') else {
            return false;
        };
        let inner = super::whitespace::trim_ascii_start(after);
        let Some(after_word) = inner.strip_prefix(sigil).and_then(|s| s.strip_prefix(word)) else {
            return false;
        };
        if after_word
            .chars()
            .next()
            .is_some_and(is_identifier_continue)
        {
            return false;
        }
        let gap = after.len() - inner.len();
        if gap == 0 {
            self.eat_token(TokenType::BlockOpen, 1 + sigil.len_utf8() + word.len());
        } else {
            self.eat_token(TokenType::MustacheOpen, 1);
            self.skip_ws();
            self.eat_token(TokenType::BlockOpen, sigil.len_utf8() + word.len());
        }
        true
    }

    pub(super) fn block(&mut self) -> ParseResult<TemplateNodeIdentifier> {
        let start_offset = self.position;
        if self.eat_marker('#', "if") {
            self.require_ws()?;
            return self.if_block(start_offset, false);
        }
        if self.eat_marker('#', "each") {
            self.require_ws()?;
            return self.each_block(start_offset);
        }
        if self.eat_marker('#', "await") {
            self.require_ws()?;
            return self.await_block(start_offset);
        }
        if self.eat_marker('#', "key") {
            self.require_ws()?;
            return self.key_block(start_offset);
        }
        if self.eat_marker('#', "snippet") {
            self.require_ws()?;
            return self.snippet_block(start_offset);
        }
        self.err("expected `if`, `each`, `await`, `key` or `snippet`")
    }

    pub(super) fn block_end(&mut self, name: &str) -> ParseResult<()> {
        if !self.eat_marker('/', name) {
            return self.err(format!("expected `{{/{name}}}`"));
        }
        self.close_mustache()
    }

    fn if_block(
        &mut self,
        start_offset: usize,
        elseif: bool,
    ) -> ParseResult<TemplateNodeIdentifier> {
        let test = self.expression()?;
        self.close_mustache()?;
        let consequent = self.fragment(End::Block)?;
        let alternate = if self.eat_marker(':', "else") {
            self.skip_ws();
            if self.at_word("if") {
                let inner_start_offset = self.position;
                self.eat_token(TokenType::BlockKeyword, 2);
                self.require_ws()?;
                let inner = self.if_block(inner_start_offset, true)?;
                let start = self.component.children.len() as u32;
                self.component.children.push(inner);
                let span = Span::new(start_offset as u32, self.position as u32);
                return Ok(self.push_node(TemplateNode::If {
                    test,
                    consequent,
                    alternate: Some(Range { start, len: 1 }),
                    elseif,
                    span,
                }));
            }
            self.close_mustache()?;
            Some(self.fragment(End::Block)?)
        } else {
            None
        };
        self.block_end("if")?;
        let span = Span::new(start_offset as u32, self.position as u32);
        Ok(self.push_node(TemplateNode::If {
            test,
            consequent,
            alternate,
            elseif,
            span,
        }))
    }

    fn each_block(&mut self, start_offset: usize) -> ParseResult<TemplateNodeIdentifier> {
        let expression = self.each_expression()?;
        self.skip_ws();
        let mut context = NodeIdentifier::NONE;
        if self.at_word("as") {
            self.eat_token(TokenType::BlockKeyword, 2);
            self.require_ws()?;
            context = self.pattern()?;
            self.skip_ws();
        }
        let mut index = NodeIdentifier::NONE;
        if self.peek() == Some(b',') {
            self.eat_token(TokenType::JavaScript(T::Comma), 1);
            self.skip_ws();
            index = self.identifier()?;
            self.skip_ws();
        }
        let mut key = NodeIdentifier::NONE;
        if self.peek() == Some(b'(') {
            self.eat_token(TokenType::JavaScript(T::LParen), 1);
            key = self.expression()?;
            self.skip_ws();
            if self.peek() != Some(b')') {
                return self.err("expected `)`");
            }
            self.eat_token(TokenType::JavaScript(T::RParen), 1);
        }
        self.close_mustache()?;
        let body = self.fragment(End::Block)?;
        let mut fallback = self.empty_range();
        let has_fallback = if self.eat_marker(':', "else") {
            self.close_mustache()?;
            fallback = self.fragment(End::Block)?;
            true
        } else {
            false
        };
        self.block_end("each")?;
        let span = Span::new(start_offset as u32, self.position as u32);
        Ok(self.push_node(TemplateNode::Each {
            expression,
            context,
            index,
            key,
            body,
            fallback,
            has_fallback,
            span,
        }))
    }

    fn each_expression(&mut self) -> ParseResult<NodeIdentifier> {
        let (position, tokens, mark) = (
            self.position,
            self.component.tokens.len(),
            self.component.javascript.mark(),
        );
        let typescript_from = self.component.javascript.typescript.len();
        let expression = match self.expression() {
            Ok(e) => e,
            // `{#each x as { y = z }}` reads `as { y = z }` as a type that does not parse; read
            // only up to the last `as` before the error, as upstream does.
            Err(e) => {
                let before = &self.source_text[position..e.span.start_offset as usize];
                let Some(keyword) = last_as(before) else {
                    return Err(e);
                };
                self.position = position;
                self.component.tokens.truncate(tokens);
                self.component.javascript.rewind(mark);
                self.skip_ws();
                return self.expression_until((position + keyword) as u32);
            }
        };
        if self.at_word("as") {
            return Ok(expression);
        }
        let first = match self.component.javascript.kind(expression) {
            Kind::Sequence(items) => items[0],
            _ => expression,
        };
        let Some(assertion) = self.component.javascript.typescript[typescript_from..]
            .iter()
            .rev()
            .find(|t| t.kind == TypeScriptKind::As && t.node == first)
        else {
            if let Kind::Sequence(items) = self.component.javascript.kind(expression)
                && let Some(span) = self.component.javascript.source_location(items[0]).span()
            {
                self.rewind_to(position, tokens, mark);
                self.skip_ws();
                return self.expression_until(span.end_offset);
            }
            return Ok(expression);
        };
        let Some(keyword) = self
            .component
            .javascript
            .tokens
            .iter()
            .rev()
            .find(|token| {
                token.kind == T::Identifier
                    && token.span.end_offset <= assertion.span.start_offset
                    && token.span.start_offset >= position as u32
                    && token.span.text(self.source_text) == "as"
            })
            .map(|token| token.span.start_offset)
        else {
            return Ok(expression);
        };
        self.rewind_to(position, tokens, mark);
        self.skip_ws();
        self.expression_until(keyword)
    }

    fn rewind_to(
        &mut self,
        position: usize,
        tokens: usize,
        mark: rsvelte_typescript::syntax_tree::Mark,
    ) {
        self.position = position;
        self.component.tokens.truncate(tokens);
        self.component.javascript.rewind(mark);
        self.component.template_expressions.pop();
    }

    #[expect(
        clippy::literal_string_with_formatting_args,
        reason = "Svelte branch tags contain braces"
    )]
    fn await_block(&mut self, start_offset: usize) -> ParseResult<TemplateNodeIdentifier> {
        let expression = self.expression()?;
        self.skip_ws();
        let (mut value, mut error) = (NodeIdentifier::NONE, NodeIdentifier::NONE);
        let (mut pending, mut then, mut catch) = (Range::ABSENT, Range::ABSENT, Range::ABSENT);
        let first = if self.at_word("then") {
            self.eat_token(TokenType::BlockKeyword, "then".len());
            value = self.optional_pattern()?;
            1
        } else if self.at_word("catch") {
            self.eat_token(TokenType::BlockKeyword, "catch".len());
            error = self.optional_pattern()?;
            2
        } else {
            0
        };
        self.close_mustache()?;
        let body = self.fragment(End::Block)?;
        match first {
            1 => then = body,
            2 => catch = body,
            _ => pending = body,
        }
        loop {
            if self.eat_marker(':', "then") {
                if then.present().is_some() {
                    return self.err("`{:then}` cannot appear twice in a block");
                }
                value = self.optional_pattern()?;
                self.close_mustache()?;
                then = self.fragment(End::Block)?;
            } else if self.eat_marker(':', "catch") {
                if catch.present().is_some() {
                    return self.err("`{:catch}` cannot appear twice in a block");
                }
                error = self.optional_pattern()?;
                self.close_mustache()?;
                catch = self.fragment(End::Block)?;
            } else {
                break;
            }
        }
        self.block_end("await")?;
        let span = Span::new(start_offset as u32, self.position as u32);
        Ok(self.push_node(TemplateNode::Await {
            expression,
            value,
            error,
            pending,
            then,
            catch,
            span,
        }))
    }

    fn optional_pattern(&mut self) -> ParseResult<NodeIdentifier> {
        let at = self.position;
        let tokens = self.component.tokens.len();
        self.skip_ws();
        if self.peek() == Some(b'}') {
            return Ok(NodeIdentifier::NONE);
        }
        if self.position == at {
            self.component.tokens.truncate(tokens);
            return self.err("expected whitespace");
        }
        self.pattern()
    }

    fn key_block(&mut self, start_offset: usize) -> ParseResult<TemplateNodeIdentifier> {
        let expression = self.expression()?;
        self.close_mustache()?;
        let body = self.fragment(End::Block)?;
        self.block_end("key")?;
        let span = Span::new(start_offset as u32, self.position as u32);
        Ok(self.push_node(TemplateNode::Key {
            expression,
            body,
            span,
        }))
    }
}

/// The offset of the last `as` keyword in `s` that has whitespace before it.
fn last_as(s: &str) -> Option<usize> {
    s.rmatch_indices("as").map(|(i, _)| i).find(|&i| {
        i > 0
            && s.as_bytes()[i - 1].is_ascii_whitespace()
            && !s[i + 2..]
                .chars()
                .next()
                .is_some_and(is_identifier_continue)
    })
}
