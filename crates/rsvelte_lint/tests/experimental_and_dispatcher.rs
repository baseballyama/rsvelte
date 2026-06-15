//! Parity tests for the three syntactic "type-aware" rules that actually need no
//! type checker: `experimental-require-slot-types`,
//! `experimental-require-strict-events`, `require-event-dispatcher-types`.
//!
//! `slot-types` is also covered by the oracle, but the other two target Svelte
//! 3/4 (`strictEvents`, `createEventDispatcher`), so their upstream fixtures are
//! version-skipped by the oracle. These tests port those fixtures directly so the
//! rules are still parity-verified.

use std::path::PathBuf;

use rsvelte_core::CompileOptions;
use rsvelte_lint::{LintConfig, Severity, lint_source};

fn findings(src: &str, code: &str) -> Vec<(u32, u32, String)> {
    let cfg = LintConfig::empty().with_override(code, Severity::Error);
    lint_source(
        src,
        &PathBuf::from("Test.svelte"),
        &CompileOptions::default(),
        &cfg,
    )
    .into_iter()
    .filter(|d| d.code.as_deref() == Some(code))
    .filter_map(|d| {
        let r = d.range?;
        Some((r.start.line, r.start.column + 1, d.message))
    })
    .collect()
}

// ---------------------------------------------------------------------------
// experimental-require-slot-types
// ---------------------------------------------------------------------------

const SLOT: &str = "svelte/experimental-require-slot-types";

#[test]
fn slot_types_reports_missing_interface() {
    let src = "<script lang=\"ts\">\n</script>\n\n<slot />";
    assert_eq!(
        findings(src, SLOT),
        vec![(
            1,
            2,
            "The component must define the $$Slots interface.".to_string()
        )]
    );
}

#[test]
fn slot_types_valid_cases() {
    for src in [
        "<script lang=\"ts\">\n\tinterface $$Slots {\n\t\tdefalt: Record<string, never>;\n\t}\n</script>\n\n<slot />",
        "<script lang=\"ts\">\n\ttype $$Slots = {\n\t\tdefalt: Record<string, never>;\n\t};\n</script>\n\n<slot />",
        "<script lang=\"ts\">\n\tinterface $$Slots {\n\t\tnamed: Record<string, never>;\n\t}\n</script>\n\n<slot name=\"named\" />",
        "<script lang=\"ts\">\n</script>\n\ncontent", // ts, no slot
        "<script>\n</script>\n\n<slot />",            // no ts
    ] {
        assert!(
            findings(src, SLOT).is_empty(),
            "unexpected finding for {src:?}"
        );
    }
}

#[test]
fn slot_types_off_by_default() {
    let src = "<script lang=\"ts\">\n</script>\n\n<slot />";
    let on = lint_source(
        src,
        &PathBuf::from("Test.svelte"),
        &CompileOptions::default(),
        &LintConfig::recommended(),
    )
    .into_iter()
    .any(|d| d.code.as_deref() == Some(SLOT));
    assert!(!on, "slot-types should be off in the recommended preset");
}

// ---------------------------------------------------------------------------
// experimental-require-strict-events
// ---------------------------------------------------------------------------

const STRICT: &str = "svelte/experimental-require-strict-events";

#[test]
fn strict_events_reports_when_missing() {
    let src = "<script lang=\"ts\">\n</script>";
    assert_eq!(
        findings(src, STRICT),
        vec![(
            1,
            1,
            "The component must have the strictEvents attribute on its <script> tag or it must define the $$Events interface.".to_string()
        )]
    );
}

#[test]
fn strict_events_valid_cases() {
    for src in [
        "<script lang=\"ts\">\n\tinterface $$Events {}\n</script>",
        "<script lang=\"ts\">\n\ttype $$Events = {};\n</script>",
        "<script lang=\"ts\" strictEvents>\n</script>",
        "<script>\n</script>", // no ts
        "<script lang=\"ts\" context=\"module\">\n</script>\n\n<script lang=\"ts\" strictEvents>\n</script>",
    ] {
        assert!(
            findings(src, STRICT).is_empty(),
            "unexpected finding for {src:?}"
        );
    }
}

// ---------------------------------------------------------------------------
// require-event-dispatcher-types
// ---------------------------------------------------------------------------

const DISPATCH: &str = "svelte/require-event-dispatcher-types";

#[test]
fn dispatcher_reports_missing_type_params() {
    let direct = "<script lang=\"ts\">\n\timport { createEventDispatcher } from 'svelte';\n\n\tconst dispatch = createEventDispatcher();\n</script>";
    assert_eq!(
        findings(direct, DISPATCH),
        vec![(
            4,
            19,
            "Type parameters missing for the `createEventDispatcher` function call.".to_string()
        )]
    );

    let aliased = "<script lang=\"ts\">\n\timport { createEventDispatcher as ced } from 'svelte';\n\n\tconst dispatch = ced();\n</script>";
    assert_eq!(
        findings(aliased, DISPATCH),
        vec![(
            4,
            19,
            "Type parameters missing for the `createEventDispatcher` function call.".to_string()
        )]
    );
}

#[test]
fn dispatcher_valid_cases() {
    // All calls have type params.
    let typed = "<script lang=\"ts\">\n\timport { createEventDispatcher } from 'svelte';\n\n\tconst d1 = createEventDispatcher<{ one: never; two: number }>();\n\tconst d2 = createEventDispatcher<Record<string, never>>();\n\tconst d3 = createEventDispatcher<any>();\n</script>";
    assert!(findings(typed, DISPATCH).is_empty());

    // Not TypeScript.
    let no_ts = "<script>\n\timport { createEventDispatcher } from 'svelte';\n\n\tconst d = createEventDispatcher();\n</script>";
    assert!(findings(no_ts, DISPATCH).is_empty());

    // Imported from a non-svelte module.
    let non_svelte = "<script lang=\"ts\">\n\timport { createEventDispatcher } from './unknown';\n\n\tconst d = createEventDispatcher();\n</script>";
    assert!(findings(non_svelte, DISPATCH).is_empty());
}
