use super::{NodeIdentifier, ParseError, Parser, R, RESERVED, Span, T, flag};

impl Parser<'_, '_> {
    // ---- binding patterns
    // ------------------------------------------------------------------------

    pub(super) fn binding_target(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        match self.token.t {
            T::Identifier => {
                let t = self.bump()?;
                if RESERVED.contains(&self.text(t)) {
                    return Err(ParseError {
                        message: format!("unexpected keyword `{}`", self.text(t)),
                        span: t.span,
                    });
                }
                Ok(self.syntax_tree.ident(self.text(t), t.span))
            }
            T::LBrace => {
                self.bump()?;
                let props = self.open();
                while self.token.t != T::RBrace {
                    let plo = self.token.span.start_offset;
                    let prop = if self.eat(T::Ellipsis)? {
                        let arg = self.binding_target()?;
                        self.syntax_tree.rest(arg, self.span_from(plo))
                    } else {
                        let (key, computed, key_span) = self.property_key()?;
                        if self.eat(T::Colon)? {
                            let value = self.binding_element()?;
                            let flags = if computed { flag::COMPUTED } else { 0 };
                            self.syntax_tree
                                .property(key, value, flags, self.span_from(plo))
                        } else {
                            let Some(name) = self.syntax_tree.atom(key).filter(|_| !computed)
                            else {
                                return self.fail("expected `:`");
                            };
                            let mut value = self.syntax_tree.ident_atom(name, key_span);
                            if self.eat_op("=")? {
                                let d = self.assignment()?;
                                value = self.syntax_tree.assign_pat(value, d, self.span_from(plo));
                            }
                            self.syntax_tree.property(
                                key,
                                value,
                                flag::SHORTHAND,
                                self.span_from(plo),
                            )
                        }
                    };
                    self.item(prop);
                    if !self.eat(T::Comma)? {
                        break;
                    }
                }
                self.expect(T::RBrace, "}")?;
                let span = self.span_from(start_offset);
                Ok(self.close(props, |syntax_tree, props| {
                    syntax_tree.object_pat(props, span)
                }))
            }
            T::LBracket => {
                self.bump()?;
                let items = self.open();
                while self.token.t != T::RBracket {
                    let ilo = self.token.span.start_offset;
                    if self.token.t == T::Comma {
                        self.bump()?;
                        let hole = self.syntax_tree.hole(Span::new(ilo, ilo));
                        self.item(hole);
                        continue;
                    }
                    let item = if self.eat(T::Ellipsis)? {
                        let arg = self.binding_target()?;
                        self.syntax_tree.rest(arg, self.span_from(ilo))
                    } else {
                        self.binding_element()?
                    };
                    self.item(item);
                    if !self.eat(T::Comma)? {
                        break;
                    }
                }
                self.expect(T::RBracket, "]")?;
                let span = self.span_from(start_offset);
                Ok(self.close(items, |syntax_tree, items| {
                    syntax_tree.array_pat(items, span)
                }))
            }
            _ => self.fail("expected a binding name or pattern"),
        }
    }

    pub(super) fn accessor_parameters(&self, parameters: super::List, getter: bool) -> R<()> {
        let parameters = &self.syntax_tree.scratch[parameters.0..];
        let valid = if getter {
            parameters.is_empty()
        } else {
            parameters.len() == 1
                && !matches!(self.syntax_tree.kind(parameters[0]), super::Kind::Rest(_))
        };
        if valid {
            Ok(())
        } else {
            self.fail("invalid accessor parameters")
        }
    }

    pub(super) fn binding_element(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        let target = self.binding_target()?;
        if self.eat_op("=")? {
            let d = self.assignment()?;
            return Ok(self
                .syntax_tree
                .assign_pat(target, d, self.span_from(start_offset)));
        }
        Ok(target)
    }
}

impl Parser<'_, '_> {
    pub(super) fn assignment_pattern(&mut self, node: NodeIdentifier) -> R<NodeIdentifier> {
        let span = self.syntax_tree.source_location(node);
        match self.syntax_tree.kind(node) {
            super::Kind::Identifier(_) | super::Kind::Member { .. } | super::Kind::Hole => Ok(node),
            super::Kind::Object(items) | super::Kind::Array(items) => {
                let object = self.syntax_tree.tag(node) == crate::syntax_tree::Tag::Object;
                let mut items = items.to_vec();
                for item in &mut items {
                    *item = self.assignment_pattern(*item)?;
                }
                Ok(if object {
                    self.syntax_tree.object_pat(&items, span)
                } else {
                    self.syntax_tree.array_pat(&items, span)
                })
            }
            super::Kind::Property { key, value, .. } => {
                let value = self.assignment_pattern(value)?;
                Ok(self
                    .syntax_tree
                    .property(key, value, self.syntax_tree.flags(node), span))
            }
            super::Kind::Spread(arg) => {
                let arg = self.assignment_pattern(arg)?;
                Ok(self.syntax_tree.rest(arg, span))
            }
            super::Kind::Assign(super::AssignmentOperator::Assign, left, right) => {
                let left = self.assignment_pattern(left)?;
                Ok(self.syntax_tree.assign_pat(left, right, span))
            }
            _ => self.fail("invalid assignment target"),
        }
    }
}
