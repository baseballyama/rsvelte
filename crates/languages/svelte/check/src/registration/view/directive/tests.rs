use super::{directive, leading_line_comments};

fn of(content: &str) -> Option<&'static str> {
    directive(leading_line_comments(content))
}

#[test]
fn reads_a_directive_in_the_opening_line_comments() {
    assert_eq!(
        of("\n\t// @ts-nocheck\n\timport a from 'a';"),
        Some("// @ts-nocheck\n")
    );
    assert_eq!(of("\n//@ts-check\nconst a = 1;"), Some("// @ts-check\n"));
    assert_eq!(of("// one\n// @ts-check"), Some("// @ts-check\n"));
    assert_eq!(of("/// @ts-check\n"), Some("// @ts-check\n"));
    assert_eq!(of("// @ts-check // @ts-nocheck\n"), Some("// @ts-check\n"));
}

#[test]
fn ignores_a_directive_after_code_or_in_a_block_comment() {
    assert_eq!(of("let a = 1;\n// @ts-nocheck\n"), None);
    assert_eq!(of("/* x */\n// @ts-nocheck\n"), None);
    assert_eq!(of("/* @ts-nocheck */\n"), None);
    assert_eq!(of("// @ts-checked\n"), None);
    assert_eq!(of("// x @ts-check\n"), None);
    assert_eq!(of("//\n@ts-check\n"), None);
}
