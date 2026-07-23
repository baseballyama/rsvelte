//! Benchmark runner for the `fmt` task.
//!
//! Mirrors `rsvelte_core`'s `benchmark_runner` (same CLI surface and JSON
//! output) but formats `.svelte` sources with [`rsvelte_formatter::format`]
//! instead of compiling them. It is a separate binary in `rsvelte_fmt`
//! because the formatter depends on `rsvelte_core`, so the compiler crate
//! cannot depend on the formatter without a cycle.
//!
//! Invoked by `scripts/bench/run-benchmark.mjs` under the `bench` profile —
//! the workspace `release` profile sets `panic = "abort"`, which would defeat
//! the `catch_unwind` guard below; `profile.bench` keeps release's
//! optimisation flags but uses `panic = "unwind"`:
//!
//! ```text
//! cargo run --profile=bench --bin fmt_benchmark_runner -- \
//!     --mode single|multi --files <list> --iterations N --warmup N
//! ```
//!
//! Output (stdout): `{"times": [<ms>, ...]}`.

use std::env;
use std::fs;
use std::io::{self, BufRead};
use std::panic::{AssertUnwindSafe, catch_unwind};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::Instant;

use rayon::prelude::*;
use rsvelte_formatter::{Arenas, FormatOptions, format, format_with_arenas};

/// Count of inputs the formatter panicked on across the whole run. A
/// benchmark over thousands of files must not be aborted by a single edge
/// case that makes the formatter panic, so each call is wrapped in
/// `catch_unwind` and failures are tallied here and reported once on stderr
/// rather than crashing the process. The current corpus formats panic-free;
/// this is a guard against regressions and out-of-corpus inputs.
static PANIC_COUNT: AtomicUsize = AtomicUsize::new(0);

#[derive(Debug)]
struct Config {
    mode: String,
    files_path: String,
    iterations: usize,
    warmup: usize,
    digest: bool,
}

fn parse_args() -> Result<Config, String> {
    let args: Vec<String> = env::args().collect();
    let mut mode = String::from("single");
    let mut files_path = String::new();
    let mut iterations = 5;
    let mut warmup = 2;
    let mut digest = false;

    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            // Correctness harness: format every file once and print an
            // aggregate content hash instead of timing. Used to prove a perf
            // change is byte-for-byte output-preserving (errors included).
            "--digest" => {
                digest = true;
            }
            "--mode" => {
                i += 1;
                if i < args.len() {
                    mode = args[i].clone();
                }
            }
            // Accepted and ignored: this runner only has one task. Keeping
            // the flag means `run-benchmark.mjs` can pass `--task fmt`
            // uniformly alongside the compiler runner.
            "--task" => {
                i += 1;
            }
            "--files" => {
                i += 1;
                if i < args.len() {
                    files_path = args[i].clone();
                }
            }
            "--iterations" => {
                i += 1;
                if i < args.len() {
                    match args[i].parse() {
                        Ok(n) => iterations = n,
                        Err(_) => eprintln!(
                            "warning: invalid --iterations value '{}', using default {}",
                            args[i], iterations
                        ),
                    }
                }
            }
            "--warmup" => {
                i += 1;
                if i < args.len() {
                    match args[i].parse() {
                        Ok(n) => warmup = n,
                        Err(_) => eprintln!(
                            "warning: invalid --warmup value '{}', using default {}",
                            args[i], warmup
                        ),
                    }
                }
            }
            _ => {}
        }
        i += 1;
    }

    if files_path.is_empty() {
        return Err("--files argument is required".to_string());
    }

    Ok(Config {
        mode,
        files_path,
        iterations,
        warmup,
        digest,
    })
}

/// FNV-1a 64-bit, fed incrementally so a whole run folds into one value.
/// Deterministic across builds/runs (fixed offset basis + prime), no dep.
fn fnv1a(bytes: &[u8], mut hash: u64) -> u64 {
    for &b in bytes {
        hash ^= b as u64;
        hash = hash.wrapping_mul(0x0000_0100_0000_01b3);
    }
    hash
}

