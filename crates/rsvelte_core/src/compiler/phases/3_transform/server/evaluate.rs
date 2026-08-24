//! Static expression evaluation for SSR template output.
//!
//! Port of the official compiler's `scope.evaluate` (`phases/scope.js`,
//! `class Evaluation`). The server transform calls this for every template
//! expression chunk (`build_template_chunk` in
//! `3-transform/server/visitors/shared/utils.js`): when the evaluation is
//! "known" (exactly one possible primitive value), the value is inlined into
//! the surrounding template literal instead of emitting `$.escape(...)` /
//! `$.stringify(...)`.
//!
//! Differences from upstream, by necessity of the text-based architecture:
//! - Identifier resolution goes through `analysis.root.bindings` rather than a
//!   `Scope` object, filtered by the render position's scope chain
//!   (`EvalCtx::current_scope_index`, threaded by the server visitors) so a
//!   sibling fragment's `{@const}` is invisible and the nearest declaration
//!   wins. Without a known render position, a name resolves only when EVERY
//!   binding with that name agrees on the same known value.
//! - `binding.initial` is a string: raw source text for literal initials
//!   (`'world'`, `12`, `true`) or an estree-JSON dump for `$derived` / `@const`
//!   initials. Both forms are handled.

use serde_json::Value;

use crate::compiler::phases::phase2_analyze::ComponentAnalysis;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;
use rustc_hash::{FxHashMap, FxHashSet};
use std::cell::OnceCell;

/// Maximum recursion depth when resolving binding initials (cycle guard).
const MAX_DEPTH: u8 = 16;

/// A statically-known (or partially-known) JavaScript value.
/// `StringMarker` / `NumberMarker` / `FunctionMarker` mirror upstream's
/// `STRING` / `NUMBER` / `FUNCTION` symbols: the *type* is known but the
/// value is not.
#[derive(Clone, Debug)]
pub(crate) enum EvalValue {
    Str(String),
    Num(f64),
    /// A bigint whose exact value is known (JS renders it without the `n`).
    BigInt(i128),
    Bool(bool),
    Null,
    Undefined,
    /// A regex literal's source text. It is an object, so two of them are never
    /// the same value even when the source matches.
    Regex(String),
    StringMarker,
    NumberMarker,
    FunctionMarker,
    Unknown,
}

impl EvalValue {
    pub(crate) fn is_marker(&self) -> bool {
        matches!(
            self,
            EvalValue::StringMarker
                | EvalValue::NumberMarker
                | EvalValue::FunctionMarker
                | EvalValue::Unknown
        )
    }

    /// Value identity for the `values` set (NaN is identical to NaN here,
    /// mirroring JS `Set` semantics where `NaN` is `SameValueZero`-equal).
    pub(crate) fn same(&self, other: &EvalValue) -> bool {
        match (self, other) {
            (EvalValue::Str(a), EvalValue::Str(b)) => a == b,
            (EvalValue::Num(a), EvalValue::Num(b)) => {
                (a.is_nan() && b.is_nan()) || a == b || (*a == 0.0 && *b == 0.0)
            }
            (EvalValue::BigInt(a), EvalValue::BigInt(b)) => a == b,
            (EvalValue::Bool(a), EvalValue::Bool(b)) => a == b,
            (EvalValue::Null, EvalValue::Null)
            | (EvalValue::Undefined, EvalValue::Undefined)
            | (EvalValue::StringMarker, EvalValue::StringMarker)
            | (EvalValue::NumberMarker, EvalValue::NumberMarker)
            | (EvalValue::FunctionMarker, EvalValue::FunctionMarker)
            | (EvalValue::Unknown, EvalValue::Unknown) => true,
            _ => false,
        }
    }

    pub(crate) fn truthy(&self) -> Option<bool> {
        match self {
            EvalValue::Str(s) => Some(!s.is_empty()),
            EvalValue::Num(n) => Some(!(*n == 0.0 || n.is_nan())),
            EvalValue::BigInt(v) => Some(*v != 0),
            EvalValue::Bool(b) => Some(*b),
            EvalValue::Null | EvalValue::Undefined => Some(false),
            EvalValue::Regex(_) => Some(true),
            _ => None,
        }
    }

    pub(crate) fn is_nullish(&self) -> Option<bool> {
        match self {
            EvalValue::Null | EvalValue::Undefined => Some(true),
            EvalValue::Str(_)
            | EvalValue::Num(_)
            | EvalValue::BigInt(_)
            | EvalValue::Bool(_)
            | EvalValue::Regex(_) => Some(false),
            _ => None,
        }
    }
}

/// Result of evaluating an expression: the set of possible values.
/// Mirrors upstream's `Evaluation` (`values` set + derived flags).
pub(crate) struct Evaluation {
    pub values: Vec<EvalValue>,
}

impl Evaluation {
    fn new() -> Self {
        Evaluation { values: Vec::new() }
    }

    pub(crate) fn unknown() -> Self {
        Evaluation {
            values: vec![EvalValue::Unknown],
        }
    }

    fn single(v: EvalValue) -> Self {
        Evaluation { values: vec![v] }
    }

    fn add(&mut self, v: EvalValue) {
        if !self.values.iter().any(|e| e.same(&v)) {
            self.values.push(v);
        }
    }

    fn extend(&mut self, other: Evaluation) {
        for v in other.values {
            self.add(v);
        }
    }

    /// True if there is exactly one possible concrete value.
    pub(crate) fn is_known(&self) -> bool {
        self.values.len() == 1 && !self.values[0].is_marker()
    }

    pub(crate) fn known_value(&self) -> Option<&EvalValue> {
        if self.is_known() {
            self.values.first()
        } else {
            None
        }
    }

    /// True if `UNKNOWN` is among the possible values (mirrors `has_unknown`).
    /// An empty value set can only come from a node shape this port declines to
    /// model, so it counts as unknown too.
    pub(crate) fn has_unknown(&self) -> bool {
        self.values.is_empty() || self.values.iter().any(|v| matches!(v, EvalValue::Unknown))
    }

    /// True if the value is known to be a string (mirrors `is_string`).
    pub(crate) fn is_string(&self) -> bool {
        !self.values.is_empty()
            && self
                .values
                .iter()
                .all(|v| matches!(v, EvalValue::Str(_) | EvalValue::StringMarker))
    }

    /// True if the value is known to not be null/undefined (mirrors `is_defined`).
    pub(crate) fn is_defined(&self) -> bool {
        !self.values.is_empty()
            && !self.values.iter().any(|v| {
                matches!(
                    v,
                    EvalValue::Null | EvalValue::Undefined | EvalValue::Unknown
                )
            })
    }
}

// ---------------------------------------------------------------------------
// JS semantics helpers
// ---------------------------------------------------------------------------

/// JS `Number(...)`-style string → number coercion.
fn js_str_to_number(s: &str) -> f64 {
    let t = s.trim();
    if t.is_empty() {
        return 0.0;
    }
    if let Some(hex) = t.strip_prefix("0x").or_else(|| t.strip_prefix("0X")) {
        return i64::from_str_radix(hex, 16)
            .map(|v| v as f64)
            .unwrap_or(f64::NAN);
    }
    if let Some(oct) = t.strip_prefix("0o").or_else(|| t.strip_prefix("0O")) {
        return i64::from_str_radix(oct, 8)
            .map(|v| v as f64)
            .unwrap_or(f64::NAN);
    }
    if let Some(bin) = t.strip_prefix("0b").or_else(|| t.strip_prefix("0B")) {
        return i64::from_str_radix(bin, 2)
            .map(|v| v as f64)
            .unwrap_or(f64::NAN);
    }
    match t {
        "Infinity" | "+Infinity" => return f64::INFINITY,
        "-Infinity" => return f64::NEG_INFINITY,
        _ => {}
    }
    t.parse::<f64>().unwrap_or(f64::NAN)
}

