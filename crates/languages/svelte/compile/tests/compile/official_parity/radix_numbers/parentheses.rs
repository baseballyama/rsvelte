//! A number inside parentheses that oxc cannot read at all: acorn still stops at its shorter
//! number where its parser takes none, in every host that reads an expression.

use super::super::outcomes::{Outcome, assert_component_outcomes};

/// A component, and what svelte 5.59.1 raises in runes mode, in bytes of the source.
const COMPONENTS: &[(&str, Outcome<'_>)] = &[
    (
        "{#if true}{@const c = (a 0b12)}{c}{/if}",
        Some(("js_parse_error", "Unexpected token", 25)),
    ),
    (
        "{#if true}{@const c = (a 0B19)}{c}{/if}",
        Some(("js_parse_error", "Unexpected token", 25)),
    ),
    (
        "{#if true}{@const c = (a 0o78)}{c}{/if}",
        Some(("js_parse_error", "Unexpected token", 25)),
    ),
    (
        "{#if true}{@const c = (a 0b12n)}{c}{/if}",
        Some(("js_parse_error", "Unexpected token", 25)),
    ),
    (
        "{#if true}{@const c = (a 0b1n_)}{c}{/if}",
        Some(("js_parse_error", "Unexpected token", 25)),
    ),
    (
        "{#if true}{@const c = (0b12)}{c}{/if}",
        Some(("js_parse_error", "Unexpected token", 26)),
    ),
    (
        "<script lang=\"ts\"></script>\n{#if true}{@const c = (a 0b12)}{c}{/if}",
        Some(("js_parse_error", "Unexpected token", 53)),
    ),
    (
        "{#each [1] as i}{#if i}{@const c = (a 0o78)}{c}{/if}{/each}",
        Some(("js_parse_error", "Unexpected token", 38)),
    ),
    (
        "{(a 0b12)}",
        Some(("js_parse_error", "Unexpected token", 4)),
    ),
    (
        "{((a 0b12))}",
        Some(("js_parse_error", "Unexpected token", 5)),
    ),
    ("{(0b12)}", Some(("js_parse_error", "Unexpected token", 5))),
    (
        "{/* c */ (a 0b12) /* d */}",
        Some(("js_parse_error", "Unexpected token", 12)),
    ),
    (
        "<p>é名😀𝒜\r\n{(a 0b12)}</p>",
        Some(("js_parse_error", "Unexpected token", 22)),
    ),
    (
        "<p title={(a 0b12)}></p>",
        Some(("js_parse_error", "Unexpected token", 13)),
    ),
    (
        "{#if (a 0b12)}x{/if}",
        Some(("js_parse_error", "Unexpected token", 8)),
    ),
    (
        "{#each (a 0b12) as v}{v}{/each}",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "{#each (0b12) as v}{v}{/each}",
        Some(("js_parse_error", "Unexpected token", 11)),
    ),
    (
        "{#each (0b12.x) as v}{v}{/each}",
        Some(("js_parse_error", "Identifier directly after number", 13)),
    ),
    (
        "{@html (a 0b12)}",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "{#key (a 0b12)}x{/key}",
        Some(("js_parse_error", "Unexpected token", 9)),
    ),
    (
        "{#await (a 0b12) then v}{v}{/await}",
        Some(("js_parse_error", "Unexpected token", 11)),
    ),
];

#[test]
fn acorn_stops_at_a_shorter_number_inside_parentheses() {
    assert_component_outcomes(COMPONENTS);
}
