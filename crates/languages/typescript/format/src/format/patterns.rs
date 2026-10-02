use super::{
    Formatter, Kind, LayoutInstructionIdentifier, NodeIdentifier, PatternContext, R, Slot,
    TypeScriptKind, UnaryOperator, Unsupported,
};

impl Formatter<'_> {
    /// A binding target: identifier (with its annotation), pattern, default or rest.
    pub(super) fn pattern(
        &mut self,
        identifier: NodeIdentifier,
        context: PatternContext,
    ) -> R<LayoutInstructionIdentifier> {
        match self.syntax_tree.kind(identifier) {
            Kind::Identifier(_) => {
                let name = self.docs.text(self.syntax_tree.name(identifier));
                let opt = if self
                    .typescript_of(identifier, TypeScriptKind::Optional)
                    .is_some()
                {
                    self.typescript_printed += 1;
                    self.lit("?")
                } else {
                    self.docs.nil()
                };
                let ty = self.type_suffix(
                    self.typescript_of(identifier, TypeScriptKind::Annotation),
                    ": ",
                )?;
                Ok(self.cat(&[name, opt, ty]))
            }
            Kind::ObjectPattern(props) => {
                let ty = self.type_suffix(
                    self.typescript_of(identifier, TypeScriptKind::Annotation),
                    ": ",
                )?;
                self.object(identifier, props, Some(context), ty)
            }
            Kind::ArrayPattern(items) => {
                let ty = self.type_suffix(
                    self.typescript_of(identifier, TypeScriptKind::Annotation),
                    ": ",
                )?;
                self.array(items, ty)
            }
            Kind::AssignPattern(l, r) => {
                let l = self.pattern(l, PatternContext::DefaultLeft)?;
                let eq = self.lit(" = ");
                let r = self.expression(r, Some(identifier), Slot::Right)?;
                Ok(self.cat(&[l, eq, r]))
            }
            Kind::Rest(a) => {
                let dots = self.lit("...");
                let a = self.pattern(a, PatternContext::Nested)?;
                Ok(self.cat(&[dots, a]))
            }
            _ => self.expression(identifier, None, Slot::Left),
        }
    }

    /// Prettier's `printObject` for object expressions (`pattern: None`) and patterns.
    pub(super) fn object(
        &mut self,
        identifier: NodeIdentifier,
        props: &[NodeIdentifier],
        pattern: Option<PatternContext>,
        suffix: LayoutInstructionIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let should_break = match pattern {
            Some(PatternContext::Param { .. } | PatternContext::DefaultLeft) => false,
            Some(_) => props.iter().any(|&p| {
                let Kind::Property { value, .. } = self.syntax_tree.kind(p) else {
                    return false;
                };
                matches!(
                    self.syntax_tree.kind(value),
                    Kind::ObjectPattern(_) | Kind::ArrayPattern(_)
                )
            }),
            // `objectWrap: "preserve"`: a line break after `{` in the source keeps it expanded.
            None => props.first().is_some_and(|&p| {
                let start = self.span(identifier).start_offset as usize;
                let end = self.span(p).start_offset as usize;
                self.source_text[start..end].contains('\n')
            }),
        };
        if props.is_empty() {
            let o = self.lit("{");
            let c = self.lit("}");
            return Ok(self.docs.group(&[o, c, suffix]));
        }
        let mut items = Vec::new();
        for (i, &p) in props.iter().enumerate() {
            if i > 0 {
                items.push(self.lit(","));
                items.push(self.docs.line());
                if self.blank_line_between(props[i - 1], p) {
                    items.push(self.docs.hardline());
                }
            }
            items.push(self.property(p, pattern.is_some())?);
        }
        let ends_in_rest = matches!(
            self.syntax_tree.kind(*props.last().expect("non-empty")),
            Kind::Rest(_)
        );
        let trailing = if ends_in_rest {
            self.docs.nil()
        } else {
            self.trailing_comma()
        };
        let line = self.docs.line();
        let line2 = self.docs.line();
        let [o, inner, t, l, c] = self.bracketed("{", line, items, trailing, line2, "}");
        let body = [o, inner, t, l, c, suffix];
        let ungrouped = match pattern {
            Some(PatternContext::Param { hug }) => hug,
            Some(PatternContext::Declarator | PatternContext::AssignLeft) => !should_break,
            _ => false,
        };
        Ok(if ungrouped {
            self.cat(&body)
        } else if should_break {
            self.docs.group_broken(&body)
        } else {
            self.docs.group(&body)
        })
    }

    pub(super) fn property(
        &mut self,
        p: NodeIdentifier,
        pattern: bool,
    ) -> R<LayoutInstructionIdentifier> {
        match self.syntax_tree.kind(p) {
            Kind::Property {
                key,
                value,
                shorthand,
                computed,
                method,
            } => {
                if method {
                    return Err(Unsupported::at(
                        "object method",
                        self.syntax_tree.source_location(p),
                    ));
                }
                let value_doc = |f: &mut Self| {
                    if pattern {
                        f.pattern(value, PatternContext::Nested)
                    } else {
                        f.expression(value, Some(p), Slot::Value)
                    }
                };
                if shorthand {
                    return value_doc(self);
                }
                let k = if computed {
                    let lb = self.lit("[");
                    let k = self.expression(key, Some(p), Slot::Value)?;
                    let rb = self.lit("]");
                    self.cat(&[lb, k, rb])
                } else if matches!(self.syntax_tree.kind(key), Kind::Identifier(_)) {
                    self.docs.text(self.syntax_tree.name(key))
                } else {
                    return Err(Unsupported::at(
                        "quoted or numeric property key",
                        self.syntax_tree.source_location(key),
                    ));
                };
                let v = value_doc(self)?;
                // A property is an assignment-like layout (`printAssignment` with ":"); not ported.
                let colon = self.lit(": ");
                let flat = self.cat(&[k, colon, v]);
                Ok(self.docs.flat_only(flat))
            }
            Kind::Rest(a) | Kind::Spread(a) => {
                let dots = self.lit("...");
                let a = if pattern {
                    self.pattern(a, PatternContext::Nested)?
                } else {
                    self.expression(a, Some(p), Slot::Argument)?
                };
                Ok(self.cat(&[dots, a]))
            }
            _ => unreachable!("object member"),
        }
    }

    /// Prettier's `printArrayItems` in a group, for arrays that are not concisely printed.
    pub(super) fn array(
        &mut self,
        items: &[NodeIdentifier],
        suffix: LayoutInstructionIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        if items.is_empty() {
            let o = self.lit("[");
            let c = self.lit("]");
            return Ok(self.docs.group(&[o, c, suffix]));
        }
        if items.len() > 1
            && items.iter().all(|&i| match self.syntax_tree.kind(i) {
                Kind::Number(_) => true,
                Kind::Unary(UnaryOperator::Neg | UnaryOperator::Plus, a) => {
                    matches!(self.syntax_tree.kind(a), Kind::Number(_))
                }
                _ => false,
            })
        {
            return self.concise_array(items, suffix);
        }
        let mut parts = Vec::new();
        for (i, &it) in items.iter().enumerate() {
            if i > 0 {
                parts.push(self.lit(","));
                parts.push(self.docs.line());
            }
            parts.push(match self.syntax_tree.kind(it) {
                Kind::Hole => {
                    return Err(Unsupported::at(
                        "array hole",
                        self.syntax_tree.source_location(it),
                    ));
                }
                Kind::Rest(_)
                | Kind::AssignPattern(..)
                | Kind::ObjectPattern(_)
                | Kind::ArrayPattern(_) => self.pattern(it, PatternContext::Nested)?,
                _ => self.expression(it, None, Slot::Element)?,
            });
        }
        let ends_in_rest = matches!(
            self.syntax_tree.kind(*items.last().expect("non-empty")),
            Kind::Rest(_)
        );
        let trailing = if ends_in_rest {
            self.docs.nil()
        } else {
            self.trailing_comma()
        };
        let soft = self.docs.softline();
        let soft2 = self.docs.softline();
        let [open, inner, trail, end_soft, close] =
            self.bracketed("[", soft, parts, trailing, soft2, "]");
        let docs = [open, inner, trail, end_soft, close];
        let group = if self.breaks_array(items) {
            self.docs.group_broken(&docs)
        } else {
            self.docs.group(&docs)
        };
        Ok(self.cat(&[group, suffix]))
    }

    /// Prettier's `shouldBreak` for an array: two or more objects (or arrays), each with more
    /// than one member, and no change of type between neighbours.
    pub(super) fn breaks_array(&self, items: &[NodeIdentifier]) -> bool {
        items.len() > 1
            && items.iter().enumerate().all(|(i, &it)| {
                let (len, ty) = match self.syntax_tree.kind(it) {
                    Kind::Object(p) => (p.len(), 0),
                    Kind::Array(e) => (e.len(), 1),
                    _ => return false,
                };
                let same_as_next =
                    items
                        .get(i + 1)
                        .is_none_or(|&n| match self.syntax_tree.kind(n) {
                            Kind::Object(_) => ty == 0,
                            Kind::Array(_) => ty == 1,
                            _ => false,
                        });
                same_as_next && len > 1
            })
    }

    /// Prettier's `printArrayItemsConcisely`: numbers fill the line, and the trailing comma
    /// follows the array's own group.
    pub(super) fn concise_array(
        &mut self,
        items: &[NodeIdentifier],
        suffix: LayoutInstructionIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let identifier = self.docs.new_group_identifier();
        let mut parts = Vec::with_capacity(items.len() * 2);
        for (i, &it) in items.iter().enumerate() {
            let e = self.expression(it, None, Slot::Element)?;
            let c = self.lit(",");
            let Some(&next) = items.get(i + 1) else {
                let nil = self.docs.nil();
                let t = self.docs.if_break_of(c, nil, identifier);
                parts.push(self.cat(&[e, t]));
                break;
            };
            parts.push(self.cat(&[e, c]));
            let sep = if self.blank_line_between(it, next) {
                let h1 = self.docs.hardline();
                let h2 = self.docs.hardline();
                self.cat(&[h1, h2])
            } else {
                self.docs.line()
            };
            parts.push(sep);
        }
        let fill = self.docs.fill(&parts);
        let soft = self.docs.softline();
        let inner = self.cat(&[soft, fill]);
        let inner = self.docs.indent(inner);
        let open = self.lit("[");
        let soft = self.docs.softline();
        let close = self.lit("]");
        let group = self
            .docs
            .group_with_identifier(&[open, inner, soft, close], identifier);
        Ok(self.cat(&[group, suffix]))
    }
}