/// JS `ToNumber`, which THROWS on a bigint — so a bigint declines here and
/// every implicit-coercion caller (`Math.*`, unary `+`, `~`) declines with it.
/// Arithmetic uses `ToNumeric` instead and must not come through this.
pub(crate) fn to_number(v: &EvalValue) -> Option<f64> {
    match v {
        EvalValue::Num(n) => Some(*n),
        EvalValue::Str(s) => Some(js_str_to_number(s)),
        EvalValue::Bool(b) => Some(if *b { 1.0 } else { 0.0 }),
        EvalValue::Null => Some(0.0),
        EvalValue::Undefined | EvalValue::Regex(_) => Some(f64::NAN),
        _ => None,
    }
}

/// JS `StringToBigInt`. The outer `None` means the text is a bigint this port
/// cannot hold in an `i128`; the inner `None` means it is not a bigint at all,
/// which JS reports as `undefined` — `==` is then false and every relational
/// comparison is false.
fn js_str_to_bigint(s: &str) -> Option<Option<i128>> {
    let t = s.trim();
    if t.is_empty() {
        return Some(Some(0));
    }
    let (radix, digits) = match t.get(..2) {
        Some("0x" | "0X") => (16, &t[2..]),
        Some("0o" | "0O") => (8, &t[2..]),
        Some("0b" | "0B") => (2, &t[2..]),
        _ => (10, t),
    };
    let body = if radix == 10 {
        digits.strip_prefix(['+', '-']).unwrap_or(digits)
    } else {
        digits
    };
    if body.is_empty() || !body.chars().all(|c| c.is_digit(radix)) {
        return Some(None);
    }
    match i128::from_str_radix(digits, radix) {
        Ok(v) => Some(Some(v)),
        Err(_) => None,
    }
}

/// Compares a bigint with a double the way JS does: mathematically, without
/// rounding the bigint or truncating the double. `None` for NaN, which leaves
/// the pair unordered.
fn cmp_bigint_f64(x: i128, n: f64) -> Option<std::cmp::Ordering> {
    use std::cmp::Ordering;
    if n.is_nan() {
        return None;
    }
    // 2^127 — one past `i128::MAX`, and exactly representable as a double.
    const LIMIT: f64 = 170_141_183_460_469_231_731_687_303_715_884_105_728.0;
    let floor = n.floor();
    if floor >= LIMIT {
        return Some(Ordering::Less);
    }
    if floor < -LIMIT {
        return Some(Ordering::Greater);
    }
    Some(match x.cmp(&(floor as i128)) {
        Ordering::Equal if n > floor => Ordering::Less,
        other => other,
    })
}

/// `<` where at least one operand is a bigint. Outer `None`: cannot evaluate;
/// inner `None`: unordered, so every relational operator is false.
fn bigint_less_than(a: &EvalValue, b: &EvalValue) -> Option<Option<bool>> {
    use std::cmp::Ordering;
    let ord = match (a, b) {
        (EvalValue::BigInt(x), EvalValue::BigInt(y)) => Some(x.cmp(y)),
        (EvalValue::BigInt(x), EvalValue::Str(s)) => js_str_to_bigint(s)?.map(|y| x.cmp(&y)),
        (EvalValue::Str(s), EvalValue::BigInt(y)) => js_str_to_bigint(s)?.map(|x| x.cmp(y)),
        (EvalValue::BigInt(x), other) => cmp_bigint_f64(*x, to_number(other)?),
        (other, EvalValue::BigInt(y)) => {
            cmp_bigint_f64(*y, to_number(other)?).map(Ordering::reverse)
        }
        _ => return None,
    };
    Some(ord.map(|o| o == Ordering::Less))
}

/// BigInt arithmetic. JS throws a `TypeError` the moment the other operand is
/// not a bigint too, so a mixed expression has no value to fold. `None` from
/// any arm — an exact result outside `i128`, a division by zero, a negative
/// exponent — leaves the expression reactive rather than folding it wrong.
fn bigint_arith(op: &str, a: &EvalValue, b: &EvalValue) -> EvalValue {
    let (EvalValue::BigInt(x), EvalValue::BigInt(y)) = (a, b) else {
        return EvalValue::Unknown;
    };
    let (x, y) = (*x, *y);
    let r = match op {
        "+" => x.checked_add(y),
        "-" => x.checked_sub(y),
        "*" => x.checked_mul(y),
        "/" => x.checked_div(y),
        "%" => x.checked_rem(y),
        "**" => u32::try_from(y).ok().and_then(|e| x.checked_pow(e)),
        "&" => Some(x & y),
        "|" => Some(x | y),
        "^" => Some(x ^ y),
        "<<" => bigint_shift_left(x, y),
        ">>" => y.checked_neg().and_then(|n| bigint_shift_left(x, n)),
        _ => None,
    };
    r.map(EvalValue::BigInt).unwrap_or(EvalValue::Unknown)
}

/// A negative shift count shifts the other way — JS defines the two bigint
/// shifts in terms of each other, so `1n << -1n` is `0n` and `8n >> -1n` is
/// `16n`.
fn bigint_shift_left(x: i128, y: i128) -> Option<i128> {
    if y < 0 {
        return bigint_shift_right(x, y.checked_neg()?);
    }
    if x == 0 {
        return Some(0);
    }
    let n = u32::try_from(y).ok()?;
    if n >= 127 {
        return None;
    }
    let r = x.checked_shl(n)?;
    (r >> n == x).then_some(r)
}

fn bigint_shift_right(x: i128, y: i128) -> Option<i128> {
    if y < 0 {
        return bigint_shift_left(x, y.checked_neg()?);
    }
    if y >= 127 {
        return Some(if x < 0 { -1 } else { 0 });
    }
    Some(x >> (y as u32))
}

/// JS number → string (`String(n)`), matching V8's formatting for the
/// common cases (integers, shortest-roundtrip decimals, NaN/Infinity).
pub(crate) fn js_number_to_string(n: f64) -> String {
    if n.is_nan() {
        return "NaN".to_string();
    }
    if n.is_infinite() {
        return if n > 0.0 { "Infinity" } else { "-Infinity" }.to_string();
    }
    if n == 0.0 {
        // covers -0 as well: String(-0) === "0"
        return "0".to_string();
    }
    let abs = n.abs();
    if n.fract() == 0.0 && abs < 1e21 {
        return format!("{}", n as i128);
    }
    if !(1e-6..1e21).contains(&abs) {
        // JS exponential form, e.g. `1e+21`, `1e-7`
        let s = format!("{:e}", n);
        if let Some(pos) = s.find('e') {
            let (mantissa, exp) = s.split_at(pos);
            let exp_num = &exp[1..];
            if !exp_num.starts_with('-') {
                return format!("{}e+{}", mantissa, exp_num);
            }
        }
        return s;
    }
    // Rust's shortest-roundtrip Display matches JS for ordinary decimals.
    format!("{}", n)
}

pub(crate) fn to_js_string(v: &EvalValue) -> Option<String> {
    match v {
        EvalValue::Str(s) | EvalValue::Regex(s) => Some(s.clone()),
        EvalValue::Num(n) => Some(js_number_to_string(*n)),
        EvalValue::BigInt(v) => Some(v.to_string()),
        EvalValue::Bool(b) => Some(b.to_string()),
        EvalValue::Null => Some("null".to_string()),
        EvalValue::Undefined => Some("undefined".to_string()),
        _ => None,
    }
}

/// The display string used when inlining a known value into the template:
/// upstream does `(evaluated.value ?? '') + ''`.
pub(crate) fn js_display_string(v: &EvalValue) -> String {
    match v {
        EvalValue::Null | EvalValue::Undefined => String::new(),
        other => to_js_string(other).unwrap_or_default(),
    }
}

fn strict_eq(a: &EvalValue, b: &EvalValue) -> Option<bool> {
    Some(match (a, b) {
        (EvalValue::BigInt(x), EvalValue::BigInt(y)) => x == y,
        (EvalValue::Str(x), EvalValue::Str(y)) => x == y,
        (EvalValue::Num(x), EvalValue::Num(y)) => x == y, // NaN !== NaN holds
        (EvalValue::Bool(x), EvalValue::Bool(y)) => x == y,
        (EvalValue::Null, EvalValue::Null) | (EvalValue::Undefined, EvalValue::Undefined) => true,
        (a, b) if a.is_marker() || b.is_marker() => return None,
        _ => false,
    })
}

