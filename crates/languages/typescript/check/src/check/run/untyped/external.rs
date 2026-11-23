//! What the project the tsconfig selects holds beyond its root files. svelte-language-server
//! resolves a component without TypeScript's `originalPath`, so TypeScript reads one as
//! JavaScript from a package even behind a symbolic link, and does not load it beyond
//! `maxNodeModuleJsDepth`. The checker loads every mapped document, so this project says which
//! ones a search of `node_modules` found.

use std::collections::HashSet;
use std::path::{Path, PathBuf};

use rsvelte_typescript_api::{Project, Session};

use super::javascript;
use crate::check::CheckRequest;

/// The files of the selection's project that only an import reaches, and of them the JavaScript
/// documents a search of `node_modules` found, by index in ascending order.
#[derive(Default)]
pub(in crate::check::run) struct Selected {
    pub(in crate::check::run) reached: HashSet<PathBuf>,
    pub(in crate::check::run) external: Vec<usize>,
}

/// What `project`, the selection's, holds beyond its roots. `packages` names the documents to
/// ask about where a package's JavaScript is untyped; a document the tsconfig selects, or one
/// the project does not reach, is not asked about.
pub(in crate::check::run) fn selected(
    session: &mut Session,
    project: &Project,
    packages: Option<(&CheckRequest<'_>, &[PathBuf])>,
) -> Result<Selected, String> {
    let roots: HashSet<&Path> = project.root_files.iter().map(PathBuf::as_path).collect();
    let reached: HashSet<PathBuf> = (session.source_file_names(project)?.into_iter())
        .filter(|file| !roots.contains(file.as_path()))
        .collect();
    let mut external = Vec::new();
    if let Some((req, paths)) = packages {
        for (file, path) in paths.iter().enumerate() {
            if javascript(req, file)
                && reached.contains(path)
                && session.from_external_library(project, path)? == Some(true)
            {
                external.push(file);
            }
        }
    }
    Ok(Selected { reached, external })
}
