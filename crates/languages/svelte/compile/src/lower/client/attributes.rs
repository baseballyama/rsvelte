mod class;
mod with_spread;
mod without_spread;

use super::{Attribute, AttributeValue, ClientCompilationContext, Memo, NodeIdentifier};

impl ClientCompilationContext<'_> {
    /// Upstream `build_attribute_value` (client).
    pub(super) fn attribute_value(
        &mut self,
        a: &Attribute,
        memo: &mut Memo,
        if_state: bool,
    ) -> (NodeIdentifier, bool) {
        match &a.value {
            AttributeValue::Boolean => (self.tru(), false),
            AttributeValue::Static(v) => (self.out.write_string(v), false),
            &(AttributeValue::Expression { expression, .. }
            | AttributeValue::Shorthand(expression)) => {
                let built = self.expression(expression);
                let has_state = self.an.meta(expression).has_state;
                (self.memoize(memo, expression, built, if_state), has_state)
            }
            AttributeValue::Interpolated(parts) => {
                let items = self.chunk_items(parts);
                self.template_chunk(&items, memo, if_state)
            }
            _ => {
                unreachable!("directives are lowered by `element`")
            }
        }
    }
}
