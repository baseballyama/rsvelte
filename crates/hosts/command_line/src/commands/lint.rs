//! `rsvelte lint [<path>...]`: the lint tasks over every file below the paths, printed as
//! `ESLint`'s `stylish` formatter prints them.

use std::io::IsTerminal;
use std::path::PathBuf;
use std::process::ExitCode;

use rsvelte_kernel::computation::pipeline::DocumentResult;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::Document;
use rsvelte_lint_runner::output::render_stylish;

use super::{files, print_report};
use crate::usage;

/// What `lint` runs without `--task`: the lint of every language.
pub(crate) const TASKS: &[&str] = &["svelte.lint/default", "ts.lint/default", "vue.lint/default"];

/// Lints the files below `paths` and prints the problems. Exit code 1 means an error is left.
pub(crate) fn lint(reg: &Registry, paths: &[&str], tasks: &[&str]) -> ExitCode {
    let found = linted(reg, paths, tasks);
    let documents = match found.and_then(|found| files::read_all(reg, found, tasks)) {
        Ok(documents) => documents,
        Err(e) => return usage(&e),
    };
    let results = match files::run(reg, &documents, tasks) {
        Ok(results) => results,
        Err(code) => return code,
    };
    print(documents.iter().zip(&results))
}

/// The files below `paths`, by default the current directory, that `tasks` lint.
pub(crate) fn linted(
    reg: &Registry,
    paths: &[&str],
    tasks: &[&str],
) -> Result<Vec<PathBuf>, String> {
    let paths = if paths.is_empty() { &["."][..] } else { paths };
    files::found(reg, paths, tasks, &[])
}

pub(crate) fn print<'a>(
    linted: impl IntoIterator<Item = (&'a Document, &'a DocumentResult)>,
) -> ExitCode {
    print_report(render_stylish(linted, std::io::stdout().is_terminal()))
}
