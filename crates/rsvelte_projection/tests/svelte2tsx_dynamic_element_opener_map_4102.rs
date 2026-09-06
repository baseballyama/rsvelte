//! `<svelte:element this={…}>` had its whole opening tag applied as one
//! `str.overwrite`, so every expression in it — the `this` expression and every
//! attribute value — reached the shadow as generated text with no map segment.
//! `textDocument/hover` at any of those positions answered `null` where official
//! answers, because official builds the same opener from a TransformationArray
//! whose expression entries are source RANGES.
//!
//! The generated TSX is unchanged, so the 253 svelte2tsx fixtures cannot see this
//! and neither can the map gate, which asserts structural well-formedness rather
//! than equality. The plain-`<div>` cells below already pass on `main` — they are
//! regression guards, not discriminating cells; the `<svelte:element>` cells are
//! the ones that move.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};
use std::collections::HashSet;

struct Projected {
    code: String,
    map: sourcemap::SourceMap,
}

fn project(source: &str) -> Projected {
    let result = svelte2tsx(
        source,
        Svelte2TsxOptions {
            filename: "A.svelte".to_string(),
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

fn mapped_source_positions(projected: &Projected) -> HashSet<(u32, u32)> {
    projected
        .map
        .tokens()
        .map(|token| (token.get_src_line(), token.get_src_col()))
        .collect()
}

/// `(line, first column)` of `needle` in `text`.
fn locate(text: &str, needle: &str) -> (u32, u32) {
    let line = text
        .lines()
        .position(|line| line.contains(needle))
        .unwrap_or_else(|| panic!("needle {needle:?} not found in\n{text}"));
    let column = text.lines().nth(line).unwrap().find(needle).unwrap();
    (line as u32, column as u32)
}

fn span_of(source: &str, marker: &str, name: &str) -> (u32, u32, u32) {
    // `marker.find(name)` takes the FIRST occurrence, so a name that also occurs
    // inside the attribute/directive name silently points the assertion at text
    // that is never mapped (`style:color={col}` finds the `col` of `color`).
    assert_eq!(
        marker.matches(name).count(),
        1,
        "{name:?} occurs {} times in {marker:?}; pick a name unique within the marker",
        marker.matches(name).count(),
    );
    let (line, column) = locate(source, marker);
    let start = column + (marker.find(name).expect("name inside marker") as u32);
    (line, start, start + name.len() as u32)
}

/// Every character of `name` inside `marker` carries a map segment.
fn assert_mapped(source: &str, marker: &str, name: &str) {
    let projected = project(source);
    let mapped = mapped_source_positions(&projected);
    let (line, start, end) = span_of(source, marker, name);
    for c in start..end {
        assert!(
            mapped.contains(&(line, c)),
            "{marker}: source {line}:{c} carries no map segment\n--- generated ---\n{}",
            projected.code,
        );
    }
}

/// No character of `name` inside `marker` carries a map segment.
fn assert_unmapped(source: &str, marker: &str, name: &str) {
    let projected = project(source);
    let mapped = mapped_source_positions(&projected);
    let (line, start, end) = span_of(source, marker, name);
    for c in start..end {
        assert!(
            !mapped.contains(&(line, c)),
            "{marker}: source {line}:{c} unexpectedly carries a map segment\n--- generated ---\n{}",
            projected.code,
        );
    }
}

const HEAD: &str = "<script lang=\"ts\">\n\tconst tag = 'div';\n\tlet flag = false;\n\tlet el: HTMLElement | undefined = undefined;\n\tlet hue = 'red';\n\tlet rest = {};\n</script>\n\n";

fn with_head(body: &str) -> String {
    format!("{HEAD}{body}\n")
}

#[test]
fn the_this_expression_carries_its_own_map_segments() {
    assert_mapped(
        &with_head("<svelte:element this={tag} title={tag}>c</svelte:element>"),
        "this={tag}",
        "tag",
    );
}

#[test]
fn an_attribute_value_in_a_dynamic_element_carries_its_own_map_segments() {
    assert_mapped(
        &with_head("<svelte:element this={tag} title={tag}>c</svelte:element>"),
        "title={tag}",
        "tag",
    );
}

#[test]
fn an_event_handler_in_a_dynamic_element_carries_its_own_map_segments() {
    assert_mapped(
        &with_head(
            "<svelte:element this={tag} onclick={() => { flag = true; }}>c</svelte:element>",
        ),
        "onclick={() => { flag = true; }}",
        "flag",
    );
}

#[test]
fn a_spread_in_a_dynamic_element_carries_its_own_map_segments() {
    assert_mapped(
        &with_head("<svelte:element this={tag} {...rest}>c</svelte:element>"),
        "{...rest}",
        "rest",
    );
}

#[test]
fn a_self_closing_dynamic_element_carries_its_own_map_segments() {
    assert_mapped(
        &with_head("<svelte:element this={tag} title={tag} />"),
        "title={tag}",
        "tag",
    );
}

#[test]
fn a_multiline_dynamic_element_carries_its_own_map_segments() {
    assert_mapped(
        &with_head("<svelte:element\n\tthis={tag}\n\ttitle={tag}\n>c</svelte:element>"),
        "\ttitle={tag}",
        "tag",
    );
}

/// `this` written after another attribute inverts the generated order against
/// the source order, which `bake_out_of_order_src` resolves by baking the
/// out-of-order chunk. The earlier-in-generated-order `this` keeps its range;
/// the assertion is that the file still projects and the `this` expression maps.
#[test]
fn a_dynamic_element_whose_this_follows_another_attribute_still_maps_it() {
    assert_mapped(
        &with_head("<svelte:element title={tag} this={tag}>c</svelte:element>"),
        "this={tag}",
        "tag",
    );
}

#[test]
fn a_bind_this_suffix_in_a_dynamic_element_carries_its_own_map_segments() {
    assert_mapped(
        &with_head("<svelte:element this={tag} bind:this={el}>c</svelte:element>"),
        "bind:this={el}",
        "el",
    );
}

#[test]
fn a_style_directive_in_a_dynamic_element_carries_its_own_map_segments() {
    assert_mapped(
        &with_head("<svelte:element this={tag} style:color={hue}>c</svelte:element>"),
        "style:color={hue}",
        "hue",
    );
}

/// A string-literal `this` has no expression range — the parser stores the bare
/// text — so upstream generates `createElement("div", …)` and nothing maps back.
/// This cell fails if the fix widens from "emit the range" to "emit a range".
#[test]
fn a_string_literal_this_stays_unmapped() {
    assert_unmapped(
        &with_head("<svelte:element this=\"div\" title={tag}>c</svelte:element>"),
        "this=\"div\"",
        "div",
    );
}

/// Regression guard: the same attribute on a plain element already mapped before
/// this change, so this cell passes on both arms and pins that the segmented
/// opener did not regress the path it was copied from.
#[test]
fn a_plain_element_attribute_still_carries_its_map_segments() {
    assert_mapped(&with_head("<div title={tag}>c</div>"), "title={tag}", "tag");
}
