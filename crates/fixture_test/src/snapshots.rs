use std::fmt::Write as _;
use std::path::Path;

use rsvelte_kernel::computation::pipeline::{Document, DocumentResult, TaskOutput};
use rsvelte_kernel::diagnostics::diagnostic::Severity;
use rsvelte_kernel::source::positions::LineIndex;
use rustc_hash::FxHashSet;

use crate::cases::{Case, Expected};
use crate::javascript;

const EXPECTED_DIR: &str = "expected";
const ACTUAL_DIR: &str = "actual";
const DIAGNOSTICS_EXTENSION: &str = "diagnostics.txt";
const CONTEXT_LINES: usize = 3;

#[derive(Clone, Copy, Debug)]
pub(crate) struct Snapshot {
    pub(crate) task: &'static str,
    pub(crate) name: &'static str,
    /// Whether the `.js` file of a corpus case may match the official one as a syntax tree.
    pub(crate) javascript_tree: bool,
}

/// How a corpus case compares with the official output. A case takes the worst verdict of its
/// files.
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
enum Verdict {
    Bytes,
    Tree,
    Differs,
    Unparseable,
}

#[derive(Default)]
pub(crate) struct Outcome {
    pub(crate) same: usize,
    pub(crate) written: usize,
    pub(crate) removed: usize,
    pub(crate) problems: usize,
    /// Oracle cases whose output is the official output byte for byte.
    pub(crate) matching: usize,
    /// Oracle cases that match only when JavaScript is compared as a syntax tree.
    pub(crate) equivalent: usize,
    pub(crate) differing: usize,
    /// Oracle cases with a JavaScript file, official or ours, that does not parse.
    pub(crate) unparseable: usize,
    /// Oracle cases where none of the tasks applies, such as a module rsvelte does not compile.
    pub(crate) not_run: usize,
    pub(crate) messages: Vec<String>,
}

impl Outcome {
    pub(crate) fn add(&mut self, other: Self) {
        self.same += other.same;
        self.written += other.written;
        self.removed += other.removed;
        self.problems += other.problems;
        self.matching += other.matching;
        self.equivalent += other.equivalent;
        self.differing += other.differing;
        self.unparseable += other.unparseable;
        self.not_run += other.not_run;
        self.messages.extend(other.messages);
    }

    fn problem(&mut self, case: &Case, message: &str) {
        self.messages.push(format!("FAIL {}: {message}", case.name));
        self.problems += 1;
    }
}

/// Writes the case's output to `actual/`, then compares it with `expected/` (or with `update`,
/// writes `expected/` of a snapshot case).
pub(crate) fn check(
    case: &Case,
    document: &Document,
    result: &DocumentResult,
    snapshots: &[Snapshot],
    update: bool,
) -> Outcome {
    let mut outcome = Outcome::default();
    if let Some(p) = &result.panic {
        outcome.problem(case, &format!("panicked: {p}"));
        return outcome;
    }
    let mut produced = Vec::new();
    for s in snapshots {
        match result.outputs.iter().find(|(task, _)| *task == s.task) {
            Some((_, out)) => produce(s, document, out, &mut produced),
            None if case.expected == Expected::Snapshot => {
                outcome.problem(case, &format!("{} did not run on this input", s.task));
            }
            None => {}
        }
    }
    let ran = result
        .outputs
        .iter()
        .any(|(task, _)| snapshots.iter().any(|s| s.task == *task));
    let mut names = FxHashSet::default();
    for (name, _) in &produced {
        if !names.insert(name.as_str()) {
            outcome.problem(case, &format!("two outputs are named {name}"));
        }
    }
    if let Err(e) = write_actual(&case.dir.join(ACTUAL_DIR), &produced) {
        outcome.problem(case, &e);
    }
    let expected_dir = case.dir.join(EXPECTED_DIR);
    let existing = match existing_snapshots(&expected_dir, snapshots) {
        Ok(e) => e,
        Err(e) => {
            outcome.problem(case, &e);
            return outcome;
        }
    };
    match case.expected {
        Expected::Snapshot => {
            compare_snapshots(
                case,
                &expected_dir,
                &existing,
                &produced,
                update,
                &mut outcome,
            );
        }
        Expected::Oracle if !ran => outcome.not_run += 1,
        Expected::Oracle => {
            match compare_with_oracle(&expected_dir, &existing, &produced, snapshots) {
                Verdict::Bytes => outcome.matching += 1,
                Verdict::Tree => outcome.equivalent += 1,
                Verdict::Differs => outcome.differing += 1,
                Verdict::Unparseable => outcome.unparseable += 1,
            }
        }
    }
    outcome
}

fn compare_with_oracle(
    expected_dir: &Path,
    existing: &[String],
    produced: &[(String, String)],
    snapshots: &[Snapshot],
) -> Verdict {
    if existing.len() != produced.len() {
        return Verdict::Differs;
    }
    let mut worst = Verdict::Bytes;
    for (name, text) in produced {
        let verdict = match existing
            .contains(name)
            .then(|| std::fs::read_to_string(expected_dir.join(name)))
        {
            Some(Ok(e)) if e == *text => Verdict::Bytes,
            Some(Ok(e)) if is_javascript_tree(name, snapshots) => {
                match javascript::same_tree(&e, text) {
                    Ok(true) => Verdict::Tree,
                    Ok(false) => Verdict::Differs,
                    Err(_) => Verdict::Unparseable,
                }
            }
            _ => Verdict::Differs,
        };
        worst = worst.max(verdict);
    }
    worst
}

