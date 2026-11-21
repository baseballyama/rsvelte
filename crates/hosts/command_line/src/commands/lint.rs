//! `rsvelte lint [<path>...]`: the lint tasks over every file below the paths, printed as
//! `ESLint`'s `stylish` formatter prints them.

use std::io::IsTerminal;
use std::process::ExitCode;

use rsvelte_kernel::computation::registry::Registry;
use rsvelte_lint_runner::output::stylish::stylish;

use super::{files, print_report};
use crate::usage;

/// What `lint` runs without `--task`: the lint of every language.
pub(crate) const TASKS: &[&str] = &["svelte.lint/default", "ts.lint/default", "vue.lint/default"];

/// Lints the files below `paths` and prints the problems. Exit code 1 means an error is left.
pub(crate) fn lint(reg: &Registry, paths: &[&str], tasks: &[&str]) -> ExitCode {
    let documents = match files::load(reg, paths, tasks, &[]) {
        Ok(documents) => documents,
        Err(e) => return usage(&e),
    };
    let results = match files::run(reg, &documents, tasks) {
        Ok(results) => results,
        Err(code) => return code,
    };
    print_report(stylish(
        &documents,
        &results,
        std::io::stdout().is_terminal(),
    ))
}
