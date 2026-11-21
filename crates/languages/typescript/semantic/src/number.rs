use oxc_ast::ast::BinaryOperator;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;

/// # Panics
///
/// Never: Rust's exponential formatting of a finite `f64` always has an integer exponent.
#[must_use]
#[expect(
    clippy::cast_possible_wrap,
    reason = "an f64 has at most 17 significant digits"
)]
pub fn number(v: f64) -> String {
    if v.is_nan() {
        return "NaN".into();
    }
    if v == 0.0 {
        return "0".into();
    }
    if v.is_infinite() {
        return if v > 0.0 { "Infinity" } else { "-Infinity" }.into();
    }
    if v < 0.0 {
        return format!("-{}", number(-v));
    }
    // Rust's `{:e}` prints the shortest digits that round-trip, which is what the spec asks for.
    let e = format!("{v:e}");
    let (mantissa, exp) = e
        .split_once('e')
        .expect("exponential notation always has an exponent");
    let digits: String = mantissa.chars().filter(|c| *c != '.').collect();
    let k = digits.len() as i32;
    let n = exp.parse::<i32>().expect("integer exponent") + 1;
    if k <= n && n <= 21 {
        format!("{digits}{}", "0".repeat((n - k).unsigned_abs() as usize))
    } else if 0 < n && n <= 21 {
        let n = n.unsigned_abs() as usize;
        format!("{}.{}", &digits[..n], &digits[n..])
    } else if -6 < n && n <= 0 {
        format!("0.{}{digits}", "0".repeat(n.unsigned_abs() as usize))
    } else {
        let sign = if n > 0 { '+' } else { '-' };
        let rest = if k > 1 {
            format!(".{}", &digits[1..])
        } else {
            String::new()
        };
        format!("{}{rest}e{sign}{}", &digits[..1], (n - 1).abs())
    }
}

/// `StringToNumber`: JavaScript's numeric string grammar, not Rust's.
#[must_use]
pub fn string_to_number(s: &str) -> f64 {
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
            return radix_digits(&s[2..], radix);
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

/// The digits of a binary, octal or hexadecimal literal, rounded once as the spec rounds their
/// exact value: the leading 61 or more bits, and whether any bit below them is set.
#[expect(
    clippy::cast_precision_loss,
    reason = "u64 to f64 rounds to nearest; the sticky bit makes that the exact value's rounding"
)]
fn radix_digits(digits: &str, radix: u32) -> f64 {
    if digits.is_empty() {
        return f64::NAN;
    }
    let bits = radix.trailing_zeros();
    let (mut leading, mut shift, mut sticky) = (0_u64, 0_i32, false);
    for c in digits.chars() {
        let Some(digit) = c.to_digit(radix) else {
            return f64::NAN;
        };
        if leading >> (64 - bits) == 0 {
            leading = (leading << bits) | u64::from(digit);
        } else {
            shift = shift.saturating_add(bits.cast_signed());
            sticky |= digit != 0;
        }
    }
    (leading | u64::from(sticky)) as f64 * 2_f64.powi(shift)
}

/// `ToInt32` of a number.
#[must_use]
#[expect(
    clippy::cast_possible_truncation,
    clippy::cast_possible_wrap,
    clippy::cast_sign_loss,
    reason = "ToInt32 reduces modulo 2^32 first and reads the 32 bits as signed"
)]
pub fn to_int32(n: f64) -> i32 {
    if !n.is_finite() {
        return 0;
    }
    n.trunc().rem_euclid(4_294_967_296.0) as u32 as i32
}

/// `Number::exponentiate`: unlike `powf`, a NaN exponent and `±1 ** ±Infinity` are NaN.
#[must_use]
#[expect(
    clippy::float_cmp,
    reason = "only exactly one is the case JavaScript differs on"
)]
pub fn exponentiate(base: f64, exponent: f64) -> f64 {
    if exponent.is_nan() || (exponent.is_infinite() && base.abs() == 1.0) {
        return f64::NAN;
    }
    base.powf(exponent)
}

/// `Math.round`: halves round up, and a negative number that rounds to zero keeps its sign.
#[must_use]
pub fn math_round(x: f64) -> f64 {
    if !x.is_finite() || x.fract() == 0.0 {
        return x;
    }
    let floor = x.floor();
    let r = if x - floor >= 0.5 { floor + 1.0 } else { floor };
    if r == 0.0 && x < 0.0 { -0.0 } else { r }
}

/// `Math.max`: NaN when any value is, and +0 above -0.
#[must_use]
pub fn math_max(values: impl IntoIterator<Item = f64>) -> f64 {
    values
        .into_iter()
        .try_fold(f64::NEG_INFINITY, |max, n| {
            (!n.is_nan()).then(|| {
                if n > max || (n == 0.0 && max == 0.0 && n.is_sign_positive()) {
                    n
                } else {
                    max
                }
            })
        })
        .unwrap_or(f64::NAN)
}

/// `Math.min`: NaN when any value is, and -0 below +0.
#[must_use]
pub fn math_min(values: impl IntoIterator<Item = f64>) -> f64 {
    values
        .into_iter()
        .try_fold(f64::INFINITY, |min, n| {
            (!n.is_nan()).then(|| {
                if n < min || (n == 0.0 && min == 0.0 && n.is_sign_negative()) {
                    n
                } else {
                    min
                }
            })
        })
        .unwrap_or(f64::NAN)
}

/// `Math.sign`: a zero or NaN is returned as it is.
#[must_use]
pub fn math_sign(x: f64) -> f64 {
    if x.is_nan() || x == 0.0 {
        x
    } else {
        x.signum()
    }
}

/// A binary operator whose operands are both numbers once converted: `None` for `+`, which also
/// joins strings, and for any operator that is not arithmetic.
#[must_use]
pub fn numeric_binary(operator: BinaryOperator, a: f64, b: f64) -> Option<f64> {
    use BinaryOperator as B;
    let (x, y) = (to_int32(a), to_int32(b));
    let count = y.cast_unsigned() & 31;
    Some(match operator {
        B::Subtraction => a - b,
        B::Multiplication => a * b,
        B::Division => a / b,
        B::Remainder => a % b,
        B::Exponential => exponentiate(a, b),
        B::BitwiseAnd => f64::from(x & y),
        B::BitwiseOR => f64::from(x | y),
        B::BitwiseXOR => f64::from(x ^ y),
        B::ShiftLeft => f64::from(x.wrapping_shl(count)),
        B::ShiftRight => f64::from(x >> count),
        B::ShiftRightZeroFill => f64::from(x.cast_unsigned() >> count),
        _ => return None,
    })
}

#[cfg(test)]
mod tests;
