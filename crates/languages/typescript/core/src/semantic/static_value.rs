//! The value an expression has whenever it runs, when that follows from the code alone
//! (`getStaticValue` in `@eslint-community/eslint-utils`).
//!
//! An answer is either the value or `None` ("not known"), never a guess: an operation this module
//! does not model gives `None`, so a caller can treat `Some` as proof. Type syntax is erased in the
//! tree, so `e as T`, `e satisfies T`, `e!` and `<T>e` are `e`.

use std::cell::{OnceCell, RefCell};

use rustc_hash::FxHashMap;

use crate::operators::{LogicalOperator, UnaryOperator};
use crate::scope::{BindingIdentifier, DeclarationKind, Semantic};
use crate::semantic::number::number;
use crate::syntax_tree::{Kind, NodeIdentifier, SyntaxTree, flag};

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

/// Evaluates expressions of one tree. `semantic` resolves identifiers; without it, only
/// expressions that name no variable have a value.
#[derive(Debug)]
pub struct StaticValues<'a> {
    syntax_tree: &'a SyntaxTree,
    source_text: &'a str,
    semantic: Option<&'a Semantic>,
    /// Built on the first object-valued variable, to find its mutating method calls.
    parents: OnceCell<Vec<NodeIdentifier>>,
    /// What the references of each variable met so far say, so that a variable named many times
    /// has its references read once.
    variables: RefCell<FxHashMap<BindingIdentifier, Variable>>,
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

impl<'a> StaticValues<'a> {
    #[must_use]
    pub fn new(
        syntax_tree: &'a SyntaxTree,
        source_text: &'a str,
        semantic: Option<&'a Semantic>,
    ) -> Self {
        Self {
            syntax_tree,
            source_text,
            semantic,
            parents: OnceCell::new(),
            variables: RefCell::new(FxHashMap::default()),
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
        if visiting.contains(&binding) || !self.variable(semantic, binding).constant {
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

    fn variable(&self, semantic: &Semantic, binding: BindingIdentifier) -> Variable {
        *self
            .variables
            .borrow_mut()
            .entry(binding)
            .or_insert_with(|| Variable {
                constant: considered_const(semantic, binding),
                mutated: None,
            })
    }

    fn is_mutated(&self, semantic: &Semantic, binding: BindingIdentifier) -> bool {
        if let Some(mutated) = self.variable(semantic, binding).mutated {
            return mutated;
        }
        let mutated = self.find_mutation(semantic, binding);
        if let Some(variable) = self.variables.borrow_mut().get_mut(&binding) {
            variable.mutated = Some(mutated);
        }
        mutated
    }

    /// Whether code changes what `binding`'s object holds: an assignment or update through a
    /// member, or a call of an array method that changes the array.
    fn find_mutation(&self, semantic: &Semantic, binding: BindingIdentifier) -> bool {
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

/// A `const`, or a `let` or `var` written only by its initializer (`canBeConsideredConst`), that
/// no type shares a name with.
fn considered_const(semantic: &Semantic, binding: BindingIdentifier) -> bool {
    if semantic.shares_name_with_type(binding) {
        return false;
    }
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

#[cfg(test)]
mod tests;
