use std::collections::BTreeMap;
use std::fmt::Write as _;
use std::path::Path;

use rsvelte_kernel::computation::pipeline::{DocumentResult, TaskOutput};
use rsvelte_kernel::diagnostics::diagnostic::Severity;
use rsvelte_kernel::output::task_files;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::LineIndex;
use rustc_hash::FxHashSet;

use crate::cases::{Case, Kind};
use crate::oracle::{self, Verdict};

const EXPECTED_DIR: &str = "expected";
const ACTUAL_DIR: &str = "actual";
const DIAGNOSTICS_EXTENSION: &str = "diagnostics.txt";
const CONTEXT_LINES: usize = 3;

#[derive(Clone, Copy, Debug)]
pub(crate) struct Snapshot {
    pub(crate) task: &'static str,
    pub(crate) name: &'static str,
    /// Whether rsvelte implements the task. One it does not stays in the ratchet: its units are
    /// `missing`.
    pub(crate) implemented: bool,
}

impl Snapshot {
    /// What the names of this snapshot's files start with, relative to `expected/` and `actual/`.
    fn prefix(&self, kind: Kind) -> String {
        match kind {
            Kind::HandWritten | Kind::Copied => format!("{}.", self.name),
            Kind::Corpus => {
                let (dir, variant) = task_files::location(self.task);
                format!("{dir}/{variant}.")
            }
        }
    }
}

/// How the units of one task and variant compare with the official output.
#[derive(Default, Clone)]
pub(crate) struct Tally {
    /// Per [`Verdict::ALL`].
    pub(crate) verdicts: [usize; Verdict::ALL.len()],
    pub(crate) refused: usize,
}

#[derive(Default)]
pub(crate) struct Outcome {
    pub(crate) same: usize,
    pub(crate) written: usize,
    pub(crate) removed: usize,
    pub(crate) problems: usize,
    /// Official-output cases with no official file for any of the tasks.
    pub(crate) unmeasured: usize,
    pub(crate) tallies: BTreeMap<&'static str, Tally>,
    /// `<task>/<variant> <case>` and its verdict, `None` when refused, for the ratchet.
    pub(crate) parity: Vec<(String, Option<Verdict>)>,
    pub(crate) messages: Vec<String>,
    /// `verdict case file` per file of an official-output case, for [`crate::VERDICTS_VARIABLE`].
    pub(crate) verdicts: Vec<String>,
}

