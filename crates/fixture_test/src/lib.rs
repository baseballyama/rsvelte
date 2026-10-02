//! Snapshot tests over a crate's `tests/fixtures/` directory.
//!
//! A case is a directory that holds one `input.<ext>`. Each registered task writes its files to
//! `actual/<name>.<ext>`, and its diagnostics to `actual/<name>.diagnostics.txt`. A hand-written
//! case fails when `actual/` differs from `expected/`; `UPDATE_EXPECT=1` copies the new output
//! there instead. A case copied from the corpus has the official output in `expected/`, and its
//! differences are counted, not failed. See `crates/fixture_test/README.md`.

#![expect(
    clippy::print_stdout,
    clippy::print_stderr,
    reason = "a test harness lists cases on stdout, as libtest does, and reports on stderr"
)]

mod cases;
mod node;
mod snapshots;

use std::path::{Path, PathBuf};
use std::process::ExitCode;
use std::sync::Mutex;

use cases::Case;
pub use node::NodePackages;
use rsvelte_kernel::computation::pipeline::{Document, Registry, RunOptions, Sharing, run_each};
use snapshots::{Outcome, Snapshot};

const FIXTURES_DIR: &str = "tests/fixtures";
const UPDATE_VARIABLE: &str = "UPDATE_EXPECT";

/// The fixture test of one crate: which tasks run, and the snapshot name of each.
#[derive(Debug)]
pub struct Fixtures {
    root: PathBuf,
    registry: Registry,
    snapshots: Vec<Snapshot>,
}

impl Fixtures {
    /// Cases under `<manifest_dir>/tests/fixtures`. Pass `env!("CARGO_MANIFEST_DIR")`.
    #[must_use]
    pub fn new(manifest_dir: &str, registry: Registry) -> Self {
        Self {
            root: Path::new(manifest_dir).join(FIXTURES_DIR),
            registry,
            snapshots: Vec::new(),
        }
    }

