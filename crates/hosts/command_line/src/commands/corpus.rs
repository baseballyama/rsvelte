use std::path::Path;
use std::process::ExitCode;

use rsvelte_corpus::task_files;
use rsvelte_kernel::computation::pipeline::{DocumentResult, RunOptions, Sharing};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::Document;

use super::units::load;
use crate::usage;

pub(crate) fn corpus(reg: &Registry, roots: &[&Path], tasks: &[&str]) -> ExitCode {
    use std::sync::atomic::AtomicUsize;
    use std::sync::atomic::Ordering::Relaxed;
    let (docs, dirs, skipped) = match load(reg, roots, 1) {
        Ok(loaded) => loaded,
        Err(error) => return usage(&error),
    };
    let options = RunOptions {
        tasks,
        sharing: Sharing::Shared,
        threads: None,
    };
    let (panics, files, failed, unwritten) = (
        AtomicUsize::new(0),
        AtomicUsize::new(0),
        AtomicUsize::new(0),
        AtomicUsize::new(0),
    );
    let started = std::time::Instant::now();
    // Each unit's outputs are written as soon as they are final, so memory stays at the working
    // set.
    let ran =
        rsvelte_kernel::computation::pipeline::run_each(reg, &docs, &options, &|i, result| {
            let actual = &dirs[i];
            // Absent on a unit's first run.
            drop(std::fs::remove_dir_all(actual));
            if let Some(p) = &result.panic {
                panics.fetch_add(1, Relaxed);
                eprintln!("panic: {}: {p}", docs[i].path);
                return;
            }
            match write_outputs(&docs[i], actual, &result) {
                Ok((written, with_diagnostics)) => {
                    files.fetch_add(written, Relaxed);
                    failed.fetch_add(with_diagnostics, Relaxed);
                }
                Err(error) => {
                    unwritten.fetch_add(1, Relaxed);
                    eprintln!("cannot write: {error}");
                }
            }
        });
    if let Err(e) = ran {
        return usage(&e.to_string());
    }
    let elapsed = started.elapsed();
    let (panics, unwritten) = (panics.into_inner(), unwritten.into_inner());
    eprintln!(
        "{} units ({skipped} unreadable or too large), {} files written, {} task(s) with \
         diagnostics, {panics} panic(s), {unwritten} unit(s) not written, {:.1} ms including \
         writing",
        docs.len(),
        files.into_inner(),
        failed.into_inner(),
        elapsed.as_secs_f64() * 1e3
    );
    report_metrics();
    if panics > 0 || unwritten > 0 {
        ExitCode::FAILURE
    } else {
        ExitCode::SUCCESS
    }
}

/// Writes each task's files below `actual`; returns how many were written, and how many tasks
/// reported diagnostics.
///
/// # Errors
///
/// The path that could not be created or written, and why.
fn write_outputs(
    document: &Document,
    actual: &Path,
    result: &DocumentResult,
) -> Result<(usize, usize), String> {
    let (mut written, mut with_diagnostics) = (0, 0);
    for (task, out) in &result.outputs {
        let (dir, variant) = task_files::location(task);
        let dir = actual.join(dir);
        std::fs::create_dir_all(&dir).map_err(|e| format!("{}: {e}", dir.display()))?;
        for (name, text) in task_files::files(&document.text, out) {
            let path = dir.join(format!("{variant}.{name}"));
            std::fs::write(&path, text.as_bytes())
                .map_err(|e| format!("{}: {e}", path.display()))?;
        }
        written += out.files.len();
        with_diagnostics += usize::from(!out.diagnostics.is_empty());
    }
    Ok((written, with_diagnostics))
}

#[cfg(feature = "metrics")]
fn report_metrics() {
    for p in rsvelte_kernel::performance::measurement::snapshot() {
        eprintln!("{p:?}");
    }
}

#[cfg(not(feature = "metrics"))]
const fn report_metrics() {}
