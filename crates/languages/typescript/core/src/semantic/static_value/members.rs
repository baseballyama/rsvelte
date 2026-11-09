//! Members and calls of the built-in globals, strings and arrays.

use crate::semantic::number::number;

use super::conversions::{is_js_whitespace, join, to_integer, to_number, to_string, to_uint32};
use super::operators::{power, same_value_zero, strict_equals};
use super::{Global, MAX_BUILT_LENGTH, OBJECT_PROTOTYPE, Value};

/// Reads `key` of `object`.
pub(super) fn member(object: &Value, key: &str) -> Option<Value> {
    match object {
        Value::String(s) => {
            if key == "length" {
                return Some(Value::Number(utf16_length(s)));
            }
            let index = array_index(key)?;
            let units: Vec<u16> = s.encode_utf16().collect();
            units
                .get(index)
                .map_or(Some(Value::Undefined), |&unit| from_units(&[unit]))
        }
        Value::Array(items) => {
            if key == "length" {
                return Some(Value::Number(count(items.len())));
            }
            let index = array_index(key)?;
            Some(items.get(index).cloned().unwrap_or(Value::Undefined))
        }
        Value::Object(entries) => match entries.iter().find(|(n, _)| n == key) {
            Some((_, value)) => Some(value.clone()),
            None if OBJECT_PROTOTYPE.contains(&key) => None,
            None => Some(Value::Undefined),
        },
        Value::Global(Global::Math) => Some(Value::Number(match key {
            "E" => std::f64::consts::E,
            "LN10" => std::f64::consts::LN_10,
            "LN2" => std::f64::consts::LN_2,
            "LOG10E" => std::f64::consts::LOG10_E,
            "LOG2E" => std::f64::consts::LOG2_E,
            "PI" => std::f64::consts::PI,
            "SQRT1_2" => std::f64::consts::FRAC_1_SQRT_2,
            "SQRT2" => std::f64::consts::SQRT_2,
            _ => return None,
        })),
        Value::Global(Global::Number) => Some(Value::Number(match key {
            "EPSILON" => f64::EPSILON,
            "MAX_SAFE_INTEGER" => 9_007_199_254_740_991.0,
            "MIN_SAFE_INTEGER" => -9_007_199_254_740_991.0,
            "MAX_VALUE" => f64::MAX,
            "MIN_VALUE" => 5e-324,
            "NaN" => f64::NAN,
            "NEGATIVE_INFINITY" => f64::NEG_INFINITY,
            "POSITIVE_INFINITY" => f64::INFINITY,
            _ => return None,
        })),
        Value::Undefined
        | Value::Null
        | Value::Boolean(_)
        | Value::Number(_)
        | Value::Global(_) => None,
    }
}

/// A canonical array index (`"0"`, `"12"`, not `"01"` or `"-1"`).
pub(super) fn array_index(key: &str) -> Option<usize> {
    let index: usize = key.parse().ok()?;
    (index.to_string() == key).then_some(index)
}

pub(super) fn utf16_length(s: &str) -> f64 {
    count(s.encode_utf16().count())
}

#[expect(
    clippy::cast_precision_loss,
    reason = "no string or array in memory is 2^53 long"
)]
pub(super) const fn count(n: usize) -> f64 {
    n as f64
}

/// A string of UTF-16 code units; `None` for a lone surrogate, which a Rust string cannot hold.
pub(super) fn from_units(units: &[u16]) -> Option<Value> {
    String::from_utf16(units).ok().map(Value::String)
}

/// Calls the built-in `name` on `receiver` (`callAllowed` and `callPassThrough`).
pub(super) fn method(receiver: &Value, name: &str, arguments: &[Value]) -> Option<Value> {
    match receiver {
        Value::String(s) => string_method(s, name, arguments),
        Value::Array(items) => array_method(items, name, arguments),
        Value::Number(n) => match (name, arguments.first()) {
            ("toString", None | Some(Value::Undefined)) => Some(Value::String(number(*n))),
            ("toString", Some(Value::Number(radix))) if (*radix - 10.0).abs() < f64::EPSILON => {
                Some(Value::String(number(*n)))
            }
            _ => None,
        },
        Value::Global(global) => global_method(*global, name, arguments),
        _ => None,
    }
}

