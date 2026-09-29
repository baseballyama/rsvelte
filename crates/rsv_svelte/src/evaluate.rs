//! Upstream `scope.evaluate` (phases/scope.js `Evaluation`): the set of values an expression can
//! have at runtime, as far as the compiler can tell. It decides whether output inlines a value,
//! adds `?? ''`, or wraps in `$.stringify`, so it is ported case by case.

use crate::analyze::{Analysis, BindKind, rune_call};
use rsv_js::codegen::number;
use rsv_js::ops::{BinOp, LogicalOp, UnaryOp};
use rsv_js::scope::DeclKind;
use rsv_js::{Ast, Kind, NodeId};

#[derive(Clone, Debug)]
pub enum Val {
    Str(String),
    Num(f64),
    Bool(bool),
    Null,
    Undefined,
    /// Some string.
    AnyString,
    /// Some number.
    AnyNumber,
    AnyFunction,
    Unknown,
}

impl PartialEq for Val {
    /// `Set` membership in JS: SameValueZero.
    fn eq(&self, other: &Val) -> bool {
        use Val::*;
        match (self, other) {
            (Str(a), Str(b)) => a == b,
            (Num(a), Num(b)) => a == b || (a.is_nan() && b.is_nan()),
            (Bool(a), Bool(b)) => a == b,
            (Null, Null)
            | (Undefined, Undefined)
            | (AnyString, AnyString)
            | (AnyNumber, AnyNumber) => true,
            (AnyFunction, AnyFunction) | (Unknown, Unknown) => true,
            _ => false,
        }
    }
}

impl Val {
    fn is_symbol(&self) -> bool {
        matches!(
            self,
            Val::AnyString | Val::AnyNumber | Val::AnyFunction | Val::Unknown
        )
    }

    /// `String(value)` for a known value.
    pub fn to_js_string(&self) -> String {
        match self {
            Val::Str(s) => s.clone(),
            Val::Num(n) => number(*n),
            Val::Bool(b) => b.to_string(),
            Val::Null => "null".into(),
            Val::Undefined => "undefined".into(),
            _ => unreachable!("only known values are rendered"),
        }
    }

    fn to_number(&self) -> f64 {
        match self {
            Val::Num(n) => *n,
            Val::Bool(b) => f64::from(u8::from(*b)),
            Val::Null => 0.0,
            Val::Undefined => f64::NAN,
            Val::Str(s) => string_to_number(s),
            _ => unreachable!("only known values are converted"),
        }
    }

    fn truthy(&self) -> bool {
        match self {
            Val::Str(s) => !s.is_empty(),
            Val::Num(n) => *n != 0.0 && !n.is_nan(),
            Val::Bool(b) => *b,
            Val::Null | Val::Undefined => false,
            _ => unreachable!("only known values are tested"),
        }
    }
}

