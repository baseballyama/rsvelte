use rsvelte_kernel::source::positions::Span;

use super::{P, R, is_ident_byte, push};
use crate::syntax_tree::{
    AttributeOperator, Combinator, ComplexSelector, RelativeSelector, Simple, SimpleList,
};

impl P<'_> {
    pub(super) fn complex(&mut self) -> R<ComplexSelector> {
        let id = self.selector_count;
        self.selector_count += 1;
        let start_offset = self.position;
        let combinator = match self.peek() {
            Some(b'>') => Some(Combinator::Child),
            Some(b'+') => Some(Combinator::NextSibling),
            Some(b'~') => Some(Combinator::SubsequentSibling),
            _ => None,
        };
        if combinator.is_some() {
            self.position += 1;
            self.skip_trivia()?;
        }
        let mut parts = vec![self.relative(combinator)?];
        loop {
            let before = self.position;
            let comments = self.comments.len();
            let whitespace = self.whitespace.len();
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
                (None, Some(b',' | b'{' | b')') | None) => {
                    self.position = before;
                    self.comments.truncate(comments);
                    self.whitespace.truncate(whitespace);
                    break;
                }
                (None, _) if self.position > before => Combinator::Descendant,
                (None, _) => return self.fail("unexpected character in selector"),
            };
            push(&mut parts, self.relative(Some(combinator))?);
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

    fn relative(&mut self, combinator: Option<Combinator>) -> R<RelativeSelector> {
        let id = self.relative_count;
        self.relative_count += 1;
        let start_offset = self.position;
        let mut simple = SimpleBuilder::default();
        loop {
            let s = self.position;
            match self.peek() {
                Some(b'&') => {
                    self.position += 1;
                    simple.push(Simple::Nesting(self.span(s)));
                }
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
                Some(b'*' | b'|') if simple.is_empty() => {
                    if self.peek() == Some(b'*') {
                        self.position += 1;
                    }
                    simple.push(self.type_selector(s));
                }
                Some(b'[') => simple.push(self.attribute_selector(s)?),
                Some(b':') => simple.push(self.pseudo_selector(s)?),
                Some(c)
                    if (is_ident_byte(c) || c == b'\\')
                        && (simple.is_empty()
                            || simple.iter().any(|s| matches!(s, Simple::Nesting(_)))) =>
                {
                    self.ident();
                    simple.push(self.type_selector(s));
                }
                _ => break,
            }
        }
        let Some(simple) = simple.finish() else {
            return self.fail("expected a selector");
        };
        Ok(RelativeSelector {
            parent_rule: self.selector_parent,
            implicit_parent: true,
            global: false,
            id,
            combinator,
            span: self.span(start_offset),
            simple,
        })
    }

    fn type_selector(&mut self, start: usize) -> Simple {
        if self.peek() == Some(b'|') {
            self.position += 1;
            let name_start = self.position;
            if self.peek() == Some(b'*') {
                self.position += 1;
            } else {
                self.ident();
            }
            Simple::NamespacedType {
                span: self.span(start),
                name: self.span(name_start),
            }
        } else if self.source_text.as_bytes()[start] == b'*' {
            Simple::Universal(self.span(start))
        } else {
            Simple::Type(self.span(start))
        }
    }

    fn attribute_selector(&mut self, s: usize) -> R<Simple> {
        self.position += 1;
        self.skip_trivia()?;
        let name = self.ident();
        self.skip_trivia()?;
        let operator = match self.peek() {
            Some(b'=') => Some(AttributeOperator::Equal),
            Some(b'~') => Some(AttributeOperator::Includes),
            Some(b'|') => Some(AttributeOperator::Dash),
            Some(b'^') => Some(AttributeOperator::Prefix),
            Some(b'$') => Some(AttributeOperator::Suffix),
            Some(b'*') => Some(AttributeOperator::Substring),
            _ => None,
        };
        let matcher = if let Some(operator) = operator {
            if self.peek() != Some(b'=') {
                self.position += 1;
            }
            self.expect(b'=')?;
            self.skip_trivia()?;
            let value = if matches!(self.peek(), Some(b'\'' | b'"')) {
                let value = self.string()?;
                Span::new(value.start_offset + 1, value.end_offset - 1)
            } else {
                self.ident()
            };
            Some((operator, value))
        } else {
            None
        };
        self.skip_trivia()?;
        let insensitive = match self.peek() {
            Some(b'i' | b'I') => Some(true),
            Some(b's' | b'S') => Some(false),
            _ => None,
        };
        if matches!(self.peek(), Some(b'i' | b'I' | b's' | b'S')) {
            self.position += 1;
            self.skip_trivia()?;
        }
        self.expect(b']')?;
        Ok(Simple::Attribute {
            span: self.span(s),
            name,
            matcher,
            insensitive,
        })
    }

    fn pseudo_selector(&mut self, s: usize) -> R<Simple> {
        self.position += 1;
        let element = self.peek() == Some(b':');
        if element {
            self.position += 1;
        }
        let name = self.ident();
        let mut selectors = Vec::new();
        let arguments = if self.peek() == Some(b'(') {
            self.position += 1;
            let a = self.position;
            if !element
                && matches!(
                    name.text(self.source_text),
                    "is" | "where" | "has" | "not" | "global"
                )
            {
                loop {
                    self.skip_trivia()?;
                    let mut selector = self.complex()?;
                    for part in &mut selector.parts {
                        part.implicit_parent = false;
                    }
                    push(&mut selectors, selector);
                    self.skip_trivia()?;
                    if self.peek() != Some(b',') {
                        break;
                    }
                    selectors
                        .last_mut()
                        .expect("a selector precedes the comma")
                        .comma = Some(Span::new(self.position as u32, self.position as u32 + 1));
                    self.position += 1;
                }
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
}

#[derive(Default)]
struct SimpleBuilder {
    first: Option<Simple>,
    rest: Vec<Simple>,
}

impl SimpleBuilder {
    fn push(&mut self, simple: Simple) {
        if self.first.is_none() {
            self.first = Some(simple);
        } else {
            push(&mut self.rest, simple);
        }
    }

    const fn is_empty(&self) -> bool {
        self.first.is_none()
    }

    fn iter(&self) -> impl Iterator<Item = &Simple> {
        self.first.iter().chain(&self.rest)
    }

    fn finish(self) -> Option<SimpleList> {
        self.first
            .map(|first| SimpleList::new(first, self.rest.into_boxed_slice()))
    }
}
