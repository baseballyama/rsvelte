//! Serial-compile profile over a real-world `.svelte` corpus.
//!
//! Ground truth is the wall time of the production `compile()` entry point;
//! the per-phase split re-runs the same pipeline stage by stage on one file at
//! a time (matching production's allocation pattern), so the residual against
//! the ground truth is the un-instrumentable remainder (TypeScript strip,
//! `<svelte:options>` merge, result finalization).
//!
//! Passes are interleaved across modes and the **minimum** over repetitions is
//! reported: this box runs at load average ~20, so the mean of a few passes
//! swings ±20% while the minimum is stable to ~2%.

// Defined per-bin rather than once in the lib so that linking the `rsvelte_core`
// rlib never imposes an allocator on the consumer. Matches the NAPI cdylib.
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

use rsvelte_core::compiler::phases::phase1_parse::{
    ParseOptions, compute_line_offsets, ensure_script_parsed, parse, resolve_lazy_expressions,
};
use rsvelte_core::compiler::phases::phase2_analyze::analyze_component;
use rsvelte_core::compiler::phases::phase3_transform::{profile, transform_component};
use rsvelte_core::{CompileOptions, GenerateMode};

/// Parse options used by the production `compile()` front half.
const PARSE_OPTS: ParseOptions = ParseOptions {
    modern: true,
    loose: false,
    skip_expression_loc: true,
    defer_script_parse: true,
    force_typescript: false,
    lenient_script: false,
    skip_non_css_lang_style: false,
    capture_comments: false,
};

#[derive(Clone, Copy)]
struct Mode {
    label: &'static str,
    generate: GenerateMode,
    dev: bool,
}

const MODES: [Mode; 3] = [
    Mode {
        label: "client-prod",
        generate: GenerateMode::Client,
        dev: false,
    },
    Mode {
        label: "client-dev",
        generate: GenerateMode::Client,
        dev: true,
    },
    Mode {
        label: "server-prod",
        generate: GenerateMode::Server,
        dev: false,
    },
];

impl Mode {
    fn options(self, sourcemap: bool) -> CompileOptions {
        CompileOptions {
            generate: self.generate,
            dev: self.dev,
            enable_sourcemap: sourcemap,
            ..Default::default()
        }
    }
}

