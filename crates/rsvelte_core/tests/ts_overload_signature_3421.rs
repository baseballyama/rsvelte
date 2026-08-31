//! Pins the deliberate divergence recorded in
//! `compatibility/GATES.md#deliberate-divergences`: a bodiless class member — a
//! TypeScript overload signature — is erased, the way an `abstract` method
//! already is.
//!
//! The official eraser removes a `MethodDefinition` only when it is `abstract`
//! (`1-parse/remove_typescript_nodes.js:156-161`), so an overload signature
//! survives into the output as a member with no body, which no JavaScript
//! parser accepts. An overload signature has no runtime representation, so
//! reproducing those bytes would trade a valid module for an invalid one.
//!
//! The rsvelte-side defect this closes is one level worse than the parse error:
//! the server pipeline re-parses the erased script to classify it, and a
//! rejection there used to return an empty body, so the whole instance script
//! vanished while the output still parsed. That failure is now loud (see
//! `record_classification_failure`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_target(src: &str, generate: GenerateMode, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            generate,
            dev,
            filename: Some("A.svelte".to_string()),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn parse_errors(code: &str) -> Vec<String> {
    let allocator = oxc_allocator::Allocator::default();
    oxc_parser::Parser::new(&allocator, code, oxc_span::SourceType::mjs())
        .parse()
        .diagnostics
        .iter()
        .map(|d| d.to_string())
        .collect()
}

#[track_caller]
fn assert_parses(code: &str, what: &str) {
    let errors = parse_errors(code);
    assert!(
        errors.is_empty(),
        "{what}: emitted JS does not parse: {errors:?}\n--- output ---\n{code}"
    );
}

/// The divergence is only worth taking if the alternative really is invalid, so
/// the checker has to reject the shape rsvelte declines to emit.
#[test]
fn the_upstream_shape_is_rejected_by_the_parser_used_here() {
    for shape in [
        "class K { m(a); m(a) { return a; } }",
        "class K { static m(a); static m(a) { return a; } }",
        "class K { constructor(a); constructor(a) { this.a = a; } }",
    ] {
        assert!(
            !parse_errors(shape).is_empty(),
            "the parser accepts {shape}, so it cannot witness this divergence"
        );
    }
}

/// Every member shape that can carry an overload signature, on every target.
/// The `server` row additionally checks that the instance script is still
/// there — its old failure mode was output that parses and is empty.
#[test]
fn a_bodiless_class_member_is_erased_on_every_target() {
    let bodies = [
        (
            "method",
            "class K {\n\t\tm(a: number): number;\n\t\tm(a: any) { return a; }\n\t}",
        ),
        (
            "two-signatures",
            "class K {\n\t\tm(a: number): number;\n\t\tm(a: string): string;\n\t\tm(a: any) { return a; }\n\t}",
        ),
        (
            "static",
            "class K {\n\t\tstatic m(a: number): number;\n\t\tstatic m(a: any) { return a; }\n\t}",
        ),
        (
            "constructor",
            "class K {\n\t\tconstructor(a: number);\n\t\tconstructor(a: any) { this.a = a; }\n\t}",
        ),
        (
            "private",
            "class K {\n\t\t#m(a: number): number;\n\t\t#m(a: any) { return a; }\n\t\tgo() { return this.#m(1); }\n\t}",
        ),
        (
            "class-expression",
            "const K = class {\n\t\tm(a: number): number;\n\t\tm(a: any) { return a; }\n\t};",
        ),
        (
            "getter",
            "class K {\n\t\tget m(): number;\n\t\tget m() { return 1; }\n\t}",
        ),
    ];

    for (name, body) in bodies {
        let src =
            format!("<script lang=\"ts\">\n\t{body}\n\tconst v = 1;\n</script>\n<b>{{v}}</b>\n");
        for (target, generate, dev) in [
            ("client", GenerateMode::Client, false),
            ("client-dev", GenerateMode::Client, true),
            ("server", GenerateMode::Server, false),
        ] {
            let out = compile_target(&src, generate, dev);
            assert_parses(&out, &format!("{name} / {target}"));
            assert!(
                out.contains("const v = 1;"),
                "{name} / {target}: the instance script was dropped:\n{out}"
            );
            assert!(
                out.contains("class K") || out.contains("const K = class"),
                "{name} / {target}: the class itself was dropped:\n{out}"
            );
        }
    }
}

/// The reported repro: on `server` the whole instance script used to vanish,
/// neighbouring statements included, while the output still parsed.
#[test]
fn the_server_instance_script_survives_with_its_neighbours() {
    let src = "<script lang=\"ts\">
\timport { onMount } from 'svelte';
\tconst before = 1;
\tclass K {
\t\tm(a: number): number;
\t\tm(a: any) { return a; }
\t}
\tconst after = 2;
\tconst v = before + after + new K().m(1);
\tvoid onMount;
</script>
<b>{v}</b>
";
    let out = compile_target(src, GenerateMode::Server, false);
    assert_parses(&out, "server");
    for expected in [
        "import { onMount } from 'svelte';",
        "const before = 1;",
        "const after = 2;",
        "const v = before + after + new K().m(1);",
    ] {
        assert!(out.contains(expected), "missing {expected} in:\n{out}");
    }
}

/// Controls: a class with no overload signature, and an `abstract` method (which
/// upstream already drops) are plain parity and must not drift with the fix.
#[test]
fn the_neighbouring_shapes_are_unaffected() {
    let plain = compile_target(
        "<script lang=\"ts\">
\tclass K {
\t\tm(a: any) { return a; }
\t}
\tconst v = new K().m(1);
</script>
<b>{v}</b>
",
        GenerateMode::Server,
        false,
    );
    assert_parses(&plain, "control / no overload");
    assert!(
        plain.contains("m(a)") && plain.contains("return a;"),
        "the implementation body must survive:\n{plain}"
    );

    let abstract_ = compile_target(
        "<script lang=\"ts\">
\tabstract class K {
\t\tabstract m(a: number): number;
\t}
\tconst v = 1;
\tvoid K;
</script>
<b>{v}</b>
",
        GenerateMode::Server,
        false,
    );
    assert_parses(&abstract_, "control / abstract");
    assert!(
        !abstract_.contains("abstract"),
        "the abstract member must still be erased:\n{abstract_}"
    );
}
