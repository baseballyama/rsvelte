use super::{NodeIdentifier, Parser, R, T};
use crate::syntax_tree::Class;

impl Parser<'_, '_> {
    pub(super) fn class_definition(&mut self, declaration: bool) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        self.bump()?;
        let name = if self.token.t == T::Identifier && !self.is_kw("extends") {
            let t = self.bump()?;
            Some(self.syntax_tree.ident(self.text(t), t.span))
        } else if declaration {
            return self.fail("expected class name");
        } else {
            None
        };
        self.maybe_type_parameters()?;
        let superclass = if self.is_kw("extends") {
            self.bump()?;
            Some(self.lhs()?)
        } else {
            None
        };
        if self.typescript && self.is_kw("implements") {
            self.bump()?;
            self.skip_type(false)?;
        }
        self.expect(T::LBrace, "{")?;
        let members = self.open();
        while self.token.t != T::RBrace {
            if self.eat(T::Semi)? {
                continue;
            }
            if self.token.t == T::Eof {
                return self.fail("unterminated class");
            }
            let member = self.class_member()?;
            self.item(member);
        }
        self.bump()?;
        let span = self.span_from(start);
        Ok(self.close(members, |tree, members| {
            tree.class(
                Class::Definition {
                    name,
                    superclass,
                    members,
                    declaration,
                },
                span,
            )
        }))
    }

    fn class_member(&mut self) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        while self.typescript
            && matches!(
                self.text(self.token),
                "public"
                    | "private"
                    | "protected"
                    | "readonly"
                    | "abstract"
                    | "declare"
                    | "override"
            )
            && !matches!(self.peek().t, T::LParen | T::Semi | T::RBrace)
        {
            self.bump()?;
        }
        let is_static = self.is_kw("static")
            && !matches!(self.peek().t, T::LParen | T::Semi | T::RBrace)
            && self.text(self.peek()) != "=";
        if is_static {
            self.bump()?;
            if self.token.t == T::LBrace {
                let body = self.block()?;
                return Ok(self
                    .syntax_tree
                    .class(Class::StaticBlock(body), self.span_from(start)));
            }
        }
        let is_async = self.is_kw("async")
            && !self.peek().newline_before
            && !matches!(self.peek().t, T::LParen | T::Semi | T::RBrace)
            && self.text(self.peek()) != "=";
        if is_async {
            self.bump()?;
        }
        let generator = self.eat_op("*")?;
        let accessor = if (self.is_kw("get") || self.is_kw("set"))
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
        let type_parameters = self.maybe_type_parameters()?;
        if self.token.t == T::LParen {
            let parameters = self.parameters()?;
            if let Some(getter) = accessor {
                if is_async || generator {
                    return self.fail("an accessor cannot be async or a generator");
                }
                self.accessor_parameters(parameters, getter)?;
            }
            let ret = self.maybe_return_type(false)?;
            let body = self.block()?;
            let span = self.span_from(start);
            let function = self.close(parameters, |tree, parameters| {
                tree.function(false, None, parameters, body, is_async, span)
            });
            self.syntax_tree.mark_generator(function, generator);
            self.signature_typescript(function, type_parameters, ret);
            Ok(self.syntax_tree.class(
                Class::Method {
                    key,
                    function,
                    computed,
                    is_static,
                    getter: accessor == Some(true),
                    setter: accessor == Some(false),
                },
                span,
            ))
        } else {
            if is_async || generator || accessor.is_some() {
                return self.fail("expected method parameters");
            }
            if self.typescript && (self.token.t == T::Question || self.is_op("!")) {
                self.bump()?;
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
    }
}
