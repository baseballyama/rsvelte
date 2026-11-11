use crate::lower::builder::Runtime;
use oxc_ast::ast::Expression;

use super::{escaped_text, scoped_class};
use crate::lower::javascript::string_value;
use crate::lower::server::{
    Attribute, AttributeValue, CompilerNodeIdentifier, Piece, R, ServerCompilationContext,
    capture_event, escape_markup, event_attribute, is_boolean_attribute, is_directive,
    push_captured_events, unsupported,
};

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `build_element_attributes` (no spread).
    pub(in crate::lower::server) fn element_attributes(
        &self,
        identifier: CompilerNodeIdentifier,
        tag: &str,
        list: &'o [Attribute],
        template: &mut Vec<Piece<'o>>,
    ) -> R<()> {
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
            return Ok(());
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
        for a in list {
            let raw_name = a.name.text(self.source_text);
            match a.value {
                AttributeValue::Bind(_) if tag == "svelte:element" && raw_name == "this" => {
                    continue;
                }
                AttributeValue::Bind(_) => {
                    let call = self.binding(a);
                    template.push(Piece::Expression(call));
                    continue;
                }
                AttributeValue::Attach(_)
                | AttributeValue::On { .. }
                | AttributeValue::Class(_) => continue,
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
            let can_use_literal = name != "class" || class_directives.is_empty();
            let literal = match &a.value {
                AttributeValue::Boolean => Some(None),
                AttributeValue::Static(v) => Some(Some(escaped_text(v, trim))),
                _ => None,
            };
            if can_use_literal && let Some(v) = literal {
                Self::literal_attribute(template, &name, v, hash.as_deref());
                continue;
            }
            if name == "style" {
                return unsupported("a dynamic `style` attribute", a.span);
            }
            let value = match literal {
                Some(Some(v)) => self.b.string(&v),
                _ => self.attribute_value(a, trim, raw_name == "class"),
            };
            if can_use_literal && let Expression::StringLiteral(literal) = &value {
                let mut v = string_value(literal.value).into_owned();
                if name == "class"
                    && let Some(h) = &hash
                {
                    v = scoped_class(&v, h);
                }
                let v = escape_markup(&v, true);
                template.push(Piece::Text(format!(" {name}=\"{v}\"")));
            } else if name == "class" {
                let call = self.attribute_class(&class_directives, value, hash.as_deref());
                template.push(Piece::Expression(call));
            } else {
                let mut arguments = vec![self.b.string(&name), value];
                if is_boolean_attribute(&name) {
                    arguments.push(self.b.boolean(true));
                }
                template.push(Piece::Expression(self.b.runtime("attr", arguments)));
            }
        }
        // Upstream's analysis appends `class=""` to such an element.
        let has_class = list.iter().any(|a| {
            !matches!(a.value, AttributeValue::Class(_))
                && a.name.text(self.source_text).eq_ignore_ascii_case("class")
        });
        if !has_class && !class_directives.is_empty() {
            let call = self.attribute_class(&class_directives, self.b.string(""), hash.as_deref());
            template.push(Piece::Expression(call));
        } else if !has_class && self.an.scoped[identifier] {
            Self::literal_attribute(template, "class", Some(String::new()), hash.as_deref());
        }
        push_captured_events(template, &events);
        Ok(())
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
