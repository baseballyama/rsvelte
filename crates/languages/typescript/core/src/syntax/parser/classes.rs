use super::{Kind, NodeIdentifier, Parser, R, Span, T, TypeScriptKind};
use crate::syntax_tree::{Class, TypeScriptFeature};

impl Parser<'_, '_> {
    /// `@d class C {}`, `@d export class C {}`, `@d export default class {}`.
    pub(super) fn decorated_statement(&mut self) -> R<NodeIdentifier> {
        let decorators = self.decorators()?;
        let statement = self.statement()?;
        let class = match self.syntax_tree.kind(statement) {
            Kind::ExportNamed(c) | Kind::ExportDefault(c) => c,
            _ => statement,
        };
        if !matches!(self.syntax_tree.kind(class), Kind::Class(_)) {
            return Err(super::ParseError {
                message: "a decorator must precede a class".into(),
                span: decorators[0].0,
            });
        }
        self.record_decorators(class, &decorators);
        Ok(statement)
    }

    /// `@a @b.c @d()`: each decorator's span and expression.
    pub(super) fn decorators(&mut self) -> R<Vec<(Span, NodeIdentifier)>> {
        let mut decorators = Vec::new();
        while self.typescript && self.token.t == T::At {
            let start = self.token.span.start_offset;
            self.bump()?;
            let expression = self.lhs()?;
            decorators.push((self.span_from(start), expression));
        }
        // Recorded here, before the class body's own, so the first one in the source comes first.
        if let Some(&(span, _)) = decorators.first() {
            self.runtime(TypeScriptFeature::Decorator, span);
        }
        Ok(decorators)
    }

    pub(super) fn record_decorators(
        &mut self,
        node: NodeIdentifier,
        decorators: &[(Span, NodeIdentifier)],
    ) {
        for &(span, expression) in decorators {
            self.typescript(node, TypeScriptKind::Decorator, span, expression);
        }
    }

    pub(super) fn class_definition(&mut self, declaration: bool, start: u32) -> R<NodeIdentifier> {
        self.bump()?;
        let name = if self.token.t == T::Identifier && !self.is_kw("extends") {
            let t = self.bump()?;
            Some(self.syntax_tree.ident(self.text(t), t.span))
        } else if declaration {
            return self.fail("expected class name");
        } else {
            None
        };
        let type_parameters = self.maybe_type_parameters()?;
        let superclass = if self.is_kw("extends") {
            self.bump()?;
            Some(self.lhs()?)
        } else {
            None
        };
        if let Some(superclass) = superclass {
            self.maybe_type_arguments(superclass)?;
            if self.typescript && self.is_op("<") {
                let start_offset = self.token.span.start_offset;
                let ty = self.type_argument_list()?;
                let span = Span::new(start_offset, self.prev_end);
                self.typescript(superclass, TypeScriptKind::TypeArgs, span, ty);
            }
        }
        let implements = if self.typescript && self.is_kw("implements") {
            self.bump()?;
            let start_offset = self.token.span.start_offset;
            let heritage = self.heritage()?;
            Some((Span::new(start_offset, self.prev_end), heritage))
        } else {
            None
        };
        self.expect(T::LBrace, "{")?;
        let members = self.open();
        let mut erased = Vec::new();
        while self.token.t != T::RBrace {
            if self.eat(T::Semi)? {
                continue;
            }
            if self.token.t == T::Eof {
                return self.fail("unterminated class");
            }
            match self.class_member()? {
                Member::Runtime(member) => self.item(member),
                Member::Erased(member) => erased.push(member),
            }
        }
        self.bump()?;
        let span = self.span_from(start);
        let class = self.close(members, |tree, members| {
            tree.class(
                Class::Definition {
                    name,
                    superclass,
                    members,
                    declaration,
                },
                span,
            )
        });
        self.signature_typescript(class, type_parameters, None);
        if let Some((span, heritage)) = implements {
            self.typescript(class, TypeScriptKind::Implements, span, heritage);
        }
        for member in erased {
            let span = self
                .syntax_tree
                .source_location(member)
                .span()
                .expect("a parsed member has a span");
            self.typescript(class, TypeScriptKind::Member, span, member);
        }
        Ok(class)
    }

    /// Whether the current word is one of `modifiers` and modifies the member after it, which
    /// TypeScript requires on the same line.
    fn at_modifier(&self, modifiers: &[&str]) -> bool {
        let next = self.peek();
        self.typescript
            && modifiers.contains(&self.text(self.token))
            && !next.newline_before
            && !matches!(next.t, T::LParen | T::Semi | T::RBrace | T::Colon)
            && !matches!(self.text(next), "=" | "?" | "!" | "<")
    }

