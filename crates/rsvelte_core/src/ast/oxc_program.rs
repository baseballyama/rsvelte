use oxc_allocator::{Allocator, CloneIn};
use oxc_ast::ast::Program;
use oxc_diagnostics::OxcDiagnostic;
use oxc_parser::Parser;
use oxc_span::SourceType;
use self_cell::self_cell;

struct ProgramOwner<'source> {
    allocator: Allocator,
    source: &'source str,
    source_type: SourceType,
}

impl ProgramOwner<'_> {
    const fn source(&self) -> &str {
        self.source
    }
}

struct ParsedProgram<'alloc> {
    program: Program<'alloc>,
    diagnostics: Vec<OxcDiagnostic>,
    panicked: bool,
}

self_cell!(
    pub struct RetainedProgram<'source> {
        owner: ProgramOwner<'source>,

        #[covariant]
        dependent: ParsedProgram,
    }
);

impl<'source> RetainedProgram<'source> {
    #[must_use]
    pub fn parse(source: &'source str, is_typescript: bool) -> Self {
        let source_type = if is_typescript {
            SourceType::ts()
        } else {
            SourceType::mjs()
        };
        Self::new(
            ProgramOwner {
                allocator: Allocator::default(),
                source,
                source_type,
            },
            |owner| {
                let parsed =
                    Parser::new(&owner.allocator, owner.source(), owner.source_type).parse();
                ParsedProgram {
                    program: parsed.program,
                    diagnostics: parsed.diagnostics.into_vec(),
                    panicked: parsed.panicked,
                }
            },
        )
    }

    #[must_use]
    pub fn program(&self) -> &Program<'_> {
        &self.borrow_dependent().program
    }

    #[must_use]
    pub fn clone_program_into<'alloc>(&self, allocator: &'alloc Allocator) -> Program<'alloc> {
        self.program().clone_in(allocator)
    }

    #[must_use]
    pub fn source(&self) -> &str {
        self.borrow_owner().source()
    }

    pub fn diagnostics(&self) -> &[OxcDiagnostic] {
        &self.borrow_dependent().diagnostics
    }

    #[must_use]
    pub fn panicked(&self) -> bool {
        self.borrow_dependent().panicked
    }
}

impl std::fmt::Debug for RetainedProgram<'_> {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter
            .debug_struct("RetainedProgram")
            .field("body_len", &self.program().body.len())
            .field("comments_len", &self.program().comments.len())
            .field("diagnostics_len", &self.diagnostics().len())
            .field("panicked", &self.panicked())
            .finish()
    }
}

// SAFETY: The allocator and its AST move together and are only accessible through ownership.
unsafe impl Send for RetainedProgram<'_> {}

#[derive(Debug, Default)]
pub(crate) struct RetainedScripts<'source> {
    pub instance: Option<RetainedProgram<'source>>,
    pub module: Option<RetainedProgram<'source>>,
}

#[cfg(test)]
mod tests {
    use super::RetainedProgram;
    use oxc_allocator::Allocator;
    use oxc_span::GetSpan;

    #[test]
    fn retains_program_after_move() {
        let retained = RetainedProgram::parse("// note\nexport const answer = 42;", false);
        let moved = retained;

        assert_eq!(moved.program().body.len(), 1);
        assert_eq!(moved.program().comments.len(), 1);
        assert!(moved.diagnostics().is_empty());
        assert!(!moved.panicked());
    }

    #[test]
    fn is_send_when_owner_and_program_move_together() {
        fn assert_send<T: Send>() {}
        assert_send::<RetainedProgram<'static>>();
    }

    #[test]
    fn clone_into_preserves_source_spans() {
        let retained = RetainedProgram::parse("let answer = 42;", false);
        let allocator = Allocator::default();
        let cloned = retained.clone_program_into(&allocator);

        assert_eq!(cloned.span, retained.program().span);
        assert_eq!(cloned.body[0].span(), retained.program().body[0].span());
    }
}
