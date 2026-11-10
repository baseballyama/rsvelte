mod class;
mod with_spread;
mod without_spread;

use oxc_ast::ast::Expression;

use super::{Attribute, AttributeValue, ClientCompilationContext, Memo};

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream `build_attribute_value` (client).
    pub(super) fn attribute_value(
        &self,
        a: &Attribute,
        memo: &mut Memo<'o>,
        if_state: bool,
    ) -> (Expression<'o>, bool) {
        match &a.value {
            AttributeValue::Boolean => (self.b.boolean(true), false),
            AttributeValue::Static(v) => (self.b.string(v), false),
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
