use oxc_ast::ast::Expression;
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::ClientCompilationContext;
use crate::lower::BindingKind;
use crate::lower::script::mutated_bindable_prop;

impl<'o> ClientCompilationContext<'_, 'o> {
    pub(super) fn binding_accessors(
        &self,
        expression: ExpressionIdentifier,
        primitive: bool,
    ) -> (Expression<'o>, Expression<'o>) {
        if let Expression::SequenceExpression(s) = self.javascript.get_expression(expression)
            && let [get, set] = s.expressions.as_slice()
        {
            return (self.rewrite(get, true), self.rewrite(set, true));
        }
        let get = self.b.thunk(self.expression(expression));
        let set = self.binding_setter(expression, primitive);
        (get, set)
    }

    pub(super) fn binding_setter(
        &self,
        expression: ExpressionIdentifier,
        primitive: bool,
    ) -> Expression<'o> {
        if let Expression::SequenceExpression(s) = self.javascript.get_expression(expression)
            && let [_, set] = s.expressions.as_slice()
        {
            return self.rewrite(set, true);
        }
        let b = self.b;
        let assignment = self.binding_assignment(expression, primitive);
        crate::lower::builder::unthunk(b.arrow(b.params(["$$value"]), assignment))
    }

    /// `expression = $$value`, as the script rewrites an assignment to it.
    pub(super) fn binding_assignment(
        &self,
        expression: ExpressionIdentifier,
        primitive: bool,
    ) -> Expression<'o> {
        let b = self.b;
        let value = b.id("$$value");
        let source = self.javascript.get_expression(expression);
        if let Expression::Identifier(identifier) = source {
            let target = b.id(&identifier.name);
            match self.res.symbol(identifier) {
                Some(symbol) if self.res.is_state_source(symbol) => {
                    let mut arguments = vec![target, value];
                    if !primitive && self.res.binding(symbol).kind == BindingKind::State {
                        arguments.push(b.boolean(true));
                    }
                    b.runtime("set", arguments)
                }
                Some(symbol) if self.res.is_prop_source(symbol) => b.call(target, [value]),
                _ => b.assign_name(&identifier.name, value),
            }
        } else {
            let target = self.expression_with_rest_reads(expression, false);
            let mutation = b.assign_member(target, value);
            match mutated_bindable_prop(self.res, self.custom_element.is_some(), source) {
                Some(prop) => b.call(b.id_at(&prop.name, prop.span), [mutation, b.boolean(true)]),
                None => mutation,
            }
        }
    }
}
