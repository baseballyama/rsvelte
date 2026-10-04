use std::cmp::Ordering;

use num_bigint::{BigInt, Sign};
use num_traits::FromPrimitive;
use rsvelte_typescript::operators::{BinaryOperator, UnaryOperator};

use super::Value;

pub(super) fn literal(raw: &str) -> Value {
    let digits = raw[..raw.len() - 1].replace('_', "");
    Value::BigInt(Box::new(
        parse(&digits).expect("the lexer validates bigint digits"),
    ))
}

fn parse(text: &str) -> Option<BigInt> {
    let text = text.trim_matches(|c: char| c.is_whitespace() || c == '\u{feff}');
    if text.is_empty() {
        return Some(BigInt::from(0));
    }
    let (radix, digits) = match text.get(..2) {
        Some("0x" | "0X") => (16, &text[2..]),
        Some("0o" | "0O") => (8, &text[2..]),
        Some("0b" | "0B") => (2, &text[2..]),
        _ => (10, text),
    };
    let unsigned = if radix == 10 {
        digits.strip_prefix(['+', '-']).unwrap_or(digits)
    } else {
        digits
    };
    if unsigned.is_empty()
        || !unsigned
            .bytes()
            .all(|byte| char::from(byte).is_digit(radix))
    {
        return None;
    }
    BigInt::parse_bytes(digits.as_bytes(), radix)
}

fn compare(value: &BigInt, other: &Value) -> Option<Ordering> {
    match other {
        Value::BigInt(other) => Some(value.cmp(other)),
        Value::String(other) => Some(value.cmp(&parse(other)?)),
        other => {
            let number = other.to_number();
            if number.is_nan() {
                return None;
            }
            if number == f64::INFINITY {
                return Some(Ordering::Less);
            }
            if number == f64::NEG_INFINITY {
                return Some(Ordering::Greater);
            }
            let integer = BigInt::from_f64(number)?;
            let order = value.cmp(&integer);
            Some(if order.is_eq() {
                0.0f64.partial_cmp(&number.fract())?
            } else {
                order
            })
        }
    }
}

pub(super) fn binary(op: BinaryOperator, a: &Value, b: &Value) -> Option<Value> {
    use BinaryOperator::{
        Add, BitAnd, BitOr, BitXor, Div, Eq, Exp, Gt, GtEq, In, InstanceOf, Lt, LtEq, Mul, NotEq,
        Remainder, Shl, Shr, StrictEq, StrictNotEq, Sub, UShr,
    };
    if op == Add && (matches!(a, Value::String(_)) || matches!(b, Value::String(_))) {
        return Some(Value::String(format!(
            "{}{}",
            a.to_javascript_string(),
            b.to_javascript_string()
        )));
    }
    if matches!(op, StrictEq | StrictNotEq) {
        return Some(Value::Boolean((a == b) == (op == StrictEq)));
    }
    if matches!(op, Eq | NotEq | Lt | LtEq | Gt | GtEq) {
        let order = if let Value::BigInt(value) = a {
            compare(value, b)
        } else if let Value::BigInt(value) = b {
            compare(value, a).map(Ordering::reverse)
        } else {
            unreachable!("one operand is bigint")
        };
        let equals = order.is_some_and(Ordering::is_eq)
            && !matches!(a, Value::Null | Value::Undefined)
            && !matches!(b, Value::Null | Value::Undefined);
        return Some(Value::Boolean(match op {
            Eq => equals,
            NotEq => !equals,
            Lt => order.is_some_and(Ordering::is_lt),
            LtEq => order.is_some_and(Ordering::is_le),
            Gt => order.is_some_and(Ordering::is_gt),
            _ => order.is_some_and(Ordering::is_ge),
        }));
    }
    let (Value::BigInt(a), Value::BigInt(b)) = (a, b) else {
        return None;
    };
    let (a, b) = (a.as_ref(), b.as_ref());
    let result = match op {
        Add => a + b,
        Sub => a - b,
        Mul => a * b,
        Div if b.sign() != Sign::NoSign => a / b,
        Remainder if b.sign() != Sign::NoSign => a % b,
        Exp => a.pow(u32::try_from(b).ok()?),
        BitAnd => a & b,
        BitOr => a | b,
        BitXor => a ^ b,
        Shl | Shr => {
            let shift = i32::try_from(b).ok()?;
            let left = (op == Shl) == (shift >= 0);
            let amount = shift.unsigned_abs();
            if left { a << amount } else { a >> amount }
        }
        Div | Remainder | UShr | In | InstanceOf => return None,
        _ => unreachable!("comparisons are handled before arithmetic"),
    };
    Some(Value::BigInt(Box::new(result)))
}

pub(super) fn unary(op: UnaryOperator, value: &BigInt) -> Value {
    match op {
        UnaryOperator::Neg => Value::BigInt(Box::new(-value)),
        UnaryOperator::BitNot => Value::BigInt(Box::new(!value)),
        UnaryOperator::Plus => Value::Unknown,
        UnaryOperator::Not => Value::Boolean(value.sign() == Sign::NoSign),
        UnaryOperator::TypeOf => Value::String("bigint".into()),
        UnaryOperator::Void => Value::Undefined,
        UnaryOperator::Delete => Value::Boolean(true),
    }
}

#[cfg(test)]
mod tests {
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
}
