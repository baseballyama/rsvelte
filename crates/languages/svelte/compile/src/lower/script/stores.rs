//! Upstream's `store_sub` transforms: a `$name` reads, writes and updates the store `name`.

use oxc_allocator::{CloneIn, GetAllocator, TakeIn};
use oxc_ast::ast::{
    AssignmentOperator, AssignmentTarget, Expression, Ident, IdentifierReference,
    SimpleAssignmentTarget, UpdateOperator,
};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_span::SPAN;
use oxc_syntax::symbol::SymbolFlags;

use super::super::javascript::member_root;
use super::super::{Builder, Target};
use super::ScriptRewrite;
use crate::lower::builder::Runtime;

impl<'o> ScriptRewrite<'_, 'o> {
    /// Whether `identifier` reads a store subscription: a `$name` that no binding declares.
    pub(in crate::lower) fn is_store(&self, identifier: &IdentifierReference<'_>) -> bool {
        identifier.name.starts_with('$')
            && self.res.symbol(identifier).is_none_or(|symbol| {
                (self.res.scoping().symbol_flags(symbol)).contains(SymbolFlags::Ambient)
            })
            && self.res.is_store_subscription(&identifier.name)
    }

    /// The store a subscription reads, as upstream's `build_getter` reads it at the top level.
    fn store(&self, identifier: &IdentifierReference<'_>) -> Expression<'o> {
        self.store_of(&identifier.name)
    }

    /// The store the subscription `subscription` (`$name`) reads.
    pub(in crate::lower) fn store_of(&self, subscription: &str) -> Expression<'o> {
        let name = &subscription[1..];
        (self.res.scoping())
            .find_binding(self.res.instance_scope(), Ident::from(name))
            .and_then(|symbol| self.read_symbol(symbol, name, SPAN))
            .unwrap_or_else(|| self.b.id(name))
    }

    pub(super) fn store_read(&self, identifier: &IdentifierReference<'_>) -> Expression<'o> {
        let b = self.b;
        let x = || b.id_at(&identifier.name, identifier.span);
        match self.target {
            Target::Client
                if self.untracked.is_some() && self.untracked == identifier.reference_id.get() =>
            {
                b.runtime("untrack", [x()])
            }
            Target::Client => b.call(x(), []),
            Target::Server => b.runtime(
                "store_get",
                [
                    subscriptions(b),
                    b.string(&identifier.name),
                    self.store(identifier),
                ],
            ),
        }
    }

    /// `$name = value` sets the store; a write through a member of `$name` mutates it.
    pub(super) fn store_assign(&mut self, it: &mut Expression<'o>) -> Option<Expression<'o>> {
        let b = self.b;
        let Expression::AssignmentExpression(assignment) = it else {
            return None;
        };
        if let AssignmentTarget::AssignmentTargetIdentifier(target) = &assignment.left {
            if !self.is_store(target) {
                return None;
            }
            let operator = assignment.operator;
            let current = (operator != AssignmentOperator::Assign).then(|| self.store_read(target));
            let store = match self.target {
                Target::Client => self.store(target),
                Target::Server => b.id(&target.name[1..]),
            };
            let mut value = assignment.right.take_in(b);
            self.visit_expression(&mut value);
            let value = super::writes::assignment_value(b, operator, current, value);
            return Some(b.runtime("store_set", [store, value]));
        }
        let root = member_root(assignment.left.as_member_expression()?.object())?;
        if !self.is_store(root) {
            return None;
        }
        let (prefix, arguments) = self.mutation(root)?;
        walk_mut::walk_assignment_expression(self, assignment);
        Some(self.mutate(prefix, arguments, it.take_in(b)))
    }

    /// `target = $$value`, the setter of a binding to `target`, when `target` writes a store.
    pub(in crate::lower) fn store_binding(
        &mut self,
        target: &Expression<'_>,
    ) -> Option<Expression<'o>> {
        let root = member_root(target)?;
        if !self.is_store(root) {
            return None;
        }
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
        self.store_assign(&mut assignment)
    }

    /// `$.invalidate_store($$stores, '$name')` after a write through a member of an `{#each}` item
    /// whose collection reads `$name`.
    pub(super) fn invalidation(&self, it: &Expression<'_>) -> Option<Expression<'o>> {
        match it {
            Expression::AssignmentExpression(a) => {
                self.invalidation_of(a.left.as_member_expression()?.object())
            }
            Expression::UpdateExpression(u) => {
                self.invalidation_of(u.argument.as_member_expression()?.object())
            }
            _ => None,
        }
    }

    /// [`ScriptRewrite::invalidation`] of a write through a member of `object`.
    pub(in crate::lower) fn invalidation_of(
        &self,
        object: &Expression<'_>,
    ) -> Option<Expression<'o>> {
        let store = self
            .invalidates?
            .get(&self.res.symbol(member_root(object)?)?)?;
        let b = self.b;
        Some(b.runtime("invalidate_store", [b.id("$$stores"), b.string(store)]))
    }

    /// `$name++` updates the store; `$name.x++` mutates it.
    pub(super) fn store_update(&mut self, it: &mut Expression<'o>) -> Option<Expression<'o>> {
        let b = self.b;
        let Expression::UpdateExpression(update) = it else {
            return None;
        };
        let decrement = (update.operator == UpdateOperator::Decrement).then(|| b.number(-1.0));
        if let SimpleAssignmentTarget::AssignmentTargetIdentifier(argument) = &update.argument {
            if !self.is_store(argument) {
                return None;
            }
            let x = b.id_at(&argument.name, argument.span);
            let call = match (self.target, update.prefix) {
                (Target::Client, true) => "update_pre_store",
                (Target::Server, true) => "update_store_pre",
                (_, false) => "update_store",
            };
            let arguments: Vec<_> = match self.target {
                Target::Client => vec![self.store(argument), b.call(x, [])],
                Target::Server => vec![
                    subscriptions(b),
                    b.string(&argument.name),
                    b.id(&argument.name[1..]),
                ],
            };
            return Some(b.runtime(call, arguments.into_iter().chain(decrement)));
        }
        let root = member_root(update.argument.as_member_expression()?.object())?;
        if !self.is_store(root) || self.target == Target::Server {
            return None;
        }
        let (prefix, arguments) = self.mutation(root)?;
        walk_mut::walk_update_expression(self, update);
        Some(self.mutate(prefix, arguments, it.take_in(b)))
    }

    /// The arguments of `$.store_mutate` around the mutation of the store `root` subscribes to;
    /// `None` where upstream's server leaves a mutation of an undeclared store as written.
    fn mutation(
        &mut self,
        root: &IdentifierReference<'_>,
    ) -> Option<(Vec<Expression<'o>>, Option<Expression<'o>>)> {
        let b = self.b;
        match self.target {
            Target::Client => {
                self.untracked = root.reference_id.get();
                let untracked = b.runtime("untrack", [b.id_at(&root.name, root.span)]);
                Some((vec![self.store(root)], Some(untracked)))
            }
            Target::Server => {
                let name = &root.name[1..];
                (self.res.scoping())
                    .find_binding(self.res.instance_scope(), Ident::from(name))
                    .map(|_| {
                        let prefix = vec![subscriptions(b), b.string(&root.name), b.id(name)];
                        (prefix, None)
                    })
            }
        }
    }

    fn mutate(
        &mut self,
        mut arguments: Vec<Expression<'o>>,
        untracked: Option<Expression<'o>>,
        mutation: Expression<'o>,
    ) -> Expression<'o> {
        self.untracked = None;
        arguments.push(mutation);
        arguments.extend(untracked);
        self.b.runtime("store_mutate", arguments)
    }
}

/// `$$store_subs ??= {}`: the server's subscriptions, made at the first read.
fn subscriptions<'o>(b: &Builder<'o>) -> Expression<'o> {
    let target =
        SimpleAssignmentTarget::new_assignment_target_identifier(SPAN, b.str("$$store_subs"), b);
    b.assign(
        AssignmentOperator::LogicalNullish,
        target.into(),
        b.object(Vec::new()),
    )
}
