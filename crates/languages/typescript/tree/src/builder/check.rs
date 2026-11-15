//! How the errors of a part oxc read become the error its host reports.

use oxc_diagnostics::OxcDiagnostic;
use oxc_parser::{PartError, Token};
use oxc_span::SourceType;

use super::{Builder, Part};
use crate::acorn_grammar::{Unsupported, rejection, whitespace};
use crate::syntax_error::{
    Locator, SyntaxError, TYPESCRIPT_ESLINT_CHECKS, acorn, reported, syntax_error, typescript_code,
    typescript_eslint_at,
};

impl<'a> Builder<'a> {
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
        let first = (diagnostics.iter())
            .position(|error| reported(error, self.unchecked, self.as_acorn, visit));
        let stop = if self.as_acorn && (first.is_some() || self.acorn_rejection.is_none()) {
            let mut unsupported = Unsupported::new(source_type.is_typescript(), tokens);
            part.walk(&mut unsupported);
            let unsupported = unsupported.first.map(|(at, why)| (at + shift, why));
            unsupported
                .into_iter()
                .chain(whitespace(text, irregular, shift))
                .min_by_key(|stop| stop.0)
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
                Some(stop) if stop.0 <= error.acorn_at() => rejection(stop),
                _ => error,
            });
        }
        if self.acorn_rejection.is_none() {
            self.acorn_rejection = stop;
        }
        // typescript-eslint throws some of what this host lets pass, from its own checks.
        (self.unchecked_errors).extend(
            (diagnostics.iter())
                .filter(|error| {
                    typescript_code(error)
                        .is_some_and(|code| TYPESCRIPT_ESLINT_CHECKS.contains(&code))
                })
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
        text: &str,
        fallback: u32,
        shift: u32,
    ) -> SyntaxError {
        let stop = (self.as_acorn)
            .then(|| whitespace(text, &error.irregular_whitespaces, shift))
            .flatten();
        let syntax_error = syntax_error(error.diagnostics, text, &error.tokens, fallback, shift);
        match stop {
            Some(stop) if stop.0 <= syntax_error.acorn_at() => rejection(stop),
            _ => syntax_error,
        }
    }
}
