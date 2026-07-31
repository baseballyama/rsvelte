//! Regression tests for the TypeScript erasure gaps of issue #1999.
//!
//! The erasure pass used to enumerate node kinds by hand, so any kind it forgot
//! to recurse into leaked TS text into the emitted JS. The eight shapes below
//! were each checked against the official compiler; the expectations are its
//! real output.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_ts(body: &str, generate: GenerateMode) -> String {
    let src = format!("<script lang=\"ts\">\n\t{body}\n</script>\n\n<p>ok</p>\n");
    compile(
        &src,
        CompileOptions {
            filename: Some("Erasure.svelte".to_string()),
            generate,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// Assert on both targets: the stripped form is present and no TS text survives.
fn assert_erased(body: &str, expected: &[&str], leftovers: &[&str]) {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = compile_ts(body, generate);
        for needle in expected {
            assert!(out.contains(needle), "missing `{needle}` in:\n{out}");
        }
        for leftover in leftovers {
            assert!(
                !out.contains(leftover),
                "leftover TS `{leftover}` in:\n{out}"
            );
        }
    }
}

#[test]
fn tagged_template_expressions() {
    assert_erased(
        "const x = 1;\n\tfunction tag(s: TemplateStringsArray) { return s.raw.join(''); }\n\tconst r = tag`${x as string}`;\n\tconsole.log(r);",
        &["tag`${x}`"],
        &["as string"],
    );
}

#[test]
fn dynamic_import_argument() {
    assert_erased(
        "const p = './x.js';\n\tconst m = import(p as string);\n\tconsole.log(m);",
        &["import(p)"],
        &["as string"],
    );
}

#[test]
fn destructuring_assignment_targets() {
    assert_erased(
        "const arr = [1, 2];\n\tlet a;\n\tconst obj: any = {};\n\t[a, obj!.b] = arr;\n\tconsole.log(a, obj);",
        &["[a, obj.b] = arr"],
        &["obj!.b"],
    );
    assert_erased(
        "const src = { x: 1 };\n\tconst obj: any = {};\n\t({ x: obj!.x } = src);\n\tconsole.log(obj);",
        &["{ x: obj.x } = src"],
        &["obj!.x"],
    );
}

/// `AssignmentTargetWithDefault.init` is only reachable through the array /
/// object target branches, so it regressed with them.
#[test]
fn destructuring_assignment_target_default() {
    assert_erased(
        "const arr: any[] = [];\n\tconst obj: any = {};\n\t[obj!.b = (1 as number)] = arr;\n\tconsole.log(obj);",
        &["[obj.b = 1] = arr"],
        &["as number", "obj!.b"],
    );
}

#[test]
fn class_extends_expression() {
    assert_erased(
        "class Base {}\n\tconst B: any = Base;\n\tclass A extends (B as any) {}\n\tconsole.log(A);",
        &["class A extends B {}"],
        &["as any"],
    );
}

#[test]
fn class_member_computed_keys() {
    assert_erased(
        "const k = 'a';\n\tclass A { [k as string] = 1; }\n\tconsole.log(A);",
        &["[k] = 1"],
        &["as string"],
    );
    assert_erased(
        "const k = 'a';\n\tclass A { [k as string]() { return 1; } }\n\tconsole.log(A);",
        &["[k]()"],
        &["as string"],
    );
}

#[test]
fn for_statement_expression_init() {
    assert_erased(
        "let i = 0;\n\tconst n = 0;\n\tfor (i = (n as number); i < 1; i++) {}\n\tconsole.log(i);",
        &["for (i = n; i < 1; i++)"],
        &["as number"],
    );
}

#[test]
fn for_of_and_for_in_non_declaration_targets() {
    assert_erased(
        "const arr = [1];\n\tconst obj: any = {};\n\tfor (obj!.x of arr) {}\n\tconsole.log(obj);",
        &["for (obj.x of arr)"],
        &["obj!.x"],
    );
    assert_erased(
        "const arr = [1];\n\tconst obj: any = {};\n\tfor (obj!.x in arr) {}\n\tconsole.log(obj);",
        &["for (obj.x in arr)"],
        &["obj!.x"],
    );
}

/// The official compiler rejects `with` outright (module code is strict), so
/// there is no upstream output to match here — this only pins that the body is
/// reached by the walk rather than passed through verbatim.
#[test]
fn with_statement_body() {
    assert_erased(
        "const o = { x: 1 };\n\tconst y: any = 2;\n\tlet x;\n\twith (o) { x = y as any; }\n\tconsole.log(x);",
        &["x = y"],
        &["as any"],
    );
}
