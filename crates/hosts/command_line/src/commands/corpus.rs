use std::path::Path;
use std::process::ExitCode;

use rsvelte_kernel::computation::pipeline::{Registry, RunOptions, Sharing};

use crate::input::load;
use crate::output::{report_metrics, write_outputs};
use crate::usage;

pub(crate) fn corpus(reg: &Registry, roots: &[&Path], tasks: &[&str]) -> ExitCode {
    use std::sync::atomic::AtomicUsize;
    use std::sync::atomic::Ordering::Relaxed;
    let (docs, dirs, skipped) = match load(reg, roots) {
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
            let actual = dirs[i].join("actual");
            // Absent on a unit's first run.
            drop(std::fs::remove_dir_all(&actual));
            if let Some(p) = &result.panic {
                panics.fetch_add(1, Relaxed);
                eprintln!("panic: {}: {p}", docs[i].path);
                return;
            }
            let mut f = 0;
            match write_outputs(&docs[i], &actual, &result, &mut f) {
                Ok(written) => {
                    files.fetch_add(written, Relaxed);
                }
                Err(error) => {
                    unwritten.fetch_add(1, Relaxed);
                    eprintln!("cannot write: {error}");
                }
            }
            failed.fetch_add(f, Relaxed);
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
