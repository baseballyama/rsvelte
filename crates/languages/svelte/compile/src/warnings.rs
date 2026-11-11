//! The compiler's warnings, as `compile` returns them: runes mode, `svelte-ignore` applied.

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::{LineColumn, LineIndex};
use rsvelte_svelte_semantic::warnings::{self, Options};
use rsvelte_svelte_semantic::{Analyzed, Lowered, Resolved};
use rsvelte_svelte_syntax::Parsed;

/// `warnings.json`: what `compile(source, { runes: true })` returns as `warnings`.
#[derive(Debug)]
pub struct Warn;

/// The options this crate compiles with.
pub(crate) const OPTIONS: Options = Options {
    runes: Some(true),
    custom_element: false,
};

/// What `compile` reports besides its output: the warnings it shows, or the error that stops it.
#[derive(Debug)]
pub(crate) struct Warned;

impl Artifact for Warned {
    type Output = Result<Vec<Diagnostic>, Diagnostic>;

    const NAME: &'static str = "svelte.compile.warnings";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let component = context.get::<Parsed>().as_ref().map_err(Clone::clone)?;
        let Some(resolution) = context.get::<Resolved>().as_ref() else {
            return Ok(Vec::new());
        };
        // The compile fails at parse time, before any warning.
        if let Some(error) = resolution.syntax_error() {
            return Err(error.clone());
        }
        let Some(compiler_syntax_tree) = context.get::<Lowered>().as_ref() else {
            return Ok(Vec::new());
        };
        let analysis = if component.style.is_some() {
            context.get::<Analyzed>().as_ref()
        } else {
            None
        };
        let found = warnings::warnings(
            component,
            compiler_syntax_tree,
            resolution,
            analysis,
            context.source_text(),
            &context.document.path,
            OPTIONS,
        );
        found
            .first_error(component, false)
            .map_or_else(|| Ok(found.compiled().cloned().collect()), Err)
    }
}

impl Task for Warn {
    fn identifier(&self) -> &'static str {
        "svelte.compile.warnings"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte_syntax::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        match context.get::<Warned>() {
            Ok(shown) if shown.is_empty() => {}
            Ok(shown) => out.file("warnings.json", json(shown, context.source_text())),
            Err(error) => out.diagnostics.push(error.clone()),
        }
    }
}

/// `[{ code, message, start, end }]` with `{ line, column, character }` positions, as the
/// compiler's `Warning`s serialize.
fn json(found: &[Diagnostic], source: &str) -> String {
    let index = LineIndex::new(source);
    let mut w = StructuredDataWriter::new(true);
    w.begin_array();
    for d in found {
        w.begin_object()
            .key("code")
            .write_string(&d.code)
            .key("message")
            .write_string(&d.message)
            .key("start");
        position(&mut w, &index.line_column(d.span.start_offset));
        w.key("end");
        position(&mut w, &index.line_column(d.span.end_offset));
        w.end_object();
    }
    w.end_array();
    w.finish()
}

fn position(w: &mut StructuredDataWriter, at: &LineColumn) {
    w.begin_object()
        .key("line")
        .write_number(at.line)
        .key("column")
        .write_number(at.column)
        .key("character")
        .write_number(at.character)
        .end_object();
}
