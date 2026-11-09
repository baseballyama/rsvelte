//! Unary and binary operators, and JavaScript's comparisons.

use crate::operators::{BinaryOperator, UnaryOperator};

use super::Value;
use super::conversions::{
    to_int32, to_number, to_primitive, to_string, to_uint32, truthy, type_of,
};

pub(super) fn unary(operator: UnaryOperator, value: &Value) -> Option<Value> {
    Some(match operator {
        UnaryOperator::Neg => Value::Number(-to_number(value)?),
        UnaryOperator::Plus => Value::Number(to_number(value)?),
        UnaryOperator::Not => Value::Boolean(!truthy(value)),
        UnaryOperator::BitNot => Value::Number(f64::from(!to_int32(value)?)),
        UnaryOperator::TypeOf => Value::String(type_of(value).into()),
        UnaryOperator::Void => Value::Undefined,
        UnaryOperator::Delete => return None,
    })
}

pub(super) fn binary(operator: BinaryOperator, left: &Value, right: &Value) -> Option<Value> {
    use BinaryOperator::{
        Add, BitAnd, BitOr, BitXor, Div, Eq, Exp, Gt, GtEq, In, InstanceOf, Lt, LtEq, Mul, NotEq,
        Remainder, Shl, Shr, StrictEq, StrictNotEq, Sub, UShr,
    };
    let numbers = || Some((to_number(left)?, to_number(right)?));
    Some(match operator {
        Eq => Value::Boolean(loose_equals(left, right)?),
        NotEq => Value::Boolean(!loose_equals(left, right)?),
        StrictEq => Value::Boolean(strict_equals(left, right)?),
        StrictNotEq => Value::Boolean(!strict_equals(left, right)?),
        Lt => Value::Boolean(less_than(left, right)? == Order::Less),
        Gt => Value::Boolean(less_than(right, left)? == Order::Less),
        LtEq => Value::Boolean(less_than(right, left)? == Order::NotLess),
        GtEq => Value::Boolean(less_than(left, right)? == Order::NotLess),
        Add => {
            let (left, right) = (to_primitive(left)?, to_primitive(right)?);
            if matches!(left, Value::String(_)) || matches!(right, Value::String(_)) {
                let mut out = to_string(&left)?;
                out.push_str(&to_string(&right)?);
                Value::String(out)
            } else {
                Value::Number(to_number(&left)? + to_number(&right)?)
            }
        }
        Sub => numbers().map(|(a, b)| Value::Number(a - b))?,
        Mul => numbers().map(|(a, b)| Value::Number(a * b))?,
        Div => numbers().map(|(a, b)| Value::Number(a / b))?,
        Remainder => numbers().map(|(a, b)| Value::Number(a % b))?,
        Exp => numbers().map(|(a, b)| Value::Number(power(a, b)))?,
        BitOr => Value::Number(f64::from(to_int32(left)? | to_int32(right)?)),
        BitXor => Value::Number(f64::from(to_int32(left)? ^ to_int32(right)?)),
        BitAnd => Value::Number(f64::from(to_int32(left)? & to_int32(right)?)),
        Shl => Value::Number(f64::from(
            to_int32(left)?.wrapping_shl(to_uint32(right)? & 31),
        )),
        Shr => Value::Number(f64::from(to_int32(left)? >> (to_uint32(right)? & 31))),
        UShr => Value::Number(f64::from(to_uint32(left)? >> (to_uint32(right)? & 31))),
        In | InstanceOf => return None,
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
