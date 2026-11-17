use oxc_ast::ast::Expression;
use rsvelte_svelte_semantic::compiler_syntax_tree::StyleValue;

use super::attribute_text;
use crate::lower::Target;
use crate::lower::builder::Runtime;
use crate::lower::server::{Attribute, AttributeValue, ServerCompilationContext};
use crate::lower::template::style_directives_object;

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `build_attr_style`: `$.attr_style(value, { name: value })`, the important ones in a
    /// second object.
    pub(in crate::lower::server) fn attribute_style(
        &self,
        directives: &[&Attribute],
        value: Expression<'o>,
    ) -> Expression<'o> {
        let b = self.b;
        if directives.is_empty() {
            return b.runtime("attr_style", [value]);
        }
        let directives =
            style_directives_object(b, self.source_text, directives, Target::Server, |d| {
                self.style_value(d)
            });
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
