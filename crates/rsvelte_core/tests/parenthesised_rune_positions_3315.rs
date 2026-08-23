//! A rune call wrapped in grouping parentheses must lower exactly like the bare
//! call, in every position a rune can occupy (issues #3303 / #3315 / #3336).
//!
//! The oracle is the bare spelling: acorn builds no `ParenthesizedExpression`, so
//! upstream cannot tell `($state(1))` from `$state(1)` — which makes byte
//! equality against the unwrapped twin the same assertion as byte equality
//! against the official compiler, expressible without running it. Each output is
//! additionally handed to a JS parser, because two of these positions used to
//! emit text no parser accepts (a duplicated `const` declaration, and a `();`
//! left where a statement was cut out of its own parens) — a failure byte
//! comparison alone reports as "different", not as "not JavaScript".

use rsvelte_core::{
    CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module, compiler::CssMode,
};

/// Grouping spellings that carry no comment. The comment-carrying ones
/// (`(/*c*/ $state(1))` and friends) are the project's known comment-position
/// backlog and are deliberately not asserted here.
const WRAPS: &[&str] = &["({})", "(({}))", "((({})))", "(\n  {}\n)", "(   {}   )"];

fn wrap(spelling: &str, expr: &str) -> String {
    spelling.replace("{}", expr)
}

fn compile_component(src: &str, generate: GenerateMode, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate,
            dev,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn compile_mod(src: &str, generate: GenerateMode) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("test.svelte.js".to_string()),
            generate,
            ..Default::default()
        },
    )
    .expect("compile_module")
    .js
    .code
}

fn assert_is_javascript(code: &str, what: &str) {
    let allocator = oxc_allocator::Allocator::default();
    let ret = oxc_parser::Parser::new(&allocator, code, oxc_span::SourceType::mjs()).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "{what} did not parse as JavaScript: {:?}\n{code}",
        ret.diagnostics
    );
}

/// `(position, rune expression)` — the rune call whose parentheses vary, and the
/// component body it sits in. `{}` marks where the expression goes.
const COMPONENT_POSITIONS: &[(&str, &str, &str)] = &[
    ("declarator_init", "$state(1)", "let v = {};"),
    ("derived_by", "$derived.by(() => base + 1)", "let d = {};"),
    ("state_raw", "$state.raw(1)", "let r = {};"),
    ("props_call", "$props()", "let p = {};"),
    (
        "class_field",
        "$state(1)",
        "class K { f = {}; }\nlet k = new K();",
    ),
    (
        "class_field_derived",
        "$derived(this.a + 1)",
        "class K { a = $state(1); b = {}; }\nlet k = new K();",
    ),
    (
        "props_default",
        "$bindable(1)",
        "let { a = {} } = $props();",
    ),
    ("props_id", "$props.id()", "const uid = {};"),
    ("inspect", "$inspect(base)", "{};"),
    (
        "effect_body",
        "$effect(() => { console.log(base); })",
        "{};",
    ),
    (
        "state_snapshot",
        "$state.snapshot(base)",
        "function take() { return {}; }",
    ),
    ("derived_argument", "base + 1", "let d2 = $derived({});"),
];

fn component_source(body: &str) -> String {
    format!(
        "<script>\n\tlet base = $state(1);\n\t{}\n</script>\n<p>{{base}}</p>\n",
        body.replace('\n', "\n\t")
    )
}

#[test]
fn parentheses_around_a_rune_do_not_change_a_component() {
    for (position, expr, body) in COMPONENT_POSITIONS {
        let bare_body = body.replace("{}", expr);
        for spelling in WRAPS {
            let wrapped_body = body.replace("{}", &wrap(spelling, expr));
            // A multi-line spelling really does move the template down the file,
            // and dev mode records the element's line in `$.add_locations`. Pad
            // the twin's script by the same number of lines so the comparison is
            // about the rune and not about where the `<p>` ended up.
            let padding =
                "\n".repeat(wrapped_body.matches('\n').count() - bare_body.matches('\n').count());
            let bare = component_source(&format!("{padding}{bare_body}"));
            let wrapped = component_source(&wrapped_body);
            for (generate, dev, target) in [
                (GenerateMode::Client, false, "client"),
                (GenerateMode::Server, false, "server"),
                (GenerateMode::Client, true, "client-dev"),
            ] {
                let expected = compile_component(&bare, generate, dev);
                assert_is_javascript(&expected, &format!("{position} | bare | {target}"));
                let actual = compile_component(&wrapped, generate, dev);
                assert_is_javascript(&actual, &format!("{position} | {spelling} | {target}"));
                assert_eq!(
                    actual, expected,
                    "{position} | {spelling} | {target} diverged from its unwrapped twin"
                );
            }
        }
    }
}

