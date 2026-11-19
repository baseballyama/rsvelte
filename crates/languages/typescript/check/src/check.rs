//! Type checking with TypeScript's own checker.
//!
//! Native TypeScript 7.1 checks a batch through its API, which answers with structured
//! diagnostics. Content-mapped inputs receive them in original coordinates. Plain generated
//! inputs use their language's mapping policy.

use std::path::PathBuf;
use std::process::Command;
use std::sync::Arc;

use rsvelte_kernel::computation::database::{ArtifactRegistry, DocumentContext, Facet};
use rsvelte_kernel::computation::registry::Contribution;
use rsvelte_kernel::computation::task::{FinishTask, Part, TaskOutput};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::emitter::{Atom, Emitter, Mapping};
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::{LineBreaks, Span};

/// What a type checker must accept: rsvelte opens a generated `tsconfig.json` (with
/// `contentMappers`) through the checker's API.
pub(crate) const CONTRACT: &str = "a type checker with the API of TypeScript 7.1 or later: \
     `--api --cwd <dir> --runExternalCode` and `contentMappers` in tsconfig.json";

/// A type checker: `tsc` of TypeScript 7.1, or any product with the same API (`CONTRACT`).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct TypeChecker {
    /// An absolute path, or a name looked up in `PATH`.
    pub program: PathBuf,
    /// Passed before the arguments rsvelte adds, such as a script for `node`. The API mode takes
    /// no compiler options.
    pub arguments: Vec<String>,
}

impl TypeChecker {
    /// What `--version` prints, such as `Version 7.1.0`, so a result can name the checker that
    /// made it. Fails, saying what to change, when the checker cannot run or is a `tsc` older than
    /// 7.1.
    ///
    /// # Errors
    /// The checker is missing, cannot run, fails, or is too old.
    pub(crate) fn identify(&self) -> Result<String, String> {
        let output = match Command::new(&self.program)
            .args(&self.arguments)
            .arg("--version")
            .output()
        {
            Ok(output) => output,
            Err(e) => return Err(self.cannot_start(&e)),
        };
        let stdout = String::from_utf8_lossy(&output.stdout);
        let version = stdout.lines().map(str::trim).find(|l| !l.is_empty());
        let (true, Some(version)) = (output.status.success(), version) else {
            return Err(format!(
                "type checker `{self} --version` failed ({}): {}{stdout}",
                output.status,
                String::from_utf8_lossy(&output.stderr)
            ));
        };
        if let Some(old) = typescript_before_7_1(version) {
            return Err(format!(
                "type checker `{self}` is TypeScript {old}; rsvelte needs {CONTRACT}, such as \
                 TypeScript 7.1 or tsrs"
            ));
        }
        Ok(version.to_owned())
    }

    fn cannot_start(&self, e: &std::io::Error) -> String {
        let bare = self.program.components().count() == 1;
        match e.kind() {
            std::io::ErrorKind::NotFound if bare => format!(
                "type checker `{}` is not in node_modules/.bin or on PATH: install it in the \
                 project, or give its path in `command` of the `typescript.check` options",
                self.program.display()
            ),
            std::io::ErrorKind::NotFound => {
                format!("type checker `{}` does not exist", self.program.display())
            }
            std::io::ErrorKind::PermissionDenied => {
                format!(
                    "type checker `{}` is not executable",
                    self.program.display()
                )
            }
            _ => format!("type checker `{self}`: {e}"),
        }
    }
}

/// `major.minor` of a `tsc` that prints `Version <major>.<minor>...` and is older than 7.1.
fn typescript_before_7_1(version: &str) -> Option<&str> {
    let number = version.strip_prefix("Version ")?;
    version_before_7_1(number).then_some(number)
}

/// A TypeScript version number, such as `7.0.0-dev.20260707.2`, older than 7.1.
pub(crate) fn version_before_7_1(number: &str) -> bool {
    let mut parts = number.split(['.', '-']).map(str::parse::<u32>);
    match (parts.next(), parts.next()) {
        (Some(Ok(major)), Some(Ok(minor))) => (major, minor) < (7, 1),
        _ => false,
    }
}

