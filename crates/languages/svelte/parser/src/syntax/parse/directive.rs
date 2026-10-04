use rsvelte_kernel::source::positions::{SourceLocation, Span};
use rsvelte_svelte_syntax::syntax_tree::{Attribute, AttributeKind, AttributeValue, Part};
use rsvelte_typescript::NodeIdentifier;

use super::identifier::identifier_len;
use super::{ParseResult, Parser};

/// Upstream `regex_valid_identifier`, which decides how `parse_directive_name` reads a member.
fn is_valid_identifier(name: &str) -> bool {
    let mut chars = name.chars();
    chars
        .next()
        .is_some_and(|c| c.is_ascii_alphabetic() || c == '_' || c == '$')
        && chars.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
}

impl Parser<'_> {
    pub(super) fn directive(
        &mut self,
        attribute: &mut Attribute,
        directive: Span,
    ) -> ParseResult<()> {
        let AttributeValue::Parts(parts) = attribute.value else {
            return self.shorthand_directive(attribute, directive);
        };
        if attribute.kind != AttributeKind::Style {
            let chunks = self.component.parts(parts);
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
            attribute.target = self.directive_target(directive);
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
                attribute.target = self.directive_target(directive);
            }
            _ => {}
        }
        Ok(())
    }

    fn name_expression(&mut self, span: Span) -> ParseResult<NodeIdentifier> {
        let (tokens, comments) = (
            self.component.javascript.tokens.len(),
            self.component.javascript.comments.len(),
        );
        let expression = rsvelte_typescript::parser::parse_expression(
            &mut self.component.javascript,
            self.source_text,
            span,
            self.typescript,
        )
        .map_err(super::javascript_error)?;
        // The name's token already covers the identifier.
        self.component.javascript.tokens.truncate(tokens);
        self.component.javascript.comments.truncate(comments);
        self.component.template_expressions.push(expression);
        Ok(expression)
    }

    fn directive_target(&mut self, directive: Span) -> NodeIdentifier {
        let text = directive.text(self.source_text);
        let javascript = &mut self.component.javascript;
        let mut at = directive.start_offset;
        let mut target = NodeIdentifier::NONE;
        for (i, part) in text.split('.').enumerate() {
            let span = Span::new(at, at + part.len() as u32);
            at = span.end_offset + 1;
            if i == 0 {
                target = javascript.ident(part, span);
                continue;
            }
            let computed = !is_valid_identifier(part);
            let property = if computed {
                javascript.str_owned(part, span)
            } else {
                javascript.ident(part, span)
            };
            target = javascript.member(
                target,
                property,
                computed,
                false,
                SourceLocation::from(Span::new(directive.start_offset, span.end_offset)),
            );
        }
        self.component.template_expressions.push(target);
        target
    }
}
