//! The `await`s upstream raises `experimental_async` at.

use oxc_ast::AstKind;
use oxc_ast_visit::Visit;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::Component;
use rsvelte_typescript_tree::{
    DeclarationIdentifier, ExpressionIdentifier, ParametersIdentifier, PatternIdentifier, Tree,
};

use super::span;
use crate::compiler_syntax_tree::CompilerSyntaxTree;
use crate::resolve::{Resolution, Roots, TemplateName, TemplateScope};

/// The `await`s that suspend rendering, as upstream raises `experimental_async` at them: at the
/// top level of the instance script or of a template expression, or in a `$derived(…)` argument
/// in any script, with no function between.
pub(super) fn suspending_awaits(
    component: &Component,
    compiler_syntax_tree: &CompilerSyntaxTree,
    resolution: &Resolution,
) -> Vec<Span> {
    struct Awaits<'t> {
        tree: &'t Tree,
        resolution: &'t Resolution,
        /// Whether the walk's top level suspends: the instance's and the template's, not the
        /// module's.
        top: bool,
        functions: u32,
        /// The function count at each `$derived(…)` the walk is in.
        deriveds: Vec<u32>,
        out: Vec<Span>,
    }
    impl<'a> Visit<'a> for Awaits<'_> {
        fn enter_node(&mut self, kind: AstKind<'a>) {
            match kind {
                AstKind::Function(_) | AstKind::ArrowFunctionExpression(_) => self.functions += 1,
                AstKind::CallExpression(call)
                    if self.resolution.rune_of_call(call) == Some("$derived") =>
                {
                    self.deriveds.push(self.functions);
                }
                AstKind::AwaitExpression(e)
                    if (self.top && self.functions == 0)
                        || self.deriveds.last() == Some(&self.functions) =>
                {
                    self.out.push(span(e.span));
                }
                _ => {}
            }
        }

        fn leave_node(&mut self, kind: AstKind<'a>) {
            match kind {
                AstKind::Function(_) | AstKind::ArrowFunctionExpression(_) => self.functions -= 1,
                AstKind::CallExpression(call)
                    if self.resolution.rune_of_call(call) == Some("$derived") =>
                {
                    self.deriveds.pop();
                }
                _ => {}
            }
        }
    }
    impl Roots for Awaits<'_> {
        fn expression(&mut self, expression: ExpressionIdentifier) {
            self.visit_expression(self.tree.get_expression(expression));
        }

        fn bound(&mut self, expression: ExpressionIdentifier) {
            self.expression(expression);
        }

        fn declaration(&mut self, declaration: DeclarationIdentifier) {
            self.visit_variable_declaration(self.tree.get_declaration(declaration));
        }

        fn pattern(&mut self, pattern: PatternIdentifier) {
            self.visit_formal_parameter(self.tree.get_pattern(pattern));
        }

        fn parameters(&mut self, parameters: ParametersIdentifier) {
            self.visit_formal_parameters(self.tree.get_parameters(parameters));
        }

        fn name(&mut self, _: TemplateName) {}

        fn enter(&mut self, _: TemplateScope) {}

        fn leave(&mut self) {}
    }
    // The resolution's nodes hold the scripts and the template's expressions in one flat list,
    // which is cheaper to scan than to walk, and nearly every component has no `await`.
    let nodes = resolution.semantic().nodes();
    if !nodes
        .iter()
        .any(|node| matches!(node.kind(), AstKind::AwaitExpression(_)))
    {
        return Vec::new();
    }
    let tree = &component.javascript;
    let mut awaits = Awaits {
        tree,
        resolution,
        top: false,
        functions: 0,
        deriveds: Vec::new(),
        out: Vec::new(),
    };
    if let Some(module) = &component.module {
        awaits.visit_program(tree.get_program(module.program));
    }
    awaits.top = true;
    if let Some(instance) = &component.instance {
        awaits.visit_program(tree.get_program(instance.program));
    }
    crate::resolve::walk(compiler_syntax_tree, compiler_syntax_tree.root, &mut awaits);
    awaits.out
}

#[cfg(test)]
mod tests;
