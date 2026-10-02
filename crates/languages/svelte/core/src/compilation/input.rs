use rsvelte_typescript::{NodeIdentifier, SyntaxTree};

use super::compiler_syntax_tree::CompilerSyntaxTree;

/// A component as the compiler reads it, whatever syntax it was written in.
#[derive(Clone, Copy, Debug)]
pub struct CompileInput<'a> {
    /// Every JavaScript expression of the component, script and template.
    pub javascript: &'a SyntaxTree,
    /// The instance script's program, or an empty one.
    pub program: NodeIdentifier,
    pub compiler_syntax_tree: &'a CompilerSyntaxTree,
    pub style: Option<&'a rsvelte_stylesheet::StyleSheet>,
    /// Every template expression, in document order.
    pub template_expressions: &'a [NodeIdentifier],
    /// The document: HIR spans index into it.
    pub source_text: &'a str,
    /// Upstream's `preserveWhitespace` option: no trimming or collapsing of template text.
    pub preserve_whitespace: bool,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Target {
    Client,
    Server,
}
