//! Throughput baseline over a deterministic slice of the collected corpus,
//! through the public `compile()` entry point the gates and the NAPI addon both
//! use. Reports a median over N runs so a change is judged against run-to-run
//! spread rather than one sample. `--threads N` runs the same slice on a rayon
//! pool of exactly N threads.

#[cfg(all(
    feature = "mimalloc-alloc",
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

use std::fs;
use std::path::PathBuf;
use std::time::Instant;

/// Process CPU time (user + system) plus the kernel counters that separate a
/// parallel arm's *added work* from its *wait*. Wall clock on a box running
/// other builds measured the same binary at 1172 ms and 2414 ms an hour apart,
/// so every verdict here is read off CPU time and wall clock is printed only as
/// context. Under `--threads`, CPU time that grows with the thread count is
/// contention rather than scheduling, and `minflt` / `nivcsw` say which.
#[derive(Clone, Copy, Default)]
struct Usage {
    cpu_ms: f64,
    sys_ms: f64,
    minflt: i64,
    majflt: i64,
    nvcsw: i64,
    nivcsw: i64,
}

impl std::ops::Sub for Usage {
    type Output = Usage;
    fn sub(self, r: Usage) -> Usage {
        Usage {
            cpu_ms: self.cpu_ms - r.cpu_ms,
            sys_ms: self.sys_ms - r.sys_ms,
            minflt: self.minflt - r.minflt,
            majflt: self.majflt - r.majflt,
            nvcsw: self.nvcsw - r.nvcsw,
            nivcsw: self.nivcsw - r.nivcsw,
        }
    }
}

fn usage() -> Usage {
    // SAFETY: `getrusage` writes the whole `rusage` it is handed and reads
    // nothing else; the zeroed value is a valid `rusage`.
    let u = unsafe {
        let mut u: libc::rusage = std::mem::zeroed();
        libc::getrusage(libc::RUSAGE_SELF, &mut u);
        u
    };
    let secs = |t: libc::timeval| t.tv_sec as f64 * 1000.0 + t.tv_usec as f64 / 1000.0;
    Usage {
        cpu_ms: secs(u.ru_utime) + secs(u.ru_stime),
        sys_ms: secs(u.ru_stime),
        minflt: u.ru_minflt as i64,
        majflt: u.ru_majflt as i64,
        nvcsw: u.ru_nvcsw as i64,
        nivcsw: u.ru_nivcsw as i64,
    }
}

use rsvelte_core::compiler::compile_without_ast;
use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// `--qos` names a Darwin QoS class, which has no counterpart elsewhere: Apple
/// confines a background-QoS thread to the efficiency cores, and Linux leaves
/// placement to the scheduler. The flag is rejected off Apple rather than
/// silently ignored, so an arm can never be labelled with a QoS it did not get.
#[cfg(target_vendor = "apple")]
mod qos {
    pub type Class = libc::qos_class_t;

    pub fn parse(name: &str) -> Class {
        match name {
            "interactive" => libc::qos_class_t::QOS_CLASS_USER_INTERACTIVE,
            "initiated" => libc::qos_class_t::QOS_CLASS_USER_INITIATED,
            "default" => libc::qos_class_t::QOS_CLASS_DEFAULT,
            "utility" => libc::qos_class_t::QOS_CLASS_UTILITY,
            // Apple silicon confines a background-QoS thread to the efficiency
            // cores, so this arm measures the P/E ratio for this workload —
            // which is what bounds a pool sized to the total core count.
            "background" => libc::qos_class_t::QOS_CLASS_BACKGROUND,
            other => panic!("unknown qos {other}"),
        }
    }

    /// Set the calling thread's QoS class.
    pub fn apply(class: Option<Class>) {
        if let Some(class) = class {
            // SAFETY: sets the QoS of the calling thread only; no arguments are borrowed.
            unsafe { libc::pthread_set_qos_class_self_np(class, 0) };
        }
    }
}

#[cfg(not(target_vendor = "apple"))]
mod qos {
    #[derive(Clone, Copy)]
    pub struct Class;

    pub fn parse(name: &str) -> Class {
        panic!("--qos {name} is Darwin-only; this target has no QoS classes");
    }

    pub fn apply(_class: Option<Class>) {}
}

