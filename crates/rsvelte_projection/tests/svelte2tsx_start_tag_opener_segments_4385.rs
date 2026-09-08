//! Nine ports apply a start tag to the `MagicString`. Three build the opener as
//! a `Vec<Seg>`, so every expression inside it reaches the shadow as an unedited
//! source chunk and keeps its own map segment. Six assembled the opener with
//! `format!` and applied it with one `str.overwrite`, which is a single
//! `addEdit` — so every expression in the tag shared the element's start
//! mapping and a request inside the tag resolved through the nearest mapping to
//! its left (#4385).
//!
//! Upstream never does this: `htmlxtojsx_v2`'s `transform` takes a
//! `TransformationArray` whose entries are either strings or `[start, end]`
//! ranges, and it `move`s each range so the chunk reaches the shadow unedited.
//!
//! One cell per port. Cells 1-3 are live positive controls — ports that already
//! build a `Vec<Seg>` — so a grid on which every cell was red would say nothing
//! about the mechanism, and a fix that reaches the reported port and one
//! neighbour is distinguishable from one that reaches all six.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

struct Projected {
    code: String,
    map: sourcemap::SourceMap,
}

fn project(source: &str) -> Projected {
    let result = svelte2tsx(
        source,
        Svelte2TsxOptions {
            filename: "App.svelte".to_string(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx");
    let map = sourcemap::SourceMap::from_slice(result.map.as_deref().expect("map").as_bytes())
        .expect("valid source map");
    Projected {
        code: result.code,
        map,
    }
}

/// `(line, column)` of the `nth` occurrence of `needle` in `text`.
fn locate_nth(text: &str, needle: &str, nth: usize) -> (u32, u32) {
    let offset = text
        .match_indices(needle)
        .nth(nth)
        .unwrap_or_else(|| panic!("occurrence {nth} of {needle:?} not found in\n{text}"))
        .0;
    let line = text[..offset].matches('\n').count() as u32;
    let column = (offset - text[..offset].rfind('\n').map(|i| i + 1).unwrap_or(0)) as u32;
    (line, column)
}

/// Whether some generated segment is anchored on exactly this source position.
/// The question is not "does anything map near here" — a lower-bound lookup
/// answers for every position — but whether this chunk reached the shadow
/// unedited, which is what an exact source anchor means.
fn anchored_at_source(projected: &Projected, line: u32, column: u32) -> bool {
    projected
        .map
        .tokens()
        .any(|t| t.get_src_line() == line && t.get_src_col() == column)
}

/// Every cell holds one expression attribute whose value is `probe`, so the
/// assertion is the same for all nine: the `probe` the TEMPLATE writes (never
/// the one the script declares) must be anchored.
fn assert_expression_is_anchored(cell: &str, source: &str) {
    let projected = project(source);
    // Occurrence 0 is the declaration in `<script>`; occurrence 1 is the
    // template's. A cell that stops carrying two would silently assert about
    // the declaration, so the count is checked rather than assumed.
    let occurrences = source.matches("probe").count();
    assert_eq!(
        occurrences, 2,
        "{cell}: the cell must hold exactly two `probe`s (the declaration and the \
         template use); it holds {occurrences}\n{source}"
    );
    let (line, column) = locate_nth(source, "probe", 1);
    assert!(
        anchored_at_source(&projected, line, column),
        "{cell}: the template expression at source ({line},{column}) reaches the shadow \
         as generated text carrying no segment, so a request inside the start tag \
         resolves through the mapping to its left\n--- source ---\n{source}\n--- shadow ---\n{}",
        projected.code
    );
}

fn cell(markup: &str) -> String {
    format!("<script lang=\"ts\">\n\tconst probe = 1;\n</script>\n\n{markup}\n")
}

// ---------------------------------------------------------------------------
// Cells 1-3: ports that already emit segments. These must pass BEFORE the fix.
// ---------------------------------------------------------------------------

#[test]
fn cell1_plain_element_is_a_positive_control() {
    assert_expression_is_anchored("cell 1 element.rs", &cell("<div title={probe}>x</div>"));
}

#[test]
fn cell2_svelte_element_is_a_positive_control() {
    assert_expression_is_anchored(
        "cell 2 dynamic_element.rs",
        &cell("<svelte:element this={\"div\"} title={probe}>x</svelte:element>"),
    );
}

#[test]
fn cell3_component_is_a_positive_control() {
    assert_expression_is_anchored(
        "cell 3 inline_component.rs::handle_component",
        &cell("<Comp a={probe} />"),
    );
}

// ---------------------------------------------------------------------------
// Cells 4-9: the six ports this change converts.
// ---------------------------------------------------------------------------

#[test]
fn cell4_svelte_component_opener_keeps_its_expression() {
    assert_expression_is_anchored(
        "cell 4 inline_component.rs:737 <svelte:component>",
        &cell("<svelte:component this={Comp} a={probe} />"),
    );
}

#[test]
fn cell5_svelte_self_opener_keeps_its_expression() {
    assert_expression_is_anchored(
        "cell 5 inline_component.rs:1091,1096 <svelte:self>",
        &cell("<svelte:self a={probe} />"),
    );
}

#[test]
fn cell6_svelte_body_opener_keeps_its_expression() {
    assert_expression_is_anchored(
        "cell 6 special_element.rs:331 <svelte:body>",
        &cell("<svelte:body onclick={() => probe} />"),
    );
}

#[test]
fn cell7_slot_opener_keeps_its_expression() {
    assert_expression_is_anchored(
        "cell 7 slot_element.rs:122 <slot>",
        &cell("<slot title={probe} />"),
    );
}

#[test]
fn cell8_component_slot_opener_keeps_its_expression() {
    assert_expression_is_anchored(
        "cell 8 component_slots.rs:571,675,679 slotted element",
        &cell("<Comp><div slot=\"s\" title={probe}></div></Comp>"),
    );
}

#[test]
fn cell9_svelte_head_title_opener_keeps_its_expression() {
    assert_expression_is_anchored(
        "cell 9 element.rs:385 handle_title_element",
        &cell("<svelte:head><title data-x={probe}>t</title></svelte:head>"),
    );
}
