//! Acorn's errors for an `await` outside an async function, which oxc's parser leaves on the tree
//! for the compiler to raise.

use oxc_ast::ast::{
    AccessorProperty, ArrowFunctionExpression, AwaitExpression, Expression, Function,
    PropertyDefinition,
};
use oxc_ast_visit::{Visit, walk};
use oxc_span::GetSpan;
use oxc_syntax::scope::ScopeFlags;
use rsvelte_kernel::performance::stack::grow;

use crate::lower::{CompileInput, Diagnostic, Span};

/// What an `await` stands in, as acorn reads a module.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Context {
    /// An async function, or the top level, where acorn reads an await expression.
    Async,
    /// A function that is not async, or a class field's initializer, which acorn reads as one.
    Function,
}

struct Awaits {
    context: Context,
    error: Option<Diagnostic>,
}

/// The first `await` acorn rejects in the scripts and the template expressions, in document order.
///
/// # Errors
///
/// Acorn's `js_parse_error` at that `await`.
pub(in crate::lower) fn check(input: &CompileInput<'_>) -> Result<(), Diagnostic> {
    let javascript = input.component.javascript;
    let mut walk = Awaits {
        context: Context::Async,
        error: None,
    };
    // The parts do not overlap, so the part that starts first holds the first error.
    let mut first: Option<(u32, Diagnostic)> = None;
    let mut found = |start: u32, walk: &mut Awaits| {
        if let Some(error) = walk.error.take()
            && first.as_ref().is_none_or(|(at, _)| start < *at)
        {
            first = Some((start, error));
        }
    };
    for p in input
        .component
        .module
        .into_iter()
        .chain(input.component.instance)
    {
        let program = javascript.get_program(p);
        walk.visit_program(program);
        found(program.span.start, &mut walk);
    }
    for (_, e) in javascript.expressions() {
        walk.visit_expression(e);
        found(e.span().start, &mut walk);
    }
    for (_, d) in javascript.declarations() {
        walk.visit_variable_declaration(d);
        found(d.span.start, &mut walk);
    }
    first.map_or(Ok(()), |(_, error)| Err(error))
}

impl Awaits {
    fn within(&mut self, context: Context, visit: impl FnOnce(&mut Self)) {
        let outer = std::mem::replace(&mut self.context, context);
        visit(self);
        self.context = outer;
    }
}

impl<'a> Visit<'a> for Awaits {
    fn visit_expression(&mut self, it: &Expression<'a>) {
        if self.error.is_none() {
            grow(|| walk::walk_expression(self, it));
        }
    }

    fn visit_function(&mut self, it: &Function<'a>, flags: ScopeFlags) {
        let context = if it.r#async {
            Context::Async
        } else {
            Context::Function
        };
        self.within(context, |w| walk::walk_function(w, it, flags));
    }

    fn visit_arrow_function_expression(&mut self, it: &ArrowFunctionExpression<'a>) {
        let context = if it.r#async {
            Context::Async
        } else {
            Context::Function
        };
        self.within(context, |w| walk::walk_arrow_function_expression(w, it));
    }

    // Acorn reads a field's initializer as the body of a method that is not async.
    fn visit_property_definition(&mut self, it: &PropertyDefinition<'a>) {
        self.visit_decorators(&it.decorators);
        self.visit_property_key(&it.key);
        if let Some(value) = &it.value {
            self.within(Context::Function, |w| w.visit_expression(value));
        }
    }

    fn visit_accessor_property(&mut self, it: &AccessorProperty<'a>) {
        self.visit_decorators(&it.decorators);
        self.visit_property_key(&it.key);
        if let Some(value) = &it.value {
            self.within(Context::Function, |w| w.visit_expression(value));
        }
    }

    fn visit_await_expression(&mut self, it: &AwaitExpression<'a>) {
        // oxc's semantic checker reports one in a static block.
        if self.context != Context::Function {
            return walk::walk_await_expression(self, it);
        }
        if self.error.is_none() {
            let at = it.span.start;
            self.error = Some(crate::lower::special::error(
                "js_parse_error",
                "Cannot use keyword 'await' outside an async function",
                Span::new(at, at),
            ));
        }
    }
}
