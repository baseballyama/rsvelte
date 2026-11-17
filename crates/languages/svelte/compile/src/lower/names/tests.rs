use super::suffixed;

#[test]
fn suffixed_writes_the_number_after_an_underscore() {
    for n in [0, 1, 9, 10, 42, 100, 4_294_967_295] {
        assert_eq!(suffixed("text", n), format!("text_{n}"));
    }
}
