//! Regression tests for #3393 (a closing tag accepted arbitrary text before the
//! `>`), #3395 (text after `</style` was dropped instead of becoming a text
//! node) and #3450 (one new tag popped the whole ancestor chain, and `p`'s
//! closer list carried three tags upstream does not have).
//!
//! Every expectation was taken from the official compiler (`submodules/svelte`,
//! v5.56.9) with `generate: 'client', css: 'external'`.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn opts() -> CompileOptions {
    CompileOptions {
        filename: Some("input.svelte".to_string()),
        generate: GenerateMode::Client,
        dev: false,
        css: CssMode::External,
        ..Default::default()
    }
}

/// `code@start-byte` for a rejected source, `<ok>` for one that compiles.
fn err(src: &str) -> String {
    match compile(src, opts()) {
        Ok(_) => "<ok>".to_string(),
        Err(e) => {
            let d = e.diagnostic();
            format!(
                "{}@{}",
                d.code.as_deref().unwrap_or("<none>"),
                d.span.map_or(-1, |(s, _)| i64::from(s))
            )
        }
    }
}

fn js(src: &str) -> String {
    compile(src, opts()).expect("compile").js.code
}

// ---------------------------------------------------------------------------
// #3393 — a closing tag carries nothing but whitespace before the `>`
// ---------------------------------------------------------------------------

#[test]
fn junk_between_a_closing_tag_name_and_its_bracket_is_rejected() {
    // Upstream reads the name, allows whitespace, then `parser.eat('>', true)`,
    // so the error lands on the first character that is not the `>`.
    assert_eq!(err("<div>y</div x>"), "expected_token@12");
    assert_eq!(err("<div>y</div a=b>"), "expected_token@12");
    assert_eq!(err("<div>y</div />"), "expected_token@12");
    assert_eq!(err("<x-a>y</x-a z>"), "expected_token@12");
    assert_eq!(err("<svelte:boundary>y</svelte:boundary x>"), {
        let at = "<svelte:boundary>y</svelte:boundary ".len();
        format!("expected_token@{at}")
    });
    assert_eq!(
        err("<svelte:head><title>t</title x></svelte:head>"),
        format!("expected_token@{}", "<svelte:head><title>t</title ".len())
    );
}

#[test]
fn a_closing_tag_still_takes_whitespace_and_a_component_name() {
    // The controls: whitespace before the `>` is legal, and the rejection is
    // not about which element it is.
    assert_eq!(err("<div>y</div >"), "<ok>");
    assert_eq!(err("<div\n>y</div\n>"), "<ok>");
    assert_eq!(err("<div>y</div>"), "<ok>");
}

#[test]
fn a_textarea_closer_keeps_taking_everything_up_to_the_bracket() {
    // Upstream's closer is `/<\/textarea(\s[^>]*)?>/i`, so unlike every other
    // element the junk belongs to the closing tag.
    assert_eq!(err("<textarea>y</textarea x>"), "<ok>");
    assert_eq!(err("<textarea>y</textarea>"), "<ok>");
}

#[test]
fn a_root_script_is_not_closed_by_a_closer_carrying_junk() {
    // `read_script` reads until `/<\/script\s*>/`; `</script x>` is not that,
    // so the script runs to the end of the (right-trimmed) template.
    let src = "<script x>let a=1;</script x>\n";
    assert_eq!(
        err(src),
        format!("element_unclosed@{}", src.trim_end().len())
    );
    assert_eq!(err("<script>let a=1;</script >"), "<ok>");
}

// ---------------------------------------------------------------------------
// #3395 — what sits between `</style` and the `>` is template text
// ---------------------------------------------------------------------------

#[test]
fn text_after_a_style_closer_survives() {
    // Upstream eats `</style` and then reads `/\s*>/y`, which does not match
    // here — so the leftover is markup, not part of the tag.
    assert!(js("<style>a{color:red}</style x>").contains("'x>'"));
    assert!(js("<style>a{color:red}</style x y>").contains("'x y>'"));
    assert!(js("<style>a{color:red}</style x>after").contains("'x>after'"));
    // A following sibling is compiled into a different template, not merely
    // preceded by a lost text node.
    assert!(js("<style>a{color:red}</style x><b>sib</b>").contains("x><b>sib</b>"));
}

#[test]
fn a_style_closer_with_only_whitespace_is_consumed_whole() {
    let out = js("<style>a{color:red}</style ><b>sib</b>");
    assert!(!out.contains("'>'"), "{out}");
    assert!(out.contains("<b>sib</b>"), "{out}");
}

// ---------------------------------------------------------------------------
// #3450 — one pop per new tag, and `p`'s closer list
// ---------------------------------------------------------------------------

#[test]
fn a_new_tag_closes_one_level_not_the_whole_ancestor_chain() {
    // `<optgroup h>` closes the `<option>` and becomes a child of `<optgroup
    // g>`; upstream then rejects that placement. Before the fix rsvelte popped
    // `<optgroup g>` as well, making them siblings — and compiling.
    let src = "<select><optgroup label=\"g\"><option>a<optgroup label=\"h\"><option>b</select>";
    assert_eq!(
        err(src),
        format!(
            "node_invalid_placement@{}",
            "<select><optgroup label=\"g\"><option>a".len()
        )
    );
    // The same rule one level shallower still closes exactly one `<option>`.
    assert_eq!(
        err("<select><optgroup label=\"g\"><option>a<option>b</select>"),
        "<ok>"
    );
}

#[test]
fn details_figure_and_figcaption_do_not_close_a_paragraph() {
    // Upstream's `autoclosing_children.p.descendant` does not list them, so the
    // `<p>` stays open and is unclosed at EOF.
    for src in [
        "<p>a<details>b</details>",
        "<p>a<figure>b</figure>",
        "<p>a<figcaption>b</figcaption>",
    ] {
        assert_eq!(err(src), "element_unclosed@0", "{src}");
    }
}

#[test]
fn the_rest_of_the_closer_table_is_unchanged() {
    // The positive controls for the same table: every other entry still
    // auto-closes exactly one level. The verdicts are official's, which is why
    // three of them are not `<ok>` — an auto-closed `<p>` leaves the second one
    // open, and a `<tr>` / `<optgroup>` that lands one level up is rejected by
    // the placement check rather than by the parser.
    for (src, expected) in [
        ("<p>a<div>b</div>", "<ok>"),
        ("<ul><li>a<li>b</ul>", "<ok>"),
        ("<dl><dt>a<dd>b<dt>c</dl>", "<ok>"),
        ("<ruby><rt>a<rp>b</ruby>", "<ok>"),
        ("<p>a<p>b", "element_unclosed@4"),
        (
            "<table><tr><td>a<tr><td>b</table>",
            "node_invalid_placement@7",
        ),
        (
            "<table><tbody><tr><td>a<tr><td>b</tbody></table>",
            "node_invalid_placement@23",
        ),
    ] {
        assert_eq!(err(src), expected, "{src}");
    }
    assert!(js("<p>a<div>b</div>").contains("<p>a</p><div>b</div>"));
}
