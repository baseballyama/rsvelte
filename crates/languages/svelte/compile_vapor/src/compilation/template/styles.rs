use rsvelte_svelte::compilation::compiler_syntax_tree::{Modifiers, StyleValue};

use super::{Attribute, AttributeValue, Builder, Helper, R, SourceLocation, Steps, unsupported};

impl Builder<'_, '_> {
    pub(super) fn styles(&mut self, attributes: &[Attribute], steps: &mut Steps) -> R<()> {
        let mut base = self.to.write_string("");
        let declarations = self.style_declarations(attributes)?;
        for attribute in attributes {
            if attribute.name.text(self.i.source_text) == "style"
                && !matches!(attribute.value, AttributeValue::Style { .. })
            {
                base = match &attribute.value {
                    AttributeValue::Static(value) => self.to.write_string(value),
                    AttributeValue::Expression { expression, .. }
                    | AttributeValue::Shorthand(expression) => {
                        self.render_read(*expression)?;
                        self.template_expression(*expression)
                    }
                    AttributeValue::Interpolated(parts) => self.interpolated(parts),
                    _ => {
                        return Err(unsupported(
                            "this style attribute beside style directives",
                            attribute.span,
                        ));
                    }
                };
            }
        }
        self.helpers.insert(Helper::Style);
        let element = self.to.identifier("$$el");
        steps
            .mounted
            .push(self.call("$$styles", &[element, base, declarations]));
        Ok(())
    }

    pub(super) fn style_value(&mut self, value: &StyleValue) -> R<super::NodeIdentifier> {
        Ok(match value {
            StyleValue::Empty => self.to.write_string(""),
            StyleValue::Static(value) => self.to.write_string(value),
            StyleValue::Expression { expression, .. } | StyleValue::Shorthand(expression) => {
                self.render_read(*expression)?;
                self.template_expression(*expression)
            }
            StyleValue::Interpolated(parts) => self.interpolated(parts),
        })
    }

    pub(super) fn style_declarations(
        &mut self,
        attributes: &[Attribute],
    ) -> R<super::NodeIdentifier> {
        let mut declarations = Vec::new();
        for attribute in attributes {
            if let AttributeValue::Style { value, modifiers } = &attribute.value {
                let value = self.style_value(value)?;
                let important = self.to.write_boolean(
                    modifiers.contains(Modifiers::IMPORTANT),
                    SourceLocation::SYNTHETIC,
                );
                let value = self
                    .to
                    .array(&[value, important], SourceLocation::SYNTHETIC);
                let name = self
                    .to
                    .write_string(attribute.name.text(self.i.source_text));
                declarations.push(self.to.property(name, value, 0, SourceLocation::SYNTHETIC));
            }
        }
        self.helpers.insert(Helper::Style);
        Ok(self.to.object(&declarations, SourceLocation::SYNTHETIC))
    }
}
