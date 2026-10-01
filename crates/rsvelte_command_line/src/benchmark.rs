//! `rsvelte benchmark <dir>`: the pipeline's performance and memory, measured on a population of
//! units.
//!
//! Every arm runs the same documents and tasks; they differ in one mechanism each, so a difference
//! between two arms is what that mechanism buys:
//!
//! | arm | sharing | buffer pool | threads |
//! |---|---|---|---|
//! | `shared` | artifacts shared by a document's tasks | on | all |
//! | `isolated` | every task recomputes its artifacts | on | all |
//! | `nopool` | shared | offset | all |
//! | `serial` | shared | on | 1 |
//! | `streaming` | shared, each result dropped as soon as it is final | on | all |
//!
//! Every arm but `streaming` keeps all results until the run ends, as a caller collecting them
//! does.
//!
//! Timed rounds interleave the arms in ABBA order and report every round plus the median.
//! Allocation totals and peak live-heap growth come from a separate round per arm with process-wide
//! tracking on (its atomics would distort the timings); phases come from one more `shared` round.
//! Without the `metrics` feature those fields are `UNMEASURED`, never zero.

use std::path::{Path, PathBuf};
use std::process::ExitCode;
use std::time::Instant;

use rsvelte_kernel::computation::pipeline::{
    self, Document, DocumentResult, Registry, RunOptions, Sharing,
};
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::performance::measurement;

pub(crate) struct Options {
    rounds: usize,
    json: Option<PathBuf>,
}

impl Options {
    pub(crate) fn parse(arguments: &[&str]) -> Result<Self, String> {
        let mut o = Self {
            rounds: 5,
            json: None,
        };
        for a in arguments {
            match a.split_once('=') {
                Some(("rounds", n)) => {
                    o.rounds = n
                        .parse()
                        .ok()
                        .filter(|&n| n > 0)
                        .ok_or_else(|| format!("rounds={n}: expected a positive integer"))?;
                }
                Some(("json", f)) => o.json = Some(PathBuf::from(f)),
                _ => return Err(format!("unknown benchmark option {a}")),
            }
        }
        Ok(o)
    }
}

struct Arm {
    name: &'static str,
    sharing: Sharing,
    pool: bool,
    threads: Option<usize>,
    stream: bool,
}

const ARMS: [Arm; 5] = [
    Arm {
        name: "shared",
        sharing: Sharing::Shared,
        pool: true,
        threads: None,
        stream: false,
    },
    Arm {
        name: "isolated",
        sharing: Sharing::Isolated,
        pool: true,
        threads: None,
        stream: false,
    },
    Arm {
        name: "nopool",
        sharing: Sharing::Shared,
        pool: false,
        threads: None,
        stream: false,
    },
    Arm {
        name: "serial",
        sharing: Sharing::Shared,
        pool: true,
        threads: Some(1),
        stream: false,
    },
    Arm {
        name: "streaming",
        sharing: Sharing::Shared,
        pool: true,
        threads: None,
        stream: true,
    },
];

#[derive(Default)]
struct TaskCount {
    ran: usize,
    clean: usize,
    diagnostics: usize,
}

struct ArmResult {
    wall_ns: Vec<u64>,
    alloc: Option<measurement::GlobalMeasurements>,
}

fn run_arm(reg: &Registry, docs: &[Document], tasks: &[&str], arm: &Arm) -> Vec<DocumentResult> {
    rsvelte_kernel::performance::buffer_pool::set_enabled(arm.pool);
    let options = RunOptions {
        tasks,
        sharing: arm.sharing,
        threads: arm.threads,
    };
    // `main` has checked the task identifiers.
    if arm.stream {
        pipeline::run_each(reg, docs, &options, &|_, r| drop(r)).expect("known task ids");
        return Vec::new();
    }
    pipeline::run(reg, docs, &options).expect("known task ids")
}

fn timed(reg: &Registry, docs: &[Document], tasks: &[&str], arm: &Arm) -> u64 {
    let start = Instant::now();
    let results = run_arm(reg, docs, tasks, arm);
    let ns = start.elapsed().as_nanos() as u64;
    drop(results);
    ns
}

fn median(v: &[u64]) -> u64 {
    let mut s = v.to_vec();
    s.sort_unstable();
    s[s.len() / 2]
}

