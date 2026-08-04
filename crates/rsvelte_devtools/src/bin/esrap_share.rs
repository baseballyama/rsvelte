//! Measure what share of `compile()` the `rsvelte_esrap` printer occupies, per
//! call site, on real-world `.svelte` sources.
//!
//! Deterministic instrumentation only: `Instant` around each printer call site
//! (see `phase3_transform::profile`) and around every `compile()` call. No
//! sampling profiler — a share in the single-digit percent band cannot be
//! settled by comparing buckets of a short profile.
//!
//! Every share is a ratio taken inside one process run: numerator and
//! denominator see the same CPU contention, so a busy machine shifts both and
//! leaves the ratio usable. Runs are repeated and reported as a median with the
//! spread, never as min-of-N, which would report the least-contended run as if
//! it were the typical one.
//!
//! Usage: `esrap_share [--mode client|server|both] [--runs N] [glob-root ...]`

// Defined per-bin rather than once in the lib so that linking the `rsvelte_core`
// rlib never imposes an allocator on the consumer.
#[cfg(all(
    feature = "mimalloc-alloc",
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

#[cfg(all(
    feature = "jemalloc",
    not(feature = "mimalloc-alloc"),
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: tikv_jemallocator::Jemalloc = tikv_jemallocator::Jemalloc;

use std::fs;
use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};

use rsvelte_core::compiler::phases::phase3_transform::profile;
use rsvelte_core::{CompileOptions, GenerateMode};

/// One file's measured compile, with the printer cost broken out per site.
struct Sample {
    path: String,
    bytes: usize,
    total: Duration,
    client_split: Duration,
    client_map: Duration,
    client_plain: Duration,
    server_print: Duration,
    pipe_print: Duration,
    pipe_reparse: Duration,
    normalize_print: Duration,
    normalize_calls: u64,
}

impl Sample {
    fn client_total(&self) -> Duration {
        self.client_split + self.client_map + self.client_plain
    }

    /// Printer time only. `pipe_reparse` is the oxc re-parse on the other side
    /// of the same round-trip, so it is tracked but not counted as print cost.
    fn print_total(&self) -> Duration {
        self.client_total() + self.server_print + self.pipe_print + self.normalize_print
    }
}

/// The shares one run produced, in percent of that run's own compile time.
struct RunShare {
    client_split: f64,
    client_map: f64,
    client_plain: f64,
    client_all: f64,
    server_print: f64,
    pipe_print: f64,
    pipe_reparse: f64,
    server_all: f64,
    normalize: f64,
    all: f64,
    per_file_median: f64,
}

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let mut mode = String::from("both");
    let mut runs = 20usize;
    let mut roots: Vec<PathBuf> = Vec::new();
    let mut i = 0;
    while i < args.len() {
        match args[i].as_str() {
            "--mode" => {
                mode = args[i + 1].clone();
                i += 2;
            }
            "--runs" => {
                runs = args[i + 1].parse().expect("--runs takes a number");
                i += 2;
            }
            other => {
                roots.push(PathBuf::from(other));
                i += 1;
            }
        }
    }
    if roots.is_empty() {
        roots = default_roots();
    }

    let mut files = Vec::new();
    for root in &roots {
        collect_svelte_files(root, &mut files);
    }
    files.sort_by(|a: &(String, String), b| a.0.cmp(&b.0));
    if files.is_empty() {
        eprintln!("no .svelte files found under {roots:?}");
        std::process::exit(1);
    }
    let total_bytes: usize = files.iter().map(|(_, c)| c.len()).sum();
    println!(
        "Files: {}, Total: {} bytes, mode: {mode}, runs: {runs}\n",
        files.len(),
        total_bytes
    );

    let modes: Vec<GenerateMode> = match mode.as_str() {
        "client" => vec![GenerateMode::Client],
        "server" => vec![GenerateMode::Server],
        _ => vec![GenerateMode::Client, GenerateMode::Server],
    };

    // Warm caches and the allocator so run 1 is not measuring first-touch cost.
    for (_, content) in files.iter().take(200) {
        for m in &modes {
            let _ = rsvelte_core::compile(
                content,
                CompileOptions {
                    generate: *m,
                    ..Default::default()
                },
            );
        }
    }

    let mut run_shares = Vec::with_capacity(runs);
    for run in 1..=runs {
        let _ = profile::take_esrap_breakdown();
        let mut samples = Vec::with_capacity(files.len());
        for (path, content) in &files {
            let mut total = Duration::ZERO;
            let mut acc = profile::EsrapBreakdown::default();
            for m in &modes {
                let opts = CompileOptions {
                    generate: *m,
                    ..Default::default()
                };
                let _ = profile::take_esrap_breakdown();
                let start = Instant::now();
                let out = rsvelte_core::compile(content, opts);
                total += start.elapsed();
                let b = profile::take_esrap_breakdown();
                if out.is_err() {
                    // A failed compile has no printer cost to attribute.
                    continue;
                }
                acc.client_split += b.client_split;
                acc.client_map += b.client_map;
                acc.client_plain += b.client_plain;
                acc.server_print += b.server_print;
                acc.server_pipe_print += b.server_pipe_print;
                acc.server_pipe_reparse += b.server_pipe_reparse;
                acc.normalize_print += b.normalize_print;
                acc.normalize_calls += b.normalize_calls;
            }
            samples.push(Sample {
                path: path.clone(),
                bytes: content.len(),
                total,
                client_split: acc.client_split,
                client_map: acc.client_map,
                client_plain: acc.client_plain,
                server_print: acc.server_print,
                pipe_print: acc.server_pipe_print,
                pipe_reparse: acc.server_pipe_reparse,
                normalize_print: acc.normalize_print,
                normalize_calls: acc.normalize_calls,
            });
        }
        run_shares.push(run_share(&samples));
        println!("run {run:3}: {}", one_line(run_shares.last().unwrap()));
        // The per-file/per-bucket breakdown does not vary meaningfully between
        // runs, so print it once instead of `runs` times.
        if run == 1 {
            detail(&samples);
        }
    }
    summary(&run_shares);
}