impl Outcome {
    pub(crate) fn add(&mut self, other: Self) {
        self.same += other.same;
        self.written += other.written;
        self.removed += other.removed;
        self.problems += other.problems;
        self.unmeasured += other.unmeasured;
        for (task, tally) in other.tallies {
            let total = self.tallies.entry(task).or_default();
            for (t, o) in total.verdicts.iter_mut().zip(tally.verdicts) {
                *t += o;
            }
            total.refused += tally.refused;
        }
        self.parity.extend(other.parity);
        self.messages.extend(other.messages);
        self.verdicts.extend(other.verdicts);
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
    corpus_actual: bool,
) -> Outcome {
    let mut outcome = Outcome::default();
    if let Some(p) = &result.panic {
        outcome.problem(case, &format!("panicked: {p}"));
        return outcome;
    }
    let mut produced = Vec::new();
    for s in snapshots {
        match result.outputs.iter().find(|(task, _)| *task == s.task) {
            Some((_, out)) => produce(s, case.kind, document, out, &mut produced),
            None if case.kind == Kind::HandWritten && s.implemented => {
                outcome.problem(case, &format!("{} did not run on this input", s.task));
            }
            None => {}
        }
    }
    let mut names = FxHashSet::default();
    for (name, _) in &produced {
        if !names.insert(name.as_str()) {
            outcome.problem(case, &format!("two outputs are named {name}"));
        }
    }
    let actual_dir = case.dir.join(ACTUAL_DIR);
    let written = match case.kind {
        Kind::HandWritten | Kind::Copied => write_actual(&actual_dir, &produced),
        // Other tasks' files in the unit's `actual/` are not this harness's to remove.
        Kind::Corpus if !corpus_actual => Ok(()),
        Kind::Corpus => snapshots
            .iter()
            .try_for_each(|s| write_owned(&actual_dir, &s.prefix(Kind::Corpus), &produced)),
    };
    if let Err(e) = written {
        outcome.problem(case, &e);
    }
    let expected_dir = case.dir.join(EXPECTED_DIR);
    let existing = match existing_snapshots(&expected_dir, case.kind, snapshots) {
        Ok(e) => e,
        Err(e) => {
            outcome.problem(case, &e);
            return outcome;
        }
    };
    match case.kind {
        Kind::HandWritten => {
            compare_snapshots(
                case,
                &expected_dir,
                &existing,
                &produced,
                update,
                &mut outcome,
            );
        }
        Kind::Copied | Kind::Corpus => compare_with_official(
            case,
            &expected_dir,
            &existing,
            &produced,
            snapshots,
            &mut outcome,
        ),
    }
    outcome
}

/// Each task the official tool has output for on this case, unless the case skips it.
fn compare_with_official(
    case: &Case,
    expected_dir: &Path,
    existing: &[String],
    produced: &[(String, String)],
    snapshots: &[Snapshot],
    outcome: &mut Outcome,
) {
    let mut measured = false;
    for s in snapshots {
        let prefix = s.prefix(case.kind);
        if case.skips(s.task) || !existing.iter().any(|e| e.starts_with(prefix.as_str())) {
            continue;
        }
        measured = true;
        let rows = match oracle::rows(expected_dir, &prefix, existing, produced) {
            Ok(r) => r,
            Err(e) => {
                outcome.problem(case, &e);
                continue;
            }
        };
        outcome.verdicts.extend(
            rows.iter()
                .map(|(extension, v)| format!("{} {} {prefix}{extension}", v.label(), case.name)),
        );
        let verdict = oracle::verdict(&rows);
        let tally = outcome.tallies.entry(s.task).or_default();
        match verdict {
            Some(v) => tally.verdicts[v as usize] += 1,
            None => tally.refused += 1,
        }
        if case.kind == Kind::Corpus {
            let (task, variant) = task_files::location(s.task);
            outcome
                .parity
                .push((format!("{task}/{variant} {}", case.name), verdict));
        }
    }
    if !measured {
        outcome.unmeasured += 1;
        outcome
            .verdicts
            .push(format!("unmeasured {} oracle", case.name));
    }
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

/// Makes the files under `actual` whose paths start with `prefix` (`<task>/<variant>.`) exactly
/// the `produced` files with that prefix, writing only changed files.
fn write_owned(actual: &Path, prefix: &str, produced: &[(String, String)]) -> Result<(), String> {
    let (task, start) = prefix
        .rsplit_once('/')
        .ok_or_else(|| format!("{prefix}: not `<task>/<variant>.`"))?;
    let dir = actual.join(task);
    let at = |e: std::io::Error| format!("{}: {e}", dir.display());
    let mine: Vec<(&str, &str)> = produced
        .iter()
        .filter(|(path, _)| path.starts_with(prefix))
        .map(|(path, text)| (&path[task.len() + 1..], text.as_str()))
        .collect();
    match std::fs::read_dir(&dir) {
        Ok(read) => {
            for entry in read {
                let entry = entry.map_err(at)?;
                let name = entry.file_name();
                let Some(name) = name.to_str() else { continue };
                if name.starts_with(start) && !mine.iter().any(|(n, _)| *n == name) {
                    std::fs::remove_file(entry.path()).map_err(at)?;
                }
            }
        }
        Err(e) if e.kind() == std::io::ErrorKind::NotFound && mine.is_empty() => return Ok(()),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
            std::fs::create_dir_all(&dir).map_err(at)?;
        }
        Err(e) => return Err(at(e)),
    }
    for (name, text) in &mine {
        let path = dir.join(name);
        if std::fs::read(&path).is_ok_and(|old| old == text.as_bytes()) {
            continue;
        }
        std::fs::write(&path, text).map_err(|e| format!("{}: {e}", path.display()))?;
    }
    // Fails while another variant's files are still there.
    drop(std::fs::remove_dir(&dir));
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
    kind: Kind,
    document: &Document,
    out: &TaskOutput,
    produced: &mut Vec<(String, String)>,
) {
    if kind == Kind::Corpus {
        let (dir, variant) = task_files::location(s.task);
        for (name, text) in task_files::files(variant, &document.text, out) {
            produced.push((format!("{dir}/{name}"), text.into_owned()));
        }
        return;
    }
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

/// The files in `expected/` that belong to one of the snapshots, as paths relative to it.
fn existing_snapshots(
    expected: &Path,
    kind: Kind,
    snapshots: &[Snapshot],
) -> Result<Vec<String>, String> {
    let mut names = Vec::new();
    for s in snapshots {
        let prefix = s.prefix(kind);
        let (dir, start) = prefix.rsplit_once('/').unwrap_or(("", prefix.as_str()));
        let directory = expected.join(dir);
        let read = match std::fs::read_dir(&directory) {
            Ok(r) => r,
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => continue,
            Err(e) => return Err(format!("{}: {e}", directory.display())),
        };
        for entry in read {
            let entry = entry.map_err(|e| format!("{}: {e}", directory.display()))?;
            let Ok(name) = entry.file_name().into_string() else {
                continue;
            };
            if name.starts_with(start) && !entry.path().is_dir() {
                names.push(if dir.is_empty() {
                    name
                } else {
                    format!("{dir}/{name}")
                });
            }
        }
    }
    names.sort_unstable();
    names.dedup();
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
mod tests {
    use std::path::{Path, PathBuf};

    use super::write_actual;

    fn scratch(name: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!(
            "rsvelte-test-harness-{}-{name}",
            std::process::id()
        ));
        drop(std::fs::remove_dir_all(&dir));
        dir
    }

    fn files(dir: &Path) -> Vec<(String, String)> {
        let mut out: Vec<_> = std::fs::read_dir(dir)
            .unwrap()
            .map(|e| {
                let e = e.unwrap();
                let name = e.file_name().into_string().unwrap();
                (name, std::fs::read_to_string(e.path()).unwrap())
            })
            .collect();
        out.sort();
        out
    }

    fn produced(files: &[(&str, &str)]) -> Vec<(String, String)> {
        files
            .iter()
            .map(|(n, t)| ((*n).to_owned(), (*t).to_owned()))
            .collect()
    }

    #[test]
    fn leaves_exactly_the_produced_files() {
        let dir = scratch("exact");
        std::fs::create_dir_all(dir.join("stale-dir")).unwrap();
        std::fs::write(dir.join("stale.js"), "old").unwrap();
        std::fs::write(dir.join("client.js"), "old").unwrap();
        write_actual(&dir, &produced(&[("client.js", "new"), ("server.js", "s")])).unwrap();
        assert_eq!(
            files(&dir),
            produced(&[("client.js", "new"), ("server.js", "s")])
        );
        std::fs::remove_dir_all(&dir).unwrap();
    }

    #[test]
    fn does_not_rewrite_an_unchanged_file() {
        let dir = scratch("unchanged");
        let same = produced(&[("client.js", "same")]);
        write_actual(&dir, &same).unwrap();
        let path = dir.join("client.js");
        let past = std::time::SystemTime::UNIX_EPOCH + std::time::Duration::from_secs(1);
        std::fs::File::options()
            .write(true)
            .open(&path)
            .unwrap()
            .set_modified(past)
            .unwrap();
        write_actual(&dir, &same).unwrap();
        assert_eq!(std::fs::metadata(&path).unwrap().modified().unwrap(), past);
        std::fs::remove_dir_all(&dir).unwrap();
    }

    #[test]
    fn removes_the_directory_when_nothing_is_produced() {
        let dir = scratch("empty");
        write_actual(&dir, &produced(&[("client.js", "x")])).unwrap();
        write_actual(&dir, &[]).unwrap();
        assert!(!dir.exists());
        write_actual(&dir, &[]).unwrap();
        assert!(!dir.exists());
    }
}
