//! A `;` or `)` inside a comment is text, and a `)` the compiler generates must
//! not land inside one.
//!
//! The client reads a legacy `let` initializer with `find_statement_end_client`,
//! which hunted for `;` / `)` / `}` byte by byte without knowing comments. `let x
//! = a + // ; c` therefore ended the initializer at the `;` inside the comment
//! and emitted `$.mutable_source(a + //); c` — the generated paren spliced into
//! the comment body, the continuation line severed, and the module unparseable.
//!
//! The second half is the wrapper: even with the right expression, appending `)`
//! to text that ends inside a line comment hides it. Upstream breaks the line,
//! and so must this.
//!
//! The mutation-fuzz gate ranks `line-with-semi` at 21.5 divergences per 1,000
//! mutants against 0.0 for a plain `// c`, so these are the discriminating
//! inputs, not decoration. The real-world corpus contains none of them — 10,389
//! files are byte-identical across this change — which is why they need a test
//! of their own.

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

/// The comment sits mid-expression, so the continuation line is severed too.
const SEMI_MID: &str = "<script>\n  let x = a + // ; c\n    b\n  function go() { x = 2 }\n</script>\n\n<p on:click={go}>{x}</p>\n";

/// The comment trails the whole initializer, so only the generated `)` is at
/// stake.
const SEMI_TRAILING: &str = "<script>\n  let x = foo(1) // ; c\n  function go() { x = 2 }\n</script>\n\n<p on:click={go}>{x}</p>\n";

const PAREN_TRAILING: &str = "<script>\n  let y = foo(1) // ) c\n  function go() { y = 2 }\n</script>\n\n<p on:click={go}>{y}</p>\n";

#[test]
fn a_semicolon_in_a_comment_does_not_end_the_initializer() {
    let out = compile_to(SEMI_MID, GenerateMode::Client);
    assert!(
        out.contains("$.mutable_source(a + // ; c\n\tb);"),
        "the initializer ended at the `;` inside the comment:\n{out}"
    );
}

#[test]
fn the_generated_paren_starts_after_a_trailing_line_comment() {
    let out = compile_to(SEMI_TRAILING, GenerateMode::Client);
    assert!(
        out.contains("$.mutable_source(foo(1) // ; c\n"),
        "the generated `)` landed inside the comment:\n{out}"
    );
}

#[test]
fn a_closing_paren_in_a_comment_does_not_end_the_initializer() {
    let out = compile_to(PAREN_TRAILING, GenerateMode::Client);
    assert!(
        out.contains("$.mutable_source(foo(1) // ) c\n"),
        "the initializer ended at the `)` inside the comment:\n{out}"
    );
}

/// The server target never ran this scan; it drops the comment and keeps both
/// operands. That is the control: a fix that reached the server would move it.
#[test]
fn the_server_still_keeps_both_operands() {
    let out = compile_to(SEMI_MID, GenerateMode::Server);
    assert!(
        out.contains("let x = a + b;"),
        "the server initializer changed:\n{out}"
    );
}

/// A real `;` still ends the statement. "Skip every `;`" would pass the tests
/// above and merge the declaration with whatever follows it.
#[test]
fn a_real_semicolon_still_ends_the_initializer() {
    let source = "<script>\n  let x = foo(1); let z = 2;\n  function go() { x = 2 }\n</script>\n\n<p on:click={go}>{x}{z}</p>\n";
    let out = compile_to(source, GenerateMode::Client);
    assert!(
        out.contains("$.mutable_source(foo(1))"),
        "the initializer swallowed the next declaration:\n{out}"
    );
}
