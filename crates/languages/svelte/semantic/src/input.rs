use rsvelte_typescript_tree::{ProgramIdentifier, Tree};

use crate::compiler_syntax_tree::CompilerSyntaxTree;

/// Shared component trees and source data, independent of task options.
#[derive(Clone, Copy, Debug)]
pub struct ComponentInput<'a> {
    /// Every JavaScript expression of the component, script and template.
    pub javascript: &'a Tree,
    pub instance: Option<ProgramIdentifier>,
    pub module: Option<ProgramIdentifier>,
    pub compiler_syntax_tree: &'a CompilerSyntaxTree,
    pub style: Option<&'a rsvelte_stylesheet_syntax::StyleSheet>,
    pub filename: &'a str,
    /// The document: HIR spans index into it.
    pub source_text: &'a str,
}
