use super::*;

fn html_text(text: &str) -> Cow<'_, str> {
    decode(text, Place::Text, Rules::Html)
}

fn html_attribute(text: &str) -> Cow<'_, str> {
    decode(text, Place::Attribute, Rules::Html)
}

#[test]
fn rows_are_sorted_unique_and_within_the_name_limits() {
    assert!(NAMED.windows(2).all(|pair| pair[0].0 < pair[1].0));
    assert_eq!(NAMED.iter().map(|row| row.0.len()).max(), Some(NAME_BYTES));
    assert_eq!(
        NAMED
            .iter()
            .filter(|row| row.3)
            .map(|row| row.0.len())
            .max(),
        Some(LEGACY_NAME_BYTES)
    );
}

#[test]
fn the_table_comes_from_the_versions_the_oracle_installs() {
    let header = include_str!("../vendor/entities.rs")
        .lines()
        .next()
        .expect("a header");
    let package = include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../../../tools/oracle/package.json"
    ));
    for name in ["svelte", "@vue/compiler-sfc"] {
        let pinned = package
            .split(&format!("\"{name}\": \""))
            .nth(1)
            .and_then(|rest| rest.split('"').next())
            .expect("the oracle pins the package");
        assert!(
            header.contains(&format!("{name} {pinned}")),
            "{header}: the oracle installs {name} {pinned}; run `node tools/oracle/oracle.ts entities`"
        );
    }
}

#[test]
fn every_name_decodes_with_its_semicolon_and_legacy_ones_without() {
    for &(name, first, second, legacy) in NAMED {
        let first = char::from_u32(first).expect("a scalar").to_string();
        assert_eq!(decode_attribute(&format!("&{name};")), first, "{name}");
        let html = match char::from_u32(second) {
            Some(second) if second != '\0' => format!("{first}{second}"),
            _ => first.clone(),
        };
        assert_eq!(html_attribute(&format!("&{name};")), html, "{name}");
        if legacy {
            assert_eq!(decode_text(&format!("&{name}")), first, "{name}");
        }
    }
}

#[test]
fn a_name_matches_longest_first_and_needs_a_boundary_in_an_attribute() {
    assert_eq!(
        decode_text("&notit; &notin; &amp_ &amp= &lbrace; &lbrace &fjlig;"),
        "¬it; ∉ &_ &= { &lbrace f"
    );
    assert_eq!(
        decode_attribute("&notit; &amp_ &amp= &ampx &amp1 &lbrace; &amp"),
        "&notit; &amp_ &amp= &ampx &amp1 { &"
    );
    assert_eq!(decode_attribute("&amp-é &copy! &copy;x"), "&-é ©! ©x");
    assert_eq!(decode_text("&ampfoo; &copyx &AMP;"), "&foo; ©x &");
    // A semicolon decides before a shorter legacy name does.
    assert_eq!(decode_text("&notin;x &not;in"), "∉x ¬in");
}

#[test]
fn svelte_numbers_keep_zero_and_replace_what_is_outside_its_planes() {
    assert_eq!(
        decode_text("&#0; &#10; &#x80 &#xD800; &#x30000; &#xE0100; &#x81;"),
        "&#0;   € \0 \0 \u{e0100} \u{81}"
    );
    assert_eq!(
        decode_attribute("&#10; &#x0; &#00; &#999999999999999999999; &#x110000;"),
        "\n &#x0; &#00; \0 \0"
    );
    assert_eq!(
        decode_text("&#x; &#; &#65suffix &#X41; &#x4a;"),
        "&#x; &#; Asuffix A J"
    );
    // A name's code point is checked as a number's is.
    assert_eq!(decode_text("&NewLine;"), " ");
    assert_eq!(decode_attribute("&NewLine;"), "\n");
    // A number needs no boundary, even in an attribute.
    assert_eq!(decode_attribute("&#65= &#x41a"), "A= \u{41a}");
}

#[test]
fn html_numbers_replace_zero_surrogates_and_overflow() {
    // Each expected text is what @vue/compiler-sfc decodes the input to.
    assert_eq!(
        html_attribute("&#0; &#10; &#x80; &#x81; &#xD800; &#x110000; &#x30000; &#xFFFF;"),
        "\u{fffd} \n € \u{81} \u{fffd} \u{fffd} \u{30000} \u{ffff}"
    );
    assert_eq!(
        html_text("&#99999999999; &#65x &#x; &#;"),
        "\u{fffd} Ax &#x; &#;"
    );
}

#[test]
fn html_names_keep_their_second_code_point_and_let_an_underscore_through() {
    assert_eq!(html_text("&fjlig; &NotEqualTilde;"), "fj \u{2242}\u{338}");
    assert_eq!(
        html_attribute("&notit; &copy= &copyx &amp &ampx &copy_ &lbrace"),
        "&notit; &copy= &copyx & &ampx ©_ &lbrace"
    );
    assert_eq!(html_text("&notin &notit; &copy= &ampx"), "¬in ¬it; ©= &x");
}

#[test]
fn html_follows_the_spec_where_compiler_core_does_not() {
    // @vue/compiler-sfc 3.5.44 reads these as `¬invb ×b >ques9`.
    assert_eq!(
        html_attribute("&notinvb &timesb &gtques9"),
        "&notinvb &timesb &gtques9"
    );
    assert_eq!(html_text("&notinvb &timesb &gtques9"), "¬invb ×b >ques9");
}

#[test]
fn unchanged_text_stays_borrowed() {
    for text in ["plain text", "&unknown;", "&#0;", "&", "&&;", "&#x"] {
        assert!(matches!(decode_text(text), Cow::Borrowed(_)), "{text}");
    }
    assert_eq!(
        decode_text("&unknown; &lt; &unknown; &#0; &gt;"),
        "&unknown; < &unknown; &#0; >"
    );
    assert_eq!(decode_text("&&amp;&"), "&&&");
}
