//! The value an expression has whenever it runs, when that follows from the code alone
//! (`getStaticValue` in `@eslint-community/eslint-utils`).
//!
//! An answer is either the value or `None` ("not known"), never a guess: an operation this module
//! does not model gives `None`, so a caller can treat `Some` as proof. Type syntax is erased in the
//! tree, so `e as T`, `e satisfies T`, `e!` and `<T>e` are `e`.

use std::cell::OnceCell;

use rustc_hash::FxHashMap;

use crate::operators::{BinaryOperator, LogicalOperator, UnaryOperator};
use crate::scope::{BindingIdentifier, DeclarationKind, Semantic};
use crate::semantic::number::number;
use crate::syntax_tree::{Kind, NodeIdentifier, SyntaxTree, flag};

#[derive(Clone, Debug, PartialEq)]
pub enum Value {
    Undefined,
    Null,
    Boolean(bool),
    Number(f64),
    String(String),
    Array(Vec<Self>),
    /// Own properties in insertion order; a later duplicate key replaces the earlier value.
    Object(Vec<(String, Self)>),
    Global(Global),
}

/// The built-in globals whose members or calls this module evaluates.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Global {
    Array,
    Boolean,
    Math,
    Number,
    Object,
    String,
}

/// Evaluates expressions of one tree. `semantic` resolves identifiers; without it, only
/// expressions that name no variable have a value.
#[derive(Debug)]
pub struct StaticValues<'a> {
    syntax_tree: &'a SyntaxTree,
    source_text: &'a str,
    semantic: Option<&'a Semantic>,
    /// Built on the first object-valued variable, to find its mutating method calls.
    parents: OnceCell<Vec<NodeIdentifier>>,
}

/// A value and whether an optional chain short-circuited on the way to it.
struct Evaluated {
    value: Value,
    optional: bool,
}

#[expect(
    clippy::unnecessary_wraps,
    reason = "every evaluation step returns an option"
)]
const fn plain(value: Value) -> Option<Evaluated> {
    Some(Evaluated {
        value,
        optional: false,
    })
}

/// Array methods that change the array they are called on.
const MUTATING_METHODS: [&str; 9] = [
    "copyWithin",
    "fill",
    "pop",
    "push",
    "reverse",
    "shift",
    "sort",
    "splice",
    "unshift",
];

/// Names every object inherits, whose values (functions) this module cannot hold.
const OBJECT_PROTOTYPE: [&str; 12] = [
    "__defineGetter__",
    "__defineSetter__",
    "__lookupGetter__",
    "__lookupSetter__",
    "__proto__",
    "constructor",
    "hasOwnProperty",
    "isPrototypeOf",
    "propertyIsEnumerable",
    "toLocaleString",
    "toString",
    "valueOf",
];

/// Longest string a method may build, so a constant like `"".padEnd(1e9)` stays cheap.
const MAX_BUILT_LENGTH: f64 = 1_048_576.0;

impl<'a> StaticValues<'a> {
    #[must_use]
    pub const fn new(
        syntax_tree: &'a SyntaxTree,
        source_text: &'a str,
        semantic: Option<&'a Semantic>,
    ) -> Self {
        Self {
            syntax_tree,
            source_text,
            semantic,
            parents: OnceCell::new(),
        }
    }

    /// The value of `node`, if it is known.
    #[must_use]
    pub fn value(&self, node: NodeIdentifier) -> Option<Value> {
        self.evaluate(node, &mut Vec::new()).map(|e| e.value)
    }

    /// The value of `node` converted to a string, if it is known (`getStringIfConstant`). A
    /// regular expression literal gives its source text.
    #[must_use]
    pub fn string(&self, node: NodeIdentifier) -> Option<String> {
        if let Kind::Regex { pattern, flags } = self.syntax_tree.kind(node) {
            return Some(format!(
                "/{}/{}",
                &self.source_text[pattern.start_offset as usize..pattern.end_offset as usize],
                &self.source_text[flags.start_offset as usize..flags.end_offset as usize]
            ));
        }
        to_string(&self.value(node)?)
    }

