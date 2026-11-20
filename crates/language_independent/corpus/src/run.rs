//! The conformance run: every unit of a family, each read and parsed once, every task on it, each
//! output compared with the official one as soon as it is final, and the verdicts against the
//! parity ledger.

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::process::ExitCode;
use std::sync::Mutex;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::Instant;

use rsvelte_kernel::computation::pipeline::{DocumentResult, RunOptions, Sharing, run_each};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::performance::parallel;
use rsvelte_kernel::source::document::Document;

use crate::compare::{self, Ours, Verdict};
use crate::pack::{self, Entry, Pack};
use crate::sources::{self, Source};
use crate::{ledger, task_files};

/// Set to 1, records the verdicts in the ledger instead of failing on a move.
const UPDATE: &str = "UPDATE_EXPECT";
/// Set to 1, writes rsvelte's output to each source's `actual/`.
const ACTUAL: &str = "CORPUS_ACTUAL";
/// A substring: only units whose key holds it run.
const FILTER: &str = "CORPUS_FILTER";
/// A path: every move is written there, one per line.
const MOVES: &str = "CORPUS_MOVES";
/// Moves printed per task; the rest go to the `CORPUS_MOVES` file.
const PRINTED_MOVES: usize = 40;

/// The corpus test of one family: which official tasks are compared, and which rsvelte has.
#[derive(Debug)]
pub struct Conformance {
    family: &'static str,
    registry: Registry,
    compared: Vec<Compared>,
    also_run: Vec<&'static str>,
    out_of_scope: Option<&'static str>,
    /// The units [`Self::out_of_scope`]'s task reported.
    excluded: AtomicUsize,
    /// `(unit key, task)` for each official entry of a unit that no reader of the pack takes.
    stale: Mutex<Vec<(String, &'static str)>>,
}

#[derive(Debug)]
struct Compared {
    task: &'static str,
    /// A task in `readers.toml`: it compares one file of another task's official output.
    reader: bool,
}

/// One source's verdicts: (unit key, index into `compared`, verdict).
type Verdicts = Vec<(String, usize, Verdict)>;

impl Conformance {
    #[must_use]
    pub const fn new(family: &'static str, registry: Registry) -> Self {
        Self {
            family,
            registry,
            compared: Vec::new(),
            also_run: Vec::new(),
            out_of_scope: None,
            excluded: AtomicUsize::new(0),
            stale: Mutex::new(Vec::new()),
        }
    }

    /// Compares rsvelte's `task` (`<task>/<variant>`) with the official output.
    #[must_use]
    pub fn compare(mut self, task: &'static str) -> Self {
        self.compared.push(Compared {
            task,
            reader: false,
        });
        self
    }

    /// Compares the file that rsvelte's `task` writes with that file of another task's official
    /// output, as `corpus/_registry/readers.toml` names them, such as the compiler's
    /// `warnings.json`. A unit where the official tool reported an error is the other task's to
    /// judge; one without the file expects none.
    #[must_use]
    pub fn compare_file(mut self, task: &'static str) -> Self {
        self.compared.push(Compared { task, reader: true });
        self
    }

    /// Runs `task` on every unit without comparing it, for a task that checks an invariant.
    #[must_use]
    pub fn also_run(mut self, task: &'static str) -> Self {
        self.also_run.push(task);
        self
    }

    /// Runs `task` on every unit, and leaves out of every comparison each unit it reports a
    /// diagnostic for: a unit outside what rsvelte implements, such as a legacy component.
    #[must_use]
    pub const fn out_of_scope(mut self, task: &'static str) -> Self {
        self.out_of_scope = Some(task);
        self
    }

    /// Runs, prints a summary to stderr and fails when a verdict moved.
    #[must_use]
    pub fn run(self) -> ExitCode {
        if std::env::args().any(|a| a == "--list") {
            // libtest's listing, for runners such as nextest.
            #[expect(clippy::print_stdout, reason = "the listing protocol")]
            {
                println!("corpus: test");
            }
            return ExitCode::SUCCESS;
        }
        match self.measure() {
            Ok(true) => ExitCode::SUCCESS,
            Ok(false) => ExitCode::FAILURE,
            Err(e) => {
                eprintln!("corpus: {e}");
                ExitCode::FAILURE
            }
        }
    }

