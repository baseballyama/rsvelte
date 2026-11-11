//! One run of the type checker over a batch of projections: the file layer, the overlay
//! tsconfig and the mapper's store go in, findings located in each document come out.

use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU32, Ordering};

use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::performance::measurement;
use rsvelte_kernel::source::positions::{LineIndex, Span};
use rsvelte_typescript_api::{DiagnosticKind, Layer, Position, Session};

use super::{CONTRACT, Tsc, TypeChecker};

#[derive(Default, Debug)]
pub(crate) struct CheckRequest {
    /// Each document's path as the user knows it; a relative one is beside the tsconfig.
    pub documents: Vec<String>,
    /// Generated TypeScript, one per document.
    pub files: Vec<String>,
    pub mapped_files: Vec<Option<ContentMappedInput>>,
    pub content_mapper: Option<PathBuf>,
    /// Declaration files the checker reads beside the overlay tsconfig, by name.
    pub declarations: Vec<(&'static str, &'static str)>,
    /// Existing declaration files to include.
    pub include: Vec<PathBuf>,
    /// `compilerOptions.paths` entries: module specifier → file.
    pub paths: Vec<(&'static str, PathBuf)>,
}

#[derive(Debug, PartialEq, Eq)]
pub(crate) struct TypeScriptDiagnostic {
    /// Index into [`CheckRequest::files`].
    pub file: usize,
    pub code: u32,
    /// The message chain, one line per link, indented two spaces per level (as svelte-check and
    /// `ts.flattenDiagnosticMessageText(…, "\n")` render it).
    pub message: String,
    /// Byte range in the input: original for content-mapped files, generated otherwise. `None`
    /// in code a content mapper synthesized, which no source range explains.
    pub span: Option<Span>,
}

static RUN: AtomicU32 = AtomicU32::new(0);

/// The directory beside each project root that holds what rsvelte adds: the overlay tsconfig and
/// the declarations. It exists only in the checker's file layer.
const OVERLAY: &str = ".rsvelte";
const MAPPER_PACKAGE: &str = "rsvelte-content-mapper";

impl Tsc {
    /// # Errors
    ///
    /// A message if the projections cannot be written, the checker cannot run, or it reports a
    /// diagnostic outside every document.
    pub(crate) fn check(&self, req: &CheckRequest) -> Result<Vec<TypeScriptDiagnostic>, String> {
        if req.documents.len() != req.files.len()
            || (!req.mapped_files.is_empty() && req.mapped_files.len() != req.files.len())
        {
            return Err("mapped inputs must match the projection population".into());
        }
        if req.content_mapper.is_none() && req.mapped_files.iter().any(Option::is_some) {
            return Err("content-mapped inputs require a mapper executable".into());
        }
        // Only what the mapper process reads is on the disk: its package and the projections.
        let dir = std::env::temp_dir().join(format!(
            "rsvelte-tsc-{}-{}",
            std::process::id(),
            RUN.fetch_add(1, Ordering::Relaxed)
        ));
        std::fs::create_dir_all(&dir).map_err(|e| format!("{}: {e}", dir.display()))?;
        let dir = std::fs::canonicalize(&dir).map_err(|e| format!("{}: {e}", dir.display()))?;
        let result = self.check_with(&dir, req);
        // Best effort: a leftover temporary directory does not affect the result.
        drop(std::fs::remove_dir_all(&dir));
        result
    }

    /// The tsconfig, and where a document with a relative path is: beside the tsconfig, else in
    /// the current directory, as the command line resolves it. The checker names files by their
    /// real path, such as `/private/var` for `/var`, so both are real paths.
    fn root(&self) -> Result<(Option<PathBuf>, PathBuf), String> {
        let real = |p: &Path| std::fs::canonicalize(p).map_err(|e| format!("{}: {e}", p.display()));
        match &self.tsconfig {
            Some(config) => {
                let config = real(config)?;
                let root = config.parent().map(Path::to_owned);
                Ok((Some(config), root.ok_or("a tsconfig has a directory")?))
            }
            None => Ok((
                None,
                real(&std::env::current_dir().map_err(|e| e.to_string())?)?,
            )),
        }
    }

