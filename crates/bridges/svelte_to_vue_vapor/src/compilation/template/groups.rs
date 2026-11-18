use oxc_ast::ast::Expression;
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{Attribute, AttributeValue, Helper, R, Steps, Template, static_type, unsupported, vue};

impl<'t> Template<'_, '_, 't> {
    pub(super) fn bind_group(
        &mut self,
        attribute: &Attribute,
        target: ExpressionIdentifier,
        attributes: &[Attribute],
        props: &mut Vec<vue::Property>,
        steps: &mut Steps<'t>,
    ) -> R<()> {
        let b = self.b;
        let checkbox = match static_type(self.i.source_text, attributes) {
            Some("checkbox") => true,
            Some("radio") => false,
            _ => {
                return Err(unsupported(
                    "a group binding outside a checkbox or radio input",
                    attribute.span,
                ));
            }
        };
        let value = attributes
            .iter()
            .find(|attribute| attribute.name.text(self.i.source_text) == "value");
        let option = match value.map(|attribute| &attribute.value) {
            Some(AttributeValue::Static(value)) => b.string(value),
            Some(
                &(AttributeValue::Expression { expression, .. }
                | AttributeValue::Shorthand(expression)),
            ) => self.template_expression(expression),
            None => b.string("on"),
            _ => return Err(unsupported("this group value", attribute.span)),
        };
        self.helpers.insert(Helper::Group);
        let current = self.binding_read(target);
        if self.i.server {
            let checked = self.call("$$group_checked", [current, option, b.boolean(checkbox)]);
            props.push(self.bound("checked", attribute.name.span(), checked, attribute.span));
            return Ok(());
        }
        let (key, property) = match self.source(target).get_inner_expression() {
            Expression::StaticMemberExpression(m) => {
                (self.rewrite(&m.object), b.string(&m.property.name))
            }
            Expression::ComputedMemberExpression(m) => {
                (self.rewrite(&m.object), self.rewrite(&m.expression))
            }
            Expression::Identifier(_) => {
                let target = self.template_expression(target);
                (self.call("$$group_source", [target]), b.null())
            }
            _ => return Err(unsupported("this group binding target", attribute.span)),
        };
        let setter = self.setter(target);
        let call = self.call(
            "$$group",
            [
                b.id("$$el"),
                b.id("$$instance_groups"),
                key,
                property,
                self.getter(current),
                setter,
                option,
            ],
        );
        steps.mounted.push(call);
        Ok(())
    }
}