    fn measure(&self) -> Result<bool, String> {
        let flag = |name: &str| std::env::var(name).is_ok_and(|v| v == "1");
        let update = flag(UPDATE);
        let filter = std::env::var(FILTER).ok().filter(|f| !f.is_empty());
        if update && filter.is_some() {
            return Err(format!("{UPDATE} records the whole corpus; unset {FILTER}"));
        }
        let started = Instant::now();
        let root = PathBuf::from(sources::ROOT);
        let registry = sources::Registry::read(&root)?;
        if let Some(c) = self
            .compared
            .iter()
            .find(|c| c.reader && !registry.readers.contains_key(c.task))
        {
            return Err(format!("{} is not in readers.toml", c.task));
        }
        let mut sources = sources::sources(&root.join(self.family))?;
        // Largest first, so the last source to start is a small one.
        let size = |s: &Source| std::fs::metadata(s.dir.join("inputs.pack")).map_or(0, |m| m.len());
        sources.sort_by_cached_key(|s| std::cmp::Reverse(size(s)));
        let selected = |key: &str| filter.as_deref().is_none_or(|f| key.contains(f));
        let ran = parallel::map(&sources, |source| {
            self.source(source, &registry, &selected, flag(ACTUAL))
        });
        let mut verdicts: Vec<BTreeMap<String, Verdict>> =
            vec![BTreeMap::new(); self.compared.len()];
        let mut units = 0;
        for source in ran {
            let (count, found) = source?;
            units += count;
            for (key, task, verdict) in found {
                verdicts[task].insert(key, verdict);
            }
        }
        stale_entries(
            self.stale
                .lock()
                .unwrap_or_else(std::sync::PoisonError::into_inner)
                .as_mut_slice(),
        )?;
        eprintln!(
            "corpus {}: {units} units of {} sources in {:.2} s, {} out of scope",
            self.family,
            sources.len(),
            started.elapsed().as_secs_f64(),
            self.excluded.load(Ordering::Relaxed)
        );
        let mut moved = 0;
        let mut all_moves = String::new();
        for (compared, now) in self.compared.iter().zip(&verdicts) {
            summarize(compared.task, now);
            let file = ledger::file(&registry.dir, compared.task);
            let recorded = ledger::read(&file)?;
            let (steps, count) = ledger::moves(&recorded, now, selected, filter.is_none());
            for (i, step) in steps.iter().enumerate() {
                let line = format!(
                    "MOVED {} {:>11} -> {:<11} {}",
                    compared.task,
                    step.from.map_or("absent", Verdict::label),
                    step.to.map_or("absent", Verdict::label),
                    step.unit
                );
                if i < PRINTED_MOVES {
                    eprintln!("{line}");
                }
                all_moves.push_str(&line);
                all_moves.push('\n');
            }
            if steps.len() > PRINTED_MOVES {
                eprintln!(
                    "  … {} more; set {MOVES}=<file> for all",
                    steps.len() - PRINTED_MOVES
                );
            }
            if let Some((before, after)) = count {
                eprintln!("MOVED {} match count {before} -> {after}", compared.task);
            }
            let changed = !steps.is_empty() || count.is_some();
            if update && changed {
                let text = ledger::format(compared.task, &ledger::table(now));
                pack::write(&file, &text)?;
            } else if changed {
                moved += 1;
            }
        }
        if let Some(path) = std::env::var_os(MOVES) {
            std::fs::write(&path, all_moves)
                .map_err(|e| format!("{}: {e}", Path::new(&path).display()))?;
        }
        if moved > 0 {
            eprintln!(
                "{moved} task(s) moved from the ledger (corpus/_registry/parity/); to record: \
                 {UPDATE}=1 cargo test -p rsvelte_command_line --test corpus"
            );
        }
        Ok(moved == 0)
    }

