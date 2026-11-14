use oxc_diagnostics::Diagnostics;
use oxc_parser::Parser;
use oxc_parser::config::TokensParserConfig;
use oxc_span::SourceType;
use rsvelte_kernel::source::positions::Span;

use super::{Builder, Part, parentheses};
use crate::ProgramIdentifier;
use crate::syntax_error::{SyntaxError, acorn, syntax_error};

impl<'a> Builder<'a> {
    /// Parses `range` of the document as a program, such as the body of a `<script>` element.
    ///
    /// # Errors
    ///
    /// The first syntax error.
    pub fn program(
        &mut self,
        range: Span,
        source_type: SourceType,
    ) -> Result<ProgramIdentifier, SyntaxError> {
        let text = &self.source_text[..range.end_offset as usize];
        self.parse_program(text, range.start_offset, source_type)
    }

    /// [`Self::program`], for a host that reports another error than the first, or whose own
    /// parser tolerates some of oxc's errors.
    ///
    /// # Errors
    ///
    /// Every error oxc reported, in order, with the program oxc recovered when no error stopped
    /// it.
    pub fn program_or_errors(
        &mut self,
        range: Span,
        source_type: SourceType,
    ) -> Result<ProgramIdentifier, Rejected> {
        let text = &self.source_text[..range.end_offset as usize];
        let start = range.start_offset;
        self.read_program(text, start, source_type, true)
            .map_err(|rejected| {
                let errors = rejected.diagnostics.into_iter();
                Rejected {
                    errors: errors.map(|e| syntax_error([e], text, start, 0)).collect(),
                    recovered: rejected.recovered,
                }
            })
    }

    /// Parses `text[start..]`, where `text` is the document up to the program's end.
    pub(crate) fn parse_program(
        &mut self,
        text: &'a str,
        start: u32,
        source_type: SourceType,
    ) -> Result<ProgramIdentifier, SyntaxError> {
        self.read_program(text, start, source_type, false)
            .map_err(|rejected| rejected.error)
    }

    /// [`Self::parse_program`], with oxc's errors when it fails, and, when `keep_recovered`, the
    /// program oxc recovered unless an error stopped it.
    fn read_program(
        &mut self,
        text: &'a str,
        start: u32,
        source_type: SourceType,
        keep_recovered: bool,
    ) -> Result<ProgramIdentifier, Box<Read>> {
        let parsed = Parser::new(self.allocator, text, source_type)
            .with_options(parentheses::options(false))
            .with_config(TokensParserConfig)
            .with_start(start)
            .parse();
        if parsed.fatal_error {
            let acorn = (parsed.diagnostics.first())
                .and_then(|first| acorn(first, text, &parsed.tokens, |_| {}));
            let mut error = syntax_error(parsed.diagnostics.iter().cloned(), text, start, 0);
            error.acorn = acorn;
            return Err(Box::new(Read {
                error,
                diagnostics: parsed.diagnostics,
                recovered: None,
            }));
        }
        let part = Part::Program(&parsed.program);
        let rejection = match self.check(
            &parsed.diagnostics,
            (text, start, 0),
            &parsed.tokens,
            (part, source_type),
        ) {
            Ok(()) => None,
            Err(error) if keep_recovered => Some(error),
            Err(error) => {
                return Err(Box::new(Read {
                    error,
                    diagnostics: parsed.diagnostics,
                    recovered: None,
                }));
            }
        };
        self.record(&parsed.tokens, &parsed.program.comments, 0);
        let mut program = parsed.program;
        // Its spans are the document's, so a task that reads text at a span reads the document.
        program.source_text = self.source_text;
        let identifier = ProgramIdentifier::at(self.programs.len());
        self.programs.push(program);
        match rejection {
            None => Ok(identifier),
            Some(error) => Err(Box::new(Read {
                error,
                diagnostics: parsed.diagnostics,
                recovered: Some(identifier),
            })),
        }
    }
}

/// What oxc read of a program the host's parser rejects.
#[derive(Debug)]
pub struct Rejected {
    /// Every error oxc reported, in order.
    pub errors: Vec<SyntaxError>,
    /// The program oxc recovered; `None` when an error stopped it.
    pub recovered: Option<ProgramIdentifier>,
}

/// [`Builder::read_program`]'s rejection.
struct Read {
    error: SyntaxError,
    diagnostics: Diagnostics,
    recovered: Option<ProgramIdentifier>,
}
