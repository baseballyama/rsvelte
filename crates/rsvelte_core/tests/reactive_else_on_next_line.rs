//! An `else` that starts its own line must stay attached to the `if` above it.
//!
//! The client instance-script line accumulator closes a statement as soon as the
//! braces balance. `$: if (cond) x = true` balances on its own line, so a
//! following `else …` line was emitted as a separate top-level statement — a bare
//! `else` in the component body, which is not parseable JavaScript. The existing
//! `next_continues` lookahead already handled `.`/`?`/`&&`/`||`; `else` belongs
//! there because no JavaScript statement may begin with it.
//!
//! The server path does not share this accumulator and was already correct, so it
//! is the control. The second control is an identifier that merely *starts with*
//! `else`: matching on the prefix rather than the keyword would glue two
//! unrelated statements together.

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

/// A line whose first token is `else` can only be legal as the tail of an `if`;
/// at statement position in the emitted body it is a syntax error.
fn assert_no_dangling_else(out: &str) {
    let dangling = out
        .lines()
        .find(|l| l.trim_start().starts_with("else ") && !l.contains("if (") || l.trim() == "else");
    // `} else {` is fine — it is preceded by the closing brace of the `if`.
    let dangling = dangling.filter(|l| !l.trim_start().starts_with('}'));
    assert!(
        dangling.is_none(),
        "an `else` was emitted at statement position ({}):\n{out}",
        dangling.unwrap_or("").trim()
    );
}

const BRACELESS: &str = "<script>\n\tlet a = 1;\n\tlet b = 0;\n\t$: if (a > 0) b = 1\n\telse b = 2\n</script>\n\n<p>{b}</p>\n";

#[test]
fn a_braceless_else_on_the_next_line_stays_with_its_if() {
    assert_no_dangling_else(&compile_to(BRACELESS, GenerateMode::Client));
}

#[test]
fn a_braced_else_on_its_own_line_stays_with_its_if() {
    let source = "<script>\n\tlet a = 1;\n\tlet b = 0;\n\t$: if (a > 0) {\n\t\tb = 1\n\t}\n\telse {\n\t\tb = 2\n\t}\n</script>\n\n<p>{b}</p>\n";
    assert_no_dangling_else(&compile_to(source, GenerateMode::Client));
}

/// Already correct before the fix: a change that reworked the accumulator and
/// regressed SSR could not pass.
#[test]
fn the_server_path_is_unaffected() {
    assert_no_dangling_else(&compile_to(BRACELESS, GenerateMode::Server));
}

/// The control a prefix match breaks: `elsewhere` is an identifier, so the two
/// statements must stay separate.
#[test]
fn an_identifier_beginning_with_else_is_not_a_continuation() {
    let source = "<script>\n\tlet a = 0;\n\tlet elsewhere = 0;\n\t$: a = 1\n\telsewhere = 2;\n</script>\n\n<p>{a}{elsewhere}</p>\n";
    let out = compile_to(source, GenerateMode::Client);
    assert!(
        !out.contains("a = 1\n\telsewhere") && !out.contains("a = 1 elsewhere"),
        "two unrelated statements were merged:\n{out}"
    );
}
