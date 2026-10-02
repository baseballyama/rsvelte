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
