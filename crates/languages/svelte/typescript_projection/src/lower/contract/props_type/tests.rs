use super::{mentions_type, object_type_tag};

#[test]
fn a_comment_mentions_type_where_svelte2tsx_s_pattern_finds_it() {
    assert!(mentions_type("/** @type {X} */"));
    assert!(mentions_type("// @type"));
    assert!(!mentions_type("/** @typedef {X} Y */"));
    assert!(mentions_type("/** @typedef {X} Y @type {X} */"));
}

#[test]
fn only_a_one_line_object_type_is_renamed() {
    assert_eq!(object_type_tag("/** @type {{ n: number }} */"), Some(4));
    assert_eq!(object_type_tag("/** @type { { n: number } } */"), Some(4));
    assert_eq!(object_type_tag("/** @type {Props} */"), None);
    assert_eq!(object_type_tag("/* @type {{ n: number }} */"), None);
    assert_eq!(
        object_type_tag("/** @param {number} x @type {{ n: number }} */"),
        None
    );
    assert_eq!(
        object_type_tag("/**\n * @type {{\n *   n: number\n * }}\n */"),
        None
    );
    assert_eq!(object_type_tag("/** @type {{ n: number }}\n */"), Some(4));
}
