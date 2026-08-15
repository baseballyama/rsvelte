//! Separates rsvelte's per-call **fixed** cost from its per-byte cost, and
//! attributes the fixed part to a phase.
//!
//! A ratio against the official compiler that is high on one app and low on
//! another, where the low one has smaller components, is the signature of a cost
//! that does not scale with file size. This measures that directly rather than
//! inferring it: for every file it records `(bytes, nanoseconds)` per phase and
//! fits `t = a + b·n`, where `a` **is** the per-call fixed cost. The size-bucket
//! table beside it is the check — a real intercept shows up as a flat floor in
//! the small buckets, and a fit whose intercept is an artefact of one outlier
//! does not.
//!
//! Phases are timed by re-running the idempotent prefix of the pipeline, the
//! same way `compile_profile` does. `plumbing` is the residual of the end-to-end
//! `compile()` against them, so it holds warnings, CSS assembly, source maps and
//! whatever the split does not name — it is a remainder, not a measurement, and
//! is labelled that way in the output.
//!
//! Usage:
//!   fixed_cost_split                      # the six shipped corpora, client prod
//!   fixed_cost_split --dev
//!   fixed_cost_split --server
//!   fixed_cost_split --dir=/path/to/checkout

// Defined per-bin rather than once in the lib so that linking the `rsvelte_core`
// rlib never imposes an allocator on the consumer.
#[cfg(all(
    feature = "mimalloc-alloc",
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

use std::fs;
use std::path::{Path, PathBuf};
use std::time::Instant;

use rsvelte_core::compiler::phases::phase1_parse::{
    ParseOptions, compute_line_offsets, ensure_script_parsed, parse, resolve_lazy_expressions,
};
use rsvelte_core::compiler::phases::phase2_analyze::analyze_component;
use rsvelte_core::compiler::phases::phase3_transform::transform_component;
use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// One file's cost, split the way the throughput question needs it.
#[derive(Clone, Copy, Default)]
struct Sample {
    bytes: f64,
    /// Whether the component's scripts use runes. The two dialects are
    /// different amounts of work per byte, and shipped applications hold far
    /// more legacy than the component libraries the perf gates sample.
    runes: bool,
    /// Bytes inside `<script>` / `<script module>`. A per-KB rate against the
    /// whole file confounds dialect with how much script the file has at all —
    /// a markup-only wrapper is legacy by default and nearly free.
    script_bytes: f64,
    total: f64,
    parse: f64,
    analyze: f64,
    transform: f64,
}

impl Sample {
    fn plumbing(&self) -> f64 {
        (self.total - self.parse - self.analyze - self.transform).max(0.0)
    }
}

/// Ordinary least squares for `t = a + b·n`.
struct Fit {
    intercept: f64,
    slope: f64,
    /// Share of the phase's total time the intercept accounts for over this
    /// population — the number that answers "does the fixed cost matter here".
    fixed_share: f64,
}

fn fit(samples: &[Sample], value: impl Fn(&Sample) -> f64) -> Fit {
    let n = samples.len() as f64;
    let mean_x = samples.iter().map(|s| s.bytes).sum::<f64>() / n;
    let mean_y = samples.iter().map(&value).sum::<f64>() / n;
    let mut num = 0.0;
    let mut den = 0.0;
    for sample in samples {
        let dx = sample.bytes - mean_x;
        num += dx * (value(sample) - mean_y);
        den += dx * dx;
    }
    let slope = if den == 0.0 { 0.0 } else { num / den };
    let intercept = mean_y - slope * mean_x;
    let total: f64 = samples.iter().map(&value).sum();
    Fit {
        intercept,
        slope,
        fixed_share: if total == 0.0 {
            0.0
        } else {
            (intercept * n / total).clamp(0.0, 1.0)
        },
    }
}

