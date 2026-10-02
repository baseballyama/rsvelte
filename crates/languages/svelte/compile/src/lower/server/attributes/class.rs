use crate::lower::server::{
    Attribute, AttributeValue, Kind, NodeIdentifier, ServerCompilationContext, SourceLocation,
    runtime_call,
};

impl ServerCompilationContext<'_> {
    /// Upstream `build_attr_class`.
    pub(super) fn attribute_class(
        &mut self,
        directives: &[&Attribute],
        value: NodeIdentifier,
        hash: Option<&str>,
    ) -> NodeIdentifier {
        let directives = (!directives.is_empty()).then(|| {
            let props: Vec<NodeIdentifier> = directives
                .iter()
                .map(|d| {
                    let AttributeValue::Class(e) = d.value else {
                        unreachable!("class directives")
                    };
                    let key = self.out.write_string(d.name.text(self.source_text));
                    let v = self.expression(e);
                    self.out.property(key, v, 0, SourceLocation::SYNTHETIC)
                })
                .collect();
            self.out.object(&props, SourceLocation::SYNTHETIC)
        });
        let mut value = value;
        let mut stylesheet_hash = None;
        if let Some(h) = hash {
            if matches!(self.out.kind(value), Kind::String) {
                let v = self.out.str_value(value, self.source_text);
                value = self.out.write_string(format!("{v} {h}").trim());
            } else {
                stylesheet_hash = Some(self.out.write_string(h));
            }
        }
        runtime_call(
            &mut self.out,
            "attr_class",
            vec![Some(value), stylesheet_hash, directives],
        )
    }
}