/// A regex is an object, and every coercion below reaches it through
/// `ToPrimitive`, which for a regex is its source text.
fn to_primitive(v: &EvalValue) -> EvalValue {
    match v {
        EvalValue::Regex(s) => EvalValue::Str(s.clone()),
        other => other.clone(),
    }
}

fn loose_eq(a: &EvalValue, b: &EvalValue) -> Option<bool> {
    if a.is_marker() || b.is_marker() {
        return None;
    }
    if matches!(a, EvalValue::Regex(_)) || matches!(b, EvalValue::Regex(_)) {
        // `/a/ == /a/` is object identity (false); against anything else the
        // regex coerces to its source text.
        if matches!(a, EvalValue::Regex(_)) && matches!(b, EvalValue::Regex(_)) {
            return Some(false);
        }
        return loose_eq(&to_primitive(a), &to_primitive(b));
    }
    Some(match (a, b) {
        (EvalValue::BigInt(x), EvalValue::BigInt(y)) => x == y,
        (EvalValue::BigInt(_), EvalValue::Null | EvalValue::Undefined)
        | (EvalValue::Null | EvalValue::Undefined, EvalValue::BigInt(_)) => false,
        (EvalValue::BigInt(x), EvalValue::Str(s)) | (EvalValue::Str(s), EvalValue::BigInt(x)) => {
            js_str_to_bigint(s)? == Some(*x)
        }
        (EvalValue::BigInt(x), EvalValue::Num(n)) | (EvalValue::Num(n), EvalValue::BigInt(x)) => {
            cmp_bigint_f64(*x, *n) == Some(std::cmp::Ordering::Equal)
        }
        (EvalValue::BigInt(_), EvalValue::Bool(_)) => {
            return loose_eq(a, &EvalValue::Num(to_number(b)?));
        }
        (EvalValue::Bool(_), EvalValue::BigInt(_)) => {
            return loose_eq(&EvalValue::Num(to_number(a)?), b);
        }
        (EvalValue::Str(x), EvalValue::Str(y)) => x == y,
        (EvalValue::Num(x), EvalValue::Num(y)) => x == y,
        (EvalValue::Bool(_), _) => return loose_eq(&EvalValue::Num(to_number(a)?), b),
        (_, EvalValue::Bool(_)) => return loose_eq(a, &EvalValue::Num(to_number(b)?)),
        (EvalValue::Null | EvalValue::Undefined, EvalValue::Null | EvalValue::Undefined) => true,
        (EvalValue::Null | EvalValue::Undefined, _)
        | (_, EvalValue::Null | EvalValue::Undefined) => false,
        (EvalValue::Num(x), EvalValue::Str(y)) => *x == js_str_to_number(y),
        (EvalValue::Str(x), EvalValue::Num(y)) => js_str_to_number(x) == *y,
        _ => return None, // markers (unreachable: filtered above)
    })
}

/// Relational comparison (`<`); other operators are derived from it.
fn js_less_than(a: &EvalValue, b: &EvalValue) -> Option<Option<bool>> {
    if matches!(a, EvalValue::Regex(_)) || matches!(b, EvalValue::Regex(_)) {
        return js_less_than(&to_primitive(a), &to_primitive(b));
    }
    // Outer None: cannot evaluate; inner None: NaN involved (result false for all).
    if let (EvalValue::Str(x), EvalValue::Str(y)) = (a, b) {
        return Some(Some(x < y));
    }
    if matches!(a, EvalValue::BigInt(_)) || matches!(b, EvalValue::BigInt(_)) {
        return bigint_less_than(a, b);
    }
    let x = to_number(a)?;
    let y = to_number(b)?;
    if x.is_nan() || y.is_nan() {
        return Some(None);
    }
    Some(Some(x < y))
}

fn to_int32(n: f64) -> i32 {
    if !n.is_finite() || n == 0.0 {
        return 0;
    }
    let m = n.trunc();
    let m = m.rem_euclid(4294967296.0);
    let u = m as u32;
    u as i32
}

fn to_uint32(n: f64) -> u32 {
    if !n.is_finite() || n == 0.0 {
        return 0;
    }
    let m = n.trunc();
    let m = m.rem_euclid(4294967296.0);
    m as u32
}

/// Mirrors the `unary` table in scope.js, applied to a known argument.
pub(crate) fn eval_unary(op: &str, a: &EvalValue) -> EvalValue {
    let r = match op {
        "!" => a.truthy().map(|t| EvalValue::Bool(!t)),
        "-" => match a {
            EvalValue::BigInt(v) => v.checked_neg().map(EvalValue::BigInt),
            _ => to_number(a).map(|n| EvalValue::Num(-n)),
        },
        "+" => to_number(a).map(EvalValue::Num),
        // `~` on a bigint stays a bigint; on anything else it goes through
        // `ToInt32`, which throws on one.
        "~" => match a {
            EvalValue::BigInt(v) => Some(EvalValue::BigInt(!v)),
            _ => to_number(a).map(|n| EvalValue::Num(!to_int32(n) as f64)),
        },
        "typeof" => match a {
            EvalValue::Str(_) => Some("string"),
            EvalValue::Num(_) => Some("number"),
            EvalValue::BigInt(_) => Some("bigint"),
            EvalValue::Bool(_) => Some("boolean"),
            EvalValue::Null | EvalValue::Regex(_) => Some("object"),
            EvalValue::Undefined => Some("undefined"),
            _ => None,
        }
        .map(|t| EvalValue::Str(t.to_string())),
        "void" => Some(EvalValue::Undefined),
        "delete" => Some(EvalValue::Bool(true)),
        _ => None,
    };
    r.unwrap_or(EvalValue::Unknown)
}

pub(crate) fn eval_binary(op: &str, a: &EvalValue, b: &EvalValue) -> EvalValue {
    match op {
        "===" => strict_eq(a, b)
            .map(EvalValue::Bool)
            .unwrap_or(EvalValue::Unknown),
        "!==" => strict_eq(a, b)
            .map(|r| EvalValue::Bool(!r))
            .unwrap_or(EvalValue::Unknown),
        "==" => loose_eq(a, b)
            .map(EvalValue::Bool)
            .unwrap_or(EvalValue::Unknown),
        "!=" => loose_eq(a, b)
            .map(|r| EvalValue::Bool(!r))
            .unwrap_or(EvalValue::Unknown),
        "<" => match js_less_than(a, b) {
            Some(Some(r)) => EvalValue::Bool(r),
            Some(None) => EvalValue::Bool(false),
            None => EvalValue::Unknown,
        },
        ">" => eval_binary("<", b, a),
        "<=" => match js_less_than(b, a) {
            Some(Some(r)) => EvalValue::Bool(!r),
            Some(None) => EvalValue::Bool(false),
            None => EvalValue::Unknown,
        },
        ">=" => eval_binary("<=", b, a),
        // A bigint operand keeps arithmetic in bigint (`ToNumeric`, not
        // `ToNumber`), and `>>>` has no bigint form at all.
        "-" | "*" | "/" | "%" | "**" | "&" | "|" | "^" | "<<" | ">>"
            if matches!(a, EvalValue::BigInt(_)) || matches!(b, EvalValue::BigInt(_)) =>
        {
            bigint_arith(op, a, b)
        }
        ">>>" if matches!(a, EvalValue::BigInt(_)) || matches!(b, EvalValue::BigInt(_)) => {
            EvalValue::Unknown
        }
        "+" => {
            let a_str = matches!(a, EvalValue::Str(_) | EvalValue::Regex(_));
            let b_str = matches!(b, EvalValue::Str(_) | EvalValue::Regex(_));
            if a_str || b_str {
                match (to_js_string(a), to_js_string(b)) {
                    (Some(x), Some(y)) => EvalValue::Str(format!("{}{}", x, y)),
                    _ => EvalValue::Unknown,
                }
            } else if matches!(a, EvalValue::BigInt(_)) || matches!(b, EvalValue::BigInt(_)) {
                bigint_arith("+", a, b)
            } else {
                match (to_number(a), to_number(b)) {
                    (Some(x), Some(y)) => EvalValue::Num(x + y),
                    _ => EvalValue::Unknown,
                }
            }
        }
        "-" | "*" | "/" | "%" | "**" => match (to_number(a), to_number(b)) {
            (Some(x), Some(y)) => EvalValue::Num(match op {
                "-" => x - y,
                "*" => x * y,
                "/" => x / y,
                "%" => {
                    if y == 0.0 || x.is_nan() || y.is_nan() || x.is_infinite() {
                        f64::NAN
                    } else if y.is_infinite() {
                        x
                    } else {
                        x % y
                    }
                }
                _ => x.powf(y),
            }),
            _ => EvalValue::Unknown,
        },
        "&" | "|" | "^" | "<<" | ">>" => match (to_number(a), to_number(b)) {
            (Some(x), Some(y)) => {
                let xi = to_int32(x);
                let shift = to_uint32(y) & 31;
                EvalValue::Num(match op {
                    "&" => (xi & to_int32(y)) as f64,
                    "|" => (xi | to_int32(y)) as f64,
                    "^" => (xi ^ to_int32(y)) as f64,
                    "<<" => (xi << shift) as f64,
                    _ => (xi >> shift) as f64,
                })
            }
            _ => EvalValue::Unknown,
        },
        ">>>" => match (to_number(a), to_number(b)) {
            (Some(x), Some(y)) => {
                let xu = to_uint32(x);
                let shift = to_uint32(y) & 31;
                EvalValue::Num((xu >> shift) as f64)
            }
            _ => EvalValue::Unknown,
        },
        // `in` / `instanceof` need object operands — never known primitives.
        _ => EvalValue::Unknown,
    }
}

