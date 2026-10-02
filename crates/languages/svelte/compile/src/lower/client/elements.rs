mod element_children;
mod input_defaults;
mod regular_element;
mod select_value;

use super::{
    AttributeValue, ClientCompilationContext, CompilerNodeIdentifier, NodeKind, event_attribute,
};

impl ClientCompilationContext<'_> {
    pub(super) fn is_static_element(&self, identifier: CompilerNodeIdentifier) -> bool {
        let NodeKind::Element(el) = &self.compiler_syntax_tree.node(identifier).kind else {
            return false;
        };
        if self.an.dynamic[identifier] {
            return false;
        }
        let tag = el.name.text(self.source_text);
        if tag.contains('-') {
            return false;
        }
        for a in self.compiler_syntax_tree.attributes(el.attributes) {
            let n = a.name.text(self.source_text);
            if event_attribute(self.source_text, a).is_some()
                || crate::lower::cannot_be_set_statically(n)
                || n == "dir"
            {
                return false;
            }
            if matches!(tag, "input" | "textarea" | "select") && matches!(n, "value" | "checked") {
                return false;
            }
            if tag == "option" && n == "value" {
                return false;
            }
            if !matches!(a.value, AttributeValue::Boolean | AttributeValue::Static(_)) {
                return false;
            }
        }
        true
    }
}
