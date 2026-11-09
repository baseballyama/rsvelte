//! The compiler's warnings, as `compile` returns them: runes mode, `svelte-ignore` applied.

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::{LineColumn, LineIndex};
use rsvelte_svelte::warnings::{self, Options};
use rsvelte_svelte::{Analyzed, Parsed, Resolved};

/// `warnings.json`: what `compile(source, { runes: true })` returns as `warnings`.
#[derive(Debug)]
pub struct Warn;

/// The options this crate compiles with.
const OPTIONS: Options = Options {
    runes: Some(true),
    custom_element: false,
};

impl Task for Warn {
    fn identifier(&self) -> &'static str {
        "svelte.compile.warnings"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let component = match context.get::<Parsed>() {
            Ok(component) => component,
            Err(error) => {
                out.diagnostics.push(error.clone());
                return;
            }
        };
        let Some(resolution) = context.get::<Resolved>().as_ref() else {
            return;
        };
        let source = context.source_text();
        let analysis = if component.style.is_some() {
            context.get::<Analyzed>().as_ref()
        } else {
            None
        };
        let found = warnings::warnings(
            component,
            resolution,
            analysis,
            source,
            &context.document.path,
            OPTIONS,
        );
        if let Some(error) = found.first_error(component, false) {
            out.diagnostics.push(error);
            return;
        }
        let shown: Vec<&Diagnostic> = found.compiled().collect();
        if !shown.is_empty() {
            out.file("warnings.json", json(&shown, source));
        }
    }
}

/// `[{ code, message, start, end }]` with `{ line, column, character }` positions, as the
/// compiler's `Warning`s serialize.
fn json(found: &[&Diagnostic], source: &str) -> String {
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
