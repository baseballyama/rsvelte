//! `await` / `yield` in a function's formal parameters is a `js_parse_error`
//! upstream (acorn's `checkYieldAwaitInDefaultParams`); OXC has no such rule,
//! so rsvelte compiled every shape below and shipped a file the official
//! compiler refuses (issue #2547).
//!
//! The legal cases are the other half: the same keyword, lexically inside the
//! parameter list, belonging to a function of its own.

use rsvelte_core::{
    CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module, compiler::CssMode,
};

fn component_error(src: &str) -> Option<String> {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .err()
    .map(|e| format!("{e:?}"))
}

fn module_error(src: &str) -> Option<String> {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("m.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .err()
    .map(|e| format!("{e:?}"))
}

const PREAMBLE: &str = "\tfunction load() {}\n\tlet awaitable = 1;\n";

fn in_instance_script(statement: &str) -> String {
    format!("<script>\n{PREAMBLE}\t{statement}\n</script>\n\n<p>ok</p>\n")
}

fn assert_rejected(err: Option<String>, needle: &str, what: &str) {
    let err = err.unwrap_or_else(|| panic!("{what} must not compile"));
    assert!(
        err.contains("js_parse_error"),
        "expected js_parse_error for {what}, got: {err}"
    );
    assert!(
        err.contains(needle),
        "expected upstream's message for {what}, got: {err}"
    );
}

const AWAIT_MESSAGE: &str = "Await expression cannot be a default value";
const YIELD_MESSAGE: &str = "Yield expression cannot be a default value";

/// Every function form has its own parameter-parsing path upstream, and a
/// check written for one of them does not see the others.
#[test]
fn await_in_a_parameter_default_is_rejected_in_every_function_form() {
    for statement in [
        "const f = async (p = await load()) => p;",
        "const f = (p = await load()) => p;",
        "async function f(p = await load()) { return p; }",
        "const f = async function (p = await load()) { return p; };",
        "const o = { async m(p = await load()) { return p; } };",
        "class C { async m(p = await load()) { return p; } }",
        "const o = { async *m(p = await load()) { return p; } };",
    ] {
        assert_rejected(
            component_error(&in_instance_script(statement)),
            AWAIT_MESSAGE,
            statement,
        );
    }
}

#[test]
fn yield_in_a_parameter_default_is_rejected_in_every_generator_form() {
    for statement in [
        "function* g(p = yield 1) { return p; }",
        "const o = { *g(p = yield 1) { return p; } };",
        "const g = function* (p = yield 1) { return p; };",
        "const o = { async *g(p = yield 1) { return p; } };",
    ] {
        assert_rejected(
            component_error(&in_instance_script(statement)),
            YIELD_MESSAGE,
            statement,
        );
    }
}

/// The offending keyword does not have to sit in the first parameter, or
/// directly under it.
#[test]
fn await_is_rejected_wherever_it_sits_in_the_parameter_list() {
    for statement in [
        "const f = async ({ p = await load() } = {}) => p;",
        "const f = async ([p = await load()] = []) => p;",
        "const f = async (a, p = await load()) => p;",
        "const f = async (p = ((q = await load()) => q)) => p;",
    ] {
        assert_rejected(
            component_error(&in_instance_script(statement)),
            AWAIT_MESSAGE,
            statement,
        );
    }
}

/// `.svelte.js` is a different compiler entry point, and the one the issue was
/// filed against.
#[test]
fn the_module_entry_point_rejects_it_too() {
    assert_rejected(
        module_error("export const f = async (p = /* c */ await load()) => p;"),
        AWAIT_MESSAGE,
        "module await default",
    );
    assert_rejected(
        module_error("export function* g(p = yield 1) { return p; }"),
        YIELD_MESSAGE,
        "module yield default",
    );
}

/// Template expressions are parsed by a different function than script bodies,
/// so the script fix alone leaves this path accepting.
#[test]
fn template_expressions_reject_it_too() {
    for markup in [
        "<button onclick={async (p = await load()) => p}>go</button>",
        "<p>{[async (p = await load()) => p].length}</p>",
    ] {
        let src = format!("<script>\n{PREAMBLE}</script>\n\n{markup}\n");
        assert_rejected(component_error(&src), AWAIT_MESSAGE, markup);
    }
}

/// The keyword belongs to a nested function, not to the parameter list — a
/// scan of the whole subtree cannot tell these from the cases above.
#[test]
fn a_keyword_inside_a_nested_function_still_compiles() {
    for statement in [
        "const f = async (p = load()) => p;",
        "const f = async (p = (async () => await load())) => p;",
        "const f = async (p = { async m() { return await load(); } }) => p;",
        "const f = async (p = class { async m() { return await load(); } }) => p;",
        "const f = async (p = function* () { yield 1; }) => p;",
        "const f = async (p = awaitable) => p;",
        "const f = async (p) => await p;",
        "function* g(p = 1) { yield p; }",
    ] {
        assert!(
            component_error(&in_instance_script(statement)).is_none(),
            "must still compile: {statement}"
        );
    }
}

#[test]
fn a_keyword_inside_a_nested_function_still_compiles_on_the_module_path() {
    for statement in [
        "export const f = async (p = load()) => p;",
        "export const f = async (p = { async m() { return await load(); } }) => p;",
        "export const f = async (p = function* () { yield 1; }) => p;",
    ] {
        let src = format!("function load() {{}}\n{statement}\n");
        assert!(
            module_error(&src).is_none(),
            "must still compile: {statement}"
        );
    }
}
