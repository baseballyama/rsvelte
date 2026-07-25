//! The analysis worker.
//!
//! Linting and formatting run the Svelte compiler, which recurses once per
//! level of nested markup. Two hazards follow, and both are contained here
//! rather than on the message loop, which would take the whole session down
//! with it: deeply nested input needs far more stack than a thread is given by
//! default, and a rule that panics must cost at most its own document. This is
//! the same isolation contract `rsvelte-lint`'s CLI applies per file.
//!
//! The resolved-config caches live here too, so the loop never touches the
//! filesystem.

use std::panic::{AssertUnwindSafe, catch_unwind};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::thread::JoinHandle;

use crossbeam_channel::{Receiver, Sender, unbounded};
use lsp_server::RequestId;
use lsp_types::{Diagnostic, Range, TextEdit, Uri};

use crate::format::FormatSessions;
use crate::lint::LintConfigCache;
use crate::log;

/// `rsvelte_core`'s own deeply-nested-AST tests reserve the same 256 MiB. It is
/// address space, not resident memory — pages are committed only as the
/// recursion actually reaches them.
const STACK_SIZE: usize = 256 * 1024 * 1024;

pub enum Job {
    Lint {
        key: String,
        uri: Uri,
        version: i32,
        path: PathBuf,
        text: Arc<String>,
    },
    Format {
        id: RequestId,
        path: PathBuf,
        text: Arc<String>,
        range: Range,
    },
    /// Drop the resolved `rsvelte-lint.json` / `.oxfmtrc` caches so the next
    /// job re-reads them from disk.
    ClearCaches,
}

pub enum Outcome {
    Diagnostics {
        key: String,
        uri: Uri,
        version: i32,
        diagnostics: Vec<Diagnostic>,
    },
    Formatted {
        id: RequestId,
        edits: Vec<TextEdit>,
    },
}

pub struct Worker {
    jobs: Option<Sender<Job>>,
    handle: Option<JoinHandle<()>>,
}

impl Worker {
    pub fn spawn(outcomes: Sender<Outcome>) -> Self {
        let (jobs, receiver) = unbounded();
        let handle = std::thread::Builder::new()
            .name("rsvelte-analysis".to_string())
            .stack_size(STACK_SIZE)
            .spawn(move || run(&receiver, &outcomes))
            .expect("spawn the analysis worker");
        Self {
            jobs: Some(jobs),
            handle: Some(handle),
        }
    }

    pub fn submit(&self, job: Job) {
        if let Some(jobs) = &self.jobs {
            let _ = jobs.send(job);
        }
    }
}

impl Drop for Worker {
    fn drop(&mut self) {
        // Closing the queue is what ends the loop; only then can the thread be
        // joined.
        self.jobs.take();
        if let Some(handle) = self.handle.take() {
            let _ = handle.join();
        }
    }
}

fn run(jobs: &Receiver<Job>, outcomes: &Sender<Outcome>) {
    let mut lint_configs = LintConfigCache::default();
    let mut format_sessions = FormatSessions::default();

    for job in jobs {
        let outcome = match job {
            Job::ClearCaches => {
                lint_configs.clear();
                format_sessions.clear();
                continue;
            }
            Job::Lint {
                key,
                uri,
                version,
                path,
                text,
            } => {
                let config = lint_configs.get(path.parent().unwrap_or(Path::new(".")));
                let diagnostics = guard("lint", &path, || {
                    crate::lint::lint(&path, &text, &config)
                        .iter()
                        .map(crate::diagnostics::to_lsp)
                        .collect()
                })
                .unwrap_or_default();
                Outcome::Diagnostics {
                    key,
                    uri,
                    version,
                    diagnostics,
                }
            }
            Job::Format {
                id,
                path,
                text,
                range,
            } => {
                let edits = format(&mut format_sessions, &path, &text, range);
                Outcome::Formatted { id, edits }
            }
        };
        if outcomes.send(outcome).is_err() {
            break;
        }
    }
}

fn format(sessions: &mut FormatSessions, path: &Path, text: &str, range: Range) -> Vec<TextEdit> {
    let session = match sessions.get(path) {
        Ok(session) => session,
        Err(err) => {
            log::warn(format_args!(
                "no formatter config for {}: {err:#}",
                path.display()
            ));
            return Vec::new();
        }
    };
    // Formatting is never an error to the client: a failure yields no edits.
    let Some(formatted) = guard("format", path, || session.format(text, path)) else {
        return Vec::new();
    };
    match formatted {
        Ok(formatted) if formatted != text => vec![TextEdit {
            range,
            new_text: formatted,
        }],
        Ok(_) => Vec::new(),
        Err(err) => {
            log::warn(format_args!(
                "format failed for {}: {err:#}",
                path.display()
            ));
            Vec::new()
        }
    }
}

/// Run one analysis, turning a panic into "no result" instead of the loss of
/// every other document's diagnostics.
fn guard<T>(what: &str, path: &Path, run: impl FnOnce() -> T) -> Option<T> {
    match catch_unwind(AssertUnwindSafe(run)) {
        Ok(value) => Some(value),
        Err(_) => {
            log::warn(format_args!("{what} panicked on {}", path.display()));
            None
        }
    }
}
