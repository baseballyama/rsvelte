//! `import type` on an import alias, which acorn-typescript refuses at the module reference.

use super::outcomes::{Outcome, assert_component_outcomes};

const REFUSED: &str = "An import alias can not use 'import type'.";

/// A component, and what svelte 5.57.3 and 5.59.1 raise in runes mode.
const CASES: &[(&str, Outcome<'_>)] = &[
    (
        "<script lang=\"ts\">import type A = B.C;</script>",
        Some(("js_parse_error", REFUSED, 34)),
    ),
    (
        "<script lang=\"ts\">export import type A = B.C;</script>",
        Some(("js_parse_error", REFUSED, 41)),
    ),
    (
        "<script lang=\"ts\">import type A = B;</script>",
        Some(("js_parse_error", REFUSED, 34)),
    ),
    (
        "<script lang=\"ts\">import type A = B.C.D;</script>",
        Some(("js_parse_error", REFUSED, 34)),
    ),
    (
        "<script module lang=\"ts\">import type A = B.C;</script>",
        Some(("js_parse_error", REFUSED, 41)),
    ),
    (
        "<script lang=\"ts\">let x = 1;\nimport type A =\n  B.C;</script>",
        Some(("js_parse_error", REFUSED, 47)),
    ),
    (
        "<script lang=\"ts\">import type A = (B);</script>",
        Some(("js_parse_error", "Unexpected token", 34)),
    ),
    (
        "<script lang=\"ts\">import type A = B.\u{85}C;</script>",
        Some(("js_parse_error", "Unexpected character '\u{85}'", 36)),
    ),
    (
        "<script lang=\"ts\">import type A = B.C\u{85};</script>",
        Some(("js_parse_error", "Unexpected character '\u{85}'", 37)),
    ),
    (
        "<script lang=\"ts\">import type A = B.C;\u{85}</script>",
        Some(("js_parse_error", REFUSED, 34)),
    ),
    (
        "<script lang=\"ts\">import type A = B.\u{200B}C;</script>",
        Some(("js_parse_error", "Unexpected character '\u{200B}'", 36)),
    ),
    (
        "<script lang=\"ts\">import type A = B.C\u{200B};</script>",
        Some(("js_parse_error", "Unexpected character '\u{200B}'", 37)),
    ),
    (
        "<script lang=\"ts\">import type A = B.C;\u{200B}</script>",
        Some(("js_parse_error", REFUSED, 34)),
    ),
];

#[test]
fn an_import_alias_with_import_type_is_refused_at_its_module_reference() {
    assert_component_outcomes(CASES);
}
