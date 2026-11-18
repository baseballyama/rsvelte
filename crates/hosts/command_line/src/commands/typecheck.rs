//! `rsvelte typecheck`: the type check of the project, printed as `tsc --pretty false` prints its
//! errors, so editors and CI annotate them as they do TypeScript's.

use std::fmt::Write as _;
use std::io::Write as _;
use std::path::Path;
use std::process::ExitCode;

use rsvelte_kernel::computation::pipeline::DocumentResult;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::LineIndex;

use super::files;
use crate::usage;

/// Checks the files of the project the tasks check. Exit code 1 means an error was found.
pub(crate) fn typecheck(reg: &Registry, tasks: &[&str]) -> ExitCode {
    let mut documents = Vec::new();
    for file in match reg.project_files(tasks) {
        Ok(files) => files,
        Err(e) => return usage(&e),
    } {
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
    let here = std::env::current_dir().and_then(std::fs::canonicalize).ok();
    let (text, errors) = report(&documents, &results, here.as_deref());
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
    let mut out = String::new();
    let (mut errors, mut files) = (0, 0);
    for (document, result) in documents.iter().zip(results) {
        let path = Path::new(&document.path);
        let path = here
            .and_then(|here| path.strip_prefix(here).ok())
            .unwrap_or(path)
            .display();
        let before = errors;
        if let Some(panic) = &result.panic {
            writeln!(out, "{path}: error: rsvelte panicked: {panic}").expect("writing to a String");
            errors += 1;
        }
        let lines = LineIndex::new(&document.text);
        for (_, output) in &result.outputs {
            let found = (output.diagnostics.iter())
                .chain(output.findings.iter().map(|finding| &finding.diagnostic));
            for d in found {
                let at = lines.line_column(d.span.start_offset);
                writeln!(
                    out,
                    "{path}({},{}): {} {}: {}",
                    at.line,
                    at.column + 1,
                    d.severity.as_str(),
                    d.code,
                    d.message
                )
                .expect("writing to a String");
                errors += usize::from(d.severity == Severity::Error);
            }
        }
        if errors > before {
            files += 1;
        }
    }
    if errors > 0 {
        let plural = |n: usize, word: &str| format!("{n} {word}{}", if n == 1 { "" } else { "s" });
        writeln!(
            out,
            "\nFound {} in {}.",
            plural(errors, "error"),
            plural(files, "file")
        )
        .expect("writing to a String");
    }
    (out, errors)
}