    /// The modifiers before `static`: whether one erases the member and whether one is
    /// `accessor`.
    fn modifiers(&mut self) -> R<(bool, bool)> {
        let (mut erased, mut accessor) = (false, false);
        while self.at_modifier(&[
            "public",
            "private",
            "protected",
            "readonly",
            "abstract",
            "declare",
            "override",
            "accessor",
        ]) {
            match self.text(self.token) {
                "abstract" | "declare" => erased = true,
                "accessor" => accessor = true,
                _ => {}
            }
            self.bump()?;
        }
        Ok((erased, accessor))
    }

    /// `key!: T = value;`, after the key.
    fn field(
        &mut self,
        key: NodeIdentifier,
        computed: bool,
        is_static: bool,
        start: u32,
    ) -> R<NodeIdentifier> {
        if self.typescript && self.is_op("!") {
            let bang = self.bump()?;
            self.typescript(
                key,
                TypeScriptKind::Definite,
                bang.span,
                NodeIdentifier::NONE,
            );
        }
        self.maybe_type_annotation(key)?;
        let value = if self.eat_op("=")? {
            Some(self.assignment()?)
        } else {
            None
        };
        self.semicolon()?;
        Ok(self.syntax_tree.class(
            Class::Field {
                key,
                value,
                computed,
                is_static,
            },
            self.span_from(start),
        ))
    }

    fn class_member(&mut self) -> R<Member> {
        let start = self.token.span.start_offset;
        let decorators = self.decorators()?;
        let (mut erased, mut accessor) = self.modifiers()?;
        let is_static = self.is_kw("static")
            && !matches!(self.peek().t, T::LParen | T::Semi | T::RBrace)
            && self.text(self.peek()) != "=";
        if is_static {
            self.bump()?;
            if self.token.t == T::LBrace {
                let body = self.block()?;
                return Ok(Member::Runtime(
                    self.syntax_tree
                        .class(Class::StaticBlock(body), self.span_from(start)),
                ));
            }
        }
        while self.at_modifier(&["readonly", "override", "accessor"]) {
            accessor |= self.is_kw("accessor");
            self.bump()?;
        }
        if self.typescript && self.starts_index_signature() {
            let signature = self.index_signature(start)?;
            self.semicolon()?;
            return Ok(Member::Erased(signature));
        }
        let is_async = self.is_kw("async")
            && !self.peek().newline_before
            && !matches!(self.peek().t, T::LParen | T::Semi | T::RBrace)
            && self.text(self.peek()) != "=";
        if is_async {
            self.bump()?;
        }
        let generator = self.eat_op("*")?;
        let getter_setter = if (self.is_kw("get") || self.is_kw("set"))
            && !matches!(self.peek().t, T::LParen | T::Semi | T::RBrace)
            && self.text(self.peek()) != "="
        {
            let getter = self.is_kw("get");
            self.bump()?;
            Some(getter)
        } else {
            None
        };
        let (key, computed, _) = self.property_key()?;
        if self.typescript && self.token.t == T::Question {
            let q = self.bump()?;
            self.typescript(key, TypeScriptKind::Optional, q.span, NodeIdentifier::NONE);
        }
        let type_parameters = self.maybe_type_parameters()?;
        let member = if self.token.t == T::LParen {
            let parameters = self.parameters()?;
            if let Some(getter) = getter_setter {
                if is_async || generator {
                    return self.fail("an accessor cannot be async or a generator");
                }
                self.accessor_parameters(parameters, getter)?;
            }
            let ret = self.maybe_return_type()?;
            // An abstract method or an overload has no body.
            let bodiless = self.typescript && self.token.t != T::LBrace;
            let body = if bodiless {
                self.semicolon()?;
                NodeIdentifier::NONE
            } else {
                self.block()?
            };
            erased |= bodiless;
            let span = self.span_from(start);
            let function = self.close(parameters, |tree, parameters| {
                tree.function(false, None, parameters, body, is_async, span)
            });
            self.syntax_tree.mark_generator(function, generator);
            self.signature_typescript(function, type_parameters, ret);
            self.syntax_tree.class(
                Class::Method {
                    key,
                    function,
                    computed,
                    is_static,
                    getter: getter_setter == Some(true),
                    setter: getter_setter == Some(false),
                },
                span,
            )
        } else {
            if is_async || generator || getter_setter.is_some() {
                return self.fail("expected method parameters");
            }
            let field = self.field(key, computed, is_static, start)?;
            if accessor && !erased {
                self.runtime(TypeScriptFeature::Accessor, self.span_from(start));
            }
            field
        };
        self.record_decorators(member, &decorators);
        Ok(if erased {
            Member::Erased(member)
        } else {
            Member::Runtime(member)
        })
    }
}

/// A class member, and whether erasing types keeps it.
enum Member {
    Runtime(NodeIdentifier),
    Erased(NodeIdentifier),
}

#[cfg(test)]
mod tests;