// ---------------------------------------------------------------------------
// Globals tables (mirrors `globals` / `global_constants` in scope.js)
// ---------------------------------------------------------------------------

/// Returns `Some((marker, computed))` where `computed` is `Some(value)` when
/// all arguments are known and the function is computable.
fn eval_global_call(keypath: &str, args: &[Evaluation]) -> Option<EvalValue> {
    let nums = || -> Option<Vec<f64>> {
        args.iter()
            .map(|e| e.known_value().and_then(to_number))
            .collect()
    };
    let num1 = || -> Option<f64> {
        if args.len() == 1 {
            args[0].known_value().and_then(to_number)
        } else {
            None
        }
    };

    let result = match keypath {
        "BigInt" | "Math.random" | "Math.f16round" => None,
        "Math.min" => nums().map(|v| v.iter().copied().fold(f64::INFINITY, f64::min)),
        "Math.max" => nums().map(|v| v.iter().copied().fold(f64::NEG_INFINITY, f64::max)),
        "Math.floor" => num1().map(f64::floor),
        "Math.round" => num1().map(|n| (n + 0.5).floor()),
        "Math.abs" => num1().map(f64::abs),
        "Math.ceil" => num1().map(f64::ceil),
        "Math.sqrt" => num1().map(f64::sqrt),
        "Math.trunc" => num1().map(f64::trunc),
        "Math.sign" => num1().map(|n| {
            if n.is_nan() || n == 0.0 {
                n
            } else {
                n.signum()
            }
        }),
        "Math.acos" => num1().map(f64::acos),
        "Math.asin" => num1().map(f64::asin),
        "Math.atan" => num1().map(f64::atan),
        "Math.cos" => num1().map(f64::cos),
        "Math.sin" => num1().map(f64::sin),
        "Math.tan" => num1().map(f64::tan),
        "Math.exp" => num1().map(f64::exp),
        "Math.log" => num1().map(f64::ln),
        "Math.log10" => num1().map(f64::log10),
        "Math.log2" => num1().map(f64::log2),
        "Math.log1p" => num1().map(f64::ln_1p),
        "Math.expm1" => num1().map(f64::exp_m1),
        "Math.cosh" => num1().map(f64::cosh),
        "Math.sinh" => num1().map(f64::sinh),
        "Math.tanh" => num1().map(f64::tanh),
        "Math.acosh" => num1().map(f64::acosh),
        "Math.asinh" => num1().map(f64::asinh),
        "Math.atanh" => num1().map(f64::atanh),
        "Math.cbrt" => num1().map(f64::cbrt),
        "Math.fround" => num1().map(|n| n as f32 as f64),
        "Math.atan2" | "Math.pow" | "Math.imul" | "Math.clz32" => {
            let v = nums()?;
            match keypath {
                "Math.atan2" if v.len() == 2 => Some(v[0].atan2(v[1])),
                "Math.pow" if v.len() == 2 => Some(v[0].powf(v[1])),
                "Math.imul" if v.len() == 2 => {
                    Some((to_int32(v[0]).wrapping_mul(to_int32(v[1]))) as f64)
                }
                "Math.clz32" if v.len() == 1 => Some(to_uint32(v[0]).leading_zeros() as f64),
                _ => None,
            }
        }
        "Number" => {
            if args.is_empty() {
                Some(0.0)
            } else if args.len() == 1 {
                // `Number()` is an explicit conversion, so unlike every
                // implicit `ToNumber` above it accepts a bigint — and rounds.
                match args[0].known_value() {
                    Some(EvalValue::BigInt(v)) => Some(*v as f64),
                    other => other.and_then(to_number),
                }
            } else {
                None
            }
        }
        "Number.parseFloat" => {
            // Not implemented precisely (prefix parsing) — fall back to marker.
            None
        }
        "Number.parseInt" => None,
        "Number.isInteger" | "Number.isFinite" | "Number.isNaN" | "Number.isSafeInteger" => {
            // These return booleans, but upstream's table marks them NUMBER;
            // compute when single known arg.
            if args.len() == 1 {
                if let Some(EvalValue::Num(n)) = args[0].known_value() {
                    let b = match keypath {
                        "Number.isInteger" => n.is_finite() && n.fract() == 0.0,
                        "Number.isFinite" => n.is_finite(),
                        "Number.isNaN" => n.is_nan(),
                        _ => n.is_finite() && n.fract() == 0.0 && n.abs() <= 9007199254740991.0,
                    };
                    return Some(EvalValue::Bool(b));
                }
                // non-number known arg → false for all of these
                if let Some(v) = args[0].known_value()
                    && !matches!(v, EvalValue::Num(_))
                {
                    return Some(EvalValue::Bool(false));
                }
            }
            None
        }
        "String" => {
            if args.is_empty() {
                return Some(EvalValue::Str(String::new()));
            }
            if args.len() == 1
                && let Some(s) = args[0].known_value().and_then(to_js_string)
            {
                return Some(EvalValue::Str(s));
            }
            return Some(EvalValue::StringMarker);
        }
        "String.fromCharCode" | "String.fromCodePoint" => {
            return Some(EvalValue::StringMarker);
        }
        _ => return None,
    };

    Some(match (keypath, result) {
        (_, Some(n)) => EvalValue::Num(n),
        ("String", None) => EvalValue::StringMarker,
        _ => EvalValue::NumberMarker,
    })
}

/// The `globals` fold over arguments that are already concrete values. The
/// client's constant folder asks the same question, and a second table there
/// would be a second answer to it.
pub(crate) fn eval_known_global_call(keypath: &str, args: &[EvalValue]) -> Option<EvalValue> {
    let args: Vec<Evaluation> = args.iter().cloned().map(Evaluation::single).collect();
    eval_global_call(keypath, &args)
}

fn is_global_keypath(keypath: &str) -> bool {
    matches!(
        keypath,
        "BigInt"
            | "Number"
            | "String"
            | "Number.isInteger"
            | "Number.isFinite"
            | "Number.isNaN"
            | "Number.isSafeInteger"
            | "Number.parseFloat"
            | "Number.parseInt"
            | "String.fromCharCode"
            | "String.fromCodePoint"
    ) || (keypath.starts_with("Math.") && keypath.len() > 5)
}

