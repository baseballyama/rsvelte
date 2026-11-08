//! The fixture test of a crate: its hand-written cases in `tests/fixtures/`, and the units of the
//! shared corpus.
//!
//! A case is a directory that holds one `input.<ext>`. In a hand-written case each registered task
//! writes its files to `actual/<name>.<ext>`, and its diagnostics to
//! `actual/<name>.diagnostics.txt`; the case fails when `actual/` differs from `expected/`, and
//! `UPDATE_EXPECT=1` copies the new output there instead. A corpus unit has the official output in
//! `expected/<task>/<variant>.<ext>`; rsvelte's goes to `actual/` in the same layout, and the
//! differences are counted, not failed. See `crates/language_independent/test_harness/README.md`.

#![expect(
    clippy::print_stdout,
    clippy::print_stderr,
    reason = "a test harness lists cases on stdout, as libtest does, and reports on stderr"
)]
#![expect(
    clippy::multiple_crate_versions,
    reason = "oxc's own proc macros need both syn 2 and syn 3; only tests depend on this crate"
)]

mod arguments;
mod cases;
mod javascript;
mod node;
mod oracle;
mod parallel;
mod snapshots;

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::process::ExitCode;
use std::sync::Mutex;

use arguments::{Arguments, flag};
use cases::Case;
pub use node::NodePackages;
use oracle::Verdict;
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
const CORPUS: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/../../../corpus");
pub(crate) const UPDATE_VARIABLE: &str = "UPDATE_EXPECT";
/// Set to 1, a corpus unit's `actual/` is written; the comparison does not need it.
const ACTUAL_VARIABLE: &str = "FIXTURE_ACTUAL";
/// A path: each file of each corpus case is written there as one `verdict case file` line.
pub(crate) const VERDICTS_VARIABLE: &str = "FIXTURE_VERDICTS";

