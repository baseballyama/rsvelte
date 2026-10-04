//! Expression metadata, template dynamics, and stylesheet usage.

use rsvelte_kernel::source::index::IndexVector;
use rsvelte_svelte_hir::compiler_syntax_tree::CompilerNodeIdentifier;
use rsvelte_typescript::NodeIdentifier;
use rustc_hash::{FxBuildHasher, FxHashMap};

use crate::semantic::input::ComponentInput;
use crate::semantic::resolve::Resolution;

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
}

#[derive(Debug)]
pub struct Analysis {
    /// Keyed by the expression root of every template expression.
    pub expressions: FxHashMap<NodeIdentifier, ExpressionMetadata>,
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
    /// If `expression` is not the root of a template expression.
    #[must_use]
    pub fn meta(&self, expression: NodeIdentifier) -> ExpressionMetadata {
        *self
            .expressions
            .get(&expression)
            .expect("every template expression is analysed")
    }
}

#[must_use]
pub fn analyze(input: &ComponentInput<'_>, res: &Resolution) -> Analysis {
    let compiler_syntax_tree = input.compiler_syntax_tree;
    let mut analysis = Analysis {
        expressions: FxHashMap::default(),
        needs_context: false,
        scoped: IndexVector::from_element_n(false, compiler_syntax_tree.nodes.len()),
        dynamic: IndexVector::from_element_n(false, compiler_syntax_tree.nodes.len()),
        root_dynamic: false,
        stylesheet_used: Vec::new(),
        stylesheet_scoped: Vec::new(),
    };
    let mut values = BindingValues::new(input, res);
    let mut walker = MetadataWalker::<false>::new(input, res, &mut values);
    if let Some(module) = input.module {
        walker.visit(module);
    }
    walker.visit(input.program);
    let mut needs_context = walker.needs_context();
    let mut expressions =
        FxHashMap::with_capacity_and_hasher(input.template_expressions.len(), FxBuildHasher);
    for &expression in input.template_expressions {
        let mut walker = MetadataWalker::<true>::new(input, res, &mut values);
        walker.visit(expression);
        needs_context |= walker.needs_context();
        expressions.insert(expression, walker.metadata());
    }
    analysis.expressions = expressions;
    analysis.needs_context = needs_context;
    analysis.root_dynamic = dynamic::mark_dynamic(
        input,
        &analysis.expressions,
        compiler_syntax_tree.children(compiler_syntax_tree.root),
        &mut analysis.dynamic,
    );

    stylesheet::analyze(input, res, &mut analysis);
    analysis
}
