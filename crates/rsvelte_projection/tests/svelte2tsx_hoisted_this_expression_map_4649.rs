//! `<svelte:component this={C} a={x}>` and `<svelte:element this={t} a={x}>`
//! have to emit the `this` expression BEFORE the attributes the source writes
//! before it (`__sveltets_2_ensureComponent(C)` opens the statement the props
//! object closes). `emit_segmented_overwrite` walks source order, so one of the
//! two sides had to be baked into a literal and lost every map segment — the
//! component path baked the expression (it was interpolated into the header
//! text and never became a `Seg::Src` at all), the dynamic-element path baked
//! the attributes. Upstream relocates the chunk instead, with `str.move()`
//! (`htmlxtojsx_v2/utils/node-utils.ts`, `transform`).
//!
//! The generated TSX is byte-identical either way — the svelte2tsx fixtures and
//! the text gate cannot see this. Every expected value below was read off the
//! official svelte2tsx for the same input.

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

fn span_of(source: &str, marker: &str, name: &str) -> (u32, u32, u32) {
    assert_eq!(
        marker.matches(name).count(),
        1,
        "{name:?} occurs {} times in {marker:?}; pick a name unique within the marker",
        marker.matches(name).count(),
    );
    let line = source
        .lines()
        .position(|line| line.contains(marker))
        .unwrap_or_else(|| panic!("marker {marker:?} not found in\n{source}"));
    let column = source.lines().nth(line).unwrap().find(marker).unwrap() as u32;
    let start = column + (marker.find(name).expect("name inside marker") as u32);
    (line as u32, start, start + name.len() as u32)
}

/// Every character of `name` inside `marker` carries a map segment.
fn assert_mapped(source: &str, marker: &str, name: &str) {
    let projected = project(source);
    let mapped = mapped_source_positions(&projected);
    let (line, start, end) = span_of(source, marker, name);
    for column in start..end {
        assert!(
            mapped.contains(&(line, column)),
            "{marker}: source {line}:{column} carries no map segment\n--- generated ---\n{}",
            projected.code,
        );
    }
}

const HEAD: &str = "<script lang=\"ts\">\n\tconst tag = \"div\";\n\tlet hue = \"red\";\n\tlet Comp: any = null;\n\tlet rest = {};\n</script>\n";

fn with_head(body: &str) -> String {
    format!("{HEAD}{body}\n")
}

#[test]
fn a_component_this_expression_carries_its_own_map_segments() {
    assert_mapped(
        &with_head("<svelte:component this={Comp} title={hue} />"),
        "this={Comp}",
        "Comp",
    );
}

#[test]
fn a_component_this_expression_written_after_an_attribute_still_maps() {
    assert_mapped(
        &with_head("<svelte:component title={hue} this={Comp} />"),
        "this={Comp}",
        "Comp",
    );
}

/// The side that had to survive the relocation: baking the other chunk instead
/// would pass the cell above and fail this one.
#[test]
fn an_attribute_written_before_a_component_this_keeps_its_map_segments() {
    assert_mapped(
        &with_head("<svelte:component title={hue} this={Comp} />"),
        "title={hue}",
        "hue",
    );
}

#[test]
fn an_attribute_written_before_a_dynamic_element_this_carries_its_map_segments() {
    assert_mapped(
        &with_head("<svelte:element title={hue} this={tag} />"),
        "title={hue}",
        "hue",
    );
}

#[test]
fn a_dynamic_element_this_expression_still_maps_when_an_attribute_precedes_it() {
    assert_mapped(
        &with_head("<svelte:element title={hue} this={tag} />"),
        "this={tag}",
        "tag",
    );
}

/// A directive suffix is emitted after the attributes and reads a source range
/// of its own; the relocated `this` must not displace it.
#[test]
fn a_style_directive_after_a_hoisted_dynamic_element_this_keeps_its_map_segments() {
    assert_mapped(
        &with_head("<svelte:element title={hue} this={tag} style:color={hue}>c</svelte:element>"),
        "style:color={hue}",
        "hue",
    );
}

/// A source chunk AFTER the `this` expression as well as before it: the
/// relocated chunk then sits in a middle gap rather than the trailing one.
#[test]
fn an_attribute_before_a_component_this_maps_with_a_spread_after_it() {
    assert_mapped(
        &with_head("<svelte:component title={hue} this={Comp} {...rest} />"),
        "title={hue}",
        "hue",
    );
}

#[test]
fn a_spread_after_a_component_this_keeps_its_map_segments() {
    assert_mapped(
        &with_head("<svelte:component title={hue} this={Comp} {...rest} />"),
        "{...rest}",
        "rest",
    );
}

/// Relocating a chunk must not move a byte of the generated text. The expected
/// opener is the official svelte2tsx output for this input.
#[test]
fn relocating_the_this_expression_leaves_the_generated_text_alone() {
    let projected = project(&with_head("<svelte:component title={hue} this={Comp} />"));
    let opener = projected
        .code
        .lines()
        .find(|line| line.contains("ensureComponent"))
        .expect("opener");
    assert_eq!(
        opener,
        " { const $$_tnenopmoc_etlevs0C = __sveltets_2_ensureComponent(Comp); new $$_tnenopmoc_etlevs0C({ target: __sveltets_2_any(), props: {   \"title\":hue,}});}",
        "--- generated ---\n{}",
        projected.code,
    );
}
