use rsvelte_typescript::operators::{BinaryOperator, LogicalOperator, UnaryOperator};
use rsvelte_typescript::{Kind, NodeIdentifier};

use super::globals::global_constant;
use super::operators::{binary, unary};
use super::{Evaluator, Tree, Value, Values, add, bigint};

impl<'a> Evaluator<'a> {
    pub(super) fn eval_into(&mut self, tree: Tree<'a>, e: NodeIdentifier, values: &mut Values) {
        let syntax_tree = self.syntax_tree(tree);
        match syntax_tree.kind(e) {
            Kind::String => add(
                values,
                Value::String(syntax_tree.str_value(e, self.source_text).to_owned()),
            ),
            Kind::Number(n) => add(values, Value::Number(n)),
            Kind::BigInt => {
                let [lo, hi] = syntax_tree.raw_data(e);
                let raw =
                    rsvelte_kernel::source::positions::Span::new(lo, hi).text(self.source_text);
                add(values, bigint::literal(raw));
            }
            Kind::Boolean(b) => add(values, Value::Boolean(b)),
            Kind::Null => add(values, Value::Null),
            Kind::Identifier(_) => self.identifier(tree, e, values),
            Kind::Binary(op, l, r) => self.binary_expression(tree, op, l, r, values),
            Kind::Conditional {
                test,
                consequent,
                alternate,
            } => {
                let test_value = self.evaluate_inner(tree, test);
                if test_value.is_known() {
                    let branch = if test_value.value().truthy() {
                        consequent
                    } else {
                        alternate
                    };
                    self.eval_into(tree, branch, values);
                } else {
                    self.eval_into(tree, consequent, values);
                    self.eval_into(tree, alternate, values);
                }
            }
            Kind::Logical(op, l, r) => self.logical_expression(tree, op, l, r, values),
            Kind::Unary(op, arg) => self.unary_expression(tree, op, arg, values),
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
                    let ev = self.evaluate_inner(tree, x);
                    if ev.is_known() {
                        result.push_str(&ev.value().to_javascript_string());
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
            Kind::Member { .. } => match self.global_keypath(tree, e).and_then(global_constant) {
                Some(v) => add(values, Value::Number(v)),
                None => add(values, Value::Unknown),
            },
            Kind::Arrow { .. } | Kind::Function { .. } => add(values, Value::AnyFunction),
            _ => add(values, Value::Unknown),
        }
    }

    fn binary_expression(
        &mut self,
        tree: Tree<'a>,
        op: BinaryOperator,
        l: NodeIdentifier,
        r: NodeIdentifier,
        values: &mut Values,
    ) {
        use BinaryOperator::{
            Add, BitAnd, BitOr, BitXor, Div, Eq, Exp, Gt, GtEq, In, InstanceOf, Lt, LtEq, Mul,
            NotEq, Remainder, Shl, Shr, StrictEq, StrictNotEq, Sub, UShr,
        };
        let left = self.evaluate_inner(tree, l);
        let right = self.evaluate_inner(tree, r);
        if left.is_known() && right.is_known() {
            match binary(op, left.value(), right.value()) {
                Some(v) => add(values, v),
                None => add(values, Value::Unknown),
            }
            return;
        }
        match op {
            NotEq | StrictNotEq | Lt | LtEq | Gt | GtEq | Eq | StrictEq | In | InstanceOf => {
                add(values, Value::Boolean(true));
                add(values, Value::Boolean(false));
            }
            Remainder | BitAnd | Mul | Exp | Sub | Div | Shl | Shr | UShr | BitXor | BitOr => {
                add(values, Value::AnyNumber);
            }
            Add => {
                if left.is_string() || right.is_string() {
                    add(values, Value::AnyString);
                } else if left.is_number() && right.is_number() {
                    add(values, Value::AnyNumber);
                } else {
                    add(values, Value::AnyString);
                    add(values, Value::AnyNumber);
                }
            }
        }
    }

    fn logical_expression(
        &mut self,
        tree: Tree<'a>,
        op: LogicalOperator,
        l: NodeIdentifier,
        r: NodeIdentifier,
        values: &mut Values,
    ) {
        let left = self.evaluate_inner(tree, l);
        if left.is_known() {
            let short = match op {
                LogicalOperator::And => !left.value().truthy(),
                LogicalOperator::Or => left.value().truthy(),
                LogicalOperator::Nullish => !matches!(left.value(), Value::Null | Value::Undefined),
            };
            if short {
                add(values, left.into_value());
                return;
            }
        } else {
            for value in left.into_values() {
                add(values, value);
            }
        }
        self.eval_into(tree, r, values);
    }

    fn unary_expression(
        &mut self,
        tree: Tree<'a>,
        op: UnaryOperator,
        arg: NodeIdentifier,
        values: &mut Values,
    ) {
        let a = self.evaluate_inner(tree, arg);
        if a.is_known() {
            add(values, unary(op, a.value()));
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
}
