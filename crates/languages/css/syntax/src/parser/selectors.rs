//! Selectors as Svelte reads them, with its errors at its positions. Where Svelte rejects a
//! selector that CSS allows (a comment between compounds, an `An+B` its pattern misses, a
//! namespace prefix), the selector parses.

use rsvelte_kernel::source::positions::Span;

use super::{P, ParseError, R, push};
use crate::syntax_tree::{
    AttributeOperator, Combinator, ComplexSelector, RelativeSelector, Simple, SimpleList,
};

impl P<'_> {
    /// Ends before the `{` of the block, or before the `)` of a pseudo-class.
    pub(super) fn selector_list(&mut self, inside_pseudo: bool) -> R<Vec<ComplexSelector>> {
        let mut selectors = Vec::new();
        self.skip_trivia()?;
        loop {
            push(&mut selectors, self.complex(inside_pseudo)?);
            self.skip_trivia()?;
            if self.peek() == Some(if inside_pseudo { b')' } else { b'{' }) {
                return Ok(selectors);
            }
            let comma = self.position as u32;
            self.expect(b',')?;
            selectors
                .last_mut()
                .expect("a selector precedes the comma")
                .comma = Some(Span::new(comma, comma + 1));
            self.skip_trivia()?;
        }
    }

    fn complex(&mut self, inside_pseudo: bool) -> R<ComplexSelector> {
        let id = self.selector_count;
        self.selector_count += 1;
        let start_offset = self.position;
        let mut combinator = if self.at_combinator() && !(inside_pseudo && self.nth().is_some()) {
            Some(self.combinators(inside_pseudo)?)
        } else {
            None
        };
        let mut parts = Vec::new();
        loop {
            push(&mut parts, self.relative(combinator, inside_pseudo)?);
            let end = self.position;
            let comments = self.comments.len();
            let whitespace = self.whitespace.len();
            self.skip_trivia()?;
            let ends = self.ends_selector(inside_pseudo);
            self.position = end;
            self.comments.truncate(comments);
            self.whitespace.truncate(whitespace);
            if ends {
                break;
            }
            combinator = Some(self.combinators(inside_pseudo)?);
        }
        if parts
            .iter()
            .any(|part| part.simple.iter().any(Simple::has_nesting))
        {
            for part in &mut parts {
                part.implicit_parent = false;
            }
        }
        let mut global = false;
        for part in &mut parts {
            global |= part
                .simple
                .iter()
                .any(|s| s.is_global_block(self.source_text));
            part.global = global;
        }
        Ok(ComplexSelector {
            id,
            span: self.span(start_offset),
            comma: None,
            parts: parts.into_boxed_slice(),
        })
    }

    fn ends_selector(&self, inside_pseudo: bool) -> bool {
        matches!(
            (self.peek(), inside_pseudo),
            (Some(b','), _) | (Some(b'{'), false) | (Some(b')'), true)
        )
    }

    fn at(&self, text: &[u8]) -> bool {
        self.b[self.position..self.end].starts_with(text)
    }

    fn at_combinator(&self) -> bool {
        matches!(self.peek(), Some(b'>' | b'+' | b'~')) || self.at(b"||")
    }

    /// The bar of a namespace prefix, which a column combinator `||` is not.
    fn at_namespace_bar(&self) -> bool {
        self.peek() == Some(b'|') && !self.at(b"||")
    }

    fn starts_compound(&self) -> bool {
        match self.peek() {
            Some(b'&' | b'*' | b'#' | b'.' | b':' | b'[' | b'\\') => true,
            Some(b'|') => self.at_namespace_bar(),
            Some(_) => self.starts_identifier(self.position),
            None => false,
        }
    }

    /// The combinators between two compounds, of which Svelte keeps the last, as in `a > + b`.
    fn combinators(&mut self, inside_pseudo: bool) -> R<Combinator> {
        // Svelte reads a name where a comment follows the whitespace before a compound.
        let mut comment = None;
        let mut spaced = false;
        let mut explicit = None;
        loop {
            let start = self.position;
            self.whitespace();
            spaced |= self.position > start;
            let at = self.position;
            if self.comment()? {
                comment.get_or_insert(at);
                continue;
            }
            let (combinator, length) = match self.peek() {
                Some(b'>') => (Combinator::Child, 1),
                Some(b'+') => (Combinator::NextSibling, 1),
                Some(b'~') => (Combinator::SubsequentSibling, 1),
                Some(b'|') if self.at(b"||") => (Combinator::Column, 2),
                _ => break,
            };
            self.position += length;
            explicit = Some(combinator);
        }
        let combinator = explicit.or_else(|| spaced.then_some(Combinator::Descendant));
        if let Some(combinator) = combinator
            && self.starts_compound()
        {
            return Ok(combinator);
        }
        if let Some(at) = comment {
            return Err(expected_identifier(at));
        }
        if explicit.is_some() && self.ends_selector(inside_pseudo) {
            return Err(ParseError {
                code: "css_selector_invalid",
                message: "Invalid selector".to_owned(),
                span: Span::new(self.position as u32, self.position as u32),
            });
        }
        // What follows is not a selector, which the compound after it reports.
        Ok(combinator.unwrap_or(Combinator::Descendant))
    }

    fn relative(
        &mut self,
        combinator: Option<Combinator>,
        inside_pseudo: bool,
    ) -> R<RelativeSelector> {
        let id = self.relative_count;
        self.relative_count += 1;
        let start_offset = self.position;
        let first = self.simple(inside_pseudo)?;
        let mut rest = Vec::new();
        while self.adjacent(inside_pseudo) {
            push(&mut rest, self.simple(inside_pseudo)?);
        }
        Ok(RelativeSelector {
            parent_rule: self.selector_parent,
            implicit_parent: true,
            global: false,
            id,
            combinator,
            span: self.span(start_offset),
            simple: SimpleList::new(first, rest.into_boxed_slice()),
        })
    }

    /// Whether a simple selector of the same compound follows: Svelte reads one at any byte that
    /// is not whitespace, a comment, a combinator or the end of the selector.
    fn adjacent(&self, inside_pseudo: bool) -> bool {
        match self.peek() {
            Some(c) if c.is_ascii_whitespace() => false,
            Some(b'>' | b'+' | b'~' | b',') => false,
            Some(b'{') => inside_pseudo,
            Some(b')') => !inside_pseudo,
            Some(b'|') => !self.at(b"||"),
            Some(b'/') => !self.at(b"/*"),
            Some(b'<') => !self.at(b"<!--"),
            None | Some(_) => true,
        }
    }

    fn simple(&mut self, inside_pseudo: bool) -> R<Simple> {
        let s = self.position;
        // Svelte reads an `An+B` in any pseudo-class, as a name no element has.
        if inside_pseudo && let Some(length) = self.nth() {
            self.position += length;
            let nth = self.span(s);
            self.whitespace();
            return Ok(Simple::Type(nth));
        }
        let Some(c) = self.peek() else {
            return Err(if self.end == self.b.len() {
                ParseError {
                    code: "unexpected_eof",
                    message: "Unexpected end of input".to_owned(),
                    span: Span::new(s as u32, s as u32),
                }
            } else {
                expected_identifier(s)
            });
        };
        Ok(match c {
            b'&' => {
                self.position += 1;
                Simple::Nesting(self.span(s))
            }
            b'*' => {
                self.position += 1;
                if self.at_namespace_bar() {
                    self.position += 1;
                    self.namespaced(s)?
                } else {
                    Simple::Universal(self.span(s))
                }
            }
            b'#' => {
                self.position += 1;
                let name = self.identifier()?;
                Simple::Identifier {
                    span: self.span(s),
                    name,
                }
            }
            b'.' => {
                self.position += 1;
                let name = self.identifier()?;
                Simple::Class {
                    span: self.span(s),
                    name,
                }
            }
            b':' => self.pseudo_selector(s)?,
            b'[' => self.attribute_selector(s)?,
            // No namespace, which Svelte reads as a name that starts at the bar.
            b'|' if self.at_namespace_bar() => {
                if self.b.get(s + 1) != Some(&b'*') && !self.starts_identifier(s + 1) {
                    return Err(expected_identifier(s));
                }
                self.position += 1;
                self.namespaced(s)?
            }
            _ => {
                self.identifier()?;
                if self.at_namespace_bar() {
                    self.position += 1;
                    self.namespaced(s)?
                } else {
                    Simple::Type(self.span(s))
                }
            }
        })
    }

    fn namespaced(&mut self, start: usize) -> R<Simple> {
        let name_start = self.position;
        if self.peek() == Some(b'*') {
            self.position += 1;
        } else {
            self.identifier()?;
        }
        Ok(Simple::NamespacedType {
            span: self.span(start),
            name: self.span(name_start),
        })
    }

    fn attribute_selector(&mut self, s: usize) -> R<Simple> {
        self.position += 1;
        self.whitespace();
        let name = self.attribute_name()?;
        self.whitespace();
        let operator = match self.peek() {
            Some(b'=') => Some((AttributeOperator::Equal, 1)),
            Some(b'~') => Some((AttributeOperator::Includes, 2)),
            Some(b'|') => Some((AttributeOperator::Dash, 2)),
            Some(b'^') => Some((AttributeOperator::Prefix, 2)),
            Some(b'$') => Some((AttributeOperator::Suffix, 2)),
            Some(b'*') => Some((AttributeOperator::Substring, 2)),
            _ => None,
        }
        .filter(|(_, length)| self.b.get(self.position + length - 1) == Some(&b'='));
        let matcher = if let Some((operator, length)) = operator {
            self.position += length;
            self.whitespace();
            Some((operator, self.attribute_value()?))
        } else {
            None
        };
        self.whitespace();
        let flags = self.position;
        while self.peek().is_some_and(|c| c.is_ascii_alphabetic()) {
            self.position += 1;
        }
        let insensitive = match &self.source_text[flags..self.position] {
            "i" | "I" => Some(true),
            "s" | "S" => Some(false),
            _ => None,
        };
        self.whitespace();
        self.expect(b']')?;
        Ok(Simple::Attribute {
            span: self.span(s),
            name,
            matcher,
            insensitive,
        })
    }

    /// The local name after a namespace prefix, which CSS allows and Svelte does not read.
    fn attribute_name(&mut self) -> R<Span> {
        let start = self.position;
        if self.peek() == Some(b'*') {
            self.position += 1;
        } else {
            self.ident();
        }
        let prefixed = self.at_namespace_bar()
            && self.b.get(self.position + 1) != Some(&b'=')
            && self.starts_identifier(self.position + 1);
        if prefixed {
            self.position += 1;
        } else {
            self.position = start;
        }
        self.identifier()
    }

    /// A quoted value without its quotes, or the text up to whitespace or `]`.
    fn attribute_value(&mut self) -> R<Span> {
        if matches!(self.peek(), Some(b'\'' | b'"')) {
            let value = self.string()?;
            return Ok(Span::new(value.start_offset + 1, value.end_offset - 1));
        }
        let start = self.position;
        self.ident();
        while let Some(c) = self.peek() {
            if c.is_ascii_whitespace() || c == b']' {
                break;
            }
            self.position += if c == b'\\' { 2 } else { 1 }.min(self.end - self.position);
        }
        Ok(self.span(start))
    }

    fn pseudo_selector(&mut self, s: usize) -> R<Simple> {
        self.position += 1;
        let element = self.eat(b':');
        let name = self.identifier()?;
        let mut selectors = Vec::new();
        let arguments = if self.eat(b'(') {
            let a = self.position;
            let name = name.text(self.source_text);
            // A pseudo-element's argument is a selector list, as Svelte reads it.
            if element || matches!(name, "is" | "where" | "has" | "not" | "global") {
                selectors = self.selector_list(true)?;
                for selector in &mut selectors {
                    for part in &mut selector.parts {
                        part.implicit_parent = false;
                    }
                }
            } else if NTH.iter().any(|nth| name.eq_ignore_ascii_case(nth)) {
                self.selector_list(true)?;
            } else {
                self.skip_balanced_until(b")")?;
            }
            let arguments = self.span(a);
            self.expect(b')')?;
            Some(arguments)
        } else {
            None
        };
        Ok(if element {
            Simple::PseudoElement {
                span: self.span(s),
                name,
                selectors: selectors.into_boxed_slice(),
            }
        } else {
            Simple::PseudoClass {
                span: self.span(s),
                name,
                arguments,
                selectors: selectors.into_boxed_slice(),
            }
        })
    }

    /// The length of an `An+B` and of the `of` after it, when the selector ends there or an
    /// `of` selector list follows.
    fn nth(&self) -> Option<usize> {
        let rest = &self.b[self.position..self.end];
        let length = an_plus_b(rest)?;
        if rest
            .get(length)
            .is_some_and(|c| self.ident_char(self.position + length) > 0 || *c == b'\\')
        {
            return None;
        }
        let spaces = trivia(rest, length);
        let after = length + spaces;
        if matches!(rest.get(after), Some(b',' | b')')) {
            return Some(length);
        }
        let of = rest
            .get(after..after + 2)
            .is_some_and(|of| of.eq_ignore_ascii_case(b"of"));
        (spaces > 0 && of && self.ident_char(self.position + after + 2) == 0).then_some(after + 2)
    }
}

