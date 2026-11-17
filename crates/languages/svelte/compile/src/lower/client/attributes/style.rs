use oxc_ast::ast::Expression;
use rsvelte_svelte_semantic::compiler_syntax_tree::{Part, StyleValue};
use rsvelte_svelte_semantic::resolve::BindingKind;

use crate::lower::Target;
use crate::lower::builder::Runtime;
use crate::lower::client::{Attribute, AttributeValue, ClientCompilationContext, Lists, Memo};
use crate::lower::template::style_directives_object;

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream `build_set_style`; `attribute` is `None` for the empty `style` upstream's analysis
    /// adds.
    pub(in crate::lower::client) fn set_style(
        &self,
        node: &str,
        attribute: Option<&Attribute>,
        directives: &[&Attribute],
        memo: &mut Memo<'o>,
        l: &mut Lists<'o>,
    ) {
        let b = self.b;
        let (value, mut has_state) = attribute.map_or_else(
            || (b.string(""), false),
            |a| self.attribute_value(a, memo, false),
        );
        let mut prev = None;
        let mut next = None;
        let mut previous_id = None;
        if !directives.is_empty() {
            let (object, directives_state) = self.style_directives(directives, memo);
            next = Some(object);
            has_state |= directives_state;
            if has_state {
                let name = self.names.generate("styles");
                l.initializer.push(b.let_(&name, None));
                prev = Some(b.id(&name));
                previous_id = Some(name);
            } else {
                prev = Some(b.object([]));
            }
        }
        let mut set_style =
            b.runtime_some("set_style", vec![Some(b.id(node)), Some(value), prev, next]);
        if let Some(name) = previous_id {
            set_style = b.assign_name(&name, set_style);
        }
        let s = b.statement(set_style);
        if has_state {
            l.update.push(s);
        } else {
            l.initializer.push(s);
        }
    }

    /// Upstream `build_style_directives_object`: `{ name: value }`, or `[normal, important]`;
    /// whether a value reads state.
    pub(in crate::lower::client) fn style_directives(
        &self,
        directives: &[&Attribute],
        memo: &mut Memo<'o>,
    ) -> (Expression<'o>, bool) {
        let mut has_state = false;
        let object =
            style_directives_object(self.b, self.source_text, directives, Target::Client, |d| {
                let AttributeValue::Style { value, .. } = &d.value else {
                    unreachable!("style directives")
                };
                let (value, state) = self.style_value(value, memo);
                has_state |= state;
                value
            });
        (object, has_state)
    }

    /// A directive's value, memoized as a whole as upstream's `memoizer.add` does.
    fn style_value(&self, value: &StyleValue, memo: &mut Memo<'o>) -> (Expression<'o>, bool) {
        match value {
            StyleValue::Static(v) => (self.b.string(v), false),
            // Upstream's analysis takes a bound name, a `$store` among them, for state unless it is
            // an ordinary binding; an unbound name is not state.
            &StyleValue::Shorthand(expression) => {
                let Expression::Identifier(identifier) = self
                    .javascript
                    .get_expression(expression)
                    .get_inner_expression()
                else {
                    unreachable!("a shorthand reads its name")
                };
                let has_state = self.res.symbol(identifier).map_or_else(
                    || self.res.is_store_subscription(&identifier.name),
                    |symbol| self.res.binding(symbol).kind != BindingKind::Normal,
                );
                (self.expression(expression), has_state)
            }
            &StyleValue::Expression { expression, .. } => {
                let built = self.expression(expression);
                let has_state = self.an.meta(expression).has_state;
                (self.memoize(memo, expression, built, false), has_state)
            }
            // Upstream memoizes the whole chunk when a part calls.
            StyleValue::Interpolated(parts)
                if parts.iter().any(|p| {
                    matches!(p, Part::Expression { expression, .. }
                        if self.an.meta(*expression).has_call)
                }) =>
            {
                let items = self.chunk_items(parts);
                let (value, has_state) = self.chunk(&items, None, false);
                (self.memoize_value(memo, value), has_state)
            }
            StyleValue::Interpolated(parts) => {
                let items = self.chunk_items(parts);
                self.template_chunk(&items, memo, false)
            }
            StyleValue::Empty => unreachable!(
                "coverage refuses a `style:` directive without a \
                value"
            ),
        }
    }
}
