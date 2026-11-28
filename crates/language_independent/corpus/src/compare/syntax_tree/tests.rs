use super::*;

#[test]
fn sorts_keys_at_every_depth_and_keeps_the_order_of_arrays() {
    assert_eq!(
        canonical(r#"{"b":1,"a":[{"d":2,"c":3},"x"],"e":{"g":null,"f":true}}"#).unwrap(),
        r#"{"a":[{"c":3,"d":2},"x"],"b":1,"e":{"f":true,"g":null}}"#,
    );
}

#[test]
fn writes_strings_as_json_stringify_does() {
    assert_eq!(
        canonical(r#""é\/\u0001\ud800""#).unwrap(),
        "\"é/\\u0001\\ud800\""
    );
}

#[test]
fn sorts_keys_by_utf16_code_units() {
    // U+FF61 sorts before U+1F600 in UTF-16, after it in UTF-8.
    assert_eq!(
        canonical("{\"\u{1F600}\":1,\"\u{FF61}\":2}").unwrap(),
        "{\"\u{1F600}\":1,\"\u{FF61}\":2}",
    );
}

#[test]
fn hashes_the_canonical_text() {
    // The sha256 of `{"a":1}`.
    let hash = "015abd7f5cc57a2dd94b7590f04ad8084273905ee33ec5cebeae62276a97f862";
    assert_eq!(same_hash(hash, "{ \"a\" : 1 }"), Ok(true));
    assert_eq!(same_hash(hash, "{\"a\":2}"), Ok(false));
}
