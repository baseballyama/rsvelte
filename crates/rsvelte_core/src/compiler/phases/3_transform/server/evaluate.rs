//! Shared static expression evaluation for analysis and template output.
//!
//! Port of the official compiler's `scope.evaluate` (`phases/scope.js`,
//! `class Evaluation`). Phase 2 uses it for Identifier `has_state`, and the
//! server transform calls it for every template
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

    pub(crate) fn single(v: EvalValue) -> Self {
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

/// Round to the nearest IEEE-754 binary16 value, ties to even — `Math.f16round`.
///
/// `scale` is an exact power of two, so both the divide and the multiply are
/// exact and `round_ties_even` is the only rounding step, which is precisely
/// what a binary16 conversion does.
fn f16_round(value: f64) -> f64 {
    if !value.is_finite() || value == 0.0 {
        return value;
    }
    let magnitude = value.abs();
    // The midpoint between the largest finite binary16 (65504) and the next
    // binade rounds away to infinity under ties-to-even.
    if magnitude >= 65520.0 {
        return f64::INFINITY.copysign(value);
    }
    // Clamped at the smallest normal binary16 exponent so subnormals land on
    // the fixed 2^-24 grid. A subnormal f64 input reads as -1023 and clamps too.
    let exponent = (((magnitude.to_bits() >> 52) & 0x7FF) as i32 - 1023).max(-14);
    let scale = f64::from_bits((((exponent - 10) + 1023) as u64) << 52);
    (value / scale).round_ties_even() * scale
}

/// Collect UTF-16 code units from the arguments and re-encode them. Yields
/// `None` — "do not fold" — when an argument is not known, when it is out of
/// range for the operation (where JS would throw), or when the code units are
/// not valid UTF-16, which a Rust `String` cannot carry.
fn build_string(
    args: &[Evaluation],
    push: impl Fn(f64, &mut Vec<u16>) -> Option<()>,
) -> Option<EvalValue> {
    let mut units: Vec<u16> = Vec::with_capacity(args.len());
    for arg in args {
        push(to_number(arg.known_value()?)?, &mut units)?;
    }
    String::from_utf16(&units).ok().map(EvalValue::Str)
}

/// `ToUint16` — the conversion `String.fromCharCode` applies to each argument.
fn push_char_code(n: f64, units: &mut Vec<u16>) -> Option<()> {
    let unit = if n.is_finite() {
        n.trunc().rem_euclid(65536.0) as u16
    } else {
        0
    };
    units.push(unit);
    Some(())
}

/// `String.fromCodePoint` throws a `RangeError` on a non-integer or out-of-range
/// argument; decline to fold rather than reproduce a compile-time throw.
fn push_code_point(n: f64, units: &mut Vec<u16>) -> Option<()> {
    if !n.is_finite() || n.fract() != 0.0 || !(0.0..=1114111.0).contains(&n) {
        return None;
    }
    let code_point = n as u32;
    if code_point < 0x10000 {
        units.push(code_point as u16);
    } else {
        let offset = code_point - 0x10000;
        units.push(0xD800 + (offset >> 10) as u16);
        units.push(0xDC00 + (offset & 0x3FF) as u16);
    }
    Some(())
}

/// Returns `Some((marker, computed))` where `computed` is `Some(value)` when
/// all arguments are known and the function is computable.
fn eval_global_call(keypath: &str, args: &[Evaluation]) -> Option<EvalValue> {
    let nums = || -> Option<Vec<f64>> {
        args.iter()
            .map(|e| e.known_value().and_then(to_number))
            .collect()
    };
    // A JS function reads a missing argument as `undefined`, i.e. `NaN`, and
    // ignores a surplus one — but upstream computes only when EVERY argument is
    // known (`scope.js:517`), including the ones the function never looks at.
    let all_known = args.iter().all(|e| e.is_known());
    let num_at = |i: usize| -> Option<f64> {
        if !all_known {
            return None;
        }
        match args.get(i) {
            None => Some(f64::NAN),
            Some(e) => e.known_value().and_then(to_number),
        }
    };
    let num1 = || num_at(0);
    let str_at = |i: usize| -> Option<String> {
        if !all_known {
            return None;
        }
        match args.get(i) {
            None => Some("undefined".to_string()),
            Some(e) => e.known_value().and_then(to_js_string),
        }
    };

    let result = match keypath {
        // `BigInt` and `Math.random` are the only two entries upstream stores
        // with no fold function; everything else here has one.
        "BigInt" | "Math.random" => None,
        "Math.f16round" => num1().map(f16_round),
        // Rust's `f64::min` / `f64::max` IGNORE a NaN operand; JS propagates it.
        "Math.min" => nums().map(|v| v.iter().copied().fold(f64::INFINITY, js_min)),
        "Math.max" => nums().map(|v| v.iter().copied().fold(f64::NEG_INFINITY, js_max)),
        "Math.floor" => num1().map(f64::floor),
        "Math.round" => num1().map(js_round),
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
        "Math.atan2" => Some(num_at(0)?.atan2(num_at(1)?)),
        "Math.pow" => Some(js_pow(num_at(0)?, num_at(1)?)),
        "Math.imul" => Some(to_int32(num_at(0)?).wrapping_mul(to_int32(num_at(1)?)) as f64),
        "Math.clz32" => Some(to_uint32(num_at(0)?).leading_zeros() as f64),
        "Number" => {
            if args.is_empty() {
                Some(0.0)
            } else if all_known {
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
        "Number.parseFloat" => str_at(0).map(|s| js_parse_float(&s)),
        "Number.parseInt" => {
            let s = str_at(0)?;
            let radix = num_at(1)?;
            Some(js_parse_int(&s, radix))
        }
        "Number.isInteger" | "Number.isFinite" | "Number.isNaN" | "Number.isSafeInteger" => {
            // These return booleans, but upstream's table marks them NUMBER.
            // None of them coerces: a missing or non-number argument is `false`.
            if !all_known {
                return Some(EvalValue::NumberMarker);
            }
            let b = match args.first().and_then(|e| e.known_value()) {
                Some(EvalValue::Num(n)) => match keypath {
                    "Number.isInteger" => n.is_finite() && n.fract() == 0.0,
                    "Number.isFinite" => n.is_finite(),
                    "Number.isNaN" => n.is_nan(),
                    _ => n.is_finite() && n.fract() == 0.0 && n.abs() <= 9007199254740991.0,
                },
                Some(_) | None => false,
            };
            return Some(EvalValue::Bool(b));
        }
        "String" => {
            if args.is_empty() {
                return Some(EvalValue::Str(String::new()));
            }
            return Some(match str_at(0) {
                Some(s) => EvalValue::Str(s),
                None => EvalValue::StringMarker,
            });
        }
        "String.fromCharCode" => {
            return Some(build_string(args, push_char_code).unwrap_or(EvalValue::StringMarker));
        }
        "String.fromCodePoint" => {
            return Some(build_string(args, push_code_point).unwrap_or(EvalValue::StringMarker));
        }
        _ => return None,
    };

    Some(match (keypath, result) {
        (_, Some(n)) => EvalValue::Num(n),
        ("String", None) => EvalValue::StringMarker,
        _ => EvalValue::NumberMarker,
    })
}

fn js_min(a: f64, b: f64) -> f64 {
    if a.is_nan() || b.is_nan() {
        f64::NAN
    } else {
        a.min(b)
    }
}

fn js_max(a: f64, b: f64) -> f64 {
    if a.is_nan() || b.is_nan() {
        f64::NAN
    } else {
        a.max(b)
    }
}

/// `Math.pow`. IEEE `pow` answers `1` for a base of ±1 whatever the exponent;
/// JS answers `NaN` when the exponent is `NaN`.
fn js_pow(base: f64, exponent: f64) -> f64 {
    if exponent.is_nan() {
        return f64::NAN;
    }
    base.powf(exponent)
}

/// `Math.round` — half UP, not Rust's half-away-from-zero.
fn js_round(n: f64) -> f64 {
    if !n.is_finite() || n == 0.0 {
        return n;
    }
    if n > 0.0 && n < 0.5 {
        return 0.0;
    }
    if (-0.5..0.0).contains(&n) {
        return -0.0;
    }
    (n + 0.5).floor()
}

/// `Number.parseFloat`: the longest prefix that is a decimal literal.
fn js_parse_float(s: &str) -> f64 {
    let t = s.trim_start_matches(js_whitespace);
    for name in ["Infinity", "+Infinity", "-Infinity"] {
        if t.starts_with(name) {
            return if name.starts_with('-') {
                f64::NEG_INFINITY
            } else {
                f64::INFINITY
            };
        }
    }
    let b = t.as_bytes();
    let mut i = 0;
    if i < b.len() && (b[i] == b'+' || b[i] == b'-') {
        i += 1;
    }
    let digits_start = i;
    while i < b.len() && b[i].is_ascii_digit() {
        i += 1;
    }
    if i < b.len() && b[i] == b'.' {
        i += 1;
        while i < b.len() && b[i].is_ascii_digit() {
            i += 1;
        }
    }
    if i == digits_start || (i == digits_start + 1 && b[digits_start] == b'.') {
        return f64::NAN;
    }
    if i < b.len() && (b[i] == b'e' || b[i] == b'E') {
        let mut j = i + 1;
        if j < b.len() && (b[j] == b'+' || b[j] == b'-') {
            j += 1;
        }
        let exp_start = j;
        while j < b.len() && b[j].is_ascii_digit() {
            j += 1;
        }
        if j > exp_start {
            i = j;
        }
    }
    t[..i].parse::<f64>().unwrap_or(f64::NAN)
}

/// `Number.parseInt`: the longest prefix of digits in `radix`.
fn js_parse_int(s: &str, radix: f64) -> f64 {
    let t = s.trim_start_matches(js_whitespace);
    let mut b = t.as_bytes();
    let mut sign = 1.0;
    if let Some((first, rest)) = b.split_first()
        && (*first == b'+' || *first == b'-')
    {
        if *first == b'-' {
            sign = -1.0;
        }
        b = rest;
    }
    let mut radix = to_int32(radix);
    if radix != 0 && !(2..=36).contains(&radix) {
        return f64::NAN;
    }
    let strip_hex = radix == 0 || radix == 16;
    if radix == 0 {
        radix = 10;
    }
    if strip_hex && b.len() >= 2 && b[0] == b'0' && (b[1] | 32) == b'x' {
        radix = 16;
        b = &b[2..];
    }
    let mut digits = 0;
    for &c in b {
        match (c as char).to_digit(36) {
            Some(d) if d < radix as u32 => digits += 1,
            _ => break,
        }
    }
    if digits == 0 {
        return f64::NAN;
    }
    let text = &t[t.len() - b.len()..][..digits];
    let value = if radix == 10 {
        text.parse::<f64>().unwrap_or(f64::NAN)
    } else {
        let mut exact = 0u128;
        let mut overflow = None;
        for c in text.chars() {
            let d = c.to_digit(36).unwrap_or(0) as u128;
            match overflow {
                None => match exact
                    .checked_mul(radix as u128)
                    .and_then(|v| v.checked_add(d))
                {
                    Some(v) => exact = v,
                    None => overflow = Some(exact as f64 * radix as f64 + d as f64),
                },
                Some(v) => overflow = Some(v * radix as f64 + d as f64),
            }
        }
        overflow.unwrap_or(exact as f64)
    };
    sign * value
}

fn js_whitespace(c: char) -> bool {
    matches!(
        c,
        '\u{9}'
            | '\u{a}'
            | '\u{b}'
            | '\u{c}'
            | '\u{d}'
            | '\u{20}'
            | '\u{a0}'
            | '\u{1680}'
            | '\u{2028}'
            | '\u{2029}'
            | '\u{202f}'
            | '\u{205f}'
            | '\u{3000}'
            | '\u{feff}'
    ) || ('\u{2000}'..='\u{200a}').contains(&c)
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
            return Some(EvalValue::Str(
                crate::compiler::phases::phase3_transform::client::visitors::shared::utils::cook_string_literal(
                    inner,
                ),
            ));
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
    pub constant_vars: &'c FxHashMap<String, EvalValue>,
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
    pub(crate) fn identifier_has_binding(&self, name: &str) -> bool {
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
                                || b.scope_index == a.root.root_fragment_scope_index
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
        if let Some(value) = self.constant_vars.get(name) {
            return Evaluation::single(value.clone());
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
        evaluate_binding_initial(self, binding, depth)
    }

    /// Core evaluator over estree-JSON, mirroring upstream's `Evaluation`
    /// constructor switch.
    pub(crate) fn evaluate_estree(&self, node: &Value, depth: u8) -> Evaluation {
        evaluate_estree(self, node, depth)
    }
}

/// The only two things the `scope.evaluate` recursion asks of its environment.
/// Splitting them out lets Phase 2 and both transforms share ONE port of
/// upstream's `Evaluation` walk with target-specific identifier resolvers.
pub(crate) trait EvalScope {
    /// A target may evaluate the expression after target-specific lowering.
    /// Return that lowered result here; `None` keeps the shared upstream walk.
    fn evaluate_override(&self, _node: &Value, _depth: u8) -> Option<Evaluation> {
        None
    }

    /// Upstream `scope.evaluate`'s `Identifier` case. `node` is the estree node
    /// (its `start` lets a resolver replay Phase 2's scope-correct lookup);
    /// `name` is its `name` field.
    fn evaluate_identifier(&self, node: &Value, name: &str, depth: u8) -> Evaluation;

    /// Upstream `get_global_keypath` requires `scope.get(name) === null`.
    fn identifier_has_binding(&self, name: &str) -> bool;

    /// Whether `<name> = $props.id()` appears in the source. The analyzer keeps
    /// no `initial` for that shape, so only a resolver with the source text can
    /// answer it; the client resolver has `analysis.props_id` instead.
    fn binding_initial_is_props_id(&self, _name: &str) -> bool {
        false
    }
}

impl EvalScope for EvalCtx<'_> {
    fn evaluate_identifier(&self, _node: &Value, name: &str, depth: u8) -> Evaluation {
        EvalCtx::evaluate_identifier(self, name, depth)
    }

    fn identifier_has_binding(&self, name: &str) -> bool {
        EvalCtx::identifier_has_binding(self, name)
    }

    fn binding_initial_is_props_id(&self, name: &str) -> bool {
        EvalCtx::binding_initial_is_props_id(self, name)
    }
}

/// Port of upstream `Evaluation`'s expression walk (`phases/scope.js`).
pub(crate) fn evaluate_estree<S: EvalScope + ?Sized>(
    scope: &S,
    node: &Value,
    depth: u8,
) -> Evaluation {
    if depth > MAX_DEPTH {
        return Evaluation::unknown();
    }
    if let Some(evaluation) = scope.evaluate_override(node, depth) {
        return evaluation;
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
            // A regex stringifies to its source, but its value is still an object.
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
            scope.evaluate_identifier(node, name, depth)
        }

        "BinaryExpression" => {
            let (Some(left), Some(right), Some(op)) = (
                node.get("left"),
                node.get("right"),
                node.get("operator").and_then(|o| o.as_str()),
            ) else {
                return Evaluation::unknown();
            };
            let a = evaluate_estree(scope, left, depth + 1);
            let b = evaluate_estree(scope, right, depth + 1);
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
            let t = evaluate_estree(scope, test, depth + 1);
            let c = evaluate_estree(scope, consequent, depth + 1);
            let a = evaluate_estree(scope, alternate, depth + 1);
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
            let a = evaluate_estree(scope, left, depth + 1);
            let b = evaluate_estree(scope, right, depth + 1);
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
            let a = evaluate_estree(scope, arg, depth + 1);
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
                && !scope.identifier_has_binding(&base)
            {
                if is_rune(&keypath) {
                    match keypath.as_str() {
                        "$state" | "$state.raw" | "$derived" => {
                            if let Some(arg) = args.first() {
                                return evaluate_estree(scope, arg, depth + 1);
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
                                return evaluate_estree(scope, body, depth + 1);
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
                        .map(|a| evaluate_estree(scope, a, depth + 1))
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
                let ev = evaluate_estree(scope, e, depth + 1);
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
                && !scope.identifier_has_binding(&base)
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
                return evaluate_estree(scope, inner, depth + 1);
            }
            Evaluation::unknown()
        }

        _ => Evaluation::unknown(),
    }
}

/// Port of upstream `scope.evaluate`'s recursion into `binding.initial`
/// (`phases/scope.js`, the `Identifier` case).
pub(crate) fn evaluate_binding_initial<S: EvalScope + ?Sized>(
    scope: &S,
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
                return evaluate_estree(scope, init_json, depth + 1);
            }
            return Evaluation::single(EvalValue::StringMarker);
        }
        // The analyzer does not capture non-literal initials in
        // `binding.initial`, but upstream's `scope.evaluate` still knows
        // `const uid = $props.id()` is a (defined) string — `$props.id`
        // returns STRING (scope.js `case '$props.id'`). Recognize the
        // `<name> = $props.id()` initializer from the source text.
        if matches!(binding.kind, Normal) && scope.binding_initial_is_props_id(&binding.name) {
            return Evaluation::single(EvalValue::StringMarker);
        }
        // A non-literal initializer is kept as AST JSON instead; upstream's
        // `scope.evaluate` recurses into the init node whatever its shape.
        if !matches!(binding.kind, Derived)
            && depth < MAX_DEPTH
            && let Some(init_json) = binding.init_expr_json_parsed()
        {
            return evaluate_estree(scope, init_json, depth + 1);
        }
        return Evaluation::unknown();
    };

    let trimmed = initial.trim_start();
    if trimmed.starts_with('{') {
        // estree-JSON dump (from `$derived(...)` / `{@const ...}` initials)
        if let Ok(json) = serde_json::from_str::<Value>(initial) {
            return evaluate_estree(scope, &json, depth + 1);
        }
        return Evaluation::unknown();
    }

    match parse_literal_text(initial) {
        Some(v) => Evaluation::single(v),
        None => Evaluation::unknown(),
    }
}

#[cfg(test)]
mod literal_initial_tests {
    use super::{EvalValue, parse_literal_text};

    #[test]
    fn cooks_binding_string_escapes_like_estree_literals() {
        let cases = [
            ("\"a\\\nb\"", "ab"),
            ("\"a\\\r\nb\"", "ab"),
            ("\"\\x61\\u0062\\u{63}\"", "abc"),
            ("\"\\b\\f\\v\"", "\u{8}\u{c}\u{b}"),
        ];

        for (source, expected) in cases {
            match parse_literal_text(source) {
                Some(EvalValue::Str(actual)) => assert_eq!(actual, expected),
                actual => panic!("expected a cooked string for {source:?}, got {actual:?}"),
            }
        }
    }
}

#[cfg(test)]
mod f16_control {
    use super::f16_round;

    /// Every row is Node's own `Math.f16round` for that input: 445 cases —
    /// signed zeroes, both infinities, NaN, the 65520 overflow midpoint, the
    /// normal/subnormal boundary, the 2^-24 subnormal grid, an f64 subnormal
    /// input, and 400 pseudorandom doubles spanning 2^-30..2^30.
    const CASES: &[(f64, f64)] = &[
        (0.0, 0.0),
        (-0.0, -0.0),
        (1.0, 1.0),
        (-1.0, -1.0),
        (0.5, 0.5),
        (-0.5, -0.5),
        (65504.0, 65504.0),
        (-65504.0, -65504.0),
        (65519.0, 65504.0),
        (65519.999999, 65504.0),
        (65520.0, f64::INFINITY),
        (-65520.0, f64::NEG_INFINITY),
        (65535.0, f64::INFINITY),
        (65536.0, f64::INFINITY),
        (1e+300, f64::INFINITY),
        (-1e+300, f64::NEG_INFINITY),
        (f64::INFINITY, f64::INFINITY),
        (f64::NEG_INFINITY, f64::NEG_INFINITY),
        (f64::NAN, f64::NAN),
        (0.00006103515625, 0.00006103515625),
        (0.000060975551, 0.00006097555160522461),
        (5.960464477539063e-8, 5.960464477539063e-8),
        (2.9802322387695312e-8, 0.0),
        (2.980232238769532e-8, 5.960464477539063e-8),
        (1e-320, 0.0),
        (-1e-320, -0.0),
        (1e-45, 0.0),
        (2048.5, 2048.0),
        (2049.0, 2048.0),
        (2050.0, 2050.0),
        (2051.0, 2052.0),
        (1.0009765625, 1.0009765625),
        (1.00048828125, 1.0),
        (1.000732421875, 1.0009765625),
        (0.30000001192092896, 0.300048828125),
        (std::f64::consts::PI, 3.140625),
        (1024.5, 1024.0),
        (1025.5, 1026.0),
        (-1024.5, -1024.0),
        (0.099999994, 0.0999755859375),
        (1e-8, 0.0),
        (0.3333333333333333, 0.333251953125),
        (2.9802322387695312e-8, 0.0),
        (5.960464477539063e-8, 5.960464477539063e-8),
        (1.4901161193847656e-8, 0.0),
        (-199.8701171875, -199.875),
        (126.945556640625, 126.9375),
        (354.556640625, 354.5),
        (7.308427143470908e-7, 7.152557373046875e-7),
        (2683.1630859375, 2684.0),
        (-5316.87890625, -5316.0),
        (-80685.28125, f64::NEG_INFINITY),
        (-8.519615173339844, -8.5234375),
        (0.0000021940118131169584, 0.000002205371856689453),
        (2885576.0, f64::INFINITY),
        (-3.5300864453802205e-9, -0.0),
        (-2195.236328125, -2196.0),
        (-0.00001608209277037531, -0.00001609325408935547),
        (24881592.0, f64::INFINITY),
        (-0.00445903092622757, -0.004459381103515625),
        (-343171.125, f64::NEG_INFINITY),
        (-1.736922854433942e-7, -1.7881393432617188e-7),
        (0.00003513554111123085, 0.00003510713577270508),
        (-17429760.0, f64::NEG_INFINITY),
        (-18002.65625, -18000.0),
        (0.046679601073265076, 0.04669189453125),
        (-201464.125, f64::NEG_INFINITY),
        (2.7725744247436523, 2.7734375),
        (-3186.1416015625, -3186.0),
        (-26.103988647460938, -26.109375),
        (-411.27490234375, -411.25),
        (-1007.03662109375, -1007.0),
        (-0.0007782308384776115, -0.0007781982421875),
        (0.027756251394748688, 0.0277557373046875),
        (-0.029825352132320404, -0.0298309326171875),
        (-0.000022405780327972025, -0.000022411346435546875),
        (-1012.75, -1013.0),
        (-0.0000535713043063879, -0.00005358457565307617),
        (-0.01762455701828003, -0.0176239013671875),
        (-10813.8125, -10816.0),
        (2.784419059753418, 2.78515625),
        (25.521774291992188, 25.515625),
        (2.014438477138114e-10, 0.0),
        (0.0013581961393356323, 0.0013580322265625),
        (-213.1519775390625, -213.125),
        (0.45422303676605225, 0.4541015625),
        (1.463515673094662e-7, 1.1920928955078125e-7),
        (3676072.0, f64::INFINITY),
        (2.604339452427773e-10, 0.0),
        (-51.7059326171875, -51.71875),
        (97292.125, f64::INFINITY),
        (0.0000357337121386081, 0.000035762786865234375),
        (-7696128.0, f64::NEG_INFINITY),
        (2.630487188071129e-7, 2.384185791015625e-7),
        (742.156494140625, 742.0),
        (6.177280426025391, 6.17578125),
        (2.5880249054921478e-8, 0.0),
        (-1.5304349787470528e-8, -0.0),
        (0.07608740031719208, 0.07611083984375),
        (0.00017619505524635315, 0.0001761913299560547),
        (0.000009297277756559197, 0.000009298324584960938),
        (-0.002180580049753189, -0.0021800994873046875),
        (-3.306174847783616e-10, -0.0),
        (2672.6787109375, 2672.0),
        (130365.46875, f64::INFINITY),
        (23.030914306640625, 23.03125),
        (-0.00024136039428412914, -0.00024139881134033203),
        (0.0000017368874978274107, 0.0000017285346984863281),
        (95.054443359375, 95.0625),
        (-24.3447265625, -24.34375),
        (428.29638671875, 428.25),
        (-756.9697265625, -757.0),
        (-9.18448257446289, -9.1875),
        (-117.83349609375, -117.8125),
        (0.0001807317603379488, 0.00018072128295898438),
        (-0.0004828525707125664, -0.00048279762268066406),
        (-0.000005150002834852785, -0.000005125999450683594),
        (1.0291223873082345e-8, 0.0),
        (107693632.0, f64::INFINITY),
        (1.3044285774230957, 1.3046875),
        (-94465.4375, f64::NEG_INFINITY),
        (-0.010662972927093506, -0.0106658935546875),
        (1.8463067874563421e-7, 1.7881393432617188e-7),
        (-0.0009610354900360107, -0.0009608268737792969),
        (-14.0692138671875, -14.0703125),
        (-2.2002209831839536e-8, -0.0),
        (-8.97617340456236e-8, -1.1920928955078125e-7),
        (27576.234375, 27584.0),
        (-1192.3056640625, -1192.0),
        (-4.42263171862578e-7, -4.172325134277344e-7),
        (-12514384.0, f64::NEG_INFINITY),
        (2.301026036377607e-8, 0.0),
        (0.0018882849253714085, 0.001888275146484375),
        (-0.000003821769041678635, -0.000003814697265625),
        (15.168880462646484, 15.171875),
        (0.000014169287169352174, 0.000014185905456542969),
        (0.0001557443756610155, 0.0001556873321533203),
        (0.0000059498706832528114, 0.0000059604644775390625),
        (419.6640625, 419.75),
        (751.759765625, 752.0),
        (-0.00004439492477104068, -0.000044405460357666016),
        (-61531.265625, -61536.0),
        (-1.495138235441118e-9, -0.0),
        (-0.0336461067199707, -0.033660888671875),
        (520.5078125, 520.5),
        (-4.93829345703125, -4.9375),
        (-0.008303403854370117, -0.00830078125),
        (-11.9757080078125, -11.9765625),
        (28931200.0, f64::INFINITY),
        (-12.571533203125, -12.5703125),
        (-3857504.0, f64::NEG_INFINITY),
        (-7.196516715879397e-10, -0.0),
        (0.006834058091044426, 0.0068359375),
        (-251186688.0, f64::NEG_INFINITY),
        (-0.0038087256252765656, -0.0038089752197265625),
        (7.592669248879247e-7, 7.748603820800781e-7),
        (0.00011089962208643556, 0.00011092424392700195),
        (8042.81640625, 8044.0),
        (-8639.4375, -8640.0),
        (809.50048828125, 809.5),
        (0.00013830431271344423, 0.00013828277587890625),
        (8.063247680664062, 8.0625),
        (-6.632411956787109, -6.6328125),
        (8227188.0, f64::INFINITY),
        (5.81936818178086e-10, 0.0),
        (0.00007870388799346983, 0.00007867813110351562),
        (7392.806640625, 7392.0),
        (1.548830509185791, 1.548828125),
        (-0.0000028739038953062845, -0.00000286102294921875),
        (0.000006236039098439505, 0.000006258487701416016),
        (-60464.875, -60480.0),
        (0.00034985365346074104, 0.0003497600555419922),
        (25849.5625, 25856.0),
        (-2467.08984375, -2468.0),
        (338895.875, f64::INFINITY),
        (-17990.5703125, -17984.0),
        (-3.9565810538988444e-7, -4.172325134277344e-7),
        (-0.00000473410909762606, -0.000004708766937255859),
        (-0.0026935338973999023, -0.00269317626953125),
        (-2.5967596961606887e-9, -0.0),
        (103.83084106445312, 103.8125),
        (-0.0000017474952755947015, -0.0000017285346984863281),
        (0.000017157512047560886, 0.0000171661376953125),
        (0.13672399520874023, 0.13671875),
        (-12.313796997070312, -12.3125),
        (-32947.5625, -32960.0),
        (63.25384521484375, 63.25),
        (-0.0003737072693184018, -0.00037360191345214844),
        (3.3496856689453125, 3.349609375),
        (-10081.09375, -10080.0),
        (3.6606968567554077e-9, 0.0),
        (78504.1875, f64::INFINITY),
        (-0.000009253540156350937, -0.000009238719940185547),
        (878.2412109375, 878.0),
        (-0.0008527189493179321, -0.0008525848388671875),
        (93583104.0, f64::INFINITY),
        (0.09298491477966309, 0.09295654296875),
        (0.015119552612304688, 0.0151214599609375),
        (1782.46484375, 1782.0),
        (-0.000058353994973003864, -0.00005835294723510742),
        (-2.5234248024474937e-9, -0.0),
        (-22775.0, -22768.0),
        (-0.0004840490873903036, -0.0004839897155761719),
        (5.730763241729164e-8, 5.960464477539063e-8),
        (45320.0, 45312.0),
        (157173760.0, f64::INFINITY),
        (5457.375, 5456.0),
        (79517696.0, f64::INFINITY),
        (-750.4375, -750.5),
        (-37814.15625, -37824.0),
        (-8.260986328125, -8.2578125),
        (-1199956.0, f64::NEG_INFINITY),
        (6.38495145643958e-10, 0.0),
        (-8.264685646963699e-8, -5.960464477539063e-8),
        (-103596032.0, f64::NEG_INFINITY),
        (-0.05566740036010742, -0.0556640625),
        (-4103464.0, f64::NEG_INFINITY),
        (123.28085327148438, 123.25),
        (72573.75, f64::INFINITY),
        (-0.0021841302514076233, -0.0021839141845703125),
        (-7255.462890625, -7256.0),
        (1.2795482312588646e-9, 0.0),
        (0.011294472962617874, 0.01129150390625),
        (-242.5775146484375, -242.625),
        (-3.95748742221258e-7, -4.172325134277344e-7),
        (4.3853302001953125, 4.38671875),
        (-430.875732421875, -431.0),
        (-0.000029154980438761413, -0.000029146671295166016),
        (-1.898219714746574e-8, -0.0),
        (-2.580948788022397e-8, -0.0),
        (-828823.0, f64::NEG_INFINITY),
        (0.41615283489227295, 0.416259765625),
        (3.0498612524354485e-9, 0.0),
        (-181.33251953125, -181.375),
        (-6.783697562018354e-10, -0.0),
        (7.524896545874071e-7, 7.748603820800781e-7),
        (161356.625, f64::INFINITY),
        (-1.410833192494465e-7, -1.1920928955078125e-7),
        (0.000004180220003036084, 0.000004172325134277344),
        (-8.581423488474016e-10, -0.0),
        (-0.00005738326581194997, -0.00005739927291870117),
        (-0.004563488066196442, -0.0045623779296875),
        (-1.3564647183272882e-8, -0.0),
        (-7016672.0, f64::NEG_INFINITY),
        (1.7483267784118652, 1.748046875),
        (-163017.8125, f64::NEG_INFINITY),
        (-4.084614424471056e-9, -0.0),
        (18993584.0, f64::INFINITY),
        (0.0018025366589426994, 0.0018024444580078125),
        (-0.00019952899310737848, -0.0001995563507080078),
        (0.0005785231478512287, 0.0005784034729003906),
        (-0.04846084117889404, -0.0484619140625),
        (0.0734606385231018, 0.073486328125),
        (-3.74661922454834, -3.74609375),
        (6.062614440917969, 6.0625),
        (24266.46875, 24272.0),
        (-0.00008174963295459747, -0.00008177757263183594),
        (2.059438486412546e-8, 0.0),
        (-0.00001395895378664136, -0.000013947486877441406),
        (-8290.8125, -8288.0),
        (0.010034721344709396, 0.01003265380859375),
        (-3553184.0, f64::NEG_INFINITY),
        (-0.0010852310806512833, -0.0010852813720703125),
        (61238.375, 61248.0),
        (31090776.0, f64::INFINITY),
        (-100826016.0, f64::NEG_INFINITY),
        (13.594894409179688, 13.59375),
        (-0.000007881608325988054, -0.000007867813110351562),
        (1.6272259983907134e-7, 1.7881393432617188e-7),
        (-0.00005272116686683148, -0.0000527501106262207),
        (1.5707385614405212e-7, 1.7881393432617188e-7),
        (-9.401759939464682e-7, -9.5367431640625e-7),
        (-13204.5625, -13208.0),
        (-4793808.0, f64::NEG_INFINITY),
        (-32578976.0, f64::NEG_INFINITY),
        (-0.0000010759481483546551, -0.0000010728836059570312),
        (-8.078038717940217e-7, -8.344650268554688e-7),
        (-390.529296875, -390.5),
        (5459.47265625, 5460.0),
        (1751.40673828125, 1751.0),
        (-11975.4296875, -11976.0),
        (-13127.43359375, -13128.0),
        (-15.395111083984375, -15.3984375),
        (-0.05858057737350464, -0.05859375),
        (3103200.0, f64::INFINITY),
        (83148.21875, f64::INFINITY),
        (0.06032559275627136, 0.060333251953125),
        (-14.69803237915039, -14.6953125),
        (-45933408.0, f64::NEG_INFINITY),
        (-2.296426451775524e-10, -0.0),
        (-0.006107203662395477, -0.006107330322265625),
        (-0.00024315807968378067, -0.00024318695068359375),
        (9.26107406616211, 9.2578125),
        (-3.956711769104004, -3.95703125),
        (-1010356.25, f64::NEG_INFINITY),
        (-30.35144805908203, -30.34375),
        (-0.0006315787322819233, -0.0006318092346191406),
        (-1.0839673159068752e-8, -0.0),
        (0.00046546250814571977, 0.00046539306640625),
        (24.670059204101562, 24.671875),
        (0.02355767786502838, 0.0235595703125),
        (8.324101408163642e-9, 0.0),
        (-0.007528766989707947, -0.00753021240234375),
        (0.00014329567784443498, 0.00014328956604003906),
        (-6265148.0, f64::NEG_INFINITY),
        (-40.28038024902344, -40.28125),
        (-1.7374267578125, -1.7373046875),
        (-7.583198547363281, -7.58203125),
        (-0.00018278462812304497, -0.00018274784088134766),
        (-572991.0, f64::NEG_INFINITY),
        (1.2764201073878212e-7, 1.1920928955078125e-7),
        (175016.125, f64::INFINITY),
        (86.81207275390625, 86.8125),
        (1.4870433062696975e-7, 1.1920928955078125e-7),
        (1.962441231739831e-8, 0.0),
        (-96217.25, f64::NEG_INFINITY),
        (-2.698413848876953, -2.69921875),
        (1874518.0, f64::INFINITY),
        (0.000005510292339749867, 0.0000054836273193359375),
        (0.00009836332174018025, 0.00009834766387939453),
        (362.165283203125, 362.25),
        (-15708.0234375, -15712.0),
        (8353444.0, f64::INFINITY),
        (-13381.484375, -13384.0),
        (-3.266411283675552e-7, -2.980232238769531e-7),
        (-5.751099934059312e-7, -5.960464477539062e-7),
        (-2446734.0, f64::NEG_INFINITY),
        (-2243.2490234375, -2244.0),
        (0.000015786441508680582, 0.000015795230865478516),
        (-5.271697998046875, -5.2734375),
        (-0.010932385921478271, -0.01093292236328125),
        (-0.000029648130293935537, -0.00002962350845336914),
        (29977152.0, f64::INFINITY),
        (-0.00037271110340952873, -0.0003726482391357422),
        (671.671630859375, 671.5),
        (0.21444594860076904, 0.2144775390625),
        (-3.573214571450656e-10, -0.0),
        (0.4903467893600464, 0.490234375),
        (5314472.0, f64::INFINITY),
        (3.2168924235520535e-7, 2.980232238769531e-7),
        (-0.009486019611358643, -0.00948333740234375),
        (500389376.0, f64::INFINITY),
        (-32749216.0, f64::NEG_INFINITY),
        (-101049728.0, f64::NEG_INFINITY),
        (291.7244873046875, 291.75),
        (2603470.0, f64::INFINITY),
        (-0.0008157049305737019, -0.0008158683776855469),
        (36295392.0, f64::INFINITY),
        (1841.6396484375, 1842.0),
        (-0.0000011820163763331948, -0.0000011920928955078125),
        (3727.435546875, 3728.0),
        (-27.34722900390625, -27.34375),
        (0.02460835874080658, 0.0246124267578125),
        (3936604.0, f64::INFINITY),
        (-1.3457040786743164, -1.345703125),
        (73456256.0, f64::INFINITY),
        (-0.00122755765914917, -0.0012273788452148438),
        (8.327027956056554e-8, 5.960464477539063e-8),
        (13979620.0, f64::INFINITY),
        (0.00001713587698759511, 0.00001710653305053711),
        (-14299.21484375, -14296.0),
        (0.000009807466994971037, 0.000009834766387939453),
        (-10.01885986328125, -10.015625),
        (1.4873382525593115e-9, 0.0),
        (-0.01697094738483429, -0.0169677734375),
        (2.2986500880506355e-7, 2.384185791015625e-7),
        (-29876016.0, f64::NEG_INFINITY),
        (1427.36181640625, 1427.0),
        (1.6758537668692952e-8, 0.0),
        (35657536.0, f64::INFINITY),
        (-23467.1875, -23472.0),
        (-0.0002184538170695305, -0.00021851062774658203),
        (-0.00029770098626613617, -0.00029778480529785156),
        (-807651.0, f64::NEG_INFINITY),
        (-17785224.0, f64::NEG_INFINITY),
        (4054084.0, f64::INFINITY),
        (2.1768970489501953, 2.177734375),
        (3.732545852661133, 3.732421875),
        (-2151452.0, f64::NEG_INFINITY),
        (-0.000012687515663856175, -0.000012695789337158203),
        (-1.0877983847024097e-8, -0.0),
        (-53692.71875, -53696.0),
        (-2167.154296875, -2168.0),
        (-228.4930419921875, -228.5),
        (3078.00390625, 3078.0),
        (-37990256.0, f64::NEG_INFINITY),
        (-9.954345703125, -9.953125),
        (-0.000007227331934700487, -0.000007212162017822266),
        (116779904.0, f64::INFINITY),
        (-22856.0625, -22864.0),
        (11451192.0, f64::INFINITY),
        (1921822.0, f64::INFINITY),
        (1.5576086044311523, 1.5576171875),
        (535.07763671875, 535.0),
        (-8198628.0, f64::NEG_INFINITY),
        (-4.805976363403408e-11, -0.0),
        (-0.4602919816970825, -0.460205078125),
        (-2.1613216400146484, -2.162109375),
        (3.5532217168565694e-8, 5.960464477539063e-8),
        (0.000042125931940972805, 0.00004214048385620117),
        (3.006679349937258e-9, 0.0),
        (-0.005255298689007759, -0.00525665283203125),
        (0.0033227987587451935, 0.003322601318359375),
        (-1.0299911062938705e-9, -0.0),
        (-0.12137877941131592, -0.12139892578125),
        (0.3651890754699707, 0.365234375),
        (-2.5950450897216797, -2.595703125),
        (0.000005571615474764258, 0.000005543231964111328),
        (-0.8620223999023438, -0.86181640625),
        (-0.00011086015729233623, -0.00011086463928222656),
        (0.00002209996455349028, 0.000022113323211669922),
        (-5610310.0, f64::NEG_INFINITY),
        (27.942138671875, 27.9375),
        (0.51904296875, 0.51904296875),
        (2.512482666361393e-9, 0.0),
        (3.102115231357061e-9, 0.0),
        (-6.626158288725037e-9, -0.0),
        (5.652518897392156e-9, 0.0),
        (-3.341442192383859e-10, -0.0),
        (-900.8623046875, -901.0),
        (17.82726287841797, 17.828125),
        (3.643961576926813e-7, 3.5762786865234375e-7),
        (-6529668.0, f64::NEG_INFINITY),
        (0.04590088129043579, 0.0458984375),
        (3.255356956222144e-10, 0.0),
        (0.6827394962310791, 0.6826171875),
        (-5975.482421875, -5976.0),
        (-1.1680358902310672e-9, -0.0),
        (-672216.0, f64::NEG_INFINITY),
        (7.126811981201172, 7.125),
        (315.340576171875, 315.25),
        (12622.79296875, 12624.0),
        (-1.870619297027588, -1.87109375),
        (-3.027750015258789, -3.02734375),
        (-7.363777435043239e-10, -0.0),
        (-0.14479106664657593, -0.144775390625),
        (-8180.8203125, -8180.0),
        (-8.094603910768772e-10, -0.0),
        (4.36645031243188e-9, 0.0),
        (0.014816418290138245, 0.0148162841796875),
        (-11263.0, -11264.0),
        (-514.90966796875, -515.0),
        (7.0289241094201316e-9, 0.0),
        (-3.7882608694417286e-7, -3.5762786865234375e-7),
        (3.551520322275792e-8, 5.960464477539063e-8),
    ];

    #[test]
    fn matches_node_math_f16round() {
        let mut diverged = Vec::new();
        for (input, expected) in CASES {
            let got = f16_round(*input);
            let ok = if expected.is_nan() {
                got.is_nan()
            } else {
                got.to_bits() == expected.to_bits()
            };
            if !ok {
                diverged.push(format!("f16round({input:e}) = {got:e}, want {expected:e}"));
            }
        }
        assert!(
            diverged.is_empty(),
            "{} of {} cases diverge from Math.f16round:\n{}",
            diverged.len(),
            CASES.len(),
            diverged.join("\n")
        );
    }
}
