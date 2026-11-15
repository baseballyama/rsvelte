//! `ESLint`'s reports of JavaScript disable directives that turned nothing off.

use super::{UNDEF, configuration, lint_with, message};
use crate::LintSettings;

const UNUSED: &str = rsvelte_lint_runner::finding::UNUSED_DIRECTIVE;

fn stale(rules: &str) -> String {
    format!("Unused eslint-disable directive (no problems were reported from {rules}).")
}

#[test]
fn javascript_reports_a_disable_directive_that_turned_nothing_off() {
    let found = lint_with(
        "<script>\n  // eslint-disable-next-line no-undef\n  let b;\n  let c; // \
            eslint-disable-line no-undef\n  /* eslint-disable no-undef */\n</script>\n",
        &configuration("", LintSettings::default()),
    );
    let expected = stale("'no-undef'");
    assert_eq!(
        message(&found),
        [
            (UNUSED, 2, 3, expected.as_str()),
            (UNUSED, 4, 10, expected.as_str()),
            (UNUSED, 5, 3, expected.as_str()),
        ]
    );
}

#[test]
fn javascript_does_not_report_a_used_or_unnamed_directive() {
    let configuration = configuration("", LintSettings::default());
    for code in [
        "<script>\n// eslint-disable-next-line no-undef\na;\n</script>\n",
        "<script>\na; // eslint-disable-line no-undef\n</script>\n",
        "<script>\n/* eslint-disable no-undef */\na;\n</script>\n",
        "<script>\n// eslint-disable-next-line\nlet b;\n/* eslint-disable */\n</script>\n",
    ] {
        assert_eq!(lint_with(code, &configuration), [], "{code}");
    }
}

#[test]
fn javascript_names_every_rule_of_a_directive_that_turned_nothing_off() {
    let configuration = configuration("", LintSettings::default());
    let found = lint_with(
        "<script>\n/* eslint-disable no-undef, space-infix-ops */\n/* eslint-disable no-undef, \
            space-infix-ops, svelte/no-at-debug-tags */\n</script>\n",
        &configuration,
    );
    let two = stale("'no-undef' or 'space-infix-ops'");
    let three = stale("'no-undef', 'space-infix-ops', or 'svelte/no-at-debug-tags'");
    assert_eq!(
        message(&found),
        [(UNUSED, 2, 1, two.as_str()), (UNUSED, 3, 1, three.as_str())]
    );
}

// Whether a rule that does not run used the directive decides between one report and one per
// rule, so a directive that also names one is reported only beside a name that was used.
#[test]
fn javascript_reports_each_unused_rule_beside_a_used_one() {
    let configuration = configuration("", LintSettings::default());
    let found = lint_with(
        "<script>\n/* eslint-disable no-undef, space-infix-ops, x/off */\na;\n</script>\n",
        &configuration,
    );
    let infix = stale("'space-infix-ops'");
    assert_eq!(message(&found), [(UNUSED, 2, 1, infix.as_str())]);
    let found = lint_with(
        "<script>\n// eslint-disable-next-line no-undef, x/off\nlet b;\n</script>\n",
        &configuration,
    );
    assert_eq!(found, []);
}

// `ESLint` credits a finding to the latest directive that turns it off, and a line directive
// only when no block directive already did.
#[test]
fn javascript_credits_one_directive_per_finding() {
    let configuration = configuration("", LintSettings::default());
    let expected = stale("'no-undef'");
    let found = lint_with(
        "<script>\n/* eslint-disable no-undef */\n/* eslint-disable no-undef */\na;\n</script>\n",
        &configuration,
    );
    assert_eq!(message(&found), [(UNUSED, 2, 1, expected.as_str())]);
    let found = lint_with(
        "<script>\n/* eslint-disable no-undef */\n// eslint-disable-next-line no-undef\na;\n\
            </script>\n",
        &configuration,
    );
    assert_eq!(message(&found), [(UNUSED, 3, 1, expected.as_str())]);
    let found = lint_with(
        "<script>\n/* eslint-disable no-undef */\n/* eslint-enable no-undef */\na;\n</script>\n",
        &configuration,
    );
    assert_eq!(
        message(&found),
        [(UNUSED, 2, 1, expected.as_str()), (UNDEF, 4, 1, "stand-in")]
    );
}

// The processor keeps a report without a rule.
#[test]
fn template_directives_keep_the_report_of_an_unused_javascript_directive() {
    let found = lint_with(
        "<!-- eslint-disable -->\n<p>{b /* eslint-disable-line no-undef */}</p>\n",
        &configuration("", LintSettings::default()),
    );
    let expected = stale("'no-undef'");
    assert_eq!(message(&found), [(UNUSED, 2, 7, expected.as_str())]);
}
