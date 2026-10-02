use super::{
    Formatter, Kind, LayoutInstructionIdentifier, NodeIdentifier, R, Slot, TypeScriptKind,
    Unsupported, union_of_plain_types,
};

impl Formatter<'_> {
    /// Prettier's `printMemberExpression`. The lookup is inlined in the cases Prettier always
    /// inlines; otherwise its `group(indent([softline, lookup]))` may break under conditions not
    /// ported, so the expression must fit.
    pub(super) fn member(
        &mut self,
        identifier: NodeIdentifier,
        object: NodeIdentifier,
        property: NodeIdentifier,
        computed: bool,
        optional: bool,
    ) -> R<LayoutInstructionIdentifier> {
        let parent_is_member = self
            .at
            .is_some_and(|(p, _)| matches!(self.syntax_tree.kind(p), Kind::Member { .. }));
        let o = self.expression(object, Some(identifier), Slot::Object)?;
        let q = if optional {
            self.lit("?.")
        } else {
            self.docs.nil()
        };
        let lookup = if computed {
            let lb = self.lit("[");
            let p = self.expression(property, Some(identifier), Slot::Value)?;
            let rb = self.lit("]");
            if matches!(self.syntax_tree.kind(property), Kind::Number(_)) {
                self.cat(&[q, lb, p, rb])
            } else {
                let soft = self.docs.softline();
                let inner = self.cat(&[soft, p]);
                let inner = self.docs.indent(inner);
                let soft = self.docs.softline();
                self.docs.group(&[q, lb, inner, soft, rb])
            }
        } else {
            let dot = if optional {
                self.docs.nil()
            } else {
                self.lit(".")
            };
            let p = self.docs.text(self.syntax_tree.name(property));
            self.cat(&[q, dot, p])
        };
        let inline = computed
            || (matches!(self.syntax_tree.kind(object), Kind::Identifier(_)) && !parent_is_member);
        let flat = self.cat(&[o, lookup]);
        Ok(if inline {
            flat
        } else {
            self.docs.flat_only(flat)
        })
    }

    /// Prettier's `printCallExpression`. A member callee makes a member chain, which is not
    /// ported, so such a call must fit on its line.
    pub(super) fn call(
        &mut self,
        identifier: NodeIdentifier,
        callee: NodeIdentifier,
        arguments: &[NodeIdentifier],
        optional: bool,
        is_new: bool,
    ) -> R<LayoutInstructionIdentifier> {
        let type_arguments = match self.typescript_of(callee, TypeScriptKind::TypeArgs) {
            Some(span) => {
                let inner = &span.text(self.source_text)[1..span.len() as usize - 1];
                let Some(text) = union_of_plain_types(inner) else {
                    return Err(Unsupported::at(
                        "type arguments",
                        self.syntax_tree.source_location(identifier),
                    ));
                };
                self.typescript_printed += 1;
                self.docs.text(&format!("<{text}>"))
            }
            None => self.docs.nil(),
        };
        let new = if is_new {
            self.lit("new ")
        } else {
            self.docs.nil()
        };
        let c = self.expression(callee, Some(identifier), Slot::Callee)?;
        let q = if optional {
            self.lit("?.")
        } else {
            self.docs.nil()
        };
        let a = self.arguments(identifier, arguments)?;
        let a = self.cat(&[type_arguments, a]);
        let parts = [new, c, q, a];
        if !is_new && matches!(self.syntax_tree.kind(callee), Kind::Member { .. }) {
            let flat = self.cat(&parts);
            return Ok(self.docs.flat_only(flat));
        }
        Ok(
            if matches!(self.syntax_tree.kind(callee), Kind::Call { .. }) {
                self.docs.group(&parts)
            } else {
                self.cat(&parts)
            },
        )
    }

    /// Prettier's `printCallArguments`, without the first/last-argument hugging layouts: an
    /// argument list that might hug must fit on its line.
    pub(super) fn arguments(
        &mut self,
        identifier: NodeIdentifier,
        arguments: &[NodeIdentifier],
    ) -> R<LayoutInstructionIdentifier> {
        if arguments.is_empty() {
            let o = self.lit("(");
            let c = self.lit(")");
            return Ok(self.docs.group(&[o, c]));
        }
        let mut printed = Vec::new();
        for &a in arguments {
            printed.push(self.expression(a, Some(identifier), Slot::Argument)?);
        }
        let inline = |f: &mut Self, printed: &[LayoutInstructionIdentifier]| {
            let o = f.lit("(");
            let sep = f.lit(", ");
            let mut parts = vec![o];
            parts.extend(f.docs.join(sep, printed));
            parts.push(f.lit(")"));
            f.cat(&parts)
        };
        if self.react_hook_with_deps(arguments) {
            return Ok(inline(self, &printed));
        }
        let mut blank = false;
        let mut items = Vec::new();
        for (i, &p) in printed.iter().enumerate() {
            if i + 1 == printed.len() {
                items.push(p);
                continue;
            }
            let comma = self.lit(",");
            if self.blank_line_between(arguments[i], arguments[i + 1]) {
                blank = true;
                let h1 = self.docs.hardline();
                let h2 = self.docs.hardline();
                items.push(self.cat(&[p, comma, h1, h2]));
            } else {
                let line = self.docs.line();
                items.push(self.cat(&[p, comma, line]));
            }
        }
        let trailing = self.trailing_comma();
        if blank || self.function_composition(arguments) {
            let line = self.docs.line();
            let line2 = self.docs.line();
            let parts = self.bracketed("(", line, items, trailing, line2, ")");
            return Ok(self.docs.group_broken(&parts));
        }
        if self.may_hug_an_argument(arguments) {
            let flat = inline(self, &printed);
            return Ok(self.docs.flat_only(flat));
        }
        let soft = self.docs.softline();
        let soft2 = self.docs.softline();
        let parts = self.bracketed("(", soft, items, trailing, soft2, ")");
        let curried_callee = self.at.is_some_and(|(p, slot)| {
            slot == Slot::Callee
                && matches!(
                    self.syntax_tree.kind(p),
                    Kind::Call { arguments: pa, .. } if !pa.is_empty() && arguments.len() > pa.len()
                )
        });
        Ok(if curried_callee {
            self.cat(&parts)
        } else if printed.iter().any(|&p| self.docs.will_break(p)) {
            self.docs.group_broken(&parts)
        } else {
            self.docs.group(&parts)
        })
    }

    /// Prettier's `isReactHookCallWithDepsArray`: `(() => {…}, [deps])`, printed inline.
    pub(super) fn react_hook_with_deps(&self, arguments: &[NodeIdentifier]) -> bool {
        let at = |i: usize| {
            matches!(
                self.syntax_tree.kind(arguments[i]),
                Kind::Arrow {
                    parameters: [],
                    expression_body: false,
                    ..
                }
            ) && matches!(self.syntax_tree.kind(arguments[i + 1]), Kind::Array(_))
        };
        match arguments.len() {
            2 => at(0),
            3 => matches!(self.syntax_tree.kind(arguments[0]), Kind::Identifier(_)) && at(1),
            _ => false,
        }
    }

    /// Prettier's `isFunctionCompositionArgs`: more than one function argument (or one inside a
    /// call argument) puts every argument on its own line.
    pub(super) fn function_composition(&self, arguments: &[NodeIdentifier]) -> bool {
        if arguments.len() <= 1 {
            return false;
        }
        let is_fn = |a: NodeIdentifier| {
            matches!(
                self.syntax_tree.kind(a),
                Kind::Function { .. }
                    | Kind::Arrow {
                        expression_body: false,
                        ..
                    }
            )
        };
        let mut count = 0;
        for &a in arguments {
            if is_fn(a) {
                count += 1;
                if count > 1 {
                    return true;
                }
            } else if let Kind::Call {
                arguments: inner, ..
            } = self.syntax_tree.kind(a)
                && inner.iter().any(|&x| is_fn(x))
            {
                return true;
            }
        }
        false
    }

    /// A superset of Prettier's `shouldGroupFirst` / `shouldGroupLast`.
    pub(super) fn may_hug_an_argument(&self, arguments: &[NodeIdentifier]) -> bool {
        arguments.iter().any(|&a| match self.syntax_tree.kind(a) {
            Kind::Object(p) => !p.is_empty(),
            Kind::Array(e) => !e.is_empty(),
            Kind::Function { .. } | Kind::Arrow { .. } => true,
            _ => false,
        })
    }

    /// Prettier's `printArrowFunction` for a single arrow (chains are not ported).
    pub(super) fn arrow(
        &mut self,
        identifier: NodeIdentifier,
        parameters: &[NodeIdentifier],
        body: NodeIdentifier,
        is_async: bool,
        expression_body: bool,
    ) -> R<LayoutInstructionIdentifier> {
        if expression_body && matches!(self.syntax_tree.kind(body), Kind::Arrow { .. }) {
            return Err(Unsupported::at(
                "arrow chain",
                self.syntax_tree.source_location(body),
            ));
        }
        if expression_body && matches!(self.syntax_tree.kind(body), Kind::Conditional { .. }) {
            return Err(Unsupported::at(
                "conditional arrow body",
                self.syntax_tree.source_location(body),
            ));
        }
        let mut sig = Vec::new();
        if is_async {
            sig.push(self.lit("async "));
        }
        let ps = self.parameters(parameters)?;
        let ret = self.type_suffix(
            self.typescript_of(identifier, TypeScriptKind::ReturnType),
            ": ",
        )?;
        sig.push(self.docs.group(&[ps, ret]));
        let sig = self.cat(&sig);
        let sig = self.docs.group(&[sig]);
        let arrow = self.lit(" =>");
        if !expression_body {
            let b = self.block(body, true)?;
            let sp = self.lit(" ");
            let b = self.cat(&[sp, b]);
            let b = self.docs.group(&[b]);
            return Ok(self.docs.group(&[sig, arrow, b]));
        }
        let saved = self.paren_leftmost;
        self.paren_leftmost = self.leftmost_needing_parens(body, true);
        let b = self.expression(body, Some(identifier), Slot::ArrowBody);
        self.paren_leftmost = saved;
        let b = b?;
        // `shouldPrintBodyOnSameLine` for the bodies ported here (`mayBreakAfterShortPrefix`).
        let same_line = matches!(
            self.syntax_tree.kind(body),
            Kind::Array(_) | Kind::Object(_) | Kind::Sequence(_)
        );
        let body_doc = if same_line {
            let sp = self.lit(" ");
            self.cat(&[sp, b])
        } else {
            let line = self.docs.line();
            let inner = self.cat(&[line, b]);
            self.docs.indent(inner)
        };
        let body_doc = self.docs.group(&[body_doc]);
        Ok(self.docs.group(&[sig, arrow, body_doc]))
    }
}