pub(crate) fn global_constant(keypath: &str) -> Option<f64> {
    Some(match keypath {
        "Math.PI" => std::f64::consts::PI,
        "Math.E" => std::f64::consts::E,
        "Math.LN10" => std::f64::consts::LN_10,
        "Math.LN2" => std::f64::consts::LN_2,
        "Math.LOG10E" => std::f64::consts::LOG10_E,
        "Math.LOG2E" => std::f64::consts::LOG2_E,
        "Math.SQRT2" => std::f64::consts::SQRT_2,
        "Math.SQRT1_2" => std::f64::consts::FRAC_1_SQRT_2,
        _ => return None,
    })
}

/// The full rune list (mirrors `is_rune` in utils.js).
fn is_rune(keypath: &str) -> bool {
    matches!(
        keypath,
        "$state"
            | "$state.raw"
            | "$state.snapshot"
            | "$state.eager"
            | "$props"
            | "$props.id"
            | "$bindable"
            | "$derived"
            | "$derived.by"
            | "$effect"
            | "$effect.pre"
            | "$effect.tracking"
            | "$effect.root"
            | "$effect.pending"
            | "$inspect"
            | "$host"
    )
}

// ---------------------------------------------------------------------------
// estree-JSON helpers
// ---------------------------------------------------------------------------

fn node_type(node: &Value) -> Option<&str> {
    node.get("type").and_then(|t| t.as_str())
}

/// Build the dotted keypath of a (possibly nested static) member/identifier
/// chain, mirroring `get_global_keypath`. Returns `(base, keypath)`.
fn get_keypath(node: &Value) -> Option<(String, String)> {
    let mut parts: Vec<&str> = Vec::new();
    let mut n = node;
    while node_type(n) == Some("MemberExpression") {
        if n.get("computed").and_then(|c| c.as_bool()) == Some(true) {
            return None;
        }
        let prop = n.get("property")?;
        if node_type(prop) != Some("Identifier") {
            return None;
        }
        parts.push(prop.get("name")?.as_str()?);
        n = n.get("object")?;
    }
    if node_type(n) != Some("Identifier") {
        return None;
    }
    let base = n.get("name")?.as_str()?;
    parts.push(base);
    parts.reverse();
    Some((base.to_string(), parts.join(".")))
}

/// Parse a raw-source literal initial (`'world'`, `12`, `true`, `null`, …).
fn parse_literal_text(text: &str) -> Option<EvalValue> {
    let t = text.trim();
    match t {
        "true" => return Some(EvalValue::Bool(true)),
        "false" => return Some(EvalValue::Bool(false)),
        "null" => return Some(EvalValue::Null),
        "undefined" | "void 0" => return Some(EvalValue::Undefined),
        _ => {}
    }
    if t.len() >= 2 {
        let bytes = t.as_bytes();
        let quote = bytes[0];
        if (quote == b'\'' || quote == b'"') && bytes[t.len() - 1] == quote {
            let inner = &t[1..t.len() - 1];
            // Reject strings with interior unescaped quotes/backslashes that we
            // cannot faithfully unescape with a simple pass.
            let mut out = String::with_capacity(inner.len());
            let mut chars = inner.chars();
            while let Some(c) = chars.next() {
                if c == '\\' {
                    match chars.next()? {
                        'n' => out.push('\n'),
                        't' => out.push('\t'),
                        'r' => out.push('\r'),
                        '\\' => out.push('\\'),
                        '\'' => out.push('\''),
                        '"' => out.push('"'),
                        '`' => out.push('`'),
                        '0' => out.push('\0'),
                        // `\uXXXX` / `\u{X…}` / `\xHH` → the actual character, so
                        // a known-const string of escapes folds to its cooked
                        // value (e.g. bidirectional-control chars).
                        'u' => {
                            if chars.clone().next() == Some('{') {
                                chars.next();
                                let mut hex = String::new();
                                for h in chars.by_ref() {
                                    if h == '}' {
                                        break;
                                    }
                                    hex.push(h);
                                }
                                out.push(char::from_u32(u32::from_str_radix(&hex, 16).ok()?)?);
                            } else {
                                let mut hex = String::new();
                                for _ in 0..4 {
                                    hex.push(chars.next()?);
                                }
                                out.push(char::from_u32(u32::from_str_radix(&hex, 16).ok()?)?);
                            }
                        }
                        'x' => {
                            let mut hex = String::new();
                            for _ in 0..2 {
                                hex.push(chars.next()?);
                            }
                            out.push(char::from_u32(u32::from_str_radix(&hex, 16).ok()?)?);
                        }
                        _ => return None,
                    }
                } else if c == quote as char {
                    return None;
                } else {
                    out.push(c);
                }
            }
            return Some(EvalValue::Str(out));
        }
    }
    // Numeric literals: separators, 0b/0o/0x bases, and bigint suffix.
    let cleaned: String = t.chars().filter(|c| *c != '_').collect();
    let c = cleaned.as_str();
    if let Some(digits) = c.strip_suffix('n') {
        let v = if let Some(h) = digits
            .strip_prefix("0x")
            .or_else(|| digits.strip_prefix("0X"))
        {
            i128::from_str_radix(h, 16).ok()?
        } else if let Some(o) = digits
            .strip_prefix("0o")
            .or_else(|| digits.strip_prefix("0O"))
        {
            i128::from_str_radix(o, 8).ok()?
        } else if let Some(b) = digits
            .strip_prefix("0b")
            .or_else(|| digits.strip_prefix("0B"))
        {
            i128::from_str_radix(b, 2).ok()?
        } else {
            if digits.is_empty() || !digits.bytes().all(|b| b.is_ascii_digit()) {
                return None;
            }
            digits.parse::<i128>().ok()?
        };
        return Some(EvalValue::BigInt(v));
    }
    if let Some(h) = c.strip_prefix("0x").or_else(|| c.strip_prefix("0X")) {
        return u128::from_str_radix(h, 16)
            .ok()
            .map(|v| EvalValue::Num(v as f64));
    }
    if let Some(o) = c.strip_prefix("0o").or_else(|| c.strip_prefix("0O")) {
        return u128::from_str_radix(o, 8)
            .ok()
            .map(|v| EvalValue::Num(v as f64));
    }
    if let Some(b) = c.strip_prefix("0b").or_else(|| c.strip_prefix("0B")) {
        return u128::from_str_radix(b, 2)
            .ok()
            .map(|v| EvalValue::Num(v as f64));
    }
    if let Ok(n) = c.parse::<f64>()
        && c.chars()
            .all(|ch| ch.is_ascii_digit() || matches!(ch, '.' | '-' | '+' | 'e' | 'E'))
    {
        return Some(EvalValue::Num(n));
    }
    None
}

// ---------------------------------------------------------------------------
// Evaluator
// ---------------------------------------------------------------------------

/// Analysis-driven evaluation context — the minimal set of fields the
/// `scope.evaluate` port reads. Decoupled from `ServerCodeGenerator` so the
/// same proven evaluator drives BOTH the legacy (text-based) server pipeline
/// and the new AST pipeline (`server/ast/`). The legacy generator builds one
/// of these via [`ServerCodeGenerator::eval_ctx`] (borrowing its own fields, so
/// behaviour is byte-identical); the AST pipeline builds one from its
/// `ServerTransformState`.
pub(crate) struct EvalCtx<'c> {
    pub analysis: Option<&'c ComponentAnalysis>,
    pub constant_vars: &'c FxHashMap<String, String>,
    pub source: &'c str,
    pub use_async: bool,
    pub top_level_blocker_map: &'c FxHashMap<String, usize>,
    pub current_scope_index: Option<usize>,
    pub template_scopes_cache: &'c OnceCell<FxHashSet<usize>>,
}

impl<'a> EvalCtx<'a> {
    /// Evaluate a template expression (typed AST wrapper).
    pub(crate) fn evaluate_template_expression(
        &self,
        expr: &crate::ast::js::Expression,
    ) -> Evaluation {
        // Lazy expressions are resolved before analysis; guard anyway since
        // `as_json()` panics on the Lazy variant.
        if matches!(expr, crate::ast::js::Expression::Lazy { .. }) {
            return Evaluation::unknown();
        }
        // Fast path: a bare identifier (the dominant template-expression
        // shape, e.g. `{count}`) — resolve directly without materializing
        // the serde_json tree (`as_json` serializes the whole arena node on
        // first call, which dominates server-transform time on
        // template-heavy components).
        if let Some(name) = expr.identifier_name() {
            return self.evaluate_identifier(name, 0);
        }
        self.evaluate_estree(expr.as_json(), 0)
    }

