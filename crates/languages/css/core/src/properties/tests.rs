use super::{is_known, longhands, vendor_prefix};

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
