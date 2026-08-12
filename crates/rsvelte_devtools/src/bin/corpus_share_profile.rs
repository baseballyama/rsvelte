//! Same-run time-share profile of `compile()` over the real-project corpora.
//!
//! Reports self and inclusive shares as a fraction of one run's samples, never
//! as absolute time, so the numbers survive a loaded machine. Every collected
//! file is compiled — slow files are not trimmed, because dropping them shifts
//! the share of whatever those files are structurally light on.
//!
//! `--calibrate` prints the inclusive share of the esrap printer, which is the
//! built-in positive control: it has to land near 12.3-12.4%.
//!
//! ```text
//! cargo run --profile profiling -p rsvelte_devtools --bin corpus_share_profile \
//!   --features pprof,mimalloc-alloc
//! ```

#[cfg(all(
    feature = "mimalloc-alloc",
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

use std::fs;
use std::path::{Path, PathBuf};

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// The shipped-source corpora, i.e. real `.svelte` files rather than fixtures.
const DEFAULT_CORPORA: &[&str] = &[
    "compatibility/sources",
    "submodules/flowbite-svelte",
    "submodules/bits-ui",
    "submodules/shadcn-svelte",
    "submodules/melt-ui",
    "submodules/layerchart",
    "submodules/svelte-ux",
    "submodules/skeleton",
    "submodules/svelte",
];

fn collect(dir: &Path, files: &mut Vec<String>) {
    let Ok(entries) = fs::read_dir(dir) else {
        return;
    };
    let mut paths: Vec<PathBuf> = entries.flatten().map(|e| e.path()).collect();
    paths.sort();
    for path in paths {
        if path.is_dir() {
            if path.file_name().is_some_and(|n| n == "node_modules") {
                continue;
            }
            collect(&path, files);
        } else if path.extension().is_some_and(|e| e == "svelte")
            && let Ok(content) = fs::read_to_string(&path)
        {
            files.push(content);
        }
    }
}

fn main() {
    let base = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    let mut dirs: Vec<PathBuf> = Vec::new();
    let mut iters = 1usize;
    let mut modes = vec![GenerateMode::Client, GenerateMode::Server];
    let mut top = 40usize;
    let args: Vec<String> = std::env::args().skip(1).collect();
    let mut i = 0;
    while i < args.len() {
        match args[i].as_str() {
            "--dir" => {
                i += 1;
                dirs.push(PathBuf::from(&args[i]));
            }
            "--iters" => {
                i += 1;
                iters = args[i].parse().expect("--iters");
            }
            "--top" => {
                i += 1;
                top = args[i].parse().expect("--top");
            }
            "--mode" => {
                i += 1;
                modes = match args[i].as_str() {
                    "client" => vec![GenerateMode::Client],
                    "server" => vec![GenerateMode::Server],
                    _ => vec![GenerateMode::Client, GenerateMode::Server],
                };
            }
            other => panic!("unknown argument: {other}"),
        }
        i += 1;
    }
    if dirs.is_empty() {
        dirs = DEFAULT_CORPORA.iter().map(|d| base.join(d)).collect();
    }

    let mut files = Vec::new();
    for dir in &dirs {
        collect(dir, &mut files);
    }
    assert!(!files.is_empty(), "no .svelte files under {dirs:?}");
    eprintln!(
        "[share] {} files x {} iters x {} mode(s)",
        files.len(),
        iters,
        modes.len()
    );

    #[cfg(feature = "pprof")]
    let guard = pprof::ProfilerGuardBuilder::default()
        .frequency(1000)
        .blocklist(&["libc", "libgcc", "pthread", "vdso"])
        .build()
        .expect("guard");

    let started = std::time::Instant::now();
    let mut sink = 0usize;
    for _ in 0..iters {
        for content in &files {
            for mode in &modes {
                if let Ok(r) = compile(
                    content,
                    CompileOptions {
                        generate: *mode,
                        ..Default::default()
                    },
                ) {
                    sink = sink.wrapping_add(r.js.code.len());
                }
            }
        }
    }
    eprintln!(
        "[share] sink={sink} workload wall time {:.2}s",
        started.elapsed().as_secs_f64()
    );
    #[cfg(feature = "pprof")]
    report_shares(&guard, files.len(), top);
    let _ = top;
}

/// Aggregate the in-process sampler into self / inclusive shares. Only usable
/// when the sampler actually keeps up — check the printed sample rate against
/// the workload wall time before trusting the shares.
#[cfg(feature = "pprof")]
fn report_shares(guard: &pprof::ProfilerGuard<'_>, file_count: usize, top: usize) {
    use std::collections::{HashMap, HashSet};

    let report = guard.report().build().expect("report");
    let mut incl: HashMap<String, isize> = HashMap::new();
    let mut selfc: HashMap<String, isize> = HashMap::new();
    let mut total: isize = 0;
    for (frames, count) in &report.data {
        total += *count;
        if let Some(first) = frames.frames.first().and_then(|f| f.first()) {
            *selfc.entry(format!("{first}")).or_insert(0) += *count;
        }
        let mut seen = HashSet::new();
        for frame in &frames.frames {
            for sym in frame {
                let n = format!("{sym}");
                if seen.insert(n.clone()) {
                    *incl.entry(n).or_insert(0) += *count;
                }
            }
        }
    }
    let denom = total.max(1) as f64;

    // Positive control: the printer's inclusive share is a known quantity.
    let printer: isize = incl
        .iter()
        .filter(|(n, _)| n.starts_with("rsvelte_esrap::print"))
        .map(|(_, c)| *c)
        .max()
        .unwrap_or(0);
    println!("total samples (denominator): {total}");
    println!("files: {file_count}");
    println!(
        "CALIBRATION rsvelte_esrap::print inclusive: {:.2}% (expected 12.3-12.4%)",
        100.0 * printer as f64 / denom
    );

    let mut sv: Vec<_> = selfc.into_iter().collect();
    sv.sort_by_key(|b| std::cmp::Reverse(b.1));
    let mut iv: Vec<_> = incl.into_iter().collect();
    iv.sort_by_key(|b| std::cmp::Reverse(b.1));

    println!("\nTOP SELF (share of {total} samples):");
    for (n, c) in sv.into_iter().take(top) {
        println!("  {:6.2}%  {:>8}  {n}", 100.0 * c as f64 / denom, c);
    }
    println!("\nTOP INCLUSIVE (share of {total} samples):");
    for (n, c) in iv.into_iter().take(top) {
        println!("  {:6.2}%  {:>8}  {n}", 100.0 * c as f64 / denom, c);
    }
}
