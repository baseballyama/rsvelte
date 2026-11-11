//! An expression with an `await` as an async cell: each read outside the awaited parts goes
//! through `$$async_read(key, () => value)`, which keeps the value the last run read.

use oxc_allocator::{CloneIn, GetAllocator, TakeIn};
use oxc_ast::ast::{
    ArrowFunctionExpression, AwaitExpression, CallExpression, Expression, Function, ObjectProperty,
};
use oxc_ast_visit::{Visit, VisitMut, walk, walk_mut};
use oxc_syntax::node::NodeId;
use oxc_syntax::scope::ScopeFlags;
use rsvelte_typescript_compile::build::Builder;
use rustc_hash::FxHashSet;

use super::super::{Body, Emitter};
use super::Rewrite;

impl<'o> Emitter<'_, 'o> {
    /// `createIf(() => ready, () => createIf(() => value, …branches))` inside a block that
    /// declares the cell.
    pub(in super::super) fn async_if(
        &mut self,
        test: &Expression<'_>,
        branches: Vec<Expression<'o>>,
    ) -> Expression<'o> {
        let b = self.b;
        let mut body = Body::default();
        let value = self.async_text(test, &mut body);
        let ready = self.ready(&value);
        let mut arguments = vec![self.arrow(value)];
        arguments.extend(branches);
        let branch = self.call("createIf", arguments);
        let result = self.call("createIf", [self.arrow(ready), self.arrow(branch)]);
        let mut statements = body.finish(b);
        statements.push(b.return_(Some(result)));
        self.run(statements, false)
    }

    /// `cell.resolved.value` for a read `cell.value` of an async cell.
    pub(in super::super) fn ready(&self, read: &Expression<'o>) -> Expression<'o> {
        let Expression::StaticMemberExpression(m) = read else {
            unreachable!("an async cell read")
        };
        let Expression::Identifier(cell) = &m.object else {
            unreachable!("an async cell")
        };
        self.b
            .member(self.b.member(self.b.id(&cell.name), "resolved"), "value")
    }

    /// `const $$v_nN = $$async_cell(async ($$async_read) => value)`, read as `$$v_nN.value`.
    pub(in super::super) fn async_text(
        &mut self,
        e: &Expression<'_>,
        body: &mut Body<'o>,
    ) -> Expression<'o> {
        let b = self.b;
        let mut value = e.clone_in_with_semantic_ids(b.allocator());
        let mut awaited = Awaited::default();
        awaited.visit_expression(&value);
        let mut rewrite = AsyncRewrite {
            b,
            normal: Some(Rewrite {
                e: self,
                memo: super::Memo::None,
                body: None,
            }),
            awaited: awaited.out,
            next_key: 0,
        };
        rewrite.visit_expression(&mut value);
        let getter = async_getter(b, value);
        let cell = b.call(b.id("$$async_cell"), [getter]);
        let cell = self.declare(cell, body);
        b.member(b.id(&cell), "value")
    }
}

/// `async ($$async_read) => body`.
fn async_getter<'o>(b: &Builder<'o>, body: Expression<'o>) -> Expression<'o> {
    let Expression::ArrowFunctionExpression(mut arrow) = b.arrow(b.params(["$$async_read"]), body)
    else {
        unreachable!("an arrow")
    };
    arrow.r#async = true;
    Expression::ArrowFunctionExpression(arrow)
}

/// The nodes that hold an `await` outside nested functions.
#[derive(Default)]
struct Awaited {
    out: FxHashSet<NodeId>,
    /// Whether the expression being left held an `await`.
    found: bool,
}

impl<'a> Visit<'a> for Awaited {
    fn visit_expression(&mut self, it: &Expression<'a>) {
        let outer = std::mem::replace(&mut self.found, false);
        walk::walk_expression(self, it);
        if self.found
            && let Some(node) = member_node(it)
        {
            self.out.insert(node);
        }
        self.found |= outer;
    }

    fn visit_await_expression(&mut self, it: &AwaitExpression<'a>) {
        walk::walk_await_expression(self, it);
        self.found = true;
    }