    /// Whether `name` resolves to a local binding (used to validate global
    /// keypaths: upstream requires `scope.get(name) === null`).
    fn identifier_has_binding(&self, name: &str) -> bool {
        if self.constant_vars.contains_key(name) {
            return true;
        }
        if let Some(analysis) = self.analysis {
            return analysis.root.bindings.iter().any(|b| b.name == name);
        }
        false
    }

    /// Whether a template-scope binding declared in `scope_index` is lexically
    /// reachable from the fragment this generator is emitting — i.e. whether
    /// `scope_index` is on the scope chain of the render position, mirroring
    /// upstream's `scope.get(name)` walking `Scope#parent`.
    ///
    /// A template declaration (`{@const}` / `{const}` / `{let}` / `let:` / each
    /// item) belongs to exactly one fragment, so a sibling fragment must never
    /// substitute it: `{#if a}…{:else}{@const x = 1}…{/if}{#key k}{@const x = 2}…{/key}`
    /// has two unrelated `x` bindings, and each branch must fold its own.
    ///
    /// With no known render position (`current_scope_index == None`) the caller
    /// has no chain to walk, so every template scope stays a candidate and the
    /// same-name agreement rule in [`Self::evaluate_identifier`] decides.
    fn template_binding_is_reachable(&self, scope_index: usize) -> bool {
        let Some(analysis) = self.analysis else {
            return true;
        };
        let Some(mut current) = self.current_scope_index else {
            return true;
        };
        loop {
            if current == scope_index {
                return true;
            }
            match analysis.root.all_scopes.get(current).and_then(|s| s.parent) {
                Some(parent) => current = parent,
                None => return false,
            }
        }
    }

    /// Depth of `scope_index` on the render position's scope chain (0 = the
    /// render position's own scope). `None` when it is not on the chain.
    /// Used to pick the INNERMOST of several same-named reachable bindings,
    /// mirroring `scope.get(name)` returning the nearest declaration.
    fn scope_chain_depth(&self, scope_index: usize) -> Option<u32> {
        let analysis = self.analysis?;
        let mut current = self.current_scope_index?;
        let mut depth = 0u32;
        loop {
            if current == scope_index {
                return Some(depth);
            }
            current = analysis
                .root
                .all_scopes
                .get(current)
                .and_then(|s| s.parent)?;
            depth += 1;
        }
    }

    /// Resolve an identifier, mirroring upstream's `Identifier` branch.
    /// `pub(crate)` so the attribute fast path (element.rs, via
    /// `ServerCodeGenerator::evaluate_identifier_pub`) and the AST pipeline can
    /// resolve a bare identifier directly.
    pub(crate) fn evaluate_identifier(&self, name: &str, depth: u8) -> Evaluation {
        if depth > MAX_DEPTH {
            return Evaluation::unknown();
        }

        // `const <name> = $props.id()` — upstream scope.js evaluates an
        // identifier whose binding initial is a `$props.id()` CallExpression to
        // STRING (defined, value unknown), so attribute interpolation elides the
        // `$.stringify(...)` wrapper. The analyzer records that declaration's
        // name in `analysis.props_id` (the binding itself carries no `initial`
        // text), so resolve it here.
        if let Some(a) = self.analysis
            && a.props_id.as_deref() == Some(name)
        {
            return Evaluation::single(EvalValue::StringMarker);
        }

        // Async-blocker variables are assigned inside `$$promises[n]` thunks;
        // the rsvelte server architecture must NOT fold them (they render via
        // `$$renderer.async(...)` wrappers). Mirrors the constant_vars removal
        // in `ServerCodeGenerator::new`.
        if self.use_async && self.top_level_blocker_map.contains_key(name) {
            return Evaluation::unknown();
        }

        // Only bindings in template-visible scopes participate: the root /
        // module scope, the instance-script scope, and template scopes
        // (each/snippet/@const fragments). Bindings inside script functions
        // (params, function-local lets) can never be referenced from a
        // template expression, so they must not veto the agreement rule.
        let mut bindings: Vec<_> = self
            .analysis
            .map(|a| {
                let template_scopes = self.template_scopes_cache.get_or_init(|| {
                    a.root
                        .template_scope_map
                        .values()
                        .chain(a.root.if_alternate_scope_map.values())
                        .chain(a.root.each_fallback_scope_map.values())
                        .copied()
                        .collect()
                });
                a.root
                    .bindings
                    .iter()
                    .filter(|b| {
                        b.name == name
                            && (b.scope_index == 0
                                || b.scope_index == a.root.instance_scope_index
                                || (template_scopes.contains(&b.scope_index)
                                    && self.template_binding_is_reachable(b.scope_index)))
                    })
                    .collect::<Vec<_>>()
            })
            .unwrap_or_default();

        static DEBUG_EVAL: std::sync::OnceLock<bool> = std::sync::OnceLock::new();
        if *DEBUG_EVAL.get_or_init(|| std::env::var_os("DEBUG_EVAL").is_some()) {
            for b in &bindings {
                eprintln!(
                    "[evaluate] name={} kind={:?} scope={} decl_start={:?} updated={} initial={:?} initial_type={:?}",
                    b.name,
                    b.kind,
                    b.scope_index,
                    b.declaration_start,
                    b.is_updated(),
                    b.initial,
                    b.initial_node_type
                );
            }
        }

        // Upstream `scope.declare()` overwrites a same-named `var`
        // redeclaration (`declarations.set(name, binding)` — last wins), so
        // `var test = ""; var test = 42;` resolves to the `42` binding. Our
        // flat bindings Vec keeps both; collapse bindings that share a scope to
        // the latest-declared one before evaluating, so the agreement rule
        // below only spans genuinely distinct (shadowing) scopes.
        if bindings.len() > 1 {
            use rustc_hash::FxHashMap;
            let mut by_scope: FxHashMap<
                usize,
                &crate::compiler::phases::phase2_analyze::scope::Binding,
            > = FxHashMap::default();
            for &b in &bindings {
                by_scope
                    .entry(b.scope_index)
                    .and_modify(|cur| {
                        if b.declaration_start > cur.declaration_start {
                            *cur = b;
                        }
                    })
                    .or_insert(b);
            }
            if by_scope.len() < bindings.len() {
                bindings = by_scope.into_values().collect();
            }
        }

        // With a known render position the scope chain disambiguates shadowing
        // exactly like upstream `scope.get(name)`: the NEAREST declaration wins
        // and the outer ones are invisible. Without one, every candidate stays
        // and the agreement rule below merges their value sets.
        if bindings.len() > 1
            && self.current_scope_index.is_some()
            && let Some(min_depth) = bindings
                .iter()
                .filter_map(|b| self.scope_chain_depth(b.scope_index))
                .min()
        {
            bindings.retain(|b| self.scope_chain_depth(b.scope_index) == Some(min_depth));
        }

        if !bindings.is_empty() {
            // A single binding's evaluation passes through as-is so type
            // markers (e.g. StringMarker from `$props.id()`) survive — they
            // are not "known values" but still prove string-ness/defined-ness
            // (upstream merges full value sets including STRING/NUMBER).
            if bindings.len() == 1 {
                return self.evaluate_binding_initial(bindings[0], depth);
            }
            // Multiple same-named bindings in distinct (shadowing) scopes: the
            // server generator does not track which lexical scope is in effect,
            // so merge the full value SET of every candidate (union), mirroring
            // upstream's `Evaluation` value merge. Preserving type markers this
            // way keeps `is_string()` / `is_defined()` true when *all* branches
            // agree on a string type (e.g. two `{@const x = a ? '-50%' : '0%'}`
            // in an `{#if}`/`{:else}`), so reads elide `$.stringify(...)` — even
            // without a single concrete known value. A concrete value is still
            // inlined only when every binding agrees on it (`is_known()` stays
            // true only for a one-element union), and any Unknown / null /
            // undefined contributor collapses the result to not-defined.
            let mut merged = Evaluation::new();
            for binding in &bindings {
                merged.extend(self.evaluate_binding_initial(binding, depth));
            }
            return merged;
        }

        // No binding in the analysis: fall back to the (scope-managed)
        // constant_vars table, then `undefined`.
        if let Some(text) = self.constant_vars.get(name) {
            return match text.as_str() {
                "null" => Evaluation::single(EvalValue::Null),
                "undefined" => Evaluation::single(EvalValue::Undefined),
                "true" => Evaluation::single(EvalValue::Bool(true)),
                "false" => Evaluation::single(EvalValue::Bool(false)),
                t => {
                    if let Ok(n) = t.parse::<f64>() {
                        Evaluation::single(EvalValue::Num(n))
                    } else {
                        Evaluation::single(EvalValue::Str(t.to_string()))
                    }
                }
            };
        }

        if name == "undefined" {
            return Evaluation::single(EvalValue::Undefined);
        }

        Evaluation::unknown()
    }

