//! Type syntax, read into [`Type`] nodes the way TypeScript's parser reads it.

use super::{NodeIdentifier, Parser, R, Span, T};
use crate::syntax_tree::Type;

/// Identifiers that are a type on their own.
const KEYWORDS: &[&str] = &[
    "any",
    "bigint",
    "boolean",
    "false",
    "intrinsic",
    "never",
    "null",
    "number",
    "object",
    "string",
    "symbol",
    "this",
    "true",
    "undefined",
    "unknown",
    "void",
];

impl Parser<'_, '_> {
    /// A type at the current token.
    pub(super) fn ty(&mut self) -> R<NodeIdentifier> {
        let outer = std::mem::replace(&mut self.in_extends, false);
        let ty = self.type_or_conditional();
        self.in_extends = outer;
        ty
    }

    fn type_or_conditional(&mut self) -> R<NodeIdentifier> {
        self.in_type += 1;
        let ty = self.nested(Self::type_inner);
        self.in_type -= 1;
        ty
    }

    fn type_inner(&mut self) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        if self.starts_function_type() {
            return self.function_type(start);
        }
        let check = self.union()?;
        if self.in_extends || !self.is_kw("extends") || self.token.newline_before {
            return Ok(check);
        }
        self.bump()?;
        self.in_extends = true;
        let extends = self.type_or_conditional()?;
        self.in_extends = false;
        self.expect(T::Question, "?")?;
        let consequent = self.type_or_conditional()?;
        self.expect(T::Colon, ":")?;
        let alternate = self.type_or_conditional()?;
        Ok(self.syntax_tree.type_node(
            Type::Conditional {
                check,
                extends,
                consequent,
                alternate,
            },
            self.span_from(start),
        ))
    }

    /// A return type, which may be a type predicate (`x is T`, `asserts x`).
    pub(super) fn return_type(&mut self) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        let next = self.peek();
        let asserts = self.is_kw("asserts") && next.t == T::Identifier && !next.newline_before;
        let names = self.token.t == T::Identifier
            && next.t == T::Identifier
            && self.text(next) == "is"
            && !next.newline_before;
        if !(asserts || names) {
            return self.ty();
        }
        self.in_type += 1;
        if asserts {
            self.bump()?;
        }
        let t = self.bump()?;
        let name = if self.text(t) == "this" {
            self.syntax_tree.type_node(Type::Leaf, t.span)
        } else {
            self.ident_node(t)
        };
        let annotation = if self.is_kw("is") && !self.token.newline_before {
            self.bump()?;
            Some(self.ty()?)
        } else {
            None
        };
        self.in_type -= 1;
        Ok(self.syntax_tree.type_node(
            Type::Predicate {
                name,
                annotation,
                asserts,
            },
            self.span_from(start),
        ))
    }

    fn union(&mut self) -> R<NodeIdentifier> {
        self.combination("|", Self::intersection)
    }

    fn intersection(&mut self) -> R<NodeIdentifier> {
        self.combination("&", Self::operator_type)
    }

    /// `A | B` or `A & B`, with an optional leading operator, which alone makes a combination.
    fn combination(
        &mut self,
        operator: &str,
        operand: fn(&mut Self) -> R<NodeIdentifier>,
    ) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        let leading = self.eat_op(operator)?;
        let first = operand(self)?;
        if !leading && !self.is_op(operator) {
            return Ok(first);
        }
        let types = self.open();
        self.item(first);
        while self.eat_op(operator)? {
            let t = operand(self)?;
            self.item(t);
        }
        let span = self.span_from(start);
        let union = operator == "|";
        Ok(self.close(types, |tree, types| {
            tree.type_node(
                if union {
                    Type::Union(types)
                } else {
                    Type::Intersection(types)
                },
                span,
            )
        }))
    }

    fn operator_type(&mut self) -> R<NodeIdentifier> {
        self.nested(Self::operator_type_inner)
    }

    fn operator_type_inner(&mut self) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        if self.token.t == T::Identifier && self.peek_starts_type() {
            match self.text(self.token) {
                "keyof" | "unique" | "readonly" => {
                    self.bump()?;
                    let operand = self.operator_type()?;
                    return Ok(self
                        .syntax_tree
                        .type_node(Type::Operator(operand), self.span_from(start)));
                }
                "infer" => return self.infer(start),
                _ => {}
            }
        }
        self.postfix_type()
    }

    /// `infer U` or `infer U extends C`; a constraint that a `?` follows outside an `extends`
    /// clause is the start of a conditional type instead.
    fn infer(&mut self, start: u32) -> R<NodeIdentifier> {
        self.bump()?;
        let t = self.expect(T::Identifier, "a type parameter name")?;
        let name = self.ident_node(t);
        let mut constraint = None;
        if self.is_kw("extends") && !self.token.newline_before {
            let checkpoint = self.checkpoint();
            self.bump()?;
            let outer = std::mem::replace(&mut self.in_extends, true);
            let c = self.type_or_conditional();
            self.in_extends = outer;
            let c = c?;
            if outer || self.token.t != T::Question {
                constraint = Some(c);
            } else {
                self.restore(checkpoint);
            }
        }
        let parameter = self.syntax_tree.type_node(
            Type::Parameter {
                name,
                constraint,
                default: None,
            },
            self.span_from(t.span.start_offset),
        );
        Ok(self
            .syntax_tree
            .type_node(Type::Infer(parameter), self.span_from(start)))
    }

    fn postfix_type(&mut self) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        let mut ty = self.primary_type()?;
        while !self.token.newline_before {
            ty = if self.token.t == T::LBracket {
                self.bump()?;
                if self.eat(T::RBracket)? {
                    self.syntax_tree
                        .type_node(Type::Array(ty), self.span_from(start))
                } else {
                    let index = self.ty()?;
                    self.expect(T::RBracket, "]")?;
                    self.syntax_tree
                        .type_node(Type::Indexed { object: ty, index }, self.span_from(start))
                }
            } else if self.is_op("!") {
                self.bump()?;
                self.syntax_tree
                    .type_node(Type::NonNull(ty), self.span_from(start))
            } else {
                break;
            };
        }
        Ok(ty)
    }

    fn primary_type(&mut self) -> R<NodeIdentifier> {
        let t = self.token;
        let start = t.span.start_offset;
        match t.t {
            T::Identifier => match self.text(t) {
                "typeof" => self.type_query(start),
                "import" if self.peek().t == T::LParen => self.import_type(start),
                text if KEYWORDS.contains(&text) && self.peek().t != T::Dot => {
                    self.bump()?;
                    Ok(self.syntax_tree.type_node(Type::Leaf, t.span))
                }
                _ => self.type_reference(start),
            },
            T::String | T::Number | T::BigInt => {
                self.bump()?;
                Ok(self.syntax_tree.type_node(Type::Leaf, t.span))
            }
            T::Op if self.text(t) == "-" && matches!(self.peek().t, T::Number | T::BigInt) => {
                self.bump()?;
                self.bump()?;
                Ok(self
                    .syntax_tree
                    .type_node(Type::Leaf, self.span_from(start)))
            }
            T::Template { .. } => self.template_type(start),
            T::LBrace if self.starts_mapped_type() => self.mapped_type(start),
            T::LBrace => self.object_type(start),
            T::LBracket => self.tuple_type(start),
            T::LParen => {
                self.bump()?;
                let ty = self.ty()?;
                self.expect(T::RParen, ")")?;
                Ok(ty)
            }
            _ => self.fail(format!("expected a type, found `{}`", self.text(t))),
        }
    }

    /// `A.B<C>`.
    fn type_reference(&mut self, start: u32) -> R<NodeIdentifier> {
        let name = self.entity_name()?;
        let arguments = self.maybe_type_argument_list()?;
        Ok(self
            .syntax_tree
            .type_node(Type::Reference { name, arguments }, self.span_from(start)))
    }

    /// `A` or `A.B.C`; a name after a dot may be any word.
    fn entity_name(&mut self) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        let t = self.expect(T::Identifier, "a type name")?;
        let mut name = self.ident_node(t);
        while self.token.t == T::Dot && matches!(self.peek().t, T::Identifier | T::PrivateName) {
            self.bump()?;
            let right = self.bump()?;
            let right = self.ident_node(right);
            name = self
                .syntax_tree
                .type_node(Type::Qualified { left: name, right }, self.span_from(start));
        }
        Ok(name)
    }

    /// `<A, B>` after a type name, on the name's line.
    fn maybe_type_argument_list(&mut self) -> R<Option<NodeIdentifier>> {
        if self.token.newline_before || !self.is_op("<") {
            return Ok(None);
        }
        self.type_argument_list().map(Some)
    }

    /// `<A, B>`.
    pub(super) fn type_argument_list(&mut self) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        self.in_type += 1;
        self.bump()?;
        let types = self.open();
        while !self.at_greater() {
            let t = self.ty()?;
            self.item(t);
            if !self.eat(T::Comma)? {
                break;
            }
        }
        self.expect_greater()?;
        self.in_type -= 1;
        let span = self.span_from(start);
        Ok(self.close(types, |tree, types| {
            tree.type_node(Type::Arguments(types), span)
        }))
    }

    /// `<T extends U = V, …>` of a declaration.
    pub(super) fn type_parameter_list(&mut self) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        self.in_type += 1;
        self.bump()?;
        let parameters = self.open();
        while !self.at_greater() {
            let p = self.type_parameter()?;
            self.item(p);
            if !self.eat(T::Comma)? {
                break;
            }
        }
        self.expect_greater()?;
        self.in_type -= 1;
        let span = self.span_from(start);
        Ok(self.close(parameters, |tree, parameters| {
            tree.type_node(Type::Parameters(parameters), span)
        }))
    }

    fn type_parameter(&mut self) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        while matches!(self.text(self.token), "const" | "in" | "out")
            && self.peek().t == T::Identifier
        {
            self.bump()?;
        }
        let t = self.expect(T::Identifier, "a type parameter name")?;
        let name = self.ident_node(t);
        let constraint = if self.is_kw("extends") {
            self.bump()?;
            Some(self.ty()?)
        } else {
            None
        };
        let default = if self.eat_op("=")? {
            Some(self.ty()?)
        } else {
            None
        };
        Ok(self.syntax_tree.type_node(
            Type::Parameter {
                name,
                constraint,
                default,
            },
            self.span_from(start),
        ))
    }

    fn at_greater(&self) -> bool {
        self.token.t == T::Op && self.text(self.token).starts_with('>')
    }

    /// Consumes one `>`, splitting `>>`, `>=` and the like where a type list ends.
    pub(super) fn expect_greater(&mut self) -> R<()> {
        if !self.at_greater() {
            return self.fail("expected `>`");
        }
        let start = self.token.span.start_offset;
        if self.token.span.end_offset > start + 1 {
            self.lex.position = start as usize + 1;
            self.token.span = Span::new(start, start + 1);
        }
        self.bump()?;
        Ok(())
    }

    /// `typeof a.b<T>` or `typeof import('a')`.
    fn type_query(&mut self, start: u32) -> R<NodeIdentifier> {
        self.bump()?;
        let name = if self.is_kw("import") && self.peek().t == T::LParen {
            self.import_type(self.token.span.start_offset)?
        } else {
            self.entity_name()?
        };
        let arguments = self.maybe_type_argument_list()?;
        Ok(self
            .syntax_tree
            .type_node(Type::Query { name, arguments }, self.span_from(start)))
    }

    /// `import('a', { with: … }).B<C>`.
    fn import_type(&mut self, start: u32) -> R<NodeIdentifier> {
        self.bump()?;
        self.expect(T::LParen, "(")?;
        let s = self.expect(T::String, "a module specifier")?;
        let source = self.string_node(s);
        if self.eat(T::Comma)? && self.token.t != T::RParen {
            self.object()?;
            self.eat(T::Comma)?;
        }
        self.expect(T::RParen, ")")?;
        let qualifier = if self.eat(T::Dot)? {
            Some(self.entity_name()?)
        } else {
            None
        };
        let arguments = self.maybe_type_argument_list()?;
        Ok(self.syntax_tree.type_node(
            Type::Import {
                source,
                qualifier,
                arguments,
            },
            self.span_from(start),
        ))
    }

    /// `` `a${T}b` ``.
    fn template_type(&mut self, start: u32) -> R<NodeIdentifier> {
        let types = self.open();
        loop {
            let T::Template { tail } = self.token.t else {
                return self.fail("expected template continuation");
            };
            self.bump()?;
            if tail {
                break;
            }
            let t = self.ty()?;
            self.item(t);
            if self.token.t != T::RBrace {
                return self.fail("expected `}` in template literal type");
            }
            self.token = self.lex.template_continue(self.token.span)?;
        }
        let span = self.span_from(start);
        Ok(self.close(types, |tree, types| {
            if types.is_empty() {
                tree.type_node(Type::Leaf, span)
            } else {
                tree.type_node(Type::TemplateLiteral(types), span)
            }
        }))
    }

    /// `[A, b?: B, ...C]`.
    fn tuple_type(&mut self, start: u32) -> R<NodeIdentifier> {
        self.bump()?;
        let elements = self.open();
        while self.token.t != T::RBracket {
            let e = self.tuple_element()?;
            self.item(e);
            if !self.eat(T::Comma)? {
                break;
            }
        }
        self.expect(T::RBracket, "]")?;
        let span = self.span_from(start);
        Ok(self.close(elements, |tree, elements| {
            tree.type_node(Type::Tuple(elements), span)
        }))
    }

    fn tuple_element(&mut self) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        if self.eat(T::Ellipsis)? {
            let element = self.tuple_element()?;
            return Ok(self
                .syntax_tree
                .type_node(Type::Rest(element), self.span_from(start)));
        }
        let next = self.peek();
        let named = self.token.t == T::Identifier
            && (next.t == T::Colon || (next.t == T::Question && self.peek_nth(2).t == T::Colon));
        if named {
            let t = self.bump()?;
            let label = self.ident_node(t);
            let optional = self.eat(T::Question)?;
            self.bump()?; // `:`
            let element = self.ty()?;
            return Ok(self.syntax_tree.type_node(
                Type::Named {
                    label,
                    element,
                    optional,
                },
                self.span_from(start),
            ));
        }
        let element = self.ty()?;
        if self.eat(T::Question)? {
            return Ok(self
                .syntax_tree
                .type_node(Type::Optional(element), self.span_from(start)));
        }
        Ok(element)
    }

    /// `implements A, B<C>` or `extends A, B`: the references, after the keyword.
    pub(super) fn heritage(&mut self) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        self.in_type += 1;
        let references = self.open();
        loop {
            let start = self.token.span.start_offset;
            let name = self.entity_name()?;
            // A heritage clause's type arguments may start on the next line, unlike a type's.
            let arguments = if self.is_op("<") {
                Some(self.type_argument_list()?)
            } else {
                None
            };
            let r = self
                .syntax_tree
                .type_node(Type::Reference { name, arguments }, self.span_from(start));
            self.item(r);
            if !self.eat(T::Comma)? {
                break;
            }
        }
        self.in_type -= 1;
        let span = self.span_from(start);
        Ok(self.close(references, |tree, references| {
            tree.type_node(Type::Heritage(references), span)
        }))
    }

    /// Whether the token after the current one can start a type (after `keyof`, `infer`).
    fn peek_starts_type(&self) -> bool {
        let next = self.peek();
        match next.t {
            T::Identifier
            | T::String
            | T::Number
            | T::BigInt
            | T::Template { .. }
            | T::LBrace
            | T::LBracket
            | T::LParen => true,
            T::Op => matches!(self.text(next), "-" | "<"),
            _ => false,
        }
    }

    /// Whether the token after a modifier is a member name, so the modifier is not the name.
    fn peek_starts_member_name(&self) -> bool {
        let next = self.peek();
        matches!(
            next.t,
            T::Identifier | T::String | T::Number | T::LBracket | T::PrivateName
        ) && !next.newline_before
    }

    fn peek_is_op(&self, op: &str) -> bool {
        let next = self.peek();
        next.t == T::Op && self.text(next) == op
    }
}

mod members;

#[cfg(test)]
mod tests;
