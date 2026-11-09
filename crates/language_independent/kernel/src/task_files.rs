//! The files one task leaves for one document.
//!
//! `rsvelte corpus` and the test harness write them to a corpus unit's `actual/`:
//! `<task>/<variant>.<file>`, and `<task>/<variant>.diagnostics.json` when the task reported
//! diagnostics.

use std::borrow::Cow;

use crate::computation::task::TaskOutput;
use crate::output::structured_data::StructuredDataWriter;
use crate::source::positions::LineIndex;

/// The extension of the diagnostics file.
pub(crate) const DIAGNOSTICS: &str = "diagnostics.json";

/// The directory and the variant of a task identifier: `svelte.compile/client` is
/// (`svelte.compile`, `client`), and an identifier without a variant has `default`.
#[must_use]
pub fn location(task: &str) -> (&str, &str) {
    task.split_once('/').unwrap_or((task, "default"))
}

/// Each file of `out` as `(<variant>.<name>, text)`, relative to the task's directory, then the
/// diagnostics file when there are diagnostics. `source` is the document's text.
#[must_use]
pub fn files<'a>(variant: &str, source: &str, out: &'a TaskOutput) -> Vec<(String, Cow<'a, str>)> {
    let mut files: Vec<(String, Cow<'a, str>)> = out
        .files
        .iter()
        .map(|f| {
            (
                format!("{variant}.{}", f.name),
                Cow::Borrowed(f.text.as_str()),
            )
        })
        .collect();
    if !out.diagnostics.is_empty() {
        files.push((
            format!("{variant}.{DIAGNOSTICS}"),
            Cow::Owned(diagnostics_json(source, out)),
        ));
    }
    files
}

/// `[{ code, message, start: { line, column }, end: { line, column } }]`, with 1-based lines and
/// 0-based columns in UTF-16 code units, as JavaScript tools report them.
#[must_use]
pub fn diagnostics_json(source: &str, out: &TaskOutput) -> String {
    let index = LineIndex::new(source);
    let mut w = StructuredDataWriter::new(true);
    w.begin_array();
    for d in &out.diagnostics {
        let start = index.line_column(d.span.start_offset);
        let end = index.line_column(d.span.end_offset);
        w.begin_object()
            .key("code")
            .write_string(&d.code)
            .key("message")
            .write_string(&d.message)
            .key("start")
            .begin_object()
            .key("line")
            .write_number(start.line)
            .key("column")
            .write_number(start.column)
            .end_object()
            .key("end")
            .begin_object()
            .key("line")
            .write_number(end.line)
            .key("column")
            .write_number(end.column)
            .end_object()
            .end_object();
    }
    w.end_array();
    w.finish()
}