    fn evaluate(
        &self,
        node: NodeIdentifier,
        visiting: &mut Vec<BindingIdentifier>,
    ) -> Option<Evaluated> {
        let tree = self.syntax_tree;
        match tree.kind(node) {
            Kind::Number(v) => plain(Value::Number(v)),
            Kind::String => plain(Value::String(
                tree.str_value(node, self.source_text).to_owned(),
            )),
            Kind::Boolean(b) => plain(Value::Boolean(b)),
            Kind::Null => plain(Value::Null),
            Kind::Template {
                quasis,
                expressions,
            } => {
                let mut out = String::new();
                for (index, &quasi) in quasis.iter().enumerate() {
                    out.push_str(&self.cooked(quasi));
                    if let Some(&expression) = expressions.get(index) {
                        out.push_str(&to_string(&self.evaluate(expression, visiting)?.value)?);
                    }
                }
                plain(Value::String(out))
            }
            Kind::Identifier(_) => self.identifier(node, visiting),
            Kind::Array(elements) => plain(Value::Array(self.elements(elements, visiting)?)),
            Kind::Object(properties) => self.object(properties, visiting),
            Kind::Unary(operator, argument) => {
                if operator == UnaryOperator::Void {
                    return plain(Value::Undefined);
                }
                let value = self.evaluate(argument, visiting)?.value;
                plain(unary(operator, &value)?)
            }
            Kind::Binary(operator, left, right) => {
                let left = self.evaluate(left, visiting)?.value;
                let right = self.evaluate(right, visiting)?.value;
                plain(binary(operator, &left, &right)?)
            }
            Kind::Logical(operator, left, right) => {
                let left = self.evaluate(left, visiting)?;
                let settled = match operator {
                    LogicalOperator::Or => truthy(&left.value),
                    LogicalOperator::And => !truthy(&left.value),
                    LogicalOperator::Nullish => {
                        !matches!(left.value, Value::Null | Value::Undefined)
                    }
                };
                if settled {
                    Some(left)
                } else {
                    self.evaluate(right, visiting)
                }
            }
            Kind::Conditional {
                test,
                consequent,
                alternate,
            } => {
                let test = self.evaluate(test, visiting)?.value;
                self.evaluate(if truthy(&test) { consequent } else { alternate }, visiting)
            }
            Kind::Sequence(expressions) => self.evaluate(*expressions.last()?, visiting),
            Kind::Assign(crate::operators::AssignmentOperator::Assign, _, right) => {
                self.evaluate(right, visiting)
            }
            Kind::Member {
                object,
                property,
                computed,
                optional,
            } => {
                let object = self.evaluate(object, visiting)?;
                if is_nullish(&object.value) && (object.optional || optional) {
                    return self.short_circuit(node);
                }
                let key = self.property_key(property, computed, visiting)?;
                plain(member(&object.value, &key)?)
            }
            Kind::Call {
                callee,
                arguments,
                optional,
                ..
            } => self.call(node, callee, arguments, optional, visiting),
            _ => None,
        }
    }

    /// `undefined` for a short-circuited optional chain; a parenthesized chain ends there.
    fn short_circuit(&self, node: NodeIdentifier) -> Option<Evaluated> {
        let ends = self.syntax_tree.flags(node) & flag::GROUPED != 0;
        plain(Value::Undefined).map(|e| Evaluated {
            optional: !ends,
            ..e
        })
    }

    fn cooked(&self, quasi: NodeIdentifier) -> String {
        let raw = self.syntax_tree.str_value(quasi, self.source_text);
        if !raw.contains(['\\', '\r']) {
            return raw.to_owned();
        }
        let raw = raw.replace("\r\n", "\n").replace('\r', "\n");
        crate::lexer::decode_string(&raw).unwrap_or(raw)
    }

    fn elements(
        &self,
        elements: &[NodeIdentifier],
        visiting: &mut Vec<BindingIdentifier>,
    ) -> Option<Vec<Value>> {
        let mut out = Vec::with_capacity(elements.len());
        for &element in elements {
            match self.syntax_tree.kind(element) {
                Kind::Hole => out.push(Value::Undefined),
                Kind::Spread(argument) => match self.evaluate(argument, visiting)?.value {
                    Value::Array(items) => out.extend(items),
                    Value::String(s) => out.extend(s.chars().map(|c| Value::String(c.into()))),
                    _ => return None,
                },
                _ => out.push(self.evaluate(element, visiting)?.value),
            }
        }
        Some(out)
    }

