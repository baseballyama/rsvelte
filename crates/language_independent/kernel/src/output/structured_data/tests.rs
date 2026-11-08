use super::*;

/// The definition the run-copying [`write_str`] replaced.
fn by_char(s: &str) -> String {
    use std::fmt::Write;
    let mut out = String::from('"');
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => _ = write!(out, "\\u{:04x}", c as u32),
            c => out.push(c),
        }
    }
    out.push('"');
    out
}

#[test]
fn strings_are_escaped_as_one_character_at_a_time() {
    let mut cases: Vec<String> = (0u8..0x80).map(|b| char::from(b).to_string()).collect();
    cases.extend(
        [
            "",
            "plain",
            "a\"b\\c\nd",
            "é\u{1}日本\u{1F600}\t",
            "\u{7f}\u{80}\u{1f}x",
        ]
        .map(String::from),
    );
    let all: String = cases.concat();
    cases.push(all);
    for s in &cases {
        let mut out = String::new();
        write_string(&mut out, s);
        assert_eq!(out, by_char(s), "{s:?}");
    }
}

#[test]
fn a_fraction_json_cannot_hold_is_null() {
    let mut w = StructuredDataWriter::new(false);
    w.begin_array()
        .fixed(1.0 / 3.0, 3)
        .fixed(f64::NAN, 3)
        .fixed(f64::INFINITY, 1)
        .write_number(7u32)
        .end_array();
    assert_eq!(w.finish(), "[0.333,null,null,7]");
}

#[test]
fn nested_values_and_keys() {
    let mut w = StructuredDataWriter::new(false);
    w.begin_object()
        .key("a")
        .write_number(1)
        .key("b")
        .begin_array()
        .write_string("x\n")
        .null()
        .end_array()
        .key("c")
        .begin_object()
        .end_object()
        .end_object();
    assert_eq!(w.finish(), r#"{"a":1,"b":["x\n",null],"c":{}}"#);
    let mut w = StructuredDataWriter::new(true);
    w.begin_array()
        .begin_object()
        .key("k")
        .write_boolean(true)
        .end_object()
        .end_array();
    assert_eq!(w.finish(), "[\n\t{\n\t\t\"k\": true\n\t}\n]\n");
}

#[test]
fn deep_nesting_is_supported() {
    let mut w = StructuredDataWriter::new(false);
    for _ in 0..100 {
        w.begin_array();
    }
    w.null();
    for _ in 0..100 {
        w.end_array();
    }
    let out = w.finish();
    assert_eq!(out.len(), 204);
    assert!(out.starts_with(&"[".repeat(100)));
    assert!(out.ends_with(&"]".repeat(100)));
}
