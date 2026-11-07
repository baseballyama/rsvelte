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
mod snapshots;

use std::path::{Path, PathBuf};
use std::process::ExitCode;
use std::sync::Mutex;

use cases::Case;
pub use node::NodePackages;
use rsvelte_kernel::computation::pipeline::{Document, Registry, RunOptions, Sharing, run_each};
use snapshots::{Outcome, Snapshot};

const FIXTURES_DIR: &str = "tests/fixtures";
const CORPUS: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/../../corpus");
const UPDATE_VARIABLE: &str = "UPDATE_EXPECT";
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

    /// Runs `task` on every case and keeps its output as `<name>.*` in `actual/` and `expected/`.
    ///
    /// # Panics
    ///
    /// If the task or the name is already used, or the name is not a plain file stem.
    #[must_use]
    pub fn snapshot(self, task: &'static str, name: &'static str) -> Self {
        self.add(task, name, false)
    }

    /// Like [`Fixtures::snapshot`], but in a case copied from the corpus, the `<name>.js` file
    /// also matches the official one when both parse to the same syntax tree.
    ///
    /// # Panics
    ///
    /// As [`Fixtures::snapshot`].
    #[must_use]
    pub fn javascript_snapshot(self, task: &'static str, name: &'static str) -> Self {
        self.add(task, name, true)
    }

    fn add(mut self, task: &'static str, name: &'static str, javascript_tree: bool) -> Self {
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
        self.snapshots.push(Snapshot {
            task,
            name,
            javascript_tree,
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
        if let Some(path) = std::env::var_os(VERDICTS_VARIABLE) {
            let mut lines = outcome.verdicts.clone();
            lines.sort_unstable();
            let mut text = lines.join("\n");
            text.push('\n');
            if let Err(e) = std::fs::write(&path, text) {
                return fail(&format!("{}: {e}", Path::new(&path).display()));
            }
        }
        eprintln!(
            "fixtures {}: {} of {total} cases, {} snapshots same, {} written, {} removed, \
             {problems} problems",
            self.root.display(),
            runnable.len(),
            outcome.same,
            outcome.written,
            outcome.removed,
        );
        let oracle_cases = outcome.matching
            + outcome.equivalent
            + outcome.differing
            + outcome.unparseable
            + outcome.not_run
            + outcome.unmeasured;
        if oracle_cases > 0 {
            eprintln!(
                "official output, {oracle_cases} cases: {} match it byte for byte, {} match it as \
                 JavaScript syntax trees, {} differ (compare their `expected/` and `actual/`), {} \
                 have JavaScript that does not parse, {} not run, \
                 {} UNMEASURED (no oracle snapshot)",
                outcome.matching,
                outcome.equivalent,
                outcome.differing,
                outcome.unparseable,
                outcome.not_run,
                outcome.unmeasured,
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
    ) -> Result<Outcome, String> {
        let tasks: Vec<&str> = self.snapshots.iter().map(|s| s.task).collect();
        let options = RunOptions {
            tasks: &tasks,
            sharing: Sharing::Shared,
            threads: None,
        };
        let outcomes = Mutex::new(Vec::with_capacity(cases.len()));
        let mut offset = 0;
        for project in cases
            .chunk_by(|a, b| !self.per_project || (a.kind == b.kind && a.project() == b.project()))
        {
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
            .map_err(|e| e.to_string())?;
            offset += project.len();
        }
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
        let outcome = fixtures.check(&cases, &documents, true).unwrap();
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
        let outcome = fixtures.check(&cases, &documents, true).unwrap();
        assert_eq!(outcome.unmeasured, 1, "no official output is not a match");
        assert_eq!(
            (outcome.matching, outcome.written),
            (0, 0),
            "update never writes the oracle"
        );
        assert_eq!(
            std::fs::read_to_string(unit.join("actual/test.findings/default.json")).unwrap(),
            "[]\n"
        );
        assert!(other.is_file(), "other tasks' outputs stay");
        let expected = unit.join("expected/test.findings");
        std::fs::create_dir_all(&expected).unwrap();
        std::fs::write(expected.join("default.json"), "[]\n").unwrap();
        let control = fixtures.check(&cases, &documents, false).unwrap();
        assert_eq!((control.matching, control.unmeasured), (1, 0));
        std::fs::write(expected.join("default.json"), "[1]\n").unwrap();
        let differs = fixtures.check(&cases, &documents, false).unwrap();
        assert_eq!((differs.matching, differs.differing), (0, 1));
        std::fs::remove_dir_all(root).unwrap();
    }
}
