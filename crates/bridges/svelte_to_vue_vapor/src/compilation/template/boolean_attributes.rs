use oxc_ast::ast::Expression;

use super::{Attribute, AttributeValue, Helper, Steps, Template, attribute, vue};

impl<'t> Template<'_, '_, 't> {
    /// A plain attribute's value as an expression.
    pub(super) fn plain_value(&mut self, a: &Attribute) -> Expression<'t> {
        match &a.value {
            AttributeValue::Boolean => self.b.boolean(true),
            AttributeValue::Static(value) => self.b.string(value),
            &(AttributeValue::Expression { expression, .. }
            | AttributeValue::Shorthand(expression)) => self.template_expression(expression),
            AttributeValue::Interpolated(parts) => self.interpolated(parts),
            _ => unreachable!("a plain attribute"),
        }
    }

    pub(super) fn special_boolean_attribute(
        &mut self,
        source: &Attribute,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps<'t>,
    ) {
        let name = source.name.text(self.i.source_text);
        if self.i.server || name == "hidden" {
            match &source.value {
                AttributeValue::Static(value) => {
                    props.push(attribute(source, Some(value)));
                    return;
                }
                AttributeValue::Boolean => {
                    props.push(attribute(source, None));
                    return;
                }
                _ => {}
            }
        }
        let value = self.plain_value(source);
        if self.i.server {
            let value = if name == "hidden" {
                value
            } else {
                self.helpers.insert(Helper::BooleanServer);
                self.call("$$bool", [value])
            };
            props.push(self.bound(name, source.name.span(), value, source.span));
        } else if name == "muted" {
            let value = self.call("Boolean", [value]);
            props.push(self.bound(name, source.name.span(), value, source.span));
        } else {
            self.helpers.insert(Helper::SpecialAttribute);
            let helper = if name == "hidden" {
                "$$hidden"
            } else {
                "$$autofocus"
            };
            let call = self.call(helper, [self.b.id("$$el"), value]);
            steps.mounted.push(call);
        }
    }
}
