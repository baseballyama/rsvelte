use super::*;

#[test]
fn named_references_follow_the_longest_match_and_attribute_boundary() {
    assert_eq!(
        decode_text("&notit; &amp_ &amp= &lbrace; &fjlig;"),
        "¬it; &_ &= { f"
    );
    assert_eq!(
        decode_attribute("&notit; &amp_ &amp= &lbrace;"),
        "&notit; &amp_ &amp= {"
    );
    assert_eq!(decode_attribute("&amp-é &copy!"), "&-é ©!");
    assert!(
        ENTITIES
            .iter()
            .all(|(name, _)| name.len() <= MAX_NAME_BYTES)
    );
    for (name, code) in &ENTITIES {
        assert_eq!(
            decode_text(&format!("&{name}")),
            char::from_u32(validate(*code, false))
                .expect("valid entity scalar")
                .to_string()
        );
    }
}

#[test]
fn numeric_references_preserve_zero_and_validate_other_codes() {
    assert_eq!(
        decode_text("&#0; &#10; &#x80 &#xD800; &#x30000; &#xE0100;"),
        "&#0;   € \0 \0 \u{e0100}"
    );
    assert_eq!(
        decode_attribute("&#10; &#x0; &#999999999999999999999;"),
        "\n &#x0; \0"
    );
    assert_eq!(decode_text("&#x; &#; &#65suffix"), "&#x; &#; Asuffix");
}

#[test]
fn unchanged_text_stays_borrowed() {
    for text in ["plain text", "&unknown;", "&#0;", "&"] {
        assert!(matches!(decode_text(text), Cow::Borrowed(_)));
    }
    assert_eq!(
        decode_text("&unknown; &lt; &unknown; &#0; &gt;"),
        "&unknown; < &unknown; &#0; >"
    );
}
