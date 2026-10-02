use super::{
    Attribute, NodeIdentifier, R, ServerCompilationContext, SourceLocation, check_binding,
    is_boolean_attribute,
};

impl ServerCompilationContext<'_> {
    /// Upstream `BindDirective` (server): the bound value as an attribute.
    pub(super) fn binding(
        &mut self,
        a: &Attribute,
        tag: &str,
        list: &[Attribute],
    ) -> R<NodeIdentifier> {
        let e = check_binding(self.javascript, self.res, self.source_text, tag, list, a)?;
        let name = a.name.text(self.source_text).to_ascii_lowercase();
        let value = self.expression(e);
        let n = self.out.write_string(&name);
        let mut arguments = vec![n, value];
        if is_boolean_attribute(&name) {
            arguments.push(self.out.write_boolean(true, SourceLocation::SYNTHETIC));
        }
        Ok(self.out.runtime("$", "attr", &arguments))
    }
}
