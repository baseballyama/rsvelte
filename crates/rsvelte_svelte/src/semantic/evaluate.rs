//! Upstream `scope.evaluate` (phases/scope.js `Evaluation`).
//!
//! The set of values an expression can
//! have at runtime, as far as the compiler can tell. It decides whether output inlines a value,
//! adds `?? ''`, or wraps in `$.stringify`, so it is ported case by case.

use rsvelte_javascript::codegen::number;
use rsvelte_javascript::operators::{BinaryOperator, LogicalOperator, UnaryOperator};
use rsvelte_javascript::scope::{DeclarationKind, ScopeIdentifier};
use rsvelte_javascript::{Kind, NodeIdentifier, SyntaxTree};

use crate::semantic::resolve::{BindingKind, Resolution, rune_call};

#[derive(Clone, Debug)]
pub enum Value {
    String(String),
    Number(f64),
    Boolean(bool),
    Null,
    Undefined,
    /// Some string.
    AnyString,
    /// Some number.
    AnyNumber,
    AnyFunction,
    Unknown,
}

impl PartialEq for Value {
    /// `Set` membership in JS: `SameValueZero`.
    fn eq(&self, other: &Self) -> bool {
        use Value::{
            AnyFunction, AnyNumber, AnyString, Boolean, Null, Number, String, Undefined, Unknown,
        };
        match (self, other) {
            (String(a), String(b)) => a == b,
            (Number(a), Number(b)) => a == b || (a.is_nan() && b.is_nan()),
            (Boolean(a), Boolean(b)) => a == b,
            (Null, Null)
            | (Undefined, Undefined)
            | (AnyString, AnyString)
            | (AnyNumber, AnyNumber)
            | (AnyFunction, AnyFunction)
            | (Unknown, Unknown) => true,
            _ => false,
        }
    }
}

impl Value {
    const fn is_symbol(&self) -> bool {
        matches!(
            self,
            Self::AnyString | Self::AnyNumber | Self::AnyFunction | Self::Unknown
        )
    }

    /// `String(value)` for a known value.
    #[must_use]
    pub fn to_javascript_string(&self) -> String {
        match self {
            Self::String(s) => s.clone(),
            Self::Number(n) => number(*n),
            Self::Boolean(b) => b.to_string(),
            Self::Null => "null".into(),
            Self::Undefined => "undefined".into(),
            _ => unreachable!("only known values are rendered"),
        }
    }

    fn to_number(&self) -> f64 {
        match self {
            Self::Number(n) => *n,
            Self::Boolean(b) => f64::from(u8::from(*b)),
            Self::Null => 0.0,
            Self::Undefined => f64::NAN,
            Self::String(s) => string_to_number(s),
            _ => unreachable!("only known values are converted"),
        }
    }

    fn truthy(&self) -> bool {
        match self {
            Self::String(s) => !s.is_empty(),
            Self::Number(n) => *n != 0.0 && !n.is_nan(),
            Self::Boolean(b) => *b,
            Self::Null | Self::Undefined => false,
            _ => unreachable!("only known values are tested"),
        }
    }
}

#[expect(
    clippy::cast_precision_loss,
    reason = "a JavaScript number is an f64 and rounds the same way"
)]
fn string_to_number(s: &str) -> f64 {
    let t = s.trim_matches(|c: char| c.is_whitespace() || c == '\u{feff}');
    if t.is_empty() {
        return 0.0;
    }
    let radix = |p: &str, r| u64::from_str_radix(p, r).map_or(f64::NAN, |v| v as f64);
    match t.get(..2) {
        Some("0x" | "0X") => radix(&t[2..], 16),
        Some("0o" | "0O") => radix(&t[2..], 8),
        Some("0b" | "0B") => radix(&t[2..], 2),
        _ => match t {
            "Infinity" | "+Infinity" => f64::INFINITY,
            "-Infinity" => f64::NEG_INFINITY,
            _ if t.contains(|c: char| c.is_ascii_alphabetic() && c != 'e' && c != 'E') => f64::NAN,
            _ => t.parse().unwrap_or(f64::NAN),
        },
    }
}

