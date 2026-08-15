use criterion::{BenchmarkId, Criterion, Throughput, criterion_group, criterion_main};
use oxc_allocator::Allocator;
use oxc_codegen::{Codegen, CodegenOptions};
use oxc_parser::{ParseOptions, Parser};
use oxc_span::SourceType;
use rsvelte_core::{CompileOptions, GenerateMode, compile, compile_both};
use std::hint::black_box;

const PRINTER_SOURCES: [&str; 11] = [
    include_str!("../../../benches/printer-corpus/01-runes-counter.esrap.js"),
    include_str!("../../../benches/printer-corpus/02-todo-app.esrap.js"),
    include_str!("../../../benches/printer-corpus/03-data-table.esrap.js"),
    include_str!("../../../benches/printer-corpus/04-form-bindings.esrap.js"),
    include_str!("../../../benches/printer-corpus/05-legacy-reactive.esrap.js"),
    include_str!("../../../benches/printer-corpus/06-css-heavy.esrap.js"),
    include_str!("../../../benches/printer-corpus/07-snippets.esrap.js"),
    include_str!("../../../benches/printer-corpus/08-control-flow.esrap.js"),
    include_str!("../../../benches/printer-corpus/09-typescript-generics.esrap.js"),
    include_str!("../../../benches/printer-corpus/10-legacy-typescript-props.esrap.js"),
    include_str!("../../../benches/printer-corpus/11-store-heavy-legacy.esrap.js"),
];
const COMMENT_SOURCE: &str = include_str!("../../../benches/printer-corpus/12-comments-common.js");

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

fn bench_printers(c: &mut Criterion) {
    let allocator = Allocator::default();
    let programs: Vec<_> = PRINTER_SOURCES
        .iter()
        .map(|source| parse(&allocator, source))
        .collect();
    let comment_allocator = Allocator::default();
    let comment_programs = [parse(&comment_allocator, COMMENT_SOURCE)];
    let print_options = rsvelte_esrap::PrintOptions::default().with_empty_statements(true);

    let mut group = c.benchmark_group("printer/parsed-no-map");
    group.throughput(Throughput::Bytes(
        PRINTER_SOURCES
            .iter()
            .map(|source| source.len() as u64)
            .sum(),
    ));
    group.bench_function("rsvelte-esrap", |b| {
        b.iter(|| {
            for (program, source) in programs.iter().zip(PRINTER_SOURCES) {
                black_box(rsvelte_esrap::print_with(program, source, &print_options));
            }
        })
    });
    group.bench_function("oxc-codegen", |b| {
        b.iter(|| {
            for program in &programs {
                black_box(
                    Codegen::new()
                        .with_options(CodegenOptions {
                            single_quote: true,
                            ..CodegenOptions::default()
                        })
                        .build(program),
                );
            }
        })
    });
    group.finish();

    let mut group = c.benchmark_group("printer/decoded-map");
    group.throughput(Throughput::Bytes(
        PRINTER_SOURCES
            .iter()
            .map(|source| source.len() as u64)
            .sum(),
    ));
    group.bench_function("rsvelte-esrap", |b| {
        b.iter(|| {
            for (program, source) in programs.iter().zip(PRINTER_SOURCES) {
                black_box(rsvelte_esrap::print_with_map(
                    program,
                    source,
                    &print_options,
                ));
            }
        })
    });
    group.bench_function("oxc-codegen", |b| {
        b.iter(|| {
            for program in &programs {
                black_box(
                    Codegen::new()
                        .with_options(CodegenOptions {
                            single_quote: true,
                            source_map_path: Some("input.js".into()),
                            ..CodegenOptions::default()
                        })
                        .build(program),
                );
            }
        })
    });
    group.finish();

    let mut group = c.benchmark_group("printer/comments-common");
    group.throughput(Throughput::Bytes(COMMENT_SOURCE.len() as u64));
    group.bench_function("rsvelte-esrap", |b| {
        b.iter(|| {
            black_box(rsvelte_esrap::print_with(
                &comment_programs[0],
                COMMENT_SOURCE,
                &print_options,
            ))
        })
    });
    group.bench_function("oxc-codegen", |b| {
        b.iter(|| {
            black_box(
                Codegen::new()
                    .with_options(CodegenOptions {
                        single_quote: true,
                        ..CodegenOptions::default()
                    })
                    .build(&comment_programs[0]),
            )
        })
    });
    group.finish();
}

fn parse<'a>(allocator: &'a Allocator, source: &'a str) -> oxc_ast::ast::Program<'a> {
    let parsed = Parser::new(allocator, source, SourceType::mjs())
        .with_options(ParseOptions {
            preserve_parens: true,
            ..ParseOptions::default()
        })
        .parse();
    assert!(!parsed.panicked && parsed.diagnostics.is_empty());
    parsed.program
}

criterion_group!(benches, bench_compile, bench_compile_both, bench_printers);
criterion_main!(benches);
