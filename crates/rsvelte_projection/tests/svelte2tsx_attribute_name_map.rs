//! Upstream `Attribute.ts` overwrites only the first character of an attribute
//! name and pushes `[attr.start, attr.start + attr.name.length]` as a range, so
//! the name survives as an unedited magic-string chunk and the map carries one
//! segment per character. Baking the name into the opener literal collapses all
//! of them into the opener's single edited chunk, which is what this pins.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};
use std::collections::HashSet;

const SOURCE: &str = r#"<script lang="ts">
  let cls = "a";
</script>

<div aria-label="hello" class={cls} data-thing="x" hidden></div>
"#;

/// Every `(line, column)` the generated map points back to.
fn mapped_source_positions(source: &str) -> HashSet<(u32, u32)> {
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
    map.tokens()
        .map(|token| (token.get_src_line(), token.get_src_col()))
        .collect()
}

#[test]
fn every_character_of_an_attribute_name_carries_a_mapping() {
    let mapped = mapped_source_positions(SOURCE);
    let line = SOURCE
        .lines()
        .position(|line| line.starts_with("<div "))
        .expect("template line") as u32;
    let text = SOURCE.lines().nth(line as usize).expect("template line");

    for name in ["aria-label", "class", "data-thing", "hidden"] {
        let start = text.find(name).expect("attribute name") as u32;
        for column in start..start + name.len() as u32 {
            assert!(
                mapped.contains(&(line, column)),
                "{name}: source {line}:{column} is not in the map",
            );
        }
    }
}

#[test]
fn a_lowercased_element_attribute_name_is_still_emitted_lowercase() {
    // The name is a real edit upstream (`str.overwrite(start, start + len, name)`),
    // so it stays a literal here — the guard must key on the emitted spelling.
    let result = svelte2tsx(
        "<div defaultValue=\"x\"></div>\n",
        Svelte2TsxOptions {
            filename: "A.svelte".to_string(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx");
    assert!(
        result.code.contains("\"defaultvalue\":"),
        "expected a lowercased name, got:\n{}",
        result.code
    );
}
