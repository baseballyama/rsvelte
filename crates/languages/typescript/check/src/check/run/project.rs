//! The files of a project, as the checker selects them from its tsconfig: opening the project
//! expands `files`, `include` and `exclude`, and counts a mapped language's extension once its
//! content mapper's package resolves, so rsvelte never matches the patterns itself.

use std::path::{Path, PathBuf};

use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_typescript_api::{Layer, Session};

use super::in_temporary_directory;
use super::mapped::{normalized, package_json};
use crate::check::{MappedLanguage, Tsc};

impl Tsc {
    /// Every file of the tsconfig's project outside `node_modules`, with the files of each of
    /// `languages`.
    ///
    /// # Errors
    ///
    /// The check names no tsconfig, the checker cannot run, or it rejects the tsconfig.
    pub(crate) fn project_files(
        &self,
        languages: &[MappedLanguage],
    ) -> Result<Vec<PathBuf>, String> {
        let config = self
            .tsconfig
            .as_ref()
            .ok_or("a project check needs the `tsconfig` option of `typescript.check`")?;
        let config =
            std::fs::canonicalize(config).map_err(|e| format!("{}: {e}", config.display()))?;
        in_temporary_directory("rsvelte-project", |dir| {
            root_files(self, &config, languages, dir)
        })
    }
}

fn root_files(
    tsc: &Tsc,
    config: &Path,
    languages: &[MappedLanguage],
    dir: &Path,
) -> Result<Vec<PathBuf>, String> {
    let io = |path: &Path, e: std::io::Error| format!("{}: {e}", path.display());
    // The checker names the project by its real path, such as `/private/var` for `/var`.
    let dir = &std::fs::canonicalize(dir).map_err(|e| io(dir, e))?;
    let mut overlay = StructuredDataWriter::new(false);
    overlay
        .begin_object()
        .key("extends")
        .write_string(&config.to_string_lossy())
        .key("contentMappers")
        .begin_array();
    for (i, language) in languages.iter().enumerate() {
        let name = format!("rsvelte-project-mapper-{i}");
        let package = dir.join("node_modules").join(&name);
        std::fs::create_dir_all(&package).map_err(|e| io(&package, e))?;
        let manifest = package.join("package.json");
        std::fs::write(&manifest, package_json(&name, &language.content_mapper))
            .map_err(|e| io(&manifest, e))?;
        overlay
            .begin_object()
            .key("package")
            .write_string(&name)
            .key("extensions")
            .begin_array()
            .write_string(language.extension)
            .end_array()
            .end_object();
    }
    overlay.end_array().end_object();
    let overlay_path = dir.join("tsconfig.json");
    std::fs::write(&overlay_path, overlay.finish()).map_err(|e| io(&overlay_path, e))?;
    let mut session = Session::start(&tsc.checker.program, &tsc.checker.arguments, dir)?;
    let project = session
        .open(&[overlay_path.as_path()], &Layer::default())?
        .pop()
        .ok_or("the checker opened no project")?;
    session.release(project.snapshot)?;
    Ok(project
        .root_files
        .iter()
        .map(|file| normalized(&dir.join(file)))
        .filter(|file| !file.components().any(|c| c.as_os_str() == "node_modules"))
        .collect())
}
