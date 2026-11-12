use super::expressions::Comments;
use super::{
    Attribute, AttributeKind, AttributeValue, Cow, ElementKind, LayoutInstructionIdentifier, Part,
    Printer, R, Unsupported, only_ws,
};

/// The plugin's whitespace normalization of a `class` attribute's text on a regular element.
fn normalize_class(raw: &str, is_last_part: bool) -> String {
    // `([^ \t\n])(([ \t]+$)|([ \t]+(\r?\n))|[ \t]+)` → collapse inner runs, drop them before a
    // line break, keep them at the very end.
    let b = raw.as_bytes();
    let mut out = String::with_capacity(raw.len());
    let mut i = 0;
    while i < b.len() {
        let c = b[i];
        let run_start = i + 1;
        if !matches!(c, b' ' | b'\t' | b'\n')
            && run_start < b.len()
            && matches!(b[run_start], b' ' | b'\t')
        {
            let mut j = run_start;
            while j < b.len() && matches!(b[j], b' ' | b'\t') {
                j += 1;
            }
            out.push_str(&raw[i..run_start]);
            if j == b.len() {
                out.push_str(&raw[run_start..j]);
            } else if b[j] == b'\n' {
                out.push('\n');
                j += 1;
            } else if b[j] == b'\r' && b.get(j + 1) == Some(&b'\n') {
                out.push_str("\r\n");
                j += 2;
            } else {
                out.push(' ');
            }
            i = j;
            continue;
        }
        let ch = raw[i..].chars().next().expect("in bounds");
        out.push(ch);
        i += ch.len_utf8();
    }
    // `([^ \t\n])[ \t]+$` → `$1` at the end of the value, `$1 ` before an expression.
    let trimmed = out.trim_end_matches([' ', '\t']);
    if trimmed.len() < out.len() && !trimmed.is_empty() && !trimmed.ends_with('\n') {
        let mut s = trimmed.to_owned();
        if !is_last_part {
            s.push(' ');
        }
        return s;
    }
    out
}

/// The plugin prints `|modifiers` only on `on:`, `transition:`, `in:`, `out:` and `style:`
/// and drops them elsewhere, which would change the component.
fn refuse_modifiers(a: &Attribute) -> R<()> {
    if a.modifiers.len > 0 {
        return Err(Unsupported::at("modifiers on this directive", a.name));
    }
    Ok(())
}

