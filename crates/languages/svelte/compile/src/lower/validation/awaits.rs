//! Acorn's errors for an `await` outside an async function, which oxc's parser leaves on the tree
//! for the compiler to raise.

use oxc_ast::ast::{
    ArrowFunctionExpression, AwaitExpression, Expression, Function, PropertyDefinition,
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
    contexts: Vec<Context>,
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
        contexts: vec![Context::Async],
        error: None,
    };
    let mut starts: Vec<(u32, Root<'_>)> = (input.component.module.into_iter())
        .chain(input.component.instance)
        .map(|p| {
            let program = javascript.get_program(p);
            (program.span.start, Root::Program(program))
        })
        .chain((javascript.expressions()).map(|(_, e)| (e.span().start, Root::Expression(e))))
        .chain((javascript.declarations()).map(|(_, d)| (d.span.start, Root::Declaration(d))))
        .collect();
    starts.sort_by_key(|&(start, _)| start);
    for (_, root) in starts {
        match root {
            Root::Program(program) => walk.visit_program(program),
            Root::Expression(e) => walk.visit_expression(e),
            Root::Declaration(d) => walk.visit_variable_declaration(d),
        }
        if let Some(error) = walk.error {
            return Err(error);
        }
    }
    Ok(())
}

#[derive(Clone, Copy)]
enum Root<'a> {
    Program(&'a oxc_ast::ast::Program<'a>),
    Expression(&'a Expression<'a>),
    Declaration(&'a oxc_ast::ast::VariableDeclaration<'a>),
}

impl Awaits {
    fn within(&mut self, context: Context, visit: impl FnOnce(&mut Self)) {
        self.contexts.push(context);
        visit(self);
        self.contexts.pop();
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

    fn visit_await_expression(&mut self, it: &AwaitExpression<'a>) {
        // oxc's semantic checker reports one in a static block.
        if self.contexts.last() != Some(&Context::Function) {
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
