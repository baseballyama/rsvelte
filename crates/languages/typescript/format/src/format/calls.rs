use super::{
    Formatter, Kind, LayoutInstructionIdentifier, NodeIdentifier, R, Slot, Span, TypeScriptKind,
    Unsupported, union_of_plain_types,
};

/// What a member or call printed before its object or callee.
#[derive(Clone, Copy, Debug)]
pub(super) enum ChainHead {
    /// Whether the member's parent is a member.
    Member(bool),
    Call(CallHead),
}

/// A member or call whose object or callee is being printed.
#[derive(Debug)]
pub(super) struct ChainLink {
    pub(super) node: NodeIdentifier,
    pub(super) parent: Option<NodeIdentifier>,
    pub(super) slot: Slot,
    /// [`Formatter::at`] outside the link, restored when it is finished.
    pub(super) saved: Option<(NodeIdentifier, Slot)>,
    pub(super) head: ChainHead,
    /// Whether the link is the leftmost node that its statement parenthesizes.
    pub(super) leftmost: bool,
}

/// A call's type arguments and `new`, printed before its callee.
#[derive(Clone, Copy, Debug)]
pub(super) struct CallHead {
    type_arguments: LayoutInstructionIdentifier,
    new: LayoutInstructionIdentifier,
}

impl Formatter<'_> {
    pub(super) fn parent_is_member(&self) -> bool {
        self.at
            .is_some_and(|(p, _)| matches!(self.syntax_tree.kind(p), Kind::Member { .. }))
    }

    /// Prettier's `printMemberExpression`, after its object. The lookup is inlined in the cases
    /// Prettier always inlines; otherwise its `group(indent([softline, lookup]))` may break under
    /// conditions not ported, so the expression must fit.
    #[expect(
        clippy::too_many_arguments,
        reason = "the member's fields and what was printed before them"
    )]
    pub(super) fn member_tail(
        &mut self,
        identifier: NodeIdentifier,
        object: NodeIdentifier,
        property: NodeIdentifier,
        computed: bool,
        optional: bool,
        parent_is_member: bool,
        o: LayoutInstructionIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
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
            // `user!` is a `TSNonNullExpression` upstream, not an `Identifier`.
            || (matches!(self.syntax_tree.kind(object), Kind::Identifier(_))
                && !self.has_typescript(object)
                && !parent_is_member);
        let flat = self.cat(&[o, lookup]);
        Ok(if inline {
            flat
        } else {
            self.docs.flat_only(flat)
        })
    }

    /// Prettier's `printCallExpression` for `new`, whose callee is not a chain link.
    pub(super) fn call(
        &mut self,
        identifier: NodeIdentifier,
        callee: NodeIdentifier,
        arguments: &[NodeIdentifier],
        optional: bool,
        is_new: bool,
    ) -> R<LayoutInstructionIdentifier> {
        let head = self.call_head(identifier, callee, is_new)?;
        let c = self.expression(callee, Some(identifier), Slot::Callee)?;
        self.call_tail(identifier, callee, arguments, optional, is_new, head, c)
    }

    /// What Prettier's `printCallExpression` prints before the callee.
    pub(super) fn call_head(
        &mut self,
        identifier: NodeIdentifier,
        callee: NodeIdentifier,
        is_new: bool,
    ) -> R<CallHead> {
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
                let t = self.docs.text(&format!("<{text}>"));
                // A union that does not fit puts each member on its own line (not built).
                if text.contains('|') {
                    self.docs.flat_only_choice(t)
                } else {
                    t
                }
            }
            None => self.docs.nil(),
        };
        let new = if is_new {
            self.lit("new ")
        } else {
            self.docs.nil()
        };
        Ok(CallHead {
            type_arguments,
            new,
        })
    }

    /// Prettier's `printCallExpression`, after the callee. A member callee makes a member chain,
    /// which is not ported, so such a call must fit on its line.
    #[expect(
        clippy::too_many_arguments,
        reason = "the call's fields and what was printed before them"
    )]
    pub(super) fn call_tail(
        &mut self,
        identifier: NodeIdentifier,
        callee: NodeIdentifier,
        arguments: &[NodeIdentifier],
        optional: bool,
        is_new: bool,
        CallHead {
            type_arguments,
            new,
        }: CallHead,
        c: LayoutInstructionIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let q = if optional {
            self.lit("?.")
        } else {
            self.docs.nil()
        };
        let a = self.arguments(identifier, arguments)?;
        let a = self.cat(&[type_arguments, a]);
        let parts = [new, c, q, a];
        if !is_new && matches!(self.syntax_tree.kind(callee), Kind::Member { .. }) {
            // A short chain prints as `group(oneLine)`, whose groups after a forced break decide
            // afresh, so flat is right only while each line fits; a longer one chooses between
            // that and the expanded chain, which is not built.
            let one_line = self.member_chain_is_one_line(identifier, c)?;
            let flat = self.cat(&parts);
            return Ok(self.docs.flat_only_with(flat, true, !one_line));
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
        self.refuse_test_call(identifier, arguments)?;
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
        if self.react_hook_with_deps(arguments)
            || matches!(arguments, [only] if self.is_template_on_its_own_line(*only))
        {
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
        // With a forced break inside, Prettier hugs only the first or the last argument and
        // otherwise puts every argument on its own line, as below.
        let breaks = printed.iter().any(|&p| self.docs.will_break(p));
        let breaks_in = |f: &Self, range: &[LayoutInstructionIdentifier]| {
            range.iter().any(|&p| f.docs.will_break(p))
        };
        // Hugging the first or last argument while another one breaks gives every argument its
        // own line (`allArgsBrokenOut`).
        let mut hug = !breaks && self.may_hug_an_argument(arguments);
        let mut all_out = false;
        if breaks && self.may_hug_an_argument(arguments) {
            if self.groups_first(arguments)? {
                hug = !breaks_in(self, &printed[1..]);
                all_out = !hug;
            } else if self.groups_last(arguments)? {
                hug = !breaks_in(self, &printed[..printed.len() - 1]);
                all_out = !hug;
            }
        }
        if hug {
            let flat = inline(self, &printed);
            return Ok(self.docs.flat_only_choice(flat));
        }
        if all_out {
            // It opens with `line`, which a removed line leaves as a space.
            let line = self.docs.line();
            let line2 = self.docs.line();
            let parts = self.bracketed("(", line, items, trailing, line2, ")");
            return Ok(self.docs.group_broken(&parts));
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
        } else if breaks {
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
                Kind::Function { .. } | Kind::Arrow { .. }
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

    /// Prettier's `shouldGroupLast` when only the last argument forces a break.
    fn groups_last(&self, arguments: &[NodeIdentifier]) -> R<bool> {
        let (&last, rest) = arguments.split_last().expect("arguments");
        let kind = self.syntax_tree.kind(last);
        if let Some(&penultimate) = rest.last()
            && std::mem::discriminant(&self.syntax_tree.kind(penultimate))
                == std::mem::discriminant(&kind)
        {
            return Ok(false);
        }
        Ok(match kind {
            Kind::Object(p) => !p.is_empty(),
            Kind::Function { .. } => true,
            Kind::Arrow {
                expression_body, ..
            } => {
                if expression_body {
                    // `couldExpandArg` depends on the body's kind; not ported.
                    return Err(Unsupported::at(
                        "a last argument arrow with an expression body over several lines",
                        self.syntax_tree.source_location(last),
                    ));
                }
                !matches!(
                    rest.last().map(|&p| self.syntax_tree.kind(p)),
                    Some(Kind::Arrow { .. })
                )
            }
            Kind::Array(e) if rest.is_empty() => !e.is_empty(),
            // `isConciselyPrintedArray` and the arrow-then-array rule are not ported.
            Kind::Array(_) => {
                return Err(Unsupported::at(
                    "a last argument array over several lines",
                    self.syntax_tree.source_location(last),
                ));
            }
            _ => false,
        })
    }

    /// Prettier's `shouldGroupFirst`: `(function () {…}, short)`.
    fn groups_first(&self, arguments: &[NodeIdentifier]) -> R<bool> {
        let [first, second] = *arguments else {
            return Ok(false);
        };
        let groups = matches!(
            self.syntax_tree.kind(first),
            Kind::Function { .. }
                | Kind::Arrow {
                    expression_body: false,
                    ..
                }
        ) && !matches!(
            self.syntax_tree.kind(second),
            Kind::Function { .. } | Kind::Arrow { .. } | Kind::Conditional { .. }
        );
        if !groups {
            return Ok(false);
        }
        let span = self.span(second);
        if self.typescript_within(span) > 0 {
            return Err(Unsupported::at("TypeScript beside a hugged argument", span));
        }
        Ok(self.is_hopefully_short_call_argument(second)?
            && !self.could_expand_argument(second, false))
    }

    /// Prettier's `isTemplateOnItsOwnLine`: a template literal over several lines that does not
    /// start its own line.
    pub(super) fn is_template_on_its_own_line(&self, node: NodeIdentifier) -> bool {
        let Kind::Template { quasis, .. } = self.syntax_tree.kind(node) else {
            return false;
        };
        let multiline = quasis.iter().any(|&q| {
            let [start, end] = self.syntax_tree.raw_data(q);
            Span::new(start, end).text(self.source_text).contains('\n')
        });
        let before = &self.source_text[..self.span(node).start_offset as usize];
        multiline && !before.trim_end_matches([' ', '\t']).ends_with(['\n', '\r'])
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
        let saved = self.in_async;
        let printed = self.arrow_inner(identifier, parameters, body, is_async, expression_body);
        self.in_async = saved;
        printed
    }

    fn arrow_inner(
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
        self.refuse_object_return_type(identifier)?;
        // `await` in a parameter list is an error, async or not.
        self.in_async = Some(false);
        let ps = self.parameters(parameters)?;
        self.in_async = Some(is_async);
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
        ) || self.is_template_on_its_own_line(body);
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

mod chain;
mod hugging;
mod test_call;
