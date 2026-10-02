//! A tolerant subset parser: style rules with selector lists, declarations and at-rules with
//! either a block of rules or a block of declarations. Anything else is a [`ParseError`].

use rsvelte_kernel::source::positions::Span;

use crate::syntax_tree::{
    Combinator, ComplexSelector, Declaration, RelativeSelector, Rule, RuleKind, Simple, StyleSheet,
};

#[derive(Debug, Clone)]
pub struct ParseError {
    pub message: String,
    pub span: Span,
}

type R<T> = Result<T, ParseError>;

/// Parses `content` (a range of `source_text`) as a style sheet.
///
/// # Errors
///
/// [`ParseError`] at the first syntax error: an unterminated comment, a missing brace, or a
/// malformed selector or declaration.
pub fn parse(source_text: &str, content: Span) -> R<StyleSheet> {
    let mut p = P {
        b: source_text.as_bytes(),
        source_text,
        position: content.start_offset as usize,
        end: content.end_offset as usize,
    };
    let rules = p.rules(false)?;
    Ok(StyleSheet { content, rules })
}

struct P<'a> {
    b: &'a [u8],
    source_text: &'a str,
    position: usize,
    end: usize,
}

const fn is_ident_byte(c: u8) -> bool {
    c.is_ascii_alphanumeric() || c == b'-' || c == b'_' || c >= 0x80
}

