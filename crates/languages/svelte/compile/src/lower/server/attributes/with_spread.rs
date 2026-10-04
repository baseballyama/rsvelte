use crate::lower::server::{
    Attribute, AttributeValue, CompilerNodeIdentifier, ELEMENT_IS_INPUT, NodeIdentifier, Piece, R,
    ServerCompilationContext, SourceLocation, capture_event, check_binding, event_attribute,
    init_property, is_directive, is_load_error_element, push_captured_events, runtime_call,
};

const ELEMENT_IS_NAMESPACED: u32 = 1;
const ELEMENT_PRESERVE_ATTRIBUTE_CASE: u32 = 1 << 1;

impl<'a> ServerCompilationContext<'a> {
    /// Upstream `build_element_attributes`' spread path: `build_element_spread_attributes` and
    /// `prepare_element_spread`.
    pub(super) fn spread_attributes(
        &mut self,
        identifier: CompilerNodeIdentifier,
        tag: &str,
        list: &'a [Attribute],
        template: &mut Vec<Piece>,
    ) -> R<()> {
        let (arguments, events) = self.spread_args(identifier, tag, list, false)?;
        let call = runtime_call(&mut self.out, "attributes", arguments);
        template.push(Piece::Expression(call));
        push_captured_events(template, &events);
        Ok(())
    }

    /// Upstream `prepare_element_spread`'s arguments. `all` is `prepare_element_spread_object`,
    /// which keeps every attribute; otherwise the spread path of `build_element_attributes`
    /// filters events (returned for capture) and the values the runtime sets elsewhere.
    pub(in crate::lower::server) fn spread_args(
        &mut self,
        identifier: CompilerNodeIdentifier,
        tag: &str,
        list: &'a [Attribute],
        all: bool,
    ) -> R<(Vec<Option<NodeIdentifier>>, Vec<&'a str>)> {
        let mut events = Vec::new();
        let mut props = Vec::with_capacity(list.len());
        let mut class_directives = Vec::new();
        for a in list {
            let raw_name = a.name.text(self.source_text);
            match a.value {
                AttributeValue::Bind(_) if tag == "svelte:element" && raw_name == "this" => {
                    continue;
                }
                AttributeValue::Bind(_) => {
                    let e =
                        check_binding(self.javascript, self.res, self.source_text, tag, list, a)?;
                    let value = self.expression(e);
                    let name = raw_name.to_ascii_lowercase();
                    props.push(init_property(&mut self.out, &name, value));
                    continue;
                }
                AttributeValue::Attach(_) | AttributeValue::On { .. } => continue,
                AttributeValue::Class(e) => {
                    class_directives.push((raw_name, e));
                    continue;
                }
                AttributeValue::Spread(e) => {
                    let v = self.expression(e);
                    props.push(self.out.spread(v, SourceLocation::SYNTHETIC));
                    if is_load_error_element(tag) {
                        capture_event(&mut events, tag, "onload");
                        capture_event(&mut events, tag, "onerror");
                    }
                    continue;
                }
                _ if all => {}
                _ if raw_name == "value" && tag == "select" => continue,
                _ if event_attribute(self.source_text, a).is_some() => {
                    capture_event(&mut events, tag, raw_name);
                    continue;
                }
                _ if tag != "input" && matches!(raw_name, "defaultValue" | "defaultChecked") => {
                    continue;
                }
                _ => {}
            }
            let mut name = if self.plan.namespace(identifier) == crate::render_plan::Namespace::Html
            {
                raw_name.to_ascii_lowercase()
            } else {
                raw_name.to_owned()
            };
            if tag == "select" && name == "defaultvalue" {
                "defaultValue".clone_into(&mut name);
            }
            let trim = matches!(name.as_str(), "class" | "style");
            let value = self.attribute_value(a, trim, raw_name == "class");
            props.push(init_property(&mut self.out, &name, value));
        }
        // Upstream's analysis appends `class=""` to such an element.
        let has_class = list.iter().any(|a| {
            !is_directive(&a.value) && a.name.text(self.source_text).eq_ignore_ascii_case("class")
        });
        let has_spread = list
            .iter()
            .any(|a| matches!(a.value, AttributeValue::Spread(_)));
        if !has_spread && !has_class && (self.an.scoped[identifier] || !class_directives.is_empty())
        {
            let empty = self.out.write_string("");
            props.push(init_property(&mut self.out, "class", empty));
        }
        let object = self.out.object(&props, SourceLocation::SYNTHETIC);
        let classes = (!class_directives.is_empty()).then(|| {
            let props: Vec<NodeIdentifier> = class_directives
                .iter()
                .map(|&(name, e)| {
                    let v = self.expression(e);
                    init_property(&mut self.out, name, v)
                })
                .collect();
            self.out.object(&props, SourceLocation::SYNTHETIC)
        });
        let hash = if self.an.scoped[identifier] {
            self.identity.stylesheet_hash.clone()
        } else {
            None
        };
        let hash = hash.map(|h| self.out.write_string(&h));
        let flags = if self.plan.namespace(identifier) != crate::render_plan::Namespace::Html {
            ELEMENT_IS_NAMESPACED | ELEMENT_PRESERVE_ATTRIBUTE_CASE
        } else if tag == "input" {
            ELEMENT_IS_INPUT
        } else {
            0
        };
        let flags = (flags != 0).then(|| {
            self.out
                .write_number(f64::from(flags), SourceLocation::SYNTHETIC)
        });
        Ok((vec![Some(object), hash, classes, None, flags], events))
    }
}
