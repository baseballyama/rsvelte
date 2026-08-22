//! Retained OXC programs shared by every script-processing pass.

use oxc_ast::ast as oxc;

use crate::ast::oxc_program::RetainedProgram;
use crate::ast::template::Root;

pub struct ParsedScript<'source> {
    retained: RetainedProgram<'source>,
}

/// A repair writes a line break where oxc reported one was missing, so that
/// offset can never report again; the cap only bounds a parser that keeps
/// finding new ones.
const MAX_ASI_REPAIRS: usize = 64;

/// Official svelte2tsx parses with TypeScript, whose parser is error-tolerant and
/// yields a usable AST for a script that does not parse; oxc discards the AST on
/// a fatal error, so a broken script would otherwise lose every script transform.
///
/// Recover the class that dominates a half-typed script — a statement the author
/// has not terminated yet — by writing the line break the source omits where oxc
/// says the semicolon belongs. The rewrite is length-preserving, so every span
/// still lines up with the original source and MagicString keeps emitting the
/// author's own text.
fn recover_from_missing_asi(source: &str, mut offset: usize) -> Option<RetainedProgram<'static>> {
    let mut text = source.to_string();
    for _ in 0..MAX_ASI_REPAIRS {
        // Only a horizontal-whitespace byte can become the line break without
        // moving anything else; a comment or a token there is not repairable.
        if !matches!(text.as_bytes().get(offset), Some(b' ' | b'\t')) {
            return None;
        }
        text.replace_range(offset..=offset, "\n");

        let retained = RetainedProgram::parse_owned(text, true);
        if !retained.panicked() {
            return Some(retained);
        }
        offset = missing_asi_offset(&retained)?;
        text = retained.source().to_string();
    }
    None
}

/// The byte offset oxc reports for its unrecoverable missing-semicolon error.
fn missing_asi_offset(retained: &RetainedProgram<'_>) -> Option<usize> {
    retained
        .diagnostics()
        .iter()
        .find(|diagnostic| {
            diagnostic
                .message
                .starts_with("Expected a semicolon or an implicit semicolon")
        })?
        .labels
        .first()
        .map(|label| label.offset() as usize)
}

impl<'source> ParsedScript<'source> {
    fn new(script: &mut crate::ast::template::Script<'source>) -> Self {
        let mut retained = RetainedProgram::parse(script.raw_content, true);
        // raw_content doubles as the lenient script-parse failure marker, and it
        // keeps that meaning after a recovery re-parse: the source really did not
        // parse, the transforms simply have a program to work from now.
        let parsed_cleanly = retained.diagnostics().is_empty();
        if retained.panicked()
            && let Some(offset) = missing_asi_offset(&retained)
            && let Some(recovered) = recover_from_missing_asi(script.raw_content, offset)
        {
            retained = recovered;
        }
        if parsed_cleanly {
            script.raw_content = "";
        }
        Self { retained }
    }

    pub(crate) fn program(&self) -> &oxc::Program<'_> {
        self.retained.program()
    }

    pub(crate) fn source(&self) -> &str {
        self.retained.source()
    }
}

pub struct ParsedScripts<'source> {
    pub(crate) instance: Option<ParsedScript<'source>>,
    pub(crate) module: Option<ParsedScript<'source>>,
}

impl<'source> ParsedScripts<'source> {
    pub(crate) fn new(ast: &mut Root<'source>) -> Self {
        Self {
            instance: ast
                .instance
                .as_mut()
                .map(|script| ParsedScript::new(script)),
            module: ast.module.as_mut().map(|script| ParsedScript::new(script)),
        }
    }
}

#[inline]
pub(super) fn with_parsed_script<F, R>(script: &ParsedScript<'_>, f: F) -> R
where
    F: FnOnce(&oxc::Program, &str) -> R,
{
    f(script.program(), script.source())
}
