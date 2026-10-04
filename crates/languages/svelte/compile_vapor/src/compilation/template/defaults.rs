use super::{
    AssignmentOperator, Attribute, AttributeValue, Builder, Helper, NodeIdentifier, R,
    SourceLocation, Steps, bound, static_type, unsupported, vue,
};

impl Builder<'_, '_> {
    fn default_value(&mut self, attribute: &Attribute) -> R<NodeIdentifier> {
        Ok(match &attribute.value {
            AttributeValue::Static(value) => self.to.write_string(value),
            AttributeValue::Boolean => self.to.write_boolean(true, SourceLocation::SYNTHETIC),
            AttributeValue::Expression { expression, .. }
            | AttributeValue::Shorthand(expression) => {
                self.render_read(*expression)?;
                self.template_expression(*expression)
            }
            _ => return Err(unsupported("this default attribute", attribute.span)),
        })
    }

    pub(super) fn default_attribute(
        &mut self,
        attribute: &Attribute,
        attributes: &[Attribute],
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
    ) -> R<()> {
        let checked = attribute
            .name
            .text(self.i.source_text)
            .eq_ignore_ascii_case("defaultChecked");
        let name = if checked { "checked" } else { "value" };
        let value = self.default_value(attribute)?;
        if self.i.server {
            if !attributes.iter().any(|attribute| {
                matches!(attribute.value, AttributeValue::Bind(_))
                    && attribute.name.text(self.i.source_text) == name
            }) {
                let value = if checked {
                    self.helpers.insert(Helper::BooleanServer);
                    self.call("$$bool", &[value])
                } else {
                    value
                };
                props.push(bound(name, attribute.name.span(), value, attribute.span));
            }
        } else {
            let element = self.to.identifier("$$el");
            let property = self.to.dot(
                element,
                if checked {
                    "defaultChecked"
                } else {
                    "defaultValue"
                },
            );
            let assignment = self.to.assign(
                AssignmentOperator::Assign,
                property,
                value,
                SourceLocation::SYNTHETIC,
            );
            steps.mounted.insert(0, assignment);
        }
        Ok(())
    }

    pub(super) fn bind_reset(
        &mut self,
        attribute: &Attribute,
        target: NodeIdentifier,
        attributes: &[Attribute],
        steps: &mut Steps,
    ) {
        self.helpers.insert(Helper::FormReset);
        let name = attribute.name.text(self.i.source_text);
        let element = self.to.identifier("$$el");
        let value = match name {
            "checked" => self.to.dot(element, "defaultChecked"),
            "files" => self.to.dot(element, "files"),
            "group" => if static_type(self.i.source_text, attributes) == Some("checkbox") {
                self.to.array(&[], SourceLocation::SYNTHETIC)
            } else { self.to.null(SourceLocation::SYNTHETIC) },
            "value" => {
                if attributes.iter().any(|attribute| attribute.name.text(self.i.source_text) == "type" && matches!(&attribute.value, AttributeValue::Static(value) if value.as_ref() == "number" || value.as_ref() == "range")) {
                    let value = self.to.dot(element, "defaultValue");
                    self.call("$$number", &[value])
                } else {
                    self.to.dot(element, "value")
                }
            }
            _ => unreachable!(),
        };
        let value = if name == "value" {
            self.call("$$reset_value", &[element, value])
        } else {
            value
        };
        let assignment = self.binding_write(target, value);
        let callback = self
            .to
            .arrow(&[], assignment, true, false, SourceLocation::SYNTHETIC);
        let name = self.to.write_string(name);
        steps
            .mounted
            .push(self.call("$$form_reset", &[element, name, callback]));
    }
}
