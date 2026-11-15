//! `rsvelte lint [<path>...]`: the lint tasks over every file below the paths, printed as
//! `ESLint`'s `stylish` formatter prints them.

use std::fmt::Write as _;
use std::io::{IsTerminal, Write as _};
use std::process::ExitCode;

use rsvelte_kernel::computation::pipeline::{self, DocumentResult, RunOptions, Sharing};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::{Diagnostic, Severity};
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::LineIndex;

use super::files;
use crate::usage;

/// What `lint` runs without `--task`: the lint of every language.
pub(crate) const TASKS: &[&str] = &["svelte.lint/default", "ts.lint/default", "vue.lint/default"];

/// Lints the files below `paths` and prints the problems. Exit code 1 means an error is left.
pub(crate) fn lint(reg: &Registry, paths: &[&str], tasks: &[&str]) -> ExitCode {
    let documents = match files::load(reg, paths, tasks) {
        Ok(documents) => documents,
        Err(e) => return usage(&e),
    };
    let options = RunOptions {
        tasks,
        sharing: Sharing::Shared,
        threads: None,
    };
    let results = match pipeline::run(reg, &documents, &options) {
        Ok(results) => results,
        Err(e) => return usage(&e.to_string()),
    };
    let (text, errors) = report(&documents, &results, std::io::stdout().is_terminal());
    // A closed pipe, as `| head` closes it, only cuts the report short.
    drop(std::io::stdout().lock().write_all(text.as_bytes()));
    if errors > 0 {
        ExitCode::FAILURE
    } else {
        ExitCode::SUCCESS
    }
}

/// The report in `ESLint`'s `stylish` layout, and how many errors it lists.
fn report(documents: &[Document], results: &[DocumentResult], colors: bool) -> (String, usize) {
    let mut out = String::new();
    let (mut errors, mut warnings) = (0, 0);
    for (document, result) in documents.iter().zip(results) {
        if let Some(panic) = &result.panic {
            writeln!(out, "\n{}\n  rsvelte panicked: {panic}", document.path)
                .expect("writing to a String");
            errors += 1;
        }
        let mut problems: Vec<&Diagnostic> = (result.outputs.iter())
            .flat_map(|(_, out)| {
                (out.diagnostics.iter()).chain(out.findings.iter().map(|f| &f.diagnostic))
            })
            .collect();
        if problems.is_empty() {
            continue;
        }
        problems.sort_by_key(|d| d.span.start_offset);
        let lines = LineIndex::new(&document.text);
        let rows: Vec<[String; 4]> = (problems.iter())
            .map(|d| {
                let at = lines.line_column(d.span.start_offset);
                let severity = match d.severity {
                    Severity::Error => "error",
                    Severity::Warning => "warning",
                };
                [
                    format!("{}:{}", at.line, at.column + 1),
                    severity.to_owned(),
                    d.message.replace('\n', " "),
                    d.code.to_string(),
                ]
            })
            .collect();
        errors += rows.iter().filter(|row| row[1] == "error").count();
        warnings += rows.iter().filter(|row| row[1] == "warning").count();
        let width = |column: usize| rows.iter().map(|row| row[column].len()).max().unwrap_or(0);
        let widths = [width(0), width(1), width(2)];
        // `ESLint` names each file by its absolute path.
        let shown = (document.file.as_deref())
            .and_then(|file| std::path::absolute(file).ok())
            .map_or_else(|| document.path.clone(), |file| file.display().to_string());
        writeln!(out, "\n{}", paint(colors, "4", &shown)).expect("writing to a String");
        for [at, severity, message, code] in &rows {
            let tone = if severity == "error" { "31" } else { "33" };
            writeln!(
                out,
                "  {}  {}  {message:<3$}  {}",
                paint(colors, "2", &format!("{at:>0$}", widths[0])),
                paint(colors, tone, &format!("{severity:<0$}", widths[1])),
                paint(colors, "2", code),
                widths[2],
            )
            .expect("writing to a String");
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
    }
    (out, errors)
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
    if colors {
        format!("\u{1b}[{code}m{text}\u{1b}[0m")
    } else {
        text.to_owned()
    }
}