    fn check_with(
        &self,
        support: &Path,
        req: &CheckRequest,
    ) -> Result<Vec<TypeScriptDiagnostic>, String> {
        let (base, root) = self.root()?;
        let paths: Vec<PathBuf> = (0..req.files.len())
            .map(|i| req.checked_path(&root, i))
            .collect();
        let overlay = root.join(OVERLAY);
        let mut layer = Layer::default();
        for (i, path) in paths.iter().enumerate() {
            let mapped = req.mapped_files.get(i).and_then(Option::as_ref);
            let text = mapped.map_or(&req.files[i], |file| &file.source);
            layer.files.push((path.clone(), text.clone()));
        }
        let store = support.join("projections.json");
        if let Some(binary) = &req.content_mapper {
            std::fs::write(&store, mapped::store_json(req, &paths))
                .map_err(|e| format!("{}: {e}", store.display()))?;
            let package = support.join(MAPPER_PACKAGE);
            std::fs::create_dir_all(&package).map_err(|e| e.to_string())?;
            std::fs::write(package.join("package.json"), mapped::package_json(binary))
                .map_err(|e| e.to_string())?;
            layer
                .links
                .push((overlay.join("node_modules").join(MAPPER_PACKAGE), package));
        }
        let declarations: Vec<PathBuf> = req
            .declarations
            .iter()
            .map(|(name, text)| {
                let path = overlay.join(name);
                layer.files.push((path.clone(), (*text).to_owned()));
                path
            })
            .collect();
        let failed = |e: String| format!("{e}; rsvelte needs {CONTRACT}");
        let _p = measurement::phase("ts.tsc");
        let mut session = Session::start(&self.checker.program, &self.checker.arguments, &root)
            .map_err(failed)?;
        // The project's own root files, as its tsconfig selects them; the overlay keeps them.
        let mut roots = if let Some(base) = &base {
            let project = session.open(&[base], &layer).map_err(failed)?.remove(0);
            session.release(project.snapshot).map_err(failed)?;
            project.root_files
        } else {
            Vec::new()
        };
        roots.extend(paths.iter().cloned());
        roots.extend(declarations);
        roots.extend(req.include.iter().cloned());
        let config = overlay.join("tsconfig.json");
        layer.files.push((
            config.clone(),
            tsconfig_json(base.as_deref(), req, &roots, &store),
        ));
        let project = session.open(&[&config], &layer).map_err(failed)?.remove(0);
        let files: Vec<&Path> = paths.iter().map(PathBuf::as_path).collect();
        let mut found = session
            .diagnostics(&project, DiagnosticKind::Program, None)
            .map_err(failed)?;
        for kind in [DiagnosticKind::Syntactic, DiagnosticKind::Semantic] {
            found.extend(
                session
                    .diagnostics(&project, kind, Some(&files))
                    .map_err(failed)?,
            );
        }
        session.release(project.snapshot).map_err(failed)?;
        let lines: Vec<LineIndex> = req
            .files
            .iter()
            .enumerate()
            .map(|(i, f)| {
                LineIndex::new(
                    req.mapped_files
                        .get(i)
                        .and_then(Option::as_ref)
                        .map_or(f.as_str(), |mapped| mapped.source.as_str()),
                )
            })
            .collect();
        found
            .into_iter()
            // The command line reports errors only; svelte-check's errors are the oracle.
            .filter(|d| d.category == ERROR)
            .map(|d| located(&d, &paths, &lines).ok_or_else(|| unlocated(&self.checker, &d)))
            .collect()
    }
}

fn tsconfig_json(
    base: Option<&Path>,
    req: &CheckRequest,
    roots: &[PathBuf],
    store: &Path,
) -> String {
    let mut w = StructuredDataWriter::new(true);
    w.begin_object();
    if let Some(base) = base {
        w.key("extends").write_string(&base.to_string_lossy());
    }
    w.key("compilerOptions")
        .begin_object()
        .key("noEmit")
        .write_boolean(true)
        .key("skipLibCheck")
        .write_boolean(true);
    w.key("paths").begin_object();
    for (spec, file) in &req.paths {
        w.key(spec)
            .begin_array()
            .write_string(&file.to_string_lossy())
            .end_array();
    }
    w.end_object().end_object();
    req.write_mapper_config(&mut w, MAPPER_PACKAGE, store);
    w.key("files").begin_array();
    let mut listed = std::collections::HashSet::new();
    for p in roots {
        if listed.insert(p) {
            w.write_string(&p.to_string_lossy());
        }
    }
    w.end_array().end_object();
    w.finish()
}

/// `DiagnosticCategory.Error`.
const ERROR: u8 = 1;

/// The document and byte range of a diagnostic in one of `paths`, whose texts `lines` index.
fn located(
    d: &rsvelte_typescript_api::Diagnostic,
    paths: &[PathBuf],
    lines: &[LineIndex],
) -> Option<TypeScriptDiagnostic> {
    let file = paths.iter().position(|p| Some(p) == d.file_name.as_ref())?;
    let offset = |p: Option<Position>| {
        let p = p?;
        lines[file].offset(p.line + 1, p.character)
    };
    let span = offset(d.start_position)
        .zip(offset(d.end_position))
        .filter(|(start, end)| start <= end)
        .map(|(start, end)| Span::new(start, end));
    Some(TypeScriptDiagnostic {
        file,
        code: d.code,
        message: d.flattened_message(),
        span,
    })
}

/// A diagnostic outside every document, such as one in tsconfig.json, fails the whole check.
fn unlocated(checker: &TypeChecker, d: &rsvelte_typescript_api::Diagnostic) -> String {
    let at = d
        .file_name
        .as_ref()
        .map_or_else(String::new, |f| format!("{}: ", f.display()));
    format!(
        "{checker}: {at}error TS{}: {}",
        d.code,
        d.flattened_message()
    )
}

mod mapped;
pub(crate) use mapped::ContentMappedInput;
