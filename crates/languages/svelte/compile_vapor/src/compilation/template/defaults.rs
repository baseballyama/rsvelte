use oxc_ast::ast::Expression;
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{Attribute, AttributeValue, Helper, R, Steps, Template, static_type, unsupported, vue};

impl<'t> Template<'_, '_, 't> {
    fn default_value(&mut self, attribute: &Attribute) -> R<Expression<'t>> {
        Ok(match &attribute.value {
            AttributeValue::Static(value) => self.b.string(value),
            AttributeValue::Boolean => self.b.boolean(true),
            &(AttributeValue::Expression { expression, .. }
            | AttributeValue::Shorthand(expression)) => self.template_expression(expression),
            _ => return Err(unsupported("this default attribute", attribute.span)),
        })
    }

    pub(super) fn default_attribute(
        &mut self,
        attribute: &Attribute,
        attributes: &[Attribute],
        props: &mut Vec<vue::Property>,
        steps: &mut Steps<'t>,
    ) -> R<()> {
        let b = self.b;
        let source_text = self.i.source_text;
        let checked = attribute
            .name
            .text(source_text)
            .eq_ignore_ascii_case("defaultChecked");
        let name = if checked { "checked" } else { "value" };
        let value = self.default_value(attribute)?;
        if !self.i.server {
            let property = if checked {
                "defaultChecked"
            } else {
                "defaultValue"
            };
            let assignment = b.assign_member(b.member(b.id("$$el"), property), value);
            steps.mounted.insert(0, assignment);
            return Ok(());
        }
        let bound = attributes.iter().any(|attribute| {
            matches!(attribute.value, AttributeValue::Bind(_))
                && attribute.name.text(source_text) == name
        });
        if !bound {
            let value = if checked {
                self.helpers.insert(Helper::BooleanServer);
                self.call("$$bool", [value])
            } else {
                value
            };
            props.push(self.bound(name, attribute.name.span(), value, attribute.span));
        }
        Ok(())
    }

    pub(super) fn bind_reset(
        &mut self,
        attribute: &Attribute,
        target: ExpressionIdentifier,
        attributes: &[Attribute],
        steps: &mut Steps<'t>,
    ) {
        let b = self.b;
        let source_text = self.i.source_text;
        self.helpers.insert(Helper::FormReset);
        let name = attribute.name.text(source_text);
        let element = || b.id("$$el");
        let value = match name {
            "checked" => b.member(element(), "defaultChecked"),
            "files" => b.member(element(), "files"),
            "group" if static_type(source_text, attributes) == Some("checkbox") => b.array([]),
            "group" => b.null(),
            "value" => {
                let numeric = attributes.iter().any(|attribute| {
                    attribute.name.text(source_text) == "type"
                        && matches!(&attribute.value, AttributeValue::Static(value) if matches!(value.as_ref(), "number" | "range"))
                });
                let value = if numeric {
                    self.call("$$number", [b.member(element(), "defaultValue")])
                } else {
                    b.member(element(), "value")
                };
                self.call("$$reset_value", [element(), value])
            }
            _ => unreachable!("a binding with a form reset"),
        };
        let assignment = self.binding_write(target, value);
        let call = self.call(
            "$$form_reset",
            [element(), b.string(name), self.getter(assignment)],
        );
        steps.mounted.push(call);
    }
}
