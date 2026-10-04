use super::{Attribute, AttributeValue, Builder, Helper, Part, R, SourceLocation, Steps};

impl Builder<'_, '_> {
    pub(super) fn custom_element_attribute(
        &mut self,
        attribute: &Attribute,
        steps: &mut Steps,
    ) -> R<()> {
        let value = match &attribute.value {
            AttributeValue::Boolean => self.to.write_boolean(true, SourceLocation::SYNTHETIC),
            AttributeValue::Static(value) => self.to.write_string(value),
            AttributeValue::Expression { expression, .. }
            | AttributeValue::Shorthand(expression) => {
                self.render_read(*expression)?;
                self.template_expression(*expression)
            }
            AttributeValue::Interpolated(parts) => {
                for part in parts {
                    if let Part::Expression { expression, .. } = *part {
                        self.render_read(expression)?;
                    }
                }
                self.interpolated(parts)
            }
            _ => unreachable!("a plain custom element attribute"),
        };
        self.helpers.insert(Helper::CustomElementData);
        let element = self.to.identifier("$$el");
        let name = self
            .to
            .write_string(attribute.name.text(self.i.source_text));
        steps
            .mounted
            .push(self.call("$$custom_element_data", &[element, name, value]));
        Ok(())
    }
}
