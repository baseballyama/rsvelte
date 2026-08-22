//! `<textarea>` content is read by upstream's `read_sequence`, which decodes
//! character references with `is_attribute_value = true` — the same rule an
//! attribute value gets. rsvelte decoded it in *content* mode, so a
//! semicolon-less legacy name matched as a prefix of a longer word
//! (`&notreal;` → `¬real;`) where official leaves the `&` literal.
//!
//! The boundary rule itself was also short of upstream's: `\b` is JavaScript's,
//! so `_` is a word character, and `&amp_b` must stay literal in every
//! attribute-mode host — not only in a `<textarea>`.
//!
//! Every expectation here was read off the official compiler
//! (`submodules/svelte`) one input per process.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn server(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Server,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[track_caller]
fn assert_server_pushes(src: &str, expected: &str) {
    let code = server(src);
    assert!(
        code.contains(expected),
        "expected `{expected}` in\n{code}\nfor {src}"
    );
}

#[test]
fn textarea_keeps_a_semicolon_less_prefix_literal() {
    assert_server_pushes(
        "<textarea>a&notreal;b</textarea>",
        "`<textarea>a&amp;notreal;b</textarea>`",
    );
    assert_server_pushes(
        "<textarea>a&ampx;b</textarea>",
        "`<textarea>a&amp;ampx;b</textarea>`",
    );
    assert_server_pushes(
        "<textarea>a&ampb</textarea>",
        "`<textarea>a&amp;ampb</textarea>`",
    );
}

#[test]
fn textarea_still_decodes_what_the_boundary_rule_admits() {
    // Controls: a real entity with its semicolon, and a legacy name followed by
    // a non-word character, both decode exactly as before.
    assert_server_pushes(
        "<textarea>a&not;b</textarea>",
        "`<textarea>a\u{ac}b</textarea>`",
    );
    assert_server_pushes(
        "<textarea>a&not b</textarea>",
        "`<textarea>a\u{ac} b</textarea>`",
    );
    // A numeric reference has no `\b` guard in upstream's pattern, in either mode.
    assert_server_pushes("<textarea>a&#65b</textarea>", "`<textarea>aAb</textarea>`");
}

#[test]
fn the_content_mode_hosts_are_unchanged() {
    // The axis is `<textarea>`, not the payload: every ordinary host keeps
    // content-mode decoding, where a legacy prefix does match.
    assert_server_pushes("<div>a&notreal;b</div>", "`<div>a\u{ac}real;b</div>`");
    assert_server_pushes("<pre>a&notreal;b</pre>", "`<pre>a\u{ac}real;b</pre>`");
}

#[test]
fn underscore_closes_the_word_boundary_in_attribute_mode() {
    assert_server_pushes(
        "<div title=\"a&amp_b\">x</div>",
        "`<div title=\"a&amp;amp_b\">x</div>`",
    );
    assert_server_pushes(
        "<textarea>a&amp_b</textarea>",
        "`<textarea>a&amp;amp_b</textarea>`",
    );
    // Control: content mode has no boundary rule, so the same payload decodes.
    assert_server_pushes("<div>a&amp_b</div>", "`<div>a&amp;_b</div>`");
}

#[test]
fn the_client_template_keeps_the_raw_text() {
    // `raw` is what the client template carries, so it never showed the defect —
    // pinned so a fix to `data` cannot start rewriting it.
    assert!(
        client("<textarea>a&notreal;b</textarea>").contains("`<textarea>a&notreal;b</textarea>`")
    );
}

#[test]
fn a_dynamic_textarea_value_uses_the_decoded_data() {
    // With an expression tag present the content becomes a `value` attribute, so
    // `data` — not `raw` — reaches both targets.
    assert!(
        client("<textarea>a&notreal;b{1}</textarea>").contains("'a&notreal;b1'"),
        "{}",
        client("<textarea>a&notreal;b{1}</textarea>")
    );
    assert!(
        server("<textarea>a&notreal;b{1}</textarea>").contains("'a&notreal;b1'"),
        "{}",
        server("<textarea>a&notreal;b{1}</textarea>")
    );
}
