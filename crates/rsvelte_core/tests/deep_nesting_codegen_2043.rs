//! Regression test for issue #2043 — dev-mode client compilation of a scriptless
//! component was O(4^depth) in element nesting depth (depth 12 took ~9.5s).
//!
//! Root cause: the handwritten JS printer (`js_ast/codegen.rs`, used for scriptless
//! components) decided inline-vs-multiline wrapping by pre-rendering a node into a
//! throwaway codegen and then re-emitting it for real. Dev mode's `$.add_locations`
//! argument is an array literal nested as deeply as the elements, so every level
//! rendered its whole subtree several times over. Measurements are now memoized per
//! node, so each subtree is rendered a bounded number of times.
//!
//! The budget is deliberately far above the real cost (a few milliseconds): it only
//! has to turn a re-introduced exponential — which would never finish — into a
//! failure rather than a hung suite.

use rsvelte_core::{CompileOptions, GenerateMode, compile};
use std::sync::mpsc;
use std::time::Duration;

const DEFAULT_STACK: usize = 8 * 1024 * 1024;
const BUDGET: Duration = Duration::from_secs(10);

fn nested_divs(depth: usize) -> String {
    let mut src = String::new();
    for _ in 0..depth {
        src.push_str("<div>");
    }
    src.push_str("<span>x</span>");
    for _ in 0..depth {
        src.push_str("</div>");
    }
    src
}

/// Compile on a default-sized (8 MiB) stack, failing if it outruns `BUDGET`.
fn compile_dev_client_within_budget(src: String) -> String {
    let (tx, rx) = mpsc::channel();
    std::thread::Builder::new()
        .stack_size(DEFAULT_STACK)
        .spawn(move || {
            let compiled = compile(
                &src,
                CompileOptions {
                    filename: Some("Deep.svelte".to_string()),
                    generate: GenerateMode::Client,
                    dev: true,
                    ..Default::default()
                },
            );
            let _ = tx.send(compiled.map(|c| c.js.code));
        })
        .expect("spawn test thread");

    match rx.recv_timeout(BUDGET) {
        Ok(compiled) => compiled.expect("deeply nested component should compile"),
        Err(_) => panic!("compilation did not finish within {BUDGET:?}"),
    }
}

#[test]
fn deeply_nested_elements_compile_in_dev_mode() {
    let code = compile_dev_client_within_budget(nested_divs(64));
    assert!(code.contains("$.add_locations"));
}

#[test]
fn deeply_nested_elements_with_a_script_are_unaffected() {
    // A script block routes codegen through esrap instead of the handwritten
    // printer, so this only smoke-tests the other path.
    let src = format!("<script>let x = 1;</script>\n{}", nested_divs(64));
    let code = compile_dev_client_within_budget(src);
    assert!(code.contains("$.add_locations"));
}
