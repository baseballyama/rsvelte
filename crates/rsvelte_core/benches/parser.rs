//! Parser benchmarks.
//!
//! Measures single-file `parse` and the parallel `parse_parallel` path used by
//! batch tooling. Inputs come from the **pinned, in-repo corpus** at
//! `benches/corpus/` (committed to the repo, never read from the `svelte`
//! submodule) so the workload — and the benchmark IDs — stay stable across
//! submodule bumps, which is what makes the CodSpeed regression diff valid.

use criterion::{BenchmarkId, Criterion, Throughput, criterion_group, criterion_main};
use std::hint::black_box;

use rsvelte_core::{ParseOptions, parse, parse_parallel};

#[path = "common/corpus.rs"]
mod corpus;

fn bench_single_parse(c: &mut Criterion) {
    let files = corpus::load();
    let mut group = c.benchmark_group("single_parse");

    for sample in &files {
        group.throughput(Throughput::Bytes(sample.bytes()));
        group.bench_with_input(
            BenchmarkId::new("parse", &sample.id),
            &sample.source,
            |b, source| {
                b.iter(|| parse(black_box(source), ParseOptions::default()));
            },
        );
    }

    group.finish();
}

fn bench_parallel_parse(c: &mut Criterion) {
    let files = corpus::load();
    let total_size: u64 = files.iter().map(|s| s.bytes()).sum();

    let sources: Vec<(&str, &str)> = files
        .iter()
        .map(|s| (s.id.as_str(), s.source.as_str()))
        .collect();

    let mut group = c.benchmark_group("parallel_parse");
    group.throughput(Throughput::Bytes(total_size));
    group.bench_function("corpus", |b| {
        b.iter(|| parse_parallel(black_box(sources.clone()), ParseOptions::default()));
    });
    group.finish();
}

criterion_group!(benches, bench_single_parse, bench_parallel_parse);
criterion_main!(benches);
