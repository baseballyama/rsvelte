use super::{JsString, Run};

#[test]
fn a_pair_split_across_appends_is_one_character() {
    let mut string = JsString::from_utf16([0xD83D]);
    assert_eq!(string.as_str(), None);
    string.push_js(&JsString::from_utf16([0xDE00]));
    assert_eq!(string.as_str(), Some("😀"));
    assert_eq!(string, JsString::from("😀"));
}

#[test]
fn a_lone_surrogate_keeps_its_place_between_text() {
    let string = JsString::from_utf16(
        "a\u{0}b"
            .encode_utf16()
            .map(|u| if u == 0 { 0xD800 } else { u }),
    );
    let runs: Vec<_> = string.runs().collect();
    assert_eq!(
        runs,
        [Run::Text("a"), Run::Surrogate(0xD800), Run::Text("b")]
    );
    assert_eq!(
        string.encode_utf16().collect::<Vec<_>>(),
        [0x61, 0xD800, 0x62]
    );
    assert_eq!(string.to_string_lossy(), "a\u{FFFD}b");
    let upper = string.map_text(|text| text.to_uppercase().into());
    assert_eq!(
        upper.encode_utf16().collect::<Vec<_>>(),
        [0x41, 0xD800, 0x42]
    );
}

#[test]
fn strings_order_by_code_unit() {
    // U+1F600 is above U+FF61 by code point and below it by code unit.
    let surrogate = JsString::from_utf16([0xD800]);
    let (halfwidth, emoji) = (JsString::from("\u{FF61}"), JsString::from("😀"));
    assert!(halfwidth > surrogate);
    assert!(emoji < halfwidth);
}

#[test]
fn a_trimmed_start_stops_at_a_lone_surrogate() {
    let string = JsString::from_utf16([0x20, 0x20, 0xD800, 0x20, 0x61]);
    let trimmed = string.trim_start_matches(char::is_whitespace);
    assert_eq!(
        trimmed.encode_utf16().collect::<Vec<_>>(),
        [0xD800, 0x20, 0x61]
    );
    assert_eq!(trimmed.runs().next(), Some(Run::Surrogate(0xD800)));
}
