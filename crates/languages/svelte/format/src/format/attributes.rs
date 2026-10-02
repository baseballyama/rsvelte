use super::{
    Attribute, AttributeKind, AttributeValue, Cow, ElementKind, LayoutInstructionIdentifier, Part,
    Printer, R, normalize_class,
};

impl Printer<'_, '_> {
    pub(super) fn attribute(
        &mut self,
        a: &Attribute,
        element: ElementKind,
    ) -> R<LayoutInstructionIdentifier> {
        let (comp, source_text) = (self.c, self.source_text);
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
        if let (Some(property), [Part::Expression { expression, .. }]) = (a.directive_name(), parts)
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
