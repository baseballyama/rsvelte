//! A tolerant subset parser: style rules with selector lists, declarations and at-rules with
//! either a block of rules or a block of declarations. Anything else is a [`ParseError`].

use rsvelte_kernel::source::index::TypedIndex;
use rsvelte_kernel::source::interning::{Atom, Interner};
use rsvelte_kernel::source::positions::Span;
use rustc_hash::FxHashMap;

use crate::syntax_tree::{Declaration, Rule, RuleIdentifier, RuleKind, StyleSheet};

#[derive(Debug, Clone)]
pub struct ParseError {
    pub message: String,
    pub span: Span,
}

mod selectors;

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
        comments: Vec::new(),
        whitespace: Vec::new(),
        comment_closers: Vec::new(),
        selector_count: 0,
        relative_count: 0,
        value_tokens: Vec::new(),
        rule_count: 0,
        current_rule: None,
        selector_parent: None,
        atoms: Interner::new(),
        escaped: FxHashMap::default(),
    };
    let rules = p.rules(false)?;
    Ok(StyleSheet {
        content,
        rules: rules.into_boxed_slice(),
        comments: p.comments,
        whitespace: p.whitespace.into_boxed_slice(),
        comment_closers: p.comment_closers,
        selector_count: p.selector_count,
        relative_count: p.relative_count,
        value_tokens: p.value_tokens,
        rule_count: p.rule_count,
        atoms: p.atoms,
        escaped: p.escaped,
    })
}

