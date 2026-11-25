//! One run of the type checker over a batch of projections: the file layer, the overlay
//! tsconfig and the mapper's store go in, findings located in each document come out.

use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU32, Ordering};

use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::performance::measurement;
use rsvelte_kernel::source::paths;
use rsvelte_kernel::source::positions::{LineIndex, Span};
use rsvelte_typescript_api::{Layer, Position, Session};
use selection::Selected;
use shares::{Checked, Helper, check_shares};
use untyped::{UntypedDocuments, UntypedImport, UntypedJavaScript, ambient};

use super::{StandIn, Tsc, TypeScriptEnv};
use crate::type_checker::{CONTRACT, TypeChecker};

#[derive(Debug)]
pub(crate) struct CheckRequest<'a> {
    /// Each document's path as the user knows it; a relative one is beside the tsconfig.
    pub documents: Vec<String>,
    /// Generated TypeScript, one per document.
    pub files: Vec<&'a str>,
    pub mapped_files: Vec<Option<ContentMappedInput>>,
    /// What the documents' languages add to the project.
    pub env: &'a TypeScriptEnv,
    /// Documents the run does not check, by path, with what an import of each one reads.
    pub stand_ins: Vec<(String, StandIn)>,
    /// Each document's imports.
    pub imports: Vec<Vec<CheckedImport>>,
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
    /// Where a finding in code a content mapper synthesized starts in the text it generated.
    pub synthesized: Option<Position>,
    /// A syntax error, which TypeScript reports before the other findings of a file.
    pub syntactic: bool,
}

/// A run's findings, and the directory of its project.
#[derive(Debug)]
pub(crate) struct Report {
    pub diagnostics: Vec<TypeScriptDiagnostic>,
    /// The tsconfig's directory, or the current one: a real path.
    pub root: PathBuf,
}

static RUN: AtomicU32 = AtomicU32::new(0);

/// The directory beside each project root that holds the files rsvelte adds, such as the
/// declarations. It exists only in the checker's file layer.
const OVERLAY: &str = ".rsvelte";
/// The tsconfig the checker checks, which extends the project's. It and every other tsconfig
/// rsvelte adds sit beside the project's, since TypeScript reads `${configDir}` and the default
/// `rootDir` as the directory of the tsconfig it opens.
const OVERLAY_CONFIG: &str = ".rsvelte.tsconfig.json";
const MAPPER_PACKAGE: &str = "rsvelte-content-mapper";

impl Tsc {
    /// # Errors
    ///
    /// A message if the projections cannot be written, the checker cannot run, or it reports a
    /// diagnostic outside every document.
    pub(crate) fn check(&self, req: &CheckRequest<'_>) -> Result<Report, String> {
        if req.env.content_mapper.is_none() && req.mapped_files.iter().any(Option::is_some) {
            return Err("content-mapped inputs require a mapper executable".into());
        }
        // Only what the mapper process reads is on the disk: its package and the projections.
        in_temporary_directory("rsvelte-tsc", |dir| self.check_with(dir, req))
    }