/// Format every file once in list order and fold each outcome — the formatted
/// output, or the error text, or a panic marker — into a single hash. Any
/// change to any output, to which files error, or to an error's text moves the
/// digest, so an identical digest before/after a perf change proves it is
/// output-preserving.
fn run_digest(files: &[(String, String)], options: &FormatOptions) {
    let mut hash: u64 = 0xcbf2_9ce4_8422_2325;
    let (mut ok, mut err, mut panicked) = (0usize, 0usize, 0usize);
    for (path, content) in files {
        hash = fnv1a(path.as_bytes(), hash);
        hash = fnv1a(&[0], hash);
        match catch_unwind(AssertUnwindSafe(|| format(content, options))) {
            Ok(Ok(out)) => {
                ok += 1;
                hash = fnv1a(&[b'K'], hash);
                hash = fnv1a(out.as_bytes(), hash);
            }
            Ok(Err(e)) => {
                err += 1;
                hash = fnv1a(&[b'E'], hash);
                hash = fnv1a(e.to_string().as_bytes(), hash);
            }
            Err(_) => {
                panicked += 1;
                hash = fnv1a(&[b'P'], hash);
            }
        }
        hash = fnv1a(&[0], hash);
    }
    eprintln!(
        "digest over {} files: {} ok, {} error, {} panic",
        files.len(),
        ok,
        err,
        panicked
    );
    println!(
        "{{\"digest\": \"{hash:016x}\", \"ok\": {ok}, \"error\": {err}, \"panic\": {panicked}}}"
    );
}

fn load_files(files_path: &str) -> io::Result<Vec<(String, String)>> {
    let file = fs::File::open(files_path)?;
    let reader = io::BufReader::new(file);
    let mut files = Vec::new();

    for line in reader.lines() {
        let path = line?;
        if path.is_empty() {
            continue;
        }
        if let Ok(content) = fs::read_to_string(&path) {
            files.push((path, content));
        }
    }

    Ok(files)
}

fn format_file(source: &str, options: &FormatOptions, arenas: &mut Arenas) {
    // Ignore parse/format errors — some corpus inputs intentionally contain
    // syntax the formatter can't round-trip; the benchmark only times work,
    // not correctness (the compatibility report covers correctness).
    //
    // `catch_unwind` guards against the formatter panicking on an edge case:
    // the whole point of a benchmark is to time the corpus, not to assert
    // robustness, so a single bad file is tallied and skipped rather than
    // aborting the run. `AssertUnwindSafe` is needed because `FormatOptions`
    // holds an `Option<Arc<dyn Fn>>` (None here) which isn't `RefUnwindSafe`.
    let result = catch_unwind(AssertUnwindSafe(|| {
        format_with_arenas(source, options, arenas)
    }));
    if result.is_err() {
        PANIC_COUNT.fetch_add(1, Ordering::Relaxed);
    }
}

fn run_single_threaded(files: &[(String, String)], options: &FormatOptions) {
    // One arena reused across every file this thread formats.
    let mut arenas = Arenas::new();
    for (_path, content) in files {
        format_file(content, options, &mut arenas);
    }
}

fn run_multi_threaded(files: &[(String, String)], options: &FormatOptions) {
    files
        .par_iter()
        .for_each_init(Arenas::new, |arenas, (_path, content)| {
            format_file(content, options, arenas);
        });
}

fn main() {
    let config = match parse_args() {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    };

    let files = match load_files(&config.files_path) {
        Ok(f) => f,
        Err(e) => {
            eprintln!("Error loading files: {}", e);
            std::process::exit(1);
        }
    };

    eprintln!(
        "Loaded {} files, mode: {}, task: fmt, iterations: {}, warmup: {}",
        files.len(),
        config.mode,
        config.iterations,
        config.warmup
    );

    // Swallow the per-panic backtrace spam from `catch_unwind`; we report a
    // single aggregate count at the end instead.
    std::panic::set_hook(Box::new(|_| {}));

    let options = FormatOptions::default();

    if config.digest {
        run_digest(&files, &options);
        return;
    }

    let is_multi = config.mode == "multi";

    // Warmup
    for _ in 0..config.warmup {
        if is_multi {
            run_multi_threaded(&files, &options);
        } else {
            run_single_threaded(&files, &options);
        }
    }

    // Benchmark
    let mut times = Vec::with_capacity(config.iterations);
    for _ in 0..config.iterations {
        let start = Instant::now();
        if is_multi {
            run_multi_threaded(&files, &options);
        } else {
            run_single_threaded(&files, &options);
        }
        times.push(start.elapsed().as_secs_f64() * 1000.0);
    }

    let panics = PANIC_COUNT.load(Ordering::Relaxed);
    if panics > 0 {
        // Per-iteration count: PANIC_COUNT accumulates across every warmup +
        // measured pass, so divide back out to report distinct bad files.
        let passes = config.warmup + config.iterations;
        eprintln!(
            "note: formatter panicked on ~{} file(s) (skipped, not counted as work)",
            panics / passes.max(1)
        );
    }

    let times_json: Vec<String> = times.iter().map(|t| format!("{:.4}", t)).collect();
    println!("{{\"times\": [{}]}}", times_json.join(", "));
}
