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

/// #2151: when a collapse pass grows the indent by one level to break an
/// overflowing block onto its own line, the new level must be the real
/// `IndentUnit` (a tab), never a hardcoded literal two-space string — several
/// `collapse/*.rs` block-break helpers built their `inner_indent` with
/// `format!("{indent}  ")`, which mixed spaces into an otherwise all-tab
/// document. General invariant: no line's leading indent may contain a space
/// once the whole document is tab-indented.
#[test]
fn tab_indent_block_break_grows_by_a_tab_not_two_spaces() {
    let src = "<div>\n\t{#if condition}<p>a very long paragraph of text that will overflow the line</p>{/if}\n</div>\n";
    let out = format(src, &options(IndentStyle::Tab, 40, 4)).expect("format ok");
    assert!(out.contains('\n'), "expected the block to break:\n{out}");
    for line in out.lines() {
        let indent_end = line
            .find(|c: char| c != '\t' && c != ' ')
            .unwrap_or(line.len());
        let indent = &line[..indent_end];
        assert!(
            !indent.contains(' '),
            "tab-indented output must never mix a literal space into its leading indent: {line:?}\n{out}"
        );
    }
}

/// #2151: `<pre>` content that mixes reformatted structure (a `{#if}` block) with
/// element-direct markup must not leak literal spaces into an otherwise
/// tab-indented document. Reduced from svelte.dev's `AstView.svelte`: an
/// `<AstNode>` self-closing component nested inside a `<ul>` that is itself
/// inside an `{#if}` consequent, all inside `<pre><code>`. Asserted against the
/// exact oracle (oxfmt + prettier-plugin-svelte) output.
#[test]
fn tab_indent_pre_block_reformat_does_not_mix_spaces_into_tabs() {
    let src = "<div class=\"ast-view\">\n\t<pre>\n\t\t<code>\n\t\t\t{#if typeof ast === \"object\"}\n\t\t\t\t<ul>\n\t\t\t\t\t<AstNode value={ast} />\n\t\t\t\t</ul>\n\t\t\t{:else}\n\t\t\t\t<p>No AST available</p>\n\t\t\t{/if}\n\t\t</code>\n\t</pre>\n</div>\n";

    let out = format(src, &options(IndentStyle::Tab, 100, 4)).expect("format ok");
    assert_eq!(
        out, src,
        "already-tab-indented, already-fitting <pre> content must round-trip verbatim"
    );
}

/// #2151 companion: the same `<pre>`-with-block source, but the DOCUMENT's
/// configured style is spaces (the common case) while the `<pre>` body itself
/// was hand-indented with tabs. oxfmt preserves the `<pre>`'s own element-direct
/// markup (`<code>`, `{#if}`, `<AstNode>`, the block's close tags) verbatim in
/// tabs, but renders reformatted internals — the `{#if}` block body and wrapped
/// attributes — in the document's configured (space) style. This is the inverse
/// of the previous test and guards the `configured_tabs` branch in
/// `reformat_pre_inner`, not just the `pre_uses_tabs` one.
#[test]
fn space_indent_pre_block_reformat_keeps_element_direct_tabs_and_configured_spaces() {
    let src = "<div class=\"ast-view\">\n\t<pre>\n\t\t<code>\n\t\t\t{#if typeof ast === \"object\"}\n\t\t\t\t<ul>\n\t\t\t\t\t<AstNode value={ast} />\n\t\t\t\t</ul>\n\t\t\t{:else}\n\t\t\t\t<p>No AST available</p>\n\t\t\t{/if}\n\t\t</code>\n\t</pre>\n</div>\n";

    let out = format(src, &options(IndentStyle::Space, 80, 2)).expect("format ok");
    assert_eq!(
        out,
        "<div class=\"ast-view\">\n  <pre>\n\t\t<code>\n\t\t\t{#if typeof ast === \"object\"}\n        <ul>\n\t\t\t\t\t<AstNode value={ast} />\n\t\t\t\t</ul>\n      {:else}\n        <p>No AST available</p>\n      {/if}\n\t\t</code>\n\t</pre>\n</div>\n",
        "element-direct <pre> lines stay in the source's own tabs; reformatted \
         block-body lines follow the document's configured (space) style"
    );
}
