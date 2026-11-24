//! The project the tsconfig selects, components included. The overlay's roots are its roots and
//! the documents no import of it reaches: a document only an import reaches stays out of them,
//! since TypeScript reads a root as the project's own, never as a library's file.

use std::collections::HashSet;
use std::path::{Path, PathBuf};

use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_typescript_api::{Project, Session};

use super::MAPPER_PACKAGE;
use crate::check::CheckRequest;

const CONFIG: &str = "selection.json";

/// The files of the selection's project that only an import reaches, and of the documents among
/// them that the run asks about, those a search of `node_modules` found, by index in ascending
/// order.
#[derive(Default)]
pub(super) struct Selected {
    pub(super) reached: HashSet<PathBuf>,
    pub(super) external: Vec<usize>,
}

/// The tsconfig of a project that extends the project's `base` with the content mappers of `req`,
/// so that its root files are those the tsconfig selects, components included.
pub(super) fn config(
    req: &CheckRequest<'_>,
    overlay: &Path,
    base: &Path,
    store: &Path,
) -> (PathBuf, String) {
    let mut config = StructuredDataWriter::new(true);
    config
        .begin_object()
        .key("extends")
        .write_string(&base.to_string_lossy())
        .key("compilerOptions")
        .begin_object()
        .key("noEmit")
        .write_boolean(true)
        .end_object();
    req.write_mapper_config(&mut config, MAPPER_PACKAGE, store);
    config.end_object();
    (overlay.join(CONFIG), config.finish())
}

/// What `project`, the selection's, holds beyond its roots; `ask` names the documents, at
/// `paths`, to ask whether a search of `node_modules` found them.
pub(super) fn selected(
    session: &mut Session,
    project: &Project,
    paths: &[PathBuf],
    ask: &dyn Fn(usize) -> bool,
) -> Result<Selected, String> {
    let roots: HashSet<&Path> = project.root_files.iter().map(PathBuf::as_path).collect();
    let reached: HashSet<PathBuf> = (session.source_file_names(project)?.into_iter())
        .filter(|file| !roots.contains(file.as_path()))
        .collect();
    let mut external = Vec::new();
    for (file, path) in paths.iter().enumerate() {
        if ask(file)
            && reached.contains(path)
            && session.from_external_library(project, path)? == Some(true)
        {
            external.push(file);
        }
    }
    Ok(Selected { reached, external })
}
