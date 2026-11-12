use oxc_syntax::operator::{BinaryOperator, UnaryOperator};

use super::{Value, bigint, pow, to_int32};

pub(super) fn binary(op: BinaryOperator, a: &Value, b: &Value) -> Option<Value> {
    use BinaryOperator::{
        Addition as Add, BitwiseAnd as BitAnd, BitwiseOR as BitOr, BitwiseXOR as BitXor,
        Division as Div, Equality as Eq, Exponential as Exp, GreaterEqualThan as GtEq,
        GreaterThan as Gt, In, Inequality as NotEq, Instanceof as InstanceOf,
        LessEqualThan as LtEq, LessThan as Lt, Multiplication as Mul, Remainder, ShiftLeft as Shl,
        ShiftRight as Shr, ShiftRightZeroFill as UShr, StrictEquality as StrictEq,
        StrictInequality as StrictNotEq, Subtraction as Sub,
    };
    if matches!(a, Value::RegExp { .. }) || matches!(b, Value::RegExp { .. }) {
        let both = matches!(a, Value::RegExp { .. }) && matches!(b, Value::RegExp { .. });
        // Objects compare by identity; anywhere else an object is its string.
        return match op {
            StrictEq => Some(Value::Boolean(a == b)),
            StrictNotEq => Some(Value::Boolean(a != b)),
            Eq if both => Some(Value::Boolean(a == b)),
            NotEq if both => Some(Value::Boolean(a != b)),
            In | InstanceOf => None,
            _ => binary(op, &a.primitive(), &b.primitive()),
        };
    }
    if matches!(a, Value::BigInt(_)) || matches!(b, Value::BigInt(_)) {
        return bigint::binary(op, a, b);
    }
    let num = |f: fn(f64, f64) -> f64| Some(Value::Number(f(a.to_number(), b.to_number())));
    let int = |f: fn(i32, i32) -> i32| {
        Some(Value::Number(f64::from(f(
            to_int32(a.to_number()),
            to_int32(b.to_number()),
        ))))
    };
    match op {
        Add => {
            if matches!(a, Value::String(_)) || matches!(b, Value::String(_)) {
                Some(Value::String(format!(
                    "{}{}",
                    a.to_javascript_string(),
                    b.to_javascript_string()
                )))
            } else {
                num(|x, y| x + y)
            }
        }
        Sub => num(|x, y| x - y),
        Mul => num(|x, y| x * y),
        Div => num(|x, y| x / y),
        Remainder => num(|x, y| x % y),
        Exp => num(pow),
        BitAnd => int(|x, y| x & y),
        BitOr => int(|x, y| x | y),
        BitXor => int(|x, y| x ^ y),
        Shl => int(|x, y| x.wrapping_shl(y.cast_unsigned() & 31)),
        Shr => int(|x, y| x.wrapping_shr(y.cast_unsigned() & 31)),
        UShr => Some(Value::Number(f64::from(
            to_int32(a.to_number())
                .cast_unsigned()
                .wrapping_shr(to_int32(b.to_number()).cast_unsigned() & 31),
        ))),
        StrictEq => Some(Value::Boolean(strict_eq(a, b))),
        StrictNotEq => Some(Value::Boolean(!strict_eq(a, b))),
        Eq => Some(Value::Boolean(loose_eq(a, b))),
        NotEq => Some(Value::Boolean(!loose_eq(a, b))),
        Lt | LtEq | Gt | GtEq => {
            let ord = if let (Value::String(x), Value::String(y)) = (a, b) {
                Some(x.encode_utf16().cmp(y.encode_utf16()))
            } else {
                a.to_number().partial_cmp(&b.to_number())
            };
            let Some(ord) = ord else {
                return Some(Value::Boolean(false));
            };
            Some(Value::Boolean(match op {
                Lt => ord.is_lt(),
                LtEq => ord.is_le(),
                Gt => ord.is_gt(),
                _ => ord.is_ge(),
            }))
        }
        // `in` / `instanceof` on primitives throw at runtime; nothing to fold.
        In | InstanceOf => None,
    }
}

fn strict_eq(a: &Value, b: &Value) -> bool {
    match (a, b) {
        (Value::Number(x), Value::Number(y)) => x == y,
        _ => a == b,
    }
}

fn loose_eq(a: &Value, b: &Value) -> bool {
    match (a, b) {
        (Value::Null | Value::Undefined, Value::Null | Value::Undefined) => true,
        (Value::Null | Value::Undefined, _) | (_, Value::Null | Value::Undefined) => false,
        (Value::String(_), Value::String(_))
        | (Value::Boolean(_), Value::Boolean(_))
        | (Value::Number(_), Value::Number(_)) => strict_eq(a, b),
        _ => a.to_number() == b.to_number(),
    }
}

pub(super) fn unary(op: UnaryOperator, a: &Value) -> Value {
    if let Value::BigInt(value) = a {
        return bigint::unary(op, value);
    }
    match op {
        UnaryOperator::LogicalNot => Value::Boolean(!a.truthy()),
        UnaryOperator::UnaryNegation => Value::Number(-a.to_number()),
        UnaryOperator::UnaryPlus => Value::Number(a.to_number()),
        UnaryOperator::BitwiseNot => Value::Number(f64::from(!to_int32(a.to_number()))),
        UnaryOperator::Typeof => Value::String(
            match a {
                Value::String(_) => "string",
                Value::Number(_) => "number",
                Value::Boolean(_) => "boolean",
                Value::Null | Value::RegExp { .. } => "object",
                Value::Undefined => "undefined",
                _ => unreachable!("known values only"),
            }
            .into(),
        ),
        UnaryOperator::Void => Value::Undefined,
        UnaryOperator::Delete => Value::Boolean(true),
    }
}
