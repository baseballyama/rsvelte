//! Development profiler for the parse, analyze, and transform phases.

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
use std::path::PathBuf;
use std::time::Instant;

use rsvelte_core::compiler::phases::phase1_parse::{
    ParseOptions, compute_line_offsets, ensure_script_parsed, parse, resolve_lazy_expressions,
};
use rsvelte_core::compiler::phases::phase2_analyze::analyze_component;
use rsvelte_core::compiler::phases::phase3_transform::{profile, transform_component};
use rsvelte_core::{CompileOptions, GenerateMode};

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
        let _ = rsvelte_core::compile(
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
        .map(|(_, content)| parse(content, &oxc_allocator::Allocator::default(), parse_opts).ok())
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
            unsafe { rsvelte_core::ast::arena::set_serialize_arena(&ast.arena as *const _) };
            let _ = resolve_lazy_expressions(ast, content);
            rsvelte_core::ast::arena::clear_serialize_arena();
        }
    }
    let resolve_lazy_time = start.elapsed();

    // Phase 2b: ensure_script_parsed for instance + module scripts (OXC)
    let start = Instant::now();
    for (i, (_, content)) in files.iter().enumerate() {
        if let Some(ref mut ast) = asts[i] {
            let line_offsets = compute_line_offsets(content, false);
            // SAFETY: same lifetime invariant as 2a.
            unsafe { rsvelte_core::ast::arena::set_serialize_arena(&ast.arena as *const _) };
            if let Some(ref mut instance) = ast.instance {
                let _ = ensure_script_parsed(&ast.arena, instance, content, &line_offsets);
            }
            if let Some(ref mut module) = ast.module {
                let _ = ensure_script_parsed(&ast.arena, module, content, &line_offsets);
            }
            rsvelte_core::ast::arena::clear_serialize_arena();
        }
    }
    let ensure_script_time = start.elapsed();

    // Phase 2c: analyze_component (visitors / scope build / store subs / …)
    let start = Instant::now();
    let mut analyses = Vec::with_capacity(files.len());
    for (i, (_, content)) in files.iter().enumerate() {
        if let Some(ref mut ast) = asts[i] {
            // SAFETY: same lifetime invariant as 2a.
            unsafe { rsvelte_core::ast::arena::set_serialize_arena(&ast.arena as *const _) };
            let analysis = analyze_component(ast, content, &compile_opts).ok();
            rsvelte_core::ast::arena::clear_serialize_arena();
            analyses.push(analysis);
        } else {
            analyses.push(None);
        }
    }
    let analyze_visitor_time = start.elapsed();
    let analyze_time = resolve_lazy_time + ensure_script_time + analyze_visitor_time;

    // Reset Phase 3 sub-phase counters in case warmup left non-zero state.
    let _ = profile::take_breakdown();

    let _ = profile::take_reparse_breakdown();
    // Per-file rows, so re-parse cost can be read against file size instead of
    // only as one corpus-wide average.
    let mut rows: Vec<(usize, std::time::Duration, profile::ReparseBreakdown)> =
        Vec::with_capacity(files.len());

    // Measure Phase 3 (Transform)
    let start = Instant::now();
    for (i, (_, content)) in files.iter().enumerate() {
        let file_start = Instant::now();
        if let (Some(ast), Some(Some(analysis))) = (&asts[i], analyses.get(i)) {
            // SAFETY: `ast` is held in `asts[i]` for the duration of this
            // loop iteration; the serialize arena pointer is cleared before
            // we move to the next iteration so the pointer never outlives
            // its referent.
            unsafe { rsvelte_core::ast::arena::set_serialize_arena(&ast.arena as *const _) };
            let _ = transform_component(analysis, ast, content, &compile_opts);
            rsvelte_core::ast::arena::clear_serialize_arena();
        }
        rows.push((
            content.len(),
            file_start.elapsed(),
            profile::take_reparse_breakdown(),
        ));
    }
    let transform_time = start.elapsed();
    let transform_breakdown = profile::take_breakdown();
    let script_text_breakdown = profile::take_script_text_breakdown();

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
    let st = script_text_breakdown;
    // Residual rows are signed: saturating them to zero would hide the very
    // inconsistency the self-check below exists to expose.
    let residual = |whole: std::time::Duration, parts: &[std::time::Duration]| {
        ms(whole) - parts.iter().copied().map(ms).sum::<f64>()
    };
    for (label, val) in [
        ("prenormalize", ms(st.prenormalize)),
        ("collect_vars", ms(st.collect_vars)),
        ("line_loop", ms(st.line_loop)),
        ("  process_accum", ms(st.process_accumulated)),
        ("    runes_xform", ms(st.runes)),
        ("    reactive_stmt", ms(st.reactive_stmt)),
        (
            "    pa_rest",
            residual(st.process_accumulated, &[st.runes, st.reactive_stmt]),
        ),
        (
            "  line_scan",
            residual(st.line_loop, &[st.process_accumulated]),
        ),
        ("ast_transforms", ms(st.ast_transforms)),
        ("post_passes", ms(st.post_passes)),
        (
            "prologue+earlyout",
            residual(
                script_text,
                &[
                    st.prenormalize,
                    st.collect_vars,
                    st.line_loop,
                    st.ast_transforms,
                    st.post_passes,
                ],
            ),
        ),
    ] {
        println!(
            "    {label:<18} {val:7.2}ms ({:5.1}%)",
            val / ms(total) * 100.0
        );
    }
    println!("    (statements processed: {})", st.statements);
    let st_sum =
        st.prenormalize + st.collect_vars + st.line_loop + st.ast_transforms + st.post_passes;
    println!(
        "    SELF-CHECK sum {:.2}ms vs parent {:.2}ms ({:+.2}ms) | entries {} parent_calls {} staged {}",
        ms(st_sum),
        ms(script_text),
        ms(st_sum) - ms(script_text),
        st.entries,
        st.parent_calls,
        st.calls
    );
    println!(
        "    NESTING nested {} | sites: main {} pub {} (sum {} vs entries {})",
        st.nested_entries,
        st.parent_site_main,
        st.parent_site_pub,
        st.parent_site_main + st.parent_site_pub,
        st.entries
    );
    report_reparse(&mut rows, ms(total));
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

