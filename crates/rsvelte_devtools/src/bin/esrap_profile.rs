//! Isolated timing harness for the `rsvelte_esrap` printer.
//!
//! End-to-end `compile()` timing cannot resolve a change worth <2% of the
//! process on a contended box. This harness first compiles a `.svelte` corpus to
//! its client JS, re-parses that JS with oxc, and then loops **only** the esrap
//! print over the retained programs — the same node mix and sizes the compiler
//! feeds it, with the printer as ~100% of the measured work.

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

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_core::{CompileOptions, GenerateMode};

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let reps = flag_num(&args, "--reps").unwrap_or(15);
    let loop_secs = flag_num(&args, "--loop-secs");
    let roots = corpus_roots(&args);

    let sources = collect(&roots);
    let generated: Vec<String> = sources
        .iter()
        .filter_map(|src| {
            let opts = CompileOptions {
                generate: GenerateMode::Client,
                dev: false,
                enable_sourcemap: true,
                ..Default::default()
            };
            rsvelte_core::compile(src, opts).ok().map(|r| r.js.code)
        })
        .collect();
    let bytes: usize = generated.iter().map(|g| g.len()).sum();

    // One arena for every re-parsed program, kept alive for the whole run.
    let allocator = Allocator::default();
    let programs: Vec<_> = generated
        .iter()
        .map(|code| {
            Parser::new(&allocator, code, SourceType::mjs())
                .parse()
                .program
        })
        .collect();
    eprintln!(
        "esrap corpus: {} programs, {:.2} MB of generated JS",
        programs.len(),
        bytes as f64 / 1e6
    );

    let opts = rsvelte_esrap::PrintOptions::default().with_empty_statements(true);

    // Sampler target: loop until the deadline so a CPU profile attributes
    // essentially everything to the printer.
    if let Some(secs) = loop_secs {
        let deadline = Instant::now() + Duration::from_secs(secs as u64);
        while Instant::now() < deadline {
            for (program, code) in programs.iter().zip(&generated) {
                std::hint::black_box(rsvelte_esrap::print_with_map(program, code, &opts));
            }
        }
        return;
    }

    let mut with_map: Vec<Duration> = Vec::with_capacity(reps);
    let mut no_map: Vec<Duration> = Vec::with_capacity(reps);
    for _ in 0..reps {
        let start = Instant::now();
        for (program, code) in programs.iter().zip(&generated) {
            std::hint::black_box(rsvelte_esrap::print_with_map(program, code, &opts));
        }
        with_map.push(start.elapsed());

        let start = Instant::now();
        for (program, code) in programs.iter().zip(&generated) {
            std::hint::black_box(rsvelte_esrap::print_with(program, code, &opts));
        }
        no_map.push(start.elapsed());
    }

    println!("# rsvelte_esrap print — {reps} interleaved passes");
    report("print_with_map", &mut with_map, bytes);
    report("print_with", &mut no_map, bytes);
}

fn report(label: &str, samples: &mut [Duration], bytes: usize) {
    samples.sort();
    let min = samples[0];
    let med = samples[samples.len() / 2];
    println!(
        "{label:<22} min {:>8.2} ms   median {:>8.2} ms   {:>7.1} MB/s",
        msf(min),
        msf(med),
        bytes as f64 / min.as_secs_f64() / 1e6,
    );
}

fn msf(d: Duration) -> f64 {
    d.as_secs_f64() * 1000.0
}

fn flag_value(args: &[String], flag: &str) -> Option<String> {
    args.iter()
        .position(|a| a == flag)
        .and_then(|i| args.get(i + 1))
        .cloned()
}

fn flag_num(args: &[String], flag: &str) -> Option<usize> {
    flag_value(args, flag).and_then(|v| v.parse().ok())
}

fn corpus_roots(args: &[String]) -> Vec<PathBuf> {
    let explicit: Vec<PathBuf> = args
        .iter()
        .enumerate()
        .filter(|(i, a)| a.as_str() == "--corpus" && *i + 1 < args.len())
        .map(|(i, _)| PathBuf::from(&args[i + 1]))
        .collect();
    if explicit.is_empty() {
        let base = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../submodules");
        vec![base.join("bits-ui"), base.join("shadcn-svelte")]
    } else {
        explicit
    }
}

fn collect(roots: &[PathBuf]) -> Vec<String> {
    let mut paths = Vec::new();
    for root in roots {
        walk(root, &mut paths);
    }
    paths.sort();
    paths
        .into_iter()
        .filter_map(|p| fs::read_to_string(p).ok())
        .collect()
}

fn walk(dir: &Path, out: &mut Vec<PathBuf>) {
    let Ok(entries) = fs::read_dir(dir) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            if path
                .file_name()
                .is_some_and(|n| n == "node_modules" || n == ".git")
            {
                continue;
            }
            walk(&path, out);
        } else if path.extension().is_some_and(|e| e == "svelte") {
            out.push(path);
        }
    }
}
