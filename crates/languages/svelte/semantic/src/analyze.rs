//! Expression metadata, template dynamics, and stylesheet usage.

use oxc_ast::ast::{ChainElement, Expression};
use oxc_ast_visit::Visit;
use oxc_semantic::ReferenceId;
use rsvelte_kernel::index::IndexVector;
use rsvelte_typescript_tree::{
    DeclarationIdentifier, ExpressionIdentifier, ParametersIdentifier, PatternIdentifier,
};
use rustc_hash::{FxBuildHasher, FxHashMap, FxHashSet};

use crate::compiler_syntax_tree::{CompilerNodeIdentifier, NodeKind};
use crate::input::ComponentInput;
use crate::resolve::{Resolution, Roots, TemplateName, TemplateScope};
use crate::typescript::without_typescript;

mod dynamic;
mod evaluation;
mod metadata;
mod stylesheet;

pub use dynamic::cannot_be_set_statically;
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
    let mut scripts = MetadataWalker::<false>::new(res, &mut values);
    for program in input.programs() {
        scripts.visit_program(tree.get_program(program));
    }
    let needs_context = scripts.needs_context();
    let mut template = Walked {
        tree,
        res,
        values: &mut values,
        // Upstream reads a component's name from its tag, not as an expression that needs
        // context.
        references: compiler_syntax_tree.component_references().collect(),
        renders: compiler_syntax_tree
            .nodes
            .iter()
            .filter_map(|node| match node.kind {
                NodeKind::Render { expression } => Some(expression),
                _ => None,
            })
            .collect(),
        expressions: FxHashMap::with_capacity_and_hasher(tree.expressions().len(), FxBuildHasher),
        render_arguments: FxHashMap::default(),
        needs_context,
    };
    crate::resolve::walk(
        compiler_syntax_tree,
        compiler_syntax_tree.root,
        &mut template,
    );
    let Walked {
        expressions,
        render_arguments,
        needs_context,
        ..
    } = template;
    analysis.render_arguments = render_arguments;
    analysis.expressions = expressions;
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

/// The metadata of what the template evaluates: the roots the scope analysis visits, so every
/// reference walked has been resolved.
struct Walked<'w, 'a> {
    tree: &'a rsvelte_typescript_tree::Tree,
    res: &'a Resolution,
    values: &'w mut BindingValues<'a>,
    references: FxHashSet<ExpressionIdentifier>,
    renders: FxHashSet<ExpressionIdentifier>,
    expressions: FxHashMap<ExpressionIdentifier, ExpressionMetadata>,
    render_arguments: FxHashMap<ExpressionIdentifier, Vec<ExpressionMetadata>>,
    needs_context: bool,
}

impl Roots for Walked<'_, '_> {
    fn expression(&mut self, expression: ExpressionIdentifier) {
        let identifier = expression;
        let expression = self.tree.get_expression(identifier);
        let mut walker = MetadataWalker::<true>::new(self.res, self.values);
        // Upstream's render tag visits its call's callee and each argument, never the call.
        let call = (self.renders.contains(&identifier))
            .then(|| render_call(expression))
            .flatten();
        let Some(call) = call else {
            walker.visit_expression(expression);
            self.needs_context |= walker.needs_context() && !self.references.contains(&identifier);
            self.expressions.insert(identifier, walker.metadata());
            return;
        };
        walker.visit_expression(&call.callee);
        self.needs_context |= walker.needs_context();
        self.expressions.insert(identifier, walker.metadata());
        let arguments = call
            .arguments
            .iter()
            .map(|argument| {
                let mut walker = MetadataWalker::<true>::new(self.res, self.values);
                walker.visit_argument(argument);
                self.needs_context |= walker.needs_context();
                walker.metadata()
            })
            .collect();
        self.render_arguments.insert(identifier, arguments);
    }

    fn bound(&mut self, expression: ExpressionIdentifier) {
        self.expression(expression);
    }

    fn declaration(&mut self, declaration: DeclarationIdentifier) {
        let mut walker = MetadataWalker::<true>::new(self.res, self.values);
        walker.visit_variable_declaration(self.tree.get_declaration(declaration));
        self.needs_context |= walker.needs_context();
    }

    // Upstream never visits the patterns of `{#each}` or `{:then}`.
    fn pattern(&mut self, _: PatternIdentifier) {}

    // Upstream visits a snippet's parameters.
    fn parameters(&mut self, parameters: ParametersIdentifier) {
        let mut walker =
            MetadataWalker::<true>::new(self.res, self.values).with_parentheses(self.tree);
        walker.visit_formal_parameters(self.tree.get_parameters(parameters));
        self.needs_context |= walker.needs_context();
    }

    fn name(&mut self, _: TemplateName) {}

    fn enter(&mut self, _: TemplateScope) {}

    fn leave(&mut self) {}
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
