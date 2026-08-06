//! Regression tests for three false-positive compile errors found by compiling
//! open-webui v0.11.0, which upstream `svelte.compile` accepts. Each case was
//! reduced from a real component and confirmed against the official compiler in
//! both directions — the negative controls below still have to fail.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn try_compile(src: &str) -> Result<(), String> {
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
    .map(|_| ())
    .map_err(|e| format!("{e:?}"))
}

#[test]
fn catch_clause_parameter_is_assignable() {
    assert!(
        try_compile(
            "<script>\nconst go = () => { try { x(); } catch (err) { err = err.message; } };\n</script>"
        )
        .is_ok()
    );
    assert!(
        try_compile(
            "<script>\nconst go = () => { try { x(); } catch ({ a }) { a = 1; } };\n</script>"
        )
        .is_ok()
    );
}

#[test]
fn const_declared_in_a_function_is_still_constant() {
    assert!(try_compile("<script>\nconst go = () => { const e = 1; e = 2; };\n</script>").is_err());
}

#[test]
fn dollar_name_destructured_from_a_declaration_is_not_a_store_read() {
    let src = "<script>\n\
        const a = (r) => { r.forEach(({ from }) => from); };\n\
        const b = (state) => { const { $from } = state.selection; return $from; };\n\
        </script>";
    assert!(try_compile(src).is_ok());
    // Nested patterns reach the declaration keyword through more than one hop.
    let nested = "<script>\n\
        const a = (r) => { r.forEach(({ from }) => from); };\n\
        const b = (s) => { const { a: { $from } } = s; return $from; };\n\
        </script>";
    assert!(try_compile(nested).is_ok());
}

#[test]
fn dollar_name_in_an_object_literal_is_still_a_store_read() {
    // Same shorthand, but the `{` opens a literal rather than a pattern, so the
    // scoped-store error must survive.
    let src = "<script>\n\
        const a = (r) => { r.forEach(({ from }) => from); };\n\
        const b = () => $from;\n\
        </script>";
    assert!(try_compile(src).is_err());
}

#[test]
fn typescript_grammar_rules_acorn_does_not_check_are_not_parse_errors() {
    let ts = |body: &str| format!("<script lang=\"ts\">\n{body}\n</script>");
    for body in [
        "const f = (a?: string, b: string) => b;", // TS1016
        "const f = (a?: string = \"x\") => a;",    // TS1015
        "const f = (...a?: string[]) => a;",       // TS1047
        "class C { set x(a?: number) {} }",        // TS1051
        "class C { set x(a: number): void {} }",   // TS1095
        "class C { constructor(this: C) {} }",     // TS2681
        "let x!: number = 1;",                     // TS1263
        "type T = [...a?: string[]];",             // TS5085
    ] {
        assert!(try_compile(&ts(body)).is_ok(), "should compile: {body}");
    }
}

#[test]
fn typescript_grammar_rules_acorn_does_check_stay_parse_errors() {
    let ts = |body: &str| format!("<script lang=\"ts\">\n{body}\n</script>");
    for body in [
        "class C { set x(a: number, b: number) {} }", // TS1049
        "interface I { [a: string, b: string]: number }", // TS1096
        "function f<>() {}",                          // TS1098
        "type T = [a?: string, b: string];",          // TS1257
        "class C { accessor x?: number; }",           // TS1276
        "enum E { 1 = 1 }",                           // TS2452
    ] {
        assert!(
            try_compile(&ts(body)).is_err(),
            "should be rejected: {body}"
        );
    }
    // TypeScript syntax in a plain script stays a `js_parse_error`.
    assert!(try_compile("<script>\nconst x = <string>y;\n</script>").is_err());
}
