//! SSR anchors a declaration keyword as `kind + ' '`.
//!
//! Upstream's esrap writes the keyword fragment `let ` and brackets it with
//! `location(line, column)` / `location(line, column + 4)`. rsvelte's server map
//! is built by a separate token scan, which anchored the three-character token
//! instead — a second port of one upstream decision, disagreeing with the first.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

// The declaration is split across two source lines so the verbatim-line pass
// cannot map it: what remains is the token scan this test is about.
const SRC: &str = "<script>\n\tlet\n\t\tvalue = 1;\n</script>\n<p>{value}</p>\n";

/// Decode `mappings` into `(gen_line, gen_col, src_line, src_col)` quadruples.
fn decode(mappings: &str) -> Vec<(i64, i64, i64, i64)> {
    let mut out = Vec::new();
    let mut state = [0i64; 4];
    for (gen_line, line) in mappings.split(';').enumerate() {
        state[0] = 0;
        for field in line.split(',').filter(|f| !f.is_empty()) {
            let mut values = Vec::new();
            let (mut value, mut shift) = (0i64, 0u32);
            for c in field.bytes() {
                let digit = match c {
                    b'A'..=b'Z' => i64::from(c - b'A'),
                    b'a'..=b'z' => i64::from(c - b'a') + 26,
                    b'0'..=b'9' => i64::from(c - b'0') + 52,
                    b'+' => 62,
                    b'/' => 63,
                    _ => panic!("bad VLQ digit {c:?}"),
                };
                value += (digit & 31) << shift;
                if digit & 32 == 0 {
                    let negative = value & 1 == 1;
                    value >>= 1;
                    values.push(if negative { -value } else { value });
                    (value, shift) = (0, 0);
                } else {
                    shift += 5;
                }
            }
            for (i, v) in values.iter().take(4).enumerate() {
                state[i] += v;
            }
            if values.len() >= 4 {
                out.push((gen_line as i64, state[0], state[2], state[3]));
            }
        }
    }
    out
}

#[test]
fn the_server_let_keyword_end_anchor_counts_its_separator() {
    let result = compile(
        SRC,
        CompileOptions {
            filename: Some("Probe.svelte".to_string()),
            generate: GenerateMode::Server,
            ..Default::default()
        },
    )
    .expect("compiles");
    let map: serde_json::Value =
        serde_json::from_str(result.js.map.as_deref().expect("js map")).expect("js map is JSON");
    let segments = decode(map["mappings"].as_str().expect("mappings string"));

    // `let` sits at source line 1, column 1; upstream's anchors are columns 1
    // and 1 + "let ".len().
    assert!(
        segments.iter().any(|&(_, _, l, c)| (l, c) == (1, 1)),
        "no anchor at the start of `let`: {segments:?}"
    );
    assert!(
        segments.iter().any(|&(_, _, l, c)| (l, c) == (1, 5)),
        "no anchor at the end of `let `: {segments:?}"
    );
    assert!(
        !segments.iter().any(|&(_, _, l, c)| (l, c) == (1, 4)),
        "the keyword was anchored without its separator: {segments:?}"
    );
}
