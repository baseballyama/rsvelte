//! Regression tests for issues #3130, #3133, #3204 and #3371 — the argument
//! list of a functional pseudo-class, and what `&` means inside one.
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

// ---------------------------------------------------------------------------
// #3371 — `&` inside `:is()` / `:where()` / `:has()` resolves to the parent
// ---------------------------------------------------------------------------

/// Markup whose every element carries a `data-n`, so the set of elements that
/// received the scoping class can be read off the generated template instead of
/// guessed at from class order.
const SCOPE_MARKUP: &str = "<div class=\"card wide\" data-n=\"card\"><p class=\"a\" data-n=\"a\">x</p><span class=\"b\" data-n=\"b\">y</span></div>";

/// The `data-n` of every element the compiler put the scoping class on.
fn scoped(markup: &str, rule: &str) -> Vec<String> {
    let out = compile(&styled(markup, rule), opts()).expect("compile");
    let js = out.js.code;
    let mut names = Vec::new();
    let needle = "data-n=\"";
    // Without this the probe answers "nothing was scoped" for a template shape
    // it cannot read, and every assertion below passes vacuously.
    assert!(js.contains(needle), "probe found no `data-n` in {js}");
    let mut from = 0;
    while let Some(at) = js[from..].find(needle).map(|i| i + from) {
        let name_start = at + needle.len();
        let name_end = name_start + js[name_start..].find('"').unwrap_or(0);
        let tag_start = js[..at].rfind('<').unwrap_or(0);
        let tag_end = at + js[at..].find('>').unwrap_or(0);
        if js[tag_start..tag_end].contains("svelte-") {
            names.push(js[name_start..name_end].to_string());
        }
        from = name_end;
    }
    names.sort();
    names
}

#[test]
fn nesting_inside_a_functional_pseudo_class_is_not_a_wildcard() {
    // `:is(&)` is `:is(.card)` — it must not scope `.a` and `.b` as well.
    for rule in [
        ".card { :is(&) { color: red } }",
        ".card { :where(&) { color: red } }",
        ".card.wide { :is(&) { color: red } }",
        ".card { :is(&, .nope) { color: red } }",
    ] {
        assert_eq!(scoped(SCOPE_MARKUP, rule), ["card"], "{rule}");
    }
    assert_eq!(
        scoped(SCOPE_MARKUP, ".card { :is(&, .b) { color: red } }"),
        ["b", "card"]
    );
}

#[test]
fn nesting_inside_a_functional_pseudo_class_still_scopes_its_descendants() {
    // The opposite direction: the emitted `.a:where(.svelte-…)` can only match
    // if `<p class="a">` was scoped too.
    for (rule, expected) in [
        (".card { :is(&) .a { color: red } }", ["a", "card"]),
        (".card { :is(&) .b { color: red } }", ["b", "card"]),
        (".card { :is(&) > .a { color: red } }", ["a", "card"]),
        (".card { :where(&) .a { color: red } }", ["a", "card"]),
    ] {
        assert_eq!(scoped(SCOPE_MARKUP, rule), expected, "{rule}");
    }
}

#[test]
fn nesting_resolution_leaves_the_controls_alone() {
    // `:not(&)` matches everything except the parent, so all three stay scoped —
    // the axis is `&` inside `:is`/`:where`/`:has`, not nesting as such.
    assert_eq!(
        scoped(SCOPE_MARKUP, ".card { :not(&) { color: red } }"),
        ["a", "b", "card"]
    );
    // A parent that matches nothing resolves `&` to nothing.
    assert!(scoped(SCOPE_MARKUP, ".nope { :is(&) { color: red } }").is_empty());
    // No parent to resolve against: `&` is kept as written.
    assert_eq!(
        scoped(SCOPE_MARKUP, ":is(&) { color: red }"),
        ["a", "b", "card"]
    );
}

#[test]
fn has_of_the_parent_is_pruned_when_the_parent_is_not_a_descendant() {
    // `:has(&)` under `.card` asks for a `.card` inside a `.card`.
    for rule in [
        ".card { :has(&) { color: red } }",
        ".card { :has(&) .a { color: red } }",
    ] {
        let css = build(&styled(SCOPE_MARKUP, rule)).css;
        assert!(
            css.contains("(empty)") || css.contains("(unused)"),
            "{rule} -> {css:?}"
        );
    }
    // ...and kept when it is: a `.card` nested in a `.card`.
    let nested = "<div class=\"card\" data-n=\"outer\"><div class=\"card\" data-n=\"inner\"><p class=\"a\" data-n=\"a\">x</p></div></div>";
    let css = build(&styled(nested, ".card { :has(&) { color: red } }")).css;
    assert!(!css.contains("(unused)"), "got {css:?}");
}

// ---------------------------------------------------------------------------
// #3133 — a `:has()` inside a `:has()` argument
// ---------------------------------------------------------------------------

#[test]
fn a_has_nested_in_a_has_argument_is_resolved_against_its_own_subject() {
    // No descendant of `div.a` has a `.b` of its own, so the outer `:has()`
    // never matches — the argument is not "a pseudo-class, therefore anything".
    let src = styled(
        "<div class=\"a\"><b class=\"b\">x</b></div>",
        ".a:has(:has(.b)) { color: red }",
    );
    let out = build(&src);
    assert!(out.css.contains("(unused)"), "got {:?}", out.css);
    // ...and it is kept when one does.
    let src = styled(
        "<div class=\"a\"><div class=\"mid\"><b class=\"b\">x</b></div></div>",
        ".a:has(:has(.b)) { color: red }",
    );
    assert!(!build(&src).css.contains("(unused)"));
}