    fn visit_function(&mut self, _: &Function<'a>, _: ScopeFlags) {}

    fn visit_arrow_function_expression(&mut self, _: &ArrowFunctionExpression<'a>) {}
}

fn member_node(e: &Expression<'_>) -> Option<NodeId> {
    Some(match e {
        Expression::StaticMemberExpression(m) => m.node_id.get(),
        Expression::ComputedMemberExpression(m) => m.node_id.get(),
        Expression::PrivateFieldExpression(m) => m.node_id.get(),
        _ => return None,
    })
}

/// The reads of an async expression cached; `normal` rewrites names as the template does, or
/// none is the script's, whose names are as written.
struct AsyncRewrite<'r, 'a, 'o> {
    b: &'a Builder<'o>,
    normal: Option<Rewrite<'r, 'a, 'o>>,
    awaited: FxHashSet<NodeId>,
    next_key: u32,
}

impl<'o> AsyncRewrite<'_, '_, 'o> {
    /// `$$async_read(key, () => value)`.
    fn read(&mut self, value: Expression<'o>) -> Expression<'o> {
        let b = self.b;
        let key = b.number(f64::from(self.next_key));
        self.next_key += 1;
        b.call(b.id("$$async_read"), [key, b.arrow(b.params([]), value)])
    }

    fn normal(&mut self, it: &mut Expression<'o>) {
        if let Some(normal) = &mut self.normal {
            normal.visit_expression(it);
        }
    }

    /// A call keeps its member callee whole, so the method keeps its `this`.
    fn visit_call(&mut self, call: &mut CallExpression<'o>) {
        match &mut call.callee {
            Expression::StaticMemberExpression(m) => self.visit_expression(&mut m.object),
            Expression::ComputedMemberExpression(m) => {
                self.visit_expression(&mut m.object);
                self.visit_expression(&mut m.expression);
            }
            Expression::PrivateFieldExpression(m) => self.visit_expression(&mut m.object),
            callee => self.visit_expression(callee),
        }
        for argument in &mut call.arguments {
            self.visit_argument(argument);
        }
    }
}

impl<'o> VisitMut<'o> for AsyncRewrite<'_, '_, 'o> {
    fn visit_expression(&mut self, it: &mut Expression<'o>) {
        match it {
            Expression::FunctionExpression(_) | Expression::ArrowFunctionExpression(_) => {
                self.normal(it);
            }
            Expression::Identifier(id) => {
                if let Some(value) = self.normal.as_mut().and_then(|n| n.e.reference(id)) {
                    *it = self.read(value);
                }
            }
            _ if member_node(it).is_some_and(|node| !self.awaited.contains(&node)) => {
                let mut value = it.take_in(self.b);
                self.normal(&mut value);
                *it = self.read(value);
            }
            Expression::CallExpression(call) => self.visit_call(call),
            _ => match self.normal.as_mut().and_then(|n| n.rune(it)) {
                Some(value) => *it = value,
                None => walk_mut::walk_expression(self, it),
            },
        }
    }

    fn visit_object_property(&mut self, it: &mut ObjectProperty<'o>) {
        it.shorthand = false;
        walk_mut::walk_object_property(self, it);
    }

    fn visit_function(&mut self, _: &mut Function<'o>, _: ScopeFlags) {}
}

/// An async derived's getter in the script, `async ($$async_read) => body` with its reads
/// cached.
pub(crate) fn script_getter<'o>(b: &Builder<'o>, getter: Expression<'o>) -> Expression<'o> {
    let Expression::ArrowFunctionExpression(mut arrow) = getter else {
        unreachable!("an async derived getter")
    };
    let mut awaited = Awaited::default();
    awaited.visit_arrow_function_body(&arrow.body);
    let mut rewrite = AsyncRewrite {
        b,
        normal: None,
        awaited: awaited.out,
        next_key: 0,
    };
    rewrite.visit_arrow_function_body(&mut arrow.body);
    arrow.params = b.params(["$$async_read"]);
    arrow.r#async = true;
    Expression::ArrowFunctionExpression(arrow)
}
