//! JavaScript's type conversions: `ToBoolean`, `ToString`, `ToNumber` and their kin.

use rsvelte_kernel::source::characters::is_ecmascript_whitespace;

use super::{Global, Value};
use crate::number::number;

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

/// `StringToNumber`: JavaScript's numeric string grammar, not Rust's.
pub(super) fn string_to_number(s: &str) -> f64 {
    let s = s.trim_matches(is_ecmascript_whitespace);
    if s.is_empty() {
        return 0.0;
    }
    let (sign, unsigned) = match s.as_bytes()[0] {
        b'+' => (1.0, &s[1..]),
        b'-' => (-1.0, &s[1..]),
        _ => (1.0, s),
    };
    if unsigned == "Infinity" {
        return sign * f64::INFINITY;
    }
    for (prefix, radix) in [("0x", 16), ("0o", 8), ("0b", 2)] {
        if s.len() > 2 && s.as_bytes()[..2].eq_ignore_ascii_case(prefix.as_bytes()) {
            return s[2..]
                .chars()
                .try_fold(0.0, |acc: f64, c| {
                    c.to_digit(radix)
                        .map(|d| acc.mul_add(f64::from(radix), f64::from(d)))
                })
                .unwrap_or(f64::NAN);
        }
    }
    let (mantissa, exponent) = unsigned.find(['e', 'E']).map_or((unsigned, None), |at| {
        (&unsigned[..at], Some(&unsigned[at + 1..]))
    });
    let digits = |s: &str| !s.is_empty() && s.bytes().all(|b| b.is_ascii_digit());
    let mantissa_ok = match mantissa.split_once('.') {
        Some((whole, fraction)) => {
            (digits(whole) || whole.is_empty())
                && (digits(fraction) || fraction.is_empty())
                && !(whole.is_empty() && fraction.is_empty())
        }
        None => digits(mantissa),
    };
    let exponent_ok = exponent.is_none_or(|e| digits(e.strip_prefix(['+', '-']).unwrap_or(e)));
    if !(mantissa_ok && exponent_ok) {
        return f64::NAN;
    }
    unsigned.parse::<f64>().map_or(f64::NAN, |v| sign * v)
}

#[expect(
    clippy::cast_possible_truncation,
    clippy::cast_possible_wrap,
    clippy::cast_sign_loss,
    reason = "ToInt32 reduces modulo 2^32 first and reads the 32 bits as signed"
)]
pub(super) fn to_int32(value: &Value) -> Option<i32> {
    let n = to_number(value)?;
    if !n.is_finite() {
        return Some(0);
    }
    Some(n.trunc().rem_euclid(4_294_967_296.0) as u32 as i32)
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
