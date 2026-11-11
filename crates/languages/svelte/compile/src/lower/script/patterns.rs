//! Upstream `visit_assignment_expression` of a destructuring assignment: one assignment per path,
//! each through the transforms a plain assignment takes.

use oxc_allocator::{CloneIn, GetAllocator, TakeIn};
use oxc_ast::ast::{
    ArrowFunctionExpression, AssignmentOperator, AssignmentTarget, AssignmentTargetMaybeDefault,
    AssignmentTargetProperty, AwaitExpression, Class, Expression, ForStatementInit, Function,
    PropertyKey, SimpleAssignmentTarget, Statement,
};
use oxc_ast_visit::{Visit, VisitMut, walk_mut};
use oxc_syntax::scope::ScopeFlags;
use rsvelte_svelte_semantic::evaluate::Evaluator;
use rsvelte_svelte_semantic::resolve::Resolution;

use super::super::javascript::is_simple_expression;
use super::super::names::Names;
use super::super::{Builder, Target};
use super::ScriptRewrite;
use super::writes::mutates_signal;
use crate::lower::builder::Runtime;

impl<'o> ScriptRewrite<'_, 'o> {
    /// The rewritten destructuring assignment `it`, or `None` when no path it writes is
    /// transformed and it stays as written; `standalone` when it is a statement of its own.
    pub(super) fn pattern_assign(
        &mut self,
        it: &Expression<'o>,
        standalone: bool,
    ) -> Option<Expression<'o>> {
        let Expression::AssignmentExpression(assignment) = it else {
            return None;
        };
        if !matches!(
            assignment.left,
            AssignmentTarget::ArrayAssignmentTarget(_)
                | AssignmentTarget::ObjectAssignmentTarget(_)
        ) {
            return None;
        }
        let names = self.names?;
        let b = self.b;
        let mut value = assignment.right.clone_in_with_semantic_ids(b.allocator());
        self.visit_expression(&mut value);
        let cached = !matches!(value, Expression::Identifier(_));
        let rhs = if cached {
            b.id("$$value")
        } else {
            value.clone_in(b.allocator())
        };
        let left = assignment.left.clone_in_with_semantic_ids(b.allocator());
        let mut extract = Extract {
            b,
            res: self.res,
            names,
            inserts: Vec::new(),
            paths: Vec::new(),
        };
        extract.target(left, rhs.clone_in(b.allocator()));
        let Extract { inserts, paths, .. } = extract;
        let mut changed = false;
        let assignments: Vec<Expression<'o>> = (paths.into_iter())
            .map(|(target, value)| {
                let mut e = b.assign(AssignmentOperator::Assign, target, value);
                let mutates = self.target == Target::Client
                    && matches!(&e, Expression::AssignmentExpression(a)
                    if a.left.as_member_expression().is_some_and(|m| {
                        mutates_signal(self.res, self.accessors, m.object())
                    }));
                let rewritten = (self.class_assign(&mut e))
                    .or_else(|| self.store_assign(&mut e))
                    .or_else(|| self.assign(&mut e));
                changed |= mutates || rewritten.is_some();
                rewritten.unwrap_or_else(|| {
                    walk_mut::walk_expression(self, &mut e);
                    e
                })
            })
            .collect();
        if !changed {
            return None;
        }
        if inserts.is_empty() && !cached {
            let mut expressions = assignments;
            if !standalone {
                expressions.push(rhs);
            }
            return Some(b.sequence(expressions));
        }
        let asynchronous = is_async(&value) || assignments.iter().any(is_async);
        let mut statements: Vec<Statement<'o>> = (inserts.into_iter())
            .map(|(name, value)| b.var(&name, value))
            .chain(assignments.into_iter().map(|a| b.statement(a)))
            .collect();
        if !standalone {
            statements.push(b.return_(Some(rhs.clone_in(b.allocator()))));
        }
        let Expression::Identifier(parameter) = &rhs else {
            unreachable!("the value is a name or `$$value`")
        };
        let iife = b.arrow_block(
            b.parameters([parameter.name.as_str()]),
            statements,
            asynchronous,
        );
        let call = b.call(b.parenthesized(iife), [value]);
        Some(if asynchronous {
            Expression::new_await_expression(oxc_span::SPAN, call, b)
        } else {
            call
        })
    }
}

