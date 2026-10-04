use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Part, Range, TokenType,
};
use rsvelte_typescript::NodeIdentifier;
use rsvelte_typescript::lexer::T;

use super::{ParseResult, Parser};

/// Upstream `get_directive_type`.
fn directive_kind(prefix: &str) -> Option<AttributeKind> {
    Some(match prefix {
        "use" => AttributeKind::Use,
        "animate" => AttributeKind::Animate,
        "bind" => AttributeKind::Bind,
        "class" => AttributeKind::Class,
        "style" => AttributeKind::Style,
        "on" => AttributeKind::On,
        "let" => AttributeKind::Let,
        "in" => AttributeKind::Transition {
            intro: true,
            outro: false,
        },
        "out" => AttributeKind::Transition {
            intro: false,
            outro: true,
        },
        "transition" => AttributeKind::Transition {
            intro: true,
            outro: true,
        },
        _ => return None,
    })
}

impl Parser<'_> {
    pub(super) fn attributes(&mut self) -> ParseResult<(Range, bool)> {
        let start = self.component.attributes.len();
        loop {
            self.skip_ws();
            match self.peek() {
                None => return self.err("unterminated start tag"),
                Some(b'>') => {
                    self.eat_token(TokenType::TagEnd, 1);
                    return Ok((self.attributes_since(start), false));
                }
                Some(b'/') if self.rest().starts_with("/>") => {
                    self.eat_token(TokenType::SelfClose, 2);
                    return Ok((self.attributes_since(start), true));
                }
                Some(b'/') if self.rest().starts_with("//") || self.rest().starts_with("/*") => {
                    self.tag_comment()?;
                }
                Some(b'{') => {
                    let a = self.brace_attribute()?;
                    self.component.attributes.push(a);
                }
                Some(_) => {
                    let a = self.attribute()?;
                    self.component.attributes.push(a);
                }
            }
        }
    }

    fn tag_comment(&mut self) -> ParseResult<()> {
        let start_offset = self.position;
        let end = if self.rest().starts_with("//") {
            self.rest().find('\n').unwrap_or_else(|| self.rest().len())
        } else {
            match self.rest().find("*/") {
                Some(i) => i + 2,
                None => return self.err("unterminated comment"),
            }
        };
        self.position += end;
        self.token(TokenType::JavaScriptComment, start_offset);
        Ok(())
    }

    const fn attributes_since(&self, start: usize) -> Range {
        Range {
            start: start as u32,
            len: (self.component.attributes.len() - start) as u32,
        }
    }

    pub(super) const fn parts_since(&self, start: usize) -> Range {
        Range {
            start: start as u32,
            len: (self.component.parts.len() - start) as u32,
        }
    }

    fn brace_attribute(&mut self) -> ParseResult<Attribute> {
        let start_offset = self.position;
        self.eat_token(TokenType::MustacheOpen, 1);
        self.skip_ws();
        let kind = if self.eat_word(TokenType::BlockKeyword, "@attach") {
            self.require_ws()?;
            AttributeKind::Attach
        } else if self.eat_word(TokenType::JavaScript(T::Ellipsis), "...") {
            AttributeKind::Spread
        } else {
            AttributeKind::Attribute
        };
        let expression = if kind == AttributeKind::Attribute {
            let identifier = self.identifier()?;
            self.component.template_expressions.push(identifier);
            identifier
        } else {
            self.expression()?
        };
        self.close_mustache()?;
        let span = Span::new(start_offset as u32, self.position as u32);
        let parts = self.component.parts.len();
        self.component
            .parts
            .push(Part::Expression { expression, span });
        let name = if kind == AttributeKind::Attribute {
            self.component
                .javascript
                .source_location(expression)
                .span()
                .expect("parsed from source")
        } else {
            Span::new(start_offset as u32, start_offset as u32)
        };
        Ok(Attribute {
            kind,
            name,
            modifiers: Range::default(),
            target: NodeIdentifier::NONE,
            value: AttributeValue::Parts(self.parts_since(parts)),
            span,
            quoted: false,
            shorthand: kind == AttributeKind::Attribute,
        })
    }

    fn attribute(&mut self) -> ParseResult<Attribute> {
        let start_offset = self.position;
        self.position += attribute_name_len(self.rest().as_bytes());
        let name = Span::new(start_offset as u32, self.position as u32);
        if name.is_empty() {
            return self.err("expected an attribute name");
        }
        self.token(TokenType::AttributeName, start_offset);
        let name_text = name.text(self.source_text);
        let kind = name_text
            .find(':')
            .and_then(|colon| directive_kind(&name_text[..colon]))
            .unwrap_or(AttributeKind::Attribute);
        let modifiers_start = self.component.modifiers.len();
        if let Some(prefix) = kind.prefix_len() {
            let after = &name_text[prefix as usize..];
            let mut at = name.start_offset + prefix;
            for (i, piece) in after.split('|').enumerate() {
                if i > 0 {
                    self.component
                        .modifiers
                        .push(Span::new(at, at + piece.len() as u32));
                }
                at += piece.len() as u32 + 1;
            }
        }
        let modifiers = Range {
            start: modifiers_start as u32,
            len: (self.component.modifiers.len() - modifiers_start) as u32,
        };
        let mut attribute = Attribute {
            kind,
            name,
            modifiers,
            target: NodeIdentifier::NONE,
            value: AttributeValue::True,
            span: name,
            quoted: false,
            shorthand: false,
        };
        let directive = attribute.directive_name(&self.component.modifiers);
        if directive.is_some_and(Span::is_empty) {
            return Self::err_at(name, format!("`{name_text}` is missing a name after `:`"));
        }
        let name_end = self.position;
        self.skip_ws();
        let end_offset = if self.peek() == Some(b'=') {
            self.eat_token(TokenType::Eq, 1);
            self.skip_ws();
            self.attribute_value(&mut attribute)?;
            self.position
        } else {
            if matches!(self.peek(), Some(b'"' | b'\'')) {
                return self.err("expected `=`");
            }
            // The whitespace belongs to the start tag, not to the attribute.
            name_end
        };
        attribute.span = Span::new(start_offset as u32, end_offset as u32);
        if let Some(directive) = directive {
            self.directive(&mut attribute, directive)?;
        }
        Ok(attribute)
    }

    fn attribute_value(&mut self, attribute: &mut Attribute) -> ParseResult<()> {
        let start = self.component.parts.len();
        if self.rest().starts_with("/>") {
            // `a=/>` is the text `/`.
            let at = self.position as u32;
            self.eat_token(TokenType::AttributeText, 1);
            self.component.parts.push(Part::Text(Span::new(at, at + 1)));
        } else {
            match self.peek() {
                Some(q @ (b'"' | b'\'')) => {
                    attribute.quoted = true;
                    self.eat_token(TokenType::Quote, 1);
                    self.sequence(Some(q))?;
                    if self.component.parts.len() == start {
                        let at = self.position as u32;
                        self.component.parts.push(Part::Text(Span::new(at, at)));
                    }
                    self.eat_token(TokenType::Quote, 1);
                }
                Some(_) => {
                    self.sequence(None)?;
                    if self.component.parts.len() == start {
                        return self.err("expected an attribute value");
                    }
                }
                None => return self.err("expected an attribute value"),
            }
        }
        attribute.value = AttributeValue::Parts(self.parts_since(start));
        Ok(())
    }
}

pub(super) fn attribute_name_len(bytes: &[u8]) -> usize {
    bytes
        .iter()
        .position(|&byte| {
            byte.is_ascii_whitespace() || matches!(byte, b'=' | b'>' | b'/' | b'"' | b'\'')
        })
        .unwrap_or(bytes.len())
}
