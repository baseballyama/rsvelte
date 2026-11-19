//! `rsvelte format [<path>...] [--check]`: the format of every language over the files below the
//! paths. It writes each file whose text changes and prints its path; with `--check` it writes
//! nothing and lists those files instead, as Prettier's `--check` does.

use std::io::Write as _;
use std::process::ExitCode;

use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;

use super::files;
use crate::usage;

/// What `format` runs without `--task`: the format of every language.
pub(crate) const TASKS: &[&str] = &[
    "svelte.format/default",
    "ts.format/default",
    "vue.format/default",
];

/// Exit code 1 means `--check` found a file to format; 2, a file that could not be formatted or
/// written, or a usage error.
pub(crate) fn format(reg: &Registry, paths: &[&str], tasks: &[&str], check: bool) -> ExitCode {
    let documents = match files::load(reg, paths, tasks, &[".prettierignore"]) {
        Ok(documents) => documents,
        Err(e) => return usage(&e),
    };
    let results = match files::run(reg, &documents, tasks) {
        Ok(results) => results,
        Err(code) => return code,
    };
    let mut failed = 0;
    let mut changed = 0;
    // A closed pipe, as `| head` closes it, only cuts the list short.
    let mut out = std::io::BufWriter::new(std::io::stdout().lock());
    for (document, result) in documents.iter().zip(&results) {
        // Prettier names a file below the current directory without `./`.
        let shown = (document.path.strip_prefix("./")).unwrap_or(&document.path);
        if let Some(panic) = &result.panic {
            eprintln!("{shown}: rsvelte panicked: {panic}");
            failed += 1;
            continue;
        }
        let error = (result.outputs.iter())
            .flat_map(|(_, out)| &out.diagnostics)
            .find(|d| d.severity == Severity::Error);
        if let Some(error) = error {
            eprintln!("{shown}: {}", error.message);
            failed += 1;
            continue;
        }
        let Some(text) = (result.outputs.iter()).find_map(|(_, out)| out.files.first()) else {
            continue;
        };
        if text.text == document.text {
            continue;
        }
        changed += 1;
        if check {
            drop(writeln!(out, "[warn] {shown}"));
            continue;
        }
        let file = document
            .file
            .as_deref()
            .expect("a document read from a file");
        if let Err(e) = std::fs::write(file, &text.text) {
            eprintln!("{shown}: {e}");
            failed += 1;
            continue;
        }
        drop(writeln!(out, "{shown}"));
    }
    if check {
        if changed == 0 {
            drop(writeln!(
                out,
                "All {} files are formatted.",
                documents.len()
            ));
        } else {
            drop(writeln!(
                out,
                "[warn] {changed} of {} files need formatting.",
                documents.len()
            ));
        }
    }
    drop(out.flush());
    if failed > 0 {
        ExitCode::from(2)
    } else if check && changed > 0 {
        ExitCode::FAILURE
    } else {
        ExitCode::SUCCESS
    }
}
