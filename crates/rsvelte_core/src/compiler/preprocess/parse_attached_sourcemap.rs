//! Consume a `sourceMappingURL` comment that a preprocessor attached to its
//! output instead of returning `processed.map`.
//!
//! Corresponds to `parse_attached_sourcemap` in `utils/mapped_code.js`.

use std::sync::LazyLock;

use regex::Regex;

use super::types::{Processed, SourceMapInput};

const URL_PATTERN: &str = r"[#@]\s*sourceMappingURL\s*=\s*(\S*)";

static SCRIPT_COMMENT: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(&format!(r"(?://{URL_PATTERN})|(?:/\*{URL_PATTERN}\s*\*/)$")).unwrap()
});

static STYLE_COMMENT: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(&format!(r"/\*{URL_PATTERN}\s*\*/$")).unwrap());

static DATA_URI: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"data:(?:application|text)/json;(?:charset[:=]\S+?;)?base64,(\S*)").unwrap()
});

/// Strip an attached `sourceMappingURL` comment from `processed.code`, adopting
/// its map when the URL is a `data:` URI.
pub(super) fn parse_attached_sourcemap(processed: &mut Processed, tag_name: &str) {
    let regex: &Regex = if tag_name == "script" {
        &SCRIPT_COMMENT
    } else {
        &STYLE_COMMENT
    };

    let Some(captures) = regex.captures(&processed.code) else {
        return;
    };

    let matched = captures.get(0).expect("match 0 always exists");
    let (start, end) = (matched.start(), matched.end());
    let map_url = captures
        .get(1)
        .or_else(|| captures.get(2))
        .map(|m| m.as_str().to_string())
        .unwrap_or_default();

    let map_data = DATA_URI
        .captures(&map_url)
        .and_then(|c| c.get(1).map(|m| m.as_str().to_string()));

    match map_data {
        Some(data) => {
            if processed.map.is_some() {
                log_warning(
                    &processed.code,
                    "Not implemented. Found sourcemap in both processed.code and processed.map. \
                     Please update your preprocessor to return only one sourcemap.",
                );
            } else if let Some(decoded) = decode_base64_utf8(&data) {
                processed.map = Some(SourceMapInput::Json(decoded));
            }
        }
        None => {
            if processed.map.is_none() {
                log_warning(
                    &processed.code,
                    &format!(
                        "Found sourcemap path {map_url:?} in processed.code, but no sourcemap data. \
                         Please update your preprocessor to return sourcemap data directly."
                    ),
                );
            }
        }
    }

    processed.code.replace_range(start..end, "");
}

fn log_warning(code: &str, message: &str) {
    // code_start: help to find the preprocessor responsible
    let code_start = if code.len() < 100 {
        code.to_string()
    } else {
        let cut = (0..=100).rev().find(|&i| code.is_char_boundary(i)).unwrap();
        format!("{} [...]", &code[..cut])
    };
    eprintln!(
        "warning: {message}. processed.code = {}",
        serde_json::to_string(&code_start).unwrap_or_else(|_| format!("{code_start:?}"))
    );
}

