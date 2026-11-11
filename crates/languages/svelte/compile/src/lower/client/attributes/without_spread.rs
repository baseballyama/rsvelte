use crate::lower::builder::Runtime;
use oxc_ast::ast::Expression;

use crate::lower::client::{
    Attribute, AttributeValue, ClientCompilationContext, CompilerNodeIdentifier, Frag, Lists, R,
    event_attribute, normalize_attribute, unsupported,
};

impl<'o> ClientCompilationContext<'_, 'o> {
    /// The attribute loop of upstream `RegularElement` (no spread).
    pub(in crate::lower::client) fn element_attributes(
        &mut self,
        identifier: CompilerNodeIdentifier,
        tag: &str,
        attributes: &[Attribute],
        node: &str,
        frag: &mut Frag<'o>,
        l: &mut Lists<'o>,
    ) -> R<()> {
        let class_directives: Vec<&Attribute> = attributes
            .iter()
            .filter(|a| matches!(a.value, AttributeValue::Class(_)))
            .collect();
        for a in attributes {
            if let AttributeValue::Bind(_)
            | AttributeValue::Attach(_)
            | AttributeValue::On { .. }
            | AttributeValue::Class(_) = a.value
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
                self.set_class(
                    identifier,
                    node,
                    Some(a),
                    &class_directives,
                    &mut frag.memo,
                    l,
                );
            } else if attribute_name == "autofocus" || attribute_name == "style" {
                return unsupported(&format!("a dynamic `{attribute_name}` attribute"), a.span);
            } else {
                let (value, has_state) = self.attribute_value(a, &mut frag.memo, false);
                let s = self
                    .b
                    .stmt(self.attribute_update(node, &attribute_name, value));
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
            self.set_class(identifier, node, None, &class_directives, &mut frag.memo, l);
        } else if !has_class && self.an.scoped[identifier] {
            self.static_attribute(frag, identifier, "class", "class", Some(String::new()));
        }
        Ok(())
    }

    fn static_attribute(
        &self,
        frag: &mut Frag<'o>,
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
    fn attribute_update(&self, node: &str, name: &str, value: Expression<'o>) -> Expression<'o> {
        let b = self.b;
        let x = b.id(node);
        match name {
            "muted" => b.assign_member(b.member(x, "muted"), value),
            "value" => b.runtime("set_value", [x, value]),
            "checked" => b.runtime("set_checked", [x, value]),
            "selected" => b.runtime("set_selected", [x, value]),
            _ if crate::lower::is_dom_property(name) => b.assign_member(b.member(x, name), value),
            _ => {
                let method = if name.starts_with("xlink") {
                    "set_xlink_attribute"
                } else {
                    "set_attribute"
                };
                b.runtime(method, [x, b.string(name), value])
            }
        }
    }
}
