//! Client: comments written inside an attribute expression's `{ … }`.
//!
//! Upstream prints the whole client output against ONE esrap cursor over the
//! `.svelte` source, so where such a comment lands is decided by source line and
//! column — `fragment.js` gives the element identifier the TAG NAME's location,
//! and esrap's argument loop writes a trailing comment when the comment shares
//! that line. Moving the start tag one line up therefore moves the comment from
//! before the name literal to before the value. Every expected string here was
//! read off the official compiler (Svelte 5.56.10), not written by hand.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            generate: GenerateMode::Client,
            dev,
            filename: Some("T.svelte".to_string()),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const SCRIPT: &str = "<script>\n\tlet s = 'a';\n\tlet n = 0;\n\tconst f = (x) => x + 1;\n\tconst h = () => {};\n</script>\n";

fn both(markup: &str, expected: &str) {
    for dev in [false, true] {
        let out = client(&format!("{SCRIPT}\n{markup}\n"), dev);
        assert!(out.contains(expected), "dev={dev} {markup}\nwant {expected}\n{out}");
    }
}

#[test]
fn a_comment_on_the_tag_name_line_is_the_first_arguments_trailing_comment() {
    both(
        "<div title={/* c */ s}>x</div>",
        "$.set_attribute(div, /* c */ 'title', s);",
    );
    both(
        "<div title={s /* c */}>x</div>",
        "$.set_attribute(div, /* c */ 'title', s);",
    );
}

/// The discriminating control: only the line moved. Upstream's placement is a
/// property of the source geometry, not of the attribute or the expression.
#[test]
fn a_comment_below_the_tag_name_line_lands_before_the_value_instead() {
    both(
        "<div\n\ttitle={/* c */ s}>x</div>",
        "$.set_attribute(div, 'title', /* c */ s);",
    );
}

#[test]
fn the_placement_does_not_depend_on_the_attribute() {
    for (markup, expected) in [
        (
            "<div data-x={/* c */ s}>x</div>",
            "$.set_attribute(div, /* c */ 'data-x', s);",
        ),
        (
            "<div aria-label={/* c */ s}>x</div>",
            "$.set_attribute(div, /* c */ 'aria-label', s);",
        ),
        ("<a href={/* c */ s}>x</a>", "$.set_attribute(a, /* c */ 'href', s);"),
        (
            "<img src={/* c */ s} alt=\"a\" />",
            "$.set_attribute(img, /* c */ 'src', s);",
        ),
    ] {
        both(markup, expected);
    }
}

/// A line comment cannot be followed by more arguments on its line, so the whole
/// call breaks open — the same rule esrap applies to any argument list.
#[test]
fn a_line_comment_breaks_the_call_open() {
    both("<div title={// c\n\ts}>x</div>", "$.set_attribute(\n\t\tdiv, // c");
}

/// Upstream copies the instance script's `loc` onto the component block to get
/// comments printed at all; with no `<script>` there is none to copy.
#[test]
fn a_component_with_no_instance_script_drops_the_comment() {
    for dev in [false, true] {
        let out = client("<div title={/* c */ q}>x</div>\n", dev);
        assert!(!out.contains("/* c */"), "dev={dev}\n{out}");
        assert!(out.contains("$.set_attribute(div, 'title', q);"), "{out}");
    }
}
