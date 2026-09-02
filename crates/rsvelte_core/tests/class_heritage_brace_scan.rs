//! `compileModule` locates a class body by scanning for the first `{` at
//! bracket depth 0 after the header, and a heritage clause can contain one of
//! its own. The scan counted a nested `class`'s body brace and nothing else, so
//! `class A extends function () {} { e = $state(5) }` treated the *function's*
//! body as the class body and the field was never privatised.
//!
//! A heritage is a `LeftHandSideExpression`, which bounds what can put a `{`
//! there: a class expression, a function expression in any of its four
//! spellings, or an object literal in primary position. Anything parenthesised
//! is already at depth > 0, and a template literal's braces are not code bytes.
//! The rows below are that enumeration, not the one shape that was reported.
//!
//! Every expected fragment was taken from the official Svelte compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`).

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{GenerateMode, compile_module};

/// The privatised field declaration official emits for `e = $state(5)`.
const PRIVATISED: &str = "#e = $.state(5);";

fn field_line(heritage: &str) -> String {
    let src = format!(
        "const mixin = (b) => b;\nclass Base {{ n = $state(0); }}\nconst ns = {{ Base }};\n\
         export class Sub extends {heritage} {{\n\te = $state(5);\n}}\n"
    );
    let js = compile_module(
        &src,
        ModuleCompileOptions {
            filename: Some("Test.svelte.js".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    js.lines()
        .find(|l| l.contains("= $.state(5)"))
        .unwrap_or_else(|| panic!("no `e` field in:\n{js}"))
        .trim()
        .to_string()
}

#[test]
fn a_function_expression_heritage_does_not_hide_the_class_body() {
    for heritage in [
        "function () {}",
        "function F() {}",
        "function* () {}",
        "async function () {}",
        "async function* () {}",
        // An unparenthesised IIFE: the same brace, followed by a call.
        "function () { return Base; }()",
    ] {
        assert_eq!(field_line(heritage), PRIVATISED, "heritage `{heritage}`");
    }
}

#[test]
fn an_object_literal_heritage_does_not_hide_the_class_body() {
    for heritage in ["{ }", "{ a: 1 }"] {
        assert_eq!(field_line(heritage), PRIVATISED, "heritage `{heritage}`");
    }
}

/// The rows that were already right. A class expression was the one brace
/// source the scan knew about, and everything parenthesised or inside a
/// template never reached depth 0 — if any of these move, the fix widened the
/// scan instead of closing it.
#[test]
fn the_heritage_shapes_that_already_worked_still_work() {
    for heritage in [
        "Base",
        "mixin(Base)",
        "ns.Base",
        "(0, Base)",
        "class { m() {} }",
        "class Inner { m() {} }",
        "class { m() { class Q {} } }",
        "mixin(class {}, function () {})",
        "(function () {})",
        "(class {})",
        "mixin({ x: 1 })",
        "({ B: Base }).B",
        "String.raw`${{ a: 1 }}`",
        "`${1}`",
    ] {
        assert_eq!(field_line(heritage), PRIVATISED, "heritage `{heritage}`");
    }
}
