//! The `mappings` string of a svelte2tsx source map must advance the generated
//! column, one segment per copied character. Regression test for issue #2066,
//! where every segment on a generated line claimed column 0 and the map was
//! therefore useless for position lookup.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

const BASE64_CHARS: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/// Decode a `mappings` string into per-generated-line segments of ABSOLUTE
/// `[generated_column, source, original_line, original_column]` values.
fn decode_mappings(mappings: &str) -> Vec<Vec<[i64; 4]>> {
    let mut source = 0;
    let mut original_line = 0;
    let mut original_column = 0;
    mappings
        .split(';')
        .map(|line| {
            let mut generated_column = 0;
            line.split(',')
                .filter(|segment| !segment.is_empty())
                .map(|segment| {
                    let fields = decode_fields(segment);
                    assert_eq!(fields.len(), 4, "segment {segment:?}");
                    generated_column += fields[0];
                    source += fields[1];
                    original_line += fields[2];
                    original_column += fields[3];
                    [generated_column, source, original_line, original_column]
                })
                .collect()
        })
        .collect()
}

fn decode_fields(segment: &str) -> Vec<i64> {
    let mut fields = Vec::new();
    let mut value = 0u64;
    let mut shift = 0;
    for byte in segment.bytes() {
        let digit = BASE64_CHARS
            .iter()
            .position(|candidate| *candidate == byte)
            .expect("mappings must use the base64 alphabet") as u64;
        value |= (digit & 31) << shift;
        if digit & 32 == 0 {
            let magnitude = (value >> 1) as i64;
            fields.push(if value & 1 == 0 {
                magnitude
            } else {
                -magnitude
            });
            value = 0;
            shift = 0;
        } else {
            shift += 5;
        }
    }
    assert_eq!(shift, 0, "unterminated VLQ in {segment:?}");
    fields
}

fn convert(source: &str) -> rsvelte_projection::svelte2tsx::Svelte2TsxResult {
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

fn mappings_of(result: &rsvelte_projection::svelte2tsx::Svelte2TsxResult) -> Vec<Vec<[i64; 4]>> {
    let map: serde_json::Value =
        serde_json::from_str(result.map.as_deref().expect("map")).expect("map is JSON");
    decode_mappings(map["mappings"].as_str().expect("mappings string"))
}

/// The generated line index whose text is exactly `text`.
fn generated_line_of(code: &str, text: &str) -> usize {
    code.lines()
        .position(|line| line == text)
        .unwrap_or_else(|| panic!("generated code has no line {text:?}:\n{code}"))
}

#[test]
fn copied_script_line_maps_every_generated_column() {
    let source = "<script lang=\"ts\">\n  const n: number = \"oops\";\n</script>\n";
    let result = convert(source);

    let copied = "  const n: number = \"oops\";";
    let generated_line = generated_line_of(&result.code, copied);
    let segments = &mappings_of(&result)[generated_line];

    // One segment per copied character (plus the boundary past the last one),
    // each at its own generated column, mapping back to original line 1.
    let expected: Vec<[i64; 4]> = (0..=copied.len() as i64)
        .map(|column| [column, 0, 1, column])
        .collect();
    assert_eq!(segments, &expected);
}

#[test]
fn copied_script_line_survives_a_third_party_source_map_reader() {
    let source = "<script lang=\"ts\">\n  const n: number = \"oops\";\n</script>\n";
    let result = convert(source);
    let copied = "  const n: number = \"oops\";";
    let generated_line = generated_line_of(&result.code, copied) as u32;

    let map = sourcemap::SourceMap::from_slice(result.map.as_deref().expect("map").as_bytes())
        .expect("valid source map");
    for column in 0..copied.len() as u32 {
        let token = map
            .lookup_token(generated_line, column)
            .unwrap_or_else(|| panic!("no token at generated column {column}"));
        assert_eq!(
            (token.get_src_line(), token.get_src_col()),
            (1, column),
            "generated column {column}"
        );
    }
}

#[test]
fn generated_columns_advance_within_every_line() {
    let source = r#"<script lang="ts">
  let count = 0;
  const label = "件数";
  function increment() {
    count += 1;
  }
</script>

<button on:click={increment}>{label}: {count}</button>
"#;
    for (index, line) in mappings_of(&convert(source)).iter().enumerate() {
        for pair in line.windows(2) {
            assert!(
                pair[0][0] <= pair[1][0],
                "line {index}: generated columns must not go backwards: {pair:?}"
            );
        }
        // A chunk boundary can repeat the column of the preceding chunk's trailing
        // segment; anything beyond that is the issue-#2066 "always column 0" bug.
        let at_zero = line.iter().filter(|segment| segment[0] == 0).count();
        assert!(at_zero <= 2, "line {index} stays at column 0: {line:?}");
    }
}

#[test]
fn copied_non_ascii_script_line_maps_utf16_columns() {
    let source = "<script lang=\"ts\">\n  const 名前 = \"😀\";\n</script>\n";
    let result = convert(source);

    let copied = "  const 名前 = \"😀\";";
    let generated_line = generated_line_of(&result.code, copied);
    let segments = &mappings_of(&result)[generated_line];

    // UTF-16 columns: `名`/`前` are one unit each, `😀` at column 14 is two, so the
    // segment after it lands on column 16.
    let expected: Vec<[i64; 4]> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18]
        .into_iter()
        .map(|column| [column, 0, 1, column])
        .collect();
    assert_eq!(segments, &expected);
}
