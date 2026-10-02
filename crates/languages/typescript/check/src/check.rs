//! Type checking with TypeScript's own checker.
//!
//! The native `tsc` (TypeScript 7) runs once over a
//! whole set of generated files, and its diagnostics come back in generated coordinates for the
//! host language to map to its documents.
//!
//! `tsc` has no machine-readable output, so the pretty report is parsed: its header gives the
//! start, its underline gives the end. The parser accepts only the shapes it knows and checks the
//! count against tsc's own summary, so an unrecognised report is an error, never a dropped finding.

use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::Arc;
use std::sync::atomic::{AtomicU32, Ordering};

use rsvelte_kernel::computation::database::{DocumentContext, Facet};
use rsvelte_kernel::computation::pipeline::{Document, FinishTask, Part, TaskOutput};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::performance::measurement;
use rsvelte_kernel::source::positions::{LineIndex, Span};

#[derive(Debug)]
pub struct Tsc {
    /// The native `tsc` executable.
    pub binary: PathBuf,
    /// The project's tsconfig.json; the check extends it.
    pub tsconfig: Option<PathBuf>,
}

#[derive(Default, Debug)]
pub struct CheckRequest {
    /// Generated TypeScript, one per document.
    pub files: Vec<String>,
    /// Declaration files written beside the generated ones, by name.
    pub declarations: Vec<(&'static str, &'static str)>,
    /// Existing declaration files to include.
    pub include: Vec<PathBuf>,
    /// `compilerOptions.paths` entries: module specifier → file.
    pub paths: Vec<(&'static str, PathBuf)>,
}

#[derive(Debug, PartialEq, Eq)]
pub struct TypeScriptDiagnostic {
    /// Index into [`CheckRequest::files`].
    pub file: usize,
    pub code: u32,
    /// The message chain, one line per link, indented two spaces per level (as svelte-check and
    /// `ts.flattenDiagnosticMessageText(…, "\n")` render it).
    pub message: String,
    /// Byte range in the generated file.
    pub span: Span,
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
    Checked {
        /// The generated TypeScript and its mappings.
        projection: Emitter,
        map_back: MapBack,
        env: Arc<TypeScriptEnv>,
    },
}

/// What a language adds to the checked project besides its documents.
#[derive(Debug, Default, PartialEq, Eq)]
pub struct TypeScriptEnv {
    /// Declaration files written beside the generated ones, by name.
    pub declarations: Vec<(&'static str, &'static str)>,
    /// Existing declaration files to include.
    pub include: Vec<PathBuf>,
    /// `compilerOptions.paths` entries: module specifier → file.
    pub paths: Vec<(&'static str, PathBuf)>,
}

impl TypeScriptEnv {
    /// Adds `other`'s entries.
    ///
    /// # Errors
    ///
    /// A message naming a declaration file or module specifier the two environments define
    /// differently.
    pub fn merge(&mut self, other: &Self) -> Result<(), String> {
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
/// [`Emitter::lookup_span`] for svelte2tsx's source map, [`Emitter::lookup_overlap`] for Volar.
/// `None` drops the finding, as both upstreams drop what lands in generated code.
pub type MapBack = fn(&Emitter, Span) -> Option<Span>;

/// Type checking over matching documents whose plugins provide [`TypeScriptView`].
///
/// Each document is projected on its worker, then one `tsc` checks them all. Writes each document's
/// findings as svelte-check and vue-tsc report them (`json`, see [`render_findings`]).
#[derive(Debug)]
pub struct Check {
    pub identifier: &'static str,
    pub matches: fn(&Document) -> bool,
    /// `None`: a document that needs checking reports that the task is not configured.
    pub tsc: Option<Tsc>,
}

struct Prepared {
    projection: Emitter,
    map_back: MapBack,
    env: Arc<TypeScriptEnv>,
    source_text: String,
}

impl FinishTask for Check {
    fn identifier(&self) -> &'static str {
        self.identifier
    }

    fn applies(&self, document: &Document) -> bool {
        (self.matches)(document)
    }

    fn prepare(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) -> Option<Part> {
        match context.facet::<TypeScriptView>()? {
            Err(d) => {
                out.diagnostics.push(d.clone());
                None
            }
            Ok(TypeScriptDocument::Unchecked) => {
                out.file("json", render_findings(context.line_index(), &mut []));
                None
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
            }) => Some(Box::new(Prepared {
                projection: Emitter {
                    out: projection.out.clone(),
                    mappings: projection.mappings.clone(),
                },
                map_back: *map_back,
                env: Arc::clone(env),
                source_text: context.source_text().to_owned(),
            })),
        }
    }

