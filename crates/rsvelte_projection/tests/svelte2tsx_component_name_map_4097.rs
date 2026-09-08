//! A component's tag name was interpolated into the
//! `__sveltets_2_ensureComponent(<name>)` header as generated text, so the name
//! reached the shadow with no map segment and `textDocument/hover` on a
//! `<Comp />` tag answered `null` where official answers. Upstream pushes
//! `[nodeNameStart, nodeNameEnd]` — a source RANGE — into the same position
//! (`InlineComponent.ts:101-110`), and `this={…}` on `<svelte:component>` is
//! `[node.expression.start, node.expression.end]` at `:102`.
//!
//! The generated TSX is unchanged, so neither the 253 svelte2tsx fixtures nor
//! the map gate (which asserts well-formedness, not equality) can see this.
//! The attribute-value cells already pass on `main` — they are regression
//! guards, not discriminating cells.

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

const HEAD: &str =
    "<script lang=\"ts\">\n\timport Comp from './Comp.svelte';\n\tlet hue = 'red';\n</script>\n\n";

fn with_head(body: &str) -> String {
    format!("{HEAD}{body}\n")
}

#[test]
fn a_component_tag_name_carries_its_own_map_segments() {
    assert_mapped(&with_head("<Comp title={hue} />"), "<Comp title=", "Comp");
}

#[test]
fn a_component_tag_name_is_mapped_when_the_tag_has_no_attributes() {
    assert_mapped(&with_head("<Comp />"), "<Comp />", "Comp");
}

#[test]
fn a_svelte_component_this_expression_carries_its_own_map_segments() {
    assert_mapped(
        &with_head("<svelte:component this={Comp} title={hue} />"),
        "this={Comp}",
        "Comp",
    );
}

/// Pre-registered as already passing on `main`: the attribute value in the same
/// start tag is segmented by the opener work this builds on, so a green here
/// says the name change did not un-map its neighbours.
#[test]
fn an_attribute_value_beside_the_name_stays_mapped() {
    assert_mapped(&with_head("<Comp title={hue} />"), "title={hue}", "hue");
}

/// `<svelte:self>` is lowered to `__sveltets_2_createComponentAny` and upstream
/// pushes no name range for it, so the source text of the tag name must stay
/// unmapped — the negative direction of the same check.
#[test]
fn a_svelte_self_tag_name_carries_no_map_segment() {
    assert_unmapped(
        &with_head("<svelte:self title={hue} />"),
        "<svelte:self ",
        "svelte:self",
    );
}
