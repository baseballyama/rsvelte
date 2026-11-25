//! Type checking with TypeScript's own checker.
//!
//! Native TypeScript 7.1 checks a batch through its API, which answers with structured
//! diagnostics. Content-mapped inputs receive them in original coordinates. Plain generated
//! inputs use their language's mapping policy.

use std::path::PathBuf;
use std::sync::Arc;

use rsvelte_kernel::computation::database::{ArtifactRegistry, DocumentContext, Facet};
use rsvelte_kernel::computation::registry::Contribution;
use rsvelte_kernel::computation::task::{FinishTask, Part, TaskOutput};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::emitter::{Atom, Emitter, Mapping};
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::Span;

use crate::type_checker::TypeChecker;

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
    /// Not type-checked: a document of another language that the projection reads as
    /// JavaScript it does not cover, so always JavaScript. Its findings are empty.
    Unchecked,
    /// A document the language's own parser rejects: svelte-check reports only that error, with
    /// the code `-1`, instead of type checking.
    Rejected {
        message: String,
        span: Span,
        /// Whether the upstream checker reads the document as JavaScript, by its script elements.
        javascript: bool,
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
    /// Each module the document imports.
    pub imports: Vec<Import>,
    /// Each Svelte store by its name's range, with where the component reads `$store`:
    /// svelte-check reports a store that is no store at each of those reads.
    pub store_reads: Vec<(Span, Vec<Span>)>,
    /// The findings svelte-check hides.
    pub hidden: Vec<Hidden>,
    /// Whether a finding with no source range is dropped, as svelte-check drops it, instead of
    /// refusing the document: only where the projection writes svelte2tsx's own code.
    pub drops_unmapped: bool,
    /// The types svelte2tsx's `upsertKitFile` inserts into a `SvelteKit` file: each one's range in
    /// the projection, then the source range svelte-check reports a finding in it at.
    pub inserted: Vec<(Span, Span)>,
}

/// A module specifier a document imports, by its string literal's range, with the names the
/// import binds.
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
struct StandInPart {
    path: String,
    stand_in: StandIn,
}

/// What an import of a document reads when the document is not checked.
#[derive(Clone, Debug)]
pub struct StandIn {
    /// Such as the document's module-level exports.
    pub text: String,
    /// Whether the document is JavaScript the checker reads as TypeScript: the upstream checker
    /// reads it as JavaScript, which TypeScript can read as untyped, and the checker here reads
    /// its stand-in as TypeScript.
    pub javascript: bool,
}

/// What an import of a document reads when the document is not checked. `None`, or no provider:
/// the [`Check`]'s `stand_in`.
#[derive(Debug)]
pub struct TypeScriptStandIn;

impl Facet for TypeScriptStandIn {
    type Output = Option<String>;

    const NAME: &'static str = "ts.stand_in";
}

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
            return Some(Box::new(StandInPart {
                path: context.document.file_path().to_string_lossy().into_owned(),
                // Not JavaScript the checker reads as TypeScript: it reads the file as it is.
                stand_in: StandIn {
                    text: context.source_text().to_owned(),
                    javascript: false,
                },
            }));
        }
        match context.facet::<TypeScriptView>()? {
            Err(d) => {
                out.diagnostics.push(d.clone());
                self.stand_in(context, false)
            }
            Ok(TypeScriptDocument::Unchecked) => {
                out.file(
                    "json",
                    render_findings::<&str>(
                        context.lines(reported_lines(context.document.file_path())),
                        &[],
                    ),
                );
                self.stand_in(context, true)
            }
            Ok(TypeScriptDocument::Rejected {
                message,
                span,
                javascript,
            }) => {
                out.file(
                    "json",
                    render_findings(
                        context.lines(reported_lines(context.document.file_path())),
                        &[(*span, -1, message.clone())],
                    ),
                );
                out.findings
                    .push(findings::finding(*span, -1, message.clone()));
                self.stand_in(context, *javascript)
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
                path: context.document.file_path().to_string_lossy().into_owned(),
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
                    let s = part
                        .downcast::<StandInPart>()
                        .expect("parts are this task's");
                    stand_ins.push((s.path, s.stand_in));
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
    /// The stand-in of a document the view does not check, `javascript` as the view says.
    fn stand_in(&self, context: &DocumentContext<'_>, javascript: bool) -> Option<Part> {
        self.tsc.as_ref()?;
        // A language's own stand-in serves every check, so the project-wide check resolves an
        // unchecked component as the language's own check does.
        let text = context
            .facet::<TypeScriptStandIn>()
            .and_then(Clone::clone)
            .or_else(|| self.stand_in.map(str::to_owned))?;
        Some(Box::new(StandInPart {
            path: context.document.file_path().to_string_lossy().into_owned(),
            stand_in: StandIn { text, javascript },
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
    stand_ins: Vec<(String, StandIn)>,
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
                    })
            })
            .collect(),
        env,
        imports: (docs.iter())
            .map(|d| run::checked_imports(&d.document, &d.source_text))
            .collect(),
        files: docs
            .iter()
            .map(|d| d.document.projection.out.as_str())
            .collect(),
    };
    let report = match tsc.check(&req) {
        Ok(report) => report,
        Err(msg) => {
            fail(outs, &msg);
            return;
        }
    };
    write_findings(docs, outs, report);
}

mod findings;
pub(crate) use findings::render_findings;
pub use findings::reported_lines;
use findings::{byte_order_mark, write_findings};

mod run;
pub(crate) use run::{CheckRequest, ContentMappedInput, Report};

#[cfg(test)]
mod tests;