impl<'o> ScriptRewrite<'_, 'o> {
    /// `it`, walked; a destructuring assignment it holds directly is one upstream's
    /// `is_standalone` sees as a statement's child.
    pub(super) fn statement_patterns(&mut self, it: &mut Statement<'o>) {
        let b = self.b;
        // Each pattern is rewritten once, so it sits out the walk of the rest.
        let mut kept: Vec<(usize, Expression<'o>)> = Vec::new();
        let mut index = 0;
        each_direct(it, &mut |slot| {
            index += 1;
            if !is_pattern_assignment(slot.get_inner_expression()) {
                return;
            }
            let inner = without_parentheses(slot);
            match self.pattern_assign(inner, true) {
                Some(e) => *slot = e,
                None => walk_mut::walk_expression(self, without_parentheses(slot)),
            }
            kept.push((index, slot.take_in(b)));
        });
        walk_mut::walk_statement(self, it);
        if kept.is_empty() {
            return;
        }
        let mut kept = kept.into_iter().peekable();
        let mut index = 0;
        each_direct(it, &mut |slot| {
            index += 1;
            if let Some((_, e)) = kept.next_if(|&(at, _)| at == index) {
                *slot = e;
            }
        });
    }
}

fn is_pattern_assignment(e: &Expression<'_>) -> bool {
    matches!(e, Expression::AssignmentExpression(a) if matches!(
        a.left,
        AssignmentTarget::ArrayAssignmentTarget(_) | AssignmentTarget::ObjectAssignmentTarget(_)
    ))
}

fn without_parentheses<'s, 'o>(mut e: &'s mut Expression<'o>) -> &'s mut Expression<'o> {
    while let Expression::ParenthesizedExpression(p) = e {
        e = &mut p.expression;
    }
    e
}

/// The expressions `statement` holds as its own children, in order.
fn each_direct<'o>(statement: &mut Statement<'o>, f: &mut impl FnMut(&mut Expression<'o>)) {
    match statement {
        Statement::ExpressionStatement(s) => f(&mut s.expression),
        Statement::ReturnStatement(s) => s.argument.iter_mut().for_each(f),
        Statement::ThrowStatement(s) => f(&mut s.argument),
        Statement::IfStatement(s) => f(&mut s.test),
        Statement::WhileStatement(s) => f(&mut s.test),
        Statement::DoWhileStatement(s) => f(&mut s.test),
        Statement::SwitchStatement(s) => f(&mut s.discriminant),
        Statement::ForInStatement(s) => f(&mut s.right),
        Statement::ForOfStatement(s) => f(&mut s.right),
        Statement::ForStatement(s) => {
            if let Some(init) = s
                .init
                .as_mut()
                .and_then(ForStatementInit::as_expression_mut)
            {
                f(init);
            }
            s.test.iter_mut().for_each(&mut *f);
            s.update.iter_mut().for_each(f);
        }
        _ => {}
    }
}

/// Upstream `extract_paths` of an assignment's pattern: each written target with the value it
/// reads from the right-hand side, and the `$$array`s that hold its array patterns.
struct Extract<'b, 'r, 'o> {
    b: &'b Builder<'o>,
    res: &'r Resolution,
    names: &'r Names<'r>,
    inserts: Vec<(String, Expression<'o>)>,
    paths: Vec<(AssignmentTarget<'o>, Expression<'o>)>,
}

