mod class;
mod with_spread;
mod without_spread;

use super::{Attribute, AttributeValue, ClientCompilationContext, Frag, NodeIdentifier};

impl ClientCompilationContext<'_> {
    /// Upstream `build_attribute_value` (client).
    pub(super) fn attribute_value(
        &mut self,
        a: &Attribute,
        frag: &mut Frag,
    ) -> (NodeIdentifier, bool) {
        match &a.value {
            AttributeValue::Boolean => (self.tru(), false),
            AttributeValue::Static(v) => (self.out.write_string(v), false),
            &(AttributeValue::Expression { expression, .. }
            | AttributeValue::Shorthand(expression)) => {
                let meta = self.an.meta(expression);
                let built = self.expression(expression);
                (self.memoize(frag, built, meta), meta.has_state)
            }
            AttributeValue::Interpolated(parts) => {
                let items = self.chunk_items(parts);
                self.template_chunk(&items, frag)
            }
            _ => {
                unreachable!("directives are lowered by `element`")
            }
        }
    }
}
