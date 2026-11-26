use std::borrow::Cow;

use oxc_ast::ast::Expression;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    Attribute, AttributeValue, CompilerNodeIdentifier,
};
use rsvelte_svelte_syntax::syntax_tree::escape_markup;
use rsvelte_typescript_tree::JavaScriptString;

use super::escaped_text;
use crate::input::Target;
use crate::lower::attributes::{
    can_use_literal, event_attribute, implicit_attributes, is_behaviour, is_boolean_attribute,
    is_directive, scoped_class, scoped_literal_class,
};
use crate::lower::builder::Runtime;
use crate::lower::server::ServerCompilationContext;
use crate::lower::server::events::{capture_event, capture_load_events, push_captured_events};
use crate::lower::server::template::Template;

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `build_element_attributes` (no spread).
    pub(in crate::lower::server) fn element_attributes(
        &self,
        identifier: CompilerNodeIdentifier,
        tag: &str,
        list: &'o [Attribute],
        template: &mut Template<'_, 'o>,
    ) {
        let source_text = self.source_text;
        // A `defaultValue` on an `<input>` deopts to the spread path, which orders it at runtime.
        let has_spread = list.iter().any(|a| {
            matches!(a.value, AttributeValue::Spread(_))
                || (tag == "input"
                    && !is_directive(&a.value)
                    && matches!(a.name.text(source_text), "defaultValue" | "defaultChecked"))
        });
        if has_spread {
            self.spread_attributes(identifier, tag, list, template);
            return;
        }
        let hash = if self.an.scoped[identifier] {
            self.identity.stylesheet_hash.as_deref()
        } else {
            None
        };
        let mut events = Vec::new();
        let class_directives: Vec<&Attribute> = list
            .iter()
            .filter(|a| matches!(a.value, AttributeValue::Class(_)))
            .collect();
        let style_directives: Vec<&Attribute> = list
            .iter()
            .filter(|a| matches!(a.value, AttributeValue::Style { .. }))
            .collect();
        let directives = (class_directives.as_slice(), style_directives.as_slice());
        for a in list {
            let raw_name = a.name.text(self.source_text);
            match a.value {
                AttributeValue::Bind(_) => {
                    if let Some(call) = self.binding(identifier, tag, list, a) {
                        template.expression(call);
                    }
                    continue;
                }
                AttributeValue::Use { .. } => {
                    capture_load_events(&mut events, tag);
                    continue;
                }
                AttributeValue::Class(_) | AttributeValue::Style { .. } => continue,
                _ if is_behaviour(&a.value) => continue,
                AttributeValue::Spread(_) => unreachable!("spreads take the spread path"),
                _ if event_attribute(self.source_text, a).is_some() => {
                    capture_event(&mut events, tag, raw_name);
                    continue;
                }
                _ if matches!(raw_name, "defaultValue" | "defaultChecked") => continue,
                // Upstream renders a `<textarea>`'s value as its content.
                _ if raw_name == "value" && tag == "textarea" => continue,
                _ => {}
            }
            let name = self.attribute_name(identifier, raw_name);
            let trim = matches!(&*name, "class" | "style");
            let literal = match &a.value {
                AttributeValue::Boolean => Some(None),
                AttributeValue::Static(v) => Some(Some(escaped_text(v, trim))),
                _ => None,
            };
            if can_use_literal(&name, directives.0, directives.1)
                && let Some(v) = literal
            {
                Self::literal_attribute(template, &name, v, hash);
                continue;
            }
            let value = self.attribute_value(a, trim, raw_name == "class");
            self.dynamic_attribute(&name, value, directives, hash, template);
        }
        let implicit = implicit_attributes(self.source_text, list, self.an.scoped[identifier]);
        if implicit.class && !class_directives.is_empty() {
            let call = self.attribute_class(&class_directives, self.b.string(""), hash);
            template.expression(call);
        } else if implicit.class {
            Self::literal_attribute(template, "class", Some(String::new()), hash);
        }
        if implicit.style {
            let call = self.attribute_style(&style_directives, self.b.string(""));
            template.expression(call);
        }
        push_captured_events(template, &events);
    }

    /// An attribute upstream does not print as text: inlined when its value is a string, else
    /// through `$.attr_class`, `$.attr_style` or `$.attr`.
    fn dynamic_attribute(
        &self,
        name: &str,
        value: Expression<'o>,
        (class_directives, style_directives): (&[&Attribute], &[&Attribute]),
        hash: Option<&str>,
        template: &mut Template<'_, 'o>,
    ) {
        let b = self.b;
        if can_use_literal(name, class_directives, style_directives)
            && let Expression::StringLiteral(literal) = &value
        {
            let v = match hash {
                Some(h) if name == "class" => {
                    scoped_literal_class(literal.value, h, Target::Server, |text| {
                        Cow::Borrowed(text)
                    })
                }
                _ => JavaScriptString::from_oxc(literal.value),
            };
            template.text_fmt(format_args!(" {name}=\""));
            template.javascript_text_mapped(&v, |text| escape_markup(text, true));
            template.text("\"");
            return;
        }
        let call = match name {
            "class" => self.attribute_class(class_directives, value, hash),
            "style" => self.attribute_style(style_directives, value),
            _ => {
                let mut arguments = vec![b.string(name), value];
                if is_boolean_attribute(name) {
                    arguments.push(b.boolean(true));
                }
                b.runtime("attr", arguments)
            }
        };
        template.expression(call);
    }

    fn literal_attribute(
        template: &mut Template<'_, 'o>,
        name: &str,
        value: Option<String>,
        hash: Option<&str>,
    ) {
        let mut value = value;
        if name == "class"
            && let Some(h) = hash
        {
            let base = value
                .as_deref()
                .map_or_else(|| "true".to_owned(), str::to_owned);
            value = Some(scoped_class(&base, h, Target::Server));
        }
        if name != "class" || value.as_deref() != Some("") {
            template.text_fmt(format_args!(" {name}=\"{}\"", value.unwrap_or_default()));
        }
    }
}
