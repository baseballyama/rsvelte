use std::collections::BTreeMap;

use super::{Ratchet, Row, Verdict, compare, lint, verdict};

fn rows(rows: &[(&str, Verdict)]) -> Vec<Row> {
    rows.iter().map(|(e, v)| ((*e).to_owned(), *v)).collect()
}

#[test]
fn only_diagnostics_where_the_official_tool_wrote_output_is_a_refusal() {
    let refused = rows(&[
        ("diagnostics.json", Verdict::Unexpected),
        ("js", Verdict::Missing),
    ]);
    assert_eq!(verdict(&refused), None);
    let missing = rows(&[("js", Verdict::Missing)]);
    assert_eq!(verdict(&missing), Some(Verdict::Missing));
    let worse = rows(&[
        ("diagnostics.json", Verdict::Unexpected),
        ("js", Verdict::Mismatch),
    ]);
    assert_eq!(verdict(&worse), Some(Verdict::Mismatch));
    assert_eq!(verdict(&[]), Some(Verdict::Match));
}

#[test]
fn files_are_compared_by_kind() {
    assert_eq!(compare("js", "f('a');", "f(\"a\")"), Ok(Verdict::Match));
    assert_eq!(compare("js", "f(a);", "f(b)"), Ok(Verdict::Mismatch));
    assert_eq!(compare("js", "f(a);", "f("), Ok(Verdict::Unparseable));
    assert!(
        compare("js", "f(", "f()").is_err(),
        "the official side must parse"
    );
    assert_eq!(compare("css", "a{}", "a {}"), Ok(Verdict::Mismatch));
    assert_eq!(
        compare("json", "{\"a\":1,\"b\":2}", "{\"b\":2,\"a\":1}"),
        Ok(Verdict::Match)
    );
}

#[test]
fn lint_findings_are_compared_by_the_rules_rsvelte_ran() {
    let official = serde_json::json!({
        "rules": ["a", "b"],
        "findings": [{"rule": "a", "line": 1}, {"rule": "b", "line": 2}, {"rule": null}],
    });
    let ran_a =
        serde_json::json!({"rules": ["a"], "findings": [{"rule": "a", "line": 1}, {"rule": null}]});
    assert_eq!(lint(official.clone(), ran_a), Ok(true));
    let wrong = serde_json::json!({"rules": ["a"], "findings": [{"rule": null}]});
    assert_eq!(lint(official.clone(), wrong), Ok(false));
    let unknown = serde_json::json!({"rules": ["c"], "findings": [{"rule": null}]});
    assert_eq!(lint(official, unknown), Ok(false));
}

#[test]
fn the_ratchet_is_two_sided_and_records_only_what_it_owns() {
    let corpus = std::env::temp_dir().join(format!("rsvelte-ratchet-{}", std::process::id()));
    drop(std::fs::remove_dir_all(&corpus));
    std::fs::create_dir_all(corpus.join("_registry")).unwrap();
    let file = corpus.join("_registry/parity.json");
    let entry = |k: &str, v: &str| format!("\t\"{k}\": \"{v}\"");
    let text = |entries: &[String]| format!("{{\n{}\n}}\n", entries.join(",\n"));
    std::fs::write(
        &file,
        text(&[
            entry("a/x u", "match"),
            entry("a/x v", "missing"),
            entry("b/x u", "mismatch"),
        ]),
    )
    .unwrap();
    let owned = |k: &str| k.starts_with("a/");
    let map = |entries: &[(&str, Verdict)]| -> BTreeMap<String, Verdict> {
        entries.iter().map(|(k, v)| ((*k).to_owned(), *v)).collect()
    };
    let same = map(&[("a/x u", Verdict::Match), ("a/x v", Verdict::Missing)]);
    let load = || Ratchet::load(&corpus).unwrap();
    assert_eq!(load().check(&same, owned, false), Ok(Vec::new()));
    let better = map(&[
        ("a/x u", Verdict::Match),
        ("a/x v", Verdict::Match),
        ("a/x w", Verdict::Mismatch),
    ]);
    let moved = load().check(&better, owned, false).unwrap();
    assert_eq!(moved.len(), 2, "an improvement moves too: {moved:?}");
    let gone = load()
        .check(&map(&[("a/x u", Verdict::Match)]), owned, false)
        .unwrap();
    assert_eq!(
        gone,
        [(
            "a/x v".to_owned(),
            "missing".to_owned(),
            "refused".to_owned()
        )]
    );
    load().check(&better, owned, true).unwrap();
    assert_eq!(
        std::fs::read_to_string(&file).unwrap(),
        text(&[
            entry("a/x u", "match"),
            entry("a/x v", "match"),
            entry("a/x w", "mismatch"),
            entry("b/x u", "mismatch"),
        ]),
        "another harness's entries stay"
    );
    std::fs::remove_dir_all(corpus).unwrap();
}
