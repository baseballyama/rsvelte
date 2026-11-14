use oxc_diagnostics::Diagnostics;
use oxc_parser::Parser;
use oxc_parser::config::TokensParserConfig;
use oxc_span::SourceType;
use rsvelte_kernel::source::positions::Span;

use super::{Builder, Part, options};
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

    /// [`Self::program`], for a host that reports another error than the first.
    ///
    /// # Errors
    ///
    /// Every error oxc reported, in order, when the host's parser rejects the program.
    pub fn program_or_errors(
        &mut self,
        range: Span,
        source_type: SourceType,
    ) -> Result<ProgramIdentifier, Vec<SyntaxError>> {
        let text = &self.source_text[..range.end_offset as usize];
        let start = range.start_offset;
        self.read_program(text, start, source_type)
            .map_err(|rejected| {
                let errors = rejected.1.into_iter();
                errors.map(|e| syntax_error([e], text, start, 0)).collect()
            })
    }

    /// Parses `text[start..]`, where `text` is the document up to the program's end.
    pub(crate) fn parse_program(
        &mut self,
        text: &'a str,
        start: u32,
        source_type: SourceType,
    ) -> Result<ProgramIdentifier, SyntaxError> {
        self.read_program(text, start, source_type)
            .map_err(|rejected| rejected.0)
    }

    /// [`Self::parse_program`], with oxc's errors when it fails.
    fn read_program(
        &mut self,
        text: &'a str,
        start: u32,
        source_type: SourceType,
    ) -> Result<ProgramIdentifier, Box<(SyntaxError, Diagnostics)>> {
        let parsed = Parser::new(self.allocator, text, source_type)
            .with_options(options())
            .with_config(TokensParserConfig)
            .with_start(start)
            .parse();
        if parsed.fatal_error {
            let acorn = (parsed.diagnostics.first())
                .and_then(|first| acorn(first, text, &parsed.tokens, |_| {}));
            let mut error = syntax_error(parsed.diagnostics.iter().cloned(), text, start, 0);
            error.acorn = acorn;
            return Err(Box::new((error, parsed.diagnostics)));
        }
        let part = Part::Program(&parsed.program);
        if let Err(error) = self.check(
            &parsed.diagnostics,
            (text, start, 0),
            &parsed.tokens,
            (part, source_type),
        ) {
            return Err(Box::new((error, parsed.diagnostics)));
        }
        self.record(&parsed.tokens, &parsed.program.comments, 0);
        let mut program = parsed.program;
        // Its spans are the document's, so a task that reads text at a span reads the document.
        program.source_text = self.source_text;
        let identifier = ProgramIdentifier::at(self.programs.len());
        self.programs.push(program);
        Ok(identifier)
    }
}
