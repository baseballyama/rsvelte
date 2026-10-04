use super::{
    Attribute, AttributeValue, Builder, Helper, Part, R, SourceLocation, Steps, attribute, bound,
    vue,
};

impl Builder<'_, '_> {
    pub(super) fn special_boolean_attribute(
        &mut self,
        source: &Attribute,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
    ) -> R<()> {
        let name = source.name.text(self.i.source_text);
        if self.i.server || name == "hidden" {
            match &source.value {
                AttributeValue::Static(value) => {
                    props.push(attribute(source, Some(value)));
                    return Ok(());
                }
                AttributeValue::Boolean => {
                    props.push(attribute(source, None));
                    return Ok(());
                }
                _ => {}
            }
        }
        let value = match &source.value {
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
            _ => unreachable!("a plain attribute"),
        };
        if self.i.server {
            let value = if name == "hidden" {
                value
            } else {
                self.helpers.insert(Helper::BooleanServer);
                self.call("$$bool", &[value])
            };
            props.push(bound(name, source.name.span(), value, source.span));
        } else if name == "muted" {
            let value = self.call("Boolean", &[value]);
            props.push(bound(name, source.name.span(), value, source.span));
        } else {
            self.helpers.insert(Helper::SpecialAttribute);
            let element = self.to.identifier("$$el");
            let helper = if name == "hidden" {
                "$$hidden"
            } else {
                "$$autofocus"
            };
            steps.mounted.push(self.call(helper, &[element, value]));
        }
        Ok(())
    }
}
