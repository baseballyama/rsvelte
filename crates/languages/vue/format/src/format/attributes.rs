use super::{
    Attribute, AttributeKind, Attributes, DirectiveExpression, DirectiveName, JavaScriptOptions,
    Kind, Kind2, LayoutInstructionIdentifier, NodeIdentifier, Printer, R, Span, SyntaxTree,
    Unsupported,
};

impl Printer<'_, '_> {
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
                let value = match (&d.exp, d.name) {
                    (DirectiveExpression::For(f), _) => self.v_for(&f.parameters, f.source)?,
                    (DirectiveExpression::Expression(e), DirectiveName::Bind) => {
                        self.attribute_expression(*e, true)?
                    }
                    (DirectiveExpression::Expression(e), _) => {
                        self.attribute_expression(*e, false)?
                    }
                    (DirectiveExpression::None, _) => return Ok(self.d().text(name)),
                };
                let open = self.d().text(&format!("{name}=\""));
                let g = self.d().group(&[value]);
                let close = self.lit("\"");
                Ok(self.cat(&[open, g, close]))
            }
        }
    }

    pub(super) fn expression(
        &mut self,
        e: NodeIdentifier,
        markup_attribute: bool,
    ) -> R<LayoutInstructionIdentifier> {
        self.javascript.set_options(JavaScriptOptions {
            markup_attribute,
            ..JavaScriptOptions::default()
        });
        let d = self.javascript.format_expression(e);
        self.javascript.set_options(JavaScriptOptions::default());
        d
    }

    /// `formatAttributeValue` with `shouldHugJavaScriptExpression`; `vue` for `__vue_expression`
    /// (`v-bind`), which also hugs string and template literals.
    pub(super) fn attribute_expression(
        &mut self,
        e: NodeIdentifier,
        vue: bool,
    ) -> R<LayoutInstructionIdentifier> {
        let document = self.expression(e, true)?;
        let hug = match self.c.javascript.kind(e) {
            Kind::Object(_) | Kind::Array(_) => true,
            Kind::String | Kind::Template { .. } => vue,
            _ => false,
        };
        if hug {
            return Ok(self.d().group(&[document]));
        }
        let soft = self.d().softline();
        let inner = self.cat(&[soft, document]);
        let indentation = self.d().indent(inner);
        let soft = self.d().softline();
        Ok(self.cat(&[indentation, soft]))
    }

    /// `printVueVForDirective`.
    pub(super) fn v_for(
        &mut self,
        parameters: &[NodeIdentifier],
        source: NodeIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let syntax_tree: &SyntaxTree = &self.c.javascript;
        if parameters
            .iter()
            .any(|&p| !matches!(syntax_tree.kind(p), Kind::Identifier(_)))
        {
            return Err(Unsupported::nowhere("a destructuring v-for alias"));
        }
        let mut printed = Vec::new();
        for &p in parameters {
            printed.push(self.javascript.parameter(p)?);
        }
        let left = if let [one] = printed[..] {
            one
        } else {
            let comma = self.lit(",");
            let l = self.d().line();
            let sep = self.cat(&[comma, l]);
            let joined = self.d().join(sep, &printed);
            let g = self.d().group(&joined);
            let soft = self.d().softline();
            let inner = self.cat(&[soft, g]);
            let indentation = self.d().indent(inner);
            let open = self.lit("(");
            let soft = self.d().softline();
            let close = self.lit(")");
            self.cat(&[open, indentation, soft, close])
        };
        let left = self.d().group(&[left]);
        let left = self.d().group(&[left]);
        let source_text_start_offset = (syntax_tree
            .source_location(source)
            .span()
            .expect("a parsed source")
            .start_offset) as usize;
        let attribute_start_offset = (syntax_tree
            .source_location(parameters[0])
            .span()
            .expect("a parsed alias")
            .start_offset) as usize;
        let between = &self.source_text[attribute_start_offset..source_text_start_offset];
        let op = if between.trim_end().ends_with("of") {
            "of"
        } else {
            "in"
        };
        let right = self.expression(source, true)?;
        let right = self.d().group(&[right]);
        let sp = self.lit(" ");
        let op = self.lit(op);
        let sp2 = self.lit(" ");
        Ok(self.cat(&[left, sp, op, sp2, right]))
    }
}