impl std::fmt::Display for TypeChecker {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.program.display())?;
        for a in &self.arguments {
            write!(f, " {a}")?;
        }
        Ok(())
    }
}

#[derive(Clone, Debug)]
pub struct Tsc {
    pub checker: TypeChecker,
    /// The project's tsconfig.json; the check extends it.
    pub tsconfig: Option<PathBuf>,
    /// How many checker processes share the documents. The checker's API checks with one
    /// thread, so by default a larger batch takes more processes.
    pub processes: Option<std::num::NonZeroUsize>,
}

/// A document as the type checker sees it: the [`Facet`] each language provides, so one [`Check`]
/// serves every language, and documents of several languages share one `tsc`.
#[derive(Debug)]
pub struct TypeScriptView;

impl Facet for TypeScriptView {
    /// `Err`: the document cannot be checked (it did not parse, or the projection does not handle
    /// one of its constructs yet), reported as is.
    type Output = Result<TypeScriptDocument, Diagnostic>;

    const NAME: &'static str = "ts.view";
}

#[derive(Debug)]
pub enum TypeScriptDocument {
    /// Not type-checked: a JavaScript document, for which upstream reports no semantic
    /// diagnostics (`checkJavaScript` is offset). Its findings are empty.
    Unchecked,
    /// A document the language's own parser rejects: svelte-check reports only that error, with
    /// the code `-1`, instead of type checking.
    Rejected {
        message: String,
        span: Span,
    },
    Checked(Arc<CheckedDocument>),
}

/// A document the checker reads, shared by its facet and the run that checks it.
#[derive(Debug)]
pub struct CheckedDocument {
    /// The generated TypeScript and its mappings.
    pub projection: Arc<Emitter>,
    pub map_back: MapBack,
    pub env: Arc<TypeScriptEnv>,
    /// The extension the checker reads a content-mapped projection as, such as `.ts`.
    pub extension: &'static str,
    /// Each relative module the document imports.
    pub imports: Vec<Import>,
    /// Each Svelte store by its name's range, with where the component reads `$store`:
    /// svelte-check reports a store that is no store at each of those reads.
    pub store_reads: Vec<(Span, Vec<Span>)>,
    /// The findings svelte-check hides.
    pub hidden: Vec<Hidden>,
    /// Whether a finding with no source range is dropped, as svelte-check drops it, instead of
    /// refusing the document: only where the projection writes svelte2tsx's own code.
    pub drops_unmapped: bool,
    /// Set when each of the projection's atoms is an inserted annotation (see [`Annotations`]),
    /// which maps to the character it goes before.
    pub inserted_finding: Option<InsertedFinding>,
}

/// A relative module specifier a document imports, by its string literal's range, with the
/// names the import binds.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Import {
    pub at: Span,
    pub specifier: String,
    pub names: Vec<String>,
}

/// Findings svelte-check hides: of `codes`, or of any code when it is empty, that start in `at`
/// and, when `whole`, end in it too; both ends count.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Hidden {
    pub codes: &'static [u32],
    pub at: Span,
    pub whole: bool,
}

impl Hidden {
    fn hides(&self, code: u32, span: Span) -> bool {
        let inside = |at: u32| (self.at.start_offset..=self.at.end_offset).contains(&at);
        (self.codes.is_empty() || self.codes.contains(&code))
            && inside(span.start_offset)
            && (!self.whole || inside(span.end_offset))
    }
}

