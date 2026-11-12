//! `rsvelte performance <dir>... [rounds=N] [every=N] [json=<file>]`: the deterministic performance
//! counters CI ratchets (`tools/performance`). `every=N` keeps every N-th document, in path order.
//!
//! Wall time moves with the machine, so what gates is what does not: every document task over the
//! population, serially, `rounds` times, and the allocations of the last round. On one thread the
//! sequence of allocations is a function of the input and the binary alone, so the counts repeat
//! exactly, per phase and in total.
//!
//! The last round runs with warm buffer pools: with the `metrics` feature, rounds go on until one
//! allocates what the one before it did. An arena keeps one chunk, so a document that outgrew it
//! grows it again in the next round, and whether it does depends on which arena the order of the
//! documents gave it; counting that round would count the order, not the work.
//!
//! Instructions are counted outside, by cachegrind, as the difference between a run with
//! `rounds=2` and one with `rounds=1`: one round after the first, whatever loading costs.
//! `rounds=0` only loads, so cachegrind counts loading with it; its counters are `UNMEASURED`.
//! That needs no `metrics` feature, so the instructions are the shipped build's; without the
//! feature the allocation fields are `UNMEASURED`. Nor does such a run wait for warm pools, so
//! its second round can still grow an arena and count the order of the documents.
//! UNMEASURED: how many instructions that is.
//!
//! A document whose task panicked loses its outputs, so the counters would measure less work and
//! look like an improvement: such a run reports the documents and fails.

use std::path::{Path, PathBuf};
use std::process::ExitCode;
use std::sync::Mutex;
use std::sync::atomic::AtomicUsize;
use std::sync::atomic::Ordering::Relaxed;

use rsvelte_kernel::computation::pipeline::{self, RunOptions, Sharing};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::performance::measurement;
use rsvelte_kernel::source::document::Document;

pub(crate) struct Options {
    rounds: usize,
    every: usize,
    json: Option<PathBuf>,
    pub(crate) tools: Vec<rsvelte_plugin_interface::Tool>,
}

impl Options {
    pub(crate) fn parse(arguments: &[&str]) -> Result<(Vec<PathBuf>, Self), String> {
        let mut o = Self {
            rounds: 2,
            every: 1,
            json: None,
            tools: Vec::new(),
        };
        let mut roots = Vec::new();
        for a in arguments {
            match a.split_once('=') {
                Some(("rounds", n)) => {
                    o.rounds = n
                        .parse()
                        .map_err(|e| format!("rounds={n}: expected a whole number: {e}"))?;
                }
                Some(("every", n)) => {
                    o.every = n
                        .parse()
                        .ok()
                        .filter(|n| *n > 0)
                        .ok_or_else(|| format!("every={n}: expected a whole number above 0"))?;
                }
                Some(("json", f)) => o.json = Some(PathBuf::from(f)),
                Some(_) => return Err(format!("unknown performance option {a}")),
                None => roots.push(PathBuf::from(a)),
            }
        }
        if roots.is_empty() {
            return Err("performance needs at least one directory".into());
        }
        Ok((roots, o))
    }
}

pub(crate) fn performance(
    reg: &Registry,
    roots: &[PathBuf],
    tasks: &[&str],
    options: &Options,
) -> ExitCode {
    let roots: Vec<&Path> = roots.iter().map(PathBuf::as_path).collect();
    let (mut docs, _, skipped) = match crate::load(reg, &roots) {
        Ok(loaded) => loaded,
        Err(error) => return crate::usage(&error),
    };
    if options.every > 1 {
        docs = docs.into_iter().step_by(options.every).collect();
    }
    if docs.is_empty() {
        eprintln!("rsvelte performance: no units below the given directories");
        return ExitCode::FAILURE;
    }
    let default_tasks = reg.document_task_identifiers();
    let tasks: &[&str] = if tasks.is_empty() {
        &default_tasks
    } else {
        tasks
    };
    let m = measure(reg, &docs, tasks, options.rounds);
    let report = report(&m, &docs, skipped, tasks, options);
    match &options.json {
        Some(path) => {
            if let Err(e) = std::fs::write(path, &report) {
                eprintln!("rsvelte performance: {}: {e}", path.display());
                return ExitCode::FAILURE;
            }
        }
        None => print!("{report}"),
    }
    if measurement::ENABLED && options.rounds > 0 && !m.warm {
        eprintln!(
            "rsvelte performance: the allocations still change after {} rounds",
            m.rounds
        );
        ExitCode::FAILURE
    } else if m.panicked.is_empty() {
        ExitCode::SUCCESS
    } else {
        for (path, message) in &m.panicked {
            eprintln!("rsvelte performance: panicked: {path}: {message}");
        }
        ExitCode::FAILURE
    }
}

/// Rounds after which pools that still grow fail the run; each grows only to the largest
/// document's need, so a run that reaches it allocates outside the documents' work.
const MOST_ROUNDS: usize = 8;

