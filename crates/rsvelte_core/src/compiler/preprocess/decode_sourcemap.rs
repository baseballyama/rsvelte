//! Source map decoding utilities for preprocessing.
//!
//! Corresponds to `decode_sourcemap.js` from the official Svelte compiler.

use super::types::{Processed, SimpleDecodedMap, SourceMapInput};

/// Decode a source map from a Processed result.
///
/// This handles:
/// - JSON string maps with VLQ-encoded `mappings` (standard Source Map v3,
///   e.g. anything produced by typical preprocessors)
/// - JSON string maps with already-decoded `mappings: [[[...]]]`
///   (rsvelte-internal pre-decoded form)
/// - Already-decoded maps (returns as-is)
///
/// Corresponds to `decode_map` in decode_sourcemap.js.
pub fn decode_map(processed: &Processed) -> Option<SimpleDecodedMap> {
    let map_input = processed.map.as_ref()?;

    match map_input {
        SourceMapInput::Json(json_str) => {
            // Try the rsvelte-internal pre-decoded form first.
            if let Ok(decoded) = serde_json::from_str::<SimpleDecodedMap>(json_str) {
                return Some(decoded);
            }
            // Fall back to the standard Source Map v3 spec, where `mappings` is
            // a base64-VLQ-encoded string. Previously this branch silently
            // returned `None`, so every standard preprocessor map was dropped
            // (issue #451, H-012).
            decode_vlq_sourcemap_json(json_str)
        }
        SourceMapInput::Decoded(decoded) => Some(decoded.clone()),
    }
}

/// Parse a standard Source Map v3 JSON document whose `mappings` field is a
/// base64-VLQ-encoded string, decoding it into the array form
/// `SimpleDecodedMap` uses.
fn decode_vlq_sourcemap_json(json_str: &str) -> Option<SimpleDecodedMap> {
    #[derive(serde::Deserialize)]
    struct RawMap {
        version: Option<u32>,
        file: Option<String>,
        #[serde(default)]
        sources: Vec<Option<String>>,
        #[serde(rename = "sourcesContent", default)]
        sources_content: Option<Vec<Option<String>>>,
        #[serde(default)]
        names: Vec<String>,
        mappings: String,
        #[serde(rename = "sourceRoot")]
        source_root: Option<String>,
    }
    let raw: RawMap = serde_json::from_str(json_str).ok()?;
    Some(SimpleDecodedMap {
        version: raw.version,
        file: raw.file,
        sources: raw
            .sources
            .into_iter()
            .map(|s| s.unwrap_or_default())
            .collect(),
        sources_content: raw.sources_content,
        names: raw.names,
        mappings: decode_vlq_mappings(&raw.mappings),
        source_root: raw.source_root,
    })
}

/// Decode a Source Map v3 `mappings` field — `;`-separated lines, each a
/// `,`-separated list of VLQ-encoded segments (relative to the running
/// `[generatedCol, sourceIdx, sourceLine, sourceCol, nameIdx]` state).
fn decode_vlq_mappings(s: &str) -> Vec<Vec<Vec<i64>>> {
    let mut lines: Vec<Vec<Vec<i64>>> = Vec::new();
    // Running state across segments: generated column resets each line; the
    // other four fields persist across lines.
    let mut last = [0i64; 5];
    for line_str in s.split(';') {
        let mut segments: Vec<Vec<i64>> = Vec::new();
        last[0] = 0;
        for seg_str in line_str.split(',') {
            if seg_str.is_empty() {
                continue;
            }
            let deltas = match decode_vlq_segment(seg_str) {
                Some(d) => d,
                None => continue,
            };
            let mut segment = Vec::with_capacity(deltas.len());
            for (i, d) in deltas.into_iter().enumerate().take(5) {
                last[i] = last[i].wrapping_add(d);
                segment.push(last[i]);
            }
            segments.push(segment);
        }
        lines.push(segments);
    }
    lines
}

/// Decode one VLQ-encoded segment (a base64 string) into its integer deltas.
fn decode_vlq_segment(s: &str) -> Option<Vec<i64>> {
    const B64: [i8; 128] = {
        let mut t = [-1i8; 128];
        let abc = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let mut i = 0;
        while i < abc.len() {
            t[abc[i] as usize] = i as i8;
            i += 1;
        }
        t
    };
    let bytes = s.as_bytes();
    let mut out = Vec::new();
    let mut i = 0;
    while i < bytes.len() {
        let mut value: i64 = 0;
        let mut shift = 0u32;
        loop {
            if i >= bytes.len() {
                return None;
            }
            let b = bytes[i];
            i += 1;
            if b >= 128 {
                return None;
            }
            let digit = B64[b as usize];
            if digit < 0 {
                return None;
            }
            let digit = digit as i64;
            // A well-formed VLQ value fits in 32 bits (7 base-64 groups reach
            // shift 30); anything past that is malformed. Bail before the shift
            // rather than let `<< shift` overflow-panic in debug builds.
            if shift >= 32 {
                return None;
            }
            value |= (digit & 31) << shift;
            shift += 5;
            if digit & 32 == 0 {
                break;
            }
        }
        let neg = (value & 1) != 0;
        let mag = value >> 1;
        out.push(if neg { -mag } else { mag });
    }
    Some(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_decode_map_from_json() {
        // Note: mappings must be in decoded format (Vec<Vec<Vec<i64>>>),
        // not VLQ-encoded string, since SimpleDecodedMap expects decoded data
        let json_map = r#"{
            "version": 3,
            "sources": ["input.svelte"],
            "names": [],
            "mappings": [[[0, 0, 0, 0]]]
        }"#;

        let processed = Processed {
            code: "test".to_string(),
            map: Some(SourceMapInput::Json(json_map.to_string())),
            dependencies: vec![],
            attributes: None,
        };

        let decoded = decode_map(&processed);
        assert!(decoded.is_some());
        let decoded = decoded.unwrap();
        assert_eq!(decoded.version, Some(3));
        assert_eq!(decoded.sources.len(), 1);
    }

    #[test]
    fn test_decode_map_from_vlq_string_json() {
        // Standard Source Map v3: `mappings` is a base64-VLQ string. The first
        // segment "AAAA" decodes to [0, 0, 0, 0].
        let json_map = r#"{
            "version": 3,
            "sources": ["input.svelte"],
            "names": [],
            "mappings": "AAAA"
        }"#;

        let processed = Processed {
            code: "test".to_string(),
            map: Some(SourceMapInput::Json(json_map.to_string())),
            dependencies: vec![],
            attributes: None,
        };

        let decoded = decode_map(&processed).expect("VLQ string map should decode");
        assert_eq!(decoded.version, Some(3));
        assert_eq!(decoded.sources, vec!["input.svelte".to_string()]);
        assert_eq!(decoded.mappings, vec![vec![vec![0, 0, 0, 0]]]);
    }

    #[test]
    fn test_decode_vlq_segment_overlong_returns_none() {
        // A run of continuation bytes (all high-bit set) would push `shift`
        // past 32 and overflow-panic the `<< shift` in debug builds. The guard
        // must bail with `None` instead. 'g' = 32 (continuation bit only).
        let malicious = "gggggggggggggggggggg";
        assert!(decode_vlq_segment(malicious).is_none());
    }

    #[test]
    fn test_decode_map_none() {
        let processed = Processed {
            code: "test".to_string(),
            map: None,
            dependencies: vec![],
            attributes: None,
        };

        let decoded = decode_map(&processed);
        assert!(decoded.is_none());
    }
}
