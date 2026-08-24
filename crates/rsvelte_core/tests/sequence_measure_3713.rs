//! Regression test for #3713 — `Context::measure` disagreed with esrap's in two
//! directions at once, and the 60-column sequence wrap is decided by it.
//!
//! * esrap writes a nested sequence's inter-item space as a **string**, so its
//!   `measure` counts it; here it is a layout event `measure` subtracts, so a
//!   child that hides *k* spaces was measured *k* short.
//! * esrap measures a JS string, so a character costs its **UTF-16** length;
//!   the buffer here is a Rust `String`, so it cost its UTF-8 byte length.
//!
//! The two offsets point in opposite directions and partly cancelled: fixing
//! only the first took the UTF-16 cases from 2 diverging to 4. Both are
//! asserted here for that reason.
//!
//! No gate can see this class — every corpus comparison normalizes with oxfmt,
//! which reflows exactly these lines — so the expected verdicts below were
//! measured directly against the official compiler at Svelte 5.56.9.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

fn array_of(items: &[String]) -> String {
    format!(
        "<script>\n\tfunction f(a, b) {{ return a + b; }}\n\tconst data = [{}];\n</script>\n<p>{{data.length}}</p>\n",
        items.join(", ")
    )
}

fn wraps(items: &[String]) -> bool {
    client(&array_of(items)).contains("const data = [\n")
}

/// The exact counts where the two thresholds disagreed. One `n` per child kind
/// is the signature of a constant offset rather than a wrong rule: a divergence
/// appears only where an integer item count lands inside the window it opens.
#[test]
fn a_child_is_measured_with_the_spaces_it_wrote() {
    const CASES: [(&str, fn(usize) -> String, usize); 4] = [
        ("nested array", |i| format!("[{i}, 0]"), 8),
        ("nested object", |i| format!("{{ a: {i}, b: 0 }}"), 4),
        ("nested array of 3", |i| format!("[{i}, 0, 1]"), 6),
        ("two-argument call", |i| format!("f({i}, 0)"), 7),
    ];
    for (name, mk, n) in CASES {
        let items: Vec<String> = (0..n).map(mk).collect();
        assert!(
            wraps(&items),
            "{name} at n={n} must break across lines, as official does"
        );
    }
}

/// The negative control: a child with no inner space is measured identically
/// either way, so nothing about its wrap may move. The verdicts are official's.
#[test]
fn a_child_with_no_inner_space_is_unchanged() {
    for (n, official_wraps) in [(7, false), (8, false), (9, false), (20, true), (21, true)] {
        let items: Vec<String> = (0..n).map(|i| i.to_string()).collect();
        assert_eq!(wraps(&items), official_wraps, "plain numbers at n={n}");
    }
}

/// A character costs its UTF-16 length. Each case is paired with an ASCII twin
/// of the **same UTF-16 length** and a different byte length, so the two must
/// wrap identically at every count — which they cannot if the measure is bytes.
#[test]
fn a_character_costs_its_utf16_length() {
    const PAIRS: [(&str, &str, &str); 4] = [
        ("latin-1", "é", "x"),            // 2 bytes, 1 unit
        ("cjk", "漢", "x"),               // 3 bytes, 1 unit
        ("astral", "𝄞", "xx"),            // 4 bytes, 2 units
        ("emoji with VS16", "✈️", "xxx"), // 6 bytes, 3 units
    ];
    for (name, wide_ch, twin) in PAIRS {
        for n in 2..=20 {
            let wide: Vec<String> = (0..n)
                .map(|i| format!("{{ c: \"{wide_ch}\", k: {i} }}"))
                .collect();
            let narrow: Vec<String> = (0..n)
                .map(|i| format!("{{ c: \"{twin}\", k: {i} }}"))
                .collect();
            assert_eq!(
                wraps(&wide),
                wraps(&narrow),
                "{name} at n={n} wrapped differently from its equal-UTF-16-width ASCII twin"
            );
        }
    }
}