    fn object(
        &self,
        properties: &[NodeIdentifier],
        visiting: &mut Vec<BindingIdentifier>,
    ) -> Option<Evaluated> {
        let mut out = Entries::default();
        for &property in properties {
            match self.syntax_tree.kind(property) {
                Kind::Property {
                    key,
                    value,
                    computed,
                    shorthand,
                    method,
                    getter,
                    setter,
                } => {
                    if method || getter || setter {
                        return None;
                    }
                    let name = self.property_key(key, computed, visiting)?;
                    // A literal `__proto__: x` sets the prototype instead of a property.
                    if name == "__proto__" && !computed && !shorthand {
                        return None;
                    }
                    let value = self.evaluate(value, visiting)?.value;
                    out.set(name, value);
                }
                Kind::Spread(argument) => match self.evaluate(argument, visiting)?.value {
                    Value::Object(entries) => {
                        for (name, value) in entries {
                            out.set(name, value);
                        }
                    }
                    Value::Array(items) => {
                        for (index, value) in items.into_iter().enumerate() {
                            out.set(index.to_string(), value);
                        }
                    }
                    Value::String(s) => {
                        for (index, unit) in s.encode_utf16().enumerate() {
                            out.set(index.to_string(), from_units(&[unit])?);
                        }
                    }
                    Value::Undefined | Value::Null | Value::Boolean(_) | Value::Number(_) => {}
                    Value::Global(_) => return None,
                },
                _ => return None,
            }
        }
        plain(Value::Object(out.entries))
    }

    fn property_key(
        &self,
        key: NodeIdentifier,
        computed: bool,
        visiting: &mut Vec<BindingIdentifier>,
    ) -> Option<String> {
        if computed {
            return to_string(&self.evaluate(key, visiting)?.value);
        }
        match self.syntax_tree.kind(key) {
            Kind::Identifier(atom) => {
                let name = self.syntax_tree.atoms.get(atom);
                (!name.starts_with('#')).then(|| name.to_owned())
            }
            Kind::String => Some(self.syntax_tree.str_value(key, self.source_text).to_owned()),
            Kind::Number(v) => Some(number(v)),
            _ => None,
        }
    }

    fn identifier(
        &self,
        node: NodeIdentifier,
        visiting: &mut Vec<BindingIdentifier>,
    ) -> Option<Evaluated> {
        let semantic = self.semantic?;
        let Some(binding) = semantic.binding_of(node) else {
            return plain(global(self.syntax_tree.name(node))?);
        };
        if visiting.contains(&binding) || !considered_const(semantic, binding) {
            return None;
        }
        let declaration = &semantic.bindings[binding];
        let Kind::Declarator {
            identifier,
            initializer: Some(initializer),
        } = self.syntax_tree.kind(declaration.declaration?)
        else {
            return None;
        };
        // A destructured name does not hold the initializer.
        if identifier != declaration.node {
            return None;
        }
        visiting.push(binding);
        let value = self.evaluate(initializer, visiting);
        visiting.pop();
        let value = value?.value;
        if matches!(value, Value::Array(_) | Value::Object(_)) && self.is_mutated(semantic, binding)
        {
            return None;
        }
        plain(value)
    }

    /// Whether code changes what `binding`'s object holds: an assignment or update through a
    /// member, or a call of an array method that changes the array.
    fn is_mutated(&self, semantic: &Semantic, binding: BindingIdentifier) -> bool {
        if semantic.bindings[binding].mutations > 0 {
            return true;
        }
        let tree = self.syntax_tree;
        let parents = self.parents.get_or_init(|| tree.parents());
        semantic.references_to(binding).any(|reference| {
            let mut node = reference.node;
            loop {
                let parent = parents[node.index()];
                match parent.opt().map(|p| tree.kind(p)) {
                    Some(Kind::Member { object, .. }) if object == node => node = parent,
                    Some(Kind::Call { callee, .. }) if callee == node => {
                        return match tree.kind(node) {
                            Kind::Member {
                                property, computed, ..
                            } => self
                                .property_key(property, computed, &mut Vec::new())
                                .is_some_and(|name| MUTATING_METHODS.contains(&name.as_str())),
                            _ => false,
                        };
                    }
                    _ => return false,
                }
            }
        })
    }

