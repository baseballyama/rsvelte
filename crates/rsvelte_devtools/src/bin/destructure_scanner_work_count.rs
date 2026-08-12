//! Measures the legacy destructuring-assignment scanner's repeated work before
//! replacing any part of it. The three tiers stay separate: a generated scale
//! case, a checked-in real trigger, and the shipped corpus.
//!
//! ```text
//! cargo run --release -p rsvelte_devtools --bin destructure_scanner_work_count \
//!   --features measure-destructure-scanner
//! ```

#[cfg(feature = "measure-destructure-scanner")]
use std::fs;
#[cfg(feature = "measure-destructure-scanner")]
use std::path::{Path, PathBuf};

#[cfg(feature = "measure-destructure-scanner")]
use rsvelte_core::{CompileOptions, GenerateMode, compile, measure_destructure_scanner};

#[cfg(feature = "measure-destructure-scanner")]
const DEFAULT_REAL_FIXTURE: &str =
    "compatibility/pattern-corpus/issues/2138-legacy-assignment-destructure-rest.svelte";
#[cfg(feature = "measure-destructure-scanner")]
const DEFAULT_CORPUS: &str = "compatibility/sources";

#[cfg(feature = "measure-destructure-scanner")]
fn collect(dir: &Path, files: &mut Vec<(PathBuf, String)>) {
    let Ok(entries) = fs::read_dir(dir) else {
        return;
    };
    let mut paths: Vec<PathBuf> = entries.flatten().map(|entry| entry.path()).collect();
    paths.sort();
    for path in paths {
        if path.is_dir() {
            if path.file_name().is_some_and(|name| name == "node_modules") {
                continue;
            }
            collect(&path, files);
        } else if matches!(
            path.extension().and_then(|ext| ext.to_str()),
            Some("svelte" | "js" | "ts")
        ) && path.to_string_lossy().contains(".svelte")
            && let Ok(source) = fs::read_to_string(&path)
        {
            files.push((path, source));
        }
    }
}

#[cfg(feature = "measure-destructure-scanner")]
fn compile_source(source: &str) {
    let _ = compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    );
}

#[cfg(feature = "measure-destructure-scanner")]
fn print_stats(label: &str, stats: measure_destructure_scanner::Snapshot) {
    println!("{label}:");
    println!(
        "  transform entries: {} (quick skips {})",
        stats.entries, stats.quick_skips
    );
    println!(
        "  full statement scans: {} / {} B (max {} B)",
        stats.scan_calls, stats.scan_bytes, stats.max_scan_bytes
    );
    println!(
        "  candidate closers: {} (assignment-shaped {})",
        stats.candidate_closers, stats.assignment_closers
    );
    println!(
        "  bracket-helper calls: {} / {} code B (max {} B)",
        stats.helper_calls, stats.helper_code_bytes, stats.max_helper_code_bytes
    );
    println!(
        "  accepted candidates: {}; successful rewrites: {}",
        stats.accepted_candidates, stats.rewrites
    );
    let labels = measure_destructure_scanner::bucket_labels();
    println!("  full statement scan-size histogram:");
    for (label, count) in labels.iter().zip(stats.scan_size_buckets) {
        if count != 0 {
            println!("    {label}: {count}");
        }
    }
    println!("  bracket-helper code-size histogram:");
    for (label, count) in labels.iter().zip(stats.helper_size_buckets) {
        if count != 0 {
            println!("    {label}: {count}");
        }
    }
}

#[cfg(feature = "measure-destructure-scanner")]
fn synthetic(assignments: usize) -> String {
    let body = "[a] = value;\n".repeat(assignments);
    format!("<script>let a = $state(0); let value = [1]; function run() {{ {body} }}</script>")
}

#[cfg(not(feature = "measure-destructure-scanner"))]
fn main() {
    eprintln!("build with --features measure-destructure-scanner");
    std::process::exit(2);
}

#[cfg(feature = "measure-destructure-scanner")]
fn main() {
    let base = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    let mut corpus_dirs = Vec::new();
    let mut real_fixture = base.join(DEFAULT_REAL_FIXTURE);
    let mut run_synthetic = true;
    let mut run_real = true;
    let mut run_corpus = true;
    let args: Vec<String> = std::env::args().skip(1).collect();
    let mut i = 0;
    while i < args.len() {
        match args[i].as_str() {
            "--dir" => {
                i += 1;
                corpus_dirs.push(PathBuf::from(&args[i]));
            }
            "--real" => {
                i += 1;
                real_fixture = PathBuf::from(&args[i]);
            }
            "--synthetic-only" => {
                run_real = false;
                run_corpus = false;
            }
            "--real-only" => {
                run_synthetic = false;
                run_corpus = false;
            }
            "--corpus-only" => {
                run_synthetic = false;
                run_real = false;
            }
            other => panic!("unknown argument: {other}"),
        }
        i += 1;
    }
    if corpus_dirs.is_empty() {
        corpus_dirs.push(base.join(DEFAULT_CORPUS));
    }

    if run_synthetic {
        println!("synthetic scale:");
        for assignments in [1, 2, 4, 8, 16, 32, 64, 128] {
            measure_destructure_scanner::reset();
            let source = synthetic(assignments);
            compile_source(&source);
            let stats = measure_destructure_scanner::snapshot();
            println!(
                "  assignments {assignments:>3}, source {:>5} B, scans {:>6}, helper calls {:>6}, helper code {:>10} B, rewrites {:>3}",
                source.len(),
                stats.scan_calls,
                stats.helper_calls,
                stats.helper_code_bytes,
                stats.rewrites
            );
        }
    }

    if run_real {
        let source = fs::read_to_string(&real_fixture)
            .unwrap_or_else(|error| panic!("cannot read {}: {error}", real_fixture.display()));
        measure_destructure_scanner::reset();
        compile_source(&source);
        print_stats(
            &format!("real trigger ({})", real_fixture.display()),
            measure_destructure_scanner::snapshot(),
        );
    }

    if run_corpus {
        let mut files = Vec::new();
        for dir in &corpus_dirs {
            collect(dir, &mut files);
        }
        assert!(
            !files.is_empty(),
            "no .svelte sources under {corpus_dirs:?}"
        );
        measure_destructure_scanner::reset();
        for (_, source) in &files {
            compile_source(source);
        }
        print_stats(
            &format!("shipped corpus ({} files)", files.len()),
            measure_destructure_scanner::snapshot(),
        );
    }
}
