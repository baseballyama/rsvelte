//! `rsv perf <dir>... [rounds=N] [json=<file>]`: the deterministic performance counters CI ratchets
//! (`tools/perf`).
//!
//! Wall time moves with the machine, so what gates is what does not: every document task over the
//! population, serially, `rounds` times, and the allocations of the last round, which runs with
//! warm buffer pools. On one thread the sequence of allocations is a function of the input and
//! the binary alone, so the counts repeat exactly, per phase and in total.
//!
//! Instructions are counted outside, by cachegrind, as the difference between a run with
//! `rounds=2` and one with `rounds=1`: exactly one warm round, whatever loading and warming cost.
//! That needs no `metrics` feature, so the instructions are the shipped build's; without the
//! feature the allocation fields are `UNMEASURED`.

use std::path::{Path, PathBuf};
use std::process::ExitCode;

use rsv_kernel::json::JsonWriter;
use rsv_kernel::metrics;
use rsv_kernel::pipeline::{self, Document, Registry, RunOptions, Sharing};

pub(crate) struct Options {
    rounds: usize,
    json: Option<PathBuf>,
}

impl Options {
    pub(crate) fn parse(args: &[&str]) -> Result<(Vec<PathBuf>, Self), String> {
        let mut o = Self {
            rounds: 2,
            json: None,
        };
        let mut roots = Vec::new();
        for a in args {
            match a.split_once('=') {
                Some(("rounds", n)) => {
                    o.rounds = n.parse().map_err(|e| format!("rounds={n}: {e}"))?;
                }
                Some(("json", f)) => o.json = Some(PathBuf::from(f)),
                Some(_) => return Err(format!("unknown perf option {a}")),
                None => roots.push(PathBuf::from(a)),
            }
        }
        if roots.is_empty() {
            return Err("perf needs at least one directory".into());
        }
        Ok((roots, o))
    }
}

pub(crate) fn perf(reg: &Registry, roots: &[PathBuf], tasks: &[&str], opts: &Options) -> ExitCode {
    let roots: Vec<&Path> = roots.iter().map(PathBuf::as_path).collect();
    let (docs, _, unclaimed) = crate::load(reg, &roots);
    if docs.is_empty() {
        eprintln!("rsv perf: no units below the given directories");
        return ExitCode::FAILURE;
    }
    let default_tasks = reg.document_task_ids();
    let tasks: &[&str] = if tasks.is_empty() {
        &default_tasks
    } else {
        tasks
    };
    let m = measure(reg, &docs, tasks, opts.rounds);
    let report = report(&m, &docs, unclaimed, tasks, opts.rounds);
    match &opts.json {
        Some(path) => {
            if let Err(e) = std::fs::write(path, &report) {
                eprintln!("rsv perf: {}: {e}", path.display());
                return ExitCode::FAILURE;
            }
        }
        None => print!("{report}"),
    }
    ExitCode::SUCCESS
}

struct Measured {
    totals: Option<metrics::GlobalStats>,
    phases: Vec<metrics::PhaseStats>,
    output_bytes: usize,
}

/// `rounds` serial runs; the counters are the last round's.
fn measure(reg: &Registry, docs: &[Document], tasks: &[&str], rounds: usize) -> Measured {
    let run = RunOptions {
        tasks,
        sharing: Sharing::Shared,
        threads: Some(1),
    };
    let mut totals = None;
    let mut output_bytes = 0usize;
    for round in 0..rounds {
        let last = round + 1 == rounds;
        if last {
            metrics::reset();
            metrics::track_global(true);
        }
        // `main` has checked the task ids.
        let results = pipeline::run(reg, docs, &run).expect("known task ids");
        if last {
            output_bytes = results
                .iter()
                .flat_map(|r| &r.outputs)
                .flat_map(|(_, o)| &o.files)
                .map(|f| f.text.len())
                .sum();
            drop(results);
            metrics::track_global(false);
            totals = Some(metrics::global());
        }
    }
    let mut phases = metrics::snapshot();
    phases.sort_unstable_by_key(|p| p.name);
    Measured {
        totals,
        phases,
        output_bytes,
    }
}

fn report(
    m: &Measured,
    docs: &[Document],
    unclaimed: usize,
    tasks: &[&str],
    rounds: usize,
) -> String {
    let mut w = JsonWriter::new(true);
    w.begin_object()
        .key("rev")
        .str(env!("RSV_BUILD_REV"))
        .key("metrics")
        .bool(metrics::ENABLED)
        .key("rounds")
        .num(rounds)
        .key("documents")
        .num(docs.len())
        .key("unclaimed")
        .num(unclaimed)
        .key("source_bytes")
        .num(docs.iter().map(|d| d.text.len()).sum::<usize>())
        .key("output_bytes")
        .num(m.output_bytes)
        .key("tasks")
        .begin_array();
    for t in tasks {
        w.str(t);
    }
    w.end_array();
    match m.totals.filter(|_| metrics::ENABLED) {
        Some(t) => {
            w.key("allocs")
                .num(t.allocs)
                .key("alloc_bytes")
                .num(t.bytes)
                .key("peak_live_growth_bytes")
                .num(t.peak_live_growth)
                .key("phases")
                .begin_object();
            for p in &m.phases {
                w.key(p.name)
                    .begin_object()
                    .key("calls")
                    .num(p.calls)
                    .key("allocs")
                    .num(p.self_allocs)
                    .key("alloc_bytes")
                    .num(p.self_bytes)
                    .end_object();
            }
            w.end_object();
        }
        None => {
            for k in ["allocs", "alloc_bytes", "peak_live_growth_bytes", "phases"] {
                w.key(k).str("UNMEASURED");
            }
        }
    }
    w.end_object();
    w.finish()
}
