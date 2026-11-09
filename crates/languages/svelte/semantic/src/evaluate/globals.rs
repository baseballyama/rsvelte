use super::{Value, to_int32};

/// `Number.MAX_SAFE_INTEGER`.
const MAX_SAFE_INTEGER: f64 = 9_007_199_254_740_991.0;

type Fold = fn(&[Value]) -> Value;

fn num_arg(a: &[Value], i: usize) -> f64 {
    a.get(i).map_or(f64::NAN, Value::to_number)
}

fn math1(a: &[Value], f: fn(f64) -> f64) -> Value {
    Value::Number(f(num_arg(a, 0)))
}

/// Upstream `globals` (phases/scope.js): the result kind, and a fold when every argument is known.
/// `Math.f16round` is listed without a fold: Rust has no stable half-precision rounding.
#[expect(clippy::too_many_lines, reason = "one arm per global upstream folds")]
pub(super) fn global_function(path: (&str, Option<&str>)) -> Option<(Value, Option<Fold>)> {
    let fold: Fold = match path {
        ("BigInt", None) | ("Math", Some("random" | "f16round")) => {
            return Some((Value::AnyNumber, None));
        }
        ("Math", Some("min")) => |a| {
            Value::Number(a.iter().map(Value::to_number).fold(f64::INFINITY, |m, x| {
                if m.is_nan() || x.is_nan() {
                    f64::NAN
                } else {
                    m.min(x)
                }
            }))
        },
        ("Math", Some("max")) => |a| {
            Value::Number(
                a.iter()
                    .map(Value::to_number)
                    .fold(f64::NEG_INFINITY, |m, x| {
                        if m.is_nan() || x.is_nan() {
                            f64::NAN
                        } else {
                            m.max(x)
                        }
                    }),
            )
        },
        ("Math", Some("floor")) => |a| math1(a, f64::floor),
        ("Math", Some("round")) => {
            |a| math1(a, |x| if x.is_finite() { (x + 0.5).floor() } else { x })
        }
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
        ("Math", Some("pow")) => |a| Value::Number(num_arg(a, 0).powf(num_arg(a, 1))),
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
        ("Math", Some("sign")) => |a| {
            math1(a, |x| {
                if x.is_nan() || x == 0.0 {
                    x
                } else {
                    x.signum()
                }
            })
        },
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
        ("Number", Some("parseFloat" | "parseInt"))
        | ("String", Some("fromCharCode" | "fromCodePoint")) => {
            // Folding these needs JS parsing/encoding rules that are not ported; report the type
            // only.
            let kind = if path.0 == "String" {
                Value::AnyString
            } else {
                Value::AnyNumber
            };
            return Some((kind, None));
        }
        ("String", None) => {
            |a| Value::String(a.first().map_or(String::new(), Value::to_javascript_string))
        }
        _ => return None,
    };
    let kind = if path.0 == "String" {
        Value::AnyString
    } else {
        Value::AnyNumber
    };
    Some((kind, Some(fold)))
}

pub(super) fn global_constant(path: (&str, Option<&str>)) -> Option<f64> {
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
