use crate::lower::client::{
    AssignmentOperator, Attribute, AttributeValue, ClientCompilationContext,
    CompilerNodeIdentifier, Frag, Lists, NodeIdentifier, R, SourceLocation, event_attribute,
    normalize_attribute, unsupported,
};

impl ClientCompilationContext<'_> {
    /// The attribute loop of upstream `RegularElement` (no spread).
    pub(in crate::lower::client) fn element_attributes(
        &mut self,
        identifier: CompilerNodeIdentifier,
        tag: &str,
        attributes: &[Attribute],
        node: &str,
        frag: &mut Frag,
        l: &mut Lists,
    ) -> R<()> {
        let class_directives: Vec<&Attribute> = attributes
            .iter()
            .filter(|a| matches!(a.value, AttributeValue::Class(_)))
            .collect();
        for a in attributes {
            if let AttributeValue::Bind(_) | AttributeValue::Attach(_) | AttributeValue::Class(_) =
                a.value
            {
                continue;
            }
            let raw_name = a.name.text(self.source_text);
            if let Some(handler) = event_attribute(self.source_text, a) {
                self.event(raw_name, handler, node, l);
                continue;
            }
            let attribute_name = normalize_attribute(raw_name);
            // `select_value` sets these once the options exist.
            if (matches!(tag, "option" | "select") && raw_name == "value")
                || (tag == "select" && attribute_name == "defaultValue")
            {
                continue;
            }
            let literal = match &a.value {
                AttributeValue::Boolean => Some(None),
                AttributeValue::Static(v) => Some(Some(v.to_string())),
                _ => None,
            };
            if !crate::lower::cannot_be_set_statically(raw_name)
                && (attribute_name != "class" || class_directives.is_empty())
                && let Some(value) = literal
            {
                self.static_attribute(frag, identifier, raw_name, &attribute_name, value);
            } else if attribute_name == "class" {
                self.set_class(identifier, node, Some(a), &class_directives, frag, l);
            } else if attribute_name == "autofocus" || attribute_name == "style" {
                return unsupported(&format!("a dynamic `{attribute_name}` attribute"), a.span);
            } else {
                let (value, has_state) = self.attribute_value(a, frag);
                let update = self.attribute_update(node, &attribute_name, value);
                let s = self.statement(update);
                if has_state {
                    l.update.push(s);
                } else {
                    l.initializer.push(s);
                }
            }
        }
        // Upstream's analysis appends `class=""` to such an element.
        let has_class = attributes.iter().any(|a| {
            !matches!(a.value, AttributeValue::Class(_))
                && a.name.text(self.source_text).eq_ignore_ascii_case("class")
        });
        if !has_class && !class_directives.is_empty() {
            self.set_class(identifier, node, None, &class_directives, frag, l);
        } else if !has_class && self.an.scoped[identifier] {
            self.static_attribute(frag, identifier, "class", "class", Some(String::new()));
        }
        Ok(())
    }

    fn static_attribute(
        &self,
        frag: &mut Frag,
        identifier: CompilerNodeIdentifier,
        raw_name: &str,
        attribute_name: &str,
        value: Option<String>,
    ) {
        let mut value = value;
        if attribute_name == "class"
            && self.an.scoped[identifier]
            && let Some(hash) = &self.identity.stylesheet_hash
        {
            value = Some(match value.as_deref() {
                None | Some("") => hash.clone(),
                Some(v) => format!("{v} {hash}"),
            });
        }
        if attribute_name != "class"
            || value.as_deref().is_some_and(|v| !v.is_empty())
            || value.is_none()
        {
            frag.tpl.set_prop(raw_name, Some(value.unwrap_or_default()));
        }
    }

    /// Upstream `build_element_attribute_update`.
    fn attribute_update(
        &mut self,
        node: &str,
        name: &str,
        value: NodeIdentifier,
    ) -> NodeIdentifier {
        let x = self.out.identifier(node);
        match name {
            "muted" => {
                let target = self.out.dot(x, "muted");
                self.out.assign(
                    AssignmentOperator::Assign,
                    target,
                    value,
                    SourceLocation::SYNTHETIC,
                )
            }
            "value" => self.call("set_value", vec![Some(x), Some(value)]),
            "checked" => self.call("set_checked", vec![Some(x), Some(value)]),
            "selected" => self.call("set_selected", vec![Some(x), Some(value)]),
            _ if crate::lower::is_dom_property(name) => {
                let target = self.out.dot(x, name);
                self.out.assign(
                    AssignmentOperator::Assign,
                    target,
                    value,
                    SourceLocation::SYNTHETIC,
                )
            }
            _ => {
                let method = if name.starts_with("xlink") {
                    "set_xlink_attribute"
                } else {
                    "set_attribute"
                };
                let n = self.out.write_string(name);
                self.call(method, vec![Some(x), Some(n), Some(value)])
            }
        }
    }
}
