//! The value an expression has whenever it runs, when that follows from the code alone
//! (`getStaticValue` in `@eslint-community/eslint-utils`).
//!
//! An answer is either the value or `None` ("not known"), never a guess: an operation this module
//! does not model gives `None`, so a caller can treat `Some` as proof. Type syntax is read through,
//! so `e as T`, `e satisfies T`, `e!` and `<T>e` are `e`.

use std::cell::RefCell;

use oxc_ast::AstKind;
use oxc_ast::ast::{
    Argument, ArrayExpressionElement, BindingPattern, CallExpression, ChainElement, Expression,
    LogicalOperator, MemberExpression, ObjectPropertyKind, PropertyKey, PropertyKind,
    TemplateLiteral, UnaryOperator,
};
use oxc_semantic::{NodeId, SymbolFlags, SymbolId};
use oxc_span::GetSpan;
use rustc_hash::FxHashMap;

use crate::number::number;
use crate::semantic::Semantic;

mod conversions;
mod members;
mod operators;

use conversions::{is_nullish, to_number, to_string, truthy};
use members::{from_units, member, method};
use operators::{binary, unary};

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

/// Evaluates expressions of one document's trees, resolving identifiers through its analysis.
#[derive(Debug)]
pub struct StaticValues<'a> {
    semantic: &'a Semantic,
    /// What the references of each variable met so far say, so that a variable named many times
    /// has its references read once.
    variables: RefCell<FxHashMap<SymbolId, Variable>>,
}

#[derive(Clone, Copy, Debug)]
struct Variable {
    constant: bool,
    /// Asked only of a variable that holds an object.
    mutated: Option<bool>,
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

/// An array element or a call argument.
#[derive(Clone, Copy)]
enum Element<'a> {
    Hole,
    Spread(&'a Expression<'a>),
    Value(&'a Expression<'a>),
}

/// A member's key: a name, or an expression in brackets.
#[derive(Clone, Copy)]
enum Key<'a> {
    Name(&'a str),
    Computed(&'a Expression<'a>),
}

/// The object, key and `?.` of a member expression.
fn member_parts<'a>(e: &'a Expression<'a>) -> Option<(&'a Expression<'a>, Key<'a>, bool)> {
    member_expression_parts(e.as_member_expression()?)
}

fn member_expression_parts<'a>(
    m: &'a MemberExpression<'a>,
) -> Option<(&'a Expression<'a>, Key<'a>, bool)> {
    Some(match m {
        MemberExpression::StaticMemberExpression(m) => {
            (&m.object, Key::Name(m.property.name.as_str()), m.optional)
        }
        MemberExpression::ComputedMemberExpression(m) => {
            (&m.object, Key::Computed(&m.expression), m.optional)
        }
        MemberExpression::PrivateFieldExpression(_) => return None,
    })
}

impl<'a> StaticValues<'a> {
    #[must_use]
    pub fn new(semantic: &'a Semantic) -> Self {
        Self {
            semantic,
            variables: RefCell::new(FxHashMap::default()),
        }
    }

    /// The value of `e`, if it is known.
    #[must_use]
    pub fn value(&self, e: &'a Expression<'a>) -> Option<Value> {
        self.evaluate(e, &mut Vec::new()).map(|e| e.value)
    }

    /// The value of `e` converted to a string, if it is known (`getStringIfConstant`). A
    /// regular expression literal gives its source text.
    #[must_use]
    pub fn string(&self, e: &'a Expression<'a>) -> Option<String> {
        if let Expression::RegExpLiteral(regex) = e {
            return Some(
                regex
                    .span
                    .source_text(self.semantic.tree().source_text())
                    .to_owned(),
            );
        }
        to_string(&self.value(e)?)
    }

