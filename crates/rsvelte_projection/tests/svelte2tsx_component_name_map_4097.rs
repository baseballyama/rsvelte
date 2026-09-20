//! `InlineComponent.ts:107-111` pushes `[nodeNameStart, nodeNameEnd]` — a source
//! range, not the name's text — as the argument of
//! `__sveltets_2_ensureComponent`, so the tag name survives as an unedited
//! magic-string chunk and the map carries one segment per character. Baking the
//! name into the header literal collapses every one of them, which is what left
//! a hover on a component tag answering `null` (#4097): the request position
//! mapped to column 0 of the generated line instead of to the identifier.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};
use std::collections::HashSet;

const SOURCE: &str = r#"<script lang="ts">
  import Other from './Other.svelte';
</script>

<Other />
"#;

fn project(source: &str) -> (String, HashSet<(u32, u32)>, sourcemap::SourceMap) {
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
    let positions = map
        .tokens()
        .map(|token| (token.get_src_line(), token.get_src_col()))
        .collect();
    (result.code, positions, map)
}

#[test]
fn every_character_of_a_component_tag_name_carries_a_mapping() {
    let (code, mapped, _) = project(SOURCE);
    assert!(
        code.contains("__sveltets_2_ensureComponent(Other)"),
        "{code}"
    );
    let line = SOURCE
        .lines()
        .position(|line| line.starts_with("<Other"))
        .expect("template line") as u32;
    for column in 1..1 + "Other".len() as u32 {
        assert!(
            mapped.contains(&(line, column)),
            "source {line}:{column} is not in the map",
        );
    }
}

#[test]
fn the_ensure_component_argument_maps_to_the_tag_name_not_the_angle_bracket() {
    let (code, _, map) = project(SOURCE);
    let generated_line = code
        .lines()
        .position(|line| line.contains("__sveltets_2_ensureComponent(Other)"))
        .expect("lowered call") as u32;
    let text = code.lines().nth(generated_line as usize).expect("line");
    let column = (text.find("__sveltets_2_ensureComponent(").expect("call")
        + "__sveltets_2_ensureComponent(".len()) as u32;
    let token = map
        .lookup_token(generated_line, column)
        .expect("a token at the argument");
    let source_line = SOURCE
        .lines()
        .position(|line| line.starts_with("<Other"))
        .expect("template line") as u32;
    // `<` is column 0; the name starts at 1. Anchoring on the element start is
    // what the collapsed literal produced.
    assert_eq!(
        (token.get_src_line(), token.get_src_col()),
        (source_line, 1)
    );
    assert_eq!(
        (token.get_dst_line(), token.get_dst_col()),
        (generated_line, column)
    );
}
