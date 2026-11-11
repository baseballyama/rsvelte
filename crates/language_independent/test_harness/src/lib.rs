//! The fixture test of a crate: its cases in `tests/fixtures/`.
//!
//! A case is a directory that holds one `input.<ext>`. Each registered task writes its files to
//! `actual/<name>.<ext>`, and its diagnostics to `actual/<name>.diagnostics.txt`; the case fails
//! when `actual/` differs from `expected/`. `UPDATE_EXPECT=1` copies the new output to
//! `expected/` of a hand-written case; a copied case's `expected/` is the official output and is
//! never written. See `crates/language_independent/test_harness/README.md`.

#![expect(
    clippy::print_stdout,
    clippy::print_stderr,
    reason = "a test harness lists cases on stdout, as libtest does, and reports on stderr"
)]

mod arguments;
mod cases;
mod node;
mod parallel;
mod snapshots;

use std::path::{Path, PathBuf};
use std::process::ExitCode;
use std::sync::Mutex;

use arguments::Arguments;
use cases::Case;
pub use node::NodePackages;
use rsvelte_kernel::computation::pipeline::{RunOptions, Sharing, run_each};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::Document;
use snapshots::{Outcome, Snapshot};

/// `rsvelte-typescript-content-mapper`, which cargo builds in the target directory of the test
/// that calls this; a test cannot name another package's executable with `CARGO_BIN_EXE_`.
///
/// # Panics
///
/// If it is not built.
#[must_use]
pub fn content_mapper() -> PathBuf {
    let name = "rsvelte-typescript-content-mapper";
    std::env::current_exe()
        .ok()
        .and_then(|test| Some(test.parent()?.parent()?.join(name)))
        .filter(|mapper| mapper.is_file())
        .unwrap_or_else(|| {
            panic!(
                "{name} is not built: run `cargo build -p rsvelte_typescript_content_mapper --bins`"
            )
        })
}

const FIXTURES_DIR: &str = "tests/fixtures";
pub(crate) const UPDATE_VARIABLE: &str = "UPDATE_EXPECT";

/// The fixture test of one crate: which tasks run, and the snapshot name of each.
#[derive(Debug)]
pub struct Fixtures {
    root: PathBuf,
    input_root: PathBuf,
    batches: Batches,
    registry: Registry,
    snapshots: Vec<Snapshot>,
}

impl Fixtures {
    /// Cases under `<manifest_dir>/tests/fixtures`. Pass `env!("CARGO_MANIFEST_DIR")`.
    #[must_use]
    pub fn new(manifest_dir: &str, registry: Registry) -> Self {
        Self {
            root: Path::new(manifest_dir).join(FIXTURES_DIR),
            input_root: Path::new(manifest_dir).join(FIXTURES_DIR),
            batches: Batches::All,
            registry,
            snapshots: Vec::new(),
        }
    }

    /// Runs each project (the cases with the same first directory) on its own: unrelated
    /// projects can declare conflicting global TypeScript types.
    #[must_use]
    pub const fn per_project(mut self) -> Self {
        self.batches = Batches::PerProject;
        self
    }

    /// Runs each case on its own. Against the snapshots a batched run writes, this shows that
    /// no case's output depends on the others in its batch.
    #[must_use]
    pub const fn each_alone(mut self) -> Self {
        self.batches = Batches::Alone;
        self
    }

    /// Reads another crate's hand-written inputs; keeps this crate's snapshots and actuals.
    #[must_use]
    pub fn inputs_from(mut self, manifest_dir: &str) -> Self {
        self.input_root = Path::new(manifest_dir).join(FIXTURES_DIR);
        self
    }

    /// Uses a separate suite for tasks with rule-specific inputs and options.
    #[must_use]
    pub fn directory(mut self, path: impl Into<PathBuf>) -> Self {
        self.root = path.into();
        self.input_root.clone_from(&self.root);
        self
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
        let all = match self.cases() {
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
        let read = parallel::map(&selected, Case::document);
        for (c, document) in selected.into_iter().zip(read) {
            match document {
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
             {} differ as listed, {problems} problems",
            self.root.display(),
            runnable.len(),
            outcome.same,
            outcome.written,
            outcome.removed,
            outcome.differ,
        );
        if problems > 0 {
            eprintln!(
                "to accept the new output: {UPDATE_VARIABLE}=1 cargo test -p {} --test {}",
                std::env::var("CARGO_PKG_NAME").unwrap_or_else(|_| "<crate>".to_owned()),
                test_name()
            );
            return ExitCode::FAILURE;
        }
        ExitCode::SUCCESS
    }

    fn cases(&self) -> Result<Vec<Case>, String> {
        let mut cases = cases::in_crate(&self.input_root)?;
        if self.input_root != self.root {
            for case in &mut cases {
                case.dir = self.root.join(&case.name);
            }
        }
        Ok(cases)
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
        let mut projects = Vec::new();
        let mut offset = 0;
        for project in cases.chunk_by(|a, b| match self.batches {
            Batches::All => true,
            Batches::PerProject => a.project() == b.project(),
            Batches::Alone => false,
        }) {
            projects.push((offset, project));
            offset += project.len();
        }
        // Projects are independent; one at a time would leave cores idle while a small one runs.
        let ran = parallel::map(&projects, |&(offset, project)| {
            let project_documents = &documents[offset..offset + project.len()];
            run_each(&self.registry, project_documents, &options, &|i, result| {
                let outcome = snapshots::check(
                    &project[i],
                    &project_documents[i],
                    &result,
                    &self.snapshots,
                    update,
                );
                outcomes
                    .lock()
                    .expect("no check panics while holding the lock")
                    .push((offset + i, outcome));
            })
            .map_err(|e| e.to_string())
        });
        ran.into_iter().collect::<Result<(), String>>()?;
        let mut outcomes = outcomes.into_inner().map_err(|e| e.to_string())?;
        outcomes.sort_unstable_by_key(|(i, _)| *i);
        let mut total = Outcome::default();
        for (_, o) in outcomes {
            total.add(o);
        }
        Ok(total)
    }
}

/// Which cases run together in one batch.
#[derive(Clone, Copy, Debug)]
enum Batches {
    All,
    /// The cases with the same first directory.
    PerProject,
    Alone,
}

/// The running test target's name: its executable is `<name>-<hash>`.
fn test_name() -> String {
    let exe = std::env::current_exe().ok();
    let stem = exe
        .as_deref()
        .and_then(Path::file_stem)
        .and_then(std::ffi::OsStr::to_str)
        .unwrap_or("<test>");
    stem.rsplit_once('-')
        .map_or(stem, |(name, _)| name)
        .to_owned()
}

fn fail(message: &str) -> ExitCode {
    eprintln!("fixtures: {message}");
    ExitCode::FAILURE
}

#[cfg(test)]
mod tests;
