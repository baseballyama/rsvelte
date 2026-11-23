//! Spans, diagnostics and edits as the Language Server Protocol writes them: lines that end at
//! CR, LF or CRLF, and columns in UTF-16 code units.

use rsvelte_kernel::computation::pipeline::DocumentResult;
use rsvelte_kernel::diagnostics::{self, Severity};
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::{LineBreaks, LineIndex, Span};
use rsvelte_lint_runner::finding::{message, rule};
use tower_lsp_server::gen_lsp_types::{
    Code, Diagnostic, DiagnosticSeverity, Message, Position, Range, TextEdit,
};

/// What every diagnostic names as its source.
const SOURCE: &str = "rsvelte";

/// The lines of `text`, as a client counts them.
pub(super) fn lines(text: &str) -> LineIndex {
    LineIndex::with_breaks(text, LineBreaks::LanguageServer)
}

/// The position of byte `offset`, rounded as [`LineIndex::line_column`] rounds.
pub(super) fn position(lines: &LineIndex, offset: u32) -> Position {
    let at = lines.line_column(offset);
    Position::new(at.line - 1, at.column)
}

pub(super) fn range(lines: &LineIndex, span: Span) -> Range {
    Range::new(
        position(lines, span.start_offset),
        position(lines, span.end_offset),
    )
}

/// Every diagnostic and finding of `result`, in the order the tasks report them, positioned in
/// `document`'s text. A diagnostic without an end is empty, at its start.
pub(super) fn diagnostics(document: &Document, result: &DocumentResult) -> Vec<Diagnostic> {
    if let Some(panic) = &result.panic {
        return vec![failure(format!("rsvelte panicked: {panic}"))];
    }
    let lines = lines(&document.text);
    (result.outputs.iter())
        .flat_map(|(_, out)| {
            (out.diagnostics.iter()).chain(out.findings.iter().map(|f| &f.diagnostic))
        })
        .map(|diagnostic| self::diagnostic(&lines, diagnostic))
        .collect()
}

pub(super) fn diagnostic(lines: &LineIndex, diagnostic: &diagnostics::Diagnostic) -> Diagnostic {
    let span = if diagnostic.has_end {
        diagnostic.span
    } else {
        Span::new(diagnostic.span.start_offset, diagnostic.span.start_offset)
    };
    Diagnostic {
        range: range(lines, span),
        severity: Some(match diagnostic.severity {
            Severity::Error => DiagnosticSeverity::Error,
            Severity::Warning => DiagnosticSeverity::Warning,
        }),
        code: rule(&diagnostic.code).map(|rule| Code::String(rule.to_owned())),
        source: Some(SOURCE.to_owned()),
        message: Message::String(message(diagnostic).into_owned()),
        ..Diagnostic::default()
    }
}

/// An error at the start of the document, for a lint that did not run.
pub(super) fn failure(message: String) -> Diagnostic {
    Diagnostic {
        severity: Some(DiagnosticSeverity::Error),
        source: Some(SOURCE.to_owned()),
        message: Message::String(message),
        ..Diagnostic::default()
    }
}

/// One edit that turns `old` into `new`: the part between their common start and end, or `None`
/// when they are equal.
pub(super) fn edit(old: &str, new: &str) -> Option<TextEdit> {
    if old == new {
        return None;
    }
    // A position cannot fall between the CR and the LF of a line break: the client would take
    // the end of the line instead.
    let splits = |at: usize| {
        !old.is_char_boundary(at) || (at > 0 && old.as_bytes()[at - 1..].starts_with(b"\r\n"))
    };
    let mut start = (old.bytes().zip(new.bytes()))
        .take_while(|(a, b)| a == b)
        .count();
    while splits(start) || !new.is_char_boundary(start) {
        start -= 1;
    }
    let most = old.len().min(new.len()) - start;
    let mut end = (old.bytes().rev().zip(new.bytes().rev()))
        .take(most)
        .take_while(|(a, b)| a == b)
        .count();
    while splits(old.len() - end) || !new.is_char_boundary(new.len() - end) {
        end -= 1;
    }
    let lines = lines(old);
    let span = Span::new(start as u32, (old.len() - end) as u32);
    Some(TextEdit::new(
        range(&lines, span),
        new[start..new.len() - end].to_owned(),
    ))
}

#[cfg(test)]
mod tests;
