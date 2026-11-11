use rsvelte_kernel::computation::task::{OutputFile, TaskOutput};

use super::{Ours, Verdict, verdict};
use crate::pack::Entry;

fn official<'a>(files: &[(&'a str, &'a str)]) -> Vec<Entry<'a>> {
    files
        .iter()
        .map(|&(attributes, body)| Entry {
            path: "a.svelte",
            attributes,
            body,
        })
        .collect()
}

fn output(files: &[(&str, &str)]) -> TaskOutput {
    TaskOutput {
        files: files
            .iter()
            .map(|&(name, text)| OutputFile {
                name: name.to_owned(),
                text: text.to_owned(),
            })
            .collect(),
        diagnostics: Vec::new(),
    }
}

fn judge(
    expected: &[(&str, &str)],
    files: &[(&str, &str)],
    diagnostics: Option<&str>,
) -> Option<Verdict> {
    let out = output(files);
    let ours = Ours {
        output: &out,
        diagnostics: diagnostics.map(str::to_owned),
    };
    verdict(
        &official(expected),
        Some(&ours),
        &["no-unused-vars".to_owned(), "svelte/x".to_owned()],
    )
    .expect("the official side is valid")
}

const WARNING: &str = concat!(
    r#"[{"code":"w","message":"m","start":{"line":1,"column":0,"character":0},"#,
    r#""end":{"line":1,"column":1,"character":1}}]"#
);
const DIAGNOSTIC: &str =
    r#"[{"code":"w","message":"m","start":{"line":1,"column":0},"end":{"line":1,"column":1}}]"#;

#[test]
fn javascript_is_a_tree_and_a_stylesheet_is_bytes() {
    let expected = [("css", ".a{}"), ("js", "f( 1 )")];
    assert_eq!(
        judge(&expected, &[("js", "f(1);"), ("css", ".a{}")], None),
        Some(Verdict::Match)
    );
    assert_eq!(
        judge(&expected, &[("js", "f(1);"), ("css", ".a {}")], None),
        Some(Verdict::Mismatch)
    );
    assert_eq!(
        judge(&expected, &[("js", "f(")], None),
        Some(Verdict::Unparseable)
    );
    assert_eq!(
        judge(&expected, &[("js", "f(1)")], None),
        Some(Verdict::Missing)
    );
}

#[test]
fn warnings_pair_with_diagnostics() {
    let expected = [("js", "f()"), ("warnings.json", WARNING)];
    assert_eq!(
        judge(&expected, &[("js", "f()")], Some(DIAGNOSTIC)),
        Some(Verdict::Match)
    );
    assert_eq!(
        judge(&expected, &[("js", "f()")], None),
        Some(Verdict::Missing)
    );
    assert_eq!(
        judge(&[("js", "f()")], &[("js", "f()")], Some(DIAGNOSTIC)),
        Some(Verdict::Unexpected)
    );
}

#[test]
fn rejection_on_either_side() {
    let error = concat!(
        r#"{"code":"w","message":"m","start":{"line":1,"column":0,"character":0},"#,
        r#""end":{"line":1,"column":1,"character":1}}"#
    );
    assert_eq!(
        judge(&[("error.json", error)], &[], Some(DIAGNOSTIC)),
        Some(Verdict::Match)
    );
    assert_eq!(
        judge(&[("error.json", error)], &[("js", "f()")], None),
        Some(Verdict::Unexpected)
    );
    assert_eq!(
        judge(&[("error.txt", "oops\n")], &[], Some("[]")),
        Some(Verdict::Match)
    );
    assert_eq!(
        judge(&[("js", "f()")], &[], Some(DIAGNOSTIC)),
        Some(Verdict::Refused)
    );
    assert_eq!(judge(&[], &[], None), None);
    assert_eq!(
        judge(&[], &[("js", "f()")], None),
        Some(Verdict::Unexpected)
    );
}

#[test]
fn lint_compares_only_the_rules_rsvelte_ran() {
    let expected = [(
        "lint.txt",
        "1:1 1:2 svelte/x \"x\"\n2:1 - other \"o\"\n3:1 3:2 no-unused-vars \"u\"\n",
    )];
    let ours = concat!(
        r#"{"rules":["svelte/x","no-unused-vars"],"findings":["#,
        r#"{"rule":"svelte/x","message":"x","start":{"line":1,"column":1},"#,
        r#""end":{"line":1,"column":2}},"#,
        r#"{"rule":"no-unused-vars","message":"u","start":{"line":3,"column":1},"#,
        r#""end":{"line":3,"column":2}}]}"#
    );
    assert_eq!(
        judge(&expected, &[("lint.json", ours)], None),
        Some(Verdict::Match)
    );
    let unknown = r#"{"rules":["mine"],"findings":[]}"#;
    assert_eq!(
        judge(&expected, &[("lint.json", unknown)], None),
        Some(Verdict::Mismatch)
    );
    let fewer = r#"{"rules":["svelte/x"],"findings":[]}"#;
    assert_eq!(
        judge(&expected, &[("lint.json", fewer)], None),
        Some(Verdict::Mismatch)
    );
}

#[test]
fn an_unused_directive_counts_only_for_a_rule_rsvelte_ran() {
    let expected = [(
        "lint.txt",
        concat!(
            "1:1 1:2 - \"Unused eslint-disable directive ",
            "(no problems were reported from 'no-console').\"\n",
            "2:1 2:2 - \"Unused eslint-disable directive ",
            "(no problems were reported from 'svelte/x').\"\n",
        ),
    )];
    let ours = concat!(
        r#"{"rules":["svelte/x"],"findings":[{"rule":null,"#,
        r#""message":"Unused eslint-disable directive "#,
        r#"(no problems were reported from 'svelte/x').","#,
        r#""start":{"line":2,"column":1},"end":{"line":2,"column":2}}]}"#
    );
    assert_eq!(
        judge(&expected, &[("lint.json", ours)], None),
        Some(Verdict::Match)
    );
    let none = r#"{"rules":["svelte/x"],"findings":[]}"#;
    assert_eq!(
        judge(&expected, &[("lint.json", none)], None),
        Some(Verdict::Mismatch)
    );
}

#[test]
fn labels_round_trip() {
    for v in Verdict::ALL {
        assert_eq!(Verdict::from_label(v.label()), Some(v));
    }
}
