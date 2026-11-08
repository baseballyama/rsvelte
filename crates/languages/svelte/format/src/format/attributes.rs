use super::{
    Attribute, AttributeKind, AttributeValue, Cow, ElementKind, LayoutInstructionIdentifier, Part,
    Printer, R, Unsupported,
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

impl Printer<'_, '_> {
    pub(super) fn attribute(
        &mut self,
        a: &Attribute,
        element: ElementKind,
    ) -> R<LayoutInstructionIdentifier> {
        let (comp, source_text) = (self.c, self.source_text);
        if !matches!(
            a.kind,
            AttributeKind::Attribute
                | AttributeKind::Bind
                | AttributeKind::Attach
                | AttributeKind::Class
                | AttributeKind::Spread
        ) {
            return Err(Unsupported::at("directives", a.span));
        }
        let name = a.name.text(source_text);
        let parts = match a.value {
            AttributeValue::True => return Ok(self.d().text(name)),
            AttributeValue::Parts(r) => r.get(&comp.parts),
        };
        if matches!(a.kind, AttributeKind::Attach | AttributeKind::Spread) {
            let [Part::Expression { expression, .. }] = parts else {
                unreachable!("an attachment or a spread is one expression")
            };
            let open = self.lit(if a.kind == AttributeKind::Attach {
                "{@attach "
            } else {
                "{..."
            });
            let e = self.expression(*expression, false, false)?;
            let close = self.lit("}");
            return Ok(self.cat(&[open, e, close]));
        }
        if let (Some(property), [Part::Expression { expression, .. }]) =
            (a.directive_name(&comp.modifiers), parts)
            && matches!(
                comp.javascript.kind(*expression),
                rsvelte_typescript::Kind::Identifier(_)
            )
            && comp.javascript.name(*expression) == property.text(source_text)
        {
            return Ok(self.d().text(name));
        }
        let lone = matches!(parts, [Part::Expression { .. }]);
        if let [Part::Expression { expression, .. }] = parts
            && matches!(
                comp.javascript.kind(*expression),
                rsvelte_typescript::Kind::Identifier(_)
            )
            && comp.javascript.name(*expression) == name
        {
            return Ok(self.d().text_parts(&["{", name, "}"]));
        }
        let mut value = Vec::new();
        let count = parts.len();
        for (i, p) in parts.iter().enumerate() {
            match *p {
                Part::Text(span) => {
                    let raw = span.text(source_text);
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
