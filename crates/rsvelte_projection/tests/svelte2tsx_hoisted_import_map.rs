//! Imports hoisted out of the instance script keep a source-map segment on
//! every character, so a diagnostic on an import in a `.svelte` file resolves
//! back to its real line instead of falling through to line 1.
//!
//! Regression test for issue #2112: the hoisted lines used to be freshly
//! synthesized text with the original span blanked out, which emitted no
//! segments at all.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, Svelte2TsxResult, svelte2tsx};

fn convert(source: &str) -> Svelte2TsxResult {
    svelte2tsx(
        source,
        Svelte2TsxOptions {
            filename: "A.svelte".to_string(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
}

/// The generated line index whose text is exactly `text`.
fn generated_line_of(code: &str, text: &str) -> u32 {
    code.lines()
        .position(|line| line == text)
        .unwrap_or_else(|| panic!("generated code has no line {text:?}:\n{code}")) as u32
}

/// Assert that `[0, len)` of the generated line maps to `original_line`,
/// starting at `original_column`, one column at a time.
fn assert_line_maps_verbatim(
    result: &Svelte2TsxResult,
    generated_line: u32,
    len: u32,
    original_line: u32,
    original_column: u32,
) {
    let map = sourcemap::SourceMap::from_slice(result.map.as_deref().expect("map").as_bytes())
        .expect("valid source map");
    for column in 0..len {
        let token = map
            .lookup_token(generated_line, column)
            .unwrap_or_else(|| panic!("no token at generated column {column}"));
        assert_eq!(
            (token.get_src_line(), token.get_src_col()),
            (original_line, original_column + column),
            "generated line {generated_line}, column {column}"
        );
    }
}

#[test]
fn hoisted_import_maps_back_to_its_source_line() {
    let source =
        "<script lang=\"ts\">\n  import { Missing } from './other';\n  let x = 1;\n</script>\n";
    let result = convert(source);

    let hoisted = "import { Missing } from './other';";
    let generated_line = generated_line_of(&result.code, hoisted);
    // The `<script>` tag is line 0, so the import sits on original line 1 at
    // column 2 (past the two-space indent, which stays behind).
    assert_line_maps_verbatim(&result, generated_line, hoisted.len() as u32, 1, 2);
}

#[test]
fn every_hoisted_import_of_a_group_maps_back() {
    let source = "<script lang=\"ts\">\n  import { a } from './a';\n  import { b } from './b';\n  let x = a + b;\n</script>\n";
    let result = convert(source);

    for (offset, text) in [
        (1, "import { a } from './a';"),
        (2, "import { b } from './b';"),
    ] {
        let generated_line = generated_line_of(&result.code, text);
        assert_line_maps_verbatim(&result, generated_line, text.len() as u32, offset, 2);
    }
}

#[test]
fn hoisted_import_with_a_leading_comment_maps_back() {
    let source = "<script lang=\"ts\">\n  // why we need it\n  import { a } from './a';\n  let x = a;\n</script>\n";
    let result = convert(source);

    let hoisted = "import { a } from './a';";
    let generated_line = generated_line_of(&result.code, hoisted);
    assert_line_maps_verbatim(&result, generated_line, hoisted.len() as u32, 2, 2);
}

/// The hoisted import must not be the only thing that moves: the statement that
/// follows it stays where it was, so its mapping is untouched.
#[test]
fn statement_after_a_hoisted_import_keeps_its_mapping() {
    let source = "<script lang=\"ts\">\n  import { a } from './a';\n  let x = a;\n</script>\n";
    let result = convert(source);

    let kept = "  let x = a;";
    let generated_line = generated_line_of(&result.code, kept);
    assert_line_maps_verbatim(&result, generated_line, kept.len() as u32, 2, 0);
}
