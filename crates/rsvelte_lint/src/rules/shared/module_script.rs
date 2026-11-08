//! Port of `isModuleScript` in `eslint-plugin-svelte/src/utils/ast-utils.ts`.

use rsvelte_core::ast::template::{AttributeValue, AttributeValuePart, Script};

/// `<script module>` (a `module` attribute with any value) or
/// `<script context="module">` whose value is the single literal `module`.
pub fn is_module_script(script: &Script<'_>) -> bool {
    if script.attributes.iter().any(|attr| attr.name == "module") {
        return true;
    }
    script
        .attributes
        .iter()
        .find(|attr| attr.name == "context")
        .is_some_and(|attr| match &attr.value {
            AttributeValue::Sequence(parts) => matches!(
                parts.as_slice(),
                [AttributeValuePart::Text(text)] if text.data == "module"
            ),
            _ => false,
        })
}