fn main() {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    let manifest: serde_json::Value = serde_json::from_str(
        &fs::read_to_string(root.join("compatibility/manifest.json")).unwrap(),
    )
    .unwrap();

    let mut args = std::env::args().skip(1);
    let mut limit = 3000usize;
    let mut runs = 5usize;
    let mut target = "client".to_string();
    let mut no_ast = false;
    let mut no_sourcemap = false;
    // 0 = the plain sequential loop. Any other value builds a rayon pool of
    // exactly that size, so the scaling curve is measured rather than assumed.
    let mut threads = 0usize;
    // Longest-processing-time-first: rayon steals work, but it cannot start a
    // task that is still queued behind the whole slice, so the largest file
    // arriving last is a tail no amount of stealing recovers.
    let mut sort = false;
    // Offset into the id list before striding. With the same `--limit`, two runs
    // differing only in `--skip` select provably disjoint files, which is what a
    // held-out evaluation of a profile-guided build needs.
    let mut skip = 0usize;
    let mut dump_times: Option<String> = None;
    // macOS schedules a DEFAULT-QoS thread onto an efficiency core, so a rayon
    // pool sized to the core count can end up with two workers running at a
    // fraction of the others' speed. Naming the class makes that measurable.
    let mut qos: Option<String> = None;
    while let Some(a) = args.next() {
        match a.as_str() {
            "--limit" => limit = args.next().unwrap().parse().unwrap(),
            "--runs" => runs = args.next().unwrap().parse().unwrap(),
            "--target" => target = args.next().unwrap(),
            "--no-ast" => no_ast = true,
            "--no-sourcemap" => no_sourcemap = true,
            "--threads" => threads = args.next().unwrap().parse().unwrap(),
            "--sort" => sort = true,
            "--skip" => skip = args.next().unwrap().parse().unwrap(),
            "--dump-times" => dump_times = Some(args.next().unwrap()),
            "--qos" => qos = Some(args.next().unwrap()),
            other => panic!("unknown arg {other}"),
        }
    }

    let ids: Vec<String> = manifest
        .as_array()
        .unwrap()
        .iter()
        .filter(|e| e["kind"] == "component")
        .map(|e| e["id"].as_str().unwrap().to_string())
        .collect();

    // Deterministic even stride over the whole corpus, so the slice spans every
    // source repository rather than the first one alphabetically.
    let stride = (ids.len() / limit).max(1);
    let mut sources = Vec::new();
    let mut bytes = 0usize;
    for id in ids.iter().skip(skip).step_by(stride).take(limit) {
        if let Ok(s) = fs::read_to_string(root.join("compatibility/sources").join(id)) {
            bytes += s.len();
            sources.push(s);
        }
    }

    if sort {
        sources.sort_by_key(|s| std::cmp::Reverse(s.len()));
    }

    let (generate, dev) = match target.as_str() {
        "client" => (GenerateMode::Client, false),
        "server" => (GenerateMode::Server, false),
        "client-dev" => (GenerateMode::Client, true),
        "server-dev" => (GenerateMode::Server, true),
        other => panic!("unknown target {other}"),
    };
    let options = CompileOptions {
        generate,
        dev,
        enable_sourcemap: !no_sourcemap,
        ..Default::default()
    };

    // Every output the compile produced, not just the JS: a sink over `js.code`
    // alone reads as "the two arms did the same work" while saying nothing about
    // the maps, which is exactly what a source-map change moves.
    let one = |s: &String| -> Option<usize> {
        let compiled = if no_ast {
            compile_without_ast(s, options.clone())
        } else {
            compile(s, options.clone())
        };
        compiled.ok().map(|r| {
            r.js.code.len()
                + r.js.map.as_ref().map_or(0, String::len)
                + r.css
                    .as_ref()
                    .map_or(0, |c| c.code.len() + c.map.as_ref().map_or(0, String::len))
        })
    };

    let qos_class = qos.as_deref().map(qos::parse);
    qos::apply(qos_class);
    let pool = (threads > 0).then(|| {
        rayon::ThreadPoolBuilder::new()
            .num_threads(threads)
            .start_handler(move |_| qos::apply(qos_class))
            .build()
            .unwrap()
    });

    let mut ok = 0usize;
    let mut sink = 0usize;
    let mut timings = Vec::new();
    let mut cpu_timings = Vec::new();
    let mut usages = Vec::new();
    // (run, bytes, us). A parallel run's task-length vector is not reproducible
    // — a file's elapsed time depends on which other files happened to be
    // resident alongside it — so every run is kept and the caller checks
    // whether a conclusion holds across them.
    let mut per_file: Vec<(usize, usize, f64)> = Vec::new();
    for run in 0..runs + 1 {
        let u_start = usage();
        let start = Instant::now();
        let (run_ok, run_sink) = match &pool {
            Some(pool) => pool.install(|| {
                use rayon::prelude::*;
                // Under `--dump-times`, keep each file's own elapsed time. A
                // single-threaded task-length vector says nothing about the
                // parallel one if contention slows allocation-dense files more
                // than others, which is exactly the hypothesis being tested.
                let rows: Vec<(usize, f64, Option<usize>)> = sources
                    .par_iter()
                    .map(|s| {
                        let t0 = Instant::now();
                        let r = one(s);
                        (s.len(), t0.elapsed().as_secs_f64() * 1e6, r)
                    })
                    .collect();
                let mut o = 0usize;
                let mut k = 0usize;
                for (b, us, r) in rows {
                    if dump_times.is_some() {
                        per_file.push((run, b, us));
                    }
                    if let Some(len) = r {
                        o += 1;
                        k = k.wrapping_add(len);
                    }
                }
                (o, k)
            }),
            None => {
                let mut o = 0usize;
                let mut k = 0usize;
                for s in &sources {
                    let t0 = Instant::now();
                    let r = one(s);
                    if dump_times.is_some() {
                        per_file.push((run, s.len(), t0.elapsed().as_secs_f64() * 1e6));
                    }
                    if let Some(len) = r {
                        o += 1;
                        k = k.wrapping_add(len);
                    }
                }
                (o, k)
            }
        };
        ok = run_ok;
        sink = run_sink;
        let ms = start.elapsed().as_secs_f64() * 1000.0;
        let u = usage() - u_start;
        // First run is a warmup (page cache, allocator arenas).
        if run > 0 {
            timings.push(ms);
            cpu_timings.push(u.cpu_ms);
            usages.push(u);
        }
    }
    timings.sort_by(|a, b| a.partial_cmp(b).unwrap());
    cpu_timings.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let median = timings[timings.len() / 2];
    let cpu_median = cpu_timings[cpu_timings.len() / 2];
    let skip_tag = if skip > 0 {
        format!(" skip={skip}")
    } else {
        String::new()
    };
    let ast_tag = if no_ast { " no-ast" } else { "" };
    let map_tag = if no_sourcemap { " no-sourcemap" } else { "" };
    println!(
        "target={target}{skip_tag}{ast_tag}{map_tag} files={} ok={ok} bytes={bytes} \
         CPU_median={cpu_median:.1}ms CPU_min={:.1}ms \
         wall_median={median:.1}ms wall_min={:.1}ms MB/s={:.2} sink={sink}",
        sources.len(),
        cpu_timings[0],
        timings[0],
        (bytes as f64 / 1_048_576.0) / (cpu_median / 1000.0),
    );
    if let Some(path) = &dump_times {
        let mut out = String::from("run,bytes,us\n");
        for (run, b, us) in &per_file {
            let _ = std::fmt::Write::write_fmt(&mut out, format_args!("{run},{b},{us:.1}\n"));
        }
        fs::write(path, out).unwrap();
        eprintln!("wrote {} rows to {path}", per_file.len());
    }
    if threads > 0 {
        usages.sort_by(|a, b| a.cpu_ms.partial_cmp(&b.cpu_ms).unwrap());
        let u = usages[usages.len() / 2];
        println!(
            "  threads={threads} qos={} sort={sort} parallelism={:.2} sys_ms={:.1} \
             minflt={} majflt={} nvcsw={} nivcsw={}",
            qos.as_deref().unwrap_or("inherit"),
            cpu_median / median,
            u.sys_ms,
            u.minflt,
            u.majflt,
            u.nvcsw,
            u.nivcsw,
        );
    }
}
