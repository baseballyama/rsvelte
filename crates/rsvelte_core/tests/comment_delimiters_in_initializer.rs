//! A `;` or `)` inside a comment must not truncate the surrounding initializer.
//!
//! The client reads a legacy `let` initializer with `find_statement_end_client`,
//! which hunted for `;` / `)` / `}` byte by byte without knowing comments. `let x
//! = a + // ; c` therefore ended the initializer at the `;` inside the comment
//! and emitted `$.mutable_source(a + //); c` — the generated paren spliced into
//! the comment body, the continuation line severed, and the module unparseable.
//!
//! The mutation-fuzz gate ranks `line-with-semi` at 21.5 divergences per 1,000
//! mutants against 0.0 for a plain `// c`, so these are the discriminating
//! inputs, not decoration. The real-world corpus contains none of them — 10,389
//! files are byte-identical across this change — which is why they need a test
//! of their own.
//!
//! `oxc_codegen` currently emits normal comments only at statement boundaries,
//! so these assertions pin the initializer semantics rather than interior
//! comment layout.

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
        out.contains("$.mutable_source(a + b);"),
        "the initializer ended at the `;` inside the comment:\n{out}"
    );
}

#[test]
fn the_generated_paren_starts_after_a_trailing_line_comment() {
    let out = compile_to(SEMI_TRAILING, GenerateMode::Client);
    assert!(
        out.contains("$.mutable_source(foo(1));"),
        "the generated `)` landed inside the comment:\n{out}"
    );
}

#[test]
fn a_closing_paren_in_a_comment_does_not_end_the_initializer() {
    let out = compile_to(PAREN_TRAILING, GenerateMode::Client);
    assert!(
        out.contains("$.mutable_source(foo(1));"),
        "the initializer ended at the `)` inside the comment:\n{out}"
    );
}

/// The server target never ran this scan, so it must keep both operands
/// whatever the client does.
#[test]
fn the_server_keeps_both_operands_and_the_comment() {
    let out = compile_to(SEMI_MID, GenerateMode::Server);
    assert!(
        out.contains("let x = a + b;"),
        "the server initializer changed:\n{out}"
    );
}

#[test]
fn server_keeps_same_line_trailing_declaration_comments() {
    let cases = [
        (
            "<script>\n\tlet a = foo(1) // call\n\tlet b = 2;\n</script>",
            "let a = foo(1); // call\n\tlet b = 2;",
        ),
        (
            "<script>\n\tlet a = 1 /* literal */\n\tlet b = 2;\n</script>",
            "let a = 1; /* literal */\n\tlet b = 2;",
        ),
        (
            "<script>\n\tlet a = $state(1) // rune\n\tlet b = 2;\n</script>",
            "let a = 1; // rune\n\tlet b = 2;",
        ),
        (
            "<script>\n\tlet a = 1 /* first */ // second\n\tlet b = 2;\n</script>",
            "let a = 1; /* first */ // second\n\tlet b = 2;",
        ),
        (
            "<script>\n\tlet a = foo(1) // last\n</script>",
            "let a = foo(1); // last",
        ),
    ];

    for (source, expected) in cases {
        let out = compile_to(source, GenerateMode::Server);
        assert!(
            out.contains(expected),
            "the trailing declaration comment moved:\n{out}"
        );
    }
}

#[test]
fn server_keeps_a_removed_statement_comment_with_its_successor() {
    let source = "<script>\n\t$effect(() => {}) // removed\n\tlet b = 2;\n</script>";
    let out = compile_to(source, GenerateMode::Server);
    assert!(
        out.contains("// removed\n\t\tlet b = 2;"),
        "the removed-statement comment did not remain with its successor:\n{out}"
    );
}

/// These cover the bracket kinds whose interior delimiters must remain intact.
const OBJECT_INIT: &str = "<script>\n\tlet data = {\n\t\t/* c */\n\t\ta: 1\n\t};\n\tfunction go() { data = { a: 2 }; }\n</script>\n\n<p on:click={go}>{data.a}</p>\n";

const ARRAY_INIT: &str = "<script>\n\tlet items = [\n\t\t/* ) c */\n\t\t1\n\t];\n\tfunction go() { items = [2]; }\n</script>\n\n<p on:click={go}>{items[0]}</p>\n";

const CALL_ARGS: &str = "<script>\n\tlet v = foo(\n\t\t/* ) c */\n\t\t1\n\t);\n\tfunction go() { v = 2; }\n</script>\n\n<p on:click={go}>{v}</p>\n";

#[test]
fn an_object_initializer_with_a_comment_survives_the_server() {
    let out = compile_to(OBJECT_INIT, GenerateMode::Server);
    assert!(
        out.contains("a: 1"),
        "the object initializer lost its comment or its layout:\n{out}"
    );
}

#[test]
fn an_array_initializer_with_a_comment_survives_the_server() {
    let out = compile_to(ARRAY_INIT, GenerateMode::Server);
    assert!(
        out.contains("let items = [1];"),
        "the array initializer lost its comment or its layout:\n{out}"
    );
}

#[test]
fn a_call_initializer_with_a_comment_survives_the_server() {
    let out = compile_to(CALL_ARGS, GenerateMode::Server);
    assert!(
        out.contains("foo(") && out.contains("1"),
        "the call argument list lost its comment or its layout:\n{out}"
    );
}

/// Control: a comment interior to a statement BODY already survived, and a
/// whole-statement re-parse of a DECLARATION must not disturb it.
#[test]
fn a_comment_inside_an_if_block_still_survives_the_server() {
    let source = "<script>\n\tlet a = 1;\n\tlet b = 0;\n\tif (a) {\n\t\t/* inner */\n\t\tb = 1;\n\t}\n</script>\n{b}\n";
    let out = compile_to(source, GenerateMode::Server);
    assert!(
        out.contains("if (a) {\n\t\t/* inner */\n\t\tb = 1;\n\t}"),
        "the if-block comment moved:\n{out}"
    );
}

/// Control: a declaration the server must NOT keep verbatim. `export let x` is
/// prop-lowered to `$$props['x']`, so the whole-statement re-parse cannot apply
/// — a guard that let it through would emit the source declaration unchanged.
#[test]
fn an_exported_prop_is_still_prop_lowered() {
    let source = "<script>\n\texport let x = {\n\t\t/* c */\n\t\ta: 1\n\t};\n</script>\n{x.a}\n";
    let out = compile_to(source, GenerateMode::Server);
    assert!(
        out.contains("$$props['x']"),
        "the prop was emitted as a plain declaration:\n{out}"
    );
}

/// Control: a multi-declarator declaration is still SPLIT into one statement
/// per declarator, which a whole-statement re-parse would undo.
#[test]
fn a_multi_declarator_declaration_is_still_split() {
    let source = "<script>\n\tlet a = 1, b = 2;\n\tfunction go() { a = 3; b = 4; }\n</script>\n\n<p on:click={go}>{a}{b}</p>\n";
    let out = compile_to(source, GenerateMode::Server);
    assert!(
        out.contains("let a = 1;\n\tlet b = 2;"),
        "the declarators were not split:\n{out}"
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