fn run_share(samples: &[Sample]) -> RunShare {
    let sum = |f: fn(&Sample) -> Duration| -> Duration { samples.iter().map(f).sum() };
    let total = sum(|s| s.total).as_secs_f64();
    let pct = |d: Duration| d.as_secs_f64() / total * 100.0;

    let client_split = pct(sum(|s| s.client_split));
    let client_map = pct(sum(|s| s.client_map));
    let client_plain = pct(sum(|s| s.client_plain));
    let server_print = pct(sum(|s| s.server_print));
    let pipe_print = pct(sum(|s| s.pipe_print));
    let normalize = pct(sum(|s| s.normalize_print));

    let mut shares: Vec<f64> = samples
        .iter()
        .filter(|s| s.total > Duration::ZERO)
        .map(|s| s.print_total().as_secs_f64() / s.total.as_secs_f64() * 100.0)
        .collect();
    shares.sort_by(|a, b| a.partial_cmp(b).unwrap());

    RunShare {
        client_split,
        client_map,
        client_plain,
        client_all: client_split + client_map + client_plain,
        server_print,
        pipe_print,
        pipe_reparse: pct(sum(|s| s.pipe_reparse)),
        server_all: server_print + pipe_print,
        normalize,
        all: client_split + client_map + client_plain + server_print + pipe_print + normalize,
        per_file_median: shares[shares.len() / 2],
    }
}

fn one_line(r: &RunShare) -> String {
    format!(
        "client {:5.2}% (split {:5.2} / map {:5.2} / plain {:5.2})  server {:5.2}% (print {:5.2} / pipe {:5.2})  normalize {:5.2}%  ALL {:5.2}%",
        r.client_all,
        r.client_split,
        r.client_map,
        r.client_plain,
        r.server_all,
        r.server_print,
        r.pipe_print,
        r.normalize,
        r.all
    )
}

fn summary(runs: &[RunShare]) {
    println!("\n=== share of compile() across {} runs ===", runs.len());
    println!("site                              median      min      max       q1       q3");
    let row = |label: &str, f: fn(&RunShare) -> f64| {
        let mut v: Vec<f64> = runs.iter().map(f).collect();
        v.sort_by(|a, b| a.partial_cmp(b).unwrap());
        let q = |p: f64| v[((v.len() - 1) as f64 * p).round() as usize];
        println!(
            "{label:30} {:7.2}% {:7.2}% {:7.2}% {:7.2}% {:7.2}%",
            q(0.5),
            v[0],
            v[v.len() - 1],
            q(0.25),
            q(0.75)
        );
    };

    row("client print_split", |r| r.client_split);
    row("client print_with_map", |r| r.client_map);
    row("client print_with", |r| r.client_plain);
    row("CLIENT group", |r| r.client_all);
    row("server print", |r| r.server_print);
    row("server pipe print", |r| r.pipe_print);
    row("SERVER group", |r| r.server_all);
    row("normalize print", |r| r.normalize);
    row("TOTAL esrap print", |r| r.all);
    println!("--- not printer cost, tracked for context ---");
    row("server pipe reparse (oxc)", |r| r.pipe_reparse);
    row("per-file median share", |r| r.per_file_median);

    let mut all: Vec<f64> = runs.iter().map(|r| r.all).collect();
    all.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let median = all[all.len() / 2];
    println!(
        "\nTOTAL median {median:.2}% -> a printer 5x faster would cut compile() by {:.2}%",
        median * 0.8
    );
}

