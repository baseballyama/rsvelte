//! Retained-AST benchmark for `rsvelte_esrap` and `oxc_codegen`.

#[cfg(all(
    feature = "mimalloc-alloc",
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

use std::fs;
use std::hint::black_box;
use std::path::PathBuf;
use std::time::Instant;

use oxc_allocator::Allocator;
use oxc_codegen::{Codegen, CodegenOptions};
use oxc_parser::{ParseOptions, Parser};
use oxc_span::{GetSpan, SourceType};
use serde::Serialize;

#[derive(Clone, Copy, Serialize)]
#[serde(rename_all = "kebab-case")]
enum Mode {
    Code,
    SourceMap,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Variant {
    times_ms: Vec<f64>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Report {
    mode: Mode,
    files: usize,
    bytes: usize,
    comment_files: usize,
    comments: usize,
    warmups: usize,
    runs: usize,
    batch: usize,
    work_gate: &'static str,
    rsvelte_esrap: Variant,
    oxc_codegen: Variant,
}

fn main() {
    let mut file_list = None;
    let mut warmups = 1;
    let mut runs = 5;
    let mut batch = 1;
    let mut mode = Mode::Code;

    let mut args = std::env::args().skip(1);
    while let Some(arg) = args.next() {
        match arg.as_str() {
            "--files" => file_list = args.next(),
            "--warmup" => warmups = parse_usize(args.next(), warmups),
            "--iterations" => runs = parse_usize(args.next(), runs),
            "--batch" => batch = parse_usize(args.next(), batch),
            "--mode" => {
                mode = match args.next().as_deref() {
                    Some("code") => Mode::Code,
                    Some("source-map") => Mode::SourceMap,
                    value => panic!("unknown printer mode: {value:?}"),
                };
            }
            value => panic!("unknown argument: {value}"),
        }
    }

    let file_list = file_list.expect("usage: printer_benchmark_runner --files <path>");
    assert!(runs > 0, "--iterations must be greater than zero");
    assert!(batch > 0, "--batch must be greater than zero");
    let paths: Vec<PathBuf> = fs::read_to_string(&file_list)
        .unwrap_or_else(|error| panic!("cannot read {file_list}: {error}"))
        .lines()
        .filter(|line| !line.is_empty())
        .map(PathBuf::from)
        .collect();
    assert!(!paths.is_empty(), "printer benchmark file list is empty");

    let sources: Vec<String> = paths
        .iter()
        .map(|path| {
            fs::read_to_string(path)
                .unwrap_or_else(|error| panic!("cannot read {}: {error}", path.display()))
        })
        .collect();
    let allocator = Allocator::default();
    let programs: Vec<_> = sources
        .iter()
        .zip(&paths)
        .map(|(source, path)| {
            let parsed = Parser::new(&allocator, source, SourceType::mjs())
                .with_options(ParseOptions {
                    preserve_parens: true,
                    ..ParseOptions::default()
                })
                .parse();
            assert!(
                !parsed.panicked && parsed.diagnostics.is_empty(),
                "{} is not valid JavaScript: {:?}",
                path.display(),
                parsed.diagnostics.first()
            );
            parsed.program
        })
        .collect();

    let print_options = rsvelte_esrap::PrintOptions::default().with_empty_statements(true);
    let mut oxc_options = CodegenOptions {
        single_quote: true,
        ..CodegenOptions::default()
    };
    if matches!(mode, Mode::SourceMap) {
        oxc_options.source_map_path = Some(PathBuf::from("input.js"));
    }
    for (program, source) in programs.iter().zip(&sources) {
        let expected_comments: Vec<_> = program
            .comments
            .iter()
            .map(|comment| comment.span().source_text(source).to_string())
            .collect();
        let esrap_code = match mode {
            Mode::Code => rsvelte_esrap::print_with(program, source, &print_options),
            Mode::SourceMap => rsvelte_esrap::print_with_map(program, source, &print_options).code,
        };
        let oxc_code = Codegen::new()
            .with_options(oxc_options.clone())
            .build(program)
            .code;
        assert_valid_output(&esrap_code, "rsvelte/esrap", &expected_comments);
        assert_valid_output(&oxc_code, "oxc_codegen", &expected_comments);
    }

    let mut esrap = || match mode {
        Mode::Code => {
            for (program, source) in programs.iter().zip(&sources) {
                black_box(rsvelte_esrap::print_with(program, source, &print_options));
            }
        }
        Mode::SourceMap => {
            for (program, source) in programs.iter().zip(&sources) {
                black_box(rsvelte_esrap::print_with_map(
                    program,
                    source,
                    &print_options,
                ));
            }
        }
    };
    let mut oxc = || {
        for program in &programs {
            black_box(
                Codegen::new()
                    .with_options(oxc_options.clone())
                    .build(program),
            );
        }
    };

    for _ in 0..warmups {
        for _ in 0..batch {
            esrap();
            oxc();
        }
    }
    let mut esrap_times = Vec::with_capacity(runs);
    let mut oxc_times = Vec::with_capacity(runs);
    for index in 0..runs {
        if index % 2 == 0 {
            esrap_times.push(timed(&mut esrap, batch));
            oxc_times.push(timed(&mut oxc, batch));
        } else {
            oxc_times.push(timed(&mut oxc, batch));
            esrap_times.push(timed(&mut esrap, batch));
        }
    }

    let report = Report {
        mode,
        files: sources.len(),
        bytes: sources.iter().map(String::len).sum(),
        comment_files: programs
            .iter()
            .filter(|program| !program.comments.is_empty())
            .count(),
        comments: programs.iter().map(|program| program.comments.len()).sum(),
        warmups,
        runs,
        batch,
        work_gate: "parseable-output",
        rsvelte_esrap: Variant {
            times_ms: esrap_times,
        },
        oxc_codegen: Variant {
            times_ms: oxc_times,
        },
    };
    println!(
        "{}",
        serde_json::to_string(&report).expect("benchmark report serializes")
    );
}

fn parse_usize(value: Option<String>, fallback: usize) -> usize {
    value
        .and_then(|value| value.parse().ok())
        .unwrap_or(fallback)
}

fn assert_valid_output(source: &str, label: &str, expected_comments: &[String]) {
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, source, SourceType::mjs()).parse();
    assert!(
        !parsed.panicked && parsed.diagnostics.is_empty(),
        "{label} emitted invalid JavaScript: {:?}",
        parsed.diagnostics.first()
    );
    let output_comments: Vec<_> = parsed
        .program
        .comments
        .iter()
        .map(|comment| comment.span().source_text(source))
        .collect();
    let expected_comments: Vec<_> = expected_comments.iter().map(String::as_str).collect();
    assert_eq!(
        output_comments, expected_comments,
        "{label} changed comments"
    );
}

fn timed(run: &mut dyn FnMut(), batch: usize) -> f64 {
    let start = Instant::now();
    for _ in 0..batch {
        run();
    }
    start.elapsed().as_secs_f64() * 1_000.0 / batch as f64
}
