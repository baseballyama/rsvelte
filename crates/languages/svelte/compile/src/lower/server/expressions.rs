use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{Expression, FormalParameter};
use oxc_ast_visit::VisitMut;
use rsvelte_svelte_semantic::evaluate::{Evaluation, Evaluator};
use rsvelte_typescript_tree::{ExpressionIdentifier, ParametersIdentifier};

use super::{ScriptRewrite, ServerCompilationContext, Target};

impl<'o> ServerCompilationContext<'_, 'o> {
    const fn rewrite(&self) -> ScriptRewrite<'_, 'o> {
        ScriptRewrite {
            b: self.b,
            target: Target::Server,
            accessors: false,
            rest_reads: None,
            res: self.res,
            template: None,
        }
    }

    /// A template expression, lowered into the output.
    pub(super) fn expression(&self, e: ExpressionIdentifier) -> Expression<'o> {
        self.rewrite().expression(self.javascript.get_expression(e))
    }

    /// Upstream's `scope.evaluate` of a template expression.
    pub(super) fn evaluate(&self, e: ExpressionIdentifier) -> Evaluation {
        Evaluator::new(self.res).evaluate(self.javascript.get_expression(e))
    }

    /// A snippet's parameters, lowered into the output.
    pub(super) fn parameters(
        &self,
        parameters: ParametersIdentifier,
    ) -> impl Iterator<Item = FormalParameter<'o>> + '_ {
        let parameters = self.javascript.get_parameters(parameters);
        debug_assert!(
            parameters.rest.is_none(),
            "validation refuses a rest parameter"
        );
        parameters.items.iter().map(move |p| {
            let mut p = p.clone_in_with_semantic_ids(self.b.allocator());
            self.rewrite().visit_formal_parameter(&mut p);
            p
        })
    }
}
