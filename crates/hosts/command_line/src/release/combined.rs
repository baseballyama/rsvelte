//! `rsvelte <command> <command>... [<path>...] [--check]`: several commands in one run. `format`
//! runs first, so the others read what it wrote. `lint` and `typecheck` then run in one kernel
//! run, so a file both read is parsed and analyzed once.

use std::collections::HashMap;
use std::path::PathBuf;
use std::process::ExitCode;
use std::sync::Arc;

use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::Document;

use super::format::lint::Lint;
use super::{LINT, LINT_AND_TYPECHECK, TYPECHECK, alone, format, installation};
use crate::commands::typecheck::Project;
use crate::commands::{files, lint, typecheck};
use crate::{configuration, configured_registry, usage};

#[cfg(test)]
mod tests;

/// The commands a run can combine.
pub(super) const COMBINABLE: &[&str] = &["lint", "format", "typecheck"];

/// Runs `commands` over `paths`; `check` is `format`'s `--check`. The exit code is the worst of
/// the commands'.
pub(super) fn run(
    config: &configuration::Options,
    commands: &[&str],
    paths: &[&str],
    check: bool,
) -> ExitCode {
    if let Some(twice) = (commands.iter().enumerate())
        .find_map(|(i, command)| commands[..i].contains(command).then_some(command))
    {
        return usage(&format!("`{twice}` is named twice"));
    }
    let runs = |command: &str| commands.contains(&command);
    // `--check` writes nothing, so lint reads the text format reads.
    let lints_with_format = check && runs("format") && runs("lint");
    let mut codes = Vec::new();
    if runs("format") {
        let arguments: Vec<String> = (paths.iter().map(|&path| path.to_owned()))
            .chain(check.then(|| "--check".to_owned()))
            .collect();
        if lints_with_format {
            codes.extend(format_and_lint(config, paths, &arguments));
        } else {
            codes.push(format::format(&arguments));
        }
    }
    match (runs("lint") && !lints_with_format, runs("typecheck")) {
        (true, true) => codes.extend(lint_and_typecheck(config, paths)),
        (true, false) => codes.push(alone(config, LINT, paths)),
        (false, true) => codes.push(alone(config, TYPECHECK, paths)),
        (false, false) => {}
    }
    worst(&codes)
}

/// `format --check` with `arguments` and `lint` below `paths`, with each Svelte file both read
/// parsed once; the exit code of each.
fn format_and_lint(
    config: &configuration::Options,
    paths: &[&str],
    arguments: &[String],
) -> Vec<ExitCode> {
    let found = configured_registry(config, &[], installation(LINT))
        .and_then(|(reg, _)| Ok((lint::linted(&reg, paths, LINT)?, reg)));
    // A lint that cannot start reports so after format, as when each runs alone.
    let Ok((files, reg)) = found else {
        return vec![format::format(arguments), alone(config, LINT, paths)];
    };
    let lint = Arc::new(Lint::new(reg, files));
    let format = format::format_with(arguments, Some(Arc::clone(&lint)));
    vec![format, lint.print()]
}

/// The exit code of a run whose commands exited with `codes`: 2 when one could not run, else 1
/// when one found a problem.
fn worst(codes: &[ExitCode]) -> ExitCode {
    let failed = ExitCode::from(2);
    if codes.contains(&failed) {
        failed
    } else if codes.contains(&ExitCode::FAILURE) {
        ExitCode::FAILURE
    } else {
        ExitCode::SUCCESS
    }
}

/// Which of `lint` and `typecheck` read a document.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Readers {
    Lint,
    Typecheck,
    Both,
}

impl Readers {
    const fn tasks(self) -> &'static [&'static str] {
        match self {
            Self::Lint => LINT,
            Self::Typecheck => TYPECHECK,
            Self::Both => LINT_AND_TYPECHECK,
        }
    }
}

