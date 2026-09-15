//! Source-map columns count UTF-16 code units, not UTF-8 bytes (#4599).
//!
//! Expected columns are read off the official compiler
//! (`submodules/svelte` @ 5.57.0) for the same input, not inferred from the
//! other port.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const SOURCE: &str = "<script>\n\tlet 日本語 = $state(1);\n</script>\n\n<p>{日本語}</p>\n";

fn client_map(source: &str) -> serde_json::Value {
    let options = CompileOptions {
        generate: GenerateMode::Client,
        dev: false,
        filename: Some("input.svelte".to_string()),
        ..Default::default()
    };
    let result = compile(source, options).expect("compiles");
    serde_json::from_str(&result.js.map.expect("a source map")).expect("a JSON map")
}

/// Decode the VLQ mappings into `(generated_line, source_line, source_column)`.
fn segments(map: &serde_json::Value) -> Vec<(u32, u32, u32)> {
    const DIGITS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mappings = map["mappings"].as_str().expect("mappings string");
    let mut out = Vec::new();
    let mut previous = [0i64; 4];
    for (generated_line, line) in mappings.split(';').enumerate() {
        for segment in line.split(',').filter(|s| !s.is_empty()) {
            let mut values = Vec::new();
            let (mut shift, mut value) = (0u32, 0i64);
            for byte in segment.bytes() {
                let digit = DIGITS.iter().position(|d| *d == byte).expect("VLQ digit") as i64;
                value += (digit & 31) << shift;
                if digit & 32 != 0 {
                    shift += 5;
                    continue;
                }
                let negative = value & 1 == 1;
                value >>= 1;
                values.push(if negative { -value } else { value });
                shift = 0;
                value = 0;
            }
            if values.len() >= 4 {
                previous[1] += values[1];
                previous[2] += values[2];
                previous[3] += values[3];
                out.push((
                    u32::try_from(generated_line).expect("line fits"),
                    u32::try_from(previous[2]).expect("source line fits"),
                    u32::try_from(previous[3]).expect("source column fits"),
                ));
            }
        }
    }
    out
}

#[test]
fn a_column_right_of_a_multibyte_character_is_the_utf16_one() {
    let segments = segments(&client_map(SOURCE));
    let mut columns: Vec<u32> = segments
        .iter()
        .filter(|(_, source_line, _)| *source_line == 1)
        .map(|(_, _, column)| *column)
        .collect();
    columns.sort_unstable();
    columns.dedup();

    // Liveness: without a segment on the declaration line the assertions below
    // are vacuous.
    assert!(
        !columns.is_empty(),
        "no segment anchors on the `let 日本語` line"
    );

    // `\tlet 日本語 = $state(1);` — the space after the identifier is UTF-16
    // column 8 and byte column 14; official emits 8. The closing paren is 19
    // and 25; official emits 19.
    assert!(
        columns.contains(&8),
        "expected the identifier to end at UTF-16 column 8, got {columns:?}"
    );
    assert!(
        !columns.contains(&14),
        "column 14 is the UTF-8 byte offset of that position, got {columns:?}"
    );
    assert!(
        columns.contains(&19),
        "expected the closing paren at UTF-16 column 19, got {columns:?}"
    );
    assert!(
        !columns.contains(&25),
        "column 25 is the UTF-8 byte offset of that position, got {columns:?}"
    );
}

#[test]
fn no_source_column_runs_past_the_end_of_its_line() {
    // The property official satisfies on the whole corpus: a column is an index
    // into the line's UTF-16 units, so it cannot exceed that line's length.
    let lines: Vec<&str> = SOURCE.split('\n').collect();
    let segments = segments(&client_map(SOURCE));
    let mut on_a_multibyte_line = 0usize;
    for (generated_line, source_line, column) in &segments {
        let text = lines.get(*source_line as usize).unwrap_or_else(|| {
            panic!("segment names source line {source_line}, which has no text")
        });
        if !text.is_ascii() {
            on_a_multibyte_line += 1;
        }
        let width = u32::try_from(text.encode_utf16().count()).expect("line width fits");
        assert!(
            *column <= width,
            "generated line {generated_line} maps to {source_line}:{column}, past the \
             {width}-unit line {text:?}"
        );
    }
    assert!(
        on_a_multibyte_line > 0,
        "no segment lands on a line with a multibyte character"
    );
}

#[test]
fn an_all_ascii_source_is_unaffected() {
    // Negative control: the conversion must be a no-op where byte and UTF-16
    // columns agree, which is every column of an ASCII source.
    let ascii = "<script>\n\tlet count = $state(1);\n</script>\n\n<p>{count}</p>\n";
    let lines: Vec<&str> = ascii.split('\n').collect();
    let segments = segments(&client_map(ascii));
    assert!(
        !segments.is_empty(),
        "the ASCII fixture produced no segments"
    );
    for (_, source_line, column) in &segments {
        let text = lines[*source_line as usize];
        assert!(
            *column as usize <= text.len(),
            "ASCII column {column} runs past {text:?}"
        );
    }
}
