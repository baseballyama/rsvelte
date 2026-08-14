use oxc_allocator::{Allocator, CloneIn};
use oxc_ast::ast::Program;
use oxc_ast_visit::VisitMut;
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
    pub fn clone_program_into_at<'alloc>(
        &self,
        allocator: &'alloc Allocator,
        offset: u32,
    ) -> Program<'alloc> {
        let mut program = self.clone_program_into(allocator);
        ShiftSpans(offset).visit_program(&mut program);
        for comment in &mut program.comments {
            comment.span.start += offset;
            comment.span.end += offset;
            comment.attached_to += offset;
        }
        program
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

struct ShiftSpans(u32);

impl VisitMut<'_> for ShiftSpans {
    fn visit_span(&mut self, span: &mut oxc_span::Span) {
        span.start += self.0;
        span.end += self.0;
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

    #[test]
    fn clone_into_at_offsets_source_spans() {
        let retained = RetainedProgram::parse("let answer = 42;", false);
        let allocator = Allocator::default();
        let cloned = retained.clone_program_into_at(&allocator, 7);

        assert_eq!(cloned.span.start, retained.program().span.start + 7);
        assert_eq!(cloned.span.end, retained.program().span.end + 7);
        assert_eq!(
            cloned.body[0].span().start,
            retained.program().body[0].span().start + 7
        );
        assert_eq!(
            cloned.body[0].span().end,
            retained.program().body[0].span().end + 7
        );
    }

    #[test]
    fn clone_into_at_offsets_comments() {
        let retained = RetainedProgram::parse("// note\nlet answer = 42;", false);
        let allocator = Allocator::default();
        let cloned = retained.clone_program_into_at(&allocator, 7);

        assert_eq!(
            cloned.comments[0].span.start,
            retained.program().comments[0].span.start + 7
        );
        assert_eq!(
            cloned.comments[0].span.end,
            retained.program().comments[0].span.end + 7
        );
        assert_eq!(
            cloned.comments[0].attached_to,
            retained.program().comments[0].attached_to + 7
        );
    }
}