struct Measured {
    /// The rounds that ran, `rounds` or more.
    rounds: usize,
    /// Whether the last round allocated what the one before it did.
    warm: bool,
    totals: Option<measurement::GlobalMeasurements>,
    phases: Vec<measurement::PhaseMeasurements>,
    output_bytes: usize,
    diagnostics: usize,
    /// (document path, panic message) of the last round.
    panicked: Vec<(String, String)>,
}

/// At least `rounds` serial runs, and with counters until the pools are warm; the counters are the
/// last round's.
fn measure(reg: &Registry, docs: &[Document], tasks: &[&str], rounds: usize) -> Measured {
    let run = RunOptions {
        tasks,
        sharing: Sharing::Shared,
        threads: Some(1),
    };
    let mut totals: Option<measurement::GlobalMeasurements> = None;
    let mut counted = Counted::default();
    let (mut round, mut warm) = (0, false);
    while round < rounds || (measurement::ENABLED && rounds > 0 && !warm && round < MOST_ROUNDS) {
        round += 1;
        measurement::reset();
        measurement::track_global(true);
        let round_counted = Counted::default();
        // `main` has checked the task identifiers.
        pipeline::run_each(reg, docs, &run, &|i, result| round_counted.add(i, result))
            .expect("known task ids");
        measurement::track_global(false);
        let now = measurement::global();
        warm = totals.is_some_and(|before| {
            (before.allocations, before.bytes) == (now.allocations, now.bytes)
        });
        totals = Some(now);
        counted = round_counted;
    }
    let panicked = counted
        .panicked
        .into_inner()
        .expect("no panics under the lock")
        .into_iter()
        .map(|(i, message)| (docs[i].path.clone(), message))
        .collect();
    let mut phases = measurement::snapshot();
    phases.sort_unstable_by_key(|p| p.name);
    Measured {
        rounds: round,
        warm,
        totals,
        phases,
        output_bytes: counted.output_bytes.into_inner(),
        diagnostics: counted.diagnostics.into_inner(),
        panicked,
    }
}

/// What a round's results add up to, counted as each result arrives and then dropped, as
/// `rsvelte corpus` writes each one out: the peak is then the working set a user's run holds.
#[derive(Default)]
struct Counted {
    output_bytes: AtomicUsize,
    diagnostics: AtomicUsize,
    /// (document index, panic message); taken from the result, so a run without panics
    /// allocates nothing here.
    panicked: Mutex<Vec<(usize, String)>>,
}

impl Counted {
    fn add(&self, i: usize, mut result: pipeline::DocumentResult) {
        let outputs = result.outputs.iter().map(|(_, o)| o);
        let bytes = outputs.clone().flat_map(|o| &o.files).map(|f| f.text.len());
        self.output_bytes.fetch_add(bytes.sum(), Relaxed);
        let diagnostics = outputs.map(|o| o.diagnostics.len()).sum();
        self.diagnostics.fetch_add(diagnostics, Relaxed);
        if let Some(message) = result.panic.take() {
            let mut panicked = self.panicked.lock().expect("no panics under the lock");
            panicked.push((i, message));
        }
    }
}

fn report(
    m: &Measured,
    docs: &[Document],
    skipped: usize,
    tasks: &[&str],
    options: &Options,
) -> String {
    let mut w = StructuredDataWriter::new(true);
    w.begin_object()
        .key("rev")
        .write_string(env!("RSV_BUILD_REV"));
    super::write_tools(&options.tools, &mut w);
    w.key("metrics")
        .write_boolean(measurement::ENABLED)
        .key("rounds")
        .write_number(m.rounds)
        .key("documents")
        .write_number(docs.len())
        .key("skipped")
        .write_number(skipped)
        .key("source_bytes")
        .write_number(docs.iter().map(|d| d.text.len()).sum::<usize>())
        .key("output_bytes")
        .write_number(m.output_bytes)
        .key("diagnostics")
        .write_number(m.diagnostics)
        .key("panicked")
        .begin_array();
    for (path, message) in &m.panicked {
        w.begin_object()
            .key("path")
            .write_string(path)
            .key("panic")
            .write_string(message)
            .end_object();
    }
    w.end_array().key("tasks").begin_array();
    for t in tasks {
        w.write_string(t);
    }
    w.end_array();
    match m.totals.filter(|_| measurement::ENABLED) {
        Some(t) => {
            w.key("allocs")
                .write_number(t.allocations)
                .key("alloc_bytes")
                .write_number(t.bytes)
                .key("peak_live_growth_bytes")
                .write_number(t.peak_live_growth)
                .key("phases")
                .begin_object();
            for p in &m.phases {
                w.key(p.name)
                    .begin_object()
                    .key("calls")
                    .write_number(p.calls)
                    .key("allocs")
                    .write_number(p.self_allocations)
                    .key("alloc_bytes")
                    .write_number(p.self_bytes)
                    .end_object();
            }
            w.end_object();
        }
        None => {
            for k in ["allocs", "alloc_bytes", "peak_live_growth_bytes", "phases"] {
                w.key(k).write_string("UNMEASURED");
            }
        }
    }
    w.end_object();
    w.finish()
}

#[cfg(test)]
mod tests;
