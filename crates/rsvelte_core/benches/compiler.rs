//! Compiler benchmarks — per-phase and end-to-end compile cost.
//!
//! These are the primary inputs to the CodSpeed regression gate and the
//! Criterion baseline (`bench.yml`). For that signal to mean anything the
//! workload must be **identical** between the base commit and a PR, so every
//! input here is either:
//!
//!   1. a file from the **pinned, in-repo corpus** at `benches/corpus/`
//!      (committed to the repo — never read from the `svelte` submodule, which
//!      is bumped continuously and would silently change the workload and the
//!      benchmark IDs), or
//!   2. a **deterministic synthetic** generated in-code (a pure function, so
//!      it's stable without committing a large file).
//!
//! Benchmark IDs are derived from stable, feature-tagged names, so CodSpeed
//! keeps a continuous per-benchmark history across `svelte` bumps.
//!
//! Phases: 1. Parse → 2. Analyze → 3. Transform, plus the full `compile`
//! entry point (CSR + SSR) and the dual-output `compile_both` path.

// Match the shipped NAPI cdylib's global allocator (mimalloc) so the tracked
// benchmark reflects production compile() cost. mimalloc A/B-measured ~11%
// faster than jemalloc on this allocation-bound workload (mold links mimalloc
// for the same reason); the previous bench used the system allocator and so
// understated neither — it simply measured a different allocator than ships.
// `not(feature = "napi")` mirrors the bin entry points: under `--all-features`
// (CI clippy) the `napi` feature compiles napi.rs's `#[global_allocator]` into the
// rlib this bench links, so the bench must not register a second one.
#[cfg(all(
    feature = "mimalloc-alloc",
    not(feature = "napi"),
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

use criterion::{BenchmarkId, Criterion, Throughput, criterion_group, criterion_main};
use std::fmt::Write as _;
use std::hint::black_box;

use rsvelte_core::compiler::phases::phase1_parse::{ParseOptions, parse};
use rsvelte_core::compiler::phases::phase2_analyze::analyze_component;
use rsvelte_core::compiler::phases::phase3_transform::transform_component;
use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[path = "common/corpus.rs"]
mod corpus;
use corpus::Sample;

/// Modern (runes-capable) parse options used throughout the bench.
fn parse_opts() -> ParseOptions {
    ParseOptions {
        modern: true,
        loose: false,
        ..Default::default()
    }
}

/// The full benchmark workload: the pinned corpus plus deterministic
/// synthetic scale/feature stress files. Stable order, stable IDs.
fn workload() -> Vec<Sample> {
    let mut files = corpus::load();
    files.push(create_large_synthetic_file());
    files.push(create_state_var_heavy_file());
    files.push(create_legacy_state_var_heavy_file());
    files
}

/// A large markup-heavy synthetic, to stress template/codegen scaling.
fn create_large_synthetic_file() -> Sample {
    let mut source = String::from(
        r#"<script>
    let count = $state(0);
    let doubled = $derived(count * 2);
    function increment() { count++; }
</script>

"#,
    );

    for i in 0..100 {
        let _ = write!(
            source,
            r#"<div class="item-{i}">
    <span>Item {i}: {{count}}</span>
    {{#if count > {i}}}
        <strong>Active</strong>
    {{:else}}
        <em>Inactive</em>
    {{/if}}
</div>
"#
        );
    }

    Sample::synthetic("synthetic-large", source)
}

/// Legacy-mode (non-runes) state-var-heavy synthetic. Exercises the AST
/// helpers in `state_assigns_combined_ast` (and its `_simple` / `_compound`
/// / `_update` predecessors) which are only called in non-runes mode.
fn create_legacy_state_var_heavy_file() -> Sample {
    let mut script = String::from(
        r#"<script>
    let count = 0;
    let total = 0;
    let items = [];
    let flag = false;
    let name = '';

"#,
    );
    for i in 0..40 {
        let _ = write!(
            script,
            r#"    function action_{i}() {{
        count = {i};
        total += count;
        total -= 1;
        items = [...items, count];
        flag = !flag;
        name = `item-${{count}}`;
        count++;
        total *= 2;
        if (flag) {{
            let local = count + total;
            items = items.concat([local]);
        }}
        count ??= 0;
    }}
"#
        );
    }
    script.push_str("</script>\n\n");
    for i in 0..20 {
        let _ = writeln!(
            script,
            "<button on:click={{action_{i}}}>Action {i}</button>"
        );
    }
    Sample::synthetic("synthetic-legacy-state-heavy", script)
}

/// Runes-mode state-var assignment stress. Each state var is read,
/// simple-assigned, compound-assigned, and updated in a body that mimics
/// typical reactive logic, exercising the AST state-assign helpers.
fn create_state_var_heavy_file() -> Sample {
    let mut script = String::from(
        r#"<script>
    let count = $state(0);
    let total = $state(0);
    let items = $state([]);
    let flag = $state(false);
    let name = $state('');

"#,
    );
    for i in 0..40 {
        let _ = write!(
            script,
            r#"    function action_{i}() {{
        count = {i};
        total += count;
        total -= 1;
        items = [...items, count];
        flag = !flag;
        name = `item-${{count}}`;
        count++;
        total *= 2;
        if (flag) {{
            let local = count + total;
            items = items.concat([local]);
        }}
        count ??= 0;
    }}
"#
        );
    }
    script.push_str("</script>\n\n");
    for i in 0..20 {
        let _ = writeln!(
            script,
            "<button on:click={{action_{i}}}>Action {i}</button>"
        );
    }
    Sample::synthetic("synthetic-state-heavy", script)
}

