use super::format_core::{has_word_await, trivial_expr_verbatim};
use super::text::{
    collapse_block_header_expanded_call, collapse_expanded_arg_form, expand_obj_arg_call,
    outer_parens_match, strip_leading_paren_pair, strip_outer_parens,
};

fn lw(w: u16) -> oxc_formatter_core::LineWidth {
    oxc_formatter_core::LineWidth::try_from(w).unwrap()
}

#[test]
fn trivial_fastpath_accepts_identifiers_and_simple_literals() {
    for src in [
        "foo", "  foo  ", "_x", "$store", "$$props", "a1", "Comp", // identifiers
        "this", "true", "false", "null", // keyword primaries
        "0", "1", "42", "1000", // plain integers
    ] {
        assert_eq!(
            trivial_expr_verbatim(src, lw(80)),
            Some(src.trim()),
            "expected fast-path accept for {src:?}"
        );
    }
}

#[test]
fn trivial_fastpath_accepts_member_chains_within_width() {
    for src in [
        "a.b",
        "a.b.c",
        "this.x.y",
        "$page.data.title",
        "a.class",
        "a.for",
    ] {
        assert_eq!(
            trivial_expr_verbatim(src, lw(80)),
            Some(src),
            "expected member-chain accept for {src:?}"
        );
    }
    // Boundary: a chain exactly at the print width still fits (strict-`>`
    // overflow convention), so it is accepted.
    assert_eq!(trivial_expr_verbatim("a.bc", lw(4)), Some("a.bc"));
    // One past the width: falls through to oxc.
    assert_eq!(trivial_expr_verbatim("a.bcd", lw(4)), None);
    // Over-width: oxc would break the chain, so it must fall through.
    assert_eq!(trivial_expr_verbatim("comment.user.name", lw(10)), None);
    // Head is a reserved word (would not parse as a bare chain): reject.
    assert_eq!(trivial_expr_verbatim("class.foo", lw(80)), None);
}

#[test]
fn trivial_fastpath_rejects_reserved_and_nonverbatim() {
    // Reserved words / contextual keywords that are not verbatim primaries
    // fall through to the oxc path.
    for src in ["await", "class", "for", "async", "let", "new", "typeof"] {
        assert_eq!(
            trivial_expr_verbatim(src, lw(80)),
            None,
            "should reject {src:?}"
        );
    }
    // Numeric forms oxc may normalize must NOT be fast-pathed.
    for src in ["01", "1.0", "1.", ".5", "0x1F", "1e3", "1_000", "10n"] {
        assert_eq!(
            trivial_expr_verbatim(src, lw(80)),
            None,
            "should reject {src:?}"
        );
    }
    // Not a single atomic token or a pure dotted chain.
    for src in [
        "a b", "a()", "a?.b", "a[0]", "'s'", "a + b", "", "  ", "a-b", "café", "a..b", ".a", "a.",
        "a.b()",
    ] {
        assert_eq!(
            trivial_expr_verbatim(src, lw(80)),
            None,
            "should reject {src:?}"
        );
    }
}

#[test]
fn has_word_await_detects_standalone() {
    assert!(has_word_await("await foo"));
    assert!(has_word_await("x = await bar()"));
    assert!(has_word_await("(await x)"));
}

#[test]
fn has_word_await_rejects_subword() {
    assert!(!has_word_await("getAwaiter"));
    assert!(!has_word_await("awaiting"));
    assert!(!has_word_await("noawait"));
    assert!(!has_word_await("$await"));
    assert!(!has_word_await("_await"));
}

#[test]
fn has_word_await_empty() {
    assert!(!has_word_await(""));
    assert!(!has_word_await("foo bar"));
}

#[test]
fn outer_parens_match_ignores_parens_in_comments_and_strings() {
    // Balanced object/arrow body where a line comment carries a lone `)`.
    let inner = "{\n  onpointerdown: (e) => {\n    // 1.) No clamping\n    foo(e);\n  },\n}";
    assert!(outer_parens_match(inner));
    // A `)` inside a string literal must likewise not be counted.
    assert!(outer_parens_match("{ label: \"a) b\", value: 1 }"));
    // A `)` inside a block comment must not be counted.
    assert!(outer_parens_match("x /* close ) here */ + y"));
    // Genuinely unbalanced parens are still rejected.
    assert!(!outer_parens_match("foo)"));
    assert!(!outer_parens_match("a) + (b"));
}

#[test]
fn strip_leading_paren_pair_keeps_postfix() {
    // `({...})[size]` → `{...}[size]`
    assert_eq!(
        strip_leading_paren_pair("({ a: 1 })[size]").as_deref(),
        Some("{ a: 1 }[size]")
    );
    // `({...}).foo` → `{...}.foo`
    assert_eq!(
        strip_leading_paren_pair("({ a: 1 }).foo").as_deref(),
        Some("{ a: 1 }.foo")
    );
    // multi-line object head, postfix preserved
    assert_eq!(
        strip_leading_paren_pair("({\n  a: 1,\n})[k]").as_deref(),
        Some("{\n  a: 1,\n}[k]")
    );
    // a `)` in a comment must not be taken as the match
    assert_eq!(
        strip_leading_paren_pair("({\n  // 1.) x\n  a: 1,\n})[k]").as_deref(),
        Some("{\n  // 1.) x\n  a: 1,\n}[k]")
    );
    // not starting with `(`
    assert_eq!(strip_leading_paren_pair("{ a: 1 }[k]"), None);
}

