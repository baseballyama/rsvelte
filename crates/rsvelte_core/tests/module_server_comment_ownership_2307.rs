//! Which comments survive a SERVER `.svelte.(js|ts)` compile.
//!
//! `server_module()` hands esrap the same builder-made, `loc`-less program the
//! client path does, so the same rule applies: the program's statement list
//! discards every pending comment and only a nested body that carries a
//! location re-finds its own. Expected strings are the official compiler's
//! output. The `@__PURE__` case is the reported symptom — esbuild's TS strip
//! puts that annotation on a default-parameter initializer, a program-level
//! position, and both compilers receive it.

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{GenerateMode, compile_module};

fn module(src: &str, dev: bool) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("m.svelte.js".to_string()),
            generate: GenerateMode::Server,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The generated banner is not a source comment, so strip the header line the
/// assertions are not about.
fn tail(src: &str) -> String {
    let out = module(src, false);
    out.lines().skip(1).collect::<Vec<_>>().join("\n")
}

#[test]
fn a_default_parameter_initializer_comment_is_dropped() {
    let src = "export function serializeValue(value, key, dateFormats = {}, \
               codecEncoders = /* @__PURE__ */ new Map()) {\n\treturn String(value);\n}\n";
    for dev in [false, true] {
        let out = module(src, dev);
        assert!(!out.contains("@__PURE__"), "dev={dev} survived:\n{out}");
        assert!(
            out.contains("codecEncoders = new Map()"),
            "dev={dev}\n{out}"
        );
    }
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

/// Negative control: the same predicate must keep every comment that upstream
/// keeps. A change that only removes annotations is as wrong as one that only
/// adds them.
#[test]
fn a_comment_inside_a_located_body_survives() {
    let cases = [
        "export function f() {\n\t/* inner */\n\treturn 1;\n}\n",
        "export const f = () => {\n\t/* inner */\n};\n",
        "export class C {\n\t/* inner */\n\tx = 1;\n}\n",
        "export function f() {\n\tif (x) {\n\t\t/* inner */\n\t\treturn 1;\n\t}\n}\n",
        "export function f() {\n\tconst m = /* inner */ new Map();\n\treturn m;\n}\n",
    ];
    for src in cases {
        let out = tail(src);
        assert!(out.contains("/* inner */"), "dropped in:\n{out}");
    }
}

/// A comment leading the *expression* body of an arrow has no statement list to
/// be re-found by, so it goes with the rest.
#[test]
fn an_arrow_expression_body_comment_is_dropped() {
    let out = tail("export const f = () => (/* c */ x);\n");
    assert_eq!(
        out.trim_end().lines().last(),
        Some("export const f = () => x;")
    );
}