#[derive(Default)]
struct Split {
    parse: Duration,
    lazy: Duration,
    script: Duration,
    analyze: Duration,
    transform: Duration,
    p3: profile::Phase3Breakdown,
}

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let reps = flag_num(&args, "--reps").unwrap_or(9);
    let only_mode = flag_value(&args, "--mode");
    let want_split = args.iter().any(|a| a == "--split");
    let slowest = flag_num(&args, "--slowest").unwrap_or(0);
    let roots = corpus_roots(&args);

    let files = collect(&roots);
    let modes: Vec<Mode> = MODES
        .iter()
        .copied()
        .filter(|m| {
            only_mode
                .as_deref()
                .is_none_or(|want| want == "all" || want == m.label)
        })
        .collect();

    // Establish the compilable subset so every measured pass does identical work.
    let live: Vec<usize> = (0..files.len())
        .filter(|&i| {
            modes
                .iter()
                .all(|m| rsvelte_core::compile(&files[i].1, m.options(true)).is_ok())
        })
        .collect();
    let live_bytes: usize = live.iter().map(|&i| files[i].1.len()).sum();
    eprintln!(
        "corpus {} files -> compilable {} ({:.2} MB), skipped {}",
        files.len(),
        live.len(),
        live_bytes as f64 / 1e6,
        files.len() - live.len()
    );

    // Sampler target: loop the production entry point for one mode only, so a
    // CPU profile of this process attributes cleanly to that mode.
    if let Some(secs) = flag_num(&args, "--loop-secs") {
        let mode = modes[0];
        let opts = mode.options(true);
        let deadline = Instant::now() + Duration::from_secs(secs as u64);
        let mut passes = 0u64;
        while Instant::now() < deadline {
            for &i in &live {
                std::hint::black_box(rsvelte_core::compile(&files[i].1, opts.clone()).is_ok());
            }
            passes += 1;
        }
        eprintln!("loop {} done: {passes} passes", mode.label);
        return;
    }

    println!("# rsvelte serial-compile profile (min of {reps} interleaved passes)");
    println!("# files={} bytes={}", live.len(), live_bytes);

    // --- Ground truth: the production entry point, interleaved across modes. ---
    let mut with_map: Vec<Vec<Duration>> = vec![Vec::new(); modes.len()];
    let mut no_map: Vec<Vec<Duration>> = vec![Vec::new(); modes.len()];
    for _ in 0..reps {
        for (m, mode) in modes.iter().enumerate() {
            with_map[m].push(compile_pass(&files, &live, mode.options(true)));
            no_map[m].push(compile_pass(&files, &live, mode.options(false)));
        }
    }

    println!("\n## compile() wall time");
    println!(
        "{:<13} {:>10} {:>10} {:>7} {:>10} {:>10} {:>9}",
        "mode", "min ms", "median ms", "spread", "us/file", "MB/s", "no-map ms"
    );
    for (m, mode) in modes.iter().enumerate() {
        let min = *with_map[m].iter().min().unwrap();
        let med = median(&mut with_map[m].clone());
        let nmin = *no_map[m].iter().min().unwrap();
        println!(
            "{:<13} {:>10.2} {:>10.2} {:>6.1}% {:>10.2} {:>10.1} {:>9.2}  (sourcemap {:.2} ms = {:.1}%)",
            mode.label,
            msf(min),
            msf(med),
            (msf(med) / msf(min) - 1.0) * 100.0,
            min.as_secs_f64() * 1e6 / live.len() as f64,
            live_bytes as f64 / min.as_secs_f64() / 1e6,
            msf(nmin),
            msf(min.saturating_sub(nmin)),
            (msf(min) - msf(nmin)) / msf(min) * 100.0,
        );
    }

    if slowest > 0 {
        for mode in &modes {
            report_slowest(*mode, &files, &live, slowest);
        }
    }

    if want_split {
        for mode in &modes {
            report_split(*mode, &files, &live, reps);
        }
    }
}

fn compile_pass(files: &[(String, String)], live: &[usize], opts: CompileOptions) -> Duration {
    let start = Instant::now();
    for &i in live {
        std::hint::black_box(rsvelte_core::compile(&files[i].1, opts.clone()).is_ok());
    }
    start.elapsed()
}

