use oxc_span::GetSpan;

use super::{
    Attribute, AttributeKind, Attributes, DirectiveExpression, Kind2, LayoutInstructionIdentifier,
    Printer, R, Span, Unsupported,
};

impl Printer<'_, '_, '_> {
    /// `printAttributes`.
    pub(super) fn attributes(&mut self, i: usize) -> R<LayoutInstructionIdentifier> {
        let Kind2::Element { attributes, .. } = self.n(i).kind else {
            unreachable!("an element")
        };
        let printed = match attributes {
            Attributes::Template(list) => list
                .iter()
                .map(|a| self.attribute(a))
                .collect::<R<Vec<_>>>()?,
            Attributes::Block(list) => list
                .iter()
                .map(|&(name, value)| self.plain_attribute(name.text(self.source_text), value))
                .collect::<R<Vec<_>>>()?,
        };
        let self_closing = self.n(i).self_closing;
        if printed.is_empty() {
            return Ok(if self_closing {
                self.lit(" ")
            } else {
                self.d().nil()
            });
        }
        let sep = self.d().line();
        let joined = self.d().join(sep, &printed);
        let l = self.d().line();
        let mut inner = vec![l];
        inner.extend(joined);
        let inner = self.cat(&inner);
        let indented = self.d().indent(inner);
        let parent = self.n(i).parent;
        let hug_end = self
            .first(i)
            .is_some_and(|f| self.borrows_parent_open_end(f))
            || (self_closing && self.borrows_last_child_close_end(parent));
        let end = match (hug_end, self_closing) {
            (true, true) => self.lit(" "),
            (true, false) => self.d().nil(),
            (false, true) => self.d().line(),
            (false, false) => self.d().softline(),
        };
        Ok(self.cat(&[indented, end]))
    }

    /// The generic `attribute` print: the value with its preferred quote.
    pub(super) fn plain_attribute(
        &mut self,
        name: &str,
        value: Option<Span>,
    ) -> R<LayoutInstructionIdentifier> {
        let Some(v) = value else {
            return Ok(self.d().text(name));
        };
        let raw = v.text(self.source_text);
        if raw.contains(['\n', '\r']) {
            return Err(Unsupported::at("a multi-line attribute value", v));
        }
        let value = raw.replace("&apos;", "'").replace("&quot;", "\"");
        let quote = if value.matches('"').count() > value.matches('\'').count() {
            '\''
        } else {
            '"'
        };
        let escaped = if quote == '"' {
            value.replace('"', "&quot;")
        } else {
            value.replace('\'', "&apos;")
        };
        Ok(self.d().text(&format!("{name}={quote}{escaped}{quote}")))
    }

    /// A template attribute: prettier's embedded attribute printers, then the generic one.
    pub(super) fn attribute(&mut self, a: &Attribute) -> R<LayoutInstructionIdentifier> {
        let name = a.name.text(self.source_text);
        let Some(v) = a.value else {
            return Ok(self.d().text(name));
        };
        let raw = v.text(self.source_text);
        match &a.kind {
            AttributeKind::Static => {
                let lower = name.to_ascii_lowercase();
                if lower.starts_with("on")
                    || matches!(lower.as_str(), "style" | "srcset" | "sizes" | "allow")
                {
                    return Err(Unsupported::at(
                        "an attribute prettier formats as code",
                        a.span,
                    ));
                }
                if name == "class" && !raw.contains("{{") {
                    let value = raw.replace("&apos;", "'").replace("&quot;", "\"");
                    let collapsed: Vec<&str> = value.split_ascii_whitespace().collect();
                    let value = collapsed.join(" ").replace('"', "&quot;");
                    return Ok(self.d().text(&format!("{name}=\"{value}\"")));
                }
                self.plain_attribute(name, a.value)
            }
            AttributeKind::Directive(d) => {
                if raw.contains(['&', '"']) {
                    return Err(Unsupported::at("an entity or quote in a directive", v));
                }
                let value = match &d.exp {
                    DirectiveExpression::For(f) => {
                        let source = self.c.javascript.get_expression(f.source).span();
                        self.v_for(v, f.parameters, Span::new(source.start, source.end))?
                    }
                    DirectiveExpression::Expression(_) => self.directive_value(d.name, v)?,
                    DirectiveExpression::None => return Ok(self.d().text(name)),
                };
                let open = self.d().text(&format!("{name}=\""));
                let g = self.d().group(&[value]);
                let close = self.lit("\"");
                Ok(self.cat(&[open, g, close]))
            }
        }
    }
}
