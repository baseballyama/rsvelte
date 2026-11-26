//! Where acorn stops at a number it reads shorter than oxc does, such as `0b1` of `0b12`.

use oxc_diagnostics::OxcDiagnostic;
use oxc_parser::config::TokensParserConfig;
use oxc_parser::{Parser, Token};
use oxc_span::{GetSpan, SourceType};

use super::parentheses;
use crate::scratch::with_scratch_arena;
use crate::syntax_error::{Acorn, shorter_number};

/// How a part was read, from where, to read it again.
#[derive(Clone, Copy)]
pub(super) enum Reading {
    Expression(u32),
    Statement(u32),
    Program(u32),
}

/// Where acorn stops, from the first of a part's `diagnostics` the host reports, when acorn reads
/// the number oxc rejects there as a shorter one that its parser takes nowhere there: on the text
/// up to that shorter number, oxc's parser fails anew before it, or ends the part before it.
#[cold]
pub(super) fn at_shorter_number(
    (diagnostics, first, tokens): (&[OxcDiagnostic], usize, &[Token]),
    (text, shift): (&str, u32),
    (reading, source_type): (Reading, SourceType),
) -> Option<Acorn> {
    let (number, end) = shorter_number(diagnostics.get(first)?, text, tokens)?;
    let anew = |error: &OxcDiagnostic| {
        (error.labels.first()).is_some_and(|label| label.offset() <= number)
            && !diagnostics.contains(error)
    };
    // Past the shorter number a reread meets what the first read never reached, such as the
    // `as` of `{#each (0b12) as v}`.
    stops_before(&text[..end as usize], number, (reading, source_type), anew)
        .then_some(Acorn::Stops(number + shift))
}

/// Whether oxc's parser, reading `text` the way `reading` did, reports an error `anew` accepts, or
/// ends the part before `number`.
fn stops_before(
    text: &str,
    number: u32,
    (reading, source_type): (Reading, SourceType),
    anew: impl Fn(&OxcDiagnostic) -> bool,
) -> bool {
    with_scratch_arena(|allocator| {
        let parser = || {
            Parser::new(allocator, text, source_type)
                .with_options(parentheses::options(false))
                .with_config(TokensParserConfig)
        };
        let fails = |diagnostics: &[OxcDiagnostic]| diagnostics.iter().any(&anew);
        let ends = |end: u32| end <= number;
        match reading {
            Reading::Expression(start) => match parser().parse_expression_at(start) {
                Ok(read) => fails(&read.diagnostics) || ends(read.expression.span().end),
                Err(error) => fails(&error.diagnostics),
            },
            Reading::Statement(start) => match parser().parse_statement_at(start) {
                Ok(read) => fails(&read.diagnostics) || ends(read.statement.span().end),
                Err(error) => fails(&error.diagnostics),
            },
            Reading::Program(start) => fails(&parser().with_start(start).parse().diagnostics),
        }
    })
}
