//! The JavaScript components a search of `node_modules` finds. svelte-language-server resolves a
//! component without TypeScript's `originalPath`, so TypeScript reads one as JavaScript from a
//! package even behind a symbolic link, and does not load it beyond `maxNodeModuleJsDepth`. The
//! checker loads every mapped document, so it says which ones such a search found.

use std::collections::HashSet;
use std::path::{Path, PathBuf};

use rsvelte_typescript_api::{Layer, Session};

use super::javascript;
use crate::check::CheckRequest;

/// The JavaScript documents the tsconfig does not select that the checker, in the project the
/// tsconfig selects, finds by searching `node_modules`, by index in ascending order. A document
/// the project does not reach stays checked as a root. `selection` gives that project's tsconfig
/// and its text; where no document is a candidate, nothing is asked of the checker.
pub(in crate::check::run) fn external(
    session: &mut Session,
    layer: &mut Layer,
    selection: impl FnOnce() -> (PathBuf, String),
    req: &CheckRequest<'_>,
    roots: &[PathBuf],
    paths: &[PathBuf],
) -> Result<Vec<usize>, String> {
    let roots: HashSet<&Path> = roots.iter().map(PathBuf::as_path).collect();
    let candidates: Vec<usize> = (0..paths.len())
        .filter(|&file| javascript(req, file) && !roots.contains(paths[file].as_path()))
        .collect();
    if candidates.is_empty() {
        return Ok(Vec::new());
    }
    let (config, text) = selection();
    layer.files.insert(config.clone(), text);
    let project = session
        .open(&[config.as_path()], layer)?
        .into_iter()
        .next()
        .ok_or("the checker opened no project")?;
    let mut found = Vec::new();
    for file in candidates {
        if session.from_external_library(&project, &paths[file])? == Some(true) {
            found.push(file);
        }
    }
    session.release(project.snapshot)?;
    Ok(found)
}
