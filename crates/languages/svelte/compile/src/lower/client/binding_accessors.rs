use super::{AssignmentOperator, ClientCompilationContext, Kind, NodeIdentifier, SourceLocation};
use crate::lower::BindingKind;

impl ClientCompilationContext<'_> {
    pub(super) fn binding_accessors(
        &mut self,
        expression: NodeIdentifier,
        primitive: bool,
    ) -> (NodeIdentifier, NodeIdentifier) {
        if let Kind::Sequence([get, set]) = self.javascript.kind(expression) {
            return (self.expression(*get), self.expression(*set));
        }
        let get = self.expression(expression);
        let get = self.thunk(get);
        let set = self.binding_setter(expression, primitive);
        (get, set)
    }

    pub(super) fn binding_setter(
        &mut self,
        expression: NodeIdentifier,
        primitive: bool,
    ) -> NodeIdentifier {
        if let Kind::Sequence([_, set]) = self.javascript.kind(expression) {
            return self.expression(*set);
        }
        let value = self.out.identifier("$$value");
        let assignment = if let Kind::Identifier(_) = self.javascript.kind(expression) {
            let target = self.out.identifier(self.javascript.name(expression));
            match self.res.binding(expression) {
                Some((binding, info)) if self.res.is_state_source(binding) => {
                    let mut arguments = vec![target, value];
                    if !primitive && info.kind == BindingKind::State {
                        arguments.push(self.tru());
                    }
                    self.out.runtime("$", "set", &arguments)
                }
                Some((binding, _)) if self.res.is_prop_source(binding) => {
                    self.out.call0(target, &[value])
                }
                _ => self.out.assign(
                    AssignmentOperator::Assign,
                    target,
                    value,
                    SourceLocation::SYNTHETIC,
                ),
            }
        } else {
            let target = self.expression_with_rest_reads(expression, false);
            self.out.assign(
                AssignmentOperator::Assign,
                target,
                value,
                SourceLocation::SYNTHETIC,
            )
        };
        let parameter = self.out.identifier("$$value");
        let set = self.out.arrow(
            &[parameter],
            assignment,
            true,
            false,
            SourceLocation::SYNTHETIC,
        );
        self.unthunk(set)
    }
}
