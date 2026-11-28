use super::*;

#[test]
fn names_the_types_and_nothing_else() {
    assert!(is_type("TSUnionType"));
    assert!(is_type("TSStringKeyword"));
    assert!(is_type("TSTypeReference"));
    assert!(!is_type("TSTypeAnnotation"));
    assert!(!is_type("TSTypeParameter"));
    assert!(!is_type("TSInterfaceBody"));
}
