use super::{
    Formatter, Kind, LayoutInstructionIdentifier, NodeIdentifier, Op, PatternContext, R, Slot,
    TypeScriptKind, TypeScriptSyntax, Unsupported, flag, mixes_nullish, op_of, should_flatten,
};

/// Prettier's `printNumber`.
#[must_use]
pub(super) fn print_number(raw: &str) -> String {
    if raw.len() == 1 {
        return raw.to_owned();
    }
    let s = raw.to_ascii_lowercase();
    if s.ends_with('n') {
        return s;
    }
    // Prettier's regexes match `\d`, so a run broken by `_` is never trimmed.
    let b = s.as_bytes();
    let sign = usize::from(matches!(b.first(), Some(b'+' | b'-')));
    let run = sign
        + b[sign..]
            .iter()
            .take_while(|c| c.is_ascii_digit() || **c == b'.')
            .count();
    let mut out = s.clone();
    if run > sign && b.get(run) == Some(&b'e') {
        // `^([+-]?[\d.]+e)(?:\+|(-))?0*(?=\d)` → `$1$2`
        let mut at = run + 1;
        let minus = b.get(at) == Some(&b'-');
        if matches!(b.get(at), Some(b'+' | b'-')) {
            at += 1;
        }
        let zeros = b[at..].iter().take_while(|c| **c == b'0').count();
        // `0*` backs off one zero when no digit follows the zeros.
        let drop = if b.get(at + zeros).is_some_and(u8::is_ascii_digit) {
            Some(zeros)
        } else {
            zeros.checked_sub(1)
        };
        if let Some(drop) = drop {
            out = format!(
                "{}{}{}",
                &s[..=run],
                if minus { "-" } else { "" },
                &s[at + drop..]
            );
        }
    }
    // `^([+-]?[\d.]+)e[+-]?0+$` → `$1`
    if let Some((m, e)) = out.split_once('e') {
        let mb = m.as_bytes();
        let ms = usize::from(matches!(mb.first(), Some(b'+' | b'-')));
        let e = e.strip_prefix(['+', '-']).unwrap_or(e);
        if mb.len() > ms
            && mb[ms..].iter().all(|c| c.is_ascii_digit() || *c == b'.')
            && !e.is_empty()
            && e.bytes().all(|c| c == b'0')
        {
            out.truncate(m.len());
        }
    }
    // `^([+-])?\.` → `$10.`
    let lead = usize::from(matches!(out.as_bytes().first(), Some(b'+' | b'-')));
    if out.as_bytes().get(lead) == Some(&b'.') {
        out.insert(lead, '0');
    }
    // `(\.\d+?)0+(?=e|$)` → `$1`, at the leftmost `.` where it matches.
    let trim = out.match_indices('.').find_map(|(dot, _)| {
        let ob = out.as_bytes();
        let digits = ob[dot + 1..]
            .iter()
            .take_while(|c| c.is_ascii_digit())
            .count();
        let end = dot + 1 + digits;
        let kept = ob[dot + 1..end]
            .iter()
            .rposition(|c| *c != b'0')
            .map_or(1, |p| p + 1);
        (kept < digits && matches!(ob.get(end), None | Some(b'e'))).then_some(dot + 1 + kept..end)
    });
    if let Some(range) = trim {
        out.replace_range(range, "");
    }
    // `\.(?=e|$)` → ``
    let dot = out
        .match_indices('.')
        .map(|(dot, _)| dot)
        .find(|&dot| matches!(out.as_bytes().get(dot + 1), None | Some(b'e')));
    if let Some(dot) = dot {
        out.remove(dot);
    }
    out
}

