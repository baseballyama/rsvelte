//! One run of the type checker over a batch of projections: the file layer, the overlay
//! tsconfig and the mapper's store go in, findings located in each document come out.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU32, Ordering};

use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::performance::measurement;
use rsvelte_kernel::source::positions::{LineIndex, Span};
use rsvelte_typescript_api::{DiagnosticKind, Layer, Position, Project, Session};

use super::{Tsc, TypeScriptEnv};
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
    pub stand_ins: Vec<(String, String)>,
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
    /// A syntax error, which TypeScript reports before the other findings of a file.
    pub syntactic: bool,
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
    pub(crate) fn check(
        &self,
        req: &CheckRequest<'_>,
    ) -> Result<Vec<TypeScriptDiagnostic>, String> {
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
        req: &CheckRequest<'_>,
    ) -> Result<Vec<TypeScriptDiagnostic>, String> {
        let (base, root) = self.root()?;
        let paths: Vec<PathBuf> = (0..req.files.len())
            .map(|i| req.checked_path(&root, i))
            .collect();
        let overlay = root.join(OVERLAY);
        let mut layer = Layer {
            files: req.env.replaced.iter().cloned().collect(),
            links: Vec::new(),
        };
        // A document of a replaced file has the replaced text, as the host reads it.
        for (i, path) in paths.iter().enumerate() {
            layer.files.insert(path.clone(), req.text(i).to_owned());
        }
        layer.files.extend(
            req.stand_ins(&root)
                .map(|(path, text)| (path, text.to_owned())),
        );
        let store = support.join("projections.json");
        if let Some(binary) = &req.env.content_mapper {
            let package = mapped::write_mapper(req, binary, support, &store, &root, &paths)?;
            layer
                .links
                .push((overlay.join("node_modules").join(MAPPER_PACKAGE), package));
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
        let failed = |e: String| format!("{e}; rsvelte needs {CONTRACT}");
        let _p = measurement::phase("ts.tsc");
        let helpers = self.start_helpers(paths.len(), &root);
        let mut session = Session::start(&self.checker.program, &self.checker.arguments, &root)
            .map_err(failed)?;
        // The project's own root files, as its tsconfig selects them; the overlay keeps them.
        let mut own = base_project(&mut session, base.as_deref(), req, &overlay, &mut layer)
            .map_err(failed)?;
        let mut roots = std::mem::take(&mut own.roots);
        own.script_modules =
            own.node_resolution && script_module::add(&mut layer, &roots, &paths, req);
        if own.untyped {
            let declaration = untyped::options_declaration(&overlay);
            roots.push(declaration.0.clone());
            layer.files.insert(declaration.0, declaration.1);
        }
        roots.extend(paths.iter().cloned());
        // Upstream's project holds every component, so one that is not checked still declares
        // its globals.
        roots.extend(req.stand_ins(&root).map(|(path, _)| path).filter(|path| {
            (req.env.script_modules.iter())
                .any(|extension| path.as_os_str().to_string_lossy().ends_with(extension))
        }));
        roots.extend(declarations);
        roots.extend(req.env.include.iter().cloned());
        let config = overlay.join("tsconfig.json");
        layer.files.insert(
            config.clone(),
            tsconfig_json(base.as_deref(), req, &own, &roots, &store),
        );
        let files: Vec<&Path> = paths.iter().map(PathBuf::as_path).collect();
        let [program, syntactic, semantic] =
            check_shares(&mut session, helpers, &config, &layer, &files).map_err(failed)?;
        let index = path_index(&paths);
        let (untyped, untyped_names) = if own.untyped {
            untyped::imports(req, &root, &paths, &index)
        } else {
            (Vec::new(), Vec::new())
        };
        // The session ends when it drops, which frees the snapshot with the process.
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
                located(&d, &root, &index, &lines, syntactic)
                    .ok_or_else(|| unlocated(&self.checker, &d))
            })
            .filter(|found| {
                !found.as_ref().is_ok_and(|found| {
                    req.mapped(found.file)
                        .is_some_and(|mapped| untyped::hides(found, &untyped_names, &mapped.source))
                })
            })
            .chain(untyped.into_iter().map(Ok))
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
    let result = std::fs::canonicalize(&dir)
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

type Helper = std::thread::JoinHandle<Result<Session, String>>;
type Found = Vec<rsvelte_typescript_api::Diagnostic>;

/// The program, syntactic and semantic findings of `files` in the project of `config`. Every
/// process opens the project at the same time and takes shares of the files from `Shares` until
/// none is left; `session` also asks for the program and syntactic findings.
fn check_shares(
    session: &mut Session,
    helpers: Vec<Helper>,
    config: &Path,
    layer: &Layer,
    files: &[&Path],
) -> Result<[Found; 3], String> {
    let shares = Shares::new(files, helpers.len() + 1);
    let shares = &shares;
    std::thread::scope(|scope| {
        let running: Vec<_> = helpers
            .into_iter()
            .map(|helper| {
                scope.spawn(move || {
                    let mut helper = helper
                        .join()
                        .unwrap_or_else(|panic| std::panic::resume_unwind(panic))?;
                    let project = helper.open(&[config], layer)?.remove(0);
                    shares.check(&mut helper, &project)
                })
            })
            .collect();
        let project = session.open(&[config], layer)?.remove(0);
        let program = session.diagnostics(&project, DiagnosticKind::Program, None)?;
        let syntactic = session.diagnostics(&project, DiagnosticKind::Syntactic, Some(files))?;
        let mut semantic = shares.check(session, &project)?;
        for helper in running {
            semantic.extend(
                helper
                    .join()
                    .unwrap_or_else(|panic| std::panic::resume_unwind(panic))?,
            );
        }
        Ok([program, syntactic, semantic])
    })
}