/// `(position, rune expression, module body)`.
const MODULE_POSITIONS: &[(&str, &str, &str)] = &[
    ("declarator_init", "$state(1)", "export let v = {};"),
    ("state_raw", "$state.raw(1)", "export let r = {};"),
    ("class_field", "$state(1)", "export class K { f = {}; }"),
    (
        "class_field_derived",
        "$derived(this.a + 1)",
        "export class K { a = $state(1); b = {}; }",
    ),
    (
        "effect_body",
        "$effect(() => { console.log(base); })",
        "export function go() { {}; }",
    ),
    (
        "effect_pre",
        "$effect.pre(() => { console.log(base); })",
        "export function go() { {}; }",
    ),
    (
        "state_snapshot",
        "$state.snapshot(base)",
        "export function take() { return {}; }",
    ),
];

#[test]
fn parentheses_around_a_rune_do_not_change_a_module() {
    for (position, expr, body) in MODULE_POSITIONS {
        let bare = format!("let base = $state(1);\n{}\n", body.replace("{}", expr));
        for (generate, target) in [
            (GenerateMode::Client, "client"),
            (GenerateMode::Server, "server"),
        ] {
            let expected = compile_mod(&bare, generate);
            assert_is_javascript(&expected, &format!("module {position} | bare | {target}"));
            for spelling in WRAPS {
                let wrapped = format!(
                    "let base = $state(1);\n{}\n",
                    body.replace("{}", &wrap(spelling, expr))
                );
                let actual = compile_mod(&wrapped, generate);
                assert_is_javascript(
                    &actual,
                    &format!("module {position} | {spelling} | {target}"),
                );
                assert_eq!(
                    actual, expected,
                    "module {position} | {spelling} | {target} diverged from its unwrapped twin"
                );
            }
        }
    }
}

/// A component's `<script module>` is a fifth entry point: it is neither the
/// instance script nor `compileModule`, and it reaches the module class-field
/// lowering by its own route.
#[test]
fn parentheses_around_a_rune_do_not_change_a_module_script() {
    let bodies = [
        ("declarator", "export let shared = {};", "$state(1)"),
        ("class_field", "export class M { f = {}; }", "$state(2)"),
        (
            "class_field_derived",
            "export class M { a = $state(1); b = {}; }",
            "$derived(this.a + 1)",
        ),
    ];
    for (position, body, expr) in bodies {
        for spelling in WRAPS {
            let source = |script: &str| {
                format!(
                    "<script module>\n\t{}\n</script>\n<script>\n\tlet base = $state(3);\n</script>\n<p>{{base}}</p>\n",
                    script.replace('\n', "\n\t")
                )
            };
            let wrapped_body = body.replace("{}", &wrap(spelling, expr));
            let bare_body = body.replace("{}", expr);
            // Dev mode records the element's line, and a multi-line spelling
            // really does move it — pad the twin so the comparison is about the
            // rune rather than about where the `<p>` ended up.
            let padding =
                "\n".repeat(wrapped_body.matches('\n').count() - bare_body.matches('\n').count());
            for (generate, dev, target) in [
                (GenerateMode::Client, false, "client"),
                (GenerateMode::Server, false, "server"),
                (GenerateMode::Client, true, "client-dev"),
            ] {
                let expected =
                    compile_component(&source(&format!("{padding}{bare_body}")), generate, dev);
                let actual = compile_component(&source(&wrapped_body), generate, dev);
                assert_is_javascript(
                    &actual,
                    &format!("module-script {position} | {spelling} | {target}"),
                );
                assert_eq!(
                    actual, expected,
                    "module-script {position} | {spelling} | {target} diverged from its unwrapped twin"
                );
            }
        }
    }
}

/// #3336: the server module's statement removal cut the call out of its own
/// parentheses and left `();` behind — text no JS parser accepts.
#[test]
fn a_parenthesised_effect_statement_leaves_nothing_behind_on_the_server() {
    let out = compile_mod(
        "export function go() {\n\t($effect(() => { console.log(1); }));\n}\n",
        GenerateMode::Server,
    );
    assert_is_javascript(&out, "#3336 server module");
    assert!(
        !out.contains("();"),
        "the removed statement left its parentheses behind:\n{out}"
    );
    assert!(
        !out.contains("$effect"),
        "the effect call survived into the server output:\n{out}"
    );
}

/// #3315: `const id = ($props.id());` emitted the declaration twice, so the
/// module could not be imported at all.
#[test]
fn a_parenthesised_props_id_is_declared_once() {
    for (generate, dev) in [
        (GenerateMode::Client, false),
        (GenerateMode::Server, false),
        (GenerateMode::Client, true),
    ] {
        let out = compile_component(
            "<script>\n\tconst uid = ($props.id());\n</script>\n<p>{uid}</p>\n",
            generate,
            dev,
        );
        assert_is_javascript(&out, "#3315 props_id");
        assert!(
            !out.contains("$props.id()"),
            "the raw rune call survived:\n{out}"
        );
    }
}
