use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_typescript::{NodeIdentifier, SyntaxTree};

#[derive(Debug)]
pub struct LoweredModule<'a> {
    tree: SyntaxTree,
    program: NodeIdentifier,
    source_text: &'a str,
}

impl<'a> LoweredModule<'a> {
    pub(crate) const fn new(
        tree: SyntaxTree,
        program: NodeIdentifier,
        source_text: &'a str,
    ) -> Self {
        Self {
            tree,
            program,
            source_text,
        }
    }

    #[must_use]
    pub fn emit(&self) -> Emitter {
        rsvelte_typescript_compile::codegen::print_program(
            &self.tree,
            self.source_text,
            self.program,
        )
    }
}