impl Printer<'_, '_, '_> {
    /// The plugin's `print` for an attribute, a spread, an attachment or a directive.
    pub(super) fn attribute(
        &mut self,
        a: &Attribute,
        element: ElementKind,
    ) -> R<LayoutInstructionIdentifier> {
        let (comp, source_text) = (self.c, self.source_text);
        // As written: the directive's prefix, its name and, where kept, its `|modifiers`.
        let name = a.name.text(source_text);
        let parts = match a.value {
            AttributeValue::True => &[][..],
            AttributeValue::Parts(r) => r.get(&comp.parts),
        };
        let lone = match parts {
            [Part::Expression { expression, .. }] => Some(*expression),
            _ => None,
        };
        let shorthand = self.options.svelte_allow_shorthand;
        let directive = a
            .directive_name(&comp.modifiers)
            .map(|n| n.text(source_text));
        // `value={value}`: an identifier named like the attribute or directive, without a type.
        let named_like = |n: &str| {
            lone.is_some_and(|e| {
                matches!(comp.javascript.get_expression(e),
                    oxc_ast::ast::Expression::Identifier(identifier) if identifier.name == n)
            })
        };
        match a.kind {
            AttributeKind::Attach | AttributeKind::Spread => {
                let expression = lone.expect("an attachment or a spread is one expression");
                let open = self.lit(if a.kind == AttributeKind::Attach {
                    "{@attach "
                } else {
                    "{..."
                });
                let e = self.expression(expression, false, false)?;
                let close = self.lit("}");
                Ok(self.cat(&[open, e, close]))
            }
            AttributeKind::Attribute => {
                if named_like(name) {
                    return Ok(self.shorthand_or_expanded(shorthand, "{", name, name));
                }
                if parts.is_empty() {
                    return Ok(self.d().text(name));
                }
                self.named_value(name, parts, element, false)
            }
            AttributeKind::Style => {
                let property = directive.expect("a style directive has a name");
                if parts.is_empty() || named_like(property) {
                    return Ok(if shorthand {
                        self.d().text(name)
                    } else {
                        self.d().text_parts(&[name, "={", property, "}"])
                    });
                }
                self.named_value(name, parts, element, true)
            }
            AttributeKind::Bind | AttributeKind::Class => {
                refuse_modifiers(a)?;
                let property = directive.expect("a directive has a name");
                // `class:foo-bar` alone: Svelte makes an identifier of the whole name.
                let written_short = lone.is_some_and(|e| {
                    let s = self.javascript_span(e);
                    a.name.start_offset <= s.start_offset && s.end_offset <= a.name.end_offset
                });
                if shorthand && (named_like(property) || written_short) {
                    return Ok(self.d().text(name));
                }
                let expression = lone.expect("a binding or class directive has one expression");
                let bind = a.kind == AttributeKind::Bind;
                let e =
                    self.expression_with(expression, false, false, bind, Comments::AsThePlugin)?;
                // `surroundWithSoftline` belongs to `embed`, which "off" skips.
                let embedded = self.options.embedded_language_formatting
                    != crate::options::EmbeddedLanguageFormatting::Off;
                let e = if bind && embedded {
                    self.surround_with_softline(e)
                } else {
                    e
                };
                let open = self.d().text_parts(&[name, "={"]);
                let close = self.lit("}");
                Ok(self.cat(&[open, e, close]))
            }
            AttributeKind::Let => {
                refuse_modifiers(a)?;
                let property = directive.expect("a let directive has a name");
                if parts.is_empty() || named_like(property) {
                    return Ok(self.d().text(name));
                }
                self.directive_value(a, name, lone)
            }
            AttributeKind::Use | AttributeKind::Animate => {
                refuse_modifiers(a)?;
                self.directive_value(a, name, lone)
            }
            AttributeKind::On | AttributeKind::Transition { .. } => {
                self.directive_value(a, name, lone)
            }
        }
    }

    /// `{name}` or, without `svelteAllowShorthand`, `name={name}`.
    fn shorthand_or_expanded(
        &mut self,
        shorthand: bool,
        open: &'static str,
        name: &str,
        value: &str,
    ) -> LayoutInstructionIdentifier {
        if shorthand {
            self.d().text_parts(&[open, value, "}"])
        } else {
            self.d().text_parts(&[name, "={", value, "}"])
        }
    }

    /// `name` and, with a value, `={expression}`.
    fn directive_value(
        &mut self,
        a: &Attribute,
        name: &str,
        lone: Option<rsvelte_typescript_tree::ExpressionIdentifier>,
    ) -> R<LayoutInstructionIdentifier> {
        let n = self.d().text(name);
        if matches!(a.value, AttributeValue::True) {
            return Ok(n);
        }
        let Some(expression) = lone else {
            return Err(Unsupported::at(
                "a directive whose value is not one expression",
                a.span,
            ));
        };
        let e = self.expression(expression, false, false)?;
        let open = self.lit("={");
        let close = self.lit("}");
        Ok(self.cat(&[n, open, e, close]))
    }

    /// `printJS`'s `surroundWithSoftline`: a long binding breaks inside its braces.
    fn surround_with_softline(
        &mut self,
        e: LayoutInstructionIdentifier,
    ) -> LayoutInstructionIdentifier {
        let soft = self.d().softline();
        let inner = self.group(&[e]);
        let soft2 = self.d().softline();
        let end = self.d().dedent(soft2);
        let indented = self.cat(&[soft, inner, end]);
        let indented = self.d().indent(indented);
        self.group(&[indented])
    }

    /// `name=value`: a lone expression unquoted, anything else in double quotes. The text of an
    /// attribute prints as written (the plugin counts it as pre-formatted); a style directive's
    /// text is not, so its words are filled like the template's.
    fn named_value(
        &mut self,
        name: &str,
        parts: &[Part],
        element: ElementKind,
        fill_text: bool,
    ) -> R<LayoutInstructionIdentifier> {
        let source_text = self.source_text;
        let lone = matches!(parts, [Part::Expression { .. }]);
        let mut value = Vec::new();
        let count = parts.len();
        for (i, p) in parts.iter().enumerate() {
            match *p {
                Part::Text(span) => {
                    let raw = span.text(source_text);
                    // Inside `<pre>` the plugin prints a style directive's text as written.
                    if fill_text && self.in_pre {
                        if raw.contains('\n') {
                            return Err(Unsupported::at(
                                "a style directive's text over several lines in <pre>",
                                span,
                            ));
                        }
                        value.push(self.d().text(raw));
                        continue;
                    }
                    if fill_text {
                        let d = if only_ws(raw) {
                            self.whitespace(raw)
                        } else {
                            let mut docs = self.take_buffer();
                            self.split_text(raw, &mut docs);
                            let d = self.d().fill(&docs);
                            self.give_buffer(docs);
                            d
                        };
                        value.push(d);
                        continue;
                    }
                    let raw = if name == "class" && element == ElementKind::Regular {
                        Cow::Owned(normalize_class(raw, i + 1 == count))
                    } else {
                        Cow::Borrowed(raw)
                    };
                    for (j, line) in raw.split('\n').enumerate() {
                        if j > 0 {
                            value.push(self.d().literalline());
                        }
                        value.push(self.d().text(line.strip_suffix('\r').unwrap_or(line)));
                    }
                }
                Part::Expression { expression, .. } => {
                    let e = self.expression(expression, false, !lone)?;
                    let o = self.lit("{");
                    let c = self.lit("}");
                    value.push(self.cat(&[o, e, c]));
                }
            }
        }
        let n = self.d().text(name);
        let eq = self.lit("=");
        let v = self.cat(&value);
        Ok(if lone {
            self.cat(&[n, eq, v])
        } else {
            let q = self.lit("\"");
            let q2 = self.lit("\"");
            self.cat(&[n, eq, q, v, q2])
        })
    }
}