/// The fixture test of one crate: which tasks run, and the snapshot name of each.
#[derive(Debug)]
pub struct Fixtures {
    root: PathBuf,
    input_root: PathBuf,
    /// The corpus directory and the family whose units also run.
    corpus: Option<(PathBuf, &'static str)>,
    /// Whether each project is run on its own (see [`Fixtures::per_project`]).
    per_project: bool,
    /// Whether the crate's hand-written cases run; not for [`Fixtures::corpus_only`].
    hand_written: bool,
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
            corpus: None,
            per_project: false,
            hand_written: true,
            registry,
            snapshots: Vec::new(),
        }
    }

    /// Only the units of `corpus/<family>/`, against the official output: one test runs every
    /// task on them, so each unit is found, read and parsed once.
    #[must_use]
    pub fn corpus_only(family: &'static str, registry: Registry) -> Self {
        let corpus = PathBuf::from(CORPUS);
        Self {
            root: corpus.join(family),
            input_root: corpus.join(family),
            corpus: Some((corpus, family)),
            per_project: false,
            hand_written: false,
            registry,
            snapshots: Vec::new(),
        }
    }

    /// Runs each project (a corpus source, or the hand-written cases with the same first
    /// directory) on its own: unrelated repositories can declare conflicting global TypeScript
    /// types.
    #[must_use]
    pub const fn per_project(mut self) -> Self {
        self.per_project = true;
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

    /// Runs `task` on every case and keeps its output as `<name>.*` in `actual/` and `expected/`
    /// of a hand-written case, and as `<task>/<variant>.*` in a corpus unit.
    ///
    /// # Panics
    ///
    /// If the task or the name is already used, or the name is not a plain file stem.
    #[must_use]
    pub fn snapshot(self, task: &'static str, name: &'static str) -> Self {
        self.add(task, name, true)
    }

    /// A task of the official tool that rsvelte does not implement yet: its corpus units stay in
    /// the parity ratchet, as `missing`.
    ///
    /// # Panics
    ///
    /// As [`Fixtures::snapshot`].
    #[must_use]
    pub fn not_implemented(self, task: &'static str) -> Self {
        let (_, variant) = rsvelte_kernel::task_files::location(task);
        self.add(task, variant, false)
    }

    fn add(mut self, task: &'static str, name: &'static str, implemented: bool) -> Self {
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
                .all(|s| s.task != task && (s.name != name || !implemented || !s.implemented)),
            "{task} as {name:?}: each task and each name is used once"
        );
        self.snapshots.push(Snapshot {
            task,
            name,
            implemented,
        });
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
        let corpus_actual = match flag(ACTUAL_VARIABLE) {
            Ok(a) => a,
            Err(e) => return fail(&e),
        };
        let outcome = match self.check(&runnable, &documents, arguments.update, corpus_actual) {
            Ok(o) => o,
            Err(e) => return fail(&e),
        };
        for m in &outcome.messages {
            eprintln!("{m}");
        }
        problems += outcome.problems;
        if let Some(path) = std::env::var_os(VERDICTS_VARIABLE) {
            let mut lines = outcome.verdicts.clone();
            lines.sort_unstable();
            let mut text = lines.join("\n");
            text.push('\n');
            if let Err(e) = std::fs::write(&path, text) {
                return fail(&format!("{}: {e}", Path::new(&path).display()));
            }
        }
        self.summarize(&outcome, runnable.len(), total, problems);
        if let Some((corpus, _)) = &self.corpus {
            match self.ratchet(corpus, &outcome, &arguments) {
                Ok(moved) => problems += moved,
                Err(e) => return fail(&e),
            }
        }
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

    fn summarize(&self, outcome: &Outcome, ran: usize, total: usize, problems: usize) {
        eprintln!(
            "fixtures {}: {} of {total} cases, {} snapshots same, {} written, {} removed, \
             {problems} problems",
            self.root.display(),
            ran,
            outcome.same,
            outcome.written,
            outcome.removed,
        );
        for (task, tally) in &outcome.tallies {
            let counts: Vec<String> = Verdict::ALL
                .iter()
                .zip(tally.verdicts)
                .filter(|(_, n)| *n > 0)
                .map(|(v, n)| format!("{n} {}", v.label()))
                .collect();
            eprintln!(
                "official output, {task}: {}, {} refused",
                counts.join(", "),
                tally.refused
            );
        }
        if outcome.unmeasured > 0 {
            eprintln!(
                "official output: {} cases UNMEASURED (no official file for these tasks)",
                outcome.unmeasured
            );
        }
    }

    /// Compares the corpus verdicts with the parity ratchet, or records them with `update`, and
    /// returns how many moved without being recorded. Only the entries of this harness's tasks,
    /// and of the cases the command line selects, are compared.
    fn ratchet(
        &self,
        corpus: &Path,
        outcome: &Outcome,
        arguments: &Arguments,
    ) -> Result<usize, String> {
        let tasks: Vec<String> = self
            .snapshots
            .iter()
            .map(|s| {
                let (task, variant) = rsvelte_kernel::task_files::location(s.task);
                format!("{task}/{variant}")
            })
            .collect();
        let owned = |key: &str| {
            key.split_once(' ').is_some_and(|(task, case)| {
                tasks.iter().any(|t| t == task) && arguments.selects(case)
            })
        };
        let now: BTreeMap<String, Verdict> = outcome
            .parity
            .iter()
            .filter_map(|(key, verdict)| verdict.map(|v| (key.clone(), v)))
            .collect();
        let mut ratchet = oracle::Ratchet::load(corpus)?;
        let moved = ratchet.check(&now, owned, arguments.update)?;
        for (key, recorded, verdict) in &moved {
            eprintln!("MOVED {recorded:>11} -> {verdict:<11} {key}");
        }
        eprintln!(
            "parity: {} units compared (refused ones not listed), {} moved{}",
            now.len(),
            moved.len(),
            if arguments.update && !moved.is_empty() {
                ", recorded"
            } else {
                ""
            },
        );
        Ok(if arguments.update { 0 } else { moved.len() })
    }

    fn cases(&self) -> Result<Vec<Case>, String> {
        let mut cases = if self.hand_written {
            cases::in_crate(&self.input_root)?
        } else {
            Vec::new()
        };
        if self.hand_written && self.input_root != self.root {
            for case in &mut cases {
                case.dir = self.root.join(&case.name);
            }
        }
        if let Some((corpus, family)) = &self.corpus {
            cases.extend(cases::corpus(corpus, family)?);
        }
        Ok(cases)
    }

    fn check(
        &self,
        cases: &[Case],
        documents: &[Document],
        update: bool,
        corpus_actual: bool,
    ) -> Result<Outcome, String> {
        let tasks: Vec<&str> = self
            .snapshots
            .iter()
            .filter(|s| s.implemented)
            .map(|s| s.task)
            .collect();
        let options = RunOptions {
            tasks: &tasks,
            sharing: Sharing::Shared,
            threads: None,
        };
        let outcomes = Mutex::new(Vec::with_capacity(cases.len()));
        let mut projects = Vec::new();
        let mut offset = 0;
        for project in cases
            .chunk_by(|a, b| !self.per_project || (a.kind == b.kind && a.project() == b.project()))
        {
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
                    corpus_actual,
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
