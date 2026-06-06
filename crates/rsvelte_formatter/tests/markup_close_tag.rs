//! Regression tests for close-tag span detection (#669).
//!
//! Self-closing / void elements have no close tag. An earlier version of
//! `find_close_tag_span` scanned backward for *any* `</`, so a self-closing
//! element after a `<script>`/`<style>` block matched the `</` of the
//! preceding `</script>` and emitted a bogus edit that overwrote everything
//! in between — silently dropping markup (one element) or panicking with a
//! slice out-of-bounds (two or more siblings).

use rsvelte_formatter::{FormatOptions, format};

fn fmt(src: &str) -> String {
    format(src, &FormatOptions::default()).expect("format ok")
}

#[test]
fn single_self_closing_after_script_is_preserved() {
    let src = "<script>\n  let x = 1;\n</script>\n\n<div><span /></div>\n";
    let out = fmt(src);
    assert!(
        out.contains("<div><span /></div>"),
        "self-closing markup after a script must survive:\n{out}"
    );
    assert!(
        !out.contains("</span>/div>"),
        "must not emit mangled close fragment:\n{out}"
    );
}

#[test]
fn two_self_closing_siblings_after_script_do_not_panic() {
    // Previously panicked with a slice out-of-bounds.
    let src = "<script>\n  let x = 1;\n</script>\n\n<div><span /><span /></div>\n";
    let out = fmt(src);
    assert!(
        out.contains("<div><span /><span /></div>"),
        "two self-closing siblings after a script must survive:\n{out}"
    );
}

#[test]
fn self_closing_svg_path_after_script_is_preserved() {
    let src = "<script>\n  let x = 1;\n</script>\n\n<svg><path d=\"M0 0\" /></svg>\n";
    let out = fmt(src);
    assert!(
        out.contains("<svg><path d=\"M0 0\" /></svg>"),
        "svg/path must survive:\n{out}"
    );
}

#[test]
fn normal_close_tag_whitespace_is_normalized() {
    let out = fmt("<div >hello</div >\n");
    assert!(
        out.contains("<div>hello</div>"),
        "close-tag whitespace should be normalized:\n{out}"
    );
}

#[test]
fn nested_same_name_close_tags_round_trip() {
    let src = "<div><div>x</div></div>\n";
    assert_eq!(fmt(src), src);
}

#[test]
fn self_closing_inside_component_after_script_is_preserved() {
    let src = "<script>\n  import Foo from \"./Foo.svelte\";\n</script>\n\n<Foo><span /></Foo>\n";
    let out = fmt(src);
    assert!(
        out.contains("<Foo><span /></Foo>"),
        "self-closing child inside a component must survive:\n{out}"
    );
}
