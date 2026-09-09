//! An attribute name is emitted as `"` + source chunk + `"`, and the opening
//! quote was flushed inside the preceding gap's single `overwrite`, so its map
//! segment anchored on the END of the previous attribute. TypeScript reports a
//! definition/hover range that starts at that quote, so the range's start
//! resolved to the previous attribute — on a multi-line start tag, to the
//! previous LINE (#4104).
//!
//! Upstream writes the delimiter over the name's own first character
//! (`Attribute.ts`, `contentOnly`), which anchors it on the name. Measured
//! against upstream over 665 language-tools components, that difference is the
//! only one this changes: 386 generated columns move and all 386 move onto
//! upstream's answer.
//!
//! The generated text is identical either way, so neither the 253 svelte2tsx
//! fixtures nor the map gate (structural well-formedness, not equality against
//! upstream) can see this.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

const REPRO: &str = "<script lang=\"ts\">\n\tconst open = true;\n</script>\n\n<div class=\"a\" data-open={open}>one-line</div>\n\n<div\n\tclass=\"a\"\n\tdata-open={open}\n>multi-line</div>\n";

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

/// The source position of the segment anchored at exactly `(line, column)`, or
/// `None` when the generated column carries no segment of its own. A lower-bound
/// lookup would answer for every column and so could not tell "anchored here"
/// from "inherited from the previous token" — which is the whole defect.
fn segment_at(projected: &Projected, line: u32, column: u32) -> Option<(u32, u32)> {
    projected
        .map
        .tokens()
        .find(|t| t.get_dst_line() == line && t.get_dst_col() == column)
        .map(|t| (t.get_src_line(), t.get_src_col()))
}

#[test]
fn the_opening_quote_of_an_attribute_key_anchors_on_the_name() {
    let projected = project(REPRO);
    // Both start tags produce the same generated key text, so take them in order.
    for (nth, source_line) in [(0usize, 4u32), (1, 8)] {
        let (gen_line, quote_col) = locate_nth(&projected.code, "\"data-open\"", nth);
        let name_start = REPRO
            .lines()
            .nth(source_line as usize)
            .expect("source line")
            .find("data-open")
            .expect("attribute name") as u32;
        assert_eq!(
            segment_at(&projected, gen_line, quote_col),
            Some((source_line, name_start)),
            "occurrence {nth}: the opening quote at generated ({gen_line},{quote_col}) must \
             anchor on `data-open` at source ({source_line},{name_start})\n{}",
            projected.code
        );
    }
}

#[test]
fn the_name_itself_still_maps_per_character() {
    let projected = project(REPRO);
    let (gen_line, quote_col) = locate_nth(&projected.code, "\"data-open\"", 0);
    let name_start = REPRO.lines().nth(4).unwrap().find("data-open").unwrap() as u32;
    // `"d` is one edited chunk, so the second character of the name is the first
    // that carries its own segment again.
    for offset in 2..="data-open".len() as u32 {
        assert_eq!(
            segment_at(&projected, gen_line, quote_col + offset),
            Some((4, name_start + offset - 1)),
            "generated column {} inside the key must map into the name",
            quote_col + offset
        );
    }
}

#[test]
fn a_quote_the_user_wrote_is_untouched() {
    // Control: the patch folds an INSERTED delimiter onto the chunk it opens.
    // A quote that is itself source is inside the preserved chunk and must keep
    // mapping to itself — upstream does not fold those either (measured: 201
    // such pairs across the corpus, none folded).
    let source =
        "<script lang=\"ts\">\n\tconst greeting = \"hello\";\n</script>\n\n<div>{greeting}</div>\n";
    let projected = project(source);
    let (gen_line, gen_col) = locate_nth(&projected.code, "\"hello\"", 0);
    let src_col = source.lines().nth(1).unwrap().find("\"hello\"").unwrap() as u32;
    assert_eq!(
        segment_at(&projected, gen_line, gen_col),
        Some((1, src_col)),
        "a source quote maps to itself\n{}",
        projected.code
    );
}

#[test]
fn a_rewritten_attribute_name_carries_no_segment_of_its_own() {
    // Control: `CLASS` is emitted as the DOM property name `"class"`, so the key
    // is generated text rather than a preserved chunk and there is no chunk for
    // the quote to open. Nothing is folded, and the key anchors nowhere.
    let source = "<div CLASS=\"a\">x</div>\n";
    let projected = project(source);
    assert!(
        projected.code.contains("\"class\""),
        "expected the rewritten key in the output\n{}",
        projected.code
    );
    let (gen_line, quote_col) = locate_nth(&projected.code, "\"class\"", 0);
    assert_eq!(
        segment_at(&projected, gen_line, quote_col),
        None,
        "a generated key has no source chunk to anchor on\n{}",
        projected.code
    );
}

#[test]
fn the_first_attribute_in_a_tag_folds_too() {
    // The fold must not depend on there being a preceding attribute to inherit
    // from — that is the arrangement in which the defect is invisible, because
    // the gap's own start is already near the name.
    let source = "<div data-open={1}>x</div>\n";
    let projected = project(source);
    let (gen_line, quote_col) = locate_nth(&projected.code, "\"data-open\"", 0);
    let name_start = source.lines().next().unwrap().find("data-open").unwrap() as u32;
    assert_eq!(
        segment_at(&projected, gen_line, quote_col),
        Some((0, name_start)),
        "the opening quote anchors on the name even as the first attribute\n{}",
        projected.code
    );
}
