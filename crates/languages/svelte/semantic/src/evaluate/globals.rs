use rsvelte_typescript_semantic::number::{
    exponentiate, math_max, math_min, math_round, math_sign, to_int32,
};
use rsvelte_typescript_tree::JavaScriptString;

use super::Value;

#[cfg(test)]
mod tests;
mod text;

/// `Number.MAX_SAFE_INTEGER`.
const MAX_SAFE_INTEGER: f64 = 9_007_199_254_740_991.0;

type Fold = fn(&[Value]) -> Value;

fn num_arg(a: &[Value], i: usize) -> f64 {
    a.get(i).map_or(f64::NAN, Value::to_number)
}

fn math1(a: &[Value], f: fn(f64) -> f64) -> Value {
    Value::Number(f(num_arg(a, 0)))
}

/// `String(a[i])`, which every reader here parses as a number, where a lone surrogate reads as
/// U+FFFD does: as neither a digit nor whitespace.
fn string_arg(a: &[Value], i: usize) -> String {
    a.get(i).map_or_else(
        || "undefined".to_owned(),
        |value| value.to_javascript_string().to_string_lossy().into_owned(),
    )
}

/// `Math.f16round`: the nearest half-precision value, ties to even.
fn f16round(x: f64) -> f64 {
    const MAX: f64 = 65520.0;
    if !x.is_finite() || x == 0.0 {
        return x;
    }
    let magnitude = x.abs();
    if magnitude >= MAX {
        return f64::INFINITY.copysign(x);
    }
    // A half's exponent is at least -14; below that its step is that of a subnormal.
    let exponent = (((magnitude.to_bits() >> 52) & 0x7FF) as i32 - 1023).max(-14);
    let step = 2f64.powi(exponent - 10);
    ((magnitude / step).round_ties_even() * step).copysign(x)
}

/// What upstream's `globals` and `global_constants` (phases/scope.js) know of a global.
pub(super) enum Global {
    /// A constant's value.
    Constant(f64),
    /// A function's result kind, and its fold when every argument is known.
    Function(Value, Option<Fold>),
}

/// The global at `path`, from either of upstream's tables.
pub(super) fn global(path: (&str, Option<&str>)) -> Option<Global> {
    constant(path).map_or_else(|| function(path), |value| Some(Global::Constant(value)))
}

