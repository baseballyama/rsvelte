//! Issue #463 H-118: analysis warnings emitted via a direct
//! `analysis.warnings.push(...)` bypassed the `svelte-ignore` stack. Routing
//! them through `emit_warning` lets an in-scope `svelte-ignore` suppress them.

use rsvelte_core::{CompileOptions, compile};

fn warning_codes(src: &str) -> Vec<String> {
    match compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            ..Default::default()
        },
    ) {
        Ok(r) => r.warnings.into_iter().map(|w| w.code).collect(),
        Err(e) => vec![format!("COMPILE_ERROR: {e:?}")],
    }
}

const CODE: &str = "reactive_declaration_module_script_dependency";

#[test]
fn module_script_reactive_warning_is_emitted_without_ignore() {
    let src = "<script module>\nlet count = 0;\n</script>\n<script>\n$: doubled = count * 2;\ncount = count + 1;\n</script>\n{doubled}";
    assert!(
        warning_codes(src).iter().any(|c| c == CODE),
        "expected the warning without an ignore"
    );
}

#[test]
fn module_script_reactive_warning_is_suppressed_by_svelte_ignore() {
    let src = "<script module>\nlet count = 0;\n</script>\n<script>\n// svelte-ignore reactive_declaration_module_script_dependency\n$: doubled = count * 2;\ncount = count + 1;\n</script>\n{doubled}";
    assert!(
        !warning_codes(src).iter().any(|c| c == CODE),
        "svelte-ignore should suppress the directly-pushed warning (H-118)"
    );
}
