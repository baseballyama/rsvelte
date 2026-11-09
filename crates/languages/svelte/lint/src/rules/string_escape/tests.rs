use super::has_useful_escape;

#[test]
fn only_escapes_that_change_the_character_count() {
    for raw in ["\\n", "\\r", "\\u0041", "\\x41", "a\\", "\\\\\\t", "\\0"] {
        assert!(has_useful_escape(raw), "{raw}");
    }
    for raw in ["plain", "\\\\", "\\'", "\\\"", "\\`", "\\$", "\\\\n"] {
        assert!(!has_useful_escape(raw), "{raw}");
    }
}
