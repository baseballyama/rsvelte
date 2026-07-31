//! Regression tests for issue #1975 — the whitespace run around two adjacent
//! removed HTML comments collapsed to one space (`</header> <button`) instead of
//! the two the official compiler emits (`</header>  <button`), but only when the
//! comments' parent element was itself nested.
//!
//! Root cause: the client static-template builder
//! (`push_static_element_to_template_inner`) re-implemented `clean_nodes`'
//! whitespace rules with a "merge text nodes separated by removed comments"
//! pre-pass plus positional first/last trimming. Upstream instead keeps every
//! text node in the list and decides each node's leading run from the *previous*
//! node's already-rewritten data: the middle text is emptied (its prev ends with
//! whitespace) but stays in the chain, so the following text no longer sees a
//! whitespace-ending prev and contributes its own space. Nesting mattered because
//! only a nested element goes through the static builder; the fragment's root
//! element is emitted by the regular-element visitor, which uses the shared
//! `clean_nodes` and was already correct.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn template(src: &str, preserve_comments: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            preserve_comments,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn assert_template(src: &str, expected: &str) {
    let out = template(src, false);
    assert!(
        out.contains(expected),
        "expected template to contain:\n{expected}\ngot:\n{out}"
    );
}

/// `<outer><div>…</div></outer>`: the `<div>` is emitted by the static-template
/// builder. Upstream keeps two spaces.
#[test]
fn two_adjacent_comments_keep_two_spaces_when_nested() {
    let src = "<outer>\n\t<div>\n\t\t<header>h</header>\n\t\t<!-- a -->\n\t\t<!-- b -->\n\t\t<button>b</button>\n\t</div>\n</outer>\n";
    assert_template(
        src,
        "<outer><div><header>h</header>  <button>b</button></div></outer>",
    );
    let out = template(src, false);
    assert!(
        !out.contains("</header> <button>"),
        "the run must not collapse to a single space, got:\n{out}"
    );
}

/// Control: the same markup with `<div>` as the fragment's root element already
/// matched upstream (it goes through the regular-element visitor).
#[test]
fn two_adjacent_comments_keep_two_spaces_at_root() {
    assert_template(
        "<div>\n\t<header>h</header>\n\t<!-- a -->\n\t<!-- b -->\n\t<button>b</button>\n</div>\n",
        "<div><header>h</header>  <button>b</button></div>",
    );
}

/// One comment leaves two text nodes: the second is emptied, so a single space
/// survives.
#[test]
fn single_comment_collapses_to_one_space_when_nested() {
    assert_template(
        "<outer>\n\t<div>\n\t\t<header>h</header>\n\t\t<!-- a -->\n\t\t<button>b</button>\n\t</div>\n</outer>\n",
        "<outer><div><header>h</header> <button>b</button></div></outer>",
    );
}

/// Three comments leave four text nodes, alternating space / empty — still two
/// spaces, not three.
#[test]
fn three_adjacent_comments_keep_two_spaces_when_nested() {
    let src = "<outer>\n\t<div>\n\t\t<header>h</header>\n\t\t<!-- a -->\n\t\t<!-- b -->\n\t\t<!-- c -->\n\t\t<button>b</button>\n\t</div>\n</outer>\n";
    assert_template(
        src,
        "<outer><div><header>h</header>  <button>b</button></div></outer>",
    );
    let out = template(src, false);
    assert!(
        !out.contains("</header>   <button>"),
        "the run must not grow to three spaces, got:\n{out}"
    );
}

/// Text on both sides of a removed comment: the merge pre-pass used to fuse the
/// two text nodes and keep their raw indentation verbatim.
#[test]
fn text_around_single_comment_collapses_to_one_space() {
    assert_template(
        "<outer>\n\t<div>\n\t\ttext\n\t\t<!-- a -->\n\t\tmore\n\t</div>\n</outer>\n",
        "<outer><div>text more</div></outer>",
    );
}

#[test]
fn text_around_two_comments_keeps_two_spaces() {
    assert_template(
        "<outer>\n\t<div>\n\t\ttext\n\t\t<!-- a -->\n\t\t<!-- b -->\n\t\tmore\n\t</div>\n</outer>\n",
        "<outer><div>text  more</div></outer>",
    );
}

#[test]
fn inline_text_and_comments_collapse_to_one_space() {
    assert_template(
        "<outer>\n\t<div>\n\t\tx<!-- a -->  <!-- b -->  y\n\t</div>\n</outer>\n",
        "<outer><div>x y</div></outer>",
    );
}

/// With `preserveComments`, the comments stay in the list as non-text nodes, so
/// every whitespace run keeps exactly one space.
#[test]
fn preserved_comments_keep_single_spaces() {
    let out = template(
        "<outer>\n\t<div>\n\t\t<header>h</header>\n\t\t<!-- a -->\n\t\t<!-- b -->\n\t\t<button>b</button>\n\t</div>\n</outer>\n",
        true,
    );
    assert!(
        out.contains(
            "<outer><div><header>h</header> <!-- a --> <!-- b --> <button>b</button></div></outer>"
        ),
        "got:\n{out}"
    );
}
