use oxc_ast::ast::Expression;
use rsvelte_svelte_semantic::compiler_syntax_tree::{Modifiers, StyleValue};
use rsvelte_svelte_semantic::resolve::BindingKind;

use crate::lower::builder::Runtime;
use crate::lower::client::{
    Attribute, AttributeValue, ClientCompilationContext, Lists, Memo, R, unsupported,
};

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
    ) -> R<()> {
        let b = self.b;
        let (value, mut has_state) = attribute.map_or_else(
            || (b.string(""), false),
            |a| self.attribute_value(a, memo, false),
        );
        let mut prev = None;
        let mut next = None;
        let mut previous_id = None;
        if !directives.is_empty() {
            let (object, directives_state) = self.style_directives(directives, memo)?;
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
        let s = b.stmt(set_style);
        if has_state {
            l.update.push(s);
        } else {
            l.initializer.push(s);
        }
        Ok(())
    }

    /// Upstream `build_style_directives_object`: `{ name: value }`, or `[normal, important]`;
    /// whether a value reads state.
    pub(in crate::lower::client) fn style_directives(
        &self,
        directives: &[&Attribute],
        memo: &mut Memo<'o>,
    ) -> R<(Expression<'o>, bool)> {
        let b = self.b;
        let mut normal = Vec::new();
        let mut important = Vec::new();
        let mut has_state = false;
        for d in directives {
            let AttributeValue::Style { value, modifiers } = &d.value else {
                unreachable!("style directives")
            };
            let (value, state) = self.style_value(d, value, memo)?;
            has_state |= state;
            let property = b.init(d.name.text(self.source_text), value);
            if modifiers.contains(Modifiers::IMPORTANT) {
                important.push(property);
            } else {
                normal.push(property);
            }
        }
        let object = if important.is_empty() {
            b.object(normal)
        } else {
            b.array([b.object(normal), b.object(important)])
        };
        Ok((object, has_state))
    }

    /// A directive's value, memoized as a whole as upstream's `memoizer.add` does.
    fn style_value(
        &self,
        d: &Attribute,
        value: &StyleValue,
        memo: &mut Memo<'o>,
    ) -> R<(Expression<'o>, bool)> {
        Ok(match value {
            StyleValue::Static(v) => (self.b.string(v), false),
            // Upstream's analysis takes the name for state unless it is an ordinary binding.
            &StyleValue::Shorthand(expression) => {
                let Expression::Identifier(identifier) =
                    self.javascript.get_expression(expression).get_inner_expression()
                else {
                    unreachable!("a shorthand reads its name")
                };
                let has_state = self
                    .res
                    .symbol(identifier)
                    .is_some_and(|symbol| self.res.binding(symbol).kind != BindingKind::Normal);
                (self.expression(expression), has_state)
            }
            &StyleValue::Expression { expression, .. } => {
                let built = self.expression(expression);
                let has_state = self.an.meta(expression).has_state;
                (self.memoize(memo, expression, built, false), has_state)
            }
            // Upstream memoizes the whole chunk, which has no one expression to key it by.
            StyleValue::Interpolated(parts)
                if parts.iter().any(|p| {
                    matches!(p, rsvelte_svelte_semantic::compiler_syntax_tree::Part::Expression { expression, .. }
                        if self.an.meta(*expression).has_call)
                }) =>
            {
                return unsupported("a call in a quoted `style:` value", d.span);
            }
            StyleValue::Interpolated(parts) => {
                let items = self.chunk_items(parts);
                self.template_chunk(&items, memo, false)
            }
            StyleValue::Empty => unreachable!("coverage refuses a `style:` directive without a value"),
        })
    }
}
