use super::{is_known, longhands, names_keyframes, vendor_prefix, without_browser_prefix};

#[test]
fn known_properties_come_from_the_vendored_list() {
    assert!(is_known("color"));
    assert!(is_known("-webkit-transform"));
    assert!(!is_known("colour"));
}

#[test]
fn a_vendor_prefix_is_a_dash_a_word_and_a_dash() {
    assert_eq!(vendor_prefix("-webkit-transform"), "-webkit-");
    assert_eq!(vendor_prefix("--custom"), "");
    assert_eq!(vendor_prefix("color"), "");
    assert_eq!(vendor_prefix("-moz"), "");
}

#[test]
fn shorthands_list_their_longhands() {
    assert!(longhands("margin").contains(&"margin-top"));
    assert_eq!(longhands("color").len(), 0);
}

// Svelte 5 lowercases the property as JavaScript does, then removes the browser prefix.
#[test]
fn an_animation_property_names_keyframes() {
    for property in [
        "animation",
        "ANIMATION-NAME",
        "-ms-animation",
        "-WEBKIT-ANIMATION",
        "-WEB\u{212a}IT-ANIMATION",
    ] {
        assert!(names_keyframes(property), "{property}");
    }
    for property in ["-khtml-animation", "animation-duration"] {
        assert!(!names_keyframes(property), "{property}");
    }
}

#[test]
fn a_browser_prefix_is_removed_as_written() {
    assert_eq!(without_browser_prefix("-ms-keyframes"), "keyframes");
    assert_eq!(
        without_browser_prefix("-WEBKIT-keyframes"),
        "-WEBKIT-keyframes"
    );
    assert_eq!(
        without_browser_prefix("-khtml-keyframes"),
        "-khtml-keyframes"
    );
}