fn measure(files: &[(String, String)], options: &CompileOptions) -> Vec<Sample> {
    let parse_opts = ParseOptions {
        modern: true,
        skip_expression_loc: true,
        defer_script_parse: true,
        ..Default::default()
    };

    let mut samples = Vec::with_capacity(files.len());
    for (_, content) in files {
        let mut sample = Sample {
            bytes: content.len() as f64,
            runes: uses_runes(content),
            ..Default::default()
        };

        let at = Instant::now();
        let compiled = compile(content, options.clone());
        sample.total = at.elapsed().as_secs_f64();
        if compiled.is_err() {
            continue;
        }

        let allocator = oxc_allocator::Allocator::default();
        let at = Instant::now();
        let ast = parse(content, &allocator, parse_opts).ok();
        sample.parse = at.elapsed().as_secs_f64();
        let Some(mut ast) = ast else { continue };
        sample.script_bytes = [ast.instance.as_ref(), ast.module.as_ref()]
            .into_iter()
            .flatten()
            .filter_map(|script| content.get(script.start as usize..script.end as usize))
            .map(|text| text.len() as f64)
            .sum();

        let at = Instant::now();
        // SAFETY: `ast` lives for the rest of this iteration, and the serialize
        // arena pointer is cleared before the borrow ends.
        unsafe { rsvelte_core::ast::arena::set_serialize_arena(&raw const ast.arena) };
        let _ = resolve_lazy_expressions(&mut ast, content);
        let line_offsets = compute_line_offsets(content, false);
        if let Some(ref mut instance) = ast.instance {
            let _ = ensure_script_parsed(&ast.arena, instance, content, &line_offsets);
        }
        if let Some(ref mut module) = ast.module {
            let _ = ensure_script_parsed(&ast.arena, module, content, &line_offsets);
        }
        let analysis = analyze_component(&mut ast, content, options).ok();
        sample.analyze = at.elapsed().as_secs_f64();

        if let Some(analysis) = analysis.as_ref() {
            let at = Instant::now();
            let _ = transform_component(analysis, &ast, content, options);
            sample.transform = at.elapsed().as_secs_f64();
        }
        rsvelte_core::ast::arena::clear_serialize_arena();

        samples.push(sample);
    }
    samples
}

fn main() {
    let files = collect_files();
    if files.is_empty() {
        eprintln!("no .svelte files found — pass --dir=<path>");
        std::process::exit(1);
    }

    let options = CompileOptions {
        generate: if std::env::args().any(|a| a == "--server") {
            GenerateMode::Server
        } else {
            GenerateMode::Client
        },
        dev: std::env::args().any(|a| a == "--dev"),
        ..Default::default()
    };

    // Warm: the first compiles pay lazy-static and allocator warmup, which is
    // itself a fixed cost — but one paid once per process, not per call, and
    // charging it to the intercept would be the exact error this bin exists to
    // avoid.
    for (_, content) in files.iter().take(100) {
        let _ = compile(content, options.clone());
    }

    let samples = measure(&files, &options);
    report(&samples, &options);
}

