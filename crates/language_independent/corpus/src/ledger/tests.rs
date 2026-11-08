use std::collections::BTreeMap;

use super::{Move, Table, format, moves, read, table};
use crate::compare::Verdict;

fn now(entries: &[(&str, Verdict)]) -> BTreeMap<String, Verdict> {
    entries.iter().map(|(k, v)| ((*k).to_owned(), *v)).collect()
}

#[test]
fn lists_only_what_does_not_match_and_reads_back() {
    let all = now(&[
        ("s/a", Verdict::Match),
        ("s/b", Verdict::Mismatch),
        ("s/c", Verdict::Match),
    ]);
    let t = table(&all);
    let text = format("svelte.compile/client", &t);
    assert_eq!(text, "# svelte.compile/client: 2 match\ns/b\tmismatch\n");
    let dir = std::env::temp_dir().join(format!("rsvelte-ledger-{}", std::process::id()));
    std::fs::create_dir_all(&dir).expect("temp dir");
    let file = dir.join("client.txt");
    std::fs::write(&file, &text).expect("write");
    assert_eq!(read(&file), Ok(t));
    std::fs::remove_dir_all(&dir).expect("clean up");
}

#[test]
fn every_move_is_named_and_a_lost_match_is_counted() {
    let recorded = Table {
        matched: 2,
        listed: [
            ("s/b".to_owned(), Verdict::Mismatch),
            ("s/d".to_owned(), Verdict::Refused),
        ]
        .into_iter()
        .collect(),
    };
    let current = now(&[
        ("s/a", Verdict::Missing),
        ("s/b", Verdict::Match),
        ("s/c", Verdict::Match),
    ]);
    let (moved, count) = moves(&recorded, &current, |_| true, true);
    assert_eq!(
        moved,
        [
            Move {
                unit: "s/a".to_owned(),
                from: Some(Verdict::Match),
                to: Some(Verdict::Missing)
            },
            Move {
                unit: "s/b".to_owned(),
                from: Some(Verdict::Mismatch),
                to: Some(Verdict::Match)
            },
            Move {
                unit: "s/d".to_owned(),
                from: Some(Verdict::Refused),
                to: None
            },
        ]
    );
    assert_eq!(count, None, "2 matches before, 2 after");
    let (_, count) = moves(&recorded, &now(&[("s/c", Verdict::Match)]), |_| true, true);
    assert_eq!(count, Some((2, 1)));
    let (moved, count) = moves(&recorded, &now(&[]), |u| u == "s/b", false);
    assert_eq!(moved.len(), 1, "an unselected unit is not compared");
    assert_eq!(count, None, "a filtered run does not compare the count");
}
