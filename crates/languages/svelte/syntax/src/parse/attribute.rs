use oxc_parser::Kind;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;

use super::{ParseResult, Parser};
use crate::syntax_tree::{Attribute, AttributeKind, AttributeValue, Part, Range, TokenType};

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

/// Upstream's `unique_names` namespaces: `bind:x` names `x` as an attribute does, while `class:x`
/// and `style:x` each have their own.
#[derive(Clone, Copy, PartialEq, Eq, Hash)]
pub(super) enum Unique {
    Attribute,
    Class,
    Style,
}

impl Parser<'_, '_> {
    /// Upstream raises `attribute_duplicate` as it reads a start tag; `this` may repeat.
    pub(super) fn unique(&mut self, namespace: Unique, name: Span, span: Span) -> ParseResult<()> {
        let name = name.text(self.source_text);
        if self.unique_names.contains(&(namespace, name)) {
            return Self::err_at(span, "attribute_duplicate", "Attributes need to be unique");
        }
        if name != "this" {
            self.unique_names.insert((namespace, name));
        }
        Ok(())
    }

    fn unique_attribute(&mut self, a: &Attribute) -> ParseResult<()> {
        let (namespace, name) = match a.kind {
            AttributeKind::Attribute => (Unique::Attribute, a.name),
            AttributeKind::Bind => (Unique::Attribute, self.directive_name(a)),
            AttributeKind::Class => (Unique::Class, self.directive_name(a)),
            AttributeKind::Style => (Unique::Style, self.directive_name(a)),
            _ => return Ok(()),
        };
        self.unique(namespace, name, a.span)
    }

    fn directive_name(&self, a: &Attribute) -> Span {
        let Some(name) = a.directive_name(&self.component.modifiers) else {
            unreachable!("a directive has a name")
        };
        name
    }

    pub(super) fn attributes(&mut self) -> ParseResult<(Range, bool)> {
        let start = self.component.attributes.len();
        self.unique_names.clear();
        loop {
            self.skip_ws();
            match self.peek() {
                None => return self.unexpected_eof(),
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
                    self.unique_attribute(&a)?;
                    self.component.attributes.push(a);
                }
                Some(_) => {
                    let a = self.attribute()?;
                    self.unique_attribute(&a)?;
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
                None => return self.err("parse_error", "unterminated comment"),
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
        } else if self.eat_word(TokenType::JavaScript(Kind::Dot3), "...") {
            AttributeKind::Spread
        } else {
            AttributeKind::Attribute
        };
        let name_start = self.position as u32;
        let name_end = name_start + super::identifier::identifier_len(self.rest()) as u32;
        let expression = if kind == AttributeKind::Attribute {
            if self.binding_name_len()? == 0 {
                let at = Span::new(start_offset as u32, start_offset as u32);
                return Self::err_at(
                    at,
                    "attribute_empty_shorthand",
                    "Attribute shorthand cannot be empty",
                );
            }
            self.identifier()?
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
            Span::new(name_start, name_end)
        } else {
            Span::new(start_offset as u32, start_offset as u32)
        };
        Ok(Attribute {
            kind,
            name,
            modifiers: Range::default(),
            target: None,
            value: AttributeValue::Parts(self.parts_since(parts)),
            span,
            quoted: false,
            shorthand: kind == AttributeKind::Attribute,
        })
    }

    fn attribute(&mut self) -> ParseResult<Attribute> {
        let start_offset = self.position;
        self.position += attribute_name_len(self.rest());
        let name = Span::new(start_offset as u32, self.position as u32);
        if name.is_empty() {
            return self.expected_token(">");
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
            target: None,
            value: AttributeValue::True,
            span: name,
            quoted: false,
            shorthand: false,
        };
        let directive = attribute.directive_name(&self.component.modifiers);
        let name_end = self.position;
        self.skip_ws();
        let end_offset = if self.peek() == Some(b'=') {
            self.eat_token(TokenType::Eq, 1);
            self.skip_ws();
            self.attribute_value(&mut attribute)?;
            self.position
        } else {
            if matches!(self.peek(), Some(b'"' | b'\'')) {
                return self.expected_token("=");
            }
            // The whitespace belongs to the start tag, not to the attribute.
            name_end
        };
        attribute.span = Span::new(start_offset as u32, end_offset as u32);
        // Upstream reads the value first and names the whole attribute, modifiers too.
        if let Some(empty) = directive.filter(|d| d.is_empty()) {
            return Self::err_at(
                Span::new(name.start_offset, empty.start_offset),
                "directive_missing_name",
                format_args!("`{name_text}` name cannot be empty"),
            );
        }
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
                    let quote = quote_token(q);
                    self.eat_token(quote, 1);
                    self.sequence(Some(q))?;
                    if self.component.parts.len() == start {
                        let at = self.position as u32;
                        self.component.parts.push(Part::Text(Span::new(at, at)));
                    }
                    self.eat_token(quote, 1);
                }
                Some(_) => {
                    self.sequence(None)?;
                    if self.component.parts.len() == start {
                        return self.err("expected_attribute_value", "Expected attribute value");
                    }
                }
                None => return self.err("expected_attribute_value", "Expected attribute value"),
            }
        }
        attribute.value = AttributeValue::Parts(self.parts_since(start));
        Ok(())
    }
}

/// Upstream `regex_token_ending_character`, `/[\s=/>"']/`.
pub(super) fn attribute_name_len(text: &str) -> usize {
    text.find(|c| is_ecmascript_whitespace(c) || matches!(c, '=' | '>' | '/' | '"' | '\''))
        .unwrap_or(text.len())
}

/// The token of the quote `q`, `"` or `'`.
pub(super) const fn quote_token(q: u8) -> TokenType {
    if q == b'"' {
        TokenType::DoubleQuote
    } else {
        TokenType::SingleQuote
    }
}
