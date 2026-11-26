//! How the errors of a part oxc read become the error its host reports.

use oxc_diagnostics::OxcDiagnostic;
use oxc_parser::{PartError, Token};
use oxc_span::SourceType;

use super::{Part, TreeBuilder};
use crate::acorn_grammar::{Unsupported, lexed, read, read_before_stopping, rejection};
use crate::syntax_error::{
    Locator, SyntaxError, acorn, reported, syntax_error, typescript_eslint_at,
};

impl<'a> TreeBuilder<'a> {
    /// The first error of a part oxc read the host reports, if any; `text`, `tokens` and `part`
    /// are the part's, for what acorn reports.
    pub(super) fn check(
        &mut self,
        diagnostics: &[OxcDiagnostic],
        (text, fallback, shift): (&str, u32, u32),
        (tokens, next_token, irregular): (&[Token], Option<Token>, &[oxc_span::Span]),
        (part, source_type): (Part<'_, 'a>, SourceType),
    ) -> Result<(), SyntaxError> {
        let visit = |locator: &mut Locator| part.walk(locator);
        let as_acorn = self.as_acorn.is_some();
        let first =
            (diagnostics.iter()).position(|error| reported(error, self.unchecked, as_acorn, visit));
        let stop = if as_acorn && (first.is_some() || self.acorn_rejection.is_none()) {
            let mut unsupported = Unsupported::new(self.typescript_reader(source_type), tokens);
            part.walk(&mut unsupported);
            let unsupported = unsupported.first.map(|stop| stop.shifted(shift));
            // Without a diagnostic, the walk finds the literals acorn's lexer rejects.
            let read = read(
                if diagnostics.is_empty() { &[] } else { tokens },
                next_token,
            );
            let typescript = self.typescript_reader(source_type);
            let lexed = lexed(text, read, (irregular, typescript), shift);
            unsupported
                .into_iter()
                .chain(lexed)
                .min_by_key(|stop| stop.raised)
        } else {
            None
        };
        if let Some(first) = first {
            // acorn may fail at the token after the part, which the parser read to end it.
            let acorn = acorn(&diagnostics[first], text, (tokens, next_token), visit);
            let errors = diagnostics.iter().skip(first).cloned();
            let mut error = syntax_error(errors, text, &[], fallback, shift);
            error.acorn = acorn.map(|acorn| acorn.shifted(shift));
            error.typescript_eslint_at =
                typescript_eslint_at(&diagnostics[first], visit).map(|at| at + shift);
            // acorn throws where it stops first, before an error oxc reports later or at the same
            // place.
            return Err(match stop {
                Some(stop) if stop.raised <= error.acorn_raised_at() => rejection(stop),
                _ => error,
            });
        }
        if self.acorn_rejection.is_none() {
            self.acorn_rejection = stop;
        }
        // Another reader of the part may throw on what this host lets pass.
        (self.unchecked_errors).extend(
            (diagnostics.iter())
                .map(|error| syntax_error([error.clone()], text, tokens, fallback, shift)),
        );
        Ok(())
    }

    /// The error of a part oxc cannot read, or where acorn stops before it at whitespace
    /// ECMAScript does not allow.
    #[cold]
    pub(super) fn fatal(
        &self,
        error: PartError<'_>,
        (text, fallback, shift): (&str, u32, u32),
        source_type: SourceType,
    ) -> SyntaxError {
        let stop = (self.as_acorn.is_some())
            .then(|| {
                let read = read_before_stopping(text, &error.tokens, &error.diagnostics);
                let typescript = self.typescript_reader(source_type);
                lexed(
                    text,
                    read,
                    (&error.irregular_whitespaces, typescript),
                    shift,
                )
            })
            .flatten();
        let syntax_error = syntax_error(error.diagnostics, text, &error.tokens, fallback, shift);
        match stop {
            Some(stop) if stop.raised <= syntax_error.acorn_raised_at() => rejection(stop),
            _ => syntax_error,
        }
    }
}