/// What a language adds to the checked project besides its documents.
#[derive(Debug, Default, PartialEq, Eq)]
pub struct TypeScriptEnv {
    pub mapped_extension: Option<&'static str>,
    pub content_mapper: Option<PathBuf>,
    /// Declaration files written beside the generated ones, by name.
    pub declarations: Vec<(&'static str, &'static str)>,
    /// Existing declaration files to include.
    pub include: Vec<PathBuf>,
    /// `compilerOptions.paths` entries: module specifier → file.
    pub paths: Vec<(String, PathBuf)>,
    /// Existing files the checker reads with this text instead, as the language's own checker
    /// reads them.
    pub replaced: Vec<(PathBuf, String)>,
    /// Suffixes, such as `.svelte`, that an import of `x<suffix>` also reaches as the script
    /// `x<suffix>.ts` when no such document exists, as the language's own checker resolves it.
    pub script_modules: Vec<&'static str>,
    /// A line the language's own checker appends to TypeScript's message of each code.
    pub notes: Vec<(u32, &'static str)>,
}

impl TypeScriptEnv {
    /// Adds `other`'s entries.
    ///
    /// # Errors
    ///
    /// A message naming a declaration file or module specifier the two environments define
    /// differently.
    pub(crate) fn merge(&mut self, other: &Self) -> Result<(), String> {
        if let Some(mapper) = &other.content_mapper {
            match &self.content_mapper {
                None => self.content_mapper = Some(mapper.clone()),
                Some(existing) if existing == mapper => {}
                Some(_) => {
                    return Err("languages require different content mapper executables".into());
                }
            }
        }
        merge_keyed(&mut self.declarations, &other.declarations, |name| {
            format!("two languages declare `{name}` differently")
        })?;
        merge_keyed(&mut self.paths, &other.paths, |specifier| {
            format!("two languages map `{specifier}` differently")
        })?;
        merge_keyed(&mut self.replaced, &other.replaced, |path| {
            format!("two languages replace {}", path.display())
        })?;
        merge_keyed(&mut self.notes, &other.notes, |code| {
            format!("two languages note TS{code} differently")
        })?;
        merge_set(&mut self.include, &other.include);
        merge_set(&mut self.script_modules, &other.script_modules);
        Ok(())
    }
}

/// Adds each entry of `other` whose key `own` lacks. An entry under a key `own` holds must equal
/// it, or the merge fails with `differs` of the key.
fn merge_keyed<K: PartialEq + Clone, V: PartialEq + Clone>(
    own: &mut Vec<(K, V)>,
    other: &[(K, V)],
    differs: impl Fn(&K) -> String,
) -> Result<(), String> {
    for (key, value) in other {
        match own.iter().find(|(held, _)| held == key) {
            None => own.push((key.clone(), value.clone())),
            Some((_, held)) if held == value => {}
            Some(_) => return Err(differs(key)),
        }
    }
    Ok(())
}

/// Adds each item of `other` that `own` lacks.
fn merge_set<T: PartialEq + Clone>(own: &mut Vec<T>, other: &[T]) {
    for item in other {
        if !own.contains(item) {
            own.push(item.clone());
        }
    }
}

/// How a host maps a generated range back to its document.
///
/// Plain generated inputs use this policy. Content-mapped inputs use native TypeScript's mapping.
/// `None` drops a generated finding with no original counterpart.
pub type MapBack = fn(&Emitter, Span) -> Option<Span>;

/// Type checking over matching documents whose plugins provide [`TypeScriptView`].
///
/// Each document is projected on its worker, then one `tsc` checks them all. Writes each document's
/// findings as svelte-check and vue-tsc report them (`json`, see `render_findings`).
#[derive(Debug)]
pub struct Check {
    pub identifier: &'static str,
    pub documents: Documents,
    /// `None`: a document that needs checking reports that the task is not configured.
    pub tsc: Option<Tsc>,
    /// What an import of a matching document that is not checked reads, as the upstream
    /// checker still resolves it. `None`: such a document is absent from the run.
    pub stand_in: Option<&'static str>,
    /// Documents the run passes to the checker as they are, unchecked, so imports of them
    /// resolve as on the disk.
    pub imported: Option<fn(&Document) -> bool>,
}

/// The languages whose documents the checker reads through a content mapper, so a project check
/// can ask the checker for their files. The language's own plugin adds itself.
#[derive(Debug)]
pub struct MappedLanguages;

impl Contribution for MappedLanguages {
    type Item = MappedLanguage;
}

#[derive(Debug, Clone)]
pub struct MappedLanguage {
    /// Such as `.svelte`.
    pub extension: &'static str,
    /// The executable that serves the language's projections.
    pub content_mapper: PathBuf,
}

/// A document the run does not check but other documents may import.
struct StandIn {
    path: String,
    text: String,
}

/// What an import of a document reads when the document is not checked, such as its
/// module-level exports. `None`, or no provider: the [`Check`]'s `stand_in`.
#[derive(Debug)]
pub struct TypeScriptStandIn;

impl Facet for TypeScriptStandIn {
    type Output = Option<String>;

