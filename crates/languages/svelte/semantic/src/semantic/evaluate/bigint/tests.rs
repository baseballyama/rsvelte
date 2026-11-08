use super::*;

#[test]
fn arithmetic_preserves_integer_precision() {
    let value = literal("9_007_199_254_740_993n");
    let result = binary(BinaryOperator::Add, &value, &literal("2n"));
    assert_eq!(result, Some(literal("9007199254740995n")));
    assert_eq!(
        binary(BinaryOperator::Shr, &literal("-3n"), &literal("1n")),
        Some(literal("-2n"))
    );
}

#[test]
fn comparisons_follow_javascript_conversion_rules() {
    let value = literal("9007199254740993n");
    assert_eq!(
        binary(
            BinaryOperator::Gt,
            &value,
            &Value::Number(9_007_199_254_740_992.0)
        ),
        Some(Value::Boolean(true))
    );
    for (other, equal) in [
        (Value::String(" 0x10 ".into()), true),
        (Value::String("1_6".into()), false),
        (Value::String("16.0".into()), false),
        (Value::Null, false),
    ] {
        assert_eq!(
            binary(BinaryOperator::Eq, &literal("16n"), &other),
            Some(Value::Boolean(equal))
        );
    }
    assert_eq!(
        binary(BinaryOperator::Lt, &literal("0n"), &Value::Number(0.5)),
        Some(Value::Boolean(true))
    );
}

#[test]
fn operations_that_throw_are_not_folded() {
    let value = literal("1n");
    assert_eq!(
        binary(BinaryOperator::Add, &value, &Value::Number(1.0)),
        None
    );
    assert_eq!(binary(BinaryOperator::Div, &value, &literal("0n")), None);
    assert_eq!(binary(BinaryOperator::UShr, &value, &value), None);
}
