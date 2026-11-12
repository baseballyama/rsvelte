//! Type checking with TypeScript's own checker.
//!
//! Native TypeScript 7.1 checks a batch through its API, which answers with structured
//! diagnostics. Content-mapped inputs receive them in original coordinates. Plain generated
//! inputs use their language's mapping policy.

use std::path::PathBuf;
use std::process::Command;
use std::sync::Arc;

use rsvelte_kernel::computation::database::{ArtifactRegistry, DocumentContext, Facet};
use rsvelte_kernel::computation::task::{FinishTask, Part, TaskOutput};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::emitter::{Atom, Emitter, Mapping};
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::{LineIndex, Span};

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
    let mut parts = number.split(['.', '-']);
    let major: u32 = parts.next()?.parse().ok()?;
    let minor: u32 = parts.next()?.parse().ok()?;
    ((major, minor) < (7, 1)).then_some(number)
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
    Rejected { message: String, span: Span },
    Checked {
        /// The generated TypeScript and its mappings.
        projection: Emitter,
        map_back: MapBack,
        env: Arc<TypeScriptEnv>,
        /// What the checker reports where the upstream projection places code differently from
        /// this one, by source range, code and message.
        placement: Vec<(Span, u32, &'static str)>,
    },
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
    pub paths: Vec<(&'static str, PathBuf)>,
    /// Existing files the checker reads with this text instead, as the language's own checker
    /// reads them.
    pub replaced: Vec<(PathBuf, String)>,
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
        for d in &other.declarations {
            match self.declarations.iter().find(|x| x.0 == d.0) {
                None => self.declarations.push(*d),
                Some(x) if x.1 == d.1 => {}
                Some(_) => return Err(format!("two languages declare `{}` differently", d.0)),
            }
        }
        for p in &other.paths {
            match self.paths.iter().find(|x| x.0 == p.0) {
                None => self.paths.push(p.clone()),
                Some(x) if x.1 == p.1 => {}
                Some(_) => return Err(format!("two languages map `{}` differently", p.0)),
            }
        }
        for r in &other.replaced {
            match self.replaced.iter().find(|x| x.0 == r.0) {
                None => self.replaced.push(r.clone()),
                Some(x) if x.1 == r.1 => {}
                Some(_) => return Err(format!("two languages replace {}", r.0.display())),
            }
        }
        for i in &other.include {
            if !self.include.contains(i) {
                self.include.push(i.clone());
            }
        }
        Ok(())
    }
}

/// How a host maps a generated range back to its document.
///
/// Plain generated inputs use this policy. Content-mapped inputs use native TypeScript's mapping.
/// `None` drops a generated finding with no original counterpart.
pub(crate) type MapBack = fn(&Emitter, Span) -> Option<Span>;

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
    projection: Emitter,
    map_back: MapBack,
    env: Arc<TypeScriptEnv>,
    source_text: String,
    placement: Vec<(Span, u32, &'static str)>,
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
                out.file("json", render_findings(context.line_index(), &[]));
                self.stand_in(context)
            }
            Ok(TypeScriptDocument::Rejected { message, span }) => {
                out.file(
                    "json",
                    render_findings(context.line_index(), &[(*span, -1, message.clone())]),
                );
                self.stand_in(context)
            }
            Ok(TypeScriptDocument::Checked { .. }) if self.tsc.is_none() => {
                out.diagnostics.push(Diagnostic::error(
                    "check_unconfigured",
                    format!("{} needs a tsc executable", self.identifier),
                    Span::new(0, 0),
                ));
                None
            }
            Ok(TypeScriptDocument::Checked {
                projection,
                map_back,
                env,
                placement,
            }) => Some(Box::new(Prepared {
                path: context.document.path.clone(),
                projection: Emitter {
                    out: projection.out.clone(),
                    mappings: projection.mappings.clone(),
                    atoms: projection.atoms.clone(),
                },
                map_back: *map_back,
                env: Arc::clone(env),
                source_text: context.source_text().to_owned(),
                placement: placement.clone(),
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
            if merged.iter().any(|e| Arc::ptr_eq(e, &d.env)) {
                continue;
            }
            merged.push(&d.env);
            if let Err(msg) = env.merge(&d.env) {
                fail(outs, &msg);
                return;
            }
        }
        check_projected(tsc, &env, docs, stand_ins, outs);
    }
}

