use super::is_void;

#[test]
fn void_elements_match_case_sensitively() {
    assert!(is_void("br"));
    assert!(is_void("wbr"));
    assert!(!is_void("BR"));
    assert!(!is_void("keygen"));
    assert!(!is_void("div"));
}
