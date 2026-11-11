//! Upstream's `assign`, `mutate` and `update` transforms of state, deriveds and props.

use oxc_allocator::{CloneIn, GetAllocator, TakeIn};
use oxc_ast::ast::{
    AssignmentOperator, AssignmentTarget, Expression, IdentifierReference, SimpleAssignmentTarget,
    UpdateOperator,
};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_semantic::SymbolId;
use rsvelte_svelte_semantic::resolve::{BindingKind, Resolution};

use super::super::javascript::member_root;
use super::super::{Builder, Target};
use super::ScriptRewrite;
use crate::lower::builder::Runtime;

impl<'o> ScriptRewrite<'_, 'o> {
    /// `target = $$value`, rewritten: the setter of a binding to `target`.
    pub(in crate::lower) fn binding_assignment(
        &mut self,
        target: &Expression<'_>,
        primitive: bool,
    ) -> Expression<'o> {
        let b = self.b;
        let target = match target
            .get_inner_expression()
            .clone_in_with_semantic_ids(b.allocator())
        {
            Expression::Identifier(identifier) => {
                SimpleAssignmentTarget::AssignmentTargetIdentifier(identifier)
            }
            member => SimpleAssignmentTarget::from(member.into_member_expression()),
        };
        let mut assignment = b.assign(AssignmentOperator::Assign, target.into(), b.id("$$value"));
        self.primitive = primitive;
        self.visit_expression(&mut assignment);
        self.primitive = false;
        assignment
    }

    /// The rewritten assignment `it`, or `None` when it stays as written.
    pub(super) fn assign(&mut self, it: &mut Expression<'o>) -> Option<Expression<'o>> {
        let Expression::AssignmentExpression(assignment) = it else {
            return None;
        };
        let b = self.b;
        let AssignmentTarget::AssignmentTargetIdentifier(target) = &assignment.left else {
            if self.target != Target::Client {
                return None;
            }
            let member = assignment.left.as_member_expression()?;
            let prop = bindable_root(self.res, self.accessors, member.object())
                .map(|root| b.id_at(&root.name, root.span))?;
            walk_mut::walk_assignment_expression(self, assignment);
            return Some(b.call(prop, [it.take_in(b), b.boolean(true)]));
        };
        let symbol = self.res.symbol(target)?;
        let info = self.res.binding(symbol);
        let derived = matches!(info.kind, BindingKind::Derived | BindingKind::DerivedBy);
        // A prop, and the server's derived, are functions that a call with a value writes.
        let called = if self.target == Target::Client {
            is_prop_source(self.res, self.accessors, symbol)
        } else {
            derived
        };
        let state = self.target == Target::Client && (self.res.is_state_source(symbol) || derived);
        if !state && !called {
            return None;
        }
        let operator = assignment.operator;
        let proxy = !self.primitive
            && info.kind == BindingKind::State
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
        if called {
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

/// Upstream `is_prop_source`; a custom element's accessors read every prop through its signal.
pub(super) fn is_prop_source(res: &Resolution, accessors: bool, symbol: SymbolId) -> bool {
    res.is_prop_source(symbol)
        || (accessors
            && matches!(
                res.binding(symbol).kind,
                BindingKind::Property | BindingKind::BindableProperty
            ))
}

/// The `$bindable` prop with a signal that a write through a member of `object` writes:
/// upstream's `mutate` transform then tells the parent, `prop((prop().x = value), true)`.
fn bindable_root<'e>(
    res: &Resolution,
    accessors: bool,
    object: &'e Expression<'e>,
) -> Option<&'e IdentifierReference<'e>> {
    let root = member_root(object)?;
    let symbol = res.symbol(root)?;
    (res.binding(symbol).kind == BindingKind::BindableProperty
        && is_prop_source(res, accessors, symbol))
    .then_some(root)
}

/// Upstream's client `mutate` transform: a write through a member of state, a derived or a prop
/// is a rewrite, though in runes mode it keeps the mutation as it is.
pub(in crate::lower) fn mutates_signal(
    res: &Resolution,
    accessors: bool,
    object: &Expression<'_>,
) -> bool {
    (member_root(object))
        .and_then(|root| res.symbol(root))
        .is_some_and(|symbol| {
            res.is_state_source(symbol)
                || matches!(
                    res.binding(symbol).kind,
                    BindingKind::Derived | BindingKind::DerivedBy
                )
                || is_prop_source(res, accessors, symbol)
        })
}
