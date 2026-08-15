//! Source Map v3 encoding — the inverse of [`decode_sourcemap`].
//!
//! [`decode_sourcemap`]: super::decode_sourcemap

use serde_json::Value;

use super::types::SimpleDecodedMap;

/// Serialize a [`SimpleDecodedMap`] to a standard [Source Map v3] JSON object —
/// camelCase keys (`sourcesContent`, `sourceRoot`) and a VLQ-encoded `mappings`
/// string — so downstream tools (Vite, Rolldown, magic-string consumers) can
/// ingest it directly.
///
/// [Source Map v3]: https://sourcemaps.info/spec.html
pub fn decoded_to_v3_json(map: &SimpleDecodedMap) -> Value {
    let mut obj = serde_json::Map::new();
    obj.insert(
        "version".to_string(),
        Value::Number(serde_json::Number::from(map.version.unwrap_or(3))),
    );
    if let Some(ref file) = map.file {
        obj.insert("file".to_string(), Value::String(file.clone()));
    }
    if let Some(ref source_root) = map.source_root {
        obj.insert("sourceRoot".to_string(), Value::String(source_root.clone()));
    }
    obj.insert(
        "sources".to_string(),
        Value::Array(map.sources.iter().cloned().map(Value::String).collect()),
    );
    if let Some(ref contents) = map.sources_content {
        obj.insert(
            "sourcesContent".to_string(),
            Value::Array(
                contents
                    .iter()
                    .map(|c| c.clone().map_or(Value::Null, Value::String))
                    .collect(),
            ),
        );
    }
    obj.insert(
        "names".to_string(),
        Value::Array(map.names.iter().cloned().map(Value::String).collect()),
    );
    obj.insert(
        "mappings".to_string(),
        Value::String(encode_mappings(&map.mappings)),
    );
    Value::Object(obj)
}

/// Serialize a [`SimpleDecodedMap`] to a Source Map v3 JSON string.
pub fn decoded_to_v3_string(map: &SimpleDecodedMap) -> String {
    decoded_to_v3_json(map).to_string()
}

/// VLQ-encode a decoded `mappings` array (`Vec<Vec<Vec<i64>>>`) into the Source
/// Map v3 string form: lines separated by `;`, segments within a line separated
/// by `,`, fields within a segment as relative-encoded VLQs.
pub fn encode_mappings(mappings: &[Vec<Vec<i64>>]) -> String {
    let mut out = String::new();
    // Source index / original line / original column / name index run relative
    // to the *previous segment*, regardless of line. Generated column resets at
    // each `;` (per spec).
    let mut prev_source: i64 = 0;
    let mut prev_orig_line: i64 = 0;
    let mut prev_orig_col: i64 = 0;
    let mut prev_name: i64 = 0;
    for (i, line) in mappings.iter().enumerate() {
        if i > 0 {
            out.push(';');
        }
        let mut prev_gen_col: i64 = 0;
        for (j, segment) in line.iter().enumerate() {
            if j > 0 {
                out.push(',');
            }
            if segment.is_empty() {
                continue;
            }
            let gen_col = segment[0];
            encode_vlq(&mut out, gen_col - prev_gen_col);
            prev_gen_col = gen_col;
            if segment.len() >= 4 {
                let src = segment[1];
                let orig_line = segment[2];
                let orig_col = segment[3];
                encode_vlq(&mut out, src - prev_source);
                encode_vlq(&mut out, orig_line - prev_orig_line);
                encode_vlq(&mut out, orig_col - prev_orig_col);
                prev_source = src;
                prev_orig_line = orig_line;
                prev_orig_col = orig_col;
                if segment.len() >= 5 {
                    let name = segment[4];
                    encode_vlq(&mut out, name - prev_name);
                    prev_name = name;
                }
            }
        }
    }
    out
}

const BASE64: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/// Append the base64-VLQ encoding of one signed value to `out`.
pub fn encode_vlq(out: &mut String, value: i64) {
    // Source map VLQ is sign-magnitude — bit 0 is the sign — not the
    // two's-complement zigzag, which is off by one for every negative value.
    let mut vlq = (value.unsigned_abs() << 1) | u64::from(value < 0);
    loop {
        let mut digit = (vlq & 0x1f) as u8;
        vlq >>= 5;
        if vlq > 0 {
            digit |= 0x20;
        }
        out.push(BASE64[digit as usize] as char);
        if vlq == 0 {
            break;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::super::decode_sourcemap::decode_map;
    use super::super::types::{Processed, SourceMapInput};
    use super::*;

    fn round_trip(map: &SimpleDecodedMap) -> SimpleDecodedMap {
        let processed = Processed {
            code: String::new(),
            map: Some(SourceMapInput::Json(decoded_to_v3_string(map))),
            dependencies: vec![],
            attributes: None,
        };
        decode_map(&processed).expect("encoded map must decode")
    }

    #[test]
    fn encode_then_decode_is_the_identity() {
        let map = SimpleDecodedMap {
            version: Some(3),
            file: Some("out.js".to_string()),
            sources: vec!["a.svelte".to_string(), "b.svelte".to_string()],
            sources_content: Some(vec![Some("a".to_string()), None]),
            names: vec!["foo".to_string(), "bar".to_string()],
            mappings: vec![
                vec![vec![0, 0, 0, 0], vec![4, 0, 0, 4, 0]],
                vec![],
                vec![vec![2, 1, 7, 13, 1], vec![9, 0, 3, 1]],
            ],
            source_root: Some("/src".to_string()),
        };
        assert_eq!(round_trip(&map), map);
    }

    #[test]
    fn negative_deltas_round_trip() {
        // The second line steps *backwards* in both source index and original
        // position, which is what exercises the sign bit of the VLQ.
        let map = SimpleDecodedMap {
            sources: vec!["a".to_string(), "b".to_string()],
            mappings: vec![
                vec![vec![10, 1, 40, 90]],
                vec![vec![0, 0, 2, 3], vec![1, 0, 1, 0]],
            ],
            ..SimpleDecodedMap::default()
        };
        assert_eq!(round_trip(&map), map);
    }

    #[test]
    fn one_length_segments_round_trip() {
        // A sourceless segment carries only the generated column.
        let map = SimpleDecodedMap {
            sources: vec!["a".to_string()],
            mappings: vec![vec![vec![0], vec![5, 0, 0, 5]]],
            ..SimpleDecodedMap::default()
        };
        assert_eq!(round_trip(&map), map);
    }

    #[test]
    fn known_mappings_string() {
        assert_eq!(encode_mappings(&[vec![vec![0, 0, 0, 0]]]), "AAAA");
        assert_eq!(encode_mappings(&[vec![], vec![vec![0, 0, 0, 0]]]), ";AAAA");
    }
}
