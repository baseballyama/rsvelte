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
fn server_await_header_comments_stay_with_the_promise_expression() {
    assert_has(
        &server("{#await /* leading */ pending then value}{value}{/await}"),
        "$.await($$renderer, /* leading */ pending,",
    );
    assert_has(
        &server("{#await pending /* trailing */ then value}{value}{/await}"),
        "$.await($$renderer, pending /* trailing */,",
    );
}

#[test]
fn client_snippet_parameter_comment_precedes_the_generated_pattern() {
    for dev in [false, true] {
        assert_has(
            &client(
                "{#snippet body(/* parameter */ value)}{value}{/snippet}\n{@render body(pending)}",
                dev,
            ),
            "$$anchor, /* parameter */ value = $.noop",
        );
    }
}

#[test]
fn server_snippet_parameter_comment_precedes_the_original_pattern() {
    assert_has(
        &server("{#snippet body(/* parameter */ value)}{value}{/snippet}\n{@render body(pending)}"),
        "function body($$renderer, /* parameter */ value) {",
    );
}