/// Decode a standard base64 payload into a UTF-8 string.
fn decode_base64_utf8(input: &str) -> Option<String> {
    const B64: [i8; 128] = {
        let mut table = [-1i8; 128];
        let alphabet = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let mut i = 0;
        while i < alphabet.len() {
            table[alphabet[i] as usize] = i as i8;
            i += 1;
        }
        table
    };

    let mut bytes = Vec::with_capacity(input.len() / 4 * 3);
    let mut accumulator: u32 = 0;
    let mut bits = 0u32;
    for byte in input.bytes() {
        if byte == b'=' {
            break;
        }
        if byte >= 128 {
            return None;
        }
        let digit = B64[byte as usize];
        if digit < 0 {
            return None;
        }
        accumulator = (accumulator << 6) | digit as u32;
        bits += 6;
        if bits >= 8 {
            bits -= 8;
            bytes.push((accumulator >> bits) as u8);
        }
    }
    String::from_utf8(bytes).ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    const MAP_JSON: &str = r#"{"version":3,"sources":["a.svelte"],"names":[],"mappings":"AAAA"}"#;

    fn data_uri() -> String {
        // Base64 of MAP_JSON, produced by the encoder under test's inverse.
        let mut encoded = String::new();
        let bytes = MAP_JSON.as_bytes();
        const ALPHABET: &[u8; 64] =
            b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        for chunk in bytes.chunks(3) {
            let b = [
                chunk[0],
                *chunk.get(1).unwrap_or(&0),
                *chunk.get(2).unwrap_or(&0),
            ];
            let n = (u32::from(b[0]) << 16) | (u32::from(b[1]) << 8) | u32::from(b[2]);
            encoded.push(ALPHABET[(n >> 18) as usize & 63] as char);
            encoded.push(ALPHABET[(n >> 12) as usize & 63] as char);
            encoded.push(if chunk.len() > 1 {
                ALPHABET[(n >> 6) as usize & 63] as char
            } else {
                '='
            });
            encoded.push(if chunk.len() > 2 {
                ALPHABET[n as usize & 63] as char
            } else {
                '='
            });
        }
        format!("data:application/json;charset=utf-8;base64,{encoded}")
    }

    fn processed(code: String) -> Processed {
        Processed {
            code,
            map: None,
            dependencies: vec![],
            attributes: None,
        }
    }

    #[test]
    fn script_line_comment_is_consumed() {
        let mut p = processed(format!("const a = 1;\n//# sourceMappingURL={}", data_uri()));
        parse_attached_sourcemap(&mut p, "script");
        assert_eq!(p.code, "const a = 1;\n");
        match p.map {
            Some(SourceMapInput::Json(json)) => assert_eq!(json, MAP_JSON),
            other => panic!("expected the attached map to be adopted, got {other:?}"),
        }
    }

    #[test]
    fn script_block_comment_is_consumed() {
        let mut p = processed(format!(
            "const a = 1;\n/*# sourceMappingURL={} */",
            data_uri()
        ));
        parse_attached_sourcemap(&mut p, "script");
        assert_eq!(p.code, "const a = 1;\n");
        assert!(p.map.is_some());
    }

    #[test]
    fn style_block_comment_is_consumed() {
        let mut p = processed(format!(
            "a {{ color: red }}\n/*# sourceMappingURL={} */",
            data_uri()
        ));
        parse_attached_sourcemap(&mut p, "style");
        assert_eq!(p.code, "a { color: red }\n");
        assert!(p.map.is_some());
    }

    #[test]
    fn a_line_comment_is_not_consumed_for_style() {
        let code = format!("a {{ color: red }}\n//# sourceMappingURL={}", data_uri());
        let mut p = processed(code.clone());
        parse_attached_sourcemap(&mut p, "style");
        assert_eq!(p.code, code);
        assert!(p.map.is_none());
    }

    #[test]
    fn a_url_form_map_is_stripped_without_a_map() {
        let mut p = processed("const a = 1;\n//# sourceMappingURL=out.js.map".to_string());
        parse_attached_sourcemap(&mut p, "script");
        assert_eq!(p.code, "const a = 1;\n");
        assert!(p.map.is_none());
    }

    #[test]
    fn a_returned_map_wins_over_an_attached_one() {
        let mut p = processed(format!("const a = 1;\n//# sourceMappingURL={}", data_uri()));
        p.map = Some(SourceMapInput::Json("{\"kept\":true}".to_string()));
        parse_attached_sourcemap(&mut p, "script");
        assert_eq!(p.code, "const a = 1;\n");
        match p.map {
            Some(SourceMapInput::Json(json)) => assert_eq!(json, "{\"kept\":true}"),
            other => panic!("expected the returned map to be kept, got {other:?}"),
        }
    }

    #[test]
    fn code_without_a_comment_is_untouched() {
        let mut p = processed("const a = 1;".to_string());
        parse_attached_sourcemap(&mut p, "script");
        assert_eq!(p.code, "const a = 1;");
        assert!(p.map.is_none());
    }
}
