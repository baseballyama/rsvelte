use oxc_ast::ast::Expression;
use rsvelte_svelte_semantic::compiler_syntax_tree::{Modifiers, StyleValue};

use super::attribute_text;
use crate::lower::builder::Runtime;
use crate::lower::server::{Attribute, AttributeValue, ServerCompilationContext};

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `build_attr_style`: `$.attr_style(value, { name: value })`, the important ones in a
    /// second object.
    pub(in crate::lower::server) fn attr_style(
        &self,
        directives: &[&Attribute],
        value: Expression<'o>,
    ) -> Expression<'o> {
        let b = self.b;
        if directives.is_empty() {
            return b.runtime("attr_style", [value]);
        }
        let mut normal = Vec::new();
        let mut important = Vec::new();
        for d in directives {
            let AttributeValue::Style { modifiers, .. } = &d.value else {
                unreachable!("style directives")
            };
            let name = d.name.text(self.source_text);
            let name = if name.starts_with("--") {
                name.to_owned()
            } else {
                name.to_lowercase()
            };
            let property = b.init(&name, self.style_value(d));
            if modifiers.contains(Modifiers::IMPORTANT) {
                important.push(property);
            } else {
                normal.push(property);
            }
        }
        let directives = if important.is_empty() {
            b.object(normal)
        } else {
            b.array([b.object(normal), b.object(important)])
        };
        b.runtime("attr_style", [value, directives])
    }

    /// Upstream `prepare_element_spread`'s `styles`: `{ name: value }` as written.
    pub(in crate::lower::server) fn spread_styles(
        &self,
        directives: &[&Attribute],
    ) -> Option<Expression<'o>> {
        (!directives.is_empty()).then(|| {
            self.b.object(directives.iter().map(|d| {
                self.b
                    .init(d.name.text(self.source_text), self.style_value(d))
            }))
        })
    }

    /// A directive's value, its text trimmed; `style:color` reads `color` as written.
    fn style_value(&self, d: &Attribute) -> Expression<'o> {
        let b = self.b;
        let AttributeValue::Style { value, .. } = &d.value else {
            unreachable!("style directives")
        };
        match value.as_ref() {
            StyleValue::Shorthand(_) => b.id(d.name.text(self.source_text)),
            StyleValue::Static(v) => b.string(&attribute_text(v, true)),
            &StyleValue::Expression { expression, .. } => self.expression(expression),
            StyleValue::Interpolated(parts) => self.interpolated(parts, true),
            StyleValue::Empty => {
                unreachable!("coverage refuses a `style:` directive without a value")
            }
        }
    }
}
