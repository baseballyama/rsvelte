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

use oxc_ast::ast::{Expression, IdentifierReference};
use oxc_semantic::ScopeId;
pub use value::Value;
use values::Values;

use crate::resolve::Resolution;
use crate::visited::Visited;

const fn to_int32(n: f64) -> i32 {
    if !n.is_finite() {
        return 0;
    }
    (((n.trunc() as i64).cast_unsigned() & 0xFFFF_FFFF) as u32).cast_signed()
}

/// `Number::exponentiate`: unlike `powf`, a NaN exponent and `±1 ** ±Infinity` are NaN.
#[expect(
    clippy::float_cmp,
    reason = "only exactly one is the case JavaScript differs on"
)]
fn pow(base: f64, exponent: f64) -> f64 {
    if exponent.is_nan() || (exponent.is_infinite() && base.abs() == 1.0) {
        return f64::NAN;
    }
    base.powf(exponent)
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

#[derive(Debug)]
pub struct Evaluator<'r> {
    res: &'r Resolution,
    /// The scope that resolves an identifier without a reference, such as one of a tree a task
    /// built: upstream's `state.scope.evaluate(value)` on the transformed expression.
    scope: Option<ScopeId>,
    in_progress: Visited,
}

impl<'r> Evaluator<'r> {
    #[must_use]
    pub const fn new(res: &'r Resolution) -> Self {
        Evaluator {
            res,
            scope: None,
            in_progress: Visited::new(),
        }
    }

    /// An evaluator of a tree a task built, whose identifiers resolve by name in `scope`.
    #[must_use]
    pub const fn in_scope(res: &'r Resolution, scope: ScopeId) -> Self {
        Evaluator {
            res,
            scope: Some(scope),
            in_progress: Visited::new(),
        }
    }

    pub fn evaluate(&mut self, e: &Expression<'_>) -> Evaluation {
        Evaluation::from_values(self.evaluate_inner(e))
    }

    /// Whether the value of the identifier `identifier` is known.
    pub(crate) fn is_known_identifier(&mut self, identifier: &IdentifierReference<'_>) -> bool {
        let mut values = Values::Empty;
        self.identifier(identifier, &mut values);
        values.is_known()
    }

    fn evaluate_inner(&mut self, e: &Expression<'_>) -> Values {
        let mut values = Values::Empty;
        self.eval_into(e, &mut values);
        values
    }
}
