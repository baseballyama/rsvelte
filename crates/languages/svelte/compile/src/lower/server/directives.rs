use oxc_ast::ast::{BinaryOperator, Expression};
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{
    Attribute, AttributeValue, ServerCompilationContext, is_boolean_attribute, is_directive,
};
use crate::lower::bindings::{Lowering, attribute_value, property_of};
use crate::lower::builder::Runtime;

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `build_element_attributes` (server): the attribute a binding renders, by name
    /// and value, or `None` when it renders nothing.
    pub(super) fn bound_value(
        &self,
        tag: &str,
        attributes: &[Attribute],
        a: &Attribute,
    ) -> Option<(String, Expression<'o>)> {
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
            "value" => matches!(tag, "select" | "textarea") || file(),
            _ => property_of(name)
                .is_none_or(|p| p.client_only || p.lowering == Lowering::ContentEditable),
        };
        if skipped {
            return None;
        }
        if name == "group" {
            return self
                .group_checked(attributes, e)
                .map(|c| ("checked".to_owned(), c));
        }
        Some((name.to_ascii_lowercase(), self.bound(e)))
    }

    /// A group checks the input whose `value` it holds: one of a checkbox group's values, or a
    /// radio group's value.
    fn group_checked(
        &self,
        attributes: &[Attribute],
        e: ExpressionIdentifier,
    ) -> Option<Expression<'o>> {
        let b = self.b;
        let value = attributes
            .iter()
            .find(|a| !is_directive(&a.value) && a.name.text(self.source_text) == "value")?;
        let value = self.attribute_value(value, false, false);
        let checkbox = matches!(
            attribute_value(self.source_text, attributes, "type"),
            Some(AttributeValue::Static(t)) if &**t == "checkbox"
        );
        let target = self.expression(e);
        Some(if checkbox {
            b.call(b.member(target, "includes"), [value])
        } else {
            b.binary(target, BinaryOperator::StrictEquality, value)
        })
    }

    /// Upstream's `content`: the body a content binding renders in place of the children; the
    /// last one wins.
    pub(super) fn element_body(
        &self,
        tag: &str,
        attributes: &[Attribute],
    ) -> Option<Expression<'o>> {
        let b = self.b;
        let mut body = None;
        for a in attributes {
            let name = a.name.text(self.source_text);
            let AttributeValue::Bind(e) = a.value else {
                if tag == "textarea" && name == "value" && !is_directive(&a.value) {
                    let value = match &a.value {
                        // Upstream doubles a leading newline, which the parser drops.
                        AttributeValue::Static(v)
                            if v.starts_with('\n') || v.starts_with("\r\n") =>
                        {
                            b.string(&format!("\n{v}"))
                        }
                        _ => self.attribute_value(a, false, false),
                    };
                    body = Some(b.runtime("escape", [value]));
                }
                continue;
            };
            if tag == "textarea" && name == "value" {
                body = Some(b.runtime("escape", [self.bound(e)]));
            } else if property_of(name).is_some_and(|p| p.lowering == Lowering::ContentEditable) {
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
        let (name, value) = self.bound_value(tag, attributes, a)?;
        let mut arguments = vec![b.string(&name), value];
        if is_boolean_attribute(&name) {
            arguments.push(b.boolean(true));
        }
        Some(b.runtime("attr", arguments))
    }
}
