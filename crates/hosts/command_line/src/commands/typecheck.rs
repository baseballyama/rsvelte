//! `rsvelte typecheck`: the type check of the project, printed as `tsc --pretty false` prints its
//! errors, so editors and CI annotate them as they do TypeScript's.

use std::fmt::Write as _;
use std::io::Write as _;
use std::path::{Path, PathBuf};
use std::process::ExitCode;

use rsvelte_kernel::computation::pipeline::DocumentResult;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::{Diagnostic, Severity};
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::LineIndex;

use super::files;
use crate::usage;

/// Checks the files of the project the tasks check. Exit code 1 means an error was found.
pub(crate) fn typecheck(reg: &Registry, tasks: &[&str]) -> ExitCode {
    let project = match reg.project_files(tasks) {
        Ok(project) => project,
        Err(e) => return usage(&e),
    };
    let here = std::env::current_dir().and_then(std::fs::canonicalize).ok();
    // As svelte-check, a configuration with errors is reported instead of the files it selects.
    if !project.problems.is_empty() {
        return match problems(&project.problems, here.as_deref()) {
            Ok(report) => print(report),
            Err(e) => usage(&e),
        };
    }
    let mut documents = Vec::new();
    for file in project.files {
        let text = match std::fs::read_to_string(&file) {
            Ok(text) => text,
            Err(e) => return usage(&format!("{}: {e}", file.display())),
        };
        match files::document(reg, file, text) {
            Ok(document) => documents.push(document),
            Err(e) => return usage(&e),
        }
    }
    let results = match files::run(reg, &documents, tasks) {
        Ok(results) => results,
        Err(code) => return code,
    };
    print(report(&documents, &results, here.as_deref()))
}

/// Prints a report; exit code 1 when it counts an error.
pub(crate) fn print((text, errors): (String, usize)) -> ExitCode {
    // A closed pipe, as `| head` closes it, only cuts the report short.
    drop(std::io::stdout().lock().write_all(text.as_bytes()));
    if errors > 0 {
        ExitCode::FAILURE
    } else {
        ExitCode::SUCCESS
    }
}

/// One line per problem, `<file>(<line>,<column>): error <code>: <message>`, with paths relative
/// to `here`, then how many errors were found in how many files; and that number.
fn report(
    documents: &[Document],
    results: &[DocumentResult],
    here: Option<&Path>,
) -> (String, usize) {
    let mut report = Report::new(here);
    for (document, result) in documents.iter().zip(results) {
        let found = (result.outputs.iter()).flat_map(|(_, output)| {
            (output.diagnostics.iter())
                .chain(output.findings.iter().map(|finding| &finding.diagnostic))
        });
        report.file(
            Path::new(&document.path),
            &document.text,
            result.panic.as_deref(),
            found,
        );
    }
    report.finish()
}

/// The problems of a project's configuration, each file's together, as [`report`] reports a
/// document's findings.
pub(crate) fn problems(
    problems: &[(PathBuf, Diagnostic)],
    here: Option<&Path>,
) -> Result<(String, usize), String> {
    let mut report = Report::new(here);
    let mut done = std::collections::HashSet::new();
    for (path, _) in problems {
        if !done.insert(path) {
            continue;
        }
        let found = (problems.iter()).filter(|(other, _)| other == path);
        // A problem placed at the start of its file reads none of it.
        let text = if found.clone().all(|(_, d)| d.span.end_offset == 0) {
            String::new()
        } else {
            std::fs::read_to_string(path).map_err(|e| format!("{}: {e}", path.display()))?
        };
        report.file(path, &text, None, found.map(|(_, d)| d));
    }
    Ok(report.finish())
}

struct Report<'h> {
    out: String,
    errors: usize,
    files: usize,
    here: Option<&'h Path>,
}

impl<'h> Report<'h> {
    const fn new(here: Option<&'h Path>) -> Self {
        Self {
            out: String::new(),
            errors: 0,
            files: 0,
            here,
        }
    }

    /// The lines of one file, whose text places `found`.
    fn file<'d>(
        &mut self,
        path: &Path,
        text: &str,
        panic: Option<&str>,
        found: impl Iterator<Item = &'d Diagnostic>,
    ) {
        let path = self
            .here
            .and_then(|here| path.strip_prefix(here).ok())
            .unwrap_or(path)
            .display();
        let before = self.errors;
        if let Some(panic) = panic {
            writeln!(self.out, "{path}: error: rsvelte panicked: {panic}")
                .expect("writing to a String");
            self.errors += 1;
        }
        let lines = LineIndex::new(text);
        for d in found {
            let at = lines.line_column(d.span.start_offset);
            writeln!(
                self.out,
                "{path}({},{}): {} {}: {}",
                at.line,
                at.column + 1,
                d.severity.as_str(),
                d.code,
                d.message
            )
            .expect("writing to a String");
            self.errors += usize::from(d.severity == Severity::Error);
        }
        if self.errors > before {
            self.files += 1;
        }
    }

    fn finish(mut self) -> (String, usize) {
        if self.errors > 0 {
            let plural =
                |n: usize, word: &str| format!("{n} {word}{}", if n == 1 { "" } else { "s" });
            writeln!(
                self.out,
                "\nFound {} in {}.",
                plural(self.errors, "error"),
                plural(self.files, "file")
            )
            .expect("writing to a String");
        }
        (self.out, self.errors)
    }
}
