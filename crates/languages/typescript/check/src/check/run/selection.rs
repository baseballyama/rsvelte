//! The project the tsconfig selects, components included. The overlay's roots are its roots and
//! the documents no import of it reaches: a document only an import reaches stays out of them,
//! since TypeScript reads a root as the project's own, never as a library's file.

use std::collections::HashSet;
use std::path::{Path, PathBuf};

use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_typescript_api::{Project, Session};

use super::MAPPER_PACKAGE;
use crate::check::CheckRequest;

const CONFIG: &str = ".rsvelte.selection.json";

/// The files of the selection's project that only an import reaches, and of the documents among
/// them that the run asks about, those a search of `node_modules` found.
#[derive(Default)]
pub(super) struct Selected {
    pub(super) reached: HashSet<PathBuf>,
    pub(super) external: HashSet<PathBuf>,
}

/// The tsconfig of a project that extends the project's `base`, in its directory `root`, with the
/// content mappers of `req`, so that its root files are those the tsconfig selects, components
/// included.
pub(super) fn config(
    req: &CheckRequest<'_>,
    root: &Path,
    base: &Path,
    store: &Path,
) -> (PathBuf, String) {
    let mut config = StructuredDataWriter::new(true);
    config
        .begin_object()
        .key("extends")
        .write_string(&rsvelte_kernel::source::paths::typescript(base))
        .key("compilerOptions")
        .begin_object()
        .key("noEmit")
        .write_boolean(true)
        .end_object();
    req.write_mapper_config(&mut config, MAPPER_PACKAGE, store);
    config.end_object();
    (root.join(CONFIG), config.finish())
}

/// What `project`, the selection's, holds beyond its roots; `ask` names the documents, by path, to
/// ask whether a search of `node_modules` found them.
pub(super) fn selected(
    session: &mut Session,
    project: &Project,
    ask: Option<&HashSet<PathBuf>>,
) -> Result<Selected, String> {
    let roots: HashSet<&Path> = project.root_files.iter().map(PathBuf::as_path).collect();
    let reached: HashSet<PathBuf> = (session.source_file_names(project)?.into_iter())
        .filter(|file| !roots.contains(file.as_path()))
        .collect();
    let mut external = HashSet::new();
    for path in ask.into_iter().flatten() {
        if reached.contains(path) && session.from_external_library(project, path)? == Some(true) {
            external.insert(path.clone());
        }
    }
    Ok(Selected { reached, external })
}
