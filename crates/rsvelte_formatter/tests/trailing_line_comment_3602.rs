//! `rsvelte-fmt` shares #3602's wrap: an expression slice is handed to OXC as
//! `(<slice>);`, so a trailing `//` comment swallowed the `);` and the whole
//! file failed with "script parse failed: Expected `)` but found `EOF`".
//!
//! The remaining half of that defect is the markup printer, which still puts
//! the tag's `}` on the comment's line — see #3613. These assertions therefore
//! check that the formatter *runs*, not that its output is valid Svelte.

use rsvelte_formatter::{FormatOptions, format};

const HEAD: &str = "<script>\n\tlet flag = $state(true);\n</script>\n\n";

fn fmt(body: &str) -> String {
    format(&format!("{HEAD}{body}\n"), &FormatOptions::default()).expect("format")
}

#[test]
fn an_expression_ending_in_a_line_comment_formats() {
    for body in [
        "<b>{flag // c\n}</b>",
        "<div data-a={flag // c\n}>a</div>",
        "{#if flag // c\n}\n\t<b>a</b>\n{/if}",
        "{#key flag // c\n}\n\t<b>a</b>\n{/key}",
        "{@html \"<i>x</i>\" // c\n}",
    ] {
        assert!(!fmt(body).is_empty(), "empty output for:\n{body}");
    }
}
