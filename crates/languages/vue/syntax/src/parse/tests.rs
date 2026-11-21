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

#[test]
fn an_attribute_name_may_hold_non_ascii_characters() {
    let source_text = r#"<template><p ä="1" data-ö/></template>"#;
    let component = parse(source_text).expect(source_text);
    let names: Vec<&str> = component
        .attributes
        .iter()
        .map(|a| a.name.text(source_text))
        .collect();
    assert_eq!(names, ["ä", "data-ö"]);
}
