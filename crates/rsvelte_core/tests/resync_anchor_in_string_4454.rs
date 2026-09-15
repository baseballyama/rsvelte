//! #4454: the client text resync anchored a generated token on a byte inside a
//! source string literal.
//!
//! `copied_spans_for_normalized_code` re-aligns the generated instance body with
//! the script source a byte at a time. Where the two disagree it re-anchors on
//! the next equal byte, preferring a candidate that agrees for a token's worth
//! of bytes — but it only looked for one inside a 32-byte window, and fell back
//! to the bare equal byte when that window held none. A dropped `import` is
//! longer than the window, so `const xKey` anchored on the `c` of
//! `'../../_data/points.csv'`: a position inside the import's string, five bytes
//! before the line's end, which the `const` keyword's end anchor then pushed
//! past the end of that line.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// One decoded mapping segment: generated line/column and original line/column,
/// all zero-based, as the source map itself spells them.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
struct Segment {
    generated_line: u32,
    generated_column: i64,
    source_line: i64,
    source_column: i64,
}

fn vlq_values(field: &str) -> Vec<i64> {
    const ALPHABET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = Vec::new();
    let mut shift = 0u32;
    let mut value = 0i64;
    for byte in field.bytes() {
        let digit = ALPHABET
            .iter()
            .position(|candidate| *candidate == byte)
            .expect("source map field is base64") as i64;
        value += (digit & 31) << shift;
        if digit & 32 != 0 {
            shift += 5;
            continue;
        }
        let negative = value & 1 != 0;
        value >>= 1;
        out.push(if negative { -value } else { value });
        value = 0;
        shift = 0;
    }
    out
}

fn segments(mappings: &str) -> Vec<Segment> {
    let mut out = Vec::new();
    let (mut source_line, mut source_column) = (0i64, 0i64);
    for (generated_line, line) in mappings.split(';').enumerate() {
        let mut generated_column = 0i64;
        for field in line.split(',').filter(|field| !field.is_empty()) {
            let values = vlq_values(field);
            generated_column += values[0];
            if values.len() < 4 {
                continue;
            }
            source_line += values[2];
            source_column += values[3];
            out.push(Segment {
                generated_line: generated_line as u32,
                generated_column,
                source_line,
                source_column,
            });
        }
    }
    out
}

/// Zero-based line and column of `needle`'s first occurrence in `source`.
fn line_column(source: &str, needle: &str) -> (i64, i64) {
    let offset = source.find(needle).expect("the needle is in the source");
    let line = source[..offset].matches('\n').count() as i64;
    let line_start = source[..offset].rfind('\n').map_or(0, |at| at + 1);
    (line, (offset - line_start) as i64)
}

fn client_map(source: &str) -> (String, String) {
    let result = compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            filename: Some("Input.svelte".to_string()),
            ..Default::default()
        },
    )
    .expect("the component compiles");
    let map: serde_json::Value =
        serde_json::from_str(&result.js.map.expect("client output carries a map"))
            .expect("the map is JSON");
    (
        result.js.code,
        map["mappings"]
            .as_str()
            .expect("the map carries mappings")
            .to_string(),
    )
}

/// Every segment anchored at the start of the generated line holding `needle`.
fn line_start_segments(code: &str, mappings: &str, needle: &str) -> Vec<Segment> {
    let generated_line = code
        .lines()
        .position(|line| line.contains(needle))
        .expect("the generated output keeps the declaration") as u32;
    segments(mappings)
        .into_iter()
        .filter(|segment| {
            segment.generated_line == generated_line
                && segment.generated_column
                    == code
                        .lines()
                        .nth(generated_line as usize)
                        .expect("the line exists")
                        .find(needle)
                        .expect("the needle is on its own line") as i64
        })
        .collect()
}

/// The import is dropped from the instance body, so the resync has to skip it —
/// 42 bytes, past the near window. Its path carries the `c` that `const` starts
/// with, which is the byte the fallback anchor used to bind to.
const DROPPED_LONG_IMPORT: &str = r#"<script>
	// a comment ahead of the import keeps the region open
	import data from '../../_data/points.csv';

	const xKey = 'myX';
</script>
<p>{xKey}{data}</p>
"#;

/// Same shape with no `c` anywhere in the import: the fallback anchor had no
/// byte to bind to, so this cell was already correct before the fix.
const DROPPED_IMPORT_WITHOUT_THE_BYTE: &str = r#"<script>
	// a comment ahead of the import keeps the region open
	import data from '../../_data/points.txt';

	const xKey = 'myX';
</script>
<p>{xKey}{data}</p>
"#;

#[test]
fn the_declaration_keyword_maps_to_the_declaration() {
    let (code, mappings) = client_map(DROPPED_LONG_IMPORT);
    let found = line_start_segments(&code, &mappings, "const xKey");
    assert!(
        !found.is_empty(),
        "no segment anchors the declaration; the assertion below would be vacuous"
    );
    let (line, column) = line_column(DROPPED_LONG_IMPORT, "const xKey");
    for segment in &found {
        assert_eq!(
            (segment.source_line, segment.source_column),
            (line, column),
            "the `const` keyword maps into the import's string instead of the declaration: {segment:?}"
        );
    }
}

#[test]
fn an_import_without_the_keyword_byte_was_already_right() {
    let (code, mappings) = client_map(DROPPED_IMPORT_WITHOUT_THE_BYTE);
    let found = line_start_segments(&code, &mappings, "const xKey");
    assert!(!found.is_empty(), "no segment anchors the declaration");
    let (line, column) = line_column(DROPPED_IMPORT_WITHOUT_THE_BYTE, "const xKey");
    for segment in &found {
        assert_eq!((segment.source_line, segment.source_column), (line, column));
    }
}

#[test]
fn the_extractor_reads_a_real_map() {
    let (code, mappings) = client_map(DROPPED_LONG_IMPORT);
    let all = segments(&mappings);
    assert!(
        all.len() > 10,
        "the map decoded to {} segments; the filter above would pass on an empty map",
        all.len()
    );
    assert!(
        code.contains("const xKey = 'myX';"),
        "the declaration is not in the generated output, so nothing is being asserted"
    );
}
