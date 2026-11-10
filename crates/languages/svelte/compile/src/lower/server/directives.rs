use oxc_ast::ast::Expression;

use super::{Attribute, AttributeValue, ServerCompilationContext, is_boolean_attribute};

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `BindDirective` (server): the bound value as an attribute.
    pub(super) fn binding(&self, a: &Attribute) -> Expression<'o> {
        let AttributeValue::Bind(e) = a.value else {
            unreachable!("called on bindings")
        };
        let b = self.b;
        let name = a.name.text(self.source_text).to_ascii_lowercase();
        let mut arguments = vec![b.string(&name), self.expression(e)];
        if is_boolean_attribute(&name) {
            arguments.push(b.boolean(true));
        }
        b.runtime("attr", arguments)
    }
}
