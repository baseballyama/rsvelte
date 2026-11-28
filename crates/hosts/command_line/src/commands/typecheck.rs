//! `rsvelte typecheck`: the type check of the project, printed as `tsc --pretty false` prints its
//! errors, so editors and CI annotate them as they do TypeScript's.

use std::fmt::Write as _;
use std::path::{Component, Path, PathBuf};
use std::process::ExitCode;

use rsvelte_kernel::computation::pipeline::{self, DocumentResult, RunOptions, Sharing};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::{Diagnostic, Severity};
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::LineIndex;
use rsvelte_typescript_check::reported_lines;

use super::{files, print_report};
use crate::usage;

/// Checks the files of the project the tasks check. Exit code 1 means an error was found.
pub(crate) fn typecheck(reg: &Registry, tasks: &[&str]) -> ExitCode {
    match check(reg, tasks, &|_| None) {
        Ok(Checked::Files(checked)) => {
            print(checked.iter().map(|(document, result)| (document, result)))
        }
        Ok(Checked::Problems(found)) => Problems(problems(&found, here().as_deref())).print(),
        Err(e) => usage(&e),
    }
}

/// What a check of the project found.
pub(crate) enum Checked {
    /// Each file of the project, with its result.
    Files(Vec<(Document, DocumentResult)>),
    /// The problems of the project's configuration, which are reported instead of its files.
    Problems(Vec<(PathBuf, Diagnostic)>),
}

/// Checks the files of the project the tasks check. A file has the text `open` gives it, such as
/// an editor's unsaved text, else the one the tasks read it with.
pub(crate) fn check(
    reg: &Registry,
    tasks: &[&str],
    open: &dyn Fn(&Path) -> Option<String>,
) -> Result<Checked, String> {
    let project = reg.project_files(tasks)?;
    if !project.problems.is_empty() {
        return Ok(Checked::Problems(project.problems));
    }
    let documents = (project.files.into_iter())
        .map(|path| match open(&path) {
            // A file the tasks replace, such as the svelte package's types, keeps its replacement.
            Some(text) if !replaced(reg, &path, tasks) => files::document(path, text),
            _ => files::read(reg, path, tasks),
        })
        .collect::<Result<Vec<_>, _>>()?;
    let options = RunOptions {
        tasks,
        sharing: Sharing::Shared,
        threads: None,
    };
    let results = pipeline::run_per_document(reg, &documents, &options, &|_| None)
        .map_err(|e| e.to_string())?;
    Ok(Checked::Files(documents.into_iter().zip(results).collect()))
}

fn replaced(reg: &Registry, path: &Path, tasks: &[&str]) -> bool {
    rsvelte_kernel::source::paths::canonicalize(path)
        .is_ok_and(|real| reg.replacement(&real, tasks).is_some())
}

pub(crate) fn print<'a>(
    checked: impl IntoIterator<Item = (&'a Document, &'a DocumentResult)>,
) -> ExitCode {
    print_report(report(checked, here().as_deref()))
}

/// The files of the project the tasks check, or what to print instead of checking them.
pub(crate) enum Project {
    Files(Vec<PathBuf>),
    Problems(Problems),
}

/// The configuration's problems, as svelte-check prints them, or the error of reading it.
pub(crate) struct Problems(Result<(String, usize), String>);

impl Problems {
    /// Prints them; success when no problem is an error.
    pub(crate) fn print(self) -> ExitCode {
        match self.0 {
            Ok(report) => print_report(report),
            Err(e) => usage(&e),
        }
    }
}

/// The files of the project the tasks check. A configuration with problems is reported instead.
pub(crate) fn project_files(reg: &Registry, tasks: &[&str]) -> Project {
    let project = match reg.project_files(tasks) {
        Ok(project) => project,
        Err(e) => return Project::Problems(Problems(Err(e))),
    };
    if project.problems.is_empty() {
        return Project::Files(project.files);
    }
    Project::Problems(Problems(problems(&project.problems, here().as_deref())))
}

/// The current directory, which the report names files relative to.
fn here() -> Option<PathBuf> {
    std::env::current_dir()
        .and_then(rsvelte_kernel::source::paths::canonicalize)
        .ok()
}

/// One line per problem, `<file>(<line>,<column>): error <code>: <message>`, with paths relative
/// to `here`, then how many errors were found in how many files; and that number.
fn report<'a>(
    checked: impl IntoIterator<Item = (&'a Document, &'a DocumentResult)>,
    here: Option<&Path>,
) -> (String, usize) {
    let mut report = Report::new(here);
    for (document, result) in checked {
        let found = (result.outputs.iter()).flat_map(|(_, output)| {
            (output.diagnostics.iter())
                .chain(output.findings.iter().map(|finding| &finding.diagnostic))
        });
        report.file(
            document.file_path(),
            &document.text,
            result.panic.as_deref(),
            found,
        );
    }
    report.finish()
}

/// The problems of a project's configuration, each file's together, as [`report`] reports a
/// document's findings.
fn problems(
    problems: &[(PathBuf, Diagnostic)],
    here: Option<&Path>,
) -> Result<(String, usize), String> {
    let mut files: Vec<(&Path, Vec<&Diagnostic>)> = Vec::new();
    let mut index = std::collections::HashMap::new();
    for (path, diagnostic) in problems {
        let at = *index.entry(path).or_insert_with(|| {
            files.push((path, Vec::new()));
            files.len() - 1
        });
        files[at].1.push(diagnostic);
    }
    let mut report = Report::new(here);
    for (path, found) in files {
        // A problem placed at the start of its file reads none of it.
        let text = if found.iter().all(|d| d.span.end_offset == 0) {
            String::new()
        } else {
            std::fs::read_to_string(path).map_err(|e| format!("{}: {e}", path.display()))?
        };
        report.file(path, &text, None, found.into_iter());
    }
    Ok(report.finish())
}

/// `path` from `here`, as tsc prints a file: with `..` for each directory of `here` that `path` is
/// not in, such as a workspace package a link in `node_modules` reaches.
fn relative(path: &Path, here: &Path) -> PathBuf {
    let shared = (path.components().zip(here.components()))
        .take_while(|(a, b)| a == b)
        .count();
    if shared == 0 {
        return path.to_owned();
    }
    (here.components().skip(shared))
        .map(|_| Component::ParentDir)
        .chain(path.components().skip(shared))
        .collect()
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
        // TypeScript and svelte-check count positions after a byte order mark; a span counts it.
        let after_mark = text.strip_prefix('\u{feff}').unwrap_or(text);
        let mark = (text.len() - after_mark.len()) as u32;
        let lines = LineIndex::with_breaks(after_mark, reported_lines(path));
        let path = self
            .here
            .map_or_else(|| path.to_owned(), |here| relative(path, here));
        // svelte-check names a file by Node's `path.relative`, with the platform's separator.
        let path = path.display();
        let before = self.errors;
        if let Some(panic) = panic {
            writeln!(self.out, "{path}: error: rsvelte panicked: {panic}")
                .expect("writing to a String");
            self.errors += 1;
        }
        for d in found {
            let at = lines.line_column(d.span.start_offset.saturating_sub(mark));
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
