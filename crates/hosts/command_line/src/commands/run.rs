use std::path::{Path, PathBuf};
use std::process::ExitCode;

use rsvelte_corpus::task_files::diagnostics_json;
use rsvelte_kernel::computation::pipeline::DocumentResult;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::{Severity, apply_fixes};

use super::files;
use super::typecheck::{self, Project};
use crate::usage;

/// `ESLint`'s bound on fixing passes, which stops fixes that keep producing fixes.
pub(crate) const MAX_FIX_PASSES: usize = 10;

/// Runs `tasks` on `file` and prints their output. With `fix`, applies the findings' fixes pass by
/// pass, writes the file, and prints the output for the fixed text. Exit code 1 means an error
/// diagnostic or finding is left.
pub(crate) fn run_file(reg: &Registry, file: &Path, tasks: &[&str], fix: bool) -> ExitCode {
    let read = match reg.read(file, tasks) {
        Ok(t) => t,
        Err(e) => return usage(&format!("{}: {e}", file.display())),
    };
    let passes = if fix { MAX_FIX_PASSES } else { 0 };
    let (text, result) = match fixed(read.clone(), passes, &|text| {
        run_once(reg, file, text, tasks)
    }) {
        Ok(fixed) => fixed,
        Err(code) => return code,
    };
    if text != read
        && let Err(e) = std::fs::write(file, &text)
    {
        return usage(&format!("{}: {e}", file.display()));
    }
    if let Some(p) = &result.panic {
        eprintln!("panic: {p}");
        return ExitCode::FAILURE;
    }
    if print_outputs("", &text, &result) {
        ExitCode::FAILURE
    } else {
        ExitCode::SUCCESS
    }
}

/// `text` with the fixes of `lint`'s findings applied, pass after pass, in at most `passes`
/// passes and until one changes nothing, with the lint of the text it returns.
pub(crate) fn fixed<E>(
    mut text: String,
    passes: usize,
    lint: &dyn Fn(&str) -> Result<DocumentResult, E>,
) -> Result<(String, DocumentResult), E> {
    for pass in 0.. {
        let result = lint(&text)?;
        if pass == passes {
            return Ok((text, result));
        }
        let replacements = (result.outputs.iter())
            .flat_map(|(_, out)| &out.findings)
            .map(|finding| finding.fix.as_slice());
        let fixed = apply_fixes(&text, replacements);
        if fixed == text {
            return Ok((text, result));
        }
        text = fixed;
    }
    unreachable!("the passes end")
}

/// Runs `tasks` on every file of the project they check, as the project's checker selects them.
pub(crate) fn run_project(reg: &Registry, tasks: &[&str]) -> ExitCode {
    match typecheck::project_files(reg, tasks) {
        Project::Files(files) => run_files(reg, files, tasks),
        Project::Problems(problems) => problems.print(),
    }
}

/// Runs `tasks` on every file of `files` in one run, so a project task such as a type check sees
/// all of them, and prints each output under its file. Exit code 1 means an error is left.
pub(crate) fn run_files(reg: &Registry, files: Vec<PathBuf>, tasks: &[&str]) -> ExitCode {
    let documents = match files::read_all(reg, files, tasks) {
        Ok(documents) => documents,
        Err(e) => return usage(&e),
    };
    let results = match files::run(reg, &documents, tasks) {
        Ok(results) => results,
        Err(code) => return code,
    };
    let mut failed = false;
    for (document, result) in documents.iter().zip(&results) {
        if let Some(p) = &result.panic {
            println!("// {} panic\n{p}", document.path);
            failed = true;
        }
        failed |= print_outputs(&format!("{} ", document.path), &document.text, result);
    }
    if failed {
        ExitCode::FAILURE
    } else {
        ExitCode::SUCCESS
    }
}

/// Prints each task's files and diagnostics under a `// <prefix><task>` line, and returns whether
/// an error diagnostic or finding is among them.
fn print_outputs(prefix: &str, text: &str, result: &DocumentResult) -> bool {
    let mut failed = false;
    for (task, out) in &result.outputs {
        for f in &out.files {
            println!("// {prefix}{task} {}\n{}", f.name, f.text);
        }
        if !out.diagnostics.is_empty() {
            println!(
                "// {prefix}{task} diagnostics\n{}",
                diagnostics_json(text, out)
            );
        }
        failed |= out
            .diagnostics
            .iter()
            .chain(out.findings.iter().map(|finding| &finding.diagnostic))
            .any(|diagnostic| diagnostic.severity == Severity::Error);
    }
    failed
}

fn run_once(
    reg: &Registry,
    file: &Path,
    text: &str,
    tasks: &[&str],
) -> Result<DocumentResult, ExitCode> {
    let document = files::document(file.to_owned(), text.to_owned()).map_err(|e| usage(&e))?;
    files::run(reg, std::slice::from_ref(&document), tasks).map(|mut results| results.remove(0))
}