fn detail(samples: &[Sample]) {
    let ms = |d: Duration| d.as_secs_f64() * 1000.0;

    // Per-file distribution of the printer's share: the aggregate is dominated
    // by the largest files, so report the per-file spread too.
    let mut shares: Vec<f64> = samples
        .iter()
        .filter(|s| s.total > Duration::ZERO)
        .map(|s| s.print_total().as_secs_f64() / s.total.as_secs_f64() * 100.0)
        .collect();
    shares.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let q = |p: f64| shares[((shares.len() - 1) as f64 * p) as usize];
    let mean = shares.iter().sum::<f64>() / shares.len() as f64;
    let sd = (shares.iter().map(|s| (s - mean).powi(2)).sum::<f64>() / shares.len() as f64).sqrt();
    println!(
        "  per-file share: median {:5.2}%  mean {:5.2}%  sd {:5.2}  p10 {:5.2}%  p90 {:5.2}%  min {:5.2}%  max {:5.2}%",
        q(0.5),
        mean,
        sd,
        q(0.10),
        q(0.90),
        shares[0],
        shares[shares.len() - 1]
    );

    // Size buckets: a printer's share can grow with output size.
    for (label, lo, hi) in [
        ("small  (<2KB)", 0usize, 2048usize),
        ("medium (2-10KB)", 2048, 10240),
        ("large  (>10KB)", 10240, usize::MAX),
    ] {
        let bucket: Vec<&Sample> = samples
            .iter()
            .filter(|s| s.bytes >= lo && s.bytes < hi && s.total > Duration::ZERO)
            .collect();
        if bucket.is_empty() {
            continue;
        }
        let mut b: Vec<f64> = bucket
            .iter()
            .map(|s| s.print_total().as_secs_f64() / s.total.as_secs_f64() * 100.0)
            .collect();
        b.sort_by(|x, y| x.partial_cmp(y).unwrap());
        let bt: Duration = bucket.iter().map(|s| s.total).sum();
        let bp: Duration = bucket.iter().map(|s| s.print_total()).sum();
        println!(
            "  {label:16} n={:5}  aggregate {:5.2}%  median {:5.2}%",
            bucket.len(),
            bp.as_secs_f64() / bt.as_secs_f64() * 100.0,
            b[b.len() / 2]
        );
    }

    let norm_calls: u64 = samples.iter().map(|s| s.normalize_calls).sum();
    println!("  normalize_js_with_oxc slow-path calls: {norm_calls}");

    // Top offenders help tell "one pathological file" from a broad cost.
    let mut by_print: Vec<&Sample> = samples.iter().collect();
    by_print.sort_by_key(|s| std::cmp::Reverse(s.print_total()));
    println!("  top 5 files by absolute print time:");
    for s in by_print.iter().take(5) {
        println!(
            "    {:7.3}ms print / {:7.3}ms compile ({:5.2}%)  {} ({} B)",
            ms(s.print_total()),
            ms(s.total),
            s.print_total().as_secs_f64() / s.total.as_secs_f64() * 100.0,
            short(&s.path),
            s.bytes
        );
    }
    println!();
}

fn short(path: &str) -> String {
    match path.find("submodules/") {
        Some(i) => path[i + "submodules/".len()..].to_string(),
        None => path.to_string(),
    }
}

fn default_roots() -> Vec<PathBuf> {
    let base = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    [
        "bits-ui",
        "flowbite-svelte",
        "shadcn-svelte",
        "svelte-ux",
        "layerchart",
        "skeleton",
        "svelte.dev",
    ]
    .iter()
    .map(|p| base.join("submodules").join(p))
    .filter(|p| p.exists())
    .collect()
}

fn collect_svelte_files(dir: &Path, files: &mut Vec<(String, String)>) {
    let Ok(entries) = fs::read_dir(dir) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            // Vendored dependencies are not this project's real-world input.
            if path
                .file_name()
                .is_some_and(|n| n == "node_modules" || n == ".git")
            {
                continue;
            }
            collect_svelte_files(&path, files);
        } else if path.extension().is_some_and(|e| e == "svelte")
            && let Ok(content) = fs::read_to_string(&path)
        {
            files.push((path.display().to_string(), content));
        }
    }
}
