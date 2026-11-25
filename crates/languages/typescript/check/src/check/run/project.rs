//! The files of a project, as the checker reaches them from its tsconfig: opening the project
//! expands `files`, `include` and `exclude`, counts a mapped language's extension once its
//! content mapper's package resolves, and follows every import, so rsvelte never matches the
//! patterns or resolves a module itself.

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
    /// Every file of the tsconfig's program that svelte-check reports, with the files of each of
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
        let config = rsvelte_kernel::source::paths::canonicalize(config)
            .map_err(|e| format!("{}: {e}", config.display()))?;
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
    let dir = &rsvelte_kernel::source::paths::canonicalize(dir).map_err(|e| io(dir, e))?;
    let root = config.parent().ok_or("a tsconfig has a directory")?;
    let mut layer = Layer::default();
    let mut overlay = StructuredDataWriter::new(false);
    overlay
        .begin_object()
        .key("extends")
        .write_string(&config.to_string_lossy())
        .key("contentMappers")
        .begin_array();
    for (i, language) in languages.iter().enumerate() {
        let name = format!("rsvelte-project-mapper-{i}");
        let package = dir.join(&name);
        std::fs::create_dir_all(&package).map_err(|e| io(&package, e))?;
        let manifest = package.join("package.json");
        std::fs::write(&manifest, package_json(&name, &language.content_mapper))
            .map_err(|e| io(&manifest, e))?;
        layer
            .links
            .push((root.join("node_modules").join(&name), package));
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
    // Beside the project's tsconfig, since TypeScript reads `${configDir}` as the directory of the
    // tsconfig it opens.
    let overlay_path = root.join(OVERLAY);
    layer.files.insert(overlay_path.clone(), overlay.finish());
    let mut session = Session::start(&tsc.checker.program, &tsc.checker.arguments, dir)?;
    // The tsconfig's own errors name it, and its paths, as svelte-check prints them; the overlay
    // rebases them, and `extends` hides some, such as an empty `files`. Without the mapped
    // languages it may have no inputs where the overlay has. One snapshot holds both projects.
    let mut projects = session
        .open(&[overlay_path.as_path(), config], &layer)?
        .into_iter();
    let (Some(project), Some(own)) = (projects.next(), projects.next()) else {
        return Err("the checker opened no project".to_owned());
    };
    let overlay_has_no_inputs =
        (project.errors.iter()).any(|error| error.is_error() && error.code == NO_INPUTS);
    let problems: Vec<_> = (own.errors.iter())
        .filter(|error| error.is_error())
        .filter(|error| error.code != NO_INPUTS || overlay_has_no_inputs)
        .map(|error| problem(error, config))
        .collect::<Result<_, _>>()?;
    // As svelte-check, a tsconfig with errors is reported instead of its program.
    let files = if problems.is_empty() {
        let program = session.source_file_names(&project)?;
        (program.iter())
            .map(|file| normalized(&dir.join(file)))
            .filter(|file| reported(file, languages, own.skip_lib_check))
            .collect()
    } else {
        Vec::new()
    };
    session.release(project.snapshot)?;
    Ok(Project { files, problems })
}

/// How svelte-check (`language-server/src/svelte-check.ts`) tells which files of the program to
/// report, by what a file is.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum Kind {
    /// A file of a mapped language, such as a component: svelte-check holds a document for it.
    Mapped,
    /// `x.d.ts`, or a declaration of a file with an arbitrary extension, such as `x.d.svelte.ts`:
    /// TypeScript's `isDeclarationFileName`.
    Declaration,
    /// `.js`, `.cjs` or `.mjs`.
    JavaScript,
    /// Any other file, such as `.ts` or `.json`.
    Other,
}

impl Kind {
    fn of(file: &Path, languages: &[MappedLanguage]) -> Self {
        let name = file.file_name().unwrap_or_default().to_string_lossy();
        if languages.iter().any(|l| name.ends_with(l.extension)) {
            Self::Mapped
        } else if [".d.ts", ".d.mts", ".d.cts"]
            .iter()
            .any(|e| name.ends_with(e))
            || name.ends_with(".ts") && name.contains(".d.")
        {
            Self::Declaration
        } else if [".js", ".cjs", ".mjs"].iter().any(|e| name.ends_with(e)) {
            Self::JavaScript
        } else {
            Self::Other
        }
    }
}

/// Whether svelte-check reports `file`. TypeScript skips a default library under
/// `skipDefaultLibCheck` itself, so that part of the rule needs no port.
fn reported(file: &Path, languages: &[MappedLanguage], skip_lib_check: bool) -> bool {
    let directories: Vec<&std::ffi::OsStr> = (file.parent().into_iter())
        .flat_map(Path::components)
        .map(std::path::Component::as_os_str)
        .collect();
    let in_node_modules = directories.iter().any(|d| *d == "node_modules");
    match Kind::of(file, languages) {
        // The language server skips a document in a package, unless in Sapper's `src/node_modules`.
        Kind::Mapped => {
            !in_node_modules
                || (directories.windows(2))
                    .any(|pair| pair[0] == "src" && pair[1] == "node_modules")
        }
        Kind::Declaration => !skip_lib_check,
        Kind::JavaScript => !in_node_modules,
        Kind::Other => true,
    }
}

/// The overlay tsconfig, only in the checker's file layer.
const OVERLAY: &str = ".rsvelte.project.json";

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

#[cfg(test)]
mod tests;