/// The length of `odd`, `even`, `B`, `An` or `An+B` as CSS Syntax 3 spells them.
fn an_plus_b(rest: &[u8]) -> Option<usize> {
    let word = |word: &[u8]| {
        rest.get(..word.len())
            .is_some_and(|w| w.eq_ignore_ascii_case(word))
            .then_some(word.len())
    };
    word(b"odd").or_else(|| word(b"even")).or_else(|| {
        let sign = usize::from(matches!(rest.first(), Some(b'+' | b'-')));
        let a = count(rest, sign, u8::is_ascii_digit);
        if !matches!(rest.get(sign + a), Some(b'n' | b'N')) {
            return (a > 0).then_some(sign + a);
        }
        let n = sign + a + 1;
        let operator = n + count(rest, n, u8::is_ascii_whitespace);
        if !matches!(rest.get(operator), Some(b'+' | b'-')) {
            return Some(n);
        }
        let b = operator + 1 + count(rest, operator + 1, u8::is_ascii_whitespace);
        let digits = count(rest, b, u8::is_ascii_digit);
        Some(if digits > 0 { b + digits } else { n })
    })
}

/// The length of the whitespace and comments at `from`.
fn trivia(rest: &[u8], from: usize) -> usize {
    let mut at = from;
    loop {
        at += count(rest, at, u8::is_ascii_whitespace);
        if !rest.get(at..).is_some_and(|rest| rest.starts_with(b"/*")) {
            return at - from;
        }
        match rest[at + 2..].windows(2).position(|w| w == b"*/") {
            Some(i) => at += i + 4,
            None => return at - from,
        }
    }
}

fn count(rest: &[u8], from: usize, f: fn(&u8) -> bool) -> usize {
    rest.get(from..)
        .map_or(0, |rest| rest.iter().take_while(|c| f(c)).count())
}

const NTH: [&str; 4] = [
    "nth-child",
    "nth-last-child",
    "nth-of-type",
    "nth-last-of-type",
];

pub(super) fn expected_identifier(at: usize) -> ParseError {
    ParseError {
        code: "css_expected_identifier",
        message: "Expected a valid CSS identifier".to_owned(),
        span: Span::new(at as u32, at as u32),
    }
}
