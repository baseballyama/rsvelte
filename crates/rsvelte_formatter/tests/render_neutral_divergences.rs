//! Pins the formatter forms that differ from `oxfmt(svelte: true)` and compile to
//! the *same* program, so a later change toward the oracle fails here rather than
//! silently reclassifying a deliberate divergence as a fix.
//!
//! Each construct below was measured by compiling both formatted texts with
//! `submodules/svelte/.../compiler/index.js`: client and server `js.code` and
//! `css.code` are byte-identical across the pair.

use rsvelte_formatter::{FormatOptions, format};

fn fmt(src: &str) -> String {
    format(src, &FormatOptions::default()).expect("format ok")
}

#[test]
fn an_array_elision_carries_no_space() {
    // The oracle prints prettier's `[, , c]`; `oxc_formatter` prints `[,, c]`.
    let out = fmt(
        "{#await p}\n\tx\n{:then [ a, b, ...[,, c, ...{ length } ]]}\n\t<p>{a}{b}{c}{length}</p>\n{/await}\n",
    );
    assert!(
        out.contains("...[,, c, ...{ length }]"),
        "elision spacing changed:\n{out}"
    );
}

#[test]
fn an_assignment_used_as_a_const_body_keeps_its_parentheses() {
    // The oracle drops them; both forms are the same expression.
    let out = fmt("{#if x}{@const y = h = 0}{/if}\n");
    assert!(
        out.contains("{@const y = (h = 0)}"),
        "parentheses around the assignment were dropped:\n{out}"
    );
}

#[test]
fn a_script_close_tag_keeps_its_internal_whitespace() {
    // The oracle rewrites `</script   \n\n>` to `</script>`. Svelte accepts both
    // and the compiled output is identical, so the source form is preserved.
    let src = "<script>\n\tlet name = 1;\n</script     \n\n>\n\n<h1>{name}</h1>\n";
    let out = fmt(src);
    assert!(
        out.contains("</script     "),
        "close-tag whitespace was normalized:\n{out}"
    );
    assert!(out.contains("<h1>{name}</h1>"), "body was lost:\n{out}");
}

#[test]
fn a_style_close_tag_keeps_its_internal_whitespace() {
    let src = "<div>foo</div>\n\n<style>\n\tdiv {\n\t\tcolor: red;\n\t}\n</style     \n\n>\n";
    let out = fmt(src);
    assert!(
        out.contains("</style     "),
        "close-tag whitespace was normalized:\n{out}"
    );
    assert!(out.contains("color: red"), "style body was lost:\n{out}");
}

#[test]
fn an_element_close_tag_split_across_lines_is_still_emitted() {
    // The oracle deletes the tail; rsvelte closes the element. Both compile to the
    // same `<textarea>` body, because the deleted run is past where Svelte closes it.
    let out = fmt("<textarea>\n\t<p>x</p>\n</textarea\n\n>\n");
    assert!(out.contains("</textarea>"), "close tag was dropped:\n{out}");
}
