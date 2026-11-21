use rsvelte_svelte_syntax::syntax_tree::Component;
use rsvelte_typescript_tree::{ProgramIdentifier, Tree};

use crate::compiler_syntax_tree::CompilerSyntaxTree;
use crate::warnings::Section;

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

impl<'a> ComponentInput<'a> {
    /// What [`crate::component_input`] reads from the artifact database, built from the trees.
    #[must_use]
    pub fn new(
        c: &'a Component,
        compiler_syntax_tree: &'a CompilerSyntaxTree,
        source_text: &'a str,
        filename: &'a str,
    ) -> Self {
        Self {
            javascript: &c.javascript,
            instance: c.instance.as_ref().map(|s| s.program),
            module: c.module.as_ref().map(|s| s.program),
            compiler_syntax_tree,
            style: c.style.as_ref().and_then(|s| s.sheet.as_ref().ok()),
            source_text,
            filename,
        }
    }

    /// `<script module>`, then `<script>`, whichever exist.
    pub fn programs(&self) -> impl Iterator<Item = ProgramIdentifier> {
        self.module.into_iter().chain(self.instance)
    }

    /// The part of the component whose program holds `offset`. Unlike [`Section::of`], which reads
    /// the `<script>` elements of the syntax tree, it needs only the programs, which is all a
    /// task holding a `ComponentInput` has.
    #[must_use]
    pub fn section(&self, offset: u32) -> Section {
        let holds = |program: Option<ProgramIdentifier>| {
            program.is_some_and(|p| {
                let span = self.javascript.get_program(p).span;
                span.start <= offset && offset < span.end
            })
        };
        if holds(self.module) {
            Section::Module
        } else if holds(self.instance) {
            Section::Instance
        } else {
            Section::Template
        }
    }
}
