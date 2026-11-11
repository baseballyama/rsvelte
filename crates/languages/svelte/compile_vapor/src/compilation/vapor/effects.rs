//! A block's statements with its DOM updates kept apart, so that the block finishes them as one
//! `renderEffect` that reads its memoized cells first, in the order the elements were opened.

use oxc_ast::ast::{Expression, IdentifierReference, Statement, StaticMemberExpression};
use oxc_ast_visit::{Visit, walk};
use rsvelte_typescript_compile::build::Builder;
use rustc_hash::{FxHashMap, FxHashSet};

#[derive(Default)]
pub(super) struct Body<'o> {
    statements: Vec<Statement<'o>>,
    updates: Vec<Update<'o>>,
}

/// A DOM update: the expression its `renderEffect` would run.
struct Update<'o> {
    /// How many statements came before it.
    at: usize,
    order: usize,
    expression: Expression<'o>,
    reads: Vec<String>,
}

impl<'o> Body<'o> {
    pub(super) fn push(&mut self, statement: Statement<'o>) {
        self.statements.push(statement);
    }

    /// A statement before all the others.
    pub(super) fn insert(&mut self, statement: Statement<'o>) {
        self.statements.insert(0, statement);
        for update in &mut self.updates {
            update.at += 1;
        }
    }

    pub(super) fn effect(&mut self, order: usize, expression: Expression<'o>, reads: Vec<String>) {
        self.updates.push(Update {
            at: self.statements.len(),
            order,
            expression,
            reads,
        });
    }

    /// The statements, the DOM updates last as one effect; a lone update that reads no cell and
    /// is last already stays as written.
    pub(super) fn finish(mut self, b: &Builder<'o>) -> Vec<Statement<'o>> {
        let effect = |body| {
            let callback = b.arrow_block(b.params([]), body, false);
            b.stmt(b.call(b.id("$$v_renderEffect"), [callback]))
        };
        match self.updates.len() {
            0 => return self.statements,
            1 if self.updates[0].reads.is_empty()
                && self.updates[0].at == self.statements.len() =>
            {
                let update = self.updates.pop().expect("one update");
                let callback = b.arrow(b.params([]), update.expression);
                self.statements
                    .push(b.stmt(b.call(b.id("$$v_renderEffect"), [callback])));
                return self.statements;
            }
            _ => {}
        }
        self.updates.sort_by_key(|update| update.order);
        let mut seen = FxHashSet::default();
        let mut reads = Vec::new();
        for update in &self.updates {
            for read in &update.reads {
                if seen.insert(read.as_str()) {
                    reads.push(b.stmt(b.member(b.id(read), "value")));
                }
            }
        }
        reads.extend(
            self.updates
                .into_iter()
                .map(|update| b.stmt(update.expression)),
        );
        self.statements.push(effect(reads));
        self.statements
    }
}

/// The memoized cells `update` reads, through the DOM callbacks it calls too, in order.
pub(super) fn reads(
    update: &Expression<'_>,
    memoized: &FxHashSet<String>,
    callbacks: &FxHashMap<String, Vec<String>>,
) -> Vec<String> {
    struct Reads<'r> {
        memoized: &'r FxHashSet<String>,
        callbacks: &'r FxHashMap<String, Vec<String>>,
        out: Vec<String>,
    }
    impl<'a> Visit<'a> for Reads<'_> {
        fn visit_static_member_expression(&mut self, it: &StaticMemberExpression<'a>) {
            if let Expression::Identifier(object) = &it.object
                && it.property.name == "value"
                && self.memoized.contains(object.name.as_str())
            {
                self.out.push(object.name.to_string());
                return;
            }
            walk::walk_static_member_expression(self, it);
        }

        fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
            if let Some(reads) = self.callbacks.get(it.name.as_str()) {
                self.out.extend(reads.iter().cloned());
            }
        }
    }
    let mut v = Reads {
        memoized,
        callbacks,
        out: Vec::new(),
    };
    v.visit_expression(update);
    v.out
}

/// Whether an element callback only updates the DOM: `($$el) => { if (…) { …updates } }`.
pub(super) fn dom_callback(callback: &Expression<'_>) -> bool {
    let Expression::ArrowFunctionExpression(arrow) = callback else {
        return false;
    };
    let oxc_ast::ast::ArrowFunctionBody::FunctionBody(body) = &arrow.body else {
        return false;
    };
    let [Statement::IfStatement(test)] = body.statements.as_slice() else {
        return false;
    };
    if test.alternate.is_some() {
        return false;
    }
    let Statement::BlockStatement(updates) = &test.consequent else {
        return false;
    };
    !updates.body.is_empty()
        && updates.body.iter().all(|update| {
            let Statement::ExpressionStatement(s) = update else {
                return false;
            };
            let Expression::CallExpression(call) = &s.expression else {
                return false;
            };
            matches!(&call.callee, Expression::Identifier(callee) if matches!(
                callee.name.as_str(),
                "$$set_class" | "$$style" | "$$styles" | "$$value" | "$$custom_element_data"
            ))
        })
}
