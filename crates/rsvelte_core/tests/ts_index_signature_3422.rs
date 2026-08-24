//! Pins the deliberate divergence recorded in
//! `compatibility/deliberate-divergences.md`: a TypeScript **class index
//! signature** is erased, the way an interface and a type alias already are.
//!
//! It is type-only and has no runtime representation. The official compiler
//! neither erases it nor prints it: `remove_typescript_nodes.js` deletes its
//! `typeAnnotation` while `ClassBody` keeps the node, and esrap's
//! `TSIndexSignature` printer then reads `.type` off `undefined` — a bare
//! `TypeError` with no code, no position and no frame. There is no output to be
//! byte-equal to.
//!
//! The previous behaviour was a deliberate parity choice ("upstream passes these
//! through verbatim"), and it shipped two defects: the client emitted TypeScript
//! into a `.js` artifact, and the server discarded the whole instance script
//! because the erased source no longer parsed as JavaScript.

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

const TARGETS: [(&str, GenerateMode, bool); 3] = [
    ("client", GenerateMode::Client, false),
    ("client-dev", GenerateMode::Client, true),
    ("server", GenerateMode::Server, false),
];

/// The divergence is only worth taking if the alternative really is invalid, so
/// the checker has to reject the text rsvelte declines to emit.
#[test]
fn the_verbatim_shape_is_rejected_by_the_parser_used_here() {
    for shape in [
        "class K { [k: string]: unknown }",
        "class K { readonly [k: string]: unknown }",
        "class K { static [k: string]: unknown }",
    ] {
        assert!(
            !parse_errors(shape).is_empty(),
            "the parser accepts {shape}, so it cannot witness this divergence"
        );
    }
}

/// Every spelling, every class host, every entry point, every target.
#[test]
fn a_class_index_signature_is_erased() {
    let members = [
        ("string-key", "[k: string]: unknown"),
        ("number-key", "[k: number]: string"),
        ("readonly", "readonly [k: string]: unknown"),
        ("static", "static [k: string]: unknown"),
        ("trailing-semi", "[k: string]: unknown;"),
        ("two", "[k: string]: unknown; [n: number]: string"),
        ("with-field", "[k: string]: unknown;\n\t\tname = 1"),
        (
            "with-method",
            "[k: string]: unknown;\n\t\tm() { return 1; }",
        ),
    ];
    let hosts = [
        ("class-decl", "class K {\n\t\t{M}\n\t}\n\tvoid K;"),
        ("class-expr", "const K = class {\n\t\t{M}\n\t};\n\tvoid K;"),
        (
            "with-state",
            "class K {\n\t\t{M}\n\t\tcount = $state(0);\n\t}\n\tvoid K;",
        ),
    ];
    let entries = [
        (
            "instance",
            "<script lang=\"ts\">\n\t{B}\n</script>\n<b>x</b>\n",
        ),
        (
            "module",
            "<script module lang=\"ts\">\n\t{B}\n</script>\n<b>x</b>\n",
        ),
    ];

    for (m_name, member) in members {
        for (h_name, host) in hosts {
            for (e_name, entry) in entries {
                let src = entry.replace("{B}", &host.replace("{M}", member));
                for (target, generate, dev) in TARGETS {
                    let what = format!("{m_name} / {h_name} / {e_name} / {target}");
                    let out = compile_target(&src, generate, dev);
                    assert_parses(&out, &what);
                    // The whole script must still be there — the server's failure
                    // mode was output that parses and is empty.
                    assert!(
                        out.contains("void K;"),
                        "{what}: the script was dropped:\n{out}"
                    );
                    assert!(
                        !out.contains(": unknown") && !out.contains("[k:"),
                        "{what}: TypeScript reached the JS output:\n{out}"
                    );
                }
            }
        }
    }
}

/// Controls: the TypeScript-only class members that were already erased
/// correctly must not move, or the fix is paying for one member kind with its
/// neighbours.
#[test]
fn the_neighbouring_members_are_unaffected() {
    for member in [
        "declare x: number",
        "y?: number",
        "z!: number",
        "private p = 1",
        "protected q = 1",
        "public r = 1",
        "readonly s = 1",
        "m(a: number): number { return a; }",
        "g<T>(a: T): T { return a; }",
        "get v(): number { return 1; }",
        "name = 1",
    ] {
        let src = format!(
            "<script lang=\"ts\">\n\tclass K {{\n\t\t{member}\n\t}}\n\tvoid K;\n</script>\n<b>x</b>\n"
        );
        for (target, generate, dev) in TARGETS {
            let out = compile_target(&src, generate, dev);
            assert_parses(&out, &format!("control {member} / {target}"));
            assert!(
                out.contains("void K;"),
                "control {member} / {target}: the script was dropped:\n{out}"
            );
        }
    }
}
