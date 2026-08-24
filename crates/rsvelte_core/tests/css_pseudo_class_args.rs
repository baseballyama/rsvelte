//! Regression tests for issues #3130, #3133 and #3204 — the argument list of a
//! functional pseudo-class.
//!
//! Every expectation here was taken from the official compiler
//! (`submodules/svelte`, v5.56.9) with `generate: 'client', css: 'external'`.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

struct Compiled {
    css: String,
    warnings: Vec<String>,
}

fn opts() -> CompileOptions {
    CompileOptions {
        filename: Some("input.svelte".to_string()),
        generate: GenerateMode::Client,
        dev: false,
        css: CssMode::External,
        ..Default::default()
    }
}

fn build(src: &str) -> Compiled {
    let out = compile(src, opts()).expect("compile");
    Compiled {
        css: out.css.map(|c| c.code).unwrap_or_default(),
        warnings: out
            .warnings
            .iter()
            .filter(|w| w.code == "css_unused_selector")
            .map(|w| w.message.lines().next().unwrap_or("").to_string())
            .collect(),
    }
}

fn error_code(src: &str) -> String {
    match compile(src, opts()) {
        Ok(_) => "<ok>".to_string(),
        Err(e) => format!("{e:?}")
            .split("code: \"")
            .nth(1)
            .and_then(|t| t.split('"').next())
            .unwrap_or("<unknown>")
            .to_string(),
    }
}

/// `<style>` with one rule, and the hash the fixtures below all produce.
fn styled(markup: &str, rule: &str) -> String {
    format!("{markup}\n<style>\n\t{rule}\n</style>")
}

// ---------------------------------------------------------------------------
// #3130 (a) — `An+B` is gated on being inside a pseudo-class, not on its name
// ---------------------------------------------------------------------------

#[test]
fn an_plus_b_is_accepted_in_any_pseudo_class() {
    for name in ["is", "not", "where", "global", "hover", "nth-child"] {
        let src = styled(
            "<div class=\"a\"></div>",
            &format!(".a:{name}(2n) {{ color: red }}"),
        );
        assert_eq!(error_code(&src), "<ok>", "{name}(2n) should parse");
    }
}

#[test]
fn an_plus_b_of_selector_is_accepted_in_any_pseudo_class() {
    let src = styled("<div class=\"a\"></div>", ".a:not(2n of .a) { color: red }");
    assert_eq!(error_code(&src), "<ok>");
}

#[test]
fn invalid_an_plus_b_spellings_are_rejected() {
    // The nine spellings the pre-#3130 heuristic over-accepted, plus the two
    // that upstream's regex rejects and `read_identifier` then also rejects.
    for arg in [
        "-2n-1",
        "-1",
        "2foo",
        "2n /* t */",
        "2n+",
        "2N",
        "2e",
        "3 n",
    ] {
        let src = styled(
            "<div class=\"a\"></div>",
            &format!(".a:nth-child({arg}) {{ color: red }}"),
        );
        assert_eq!(
            error_code(&src),
            "css_expected_identifier",
            "nth-child({arg}) should be rejected"
        );
    }
}

#[test]
fn combinator_with_nothing_after_it_is_an_invalid_selector() {
    let src = styled("<div class=\"a\"></div>", ".a:nth-child(n+) { color: red }");
    assert_eq!(error_code(&src), "css_selector_invalid");
}

#[test]
fn an_plus_b_near_miss_falls_back_to_a_type_selector() {
    // `-n-1` is not `An+B`, so upstream reads it as an identifier and the
    // selector compiles.
    let src = styled(
        "<div class=\"a\"></div>",
        ".a:nth-child(-n-1) { color: red }",
    );
    assert_eq!(error_code(&src), "<ok>");
}

#[test]
fn of_separator_keeps_its_source_whitespace() {
    let src = styled(
        "<div class=\"a\"></div>",
        ".a:nth-child(2n  of  .a) { color: red }",
    );
    assert!(
        build(&src).css.contains(":nth-child(2n  of  .a)"),
        "got {:?}",
        build(&src).css
    );
}

#[test]
fn a_selector_argument_that_contains_n_is_not_an_an_plus_b() {
    let src = styled("<span></span>", "span:nth-child(span) { color: red }");
    assert!(
        build(&src).css.contains(":nth-child(span)"),
        "got {:?}",
        build(&src).css
    );
}

// ---------------------------------------------------------------------------
// #3130 (b) — comments between arguments survive the rewrite
// ---------------------------------------------------------------------------

#[test]
fn comments_inside_functional_pseudo_arguments_are_kept() {
    let markup = "<div class=\"a\"><span class=\"b\">x</span></div>";
    for name in ["is", "not", "where"] {
        for (arg, expected) in [(".a /* t */", "/* t */)"), ("/* l */ .a", "(/* l */ ")] {
            let src = styled(markup, &format!("div:{name}({arg}) {{ color: red }}"));
            let css = build(&src).css;
            assert!(css.contains(expected), ":{name}({arg}) -> {css:?}");
        }
    }
}

