//! Possible runtime values used by lowering and emission.

mod bigint;
mod bindings;
mod expressions;
mod globals;
mod membership;
mod operators;
mod template;
mod value;
mod values;

use rsvelte_typescript::scope::ScopeIdentifier;
use rsvelte_typescript::{NodeIdentifier, SyntaxTree};
pub use value::Value;
use values::Values;

use crate::semantic::resolve::Resolution;
use crate::semantic::visited::Visited;

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
    fn from_values(values: Values) -> Self {
        let value = values.value().clone();
        let facts = ValueFacts::of(&values);
        Self {
            values: values.into_vec(),
            value,
            is_known: facts.is_known,
            has_unknown: facts.has_unknown,
            is_defined: facts.is_defined,
            is_string: facts.is_string,
            is_number: facts.is_number,
            is_function: facts.is_function,
        }
    }
}

#[derive(Clone, Copy)]
#[expect(
    clippy::struct_excessive_bools,
    reason = "independent evaluation facts"
)]
struct ValueFacts {
    is_known: bool,
    has_unknown: bool,
    is_defined: bool,
    is_string: bool,
    is_number: bool,
    is_function: bool,
}

impl ValueFacts {
    fn of(values: &Values) -> Self {
        let mut facts = Self {
            is_known: values.is_known(),
            has_unknown: false,
            is_defined: true,
            is_string: true,
            is_number: true,
            is_function: true,
        };
        for value in values.as_slice() {
            facts.is_string &= value.is_string();
            facts.is_number &= value.is_number();
            facts.is_function &= matches!(value, Value::AnyFunction);
            facts.is_defined &= !matches!(value, Value::Null | Value::Undefined | Value::Unknown);
            facts.has_unknown |= matches!(value, Value::Unknown);
        }
        facts
    }
}

fn add(values: &mut Values, value: Value) {
    values.add(value);
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
    in_progress: Visited,
}

impl<'a> Evaluator<'a> {
    #[must_use]
    pub const fn new(source: &'a SyntaxTree, source_text: &'a str, res: &'a Resolution) -> Self {
        Evaluator {
            source,
            source_text,
            res,
            in_progress: Visited::new(),
        }
    }

    pub fn evaluate(&mut self, tree: Tree<'a>, e: NodeIdentifier) -> Evaluation {
        Evaluation::from_values(self.evaluate_inner(tree, e))
    }

    pub(crate) fn is_known(&mut self, tree: Tree<'a>, expression: NodeIdentifier) -> bool {
        self.evaluate_inner(tree, expression).is_known()
    }

    fn evaluate_inner(&mut self, tree: Tree<'a>, expression: NodeIdentifier) -> Values {
        let mut values = Values::Empty;
        self.eval_into(tree, expression, &mut values);
        values
    }

    const fn syntax_tree(&self, tree: Tree<'a>) -> &'a SyntaxTree {
        match tree {
            Tree::Source => self.source,
            Tree::Output(a, _) => a,
        }
    }
}
