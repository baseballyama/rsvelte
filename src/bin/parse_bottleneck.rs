//! Identify exactly where parse time is spent.
//! Measures: template-only vs script parsing vs OXC conversion vs expression parsing

use std::fs;
use std::path::PathBuf;
use std::time::Instant;

use svelte_compiler_rust::compiler::phases::phase1_parse::{ParseOptions, parse};

fn main() {
    let files = collect_files();
    let total_bytes: usize = files.iter().map(|(_, c)| c.len()).sum();
    println!("Files: {}, Total: {} bytes\n", files.len(), total_bytes);

    // 1. Full parse (what benchmark_runner does)
    let full = bench(
        &files,
        ParseOptions {
            modern: true,
            defer_script_parse: false,
            skip_expression_loc: false,
            ..Default::default()
        },
        "Full parse (eager script, with loc)",
    );

    // 2. Skip loc computation
    let no_loc = bench(
        &files,
        ParseOptions {
            modern: true,
            defer_script_parse: false,
            skip_expression_loc: true,
            ..Default::default()
        },
        "Eager script, skip loc",
    );

    // 3. Defer script parsing
    let _deferred = bench(
        &files,
        ParseOptions {
            modern: true,
            defer_script_parse: true,
            skip_expression_loc: false,
            ..Default::default()
        },
        "Deferred script, with loc",
    );

    // 4. Both optimizations
    let both = bench(
        &files,
        ParseOptions {
            modern: true,
            defer_script_parse: true,
            skip_expression_loc: true,
            ..Default::default()
        },
        "Deferred script, skip loc",
    );

    println!("\n=== Breakdown ===");
    println!(
        "Loc computation:     {:.2}ms ({:.1}% of full)",
        full - no_loc,
        (full - no_loc) / full * 100.0
    );
    println!(
        "Script OXC parsing:  {:.2}ms ({:.1}% of full)",
        no_loc - both,
        (no_loc - both) / full * 100.0
    );
    println!(
        "Template + expr:     {:.2}ms ({:.1}% of full)",
        both,
        both / full * 100.0
    );
    println!();
    println!(
        "Per-file average:    {:.2}µs",
        full / files.len() as f64 * 1000.0
    );
    println!(
        "Template-only/file:  {:.2}µs",
        both / files.len() as f64 * 1000.0
    );
    println!(
        "Script parsing/file: {:.2}µs",
        (no_loc - both) / files.len() as f64 * 1000.0
    );

    // Parser reuse benchmark
    println!("\n=== With Parser reuse ===");
    let reuse = bench_reuse(
        &files,
        ParseOptions {
            modern: true,
            defer_script_parse: true,
            skip_expression_loc: true,
            ..Default::default()
        },
        "Reuse: defer+skip_loc",
    );
    println!(
        "Per-file (reuse):    {:.2}µs (vs {:.2}µs new parser each time)",
        reuse / files.len() as f64 * 1000.0,
        both / files.len() as f64 * 1000.0
    );
}

fn bench_reuse(files: &[(String, String)], options: ParseOptions, label: &str) -> f64 {
    use svelte_compiler_rust::compiler::phases::phase1_parse::{Parser, parse_reuse};

    let mut parser = Parser::new("", options);

    // Warmup
    for _ in 0..3 {
        for (_, content) in files {
            let _ = parse_reuse(&mut parser, content, options);
        }
    }
    // Measure
    let mut times = Vec::with_capacity(10);
    for _ in 0..10 {
        let start = Instant::now();
        for (_, content) in files {
            let _ = parse_reuse(&mut parser, content, options);
        }
        times.push(start.elapsed().as_secs_f64() * 1000.0);
    }
    times.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let median = times[times.len() / 2];
    let total_bytes: usize = files.iter().map(|(_, c)| c.len()).sum();
    let throughput = total_bytes as f64 / (median / 1000.0) / 1_000_000.0;
    println!("{:35} {:.2}ms  ({:.1} MB/s)", label, median, throughput);
    median
}

fn bench(files: &[(String, String)], options: ParseOptions, label: &str) -> f64 {
    // Warmup
    for _ in 0..3 {
        for (_, content) in files {
            let _ = parse(content, options);
        }
    }
    // Measure
    let mut times = Vec::with_capacity(10);
    for _ in 0..10 {
        let start = Instant::now();
        for (_, content) in files {
            let _ = parse(content, options);
        }
        times.push(start.elapsed().as_secs_f64() * 1000.0);
    }
    times.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let median = times[times.len() / 2];
    let total_bytes: usize = files.iter().map(|(_, c)| c.len()).sum();
    let throughput = total_bytes as f64 / (median / 1000.0) / 1_000_000.0;
    println!("{:35} {:.2}ms  ({:.1} MB/s)", label, median, throughput);
    median
}

fn collect_files() -> Vec<(String, String)> {
    let base = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let test_dir = base.join("svelte/packages/svelte/tests");
    let categories = [
        "parser-modern/samples",
        "snapshot/samples",
        "css/samples",
        "runtime-runes/samples",
        "runtime-legacy/samples",
        "runtime-browser/samples",
        "hydration/samples",
        "server-side-rendering/samples",
        "validator/samples",
    ];
    let mut files = Vec::new();
    for cat in &categories {
        let dir = test_dir.join(cat);
        if !dir.exists() {
            continue;
        }
        collect_svelte_files(&dir, &mut files);
    }
    files
}

fn collect_svelte_files(dir: &std::path::Path, files: &mut Vec<(String, String)>) {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                collect_svelte_files(&path, files);
            } else if path.extension().is_some_and(|e| e == "svelte")
                && let Ok(content) = fs::read_to_string(&path)
            {
                files.push((path.display().to_string(), content));
            }
        }
    }
}