/// `Number.MAX_SAFE_INTEGER`.
const MAX_SAFE_INTEGER: f64 = 9_007_199_254_740_991.0;

const fn to_int32(n: f64) -> i32 {
    if !n.is_finite() {
        return 0;
    }
    (((n.trunc() as i64).cast_unsigned() & 0xFFFF_FFFF) as u32).cast_signed()
}

#[derive(Debug)]
#[expect(
    clippy::struct_excessive_bools,
    reason = "mirrors the flags of upstream's `Evaluation`"
)]
pub struct Evaluation {
    pub values: Vec<Value>,
    pub is_known: bool,
    pub has_unknown: bool,
    pub is_defined: bool,
    pub is_string: bool,
    pub is_number: bool,
    pub is_function: bool,
    pub value: Value,
}

impl Evaluation {
    fn from_values(values: Vec<Value>) -> Self {
        let mut e = Self {
            is_known: true,
            has_unknown: false,
            is_defined: true,
            is_string: true,
            is_number: true,
            is_function: true,
            value: Value::Undefined,
            values: Vec::new(),
        };
        for v in &values {
            e.value = v.clone();
            if !matches!(v, Value::AnyString | Value::String(_)) {
                e.is_string = false;
            }
            if !matches!(v, Value::AnyNumber | Value::Number(_)) {
                e.is_number = false;
            }
            if !matches!(v, Value::AnyFunction) {
                e.is_function = false;
            }
            if matches!(v, Value::Null | Value::Undefined | Value::Unknown) {
                e.is_defined = false;
            }
            if matches!(v, Value::Unknown) {
                e.has_unknown = true;
            }
        }
        if values.len() > 1 || e.value.is_symbol() {
            e.is_known = false;
        }
        e.values = values;
        e
    }
}

fn add(values: &mut Vec<Value>, v: Value) {
    if !values.contains(&v) {
        values.push(v);
    }
}

/// Which tree an expression lives in.
///
/// Output trees carry no scope analysis, so their identifiers
/// resolve by name against the scope the expression was lowered in, as upstream's
/// `state.scope.evaluate(value)` does on the transformed expression.
#[derive(Clone, Copy, Debug)]
pub enum Tree<'a> {
    Source,
    Output(&'a SyntaxTree, ScopeIdentifier),
}

#[derive(Debug)]
pub struct Evaluator<'a> {
    source: &'a SyntaxTree,
    source_text: &'a str,
    res: &'a Resolution,
    in_progress: Vec<(bool, NodeIdentifier)>,
}

impl<'a> Evaluator<'a> {
    #[must_use]
    pub const fn new(source: &'a SyntaxTree, source_text: &'a str, res: &'a Resolution) -> Self {
        Evaluator {
            source,
            source_text,
            res,
            in_progress: Vec::new(),
        }
    }

    pub fn evaluate(&mut self, tree: Tree<'a>, e: NodeIdentifier) -> Evaluation {
        let mut values = Vec::new();
        self.eval_into(tree, e, &mut values);
        Evaluation::from_values(values)
    }

