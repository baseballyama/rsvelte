//! Findings as `ESLint` reports them.

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::task::TaskOutput;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::positions::{LineBreaks, LineIndex, Span};

use crate::finding::{Finding, PARSE_ERROR, UNUSED_DIRECTIVE};
use crate::findings::Findings;
use crate::rule::Rule;

pub mod stylish;

/// Bytes of one finding's pretty JSON beyond its rule and message, with room for large positions,
/// so the output is allocated once.
const FINDING_BYTES: usize = 200;

/// `ESLint`'s positions in one document: lines as `lines` counts them, which is with
/// [`LineBreaks::Ecmascript`](rsvelte_kernel::source::positions::LineBreaks), and columns of the
/// text after a leading byte order mark, which `ESLint` removes before it lints.
#[derive(Clone, Copy)]
pub struct Positions<'a> {
    lines: Lines<'a>,
    byte_order_mark: bool,
}

#[derive(Clone, Copy)]
enum Lines<'a> {
    /// Built only when a position is asked for: most documents report nothing.
    Lazy(&'a dyn Fn() -> &'a LineIndex),
    Built(&'a LineIndex),
}

impl std::fmt::Debug for Positions<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Positions")
            .field("byte_order_mark", &self.byte_order_mark)
            .finish_non_exhaustive()
    }
}

impl<'a> Positions<'a> {
    #[must_use]
    pub fn new(lines: &'a dyn Fn() -> &'a LineIndex, source_text: &str) -> Self {
        Self::with(Lines::Lazy(lines), source_text)
    }

    /// The positions of `source_text` from its built `lines`.
    #[must_use]
    pub fn of(lines: &'a LineIndex, source_text: &str) -> Self {
        Self::with(Lines::Built(lines), source_text)
    }

    fn with(lines: Lines<'a>, source_text: &str) -> Self {
        Self {
            lines,
            byte_order_mark: source_text.starts_with('\u{feff}'),
        }
    }

    /// The 1-based line and 0-based UTF-16 column of a byte offset.
    #[must_use]
    pub fn at(self, offset: u32) -> (u32, u32) {
        let lines = match self.lines {
            Lines::Lazy(lines) => lines(),
            Lines::Built(lines) => lines,
        };
        let at = lines.line_column(offset);
        let column = if self.byte_order_mark && at.line == 1 {
            at.column.saturating_sub(1)
        } else {
            at.column
        };
        (at.line, column)
    }
}

/// Runs `rules` over `context` in `document` and writes what they find, or the error a rule
/// failed with.
pub fn run<C: ?Sized, R: Rule<C>>(
    out: &mut TaskOutput,
    document: &DocumentContext<'_>,
    rules: &[R],
    context: &C,
) {
    let mut findings = Findings::new();
    findings.run(rules, context);
    match findings.finish() {
        Ok(findings) => report(
            out,
            Positions::new(
                &|| document.lines(LineBreaks::Ecmascript),
                document.source_text(),
            ),
            rules.iter().map(Rule::identifier),
            findings,
        ),
        Err(error) => out.diagnostics.push(error),
    }
}

/// A lint task's output: `lint.json` as [`render_json`] writes it, and each finding with its fix.
pub fn report<'a>(
    out: &mut TaskOutput,
    positions: Positions<'_>,
    rules: impl IntoIterator<Item = &'a str> + Clone,
    findings: Vec<Finding>,
) {
    out.file("lint.json", render_json(positions, rules, &findings));
    out.findings
        .extend(findings.into_iter().map(Finding::reported));
}

/// A lint task's output when the document does not parse: `lint.json` as
/// [`render_parse_error`] writes it, and the error as the one finding.
pub fn report_parse_error(
    out: &mut TaskOutput,
    positions: Positions<'_>,
    message: &str,
    offset: u32,
) {
    out.file("lint.json", render_parse_error(positions, message, offset));
    out.findings.push(rsvelte_kernel::diagnostics::Finding {
        diagnostic: Diagnostic::error(PARSE_ERROR, message, Span::new(offset, offset))
            .without_end(),
        fix: Vec::new(),
    });
}

/// `{rules, findings: [{rule, message, start: {line, column}, end: {line, column}}]}` with
/// `ESLint`'s positions: 1-based lines and 1-based UTF-16 columns.
///
/// `end` is `null` for a finding without one
/// ([`has_end`](rsvelte_kernel::diagnostics::Diagnostic::has_end)).
///
/// `rules` are the rules that ran, so a comparison can tell a rule that found nothing from one
/// that was never run.
#[must_use]
pub fn render_json<'a>(
    positions: Positions<'_>,
    rules: impl IntoIterator<Item = &'a str> + Clone,
    findings: &[Finding],
) -> String {
    let mut w = StructuredDataWriter::with_capacity(true, capacity(rules.clone(), findings));
    w.begin_object().key("rules").begin_array();
    for r in rules {
        w.write_string(r);
    }
    w.end_array().key("findings").begin_array();
    for d in findings.iter().map(|f| &f.diagnostic) {
        w.begin_object().key("rule");
        if d.code == UNUSED_DIRECTIVE {
            w.null();
        } else {
            w.write_string(&d.code);
        }
        w.key("message").write_string(&d.message).key("start");
        position(&mut w, positions, d.span.start_offset);
        w.key("end");
        if d.has_end {
            position(&mut w, positions, d.span.end_offset);
        } else {
            w.null();
        }
        w.end_object();
    }
    w.end_array().end_object();
    w.finish()
}

/// `ESLint`'s report of a file whose parser threw `message` at `offset`: no rule runs, and the
/// one finding has no rule, no end, and the parser's 0-based column.
#[must_use]
pub fn render_parse_error(positions: Positions<'_>, message: &str, offset: u32) -> String {
    let (line, column) = positions.at(offset);
    let mut w = StructuredDataWriter::with_capacity(true, FINDING_BYTES + message.len());
    w.begin_object()
        .key("rules")
        .begin_array()
        .end_array()
        .key("findings")
        .begin_array()
        .begin_object()
        .key("rule")
        .null()
        .key("message")
        .write_string(&parsing_error(message))
        .key("start")
        .begin_object()
        .key("line")
        .write_number(line)
        .key("column")
        .write_number(column)
        .end_object()
        .key("end")
        .null()
        .end_object()
        .end_array()
        .end_object();
    w.finish()
}

/// The message `ESLint` reports for a parser that threw `message`.
#[must_use]
pub fn parsing_error(message: &str) -> String {
    format!("Parsing error: {message}")
}

/// An upper bound on the report's length, unless a message needs many escapes.
fn capacity<'a>(rules: impl IntoIterator<Item = &'a str>, findings: &[Finding]) -> usize {
    let rules: usize = rules.into_iter().map(|r| r.len() + 8).sum();
    let findings: usize = findings
        .iter()
        .map(|f| FINDING_BYTES + f.diagnostic.code.len() + f.diagnostic.message.len())
        .sum();
    64 + rules + findings
}

fn position(w: &mut StructuredDataWriter, positions: Positions<'_>, offset: u32) {
    let (line, column) = positions.at(offset);
    w.begin_object()
        .key("line")
        .write_number(line)
        .key("column")
        .write_number(column + 1)
        .end_object();
}

#[cfg(test)]
mod tests;