fn string_to_number(s: &str) -> f64 {
    let t = s.trim_matches(|c: char| c.is_whitespace() || c == '\u{feff}');
    if t.is_empty() {
        return 0.0;
    }
    let radix = |p: &str, r| {
        u64::from_str_radix(p, r)
            .map(|v| v as f64)
            .unwrap_or(f64::NAN)
    };
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

fn to_int32(n: f64) -> i32 {
    if !n.is_finite() {
        return 0;
    }
    (n.trunc() as i64 as u64 & 0xffff_ffff) as u32 as i32
}

pub struct Evaluation {
    pub values: Vec<Val>,
    pub is_known: bool,
    pub has_unknown: bool,
    pub is_defined: bool,
    pub is_string: bool,
    pub is_number: bool,
    pub is_function: bool,
    pub value: Val,
}

impl Evaluation {
    fn from_values(values: Vec<Val>) -> Evaluation {
        let mut e = Evaluation {
            is_known: true,
            has_unknown: false,
            is_defined: true,
            is_string: true,
            is_number: true,
            is_function: true,
            value: Val::Undefined,
            values: Vec::new(),
        };
        for v in &values {
            e.value = v.clone();
            if !matches!(v, Val::AnyString | Val::Str(_)) {
                e.is_string = false;
            }
            if !matches!(v, Val::AnyNumber | Val::Num(_)) {
                e.is_number = false;
            }
            if !matches!(v, Val::AnyFunction) {
                e.is_function = false;
            }
            if matches!(v, Val::Null | Val::Undefined | Val::Unknown) {
                e.is_defined = false;
            }
            if matches!(v, Val::Unknown) {
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

fn add(values: &mut Vec<Val>, v: Val) {
    if !values.contains(&v) {
        values.push(v);
    }
}

/// Which tree an expression lives in. Output trees carry no scope analysis, so their identifiers
/// resolve by name against the component scope, as upstream's `state.scope.evaluate(value)` does on
/// the transformed expression.
#[derive(Clone, Copy)]
pub enum Tree<'a> {
    Source,
    Output(&'a Ast),
}

pub struct Evaluator<'a> {
    source: &'a Ast,
    src: &'a str,
    an: &'a Analysis,
    in_progress: Vec<(bool, NodeId)>,
}

impl<'a> Evaluator<'a> {
    pub fn new(source: &'a Ast, src: &'a str, an: &'a Analysis) -> Self {
        Evaluator {
            source,
            src,
            an,
            in_progress: Vec::new(),
        }
    }

    pub fn evaluate(&mut self, tree: Tree<'a>, e: NodeId) -> Evaluation {
        let mut values = Vec::new();
        self.eval_into(tree, e, &mut values);
        Evaluation::from_values(values)
    }

    fn ast(&self, tree: Tree<'a>) -> &'a Ast {
        match tree {
            Tree::Source => self.source,
            Tree::Output(a) => a,
        }
    }

    fn eval_into(&mut self, tree: Tree<'a>, e: NodeId, values: &mut Vec<Val>) {
        // Upstream returns the evaluation already in progress for a cycle; it has no values yet at
        // that point, which only a self-referencing initialiser can reach.
        let key = (matches!(tree, Tree::Output(_)), e);
        if self.in_progress.contains(&key) {
            add(values, Val::Unknown);
            return;
        }
        self.in_progress.push(key);
        self.eval_node(tree, e, values);
        self.in_progress.pop();
    }

    fn eval_node(&mut self, tree: Tree<'a>, e: NodeId, values: &mut Vec<Val>) {
        let ast = self.ast(tree);
        match ast.kind(e) {
            Kind::Str => add(values, Val::Str(ast.str_value(e, self.src).to_owned())),
            Kind::Num(n) => add(values, Val::Num(n)),
            Kind::Bool(b) => add(values, Val::Bool(b)),
            Kind::Null => add(values, Val::Null),
            Kind::Ident(_) => self.identifier(tree, e, values),
            Kind::Binary(op, l, r) => {
                let a = self.evaluate(tree, l);
                let b = self.evaluate(tree, r);
                if a.is_known && b.is_known {
                    match binary(op, &a.value, &b.value) {
                        Some(v) => add(values, v),
                        None => add(values, Val::Unknown),
                    }
                    return;
                }
                use BinOp::*;
                match op {
                    NotEq | StrictNotEq | Lt | LtEq | Gt | GtEq | Eq | StrictEq | In
                    | InstanceOf => {
                        add(values, Val::Bool(true));
                        add(values, Val::Bool(false));
                    }
                    Rem | BitAnd | Mul | Exp | Sub | Div | Shl | Shr | UShr | BitXor | BitOr => {
                        add(values, Val::AnyNumber)
                    }
                    Add => {
                        if a.is_string || b.is_string {
                            add(values, Val::AnyString);
                        } else if a.is_number && b.is_number {
                            add(values, Val::AnyNumber);
                        } else {
                            add(values, Val::AnyString);
                            add(values, Val::AnyNumber);
                        }
                    }
                }
            }
            Kind::Cond { test, cons, alt } => {
                let t = self.evaluate(tree, test);
                let c = self.evaluate(tree, cons);
                let a = self.evaluate(tree, alt);
                if t.is_known {
                    for v in if t.value.truthy() { c.values } else { a.values } {
                        add(values, v);
                    }
                } else {
                    for v in c.values.into_iter().chain(a.values) {
                        add(values, v);
                    }
                }
            }
            Kind::Logical(op, l, r) => {
                let a = self.evaluate(tree, l);
                let b = self.evaluate(tree, r);
                if a.is_known {
                    if b.is_known {
                        add(values, logical(op, &a.value, &b.value));
                        return;
                    }
                    let short = match op {
                        LogicalOp::And => !a.value.truthy(),
                        LogicalOp::Or => a.value.truthy(),
                        LogicalOp::Nullish => !matches!(a.value, Val::Null | Val::Undefined),
                    };
                    if short {
                        add(values, a.value);
                    } else {
                        for v in b.values {
                            add(values, v);
                        }
                    }
                    return;
                }
                for v in a.values.into_iter().chain(b.values) {
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
                    UnaryOp::Not | UnaryOp::Delete => {
                        add(values, Val::Bool(false));
                        add(values, Val::Bool(true));
                    }
                    UnaryOp::Plus | UnaryOp::Neg | UnaryOp::BitNot => add(values, Val::AnyNumber),
                    UnaryOp::TypeOf => add(values, Val::AnyString),
                    UnaryOp::Void => add(values, Val::Undefined),
                }
            }
            Kind::Call { args, .. } => self.call(tree, e, args, values),
            Kind::Template { quasis, exprs } => {
                let Some(mut result) = self.cooked(ast, quasis[0]) else {
                    add(values, Val::Unknown);
                    return;
                };
                for (i, &x) in exprs.iter().enumerate() {
                    let ev = self.evaluate(tree, x);
                    if ev.is_known {
                        result.push_str(&ev.value.to_js_string());
                        let Some(next) = self.cooked(ast, quasis[i + 1]) else {
                            add(values, Val::Unknown);
                            return;
                        };
                        result.push_str(&next);
                    } else {
                        // Upstream adds the partial string as well after giving up, and so do we.
                        add(values, Val::AnyString);
                        break;
                    }
                }
                add(values, Val::Str(result));
            }
            Kind::Member { .. } => match self
                .global_keypath(tree, e)
                .as_deref()
                .and_then(global_constant)
            {
                Some(v) => add(values, Val::Num(v)),
                None => add(values, Val::Unknown),
            },
            Kind::Arrow { .. } | Kind::Function { .. } => add(values, Val::AnyFunction),
            _ => add(values, Val::Unknown),
        }
    }

    /// The cooked value of a template element (escapes decoded, line endings normalised).
    fn cooked(&self, ast: &Ast, quasi: NodeId) -> Option<String> {
        let raw = ast.str_value(quasi, self.src);
        rsv_js::lexer::decode_string(&raw.replace("\r\n", "\n"))
    }

    fn resolve(&self, tree: Tree<'a>, e: NodeId) -> Option<rsv_js::scope::BindingId> {
        match tree {
            Tree::Source => self.an.sem.binding_of(e),
            Tree::Output(ast) => self
                .source
                .atoms
                .lookup(ast.name(e))
                .and_then(|a| self.an.sem.root_binding(a)),
        }
    }

    fn identifier(&mut self, tree: Tree<'a>, e: NodeId, values: &mut Vec<Val>) {
        let Some((b, info)) = self.resolve(tree, e).map(|b| (b, self.an.bindings[b])) else {
            if self.ast(tree).name(e) == "undefined" {
                add(values, Val::Undefined);
            } else {
                add(values, Val::Unknown);
            }
            return;
        };
        let s = &self.an.sem.bindings[b];
        let is_prop = matches!(
            info.kind,
            BindKind::Prop | BindKind::BindableProp | BindKind::RestProp
        );
        let updated = s.writes > 0 || s.mutations > 0;
        if !updated && !is_prop {
            match s.kind {
                DeclKind::Function => {
                    add(values, Val::AnyFunction);
                    return;
                }
                DeclKind::Var | DeclKind::Let | DeclKind::Const => {
                    if let Some(init) = s.init(self.source) {
                        self.eval_into(Tree::Source, init, values);
                        return;
                    }
                }
                DeclKind::Param | DeclKind::Import => {}
            }
        }
        add(values, Val::Unknown);
    }

    fn call(&mut self, tree: Tree<'a>, e: NodeId, args: &[NodeId], values: &mut Vec<Val>) {
        let ast = self.ast(tree);
        if let Some((rune, arg)) = rune_call(ast, e).filter(|_| matches!(tree, Tree::Source)) {
            // A rune only counts when its name is not shadowed (upstream `get_global_keypath`).
            match rune {
                "$state" | "$state.raw" | "$derived" => match arg {
                    Some(a) => self.eval_into(tree, a, values),
                    None => add(values, Val::Undefined),
                },
                "$derived.by" => match arg.map(|a| ast.kind(a)) {
                    Some(Kind::Arrow {
                        body,
                        expr_body: true,
                        ..
                    }) => self.eval_into(tree, body, values),
                    _ => add(values, Val::Unknown),
                },
                _ => add(values, Val::Unknown),
            }
            return;
        }
        let Kind::Call { callee, .. } = ast.kind(e) else {
            unreachable!("called on calls")
        };
        if let Some(path) = self.global_keypath(tree, callee)
            && let Some((kind, fold)) = global_function(&path)
        {
            let evs: Vec<Evaluation> = args.iter().map(|&a| self.evaluate(tree, a)).collect();
            match fold {
                Some(f) if evs.iter().all(|e| e.is_known) => {
                    let known: Vec<Val> = evs.into_iter().map(|e| e.value).collect();
                    add(values, f(&known));
                }
                _ => add(values, kind),
            }
            return;
        }
        add(values, Val::Unknown);
    }

    /// `Math.max` for a member chain rooted at an unshadowed global; `None` otherwise.
    fn global_keypath(&self, tree: Tree<'a>, mut e: NodeId) -> Option<String> {
        let ast = self.ast(tree);
        let mut parts = Vec::new();
        loop {
            match ast.kind(e) {
                Kind::Member {
                    object,
                    property,
                    computed: false,
                    ..
                } => {
                    parts.push(ast.name(property));
                    e = object;
                }
                Kind::Ident(_) => {
                    if self.resolve(tree, e).is_some() {
                        return None;
                    }
                    parts.push(ast.name(e));
                    parts.reverse();
                    return Some(parts.join("."));
                }
                _ => return None,
            }
        }
    }
}

type Fold = fn(&[Val]) -> Val;

fn num_arg(a: &[Val], i: usize) -> f64 {
    a.get(i).map_or(f64::NAN, Val::to_number)
}

fn math1(a: &[Val], f: fn(f64) -> f64) -> Val {
    Val::Num(f(num_arg(a, 0)))
}

/// Upstream `globals` (phases/scope.js): the result kind, and a fold when every argument is known.
/// `Math.f16round` is listed without a fold: Rust has no stable half-precision rounding.
fn global_function(path: &str) -> Option<(Val, Option<Fold>)> {
    let fold: Fold = match path {
        "BigInt" | "Math.random" | "Math.f16round" => return Some((Val::AnyNumber, None)),
        "Math.min" => |a| {
            Val::Num(a.iter().map(Val::to_number).fold(f64::INFINITY, |m, x| {
                if m.is_nan() || x.is_nan() {
                    f64::NAN
                } else {
                    m.min(x)
                }
            }))
        },
        "Math.max" => |a| {
            Val::Num(
                a.iter()
                    .map(Val::to_number)
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
        "Math.atan2" => |a| Val::Num(num_arg(a, 0).atan2(num_arg(a, 1))),
        "Math.ceil" => |a| math1(a, f64::ceil),
        "Math.cos" => |a| math1(a, f64::cos),
        "Math.sin" => |a| math1(a, f64::sin),
        "Math.tan" => |a| math1(a, f64::tan),
        "Math.exp" => |a| math1(a, f64::exp),
        "Math.log" => |a| math1(a, f64::ln),
        "Math.pow" => |a| Val::Num(num_arg(a, 0).powf(num_arg(a, 1))),
        "Math.sqrt" => |a| math1(a, f64::sqrt),
        "Math.clz32" => |a| Val::Num(f64::from((to_int32(num_arg(a, 0)) as u32).leading_zeros())),
        "Math.imul" => |a| {
            Val::Num(f64::from(
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
        "Number" => |a| Val::Num(a.first().map_or(0.0, Val::to_number)),
        "Number.isInteger" => |a| {
            Val::Bool(matches!(a.first(), Some(Val::Num(n)) if n.is_finite() && n.fract() == 0.0))
        },
        "Number.isFinite" => |a| Val::Bool(matches!(a.first(), Some(Val::Num(n)) if n.is_finite())),
        "Number.isNaN" => |a| Val::Bool(matches!(a.first(), Some(Val::Num(n)) if n.is_nan())),
        "Number.isSafeInteger" => |a| {
            Val::Bool(
                matches!(a.first(), Some(Val::Num(n)) if n.fract() == 0.0 && n.abs() <= 9007199254740991.0),
            )
        },
        "Number.parseFloat"
        | "Number.parseInt"
        | "String.fromCharCode"
        | "String.fromCodePoint" => {
            // Folding these needs JS parsing/encoding rules that are not ported; report the type only.
            let kind = if path.starts_with("String") {
                Val::AnyString
            } else {
                Val::AnyNumber
            };
            return Some((kind, None));
        }
        "String" => |a| Val::Str(a.first().map_or(String::new(), Val::to_js_string)),
        _ => return None,
    };
    let kind = if path.starts_with("String") {
        Val::AnyString
    } else {
        Val::AnyNumber
    };
    Some((kind, Some(fold)))
}

fn global_constant(path: &str) -> Option<f64> {
    use std::f64::consts::*;
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

fn binary(op: BinOp, a: &Val, b: &Val) -> Option<Val> {
    use BinOp::*;
    let num = |f: fn(f64, f64) -> f64| Some(Val::Num(f(a.to_number(), b.to_number())));
    let int = |f: fn(i32, i32) -> i32| {
        Some(Val::Num(f64::from(f(
            to_int32(a.to_number()),
            to_int32(b.to_number()),
        ))))
    };
    match op {
        Add => {
            if matches!(a, Val::Str(_)) || matches!(b, Val::Str(_)) {
                Some(Val::Str(format!(
                    "{}{}",
                    a.to_js_string(),
                    b.to_js_string()
                )))
            } else {
                num(|x, y| x + y)
            }
        }
        Sub => num(|x, y| x - y),
        Mul => num(|x, y| x * y),
        Div => num(|x, y| x / y),
        Rem => num(|x, y| x % y),
        Exp => num(f64::powf),
        BitAnd => int(|x, y| x & y),
        BitOr => int(|x, y| x | y),
        BitXor => int(|x, y| x ^ y),
        Shl => int(|x, y| x.wrapping_shl(y as u32 & 31)),
        Shr => int(|x, y| x.wrapping_shr(y as u32 & 31)),
        UShr => Some(Val::Num(f64::from(
            (to_int32(a.to_number()) as u32).wrapping_shr(to_int32(b.to_number()) as u32 & 31),
        ))),
        StrictEq => Some(Val::Bool(strict_eq(a, b))),
        StrictNotEq => Some(Val::Bool(!strict_eq(a, b))),
        Eq => Some(Val::Bool(loose_eq(a, b))),
        NotEq => Some(Val::Bool(!loose_eq(a, b))),
        Lt | LtEq | Gt | GtEq => {
            let ord = if let (Val::Str(x), Val::Str(y)) = (a, b) {
                Some(x.encode_utf16().cmp(y.encode_utf16()))
            } else {
                a.to_number().partial_cmp(&b.to_number())
            };
            let Some(ord) = ord else {
                return Some(Val::Bool(false));
            };
            Some(Val::Bool(match op {
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

fn strict_eq(a: &Val, b: &Val) -> bool {
    match (a, b) {
        (Val::Num(x), Val::Num(y)) => x == y,
        _ => a == b,
    }
}

fn loose_eq(a: &Val, b: &Val) -> bool {
    match (a, b) {
        (Val::Null | Val::Undefined, Val::Null | Val::Undefined) => true,
        (Val::Null | Val::Undefined, _) | (_, Val::Null | Val::Undefined) => false,
        (Val::Str(_), Val::Str(_)) | (Val::Bool(_), Val::Bool(_)) | (Val::Num(_), Val::Num(_)) => {
            strict_eq(a, b)
        }
        _ => a.to_number() == b.to_number(),
    }
}

fn logical(op: LogicalOp, a: &Val, b: &Val) -> Val {
    let pick_a = match op {
        LogicalOp::And => !a.truthy(),
        LogicalOp::Or => a.truthy(),
        LogicalOp::Nullish => !matches!(a, Val::Null | Val::Undefined),
    };
    if pick_a { a.clone() } else { b.clone() }
}

fn unary(op: UnaryOp, a: &Val) -> Val {
    match op {
        UnaryOp::Not => Val::Bool(!a.truthy()),
        UnaryOp::Neg => Val::Num(-a.to_number()),
        UnaryOp::Plus => Val::Num(a.to_number()),
        UnaryOp::BitNot => Val::Num(f64::from(!to_int32(a.to_number()))),
        UnaryOp::TypeOf => Val::Str(
            match a {
                Val::Str(_) => "string",
                Val::Num(_) => "number",
                Val::Bool(_) => "boolean",
                Val::Null => "object",
                Val::Undefined => "undefined",
                _ => unreachable!("known values only"),
            }
            .into(),
        ),
        UnaryOp::Void => Val::Undefined,
        UnaryOp::Delete => Val::Bool(true),
    }
}