fn function(path: (&str, Option<&str>)) -> Option<Global> {
    let fold: Fold = match path {
        ("BigInt", None) | ("Math", Some("random")) => {
            return Some(Global::Function(Value::AnyNumber, None));
        }
        ("Math", Some("f16round")) => |a| math1(a, f16round),
        ("Math", Some("min")) => |a| Value::Number(math_min(a.iter().map(Value::to_number))),
        ("Math", Some("max")) => |a| Value::Number(math_max(a.iter().map(Value::to_number))),
        ("Math", Some("floor")) => |a| math1(a, f64::floor),
        ("Math", Some("round")) => |a| math1(a, math_round),
        ("Math", Some("abs")) => |a| math1(a, f64::abs),
        ("Math", Some("acos")) => |a| math1(a, f64::acos),
        ("Math", Some("asin")) => |a| math1(a, f64::asin),
        ("Math", Some("atan")) => |a| math1(a, f64::atan),
        ("Math", Some("atan2")) => |a| Value::Number(num_arg(a, 0).atan2(num_arg(a, 1))),
        ("Math", Some("ceil")) => |a| math1(a, f64::ceil),
        ("Math", Some("cos")) => |a| math1(a, f64::cos),
        ("Math", Some("sin")) => |a| math1(a, f64::sin),
        ("Math", Some("tan")) => |a| math1(a, f64::tan),
        ("Math", Some("exp")) => |a| math1(a, f64::exp),
        ("Math", Some("log")) => |a| math1(a, f64::ln),
        ("Math", Some("pow")) => |a| Value::Number(exponentiate(num_arg(a, 0), num_arg(a, 1))),
        ("Math", Some("sqrt")) => |a| math1(a, f64::sqrt),
        ("Math", Some("clz32")) => |a| {
            Value::Number(f64::from(
                to_int32(num_arg(a, 0)).cast_unsigned().leading_zeros(),
            ))
        },
        ("Math", Some("imul")) => |a| {
            Value::Number(f64::from(
                to_int32(num_arg(a, 0)).wrapping_mul(to_int32(num_arg(a, 1))),
            ))
        },
        ("Math", Some("sign")) => |a| math1(a, math_sign),
        ("Math", Some("log10")) => |a| math1(a, f64::log10),
        ("Math", Some("log2")) => |a| math1(a, f64::log2),
        ("Math", Some("log1p")) => |a| math1(a, f64::ln_1p),
        ("Math", Some("expm1")) => |a| math1(a, f64::exp_m1),
        ("Math", Some("cosh")) => |a| math1(a, f64::cosh),
        ("Math", Some("sinh")) => |a| math1(a, f64::sinh),
        ("Math", Some("tanh")) => |a| math1(a, f64::tanh),
        ("Math", Some("acosh")) => |a| math1(a, f64::acosh),
        ("Math", Some("asinh")) => |a| math1(a, f64::asinh),
        ("Math", Some("atanh")) => |a| math1(a, f64::atanh),
        ("Math", Some("trunc")) => |a| math1(a, f64::trunc),
        ("Math", Some("fround")) => |a| math1(a, |x| f64::from(x as f32)),
        ("Math", Some("cbrt")) => |a| math1(a, f64::cbrt),
        ("Number", None) => |a| Value::Number(a.first().map_or(0.0, Value::to_number)),
        ("Number", Some("isInteger")) => |a| {
            Value::Boolean(
                matches!(a.first(), Some(Value::Number(n)) if n.is_finite() && n.fract() == 0.0),
            )
        },
        ("Number", Some("isFinite")) => {
            |a| Value::Boolean(matches!(a.first(), Some(Value::Number(n)) if n.is_finite()))
        }
        ("Number", Some("isNaN")) => {
            |a| Value::Boolean(matches!(a.first(), Some(Value::Number(n)) if n.is_nan()))
        }
        ("Number", Some("isSafeInteger")) => |a| {
            Value::Boolean(a.first().is_some_and(|value| match value {
                Value::Number(n) => n.fract() == 0.0 && n.abs() <= MAX_SAFE_INTEGER,
                _ => false,
            }))
        },
        ("Number", Some("parseFloat")) => |a| Value::Number(text::parse_float(&string_arg(a, 0))),
        ("Number", Some("parseInt")) => {
            |a| Value::Number(text::parse_int(&string_arg(a, 0), to_int32(num_arg(a, 1))))
        }
        ("String", Some("fromCharCode")) => |a| {
            let units = (a.iter()).map(|v| to_int32(v.to_number()).cast_unsigned() as u16);
            Value::String(JavaScriptString::from_utf16(units))
        },
        ("String", Some("fromCodePoint")) => |a| text::from_code_points(a),
        ("String", None) => |a| {
            Value::String(
                a.first()
                    .map_or_else(JavaScriptString::new, Value::to_javascript_string),
            )
        },
        _ => return None,
    };
    let kind = if path.0 == "String" {
        Value::AnyString
    } else {
        Value::AnyNumber
    };
    Some(Global::Function(kind, Some(fold)))
}

fn constant(path: (&str, Option<&str>)) -> Option<f64> {
    use std::f64::consts::{E, FRAC_1_SQRT_2, LN_2, LN_10, LOG2_E, LOG10_E, PI, SQRT_2};
    Some(match path {
        ("Math", Some("PI")) => PI,
        ("Math", Some("E")) => E,
        ("Math", Some("LN10")) => LN_10,
        ("Math", Some("LN2")) => LN_2,
        ("Math", Some("LOG10E")) => LOG10_E,
        ("Math", Some("LOG2E")) => LOG2_E,
        ("Math", Some("SQRT2")) => SQRT_2,
        ("Math", Some("SQRT1_2")) => FRAC_1_SQRT_2,
        _ => return None,
    })
}
