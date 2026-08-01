//! `useTabs` print-width accounting (#2119).
//!
//! Prettier's `generateIndent` charges an indentation tab `tabWidth` columns, so
//! a tab-indented document must make exactly the same fit decisions as the
//! equivalent space-indented one. Measuring a tab as a single column made every
//! wrap fire `(tabWidth - 1) * depth` columns late.

use rsvelte_formatter::{
    FormatOptions, IndentStyle, IndentWidth, JsFormatOptions, LineWidth, format,
};

fn options(indent_style: IndentStyle, print_width: u16, tab_width: u8) -> FormatOptions {
    FormatOptions {
        js: JsFormatOptions {
            indent_style,
            indent_width: IndentWidth::try_from(tab_width).expect("valid indent width"),
            line_width: LineWidth::try_from(print_width).expect("valid print width"),
            ..JsFormatOptions::new()
        },
        ..FormatOptions::default()
    }
}

/// Re-indent tab-indented output with `tab_width` spaces per leading tab, which
/// is exactly the column budget prettier charges for it.
fn tabs_to_columns(out: &str, tab_width: usize) -> String {
    out.lines()
        .map(|line| {
            let tabs = line.bytes().take_while(|b| *b == b'\t').count();
            format!("{}{}", " ".repeat(tabs * tab_width), &line[tabs..])
        })
        .collect::<Vec<_>>()
        .join("\n")
}

/// The oracle (oxfmt + prettier-plugin-svelte) wraps this prose after `dog`; with
/// a one-column tab the 12-column indent counted as 3 and `and keeps` still fit.
#[test]
fn tab_indent_wraps_prose_at_the_same_column_as_a_space_indent() {
    let src = "<div>\n\t<div>\n\t\t<div>\n\t\t\t<p>\n\t\t\t\tThe quick brown fox jumps over the lazy dog and keeps running far away.\n\t\t\t</p>\n\t\t</div>\n\t</div>\n</div>\n";

    let tabs = format(src, &options(IndentStyle::Tab, 60, 4)).expect("format ok");
    assert_eq!(
        tabs,
        "<div>\n\t<div>\n\t\t<div>\n\t\t\t<p>\n\t\t\t\tThe quick brown fox jumps over the lazy dog\n\t\t\t\tand keeps running far away.\n\t\t\t</p>\n\t\t</div>\n\t</div>\n</div>\n",
        "tab-indented prose must wrap where the oracle wraps"
    );
}

/// An open tag whose attributes overflow only once the tab indent is charged its
/// real width.
#[test]
fn tab_indent_breaks_an_open_tag_at_the_same_column_as_a_space_indent() {
    let src = "<div>\n\t<div>\n\t\t<div>\n\t\t\t<span class=\"alpha beta\" title=\"hello there\" id=\"widget\">ok</span>\n\t\t</div>\n\t</div>\n</div>\n";

    let tabs = format(src, &options(IndentStyle::Tab, 60, 4)).expect("format ok");
    assert_eq!(
        tabs,
        "<div>\n\t<div>\n\t\t<div>\n\t\t\t<span\n\t\t\t\tclass=\"alpha beta\"\n\t\t\t\ttitle=\"hello there\"\n\t\t\t\tid=\"widget\">ok</span\n\t\t\t>\n\t\t</div>\n\t</div>\n</div>\n",
        "a tab-indented open tag must break where the oracle breaks"
    );
}

/// Layout invariant across the two indent styles: with the same `tabWidth`, tab
/// and space indentation buy the same number of columns, so the documents must
/// agree line for line once the tabs are expanded.
#[test]
fn tab_and_space_indentation_produce_the_same_layout() {
    let cases = [
        "<div>\n\t<div>\n\t\t<div>\n\t\t\t<p>\n\t\t\t\tThe quick brown fox jumps over the lazy dog and keeps running far away.\n\t\t\t</p>\n\t\t</div>\n\t</div>\n</div>\n",
        "<div>\n\t<div>\n\t\t<div>\n\t\t\t<span class=\"alpha beta\" title=\"hello there\" id=\"widget\">ok</span>\n\t\t</div>\n\t</div>\n</div>\n",
        "<ul>\n\t<li>\n\t\t<a href=\"/some/fairly/long/path\">a link whose text keeps going and going</a>\n\t</li>\n</ul>\n",
    ];

    for (tab_width, print_width) in [(2u8, 60u16), (4, 60), (4, 80), (8, 80)] {
        for src in cases {
            let tabs = format(src, &options(IndentStyle::Tab, print_width, tab_width))
                .expect("tab format ok");
            let spaces = format(src, &options(IndentStyle::Space, print_width, tab_width))
                .expect("space format ok");
            assert_eq!(
                tabs_to_columns(&tabs, tab_width as usize),
                tabs_to_columns(&spaces, tab_width as usize),
                "tabWidth={tab_width} printWidth={print_width} diverged for:\n{src}"
            );
        }
    }
}

/// Exact print-width boundary: the deepest text line must end at `printWidth`
/// and never one column past it.
#[test]
fn tab_indent_respects_the_print_width_boundary() {
    // Depth 2 (8 columns at tabWidth 4) + `<p>`-nested text at depth 3 (12 columns).
    let src = "<div>\n\t<div>\n\t\t<p>\n\t\t\taaaa bbbb cccc dddd eeee ffff gggg hhhh iiii jjjj kkkk\n\t\t</p>\n\t</div>\n</div>\n";
    let out = format(src, &options(IndentStyle::Tab, 40, 4)).expect("format ok");
    for line in out.lines() {
        let tabs = line.bytes().take_while(|b| *b == b'\t').count();
        let columns = tabs * 4 + line[tabs..].chars().count();
        assert!(
            columns <= 40 || line[tabs..].split(' ').count() == 1,
            "line exceeds printWidth 40 ({columns} columns): {line:?}\n{out}"
        );
    }
}