    /// Whether the source declares `name` with the initializer `$props.id()`
    /// (`const uid = $props.id()`). Cheap byte-gated scan: only runs when the
    /// source contains `$props.id()` at all.
    fn binding_initial_is_props_id(&self, name: &str) -> bool {
        use memchr::memmem;
        const NEEDLE: &[u8] = b"$props.id()";
        let src = self.source.as_bytes();
        let mut from = 0usize;
        while let Some(p) = memmem::find(&src[from..], NEEDLE) {
            let pos = from + p;
            from = pos + NEEDLE.len();
            // Walk back over `= ` to the identifier that ends right before.
            let mut i = pos;
            while i > 0 && matches!(src[i - 1], b' ' | b'\t') {
                i -= 1;
            }
            if i == 0 || src[i - 1] != b'=' {
                continue;
            }
            i -= 1;
            while i > 0 && matches!(src[i - 1], b' ' | b'\t') {
                i -= 1;
            }
            let end = i;
            while i > 0 && (src[i - 1].is_ascii_alphanumeric() || matches!(src[i - 1], b'_' | b'$'))
            {
                i -= 1;
            }
            if &self.source[i..end] == name {
                return true;
            }
        }
        false
    }

    fn evaluate_binding_initial(
        &self,
        binding: &crate::compiler::phases::phase2_analyze::scope::Binding,
        depth: u8,
    ) -> Evaluation {
        use BindingKind::*;

        // Props (and prop-like bindings) are never known.
        if matches!(binding.kind, Prop | BindableProp | RestProp) {
            return Evaluation::unknown();
        }
        // Template-loop bindings: upstream marks each indexes NUMBER and
        // items/await/snippet params unknown.
        if matches!(binding.kind, EachIndex) {
            return Evaluation::single(EvalValue::NumberMarker);
        }
        if matches!(
            binding.kind,
            EachItem | AwaitThen | AwaitCatch | SnippetParam | Let
        ) {
            return Evaluation::unknown();
        }
        if binding.initial_node_type.as_deref() == Some("SnippetBlock")
            || binding.initial_node_type.as_deref() == Some("ImportDeclaration")
        {
            return Evaluation::unknown();
        }
        if binding.is_updated() {
            return Evaluation::unknown();
        }
        // `$state()` / `$state.raw()` with no argument evaluates to
        // `undefined` (upstream scope.js CallExpression rune case: no
        // argument → `values.add(undefined)`). The analyzer stores the rune
        // ARGUMENT as `initial`, so a no-arg rune leaves both `initial` and
        // `initial_node_type` unset — distinguishable from a non-literal
        // argument, which sets `initial_node_type`.
        if matches!(binding.kind, State | RawState)
            && binding.initial.is_none()
            && binding.initial_node_type.is_none()
        {
            return Evaluation::single(EvalValue::Undefined);
        }
        let Some(initial) = binding.initial.as_deref() else {
            // A template-literal initializer (`const w = `…${x}…``) is always a
            // defined string (upstream scope.js `TemplateLiteral` → STRING marker),
            // so reads of it must NOT be wrapped in `$.stringify(...)`. Its quasis
            // and expressions still fold to a concrete value when every
            // interpolation is known, so try that before settling for the marker.
            if binding.initial_node_type.as_deref() == Some("TemplateLiteral") {
                if depth < MAX_DEPTH
                    && let Some(init_json) = binding.init_expr_json_parsed()
                {
                    return self.evaluate_estree(init_json, depth + 1);
                }
                return Evaluation::single(EvalValue::StringMarker);
            }
            // The analyzer does not capture non-literal initials in
            // `binding.initial`, but upstream's `scope.evaluate` still knows
            // `const uid = $props.id()` is a (defined) string — `$props.id`
            // returns STRING (scope.js `case '$props.id'`). Recognize the
            // `<name> = $props.id()` initializer from the source text.
            if matches!(binding.kind, Normal) && self.binding_initial_is_props_id(&binding.name) {
                return Evaluation::single(EvalValue::StringMarker);
            }
            // A non-literal initializer is kept as AST JSON instead; upstream's
            // `scope.evaluate` recurses into the init node whatever its shape.
            if !matches!(binding.kind, Derived)
                && depth < MAX_DEPTH
                && let Some(init_json) = binding.init_expr_json_parsed()
            {
                return self.evaluate_estree(init_json, depth + 1);
            }
            return Evaluation::unknown();
        };

        let trimmed = initial.trim_start();
        if trimmed.starts_with('{') {
            // estree-JSON dump (from `$derived(...)` / `{@const ...}` initials)
            if let Ok(json) = serde_json::from_str::<Value>(initial) {
                return self.evaluate_estree(&json, depth + 1);
            }
            return Evaluation::unknown();
        }

        match parse_literal_text(initial) {
            Some(v) => Evaluation::single(v),
            None => Evaluation::unknown(),
        }
    }

