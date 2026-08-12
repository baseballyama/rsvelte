//! Production linter-path benchmarks for components and Svelte modules.

use criterion::{BenchmarkId, Criterion, Throughput, criterion_group, criterion_main};
use rsvelte_core::CompileOptions;
use rsvelte_lint::{LintConfig, lint_source};
use std::hint::black_box;
use std::path::Path;

#[path = "../../../benches/common/corpus.rs"]
mod corpus;

fn bench_components(c: &mut Criterion) {
    let files = corpus::load();
    let options = CompileOptions::default();
    let config = LintConfig::recommended();
    let mut group = c.benchmark_group("lint");

    for sample in &files {
        let filename = format!("{}.svelte", sample.id);
        let path = Path::new(&filename);
        let _ = lint_source(&sample.source, path, &options, &config);

        group.throughput(Throughput::Bytes(sample.bytes()));
        group.bench_with_input(
            BenchmarkId::new("component_recommended", &sample.id),
            &sample.source,
            |b, source| {
                b.iter(|| {
                    lint_source(
                        black_box(source),
                        black_box(path),
                        black_box(&options),
                        black_box(&config),
                    )
                });
            },
        );
    }

    group.finish();
}

fn bench_module(c: &mut Criterion) {
    const SOURCE: &str = r"
        let count = $state(0);
        let doubled = $derived(count * 2);
        export function increment() { count += 1; }
        export function current() { return { count, doubled }; }
    ";

    let path = Path::new("state.svelte.ts");
    let options = CompileOptions::default();
    let config = LintConfig::recommended();
    let _ = lint_source(SOURCE, path, &options, &config);

    let mut group = c.benchmark_group("lint_module");
    group.throughput(Throughput::Bytes(SOURCE.len() as u64));
    group.bench_function("typescript_recommended", |b| {
        b.iter(|| {
            lint_source(
                black_box(SOURCE),
                black_box(path),
                black_box(&options),
                black_box(&config),
            )
        });
    });
    group.finish();
}

criterion_group!(benches, bench_components, bench_module);
criterion_main!(benches);
