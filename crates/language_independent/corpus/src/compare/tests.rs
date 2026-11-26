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
        ..TaskOutput::default()
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
    verdict(&official(expected), Some(&ours)).expect("the official side is valid")
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
fn javascript_syntax_errors_agree_on_the_code() {
    let error = |code: &str, message: &str, column: u32| {
        let at = format!(r#"{{"line":1,"column":{column}}}"#);
        format!(r#"{{"code":"{code}","message":"{message}","start":{at},"end":{at}}}"#)
    };
    let official = error("js_parse_error", "Unexpected token", 3);
    let ours =
        |code: &str, message: &str, column: u32| format!("[{}]", error(code, message, column));
    let judged = |ours: &str| judge(&[("error.json", &official)], &[], Some(ours));
    assert_eq!(
        judged(&ours("js_parse_error", "Unexpected token", 3)),
        Some(Verdict::Match)
    );
    assert_eq!(
        judged(&ours("js_parse_error", "Expected `;`", 5)),
        Some(Verdict::JsEquivalent)
    );
    assert_eq!(
        judged(&ours("expected_token", "Unexpected token", 3)),
        Some(Verdict::Mismatch)
    );
    let svelte = error("block_unclosed", "Block was left open", 3);
    assert_eq!(
        judge(
            &[("error.json", &svelte)],
            &[],
            Some(&ours("js_parse_error", "m", 3))
        ),
        Some(Verdict::Mismatch),
        "only a JavaScript syntax error is the parser's to word"
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
    let commented = r#"{"rules":["svelte/x","mine"],"findings":[]}"#;
    let quiet = [("lint.txt", "1:1 1:2 mine \"m\"\n")];
    assert_eq!(
        judge(&quiet, &[("lint.json", commented)], None),
        Some(Verdict::Mismatch),
        "a rule outside the configuration that a comment turns on is compared too"
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
fn findings_at_one_position_match_in_any_order() {
    let expected = [(
        "lint.txt",
        "1:1 1:2 svelte/x \"a\"\n1:1 1:2 no-unused-vars \"b\"\n2:1 2:2 svelte/x \"c\"\n",
    )];
    let finding = |rule: &str, message: &str, line: u32| {
        format!(
            concat!(
                r#"{{"rule":"{rule}","message":"{message}","#,
                r#""start":{{"line":{line},"column":1}},"end":{{"line":{line},"column":2}}}}"#,
            ),
            rule = rule,
            message = message,
            line = line,
        )
    };
    let ours = |findings: [String; 3]| {
        format!(
            r#"{{"rules":["svelte/x","no-unused-vars"],"findings":[{}]}}"#,
            findings.join(",")
        )
    };
    let swapped = ours([
        finding("no-unused-vars", "b", 1),
        finding("svelte/x", "a", 1),
        finding("svelte/x", "c", 2),
    ]);
    assert_eq!(
        judge(&expected, &[("lint.json", &swapped)], None),
        Some(Verdict::Match)
    );
    let moved = ours([
        finding("svelte/x", "c", 2),
        finding("svelte/x", "a", 1),
        finding("no-unused-vars", "b", 1),
    ]);
    assert_eq!(
        judge(&expected, &[("lint.json", &moved)], None),
        Some(Verdict::Mismatch)
    );
}

#[test]
fn labels_round_trip() {
    for v in Verdict::ALL {
        assert_eq!(Verdict::from_label(v.label()), Some(v));
    }
}

#[test]
fn lint_findings_and_json_agree_on_a_javascript_syntax_error_alone() {
    let official = [(
        "lint.txt",
        concat!(
            "1:1 - - \"Parsing error: Unexpected token\\nhttps://svelte.dev/e/js_parse_error\"\n",
            "2:1 2:2 svelte/x \"x\"\n",
        ),
    )];
    let ours = |message: &str, column: u32| {
        format!(
            concat!(
                r#"{{"rules":["svelte/x"],"findings":[{{"rule":null,"message":"{message}","#,
                r#""start":{{"line":1,"column":{column}}},"end":null}},"#,
                r#"{{"rule":"svelte/x","message":"x","start":{{"line":2,"column":1}},"#,
                r#""end":{{"line":2,"column":2}}}}]}}"#
            ),
            message = message,
            column = column,
        )
    };
    let link = "\\nhttps://svelte.dev/e/js_parse_error";
    assert_eq!(
        judge(
            &official,
            &[(
                "lint.json",
                &ours(&format!("Parsing error: Unexpected token{link}"), 1)
            )],
            None
        ),
        Some(Verdict::Match)
    );
    assert_eq!(
        judge(
            &official,
            &[(
                "lint.json",
                &ours(&format!("Parsing error: Expected `;`{link}"), 4)
            )],
            None
        ),
        Some(Verdict::JsEquivalent)
    );
    assert_eq!(
        judge(
            &official,
            &[("lint.json", &ours("Parsing error: Expected `;`", 4))],
            None
        ),
        Some(Verdict::Mismatch),
        "only a JavaScript syntax error is the parser's to word"
    );
    let diagnostic = |message: &str, line: u32| {
        format!(r#"[{{"code":-1,"message":"{message}{link}","start":{{"line":{line}}}}}]"#)
    };
    let json = [("json", diagnostic("Unexpected token", 0))];
    let json: Vec<(&str, &str)> = json.iter().map(|(n, b)| (*n, b.as_str())).collect();
    assert_eq!(
        judge(
            &json,
            &[("json", &diagnostic("Unexpected JSX expression", 2))],
            None
        ),
        Some(Verdict::JsEquivalent)
    );
    assert_eq!(
        judge(&json, &[("json", "[]")], None),
        Some(Verdict::Mismatch)
    );
}
