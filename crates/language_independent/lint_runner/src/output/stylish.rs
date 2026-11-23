//! Findings as `ESLint`'s `stylish` formatter prints them.

use std::fmt::Write as _;

use rsvelte_kernel::computation::pipeline::DocumentResult;
use rsvelte_kernel::diagnostics::{Diagnostic, Severity};
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::{LineBreaks, LineIndex};

use super::Positions;
use crate::finding::{PARSE_ERROR, UNUSED_DIRECTIVE, message, rule};

/// The report in `ESLint`'s `stylish` layout of each document with its result, and how many
/// errors it lists.
#[must_use]
pub fn render_stylish<'a>(
    linted: impl IntoIterator<Item = (&'a Document, &'a DocumentResult)>,
    colors: bool,
) -> (String, usize) {
    let mut out = String::new();
    let (mut errors, mut warnings) = (0, 0);
    let (mut fixable_errors, mut fixable_warnings) = (0, 0);
    for (document, result) in linted {
        if let Some(panic) = &result.panic {
            writeln!(out, "\n{}\n  rsvelte panicked: {panic}", document.path)
                .expect("writing to a String");
            errors += 1;
        }
        // Each problem, and whether `ESLint` would count it as fixable. `ESLint` fixes an unused
        // directive by deleting it, a fix rsvelte does not attach.
        let mut problems: Vec<(&Diagnostic, bool)> = (result.outputs.iter())
            .flat_map(|(_, out)| {
                (out.diagnostics.iter().map(|d| (d, false))).chain(out.findings.iter().map(|f| {
                    let d = &f.diagnostic;
                    (d, !f.fix.is_empty() || d.code == UNUSED_DIRECTIVE)
                }))
            })
            .collect();
        if problems.is_empty() {
            continue;
        }
        problems.sort_by_key(|(d, _)| d.span.start_offset);
        for &(d, fixable) in &problems {
            let (count, fixable_count) = match d.severity {
                Severity::Error => (&mut errors, &mut fixable_errors),
                Severity::Warning => (&mut warnings, &mut fixable_warnings),
            };
            *count += 1;
            *fixable_count += usize::from(fixable);
        }
        let index = LineIndex::with_breaks(&document.text, LineBreaks::Ecmascript);
        let positions = Positions::of(&index, &document.text);
        let rows: Vec<(Severity, [String; 4])> = (problems.iter())
            .map(|&(d, _)| row(d, &positions))
            .collect();
        let width = |column: usize| {
            (rows.iter())
                .map(|(_, text)| text[column].chars().count())
                .max()
                .unwrap_or(0)
        };
        let severity_width = (rows.iter())
            .map(|(severity, _)| severity.as_str().len())
            .max()
            .unwrap_or(0);
        let widths = [width(0), width(1), severity_width, width(2)];
        // `ESLint` names each file by its absolute path.
        let shown = (document.file.as_deref())
            .and_then(|file| std::path::absolute(file).ok())
            .map_or_else(|| document.path.clone(), |file| file.display().to_string());
        writeln!(out, "\n{}", paint(colors, "4", &shown)).expect("writing to a String");
        // `stylish` aligns the line to the right and the column to the left, then joins them.
        for (severity, [line, column, message, code]) in &rows {
            let tone = match severity {
                Severity::Error => "31",
                Severity::Warning => "33",
            };
            let padding = widths[1] - column.len();
            let message_width = widths[3];
            let row = format!(
                "  {}{:padding$}  {}  {message:<message_width$}  {}",
                paint(colors, "2", &format!("{line:>0$}:{column}", widths[0])),
                "",
                paint(
                    colors,
                    tone,
                    &format!("{:<1$}", severity.as_str(), widths[2])
                ),
                paint(colors, "2", code),
            );
            // A row with no rule ends at its message, as `text-table` trims it.
            writeln!(out, "{}", row.trim_end()).expect("writing to a String");
        }
    }
    let total = errors + warnings;
    if total > 0 {
        let summary = format!(
            "\u{2716} {total} {} ({errors} {}, {warnings} {})",
            plural(total, "problem"),
            plural(errors, "error"),
            plural(warnings, "warning"),
        );
        let tone = if errors > 0 { "1;31" } else { "1;33" };
        writeln!(out, "\n{}", paint(colors, tone, &summary)).expect("writing to a String");
        if fixable_errors > 0 || fixable_warnings > 0 {
            let fixable = format!(
                "  {fixable_errors} {} and {fixable_warnings} {} potentially fixable with the \
                 `--fix` option.",
                plural(fixable_errors, "error"),
                plural(fixable_warnings, "warning"),
            );
            writeln!(out, "{}", paint(colors, tone, &fixable)).expect("writing to a String");
        }
        // `ESLint` prints the report with `console.log`, which adds a line of its own.
        out.push('\n');
    }
    (out, errors)
}

/// A problem's severity, and its line, column, message and rule as `stylish` prints them.
fn row(d: &Diagnostic, positions: &Positions<'_>) -> (Severity, [String; 4]) {
    let (line, column) = positions.at(d.span.start_offset);
    // A parse error is printed as `lint.json` reports it: the parser's 0-based column, its
    // message as the parser wrote it, and no rule.
    let parse_error = d.code == PARSE_ERROR;
    let text = [
        line.to_string(),
        (if parse_error { column } else { column + 1 }).to_string(),
        if parse_error {
            without_period(message(d).into_owned())
        } else {
            without_period(d.message.replace('\n', " "))
        },
        rule(&d.code).unwrap_or_default().to_owned(),
    ];
    (d.severity, text)
}

/// `message` without the final period that `stylish` drops after a character other than a space.
fn without_period(message: String) -> String {
    match message.strip_suffix('.') {
        Some(rest) if !rest.is_empty() && !rest.ends_with(' ') => rest.to_owned(),
        _ => message,
    }
}

fn plural(count: usize, noun: &str) -> String {
    if count == 1 {
        noun.to_owned()
    } else {
        format!("{noun}s")
    }
}

/// `text` in the SGR style `code` when `colors` is on.
fn paint(colors: bool, code: &str, text: &str) -> String {
    // `chalk` leaves an empty text without codes.
    if colors && !text.is_empty() {
        format!("\u{1b}[{code}m{text}\u{1b}[0m")
    } else {
        text.to_owned()
    }
}

#[cfg(test)]
mod tests;
