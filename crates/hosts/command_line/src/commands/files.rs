//! Finding the files a command such as `lint` or `format` runs on below the paths it is given.

use std::path::{Path, PathBuf};

use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::Document;

/// The documents of every file below `paths` that a task of `tasks` reads, in path order.
pub(crate) fn load(
    reg: &Registry,
    paths: &[&str],
    tasks: &[&str],
) -> Result<Vec<Document>, String> {
    let mut files = Vec::new();
    for path in paths {
        collect(reg, tasks, Path::new(path), &mut files)?;
    }
    files.sort_unstable();
    files.dedup();
    files
        .into_iter()
        .map(|file| {
            let text =
                std::fs::read_to_string(&file).map_err(|e| format!("{}: {e}", file.display()))?;
            let document = reg
                .document(file.to_string_lossy().into_owned(), text)
                .map_err(|e| format!("{}: {e:?}", file.display()))?;
            Ok(document.read_from(file))
        })
        .collect()
}

/// The files below `path` that a task of `tasks` reads, skipping what `ESLint` skips by default:
/// `node_modules` and `.git`. A named file is taken as it is.
fn collect(
    reg: &Registry,
    tasks: &[&str],
    path: &Path,
    files: &mut Vec<PathBuf>,
) -> Result<(), String> {
    let metadata = std::fs::metadata(path).map_err(|e| format!("{}: {e}", path.display()))?;
    if !metadata.is_dir() {
        files.push(path.to_owned());
        return Ok(());
    }
    let mut stack = vec![path.to_owned()];
    while let Some(dir) = stack.pop() {
        let read = std::fs::read_dir(&dir).map_err(|e| format!("{}: {e}", dir.display()))?;
        for entry in read.flatten() {
            if matches!(entry.file_name().to_str(), Some("node_modules" | ".git")) {
                continue;
            }
            let path = entry.path();
            // A link to a directory is not followed, so a cycle cannot loop.
            match entry.file_type() {
                Ok(kind) if kind.is_dir() => stack.push(path),
                Ok(_) if path.is_file() => {
                    let probe = reg.document(path.to_string_lossy().into_owned(), String::new());
                    if probe.is_ok_and(|document| reg.applies(tasks, &document)) {
                        files.push(path);
                    }
                }
                _ => {}
            }
        }
    }
    Ok(())
}