    fn evaluate(&self, e: &'a Expression<'a>, visiting: &mut Vec<SymbolId>) -> Option<Evaluated> {
        match e {
            Expression::NumericLiteral(n) => plain(Value::Number(n.value)),
            Expression::StringLiteral(s) => plain(Value::String(s.value.as_str()?.to_owned())),
            Expression::BooleanLiteral(b) => plain(Value::Boolean(b.value)),
            Expression::NullLiteral(_) => plain(Value::Null),
            Expression::TemplateLiteral(t) => self.template(t, visiting),
            Expression::Identifier(identifier) => {
                let reference = self
                    .semantic
                    .scoping()
                    .get_reference(identifier.reference_id());
                match reference.symbol_id() {
                    Some(symbol) => self.variable_value(symbol, visiting),
                    None => plain(global(identifier.name.as_str())?),
                }
            }
            Expression::ArrayExpression(array) => {
                let elements = array.elements.iter().map(|element| match element {
                    ArrayExpressionElement::Elision(_) => Element::Hole,
                    ArrayExpressionElement::SpreadElement(s) => Element::Spread(&s.argument),
                    element => Element::Value(element.to_expression()),
                });
                plain(Value::Array(self.elements(elements, visiting)?))
            }
            Expression::ObjectExpression(object) => self.object(&object.properties, visiting),
            Expression::UnaryExpression(u) => {
                if u.operator == UnaryOperator::Void {
                    return plain(Value::Undefined);
                }
                let value = self.evaluate(&u.argument, visiting)?.value;
                plain(unary(u.operator, &value)?)
            }
            Expression::BinaryExpression(b) => {
                let left = self.evaluate(&b.left, visiting)?.value;
                let right = self.evaluate(&b.right, visiting)?.value;
                plain(binary(b.operator, &left, &right)?)
            }
            Expression::LogicalExpression(l) => {
                let left = self.evaluate(&l.left, visiting)?;
                let settled = match l.operator {
                    LogicalOperator::Or => truthy(&left.value),
                    LogicalOperator::And => !truthy(&left.value),
                    LogicalOperator::Coalesce => {
                        !matches!(left.value, Value::Null | Value::Undefined)
                    }
                };
                if settled {
                    Some(left)
                } else {
                    self.evaluate(&l.right, visiting)
                }
            }
            Expression::ConditionalExpression(c) => {
                let test = self.evaluate(&c.test, visiting)?.value;
                let branch = if truthy(&test) {
                    &c.consequent
                } else {
                    &c.alternate
                };
                self.evaluate(branch, visiting)
            }
            Expression::SequenceExpression(s) => self.evaluate(s.expressions.last()?, visiting),
            Expression::AssignmentExpression(a)
                if a.operator == oxc_ast::ast::AssignmentOperator::Assign =>
            {
                self.evaluate(&a.right, visiting)
            }
            // The chain ends here, so what follows a short circuit is evaluated again.
            Expression::ChainExpression(chain) => {
                let inner = match &chain.expression {
                    ChainElement::CallExpression(call) => self.call(call, visiting),
                    ChainElement::TSNonNullExpression(t) => self.evaluate(&t.expression, visiting),
                    element => self.member(element.as_member_expression()?, visiting),
                };
                inner.map(|e| Evaluated {
                    optional: false,
                    ..e
                })
            }
            Expression::StaticMemberExpression(_) | Expression::ComputedMemberExpression(_) => {
                self.member(e.as_member_expression()?, visiting)
            }
            Expression::CallExpression(call) => self.call(call, visiting),
            Expression::TSAsExpression(t) => self.evaluate(&t.expression, visiting),
            Expression::TSSatisfiesExpression(t) => self.evaluate(&t.expression, visiting),
            Expression::TSNonNullExpression(t) => self.evaluate(&t.expression, visiting),
            Expression::TSTypeAssertion(t) => self.evaluate(&t.expression, visiting),
            Expression::ParenthesizedExpression(p) => self.evaluate(&p.expression, visiting),
            _ => None,
        }
    }

    fn template(
        &self,
        t: &'a TemplateLiteral<'a>,
        visiting: &mut Vec<SymbolId>,
    ) -> Option<Evaluated> {
        let mut out = String::new();
        for (index, quasi) in t.quasis.iter().enumerate() {
            out.push_str(quasi.value.cooked.as_ref()?.as_str()?);
            if let Some(expression) = t.expressions.get(index) {
                out.push_str(&to_string(&self.evaluate(expression, visiting)?.value)?);
            }
        }
        plain(Value::String(out))
    }

