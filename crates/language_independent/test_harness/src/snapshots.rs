use std::fmt::Write as _;
use std::path::Path;

use rsvelte_kernel::computation::pipeline::DocumentResult;
use rsvelte_kernel::computation::task::TaskOutput;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::LineIndex;
use rustc_hash::FxHashSet;

use crate::cases::{Case, Kind};

const EXPECTED_DIR: &str = "expected";
const ACTUAL_DIR: &str = "actual";
const DIAGNOSTICS_EXTENSION: &str = "diagnostics.txt";
const CONTEXT_LINES: usize = 3;

#[derive(Clone, Copy, Debug)]
pub(crate) struct Snapshot {
    pub(crate) task: &'static str,
    pub(crate) name: &'static str,
}

#[derive(Default)]
pub(crate) struct Outcome {
    pub(crate) same: usize,
    pub(crate) written: usize,
    pub(crate) removed: usize,
    pub(crate) problems: usize,
    /// Copied cases that differ from the official output, as their `differs.txt` says.
    pub(crate) differ: usize,
    pub(crate) messages: Vec<String>,
}

impl Outcome {
    pub(crate) fn add(&mut self, other: Self) {
        self.same += other.same;
        self.written += other.written;
        self.removed += other.removed;
        self.problems += other.problems;
        self.differ += other.differ;
        self.messages.extend(other.messages);
    }

    fn problem(&mut self, case: &Case, message: &str) {
        self.messages.push(format!("FAIL {}: {message}", case.name));
        self.problems += 1;
    }
}

/// Writes the case's output to `actual/`, then compares it with `expected/` (or with `update`,
/// writes `expected/` of a hand-written case).
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
            None => outcome.problem(case, &format!("{} did not run on this input", s.task)),
        }
    }
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
    if case.differs {
        if matches(&expected_dir, &existing, &produced) {
            outcome.problem(
                case,
                "now matches the official output; remove it from differs.txt",
            );
        } else {
            outcome.differ += 1;
        }
        return outcome;
    }
    // A copied case's `expected/` is the official output, which only the official tool writes.
    let update = update && case.kind == Kind::HandWritten;
    compare_snapshots(
        case,
        &expected_dir,
        &existing,
        &produced,
        update,
        &mut outcome,
    );
    outcome
}

/// Makes `dir` hold exactly `produced`. Most runs change few files, and creating and removing
/// files costs far more than reading them, so only changed files are written.
fn write_actual(dir: &Path, produced: &[(String, String)]) -> Result<(), String> {
    let at = |e: std::io::Error| format!("{}: {e}", dir.display());
    let entries = match std::fs::read_dir(dir) {
        Ok(r) => r.collect::<Result<Vec<_>, _>>().map_err(at)?,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Vec::new(),
        Err(e) => return Err(at(e)),
    };
    for entry in &entries {
        let path = entry.path();
        let is_dir = entry.file_type().map_err(at)?.is_dir();
        if !is_dir
            && produced
                .iter()
                .any(|(name, _)| entry.file_name() == name.as_str())
        {
            continue;
        }
        let removed = if is_dir {
            std::fs::remove_dir_all(&path)
        } else {
            std::fs::remove_file(&path)
        };
        removed.map_err(|e| format!("{}: {e}", path.display()))?;
    }
    if produced.is_empty() {
        return match std::fs::remove_dir(dir) {
            Err(e) if e.kind() != std::io::ErrorKind::NotFound => Err(at(e)),
            _ => Ok(()),
        };
    }
    if entries.is_empty() {
        std::fs::create_dir_all(dir).map_err(at)?;
    }
    for (name, text) in produced {
        let path = dir.join(name);
        if std::fs::read(&path).is_ok_and(|old| old == text.as_bytes()) {
            continue;
        }
        std::fs::write(&path, text).map_err(|e| format!("{ACTUAL_DIR}/{name}: {e}"))?;
    }
    Ok(())
}

/// Whether `expected/` holds exactly the produced files, byte for byte.
fn matches(expected_dir: &Path, existing: &[String], produced: &[(String, String)]) -> bool {
    existing.len() == produced.len()
        && produced.iter().all(|(name, text)| {
            existing.contains(name)
                && std::fs::read(expected_dir.join(name)).is_ok_and(|e| e == text.as_bytes())
        })
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

/// The files in `expected/` that belong to one of the snapshots.
fn existing_snapshots(expected: &Path, snapshots: &[Snapshot]) -> Result<Vec<String>, String> {
    let read = match std::fs::read_dir(expected) {
        Ok(r) => r,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(Vec::new()),
        Err(e) => return Err(format!("{}: {e}", expected.display())),
    };
    let mut names = Vec::new();
    for entry in read {
        let entry = entry.map_err(|e| format!("{}: {e}", expected.display()))?;
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

#[cfg(test)]
mod tests;
