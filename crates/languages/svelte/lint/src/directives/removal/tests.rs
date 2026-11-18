use super::rule_removal;

/// `list` with `rule`'s removal applied, as `ESLint` 10.14's `--fix` leaves it.
fn removed(list: &str, rule: &str) -> String {
    let (from, to) = rule_removal(list, rule).expect(rule);
    format!("{}{}", &list[..from], &list[to..])
}

#[test]
fn a_rule_name_goes_with_one_of_its_commas() {
    assert_eq!(removed("no-undef, eqeqeq", "eqeqeq"), "no-undef");
    assert_eq!(removed("no-undef,eqeqeq", "eqeqeq"), "no-undef");
    assert_eq!(removed("eqeqeq , no-undef", "eqeqeq"), "no-undef");
    assert_eq!(
        removed("no-undef , eqeqeq , no-console", "no-console"),
        "no-undef , eqeqeq"
    );
    assert_eq!(removed("a , eqeqeq , b", "eqeqeq"), "a , b");
    assert_eq!(
        removed("no-console, 'eqeqeq', no-undef", "eqeqeq"),
        "no-console, no-undef"
    );
    assert_eq!(
        removed("no-undef, eqeqeq, no-undef", "eqeqeq"),
        "no-undef, no-undef"
    );
}

#[test]
fn a_name_matches_only_whole() {
    assert_eq!(removed("eqeqeq-x, eqeqeq", "eqeqeq"), "eqeqeq-x");
    assert_eq!(rule_removal("eqeqeq-x, y", "eqeqeq"), None);
}
