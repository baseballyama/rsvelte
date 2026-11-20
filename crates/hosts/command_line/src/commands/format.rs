//! `rsvelte format [<path>...] [--check]`: the format of every language over the files below the
//! paths. It writes each file whose text changes and prints its path; with `--check` it writes
//! nothing and lists those files instead, as Prettier's `--check` does.

use std::io::Write as _;
use std::process::ExitCode;

use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;

use super::files;

/// What `format` runs without `--task`: the format of every language.
pub(crate) const TASKS: &[&str] = &[
    "svelte.format/default",
    "ts.format/default",
    "vue.format/default",
];

/// What `format` skips besides what `.gitignore` skips: what Prettier skips.
pub(crate) const IGNORE_FILES: &[&str] = &[".prettierignore"];

/// Documents formatted by the tasks of one registry, with its options.
pub(crate) struct Batch<'a> {
    pub(crate) reg: &'a Registry,
    pub(crate) tasks: &'a [&'a str],
    pub(crate) documents: Vec<Document>,
}

/// Exit code 1 means `--check` found a file to format; 2, a file that could not be formatted or
/// written, or a usage error. Every batch runs before any file is written.
pub(crate) fn format(batches: &[Batch<'_>], check: bool) -> ExitCode {
    let mut formatted = Vec::new();
    for batch in batches {
        match files::run(batch.reg, &batch.documents, batch.tasks) {
            Ok(results) => formatted.extend(batch.documents.iter().zip(results)),
            Err(code) => return code,
        }
    }
    formatted.sort_unstable_by(|(a, _), (b, _)| a.path.cmp(&b.path));
    let mut failed = 0;
    let mut changed = 0;
    // A closed pipe, as `| head` closes it, only cuts the list short.
    let mut out = std::io::BufWriter::new(std::io::stdout().lock());
    for (document, result) in &formatted {
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
                formatted.len()
            ));
        } else {
            drop(writeln!(
                out,
                "[warn] {changed} of {} files need formatting.",
                formatted.len()
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
