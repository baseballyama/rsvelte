//! Task files, diagnostics, and measurements.

use std::path::Path;

use rsvelte_corpus::task_files;
use rsvelte_kernel::computation::pipeline::DocumentResult;
use rsvelte_kernel::source::document::Document;

/// Writes each task's files below `actual`; returns how many were written.
///
/// # Errors
///
/// The path that could not be created or written, and why.
pub(crate) fn write_outputs(
    document: &Document,
    actual: &Path,
    result: &DocumentResult,
    failed: &mut usize,
) -> Result<usize, String> {
    let mut written = 0;
    for (task, out) in &result.outputs {
        let (dir, variant) = task_files::location(task);
        let dir = actual.join(dir);
        std::fs::create_dir_all(&dir).map_err(|e| format!("{}: {e}", dir.display()))?;
        for (name, text) in task_files::files(variant, &document.text, out) {
            let path = dir.join(name);
            std::fs::write(&path, text.as_bytes())
                .map_err(|e| format!("{}: {e}", path.display()))?;
        }
        written += out.files.len();
        if !out.diagnostics.is_empty() {
            *failed += 1;
        }
    }
    Ok(written)
}

#[cfg(feature = "metrics")]
pub(crate) fn report_metrics() {
    for p in rsvelte_kernel::performance::measurement::snapshot() {
        eprintln!("{p:?}");
    }
}

#[cfg(not(feature = "metrics"))]
pub(crate) const fn report_metrics() {}
