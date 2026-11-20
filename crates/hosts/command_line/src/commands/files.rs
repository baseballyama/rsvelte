//! Finding the files a command such as `lint` or `format` runs on below the paths it is given,
//! and running its tasks over them.

use std::path::{Path, PathBuf};
use std::process::ExitCode;

use ignore::gitignore::Gitignore;
use rsvelte_kernel::computation::pipeline::{self, DocumentResult, RunOptions, Sharing};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::Document;

use crate::usage;

/// What a walk skips besides `node_modules`, `.git` and what `.gitignore` and `.ignore` skip:
/// what each of `files` skips, and `patterns`.
#[derive(Clone, Copy, Default)]
pub(crate) struct Skip<'a> {
    pub(crate) files: &'a [&'a str],
    pub(crate) patterns: Option<&'a Gitignore>,
}

/// The documents of every file below `paths` that a task of `tasks` reads and `skip` keeps, in
/// the order of their path strings, as `ESLint` lists them: `a-b/x` before `a/x`.
pub(crate) fn load(
    reg: &Registry,
    paths: &[&str],
    tasks: &[&str],
    skip: Skip<'_>,
) -> Result<Vec<Document>, String> {
    let read = |path: &Path| {
        let probe = reg.document(path.to_string_lossy().into_owned(), String::new());
        probe.is_ok_and(|document| reg.applies(tasks, &document))
    };
    find(paths, skip, &read)?
        .into_iter()
        .map(|file| {
            let text =
                std::fs::read_to_string(&file).map_err(|e| format!("{}: {e}", file.display()))?;
            document(reg, file, text)
        })
        .collect()
}

/// The files below `paths` that `keep` keeps and `skip` does not skip, sorted. A named file is
/// taken as it is.
pub(crate) fn find(
    paths: &[&str],
    skip: Skip<'_>,
    keep: &dyn Fn(&Path) -> bool,
) -> Result<Vec<PathBuf>, String> {
    let mut files = Vec::new();
    for path in paths {
        collect(skip, keep, Path::new(path), &mut files)?;
    }
    files.sort_unstable_by(|a, b| a.as_os_str().cmp(b.as_os_str()));
    files.dedup();
    Ok(files)
}

/// The document of `text`, read from `file`.
pub(crate) fn document(reg: &Registry, file: PathBuf, text: String) -> Result<Document, String> {
    let document = reg
        .document(file.to_string_lossy().into_owned(), text)
        .map_err(|e| format!("{}: {e:?}", file.display()))?;
    Ok(document.read_from(file))
}

/// Runs `tasks` over `documents` in one run, with the exit code of its error.
pub(crate) fn run(
    reg: &Registry,
    documents: &[Document],
    tasks: &[&str],
) -> Result<Vec<DocumentResult>, ExitCode> {
    let options = RunOptions {
        tasks,
        sharing: Sharing::Shared,
        threads: None,
    };
    pipeline::run(reg, documents, &options).map_err(|e| usage(&e.to_string()))
}

fn collect(
    skip: Skip<'_>,
    keep: &dyn Fn(&Path) -> bool,
    path: &Path,
    files: &mut Vec<PathBuf>,
) -> Result<(), String> {
    let metadata = std::fs::metadata(path).map_err(|e| format!("{}: {e}", path.display()))?;
    if !metadata.is_dir() {
        files.push(path.to_owned());
        return Ok(());
    }
    let mut walk = ignore::WalkBuilder::new(path);
    // Dotfiles are source too; a project without git still means its `.gitignore`.
    walk.hidden(false).require_git(false);
    for name in skip.files {
        walk.add_custom_ignore_filename(name);
    }
    let here = std::env::current_dir().map_err(|e| format!("current directory: {e}"))?;
    let patterns = skip.patterns.cloned();
    walk.filter_entry(move |entry| {
        if matches!(entry.file_name().to_str(), Some("node_modules" | ".git")) {
            return false;
        }
        // A path outside the patterns' root is not theirs to skip.
        patterns.as_ref().is_none_or(|patterns| {
            let path = here.join(entry.path());
            let directory = entry.file_type().is_some_and(|kind| kind.is_dir());
            !path.starts_with(patterns.path()) || !patterns.matched(&path, directory).is_ignore()
        })
    });
    for entry in walk.build() {
        let entry = entry.map_err(|e| e.to_string())?;
        // A link to a directory is not followed, so a cycle cannot loop.
        if entry.file_type().is_some_and(|kind| kind.is_dir()) || !entry.path().is_file() {
            continue;
        }
        if keep(entry.path()) {
            files.push(entry.into_path());
        }
    }
    Ok(())
}
