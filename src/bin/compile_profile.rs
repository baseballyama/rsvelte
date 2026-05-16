//! Profile compile phases: parse, analyze, transform

// Use jemalloc as the global allocator for better multi-threaded
// performance. Defined per-bin rather than once in the lib because the lib
// is built as both rlib and cdylib, and a lib-level `#[global_allocator]`
// is duplicated across both outputs at link time — cargo issue
// rust-lang/cargo#6313.
#[cfg(all(
    feature = "jemalloc",
    not(feature = "napi"),
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: tikv_jemallocator::Jemalloc = tikv_jemallocator::Jemalloc;

use std::fs;
use std::path::PathBuf;
use std::time::Instant;

use svelte_compiler_rust::compiler::phases::phase1_parse::{
    ParseOptions, compute_line_offsets, ensure_script_parsed, parse, resolve_lazy_expressions,
};
use svelte_compiler_rust::compiler::phases::phase2_analyze::analyze_component;
use svelte_compiler_rust::compiler::phases::phase3_transform::{profile, transform_component};
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

    let compile_opts = CompileOptions {
        generate: GenerateMode::Client,
        ..Default::default()
    };

    // === Phase 2 breakdown ===
    //
    // `resolve_lazy_expressions` and `ensure_script_parsed` are idempotent
    // (both early-return when there is nothing left to do), so we pre-run
    // them with timing here. The subsequent `analyze_component` call skips
    // these steps internally, leaving us with a clean three-way split:
    //
    //   2a. resolve_lazy  — finish deferred template-expression + CSS parse
    //   2b. ensure_script — invoke OXC on the instance + module scripts
    //   2c. visitors      — everything else analyze_component does
    //                       (scope build, store subs, fragment walks, …)

    // Phase 2a: resolve_lazy_expressions
    let start = Instant::now();
    for (i, (_, content)) in files.iter().enumerate() {
        if let Some(ref mut ast) = asts[i] {
            // SAFETY: `ast` is in `asts[i]` for the whole iteration; the
            // serialize arena pointer is cleared before this borrow ends.
            unsafe {
                svelte_compiler_rust::ast::arena::set_serialize_arena(&ast.arena as *const _)
            };
            let _ = resolve_lazy_expressions(ast, content);
            svelte_compiler_rust::ast::arena::clear_serialize_arena();
        }
    }
    let resolve_lazy_time = start.elapsed();

    // Phase 2b: ensure_script_parsed for instance + module scripts (OXC)
    let start = Instant::now();
    for (i, (_, content)) in files.iter().enumerate() {
        if let Some(ref mut ast) = asts[i] {
            let line_offsets = compute_line_offsets(content, false);
            // SAFETY: same lifetime invariant as 2a.
            unsafe {
                svelte_compiler_rust::ast::arena::set_serialize_arena(&ast.arena as *const _)
            };
            if let Some(ref mut instance) = ast.instance {
                ensure_script_parsed(&ast.arena, instance, content, &line_offsets);
            }
            if let Some(ref mut module) = ast.module {
                ensure_script_parsed(&ast.arena, module, content, &line_offsets);
            }
            svelte_compiler_rust::ast::arena::clear_serialize_arena();
        }
    }
    let ensure_script_time = start.elapsed();

    // Phase 2c: analyze_component (visitors / scope build / store subs / …)
    let start = Instant::now();
    let mut analyses = Vec::with_capacity(files.len());
    for (i, (_, content)) in files.iter().enumerate() {
        if let Some(ref mut ast) = asts[i] {
            // SAFETY: same lifetime invariant as 2a.
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
    let analyze_visitor_time = start.elapsed();
    let analyze_time = resolve_lazy_time + ensure_script_time + analyze_visitor_time;

    // Reset Phase 3 sub-phase counters in case warmup left non-zero state.
    let _ = profile::take_breakdown();

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
    let transform_breakdown = profile::take_breakdown();

    let total = parse_time + analyze_time + transform_time;
    let pct = |d: std::time::Duration| d.as_secs_f64() / total.as_secs_f64() * 100.0;
    let ms = |d: std::time::Duration| d.as_secs_f64() * 1000.0;

    println!("=== Compile Phase Breakdown ===");
    println!(
        "Phase 1 (Parse):       {:7.2}ms ({:5.1}%)",
        ms(parse_time),
        pct(parse_time)
    );
    println!(
        "Phase 2 (Analyze):     {:7.2}ms ({:5.1}%)",
        ms(analyze_time),
        pct(analyze_time)
    );
    println!(
        "  Resolve lazy:        {:7.2}ms ({:5.1}%)",
        ms(resolve_lazy_time),
        pct(resolve_lazy_time)
    );
    println!(
        "  Ensure script (OXC): {:7.2}ms ({:5.1}%)",
        ms(ensure_script_time),
        pct(ensure_script_time)
    );
    println!(
        "  Visitors (rest):     {:7.2}ms ({:5.1}%)",
        ms(analyze_visitor_time),
        pct(analyze_visitor_time)
    );
    println!(
        "Phase 3 (Transform):   {:7.2}ms ({:5.1}%)",
        ms(transform_time),
        pct(transform_time)
    );
    let visit_program = transform_breakdown.visit_program;
    let script_text = transform_breakdown.script_text_transform;
    let template_fragment = transform_breakdown.template_fragment;
    let assembly_after = transform_breakdown.assembly_after_fragment;
    let css_render = transform_breakdown.css_render;
    let codegen = transform_breakdown.codegen;
    let other = transform_time
        .saturating_sub(visit_program)
        .saturating_sub(script_text)
        .saturating_sub(template_fragment)
        .saturating_sub(assembly_after)
        .saturating_sub(css_render)
        .saturating_sub(codegen);
    println!(
        "  visit_program:       {:7.2}ms ({:5.1}%)",
        ms(visit_program),
        pct(visit_program)
    );
    println!(
        "  Script-text xform:   {:7.2}ms ({:5.1}%)",
        ms(script_text),
        pct(script_text)
    );
    println!(
        "  Template fragment:   {:7.2}ms ({:5.1}%)",
        ms(template_fragment),
        pct(template_fragment)
    );
    println!(
        "  Assembly (post-frag):{:7.2}ms ({:5.1}%)",
        ms(assembly_after),
        pct(assembly_after)
    );
    println!(
        "  CSS render:          {:7.2}ms ({:5.1}%)",
        ms(css_render),
        pct(css_render)
    );
    println!(
        "  JS codegen:          {:7.2}ms ({:5.1}%)",
        ms(codegen),
        pct(codegen)
    );
    println!(
        "  Pre-frag setup:      {:7.2}ms ({:5.1}%)",
        ms(other),
        pct(other)
    );
    println!("TOTAL:                 {:7.2}ms", ms(total));
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
    let test_dir = base.join("submodules/svelte/packages/svelte/tests");
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