    fn finish(&self, parts: Vec<Part>, outs: Vec<&mut TaskOutput>) {
        let tsc = self
            .tsc
            .as_ref()
            .expect("prepare returns parts only when configured");
        let docs: Vec<Prepared> = parts
            .into_iter()
            .map(|p| *p.downcast::<Prepared>().expect("parts are this task's"))
            .collect();
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
        check_projected(tsc, &env, docs, outs);
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
    outs: Vec<&mut TaskOutput>,
) {
    let req = CheckRequest {
        files: docs
            .iter_mut()
            .map(|d| std::mem::take(&mut d.projection.out))
            .collect(),
        declarations: env.declarations.clone(),
        include: env.include.clone(),
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
    let mut per_doc: Vec<Vec<(Span, u32, String)>> = vec![Vec::new(); docs.len()];
    for f in found {
        let d = &docs[f.file];
        if let Some(span) = (d.map_back)(&d.projection, f.span) {
            per_doc[f.file].push((span, f.code, f.message));
        }
    }
    for ((d, out), mut found) in docs.iter().zip(outs).zip(per_doc) {
        out.file(
            "json",
            render_findings(&LineIndex::new(&d.source_text), &mut found),
        );
    }
}

/// Findings as svelte-check and vue-tsc report them: `code`, the flattened `message`, and 0-based
/// lines with UTF-16 characters, in document order.
pub fn render_findings(lines: &LineIndex, found: &mut [(Span, u32, String)]) -> String {
    found.sort_by_key(|(span, ..)| span.start_offset);
    let mut w = StructuredDataWriter::new(true);
    w.begin_array();
    for (span, code, message) in found.iter() {
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

static RUN: AtomicU32 = AtomicU32::new(0);

impl Tsc {
    /// # Errors
    ///
    /// A message if the temporary project cannot be written, `tsc` cannot be run, or its report
    /// cannot be parsed.
    pub fn check(&self, req: &CheckRequest) -> Result<Vec<TypeScriptDiagnostic>, String> {
        let dir = std::env::temp_dir().join(format!(
            "rsvelte-tsc-{}-{}",
            std::process::id(),
            RUN.fetch_add(1, Ordering::Relaxed)
        ));
        std::fs::create_dir_all(&dir).map_err(|e| format!("{}: {e}", dir.display()))?;
        let result = self.check_in(&dir, req);
        // Best effort: a leftover temporary directory does not affect the result.
        drop(std::fs::remove_dir_all(&dir));
        result
    }

    fn check_in(
        &self,
        dir: &Path,
        req: &CheckRequest,
    ) -> Result<Vec<TypeScriptDiagnostic>, String> {
        let write = |name: &str, text: &str| {
            std::fs::write(dir.join(name), text).map_err(|e| format!("{name}: {e}"))
        };
        for (i, text) in req.files.iter().enumerate() {
            write(&file_name(i), text)?;
        }
        for (name, text) in &req.declarations {
            write(name, text)?;
        }
        write("tsconfig.json", &self.tsconfig_json(req))?;
        let output = {
            let _p = measurement::phase("ts.tsc");
            Command::new(&self.binary)
                .args(["-p", ".", "--pretty", "true"])
                .current_dir(dir)
                .output()
                .map_err(|e| format!("{}: {e}", self.binary.display()))?
        };
        let stdout = String::from_utf8(output.stdout).map_err(|e| e.to_string())?;
        if !matches!(output.status.code(), Some(0..=2)) || !output.stderr.is_empty() {
            return Err(format!(
                "tsc exited with {}: {}{stdout}",
                output.status,
                String::from_utf8_lossy(&output.stderr)
            ));
        }
        let _p = measurement::phase("ts.report");
        let lines: Vec<LineIndex> = req.files.iter().map(|f| LineIndex::new(f)).collect();
        parse_report(&strip_ansi(&stdout), |file, line, column| {
            lines.get(file).and_then(|l| l.offset(line, column))
        })
    }

    fn tsconfig_json(&self, req: &CheckRequest) -> String {
        let mut w = StructuredDataWriter::new(true);
        w.begin_object();
        if let Some(base) = &self.tsconfig {
            w.key("extends").write_string(&base.to_string_lossy());
        }
        w.key("compilerOptions")
            .begin_object()
            .key("noEmit")
            .write_boolean(true)
            .key("skipLibCheck")
            .write_boolean(true);
        // Every generated file is a module, whatever its imports: documents share no globals.
        w.key("moduleDetection").write_string("force");
        w.key("paths").begin_object();
        for (spec, file) in &req.paths {
            w.key(spec)
                .begin_array()
                .write_string(&file.to_string_lossy())
                .end_array();
        }
        w.end_object().end_object().key("files").begin_array();
        for i in 0..req.files.len() {
            w.write_string(&file_name(i));
        }
        for (name, _) in &req.declarations {
            w.write_string(name);
        }
        for p in &req.include {
            w.write_string(&p.to_string_lossy());
        }
        w.end_array().end_object();
        w.finish()
    }
}

mod report;
use report::{file_name, parse_report, strip_ansi};

#[cfg(test)]
mod tests;
