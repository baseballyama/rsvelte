use oxc_ast::ast::{Expression, IdentifierName};
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::identifier::identifier_len;
use super::{ParseResult, Parser, javascript_error};
use crate::syntax_tree::{Attribute, AttributeKind, AttributeValue, Part};

/// Upstream `regex_valid_identifier`, which decides how `parse_directive_name` reads a member.
fn is_valid_identifier(name: &str) -> bool {
    let mut chars = name.chars();
    chars
        .next()
        .is_some_and(|c| c.is_ascii_alphabetic() || c == '_' || c == '$')
        && chars.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
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
                return Self::err_at(at, "a directive value must be one `{expression}`");
            }
        }
        if matches!(
            attribute.kind,
            AttributeKind::Use | AttributeKind::Transition { .. } | AttributeKind::Animate
        ) {
            attribute.target = Some(self.directive_target(directive));
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
                let text = directive.text(self.source_text);
                if identifier_len(text) != text.len() {
                    if attribute.kind == AttributeKind::Bind {
                        return Self::err_at(directive, "expected a property name after `bind:`");
                    }
                    if attribute.kind == AttributeKind::Style {
                        // `style:--custom-property` has no expression; it sets the empty string.
                        return Ok(());
                    }
                }
                let expression = self.name_expression(directive)?;
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
            .map_err(javascript_error)?;
        if end != span.end_offset {
            return Self::err_at(span, "expected one expression");
        }
        Ok(self.builder.keep_expression(expression))
    }

    /// What a directive's name (`fade`, `actions.tooltip`) refers to, as upstream builds it.
    fn directive_target(&mut self, directive: Span) -> ExpressionIdentifier {
        let text: &'a str = directive.text(self.source_text);
        let ast = self.builder.ast();
        let span_of = |offset: u32, part: &str| {
            let end = offset + u32::try_from(part.len()).expect("source positions use u32 bytes");
            oxc_span::Span::new(offset, end)
        };
        let mut parts = text.split('.');
        let first = parts.next().unwrap_or(text);
        let mut span = span_of(directive.start_offset, first);
        let mut target = Expression::new_identifier(span, first, &ast);
        for part in parts {
            span = span_of(span.end + 1, part);
            let whole = oxc_span::Span::new(directive.start_offset, span.end);
            target = if is_valid_identifier(part) {
                let property = IdentifierName::new(span, part, &ast);
                Expression::new_static_member_expression(whole, target, property, false, &ast)
            } else {
                let property = Expression::new_string_literal(span, part, None, &ast);
                Expression::new_computed_member_expression(whole, target, property, false, &ast)
            };
        }
        self.builder.keep_expression(target)
    }
}