    /// Core evaluator over estree-JSON, mirroring upstream's `Evaluation`
    /// constructor switch.
    pub(crate) fn evaluate_estree(&self, node: &Value, depth: u8) -> Evaluation {
        if depth > MAX_DEPTH {
            return Evaluation::unknown();
        }
        let Some(ty) = node_type(node) else {
            return Evaluation::unknown();
        };

        match ty {
            "Literal" => {
                if let Some(digits) = node.get("bigint").and_then(|b| b.as_str()) {
                    return match digits.parse::<i128>() {
                        Ok(v) => Evaluation::single(EvalValue::BigInt(v)),
                        Err(_) => Evaluation::unknown(),
                    };
                }
                // A regex literal stringifies to its source but is an object, so
                // it cannot be folded as a `Str` (`typeof` would print `string`).
                if let Some(regex) = node.get("regex") {
                    let pattern = regex.get("pattern").and_then(|p| p.as_str()).unwrap_or("");
                    let flags = regex.get("flags").and_then(|f| f.as_str()).unwrap_or("");
                    return Evaluation::single(EvalValue::Regex(format!("/{}/{}", pattern, flags)));
                }
                match node.get("value") {
                    Some(Value::String(s)) => Evaluation::single(EvalValue::Str(s.clone())),
                    Some(Value::Number(n)) => {
                        Evaluation::single(EvalValue::Num(n.as_f64().unwrap_or(f64::NAN)))
                    }
                    Some(Value::Bool(b)) => Evaluation::single(EvalValue::Bool(*b)),
                    Some(Value::Null) => Evaluation::single(EvalValue::Null),
                    _ => Evaluation::unknown(),
                }
            }

            "Identifier" => {
                let Some(name) = node.get("name").and_then(|n| n.as_str()) else {
                    return Evaluation::unknown();
                };
                self.evaluate_identifier(name, depth)
            }

            "BinaryExpression" => {
                let (Some(left), Some(right), Some(op)) = (
                    node.get("left"),
                    node.get("right"),
                    node.get("operator").and_then(|o| o.as_str()),
                ) else {
                    return Evaluation::unknown();
                };
                let a = self.evaluate_estree(left, depth + 1);
                let b = self.evaluate_estree(right, depth + 1);
                if let (Some(av), Some(bv)) = (a.known_value(), b.known_value()) {
                    let r = eval_binary(op, av, bv);
                    if !matches!(r, EvalValue::Unknown) {
                        return Evaluation::single(r);
                    }
                    return Evaluation::unknown();
                }
                // Partial knowledge → type markers (mirrors upstream)
                let mut ev = Evaluation::new();
                match op {
                    "!=" | "!==" | "<" | "<=" | ">" | ">=" | "==" | "===" | "in" | "instanceof" => {
                        ev.add(EvalValue::Bool(true));
                        ev.add(EvalValue::Bool(false));
                    }
                    "%" | "&" | "*" | "**" | "-" | "/" | "<<" | ">>" | ">>>" | "^" | "|" => {
                        ev.add(EvalValue::NumberMarker);
                    }
                    "+" => {
                        let a_is_string = a.is_string();
                        let b_is_string = b.is_string();
                        let a_is_number = a
                            .values
                            .iter()
                            .all(|v| matches!(v, EvalValue::Num(_) | EvalValue::NumberMarker))
                            && !a.values.is_empty();
                        let b_is_number = b
                            .values
                            .iter()
                            .all(|v| matches!(v, EvalValue::Num(_) | EvalValue::NumberMarker))
                            && !b.values.is_empty();
                        if a_is_string || b_is_string {
                            ev.add(EvalValue::StringMarker);
                        } else if a_is_number && b_is_number {
                            ev.add(EvalValue::NumberMarker);
                        } else {
                            ev.add(EvalValue::StringMarker);
                            ev.add(EvalValue::NumberMarker);
                        }
                    }
                    _ => ev.add(EvalValue::Unknown),
                }
                ev
            }

            "ConditionalExpression" => {
                let (Some(test), Some(consequent), Some(alternate)) = (
                    node.get("test"),
                    node.get("consequent"),
                    node.get("alternate"),
                ) else {
                    return Evaluation::unknown();
                };
                let t = self.evaluate_estree(test, depth + 1);
                let c = self.evaluate_estree(consequent, depth + 1);
                let a = self.evaluate_estree(alternate, depth + 1);
                let mut ev = Evaluation::new();
                if let Some(tv) = t.known_value()
                    && let Some(truthy) = tv.truthy()
                {
                    ev.extend(if truthy { c } else { a });
                    return ev;
                }
                ev.extend(c);
                ev.extend(a);
                ev
            }

            "LogicalExpression" => {
                let (Some(left), Some(right), Some(op)) = (
                    node.get("left"),
                    node.get("right"),
                    node.get("operator").and_then(|o| o.as_str()),
                ) else {
                    return Evaluation::unknown();
                };
                let a = self.evaluate_estree(left, depth + 1);
                let b = self.evaluate_estree(right, depth + 1);
                let mut ev = Evaluation::new();
                if let Some(av) = a.known_value() {
                    let take_left = match op {
                        "&&" => av.truthy().map(|t| !t),
                        "||" => av.truthy(),
                        "??" => av.is_nullish().map(|n| !n),
                        _ => None,
                    };
                    match take_left {
                        Some(true) => {
                            ev.add(av.clone());
                            return ev;
                        }
                        Some(false) => {
                            ev.extend(b);
                            return ev;
                        }
                        None => return Evaluation::unknown(),
                    }
                }
                ev.extend(a);
                ev.extend(b);
                ev
            }

            "UnaryExpression" => {
                let (Some(arg), Some(op)) = (
                    node.get("argument"),
                    node.get("operator").and_then(|o| o.as_str()),
                ) else {
                    return Evaluation::unknown();
                };
                let a = self.evaluate_estree(arg, depth + 1);
                if let Some(av) = a.known_value() {
                    return match eval_unary(op, av) {
                        EvalValue::Unknown => Evaluation::unknown(),
                        v => Evaluation::single(v),
                    };
                }
                let mut ev = Evaluation::new();
                match op {
                    "!" | "delete" => {
                        ev.add(EvalValue::Bool(false));
                        ev.add(EvalValue::Bool(true));
                    }
                    "+" | "-" | "~" => ev.add(EvalValue::NumberMarker),
                    "typeof" => ev.add(EvalValue::StringMarker),
                    "void" => ev.add(EvalValue::Undefined),
                    _ => ev.add(EvalValue::Unknown),
                }
                ev
            }

            "CallExpression" => {
                let Some(callee) = node.get("callee") else {
                    return Evaluation::unknown();
                };
                let empty = Vec::new();
                let args = node
                    .get("arguments")
                    .and_then(|a| a.as_array())
                    .unwrap_or(&empty);

                if let Some((base, keypath)) = get_keypath(callee)
                    && !self.identifier_has_binding(&base)
                {
                    if is_rune(&keypath) {
                        match keypath.as_str() {
                            "$state" | "$state.raw" | "$derived" => {
                                if let Some(arg) = args.first() {
                                    return self.evaluate_estree(arg, depth + 1);
                                }
                                return Evaluation::single(EvalValue::Undefined);
                            }
                            "$props.id" => {
                                return Evaluation::single(EvalValue::StringMarker);
                            }
                            "$effect.tracking" => {
                                let mut ev = Evaluation::new();
                                ev.add(EvalValue::Bool(false));
                                ev.add(EvalValue::Bool(true));
                                return ev;
                            }
                            "$derived.by" => {
                                if let Some(arg) = args.first()
                                    && node_type(arg) == Some("ArrowFunctionExpression")
                                    && arg
                                        .get("body")
                                        .and_then(node_type)
                                        .is_some_and(|t| t != "BlockStatement")
                                    && let Some(body) = arg.get("body")
                                {
                                    return self.evaluate_estree(body, depth + 1);
                                }
                                return Evaluation::unknown();
                            }
                            _ => return Evaluation::unknown(),
                        }
                    }

                    if is_global_keypath(&keypath)
                        && args.iter().all(|a| node_type(a) != Some("SpreadElement"))
                    {
                        let evaluated: Vec<Evaluation> = args
                            .iter()
                            .map(|a| self.evaluate_estree(a, depth + 1))
                            .collect();
                        if let Some(v) = eval_global_call(&keypath, &evaluated) {
                            return Evaluation::single(v);
                        }
                        return Evaluation::unknown();
                    }
                }

                Evaluation::unknown()
            }

            "TemplateLiteral" => {
                let (Some(quasis), Some(exprs)) = (
                    node.get("quasis").and_then(|q| q.as_array()),
                    node.get("expressions").and_then(|e| e.as_array()),
                ) else {
                    return Evaluation::unknown();
                };
                let cooked = |i: usize| -> Option<String> {
                    quasis
                        .get(i)?
                        .get("value")?
                        .get("cooked")?
                        .as_str()
                        .map(String::from)
                };
                let Some(mut result) = cooked(0) else {
                    return Evaluation::unknown();
                };
                for (i, e) in exprs.iter().enumerate() {
                    let ev = self.evaluate_estree(e, depth + 1);
                    if let Some(v) = ev.known_value().and_then(to_js_string) {
                        result.push_str(&v);
                        match cooked(i + 1) {
                            Some(q) => result.push_str(&q),
                            None => return Evaluation::unknown(),
                        }
                    } else {
                        return Evaluation::single(EvalValue::StringMarker);
                    }
                }
                Evaluation::single(EvalValue::Str(result))
            }

            "MemberExpression" => {
                if let Some((base, keypath)) = get_keypath(node)
                    && !self.identifier_has_binding(&base)
                    && let Some(v) = global_constant(&keypath)
                {
                    return Evaluation::single(EvalValue::Num(v));
                }
                Evaluation::unknown()
            }

            "ArrowFunctionExpression" | "FunctionExpression" | "FunctionDeclaration" => {
                Evaluation::single(EvalValue::FunctionMarker)
            }

            // TypeScript wrappers: evaluate the inner expression.
            "TSAsExpression"
            | "TSNonNullExpression"
            | "TSSatisfiesExpression"
            | "TSTypeAssertion"
            | "ParenthesizedExpression" => {
                if let Some(inner) = node.get("expression") {
                    return self.evaluate_estree(inner, depth + 1);
                }
                Evaluation::unknown()
            }

            _ => Evaluation::unknown(),
        }
    }
}
