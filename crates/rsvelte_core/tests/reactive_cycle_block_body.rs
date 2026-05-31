//! Regression tests for reactive `$:` cycle detection across body shapes
//! (correctness review C-009).
//!
//! Bug: `check_reactive_declaration_cycles` only registered assignment targets
//! when the `$:` body was an `ExpressionStatement` wrapping an
//! `AssignmentExpression`. Block-bodied (`$: { a = b + 1; }`) and other shapes
//! put every identifier into the dependency set only, so their statements had
//! empty assignment sets and were dropped from the cycle graph — a cross
//! assignment cycle was silently accepted and looped forever at runtime.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_error_code(src: &str) -> Option<String> {
    match compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    ) {
        Ok(_) => None,
        Err(e) => {
            let s = format!("{e:?}");
            // The error renders as `ValidationWithCode { code: "...", ... }`.
            Some(s)
        }
    }
}

#[test]
fn block_bodied_reactive_cycle_is_reported() {
    let src = "<script>\nlet a = 1;\nlet b = 2;\n$: { a = b + 1; }\n$: { b = a + 1; }\n</script>";
    let err = compile_error_code(src).expect("expected a reactive_declaration_cycle error");
    assert!(
        err.contains("reactive_declaration_cycle"),
        "expected reactive_declaration_cycle, got: {err}"
    );
}

#[test]
fn expression_bodied_reactive_cycle_still_reported() {
    // Pre-existing behavior must be preserved.
    let src = "<script>\nlet a = 1;\nlet b = 2;\n$: a = b + 1;\n$: b = a + 1;\n</script>";
    let err = compile_error_code(src).expect("expected a reactive_declaration_cycle error");
    assert!(err.contains("reactive_declaration_cycle"), "got: {err}");
}

#[test]
fn non_cyclic_block_reactive_is_accepted() {
    // A block-bodied `$:` without a cycle must not be a false positive.
    let src = "<script>\nlet a = 1;\nlet b = 2;\n$: { a = b + 1; }\n</script>";
    assert!(
        compile_error_code(src).is_none(),
        "non-cyclic block-bodied $: should compile cleanly"
    );
}