fn is_javascript_tree(file: &str, snapshots: &[Snapshot]) -> bool {
    snapshots
        .iter()
        .any(|s| s.javascript_tree && file.strip_prefix(s.name).is_some_and(|rest| rest == ".js"))
}

fn write_actual(dir: &Path, produced: &[(String, String)]) -> Result<(), String> {
    match std::fs::remove_dir_all(dir) {
        Err(e) if e.kind() != std::io::ErrorKind::NotFound => {
            return Err(format!("{}: {e}", dir.display()));
        }
        _ => {}
    }
    if produced.is_empty() {
        return Ok(());
    }
    std::fs::create_dir_all(dir).map_err(|e| format!("{}: {e}", dir.display()))?;
    for (name, text) in produced {
        std::fs::write(dir.join(name), text).map_err(|e| format!("{ACTUAL_DIR}/{name}: {e}"))?;
    }
    Ok(())
}

fn compare_snapshots(
    case: &Case,
    expected_dir: &Path,
    existing: &[String],
    produced: &[(String, String)],
    update: bool,
    outcome: &mut Outcome,
) {
    for (name, text) in produced {
        let path = expected_dir.join(name);
        let expected = existing
            .contains(name)
            .then(|| std::fs::read_to_string(&path));
        match expected {
            Some(Ok(e)) if e == *text => outcome.same += 1,
            _ if update => match std::fs::create_dir_all(expected_dir)
                .and_then(|()| std::fs::write(&path, text))
            {
                Ok(()) => outcome.written += 1,
                Err(e) => outcome.problem(case, &format!("{EXPECTED_DIR}/{name}: {e}")),
            },
            Some(Ok(e)) => {
                outcome.problem(case, &format!("{name} differs\n{}", difference(&e, text)));
            }
            Some(Err(e)) => outcome.problem(case, &format!("{EXPECTED_DIR}/{name}: {e}")),
            None => outcome.problem(case, &format!("{name} is new\n{}", excerpt(text))),
        }
    }
    for name in existing {
        if produced.iter().any(|(n, _)| n == name) {
            continue;
        }
        if !update {
            outcome.problem(case, &format!("{name} is no longer produced"));
            continue;
        }
        match std::fs::remove_file(expected_dir.join(name)) {
            Ok(()) => outcome.removed += 1,
            Err(e) => outcome.problem(case, &format!("{EXPECTED_DIR}/{name}: {e}")),
        }
    }
    if update && produced.is_empty() {
        // Absent when the case never had a snapshot.
        drop(std::fs::remove_dir(expected_dir));
    }
}

fn produce(
    s: &Snapshot,
    document: &Document,
    out: &TaskOutput,
    produced: &mut Vec<(String, String)>,
) {
    for f in &out.files {
        produced.push((format!("{}.{}", s.name, f.name), f.text.clone()));
    }
    if !out.diagnostics.is_empty() {
        produced.push((
            format!("{}.{DIAGNOSTICS_EXTENSION}", s.name),
            diagnostics_text(document, out),
        ));
    }
}

/// One line per diagnostic: `severity code line:column-line:column message`, with 1-based lines
/// and columns in UTF-16 code units counted from 1, as editors show them.
fn diagnostics_text(document: &Document, out: &TaskOutput) -> String {
    let index = LineIndex::new(&document.text);
    let mut text = String::new();
    for d in &out.diagnostics {
        let severity = match d.severity {
            Severity::Error => "error",
            Severity::Warning => "warning",
        };
        let start = index.line_column(d.span.start_offset);
        write!(
            text,
            "{severity} {} {}:{}",
            d.code,
            start.line,
            start.column + 1
        )
        .expect("writing to a String");
        if d.has_end {
            let end = index.line_column(d.span.end_offset);
            write!(text, "-{}:{}", end.line, end.column + 1).expect("writing to a String");
        }
        writeln!(text, " {}", d.message.replace('\n', "\n    ")).expect("writing to a String");
    }
    text
}

/// File names in `expected/` that belong to one of the snapshots.
fn existing_snapshots(dir: &Path, snapshots: &[Snapshot]) -> Result<Vec<String>, String> {
    let read = match std::fs::read_dir(dir) {
        Ok(r) => r,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(Vec::new()),
        Err(e) => return Err(format!("{}: {e}", dir.display())),
    };
    let mut names = Vec::new();
    for entry in read {
        let entry = entry.map_err(|e| format!("{}: {e}", dir.display()))?;
        let Ok(name) = entry.file_name().into_string() else {
            continue;
        };
        let owned = snapshots.iter().any(|s| {
            name.strip_prefix(s.name)
                .is_some_and(|rest| rest.starts_with('.'))
        });
        if owned && !entry.path().is_dir() {
            names.push(name);
        }
    }
    names.sort_unstable();
    Ok(names)
}

/// The first line that differs, with a few lines after it from both sides.
fn difference(expected: &str, actual: &str) -> String {
    let first = expected
        .lines()
        .zip(actual.lines())
        .position(|(e, a)| e != a)
        .unwrap_or_else(|| expected.lines().count().min(actual.lines().count()));
    let mut text = String::new();
    for (label, side) in [("expected", expected), ("actual", actual)] {
        writeln!(text, "  {label} from line {}:", first + 1).expect("writing to a String");
        for line in side.lines().skip(first).take(CONTEXT_LINES) {
            writeln!(text, "    | {line}").expect("writing to a String");
        }
    }
    text
}

fn excerpt(text: &str) -> String {
    let mut out = String::new();
    for line in text.lines().take(CONTEXT_LINES) {
        writeln!(out, "    | {line}").expect("writing to a String");
    }
    out
}
