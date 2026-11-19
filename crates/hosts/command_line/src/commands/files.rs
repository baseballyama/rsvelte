//! Finding the files a command such as `lint` or `format` runs on below the paths it is given,
//! and running its tasks over them.

use std::path::{Path, PathBuf};
use std::process::ExitCode;

use rsvelte_kernel::computation::pipeline::{self, DocumentResult, RunOptions, Sharing};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::Document;

use crate::usage;

/// The documents of every file below `paths` that a task of `tasks` reads and no ignore file
/// skips, in the order of their path strings, as `ESLint` lists them: `a-b/x` before `a/x`.
pub(crate) fn load(
    reg: &Registry,
    paths: &[&str],
    tasks: &[&str],
    ignore_files: &[&str],
) -> Result<Vec<Document>, String> {
    let mut files = Vec::new();
    for path in paths {
        collect(reg, tasks, ignore_files, Path::new(path), &mut files)?;
    }
    files.sort_unstable_by(|a, b| a.as_os_str().cmp(b.as_os_str()));
    files.dedup();
    files
        .into_iter()
        .map(|file| {
            let text =
                std::fs::read_to_string(&file).map_err(|e| format!("{}: {e}", file.display()))?;
            document(reg, file, text)
        })
        .collect()
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

/// The files below `path` that a task of `tasks` reads, skipping `node_modules`, `.git` and
/// what the ignore files say: `.gitignore` (with `.git/info/exclude` and the global one), `.ignore`
/// and each of `ignore_files`. A named file is taken as it is.
fn collect(
    reg: &Registry,
    tasks: &[&str],
    ignore_files: &[&str],
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
    for name in ignore_files {
        walk.add_custom_ignore_filename(name);
    }
    walk.filter_entry(|entry| !matches!(entry.file_name().to_str(), Some("node_modules" | ".git")));
    for entry in walk.build() {
        let entry = entry.map_err(|e| e.to_string())?;
        // A link to a directory is not followed, so a cycle cannot loop.
        if entry.file_type().is_some_and(|kind| kind.is_dir()) || !entry.path().is_file() {
            continue;
        }
        let path = entry.into_path();
        let probe = reg.document(path.to_string_lossy().into_owned(), String::new());
        if probe.is_ok_and(|document| reg.applies(tasks, &document)) {
            files.push(path);
        }
    }
    Ok(())
}