/// The files no process has taken yet. A process takes half of its part of what is left, as in
/// factoring scheduling: early shares are large, so few requests are made, and the last are
/// single files, so the processes finish together however long each file takes.
struct Shares<'a> {
    files: &'a [&'a Path],
    processes: usize,
    taken: std::sync::Mutex<usize>,
}

impl<'a> Shares<'a> {
    const fn new(files: &'a [&'a Path], processes: usize) -> Self {
        Self {
            files,
            processes,
            taken: std::sync::Mutex::new(0),
        }
    }

    fn take(&self) -> Option<&'a [&'a Path]> {
        let mut taken = self
            .taken
            .lock()
            .unwrap_or_else(std::sync::PoisonError::into_inner);
        let start = *taken;
        let left = self.files.len() - start;
        *taken += left.div_ceil(2 * self.processes);
        let end = *taken;
        drop(taken);
        (left != 0).then(|| &self.files[start..end])
    }

    /// The semantic findings of each share `session` takes.
    fn check(&self, session: &mut Session, project: &Project) -> Result<Found, String> {
        let mut found = Vec::new();
        while let Some(share) = self.take() {
            found.extend(session.diagnostics(project, DiagnosticKind::Semantic, Some(share))?);
        }
        Ok(found)
    }
}

fn tsconfig_json(
    base: Option<&Path>,
    req: &CheckRequest<'_>,
    own: &BaseProject,
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
        .write_boolean(true);
    if let Some(root_dir) = own.default_root_dir.as_deref() {
        // The default would otherwise be the overlay's directory.
        w.key("rootDir").write_string(&root_dir.to_string_lossy());
    }
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
            w.write_string(&target.to_string_lossy());
        }
        w.end_array();
    }
    for (spec, file) in &req.env.paths {
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

/// What the overlay keeps of the project its tsconfig describes.
#[derive(Default)]
struct BaseProject {
    /// The root files, as the tsconfig selects them.
    roots: Vec<PathBuf>,
    /// `compilerOptions.paths`, which the overlay's own `paths` would otherwise replace.
    paths: Vec<(String, Vec<PathBuf>)>,
    /// Whether the options make an import of JavaScript untyped. Without a tsconfig,
    /// `noImplicitAny` is off and such an import stays quiet.
    untyped: bool,
    /// Whether modules resolve as `node16` or `nodenext` do.
    node_resolution: bool,
    /// Whether the file layer holds a declaration of a script module, such as `x.d.svelte.ts`.
    script_modules: bool,
    /// The directory of the project's tsconfig, when TypeScript checks files against `rootDir`
    /// and the tsconfig leaves it to that default.
    default_root_dir: Option<PathBuf>,
}

fn base_project(
    session: &mut Session,
    base: Option<&Path>,
    req: &CheckRequest<'_>,
    overlay: &Path,
    layer: &mut Layer,
) -> Result<BaseProject, String> {
    let Some(base) = base else {
        return Ok(BaseProject::default());
    };
    let probe = untyped::any_javascript(req).then(|| untyped::probe(overlay, base));
    layer.files.extend(probe.iter().flatten().cloned());
    let mut configs = vec![base];
    configs.extend(probe.iter().map(|[.., (config, _)]| config.as_path()));
    // One snapshot holds both projects.
    let mut projects = session.open(&configs, layer)?.into_iter();
    let project = projects.next().ok_or("the checker opened no project")?;
    let untyped = match projects.next() {
        Some(probe) => untyped::reported(session, &probe, overlay)?,
        None => false,
    };
    session.release(project.snapshot)?;
    Ok(BaseProject {
        roots: project.root_files,
        paths: project.paths,
        untyped,
        node_resolution: project.node_resolution,
        script_modules: false,
        default_root_dir: (project.default_root_dir)
            .then(|| base.parent().map(Path::to_path_buf))
            .flatten(),
    })
}

/// What native TypeScript adds to a finding in code a content mapper synthesized.
const VIRTUAL_CODE: &str = "This location is in virtual code produced by the content mapper";

/// Each document's index by its path, the first of a path given twice.
fn path_index(paths: &[PathBuf]) -> HashMap<&Path, usize> {
    (paths.iter().enumerate().rev())
        .map(|(file, path)| (path.as_path(), file))
        .collect()
}

/// The document and byte range of a diagnostic in the document `index` names, whose texts
/// `lines` index. A path below `root` in the message drops that root, so the message does not
/// depend on where the project is.
fn located(
    d: &rsvelte_typescript_api::Diagnostic,
    root: &Path,
    index: &HashMap<&Path, usize>,
    lines: &[LineIndex],
    syntactic: bool,
) -> Option<TypeScriptDiagnostic> {
    let file = *index.get(d.file_name.as_deref()?)?;
    let offset = |p: Option<Position>| {
        let p = p?;
        lines[file].offset(p.line + 1, p.character)
    };
    let message = d.flattened_message().replace(
        &format!("{}{}", root.display(), std::path::MAIN_SEPARATOR),
        "",
    );
    // A finding in synthesized code may still carry a nearby position, beside this note.
    let span = offset(d.start_position)
        .zip(offset(d.end_position))
        .filter(|(start, end)| start <= end && !message.contains(VIRTUAL_CODE))
        .map(|(start, end)| Span::new(start, end));
    Some(TypeScriptDiagnostic {
        file,
        code: d.code,
        message,
        span,
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
mod untyped;
pub(crate) use mapped::ContentMappedInput;

#[cfg(test)]
mod tests;
