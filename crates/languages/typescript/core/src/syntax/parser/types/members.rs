//! Object types, mapped types, members and signatures.

use super::super::{LexedToken, List, NodeIdentifier, Parser, R, T};
use crate::syntax_tree::{Signature, SignatureKind, Type};

impl Parser<'_, '_> {
    /// TypeScript's `isStartOfMappedType`, at a `{`.
    pub(super) fn starts_mapped_type(&self) -> bool {
        let mut l = self.lex;
        let mut scratch = Vec::new();
        let mut next = || l.next(&mut scratch).ok();
        let text = |t: LexedToken| self.text(t);
        let Some(mut t) = next() else {
            return false;
        };
        if t.t == T::Op && matches!(text(t), "+" | "-") {
            return next().is_some_and(|t| text(t) == "readonly");
        }
        if t.t == T::Identifier && text(t) == "readonly" {
            let Some(after) = next() else {
                return false;
            };
            t = after;
        }
        t.t == T::LBracket
            && next().is_some_and(|t| t.t == T::Identifier)
            && next().is_some_and(|t| t.t == T::Identifier && text(t) == "in")
    }

    /// `{ readonly [K in T as U]?: V }`.
    pub(super) fn mapped_type(&mut self, start: u32) -> R<NodeIdentifier> {
        self.bump()?;
        if self.is_op("+") || self.is_op("-") {
            self.bump()?;
        }
        if self.is_kw("readonly") {
            self.bump()?;
        }
        self.expect(T::LBracket, "[")?;
        let t = self.bump()?;
        let name = self.syntax_tree.ident(self.text(t), t.span);
        self.bump()?; // `in`
        let constraint = self.ty()?;
        let parameter = self.syntax_tree.type_node(
            Type::Parameter {
                name,
                constraint: Some(constraint),
                default: None,
            },
            self.span_from(t.span.start_offset),
        );
        let name_type = if self.is_kw("as") {
            self.bump()?;
            Some(self.ty()?)
        } else {
            None
        };
        self.expect(T::RBracket, "]")?;
        if (self.is_op("+") || self.is_op("-")) && self.peek().t == T::Question {
            self.bump()?;
        }
        self.eat(T::Question)?;
        let value = if self.eat(T::Colon)? {
            Some(self.ty()?)
        } else {
            None
        };
        if !self.eat(T::Semi)? {
            self.eat(T::Comma)?;
        }
        self.expect(T::RBrace, "}")?;
        Ok(self.syntax_tree.type_node(
            Type::Mapped {
                parameter,
                name_type,
                value,
            },
            self.span_from(start),
        ))
    }

    /// `{ a: A; m(): B }`.
    pub(super) fn object_type(&mut self, start: u32) -> R<NodeIdentifier> {
        self.bump()?;
        let members = self.type_members()?;
        let span = self.span_from(start);
        Ok(self.close(members, |tree, members| {
            tree.type_node(Type::Object(members), span)
        }))
    }

    /// The members of an object type or an interface, after its `{`, through its `}`.
    pub(in crate::syntax::parser) fn type_members(&mut self) -> R<List> {
        self.in_type += 1;
        let members = self.open();
        while self.token.t != T::RBrace {
            if self.token.t == T::Eof {
                return self.fail("unterminated type");
            }
            let m = self.type_member()?;
            self.item(m);
            if !self.eat(T::Semi)? {
                self.eat(T::Comma)?;
            }
        }
        self.bump()?;
        self.in_type -= 1;
        Ok(members)
    }

