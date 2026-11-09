use super::{
    Attribute, AttributeValue, NodeIdentifier, ServerCompilationContext, SourceLocation,
    is_boolean_attribute,
};

impl ServerCompilationContext<'_> {
    /// Upstream `BindDirective` (server): the bound value as an attribute.
    pub(super) fn binding(&mut self, a: &Attribute) -> NodeIdentifier {
        let AttributeValue::Bind(e) = a.value else {
            unreachable!("called on bindings")
        };
        let name = a.name.text(self.source_text).to_ascii_lowercase();
        let value = self.expression(e);
        let n = self.out.write_string(&name);
        let mut arguments = vec![n, value];
        if is_boolean_attribute(&name) {
            arguments.push(self.out.write_boolean(true, SourceLocation::SYNTHETIC));
        }
        self.out.runtime("$", "attr", &arguments)
    }
}
