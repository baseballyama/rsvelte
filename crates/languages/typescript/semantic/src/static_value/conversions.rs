//! JavaScript's type conversions: `ToBoolean`, `ToString`, `ToNumber` and their kin.

use super::{Global, Value};
use crate::number::{self, number, string_to_number};

pub(super) const fn is_nullish(value: &Value) -> bool {
    matches!(value, Value::Undefined | Value::Null)
}

pub(super) fn truthy(value: &Value) -> bool {
    match value {
        Value::Undefined | Value::Null => false,
        Value::Boolean(b) => *b,
        Value::Number(n) => *n != 0.0 && !n.is_nan(),
        Value::String(s) => !s.is_empty(),
        Value::Array(_) | Value::Object(_) | Value::Global(_) => true,
    }
}

pub(super) const fn type_of(value: &Value) -> &'static str {
    match value {
        Value::Undefined => "undefined",
        Value::Null | Value::Array(_) | Value::Object(_) | Value::Global(Global::Math) => "object",
        Value::Boolean(_) => "boolean",
        Value::Number(_) => "number",
        Value::String(_) => "string",
        Value::Global(_) => "function",
    }
}

/// `ToString`; `None` for a function, whose text this module does not hold.
pub(super) fn to_string(value: &Value) -> Option<String> {
    Some(match value {
        Value::Undefined => "undefined".into(),
        Value::Null => "null".into(),
        Value::Boolean(b) => b.to_string(),
        Value::Number(n) => number(*n),
        Value::String(s) => s.clone(),
        Value::Array(items) => join(items, ",")?,
        Value::Object(_) => "[object Object]".into(),
        Value::Global(Global::Math) => "[object Math]".into(),
        Value::Global(_) => return None,
    })
}

pub(super) fn join(items: &[Value], separator: &str) -> Option<String> {
    let mut out = String::new();
    for (index, item) in items.iter().enumerate() {
        if index > 0 {
            out.push_str(separator);
        }
        if !is_nullish(item) {
            out.push_str(&to_string(item)?);
        }
    }
    Some(out)
}

/// `ToPrimitive`: an object becomes its string.
pub(super) fn to_primitive(value: &Value) -> Option<Value> {
    match value {
        Value::Array(_) | Value::Object(_) | Value::Global(_) => {
            Some(Value::String(to_string(value)?))
        }
        primitive => Some(primitive.clone()),
    }
}

pub(super) fn to_number(value: &Value) -> Option<f64> {
    Some(match value {
        Value::Undefined => f64::NAN,
        Value::Null => 0.0,
        Value::Boolean(b) => f64::from(u8::from(*b)),
        Value::Number(n) => *n,
        Value::String(s) => string_to_number(s),
        compound => to_number(&to_primitive(compound)?)?,
    })
}

pub(super) fn to_int32(value: &Value) -> Option<i32> {
    to_number(value).map(number::to_int32)
}

#[expect(clippy::cast_sign_loss, reason = "the same 32 bits read as unsigned")]
pub(super) fn to_uint32(value: &Value) -> Option<u32> {
    Some(to_int32(value)? as u32)
}

/// `ToIntegerOrInfinity`.
pub(super) fn to_integer(value: &Value) -> Option<f64> {
    let n = to_number(value)?;
    Some(if n.is_nan() { 0.0 } else { n.trunc() + 0.0 })
}