pub(super) fn global_method(global: Global, name: &str, arguments: &[Value]) -> Option<Value> {
    let first = arguments.first().unwrap_or(&Value::Undefined);
    let numbers = || {
        arguments
            .iter()
            .map(to_number)
            .collect::<Option<Vec<f64>>>()
    };
    Some(match (global, name) {
        (Global::Object, "freeze" | "preventExtensions" | "seal") => first.clone(),
        (Global::Array, "isArray") => Value::Boolean(matches!(first, Value::Array(_))),
        (Global::Number, "isFinite") => {
            Value::Boolean(matches!(first, Value::Number(n) if n.is_finite()))
        }
        (Global::Number, "isNaN") => {
            Value::Boolean(matches!(first, Value::Number(n) if n.is_nan()))
        }
        (Global::String, "fromCharCode") => {
            let units = arguments
                .iter()
                .map(|a| to_uint32(a).map(|u| (u & 0xFFFF) as u16))
                .collect::<Option<Vec<u16>>>()?;
            from_units(&units)?
        }
        (Global::Math, "max") => Value::Number(
            numbers()?
                .into_iter()
                .try_fold(f64::NEG_INFINITY, |acc, n| {
                    (!n.is_nan()).then(|| {
                        if n > acc || (n == 0.0 && acc == 0.0 && n.is_sign_positive()) {
                            n
                        } else {
                            acc
                        }
                    })
                })
                .unwrap_or(f64::NAN),
        ),
        (Global::Math, "min") => Value::Number(
            numbers()?
                .into_iter()
                .try_fold(f64::INFINITY, |acc, n| {
                    (!n.is_nan()).then(|| {
                        if n < acc || (n == 0.0 && acc == 0.0 && n.is_sign_negative()) {
                            n
                        } else {
                            acc
                        }
                    })
                })
                .unwrap_or(f64::NAN),
        ),
        (Global::Math, "pow") => {
            let second = arguments.get(1).unwrap_or(&Value::Undefined);
            Value::Number(power(to_number(first)?, to_number(second)?))
        }
        (Global::Math, _) => {
            let n = to_number(first)?;
            Value::Number(match name {
                "abs" => n.abs(),
                "ceil" => n.ceil(),
                "floor" => n.floor(),
                "round" => {
                    let floor = n.floor();
                    if n - floor >= 0.5 { floor + 1.0 } else { floor }
                }
                "sign" => {
                    if n.is_nan() || n == 0.0 {
                        n
                    } else {
                        n.signum()
                    }
                }
                "sqrt" => n.sqrt(),
                "cbrt" => n.cbrt(),
                "trunc" => n.trunc(),
                _ => return None,
            })
        }
        _ => return None,
    })
}