/// `lint` below `paths` and `typecheck` of the project in one kernel run; the exit code of each.
fn lint_and_typecheck(config: &configuration::Options, paths: &[&str]) -> Vec<ExitCode> {
    let Ok((reg, _)) = configured_registry(config, &[], installation(LINT_AND_TYPECHECK)) else {
        // One command that cannot install does not stop the other, as when each runs alone.
        return vec![alone(config, LINT, paths), alone(config, TYPECHECK, paths)];
    };
    let linted = match lint::linted(&reg, paths, LINT) {
        Ok(found) => found,
        Err(e) => return vec![usage(&e)],
    };
    let (checked, problems) = match typecheck::project_files(&reg, TYPECHECK) {
        Project::Files(files) => (files, None),
        Project::Problems(problems) => (Vec::new(), Some(problems)),
    };
    let read = match read(&reg, linted, &checked) {
        Ok(read) => read,
        Err(e) => return vec![usage(&e)],
    };
    let readers = &read.readers;
    let tasks_of = |i: usize| readers[i].tasks();
    let mut results =
        match files::run_per_document(&reg, &read.documents, LINT_AND_TYPECHECK, &tasks_of) {
            Ok(results) => results,
            Err(code) => return vec![code],
        };
    let linted: Vec<_> = (read.documents.iter().zip(&mut results))
        .zip(readers)
        .filter(|(_, readers)| **readers != Readers::Typecheck)
        .map(|((document, result), _)| (document, result.take(LINT)))
        .collect();
    let lint = lint::print(linted.iter().map(|(document, result)| (*document, result)));
    let typecheck = problems.map_or_else(
        || typecheck::print((read.checked.iter()).map(|&i| (&read.documents[i], &results[i]))),
        typecheck::Problems::print,
    );
    vec![lint, typecheck]
}

/// The documents of a run, in lint's order and then the files only typecheck reads.
struct Read {
    documents: Vec<Document>,
    readers: Vec<Readers>,
    /// The documents typecheck reads, in the order of the project's files.
    checked: Vec<usize>,
}

/// Reads each file once. A file both commands read keeps lint's name, and the checker knows it
/// by its real path, the project's name for it.
fn read(reg: &Registry, linted: Vec<PathBuf>, checked: &[PathBuf]) -> Result<Read, String> {
    // A file lint reaches through a link, or that a task reads replaced, each command reads
    // apart, so that what each reads is what it reads alone.
    let shared = |path: &PathBuf| {
        let real = std::fs::canonicalize(path).ok()?;
        let unlinked = std::path::absolute(path).ok()? == real;
        (unlinked && reg.replacement(&real, LINT_AND_TYPECHECK).is_none()).then_some(real)
    };
    let mut at: HashMap<PathBuf, usize> = if checked.is_empty() {
        HashMap::new()
    } else {
        (linted.iter().enumerate())
            .filter_map(|(i, path)| Some((shared(path)?, i)))
            .collect()
    };
    let mut entries: Vec<(PathBuf, Option<PathBuf>, Readers)> = (linted.into_iter())
        .map(|path| (path, None, Readers::Lint))
        .collect();
    let mut order = Vec::with_capacity(checked.len());
    for path in checked {
        if let Some(i) = at.remove(path) {
            entries[i].1 = Some(path.clone());
            entries[i].2 = Readers::Both;
            order.push(i);
        } else {
            order.push(entries.len());
            entries.push((path.clone(), None, Readers::Typecheck));
        }
    }
    let readers = entries.iter().map(|&(.., readers)| readers).collect();
    let documents = (entries.into_iter())
        .map(|(path, real, readers)| match real {
            Some(real) => files::read_as(
                reg,
                path.to_string_lossy().into_owned(),
                real,
                readers.tasks(),
            ),
            None => files::read(reg, path, readers.tasks()),
        })
        .collect::<Result<_, _>>()?;
    Ok(Read {
        documents,
        readers,
        checked: order,
    })
}
