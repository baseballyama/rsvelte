//! Profile compile phases: parse, analyze, transform
use std::fs;
use std::path::PathBuf;
use std::time::Instant;

use svelte_compiler_rust::compiler::phases::phase1_parse::{ParseOptions, parse};
use svelte_compiler_rust::compiler::phases::phase2_analyze::analyze_component;
use svelte_compiler_rust::compiler::phases::phase3_transform::transform_component;
use svelte_compiler_rust::{CompileOptions, GenerateMode};

fn main() {
    let files = collect_files();
    let total_bytes: usize = files.iter().map(|(_, c)| c.len()).sum();
    println!("Files: {}, Total: {} bytes\n", files.len(), total_bytes);

    let parse_opts = ParseOptions {
        modern: true,
        skip_expression_loc: true,
        defer_script_parse: true,
        ..Default::default()
    };

    // Warmup
    for (_, content) in files.iter().take(100) {
        let _ = svelte_compiler_rust::compile(
            content,
            CompileOptions {
                generate: GenerateMode::Client,
                ..Default::default()
            },
        );
    }

    // Measure Phase 1 (Parse)
    let start = Instant::now();
    let mut asts: Vec<_> = files
        .iter()
        .map(|(_, content)| parse(content, parse_opts).ok())
        .collect();
    let parse_time = start.elapsed();

    // Measure resolve_lazy as part of Phase 2 (it's called inside analyze_component)
    let resolve_time = std::time::Duration::ZERO;

    // Measure Phase 2 (Analyze) — includes resolve_lazy + ensure_script_parsed
    let compile_opts = CompileOptions {
        generate: GenerateMode::Client,
        ..Default::default()
    };

    // First run: measure full analyze
    let start = Instant::now();
    let mut analyses = Vec::with_capacity(files.len());
    for (i, (_, content)) in files.iter().enumerate() {
        if let Some(ref mut ast) = asts[i] {
            // SAFETY: `ast` lives until the end of this scope, and we
            // explicitly clear the thread-local serialize arena before the
            // borrow could become dangling. No async point or panic-prone
            // cleanup runs between set and clear.
            unsafe {
                svelte_compiler_rust::ast::arena::set_serialize_arena(&ast.arena as *const _)
            };
            let analysis = analyze_component(ast, content, &compile_opts).ok();
            svelte_compiler_rust::ast::arena::clear_serialize_arena();
            analyses.push(analysis);
        } else {
            analyses.push(None);
        }
    }
    let analyze_time = start.elapsed();

    // Measure just parse+resolve (deferred work) to isolate analyze cost
    let start = Instant::now();
    let mut asts2: Vec<_> = files
        .iter()
        .map(|(_, content)| parse(content, parse_opts).ok())
        .collect();
    for (i, (_, _content)) in files.iter().enumerate() {
        if let Some(ref mut ast) = asts2[i] {
            // SAFETY: `ast` lives until the end of this scope; the serialize
            // arena pointer is cleared before this borrow ends.
            unsafe {
                svelte_compiler_rust::ast::arena::set_serialize_arena(&ast.arena as *const _)
            };
            // Note: `remove_typescript_nodes` would normally run here as part of
            // the compile flow, but exposing the JSON AST mutation API in this
            // profiler binary is left intentionally out of scope. The timing
            // captured here is therefore parse + resolve_lazy only.
            svelte_compiler_rust::ast::arena::clear_serialize_arena();
        }
    }
    let parse_resolve_time = start.elapsed();
    println!(
        "  Parse+resolve:     {:7.2}ms",
        parse_resolve_time.as_secs_f64() * 1000.0
    );

    // Measure Phase 3 (Transform)
    let start = Instant::now();
    for (i, (_, content)) in files.iter().enumerate() {
        if let (Some(ast), Some(Some(analysis))) = (&asts[i], analyses.get(i)) {
            // SAFETY: `ast` is held in `asts[i]` for the duration of this
            // loop iteration; the serialize arena pointer is cleared before
            // we move to the next iteration so the pointer never outlives
            // its referent.
            unsafe {
                svelte_compiler_rust::ast::arena::set_serialize_arena(&ast.arena as *const _)
            };
            let _ = transform_component(analysis, ast, content, &compile_opts);
            svelte_compiler_rust::ast::arena::clear_serialize_arena();
        }
    }
    let transform_time = start.elapsed();

    let total = parse_time + resolve_time + analyze_time + transform_time;

    println!("=== Compile Phase Breakdown ===");
    println!(
        "Phase 1 (Parse):     {:7.2}ms ({:5.1}%)",
        parse_time.as_secs_f64() * 1000.0,
        parse_time.as_secs_f64() / total.as_secs_f64() * 100.0
    );
    println!(
        "  Resolve lazy:      {:7.2}ms ({:5.1}%)",
        resolve_time.as_secs_f64() * 1000.0,
        resolve_time.as_secs_f64() / total.as_secs_f64() * 100.0
    );
    println!(
        "Phase 2 (Analyze):   {:7.2}ms ({:5.1}%)",
        analyze_time.as_secs_f64() * 1000.0,
        analyze_time.as_secs_f64() / total.as_secs_f64() * 100.0
    );
    println!(
        "Phase 3 (Transform): {:7.2}ms ({:5.1}%)",
        transform_time.as_secs_f64() * 1000.0,
        transform_time.as_secs_f64() / total.as_secs_f64() * 100.0
    );
    println!(
        "TOTAL:               {:7.2}ms",
        total.as_secs_f64() * 1000.0
    );
    println!();
    println!(
        "Per-file average:    {:.2}µs",
        total.as_secs_f64() * 1_000_000.0 / files.len() as f64
    );
    println!(
        "Throughput:          {:.1} MB/s",
        total_bytes as f64 / total.as_secs_f64() / 1_000_000.0
    );
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
