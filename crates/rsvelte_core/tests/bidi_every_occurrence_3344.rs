//! `bidirectional_control_characters` is reported for **every** occurrence.
//!
//! Upstream shares one module-level `g` regex between `Text.js`, `Literal.js`
//! and `TemplateElement.js`. Only `Text.js` resets `lastIndex`, so a `.test()`
//! that matched leaves the cursor mid-string and the next `.test()` — on a
//! different string — starts from there and can answer `false` for a string that
//! does contain the character. rsvelte's checks are stateless, so it reports all
//! of them.
//!
//! This is deliberately NOT byte-compatible with the official compiler. The
//! warning exists to surface invisible characters that make source read in a
//! different order than it runs; withholding it is a diagnostic difference, not
//! a formatting one. See `upstream_issues/3344-svelte-bidi-regex-lastindex.md`
//! for the mechanism, the control, and the measured official verdicts.
//!
//! Without this file the divergence looks like an rsvelte defect to the next
//! person who diffs against official.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// U+202E RIGHT-TO-LEFT OVERRIDE.
const RLO: char = '\u{202e}';

fn bidi_warnings(src: &str) -> usize {
    let counts: Vec<usize> = [
        (GenerateMode::Client, false),
        (GenerateMode::Client, true),
        (GenerateMode::Server, false),
        (GenerateMode::Server, true),
    ]
    .into_iter()
    .map(|(generate, dev)| {
        compile(
            src,
            CompileOptions {
                filename: Some("T.svelte".into()),
                generate,
                dev,
                ..Default::default()
            },
        )
        .expect("compile")
        .warnings
        .iter()
        .filter(|w| w.code == "bidirectional_control_characters")
        .count()
    })
    .collect();
    assert!(
        counts.iter().all(|c| *c == counts[0]),
        "targets disagree ({counts:?}) for:\n{src}"
    );
    counts[0]
}

/// Two string literals in one script. Official reports one — the second
/// `.test()` starts at the index the first one left behind.
#[test]
fn two_string_literals_in_a_script_report_twice() {
    let src = format!("<script>let a = \"x{RLO}y\"; let b = \"p{RLO}q\";</script>\n");
    assert_eq!(bidi_warnings(&src), 2);
}

/// Three of them. Official reports the first and the *third*: the failing second
/// `.test()` resets the cursor. The count alone cannot show that, which is why
/// the two-literal case above is kept separately.
#[test]
fn three_string_literals_in_a_script_report_three_times() {
    let src = format!(
        "<script>let a = \"x{RLO}y\"; let b = \"p{RLO}q\"; let c = \"m{RLO}n\";</script>\n"
    );
    assert_eq!(bidi_warnings(&src), 3);
}

/// Two quasis of one template literal — consecutive `TemplateElement` visits
/// with nothing in between to reset the cursor.
#[test]
fn two_quasis_of_one_template_literal_report_twice() {
    let src = format!("<b>{{`a{RLO}b${{1}}c{RLO}d`}}</b>\n");
    assert_eq!(bidi_warnings(&src), 2);
}

/// Two separate string literals in the template.
#[test]
fn two_template_expressions_report_twice() {
    let src = format!("<b>{{\"a{RLO}b\"}}{{\"c{RLO}d\"}}</b>\n");
    assert_eq!(bidi_warnings(&src), 2);
}

/// The shapes where official already reports every occurrence, as controls: a
/// `Text` visit resets `lastIndex`, so these agree with the official compiler
/// and must keep agreeing.
#[test]
fn the_shapes_official_already_gets_right_are_unchanged() {
    // Two Text nodes.
    assert_eq!(bidi_warnings(&format!("<b>a{RLO}b c{RLO}d</b>\n")), 2);
    // Text between two string literals resets the cursor twice.
    assert_eq!(
        bidi_warnings(&format!("<b>{{\"a{RLO}b\"}}t{RLO}x{{\"c{RLO}d\"}}</b>\n")),
        3
    );
    // A single occurrence has nothing to be suppressed by.
    assert_eq!(
        bidi_warnings(&format!("<script>let a = \"x{RLO}y\";</script>\n")),
        1
    );
    // The second occurrence sits past the carried-over index, so official finds
    // it too — the same count for a different reason.
    assert_eq!(
        bidi_warnings(&format!(
            "<script>let a = \"x{RLO}y\"; let b = \"pppppppppp{RLO}q\";</script>\n"
        )),
        2
    );
}

/// Source with no bidi character warns zero times — the negative control for a
/// check that is now "always on".
#[test]
fn source_without_a_bidi_character_warns_zero_times() {
    assert_eq!(
        bidi_warnings("<script>let a = \"xy\"; let b = \"pq\";</script>\n"),
        0
    );
    assert_eq!(bidi_warnings("<b>{`ab${1}cd`}</b>\n"), 0);
}