#[test]
fn strip_outer_parens_strips_object_with_paren_in_comment() {
    // The wrapper `({ … })` around a comment-bearing object value must be
    // stripped even though a body comment contains a lone `)` (#Arc track).
    let s = "({\n  onpointerdown: (e) => {\n    // 1.) No clamping\n    foo(e);\n  },\n})";
    let stripped = strip_outer_parens(s);
    assert!(stripped.trim_start().starts_with('{'));
    assert!(!stripped.trim_start().starts_with("({"));
}

#[test]
fn collapse_expanded_arg_form_normal() {
    // Typical multi-line → collapsed form. prettier-plugin-svelte's
    // `removeLines` strips OXC's trailing comma when it collapses the group,
    // so the result is `fn( arg )` — space markers, NO trailing comma.
    let multi = "options.filter((opt) =>\n  selectedValues.has(opt.value),\n)";
    let result = collapse_expanded_arg_form(multi);
    assert!(result.is_some(), "expected Some for normal multi-line call");
    let s = result.unwrap();
    assert!(s.contains("( "), "result should have `( ` after open paren");
    assert!(
        s.ends_with(" )"),
        "result should end with ` )` (no trailing comma)"
    );
    assert!(
        !s.contains(", )"),
        "result must not keep the `, )` trailing comma"
    );
    assert_eq!(
        s,
        "options.filter( (opt) => selectedValues.has(opt.value) )"
    );
}

#[test]
fn collapse_expanded_arg_form_none_on_single_line() {
    // Single-line input cannot be collapsed (fewer than 2 lines)
    let single = "foo(bar)";
    assert!(collapse_expanded_arg_form(single).is_none());
}

#[test]
fn collapse_expanded_arg_form_none_when_last_line_not_paren() {
    // Last line is not `)` alone — bail
    let s = "foo(\n  bar\n}";
    assert!(collapse_expanded_arg_form(s).is_none());
}

#[test]
fn collapse_expanded_arg_form_none_on_string_literal() {
    // FIX 4: bail on string literals
    let multi = "fn(\"hello\",\n)";
    assert!(collapse_expanded_arg_form(multi).is_none());
}

#[test]
fn collapse_block_header_expanded_call_stacked_zoom() {
    // OXC MAX-width expansion of `isNodeVisible(node, nodes.find((n) => …))`
    // (the layerchart stacked-zoom `{#if}` header). removeLines collapses it
    // to one line WITH expanded-arg spacing and no trailing comma.
    let multi = "isNodeVisible(\n  node,\n  nodes.find((n) => n.data.name === selected.data.name && n.depth === selected.depth),\n)";
    assert_eq!(
        collapse_block_header_expanded_call(multi).unwrap(),
        "isNodeVisible( node, nodes.find((n) => n.data.name === selected.data.name && n.depth === selected.depth) )"
    );
}

#[test]
fn collapse_block_header_expanded_call_bails_nested_arg() {
    // An argument whose object broke across further lines is not the flat-args
    // shape — bail and keep the multi-line output unchanged.
    let multi = "handle(\n  first,\n  {\n    a: 1,\n  },\n)";
    assert!(collapse_block_header_expanded_call(multi).is_none());
}

#[test]
fn collapse_block_header_expanded_call_bails_first_line_not_open_paren() {
    // The "arrow hugged then broke" shape (first line ends `=>`) is handled by
    // `collapse_expanded_arg_form` in the narrowed-width path, not here.
    let multi = "options.filter((opt) =>\n  selectedValues.has(opt.value),\n)";
    assert!(collapse_block_header_expanded_call(multi).is_none());
}

#[test]
fn collapse_block_header_expanded_call_bails_curried_call() {
    // A curried `foo(...)(...)` whose inner line carries a `)(` closes the
    // argument list mid-region (depth reaches 0). The flat-args fold cannot
    // represent it, so it must bail (keep the multi-line form) rather than
    // emit a corrupted single line. (Without the depth<=0 guard the per-line
    // net-balance check would accept `a)(b` and fold to `outer( a)(b, c )`.)
    let multi = "outer(\n  a)(b,\n  c,\n)";
    assert!(collapse_block_header_expanded_call(multi).is_none());
}

#[test]
fn collapse_block_header_expanded_call_folds_paren_inside_string() {
    // A `(` / `)` inside a string literal argument must not corrupt the depth
    // walk — the flat-args fold still applies.
    let multi = "foo(\n  \"(\",\n  second,\n)";
    assert_eq!(
        collapse_block_header_expanded_call(multi).unwrap(),
        "foo( \"(\", second )"
    );
}

#[test]
fn expand_obj_arg_call_single_object() {
    let s = "fn({ key: value })";
    let result = expand_obj_arg_call(s, 2);
    assert!(result.is_some(), "expected Some for single-object call");
    let out = result.unwrap();
    assert!(out.contains("fn(\n"), "result should start with fn(");
    assert!(
        out.contains("{ key: value },"),
        "result should contain object with trailing comma"
    );
}

#[test]
fn expand_obj_arg_call_none_on_multi_arg() {
    // Two top-level arguments — must return None
    let s = "fn({ key: value }, extra)";
    assert!(expand_obj_arg_call(s, 2).is_none());
}

#[test]
fn expand_obj_arg_call_none_on_nested_object() {
    // FIX 3: nested object inside arg — bail
    let s = "fn({ outer: { inner: 1 } })";
    assert!(expand_obj_arg_call(s, 2).is_none());
}

#[test]
fn expand_obj_arg_call_none_on_string_literal() {
    // FIX 4: bail on string literals
    let s = "fn({ key: \"value\" })";
    assert!(expand_obj_arg_call(s, 2).is_none());
}

#[test]
fn expand_obj_arg_call_none_on_non_object_arg() {
    // Non-object single arg — must return None
    let s = "fn(someVariable)";
    assert!(expand_obj_arg_call(s, 2).is_none());
}