    /// Runs `task` on every case and keeps its output as `<name>.*` in `actual/` and `expected/`.
    ///
    /// # Panics
    ///
    /// If the task or the name is already used, or the name is not a plain file stem.
    #[must_use]
    pub fn snapshot(mut self, task: &'static str, name: &'static str) -> Self {
        assert!(
            !name.is_empty()
                && name != "input"
                && name
                    .bytes()
                    .all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'_'),
            "snapshot name {name:?}: use letters, digits, `-` and `_`, and not `input`"
        );
        assert!(
            self.snapshots
                .iter()
                .all(|s| s.task != task && s.name != name),
            "{task} as {name:?}: each task and each name is used once"
        );
        self.snapshots.push(Snapshot { task, name });
        self
    }

    /// Runs the cases the command line selects and reports the result.
    ///
    /// # Panics
    ///
    /// If no snapshot is registered.
    #[must_use]
    pub fn run(self) -> ExitCode {
        assert!(
            !self.snapshots.is_empty(),
            "register a task with `snapshot`"
        );
        let arguments = match Arguments::parse(std::env::args().skip(1)) {
            Ok(a) => a,
            Err(e) => return fail(&e),
        };
        let all = match cases::discover(&self.root) {
            Ok(c) => c,
            Err(e) => return fail(&e),
        };
        if all.is_empty() {
            return fail(&format!(
                "no case (a directory with `input.<ext>`) under {}",
                self.root.display()
            ));
        }
        let total = all.len();
        let selected: Vec<Case> = all
            .into_iter()
            .filter(|c| arguments.selects(&c.name))
            .collect();
        if arguments.list {
            for c in &selected {
                println!("{}: test", c.name);
            }
            return ExitCode::SUCCESS;
        }
        let mut problems = 0;
        let mut documents = Vec::with_capacity(selected.len());
        let mut runnable = Vec::with_capacity(selected.len());
        for c in selected {
            match c.document() {
                Ok(d) => {
                    documents.push(d);
                    runnable.push(c);
                }
                Err(e) => {
                    eprintln!("FAIL {}: {e}", c.name);
                    problems += 1;
                }
            }
        }
        let outcome = match self.check(&runnable, &documents, arguments.update) {
            Ok(o) => o,
            Err(e) => return fail(&e),
        };
        for m in &outcome.messages {
            eprintln!("{m}");
        }
        problems += outcome.problems;
        eprintln!(
            "fixtures {}: {} of {total} cases, {} snapshots same, {} written, {} removed, \
             {problems} problems",
            self.root.display(),
            runnable.len(),
            outcome.same,
            outcome.written,
            outcome.removed,
        );
        if outcome.matching + outcome.differing + outcome.not_run > 0 {
            eprintln!(
                "official output: {} cases match it byte for byte, {} differ (compare their \
                 `expected/` and `actual/`), {} not run",
                outcome.matching, outcome.differing, outcome.not_run,
            );
        }
        if problems > 0 {
            eprintln!(
                "to accept the new output: {UPDATE_VARIABLE}=1 cargo test -p {} --test fixtures",
                std::env::var("CARGO_PKG_NAME").unwrap_or_else(|_| "<crate>".to_owned())
            );
            return ExitCode::FAILURE;
        }
        ExitCode::SUCCESS
    }

    fn check(
        &self,
        cases: &[Case],
        documents: &[Document],
        update: bool,
    ) -> Result<Outcome, String> {
        let tasks: Vec<&str> = self.snapshots.iter().map(|s| s.task).collect();
        let options = RunOptions {
            tasks: &tasks,
            sharing: Sharing::Shared,
            threads: None,
        };
        let outcomes = Mutex::new(Vec::with_capacity(cases.len()));
        // Each case is checked as soon as its result is final, so memory stays at the working set.
        run_each(&self.registry, documents, &options, &|i, result| {
            let outcome =
                snapshots::check(&cases[i], &documents[i], &result, &self.snapshots, update);
            outcomes
                .lock()
                .expect("no check panics while holding the lock")
                .push((i, outcome));
        })
        .map_err(|e| e.to_string())?;
        let mut outcomes = outcomes.into_inner().map_err(|e| e.to_string())?;
        outcomes.sort_unstable_by_key(|(i, _)| *i);
        let mut total = Outcome::default();
        for (_, o) in outcomes {
            total.add(o);
        }
        Ok(total)
    }
}

fn fail(message: &str) -> ExitCode {
    eprintln!("fixtures: {message}");
    ExitCode::FAILURE
}

/// The part of libtest's command line that applies to cases.
struct Arguments {
    filters: Vec<String>,
    exact: bool,
    list: bool,
    update: bool,
}

impl Arguments {
    fn parse(arguments: impl Iterator<Item = String>) -> Result<Self, String> {
        let update = match std::env::var(UPDATE_VARIABLE) {
            Err(std::env::VarError::NotPresent) => false,
            Ok(v) if v == "1" => true,
            Ok(v) => return Err(format!("{UPDATE_VARIABLE}={v}: use 1 or leave it unset")),
            Err(e) => return Err(format!("{UPDATE_VARIABLE}: {e}")),
        };
        let mut parsed = Self {
            filters: Vec::new(),
            exact: false,
            list: false,
            update,
        };
        for a in arguments {
            match a.as_str() {
                "--exact" => parsed.exact = true,
                "--list" => parsed.list = true,
                // Other libtest flags (`--nocapture`, `--test-threads`, ...) do not change which
                // cases run.
                _ if a.starts_with('-') => {}
                _ => parsed.filters.push(a),
            }
        }
        Ok(parsed)
    }

    fn selects(&self, name: &str) -> bool {
        self.filters.is_empty()
            || self.filters.iter().any(|f| {
                if self.exact {
                    name == f
                } else {
                    name.contains(f.as_str())
                }
            })
    }
}