    fn call(
        &self,
        node: NodeIdentifier,
        callee: NodeIdentifier,
        arguments: &[NodeIdentifier],
        optional: bool,
        visiting: &mut Vec<BindingIdentifier>,
    ) -> Option<Evaluated> {
        let arguments = self.elements(arguments, visiting)?;
        if let Kind::Member {
            object,
            property,
            computed,
            optional: member_optional,
        } = self.syntax_tree.kind(callee)
        {
            let receiver = self.evaluate(object, visiting)?;
            if is_nullish(&receiver.value) && (receiver.optional || member_optional || optional) {
                return self.short_circuit(node);
            }
            let name = self.property_key(property, computed, visiting)?;
            return plain(method(&receiver.value, &name, &arguments)?);
        }
        let callee = self.evaluate(callee, visiting)?;
        if is_nullish(&callee.value) && (callee.optional || optional) {
            return self.short_circuit(node);
        }
        let first = arguments.first();
        plain(match callee.value {
            Value::Global(Global::String) => {
                Value::String(first.map_or(Some(String::new()), to_string)?)
            }
            Value::Global(Global::Number) => Value::Number(first.map_or(Some(0.0), to_number)?),
            Value::Global(Global::Boolean) => Value::Boolean(first.is_some_and(truthy)),
            _ => return None,
        })
    }
}

/// A `const`, or a `let` or `var` written only by its initializer (`canBeConsideredConst`).
fn considered_const(semantic: &Semantic, binding: BindingIdentifier) -> bool {
    match semantic.bindings[binding].kind {
        DeclarationKind::Const => true,
        DeclarationKind::Let | DeclarationKind::Variable => {
            let mut initializers = 0;
            for reference in semantic.references_to(binding) {
                if reference.initializer {
                    initializers += 1;
                } else if reference.write {
                    return false;
                }
            }
            initializers == 1
        }
        _ => false,
    }
}

fn global(name: &str) -> Option<Value> {
    Some(match name {
        "undefined" => Value::Undefined,
        "NaN" => Value::Number(f64::NAN),
        "Infinity" => Value::Number(f64::INFINITY),
        "Array" => Value::Global(Global::Array),
        "Boolean" => Value::Global(Global::Boolean),
        "Math" => Value::Global(Global::Math),
        "Number" => Value::Global(Global::Number),
        "Object" => Value::Global(Global::Object),
        "String" => Value::Global(Global::String),
        _ => return None,
    })
}

/// An object's properties being built, with an index so that each key is found in constant time.
#[derive(Default)]
struct Entries {
    entries: Vec<(String, Value)>,
    index: FxHashMap<String, usize>,
}

impl Entries {
    fn set(&mut self, name: String, value: Value) {
        if let Some(&at) = self.index.get(&name) {
            self.entries[at].1 = value;
        } else {
            self.index.insert(name.clone(), self.entries.len());
            self.entries.push((name, value));
        }
    }
}

const fn is_nullish(value: &Value) -> bool {
    matches!(value, Value::Undefined | Value::Null)
}

fn truthy(value: &Value) -> bool {
    match value {
        Value::Undefined | Value::Null => false,
        Value::Boolean(b) => *b,
        Value::Number(n) => *n != 0.0 && !n.is_nan(),
        Value::String(s) => !s.is_empty(),
        Value::Array(_) | Value::Object(_) | Value::Global(_) => true,
    }
}

