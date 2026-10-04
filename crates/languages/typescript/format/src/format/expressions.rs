use super::{
    Formatter, Kind, LayoutInstructionIdentifier, NodeIdentifier, PatternContext, R, Slot,
    TypeScriptKind, TypeScriptSyntax, Unsupported, op_of, print_number, should_flatten,
};

impl Formatter<'_> {
    pub(super) fn expression(
        &mut self,
        identifier: NodeIdentifier,
        parent: Option<NodeIdentifier>,
        slot: Slot,
    ) -> R<LayoutInstructionIdentifier> {
        let saved = self.at;
        self.at = parent.map(|p| (p, slot));
        let document = self
            .expression_inner(identifier)
            .and_then(|d| self.typescript_expression_suffix(identifier, d));
        self.at = saved;
        let document = document?;
        let leftmost = self.paren_leftmost == Some(identifier);
        if leftmost
            || self.syntax_tree.flags(identifier) & rsvelte_typescript::syntax_tree::flag::GROUPED
                != 0
            || parent.is_some_and(|p| self.needs_parens(identifier, p, slot))
        {
            if leftmost {
                self.paren_leftmost = None;
            }
            let lp = self.lit("(");
            let rp = self.lit(")");
            return Ok(self.cat(&[lp, document, rp]));
        }
        Ok(document)
    }

    /// `!`, `as T` and `satisfies T` erased from the tree, printed back after the expression in
    /// source order. The erased wrapper would change parenthesization in operator positions, so a
    /// cast is printed only where it needs none.
    pub(super) fn typescript_expression_suffix(
        &mut self,
        identifier: NodeIdentifier,
        document: LayoutInstructionIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let mut entries: Vec<TypeScriptSyntax> = {
            let i = self.typescript.partition_point(|t| t.node < identifier);
            self.typescript[i..]
                .iter()
                .take_while(|t| t.node == identifier)
                .filter(|t| {
                    matches!(
                        t.kind,
                        TypeScriptKind::NonNull
                            | TypeScriptKind::As
                            | TypeScriptKind::Satisfies
                            | TypeScriptKind::Assertion
                    )
                })
                .copied()
                .collect()
        };
        if entries.is_empty() {
            return Ok(document);
        }
        entries.sort_by_key(|t| t.span.start_offset);
        let simple = matches!(
            self.syntax_tree.kind(identifier),
            Kind::Identifier(_) | Kind::Member { .. } | Kind::Call { .. } | Kind::This
        );
        let cast = entries.iter().any(|t| t.kind != TypeScriptKind::NonNull);
        let cast_ok = matches!(
            self.at.map(|(_, s)| s),
            None | Some(
                Slot::Init | Slot::Argument | Slot::Value | Slot::Element | Slot::Statement
            )
        );
        if !simple || (cast && !cast_ok) {
            return Err(Unsupported::at(
                "TypeScript cast in this position",
                entries[0].span,
            ));
        }
        let mut parts = vec![document];
        for t in entries {
            parts.push(match t.kind {
                TypeScriptKind::NonNull => {
                    self.typescript_printed += 1;
                    self.lit("!")
                }
                TypeScriptKind::Assertion => {
                    return Err(Unsupported::at("TypeScript type assertion", t.span));
                }
                TypeScriptKind::As => self.type_suffix(Some(t.span), " as ")?,
                _ => self.type_suffix(Some(t.span), " satisfies ")?,
            });
        }
        Ok(self.cat(&parts))
    }

    #[expect(clippy::too_many_lines, reason = "one arm per expression kind")]
    pub(super) fn expression_inner(
        &mut self,
        identifier: NodeIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        match self.syntax_tree.kind(identifier) {
            Kind::Identifier(_) => Ok(self.docs.text(self.syntax_tree.name(identifier))),
            Kind::Number(_) => {
                let raw = self.span(identifier).text(self.source_text);
                Ok(self.docs.text(&print_number(raw)))
            }
            Kind::String => Ok(self.string(identifier)),
            Kind::Regex { .. } => Ok(self.docs.text(self.span(identifier).text(self.source_text))),
            Kind::Boolean(b) => Ok(self.lit(if b { "true" } else { "false" })),
            Kind::Null => Ok(self.lit("null")),
            Kind::This => Ok(self.lit("this")),
            Kind::Template {
                quasis,
                expressions,
            } => self.template(quasis, expressions),
            Kind::Array(items) => {
                let e = self.docs.nil();
                self.array(items, e)
            }
            Kind::Object(props) => {
                let e = self.docs.nil();
                self.object(identifier, props, None, e)
            }
            Kind::Member {
                object,
                property,
                computed,
                optional,
            } => self.member(identifier, object, property, computed, optional),
            Kind::Call {
                callee,
                arguments,
                optional,
                ..
            } => self.call(identifier, callee, arguments, optional, false),
            Kind::New { callee, arguments } => {
                self.call(identifier, callee, arguments, false, true)
            }
            Kind::Arrow {
                parameters,
                body,
                is_async,
                expression_body,
            } => self.arrow(identifier, parameters, body, is_async, expression_body),
            Kind::Function { .. } => self.function(identifier),
            Kind::Unary(op, arg) => {
                let o = self.lit(op.as_str());
                let a = self.expression(arg, Some(identifier), Slot::Operand)?;
                if op.as_str().ends_with(|c: char| c.is_ascii_lowercase()) {
                    let sp = self.lit(" ");
                    Ok(self.cat(&[o, sp, a]))
                } else {
                    Ok(self.cat(&[o, a]))
                }
            }
            Kind::Update { op, prefix, arg } => {
                let o = self.lit(op.as_str());
                let a = self.expression(arg, Some(identifier), Slot::Operand)?;
                Ok(if prefix {
                    self.cat(&[o, a])
                } else {
                    self.cat(&[a, o])
                })
            }
            Kind::Binary(..) | Kind::Logical(..) => {
                // `printBinaryishExpression`'s broken layouts depend on the parent; not ported.
                let parts = self.binaryish(identifier)?;
                let flat = self.cat(&parts);
                Ok(self.docs.flat_only(flat))
            }
            Kind::Conditional {
                test,
                consequent,
                alternate,
            } => {
                let t = self.expression(test, Some(identifier), Slot::Test)?;
                let q = self.lit(" ? ");
                let c = self.expression(consequent, Some(identifier), Slot::Branch)?;
                let column = self.lit(" : ");
                let a = self.expression(alternate, Some(identifier), Slot::Branch)?;
                let flat = self.cat(&[t, q, c, column, a]);
                Ok(self.docs.flat_only(flat))
            }
            Kind::Assign(op, l, r) => {
                let left = self.pattern(l, PatternContext::AssignLeft)?;
                let right = self.expression(r, Some(identifier), Slot::Right)?;
                let op = format!(" {}", op.as_str());
                let op = self.docs.text(&op);
                Ok(self.assignment(left, op, right, l, r))
            }
            Kind::Sequence(items) => {
                let mut parts = Vec::new();
                for (i, &it) in items.iter().enumerate() {
                    if i > 0 {
                        parts.push(self.lit(", "));
                    }
                    parts.push(self.expression(it, Some(identifier), Slot::Element)?);
                }
                let flat = self.cat(&parts);
                Ok(self.docs.flat_only(flat))
            }
            Kind::Await(a) => {
                let kw = self.lit("await ");
                let a = self.expression(a, Some(identifier), Slot::Operand)?;
                Ok(self.cat(&[kw, a]))
            }
            Kind::Spread(a) => {
                let dots = self.lit("...");
                let a = self.expression(a, Some(identifier), Slot::Argument)?;
                Ok(self.cat(&[dots, a]))
            }
            Kind::ObjectPattern(_)
            | Kind::ArrayPattern(_)
            | Kind::AssignPattern(..)
            | Kind::Rest(_) => self.pattern(identifier, PatternContext::Nested),
            _ => Err(Unsupported::at(
                "expression kind",
                self.syntax_tree.source_location(identifier),
            )),
        }
    }

    /// Prettier's `printBinaryishExpressions`, flat: same-precedence chains flatten into one list.
    pub(super) fn binaryish(
        &mut self,
        identifier: NodeIdentifier,
    ) -> R<Vec<LayoutInstructionIdentifier>> {
        let (op, l, r) = match self.syntax_tree.kind(identifier) {
            Kind::Binary(op, l, r) => (op.as_str(), l, r),
            Kind::Logical(op, l, r) => (op.as_str(), l, r),
            _ => unreachable!("binaryish"),
        };
        let flatten = match (
            op_of(self.syntax_tree, identifier),
            op_of(self.syntax_tree, l),
        ) {
            (Some(p), Some(c)) => should_flatten(p, c) && !self.has_typescript(l),
            _ => false,
        };
        let mut parts = if flatten {
            self.binaryish(l)?
        } else {
            vec![self.expression(l, Some(identifier), Slot::Left)?]
        };
        let op = format!(" {op} ");
        parts.push(self.docs.text(&op));
        parts.push(self.expression(r, Some(identifier), Slot::Right)?);
        Ok(parts)
    }

    pub(super) fn has_typescript(&self, identifier: NodeIdentifier) -> bool {
        let i = self.typescript.partition_point(|t| t.node < identifier);
        self.typescript.get(i).is_some_and(|t| t.node == identifier)
    }
}
