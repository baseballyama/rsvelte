use rsvelte_svelte_hir::compiler_syntax_tree::CompilerSyntaxTree;
use rsvelte_typescript::{NodeIdentifier, SyntaxTree};

/// Shared component trees and source data, independent of task options.
#[derive(Clone, Copy, Debug)]
pub struct ComponentInput<'a> {
    /// Every JavaScript expression of the component, script and template.
    pub javascript: &'a SyntaxTree,
    /// The instance script's program, or an empty one.
    pub program: NodeIdentifier,
    pub compiler_syntax_tree: &'a CompilerSyntaxTree,
    pub style: Option<&'a rsvelte_stylesheet::StyleSheet>,
    /// Every template expression, in document order.
    pub template_expressions: &'a [NodeIdentifier],
    pub filename: &'a str,
    /// The document: HIR spans index into it.
    pub source_text: &'a str,
}
