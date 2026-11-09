//! JSX elements and fragments, in `.jsx` and `.tsx` documents.
//!
//! Text between tags is not made of tokens, so the parser reads it through the lexer by hand: a
//! tag's closing `>` and an expression's closing `}` are consumed without lexing what follows.

use super::{NodeIdentifier, Parser, R, T};
use crate::syntax_tree::Jsx;

impl Parser<'_, '_> {
    /// Whether the `<` at the current token starts JSX rather than a generic arrow function's
    /// type parameters, which a `.tsx` document writes `<T,>` or `<T extends U>`.
    pub(super) fn starts_jsx(&self) -> bool {
        if !self.jsx || !self.is_op("<") {
            return false;
        }
        let next = self.peek();
        !(self.typescript
            && next.t == T::Identifier
            && (self.peek_nth(2).t == T::Comma || self.text(self.peek_nth(2)) == "extends"))
    }

    /// An element or a fragment as an expression; the token after it is lexed as code.
    pub(super) fn jsx_expression(&mut self) -> R<NodeIdentifier> {
        let element = self.jsx_element()?;
        self.bump()?;
        Ok(element)
    }

    /// `<a …>…</a>`, `<a … />` or `<>…</>`, from its `<` up to its last `>`, which stays the
    /// current token.
    fn jsx_element(&mut self) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        self.bump()?;
        let name = if self.is_greater() {
            None
        } else {
            Some(self.jsx_element_name()?)
        };
        // The attributes, then the children, as one list.
        let items = self.open();
        while !self.is_greater() && !self.is_op("/") {
            let attribute = self.jsx_attribute()?;
            self.item(attribute);
        }
        let attributes = self.syntax_tree.scratch.len() - items.0;
        if self.is_op("/") {
            self.bump()?;
            self.jsx_greater()?;
        } else {
            self.jsx_greater()?;
            self.consume_current();
            self.jsx_children()?;
            self.jsx_closing(name)?;
        }
        let span = self.span_to_current(start);
        Ok(self.close(items, |tree, items| {
            let (attributes, children) = items.split_at(attributes);
            tree.jsx(
                Jsx::Element {
                    name,
                    attributes,
                    children,
                },
                span,
            )
        }))
    }

    /// `a`, `a-b`, `a:b` or `a.b.c`.
    fn jsx_element_name(&mut self) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        let name = self.jsx_name()?;
        if self.token.t == T::Colon {
            return self.jsx_namespaced(name, start);
        }
        let mut name = name;
        while self.token.t == T::Dot {
            self.bump()?;
            let t = self.expect(T::Identifier, "a name")?;
            let property = self.syntax_tree.ident(self.text(t), t.span);
            name = self
                .syntax_tree
                .member(name, property, false, false, self.span_from(start));
        }
        Ok(name)
    }

    /// An identifier that may hold `-`.
    fn jsx_name(&mut self) -> R<NodeIdentifier> {
        if self.token.t != T::Identifier {
            return self.fail("expected a JSX name");
        }
        self.token = self.lex.jsx_identifier(self.token)?;
        let t = self.bump()?;
        Ok(self.syntax_tree.ident(self.text(t), t.span))
    }

    fn jsx_namespaced(&mut self, namespace: NodeIdentifier, start: u32) -> R<NodeIdentifier> {
        self.bump()?;
        let name = self.jsx_name()?;
        Ok(self
            .syntax_tree
            .jsx(Jsx::Namespaced { namespace, name }, self.span_from(start)))
    }

    /// `{...a}`, `a`, `a="b"`, `a={b}` or `a=<b />`.
    fn jsx_attribute(&mut self) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        if self.token.t == T::LBrace {
            self.bump()?;
            self.expect(T::Ellipsis, "`...`")?;
            let argument = self.assignment()?;
            self.expect(T::RBrace, "}")?;
            return Ok(self
                .syntax_tree
                .jsx(Jsx::Spread(argument), self.span_from(start)));
        }
        let name = self.jsx_name()?;
        let name = if self.token.t == T::Colon {
            self.jsx_namespaced(name, start)?
        } else {
            name
        };
        let value = if self.is_op("=") {
            Some(self.jsx_attribute_value()?)
        } else {
            None
        };
        Ok(self
            .syntax_tree
            .jsx(Jsx::Attribute { name, value }, self.span_from(start)))
    }

    /// After `=`: a quoted string, `{expression}` or an element.
    fn jsx_attribute_value(&mut self) -> R<NodeIdentifier> {
        self.consume_current();
        if let Some(t) = self.lex.jsx_string(&mut self.syntax_tree.comments)? {
            self.token = t;
            self.bump()?;
            let body = super::Span::new(t.span.start_offset + 1, t.span.end_offset - 1);
            return Ok(self.syntax_tree.str_in_source(body, t.span));
        }
        self.relex()?;
        match self.token.t {
            T::LBrace => {
                let start = self.token.span.start_offset;
                self.bump()?;
                let expression = self.assignment()?;
                self.expect(T::RBrace, "}")?;
                Ok(self
                    .syntax_tree
                    .jsx(Jsx::Container(Some(expression)), self.span_from(start)))
            }
            T::Op if self.is_op("<") => self.jsx_expression(),
            _ => self.fail("expected a JSX attribute value"),
        }
    }

    /// The children after an opening tag, as items of the open list, up to the `<` of its
    /// closing tag, which becomes the current token.
    fn jsx_children(&mut self) -> R<()> {
        loop {
            let text = self.lex.jsx_text();
            if !text.span.is_empty() {
                self.syntax_tree.tokens.push(T::JsxText, text.span);
                self.prev_end = text.span.end_offset;
                let node = self.syntax_tree.jsx(Jsx::Text, text.span);
                self.item(node);
            }
            self.relex()?;
            match self.token.t {
                T::LBrace => {
                    let child = self.jsx_child_expression()?;
                    self.item(child);
                }
                T::Op if self.is_op("<") => {
                    let next = self.peek();
                    if next.t == T::Op && self.text(next).starts_with('/') {
                        return Ok(());
                    }
                    let child = self.jsx_element()?;
                    self.consume_current();
                    self.item(child);
                }
                T::Eof => return self.fail("unterminated JSX element"),
                _ => return self.fail("expected `{` or `<` in JSX"),
            }
        }
    }

    /// `{a}`, `{...a}` or `{}` among children; its `}` is consumed without lexing what follows.
    fn jsx_child_expression(&mut self) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        self.bump()?;
        let child = if self.token.t == T::RBrace {
            Jsx::Container(None)
        } else if self.eat(T::Ellipsis)? {
            Jsx::Spread(self.expression()?)
        } else {
            Jsx::Container(Some(self.expression()?))
        };
        if self.token.t != T::RBrace {
            return self.fail("expected `}`");
        }
        self.consume_current();
        Ok(self.syntax_tree.jsx(child, self.span_from(start)))
    }

    /// `</a>` for an element named `name`, with its `>` left current.
    fn jsx_closing(&mut self, name: Option<NodeIdentifier>) -> R<()> {
        self.bump()?;
        if !self.is_op("/") {
            return self.fail("expected `/`");
        }
        self.bump()?;
        let opening = name.and_then(|n| self.syntax_tree.source_location(n).span());
        if self.is_greater() {
            if opening.is_some() {
                return self.fail("expected a closing tag for the element");
            }
        } else {
            let closing = self.jsx_element_name()?;
            let closing = self.syntax_tree.source_location(closing).span();
            let text = |span: Option<super::Span>| span.map(|s| s.text(self.source_text));
            if text(opening) != text(closing) {
                return self.fail("expected a closing tag for the element");
            }
        }
        self.jsx_greater()
    }

    /// Whether the current token starts with `>`, which the lexer may have joined to what follows.
    fn is_greater(&self) -> bool {
        self.token.t == T::Op && self.text(self.token).starts_with('>')
    }

    /// Narrows the current token to its first `>`, so what follows it is read again.
    fn jsx_greater(&mut self) -> R<()> {
        if !self.is_greater() {
            return self.fail("expected `>`");
        }
        let at = self.token.span.start_offset;
        self.token.span = super::Span::new(at, at + 1);
        self.lex.position = at as usize + 1;
        Ok(())
    }

    /// Consumes the current token without lexing the next one.
    fn consume_current(&mut self) {
        let t = self.token;
        self.syntax_tree.tokens.push(t.t, t.span);
        self.prev_end = t.span.end_offset;
        self.prev = t;
    }

    /// Lexes the current token from where the lexer stands.
    fn relex(&mut self) -> R<()> {
        self.token = self.lex.next(&mut self.syntax_tree.comments)?;
        Ok(())
    }

    /// From `start` through the current token, which is not consumed yet.
    const fn span_to_current(&self, start: u32) -> super::Span {
        super::Span::new(start, self.token.span.end_offset)
    }
}

#[cfg(test)]
mod tests;