#[test]
fn a_comment_between_two_kept_arguments_is_kept() {
    let markup = "<div class=\"a\"><span class=\"b\">x</span></div>";
    let src = styled(markup, "div:not(.a /* m */, .b) { color: red }");
    assert!(
        build(&src).css.contains(":not(.a /* m */, .b)"),
        "got {:?}",
        build(&src).css
    );
}

#[test]
fn argument_separator_spacing_comes_from_the_source() {
    let markup = "<div class=\"a\"></div><div class=\"b\"></div>";
    let src = styled(markup, "div:is(.a,.b) { color: red }");
    let css = build(&src).css;
    assert!(css.contains("),.b"), "got {css:?}");
}

// ---------------------------------------------------------------------------
// #3204 — each unused argument is pruned out of the list
// ---------------------------------------------------------------------------

#[test]
fn unused_is_arguments_are_commented_out() {
    let src = styled("<b>x</b>", ":is(b, i) { color: red }");
    let out = build(&src);
    assert!(out.css.contains("/* (unused) i*/"), "got {:?}", out.css);
    assert!(!out.css.contains("i.svelte-"), "got {:?}", out.css);
}

#[test]
fn unused_where_arguments_are_commented_out() {
    let src = styled("<b>x</b>", ":where(b, i) { color: red }");
    assert!(
        build(&src).css.contains("/* (unused) i*/"),
        "got {:?}",
        build(&src).css
    );
}

#[test]
fn unused_has_arguments_are_commented_out_without_a_warning() {
    let src = styled("<div><b>x</b></div>", "div:has(b, i) { color: red }");
    let out = build(&src);
    assert!(out.css.contains("/* (unused) i*/"), "got {:?}", out.css);
    // `css-warn.js` never recurses into `:has()`, so nothing is reported.
    assert!(out.warnings.is_empty(), "got {:?}", out.warnings);
}

#[test]
fn a_compound_argument_is_pruned_too() {
    let src = styled("<b class=\"a\">x</b>", ":is(b.a, i.a) { color: red }");
    assert!(
        build(&src).css.contains("/* (unused) i.a*/"),
        "got {:?}",
        build(&src).css
    );
}

#[test]
fn every_argument_unused_prunes_the_whole_rule_and_warns_once() {
    let src = styled("<span>x</span>", ":is(b, i) { color: red }");
    let out = build(&src);
    assert!(
        out.css.contains("/* (unused) :is(b, i)"),
        "got {:?}",
        out.css
    );
    assert_eq!(out.warnings, vec!["Unused CSS selector \":is(b, i)\""]);
}

#[test]
fn not_arguments_are_never_pruned() {
    let src = styled("<b>x</b>", ":not(b, i) { color: red }");
    let out = build(&src);
    assert!(!out.css.contains("(unused)"), "got {:?}", out.css);
}

// ---------------------------------------------------------------------------
// #3133 — a subject reached through `:has()` still has to satisfy the chain
// ---------------------------------------------------------------------------

#[test]
fn has_subject_must_satisfy_the_preceding_combinators() {
    let markup = "<div class=\"a\"><b class=\"b\">x</b></div>";
    for rule in [".a :has(.b)", ".a > :has(.b)"] {
        let src = styled(markup, &format!("{rule} {{ color: red }}"));
        let out = build(&src);
        assert!(
            out.css.contains(&format!("/* (unused) {rule}")),
            "{rule} -> {:?}",
            out.css
        );
        assert_eq!(
            out.warnings,
            vec![format!("Unused CSS selector \"{rule}\"")]
        );
    }
}

#[test]
fn has_argument_that_matches_nothing_prunes_the_rule() {
    let markup = "<div class=\"a\"><b class=\"b\">x</b></div>";
    for arg in ["[x]", "[x=y]", "[x=\"y z\"]", "[x^=\"y\"]", "[x|=\"y\"]"] {
        let src = styled(markup, &format!(".a:has({arg}) {{ color: red }}"));
        assert!(
            build(&src).css.contains("/* (unused) .a:has("),
            ".a:has({arg}) -> {:?}",
            build(&src).css
        );
    }
}

#[test]
fn has_argument_matching_only_the_subject_itself_is_pruned() {
    // `.a` is the `div` itself, not one of its descendants.
    let src = styled(
        "<div class=\"a\"><span class=\"b\">x</span></div>",
        "div:has(.a, .b) { color: red }",
    );
    let css = build(&src).css;
    assert!(css.contains("/* (unused) .a,*/"), "got {css:?}");
}

#[test]
fn a_reachable_has_is_left_alone() {
    let markup = "<div class=\"a\"><b class=\"b\">x</b></div>";
    for rule in [".a:has(.b)", "div:has(.b)", ".a .b"] {
        let src = styled(markup, &format!("{rule} {{ color: red }}"));
        let out = build(&src);
        assert!(!out.css.contains("(unused)"), "{rule} -> {:?}", out.css);
    }
}
