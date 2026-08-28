//! Parity tests for the three syntactic "type-aware" rules that actually need no
//! type checker: `experimental-require-slot-types`,
//! `experimental-require-strict-events`, `require-event-dispatcher-types`.
//!
//! `slot-types` is also covered by the oracle. The other two target Svelte 3/4,
//! so their scanners are tested directly below while the public Svelte-5 lint
//! path is separately pinned to skip them.

use std::path::PathBuf;

use rsvelte_core::CompileOptions;
use rsvelte_lint::{LintConfig, Severity, lint_source};

fn findings(src: &str, code: &str) -> Vec<(u32, u32, String)> {
    let cfg = LintConfig::empty().with_override(code, Severity::Error);
    let file = PathBuf::from("Test.svelte");
    let diagnostics = match code {
        STRICT => {
            rsvelte_lint::rules::experimental_require_strict_events::diagnostics(src, &file, &cfg)
        }
        DISPATCH => {
            rsvelte_lint::rules::require_event_dispatcher_types::diagnostics(src, &file, &cfg)
        }
        _ => lint_source(src, &file, &CompileOptions::default(), &cfg),
    };
    diagnostics
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
fn svelte_3_4_rules_do_not_run_on_svelte_5() {
    for (src, code) in [
        ("<script lang=\"ts\">\n</script>", STRICT),
        (
            "<script lang=\"ts\">import { createEventDispatcher } from 'svelte'; createEventDispatcher();</script>",
            DISPATCH,
        ),
    ] {
        for cfg in [
            LintConfig::recommended(),
            LintConfig::empty().with_override(code, Severity::Error),
        ] {
            let actual = lint_source(
                src,
                &PathBuf::from("Test.svelte"),
                &CompileOptions::default(),
                &cfg,
            );
            assert!(
                actual.iter().all(|d| d.code.as_deref() != Some(code)),
                "Svelte 3/4-only rule {code} ran on Svelte 5"
            );
        }
    }
}

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
fn strict_events_last_script_wins() {
    // Module script is TS but the (last) instance script is plain JS → upstream
    // overwrites isTs per visit, so the rule does NOT fire.
    let src = "<script context=\"module\" lang=\"ts\">\n</script>\n<script>\n</script>";
    assert!(findings(src, STRICT).is_empty());
}

#[test]
fn dispatcher_ignores_comments_and_suffix_imports() {
    // `createEventDispatcher()` mentioned in a comment must not be reported, and
    // the real call has type args.
    let commented = "<script lang=\"ts\">\n\timport { createEventDispatcher } from 'svelte';\n\t// createEventDispatcher() in a comment\n\tconst d = createEventDispatcher<{x: 1}>();\n</script>";
    assert!(findings(commented, DISPATCH).is_empty());

    // A suffix identifier import must not be treated as createEventDispatcher.
    let suffix = "<script lang=\"ts\">\n\timport { xcreateEventDispatcher } from 'svelte';\n\tconst d = xcreateEventDispatcher();\n</script>";
    assert!(findings(suffix, DISPATCH).is_empty());
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
