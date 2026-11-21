use std::cell::Cell;

use oxc_ast::ast::{
    Expression, FormalParameter, FormalParameters, Program, TSTypeParameterDeclaration,
    VariableDeclaration,
};
use oxc_semantic::{Host, HostVisitor, ScopeFlags, ScopeId};
use oxc_span::{GetSpan, SourceType, Span};
use rsvelte_typescript_tree::Tree;

use super::Semantic;

impl Semantic {
    /// Analyzes each part of `tree` on its own, as a host's parser that reads them one at a time
    /// checks them: each program, and every other part in a scope of its own.
    #[must_use]
    pub fn of_each_part(tree: &Tree) -> Vec<Self> {
        let programs = tree
            .programs()
            .map(|(program, _)| Self::program(tree.clone(), program));
        programs
            .chain(std::iter::once(Self::build(
                tree.clone(),
                |tree, builder| builder.build_with_host(empty_program(tree), &Parts::new(tree)),
            )))
            .collect()
    }
}

/// A program with no statements, at the start of `tree`, to analyze a host's parts in.
#[must_use]
pub fn empty_program(tree: &Tree) -> &Program<'_> {
    let nodes = oxc_ast::builder::AstBuilder::new(tree.allocator());
    let program = Program::new(
        Span::empty(0),
        SourceType::mjs(),
        tree.source_text(),
        oxc_allocator::ArenaVec::new_in(&nodes),
        None,
        oxc_allocator::ArenaVec::new_in(&nodes),
        oxc_allocator::ArenaVec::new_in(&nodes),
        &nodes,
    );
    tree.allocator().alloc(program)
}

enum Part<'a> {
    Expression(&'a Expression<'a>),
    Declaration(&'a VariableDeclaration<'a>),
    Pattern(&'a FormalParameter<'a>),
    Parameters(&'a FormalParameters<'a>),
    TypeParameters(&'a TSTypeParameterDeclaration<'a>),
}

impl GetSpan for Part<'_> {
    fn span(&self) -> Span {
        match self {
            Self::Expression(part) => part.span(),
            Self::Declaration(part) => part.span,
            Self::Pattern(part) => part.span,
            Self::Parameters(part) => part.span,
            Self::TypeParameters(part) => part.span,
        }
    }
}

/// The parts of a tree outside its programs, in document order, each with the cell its scope's
/// id goes in.
struct Parts<'a>(Vec<(Part<'a>, Cell<Option<ScopeId>>)>);

impl<'a> Parts<'a> {
    fn new(tree: &'a Tree) -> Self {
        let mut parts: Vec<Part<'a>> = (tree.expressions().map(|(_, p)| Part::Expression(p)))
            .chain(tree.declarations().map(|(_, p)| Part::Declaration(p)))
            .chain(tree.patterns().map(|(_, p)| Part::Pattern(p)))
            .chain(tree.parameters().map(|(_, p)| Part::Parameters(p)))
            .chain(tree.type_parameters().map(|(_, p)| Part::TypeParameters(p)))
            .collect();
        parts.sort_unstable_by_key(|part| part.span().start);
        Self(
            parts
                .into_iter()
                .map(|part| (part, Cell::new(None)))
                .collect(),
        )
    }
}

impl<'a> Host<'a> for Parts<'a> {
    fn visit(&self, visitor: &mut HostVisitor<'_, 'a>) {
        for (part, scope) in &self.0 {
            let flags = match part {
                Part::Parameters(_) => ScopeFlags::Function,
                _ => ScopeFlags::empty(),
            };
            visitor.enter_scope(flags, scope);
            match *part {
                Part::Expression(part) => visitor.visit_expression(part),
                Part::Declaration(part) => visitor.visit_variable_declaration(part),
                Part::Pattern(part) => visitor.visit_formal_parameter(part),
                Part::Parameters(part) => visitor.visit_formal_parameters(part),
                Part::TypeParameters(part) => visitor.visit_ts_type_parameter_declaration(part),
            }
            visitor.leave_scope();
        }
    }
}
