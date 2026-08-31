//! A comment inside an `import` declaration's own span belongs to the instance
//! body, not to the hoisted import.
//!
//! The client hoists instance imports by lifting whole source lines, so a
//! comment written inside a declaration was carried out with it — and the
//! module-scope printer never emits it, so it vanished from the output.
//! Upstream removes the declaration node instead, and esrap's cursor flushes
//! the comment onto the next located statement INSIDE the component function.
//!
//! The boundary is sharp and is what identifies the span rather than imports in
//! general: a comment LEADING, TRAILING or BETWEEN imports is already routed to
//! the body by the line scan and was never affected. The server was correct
//! throughout, so this is one more two-ports divergence.
//!
//! Measured against the official compiler (5.56.10) on 32 cells before the fix:
//! 14 client cells diverged, 14 server cells and 4 boundary controls matched.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn out(source: &str, generate: GenerateMode, dev: bool) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate,
            dev,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

fn wrap(imports: &str) -> String {
    format!("<script>\n{imports}\n  const e = a(b);\n</script>\n<p>{{e}}</p>\n")
}

#[track_caller]
fn keeps(imports: &str, comment: &str, what: &str) {
    let source = wrap(imports);
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        for dev in [false, true] {
            let code = out(&source, generate, dev);
            assert!(
                code.contains(comment),
                "{what}: {comment} was dropped in {generate:?} dev={dev}:\n{code}"
            );
        }
    }
}

#[test]
fn a_comment_on_the_same_line_as_the_specifiers_survives() {
    keeps(
        "  import { a, /* c1 */ b } from 'm';",
        "/* c1 */",
        "same line",
    );
}

#[test]
fn a_comment_on_its_own_line_between_specifiers_survives() {
    keeps(
        "  import {\n    a,\n    /* c1 */\n    b,\n  } from 'm';",
        "/* c1 */",
        "own line",
    );
}

#[test]
fn a_line_comment_between_specifiers_survives() {
    keeps(
        "  import {\n    a,\n    // c1\n    b,\n  } from 'm';",
        "// c1",
        "line comment",
    );
}

#[test]
fn a_comment_before_the_closing_brace_survives() {
    keeps(
        "  import {\n    a,\n    b,\n    /* c1 */\n  } from 'm';",
        "/* c1 */",
        "before the brace",
    );
}

#[test]
fn a_comment_after_the_from_keyword_survives() {
    keeps(
        "  import {\n    a,\n    b,\n  } /* c1 */ from 'm';",
        "/* c1 */",
        "after `from`",
    );
}

#[test]
fn both_comments_of_two_imports_survive() {
    let source = wrap(
        "  import {\n    a,\n    /* c1 */\n    b,\n  } from 'm';\n  import {\n    z,\n    /* c2 */\n  } from 'n';",
    );
    let code = out(&source, GenerateMode::Client, false);
    let first = code.find("/* c1 */").expect("c1 is kept");
    let second = code.find("/* c2 */").expect("c2 is kept");
    assert!(first < second, "the two keep source order:\n{code}");
}

#[test]
fn a_comment_stays_at_its_own_imports_position() {
    // Upstream flushes each comment onto the next located statement, so one in
    // an import that follows a statement lands AFTER that statement — a plain
    // "collect them all at the top" rule gets this cell wrong.
    let source = "<script>\n  import { p, /* c0 */ q } from 'z';\n  const first = 1;\n  import { a, /* c1 */ b } from 'm';\n  const e = a(b, first, p, q);\n</script>\n<p>{e}</p>\n";
    let code = out(source, GenerateMode::Client, false);
    let c0 = code.find("/* c0 */").expect("c0 is kept");
    let first = code
        .find("const first = 1")
        .expect("the statement is emitted");
    let c1 = code.find("/* c1 */").expect("c1 is kept");
    assert!(c0 < first, "c0 precedes its following statement:\n{code}");
    assert!(
        first < c1,
        "c1 follows the statement it comes after:\n{code}"
    );
}

#[test]
fn a_leading_comment_is_unaffected() {
    // CONTROL: never reached the import span, and matched before the fix.
    keeps(
        "  // Icons\n  import { a, b } from 'm';",
        "// Icons",
        "leading",
    );
}

#[test]
fn a_trailing_comment_is_unaffected() {
    // CONTROL: routed to the body as the line's remainder, not as a span comment.
    keeps("  import { a, b } from 'm'; // tail", "// tail", "trailing");
}

#[test]
fn a_comment_between_two_imports_is_unaffected() {
    // CONTROL: its own line, so the line scan never treats it as import text.
    keeps(
        "  import { a } from 'm';\n  /* between */\n  import { b } from 'n';",
        "/* between */",
        "between",
    );
}

#[test]
fn a_comment_is_not_duplicated() {
    // The hoisted import text still carries the comment; emitting it in the
    // body as well must not print it twice.
    let source = wrap("  import {\n    a,\n    /* c1 */\n    b,\n  } from 'm';");
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let code = out(&source, generate, false);
        assert_eq!(
            code.matches("/* c1 */").count(),
            1,
            "{generate:?} printed the comment more than once:\n{code}"
        );
    }
}
