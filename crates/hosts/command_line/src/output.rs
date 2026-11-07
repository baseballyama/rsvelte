//! Task files, diagnostics, and measurements.

use std::path::Path;

use rsvelte_kernel::computation::pipeline::{Document, DocumentResult};
use rsvelte_kernel::output::task_files;

pub(crate) fn write_outputs(
    document: &Document,
    actual: &Path,
    result: &DocumentResult,
    failed: &mut usize,
) -> usize {
    let mut written = 0;
    for (task, out) in &result.outputs {
        let (dir, variant) = task_files::location(task);
        let dir = actual.join(dir);
        std::fs::create_dir_all(&dir).expect("create actual/");
        for (name, text) in task_files::files(variant, &document.text, out) {
            std::fs::write(dir.join(name), text.as_bytes()).expect("write");
        }
        written += out.files.len();
        if !out.diagnostics.is_empty() {
            *failed += 1;
        }
    }
    written
}

#[cfg(feature = "metrics")]
pub(crate) fn report_metrics() {
    for p in rsvelte_kernel::performance::measurement::snapshot() {
        eprintln!("{p:?}");
    }
}

#[cfg(not(feature = "metrics"))]
pub(crate) const fn report_metrics() {}
