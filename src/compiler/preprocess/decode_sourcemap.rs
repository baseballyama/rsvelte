//! Source map decoding utilities for preprocessing.
//!
//! Corresponds to `decode_sourcemap.js` from the official Svelte compiler.

use super::types::{Processed, SimpleDecodedMap, SourceMapInput};

/// Decode a source map from a Processed result.
///
/// This handles:
/// - JSON string maps (parses and decodes VLQ mappings)
/// - Pre-decoded maps with string mappings (decodes VLQ)
/// - Already-decoded maps (returns as-is)
///
/// Corresponds to `decode_map` in decode_sourcemap.js.
pub fn decode_map(processed: &Processed) -> Option<SimpleDecodedMap> {
    let map_input = processed.map.as_ref()?;

    match map_input {
        SourceMapInput::Json(json_str) => {
            // Parse JSON string to our decoded format
            serde_json::from_str(json_str).ok()
        }
        SourceMapInput::Decoded(decoded) => Some(decoded.clone()),
    }
}

/// Decode a source map from various input formats.
///
/// This is a more general version that handles:
/// - JSON strings
/// - SimpleDecodedMap objects
pub fn decode_sourcemap_input(input: &SourceMapInput) -> Option<SimpleDecodedMap> {
    match input {
        SourceMapInput::Json(json_str) => serde_json::from_str(json_str).ok(),
        SourceMapInput::Decoded(decoded) => Some(decoded.clone()),
    }
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
