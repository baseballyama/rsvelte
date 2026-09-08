//! A chunk whose text contains `$effect` must still claim its `loc_map` region,
//! or its comment-space offsets reach the source map untranslated.
//!
//! `to_oxc.rs`'s `RawMappedEffect` arm called `take_chunk_region` only when
//! `effect_spans` was empty, and `take_chunk_region` is the only thing that
//! populates `loc_map` -- the table that resolves a comment-buffer offset back
//! into the source. With no entry, `Printer::map_position` passes the
//! comment-space offset through and the map names a position that is usually
//! past the end of the line it claims.
//!
//! `effect_spans` is `original.match_indices("$effect")`, a SUBSTRING scan, so
//! the guard fires on those seven bytes wherever they appear -- including inside
//! a comment or a string literal, in a component that uses no rune at all. Two
//! of the cells below are exactly that, and `$effecty` is there to pin that it
//! is a substring rather than a token.
//!
//! `sourcemaps_gate.rs` owns this predicate and cannot see any of it: measured
//! on this tree it reads `808/808 official segments reproduced, 0/1622
//! out-of-range` both with and without the fix, because its 29 fixtures do not
//! carry the shape. No corpus gate can see it either -- `verify.mjs` hashes
//! `js.code` and `css.code` and no map at all.
//!
//! Expected positions come from the official compiler's own map, not from this
//! port: for the `$effect` cell official maps generated `console.log(1);` to
//! source line 3 column 2 (0-based), the line the call is written on.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client_map(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .map
    .expect("client source map")
}

/// `[generated_line, generated_column, source_line, source_column]`, all 0-based.
fn decode(map_json: &str) -> (Vec<[i64; 4]>, Vec<String>) {
    let value: serde_json::Value = serde_json::from_str(map_json).expect("map json");
    let obj = value.as_object().expect("map object");
    let content = obj
        .get("sourcesContent")
        .and_then(|v| v.as_array())
        .map(|a| {
            a.iter()
                .map(|s| s.as_str().unwrap_or_default().to_string())
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();
    let mappings = obj
        .get("mappings")
        .and_then(|v| v.as_str())
        .expect("mappings");

    let mut out = Vec::new();
    let mut state = [0i64; 4];
    for (generated_line, line) in mappings.split(';').enumerate() {
        state[0] = 0;
        for field in line.split(',') {
            if field.is_empty() {
                continue;
            }
            let mut values = Vec::new();
            let mut value = 0i64;
            let mut shift = 0u32;
            for c in field.bytes() {
                let digit = match c {
                    b'A'..=b'Z' => (c - b'A') as i64,
                    b'a'..=b'z' => (c - b'a') as i64 + 26,
                    b'0'..=b'9' => (c - b'0') as i64 + 52,
                    b'+' => 62,
                    b'/' => 63,
                    _ => break,
                };
                value += (digit & 31) << shift;
                if digit & 32 == 0 {
                    let negative = value & 1 == 1;
                    value >>= 1;
                    values.push(if negative { -value } else { value });
                    value = 0;
                    shift = 0;
                } else {
                    shift += 5;
                }
            }
            for (i, v) in values.iter().take(4).enumerate() {
                state[i] += v;
            }
            if values.len() >= 4 {
                out.push([generated_line as i64, state[0], state[2], state[3]]);
            }
        }
    }
    (out, content)
}

/// The predicate `sourcemaps_gate.rs` owns: a segment is out of range when its
/// line is past the last line of the source, or its column is past the end of
/// that line. `column == length` is legal -- it addresses the line terminator.
/// Columns are UTF-16 code units.
fn out_of_range(map_json: &str) -> (usize, usize) {
    let (segments, content) = decode(map_json);
    let source = content.first().cloned().unwrap_or_default();
    let widths: Vec<i64> = source
        .split('\n')
        .map(|l| l.chars().map(|c| c.len_utf16() as i64).sum())
        .collect();
    let bad = segments
        .iter()
        .filter(|s| {
            let line = s[2];
            line < 0 || line as usize >= widths.len() || s[3] > widths[line as usize]
        })
        .count();
    (bad, segments.len())
}

const EFFECT: &str =
    "<script>\n\t// probe\n\t$effect(() => {\n\t\tconsole.log(1);\n\t});\n</script>\n";

/// Same program in every cell; only the word inside the comment and the string
/// changes, so nothing but the seven bytes can account for a difference.
fn opaque(word: &str) -> String {
    format!(
        "<script>\n\t// {word}\n\tconst s = \"{word}\";\n\tqueueMicrotask(() => {{\n\t\tconsole.log(s);\n\t}});\n</script>\n"
    )
}

#[test]
fn an_effect_chunk_maps_inside_its_source() {
    let (bad, total) = out_of_range(&client_map(EFFECT));
    // Liveness: a map with no segments satisfies "nothing is out of range".
    assert!(total > 10, "expected a populated map, got {total} segments");
    assert_eq!(bad, 0, "{bad} of {total} segments point outside the source");
}

#[test]
fn the_effect_body_maps_to_the_line_it_is_written_on() {
    let map = client_map(EFFECT);
    let (segments, content) = decode(&map);
    let source = content.first().expect("sourcesContent").clone();
    let lines: Vec<&str> = source.split('\n').collect();
    // Official maps generated `console.log(1);` to source 3:2 -- the line the
    // call is written on. Assert the line rather than the generated column, so
    // an unrelated codegen change does not rewrite this test.
    let named: Vec<i64> = segments
        .iter()
        .filter(|s| {
            let line = s[2] as usize;
            lines
                .get(line)
                .is_some_and(|l| l.contains("console.log(1);"))
        })
        .map(|s| s[2])
        .collect();
    assert!(
        named.contains(&3),
        "no segment names the source line holding `console.log(1);`; named lines were {named:?}"
    );
}

#[test]
fn seven_bytes_in_a_comment_or_a_string_do_not_move_the_map() {
    // `aaaaaaa`, `$inspect` and `effect` are the cells that must NOT move: the
    // first is a plain control, the second selects the same statement kind while
    // leaving `effect_spans` empty, and the third is the rune name without its
    // sigil. Without them a grid of only-`$effect` cells cannot tell "the
    // statement kind" from "the substring".
    let baseline = out_of_range(&client_map(&opaque("aaaaaaa")));
    assert!(baseline.1 > 10, "expected a populated map");
    for word in ["$effect", "$effecty", "$inspect", "effect"] {
        let (bad, total) = out_of_range(&client_map(&opaque(word)));
        assert_eq!(
            (bad, total),
            baseline,
            "`{word}` inside a comment and a string changed the map: {bad}/{total} out of range against the control's {}/{}",
            baseline.0,
            baseline.1
        );
    }
}
