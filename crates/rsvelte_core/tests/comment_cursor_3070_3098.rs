//! Remaining comment-cursor rows from #3070 and #3098.
//!
//! Every expected fragment below was measured against the pinned official
//! compiler.  These are placement assertions, not merely retention checks: a
//! comment in a generated sibling call is still a mismatch even when the text
//! happens to survive somewhere in the output.

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
        &format!(
            "<script>\n\tlet v = $state(1);\n\tconst s = (x) => x;\n</script>\n\n{template}\n"
        ),
        GenerateMode::Client,
        dev,
    )
}

fn server(template: &str) -> String {
    compile_to(
        &format!(
            "<script>\n\tlet v = $state(1);\n\tconst s = (x) => x;\n</script>\n\n{template}\n"
        ),
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
fn client_expression_tag_comment_uses_the_generated_append_slot() {
    for dev in [false, true] {
        assert_has(
            &client("<p>{/* c */ v}</p>", dev),
            "$.append($$anchor, p /* c */);",
        );
    }
}

#[test]
fn client_each_collection_comment_stays_in_the_collection_thunk() {
    for dev in [false, true] {
        assert_has(
            &client("{#each [/* c */ v] as i}<p>{i}</p>{/each}", dev),
            "() => [/* c */ v]",
        );
    }
}

#[test]
fn client_const_initializer_comment_reaches_the_generated_callback_parameter() {
    for dev in [false, true] {
        let output = client(
            "{#each [1] as i}{@const c = /* c */ v * i}<p>{c}</p>{/each}",
            dev,
        );
        assert_has(&output, "i /* c */) => {");
    }
}

#[test]
fn client_event_arrow_comment_stays_with_the_rewritten_update() {
    for dev in [false, true] {
        assert_has(
            &client("<button onclick={() => /* c */ v++}>x</button>", dev),
            "() => $.update(/* c */ v)",
        );
    }
}

#[test]
fn client_html_comment_reaches_the_generated_thunk_parameter() {
    for dev in [false, true] {
        assert_has(
            &client("{@html /* c */ v}", dev),
            "$.html(node, (/* c */) => v);",
        );
    }
}

#[test]
fn client_key_comment_reaches_the_generated_thunk_parameter() {
    for dev in [false, true] {
        assert_has(
            &client("{#key /* c */ v}<p>x</p>{/key}", dev),
            "$.key(node, (/* c */) => v,",
        );
    }
}

#[test]
fn client_render_argument_comment_reaches_the_generated_thunk_parameter() {
    for dev in [false, true] {
        assert_has(
            &client("{@render s(/* c */ v)}", dev),
            "s($$anchor, (/* c */) => v)",
        );
    }
}

#[test]
fn server_if_comment_stays_with_the_test() {
    assert_has(&server("{#if /* c */ v}<p>x</p>{/if}"), "if (/* c */ v) {");
}

#[test]
fn server_each_comment_stays_with_the_collection() {
    assert_has(
        &server("{#each [/* c */ v] as i}<p>{i}</p>{/each}"),
        "$.ensure_array_like([/* c */ v])",
    );
}

#[test]
fn server_const_comment_follows_the_official_cursor_slot() {
    assert_has(
        &server("{#each [1] as i}{@const c = /* c */ v * i}<p>{c}</p>{/each}"),
        "$.ensure_array_like([1] /* c */)",
    );
}

#[test]
fn server_html_comment_stays_with_the_argument() {
    assert_has(&server("{@html /* c */ v}"), "$.html(/* c */ v)");
}

#[test]
fn server_render_comment_stays_with_the_argument() {
    assert_has(
        &server("{@render s(/* c */ v)}"),
        "s($$renderer, /* c */ v);",
    );
}

#[test]
fn server_rune_declaration_keeps_a_comment_before_the_binding_name() {
    let output = compile_to(
        "<script>\n\tlet /* c */ x = $state(2);\n</script>\n\n<p>{x}</p>\n",
        GenerateMode::Server,
        false,
    );
    assert_has(&output, "let /* c */ x = 2;");
}
