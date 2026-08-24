//! A comment written inside a template expression is carried into the output.
//!
//! Upstream hands every comment in the file to esrap as one source-ordered
//! list, so it flushes at whichever LOCATED node the printer reaches next. A
//! constant-folded tag leaves no node behind, which is why its comment lands on
//! the following expression rather than disappearing with it.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn code(source: &str, generate: GenerateMode, dev: bool) -> String {
    compile(
        source,
        CompileOptions {
            generate,
            dev,
            ..Default::default()
        },
    )
    .unwrap_or_else(|error| panic!("compile failed: {error:?}"))
    .js
    .code
}

const FOLDED_THEN_DYNAMIC: &str = "<script>\n\tlet n = $state(0);\n\tconst f = (x) => x + 1;\n</script>\n\n<div>\n\t{n /* b */}\n\t<span>{f(n)}</span>\n</div>\n";

#[test]
fn server_flushes_a_folded_tags_comment_onto_the_next_expression() {
    let output = code(FOLDED_THEN_DYNAMIC, GenerateMode::Server, false);

    assert!(
        output.contains("$.escape(\n\t\t/* b */\n\t\tf(n)\n\t)"),
        "the folded tag's comment must reach the next expression:\n{output}"
    );
}

#[test]
fn client_flushes_a_folded_tags_comment_onto_the_next_located_node() {
    for dev in [false, true] {
        let output = code(FOLDED_THEN_DYNAMIC, GenerateMode::Client, dev);

        assert!(
            output.contains("var /* b */\n\tspan = "),
            "dev={dev}: the folded tag's comment must reach the next anchored declaration:\n{output}"
        );
    }
}

/// The non-folded case is the same mechanism one step earlier: the comment
/// precedes the expression it was written in, so it flushes there.
#[test]
fn server_keeps_a_leading_comment_inside_the_expression() {
    let output = code(
        "<script>\n\tlet n = $state(0);\n\tconst f = (x) => x + 1;\n</script>\n\n<div>{/* q */ f(n)}</div>\n",
        GenerateMode::Server,
        false,
    );

    assert!(
        output.contains("$.escape(/* q */ f(n))"),
        "the comment must stay in front of the expression:\n{output}"
    );
}

/// Upstream's component block borrows the instance script's `loc`, so a
/// component with no `<script>` prints with a dead comment cursor and drops
/// every comment in the file. Carrying one there would be worse than dropping
/// it — it is output the official compiler does not produce.
#[test]
fn a_component_without_a_script_carries_no_comment() {
    for (generate, dev) in [
        (GenerateMode::Client, false),
        (GenerateMode::Client, true),
        (GenerateMode::Server, false),
    ] {
        let output = code("{(/* dead */ 42)}\n", generate, dev);
        assert!(
            !output.contains("/* dead */"),
            "{generate:?} dev={dev}: the cursor is dead without a script:\n{output}"
        );
    }
}

/// The same cursor is parked at the instance script's start, so a comment
/// written ahead of the `<script>` is skipped even though one written after it
/// is carried.
#[test]
fn a_comment_written_before_the_script_is_skipped() {
    let source = "<div>{(/* early */ 1)}{f(n)}</div>\n<script>\n\tlet n = $state(0);\n\tconst f = (x) => x + 1;\n</script>\n";
    for (generate, dev) in [
        (GenerateMode::Client, false),
        (GenerateMode::Client, true),
        (GenerateMode::Server, false),
    ] {
        let output = code(source, generate, dev);
        assert!(
            !output.contains("/* early */"),
            "{generate:?} dev={dev}: the cursor starts at the script:\n{output}"
        );
    }
}