    /// Runs one source and returns its unit count and verdicts.
    fn source(
        &self,
        source: &Source,
        registry: &sources::Registry,
        selected: &(dyn Fn(&str) -> bool + Sync),
        write_actual: bool,
    ) -> Result<(usize, Verdicts), String> {
        let inputs = source.inputs()?;
        let mut documents = Vec::with_capacity(inputs.len());
        for e in inputs.entries().filter(|e| selected(&source.key(e.path))) {
            let d = self
                .registry
                .document(e.path, e.body)
                .map_err(|err| format!("{}: {err:?}", source.key(e.path)))?;
            documents.push(d);
        }
        let expected: Vec<Pack> = self
            .compared
            .iter()
            .map(|c| source.expected(reader_of(c, registry).map_or(c.task, |r| &r.pack)))
            .collect::<Result<_, _>>()?;
        let tasks: Vec<&str> = self
            .compared
            .iter()
            .map(|c| c.task)
            .chain(self.also_run.iter().copied())
            .chain(self.out_of_scope)
            .collect();
        let options = RunOptions {
            tasks: &tasks,
            sharing: Sharing::Shared,
            threads: None,
        };
        let found = Mutex::new(Ok(Vec::new()));
        let actual = Mutex::new(vec![Vec::new(); self.compared.len()]);
        let sink = |i: usize, result: DocumentResult| {
            let document = &documents[i];
            if let Some(message) = &result.panic {
                eprintln!("panicked: {}: {message}", source.key(&document.path));
            }
            let judged = self.judge(source, document, &result, &expected, registry);
            let mut found = found
                .lock()
                .unwrap_or_else(std::sync::PoisonError::into_inner);
            match (judged, &mut *found) {
                (Ok(v), Ok(all)) => all.extend(v),
                (Err(e), all @ Ok(_)) => *all = Err(e),
                (_, Err(_)) => {}
            }
            drop(found);
            if write_actual {
                let mut actual = actual
                    .lock()
                    .unwrap_or_else(std::sync::PoisonError::into_inner);
                for (c, files) in self.compared.iter().zip(actual.iter_mut()) {
                    let Some((_, out)) = result.outputs.iter().find(|(t, _)| *t == c.task) else {
                        continue;
                    };
                    let (_, variant) = task_files::location(c.task);
                    for (name, text) in task_files::files(variant, &document.text, out) {
                        let name = name[variant.len() + 1..].to_owned();
                        files.push((document.path.clone(), name, text.into_owned()));
                    }
                }
            }
        };
        run_each(&self.registry, &documents, &options, &sink).map_err(|e| e.to_string())?;
        if write_actual {
            let actual = actual
                .into_inner()
                .unwrap_or_else(std::sync::PoisonError::into_inner);
            for (c, files) in self.compared.iter().zip(&actual) {
                let text = pack::format(files.iter().map(|(path, name, body)| Entry {
                    path,
                    attributes: name,
                    body,
                }));
                pack::write(&source.pack("actual", c.task), &text)?;
            }
        }
        let found = found
            .into_inner()
            .unwrap_or_else(std::sync::PoisonError::into_inner)?;
        Ok((documents.len(), found))
    }

