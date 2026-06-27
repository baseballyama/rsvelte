//! Landmine guard for the typed `remove_typescript_nodes` port: a TS component
//! must still honor a SCRIPT-level `svelte-ignore` comment. That suppression is
//! driven by `Program.ignore_comment_map`, which the typed strip transform must
//! preserve. The transform mutates the arena `Program` in place (never rebuilds
//! it), so the map survives — this test guards against a regression that no
//! runtime/snapshot test would catch.

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
        Err(e) => panic!("compile failed: {e:?}"),
    }
}

const CODE: &str = "export_let_unused";

/// Baseline: a TS component with an unused `export let` and no ignore comment
/// emits `export_let_unused` (proves the warning fires on TS components).
#[test]
fn ts_component_emits_export_let_unused_without_ignore() {
    let codes = warning_codes("<script lang=\"ts\">\n\texport let some: number;\n</script>");
    assert!(
        codes.iter().any(|c| c == CODE),
        "expected {CODE} on TS component, got {codes:?}"
    );
}

/// Landmine: the same TS component with a script-level
/// `// svelte-ignore export_let_unused` must have the warning suppressed
/// (Program.ignore_comment_map preserved through the typed TS strip).
#[test]
fn ts_component_script_svelte_ignore_suppresses_warning() {
    let codes = warning_codes(
        "<script lang=\"ts\">\n\t// svelte-ignore export_let_unused\n\texport let some: number;\n</script>",
    );
    assert!(
        !codes.iter().any(|c| c == CODE),
        "script-level svelte-ignore failed to suppress {CODE} on TS component, got {codes:?}"
    );
}
