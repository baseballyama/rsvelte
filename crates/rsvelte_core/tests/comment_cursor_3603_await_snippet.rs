//! Comment-cursor rows for await headers and snippet parameters from #3603.
//!
//! These expected fragments were measured against the pinned official
//! compiler. They pin the comment's generated slot, not merely its survival.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_to(source: &str, generate: GenerateMode, dev: bool) -> String {
    compile(
        source,
        CompileOptions {
            generate,
            dev,
            filename: Some("CommentCursor.svelte".to_string()),
            ..Default::default()
        },
    )
    .expect("component should compile")
    .js
    .code
}

fn client(template: &str, dev: bool) -> String {
    compile_to(
        &format!("<script>\n\tlet pending = Promise.resolve(1);\n</script>\n\n{template}\n"),
        GenerateMode::Client,
        dev,
    )
}

fn server(template: &str) -> String {
    compile_to(
        &format!("<script>\n\tlet pending = Promise.resolve(1);\n</script>\n\n{template}\n"),
        GenerateMode::Server,
        false,
    )
}

#[track_caller]
fn assert_has(output: &str, expected: &str) {
    assert!(
        output.contains(expected),
        "expected to find\n  {expected}\nin:\n{output}"
    );
}

#[test]
fn client_await_header_comments_stay_with_the_promise_expression() {
    for dev in [false, true] {
        assert_has(
            &client(
                "{#await /* leading */ pending then value}{value}{/await}",
                dev,
            ),
            "() => /* leading */ pending",
        );
        assert_has(
            &client(
                "{#await pending /* trailing */ then value}{value}{/await}",
                dev,
            ),
            "() => pending /* trailing */",
        );
    }
}

#[test]
fn client_instance_script_tail_comments_stay_with_the_await_promise_thunk() {
    for dev in [false, true] {
        let block = compile_to(
            "<script>\n\tlet p = $state(Promise.resolve(1));\n\t/* tail */\n</script>\n\n{#await p}<p>pending</p>{/await}",
            GenerateMode::Client,
            dev,
        );
        // The flush ends the line, so the closing paren's indent is mode
        // dependent; assert the slot instead of one spelling of it.
        let tail = block
            .find("(/* tail */")
            .expect("the comment should open the promise thunk's parameter list");
        let promise_end = block[tail..]
            .find(") => p")
            .map(|offset| tail + offset)
            .expect("block comment should be inside the promise thunk parameters");
        let pending = block[promise_end..]
            .find("$$anchor")
            .map(|offset| promise_end + offset)
            .expect("pending callback should follow the promise thunk");
        assert!(
            tail < promise_end && promise_end < pending,
            "the block comment drifted into the pending callback:\n{block}"
        );

        let line = compile_to(
            "<script>\n\tlet p = $state(Promise.resolve(1));\n\t// tail\n</script>\n\n{#await p}<p>pending</p>{/await}",
            GenerateMode::Client,
            dev,
        );
        let tail = line.find("// tail").expect("tail comment should survive");
        let promise_end = line[tail..]
            .find(") => p")
            .map(|offset| tail + offset)
            .expect("line comment should be inside the promise thunk parameters");
        let pending = line[promise_end..]
            .find("$$anchor")
            .map(|offset| promise_end + offset)
            .expect("pending callback should follow the promise thunk");
        assert!(
            tail < promise_end && promise_end < pending,
            "wrong slot:\n{line}"
        );
    }
}

#[test]
fn server_await_header_comments_stay_with_the_promise_expression() {
    assert_has(
        &server("{#await /* leading */ pending then value}{value}{/await}"),
        "$.await($$renderer, /* leading */ pending,",
    );
    // The server prints the promise verbatim and the pending branch as a
    // builder-made `() => {}`, so a comment written after the promise flushes
    // ahead of that argument rather than trailing the expression.
    assert_has(
        &server("{#await pending /* trailing */ then value}{value}{/await}"),
        "$.await($$renderer, pending, /* trailing */ () => {},",
    );
}

/// Measured against the pinned compiler: the comment does NOT stay in the
/// snippet's parameter list — the snippet's own body is builder-made, so the
/// cursor dies there and the component block (whose `loc` upstream borrows from
/// the instance script) revives it for the render tag.
///
/// Ignored: rsvelte drops it instead. Its comment buffer has no position for a
/// template node ahead of the render tag, so reaching this needs a component-
/// wide cursor rather than the per-region anchors the client uses today.
#[test]
#[ignore = "rsvelte drops the snippet-header comment; needs a component-wide template cursor"]
fn client_snippet_parameter_comment_precedes_the_generated_pattern() {
    assert_has(
        &client(
            "{#snippet body(/* parameter */ value)}{value}{/snippet}\n{@render body(pending)}",
            false,
        ),
        "/* parameter */\n\tbody($$anchor, () => pending);",
    );
    assert_has(
        &client(
            "{#snippet body(/* parameter */ value)}{value}{/snippet}\n{@render body(pending)}",
            true,
        ),
        "() => /* parameter */\n\t\tbody($$anchor, () => pending),",
    );
}

/// The server half of the same measurement, and the same gap.
#[test]
#[ignore = "rsvelte drops the snippet-header comment; needs a component-wide template cursor"]
fn server_snippet_parameter_comment_precedes_the_original_pattern() {
    assert_has(
        &server("{#snippet body(/* parameter */ value)}{value}{/snippet}\n{@render body(pending)}"),
        "/* parameter */\n\tbody($$renderer, pending);",
    );
}
