use super::{Attribute, Helper, Steps, Template};

impl<'t> Template<'_, '_, 't> {
    pub(super) fn custom_element_attribute(
        &mut self,
        attribute: &Attribute,
        steps: &mut Steps<'t>,
    ) {
        let value = self.plain_value(attribute);
        self.helpers.insert(Helper::CustomElementData);
        let name = self.b.string(attribute.name.text(self.i.source_text));
        let call = self.call("$$custom_element_data", [self.b.id("$$el"), name, value]);
        steps.mounted.push(call);
    }
}