impl<'o> Extract<'_, '_, 'o> {
    fn target(&mut self, target: AssignmentTarget<'o>, value: Expression<'o>) {
        let b = self.b;
        match target {
            AssignmentTarget::ArrayAssignmentTarget(array) => {
                let array = array.unbox();
                #[expect(clippy::cast_precision_loss, reason = "a pattern has few elements")]
                let length = |n: usize| b.number(n as f64);
                let mut arguments = vec![value];
                if array.rest.is_none() {
                    arguments.push(length(array.elements.len()));
                }
                // Upstream names each array as it meets it, even one it then leaves as written.
                let name = self.names.generate("$$array");
                self.inserts
                    .push((name.clone(), b.runtime("to_array", arguments)));
                let count = array.elements.len();
                for (index, element) in array.elements.into_iter().enumerate() {
                    if let Some(element) = element {
                        self.element(element, b.computed(b.id(&name), length(index)));
                    }
                }
                if let Some(rest) = array.rest {
                    let value = b.call(b.member(b.id(&name), "slice"), [length(count)]);
                    self.target(rest.unbox().target, value);
                }
            }
            AssignmentTarget::ObjectAssignmentTarget(object) => {
                let object = object.unbox();
                let excluded: Vec<Expression<'o>> = if object.rest.is_some() {
                    object.properties.iter().map(|p| self.excluded(p)).collect()
                } else {
                    Vec::new()
                };
                for property in object.properties {
                    let value = value.clone_in(b.allocator());
                    match property {
                        AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(p) => {
                            let p = p.unbox();
                            let read = b.member(value, &p.binding.name);
                            let read = match p.init {
                                Some(init) => fallback(b, read, init),
                                None => read,
                            };
                            let name = SimpleAssignmentTarget::AssignmentTargetIdentifier(
                                oxc_allocator::Box::new_in(p.binding, b),
                            );
                            self.paths.push((name.into(), read));
                        }
                        AssignmentTargetProperty::AssignmentTargetPropertyProperty(p) => {
                            let p = p.unbox();
                            let read = match p.name {
                                PropertyKey::StaticIdentifier(key) if !p.computed => {
                                    b.member(value, &key.name)
                                }
                                key => b.computed(value, key.into_expression()),
                            };
                            self.element(p.binding, read);
                        }
                    }
                }
                if let Some(rest) = object.rest {
                    let value = b.runtime("exclude_from_object", [value, b.array(excluded)]);
                    self.target(rest.unbox().target, value);
                }
            }
            target => self.paths.push((target, value)),
        }
    }

    fn element(&mut self, element: AssignmentTargetMaybeDefault<'o>, value: Expression<'o>) {
        match element {
            AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(d) => {
                let d = d.unbox();
                let value = fallback(self.b, value, d.init);
                self.target(d.binding, value);
            }
            element => self.target(element.into_assignment_target(), value),
        }
    }

    /// A key `exclude_from_object` leaves out of the rest: its name as a string.
    fn excluded(&self, property: &AssignmentTargetProperty<'o>) -> Expression<'o> {
        let b = self.b;
        let (key, computed) = match property {
            AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(p) => {
                return b.string(&p.binding.name);
            }
            AssignmentTargetProperty::AssignmentTargetPropertyProperty(p) => (&p.name, p.computed),
        };
        match key {
            PropertyKey::StaticIdentifier(key) if !computed => b.string(&key.name),
            key @ (PropertyKey::StringLiteral(_) | PropertyKey::NumericLiteral(_)) => {
                let key = key.as_expression().expect("a literal key");
                let value = Evaluator::new(self.res).evaluate(key).value;
                b.string(&value.to_javascript_string())
            }
            key => {
                let key = key.as_expression().expect("a computed key");
                b.call(b.id("String"), [key.clone_in(b.allocator())])
            }
        }
    }
}

/// Upstream `build_fallback`, whose fallback the assignment's visit rewrites with the value.
fn fallback<'o>(
    b: &Builder<'o>,
    value: Expression<'o>,
    fallback: Expression<'o>,
) -> Expression<'o> {
    if is_simple_expression(&fallback) {
        return b.runtime("fallback", [value, fallback]);
    }
    if let Expression::AwaitExpression(awaited) = &fallback
        && is_simple_expression(&awaited.argument)
    {
        let Expression::AwaitExpression(awaited) = fallback else {
            unreachable!()
        };
        let call = b.runtime("fallback", [value, awaited.unbox().argument]);
        return Expression::new_await_expression(oxc_span::SPAN, call, b);
    }
    if is_async(&fallback) {
        // Upstream's arrow drops the `async` of `async () => await x` when `x` does not await.
        let thunk = match fallback {
            Expression::AwaitExpression(awaited) if !is_async(&awaited.argument) => {
                b.arrow(b.parameters([]), awaited.unbox().argument)
            }
            fallback => Expression::new_arrow_function_expression(
                oxc_span::SPAN,
                true,
                None,
                b.parameters([]),
                None,
                oxc_ast::ast::ArrowFunctionBody::from(fallback),
                b,
            ),
        };
        let call = b.runtime("fallback", [value, thunk, b.boolean(true)]);
        return Expression::new_await_expression(oxc_span::SPAN, call, b);
    }
    let thunk = match fallback {
        Expression::CallExpression(call)
            if call.arguments.is_empty()
                && !call.optional
                && matches!(call.callee, Expression::Identifier(_)) =>
        {
            call.unbox().callee
        }
        fallback => b.arrow(b.parameters([]), fallback),
    };
    b.runtime("fallback", [value, thunk, b.boolean(true)])
}

/// Upstream `is_expression_async`: an `await` outside any function `e` holds.
fn is_async(e: &Expression<'_>) -> bool {
    #[derive(Default)]
    struct Finds(bool);
    impl<'a> Visit<'a> for Finds {
        fn visit_await_expression(&mut self, _: &AwaitExpression<'a>) {
            self.0 = true;
        }

        fn visit_function(&mut self, _: &Function<'a>, _: ScopeFlags) {}

        fn visit_arrow_function_expression(&mut self, _: &ArrowFunctionExpression<'a>) {}

        fn visit_class(&mut self, _: &Class<'a>) {}
    }
    let mut finds = Finds::default();
    finds.visit_expression(e);
    finds.0
}
