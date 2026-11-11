use oxc_ast::ast::{ArrowFunctionExpression, CallExpression, Expression, IdentifierReference};
use oxc_semantic::{SymbolFlags, SymbolId};

use super::globals::global_function;
use super::{Evaluator, Value, Values, add};
use crate::resolve::BindingKind;

impl Evaluator<'_> {
    /// The symbol `identifier` names: through its reference in the component's trees, by name in
    /// the evaluator's scope in a tree a task built.
    fn resolve(&self, identifier: &IdentifierReference<'_>) -> Option<SymbolId> {
        let scoping = self.res.scoping();
        match identifier.reference_id.get() {
            Some(reference) => scoping.get_reference(reference).symbol_id(),
            None => scoping.find_binding(self.scope?, identifier.name),
        }
    }

    pub(super) fn identifier(&mut self, identifier: &IdentifierReference<'_>, values: &mut Values) {
        let Some(symbol) = self.resolve(identifier) else {
            if identifier.name == "undefined" {
                add(values, Value::Undefined);
            } else {
                add(values, Value::Unknown);
            }
            return;
        };
        let info = *self.res.binding(symbol);
        // Upstream: an `{#each}` index's initial value is the block, which evaluates to a number.
        if matches!(
            info.kind,
            BindingKind::StaticIndex | BindingKind::KeyedIndex
        ) {
            add(values, Value::AnyNumber);
            return;
        }
        let is_prop = matches!(
            info.kind,
            BindingKind::Property | BindingKind::BindableProperty | BindingKind::RestProperty
        );
        let updated = self.res.writes(symbol) > 0 || self.res.mutations(symbol) > 0;
        if !updated && !is_prop {
            if self
                .res
                .scoping()
                .symbol_flags(symbol)
                .contains(SymbolFlags::Function)
            {
                add(values, Value::AnyFunction);
                return;
            }
            if let Some(initializer) = self.res.initializer(symbol) {
                // Cycles follow bindings, not the acyclic expression tree.
                if self.in_progress.insert(symbol.index()) {
                    self.eval_into(initializer, values);
                    self.in_progress.remove(symbol.index());
                } else {
                    add(values, Value::Unknown);
                }
                return;
            }
        }
        add(values, Value::Unknown);
    }

    pub(super) fn call(
        &mut self,
        e: &Expression<'_>,
        call: &CallExpression<'_>,
        values: &mut Values,
    ) {
        // In scope too: an identifier of a built tree leads to its binding's initializer, an input
        // node.
        if let Some((rune, argument)) = self.res.rune(e) {
            match rune {
                "$state" | "$state.raw" | "$derived" => match argument {
                    Some(a) => self.eval_into(a, values),
                    None => add(values, Value::Undefined),
                },
                "$derived.by" => match argument.and_then(expression_body) {
                    Some(body) => self.eval_into(body, values),
                    None => add(values, Value::Unknown),
                },
                _ => add(values, Value::Unknown),
            }
            return;
        }
        if let Some(path) = self.global_keypath(&call.callee)
            && let Some((kind, fold)) = global_function(path)
        {
            let arguments = &call.arguments;
            let mut inline = [Value::Undefined, Value::Undefined];
            let mut overflow = Vec::new();
            let known = if arguments.len() <= inline.len() {
                &mut inline[..arguments.len()]
            } else {
                overflow.resize_with(arguments.len(), || Value::Undefined);
                overflow.as_mut_slice()
            };
            let mut all_known = true;
            let mut has_bigint = false;
            for (argument, value) in arguments.iter().zip(known.iter_mut()) {
                let Some(argument) = argument.as_expression() else {
                    all_known = false;
                    *value = Value::Unknown;
                    continue;
                };
                let evaluation = self.evaluate_inner(argument);
                all_known &= evaluation.is_known();
                has_bigint |= matches!(evaluation.value(), Value::BigInt(_));
                *value = evaluation.into_value();
            }
            if path.0 == "Math" && has_bigint {
                add(values, Value::Unknown);
            } else if let Some(fold) = fold.filter(|_| all_known) {
                add(values, fold(known));
            } else {
                add(values, kind);
            }
            return;
        }
        add(values, Value::Unknown);
    }

    /// A global, or a property of one: `name` or `name.member`, when `name` is not bound.
    pub(super) fn global_keypath<'e>(
        &self,
        e: &'e Expression<'_>,
    ) -> Option<(&'e str, Option<&'e str>)> {
        let (root, member) = match e {
            Expression::Identifier(identifier) => (identifier, None),
            Expression::StaticMemberExpression(member) => match &member.object {
                Expression::Identifier(object) => (object, Some(member.property.name.as_str())),
                _ => return None,
            },
            _ => return None,
        };
        self.resolve(root)
            .is_none()
            .then(|| (root.name.as_str(), member))
    }
}

/// The body of `() => body`.
fn expression_body<'a>(e: &'a Expression<'a>) -> Option<&'a Expression<'a>> {
    let Expression::ArrowFunctionExpression(arrow) = e else {
        return None;
    };
    arrow_expression(arrow)
}

fn arrow_expression<'a>(arrow: &'a ArrowFunctionExpression<'a>) -> Option<&'a Expression<'a>> {
    arrow.get_expression()
}