const fn type_of(value: &Value) -> &'static str {
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
fn to_string(value: &Value) -> Option<String> {
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

fn join(items: &[Value], separator: &str) -> Option<String> {
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
fn to_primitive(value: &Value) -> Option<Value> {
    match value {
        Value::Array(_) | Value::Object(_) | Value::Global(_) => {
            Some(Value::String(to_string(value)?))
        }
        primitive => Some(primitive.clone()),
    }
}

fn to_number(value: &Value) -> Option<f64> {
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
fn string_to_number(s: &str) -> f64 {
    let s = s.trim_matches(is_js_whitespace);
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

/// `WhiteSpace` and `LineTerminator` in the ECMAScript grammar.
const fn is_js_whitespace(c: char) -> bool {
    matches!(
        c,
        '\t' | '\n' | '\u{b}' | '\u{c}' | '\r' | ' ' | '\u{a0}' | '\u{1680}' | '\u{2000}'
            ..='\u{200a}'
                | '\u{2028}'
                | '\u{2029}'
                | '\u{202f}'
                | '\u{205f}'
                | '\u{3000}'
                | '\u{feff}'
    )
}

#[expect(
    clippy::cast_possible_truncation,
    clippy::cast_possible_wrap,
    clippy::cast_sign_loss,
    reason = "ToInt32 reduces modulo 2^32 first and reads the 32 bits as signed"
)]
fn to_int32(value: &Value) -> Option<i32> {
    let n = to_number(value)?;
    if !n.is_finite() {
        return Some(0);
    }
    Some(n.trunc().rem_euclid(4_294_967_296.0) as u32 as i32)
}

#[expect(clippy::cast_sign_loss, reason = "the same 32 bits read as unsigned")]
fn to_uint32(value: &Value) -> Option<u32> {
    Some(to_int32(value)? as u32)
}

/// `ToIntegerOrInfinity`.
fn to_integer(value: &Value) -> Option<f64> {
    let n = to_number(value)?;
    Some(if n.is_nan() { 0.0 } else { n.trunc() + 0.0 })
}

fn unary(operator: UnaryOperator, value: &Value) -> Option<Value> {
    Some(match operator {
        UnaryOperator::Neg => Value::Number(-to_number(value)?),
        UnaryOperator::Plus => Value::Number(to_number(value)?),
        UnaryOperator::Not => Value::Boolean(!truthy(value)),
        UnaryOperator::BitNot => Value::Number(f64::from(!to_int32(value)?)),
        UnaryOperator::TypeOf => Value::String(type_of(value).into()),
        UnaryOperator::Void => Value::Undefined,
        UnaryOperator::Delete => return None,
    })
}

fn binary(operator: BinaryOperator, left: &Value, right: &Value) -> Option<Value> {
    use BinaryOperator::{
        Add, BitAnd, BitOr, BitXor, Div, Eq, Exp, Gt, GtEq, In, InstanceOf, Lt, LtEq, Mul, NotEq,
        Remainder, Shl, Shr, StrictEq, StrictNotEq, Sub, UShr,
    };
    let numbers = || Some((to_number(left)?, to_number(right)?));
    Some(match operator {
        Eq => Value::Boolean(loose_equals(left, right)?),
        NotEq => Value::Boolean(!loose_equals(left, right)?),
        StrictEq => Value::Boolean(strict_equals(left, right)?),
        StrictNotEq => Value::Boolean(!strict_equals(left, right)?),
        Lt => Value::Boolean(less_than(left, right)? == Order::Less),
        Gt => Value::Boolean(less_than(right, left)? == Order::Less),
        LtEq => Value::Boolean(less_than(right, left)? == Order::NotLess),
        GtEq => Value::Boolean(less_than(left, right)? == Order::NotLess),
        Add => {
            let (left, right) = (to_primitive(left)?, to_primitive(right)?);
            if matches!(left, Value::String(_)) || matches!(right, Value::String(_)) {
                let mut out = to_string(&left)?;
                out.push_str(&to_string(&right)?);
                Value::String(out)
            } else {
                Value::Number(to_number(&left)? + to_number(&right)?)
            }
        }
        Sub => numbers().map(|(a, b)| Value::Number(a - b))?,
        Mul => numbers().map(|(a, b)| Value::Number(a * b))?,
        Div => numbers().map(|(a, b)| Value::Number(a / b))?,
        Remainder => numbers().map(|(a, b)| Value::Number(a % b))?,
        Exp => numbers().map(|(a, b)| Value::Number(power(a, b)))?,
        BitOr => Value::Number(f64::from(to_int32(left)? | to_int32(right)?)),
        BitXor => Value::Number(f64::from(to_int32(left)? ^ to_int32(right)?)),
        BitAnd => Value::Number(f64::from(to_int32(left)? & to_int32(right)?)),
        Shl => Value::Number(f64::from(
            to_int32(left)?.wrapping_shl(to_uint32(right)? & 31),
        )),
        Shr => Value::Number(f64::from(to_int32(left)? >> (to_uint32(right)? & 31))),
        UShr => Value::Number(f64::from(to_uint32(left)? >> (to_uint32(right)? & 31))),
        In | InstanceOf => return None,
    })
}

/// `**`, where `1 ** NaN` and `1 ** Infinity` are `NaN`, unlike `powf`.
#[expect(clippy::float_cmp, reason = "exactly one")]
fn power(base: f64, exponent: f64) -> f64 {
    if exponent.is_nan() || (base.abs() == 1.0 && exponent.is_infinite()) {
        f64::NAN
    } else {
        base.powf(exponent)
    }
}

/// The outcome of `IsLessThan`.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Order {
    Less,
    NotLess,
    /// Either side is `NaN`: every comparison is false.
    Unordered,
}

fn less_than(left: &Value, right: &Value) -> Option<Order> {
    let (left, right) = (to_primitive(left)?, to_primitive(right)?);
    let less = if let (Value::String(a), Value::String(b)) = (&left, &right) {
        Some(a.encode_utf16().lt(b.encode_utf16()))
    } else {
        to_number(&left)?
            .partial_cmp(&to_number(&right)?)
            .map(std::cmp::Ordering::is_lt)
    };
    Some(match less {
        Some(true) => Order::Less,
        Some(false) => Order::NotLess,
        None => Order::Unordered,
    })
}

/// `===`; `None` between two objects, whose identity this module does not track.
#[expect(clippy::float_cmp, reason = "JavaScript compares numbers exactly")]
fn strict_equals(left: &Value, right: &Value) -> Option<bool> {
    Some(match (left, right) {
        (Value::Array(_) | Value::Object(_), Value::Array(_) | Value::Object(_)) => return None,
        (Value::Undefined, Value::Undefined) | (Value::Null, Value::Null) => true,
        (Value::Boolean(a), Value::Boolean(b)) => a == b,
        (Value::Number(a), Value::Number(b)) => a == b,
        (Value::String(a), Value::String(b)) => a == b,
        (Value::Global(a), Value::Global(b)) => a == b,
        _ => false,
    })
}

/// `==`.
#[expect(clippy::float_cmp, reason = "JavaScript compares numbers exactly")]
fn loose_equals(left: &Value, right: &Value) -> Option<bool> {
    let compound = |v: &Value| matches!(v, Value::Array(_) | Value::Object(_) | Value::Global(_));
    match (left, right) {
        (Value::Undefined | Value::Null, Value::Undefined | Value::Null) => Some(true),
        (Value::Undefined | Value::Null, _) | (_, Value::Undefined | Value::Null) => Some(false),
        (a, b) if compound(a) && compound(b) => strict_equals(a, b),
        (a, b) if compound(a) => loose_equals(&to_primitive(a)?, b),
        (a, b) if compound(b) => loose_equals(a, &to_primitive(b)?),
        (Value::String(a), Value::String(b)) => Some(a == b),
        (Value::Boolean(a), Value::Boolean(b)) => Some(a == b),
        (a, b) => Some(to_number(a)? == to_number(b)?),
    }
}

/// `SameValueZero`, which `includes` uses: `NaN` equals itself.
fn same_value_zero(left: &Value, right: &Value) -> Option<bool> {
    match (left, right) {
        (Value::Number(a), Value::Number(b)) if a.is_nan() && b.is_nan() => Some(true),
        _ => strict_equals(left, right),
    }
}

/// Reads `key` of `object`.
fn member(object: &Value, key: &str) -> Option<Value> {
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
fn array_index(key: &str) -> Option<usize> {
    let index: usize = key.parse().ok()?;
    (index.to_string() == key).then_some(index)
}

fn utf16_length(s: &str) -> f64 {
    count(s.encode_utf16().count())
}

#[expect(
    clippy::cast_precision_loss,
    reason = "no string or array in memory is 2^53 long"
)]
const fn count(n: usize) -> f64 {
    n as f64
}

/// A string of UTF-16 code units; `None` for a lone surrogate, which a Rust string cannot hold.
fn from_units(units: &[u16]) -> Option<Value> {
    String::from_utf16(units).ok().map(Value::String)
}

/// Calls the built-in `name` on `receiver` (`callAllowed` and `callPassThrough`).
fn method(receiver: &Value, name: &str, arguments: &[Value]) -> Option<Value> {
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

fn global_method(global: Global, name: &str, arguments: &[Value]) -> Option<Value> {
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
fn string_method(s: &str, name: &str, arguments: &[Value]) -> Option<Value> {
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
fn array_method(items: &[Value], name: &str, arguments: &[Value]) -> Option<Value> {
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

#[cfg(test)]
mod tests;
