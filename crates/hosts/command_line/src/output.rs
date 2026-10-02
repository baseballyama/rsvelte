//! Task files, diagnostics, and measurements.

use std::path::Path;

use rsvelte_kernel::computation::pipeline::{Document, DocumentResult, TaskOutput};
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::positions::LineIndex;

pub(crate) fn write_outputs(
    document: &Document,
    actual: &Path,
    result: &DocumentResult,
    failed: &mut usize,
) -> usize {
    let mut written = 0;
    for (task, out) in &result.outputs {
        let (dir, variant) = task.split_once('/').unwrap_or((task, "default"));
        let dir = actual.join(dir);
        std::fs::create_dir_all(&dir).expect("create actual/");
        for f in &out.files {
            std::fs::write(dir.join(format!("{variant}.{}", f.name)), &f.text).expect("write");
            written += 1;
        }
        if !out.diagnostics.is_empty() {
            *failed += 1;
            std::fs::write(
                dir.join(format!("{variant}.diagnostics.json")),
                diagnostics_json(document, out),
            )
            .expect("write");
        }
    }
    written
}

pub(crate) fn diagnostics_json(document: &Document, out: &TaskOutput) -> String {
    let index = LineIndex::new(&document.text);
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

#[cfg(feature = "metrics")]
pub(crate) fn report_metrics() {
    for p in rsvelte_kernel::performance::measurement::snapshot() {
        eprintln!("{p:?}");
    }
}

#[cfg(not(feature = "metrics"))]
pub(crate) const fn report_metrics() {}
