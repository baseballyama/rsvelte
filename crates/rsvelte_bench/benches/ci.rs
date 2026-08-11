use criterion::{BenchmarkId, Criterion, Throughput, criterion_group, criterion_main};
use rsvelte_core::{CompileOptions, GenerateMode, compile, compile_both};
use std::hint::black_box;

struct Case {
    id: &'static str,
    source: &'static str,
    options: CompileOptions,
}

fn cases() -> [Case; 4] {
    [
        Case {
            id: "client/runes-counter",
            source: include_str!("../../../benches/corpus/01-runes-counter.svelte"),
            options: CompileOptions {
                generate: GenerateMode::Client,
                ..Default::default()
            },
        },
        Case {
            id: "client/css-heavy",
            source: include_str!("../../../benches/corpus/06-css-heavy.svelte"),
            options: CompileOptions {
                generate: GenerateMode::Client,
                ..Default::default()
            },
        },
        Case {
            id: "server/legacy-reactive",
            source: include_str!("../../../benches/corpus/05-legacy-reactive.svelte"),
            options: CompileOptions {
                generate: GenerateMode::Server,
                ..Default::default()
            },
        },
        Case {
            id: "client-dev/typescript-generics",
            source: include_str!("../../../benches/corpus/09-typescript-generics.svelte"),
            options: CompileOptions {
                dev: true,
                generate: GenerateMode::Client,
                ..Default::default()
            },
        },
    ]
}

fn bench_compile(c: &mut Criterion) {
    let mut group = c.benchmark_group("compile");
    for case in cases() {
        group.throughput(Throughput::Bytes(case.source.len() as u64));
        group.bench_with_input(BenchmarkId::from_parameter(case.id), &case, |b, case| {
            b.iter(|| compile(black_box(case.source), black_box(case.options.clone())))
        });
    }
    group.finish();
}

fn bench_compile_both(c: &mut Criterion) {
    let source = include_str!("../../../benches/corpus/03-data-table.svelte");
    let mut group = c.benchmark_group("compile_both");
    group.throughput(Throughput::Bytes(source.len() as u64));
    group.bench_function("data-table", |b| {
        b.iter(|| compile_both(black_box(source), CompileOptions::default()))
    });
    group.finish();
}

criterion_group!(benches, bench_compile, bench_compile_both);
criterion_main!(benches);
