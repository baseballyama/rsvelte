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

use std::fmt::Write as _;
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
        dev: std::env::args().any(|a| a == "--dev"),
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
    //
    // Timed per file as well as in total: it is the one bucket driven directly
    // by script bytes, so it is the reference the other buckets' scaling is
    // read against.
    let start = Instant::now();
    let mut ensure_per_file: Vec<std::time::Duration> = Vec::with_capacity(files.len());
    for (i, (_, content)) in files.iter().enumerate() {
        let file_start = Instant::now();
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
        ensure_per_file.push(file_start.elapsed());
    }
    let ensure_script_time = start.elapsed();

    // Phase 2c: analyze_component (visitors / scope build / store subs / …)
    let start = Instant::now();
    let mut analyses = Vec::with_capacity(files.len());
    let mut analyze_per_file: Vec<std::time::Duration> = Vec::with_capacity(files.len());
    for (i, (_, content)) in files.iter().enumerate() {
        let file_start = Instant::now();
        if let Some(ref mut ast) = asts[i] {
            // SAFETY: same lifetime invariant as 2a.
            unsafe { rsvelte_core::ast::arena::set_serialize_arena(&ast.arena as *const _) };
            let analysis = analyze_component(ast, content, &compile_opts).ok();
            rsvelte_core::ast::arena::clear_serialize_arena();
            analyses.push(analysis);
        } else {
            analyses.push(None);
        }
        analyze_per_file.push(file_start.elapsed());
    }
    let analyze_visitor_time = start.elapsed();
    let analyze_time = resolve_lazy_time + ensure_script_time + analyze_visitor_time;

    // Reset Phase 3 sub-phase counters in case warmup left non-zero state.
    // Every accumulator the run reports has to be drained here, not just the
    // Phase3Breakdown: the script-text stage timers live in their own set, and
    // leaving them undrained charged the warmup's 100 files to the stages while
    // the parent saw only the measured pass -- which reads as Sigma-stages
    // exceeding its own parent by (100 + N) / N, worst on small corpora.
    let _ = profile::take_breakdown();
    let _ = profile::take_script_text_breakdown();
    // A raw count rather than a share, so warmup cannot skew a percentage here
    // -- but it would leave the oracle's check count covering a population no
    // other number in the report covers, which is the same hazard one field over.
    let _ = profile::take_index_oracle();

    let _ = profile::take_reparse_breakdown();
    // Per-file rows, so re-parse cost can be read against file size instead of
    // only as one corpus-wide average.
    let mut rows: Vec<(usize, std::time::Duration, profile::ReparseBreakdown)> =
        Vec::with_capacity(files.len());
    let mut scaling: Vec<ScalingRow> = Vec::with_capacity(files.len());
    let mut totals = profile::Phase3Breakdown::default();

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
        let file_transform = file_start.elapsed();
        // Drained per file for the scaling rows, so the corpus totals have to be
        // accumulated here rather than read back after the loop.
        let b = profile::take_breakdown();
        totals.visit_program += b.visit_program;
        totals.script_text_transform += b.script_text_transform;
        totals.template_fragment += b.template_fragment;
        totals.assembly_after_fragment += b.assembly_after_fragment;
        totals.css_render += b.css_render;
        totals.codegen += b.codegen;
        let (script_bytes, runes) = script_shape(asts[i].as_ref(), content);
        scaling.push(ScalingRow {
            script_bytes,
            ensure_script: ensure_per_file.get(i).copied().unwrap_or_default(),
            runes,
            analyze: analyze_per_file.get(i).copied().unwrap_or_default(),
            script_text: b.script_text_transform,
            template: b.template_fragment,
            codegen: b.codegen,
            transform: file_transform,
        });
        rows.push((
            content.len(),
            file_transform,
            profile::take_reparse_breakdown(),
        ));
    }
    let transform_time = start.elapsed();
    let transform_breakdown = totals;
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
        ("      rs_deps", ms(st.rs_deps)),
        ("      rs_body", ms(st.rs_body)),
        ("      rs_assigns", ms(st.rs_assigns)),
        (
            "      rs_rest",
            residual(st.reactive_stmt, &[st.rs_deps, st.rs_body, st.rs_assigns]),
        ),
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
    println!(
        "    COUNTERS loop_lines {} | fastpath_stmts {} | ctrl_header {} calls / {} bytes | collect_scan {} passes / {} bytes",
        st.loop_lines,
        st.fastpath_statements,
        st.ctrl_header_calls,
        st.ctrl_header_bytes,
        st.collect_scan_passes,
        st.collect_scan_bytes
    );
    // `reactive_calls` is the legacy/runes discriminator: it counts top-level
    // `$:` statements, which exist only on the legacy side. Load-independent,
    // so a corpus can be labelled without trusting a timing share.
    println!(
        "    MODE legacy_reactive_stmts {} | statements {} | fastpath {} | processed {}",
        st.reactive_calls,
        st.statements + st.fastpath_statements,
        st.fastpath_statements,
        st.statements
    );
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
        "    NESTING nested {} | sites: main {} pub {} (sum {} vs entries {}) | in_function {:.2}ms",
        st.nested_entries,
        st.parent_site_main,
        st.parent_site_pub,
        st.parent_site_main + st.parent_site_pub,
        st.entries,
        ms(st.in_function)
    );
    println!(
        "    PAIRING entries_outside_parent {}",
        st.entries_outside_parent
    );
    report_reparse(&mut rows, ms(total));
    if let Some(path) = std::env::args()
        .position(|a| a == "--dump-rows")
        .and_then(|i| std::env::args().nth(i + 1))
    {
        dump_rows(&scaling, &path);
    }
    report_scaling(&scaling, "script bytes", |r| r.script_bytes as f64);
    report_scaling(&scaling, "rune count", |r| r.runes as f64);
    let oracle = profile::take_index_oracle();
    println!(
        "  index oracle: {} checks, {} mismatches{}",
        oracle.checks,
        oracle.mismatches,
        if oracle.checks == 0 {
            " (set RSVELTE_INDEX_ORACLE to run it)"
        } else {
            ""
        }
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

/// Writes the per-file rows the scaling table is aggregated from.
///
/// Every refit -- excluding zero rows, restricting to a quartile range, fitting
/// all buckets on one common file set -- is a question about which rows enter
/// which fit, and none of them can be asked of the printed table. Dumping the
/// rows once makes those refits cost nothing.
fn dump_rows(rows: &[ScalingRow], path: &str) {
    let ns = |d: std::time::Duration| d.as_nanos();
    let mut out = String::from(
        "script_bytes,runes,ensure_script,analyze,script_text,template,codegen,transform\n",
    );
    for r in rows {
        let _ = writeln!(
            out,
            "{},{},{},{},{},{},{},{}",
            r.script_bytes,
            r.runes,
            ns(r.ensure_script),
            ns(r.analyze),
            ns(r.script_text),
            ns(r.template),
            ns(r.codegen),
            ns(r.transform)
        );
    }
    match std::fs::write(path, out) {
        Ok(()) => println!("\n  wrote {} rows to {path}", rows.len()),
        Err(e) => eprintln!("could not write {path}: {e}"),
    }
}

struct ScalingRow {
    script_bytes: usize,
    ensure_script: std::time::Duration,
    runes: usize,
    analyze: std::time::Duration,
    script_text: std::time::Duration,
    template: std::time::Duration,
    codegen: std::time::Duration,
    transform: std::time::Duration,
}

/// Script size and rune count for one file.
///
/// Runes are counted textually inside the script tags rather than taken from
/// the analysis, so the number means the same thing as the one a regression on
/// source text would produce. `$$props` and `$$restProps` are not runes and are
/// excluded by requiring a single leading `$`.
fn script_shape(ast: Option<&rsvelte_core::ast::Root<'_>>, content: &str) -> (usize, usize) {
    const RUNES: [&str; 7] = [
        "$state",
        "$derived",
        "$props",
        "$effect",
        "$bindable",
        "$inspect",
        "$host",
    ];
    let Some(ast) = ast else {
        return (0, 0);
    };
    let mut bytes = 0usize;
    let mut runes = 0usize;
    for script in [ast.instance.as_ref(), ast.module.as_ref()]
        .into_iter()
        .flatten()
    {
        let (start, end) = (script.start as usize, script.end as usize);
        let Some(text) = content.get(start..end) else {
            continue;
        };
        bytes += text.len();
        for rune in RUNES {
            let mut rest = text;
            while let Some(pos) = rest.find(rune) {
                let before_is_dollar = rest[..pos].ends_with('$');
                let after = &rest[pos + rune.len()..];
                // A rune is a call or a member access; `$stateful` is neither.
                let looks_like_rune = after.starts_with('(')
                    || after.starts_with('.')
                    || after.trim_start().starts_with('(');
                if !before_is_dollar && looks_like_rune {
                    runes += 1;
                }
                rest = &rest[pos + rune.len()..];
            }
        }
    }
    (bytes, runes)
}

/// Ordinary least squares slope of `log(y)` on `log(x)`, i.e. the exponent.
///
/// Rows where either side is zero carry no exponent information and are
/// dropped; the count that survived is reported so the slope is never read
/// without knowing what it was fitted on.
fn log_slope(points: &[(f64, f64)]) -> (f64, usize) {
    let used: Vec<(f64, f64)> = points
        .iter()
        .filter(|&&(x, y)| x > 0.0 && y > 0.0)
        .map(|&(x, y)| ((x + 1.0).ln(), y.ln()))
        .collect();
    let n = used.len();
    if n < 3 {
        return (f64::NAN, n);
    }
    let mx = used.iter().map(|p| p.0).sum::<f64>() / n as f64;
    let my = used.iter().map(|p| p.1).sum::<f64>() / n as f64;
    let num: f64 = used.iter().map(|&(x, y)| (x - mx) * (y - my)).sum();
    let den: f64 = used.iter().map(|&(x, _)| (x - mx) * (x - mx)).sum();
    (num / den, n)
}

/// Bucket shares and scaling exponents against one predictor.
///
/// The claim this supports is "rsvelte's own scaling sits in bucket X". It is
/// not a claim about where the gap to another compiler sits: that would need
/// the other compiler's bucket split, which we do not have.
fn report_scaling(rows: &[ScalingRow], label: &str, predictor: fn(&ScalingRow) -> f64) {
    let ms = |d: std::time::Duration| d.as_secs_f64() * 1000.0;
    let buckets: [(&str, fn(&ScalingRow) -> std::time::Duration); 5] = [
        ("ensure_script", |r| r.ensure_script),
        ("Analyze", |r| r.analyze),
        ("script_text", |r| r.script_text),
        ("template", |r| r.template),
        ("js_codegen", |r| r.codegen),
    ];
    // Every bucket printed below has to be inside this, or the shares are not
    // parts of one whole: `ensure_script` sits outside `analyze + transform`, and
    // pricing it against that denominator pushed the column past 100%.
    let total_all: f64 = rows
        .iter()
        .map(|r| ms(r.ensure_script) + ms(r.analyze) + ms(r.transform))
        .sum();
    println!("\n  === scaling vs {label} (n = {}) ===", rows.len());

    let mut order: Vec<usize> = (0..rows.len()).collect();
    order.sort_by(|&a, &b| predictor(&rows[a]).total_cmp(&predictor(&rows[b])));
    println!(
        "    {:<12} {:>8} {:>8} {:>8} {:>8} | {:>7} {:>7} {:>6} {:>6}",
        "bucket", "Q1 ms/f", "Q2 ms/f", "Q3 ms/f", "Q4 ms/f", "share", "exp", "c_b", "fitted"
    );
    // `log_slope` drops rows whose time is zero, so each bucket is fitted on its
    // own subpopulation; without this count the five exponents look commensurable.
    let mut c_sum = 0.0;
    let mut c_share_sum = 0.0;
    for (name, get) in buckets {
        let mut cells = [0.0f64; 4];
        for (q, cell) in cells.iter_mut().enumerate() {
            let chunk = &order[order.len() * q / 4..order.len() * (q + 1) / 4];
            *cell =
                chunk.iter().map(|&i| ms(get(&rows[i]))).sum::<f64>() / chunk.len().max(1) as f64;
        }
        let share = rows.iter().map(|r| ms(get(r))).sum::<f64>() / total_all.max(f64::MIN_POSITIVE);
        let pts: Vec<(f64, f64)> = rows.iter().map(|r| (predictor(r), ms(get(r)))).collect();
        let (exp, fitted) = log_slope(&pts);
        let c_b = share * exp;
        c_sum += c_b;
        c_share_sum += share;
        println!(
            "    {name:<12} {:>8.4} {:>8.4} {:>8.4} {:>8.4} | {:>6.1}% {:>7.3} {:>6.3} {:>6}",
            cells[0],
            cells[1],
            cells[2],
            cells[3],
            share * 100.0,
            exp,
            c_b,
            fitted
        );
    }
    // The three transform sub-buckets do not cover `transform`; printing the
    // remainder is what lets the shares above be checked against 100% instead of
    // being read as a partition they are not.
    let uncovered: f64 = rows
        .iter()
        .map(|r| ms(r.transform) - ms(r.script_text) - ms(r.template) - ms(r.codegen))
        .sum::<f64>()
        / total_all.max(f64::MIN_POSITIVE);
    println!("    {:<12} {:>36} {:>6.1}%", "other", "", uncovered * 100.0);
    // A column that does not add to 100 invites the reading that the buckets
    // partition the total, which is how the shares were misread before.
    println!(
        "    {:<12} {:>36} {:>6.1}%",
        "SUM",
        "",
        (c_share_sum + uncovered) * 100.0
    );
    let total_pts: Vec<(f64, f64)> = rows
        .iter()
        .map(|r| {
            (
                predictor(r),
                ms(r.ensure_script) + ms(r.analyze) + ms(r.transform),
            )
        })
        .collect();
    let (total_exp, used) = log_slope(&total_pts);
    println!(
        "    SELF-CHECK  sum c_b {c_sum:.3} vs total exponent {total_exp:.3} (fitted on {used} of {})",
        rows.len()
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
    // A corpus outside the repo (a pinned upstream checkout) is the only way to
    // profile the projects the published benchmark uses but we do not vendor.
    if let Some(dir) = std::env::args().find_map(|a| a.strip_prefix("--dir=").map(str::to_owned)) {
        let mut files = Vec::new();
        collect_svelte_files(&PathBuf::from(dir), &mut files);
        return files;
    }
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
