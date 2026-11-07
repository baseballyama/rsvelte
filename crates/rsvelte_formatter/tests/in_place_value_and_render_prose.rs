//! Two layouts that now measure the way prettier-plugin-svelte does. Every
//! expected value is the oxfmt(`svelte: true`) oracle's output at `printWidth: 80`.

use rsvelte_formatter::{FormatOptions, JsFormatOptions, LineWidth, format};

fn fmt(src: &str) -> String {
    let opts = FormatOptions {
        js: JsFormatOptions {
            line_width: LineWidth::try_from(80u16).expect("valid line width"),
            ..JsFormatOptions::default()
        },
        ..FormatOptions::default()
    };
    format(src, &opts).expect("format ok")
}

#[test]
fn an_overflowing_array_value_lays_its_elements_out_at_the_full_width() {
    // `items={` and `}` are charged to the first and last lines only, so the
    // element fits once the array breaks.
    assert_eq!(
        fmt(
            "<Q.Root\n\tdata-testid=\"root\"\n\titems={[{ choices: [{ value: \"second\" }, { value: \"first\" }], name: \"answer\" }]}\n\tshortcuts=\"letters\"\n>\n\tx\n</Q.Root>\n"
        ),
        "<Q.Root\n  data-testid=\"root\"\n  items={[\n    { choices: [{ value: \"second\" }, { value: \"first\" }], name: \"answer\" },\n  ]}\n  shortcuts=\"letters\"\n>\n  x\n</Q.Root>\n"
    );
}

#[test]
fn an_element_that_does_not_fit_the_full_width_still_breaks() {
    assert_eq!(
        fmt(
            "<Q.Root\n\tdata-testid=\"root\"\n\titems={[{ choices: \"secondsecondsecondsecondsecondsecondsecondsecondsecond\", name: \"answer\" }]}\n\tshortcuts=\"letters\"\n>\n\tx\n</Q.Root>\n"
        ),
        "<Q.Root\n  data-testid=\"root\"\n  items={[\n    {\n      choices: \"secondsecondsecondsecondsecondsecondsecondsecondsecond\",\n      name: \"answer\",\n    },\n  ]}\n  shortcuts=\"letters\"\n>\n  x\n</Q.Root>\n"
    );
}

#[test]
fn prose_after_a_render_tag_overflows_by_its_last_word() {
    // A text node that starts with a line break is `fill([hardline, word, line,
    // …])`: the parity shift makes the words separators, so a word is only moved
    // to the next line when the column is already past the width.
    let src = "<div>\n\t<p>\n\t\t{@render citation(sources.loading)}\n\t\tIt all runs over chunked transfer encoding, so there is nothing extra to set up.\n\t\t{@render citation(sources.chunked)}\n\t</p>\n</div>\n";
    assert_eq!(
        fmt(src),
        "<div>\n  <p>\n    {@render citation(sources.loading)}\n    It all runs over chunked transfer encoding, so there is nothing extra to set up.\n    {@render citation(sources.chunked)}\n  </p>\n</div>\n"
    );
}

#[test]
fn prose_after_a_render_tag_breaks_once_past_the_width() {
    assert_eq!(
        fmt(
            "<p>\n\t{@render a()}\n\tIt all runs over chunked transfer encoding, so there is nothing extra to set up and more words here too.\n\t{@render b()}\n</p>\n"
        ),
        "<p>\n  {@render a()}\n  It all runs over chunked transfer encoding, so there is nothing extra to set up\n  and more words here too.\n  {@render b()}\n</p>\n"
    );
}
