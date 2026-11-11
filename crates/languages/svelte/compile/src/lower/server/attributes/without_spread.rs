use crate::lower::builder::Runtime;
use oxc_ast::ast::Expression;

use super::{escaped_text, scoped_class};
use crate::lower::javascript::string_value;
use crate::lower::server::{
    Attribute, AttributeValue, CompilerNodeIdentifier, Piece, ServerCompilationContext,
    capture_event, capture_load_events, escape_markup, event_attribute, is_behaviour,
    is_boolean_attribute, is_directive, push_captured_events,
};

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `build_element_attributes` (no spread).
    pub(in crate::lower::server) fn element_attributes(
        &self,
        identifier: CompilerNodeIdentifier,
        tag: &str,
        list: &'o [Attribute],
        template: &mut Vec<Piece<'o>>,
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
            self.identity.stylesheet_hash.clone()
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
                AttributeValue::Bind(_) if raw_name == "this" => {
                    continue;
                }
                AttributeValue::Bind(_) => {
                    let call = self.binding(a);
                    template.push(Piece::Expression(call));
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
                _ => {}
            }
            let name = if self.plan.namespace(identifier) == crate::render_plan::Namespace::Html {
                raw_name.to_ascii_lowercase()
            } else {
                raw_name.to_owned()
            };
            let trim = matches!(name.as_str(), "class" | "style");
            let literal = match &a.value {
                AttributeValue::Boolean => Some(None),
                AttributeValue::Static(v) => Some(Some(escaped_text(v, trim))),
                _ => None,
            };
            if can_use_literal(&name, directives)
                && let Some(v) = literal
            {
                Self::literal_attribute(template, &name, v, hash.as_deref());
                continue;
            }
            let value = self.attribute_value(a, trim, raw_name == "class");
            self.dynamic_attribute(&name, value, directives, hash.as_deref(), template);
        }
        self.implicit_class(
            identifier,
            list,
            &class_directives,
            hash.as_deref(),
            template,
        );
        // And `style=""` to one with `style:`.
        let has_style = list.iter().any(|a| {
            !is_directive(&a.value) && a.name.text(self.source_text).eq_ignore_ascii_case("style")
        });
        if !has_style && !style_directives.is_empty() {
            let call = self.attr_style(&style_directives, self.b.string(""));
            template.push(Piece::Expression(call));
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
        template: &mut Vec<Piece<'o>>,
    ) {
        let b = self.b;
        if can_use_literal(name, (class_directives, style_directives))
            && let Expression::StringLiteral(literal) = &value
        {
            let mut v = string_value(literal.value).into_owned();
            if name == "class"
                && let Some(h) = hash
            {
                v = scoped_class(&v, h);
            }
            let v = escape_markup(&v, true);
            template.push(Piece::Text(format!(" {name}=\"{v}\"")));
            return;
        }
        let call = match name {
            "class" => self.attribute_class(class_directives, value, hash),
            "style" => self.attr_style(style_directives, value),
            _ => {
                let mut arguments = vec![b.string(name), value];
                if is_boolean_attribute(name) {
                    arguments.push(b.boolean(true));
                }
                b.runtime("attr", arguments)
            }
        };
        template.push(Piece::Expression(call));
    }

    /// Upstream's analysis appends `class=""` to an element with `class:` or a scoped one.
    fn implicit_class(
        &self,
        identifier: CompilerNodeIdentifier,
        list: &[Attribute],
        class_directives: &[&Attribute],
        hash: Option<&str>,
        template: &mut Vec<Piece<'o>>,
    ) {
        let has_class = list.iter().any(|a| {
            !matches!(a.value, AttributeValue::Class(_))
                && a.name.text(self.source_text).eq_ignore_ascii_case("class")
        });
        if !has_class && !class_directives.is_empty() {
            let call = self.attribute_class(class_directives, self.b.string(""), hash);
            template.push(Piece::Expression(call));
        } else if !has_class && self.an.scoped[identifier] {
            Self::literal_attribute(template, "class", Some(String::new()), hash);
        }
    }

    fn literal_attribute(
        template: &mut Vec<Piece<'o>>,
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
            value = Some(scoped_class(&base, h));
        }
        if name != "class" || value.as_deref() != Some("") {
            template.push(Piece::Text(format!(
                " {name}=\"{}\"",
                value.unwrap_or_default()
            )));
        }
    }
}

/// Upstream's `can_use_literal`: a `class` or `style` with directives needs the runtime.
fn can_use_literal(name: &str, (classes, styles): (&[&Attribute], &[&Attribute])) -> bool {
    (name != "class" || classes.is_empty()) && (name != "style" || styles.is_empty())
}
