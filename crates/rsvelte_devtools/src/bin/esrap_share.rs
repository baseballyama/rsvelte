//! Measure what share of `compile()` the `rsvelte_esrap` printer occupies, per
//! call site, on real-world `.svelte` sources.
//!
//! Deterministic instrumentation only: `Instant` around each printer call site
//! (see `phase3_transform::profile`) and around every `compile()` call. No
//! sampling profiler — a share in the single-digit percent band cannot be
//! settled by comparing buckets of a short profile.
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

/// One file's measured compile, with the printer cost broken out.
struct Sample {
    path: String,
    bytes: usize,
    total: Duration,
    client_print: Duration,
    server_print: Duration,
    pipe_print: Duration,
    pipe_reparse: Duration,
    normalize_print: Duration,
    normalize_calls: u64,
}

impl Sample {
    fn print_total(&self) -> Duration {
        self.client_print + self.server_print + self.pipe_print + self.normalize_print
    }
}

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let mut mode = String::from("both");
    let mut runs = 3usize;
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
                acc.client_print += b.client_print;
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
                client_print: acc.client_print,
                server_print: acc.server_print,
                pipe_print: acc.server_pipe_print,
                pipe_reparse: acc.server_pipe_reparse,
                normalize_print: acc.normalize_print,
                normalize_calls: acc.normalize_calls,
            });
        }
        report(run, &samples);
    }
}

fn report(run: usize, samples: &[Sample]) {
    let sum = |f: fn(&Sample) -> Duration| -> Duration { samples.iter().map(f).sum() };
    let total = sum(|s| s.total);
    let client = sum(|s| s.client_print);
    let server = sum(|s| s.server_print);
    let pipe_p = sum(|s| s.pipe_print);
    let pipe_r = sum(|s| s.pipe_reparse);
    let norm = sum(|s| s.normalize_print);
    let print_all = client + server + pipe_p + norm;

    let ms = |d: Duration| d.as_secs_f64() * 1000.0;
    let pct = |d: Duration| d.as_secs_f64() / total.as_secs_f64() * 100.0;

    println!("=== run {run}: aggregate (sum over files) ===");
    println!("compile total          {:9.2}ms", ms(total));
    println!(
        "  client print         {:9.2}ms ({:5.2}%)",
        ms(client),
        pct(client)
    );
    println!(
        "  server print         {:9.2}ms ({:5.2}%)",
        ms(server),
        pct(server)
    );
    println!(
        "  pipe print (async)   {:9.2}ms ({:5.2}%)",
        ms(pipe_p),
        pct(pipe_p)
    );
    println!(
        "  pipe reparse (async) {:9.2}ms ({:5.2}%)",
        ms(pipe_r),
        pct(pipe_r)
    );
    println!(
        "  normalize print      {:9.2}ms ({:5.2}%)",
        ms(norm),
        pct(norm)
    );
    println!(
        "  ALL esrap print      {:9.2}ms ({:5.2}%)",
        ms(print_all),
        pct(print_all)
    );
    println!(
        "  predicted compile-wide reduction at 5x print: {:5.2}%",
        pct(print_all) * 0.8
    );

    // A scheduling stall lands inside whichever timer is running, so a handful
    // of files can carry a double-digit share of the summed print time. Repeat
    // the aggregate without the slowest 1% of files to show how much of the
    // headline number is that artifact rather than printing.
    let mut by_total: Vec<&Sample> = samples.iter().collect();
    by_total.sort_by_key(|s| s.total);
    let keep = by_total.len() - by_total.len() / 100;
    let trimmed = &by_total[..keep];
    let t_total: Duration = trimmed.iter().map(|s| s.total).sum();
    let t_client: Duration = trimmed.iter().map(|s| s.client_print).sum();
    let t_server: Duration = trimmed.iter().map(|s| s.server_print).sum();
    let t_print: Duration = trimmed.iter().map(|s| s.print_total()).sum();
    let t_pct = |d: Duration| d.as_secs_f64() / t_total.as_secs_f64() * 100.0;
    println!(
        "  trimmed (slowest 1% of files dropped, n={keep}): client {:5.2}%  server {:5.2}%  ALL {:5.2}%  -> 5x gives {:5.2}%",
        t_pct(t_client),
        t_pct(t_server),
        t_pct(t_print),
        t_pct(t_print) * 0.8
    );

    // Per-file distribution of the printer's share: the aggregate above is
    // dominated by the largest files, so report the per-file spread too.
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
