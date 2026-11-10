use oxc_ast::ast::{Expression, Program, SimpleAssignmentTarget};
use oxc_ast_visit::{Visit, walk};
use oxc_semantic::{ReferenceFlags, Scoping};
use rsvelte_typescript_tree::{
    DeclarationIdentifier, ExpressionIdentifier, ParametersIdentifier, PatternIdentifier, Tree,
};

use super::walk::{Roots, TemplateName, TemplateScope, walk as walk_template};
use crate::compiler_syntax_tree::CompilerSyntaxTree;

/// Per symbol: how often it is read, assigned after its declaration, and assigned through a member
/// (`x.y = 1`, `x[i]++`, `bind:value={x.y}`).
#[derive(Debug)]
pub struct Counts {
    pub reads: Vec<u32>,
    pub writes: Vec<u32>,
    pub mutations: Vec<u32>,
}

/// Marks what `bind:` assigns as written, which the builder saw as a read only.
pub(super) fn mark_bound_writes(
    tree: &Tree,
    compiler_syntax_tree: &CompilerSyntaxTree,
    scoping: &mut Scoping,
) {
    struct Bound<'s> {
        tree: &'s Tree,
        scoping: &'s mut Scoping,
    }
    impl Roots for Bound<'_> {
        fn bound(&mut self, expression: ExpressionIdentifier) {
            if let Expression::Identifier(identifier) = self.tree.get_expression(expression) {
                self.scoping
                    .get_reference_mut(identifier.reference_id())
                    .flags_mut()
                    .insert(ReferenceFlags::Write);
            }
        }
        fn expression(&mut self, _: ExpressionIdentifier) {}
        fn declaration(&mut self, _: DeclarationIdentifier) {}
        fn pattern(&mut self, _: PatternIdentifier) {}
        fn parameters(&mut self, _: ParametersIdentifier) {}
        fn name(&mut self, _: TemplateName) {}
        fn enter(&mut self, _: TemplateScope) {}
        fn leave(&mut self) {}
    }
    walk_template(
        compiler_syntax_tree,
        compiler_syntax_tree.root,
        &mut Bound { tree, scoping },
    );
}

pub(super) fn count(
    tree: &Tree,
    scoping: &Scoping,
    programs: &[&Program<'_>],
    compiler_syntax_tree: &CompilerSyntaxTree,
) -> Counts {
    let symbols = scoping.symbols_len();
    let mut counts = Counts {
        reads: vec![0; symbols],
        writes: vec![0; symbols],
        mutations: vec![0; symbols],
    };
    for symbol in scoping.symbol_ids() {
        for reference in scoping.get_resolved_references(symbol) {
            counts.reads[symbol.index()] += u32::from(reference.is_read());
            counts.writes[symbol.index()] += u32::from(reference.is_write());
        }
    }
    let mut mutations = Mutations {
        tree,
        scoping,
        per_symbol: &mut counts.mutations,
    };
    for program in programs {
        mutations.visit_program(program);
    }
    walk_template(
        compiler_syntax_tree,
        compiler_syntax_tree.root,
        &mut mutations,
    );
    counts
}

struct Mutations<'s> {
    tree: &'s Tree,
    scoping: &'s Scoping,
    per_symbol: &'s mut [u32],
}

impl Mutations<'_> {
    /// Counts a write through a member of `object`'s root binding.
    fn mutate(&mut self, mut object: &Expression<'_>) {
        loop {
            object = match object {
                Expression::StaticMemberExpression(m) => &m.object,
                Expression::ComputedMemberExpression(m) => &m.object,
                Expression::PrivateFieldExpression(m) => &m.object,
                Expression::Identifier(identifier) => {
                    if let Some(symbol) = self
                        .scoping
                        .get_reference(identifier.reference_id())
                        .symbol_id()
                    {
                        self.per_symbol[symbol.index()] += 1;
                    }
                    return;
                }
                _ => return,
            };
        }
    }
}

impl<'a> Visit<'a> for Mutations<'_> {
    fn visit_simple_assignment_target(&mut self, it: &SimpleAssignmentTarget<'a>) {
        if let Some(member) = it.as_member_expression() {
            self.mutate(member.object());
        }
        walk::walk_simple_assignment_target(self, it);
    }
}

impl Roots for Mutations<'_> {
    fn expression(&mut self, expression: ExpressionIdentifier) {
        self.visit_expression(self.tree.get_expression(expression));
    }

    fn bound(&mut self, expression: ExpressionIdentifier) {
        let e = self.tree.get_expression(expression);
        if let Some(member) = e.as_member_expression() {
            self.mutate(member.object());
        }
        self.visit_expression(e);
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
