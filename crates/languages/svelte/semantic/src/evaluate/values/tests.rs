use super::{Value, Values};

#[test]
fn membership_preserves_order_through_growth_and_duplicates() {
    let mut values = Values::Empty;
    let expected: Vec<_> = (0..200)
        .map(|index| Value::String(format!("value{index}")))
        .collect();
    for value in expected.iter().chain(expected.iter().rev()) {
        values.add(value.clone());
    }
    assert_eq!(values.into_vec(), expected);
}

#[test]
fn membership_uses_same_value_zero_for_numbers_and_exact_bigints() {
    let mut values = Values::Empty;
    for index in 0..16 {
        values.add(Value::String(format!("value{index}")));
    }
    for value in [
        Value::Number(0.0),
        Value::Number(-0.0),
        Value::Number(f64::NAN),
        Value::Number(f64::from_bits(f64::NAN.to_bits() + 1)),
    ] {
        values.add(value);
    }
    let bigint = num_bigint::BigInt::from(123);
    values.add(Value::BigInt(Box::new(bigint.clone())));
    values.add(Value::BigInt(Box::new(bigint)));
    let values = values.into_vec();
    assert_eq!(values.len(), 19);
    assert_eq!(values[16], Value::Number(0.0));
    assert_eq!(values[17], Value::Number(f64::NAN));
}