    fn elements(
        &self,
        elements: impl ExactSizeIterator<Item = Element<'a>>,
        visiting: &mut Vec<SymbolId>,
    ) -> Option<Vec<Value>> {
        let mut out = Vec::with_capacity(elements.len());
        for element in elements {
            match element {
                Element::Hole => out.push(Value::Undefined),
                Element::Spread(argument) => match self.evaluate(argument, visiting)?.value {
                    Value::Array(items) => out.extend(items),
                    Value::String(s) => out.extend(s.chars().map(|c| Value::String(c.into()))),
                    _ => return None,
                },
                Element::Value(e) => out.push(self.evaluate(e, visiting)?.value),
            }
        }
        Some(out)
    }

    fn object(
        &self,
        properties: &'a [ObjectPropertyKind<'a>],
        visiting: &mut Vec<SymbolId>,
    ) -> Option<Evaluated> {
        let mut out = Entries::default();
        for property in properties {
            match property {
                ObjectPropertyKind::ObjectProperty(p) => {
                    if p.method || p.kind != PropertyKind::Init {
                        return None;
                    }
                    let name = self.property_key(&p.key, p.computed, visiting)?;
                    // A literal `__proto__: x` sets the prototype instead of a property.
                    if name == "__proto__" && !p.computed && !p.shorthand {
                        return None;
                    }
                    let value = self.evaluate(&p.value, visiting)?.value;
                    out.set(name, value);
                }
                ObjectPropertyKind::SpreadProperty(s) => {
                    match self.evaluate(&s.argument, visiting)?.value {
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
                    }
                }
            }
        }
        plain(Value::Object(out.entries))
    }

    fn key(&self, key: Key<'a>, visiting: &mut Vec<SymbolId>) -> Option<String> {
        match key {
            Key::Name(name) => Some(name.to_owned()),
            Key::Computed(e) => to_string(&self.evaluate(e, visiting)?.value),
        }
    }

    fn property_key(
        &self,
        key: &'a PropertyKey<'a>,
        computed: bool,
        visiting: &mut Vec<SymbolId>,
    ) -> Option<String> {
        match key {
            PropertyKey::StaticIdentifier(id) if !computed => Some(id.name.as_str().to_owned()),
            PropertyKey::PrivateIdentifier(_) => None,
            PropertyKey::StringLiteral(s) if !computed => Some(s.value.as_str()?.to_owned()),
            PropertyKey::NumericLiteral(n) if !computed => Some(number(n.value)),
            key => to_string(&self.evaluate(key.as_expression()?, visiting)?.value),
        }
    }

    /// The value a constant variable holds: its initializer's, while nothing changes it.
    fn variable_value(&self, symbol: SymbolId, visiting: &mut Vec<SymbolId>) -> Option<Evaluated> {
        let semantic = self.semantic;
        if visiting.contains(&symbol) || !self.variable(symbol).constant {
            return None;
        }
        let scoping = semantic.scoping();
        let AstKind::VariableDeclarator(declarator) =
            semantic.nodes().kind(scoping.symbol_declaration(symbol))
        else {
            return None;
        };
        // A destructured name does not hold the initializer.
        let BindingPattern::BindingIdentifier(id) = &declarator.id else {
            return None;
        };
        if id.symbol_id.get() != Some(symbol) {
            return None;
        }
        let initializer = declarator.init.as_ref()?;
        visiting.push(symbol);
        let value = self.evaluate(initializer, visiting);
        visiting.pop();
        let value = value?.value;
        if matches!(value, Value::Array(_) | Value::Object(_)) && self.is_mutated(symbol) {
            return None;
        }
        plain(value)
    }

    fn variable(&self, symbol: SymbolId) -> Variable {
        *self
            .variables
            .borrow_mut()
            .entry(symbol)
            .or_insert_with(|| Variable {
                constant: considered_const(self.semantic, symbol),
                mutated: None,
            })
    }

    fn is_mutated(&self, symbol: SymbolId) -> bool {
        if let Some(mutated) = self.variable(symbol).mutated {
            return mutated;
        }
        let mutated = self.find_mutation(symbol);
        if let Some(variable) = self.variables.borrow_mut().get_mut(&symbol) {
            variable.mutated = Some(mutated);
        }
        mutated
    }

    /// Whether code changes what `symbol`'s object holds: an assignment or update through a
    /// member, or a call of an array method that changes the array.
    fn find_mutation(&self, symbol: SymbolId) -> bool {
        let nodes = self.semantic.nodes();
        self.semantic
            .scoping()
            .get_resolved_references(symbol)
            .any(|reference| {
                let mut node = reference.node_id();
                let mut through_member = false;
                loop {
                    let parent: NodeId = nodes.parent_id(node);
                    let span = nodes.kind(node).span();
                    match nodes.kind(parent) {
                        AstKind::StaticMemberExpression(m) if m.object.span() == span => {}
                        AstKind::ComputedMemberExpression(m) if m.object.span() == span => {}
                        AstKind::CallExpression(c) if through_member && c.callee.span() == span => {
                            let name = member_parts(&c.callee)
                                .and_then(|(_, key, _)| self.key(key, &mut Vec::new()));
                            return name
                                .is_some_and(|name| MUTATING_METHODS.contains(&name.as_str()));
                        }
                        // A member written: assigned, updated or a destructuring target.
                        AstKind::AssignmentExpression(a) => {
                            return through_member && a.left.span() == span;
                        }
                        AstKind::UpdateExpression(_)
                        | AstKind::ArrayAssignmentTarget(_)
                        | AstKind::AssignmentTargetRest(_)
                        | AstKind::AssignmentTargetPropertyProperty(_) => return through_member,
                        AstKind::AssignmentTargetWithDefault(d) => {
                            return through_member && d.binding.span() == span;
                        }
                        AstKind::ForInStatement(f) => {
                            return through_member && f.left.span() == span;
                        }
                        AstKind::ForOfStatement(f) => {
                            return through_member && f.left.span() == span;
                        }
                        _ => return false,
                    }
                    through_member = true;
                    node = parent;
                }
            })
    }

    fn member(
        &self,
        m: &'a MemberExpression<'a>,
        visiting: &mut Vec<SymbolId>,
    ) -> Option<Evaluated> {
        let (object, key, optional) = member_expression_parts(m)?;
        let object = self.evaluate(object, visiting)?;
        if is_nullish(&object.value) && (object.optional || optional) {
            return Some(short_circuit());
        }
        let key = self.key(key, visiting)?;
        plain(member(&object.value, &key)?)
    }

    fn call(
        &self,
        call: &'a CallExpression<'a>,
        visiting: &mut Vec<SymbolId>,
    ) -> Option<Evaluated> {
        let arguments = call.arguments.iter().map(|argument| match argument {
            Argument::SpreadElement(s) => Element::Spread(&s.argument),
            argument => Element::Value(argument.to_expression()),
        });
        let arguments = &self.elements(arguments, visiting)?;
        let (callee, optional) = (&call.callee, call.optional);
        if let Some((object, key, member_optional)) = member_parts(callee) {
            let receiver = self.evaluate(object, visiting)?;
            if is_nullish(&receiver.value) && (receiver.optional || member_optional || optional) {
                return Some(short_circuit());
            }
            let name = self.key(key, visiting)?;
            return plain(method(&receiver.value, &name, arguments)?);
        }
        let callee = self.evaluate(callee, visiting)?;
        if is_nullish(&callee.value) && (callee.optional || optional) {
            return Some(short_circuit());
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

/// `undefined` for a short-circuited optional chain, which skips the rest of the chain.
const fn short_circuit() -> Evaluated {
    Evaluated {
        value: Value::Undefined,
        optional: true,
    }
}

/// A `const`, or a `let` or `var` written only by its initializer (`canBeConsideredConst`). A
/// name a type shares is declared first by the type, so it has no initializer to read.
fn considered_const(semantic: &Semantic, symbol: SymbolId) -> bool {
    let scoping = semantic.scoping();
    let flags = scoping.symbol_flags(symbol);
    if flags.contains(SymbolFlags::ConstVariable) {
        return true;
    }
    flags.intersects(SymbolFlags::BlockScopedVariable | SymbolFlags::FunctionScopedVariable)
        && scoping.symbol_redeclarations(symbol).is_empty()
        && !scoping
            .get_resolved_references(symbol)
            .any(oxc_semantic::Reference::is_write)
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

#[cfg(test)]
mod tests;
