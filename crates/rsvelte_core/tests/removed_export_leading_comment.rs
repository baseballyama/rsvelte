//! A specifier-only `export { … }` in an instance script IS the prop
//! declaration: it never reaches the output, so upstream's cursor finds no node
//! there and a comment written before it is still pending when the cursor
//! reaches the next statement. If that statement is a SPLIT declaration — which
//! upstream rebuilds, so the comments flush at the first located node inside it
//! — both comments print after the `let`.
//!
//! The backward walk in `declaration_split` required only whitespace between a
//! comment and the declaration, so it stopped at the removed statement and left
//! that comment outside the keyword.
//!
//! Every expectation below is the official compiler's bytes (5.56.10).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(script: &str, markup: &str) -> String {
    compile(
        &format!("<script>\n{script}\n</script>\n\n{markup}\n"),
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn a_comment_before_a_removed_export_reaches_the_next_declaration() {
    let out = client(
        "\tlet p1, p2;\n\n\t// A\n\texport { p1 }\n\n\t// B\n\tlet v1, v2;",
        "{p1}{v1}{v2}",
    );
    assert!(out.contains("\tlet // A\n\t// B\n\tv1;"), "{out}");
}

/// Two removed statements in a row: the run crosses both, so the rule is not
/// "cross one node".
#[test]
fn the_run_crosses_every_removed_statement_in_its_way() {
    let out = client(
        "\tlet p1, p2, p3;\n\n\t// A\n\texport { p1 }\n\t// A2\n\texport { p2 }\n\n\t// B\n\tlet v1, v2;",
        "{p1}{p2}{v1}{v2}",
    );
    assert!(out.contains("\tlet // A\n\t// A2\n\t// B\n\tv1;"), "{out}");
}

/// CONTROL — a statement that SURVIVES stops the run, which is what separates
/// this rule from "walk back over anything".
#[test]
fn a_surviving_statement_still_stops_the_run() {
    let out = client(
        "\tlet p1, p2;\n\n\t// A\n\tp2 = 1;\n\n\t// B\n\tlet v1, v2;",
        "{p1}{p2}{v1}{v2}",
    );
    assert!(out.contains("\t// A\n\t$.set(p2, 1);"), "{out}");
    assert!(out.contains("\tlet // B\n\tv1;"), "{out}");
}

/// CONTROL — a removed export with no comment before it. The adjacent comment
/// must be unaffected, so a fix that swallows extra text is visible.
#[test]
fn a_removed_export_with_no_comment_changes_nothing() {
    let out = client(
        "\tlet p1, p2;\n\n\texport { p1 }\n\n\t// B\n\tlet v1, v2;",
        "{p1}{v1}{v2}",
    );
    assert!(out.contains("\tlet // B\n\tv1;"), "{out}");
    assert_eq!(out.matches("// B").count(), 1, "{out}");
}
