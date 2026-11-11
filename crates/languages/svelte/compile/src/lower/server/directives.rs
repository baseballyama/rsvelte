use oxc_ast::ast::Expression;
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{Attribute, AttributeValue, ServerCompilationContext, is_boolean_attribute};
use crate::lower::bindings::{Lowering, attribute_value, property_of};
use crate::lower::builder::Runtime;

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `build_element_attributes` (server): the value a binding renders as the
    /// attribute it names, or `None` when it renders nothing.
    pub(super) fn bound_value(
        &self,
        tag: &str,
        attributes: &[Attribute],
        a: &Attribute,
    ) -> Option<Expression<'o>> {
        let AttributeValue::Bind(e) = a.value else {
            unreachable!("called on bindings")
        };
        let name = a.name.text(self.source_text);
        let file = || {
            matches!(
                attribute_value(self.source_text, attributes, "type"),
                Some(AttributeValue::Static(t)) if &**t == "file"
            )
        };
        let skipped = match name {
            "value" => tag == "select" || file(),
            _ => property_of(name)
                .is_none_or(|p| p.client_only || p.lowering == Lowering::ContentEditable),
        };
        if skipped {
            return None;
        }
        Some(self.bound(e))
    }

    /// Upstream's `content`: the body a content binding renders in place of the children; the
    /// last one wins.
    pub(super) fn element_body(&self, attributes: &[Attribute]) -> Option<Expression<'o>> {
        let b = self.b;
        let mut body = None;
        for a in attributes {
            let AttributeValue::Bind(e) = a.value else {
                continue;
            };
            let name = a.name.text(self.source_text);
            if property_of(name).is_some_and(|p| p.lowering == Lowering::ContentEditable) {
                let value = self.bound(e);
                // `innerHTML` is the one binding upstream does not escape.
                body = Some(if name == "innerHTML" {
                    value
                } else {
                    b.runtime("escape", [value])
                });
            }
        }
        body
    }

    /// The value of a binding to `e`: a getter's call for a getter and a setter.
    pub(super) fn bound(&self, e: ExpressionIdentifier) -> Expression<'o> {
        match self.javascript.get_expression(e).get_inner_expression() {
            Expression::SequenceExpression(s) if let [get, _] = s.expressions.as_slice() => {
                self.b.call(self.rewrite().expression(get), [])
            }
            _ => self.expression(e),
        }
    }

    /// Upstream `BindDirective` (server): the bound value as an attribute.
    pub(super) fn binding(
        &self,
        tag: &str,
        attributes: &[Attribute],
        a: &Attribute,
    ) -> Option<Expression<'o>> {
        let b = self.b;
        let value = self.bound_value(tag, attributes, a)?;
        let name = a.name.text(self.source_text).to_ascii_lowercase();
        let mut arguments = vec![b.string(&name), value];
        if is_boolean_attribute(&name) {
            arguments.push(b.boolean(true));
        }
        Some(b.runtime("attr", arguments))
    }
}
