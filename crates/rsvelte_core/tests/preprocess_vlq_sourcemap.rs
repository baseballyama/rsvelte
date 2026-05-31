//! Regression test: `decode_map` must understand standard Source Map v3 JSON
//! whose `mappings` field is a base64-VLQ-encoded string (issue #451, H-012).
//!
//! Bug: the previous decoder was a one-line `serde_json::from_str(json_str).ok()`
//! into `SimpleDecodedMap`, whose `mappings` is `Vec<Vec<Vec<i64>>>`. A real
//! preprocessor map (with mappings as `"AAAA,SAASA"` etc.) failed to deserialise
//! and was silently dropped — `decode_map` returned `None`.

use rsvelte_core::compiler::preprocess::decode_sourcemap::decode_map;
use rsvelte_core::compiler::preprocess::types::{Processed, SourceMapInput};

fn vlq_processed(map_json: &str) -> Processed {
    Processed {
        code: String::new(),
        map: Some(SourceMapInput::Json(map_json.to_string())),
        dependencies: vec![],
        attributes: None,
    }
}

#[test]
fn decodes_standard_vlq_map_with_names() {
    let m = r#"{"version":3,"sources":["input.svelte"],"names":["foo"],"mappings":"AAAA,SAASA,GAAG,CAAC"}"#;
    let d = decode_map(&vlq_processed(m)).expect("VLQ map should decode");
    assert_eq!(d.sources, vec!["input.svelte".to_string()]);
    assert_eq!(d.names, vec!["foo".to_string()]);
    // First segment of the first line is the origin `[0, 0, 0, 0]`.
    assert_eq!(d.mappings[0][0], vec![0, 0, 0, 0]);
    // VLQ-decoded deltas accumulate across segments — every segment after the
    // first carries non-zero values.
    assert!(d.mappings[0].len() >= 2);
    assert!(d.mappings[0][1][0] > 0);
}

#[test]
fn decodes_multiline_vlq_map() {
    // Two lines: `AAAA;ACAA` → line 0: `[[0,0,0,0]]`; line 1 starts at col 0
    // but with relative source offsets carried over (so [0, 0, 1, 0]).
    let m = r#"{"version":3,"sources":["a.svelte"],"names":[],"mappings":"AAAA;ACAA"}"#;
    let d = decode_map(&vlq_processed(m)).expect("VLQ map should decode");
    assert_eq!(d.mappings.len(), 2);
    assert_eq!(d.mappings[0][0], vec![0, 0, 0, 0]);
    // Second line resets generated column to 0; source index advances by 1
    // (the `C` in `ACAA` = +1).
    assert_eq!(d.mappings[1][0][0], 0);
    assert_eq!(d.mappings[1][0][1], 1);
}

#[test]
fn already_decoded_form_still_works() {
    // The rsvelte-internal form (mappings already as a nested array) is still
    // accepted — the VLQ path is only a fallback.
    let m = r#"{"version":3,"sources":["x"],"names":[],"mappings":[[[0,0,0,0]]]}"#;
    let d = decode_map(&vlq_processed(m)).expect("array form should decode");
    assert_eq!(d.mappings[0][0], vec![0, 0, 0, 0]);
}

#[test]
fn empty_mappings_string_decodes_to_empty() {
    let m = r#"{"version":3,"sources":[],"names":[],"mappings":""}"#;
    let d = decode_map(&vlq_processed(m)).expect("empty VLQ map should decode");
    // Empty string still produces one (empty) line.
    assert_eq!(d.mappings, vec![vec![] as Vec<Vec<i64>>]);
}
