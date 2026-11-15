use super::guess_typescript;

#[test]
fn a_lang_of_ts_anywhere_is_the_guess() {
    assert!(guess_typescript(r#"<script lang="ts"></script>"#));
    assert!(guess_typescript("<script lang='ts'></script>"));
    assert!(guess_typescript("<script lang=ts></script>"));
    assert!(!guess_typescript(r#"<script lang="js"></script>"#));
    assert!(!guess_typescript("<script></script>"));
}
