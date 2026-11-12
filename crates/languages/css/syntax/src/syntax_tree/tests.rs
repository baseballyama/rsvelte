use super::AttributeOperator;

#[test]
fn an_empty_value_matches_nothing_except_with_equal_and_dash() {
    for operator in [
        AttributeOperator::Includes,
        AttributeOperator::Prefix,
        AttributeOperator::Suffix,
        AttributeOperator::Substring,
    ] {
        assert!(!operator.matches("", "", false), "{operator:?}");
        assert!(!operator.matches("a b", "", false), "{operator:?}");
    }
    assert!(AttributeOperator::Equal.matches("", "", false));
    assert!(AttributeOperator::Dash.matches("", "", false));
}
