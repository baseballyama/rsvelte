use oxc_ast::ast::{Expression, LogicalExpression, UnaryExpression};
use oxc_syntax::operator::{BinaryOperator, LogicalOperator, UnaryOperator};

use super::globals::global_constant;
use super::operators::{binary, unary};
use super::template::cooked;
use super::{Evaluator, Value, Values, add, bigint};

impl Evaluator<'_> {
    pub(super) fn eval_into(&mut self, e: &Expression<'_>, values: &mut Values) {
        // Upstream evaluates after erasing types.
        let e = crate::typescript::without_typescript(e);
        match e {
            // A value with a lone surrogate is no Rust string.
            Expression::StringLiteral(s) => match s.value.as_str() {
                Some(value) => add(values, Value::String(value.to_owned())),
                None => add(values, Value::Unknown),
            },
            Expression::NumericLiteral(n) => add(values, Value::Number(n.value)),
            Expression::BigIntLiteral(b) => {
                add(values, bigint::literal(&format!("{}n", b.value)));
            }
            Expression::BooleanLiteral(b) => add(values, Value::Boolean(b.value)),
            Expression::NullLiteral(_) => add(values, Value::Null),
            Expression::RegExpLiteral(r) => add(
                values,
                Value::RegExp {
                    literal: r.span,
                    text: format!("/{}/{}", r.regex.pattern.text, r.regex.flags).into(),
                },
            ),
            Expression::Identifier(identifier) => self.identifier(identifier, values),
            Expression::BinaryExpression(b) => {
                self.binary_expression(b.operator, &b.left, &b.right, values);
            }
            Expression::ConditionalExpression(c) => {
                let test_value = self.evaluate_inner(&c.test);
                if test_value.is_known() {
                    let branch = if test_value.value().truthy() {
                        &c.consequent
                    } else {
                        &c.alternate
                    };
                    self.eval_into(branch, values);
                } else {
                    self.eval_into(&c.consequent, values);
                    self.eval_into(&c.alternate, values);
                }
            }
            Expression::LogicalExpression(l) => self.logical_expression(l, values),
            Expression::UnaryExpression(u) => self.unary_expression(u, values),
            Expression::CallExpression(call) => self.call(e, call, values),
            Expression::TemplateLiteral(t) => {
                let Some(mut result) = cooked(&t.quasis[0]) else {
                    return add(values, Value::Unknown);
                };
                for (i, x) in t.expressions.iter().enumerate() {
                    let ev = self.evaluate_inner(x);
                    let next = cooked(&t.quasis[i + 1]);
                    if ev.is_known()
                        && let Some(next) = next
                    {
                        result.push_str(&ev.value().to_javascript_string());
                        result.push_str(&next);
                    } else {
                        // Upstream adds the partial string as well after giving up, and so do we.
                        add(values, Value::AnyString);
                        break;
                    }
                }
                add(values, Value::String(result));
            }
            Expression::StaticMemberExpression(_) => {
                match self.global_keypath(e).and_then(global_constant) {
                    Some(v) => add(values, Value::Number(v)),
                    None => add(values, Value::Unknown),
                }
            }
            Expression::ArrowFunctionExpression(_) | Expression::FunctionExpression(_) => {
                add(values, Value::AnyFunction);
            }
            Expression::ParenthesizedExpression(p) => self.eval_into(&p.expression, values),
            _ => add(values, Value::Unknown),
        }
    }

    fn binary_expression(
        &mut self,
        op: BinaryOperator,
        l: &Expression<'_>,
        r: &Expression<'_>,
        values: &mut Values,
    ) {
        use BinaryOperator::{
            Addition, BitwiseAnd, BitwiseOR, BitwiseXOR, Division, Equality, Exponential,
            GreaterEqualThan, GreaterThan, In, Inequality, Instanceof, LessEqualThan, LessThan,
            Multiplication, Remainder, ShiftLeft, ShiftRight, ShiftRightZeroFill, StrictEquality,
            StrictInequality, Subtraction,
        };
        let left = self.evaluate_inner(l);
        let right = self.evaluate_inner(r);
        if left.is_known() && right.is_known() {
            match binary(op, left.value(), right.value()) {
                Some(v) => add(values, v),
                None => add(values, Value::Unknown),
            }
            return;
        }
        match op {
            Inequality | StrictInequality | LessThan | LessEqualThan | GreaterThan
            | GreaterEqualThan | Equality | StrictEquality | In | Instanceof => {
                add(values, Value::Boolean(true));
                add(values, Value::Boolean(false));
            }
            Remainder | BitwiseAnd | Multiplication | Exponential | Subtraction | Division
            | ShiftLeft | ShiftRight | ShiftRightZeroFill | BitwiseXOR | BitwiseOR => {
                add(values, Value::AnyNumber);
            }
            Addition => {
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

    fn logical_expression(&mut self, l: &LogicalExpression<'_>, values: &mut Values) {
        let left = self.evaluate_inner(&l.left);
        if left.is_known() {
            let short = match l.operator {
                LogicalOperator::And => !left.value().truthy(),
                LogicalOperator::Or => left.value().truthy(),
                LogicalOperator::Coalesce => {
                    !matches!(left.value(), Value::Null | Value::Undefined)
                }
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
        self.eval_into(&l.right, values);
    }

    fn unary_expression(&mut self, u: &UnaryExpression<'_>, values: &mut Values) {
        let a = self.evaluate_inner(&u.argument);
        if a.is_known() {
            add(values, unary(u.operator, a.value()));
            return;
        }
        match u.operator {
            UnaryOperator::LogicalNot | UnaryOperator::Delete => {
                add(values, Value::Boolean(false));
                add(values, Value::Boolean(true));
            }
            UnaryOperator::UnaryPlus | UnaryOperator::UnaryNegation | UnaryOperator::BitwiseNot => {
                add(values, Value::AnyNumber);
            }
            UnaryOperator::Typeof => add(values, Value::AnyString),
            UnaryOperator::Void => add(values, Value::Undefined),
        }
    }
}
