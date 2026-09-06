//! Upstream `Binding.ts` emits a binding's assignment target as a source RANGE —
//! `appendOneWayBinding`'s `[expression.start, end]`, and `[set.start, getEnd(set)]`
//! for a get/set `bind:this` — so the expression survives as an unedited
//! magic-string chunk and the map carries a segment per character. Interpolating
//! its text into the suffix statement produces byte-identical TSX with no segment
//! on the binding, and a request inside `bind:this={el}` then resolves through the
//! nearest mapping to its left: hover answered `const tag: "div"` at the range of
//! the PRECEDING `title={tag}` attribute.
//!
//! No text gate can see this. The 253 svelte2tsx fixtures compare generated text,
//! which does not move; the svelte2tsx map gate asserts structural
//! well-formedness rather than equality; only the LSP differential gate compares
//! the resulting positions, and `bind:this` is under-sampled there (3 identifier
//! positions in melt-ui).

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

/// Every character of `name` inside `marker` carries a map segment.
fn assert_mapped(source: &str, marker: &str, name: &str) {
    let projected = project(source);
    let mapped = mapped_source_positions(&projected);
    let (line, column) = locate(source, marker);
    let start = column + (marker.find(name).expect("name inside marker") as u32);
    for c in start..start + name.len() as u32 {
        assert!(
            mapped.contains(&(line, c)),
            "{marker}: source {line}:{c} carries no map segment\n--- generated ---\n{}",
            projected.code,
        );
    }
}

#[test]
fn a_bind_this_target_carries_its_own_map_segments() {
    assert_mapped(
        "<script lang=\"ts\">\n\tconst tag = 'div';\n\tlet el: HTMLElement | undefined = undefined;\n</script>\n\n<div title={tag} bind:this={el}>a</div>\n",
        "bind:this={el}",
        "el",
    );
}

#[test]
fn a_get_set_bind_this_setter_carries_its_own_map_segments() {
    assert_mapped(
        "<script lang=\"ts\">\n\tconst get = () => null;\n\tconst set = (_: unknown) => {};\n</script>\n\n<div bind:this={get, set}>a</div>\n",
        "bind:this={get, set}",
        "set",
    );
}

#[test]
fn a_bind_group_on_input_carries_its_own_map_segments() {
    assert_mapped(
        "<script lang=\"ts\">\n\tlet chosen: string[] = [];\n</script>\n\n<input type=\"checkbox\" bind:group={chosen} />\n",
        "bind:group={chosen}",
        "chosen",
    );
}

#[test]
fn a_one_way_binding_on_the_element_carries_its_own_map_segments() {
    assert_mapped(
        "<script lang=\"ts\">\n\tlet width = 0;\n</script>\n\n<div bind:clientWidth={width}>a</div>\n",
        "bind:clientWidth={width}",
        "width",
    );
}

#[test]
fn a_one_way_binding_not_on_the_element_carries_its_own_map_segments() {
    assert_mapped(
        "<script lang=\"ts\">\n\tlet rect: DOMRectReadOnly | undefined = undefined;\n</script>\n\n<div bind:contentRect={rect}>a</div>\n",
        "bind:contentRect={rect}",
        "rect",
    );
}

#[test]
fn a_bind_this_type_assertion_tail_carries_its_own_map_segments() {
    assert_mapped(
        "<script lang=\"ts\">\n\tlet el: HTMLElement | undefined = undefined;\n</script>\n\n<div bind:this={el as HTMLElement}>a</div>\n",
        "bind:this={el as HTMLElement}",
        "as HTMLElement",
    );
}

/// The defect as it reaches a client: the generated assignment must resolve back
/// to the `el` of `bind:this={el}`, not to the preceding attribute's expression.
/// `assert_mapped` above only asks whether the source position carries some
/// segment; this asks which source position the generated one answers with, and
/// it is the direction the language server actually queries.
#[test]
fn the_generated_assignment_resolves_back_to_the_bound_name() {
    let source = "<script lang=\"ts\">\n\tconst tag = 'div';\n\tlet el: HTMLElement | undefined = undefined;\n</script>\n\n<div title={tag} bind:this={el}>a</div>\n";
    let projected = project(source);
    let (gen_line, gen_column) = locate(&projected.code, "el = $$_div0");
    let token = projected
        .map
        .lookup_token(gen_line, gen_column)
        .unwrap_or_else(|| panic!("generated {gen_line}:{gen_column} carries no segment"));
    let (want_line, want_column) = locate(source, "bind:this={el}");
    let want_column = want_column + "bind:this={".len() as u32;
    assert_eq!(
        (token.get_src_line(), token.get_src_col()),
        (want_line, want_column),
        "generated {gen_line}:{gen_column} resolves to the wrong source position\n--- generated ---\n{}",
        projected.code,
    );
}