#[expect(
    clippy::too_many_lines,
    reason = "runs the arms, then writes the report in its schema's field order"
)]
#[expect(
    clippy::cast_precision_loss,
    reason = "nanosecond and byte counts become f64 only for display"
)]
pub(crate) fn benchmark(
    reg: &Registry,
    root: &Path,
    tasks: &[&str],
    options: &Options,
) -> ExitCode {
    let (docs, _, skipped) = crate::load(reg, &[root]);
    if docs.is_empty() {
        eprintln!("rsvelte benchmark: no units below {}", root.display());
        return ExitCode::FAILURE;
    }
    let default_tasks = reg.document_task_identifiers();
    let tasks: &[&str] = if tasks.is_empty() {
        &default_tasks
    } else {
        tasks
    };
    let bytes: usize = docs.iter().map(|d| d.text.len()).sum();

    let mut counts: Vec<(&str, TaskCount)> =
        tasks.iter().map(|t| (*t, TaskCount::default())).collect();
    let mut panicked: Vec<(&str, String)> = Vec::new();
    let mut output_bytes = 0usize;
    for (document, r) in docs.iter().zip(run_arm(reg, &docs, tasks, &ARMS[0])) {
        output_bytes += r
            .outputs
            .iter()
            .flat_map(|(_, o)| &o.files)
            .map(|f| f.text.len())
            .sum::<usize>();
        if let Some(p) = &r.panic {
            panicked.push((&document.path, p.clone()));
        }
        for (identifier, out) in &r.outputs {
            let c = &mut counts
                .iter_mut()
                .find(|(t, _)| t == identifier)
                .expect("only selected tasks run")
                .1;
            c.ran += 1;
            if out.diagnostics.is_empty() {
                c.clean += 1;
            } else {
                c.diagnostics += 1;
            }
        }
    }

    for arm in &ARMS {
        drop(run_arm(reg, &docs, tasks, arm));
    }
    let mut results: Vec<ArmResult> = ARMS
        .iter()
        .map(|_| ArmResult {
            wall_ns: Vec::new(),
            alloc: None,
        })
        .collect();
    for round in 0..options.rounds {
        let order: Vec<usize> = if round % 2 == 0 {
            (0..ARMS.len()).collect()
        } else {
            (0..ARMS.len()).rev().collect()
        };
        for i in order {
            let ns = timed(reg, &docs, tasks, &ARMS[i]);
            results[i].wall_ns.push(ns);
        }
    }
    if measurement::ENABLED {
        for (arm, r) in ARMS.iter().zip(&mut results) {
            measurement::track_global(true);
            drop(run_arm(reg, &docs, tasks, arm));
            measurement::track_global(false);
            r.alloc = Some(measurement::global());
        }
    }
    measurement::reset();
    drop(run_arm(reg, &docs, tasks, &ARMS[0]));
    let phases = measurement::snapshot();
    rsvelte_kernel::performance::buffer_pool::set_enabled(true);

    let mut w = StructuredDataWriter::new(true);
    w.begin_object()
        .key("build")
        .begin_object()
        .key("rev")
        .write_string(env!("RSV_BUILD_REV"))
        .key("profile")
        .write_string(if cfg!(debug_assertions) {
            "debug"
        } else {
            "release"
        })
        .key("metrics")
        .write_boolean(measurement::ENABLED)
        .end_object()
        .key("threads")
        .write_number(rayon::current_num_threads())
        .key("population")
        .begin_object()
        .key("root")
        .write_string(&root.to_string_lossy())
        .key("documents")
        .write_number(docs.len())
        .key("skipped")
        .write_number(skipped)
        .key("bytes")
        .write_number(bytes)
        .key("output_bytes")
        .write_number(output_bytes)
        .key("panicked")
        .begin_array();
    for (path, msg) in &panicked {
        w.begin_object()
            .key("path")
            .write_string(path)
            .key("panic")
            .write_string(msg)
            .end_object();
    }
    w.end_array().key("tasks").begin_object();
    for (identifier, c) in &counts {
        w.key(identifier)
            .begin_object()
            .key("ran")
            .write_number(c.ran)
            .key("clean")
            .write_number(c.clean)
            .key("diagnostics")
            .write_number(c.diagnostics)
            .end_object();
    }
    w.end_object()
        .end_object()
        .key("rounds")
        .write_number(options.rounds);
    w.key("arms").begin_array();
    for (arm, r) in ARMS.iter().zip(&results) {
        w.begin_object()
            .key("name")
            .write_string(arm.name)
            .key("wall_ms")
            .begin_array();
        for ns in &r.wall_ns {
            w.fixed(*ns as f64 / 1e6, 3);
        }
        w.end_array()
            .key("median_ms")
            .fixed(median(&r.wall_ns) as f64 / 1e6, 3);
        match r.alloc {
            Some(a) => {
                w.key("allocs")
                    .write_number(a.allocations)
                    .key("alloc_bytes")
                    .write_number(a.bytes)
                    .key("allocs_per_source_byte")
                    .fixed(a.allocations as f64 / bytes as f64, 3)
                    .key("peak_live_growth_bytes")
                    .write_number(a.peak_live_growth);
            }
            None => {
                for k in [
                    "allocs",
                    "alloc_bytes",
                    "allocs_per_source_byte",
                    "peak_live_growth_bytes",
                ] {
                    w.key(k).write_string("UNMEASURED");
                }
            }
        }
        w.end_object();
    }
    w.end_array().key("phases");
    if measurement::ENABLED {
        w.begin_array();
        for p in &phases {
            w.begin_object()
                .key("name")
                .write_string(p.name)
                .key("calls")
                .write_number(p.calls)
                .key("self_ms")
                .fixed(p.self_ns as f64 / 1e6, 3)
                .key("self_allocs")
                .write_number(p.self_allocations)
                .key("self_bytes")
                .write_number(p.self_bytes)
                .end_object();
        }
        w.end_array();
    } else {
        w.write_string("UNMEASURED");
    }
    w.key("max_rss_bytes");
    match max_rss_bytes() {
        Some(b) => w.write_number(b),
        None => w.write_string("UNMEASURED"),
    };
    w.end_object();
    let report = w.finish();

    eprintln!(
        "{} documents ({} bytes in, {output_bytes} bytes out, {skipped} skipped, \
         {} panicked), {} round(s), build {}",
        docs.len(),
        bytes,
        panicked.len(),
        options.rounds,
        env!("RSV_BUILD_REV")
    );
    for (path, msg) in &panicked {
        eprintln!("  panicked: {path}: {msg}");
    }
    for (identifier, c) in &counts {
        eprintln!(
            "  {identifier:<24} ran {:>6}  clean {:>6}  diagnostics {:>6}",
            c.ran, c.clean, c.diagnostics
        );
    }
    for (arm, r) in ARMS.iter().zip(&results) {
        let alloc = r.alloc.map_or_else(
            || "allocs UNMEASURED".to_owned(),
            |a| {
                format!(
                    "{} allocs ({:.2}/byte), peak live +{:.1} MB",
                    a.allocations,
                    a.allocations as f64 / bytes as f64,
                    a.peak_live_growth as f64 / 1e6
                )
            },
        );
        eprintln!(
            "  {:<9} median {:>9.2} ms  {alloc}",
            arm.name,
            median(&r.wall_ns) as f64 / 1e6
        );
    }
    match &options.json {
        Some(path) => {
            if let Err(e) = std::fs::write(path, &report) {
                eprintln!("rsvelte benchmark: {}: {e}", path.display());
                return ExitCode::FAILURE;
            }
        }
        None => print!("{report}"),
    }
    ExitCode::SUCCESS
}

/// The process high-water mark, which includes every arm run so far (it cannot be reset).
#[expect(
    unsafe_code,
    reason = "getrusage is the only source of the peak resident set size"
)]
fn max_rss_bytes() -> Option<u64> {
    // SAFETY: an all-zero rusage is valid, and getrusage only writes into it.
    let mut u: libc::rusage = unsafe { std::mem::zeroed() };
    // SAFETY: `u` is a valid, writable rusage.
    if unsafe { libc::getrusage(libc::RUSAGE_SELF, &raw mut u) } != 0 {
        return None;
    }
    let v = u64::try_from(u.ru_maxrss).ok()?;
    Some(if cfg!(target_os = "macos") {
        v
    } else {
        v * 1024
    })
}
