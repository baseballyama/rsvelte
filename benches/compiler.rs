//! Compiler benchmarks - measures performance of each compilation phase.
//!
//! Phases:
//! 1. Parse - Source code → AST
//! 2. Analyze - Semantic analysis
//! 3. Transform - Code generation

use criterion::{BenchmarkId, Criterion, Throughput, black_box, criterion_group, criterion_main};
use std::fs;
use std::path::PathBuf;

use svelte_compiler_rust::compiler::phases::phase1_parse::{ParseOptions, parse};
use svelte_compiler_rust::compiler::phases::phase2_analyze::analyze_component;
use svelte_compiler_rust::compiler::phases::phase3_transform::transform_component;
use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

/// Get sample Svelte files for benchmarking.
fn get_sample_files() -> Vec<(String, String)> {
    let samples_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("submodules/svelte/packages/svelte/tests/runtime-runes/samples");

    if !samples_dir.exists() {
        eprintln!("Samples directory not found: {:?}", samples_dir);
        return Vec::new();
    }

    let mut files = Vec::new();

    for entry in fs::read_dir(&samples_dir).unwrap() {
        let entry = entry.unwrap();
        let input_path = entry.path().join("input.svelte");

        if input_path.exists() {
            let name = entry.file_name().to_str().unwrap().to_string();
            if let Ok(content) = fs::read_to_string(&input_path) {
                // Skip very small files
                if content.len() > 50 {
                    files.push((name, content));
                }
            }
        }
    }

    // Sort by size for consistent ordering
    files.sort_by_key(|a| a.1.len());

    // Take a representative sample: small, medium, large
    let mut selected = Vec::new();
    if files.len() >= 3 {
        selected.push(files[0].clone()); // smallest
        selected.push(files[files.len() / 2].clone()); // medium
        selected.push(files[files.len() - 1].clone()); // largest
    } else {
        selected = files;
    }

    selected
}

/// Create a large synthetic file for stress testing.
fn create_large_synthetic_file() -> (String, String) {
    let mut source = String::from(
        r#"<script>
    let count = $state(0);
    let doubled = $derived(count * 2);
    function increment() { count++; }
</script>

"#,
    );

    // Add many elements to create a large template
    for i in 0..100 {
        source.push_str(&format!(
            r#"<div class="item-{i}">
    <span>Item {i}: {{count}}</span>
    {{#if count > {i}}}
        <strong>Active</strong>
    {{:else}}
        <em>Inactive</em>
    {{/if}}
</div>
"#
        ));
    }

    ("synthetic-large".to_string(), source)
}

/// Legacy-mode (non-runes) state-var-heavy synthetic. Exercises
/// the AST helpers in `state_assigns_combined_ast` (and its
/// `_simple` / `_compound` / `_update` predecessors) which are
/// only called in non-runes mode.
fn create_legacy_state_var_heavy_file() -> (String, String) {
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
        script.push_str(&format!(
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
        ));
    }
    script.push_str("</script>\n\n");
    for i in 0..20 {
        script.push_str(&format!(
            "<button on:click={{action_{i}}}>Action {i}</button>\n"
        ));
    }
    ("synthetic-legacy-state-heavy".to_string(), script)
}

/// Synthetic file exercising the state-var assignment surface
/// heavily. Used to baseline the perf impact of recent AST
/// migrations (PRs #215-#234, especially #230-#234 which deleted
/// ~2040 LOC of text scanners in favor of AST passes).
///
/// Each state var is read, simple-assigned, compound-assigned,
/// and updated in a body that mimics typical reactive logic.
/// Runes mode so all state assigns go through the AST helpers.
fn create_state_var_heavy_file() -> (String, String) {
    let mut script = String::from(
        r#"<script>
    let count = $state(0);
    let total = $state(0);
    let items = $state([]);
    let flag = $state(false);
    let name = $state('');

"#,
    );
    // Build a function body with many state-var ops — covers the
    // simple/compound/update/reads paths in one pass.
    for i in 0..40 {
        script.push_str(&format!(
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
        ));
    }
    script.push_str("</script>\n\n");
    for i in 0..20 {
        script.push_str(&format!(
            "<button on:click={{action_{i}}}>Action {i}</button>\n"
        ));
    }
    ("synthetic-state-heavy".to_string(), script)
}

/// Benchmark Phase 1: Parsing
fn bench_phase1_parse(c: &mut Criterion) {
    let mut files = get_sample_files();
    files.push(create_large_synthetic_file());
    files.push(create_state_var_heavy_file());
    files.push(create_legacy_state_var_heavy_file());

    if files.is_empty() {
        eprintln!("No sample files found for benchmarking");
        return;
    }

    let mut group = c.benchmark_group("phase1_parse");

    for (name, content) in &files {
        let size = content.len() as u64;
        group.throughput(Throughput::Bytes(size));

        group.bench_with_input(BenchmarkId::new("parse", name), content, |b, source| {
            b.iter(|| {
                let options = ParseOptions {
                    modern: true,
                    loose: false,
                    ..Default::default()
                };
                parse(black_box(source), options)
            });
        });
    }

    group.finish();
}

/// Benchmark Phase 2: Analysis
fn bench_phase2_analyze(c: &mut Criterion) {
    let mut files = get_sample_files();
    files.push(create_large_synthetic_file());
    files.push(create_state_var_heavy_file());
    files.push(create_legacy_state_var_heavy_file());

    if files.is_empty() {
        eprintln!("No sample files found for benchmarking");
        return;
    }

    let mut group = c.benchmark_group("phase2_analyze");

    for (name, content) in &files {
        let size = content.len() as u64;
        group.throughput(Throughput::Bytes(size));

        // Pre-parse the AST (not included in measurement)
        let parse_options = ParseOptions {
            modern: true,
            loose: false,
            ..Default::default()
        };
        let ast_result = parse(content, parse_options);
        if ast_result.is_err() {
            continue;
        }

        let compile_options = CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        };

        group.bench_with_input(BenchmarkId::new("analyze", name), content, |b, source| {
            b.iter(|| {
                let mut ast = parse(source, parse_options).unwrap();
                analyze_component(black_box(&mut ast), black_box(source), &compile_options)
            });
        });
    }

    group.finish();
}

