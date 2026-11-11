//! `{#if}` and `{#await}` blocks and their branches.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{Range, TemplateNode, TemplateNodeIdentifier, TokenType};
use rsvelte_typescript_tree::{ExpressionIdentifier, PatternIdentifier};

use super::Template;
use crate::rules::indent::tokens::Token;

impl Template<'_, '_> {
    pub(super) fn else_block(&mut self, else_open: Option<Token>, range: Range) {
        let (open, keyword) = self.head(else_open);
        self.offset(keyword, 1, open);
        let close = self.after(keyword);
        self.offset(close, 0, open);
        self.block_children(range, open);
        self.visit_children(range);
    }

    pub(super) fn if_block(&mut self, root: TemplateNodeIdentifier) {
        let component = self.component;
        let span = component.node(root).span();
        let mut open = self.first(span);
        let branches = component.if_branches(root);
        let mut tag_open = open;
        for (i, &branch) in branches.iter().enumerate() {
            let TemplateNode::If {
                test,
                consequent,
                alternate,
                ..
            } = *component.node(branch)
            else {
                continue;
            };
            let (head_open, keyword) = self.head(tag_open);
            open = head_open;
            let mut if_tokens = vec![keyword];
            if i > 0 {
                let if_keyword = self.after(keyword);
                if_tokens.push(if_keyword);
            }
            for t in &if_tokens {
                self.offset(*t, 1, open);
            }
            let test_tokens = self.js_outer(Some(self.expression_span(test)));
            self.offset(test_tokens.map(|(f, _)| f), 1, if_tokens[0]);
            let close = self.after(test_tokens.map(|(_, l)| l));
            self.offset(close, 0, open);
            self.block_children(consequent, open);
            let next_open = alternate.and_then(|_| {
                let end = self.region_end(consequent, close)?;
                self.tokens().after_offset(end)
            });
            if alternate.is_some() {
                self.offset(next_open, 0, open);
            }
            let is_elseif = i + 1 < branches.len();
            if !is_elseif {
                self.closing(span, open);
            }
            self.visit_expression(test);
            self.visit_children(consequent);
            if let Some(alternate) = alternate {
                if is_elseif {
                    tag_open = next_open;
                } else {
                    self.else_block(next_open, alternate);
                }
            }
        }
    }

    #[expect(clippy::too_many_arguments, reason = "the parts of an await block")]
    pub(super) fn await_block(
        &mut self,
        span: Span,
        expression: ExpressionIdentifier,
        value: Option<PatternIdentifier>,
        error: Option<PatternIdentifier>,
        pending: Range,
        then: Range,
        catch: Range,
    ) {
        let (open, keyword) = self.head(self.first(span));
        self.offset(keyword, 1, open);
        let expression_tokens = self.js_outer(Some(self.expression_span(expression)));
        self.offset(expression_tokens.map(|(f, _)| f), 1, keyword);
        let after_expression = self.after(expression_tokens.map(|(_, l)| l));
        let tokens = self.tokens();
        let inline = after_expression.filter(|&t| tokens.kind(t) == TokenType::BlockKeyword);
        let mut region = None;
        let mut then_open = None;
        let mut catch_open = None;
        if let Some(pending) = pending.present() {
            let close = after_expression;
            self.offset(close, 0, open);
            let first_child = self
                .children(pending)
                .iter()
                .find_map(|&c| self.first(self.component.node(c).span()));
            self.offset(first_child, 1, open);
            region = self.region_end(pending, close);
        }
        let inline_then = inline.filter(|&t| self.tokens().text(t) == "then");
        let inline_catch = inline.filter(|&t| self.tokens().text(t) == "catch");
        if then.present().is_some() {
            if let Some(then_token) = inline_then {
                self.offset(Some(then_token), 1, open);
                let value_span = value.map(|p| self.pattern_span(p));
                let value_first = self.js_first(value_span);
                self.offset(value_first, 1, Some(then_token));
                let close = if value_span.is_none() {
                    self.after(Some(then_token))
                } else {
                    self.js_after(value_span)
                };
                self.offset(close, 0, open);
                region = self.region_end(then, close);
            } else {
                then_open = region.and_then(|r| self.tokens().after_offset(r));
                self.offset(then_open, 0, open);
            }
        }
        if catch.present().is_some() {
            if let Some(catch_token) = inline_catch {
                self.offset(Some(catch_token), 1, open);
                let error_span = error.map(|p| self.pattern_span(p));
                let error_first = self.js_first(error_span);
                self.offset(error_first, 1, Some(catch_token));
                let close = if error_span.is_none() {
                    self.after(Some(catch_token))
                } else {
                    self.js_after(error_span)
                };
                self.offset(close, 0, open);
            } else {
                let from = if then.present().is_some() && then_open.is_some() {
                    let close = self.branch_close(then_open, value);
                    self.region_end(then, close)
                } else {
                    region
                };
                catch_open = from.and_then(|r| self.tokens().after_offset(r));
                self.offset(catch_open, 0, open);
            }
        }
        self.closing(span, open);
        self.visit_expression(expression);
        if let Some(pending) = pending.present() {
            self.block_children(pending, open);
            self.visit_children(pending);
        }
        if let Some(then) = then.present() {
            if inline_then.is_some() {
                self.block_children(then, open);
                self.visit_pattern(value);
            } else {
                self.branch(then_open, value, then);
            }
            self.visit_children(then);
        }
        if let Some(catch) = catch.present() {
            if inline_catch.is_some() {
                self.block_children(catch, open);
                self.visit_pattern(error);
            } else {
                self.branch(catch_open, error, catch);
            }
            self.visit_children(catch);
        }
    }

    /// The `}` that ends `{:then value}` or `{:catch error}`.
    pub(super) fn branch_close(
        &self,
        branch_open: Option<Token>,
        binding: Option<PatternIdentifier>,
    ) -> Option<Token> {
        let (_, keyword) = self.head(branch_open);
        match binding.map(|p| self.pattern_span(p)) {
            None => self.after(keyword),
            binding => self.js_after(binding),
        }
    }

    /// `{:then value}` and `{:catch error}` with their children.
    pub(super) fn branch(
        &mut self,
        branch_open: Option<Token>,
        binding: Option<PatternIdentifier>,
        range: Range,
    ) {
        let (open, keyword) = self.head(branch_open);
        self.offset(keyword, 1, open);
        let binding_first = self.js_first(binding.map(|p| self.pattern_span(p)));
        self.offset(binding_first, 1, keyword);
        let close = self.branch_close(branch_open, binding);
        self.offset(close, 0, open);
        self.block_children(range, open);
        self.visit_pattern(binding);
    }
}