impl P<'_> {
    fn fail<X>(&self, message: &str) -> R<X> {
        Err(ParseError {
            message: message.to_owned(),
            span: Span::new(self.position as u32, self.position as u32),
        })
    }

    fn peek(&self) -> Option<u8> {
        (self.position < self.end).then(|| self.b[self.position])
    }

    const fn span(&self, start_offset: usize) -> Span {
        Span::new(start_offset as u32, self.position as u32)
    }

    fn skip_trivia(&mut self) -> R<()> {
        loop {
            while self.peek().is_some_and(|c| c.is_ascii_whitespace()) {
                self.position += 1;
            }
            if self.source_text[self.position..self.end].starts_with("/*") {
                match self.source_text[self.position + 2..self.end].find("*/") {
                    Some(i) => self.position += i + 4,
                    None => return self.fail("unterminated comment"),
                }
            } else {
                return Ok(());
            }
        }
    }

    fn ident(&mut self) -> Span {
        let start_offset = self.position;
        while self.peek().is_some_and(is_ident_byte) {
            self.position += 1;
        }
        self.span(start_offset)
    }

    /// Skips to the byte that closes the current nesting level, honouring strings and brackets.
    fn skip_balanced_until(&mut self, stops: &[u8]) {
        let mut depth = 0usize;
        while let Some(c) = self.peek() {
            match c {
                b'"' | b'\'' => {
                    self.position += 1;
                    while let Some(d) = self.peek() {
                        self.position += 1;
                        if d == b'\\' {
                            self.position += 1;
                        } else if d == c {
                            break;
                        }
                    }
                    continue;
                }
                b'(' | b'[' => depth += 1,
                b')' | b']' => depth = depth.saturating_sub(1),
                _ if depth == 0 && stops.contains(&c) => return,
                _ => {}
            }
            self.position += 1;
        }
    }

    fn rules(&mut self, nested: bool) -> R<Vec<Rule>> {
        let mut rules = Vec::new();
        loop {
            self.skip_trivia()?;
            match self.peek() {
                None if !nested => return Ok(rules),
                None => return self.fail("expected `}`"),
                Some(b'}') if nested => return Ok(rules),
                Some(b'@') => rules.push(self.at_rule()?),
                Some(_) => rules.push(self.style_rule()?),
            }
        }
    }

    fn at_rule(&mut self) -> R<Rule> {
        let start_offset = self.position;
        self.position += 1;
        let name = self.ident();
        let prelude_start_offset = self.position;
        self.skip_balanced_until(b"{;");
        let prelude = trim(self.source_text, self.span(prelude_start_offset));
        match self.peek() {
            Some(b';') => {
                self.position += 1;
                Ok(Rule {
                    span: self.span(start_offset),
                    kind: RuleKind::At {
                        name,
                        prelude,
                        block: None,
                    },
                    declarations: Vec::new(),
                    children: Vec::new(),
                })
            }
            Some(b'{') => {
                let block_start_offset = self.position;
                self.position += 1;
                let name_text = name.text(self.source_text);
                let (declarations, children) =
                    if matches!(name_text, "media" | "supports" | "layer" | "container") {
                        (Vec::new(), self.rules(true)?)
                    } else {
                        (self.declarations()?, Vec::new())
                    };
                self.expect(b'}')?;
                Ok(Rule {
                    span: self.span(start_offset),
                    kind: RuleKind::At {
                        name,
                        prelude,
                        block: Some(self.span(block_start_offset)),
                    },
                    declarations,
                    children,
                })
            }
            _ => self.fail("expected `{` or `;` after at-rule"),
        }
    }

    fn expect(&mut self, c: u8) -> R<()> {
        if self.peek() != Some(c) {
            return self.fail(&format!("expected `{}`", c as char));
        }
        self.position += 1;
        Ok(())
    }

    fn style_rule(&mut self) -> R<Rule> {
        let start_offset = self.position;
        let mut selectors = Vec::new();
        loop {
            selectors.push(self.complex()?);
            self.skip_trivia()?;
            match self.peek() {
                Some(b',') => {
                    self.position += 1;
                    self.skip_trivia()?;
                }
                Some(b'{') => break,
                _ => return self.fail("expected `,` or `{` in selector"),
            }
        }
        let block_start_offset = self.position;
        self.position += 1;
        let declarations = self.declarations()?;
        self.expect(b'}')?;
        Ok(Rule {
            span: self.span(start_offset),
            kind: RuleKind::Style {
                selectors,
                block: self.span(block_start_offset),
            },
            declarations,
            children: Vec::new(),
        })
    }

    fn complex(&mut self) -> R<ComplexSelector> {
        let start_offset = self.position;
        let mut parts = vec![self.relative(None)?];
        loop {
            let before = self.position;
            self.skip_trivia()?;
            let explicit = match self.peek() {
                Some(b'>') => Some(Combinator::Child),
                Some(b'+') => Some(Combinator::NextSibling),
                Some(b'~') => Some(Combinator::SubsequentSibling),
                _ => None,
            };
            let combinator = match (explicit, self.peek()) {
                (Some(c), _) => {
                    self.position += 1;
                    self.skip_trivia()?;
                    c
                }
                (None, Some(b',' | b'{') | None) => {
                    self.position = before;
                    break;
                }
                (None, _) if self.position > before => Combinator::Descendant,
                (None, _) => return self.fail("unexpected character in selector"),
            };
            parts.push(self.relative(Some(combinator))?);
        }
        Ok(ComplexSelector {
            span: self.span(start_offset),
            parts,
        })
    }

    fn relative(&mut self, combinator: Option<Combinator>) -> R<RelativeSelector> {
        let start_offset = self.position;
        let mut simple = Vec::new();
        loop {
            let s = self.position;
            match self.peek() {
                Some(b'.') => {
                    self.position += 1;
                    let name = self.ident();
                    simple.push(Simple::Class {
                        span: self.span(s),
                        name,
                    });
                }
                Some(b'#') => {
                    self.position += 1;
                    let name = self.ident();
                    simple.push(Simple::Identifier {
                        span: self.span(s),
                        name,
                    });
                }
                Some(b'*') => {
                    self.position += 1;
                    simple.push(Simple::Universal(self.span(s)));
                }
                Some(b'[') => {
                    self.position += 1;
                    self.skip_trivia()?;
                    let name = self.ident();
                    self.skip_balanced_until(b"]");
                    self.expect(b']')?;
                    simple.push(Simple::Attribute {
                        span: self.span(s),
                        name,
                    });
                }
                Some(b':') => {
                    self.position += 1;
                    let element = self.peek() == Some(b':');
                    if element {
                        self.position += 1;
                    }
                    let name = self.ident();
                    let arguments = if !element && self.peek() == Some(b'(') {
                        self.position += 1;
                        let a = self.position;
                        self.skip_balanced_until(b")");
                        let arguments = self.span(a);
                        self.expect(b')')?;
                        Some(arguments)
                    } else {
                        None
                    };
                    simple.push(if element {
                        Simple::PseudoElement {
                            span: self.span(s),
                            name,
                        }
                    } else {
                        Simple::PseudoClass {
                            span: self.span(s),
                            name,
                            arguments,
                        }
                    });
                }
                Some(c) if is_ident_byte(c) && simple.is_empty() => {
                    let name = self.ident();
                    simple.push(Simple::Type(name));
                }
                _ => break,
            }
        }
        if simple.is_empty() {
            return self.fail("expected a selector");
        }
        Ok(RelativeSelector {
            combinator,
            span: self.span(start_offset),
            simple,
        })
    }

    fn declarations(&mut self) -> R<Vec<Declaration>> {
        let mut declarations = Vec::new();
        loop {
            self.skip_trivia()?;
            match self.peek() {
                Some(b'}') | None => return Ok(declarations),
                Some(b';') => self.position += 1,
                Some(_) => {
                    let start_offset = self.position;
                    let property = self.ident();
                    if property.is_empty() {
                        return self.fail("expected a property name");
                    }
                    self.skip_trivia()?;
                    self.expect(b':')?;
                    self.skip_trivia()?;
                    let v = self.position;
                    self.skip_balanced_until(b";}");
                    let value = trim(self.source_text, self.span(v));
                    declarations.push(Declaration {
                        span: Span::new(start_offset as u32, value.end_offset),
                        property,
                        value,
                    });
                }
            }
        }
    }
}

fn trim(source_text: &str, s: Span) -> Span {
    let t = s.text(source_text);
    let rest = t.trim_start();
    let lead = t.len() - rest.len();
    // Measured on what the leading trim left, so an all-whitespace span is not trimmed twice.
    let trail = rest.len() - rest.trim_end().len();
    Span::new(s.start_offset + lead as u32, s.end_offset - trail as u32)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::syntax_tree::RuleKind;

    fn prelude(stylesheet: &str) -> &str {
        let sheet = parse(stylesheet, Span::new(0, stylesheet.len() as u32)).expect("parses");
        match sheet.rules[0].kind {
            RuleKind::At { prelude, .. } => prelude.text(stylesheet),
            RuleKind::Style { .. } => panic!("not an at-rule"),
        }
    }

    #[test]
    fn an_at_rule_prelude_is_trimmed() {
        assert_eq!(prelude("@media  screen and (x) { }"), "screen and (x)");
    }

    #[test]
    fn a_whitespace_only_prelude_is_empty() {
        assert_eq!(prelude("@font-face { src: local(x); }"), "");
        assert_eq!(prelude("@font-face   \n{ src: local(x); }"), "");
    }
}
