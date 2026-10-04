use crate::lower::client::{
    Attribute, AttributeValue, ClientCompilationContext, CompilerNodeIdentifier, Frag, Kind, Lists,
    NodeIdentifier, SourceLocation, event_attribute, flag, init_property, normalize_attribute,
};

impl ClientCompilationContext<'_> {
    /// Upstream `build_attribute_effect`: every attribute and spread, in order, as one object the
    /// runtime diffs, with its own memoized values.
    pub(in crate::lower::client) fn attribute_effect(
        &mut self,
        identifier: CompilerNodeIdentifier,
        tag: &str,
        attributes: &[Attribute],
        node: &str,
        remove_defaults: bool,
        l: &mut Lists,
    ) {
        let mut memo = Frag::default();
        let mut values = Vec::with_capacity(attributes.len());
        let mut class_directives = Vec::new();
        for a in attributes {
            match a.value {
                AttributeValue::Bind(_) | AttributeValue::Attach(_) | AttributeValue::On { .. } => {
                    continue;
                }
                AttributeValue::Class(_) => {
                    class_directives.push(a);
                    continue;
                }
                AttributeValue::Spread(e) => {
                    let meta = self.an.meta(e);
                    let built = self.expression(e);
                    let v = self.memoize(&mut memo, built, meta);
                    values.push(self.out.spread(v, SourceLocation::SYNTHETIC));
                    continue;
                }
                _ => {}
            }
            let (value, _) = self.attribute_value(a, &mut memo);
            let raw_name = a.name.text(self.source_text);
            if event_attribute(self.source_text, a).is_some()
                && matches!(
                    self.out.kind(value),
                    Kind::Arrow { .. } | Kind::Function { .. }
                )
            {
                // A stable handler, so the runtime does not remove and re-add it on every update.
                let handler = self.names.generate("event_handler");
                l.initializer.push(self.var(&handler, value));
                let x = self.out.identifier(&handler);
                values.push(init_property(&mut self.out, raw_name, x));
            } else {
                let name = if tag == "select" && normalize_attribute(raw_name) == "defaultValue" {
                    "defaultValue"
                } else {
                    raw_name
                };
                values.push(init_property(&mut self.out, name, value));
            }
        }
        if !class_directives.is_empty() {
            let props: Vec<NodeIdentifier> = class_directives
                .iter()
                .map(|d| {
                    let AttributeValue::Class(e) = d.value else {
                        unreachable!("class directives")
                    };
                    let meta = self.an.meta(e);
                    let built = self.expression(e);
                    let v = self.memoize(&mut memo, built, meta);
                    init_property(&mut self.out, d.name.text(self.source_text), v)
                })
                .collect();
            let object = self.out.object(&props, SourceLocation::SYNTHETIC);
            let ns = self.out.identifier("$");
            let key = self.out.dot(ns, "CLASS");
            values.push(
                self.out
                    .property(key, object, flag::COMPUTED, SourceLocation::SYNTHETIC),
            );
        }
        let identifiers: Vec<NodeIdentifier> = (0..memo.memo.len())
            .map(|i| self.out.identifier(&format!("${i}")))
            .collect();
        let object = self.out.object(&values, SourceLocation::SYNTHETIC);
        let arrow = self
            .out
            .arrow(&identifiers, object, true, false, SourceLocation::SYNTHETIC);
        let sync = (!memo.memo.is_empty()).then(|| {
            let thunks: Vec<NodeIdentifier> = std::mem::take(&mut memo.memo)
                .into_iter()
                .map(|m| {
                    self.out
                        .arrow(&[], m, true, false, SourceLocation::SYNTHETIC)
                })
                .collect();
            self.out.array(&thunks, SourceLocation::SYNTHETIC)
        });
        let hash = if self.an.scoped[identifier] {
            self.identity.stylesheet_hash.clone()
        } else {
            None
        };
        let hash = hash.map(|h| self.out.write_string(&h));
        let remove = remove_defaults.then(|| self.tru());
        let x = self.out.identifier(node);
        let call = self.call(
            "attribute_effect",
            vec![Some(x), Some(arrow), sync, None, None, hash, remove],
        );
        l.initializer.push(self.statement(call));
    }
}
