//! Upstream's `assign`, `mutate` and `update` transforms of state, deriveds and props.

use oxc_allocator::TakeIn;
use oxc_ast::ast::{
    AssignmentOperator, AssignmentTarget, Expression, SimpleAssignmentTarget, UpdateOperator,
};
use oxc_ast_visit::{VisitMut, walk_mut};
use rsvelte_svelte_semantic::resolve::BindingKind;

use super::super::{Builder, Target};
use super::{ScriptRewrite, bindable_root, is_prop_source};
use crate::lower::builder::Runtime;

impl<'o> ScriptRewrite<'_, 'o> {
    /// The rewritten assignment `it`, or `None` when it stays as written.
    pub(super) fn assign(&mut self, it: &mut Expression<'o>) -> Option<Expression<'o>> {
        let Expression::AssignmentExpression(assignment) = it else {
            return None;
        };
        if self.target != Target::Client {
            return None;
        }
        let b = self.b;
        let AssignmentTarget::AssignmentTargetIdentifier(target) = &assignment.left else {
            let member = assignment.left.as_member_expression()?;
            let prop = bindable_root(self.res, self.accessors, member.object())
                .map(|root| b.id_at(&root.name, root.span))?;
            walk_mut::walk_assignment_expression(self, assignment);
            return Some(b.call(prop, [it.take_in(b), b.boolean(true)]));
        };
        let symbol = self.res.symbol(target)?;
        let info = self.res.binding(symbol);
        let state = self.res.is_state_source(symbol)
            || matches!(info.kind, BindingKind::Derived | BindingKind::DerivedBy);
        let prop = is_prop_source(self.res, self.accessors, symbol);
        if !state && !prop {
            return None;
        }
        let operator = assignment.operator;
        let proxy = info.kind == BindingKind::State
            && matches!(
                operator,
                AssignmentOperator::Assign
                    | AssignmentOperator::LogicalOr
                    | AssignmentOperator::LogicalAnd
                    | AssignmentOperator::LogicalNullish
            )
            && self.res.should_proxy(&assignment.right);
        let x = b.id_at(&target.name, target.span);
        // Upstream drops the subscription to the store a state held, which no longer holds it.
        let subscription = format!("${}", target.name);
        let unsubscribe = self.stores.contains(&subscription);
        let current = (operator != AssignmentOperator::Assign).then(|| self.read(target));
        let mut value = assignment.right.take_in(b);
        self.visit_expression(&mut value);
        let current = match current {
            Some(current) => Some(current?),
            None => None,
        };
        let value = assignment_value(b, operator, current, value);
        if prop {
            return Some(b.call(x, [value]));
        }
        let mut arguments = vec![x, value];
        if proxy {
            arguments.push(b.boolean(true));
        }
        let set = b.runtime("set", arguments);
        if unsubscribe {
            return Some(b.runtime(
                "store_unsub",
                [set, b.string(&subscription), b.id("$$stores")],
            ));
        }
        Some(set)
    }

    pub(super) fn update(&mut self, it: &mut Expression<'o>) -> Option<Expression<'o>> {
        let Expression::UpdateExpression(update) = it else {
            return None;
        };
        let b = self.b;
        let SimpleAssignmentTarget::AssignmentTargetIdentifier(argument) = &update.argument else {
            if self.target != Target::Client {
                return None;
            }
            let member = update.argument.as_member_expression()?;
            let prop = bindable_root(self.res, self.accessors, member.object())
                .map(|root| b.id_at(&root.name, root.span))?;
            walk_mut::walk_update_expression(self, update);
            return Some(b.call(prop, [it.take_in(b), b.boolean(true)]));
        };
        let symbol = self.res.symbol(argument)?;
        let info = self.res.binding(symbol);
        let derived = matches!(info.kind, BindingKind::Derived | BindingKind::DerivedBy);
        if self.target == Target::Server && !derived {
            return None;
        }
        let prefix = update.prefix;
        let name = if self.target == Target::Server {
            if prefix {
                "update_derived_pre"
            } else {
                "update_derived"
            }
        } else if self.res.is_state_source(symbol) || derived {
            if prefix { "update_pre" } else { "update" }
        } else if is_prop_source(self.res, self.accessors, symbol) {
            if prefix {
                "update_pre_prop"
            } else {
                "update_prop"
            }
        } else {
            return None;
        };
        let mut arguments = vec![b.id_at(&argument.name, argument.span)];
        if update.operator == UpdateOperator::Decrement {
            arguments.push(b.number(-1.0));
        }
        Some(b.runtime(name, arguments))
    }
}

/// Upstream `build_assignment_value`: `a += b` assigns `a + b`, `current` being `a` read through
/// its transform.
pub(super) fn assignment_value<'o>(
    b: &Builder<'o>,
    operator: AssignmentOperator,
    current: Option<Expression<'o>>,
    value: Expression<'o>,
) -> Expression<'o> {
    let Some(current) = current else {
        return value;
    };
    match (
        operator.to_logical_operator(),
        operator.to_binary_operator(),
    ) {
        (Some(l), _) => b.logical(current, l, value),
        (None, Some(binary)) => b.binary(current, binary, value),
        (None, None) => unreachable!("a compound assignment has an operator"),
    }
}