/// Per-phase split. Uses the public phase entry points rather than the private
/// `compile()` internals, so `transform_component` runs **without** the retained
/// scripts the production path reuses — the transform figure is an upper bound.
fn report_split(mode: Mode, files: &[(String, String)], live: &[usize], reps: usize) {
    let opts = mode.options(true);
    let mut best: Option<Split> = None;
    for _ in 0..reps.min(3) {
        let _ = profile::take_breakdown();
        let mut s = Split::default();
        for &i in live {
            let src = &files[i].1;
            let alloc = oxc_allocator::Allocator::default();

            let t = Instant::now();
            let Ok(mut ast) = parse(src, &alloc, PARSE_OPTS) else {
                continue;
            };
            s.parse += t.elapsed();

            // SAFETY: `ast` lives for the rest of this iteration and the arena
            // pointer is cleared before it is dropped.
            unsafe { rsvelte_core::ast::arena::set_serialize_arena(&ast.arena as *const _) };

            let t = Instant::now();
            let _ = resolve_lazy_expressions(&mut ast, src);
            s.lazy += t.elapsed();

            let t = Instant::now();
            let line_offsets = compute_line_offsets(src, false);
            if let Some(ref mut instance) = ast.instance {
                let _ = ensure_script_parsed(&ast.arena, instance, src, &line_offsets);
            }
            if let Some(ref mut module) = ast.module {
                let _ = ensure_script_parsed(&ast.arena, module, src, &line_offsets);
            }
            s.script += t.elapsed();

            let t = Instant::now();
            let analysis = analyze_component(&mut ast, src, &opts);
            s.analyze += t.elapsed();

            if let Ok(analysis) = analysis {
                let t = Instant::now();
                std::hint::black_box(transform_component(&analysis, &ast, src, &opts).is_ok());
                s.transform += t.elapsed();
            }

            rsvelte_core::ast::arena::clear_serialize_arena();
        }
        s.p3 = profile::take_breakdown();
        let sum = s.parse + s.lazy + s.script + s.analyze + s.transform;
        if best
            .as_ref()
            .is_none_or(|b| sum < b.parse + b.lazy + b.script + b.analyze + b.transform)
        {
            best = Some(s);
        }
    }
    let s = best.unwrap();
    let total = s.parse + s.lazy + s.script + s.analyze + s.transform;
    let pct = |d: Duration| d.as_secs_f64() / total.as_secs_f64() * 100.0;
    let p3_other = s
        .transform
        .saturating_sub(s.p3.visit_program)
        .saturating_sub(s.p3.script_text_transform)
        .saturating_sub(s.p3.template_fragment)
        .saturating_sub(s.p3.assembly_after_fragment)
        .saturating_sub(s.p3.css_render)
        .saturating_sub(s.p3.codegen);

    println!(
        "\n## phase split — {} (sum {:.2} ms)",
        mode.label,
        msf(total)
    );
    let row =
        |name: &str, d: Duration| println!("  {:<22} {:>9.2} ms  {:>5.1}%", name, msf(d), pct(d));
    row("P1 parse (template)", s.parse);
    row("P1 resolve-lazy expr", s.lazy);
    row("P1 script parse (oxc)", s.script);
    row("P2 analyze", s.analyze);
    row("P3 transform", s.transform);
    row("  . visit_program", s.p3.visit_program);
    row("  . script-text xform", s.p3.script_text_transform);
    row("  . template fragment", s.p3.template_fragment);
    row("  . assembly", s.p3.assembly_after_fragment);
    row("  . css render", s.p3.css_render);
    row("  . js codegen", s.p3.codegen);
    row("  . p3 uninstrumented", p3_other);
}

fn report_slowest(mode: Mode, files: &[(String, String)], live: &[usize], n: usize) {
    let opts = mode.options(true);
    // Two passes, keep the faster time per file, so a scheduler hiccup on one
    // pass does not manufacture an outlier.
    let mut per_file: Vec<(Duration, &str)> = live
        .iter()
        .map(|&i| {
            let mut best = Duration::MAX;
            for _ in 0..2 {
                let t = Instant::now();
                std::hint::black_box(rsvelte_core::compile(&files[i].1, opts.clone()).is_ok());
                best = best.min(t.elapsed());
            }
            (best, files[i].0.as_str())
        })
        .collect();
    per_file.sort_by_key(|entry| std::cmp::Reverse(entry.0));
    let sum: Duration = per_file.iter().map(|(d, _)| *d).sum();
    println!(
        "\n## slowest files — {} (sum of per-file minima {:.2} ms)",
        mode.label,
        msf(sum)
    );
    for (d, path) in per_file.iter().take(n) {
        println!("  {:8.3} ms  {}", msf(*d), tail_path(path));
    }
}

fn msf(d: Duration) -> f64 {
    d.as_secs_f64() * 1000.0
}

fn median(v: &mut [Duration]) -> Duration {
    v.sort();
    v[v.len() / 2]
}

fn tail_path(path: &str) -> String {
    let parts: Vec<&str> = path.rsplit('/').take(3).collect();
    parts.into_iter().rev().collect::<Vec<_>>().join("/")
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

fn collect(roots: &[PathBuf]) -> Vec<(String, String)> {
    let mut out = Vec::new();
    for root in roots {
        walk(root, &mut out);
    }
    out.sort_by(|a, b| a.0.cmp(&b.0));
    out
}

fn walk(dir: &Path, out: &mut Vec<(String, String)>) {
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
        } else if path.extension().is_some_and(|e| e == "svelte")
            && let Ok(content) = fs::read_to_string(&path)
        {
            out.push((path.display().to_string(), content));
        }
    }
}
