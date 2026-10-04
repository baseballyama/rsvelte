use rsvelte_typescript::copy::{Verbatim, copy};
use rsvelte_typescript::scope::BindingIdentifier;
use rsvelte_typescript::syntax_tree::flag;

use super::{Builder, Kind, NodeIdentifier, SYNTHETIC};

impl Builder<'_> {
    fn optional_parameter(&mut self, argument: NodeIdentifier) -> NodeIdentifier {
        let name = self.to.identifier("value");
        let undefined = self.to.identifier("undefined");
        let field = self.to.property(name, undefined, 0, SYNTHETIC);
        let fallback = self.to.object(&[field], SYNTHETIC);
        self.to.assign_pat(argument, fallback, SYNTHETIC)
    }

    pub(super) fn scope_parameters(
        &mut self,
        parameters: &[NodeIdentifier],
        body: &mut Vec<NodeIdentifier>,
        optional: bool,
    ) -> (Vec<NodeIdentifier>, Vec<BindingIdentifier>) {
        let mut output = Vec::with_capacity(parameters.len());
        let mut added = Vec::new();
        for &parameter in parameters {
            let (pattern, default) = match self.input.javascript.kind(parameter) {
                Kind::AssignPattern(pattern, default) => (pattern, Some(default)),
                _ => (parameter, None),
            };
            let bindings: Vec<_> =
                crate::compilation::patterns::names(&self.input.javascript, pattern)
                    .into_iter()
                    .filter_map(|node| {
                        self.resolution
                            .sem
                            .binding_of(node)
                            .map(|binding| (node, binding))
                    })
                    .collect();
            if matches!(self.input.javascript.kind(parameter), Kind::Identifier(_)) {
                let argument = copy(
                    &self.input.javascript,
                    &mut self.to,
                    &mut Verbatim,
                    parameter,
                );
                let argument = if optional {
                    self.optional_parameter(argument)
                } else {
                    argument
                };
                output.push(argument);
            } else {
                let argument = self.name();
                let signature = if optional {
                    self.optional_parameter(argument)
                } else {
                    argument
                };
                output.push(signature);
                let mut value = self.to.dot(argument, "value");
                if let Some(default) = default {
                    let undefined = self.to.identifier("undefined");
                    let test = self.to.binary(
                        rsvelte_typescript::operators::BinaryOperator::StrictEq,
                        value,
                        undefined,
                        SYNTHETIC,
                    );
                    let default = self.expression(default);
                    value = self.to.cond(test, default, value, SYNTHETIC);
                }
                let pattern = self.copy_expression(pattern);
                let declaration = self.to.let_(flag::CONST, pattern, Some(value));
                let names: Vec<_> = bindings
                    .iter()
                    .map(|&(node, _)| self.to.identifier(self.input.javascript.name(node)))
                    .collect();
                let values = self.to.array(&names, SYNTHETIC);
                let result = self.to.return_(Some(values), SYNTHETIC);
                let block = self.to.block(&[declaration, result], SYNTHETIC);
                let getter = self.to.arrow(&[], block, false, false, SYNTHETIC);
                let getter = self.tracked_callback(getter);
                let computed = self.call("computed", &[getter]);
                let selected = self.declare(computed, body);
                for (index, &(node, _)) in bindings.iter().enumerate() {
                    let values = self.to.dot(selected, "value");
                    let index = self.to.write_number(
                        f64::from(u32::try_from(index).expect("patterns use u32 nodes")),
                        SYNTHETIC,
                    );
                    let value = self.to.member(values, index, true, false, SYNTHETIC);
                    let getter = self.to.arrow(&[], value, true, false, SYNTHETIC);
                    let value = self.call("computed", &[getter]);
                    let name = self.to.identifier(self.input.javascript.name(node));
                    body.push(self.to.let_(flag::CONST, name, Some(value)));
                }
            }
            added.extend(
                bindings
                    .into_iter()
                    .map(|(_, binding)| binding)
                    .filter(|&binding| self.loop_bindings.insert(binding)),
            );
        }
        (output, added)
    }
}
