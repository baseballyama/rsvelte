use crate::lower::bindings::binds;
use crate::lower::builder::Runtime;
use crate::lower::client::{
    Attribute, AttributeValue, ClientCompilationContext, Lists, is_directive,
};

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream's `$.remove_input_defaults` condition for an `<input>`; a binding is named by its
    /// property, so `bind:value` counts as a dynamic `value`. With a spread the runtime's
    /// `attribute_effect` removes them: returns whether it must.
    pub(super) fn remove_input_defaults(
        &self,
        attributes: &[Attribute],
        has_spread: bool,
        node: &str,
        l: &mut Lists<'o>,
    ) -> bool {
        let source_text = self.source_text;
        let has_value = attributes.iter().any(|a| {
            matches!(a.name.text(source_text), "value" | "checked")
                && !matches!(
                    a.value,
                    AttributeValue::Static(_) | AttributeValue::Class(_)
                )
        }) || binds(source_text, attributes, "group");
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
        let b = self.b;
        l.initializer
            .push(b.statement(b.runtime("remove_input_defaults", [b.id(node)])));
        false
    }

    /// Upstream's `$.remove_textarea_child` condition: the content is not the value.
    pub(super) fn remove_textarea_child(
        &self,
        attributes: &[Attribute],
        has_spread: bool,
        node: &str,
        l: &mut Lists<'o>,
    ) {
        let source_text = self.source_text;
        let named = |name| {
            attributes
                .iter()
                .find(|a| !is_directive(&a.value) && a.name.text(source_text) == name)
        };
        let reset = named("value")
            .or_else(|| named("checked"))
            .is_some_and(|a| !matches!(a.value, AttributeValue::Static(_)));
        let bound = attributes.iter().any(|a| {
            matches!(a.value, AttributeValue::Bind(_)) && a.name.text(source_text) == "value"
        });
        if has_spread || bound || reset {
            let b = self.b;
            l.initializer
                .push(b.statement(b.runtime("remove_textarea_child", [b.id(node)])));
        }
    }
}
