//! The files of a project, as the checker selects them from its tsconfig: opening the project
//! expands `files`, `include` and `exclude`, and counts a mapped language's extension once its
//! content mapper's package resolves, so rsvelte never matches the patterns itself.

use std::path::{Path, PathBuf};

use rsvelte_kernel::computation::registry::Project;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::positions::{LineIndex, Span};
use rsvelte_typescript_api::{Layer, Session};

use super::in_temporary_directory;
use super::mapped::{normalized, package_json};
use crate::check::{MappedLanguage, Tsc};

impl Tsc {
    /// Every file of the tsconfig's project outside `node_modules`, with the files of each of
    /// `languages`, and the errors of the tsconfig, as svelte-check reports them.
    ///
    /// # Errors
    ///
    /// The check names no tsconfig, the checker cannot run, or it rejects the tsconfig.
    pub(crate) fn project_files(&self, languages: &[MappedLanguage]) -> Result<Project, String> {
        let config = self.tsconfig.as_ref().ok_or(
            "a project check needs a tsconfig: `tsconfig.json` beside the options, such as in \
                 the current directory, or `tsconfig` in the options of `typescript.check`",
        )?;
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
) -> Result<Project, String> {
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
    let files = (project.root_files.iter())
        .map(|file| normalized(&dir.join(file)))
        .filter(|file| !file.components().any(|c| c.as_os_str() == "node_modules"))
        .collect();
    let failed = |code: Option<u32>| {
        (project.errors.iter())
            .any(|error| error.category == ERROR && code.is_none_or(|code| error.code == code))
    };
    if !failed(None) {
        return Ok(Project {
            files,
            problems: Vec::new(),
        });
    }
    // The tsconfig's own errors name it, and its paths, as svelte-check prints them; the overlay
    // rebases them. Without the mapped languages it may have no inputs where the overlay has.
    let own = session
        .open(&[config], &Layer::default())?
        .pop()
        .ok_or("the checker opened no project")?;
    session.release(own.snapshot)?;
    let problems = (own.errors.iter())
        .filter(|error| error.category == ERROR)
        .filter(|error| error.code != NO_INPUTS || failed(Some(NO_INPUTS)))
        .map(|error| problem(error, config))
        .collect::<Result<_, _>>()?;
    Ok(Project { files, problems })
}

/// `DiagnosticCategory.Error`.
const ERROR: u8 = 1;
/// "No inputs were found in config file".
const NO_INPUTS: u32 = 18003;

/// A tsconfig error in the file that has it, else at the start of `config`, as svelte-check
/// places it.
fn problem(
    error: &rsvelte_typescript_api::Diagnostic,
    config: &Path,
) -> Result<(PathBuf, Diagnostic), String> {
    let message = error.flattened_message();
    let diagnostic = |span| Diagnostic::error(format!("TS{}", error.code), message.clone(), span);
    let (Some(file), Some(start), Some(end)) = (
        error.file_name.as_deref(),
        error.start_position,
        error.end_position,
    ) else {
        return Ok((config.to_owned(), diagnostic(Span::new(0, 0))));
    };
    let text = std::fs::read_to_string(file).map_err(|e| format!("{}: {e}", file.display()))?;
    let lines = LineIndex::new(&text);
    let offset = |p: rsvelte_typescript_api::Position| {
        lines.offset(p.line + 1, p.character).ok_or_else(|| {
            format!(
                "the checker places TS{} at {}:{}:{}, which does not exist",
                error.code,
                file.display(),
                p.line + 1,
                p.character + 1
            )
        })
    };
    let span = Span::new(offset(start)?, offset(end)?);
    Ok((file.to_owned(), diagnostic(span)))
}