fn report(samples: &[Sample], options: &CompileOptions) {
    let n = samples.len();
    let bytes: f64 = samples.iter().map(|s| s.bytes).sum();
    println!(
        "target: {:?}{}   files: {n}   bytes: {bytes:.0}   mean file: {:.0} B",
        options.generate,
        if options.dev { " (dev)" } else { "" },
        bytes / n as f64
    );

    let phases: [(&str, fn(&Sample) -> f64); 5] = [
        ("compile (end to end)", |s| s.total),
        ("  parse", |s| s.parse),
        ("  analyze", |s| s.analyze),
        ("  transform", |s| s.transform),
        ("  plumbing (residual)", Sample::plumbing),
    ];

    println!("\nt = a + b·bytes, ordinary least squares");
    println!(
        "  {:<24} {:>12} {:>14} {:>16}",
        "phase", "a (µs/call)", "b (ns/KB)", "fixed share"
    );
    for (label, value) in phases {
        let f = fit(samples, value);
        println!(
            "  {:<24} {:>12.2} {:>14.1} {:>15.1}%",
            label,
            f.intercept * 1e6,
            f.slope * 1e9 * 1024.0,
            f.fixed_share * 100.0
        );
    }

    // The fit's intercept is an extrapolation to zero bytes, which no file is.
    // The buckets are what make it falsifiable: a real per-call cost shows as a
    // floor the smallest bucket cannot go below.
    println!("\nmean per-file time by size bucket");
    println!(
        "  {:<16} {:>7} {:>12} {:>12} {:>12} {:>12} {:>12}",
        "bytes", "files", "compile µs", "parse", "analyze", "transform", "plumbing"
    );
    let edges = [0.0, 1024.0, 2048.0, 4096.0, 8192.0, 16384.0, f64::INFINITY];
    for window in edges.windows(2) {
        let (lo, hi) = (window[0], window[1]);
        let bucket: Vec<&Sample> = samples
            .iter()
            .filter(|s| s.bytes >= lo && s.bytes < hi)
            .collect();
        if bucket.is_empty() {
            continue;
        }
        let k = bucket.len() as f64;
        let mean = |f: fn(&Sample) -> f64| bucket.iter().map(|s| f(s)).sum::<f64>() / k * 1e6;
        println!(
            "  {:<16} {:>7} {:>12.1} {:>12.1} {:>12.1} {:>12.1} {:>12.1}",
            if hi.is_finite() {
                format!("{lo:.0}–{hi:.0}")
            } else {
                format!("{lo:.0}+")
            },
            bucket.len(),
            mean(|s| s.total),
            mean(|s| s.parse),
            mean(|s| s.analyze),
            mean(|s| s.transform),
            mean(Sample::plumbing),
        );
    }

    // If there were a per-call fixed cost, it would be the same for both
    // dialects and would show as the two curves converging at small sizes.
    println!("\nµs per KB of SCRIPT by dialect, within script-size bucket");
    println!(
        "  {:<16} {:>9} {:>12} {:>9} {:>12} {:>10}",
        "script bytes", "runes n", "runes µs/KB", "legacy n", "legacy µs/KB", "legacy/runes"
    );
    for window in edges.windows(2) {
        let (lo, hi) = (window[0], window[1]);
        let rate = |runes: bool| -> Option<(usize, f64)> {
            let bucket: Vec<&Sample> = samples
                .iter()
                .filter(|s| s.script_bytes >= lo && s.script_bytes < hi && s.runes == runes)
                .collect();
            if bucket.is_empty() {
                return None;
            }
            let time: f64 = bucket.iter().map(|s| s.total).sum();
            let kb: f64 = bucket.iter().map(|s| s.script_bytes).sum::<f64>() / 1024.0;
            Some((bucket.len(), time * 1e6 / kb))
        };
        let (Some((rn, rr)), Some((ln, lr))) = (rate(true), rate(false)) else {
            continue;
        };
        println!(
            "  {:<16} {:>9} {:>12.1} {:>9} {:>12.1} {:>10.2}x",
            if hi.is_finite() {
                format!("{lo:.0}–{hi:.0}")
            } else {
                format!("{lo:.0}+")
            },
            rn,
            rr,
            ln,
            lr,
            lr / rr
        );
    }

    // Two files of the same size still differ, so the bucket means above are not
    // a clean floor on their own. The minimum is: no file compiles faster than
    // the per-call cost, whatever else it does.
    let floor = samples
        .iter()
        .map(|s| s.total)
        .fold(f64::INFINITY, f64::min);
    println!(
        "\nfastest single compile in the population: {:.1} µs",
        floor * 1e6
    );
}

/// A component counts as runes-mode if a rune appears anywhere in it. Coarse on
/// purpose: the question is which dialect the file is written in, and a file
/// that mixes them is a legacy file being migrated.
fn uses_runes(content: &str) -> bool {
    const RUNES: [&str; 7] = [
        "$state",
        "$derived",
        "$props",
        "$effect",
        "$bindable",
        "$inspect",
        "$host",
    ];
    RUNES.iter().any(|rune| content.contains(rune))
}

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
    if let Some(dir) = std::env::args().find_map(|a| a.strip_prefix("--dir=").map(str::to_owned)) {
        let mut files = Vec::new();
        collect_svelte_files(&PathBuf::from(dir), &mut files);
        files.sort();
        return files;
    }
    let mut files = Vec::new();
    for project in &SHIPPED_PROJECTS {
        collect_svelte_files(&base.join(project), &mut files);
    }
    files.sort();
    files
}

fn collect_svelte_files(dir: &Path, files: &mut Vec<(String, String)>) {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                if path.file_name().is_some_and(|n| n == "node_modules") {
                    continue;
                }
                collect_svelte_files(&path, files);
            } else if path.extension().is_some_and(|e| e == "svelte")
                && let Ok(content) = fs::read_to_string(&path)
            {
                files.push((path.display().to_string(), content));
            }
        }
    }
}