impl Formatter<'_> {
    pub(super) fn expression(
        &mut self,
        identifier: NodeIdentifier,
        parent: Option<NodeIdentifier>,
        slot: Slot,
    ) -> R<LayoutInstructionIdentifier> {
        let leftmost = self.paren_leftmost == Some(identifier);
        if leftmost {
            self.paren_leftmost = None;
        }
        let saved = self.at;
        self.at = parent.map(|p| (p, slot));
        let document = self
            .expression_inner(identifier)
            .and_then(|d| self.typescript_expression_suffix(identifier, d));
        self.at = saved;
        let document = document?;
        if leftmost
            || self.syntax_tree.flags(identifier) & flag::GROUPED != 0
            || parent.is_some_and(|p| self.needs_parens(identifier, p, slot))
        {
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
        ) && !self
            .at
            .is_some_and(|(p, _)| matches!(self.syntax_tree.kind(p), Kind::Spread(_)));
        // `(a as T)!` needs the parentheses that the suffixes alone do not carry.
        let cast_then_non_null = entries.iter().enumerate().any(|(i, t)| {
            t.kind != TypeScriptKind::NonNull
                && entries[i + 1..]
                    .iter()
                    .any(|n| n.kind == TypeScriptKind::NonNull)
        });
        if !simple || (cast && !cast_ok) || cast_then_non_null {
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
            // Svelte parses a module, where `await` is a keyword; the tree read it as a name.
            Kind::Identifier(_) if self.syntax_tree.name(identifier) == "await" => {
                Err(Unsupported::at(
                    "`await` read as a name",
                    self.syntax_tree.source_location(identifier),
                ))
            }
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
            } => self.template(identifier, quasis, expressions),
            Kind::Array(items) => {
                let e = self.docs.nil();
                self.array(identifier, items, e)
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
                self.flat_unless_forced(identifier, flat)
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
                self.flat_unless_forced(identifier, flat)
            }
            Kind::Assign(op, l, r) => {
                let left = self.pattern(l, PatternContext::AssignLeft)?;
                let right = self.expression(r, Some(identifier), Slot::Right)?;
                let op = format!(" {}", op.as_str());
                let op = self.docs.text(&op);
                self.assignment(left, op, right, l, r, false)
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
                self.flat_unless_forced(identifier, flat)
            }
            Kind::Await(_) if self.in_async == Some(false) => Err(Unsupported::at(
                "`await` outside an async function",
                self.syntax_tree.source_location(identifier),
            )),
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
        let parent = op_of(self.syntax_tree, identifier);
        for child in [l, r] {
            let Some(c) = op_of(self.syntax_tree, child) else {
                continue;
            };
            let grouped = self.syntax_tree.flags(child) & flag::GROUPED != 0;
            // JavaScript rejects `a ?? b || c`; Svelte's parser does too.
            if parent.is_some_and(|p| mixes_nullish(p, c)) && !grouped {
                return Err(Unsupported::at(
                    "`??` mixed with `||` or `&&` without parentheses",
                    self.syntax_tree.source_location(identifier),
                ));
            }
        }
        // Prettier rebalances `a || (b || c)` into `a || b || c`.
        if let (Some(Op::Log(p)), Some(Op::Log(c))) = (parent, op_of(self.syntax_tree, r))
            && p == c
        {
            return Err(Unsupported::at(
                "a logical expression nested on the right of the same operator",
                self.syntax_tree.source_location(identifier),
            ));
        }
        let flatten = match (parent, op_of(self.syntax_tree, l)) {
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

    /// `flat` as the one layout ported; Prettier breaks its lines around a forced break inside.
    fn flat_unless_forced(
        &mut self,
        identifier: NodeIdentifier,
        flat: LayoutInstructionIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        if self.docs.will_break(flat) {
            return Err(Unsupported::at(
                "a line break inside an operator or a conditional",
                self.syntax_tree.source_location(identifier),
            ));
        }
        Ok(self.docs.flat_only(flat))
    }

    pub(super) fn has_typescript(&self, identifier: NodeIdentifier) -> bool {
        let i = self.typescript.partition_point(|t| t.node < identifier);
        self.typescript.get(i).is_some_and(|t| t.node == identifier)
    }
}