    /// The tsconfig, and where a document with a relative path is: beside the tsconfig, else in
    /// the current directory, as the command line resolves it. The checker names files by their
    /// real path, such as `/private/var` for `/var`, so both are real paths.
    fn root(&self) -> Result<(Option<PathBuf>, PathBuf), String> {
        let real = |p: &Path| paths::canonicalize(p).map_err(|e| format!("{}: {e}", p.display()));
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

    fn check_with(&self, support: &Path, req: &CheckRequest<'_>) -> Result<Report, String> {
        let (base, root) = self.root()?;
        let paths: Vec<PathBuf> = (0..req.files.len())
            .map(|i| req.checked_path(&root, i))
            .collect();
        let overlay = root.join(OVERLAY);
        let (mut layer, store, declarations) = layer(req, support, &root, &overlay, &paths)?;
        let failed = |e: String| format!("{e}; rsvelte needs {CONTRACT}");
        let _p = measurement::phase("ts.tsc");
        let helpers = self.start_helpers(paths.len(), &root);
        let mut session = Session::start(&self.checker.program, &self.checker.arguments, &root)
            .map_err(failed)?;
        // The project's own root files, as its tsconfig selects them, components included; the
        // overlay keeps them.
        let javascript = untyped::javascript_documents(req, &root, &paths);
        let mut own = base_project(
            &mut session,
            base.as_deref(),
            req,
            (&overlay, &store),
            &javascript,
            &mut layer,
        )
        .map_err(failed)?;
        let mut roots = std::mem::take(&mut own.roots);
        own.script_modules =
            own.node_resolution && script_module::add(&mut layer, &roots, &paths, req);
        let all_untyped = own.untyped == UntypedJavaScript::All;
        if all_untyped {
            let declaration = untyped::options_declaration(&overlay);
            roots.push(declaration.0.clone());
            layer.files.insert(declaration.0, declaration.1);
        }
        // A document is a root only where the project does not reach it.
        roots.extend(
            (paths.iter())
                .filter(|path| !own.selected.reached.contains(*path))
                .cloned(),
        );
        // Upstream's project holds every component, so one that is not checked still declares
        // its globals.
        roots.extend(req.stand_ins(&root).map(|(path, _)| path).filter(|path| {
            (req.env.script_modules.iter())
                .any(|extension| path.as_os_str().to_string_lossy().ends_with(extension))
        }));
        roots.extend(declarations);
        roots.extend(req.env.include.iter().cloned());
        let config = root.join(OVERLAY_CONFIG);
        layer.files.insert(
            config.clone(),
            tsconfig_json(base.as_deref(), req, &own, &roots, Some(&store)),
        );
        let files: Vec<&Path> = paths.iter().map(PathBuf::as_path).collect();
        let mut external = std::mem::take(&mut own.selected.external);
        // Where an import of JavaScript may be untyped, the checker resolves each import.
        let resolve =
            (all_untyped || !external.is_empty()).then_some((req, paths.as_slice(), &javascript));
        let mut checked = check_shares(&mut session, helpers, &config, &layer, &files, resolve)
            .map_err(failed)?;
        untyped::drop_loaded(req, &checked.modules, &mut external);
        if !external.is_empty() {
            // The components a search of `node_modules` finds read as untyped JavaScript, which
            // the projections say, so the files are checked again with them.
            let store = mapped::untyped_store(req, &root, &paths, &external, store)?;
            let text = tsconfig_json(base.as_deref(), req, &own, &roots, Some(&store));
            layer.files.insert(config.clone(), text);
            let helpers = self.start_helpers(paths.len(), &root);
            let modules = std::mem::take(&mut checked.modules);
            checked = check_shares(&mut session, helpers, &config, &layer, &files, None)
                .map_err(failed)?;
            checked.modules = modules;
        }
        let untyped_documents = UntypedDocuments {
            all: all_untyped,
            javascript,
            external,
        };
        let index = path_index(&paths);
        let mut untyped = untyped::imports(req, &checked.modules, &untyped_documents);
        let extensions = req.mapped_extensions();
        let config = |roots: &[PathBuf]| tsconfig_json(base.as_deref(), req, &own, roots, None);
        let probed = (roots.as_slice(), extensions.as_slice());
        ambient::drop_matched(
            &mut session,
            &mut layer,
            &overlay,
            probed,
            &config,
            &mut untyped,
        )
        .map_err(failed)?;
        // The session ends when it drops, which frees the snapshot with the process.
        let documents = (paths.as_slice(), &index);
        let diagnostics = self.findings(
            req,
            checked,
            &own.selected,
            documents,
            &untyped_documents,
            &untyped,
        )?;
        Ok(Report { diagnostics, root })
    }

    /// The errors of `checked`, at the lines of the documents `index` names, with the TS7016 of
    /// each `untyped` import.
    fn findings(
        &self,
        req: &CheckRequest<'_>,
        checked: Checked,
        selected: &Selected,
        (paths, index): (&[PathBuf], &HashMap<&Path, usize>),
        untyped_documents: &UntypedDocuments,
        untyped: &[UntypedImport<'_>],
    ) -> Result<Vec<TypeScriptDiagnostic>, String> {
        let [program, syntactic, semantic] = checked.found;
        // A document the program does not reach at all is one the run was given, which
        // svelte-check checks as a root.
        let unloaded = |file: usize| untyped_documents.unloaded(&paths[file], &selected.reached);
        let lines: Vec<LineIndex> = (0..req.files.len())
            .map(|i| LineIndex::new(req.text(i)))
            .collect();
        program
            .into_iter()
            .map(|d| (false, d))
            .chain(syntactic.into_iter().map(|d| (true, d)))
            .chain(semantic.into_iter().map(|d| (false, d)))
            // The command line reports errors only; svelte-check's errors are the oracle.
            .filter(|(_, d)| d.is_error())
            .map(|(syntactic, d)| {
                located(&d, index, &lines, syntactic).ok_or_else(|| unlocated(&self.checker, &d))
            })
            .filter(|found| {
                !found.as_ref().is_ok_and(|found| {
                    unloaded(found.file) || untyped::hides(found, untyped, req.text(found.file))
                })
            })
            .chain(untyped.iter().map(|import| Ok(import.finding())))
            .collect()
    }

    /// How many checker processes share `files` documents: as many as asked, else one per
    /// `FILES_PER_PROCESS`, at most `MOST_PROCESSES` and the CPUs.
    fn processes(&self, files: usize) -> usize {
        let chosen = self.processes.map_or_else(
            || {
                let cpus = std::thread::available_parallelism().map_or(1, usize::from);
                files
                    .div_ceil(FILES_PER_PROCESS)
                    .min(MOST_PROCESSES)
                    .min(cpus)
            },
            usize::from,
        );
        chosen.clamp(1, files.max(1))
    }

    /// Checker processes besides the first, started at once so that they are ready when the
    /// project is.
    fn start_helpers(&self, files: usize, root: &Path) -> Vec<Helper> {
        (1..self.processes(files))
            .map(|_| {
                let checker = self.checker.clone();
                let root = root.to_owned();
                std::thread::spawn(move || {
                    Session::start(&checker.program, &checker.arguments, &root)
                })
            })
            .collect()
    }
}

/// Runs `work` in a new temporary directory, given by its real path, as the checker names files,
/// and removes the directory after.
fn in_temporary_directory<T>(
    prefix: &str,
    work: impl FnOnce(&Path) -> Result<T, String>,
) -> Result<T, String> {
    let dir = std::env::temp_dir().join(format!(
        "{prefix}-{}-{}",
        std::process::id(),
        RUN.fetch_add(1, Ordering::Relaxed)
    ));
    let io = |e: std::io::Error| format!("{}: {e}", dir.display());
    std::fs::create_dir_all(&dir).map_err(io)?;
    let result = paths::canonicalize(&dir)
        .map_err(io)
        .and_then(|real| work(&real));
    // Best effort: a leftover temporary directory does not affect the result.
    drop(std::fs::remove_dir_all(&dir));
    result
}

/// Each process parses the whole program again, so a few documents are not worth one more.
const FILES_PER_PROCESS: usize = 50;
/// Each process opens the project again, so more of them cost more than they save.
const MOST_PROCESSES: usize = 4;

fn tsconfig_json(
    base: Option<&Path>,
    req: &CheckRequest<'_>,
    own: &BaseProject,
    roots: &[PathBuf],
    store: Option<&Path>,
) -> String {
    let mut w = StructuredDataWriter::new(true);
    w.begin_object();
    if let Some(base) = base {
        w.key("extends").write_string(&paths::typescript(base));
    }
    w.key("compilerOptions")
        .begin_object()
        .key("noEmit")
        .write_boolean(true);
    if own.script_modules {
        // A script module's declaration has the name of a document, such as `x.d.svelte.ts`.
        w.key("allowArbitraryExtensions").write_boolean(true);
    }
    w.key("paths").begin_object();
    for (spec, targets) in &own.paths {
        if req.env.paths.iter().any(|(own, _)| own == spec) {
            continue;
        }
        w.key(spec).begin_array();
        for target in targets {
            w.write_string(&paths::typescript(target));
        }
        w.end_array();
    }
    for (spec, file) in &req.env.paths {
        w.key(spec)
            .begin_array()
            .write_string(&paths::typescript(file))
            .end_array();
    }
    w.end_object().end_object();
    if let Some(store) = store {
        req.write_mapper_config(&mut w, MAPPER_PACKAGE, store);
    }
    w.key("files").begin_array();
    let mut listed = HashSet::new();
    for p in roots {
        if listed.insert(p) {
            w.write_string(&paths::typescript(p));
        }
    }
    w.end_array().end_object();
    w.finish()
}

/// The files the checker reads over the disk: the documents' texts, the stand-ins, the
/// declarations and the content mapper's package, which serves the store it returns. It also
/// returns the declarations' paths.
fn layer(
    req: &CheckRequest<'_>,
    support: &Path,
    root: &Path,
    overlay: &Path,
    paths: &[PathBuf],
) -> Result<(Layer, PathBuf, Vec<PathBuf>), String> {
    let mut layer = Layer {
        files: req.env.replaced.iter().cloned().collect(),
        links: Vec::new(),
    };
    // A document of a replaced file has the replaced text, as the host reads it.
    for (i, path) in paths.iter().enumerate() {
        layer.files.insert(path.clone(), req.text(i).to_owned());
    }
    layer.files.extend(
        req.stand_ins(root)
            .map(|(path, stand_in)| (path, stand_in.text.clone())),
    );
    let store = support.join("projections.json");
    if let Some(binary) = &req.env.content_mapper {
        let package = mapped::write_mapper(req, binary, support, &store, root, paths)?;
        // The overlay tsconfigs, beside the project's, resolve the package from its directory.
        layer
            .links
            .push((root.join("node_modules").join(MAPPER_PACKAGE), package));
    }
    let declarations: Vec<PathBuf> = req
        .env
        .declarations
        .iter()
        .map(|(name, text)| {
            let path = overlay.join(name);
            layer.files.insert(path.clone(), (*text).to_owned());
            path
        })
        .collect();
    Ok((layer, store, declarations))
}

/// What the overlay keeps of the project its tsconfig describes.
#[derive(Default)]
struct BaseProject {
    /// The root files, as the tsconfig selects them, components included.
    roots: Vec<PathBuf>,
    /// `compilerOptions.paths`, which the overlay's own `paths` would otherwise replace.
    paths: Vec<(String, Vec<PathBuf>)>,
    /// Which imports of JavaScript the options make untyped. Without a tsconfig,
    /// `noImplicitAny` is off and such an import stays quiet.
    untyped: UntypedJavaScript,
    /// Whether modules resolve as `node16` or `nodenext` do.
    node_resolution: bool,
    /// Whether the file layer holds a declaration of a script module, such as `x.d.svelte.ts`.
    script_modules: bool,
    /// What the project the tsconfig selects holds beyond its roots, and of the JavaScript
    /// documents where a package's JavaScript is untyped, those a search of `node_modules`
    /// found.
    selected: Selected,
}

/// The project of the tsconfig `base`, whose `javascript` documents a search of `node_modules`
/// may find.
fn base_project(
    session: &mut Session,
    base: Option<&Path>,
    req: &CheckRequest<'_>,
    (overlay, store): (&Path, &Path),
    javascript: &HashSet<PathBuf>,
    layer: &mut Layer,
) -> Result<BaseProject, String> {
    let Some(base) = base else {
        return Ok(BaseProject::default());
    };
    let root = base.parent().ok_or("a tsconfig has a directory")?;
    // Without a content mapper the tsconfig's own project is the selection's.
    let selection =
        (req.env.content_mapper.is_some()).then(|| selection::config(req, root, base, store));
    layer.files.extend(selection.iter().cloned());
    let probe = (!javascript.is_empty()).then(|| untyped::probe(root, overlay, base));
    layer.files.extend(probe.iter().flatten().cloned());
    let mut configs = vec![base];
    configs.extend(selection.iter().map(|(config, _)| config.as_path()));
    configs.extend(probe.iter().map(|[.., (config, _)]| config.as_path()));
    // One snapshot holds every project.
    let mut projects = session.open(&configs, layer)?.into_iter();
    let project = projects.next().ok_or("the checker opened no project")?;
    let selection = match selection {
        Some(_) => Some(projects.next().ok_or("the checker opened no selection")?),
        None => None,
    };
    let untyped = match projects.next() {
        Some(probe) => untyped::reported(session, &probe, overlay)?,
        None => UntypedJavaScript::None,
    };
    let ask = (untyped == UntypedJavaScript::Packages).then_some(javascript);
    let selected = selection::selected(session, selection.as_ref().unwrap_or(&project), ask)?;
    session.release(project.snapshot)?;
    Ok(BaseProject {
        roots: selection.map_or(project.root_files, |selection| selection.root_files),
        paths: project.paths,
        untyped,
        node_resolution: project.node_resolution,
        script_modules: false,
        selected,
    })
}

/// What native TypeScript adds to a finding in code a content mapper synthesized.
pub(super) const VIRTUAL_CODE: &str =
    "This location is in virtual code produced by the content mapper";

/// Each document's index by its path, the first of a path given twice.
fn path_index(paths: &[PathBuf]) -> HashMap<&Path, usize> {
    (paths.iter().enumerate().rev())
        .map(|(file, path)| (path.as_path(), file))
        .collect()
}

/// The document and byte range of a diagnostic in the document `index` names, whose texts
/// `lines` index.
fn located(
    d: &rsvelte_typescript_api::Diagnostic,
    index: &HashMap<&Path, usize>,
    lines: &[LineIndex],
    syntactic: bool,
) -> Option<TypeScriptDiagnostic> {
    let file = *index.get(d.file_name.as_deref()?)?;
    let offset = |p: Option<Position>| {
        let p = p?;
        lines[file].offset(p.line + 1, p.character)
    };
    let message = d.flattened_message();
    // A finding in synthesized code carries its position in the generated text, beside this note.
    let synthesized = message.contains(VIRTUAL_CODE);
    let span = offset(d.start_position)
        .zip(offset(d.end_position))
        .filter(|(start, end)| start <= end && !synthesized)
        .map(|(start, end)| Span::new(start, end));
    Some(TypeScriptDiagnostic {
        file,
        code: d.code,
        message,
        span,
        synthesized: d.start_position.filter(|_| synthesized),
        syntactic,
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
mod project;
mod script_module;
mod selection;
mod shares;
mod untyped;
pub(crate) use mapped::ContentMappedInput;
pub(crate) use untyped::{CheckedImport, checked_imports};
