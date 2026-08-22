//! What the #3243 check costs.
//!
//! The added work is exactly one `SemanticBuilder::new_compiler().build()` per
//! script — `with_build_nodes(false)`, reached only when the parser produced no
//! diagnostic. Do NOT size it against #2602: that measured constructing a
//! `SemanticBuilder` **11–21 times per file** at ~2% of compile with a 3.3%
//! ceiling, which is a different quantity.
//!
//! Measured in ONE binary, in one run, alternating the two arms per file, so
//! neither a code-layout difference nor another agent's build of the same
//! artifact path can enter the comparison (both hazards are recorded in
//! `AGENTS.md`). The arm under test is the `build()` call alone; the parse it
//! needs is already paid for by `compile()`, so this is the added cost and not
//! a re-priced workload.
//!
//! Run with:
//!   cargo test -p rsvelte_core --release --test early_errors_cost -- --ignored --nocapture

use std::time::{Duration, Instant};

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn corpus() -> Vec<(String, String)> {
    let root = concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../compatibility/pattern-corpus"
    );
    let mut out = Vec::new();
    let mut stack = vec![std::path::PathBuf::from(root)];
    while let Some(dir) = stack.pop() {
        let Ok(entries) = std::fs::read_dir(&dir) else {
            continue;
        };
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                stack.push(path);
            } else if path.extension().is_some_and(|e| e == "svelte")
                && let Ok(text) = std::fs::read_to_string(&path)
            {
                out.push((path.display().to_string(), text));
            }
        }
    }
    out.sort();
    out
}

/// The `<script>` bodies of a component, which is what the check runs on.
fn scripts(source: &str) -> Vec<String> {
    let mut out = Vec::new();
    let mut rest = source;
    while let Some(open) = rest.find("<script") {
        let after = &rest[open..];
        let Some(gt) = after.find('>') else { break };
        let body = &after[gt + 1..];
        let Some(close) = body.find("</script>") else {
            break;
        };
        out.push(body[..close].to_string());
        rest = &body[close..];
    }
    out
}

#[test]
#[ignore = "measurement, not a gate"]
fn semantic_early_error_cost() {
    let files = corpus();
    assert!(files.len() > 100, "corpus too small: {}", files.len());

    let mut compile_total = Duration::ZERO;
    let mut semantic_total = Duration::ZERO;
    let mut compiled = 0usize;
    let mut script_count = 0usize;

    // Two warm-up sweeps, then the measured one; alternate the arms per file so
    // a drift in machine load falls on both.
    for round in 0..3 {
        let measure = round == 2;
        for (_, source) in &files {
            let bodies = scripts(source);
            for flip in [false, true] {
                if flip {
                    let start = Instant::now();
                    let ok = compile(
                        source,
                        CompileOptions {
                            filename: Some("Test.svelte".to_string()),
                            generate: GenerateMode::Client,
                            dev: false,
                            css: CssMode::External,
                            ..Default::default()
                        },
                    )
                    .is_ok();
                    let elapsed = start.elapsed();
                    if measure && ok {
                        compile_total += elapsed;
                        compiled += 1;
                    }
                } else {
                    for body in &bodies {
                        let allocator = oxc_allocator::Allocator::default();
                        let parsed =
                            oxc_parser::Parser::new(&allocator, body, oxc_span::SourceType::ts())
                                .parse();
                        let start = Instant::now();
                        let built =
                            oxc_semantic::SemanticBuilder::new_compiler().build(&parsed.program);
                        let elapsed = start.elapsed();
                        std::hint::black_box(built.diagnostics.len());
                        if measure {
                            semantic_total += elapsed;
                            script_count += 1;
                        }
                    }
                }
            }
        }
    }

    let share = semantic_total.as_secs_f64() / compile_total.as_secs_f64() * 100.0;
    println!(
        "files={} compiled={compiled} scripts={script_count}\n\
         compile   {:>9.2} ms\n\
         semantic  {:>9.2} ms\n\
         added share of compile: {share:.3}%",
        files.len(),
        compile_total.as_secs_f64() * 1000.0,
        semantic_total.as_secs_f64() * 1000.0,
    );
}