struct P<'a> {
    b: &'a [u8],
    source_text: &'a str,
    position: usize,
    end: usize,
    comments: Vec<Span>,
    whitespace: Vec<Span>,
    comment_closers: Vec<Span>,
    selector_count: u32,
    relative_count: u32,
    value_tokens: Vec<Span>,
    rule_count: usize,
    current_rule: Option<RuleIdentifier>,
    selector_parent: Option<RuleIdentifier>,
    atoms: Interner,
    escaped: FxHashMap<Span, Atom>,
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

    fn whitespace(&mut self) {
        let start = self.position;
        while self.peek().is_some_and(|c| c.is_ascii_whitespace()) {
            self.position += 1;
        }
        if self.position != start {
            self.whitespace.push(self.span(start));
        }
    }

    fn skip_trivia(&mut self) -> R<()> {
        loop {
            self.whitespace();
            let rest = &self.source_text[self.position..self.end];
            if rest.starts_with("<!--") {
                self.position += 4;
            } else if rest.starts_with("-->") {
                self.position += 3;
            } else if rest.starts_with("/*") {
                let start = self.position;
                match self.source_text[self.position + 2..self.end].find("*/") {
                    Some(i) => {
                        self.position += i + 4;
                        self.comments.push(self.span(start));
                    }
                    None => return self.fail("unterminated comment"),
                }
            } else {
                return Ok(());
            }
        }
    }

    fn ident(&mut self) -> Span {
        let start = self.position;
        let mut decoded = None::<String>;
        let mut plain = start;
        while let Some(byte) = self.peek() {
            if byte == b'\\' {
                let text = decoded.get_or_insert_with(String::new);
                text.push_str(&self.source_text[plain..self.position]);
                self.position += 1;
                text.push(self.escape());
                plain = self.position;
            } else if is_ident_byte(byte) {
                self.position += 1;
            } else {
                break;
            }
        }
        let span = self.span(start);
        if let Some(mut text) = decoded {
            text.push_str(&self.source_text[plain..self.position]);
            self.escaped.insert(span, self.atoms.intern(&text));
        }
        span
    }

    fn escape(&mut self) -> char {
        let start = self.position;
        let mut value = 0;
        while self.position - start < 6 {
            let Some(digit) = self.peek().and_then(|b| char::from(b).to_digit(16)) else {
                break;
            };
            value = value * 16 + digit;
            self.position += 1;
        }
        if self.position > start {
            if self.peek().is_some_and(|b| b.is_ascii_whitespace()) {
                let cr = self.peek() == Some(b'\r');
                self.position += 1;
                if cr && self.peek() == Some(b'\n') {
                    self.position += 1;
                }
            }
            return char::from_u32(value).filter(|c| *c != '\0').unwrap_or('�');
        }
        let Some(c) = self.source_text[self.position..self.end].chars().next() else {
            return '�';
        };
        self.position += c.len_utf8();
        c
    }

    fn string(&mut self) -> R<Span> {
        let start = self.position;
        let quote = self.peek().expect("a string starts with a quote");
        self.position += 1;
        let mut plain = self.position;
        let mut decoded = None::<String>;
        while let Some(byte) = self.peek() {
            if byte == quote {
                let end = self.position;
                self.position += 1;
                if let Some(mut text) = decoded {
                    text.push_str(&self.source_text[plain..end]);
                    let span = Span::new(start as u32 + 1, end as u32);
                    self.escaped.insert(span, self.atoms.intern(&text));
                }
                return Ok(self.span(start));
            }
            if byte == b'\\' {
                let text = decoded.get_or_insert_with(String::new);
                text.push_str(&self.source_text[plain..self.position]);
                self.position += 1;
                if self.peek() == Some(b'*') && self.b.get(self.position + 1) == Some(&b'/') {
                    self.comment_closers.push(Span::new(
                        self.position as u32 + 1,
                        self.position as u32 + 2,
                    ));
                }
                if matches!(self.peek(), Some(b'\n' | b'\r')) {
                    let cr = self.peek() == Some(b'\r');
                    self.position += 1;
                    if cr && self.peek() == Some(b'\n') {
                        self.position += 1;
                    }
                } else {
                    text.push(self.escape());
                }
                plain = self.position;
            } else {
                self.position += 1;
                if byte == b'*' && self.peek() == Some(b'/') {
                    self.comment_closers
                        .push(Span::new(self.position as u32, self.position as u32 + 1));
                }
            }
        }
        self.fail("unterminated string")
    }

    fn skip_balanced_until(&mut self, stops: &[u8]) -> R<()> {
        let mut depth = 0usize;
        while let Some(c) = self.peek() {
            if depth == 0 && stops.contains(&c) {
                return Ok(());
            }
            if c.is_ascii_whitespace() {
                self.whitespace();
                continue;
            }
            if c == b'/' && self.b.get(self.position + 1) == Some(&b'*') {
                self.skip_trivia()?;
                continue;
            }
            match c {
                b'"' | b'\'' => {
                    self.string()?;
                    continue;
                }
                b'(' | b'[' => depth += 1,
                b')' | b']' => depth = depth.saturating_sub(1),
                _ => {}
            }
            self.position += 1;
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
                Some(b'@') => push(&mut rules, self.at_rule()?),
                Some(_) => push(&mut rules, self.style_rule()?),
            }
        }
    }

    fn at_rule(&mut self) -> R<Rule> {
        let start_offset = self.position;
        self.position += 1;
        let name = self.ident();
        let prelude_start_offset = self.position;
        self.skip_balanced_until(b"{;")?;
        let prelude = trim(self.source_text, self.span(prelude_start_offset));
        match self.peek() {
            Some(b';') => {
                self.position += 1;
                Ok(Rule {
                    identifier: None,
                    parent: self.current_rule,
                    span: self.span(start_offset),
                    kind: RuleKind::At {
                        name,
                        prelude,
                        block: None,
                    },
                    declarations: Box::default(),
                    children: Box::default(),
                })
            }
            Some(b'{') => {
                let block_start_offset = self.position;
                self.position += 1;
                let name_text = name.text(self.source_text);
                let (declarations, children) = if name_text.ends_with("keyframes") {
                    (Vec::new(), self.keyframes()?)
                } else {
                    self.body()?
                };
                self.expect(b'}')?;
                Ok(Rule {
                    identifier: None,
                    parent: self.current_rule,
                    span: self.span(start_offset),
                    kind: RuleKind::At {
                        name,
                        prelude,
                        block: Some(self.span(block_start_offset)),
                    },
                    declarations: declarations.into_boxed_slice(),
                    children: children.into_boxed_slice(),
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
        let identifier = RuleIdentifier::new(self.rule_count);
        self.rule_count += 1;
        let parent = self.current_rule;
        let previous_parent = self.selector_parent;
        self.selector_parent = parent;
        let start_offset = self.position;
        let mut selectors = Vec::new();
        loop {
            push(&mut selectors, self.complex()?);
            self.skip_trivia()?;
            match self.peek() {
                Some(b',') => {
                    selectors
                        .last_mut()
                        .expect("a selector precedes the comma")
                        .comma = Some(Span::new(self.position as u32, self.position as u32 + 1));
                    self.position += 1;
                    self.skip_trivia()?;
                }
                Some(b'{') => break,
                _ => return self.fail("expected `,` or `{` in selector"),
            }
        }
        let block_start_offset = self.position;
        self.position += 1;
        self.current_rule = Some(identifier);
        let (declarations, children) = self.body()?;
        self.expect(b'}')?;
        self.current_rule = parent;
        self.selector_parent = previous_parent;
        Ok(Rule {
            identifier: Some(identifier),
            parent,
            span: self.span(start_offset),
            kind: RuleKind::Style {
                selectors: selectors.into_boxed_slice(),
                block: self.span(block_start_offset),
            },
            declarations: declarations.into_boxed_slice(),
            children: children.into_boxed_slice(),
        })
    }

    fn body(&mut self) -> R<(Vec<Declaration>, Vec<Rule>)> {
        let mut declarations = Vec::new();
        let mut children = Vec::new();
        loop {
            self.skip_trivia()?;
            match self.peek() {
                Some(b'}') | None => return Ok((declarations, children)),
                Some(b';') => self.position += 1,
                Some(b'@') => push(&mut children, self.at_rule()?),
                Some(_) => {
                    let start = self.position;
                    let comments = self.comments.len();
                    let whitespace = self.whitespace.len();
                    let closers = self.comment_closers.len();
                    self.skip_balanced_until(b"{;}")?;
                    let nested = self.peek() == Some(b'{');
                    self.position = start;
                    self.comments.truncate(comments);
                    self.whitespace.truncate(whitespace);
                    self.comment_closers.truncate(closers);
                    if nested {
                        push(&mut children, self.style_rule()?);
                    } else {
                        let property_start = self.position;
                        while self
                            .peek()
                            .is_some_and(|c| !c.is_ascii_whitespace() && c != b':')
                        {
                            self.position += 1;
                        }
                        let property = self.span(property_start);
                        if property.is_empty() {
                            return self.fail("expected a property name");
                        }
                        self.skip_trivia()?;
                        if self.peek() == Some(b':') {
                            self.position += 1;
                        }
                        self.skip_trivia()?;
                        let value_start = self.position;
                        let tokens = self.value_tokens(property)?;
                        let value = trim(self.source_text, self.span(value_start));
                        push(
                            &mut declarations,
                            Declaration {
                                span: Span::new(start as u32, value.end_offset),
                                property,
                                value,
                                tokens,
                            },
                        );
                    }
                }
            }
        }
    }

    fn value_tokens(&mut self, property: Span) -> R<std::ops::Range<u32>> {
        let first = self.value_tokens.len() as u32;
        let text = property.text(self.source_text);
        let text = text
            .strip_prefix("-webkit-")
            .or_else(|| text.strip_prefix("-moz-"))
            .or_else(|| text.strip_prefix("-o-"))
            .unwrap_or(text);
        let collect =
            text.eq_ignore_ascii_case("animation") || text.eq_ignore_ascii_case("animation-name");
        while let Some(c) = self.peek() {
            match c {
                c if c.is_ascii_whitespace() => self.whitespace(),
                b';' | b'}' => break,
                b'/' if self.b.get(self.position + 1) == Some(&b'*') => self.skip_trivia()?,
                b'\'' | b'"' | b'(' | b'[' => {
                    let start = self.position;
                    self.position += 1;
                    if matches!(c, b'\'' | b'"') {
                        self.position = start;
                        self.string()?;
                    } else {
                        self.skip_balanced_until(if c == b'(' { b")" } else { b"]" })?;
                        self.expect(if c == b'(' { b')' } else { b']' })?;
                    }
                    if collect {
                        self.value_tokens.push(self.span(start));
                    }
                }
                _ if is_ident_byte(c) || c == b'\\' => {
                    let start = self.position;
                    self.ident();
                    if self.position == start {
                        self.position += 1;
                    }
                    if self.peek() == Some(b'(') {
                        self.position += 1;
                        self.skip_balanced_until(b")")?;
                        self.expect(b')')?;
                    }
                    if collect {
                        self.value_tokens.push(self.span(start));
                    }
                }
                _ => self.position += 1,
            }
        }
        Ok(first..self.value_tokens.len() as u32)
    }

    fn keyframes(&mut self) -> R<Vec<Rule>> {
        let mut frames = Vec::new();
        loop {
            self.skip_trivia()?;
            if self.peek() == Some(b'}') {
                return Ok(frames);
            }
            let start = self.position;
            self.skip_balanced_until(b"{")?;
            let prelude = self.span(start);
            let block = self.position;
            self.expect(b'{')?;
            let (declarations, children) = self.body()?;
            self.expect(b'}')?;
            push(
                &mut frames,
                Rule {
                    identifier: None,
                    parent: self.current_rule,
                    span: self.span(start),
                    kind: RuleKind::Keyframe {
                        prelude,
                        block: self.span(block),
                    },
                    declarations: declarations.into_boxed_slice(),
                    children: children.into_boxed_slice(),
                },
            );
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

fn push<T>(values: &mut Vec<T>, value: T) {
    if values.len() <= 1 {
        values.reserve_exact(1);
    }
    values.push(value);
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::syntax_tree::RuleKind;

    fn prelude(stylesheet: &str) -> &str {
        let sheet = parse(stylesheet, Span::new(0, stylesheet.len() as u32)).expect("parses");
        match sheet.rules[0].kind {
            RuleKind::At { prelude, .. } => prelude.text(stylesheet),
            RuleKind::Style { .. } | RuleKind::Keyframe { .. } => panic!("not an at-rule"),
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
