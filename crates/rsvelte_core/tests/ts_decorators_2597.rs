//! Upstream's `remove_typescript_nodes` rejects **every** decorator in a
//! TypeScript `<script>` with `typescript_invalid_feature`. rsvelte only saw the
//! ones on a class *declaration* — the typed AST has no field for a decorator on
//! a member, a class expression or a parameter, so those were silently copied
//! into the generated module, which then is not JavaScript.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_result(src: &str, generate: GenerateMode) -> Result<String, String> {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .map_err(|e| format!("{e:?}"))
}

fn instance(body: &str) -> String {
    format!("<script lang=\"ts\">\n{body}\n</script>\n\n<p>{{s ? 'ok' : ''}}</p>\n")
}

/// Every shape upstream rejects, keyed by the source that carries it. The first
/// `@` in each is the decorator upstream reports.
const DECORATED: &[&str] = &[
    "@dec class C {}\nconst s = C;",
    "const C = @dec class {};\nconst s = C;",
    "class C { @dec m() {} }\nconst s = C;",
    "class C { @dec static m() {} }\nconst s = C;",
    "class C { @dec x = 1; }\nconst s = C;",
    "class C { @dec get x() { return 1; } }\nconst s = C;",
    "class C { constructor(@dec a: number) {} }\nconst s = C;",
    "class C { @a @b m() {} }\nconst s = C;",
    "class C { @dec({ n: 1 }) m() {} }\nconst s = C;",
    "class C { @ns.dec m() {} }\nconst s = C;",
    "@outer class C { @inner m() {} }\nconst s = C;",
    "function f() { class C { @dec m() {} } return C; }\nconst s = f;",
];

#[test]
fn every_decorator_position_is_rejected() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        for body in DECORATED {
            let src = instance(body);
            let err = match compile_result(&src, generate) {
                Err(err) => err,
                Ok(code) => panic!("{body:?} must not compile; emitted:\n{code}"),
            };
            assert!(
                err.contains("typescript_invalid_feature"),
                "expected typescript_invalid_feature for {body:?}, got: {err}"
            );
            assert!(
                err.contains("decorators (related TSC proposal is not stage 4 yet)"),
                "message must be upstream's for {body:?}, got: {err}"
            );
            let at = src.find('@').expect("source carries a decorator");
            assert!(
                err.contains(&format!("span: ({at},")),
                "span must start at the first `@` ({at}) for {body:?}, got: {err}"
            );
        }
    }
}

/// The module script is stripped by the same call, and its offsets differ.
#[test]
fn a_decorated_member_in_the_module_script_is_rejected() {
    let src = "<script module lang=\"ts\">\nclass C { @dec m() {} }\nexport const s = C;\n</script>\n\n<p>{s ? 'ok' : ''}</p>\n";
    let err = match compile_result(src, GenerateMode::Client) {
        Err(err) => err,
        Ok(code) => panic!("must not compile; emitted:\n{code}"),
    };
    assert!(err.contains("typescript_invalid_feature"), "got: {err}");
    let at = src.find('@').unwrap();
    assert!(err.contains(&format!("span: ({at},")), "got: {err}");
}

/// Upstream's `ExportDefaultDeclaration` visitor returns the node instead of
/// `context.next()`, so a decorator under a default export is never seen and the
/// later `module_illegal_default_export` is what a component reports.
#[test]
fn a_decorator_under_a_default_export_is_not_the_reported_error() {
    for body in [
        "export default @dec class {};\nconst s = 1;",
        "export default class { @dec m() {} };\nconst s = 1;",
    ] {
        let err = compile_result(&instance(body), GenerateMode::Client)
            .expect_err("a default export in a component never compiles");
        assert!(
            err.contains("module_illegal_default_export"),
            "expected module_illegal_default_export for {body:?}, got: {err}"
        );
    }
}

/// Controls: an `@` that is not a decorator must not start rejecting, and a
/// plain (non-TypeScript) script keeps acorn's `js_parse_error`.
#[test]
fn a_non_decorator_at_sign_still_compiles() {
    for body in [
        "const s = 'a@b.example';",
        "const s = `a@${'b'}`;",
        "const s = /@/.test('@') ? 1 : 0;",
        "// @ts-expect-error\nconst s: number = 1;",
        "/** @type {number} */\nconst s = 1;",
    ] {
        assert!(
            compile_result(&instance(body), GenerateMode::Client).is_ok(),
            "{body:?} should compile"
        );
    }
}

#[test]
fn a_decorator_in_a_plain_script_is_still_a_parse_error() {
    let src =
        "<script>\nclass C { @dec m() {} }\nconst s = C;\n</script>\n\n<p>{s ? 'ok' : ''}</p>\n";
    let err = compile_result(src, GenerateMode::Client)
        .expect_err("decorators are not JavaScript syntax acorn accepts");
    assert!(err.contains("js_parse_error"), "got: {err}");
}

/// Ordering: upstream walks one tree, so the earliest offending node is the one
/// reported regardless of which feature it is.
#[test]
fn the_earliest_typescript_feature_wins() {
    let dec_first = instance("class C { @dec m() {} }\nenum E { A }\nconst s = C;");
    let err = compile_result(&dec_first, GenerateMode::Client).expect_err("must not compile");
    assert!(
        err.contains("decorators (related TSC proposal is not stage 4 yet)"),
        "got: {err}"
    );

    let enum_first = instance("enum E { A }\nclass C { @dec m() {} }\nconst s = C;");
    let err = compile_result(&enum_first, GenerateMode::Client).expect_err("must not compile");
    assert!(
        err.contains("TypeScript language features like enums"),
        "got: {err}"
    );
}
