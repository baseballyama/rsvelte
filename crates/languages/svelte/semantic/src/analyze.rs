//! Expression metadata, template dynamics, and stylesheet usage.

use oxc_ast::ast::{ChainElement, Expression};
use oxc_ast_visit::Visit;
use oxc_semantic::ReferenceId;
use rsvelte_kernel::index::IndexVector;
use rsvelte_typescript_tree::{DeclarationIdentifier, ExpressionIdentifier};
use rustc_hash::{FxBuildHasher, FxHashMap, FxHashSet};

use crate::compiler_syntax_tree::{CompilerNodeIdentifier, NodeKind};
use crate::input::ComponentInput;
use crate::resolve::Resolution;
use crate::typescript::without_typescript;

mod dynamic;
mod evaluation;
mod metadata;
mod stylesheet;

use evaluation::BindingValues;
use metadata::MetadataWalker;

#[derive(Clone, Copy, Debug, Default)]
#[expect(
    clippy::struct_excessive_bools,
    reason = "independent facts upstream tracks as separate flags"
)]
pub struct ExpressionMetadata {
    /// Any identifier used as a reference (upstream marks the enclosing fragments dynamic).
    pub has_reference: bool,
    pub has_state: bool,
    pub has_call: bool,
    pub has_member: bool,
    /// The first store subscription among the dependencies (upstream's first `store_sub`
    /// binding), which an `{#each}` over it invalidates.
    pub first_store_subscription: Option<ReferenceId>,
}

#[derive(Debug)]
pub struct Analysis {
    /// Keyed by every template expression.
    pub expressions: FxHashMap<ExpressionIdentifier, ExpressionMetadata>,
    /// Keyed by every `{@const}` and `{let}` tag's declaration.
    pub declarations: FxHashMap<DeclarationIdentifier, ExpressionMetadata>,
    /// Keyed by each `{@render}` tag's expression: one per argument of its call (upstream
    /// `metadata.arguments`).
    render_arguments: FxHashMap<ExpressionIdentifier, Vec<ExpressionMetadata>>,
    pub needs_context: bool,
    /// Per HIR node: whether the style sheet selects it (elements only).
    pub scoped: IndexVector<CompilerNodeIdentifier, bool>,
    /// Per element: whether its children are dynamic (upstream `fragment.metadata.dynamic`).
    pub dynamic: IndexVector<CompilerNodeIdentifier, bool>,
    pub root_dynamic: bool,
    /// Keyed by the CSS complex selector identifier.
    pub stylesheet_used: Vec<bool>,
    pub stylesheet_scoped: Vec<bool>,
}

impl Analysis {
    /// # Panics
    ///
    /// If `expression` is not a template expression.
    #[must_use]
    pub fn meta(&self, expression: ExpressionIdentifier) -> ExpressionMetadata {
        *self
            .expressions
            .get(&expression)
            .expect("every template expression is analysed")
    }

    /// # Panics
    ///
    /// If `declaration` is not a tag's declaration.
    #[must_use]
    pub fn declaration_meta(&self, declaration: DeclarationIdentifier) -> ExpressionMetadata {
        *self
            .declarations
            .get(&declaration)
            .expect("every tag's declaration is analysed")
    }

    /// Each argument's metadata of the call a `{@render}` tag's `expression` makes; empty for
    /// another expression.
    #[must_use]
    pub fn render_arguments(&self, expression: ExpressionIdentifier) -> &[ExpressionMetadata] {
        self.render_arguments
            .get(&expression)
            .map_or(&[], Vec::as_slice)
    }
}

#[must_use]
pub fn analyze(input: &ComponentInput<'_>, res: &Resolution) -> Analysis {
    let compiler_syntax_tree = input.compiler_syntax_tree;
    let mut analysis = Analysis {
        expressions: FxHashMap::default(),
        declarations: FxHashMap::default(),
        render_arguments: FxHashMap::default(),
        needs_context: false,
        scoped: IndexVector::from_element_n(false, compiler_syntax_tree.nodes.len()),
        dynamic: IndexVector::from_element_n(false, compiler_syntax_tree.nodes.len()),
        root_dynamic: false,
        stylesheet_used: Vec::new(),
        stylesheet_scoped: Vec::new(),
    };
    let tree = input.javascript;
    let mut values = BindingValues::new(res);
    let mut walker = MetadataWalker::<false>::new(res, &mut values);
    for program in input.module.into_iter().chain(input.instance) {
        walker.visit_program(tree.get_program(program));
    }
    let mut needs_context = walker.needs_context();
    // Upstream reads a component's name from its tag, not as an expression that needs context.
    let references: FxHashSet<ExpressionIdentifier> =
        compiler_syntax_tree.component_references().collect();
    let mut expressions =
        FxHashMap::with_capacity_and_hasher(tree.expressions().len(), FxBuildHasher);
    let renders: FxHashSet<ExpressionIdentifier> = compiler_syntax_tree
        .nodes
        .iter()
        .filter_map(|node| match node.kind {
            NodeKind::Render { expression } => Some(expression),
            _ => None,
        })
        .collect();
    for (identifier, expression) in tree.expressions() {
        let mut walker = MetadataWalker::<true>::new(res, &mut values);
        // Upstream's render tag visits its call's callee and each argument, never the call.
        let call = renders
            .contains(&identifier)
            .then(|| render_call(expression))
            .flatten();
        let Some(call) = call else {
            walker.visit_expression(expression);
            needs_context |= walker.needs_context() && !references.contains(&identifier);
            expressions.insert(identifier, walker.metadata());
            continue;
        };
        walker.visit_expression(&call.callee);
        needs_context |= walker.needs_context();
        expressions.insert(identifier, walker.metadata());
        let arguments = call
            .arguments
            .iter()
            .map(|argument| {
                let mut walker = MetadataWalker::<true>::new(res, &mut values);
                walker.visit_argument(argument);
                needs_context |= walker.needs_context();
                walker.metadata()
            })
            .collect();
        analysis.render_arguments.insert(identifier, arguments);
    }
    let mut declarations = FxHashMap::default();
    for (identifier, declaration) in tree.declarations() {
        let mut walker = MetadataWalker::<true>::new(res, &mut values);
        walker.visit_variable_declaration(declaration);
        needs_context |= walker.needs_context();
        declarations.insert(identifier, walker.metadata());
    }
    // Upstream visits a snippet's parameters, but never the patterns of `{#each}` or `{:then}`.
    for (_, parameters) in tree.parameters() {
        let mut walker = MetadataWalker::<true>::new(res, &mut values);
        walker.visit_formal_parameters(parameters);
        needs_context |= walker.needs_context();
    }
    analysis.expressions = expressions;
    analysis.declarations = declarations;
    analysis.needs_context = needs_context;
    // Which elements the style sheet scopes is an input of the dynamic marks.
    stylesheet::analyze(input, res, &mut analysis);
    analysis.root_dynamic = dynamic::mark_dynamic(
        input,
        &analysis.expressions,
        &analysis.scoped,
        compiler_syntax_tree.children(compiler_syntax_tree.root),
        &mut analysis.dynamic,
    );
    analysis
}

/// Upstream `unwrap_optional` of a render tag's expression: the call it makes.
fn render_call<'a>(e: &'a Expression<'a>) -> Option<&'a oxc_ast::ast::CallExpression<'a>> {
    match without_typescript(e) {
        Expression::CallExpression(call) => Some(call),
        Expression::ChainExpression(chain) => match &chain.expression {
            ChainElement::CallExpression(call) => Some(call),
            _ => None,
        },
        _ => None,
    }
}

#[cfg(test)]
mod tests;
