//! Parser benchmarks.
//!
//! Measures the performance of the Svelte parser on various inputs.

use criterion::{BenchmarkId, Criterion, Throughput, criterion_group, criterion_main};
use std::fs;
use std::hint::black_box;
use std::path::PathBuf;

use svelte_compiler_rust::{ParseOptions, parse, parse_parallel};

/// Get sample Svelte files for benchmarking.
fn get_sample_files() -> Vec<(String, String)> {
    let samples_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..")
        .join("submodules/svelte/packages/svelte/tests/parser-modern/samples");

    if !samples_dir.exists() {
        return Vec::new();
    }

    let mut files = Vec::new();

    for entry in fs::read_dir(&samples_dir).unwrap() {
        let entry = entry.unwrap();
        let input_path = entry.path().join("input.svelte");

        if input_path.exists() {
            let name = entry.file_name().to_str().unwrap().to_string();
            let content = fs::read_to_string(&input_path).unwrap();
            files.push((name, content));
        }
    }

    files
}

fn bench_single_parse(c: &mut Criterion) {
    let files = get_sample_files();

    if files.is_empty() {
        eprintln!("No sample files found for benchmarking");
        return;
    }

    let mut group = c.benchmark_group("single_parse");

    for (name, content) in &files {
        let size = content.len() as u64;
        group.throughput(Throughput::Bytes(size));

        group.bench_with_input(BenchmarkId::new("parse", name), content, |b, source| {
            b.iter(|| {
                let options = ParseOptions::default();
                parse(black_box(source), options)
            });
        });
    }

    group.finish();
}

fn bench_parallel_parse(c: &mut Criterion) {
    let files = get_sample_files();

    if files.is_empty() {
        eprintln!("No sample files found for benchmarking");
        return;
    }

    let total_size: u64 = files.iter().map(|(_, c)| c.len() as u64).sum();

    let mut group = c.benchmark_group("parallel_parse");
    group.throughput(Throughput::Bytes(total_size));

    let sources: Vec<(&str, &str)> = files
        .iter()
        .map(|(name, content)| (name.as_str(), content.as_str()))
        .collect();

    group.bench_function("all_samples", |b| {
        b.iter(|| {
            let options = ParseOptions::default();
            parse_parallel(black_box(sources.clone()), options)
        });
    });

    group.finish();
}

criterion_group!(benches, bench_single_parse, bench_parallel_parse);
criterion_main!(benches);