    fn type_member(&mut self) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        if self.token.t == T::LParen || self.is_op("<") {
            return self.signature(start, SignatureKind::Call, None, false, false);
        }
        if self.is_kw("new") && (self.peek().t == T::LParen || self.peek_is_op("<")) {
            self.bump()?;
            return self.signature(start, SignatureKind::Construct, None, false, false);
        }
        let mut kind = SignatureKind::Method;
        loop {
            let modifier = self.token.t == T::Identifier
                && matches!(self.text(self.token), "readonly" | "get" | "set")
                && self.peek_starts_member_name();
            if !modifier {
                break;
            }
            kind = match self.text(self.token) {
                "get" => SignatureKind::Getter,
                "set" => SignatureKind::Setter,
                _ => kind,
            };
            self.bump()?;
        }
        if self.starts_index_signature() {
            return self.index_signature(start);
        }
        let (key, computed, _) = self.property_key()?;
        let optional = self.eat(T::Question)?;
        if self.token.t == T::LParen || self.is_op("<") {
            return self.signature(start, kind, Some(key), computed, optional);
        }
        let value = if self.eat(T::Colon)? {
            Some(self.ty()?)
        } else {
            None
        };
        Ok(self.syntax_tree.type_node(
            Type::Property {
                key,
                value,
                computed,
                optional,
            },
            self.span_from(start),
        ))
    }

    /// `[key: K]: T`, at its `[`.
    pub(in crate::syntax::parser) fn index_signature(&mut self, start: u32) -> R<NodeIdentifier> {
        self.bump()?;
        let parameters = self.open();
        while self.token.t != T::RBracket {
            let p = self.param()?;
            self.item(p);
            if !self.eat(T::Comma)? {
                break;
            }
        }
        self.expect(T::RBracket, "]")?;
        let value = if self.eat(T::Colon)? {
            Some(self.ty()?)
        } else {
            None
        };
        let span = self.span_from(start);
        Ok(self.close(parameters, |tree, parameters| {
            tree.type_node(Type::Index { parameters, value }, span)
        }))
    }

    /// Whether a `[` here opens an index signature (`[key: K]`), not a computed key.
    pub(in crate::syntax::parser) fn starts_index_signature(&self) -> bool {
        self.token.t == T::LBracket
            && self.peek().t == T::Identifier
            && matches!(self.peek_nth(2).t, T::Colon | T::Comma)
    }

    /// The parameters and return type of a signature, at its `<` or `(`.
    fn signature(
        &mut self,
        start: u32,
        kind: SignatureKind,
        key: Option<NodeIdentifier>,
        computed: bool,
        optional: bool,
    ) -> R<NodeIdentifier> {
        let type_parameters = self.maybe_type_parameter_list()?;
        let parameters = self.parameters()?;
        let returns = if self.eat(T::Colon)? {
            Some(self.return_type()?)
        } else {
            None
        };
        let span = self.span_from(start);
        Ok(self.close(parameters, |tree, parameters| {
            tree.type_node(
                Type::Signature(Signature {
                    kind,
                    key,
                    computed,
                    optional,
                    type_parameters,
                    parameters,
                    returns,
                }),
                span,
            )
        }))
    }

    fn maybe_type_parameter_list(&mut self) -> R<Option<NodeIdentifier>> {
        if self.is_op("<") {
            self.type_parameter_list().map(Some)
        } else {
            Ok(None)
        }
    }

    /// TypeScript's `isStartOfFunctionTypeOrConstructorType`.
    pub(super) fn starts_function_type(&self) -> bool {
        if self.is_op("<") || (self.is_kw("new") && !self.peek_is_op("=")) {
            return true;
        }
        if self.is_kw("abstract") && self.peek().t == T::Identifier {
            return self.text(self.peek()) == "new";
        }
        self.token.t == T::LParen && self.unambiguous_function_type()
    }

    /// TypeScript's `isUnambiguouslyStartOfFunctionType`, at a `(`.
    fn unambiguous_function_type(&self) -> bool {
        let mut l = self.lex;
        let mut scratch = Vec::new();
        let Ok(t) = l.next(&mut scratch) else {
            return false;
        };
        match t.t {
            T::RParen | T::Ellipsis => return true,
            T::Identifier => {}
            T::LBrace | T::LBracket => {
                if Self::lookahead_group(&mut l, &mut scratch).is_err() {
                    return false;
                }
            }
            _ => return false,
        }
        let Ok(next) = l.next(&mut scratch) else {
            return false;
        };
        match next.t {
            T::Colon | T::Comma | T::Question => true,
            T::Op => self.text(next) == "=",
            T::RParen => l.next(&mut scratch).is_ok_and(|t| t.t == T::Arrow),
            _ => false,
        }
    }

    /// `(a: A) => R`, `<T>(a: T) => R`, `new () => R`, `abstract new () => R`.
    pub(super) fn function_type(&mut self, start: u32) -> R<NodeIdentifier> {
        let mut kind = SignatureKind::Function;
        if self.is_kw("abstract") {
            self.bump()?;
        }
        if self.is_kw("new") {
            self.bump()?;
            kind = SignatureKind::Constructor;
        }
        let type_parameters = self.maybe_type_parameter_list()?;
        let parameters = self.parameters()?;
        self.expect(T::Arrow, "=>")?;
        let returns = Some(self.return_type()?);
        let span = self.span_from(start);
        Ok(self.close(parameters, |tree, parameters| {
            tree.type_node(
                Type::Signature(Signature {
                    kind,
                    key: None,
                    computed: false,
                    optional: false,
                    type_parameters,
                    parameters,
                    returns,
                }),
                span,
            )
        }))
    }
}