    /// The verdict of each compared task on one unit.
    fn judge(
        &self,
        source: &Source,
        document: &Document,
        result: &DocumentResult,
        expected: &[Pack],
        registry: &sources::Registry,
    ) -> Result<Verdicts, String> {
        let key = source.key(&document.path);
        let table = registry.units.get(&key);
        for (i, c) in self.compared.iter().enumerate() {
            // Regen writes nothing for a unit no reader of the pack takes.
            if !c.reader
                && table.is_some_and(|t| registry.skips_every_reader(t, c.task))
                && expected[i].find(&document.path).next().is_some()
            {
                self.stale
                    .lock()
                    .unwrap_or_else(std::sync::PoisonError::into_inner)
                    .push((key.clone(), c.task));
            }
        }
        let excluded = self.out_of_scope.is_some_and(|task| {
            result
                .outputs
                .iter()
                .any(|(t, out)| *t == task && !out.diagnostics.is_empty())
        });
        if excluded {
            self.excluded.fetch_add(1, Ordering::Relaxed);
            return Ok(Vec::new());
        }
        let mut out = Vec::new();
        for (i, c) in self.compared.iter().enumerate() {
            if table.is_some_and(|t| t.skips(c.task)) {
                continue;
            }
            let official: Vec<Entry<'_>> = expected[i].find(&document.path).collect();
            let ours = result.outputs.iter().find(|(t, _)| *t == c.task);
            if let Some(file) = reader_of(c, registry).map(|r| r.file.as_str()) {
                if official.is_empty()
                    || official.iter().any(|e| e.attributes.starts_with("error."))
                {
                    continue;
                }
                let verdict = if result.panic.is_some() {
                    Verdict::Panicked
                } else {
                    let official = official.iter().find(|e| e.attributes == file);
                    compare::file_verdict(official, ours.map(|(_, out)| out), file)
                        .map_err(|e| format!("{key}: {e}"))?
                };
                out.push((key.clone(), i, verdict));
                continue;
            }
            let verdict = if result.panic.is_some() {
                // A unit the task has no official output for is not the task's to judge.
                (!official.is_empty()).then_some(Verdict::Panicked)
            } else {
                let ours = ours.map(|(_, out)| Ours {
                    output: out,
                    diagnostics: (!out.diagnostics.is_empty())
                        .then(|| task_files::diagnostics_json(&document.text, out)),
                });
                compare::verdict(&official, ours.as_ref())
                    .map_err(|e| format!("{}: {e}", source.key(&document.path)))?
            };
            if let Some(v) = verdict {
                out.push((key.clone(), i, v));
            }
        }
        Ok(out)
    }
}

/// The pack and file a reader task compares; `None` for a task with a pack of its own.
fn reader_of<'r>(c: &Compared, registry: &'r sources::Registry) -> Option<&'r sources::Reader> {
    if c.reader {
        registry.readers.get(c.task)
    } else {
        None
    }
}

/// Fails with a regen command for each of the first `stale` entries.
fn stale_entries(stale: &mut [(String, &str)]) -> Result<(), String> {
    if stale.is_empty() {
        return Ok(());
    }
    stale.sort_unstable();
    let mut lines = vec![format!(
        "{} expected entries belong to units that units.toml skips for every task reading the \
         pack; remove them with:",
        stale.len()
    )];
    lines.extend(stale.iter().take(PRINTED_MOVES).map(|(key, task)| {
        let (name, _) = task_files::location(task);
        format!("  mise exec -- node tools/oracle/oracle.ts regen --task {name} --path '{key}'")
    }));
    if stale.len() > PRINTED_MOVES {
        lines.push(format!("  … {} more", stale.len() - PRINTED_MOVES));
    }
    Err(lines.join("\n"))
}

/// One task's counts, and how many of the units both sides have output for match.
fn summarize(task: &str, now: &BTreeMap<String, Verdict>) {
    let mut counts = [0usize; Verdict::ALL.len()];
    for v in now.values() {
        counts[Verdict::ALL
            .iter()
            .position(|a| a == v)
            .expect("every verdict is listed")] += 1;
    }
    let parts: Vec<String> = Verdict::ALL
        .iter()
        .zip(counts)
        .filter(|(_, n)| *n > 0)
        .map(|(v, n)| format!("{n} {}", v.label()))
        .collect();
    let matched = counts[Verdict::ALL.len() - 1];
    #[expect(
        clippy::cast_precision_loss,
        reason = "a percentage of a count far below 2^52"
    )]
    let rate = if now.is_empty() {
        0.0
    } else {
        100.0 * matched as f64 / now.len() as f64
    };
    eprintln!(
        "  {task}: {} units, {rate:.1}% match ({})",
        now.len(),
        parts.join(", ")
    );
}

#[cfg(test)]
mod tests;
