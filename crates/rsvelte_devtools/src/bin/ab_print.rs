//! Paired A/B throughput of `rsvelte_esrap::print_with` against `oxc_codegen`.
//!
//! Runs the two back to back as A->B->B->A pairs and reports the median of the
//! per-pair ratios; min-of-N is deliberately not used because it inflates the
//! ratio on a shared machine.
//!
//! Usage: `ab_print [--pairs N] [--iters N] <file.js> ...`

use std::time::{Duration, Instant};

use oxc_allocator::Allocator;
use oxc_codegen::Codegen;
use oxc_parser::{ParseOptions, Parser, ParserReturn};
use oxc_span::SourceType;

fn main() {
    let mut pairs = 20usize;
    let mut iters = 20usize;
    let mut files: Vec<String> = Vec::new();

    let mut args = std::env::args().skip(1);
    while let Some(arg) = args.next() {
        match arg.as_str() {
            "--pairs" => pairs = args.next().and_then(|v| v.parse().ok()).unwrap_or(pairs),
            "--iters" => iters = args.next().and_then(|v| v.parse().ok()).unwrap_or(iters),
            other => files.push(other.to_string()),
        }
    }

    if files.is_empty() {
        eprintln!("usage: ab_print [--pairs N] [--iters N] <file.js> ...");
        std::process::exit(2);
    }

    let sources: Vec<(String, String)> = files
        .iter()
        .map(|path| {
            let text = std::fs::read_to_string(path)
                .unwrap_or_else(|err| panic!("cannot read {path}: {err}"));
            (path.clone(), text)
        })
        .collect();

    let allocator = Allocator::default();
    let parsed: Vec<ParserReturn<'_>> = sources
        .iter()
        .map(|(name, text)| {
            let ret = Parser::new(&allocator, text, SourceType::mjs())
                .with_options(ParseOptions {
                    preserve_parens: true,
                    ..ParseOptions::default()
                })
                .parse();
            assert!(!ret.panicked, "{name} failed to parse");
            ret
        })
        .collect();

    let total_bytes: usize = sources.iter().map(|(_, text)| text.len()).sum();
    println!(
        "{} file(s), {total_bytes} B, {pairs} pairs x {iters} iters",
        sources.len()
    );

    let opts = rsvelte_esrap::PrintOptions::default();
    let esrap = || {
        for (parsed, (_, text)) in parsed.iter().zip(&sources) {
            std::hint::black_box(rsvelte_esrap::print_with(&parsed.program, text, &opts).len());
        }
    };
    let oxc = || {
        for parsed in &parsed {
            std::hint::black_box(Codegen::new().build(&parsed.program).code.len());
        }
    };

    let run = |f: &dyn Fn()| -> Duration {
        let start = Instant::now();
        for _ in 0..iters {
            f();
        }
        start.elapsed()
    };

    // Warm both sides so the first pair does not carry cold-cache cost.
    run(&esrap);
    run(&oxc);

    let mut ratios: Vec<f64> = Vec::with_capacity(pairs);
    let mut a_total = Duration::ZERO;
    let mut b_total = Duration::ZERO;
    for _ in 0..pairs {
        // A->B->B->A so that any monotonic drift in machine load cancels.
        let a1 = run(&esrap);
        let b1 = run(&oxc);
        let b2 = run(&oxc);
        let a2 = run(&esrap);
        let a = a1 + a2;
        let b = b1 + b2;
        a_total += a;
        b_total += b;
        ratios.push(a.as_secs_f64() / b.as_secs_f64());
    }

    ratios.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let median = ratios[ratios.len() / 2];
    let mean = ratios.iter().sum::<f64>() / ratios.len() as f64;
    let sd = (ratios.iter().map(|r| (r - mean).powi(2)).sum::<f64>() / ratios.len() as f64).sqrt();

    println!("esrap total: {:>10.3} ms", a_total.as_secs_f64() * 1e3);
    println!("oxc   total: {:>10.3} ms", b_total.as_secs_f64() * 1e3);
    println!(
        "ratio esrap/oxc: median {median:.3}x  mean {mean:.3}x  sd {sd:.3}  min {:.3}x  max {:.3}x",
        ratios[0],
        ratios[ratios.len() - 1]
    );
}
