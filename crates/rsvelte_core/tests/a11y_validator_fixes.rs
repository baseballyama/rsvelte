//! Issue #454 a11y/ARIA validator fixes: braille ARIA attributes are known
//! (H-077), dangerous `href` schemes match case-insensitively (H-081), and
//! valid nested lists don't trip the `<li>`-in-`<li>` descendant rule (H-082).

use rsvelte_core::{CompileOptions, compile};

fn warning_codes(src: &str) -> Vec<String> {
    match compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            ..Default::default()
        },
    ) {
        Ok(r) => r.warnings.into_iter().map(|w| w.code).collect(),
        Err(e) => vec![format!("COMPILE_ERROR: {e:?}")],
    }
}

/// H-077: `aria-braillelabel` / `aria-brailleroledescription` are valid ARIA
/// attributes and must not be flagged unknown.
#[test]
fn braille_aria_attributes_are_known() {
    let codes =
        warning_codes("<div aria-braillelabel=\"x\" aria-brailleroledescription=\"y\"></div>");
    assert!(
        !codes.iter().any(|c| c.contains("unknown_aria")),
        "braille ARIA attrs flagged unknown: {codes:?}"
    );
}

/// H-081: a `javascript:` href is flagged regardless of case.
#[test]
fn dangerous_href_scheme_is_case_insensitive() {
    assert!(
        warning_codes("<a href=\"JavaScript:void(0)\">x</a>")
            .iter()
            .any(|c| c == "a11y_invalid_attribute"),
        "mixed-case JavaScript: href not flagged"
    );
    // The canonical lowercase form is still flagged (no regression).
    assert!(
        warning_codes("<a href=\"javascript:void(0)\">x</a>")
            .iter()
            .any(|c| c == "a11y_invalid_attribute"),
    );
}

/// H-082: a `<li>` inside a nested `<ul>` is valid and must not report
/// `<li>` cannot be a descendant of `<li>`.
#[test]
fn nested_list_is_not_a_descendant_violation() {
    let codes = warning_codes("<ul><li><ul><li>x</li></ul></li></ul>");
    assert!(
        !codes.iter().any(|c| c.contains("COMPILE_ERROR")),
        "{codes:?}"
    );
    assert!(
        !codes.iter().any(|c| c.contains("invalid_placement")),
        "nested list falsely reported as descendant violation: {codes:?}"
    );
}
