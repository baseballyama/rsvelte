use crate::lower::client::{
    Attribute, AttributeValue, ClientCompilationContext, Lists, is_directive,
};

impl ClientCompilationContext<'_> {
    /// Upstream's `$.remove_input_defaults` condition for an `<input>`; a binding is named by its
    /// property, so `bind:value` counts as a dynamic `value`. With a spread the runtime's
    /// `attribute_effect` removes them: returns whether it must.
    pub(super) fn remove_input_defaults(
        &mut self,
        attributes: &[Attribute],
        has_spread: bool,
        node: &str,
        l: &mut Lists,
    ) -> bool {
        let source_text = self.source_text;
        let has_value = attributes.iter().any(|a| {
            matches!(a.name.text(source_text), "value" | "checked")
                && !matches!(
                    a.value,
                    AttributeValue::Static(_) | AttributeValue::Class(_)
                )
        });
        let has_default_value = attributes.iter().any(|a| {
            !is_directive(&a.value)
                && matches!(a.name.text(source_text), "defaultValue" | "defaultChecked")
        });
        if has_default_value || !(has_spread || has_value) {
            return false;
        }
        if has_spread {
            return true;
        }
        let x = self.out.identifier(node);
        let call = self.call("remove_input_defaults", vec![Some(x)]);
        l.initializer.push(self.statement(call));
        false
    }
}
