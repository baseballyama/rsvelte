//! A TypeScript rule that OXC enforces and the official parser does not must
//! not stop type stripping.
//!
//! `strip_typescript` returned the source unstripped whenever OXC produced any
//! diagnostic. OXC reports rules such as "a required parameter cannot follow an
//! optional parameter" as parse errors even though it built a complete AST, so a
//! component carrying one kept its type annotations: the client emitted
//! `(url: string, …) =>` into the generated module — not JavaScript — and the
//! server, which parses the stripped text as JS and drops the script when that
//! fails, silently emitted a component missing its whole instance script.

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_to(source: &str, generate: GenerateMode) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code
}

/// A compiler may emit output we would call wrong; it may never emit output that
/// is not JavaScript.
fn assert_parses(code: &str) {
    let allocator = Allocator::default();
    let ret = Parser::new(&allocator, code, SourceType::mjs()).parse();
    assert!(
        !ret.panicked && ret.diagnostics.is_empty(),
        "generated module is not parseable JavaScript: {:?}\n{code}",
        ret.diagnostics
    );
}

/// `c` is required and follows the optional `b` — a rule OXC enforces while
/// parsing and `acorn-typescript` does not.
const REQUIRED_AFTER_OPTIONAL: &str = "<script lang=\"ts\">\n\texport let overlay = false;\n\n\tconst f = (a: string, b?: string, c: string) => {\n\t\treturn a + (b ?? '') + c;\n\t};\n</script>\n\n<p>{f('x')}{overlay}</p>\n";

#[test]
fn client_strips_the_annotations() {
    let out = compile_to(REQUIRED_AFTER_OPTIONAL, GenerateMode::Client);
    assert_parses(&out);
    assert!(
        out.contains("const f = (a, b, c) =>"),
        "type annotations survived into the generated module:\n{out}"
    );
}

/// The second symptom of the same bail: the server parses the stripped text as
/// JavaScript and returns no statements when that fails, so the component lost
/// its whole instance script — parseable output, silently missing code.
#[test]
fn server_keeps_the_instance_script() {
    let out = compile_to(REQUIRED_AFTER_OPTIONAL, GenerateMode::Server);
    assert_parses(&out);
    assert!(
        out.contains("const f = (a, b, c) =>") && out.contains("$$props['overlay']"),
        "the instance script was dropped:\n{out}"
    );
}

/// Control against fixing this by recognising the one diagnostic that happens to
/// appear in the corpus. A return type on a constructor is a different OXC-only
/// error, and must strip just the same — including the `export let` whose
/// declared type otherwise ends up inside the prop *name*.
#[test]
fn a_different_oxc_only_diagnostic_also_strips() {
    let source = "<script lang=\"ts\">\n\texport let n: number = 0;\n\n\tclass C {\n\t\tconstructor(): void {}\n\t}\n</script>\n\n<p>{n}{C}</p>\n";
    let out = compile_to(source, GenerateMode::Client);
    assert_parses(&out);
    assert!(
        out.contains("$.prop($$props, 'n', 8, 0)"),
        "the declared type leaked into the prop name:\n{out}"
    );
}
