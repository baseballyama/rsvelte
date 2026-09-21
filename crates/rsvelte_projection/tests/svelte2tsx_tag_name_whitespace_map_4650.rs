//! `InlineComponent.ts:67-75` overwrites the whitespace right after a component
//! tag name with nothing, and `transform`'s one-character extension
//! (`node-utils.ts:56-71`) then swallows the character after it when no kept
//! range starts there. Both write *empty* content, and magic-string emits no
//! segment for an edited chunk that is empty — which is why official's map has
//! no entry on those columns while the tag name itself keeps one per character.
//!
//! Without the two, rsvelte's map anchored the generated props object on the
//! whitespace instead (#4650), so a request on the first attribute resolved one
//! column early.
//!
//! Every expected column below is the oracle's own: `svelte2tsx` from
//! `submodules/language-tools` over the same source.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};
use std::collections::BTreeSet;

fn mapped_columns(source: &str, line: u32) -> BTreeSet<u32> {
    let result = svelte2tsx(
        source,
        Svelte2TsxOptions {
            filename: "Input.svelte".to_string(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx");
    let map = sourcemap::SourceMap::from_slice(result.map.as_deref().expect("map").as_bytes())
        .expect("valid source map");
    map.tokens()
        .filter(|token| token.get_src_line() == line)
        .map(|token| token.get_src_col())
        .collect()
}

#[test]
fn the_single_space_after_a_component_tag_name_carries_no_mapping() {
    let columns = mapped_columns("<Comp title={hue} />\n", 0);
    assert!(!columns.contains(&5), "{columns:?}");
    for column in [1, 2, 3, 4, 6] {
        assert!(columns.contains(&column), "column {column}: {columns:?}");
    }
}

#[test]
fn a_second_space_is_swallowed_by_the_one_character_extension() {
    let columns = mapped_columns("<Comp  title={hue} />\n", 0);
    for column in [5, 6] {
        assert!(!columns.contains(&column), "column {column}: {columns:?}");
    }
    for column in [1, 2, 3, 4, 7] {
        assert!(columns.contains(&column), "column {column}: {columns:?}");
    }
}

#[test]
fn the_extension_stops_where_the_next_transformation_is_a_string() {
    // `<Comp  />` has no prop range after the whitespace, so `transform` writes
    // the next *string* over the extended character instead of deleting it.
    let columns = mapped_columns("<Comp  />\n", 0);
    assert!(!columns.contains(&5), "{columns:?}");
    assert!(columns.contains(&6), "{columns:?}");
}

#[test]
fn a_newline_after_the_tag_name_is_whitespace_too() {
    let source = "<Comp\n  title={hue}\n/>\n";
    assert!(!mapped_columns(source, 0).contains(&5), "tag line");
    // The indent's first character is the extension's; the second is the gap
    // space official keeps.
    let second = mapped_columns(source, 1);
    assert!(!second.contains(&0), "{second:?}");
    assert!(second.contains(&1), "{second:?}");
}

#[test]
fn the_generated_text_is_unchanged() {
    let result = svelte2tsx(
        "<Comp title={hue} />\n",
        Svelte2TsxOptions {
            filename: "Input.svelte".to_string(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx");
    assert!(
        result.code.contains("__sveltets_2_ensureComponent(Comp)"),
        "{}",
        result.code
    );
    assert!(result.code.contains("\"title\":hue,"), "{}", result.code);
}
