//! A tolerant subset parser: style rules with selector lists, declarations and at-rules with
//! either a block of rules or a block of declarations. Anything else is a [`ParseError`].

use crate::ast::*;
use rsv_kernel::source::Span;

#[derive(Debug, Clone)]
pub struct ParseError {
    pub message: String,
    pub span: Span,
}

type R<T> = Result<T, ParseError>;

/// Parses `content` (a range of `src`) as a style sheet.
pub fn parse(src: &str, content: Span) -> R<StyleSheet> {
    let mut p = P {
        b: src.as_bytes(),
        src,
        pos: content.lo as usize,
        end: content.hi as usize,
    };
    let rules = p.rules(false)?;
    Ok(StyleSheet { content, rules })
}

struct P<'a> {
    b: &'a [u8],
    src: &'a str,
    pos: usize,
    end: usize,
}

fn is_ident_byte(c: u8) -> bool {
    c.is_ascii_alphanumeric() || c == b'-' || c == b'_' || c >= 0x80
}

impl P<'_> {
    fn fail<X>(&self, message: &str) -> R<X> {
        Err(ParseError {
            message: message.to_owned(),
            span: Span::new(self.pos as u32, self.pos as u32),
        })
    }

    fn peek(&self) -> Option<u8> {
        (self.pos < self.end).then(|| self.b[self.pos])
    }

    fn span(&self, lo: usize) -> Span {
        Span::new(lo as u32, self.pos as u32)
    }

    fn skip_trivia(&mut self) -> R<()> {
        loop {
            while self.peek().is_some_and(|c| c.is_ascii_whitespace()) {
                self.pos += 1;
            }
            if self.src[self.pos..self.end].starts_with("/*") {
                match self.src[self.pos + 2..self.end].find("*/") {
                    Some(i) => self.pos += i + 4,
                    None => return self.fail("unterminated comment"),
                }
            } else {
                return Ok(());
            }
        }
    }

    fn ident(&mut self) -> Span {
        let lo = self.pos;
        while self.peek().is_some_and(is_ident_byte) {
            self.pos += 1;
        }
        self.span(lo)
    }

    /// Skips to the byte that closes the current nesting level, honouring strings and brackets.
    fn skip_balanced_until(&mut self, stops: &[u8]) -> R<()> {
        let mut depth = 0usize;
        while let Some(c) = self.peek() {
            match c {
                b'"' | b'\'' => {
                    self.pos += 1;
                    while let Some(d) = self.peek() {
                        self.pos += 1;
                        if d == b'\\' {
                            self.pos += 1;
                        } else if d == c {
                            break;
                        }
                    }
                    continue;
                }
                b'(' | b'[' => depth += 1,
                b')' | b']' => depth = depth.saturating_sub(1),
                _ if depth == 0 && stops.contains(&c) => return Ok(()),
                _ => {}
            }
            self.pos += 1;
        }
        Ok(())
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
        let lo = self.pos;
        self.pos += 1;
        let name = self.ident();
        let prelude_lo = self.pos;
        self.skip_balanced_until(b"{;")?;
        let prelude = trim(self.src, self.span(prelude_lo));
        match self.peek() {
            Some(b';') => {
                self.pos += 1;
                Ok(Rule {
                    span: self.span(lo),
                    kind: RuleKind::At {
                        name,
                        prelude,
                        block: None,
                    },
                    decls: Vec::new(),
                    children: Vec::new(),
                })
            }
            Some(b'{') => {
                let block_lo = self.pos;
                self.pos += 1;
                let name_text = name.text(self.src);
                let (decls, children) =
                    if matches!(name_text, "media" | "supports" | "layer" | "container") {
                        (Vec::new(), self.rules(true)?)
                    } else {
                        (self.decls()?, Vec::new())
                    };
                self.expect(b'}')?;
                Ok(Rule {
                    span: self.span(lo),
                    kind: RuleKind::At {
                        name,
                        prelude,
                        block: Some(self.span(block_lo)),
                    },
                    decls,
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
        self.pos += 1;
        Ok(())
    }

    fn style_rule(&mut self) -> R<Rule> {
        let lo = self.pos;
        let mut selectors = Vec::new();
        loop {
            selectors.push(self.complex()?);
            self.skip_trivia()?;
            match self.peek() {
                Some(b',') => {
                    self.pos += 1;
                    self.skip_trivia()?;
                }
                Some(b'{') => break,
                _ => return self.fail("expected `,` or `{` in selector"),
            }
        }
        let block_lo = self.pos;
        self.pos += 1;
        let decls = self.decls()?;
        self.expect(b'}')?;
        Ok(Rule {
            span: self.span(lo),
            kind: RuleKind::Style {
                selectors,
                block: self.span(block_lo),
            },
            decls,
            children: Vec::new(),
        })
    }

    fn complex(&mut self) -> R<ComplexSelector> {
        let lo = self.pos;
        let mut parts = vec![self.relative(None)?];
        loop {
            let before = self.pos;
            self.skip_trivia()?;
            let explicit = match self.peek() {
                Some(b'>') => Some(Combinator::Child),
                Some(b'+') => Some(Combinator::NextSibling),
                Some(b'~') => Some(Combinator::SubsequentSibling),
                _ => None,
            };
            let combinator = match (explicit, self.peek()) {
                (Some(c), _) => {
                    self.pos += 1;
                    self.skip_trivia()?;
                    c
                }
                (None, Some(b',' | b'{') | None) => {
                    self.pos = before;
                    break;
                }
                (None, _) if self.pos > before => Combinator::Descendant,
                (None, _) => return self.fail("unexpected character in selector"),
            };
            parts.push(self.relative(Some(combinator))?);
        }
        Ok(ComplexSelector {
            span: self.span(lo),
            parts,
        })
    }

    fn relative(&mut self, combinator: Option<Combinator>) -> R<RelativeSelector> {
        let lo = self.pos;
        let mut simple = Vec::new();
        loop {
            let s = self.pos;
            match self.peek() {
                Some(b'.') => {
                    self.pos += 1;
                    let name = self.ident();
                    simple.push(Simple::Class {
                        span: self.span(s),
                        name,
                    });
                }
                Some(b'#') => {
                    self.pos += 1;
                    let name = self.ident();
                    simple.push(Simple::Id {
                        span: self.span(s),
                        name,
                    });
                }
                Some(b'*') => {
                    self.pos += 1;
                    simple.push(Simple::Universal(self.span(s)));
                }
                Some(b'[') => {
                    self.pos += 1;
                    self.skip_trivia()?;
                    let name = self.ident();
                    self.skip_balanced_until(b"]")?;
                    self.expect(b']')?;
                    simple.push(Simple::Attribute {
                        span: self.span(s),
                        name,
                    });
                }
                Some(b':') => {
                    self.pos += 1;
                    let element = self.peek() == Some(b':');
                    if element {
                        self.pos += 1;
                    }
                    let name = self.ident();
                    let args = if !element && self.peek() == Some(b'(') {
                        self.pos += 1;
                        let a = self.pos;
                        self.skip_balanced_until(b")")?;
                        let args = self.span(a);
                        self.expect(b')')?;
                        Some(args)
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
                            args,
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
            span: self.span(lo),
            simple,
        })
    }

    fn decls(&mut self) -> R<Vec<Decl>> {
        let mut decls = Vec::new();
        loop {
            self.skip_trivia()?;
            match self.peek() {
                Some(b'}') | None => return Ok(decls),
                Some(b';') => self.pos += 1,
                Some(_) => {
                    let lo = self.pos;
                    let property = self.ident();
                    if property.is_empty() {
                        return self.fail("expected a property name");
                    }
                    self.skip_trivia()?;
                    self.expect(b':')?;
                    self.skip_trivia()?;
                    let v = self.pos;
                    self.skip_balanced_until(b";}")?;
                    let value = trim(self.src, self.span(v));
                    decls.push(Decl {
                        span: Span::new(lo as u32, value.hi),
                        property,
                        value,
                    });
                }
            }
        }
    }
}

fn trim(src: &str, s: Span) -> Span {
    let t = s.text(src);
    let lead = t.len() - t.trim_start().len();
    let trail = t.len() - t.trim_end().len();
    Span::new(s.lo + lead as u32, s.hi - trail as u32)
}
