//! The fixture test of a crate: its hand-written cases in `tests/fixtures/`, and the units of the
//! shared corpus.
//!
//! A case is a directory that holds one `input.<ext>`. In a hand-written case each registered task
//! writes its files to `actual/<name>.<ext>`, and its diagnostics to
//! `actual/<name>.diagnostics.txt`; the case fails when `actual/` differs from `expected/`, and
//! `UPDATE_EXPECT=1` copies the new output there instead. A corpus unit has the official output in
//! `expected/<task>/<variant>.<ext>`; rsvelte's goes to `actual/` in the same layout, and the
//! differences are counted, not failed. See `crates/test_harness/README.md`.

#![expect(
    clippy::print_stdout,
    clippy::print_stderr,
    reason = "a test harness lists cases on stdout, as libtest does, and reports on stderr"
)]
#![expect(
    clippy::multiple_crate_versions,
    reason = "oxc's own proc macros need both syn 2 and syn 3; only tests depend on this crate"
)]

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

use cases::Case;
pub use node::NodePackages;
use oracle::Verdict;
use rsvelte_kernel::computation::pipeline::{Document, Registry, RunOptions, Sharing, run_each};
use snapshots::{Outcome, Snapshot};

const FIXTURES_DIR: &str = "tests/fixtures";
const CORPUS: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/../../corpus");
const UPDATE_VARIABLE: &str = "UPDATE_EXPECT";
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
            registry,
            snapshots: Vec::new(),
        }
    }

    /// Also runs every unit of `corpus/<family>/`, against the official output.
    #[must_use]
    pub fn corpus(mut self, family: &'static str) -> Self {
        self.corpus = Some((PathBuf::from(CORPUS), family));
        self
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
        let (_, variant) = rsvelte_kernel::output::task_files::location(task);
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
                "to accept the new output: {UPDATE_VARIABLE}=1 cargo test -p {} --test fixtures",
                std::env::var("CARGO_PKG_NAME").unwrap_or_else(|_| "<crate>".to_owned())
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
                let (task, variant) = rsvelte_kernel::output::task_files::location(s.task);
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
        let mut cases = cases::in_crate(&self.input_root)?;
        if self.input_root != self.root {
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

/// Whether the variable is set to 1; unset is false, and any other value an error.
fn flag(name: &str) -> Result<bool, String> {
    match std::env::var(name) {
        Err(std::env::VarError::NotPresent) => Ok(false),
        Ok(v) if v == "1" => Ok(true),
        Ok(v) => Err(format!("{name}={v}: use 1 or leave it unset")),
        Err(e) => Err(format!("{name}: {e}")),
    }
}

impl Arguments {
    fn parse(arguments: impl Iterator<Item = String>) -> Result<Self, String> {
        let mut parsed = Self {
            filters: Vec::new(),
            exact: false,
            list: false,
            update: flag(UPDATE_VARIABLE)?,
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

#[cfg(test)]
mod tests {
    use rsvelte_kernel::computation::database::DocumentContext;
    use rsvelte_kernel::computation::pipeline::{Task, TaskOutput};

    use super::*;

    #[derive(Debug)]
    struct Findings;

    impl Task for Findings {
        fn identifier(&self) -> &'static str {
            "test.findings"
        }

        fn applies(&self, _: &Document) -> bool {
            true
        }

        fn run(&self, _: &DocumentContext<'_>, out: &mut TaskOutput) {
            out.file("json", "[]\n".to_owned());
        }
    }

    fn scratch(name: &str) -> PathBuf {
        let root = std::env::temp_dir().join(format!("rsvelte-{name}-{}", std::process::id()));
        drop(std::fs::remove_dir_all(&root));
        root
    }

    #[test]
    fn shared_inputs_keep_this_crates_snapshots() {
        let root = scratch("shared-inputs");
        let shared = root.join("compile");
        let own = root.join("typecheck");
        let case = shared.join("tests/fixtures/rsvelte/case");
        std::fs::create_dir_all(&case).unwrap();
        std::fs::write(case.join("input.svelte"), "<p />").unwrap();
        let mut registry = Registry::new();
        registry.task(Findings);
        let fixtures = Fixtures::new(own.to_str().unwrap(), registry)
            .inputs_from(shared.to_str().unwrap())
            .snapshot("test.findings", "findings");
        let cases = fixtures.cases().unwrap();
        assert_eq!(cases.len(), 1);
        assert_eq!(cases[0].name, "rsvelte/case");
        assert_eq!(cases[0].dir, own.join("tests/fixtures/rsvelte/case"));
        let documents = [cases[0].document().unwrap()];
        let outcome = fixtures.check(&cases, &documents, true, true).unwrap();
        assert_eq!(outcome.written, 1);
        assert!(
            own.join("tests/fixtures/rsvelte/case/expected/findings.json")
                .is_file()
        );
        assert!(
            !case.join("actual").exists(),
            "the other crate's case is untouched"
        );
        std::fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn corpus_units_are_measured_only_against_an_official_output() {
        let root = scratch("corpus");
        let own = root.join("crate");
        std::fs::create_dir_all(own.join("tests/fixtures")).unwrap();
        let unit = root.join("corpus/svelte/source/src/~input.svelte");
        std::fs::create_dir_all(&unit).unwrap();
        std::fs::write(unit.join("input.svelte"), "<p />").unwrap();
        // Another task's output, written by `rsvelte corpus`.
        let other = unit.join("actual/svelte.compile/client.js");
        std::fs::create_dir_all(other.parent().unwrap()).unwrap();
        std::fs::write(&other, "x").unwrap();
        let mut registry = Registry::new();
        registry.task(Findings);
        let mut fixtures =
            Fixtures::new(own.to_str().unwrap(), registry).snapshot("test.findings", "findings");
        fixtures.corpus = Some((root.join("corpus"), "svelte"));
        let cases = fixtures.cases().unwrap();
        assert_eq!(cases.len(), 1);
        assert_eq!(cases[0].name, "svelte/source/src/input.svelte");
        assert_eq!(
            cases[0].document().unwrap().path,
            "src/input.svelte",
            "the document is named by its path in the repository"
        );
        let documents = [cases[0].document().unwrap()];
        fixtures.check(&cases, &documents, false, false).unwrap();
        assert!(
            !unit.join("actual/test.findings").exists(),
            "a corpus unit's actual/ is written only when asked"
        );
        let outcome = fixtures.check(&cases, &documents, true, true).unwrap();
        assert_eq!(outcome.unmeasured, 1, "no official output is not a match");
        assert!(outcome.tallies.is_empty() && outcome.parity.is_empty());
        assert_eq!(
            outcome.written, 0,
            "update never writes the official output"
        );
        assert_eq!(
            std::fs::read_to_string(unit.join("actual/test.findings/default.json")).unwrap(),
            "[]\n"
        );
        assert!(other.is_file(), "other tasks' outputs stay");
        let expected = unit.join("expected/test.findings");
        std::fs::create_dir_all(&expected).unwrap();
        std::fs::write(expected.join("default.json"), "[]\n").unwrap();
        let key = "test.findings/default svelte/source/src/input.svelte".to_owned();
        let control = fixtures.check(&cases, &documents, false, true).unwrap();
        assert_eq!(control.unmeasured, 0);
        assert_eq!(control.parity, [(key.clone(), Some(Verdict::Match))]);
        std::fs::write(expected.join("default.json"), "[1]\n").unwrap();
        let differs = fixtures.check(&cases, &documents, false, true).unwrap();
        assert_eq!(differs.parity, [(key, Some(Verdict::Mismatch))]);
        std::fs::write(
            unit.join("fixture.toml"),
            "[skip]\n\"test.findings\" = \"a reason\"\n",
        )
        .unwrap();
        let cases = fixtures.cases().unwrap();
        let skipped = fixtures.check(&cases, &documents, false, true).unwrap();
        assert_eq!(
            (skipped.unmeasured, skipped.parity.len()),
            (1, 0),
            "a skipped task is not compared"
        );
        std::fs::remove_dir_all(root).unwrap();
    }
}