    const NAME: &'static str = "ts.stand_in";
}

/// Type annotations a framework's own checker inserts into a TypeScript module before it checks
/// it, such as svelte-check's types of a `SvelteKit` route's `load`. No provider: the module as
/// it is.
#[derive(Debug)]
pub struct TypeScriptAnnotations;

impl Facet for TypeScriptAnnotations {
    type Output = Annotations;

    const NAME: &'static str = "ts.annotations";
}

#[derive(Debug)]
pub struct Annotations {
    /// Each text and the source offset it goes before, in source order; texts at one offset in
    /// the order given.
    pub inserted: Vec<(u32, String)>,
    pub inserted_finding: InsertedFinding,
}

/// What a finding that starts in inserted text reports, by its code and message: a message at
/// the character the text goes before, or `None` to drop the finding.
pub type InsertedFinding = fn(u32, String) -> Option<String>;

/// Which documents a [`Check`] checks.
#[derive(Debug, Clone, Copy)]
pub enum Documents {
    /// The documents of one language.
    Matching(fn(&Document) -> bool),
    /// Every document some plugin provides a [`TypeScriptView`] for, in one project.
    WithTypeScriptView,
}

struct Prepared {
    path: String,
    source_text: String,
    document: Arc<CheckedDocument>,
}

impl FinishTask for Check {
    fn identifier(&self) -> &'static str {
        self.identifier
    }

    fn applies(&self, document: &Document, artifacts: &ArtifactRegistry) -> bool {
        let checked = match self.documents {
            Documents::Matching(matches) => matches(document),
            Documents::WithTypeScriptView => artifacts.provides::<TypeScriptView>(document),
        };
        checked || self.imported.is_some_and(|imported| imported(document))
    }

    fn prepare(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) -> Option<Part> {
        if self.tsc.is_some()
            && self
                .imported
                .is_some_and(|imported| imported(context.document))
        {
            return Some(Box::new(StandIn {
                path: context.document.path.clone(),
                text: context.source_text().to_owned(),
            }));
        }
        match context.facet::<TypeScriptView>()? {
            Err(d) => {
                out.diagnostics.push(d.clone());
                self.stand_in(context)
            }
            Ok(TypeScriptDocument::Unchecked) => {
                out.file(
                    "json",
                    render_findings(context.lines(LineBreaks::Newline), &[]),
                );
                self.stand_in(context)
            }
            Ok(TypeScriptDocument::Rejected { message, span }) => {
                out.file(
                    "json",
                    render_findings(
                        context.lines(LineBreaks::Newline),
                        &[(*span, -1, message.clone())],
                    ),
                );
                out.findings
                    .push(findings::finding(*span, -1, message.clone()));
                self.stand_in(context)
            }
            Ok(TypeScriptDocument::Checked(_)) if self.tsc.is_none() => {
                out.diagnostics.push(Diagnostic::error(
                    "check_unconfigured",
                    format!("{} needs a tsc executable", self.identifier),
                    Span::new(0, 0),
                ));
                None
            }
            Ok(TypeScriptDocument::Checked(document)) => Some(Box::new(Prepared {
                path: context.document.path.clone(),
                source_text: context.source_text().to_owned(),
                document: Arc::clone(document),
            })),
        }
    }