    const fn syntax_tree(&self, tree: Tree<'a>) -> &'a SyntaxTree {
        match tree {
            Tree::Source => self.source,
            Tree::Output(a, _) => a,
        }
    }

    fn eval_into(&mut self, tree: Tree<'a>, e: NodeIdentifier, values: &mut Vec<Value>) {
        // Upstream returns the evaluation already in progress for a cycle; it has no values yet at
        // that point, which only a self-referencing initialiser can reach.
        let key = (matches!(tree, Tree::Output(..)), e);
        if self.in_progress.contains(&key) {
            add(values, Value::Unknown);
            return;
        }
        self.in_progress.push(key);
        self.eval_node(tree, e, values);
        self.in_progress.pop();
    }

    #[expect(
        clippy::too_many_lines,
        reason = "one arm per expression kind, as upstream's `evaluate` switch"
    )]
    fn eval_node(&mut self, tree: Tree<'a>, e: NodeIdentifier, values: &mut Vec<Value>) {
        let syntax_tree = self.syntax_tree(tree);
        match syntax_tree.kind(e) {
            Kind::String => add(
                values,
                Value::String(syntax_tree.str_value(e, self.source_text).to_owned()),
            ),
            Kind::Number(n) => add(values, Value::Number(n)),
            Kind::Boolean(b) => add(values, Value::Boolean(b)),
            Kind::Null => add(values, Value::Null),
            Kind::Identifier(_) => self.identifier(tree, e, values),
            Kind::Binary(op, l, r) => {
                use BinaryOperator::{
                    Add, BitAnd, BitOr, BitXor, Div, Eq, Exp, Gt, GtEq, In, InstanceOf, Lt, LtEq,
                    Mul, NotEq, Remainder, Shl, Shr, StrictEq, StrictNotEq, Sub, UShr,
                };
                let left = self.evaluate(tree, l);
                let right = self.evaluate(tree, r);
                if left.is_known && right.is_known {
                    match binary(op, &left.value, &right.value) {
                        Some(v) => add(values, v),
                        None => add(values, Value::Unknown),
                    }
                    return;
                }
                match op {
                    NotEq | StrictNotEq | Lt | LtEq | Gt | GtEq | Eq | StrictEq | In
                    | InstanceOf => {
                        add(values, Value::Boolean(true));
                        add(values, Value::Boolean(false));
                    }
                    Remainder | BitAnd | Mul | Exp | Sub | Div | Shl | Shr | UShr | BitXor
                    | BitOr => {
                        add(values, Value::AnyNumber);
                    }
                    Add => {
                        if left.is_string || right.is_string {
                            add(values, Value::AnyString);
                        } else if left.is_number && right.is_number {
                            add(values, Value::AnyNumber);
                        } else {
                            add(values, Value::AnyString);
                            add(values, Value::AnyNumber);
                        }
                    }
                }
            }
            Kind::Conditional {
                test,
                consequent,
                alternate,
            } => {
                let test_v = self.evaluate(tree, test);
                let consequent_v = self.evaluate(tree, consequent);
                let alternate_v = self.evaluate(tree, alternate);
                if test_v.is_known {
                    for v in if test_v.value.truthy() {
                        consequent_v.values
                    } else {
                        alternate_v.values
                    } {
                        add(values, v);
                    }
                } else {
                    for v in consequent_v.values.into_iter().chain(alternate_v.values) {
                        add(values, v);
                    }
                }
            }
            Kind::Logical(op, l, r) => {
                let left = self.evaluate(tree, l);
                let right = self.evaluate(tree, r);
                if left.is_known {
                    if right.is_known {
                        add(values, logical(op, &left.value, &right.value));
                        return;
                    }
                    let short = match op {
                        LogicalOperator::And => !left.value.truthy(),
                        LogicalOperator::Or => left.value.truthy(),
                        LogicalOperator::Nullish => {
                            !matches!(left.value, Value::Null | Value::Undefined)
                        }
                    };
                    if short {
                        add(values, left.value);
                    } else {
                        for v in right.values {
                            add(values, v);
                        }
                    }
                    return;
                }
                for v in left.values.into_iter().chain(right.values) {
                    add(values, v);
                }
            }
            Kind::Unary(op, arg) => {
                let a = self.evaluate(tree, arg);
                if a.is_known {
                    add(values, unary(op, &a.value));
                    return;
                }
                match op {
                    UnaryOperator::Not | UnaryOperator::Delete => {
                        add(values, Value::Boolean(false));
                        add(values, Value::Boolean(true));
                    }
                    UnaryOperator::Plus | UnaryOperator::Neg | UnaryOperator::BitNot => {
                        add(values, Value::AnyNumber);
                    }
                    UnaryOperator::TypeOf => add(values, Value::AnyString),
                    UnaryOperator::Void => add(values, Value::Undefined),
                }
            }
            Kind::Call { arguments, .. } => self.call(tree, e, arguments, values),
            Kind::Template {
                quasis,
                expressions,
            } => {
                let Some(mut result) = self.cooked(syntax_tree, quasis[0]) else {
                    add(values, Value::Unknown);
                    return;
                };
                for (i, &x) in expressions.iter().enumerate() {
                    let ev = self.evaluate(tree, x);
                    if ev.is_known {
                        result.push_str(&ev.value.to_javascript_string());
                        let Some(next) = self.cooked(syntax_tree, quasis[i + 1]) else {
                            add(values, Value::Unknown);
                            return;
                        };
                        result.push_str(&next);
                    } else {
                        // Upstream adds the partial string as well after giving up, and so do we.
                        add(values, Value::AnyString);
                        break;
                    }
                }
                add(values, Value::String(result));
            }
            Kind::Member { .. } => match self
                .global_keypath(tree, e)
                .as_deref()
                .and_then(global_constant)
            {
                Some(v) => add(values, Value::Number(v)),
                None => add(values, Value::Unknown),
            },
            Kind::Arrow { .. } | Kind::Function { .. } => add(values, Value::AnyFunction),
            _ => add(values, Value::Unknown),
        }
    }

    /// The cooked value of a template element (escapes decoded, line endings normalised).
    fn cooked(&self, syntax_tree: &SyntaxTree, quasi: NodeIdentifier) -> Option<String> {
        let raw = syntax_tree.str_value(quasi, self.source_text);
        rsvelte_javascript::lexer::decode_string(&raw.replace("\r\n", "\n"))
    }

    fn resolve(
        &self,
        tree: Tree<'a>,
        e: NodeIdentifier,
    ) -> Option<rsvelte_javascript::scope::BindingIdentifier> {
        match tree {
            Tree::Source => self.res.sem.binding_of(e),
            Tree::Output(syntax_tree, scope) => self
                .source
                .atoms
                .lookup(syntax_tree.name(e))
                .and_then(|a| self.res.sem.lookup(scope, a)),
        }
    }

    fn identifier(&mut self, tree: Tree<'a>, e: NodeIdentifier, values: &mut Vec<Value>) {
        let Some((b, info)) = self.resolve(tree, e).map(|b| (b, self.res.bindings[b])) else {
            if self.syntax_tree(tree).name(e) == "undefined" {
                add(values, Value::Undefined);
            } else {
                add(values, Value::Unknown);
            }
            return;
        };
        let s = &self.res.sem.bindings[b];
        // Upstream: an `{#each}` index's initial value is the block, which evaluates to a number.
        if matches!(
            info.kind,
            BindingKind::StaticIndex | BindingKind::KeyedIndex
        ) {
            add(values, Value::AnyNumber);
            return;
        }
        let is_prop = matches!(
            info.kind,
            BindingKind::Property | BindingKind::BindableProperty | BindingKind::RestProperty
        );
        let updated = s.writes > 0 || s.mutations > 0;
        if !updated && !is_prop {
            match s.kind {
                DeclarationKind::Function => {
                    add(values, Value::AnyFunction);
                    return;
                }
                DeclarationKind::Variable | DeclarationKind::Let | DeclarationKind::Const => {
                    if let Some(initializer) = s.initializer(self.source) {
                        self.eval_into(Tree::Source, initializer, values);
                        return;
                    }
                }
                DeclarationKind::Param | DeclarationKind::Import | DeclarationKind::Host => {}
            }
        }
        add(values, Value::Unknown);
    }

    fn call(
        &mut self,
        tree: Tree<'a>,
        e: NodeIdentifier,
        arguments: &[NodeIdentifier],
        values: &mut Vec<Value>,
    ) {
        let syntax_tree = self.syntax_tree(tree);
        if let Some((rune, arg)) =
            rune_call(syntax_tree, e).filter(|_| matches!(tree, Tree::Source))
        {
            // A rune only counts when its name is not shadowed (upstream `get_global_keypath`).
            match rune {
                "$state" | "$state.raw" | "$derived" => match arg {
                    Some(a) => self.eval_into(tree, a, values),
                    None => add(values, Value::Undefined),
                },
                "$derived.by" => match arg.map(|a| syntax_tree.kind(a)) {
                    Some(Kind::Arrow {
                        body,
                        expression_body: true,
                        ..
                    }) => self.eval_into(tree, body, values),
                    _ => add(values, Value::Unknown),
                },
                _ => add(values, Value::Unknown),
            }
            return;
        }
        let Kind::Call { callee, .. } = syntax_tree.kind(e) else {
            unreachable!("called on calls")
        };
        if let Some(path) = self.global_keypath(tree, callee)
            && let Some((kind, fold)) = global_function(&path)
        {
            let evs: Vec<Evaluation> = arguments.iter().map(|&a| self.evaluate(tree, a)).collect();
            match fold {
                Some(f) if evs.iter().all(|e| e.is_known) => {
                    let known: Vec<Value> = evs.into_iter().map(|e| e.value).collect();
                    add(values, f(&known));
                }
                _ => add(values, kind),
            }
            return;
        }
        add(values, Value::Unknown);
    }

    /// `Math.max` for a member chain rooted at an unshadowed global; `None` otherwise.
    fn global_keypath(&self, tree: Tree<'a>, mut e: NodeIdentifier) -> Option<String> {
        let syntax_tree = self.syntax_tree(tree);
        let mut parts = Vec::new();
        loop {
            match syntax_tree.kind(e) {
                Kind::Member {
                    object,
                    property,
                    computed: false,
                    ..
                } => {
                    parts.push(syntax_tree.name(property));
                    e = object;
                }
                Kind::Identifier(_) => {
                    if self.resolve(tree, e).is_some() {
                        return None;
                    }
                    parts.push(syntax_tree.name(e));
                    parts.reverse();
                    return Some(parts.join("."));
                }
                _ => return None,
            }
        }
    }
}

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
fn global_function(path: &str) -> Option<(Value, Option<Fold>)> {
    let fold: Fold = match path {
        "BigInt" | "Math.random" | "Math.f16round" => return Some((Value::AnyNumber, None)),
        "Math.min" => |a| {
            Value::Number(a.iter().map(Value::to_number).fold(f64::INFINITY, |m, x| {
                if m.is_nan() || x.is_nan() {
                    f64::NAN
                } else {
                    m.min(x)
                }
            }))
        },
        "Math.max" => |a| {
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
        "Math.floor" => |a| math1(a, f64::floor),
        "Math.round" => |a| math1(a, |x| if x.is_finite() { (x + 0.5).floor() } else { x }),
        "Math.abs" => |a| math1(a, f64::abs),
        "Math.acos" => |a| math1(a, f64::acos),
        "Math.asin" => |a| math1(a, f64::asin),
        "Math.atan" => |a| math1(a, f64::atan),
        "Math.atan2" => |a| Value::Number(num_arg(a, 0).atan2(num_arg(a, 1))),
        "Math.ceil" => |a| math1(a, f64::ceil),
        "Math.cos" => |a| math1(a, f64::cos),
        "Math.sin" => |a| math1(a, f64::sin),
        "Math.tan" => |a| math1(a, f64::tan),
        "Math.exp" => |a| math1(a, f64::exp),
        "Math.log" => |a| math1(a, f64::ln),
        "Math.pow" => |a| Value::Number(num_arg(a, 0).powf(num_arg(a, 1))),
        "Math.sqrt" => |a| math1(a, f64::sqrt),
        "Math.clz32" => |a| {
            Value::Number(f64::from(
                to_int32(num_arg(a, 0)).cast_unsigned().leading_zeros(),
            ))
        },
        "Math.imul" => |a| {
            Value::Number(f64::from(
                to_int32(num_arg(a, 0)).wrapping_mul(to_int32(num_arg(a, 1))),
            ))
        },
        "Math.sign" => |a| {
            math1(a, |x| {
                if x.is_nan() || x == 0.0 {
                    x
                } else {
                    x.signum()
                }
            })
        },
        "Math.log10" => |a| math1(a, f64::log10),
        "Math.log2" => |a| math1(a, f64::log2),
        "Math.log1p" => |a| math1(a, f64::ln_1p),
        "Math.expm1" => |a| math1(a, f64::exp_m1),
        "Math.cosh" => |a| math1(a, f64::cosh),
        "Math.sinh" => |a| math1(a, f64::sinh),
        "Math.tanh" => |a| math1(a, f64::tanh),
        "Math.acosh" => |a| math1(a, f64::acosh),
        "Math.asinh" => |a| math1(a, f64::asinh),
        "Math.atanh" => |a| math1(a, f64::atanh),
        "Math.trunc" => |a| math1(a, f64::trunc),
        "Math.fround" => |a| math1(a, |x| f64::from(x as f32)),
        "Math.cbrt" => |a| math1(a, f64::cbrt),
        "Number" => |a| Value::Number(a.first().map_or(0.0, Value::to_number)),
        "Number.isInteger" => |a| {
            Value::Boolean(
                matches!(a.first(), Some(Value::Number(n)) if n.is_finite() && n.fract() == 0.0),
            )
        },
        "Number.isFinite" => {
            |a| Value::Boolean(matches!(a.first(), Some(Value::Number(n)) if n.is_finite()))
        }
        "Number.isNaN" => {
            |a| Value::Boolean(matches!(a.first(), Some(Value::Number(n)) if n.is_nan()))
        }
        "Number.isSafeInteger" => |a| {
            Value::Boolean(
                matches!(a.first(), Some(Value::Number(n)) if n.fract() == 0.0 && n.abs() <= MAX_SAFE_INTEGER),
            )
        },
        "Number.parseFloat"
        | "Number.parseInt"
        | "String.fromCharCode"
        | "String.fromCodePoint" => {
            // Folding these needs JS parsing/encoding rules that are not ported; report the type
            // only.
            let kind = if path.starts_with("String") {
                Value::AnyString
            } else {
                Value::AnyNumber
            };
            return Some((kind, None));
        }
        "String" => |a| Value::String(a.first().map_or(String::new(), Value::to_javascript_string)),
        _ => return None,
    };
    let kind = if path.starts_with("String") {
        Value::AnyString
    } else {
        Value::AnyNumber
    };
    Some((kind, Some(fold)))
}

fn global_constant(path: &str) -> Option<f64> {
    use std::f64::consts::{E, FRAC_1_SQRT_2, LN_2, LN_10, LOG2_E, LOG10_E, PI, SQRT_2};
    Some(match path {
        "Math.PI" => PI,
        "Math.E" => E,
        "Math.LN10" => LN_10,
        "Math.LN2" => LN_2,
        "Math.LOG10E" => LOG10_E,
        "Math.LOG2E" => LOG2_E,
        "Math.SQRT2" => SQRT_2,
        "Math.SQRT1_2" => FRAC_1_SQRT_2,
        _ => return None,
    })
}

fn binary(op: BinaryOperator, a: &Value, b: &Value) -> Option<Value> {
    use BinaryOperator::{
        Add, BitAnd, BitOr, BitXor, Div, Eq, Exp, Gt, GtEq, In, InstanceOf, Lt, LtEq, Mul, NotEq,
        Remainder, Shl, Shr, StrictEq, StrictNotEq, Sub, UShr,
    };
    let num = |f: fn(f64, f64) -> f64| Some(Value::Number(f(a.to_number(), b.to_number())));
    let int = |f: fn(i32, i32) -> i32| {
        Some(Value::Number(f64::from(f(
            to_int32(a.to_number()),
            to_int32(b.to_number()),
        ))))
    };
    match op {
        Add => {
            if matches!(a, Value::String(_)) || matches!(b, Value::String(_)) {
                Some(Value::String(format!(
                    "{}{}",
                    a.to_javascript_string(),
                    b.to_javascript_string()
                )))
            } else {
                num(|x, y| x + y)
            }
        }
        Sub => num(|x, y| x - y),
        Mul => num(|x, y| x * y),
        Div => num(|x, y| x / y),
        Remainder => num(|x, y| x % y),
        Exp => num(f64::powf),
        BitAnd => int(|x, y| x & y),
        BitOr => int(|x, y| x | y),
        BitXor => int(|x, y| x ^ y),
        Shl => int(|x, y| x.wrapping_shl(y.cast_unsigned() & 31)),
        Shr => int(|x, y| x.wrapping_shr(y.cast_unsigned() & 31)),
        UShr => Some(Value::Number(f64::from(
            to_int32(a.to_number())
                .cast_unsigned()
                .wrapping_shr(to_int32(b.to_number()).cast_unsigned() & 31),
        ))),
        StrictEq => Some(Value::Boolean(strict_eq(a, b))),
        StrictNotEq => Some(Value::Boolean(!strict_eq(a, b))),
        Eq => Some(Value::Boolean(loose_eq(a, b))),
        NotEq => Some(Value::Boolean(!loose_eq(a, b))),
        Lt | LtEq | Gt | GtEq => {
            let ord = if let (Value::String(x), Value::String(y)) = (a, b) {
                Some(x.encode_utf16().cmp(y.encode_utf16()))
            } else {
                a.to_number().partial_cmp(&b.to_number())
            };
            let Some(ord) = ord else {
                return Some(Value::Boolean(false));
            };
            Some(Value::Boolean(match op {
                Lt => ord.is_lt(),
                LtEq => ord.is_le(),
                Gt => ord.is_gt(),
                _ => ord.is_ge(),
            }))
        }
        // `in` / `instanceof` on primitives throw at runtime; nothing to fold.
        In | InstanceOf => None,
    }
}

fn strict_eq(a: &Value, b: &Value) -> bool {
    match (a, b) {
        (Value::Number(x), Value::Number(y)) => x == y,
        _ => a == b,
    }
}

fn loose_eq(a: &Value, b: &Value) -> bool {
    match (a, b) {
        (Value::Null | Value::Undefined, Value::Null | Value::Undefined) => true,
        (Value::Null | Value::Undefined, _) | (_, Value::Null | Value::Undefined) => false,
        (Value::String(_), Value::String(_))
        | (Value::Boolean(_), Value::Boolean(_))
        | (Value::Number(_), Value::Number(_)) => strict_eq(a, b),
        _ => a.to_number() == b.to_number(),
    }
}

fn logical(op: LogicalOperator, a: &Value, b: &Value) -> Value {
    let pick_a = match op {
        LogicalOperator::And => !a.truthy(),
        LogicalOperator::Or => a.truthy(),
        LogicalOperator::Nullish => !matches!(a, Value::Null | Value::Undefined),
    };
    if pick_a { a.clone() } else { b.clone() }
}

fn unary(op: UnaryOperator, a: &Value) -> Value {
    match op {
        UnaryOperator::Not => Value::Boolean(!a.truthy()),
        UnaryOperator::Neg => Value::Number(-a.to_number()),
        UnaryOperator::Plus => Value::Number(a.to_number()),
        UnaryOperator::BitNot => Value::Number(f64::from(!to_int32(a.to_number()))),
        UnaryOperator::TypeOf => Value::String(
            match a {
                Value::String(_) => "string",
                Value::Number(_) => "number",
                Value::Boolean(_) => "boolean",
                Value::Null => "object",
                Value::Undefined => "undefined",
                _ => unreachable!("known values only"),
            }
            .into(),
        ),
        UnaryOperator::Void => Value::Undefined,
        UnaryOperator::Delete => Value::Boolean(true),
    }
}
