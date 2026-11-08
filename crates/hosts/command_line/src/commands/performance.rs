//! `rsvelte performance <dir>... [rounds=N] [json=<file>]`: the deterministic performance counters
//! CI ratchets (`tools/performance`).
//!
//! Wall time moves with the machine, so what gates is what does not: every document task over the
//! population, serially, `rounds` times, and the allocations of the last round, which runs with
//! warm buffer pools. On one thread the sequence of allocations is a function of the input and
//! the binary alone, so the counts repeat exactly, per phase and in total.
//!
//! Instructions are counted outside, by cachegrind, as the difference between a run with
//! `rounds=2` and one with `rounds=1`: exactly one warm round, whatever loading and warming cost.
//! `rounds=0` only loads, so cachegrind counts loading with it; its counters are `UNMEASURED`.
//! That needs no `metrics` feature, so the instructions are the shipped build's; without the
//! feature the allocation fields are `UNMEASURED`.
//!
//! A document whose task panicked loses its outputs, so the counters would measure less work and
//! look like an improvement: such a run reports the documents and fails.

use std::path::{Path, PathBuf};
use std::process::ExitCode;

use rsvelte_kernel::computation::pipeline::{self, Registry, RunOptions, Sharing};
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::performance::measurement;
use rsvelte_kernel::source::document::Document;

pub(crate) struct Options {
    rounds: usize,
    json: Option<PathBuf>,
    pub(crate) tools: Vec<rsvelte_plugin_interface::Tool>,
}

impl Options {
    pub(crate) fn parse(arguments: &[&str]) -> Result<(Vec<PathBuf>, Self), String> {
        let mut o = Self {
            rounds: 2,
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
    let (docs, _, skipped) = match crate::load(reg, &roots) {
        Ok(loaded) => loaded,
        Err(error) => return crate::usage(&error),
    };
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
    if m.panicked.is_empty() {
        ExitCode::SUCCESS
    } else {
        for (path, message) in &m.panicked {
            eprintln!("rsvelte performance: panicked: {path}: {message}");
        }
        ExitCode::FAILURE
    }
}

struct Measured {
    totals: Option<measurement::GlobalMeasurements>,
    phases: Vec<measurement::PhaseMeasurements>,
    output_bytes: usize,
    /// (document path, panic message) of the last round.
    panicked: Vec<(String, String)>,
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
    let mut panicked = Vec::new();
    for round in 0..rounds {
        let last = round + 1 == rounds;
        if last {
            measurement::reset();
            measurement::track_global(true);
        }
        // `main` has checked the task identifiers.
        let mut results = pipeline::run(reg, docs, &run).expect("known task ids");
        if last {
            output_bytes = results
                .iter()
                .flat_map(|r| &r.outputs)
                .flat_map(|(_, o)| &o.files)
                .map(|f| f.text.len())
                .sum();
            // Moved, not copied, while the counters run: a run without panics allocates nothing.
            let panics: Vec<(usize, String)> = results
                .iter_mut()
                .enumerate()
                .filter_map(|(i, r)| Some((i, r.panic.take()?)))
                .collect();
            drop(results);
            measurement::track_global(false);
            totals = Some(measurement::global());
            panicked = panics
                .into_iter()
                .map(|(i, message)| (docs[i].path.clone(), message))
                .collect();
        }
    }
    let mut phases = measurement::snapshot();
    phases.sort_unstable_by_key(|p| p.name);
    Measured {
        totals,
        phases,
        output_bytes,
        panicked,
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
    crate::write_tools(&options.tools, &mut w);
    w.key("metrics")
        .write_boolean(measurement::ENABLED)
        .key("rounds")
        .write_number(options.rounds)
        .key("documents")
        .write_number(docs.len())
        .key("skipped")
        .write_number(skipped)
        .key("source_bytes")
        .write_number(docs.iter().map(|d| d.text.len()).sum::<usize>())
        .key("output_bytes")
        .write_number(m.output_bytes)
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
mod tests {
    use rsvelte_kernel::computation::database::DocumentContext;
    use rsvelte_kernel::computation::pipeline::{Task, TaskOutput};

    use super::*;

    struct Panics;

    impl Task for Panics {
        fn identifier(&self) -> &'static str {
            "test.panics"
        }

        fn applies(&self, document: &Document) -> bool {
            document.path.starts_with("panics")
        }

        fn run(&self, _: &DocumentContext<'_>, _: &mut TaskOutput) {
            panic!("injected");
        }
    }

    #[test]
    fn a_panicking_document_is_reported_not_measured_as_less_work() {
        let mut reg = Registry::new();
        reg.task(Panics);
        let docs = [
            reg.document("fine.txt", "").expect("small"),
            reg.document("panics.txt", "").expect("small"),
        ];
        let m = measure(&reg, &docs, &["test.panics"], 1);
        assert_eq!(
            m.panicked,
            [("panics.txt".to_owned(), "injected".to_owned())]
        );
        let options = Options::parse(&["dir"]).expect("valid").1;
        let report = report(&m, &docs, 0, &["test.panics"], &options);
        assert!(report.contains(r#""path": "panics.txt""#), "{report}");
        assert!(report.contains(r#""panic": "injected""#), "{report}");
    }

    #[test]
    fn rounds_are_whole_numbers() {
        assert!(Options::parse(&["dir", "rounds=-1"]).is_err());
        assert_eq!(
            Options::parse(&["dir", "rounds=0"])
                .expect("valid")
                .1
                .rounds,
            0
        );
        assert_eq!(
            Options::parse(&["dir", "rounds=3"])
                .expect("valid")
                .1
                .rounds,
            3
        );
    }
}
