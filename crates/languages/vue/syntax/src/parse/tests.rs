use super::parse;

#[test]
fn the_script_lang_decides_how_the_template_reads() {
    let typescript = r#"<template>{{ 1 as number }}</template><script setup lang="ts"></script>"#;
    let component = parse(typescript).expect(typescript);
    assert!(component.typescript);
    let javascript = r#"<template>{{ 1 as number }}</template><script setup>'lang="ts"'</script>"#;
    let error = parse(javascript).expect_err(javascript);
    assert_eq!(error.code, "js_parse_error");
}
