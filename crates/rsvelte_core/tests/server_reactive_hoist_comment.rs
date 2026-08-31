//! The hoisted `let p, q;` that legacy `$:` declarations build is printed FIRST,
//! so each declarator is the flush point for every comment written before its
//! source position. Its anchor therefore has to be registered AFTER the
//! declaring statement's own leading comments are in the buffer — taken at
//! collection time it sorts ahead of them, and the comment leading `$: p = …`
//! printed before `q` instead of before `p`.
//!
//! Every expectation below is the official compiler's bytes (5.56.10).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn server(body: &str) -> String {
    compile(
        body,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The discriminating row: two declaring `$:` statements, each with its own
/// leading comment. Each comment belongs to the declarator its statement
/// declares, so one misplaced anchor shifts a comment by exactly one name.
#[test]
fn each_comment_lands_on_the_name_its_statement_declares() {
    let out = server(
        "<script>\n\texport let x;\n\n\t// B\n\t$: p = x + 1;\n\t// C\n\t$: q = p + 1;\n</script>\n\n{p}{q}\n",
    );
    assert!(
        out.contains("\tlet // B\n\t\tp,\n\t\t// C\n\t\tq;"),
        "{out}"
    );
}

/// A `$:` that declares nothing takes no anchor of its own, so its comment
/// reaches the hoist through the FIRST declarator's anchor rather than getting
/// one per statement — and upstream then prints it a second time at the
/// statement, which rsvelte reproduces byte for byte.
#[test]
fn a_statement_that_declares_nothing_flushes_at_the_first_name() {
    let out = server(
        "<script>\n\texport let x;\n\n\t// A\n\t$: if (x) {\n\t\tx = 1;\n\t}\n\n\t// B\n\t$: p = x + 1;\n\t$: q = p + 1;\n</script>\n\n{p}{q}\n",
    );
    assert!(
        out.contains("\tlet // A\n\t\t// B\n\t\tp,\n\t\tq;"),
        "{out}"
    );
    assert!(out.contains("\t$: // B\n\tp = x + 1;"), "{out}");
}

/// One declarator is not split across lines, so the comment sits between the
/// keyword and the only name.
#[test]
fn a_single_declaring_statement_puts_its_comment_on_the_only_name() {
    let out = server("<script>\n\texport let x;\n\n\t// B\n\t$: p = x + 1;\n</script>\n\n{p}\n");
    assert!(out.contains("\tlet // B\n\tp;"), "{out}");
}

/// The hoist is printed before the whole body, so it absorbs a comment leading
/// an ORDINARY statement too. That is the rule's reach, not a bug — and it is
/// why "move the anchor later" has to be bounded by the statement, not by the
/// comment's own kind. This row already passed before the anchor moved, so it
/// is a boundary control and not evidence for the fix; the three rows above are.
#[test]
fn the_hoist_also_absorbs_a_plain_statements_comment() {
    let out = server(
        "<script>\n\texport let x;\n\n\t// A\n\tlet y = 1;\n\t$: p = x + y;\n</script>\n\n{p}\n",
    );
    assert!(out.contains("\tlet // A\n\tp;"), "{out}");
    assert!(out.contains("\tlet y = 1;"), "{out}");
}

/// CONTROL — no comments. The hoist collapses onto one line, so a fix that
/// repairs the rows above by disturbing the declarator layout is visible.
#[test]
fn an_uncommented_hoist_is_unchanged() {
    let out = server(
        "<script>\n\texport let x;\n\n\t$: p = x + 1;\n\t$: q = p + 1;\n</script>\n\n{p}{q}\n",
    );
    assert!(out.contains("\tlet p, q;\n"), "{out}");
}