#[expect(
    clippy::cast_possible_truncation,
    clippy::cast_sign_loss,
    reason = "positions are clamped to the string's length first"
)]
#[expect(clippy::too_many_lines, reason = "one arm per method")]
pub(super) fn string_method(s: &str, name: &str, arguments: &[Value]) -> Option<Value> {
    let argument = |i: usize| arguments.get(i).unwrap_or(&Value::Undefined);
    let units: Vec<u16> = s.encode_utf16().collect();
    let length = count(units.len());
    let clamp = |n: f64| n.clamp(0.0, length) as usize;
    // A relative position: negative counts from the end.
    let relative = |v: &Value, default: f64| -> Option<usize> {
        let n = if matches!(v, Value::Undefined) {
            default
        } else {
            to_integer(v)?
        };
        Some(clamp(if n < 0.0 { length + n } else { n }))
    };
    let search = || to_string(argument(0)).map(|t| t.encode_utf16().collect::<Vec<u16>>());
    let position = |i: usize| -> Option<usize> { Some(clamp(to_integer(argument(i))?)) };
    let find = |needle: &[u16], from: usize| -> Option<usize> {
        (from..=units.len().checked_sub(needle.len())?).find(|&i| units[i..].starts_with(needle))
    };
    Some(match name {
        "at" => {
            let n = to_integer(argument(0))?;
            let index = if n < 0.0 { length + n } else { n };
            if index < 0.0 || index >= length {
                Value::Undefined
            } else {
                from_units(&units[index as usize..=index as usize])?
            }
        }
        "charAt" => {
            let n = to_integer(argument(0))?;
            if n < 0.0 || n >= length {
                Value::String(String::new())
            } else {
                from_units(&units[n as usize..=n as usize])?
            }
        }
        "charCodeAt" => {
            let n = to_integer(argument(0))?;
            Value::Number(if n < 0.0 || n >= length {
                f64::NAN
            } else {
                f64::from(units[n as usize])
            })
        }
        "concat" => {
            let mut out = s.to_owned();
            for a in arguments {
                out.push_str(&to_string(a)?);
            }
            Value::String(out)
        }
        "includes" => {
            let needle = search()?;
            Value::Boolean(find(&needle, position(1)?).is_some())
        }
        "indexOf" => {
            let needle = search()?;
            Value::Number(find(&needle, position(1)?).map_or(-1.0, count))
        }
        "lastIndexOf" => {
            let needle = search()?;
            let n = to_number(argument(1))?;
            let from = if n.is_nan() {
                units.len()
            } else {
                clamp(n.trunc())
            };
            let last = units.len().checked_sub(needle.len());
            Value::Number(
                last.and_then(|last| {
                    (0..=from.min(last))
                        .rev()
                        .find(|&i| units[i..].starts_with(&needle))
                })
                .map_or(-1.0, count),
            )
        }
        "startsWith" => {
            let needle = search()?;
            Value::Boolean(units[position(1)?..].starts_with(&needle))
        }
        "endsWith" => {
            let needle = search()?;
            let end = match argument(1) {
                Value::Undefined => units.len(),
                v => clamp(to_integer(v)?),
            };
            Value::Boolean(units[..end].ends_with(&needle))
        }
        "padStart" | "padEnd" => {
            let target = to_integer(argument(0))?;
            if target <= length {
                return Some(Value::String(s.to_owned()));
            }
            if target > MAX_BUILT_LENGTH {
                return None;
            }
            let fill: Vec<u16> = match argument(1) {
                Value::Undefined => vec![u16::from(b' ')],
                v => to_string(v)?.encode_utf16().collect(),
            };
            if fill.is_empty() {
                return Some(Value::String(s.to_owned()));
            }
            let padding: Vec<u16> = fill
                .iter()
                .copied()
                .cycle()
                .take(target as usize - units.len())
                .collect();
            let joined = if name == "padStart" {
                [padding, units].concat()
            } else {
                [units, padding].concat()
            };
            from_units(&joined)?
        }
        "slice" => {
            let from = relative(argument(0), 0.0)?;
            let to = relative(argument(1), length)?;
            from_units(&units[from..to.max(from)])?
        }
        "substring" => {
            let from = position(0)?;
            let to = match argument(1) {
                Value::Undefined => units.len(),
                v => clamp(to_integer(v)?),
            };
            from_units(&units[from.min(to)..from.max(to)])?
        }
        "toLowerCase" => Value::String(s.to_lowercase()),
        "toUpperCase" => Value::String(s.to_uppercase()),
        "toString" => Value::String(s.to_owned()),
        "trim" => Value::String(s.trim_matches(is_js_whitespace).to_owned()),
        "trimStart" | "trimLeft" => {
            Value::String(s.trim_start_matches(is_js_whitespace).to_owned())
        }
        "trimEnd" | "trimRight" => Value::String(s.trim_end_matches(is_js_whitespace).to_owned()),
        _ => return None,
    })
}

#[expect(
    clippy::cast_possible_truncation,
    clippy::cast_sign_loss,
    reason = "positions are clamped to the array's length first"
)]
pub(super) fn array_method(items: &[Value], name: &str, arguments: &[Value]) -> Option<Value> {
    let argument = |i: usize| arguments.get(i).unwrap_or(&Value::Undefined);
    let length = count(items.len());
    let relative = |v: &Value, default: f64| -> Option<usize> {
        let n = if matches!(v, Value::Undefined) {
            default
        } else {
            to_integer(v)?
        };
        Some((if n < 0.0 { length + n } else { n }).clamp(0.0, length) as usize)
    };
    // An element equal to the needle; `None` when an unknown comparison comes first.
    let position = |from: usize, equal: fn(&Value, &Value) -> Option<bool>| -> Option<f64> {
        for (index, item) in items.iter().enumerate().skip(from) {
            if equal(item, argument(0))? {
                return Some(count(index));
            }
        }
        Some(-1.0)
    };
    Some(match name {
        "at" => {
            let n = to_integer(argument(0))?;
            let index = if n < 0.0 { length + n } else { n };
            if index < 0.0 || index >= length {
                Value::Undefined
            } else {
                items[index as usize].clone()
            }
        }
        "concat" => {
            let mut out = items.to_vec();
            for a in arguments {
                match a {
                    Value::Array(more) => out.extend(more.iter().cloned()),
                    other => out.push(other.clone()),
                }
            }
            Value::Array(out)
        }
        "includes" => {
            Value::Boolean(position(relative(argument(1), 0.0)?, same_value_zero)? >= 0.0)
        }
        "indexOf" => Value::Number(position(relative(argument(1), 0.0)?, strict_equals)?),
        "join" => Value::String(join(
            items,
            &match argument(0) {
                Value::Undefined => ",".into(),
                v => to_string(v)?,
            },
        )?),
        "slice" => {
            let from = relative(argument(0), 0.0)?;
            let to = relative(argument(1), length)?;
            Value::Array(items[from..to.max(from)].to_vec())
        }
        "toString" => Value::String(join(items, ",")?),
        _ => return None,
    })
}
