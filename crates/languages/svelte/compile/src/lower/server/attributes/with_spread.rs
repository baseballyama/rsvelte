use crate::lower::builder::Runtime;
use oxc_ast::ast::{Expression, ObjectPropertyKind};

use super::escaped_text;
use crate::lower::server::{
    Attribute, AttributeValue, CompilerNodeIdentifier, Piece, ServerCompilationContext,
    capture_event, capture_load_events, event_attribute, is_behaviour, is_directive,
    push_captured_events,
};

const ELEMENT_IS_INPUT: u32 = 1 << 2;

const ELEMENT_IS_NAMESPACED: u32 = 1;
const ELEMENT_PRESERVE_ATTRIBUTE_CASE: u32 = 1 << 1;

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `build_element_attributes`' spread path: `build_element_spread_attributes` and
    /// `prepare_element_spread`.
    pub(super) fn spread_attributes(
        &self,
        identifier: CompilerNodeIdentifier,
        tag: &str,
        list: &'o [Attribute],
        template: &mut Vec<Piece<'o>>,
    ) {
        let (arguments, events) = self.spread_args(identifier, tag, list, false);
        let call = self.b.runtime_some("attributes", arguments);
        template.push(Piece::Expression(call));
        push_captured_events(template, &events);
    }

    /// Upstream `prepare_element_spread`'s arguments. `all` is `prepare_element_spread_object`,
    /// which keeps every attribute; otherwise the spread path of `build_element_attributes`
    /// filters events (returned for capture) and the values the runtime sets elsewhere.
    pub(in crate::lower::server) fn spread_args(
        &self,
        identifier: CompilerNodeIdentifier,
        tag: &str,
        list: &'o [Attribute],
        all: bool,
    ) -> (Vec<Option<Expression<'o>>>, Vec<&'o str>) {
        let b = self.b;
        let mut events = Vec::new();
        let mut props: Vec<ObjectPropertyKind<'o>> = Vec::with_capacity(list.len());
        let mut class_directives = Vec::new();
        let mut style_directives = Vec::new();
        for a in list {
            let raw_name = a.name.text(self.source_text);
            match a.value {
                AttributeValue::Bind(e) => {
                    // `prepare_element_spread_object` keeps every binding.
                    let value = if all {
                        Some(self.bound(e))
                    } else {
                        self.bound_value(tag, list, a)
                    };
                    if let Some(value) = value {
                        props.push(b.init(&raw_name.to_ascii_lowercase(), value));
                    }
                    continue;
                }
                AttributeValue::Use { .. } => {
                    capture_load_events(&mut events, tag);
                    continue;
                }
                _ if is_behaviour(&a.value) => continue,
                AttributeValue::Class(e) => {
                    class_directives.push((raw_name, e));
                    continue;
                }
                AttributeValue::Style { .. } => {
                    style_directives.push(a);
                    continue;
                }
                AttributeValue::Spread(e) => {
                    let v = self.expression(e);
                    props.push(b.spread_property(v));
                    capture_load_events(&mut events, tag);
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
            let value = match &a.value {
                AttributeValue::Static(v) => b.string(&escaped_text(v, trim)),
                _ => self.attribute_value(a, trim, raw_name == "class"),
            };
            props.push(b.init(&name, value));
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
            props.push(b.init("class", b.string("")));
        }
        let object = b.object(props);
        let classes = (!class_directives.is_empty()).then(|| {
            b.object(
                class_directives
                    .iter()
                    .map(|&(name, e)| b.init(name, self.expression(e))),
            )
        });
        let hash = if self.an.scoped[identifier] {
            self.identity.stylesheet_hash.clone()
        } else {
            None
        };
        let hash = hash.map(|h| b.string(&h));
        let flags = if self.plan.namespace(identifier) != crate::render_plan::Namespace::Html {
            ELEMENT_IS_NAMESPACED | ELEMENT_PRESERVE_ATTRIBUTE_CASE
        } else if tag == "input" {
            ELEMENT_IS_INPUT
        } else {
            0
        };
        let flags = (flags != 0).then(|| b.number(f64::from(flags)));
        let styles = self.spread_styles(&style_directives);
        (vec![Some(object), hash, classes, styles, flags], events)
    }
}