    fn finish(&self, parts: Vec<Part>, outs: Vec<&mut TaskOutput>) {
        let tsc = self
            .tsc
            .as_ref()
            .expect("prepare returns parts only when configured");
        let mut docs: Vec<Prepared> = Vec::new();
        let mut checked_outs = Vec::new();
        let mut stand_ins = Vec::new();
        for (part, out) in parts.into_iter().zip(outs) {
            match part.downcast::<Prepared>() {
                Ok(d) => {
                    docs.push(*d);
                    checked_outs.push(out);
                }
                Err(part) => {
                    let s = part.downcast::<StandIn>().expect("parts are this task's");
                    stand_ins.push((s.path, s.text));
                }
            }
        }
        let outs = checked_outs;
        if docs.is_empty() {
            return;
        }
        let mut env = TypeScriptEnv::default();
        let mut merged: Vec<&Arc<TypeScriptEnv>> = Vec::new();
        for d in &docs {
            let own = &d.document.env;
            if merged.iter().any(|e| Arc::ptr_eq(e, own)) {
                continue;
            }
            merged.push(own);
            if let Err(msg) = env.merge(own) {
                fail(outs, &msg);
                return;
            }
        }
        check_projected(tsc, &env, &docs, stand_ins, outs);
    }
}

impl Check {
    fn stand_in(&self, context: &DocumentContext<'_>) -> Option<Part> {
        self.tsc.as_ref()?;
        // A language's own stand-in serves every check, so the project-wide check resolves an
        // unchecked component as the language's own check does.
        let text = context
            .facet::<TypeScriptStandIn>()
            .and_then(Clone::clone)
            .or_else(|| self.stand_in.map(str::to_owned))?;
        Some(Box::new(StandIn {
            path: context.document.path.clone(),
            text,
        }))
    }
}

fn fail(outs: Vec<&mut TaskOutput>, msg: &str) {
    for out in outs {
        out.diagnostics
            .push(Diagnostic::error("check_failed", msg, Span::new(0, 0)));
    }
}

/// Runs one `tsc` over every document's projection and writes each document's findings; a run
/// that fails is reported on every document.
fn check_projected(
    tsc: &Tsc,
    env: &TypeScriptEnv,
    docs: &[Prepared],
    stand_ins: Vec<(String, String)>,
    outs: Vec<&mut TaskOutput>,
) {
    let req = CheckRequest {
        stand_ins,
        documents: docs.iter().map(|d| d.path.clone()).collect(),
        mapped_files: docs
            .iter()
            .map(|d| {
                let bom = byte_order_mark(&d.source_text);
                let document = &d.document;
                document
                    .env
                    .mapped_extension
                    .map(|extension| ContentMappedInput {
                        source: d.source_text[bom as usize..].to_owned(),
                        extension,
                        generated_extension: document.extension,
                        mappings: document
                            .projection
                            .mappings
                            .iter()
                            .filter(|m| m.source_text >= bom)
                            .map(|m| Mapping {
                                source_text: m.source_text - bom,
                                ..*m
                            })
                            .collect(),
                        atoms: document
                            .projection
                            .atoms
                            .iter()
                            .filter(|a| a.original.start_offset >= bom)
                            .map(|a| Atom {
                                original: Span::new(
                                    a.original.start_offset - bom,
                                    a.original.end_offset - bom,
                                ),
                                ..*a
                            })
                            .collect(),
                        imports: document
                            .imports
                            .iter()
                            .filter(|import| import.at.start_offset >= bom)
                            .map(|import| Import {
                                at: Span::new(
                                    import.at.start_offset - bom,
                                    import.at.end_offset - bom,
                                ),
                                ..import.clone()
                            })
                            .collect(),
                    })
            })
            .collect(),
        env,
        files: docs
            .iter()
            .map(|d| d.document.projection.out.as_str())
            .collect(),
    };
    let found = match tsc.check(&req) {
        Ok(found) => found,
        Err(msg) => {
            fail(outs, &msg);
            return;
        }
    };
    write_findings(docs, outs, found);
}

mod findings;
pub(crate) use findings::render_findings;
use findings::{byte_order_mark, write_findings};

mod run;
pub(crate) use run::{CheckRequest, ContentMappedInput, TypeScriptDiagnostic};

#[cfg(test)]
mod tests;
