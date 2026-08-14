//! Comment ownership in a client `.svelte.(js|ts)` compile.

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{GenerateMode, compile_module};

fn module(src: &str) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("m.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The generated banner is not a source comment, so strip the header lines the
/// assertions are not about.
fn tail(src: &str) -> String {
    let out = module(src);
    out.lines().skip(1).collect::<Vec<_>>().join("\n")
}

#[test]
fn a_top_level_comment_is_dropped() {
    for comment in ["/* hdr */", "/** @type {number} */", "// hdr"] {
        let out = tail(&format!("{comment}\nexport const a = 1;\n"));
        assert!(!out.contains("hdr"), "{comment} survived:\n{out}");
        assert!(!out.contains("@type"), "{comment} survived:\n{out}");
        assert!(out.contains("export const a = 1;"), "{out}");
    }
}

#[test]
fn a_comment_between_top_level_statements_is_dropped() {
    let out = tail("export const a = 1;\n/* mid */\nexport const b = 2;\n");
    assert!(!out.contains("mid"), "{out}");
}

#[test]
fn a_comment_inside_a_located_body_survives() {
    let cases = [
        "export function f() {\n\t/* inner */\n\treturn 1;\n}\n",
        "export const f = () => {\n\t/* inner */\n};\n",
        "export class C {\n\t/* inner */\n\tx = 1;\n}\n",
    ];
    for src in cases {
        let out = tail(src);
        assert!(out.contains("/* inner */"), "dropped in:\n{out}");
    }
}

#[test]
fn an_arrow_expression_body_comment_is_dropped() {
    let out = tail("export const f = () => (/* c */ x);\n");
    assert_eq!(
        out.trim_end().lines().last(),
        Some("export const f = () => x;")
    );
}

#[test]
fn a_line_comment_above_the_last_argument_survives() {
    let out = tail("export function f() {\n\tg((// c\n\t\ta));\n}\n");
    assert!(out.contains("g(\n\t\t// c\n\t\ta\n\t);"), "{out}");
}
