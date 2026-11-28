//! Finding the files a command such as `lint` or `format` runs on below the paths it is given,
//! and running its tasks over them.

use std::path::{Path, PathBuf};
use std::process::ExitCode;

use rsvelte_kernel::computation::pipeline::{self, DocumentResult, RunOptions, Sharing};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::Document;

use crate::usage;

/// The documents of every file below `paths` that a task of `tasks` reads, in the order of their
/// path strings, as `ESLint` lists them: `a-b/x` before `a/x`. What `node_modules`, `.git`,
/// `.gitignore`, `.ignore` and each of `ignore_files` skip is skipped.
pub(crate) fn load(
    reg: &Registry,
    paths: &[&str],
    tasks: &[&str],
    ignore_files: &[&str],
) -> Result<Vec<Document>, String> {
    read_all(reg, found(reg, paths, tasks, ignore_files)?, tasks)
}

/// The files [`load`] reads.
pub(crate) fn found(
    reg: &Registry,
    paths: &[&str],
    tasks: &[&str],
    ignore_files: &[&str],
) -> Result<Vec<PathBuf>, String> {
    let walk = Walk { ignore_files };
    find(paths, &walk, &|path| applies(reg, tasks, path))
}

/// Whether a task of `tasks` reads the file at `path`.
pub(crate) fn applies(reg: &Registry, tasks: &[&str], path: &Path) -> bool {
    let probe = Document::new(path.to_string_lossy().into_owned(), String::new());
    probe.is_ok_and(|document| reg.applies(tasks, &document))
}

/// The document of the file at `path`, with the text `tasks` read it with.
pub(crate) fn read(reg: &Registry, path: PathBuf, tasks: &[&str]) -> Result<Document, String> {
    read_as(reg, path.to_string_lossy().into_owned(), path, tasks)
}

/// The document named `name` of the file at `file`, with the text `tasks` read it with.
pub(crate) fn read_as(
    reg: &Registry,
    name: String,
    file: PathBuf,
    tasks: &[&str],
) -> Result<Document, String> {
    let read = (reg.read_file(&file, tasks)).map_err(|e| format!("{}: {e}", file.display()))?;
    let document =
        Document::new(name, read.text).map_err(|e| format!("{}: {e:?}", file.display()))?;
    Ok(if read.on_disk {
        document.read_from_disk(file)
    } else {
        document.read_from(file)
    })
}

/// The documents of the files at `paths`, in their order, with the text `tasks` read them with.
pub(crate) fn read_all(
    reg: &Registry,
    paths: Vec<PathBuf>,
    tasks: &[&str],
) -> Result<Vec<Document>, String> {
    use rayon::iter::{IntoParallelIterator, ParallelIterator};
    // In parallel, then the first error in order, as one by one.
    let read: Vec<_> = (paths.into_par_iter())
        .map(|path| read(reg, path, tasks))
        .collect();
    read.into_iter().collect()
}

/// What a walk skips besides `node_modules`, `.git` and what `.gitignore` and `.ignore` skip.
pub(crate) struct Walk<'a> {
    pub(crate) ignore_files: &'a [&'a str],
}

/// The files below `paths` that `keep` keeps and `walk` does not skip, sorted. A named file is
/// taken as it is.
pub(crate) fn find(
    paths: &[&str],
    walk: &Walk<'_>,
    keep: &dyn Fn(&Path) -> bool,
) -> Result<Vec<PathBuf>, String> {
    let mut files = Vec::new();
    for path in paths {
        collect(walk, keep, Path::new(path), &mut files)?;
    }
    files.sort_unstable_by(|a, b| a.as_os_str().cmp(b.as_os_str()));
    files.dedup();
    Ok(files)
}

/// The document of `text`, read from `file`.
pub(crate) fn document(file: PathBuf, text: String) -> Result<Document, String> {
    named(file.to_string_lossy().into_owned(), file, text)
}

/// The document named `name` of `text`, read from `file`.
fn named(name: String, file: PathBuf, text: String) -> Result<Document, String> {
    let document = Document::new(name, text).map_err(|e| format!("{}: {e:?}", file.display()))?;
    Ok(document.read_from(file))
}

/// Runs `tasks` over `documents` in one run, with the exit code of its error.
pub(crate) fn run(
    reg: &Registry,
    documents: &[Document],
    tasks: &[&str],
) -> Result<Vec<DocumentResult>, ExitCode> {
    run_per_document(reg, documents, tasks, &|_| None)
}

/// [`run`], where document `i` runs only the tasks among `tasks` that `tasks_of(i)` names, or all
/// of them when it is `None`.
pub(crate) fn run_per_document<'t>(
    reg: &Registry,
    documents: &[Document],
    tasks: &[&str],
    tasks_of: &(dyn Fn(usize) -> Option<&'t [&'t str]> + Sync),
) -> Result<Vec<DocumentResult>, ExitCode> {
    let options = RunOptions {
        tasks,
        sharing: Sharing::Shared,
        threads: None,
    };
    pipeline::run_per_document(reg, documents, &options, tasks_of)
        .map_err(|e| usage(&e.to_string()))
}

fn collect(
    skip: &Walk<'_>,
    keep: &dyn Fn(&Path) -> bool,
    path: &Path,
    files: &mut Vec<PathBuf>,
) -> Result<(), String> {
    let metadata = std::fs::metadata(path).map_err(|e| format!("{}: {e}", path.display()))?;
    if !metadata.is_dir() {
        files.push(path.to_owned());
        return Ok(());
    }
    // Inside a repository, `.gitignore` files and excludes count up to the repository root, as
    // oxfmt and git read them. Outside one, every `.gitignore` still counts.
    let root = rsvelte_kernel::source::paths::canonicalize(path)
        .map_err(|e| format!("{}: {e}", path.display()))?;
    let in_repository = root
        .ancestors()
        .any(|directory| directory.join(".git").exists() || directory.join(".jj").exists());
    let mut walk = ignore::WalkBuilder::new(path);
    // Dotfiles are source too.
    walk.hidden(false).require_git(in_repository);
    for name in skip.ignore_files {
        walk.add_custom_ignore_filename(name);
    }
    walk.filter_entry(|entry| !matches!(entry.file_name().to_str(), Some("node_modules" | ".git")));
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
