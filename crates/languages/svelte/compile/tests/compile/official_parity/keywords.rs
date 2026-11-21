//! A keyword acorn reads as a name or an expression, or meets written with an escape, in a
//! component's script and in a `.svelte.js` module.

use rsvelte_svelte_compile::{CompileOptions, ModuleCompileOptions, compile, compile_module};

/// A module's text, the first line of acorn's message and where it is, from svelte 5.57.3.
const CASES: &[(&str, &str, u32)] = &[
    (
        "\\u0061wait",
        "Cannot use keyword 'await' outside an async function",
        0,
    ),
    (
        "\\u0061wait;",
        "Cannot use keyword 'await' outside an async function",
        0,
    ),
    (
        "let \\u0061wait = 1;",
        "Cannot use keyword 'await' outside an async function",
        4,
    ),
    (
        "let await = 1;",
        "Cannot use keyword 'await' outside an async function",
        4,
    ),
    (
        "async function f() { let await = 1; }",
        "Cannot use 'await' as identifier inside an async function",
        25,
    ),
    (
        "async function f() { let \\u0061wait = 1; }",
        "Cannot use 'await' as identifier inside an async function",
        25,
    ),
    (
        "function f() { let await = 1; }",
        "Cannot use keyword 'await' outside an async function",
        19,
    ),
    (
        "function f(await) {}",
        "Cannot use keyword 'await' outside an async function",
        11,
    ),
    (
        "class A { static { let await = 1; } }",
        "Cannot use await in class static initialization block",
        23,
    ),
    ("\\u0069f (1) {}", "Escape sequence in keyword if", 0),
    ("\\u0074his;", "Escape sequence in keyword this", 0),
    ("n\\u0065w Foo();", "Escape sequence in keyword new", 0),
    ("\\u0074ypeof x;", "Escape sequence in keyword typeof", 0),
    ("x \\u0069n y;", "Escape sequence in keyword in", 2),
    (
        "function* g() { let yield = 1; }",
        "Cannot use 'yield' as identifier inside a generator",
        20,
    ),
    (
        "function* g() { yi\\u0065ld; }",
        "Cannot use 'yield' as identifier inside a generator",
        16,
    ),
    (
        "const f = async () => { let await; };",
        "Cannot use 'await' as identifier inside an async function",
        28,
    ),
    (
        "const { await } = x;",
        "Cannot use keyword 'await' outside an async function",
        8,
    ),
    (
        "\\u0061wait(x);",
        "Cannot use keyword 'await' outside an async function",
        0,
    ),
    (
        "console.log(\\u0069mport.meta);",
        "Escape sequence in keyword import",
        12,
    ),
    (
        "async function f(await) {}",
        "Cannot use 'await' as identifier inside an async function",
        17,
    ),
    (
        "function* g(yield) {}",
        "Cannot use 'yield' as identifier inside a generator",
        12,
    ),
    (
        "async function f() { function g() { let await; } }",
        "Cannot use keyword 'await' outside an async function",
        40,
    ),
    (
        "class A { static { async function f() { let await; } } }",
        "Cannot use 'await' as identifier inside an async function",
        44,
    ),
    ("t\\u0072ue;", "Escape sequence in keyword true", 0),
    (
        "try {} catch (await) {}",
        "Cannot use keyword 'await' outside an async function",
        14,
    ),
    (
        "import await from 'x';",
        "Cannot use keyword 'await' outside an async function",
        7,
    ),
    (
        "class await {}",
        "Cannot use keyword 'await' outside an async function",
        6,
    ),
    (
        "async function f() { class A { y = class await {}; } }",
        "Cannot use keyword 'await' outside an async function",
        41,
    ),
    (
        "class A { y = class await {}; }",
        "Cannot use keyword 'await' outside an async function",
        20,
    ),
    (
        "async function f() { class A { [class await {}] = 1; } }",
        "Cannot use 'await' as identifier inside an async function",
        38,
    ),
    ("function* yield(){}", "The keyword 'yield' is reserved", 10),
    (
        "export function* yield(){}",
        "The keyword 'yield' is reserved",
        17,
    ),
    (
        "async function await(){}",
        "Cannot use keyword 'await' outside an async function",
        15,
    ),
    (
        "function* g(){ function yield(){} }",
        "Cannot use 'yield' as identifier inside a generator",
        24,
    ),
    (
        "async function f(){ function await(){} }",
        "Cannot use 'await' as identifier inside an async function",
        29,
    ),
    (
        "class A { static { function await(){} } }",
        "Cannot use await in class static initialization block",
        28,
    ),
    (
        "(function* yield(){});",
        "Cannot use 'yield' as identifier inside a generator",
        11,
    ),
    (
        "(async function await(){});",
        "Cannot use 'await' as identifier inside an async function",
        16,
    ),
    (
        "function* g(){ (function yield(){}); }",
        "The keyword 'yield' is reserved",
        25,
    ),
    (
        "async function f(){ (function await(){}); }",
        "Cannot use keyword 'await' outside an async function",
        30,
    ),
    ("th\\u0069s;", "Escape sequence in keyword this", 0),
    ("const f = (await) => 1;", "Unexpected token", 16),
    ("const f = async (await) => 1;", "Unexpected token", 22),
    (
        "function g() { const f = async (await) => 1; }",
        "Cannot use keyword 'await' outside an async function",
        32,
    ),
    (
        "async function g() { const f = (await) => 1; }",
        "Unexpected token",
        37,
    ),
    (
        "async function g() { const f = async (await) => 1; }",
        "Unexpected token",
        43,
    ),
    (
        "class A { static { const f = (await) => 1; } }",
        "Cannot use await in class static initialization block",
        30,
    ),
    (
        "class A { static { const f = async (await) => 1; } }",
        "Cannot use await in class static initialization block",
        36,
    ),
    ("const f = (a, await) => 1;", "Unexpected token", 19),
    ("const f = ({ a: await }) => 1;", "Unexpected token", 22),
    ("const f = ([await]) => 1;", "Unexpected token", 17),
    (
        "const f = async (\\u0061wait) => 1;",
        "Cannot use keyword 'await' outside an async function",
        17,
    ),
    (
        "async function g() { const f = (\\u0061wait) => 1; }",
        "Cannot use 'await' as identifier inside an async function",
        32,
    ),
    (
        "function* g() { const f = (yield) => 1; }",
        "Yield expression cannot be a default value",
        27,
    ),
    (
        "const f = async () => (await) => 1;",
        "Unexpected token",
        28,
    ),
    (
        "const f = async () => { const h = (await) => 1; };",
        "Unexpected token",
        40,
    ),
    ("const f = async (...await) => 1;", "Unexpected token", 25),
    (
        "const f = async ({ await }) => 1;",
        "Cannot use keyword 'await' outside an async function",
        19,
    ),
    ("const f = async ([await]) => 1;", "Unexpected token", 23),
    ("const f = (await = 1) => 1;", "Unexpected token", 17),
    ("const f = (a = (await) => 1) => 2;", "Unexpected token", 21),
    (
        "function* g() { const f = ([yield]) => 1; }",
        "Yield expression cannot be a default value",
        28,
    ),
    (
        "function* g() { const f = (a, yield) => 1; }",
        "Yield expression cannot be a default value",
        30,
    ),
    (
        "function* g() { const f = (...yield) => 1; }",
        "Cannot use 'yield' as identifier inside a generator",
        30,
    ),
    (
        "function* g() { const f = ({ yield }) => 1; }",
        "Cannot use 'yield' as identifier inside a generator",
        29,
    ),
    (
        "async function g() { const f = (...await) => 1; }",
        "Cannot use 'await' as identifier inside an async function",
        35,
    ),
    (
        "async function g() { const f = ({ await }) => 1; }",
        "Cannot use 'await' as identifier inside an async function",
        34,
    ),
    ("const f = (await /* c */ ) => 1;", "Unexpected token", 25),
    (
        "const f = (await
) => 1;",
        "Unexpected token",
        17,
    ),
    ("const f = async (...[await]) => 1;", "Unexpected token", 26),
    ("const f = async (a, await) => 1;", "Unexpected token", 25),
    ("const f = (await, b) => 1;", "Unexpected token", 16),
    (
        "const f = (a = async (await) => 1) => 0;",
        "Unexpected token",
        27,
    ),
    (
        "function* g() { const f = async (yield) => 1; }",
        "Yield expression cannot be a default value",
        33,
    ),
    (
        "function* g() { const f = async yield => 1; }",
        "Cannot use 'yield' as identifier inside a generator",
        32,
    ),
    ("const f = (/* c */ await) => 1;", "Unexpected token", 24),
    (
        "function* g() { const f = (\\u0079ield) => 1; }",
        "Cannot use 'yield' as identifier inside a generator",
        27,
    ),
];

#[test]
fn a_misused_keyword_raises_acorns_error_in_a_script_and_in_a_module() {
    let raised = |error: rsvelte_kernel::diagnostics::Diagnostic| {
        (
            error.code.to_string(),
            error.message.lines().next().map(str::to_owned),
            error.span.start_offset,
        )
    };
    for &(module, message, at) in CASES {
        let expected = |at| ("js_parse_error".to_owned(), Some(message.to_owned()), at);
        let script = format!("<script>{module}</script>");
        let component = compile(&script, &CompileOptions::default()).map(|_| ());
        assert_eq!(component.map_err(raised), Err(expected(at + 8)), "{script}");
        let module_options = ModuleCompileOptions::default();
        let compiled = compile_module(module, &module_options).map(|_| ());
        assert_eq!(compiled.map_err(raised), Err(expected(at)), "{module}");
    }
}
