//! Benchmark runner for the `lint` task.
//!
//! Mirrors `rsvelte_fmt`'s `fmt_benchmark_runner` (same CLI surface and JSON
//! output) but lints `.svelte` sources with [`rsvelte_lint::lint_source`].
//!
//! `--config` takes the same JSON config the `rsvelte-lint` CLI accepts, so
//! `scripts/bench/run-benchmark.mjs` can enable exactly the rule universe the
//! `ESLint` baseline runs — a lint benchmark is only meaningful when both sides
//! evaluate the same rules.
//!
//! Invoked under the `bench` profile (`panic = "unwind"`) so the per-file
//! `catch_unwind` below actually isolates a panic instead of aborting the run:
//!
//! ```text
//! cargo run --profile=bench --bin lint_benchmark_runner -- \
//!     --mode single|multi --files <list> --config <json> --iterations N --warmup N
//! ```
//!
//! Output (stdout): `{"times": [<ms>, ...]}`.

use std::env;
use std::fs;
use std::io::{self, BufRead};
use std::panic::{AssertUnwindSafe, catch_unwind};
use std::path::Path;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::Instant;

use rayon::prelude::*;
use rsvelte_core::CompileOptions;
use rsvelte_lint::{LintConfig, lint_source};

/// Files the linter panicked on across the whole run, reported once at the end
/// rather than aborting a multi-thousand-file benchmark.
static PANIC_COUNT: AtomicUsize = AtomicUsize::new(0);

struct Config {
    mode: String,
    files_path: String,
    config_path: String,
    iterations: usize,
    warmup: usize,
    list_rules: bool,
}

fn parse_args() -> Result<Config, String> {
    let args: Vec<String> = env::args().collect();
    let mut mode = String::from("single");
    let mut files_path = String::new();
    let mut config_path = String::new();
    let mut iterations = 5;
    let mut warmup = 2;
    let mut list_rules = false;

    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            // Same output as `rsvelte-lint --list-rules`, so the benchmark can
            // derive the shared rule universe without also building the CLI.
            "--list-rules" => {
                list_rules = true;
            }
            "--mode" => {
                i += 1;
                if i < args.len() {
                    mode = args[i].clone();
                }
            }
            // Accepted and ignored: this runner only has one task, but keeping
            // the flag lets `run-benchmark.mjs` pass `--task lint` uniformly.
            "--task" => {
                i += 1;
            }
            "--files" => {
                i += 1;
                if i < args.len() {
                    files_path = args[i].clone();
                }
            }
            "--config" => {
                i += 1;
                if i < args.len() {
                    config_path = args[i].clone();
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

    if files_path.is_empty() && !list_rules {
        return Err("--files argument is required".to_string());
    }

    Ok(Config {
        mode,
        files_path,
        config_path,
        iterations,
        warmup,
        list_rules,
    })
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

fn load_config(config_path: &str) -> Result<LintConfig, String> {
    if config_path.is_empty() {
        return Ok(LintConfig::recommended());
    }
    let raw = fs::read_to_string(config_path).map_err(|e| format!("{config_path}: {e}"))?;
    LintConfig::from_json_str(&raw).map_err(|e| format!("{config_path}: {e}"))
}

fn lint_one(path: &str, source: &str, config: &LintConfig) {
    let file = Path::new(path);
    let options = CompileOptions {
        filename: Some(path.to_string()),
        ..Default::default()
    };
    // Diagnostics are dropped: the benchmark times work, not correctness (the
    // lint-parity corpus covers correctness).
    let result = catch_unwind(AssertUnwindSafe(|| {
        lint_source(source, file, &options, config)
    }));
    if result.is_err() {
        PANIC_COUNT.fetch_add(1, Ordering::Relaxed);
    }
}

fn run_single_threaded(files: &[(String, String)], config: &LintConfig) {
    for (path, content) in files {
        lint_one(path, content, config);
    }
}

fn run_multi_threaded(files: &[(String, String)], config: &LintConfig) {
    files
        .par_iter()
        .for_each(|(path, content)| lint_one(path, content, config));
}

fn main() {
    let config = match parse_args() {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Error: {e}");
            std::process::exit(1);
        }
    };

    if config.list_rules {
        print!("{}", rsvelte_lint::presets::list_rules());
        return;
    }

    let files = match load_files(&config.files_path) {
        Ok(f) => f,
        Err(e) => {
            eprintln!("Error loading files: {e}");
            std::process::exit(1);
        }
    };

    let lint_config = match load_config(&config.config_path) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Error loading lint config: {e}");
            std::process::exit(1);
        }
    };

    eprintln!(
        "Loaded {} files, mode: {}, task: lint, iterations: {}, warmup: {}",
        files.len(),
        config.mode,
        config.iterations,
        config.warmup
    );

    // Swallow per-panic backtrace spam; one aggregate count is reported below.
    std::panic::set_hook(Box::new(|_| {}));

    let is_multi = config.mode == "multi";

    for _ in 0..config.warmup {
        if is_multi {
            run_multi_threaded(&files, &lint_config);
        } else {
            run_single_threaded(&files, &lint_config);
        }
    }

    let mut times = Vec::with_capacity(config.iterations);
    for _ in 0..config.iterations {
        let start = Instant::now();
        if is_multi {
            run_multi_threaded(&files, &lint_config);
        } else {
            run_single_threaded(&files, &lint_config);
        }
        times.push(start.elapsed().as_secs_f64() * 1000.0);
    }

    let panics = PANIC_COUNT.load(Ordering::Relaxed);
    if panics > 0 {
        let passes = config.warmup + config.iterations;
        eprintln!(
            "note: linter panicked on ~{} file(s) (skipped, not counted as work)",
            panics / passes.max(1)
        );
    }

    let times_json: Vec<String> = times.iter().map(|t| format!("{t:.4}")).collect();
    println!("{{\"times\": [{}]}}", times_json.join(", "));
}
