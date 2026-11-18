//! Unary and binary operators, and JavaScript's comparisons.

use oxc_ast::ast::{BinaryOperator, UnaryOperator};

use super::Value;
use super::conversions::{
    to_int32, to_number, to_primitive, to_string, to_uint32, truthy, type_of,
};

pub(super) fn unary(operator: UnaryOperator, value: &Value) -> Option<Value> {
    Some(match operator {
        UnaryOperator::UnaryNegation => Value::Number(-to_number(value)?),
        UnaryOperator::UnaryPlus => Value::Number(to_number(value)?),
        UnaryOperator::LogicalNot => Value::Boolean(!truthy(value)),
        UnaryOperator::BitwiseNot => Value::Number(f64::from(!to_int32(value)?)),
        UnaryOperator::Typeof => Value::String(type_of(value).into()),
        UnaryOperator::Void => Value::Undefined,
        UnaryOperator::Delete => return None,
    })
}

pub(super) fn binary(operator: BinaryOperator, left: &Value, right: &Value) -> Option<Value> {
    use BinaryOperator as B;
    let numbers = || Some((to_number(left)?, to_number(right)?));
    Some(match operator {
        B::Equality => Value::Boolean(loose_equals(left, right)?),
        B::Inequality => Value::Boolean(!loose_equals(left, right)?),
        B::StrictEquality => Value::Boolean(strict_equals(left, right)?),
        B::StrictInequality => Value::Boolean(!strict_equals(left, right)?),
        B::LessThan => Value::Boolean(less_than(left, right)? == Order::Less),
        B::GreaterThan => Value::Boolean(less_than(right, left)? == Order::Less),
        B::LessEqualThan => Value::Boolean(less_than(right, left)? == Order::NotLess),
        B::GreaterEqualThan => Value::Boolean(less_than(left, right)? == Order::NotLess),
        B::Addition => {
            let (left, right) = (to_primitive(left)?, to_primitive(right)?);
            if matches!(left, Value::String(_)) || matches!(right, Value::String(_)) {
                let mut out = to_string(&left)?;
                out.push_str(&to_string(&right)?);
                Value::String(out)
            } else {
                Value::Number(to_number(&left)? + to_number(&right)?)
            }
        }
        B::Subtraction => numbers().map(|(a, b)| Value::Number(a - b))?,
        B::Multiplication => numbers().map(|(a, b)| Value::Number(a * b))?,
        B::Division => numbers().map(|(a, b)| Value::Number(a / b))?,
        B::Remainder => numbers().map(|(a, b)| Value::Number(a % b))?,
        B::Exponential => numbers().map(|(a, b)| Value::Number(power(a, b)))?,
        B::BitwiseOR => Value::Number(f64::from(to_int32(left)? | to_int32(right)?)),
        B::BitwiseXOR => Value::Number(f64::from(to_int32(left)? ^ to_int32(right)?)),
        B::BitwiseAnd => Value::Number(f64::from(to_int32(left)? & to_int32(right)?)),
        B::ShiftLeft => Value::Number(f64::from(
            to_int32(left)?.wrapping_shl(to_uint32(right)? & 31),
        )),
        B::ShiftRight => Value::Number(f64::from(to_int32(left)? >> (to_uint32(right)? & 31))),
        B::ShiftRightZeroFill => {
            Value::Number(f64::from(to_uint32(left)? >> (to_uint32(right)? & 31)))
        }
        B::In | B::Instanceof => return None,
    })
}

/// `**`, where `1 ** NaN` and `1 ** Infinity` are `NaN`, unlike `powf`.
#[expect(clippy::float_cmp, reason = "exactly one")]
pub(super) fn power(base: f64, exponent: f64) -> f64 {
    if exponent.is_nan() || (base.abs() == 1.0 && exponent.is_infinite()) {
        f64::NAN
    } else {
        base.powf(exponent)
    }
}

/// The outcome of `IsLessThan`.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(super) enum Order {
    Less,
    NotLess,
    /// Either side is `NaN`: every comparison is false.
    Unordered,
}

pub(super) fn less_than(left: &Value, right: &Value) -> Option<Order> {
    let (left, right) = (to_primitive(left)?, to_primitive(right)?);
    let less = if let (Value::String(a), Value::String(b)) = (&left, &right) {
        Some(a.encode_utf16().lt(b.encode_utf16()))
    } else {
        to_number(&left)?
            .partial_cmp(&to_number(&right)?)
            .map(std::cmp::Ordering::is_lt)
    };
    Some(match less {
        Some(true) => Order::Less,
        Some(false) => Order::NotLess,
        None => Order::Unordered,
    })
}

/// `===`; `None` between two objects, whose identity this module does not track.
#[expect(clippy::float_cmp, reason = "JavaScript compares numbers exactly")]
pub(super) fn strict_equals(left: &Value, right: &Value) -> Option<bool> {
    Some(match (left, right) {
        (Value::Array(_) | Value::Object(_), Value::Array(_) | Value::Object(_)) => return None,
        (Value::Undefined, Value::Undefined) | (Value::Null, Value::Null) => true,
        (Value::Boolean(a), Value::Boolean(b)) => a == b,
        (Value::Number(a), Value::Number(b)) => a == b,
        (Value::String(a), Value::String(b)) => a == b,
        (Value::Global(a), Value::Global(b)) => a == b,
        _ => false,
    })
}

/// `==`.
#[expect(clippy::float_cmp, reason = "JavaScript compares numbers exactly")]
pub(super) fn loose_equals(left: &Value, right: &Value) -> Option<bool> {
    let compound = |v: &Value| matches!(v, Value::Array(_) | Value::Object(_) | Value::Global(_));
    match (left, right) {
        (Value::Undefined | Value::Null, Value::Undefined | Value::Null) => Some(true),
        (Value::Undefined | Value::Null, _) | (_, Value::Undefined | Value::Null) => Some(false),
        (a, b) if compound(a) && compound(b) => strict_equals(a, b),
        (a, b) if compound(a) => loose_equals(&to_primitive(a)?, b),
        (a, b) if compound(b) => loose_equals(a, &to_primitive(b)?),
        (Value::String(a), Value::String(b)) => Some(a == b),
        (Value::Boolean(a), Value::Boolean(b)) => Some(a == b),
        (a, b) => Some(to_number(a)? == to_number(b)?),
    }
}

/// `SameValueZero`, which `includes` uses: `NaN` equals itself.
pub(super) fn same_value_zero(left: &Value, right: &Value) -> Option<bool> {
    match (left, right) {
        (Value::Number(a), Value::Number(b)) if a.is_nan() && b.is_nan() => Some(true),
        _ => strict_equals(left, right),
    }
}