/// Re-parse cost overall and per file-size quartile.
///
/// The deterministic column is `bytes/file`: how many times over the pass
/// pipeline hands the same script back to the parser. It needs no quiet machine,
/// so it answers "constant factor or superlinear" independently of the timings
/// next to it.
fn report_reparse(
    rows: &mut [(usize, std::time::Duration, profile::ReparseBreakdown)],
    total_ms: f64,
) {
    let ms = |d: std::time::Duration| d.as_secs_f64() * 1000.0;
    let sum: profile::ReparseBreakdown = rows.iter().fold(
        profile::ReparseBreakdown::default(),
        |mut acc, (_, _, r)| {
            acc.parse += r.parse;
            acc.visit += r.visit;
            acc.calls += r.calls;
            acc.bytes += r.bytes;
            acc.direct_parse += r.direct_parse;
            acc.direct_calls += r.direct_calls;
            acc.direct_bytes += r.direct_bytes;
            acc
        },
    );
    println!(
        "  reparse (driver):    {:7.2}ms ({:5.1}%) parse, {:7.2}ms ({:5.1}%) visit | {} calls",
        ms(sum.parse),
        ms(sum.parse) / total_ms * 100.0,
        ms(sum.visit),
        ms(sum.visit) / total_ms * 100.0,
        sum.calls
    );
    println!(
        "  reparse (direct):    {:7.2}ms ({:5.1}%) parse | {} calls, {} bytes",
        ms(sum.direct_parse),
        ms(sum.direct_parse) / total_ms * 100.0,
        sum.direct_calls,
        sum.direct_bytes
    );

    rows.sort_by_key(|&(bytes, ..)| bytes);
    let n = rows.len();
    if n < 4 {
        return;
    }
    println!(
        "    {:<9} {:>6} {:>9} {:>8} {:>10} {:>9} {:>9}",
        "quartile", "files", "med bytes", "calls/f", "reparse/f", "parse%P3", "visit%P3"
    );
    for q in 0..4 {
        let chunk = &rows[n * q / 4..n * (q + 1) / 4];
        let files = chunk.len() as f64;
        let src: u64 = chunk.iter().map(|&(b, ..)| b as u64).sum();
        let calls: u64 = chunk.iter().map(|(_, _, r)| r.calls + r.direct_calls).sum();
        let bytes: u64 = chunk.iter().map(|(_, _, r)| r.bytes + r.direct_bytes).sum();
        let parse: f64 = chunk
            .iter()
            .map(|(_, _, r)| ms(r.parse) + ms(r.direct_parse))
            .sum();
        let visit: f64 = chunk.iter().map(|(_, _, r)| ms(r.visit)).sum();
        let p3: f64 = chunk.iter().map(|&(_, d, _)| ms(d)).sum();
        println!(
            "    Q{:<8} {:>6} {:>9} {:>8.1} {:>9.2}x {:>8.1}% {:>8.1}%",
            q + 1,
            chunk.len(),
            chunk[chunk.len() / 2].0,
            calls as f64 / files,
            bytes as f64 / src.max(1) as f64,
            parse / p3.max(f64::MIN_POSITIVE) * 100.0,
            visit / p3.max(f64::MIN_POSITIVE) * 100.0,
        );
    }
}

/// The six shipped projects, picked so this population is byte-for-byte the one
/// the `$:` density check ran on: the density figure and the shares then
/// describe the same files rather than two similar-sounding sets.
const SHIPPED_PROJECTS: [&str; 6] = [
    "submodules/flowbite-svelte",
    "submodules/bits-ui",
    "submodules/shadcn-svelte",
    "submodules/layerchart",
    "submodules/skeleton",
    "submodules/svelte-ux",
];

fn collect_files() -> Vec<(String, String)> {
    let base = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    if std::env::args().any(|a| a == "--shipped") {
        // `--only=a,b` / `--skip=a,b` narrow the set, so a share that turns out
        // to sit in one project can be attributed to it instead of guessed at.
        let list = |flag: &str| -> Vec<String> {
            std::env::args()
                .find_map(|a| a.strip_prefix(flag).map(str::to_owned))
                .map(|v| v.split(',').map(str::to_owned).collect())
                .unwrap_or_default()
        };
        let only = list("--only=");
        let skip = list("--skip=");
        let mut files = Vec::new();
        for project in &SHIPPED_PROJECTS {
            let matches = |pats: &[String]| pats.iter().any(|p| project.contains(p.as_str()));
            if (!only.is_empty() && !matches(&only)) || matches(&skip) {
                continue;
            }
            collect_svelte_files(&base.join(project), &mut files);
        }
        return files;
    }
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
