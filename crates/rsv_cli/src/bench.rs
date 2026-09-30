//! `rsv bench <dir>`: the pipeline's performance and memory, measured on a population of units.
//!
//! Every arm runs the same documents and tasks; they differ in one mechanism each, so a difference
//! between two arms is what that mechanism buys:
//!
//! | arm | sharing | buffer pool | threads |
//! |---|---|---|---|
//! | `shared` | artifacts shared by a document's tasks | on | all |
//! | `isolated` | every task recomputes its artifacts | on | all |
//! | `nopool` | shared | off | all |
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

use rsv_kernel::json::JsonWriter;
use rsv_kernel::metrics;
use rsv_kernel::pipeline::{self, DocResult, Document, Registry, RunOptions, Sharing};

pub(crate) struct Options {
    rounds: usize,
    json: Option<PathBuf>,
}

impl Options {
    pub(crate) fn parse(args: &[&str]) -> Result<Self, String> {
        let mut o = Self {
            rounds: 5,
            json: None,
        };
        for a in args {
            match a.split_once('=') {
                Some(("rounds", n)) => {
                    o.rounds = n
                        .parse()
                        .ok()
                        .filter(|&n| n > 0)
                        .ok_or_else(|| format!("rounds={n}: expected a positive integer"))?;
                }
                Some(("json", f)) => o.json = Some(PathBuf::from(f)),
                _ => return Err(format!("unknown bench option {a}")),
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
    alloc: Option<metrics::GlobalStats>,
}

fn run_arm(reg: &Registry, docs: &[Document], tasks: &[&str], arm: &Arm) -> Vec<DocResult> {
    rsv_kernel::pool::set_enabled(arm.pool);
    let opts = RunOptions {
        tasks,
        sharing: arm.sharing,
        threads: arm.threads,
    };
    // `main` has checked the task ids.
    if arm.stream {
        pipeline::run_each(reg, docs, &opts, &|_, r| drop(r)).expect("known task ids");
        return Vec::new();
    }
    pipeline::run(reg, docs, &opts).expect("known task ids")
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
pub(crate) fn bench(reg: &Registry, root: &Path, tasks: &[&str], opts: &Options) -> ExitCode {
    let (docs, _, unclaimed) = crate::load(reg, &[root]);
    if docs.is_empty() {
        eprintln!("rsv bench: no units below {}", root.display());
        return ExitCode::FAILURE;
    }
    let default_tasks = reg.document_task_ids();
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
    for (doc, r) in docs.iter().zip(run_arm(reg, &docs, tasks, &ARMS[0])) {
        output_bytes += r
            .outputs
            .iter()
            .flat_map(|(_, o)| &o.files)
            .map(|f| f.text.len())
            .sum::<usize>();
        if let Some(p) = &r.panic {
            panicked.push((&doc.path, p.clone()));
        }
        for (id, out) in &r.outputs {
            let c = &mut counts
                .iter_mut()
                .find(|(t, _)| t == id)
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
    for round in 0..opts.rounds {
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
    if metrics::ENABLED {
        for (arm, r) in ARMS.iter().zip(&mut results) {
            metrics::track_global(true);
            drop(run_arm(reg, &docs, tasks, arm));
            metrics::track_global(false);
            r.alloc = Some(metrics::global());
        }
    }
    metrics::reset();
    drop(run_arm(reg, &docs, tasks, &ARMS[0]));
    let phases = metrics::snapshot();
    rsv_kernel::pool::set_enabled(true);

    let mut w = JsonWriter::new(true);
    w.begin_object()
        .key("build")
        .begin_object()
        .key("rev")
        .str(env!("RSV_BUILD_REV"))
        .key("profile")
        .str(if cfg!(debug_assertions) {
            "debug"
        } else {
            "release"
        })
        .key("metrics")
        .bool(metrics::ENABLED)
        .end_object()
        .key("threads")
        .num(rayon::current_num_threads())
        .key("population")
        .begin_object()
        .key("root")
        .str(&root.to_string_lossy())
        .key("documents")
        .num(docs.len())
        .key("unclaimed")
        .num(unclaimed)
        .key("bytes")
        .num(bytes)
        .key("output_bytes")
        .num(output_bytes)
        .key("panicked")
        .begin_array();
    for (path, msg) in &panicked {
        w.begin_object()
            .key("path")
            .str(path)
            .key("panic")
            .str(msg)
            .end_object();
    }
    w.end_array().key("tasks").begin_object();
    for (id, c) in &counts {
        w.key(id)
            .begin_object()
            .key("ran")
            .num(c.ran)
            .key("clean")
            .num(c.clean)
            .key("diagnostics")
            .num(c.diagnostics)
            .end_object();
    }
    w.end_object().end_object().key("rounds").num(opts.rounds);
    w.key("arms").begin_array();
    for (arm, r) in ARMS.iter().zip(&results) {
        w.begin_object()
            .key("name")
            .str(arm.name)
            .key("wall_ms")
            .begin_array();
        for ns in &r.wall_ns {
            w.num(format!("{:.3}", *ns as f64 / 1e6));
        }
        w.end_array()
            .key("median_ms")
            .num(format!("{:.3}", median(&r.wall_ns) as f64 / 1e6));
        match r.alloc {
            Some(a) => {
                w.key("allocs")
                    .num(a.allocs)
                    .key("alloc_bytes")
                    .num(a.bytes)
                    .key("allocs_per_source_byte")
                    .num(format!("{:.3}", a.allocs as f64 / bytes as f64))
                    .key("peak_live_growth_bytes")
                    .num(a.peak_live_growth);
            }
            None => {
                for k in [
                    "allocs",
                    "alloc_bytes",
                    "allocs_per_source_byte",
                    "peak_live_growth_bytes",
                ] {
                    w.key(k).str("UNMEASURED");
                }
            }
        }
        w.end_object();
    }
    w.end_array().key("phases");
    if metrics::ENABLED {
        w.begin_array();
        for p in &phases {
            w.begin_object()
                .key("name")
                .str(p.name)
                .key("calls")
                .num(p.calls)
                .key("self_ms")
                .num(format!("{:.3}", p.self_ns as f64 / 1e6))
                .key("self_allocs")
                .num(p.self_allocs)
                .key("self_bytes")
                .num(p.self_bytes)
                .end_object();
        }
        w.end_array();
    } else {
        w.str("UNMEASURED");
    }
    w.key("max_rss_bytes");
    match max_rss_bytes() {
        Some(b) => w.num(b),
        None => w.str("UNMEASURED"),
    };
    w.end_object();
    let report = w.finish();

    eprintln!(
        "{} documents ({} bytes in, {output_bytes} bytes out, {unclaimed} unclaimed, \
         {} panicked), {} round(s), build {}",
        docs.len(),
        bytes,
        panicked.len(),
        opts.rounds,
        env!("RSV_BUILD_REV")
    );
    for (path, msg) in &panicked {
        eprintln!("  panicked: {path}: {msg}");
    }
    for (id, c) in &counts {
        eprintln!(
            "  {id:<24} ran {:>6}  clean {:>6}  diagnostics {:>6}",
            c.ran, c.clean, c.diagnostics
        );
    }
    for (arm, r) in ARMS.iter().zip(&results) {
        let alloc = r.alloc.map_or_else(
            || "allocs UNMEASURED".to_owned(),
            |a| {
                format!(
                    "{} allocs ({:.2}/byte), peak live +{:.1} MB",
                    a.allocs,
                    a.allocs as f64 / bytes as f64,
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
    match &opts.json {
        Some(path) => {
            if let Err(e) = std::fs::write(path, &report) {
                eprintln!("rsv bench: {}: {e}", path.display());
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
