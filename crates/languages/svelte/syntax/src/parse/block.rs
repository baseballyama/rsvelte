use oxc_ast::ast::{Expression, TSAsExpression};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::Kind;
use oxc_span::GetSpan;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::{ExpressionIdentifier, PatternIdentifier};

use super::identifier::is_identifier_continue;
use super::{End, ParseResult, Parser, javascript_error};
use crate::syntax_tree::{Range, TemplateNode, TemplateNodeIdentifier, TokenType};

impl Parser<'_, '_> {
    pub(super) fn eat_marker(&mut self, sigil: char, word: &str) -> bool {
        let rest = self.rest();
        let Some(after) = rest.strip_prefix('{') else {
            return false;
        };
        let inner = super::whitespace::trim_whitespace_start(after);
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
        self.err(
            "expected_block_type",
            "Expected 'if', 'each', 'await', 'key' or 'snippet'",
        )
    }

    /// The sigil after the `{` here, where upstream reports a block tag's error.
    pub(super) fn sigil(&self) -> Span {
        let after = &self.rest()[1..];
        let gap = after.len() - super::whitespace::trim_whitespace_start(after).len();
        let at = (self.position + 1 + gap) as u32;
        Span::new(at, at)
    }

    /// `{/name}`, or upstream's error for the clause or closing tag here instead.
    #[expect(
        clippy::literal_string_with_formatting_args,
        reason = "upstream's messages quote block tags"
    )]
    pub(super) fn block_end(&mut self, name: &str) -> ParseResult<()> {
        if self.eat_marker('/', name) {
            return self.close_mustache();
        }
        let at = self.sigil();
        let inner = &self.source_text[at.start_offset as usize..];
        if inner.starts_with('/') {
            return Self::err_at(at, "block_unexpected_close", "Unexpected block closing tag");
        }
        // The block's own clauses were read, so a clause here repeats one or does not belong.
        let clause = &inner[1..];
        let word = |w: &str| {
            clause.starts_with(w)
                && !clause[w.len()..]
                    .chars()
                    .next()
                    .is_some_and(is_identifier_continue)
        };
        let (code, message) = match name {
            "if" | "each" if word("else") => (
                "block_duplicate_clause",
                "{:else} cannot appear more than once within a block",
            ),
            "if" => ("expected_token", "Expected token {:else} or {:else if}"),
            "each" => ("expected_token", "Expected token {:else}"),
            "await" => (
                "expected_token",
                "Expected token {:then ...} or {:catch ...}",
            ),
            _ => (
                "block_invalid_continuation_placement",
                "{:...} block is invalid at this position (did you forget to close the preceding \
                 element or block?)",
            ),
        };
        Self::err_at(at, code, message)
    }

    /// An `{#if}` block; a `{:else if}` chain is read in a loop and built innermost first.
    fn if_block(
        &mut self,
        start_offset: usize,
        elseif: bool,
    ) -> ParseResult<TemplateNodeIdentifier> {
        let mut outer = Vec::new();
        let mut brace = start_offset as u32;
        let mut head = self.if_head(start_offset, elseif, brace)?;
        let alternate = loop {
            let clause = self.position as u32;
            if !self.eat_marker(':', "else") {
                break None;
            }
            self.skip_ws();
            if !self.at_word("if") {
                self.close_mustache()?;
                break Some(self.fragment(End::Block { start: brace })?);
            }
            let inner_start_offset = self.position;
            self.eat_token(TokenType::BlockKeyword, 2);
            self.require_ws()?;
            outer.push(head);
            brace = clause;
            head = self.if_head(inner_start_offset, true, brace)?;
        };
        self.block_end("if")?;
        let mut node = self.if_node(head, alternate);
        while let Some(head) = outer.pop() {
            let start = self.component.children.len() as u32;
            self.component.children.push(node);
            node = self.if_node(head, Some(Range { start, len: 1 }));
        }
        Ok(node)
    }

    /// `test}` and the consequent of an `{#if}` or `{:else if}` starting at `start_offset`.
    fn if_head(&mut self, start_offset: usize, elseif: bool, brace: u32) -> ParseResult<IfHead> {
        let test = self.expression()?;
        self.close_mustache()?;
        let consequent = self.fragment(End::Block { start: brace })?;
        Ok(IfHead {
            start_offset,
            elseif,
            test,
            consequent,
        })
    }

    fn if_node(&mut self, head: IfHead, alternate: Option<Range>) -> TemplateNodeIdentifier {
        let span = Span::new(head.start_offset as u32, self.position as u32);
        self.push_node(TemplateNode::If {
            test: head.test,
            consequent: head.consequent,
            alternate,
            elseif: head.elseif,
            span,
        })
    }

    fn each_block(&mut self, start_offset: usize) -> ParseResult<TemplateNodeIdentifier> {
        let expression = self.each_expression()?;
        self.skip_ws();
        let mut context = None;
        if self.at_word("as") {
            self.eat_token(TokenType::BlockKeyword, 2);
            self.require_ws()?;
            context = Some(self.pattern()?);
            self.skip_ws();
        }
        let mut index = None;
        if self.peek() == Some(b',') {
            self.eat_token(TokenType::JavaScript(Kind::Comma), 1);
            self.skip_ws();
            index = Some(self.binding_identifier()?);
            self.skip_ws();
        }
        let mut key = None;
        if self.peek() == Some(b'(') {
            self.eat_token(TokenType::JavaScript(Kind::LParen), 1);
            key = Some(self.expression()?);
            self.skip_ws();
            if self.peek() != Some(b')') {
                return self.expected_token(")");
            }
            self.eat_token(TokenType::JavaScript(Kind::RParen), 1);
        }
        self.close_mustache()?;
        let body = self.fragment(End::Block {
            start: start_offset as u32,
        })?;
        let mut fallback = self.empty_range();
        let has_fallback = if self.eat_marker(':', "else") {
            self.close_mustache()?;
            fallback = self.fragment(End::Block {
                start: start_offset as u32,
            })?;
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

    /// An `{#each}` index: one name, which scope analysis declares.
    fn binding_identifier(&mut self) -> ParseResult<PatternIdentifier> {
        let len = self.binding_name_len()?;
        if len == 0 {
            return self.err("expected_identifier", "Expected an identifier");
        }
        let span = Span::new(self.position as u32, (self.position + len) as u32);
        let source_type = self.source_type();
        let index = self
            .builder
            .pattern(span, source_type)
            .map_err(javascript_error)?;
        self.javascript_region(span.start_offset, span.end_offset);
        Ok(index)
    }

    fn each_expression(&mut self) -> ParseResult<ExpressionIdentifier> {
        let (position, tokens, mark) = (
            self.position,
            self.component.tokens.len(),
            self.builder.mark(),
        );
        let expression = match self.read_expression() {
            Ok(e) => e,
            // `{#each x as { y = z }}` reads `as { y = z }` as a type that does not parse, and
            // JavaScript has no `as` at all; read only up to the last `as` the error reaches, as
            // upstream does.
            Err(e) => {
                let before = &self.source_text[position..e.span.end_offset as usize];
                let Some(keyword) = last_as(before) else {
                    return Err(e);
                };
                return self.each_expression_before(position, tokens, mark, position + keyword);
            }
        };
        if self.at_word("as") {
            return Ok(self.builder.keep_expression(expression));
        }
        let first = match &expression {
            Expression::SequenceExpression(sequence) => &sequence.expressions[0],
            expression => expression,
        };
        // TypeScript reads `items as item` as an assertion, also inside `a || [] as item`: the
        // `as` of the one that ends the expression is the block's (upstream's walk).
        if let Some(type_start) = trailing_assertion(first) {
            let keyword = self
                .component
                .tokens
                .since(tokens)
                .iter()
                .rev()
                .find(|token| {
                    token.kind == TokenType::JavaScript(Kind::As)
                        && token.span.end_offset <= type_start
                });
            if let Some(keyword) = keyword {
                let keyword = keyword.span.start_offset as usize;
                return self.each_expression_before(position, tokens, mark, keyword);
            }
        } else if let Expression::SequenceExpression(sequence) = &expression {
            let end = sequence.expressions[0].span().end as usize;
            return self.each_expression_before(position, tokens, mark, end);
        }
        Ok(self.builder.keep_expression(expression))
    }

    /// The `{#each}` expression read again from `position`, up to `limit`.
    fn each_expression_before(
        &mut self,
        position: usize,
        tokens: usize,
        mark: usize,
        limit: usize,
    ) -> ParseResult<ExpressionIdentifier> {
        self.position = position;
        self.component.tokens.truncate(tokens);
        self.builder.rewind(mark);
        self.skip_ws();
        let expression = self.read_expression_before(limit as u32)?;
        Ok(self.builder.keep_expression(expression))
    }

    #[expect(
        clippy::literal_string_with_formatting_args,
        reason = "Svelte branch tags contain braces"
    )]
    fn await_block(&mut self, start_offset: usize) -> ParseResult<TemplateNodeIdentifier> {
        let expression = self.expression()?;
        self.skip_ws();
        let (mut value, mut error) = (None, None);
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
        let body = self.fragment(End::Block {
            start: start_offset as u32,
        })?;
        match first {
            1 => then = body,
            2 => catch = body,
            _ => pending = body,
        }
        loop {
            let colon = self.sigil();
            if self.eat_marker(':', "then") {
                if then.present().is_some() {
                    return Self::err_at(
                        colon,
                        "block_duplicate_clause",
                        "{:then} cannot appear more than once within a block",
                    );
                }
                value = self.optional_pattern()?;
                self.close_mustache()?;
                then = self.fragment(End::Block {
                    start: start_offset as u32,
                })?;
            } else if self.eat_marker(':', "catch") {
                if catch.present().is_some() {
                    return Self::err_at(
                        colon,
                        "block_duplicate_clause",
                        "{:catch} cannot appear more than once within a block",
                    );
                }
                error = self.optional_pattern()?;
                self.close_mustache()?;
                catch = self.fragment(End::Block {
                    start: start_offset as u32,
                })?;
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

    fn optional_pattern(&mut self) -> ParseResult<Option<PatternIdentifier>> {
        let at = self.position;
        let tokens = self.component.tokens.len();
        self.skip_ws();
        if self.peek() == Some(b'}') {
            return Ok(None);
        }
        if self.position == at {
            self.component.tokens.truncate(tokens);
            return self.err("expected_whitespace", "Expected whitespace");
        }
        self.pattern().map(Some)
    }

    fn key_block(&mut self, start_offset: usize) -> ParseResult<TemplateNodeIdentifier> {
        let expression = self.expression()?;
        self.close_mustache()?;
        let body = self.fragment(End::Block {
            start: start_offset as u32,
        })?;
        self.block_end("key")?;
        let span = Span::new(start_offset as u32, self.position as u32);
        Ok(self.push_node(TemplateNode::Key {
            expression,
            body,
            span,
        }))
    }
}

/// Where the type starts of the outermost `as` assertion in `e` that ends where `e` does.
fn trailing_assertion(e: &Expression<'_>) -> Option<u32> {
    struct Find {
        end: u32,
        type_start: Option<u32>,
    }
    impl<'a> Visit<'a> for Find {
        fn visit_ts_as_expression(&mut self, it: &TSAsExpression<'a>) {
            if self.type_start.is_some() {
                return;
            }
            if it.span.end == self.end {
                self.type_start = Some(it.type_annotation.span().start);
                return;
            }
            walk::walk_ts_as_expression(self, it);
        }
    }
    let mut find = Find {
        end: e.span().end,
        type_start: None,
    };
    find.visit_expression(e);
    find.type_start
}

/// The offset of the last `as` keyword in `s` that has whitespace before it.
fn last_as(s: &str) -> Option<usize> {
    s.rmatch_indices("as").map(|(i, _)| i).find(|&i| {
        i > 0
            && s[..i].ends_with(is_ecmascript_whitespace)
            && !s[i + 2..]
                .chars()
                .next()
                .is_some_and(is_identifier_continue)
    })
}

/// An `{#if}` or `{:else if}` read up to its alternate.
#[derive(Clone, Copy)]
struct IfHead {
    start_offset: usize,
    elseif: bool,
    test: ExpressionIdentifier,
    consequent: Range,
}

#[cfg(test)]
mod tests;
