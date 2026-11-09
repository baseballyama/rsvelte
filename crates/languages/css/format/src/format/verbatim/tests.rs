use super::{compound, keyframe, prelude};

/// What the printer checks: the value with its whitespace collapsed.
fn value(text: &str) -> bool {
    let mut collapsed = String::new();
    super::super::collapse(text, &mut collapsed);
    super::value(&collapsed)
}

// Each verdict is whether prettier 3.9.10 (prettier-plugin-svelte 4.1.1) printed the shape
// unchanged, measured one `<style>` per shape.

/// Kept shapes the checks refuse anyway, because the rule that keeps them is not ported.
const CONSERVATIVE: &[&str] = &[
    "1e3",
    "50.0%",
    "U+0025-00FF",
    "\\61",
    "+1px",
    "calc(1px+2px)",
];

/// The shapes a check answers wrongly: a rewritten one it passes, or a kept one it refuses
/// that is not in [`CONSERVATIVE`].
fn wrong<'t>(cases: impl IntoIterator<Item = (bool, &'t str, bool)>) -> Vec<&'t str> {
    cases
        .into_iter()
        .filter(|&(passes, text, kept)| {
            if kept {
                !passes && !CONSERVATIVE.contains(&text)
            } else {
                passes
            }
        })
        .map(|(_, text, _)| text)
        .collect()
}

#[test]
fn a_value_passes_only_when_prettier_keeps_it() {
    let cases = [
        ("red", true),
        ("Red", true),
        ("RED", true),
        ("1px", true),
        ("1PX", false),
        ("10%", true),
        ("0", true),
        ("0.5", true),
        ("0.50", false),
        (".5", false),
        ("1.", false),
        ("1.0", false),
        ("-1px", true),
        ("+1px", true),
        ("1e3", true),
        ("1E3", false),
        ("1em", true),
        ("#fff", true),
        ("#FFF", false),
        ("#abcdef", true),
        ("#AbC", false),
        ("a b", true),
        ("a  b", true),
        ("a,b", false),
        ("a, b", true),
        ("a ,b", false),
        ("rgb(0 0 0)", true),
        ("rgb(0,0,0)", false),
        ("rgb(0, 0, 0)", true),
        ("var(--x)", true),
        ("var(--x, 1px)", true),
        ("calc(1px + 2px)", true),
        ("calc(1px+2px)", true),
        ("calc( 1px + 2px )", false),
        ("url(a.png)", true),
        ("url( a.png )", false),
        ("url('a.png')", false),
        ("'a'", false),
        ("\"a\"", true),
        ("a !important", true),
        ("a!important", false),
        ("a ! important", false),
        ("a !IMPORTANT", false),
        ("1px solid red", true),
        ("translate(10px, 20px)", true),
        ("translate(10px,20px)", false),
        ("1px/2px", true),
        ("1px / 2px", true),
        ("none", true),
        ("inherit", true),
        ("-webkit-box", true),
        ("sans-serif", true),
        ("Arial, sans-serif", true),
        ("\"Open Sans\", sans-serif", true),
        ("0 0 0 1px rgba(0, 0, 0, 0.5)", true),
        ("linear-gradient(to right, red, blue)", true),
        ("10px 20px", true),
        ("auto", true),
        ("0s", true),
        ("1s ease-in-out", true),
        ("all 0.3s", true),
        ("U+0025-00FF", true),
        ("attr(data-x)", true),
        ("fit-content(10px)", true),
        ("minmax(0, 1fr)", true),
        ("repeat(2, 1fr)", true),
        ("1fr", true),
        ("--a", true),
        ("a-b", true),
        ("a_b", true),
        ("\\61", true),
        ("1px\t2px", true),
        ("red", true),
        ("red", true),
    ];
    let found = wrong(cases.map(|(text, kept)| (value(text), text, kept)));
    assert!(found.is_empty(), "{found:?}");
}

#[test]
fn a_compound_selector_passes_only_when_prettier_keeps_it() {
    let cases = [
        ("A", true),
        ("div.b", true),
        ("div#c", true),
        ("a:hover", true),
        ("a:HOVER", false),
        ("a::before", true),
        ("a:before", true),
        ("*", true),
        ("[href]", true),
        ("[href=x]", false),
        ("[href=\"x\"]", true),
        ("[href='x']", false),
        ("[ href ]", false),
        ("li:nth-child(2n+1)", false),
        ("li:nth-child(2n + 1)", true),
        ("li:nth-child(odd)", true),
        (":global(.a)", true),
        ("a:not(.b)", true),
        ("a:is(.b, .c)", true),
        (".A", true),
        (".a-B", true),
        ("#Id", true),
        ("svg|a", true),
        ("a:focus-visible", true),
        ("input::placeholder", true),
        (":root", true),
        ("a:hover::after", true),
        ("h1", true),
        ("H1", true),
        ("::selection", true),
        ("a:where(.b)", true),
        (":global(a:HOVER)", false),
    ];
    let found = wrong(cases.map(|(text, kept)| (compound(text), text, kept)));
    assert!(found.is_empty(), "{found:?}");
}

/// `--y:{a:b}` parses as a rule; prettier prints it as a custom property with a `;` after `}`.
#[test]
fn a_custom_property_read_as_a_rule_is_refused() {
    assert!(!compound("--y:"));
    assert!(!compound("a:"));
}

#[test]
fn an_at_rule_passes_only_when_prettier_keeps_it() {
    let cases = [
        (("media", "(min-width: 100px)"), true),
        (("media", "(min-width:100px)"), false),
        (("media", "screen and (max-width: 10px)"), true),
        (("media", "screen and (MAX-WIDTH: 10px)"), false),
        (("MEDIA", "screen"), false),
        (("supports", "(display: grid)"), true),
        (("supports", "(display:grid)"), false),
        (("media", "print"), true),
        (("container", "(min-width: 1px)"), true),
        (("layer", "a"), true),
        (("layer", "a, b"), true),
    ];
    let found =
        wrong(cases.map(|((name, text), kept)| (prelude(name) && prelude(text), text, kept)));
    assert!(found.is_empty(), "{found:?}");
}

#[test]
fn a_keyframe_selector_passes_only_when_prettier_keeps_it() {
    let cases = [
        ("from", true),
        ("to", true),
        ("50%", true),
        ("FROM", false),
        ("0%, 100%", false),
        ("0%,100%", false),
        ("50.0%", true),
    ];
    let found = wrong(cases.map(|(text, kept)| (keyframe(text), text, kept)));
    assert!(found.is_empty(), "{found:?}");
}

/// Prettier prints the `q` unit as `Q`.
#[test]
fn the_q_unit_is_refused() {
    assert!(!value("1q"));
    assert!(!value("calc(1q + 2px)"));
    assert!(value("1px"));
    assert!(!compound("1q"));
    assert!(!compound("-1q"));
    assert!(compound("a1q"));
}