/// Benchmark Phase 3: Transform (Client)
fn bench_phase3_transform_client(c: &mut Criterion) {
    let mut files = get_sample_files();
    files.push(create_large_synthetic_file());
    files.push(create_state_var_heavy_file());
    files.push(create_legacy_state_var_heavy_file());

    if files.is_empty() {
        eprintln!("No sample files found for benchmarking");
        return;
    }

    let mut group = c.benchmark_group("phase3_transform_client");

    for (name, content) in &files {
        let size = content.len() as u64;
        group.throughput(Throughput::Bytes(size));

        // Pre-parse and analyze (not included in measurement)
        let parse_options = ParseOptions {
            modern: true,
            loose: false,
            ..Default::default()
        };
        let ast_result = parse(content, parse_options);
        if ast_result.is_err() {
            continue;
        }
        let mut ast = ast_result.unwrap();

        let compile_options = CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        };

        let analysis_result = analyze_component(&mut ast, content, &compile_options);
        if analysis_result.is_err() {
            continue;
        }
        let analysis = analysis_result.unwrap();

        group.bench_with_input(
            BenchmarkId::new("transform_client", name),
            content,
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

/// Benchmark Phase 3: Transform (Server)
fn bench_phase3_transform_server(c: &mut Criterion) {
    let mut files = get_sample_files();
    files.push(create_large_synthetic_file());
    files.push(create_state_var_heavy_file());
    files.push(create_legacy_state_var_heavy_file());

    if files.is_empty() {
        eprintln!("No sample files found for benchmarking");
        return;
    }

    let mut group = c.benchmark_group("phase3_transform_server");

    for (name, content) in &files {
        let size = content.len() as u64;
        group.throughput(Throughput::Bytes(size));

        // Pre-parse and analyze (not included in measurement)
        let parse_options = ParseOptions {
            modern: true,
            loose: false,
            ..Default::default()
        };
        let ast_result = parse(content, parse_options);
        if ast_result.is_err() {
            continue;
        }
        let mut ast = ast_result.unwrap();

        let compile_options = CompileOptions {
            generate: GenerateMode::Server,
            ..Default::default()
        };

        let analysis_result = analyze_component(&mut ast, content, &compile_options);
        if analysis_result.is_err() {
            continue;
        }
        let analysis = analysis_result.unwrap();

        group.bench_with_input(
            BenchmarkId::new("transform_server", name),
            content,
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

/// Benchmark full compilation pipeline
fn bench_full_compile(c: &mut Criterion) {
    let mut files = get_sample_files();
    files.push(create_large_synthetic_file());
    files.push(create_state_var_heavy_file());
    files.push(create_legacy_state_var_heavy_file());

    if files.is_empty() {
        eprintln!("No sample files found for benchmarking");
        return;
    }

    let mut group = c.benchmark_group("full_compile");

    for (name, content) in &files {
        let size = content.len() as u64;
        group.throughput(Throughput::Bytes(size));

        // Client mode
        group.bench_with_input(BenchmarkId::new("client", name), content, |b, source| {
            b.iter(|| {
                let options = CompileOptions {
                    generate: GenerateMode::Client,
                    ..Default::default()
                };
                compile(black_box(source), options)
            });
        });

        // Server mode
        group.bench_with_input(BenchmarkId::new("server", name), content, |b, source| {
            b.iter(|| {
                let options = CompileOptions {
                    generate: GenerateMode::Server,
                    ..Default::default()
                };
                compile(black_box(source), options)
            });
        });
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
);
criterion_main!(benches);
