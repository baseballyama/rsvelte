use oxc_ast::ast::{Expression, IdentifierName};
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::{ExpressionIdentifier, is_valid_identifier};

use super::identifier::identifier_len;
use super::{ParseResult, Parser, javascript_failure};
use crate::syntax_tree::{Attribute, AttributeKind, AttributeValue, Part};

/// How many parentheses the text between a `{` and its expression opens outside a comment.
fn parentheses_before(text: &str) -> u8 {
    let mut rest = text;
    let mut pairs: u8 = 0;
    while let Some(c) = rest.chars().next() {
        if let Some(comment) = rest.strip_prefix("/*") {
            rest = comment.find("*/").map_or("", |end| &comment[end + 2..]);
        } else if let Some(comment) = rest.strip_prefix("//") {
            rest = comment.find('\n').map_or("", |end| &comment[end..]);
        } else {
            pairs = pairs.saturating_add(u8::from(c == '('));
            rest = &rest[c.len_utf8()..];
        }
    }
    pairs
}

impl<'a> Parser<'a, '_> {
    pub(super) fn directive(
        &mut self,
        attribute: &mut Attribute,
        directive: Span,
    ) -> ParseResult<()> {
        let AttributeValue::Parts(parts) = attribute.value else {
            return self.shorthand_directive(attribute, directive);
        };
        if attribute.kind != AttributeKind::Style {
            let chunks = parts.get(&self.component.parts);
            if chunks.len() != 1 || matches!(chunks[0], Part::Text(_)) {
                let at = match chunks.first() {
                    Some(Part::Text(s) | Part::Expression { span: s, .. }) => *s,
                    None => attribute.span,
                };
                return Self::err_at(
                    Span::new(at.start_offset, at.start_offset),
                    "directive_invalid_value",
                    "Directive value must be a JavaScript expression enclosed in curly braces",
                );
            }
        }
        if matches!(
            attribute.kind,
            AttributeKind::Use | AttributeKind::Transition { .. } | AttributeKind::Animate
        ) {
            attribute.target = Some(self.directive_target(directive));
        }
        if attribute.kind == AttributeKind::Bind
            && let [Part::Expression { expression, span }] = *parts.get(&self.component.parts)
        {
            let inner = oxc_span::GetSpan::span(self.builder.get_expression(expression));
            let before = &self.source_text[span.start_offset as usize + 1..inner.start as usize];
            let pairs = parentheses_before(before);
            if pairs > 0 {
                self.builder.record_parentheses(inner, pairs);
            }
        }
        Ok(())
    }

    fn shorthand_directive(
        &mut self,
        attribute: &mut Attribute,
        directive: Span,
    ) -> ParseResult<()> {
        match attribute.kind {
            AttributeKind::Bind | AttributeKind::Class | AttributeKind::Style => {
                let text: &'a str = directive.text(self.source_text);
                let identifier = identifier_len(text) == text.len();
                if !identifier && attribute.kind == AttributeKind::Style {
                    // `style:--custom-property` has no expression; it sets the empty string.
                    return Ok(());
                }
                let expression = if attribute.kind == AttributeKind::Style {
                    self.name_expression(directive)?
                } else {
                    // Upstream reads the whole name as one identifier: `a.b`, `a-b` and `this` too.
                    let span = oxc_span::Span::new(directive.start_offset, directive.end_offset);
                    let name = Expression::new_identifier(span, text, &self.builder.nodes());
                    self.builder.keep_expression(name)
                };
                let parts = self.component.parts.len();
                self.component.parts.push(Part::Expression {
                    expression,
                    span: directive,
                });
                attribute.value = AttributeValue::Parts(self.parts_since(parts));
                attribute.shorthand = true;
            }
            AttributeKind::Use | AttributeKind::Transition { .. } | AttributeKind::Animate => {
                attribute.target = Some(self.directive_target(directive));
            }
            _ => {}
        }
        Ok(())
    }

    /// The expression a shorthand directive's name stands for; the name's token covers it.
    fn name_expression(&mut self, span: Span) -> ParseResult<ExpressionIdentifier> {
        let source_type = self.source_type();
        let (expression, end) = self
            .builder
            .read_expression_before(span.start_offset, span.end_offset, source_type)
            .map_err(javascript_failure)?;
        if end != span.end_offset {
            return Self::err_at(span, "parse_error", "expected one expression");
        }
        Ok(self.builder.keep_expression(expression))
    }

    /// What a directive's name (`fade`, `actions.tooltip`) refers to, as upstream builds it.
    fn directive_target(&mut self, directive: Span) -> ExpressionIdentifier {
        self.member_chain(directive, true)
    }

    /// The member chain `a.b.c` that `name` spells; a part that is no identifier is a computed
    /// member where `computed`, as upstream builds a directive's target and not a component's.
    pub(super) fn member_chain(&mut self, name: Span, computed: bool) -> ExpressionIdentifier {
        let text: &'a str = name.text(self.source_text);
        let nodes = self.builder.nodes();
        let span_of = |offset: u32, part: &str| {
            let end = offset + u32::try_from(part.len()).expect("source positions use u32 bytes");
            oxc_span::Span::new(offset, end)
        };
        let mut parts = text.split('.');
        let first = parts.next().unwrap_or(text);
        let mut span = span_of(name.start_offset, first);
        let mut target = Expression::new_identifier(span, first, &nodes);
        for part in parts {
            span = span_of(span.end + 1, part);
            let whole = oxc_span::Span::new(name.start_offset, span.end);
            target = if !computed || is_valid_identifier(part) {
                let property = IdentifierName::new(span, part, &nodes);
                Expression::new_static_member_expression(whole, target, property, false, &nodes)
            } else {
                let property = Expression::new_string_literal(span, part, None, &nodes);
                Expression::new_computed_member_expression(whole, target, property, false, &nodes)
            };
        }
        self.builder.keep_expression(target)
    }
}