/// Phase 1: Parsing.
fn bench_phase1_parse(c: &mut Criterion) {
    let files = workload();
    let mut group = c.benchmark_group("phase1_parse");

    for sample in &files {
        group.throughput(Throughput::Bytes(sample.bytes()));
        group.bench_with_input(
            BenchmarkId::new("parse", &sample.id),
            &sample.source,
            |b, source| {
                b.iter(|| parse(black_box(source), parse_opts()));
            },
        );
    }

    group.finish();
}

/// Phase 2: Analysis.
fn bench_phase2_analyze(c: &mut Criterion) {
    let files = workload();
    let mut group = c.benchmark_group("phase2_analyze");

    for sample in &files {
        let compile_options = CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        };
        // Sanity-check the input compiles so the workload stays fixed.
        sample.assert_parses();

        group.throughput(Throughput::Bytes(sample.bytes()));
        group.bench_with_input(
            BenchmarkId::new("analyze", &sample.id),
            &sample.source,
            |b, source| {
                b.iter(|| {
                    let mut ast = parse(source, parse_opts()).unwrap();
                    analyze_component(black_box(&mut ast), black_box(source), &compile_options)
                });
            },
        );
    }

    group.finish();
}

/// Run a transform benchmark for the given generate mode.
fn bench_transform(c: &mut Criterion, mode: GenerateMode, group_name: &str, id_prefix: &str) {
    let files = workload();
    let mut group = c.benchmark_group(group_name);

    for sample in &files {
        let compile_options = CompileOptions {
            generate: mode,
            ..Default::default()
        };

        // Pre-parse and analyze (not included in measurement).
        let mut ast = parse(&sample.source, parse_opts())
            .unwrap_or_else(|_| panic!("corpus sample {} failed to parse", sample.id));
        let analysis = analyze_component(&mut ast, &sample.source, &compile_options)
            .unwrap_or_else(|_| panic!("corpus sample {} failed to analyze", sample.id));

        group.throughput(Throughput::Bytes(sample.bytes()));
        group.bench_with_input(
            BenchmarkId::new(id_prefix, &sample.id),
            &sample.source,
            |b, source| {
                b.iter(|| {
                    transform_component(
                        black_box(&analysis),
                        black_box(&ast),
                        black_box(source),
                        &compile_options,
                    )
                });
            },
        );
    }

    group.finish();
}

/// Phase 3: Transform (Client).
fn bench_phase3_transform_client(c: &mut Criterion) {
    bench_transform(
        c,
        GenerateMode::Client,
        "phase3_transform_client",
        "transform_client",
    );
}

/// Phase 3: Transform (Server).
fn bench_phase3_transform_server(c: &mut Criterion) {
    bench_transform(
        c,
        GenerateMode::Server,
        "phase3_transform_server",
        "transform_server",
    );
}

/// Full compilation pipeline (the production `compile` entry point), CSR + SSR.
fn bench_full_compile(c: &mut Criterion) {
    let files = workload();
    let mut group = c.benchmark_group("full_compile");

    for sample in &files {
        // Fail loudly if a corpus fixture stops compiling — keeps the
        // CodSpeed workload fixed and complete (no silent skips).
        sample.assert_compiles();

        group.throughput(Throughput::Bytes(sample.bytes()));

        group.bench_with_input(
            BenchmarkId::new("client", &sample.id),
            &sample.source,
            |b, source| {
                b.iter(|| {
                    compile(
                        black_box(source),
                        CompileOptions {
                            generate: GenerateMode::Client,
                            ..Default::default()
                        },
                    )
                });
            },
        );

        group.bench_with_input(
            BenchmarkId::new("server", &sample.id),
            &sample.source,
            |b, source| {
                b.iter(|| {
                    compile(
                        black_box(source),
                        CompileOptions {
                            generate: GenerateMode::Server,
                            ..Default::default()
                        },
                    )
                });
            },
        );
    }

    group.finish();
}

/// Dual-output (CSR + SSR) path: `compile_both` (one shared parse+analyze, two
/// transforms — mold principle P5) vs the status quo of two separate `compile`
/// calls (which re-parse and re-analyze the same source).
fn bench_compile_both(c: &mut Criterion) {
    let files = workload();
    let mut group = c.benchmark_group("compile_both");

    for sample in &files {
        group.throughput(Throughput::Bytes(sample.bytes()));

        // Status quo: two separate compiles (each re-parses + re-analyzes).
        group.bench_with_input(
            BenchmarkId::new("two_compiles", &sample.id),
            &sample.source,
            |b, source| {
                b.iter(|| {
                    let client = compile(
                        black_box(source),
                        CompileOptions {
                            generate: GenerateMode::Client,
                            ..Default::default()
                        },
                    );
                    let server = compile(
                        black_box(source),
                        CompileOptions {
                            generate: GenerateMode::Server,
                            ..Default::default()
                        },
                    );
                    (client, server)
                });
            },
        );

        // Shared parse+analyze, two transforms.
        group.bench_with_input(
            BenchmarkId::new("compile_both", &sample.id),
            &sample.source,
            |b, source| {
                b.iter(|| rsvelte_core::compile_both(black_box(source), CompileOptions::default()));
            },
        );
    }

    group.finish();
}

criterion_group!(
    benches,
    bench_phase1_parse,
    bench_phase2_analyze,
    bench_phase3_transform_client,
    bench_phase3_transform_server,
    bench_full_compile,
    bench_compile_both,
);
criterion_main!(benches);