impl Check {
    fn stand_in(&self, context: &DocumentContext<'_>) -> Option<Part> {
        let fallback = self.stand_in.filter(|_| self.tsc.is_some())?;
        let text = context
            .facet::<TypeScriptStandIn>()
            .and_then(Clone::clone)
            .unwrap_or_else(|| fallback.to_owned());
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
    mut docs: Vec<Prepared>,
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
                d.env.mapped_extension.map(|extension| ContentMappedInput {
                    source: d.source_text[bom as usize..].to_owned(),
                    extension,
                    mappings: d
                        .projection
                        .mappings
                        .iter()
                        .filter(|m| m.source_text >= bom)
                        .map(|m| Mapping {
                            source_text: m.source_text - bom,
                            ..*m
                        })
                        .collect(),
                    atoms: d
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
        content_mapper: env.content_mapper.clone(),
        files: docs
            .iter_mut()
            .map(|d| std::mem::take(&mut d.projection.out))
            .collect(),
        declarations: env.declarations.clone(),
        include: env.include.clone(),
        replaced: env.replaced.clone(),
        paths: env.paths.clone(),
    };
    let checked = tsc.check(&req);
    // Mapping back reads the generated text around a position.
    for (d, file) in docs.iter_mut().zip(req.files) {
        d.projection.out = file;
    }
    let found = match checked {
        Ok(found) => found,
        Err(msg) => {
            fail(outs, &msg);
            return;
        }
    };
    write_findings(&docs, outs, found);
}

/// A finding located in its document, with what orders it.
struct Finding {
    semantic: bool,
    generated: u32,
    span: Span,
    code: u32,
    message: String,
}

/// Writes each document's findings, ordered as svelte-check and vue-tsc list them: syntax errors
/// first, then by position in the generated text, where the upstream projection may have moved
/// code.
fn write_findings(docs: &[Prepared], outs: Vec<&mut TaskOutput>, found: Vec<TypeScriptDiagnostic>) {
    let mut per_doc: Vec<Vec<Finding>> = (0..docs.len()).map(|_| Vec::new()).collect();
    let mut unmapped: Vec<Vec<String>> = vec![Vec::new(); docs.len()];
    for f in found {
        let d = &docs[f.file];
        let Some(span) = f.span else {
            unmapped[f.file].push(format!("TS{}: {}", f.code, f.message));
            continue;
        };
        let bom = byte_order_mark(&d.source_text);
        let content_mapped = d.env.mapped_extension.is_some();
        let generated = if content_mapped {
            generated_offset(&d.projection, span.start_offset + bom)
        } else {
            span.start_offset
        };
        let mapped = if content_mapped {
            Some(span)
        } else {
            (d.map_back)(&d.projection, span).and_then(|span| {
                Some(Span::new(
                    span.start_offset.checked_sub(bom)?,
                    span.end_offset.checked_sub(bom)?,
                ))
            })
        };
        if let Some(span) = mapped {
            per_doc[f.file].push(Finding {
                // TypeScript 7 parses some grammar errors that TypeScript 6 checks, such as
                // TS2880; svelte-check lists those with the semantic findings.
                semantic: !f.syntactic || f.code >= 2000,
                generated,
                span,
                code: f.code,
                message: f.message,
            });
        }
    }
    for (d, keyed) in docs.iter().zip(&mut per_doc) {
        let bom = byte_order_mark(&d.source_text);
        keyed.extend(d.placement.iter().filter_map(|&(span, code, message)| {
            Some(Finding {
                semantic: true,
                generated: generated_offset(&d.projection, span.start_offset),
                span: Span::new(
                    span.start_offset.checked_sub(bom)?,
                    span.end_offset.checked_sub(bom)?,
                ),
                code,
                message: message.to_owned(),
            })
        }));
    }
    // svelte-check and vue-tsc count positions in the text TypeScript reads: without the mark.
    for (((d, out), mut keyed), unmapped) in docs.iter().zip(outs).zip(per_doc).zip(unmapped) {
        keyed.sort_by_key(|f| (f.semantic, f.generated, f.span.start_offset));
        let found: Vec<_> = keyed
            .into_iter()
            .map(|f| (f.span, i64::from(f.code), f.message))
            .collect();
        // A finding in synthesized code is a projection defect; the document's result is refused.
        for message in unmapped {
            out.diagnostics.push(Diagnostic::error(
                "check_unmapped",
                format!("the projection made a finding with no source range: {message}"),
                Span::new(0, 0),
            ));
        }
        let text = &d.source_text[byte_order_mark(&d.source_text) as usize..];
        out.file("json", render_findings(&LineIndex::new(text), &found));
    }
}

/// The length of a leading byte order mark. TypeScript removes it when it reads a file, so the
/// content mapper and the report count positions from after it.
fn byte_order_mark(source: &str) -> u32 {
    if source.starts_with('\u{feff}') {
        '\u{feff}'.len_utf8() as u32
    } else {
        0
    }
}

/// The first generated offset copied from the original `offset`, or the end of the copy before
/// it.
fn generated_offset(projection: &Emitter, offset: u32) -> u32 {
    let copies = projection
        .mappings
        .iter()
        .filter(|m| m.source_text <= offset && offset <= m.source_text + m.len)
        .map(|m| m.generated + (offset - m.source_text));
    let atoms = projection
        .atoms
        .iter()
        .filter(|a| a.original.start_offset <= offset && offset <= a.original.end_offset)
        .map(|a| a.generated.start_offset);
    copies.chain(atoms).min().unwrap_or_else(|| {
        projection
            .mappings
            .iter()
            .filter(|m| m.source_text + m.len <= offset)
            .max_by_key(|m| m.source_text + m.len)
            .map_or(0, |m| m.generated + m.len)
    })
}

/// Findings as svelte-check and vue-tsc report them: `code`, the flattened `message`, and 0-based
/// lines with UTF-16 characters, in the order given.
pub(crate) fn render_findings(lines: &LineIndex, found: &[(Span, i64, String)]) -> String {
    let mut w = StructuredDataWriter::new(true);
    w.begin_array();
    for (span, code, message) in found {
        w.begin_object()
            .key("code")
            .write_number(*code)
            .key("message")
            .write_string(message);
        for (key, at) in [("start", span.start_offset), ("end", span.end_offset)] {
            let lc = lines.line_column(at);
            w.key(key)
                .begin_object()
                .key("line")
                .write_number(lc.line - 1)
                .key("character")
                .write_number(lc.column)
                .end_object();
        }
        w.end_object();
    }
    w.end_array();
    w.finish()
}

mod run;
pub(crate) use run::{CheckRequest, ContentMappedInput, TypeScriptDiagnostic};

#[cfg(test)]
mod tests;
