use super::{
    Attribute, AttributeValue, Builder, Helper, Kind, NodeIdentifier, R, SourceLocation, Steps,
    bound, static_type, unsupported, vue,
};

impl Builder<'_, '_> {
    pub(super) fn bind_group(
        &mut self,
        attribute: &Attribute,
        target: NodeIdentifier,
        attributes: &[Attribute],
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
    ) -> R<()> {
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
            Some(AttributeValue::Static(value)) => self.to.write_string(value),
            Some(
                AttributeValue::Expression { expression, .. }
                | AttributeValue::Shorthand(expression),
            ) => {
                self.render_read(*expression)?;
                self.template_expression(*expression)
            }
            None => self.to.write_string("on"),
            _ => return Err(unsupported("this group value", attribute.span)),
        };
        self.helpers.insert(Helper::Group);
        let current = self.binding_read(target);
        if self.i.server {
            let checkbox = self.to.write_boolean(checkbox, SourceLocation::SYNTHETIC);
            let checked = self.call("$$group_checked", &[current, option, checkbox]);
            props.push(bound(
                "checked",
                attribute.name.span(),
                checked,
                attribute.span,
            ));
        } else {
            let element = self.to.identifier("$$el");
            let owner = self.to.identifier("$$instance_groups");
            let (key, property) = match self.i.javascript.kind(target) {
                Kind::Member {
                    object,
                    property,
                    computed,
                    ..
                } => {
                    let key = self.template_expression(object);
                    let property = if computed {
                        self.template_expression(property)
                    } else {
                        self.to.write_string(self.i.javascript.name(property))
                    };
                    (key, property)
                }
                Kind::Identifier(_) => {
                    let target_ref = self.template_expression(target);
                    let key = self.call("$$group_source", &[target_ref]);
                    (key, self.to.null(SourceLocation::SYNTHETIC))
                }
                _ => return Err(unsupported("this group binding target", attribute.span)),
            };
            let getter = self
                .to
                .arrow(&[], current, true, false, SourceLocation::SYNTHETIC);
            let value = self.to.identifier("$$value");
            let assign = self.binding_write(target, value);
            let setter = self
                .to
                .arrow(&[value], assign, true, false, SourceLocation::SYNTHETIC);
            steps.mounted.push(self.call(
                "$$group",
                &[element, owner, key, property, getter, setter, option],
            ));
        }
        Ok(())
    }
}
